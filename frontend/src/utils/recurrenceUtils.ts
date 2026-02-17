/**
 * Recurrence Utilities - Logic for calculating and managing recurring tasks
 */

import {
  RecurrencePattern,
  RecurrencePreset,
  RecurringTaskInstance,
  GeneratedInstance,
} from '../types/recurrence.types';

// Day names for weekly patterns
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Get the default recurrence pattern
 */
export function getDefaultPattern(): RecurrencePattern {
  return {
    frequency: 'daily',
    interval: 1,
  };
}

/**
 * Get pattern from preset
 */
export function getPatternFromPreset(preset: RecurrencePreset): RecurrencePattern {
  switch (preset) {
    case 'every_day':
      return { frequency: 'daily', interval: 1 };
    case 'every_weekday':
      return { frequency: 'weekly', interval: 1, daysOfWeek: [1, 2, 3, 4, 5] };
    case 'every_week':
      return { frequency: 'weekly', interval: 1 };
    case 'every_2_weeks':
      return { frequency: 'weekly', interval: 2 };
    case 'every_month':
      return { frequency: 'monthly', interval: 1 };
    case 'every_quarter':
      return { frequency: 'monthly', interval: 3 };
    case 'every_year':
      return { frequency: 'yearly', interval: 1 };
    case 'custom':
    default:
      return { frequency: 'custom', interval: 1 };
  }
}

/**
 * Generate the next instance date from a pattern
 */
export function generateNextInstance(
  pattern: RecurrencePattern,
  fromDate: Date = new Date()
): Date {
  const next = new Date(fromDate);

  switch (pattern.frequency) {
    case 'daily':
      next.setDate(next.getDate() + pattern.interval);
      break;

    case 'weekly':
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        // Find the next day that matches daysOfWeek
        const sortedDays = [...pattern.daysOfWeek].sort((a, b) => a - b);
        const currentDay = next.getDay();

        // Find next day in the same week
        const nextDayInWeek = sortedDays.find(d => d > currentDay);

        if (nextDayInWeek !== undefined) {
          next.setDate(next.getDate() + (nextDayInWeek - currentDay));
        } else {
          // Move to next week and use first day
          next.setDate(next.getDate() + (7 - currentDay) + sortedDays[0] + ((pattern.interval - 1) * 7));
        }
      } else {
        next.setDate(next.getDate() + (7 * pattern.interval));
      }
      break;

    case 'monthly':
      if (pattern.dayOfMonth) {
        next.setMonth(next.getMonth() + pattern.interval);
        next.setDate(pattern.dayOfMonth);
        // Handle months with fewer days
        if (next.getDate() !== pattern.dayOfMonth) {
          next.setDate(0); // Last day of previous month
        }
      } else {
        next.setMonth(next.getMonth() + pattern.interval);
      }
      break;

    case 'yearly':
      if (pattern.monthOfYear) {
        next.setFullYear(next.getFullYear() + pattern.interval);
        next.setMonth(pattern.monthOfYear - 1);
        if (pattern.dayOfMonth) {
          next.setDate(pattern.dayOfMonth);
        }
      } else {
        next.setFullYear(next.getFullYear() + pattern.interval);
      }
      break;

    case 'custom':
      if (pattern.customDays && pattern.customDays.length > 0) {
        // customDays represents days from now
        next.setDate(next.getDate() + pattern.customDays[0]);
      }
      break;
  }

  return next;
}

/**
 * Generate instances for a date range
 */
export function generateInstancesForRange(
  pattern: RecurrencePattern,
  startDate: Date,
  endDate: Date,
  maxInstances: number = 100
): GeneratedInstance[] {
  const instances: GeneratedInstance[] = [];
  let currentDate = new Date(startDate);
  let occurrenceNumber = 1;

  // Check if we've exceeded maxOccurrences
  const maxAllowed = pattern.maxOccurrences || maxInstances;

  while (currentDate <= endDate && instances.length < maxAllowed) {
    // Check end date constraint
    if (pattern.endDate && currentDate > new Date(pattern.endDate)) {
      break;
    }

    instances.push({
      dueDate: new Date(currentDate),
      occurrenceNumber,
      isValid: true,
    });

    currentDate = generateNextInstance(pattern, currentDate);
    occurrenceNumber++;
  }

  return instances;
}

/**
 * Get a human-readable description of the recurrence pattern
 */
export function getRecurrenceDescription(pattern: RecurrencePattern): string {
  switch (pattern.frequency) {
    case 'daily':
      return pattern.interval === 1 ? 'Daily' : `Every ${pattern.interval} days`;

    case 'weekly':
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        if (pattern.daysOfWeek.length === 7) {
          return 'Daily';
        }
        if (JSON.stringify(pattern.daysOfWeek.sort()) === JSON.stringify([1, 2, 3, 4, 5])) {
          return 'Weekdays';
        }
        if (JSON.stringify(pattern.daysOfWeek.sort()) === JSON.stringify([0, 6])) {
          return 'Weekends';
        }
        const days = pattern.daysOfWeek.map(d => DAY_NAMES[d]).join(', ');
        return pattern.interval === 1 ? `Weekly on ${days}` : `Every ${pattern.interval} weeks on ${days}`;
      }
      return pattern.interval === 1 ? 'Weekly' : `Every ${pattern.interval} weeks`;

    case 'monthly':
      if (pattern.dayOfMonth) {
        const ordinal = getOrdinal(pattern.dayOfMonth);
        return pattern.interval === 1
          ? `Monthly on the ${ordinal}`
          : `Every ${pattern.interval} months on the ${ordinal}`;
      }
      return pattern.interval === 1 ? 'Monthly' : `Every ${pattern.interval} months`;

    case 'yearly':
      if (pattern.monthOfYear && pattern.dayOfMonth) {
        const month = MONTH_NAMES[pattern.monthOfYear - 1];
        return pattern.interval === 1
          ? `Yearly on ${month} ${pattern.dayOfMonth}`
          : `Every ${pattern.interval} years on ${month} ${pattern.dayOfMonth}`;
      }
      return pattern.interval === 1 ? 'Yearly' : `Every ${pattern.interval} years`;

    case 'custom':
      return 'Custom schedule';

    default:
      return 'Recurring';
  }
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
export function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Check if a task should generate a new instance
 */
export function shouldGenerateInstance(
  instances: RecurringTaskInstance[],
  pattern: RecurrencePattern,
  checkDate: Date = new Date()
): boolean {
  if (!pattern) return false;

  // Check if we've exceeded max occurrences
  if (pattern.maxOccurrences && instances.length >= pattern.maxOccurrences) {
    return false;
  }

  // Check if we've passed the end date
  if (pattern.endDate && checkDate > new Date(pattern.endDate)) {
    return false;
  }

  // Find the last instance
  const lastInstance = instances.length > 0
    ? instances.reduce((latest, current) =>
      new Date(current.dueDate) > new Date(latest.dueDate) ? current : latest
    )
    : null;

  if (!lastInstance) {
    return true;
  }

  // Check if enough time has passed since the last instance
  const lastDueDate = new Date(lastInstance.dueDate);
  const nextDueDate = generateNextInstance(pattern, lastDueDate);

  return checkDate >= nextDueDate;
}

/**
 * Create a new recurring task instance
 */
export function createRecurringInstance(
  parentId: number,
  dueDate: Date,
  occurrenceNumber: number
): RecurringTaskInstance {
  return {
    instanceId: `${parentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    parentTaskId: parentId,
    dueDate: dueDate.toISOString(),
    generatedAt: Date.now(),
    occurrenceNumber,
    modified: false,
    completed: false,
  };
}

/**
 * Validate a recurrence pattern
 */
export function validatePattern(pattern: RecurrencePattern): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!pattern.frequency) {
    errors.push('Frequency is required');
  }

  if (pattern.interval < 1) {
    errors.push('Interval must be at least 1');
  }

  if (pattern.frequency === 'weekly' && pattern.daysOfWeek) {
    if (pattern.daysOfWeek.some(d => d < 0 || d > 6)) {
      errors.push('Days of week must be between 0 (Sunday) and 6 (Saturday)');
    }
  }

  if (pattern.frequency === 'monthly' && pattern.dayOfMonth) {
    if (pattern.dayOfMonth < 1 || pattern.dayOfMonth > 31) {
      errors.push('Day of month must be between 1 and 31');
    }
  }

  if (pattern.frequency === 'yearly' && pattern.monthOfYear) {
    if (pattern.monthOfYear < 1 || pattern.monthOfYear > 12) {
      errors.push('Month of year must be between 1 and 12');
    }
  }

  if (pattern.endDate && pattern.maxOccurrences) {
    errors.push('Cannot have both end date and max occurrences');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get upcoming instances for preview
 */
export function getUpcomingInstances(
  pattern: RecurrencePattern,
  count: number = 5
): Date[] {
  const instances: Date[] = [];
  let currentDate = new Date();

  for (let i = 0; i < count; i++) {
    currentDate = generateNextInstance(pattern, currentDate);
    instances.push(new Date(currentDate));
  }

  return instances;
}

/**
 * Check if two patterns are equal
 */
export function patternsEqual(
  a: RecurrencePattern | undefined,
  b: RecurrencePattern | undefined
): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;

  return (
    a.frequency === b.frequency &&
    a.interval === b.interval &&
    JSON.stringify(a.daysOfWeek?.sort()) === JSON.stringify(b.daysOfWeek?.sort()) &&
    a.dayOfMonth === b.dayOfMonth &&
    a.monthOfYear === b.monthOfYear &&
    a.endDate === b.endDate &&
    a.maxOccurrences === b.maxOccurrences
  );
}
