/**
 * RecurrencePicker - UI for configuring task recurrence patterns
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../ThemeContext';
import { RecurrencePattern, RecurrencePreset } from '../../types/recurrence.types';
import {
  getRecurrenceDescription,
  getUpcomingInstances,
  getDefaultPattern,
} from '../../utils/recurrenceUtils';
import {
  RECURRENCE_PRESETS,
  FREQUENCY_LABELS,
  DAYS_OF_WEEK_OPTIONS,
  MONTH_OPTIONS,
  DAY_OF_MONTH_OPTIONS,
  END_TYPE_OPTIONS,
  EndType,
} from '../../constants/recurrence';

interface RecurrencePickerProps {
  value?: RecurrencePattern | null;
  onChange: (pattern: RecurrencePattern | null) => void;
  startDate?: Date;
}

export const RecurrencePicker: React.FC<RecurrencePickerProps> = ({
  value,
  onChange,
  startDate = new Date(),
}) => {
  const { theme } = useTheme();
  const [selectedPreset, setSelectedPreset] = useState<RecurrencePreset | null>(null);
  const [endType, setEndType] = useState<EndType>('never');
  const [showCustom, setShowCustom] = useState(false);

  // Local state for custom pattern
  const [customPattern, setCustomPattern] = useState<RecurrencePattern>(
    value || getDefaultPattern()
  );

  // Sync local state with prop
  useEffect(() => {
    if (value) {
      setCustomPattern(value);
      if (value.endDate) {
        setEndType('on_date');
      } else if (value.maxOccurrences) {
        setEndType('after_occurrences');
      } else {
        setEndType('never');
      }
    }
  }, [value]);

  // Handle preset selection
  const handlePresetSelect = (preset: RecurrencePreset) => {
    setSelectedPreset(preset);
    const presetOption = RECURRENCE_PRESETS.find(p => p.id === preset);
    if (presetOption) {
      if (preset === 'custom') {
        setShowCustom(true);
      } else {
        setShowCustom(false);
        onChange(presetOption.pattern);
      }
    }
  };

  // Handle custom pattern changes
  const handleCustomChange = (updates: Partial<RecurrencePattern>) => {
    const newPattern = { ...customPattern, ...updates };
    setCustomPattern(newPattern);
    onChange(newPattern);
  };

  // Handle end type changes
  const handleEndTypeChange = (type: EndType) => {
    setEndType(type);
    if (type === 'never') {
      handleCustomChange({ endDate: undefined, maxOccurrences: undefined });
    } else if (type === 'on_date') {
      handleCustomChange({ maxOccurrences: undefined });
    } else {
      handleCustomChange({ endDate: undefined });
    }
  };

  // Toggle days of week
  const toggleDayOfWeek = (day: number) => {
    const currentDays = customPattern.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();
    handleCustomChange({ daysOfWeek: newDays });
  };

  // Get upcoming dates preview
  const upcomingDates = value ? getUpcomingInstances(value, 3) : [];

  // Clear recurrence
  const handleClear = () => {
    setSelectedPreset(null);
    setShowCustom(false);
    setCustomPattern(getDefaultPattern());
    onChange(null);
  };

  return (
    <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Repeat
        </h4>
        {value && (
          <button
            onClick={handleClear}
            className="text-xs text-slate-500 hover:text-rose-500 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Preset Grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {RECURRENCE_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => handlePresetSelect(preset.id)}
            className={`
              p-2 rounded-lg text-center transition-all text-xs
              ${selectedPreset === preset.id
                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-400'
                : 'bg-white dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-500'
              }
            `}
          >
            <span className="block text-base mb-0.5">{preset.icon}</span>
            <span>{preset.label}</span>
          </button>
        ))}
      </div>

      {/* Custom Options */}
      {showCustom && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-600">
          {/* Frequency and Interval */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Every</span>
            <input
              type="number"
              min={1}
              max={99}
              value={customPattern.interval}
              onChange={e => handleCustomChange({ interval: parseInt(e.target.value) || 1 })}
              className={`w-16 px-2 py-1 rounded text-sm text-center ${
                theme === 'dark'
                  ? 'bg-slate-600 text-slate-100 border-slate-500'
                  : 'bg-white text-slate-800 border-slate-200'
              } border`}
            />
            <select
              value={customPattern.frequency}
              onChange={e => handleCustomChange({ frequency: e.target.value as RecurrencePattern['frequency'] })}
              className={`flex-1 px-2 py-1 rounded text-sm ${
                theme === 'dark'
                  ? 'bg-slate-600 text-slate-100 border-slate-500'
                  : 'bg-white text-slate-800 border-slate-200'
              } border`}
            >
              {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Days of Week (for weekly) */}
          {customPattern.frequency === 'weekly' && (
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mb-2 block">
                On days
              </span>
              <div className="flex gap-1">
                {DAYS_OF_WEEK_OPTIONS.map(day => (
                  <button
                    key={day.value}
                    onClick={() => toggleDayOfWeek(day.value)}
                    className={`
                      w-8 h-8 rounded text-xs font-medium transition-all
                      ${customPattern.daysOfWeek?.includes(day.value)
                        ? 'bg-indigo-500 text-white'
                        : 'bg-white dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-500'
                      }
                    `}
                    title={day.fullLabel}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Day of Month (for monthly) */}
          {customPattern.frequency === 'monthly' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">On day</span>
              <select
                value={customPattern.dayOfMonth || 1}
                onChange={e => handleCustomChange({ dayOfMonth: parseInt(e.target.value) })}
                className={`flex-1 px-2 py-1 rounded text-sm ${
                  theme === 'dark'
                    ? 'bg-slate-600 text-slate-100 border-slate-500'
                    : 'bg-white text-slate-800 border-slate-200'
                } border`}
              >
                {DAY_OF_MONTH_OPTIONS.map(day => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Month and Day (for yearly) */}
          {customPattern.frequency === 'yearly' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">In</span>
              <select
                value={customPattern.monthOfYear || 1}
                onChange={e => handleCustomChange({ monthOfYear: parseInt(e.target.value) })}
                className={`flex-1 px-2 py-1 rounded text-sm ${
                  theme === 'dark'
                    ? 'bg-slate-600 text-slate-100 border-slate-500'
                    : 'bg-white text-slate-800 border-slate-200'
                } border`}
              >
                {MONTH_OPTIONS.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-500 dark:text-slate-400">on day</span>
              <select
                value={customPattern.dayOfMonth || 1}
                onChange={e => handleCustomChange({ dayOfMonth: parseInt(e.target.value) })}
                className={`w-16 px-2 py-1 rounded text-sm ${
                  theme === 'dark'
                    ? 'bg-slate-600 text-slate-100 border-slate-500'
                    : 'bg-white text-slate-800 border-slate-200'
                } border`}
              >
                {DAY_OF_MONTH_OPTIONS.slice(0, 28).map(day => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* End Options */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
            <span className="text-xs text-slate-500 dark:text-slate-400 mb-2 block">
              Ends
            </span>
            <div className="flex gap-2 mb-2">
              {END_TYPE_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleEndTypeChange(option.value)}
                  className={`
                    flex-1 py-1.5 px-2 rounded text-xs font-medium transition-all
                    ${endType === option.value
                      ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                      : 'bg-white dark:bg-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* End Date Input */}
            {endType === 'on_date' && (
              <input
                type="date"
                value={customPattern.endDate || ''}
                onChange={e => handleCustomChange({ endDate: e.target.value })}
                min={startDate.toISOString().split('T')[0]}
                className={`w-full px-2 py-1 rounded text-sm ${
                  theme === 'dark'
                    ? 'bg-slate-600 text-slate-100 border-slate-500'
                    : 'bg-white text-slate-800 border-slate-200'
                } border`}
              />
            )}

            {/* Max Occurrences Input */}
            {endType === 'after_occurrences' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">After</span>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={customPattern.maxOccurrences || 10}
                  onChange={e => handleCustomChange({ maxOccurrences: parseInt(e.target.value) || 10 })}
                  className={`w-20 px-2 py-1 rounded text-sm text-center ${
                    theme === 'dark'
                      ? 'bg-slate-600 text-slate-100 border-slate-500'
                      : 'bg-white text-slate-800 border-slate-200'
                  } border`}
                />
                <span className="text-xs text-slate-500 dark:text-slate-400">times</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview */}
      {value && upcomingDates.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {getRecurrenceDescription(value)}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Upcoming:</span>
            <ul className="mt-1 space-y-0.5">
              {upcomingDates.map((date, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  {date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
