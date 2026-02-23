/**
 * Auth Resolvers
 * GraphQL resolvers for authentication operations using AuthService
 */

import { Context, prisma } from '../types/context';
import { AuthService } from '../services/auth.service';
import { AuthenticationError } from '../utils/errors';

// Initialize service
const authService = new AuthService(prisma);

export const authResolvers = {
  Query: {
    me: async (_: any, __: any, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }
      return user;
    },
  },

  Mutation: {
    register: async (_: any, { input }: { input: any }, { prisma }: Context) => {
      return authService.register(input);
    },

    login: async (_: any, { input }: { input: any }, { prisma }: Context) => {
      return authService.login(input);
    },

    refreshToken: async (_: any, { token }: { token: string }, { prisma }: Context) => {
      return authService.refreshToken(token);
    },

    logout: async (_: any, __: any, { user }: Context) => {
      // In a production app, you might want to blacklist the token
      // For now, we just return true and let the client remove the token
      return true;
    },

    changePassword: async (
      _: any,
      { currentPassword, newPassword }: { currentPassword: string; newPassword: string },
      { user }: Context
    ) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }
      return authService.changePassword(user.id, currentPassword, newPassword);
    },

    loginWithGoogle: async (_: any, { code }: { code: string }, { prisma }: Context) => {
      // TODO: Implement Google OAuth flow
      throw new Error('Google OAuth not implemented yet');
    },

    loginWithGitHub: async (_: any, { code }: { code: string }, { prisma }: Context) => {
      // TODO: Implement GitHub OAuth flow
      throw new Error('GitHub OAuth not implemented yet');
    },
  },
};
