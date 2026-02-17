/**
 * Date and time utility functions
 */

/**
 * Format a timestamp to a human-readable date string
 */
export function formatDate(timestamp: string | number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a timestamp to a full date string (with year)
 */
export function formatDateFull(timestamp: string | number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get a time-appropriate greeting based on the current hour
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Check if a date is overdue
 */
export function isOverdue(dateString: string): boolean {
  const dueDate = new Date(dateString);
  const now = new Date();
  return dueDate < now;
}

/**
 * Calculate days until/since a date
 */
export function getDaysUntil(dateString: string): number {
  const dueDate = new Date(dateString);
  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
