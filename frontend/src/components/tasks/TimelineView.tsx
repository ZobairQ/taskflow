/**
 * TimelineView - Display tasks in a daily timeline/schedule format
 * Enhanced with navigation, quick actions, and better UX
 */

import React, { useMemo, useState } from 'react';
import { Task, TaskPriority } from '../../types';
import { suggestTime } from '../../utils/ai/smartSuggestions';
import { format, isToday, isTomorrow, isYesterday, addDays, subDays } from 'date-fns';

interface TimelineViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskComplete?: (taskId: string) => void;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

interface TimeSlot {
  hour: number;
  label: string;
  tasks: Task[];
}

interface DaySection {
  date: Date;
  label: string;
  shortLabel: string;
  isToday: boolean;
  timeSlots: TimeSlot[];
  unscheduledTasks: Task[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  onTaskClick,
  onTaskComplete,
  selectedDate = new Date(),
  onDateChange,
}) => {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [currentDate, setCurrentDate] = useState(selectedDate);

  // Navigate to a specific date
  const navigateToDate = (date: Date) => {
    setCurrentDate(date);
    onDateChange?.(date);
  };

  // Quick navigation
  const goToToday = () => navigateToDate(new Date());
  const goToTomorrow = () => navigateToDate(addDays(new Date(), 1));
  const goToYesterday = () => navigateToDate(subDays(new Date(), 1));
  const goPrev = () => navigateToDate(subDays(currentDate, viewMode === 'week' ? 7 : 1));
  const goNext = () => navigateToDate(addDays(currentDate, viewMode === 'week' ? 7 : 1));

  // Check if current view is today
  const isViewingToday = viewMode === 'day' && isToday(currentDate);

  // Organize tasks into timeline
  const timelineData = useMemo(() => {
    const sections: DaySection[] = [];
    const daysToShow = viewMode === 'day' ? 1 : 7;

    for (let i = 0; i < daysToShow; i++) {
      const date = addDays(currentDate, i);

      // Filter tasks for this day
      const dayTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        // Check if task date matches this day (ignoring time)
        return format(taskDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });

      // Create time slots
      const timeSlots: TimeSlot[] = [];
      const unscheduledTasks: Task[] = [];

      // Group tasks by hour or as unscheduled
      dayTasks.forEach(task => {
        const taskDate = new Date(task.dueDate!);
        const hour = taskDate.getHours();
        const minute = taskDate.getMinutes();

        // Check if task has a specific time (not just midnight)
        const hasSpecificTime = hour !== 0 || minute !== 0;

        if (hasSpecificTime) {
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
          // Try to suggest a time using AI
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

      // Determine day labels
      let label: string;
      let shortLabel: string;
      if (isToday(date)) {
        label = 'Today';
        shortLabel = 'Today';
      } else if (isTomorrow(date)) {
        label = 'Tomorrow';
        shortLabel = 'Tomorrow';
      } else if (isYesterday(date)) {
        label = 'Yesterday';
        shortLabel = 'Yesterday';
      } else {
        label = format(date, 'EEEE, MMMM d');
        shortLabel = format(date, 'EEE d');
      }

      sections.push({
        date,
        label,
        shortLabel,
        isToday: isToday(date),
        timeSlots,
        unscheduledTasks,
      });
    }

    return sections;
  }, [tasks, currentDate, viewMode]);

  // Calculate task statistics
  const stats = useMemo(() => {
    const totalTasks = timelineData.reduce(
      (sum, section) => sum + section.timeSlots.length + section.unscheduledTasks.length,
      0
    );
    const highPriorityTasks = timelineData.reduce(
      (sum, section) =>
        sum + section.timeSlots.flatMap(s => s.tasks).filter(t => t.priority === 'high').length +
        section.unscheduledTasks.filter(t => t.priority === 'high').length,
      0
    );
    return { totalTasks, highPriorityTasks };
  }, [timelineData]);

  // Get current time for indicator
  const currentTimeLabel = format(new Date(), 'h:mm a');

  return (
    <div className="w-full">
      {/* Header with Navigation */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Title and Date */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={goPrev}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title={viewMode === 'week' ? 'Previous week' : 'Previous day'}
              >
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goNext}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title={viewMode === 'week' ? 'Next week' : 'Next day'}
              >
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                {viewMode === 'week'
                  ? `${format(currentDate, 'MMM d')} - ${format(addDays(currentDate, 6), 'MMM d, yyyy')}`
                  : format(currentDate, 'EEEE, MMMM d, yyyy')}
                {isViewingToday && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full">
                    Today
                  </span>
                )}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {stats.totalTasks} task{stats.totalTasks !== 1 ? 's' : ''} scheduled
                {stats.highPriorityTasks > 0 && (
                  <span className="text-red-500 dark:text-red-400 ml-2">
                    • {stats.highPriorityTasks} urgent
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Date Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={goToYesterday}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  viewMode === 'day' && isYesterday(currentDate)
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Yesterday
              </button>
              <button
                onClick={goToToday}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  isViewingToday
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Today
              </button>
              <button
                onClick={goToTomorrow}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  viewMode === 'day' && isTomorrow(currentDate)
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Tomorrow
              </button>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

            {/* View mode toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'day'
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'week'
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Week
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Current Time Banner (only when viewing today) */}
      {isViewingToday && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-3 mb-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="font-medium">Current Time: {currentTimeLabel}</span>
          </div>
          <span className="text-sm opacity-90">
            {stats.totalTasks > 0 ? `${stats.totalTasks} tasks for today` : 'No tasks scheduled for today'}
          </span>
        </div>
      )}

      {/* Timeline sections */}
      <div className="space-y-6">
        {timelineData.map((section) => (
          <div
            key={section.date.toISOString()}
            className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${
              section.isToday ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''
            }`}
          >
            {/* Day header */}
            <div className={`px-4 py-3 border-b border-slate-100 dark:border-slate-700 ${
              section.isToday
                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
                : 'bg-slate-50 dark:bg-slate-800/50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`text-center min-w-[50px] ${
                    section.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    <div className="text-xs uppercase font-medium">
                      {format(section.date, 'EEE')}
                    </div>
                    <div className="text-2xl font-bold">
                      {format(section.date, 'd')}
                    </div>
                  </div>
                  <div>
                    <span className={`font-semibold ${
                      section.isToday
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {section.label}
                    </span>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {section.timeSlots.length + section.unscheduledTasks.length} tasks
                    </div>
                  </div>
                </div>

                {/* Task count by priority */}
                <div className="flex items-center gap-2">
                  {[...section.timeSlots.flatMap(s => s.tasks), ...section.unscheduledTasks]
                    .reduce((acc, t) => {
                      acc[t.priority] = (acc[t.priority] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>) && (
                    <>
                      {(['high', 'medium', 'low'] as const).map(priority => {
                        const count = [...section.timeSlots.flatMap(s => s.tasks), ...section.unscheduledTasks]
                          .filter(t => t.priority === priority).length;
                        if (count === 0) return null;
                        return (
                          <span
                            key={priority}
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              priority === 'high'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                : priority === 'medium'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {count} {priority}
                          </span>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Time slots */}
            <div className="p-4">
              {section.timeSlots.length > 0 ? (
                <div className="space-y-2">
                  {section.timeSlots.map((slot) => (
                    <div
                      key={slot.hour}
                      className="flex gap-4 items-start"
                    >
                      {/* Time label */}
                      <div className="w-20 flex-shrink-0 pt-2">
                        <span className={`text-sm font-medium ${
                          section.isToday && slot.hour < new Date().getHours()
                            ? 'text-slate-400 dark:text-slate-500'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}>
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
              ) : null}

              {/* Unscheduled tasks */}
              {section.unscheduledTasks.length > 0 && (
                <div className={section.timeSlots.length > 0 ? 'mt-4 pt-4 border-t border-slate-100 dark:border-slate-700' : ''}>
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Any time
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
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
                <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl mb-4">
                    <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">
                    No tasks scheduled
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-500">
                    {section.isToday
                      ? 'Add tasks with due dates to see them here'
                      : 'Tasks for this day will appear here'}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
        <span className="inline-flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">←</kbd>
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">→</kbd>
          Navigate days
        </span>
        <span className="mx-3">•</span>
        <span className="inline-flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">T</kbd>
          Jump to today
        </span>
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
    high: 'border-l-red-500 bg-red-50 dark:bg-red-900/20',
    medium: 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/20',
    low: 'border-l-slate-400 bg-slate-50 dark:bg-slate-700/50',
  };

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-start gap-3 p-3 bg-white dark:bg-slate-800 border-l-4 ${priorityColors[task.priority]} rounded-r-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${
        isPast ? 'opacity-60' : ''
      } ${task.completed ? 'opacity-50' : ''}`}
    >
      {/* Complete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onComplete?.();
        }}
        className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 transition-all ${
          task.completed
            ? 'bg-green-500 border-green-500'
            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
        } flex items-center justify-center`}
      >
        {task.completed && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Task content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-slate-800 dark:text-slate-200 ${
          task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
        }`}>
          {task.text}
        </p>

        {/* Task meta */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.category && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              #{task.category}
            </span>
          )}
          {isUnscheduled && (
            <span className="text-xs text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
              </svg>
              AI suggested
            </span>
          )}
          {task.subtasks && task.subtasks.length > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
            </span>
          )}
        </div>
      </div>

      {/* Priority badge */}
      {task.priority === 'high' && !task.completed && (
        <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
          Urgent
        </span>
      )}
    </div>
  );
};

export default TimelineView;
