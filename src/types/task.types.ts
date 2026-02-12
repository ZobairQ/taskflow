/**
 * Task-related type definitions
 * Standardized naming: Todo → Task
 */

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  text: string;
  description: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate: string | null;
  category: string;
  createdAt: number;
  completedAt?: number;
}

// Backward compatibility: Export as Todo for gradual migration
export type Todo = Task;
export type TodoData = Task;
