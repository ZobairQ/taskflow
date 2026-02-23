/**
 * Test Utilities
 * Helper functions for testing
 */

import { User, Project, Task, TaskPriority, TaskStatus } from '@prisma/client';

/**
 * Create a mock user for testing
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashed-password',
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
    ...overrides,
  } as User;
}

/**
 * Create a mock project for testing
 */
export function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'project-123',
    name: 'Test Project',
    description: 'Test project description',
    color: '#6366f1',
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Project;
}

/**
 * Create a mock task for testing
 */
export function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-123',
    text: 'Test task',
    description: 'Test task description',
    completed: false,
    status: TaskStatus.pending,
    priority: TaskPriority.medium,
    category: 'general',
    dueDate: null,
    completedAt: null,
    subtasks: null,
    isRecurring: false,
    recurrencePattern: null,
    notificationSettings: null,
    projectId: 'project-123',
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Task;
}

/**
 * Create a mock gamification profile
 */
export function createMockGameProfile(overrides: Record<string, any> = {}) {
  return {
    id: 'game-123',
    userId: 'user-123',
    level: 1,
    xp: 0,
    currentStreak: 0,
    maxStreak: 0,
    totalTasksCompleted: 0,
    activePowerUps: [],
    lastStreakDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create mock Prisma client
 */
export function createMockPrisma(): any {
  return {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    task: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    gamificationProfile: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((fn: any) => fn(createMockPrisma())),
  };
}

/**
 * Wait for a specified number of milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create mock context for GraphQL resolvers
 */
export function createMockContext(user: User | null = null, prisma: any = createMockPrisma()) {
  return {
    user,
    prisma,
    loaders: {
      taskLoader: { load: jest.fn() },
      tasksByProjectLoader: { load: jest.fn() },
      userLoader: { load: jest.fn() },
    },
  };
}
