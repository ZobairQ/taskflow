/**
 * Winston Logger Configuration
 * Structured logging with multiple transports
 */

import winston from 'winston';
import { LOG_LEVEL, isDevelopment, isProduction } from '../config';

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, module, ...metadata }) => {
    let log = `[${timestamp}] ${level}`;
    if (module) {
      log += ` [${module}]`;
    }
    log += `: ${message}`;
    if (Object.keys(metadata).length > 0) {
      log += ` ${JSON.stringify(metadata)}`;
    }
    return log;
  })
);

// JSON format for production
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create the base logger
export const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: jsonFormat,
  defaultMeta: { service: 'taskflow-api' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: isDevelopment ? consoleFormat : jsonFormat,
    }),
  ],
});

// Add file transports in production
if (isProduction) {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

/**
 * Create a child logger for a specific module
 * Usage: const log = createLogger('TaskService');
 */
export const createLogger = (module: string): winston.Logger => {
  return logger.child({ module });
};

// Export convenience methods
export const logInfo = (message: string, meta?: object) => logger.info(message, meta);
export const logError = (message: string, meta?: object) => logger.error(message, meta);
export const logWarn = (message: string, meta?: object) => logger.warn(message, meta);
export const logDebug = (message: string, meta?: object) => logger.debug(message, meta);

export default logger;
