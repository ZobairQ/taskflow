/**
 * TaskBoard - Kanban-style board view with drag and drop
 */

import React from 'react';
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
  UniqueIdentifier,
} from '@dnd-kit/core';
import { useTheme } from '../../ThemeContext';
import { Task } from '../../ProjectContext';
import { TaskStatus } from '../../types';
import { getTaskStatus } from '../../utils/taskUtils';
import { DroppableZone } from '../dnd/DroppableZone';
import { TaskCard } from './TaskCard';

interface TaskBoardProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onViewDetails: (task: Task) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onToggle,
  onStatusChange,
  onDelete,
  onViewDetails,
}) => {
  const { theme } = useTheme();
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);

  // Configure sensors with activation constraint
  // This allows clicks to work while still enabling drag after moving 8px
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Group tasks by status
  const pendingTasks = tasks.filter((t) => getTaskStatus(t) === 'pending');
  const inProgressTasks = tasks.filter((t) => getTaskStatus(t) === 'in_progress');
  const completedTasks = tasks.filter((t) => getTaskStatus(t) === 'completed');

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    // Handle drop on status zone
    if (over.data?.current?.type === 'zone') {
      const newStatus = over.data.current.status as TaskStatus;
      const taskId = String(active.id);
      if (taskId) {
        onStatusChange(taskId, newStatus);
      }
    }

    setActiveId(null);
  };

  const activeTask = activeId ? tasks.find((t) => t.id.toString() === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {/* To Do Column */}
        <div className="flex-1 min-w-[280px] max-w-[350px]">
          <DroppableZone
            id="pending"
            status="pending"
            label="To Do"
            count={pendingTasks.length}
            colorClass="border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30"
          >
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                No pending tasks
              </div>
            ) : (
              pendingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onViewDetails={onViewDetails}
                />
              ))
            )}
          </DroppableZone>
        </div>

        {/* In Progress Column */}
        <div className="flex-1 min-w-[280px] max-w-[350px]">
          <DroppableZone
            id="in_progress"
            status="in_progress"
            label="In Progress"
            count={inProgressTasks.length}
            colorClass="border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30"
          >
            {inProgressTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                No tasks in progress
              </div>
            ) : (
              inProgressTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onViewDetails={onViewDetails}
                />
              ))
            )}
          </DroppableZone>
        </div>

        {/* Done Column */}
        <div className="flex-1 min-w-[280px] max-w-[350px]">
          <DroppableZone
            id="completed"
            status="completed"
            label="Done"
            count={completedTasks.length}
            colorClass="border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30"
          >
            {completedTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                No completed tasks
              </div>
            ) : (
              completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onViewDetails={onViewDetails}
                />
              ))
            )}
          </DroppableZone>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask && (
          <div className="opacity-90 rotate-3 shadow-2xl">
            <div className={`p-3 rounded-lg border-2 border-indigo-400 ${
              theme === 'dark' ? 'bg-slate-700' : 'bg-white'
            }`}>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                {activeTask.text}
              </p>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {activeTask.priority} priority
              </p>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
