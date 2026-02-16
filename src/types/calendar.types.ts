/**
 * Calendar-related type definitions
 */

export type CalendarViewMode = 'month' | 'week';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: CalendarTask[];
}

export interface CalendarTask {
  id: number;
  text: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  projectId?: string;
  projectName?: string;
  projectColor?: string;
}

export interface CalendarMonth {
  year: number;
  month: number;
  days: CalendarDay[];
}

export interface CalendarWeek {
  startDate: Date;
  endDate: Date;
  days: CalendarDay[];
}
