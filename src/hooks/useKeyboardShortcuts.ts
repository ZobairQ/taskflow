/**
 * Custom hook for managing keyboard shortcuts
 */

import { useEffect, useCallback } from 'react';
import { SHORTCUTS, matchesShortcut } from '../constants/shortcuts';

export interface KeyboardShortcutHandlers {
  onNewTask?: () => void;
  onFocusSearch?: () => void;
  onShowHelp?: () => void;
  onCloseModal?: () => void;
  onToggleTheme?: () => void;
  onToggleCalendar?: () => void;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
  onOpenTask?: () => void;
  onEditTask?: () => void;
  onDeleteTask?: () => void;
  onSetStatusPending?: () => void;
  onSetStatusInProgress?: () => void;
  onSetStatusCompleted?: () => void;
  onFilterAll?: () => void;
  onFilterActive?: () => void;
  onFilterCompleted?: () => void;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape key even in input fields
        if (event.key !== 'Escape') {
          return;
        }
      }

      // Find matching shortcut
      for (const shortcut of SHORTCUTS) {
        if (matchesShortcut(event, shortcut)) {
          event.preventDefault();

          // Execute the corresponding handler
          switch (shortcut.action) {
            case 'newTask':
              handlers.onNewTask?.();
              break;
            case 'focusSearch':
              handlers.onFocusSearch?.();
              break;
            case 'showHelp':
              handlers.onShowHelp?.();
              break;
            case 'closeModal':
              handlers.onCloseModal?.();
              break;
            case 'toggleTheme':
              handlers.onToggleTheme?.();
              break;
            case 'toggleCalendar':
              handlers.onToggleCalendar?.();
              break;
            case 'navigateUp':
              handlers.onNavigateUp?.();
              break;
            case 'navigateDown':
              handlers.onNavigateDown?.();
              break;
            case 'openTask':
              handlers.onOpenTask?.();
              break;
            case 'editTask':
              handlers.onEditTask?.();
              break;
            case 'deleteTask':
              handlers.onDeleteTask?.();
              break;
            case 'setStatusPending':
              handlers.onSetStatusPending?.();
              break;
            case 'setStatusInProgress':
              handlers.onSetStatusInProgress?.();
              break;
            case 'setStatusCompleted':
              handlers.onSetStatusCompleted?.();
              break;
            case 'filterAll':
              handlers.onFilterAll?.();
              break;
            case 'filterActive':
              handlers.onFilterActive?.();
              break;
            case 'filterCompleted':
              handlers.onFilterCompleted?.();
              break;
          }

          break; // Only execute first matching shortcut
        }
      }
    },
    [handlers]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
