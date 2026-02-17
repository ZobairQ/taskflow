/**
 * Timer types for Pomodoro and time tracking
 */

export type TimerState = 'idle' | 'running' | 'paused';

export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  workDuration: number;       // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number;  // minutes
  sessionsBeforeLongBreak: number;
}

export interface PomodoroSession {
  id: string;
  startTime: number;
  endTime?: number;
  duration: number;      // seconds
  type: PomodoroPhase;
  taskId?: string;       // Associated task
  completed: boolean;
}

export interface TimeSession {
  id: string;
  startTime: number;
  endTime?: number;
  duration: number;      // minutes
  taskId: string;
}

export interface TimerStats {
  todayMinutes: number;
  weekMinutes: number;
  totalSessions: number;
  currentStreak: number;       // Consecutive days with at least one session
  averageSessionLength: number;
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
};
