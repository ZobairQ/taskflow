// Import individual resolver modules
import { authResolvers } from './auth';
import { userResolvers } from './user';
import { projectResolvers } from './project';
import { taskResolvers } from './task';
import { gamificationResolvers } from './gamification';
import { timerResolvers } from './timer';
import { templateResolvers } from './template';
import { analyticsResolvers } from './analytics';

// Combine all resolvers
export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...userResolvers.Query,
    ...projectResolvers.Query,
    ...taskResolvers.Query,
    ...gamificationResolvers.Query,
    ...timerResolvers.Query,
    ...templateResolvers.Query,
    ...analyticsResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...projectResolvers.Mutation,
    ...taskResolvers.Mutation,
    ...gamificationResolvers.Mutation,
    ...timerResolvers.Mutation,
    ...templateResolvers.Mutation,
  },
  User: {
    ...userResolvers.User,
  },
  Project: {
    ...projectResolvers.Project,
  },
  Task: {
    ...taskResolvers.Task,
  },
  GamificationProfile: {
    ...gamificationResolvers.GamificationProfile,
  },
  PomodoroSession: {
    ...timerResolvers.PomodoroSession,
  },
};
