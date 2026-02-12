/**
 * Gamification-related type definitions
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  points: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  reward: number;
  icon: string;
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  multiplier: number;
  duration: number; // in minutes
  expiresAt?: number;
  activatedAt?: number;
}

export interface GameData {
  xp: number;
  level: number;
  streak: number;
  lastLogin: string | null;
  totalTasksCompleted: number;
  completedTasksToday: number;
  achievements: Achievement[];
  dailyChallenges: DailyChallenge[];
  sessionStart: number;
  maxStreak: number;
  powerUps: PowerUp[];
  lastStreakReward: string | null;
}

export interface StreakBadge {
  color: string;
  emoji: string;
  multiplier: number;
}

export interface GamificationContextValue {
  gameData: GameData;
  completeTask: (isHighPriority?: boolean) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  checkAchievements: (total: number, today: number, highPriority: number) => void;
  getLevelColor: (level: number) => string;
  getStreakBadge: (streak: number) => StreakBadge;
  getLevelFromXP: (xp: number) => number;
  getXpProgress: (level: number, xp: number) => number;
  activatePowerUp: (id: string) => void;
  deactivatePowerUp: (id: string) => void;
  getLevelGradient: (level: number) => string;
  powerUps: PowerUp[];
}
