/**
 * Analytics Types - Type definitions for productivity analytics
 */

export type DateRange = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface AnalyticsDateRange {
  start: Date;
  end: Date;
  label: string;
}

export interface DailyMetrics {
  date: string;
  tasksCreated: number;
  tasksCompleted: number;
  focusTime: number; // minutes
  completionRate: number;
}

export interface ProductivityMetrics {
  period: DateRange;
  totalTasksCreated: number;
  totalTasksCompleted: number;
  completionRate: number;
  averageDaily: number;
  mostProductiveDay: string;
  mostProductiveHour: number;
  streakDays: number;
  dailyBreakdown: DailyMetrics[];
}

export interface TimeTrackingMetrics {
  totalFocusTime: number; // minutes
  averageSessionLength: number; // minutes
  sessionsCompleted: number;
  focusTimeByDay: { day: string; minutes: number }[];
  focusTimeByCategory: { category: string; minutes: number }[];
}

export interface CategoryMetrics {
  category: string;
  count: number;
  completed: number;
  pending: number;
  completionRate: number;
  color: string;
}

export interface PriorityMetrics {
  priority: 'high' | 'medium' | 'low' | 'none';
  count: number;
  completed: number;
  percentage: number;
}

export interface GoalProgress {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: 'tasks' | 'minutes' | 'streak';
  deadline?: Date;
  progress: number; // percentage
  status: 'on-track' | 'behind' | 'completed' | 'overdue';
}

export interface AnalyticsOverview {
  productivity: ProductivityMetrics;
  timeTracking: TimeTrackingMetrics;
  categories: CategoryMetrics[];
  priorities: PriorityMetrics[];
  goals: GoalProgress[];
  insights: string[];
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface LineChartDataPoint {
  date: string;
  created: number;
  completed: number;
}

export interface BarChartDataPoint {
  name: string;
  value: number;
  color: string;
}
