/**
 * Environment Configuration with Zod Validation
 * Validates all required environment variables at startup
 */

import { z } from 'zod';

const envSchema = z.object({
  // Server configuration
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('4000'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // JWT configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Optional services
  REDIS_URL: z.string().optional(),
  SENTRY_DSN: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 * Throws error if validation fails
 */
function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `  - ${issue.path.join('.')}: ${issue.message}`
    );
    throw new Error(`Invalid environment configuration:\n${errors.join('\n')}`);
  }

  return result.data;
}

// Export validated config
export const env = validateEnv();

// Convenience exports
export const {
  NODE_ENV,
  PORT,
  DATABASE_URL,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  CORS_ORIGIN,
  REDIS_URL,
  SENTRY_DSN,
  LOG_LEVEL,
} = env;

// Derived values
export const isDevelopment = NODE_ENV === 'development';
export const isProduction = NODE_ENV === 'production';
export const isTest = NODE_ENV === 'test';
