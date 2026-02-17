/**
 * TaskBreakdown - AI-powered task breakdown suggestions
 * Helps users break complex tasks into manageable subtasks
 */

import React, { useState, useEffect } from 'react';
import { getBreakdownSuggestions, getSmartSuggestions } from '../../utils/ai/smartSuggestions';

interface SubtaskSuggestion {
  id: string;
  text: string;
  selected: boolean;
}

interface TaskBreakdownProps {
  taskText: string;
  onApply: (subtasks: string[]) => void;
  onClose: () => void;
  existingSubtasks?: string[];
}

export const TaskBreakdown: React.FC<TaskBreakdownProps> = ({
  taskText,
  onApply,
  onClose,
  existingSubtasks = [],
}) => {
  const [suggestions, setSuggestions] = useState<SubtaskSuggestion[]>([]);
  const [customSubtask, setCustomSubtask] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Generate suggestions based on task text
  useEffect(() => {
    setIsLoading(true);

    // Simulate slight delay for better UX
    const timer = setTimeout(() => {
      const breakdown = getBreakdownSuggestions(taskText);
      const smartSuggestions = getSmartSuggestions(taskText);

      // Combine breakdown suggestions with time-based suggestions
      const allSuggestions = [
        ...breakdown.map((text, idx) => ({
          id: `breakdown-${idx}`,
          text,
          selected: !existingSubtasks.includes(text),
        })),
      ];

      // Add time-based suggestions as subtasks if relevant
      if (smartSuggestions.time) {
        allSuggestions.push({
          id: 'time-suggestion',
          text: `${smartSuggestions.time.reason} - ${taskText}`,
          selected: false,
        });
      }

      setSuggestions(allSuggestions);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [taskText, existingSubtasks]);

  // Toggle suggestion selection
  const toggleSuggestion = (id: string) => {
    setSuggestions(prev =>
      prev.map(s => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  // Add custom subtask
  const addCustomSubtask = () => {
    if (!customSubtask.trim()) return;

    setSuggestions(prev => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        text: customSubtask.trim(),
        selected: true,
      },
    ]);
    setCustomSubtask('');
  };

  // Apply selected subtasks
  const handleApply = () => {
    const selectedSubtasks = suggestions
      .filter(s => s.selected)
      .map(s => s.text);

    onApply(selectedSubtasks);
  };

  // Select all / none
  const selectedCount = suggestions.filter(s => s.selected).length;
  const allSelected = selectedCount === suggestions.length && suggestions.length > 0;

  const toggleSelectAll = () => {
    setSuggestions(prev =>
      prev.map(s => ({ ...s, selected: !allSelected }))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Break Down Task
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            "{taskText.slice(0, 50)}{taskText.length > 50 ? '...' : ''}"
          </p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              <span className="ml-3 text-slate-500 dark:text-slate-400">
                Analyzing task...
              </span>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                No suggestions available for this task type.
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Add custom subtasks below.
              </p>
            </div>
          ) : (
            <>
              {/* Select all */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Suggested subtasks
                </span>
                <button
                  onClick={toggleSelectAll}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {allSelected ? 'Deselect all' : 'Select all'}
                </button>
              </div>

              {/* Suggestions list */}
              <div className="space-y-2">
                {suggestions.map((suggestion) => (
                  <label
                    key={suggestion.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      suggestion.selected
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800'
                        : 'bg-slate-50 dark:bg-slate-700/50 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={suggestion.selected}
                      onChange={() => toggleSuggestion(suggestion.id)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <span className={`flex-1 text-sm ${
                      suggestion.selected
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}>
                      {suggestion.text}
                    </span>
                    {suggestion.id.startsWith('breakdown') && (
                      <span className="text-xs text-indigo-500 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full">
                        AI
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </>
          )}

          {/* Add custom subtask */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Add custom subtask
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSubtask}
                onChange={(e) => setCustomSubtask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomSubtask()}
                placeholder="Enter subtask..."
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={addCustomSubtask}
                disabled={!customSubtask.trim()}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {selectedCount} subtask{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={selectedCount === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Apply Subtasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook to use task breakdown
 */
export const useTaskBreakdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<{
    text: string;
    onApply: (subtasks: string[]) => void;
  } | null>(null);

  const open = (taskText: string, onApply: (subtasks: string[]) => void) => {
    setCurrentTask({ text: taskText, onApply });
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setCurrentTask(null);
  };

  const handleApply = (subtasks: string[]) => {
    if (currentTask) {
      currentTask.onApply(subtasks);
    }
    close();
  };

  return {
    isOpen,
    taskText: currentTask?.text || '',
    open,
    close,
    handleApply,
  };
};

export default TaskBreakdown;
