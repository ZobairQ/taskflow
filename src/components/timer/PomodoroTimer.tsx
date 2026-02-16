/**
 * PomodoroTimer - Full pomodoro timer with settings (collapsible)
 */

import React, { useState } from 'react';
import { useTheme } from '../../ThemeContext';
import { useTimer } from '../../TimerContext';
import { TimerWidget } from './TimerWidget';
import { TimeReport } from './TimeReport';
import { getPhaseLabel } from '../../utils/timeTracking';

// Format time as MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const PomodoroTimer: React.FC = () => {
  const { theme } = useTheme();
  const { settings, updateSettings, timerState, timeRemaining, currentPhase, completedWorkSessions } = useTimer();
  const [showSettings, setShowSettings] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Phase colors for indicator
  const phaseColors: Record<string, string> = {
    work: 'bg-rose-500',
    short_break: 'bg-emerald-500',
    long_break: 'bg-blue-500',
  };

  return (
    <div className={`rounded-2xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'} transition-all duration-300`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${isCollapsed ? 'p-4' : 'p-6 pb-0'}`}>
        <div className="flex items-center gap-3">
          {/* Collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          >
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Pomodoro Timer
            </h2>
            {!isCollapsed && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Stay focused, take breaks
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Collapsed view: Show mini timer */}
          {isCollapsed && (
            <div className="flex items-center gap-3 mr-2">
              {/* Phase indicator dot */}
              <div className={`w-2.5 h-2.5 rounded-full ${phaseColors[currentPhase]} ${timerState === 'running' ? 'animate-pulse' : ''}`} />

              {/* Time display */}
              <span className={`font-mono text-lg font-semibold ${
                timerState === 'running'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : timerState === 'paused'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-600 dark:text-slate-400'
              }`}>
                {formatTime(timeRemaining)}
              </span>

              {/* Phase label */}
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                {getPhaseLabel(currentPhase)}
              </span>

              {/* Sessions count */}
              {completedWorkSessions > 0 && (
                <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                  {completedWorkSessions} done
                </span>
              )}
            </div>
          )}

          {/* Settings button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            disabled={timerState === 'running'}
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expandable content */}
      {!isCollapsed && (
        <>
          {/* Settings Panel */}
          {showSettings && (
            <div className={`mb-6 p-4 rounded-xl mx-6 ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'} space-y-4`}>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Timer Settings</h3>

              <div className="grid grid-cols-3 gap-3">
                {/* Work Duration */}
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Work (min)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={settings.workDuration}
                    onChange={(e) => updateSettings({ workDuration: parseInt(e.target.value) || 25 })}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'bg-slate-600 text-slate-100' : 'bg-white text-slate-800'} border ${theme === 'dark' ? 'border-slate-500' : 'border-slate-200'}`}
                    disabled={timerState === 'running'}
                  />
                </div>

                {/* Short Break */}
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Short Break
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={settings.shortBreakDuration}
                    onChange={(e) => updateSettings({ shortBreakDuration: parseInt(e.target.value) || 5 })}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'bg-slate-600 text-slate-100' : 'bg-white text-slate-800'} border ${theme === 'dark' ? 'border-slate-500' : 'border-slate-200'}`}
                    disabled={timerState === 'running'}
                  />
                </div>

                {/* Long Break */}
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Long Break
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={settings.longBreakDuration}
                    onChange={(e) => updateSettings({ longBreakDuration: parseInt(e.target.value) || 15 })}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'bg-slate-600 text-slate-100' : 'bg-white text-slate-800'} border ${theme === 'dark' ? 'border-slate-500' : 'border-slate-200'}`}
                    disabled={timerState === 'running'}
                  />
                </div>
              </div>

              {/* Sessions before long break */}
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Sessions before long break
                </label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={settings.sessionsBeforeLongBreak}
                  onChange={(e) => updateSettings({ sessionsBeforeLongBreak: parseInt(e.target.value) || 4 })}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'bg-slate-600 text-slate-100' : 'bg-white text-slate-800'} border ${theme === 'dark' ? 'border-slate-500' : 'border-slate-200'}`}
                  disabled={timerState === 'running'}
                />
              </div>

              {timerState === 'running' && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Settings cannot be changed while timer is running
                </p>
              )}
            </div>
          )}

          {/* Timer Widget */}
          <div className="flex justify-center p-6 pt-0">
            <TimerWidget />
          </div>

          {/* Stats */}
          <div className="px-6">
            <TimeReport />
          </div>

          {/* Tips */}
          <div className={`mt-4 mx-6 mb-6 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700/30' : 'bg-indigo-50'}`}>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <span className="font-medium text-indigo-600 dark:text-indigo-400">Tip: </span>
              The Pomodoro Technique helps you stay focused by breaking work into 25-minute intervals separated by short breaks.
            </p>
          </div>
        </>
      )}
    </div>
  );
};
