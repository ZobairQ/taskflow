/**
 * JSON Exporter - Export tasks to JSON format
 */

import { Task } from '../../types/task.types';
import { ExportOptions, ExportData } from '../../types/importExport.types';

const APP_VERSION = '1.0.0';

/**
 * Export tasks to JSON format
 */
export function exportToJSON(
  tasks: Task[],
  options: ExportOptions,
  gamificationData?: ExportData['gamification']
): string {
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

  // Prepare export data
  const exportData: ExportData = {
    version: APP_VERSION,
    exportedAt: Date.now(),
    app: 'TaskFlow',
    tasks: filteredTasks.map(task => {
      // Optionally strip fields based on options
      const exportedTask: Task = { ...task };

      if (!options.includeSubtasks) {
        delete exportedTask.subtasks;
      }

      return exportedTask;
    }),
  };

  // Include gamification data if requested
  if (options.includeGamification && gamificationData) {
    exportData.gamification = gamificationData;
  }

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download JSON file
 */
export function downloadJSON(content: string, filename: string = 'taskflow-export.json'): void {
  const blob = new Blob([content], { type: 'application/json' });
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
 * Generate export filename with timestamp
 */
export function generateFilename(format: string): string {
  const date = new Date();
  const timestamp = date.toISOString().split('T')[0];
  return `taskflow-export-${timestamp}.${format}`;
}
