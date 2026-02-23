/**
 * TaskService Unit Tests
 * Testing TaskService by mocking Prisma client
 */

import { TaskService } from '../../../services/task.service';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { createMockPrisma, createMockTask, createMockProject } from '../../utils/testUtils';
import { UserInputError } from '../../../utils/errors';

describe('TaskService', () => {
  let service: TaskService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    service = new TaskService(mockPrisma as any);
  });

  describe('getTasks', () => {
    it('should return tasks for a user', async () => {
      const userId = 'user-1';
      const mockTasks = [createMockTask({ userId })];

      mockPrisma.task.findMany.mockResolvedValue(mockTasks);

      const result = await service.getTasks(userId);

      expect(mockPrisma.task.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockTasks);
    });

    it('should apply filters when provided', async () => {
      const userId = 'user-1';
      const filter = { status: TaskStatus.pending };
      const mockTasks = [createMockTask({ userId, status: TaskStatus.pending })];

      mockPrisma.task.findMany.mockResolvedValue(mockTasks);

      const result = await service.getTasks(userId, filter);

      expect(mockPrisma.task.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockTasks);
    });
  });

  describe('getTask', () => {
    it('should return a task by ID', async () => {
      const userId = 'user-1';
      const taskId = 'task-1';
      const mockTask = createMockTask({ id: taskId, userId });

      mockPrisma.task.findFirst.mockResolvedValue(mockTask);

      const result = await service.getTask(userId, taskId);

      expect(mockPrisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: taskId, userId },
      });
      expect(result).toEqual(mockTask);
    });

    it('should return null if task not found', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      const result = await service.getTask('user-1', 'nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createTask', () => {
    it('should throw error if project not found', async () => {
      const userId = 'user-1';
      const input = {
        text: 'New task',
        projectId: 'nonexistent',
      };

      mockPrisma.project.findFirst.mockResolvedValue(null);

      await expect(service.createTask(userId, input)).rejects.toThrow(UserInputError);
    });

    it('should throw validation error for invalid input', async () => {
      const userId = 'user-1';
      const input = {
        text: '', // Empty text should fail validation
        projectId: 'project-1',
      };

      await expect(service.createTask(userId, input)).rejects.toThrow();
    });

    it('should create a task with valid input', async () => {
      const userId = 'user-1';
      const input = {
        text: 'New task',
        projectId: 'project-1',
        priority: TaskPriority.high,
      };

      const mockProject = createMockProject({ id: 'project-1', userId });
      const mockTask = createMockTask({
        text: input.text,
        projectId: input.projectId,
        priority: input.priority,
        userId,
      });

      mockPrisma.project.findFirst.mockResolvedValue(mockProject);
      mockPrisma.task.create.mockResolvedValue(mockTask);

      const result = await service.createTask(userId, input);

      expect(mockPrisma.project.findFirst).toHaveBeenCalled();
      expect(mockPrisma.task.create).toHaveBeenCalled();
      expect(result.text).toBe(input.text);
    });
  });

  describe('completeTask', () => {
    it('should throw error if task not found', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      await expect(service.completeTask('user-1', 'nonexistent')).rejects.toThrow(UserInputError);
    });

    it('should throw error if task already completed', async () => {
      const mockTask = createMockTask({ completed: true });
      mockPrisma.task.findFirst.mockResolvedValue(mockTask);

      await expect(service.completeTask('user-1', 'task-1')).rejects.toThrow(UserInputError);
    });

    it('should complete a task and award XP', async () => {
      const userId = 'user-1';
      const taskId = 'task-1';
      const mockTask = createMockTask({
        id: taskId,
        userId,
        completed: false,
        priority: TaskPriority.high,
      });

      const completedTask = { ...mockTask, completed: true, status: TaskStatus.completed };
      const mockGameProfile = {
        userId,
        xp: 50,
        level: 1,
        currentStreak: 0,
        maxStreak: 0,
        totalTasksCompleted: 0,
      };

      mockPrisma.task.findFirst.mockResolvedValue(mockTask);
      mockPrisma.task.update.mockResolvedValue(completedTask);
      mockPrisma.gamificationProfile.findUnique.mockResolvedValue(mockGameProfile);
      mockPrisma.gamificationProfile.update.mockResolvedValue({ ...mockGameProfile, xp: 100 });

      const result = await service.completeTask(userId, taskId);

      expect(mockPrisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: taskId, userId },
      });
      expect(mockPrisma.task.update).toHaveBeenCalled();
      expect(result.completed).toBe(true);
    });
  });

  describe('deleteTask', () => {
    it('should throw error if task not found', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      await expect(service.deleteTask('user-1', 'nonexistent')).rejects.toThrow(UserInputError);
    });

    it('should delete a task', async () => {
      const userId = 'user-1';
      const taskId = 'task-1';
      const mockTask = createMockTask({ id: taskId, userId });

      mockPrisma.task.findFirst.mockResolvedValue(mockTask);
      mockPrisma.task.delete.mockResolvedValue(mockTask);

      const result = await service.deleteTask(userId, taskId);

      expect(mockPrisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: taskId, userId },
      });
      expect(mockPrisma.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('getTaskStats', () => {
    it('should return task statistics', async () => {
      const userId = 'user-1';

      mockPrisma.task.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(4); // completed
      mockPrisma.task.findMany
        .mockResolvedValueOnce([createMockTask()]) // overdue
        .mockResolvedValueOnce([createMockTask(), createMockTask()]); // due today

      const result = await service.getTaskStats(userId);

      expect(result).toEqual({
        total: 10,
        completed: 4,
        pending: 6,
        overdue: 1,
        dueToday: 2,
      });
    });
  });
});
