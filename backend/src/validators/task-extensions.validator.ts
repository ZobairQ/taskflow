import { z } from 'zod';
import { TASK_CONFIG } from '../config/constants';

/**
 * Subtask validation schema
 */
export const subtaskSchema = z.object({
  id: z.string().min(1, 'Subtask ID is required'),
  text: z.string().min(1, 'Subtask text is required').max(200, 'Subtask text is too long'),
  completed: z.boolean(),
});

/**
 * Array of subtasks validation
 */
export const subtasksArraySchema = z
  .array(subtaskSchema)
  .max(TASK_CONFIG.MAX_SUBTASKS, `Maximum ${TASK_CONFIG.MAX_SUBTASKS} subtasks allowed`);

/**
 * Recurrence pattern types
 */
export const recurrenceTypeSchema = z.enum(['daily', 'weekly', 'monthly', 'yearly', 'custom']);

/**
 * Recurrence pattern validation schema
 */
export const recurrencePatternSchema = z.object({
  type: recurrenceTypeSchema,
  interval: z.number().int().min(1).max(365).default(1),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  monthOfYear: z.number().int().min(1).max(12).optional(),
  endDate: z.string().datetime().optional(),
  maxOccurrences: z.number().int().positive().optional(),
});

/**
 * Date string validation (for due dates)
 */
export const dateSchema = z.string().datetime({ message: 'Invalid date format' }).or(z.date());

/**
 * Validate and parse date
 */
export function parseDate(dateString: string | undefined | null): Date | null {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
}

/**
 * Validate and parse subtasks
 */
export function parseSubtasks(subtasks: unknown): z.infer<typeof subtaskSchema>[] | null {
  if (!subtasks) return null;

  try {
    return subtasksArraySchema.parse(subtasks);
  } catch {
    return null;
  }
}

/**
 * Validate and parse recurrence pattern
 */
export function parseRecurrencePattern(
  pattern: unknown
): z.infer<typeof recurrencePatternSchema> | null {
  if (!pattern) return null;

  try {
    return recurrencePatternSchema.parse(pattern);
  } catch {
    return null;
  }
}
