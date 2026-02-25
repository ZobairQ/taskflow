import { Context } from '../types/context';
import { AuthenticationError, UserInputError } from '../utils/errors';

// Type definitions for resolver arguments
export interface GameProfileArgs {
  date?: Date;
}

export interface PowerUpArgs {
  id: string;
}

export interface DateArgs {
  date?: Date;
}

export interface AchievementParent {
  userId: string;
}

export interface GamificationProfileParent {
  userId: string;
  level?: number;
  xp?: number;
  currentStreak?: number;
  activePowerUps?: ActivePowerUp[];
}

// Available power-ups configuration
const POWER_UPS = {
  double_xp: {
    id: 'double_xp',
    name: 'Double XP',
    description: 'Earn double XP for 1 hour',
    icon: '⚡',
    multiplier: 2.0,
    duration: 60, // minutes
    requiredLevel: 5,
    rarity: 'common',
  },
  streak_shield: {
    id: 'streak_shield',
    name: 'Streak Shield',
    description: 'Protect your streak for 24 hours',
    icon: '🛡️',
    multiplier: 1.0,
    duration: 1440, // 24 hours in minutes
    requiredLevel: 10,
    rarity: 'rare',
  },
  focus_boost: {
    id: 'focus_boost',
    name: 'Focus Boost',
    description: '1.5x XP for focus sessions',
    icon: '🎯',
    multiplier: 1.5,
    duration: 120, // 2 hours
    requiredLevel: 3,
    rarity: 'common',
  },
  productivity_surge: {
    id: 'productivity_surge',
    name: 'Productivity Surge',
    description: '3x XP for completing high priority tasks',
    icon: '🚀',
    multiplier: 3.0,
    duration: 30,
    requiredLevel: 15,
    rarity: 'epic',
  },
};

type PowerUpId = keyof typeof POWER_UPS;
type ActivePowerUp = {
  id: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  multiplier: number;
  duration: number;
  expiresAt: string | null;
  activatedAt: string;
  requiredLevel: number;
  rarity: string;
};

export const gamificationResolvers = {
  Query: {
    gameProfile: async (_: unknown, __: unknown, { user, prisma }: Context) => {
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

    achievements: async (_: unknown, __: unknown, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const definitions = await prisma.achievementDefinition.findMany();
      const userAchievements = await prisma.userAchievement.findMany({
        where: { userId: user.id },
      });

      // Handle empty arrays gracefully
      const unlockedIds = new Set((userAchievements ?? []).map((ua) => ua.achievementId));

      return definitions.map((def) => ({
        id: def.id,
        title: def.title ?? '',
        description: def.description ?? '',
        icon: def.icon ?? '',
        points: def.points ?? 0,
        category: def.category ?? 'general',
        unlocked: unlockedIds.has(def.id),
        unlockedAt: userAchievements?.find((ua) => ua.achievementId === def.id)?.unlockedAt ?? null,
      }));
    },

    dailyChallenges: async (_: unknown, { date }: DateArgs, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const targetDate = date ? new Date(date) : new Date();
      targetDate.setHours(0, 0, 0, 0);

      const definitions = await prisma.dailyChallengeDefinition.findMany();
      const userChallenges = await prisma.userDailyChallenge.findMany({
        where: {
          userId: user.id,
          date: targetDate,
        },
      });

      // Handle null/undefined gracefully
      const safeDefinitions = definitions ?? [];
      const safeUserChallenges = userChallenges ?? [];

      return safeDefinitions.map((def) => {
        const userChallenge = safeUserChallenges.find((uc) => uc.challengeId === def.id);

        return {
          id: userChallenge?.id ?? null,
          challenge: {
            id: def.id,
            title: def.title ?? '',
            description: def.description ?? '',
            target: def.target ?? 0,
            reward: def.reward ?? 0,
            icon: def.icon ?? '',
          },
          current: userChallenge?.current ?? 0,
          completed: userChallenge?.completed ?? false,
          completedAt: userChallenge?.completedAt ?? null,
        };
      });
    },
  },
  Mutation: {
    activatePowerUp: async (_: unknown, { id }: PowerUpArgs, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const profile = await prisma.gamificationProfile.findUnique({
        where: { userId: user.id },
      });

      if (!profile) {
        throw new AuthenticationError('Profile not found');
      }

      // Validate power-up exists
      const powerUpConfig = POWER_UPS[id as PowerUpId];
      if (!powerUpConfig) {
        throw new UserInputError('Invalid power-up ID');
      }

      // Check level requirement
      if (profile.level < powerUpConfig.requiredLevel) {
        throw new UserInputError(
          `Requires level ${powerUpConfig.requiredLevel} to activate this power-up`
        );
      }

      // Get current active power-ups
      const currentPowerUps: ActivePowerUp[] = (profile.activePowerUps as ActivePowerUp[]) || [];

      // Check if already active
      const existingIndex = currentPowerUps.findIndex((p) => p.id === id);
      if (existingIndex !== -1 && currentPowerUps[existingIndex].active) {
        throw new UserInputError('Power-up is already active');
      }

      // Calculate expiration time
      const now = new Date();
      const expiresAt = new Date(now.getTime() + powerUpConfig.duration * 60 * 1000);

      // Create activated power-up
      const activatedPowerUp: ActivePowerUp = {
        ...powerUpConfig,
        active: true,
        expiresAt: expiresAt.toISOString(),
        activatedAt: now.toISOString(),
      };

      // Update or add the power-up
      let updatedPowerUps: ActivePowerUp[];
      if (existingIndex !== -1) {
        updatedPowerUps = [...currentPowerUps];
        updatedPowerUps[existingIndex] = activatedPowerUp;
      } else {
        updatedPowerUps = [...currentPowerUps, activatedPowerUp];
      }

      // Save to database
      const updatedProfile = await prisma.gamificationProfile.update({
        where: { userId: user.id },
        data: { activePowerUps: updatedPowerUps },
      });

      return updatedProfile;
    },

    deactivatePowerUp: async (_: unknown, { id }: PowerUpArgs, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const profile = await prisma.gamificationProfile.findUnique({
        where: { userId: user.id },
      });

      if (!profile) {
        throw new AuthenticationError('Profile not found');
      }

      // Get current active power-ups
      const currentPowerUps: ActivePowerUp[] = (profile.activePowerUps as ActivePowerUp[]) || [];

      // Find and deactivate the power-up
      const powerUpIndex = currentPowerUps.findIndex((p) => p.id === id);
      if (powerUpIndex === -1) {
        throw new UserInputError('Power-up not found');
      }

      // Remove the power-up from active list
      const updatedPowerUps = currentPowerUps.filter((p) => p.id !== id);

      // Save to database
      const updatedProfile = await prisma.gamificationProfile.update({
        where: { userId: user.id },
        data: { activePowerUps: updatedPowerUps },
      });

      return updatedProfile;
    },
  },
  GamificationProfile: {
    achievements: async (parent: AchievementParent, _: unknown, { prisma }: Context) => {
      return prisma.userAchievement.findMany({
        where: { userId: parent.userId },
        include: { achievement: true },
      });
    },

    dailyChallenges: async (parent: AchievementParent, { date }: DateArgs, { prisma }: Context) => {
      const targetDate = date ? new Date(date) : new Date();
      targetDate.setHours(0, 0, 0, 0);

      const definitions = await prisma.dailyChallengeDefinition.findMany();
      const userChallenges = await prisma.userDailyChallenge.findMany({
        where: {
          userId: parent.userId,
          date: targetDate,
        },
      });

      // Handle null/undefined gracefully
      const safeDefinitions = definitions ?? [];
      const safeUserChallenges = userChallenges ?? [];

      return safeDefinitions.map((def) => {
        const userChallenge = safeUserChallenges.find((uc) => uc.challengeId === def.id);

        return {
          id: userChallenge?.id ?? null,
          challenge: def,
          current: userChallenge?.current ?? 0,
          completed: userChallenge?.completed ?? false,
          completedAt: userChallenge?.completedAt ?? null,
        };
      });
    },

    streakBadge: (parent: GamificationProfileParent) => {
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

    xpProgress: (parent: GamificationProfileParent) => {
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

    activePowerUps: (parent: GamificationProfileParent) => {
      if (!parent.activePowerUps) return [];
      return parent.activePowerUps;
    },
  },
};
