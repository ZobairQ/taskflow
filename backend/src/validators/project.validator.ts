/**
 * Project Input Validators
 */

import { z } from 'zod';

// Create project schema
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters'),
  description: z.string().max(1000).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
    .default('#6366f1'),
});

// Update project schema
export const updateProjectSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

// Project filter schema
export const projectFilterSchema = z.object({
  search: z.string().max(100).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectFilterInput = z.infer<typeof projectFilterSchema>;
