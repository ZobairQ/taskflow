/**
 * Timer Context - Manages Pomodoro timer state and sessions with Apollo integration
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
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
import { GET_TIMER_SESSIONS, GET_TIMER_STATS } from './graphql/queries';
import { START_TIMER, PAUSE_TIMER, COMPLETE_TIMER, SKIP_PHASE } from './graphql/mutations';
import { isAuthenticated } from './lib/apollo';

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
  currentSessionId: string | null;
  currentTaskId: string | null;

  // Actions
  startTimer: (taskId?: string) => void;
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
  completedWorkSessions: number;
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  // Local UI state - these remain local for real-time responsiveness
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [currentPhase, setCurrentPhase] = useState<PomodoroPhase>('work');
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_POMODORO_SETTINGS.workDuration * 60);
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_POMODORO_SETTINGS);
  const [completedWorkSessions, setCompletedWorkSessions] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  // Track server session ID for Apollo mutations
  const [serverSessionId, setServerSessionId] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Type for timer stats query result
  interface TimerStatsQueryResult {
    timerStats: {
      todayMinutes: number;
      weekMinutes: number;
      totalSessions: number;
      currentStreak: number;
      averageSessionLength: number;
    };
  }

  // Apollo queries for historical data (only when authenticated)
  const { data: sessionsData } = useQuery(GET_TIMER_SESSIONS, {
    skip: !isAuthenticated(),
    fetchPolicy: 'cache-and-network',
  });

  const { data: statsData } = useQuery<TimerStatsQueryResult>(GET_TIMER_STATS, {
    skip: !isAuthenticated(),
    fetchPolicy: 'cache-and-network',
  });

  // Apollo mutations
  interface StartTimerResult {
    startTimer: {
      id: string;
    };
  }

  const [startTimerMutation] = useMutation<StartTimerResult>(START_TIMER, {
    refetchQueries: [{ query: GET_TIMER_SESSIONS }, { query: GET_TIMER_STATS }],
  });

  const [pauseTimerMutation] = useMutation(PAUSE_TIMER, {
    refetchQueries: [{ query: GET_TIMER_SESSIONS }],
  });

  const [completeTimerMutation] = useMutation(COMPLETE_TIMER, {
    refetchQueries: [{ query: GET_TIMER_SESSIONS }, { query: GET_TIMER_STATS }],
  });

  const [skipPhaseMutation] = useMutation(SKIP_PHASE, {
    refetchQueries: [{ query: GET_TIMER_SESSIONS }],
  });

  // Load settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: StoredTimerData = JSON.parse(stored);
        setSettings(data.settings || DEFAULT_POMODORO_SETTINGS);
        setCompletedWorkSessions(data.completedWorkSessions || 0);
      } catch (e) {
        console.error('Failed to load timer data:', e);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    const data: StoredTimerData = {
      settings,
      completedWorkSessions,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [settings, completedWorkSessions]);

  // Calculate progress
  const totalTime = getPhaseDuration(currentPhase, settings);
  const progress = ((totalTime - timeRemaining) / totalTime) * 100;

  // Calculate stats - use server data if available, otherwise local
  const localSessions: PomodoroSession[] = []; // Local sessions are transient
  const stats = isAuthenticated() && statsData?.timerStats
    ? {
        todayMinutes: statsData.timerStats.todayMinutes || 0,
        weekMinutes: statsData.timerStats.weekMinutes || 0,
        totalSessions: statsData.timerStats.totalSessions || 0,
        currentStreak: statsData.timerStats.currentStreak || 0,
        averageSessionLength: statsData.timerStats.averageSessionLength || 0,
      }
    : calculateTimerStats(localSessions);

  // Handle phase completion
  const handlePhaseComplete = useCallback(async () => {
    setTimerState('idle');

    // Play sound and show notification
    playNotificationSound();
    const phaseLabel = getPhaseLabel(currentPhase);
    showNotification(
      `${phaseLabel} Complete!`,
      currentPhase === 'work'
        ? 'Great job! Time for a break.'
        : 'Break is over. Ready to focus?'
    );

    // Complete timer on server
    if (serverSessionId && isAuthenticated()) {
      try {
        await completeTimerMutation({
          variables: { sessionId: serverSessionId },
        });
      } catch (error) {
        console.error('Failed to complete timer on server:', error);
      }
    }

    // Update completed work sessions count
    if (currentPhase === 'work') {
      setCompletedWorkSessions((prev) => prev + 1);
    }

    // Move to next phase
    const nextPhase = getNextPhase(currentPhase, completedWorkSessions + (currentPhase === 'work' ? 1 : 0), settings);
    setCurrentPhase(nextPhase);
    setTimeRemaining(getPhaseDuration(nextPhase, settings));
    setCurrentSessionId(null);
    setServerSessionId(null);
  }, [currentPhase, completedWorkSessions, settings, serverSessionId, completeTimerMutation]);

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
  const startTimer = useCallback(async (taskId?: string) => {
    const sessionId = generateSessionId();

    // Start timer on server if authenticated
    if (isAuthenticated()) {
      try {
        const result = await startTimerMutation({
          variables: {
            taskId: taskId || undefined,
            type: currentPhase.toUpperCase() as 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK',
          },
        });
        if (result.data?.startTimer) {
          setServerSessionId(result.data.startTimer.id);
        }
      } catch (error) {
        console.error('Failed to start timer on server:', error);
      }
    }

    setCurrentSessionId(sessionId);
    setCurrentTaskId(taskId || null);
    setTimerState('running');
  }, [currentPhase, startTimerMutation]);

  // Pause timer
  const pauseTimer = useCallback(async () => {
    setTimerState('paused');

    // Pause timer on server if authenticated
    if (serverSessionId && isAuthenticated()) {
      try {
        await pauseTimerMutation({
          variables: { sessionId: serverSessionId },
        });
      } catch (error) {
        console.error('Failed to pause timer on server:', error);
      }
    }
  }, [serverSessionId, pauseTimerMutation]);

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
    setServerSessionId(null);
  }, [currentPhase, settings]);

  // Skip to next phase
  const skipPhase = useCallback(async () => {
    // Skip phase on server if authenticated
    if (serverSessionId && isAuthenticated()) {
      try {
        await skipPhaseMutation({
          variables: { sessionId: serverSessionId },
        });
      } catch (error) {
        console.error('Failed to skip phase on server:', error);
      }
    }

    const nextPhase = getNextPhase(currentPhase, completedWorkSessions, settings);
    setCurrentPhase(nextPhase);
    setTimeRemaining(getPhaseDuration(nextPhase, settings));
    setTimerState('idle');
    setCurrentSessionId(null);
    setCurrentTaskId(null);
    setServerSessionId(null);
  }, [currentPhase, completedWorkSessions, settings, serverSessionId, skipPhaseMutation]);

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
