/**
 * TemplateContext - State management for task templates with Apollo integration
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { TaskTemplate, TemplateCategory } from '../types/template.types';
import { Task } from '../types/task.types';
import { BUILT_IN_TEMPLATES, CATEGORY_CONFIG } from '../constants/templates';
import {
  createTemplateFromTask,
  filterTemplates,
  sortTemplatesByUsage,
} from '../utils/templateUtils';
import { GET_TEMPLATES, GET_MOST_USED_TEMPLATES } from '../graphql/queries';
import { CREATE_TEMPLATE, UPDATE_TEMPLATE, DELETE_TEMPLATE, USE_TEMPLATE } from '../graphql/mutations';
import { isAuthenticated } from '../lib/apollo';

// Storage key for custom templates (fallback when not authenticated)
const STORAGE_KEY = 'taskflow_custom_templates';
const USAGE_KEY = 'taskflow_template_usage';

interface TemplateContextType {
  // All templates (built-in + custom)
  templates: TaskTemplate[];
  // Custom templates only
  customTemplates: TaskTemplate[];
  // Built-in templates only
  builtInTemplates: TaskTemplate[];
  // Categories with templates
  categories: { category: TemplateCategory; count: number }[];

  // Actions
  addTemplate: (template: Omit<TaskTemplate, 'id' | 'createdAt' | 'usageCount' | 'isBuiltIn'>) => Promise<TaskTemplate>;
  createFromTask: (task: Task, name: string, description: string, category?: TemplateCategory, icon?: string) => Promise<TaskTemplate>;
  updateTemplate: (id: string, updates: Partial<TaskTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  incrementUsage: (id: string) => void;
  getTemplate: (id: string) => TaskTemplate | undefined;

  // Filtering
  filterByCategory: (category?: TemplateCategory) => TaskTemplate[];
  searchTemplates: (query: string) => TaskTemplate[];
  getMostUsed: (limit?: number) => TaskTemplate[];
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

// Type for GraphQL query results
interface TemplatesQueryResult {
  templates: Array<{
    id: string;
    name: string;
    description?: string;
    category: string;
    icon?: string;
    isBuiltIn: boolean;
    createdAt: string;
    usageCount: number;
  }>;
}

interface MostUsedTemplatesQueryResult {
  mostUsedTemplates: Array<{
    id: string;
    name: string;
    description?: string;
    category: string;
    icon?: string;
    isBuiltIn?: boolean;
    usageCount: number;
  }>;
}

// Types for GraphQL mutations
interface CreateTemplateResult {
  createTemplate: {
    id: string;
    createdAt: string;
  };
}

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  // Local state for custom templates (fallback when not authenticated)
  const [localCustomTemplates, setLocalCustomTemplates] = useState<TaskTemplate[]>([]);
  const [usageStats, setUsageStats] = useState<Record<string, number>>({});

  // Apollo queries (only when authenticated)
  const { data: templatesData, refetch: refetchTemplates } = useQuery<TemplatesQueryResult>(GET_TEMPLATES, {
    skip: !isAuthenticated(),
    fetchPolicy: 'cache-and-network',
  });

  const { data: mostUsedData } = useQuery<MostUsedTemplatesQueryResult>(GET_MOST_USED_TEMPLATES, {
    skip: !isAuthenticated(),
    variables: { limit: 10 },
  });

  // Apollo mutations
  const [createTemplateMutation] = useMutation<CreateTemplateResult>(CREATE_TEMPLATE, {
    refetchQueries: [{ query: GET_TEMPLATES }, { query: GET_MOST_USED_TEMPLATES }],
  });

  const [updateTemplateMutation] = useMutation(UPDATE_TEMPLATE, {
    refetchQueries: [{ query: GET_TEMPLATES }],
  });

  const [deleteTemplateMutation] = useMutation(DELETE_TEMPLATE, {
    refetchQueries: [{ query: GET_TEMPLATES }, { query: GET_MOST_USED_TEMPLATES }],
  });

  const [useTemplateMutation] = useMutation(USE_TEMPLATE, {
    refetchQueries: [{ query: GET_TEMPLATES }, { query: GET_MOST_USED_TEMPLATES }],
  });

  // Load local templates from localStorage (fallback)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLocalCustomTemplates(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load templates:', e);
    }

    try {
      const usageStored = localStorage.getItem(USAGE_KEY);
      if (usageStored) {
        setUsageStats(JSON.parse(usageStored));
      }
    } catch (e) {
      console.error('Failed to load usage stats:', e);
    }
  }, []);

  // Save local templates to localStorage
  useEffect(() => {
    if (!isAuthenticated()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localCustomTemplates));
    }
  }, [localCustomTemplates]);

  // Save usage stats to localStorage
  useEffect(() => {
    localStorage.setItem(USAGE_KEY, JSON.stringify(usageStats));
  }, [usageStats]);

  // Transform Apollo template data to local format
  const serverTemplates: TaskTemplate[] = useMemo(() => {
    if (!templatesData?.templates) return [];

    return templatesData.templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description || '',
      category: t.category as TemplateCategory,
      icon: t.icon || '⭐',
      isBuiltIn: t.isBuiltIn,
      createdAt: new Date(t.createdAt).getTime(),
      usageCount: t.usageCount || 0,
      // Required template field
      template: {
        text: t.name,
        description: t.description,
        priority: 'medium' as const,
        category: t.category,
        subtasks: [],
      },
    }));
  }, [templatesData]);

  // Determine which custom templates to use
  const customTemplates = useMemo(() => {
    if (isAuthenticated() && serverTemplates.length > 0) {
      // Use server templates, filtering out built-in ones
      return serverTemplates.filter(t => !t.isBuiltIn);
    }
    // Fallback to local templates
    return localCustomTemplates;
  }, [serverTemplates, localCustomTemplates]);

  // Combine built-in and custom templates
  const templates = useMemo(() => {
    // When authenticated, server provides all templates
    if (isAuthenticated() && serverTemplates.length > 0) {
      return serverTemplates.map(t => ({
        ...t,
        usageCount: usageStats[t.id] || t.usageCount || 0,
      }));
    }

    // Otherwise, combine built-in with local custom
    const all = [...BUILT_IN_TEMPLATES, ...localCustomTemplates];
    return all.map(t => ({
      ...t,
      usageCount: usageStats[t.id] || t.usageCount || 0,
    }));
  }, [serverTemplates, localCustomTemplates, usageStats]);

  // Get categories with template counts
  const categories = useMemo(() => {
    const counts: Record<TemplateCategory, number> = {
      work: 0,
      personal: 0,
      health: 0,
      finance: 0,
      learning: 0,
      custom: 0,
    };

    templates.forEach(t => {
      counts[t.category]++;
    });

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => ({
        category: category as TemplateCategory,
        count,
      }));
  }, [templates]);

  // Add a new custom template
  const addTemplate = useCallback(async (
    templateData: Omit<TaskTemplate, 'id' | 'createdAt' | 'usageCount' | 'isBuiltIn'>
  ): Promise<TaskTemplate> => {
    const newTemplate: TaskTemplate = {
      ...templateData,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isBuiltIn: false,
      createdAt: Date.now(),
      usageCount: 0,
    };

    if (isAuthenticated()) {
      try {
        const result = await createTemplateMutation({
          variables: {
            input: {
              name: templateData.name,
              description: templateData.description,
              category: templateData.category,
              icon: templateData.icon,
              defaultPriority: templateData.template?.priority || 'medium',
              defaultCategory: templateData.template?.category || templateData.category,
              subtaskTemplates: templateData.template?.subtasks?.map(s => ({
                text: s.text,
              })),
            },
          },
        });
        if (result.data?.createTemplate) {
          return {
            ...newTemplate,
            id: result.data.createTemplate.id,
            createdAt: new Date(result.data.createTemplate.createdAt).getTime(),
          };
        }
      } catch (error) {
        console.error('Failed to create template on server:', error);
      }
    }

    // Fallback to local storage
    setLocalCustomTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  }, [createTemplateMutation]);

  // Create template from an existing task
  const createFromTask = useCallback(async (
    task: Task,
    name: string,
    description: string,
    category: TemplateCategory = 'custom',
    icon: string = '⭐'
  ): Promise<TaskTemplate> => {
    const newTemplate = createTemplateFromTask(task, name, description, category, icon);

    if (isAuthenticated()) {
      try {
        const result = await createTemplateMutation({
          variables: {
            input: {
              name: newTemplate.name,
              description: newTemplate.description,
              category: newTemplate.category,
              icon: newTemplate.icon,
              defaultPriority: newTemplate.template?.priority || 'medium',
              defaultCategory: newTemplate.template?.category || newTemplate.category,
              subtaskTemplates: newTemplate.template?.subtasks?.map(s => ({
                text: s.text,
              })),
            },
          },
        });
        if (result.data?.createTemplate) {
          return {
            ...newTemplate,
            id: result.data.createTemplate.id,
            createdAt: new Date(result.data.createTemplate.createdAt).getTime(),
          };
        }
      } catch (error) {
        console.error('Failed to create template on server:', error);
      }
    }

    // Fallback to local storage
    setLocalCustomTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  }, [createTemplateMutation]);

  // Update a custom template
  const updateTemplate = useCallback(async (id: string, updates: Partial<TaskTemplate>) => {
    if (isAuthenticated() && !id.startsWith('custom-')) {
      try {
        await updateTemplateMutation({
          variables: {
            id,
            input: {
              name: updates.name,
              description: updates.description,
              category: updates.category,
              icon: updates.icon,
              defaultPriority: updates.template?.priority,
              defaultCategory: updates.template?.category,
              subtaskTemplates: updates.template?.subtasks?.map(s => ({
                text: s.text,
              })),
            },
          },
        });
        return;
      } catch (error) {
        console.error('Failed to update template on server:', error);
      }
    }

    // Fallback to local
    setLocalCustomTemplates(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  }, [updateTemplateMutation]);

  // Delete a custom template
  const deleteTemplate = useCallback(async (id: string) => {
    // Don't allow deleting built-in templates
    if (id.startsWith('builtin-')) return;

    if (isAuthenticated() && !id.startsWith('custom-')) {
      try {
        await deleteTemplateMutation({
          variables: { id },
        });
        return;
      } catch (error) {
        console.error('Failed to delete template on server:', error);
      }
    }

    // Fallback to local
    setLocalCustomTemplates(prev => prev.filter(t => t.id !== id));
  }, [deleteTemplateMutation]);

  // Increment usage count for a template
  const incrementUsage = useCallback(async (id: string) => {
    // Update local usage stats
    setUsageStats(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));

    // Note: Usage is tracked on the server when USE_TEMPLATE mutation is called
  }, []);

  // Get a single template by ID
  const getTemplate = useCallback((id: string): TaskTemplate | undefined => {
    return templates.find(t => t.id === id);
  }, [templates]);

  // Filter templates by category
  const filterByCategory = useCallback((category?: TemplateCategory): TaskTemplate[] => {
    if (!category) return templates;
    return filterTemplates(templates, { category });
  }, [templates]);

  // Search templates
  const searchTemplates = useCallback((query: string): TaskTemplate[] => {
    return filterTemplates(templates, { searchQuery: query });
  }, [templates]);

  // Get most used templates
  const getMostUsed = useCallback((limit: number = 5): TaskTemplate[] => {
    // Use server data if available
    if (isAuthenticated() && mostUsedData?.mostUsedTemplates) {
      return mostUsedData.mostUsedTemplates.slice(0, limit).map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description || '',
        category: t.category as TemplateCategory,
        icon: t.icon || '⭐',
        isBuiltIn: t.isBuiltIn || false,
        createdAt: 0,
        usageCount: t.usageCount || 0,
        template: {
          text: t.name,
          description: t.description,
          priority: 'medium' as const,
          category: t.category,
          subtasks: [],
        },
      }));
    }
    return sortTemplatesByUsage(templates).slice(0, limit);
  }, [templates, mostUsedData]);

  const value: TemplateContextType = {
    templates,
    customTemplates,
    builtInTemplates: BUILT_IN_TEMPLATES,
    categories,
    addTemplate,
    createFromTask,
    updateTemplate,
    deleteTemplate,
    incrementUsage,
    getTemplate,
    filterByCategory,
    searchTemplates,
    getMostUsed,
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplates() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplates must be used within a TemplateProvider');
  }
  return context;
}

// Export category config for use in components
export { CATEGORY_CONFIG };
