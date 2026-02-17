/**
 * useAnalytics - Hook for computing and managing analytics data
 */

import { useState, useMemo, useCallback } from 'react';
import { Task } from '../types/task.types';
import {
  DateRange,
  ProductivityMetrics,
  TimeTrackingMetrics,
  CategoryMetrics,
  PriorityMetrics,
  DailyMetrics,
} from '../types/analytics.types';
import {
  getDateRange,
  calculateProductivityMetrics,
  calculateTimeTrackingMetrics,
  calculateCategoryMetrics,
  calculatePriorityMetrics,
  generateInsights,
} from '../utils/analytics/calculations';

interface FocusSession {
  date: number;
  duration: number;
  category?: string;
}

interface UseAnalyticsOptions {
  tasks: Task[];
  focusSessions?: FocusSession[];
  initialRange?: DateRange;
}

interface UseAnalyticsReturn {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  customStart: Date | null;
  customEnd: Date | null;
  setCustomRange: (start: Date, end: Date) => void;
  productivity: ProductivityMetrics;
  timeTracking: TimeTrackingMetrics;
  categories: CategoryMetrics[];
  priorities: PriorityMetrics[];
  insights: string[];
  dailyMetrics: DailyMetrics[];
  isLoading: boolean;
  refresh: () => void;
}

export function useAnalytics(options: UseAnalyticsOptions): UseAnalyticsReturn {
  const { tasks, focusSessions = [], initialRange = 'week' } = options;

  const [dateRange, setDateRange] = useState<DateRange>(initialRange);
  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setCustomRange = useCallback((start: Date, end: Date) => {
    setCustomStart(start);
    setCustomEnd(end);
    setDateRange('custom');
  }, []);

  const refresh = useCallback(() => {
    setIsLoading(true);
    // Simulate async refresh - in real app, might fetch from API
    setTimeout(() => setIsLoading(false), 100);
  }, []);

  // Calculate all metrics when dependencies change
  const metrics = useMemo(() => {
    const productivity = calculateProductivityMetrics(
      tasks,
      dateRange,
      customStart || undefined,
      customEnd || undefined
    );

    const timeTracking = calculateTimeTrackingMetrics(
      focusSessions,
      dateRange,
      customStart || undefined,
      customEnd || undefined
    );

    const range = getDateRange(dateRange, customStart || undefined, customEnd || undefined);
    const filteredTasks = tasks.filter(
      t => new Date(t.createdAt).getTime() >= range.start.getTime() && new Date(t.createdAt).getTime() <= range.end.getTime()
    );

    const categories = calculateCategoryMetrics(filteredTasks);
    const priorities = calculatePriorityMetrics(filteredTasks);
    const insights = generateInsights(productivity, categories, timeTracking);

    return {
      productivity,
      timeTracking,
      categories,
      priorities,
      insights,
      dailyMetrics: productivity.dailyBreakdown,
    };
  }, [tasks, focusSessions, dateRange, customStart, customEnd]);

  return {
    dateRange,
    setDateRange,
    customStart,
    customEnd,
    setCustomRange,
    productivity: metrics.productivity,
    timeTracking: metrics.timeTracking,
    categories: metrics.categories,
    priorities: metrics.priorities,
    insights: metrics.insights,
    dailyMetrics: metrics.dailyMetrics,
    isLoading,
    refresh,
  };
}

// Hook to get focus sessions from localStorage (Pomodoro data)
export function useFocusSessions(): FocusSession[] {
  return useMemo(() => {
    try {
      const stored = localStorage.getItem('pomodoroSessions');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  }, []);
}
