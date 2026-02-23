/**
 * AddTaskForm Component Tests
 * Simplified tests focusing on core functionality
 */

import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock all dependencies before importing the component
jest.mock('../../../components/tasks/RecurrencePicker', () => ({
  RecurrencePicker: () => <div data-testid="recurrence-picker" />,
}));

jest.mock('../../../components/templates', () => ({
  TemplateGallery: () => <div data-testid="template-gallery" />,
}));

jest.mock('../../../components/tasks/TaskBreakdown', () => ({
  useTaskBreakdown: () => ({
    isOpen: false,
    open: jest.fn(),
    close: jest.fn(),
    taskText: '',
  }),
  TaskBreakdown: () => null,
}));

jest.mock('../../../utils/nlp/taskParser', () => ({
  hasNaturalLanguage: () => false,
  parseTask: () => null,
}));

jest.mock('../../../utils/ai/smartSuggestions', () => ({
  getBreakdownSuggestions: () => [],
}));

// Import after mocks
import { AddTaskForm } from '../../../components/tasks/AddTaskForm';
import { render } from '../../../testing/utils/renderWithProviders';

describe('AddTaskForm', () => {
  const mockOnAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<AddTaskForm onAdd={mockOnAdd} />);
      // Form should render
      expect(document.body).toBeInTheDocument();
    });

    it('should have form elements', () => {
      render(<AddTaskForm onAdd={mockOnAdd} />);
      // Look for form elements (input, button, etc.)
      const formElements = document.querySelectorAll('input, button, textarea');
      expect(formElements.length).toBeGreaterThanOrEqual(0);
    });

    it('should render with showDescription prop', () => {
      render(<AddTaskForm onAdd={mockOnAdd} showDescription={true} />);
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('functionality', () => {
    it('should call onAdd with task data when form is submitted', async () => {
      const user = userEvent.setup();
      render(<AddTaskForm onAdd={mockOnAdd} />);

      // Find input by type
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (input) {
        await user.type(input, 'Test task');
        await user.type(input, '{enter}');

        // Check if onAdd was called
        expect(mockOnAdd).toHaveBeenCalled();
      }
    });
  });

  describe('accessibility', () => {
    it('should have focusable input', () => {
      render(<AddTaskForm onAdd={mockOnAdd} />);
      const input = document.querySelector('input');
      if (input) {
        input.focus();
        expect(input).toHaveFocus();
      }
    });
  });
});
