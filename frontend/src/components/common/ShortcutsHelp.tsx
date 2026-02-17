/**
 * ShortcutsHelp - Modal displaying all keyboard shortcuts
 */

import React from 'react';
import { useTheme } from '../../ThemeContext';
import { formatShortcut, getShortcutsByCategory } from '../../constants/shortcuts';

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsHelp: React.FC<ShortcutsHelpProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const categories = [
    { key: 'global' as const, label: 'Global', icon: '🌍' },
    { key: 'navigation' as const, label: 'Navigation', icon: '⬆️' },
    { key: 'tasks' as const, label: 'Tasks', icon: '✓' },
    { key: 'filters' as const, label: 'Filters', icon: '🔍' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
            <p className="text-indigo-100 text-sm">Press ? to toggle this help</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {categories.map((category) => {
            const shortcuts = getShortcutsByCategory(category.key);

            if (shortcuts.length === 0) return null;

            return (
              <div key={category.key}>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <span>{category.icon}</span>
                  {category.label}
                </h3>

                <div className="space-y-2">
                  {shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                    >
                      <span className="text-slate-700 dark:text-slate-300">
                        {shortcut.description}
                      </span>
                      <kbd className="px-3 py-1.5 rounded-md text-sm font-mono font-bold bg-white dark:bg-slate-600 shadow-sm border border-slate-200 dark:border-slate-500 text-slate-800 dark:text-slate-200">
                        {formatShortcut(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            Tip: Most shortcuts work even when a modal is open
          </p>
        </div>
      </div>
    </div>
  );
};
