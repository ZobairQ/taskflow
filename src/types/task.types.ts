/**
 * Task-related type definitions
 * Standardized naming: Todo → Task
 */

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

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
}

// Backward compatibility: Export as Todo for gradual migration
export type Todo = Task;
export type TodoData = Task;
