import { z } from 'zod';
import { TASK_CONFIG } from '../config/constants';

/**
 * Subtask input schema
 */
export const subtaskInputSchema = z.object({
  id: z.string().min(1, 'Subtask ID is required'),
  text: z
    .string()
    .min(1, 'Subtask text is required')
    .max(TASK_CONFIG.MAX_DESCRIPTION_LENGTH, 'Subtask text is too long'),
  completed: z.boolean().default(false),
});

/**
 * Array of subtask input schema
 */
export const subtaskArraySchema = z
  .array(subtaskInputSchema)
  .max(TASK_CONFIG.MAX_SUBTASKS, `Cannot have more than ${TASK_CONFIG.MAX_SUBTASKS} subtasks`)
  .default([]);

/**
 * Subtask schema for tasks (with validation)
 */
export const subtaskSchema = z.array(subtaskInputSchema).max(TASK_CONFIG.MAX_SUBTASKS).default([]);

/**
 * Subtask type inferred from schema
 */
export type SubtaskInput = z.infer<typeof subtaskInputSchema>;

/**
 * Validate subtasks array
 * @param subtasks - Raw subtasks input
 * @returns Validated subtasks array or null if invalid
 */
export const validateSubtasks = (subtasks: unknown): SubtaskInput[] | null => {
  if (!subtasks) return null;

  try {
    const result = subtaskArraySchema.safeParse(subtasks);
    if (!result.success) {
      console.warn('Invalid subtasks:', result.error.issues);
      return null;
    }
    return result.data;
  } catch (error) {
    console.error('Failed to parse subtasks:', error);
    return null;
  }
};

/**
 * Validate and parse subtasks
 * @param subtasks - Raw subtasks input
 * @returns Validated subtasks array or null if invalid
 */
export const parseSubtasks = (subtasks: unknown): SubtaskInput[] | null => {
  return validateSubtasks(subtasks);
};

/**
 * Validate a single subtask
 * @param subtask - Raw subtask input
 * @returns Validated subtask or null if invalid
 */
export const validateSingleSubtask = (subtask: unknown): SubtaskInput | null => {
  if (!subtask) return null;

  try {
    const result = subtaskInputSchema.safeParse(subtask);
    if (!result.success) {
      console.warn('Invalid subtask:', result.error.issues);
      return null;
    }
    return result.data;
  } catch (error) {
    console.error('Failed to parse subtask:', error);
    return null;
  }
};
