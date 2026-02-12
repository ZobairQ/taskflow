/**
 * Custom hook for managing task filters
 */

import { useState, useMemo } from 'react';
import { Task } from '../types';

export type FilterType = 'all' | 'active' | 'completed';

export interface UseFiltersReturn {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredTasks: Task[];
}

/**
 * Hook to manage task filtering and searching
 */
export function useFilters(tasks: Task[]): UseFiltersReturn {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Filter by status
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && !task.completed) ||
        (filter === 'completed' && task.completed);

      // Filter by search query
      const matchesSearch =
        task.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, searchQuery]);

  return {
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    filteredTasks,
  };
}
