/**
 * Recurrence Constants - Presets and labels for recurring tasks
 */

import { RecurrencePreset, RecurrencePattern } from '../types/recurrence.types';

export interface RecurrencePresetOption {
  id: RecurrencePreset;
  label: string;
  description: string;
  icon: string;
  pattern: RecurrencePattern;
}

export const RECURRENCE_PRESETS: RecurrencePresetOption[] = [
  {
    id: 'every_day',
    label: 'Daily',
    description: 'Repeats every day',
    icon: '📅',
    pattern: { frequency: 'daily', interval: 1 },
  },
  {
    id: 'every_weekday',
    label: 'Weekdays',
    description: 'Monday through Friday',
    icon: '📆',
    pattern: { frequency: 'weekly', interval: 1, daysOfWeek: [1, 2, 3, 4, 5] },
  },
  {
    id: 'every_week',
    label: 'Weekly',
    description: 'Repeats every week',
    icon: '🔄',
    pattern: { frequency: 'weekly', interval: 1 },
  },
  {
    id: 'every_2_weeks',
    label: 'Bi-weekly',
    description: 'Every two weeks',
    icon: '↻',
    pattern: { frequency: 'weekly', interval: 2 },
  },
  {
    id: 'every_month',
    label: 'Monthly',
    description: 'Repeats every month',
    icon: '🗓️',
    pattern: { frequency: 'monthly', interval: 1 },
  },
  {
    id: 'every_quarter',
    label: 'Quarterly',
    description: 'Every three months',
    icon: '📊',
    pattern: { frequency: 'monthly', interval: 3 },
  },
  {
    id: 'every_year',
    label: 'Yearly',
    description: 'Repeats every year',
    icon: '🎂',
    pattern: { frequency: 'yearly', interval: 1 },
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'Custom schedule',
    icon: '⚙️',
    pattern: { frequency: 'custom', interval: 1 },
  },
];

export const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Day(s)',
  weekly: 'Week(s)',
  monthly: 'Month(s)',
  yearly: 'Year(s)',
  custom: 'Custom',
};

export const DAYS_OF_WEEK_OPTIONS = [
  { value: 0, label: 'Sun', fullLabel: 'Sunday' },
  { value: 1, label: 'Mon', fullLabel: 'Monday' },
  { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { value: 4, label: 'Thu', fullLabel: 'Thursday' },
  { value: 5, label: 'Fri', fullLabel: 'Friday' },
  { value: 6, label: 'Sat', fullLabel: 'Saturday' },
];

export const MONTH_OPTIONS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

// Generate day of month options (1-31)
export const DAY_OF_MONTH_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}`,
}));

// End type options for recurrence
export const END_TYPE_OPTIONS = [
  { value: 'never', label: 'Never' },
  { value: 'on_date', label: 'On date' },
  { value: 'after_occurrences', label: 'After occurrences' },
] as const;

export type EndType = typeof END_TYPE_OPTIONS[number]['value'];
