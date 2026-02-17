/**
 * CalendarDay - Individual day cell in the calendar
 */

import React from 'react';
import { CalendarDay as CalendarDayType } from '../../types/calendar.types';
import { CalendarTask } from './CalendarTask';

interface CalendarDayProps {
  day: CalendarDayType;
  onTaskClick?: (taskId: string) => void;
  onDateClick?: () => void;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  onTaskClick,
  onDateClick,
}) => {
  const { date, isCurrentMonth, isToday, tasks } = day;

  const dayNumber = date.getDate();

  // Priority colors for task limit indicators
  const hasHighPriority = tasks.some((t) => t.priority === 'high');
  const hasOverdue = tasks.some((t) => t.status === 'pending' && date < new Date());

  return (
    <div
      onClick={onDateClick}
      className={`min-h-[100px] p-2 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
        isCurrentMonth
          ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'
      } ${isToday ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''}`}
    >
      {/* Day Number */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={`text-sm font-semibold ${
            isToday
              ? 'bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
              : isCurrentMonth
              ? 'text-slate-800 dark:text-slate-200'
              : 'text-slate-400 dark:text-slate-600'
          }`}
        >
          {dayNumber}
        </span>

        {/* Task Count Badge */}
        {tasks.length > 0 && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              hasHighPriority
                ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                : hasOverdue
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            {tasks.length}
          </span>
        )}
      </div>

      {/* Tasks */}
      <div className="space-y-1">
        {tasks.slice(0, 3).map((task) => (
          <CalendarTask
            key={task.id}
            task={task}
            onClick={() => onTaskClick && onTaskClick(task.id)}
          />
        ))}

        {/* Show more indicator */}
        {tasks.length > 3 && (
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center py-1">
            +{tasks.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
};
