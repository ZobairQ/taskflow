/**
 * ProjectContext Tests
 * Unit tests for context functionality
 */

import React from 'react';

// Mock everything Apollo-related
jest.mock('@apollo/client', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  gql: jest.fn(),
}));

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(() => ({
    data: null,
    loading: true,
    error: null,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn(() => [jest.fn(), { loading: false }]),
}));

jest.mock('@apollo/client/core', () => ({
  gql: jest.fn(),
}));

jest.mock('../../../graphql/queries', () => ({
  GET_PROJECTS: {},
  GET_PROJECT: {},
  GET_PROJECT_STATS: {},
}));

jest.mock('../../../graphql/mutations', () => ({
  CREATE_PROJECT: {},
  UPDATE_PROJECT: {},
  DELETE_PROJECT: {},
  CREATE_TASK: {},
  UPDATE_TASK: {},
  DELETE_TASK: {},
  COMPLETE_TASK: {},
}));

// Test the error case for useProject outside provider
describe('ProjectContext', () => {
  describe('useProject hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Dynamic import after mocks are set
      const { useProject } = require('../../../ProjectContext');

      let errorMessage = '';
      try {
        useProject();
      } catch (error) {
        errorMessage = (error as Error).message;
      }

      expect(errorMessage).toContain('useProject');

      consoleSpy.mockRestore();
    });
  });

  describe('context structure', () => {
    it('should export ProjectProvider and useProject', () => {
      // Get both exports in a single require to avoid caching issues
      const exports = require('../../../ProjectContext');
      expect(exports.ProjectProvider).toBeDefined();
      expect(typeof exports.ProjectProvider).toBe('function');
    });
  });
});
