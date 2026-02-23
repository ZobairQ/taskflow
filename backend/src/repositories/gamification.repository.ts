/**
 * Gamification Repository
 * Data access layer for gamification-related entities
 */

import {
  PrismaClient,
  GamificationProfile,
  UserAchievement,
  UserDailyChallenge,
} from '@prisma/client';
import { BaseRepository } from './base.repository';

export class GamificationRepository extends BaseRepository<GamificationProfile> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  protected get model() {
    return this.prisma.gamificationProfile;
  }

  /**
   * Get or create gamification profile for a user
   */
  async getOrCreateProfile(userId: string): Promise<GamificationProfile> {
    let profile = await this.prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await this.prisma.gamificationProfile.create({
        data: { userId },
      });
    }

    return profile;
  }

  /**
   * Update XP and level
   */
  async addXp(userId: string, xpToAdd: number): Promise<GamificationProfile> {
    const profile = await this.getOrCreateProfile(userId);
    const newXp = profile.xp + xpToAdd;
    const newLevel = Math.floor(newXp / 100) + 1;

    return this.prisma.gamificationProfile.update({
      where: { userId },
      data: {
        xp: newXp,
        level: newLevel,
      },
    });
  }

  /**
   * Update streak
   */
  async updateStreak(
    userId: string,
    currentStreak: number,
    maxStreak?: number
  ): Promise<GamificationProfile> {
    const updateData: any = {
      currentStreak,
      lastStreakDate: new Date(),
    };

    if (maxStreak !== undefined) {
      updateData.maxStreak = maxStreak;
    }

    return this.prisma.gamificationProfile.update({
      where: { userId },
      data: updateData,
    });
  }

  /**
   * Increment tasks completed count
   */
  async incrementTasksCompleted(userId: string): Promise<GamificationProfile> {
    const profile = await this.getOrCreateProfile(userId);

    return this.prisma.gamificationProfile.update({
      where: { userId },
      data: {
        totalTasksCompleted: profile.totalTasksCompleted + 1,
        completedTasksToday: profile.completedTasksToday + 1,
      },
    });
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    });
  }

  /**
   * Unlock an achievement
   */
  async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    return this.prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
        unlockedAt: new Date(),
      },
    });
  }

  /**
   * Check if user has achievement
   */
  async hasAchievement(userId: string, achievementId: string): Promise<boolean> {
    const count = await this.prisma.userAchievement.count({
      where: { userId, achievementId },
    });
    return count > 0;
  }

  /**
   * Get daily challenges for user
   */
  async getDailyChallenges(userId: string, date: Date = new Date()): Promise<UserDailyChallenge[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    return this.prisma.userDailyChallenge.findMany({
      where: {
        userId,
        date: startOfDay,
      },
      include: { challenge: true },
    });
  }

  /**
   * Complete a daily challenge
   */
  async completeDailyChallenge(
    userId: string,
    challengeId: string,
    _xpEarned: number
  ): Promise<UserDailyChallenge> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.userDailyChallenge.update({
      where: {
        userId_challengeId_date: {
          userId,
          challengeId,
          date: today,
        },
      },
      data: {
        completed: true,
        completedAt: new Date(),
      },
    });
  }

  /**
   * Get active power-ups
   */
  async getActivePowerUps(userId: string): Promise<any> {
    const profile = await this.getOrCreateProfile(userId);
    return profile.activePowerUps || {};
  }

  /**
   * Use a power-up
   */
  async usePowerUp(userId: string, powerUpType: string): Promise<GamificationProfile | null> {
    const profile = await this.getOrCreateProfile(userId);
    const activePowerUps = (profile.activePowerUps as Record<string, number>) || {};
    const currentCount = activePowerUps[powerUpType] || 0;

    if (currentCount <= 0) {
      return null;
    }

    return this.prisma.gamificationProfile.update({
      where: { userId },
      data: {
        activePowerUps: {
          ...activePowerUps,
          [powerUpType]: currentCount - 1,
        },
      },
    });
  }
}
