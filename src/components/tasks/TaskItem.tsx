/**
 * Reusable task item component
 * This component eliminates ~200 lines of duplicated code between App.tsx and ProjectDetail.tsx
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskStatus } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { getTaskIcon, estimateReadingTime, getTaskStatus } from '../../utils/taskUtils';
import { PriorityBadge, CategoryBadge } from '../common';

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onStatusChange?: (id: number, status: TaskStatus) => void;
  onDelete: (id: number) => void;
  onViewDetails?: (task: Task) => void;
  showExpandButton?: boolean;
  draggable?: boolean;
  isDragging?: boolean;
}

const STATUS_CONFIG = {
  pending: {
    label: 'To Do',
    color: 'bg-amber-500',
    textColor: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
      </svg>
    ),
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-blue-500',
    textColor: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
  },
  completed: {
    label: 'Done',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onStatusChange,
  onDelete,
  onViewDetails,
  showExpandButton = true,
  draggable = false,
  isDragging = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const statusButtonRef = useRef<HTMLButtonElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  // Draggable setup
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id.toString(),
    data: {
      task,
      type: 'task',
    },
    disabled: !draggable,
  });

  const dragStyle = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: 1000,
      }
    : undefined;

  const status = getTaskStatus(task);
  const isInProgress = status === 'in_progress';
  const isCompleted = status === 'completed';
  const statusConfig = STATUS_CONFIG[status];

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const updateMenuPosition = () => {
    if (statusButtonRef.current) {
      const rect = statusButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (onStatusChange) {
      onStatusChange(task.id, newStatus);
    } else {
      // Fallback to toggle for backward compatibility
      if (newStatus === 'completed') {
        onToggle(task.id);
      }
    }
    setShowStatusMenu(false);
  };

  // Update position when menu opens
  useEffect(() => {
    if (showStatusMenu) {
      updateMenuPosition();
    }
  }, [showStatusMenu]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusMenuRef.current &&
        !statusMenuRef.current.contains(event.target as Node) &&
        statusButtonRef.current &&
        !statusButtonRef.current.contains(event.target as Node)
      ) {
        setShowStatusMenu(false);
      }
    };

    if (showStatusMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showStatusMenu]);

  return (
    <div
      ref={draggable ? setNodeRef : undefined}
      style={dragStyle}
      {...(draggable ? { ...attributes, ...listeners } : {})}
      className={`group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-md overflow-hidden ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${
        isCompleted
          ? 'border-slate-200 dark:border-slate-700'
          : isInProgress
          ? 'border-blue-300 dark:border-blue-500'
          : 'border-slate-100 dark:border-slate-700'
      } ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      {/* Status Header - Prominent Top Section */}
      <div className={`px-5 py-3 ${statusConfig.bgColor} border-b ${statusConfig.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                ref={statusButtonRef}
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusConfig.bgColor} ${statusConfig.textColor} border-2 ${statusConfig.borderColor} hover:shadow-lg hover:scale-105`}
              >
                <div className={`w-3 h-3 rounded-full ${statusConfig.color} shadow-sm`} />
                {statusConfig.label}
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Priority & Category badges */}
            <div className="flex items-center gap-2">
              <PriorityBadge priority={task.priority} />
              <CategoryBadge category={task.category} />
            </div>
          </div>

          {/* Action Buttons - Always Visible */}
          <div className="flex items-center gap-1">
            {onViewDetails && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(task);
                }}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-lg transition-all"
                title="View details"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-lg transition-all"
              title="Delete task"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Task Content */}
      <div className={`p-5 ${
        isCompleted
          ? 'bg-slate-50/60 dark:bg-slate-800/50'
          : isInProgress
          ? 'bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/10'
          : 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50'
      }`}>
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${
                isCompleted
                  ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30'
                  : isInProgress
                  ? 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30'
                  : 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-500 dark:text-indigo-400'
              }`}
            >
              <span className="text-xl">{getTaskIcon(task.priority)}</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Task Title */}
            <h3
              className={`text-xl font-bold transition-all mb-2 ${
                isCompleted
                  ? 'text-slate-400 dark:text-slate-500 line-through decoration-2 decoration-slate-300 dark:decoration-slate-600'
                  : isInProgress
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-slate-800 dark:text-slate-100'
              }`}
            >
              {task.text}
            </h3>

            {/* Description */}
            {task.description && (
              <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-24 opacity-90'} overflow-hidden relative`}>
                <div className="mb-4">
                  <p className={`text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed ${isCompleted ? 'text-slate-400 dark:text-slate-500' : ''}`}>
                    {task.description}
                  </p>
                </div>
                {task.description.length > 100 && showExpandButton && (
                  <button
                    onClick={toggleExpand}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                    <svg
                      className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Tags & Info */}
            <div className="flex flex-wrap items-center gap-2 text-xs mt-3">
              {task.dueDate && (
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                    new Date(task.dueDate) < new Date() && !isCompleted
                      ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400'
                      : 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {task.dueDate}
                  {new Date(task.dueDate) < new Date() && !isCompleted && (
                    <span className="font-bold ml-1">(Overdue)</span>
                  )}
                </div>
              )}

              <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(task.createdAt)}
              </span>

              {task.description && (
                <span className="text-slate-400 dark:text-slate-500">
                  {estimateReadingTime(task.description)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Dropdown Menu - Rendered via Portal */}
      {showStatusMenu && createPortal(
        <div
          ref={statusMenuRef}
          className="fixed bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[9999]"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            width: '224px',
          }}
        >
          <div className="p-2">
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide px-3 py-2">
              Change Status
            </div>
            {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((statusKey) => {
              const config = STATUS_CONFIG[statusKey];
              const isSelected = status === statusKey;

              return (
                <button
                  key={statusKey}
                  onClick={() => handleStatusChange(statusKey)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? `${config.bgColor} ${config.textColor} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800`
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${config.color} shadow-sm`}>
                    {config.icon}
                  </div>
                  <span className="flex-1 text-left">{config.label}</span>
                  {isSelected && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
