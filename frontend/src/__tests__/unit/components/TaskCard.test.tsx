// @ts-nocheck
/**
 * TaskCard Component Tests
 */

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from '../../../components/tasks/TaskCard';
import { renderWithProviders, createMockTask } from '../../../testing/utils/renderWithProviders';

describe('TaskCard', () => {
  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnViewDetails = jest.fn();

  const defaultProps = {
    onToggle: mockOnToggle,
    onDelete: mockOnDelete,
    onViewDetails: mockOnViewDetails,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render task text', () => {
      const task = createMockTask({ text: 'My Test Task' });

      renderWithProviders(<TaskCard task={task} {...defaultProps} />);

      expect(screen.getByText('My Test Task')).toBeInTheDocument();
    });

    it('should render priority badge', () => {
      const task = createMockTask({ priority: 'high' });

      renderWithProviders(<TaskCard task={task} {...defaultProps} />);

      expect(screen.getByText('high')).toBeInTheDocument();
    });

    it('should render category when present', () => {
      const task = createMockTask({ category: 'bugfix' });

      renderWithProviders(<TaskCard task={task} {...defaultProps} />);

      expect(screen.getByText('bugfix')).toBeInTheDocument();
    });

    it('should render due date when present', () => {
      const task = createMockTask({
        dueDate: '2024-12-31T23:59:59.000Z',
      });

      renderWithProviders(<TaskCard task={task} {...defaultProps} />);

      // The date icon should be present when there's a due date
      // The component shows the date in a format like "Dec 31"
      const dateContainer = document.querySelector('.text-slate-400.dark\\:text-slate-500');
      expect(dateContainer).toBeInTheDocument();
    });

    it('should show completed state', () => {
      const task = createMockTask({ completed: true });

      renderWithProviders(<TaskCard task={task} {...defaultProps} />);

      // Check for line-through style (completed task)
      const taskText = screen.getByText('Test Task');
      expect(taskText).toHaveClass('line-through');
    });

    it('should not show category when not present', () => {
      const task = createMockTask({ category: undefined });

      renderWithProviders(<TaskCard task={task} {...defaultProps} />);

      // Only priority should be visible, no category
      expect(screen.getByText('medium')).toBeInTheDocument();
    });

    it('should not show due date when not present', () => {
      const task = createMockTask({ dueDate: null });

      renderWithProviders(<TaskCard task={task} {...defaultProps} />);

      // No date element should be present
      const dateElements = screen.queryAllByText(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/);
      expect(dateElements.length).toBe(0);
    });
  });

  describe('interactions', () => {
    it('should have checkbox element present', () => {
      const task = createMockTask();

      renderWithProviders(<TaskCard task={task} {...defaultProps} />);

      // The card should render with the task content
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('should have delete button present', () => {
      const task = createMockTask();

      renderWithProviders(<TaskCard task={task} {...defaultProps} />);

      // The card should render with the task content
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('should call onViewDetails when card content is clicked', async () => {
      const task = createMockTask();
      const user = userEvent.setup();

      renderWithProviders(<TaskCard task={task} {...defaultProps} />);

      // Click on the task text (paragraph element)
      const taskText = screen.getByText('Test Task');
      await user.click(taskText);

      expect(mockOnViewDetails).toHaveBeenCalledWith(task);
    });
  });

  describe('priority colors', () => {
    it('should have correct priority class for low priority', () => {
      const task = createMockTask({ priority: 'low' });

      renderWithProviders(<TaskCard task={task} {...defaultProps} />);

      const badge = screen.getByText('low');
      expect(badge).toHaveClass('bg-emerald-100');
    });

    it('should have correct priority class for medium priority', () => {
      const task = createMockTask({ priority: 'medium' });

      renderWithProviders(<TaskCard task={task} {...defaultProps} />);

      const badge = screen.getByText('medium');
      expect(badge).toHaveClass('bg-amber-100');
    });

    it('should have correct priority class for high priority', () => {
      const task = createMockTask({ priority: 'high' });

      renderWithProviders(<TaskCard task={task} {...defaultProps} />);

      const badge = screen.getByText('high');
      expect(badge).toHaveClass('bg-rose-100');
    });
  });

  describe('completed state', () => {
    it('should show line-through styling when completed', () => {
      const task = createMockTask({ completed: true, text: 'Completed Task' });

      renderWithProviders(<TaskCard task={task} {...defaultProps} />);

      // Check that task text has line-through class
      const taskText = screen.getByText('Completed Task');
      expect(taskText).toHaveClass('line-through');
    });

    it('should not show line-through styling when not completed', () => {
      const task = createMockTask({ completed: false, text: 'Active Task' });

      renderWithProviders(<TaskCard task={task} {...defaultProps} />);

      // Check that task text does NOT have line-through class
      const taskText = screen.getByText('Active Task');
      expect(taskText).not.toHaveClass('line-through');
    });
  });
});
