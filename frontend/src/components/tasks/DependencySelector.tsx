/**
 * DependencySelector - Component for setting task dependencies
 */

import React, { useState, useMemo } from 'react';
import { Task } from '../../ProjectContext';
import { TaskDependency, DependencyType } from '../../types/professional.types';
import { wouldCreateCycle, getBlockingTasks } from '../../utils/dependencyUtils';

interface DependencySelectorProps {
  currentTaskId: string;
  tasks: Task[];
  dependencies: TaskDependency[];
  onAddDependency: (predecessorId: string, type: DependencyType) => void;
  onRemoveDependency: (dependencyId: string) => void;
}

export const DependencySelector: React.FC<DependencySelectorProps> = ({
  currentTaskId,
  tasks,
  dependencies,
  onAddDependency,
  onRemoveDependency,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Get current task's dependencies
  const currentDependencies = useMemo(
    () => dependencies.filter((d) => d.successorTaskId === currentTaskId),
    [dependencies, currentTaskId]
  );

  // Get available tasks to add as dependencies
  const availableTasks = useMemo(() => {
    const existingDepIds = new Set(
      currentDependencies.map((d) => d.predecessorTaskId)
    );

    return tasks.filter((task) => {
      // Can't depend on itself
      if (task.id === currentTaskId) return false;
      // Can't add duplicate dependency
      if (existingDepIds.has(task.id)) return false;
      // Check for potential cycles
      if (wouldCreateCycle(task.id, currentTaskId, dependencies)) return false;
      // Filter by search query
      if (searchQuery && !task.text.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [tasks, currentTaskId, currentDependencies, dependencies, searchQuery]);

  // Get task by ID helper
  const getTaskById = (id: string) => tasks.find((t) => t.id === id);

  const handleAddDependency = (predecessorId: string) => {
    onAddDependency(predecessorId, 'blocks');
    setShowAddMenu(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Dependencies
        </label>
        <span className="text-xs text-slate-500">
          {currentDependencies.length} blocking
        </span>
      </div>

      {/* Current dependencies */}
      {currentDependencies.length > 0 && (
        <div className="space-y-2">
          {currentDependencies.map((dep) => {
            const task = getTaskById(dep.predecessorTaskId);
            if (!task) return null;

            return (
              <div
                key={dep.id}
                className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {/* Status indicator */}
                  <div
                    className={`w-2 h-2 rounded-full ${
                      task.completed
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      task.completed
                        ? 'text-slate-400 line-through'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {task.text}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    blocks
                  </span>
                  <button
                    onClick={() => onRemoveDependency(dep.id)}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add dependency */}
      <div className="relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add blocking task
        </button>

        {showAddMenu && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-slate-200 dark:border-slate-700">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            {/* Task list */}
            <div className="max-h-48 overflow-y-auto">
              {availableTasks.length > 0 ? (
                availableTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleAddDependency(task.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        task.completed ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                      {task.text}
                    </span>
                    <span
                      className={`ml-auto text-xs px-1.5 py-0.5 rounded ${
                        task.priority === 'high'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                          : task.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-sm text-slate-500">
                  {searchQuery ? 'No matching tasks' : 'No available tasks'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Help text */}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Tasks that must be completed before this one can start
      </p>
    </div>
  );
};

/**
 * DependencyBadge - Shows dependency status for a task
 */
export const DependencyBadge: React.FC<{
  taskId: string;
  dependencies: TaskDependency[];
  tasks: Task[];
}> = ({ taskId, dependencies, tasks }) => {
  const getTaskById = (id: string) => tasks.find((t) => t.id === id);
  const blockingTasks = getBlockingTasks(taskId, dependencies, getTaskById);
  const incompleteBlocking = blockingTasks.filter((t) => !t.completed);

  if (incompleteBlocking.length === 0) return null;

  return (
    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <span className="text-xs">{incompleteBlocking.length} blocked</span>
    </div>
  );
};
