/**
 * Gamification Input Validators
 */

import { z } from 'zod';

// Power-up types
export const powerUpTypeSchema = z.enum([
  'streak_freeze',
  'xp_boost',
  'priority_task',
  'focus_mode',
  'extra_challenge',
]);

// Activate power-up schema
export const activatePowerUpSchema = z.object({
  powerUpType: powerUpTypeSchema,
  taskId: z.string().optional(), // Required for some power-ups like priority_task
});

// Complete challenge schema
export const completeChallengeSchema = z.object({
  challengeId: z.string().min(1, 'Challenge ID is required'),
});

// Claim achievement schema
export const claimAchievementSchema = z.object({
  achievementId: z.string().min(1, 'Achievement ID is required'),
});

// Daily challenge filter
export const dailyChallengeFilterSchema = z.object({
  date: z.string().datetime().optional(),
  status: z.enum(['pending', 'completed', 'failed']).optional(),
});

export type PowerUpType = z.infer<typeof powerUpTypeSchema>;
export type ActivatePowerUpInput = z.infer<typeof activatePowerUpSchema>;
export type CompleteChallengeInput = z.infer<typeof completeChallengeSchema>;
export type ClaimAchievementInput = z.infer<typeof claimAchievementSchema>;
export type DailyChallengeFilterInput = z.infer<typeof dailyChallengeFilterSchema>;
