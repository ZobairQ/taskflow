/**
 * WelcomeModal - First-time user onboarding
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../ThemeContext';

interface WelcomeModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const ONBOARDING_KEY = 'taskflow_onboarding_complete';

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const isComplete = localStorage.getItem(ONBOARDING_KEY);
    if (!isComplete) {
      // Small delay for smooth UX
      const timer = setTimeout(() => setShowOnboarding(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setShowOnboarding(true);
  };

  return { showOnboarding, completeOnboarding, resetOnboarding };
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onComplete }) => {
  const { theme } = useTheme();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to TaskFlow! 👋',
      description: 'Your personal productivity companion. Let\'s get you set up in just a few steps.',
      icon: '🚀',
    },
    {
      title: 'Create Your First Project',
      description: 'Projects help you organize tasks by area - work, personal, health, or anything else.',
      icon: '📁',
    },
    {
      title: 'Add Tasks & Subtasks',
      description: 'Break down your work into manageable tasks. Add subtasks for detailed tracking.',
      icon: '✅',
    },
    {
      title: 'Track with Pomodoro',
      description: 'Use the built-in timer to stay focused. 25-minute work sessions with short breaks.',
      icon: '⏱️',
    },
    {
      title: 'Level Up!',
      description: 'Complete tasks to earn XP and unlock achievements. Make productivity fun!',
      icon: '🎮',
    },
  ];

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStep = steps[step];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        }`}
      >
        {/* Progress bar */}
        <div className="h-1 bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="text-6xl mb-6 animate-in bounce-in duration-500">
            {currentStep.icon}
          </div>

          {/* Title */}
          <h2
            id="welcome-title"
            className={`text-2xl font-bold mb-3 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
          >
            {currentStep.title}
          </h2>

          {/* Description */}
          <p className={`text-lg mb-8 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
            {currentStep.description}
          </p>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step
                    ? 'w-8 bg-indigo-500'
                    : i < step
                    ? 'bg-indigo-300 dark:bg-indigo-600'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            {step < steps.length - 1 && (
              <button
                onClick={handleSkip}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  theme === 'dark'
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Skip tour
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
            >
              {step === steps.length - 1 ? "Let's Go!" : 'Next'}
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Skip onboarding"
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
