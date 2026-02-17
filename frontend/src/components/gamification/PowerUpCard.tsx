/**
 * Power-up card component
 */

import React from 'react';
import { PowerUp } from '../../types';

interface PowerUpCardProps {
  powerUp: PowerUp;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
}

export const PowerUpCard: React.FC<PowerUpCardProps> = ({
  powerUp,
  onActivate,
  onDeactivate,
}) => {
  const isActive = powerUp.active;
  const isLegendary = powerUp.id === 'streak_x3' || powerUp.id === 'focus_mode';
  const isBonus = powerUp.id === 'bonus_x15';
  const isStreakX2 = powerUp.id === 'streak_x2';

  const getCardStyle = () => {
    if (!isActive) {
      return 'bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:scale-102 hover:shadow-xl';
    }
    if (isLegendary) {
      return 'bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 shadow-2xl shadow-orange-500/40 scale-105 ring-2 ring-amber-400 animate-pulse-slow';
    }
    if (isBonus) {
      return 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 shadow-2xl shadow-emerald-500/40 scale-105 ring-2 ring-emerald-400';
    }
    if (isStreakX2) {
      return 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-2xl shadow-indigo-500/40 scale-105 ring-2 ring-blue-400';
    }
    return 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 shadow-2xl shadow-slate-500/40 scale-105';
  };

  const getMultiplierStyle = () => {
    if (!isActive) return 'bg-white/5 text-indigo-200';
    if (isLegendary) return 'bg-black/20 text-amber-200';
    if (isBonus) return 'bg-black/20 text-emerald-200';
    if (isStreakX2) return 'bg-black/20 text-blue-200';
    return 'bg-black/20 text-slate-200';
  };

  const getProgressBarColor = () => {
    if (isLegendary) return 'bg-gradient-to-r from-amber-300 to-orange-400';
    if (isBonus) return 'bg-gradient-to-r from-emerald-300 to-teal-400';
    if (isStreakX2) return 'bg-gradient-to-r from-blue-300 to-indigo-400';
    return 'bg-gradient-to-r from-slate-300 to-slate-400';
  };

  const getButtonStyle = () => {
    if (!isActive) {
      return 'bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40';
    }
    return 'bg-white/20 hover:bg-white/30 text-white border border-white/30';
  };

  return (
    <div className={`group relative p-5 rounded-2xl transition-all duration-300 ${getCardStyle()}`}>
      {isActive && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl ${isActive ? 'bg-white/20' : 'bg-white/10'}`}>
          {powerUp.icon}
        </div>
        <div>
          <h3 className={`font-bold text-lg ${isActive ? 'text-white' : 'text-indigo-100'}`}>
            {powerUp.name}
          </h3>
          <p className="text-xs text-indigo-200/80 mt-1">{powerUp.description}</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Multiplier badge */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${getMultiplierStyle()}`}>
            <span className="text-sm font-bold">Multiplier:</span>
            <span className="font-black text-lg">{powerUp.multiplier}x</span>
          </div>
          {isActive && powerUp.expiresAt && (
            <div className="text-right">
              <div className="text-xs text-indigo-200/60">Expires in</div>
              <div className="text-sm font-mono font-bold text-white">
                {Math.ceil((powerUp.expiresAt - Date.now()) / 1000 / 60)}m
              </div>
            </div>
          )}
        </div>

        {/* Progress bar for active power-ups */}
        {isActive && powerUp.expiresAt && (
          <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${getProgressBarColor()}`}
              style={{
                width: `${Math.min(100, Math.max(0, ((powerUp.expiresAt - Date.now()) / (powerUp.duration * 60 * 1000)) * 100))}%`,
              }}
            />
          </div>
        )}

        {/* Action button */}
        <button
          onClick={() => (isActive ? onDeactivate(powerUp.id) : onActivate(powerUp.id))}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${getButtonStyle()}`}
        >
          {isActive ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Deactivate
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Activate
            </>
          )}
        </button>
      </div>

      {/* Glow effect for active power-ups */}
      {isActive && (
        <div
          className={`absolute inset-0 rounded-2xl blur-2xl opacity-30 pointer-events-none -z-10 ${
            isLegendary
              ? 'bg-amber-500'
              : isBonus
              ? 'bg-emerald-500'
              : isStreakX2
              ? 'bg-blue-500'
              : 'bg-slate-500'
          }`}
        />
      )}
    </div>
  );
};
