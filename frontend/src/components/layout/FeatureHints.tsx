/**
 * FeatureHints - Helpful tips to discover app features
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../ThemeContext';

interface Hint {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const HINTS: Hint[] = [
  {
    id: 'templates',
    title: 'Quick Start with Templates',
    description: 'Use pre-made templates for common tasks like meetings, bug reports, and workouts.',
    icon: '📋',
  },
  {
    id: 'recurring',
    title: 'Recurring Tasks',
    description: 'Set tasks to repeat daily, weekly, or monthly. Perfect for habits and routines!',
    icon: '🔄',
  },
  {
    id: 'analytics',
    title: 'Track Your Progress',
    description: 'View your productivity stats, streaks, and insights in the Analytics dashboard.',
    icon: '📊',
  },
  {
    id: 'export',
    title: 'Backup Your Data',
    description: 'Export your tasks to JSON or CSV to keep your data safe.',
    icon: '💾',
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Press ? to see all keyboard shortcuts for faster navigation.',
    icon: '⌨️',
  },
  {
    id: 'subtasks',
    title: 'Break Down Tasks',
    description: 'Add subtasks to complex tasks to track progress step by step.',
    icon: '✅',
  },
];

const DISMISSED_KEY = 'taskflow_dismissed_hints';

export const FeatureHints: React.FC = () => {
  const { theme } = useTheme();
  const [currentHint, setCurrentHint] = useState<Hint | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissedHints, setDismissedHints] = useState<string[]>([]);

  useEffect(() => {
    // Load dismissed hints
    try {
      const stored = localStorage.getItem(DISMISSED_KEY);
      if (stored) {
        setDismissedHints(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    // Show a random un-dismissed hint after a delay
    const timer = setTimeout(() => {
      const availableHints = HINTS.filter(h => !dismissedHints.includes(h.id));
      if (availableHints.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableHints.length);
        setCurrentHint(availableHints[randomIndex]);
        setIsVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    if (currentHint) {
      const newDismissed = [...dismissedHints, currentHint.id];
      setDismissedHints(newDismissed);
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(newDismissed));
    }
    setIsVisible(false);
  };

  const handleNext = () => {
    const availableHints = HINTS.filter(h => !dismissedHints.includes(h.id) && h.id !== currentHint?.id);
    if (availableHints.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableHints.length);
      setCurrentHint(availableHints[randomIndex]);
    } else {
      setIsVisible(false);
    }
  };

  if (!isVisible || !currentHint) {
    return null;
  }

  return (
    <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50' : 'bg-gradient-to-r from-indigo-50 to-purple-50'} border ${theme === 'dark' ? 'border-indigo-700/50' : 'border-indigo-200'}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{currentHint.icon}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-slate-800 dark:text-slate-100">
            {currentHint.title}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {currentHint.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNext}
            className={`p-1.5 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-white/10 text-slate-400'
                : 'hover:bg-black/5 text-slate-500'
            }`}
            title="Next tip"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={handleDismiss}
            className={`p-1.5 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-white/10 text-slate-400'
                : 'hover:bg-black/5 text-slate-500'
            }`}
            title="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-indigo-200/50 dark:border-indigo-700/50">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Pro tip
        </span>
        <div className="flex gap-1">
          {HINTS.filter(h => !dismissedHints.includes(h.id)).map((h, i) => (
            <div
              key={h.id}
              className={`w-1.5 h-1.5 rounded-full ${
                h.id === currentHint.id
                  ? 'bg-indigo-500'
                  : theme === 'dark'
                  ? 'bg-slate-600'
                  : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
