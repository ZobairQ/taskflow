/**
 * Enhanced project card component with pending task preview
 */

import React, { useState } from 'react';
import { Project } from '../../types';
import { getTaskIcon } from '../../utils/taskUtils';
import { getDaysUntil, isOverdue } from '../../utils/dateUtils';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, onDelete }) => {
  const [showAllPending, setShowAllPending] = useState(false);

  const progressPercentage =
    project.totalTodos > 0 ? Math.round((project.completedTodos / project.totalTodos) * 100) : 0;

  // Get pending tasks
  const todos = project.todos || [];
  const pendingTasks = todos.filter(t => !t.completed);
  const pendingCount = pendingTasks.length;

  // Categorize pending tasks
  const highPriorityPending = pendingTasks.filter(t => t.priority === 'high');
  const mediumPriorityPending = pendingTasks.filter(t => t.priority === 'medium');

  // Get overdue and due soon tasks
  const overdueTasks = pendingTasks.filter(t => t.dueDate && isOverdue(t.dueDate));
  const dueSoonTasks = pendingTasks.filter(t => {
    if (!t.dueDate) return false;
    const days = getDaysUntil(t.dueDate);
    return days >= 0 && days <= 3;
  });

  // Get most recent pending tasks (by creation date or high priority)
  const recentPending = [...pendingTasks]
    .sort((a, b) => {
      // Prioritize high priority and recent
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, showAllPending ? 5 : 3);

  return (
    <div
      className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700 cursor-pointer relative"
      onClick={onClick}
    >
      {/* Project Header */}
      <div className={`bg-gradient-to-r ${project.color} p-5 text-white`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{project.name}</h3>
            <p className="text-white/80 text-sm">{project.totalTodos} tasks</p>
          </div>
          {pendingCount > 0 && (
            <div className="flex flex-col items-end gap-1">
              <span className="px-2 py-1 rounded-lg bg-white/20 text-xs font-bold">
                {pendingCount} pending
              </span>
              {overdueTasks.length > 0 && (
                <span className="px-2 py-1 rounded-lg bg-red-500/90 text-xs font-bold flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {overdueTasks.length} overdue
                </span>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-white/60 rounded-full transition-all duration-700"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Project Description */}
      <div className="p-5 pb-3">
        <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">
          {project.description || 'No description'}
        </p>
      </div>

      {/* Pending Tasks Preview (Only show if there are pending tasks) */}
      {pendingCount > 0 && (
        <div className="px-5 pb-5">
          {/* Priority Summary Badges */}
          <div className="flex items-center gap-2 mb-3">
            {highPriorityPending.length > 0 && (
              <span className="px-2 py-1 rounded-md bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1">
                <span className="text-sm">🔥</span>
                {highPriorityPending.length} high
              </span>
            )}
            {dueSoonTasks.length > 0 && overdueTasks.length === 0 && (
              <span className="px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {dueSoonTasks.length} due soon
              </span>
            )}
            {mediumPriorityPending.length > 0 && highPriorityPending.length === 0 && (
              <span className="px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-1">
                <span className="text-sm">⚡</span>
                {mediumPriorityPending.length} medium
              </span>
            )}
          </div>

          {/* Recent/Urgent Pending Tasks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
              <span>Up Next</span>
              {pendingCount > 3 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllPending(!showAllPending);
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {showAllPending ? 'Show less' : `+${pendingCount - 3} more`}
                </button>
              )}
            </div>

            {recentPending.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {/* Priority Icon */}
                <span className="text-base flex-shrink-0 mt-0.5">
                  {getTaskIcon(task.priority)}
                </span>

                {/* Task Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1 font-medium">
                      {task.text}
                    </p>
                    {/* Due Date Badge */}
                    {task.dueDate && (
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium ${
                        isOverdue(task.dueDate)
                          ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                          : getDaysUntil(task.dueDate) <= 1
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                          : 'bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-400'
                      }`}>
                        {isOverdue(task.dueDate) ? 'Overdue' : getDaysUntil(task.dueDate) === 0 ? 'Today' : getDaysUntil(task.dueDate) === 1 ? 'Tomorrow' : `${getDaysUntil(task.dueDate)}d`}
                      </span>
                    )}
                  </div>
                  {/* Category Badge */}
                  {task.category && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {task.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Stats Summary */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {project.completedTodos} done
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {pendingCount} pending
              </span>
            </div>
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {progressPercentage}%
            </span>
          </div>
        </div>
      )}

      {/* Completed State (All tasks done) */}
      {pendingCount === 0 && project.totalTodos > 0 && (
        <div className="px-5 pb-5">
          <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              All tasks completed! 🎉
            </span>
          </div>
        </div>
      )}

      {/* Empty State (No tasks yet) */}
      {project.totalTodos === 0 && (
        <div className="px-5 pb-5">
          <div className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
            <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              No tasks yet
            </span>
          </div>
        </div>
      )}

      {/* Delete Button */}
      {project.id !== 'default' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project.id);
          }}
          className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
