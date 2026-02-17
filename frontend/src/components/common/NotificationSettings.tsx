/**
 * NotificationSettings component for configuring task reminders
 */

import React from 'react';
import { NotificationSettings as NotificationSettingsType } from '../../types';

interface NotificationSettingsProps {
  settings: NotificationSettingsType;
  onChange: (settings: NotificationSettingsType) => void;
  hasDueDate: boolean;
}

export const NotificationSettingsComponent: React.FC<NotificationSettingsProps> = ({
  settings,
  onChange,
  hasDueDate,
}) => {
  if (!hasDueDate) {
    return (
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Set a due date to enable notifications
        </p>
      </div>
    );
  }

  const handleToggleEnabled = () => {
    onChange({
      ...settings,
      enabled: !settings.enabled,
    });
  };

  const handleToggleTiming = (minutes: number) => {
    const newTiming = settings.timing.includes(minutes)
      ? settings.timing.filter((t) => t !== minutes)
      : [...settings.timing, minutes].sort((a, b) => a - b);

    onChange({
      ...settings,
      timing: newTiming,
    });
  };

  const handleTypeChange = (type: 'browser' | 'in-app' | 'both') => {
    onChange({
      ...settings,
      type,
    });
  };

  const timingOptions = [
    { minutes: 15, label: '15 minutes' },
    { minutes: 30, label: '30 minutes' },
    { minutes: 60, label: '1 hour' },
    { minutes: 120, label: '2 hours' },
    { minutes: 1440, label: '1 day' },
  ];

  return (
    <div className="space-y-4">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔔</span>
          <span className="font-medium">Enable Reminders</span>
        </div>
        <button
          onClick={handleToggleEnabled}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            settings.enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
              settings.enabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {settings.enabled && (
        <>
          {/* Notification Type */}
          <div>
            <label className="block text-sm font-semibold mb-2">Notification Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleTypeChange('browser')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  settings.type === 'browser'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Browser
              </button>
              <button
                onClick={() => handleTypeChange('in-app')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  settings.type === 'in-app'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                In-App
              </button>
              <button
                onClick={() => handleTypeChange('both')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  settings.type === 'both'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Both
              </button>
            </div>
          </div>

          {/* Timing Options */}
          <div>
            <label className="block text-sm font-semibold mb-2">Remind me</label>
            <div className="flex flex-wrap gap-2">
              {timingOptions.map((option) => (
                <button
                  key={option.minutes}
                  onClick={() => handleToggleTiming(option.minutes)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    settings.timing.includes(option.minutes)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {option.label} before
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
