/**
 * Error Logger for RWM Puppet Master
 * 
 * Provides specialized error logging with categorization, stack trace capture,
 * and query capabilities. Writes to .puppet-master/logs/error.log in JSONL format.
 */

import { appendFile, readFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { existsSync } from 'fs';
import type { Platform } from '../types/index.js';

/**
 * Error categories for classification
 */
export type ErrorCategory =
  | 'platform_error'
  | 'validation_error'
  | 'config_error'
  | 'git_error'
  | 'io_error'
  | 'timeout_error'
  | 'unknown_error';

/**
 * Logged error structure
 */
export interface LoggedError {
  timestamp: string;
  sessionId: string;
  category: ErrorCategory;
  message: string;
  stack?: string;
  context: Record<string, unknown>;
  tierId?: string;
  platform?: Platform;
}

/**
 * Error logger with categorization and query capabilities
 */
export class ErrorLogger {
  private readonly logPath: string;
  private readonly sessionId: string;
  private initialized = false;

  constructor(logPath: string, sessionId: string) {
    this.logPath = logPath;
    this.sessionId = sessionId;
  }

  /**
   * Ensure log directory exists
   */
  private async ensureLogDir(): Promise<void> {
    if (!this.initialized) {
      try {
        const dir = dirname(this.logPath);
        if (!existsSync(dir)) {
          await mkdir(dir, { recursive: true });
        }
        this.initialized = true;
      } catch (error) {
        // Log to console.error if directory creation fails
        console.error(
          `[ErrorLogger] Failed to create log directory for ${this.logPath}:`,
          error
        );
      }
    }
  }

  /**
   * Categorize an error based on its properties
   */
  categorizeError(error: Error): ErrorCategory {
    const code = (error as NodeJS.ErrnoException).code;
    const name = error.name;
    const message = error.message.toLowerCase();

    // IO errors
    if (
      code === 'ENOENT' ||
      code === 'EACCES' ||
      code === 'EISDIR' ||
      code === 'EMFILE' ||
      code === 'ENOTDIR' ||
      code === 'EEXIST'
    ) {
      return 'io_error';
    }

    // Timeout errors
    if (
      code === 'ETIMEDOUT' ||
      code === 'ECONNRESET' ||
      code === 'ECONNREFUSED' ||
      message.includes('timeout') ||
      message.includes('timed out')
    ) {
      return 'timeout_error';
    }

    // Config errors (check before validation to catch "invalid configuration")
    if (
      name.includes('Config') ||
      name === 'ConfigParseError' ||
      message.includes('config') ||
      message.includes('configuration')
    ) {
      return 'config_error';
    }

    // Validation errors
    if (
      name === 'ValidationError' ||
      name === 'TypeError' ||
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('malformed')
    ) {
      return 'validation_error';
    }

    // Git errors
    if (
      name.includes('Git') ||
      name === 'GitCommandError' ||
      message.includes('git') ||
      message.includes('repository')
    ) {
      return 'git_error';
    }

    // Platform errors (check for platform-specific patterns)
    if (
      message.includes('cursor') ||
      message.includes('codex') ||
      message.includes('claude') ||
      name.includes('Platform') ||
      name.includes('Runner')
    ) {
      return 'platform_error';
    }

    return 'unknown_error';
  }

  /**
   * Log an error with automatic categorization
   */
  async logError(
    error: Error,
    context?: Record<string, unknown>
  ): Promise<void> {
    const category = this.categorizeError(error);
    await this.logCategorizedError(category, error, context);
  }

  /**
   * Log an error with explicit category
   */
  async logCategorizedError(
    category: ErrorCategory,
    error: Error,
    context?: Record<string, unknown>
  ): Promise<void> {
    await this.ensureLogDir();

    const loggedError: LoggedError = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      category,
      message: error.message,
      stack: error.stack,
      context: context ?? {},
    };

    // Extract tierId and platform from context if present
    if (context?.tierId && typeof context.tierId === 'string') {
      loggedError.tierId = context.tierId;
    }
    if (context?.platform && typeof context.platform === 'string') {
      loggedError.platform = context.platform as Platform;
    }

    try {
      const line = JSON.stringify(loggedError) + '\n';
      await appendFile(this.logPath, line, 'utf8');
    } catch (writeError) {
      // Log to console.error if file write fails
      console.error(
        `[ErrorLogger] Failed to write to file ${this.logPath}:`,
        writeError
      );
    }
  }

  /**
   * Get recent errors from the log file
   */
  async getRecentErrors(count: number): Promise<LoggedError[]> {
    try {
      if (!existsSync(this.logPath)) {
        return [];
      }

      const content = await readFile(this.logPath, 'utf8');
      const lines = content.trim().split('\n').filter((line) => line.length > 0);

      // Get last N lines
      const recentLines = lines.slice(-count);
      const errors: LoggedError[] = [];

      for (const line of recentLines) {
        try {
          const error = JSON.parse(line) as LoggedError;
          errors.push(error);
        } catch (parseError) {
          // Skip invalid JSON lines
          console.warn(
            `[ErrorLogger] Failed to parse line in error.log:`,
            parseError
          );
        }
      }

      return errors;
    } catch (readError) {
      console.error(
        `[ErrorLogger] Failed to read error log ${this.logPath}:`,
        readError
      );
      return [];
    }
  }

  /**
   * Get errors filtered by category
   */
  async getErrorsByCategory(category: ErrorCategory): Promise<LoggedError[]> {
    try {
      if (!existsSync(this.logPath)) {
        return [];
      }

      const content = await readFile(this.logPath, 'utf8');
      const lines = content.trim().split('\n').filter((line) => line.length > 0);
      const errors: LoggedError[] = [];

      for (const line of lines) {
        try {
          const error = JSON.parse(line) as LoggedError;
          if (error.category === category) {
            errors.push(error);
          }
        } catch (parseError) {
          // Skip invalid JSON lines
          console.warn(
            `[ErrorLogger] Failed to parse line in error.log:`,
            parseError
          );
        }
      }

      return errors;
    } catch (readError) {
      console.error(
        `[ErrorLogger] Failed to read error log ${this.logPath}:`,
        readError
      );
      return [];
    }
  }
}
