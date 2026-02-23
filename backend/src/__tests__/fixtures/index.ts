/**
 * Test Fixtures
 * Common test data and configurations
 */

import { TaskPriority, TaskStatus } from '@prisma/client';

// Sample user data
export const testUsers = {
  user1: {
    id: 'user-1',
    email: 'user1@test.com',
    name: 'User One',
    passwordHash: '$2a$10$abcdefghijklmnopqrstuvwx', // bcrypt hash for 'password123'
  },
  user2: {
    id: 'user-2',
    email: 'user2@test.com',
    name: 'User Two',
    passwordHash: '$2a$10$abcdefghijklmnopqrstuvwx',
  },
};

// Sample project data
export const testProjects = {
  project1: {
    id: 'project-1',
    name: 'Work Tasks',
    description: 'Tasks related to work',
    color: '#6366f1',
    userId: 'user-1',
  },
  project2: {
    id: 'project-2',
    name: 'Personal',
    description: 'Personal tasks',
    color: '#22c55e',
    userId: 'user-1',
  },
};

// Sample task data
export const testTasks = {
  task1: {
    id: 'task-1',
    text: 'Complete documentation',
    description: 'Write API documentation',
    priority: TaskPriority.high,
    status: TaskStatus.pending,
    category: 'documentation',
    projectId: 'project-1',
    userId: 'user-1',
    completed: false,
  },
  task2: {
    id: 'task-2',
    text: 'Fix bug in auth',
    description: 'Fix login issue',
    priority: TaskPriority.high,
    status: TaskStatus.in_progress,
    category: 'bugfix',
    projectId: 'project-1',
    userId: 'user-1',
    completed: false,
  },
  task3: {
    id: 'task-3',
    text: 'Review PR',
    description: 'Review pull request #42',
    priority: TaskPriority.medium,
    status: TaskStatus.completed,
    category: 'review',
    projectId: 'project-1',
    userId: 'user-1',
    completed: true,
  },
};

// Valid registration input
export const validRegisterInput = {
  email: 'newuser@test.com',
  password: 'SecurePassword123!',
  name: 'New User',
};

// Valid login input
export const validLoginInput = {
  email: 'user1@test.com',
  password: 'password123',
};

// Invalid inputs for validation testing
export const invalidInputs = {
  register: {
    emptyEmail: { email: '', password: 'password123', name: 'Test' },
    invalidEmail: { email: 'notanemail', password: 'password123', name: 'Test' },
    shortPassword: { email: 'test@test.com', password: '123', name: 'Test' },
    emptyName: { email: 'test@test.com', password: 'password123', name: '' },
  },
  task: {
    emptyText: { text: '', projectId: 'project-1' },
    missingProjectId: { text: 'Test task' },
    invalidPriority: { text: 'Test task', projectId: 'project-1', priority: 'invalid' },
  },
  project: {
    emptyName: { name: '' },
    longName: { name: 'a'.repeat(101) },
    invalidColor: { name: 'Test', color: 'notacolor' },
  },
};
