import { Context } from '../types/context';
import { AuthenticationError, UserInputError } from '../utils/errors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

const generateTokens = (userId: string) => {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { token, refreshToken };
};

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
      const { email, password, name } = input;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new UserInputError('User already exists with this email');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
        },
      });

      // Create gamification profile
      await prisma.gamificationProfile.create({
        data: {
          userId: user.id,
        },
      });

      const tokens = generateTokens(user.id);

      return {
        user,
        ...tokens,
      };
    },

    login: async (_: any, { input }: { input: any }, { prisma }: Context) => {
      const { email, password } = input;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.passwordHash) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.passwordHash);

      if (!validPassword) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const tokens = generateTokens(user.id);

      return {
        user,
        ...tokens,
      };
    },

    loginWithGoogle: async (_: any, { code }: { code: string }, { prisma }: Context) => {
      // TODO: Implement Google OAuth flow
      // 1. Exchange code for access token
      // 2. Fetch user profile from Google
      // 3. Create or update user
      // 4. Generate tokens

      throw new Error('Google OAuth not implemented yet');
    },

    loginWithGitHub: async (_: any, { code }: { code: string }, { prisma }: Context) => {
      // TODO: Implement GitHub OAuth flow
      // 1. Exchange code for access token
      // 2. Fetch user profile from GitHub
      // 3. Create or update user
      // 4. Generate tokens

      throw new Error('GitHub OAuth not implemented yet');
    },

    refreshToken: async (_: any, { token }: { token: string }, { prisma }: Context) => {
      try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
        });

        if (!user) {
          throw new AuthenticationError('Invalid refresh token');
        }

        const tokens = generateTokens(user.id);

        return {
          user,
          ...tokens,
        };
      } catch (error) {
        throw new AuthenticationError('Invalid refresh token');
      }
    },

    logout: async (_: any, __: any, { user }: Context) => {
      // In a production app, you might want to blacklist the token
      // For now, we just return true and let the client remove the token
      return true;
    },
  },
};
