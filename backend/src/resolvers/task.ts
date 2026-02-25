/**
 * Task Resolvers
 * GraphQL resolvers for task operations using TaskService
 */

import { Context, prisma } from '../types/context';
import { TaskService } from '../services/task.service';
import { AuthenticationError } from '../utils/errors';
import { TaskPriority, TaskStatus } from '@prisma/client';

// Initialize service
const taskService = new TaskService(prisma);

export const taskResolvers = {
  Query: {
    tasks: async (
      _: any,
      { projectId, filter }: { projectId?: string; filter?: any },
      { user }: Context
    ) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      if (projectId) {
        return taskService.getTasksByProject(user.id, projectId);
      }

      return taskService.getTasks(user.id, filter);
    },

    task: async (_: any, { id }: { id: string }, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const task = await taskService.getTask(user.id, id);
      if (!task) {
        throw new Error('Task not found');
      }

      return task;
    },

    tasksByDate: async (_: any, { date }: { date: string }, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      return taskService.getTasks(user.id, {
        dueAfter: startOfDay,
        dueBefore: endOfDay,
      });
    },

    searchTasks: async (_: any, { query }: { query: string }, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      return taskService.getTasks(user.id, { search: query });
    },

    overdueTasks: async (_: any, __: any, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      return taskService.getOverdueTasks(user.id);
    },

    tasksDueToday: async (_: any, __: any, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      return taskService.getTasksDueToday(user.id);
    },

    taskStats: async (_: any, __: any, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      return taskService.getTaskStats(user.id);
    },
  },

  Mutation: {
    createTask: async (_: any, { input }: { input: any }, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      return taskService.createTask(user.id, input);
    },

    updateTask: async (_: any, { input }: { input: any }, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      return taskService.updateTask(user.id, input);
    },

    deleteTask: async (_: any, { id }: { id: string }, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      return taskService.deleteTask(user.id, id);
    },

    completeTask: async (_: any, { id }: { id: string }, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      return taskService.completeTask(user.id, id);
    },

    uncompleteTask: async (_: any, { id }: { id: string }, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      return taskService.uncompleteTask(user.id, id);
    },

    bulkUpdateTasks: async (
      _: any,
      { taskIds, updates }: { taskIds: string[]; updates: any },
      { user }: Context
    ) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      return taskService.bulkUpdateTasks(user.id, taskIds, updates);
    },

    bulkDeleteTasks: async (_: any, { taskIds }: { taskIds: string[] }, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      return taskService.bulkDeleteTasks(user.id, taskIds);
    },
  },

  // Task field resolvers
  Task: {
    project: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.task
        .findUnique({
          where: { id: parent.id },
          include: { project: true },
        })
        .project();
    },

    user: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.task
        .findUnique({
          where: { id: parent.id },
          include: { user: true },
        })
        .user();
    },

    subtasks: (parent: any) => {
      // subtasks is stored as JSON, return it directly or empty array
      if (!parent.subtasks) return [];
      return parent.subtasks;
    },

    canStart: (parent: any) => {
      // A task can be started if it's not completed and not in progress
      return !parent.completed && parent.status !== 'in_progress';
    },

    dependencies: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.taskDependency.findMany({
        where: { successorTaskId: parent.id },
      });
    },

    dependents: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.taskDependency.findMany({
        where: { predecessorTaskId: parent.id },
      });
    },

    recurrencePattern: (parent: any) => {
      return parent.recurrencePattern || null;
    },

    recurrenceInstances: (parent: any) => {
      return parent.recurrenceInstances || [];
    },

    notificationSettings: (parent: any) => {
      // Default notification settings if null
      if (!parent.notificationSettings) {
        return { enabled: false, timing: [], type: 'browser' };
      }
      return parent.notificationSettings;
    },
  },
};
