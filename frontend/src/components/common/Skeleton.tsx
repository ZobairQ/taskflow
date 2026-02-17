/**
 * Skeleton - Loading skeleton components
 */

import React from 'react';
import { useTheme } from '../../ThemeContext';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}) => {
  const { theme } = useTheme();

  const baseClasses = `
    ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}
    ${animation === 'pulse' ? 'animate-pulse' : ''}
    ${animation === 'wave' ? 'skeleton-wave' : ''}
  `;

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-xl',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '40px' : '100px'),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-busy="true"
      aria-live="polite"
    />
  );
};

// Task Skeleton
export const TaskSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <div className="flex items-start gap-3">
            <Skeleton variant="circular" width={20} height={20} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="60%" height={16} />
              <Skeleton variant="text" width="80%" height={12} />
            </div>
            <div className="flex gap-1">
              <Skeleton variant="rounded" width={60} height={20} />
              <Skeleton variant="rounded" width={60} height={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Project Card Skeleton
export const ProjectCardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <Skeleton variant="rounded" width={48} height={48} />
            <div className="flex-1">
              <Skeleton variant="text" width="70%" height={20} />
              <Skeleton variant="text" width="50%" height={14} />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton variant="text" height={12} />
            <Skeleton variant="text" height={12} width="80%" />
          </div>
          <div className="flex gap-2 mt-4">
            <Skeleton variant="rounded" width={80} height={32} />
            <Skeleton variant="rounded" width={80} height={32} />
          </div>
        </div>
      ))}
    </div>
  );
};

// Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center gap-4">
        <Skeleton variant="rounded" width={48} height={48} />
        <div>
          <Skeleton variant="text" width={60} height={12} />
          <Skeleton variant="text" width={40} height={28} />
        </div>
      </div>
    </div>
  );
};

// Calendar Skeleton
export const CalendarSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton variant="text" width={150} height={24} />
        <div className="flex gap-2">
          <Skeleton variant="rounded" width={32} height={32} />
          <Skeleton variant="rounded" width={32} height={32} />
          <Skeleton variant="rounded" width={60} height={32} />
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center py-2">
            <Skeleton variant="text" width={24} height={12} className="mx-auto" />
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={80} />
        ))}
      </div>
    </div>
  );
};
