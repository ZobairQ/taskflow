/**
 * Keyboard shortcuts definitions
 */

export interface Shortcut {
  key: string;
  description: string;
  category: 'global' | 'tasks' | 'filters' | 'navigation';
  action: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}

export const SHORTCUTS: Shortcut[] = [
  // Global shortcuts
  {
    key: 'n',
    description: 'Create new task',
    category: 'global',
    action: 'newTask',
  },
  {
    key: 's',
    description: 'Focus search',
    category: 'global',
    action: 'focusSearch',
  },
  {
    key: '/',
    description: 'Focus search (alternative)',
    category: 'global',
    action: 'focusSearch',
  },
  {
    key: '?',
    description: 'Show keyboard shortcuts',
    category: 'global',
    action: 'showHelp',
    shift: true,
  },
  {
    key: 'Escape',
    description: 'Close modal / Clear selection',
    category: 'global',
    action: 'closeModal',
  },
  {
    key: 't',
    description: 'Toggle theme',
    category: 'global',
    action: 'toggleTheme',
  },
  {
    key: 'c',
    description: 'Toggle calendar view',
    category: 'global',
    action: 'toggleCalendar',
  },

  // Task navigation
  {
    key: 'ArrowUp',
    description: 'Navigate up',
    category: 'navigation',
    action: 'navigateUp',
  },
  {
    key: 'ArrowDown',
    description: 'Navigate down',
    category: 'navigation',
    action: 'navigateDown',
  },
  {
    key: 'Enter',
    description: 'Open selected task',
    category: 'tasks',
    action: 'openTask',
  },
  {
    key: 'e',
    description: 'Edit selected task',
    category: 'tasks',
    action: 'editTask',
  },
  {
    key: 'd',
    description: 'Delete selected task',
    category: 'tasks',
    action: 'deleteTask',
  },
  {
    key: '1',
    description: 'Set status to pending',
    category: 'tasks',
    action: 'setStatusPending',
  },
  {
    key: '2',
    description: 'Set status to in progress',
    category: 'tasks',
    action: 'setStatusInProgress',
  },
  {
    key: '3',
    description: 'Set status to completed',
    category: 'tasks',
    action: 'setStatusCompleted',
  },

  // Filters
  {
    key: 'a',
    description: 'Show all tasks',
    category: 'filters',
    action: 'filterAll',
  },
  {
    key: 'f',
    description: 'Show active tasks',
    category: 'filters',
    action: 'filterActive',
  },
  {
    key: 'x',
    description: 'Show completed tasks',
    category: 'filters',
    action: 'filterCompleted',
  },
];

// Helper function to check if a keyboard event matches a shortcut
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: Shortcut
): boolean {
  const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
  const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
  const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
  const altMatches = shortcut.alt ? event.altKey : !event.altKey;

  return keyMatches && ctrlMatches && shiftMatches && altMatches;
}

// Get shortcuts by category
export function getShortcutsByCategory(category: Shortcut['category']): Shortcut[] {
  return SHORTCUTS.filter((s) => s.category === category);
}

// Format shortcut for display
export function formatShortcut(shortcut: Shortcut): string {
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  parts.push(shortcut.key.toUpperCase());
  return parts.join(' + ');
}
