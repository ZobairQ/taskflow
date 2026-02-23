// @ts-nocheck
/**
 * Unit tests for taskUtils
 */

import {
  getPriorityBadge,
  getTaskIcon,
  getTaskStatus,
  countWords,
  estimateReadingTime,
} from '../../../utils/taskUtils';
import { Task } from '../../../ProjectContext';

describe('taskUtils', () => {
  describe('getPriorityBadge', () => {
    it('should return rose classes for high priority', () => {
      const result = getPriorityBadge('high');
      expect(result).toContain('bg-rose');
      expect(result).toContain('text-rose');
    });

    it('should return amber classes for medium priority', () => {
      const result = getPriorityBadge('medium');
      expect(result).toContain('bg-amber');
      expect(result).toContain('text-amber');
    });

    it('should return blue classes for low priority', () => {
      const result = getPriorityBadge('low');
      expect(result).toContain('bg-blue');
      expect(result).toContain('text-blue');
    });

    it('should return gray classes for unknown priority', () => {
      const result = getPriorityBadge('unknown');
      expect(result).toContain('bg-gray');
      expect(result).toContain('text-gray');
    });
  });

  describe('getTaskIcon', () => {
    it('should return fire emoji for high priority', () => {
      expect(getTaskIcon('high')).toBe('🔥');
    });

    it('should return lightning emoji for medium priority', () => {
      expect(getTaskIcon('medium')).toBe('⚡');
    });

    it('should return lightbulb emoji for low priority', () => {
      expect(getTaskIcon('low')).toBe('💡');
    });

    it('should return memo emoji for unknown priority', () => {
      expect(getTaskIcon('unknown')).toBe('📝');
    });
  });

  describe('getTaskStatus', () => {
    it('should return task status if defined', () => {
      const task = {
        id: 1,
        text: 'Test task',
        completed: false,
        status: 'in-progress' as const,
      } as Task;

      expect(getTaskStatus(task)).toBe('in-progress');
    });

    it('should return completed when completed is true and no status', () => {
      const task = {
        id: 1,
        text: 'Test task',
        completed: true,
      } as Task;

      expect(getTaskStatus(task)).toBe('completed');
    });

    it('should return pending when completed is false and no status', () => {
      const task = {
        id: 1,
        text: 'Test task',
        completed: false,
      } as Task;

      expect(getTaskStatus(task)).toBe('pending');
    });

    it('should prioritize status over completed boolean', () => {
      const task = {
        id: 1,
        text: 'Test task',
        completed: true, // This is true but status should take precedence
        status: 'pending' as const,
      } as Task;

      expect(getTaskStatus(task)).toBe('pending');
    });
  });

  describe('countWords', () => {
    it('should count words in a simple string', () => {
      expect(countWords('hello world')).toBe(2);
    });

    it('should handle multiple spaces', () => {
      expect(countWords('hello    world   test')).toBe(3);
    });

    it('should handle leading and trailing spaces', () => {
      expect(countWords('   hello world   ')).toBe(2);
    });

    it('should return 0 for empty string', () => {
      expect(countWords('')).toBe(0);
    });

    it('should return 0 for whitespace-only string', () => {
      expect(countWords('   ')).toBe(0);
    });

    it('should count words with punctuation', () => {
      expect(countWords('Hello, world! How are you?')).toBe(5);
    });
  });

  describe('estimateReadingTime', () => {
    it('should return null for empty text', () => {
      expect(estimateReadingTime('')).toBeNull();
    });

    it('should return null for whitespace-only text', () => {
      expect(estimateReadingTime('   ')).toBeNull();
    });

    it('should return 1 min read for short text', () => {
      const shortText = 'This is a short text.';
      expect(estimateReadingTime(shortText)).toBe('1 min read');
    });

    it('should calculate reading time for longer text', () => {
      // Create text with ~400 words (should be 2 min)
      const longText = Array(400).fill('word').join(' ');
      expect(estimateReadingTime(longText)).toBe('2 min read');
    });

    it('should round up to next minute', () => {
      // 201 words should round up to 2 min
      const text = Array(201).fill('word').join(' ');
      expect(estimateReadingTime(text)).toBe('2 min read');
    });
  });
});
