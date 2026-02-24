/**
 * Task Service
 * Business logic layer for task operations
 */

import { PrismaClient, Task, TaskPriority, TaskStatus } from '@prisma/client';
import { TaskRepository, TaskFilter, PaginatedResult } from '../repositories/task.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { GamificationRepository } from '../repositories/gamification.repository';
import {
  createTaskSchema,
  updateTaskSchema,
  BulkUpdateTasksInput,
} from '../validators/task.validator';
import { UserInputError } from '../utils/errors';
import { createLogger } from '../utils/logger';

const logger = createLogger('TaskService');

// XP rewards by priority
const XP_REWARDS: Record<TaskPriority, number> = {
  high: 50,
  medium: 25,
  low: 10,
};

export class TaskService {
  private taskRepo: TaskRepository;
  private projectRepo: ProjectRepository;
  private gameRepo: GamificationRepository;

  constructor(prisma: PrismaClient) {
    this.taskRepo = new TaskRepository(prisma);
    this.projectRepo = new ProjectRepository(prisma);
    this.gameRepo = new GamificationRepository(prisma);
  }

  /**
   * Get all tasks for a user
   */
  async getTasks(
    userId: string,
    filter?: TaskFilter
  ): Promise<
    PaginatedResult<Task & { project: { id: string; name: string; color: string } | null }>
  > {
    logger.debug('Getting tasks', { userId, filter });
    return this.taskRepo.findByUser(userId, filter);
  }

  /**
   * Get tasks for a specific project
   */
  async getTasksByProject(
    userId: string,
    projectId: string
  ): Promise<
    PaginatedResult<Task & { project: { id: string; name: string; color: string } | null }>
  > {
    logger.debug('Getting tasks by project', { userId, projectId });

    const projectExists = await this.projectRepo.exists(projectId, userId);
    if (!projectExists) {
      throw new UserInputError('Project not found');
    }

    return this.taskRepo.findByProject(projectId, userId);
  }

  /**
   * Get a single task by ID
   */
  async getTask(userId: string, taskId: string): Promise<Task | null> {
    logger.debug('Getting task', { userId, taskId });
    return this.taskRepo.findById(taskId, userId);
  }

  /**
   * Create a new task
   */
  async createTask(userId: string, input: unknown): Promise<Task> {
    const validated = createTaskSchema.parse(input);
    logger.info('Creating task', { userId, projectId: validated.projectId });

    const project = await this.projectRepo.findById(validated.projectId, userId);
    if (!project) {
      throw new UserInputError('Project not found');
    }

    const task = await this.taskRepo.create({
      text: validated.text,
      description: validated.description,
      priority: validated.priority as TaskPriority,
      status: validated.status as TaskStatus,
      category: validated.category,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      projectId: validated.projectId,
      userId,
      subtasks: validated.subtasks,
      isRecurring: validated.isRecurring,
      recurrencePattern: validated.recurrencePattern,
    });

    logger.info('Task created', { taskId: task.id, userId });
    return task;
  }

  /**
   * Update a task
   */
  async updateTask(userId: string, input: unknown): Promise<Task> {
    const validated = updateTaskSchema.parse(input);
    const { id, ...updates } = validated;

    logger.info('Updating task', { userId, taskId: id });

    const existingTask = await this.taskRepo.findById(id, userId);
    if (!existingTask) {
      throw new UserInputError('Task not found');
    }

    const updateData: {
      text?: string;
      description?: string;
      priority?: TaskPriority;
      status?: TaskStatus;
      category?: string;
      dueDate?: Date | null;
      completed?: boolean;
    } = {};
    if (updates.text !== undefined) updateData.text = updates.text;
    if (updates.description !== undefined)
      updateData.description = updates.description ?? undefined;
    if (updates.priority !== undefined) updateData.priority = updates.priority as TaskPriority;
    if (updates.status !== undefined) updateData.status = updates.status as TaskStatus;
    if (updates.category !== undefined) updateData.category = updates.category ?? undefined;
    if (updates.dueDate !== undefined)
      updateData.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
    if (updates.completed !== undefined) updateData.completed = updates.completed;

    const task = await this.taskRepo.update(id, updateData);
    logger.info('Task updated', { taskId: id, userId });

    return task;
  }

  /**
   * Delete a task
   */
  async deleteTask(userId: string, taskId: string): Promise<Task> {
    logger.info('Deleting task', { userId, taskId });

    const task = await this.taskRepo.findById(taskId, userId);
    if (!task) {
      throw new UserInputError('Task not found');
    }

    const deletedTask = await this.taskRepo.delete(taskId);
    logger.info('Task deleted', { taskId, userId });

    return deletedTask;
  }

  /**
   * Complete a task with gamification rewards
   */
  async completeTask(userId: string, taskId: string): Promise<Task> {
    logger.info('Completing task', { userId, taskId });

    const task = await this.taskRepo.findById(taskId, userId);
    if (!task) {
      throw new UserInputError('Task not found');
    }

    if (task.completed) {
      throw new UserInputError('Task is already completed');
    }

    const completedTask = await this.taskRepo.complete(taskId);

    const xpReward = XP_REWARDS[task.priority];

    // Use Promise.allSettled to handle partial failures
    // If gamification operations fail, we:
    // 1) Log the error
    // 2) Don't fail the overall operation
    const gamificationResults = await Promise.allSettled([
      this.gameRepo.addXp(userId, xpReward),
      this.gameRepo.incrementTasksCompleted(userId),
    ]);

    // Log any failures but continue with the operation
    gamificationResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        logger.error('Failed to update gamification for completed task', {
          userId,
          taskId,
          operation: index === 0 ? 'addXp' : 'incrementTasksCompleted',
          error: result.reason instanceof Error ? result.reason.message : String(result.reason),
        });
      }
    });

    logger.info('Task completed', { taskId, userId, xpEarned: xpReward });

    return completedTask;
  }

  /**
   * Uncomplete a task
   */
  async uncompleteTask(userId: string, taskId: string): Promise<Task> {
    logger.info('Uncompleting task', { userId, taskId });

    const task = await this.taskRepo.findById(taskId, userId);
    if (!task) {
      throw new UserInputError('Task not found');
    }

    if (!task.completed) {
      throw new UserInputError('Task is not completed');
    }

    const uncompletedTask = await this.taskRepo.uncomplete(taskId);
    logger.info('Task uncompleted', { taskId, userId });

    return uncompletedTask;
  }

  /**
   * Bulk update tasks
   */
  async bulkUpdateTasks(
    userId: string,
    taskIds: string[],
    updates: BulkUpdateTasksInput['updates']
  ): Promise<{ count: number }> {
    logger.info('Bulk updating tasks', { userId, count: taskIds.length });

    for (const taskId of taskIds) {
      const task = await this.taskRepo.findById(taskId, userId);
      if (!task) {
        throw new UserInputError(`Task ${taskId} not found`);
      }
    }

    const result = await this.taskRepo.bulkUpdate(taskIds, {
      ...updates,
      status: updates.status as TaskStatus | undefined,
      priority: updates.priority as TaskPriority | undefined,
    });
    logger.info('Bulk update complete', { count: result.count });

    return result;
  }

  /**
   * Bulk delete tasks
   */
  async bulkDeleteTasks(userId: string, taskIds: string[]): Promise<{ count: number }> {
    logger.info('Bulk deleting tasks', { userId, count: taskIds.length });

    for (const taskId of taskIds) {
      const task = await this.taskRepo.findById(taskId, userId);
      if (!task) {
        throw new UserInputError(`Task ${taskId} not found`);
      }
    }

    const result = await this.taskRepo.bulkDelete(taskIds);
    logger.info('Bulk delete complete', { count: result.count });

    return result;
  }

  /**
   * Get tasks due today
   */
  async getTasksDueToday(userId: string): Promise<Task[]> {
    return this.taskRepo.findDueToday(userId);
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(userId: string): Promise<Task[]> {
    return this.taskRepo.findOverdue(userId);
  }

  /**
   * Get task statistics
   */
  async getTaskStats(userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    dueToday: number;
  }> {
    const [total, completed, overdue, dueToday] = await Promise.all([
      this.taskRepo.countByUser(userId),
      this.taskRepo.countByUser(userId, { completed: true }),
      this.taskRepo.findOverdue(userId).then((t) => t.length),
      this.taskRepo.findDueToday(userId).then((t) => t.length),
    ]);

    return {
      total,
      completed,
      pending: total - completed,
      overdue,
      dueToday,
    };
  }
}
