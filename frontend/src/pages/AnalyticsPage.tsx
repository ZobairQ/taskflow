/**
 * AnalyticsDashboard - Productivity insights and statistics
 */

import React from 'react';
import { useTheme } from '../ThemeContext';
import { useProjects } from '../ProjectContext';
import { useAnalytics, useFocusSessions } from '../hooks/useAnalytics';
import { ProductivityChart, CategoryBreakdown, DateRangePicker } from '../components/analytics';
import { MainLayout } from '../components/layout';

export const AnalyticsDashboard: React.FC = () => {
  const { theme } = useTheme();
  const { projects } = useProjects();

  // Get all tasks from all projects
  const allTasks = projects.flatMap(p => p.todos || []).filter((t): t is NonNullable<typeof t> => t !== undefined);

  // Get focus sessions from localStorage
  const focusSessions = useFocusSessions();

  // Use analytics hook
  const {
    dateRange,
    setDateRange,
    setCustomRange,
    productivity,
    timeTracking,
    categories,
    priorities,
    insights,
    dailyMetrics,
  } = useAnalytics({
    tasks: allTasks,
    focusSessions,
    initialRange: 'week',
  });

  // Format minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Analytics</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Track your productivity and progress</p>
          </div>
        {/* Date Range Picker */}
        <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            onCustomChange={setCustomRange}
          />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {productivity.totalTasksCompleted}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Completed</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {productivity.completionRate}%
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Completion Rate</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {formatDuration(timeTracking.totalFocusTime)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Focus Time</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/30">
                <svg className="w-6 h-6 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {productivity.streakDays}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Day Streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Productivity Chart */}
        <ProductivityChart data={dailyMetrics} />

        {/* Category & Priority Breakdown */}
        <CategoryBreakdown categories={categories} priorities={priorities} />

        {/* Insights */}
        {insights.length > 0 && (
          <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Insights
            </h3>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}
                >
                  <p className="text-sm text-slate-600 dark:text-slate-300">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Productivity Patterns */}
          <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
              Productivity Patterns
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Most Productive Day</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {productivity.mostProductiveDay}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Peak Hour</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {productivity.mostProductiveHour}:00
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Avg. Daily Completed</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {productivity.averageDaily} tasks
                </span>
              </div>
            </div>
          </div>

          {/* Focus Stats */}
          <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
              Focus Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Total Focus Time</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {formatDuration(timeTracking.totalFocusTime)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Sessions Completed</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {timeTracking.sessionsCompleted}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Avg. Session</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {formatDuration(timeTracking.averageSessionLength)}
                </span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </MainLayout>
  );
};
