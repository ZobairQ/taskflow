/**
 * Task Validator Tests
 */

import { createTaskSchema, updateTaskSchema } from '../../../validators/task.validator';

describe('Task Validators', () => {
  describe('createTaskSchema', () => {
    it('should validate valid task input', () => {
      const input = {
        text: 'Complete the project',
        projectId: 'clx1234567890123456789012', // cuid format
      };

      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('should apply default values', () => {
      const input = {
        text: 'Test task',
        projectId: 'clx1234567890123456789012',
      };

      const result = createTaskSchema.parse(input);

      expect(result.priority).toBe('medium');
    });

    it('should reject empty text', () => {
      const input = {
        text: '',
        projectId: 'clx1234567890123456789012',
      };

      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required');
      }
    });

    it('should reject text longer than 500 characters', () => {
      const input = {
        text: 'a'.repeat(501),
        projectId: 'clx1234567890123456789012',
      };

      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject invalid priority', () => {
      const input = {
        text: 'Test task',
        projectId: 'clx1234567890123456789012',
        priority: 'urgent', // Invalid priority
      };

      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should accept valid priority values', () => {
      const priorities = ['low', 'medium', 'high'];

      priorities.forEach((priority) => {
        const input = {
          text: 'Test task',
          projectId: 'clx1234567890123456789012',
          priority,
        };

        const result = createTaskSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });

    it('should validate dueDate as ISO string', () => {
      const input = {
        text: 'Test task',
        projectId: 'clx1234567890123456789012',
        dueDate: '2024-12-31T23:59:59.000Z',
      };

      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const input = {
        text: 'Test task',
        projectId: 'clx1234567890123456789012',
        dueDate: 'not-a-date',
      };

      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should validate subtasks', () => {
      const input = {
        text: 'Test task',
        projectId: 'clx1234567890123456789012',
        subtasks: [
          { text: 'Subtask 1', completed: false },
          { text: 'Subtask 2', completed: true },
        ],
      };

      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('should reject subtask with empty text', () => {
      const input = {
        text: 'Test task',
        projectId: 'clx1234567890123456789012',
        subtasks: [{ text: '', completed: false }],
      };

      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });

  describe('updateTaskSchema', () => {
    it('should validate valid update input', () => {
      const input = {
        id: 'task-1',
        text: 'Updated task text',
        completed: true,
      };

      const result = updateTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('should allow partial updates', () => {
      const input = {
        id: 'task-1',
        priority: 'high',
      };

      const result = updateTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('should require id', () => {
      const input = {
        text: 'Updated text',
      };

      const result = updateTaskSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should allow null dueDate', () => {
      const input = {
        id: 'task-1',
        dueDate: null,
      };

      const result = updateTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('should allow nullable description', () => {
      const input = {
        id: 'task-1',
        description: null,
      };

      const result = updateTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
    });
  });
});
