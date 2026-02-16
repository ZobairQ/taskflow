/**
 * SettingsPage - Centralized settings with export/import functionality
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { useProjects, Task } from '../ProjectContext';
import { ExportPanel, ImportPanel } from '../components/settings';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { projects } = useProjects();
  const navigate = useNavigate();
  const [importSuccess, setImportSuccess] = useState(false);

  // Get all tasks from all projects
  const allTasks = projects.flatMap(p => p.todos);

  // Get gamification data from localStorage
  const getGamificationData = () => {
    try {
      const stored = localStorage.getItem('gamification');
      if (stored) {
        const data = JSON.parse(stored);
        return {
          xp: data.xp || 0,
          level: data.level || 1,
          streak: data.streak || 0,
          achievements: data.unlockedAchievements || [],
        };
      }
    } catch {
      // ignore
    }
    return undefined;
  };

  const handleImport = (tasks: Partial<Task>[]) => {
    // Store imported tasks to be added
    const importKey = 'taskflow_import_pending';
    localStorage.setItem(importKey, JSON.stringify(tasks));
    setImportSuccess(true);

    // Navigate back to home after short delay
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-white/80 mt-1">Manage your data and preferences</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Import Success Message */}
        {importSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-medium text-emerald-700 dark:text-emerald-300">
                  Import Successful!
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Redirecting to your tasks...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Theme Settings */}
        <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            Appearance
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-300">Dark Mode</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Switch between light and dark theme
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-indigo-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  theme === 'dark' ? 'translate-x-7' : 'translate-x-0.5'
                }`}
              >
                {theme === 'dark' ? (
                  <svg className="w-6 h-6 p-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 p-1 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="grid md:grid-cols-2 gap-6">
          <ExportPanel
            tasks={allTasks}
            gamificationData={getGamificationData()}
          />
          <ImportPanel
            onImport={handleImport}
            existingTaskCount={allTasks.length}
          />
        </div>

        {/* Storage Info */}
        <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            Storage
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{allTasks.length}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Tasks</p>
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{projects.length}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Projects</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
            Data is stored locally in your browser. Export regularly to backup your data.
          </p>
        </div>

        {/* About */}
        <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            About TaskFlow
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            TaskFlow is a gamified task management app designed to boost your productivity.
            Features include recurring tasks, Pomodoro timer, calendar view, achievements, and more.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
            Version 4.0 • Phase 4 Features
          </p>
        </div>
      </div>
    </div>
  );
};
