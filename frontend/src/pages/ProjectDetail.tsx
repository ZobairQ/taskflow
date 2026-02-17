/**
 * ProjectDetail - Redesigned individual project view with clear task sections
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects, Task } from '../ProjectContext';
import { useGame } from '../GamificationContext';
import { calculateProgress } from '../utils/formatters';
import { AddTaskForm, TaskGroupList, TaskBoard } from '../components/tasks';
import { TaskModal } from '../TaskModal';
import { TaskStatus } from '../types';
import { getTaskStatus } from '../utils/taskUtils';
import { MainLayout } from '../components/layout';

type TaskView = 'pending' | 'in_progress' | 'completed' | 'all';
type ViewMode = 'list' | 'board';

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProject, addTodoToProject, updateTodoInProject, deleteTodoFromProject, updateProjectStats } = useProjects();
  const { completeTask } = useGame();
  const navigate = useNavigate();

  const project = getProject(projectId || '');

  const [todos, setTodos] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskView, setTaskView] = useState<TaskView>('pending');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');

  // Load project todos on mount
  useEffect(() => {
    if (project) {
      setTodos(project.todos || []);
    }
  }, [project]);

  const addTodo = (taskData: {
    text: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    category: string;
    dueDate: string;
  }) => {
    if (!project) return;

    const newTodo: Task = {
      id: Date.now().toString(),
      text: taskData.text,
      description: taskData.description,
      completed: false,
      priority: taskData.priority,
      dueDate: taskData.dueDate || null,
      category: taskData.category,
      createdAt: new Date().toISOString(),
    };

    addTodoToProject(project.id, newTodo);
    setTodos((prev) => [newTodo, ...prev]);
  };

  const toggleTodo = (id: string) => {
    if (!project) return;
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const now = new Date().toISOString();
    const currentStatus = getTaskStatus(todo);
    const isCompleting = currentStatus !== 'completed';

    const updatedTodo = {
      ...todo,
      completed: isCompleting,
      status: isCompleting ? 'completed' as TaskStatus : 'pending' as TaskStatus,
      completedAt: isCompleting ? now : undefined,
    };

    updateTodoInProject(project.id, updatedTodo);
    setTodos((prev) => prev.map((t) => (t.id === id ? updatedTodo : t)));

    // Update project stats
    updateProjectStats(project.id, updatedTodo.completed);

    // Gamification: Only award XP when marking as completed
    if (isCompleting) {
      completeTask(todo.priority === 'high');
    }
  };

  const handleStatusChange = (id: string, newStatus: TaskStatus) => {
    if (!project) return;
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const now = new Date().toISOString();
    const updatedTodo = {
      ...todo,
      completed: newStatus === 'completed',
      status: newStatus,
      completedAt: newStatus === 'completed' ? now : undefined,
      startedAt: newStatus === 'in_progress' ? now : todo.startedAt,
    };

    updateTodoInProject(project.id, updatedTodo);
    setTodos((prev) => prev.map((t) => (t.id === id ? updatedTodo : t)));

    // Update project stats
    updateProjectStats(project.id, updatedTodo.completed);

    // Gamification: Only award XP when marking as completed
    if (newStatus === 'completed' && getTaskStatus(todo) !== 'completed') {
      completeTask(todo.priority === 'high');
    }
  };

  const editTodo = (id: string, updates: Partial<Task>) => {
    if (!project) return;
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const updatedTodo = {
      ...todo,
      ...updates,
    };

    updateTodoInProject(project.id, updatedTodo);
    setTodos((prev) => prev.map((t) => (t.id === id ? updatedTodo : t)));
  };

  const deleteTodo = (id: string) => {
    if (!project) return;
    deleteTodoFromProject(project.id, id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // Calculate stats using getTaskStatus
  const pendingTasks = todos.filter((t) => getTaskStatus(t) === 'pending');
  const inProgressTasks = todos.filter((t) => getTaskStatus(t) === 'in_progress');
  const completedTasks = todos.filter((t) => getTaskStatus(t) === 'completed');
  const highPriorityPending = pendingTasks.filter((t) => t.priority === 'high');

  const progress = calculateProgress(completedTasks.length, todos.length);

  // Filter tasks based on view and search
  const filteredTasks = todos.filter((task) => {
    const status = getTaskStatus(task);
    const matchesView =
      taskView === 'all' ||
      (taskView === 'pending' && status === 'pending') ||
      (taskView === 'in_progress' && status === 'in_progress') ||
      (taskView === 'completed' && status === 'completed');

    const matchesSearch =
      searchQuery === '' ||
      task.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesView && matchesSearch;
  });

  if (!project) {
    return (
      <MainLayout>
        <div className="p-4 md:p-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">Project not found</h2>
              <button
                onClick={() => navigate('/')}
                className="text-indigo-600 hover:underline mt-4 inline-block"
              >
                Back to Projects
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
        {/* Project Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${project.color} text-white text-xs font-bold mb-3`}>
                {project.name}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-2">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-slate-600 dark:text-slate-300 text-base">{project.description}</p>
              )}
            </div>

            {/* Stats Summary */}
            <div className="flex gap-3">
              <div className="text-center px-5 py-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border-2 border-amber-200 dark:border-amber-800">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingTasks.length}</div>
                <div className="text-xs text-amber-700 dark:text-amber-300 uppercase font-semibold">To Do</div>
              </div>
              <div className="text-center px-5 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{inProgressTasks.length}</div>
                <div className="text-xs text-blue-700 dark:text-blue-300 uppercase font-semibold">In Progress</div>
              </div>
              <div className="text-center px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border-2 border-emerald-200 dark:border-emerald-800">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completedTasks.length}</div>
                <div className="text-xs text-emerald-700 dark:text-emerald-300 uppercase font-semibold">Done</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Overall Progress
              </span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
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
        </div>

        {/* Quick Stats Cards */}
        {pendingTasks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {highPriorityPending.length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🔥</span>
                  <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wide">
                    High Priority
                  </span>
                </div>
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  {highPriorityPending.length} task{highPriorityPending.length !== 1 && 's'}
                </div>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">Needs immediate attention</p>
              </div>
            )}

            {completedTasks.length > 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                    Completed
                  </span>
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {completedTasks.length} task{completedTasks.length !== 1 && 's'}
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Great progress! 🎉</p>
              </div>
            )}

            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
                  Total
                </span>
              </div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {todos.length} task{todos.length !== 1 && 's'}
              </div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">In this project</p>
            </div>
          </div>
        )}

        {/* Add Task Form */}
        <AddTaskForm onAdd={addTodo} showDescription={true} />

        {/* Task View Tabs & Search */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* View Tabs */}
            <div className="flex gap-2 w-full md:w-auto flex-wrap">
              <button
                onClick={() => setTaskView('pending')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  taskView === 'pending'
                    ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                To Do
                {pendingTasks.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs font-bold">
                    {pendingTasks.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setTaskView('in_progress')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  taskView === 'in_progress'
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                In Progress
                {inProgressTasks.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-bold">
                    {inProgressTasks.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setTaskView('completed')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  taskView === 'completed'
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Done
                {completedTasks.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                    {completedTasks.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setTaskView('all')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  taskView === 'all'
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                All
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 outline-none text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700"
              />
              <svg
                className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Task List - Grouped by Priority */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          {/* View Mode Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              List View
            </button>

            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'board'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Board View
            </button>
          </div>

          {/* Conditional View Rendering */}
          {viewMode === 'board' ? (
            <TaskBoard
              tasks={todos}
              onToggle={toggleTodo}
              onStatusChange={handleStatusChange}
              onDelete={deleteTodo}
              onViewDetails={setSelectedTask}
            />
          ) : (
            <TaskGroupList
              tasks={filteredTasks}
              onToggle={toggleTodo}
              onStatusChange={handleStatusChange}
              onDelete={deleteTodo}
              onViewDetails={setSelectedTask}
              showCompleted={taskView === 'completed'}
              showInProgress={taskView === 'in_progress'}
            />
          )}
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
        </div>
      </div>
    </MainLayout>
  );
}
