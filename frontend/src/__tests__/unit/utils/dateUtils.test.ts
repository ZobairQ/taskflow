// @ts-nocheck
/**
 * Unit tests for dateUtils
 */

import {
  formatDate,
  formatDateFull,
  getGreeting,
  isOverdue,
  getDaysUntil,
} from '../../../utils/dateUtils';

describe('dateUtils', () => {
  // Mock Date for consistent testing
  const originalDate = global.Date;

  beforeEach(() => {
    // Fixed date: January 15, 2024, 10:30 AM
    const mockDate = new Date('2024-01-15T10:30:00.000Z');
    global.Date = class extends Date {
      constructor(dateString?: string | number) {
        if (dateString) {
          super(dateString);
        } else {
          super(mockDate);
        }
      }
    } as DateConstructor;
  });

  afterEach(() => {
    global.Date = originalDate;
  });

  describe('formatDate', () => {
    it('should format a timestamp to short date string', () => {
      const timestamp = new Date('2024-01-15T10:30:00').getTime();
      const result = formatDate(timestamp);

      expect(result).toContain('Jan');
      expect(result).toContain('15');
    });

    it('should include time in the formatted string', () => {
      const timestamp = new Date('2024-01-15T14:45:00').getTime();
      const result = formatDate(timestamp);

      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('formatDateFull', () => {
    it('should format a timestamp with year included', () => {
      const timestamp = new Date('2024-01-15T10:30:00').getTime();
      const result = formatDateFull(timestamp);

      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should include time in the full formatted string', () => {
      const timestamp = new Date('2024-06-20T09:00:00').getTime();
      const result = formatDateFull(timestamp);

      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('getGreeting', () => {
    it('should return "Good morning" for hours before 12', () => {
      // Mock morning hour (8 AM)
      const mockDate = new Date('2024-01-15T08:00:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      expect(getGreeting()).toBe('Good morning');
    });

    it('should return "Good afternoon" for hours 12-17', () => {
      // Mock afternoon hour (2 PM)
      const mockDate = new Date('2024-01-15T14:00:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      expect(getGreeting()).toBe('Good afternoon');
    });

    it('should return "Good evening" for hours 18 and after', () => {
      // Mock evening hour (7 PM)
      const mockDate = new Date('2024-01-15T19:00:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      expect(getGreeting()).toBe('Good evening');
    });
  });

  describe('isOverdue', () => {
    it('should return true for past dates', () => {
      const pastDate = '2024-01-10T00:00:00.000Z';
      expect(isOverdue(pastDate)).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = '2024-12-31T00:00:00.000Z';
      expect(isOverdue(futureDate)).toBe(false);
    });

    it('should return false for today', () => {
      const today = '2024-01-15T23:59:59.000Z';
      expect(isOverdue(today)).toBe(false);
    });
  });

  describe('getDaysUntil', () => {
    it('should return positive number for future dates', () => {
      const futureDate = '2024-01-20T00:00:00.000Z';
      const days = getDaysUntil(futureDate);

      expect(days).toBeGreaterThan(0);
    });

    it('should return negative number for past dates', () => {
      const pastDate = '2024-01-10T00:00:00.000Z';
      const days = getDaysUntil(pastDate);

      expect(days).toBeLessThan(0);
    });

    it('should return approximately 0 for today', () => {
      const today = new Date().toISOString();
      const days = getDaysUntil(today);

      expect(Math.abs(days)).toBeLessThanOrEqual(1);
    });
  });
});
