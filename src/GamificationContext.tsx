import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  Achievement,
  DailyChallenge,
  PowerUp,
  GameData,
  StreakBadge,
  GamificationContextValue,
} from './types';
import {
  XP_PER_LEVEL_BASE,
  XP_PER_TASK,
  POWER_UPS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_CHALLENGES,
} from './constants/gamification';
import { LEVEL_GRADIENTS, LEVEL_COLORS } from './constants/colors';

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
  const prevLevelXP = Math.floor(XP_PER_LEVEL_BASE * (Math.pow(1.5, level - 1) - 1) / 0.5);
  const xpInCurrentLevel = xp - prevLevelXP;
  return Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeeded) * 100));
}

export function getStreakBadge(streak: number): StreakBadge {
  if (streak >= 60) return { color: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white', emoji: '👑', multiplier: 5 };
  if (streak >= 30) return { color: 'bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-600 text-white', emoji: '💎', multiplier: 4 };
  if (streak >= 14) return { color: 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white', emoji: '🔥', multiplier: 3 };
  if (streak >= 7) return { color: 'bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 text-white', emoji: '⚡', multiplier: 2 };
  if (streak >= 3) return { color: 'bg-gradient-to-r from-red-400 via-rose-500 to-pink-500 text-white', emoji: '⚡', multiplier: 1.5 };
  return { color: 'bg-gradient-to-r from-slate-400 to-slate-500 text-white', emoji: '✨', multiplier: 1 };
}

export function getLevelGradient(level: number): string {
  const levelMod = ((level - 1) % 10) + 1;
  return LEVEL_GRADIENTS[levelMod] || 'from-slate-500 to-slate-600';
}

export function getLevelColor(level: number): string {
  return LEVEL_COLORS[(level - 1) % LEVEL_COLORS.length];
}

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [gameData, setGameData] = useState<GameData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gameData');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const today = new Date().toDateString();
          if (parsed.lastLogin !== today) {
            const now = Date.now();
            const newPowerUps = parsed.powerUps?.map((p: PowerUp) => ({
              ...p,
              active: p.active && (!p.expiresAt || p.expiresAt > now),
            })) || POWER_UPS.map(p => ({ ...p, active: false }));

            return {
              ...parsed,
              completedTasksToday: 0,
              dailyChallenges: parsed.dailyChallenges?.map((c: DailyChallenge) => ({
                ...c,
                completed: false,
                current: c.id === 'daily_1' || c.id === 'daily_2' ? 0 : c.current,
                target: c.id === 'daily_3' ? 1 : c.target
              })),
              lastLogin: today,
              powerUps: newPowerUps,
            };
          }
          return parsed;
        } catch (e) {
          console.error('Failed to load game data:', e);
        }
      }
    }
    return {
      xp: 0,
      level: 1,
      streak: 0,
      lastLogin: null,
      totalTasksCompleted: 0,
      completedTasksToday: 0,
      achievements: INITIAL_ACHIEVEMENTS,
      dailyChallenges: INITIAL_CHALLENGES,
      sessionStart: Date.now(),
      maxStreak: 0,
      powerUps: POWER_UPS.map(p => ({ ...p, active: false })),
      lastStreakReward: null,
    };
  });

  // Migrate old saved data to include powerUps
  useEffect(() => {
    const saved = localStorage.getItem('gameData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.powerUps) {
          const updated = {
            ...parsed,
            powerUps: POWER_UPS.map(p => ({ ...p, active: false })),
            dailyChallenges: parsed.dailyChallenges || INITIAL_CHALLENGES,
          };
          localStorage.setItem('gameData', JSON.stringify(updated));
          setGameData(updated);
        }
      } catch (e) {
        console.error('Failed to migrate game data:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gameData', JSON.stringify(gameData));
  }, [gameData]);

  const unlockAchievement = (achievementId: string) => {
    setGameData((prev) => {
      const existing = prev.achievements.find(a => a.id === achievementId);
      if (!existing || existing.unlocked) return prev;

      const updatedAchievements = prev.achievements.map(a =>
        a.id === achievementId
          ? { ...a, unlocked: true, unlockedAt: Date.now() }
          : a
      );

      return {
        ...prev,
        xp: prev.xp + existing.points,
        achievements: updatedAchievements,
      };
    });
  };

  const activatePowerUp = (powerUpId: string) => {
    setGameData((prev) => {
      const powerUpIndex = prev.powerUps.findIndex(p => p.id === powerUpId);
      if (powerUpIndex === -1) return prev;

      const powerUp = prev.powerUps[powerUpIndex];
      const now = Date.now();
      const expiresAt = now + powerUp.duration * 60 * 1000;

      const newPowerUps = [...prev.powerUps];
      newPowerUps[powerUpIndex] = { ...powerUp, active: true, expiresAt, activatedAt: now };

      return { ...prev, powerUps: newPowerUps };
    });
  };

  const deactivatePowerUp = (powerUpId: string) => {
    setGameData((prev) => {
      const powerUpIndex = prev.powerUps.findIndex(p => p.id === powerUpId);
      if (powerUpIndex === -1) return prev;

      const powerUp = prev.powerUps[powerUpIndex];
      const newPowerUps = [...prev.powerUps];
      newPowerUps[powerUpIndex] = { ...powerUp, active: false, expiresAt: undefined, activatedAt: undefined };

      return { ...prev, powerUps: newPowerUps };
    });
  };

  const checkActivePowerUps = () => {
    const now = Date.now();
    setGameData((prev) => {
      const newPowerUps = prev.powerUps.map(p => ({
        ...p,
        active: p.active && (!p.expiresAt || p.expiresAt > now),
      }));
      return { ...prev, powerUps: newPowerUps };
    });
  };

  useEffect(() => {
    checkActivePowerUps();
    const interval = setInterval(checkActivePowerUps, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkAchievements = (totalCompleted: number, todayCompleted: number, highPriorityCount: number) => {
    const now = new Date();
    const hour = now.getHours();

    if (totalCompleted >= 1) unlockAchievement('first_step');
    if (totalCompleted >= 10) unlockAchievement('collector');
    if (totalCompleted >= 25) unlockAchievement('organizer');
    if (totalCompleted >= 100) unlockAchievement('master_doer');
    if (totalCompleted >= 250) unlockAchievement('productivity_guru');
    if (totalCompleted >= 500) unlockAchievement('legendary');

    if (gameData.streak >= 3) unlockAchievement('streak_start');
    if (gameData.streak >= 7) unlockAchievement('streak_master');
    if (gameData.streak >= 14) unlockAchievement('streak_master_2');
    if (gameData.streak >= 30) unlockAchievement('streak_legend');
    if (gameData.streak >= 60) unlockAchievement('streak_immortal');

    if (hour < 9) unlockAchievement('early_bird');
    if (hour >= 21) unlockAchievement('night_owl');
    if (highPriorityCount >= 5) unlockAchievement('high_performer');
    if (highPriorityCount >= 20) unlockAchievement('high_master');
  };

  const completeTask = (isHighPriority: boolean = false) => {
    checkActivePowerUps();

    setGameData((prev) => {
      const streakInfo = getStreakBadge(prev.streak);
      let multiplier = streakInfo.multiplier;

      prev.powerUps.forEach(p => {
        if (p.active && p.id === 'streak_x2') multiplier *= p.multiplier;
        if (p.active && p.id === 'streak_x3') multiplier *= p.multiplier;
      });

      let baseXp = XP_PER_TASK;

      const bonusXpPowerUp = prev.powerUps.find(p => p.id === 'bonus_x15');
      if (bonusXpPowerUp?.active) {
        baseXp += 15;
      }

      const focusMode = prev.powerUps.find(p => p.id === 'focus_mode');
      if (isHighPriority && !focusMode?.active) {
        baseXp *= 1.5;
      }
      if (isHighPriority && focusMode?.active) {
        baseXp *= focusMode.multiplier;
      }

      const newXp = prev.xp + Math.floor(baseXp * multiplier);
      const newLevel = getLevelFromXP(newXp);

      const newMaxStreak = Math.max(prev.maxStreak, prev.streak);

      let xpBonus = 0;
      if (newLevel > prev.level) {
        xpBonus = 100 + (newLevel * 50);
      }

      const finalXp = newXp + xpBonus;

      return {
        ...prev,
        xp: finalXp,
        level: newLevel,
        totalTasksCompleted: prev.totalTasksCompleted + 1,
        completedTasksToday: prev.completedTasksToday + 1,
        maxStreak: newMaxStreak,
        sessionStart: Date.now(),
      };
    });
  };

  const incrementStreak = () => {
    setGameData((prev) => ({
      ...prev,
      streak: prev.streak + 1,
    }));
  };

  const resetStreak = () => {
    setGameData((prev) => ({ ...prev, streak: 0 }));
  };

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
    <GamificationContext.Provider value={contextValue}>
      {children}
    </GamificationContext.Provider>
  );
}

const GamificationContext = createContext<GamificationContextValue | undefined>(undefined);

export function useGame() {
  const context = useContext(GamificationContext);
  if (!context) throw new Error('useGame must be used within GamificationProvider');
  return context;
}
