/**
 * Professional Features Type Definitions
 */

import { TaskPriority } from './task.types';

// Task Dependency Types
export type DependencyType = 'blocks' | 'blockedBy' | 'relatesTo';

export interface TaskDependency {
  id: string;
  predecessorTaskId: number;
  successorTaskId: number;
  type: DependencyType;
  createdAt: number;
}

export interface DependencyInfo {
  taskId: number;
  dependencies: TaskDependency[];
  dependents: TaskDependency[]; // Tasks that depend on this one
}

// Bulk Operation Types
export type BulkOperationType = 'delete' | 'complete' | 'uncomplete' | 'priority' | 'category' | 'move';

export interface BulkOperation {
  type: BulkOperationType;
  taskIds: number[];
  value?: string | TaskPriority;
  projectId?: number;
}

export interface BulkSelection {
  selectedIds: Set<number>;
  isAllSelected: boolean;
  lastSelectedId: number | null;
}

// Advanced Search Types
export interface SearchFilter {
  id: string;
  field: SearchField;
  operator: SearchOperator;
  value: string | number | boolean | string[];
}

export type SearchField = 'text' | 'description' | 'priority' | 'category' | 'status' | 'dueDate' | 'createdAt' | 'completedAt';

export type SearchOperator =
  | 'contains'
  | 'equals'
  | 'notEquals'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'between'
  | 'before'
  | 'after'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'in'
  | 'notIn';

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilter[];
  sortBy: SearchSort;
  createdAt: number;
}

export interface SearchSort {
  field: SearchField;
  direction: 'asc' | 'desc';
}

export interface AdvancedSearchState {
  filters: SearchFilter[];
  savedSearches: SavedSearch[];
  activeSearchId: string | null;
}

// Custom Field Types (for future extensibility)
export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox';

export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: CustomFieldType;
  options?: string[]; // For select/multiselect
  required: boolean;
  defaultValue?: string | number | boolean | string[];
}

export interface CustomFieldValue {
  fieldId: string;
  value: string | number | boolean | string[];
}

// Bulk Action Result
export interface BulkActionResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors?: { taskId: number; error: string }[];
}

// Dependency Graph Node
export interface DependencyNode {
  taskId: number;
  taskText: string;
  level: number;
  dependencies: number[];
  dependents: number[];
  status: 'pending' | 'blocked' | 'ready' | 'completed';
}
