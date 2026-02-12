/**
 * Gamification constants: XP, levels, achievements, power-ups, and challenges
 */

import { Achievement, DailyChallenge, PowerUp } from '../types';

// XP Configuration
export const XP_PER_LEVEL_BASE = 200;
export const XP_PER_TASK = 15;

// Power-up definitions
export const POWER_UPS: PowerUp[] = [
  {
    id: 'streak_x2',
    name: 'Streak Multiplier x2',
    description: 'Double XP for completed tasks when streak is active',
    icon: '🔥',
    active: false,
    multiplier: 2,
    duration: 30,
  },
  {
    id: 'bonus_x15',
    name: 'Bonus XP +15',
    description: 'Get +15 XP on every task completion',
    icon: '✨',
    active: false,
    multiplier: 1,
    duration: 60,
  },
  {
    id: 'streak_x3',
    name: 'Legendary Streak x3',
    description: 'Triple XP for ultra-hot streaks (14+ days)',
    icon: '⚡',
    active: false,
    multiplier: 3,
    duration: 15,
  },
  {
    id: 'focus_mode',
    name: 'Focus Mode',
    description: '2x XP for high priority tasks',
    icon: '🎯',
    active: false,
    multiplier: 2,
    duration: 45,
  },
];

// Achievement definitions
export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_step', title: 'First Step', description: 'Complete your first task', icon: '👋', unlocked: false, points: 50, unlockedAt: undefined },
  { id: 'collector', title: 'Task Collector', description: 'Complete 10 tasks total', icon: '📦', unlocked: false, points: 100, unlockedAt: undefined },
  { id: 'organizer', title: 'Organizer', description: 'Complete 25 tasks total', icon: '📋', unlocked: false, points: 200, unlockedAt: undefined },
  { id: 'master_doer', title: 'Master Doer', description: 'Complete 100 tasks total', icon: '⚔️', unlocked: false, points: 500, unlockedAt: undefined },
  { id: 'productivity_guru', title: 'Productivity Guru', description: 'Complete 250 tasks total', icon: '🎓', unlocked: false, points: 1000, unlockedAt: undefined },
  { id: 'legendary', title: 'Legendary', description: 'Complete 500 tasks total', icon: '🌟', unlocked: false, points: 2500, unlockedAt: undefined },
  { id: 'streak_start', title: 'Streak Starter', description: 'Maintain a 3-day streak', icon: '🔥', unlocked: false, points: 100, unlockedAt: undefined },
  { id: 'streak_master', title: 'Streak Master', description: 'Maintain a 7-day streak', icon: '⚡', unlocked: false, points: 250, unlockedAt: undefined },
  { id: 'streak_master_2', title: 'Streak Grandmaster', description: 'Maintain a 14-day streak', icon: '💎', unlocked: false, points: 500, unlockedAt: undefined },
  { id: 'streak_legend', title: 'Streak Legend', description: 'Maintain a 30-day streak', icon: '👑', unlocked: false, points: 1000, unlockedAt: undefined },
  { id: 'streak_immortal', title: 'Streak Immortal', description: 'Maintain a 60-day streak', icon: '🚀', unlocked: false, points: 2500, unlockedAt: undefined },
  { id: 'early_bird', title: 'Early Bird', description: 'Complete a task before 9 AM', icon: '🌅', unlocked: false, points: 75, unlockedAt: undefined },
  { id: 'night_owl', title: 'Night Owl', description: 'Complete a task after 9 PM', icon: '🌙', unlocked: false, points: 75, unlockedAt: undefined },
  { id: 'high_performer', title: 'High Performer', description: 'Complete 5 high priority tasks', icon: '🎯', unlocked: false, points: 150, unlockedAt: undefined },
  { id: 'high_master', title: 'High Master', description: 'Complete 20 high priority tasks', icon: '🔥', unlocked: false, points: 400, unlockedAt: undefined },
];

// Daily challenge definitions
export const INITIAL_CHALLENGES: DailyChallenge[] = [
  { id: 'daily_1', title: 'Morning Boost', description: 'Complete 2 tasks by 12 PM', target: 2, current: 0, completed: false, reward: 50, icon: '☀️' },
  { id: 'daily_2', title: 'Afternoon Push', description: 'Complete 3 tasks by 6 PM', target: 3, current: 0, completed: false, reward: 75, icon: '⚡' },
  { id: 'daily_3', title: 'Evening Wind Down', description: 'Complete 1 more task today', target: 1, current: 0, completed: false, reward: 25, icon: '🌙' },
];
