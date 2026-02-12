/**
 * Level card component for displaying user level and XP progress
 */

import React from 'react';

interface LevelCardProps {
  level: number;
  xp: number;
  xpProgress: number;
  maxStreak?: number;
  className?: string;
}

export const LevelCard: React.FC<LevelCardProps> = ({
  level,
  xp,
  xpProgress,
  maxStreak,
  className = '',
}) => {
  return (
    <div className={`rounded-2xl shadow-lg p-6 text-white relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 ${className}`}>
      <div className="absolute top-0 right-0 p-4 opacity-20">
        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-4xl font-black text-yellow-300">LVL {level}</div>
          </div>
          <div className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
            {Math.floor(xpProgress)}%
          </div>
        </div>

        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mb-2">
          <div
            className={`h-full bg-white/80 rounded-full transition-all duration-700 ease-out ${
              xpProgress >= 100 ? 'animate-pulse' : ''
            }`}
            style={{ width: `${xpProgress}%` }}
          />
        </div>

        <p className="text-indigo-100 text-sm font-medium">
          {Math.round(xpProgress)}% to level {level + 1}
        </p>

        <p className="text-indigo-200 text-xs mt-2 opacity-80">
          Total XP: {Math.floor(xp)}{maxStreak !== undefined && ` | ${maxStreak} day max streak`}
        </p>
      </div>
    </div>
  );
};
