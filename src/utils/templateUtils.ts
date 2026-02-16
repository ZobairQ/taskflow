/**
 * Template Utilities - Functions for working with templates
 */

import { TaskTemplate, TemplateVariable, VARIABLE_REGEX } from '../types/template.types';
import { Task, Subtask } from '../types/task.types';

/**
 * Replace template variables in text with provided values
 */
export function interpolateVariables(
  text: string,
  values: Record<string, string>
): string {
  return text.replace(VARIABLE_REGEX, (match, varName) => {
    return values[varName] || match;
  });
}

/**
 * Get default values for template variables
 */
export function getDefaultVariableValues(
  variables?: TemplateVariable[]
): Record<string, string> {
  if (!variables) return {};
  const defaults: Record<string, string> = {};
  variables.forEach(v => {
    if (v.defaultValue) {
      defaults[v.name] = v.defaultValue;
    }
  });
  return defaults;
}

/**
 * Check if all required variables have values
 */
export function validateVariables(
  variables: TemplateVariable[] | undefined,
  values: Record<string, string>
): { valid: boolean; missing: string[] } {
  if (!variables) return { valid: true, missing: [] };

  const missing: string[] = [];
  variables.forEach(v => {
    if (v.required && !values[v.name]?.trim()) {
      missing.push(v.name);
    }
  });

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Create a task from a template
 */
export function createTaskFromTemplate(
  template: TaskTemplate,
  variableValues: Record<string, string> = {}
): Partial<Task> {
  const values = {
    ...getDefaultVariableValues(template.variables),
    ...variableValues,
  };

  const text = interpolateVariables(template.template.text, values);
  const description = template.template.description
    ? interpolateVariables(template.template.description, values)
    : '';

  // Create subtasks with unique IDs
  const now = Date.now();
  const subtasks: Subtask[] | undefined = template.template.subtasks?.map((st, index) => ({
    id: now + index,
    text: interpolateVariables(st.text, values),
    completed: st.completed,
    createdAt: now,
  }));

  return {
    text,
    description,
    priority: template.template.priority,
    category: template.template.category,
    subtasks,
    recurrencePattern: template.template.recurrencePattern,
    dueDate: template.template.dueDate,
  };
}

/**
 * Create a custom template from a task
 */
export function createTemplateFromTask(
  task: Task,
  name: string,
  description: string,
  category: TaskTemplate['category'] = 'custom',
  icon: string = '⭐'
): TaskTemplate {
  return {
    id: `custom-${Date.now()}`,
    name,
    description,
    category,
    icon,
    isBuiltIn: false,
    createdAt: Date.now(),
    usageCount: 0,
    template: {
      text: task.text,
      description: task.description,
      priority: task.priority,
      category: task.category,
      subtasks: task.subtasks?.map(s => ({ text: s.text, completed: false })),
      recurrencePattern: task.recurrencePattern,
      dueDate: task.dueDate || undefined,
    },
  };
}

/**
 * Generate a unique ID for custom templates
 */
export function generateTemplateId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sort templates by usage count (most used first)
 */
export function sortTemplatesByUsage(templates: TaskTemplate[]): TaskTemplate[] {
  return [...templates].sort((a, b) => b.usageCount - a.usageCount);
}

/**
 * Filter templates based on criteria
 */
export function filterTemplates(
  templates: TaskTemplate[],
  filter: {
    category?: TaskTemplate['category'];
    searchQuery?: string;
    showBuiltIn?: boolean;
    showCustom?: boolean;
  }
): TaskTemplate[] {
  let filtered = [...templates];

  if (filter.category) {
    filtered = filtered.filter(t => t.category === filter.category);
  }

  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase();
    filtered = filtered.filter(
      t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.template.text.toLowerCase().includes(query)
    );
  }

  if (filter.showBuiltIn === false) {
    filtered = filtered.filter(t => !t.isBuiltIn);
  }

  if (filter.showCustom === false) {
    filtered = filtered.filter(t => t.isBuiltIn);
  }

  return filtered;
}
