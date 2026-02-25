/**
 * App - Main task management view
 * Refactored from 1175 lines to ~200 lines using reusable components
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTheme } from './ThemeContext';
import { GamificationProvider, useGame, getLevelGradient } from './GamificationContext';
import { useProjects, ProjectProvider, Task } from './ProjectContext';
import { useFilters } from './hooks/useFilters';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { getGreeting } from './utils/dateUtils';
import { calculateProgress, pluralize } from './utils/formatters';
import { ProgressBar, StatCard, ShortcutsHelp } from './components/common';
import { TaskList, AddTaskForm, TaskFilters, TimelineView } from './components/tasks';
import { CalendarView } from './components/calendar';
import { CommandPalette, useCommandPalette } from './components/common/CommandPalette';
import {
  LevelCard,
  StreakCard,
  PowerUpSection,
  AchievementsGrid,
  LevelUpModal,
} from './components/gamification';
import { QuickActions, FeatureHints, AppNavigation } from './components/layout';
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

  // Get projects and tasks from backend via ProjectContext
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    createProject,
    addTodoToProject,
    updateTodoInProject,
    deleteTodoFromProject,
    getTotalStats,
  } = useProjects();

  // Flatten all tasks from all projects for the main view
  const todos: Task[] = useMemo(() => {
    return projects.flatMap((p) => p.todos ?? []);
  }, [projects]);

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'timeline'>('list');
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Command palette
  const commandPalette = useCommandPalette();

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
      const searchInput = document.querySelector(
        'input[placeholder*="Search"]'
      ) as HTMLInputElement;
      searchInput?.focus();
    },
    onShowHelp: () => setShowShortcutsHelp(true),
    onCloseModal: () => {
      setSelectedTask(null);
      setShowLevelUp(false);
      setShowShortcutsHelp(false);
    },
    onToggleTheme: toggleTheme,
    onToggleCalendar: () => setViewMode((v) => (v === 'calendar' ? 'list' : 'calendar')),
    onFilterAll: () => setFilter('all'),
    onFilterActive: () => setFilter('active'),
    onFilterCompleted: () => setFilter('completed'),
  });

  // Find the project a task belongs to
  const findTaskProject = useCallback(
    (taskId: string): string | undefined => {
      for (const project of projects) {
        if (project.todos?.some((t) => t.id === taskId)) {
          return project.id;
        }
      }
      return undefined;
    },
    [projects]
  );

  // Add todo - requires a project (use first project or create one)
  const addTodo = async (taskData: {
    text: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    category: string;
    dueDate: string;
    isRecurring?: boolean;
    recurrencePattern?: Task['recurrencePattern'];
  }) => {
    // Get first project or create one
    let projectId = projects[0]?.id;
    if (!projectId) {
      const newProject = await createProject('My Tasks', 'Default project for tasks');
      if (!newProject) {
        console.error('Failed to create project');
        return;
      }
      projectId = newProject.id;
    }

    await addTodoToProject(projectId, {
      text: taskData.text,
      description: taskData.description,
      completed: false,
      priority: taskData.priority,
      dueDate: taskData.dueDate || null,
      category: taskData.category,
      isRecurring: taskData.isRecurring,
      recurrencePattern: taskData.recurrencePattern,
    });
    inputRef.current?.focus();
  };

  // Toggle todo completion
  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const isHighPriority = todo.priority === 'high';
    const projectId = findTaskProject(id);
    if (!projectId) return;

    await updateTodoInProject(projectId, {
      ...todo,
      completed: !todo.completed,
      completedAt: !todo.completed ? new Date().toISOString() : undefined,
    });

    // Gamification: Only award XP when marking as completed
    if (!todo.completed) {
      completeTask(isHighPriority);

      // Streak calculation
      const completedToday = todos.filter((t) => {
        if (!t.completed) return false;
        const completedDate = t.completedAt
          ? new Date(t.completedAt).toDateString()
          : new Date(t.createdAt).toDateString();
        return completedDate === new Date().toDateString();
      }).length;
      if (completedToday === 0) {
        incrementStreak();
      }
    }
  };

  // Delete todo
  const deleteTodo = async (id: string) => {
    const projectId = findTaskProject(id);
    if (!projectId) return;
    await deleteTodoFromProject(projectId, id);
  };

  // Edit todo
  const editTodo = async (id: string, updates: Partial<Task>) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const projectId = findTaskProject(id);
    if (!projectId) return;

    await updateTodoInProject(projectId, {
      ...todo,
      ...updates,
    });
  };

  // Clear completed todos
  const clearCompleted = async () => {
    const completedTodos = todos.filter((t) => t.completed);
    for (const todo of completedTodos) {
      const projectId = findTaskProject(todo.id);
      if (projectId) {
        await deleteTodoFromProject(projectId, todo.id);
      }
    }
  };

  // Calculate stats - memoized to avoid recalculating on every render
  const stats = useMemo(
    () => ({
      total: todos.length,
      completed: todos.filter((t) => t.completed).length,
      active: todos.filter((t) => !t.completed).length,
      highPriority: todos.filter((t) => t.priority === 'high' && !t.completed).length,
    }),
    [todos]
  );

  const progress = calculateProgress(stats.completed, stats.total);

  // Calculate streak from task completion dates - memoized
  const calculateStreak = useCallback(() => {
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
      const diffDays = Math.floor((currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0 || diffDays === 1) {
        streak++;
        currentDate = date;
      } else {
        break;
      }
    }

    return streak;
  }, [todos]);

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
  }, [calculateStreak, gameData.streak, incrementStreak, resetStreak]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Sidebar Navigation */}
      <AppNavigation
        currentView={viewMode}
        onViewChange={setViewMode}
        onOpenCommandPalette={commandPalette.toggle}
        completedToday={stats.completed}
      />

      {/* Main Content */}
      <div className="pt-16 lg:pt-0 p-4 md:p-8 transition-all duration-300">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl">
              {getGreeting()}! You have {stats.active} pending {pluralize(stats.active, 'task')}
            </p>
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
              Math.ceil(
                getLevelFromXP(gameData.xp) * 200 * Math.pow(1.5, getLevelFromXP(gameData.xp))
              ) - Math.floor(gameData.xp)
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

          {/* Conditional View Rendering */}
          {viewMode === 'calendar' ? (
            <CalendarView tasks={filteredTasks} onTaskClick={setSelectedTask} />
          ) : viewMode === 'timeline' ? (
            <TimelineView
              tasks={filteredTasks}
              onTaskClick={setSelectedTask}
              onTaskComplete={toggleTodo}
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
          <ShortcutsHelp isOpen={showShortcutsHelp} onClose={() => setShowShortcutsHelp(false)} />

          {/* Command Palette */}
          <CommandPalette
            isOpen={commandPalette.isOpen}
            onClose={commandPalette.close}
            onAddTask={() => {
              commandPalette.close();
              inputRef.current?.focus();
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
