/**
 * Task-related type definitions
 * Standardized naming: Todo → Task
 */

import { RecurrencePattern, RecurringTaskInstance } from './recurrence.types';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Subtask {
  id: number;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface NotificationSettings {
  enabled: boolean;
  timing: number[]; // Minutes before due date (e.g., [15, 60, 1440] for 15min, 1hr, 24hr)
  type: 'browser' | 'in-app' | 'both';
}

export interface Task {
  id: number;
  text: string;
  description: string;
  completed: boolean; // Kept for backward compatibility
  status?: TaskStatus; // New field for better status tracking
  priority: TaskPriority;
  dueDate: string | null;
  category: string;
  createdAt: number;
  completedAt?: number;
  startedAt?: number; // When task was marked as in_progress
  subtasks?: Subtask[]; // Checklist items
  notificationSettings?: NotificationSettings;
  // Recurring task fields
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  recurrenceInstances?: RecurringTaskInstance[];
  parentRecurringId?: number; // For generated instances
  recurrenceConfig?: {
    totalGenerated: number;
    lastGeneratedAt?: number;
  };
}

// Backward compatibility: Export as Todo for gradual migration
export type Todo = Task;
export type TodoData = Task;
