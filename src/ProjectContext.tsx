import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Project, Task, ProjectContextValue, ProjectStats } from './types';
import { PROJECT_COLORS } from './constants/colors';

// Re-export types for backward compatibility
export type { Project, Task, Task as TodoData, ProjectContextValue, ProjectStats };


const INITIAL_PROJECTS: Project[] = [
  {
    id: 'default',
    name: 'Personal',
    description: 'Your personal tasks and goals',
    color: PROJECT_COLORS[0],
    createdAt: Date.now(),
    todos: [],
    completedTodos: 0,
    totalTodos: 0,
  },
];

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('projects');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed;
        } catch (e) {
          console.error('Failed to load projects:', e);
        }
      }
    }
    return INITIAL_PROJECTS;
  });

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const createProject = (name: string, description: string) => {
    const newProject: Project = {
      id: `project_${Date.now()}`,
      name,
      description,
      color: PROJECT_COLORS[projects.length % PROJECT_COLORS.length],
      createdAt: Date.now(),
      todos: [],
      completedTodos: 0,
      totalTodos: 0,
    };
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  };

  const deleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  const updateProjectStats = (projectId: string, completed: boolean) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        const completedTodos = project.todos.filter((t) => t.completed).length;
        return {
          ...project,
          completedTodos,
          totalTodos: project.todos.length,
        };
      })
    );
  };

  const addTodoToProject = (projectId: string, todo: Task) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        return {
          ...project,
          todos: [todo, ...project.todos],
          totalTodos: project.totalTodos + 1,
        };
      })
    );
  };

  const updateTodoInProject = (projectId: string, updatedTodo: Task) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        const newTodos = project.todos.map((t) =>
          t.id === updatedTodo.id ? updatedTodo : t
        );

        const completedTodos = newTodos.filter((t) => t.completed).length;
        return {
          ...project,
          todos: newTodos,
          completedTodos,
          totalTodos: newTodos.length,
        };
      })
    );
  };

  const deleteTodoFromProject = (projectId: string, todoId: number) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        const newTodos = project.todos.filter((t) => t.id !== todoId);
        const completedTodos = newTodos.filter((t) => t.completed).length;
        return {
          ...project,
          todos: newTodos,
          completedTodos,
          totalTodos: newTodos.length,
        };
      })
    );
  };

  const getProject = (projectId: string) => {
    return projects.find((p) => p.id === projectId);
  };

  const getTotalStats = (): ProjectStats => {
    const totalProjects = projects.length;
    const totalTodos = projects.reduce((acc, p) => acc + p.totalTodos, 0);
    const totalCompleted = projects.reduce((acc, p) => acc + p.completedTodos, 0);
    const totalActive = totalTodos - totalCompleted;

    return { totalProjects, totalTodos, totalCompleted, totalActive };
  };

  const contextValue: ProjectContextValue = {
    projects,
    createProject,
    deleteProject,
    addTodoToProject,
    updateTodoInProject,
    deleteTodoFromProject,
    updateProjectStats,
    getProject,
    getTotalStats,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjects must be used within ProjectProvider');
  return context;
}
