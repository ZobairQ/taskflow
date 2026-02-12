/**
 * Color configurations for projects and gamification
 */

// Project gradient colors
export const PROJECT_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-blue-500 to-cyan-600',
  'from-violet-500 to-fuchsia-600',
  'from-slate-500 to-zinc-600',
  'from-lime-500 to-green-600',
] as const;

// Level gradient colors (cycling pattern)
export const LEVEL_GRADIENTS: Record<number, string> = {
  1: 'from-slate-500 to-slate-600',
  2: 'from-blue-500 to-cyan-500',
  3: 'from-emerald-500 to-teal-500',
  4: 'from-green-500 to-lime-500',
  5: 'from-amber-500 to-orange-500',
  6: 'from-orange-600 to-red-600',
  7: 'from-rose-500 to-pink-600',
  8: 'from-fuchsia-500 to-purple-600',
  9: 'from-indigo-500 to-violet-600',
  10: 'from-blue-600 to-indigo-600',
};

// Level text colors (cycling pattern)
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
