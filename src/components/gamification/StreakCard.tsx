/**
 * Streak card component for displaying current streak
 */

import React from 'react';
import { StreakBadge } from '../../types';

interface StreakCardProps {
  streak: number;
  streakInfo: StreakBadge;
  className?: string;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  streak,
  streakInfo,
  className = '',
}) => {
  return (
    <div className={`rounded-2xl shadow-lg p-6 text-white relative overflow-hidden flex flex-col justify-between ${streakInfo.color} ${className}`}>
      <div className="absolute top-0 right-0 p-4 opacity-20">
        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 2v11h3v9l7-12h-4l4-8z" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-white/80 text-sm uppercase tracking-wider font-semibold">
            Current Streak
          </p>
          <span className="text-3xl">{streakInfo.emoji}</span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-6xl font-black">{streak}</span>
          <span className="text-2xl font-medium">days</span>
        </div>

        <div className="mt-3">
          <div className="text-sm text-white/70 mb-2">
            XP Multiplier: <span className="font-bold text-white text-lg">{streakInfo.multiplier}x</span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-white/40 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (streak / 60) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
