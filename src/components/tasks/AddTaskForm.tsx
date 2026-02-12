/**
 * Add task form component
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

export const AddTaskForm: React.FC<AddTaskFormProps> = ({
  onAdd,
  showDescription = true,
}) => {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700 space-y-4">
      <div className="space-y-2">
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
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/50 active:scale-95 flex items-center justify-center min-w-[80px] shadow-md"
          >
            Add
          </button>
        </div>

        {showDescription && (
          <div className={`transition-all duration-300 ease-in-out ${inputDescription ? 'opacity-100' : 'opacity-90'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-0.5 flex-1 transition-colors duration-300 ${inputDescription ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-slate-200 dark:bg-slate-600'}`} />
              <span className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${inputDescription ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                Optional Details
              </span>
              <div className={`h-0.5 flex-1 transition-colors duration-300 ${inputDescription ? 'bg-gradient-to-l from-indigo-500 to-purple-500' : 'bg-slate-200 dark:bg-slate-600'}`} />
            </div>
            <textarea
              value={inputDescription}
              onChange={(e) => setInputDescription(e.target.value)}
              placeholder="Add a description (optional)..."
              rows={inputDescription ? 3 : 1}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 outline-none transition-all text-slate-600 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 resize-none bg-slate-50 dark:bg-slate-700/50 focus:bg-white dark:focus:bg-slate-700"
            />
            <div className="flex justify-end mt-2">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {inputDescription ? `${countWords(inputDescription)} words • ${estimateReadingTime(inputDescription)}` : 'Briefly describe your task...'}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-50 dark:border-slate-700 mt-2">
          <div className="flex gap-2 flex-wrap">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 min-w-[70px] ${
                  priority === p
                    ? `${PRIORITIES[p].badge}`
                    : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
              >
                {PRIORITIES[p].label}
              </button>
            ))}
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 outline-none bg-white dark:bg-slate-700"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 outline-none bg-white dark:bg-slate-700"
          />
        </div>
      </div>
    </div>
  );
};
