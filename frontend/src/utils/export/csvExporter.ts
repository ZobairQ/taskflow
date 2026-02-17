/**
 * CSV Exporter - Export tasks to CSV format
 */

import { Task } from '../../types/task.types';
import { ExportOptions } from '../../types/importExport.types';

/**
 * Convert task to CSV row
 */
function taskToCSVRow(task: Task, includeSubtasks: boolean): string {
  const escapeCSV = (value: string | number | boolean | null | undefined): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const status = task.completed ? 'completed' : (task.status || 'pending');
  const dueDate = task.dueDate || '';
  const completedAt = task.completedAt ? new Date(task.completedAt).toISOString() : '';
  const description = task.description || '';
  const subtasksCount = task.subtasks?.length || 0;
  const subtasksCompleted = task.subtasks?.filter(s => s.completed).length || 0;

  const row = [
    escapeCSV(task.id),
    escapeCSV(task.text),
    escapeCSV(description),
    escapeCSV(task.priority),
    escapeCSV(status),
    escapeCSV(task.category),
    escapeCSV(dueDate),
    escapeCSV(new Date(task.createdAt).toISOString()),
    escapeCSV(completedAt),
    escapeCSV(subtasksCount),
    escapeCSV(subtasksCompleted),
    escapeCSV(task.isRecurring ? 'Yes' : 'No'),
  ];

  return row.join(',');
}

/**
 * Get CSV headers
 */
function getCSVHeaders(): string {
  return [
    'ID',
    'Task',
    'Description',
    'Priority',
    'Status',
    'Category',
    'Due Date',
    'Created At',
    'Completed At',
    'Subtasks Total',
    'Subtasks Completed',
    'Recurring',
  ].join(',');
}

/**
 * Export tasks to CSV format
 */
export function exportToCSV(tasks: Task[], options: ExportOptions): string {
  // Filter tasks based on options
  let filteredTasks = [...tasks];

  // Filter by completion status
  if (!options.includeCompleted) {
    filteredTasks = filteredTasks.filter(t => !t.completed);
  }

  // Filter by date range
  if (options.dateRange) {
    const startDate = new Date(options.dateRange.start).getTime();
    const endDate = new Date(options.dateRange.end).getTime();
    filteredTasks = filteredTasks.filter(t => {
      const taskDate = new Date(t.createdAt).getTime();
      return taskDate >= startDate && taskDate <= endDate;
    });
  }

  // Sort by creation date (newest first)
  filteredTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Build CSV content
  const headers = getCSVHeaders();
  const rows = filteredTasks.map(task => taskToCSVRow(task, options.includeSubtasks));

  return [headers, ...rows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string = 'taskflow-export.csv'): void {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get CSV statistics
 */
export function getCSVStats(tasks: Task[], options: ExportOptions): {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  highPriority: number;
  withDueDates: number;
} {
  let filteredTasks = [...tasks];

  if (options.dateRange) {
    const startDate = new Date(options.dateRange.start).getTime();
    const endDate = new Date(options.dateRange.end).getTime();
    filteredTasks = filteredTasks.filter(t => {
      const createdTime = new Date(t.createdAt).getTime();
      return createdTime >= startDate && createdTime <= endDate;
    });
  }

  return {
    totalTasks: filteredTasks.length,
    completedTasks: filteredTasks.filter(t => t.completed).length,
    pendingTasks: filteredTasks.filter(t => !t.completed).length,
    highPriority: filteredTasks.filter(t => t.priority === 'high').length,
    withDueDates: filteredTasks.filter(t => t.dueDate).length,
  };
}
