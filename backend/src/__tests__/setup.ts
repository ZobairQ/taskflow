/**
 * Jest Test Setup
 * Global configuration for all tests
 */

import { beforeAll, afterAll, afterEach } from '@jest/globals';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-must-be-at-least-32-characters!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-must-be-at-least-32-characters!';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/taskflow_test';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.LOG_LEVEL = 'error'; // Suppress logs during tests

// Mock console methods in tests to reduce noise
const originalConsole = { ...console };

beforeAll(() => {
  // Suppress console.log in tests
  console.log = jest.fn();
  console.info = jest.fn();
  console.debug = jest.fn();
});

afterAll(() => {
  // Restore console
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
});

afterEach(() => {
  // Clear all mocks after each test
  jest.clearAllMocks();
});

// Global error handlers
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection in test:', reason);
});
