import React from 'react';
import { useTheme } from './ThemeContext';
import { Task } from './types';
import { formatDateFull, getDaysUntil } from './utils/dateUtils';
import { estimateReadingTime } from './utils/taskUtils';
import { PRIORITIES } from './constants/priorities';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
}

export function TaskModal({ task, onClose, onToggleComplete, onDelete }: TaskModalProps) {
  const { theme } = useTheme();

  const priorityStyle = PRIORITIES[task.priority];

  // Calculate time remaining or past due
  const getDeadlineStatus = () => {
    if (!task.dueDate) return { label: 'No deadline', color: 'text-slate-400', emoji: '⏱️' };

    const diffDays = getDaysUntil(task.dueDate);

    if (diffDays < 0 && !task.completed) {
      return {
        label: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`,
        color: 'text-rose-600 dark:text-rose-400 font-bold',
        emoji: '⚠️',
      };
    }
    if (diffDays === 0) {
      return { label: 'Due today', color: 'text-amber-600 dark:text-amber-400 font-bold', emoji: '📅' };
    }
    if (diffDays === 1) {
      return { label: 'Due tomorrow', color: 'text-emerald-600 dark:text-emerald-400', emoji: '📅' };
    }
    return { label: `Due in ${diffDays} days`, color: 'text-slate-500 dark:text-slate-400', emoji: '📅' };
  };

  const deadlineStatus = getDeadlineStatus();

  // Calculate reading time
  const readingTime = estimateReadingTime(task.description);

  // Handle close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent background scroll
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Close on modal background click
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Check if task is urgent (high priority and due soon)
  const isUrgent = task.priority === 'high' && deadlineStatus.label.includes('Due today');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackgroundClick}
    >
      {/* Backdrop with blur effect */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300" />

      {/* Modal Content */}
      <div
        className={`relative w-full max-w-2xl transform transition-all duration-300 ease-out animate-in fade-in zoom-in-95 ${
          theme === 'dark' ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-900'
        } rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}
      >
        {/* Header with gradient */}
        <div className={`relative px-8 py-6 ${
          isUrgent
            ? 'bg-gradient-to-r from-rose-500 to-orange-500'
            : priorityStyle.color.replace('bg-', 'bg-gradient-to-r from-')
        } text-white`}>
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full -translate-x-12 -translate-y-12 blur-2xl" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 translate-y-16 blur-2xl" />

          <div className="relative z-10 flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  task.completed ? 'bg-white/30' : 'bg-white/20'
                } backdrop-blur-sm`}>
                  {task.completed ? 'Completed' : 'In Progress'}
                </span>
                {isUrgent && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white text-rose-600 animate-pulse">
                    Urgent!
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-bold leading-tight mb-2">{task.text}</h2>
              <p className="text-white/80 text-sm">{formatDateFull(task.createdAt)}</p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Priority Info */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${priorityStyle.badge}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">{priorityStyle.label}</span>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <span className="text-lg">{deadlineStatus.emoji}</span>
              <span className={`font-medium ${deadlineStatus.color}`}>
                {deadlineStatus.label}
              </span>
            </div>

            {task.category && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="font-medium">{task.category}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                Description
              </h3>
              <div className={`prose dark:prose-invert max-w-none p-4 rounded-2xl ${
                theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-50'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed text-lg">{task.description}</p>
              </div>
              {readingTime && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-right">
                  {readingTime}
                </p>
              )}
            </div>
          )}

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Created</div>
              <div className="font-semibold text-lg">{formatDateFull(task.createdAt)}</div>
            </div>

            <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Due Date</div>
              <div className="font-semibold text-lg">
                {task.dueDate || 'No deadline'}
              </div>
            </div>
          </div>

          {/* Progress visualization (mock based on task completion state) */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Task Progress</span>
              <span className="text-sm font-bold text-emerald-500">
                {task.completed ? '100%' : '0%'}
              </span>
            </div>
            <div className={`w-full rounded-full h-3 overflow-hidden ${
              theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
            }`}>
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  task.completed
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                    : 'bg-gradient-to-r from-amber-400 to-orange-500'
                }`}
                style={{ width: task.completed ? '100%' : '0%' }}
              />
            </div>
          </div>

          {/* Motivational message */}
          {!task.completed && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white mb-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <h4 className="font-bold text-lg mb-1">Keep going!</h4>
                  <p className="text-indigo-100 text-sm">
                    Every task you complete brings you closer to your next level.
                    You're doing great!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div className={`px-8 py-6 border-t ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-slate-50'}`}>
          <div className="flex flex-wrap gap-4 justify-end">
            <button
              onClick={() => onDelete(task.id)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>

            <button
              onClick={() => onToggleComplete(task.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-lg shadow-lg ${
                task.completed
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-emerald-200/50'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/50'
              }`}
            >
              {task.completed ? (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Completed!
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mark Complete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
