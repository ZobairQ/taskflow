/**
 * Project-related type definitions
 */

import { Task } from './task.types';

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: number;
  todos: Task[];
  completedTodos: number;
  totalTodos: number;
}

export interface ProjectStats {
  totalProjects: number;
  totalTodos: number;
  totalCompleted: number;
  totalActive: number;
}

export interface ProjectContextValue {
  projects: Project[];
  createProject: (name: string, description: string) => Project;
  deleteProject: (projectId: string) => void;
  addTodoToProject: (projectId: string, todo: Task) => void;
  updateTodoInProject: (projectId: string, todo: Task) => void;
  deleteTodoFromProject: (projectId: string, todoId: number) => void;
  updateProjectStats: (projectId: string, completed: boolean) => void;
  getProject: (projectId: string) => Project | undefined;
  getTotalStats: () => ProjectStats;
}
