/**
 * DraggableTask - Wrapper component for draggable tasks
 */

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../ProjectContext';
import { TaskItem } from '../tasks';

interface DraggableTaskProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (task: Task) => void;
}

export const DraggableTask: React.FC<DraggableTaskProps> = ({
  task,
  onToggle,
  onDelete,
  onViewDetails,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id.toString(),
    data: {
      task,
      type: 'task',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TaskItem
        task={task}
        onToggle={onToggle}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
        isDragging={isDragging}
      />
    </div>
  );
};
