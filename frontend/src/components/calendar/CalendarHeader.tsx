/**
 * CalendarHeader - Enhanced navigation and view mode controls for calendar
 */

import React from 'react';
import { format, isThisMonth } from 'date-fns';
import { CalendarViewMode } from '../../types/calendar.types';

interface CalendarHeaderProps {
  monthYear: string;
  currentDate: Date;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  taskStats?: {
    total: number;
    completed: number;
    highPriority: number;
  };
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  monthYear,
  currentDate,
  viewMode,
  onViewModeChange,
  onPrevious,
  onNext,
  onToday,
  taskStats,
}) => {
  const isCurrentMonth = isThisMonth(currentDate);

  return (
    <div className="space-y-4">
      {/* Main Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side - Navigation */}
        <div className="flex items-center gap-4">
          {/* Navigation Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevious}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
              title="Previous month"
            >
              <svg className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={onNext}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
              title="Next month"
            >
              <svg className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Month/Year Title */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              {monthYear}
              {isCurrentMonth && (
                <span className="text-xs font-medium px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full">
                  Current
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {format(currentDate, 'yyyy')}
            </p>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Today Button */}
          <button
            onClick={onToday}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
              isCurrentMonth
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                : 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Today
          </button>

          {/* View Mode Toggle */}
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <button
              onClick={() => onViewModeChange('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => onViewModeChange('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      {taskStats && taskStats.total > 0 && (
        <div className="flex items-center gap-4 py-3 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {taskStats.total} tasks
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">this month</p>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {taskStats.completed} done
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}% complete
              </p>
            </div>
          </div>

          {taskStats.highPriority > 0 && (
            <>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {taskStats.highPriority} urgent
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">high priority</p>
                </div>
              </div>
            </>
          )}

          {/* Keyboard shortcuts hint */}
          <div className="ml-auto hidden sm:flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 rounded">←</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 rounded">→</kbd>
              Navigate
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 rounded">T</kbd>
              Today
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
