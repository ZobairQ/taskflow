/**
 * Mock Data - Test fixtures for consistent testing
 */

import { Task } from '../../ProjectContext';

// Sample tasks for testing
export const mockTasks: Task[] = [
  {
    id: 1,
    text: 'Complete project proposal',
    completed: false,
    priority: 'high',
    projectId: 1,
    createdAt: new Date('2024-01-15T10:00:00.000Z').getTime(),
    dueDate: '2024-01-20T00:00:00.000Z',
    category: 'work',
    description: 'Write the Q1 project proposal',
    subtasks: [
      { id: 'st1', text: 'Research competitors', completed: true },
      { id: 'st2', text: 'Draft outline', completed: false },
    ],
  },
  {
    id: 2,
    text: 'Review code changes',
    completed: true,
    priority: 'medium',
    projectId: 1,
    createdAt: new Date('2024-01-14T09:00:00.000Z').getTime(),
    completedAt: '2024-01-14T15:00:00.000Z',
    category: 'work',
    description: 'Review pull requests from team',
  },
  {
    id: 3,
    text: 'Buy groceries',
    completed: false,
    priority: 'low',
    projectId: 2,
    createdAt: new Date('2024-01-15T08:00:00.000Z').getTime(),
    category: 'personal',
    description: 'Weekly shopping trip',
  },
  {
    id: 4,
    text: 'Weekly team meeting',
    completed: false,
    priority: 'medium',
    projectId: 1,
    createdAt: new Date('2024-01-10T10:00:00.000Z').getTime(),
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
    id: 5,
    text: 'Gym workout',
    completed: false,
    priority: 'high',
    projectId: 2,
    createdAt: new Date('2024-01-15T06:00:00.000Z').getTime(),
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
    id: 1,
    name: 'Work Tasks',
    color: '#6366f1',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Personal',
    color: '#10b981',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

// Sample recurring patterns for testing
export const mockRecurrencePatterns = {
  daily: {
    frequency: 'daily' as const,
    interval: 1,
  },
  weekly: {
    frequency: 'weekly' as const,
    interval: 1,
    daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
  },
  monthly: {
    frequency: 'monthly' as const,
    interval: 1,
    dayOfMonth: 15,
  },
  yearly: {
    frequency: 'yearly' as const,
    interval: 1,
  },
  custom: {
    frequency: 'custom' as const,
    interval: 2,
    daysOfWeek: [0, 6], // Weekends
  },
};

// Sample Pomodoro sessions for testing
export const mockPomodoroSessions = [
  {
    id: 'session-1',
    taskId: 1,
    startTime: '2024-01-15T09:00:00.000Z',
    endTime: '2024-01-15T09:25:00.000Z',
    duration: 25,
    completed: true,
  },
  {
    id: 'session-2',
    taskId: 1,
    startTime: '2024-01-15T10:00:00.000Z',
    endTime: '2024-01-15T10:25:00.000Z',
    duration: 25,
    completed: true,
  },
  {
    id: 'session-3',
    taskId: 2,
    startTime: '2024-01-14T14:00:00.000Z',
    endTime: '2024-01-14T14:15:00.000Z',
    duration: 15,
    completed: false,
  },
];

// Gamification sample data
export const mockGamificationData = {
  points: 1250,
  level: 5,
  streak: 7,
  achievements: [
    { id: 'first-task', name: 'First Steps', unlocked: true },
    { id: 'streak-7', name: 'Week Warrior', unlocked: true },
    { id: 'complete-100', name: 'Century', unlocked: false },
  ],
};

// Sample task templates
export const mockTemplates = [
  {
    id: 'template-1',
    name: 'Meeting Notes',
    category: 'work' as const,
    icon: '📋',
    template: {
      text: 'Meeting with {{attendee}}',
      description: 'Discuss {{topic}}',
      priority: 'medium' as const,
      subtasks: [
        { id: 'st1', text: 'Prepare agenda', completed: false },
        { id: 'st2', text: 'Send follow-up email', completed: false },
      ],
    },
  },
  {
    id: 'template-2',
    name: 'Bug Report',
    category: 'work' as const,
    icon: '🐛',
    template: {
      text: 'Fix bug: {{bug_name}}',
      description: 'Steps to reproduce:\n1. {{step1}}\n2. {{step2}}',
      priority: 'high' as const,
    },
  },
];
