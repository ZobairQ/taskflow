/**
 * InstallPrompt - Prompts user to install the PWA
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../ThemeContext';

export const InstallPrompt: React.FC = () => {
  const { theme } = useTheme();
  const [showPrompt, setShowPrompt] = useState(false);
  const deferredPromptRef = useRef<Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> } | null>(null);

  useEffect(() => {
    // Check if already dismissed or installed
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;

    if (dismissed || isInstalled) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPromptRef.current) return;

    deferredPromptRef.current.prompt();
    const { outcome } = await deferredPromptRef.current.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
    }

    deferredPromptRef.current = null;
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom duration-300">
      <div className={`rounded-2xl shadow-2xl overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-700'
          : 'bg-gradient-to-r from-indigo-600 to-purple-600'
      }`}>
        <div className="p-4 text-white">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Install TaskFlow</h3>
              <p className="text-sm text-white/80 mt-1">
                Add to your home screen for quick access, offline use, and a better experience!
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 font-medium transition-colors"
            >
              Not now
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 px-4 py-2 rounded-xl bg-white text-indigo-600 hover:bg-white/90 font-bold transition-colors"
            >
              Install
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
