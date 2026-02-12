/**
 * ProjectDetail - Individual project view with tasks
 * Refactored from 498 lines to ~150 lines using reusable components
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProjects, Task } from '../ProjectContext';
import { useGame, getStreakBadge, getXpProgress } from '../GamificationContext';
import { useFilters } from '../hooks/useFilters';
import { calculateProgress } from '../utils/formatters';
import { TaskList, AddTaskForm, TaskFilters } from '../components/tasks';
import { LevelCard, StreakCard } from '../components/gamification';
import { TaskModal } from '../TaskModal';

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProject, addTodoToProject, updateTodoInProject, deleteTodoFromProject, updateProjectStats } = useProjects();
  const { gameData, completeTask } = useGame();
  const navigate = useNavigate();

  const project = getProject(projectId || '');

  const [todos, setTodos] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Load project todos on mount
  useEffect(() => {
    if (project) {
      setTodos(project.todos);
    }
  }, [project]);

  // Use custom filter hook
  const { filter, setFilter, searchQuery, setSearchQuery, filteredTasks } = useFilters(todos);

  const addTodo = (taskData: {
    text: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    category: string;
    dueDate: string;
  }) => {
    if (!project) return;

    const newTodo: Task = {
      id: Date.now(),
      text: taskData.text,
      description: taskData.description,
      completed: false,
      priority: taskData.priority,
      dueDate: taskData.dueDate || null,
      category: taskData.category,
      createdAt: Date.now(),
    };

    addTodoToProject(project.id, newTodo);
    setTodos((prev) => [newTodo, ...prev]);
  };

  const toggleTodo = (id: number) => {
    if (!project) return;
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const now = Date.now();
    const updatedTodo = {
      ...todo,
      completed: !todo.completed,
      completedAt: !todo.completed ? now : undefined,
    };

    updateTodoInProject(project.id, updatedTodo);
    setTodos((prev) => prev.map((t) => (t.id === id ? updatedTodo : t)));

    // Update project stats
    updateProjectStats(project.id, updatedTodo.completed);

    // Gamification: Only award XP when marking as completed
    if (updatedTodo.completed && !todo.completed) {
      completeTask(todo.priority === 'high');
    }
  };

  const deleteTodo = (id: number) => {
    if (!project) return;
    deleteTodoFromProject(project.id, id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // Calculate stats
  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    active: todos.filter((t) => !t.completed).length,
    highPriority: todos.filter((t) => t.priority === 'high' && !t.completed).length,
  };

  const progress = calculateProgress(stats.completed, stats.total);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-700">Project not found</h2>
          <Link to="/" className="text-indigo-600 hover:underline mt-4 inline-block">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const streakInfo = getStreakBadge(gameData.streak);
  const xpProgress = getXpProgress(gameData.level, gameData.xp);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Projects
        </button>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${project.color} text-white text-xs font-bold mb-4`}>
              {project.name}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-2">
              {project.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg">{project.description}</p>
          </div>
          <div className="flex gap-3">
            <div className="text-center px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.active}</div>
              <div className="text-xs text-slate-500 uppercase font-semibold">Pending</div>
            </div>
            <div className="text-center px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completed}</div>
              <div className="text-xs text-slate-500 uppercase font-semibold">Done</div>
            </div>
          </div>
        </div>

        {/* Level & Streak Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LevelCard level={gameData.level} xp={gameData.xp} xpProgress={xpProgress} />

          <StreakCard streak={gameData.streak} streakInfo={streakInfo} />
        </div>

        {/* Project Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-end mb-3">
            <div>
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Project Progress
              </span>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                {progress}%
              </div>
            </div>
            <div className="text-right text-sm text-slate-500">
              {stats.completed} / {stats.total} tasks
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                progress === 100
                  ? 'bg-emerald-500'
                  : `bg-gradient-to-r ${project.color}`
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Add Todo Form */}
        <AddTaskForm onAdd={addTodo} showDescription={false} />

        {/* Filters */}
        <TaskFilters
          filter={filter}
          onFilterChange={setFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          taskCount={filteredTasks.length}
        />

        {/* Todo List */}
        <TaskList
          tasks={filteredTasks}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onViewDetails={setSelectedTask}
          emptyMessage="No tasks found"
          emptySubMessage={filter === 'all' ? 'Add a new task to get started' : `No ${filter} tasks`}
        />

        {/* Task Detail Modal */}
        {selectedTask && (
          <TaskModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onToggleComplete={toggleTodo}
            onDelete={deleteTodo}
          />
        )}
      </div>
    </div>
  );
}
