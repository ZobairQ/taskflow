/**
 * Base Repository
 * Abstract base class for all repositories with common CRUD operations
 */

import { PrismaClient } from '@prisma/client';

export abstract class BaseRepository<T> {
  constructor(protected prisma: PrismaClient) {}

  /**
   * Get the Prisma model delegate for this repository
   */
  protected abstract get model(): {
    findUnique: (args: { where: { id: string } }) => Promise<T | null>;
    findFirst: (args: any) => Promise<T | null>;
    findMany: (args?: any) => Promise<T[]>;
    create: (args: { data: any }) => Promise<T>;
    update: (args: { where: { id: string }; data: any }) => Promise<T>;
    delete: (args: { where: { id: string } }) => Promise<T>;
    updateMany: (args: any) => Promise<{ count: number }>;
    deleteMany: (args: any) => Promise<{ count: number }>;
    count: (args?: any) => Promise<number>;
  };
}
