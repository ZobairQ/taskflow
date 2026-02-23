/**
 * ESLint Configuration
 * Shared configuration for frontend and backend
 */

module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true,
    browser: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-non-null-assertion': 'warn',

    // General rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    eqeqeq: ['error', 'always'],

    // Prettier integration
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
  overrides: [
    {
      // Frontend specific
      files: ['frontend/**/*.ts', 'frontend/**/*.tsx'],
      env: {
        browser: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn', // Less strict for frontend during migration
      },
    },
    {
      // Backend specific
      files: ['backend/**/*.ts'],
      env: {
        node: true,
      },
    },
    {
      // Test files
      files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'build/',
    'dist/',
    'coverage/',
    '*.config.js',
    '*.d.ts',
  ],
};
