/**
 * Natural Language Task Parser
 * Parses task text to extract metadata like due dates, priorities, categories
 *
 * Examples:
 * - "Buy milk tomorrow" -> dueDate: tomorrow
 * - "Call mom on friday #personal high priority" -> category: personal, priority: high, dueDate: friday
 * - "Submit report by end of week" -> dueDate: end of week
 */

import { TaskPriority } from '../../types';

export interface ParsedTask {
  text: string;
  dueDate?: string;
  priority?: TaskPriority;
  category?: string;
  description?: string;
}

// Date patterns to recognize
const DATE_PATTERNS: { pattern: RegExp; resolver: () => Date }[] = [
  // Relative dates
  { pattern: /\btoday\b/i, resolver: () => new Date() },
  { pattern: /\btomorrow\b/i, resolver: () => addDays(new Date(), 1) },
  { pattern: /\byesterday\b/i, resolver: () => addDays(new Date(), -1) },

  // Days of week
  { pattern: /\bnext\s+monday\b/i, resolver: () => getNextDayOfWeek(1) },
  { pattern: /\bnext\s+tuesday\b/i, resolver: () => getNextDayOfWeek(2) },
  { pattern: /\bnext\s+wednesday\b/i, resolver: () => getNextDayOfWeek(3) },
  { pattern: /\bnext\s+thursday\b/i, resolver: () => getNextDayOfWeek(4) },
  { pattern: /\bnext\s+friday\b/i, resolver: () => getNextDayOfWeek(5) },
  { pattern: /\bnext\s+saturday\b/i, resolver: () => getNextDayOfWeek(6) },
  { pattern: /\bnext\s+sunday\b/i, resolver: () => getNextDayOfWeek(0) },

  // Short days
  { pattern: /\bmon\b/i, resolver: () => getNextDayOfWeek(1) },
  { pattern: /\btue\b/i, resolver: () => getNextDayOfWeek(2) },
  { pattern: /\bwed\b/i, resolver: () => getNextDayOfWeek(3) },
  { pattern: /\bthu\b/i, resolver: () => getNextDayOfWeek(4) },
  { pattern: /\bthurs\b/i, resolver: () => getNextDayOfWeek(4) },
  { pattern: /\bfri\b/i, resolver: () => getNextDayOfWeek(5) },
  { pattern: /\bsat\b/i, resolver: () => getNextDayOfWeek(6) },
  { pattern: /\bsun\b/i, resolver: () => getNextDayOfWeek(0) },

  // Week references
  { pattern: /\bnext\s+week\b/i, resolver: () => addDays(new Date(), 7) },
  { pattern: /\bend\s+of\s+week\b/i, resolver: () => getEndOfWeek() },
  { pattern: /\bthis\s+weekend\b/i, resolver: () => getNextDayOfWeek(6) },

  // Month references
  { pattern: /\bnext\s+month\b/i, resolver: () => addMonths(new Date(), 1) },
  { pattern: /\bend\s+of\s+month\b/i, resolver: () => getEndOfMonth() },

  // Relative time
  { pattern: /\bin\s+(\d+)\s+days?\b/i, resolver: () => addDays(new Date(), 1) },
  { pattern: /\bin\s+(\d+)\s+weeks?\b/i, resolver: () => addDays(new Date(), 7) },
];

// Priority patterns
const PRIORITY_PATTERNS: { pattern: RegExp; priority: TaskPriority }[] = [
  { pattern: /\bhigh\s+priority\b/i, priority: 'high' },
  { pattern: /\burgent\b/i, priority: 'high' },
  { pattern: /\basap\b/i, priority: 'high' },
  { pattern: /\bimportant\b/i, priority: 'high' },
  { pattern: /\b!!!+\b/, priority: 'high' },
  { pattern: /\bcritical\b/i, priority: 'high' },

  { pattern: /\bmedium\s+priority\b/i, priority: 'medium' },
  { pattern: /\bnormal\b/i, priority: 'medium' },
  { pattern: /\b!!\b/, priority: 'medium' },

  { pattern: /\blow\s+priority\b/i, priority: 'low' },
  { pattern: /\bwhenever\b/i, priority: 'low' },
  { pattern: /\bsometime\b/i, priority: 'low' },
  { pattern: /\b!\b/, priority: 'low' },
  { pattern: /\bnot\s+urgent\b/i, priority: 'low' },
];

// Category patterns
const CATEGORY_PATTERNS: { pattern: RegExp; category: string }[] = [
  { pattern: /#work\b/i, category: 'work' },
  { pattern: /#personal\b/i, category: 'personal' },
  { pattern: /#health\b/i, category: 'health' },
  { pattern: /#finance\b/i, category: 'finance' },
  { pattern: /#shopping\b/i, category: 'shopping' },
  { pattern: /#learning\b/i, category: 'learning' },
  { pattern: /#home\b/i, category: 'home' },
  { pattern: /#fitness\b/i, category: 'health' },
  { pattern: /#urgent\b/i, category: 'work' },
];

// Helper functions
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function getNextDayOfWeek(dayOfWeek: number): Date {
  const today = new Date();
  const result = new Date(today);
  const currentDay = today.getDay();
  const daysUntil = (dayOfWeek - currentDay + 7) % 7 || 7;
  result.setDate(today.getDate() + daysUntil);
  return result;
}

function getEndOfWeek(): Date {
  const today = new Date();
  const result = new Date(today);
  const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
  result.setDate(today.getDate() + daysUntilFriday);
  return result;
}

function getEndOfMonth(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() + 1, 0);
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse a natural language task string
 */
export function parseTask(input: string): ParsedTask {
  let text = input.trim();
  let dueDate: string | undefined;
  let priority: TaskPriority | undefined;
  let category: string | undefined;

  // Extract "by" date patterns
  const byPattern = /\bby\s+(.+?)(?=\s+(?:#|!|priority|$))/i;
  const byMatch = text.match(byPattern);
  if (byMatch) {
    const dateStr = byMatch[1];
    const parsedDate = parseDateString(dateStr);
    if (parsedDate) {
      dueDate = formatDateForInput(parsedDate);
      text = text.replace(byPattern, '').trim();
    }
  }

  // Extract "on" date patterns
  const onPattern = /\bon\s+(\w+)(?=\s|$)/i;
  const onMatch = text.match(onPattern);
  if (onMatch) {
    const dateStr = onMatch[1];
    const parsedDate = parseDateString(dateStr);
    if (parsedDate) {
      dueDate = formatDateForInput(parsedDate);
      text = text.replace(onPattern, '').trim();
    }
  }

  // Extract date patterns
  for (const { pattern, resolver } of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const date = resolver();
      dueDate = formatDateForInput(date);
      text = text.replace(pattern, '').trim();
    }
  }

  // Extract "in X days/weeks" with number
  const inDaysMatch = text.match(/\bin\s+(\d+)\s+days?\b/i);
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1], 10);
    dueDate = formatDateForInput(addDays(new Date(), days));
    text = text.replace(/\bin\s+\d+\s+days?\b/i, '').trim();
  }

  const inWeeksMatch = text.match(/\bin\s+(\d+)\s+weeks?\b/i);
  if (inWeeksMatch) {
    const weeks = parseInt(inWeeksMatch[1], 10);
    dueDate = formatDateForInput(addDays(new Date(), weeks * 7));
    text = text.replace(/\bin\s+\d+\s+weeks?\b/i, '').trim();
  }

  // Extract priority
  for (const { pattern, priority: p } of PRIORITY_PATTERNS) {
    if (pattern.test(text)) {
      priority = p;
      text = text.replace(pattern, '').trim();
    }
  }

  // Extract category
  for (const { pattern, category: c } of CATEGORY_PATTERNS) {
    if (pattern.test(text)) {
      category = c;
      text = text.replace(pattern, '').trim();
    }
  }

  // Clean up extra whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return {
    text,
    dueDate,
    priority,
    category,
  };
}

/**
 * Parse a date string like "monday", "next week", etc.
 */
function parseDateString(str: string): Date | null {
  const lowerStr = str.toLowerCase().trim();

  // Check predefined patterns
  for (const { pattern, resolver } of DATE_PATTERNS) {
    if (pattern.test(lowerStr)) {
      return resolver();
    }
  }

  // Try to parse as date
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
}

/**
 * Get suggestions for task text as user types
 */
export function getTaskSuggestions(input: string): string[] {
  const suggestions: string[] = [];

  // Date suggestions
  if (input.length > 3) {
    const dateSuggestions = [
      'today',
      'tomorrow',
      'next week',
      'next monday',
      'end of week',
    ];

    for (const ds of dateSuggestions) {
      if (ds.startsWith(input.toLowerCase())) {
        suggestions.push(ds);
      }
    }
  }

  // Priority suggestions
  if (input.includes('!')) {
    suggestions.push('high priority', 'medium priority', 'low priority');
  }

  // Category suggestions
  if (input.includes('#')) {
    suggestions.push('#work', '#personal', '#health', '#shopping');
  }

  return suggestions;
}

/**
 * Detect if input contains natural language patterns
 */
export function hasNaturalLanguage(input: string): boolean {
  const patterns = [
    /\btomorrow\b/i,
    /\btoday\b/i,
    /\bnext\s+\w+\b/i,
    /\bin\s+\d+\s+(days?|weeks?)\b/i,
    /\bby\s+\w+\b/i,
    /\bon\s+(mon|tue|wed|thu|fri|sat|sun)/i,
    /#\w+/,
    /!{1,3}/,
  ];

  return patterns.some(p => p.test(input));
}
