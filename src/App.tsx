/**
 * App - Main task management view
 * Refactored from 1175 lines to ~200 lines using reusable components
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { GamificationProvider, useGame, getLevelGradient } from './GamificationContext';
import { useProjects, ProjectProvider, Task } from './ProjectContext';
import { useFilters } from './hooks/useFilters';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { getGreeting } from './utils/dateUtils';
import { calculateProgress, pluralize } from './utils/formatters';
import { ProgressBar, StatCard, ShortcutsHelp } from './components/common';
import { TaskList, AddTaskForm, TaskFilters } from './components/tasks';
import { CalendarView } from './components/calendar';
import {
  LevelCard,
  StreakCard,
  PowerUpSection,
  AchievementsGrid,
  LevelUpModal,
} from './components/gamification';
import { QuickActions, FeatureHints } from './components/layout';
import { TaskModal } from './TaskModal';

function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    gameData,
    completeTask,
    incrementStreak,
    resetStreak,
    checkAchievements,
    getXpProgress,
    getStreakBadge,
    activatePowerUp,
    deactivatePowerUp,
    getLevelFromXP,
    getLevelColor,
  } = useGame();

  const [todos, setTodos] = useState<Task[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('todos');
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load todos:', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Use custom filter hook
  const { filter, setFilter, searchQuery, setSearchQuery, filteredTasks } = useFilters(todos);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewTask: () => inputRef.current?.focus(),
    onFocusSearch: () => {
      const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
      searchInput?.focus();
    },
    onShowHelp: () => setShowShortcutsHelp(true),
    onCloseModal: () => {
      setSelectedTask(null);
      setShowLevelUp(false);
      setShowShortcutsHelp(false);
    },
    onToggleTheme: toggleTheme,
    onToggleCalendar: () => setViewMode(v => v === 'calendar' ? 'list' : 'calendar'),
    onFilterAll: () => setFilter('all'),
    onFilterActive: () => setFilter('active'),
    onFilterCompleted: () => setFilter('completed'),
  });

  const addTodo = (taskData: {
    text: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    category: string;
    dueDate: string;
    isRecurring?: boolean;
    recurrencePattern?: Task['recurrencePattern'];
  }) => {
    const newTodo: Task = {
      id: Date.now(),
      text: taskData.text,
      description: taskData.description,
      completed: false,
      priority: taskData.priority,
      dueDate: taskData.dueDate || null,
      category: taskData.category,
      createdAt: Date.now(),
      isRecurring: taskData.isRecurring,
      recurrencePattern: taskData.recurrencePattern,
    };

    setTodos([newTodo, ...todos]);
    inputRef.current?.focus();
  };

  const toggleTodo = (id: number) => {
    const todo = todos.find((t) => t.id === id);
    const isHighPriority = todo?.priority === 'high';
    const now = Date.now();

    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          const newlyCompleted = !todo.completed;
          return {
            ...todo,
            completed: !todo.completed,
            completedAt: newlyCompleted ? now : undefined,
          };
        }
        return todo;
      })
    );

    // Gamification: Only award XP when marking as completed
    const todoAfter = todos.find((t) => t.id === id);
    if (todoAfter && !todoAfter.completed) {
      // Task is being uncompleted - don't award XP
      return;
    }
    // Task is being marked complete - award XP
    completeTask(isHighPriority);

    // Streak calculation
    const completedToday = todos.filter((t) => {
      if (!t.completed) return false;
      const completedDate = t.completedAt
        ? new Date(t.completedAt).toDateString()
        : new Date(t.createdAt).toDateString();
      return completedDate === new Date().toDateString();
    }).length;
    if (completedToday === 1) {
      incrementStreak();
    }
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const editTodo = (id: number, updates: Partial<Task>) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          return {
            ...todo,
            ...updates,
          };
        }
        return todo;
      })
    );
  };

  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  // Calculate stats
  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    active: todos.filter((t) => !t.completed).length,
    highPriority: todos.filter((t) => t.priority === 'high' && !t.completed).length,
  };

  const progress = calculateProgress(stats.completed, stats.total);

  // Calculate streak from task completion dates
  const calculateStreak = () => {
    const completedTasks = todos.filter((t) => t.completed && t.completedAt);
    if (completedTasks.length === 0) return 0;

    const dateMap = new Map<string, boolean>();
    for (const task of completedTasks) {
      const completedDate = task.completedAt
        ? new Date(task.completedAt).toDateString()
        : new Date().toDateString();
      dateMap.set(completedDate, true);
    }
    const completionDates = Array.from(dateMap.keys()).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    let streak = 0;
    let currentDate = new Date();

    for (const dateStr of completionDates) {
      const date = new Date(dateStr);
      const diffDays = Math.floor(
        (currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0 || diffDays === 1) {
        streak++;
        currentDate = date;
      } else {
        break;
      }
    }

    return streak;
  };

  // Sync streak with task completion dates
  useEffect(() => {
    const currentStreak = calculateStreak();
    if (currentStreak !== gameData.streak) {
      if (currentStreak === 0) {
        resetStreak();
      } else {
        const daysDifference = currentStreak - gameData.streak;
        if (daysDifference > 0) {
          for (let i = 0; i < daysDifference; i++) {
            incrementStreak();
          }
        } else if (daysDifference < 0) {
          resetStreak();
          for (let i = 0; i < currentStreak; i++) {
            incrementStreak();
          }
        }
      }
    }
  }, [todos, gameData.streak]);

  // Check achievements on mount
  useEffect(() => {
    checkAchievements(stats.completed, gameData.completedTasksToday, stats.highPriority);
  }, []);

  // Show level up animation when level increases
  useEffect(() => {
    if (gameData.xp >= 500 && !showLevelUp) {
      const timer = setTimeout(() => setShowLevelUp(true), 100);
      return () => clearTimeout(timer);
    }
  }, [gameData.level, gameData.xp]);

  const xpProgress = getXpProgress(gameData.level, gameData.xp);
  const streakInfo = getStreakBadge(gameData.streak);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              TF
            </div>
            <div>
              <h1 className="font-bold text-slate-800 dark:text-slate-100">TaskFlow</h1>
              <Link
                to="/projects"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Projects Overview
              </Link>
            </div>
          </div>
          <div className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
            {stats.completed} done today
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Task
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Flow
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl">
            {getGreeting()}! You have {stats.active} pending {pluralize(stats.active, 'task')}
          </p>

          {/* Action Bar - Easy access buttons with labels */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Link
              to="/analytics"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                theme === 'dark'
                  ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 shadow-sm border border-slate-200'
              }`}
            >
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Analytics</span>
            </Link>

            <Link
              to="/settings"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                theme === 'dark'
                  ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 shadow-sm border border-slate-200'
              }`}
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </Link>

            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                theme === 'dark'
                  ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 shadow-sm border border-slate-200'
              }`}
            >
              {theme === 'light' ? (
                <>
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Light</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowShortcutsHelp(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                theme === 'dark'
                  ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 shadow-sm border border-slate-200'
              }`}
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="hidden sm:inline">Shortcuts</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 text-xs bg-slate-200 dark:bg-slate-600 rounded">?</kbd>
            </button>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5 10 5 10-5-5-2.5-5 2.5z" />
            </svg>
          </div>
          <div className="flex justify-between items-end mb-3 relative z-10">
            <div>
              <span className="text-sm font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Daily Progress
              </span>
              <div className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                {progress}%
              </div>
            </div>
            <div className="text-right text-sm text-slate-500 dark:text-slate-400">
              {stats.completed} / {stats.total} completed
            </div>
          </div>
          <ProgressBar progress={progress} />
        </div>

        {/* Gamification Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Level Card */}
          <LevelCard
            level={gameData.level}
            xp={gameData.xp}
            xpProgress={xpProgress}
            maxStreak={gameData.maxStreak}
          />

          {/* Streak Card */}
          <StreakCard streak={gameData.streak} streakInfo={streakInfo} />
        </div>

        {/* Power-Ups Section */}
        <PowerUpSection
          powerUps={gameData.powerUps}
          level={gameData.level}
          xp={gameData.xp}
          streak={gameData.streak}
          xpProgress={xpProgress}
          onActivate={activatePowerUp}
          onDeactivate={deactivatePowerUp}
        />

        {/* Stats Quick View */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <StatCard
            value={stats.total}
            label="Total Tasks"
            icon={
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
          />
          <StatCard
            value={stats.active}
            label="Pending"
            valueColor="text-emerald-600 dark:text-emerald-400"
            icon={
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            value={stats.highPriority}
            label="Urgent"
            valueColor="text-rose-600 dark:text-rose-400"
            icon={
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Level Up Animation */}
        <LevelUpModal
          isVisible={showLevelUp}
          onClose={() => setShowLevelUp(false)}
          level={gameData.level}
          xp={gameData.xp}
          xpProgress={xpProgress}
          totalTasksCompleted={gameData.totalTasksCompleted}
          streak={gameData.streak}
          maxStreak={gameData.maxStreak}
          xpNeeded={
            Math.ceil(getLevelFromXP(gameData.xp) * 200 * Math.pow(1.5, getLevelFromXP(gameData.xp))) -
            Math.floor(gameData.xp)
          }
          levelGradient={getLevelGradient(gameData.level)}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Feature Hints */}
        <FeatureHints />

        {/* Add Todo Form */}
        <AddTaskForm onAdd={addTodo} showDescription={true} />

        {/* Filters & Search */}
        <TaskFilters
          filter={filter}
          onFilterChange={setFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          taskCount={filteredTasks.length}
        />

        {/* View Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List View
          </button>

          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'calendar'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Calendar View
          </button>
        </div>

        {/* Conditional View Rendering */}
        {viewMode === 'calendar' ? (
          <CalendarView
            tasks={filteredTasks}
            onTaskClick={setSelectedTask}
          />
        ) : (
          <TaskList
            tasks={filteredTasks}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onViewDetails={setSelectedTask}
            emptyMessage="No tasks found"
            emptySubMessage={
              searchQuery ? 'Try adjusting your search criteria' : 'Add a new task to get started'
            }
          />
        )}

        {/* Achievements Section */}
        <AchievementsGrid achievements={gameData.achievements} />

        {/* Footer Actions */}
        {todos.some((t) => t.completed) && (
          <div className="flex justify-center">
            <button
              onClick={clearCompleted}
              className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-sm font-medium transition-all flex items-center gap-2 px-6 py-3 rounded-xl hover:shadow-sm border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear completed tasks
            </button>
          </div>
        )}

        <div className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Tasks saved automatically to your browser
        </div>

        {/* Task Detail Modal */}
        {selectedTask && (
          <TaskModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onToggleComplete={toggleTodo}
            onDelete={deleteTodo}
            onEdit={editTodo}
          />
        )}

        {/* Keyboard Shortcuts Help Modal */}
        <ShortcutsHelp
          isOpen={showShortcutsHelp}
          onClose={() => setShowShortcutsHelp(false)}
        />
      </div>
    </div>
  );
}

export default App;
