/**
 * Auth Resolvers
 * GraphQL resolvers for authentication operations using AuthService
 */

import { Context, prisma } from '../types/context';
import { AuthService } from '../services/auth.service';
import { AuthenticationError } from '../utils/errors';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies';

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
    register: async (_: any, { input }: { input: any }, { res }: Context) => {
      const result = await authService.register(input);

      // Set cookies if response object is available
      if (res) {
        setAuthCookies(res, result.token, result.refreshToken);
      }

      return result;
    },

    login: async (_: any, { input }: { input: any }, { res }: Context) => {
      const result = await authService.login(input);

      // Set cookies if response object is available
      if (res) {
        setAuthCookies(res, result.token, result.refreshToken);
      }

      return result;
    },

    refreshToken: async (_: any, { token }: { token: string }, { res, refreshToken }: Context) => {
      // Use provided token or fall back to cookie
      const tokenToUse = token || refreshToken;

      if (!tokenToUse) {
        throw new AuthenticationError('No refresh token provided');
      }

      const result = await authService.refreshToken(tokenToUse);

      // Set new cookies if response object is available
      if (res) {
        setAuthCookies(res, result.token, result.refreshToken);
      }

      return result;
    },

    logout: async (_: any, __: any, { res }: Context) => {
      // Clear cookies if response object is available
      if (res) {
        clearAuthCookies(res);
      }

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
