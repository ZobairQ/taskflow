/**
 * DateRangePicker - Date range selection for analytics
 */

import React, { useState } from 'react';
import { useTheme } from '../../ThemeContext';
import { DateRange } from '../../types/analytics.types';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  onCustomChange?: (start: Date, end: Date) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  onCustomChange,
}) => {
  const { theme } = useTheme();
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const options: { value: DateRange; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom' },
  ];

  const handleCustomApply = () => {
    if (customStart && customEnd && onCustomChange) {
      onCustomChange(new Date(customStart), new Date(customEnd));
      setShowCustom(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <button
            key={option.value}
            onClick={() => {
              if (option.value === 'custom') {
                setShowCustom(!showCustom);
              } else {
                setShowCustom(false);
                onChange(option.value);
              }
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              value === option.value
                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Custom date inputs */}
      {showCustom && (
        <div className={`absolute top-full left-0 mt-2 p-4 rounded-xl shadow-lg z-10 ${
          theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
        }`}>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className={`px-3 py-2 rounded-lg text-sm ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-800'
                } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className={`px-3 py-2 rounded-lg text-sm ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-800'
                } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
            <button
              onClick={handleCustomApply}
              disabled={!customStart || !customEnd}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
