/**
 * Add task form component with enhanced description, recurrence, and template features
 */

import React, { useState, useRef } from 'react';
import { TaskPriority } from '../../types';
import { RecurrencePattern } from '../../types/recurrence.types';
import { CATEGORIES, Category } from '../../constants/categories';
import { PRIORITIES } from '../../constants/priorities';
import { countWords, estimateReadingTime } from '../../utils/taskUtils';
import { getRecurrenceDescription } from '../../utils/recurrenceUtils';
import { RecurrencePicker } from './RecurrencePicker';
import { TemplateGallery } from '../templates';

interface AddTaskFormProps {
  onAdd: (task: {
    text: string;
    description: string;
    priority: TaskPriority;
    category: string;
    dueDate: string;
    isRecurring?: boolean;
    recurrencePattern?: RecurrencePattern;
    subtasks?: { id: string; text: string; completed: boolean }[];
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
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | null>(null);
  const [showRecurrencePicker, setShowRecurrencePicker] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [subtasks, setSubtasks] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (inputValue.trim() === '') return;

    onAdd({
      text: inputValue.trim(),
      description: inputDescription.trim(),
      priority,
      category,
      dueDate,
      isRecurring: isRecurring && !!recurrencePattern,
      recurrencePattern: isRecurring && recurrencePattern ? recurrencePattern : undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
    });

    resetForm();
    inputRef.current?.focus();
  };

  const resetForm = () => {
    setInputValue('');
    setInputDescription('');
    setPriority('medium');
    setCategory(CATEGORIES[0]);
    setDueDate('');
    setIsRecurring(false);
    setRecurrencePattern(null);
    setShowRecurrencePicker(false);
    setSubtasks([]);
  };

  const handleQuickAdd = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleTemplateSelect = (templateData: Partial<{
    text: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    category: string;
    subtasks: { id: string; text: string; completed: boolean }[];
    recurrencePattern: RecurrencePattern;
    dueDate: string;
  }>) => {
    setIsExpanded(true);
    if (templateData.text) setInputValue(templateData.text);
    if (templateData.description) setInputDescription(templateData.description);
    if (templateData.priority) setPriority(templateData.priority);
    if (templateData.category && CATEGORIES.includes(templateData.category as Category)) {
      setCategory(templateData.category as Category);
    }
    if (templateData.subtasks) setSubtasks(templateData.subtasks);
    if (templateData.recurrencePattern) {
      setRecurrencePattern(templateData.recurrencePattern);
      setIsRecurring(true);
    }
    if (templateData.dueDate) setDueDate(templateData.dueDate);
    setShowTemplateGallery(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleToggleRecurring = () => {
    if (!isRecurring) {
      setIsRecurring(true);
      setShowRecurrencePicker(true);
    } else {
      setIsRecurring(false);
      setShowRecurrencePicker(false);
      setRecurrencePattern(null);
    }
  };

  const descriptionLength = inputDescription.length;
  const isNearLimit = descriptionLength > MAX_DESCRIPTION_LENGTH * 0.8;
  const isAtLimit = descriptionLength >= MAX_DESCRIPTION_LENGTH;

  return (
    <>
      {/* Collapsed View */}
      {!isExpanded && (
        <div className="flex gap-3">
          <button
            onClick={handleQuickAdd}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/50 active:scale-[0.98] flex items-center justify-center gap-3 shadow-md"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-lg">Add New Task</span>
          </button>
          <button
            data-action="open-templates"
            onClick={() => setShowTemplateGallery(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-4 rounded-2xl font-semibold transition-all hover:shadow-lg hover:shadow-emerald-200 dark:hover:shadow-emerald-900/50 active:scale-[0.98] flex items-center justify-center gap-2 shadow-md"
            title="Choose from templates - Meeting prep, Bug reports, and more!"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <span className="text-lg">Templates</span>
          </button>
        </div>
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

              {/* Prominent Recurring Task Toggle */}
              <div className="pt-3 border-t border-slate-50 dark:border-slate-700 mt-2">
                <button
                  onClick={handleToggleRecurring}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    isRecurring
                      ? 'bg-indigo-100 dark:bg-indigo-900/40 border-2 border-indigo-400 dark:border-indigo-500'
                      : 'bg-slate-50 dark:bg-slate-700/50 border-2 border-dashed border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isRecurring
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className={`font-semibold ${isRecurring ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                        Make this a recurring task
                      </span>
                      {isRecurring && recurrencePattern && (
                        <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {getRecurrenceDescription(recurrencePattern)}
                        </p>
                      )}
                      {!isRecurring && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Daily, weekly, monthly, or custom schedule
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 ${
                    isRecurring ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                  }`}>
                    {isRecurring && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRecurrencePicker(!showRecurrencePicker);
                        }}
                        className="px-3 py-1 text-sm font-medium rounded-lg bg-indigo-200 dark:bg-indigo-800 hover:bg-indigo-300 dark:hover:bg-indigo-700 transition-colors"
                      >
                        {showRecurrencePicker ? 'Hide' : 'Edit'}
                      </button>
                    )}
                    <div className={`w-10 h-6 rounded-full transition-all ${
                      isRecurring ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform mt-0.5 ${
                        isRecurring ? 'translate-x-4.5 ml-0.5' : 'translate-x-0.5'
                      }`} />
                    </div>
                  </div>
                </button>

                {/* Recurrence Picker (when expanded) */}
                {isRecurring && showRecurrencePicker && (
                  <div className="mt-3 animate-in slide-in-from-top-2 fade-in duration-200">
                    <RecurrencePicker
                      value={recurrencePattern}
                      onChange={(pattern) => setRecurrencePattern(pattern)}
                      startDate={dueDate ? new Date(dueDate) : new Date()}
                    />
                  </div>
                )}
              </div>

              {/* Subtasks Preview */}
              {subtasks.length > 0 && (
                <div className="pt-3 border-t border-slate-50 dark:border-slate-700 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Subtasks ({subtasks.filter(s => s.completed).length}/{subtasks.length})
                    </span>
                    <button
                      onClick={() => setSubtasks([])}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {subtasks.map((st, index) => (
                      <div key={st.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                          st.completed
                            ? 'bg-indigo-500 border-indigo-500 text-white'
                            : 'border-slate-300 dark:border-slate-500'
                        }`}>
                          {st.completed && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={st.completed ? 'line-through text-slate-400' : ''}>
                          {st.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

              {/* Use Template Link (when expanded) */}
              {isExpanded && (
                <div className="pt-2 border-t border-slate-50 dark:border-slate-700">
                  <button
                    onClick={() => setShowTemplateGallery(true)}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    Choose from templates
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Template Gallery Modal */}
      {showTemplateGallery && (
        <TemplateGallery
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplateGallery(false)}
        />
      )}
    </>
  );
};
