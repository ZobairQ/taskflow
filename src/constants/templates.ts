/**
 * Built-in Templates - Pre-defined task templates
 */

import { TaskTemplate, TemplateCategory } from '../types/template.types';

// Category icons and colors
export const CATEGORY_CONFIG: Record<TemplateCategory, { icon: string; color: string; label: string }> = {
  work: { icon: '💼', color: '#6366f1', label: 'Work' },
  personal: { icon: '🏠', color: '#8b5cf6', label: 'Personal' },
  health: { icon: '💪', color: '#10b981', label: 'Health & Fitness' },
  finance: { icon: '💰', color: '#f59e0b', label: 'Finance' },
  learning: { icon: '📚', color: '#3b82f6', label: 'Learning' },
  custom: { icon: '⭐', color: '#ec4899', label: 'Custom' },
};

// Built-in templates
export const BUILT_IN_TEMPLATES: TaskTemplate[] = [
  // Work Templates
  {
    id: 'meeting-prep',
    name: 'Meeting Preparation',
    description: 'Prepare for an upcoming meeting',
    category: 'work',
    icon: '📋',
    isBuiltIn: true,
    createdAt: Date.now(),
    usageCount: 0,
    template: {
      text: 'Prepare for {{meetingName}} meeting',
      description: 'Meeting with {{attendees}} on {{date}}',
      priority: 'medium',
      category: 'work',
      subtasks: [
        { text: 'Review agenda', completed: false },
        { text: 'Prepare talking points', completed: false },
        { text: 'Gather necessary documents', completed: false },
        { text: 'Send reminder to attendees', completed: false },
      ],
    },
    variables: [
      { name: 'meetingName', placeholder: 'e.g., Weekly Sync', required: true },
      { name: 'attendees', placeholder: 'e.g., Team leads' },
      { name: 'date', placeholder: 'e.g., Friday 3pm' },
    ],
  },
  {
    id: 'bug-report',
    name: 'Bug Report',
    description: 'Report and track a bug',
    category: 'work',
    icon: '🐛',
    isBuiltIn: true,
    createdAt: Date.now(),
    usageCount: 0,
    template: {
      text: 'Fix bug: {{bugDescription}}',
      description: 'Priority: {{priority}}\nSteps to reproduce:\n1. {{step1}}\n2. {{step2}}\nExpected: {{expected}}\nActual: {{actual}}',
      priority: 'high',
      category: 'work',
      subtasks: [
        { text: 'Reproduce the bug', completed: false },
        { text: 'Identify root cause', completed: false },
        { text: 'Implement fix', completed: false },
        { text: 'Write test case', completed: false },
        { text: 'Deploy fix', completed: false },
      ],
    },
    variables: [
      { name: 'bugDescription', placeholder: 'Brief bug description', required: true },
      { name: 'priority', placeholder: 'Critical/High/Medium/Low' },
      { name: 'step1', placeholder: 'First step to reproduce' },
      { name: 'step2', placeholder: 'Second step to reproduce' },
      { name: 'expected', placeholder: 'Expected behavior' },
      { name: 'actual', placeholder: 'Actual behavior' },
    ],
  },
  {
    id: 'weekly-review',
    name: 'Weekly Review',
    description: 'Review progress and plan ahead',
    category: 'work',
    icon: '📊',
    isBuiltIn: true,
    createdAt: Date.now(),
    usageCount: 0,
    template: {
      text: 'Weekly Review - Week {{weekNumber}}',
      description: 'Review accomplishments, blockers, and goals for the week',
      priority: 'medium',
      category: 'work',
      subtasks: [
        { text: 'Review completed tasks', completed: false },
        { text: 'Update project status', completed: false },
        { text: 'Identify blockers', completed: false },
        { text: 'Plan next week priorities', completed: false },
        { text: 'Update team on progress', completed: false },
      ],
    },
    variables: [
      { name: 'weekNumber', placeholder: 'e.g., 42' },
    ],
  },
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Review pull request or code changes',
    category: 'work',
    icon: '🔍',
    isBuiltIn: true,
    createdAt: Date.now(),
    usageCount: 0,
    template: {
      text: 'Review PR #{{prNumber}}: {{prTitle}}',
      description: 'Review code changes for {{branchName}} branch',
      priority: 'medium',
      category: 'work',
      subtasks: [
        { text: 'Check code style and formatting', completed: false },
        { text: 'Review logic and implementation', completed: false },
        { text: 'Test changes locally', completed: false },
        { text: 'Leave feedback', completed: false },
        { text: 'Approve or request changes', completed: false },
      ],
    },
    variables: [
      { name: 'prNumber', placeholder: 'e.g., 123', required: true },
      { name: 'prTitle', placeholder: 'Pull request title' },
      { name: 'branchName', placeholder: 'Feature branch name' },
    ],
  },

  // Personal Templates
  {
    id: 'grocery-shopping',
    name: 'Grocery Shopping',
    description: 'Weekly grocery shopping list',
    category: 'personal',
    icon: '🛒',
    isBuiltIn: true,
    createdAt: Date.now(),
    usageCount: 0,
    template: {
      text: 'Grocery Shopping - {{date}}',
      description: 'Weekly grocery run',
      priority: 'low',
      category: 'personal',
      subtasks: [
        { text: 'Fruits and vegetables', completed: false },
        { text: 'Dairy products', completed: false },
        { text: 'Meat and protein', completed: false },
        { text: 'Bread and grains', completed: false },
        { text: 'Snacks', completed: false },
      ],
    },
    variables: [
      { name: 'date', placeholder: 'Shopping date' },
    ],
  },
  {
    id: 'home-cleaning',
    name: 'Home Cleaning',
    description: 'Weekly home cleaning routine',
    category: 'personal',
    icon: '🧹',
    isBuiltIn: true,
    createdAt: Date.now(),
    usageCount: 0,
    template: {
      text: 'Home Cleaning - {{area}}',
      description: 'Deep clean {{area}}',
      priority: 'low',
      category: 'personal',
      subtasks: [
        { text: 'Dust surfaces', completed: false },
        { text: 'Vacuum/sweep floors', completed: false },
        { text: 'Clean windows', completed: false },
        { text: 'Organize items', completed: false },
        { text: 'Take out trash', completed: false },
      ],
    },
    variables: [
      { name: 'area', placeholder: 'e.g., Living Room, Kitchen', required: true },
    ],
  },

  // Health Templates
  {
    id: 'workout-routine',
    name: 'Workout Session',
    description: 'Track workout routine',
    category: 'health',
    icon: '🏃',
    isBuiltIn: true,
    createdAt: Date.now(),
    usageCount: 0,
    template: {
      text: '{{workoutType}} Workout',
      description: 'Duration: {{duration}} minutes',
      priority: 'medium',
      category: 'health',
      subtasks: [
        { text: 'Warm up (5-10 min)', completed: false },
        { text: 'Main workout', completed: false },
        { text: 'Cool down and stretch', completed: false },
        { text: 'Log workout details', completed: false },
      ],
    },
    variables: [
      { name: 'workoutType', placeholder: 'e.g., Cardio, Strength, HIIT', required: true },
      { name: 'duration', placeholder: 'e.g., 45' },
    ],
  },
  {
    id: 'health-checkup',
    name: 'Health Checkup',
    description: 'Schedule and prepare for health checkup',
    category: 'health',
    icon: '🏥',
    isBuiltIn: true,
    createdAt: Date.now(),
    usageCount: 0,
    template: {
      text: 'Health Checkup - {{checkupType}}',
      description: 'Appointment at {{location}}',
      priority: 'high',
      category: 'health',
      subtasks: [
        { text: 'Schedule appointment', completed: false },
        { text: 'Prepare questions for doctor', completed: false },
        { text: 'Gather medical history', completed: false },
        { text: 'Fast if required', completed: false },
        { text: 'Attend appointment', completed: false },
        { text: 'Follow up on results', completed: false },
      ],
    },
    variables: [
      { name: 'checkupType', placeholder: 'e.g., Annual, Dental, Vision', required: true },
      { name: 'location', placeholder: 'Clinic/Hospital name' },
    ],
  },

  // Finance Templates
  {
    id: 'monthly-budget',
    name: 'Monthly Budget Review',
    description: 'Review and plan monthly finances',
    category: 'finance',
    icon: '📈',
    isBuiltIn: true,
    createdAt: Date.now(),
    usageCount: 0,
    template: {
      text: 'Budget Review - {{month}} {{year}}',
      description: 'Review income, expenses, and savings',
      priority: 'high',
      category: 'finance',
      subtasks: [
        { text: 'Record all income', completed: false },
        { text: 'Categorize expenses', completed: false },
        { text: 'Review subscriptions', completed: false },
        { text: 'Calculate savings', completed: false },
        { text: 'Plan next month budget', completed: false },
      ],
    },
    variables: [
      { name: 'month', placeholder: 'e.g., January' },
      { name: 'year', placeholder: 'e.g., 2024' },
    ],
  },
  {
    id: 'bill-payment',
    name: 'Bill Payment',
    description: 'Track and pay recurring bills',
    category: 'finance',
    icon: '💳',
    isBuiltIn: true,
    createdAt: Date.now(),
    usageCount: 0,
    template: {
      text: 'Pay {{billName}}',
      description: 'Amount: {{amount}}\nDue: {{dueDate}}',
      priority: 'high',
      category: 'finance',
      subtasks: [
        { text: 'Check balance', completed: false },
        { text: 'Process payment', completed: false },
        { text: 'Save confirmation', completed: false },
        { text: 'Update budget tracker', completed: false },
      ],
    },
    variables: [
      { name: 'billName', placeholder: 'e.g., Electric Bill', required: true },
      { name: 'amount', placeholder: 'e.g., $150' },
      { name: 'dueDate', placeholder: 'e.g., 15th' },
    ],
  },

  // Learning Templates
  {
    id: 'course-lesson',
    name: 'Course Lesson',
    description: 'Track online course progress',
    category: 'learning',
    icon: '🎓',
    isBuiltIn: true,
    createdAt: Date.now(),
    usageCount: 0,
    template: {
      text: 'Complete {{courseName}} - Module {{moduleNumber}}',
      description: 'Focus area: {{topic}}',
      priority: 'medium',
      category: 'learning',
      subtasks: [
        { text: 'Watch video lectures', completed: false },
        { text: 'Take notes', completed: false },
        { text: 'Complete exercises', completed: false },
        { text: 'Review summary', completed: false },
        { text: 'Take quiz', completed: false },
      ],
    },
    variables: [
      { name: 'courseName', placeholder: 'Course name', required: true },
      { name: 'moduleNumber', placeholder: 'e.g., 1, 2, 3' },
      { name: 'topic', placeholder: 'Module topic' },
    ],
  },
  {
    id: 'book-reading',
    name: 'Book Reading Goal',
    description: 'Track reading progress',
    category: 'learning',
    icon: '📖',
    isBuiltIn: true,
    createdAt: Date.now(),
    usageCount: 0,
    template: {
      text: 'Read {{bookTitle}} - Chapter {{chapter}}',
      description: 'Author: {{author}}',
      priority: 'low',
      category: 'learning',
      subtasks: [
        { text: 'Read chapter', completed: false },
        { text: 'Highlight key points', completed: false },
        { text: 'Write summary', completed: false },
        { text: 'Apply learnings', completed: false },
      ],
    },
    variables: [
      { name: 'bookTitle', placeholder: 'Book title', required: true },
      { name: 'chapter', placeholder: 'Chapter number' },
      { name: 'author', placeholder: 'Author name' },
    ],
  },
];

// Get templates by category
export function getTemplatesByCategory(category: TemplateCategory): TaskTemplate[] {
  return BUILT_IN_TEMPLATES.filter(t => t.category === category);
}

// Get all unique categories that have templates
export function getCategoriesWithTemplates(): TemplateCategory[] {
  const categories = new Set<TemplateCategory>();
  BUILT_IN_TEMPLATES.forEach(t => categories.add(t.category));
  return Array.from(categories);
}
