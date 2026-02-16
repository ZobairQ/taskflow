/**
 * Unit tests for recurrenceUtils
 */

import {
  DAY_NAMES,
  DAY_NAMES_FULL,
  MONTH_NAMES,
  getDefaultPattern,
  getPatternFromPreset,
  generateNextInstance,
  getRecurrenceDescription,
  getOrdinal,
  validatePattern,
  patternsEqual,
  getUpcomingInstances,
} from '../../../utils/recurrenceUtils';
import { RecurrencePattern } from '../../../types/recurrence.types';

describe('recurrenceUtils', () => {
  describe('Constants', () => {
    it('should have correct day names', () => {
      expect(DAY_NAMES).toHaveLength(7);
      expect(DAY_NAMES[0]).toBe('Sun');
      expect(DAY_NAMES[6]).toBe('Sat');
    });

    it('should have correct full day names', () => {
      expect(DAY_NAMES_FULL).toHaveLength(7);
      expect(DAY_NAMES_FULL[0]).toBe('Sunday');
      expect(DAY_NAMES_FULL[6]).toBe('Saturday');
    });

    it('should have correct month names', () => {
      expect(MONTH_NAMES).toHaveLength(12);
      expect(MONTH_NAMES[0]).toBe('Jan');
      expect(MONTH_NAMES[11]).toBe('Dec');
    });
  });

  describe('getDefaultPattern', () => {
    it('should return a daily pattern with interval 1', () => {
      const pattern = getDefaultPattern();
      expect(pattern.frequency).toBe('daily');
      expect(pattern.interval).toBe(1);
    });
  });

  describe('getPatternFromPreset', () => {
    it('should return daily pattern for every_day', () => {
      const pattern = getPatternFromPreset('every_day');
      expect(pattern.frequency).toBe('daily');
      expect(pattern.interval).toBe(1);
    });

    it('should return weekday pattern for every_weekday', () => {
      const pattern = getPatternFromPreset('every_weekday');
      expect(pattern.frequency).toBe('weekly');
      expect(pattern.daysOfWeek).toEqual([1, 2, 3, 4, 5]);
    });

    it('should return weekly pattern for every_week', () => {
      const pattern = getPatternFromPreset('every_week');
      expect(pattern.frequency).toBe('weekly');
      expect(pattern.interval).toBe(1);
    });

    it('should return bi-weekly pattern for every_2_weeks', () => {
      const pattern = getPatternFromPreset('every_2_weeks');
      expect(pattern.frequency).toBe('weekly');
      expect(pattern.interval).toBe(2);
    });

    it('should return monthly pattern for every_month', () => {
      const pattern = getPatternFromPreset('every_month');
      expect(pattern.frequency).toBe('monthly');
      expect(pattern.interval).toBe(1);
    });

    it('should return quarterly pattern for every_quarter', () => {
      const pattern = getPatternFromPreset('every_quarter');
      expect(pattern.frequency).toBe('monthly');
      expect(pattern.interval).toBe(3);
    });

    it('should return yearly pattern for every_year', () => {
      const pattern = getPatternFromPreset('every_year');
      expect(pattern.frequency).toBe('yearly');
      expect(pattern.interval).toBe(1);
    });

    it('should return custom pattern for custom preset', () => {
      const pattern = getPatternFromPreset('custom');
      expect(pattern.frequency).toBe('custom');
    });
  });

  describe('generateNextInstance', () => {
    it('should generate next day for daily pattern', () => {
      const pattern: RecurrencePattern = { frequency: 'daily', interval: 1 };
      const fromDate = new Date('2024-01-15T10:00:00');
      const next = generateNextInstance(pattern, fromDate);

      expect(next.getDate()).toBe(16);
      expect(next.getMonth()).toBe(0); // January
    });

    it('should generate date with interval for daily pattern', () => {
      const pattern: RecurrencePattern = { frequency: 'daily', interval: 3 };
      const fromDate = new Date('2024-01-15T10:00:00');
      const next = generateNextInstance(pattern, fromDate);

      expect(next.getDate()).toBe(18);
    });

    it('should generate next week for weekly pattern without daysOfWeek', () => {
      const pattern: RecurrencePattern = { frequency: 'weekly', interval: 1 };
      const fromDate = new Date('2024-01-15T10:00:00'); // Monday
      const next = generateNextInstance(pattern, fromDate);

      expect(next.getDate()).toBe(22); // Next Monday
    });

    it('should find next day in same week for daysOfWeek', () => {
      const pattern: RecurrencePattern = {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
      };
      const fromDate = new Date('2024-01-15T10:00:00'); // Monday
      const next = generateNextInstance(pattern, fromDate);

      expect(next.getDay()).toBe(3); // Wednesday
    });

    it('should generate next month for monthly pattern', () => {
      const pattern: RecurrencePattern = { frequency: 'monthly', interval: 1 };
      const fromDate = new Date('2024-01-15T10:00:00');
      const next = generateNextInstance(pattern, fromDate);

      expect(next.getMonth()).toBe(1); // February
    });

    it('should respect dayOfMonth for monthly pattern', () => {
      const pattern: RecurrencePattern = {
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 15,
      };
      const fromDate = new Date('2024-01-10T10:00:00');
      const next = generateNextInstance(pattern, fromDate);

      expect(next.getMonth()).toBe(1); // February
      expect(next.getDate()).toBe(15);
    });

    it('should generate next year for yearly pattern', () => {
      const pattern: RecurrencePattern = { frequency: 'yearly', interval: 1 };
      const fromDate = new Date('2024-01-15T10:00:00');
      const next = generateNextInstance(pattern, fromDate);

      expect(next.getFullYear()).toBe(2025);
    });
  });

  describe('getRecurrenceDescription', () => {
    it('should return "Daily" for daily pattern with interval 1', () => {
      const pattern: RecurrencePattern = { frequency: 'daily', interval: 1 };
      expect(getRecurrenceDescription(pattern)).toBe('Daily');
    });

    it('should return "Every N days" for daily pattern with interval > 1', () => {
      const pattern: RecurrencePattern = { frequency: 'daily', interval: 3 };
      expect(getRecurrenceDescription(pattern)).toBe('Every 3 days');
    });

    it('should return "Weekdays" for weekday pattern', () => {
      const pattern: RecurrencePattern = {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [1, 2, 3, 4, 5],
      };
      expect(getRecurrenceDescription(pattern)).toBe('Weekdays');
    });

    it('should return "Weekends" for weekend pattern', () => {
      const pattern: RecurrencePattern = {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [0, 6],
      };
      expect(getRecurrenceDescription(pattern)).toBe('Weekends');
    });

    it('should return "Weekly" for weekly pattern without daysOfWeek', () => {
      const pattern: RecurrencePattern = { frequency: 'weekly', interval: 1 };
      expect(getRecurrenceDescription(pattern)).toBe('Weekly');
    });

    it('should return "Monthly" for monthly pattern', () => {
      const pattern: RecurrencePattern = { frequency: 'monthly', interval: 1 };
      expect(getRecurrenceDescription(pattern)).toBe('Monthly');
    });

    it('should include day for monthly pattern with dayOfMonth', () => {
      const pattern: RecurrencePattern = {
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 15,
      };
      expect(getRecurrenceDescription(pattern)).toBe('Monthly on the 15th');
    });

    it('should return "Yearly" for yearly pattern', () => {
      const pattern: RecurrencePattern = { frequency: 'yearly', interval: 1 };
      expect(getRecurrenceDescription(pattern)).toBe('Yearly');
    });

    it('should return "Custom schedule" for custom pattern', () => {
      const pattern: RecurrencePattern = { frequency: 'custom', interval: 1 };
      expect(getRecurrenceDescription(pattern)).toBe('Custom schedule');
    });
  });

  describe('getOrdinal', () => {
    it('should return correct ordinal for 1', () => {
      expect(getOrdinal(1)).toBe('1st');
    });

    it('should return correct ordinal for 2', () => {
      expect(getOrdinal(2)).toBe('2nd');
    });

    it('should return correct ordinal for 3', () => {
      expect(getOrdinal(3)).toBe('3rd');
    });

    it('should return correct ordinal for 4', () => {
      expect(getOrdinal(4)).toBe('4th');
    });

    it('should return correct ordinal for 11', () => {
      expect(getOrdinal(11)).toBe('11th');
    });

    it('should return correct ordinal for 21', () => {
      expect(getOrdinal(21)).toBe('21st');
    });

    it('should return correct ordinal for 22', () => {
      expect(getOrdinal(22)).toBe('22nd');
    });

    it('should return correct ordinal for 23', () => {
      expect(getOrdinal(23)).toBe('23rd');
    });
  });

  describe('validatePattern', () => {
    it('should return valid for a correct pattern', () => {
      const pattern: RecurrencePattern = { frequency: 'daily', interval: 1 };
      const result = validatePattern(pattern);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for interval less than 1', () => {
      const pattern: RecurrencePattern = { frequency: 'daily', interval: 0 };
      const result = validatePattern(pattern);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Interval must be at least 1');
    });

    it('should return error for invalid daysOfWeek', () => {
      const pattern: RecurrencePattern = {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [7], // Invalid day
      };
      const result = validatePattern(pattern);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Days of week must be between 0 (Sunday) and 6 (Saturday)');
    });

    it('should return error for invalid dayOfMonth', () => {
      const pattern: RecurrencePattern = {
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 32, // Invalid day
      };
      const result = validatePattern(pattern);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Day of month must be between 1 and 31');
    });

    it('should return error for both endDate and maxOccurrences', () => {
      const pattern: RecurrencePattern = {
        frequency: 'daily',
        interval: 1,
        endDate: '2024-12-31',
        maxOccurrences: 10,
      };
      const result = validatePattern(pattern);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Cannot have both end date and max occurrences');
    });
  });

  describe('patternsEqual', () => {
    it('should return true for identical patterns', () => {
      const a: RecurrencePattern = { frequency: 'daily', interval: 1 };
      const b: RecurrencePattern = { frequency: 'daily', interval: 1 };
      expect(patternsEqual(a, b)).toBe(true);
    });

    it('should return true for undefined patterns', () => {
      expect(patternsEqual(undefined, undefined)).toBe(true);
    });

    it('should return false for one undefined pattern', () => {
      const a: RecurrencePattern = { frequency: 'daily', interval: 1 };
      expect(patternsEqual(a, undefined)).toBe(false);
      expect(patternsEqual(undefined, a)).toBe(false);
    });

    it('should return false for different frequencies', () => {
      const a: RecurrencePattern = { frequency: 'daily', interval: 1 };
      const b: RecurrencePattern = { frequency: 'weekly', interval: 1 };
      expect(patternsEqual(a, b)).toBe(false);
    });

    it('should return false for different intervals', () => {
      const a: RecurrencePattern = { frequency: 'daily', interval: 1 };
      const b: RecurrencePattern = { frequency: 'daily', interval: 2 };
      expect(patternsEqual(a, b)).toBe(false);
    });
  });

  describe('getUpcomingInstances', () => {
    it('should return requested number of instances', () => {
      const pattern: RecurrencePattern = { frequency: 'daily', interval: 1 };
      const instances = getUpcomingInstances(pattern, 5);
      expect(instances).toHaveLength(5);
    });

    it('should return default 5 instances when count not specified', () => {
      const pattern: RecurrencePattern = { frequency: 'daily', interval: 1 };
      const instances = getUpcomingInstances(pattern);
      expect(instances).toHaveLength(5);
    });

    it('should return sequential dates for daily pattern', () => {
      const pattern: RecurrencePattern = { frequency: 'daily', interval: 1 };
      const instances = getUpcomingInstances(pattern, 3);

      // Each date should be 1 day after the previous
      for (let i = 1; i < instances.length; i++) {
        const diff = instances[i].getTime() - instances[i - 1].getTime();
        const daysDiff = Math.round(diff / (1000 * 60 * 60 * 24));
        expect(daysDiff).toBe(1);
      }
    });
  });
});
