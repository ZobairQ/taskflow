/**
 * Time tracking utility functions
 */

import {
  PomodoroSettings,
  PomodoroPhase,
  PomodoroSession,
  TimerStats,
} from '../types/timer.types';

/**
 * Format seconds to MM:SS display
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format minutes to human readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Get phase duration in seconds based on settings
 */
export function getPhaseDuration(phase: PomodoroPhase, settings: PomodoroSettings): number {
  switch (phase) {
    case 'work':
      return settings.workDuration * 60;
    case 'shortBreak':
      return settings.shortBreakDuration * 60;
    case 'longBreak':
      return settings.longBreakDuration * 60;
    default:
      return settings.workDuration * 60;
  }
}

/**
 * Calculate the next phase after completing current phase
 */
export function getNextPhase(
  currentPhase: PomodoroPhase,
  completedWorkSessions: number,
  settings: PomodoroSettings
): PomodoroPhase {
  if (currentPhase === 'work') {
    // After work, take a break
    if (completedWorkSessions % settings.sessionsBeforeLongBreak === 0) {
      return 'longBreak';
    }
    return 'shortBreak';
  }
  // After break, always return to work
  return 'work';
}

/**
 * Get phase label for display
 */
export function getPhaseLabel(phase: PomodoroPhase): string {
  switch (phase) {
    case 'work':
      return 'Focus Time';
    case 'shortBreak':
      return 'Short Break';
    case 'longBreak':
      return 'Long Break';
    default:
      return 'Focus Time';
  }
}

/**
 * Get color for phase
 */
export function getPhaseColor(phase: PomodoroPhase): string {
  switch (phase) {
    case 'work':
      return 'from-rose-500 to-orange-500';
    case 'shortBreak':
      return 'from-emerald-500 to-teal-500';
    case 'longBreak':
      return 'from-blue-500 to-indigo-500';
    default:
      return 'from-rose-500 to-orange-500';
  }
}

/**
 * Calculate timer statistics from sessions
 */
export function calculateTimerStats(sessions: PomodoroSession[]): TimerStats {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Filter completed work sessions
  const completedWorkSessions = sessions.filter(
    (s) => s.type === 'work' && s.completed
  );

  // Today's minutes
  const todaySessions = completedWorkSessions.filter((s) => {
    const sessionDate = new Date(s.startTime);
    return sessionDate >= today;
  });
  const todayMinutes = Math.round(
    todaySessions.reduce((acc, s) => acc + s.duration, 0) / 60
  );

  // Week's minutes
  const weekSessions = completedWorkSessions.filter((s) => {
    const sessionDate = new Date(s.startTime);
    return sessionDate >= weekAgo;
  });
  const weekMinutes = Math.round(
    weekSessions.reduce((acc, s) => acc + s.duration, 0) / 60
  );

  // Calculate streak (consecutive days with at least one session)
  const sessionDays = new Set<string>();
  completedWorkSessions.forEach((s) => {
    const date = new Date(s.startTime).toDateString();
    sessionDays.add(date);
  });

  let currentStreak = 0;
  let checkDate = new Date(today);
  while (sessionDays.has(checkDate.toDateString())) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Average session length
  const avgSession =
    completedWorkSessions.length > 0
      ? Math.round(
          completedWorkSessions.reduce((acc, s) => acc + s.duration, 0) /
            completedWorkSessions.length /
            60
        )
      : 0;

  return {
    todayMinutes,
    weekMinutes,
    totalSessions: completedWorkSessions.length,
    currentStreak,
    averageSessionLength: avgSession,
  };
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): number {
  return Date.now() + Math.random();
}

/**
 * Play notification sound
 */
export function playNotificationSound(): void {
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (e) {
    // Audio not supported or blocked
    console.log('Audio notification not available');
  }
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Show browser notification
 */
export function showNotification(title: string, body: string): void {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
  }
}
