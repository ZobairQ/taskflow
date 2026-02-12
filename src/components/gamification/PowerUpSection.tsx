/**
 * Power-up section component - extracts ~250 lines from App.tsx
 */

import React from 'react';
import { PowerUp } from '../../types';
import { PowerUpCard } from './PowerUpCard';

interface PowerUpSectionProps {
  powerUps: PowerUp[];
  level: number;
  xp: number;
  streak: number;
  xpProgress: number;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
}

export const PowerUpSection: React.FC<PowerUpSectionProps> = ({
  powerUps,
  level,
  xp,
  streak,
  xpProgress,
  onActivate,
  onDeactivate,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-white/10">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900" />

      {/* Decorative glowing elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMyIgY3k9IjMiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-20" />

      {/* Power-Ups Header */}
      <div className="relative z-10 bg-gradient-to-r from-indigo-800/80 via-purple-800/80 to-indigo-800/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400 blur-xl opacity-50 animate-pulse" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <span className="text-3xl">⚡</span>
                </div>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  Power <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Lab</span>
                </h2>
                <div className="flex items-center gap-3 mt-2 text-indigo-100/80 text-sm">
                  <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                    Level {level} • {Math.floor(xp)} XP
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 text-amber-200">
                    {streak} day streak
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 text-emerald-200">
                    {Math.ceil(xpProgress)}% to next level
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => streak >= 14 && onActivate('streak_x2')}
                disabled={streak < 14 || powerUps.some((p) => p.id === 'streak_x2' && p.active)}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  streak >= 14 && !powerUps.some((p) => p.id === 'streak_x2' && p.active)
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/30 active:scale-95'
                    : 'bg-white/10 text-indigo-300 cursor-not-allowed opacity-50'
                }`}
                title={streak >= 14 ? 'Activate Streak x2' : 'Need 14+ day streak'}
              >
                <span className="text-lg">🔥</span>
                Streak x2
              </button>

              <button
                onClick={() => onActivate('bonus_x15')}
                className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center gap-2"
              >
                <span className="text-lg">✨</span>
                Bonus +15
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Power-Ups Grid */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {powerUps.map((powerUp) => (
            <PowerUpCard
              key={powerUp.id}
              powerUp={powerUp}
              onActivate={onActivate}
              onDeactivate={onDeactivate}
            />
          ))}
        </div>

        {/* Power-Ups Footer */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm">
              <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <h4 className="font-bold text-white">Streak Multiplier</h4>
                <p className="text-sm text-indigo-200/70">
                  Your streak level multiplies all XP earnings
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm">
              <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h4 className="font-bold text-white">Power-Up Boost</h4>
                <p className="text-sm text-indigo-200/70">
                  Activate power-ups to multiply XP even further
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm">
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h4 className="font-bold text-white">High Priority Bonus</h4>
                <p className="text-sm text-indigo-200/70">
                  High priority tasks give more XP
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
