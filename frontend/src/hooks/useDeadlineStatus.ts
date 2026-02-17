/**
 * useDeadlineStatus - Hook for calculating deadline status
 */

import { useMemo } from 'react';
import { getDaysUntil } from '../utils/dateUtils';

interface DeadlineStatus {
  label: string;
  color: string;
  emoji: string;
  isOverdue: boolean;
  isDueToday: boolean;
  isDueTomorrow: boolean;
}

export function useDeadlineStatus(dueDate: string | undefined, isCompleted: boolean): DeadlineStatus {
  return useMemo(() => {
    if (!dueDate) {
      return {
        label: 'No deadline',
        color: 'text-slate-400',
        emoji: '⏱️',
        isOverdue: false,
        isDueToday: false,
        isDueTomorrow: false,
      };
    }

    const diffDays = getDaysUntil(dueDate);

    if (diffDays < 0 && !isCompleted) {
      return {
        label: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`,
        color: 'text-rose-600 dark:text-rose-400 font-bold',
        emoji: '⚠️',
        isOverdue: true,
        isDueToday: false,
        isDueTomorrow: false,
      };
    }

    if (diffDays === 0) {
      return {
        label: 'Due today',
        color: 'text-amber-600 dark:text-amber-400 font-bold',
        emoji: '📅',
        isOverdue: false,
        isDueToday: true,
        isDueTomorrow: false,
      };
    }

    if (diffDays === 1) {
      return {
        label: 'Due tomorrow',
        color: 'text-emerald-600 dark:text-emerald-400',
        emoji: '📅',
        isOverdue: false,
        isDueToday: false,
        isDueTomorrow: true,
      };
    }

    return {
      label: `Due in ${diffDays} days`,
      color: 'text-slate-500 dark:text-slate-400',
      emoji: '📅',
      isOverdue: false,
      isDueToday: false,
      isDueTomorrow: false,
    };
  }, [dueDate, isCompleted]);
}
