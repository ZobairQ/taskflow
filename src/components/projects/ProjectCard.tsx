/**
 * Project card component
 */

import React from 'react';
import { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, onDelete }) => {
  const progressPercentage =
    project.totalTodos > 0 ? Math.round((project.completedTodos / project.totalTodos) * 100) : 0;

  return (
    <div
      className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700 cursor-pointer relative"
      onClick={onClick}
    >
      <div className={`bg-gradient-to-r ${project.color} p-5 text-white`}>
        <h3 className="text-xl font-bold mb-1">{project.name}</h3>
        <p className="text-white/80 text-sm">{project.totalTodos} tasks</p>
      </div>

      <div className="p-5">
        <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
          {project.description || 'No description'}
        </p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
            </svg>
            <span>{project.completedTodos} done</span>
          </div>
          <span className="text-slate-500 dark:text-slate-400">{progressPercentage}%</span>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${project.color}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {project.id !== 'default' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project.id);
          }}
          className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
