/**
 * Achievements grid component
 */

import React from 'react';
import { Achievement } from '../../types';
import { AchievementBadge } from './AchievementBadge';

interface AchievementsGridProps {
  achievements: Achievement[];
}

export const AchievementsGrid: React.FC<AchievementsGridProps> = ({ achievements }) => {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 rounded-2xl shadow-lg p-6 border border-amber-100 dark:border-slate-700">
      <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300 mb-4 flex items-center gap-2">
        <span className="text-2xl">🏆</span> Achievements
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {achievements.map((achievement) => (
          <AchievementBadge key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
};
