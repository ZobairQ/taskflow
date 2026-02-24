/**
 * Application Constants
 * Centralized configuration to avoid magic numbers/strings
 */

// Authentication Configuration
export const AUTH_CONFIG = {
  // Token expiration times
  ACCESS_TOKEN_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  REFRESH_TOKEN_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',

  // Bcrypt configuration
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),

  // Cookie names
  COOKIE_NAMES: {
    ACCESS_TOKEN: 'taskflow_access_token',
    REFRESH_TOKEN: 'taskflow_refresh_token',
  },

  // Cookie configuration
  COOKIE: {
    HTTP_ONLY: true,
    SECURE: process.env.NODE_ENV === 'production',
    SAME_SITE: process.env.NODE_ENV === 'production' ? ('strict' as const) : ('lax' as const),
    ACCESS_TOKEN_MAX_AGE: 15 * 60 * 1000, // 15 minutes in ms
    REFRESH_TOKEN_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  },
} as const;

// Gamification Configuration
export const GAMIFICATION_CONFIG = {
  // XP rewards by task priority
  XP_REWARDS: {
    high: 50,
    medium: 25,
    low: 10,
  } as const,

  // XP for completing a pomodoro session
  POMODORO_XP: 10,

  // Level calculation
  XP_BASE: 100,
  XP_MULTIPLIER: 1.5,

  // Streak bonuses
  STREAK_MULTIPLIERS: {
    3: 1.25,
    7: 1.5,
    14: 2.0,
    30: 3.0,
  } as const,
} as const;

// Pagination defaults
export const PAGINATION_CONFIG = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
} as const;

// Task configuration
export const TASK_CONFIG = {
  MAX_TEXT_LENGTH: 500,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_SUBTASKS: 20,
} as const;

// Rate limiting (for future use)
export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
} as const;
