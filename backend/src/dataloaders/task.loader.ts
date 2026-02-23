/**
 * Task DataLoader
 * Batches and caches task queries to prevent N+1 problems
 */

import DataLoader from 'dataloader';
import { PrismaClient, Task } from '@prisma/client';

/**
 * Create a DataLoader for loading tasks by ID
 */
export const createTaskLoader = (prisma: PrismaClient) => {
  return new DataLoader<string, Task | null>(async (ids) => {
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: [...ids] },
      },
    });

    const taskMap = new Map(tasks.map((task) => [task.id, task]));

    // Return in same order as input ids
    return ids.map((id) => taskMap.get(id) || null);
  });
};

/**
 * Create a DataLoader for loading tasks by project ID
 */
export const createTasksByProjectLoader = (prisma: PrismaClient) => {
  return new DataLoader<string, Task[]>(async (projectIds) => {
    // Fetch all tasks for all projects in one query
    const tasks = await prisma.task.findMany({
      where: {
        projectId: { in: [...projectIds] },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by project ID
    const tasksByProject = new Map<string, Task[]>();
    for (const task of tasks) {
      const projectTasks = tasksByProject.get(task.projectId) || [];
      projectTasks.push(task);
      tasksByProject.set(task.projectId, projectTasks);
    }

    // Return in same order as input projectIds
    return projectIds.map((projectId) => tasksByProject.get(projectId) || []);
  });
};
