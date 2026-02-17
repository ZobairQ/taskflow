/**
 * QuickActions - Easy access to all app features
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../ThemeContext';
import { useProjects } from '../../ProjectContext';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick?: () => void;
  to?: string;
  badge?: string | number;
  highlight?: boolean;
}

export const QuickActions: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { projects } = useProjects();
  const navigate = useNavigate();

  const allTasks = projects.flatMap(p => p.todos || []);
  const completedToday = allTasks.filter(t => {
    if (!t?.completed || !t?.completedAt) return false;
    const today = new Date();
    const completedDate = new Date(t.completedAt);
    return today.toDateString() === completedDate.toDateString();
  }).length;

  const actions: QuickAction[] = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      label: 'Templates',
      description: 'Start from pre-made task templates',
      to: '#templates',
      highlight: true,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      label: 'Analytics',
      description: 'View your productivity insights',
      to: '/analytics',
      badge: completedToday > 0 ? `${completedToday} done` : undefined,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
      label: 'Export',
      description: 'Backup your data',
      to: '/settings?tab=export',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Settings',
      description: 'Preferences & more',
      to: '/settings',
    },
  ];

  const handleTemplatesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Scroll to templates section or open template gallery
    const templatesButton = document.querySelector('[data-action="open-templates"]') as HTMLButtonElement;
    if (templatesButton) {
      templatesButton.click();
    }
  };

  return (
    <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} shadow-sm`}>
      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 px-1">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {actions.map((action, index) => {
          const content = (
            <>
              <div className="relative">
                <div className={`p-2 rounded-lg ${
                  action.highlight
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                    : theme === 'dark'
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {action.icon}
                </div>
                {action.badge && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-medium bg-emerald-500 text-white rounded-full">
                    {action.badge}
                  </span>
                )}
              </div>
              <div className="mt-2">
                <p className={`text-sm font-medium ${
                  action.highlight
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {action.label}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
                  {action.description}
                </p>
              </div>
            </>
          );

          if (action.to === '#templates') {
            return (
              <button
                key={index}
                onClick={handleTemplatesClick}
                className={`p-3 rounded-xl text-left transition-all hover:scale-[1.02] ${
                  action.highlight
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                    : theme === 'dark'
                    ? 'bg-slate-700/50 hover:bg-slate-700'
                    : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {content}
              </button>
            );
          }

          if (action.to) {
            return (
              <Link
                key={index}
                to={action.to}
                className={`p-3 rounded-xl text-left transition-all hover:scale-[1.02] ${
                  action.highlight
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                    : theme === 'dark'
                    ? 'bg-slate-700/50 hover:bg-slate-700'
                    : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`p-3 rounded-xl text-left transition-all hover:scale-[1.02] ${
                theme === 'dark'
                  ? 'bg-slate-700/50 hover:bg-slate-700'
                  : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
};
