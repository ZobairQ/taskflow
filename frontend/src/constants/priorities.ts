/**
 * Task priority configurations
 */

import { TaskPriority } from '../types';

export interface PriorityConfig {
  label: string;
  color: string;
  text: string;
  dot: string;
  badge: string;
}

export const PRIORITIES: Record<TaskPriority, PriorityConfig> = {
  low: {
    label: 'Low',
    color: 'bg-blue-500',
    text: 'text-blue-600',
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  medium: {
    label: 'Medium',
    color: 'bg-amber-500',
    text: 'text-amber-600',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  high: {
    label: 'High',
    color: 'bg-rose-500',
    text: 'text-rose-600',
    dot: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
  },
};
