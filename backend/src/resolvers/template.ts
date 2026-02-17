import { Context } from '../types/context';
import { AuthenticationError, UserInputError } from '../utils/errors';

export const templateResolvers = {
  Query: {
    templates: async (
      _: any,
      { category }: { category?: string },
      { user, prisma }: Context
    ) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const where: any = {
        OR: [{ userId: user.id }, { isBuiltIn: true }],
      };

      if (category) {
        where.category = category;
      }

      return prisma.template.findMany({
        where,
        orderBy: [{ isBuiltIn: 'asc' }, { usageCount: 'desc' }, { createdAt: 'desc' }],
      });
    },

    template: async (_: any, { id }: { id: string }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const template = await prisma.template.findFirst({
        where: {
          id,
          OR: [{ userId: user.id }, { isBuiltIn: true }],
        },
      });

      if (!template) {
        throw new UserInputError('Template not found');
      }

      return template;
    },

    mostUsedTemplates: async (
      _: any,
      { limit }: { limit?: number },
      { user, prisma }: Context
    ) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      return prisma.template.findMany({
        where: {
          OR: [{ userId: user.id }, { isBuiltIn: true }],
        },
        orderBy: { usageCount: 'desc' },
        take: limit || 10,
      });
    },
  },
  Mutation: {
    createTemplate: async (_: any, { input }: { input: any }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const { name, description, category, templateData, icon } = input;

      return prisma.template.create({
        data: {
          userId: user.id,
          name,
          description: description || '',
          category: category || 'general',
          templateData: templateData || {},
          icon: icon || '📋',
          isBuiltIn: false,
        },
      });
    },

    updateTemplate: async (_: any, { id, input }: { id: string; input: any }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const template = await prisma.template.findFirst({
        where: {
          id,
          userId: user.id,
          isBuiltIn: false,
        },
      });

      if (!template) {
        throw new UserInputError('Template not found or cannot be modified');
      }

      const { name, description, category, templateData, icon } = input;

      return prisma.template.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(category !== undefined && { category }),
          ...(templateData !== undefined && { templateData }),
          ...(icon !== undefined && { icon }),
        },
      });
    },

    deleteTemplate: async (_: any, { id }: { id: string }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const template = await prisma.template.findFirst({
        where: {
          id,
          userId: user.id,
          isBuiltIn: false,
        },
      });

      if (!template) {
        throw new UserInputError('Template not found or cannot be deleted');
      }

      await prisma.template.delete({
        where: { id },
      });

      return true;
    },

    useTemplate: async (
      _: any,
      { id, projectId }: { id: string; projectId: string },
      { user, prisma }: Context
    ) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const template = await prisma.template.findFirst({
        where: {
          id,
          OR: [{ userId: user.id }, { isBuiltIn: true }],
        },
      });

      if (!template) {
        throw new UserInputError('Template not found');
      }

      const project = await prisma.project.findFirst({
        where: { id: projectId, userId: user.id },
      });

      if (!project) {
        throw new UserInputError('Project not found');
      }

      // Increment usage count
      await prisma.template.update({
        where: { id },
        data: { usageCount: { increment: 1 } },
      });

      // Create task from template
      const templateDataObj = template.templateData as Record<string, any> || {};

      const taskData: any = {
        text: templateDataObj.text || template.name,
        description: templateDataObj.description || '',
        priority: templateDataObj.priority || 'medium',
        category: templateDataObj.category || 'general',
        projectId,
        userId: user.id,
      };

      if (templateDataObj.subtasks) {
        taskData.subtasks = templateDataObj.subtasks;
      }
      if (templateDataObj.notificationSettings) {
        taskData.notificationSettings = templateDataObj.notificationSettings;
      }
      if (templateDataObj.dueDate) {
        taskData.dueDate = new Date(templateDataObj.dueDate);
      }

      return prisma.task.create({
        data: taskData,
      });
    },
  },
};
