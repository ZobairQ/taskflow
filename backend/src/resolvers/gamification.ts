import { Context } from '../types/context';
import { AuthenticationError } from '../utils/errors';

export const gamificationResolvers = {
  Query: {
    gameProfile: async (_: any, __: any, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      let profile = await prisma.gamificationProfile.findUnique({
        where: { userId: user.id },
      });

      if (!profile) {
        profile = await prisma.gamificationProfile.create({
          data: { userId: user.id },
        });
      }

      return profile;
    },

    achievements: async (_: any, __: any, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const definitions = await prisma.achievementDefinition.findMany();
      const userAchievements = await prisma.userAchievement.findMany({
        where: { userId: user.id },
      });

      const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

      return definitions.map((def) => ({
        id: def.id,
        title: def.title,
        description: def.description,
        icon: def.icon,
        points: def.points,
        category: def.category,
        unlocked: unlockedIds.has(def.id),
        unlockedAt: userAchievements.find((ua) => ua.achievementId === def.id)?.unlockedAt,
      }));
    },

    dailyChallenges: async (_: any, { date }: { date?: Date }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const targetDate = date || new Date();
      targetDate.setHours(0, 0, 0, 0);

      const definitions = await prisma.dailyChallengeDefinition.findMany();
      const userChallenges = await prisma.userDailyChallenge.findMany({
        where: {
          userId: user.id,
          date: targetDate,
        },
      });

      return definitions.map((def) => {
        const userChallenge = userChallenges.find((uc) => uc.challengeId === def.id);

        return {
          id: userChallenge?.id || '',
          challenge: {
            id: def.id,
            title: def.title,
            description: def.description,
            target: def.target,
            reward: def.reward,
            icon: def.icon,
          },
          current: userChallenge?.current || 0,
          completed: userChallenge?.completed || false,
          completedAt: userChallenge?.completedAt,
        };
      });
    },
  },
  Mutation: {
    activatePowerUp: async (_: any, { id }: { id: string }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const profile = await prisma.gamificationProfile.findUnique({
        where: { userId: user.id },
      });

      if (!profile) {
        throw new AuthenticationError('Profile not found');
      }

      // TODO: Implement power-up activation logic
      // This would update the activePowerUps JSON field

      return profile;
    },

    deactivatePowerUp: async (_: any, { id }: { id: string }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const profile = await prisma.gamificationProfile.findUnique({
        where: { userId: user.id },
      });

      if (!profile) {
        throw new AuthenticationError('Profile not found');
      }

      // TODO: Implement power-up deactivation logic

      return profile;
    },
  },
  GamificationProfile: {
    achievements: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.userAchievement.findMany({
        where: { userId: parent.userId },
        include: { achievement: true },
      });
    },

    dailyChallenges: async (parent: any, { date }: { date?: Date }, { prisma }: Context) => {
      const targetDate = date || new Date();
      targetDate.setHours(0, 0, 0, 0);

      const definitions = await prisma.dailyChallengeDefinition.findMany();
      const userChallenges = await prisma.userDailyChallenge.findMany({
        where: {
          userId: parent.userId,
          date: targetDate,
        },
      });

      return definitions.map((def) => {
        const userChallenge = userChallenges.find((uc) => uc.challengeId === def.id);

        return {
          id: userChallenge?.id || '',
          challenge: def,
          current: userChallenge?.current || 0,
          completed: userChallenge?.completed || false,
          completedAt: userChallenge?.completedAt,
        };
      });
    },

    streakBadge: (parent: any) => {
      const streak = parent.currentStreak || 0;
      let color, emoji, multiplier;

      if (streak >= 30) {
        color = '#FFD700';
        emoji = '🔥';
        multiplier = 3.0;
      } else if (streak >= 14) {
        color = '#FF6B6B';
        emoji = '🔥';
        multiplier = 2.0;
      } else if (streak >= 7) {
        color = '#4ECDC4';
        emoji = '⚡';
        multiplier = 1.5;
      } else if (streak >= 3) {
        color = '#45B7D1';
        emoji = '✨';
        multiplier = 1.25;
      } else {
        color = '#96CEB4';
        emoji = '⭐';
        multiplier = 1.0;
      }

      return { color, emoji, multiplier };
    },

    xpProgress: (parent: any) => {
      const level = parent.level || 1;
      const xp = parent.xp || 0;

      // XP required for current level
      const xpForCurrentLevel = Math.floor(100 * Math.pow(1.5, level - 1));
      // XP required for next level
      const xpForNextLevel = Math.floor(100 * Math.pow(1.5, level));

      const progressInLevel = xp - xpForCurrentLevel;
      const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;

      return Math.min(100, Math.max(0, (progressInLevel / xpNeededForNext) * 100));
    },

    activePowerUps: (parent: any) => {
      if (!parent.activePowerUps) return [];
      return parent.activePowerUps;
    },
  },
};
