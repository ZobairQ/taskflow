/**
 * Level up modal component - extracts ~100 lines from App.tsx
 */

import React from 'react';
import { useTheme } from '../../ThemeContext';

interface LevelUpModalProps {
  isVisible: boolean;
  onClose: () => void;
  level: number;
  xp: number;
  xpProgress: number;
  totalTasksCompleted: number;
  streak: number;
  maxStreak: number;
  xpNeeded: number;
  levelGradient: string;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isVisible,
  onClose,
  level,
  xp,
  xpProgress,
  totalTasksCompleted,
  streak,
  maxStreak,
  xpNeeded,
  levelGradient,
}) => {
  const { theme } = useTheme();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array(20)
          .fill(null)
          .map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping opacity-50"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#FFE66D', '#C44D4D'][
                  Math.floor(Math.random() * 5)
                ],
                animationDuration: `${1 + Math.random() * 2}s`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
      </div>

      {/* Gradient explosion effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${levelGradient} opacity-20 animate-pulse`}
        style={{ animationDuration: '2s' }}
      />

      {/* Modal */}
      <div
        className={`relative z-10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-500 ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        }`}
      >
        {/* Header with gradient */}
        <div
          className={`relative p-8 text-center overflow-hidden ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-indigo-900/90'
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'
          }`}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30" />
          <h2 className="text-5xl md:text-6xl font-black text-white mb-2 drop-shadow-lg animate-bounce">
            LEVEL UP!
          </h2>
          <p className="text-indigo-100 text-lg md:text-xl font-medium">
            You reached Level {level}!
          </p>
          <div className="mt-4 inline-block px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
            <span className="text-2xl font-bold text-white">{Math.floor(xp)} XP</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {/* XP Bar */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Progress
              </span>
              <span className="text-sm font-bold text-indigo-500">{Math.round(xpProgress)}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out animate-in slide-in-from-left"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total XP</div>
              <div className="text-2xl font-bold text-indigo-500">{Math.floor(xp)}</div>
            </div>
            <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Tasks Completed</div>
              <div className="text-2xl font-bold text-emerald-500">{totalTasksCompleted}</div>
            </div>
            <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Current Streak</div>
              <div className="text-2xl font-bold text-amber-500">{streak} days</div>
            </div>
            <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Max Streak</div>
              <div className="text-2xl font-bold text-rose-500">{maxStreak} days</div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              XP needed for next level:{' '}
              <span className="font-bold text-indigo-500">{xpNeeded}</span>
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg transition-all hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95"
            >
              Keep Grinding!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
