/**
 * Project Service
 * Business logic layer for project operations
 */

import { PrismaClient, Project } from '@prisma/client';
import { ProjectRepository, ProjectFilter } from '../repositories/project.repository';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator';
import { UserInputError } from '../utils/errors';
import { createLogger } from '../utils/logger';

const logger = createLogger('ProjectService');

export class ProjectService {
  private projectRepo: ProjectRepository;

  constructor(prisma: PrismaClient) {
    this.projectRepo = new ProjectRepository(prisma);
  }

  /**
   * Get all projects for a user
   */
  async getProjects(userId: string, filter?: ProjectFilter): Promise<Project[]> {
    logger.debug('Getting projects', { userId });
    return this.projectRepo.findByUser(userId, filter);
  }

  /**
   * Get a single project by ID
   */
  async getProject(
    userId: string,
    projectId: string
  ): Promise<{
    project: Project;
    taskCount: number;
    completedCount: number;
  } | null> {
    logger.debug('Getting project', { userId, projectId });
    return this.projectRepo.findByIdWithStats(projectId, userId);
  }

  /**
   * Create a new project
   */
  async createProject(userId: string, input: unknown): Promise<Project> {
    const validated = createProjectSchema.parse(input);
    logger.info('Creating project', { userId, name: validated.name });

    const project = await this.projectRepo.create({
      name: validated.name,
      description: validated.description,
      color: validated.color,
      userId,
    });

    logger.info('Project created', { projectId: project.id, userId });

    return project;
  }

  /**
   * Update a project
   */
  async updateProject(userId: string, input: unknown): Promise<Project> {
    const validated = updateProjectSchema.parse(input);
    const { id, ...updates } = validated;

    logger.info('Updating project', { userId, projectId: id });

    const existingProject = await this.projectRepo.findById(id, userId);
    if (!existingProject) {
      throw new UserInputError('Project not found');
    }

    const updateData: {
      name?: string;
      description?: string;
      color?: string;
    } = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined)
      updateData.description = updates.description ?? undefined;
    if (updates.color !== undefined) updateData.color = updates.color ?? undefined;

    const project = await this.projectRepo.update(id, updateData);
    logger.info('Project updated', { projectId: id, userId });

    return project;
  }

  /**
   * Delete a project and all its tasks
   */
  async deleteProject(userId: string, projectId: string): Promise<Project> {
    logger.info('Deleting project', { userId, projectId });

    const project = await this.projectRepo.findById(projectId, userId);
    if (!project) {
      throw new UserInputError('Project not found');
    }

    const deletedProject = await this.projectRepo.deleteWithTasks(projectId, userId);
    logger.info('Project deleted', { projectId, userId });

    return deletedProject;
  }

  /**
   * Get project statistics
   */
  async getProjectStats(userId: string): Promise<{
    total: number;
    active: number;
  }> {
    const total = await this.projectRepo.countByUser(userId);

    return {
      total,
      active: total,
    };
  }
}
