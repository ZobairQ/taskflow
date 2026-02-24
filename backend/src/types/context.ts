/**
 * GraphQL Context
 * Context object passed to all resolvers
 */

import { PrismaClient, User } from '@prisma/client';
import { Response } from 'express';
import { DataLoaders, createDataLoaders } from '../dataloaders';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../config';
import { AUTH_CONFIG } from '../config/constants';
import { getTokensFromRequest } from '../utils/cookies';
import jwt from 'jsonwebtoken';

export interface Context {
  prisma: PrismaClient;
  user: User | null;
  userId: string | null;
  loaders: DataLoaders;
  res: Response | null;
  refreshToken: string | null;
}

export const prisma = new PrismaClient();

interface JwtPayload {
  userId: string;
}

export const createContext = async ({
  req,
  res,
}: {
  req: any;
  res?: Response;
}): Promise<Context> => {
  // Get tokens from cookies or Authorization header
  const { accessToken, refreshToken } = getTokensFromRequest(req);

  let user: User | null = null;
  let userId: string | null = null;

  if (accessToken) {
    try {
      // Verify JWT token and get user
      const decoded = jwt.verify(accessToken, JWT_SECRET) as JwtPayload;
      userId = decoded.userId;
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
    } catch {
      // Token is invalid or expired - user remains null
      // Could attempt to refresh using refresh token here
    }
  }

  // Create fresh DataLoaders for each request
  const loaders = createDataLoaders(prisma);

  return {
    prisma,
    user,
    userId,
    loaders,
    res: res || null,
    refreshToken,
  };
};
