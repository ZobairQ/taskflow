/**
 * useBulkOperations - Hook for managing bulk task operations
 */

import { useState, useCallback, useMemo } from 'react';
import { Task, TaskPriority } from '../types';
import {
  BulkOperation,
  BulkSelection,
  BulkActionResult,
} from '../types/professional.types';

export interface UseBulkOperationsReturn {
  // Selection state
  selection: BulkSelection;
  selectedCount: number;
  selectedTasks: Task[];

  // Selection actions
  toggleSelect: (taskId: number) => void;
  selectAll: (taskIds: number[]) => void;
  deselectAll: () => void;
  selectRange: (fromId: number, toId: number, allTaskIds: number[]) => void;

  // Bulk operations
  executeBulkOperation: (
    operation: BulkOperation,
    onExecute: (operation: BulkOperation) => BulkActionResult
  ) => BulkActionResult;

  // Helpers
  isSelected: (taskId: number) => boolean;
  hasSelection: boolean;
}

export function useBulkOperations(tasks: Task[]): UseBulkOperationsReturn {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<number | null>(null);

  // Computed values
  const selectedTasks = useMemo(
    () => tasks.filter((t) => selectedIds.has(t.id)),
    [tasks, selectedIds]
  );

  const selectedCount = selectedIds.size;
  const hasSelection = selectedCount > 0;

  // Check if task is selected
  const isSelected = useCallback(
    (taskId: number) => selectedIds.has(taskId),
    [selectedIds]
  );

  // Toggle single task selection
  const toggleSelect = useCallback((taskId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      setLastSelectedId(taskId);
      return next;
    });
  }, []);

  // Select all tasks
  const selectAll = useCallback((taskIds: number[]) => {
    setSelectedIds(new Set(taskIds));
    setLastSelectedId(taskIds[taskIds.length - 1] || null);
  }, []);

  // Deselect all tasks
  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, []);

  // Select a range of tasks (shift+click behavior)
  const selectRange = useCallback(
    (fromId: number, toId: number, allTaskIds: number[]) => {
      const fromIndex = allTaskIds.indexOf(fromId);
      const toIndex = allTaskIds.indexOf(toId);

      if (fromIndex === -1 || toIndex === -1) return;

      const start = Math.min(fromIndex, toIndex);
      const end = Math.max(fromIndex, toIndex);

      const rangeIds = allTaskIds.slice(start, end + 1);
      setSelectedIds(new Set(rangeIds));
      setLastSelectedId(toId);
    },
    []
  );

  // Execute a bulk operation
  const executeBulkOperation = useCallback(
    (operation: BulkOperation, onExecute: (op: BulkOperation) => BulkActionResult) => {
      const result = onExecute(operation);

      // Clear selection after successful operation
      if (result.success) {
        deselectAll();
      }

      return result;
    },
    [deselectAll]
  );

  return {
    selection: {
      selectedIds,
      isAllSelected: selectedCount === tasks.length && tasks.length > 0,
      lastSelectedId,
    },
    selectedCount,
    selectedTasks,
    toggleSelect,
    selectAll,
    deselectAll,
    selectRange,
    executeBulkOperation,
    isSelected,
    hasSelection,
  };
}

/**
 * Helper to create bulk operations
 */
export function createBulkDelete(taskIds: number[]): BulkOperation {
  return {
    type: 'delete',
    taskIds,
  };
}

export function createBulkComplete(taskIds: number[]): BulkOperation {
  return {
    type: 'complete',
    taskIds,
  };
}

export function createBulkUncomplete(taskIds: number[]): BulkOperation {
  return {
    type: 'uncomplete',
    taskIds,
  };
}

export function createBulkPriority(
  taskIds: number[],
  priority: TaskPriority
): BulkOperation {
  return {
    type: 'priority',
    taskIds,
    value: priority,
  };
}

export function createBulkCategory(
  taskIds: number[],
  category: string
): BulkOperation {
  return {
    type: 'category',
    taskIds,
    value: category,
  };
}

export function createBulkMove(
  taskIds: number[],
  projectId: number
): BulkOperation {
  return {
    type: 'move',
    taskIds,
    projectId,
  };
}
