/**
 * TaskGroup - Groups tasks by priority for better organization
 */

import React from 'react';
import { Task, TaskStatus } from '../../types';
import { TaskItem } from './TaskItem';

interface TaskGroupProps {
  tasks: Task[];
  onToggle: (id: number) => void;
  onStatusChange?: (id: number, status: TaskStatus) => void;
  onDelete: (id: number) => void;
  onViewDetails: (task: Task) => void;
  title: string;
  icon: string;
  colorClass: string;
  bgColorClass: string;
  borderColorClass: string;
  emptyMessage?: string;
}

export const TaskGroup: React.FC<TaskGroupProps> = ({
  tasks,
  onToggle,
  onStatusChange,
  onDelete,
  onViewDetails,
  title,
  icon,
  colorClass,
  bgColorClass,
  borderColorClass,
  emptyMessage,
}) => {
  if (tasks.length === 0 && emptyMessage) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Group Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{icon}</span>
        <h3 className={`text-lg font-bold ${colorClass}`}>
          {title}
        </h3>
        <span className={`px-2 py-1 rounded-lg ${bgColorClass} ${colorClass} text-xs font-bold`}>
          {tasks.length}
        </span>
      </div>

      {/* Tasks in this group */}
      <div className={`space-y-2 pl-2 border-l-4 ${borderColorClass}`}>
        {tasks.length === 0 ? (
          <div className="text-sm text-slate-500 dark:text-slate-400 italic py-2 pl-4">
            {emptyMessage}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
              showExpandButton={true}
            />
          ))
        )}
      </div>
    </div>
  );
};

/**
 * TaskGroupList - Groups all tasks by priority
 */

interface TaskGroupListProps {
  tasks: Task[];
  onToggle: (id: number) => void;
  onStatusChange?: (id: number, status: TaskStatus) => void;
  onDelete: (id: number) => void;
  onViewDetails: (task: Task) => void;
  showCompleted?: boolean;
  showInProgress?: boolean;
}

export const TaskGroupList: React.FC<TaskGroupListProps> = ({
  tasks,
  onToggle,
  onStatusChange,
  onDelete,
  onViewDetails,
  showCompleted = false,
  showInProgress = false,
}) => {
  // Import helper function
  const getTaskStatus = (task: Task): TaskStatus => {
    if (task.status) return task.status;
    return task.completed ? 'completed' : 'pending';
  };

  // Separate tasks by priority and status
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && !getTaskStatus(t).includes('completed'));
  const mediumPriorityTasks = tasks.filter(t => t.priority === 'medium' && !getTaskStatus(t).includes('completed'));
  const lowPriorityTasks = tasks.filter(t => t.priority === 'low' && !getTaskStatus(t).includes('completed'));

  // For completed view, we don't group by priority
  if (showCompleted) {
    const completedTasks = tasks.filter(t => getTaskStatus(t) === 'completed');
    if (completedTasks.length === 0) {
      return (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">No completed tasks yet</p>
          <p className="text-sm mt-1">Complete some tasks to see them here</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {completedTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
            showExpandButton={false}
          />
        ))}
      </div>
    );
  }

  // For in-progress view
  if (showInProgress) {
    const inProgressTasks = tasks.filter(t => getTaskStatus(t) === 'in_progress');
    if (inProgressTasks.length === 0) {
      return (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <svg className="w-16 h-16 mx-auto mb-4 text-blue-300 dark:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">No tasks in progress</p>
          <p className="text-sm mt-1">Start working on a task to see it here</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {inProgressTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
            showExpandButton={true}
          />
        ))}
      </div>
    );
  }

  // For pending tasks, group by priority
  const totalPending = highPriorityTasks.length + mediumPriorityTasks.length + lowPriorityTasks.length;

  if (totalPending === 0) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-slate-400">
        <svg className="w-16 h-16 mx-auto mb-4 text-emerald-300 dark:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg font-medium">All caught up!</p>
        <p className="text-sm mt-1">No pending tasks</p>
      </div>
    );
  }

  return (
    <div>
      <TaskGroup
        tasks={highPriorityTasks}
        onToggle={onToggle}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
        title="High Priority"
        icon="🔥"
        colorClass="text-rose-600 dark:text-rose-400"
        bgColorClass="bg-rose-100 dark:bg-rose-900/30"
        borderColorClass="border-rose-400"
        emptyMessage="No high priority tasks"
      />

      <TaskGroup
        tasks={mediumPriorityTasks}
        onToggle={onToggle}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
        title="Medium Priority"
        icon="⚡"
        colorClass="text-amber-600 dark:text-amber-400"
        bgColorClass="bg-amber-100 dark:bg-amber-900/30"
        borderColorClass="border-amber-400"
        emptyMessage="No medium priority tasks"
      />

      <TaskGroup
        tasks={lowPriorityTasks}
        onToggle={onToggle}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
        title="Low Priority"
        icon="📋"
        colorClass="text-slate-600 dark:text-slate-400"
        bgColorClass="bg-slate-100 dark:bg-slate-700"
        borderColorClass="border-slate-400"
        emptyMessage="No low priority tasks"
      />
    </div>
  );
};
