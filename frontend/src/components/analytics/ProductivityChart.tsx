/**
 * ProductivityChart - Bar chart showing tasks created vs completed over time
 */

import React from 'react';
import { useTheme } from '../../ThemeContext';
import { DailyMetrics } from '../../types/analytics.types';

interface ProductivityChartProps {
  data: DailyMetrics[];
  title?: string;
}

export const ProductivityChart: React.FC<ProductivityChartProps> = ({
  data,
  title = 'Task Activity',
}) => {
  const { theme } = useTheme();

  if (data.length === 0) {
    return (
      <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">{title}</h3>
        <div className="h-48 flex items-center justify-center text-slate-400">
          No data available for this period
        </div>
      </div>
    );
  }

  // Get max value for scaling
  const maxValue = Math.max(...data.map(d => Math.max(d.tasksCreated, d.tasksCompleted)), 1);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Show last 14 days max
  const displayData = data.slice(-14);

  return (
    <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
            <span className="text-slate-500 dark:text-slate-400">Created</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-slate-500 dark:text-slate-400">Completed</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 flex items-end gap-2">
        {displayData.map((day, index) => {
          const createdHeight = (day.tasksCreated / maxValue) * 100;
          const completedHeight = (day.tasksCompleted / maxValue) * 100;

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5 h-40 items-end">
                {/* Created bar */}
                <div className="flex-1 flex flex-col justify-end">
                  <div
                    className="w-full bg-indigo-500 rounded-t-sm transition-all hover:bg-indigo-400"
                    style={{ height: `${createdHeight}%` }}
                    title={`${day.tasksCreated} created`}
                  ></div>
                </div>
                {/* Completed bar */}
                <div className="flex-1 flex flex-col justify-end">
                  <div
                    className="w-full bg-emerald-500 rounded-t-sm transition-all hover:bg-emerald-400"
                    style={{ height: `${completedHeight}%` }}
                    title={`${day.tasksCompleted} completed`}
                  ></div>
                </div>
              </div>
              {/* Date label */}
              <span className="text-xs text-slate-400 dark:text-slate-500 truncate w-full text-center">
                {formatDate(day.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
