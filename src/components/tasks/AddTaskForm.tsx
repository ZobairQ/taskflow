/**
 * Add task form component with enhanced description features
 */

import React, { useState, useRef } from 'react';
import { TaskPriority } from '../../types';
import { CATEGORIES, Category } from '../../constants/categories';
import { PRIORITIES } from '../../constants/priorities';
import { countWords, estimateReadingTime } from '../../utils/taskUtils';

interface AddTaskFormProps {
  onAdd: (task: {
    text: string;
    description: string;
    priority: TaskPriority;
    category: string;
    dueDate: string;
  }) => void;
  showDescription?: boolean;
}

const MAX_DESCRIPTION_LENGTH = 1000;

export const AddTaskForm: React.FC<AddTaskFormProps> = ({
  onAdd,
  showDescription = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputDescription, setInputDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [dueDate, setDueDate] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (inputValue.trim() === '') return;

    onAdd({
      text: inputValue.trim(),
      description: inputDescription.trim(),
      priority,
      category,
      dueDate,
    });

    setInputValue('');
    setInputDescription('');
    setPriority('medium');
    setDueDate('');
    inputRef.current?.focus();
  };

  const handleQuickAdd = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const descriptionLength = inputDescription.length;
  const isNearLimit = descriptionLength > MAX_DESCRIPTION_LENGTH * 0.8;
  const isAtLimit = descriptionLength >= MAX_DESCRIPTION_LENGTH;

  return (
    <>
      {/* Collapsed View */}
      {!isExpanded && (
        <button
          onClick={handleQuickAdd}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/50 active:scale-[0.98] flex items-center justify-center gap-3 shadow-md"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="text-lg">Add New Task</span>
        </button>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
          {/* Header with collapse button */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Task
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Collapse"
            >
              <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              {/* Main Task Input */}
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="What needs to be done?"
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 outline-none transition-all text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-lg bg-white dark:bg-slate-700"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!inputValue.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/50 active:scale-95 flex items-center justify-center min-w-[80px] shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  Add
                </button>
              </div>

              {/* Enhanced Description Section */}
              {showDescription && (
                <div className="space-y-2">
                  {/* Decorative Header */}
                  <div className="flex items-center gap-2 mb-3 pt-2">
                    <div className={`h-0.5 flex-1 transition-colors duration-300 ${inputDescription ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-slate-200 dark:bg-slate-600'}`} />
                    <span className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${inputDescription ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      Optional Details
                    </span>
                    <div className={`h-0.5 flex-1 transition-colors duration-300 ${inputDescription ? 'bg-gradient-to-l from-indigo-500 to-purple-500' : 'bg-slate-200 dark:bg-slate-600'}`} />
                  </div>

                  {/* Description Textarea with Enhanced Features */}
                  <div className="relative">
                    <textarea
                      value={inputDescription}
                      onChange={(e) => setInputDescription(e.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
                      placeholder="Add context, notes, or steps to complete this task...

💡 Tips:
• Break down complex tasks into steps
• Add links, reference materials
• Include acceptance criteria"
                      rows={inputDescription ? 4 : 3}
                      className={`w-full px-4 py-3 rounded-xl border transition-all text-slate-600 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 resize-none bg-slate-50 dark:bg-slate-700/50 focus:bg-white dark:focus:bg-slate-700 ${
                        isAtLimit
                          ? 'border-rose-300 dark:border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900/50'
                          : isNearLimit
                          ? 'border-amber-300 dark:border-amber-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900/50'
                          : 'border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50'
                      } outline-none`}
                    />

                    {/* Character Counter */}
                    {descriptionLength > 0 && (
                      <div className={`absolute bottom-2 right-2 text-xs font-medium transition-colors ${
                        isAtLimit
                          ? 'text-rose-500'
                          : isNearLimit
                          ? 'text-amber-500'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
                      </div>
                    )}
                  </div>

                  {/* Stats Bar */}
                  {inputDescription && (
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {countWords(inputDescription)} words
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {estimateReadingTime(inputDescription)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-50 dark:border-slate-700 mt-2">
                {/* Priority Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Priority
                  </label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 ${
                          priority === p
                            ? `${PRIORITIES[p].badge} shadow-sm`
                            : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                        }`}
                      >
                        {PRIORITIES[p].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 outline-none bg-white dark:bg-slate-700"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 outline-none bg-white dark:bg-slate-700"
                  />
                </div>
              </div>

              {/* Quick Tips Footer */}
              {showDescription && !inputValue && (
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-50 dark:border-slate-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    <strong>Pro tip:</strong> Use Shift+Enter to add a new line, Enter to submit task
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
