/**
 * CalendarView - Main calendar component for visual task planning
 */

import React, { useState, useMemo } from 'react';
import { Task } from '../../types';
import { CalendarViewMode, CalendarDay as CalendarDayType } from '../../types/calendar.types';
import { CalendarHeader } from './CalendarHeader';
import { CalendarDay } from './CalendarDay';
import { getTaskStatus } from '../../utils/taskUtils';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onDateClick?: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onTaskClick,
  onDateClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // Get calendar days for the current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    // Get the total days in the month
    const daysInMonth = lastDay.getDate();

    const days: CalendarDayType[] = [];

    // Add days from previous month
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthDays - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isToday(date),
        tasks: getTasksForDate(date),
      });
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isToday(date),
        tasks: getTasksForDate(date),
      });
    }

    // Add days from next month to complete the grid (6 rows × 7 days = 42 total)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isToday(date),
        tasks: getTasksForDate(date),
      });
    }

    return days;
  }, [currentDate, tasks]);

  // Helper function to check if a date is today
  function isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  // Helper function to get tasks for a specific date
  function getTasksForDate(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    return tasks
      .filter((task) => task.dueDate === dateStr)
      .map((task) => ({
        id: task.id,
        text: task.text,
        priority: task.priority,
        status: getTaskStatus(task),
      }));
  }

  // Navigation handlers
  const handlePrevious = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === 'month') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setDate(newDate.getDate() - 7);
      }
      return newDate;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === 'month') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
      return newDate;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthYearString = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700">
      {/* Header */}
      <CalendarHeader
        monthYear={monthYearString}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
      />

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-slate-600 dark:text-slate-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <CalendarDay
            key={index}
            day={day}
            onTaskClick={(taskId) => {
              const task = tasks.find((t) => t.id === taskId);
              if (task && onTaskClick) onTaskClick(task);
            }}
            onDateClick={() => onDateClick && onDateClick(day.date)}
          />
        ))}
      </div>
    </div>
  );
};
