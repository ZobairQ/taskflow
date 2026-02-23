// @ts-nocheck
/**
 * MSW Handlers
 * Mock handlers for GraphQL API
 */

import { graphql } from 'msw';

// Mock data
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockProject = {
  id: 'project-1',
  name: 'Test Project',
  description: 'A test project',
  color: '#6366f1',
  userId: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockTask = {
  id: 'task-1',
  text: 'Test Task',
  description: 'Test task description',
  completed: false,
  status: 'pending',
  priority: 'medium',
  category: 'general',
  dueDate: null,
  completedAt: null,
  subtasks: null,
  isRecurring: false,
  recurrencePattern: null,
  notificationSettings: null,
  projectId: 'project-1',
  userId: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockGameProfile = {
  id: 'game-1',
  userId: 'user-1',
  level: 1,
  xp: 0,
  currentStreak: 0,
  maxStreak: 0,
  totalTasksCompleted: 0,
  activePowerUps: [],
  lastStreakDate: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// GraphQL handlers
export const handlers = [
  // Auth mutations
  graphql.mutation('Login', (req, res, ctx) => {
    const { email, password } = req.variables;

    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.data({
          login: {
            user: mockUser,
            token: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
          },
        })
      );
    }

    return res(
      ctx.errors([
        {
          message: 'Invalid credentials',
        },
      ])
    );
  }),

  graphql.mutation('Register', (req, res, ctx) => {
    const { email, password, name } = req.variables;

    if (email && password && name) {
      return res(
        ctx.data({
          register: {
            user: { ...mockUser, email, name },
            token: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
          },
        })
      );
    }

    return res(
      ctx.errors([
        {
          message: 'Invalid input',
        },
      ])
    );
  }),

  // Project queries
  graphql.query('GetProjects', (req, res, ctx) => {
    return res(
      ctx.data({
        projects: [mockProject],
      })
    );
  }),

  graphql.query('GetProject', (req, res, ctx) => {
    const { id } = req.variables;
    if (id === 'project-1') {
      return res(
        ctx.data({
          project: mockProject,
        })
      );
    }
    return res(
      ctx.data({
        project: null,
      })
    );
  }),

  graphql.mutation('CreateProject', (req, res, ctx) => {
    const { input } = req.variables;
    return res(
      ctx.data({
        createProject: {
          ...mockProject,
          ...input,
          id: 'project-new',
        },
      })
    );
  }),

  graphql.mutation('UpdateProject', (req, res, ctx) => {
    const { input } = req.variables;
    return res(
      ctx.data({
        updateProject: {
          ...mockProject,
          ...input,
        },
      })
    );
  }),

  graphql.mutation('DeleteProject', (req, res, ctx) => {
    return res(
      ctx.data({
        deleteProject: true,
      })
    );
  }),

  // Task queries
  graphql.query('GetTasks', (req, res, ctx) => {
    return res(
      ctx.data({
        tasks: [mockTask],
      })
    );
  }),

  graphql.query('GetTask', (req, res, ctx) => {
    const { id } = req.variables;
    if (id === 'task-1') {
      return res(
        ctx.data({
          task: mockTask,
        })
      );
    }
    return res(
      ctx.data({
        task: null,
      })
    );
  }),

  graphql.mutation('CreateTask', (req, res, ctx) => {
    const { input } = req.variables;
    return res(
      ctx.data({
        createTask: {
          ...mockTask,
          ...input,
          id: 'task-new',
        },
      })
    );
  }),

  graphql.mutation('UpdateTask', (req, res, ctx) => {
    const { input } = req.variables;
    return res(
      ctx.data({
        updateTask: {
          ...mockTask,
          ...input,
        },
      })
    );
  }),

  graphql.mutation('DeleteTask', (req, res, ctx) => {
    return res(
      ctx.data({
        deleteTask: mockTask,
      })
    );
  }),

  graphql.mutation('CompleteTask', (req, res, ctx) => {
    return res(
      ctx.data({
        completeTask: {
          ...mockTask,
          completed: true,
          status: 'completed',
          completedAt: new Date().toISOString(),
        },
      })
    );
  }),

  // Gamification queries
  graphql.query('GetGamificationProfile', (req: any, res: any, ctx: any) => {
    return res(
      ctx.data({
        gamificationProfile: mockGameProfile,
      })
    );
  }),

  // Me query
  graphql.query('Me', (req: any, res: any, ctx: any) => {
    return res(
      ctx.data({
        me: mockUser,
      })
    );
  }),
];
