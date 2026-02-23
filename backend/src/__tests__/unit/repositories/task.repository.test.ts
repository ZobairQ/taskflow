/**
 * TaskRepository Unit Tests
 */

import { TaskRepository } from '../../../repositories/task.repository';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { createMockPrisma, createMockTask } from '../../utils/testUtils';

describe('TaskRepository', () => {
  let repository: TaskRepository;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    repository = new TaskRepository(mockPrisma as any);
  });

  describe('findById', () => {
    it('should find a task by ID for a user', async () => {
      const taskId = 'task-1';
      const userId = 'user-1';
      const mockTask = createMockTask({ id: taskId, userId });

      mockPrisma.task.findFirst.mockResolvedValue(mockTask);

      const result = await repository.findById(taskId, userId);

      expect(mockPrisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: taskId, userId },
      });
      expect(result).toEqual(mockTask);
    });

    it('should return null if task not found', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      const result = await repository.findById('nonexistent', 'user-1');

      expect(result).toBeNull();
    });
  });

  describe('findByProject', () => {
    it('should find all tasks for a project', async () => {
      const projectId = 'project-1';
      const userId = 'user-1';
      const mockTasks = [
        createMockTask({ projectId, userId }),
        createMockTask({ id: 'task-2', projectId, userId }),
      ];

      mockPrisma.task.findMany.mockResolvedValue(mockTasks);

      const result = await repository.findByProject(projectId, userId);

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: { projectId, userId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockTasks);
    });
  });

  describe('findByUser', () => {
    it('should find all tasks for a user', async () => {
      const userId = 'user-1';
      const mockTasks = [createMockTask({ userId })];

      mockPrisma.task.findMany.mockResolvedValue(mockTasks);

      const result = await repository.findByUser(userId);

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      });
      expect(result).toEqual(mockTasks);
    });

    it('should apply filters correctly', async () => {
      const userId = 'user-1';
      const filter = {
        projectId: 'project-1',
        status: TaskStatus.pending,
        completed: false,
      };

      mockPrisma.task.findMany.mockResolvedValue([]);

      await repository.findByUser(userId, filter);

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          projectId: 'project-1',
          status: TaskStatus.pending,
          completed: false,
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      });
    });

    it('should handle search filter', async () => {
      const userId = 'user-1';
      const filter = { search: 'documentation' };

      mockPrisma.task.findMany.mockResolvedValue([]);

      await repository.findByUser(userId, filter);

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { text: { contains: 'documentation', mode: 'insensitive' } },
              { description: { contains: 'documentation', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const data = {
        text: 'New task',
        projectId: 'project-1',
        userId: 'user-1',
      };
      const mockTask = createMockTask(data);

      mockPrisma.task.create.mockResolvedValue(mockTask);

      const result = await repository.create(data);

      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          text: data.text,
          projectId: data.projectId,
          userId: data.userId,
          priority: TaskPriority.medium, // default
          status: TaskStatus.pending, // default
          category: 'general', // default
        }),
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const taskId = 'task-1';
      const updates = { text: 'Updated task', completed: true };
      const mockTask = createMockTask({ id: taskId, ...updates });

      mockPrisma.task.update.mockResolvedValue(mockTask);

      const result = await repository.update(taskId, updates as any);

      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: updates,
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      const taskId = 'task-1';
      const mockTask = createMockTask({ id: taskId });

      mockPrisma.task.delete.mockResolvedValue(mockTask);

      const result = await repository.delete(taskId);

      expect(mockPrisma.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('bulkUpdate', () => {
    it('should update multiple tasks', async () => {
      const taskIds = ['task-1', 'task-2'];
      const updates = { completed: true };

      mockPrisma.task.updateMany.mockResolvedValue({ count: 2 });

      const result = await repository.bulkUpdate(taskIds, updates as any);

      expect(mockPrisma.task.updateMany).toHaveBeenCalledWith({
        where: { id: { in: taskIds } },
        data: updates,
      });
      expect(result).toEqual({ count: 2 });
    });
  });

  describe('complete', () => {
    it('should mark a task as completed', async () => {
      const taskId = 'task-1';
      const mockTask = createMockTask({
        id: taskId,
        completed: true,
        status: TaskStatus.completed,
      });

      mockPrisma.task.update.mockResolvedValue(mockTask);

      const result = await repository.complete(taskId);

      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: {
          completed: true,
          status: TaskStatus.completed,
          completedAt: expect.any(Date),
        },
      });
      expect(result.completed).toBe(true);
    });
  });

  describe('uncomplete', () => {
    it('should mark a task as uncompleted', async () => {
      const taskId = 'task-1';
      const mockTask = createMockTask({ id: taskId, completed: false, status: TaskStatus.pending });

      mockPrisma.task.update.mockResolvedValue(mockTask);

      const result = await repository.uncomplete(taskId);

      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: {
          completed: false,
          status: TaskStatus.pending,
          completedAt: null,
        },
      });
      expect(result.completed).toBe(false);
    });
  });

  describe('findDueToday', () => {
    it('should find tasks due today', async () => {
      const userId = 'user-1';
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const mockTask = createMockTask({ userId, dueDate: today, completed: false });

      mockPrisma.task.findMany.mockResolvedValue([mockTask]);

      const result = await repository.findDueToday(userId);

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          dueDate: { gte: expect.any(Date), lt: expect.any(Date) },
          completed: false,
        },
        orderBy: { dueDate: 'asc' },
      });
      expect(result).toEqual([mockTask]);
    });
  });

  describe('findOverdue', () => {
    it('should find overdue tasks', async () => {
      const userId = 'user-1';
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const mockTask = createMockTask({ userId, dueDate: yesterday, completed: false });

      mockPrisma.task.findMany.mockResolvedValue([mockTask]);

      const result = await repository.findOverdue(userId);

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          dueDate: { lt: expect.any(Date) },
          completed: false,
        },
        orderBy: { dueDate: 'asc' },
      });
      expect(result).toEqual([mockTask]);
    });
  });
});
