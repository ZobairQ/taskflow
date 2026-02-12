/**
 * Reusable progress bar component
 */

import React from 'react';

interface ProgressBarProps {
  progress: number;
  color?: string;
  className?: string;
  showAnimation?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'from-indigo-500 via-purple-500 to-pink-500',
  className = '',
  showAnimation = false,
}) => {
  return (
    <div className={`w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden ${className}`}>
      <div
        className={`bg-gradient-to-r ${color} h-full rounded-full transition-all duration-700 ease-out ${
          showAnimation && progress >= 100 ? 'animate-pulse' : ''
        }`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
};
