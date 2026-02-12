/**
 * Reusable category badge component
 */

import React from 'react';

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className = '' }) => {
  if (!category) return null;

  return (
    <span className={`px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 font-medium ${className}`}>
      {category}
    </span>
  );
};
