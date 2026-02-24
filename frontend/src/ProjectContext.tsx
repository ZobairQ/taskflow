import React, { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_PROJECTS, GET_PROJECT, GET_PROJECT_STATS } from './graphql/queries';
import {
  CREATE_PROJECT,
  UPDATE_PROJECT,
  DELETE_PROJECT,
  CREATE_TASK,
  UPDATE_TASK,
  DELETE_TASK,
  COMPLETE_TASK,
} from './graphql/mutations';
import { PROJECT_COLORS } from './constants/colors';
import type { Task, Subtask } from './types';

// Types
export { Task, Subtask };

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  completedTodos: number;
  totalTodos: number;
  todos?: Task[];
}

export interface ProjectStats {
  totalProjects: number;
  totalTodos: number;
  totalCompleted: number;
  totalActive: number;
}

export interface ProjectContextValue {
  projects: Project[];
  loading: boolean;
  error?: Error;
  createProject: (name: string, description: string) => Promise<Project | undefined>;
  deleteProject: (projectId: string) => Promise<void>;
  addTodoToProject: (
    projectId: string,
    todo: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Task | undefined>;
  updateTodoInProject: (projectId: string, updatedTodo: Task) => Promise<Task | undefined>;
  deleteTodoFromProject: (projectId: string, todoId: string) => Promise<void>;
  updateProjectStats: (projectId: string, completed: boolean) => void;
  getProject: (projectId: string) => Project | undefined;
  getTotalStats: () => ProjectStats;
  refetchProjects: () => void;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

// GraphQL query result types
interface ProjectsQueryResult {
  projects: Array<{
    id: string;
    name: string;
    description: string;
    color: string;
    createdAt: string;
    updatedAt: string;
    completedTodos: number;
    totalTodos: number;
    todos?: Array<{
      id: string;
      text: string;
      description: string;
      completed: boolean;
      status: string;
      priority: string;
      category: string;
      dueDate?: string;
      createdAt: string;
      updatedAt: string;
      completedAt?: string;
      startedAt?: string;
      isRecurring: boolean;
      canStart: boolean;
      subtasks?: Array<{
        id: string;
        text: string;
        completed: boolean;
        createdAt: string;
      }>;
      project?: {
        id: string;
        name: string;
        color: string;
      };
    }>;
  }>;
}

interface ProjectStatsQueryResult {
  projectStats: {
    totalProjects: number;
    totalTodos: number;
    totalCompleted: number;
    totalActive: number;
  };
}

// Helper to transform GraphQL data to local types
const transformProjectsData = (data: ProjectsQueryResult['projects'] | undefined): Project[] => {
  if (!data) return [];
  return data.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    color: p.color,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    completedTodos: p.completedTodos,
    totalTodos: p.totalTodos,
    todos: p.todos?.map((t) => ({
      ...t,
      status: t.status as Task['status'],
      priority: t.priority as Task['priority'],
    })),
  }));
};

export function ProjectProvider({ children }: { children: ReactNode }) {
  // Queries
  const {
    data: projectsData,
    loading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useQuery<ProjectsQueryResult>(GET_PROJECTS, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: statsData } = useQuery<ProjectStatsQueryResult>(GET_PROJECT_STATS);

  // Mutation result types
  interface CreateProjectResult {
    createProject: Project;
  }

  interface CreateTaskResult {
    createTask: Task;
  }

  interface UpdateTaskResult {
    updateTask: Task;
  }

  // Mutations
  const [createProjectMutation] = useMutation<CreateProjectResult>(CREATE_PROJECT, {
    refetchQueries: [{ query: GET_PROJECTS }, { query: GET_PROJECT_STATS }],
  });

  const [deleteProjectMutation] = useMutation(DELETE_PROJECT, {
    refetchQueries: [{ query: GET_PROJECTS }, { query: GET_PROJECT_STATS }],
  });

  const [createTaskMutation] = useMutation<CreateTaskResult>(CREATE_TASK, {
    refetchQueries: [{ query: GET_PROJECTS }],
  });

  const [updateTaskMutation] = useMutation<UpdateTaskResult>(UPDATE_TASK, {
    refetchQueries: [{ query: GET_PROJECTS }],
  });

  const [deleteTaskMutation] = useMutation(DELETE_TASK, {
    refetchQueries: [{ query: GET_PROJECTS }, { query: GET_PROJECT_STATS }],
  });

  const [completeTaskMutation] = useMutation(COMPLETE_TASK, {
    refetchQueries: [{ query: GET_PROJECTS }, { query: GET_PROJECT_STATS }],
  });

  // Get projects from query data
  const projects: Project[] = transformProjectsData(projectsData?.projects);

  // Create project
  const createProject = useCallback(
    async (name: string, description: string): Promise<Project | undefined> => {
      const color = PROJECT_COLORS[(projects?.length ?? 0) % PROJECT_COLORS.length];
      try {
        const result = await createProjectMutation({
          variables: {
            input: {
              name,
              description,
              color,
            },
          },
        });
        return result.data?.createProject ?? undefined;
      } catch (error) {
        console.error('Failed to create project:', error);
        return undefined;
      }
    },
    [createProjectMutation, projects?.length]
  );

  // Delete project
  const deleteProject = useCallback(
    async (projectId: string): Promise<void> => {
      try {
        await deleteProjectMutation({
          variables: { id: projectId },
        });
      } catch (error) {
        console.error('Failed to delete project:', error);
        throw error;
      }
    },
    [deleteProjectMutation]
  );

  // Add todo to project
  const addTodoToProject = useCallback(
    async (
      projectId: string,
      todo: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Task | undefined> => {
      try {
        const result = await createTaskMutation({
          variables: {
            input: {
              text: todo.text,
              description: todo.description || '',
              priority: todo.priority || 'medium',
              category: todo.category || 'general',
              dueDate: todo.dueDate,
              projectId,
              subtasks: todo.subtasks?.map((s) => ({
                id: s.id,
                text: s.text,
                completed: s.completed,
              })),
            },
          },
        });
        return result.data?.createTask ?? undefined;
      } catch (error) {
        console.error('Failed to create task:', error);
        return undefined;
      }
    },
    [createTaskMutation]
  );

  // Update todo in project
  const updateTodoInProject = useCallback(
    async (_projectId: string, updatedTodo: Task): Promise<Task | undefined> => {
      try {
        const result = await updateTaskMutation({
          variables: {
            input: {
              id: updatedTodo.id,
              text: updatedTodo.text,
              description: updatedTodo.description,
              status: updatedTodo.status,
              priority: updatedTodo.priority,
              category: updatedTodo.category,
              dueDate: updatedTodo.dueDate,
              subtasks: updatedTodo.subtasks?.map((s) => ({
                id: s.id,
                text: s.text,
                completed: s.completed,
              })),
            },
          },
        });
        return result.data?.updateTask ?? undefined;
      } catch (error) {
        console.error('Failed to update task:', error);
        return undefined;
      }
    },
    [updateTaskMutation]
  );

  // Delete todo from project
  const deleteTodoFromProject = useCallback(
    async (_projectId: string, todoId: string): Promise<void> => {
      try {
        await deleteTaskMutation({
          variables: { id: todoId },
        });
      } catch (error) {
        console.error('Failed to delete task:', error);
        throw error;
      }
    },
    [deleteTaskMutation]
  );

  // Complete todo
  const completeTodo = useCallback(
    async (_projectId: string, todoId: string): Promise<void> => {
      try {
        await completeTaskMutation({
          variables: { id: todoId },
        });
      } catch (error) {
        console.error('Failed to complete task:', error);
        throw error;
      }
    },
    [completeTaskMutation]
  );

  // Update project stats (no-op with Apollo - stats come from server)
  const updateProjectStats = useCallback(() => {
    // Stats are automatically updated via refetchQueries
  }, []);

  // Get single project
  const getProject = useCallback(
    (projectId: string): Project | undefined => {
      return projects.find((p): p is Project => p?.id === projectId);
    },
    [projects]
  );

  // Get total stats
  const getTotalStats = useCallback((): ProjectStats => {
    if (statsData?.projectStats) {
      return statsData.projectStats;
    }
    // Fallback to calculating from projects - handle null/undefined
    const safeProjects = projects ?? [];
    const totalProjects = safeProjects.length;
    const totalTodos = safeProjects.reduce((acc, p) => acc + (p?.totalTodos ?? 0), 0);
    const totalCompleted = safeProjects.reduce((acc, p) => acc + (p?.completedTodos ?? 0), 0);
    return {
      totalProjects,
      totalTodos,
      totalCompleted,
      totalActive: totalTodos - totalCompleted,
    };
  }, [projects, statsData]);

  const contextValue: ProjectContextValue = {
    projects,
    loading: projectsLoading,
    error: projectsError,
    createProject,
    deleteProject,
    addTodoToProject,
    updateTodoInProject,
    deleteTodoFromProject,
    updateProjectStats,
    getProject,
    getTotalStats,
    refetchProjects: () => refetchProjects(),
  };

  return <ProjectContext.Provider value={contextValue}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within ProjectProvider');
  }
  return context;
}

// Re-export types for backward compatibility
export type { Task as TodoData };
