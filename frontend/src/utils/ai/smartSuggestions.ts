/**
 * Smart Suggestions Utility
 * Provides intelligent suggestions for task breakdown, priorities, and scheduling
 */

import { TaskPriority } from '../../types';

// Common task templates for breakdown
const BREAKDOWN_TEMPLATES: Record<string, string[]> = {
  // Work tasks
  'meeting': [
    'Prepare agenda',
    'Send calendar invite',
    'Review previous notes',
    'Prepare presentation',
    'Send follow-up email',
  ],
  'presentation': [
    'Outline key points',
    'Create slides',
    'Add visuals/diagrams',
    'Practice delivery',
    'Get feedback',
  ],
  'report': [
    'Gather data',
    'Create outline',
    'Write draft',
    'Review and edit',
    'Get approval',
  ],

  // Personal tasks
  'grocery': [
    'Make shopping list',
    'Check pantry',
    'Get reusable bags',
    'Plan meals for week',
  ],
  'travel': [
    'Book flights',
    'Reserve accommodation',
    'Plan itinerary',
    'Pack luggage',
    'Check documents',
  ],
  'exercise': [
    'Warm up',
    'Main workout',
    'Cool down',
    'Track progress',
  ],

  // Home tasks
  'clean': [
    'Declutter surfaces',
    'Dust furniture',
    'Vacuum floors',
    'Clean bathroom',
    'Take out trash',
  ],
  'cook': [
    'Find recipe',
    'Get ingredients',
    'Prep ingredients',
    'Cook meal',
    'Clean up',
  ],
};

// Keywords to detect task type
const TASK_TYPE_KEYWORDS: Record<string, string[]> = {
  'meeting': ['meeting', 'call', 'sync', 'standup', 'review'],
  'presentation': ['presentation', 'slides', 'deck', 'demo'],
  'report': ['report', 'document', 'write', 'draft'],
  'grocery': ['grocery', 'shopping', 'buy', 'store'],
  'travel': ['trip', 'travel', 'vacation', 'flight', 'hotel'],
  'exercise': ['workout', 'exercise', 'gym', 'run', 'fitness'],
  'clean': ['clean', 'tidy', 'organize', 'declutter'],
  'cook': ['cook', 'bake', 'recipe', 'dinner', 'meal'],
};

// Priority suggestions based on keywords
const PRIORITY_KEYWORDS: Record<TaskPriority, string[]> = {
  high: ['urgent', 'asap', 'critical', 'important', 'deadline', 'emergency', 'overdue'],
  medium: ['soon', 'this week', 'moderate', 'normal'],
  low: ['later', 'eventually', 'someday', 'when possible', 'optional'],
};

// Category suggestions based on keywords
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  work: ['meeting', 'report', 'deadline', 'client', 'project', 'email', 'presentation'],
  personal: ['birthday', 'family', 'friend', 'hobby', 'personal'],
  health: ['doctor', 'exercise', 'gym', 'medicine', 'appointment', 'workout'],
  finance: ['bill', 'payment', 'budget', 'tax', 'invoice', 'bank'],
  shopping: ['buy', 'purchase', 'order', 'store', 'grocery'],
  home: ['clean', 'repair', 'maintenance', 'garden', 'laundry'],
};

/**
 * Get task breakdown suggestions based on task text
 */
export function getBreakdownSuggestions(taskText: string): string[] {
  const lowerText = taskText.toLowerCase();

  // Find matching task type
  for (const [type, keywords] of Object.entries(TASK_TYPE_KEYWORDS)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      return BREAKDOWN_TEMPLATES[type] || [];
    }
  }

  return [];
}

/**
 * Suggest priority based on task text
 */
export function suggestPriority(taskText: string): TaskPriority | null {
  const lowerText = taskText.toLowerCase();

  for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      return priority as TaskPriority;
    }
  }

  return null;
}

/**
 * Suggest category based on task text
 */
export function suggestCategory(taskText: string): string | null {
  const lowerText = taskText.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      return category;
    }
  }

  return null;
}

/**
 * Suggest optimal time for task based on type
 */
export function suggestTime(taskText: string): { hour: number; reason: string } | null {
  const lowerText = taskText.toLowerCase();

  // Morning tasks
  if (lowerText.includes('exercise') || lowerText.includes('workout') || lowerText.includes('gym')) {
    return { hour: 7, reason: 'Best time for physical activity' };
  }

  // Deep work
  if (lowerText.includes('focus') || lowerText.includes('deep work') || lowerText.includes('writing')) {
    return { hour: 9, reason: 'Peak mental clarity in the morning' };
  }

  // Meetings
  if (lowerText.includes('meeting') || lowerText.includes('call')) {
    return { hour: 10, reason: 'Most people are available mid-morning' };
  }

  // Creative work
  if (lowerText.includes('design') || lowerText.includes('creative') || lowerText.includes('brainstorm')) {
    return { hour: 14, reason: 'Creative energy often peaks in afternoon' };
  }

  // Administrative
  if (lowerText.includes('email') || lowerText.includes('admin') || lowerText.includes('review')) {
    return { hour: 16, reason: 'Good time for administrative tasks' };
  }

  return null;
}

/**
 * Get all smart suggestions for a task
 */
export function getSmartSuggestions(taskText: string) {
  return {
    breakdown: getBreakdownSuggestions(taskText),
    priority: suggestPriority(taskText),
    category: suggestCategory(taskText),
    time: suggestTime(taskText),
  };
}

/**
 * Detect duplicate tasks
 */
export function findDuplicateTasks(newTask: string, existingTasks: string[]): string[] {
  const lowerNew = newTask.toLowerCase();
  const words = lowerNew.split(/\s+/).filter(w => w.length > 3);

  return existingTasks.filter(existing => {
    const lowerExisting = existing.toLowerCase();
    const matchCount = words.filter(w => lowerExisting.includes(w)).length;
    return matchCount >= Math.ceil(words.length * 0.6);
  });
}

/**
 * Suggest task templates based on time of day
 */
export function getTimeBasedSuggestions(): string[] {
  const hour = new Date().getHours();

  if (hour < 9) {
    return [
      'Review today\'s priorities',
      'Check calendar for meetings',
      'Plan the day ahead',
    ];
  } else if (hour < 12) {
    return [
      'Complete most important task',
      'Respond to urgent emails',
      'Prepare for upcoming meetings',
    ];
  } else if (hour < 14) {
    return [
      'Take lunch break',
      'Review morning progress',
      'Plan afternoon tasks',
    ];
  } else if (hour < 17) {
    return [
      'Follow up on pending items',
      'Review and update tasks',
      'Prepare for tomorrow',
    ];
  } else {
    return [
      'Review day\'s accomplishments',
      'Plan tomorrow\'s priorities',
      'Clear inbox',
    ];
  }
}

/**
 * Weekly planning suggestions
 */
export function getWeeklyPlanningSuggestions(): string[] {
  return [
    'Review last week\'s completed tasks',
    'Set top 3 priorities for the week',
    'Schedule important meetings',
    'Block time for deep work',
    'Plan personal/family time',
    'Review long-term goals',
  ];
}
