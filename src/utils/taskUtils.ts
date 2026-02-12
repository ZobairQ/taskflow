/**
 * Task-related utility functions
 */

import { TaskPriority } from '../types';
import { PRIORITIES } from '../constants/priorities';

/**
 * Get the badge CSS classes for a priority level
 */
export function getPriorityBadge(priority: TaskPriority | string): string {
  switch (priority) {
    case 'high':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'medium':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'low':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

/**
 * Get the emoji icon for a priority level
 */
export function getTaskIcon(priority: TaskPriority | string): string {
  switch (priority) {
    case 'high':
      return '🔥';
    case 'medium':
      return '⚡';
    case 'low':
      return '💡';
    default:
      return '📝';
  }
}

/**
 * Count words in a text string
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

/**
 * Estimate reading time for a text
 * @returns Reading time string (e.g., "2 min read") or null if text is empty
 */
export function estimateReadingTime(text: string): string | null {
  const words = countWords(text);
  if (words === 0) return null;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

/**
 * Get priority configuration
 */
export function getPriorityConfig(priority: TaskPriority) {
  return PRIORITIES[priority];
}
