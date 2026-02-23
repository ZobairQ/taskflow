/**
 * MSW Server Setup
 * Server for use in Node.js test environment (Jest)
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup requests interception using the given handlers
export const server = setupServer(...handlers);

// Setup and teardown helpers
export const setupMswServer = () => {
  // Enable API mocking before tests
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  // Reset any runtime request handlers tests may modify
  afterEach(() => server.resetHandlers());

  // Disable API mocking after tests
  afterAll(() => server.close());
};

// Helper to override handlers for specific tests
export const overrideHandlers = (...newHandlers: any[]) => {
  server.use(...newHandlers);
};

// Export handlers for custom test scenarios
export { handlers };
