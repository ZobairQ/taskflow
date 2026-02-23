/**
 * Task Repository
 * Data access layer for Task entities
 */

import { PrismaClient, Task, TaskStatus, TaskPriority } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface TaskFilter {
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  completed?: boolean;
  overdue?: boolean;
  dueBefore?: Date;
  dueAfter?: Date;
  search?: string;
}

export class TaskRepository extends BaseRepository<Task> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  protected get model() {
    return this.prisma.task;
  }

  /**
   * Find a task by ID for a specific user
   */
  async findById(id: string, userId: string): Promise<Task | null> {
    return this.prisma.task.findFirst({
      where: { id, userId },
    });
  }

  /**
   * Find all tasks for a project
   */
  async findByProject(projectId: string, userId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { projectId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find all tasks for a user with optional filtering
   */
  async findByUser(userId: string, filter?: TaskFilter): Promise<Task[]> {
    const where: any = { userId };

    if (filter?.projectId) where.projectId = filter.projectId;
    if (filter?.status) where.status = filter.status;
    if (filter?.priority) where.priority = filter.priority;
    if (filter?.category) where.category = filter.category;
    if (filter?.completed !== undefined) where.completed = filter.completed;
    if (filter?.dueBefore) where.dueDate = { ...where.dueDate, lt: filter.dueBefore };
    if (filter?.dueAfter) where.dueDate = { ...where.dueDate, gt: filter.dueAfter };
    if (filter?.overdue) {
      where.dueDate = { lt: new Date() };
      where.completed = false;
    }
    if (filter?.search) {
      where.OR = [
        { text: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.task.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Create a new task
   */
  async create(data: {
    text: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    category?: string;
    dueDate?: Date | null;
    projectId: string;
    userId: string;
    subtasks?: any;
    isRecurring?: boolean;
    recurrencePattern?: any;
  }): Promise<Task> {
    return this.prisma.task.create({
      data: {
        text: data.text,
        description: data.description || '',
        priority: data.priority || TaskPriority.medium,
        status: data.status || TaskStatus.pending,
        category: data.category || 'general',
        dueDate: data.dueDate,
        projectId: data.projectId,
        userId: data.userId,
        subtasks: data.subtasks,
        isRecurring: data.isRecurring || false,
        recurrencePattern: data.recurrencePattern,
      },
    });
  }

  /**
   * Update a task
   */
  async update(id: string, data: Partial<Task>): Promise<Task> {
    return this.prisma.task.update({
      where: { id },
      data: data as any,
    });
  }

  /**
   * Delete a task
   */
  async delete(id: string): Promise<Task> {
    return this.prisma.task.delete({
      where: { id },
    });
  }

  /**
   * Bulk update tasks
   */
  async bulkUpdate(ids: string[], data: Partial<Task>): Promise<{ count: number }> {
    return this.prisma.task.updateMany({
      where: { id: { in: ids } },
      data: data as any,
    });
  }

  /**
   * Bulk delete tasks
   */
  async bulkDelete(ids: string[]): Promise<{ count: number }> {
    return this.prisma.task.deleteMany({
      where: { id: { in: ids } },
    });
  }

  /**
   * Complete a task
   */
  async complete(id: string): Promise<Task> {
    return this.prisma.task.update({
      where: { id },
      data: {
        completed: true,
        status: TaskStatus.completed,
        completedAt: new Date(),
      },
    });
  }

  /**
   * Uncomplete a task
   */
  async uncomplete(id: string): Promise<Task> {
    return this.prisma.task.update({
      where: { id },
      data: {
        completed: false,
        status: TaskStatus.pending,
        completedAt: null,
      },
    });
  }

  /**
   * Count tasks for a user
   */
  async countByUser(userId: string, filter?: TaskFilter): Promise<number> {
    const where: any = { userId };
    if (filter?.projectId) where.projectId = filter.projectId;
    if (filter?.status) where.status = filter.status;
    if (filter?.completed !== undefined) where.completed = filter.completed;

    return this.prisma.task.count({ where });
  }

  /**
   * Get tasks due today
   */
  async findDueToday(userId: string): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.task.findMany({
      where: {
        userId,
        dueDate: { gte: today, lt: tomorrow },
        completed: false,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  /**
   * Get overdue tasks
   */
  async findOverdue(userId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: {
        userId,
        dueDate: { lt: new Date() },
        completed: false,
      },
      orderBy: { dueDate: 'asc' },
    });
  }
}
