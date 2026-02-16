/**
 * Analytics Calculations - Utility functions for computing productivity metrics
 */

import { Task } from '../../types/task.types';
import {
  DateRange,
  AnalyticsDateRange,
  DailyMetrics,
  ProductivityMetrics,
  TimeTrackingMetrics,
  CategoryMetrics,
  PriorityMetrics,
  ChartDataPoint,
  LineChartDataPoint,
} from '../../types/analytics.types';

// Color palette for charts
const CATEGORY_COLORS: Record<string, string> = {
  work: '#6366f1',
  personal: '#8b5cf6',
  health: '#10b981',
  finance: '#f59e0b',
  learning: '#3b82f6',
  shopping: '#ec4899',
  other: '#6b7280',
};

/**
 * Get date range boundaries
 */
export function getDateRange(range: DateRange, customStart?: Date, customEnd?: Date): AnalyticsDateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case 'today':
      return { start: today, end: now, label: 'Today' };
    case 'week': {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return { start: weekStart, end: now, label: 'This Week' };
    }
    case 'month': {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: monthStart, end: now, label: 'This Month' };
    }
    case 'year': {
      const yearStart = new Date(today.getFullYear(), 0, 1);
      return { start: yearStart, end: now, label: 'This Year' };
    }
    case 'custom':
      return {
        start: customStart || today,
        end: customEnd || now,
        label: 'Custom Range',
      };
  }
}

/**
 * Get all dates in a range
 */
function getDatesInRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Calculate daily metrics for a date range
 */
export function calculateDailyMetrics(
  tasks: Task[],
  start: Date,
  end: Date,
  focusSessions?: { date: number; duration: number }[]
): DailyMetrics[] {
  const dates = getDatesInRange(start, end);
  const dailyData: Map<string, DailyMetrics> = new Map();

  // Initialize all dates
  dates.forEach(date => {
    const key = formatDateKey(date);
    dailyData.set(key, {
      date: key,
      tasksCreated: 0,
      tasksCompleted: 0,
      focusTime: 0,
      completionRate: 0,
    });
  });

  // Count tasks created per day
  tasks.forEach(task => {
    const createdDate = new Date(task.createdAt);
    const key = formatDateKey(createdDate);
    if (dailyData.has(key)) {
      const data = dailyData.get(key)!;
      data.tasksCreated++;
    }
  });

  // Count tasks completed per day
  tasks.forEach(task => {
    if (task.completed && task.completedAt) {
      const completedDate = new Date(task.completedAt);
      const key = formatDateKey(completedDate);
      if (dailyData.has(key)) {
        const data = dailyData.get(key)!;
        data.tasksCompleted++;
      }
    }
  });

  // Add focus time from sessions
  if (focusSessions) {
    focusSessions.forEach(session => {
      const sessionDate = new Date(session.date);
      const key = formatDateKey(sessionDate);
      if (dailyData.has(key)) {
        const data = dailyData.get(key)!;
        data.focusTime += session.duration;
      }
    });
  }

  // Calculate completion rates
  dailyData.forEach(data => {
    const total = data.tasksCreated + data.tasksCompleted; // Approximation
    data.completionRate = total > 0 ? Math.round((data.tasksCompleted / Math.max(data.tasksCreated, 1)) * 100) : 0;
  });

  return Array.from(dailyData.values());
}

/**
 * Calculate overall productivity metrics
 */
export function calculateProductivityMetrics(
  tasks: Task[],
  dateRange: DateRange,
  customStart?: Date,
  customEnd?: Date
): ProductivityMetrics {
  const range = getDateRange(dateRange, customStart, customEnd);
  const startTime = range.start.getTime();
  const endTime = range.end.getTime();

  // Filter tasks in date range
  const tasksInRange = tasks.filter(t => t.createdAt >= startTime && t.createdAt <= endTime);
  const completedInRange = tasksInRange.filter(t => t.completed);

  // Get daily breakdown
  const dailyBreakdown = calculateDailyMetrics(tasks, range.start, range.end);

  // Find most productive day
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const completionsByDay: Record<string, number> = {};
  completedInRange.forEach(task => {
    if (task.completedAt) {
      const day = dayNames[new Date(task.completedAt).getDay()];
      completionsByDay[day] = (completionsByDay[day] || 0) + 1;
    }
  });

  const mostProductiveDay = Object.entries(completionsByDay)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Find most productive hour
  const completionsByHour: Record<number, number> = {};
  completedInRange.forEach(task => {
    if (task.completedAt) {
      const hour = new Date(task.completedAt).getHours();
      completionsByHour[hour] = (completionsByHour[hour] || 0) + 1;
    }
  });

  const mostProductiveHour = Object.entries(completionsByHour)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '0';

  // Calculate streak (consecutive days with completed tasks)
  const today = new Date();
  let streakDays = 0;
  const checkDate = new Date(today);
  while (true) {
    const key = formatDateKey(checkDate);
    const dayData = dailyBreakdown.find(d => d.date === key);
    if (dayData && dayData.tasksCompleted > 0) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    period: dateRange,
    totalTasksCreated: tasksInRange.length,
    totalTasksCompleted: completedInRange.length,
    completionRate: tasksInRange.length > 0
      ? Math.round((completedInRange.length / tasksInRange.length) * 100)
      : 0,
    averageDaily: dailyBreakdown.length > 0
      ? Math.round(completedInRange.length / dailyBreakdown.length)
      : 0,
    mostProductiveDay,
    mostProductiveHour: parseInt(mostProductiveHour),
    streakDays,
    dailyBreakdown,
  };
}

/**
 * Calculate time tracking metrics from Pomodoro sessions
 */
export function calculateTimeTrackingMetrics(
  sessions: { date: number; duration: number; category?: string }[],
  dateRange: DateRange,
  customStart?: Date,
  customEnd?: Date
): TimeTrackingMetrics {
  const range = getDateRange(dateRange, customStart, customEnd);
  const startTime = range.start.getTime();
  const endTime = range.end.getTime();

  const sessionsInRange = sessions.filter(s => s.date >= startTime && s.date <= endTime);

  const totalFocusTime = sessionsInRange.reduce((sum, s) => sum + s.duration, 0);
  const averageSessionLength = sessionsInRange.length > 0
    ? Math.round(totalFocusTime / sessionsInRange.length)
    : 0;

  // Focus time by day of week
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const focusByDay: Record<string, number> = {};
  dayNames.forEach(d => focusByDay[d] = 0);

  sessionsInRange.forEach(session => {
    const day = dayNames[new Date(session.date).getDay()];
    focusByDay[day] += session.duration;
  });

  const focusTimeByDay = dayNames.map(day => ({
    day,
    minutes: focusByDay[day],
  }));

  // Focus time by category
  const focusByCategory: Record<string, number> = {};
  sessionsInRange.forEach(session => {
    const category = session.category || 'other';
    focusByCategory[category] = (focusByCategory[category] || 0) + session.duration;
  });

  const focusTimeByCategory = Object.entries(focusByCategory)
    .map(([category, minutes]) => ({ category, minutes }))
    .sort((a, b) => b.minutes - a.minutes);

  return {
    totalFocusTime,
    averageSessionLength,
    sessionsCompleted: sessionsInRange.length,
    focusTimeByDay,
    focusTimeByCategory,
  };
}

/**
 * Calculate metrics by category
 */
export function calculateCategoryMetrics(tasks: Task[]): CategoryMetrics[] {
  const categoryData: Record<string, { count: number; completed: number }> = {};

  tasks.forEach(task => {
    const category = task.category || 'other';
    if (!categoryData[category]) {
      categoryData[category] = { count: 0, completed: 0 };
    }
    categoryData[category].count++;
    if (task.completed) {
      categoryData[category].completed++;
    }
  });

  return Object.entries(categoryData)
    .map(([category, data]) => ({
      category,
      count: data.count,
      completed: data.completed,
      pending: data.count - data.completed,
      completionRate: Math.round((data.completed / data.count) * 100),
      color: CATEGORY_COLORS[category] || CATEGORY_COLORS.other,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculate metrics by priority
 */
export function calculatePriorityMetrics(tasks: Task[]): PriorityMetrics[] {
  const priorityData: Record<string, { count: number; completed: number }> = {
    high: { count: 0, completed: 0 },
    medium: { count: 0, completed: 0 },
    low: { count: 0, completed: 0 },
    none: { count: 0, completed: 0 },
  };

  tasks.forEach(task => {
    const priority = task.priority || 'none';
    priorityData[priority].count++;
    if (task.completed) {
      priorityData[priority].completed++;
    }
  });

  const total = tasks.length || 1;

  return (['high', 'medium', 'low', 'none'] as const).map(priority => ({
    priority,
    count: priorityData[priority].count,
    completed: priorityData[priority].completed,
    percentage: Math.round((priorityData[priority].count / total) * 100),
  }));
}

/**
 * Get chart data for productivity over time
 */
export function getProductivityChartData(dailyMetrics: DailyMetrics[]): LineChartDataPoint[] {
  return dailyMetrics.map(day => ({
    date: day.date,
    created: day.tasksCreated,
    completed: day.tasksCompleted,
  }));
}

/**
 * Get chart data for category breakdown
 */
export function getCategoryChartData(categoryMetrics: CategoryMetrics[]): ChartDataPoint[] {
  return categoryMetrics.slice(0, 6).map(cat => ({
    name: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
    value: cat.count,
    color: cat.color,
  }));
}

/**
 * Generate insights based on metrics
 */
export function generateInsights(
  productivity: ProductivityMetrics,
  categories: CategoryMetrics[],
  timeTracking: TimeTrackingMetrics
): string[] {
  const insights: string[] = [];

  // Completion rate insights
  if (productivity.completionRate >= 80) {
    insights.push('Excellent! You\'re completing over 80% of your tasks.');
  } else if (productivity.completionRate >= 50) {
    insights.push('Good progress! Try to push your completion rate above 80%.');
  } else {
    insights.push('Consider breaking down tasks into smaller, more manageable pieces.');
  }

  // Streak insights
  if (productivity.streakDays >= 7) {
    insights.push(`Amazing ${productivity.streakDays}-day streak! Keep up the momentum.`);
  } else if (productivity.streakDays >= 3) {
    insights.push(`Nice ${productivity.streakDays}-day streak! Can you make it to 7?`);
  }

  // Most productive day insight
  if (productivity.mostProductiveDay !== 'N/A') {
    insights.push(`${productivity.mostProductiveDay}s are your most productive days.`);
  }

  // Category insights
  if (categories.length > 0) {
    const topCategory = categories[0];
    if (topCategory.completionRate >= 70) {
      insights.push(`Great job on "${topCategory.category}" tasks with ${topCategory.completionRate}% completion.`);
    }
  }

  // Focus time insights
  if (timeTracking.totalFocusTime > 0) {
    const hours = Math.floor(timeTracking.totalFocusTime / 60);
    if (hours >= 10) {
      insights.push(`You've logged ${hours}+ hours of focused work. Impressive!`);
    }
  }

  return insights;
}
