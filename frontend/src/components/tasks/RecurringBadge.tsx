/**
 * RecurringBadge - Visual indicator for recurring tasks
 */

import React from 'react';
import { RecurrencePattern } from '../../types/recurrence.types';
import { getRecurrenceDescription } from '../../utils/recurrenceUtils';

interface RecurringBadgeProps {
  pattern: RecurrencePattern;
  compact?: boolean;
  className?: string;
}

export const RecurringBadge: React.FC<RecurringBadgeProps> = ({
  pattern,
  compact = false,
  className = '',
}) => {
  const description = getRecurrenceDescription(pattern);

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 ${className}`}
        title={description}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span className="hidden sm:inline">{description}</span>
      </span>
    );
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium
        bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300
        ${className}
      `}
      title={description}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      {description}
    </span>
  );
};

// Icon-only version for tight spaces
export const RecurringIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`w-4 h-4 text-indigo-500 dark:text-indigo-400 ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <title>Recurring task</title>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);
