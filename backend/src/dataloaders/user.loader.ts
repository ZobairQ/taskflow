/**
 * User DataLoader
 * Batches and caches user queries to prevent N+1 problems
 */

import DataLoader from 'dataloader';
import { PrismaClient, User } from '@prisma/client';

/**
 * Create a DataLoader for loading users by ID
 */
export const createUserLoader = (prisma: PrismaClient) => {
  return new DataLoader<string, User | null>(async (ids) => {
    const users = await prisma.user.findMany({
      where: {
        id: { in: [...ids] },
      },
    });

    const userMap = new Map(users.map((user) => [user.id, user]));

    // Return in same order as input ids
    return ids.map((id) => userMap.get(id) || null);
  });
};
