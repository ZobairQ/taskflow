/**
 * TimerWidget - Circular progress timer display
 */

import React from 'react';
import { useTheme } from '../../ThemeContext';
import { useTimer } from '../../TimerContext';
import { formatTime, getPhaseLabel, getPhaseColor } from '../../utils/timeTracking';

export const TimerWidget: React.FC = () => {
  const { theme } = useTheme();
  const {
    timerState,
    currentPhase,
    timeRemaining,
    progress,
    completedWorkSessions,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipPhase,
  } = useTimer();

  const phaseLabel = getPhaseLabel(currentPhase);
  const phaseColor = getPhaseColor(currentPhase);

  // Circle properties
  const size = 200;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      {/* Timer Circle */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={theme === 'dark' ? '#334155' : '#e2e8f0'}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className={phaseColor.includes('rose') ? 'text-rose-500' : phaseColor.includes('emerald') ? 'text-emerald-500' : 'text-blue-500'} style={{ stopColor: 'currentColor' }} />
              <stop offset="100%" className={phaseColor.includes('orange') ? 'text-orange-500' : phaseColor.includes('teal') ? 'text-teal-500' : 'text-indigo-500'} style={{ stopColor: 'currentColor' }} />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-gradient-to-r ${phaseColor} text-white mb-1`}>
            {phaseLabel}
          </span>
          <span className={`text-4xl font-bold font-mono ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
            {formatTime(timeRemaining)}
          </span>
          {currentPhase === 'work' && (
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              #{completedWorkSessions + 1} session
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mt-6">
        {timerState === 'idle' && (
          <button
            onClick={() => startTimer()}
            className={`px-6 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r ${phaseColor} hover:opacity-90 transition-all shadow-lg hover:shadow-xl`}
          >
            Start
          </button>
        )}

        {timerState === 'running' && (
          <>
            <button
              onClick={pauseTimer}
              className="px-6 py-2.5 rounded-xl font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
            >
              Pause
            </button>
            <button
              onClick={resetTimer}
              className="px-4 py-2.5 rounded-xl font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
            >
              Reset
            </button>
          </>
        )}

        {timerState === 'paused' && (
          <>
            <button
              onClick={resumeTimer}
              className={`px-6 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r ${phaseColor} hover:opacity-90 transition-all shadow-lg`}
            >
              Resume
            </button>
            <button
              onClick={resetTimer}
              className="px-4 py-2.5 rounded-xl font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
            >
              Reset
            </button>
          </>
        )}

        {timerState !== 'running' && (
          <button
            onClick={skipPhase}
            className="px-4 py-2.5 rounded-xl font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            title="Skip to next phase"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
};
