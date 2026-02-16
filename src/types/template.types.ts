/**
 * Template Types - Type definitions for task templates
 */

import { TaskPriority } from './task.types';
import { RecurrencePattern } from './recurrence.types';

export type TemplateCategory = 'work' | 'personal' | 'health' | 'finance' | 'learning' | 'custom';

export interface TemplateVariable {
  name: string;
  placeholder: string;
  defaultValue?: string;
  required?: boolean;
}

// Simple subtask definition for templates (no id or createdAt needed)
export interface TemplateSubtask {
  text: string;
  completed: boolean;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  icon: string;
  isBuiltIn: boolean;
  createdAt: number;
  usageCount: number;
  template: {
    text: string;
    description?: string;
    priority: TaskPriority;
    category?: string;
    subtasks?: TemplateSubtask[];
    recurrencePattern?: RecurrencePattern;
    dueDate?: string;
    tags?: string[];
  };
  variables?: TemplateVariable[];
}

export interface TemplateUsageStats {
  templateId: string;
  lastUsed?: number;
  timesUsed: number;
}

export interface TemplateFilter {
  category?: TemplateCategory;
  searchQuery?: string;
  showBuiltIn?: boolean;
  showCustom?: boolean;
}

// Template variable syntax: {{variableName}}
export const VARIABLE_REGEX = /\{\{(\w+)\}\}/g;

// Helper function to check if a string contains variables
export function hasVariables(text: string): boolean {
  return VARIABLE_REGEX.test(text);
}

// Helper function to extract variable names from text
export function extractVariables(text: string): string[] {
  const matches = text.match(VARIABLE_REGEX);
  return matches ? matches.map(m => m.replace(/[{}]/g, '')) : [];
}
