/**
 * Timer Context - Manages Pomodoro timer state and sessions
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  TimerState,
  PomodoroPhase,
  PomodoroSession,
  PomodoroSettings,
  TimerStats,
  DEFAULT_POMODORO_SETTINGS,
} from './types/timer.types';
import {
  getPhaseDuration,
  getNextPhase,
  calculateTimerStats,
  generateSessionId,
  playNotificationSound,
  showNotification,
  getPhaseLabel,
} from './utils/timeTracking';

interface TimerContextType {
  // Timer state
  timerState: TimerState;
  currentPhase: PomodoroPhase;
  timeRemaining: number;
  progress: number;

  // Settings
  settings: PomodoroSettings;

  // Stats
  stats: TimerStats;
  completedWorkSessions: number;

  // Current session
  currentSessionId: number | null;
  currentTaskId: number | null;

  // Actions
  startTimer: (taskId?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  skipPhase: () => void;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const STORAGE_KEY = 'taskflow_timer';

interface StoredTimerData {
  settings: PomodoroSettings;
  sessions: PomodoroSession[];
  completedWorkSessions: number;
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [currentPhase, setCurrentPhase] = useState<PomodoroPhase>('work');
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_POMODORO_SETTINGS.workDuration * 60);
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_POMODORO_SETTINGS);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [completedWorkSessions, setCompletedWorkSessions] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: StoredTimerData = JSON.parse(stored);
        setSettings(data.settings || DEFAULT_POMODORO_SETTINGS);
        setSessions(data.sessions || []);
        setCompletedWorkSessions(data.completedWorkSessions || 0);
      } catch (e) {
        console.error('Failed to load timer data:', e);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    const data: StoredTimerData = {
      settings,
      sessions,
      completedWorkSessions,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [settings, sessions, completedWorkSessions]);

  // Calculate progress
  const totalTime = getPhaseDuration(currentPhase, settings);
  const progress = ((totalTime - timeRemaining) / totalTime) * 100;

  // Calculate stats
  const stats = calculateTimerStats(sessions);

  // Handle phase completion - defined before useEffect that uses it
  const handlePhaseComplete = useCallback(() => {
    setTimerState('idle');

    // Mark current session as completed
    if (currentSessionId) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, endTime: Date.now(), completed: true }
            : s
        )
      );
    }

    // Play sound and show notification
    playNotificationSound();
    const phaseLabel = getPhaseLabel(currentPhase);
    showNotification(
      `${phaseLabel} Complete!`,
      currentPhase === 'work'
        ? 'Great job! Time for a break.'
        : 'Break is over. Ready to focus?'
    );

    // Update completed work sessions count
    if (currentPhase === 'work') {
      setCompletedWorkSessions((prev) => prev + 1);
    }

    // Move to next phase
    const nextPhase = getNextPhase(currentPhase, completedWorkSessions + (currentPhase === 'work' ? 1 : 0), settings);
    setCurrentPhase(nextPhase);
    setTimeRemaining(getPhaseDuration(nextPhase, settings));
    setCurrentSessionId(null);
  }, [currentPhase, currentSessionId, completedWorkSessions, settings]);

  // Store handlePhaseComplete in ref to avoid dependency issues
  const handlePhaseCompleteRef = useRef(handlePhaseComplete);
  handlePhaseCompleteRef.current = handlePhaseComplete;

  // Timer tick
  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Timer completed
            handlePhaseCompleteRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState]);

  // Start timer
  const startTimer = useCallback((taskId?: number) => {
    const sessionId = generateSessionId();
    const newSession: PomodoroSession = {
      id: sessionId,
      startTime: Date.now(),
      duration: 0,
      type: currentPhase,
      taskId,
      completed: false,
    };

    setSessions((prev) => [...prev, newSession]);
    setCurrentSessionId(sessionId);
    setCurrentTaskId(taskId || null);
    setTimerState('running');
  }, [currentPhase]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    setTimerState('paused');
  }, []);

  // Resume timer
  const resumeTimer = useCallback(() => {
    setTimerState('running');
  }, []);

  // Reset timer
  const resetTimer = useCallback(() => {
    setTimerState('idle');
    setTimeRemaining(getPhaseDuration(currentPhase, settings));
    setCurrentSessionId(null);
    setCurrentTaskId(null);
  }, [currentPhase, settings]);

  // Skip to next phase
  const skipPhase = useCallback(() => {
    // Cancel current session if exists
    if (currentSessionId) {
      setSessions((prev) => prev.filter((s) => s.id !== currentSessionId));
    }

    const nextPhase = getNextPhase(currentPhase, completedWorkSessions, settings);
    setCurrentPhase(nextPhase);
    setTimeRemaining(getPhaseDuration(nextPhase, settings));
    setTimerState('idle');
    setCurrentSessionId(null);
    setCurrentTaskId(null);
  }, [currentPhase, currentSessionId, completedWorkSessions, settings]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<PomodoroSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      // Update time remaining if timer is idle and work duration changed
      if (timerState === 'idle' && currentPhase === 'work' && newSettings.workDuration) {
        setTimeRemaining(updated.workDuration * 60);
      }
      return updated;
    });
  }, [timerState, currentPhase]);

  return (
    <TimerContext.Provider
      value={{
        timerState,
        currentPhase,
        timeRemaining,
        progress,
        settings,
        stats,
        completedWorkSessions,
        currentSessionId,
        currentTaskId,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        skipPhase,
        updateSettings,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
