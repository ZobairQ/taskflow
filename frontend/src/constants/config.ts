/**
 * Application Configuration
 * All configurable values with type safety
 */

// API Configuration
export const API_CONFIG = {
  GRAPHQL_URI: process.env.REACT_APP_GRAPHQL_URI || 'http://localhost:4000/graphql',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
  TOKEN_COOKIE_NAME: 'taskflow_token',
  REFRESH_TOKEN_COOKIE_NAME: 'taskflow_refresh_token',
  COOKIE_DOMAIN: process.env.REACT_APP_COOKIE_DOMAIN || 'localhost',
  COOKIE_SECURE: process.env.NODE_ENV === 'production',
  COOKIE_SAME_SITE: 'lax' as 'lax' | 'strict',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  USER_DATA: 'user',
  THEME: 'taskflow_theme',
  SIDEBAR: 'taskflow_sidebar',
} as const;

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 5000, // 5 seconds
  DEBOUNCE_DELAY: 100, // 100ms for input debouncing
  DEBOUNCE_DELAY_LONG: 300, // 300ms for API calls
} as const;

// Pagination defaults
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  TASK_DEFAULT_LIMIT: 50,
  TASK_MAX_LIMIT: 100,
  PROJECT_DEFAULT_LIMIT: 20,
} as const;

// Validation limits
export const VALIDATION_LIMITS = {
  TASK_TEXT_MAX: 500,
  TASK_DESCRIPTION_MAX: 5000,
  PROJECT_NAME_MAX: 100,
  PROJECT_DESCRIPTION_MAX: 500,
  USER_NAME_MAX: 100,
  EMAIL_MAX: 255,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
} as const;

// Local storage keys
export const LOCAL_STORAGE_KEYS = {
  USER_DATA: 'user',
  TOKEN: 'token',
  REFRESH_TOKEN: `refreshToken`,
  THEME: 'taskflow_theme',
  SIDEBAR_STATE: 'taskflow_sidebar',
} as const;
