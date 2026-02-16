/**
 * CalendarTask - Individual task display within calendar day cell
 */

import React from 'react';
import { CalendarTask as CalendarTaskType } from '../../types/calendar.types';

interface CalendarTaskProps {
  task: CalendarTaskType;
  onClick?: () => void;
}

export const CalendarTask: React.FC<CalendarTaskProps> = ({ task, onClick }) => {
  const { text, priority, status } = task;

  // Priority colors
  const priorityColors = {
    high: 'bg-rose-500',
    medium: 'bg-amber-500',
    low: 'bg-emerald-500',
  };

  // Status opacity
  const statusStyles = {
    pending: '',
    in_progress: 'ring-2 ring-blue-400',
    completed: 'opacity-50 line-through',
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick && onClick();
      }}
      className={`group relative flex items-center gap-2 p-1.5 rounded-md text-xs font-medium cursor-pointer
        hover:bg-slate-100 dark:hover:bg-slate-700 transition-all ${statusStyles[status]}`}
      title={text}
    >
      {/* Priority indicator */}
      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColors[priority]}`}
      />

      {/* Task text - truncate if too long */}
      <span className="flex-1 truncate text-slate-700 dark:text-slate-300">
        {text}
      </span>

      {/* Status icon for completed */}
      {status === 'completed' && (
        <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}

      {/* Status icon for in progress */}
      {status === 'in_progress' && (
        <svg className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )}
    </div>
  );
};
