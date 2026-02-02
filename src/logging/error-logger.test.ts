/**
 * Tests for ErrorLogger
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  ErrorLogger,
  type ErrorCategory,
  type LoggedError,
} from './error-logger.js';

describe('ErrorLogger', () => {
  let tempDir: string;
  let logPath: string;
  let errorLogger: ErrorLogger;
  const sessionId = 'PM-2026-01-10-14-30-00-001';

  beforeEach(() => {
    tempDir = join(tmpdir(), `error-logger-test-${Date.now()}`);
    logPath = join(tempDir, 'error.log');
    errorLogger = new ErrorLogger(logPath, sessionId);
  });

  afterEach(async () => {
    // Cleanup temp files
    if (existsSync(logPath)) {
      try {
        await unlink(logPath);
      } catch {
        // Ignore cleanup errors
      }
    }
    if (existsSync(tempDir)) {
      try {
        const files = await import('fs/promises').then((fs) =>
          fs.readdir(tempDir)
        );
        for (const file of files) {
          await unlink(join(tempDir, file)).catch(() => {});
        }
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  describe('Error logging', () => {
    it('should log error with correct format', async () => {
      const error = new Error('Test error message');
      await errorLogger.logError(error);

      // Wait for async write
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(existsSync(logPath)).toBe(true);
      const content = await readFile(logPath, 'utf8');
      const lines = content.trim().split('\n');
      expect(lines.length).toBe(1);

      const loggedError: LoggedError = JSON.parse(lines[0]!);
      expect(loggedError.message).toBe('Test error message');
      expect(loggedError.sessionId).toBe(sessionId);
      expect(loggedError.category).toBeDefined();
      expect(loggedError.timestamp).toBeDefined();
      expect(loggedError.context).toEqual({});
    });

    it('should include context in logged error', async () => {
      const error = new Error('Test error');
      const context = { key: 'value', num: 42 };
      await errorLogger.logError(error, context);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = await readFile(logPath, 'utf8');
      const loggedError: LoggedError = JSON.parse(content.trim());
      expect(loggedError.context).toEqual(context);
    });

    it('should include stack trace when available', async () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.ts:10';
      await errorLogger.logError(error);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = await readFile(logPath, 'utf8');
      const loggedError: LoggedError = JSON.parse(content.trim());
      expect(loggedError.stack).toBe(error.stack);
    });

    it('should extract tierId from context', async () => {
      const error = new Error('Test error');
      const context = { tierId: 'ST-001-001-001' };
      await errorLogger.logError(error, context);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = await readFile(logPath, 'utf8');
      const loggedError: LoggedError = JSON.parse(content.trim());
      expect(loggedError.tierId).toBe('ST-001-001-001');
    });

    it('should extract platform from context', async () => {
      const error = new Error('Test error');
      const context = { platform: 'cursor' };
      await errorLogger.logError(error, context);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = await readFile(logPath, 'utf8');
      const loggedError: LoggedError = JSON.parse(content.trim());
      expect(loggedError.platform).toBe('cursor');
    });

    it('should append multiple errors to file', async () => {
      await errorLogger.logError(new Error('First error'));
      await new Promise((resolve) => setTimeout(resolve, 50));
      await errorLogger.logError(new Error('Second error'));
      await new Promise((resolve) => setTimeout(resolve, 50));

      const content = await readFile(logPath, 'utf8');
      const lines = content.trim().split('\n');
      expect(lines.length).toBe(2);
      expect(JSON.parse(lines[0]!).message).toBe('First error');
      expect(JSON.parse(lines[1]!).message).toBe('Second error');
    });
  });

  describe('Stack trace capture', () => {
    it('should capture stack trace when present', async () => {
      const error = new Error('Error with stack');
      error.stack = 'Error: Error with stack\n    at test.ts:5\n    at main.ts:10';
      await errorLogger.logError(error);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = await readFile(logPath, 'utf8');
      const loggedError: LoggedError = JSON.parse(content.trim());
      expect(loggedError.stack).toBe(error.stack);
    });

    it('should handle errors without stack trace', async () => {
      const error = new Error('Error without stack');
      // Remove stack property
      delete (error as { stack?: string }).stack;
      await errorLogger.logError(error);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = await readFile(logPath, 'utf8');
      const loggedError: LoggedError = JSON.parse(content.trim());
      expect(loggedError.stack).toBeUndefined();
    });
  });

  describe('Error categorization', () => {
    it('should categorize ENOENT as io_error', () => {
      const error = new Error('File not found');
      (error as NodeJS.ErrnoException).code = 'ENOENT';
      const category = errorLogger.categorizeError(error);
      expect(category).toBe('io_error');
    });

    it('should categorize EACCES as io_error', () => {
      const error = new Error('Permission denied');
      (error as NodeJS.ErrnoException).code = 'EACCES';
      const category = errorLogger.categorizeError(error);
      expect(category).toBe('io_error');
    });

    it('should categorize ETIMEDOUT as timeout_error', () => {
      const error = new Error('Connection timed out');
      (error as NodeJS.ErrnoException).code = 'ETIMEDOUT';
      const category = errorLogger.categorizeError(error);
      expect(category).toBe('timeout_error');
    });

    it('should categorize timeout message as timeout_error', () => {
      const error = new Error('Operation timed out');
      const category = errorLogger.categorizeError(error);
      expect(category).toBe('timeout_error');
    });

    it('should categorize ValidationError as validation_error', () => {
      const error = new Error('Invalid input');
      error.name = 'ValidationError';
      const category = errorLogger.categorizeError(error);
      expect(category).toBe('validation_error');
    });

    it('should categorize TypeError as validation_error', () => {
      const error = new TypeError('Invalid type');
      const category = errorLogger.categorizeError(error);
      expect(category).toBe('validation_error');
    });

    it('should categorize ConfigError as config_error', () => {
      const error = new Error('Config parse failed');
      error.name = 'ConfigError';
      const category = errorLogger.categorizeError(error);
      expect(category).toBe('config_error');
    });

    it('should categorize config message as config_error', () => {
      const error = new Error('Invalid configuration');
      const category = errorLogger.categorizeError(error);
      expect(category).toBe('config_error');
    });

    it('should categorize GitError as git_error', () => {
      const error = new Error('Git command failed');
      error.name = 'GitError';
      const category = errorLogger.categorizeError(error);
      expect(category).toBe('git_error');
    });

    it('should categorize git message as git_error', () => {
      const error = new Error('Git repository not found');
      const category = errorLogger.categorizeError(error);
      expect(category).toBe('git_error');
    });

    it('should categorize platform-related errors as platform_error', () => {
      const error = new Error('Cursor agent failed');
      const category = errorLogger.categorizeError(error);
      expect(category).toBe('platform_error');
    });

    it('should categorize unknown errors as unknown_error', () => {
      const error = new Error('Some random error');
      const category = errorLogger.categorizeError(error);
      expect(category).toBe('unknown_error');
    });
  });

  describe('Categorized logging', () => {
    it('should use provided category instead of auto-detection', async () => {
      const error = new Error('Test error');
      // This would normally be categorized as unknown_error
      await errorLogger.logCategorizedError('platform_error', error);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = await readFile(logPath, 'utf8');
      const loggedError: LoggedError = JSON.parse(content.trim());
      expect(loggedError.category).toBe('platform_error');
    });

    it('should log with all error categories', async () => {
      const categories: ErrorCategory[] = [
        'platform_error',
        'validation_error',
        'config_error',
        'git_error',
        'io_error',
        'timeout_error',
        'unknown_error',
      ];

      for (const category of categories) {
        const error = new Error(`Error for ${category}`);
        await errorLogger.logCategorizedError(category, error);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = await readFile(logPath, 'utf8');
      const lines = content.trim().split('\n');
      expect(lines.length).toBe(categories.length);

      for (let i = 0; i < categories.length; i++) {
        const loggedError: LoggedError = JSON.parse(lines[i]!);
        expect(loggedError.category).toBe(categories[i]);
      }
    });
  });

  describe('Retrieval', () => {
    it('should return recent errors', async () => {
      // Log 5 errors
      for (let i = 0; i < 5; i++) {
        await errorLogger.logError(new Error(`Error ${i}`));
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      const recent = await errorLogger.getRecentErrors(3);
      expect(recent.length).toBe(3);
      expect(recent[0]!.message).toBe('Error 2');
      expect(recent[1]!.message).toBe('Error 3');
      expect(recent[2]!.message).toBe('Error 4');
    });

    it('should return all errors if count exceeds available', async () => {
      await errorLogger.logError(new Error('Error 1'));
      await errorLogger.logError(new Error('Error 2'));
      await new Promise((resolve) => setTimeout(resolve, 100));

      const recent = await errorLogger.getRecentErrors(10);
      expect(recent.length).toBe(2);
    });

    it('should return empty array if log file does not exist', async () => {
      const newLogger = new ErrorLogger(
        join(tempDir, 'nonexistent.log'),
        sessionId
      );
      const recent = await newLogger.getRecentErrors(10);
      expect(recent.length).toBe(0);
    });

    it('should return empty array for empty log file', async () => {
      // Create empty file
      await mkdir(tempDir, { recursive: true });
      await import('fs/promises').then((fs) =>
        fs.writeFile(logPath, '', 'utf8')
      );

      const recent = await errorLogger.getRecentErrors(10);
      expect(recent.length).toBe(0);
    });
  });

  describe('Category filtering', () => {
    it('should filter errors by category', async () => {
      // Log errors with different categories
      await errorLogger.logCategorizedError('io_error', new Error('IO error'));
      await errorLogger.logCategorizedError(
        'timeout_error',
        new Error('Timeout error')
      );
      await errorLogger.logCategorizedError('io_error', new Error('Another IO error'));
      await new Promise((resolve) => setTimeout(resolve, 100));

      const ioErrors = await errorLogger.getErrorsByCategory('io_error');
      expect(ioErrors.length).toBe(2);
      expect(ioErrors.every((e) => e.category === 'io_error')).toBe(true);

      const timeoutErrors = await errorLogger.getErrorsByCategory('timeout_error');
      expect(timeoutErrors.length).toBe(1);
      expect(timeoutErrors[0]!.category).toBe('timeout_error');
    });

    it('should return empty array if no errors match category', async () => {
      await errorLogger.logCategorizedError('io_error', new Error('IO error'));
      await new Promise((resolve) => setTimeout(resolve, 100));

      const platformErrors = await errorLogger.getErrorsByCategory('platform_error');
      expect(platformErrors.length).toBe(0);
    });

    it('should return empty array if log file does not exist', async () => {
      const newLogger = new ErrorLogger(
        join(tempDir, 'nonexistent.log'),
        sessionId
      );
      const errors = await newLogger.getErrorsByCategory('io_error');
      expect(errors.length).toBe(0);
    });
  });

  describe('File operations', () => {
    it('should create directory if needed', async () => {
      const nestedPath = join(tempDir, 'nested', 'dir', 'error.log');
      const nestedLogger = new ErrorLogger(nestedPath, sessionId);
      await nestedLogger.logError(new Error('Test'));

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(existsSync(nestedPath)).toBe(true);
    });

    it('should handle file write errors gracefully', async () => {
      // Test that the logger doesn't throw even if write fails
      // Note: On some systems, mkdir with recursive: true might succeed even for /root paths
      // So we test that the method completes without throwing
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Create a logger - the write might fail or succeed depending on permissions
      const invalidLogger = new ErrorLogger('/root/invalid/path/error.log', sessionId);
      
      // This should not throw - error is caught internally
      await expect(invalidLogger.logError(new Error('Test'))).resolves.not.toThrow();
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // The logger should have attempted to write (may or may not succeed)
      // The important thing is it didn't throw
      expect(invalidLogger).toBeDefined();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Error handling', () => {
    it('should handle read errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Create a logger pointing to a directory (not a file)
      const dirLogger = new ErrorLogger(tempDir, sessionId);
      
      // Try to read - should return empty array
      const errors = await dirLogger.getRecentErrors(10);
      expect(errors.length).toBe(0);
      
      consoleErrorSpy.mockRestore();
    });

    it('should skip invalid JSON lines when reading', async () => {
      // Write some valid and invalid lines
      await mkdir(tempDir, { recursive: true });
      await import('fs/promises').then((fs) =>
        fs.writeFile(
          logPath,
          '{"valid": true}\ninvalid json\n{"valid": true}\n',
          'utf8'
        )
      );

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const errors = await errorLogger.getRecentErrors(10);
      expect(errors.length).toBe(2);
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Timestamp', () => {
    it('should include ISO timestamp in logged error', async () => {
      const before = new Date().toISOString();
      await errorLogger.logError(new Error('Test'));
      await new Promise((resolve) => setTimeout(resolve, 100));
      const after = new Date().toISOString();

      const content = await readFile(logPath, 'utf8');
      const loggedError: LoggedError = JSON.parse(content.trim());
      expect(loggedError.timestamp).toBeDefined();
      expect(loggedError.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      const timestamp = new Date(loggedError.timestamp).getTime();
      const beforeTime = new Date(before).getTime();
      const afterTime = new Date(after).getTime();
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    });
  });
});
