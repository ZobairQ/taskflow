/**
 * TimeReport - Timer statistics display
 */

import React from 'react';
import { useTheme } from '../../ThemeContext';
import { useTimer } from '../../TimerContext';
import { formatDuration } from '../../utils/timeTracking';

export const TimeReport: React.FC = () => {
  const { theme } = useTheme();
  const { stats, completedWorkSessions } = useTimer();

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Today */}
      <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Today</span>
        </div>
        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {formatDuration(stats.todayMinutes)}
        </div>
      </div>

      {/* This Week */}
      <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">This Week</span>
        </div>
        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {formatDuration(stats.weekMinutes)}
        </div>
      </div>

      {/* Total Sessions */}
      <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sessions</span>
        </div>
        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {completedWorkSessions}
        </div>
      </div>

      {/* Streak */}
      <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          </svg>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Day Streak</span>
        </div>
        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {stats.currentStreak} days
        </div>
      </div>
    </div>
  );
};
