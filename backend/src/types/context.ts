import { PrismaClient } from '@prisma/client';
import { User } from '@prisma/client';

export interface Context {
  prisma: PrismaClient;
  user: User | null;
  userId: string | null;
}

export const prisma = new PrismaClient();

export const createContext = async ({ req }: { req: any }): Promise<Context> => {
  // Get the user token from the headers
  const token = req.headers.authorization?.replace('Bearer ', '') || null;

  let user: User | null = null;
  let userId: string | null = null;

  if (token) {
    try {
      // Verify JWT token and get user
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      userId = decoded.userId;
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
    } catch (error) {
      // Token is invalid or expired
      console.error('Auth error:', error);
    }
  }

  return {
    prisma,
    user,
    userId,
  };
};
