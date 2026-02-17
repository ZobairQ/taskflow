/**
 * Test Utilities - Custom render and helpers for testing
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProjectProvider } from '../ProjectContext';
import { GamificationProvider } from '../GamificationContext';
import { ThemeProvider } from '../ThemeContext';
import { TimerProvider } from '../TimerContext';
import { TemplateProvider } from '../contexts/TemplateContext';

// All providers wrapper
const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <ProjectProvider>
      <GamificationProvider>
        <ThemeProvider>
          <TimerProvider>
            <TemplateProvider>
              {children}
            </TemplateProvider>
          </TimerProvider>
        </ThemeProvider>
      </GamificationProvider>
    </ProjectProvider>
  </BrowserRouter>
);

// Custom render with all providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from testing library
export * from '@testing-library/react';
export { customRender as render };

// Helper to wait for state updates
export const waitFor = (ms: number = 0) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Helper to create mock task
export const createMockTask = (overrides: Partial<any> = {}) => ({
  id: Math.floor(Math.random() * 1000),
  text: 'Test Task',
  completed: false,
  priority: 'medium' as const,
  projectId: 1,
  createdAt: new Date().toISOString(),
  ...overrides,
});

// Helper to create mock project
export const createMockProject = (overrides: Partial<any> = {}) => ({
  id: Math.floor(Math.random() * 1000),
  name: 'Test Project',
  color: '#6366f1',
  createdAt: new Date().toISOString(),
  ...overrides,
});
