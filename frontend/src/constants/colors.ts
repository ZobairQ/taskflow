/**
 * Color configurations for projects and gamification
 */

// Project colors (hex format for backend validation)
export const PROJECT_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#14b8a6', // teal
  '#64748b', // slate
  '#0ea5e9', // sky
  '#dc2626', // red
  '#9333ea', // violet
];

// Level colors for gamification display
export const LEVEL_COLORS = [
  'text-slate-500',
  'text-blue-500',
  'text-emerald-500',
  'text-green-500',
  'text-amber-500',
  'text-rose-500',
  'text-fuchsia-500',
  'text-indigo-500',
  'text-cyan-500',
  'text-purple-500',
];

// Level gradients for gamification cards
export const LEVEL_GRADIENTS: Record<number, string> = {
  1: 'from-slate-500 to-slate-600',
  2: 'from-blue-500 to-cyan-600',
  3: 'from-emerald-500 to-teal-600',
  4: 'from-green-500 to-emerald-600',
  5: 'from-amber-500 to-orange-600',
  6: 'from-rose-500 to-pink-600',
  7: 'from-fuchsia-500 to-purple-600',
  8: 'from-indigo-500 to-purple-600',
  9: 'from-cyan-500 to-blue-600',
  10: 'from-purple-500 to-violet-600',
};
