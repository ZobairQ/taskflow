/**
 * Project Repository
 * Data access layer for Project entities
 */

import { PrismaClient, Project } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface ProjectFilter {
  search?: string;
}

export class ProjectRepository extends BaseRepository<Project> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  protected get model() {
    return this.prisma.project;
  }

  /**
   * Find a project by ID for a specific user
   */
  async findById(id: string, userId: string): Promise<Project | null> {
    return this.prisma.project.findFirst({
      where: { id, userId },
    });
  }

  /**
   * Find a project by ID with task count
   */
  async findByIdWithStats(
    id: string,
    userId: string
  ): Promise<{
    project: Project;
    taskCount: number;
    completedCount: number;
  } | null> {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
    });

    if (!project) return null;

    const [taskCount, completedCount] = await Promise.all([
      this.prisma.task.count({ where: { projectId: id, userId } }),
      this.prisma.task.count({ where: { projectId: id, userId, completed: true } }),
    ]);

    return { project, taskCount, completedCount };
  }

  /**
   * Find all projects for a user
   */
  async findByUser(userId: string, filter?: ProjectFilter): Promise<Project[]> {
    const where: any = { userId };

    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create a new project
   */
  async create(data: {
    name: string;
    description?: string;
    color?: string;
    userId: string;
  }): Promise<Project> {
    return this.prisma.project.create({
      data: {
        name: data.name,
        description: data.description || '',
        color: data.color || '#6366f1',
        userId: data.userId,
      },
    });
  }

  /**
   * Update a project
   */
  async update(id: string, data: Partial<Project>): Promise<Project> {
    return this.prisma.project.update({
      where: { id },
      data: data as any,
    });
  }

  /**
   * Delete a project and all its tasks
   */
  async deleteWithTasks(id: string, userId: string): Promise<Project> {
    // First delete all tasks in the project
    await this.prisma.task.deleteMany({
      where: { projectId: id, userId },
    });

    // Then delete the project
    return this.prisma.project.delete({
      where: { id },
    });
  }

  /**
   * Count projects for a user
   */
  async countByUser(userId: string): Promise<number> {
    return this.prisma.project.count({
      where: { userId },
    });
  }

  /**
   * Check if a project exists and belongs to a user
   */
  async exists(id: string, userId: string): Promise<boolean> {
    const count = await this.prisma.project.count({
      where: { id, userId },
    });
    return count > 0;
  }
}
