/**
 * useSubtasks - Reusable hook for subtask management
 */

import { useState, useCallback } from 'react';
import { Subtask } from '../types';

interface UseSubtasksReturn {
  subtasks: Subtask[];
  addSubtask: (text: string) => void;
  toggleSubtask: (id: number) => void;
  deleteSubtask: (id: number) => void;
  editSubtask: (id: number, text: string) => void;
  setSubtasks: (subtasks: Subtask[]) => void;
  resetSubtasks: (subtasks: Subtask[]) => void;
}

export function useSubtasks(initialSubtasks: Subtask[] = []): UseSubtasksReturn {
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks);

  const addSubtask = useCallback((text: string) => {
    const newSubtask: Subtask = {
      id: Date.now(),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setSubtasks((prev) => [...prev, newSubtask]);
  }, []);

  const toggleSubtask = useCallback((id: number) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  }, []);

  const deleteSubtask = useCallback((id: number) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const editSubtask = useCallback((id: number, text: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, text } : s))
    );
  }, []);

  const resetSubtasks = useCallback((newSubtasks: Subtask[]) => {
    setSubtasks(newSubtasks);
  }, []);

  return {
    subtasks,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    editSubtask,
    setSubtasks,
    resetSubtasks,
  };
}
