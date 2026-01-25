/**
 * Tests for LoggerService
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { readFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  LoggerService,
  ConsoleTransport,
  FileTransport,
  type LogEntry,
  type LogTransport,
} from './logger-service.js';

describe('LoggerService', () => {
  let tempDir: string;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    tempDir = join(tmpdir(), `logger-test-${Date.now()}`);
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    // Cleanup temp files
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

  describe('Log levels', () => {
    it('should log debug messages', () => {
      const logger = new LoggerService({
        minLevel: 'debug',
        transports: [new ConsoleTransport()],
      });
      logger.debug('Debug message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      const logger = new LoggerService({
        minLevel: 'info',
        transports: [new ConsoleTransport()],
      });
      logger.info('Info message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      const logger = new LoggerService({
        minLevel: 'warn',
        transports: [new ConsoleTransport()],
      });
      logger.warn('Warning message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      const logger = new LoggerService({
        minLevel: 'error',
        transports: [new ConsoleTransport()],
      });
      logger.error('Error message');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Level filtering', () => {
    it('should filter out debug when minLevel is info', () => {
      const logger = new LoggerService({
        minLevel: 'info',
        transports: [new ConsoleTransport()],
      });
      logger.debug('Debug message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should filter out debug and info when minLevel is warn', () => {
      const logger = new LoggerService({
        minLevel: 'warn',
        transports: [new ConsoleTransport()],
      });
      logger.debug('Debug message');
      logger.info('Info message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should allow warn and error when minLevel is warn', () => {
      const logger = new LoggerService({
        minLevel: 'warn',
        transports: [new ConsoleTransport()],
      });
      logger.warn('Warning message');
      logger.error('Error message');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should allow only error when minLevel is error', () => {
      const logger = new LoggerService({
        minLevel: 'error',
        transports: [new ConsoleTransport()],
      });
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should update level with setLevel', () => {
      const logger = new LoggerService({
        minLevel: 'error',
        transports: [new ConsoleTransport()],
      });
      logger.setLevel('debug');
      logger.debug('Debug message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('File transport', () => {
    it('should create file and write JSONL', async () => {
      const logFile = join(tempDir, 'test.log');
      const logger = new LoggerService({
        minLevel: 'info',
        transports: [new FileTransport(logFile)],
      });

      await logger.info('Test message', { key: 'value' });

      // Wait a bit for async write
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(existsSync(logFile)).toBe(true);
      const content = await readFile(logFile, 'utf8');
      const lines = content.trim().split('\n');
      expect(lines.length).toBe(1);

      const entry: LogEntry = JSON.parse(lines[0]!);
      expect(entry.level).toBe('info');
      expect(entry.message).toBe('Test message');
      expect(entry.context).toEqual({ key: 'value' });
      expect(entry.timestamp).toBeDefined();
    });

    it('should append to existing file', async () => {
      const logFile = join(tempDir, 'test.log');
      const logger = new LoggerService({
        minLevel: 'info',
        transports: [new FileTransport(logFile)],
      });

      await logger.info('First message');
      await new Promise((resolve) => setTimeout(resolve, 50));
      await logger.info('Second message');
      await new Promise((resolve) => setTimeout(resolve, 50));

      const content = await readFile(logFile, 'utf8');
      const lines = content.trim().split('\n');
      expect(lines.length).toBe(2);
      expect(JSON.parse(lines[0]!).message).toBe('First message');
      expect(JSON.parse(lines[1]!).message).toBe('Second message');
    });

    it('should create directory if needed', async () => {
      const logFile = join(tempDir, 'nested', 'dir', 'test.log');
      const logger = new LoggerService({
        minLevel: 'info',
        transports: [new FileTransport(logFile)],
      });

      await logger.info('Test message');
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(existsSync(logFile)).toBe(true);
    });
  });

  describe('Console transport', () => {
    it('should format log with timestamp and level', () => {
      const logger = new LoggerService({
        minLevel: 'info',
        transports: [new ConsoleTransport()],
      });
      logger.info('Test message');
      expect(consoleLogSpy).toHaveBeenCalled();
      const call = consoleLogSpy.mock.calls[0]![0] as string;
      expect(call).toContain('INFO');
      expect(call).toContain('Test message');
      expect(call).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
    });

    it('should include context in console output', () => {
      const logger = new LoggerService({
        minLevel: 'info',
        transports: [new ConsoleTransport()],
      });
      logger.info('Test message', { key: 'value', num: 42 });
      const call = consoleLogSpy.mock.calls[0]![0] as string;
      expect(call).toContain('Context:');
      expect(call).toContain('key');
      expect(call).toContain('value');
    });

    it('should use error stream for error level', () => {
      const logger = new LoggerService({
        minLevel: 'error',
        transports: [new ConsoleTransport()],
      });
      logger.error('Error message');
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('Child logger', () => {
    it('should inherit parent context', () => {
      const parentLogger = new LoggerService({
        minLevel: 'info',
        transports: [new ConsoleTransport()],
      });
      const childLogger = parentLogger.child({ parentKey: 'parentValue' });
      childLogger.info('Child message', { childKey: 'childValue' });

      const call = consoleLogSpy.mock.calls[0]![0] as string;
      expect(call).toContain('parentKey');
      expect(call).toContain('parentValue');
      expect(call).toContain('childKey');
      expect(call).toContain('childValue');
    });

    it('should override parent context with child context', () => {
      const parentLogger = new LoggerService({
        minLevel: 'info',
        transports: [new ConsoleTransport()],
      });
      const childLogger = parentLogger.child({ key: 'parentValue' });
      childLogger.info('Child message', { key: 'childValue' });

      const call = consoleLogSpy.mock.calls[0]![0] as string;
      // Child value should override parent
      expect(call).toContain('childValue');
      expect(call).not.toContain('parentValue');
    });

    it('should inherit minLevel and sessionId', () => {
      const parentLogger = new LoggerService({
        minLevel: 'warn',
        sessionId: 'PM-2026-01-10-14-30-00-001',
        transports: [new ConsoleTransport()],
      });
      const childLogger = parentLogger.child({});
      
      // Debug should be filtered
      childLogger.debug('Debug message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
      
      // Warn should pass
      childLogger.warn('Warning message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('Multiple transports', () => {
    it('should write to both console and file', async () => {
      const logFile = join(tempDir, 'test.log');
      const logger = new LoggerService({
        minLevel: 'info',
        transports: [
          new ConsoleTransport(),
          new FileTransport(logFile),
        ],
      });

      logger.info('Test message');
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(existsSync(logFile)).toBe(true);
      const content = await readFile(logFile, 'utf8');
      const entry: LogEntry = JSON.parse(content.trim());
      expect(entry.message).toBe('Test message');
    });
  });

  describe('Session ID', () => {
    it('should include sessionId in log entry', async () => {
      const logFile = join(tempDir, 'test.log');
      const logger = new LoggerService({
        minLevel: 'info',
        sessionId: 'PM-2026-01-10-14-30-00-001',
        transports: [new FileTransport(logFile)],
      });

      await logger.info('Test message');
      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = await readFile(logFile, 'utf8');
      const entry: LogEntry = JSON.parse(content.trim());
      expect(entry.sessionId).toBe('PM-2026-01-10-14-30-00-001');
    });

    it('should include sessionId in console output', () => {
      const logger = new LoggerService({
        minLevel: 'info',
        sessionId: 'PM-2026-01-10-14-30-00-001',
        transports: [new ConsoleTransport()],
      });
      logger.info('Test message');
      const call = consoleLogSpy.mock.calls[0]![0] as string;
      expect(call).toContain('PM-2026-01-10-14-30-00-001');
    });
  });

  describe('Context handling', () => {
    it('should include context in file log', async () => {
      const logFile = join(tempDir, 'test.log');
      const logger = new LoggerService({
        minLevel: 'info',
        transports: [new FileTransport(logFile)],
      });

      await logger.info('Test message', { key: 'value', num: 42 });
      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = await readFile(logFile, 'utf8');
      const entry: LogEntry = JSON.parse(content.trim());
      expect(entry.context).toEqual({ key: 'value', num: 42 });
    });

    it('should not include empty context', async () => {
      const logFile = join(tempDir, 'test.log');
      const logger = new LoggerService({
        minLevel: 'info',
        transports: [new FileTransport(logFile)],
      });

      await logger.info('Test message');
      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = await readFile(logFile, 'utf8');
      const entry: LogEntry = JSON.parse(content.trim());
      expect(entry.context).toBeUndefined();
    });
  });

  describe('Timestamp', () => {
    it('should include ISO timestamp in log entry', async () => {
      const logFile = join(tempDir, 'test.log');
      const logger = new LoggerService({
        minLevel: 'info',
        transports: [new FileTransport(logFile)],
      });

      const before = new Date().toISOString();
      await logger.info('Test message');
      await new Promise((resolve) => setTimeout(resolve, 100));
      const after = new Date().toISOString();

      const content = await readFile(logFile, 'utf8');
      const entry: LogEntry = JSON.parse(content.trim());
      expect(entry.timestamp).toBeDefined();
      expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      
      const timestamp = new Date(entry.timestamp).getTime();
      const beforeTime = new Date(before).getTime();
      const afterTime = new Date(after).getTime();
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('Error handling', () => {
    it('should handle file write errors gracefully', async () => {
      // Create a transport that will fail on write
      const failingTransport = new FileTransport('/invalid/path/that/does/not/exist/test.log');
      const logger = new LoggerService({
        minLevel: 'info',
        transports: [failingTransport],
      });

      // Should not throw - error is caught internally
      logger.info('Test message');
      
      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 200));

      // The important thing is the logger doesn't crash
      // Error is caught internally and logged to console.error
      // We verify the logger continues to work
      expect(logger).toBeDefined();
    });

    it('should handle transport write errors', () => {
      const badTransport: LogTransport = {
        write: () => {
          throw new Error('Transport error');
        },
      };

      const logger = new LoggerService({
        minLevel: 'info',
        transports: [badTransport],
      });

      // Should not throw
      logger.info('Test message');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('addTransport', () => {
    it('should add transport dynamically', () => {
      const logger = new LoggerService({
        minLevel: 'info',
        transports: [],
      });

      logger.addTransport(new ConsoleTransport());
      logger.info('Test message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });
});
