/**
 * Reusable task item component
 * This component eliminates ~200 lines of duplicated code between App.tsx and ProjectDetail.tsx
 */

import React, { useState } from 'react';
import { Task } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { getTaskIcon, estimateReadingTime } from '../../utils/taskUtils';
import { PriorityBadge, CategoryBadge } from '../common';

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onViewDetails?: (task: Task) => void;
  showExpandButton?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onViewDetails,
  showExpandButton = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div
      className={`group bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/50 ${
        task.completed
          ? 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50'
          : 'border-slate-100 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon & Checkbox */}
        <div className="flex-shrink-0 mt-1 flex flex-col items-center gap-2">
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${
              task.completed
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30'
                : 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-500 dark:text-indigo-400'
            }`}
          >
            <span className="text-xl">{getTaskIcon(task.priority)}</span>
          </div>
          <button
            onClick={() => onToggle(task.id)}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
              task.completed
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
            }`}
          >
            {task.completed && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h3
              className={`text-xl font-bold transition-all ${
                task.completed
                  ? 'text-slate-400 dark:text-slate-500 line-through decoration-2 decoration-slate-300 dark:decoration-slate-600'
                  : 'text-slate-800 dark:text-slate-100'
              }`}
            >
              {task.text}
            </h3>
          </div>

          {/* Description */}
          {task.description && (
            <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-24 opacity-90'} overflow-hidden relative`}>
              <div className="mb-4">
                <p className={`text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed ${task.completed ? 'text-slate-400 dark:text-slate-500' : ''}`}>
                  {task.description}
                </p>
              </div>
              {task.description.length > 100 && showExpandButton && (
                <button
                  onClick={toggleExpand}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                  <svg
                    className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Tags & Info */}
          <div className="flex flex-wrap items-center gap-2 text-xs mt-3">
            <PriorityBadge priority={task.priority} />

            <CategoryBadge category={task.category} />

            {task.dueDate && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                  new Date(task.dueDate) < new Date() && !task.completed
                    ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400'
                    : 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {task.dueDate}
                {new Date(task.dueDate) < new Date() && !task.completed && (
                  <span className="font-bold ml-1">(Overdue)</span>
                )}
              </div>
            )}

            <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(task.createdAt)}
            </span>

            {task.description && (
              <span className="text-slate-400 dark:text-slate-500">
                {estimateReadingTime(task.description)}
              </span>
            )}
          </div>
        </div>

        {/* View Details Button */}
        {onViewDetails && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(task);
            }}
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:scale-110 rounded-lg self-center"
            title="View details"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        )}

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:scale-110 rounded-lg self-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};
