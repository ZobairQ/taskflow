/**
 * Recurrence Types - Type definitions for recurring tasks
 */

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  interval: number;           // Every N days/weeks/months
  daysOfWeek?: number[];      // 0-6 for weekly (Sun-Sat)
  dayOfMonth?: number;        // 1-31 for monthly
  monthOfYear?: number;       // 1-12 for yearly
  endDate?: string;           // Optional end date (ISO string)
  maxOccurrences?: number;    // Optional max instances
  customDays?: number[];      // For custom patterns (specific dates)
}

export interface RecurringTaskInstance {
  instanceId: string;
  parentTaskId: number;
  dueDate: string;
  generatedAt: number;
  occurrenceNumber: number;
  modified?: boolean;         // If user customized this instance
  completed?: boolean;        // If this instance was completed
}

export interface RecurrenceConfig {
  pattern: RecurrencePattern;
  instances: RecurringTaskInstance[];
  nextDueDate?: string;
  totalGenerated: number;
  createdAt: number;
}

// Preset recurrence patterns for quick selection
export type RecurrencePreset =
  | 'every_day'
  | 'every_weekday'
  | 'every_week'
  | 'every_2_weeks'
  | 'every_month'
  | 'every_quarter'
  | 'every_year'
  | 'custom';

// Options for the recurrence picker UI
export interface RecurrencePickerOptions {
  showEndDate: boolean;
  showMaxOccurrences: boolean;
  showCustomDays: boolean;
  minDate?: Date;
  maxDate?: Date;
}

// Result of generating next instance
export interface GeneratedInstance {
  dueDate: Date;
  occurrenceNumber: number;
  isValid: boolean;
  reason?: string;
}
