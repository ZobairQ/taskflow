/**
 * TemplateContext - State management for task templates
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { TaskTemplate, TemplateCategory } from '../types/template.types';
import { Task } from '../types/task.types';
import { BUILT_IN_TEMPLATES, CATEGORY_CONFIG } from '../constants/templates';
import {
  createTemplateFromTask,
  filterTemplates,
  sortTemplatesByUsage,
} from '../utils/templateUtils';

// Storage key for custom templates
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
  addTemplate: (template: Omit<TaskTemplate, 'id' | 'createdAt' | 'usageCount' | 'isBuiltIn'>) => TaskTemplate;
  createFromTask: (task: Task, name: string, description: string, category?: TemplateCategory, icon?: string) => TaskTemplate;
  updateTemplate: (id: string, updates: Partial<TaskTemplate>) => void;
  deleteTemplate: (id: string) => void;
  incrementUsage: (id: string) => void;
  getTemplate: (id: string) => TaskTemplate | undefined;

  // Filtering
  filterByCategory: (category?: TemplateCategory) => TaskTemplate[];
  searchTemplates: (query: string) => TaskTemplate[];
  getMostUsed: (limit?: number) => TaskTemplate[];
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  const [customTemplates, setCustomTemplates] = useState<TaskTemplate[]>([]);
  const [usageStats, setUsageStats] = useState<Record<string, number>>({});

  // Load custom templates from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCustomTemplates(JSON.parse(stored));
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

  // Save custom templates to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customTemplates));
  }, [customTemplates]);

  // Save usage stats to localStorage
  useEffect(() => {
    localStorage.setItem(USAGE_KEY, JSON.stringify(usageStats));
  }, [usageStats]);

  // Combine built-in and custom templates
  const templates = useMemo(() => {
    const all = [...BUILT_IN_TEMPLATES, ...customTemplates];
    // Apply usage counts
    return all.map(t => ({
      ...t,
      usageCount: usageStats[t.id] || t.usageCount || 0,
    }));
  }, [customTemplates, usageStats]);

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
  const addTemplate = useCallback((
    templateData: Omit<TaskTemplate, 'id' | 'createdAt' | 'usageCount' | 'isBuiltIn'>
  ): TaskTemplate => {
    const newTemplate: TaskTemplate = {
      ...templateData,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isBuiltIn: false,
      createdAt: Date.now(),
      usageCount: 0,
    };

    setCustomTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  }, []);

  // Create template from an existing task
  const createFromTask = useCallback((
    task: Task,
    name: string,
    description: string,
    category: TemplateCategory = 'custom',
    icon: string = '⭐'
  ): TaskTemplate => {
    const newTemplate = createTemplateFromTask(task, name, description, category, icon);
    setCustomTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  }, []);

  // Update a custom template
  const updateTemplate = useCallback((id: string, updates: Partial<TaskTemplate>) => {
    setCustomTemplates(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  // Delete a custom template
  const deleteTemplate = useCallback((id: string) => {
    // Don't allow deleting built-in templates
    if (id.startsWith('custom-')) {
      setCustomTemplates(prev => prev.filter(t => t.id !== id));
    }
  }, []);

  // Increment usage count for a template
  const incrementUsage = useCallback((id: string) => {
    setUsageStats(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
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
    return sortTemplatesByUsage(templates).slice(0, limit);
  }, [templates]);

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
