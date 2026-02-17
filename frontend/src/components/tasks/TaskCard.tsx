/**
 * TaskCard - Compact card for Kanban board view with swipe gestures
 */

import React, { useState, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../ProjectContext';
import { getTaskStatus } from '../../utils/taskUtils';
import { RecurringIcon } from './RecurringBadge';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (task: Task) => void;
}

const PRIORITY_COLORS = {
  low: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  medium: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  high: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
};

const PRIORITY_DOTS = {
  low: 'bg-emerald-500',
  medium: 'bg-amber-500',
  high: 'bg-rose-500',
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggle,
  onDelete,
  onViewDetails,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id.toString(),
    data: {
      task,
      type: 'task',
    },
  });

  // Swipe gesture state
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeAction, setSwipeAction] = useState<'complete' | 'delete' | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isSwipingRef = useRef(false);

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 1000 : undefined,
      }
    : undefined;

  const isCompleted = task.completed || getTaskStatus(task) === 'completed';

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    isSwipingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

    // Only consider horizontal swipes
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
      isSwipingRef.current = true;
      setSwipeOffset(deltaX);

      // Determine swipe action
      if (deltaX > 80) {
        setSwipeAction('complete');
      } else if (deltaX < -80) {
        setSwipeAction('delete');
      } else {
        setSwipeAction(null);
      }
    }
  };

  const handleTouchEnd = () => {
    if (swipeAction === 'complete') {
      onToggle(task.id);
    } else if (swipeAction === 'delete') {
      onDelete(task.id);
    }

    // Reset swipe state with animation
    setSwipeOffset(0);
    setSwipeAction(null);
    touchStartRef.current = null;
    isSwipingRef.current = false;
  };

  // Handle click to view details - works because of activation constraint in TaskBoard
  const handleClick = () => {
    if (!isDragging && !isSwipingRef.current) {
      onViewDetails(task);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Swipe action backgrounds */}
      <div
        className={`
          absolute inset-0 flex items-center justify-between px-4 transition-opacity duration-200
          ${swipeAction === 'complete' ? 'bg-emerald-500' : swipeAction === 'delete' ? 'bg-rose-500' : 'bg-transparent'}
          ${Math.abs(swipeOffset) > 40 ? 'opacity-100' : 'opacity-0'}
        `}
      >
        {/* Complete indicator (left) */}
        <div className={`flex items-center text-white transition-all duration-200 ${swipeOffset > 0 ? 'opacity-100' : 'opacity-0'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="ml-2 font-medium">Complete</span>
        </div>

        {/* Delete indicator (right) */}
        <div className={`flex items-center text-white transition-all duration-200 ${swipeOffset < 0 ? 'opacity-100' : 'opacity-0'}`}>
          <span className="mr-2 font-medium">Delete</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
      </div>

      {/* Main card */}
      <div
        ref={setNodeRef}
        style={{
          ...style,
          transform: style?.transform
            ? `${style.transform} translateX(${swipeOffset}px)`
            : `translateX(${swipeOffset}px)`,
        }}
        {...attributes}
        {...listeners}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        className={`
          group bg-white dark:bg-slate-700 rounded-lg shadow-sm border
          border-slate-200 dark:border-slate-600
          hover:shadow-md hover:border-slate-300 dark:hover:border-slate-500
          transition-all duration-200 select-none touch-pan-y
          ${isDragging ? 'opacity-50 shadow-lg ring-2 ring-indigo-400 cursor-grabbing' : 'cursor-pointer hover:cursor-grab'}
          ${isCompleted ? 'opacity-70' : ''}
        `}
      >
      {/* Priority indicator line */}
      <div className={`h-1 rounded-t-lg ${PRIORITY_DOTS[task.priority]}`} />

      {/* Task content */}
      <div className="p-3 pt-2">
        <div className="flex items-start gap-2">
          {/* Checkbox */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle(task.id);
            }}
            className={`
              flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5
              flex items-center justify-center transition-colors cursor-pointer
              ${isCompleted
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-slate-300 dark:border-slate-500 hover:border-indigo-400'
              }
            `}
          >
            {isCompleted && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          {/* Title and meta */}
          <div className="flex-1 min-w-0">
            <p
              className={`
                text-sm font-medium leading-snug line-clamp-2
                ${isCompleted
                  ? 'text-slate-400 dark:text-slate-500 line-through'
                  : 'text-slate-800 dark:text-slate-100'
                }
              `}
            >
              {task.text}
            </p>

            {/* Meta row */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {/* Recurring indicator */}
              {task.isRecurring && task.recurrencePattern && (
                <RecurringIcon className="w-3.5 h-3.5" />
              )}

              {/* Priority badge */}
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                {task.priority}
              </span>

              {/* Due date if exists */}
              {task.dueDate && (
                <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}

              {/* Category if exists */}
              {task.category && (
                <span className="text-xs text-indigo-500 dark:text-indigo-400">
                  {task.category}
                </span>
              )}
            </div>
          </div>

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="
              flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100
              text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20
              transition-all cursor-pointer
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};
