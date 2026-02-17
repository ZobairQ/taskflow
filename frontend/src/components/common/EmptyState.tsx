/**
 * EmptyState - Illustrated empty state components
 */

import React from 'react';
import { useTheme } from '../../ThemeContext';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'tasks' | 'projects' | 'search' | 'completed' | 'custom';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  variant = 'custom',
}) => {
  const { theme } = useTheme();

  const defaultIcons: Record<string, React.ReactNode> = {
    tasks: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
    projects: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
    search: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    completed: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    custom: icon,
  };

  const displayIcon = icon || defaultIcons[variant];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Icon */}
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
          theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-100'
        }`}
      >
        <div className={theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}>
          {displayIcon}
        </div>
      </div>

      {/* Title */}
      <h3
        className={`text-xl font-semibold mb-2 ${
          theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
        }`}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={`text-center max-w-sm mb-6 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// Specific empty states
export const NoTasksEmptyState: React.FC<{ onAddTask?: () => void }> = ({ onAddTask }) => (
  <EmptyState
    variant="tasks"
    title="No tasks yet"
    description="Start by adding your first task. Stay organized and track your progress!"
    action={onAddTask ? { label: 'Add Task', onClick: onAddTask } : undefined}
  />
);

export const NoCompletedTasksEmptyState: React.FC = () => (
  <EmptyState
    variant="completed"
    title="No completed tasks"
    description="Complete some tasks and they'll show up here!"
  />
);

export const NoSearchResultsEmptyState: React.FC<{ query: string }> = ({ query }) => (
  <EmptyState
    variant="search"
    title="No results found"
    description={`We couldn't find any tasks matching "${query}". Try a different search term.`}
  />
);

export const NoProjectsEmptyState: React.FC<{ onCreateProject?: () => void }> = ({
  onCreateProject,
}) => (
  <EmptyState
    variant="projects"
    title="No projects yet"
    description="Create your first project to start organizing your tasks."
    action={onCreateProject ? { label: 'Create Project', onClick: onCreateProject } : undefined}
  />
);
