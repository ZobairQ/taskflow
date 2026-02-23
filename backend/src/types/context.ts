/**
 * GraphQL Context
 * Context object passed to all resolvers
 */

import { PrismaClient, User } from '@prisma/client';
import { DataLoaders, createDataLoaders } from '../dataloaders';
import { JWT_SECRET } from '../config';
import jwt from 'jsonwebtoken';

export interface Context {
  prisma: PrismaClient;
  user: User | null;
  userId: string | null;
  loaders: DataLoaders;
}

export const prisma = new PrismaClient();

interface JwtPayload {
  userId: string;
}

export const createContext = async ({ req }: { req: any }): Promise<Context> => {
  // Get the user token from the headers
  const token = req.headers.authorization?.replace('Bearer ', '') || null;

  let user: User | null = null;
  let userId: string | null = null;

  if (token) {
    try {
      // Verify JWT token and get user
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      userId = decoded.userId;
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
    } catch (error) {
      // Token is invalid or expired - user remains null
    }
  }

  // Create fresh DataLoaders for each request
  const loaders = createDataLoaders(prisma);

  return {
    prisma,
    user,
    userId,
    loaders,
  };
};
