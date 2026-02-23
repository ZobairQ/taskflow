/**
 * User Repository
 * Data access layer for User entities
 */

import { PrismaClient, User } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository<User> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  protected get model() {
    return this.prisma.user;
  }

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Check if a user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.toLowerCase() },
    });
    return count > 0;
  }

  /**
   * Create a new user
   */
  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
    avatar?: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        name: data.name,
        avatar: data.avatar,
      },
    });
  }

  /**
   * Update a user
   */
  async update(id: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: data as any,
    });
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Update password
   */
  async updatePassword(id: string, passwordHash: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  /**
   * Delete a user and all related data
   */
  async deleteWithRelations(id: string): Promise<User> {
    // Delete in transaction to ensure consistency
    return this.prisma.$transaction(async (tx) => {
      // Delete related data
      await tx.task.deleteMany({ where: { userId: id } });
      await tx.project.deleteMany({ where: { userId: id } });
      await tx.gamificationProfile.deleteMany({ where: { userId: id } });
      await tx.pomodoroSession.deleteMany({ where: { userId: id } });
      await tx.template.deleteMany({ where: { userId: id } });
      await tx.dailyAnalytics.deleteMany({ where: { userId: id } });

      // Delete user
      return tx.user.delete({ where: { id } });
    });
  }

  /**
   * Get user with gamification profile
   */
  async findByIdWithGamification(id: string): Promise<{
    user: User;
    gameProfile: any | null;
  } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { gameProfile: true },
    });

    if (!user) return null;

    const { gameProfile, ...userData } = user;
    return { user: userData as User, gameProfile };
  }
}
