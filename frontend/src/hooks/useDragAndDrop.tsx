/**
 * useDragAndDrop - Custom hook for managing drag and drop logic
 */

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { Task } from '../ProjectContext';
import { TaskStatus } from '../types';

export interface UseDragAndDropReturn {
  sensors: ReturnType<typeof useSensors>;
  activeTask: Task | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  DragOverlayComponent: React.ReactNode;
}

export function useDragAndDrop(
  tasks: Task[],
  onStatusChange: (id: string, status: TaskStatus) => void,
  onReorder?: (activeId: string, overId: string) => void
): UseDragAndDropReturn {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const task = tasks.find((t) => t.id.toString() === active.id);
      if (task) {
        setActiveTask(task);
      }
    },
    [tasks]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Check if dropping on a status zone
      if (over.data.current?.type === 'zone') {
        const newStatus = over.data.current.status as TaskStatus;
        const task = tasks.find((t) => t.id.toString() === activeId);
        if (task) {
          onStatusChange(task.id, newStatus);
        }
      }
      // Check if reordering within same list
      else if (over.data.current?.type === 'task' && onReorder) {
        onReorder(activeId, overId);
      }
    },
    [tasks, onStatusChange, onReorder]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) {
        setActiveTask(null);
        return;
      }

      const activeId = active.id as string;
      const overId = over.id as string;

      // Handle drop on status zone
      if (over.data.current?.type === 'zone') {
        const newStatus = over.data.current.status as TaskStatus;
        const task = tasks.find((t) => t.id.toString() === activeId);
        if (task) {
          onStatusChange(task.id, newStatus);
        }
      }
      // Handle reorder
      else if (over.data.current?.type === 'task' && onReorder && activeId !== overId) {
        onReorder(activeId, overId);
      }

      setActiveTask(null);
    },
    [tasks, onStatusChange, onReorder]
  );

  const DragOverlayComponent = activeTask ? (
    <div className="opacity-90 rotate-3 scale-105 shadow-2xl">
      <div className="bg-white dark:bg-slate-700 rounded-xl p-4 border-2 border-indigo-400 dark:border-indigo-500">
        <p className="font-medium text-slate-800 dark:text-slate-200">
          {activeTask.text}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {activeTask.priority} priority
        </p>
      </div>
    </div>
  ) : null;

  return {
    sensors,
    activeTask,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    DragOverlayComponent,
  };
}

// Export DndContext and DragOverlay for convenience
export { DndContext, DragOverlay, closestCenter };
