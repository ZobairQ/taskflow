/**
 * Input Sanitization Utilities
 * Prevents XSS and other injection attacks
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize a string for safe display
 * Removes any potential HTML/JS injection attempts
 */
export function sanitizeString(input: string): string {
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags
    ALLOWED_ATTR: [], // No additional attributes
  });
  return sanitized;
}

/**
 * Sanitize and truncate a string
 * @param maxLength - Maximum length (default: 200)
 */
export function sanitizeAndTruncate(input: string, maxLength: number = 200): string {
  const truncated = input.slice(0, maxLength);
  return sanitizeString(truncated);
}

/**
 * Validate and sanitize user input for forms
 * @param input - Raw user input
 * @param maxLength - Maximum length
 */
export function sanitizeUserInput(input: string, maxLength: number = 200): string {
  if (typeof input !== 'string') {
    return '';
  }
  return sanitizeAndTruncate(input, maxLength);
}
