import { Context } from '../types/context';
import { AuthenticationError, UserInputError } from '../utils/errors';

export const taskResolvers = {
  Query: {
    tasks: async (_: any, { projectId, filter }: { projectId?: string; filter?: any }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const where: any = { userId: user.id };

      if (projectId) {
        where.projectId = projectId;
      }

      if (filter) {
        if (filter.status) where.status = filter.status;
        if (filter.priority) where.priority = filter.priority;
        if (filter.category) where.category = filter.category;
        if (filter.completed !== undefined) where.completed = filter.completed;
        if (filter.dueBefore) where.dueDate = { lt: filter.dueBefore };
        if (filter.dueAfter) where.dueDate = { gt: filter.dueAfter };
      }

      return prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    },

    task: async (_: any, { id }: { id: string }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const task = await prisma.task.findFirst({
        where: {
          id,
          userId: user.id,
        },
      });

      if (!task) {
        throw new UserInputError('Task not found');
      }

      return task;
    },

    tasksByDate: async (_: any, { date }: { date: Date }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      return prisma.task.findMany({
        where: {
          userId: user.id,
          dueDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: { dueDate: 'asc' },
      });
    },

    searchTasks: async (_: any, { query, filters }: { query: string; filters?: any[] }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      return prisma.task.findMany({
        where: {
          userId: user.id,
          OR: [
            { text: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  },
  Mutation: {
    createTask: async (_: any, { input }: { input: any }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const {
        text,
        description,
        priority,
        category,
        dueDate,
        projectId,
        subtasks,
        isRecurring,
        recurrencePattern,
        notificationSettings,
      } = input;

      // Verify project ownership
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId: user.id },
      });

      if (!project) {
        throw new UserInputError('Project not found');
      }

      return prisma.task.create({
        data: {
          text,
          description: description || '',
          priority: priority || 'medium',
          category: category || 'general',
          dueDate: dueDate ? new Date(dueDate) : null,
          projectId,
          userId: user.id,
          subtasks: subtasks || null,
          isRecurring: isRecurring || false,
          recurrencePattern: recurrencePattern || null,
          notificationSettings: notificationSettings || null,
        },
      });
    },

    updateTask: async (_: any, { input }: { input: any }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const { id, ...updates } = input;

      // Verify ownership
      const existingTask = await prisma.task.findFirst({
        where: { id, userId: user.id },
      });

      if (!existingTask) {
        throw new UserInputError('Task not found');
      }

      const data: any = {};

      if (updates.text !== undefined) data.text = updates.text;
      if (updates.description !== undefined) data.description = updates.description;
      if (updates.status !== undefined) {
        data.status = updates.status;
        data.completed = updates.status === 'completed';
        if (updates.status === 'completed') {
          data.completedAt = new Date();
        }
        if (updates.status === 'in_progress' && !existingTask.startedAt) {
          data.startedAt = new Date();
        }
      }
      if (updates.priority !== undefined) data.priority = updates.priority;
      if (updates.category !== undefined) data.category = updates.category;
      if (updates.dueDate !== undefined) data.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
      if (updates.subtasks !== undefined) data.subtasks = updates.subtasks;
      if (updates.notificationSettings !== undefined) data.notificationSettings = updates.notificationSettings;

      return prisma.task.update({
        where: { id },
        data,
      });
    },

    deleteTask: async (_: any, { id }: { id: string }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      // Verify ownership
      const task = await prisma.task.findFirst({
        where: { id, userId: user.id },
      });

      if (!task) {
        throw new UserInputError('Task not found');
      }

      await prisma.task.delete({
        where: { id },
      });

      return true;
    },

    completeTask: async (_: any, { id }: { id: string }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      // Verify ownership
      const task = await prisma.task.findFirst({
        where: { id, userId: user.id },
      });

      if (!task) {
        throw new UserInputError('Task not found');
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          completed: true,
          status: 'completed',
          completedAt: new Date(),
        },
      });

      // Update gamification profile
      await prisma.gamificationProfile.update({
        where: { userId: user.id },
        data: {
          totalTasksCompleted: { increment: 1 },
          completedTasksToday: { increment: 1 },
          xp: { increment: task.priority === 'high' ? 50 : 25 },
        },
      });

      return updatedTask;
    },

    bulkCompleteTasks: async (_: any, { ids }: { ids: string[] }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const result = await prisma.task.updateMany({
        where: {
          id: { in: ids },
          userId: user.id,
        },
        data: {
          completed: true,
          status: 'completed',
          completedAt: new Date(),
        },
      });

      return {
        success: true,
        processedCount: result.count,
        failedCount: ids.length - result.count,
        errors: [],
      };
    },

    bulkDeleteTasks: async (_: any, { ids }: { ids: string[] }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const result = await prisma.task.deleteMany({
        where: {
          id: { in: ids },
          userId: user.id,
        },
      });

      return {
        success: true,
        processedCount: result.count,
        failedCount: ids.length - result.count,
        errors: [],
      };
    },

    createDependency: async (_: any, { input }: { input: any }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const { predecessorTaskId, successorTaskId, type } = input;

      // Verify ownership of both tasks
      const predecessor = await prisma.task.findFirst({
        where: { id: predecessorTaskId, userId: user.id },
      });
      const successor = await prisma.task.findFirst({
        where: { id: successorTaskId, userId: user.id },
      });

      if (!predecessor || !successor) {
        throw new UserInputError('Task not found');
      }

      return prisma.taskDependency.create({
        data: {
          predecessorTaskId,
          successorTaskId,
          type: type || 'blocks',
        },
      });
    },

    deleteDependency: async (_: any, { id }: { id: string }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      await prisma.taskDependency.delete({
        where: { id },
      });

      return true;
    },
  },
  Task: {
    project: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.project.findUnique({
        where: { id: parent.projectId },
      });
    },

    user: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.user.findUnique({
        where: { id: parent.userId },
      });
    },

    subtasks: (parent: any) => {
      if (!parent.subtasks) return null;
      return parent.subtasks;
    },

    dependencies: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.taskDependency.findMany({
        where: { predecessorTaskId: parent.id },
      });
    },

    dependents: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.taskDependency.findMany({
        where: { successorTaskId: parent.id },
      });
    },

    canStart: async (parent: any, _: any, { prisma }: Context) => {
      // Check if all blocking dependencies are completed
      const blockingDependencies = await prisma.taskDependency.findMany({
        where: {
          successorTaskId: parent.id,
          type: 'blockedBy',
        },
        include: {
          predecessorTask: true,
        },
      });

      return blockingDependencies.every((dep) => dep.predecessorTask.completed);
    },
  },
};
