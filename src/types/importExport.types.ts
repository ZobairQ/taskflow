/**
 * Import/Export Types - Type definitions for data import and export
 */

import { Task } from './task.types';

export type ExportFormat = 'json' | 'csv' | 'pdf';
export type ImportSource = 'todoist' | 'trello' | 'generic';

export interface ExportOptions {
  format: ExportFormat;
  includeCompleted: boolean;
  includeArchived: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  projectIds?: string[];
  includeSubtasks: boolean;
  includeTimeTracking: boolean;
  includeGamification: boolean;
}

export interface ImportMapping {
  sourceField: string;
  targetField: keyof Task;
  transform?: (value: unknown) => unknown;
}

export interface ImportPreview {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  fields: string[];
  sampleData: Record<string, unknown>[];
  errors: string[];
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  warnings: string[];
  tasks: Partial<Task>[];
}

export interface ScheduledExport {
  id: string;
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  format: ExportFormat;
  lastRun?: number;
  nextRun: number;
}

// CSV field mappings for different import sources
export interface FieldMapping {
  source: string;
  target: keyof Task;
  required: boolean;
  transform?: (value: string) => unknown;
}

export const TODOIST_FIELD_MAPPINGS: FieldMapping[] = [
  { source: 'Content', target: 'text', required: true },
  { source: 'Description', target: 'description', required: false },
  { source: 'Priority', target: 'priority', required: false, transform: (v: string) => {
    const p = v.toLowerCase();
    if (p.includes('high') || p === 'p1' || p === '4') return 'high';
    if (p.includes('medium') || p === 'p2' || p === '3') return 'medium';
    return 'low';
  }},
  { source: 'Due Date', target: 'dueDate', required: false },
  { source: 'Labels', target: 'category', required: false },
  { source: 'Completed', target: 'completed', required: false, transform: (v: string) => v === 'TRUE' },
];

export const TRELLO_FIELD_MAPPINGS: FieldMapping[] = [
  { source: 'Card Name', target: 'text', required: true },
  { source: 'Description', target: 'description', required: false },
  { source: 'Due Date', target: 'dueDate', required: false },
  { source: 'Labels', target: 'category', required: false },
  { source: 'Completed', target: 'completed', required: false, transform: (v: string) => v === 'TRUE' },
];

export const GENERIC_FIELD_MAPPINGS: FieldMapping[] = [
  { source: 'Task', target: 'text', required: true },
  { source: 'Title', target: 'text', required: false },
  { source: 'Name', target: 'text', required: false },
  { source: 'Description', target: 'description', required: false },
  { source: 'Notes', target: 'description', required: false },
  { source: 'Priority', target: 'priority', required: false },
  { source: 'Due Date', target: 'dueDate', required: false },
  { source: 'DueDate', target: 'dueDate', required: false },
  { source: 'Category', target: 'category', required: false },
  { source: 'Tags', target: 'category', required: false },
  { source: 'Completed', target: 'completed', required: false },
  { source: 'Done', target: 'completed', required: false },
  { source: 'Status', target: 'status', required: false },
];

// Export data structure
export interface ExportData {
  version: string;
  exportedAt: number;
  app: 'TaskFlow';
  tasks: Task[];
  gamification?: {
    xp: number;
    level: number;
    streak: number;
    achievements: string[];
  };
}
