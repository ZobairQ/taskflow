/**
 * DataLoaders Module
 * Creates and exports DataLoaders for batching database queries
 */

import { PrismaClient } from '@prisma/client';
import { createTaskLoader, createTasksByProjectLoader } from './task.loader';
import { createUserLoader } from './user.loader';

export interface DataLoaders {
  taskLoader: ReturnType<typeof createTaskLoader>;
  tasksByProjectLoader: ReturnType<typeof createTasksByProjectLoader>;
  userLoader: ReturnType<typeof createUserLoader>;
}

/**
 * Create all DataLoaders for a request
 */
export const createDataLoaders = (prisma: PrismaClient): DataLoaders => ({
  taskLoader: createTaskLoader(prisma),
  tasksByProjectLoader: createTasksByProjectLoader(prisma),
  userLoader: createUserLoader(prisma),
});

export * from './task.loader';
export * from './user.loader';
