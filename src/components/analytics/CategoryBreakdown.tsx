/**
 * CategoryBreakdown - Visual breakdown of tasks by category
 */

import React from 'react';
import { useTheme } from '../../ThemeContext';
import { CategoryMetrics, PriorityMetrics } from '../../types/analytics.types';

interface CategoryBreakdownProps {
  categories: CategoryMetrics[];
  priorities: PriorityMetrics[];
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  categories,
  priorities,
}) => {
  const { theme } = useTheme();

  const totalTasks = categories.reduce((sum, c) => sum + c.count, 0);
  const totalPriority = priorities.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Categories */}
      <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          By Category
        </h3>

        {categories.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-slate-400">
            No categories
          </div>
        ) : (
          <>
            {/* Horizontal bar chart */}
            <div className="space-y-3 mb-4">
              {categories.slice(0, 5).map((cat, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-300 capitalize">{cat.category}</span>
                    <span className="text-slate-500 dark:text-slate-400">{cat.count} tasks</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(cat.count / totalTasks) * 100}%`,
                        backgroundColor: cat.color,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{categories.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Categories</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {categories.length > 0 ? categories[0].category : '-'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Most Used</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Priorities */}
      <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          By Priority
        </h3>

        {totalPriority === 0 ? (
          <div className="h-40 flex items-center justify-center text-slate-400">
            No tasks
          </div>
        ) : (
          <>
            {/* Priority bars */}
            <div className="space-y-3 mb-4">
              {priorities.filter(p => p.count > 0).map((priority, index) => {
                const colors: Record<string, string> = {
                  high: '#ef4444',
                  medium: '#f59e0b',
                  low: '#10b981',
                  none: '#6b7280',
                };

                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 dark:text-slate-300 capitalize">{priority.priority}</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {priority.count} ({priority.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${priority.percentage}%`,
                          backgroundColor: colors[priority.priority],
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>{priority.completed} completed</span>
                      <span>{priority.count - priority.completed} pending</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Completion indicator */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                  {priorities.map((p, i) => {
                    const completed = p.completed;
                    const width = (completed / totalPriority) * 100;
                    const colors: Record<string, string> = {
                      high: '#ef4444',
                      medium: '#f59e0b',
                      low: '#10b981',
                      none: '#6b7280',
                    };
                    return (
                      <div
                        key={i}
                        className="h-full"
                        style={{ width: `${width}%`, backgroundColor: colors[p.priority] }}
                      ></div>
                    );
                  })}
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                Completion by priority
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
