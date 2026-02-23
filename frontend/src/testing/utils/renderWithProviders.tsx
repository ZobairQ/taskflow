/**
 * Test Utilities
 * Helper functions for testing React components
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

// Mock Task type matching the ProjectContext type
export interface MockTask {
  id: string;
  text: string;
  description?: string;
  completed: boolean;
  status: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string | null;
  completedAt?: string | null;
  subtasks?: Array<{ id: string; text: string; completed: boolean }> | null;
  isRecurring?: boolean;
  recurrencePattern?: { frequency: string; interval: number } | null;
  notificationSettings?: Record<string, unknown> | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

// Create a mock task for testing
export function createMockTask(overrides: Partial<MockTask> = {}): MockTask {
  return {
    id: 'task-1',
    text: 'Test Task',
    description: 'Test task description',
    completed: false,
    status: 'pending',
    priority: 'medium',
    category: 'general',
    dueDate: null,
    completedAt: null,
    subtasks: null,
    isRecurring: false,
    recurrencePattern: null,
    notificationSettings: null,
    projectId: 'project-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// Create multiple mock tasks
export function createMockTasks(count: number): MockTask[] {
  return Array.from({ length: count }, (_, i) =>
    createMockTask({
      id: `task-${i + 1}`,
      text: `Test Task ${i + 1}`,
    })
  );
}

// Dnd wrapper for testing components that use dnd-kit
const DndWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners}>
      {children}
      <DragOverlay />
    </DndContext>
  );
};

// Custom render function that includes providers
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: DndWrapper, ...options });
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { renderWithProviders as render };
