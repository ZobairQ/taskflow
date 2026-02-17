/**
 * Task categories
 */

export const CATEGORIES = ['Personal', 'Work', 'Shopping', 'Health', 'Urgent'] as const;
export type Category = typeof CATEGORIES[number];
