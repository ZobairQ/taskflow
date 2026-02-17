import { Context } from '../types/context';
import { AuthenticationError, UserInputError } from '../utils/errors';

export const projectResolvers = {
  Query: {
    projects: async (_: any, __: any, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      return prisma.project.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });
    },

    project: async (_: any, { id }: { id: string }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const project = await prisma.project.findFirst({
        where: {
          id,
          userId: user.id,
        },
      });

      if (!project) {
        throw new UserInputError('Project not found');
      }

      return project;
    },

    projectStats: async (_: any, __: any, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const projects = await prisma.project.findMany({
        where: { userId: user.id },
        include: {
          _count: {
            select: {
              tasks: true,
            },
          },
          tasks: {
            where: { completed: true },
          },
        },
      });

      const totalProjects = projects.length;
      const totalTodos = projects.reduce((acc, p) => acc + p._count.tasks, 0);
      const totalCompleted = projects.reduce((acc, p) => acc + p.tasks.length, 0);

      return {
        totalProjects,
        totalTodos,
        totalCompleted,
        totalActive: totalTodos - totalCompleted,
      };
    },
  },
  Mutation: {
    createProject: async (_: any, { input }: { input: any }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const { name, description, color } = input;

      return prisma.project.create({
        data: {
          name,
          description: description || '',
          color: color || '#6366f1',
          userId: user.id,
        },
      });
    },

    updateProject: async (_: any, { input }: { input: any }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const { id, name, description, color } = input;

      // Verify ownership
      const existingProject = await prisma.project.findFirst({
        where: { id, userId: user.id },
      });

      if (!existingProject) {
        throw new UserInputError('Project not found');
      }

      return prisma.project.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(color !== undefined && { color }),
        },
      });
    },

    deleteProject: async (_: any, { id }: { id: string }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      // Verify ownership
      const project = await prisma.project.findFirst({
        where: { id, userId: user.id },
      });

      if (!project) {
        throw new UserInputError('Project not found');
      }

      await prisma.project.delete({
        where: { id },
      });

      return true;
    },
  },
  Project: {
    tasks: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.task.findMany({
        where: { projectId: parent.id },
        orderBy: { createdAt: 'desc' },
      });
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
