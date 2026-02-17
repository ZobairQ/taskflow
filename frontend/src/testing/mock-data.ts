/**
 * Mock Data - Test fixtures for consistent testing
 */

import { Task } from '../types';

// Sample tasks for testing
export const mockTasks: Task[] = [
  {
    id: "1",
    text: 'Complete project proposal',
    completed: false,
    priority: 'high',
    createdAt: '2024-01-15T10:00:00.000Z',
    dueDate: '2024-01-20T00:00:00.000Z',
    category: 'work',
    description: 'Write the Q1 project proposal',
    subtasks: [
      { id: "1", text: 'Research competitors', completed: true, createdAt: '2024-01-15T10:00:00.000Z' },
      { id: "2", text: 'Draft outline', completed: false, createdAt: '2024-01-15T10:00:00.000Z' },
    ],
  },
  {
    id: "2",
    text: 'Review code changes',
    completed: true,
    priority: 'medium',
    createdAt: '2024-01-14T09:00:00.000Z',
    dueDate: null,
    completedAt: '2024-01-14T15:00:00.000Z',
    category: 'work',
    description: 'Review pull requests from team',
  },
  {
    id: "3",
    text: 'Buy groceries',
    completed: false,
    priority: 'low',
    createdAt: '2024-01-15T08:00:00.000Z',
    dueDate: null,
    category: 'personal',
    description: 'Weekly shopping trip',
  },
  {
    id: "4",
    text: 'Weekly team meeting',
    completed: false,
    priority: 'medium',
    createdAt: '2024-01-10T10:00:00.000Z',
    dueDate: null,
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [1], // Monday
    },
    category: 'work',
    description: 'Regular team sync',
  },
  {
    id: "5",
    text: 'Gym workout',
    completed: false,
    priority: 'high',
    createdAt: '2024-01-15T06:00:00.000Z',
    dueDate: '2024-01-15T18:00:00.000Z',
    category: 'health',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'daily',
      interval: 1,
    },
    description: 'Daily exercise routine',
  },
];

// Sample projects for testing
export const mockProjects = [
  {
    id: "1",
    name: 'Work Tasks',
    description: 'Professional tasks and deadlines',
    color: 'from-blue-500 to-indigo-600',
    createdAt: '2024-01-01T00:00:00.000Z',
    completedTodos: 5,
    totalTodos: 10,
    todos: mockTasks.filter(t => t.category === 'work'),
  },
  {
    id: "2",
    name: 'Personal',
    description: 'Personal errands and goals',
    color: 'from-green-500 to-teal-600',
    createdAt: '2024-01-01T00:00:00.000Z',
    completedTodos: 3,
    totalTodos: 5,
    todos: mockTasks.filter(t => t.category === 'personal'),
  },
];
