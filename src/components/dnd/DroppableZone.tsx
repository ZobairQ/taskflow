/**
 * DroppableZone - Drop zone for tasks (status columns)
 */

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { TaskStatus } from '../../types';

interface DroppableZoneProps {
  id: string;
  status: TaskStatus;
  children: React.ReactNode;
  label: string;
  count: number;
  colorClass: string;
  icon?: React.ReactNode;
}

export const DroppableZone: React.FC<DroppableZoneProps> = ({
  id,
  children,
  label,
  count,
  colorClass,
  icon,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      status: id,
      type: 'zone',
    },
  });

  const statusIcons: Record<string, React.ReactNode> = {
    pending: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
      </svg>
    ),
    in_progress: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    completed: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col h-full min-h-[400px] max-h-[calc(100vh-280px)] rounded-xl overflow-hidden
        transition-all duration-200
        ${isOver
          ? 'bg-slate-100 dark:bg-slate-700/50 ring-2 ring-indigo-400'
          : 'bg-slate-50 dark:bg-slate-800/50'
        }
      `}
    >
      {/* Header */}
      <div className={`flex-shrink-0 px-3 py-2.5 border-b ${colorClass}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="opacity-60">{icon || statusIcons[id]}</span>
            <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200">
              {label}
            </h3>
          </div>
          <span className={`
            px-2 py-0.5 rounded-full text-xs font-bold
            ${isOver
              ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
              : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
            }
          `}>
            {count}
          </span>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {children}
      </div>
    </div>
  );
};
