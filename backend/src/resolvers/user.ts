import { Context } from '../types/context';
import { AuthenticationError } from '../utils/errors';

export const userResolvers = {
  Query: {},
  Mutation: {
    updateUserProfile: async (_: any, { name, avatar }: { name?: string; avatar?: string }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      return prisma.user.update({
        where: { id: user.id },
        data: {
          ...(name !== undefined && { name }),
          ...(avatar !== undefined && { avatar }),
        },
      });
    },

    changePassword: async (
      _: any,
      { oldPassword, newPassword }: { oldPassword: string; newPassword: string },
      { user, prisma }: Context
    ) => {
      if (!user || !user.passwordHash) {
        throw new AuthenticationError('Not authenticated');
      }

      const bcrypt = require('bcryptjs');
      const validPassword = await bcrypt.compare(oldPassword, user.passwordHash);

      if (!validPassword) {
        throw new AuthenticationError('Invalid old password');
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      return true;
    },
  },
  User: {
    projects: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.project.findMany({
        where: { userId: parent.id },
        orderBy: { createdAt: 'desc' },
      });
    },

    tasks: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.task.findMany({
        where: { userId: parent.id },
        orderBy: { createdAt: 'desc' },
      });
    },

    gameProfile: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.gamificationProfile.findUnique({
        where: { userId: parent.id },
      });
    },

    templates: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.template.findMany({
        where: {
          OR: [
            { userId: parent.id },
            { isBuiltIn: true },
          ],
        },
        orderBy: { usageCount: 'desc' },
      });
    },

    achievements: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.userAchievement.findMany({
        where: { userId: parent.id },
        include: {
          achievement: true,
        },
      });
    },

    analytics: async (parent: any, { dateRange }: any, { prisma }: Context) => {
      // TODO: Implement analytics computation
      return {
        productivity: {
          totalTasksCreated: 0,
          totalTasksCompleted: 0,
          completionRate: 0,
          averageDaily: 0,
          mostProductiveDay: 'Monday',
          mostProductiveHour: 9,
          streakDays: 0,
          dailyBreakdown: [],
        },
        timeTracking: {
          totalFocusTime: 0,
          averageSessionLength: 0,
          sessionsCompleted: 0,
          focusTimeByDay: [],
          focusTimeByCategory: [],
        },
        categories: [],
        priorities: [],
        insights: [],
      };
    },
  },
};
