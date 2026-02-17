/**
 * Reusable priority badge component
 */

import React from 'react';
import { TaskPriority } from '../../types';
import { PRIORITIES } from '../../constants/priorities';

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const config = PRIORITIES[priority];

  return (
    <span className={`px-2.5 py-1 rounded-full border font-medium ${config.badge} ${className}`}>
      {config.label} Priority
    </span>
  );
};
