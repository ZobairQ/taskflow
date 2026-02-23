// @ts-nocheck
/**
 * Unit tests for useFilters hook
 */

import { renderHook, act } from '@testing-library/react';
import { useFilters } from '../../../hooks/useFilters';
import { mockTasks } from '../../../testing/mock-data';

describe('useFilters', () => {
  const tasks = mockTasks;

  beforeEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useFilters(tasks));

      expect(result.current.filter).toBe('all');
      expect(result.current.searchQuery).toBe('');
      expect(result.current.sortOption).toBe('date-desc');
      expect(result.current.advancedFilters.priority).toBe('all');
      expect(result.current.advancedFilters.category).toBe('all');
      expect(result.current.advancedFilters.status).toBe('all');
    });

    it('should return all tasks initially', () => {
      const { result } = renderHook(() => useFilters(tasks));
      expect(result.current.filteredTasks).toHaveLength(tasks.length);
    });
  });

  describe('basic filtering', () => {
    it('should filter active tasks only', () => {
      const { result } = renderHook(() => useFilters(tasks));

      act(() => {
        result.current.setFilter('active');
      });

      const activeTasks = result.current.filteredTasks;
      expect(activeTasks.every((t) => !t.completed)).toBe(true);
    });

    it('should filter completed tasks only', () => {
      const { result } = renderHook(() => useFilters(tasks));

      act(() => {
        result.current.setFilter('completed');
      });

      const completedTasks = result.current.filteredTasks;
      expect(completedTasks.every((t) => t.completed)).toBe(true);
    });

    it('should show all tasks when filter is "all"', () => {
      const { result } = renderHook(() => useFilters(tasks));

      act(() => {
        result.current.setFilter('all');
      });

      expect(result.current.filteredTasks).toHaveLength(tasks.length);
    });
  });

  describe('search filtering', () => {
    it('should filter tasks by search query', () => {
      const { result } = renderHook(() => useFilters(tasks));

      act(() => {
        result.current.setSearchQuery('project');
      });

      const filtered = result.current.filteredTasks;
      expect(filtered.length).toBeGreaterThan(0);
      expect(
        filtered.every(
          (t) =>
            t.text.toLowerCase().includes('project') ||
            (t.description && t.description.toLowerCase().includes('project'))
        )
      ).toBe(true);
    });

    it('should be case insensitive', () => {
      const { result } = renderHook(() => useFilters(tasks));

      act(() => {
        result.current.setSearchQuery('PROJECT');
      });

      const filtered = result.current.filteredTasks;
      expect(filtered.some((t) => t.text.toLowerCase().includes('project'))).toBe(true);
    });

    it('should return empty array for no matches', () => {
      const { result } = renderHook(() => useFilters(tasks));

      act(() => {
        result.current.setSearchQuery('zzzzzzzzzzz');
      });

      expect(result.current.filteredTasks).toHaveLength(0);
    });
  });

  describe('advanced filtering', () => {
    it('should filter by priority', () => {
      const { result } = renderHook(() => useFilters(tasks));

      act(() => {
        result.current.setAdvancedFilters({
          ...result.current.advancedFilters,
          priority: 'high',
        });
      });

      const filtered = result.current.filteredTasks;
      expect(filtered.every((t) => t.priority === 'high')).toBe(true);
    });

    it('should filter by category', () => {
      const { result } = renderHook(() => useFilters(tasks));

      act(() => {
        result.current.setAdvancedFilters({
          ...result.current.advancedFilters,
          category: 'work',
        });
      });

      const filtered = result.current.filteredTasks;
      expect(filtered.every((t) => t.category === 'work')).toBe(true);
    });

    it('should filter by status', () => {
      const { result } = renderHook(() => useFilters(tasks));

      act(() => {
        result.current.setAdvancedFilters({
          ...result.current.advancedFilters,
          status: 'completed',
        });
      });

      const filtered = result.current.filteredTasks;
      expect(filtered.every((t) => t.completed)).toBe(true);
    });

    it('should combine multiple filters', () => {
      const { result } = renderHook(() => useFilters(tasks));

      act(() => {
        result.current.setAdvancedFilters({
          priority: 'high',
          category: 'health',
          status: 'all',
          dateRange: { start: null, end: null },
        });
      });

      const filtered = result.current.filteredTasks;
      expect(filtered.every((t) => t.priority === 'high' && t.category === 'health')).toBe(true);
    });
  });

  describe('sorting', () => {
    it('should sort by date descending (default)', () => {
      const { result } = renderHook(() => useFilters(tasks));

      const sorted = result.current.filteredTasks;
      for (let i = 1; i < sorted.length; i++) {
        expect(new Date(sorted[i - 1].createdAt).getTime()).toBeGreaterThanOrEqual(
          new Date(sorted[i].createdAt).getTime()
        );
      }
    });

    it('should sort by date ascending', () => {
      const { result } = renderHook(() => useFilters(tasks));

      act(() => {
        result.current.setSortOption('date-asc');
      });

      const sorted = result.current.filteredTasks;
      for (let i = 1; i < sorted.length; i++) {
        expect(new Date(sorted[i - 1].createdAt).getTime()).toBeLessThanOrEqual(
          new Date(sorted[i].createdAt).getTime()
        );
      }
    });

    it('should sort by priority descending', () => {
      const { result } = renderHook(() => useFilters(tasks));

      act(() => {
        result.current.setSortOption('priority-desc');
      });

      const sorted = result.current.filteredTasks;
      const priorityValues: Record<string, number> = { high: 3, medium: 2, low: 1 };

      for (let i = 1; i < sorted.length; i++) {
        expect(priorityValues[sorted[i - 1].priority]).toBeGreaterThanOrEqual(
          priorityValues[sorted[i].priority]
        );
      }
    });

    it('should sort alphabetically', () => {
      const { result } = renderHook(() => useFilters(tasks));

      act(() => {
        result.current.setSortOption('alphabetical');
      });

      const sorted = result.current.filteredTasks;
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i - 1].text.localeCompare(sorted[i].text)).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('filter presets', () => {
    it('should save a filter preset', () => {
      const { result } = renderHook(() => useFilters(tasks));

      act(() => {
        result.current.setAdvancedFilters({
          priority: 'high',
          category: 'all',
          status: 'all',
          dateRange: { start: null, end: null },
        });
        result.current.saveFilterPreset('High Priority Tasks');
      });

      expect(result.current.filterPresets).toHaveLength(1);
      expect(result.current.filterPresets[0].name).toBe('High Priority Tasks');
    });

    it('should apply a filter preset', () => {
      const { result } = renderHook(() => useFilters(tasks));

      // Save a preset with high priority
      act(() => {
        result.current.setAdvancedFilters({
          priority: 'high',
          category: 'all',
          status: 'all',
          dateRange: { start: null, end: null },
        });
      });

      act(() => {
        result.current.saveFilterPreset('Test Preset');
      });

      // Change filters to low priority
      act(() => {
        result.current.setAdvancedFilters({
          priority: 'low',
          category: 'all',
          status: 'all',
          dateRange: { start: null, end: null },
        });
      });

      // Verify it was changed
      expect(result.current.advancedFilters.priority).toBe('low');

      // Apply the preset
      const presetId = result.current.filterPresets[0].id;
      act(() => {
        result.current.applyFilterPreset(presetId);
      });

      expect(result.current.advancedFilters.priority).toBe('high');
    });

    it('should delete a filter preset', () => {
      const { result } = renderHook(() => useFilters(tasks));

      act(() => {
        result.current.saveFilterPreset('Test Preset');
      });

      const presetId = result.current.filterPresets[0].id;

      act(() => {
        result.current.deleteFilterPreset(presetId);
      });

      expect(result.current.filterPresets).toHaveLength(0);
    });
  });
});
