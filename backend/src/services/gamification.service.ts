/**
 * Gamification Service
 * Business logic layer for gamification operations
 */

import { PrismaClient } from '@prisma/client';
import { GamificationRepository } from '../repositories/gamification.repository';
import { activatePowerUpSchema } from '../validators/gamification.validator';
import { UserInputError } from '../utils/errors';
import { createLogger } from '../utils/logger';

const logger = createLogger('GamificationService');

export class GamificationService {
  private gameRepo: GamificationRepository;

  constructor(prisma: PrismaClient) {
    this.gameRepo = new GamificationRepository(prisma);
  }

  /**
   * Get user's gamification profile
   */
  async getProfile(userId: string) {
    logger.debug('Getting gamification profile', { userId });
    return this.gameRepo.getOrCreateProfile(userId);
  }

  /**
   * Award XP to a user
   */
  async awardXp(userId: string, xp: number) {
    logger.info('Awarding XP', { userId, xp });
    return this.gameRepo.addXp(userId, xp);
  }

  /**
   * Update user's streak
   */
  async updateStreak(userId: string): Promise<{
    currentStreak: number;
    isNewRecord: boolean;
    leveledUp: boolean;
  }> {
    const profile = await this.gameRepo.getOrCreateProfile(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastStreakDate = profile.lastStreakDate ? new Date(profile.lastStreakDate) : null;
    lastStreakDate?.setHours(0, 0, 0, 0);

    let newStreak = 1;
    let isNewRecord = false;

    if (lastStreakDate) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastStreakDate.getTime() === yesterday.getTime()) {
        newStreak = profile.currentStreak + 1;
      } else if (lastStreakDate.getTime() === today.getTime()) {
        return {
          currentStreak: profile.currentStreak,
          isNewRecord: false,
          leveledUp: false,
        };
      }
    }

    isNewRecord = newStreak > profile.maxStreak;
    const leveledUp = newStreak > 0 && newStreak % 7 === 0;

    await this.gameRepo.updateStreak(userId, newStreak, isNewRecord ? newStreak : undefined);

    if (leveledUp) {
      await this.gameRepo.addXp(userId, 100);
      logger.info('Streak bonus awarded', { userId, streak: newStreak });
    }

    logger.info('Streak updated', { userId, streak: newStreak, isNewRecord });

    return { currentStreak: newStreak, isNewRecord, leveledUp };
  }

  /**
   * Increment tasks completed count
   */
  async incrementTaskCount(userId: string) {
    return this.gameRepo.incrementTasksCompleted(userId);
  }

  /**
   * Get user achievements
   */
  async getAchievements(userId: string) {
    logger.debug('Getting achievements', { userId });
    return this.gameRepo.getUserAchievements(userId);
  }

  /**
   * Unlock an achievement
   */
  async unlockAchievement(userId: string, achievementId: string) {
    const hasAchievement = await this.gameRepo.hasAchievement(userId, achievementId);
    if (hasAchievement) {
      return null;
    }

    logger.info('Unlocking achievement', { userId, achievementId });
    return this.gameRepo.unlockAchievement(userId, achievementId);
  }

  /**
   * Get daily challenges
   */
  async getDailyChallenges(userId: string) {
    logger.debug('Getting daily challenges', { userId });
    return this.gameRepo.getDailyChallenges(userId);
  }

  /**
   * Complete a daily challenge
   */
  async completeChallenge(userId: string, challengeId: string, xpEarned: number) {
    logger.info('Completing challenge', { userId, challengeId, xpEarned });

    const result = await this.gameRepo.completeDailyChallenge(userId, challengeId, xpEarned);
    await this.gameRepo.addXp(userId, xpEarned);

    return result;
  }

  /**
   * Activate a power-up
   */
  async activatePowerUp(userId: string, input: unknown) {
    const validated = activatePowerUpSchema.parse(input);
    logger.info('Activating power-up', { userId, type: validated.powerUpType });

    const result = await this.gameRepo.usePowerUp(userId, validated.powerUpType);
    if (!result) {
      throw new UserInputError('No power-ups of this type available');
    }

    return result;
  }

  /**
   * Get gamification stats summary
   */
  async getStats(userId: string) {
    const profile = await this.gameRepo.getOrCreateProfile(userId);
    const achievements = await this.gameRepo.getUserAchievements(userId);

    return {
      level: profile.level,
      xp: profile.xp,
      xpToNextLevel: profile.level * 100 - profile.xp,
      streak: profile.currentStreak,
      longestStreak: profile.maxStreak,
      tasksCompleted: profile.totalTasksCompleted,
      achievementsUnlocked: achievements.length,
      powerUps: profile.activePowerUps,
    };
  }
}
