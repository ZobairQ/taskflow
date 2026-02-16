/**
 * CalendarHeader - Navigation and view mode controls for calendar
 */

import React from 'react';
import { CalendarViewMode } from '../../types/calendar.types';

interface CalendarHeaderProps {
  monthYear: string;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  monthYear,
  viewMode,
  onViewModeChange,
  onPrevious,
  onNext,
  onToday,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      {/* Left Side - Navigation */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {monthYear}
        </h2>

        <div className="flex gap-1">
          <button
            onClick={onPrevious}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Previous"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={onNext}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Next"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={onToday}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Right Side - View Mode Toggle */}
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
  );
};
