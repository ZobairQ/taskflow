import { z } from 'zod';

/**
 * Recurrence frequency enum
 */
export const recurrenceFrequencySchema = z.enum(['daily', 'weekly', 'monthly', 'yearly']);

/**
 * Recurrence pattern validation schema
 * Defines the structure of a recurring task's recurrence pattern
 */
export const recurrencePatternSchema = z.object({
  frequency: recurrenceFrequencySchema,
  interval: z.number().int().min(1).max(365).default(1), // e.g., every 2 days
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(), // 0-6 (0=Sunday, 6=Saturday)
  dayOfMonth: z.number().int().min(1).max(31).optional(), // 1-31
});

/**
 * Recurrence pattern type
 */
export type RecurrencePattern = z.infer<typeof recurrencePatternSchema>;

/**
 * Validate that end date is after start date if both are provided
 */
const recurrenceWithDateValidation = recurrencePatternSchema.refine(
  (data) => {
    if (data.endDate && data.startDate) {
      return data.endDate > data.startDate;
    }
    return true;
  },
  {
    message: 'End date must be after start date',
  }
);

/**
 * Validate and parse a recurrence pattern
 * @param input - Raw input (unknown)
 * @returns The parsed recurrence pattern or null if invalid
 */
export const parseRecurrencePattern = (input: unknown): RecurrencePattern | null => {
  if (!input) return null;

  try {
    const result = recurrenceWithDateValidation.safeParse(input);
    if (!result.success) {
      console.warn('Invalid recurrence pattern:', result.error.issues);
      return null;
    }
    return result.data;
  } catch (error) {
    console.error('Failed to parse recurrence pattern:', error);
    return null;
  }
};

/**
 * Validate a recurrence pattern
 * @param input - Raw input (unknown)
 * @returns True if valid, false otherwise
 */
export const isValidRecurrencePattern = (input: unknown): input is RecurrencePattern => {
  return parseRecurrencePattern(input) !== null;
};

/**
 * Task creation input with recurrence schema
 */
export const taskRecurrenceInputSchema = z.object({
  isRecurring: z.boolean().optional().default(false),
  recurrence: recurrencePatternSchema.optional(),
  fromTemplate: z.boolean().optional(),
  templateId: z.string().optional(),
});

/**
 * Task recurrence input type
 */
export type TaskRecurrenceInput = z.infer<typeof taskRecurrenceInputSchema>;

/**
 * Validate task creation input with recurrence
 * @param input - Raw input
 * @returns Validated input or null if invalid
 */
export const parseTaskRecurrenceInput = (input: unknown): TaskRecurrenceInput | null => {
  if (!input) return null;

  try {
    const result = taskRecurrenceInputSchema.safeParse(input);
    if (!result.success) {
      console.warn('Invalid task recurrence input:', result.error.issues);
      return null;
    }
    return result.data;
  } catch (error) {
    console.error('Failed to parse task recurrence input:', error);
    return null;
  }
};
