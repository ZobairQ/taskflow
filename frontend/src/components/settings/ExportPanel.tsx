/**
 * ExportPanel - UI for exporting tasks
 */

import React, { useState } from 'react';
import { useTheme } from '../../ThemeContext';
import { Task } from '../../types/task.types';
import { ExportFormat } from '../../types/importExport.types';
import { exportToJSON, downloadJSON, generateFilename } from '../../utils/export/jsonExporter';
import { exportToCSV, downloadCSV, getCSVStats } from '../../utils/export/csvExporter';
import { openPDFReport } from '../../utils/export/pdfExporter';

interface ExportPanelProps {
  tasks: Task[];
  gamificationData?: {
    xp: number;
    level: number;
    streak: number;
    achievements: string[];
  };
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ tasks, gamificationData }) => {
  const { theme } = useTheme();
  const [format, setFormat] = useState<ExportFormat>('json');
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const [includeGamification, setIncludeGamification] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Build complete export options
  const exportOptions = {
    format,
    includeCompleted,
    includeArchived: false,
    includeSubtasks: true,
    includeTimeTracking: true,
    includeGamification,
  };

  const stats = getCSVStats(tasks, exportOptions);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const options = exportOptions;

      switch (format) {
        case 'json': {
          const content = exportToJSON(tasks, options, includeGamification ? gamificationData : undefined);
          downloadJSON(content, generateFilename('json'));
          break;
        }
        case 'csv': {
          const content = exportToCSV(tasks, options);
          downloadCSV(content, generateFilename('csv'));
          break;
        }
        case 'pdf': {
          openPDFReport(tasks, options);
          break;
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  };

  const formatOptions = [
    {
      value: 'json' as const,
      label: 'JSON',
      description: 'Full backup with all data, can be re-imported',
      icon: '{ }',
    },
    {
      value: 'csv' as const,
      label: 'CSV',
      description: 'Spreadsheet format, works with Excel/Google Sheets',
      icon: '📊',
    },
    {
      value: 'pdf' as const,
      label: 'PDF Report',
      description: 'Printable report with statistics and task list',
      icon: '📄',
    },
  ];

  return (
    <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export Data
      </h3>

      {/* Stats Preview */}
      <div className={`grid grid-cols-3 gap-3 mb-6 p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.totalTasks}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Tasks</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-500">{stats.completedTasks}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-500">{stats.pendingTasks}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Pending</div>
        </div>
      </div>

      {/* Format Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
          Export Format
        </label>
        <div className="grid grid-cols-3 gap-3">
          {formatOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFormat(option.value)}
              className={`p-4 rounded-xl text-center transition-all ${
                format === option.value
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 border-2 border-indigo-400 dark:border-indigo-500'
                  : 'bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-500'
              }`}
            >
              <span className="text-2xl mb-2 block">{option.icon}</span>
              <span className={`font-semibold block ${format === option.value ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                {option.label}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeCompleted}
            onChange={(e) => setIncludeCompleted(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Include completed tasks
          </span>
        </label>

        {format === 'json' && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeGamification}
              onChange={(e) => setIncludeGamification(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Include gamification data (XP, level, achievements)
            </span>
          </label>
        )}
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting || tasks.length === 0}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Exporting...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export {format.toUpperCase()} File
          </>
        )}
      </button>

      {tasks.length === 0 && (
        <p className="text-sm text-amber-600 dark:text-amber-400 text-center mt-3">
          No tasks to export
        </p>
      )}
    </div>
  );
};
