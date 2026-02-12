/**
 * Reusable stat card component
 */

import React from 'react';

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  valueColor?: string;
  className?: string;
  hoverBorder?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon,
  valueColor = 'text-slate-800 dark:text-slate-100',
  className = '',
  hoverBorder = 'hover:border-indigo-200 dark:hover:border-indigo-500/50',
}) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group ${hoverBorder} transition-colors ${className}`}>
      {icon && (
        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      )}
      <div className={`text-2xl md:text-3xl font-bold ${valueColor} relative z-10`}>
        {value}
      </div>
      <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium relative z-10">
        {label}
      </div>
    </div>
  );
};
