/**
 * Project Resolvers
 * GraphQL resolvers for project operations using ProjectService
 */

import { Context, prisma } from '../types/context';
import { ProjectService } from '../services/project.service';
import { AuthenticationError } from '../utils/errors';

// Initialize service
const projectService = new ProjectService(prisma);

export const projectResolvers = {
  Query: {
    projects: async (_: any, { filter }: { filter?: any }, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }
      return projectService.getProjects(user.id, filter);
    },

    project: async (_: any, { id }: { id: string }, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const result = await projectService.getProject(user.id, id);
      if (!result) {
        throw new Error('Project not found');
      }

      return result.project;
    },

    projectStats: async (_: any, __: any, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      return projectService.getProjectStats(user.id);
    },
  },

  Mutation: {
    createProject: async (_: any, { input }: { input: any }, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      return projectService.createProject(user.id, input);
    },

    updateProject: async (_: any, { input }: { input: any }, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      return projectService.updateProject(user.id, input);
    },

    deleteProject: async (_: any, { id }: { id: string }, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      await projectService.deleteProject(user.id, id);
      return true;
    },
  },

  Project: {
    tasks: async (parent: any, _: any, { loaders }: Context) => {
      // Use DataLoader for efficient batch loading
      return loaders.tasksByProjectLoader.load(parent.id);
    },

    completedTodos: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.task.count({
        where: {
          projectId: parent.id,
          completed: true,
        },
      });
    },

    totalTodos: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.task.count({
        where: { projectId: parent.id },
      });
    },
  },
};
