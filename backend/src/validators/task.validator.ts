/**
 * Task Input Validators
 */

import { z } from 'zod';

// Subtask schema
const subtaskSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Subtask text is required').max(200),
  completed: z.boolean().default(false),
});

// Recurrence pattern schema
const recurrencePatternSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'custom']),
  interval: z.number().int().min(1).max(100).default(1),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  endDate: z.string().datetime().optional().nullable(),
});

// Task priority enum
const prioritySchema = z.enum(['low', 'medium', 'high']).default('medium');

// Task status enum
const statusSchema = z.enum(['pending', 'in_progress', 'completed', 'on_hold']).optional();

// Create task schema
export const createTaskSchema = z.object({
  text: z.string().min(1, 'Task text is required').max(500),
  description: z.string().max(5000).optional(),
  priority: prioritySchema,
  status: statusSchema,
  category: z.string().max(50).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  projectId: z.string().min(1, 'Project ID is required'),
  subtasks: z.array(subtaskSchema).optional(),
  isRecurring: z.boolean().default(false),
  recurrencePattern: recurrencePatternSchema.optional(),
  tags: z.array(z.string().max(50)).optional(),
  estimatedMinutes: z.number().int().min(1).max(1440).optional(),
});

// Update task schema
export const updateTaskSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
  text: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'on_hold']).optional(),
  category: z.string().max(50).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  completed: z.boolean().optional(),
  subtasks: z.array(subtaskSchema).optional(),
  isRecurring: z.boolean().optional(),
  recurrencePattern: recurrencePatternSchema.optional().nullable(),
  tags: z.array(z.string().max(50)).optional(),
  estimatedMinutes: z.number().int().min(1).max(1440).optional().nullable(),
});

// Bulk update schema
export const bulkUpdateTasksSchema = z.object({
  taskIds: z.array(z.string()).min(1, 'At least one task ID is required'),
  updates: z.object({
    priority: z.enum(['low', 'medium', 'high']).optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'on_hold']).optional(),
    category: z.string().max(50).optional(),
    completed: z.boolean().optional(),
  }),
});

// Task filter schema
export const taskFilterSchema = z.object({
  projectId: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'on_hold']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.string().optional(),
  completed: z.boolean().optional(),
  overdue: z.boolean().optional(),
  dueBefore: z.string().datetime().optional(),
  dueAfter: z.string().datetime().optional(),
  search: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type BulkUpdateTasksInput = z.infer<typeof bulkUpdateTasksSchema>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;
