/**
 * CSV Importer - Import tasks from CSV format
 */

import { Task, TaskPriority } from '../../types/task.types';
import {
  ImportResult,
  ImportPreview,
  FieldMapping,
  GENERIC_FIELD_MAPPINGS,
  TODOIST_FIELD_MAPPINGS,
  TRELLO_FIELD_MAPPINGS,
} from '../../types/importExport.types';

/**
 * Parse CSV content into rows
 */
function parseCSV(content: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = content.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Parse CSV line handling quoted values
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (inQuotes) {
        if (char === '"') {
          if (line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    rows.push(row);
  }

  return { headers, rows };
}

/**
 * Detect import source based on headers
 */
export function detectImportSource(headers: string[]): 'todoist' | 'trello' | 'generic' {
  const headerLower = headers.map(h => h.toLowerCase());

  // Check for Todoist headers
  if (headerLower.includes('content') || headerLower.includes('task content')) {
    return 'todoist';
  }

  // Check for Trello headers
  if (headerLower.includes('card name') || headerLower.includes('card title')) {
    return 'trello';
  }

  return 'generic';
}

/**
 * Get field mappings for a source
 */
export function getFieldMappings(source: 'todoist' | 'trello' | 'generic'): FieldMapping[] {
  switch (source) {
    case 'todoist':
      return TODOIST_FIELD_MAPPINGS;
    case 'trello':
      return TRELLO_FIELD_MAPPINGS;
    default:
      return GENERIC_FIELD_MAPPINGS;
  }
}

/**
 * Preview CSV import
 */
export function previewCSVImport(content: string, source: 'todoist' | 'trello' | 'generic' = 'generic'): ImportPreview {
  const { headers, rows } = parseCSV(content);
  const mappings = getFieldMappings(source);

  const errors: string[] = [];
  let validRows = 0;
  let invalidRows = 0;

  // Find required fields
  const requiredMappings = mappings.filter(m => m.required);
  const requiredFields = requiredMappings.map(m => m.source.toLowerCase());

  // Check if required fields exist
  const headerLower = headers.map(h => h.toLowerCase());
  for (const field of requiredFields) {
    if (!headerLower.includes(field)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate rows
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let hasRequired = true;

    for (const mapping of requiredMappings) {
      const header = headers.find(h => h.toLowerCase() === mapping.source.toLowerCase());
      if (header && !row[header]) {
        hasRequired = false;
        break;
      }
    }

    if (hasRequired) {
      validRows++;
    } else {
      invalidRows++;
    }
  }

  return {
    totalRows: rows.length,
    validRows,
    invalidRows,
    fields: headers,
    sampleData: rows.slice(0, 5),
    errors,
  };
}

/**
 * Map CSV row to task
 */
function mapRowToTask(
  row: Record<string, string>,
  headers: string[],
  mappings: FieldMapping[],
  idOffset: number
): Partial<Task> | null {
  const task: Partial<Task> = {};

  for (const mapping of mappings) {
    // Find matching header (case-insensitive)
    const header = headers.find(h => h.toLowerCase() === mapping.source.toLowerCase());

    if (!header) continue;

    const value = row[header];
    if (!value && mapping.required) {
      return null;
    }

    if (!value) continue;

    // Apply transformation or direct assignment
    if (mapping.transform) {
      task[mapping.target] = mapping.transform(value) as never;
    } else {
      task[mapping.target] = value as never;
    }
  }

  // Ensure required fields
  if (!task.text) {
    return null;
  }

  // Set defaults
  task.id = Date.now() + idOffset;
  task.createdAt = Date.now();
  task.completed = task.completed || false;
  task.priority = (task.priority as TaskPriority) || 'medium';
  task.description = task.description || '';
  task.category = task.category || '';
  task.dueDate = task.dueDate || null;

  return task;
}

/**
 * Import tasks from CSV
 */
export function importFromCSV(
  content: string,
  source: 'todoist' | 'trello' | 'generic' = 'generic'
): ImportResult {
  const { headers, rows } = parseCSV(content);
  const mappings = getFieldMappings(source);

  const tasks: Partial<Task>[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    try {
      const task = mapRowToTask(row, headers, mappings, i);

      if (task) {
        tasks.push(task);
      } else {
        skipped++;
        warnings.push(`Row ${i + 2}: Missing required field(s)`);
      }
    } catch (error) {
      skipped++;
      errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    success: errors.length === 0,
    imported: tasks.length,
    skipped,
    errors,
    warnings,
    tasks,
  };
}

/**
 * Parse JSON export file
 */
export function parseJSONExport(content: string): { tasks: Partial<Task>[]; errors: string[] } {
  try {
    const data = JSON.parse(content);

    if (!data.tasks || !Array.isArray(data.tasks)) {
      return { tasks: [], errors: ['Invalid export file: missing tasks array'] };
    }

    const tasks: Partial<Task>[] = data.tasks.map((t: Partial<Task>, i: number) => ({
      ...t,
      id: Date.now() + i,
      createdAt: t.createdAt || Date.now(),
    }));

    return { tasks, errors: [] };
  } catch (error) {
    return {
      tasks: [],
      errors: [`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}
