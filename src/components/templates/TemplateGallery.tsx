/**
 * TemplateGallery - Browse and select task templates
 */

import React, { useState, useMemo } from 'react';
import { useTheme } from '../../ThemeContext';
import { useTemplates, CATEGORY_CONFIG } from '../../contexts/TemplateContext';
import { TaskTemplate, TemplateCategory } from '../../types/template.types';
import { RecurrencePattern } from '../../types/recurrence.types';
import { interpolateVariables, validateVariables, getDefaultVariableValues } from '../../utils/templateUtils';

interface TemplateGalleryProps {
  onSelect: (taskData: Partial<{
    text: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    category: string;
    subtasks: { id: string; text: string; completed: boolean }[];
    recurrencePattern: RecurrencePattern;
    dueDate: string;
  }>) => void;
  onClose: () => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelect, onClose }) => {
  const { theme } = useTheme();
  const { templates, categories, incrementUsage, getMostUsed } = useTemplates();

  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [templates, selectedCategory, searchQuery]);

  // Get most used templates for quick access
  const mostUsed = useMemo(() => getMostUsed(4), [getMostUsed]);

  // Handle template selection
  const handleTemplateClick = (template: TaskTemplate) => {
    setSelectedTemplate(template);
    setVariableValues(getDefaultVariableValues(template.variables));
    setErrors([]);
  };

  // Handle variable input change
  const handleVariableChange = (name: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [name]: value }));
    setErrors([]);
  };

  // Apply template
  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;

    // Validate required variables
    const validation = validateVariables(selectedTemplate.variables, variableValues);
    if (!validation.valid) {
      setErrors(validation.missing.map(m => `${m} is required`));
      return;
    }

    // Interpolate variables
    const text = interpolateVariables(selectedTemplate.template.text, variableValues);
    const description = selectedTemplate.template.description
      ? interpolateVariables(selectedTemplate.template.description, variableValues)
      : '';

    // Create subtasks with IDs
    const subtasks = selectedTemplate.template.subtasks?.map((st, index) => ({
      id: `subtask-${Date.now()}-${index}`,
      text: interpolateVariables(st.text, variableValues),
      completed: st.completed,
    }));

    // Increment usage
    incrementUsage(selectedTemplate.id);

    // Return task data
    onSelect({
      text,
      description,
      priority: selectedTemplate.template.priority,
      category: selectedTemplate.template.category,
      subtasks: subtasks || [],
      recurrencePattern: selectedTemplate.template.recurrencePattern,
      dueDate: selectedTemplate.template.dueDate,
    });

    onClose();
  };

  // Back to gallery
  const handleBack = () => {
    setSelectedTemplate(null);
    setVariableValues({});
    setErrors([]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      } shadow-2xl flex flex-col`}>
        {/* Header */}
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            {selectedTemplate ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Templates
              </button>
            ) : (
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Choose a Template
              </h2>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedTemplate ? (
            // Template Detail View
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <span className="text-4xl">{selectedTemplate.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">{selectedTemplate.description}</p>
                </div>
              </div>

              {/* Variables */}
              {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Fill in the details
                  </h4>
                  <div className="space-y-4">
                    {selectedTemplate.variables.map((variable) => (
                      <div key={variable.name}>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                          {variable.name}
                          {variable.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                          type="text"
                          value={variableValues[variable.name] || ''}
                          onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                          placeholder={variable.placeholder}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                              : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                          } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  {errors.map((error, i) => (
                    <p key={i} className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  ))}
                </div>
              )}

              {/* Preview */}
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Preview</h4>
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  {interpolateVariables(selectedTemplate.template.text, variableValues)}
                </p>
                {selectedTemplate.template.subtasks && (
                  <div className="mt-3 space-y-1">
                    {selectedTemplate.template.subtasks.slice(0, 3).map((st, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-500">
                        <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-500" />
                        {interpolateVariables(st.text, variableValues)}
                      </div>
                    ))}
                    {selectedTemplate.template.subtasks.length > 3 && (
                      <p className="text-xs text-slate-400">
                        +{selectedTemplate.template.subtasks.length - 3} more subtasks
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Gallery View
            <div className="p-6">
              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className={`w-full px-4 py-3 rounded-xl border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  All
                </button>
                {categories.map(({ category, count }) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {CATEGORY_CONFIG[category].icon} {CATEGORY_CONFIG[category].label}
                  </button>
                ))}
              </div>

              {/* Most Used (if available and no search) */}
              {!searchQuery && selectedCategory === 'all' && mostUsed.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                    Most Used
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {mostUsed.map(template => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateClick(template)}
                        className={`p-4 rounded-xl text-left transition-all hover:scale-105 ${
                          theme === 'dark'
                            ? 'bg-slate-700/50 hover:bg-slate-700'
                            : 'bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-2xl mb-2 block">{template.icon}</span>
                        <p className="font-medium text-slate-800 dark:text-slate-100 text-sm truncate">
                          {template.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateClick(template)}
                    className={`p-4 rounded-xl text-left transition-all hover:scale-[1.02] ${
                      theme === 'dark'
                        ? 'bg-slate-700/50 hover:bg-slate-700 border border-slate-600'
                        : 'bg-white hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                            {template.name}
                          </p>
                          {template.usageCount > 0 && (
                            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                              {template.usageCount}x
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {CATEGORY_CONFIG[template.category].label}
                          </span>
                          {template.template.subtasks && (
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              • {template.template.subtasks.length} subtasks
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  No templates found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedTemplate && (
          <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} flex justify-end gap-3`}>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleApplyTemplate}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium"
            >
              Use Template
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
