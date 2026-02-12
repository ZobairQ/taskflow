/**
 * Achievement badge component
 */

import React from 'react';
import { Achievement } from '../../types';

interface AchievementBadgeProps {
  achievement: Achievement;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement }) => {
  return (
    <div
      className={`p-3 rounded-xl transition-all ${
        achievement.unlocked
          ? 'bg-white dark:bg-slate-700 border-2 border-amber-200 dark:border-amber-500/50'
          : 'bg-amber-100/50 dark:bg-slate-900/50 border-2 border-dashed border-amber-200 dark:border-slate-700 opacity-70'
      }`}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <span className={`text-2xl ${achievement.unlocked ? 'animate-bounce' : ''}`}>
          {achievement.icon}
        </span>
        <div>
          <div
            className={`text-xs font-bold ${
              achievement.unlocked ? 'text-amber-700 dark:text-amber-300' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {achievement.title}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full">
            {achievement.unlocked ? (
              <span className="text-emerald-600 dark:text-emerald-400">Unlocked!</span>
            ) : (
              achievement.description
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
