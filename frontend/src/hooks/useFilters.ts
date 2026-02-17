/**
 * Custom hook for managing task filters with advanced filtering capabilities
 */

import { useState, useMemo } from 'react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { getTaskStatus } from '../utils/taskUtils';

export type FilterType = 'all' | 'active' | 'completed';

export interface AdvancedFilters {
  priority: TaskPriority | 'all';
  category: string | 'all';
  status: TaskStatus | 'all';
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

export type SortOption = 'date-desc' | 'date-asc' | 'priority-desc' | 'priority-asc' | 'alphabetical';

export interface FilterPreset {
  id: string;
  name: string;
  filters: AdvancedFilters;
  sort: SortOption;
}

export interface UseFiltersReturn {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredTasks: Task[];
  advancedFilters: AdvancedFilters;
  setAdvancedFilters: (filters: AdvancedFilters) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  filterPresets: FilterPreset[];
  saveFilterPreset: (name: string) => void;
  deleteFilterPreset: (id: string) => void;
  applyFilterPreset: (id: string) => void;
}

const PRIORITY_VALUES: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Hook to manage task filtering and searching with advanced capabilities
 */
export function useFilters(tasks: Task[]): UseFiltersReturn {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    priority: 'all',
    category: 'all',
    status: 'all',
    dateRange: {
      start: null,
      end: null,
    },
  });
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>(() => {
    const saved = localStorage.getItem('filterPresets');
    return saved ? JSON.parse(saved) : [];
  });

  const filteredTasks = useMemo(() => {
    let result = tasks.filter((task) => {
      // Basic filter (all/active/completed)
      const matchesBasicFilter =
        filter === 'all' ||
        (filter === 'active' && !task.completed) ||
        (filter === 'completed' && task.completed);

      // Advanced filters
      const matchesPriority =
        advancedFilters.priority === 'all' || task.priority === advancedFilters.priority;

      const matchesCategory =
        advancedFilters.category === 'all' || task.category === advancedFilters.category;

      const taskStatus = getTaskStatus(task);
      const matchesStatus =
        advancedFilters.status === 'all' || taskStatus === advancedFilters.status;

      // Date range filter
      const matchesDateRange = (() => {
        if (!task.dueDate) return true;
        if (!advancedFilters.dateRange.start && !advancedFilters.dateRange.end) return true;

        const taskDate = new Date(task.dueDate);
        const startDate = advancedFilters.dateRange.start
          ? new Date(advancedFilters.dateRange.start)
          : null;
        const endDate = advancedFilters.dateRange.end
          ? new Date(advancedFilters.dateRange.end)
          : null;

        if (startDate && taskDate < startDate) return false;
        if (endDate && taskDate > endDate) return false;
        return true;
      })();

      // Search filter
      const matchesSearch =
        task.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());

      return (
        matchesBasicFilter &&
        matchesPriority &&
        matchesCategory &&
        matchesStatus &&
        matchesDateRange &&
        matchesSearch
      );
    });

    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority-desc':
          return PRIORITY_VALUES[b.priority] - PRIORITY_VALUES[a.priority];
        case 'priority-asc':
          return PRIORITY_VALUES[a.priority] - PRIORITY_VALUES[b.priority];
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, filter, searchQuery, advancedFilters, sortOption]);

  const saveFilterPreset = (name: string) => {
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name,
      filters: { ...advancedFilters },
      sort: sortOption,
    };
    const updated = [...filterPresets, newPreset];
    setFilterPresets(updated);
    localStorage.setItem('filterPresets', JSON.stringify(updated));
  };

  const deleteFilterPreset = (id: string) => {
    const updated = filterPresets.filter((p) => p.id !== id);
    setFilterPresets(updated);
    localStorage.setItem('filterPresets', JSON.stringify(updated));
  };

  const applyFilterPreset = (id: string) => {
    const preset = filterPresets.find((p) => p.id === id);
    if (preset) {
      setAdvancedFilters(preset.filters);
      setSortOption(preset.sort);
    }
  };

  return {
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    filteredTasks,
    advancedFilters,
    setAdvancedFilters,
    sortOption,
    setSortOption,
    filterPresets,
    saveFilterPreset,
    deleteFilterPreset,
    applyFilterPreset,
  };
}
