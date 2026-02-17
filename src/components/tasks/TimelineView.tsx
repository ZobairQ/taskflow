/**
 * TimelineView - Display tasks in a daily timeline/schedule format
 * Shows tasks organized by time slots with smart scheduling suggestions
 */

import React, { useMemo, useState } from 'react';
import { Task, TaskPriority } from '../../types';
import { suggestTime } from '../../utils/ai/smartSuggestions';
import { format, isToday, isTomorrow, addDays, startOfDay, endOfDay } from 'date-fns';

interface TimelineViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskComplete?: (taskId: number) => void;
  selectedDate?: Date;
}

interface TimeSlot {
  hour: number;
  label: string;
  tasks: Task[];
}

interface DaySection {
  date: Date;
  label: string;
  isToday: boolean;
  timeSlots: TimeSlot[];
  unscheduledTasks: Task[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  onTaskClick,
  onTaskComplete,
  selectedDate = new Date(),
}) => {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Organize tasks into timeline
  const timelineData = useMemo(() => {
    const sections: DaySection[] = [];
    const daysToShow = viewMode === 'day' ? 1 : 7;

    for (let i = 0; i < daysToShow; i++) {
      const date = addDays(selectedDate, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      // Filter tasks for this day
      const dayTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate >= dayStart && taskDate <= dayEnd;
      });

      // Create time slots
      const timeSlots: TimeSlot[] = [];
      const unscheduledTasks: Task[] = [];

      // Group tasks by hour or as unscheduled
      dayTasks.forEach(task => {
        const taskDate = new Date(task.dueDate!);
        const hour = taskDate.getHours();

        // Check if task has a specific time
        const hasTime = taskDate.getHours() !== 0 || taskDate.getMinutes() !== 0;

        if (hasTime) {
          let slot = timeSlots.find(s => s.hour === hour);
          if (!slot) {
            slot = {
              hour,
              label: format(taskDate, 'h:mm a'),
              tasks: [],
            };
            timeSlots.push(slot);
          }
          slot.tasks.push(task);
        } else {
          // Try to suggest a time
          const suggestion = suggestTime(task.text);
          if (suggestion) {
            let slot = timeSlots.find(s => s.hour === suggestion.hour);
            if (!slot) {
              slot = {
                hour: suggestion.hour,
                label: format(new Date(date).setHours(suggestion.hour, 0), 'h:mm a'),
                tasks: [],
              };
              timeSlots.push(slot);
            }
            slot.tasks.push(task);
          } else {
            unscheduledTasks.push(task);
          }
        }
      });

      // Sort time slots by hour
      timeSlots.sort((a, b) => a.hour - b.hour);

      // Sort tasks within slots by priority
      timeSlots.forEach(slot => {
        slot.tasks.sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
      });

      // Sort unscheduled tasks by priority
      unscheduledTasks.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      // Determine day label
      let label: string;
      if (isToday(date)) {
        label = 'Today';
      } else if (isTomorrow(date)) {
        label = 'Tomorrow';
      } else {
        label = format(date, 'EEEE, MMM d');
      }

      sections.push({
        date,
        label,
        isToday: isToday(date),
        timeSlots,
        unscheduledTasks,
      });
    }

    return sections;
  }, [tasks, selectedDate, viewMode]);

  // Get current time indicator position
  const getCurrentTimePosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return (hours * 60 + minutes) / (24 * 60) * 100;
  };

  const currentTimePosition = getCurrentTimePosition();

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Timeline
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {format(selectedDate, 'MMMM d, yyyy')}
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'day'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'week'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Week
          </button>
        </div>
      </div>

      {/* Timeline sections */}
      <div className="space-y-8">
        {timelineData.map((section) => (
          <div key={section.date.toISOString()}>
            {/* Day header */}
            <div className={`flex items-center gap-3 mb-4 ${
              section.isToday ? '' : 'opacity-80'
            }`}>
              <span className={`text-lg font-semibold ${
                section.isToday
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-900 dark:text-white'
              }`}>
                {section.label}
              </span>
              {section.isToday && (
                <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full">
                  Today
                </span>
              )}
            </div>

            {/* Time slots */}
            {section.timeSlots.length > 0 && (
              <div className="relative space-y-3">
                {/* Current time indicator (only for today) */}
                {section.isToday && (
                  <div
                    className="absolute left-0 right-0 flex items-center z-10"
                    style={{ top: `${currentTimePosition}%` }}
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <div className="flex-1 h-0.5 bg-red-500" />
                    <span className="ml-2 text-xs text-red-500 font-medium">
                      {format(new Date(), 'h:mm a')}
                    </span>
                  </div>
                )}

                {section.timeSlots.map((slot) => (
                  <div
                    key={slot.hour}
                    className="flex gap-4 items-start"
                  >
                    {/* Time label */}
                    <div className="w-20 flex-shrink-0 text-right">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {slot.label}
                      </span>
                    </div>

                    {/* Tasks */}
                    <div className="flex-1 space-y-2">
                      {slot.tasks.map((task) => (
                        <TimelineTask
                          key={task.id}
                          task={task}
                          onClick={() => onTaskClick?.(task)}
                          onComplete={() => onTaskComplete?.(task.id)}
                          isPast={section.isToday && slot.hour < new Date().getHours()}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Unscheduled tasks */}
            {section.unscheduledTasks.length > 0 && (
              <div className="mt-4 ml-20">
                <div className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Unscheduled
                </div>
                <div className="space-y-2">
                  {section.unscheduledTasks.map((task) => (
                    <TimelineTask
                      key={task.id}
                      task={task}
                      onClick={() => onTaskClick?.(task)}
                      onComplete={() => onTaskComplete?.(task.id)}
                      isUnscheduled
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {section.timeSlots.length === 0 && section.unscheduledTasks.length === 0 && (
              <div className="ml-20 py-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No tasks scheduled
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Timeline task card component
interface TimelineTaskProps {
  task: Task;
  onClick?: () => void;
  onComplete?: () => void;
  isPast?: boolean;
  isUnscheduled?: boolean;
}

const TimelineTask: React.FC<TimelineTaskProps> = ({
  task,
  onClick,
  onComplete,
  isPast = false,
  isUnscheduled = false,
}) => {
  const priorityColors: Record<TaskPriority, string> = {
    high: 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10',
    medium: 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10',
    low: 'border-l-slate-400 bg-slate-50/50 dark:bg-slate-800/50',
  };

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-start gap-3 p-3 bg-white dark:bg-slate-800 border-l-4 ${priorityColors[task.priority]} rounded-r-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        isPast ? 'opacity-60' : ''
      } ${task.completed ? 'opacity-50' : ''}`}
    >
      {/* Complete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onComplete?.();
        }}
        className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 ${
          task.completed
            ? 'bg-green-500 border-green-500'
            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
        } flex items-center justify-center transition-colors`}
      >
        {task.completed && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Task content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-slate-900 dark:text-white ${
          task.completed ? 'line-through' : ''
        }`}>
          {task.text}
        </p>

        {/* Task meta */}
        <div className="flex items-center gap-2 mt-1">
          {task.category && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              #{task.category}
            </span>
          )}
          {isUnscheduled && (
            <span className="text-xs text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">
              AI suggested time
            </span>
          )}
        </div>
      </div>

      {/* Priority badge */}
      {task.priority === 'high' && (
        <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
          Urgent
        </span>
      )}
    </div>
  );
};

export default TimelineView;
