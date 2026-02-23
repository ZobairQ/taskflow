import React, { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Achievement,
  DailyChallenge,
  PowerUp,
  GameData,
  StreakBadge,
  GamificationContextValue,
} from './types';
import { XP_PER_LEVEL_BASE, XP_PER_TASK } from './constants/gamification';
import { LEVEL_GRADIENTS, LEVEL_COLORS } from './constants/colors';
import { GET_GAME_PROFILE } from './graphql/queries';
import { ACTIVATE_POWER_UP, DEACTIVATE_POWER_UP } from './graphql/mutations';
import { isAuthenticated } from './lib/apollo';

// Types for GraphQL response
interface AchievementResponse {
  achievement: {
    id: string;
    title: string;
    description: string;
    icon: string;
    points: number;
    category: string;
  };
  unlockedAt?: string | null;
}

interface DailyChallengeResponse {
  challenge: {
    id: string;
    title: string;
    description: string;
    target: number;
    reward: number;
    icon: string;
  };
  current: number;
  completed: boolean;
}

interface PowerUpResponse {
  id: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  multiplier: number;
  duration?: number;
  expiresAt?: string | null;
}

// Re-export types and utilities for backward compatibility
export type { Achievement, DailyChallenge, PowerUp, GameData, StreakBadge };
export { XP_PER_LEVEL_BASE, XP_PER_TASK };

export function getLevelFromXP(xp: number): number {
  let level = 1;
  let totalXP = 0;

  while (true) {
    const xpNeeded = Math.floor(XP_PER_LEVEL_BASE * Math.pow(1.5, level - 1));
    if (totalXP + xpNeeded > xp) {
      break;
    }
    totalXP += xpNeeded;
    level++;
  }
  return level;
}

export function getXpProgress(level: number, xp: number): number {
  const xpNeeded = Math.floor(XP_PER_LEVEL_BASE * Math.pow(1.5, level - 1));
  const prevLevelXP = Math.floor((XP_PER_LEVEL_BASE * (Math.pow(1.5, level - 1) - 1)) / 0.5);
  const xpInCurrentLevel = xp - prevLevelXP;
  return Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeeded) * 100));
}

export function getStreakBadge(streak: number): StreakBadge {
  if (streak >= 60)
    return {
      color: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white',
      emoji: '👑',
      multiplier: 5,
    };
  if (streak >= 30)
    return {
      color: 'bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-600 text-white',
      emoji: '💎',
      multiplier: 4,
    };
  if (streak >= 14)
    return {
      color: 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white',
      emoji: '🔥',
      multiplier: 3,
    };
  if (streak >= 7)
    return {
      color: 'bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 text-white',
      emoji: '⚡',
      multiplier: 2,
    };
  if (streak >= 3)
    return {
      color: 'bg-gradient-to-r from-red-400 via-rose-500 to-pink-500 text-white',
      emoji: '⚡',
      multiplier: 1.5,
    };
  return {
    color: 'bg-gradient-to-r from-slate-400 to-slate-500 text-white',
    emoji: '✨',
    multiplier: 1,
  };
}

export function getLevelGradient(level: number): string {
  const levelMod = ((level - 1) % 10) + 1;
  return LEVEL_GRADIENTS[levelMod] || 'from-slate-500 to-slate-600';
}

export function getLevelColor(level: number): string {
  return LEVEL_COLORS[(level - 1) % LEVEL_COLORS.length];
}

// Default game data for unauthenticated users
const DEFAULT_GAME_DATA: GameData = {
  xp: 0,
  level: 1,
  streak: 0,
  lastLogin: null,
  totalTasksCompleted: 0,
  completedTasksToday: 0,
  achievements: [],
  dailyChallenges: [],
  sessionStart: Date.now(),
  maxStreak: 0,
  powerUps: [],
  lastStreakReward: null,
};

// Type for GraphQL query results
interface GameProfileQueryResult {
  gameProfile: {
    xp: number;
    level: number;
    currentStreak: number;
    lastStreakDate?: string;
    totalTasksCompleted: number;
    completedTasksToday: number;
    maxStreak: number;
    achievements?: Array<{
      unlockedAt?: string;
      achievement: {
        id: string;
        title: string;
        description: string;
        icon: string;
        points: number;
        category: string;
      };
    }>;
    dailyChallenges?: Array<{
      current: number;
      completed: boolean;
      challenge: {
        id: string;
        title: string;
        description: string;
        target: number;
        reward: number;
        icon: string;
      };
    }>;
    activePowerUps?: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      active: boolean;
      multiplier: number;
      duration?: number;
      expiresAt?: string;
    }>;
  };
}

export function GamificationProvider({ children }: { children: ReactNode }) {
  // Query game profile from server
  const {
    data: gameProfileData,
    loading,
    refetch: refetchGameProfile,
  } = useQuery<GameProfileQueryResult>(GET_GAME_PROFILE, {
    skip: !isAuthenticated(),
    fetchPolicy: 'cache-and-network',
    pollInterval: 60000, // Refresh every minute to check power-up expirations
  });

  // Power up mutations
  const [activatePowerUpMutation] = useMutation(ACTIVATE_POWER_UP, {
    refetchQueries: [{ query: GET_GAME_PROFILE }],
  });

  const [deactivatePowerUpMutation] = useMutation(DEACTIVATE_POWER_UP, {
    refetchQueries: [{ query: GET_GAME_PROFILE }],
  });

  // Transform Apollo data to GameData format
  const transformToGameData = (): GameData => {
    if (!gameProfileData?.gameProfile) {
      return DEFAULT_GAME_DATA;
    }

    const profile = gameProfileData.gameProfile;

    // Transform achievements from server format
    const achievements: Achievement[] =
      profile.achievements?.map((ua: AchievementResponse) => ({
        id: ua.achievement.id,
        title: ua.achievement.title,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        unlocked: true,
        unlockedAt: ua.unlockedAt ? new Date(ua.unlockedAt).getTime() : undefined,
        points: ua.achievement.points,
        category: ua.achievement.category as Achievement['category'],
      })) || [];

    // Transform daily challenges from server format
    const dailyChallenges: DailyChallenge[] =
      profile.dailyChallenges?.map((dc: DailyChallengeResponse) => ({
        id: dc.challenge.id,
        title: dc.challenge.title,
        description: dc.challenge.description,
        target: dc.challenge.target,
        current: dc.current,
        completed: dc.completed,
        reward: dc.challenge.reward,
        icon: dc.challenge.icon,
      })) || [];

    // Transform power-ups from server format
    const powerUps: PowerUp[] =
      profile.activePowerUps?.map((p: PowerUpResponse) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        icon: p.icon,
        active: p.active,
        multiplier: p.multiplier,
        duration: p.duration ?? 0,
        expiresAt: p.expiresAt ? new Date(p.expiresAt).getTime() : undefined,
      })) || [];

    return {
      xp: profile.xp || 0,
      level: profile.level || 1,
      streak: profile.currentStreak || 0,
      lastLogin: profile.lastStreakDate || null,
      totalTasksCompleted: profile.totalTasksCompleted || 0,
      completedTasksToday: profile.completedTasksToday || 0,
      achievements,
      dailyChallenges,
      sessionStart: Date.now(),
      maxStreak: profile.maxStreak || 0,
      powerUps,
      lastStreakReward: null,
    };
  };

  const gameData = transformToGameData();

  // Complete task - with Apollo, this is handled by the backend when task is completed
  // This function is kept for backward compatibility but primarily triggers a refetch
  const completeTask = (_isHighPriority: boolean = false) => {
    // The actual XP/level calculation happens on the backend
    // Just refetch the game profile to get updated data
    if (isAuthenticated()) {
      refetchGameProfile();
    }
  };

  // Streak functions - handled by backend
  const incrementStreak = () => {
    // Handled by backend - just refetch
    if (isAuthenticated()) {
      refetchGameProfile();
    }
  };

  const resetStreak = () => {
    // Handled by backend - just refetch
    if (isAuthenticated()) {
      refetchGameProfile();
    }
  };

  // Activate power up
  const activatePowerUp = async (powerUpId: string) => {
    try {
      await activatePowerUpMutation({
        variables: { id: powerUpId },
      });
    } catch (error) {
      console.error('Failed to activate power up:', error);
    }
  };

  // Deactivate power up
  const deactivatePowerUp = async (powerUpId: string) => {
    try {
      await deactivatePowerUpMutation({
        variables: { id: powerUpId },
      });
    } catch (error) {
      console.error('Failed to deactivate power up:', error);
    }
  };

  // Check achievements - handled by backend
  const checkAchievements = (_total: number, _today: number, _highPriority: number) => {
    // Achievements are checked on the backend when tasks are completed
    // Just refetch to get the latest state
    if (isAuthenticated()) {
      refetchGameProfile();
    }
  };

  // Refetch on window focus to ensure data is fresh
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated()) {
        refetchGameProfile();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchGameProfile]);

  const contextValue: GamificationContextValue = {
    gameData,
    completeTask,
    incrementStreak,
    resetStreak,
    checkAchievements,
    getLevelColor,
    getStreakBadge,
    getLevelFromXP,
    getXpProgress,
    activatePowerUp,
    deactivatePowerUp,
    getLevelGradient,
    powerUps: gameData.powerUps,
  };

  return (
    <GamificationContext.Provider value={contextValue}>{children}</GamificationContext.Provider>
  );
}

const GamificationContext = createContext<GamificationContextValue | undefined>(undefined);

export function useGame() {
  const context = useContext(GamificationContext);
  if (!context) throw new Error('useGame must be used within GamificationProvider');
  return context;
}
