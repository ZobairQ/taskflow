/**
 * ImportPanel - UI for importing tasks
 */

import React, { useState, useRef } from 'react';
import { useTheme } from '../../ThemeContext';
import { Task } from '../../types/task.types';
import { ImportSource, ImportPreview, ImportResult } from '../../types/importExport.types';
import {
  previewCSVImport,
  importFromCSV,
  parseJSONExport,
  readFileAsText,
  getFileExtension,
  detectImportSource,
} from '../../utils/import/csvImporter';

interface ImportPanelProps {
  onImport: (tasks: Partial<Task>[]) => void;
  existingTaskCount: number;
}

export const ImportPanel: React.FC<ImportPanelProps> = ({ onImport, existingTaskCount }) => {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importSource, setImportSource] = useState<ImportSource>('generic');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setError(null);
    setPreview(null);
    setResult(null);

    const extension = getFileExtension(selectedFile.name);

    if (!['csv', 'json'].includes(extension)) {
      setError('Please select a CSV or JSON file');
      return;
    }

    setFile(selectedFile);

    try {
      const content = await readFileAsText(selectedFile);

      if (extension === 'json') {
        // JSON import
        const parseResult = parseJSONExport(content);
        if (parseResult.errors.length > 0) {
          setError(parseResult.errors.join(', '));
          return;
        }
        setPreview({
          totalRows: parseResult.tasks.length,
          validRows: parseResult.tasks.length,
          invalidRows: 0,
          fields: ['JSON import'],
          sampleData: parseResult.tasks.slice(0, 5),
          errors: [],
        });
        setResult({
          success: true,
          imported: parseResult.tasks.length,
          skipped: 0,
          errors: [],
          warnings: [],
          tasks: parseResult.tasks,
        });
      } else {
        // CSV import - detect source
        const lines = content.split('\n');
        const headers = lines[0]?.split(',').map(h => h.trim().replace(/^"|"$/g, '')) || [];
        const detected = detectImportSource(headers);
        setImportSource(detected);

        const previewData = previewCSVImport(content, detected);
        setPreview(previewData);
      }
    } catch (err) {
      setError(`Failed to read file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleImport = async () => {
    if (!file || !preview) return;

    setIsImporting(true);
    setError(null);

    try {
      const content = await readFileAsText(file);
      const extension = getFileExtension(file.name);

      let importResult: ImportResult;

      if (extension === 'json') {
        const parseResult = parseJSONExport(content);
        importResult = {
          success: parseResult.errors.length === 0,
          imported: parseResult.tasks.length,
          skipped: 0,
          errors: parseResult.errors,
          warnings: [],
          tasks: parseResult.tasks,
        };
      } else {
        importResult = importFromCSV(content, importSource);
      }

      setResult(importResult);

      if (importResult.success && importResult.tasks.length > 0) {
        onImport(importResult.tasks);
      }
    } catch (err) {
      setError(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sourceOptions = [
    { value: 'generic' as const, label: 'Generic CSV', icon: '📄' },
    { value: 'todoist' as const, label: 'Todoist', icon: '✓' },
    { value: 'trello' as const, label: 'Trello', icon: '📋' },
  ];

  return (
    <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Import Data
      </h3>

      {/* Info */}
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Import tasks from CSV or JSON files. Supports Todoist, Trello, and generic formats.
        You currently have <strong>{existingTaskCount}</strong> tasks.
      </p>

      {/* File Drop Zone */}
      {!file && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
            ${isDragging
              ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <div className="text-4xl mb-3">📁</div>
          <p className="font-medium text-slate-700 dark:text-slate-300">
            Drop a file here or click to browse
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supports CSV and JSON files
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      )}

      {/* File Selected */}
      {file && (
        <div className="mt-4">
          <div className={`flex items-center justify-between p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getFileExtension(file.name) === 'json' ? '{ }' : '📊'}</span>
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-300">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Source Selection (for CSV) */}
          {getFileExtension(file.name) === 'csv' && preview && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Import Source
              </label>
              <div className="flex gap-2">
                {sourceOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setImportSource(option.value);
                      // Re-preview with new source
                      readFileAsText(file).then(content => {
                        setPreview(previewCSVImport(content, option.value));
                      });
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      importSource === option.value
                        ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {option.icon} {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {preview && !result && (
            <div className={`mt-4 p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Preview</h4>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{preview.totalRows}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">total rows</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-emerald-500">{preview.validRows}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">valid</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-amber-500">{preview.invalidRows}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">skipped</span>
                </div>
              </div>

              {preview.errors.length > 0 && (
                <div className="text-sm text-amber-600 dark:text-amber-400">
                  {preview.errors.map((err, i) => (
                    <p key={i}>• {err}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`mt-4 p-4 rounded-xl ${result.success ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{result.success ? '✅' : '⚠️'}</span>
                <span className={`font-medium ${result.success ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                  {result.success ? 'Import Successful!' : 'Import Completed with Issues'}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Imported <strong>{result.imported}</strong> tasks
                {result.skipped > 0 && `, skipped ${result.skipped} rows`}
              </p>
            </div>
          )}

          {/* Import Button */}
          {!result && (
            <button
              onClick={handleImport}
              disabled={isImporting || !preview || preview.validRows === 0}
              className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Importing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Import {preview?.validRows || 0} Tasks
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
