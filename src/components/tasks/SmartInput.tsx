/**
 * SmartInput - Intelligent task input with natural language parsing and suggestions
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { parseTask, hasNaturalLanguage, ParsedTask } from '../../utils/nlp/taskParser';
import {
  getSmartSuggestions,
  getBreakdownSuggestions,
  getTimeBasedSuggestions,
} from '../../utils/ai/smartSuggestions';
import { TaskPriority } from '../../types';

interface SmartInputProps {
  onSubmit: (task: {
    text: string;
    dueDate?: string;
    priority?: TaskPriority;
    category?: string;
  }) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

interface Suggestion {
  id: string;
  text: string;
  type: 'date' | 'priority' | 'category' | 'breakdown' | 'time';
  icon: React.ReactNode;
}

export const SmartInput: React.FC<SmartInputProps> = ({
  onSubmit,
  placeholder = 'Add a task... (try "Buy milk tomorrow #shopping high priority")',
  autoFocus = false,
}) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<ParsedTask | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Generate context-aware suggestions
  const generateSuggestions = useCallback((text: string, parsed: ParsedTask) => {
    const newSuggestions: Suggestion[] = [];
    const lowerText = text.toLowerCase();

    // Date suggestions if no date detected
    if (!parsed.dueDate) {
      if (lowerText.length > 3) {
        const dateSuggestions = [
          { text: 'today', label: 'Today' },
          { text: 'tomorrow', label: 'Tomorrow' },
          { text: 'next week', label: 'Next Week' },
          { text: 'next monday', label: 'Next Monday' },
        ];

        dateSuggestions.forEach(ds => {
          if (!lowerText.includes(ds.text)) {
            newSuggestions.push({
              id: `date-${ds.text}`,
              text: ds.text,
              type: 'date',
              icon: <CalendarIcon />,
            });
          }
        });
      }
    }

    // Priority suggestions if no priority detected
    if (!parsed.priority) {
      const priorityKeywords = ['urgent', 'important', 'critical'];
      const hasPriorityHint = priorityKeywords.some(kw => lowerText.includes(kw));

      if (!hasPriorityHint && lowerText.length > 5) {
        newSuggestions.push({
          id: 'priority-high',
          text: 'high priority',
          type: 'priority',
          icon: <PriorityIcon />,
        });
      }
    }

    // Category suggestions if no category detected
    if (!parsed.category) {
      const smartSuggestions = getSmartSuggestions(text);
      if (smartSuggestions.category) {
        newSuggestions.push({
          id: `category-${smartSuggestions.category}`,
          text: `#${smartSuggestions.category}`,
          type: 'category',
          icon: <TagIcon />,
        });
      }
    }

    // Breakdown suggestions for complex tasks
    const breakdown = getBreakdownSuggestions(text);
    if (breakdown.length > 0) {
      newSuggestions.push({
        id: 'breakdown',
        text: 'Break down this task',
        type: 'breakdown',
        icon: <ListIcon />,
      });
    }

    // Time-based suggestions
    if (lowerText.length > 5 && !lowerText.includes(' at ') && !lowerText.includes(' by ')) {
      const timeSuggestion = getTimeBasedSuggestions();
      if (timeSuggestion.length > 0) {
        newSuggestions.push({
          id: 'time',
          text: timeSuggestion[0],
          type: 'time',
          icon: <ClockIcon />,
        });
      }
    }

    setSuggestions(newSuggestions.slice(0, 6));
    setShowSuggestions(newSuggestions.length > 0);
  }, []);

  // Parse input in real-time
  useEffect(() => {
    if (input.trim().length > 2) {
      const parsed = parseTask(input);
      setParsedPreview(parsed);

      // Generate suggestions based on input
      generateSuggestions(input, parsed);
    } else {
      setParsedPreview(null);
      setSuggestions([]);
    }
  }, [input, generateSuggestions]);

  // Apply suggestion to input
  const applySuggestion = (suggestion: Suggestion) => {
    if (suggestion.type === 'breakdown') {
      // Trigger breakdown mode - parent component can handle this
      setInput(input + ' ');
      setShowSuggestions(false);
      return;
    }

    setInput(prev => `${prev} ${suggestion.text}`);
    inputRef.current?.focus();
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const text = input.trim();
    if (!text) return;

    const parsed = parseTask(text);

    onSubmit({
      text: parsed.text,
      dueDate: parsed.dueDate,
      priority: parsed.priority,
      category: parsed.category,
    });

    // Reset
    setInput('');
    setParsedPreview(null);
    setShowSuggestions(false);
  };

  // Keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Tab':
        if (selectedIndex >= 0) {
          e.preventDefault();
          applySuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          applySuggestion(suggestions[selectedIndex]);
          setSelectedIndex(-1);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasNLP = hasNaturalLanguage(input);

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          {/* Smart indicator */}
          {hasNLP && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                <svg className="w-3 h-3 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                </svg>
              </span>
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={`w-full px-4 py-3 ${hasNLP ? 'pl-10' : ''} bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
          />

          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Parsed preview */}
        {parsedPreview && (parsedPreview.dueDate || parsedPreview.priority || parsedPreview.category) && (
          <div className="flex flex-wrap gap-2 mt-2 px-1">
            {parsedPreview.dueDate && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                <CalendarIcon />
                {formatPreviewDate(parsedPreview.dueDate)}
              </span>
            )}
            {parsedPreview.priority && (
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                parsedPreview.priority === 'high'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : parsedPreview.priority === 'medium'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                <PriorityIcon />
                {parsedPreview.priority}
              </span>
            )}
            {parsedPreview.category && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                <TagIcon />
                {parsedPreview.category}
              </span>
            )}
          </div>
        )}
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-2">
            <div className="text-xs font-medium text-slate-400 dark:text-slate-500 px-2 py-1">
              Suggestions
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => applySuggestion(suggestion)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-indigo-50 dark:bg-indigo-900/30'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-slate-400 dark:text-slate-500">
                  {suggestion.icon}
                </span>
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  Add "{suggestion.text}"
                </span>
                <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 capitalize">
                  {suggestion.type}
                </span>
              </button>
            ))}
          </div>
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-400 dark:text-slate-500">
            Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">Tab</kbd> or{' '}
            <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">Enter</kbd> to apply
          </div>
        </div>
      )}
    </div>
  );
};

// Helper to format date preview
function formatPreviewDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// Icon components
const CalendarIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const PriorityIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
  </svg>
);

const TagIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default SmartInput;
