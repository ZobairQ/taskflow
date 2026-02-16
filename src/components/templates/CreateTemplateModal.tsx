/**
 * CreateTemplateModal - Create a custom template from a task
 */

import React, { useState } from 'react';
import { useTheme } from '../../ThemeContext';
import { useTemplates, CATEGORY_CONFIG } from '../../contexts/TemplateContext';
import { Task } from '../../types/task.types';
import { TemplateCategory } from '../../types/template.types';

interface CreateTemplateModalProps {
  task: Task;
  onClose: () => void;
  onSuccess?: () => void;
}

const EMOJI_OPTIONS = ['⭐', '📌', '🎯', '💡', '🔥', '✨', '🚀', '📝', '📋', '🔖'];

export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  task,
  onClose,
  onSuccess,
}) => {
  const { theme } = useTheme();
  const { createFromTask } = useTemplates();

  const [name, setName] = useState(task.text);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('custom');
  const [icon, setIcon] = useState('⭐');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Template name is required');
      return;
    }

    createFromTask(task, name.trim(), description.trim(), category, icon);
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-2xl ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      } shadow-2xl`}>
        {/* Header */}
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Save as Template
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Preview */}
          <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Creating template from:</p>
            <p className="font-medium text-slate-800 dark:text-slate-100">{task.text}</p>
            {task.subtasks && task.subtasks.length > 0 && (
              <p className="text-xs text-slate-400 mt-1">
                Includes {task.subtasks.length} subtasks
              </p>
            )}
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-10 h-10 text-xl rounded-lg transition-all ${
                    icon === emoji
                      ? 'bg-indigo-100 dark:bg-indigo-900/40 ring-2 ring-indigo-500'
                      : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              Template Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="e.g., Weekly Review"
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                error ? 'border-red-500' : ''
              }`}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this template for?"
              rows={2}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['work', 'personal', 'health', 'finance', 'learning', 'custom'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    category === cat
                      ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {CATEGORY_CONFIG[cat].icon} {CATEGORY_CONFIG[cat].label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium"
            >
              Create Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
