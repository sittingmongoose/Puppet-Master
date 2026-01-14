/**
 * Tests for LogStreamer
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { writeFile, appendFile, unlink, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { LogStreamer } from './log-streamer.js';
import type { LogEntry, LogLevel } from './logger-service.js';

describe('LogStreamer', () => {
  let tempDir: string;
  let logPath: string;

  beforeEach(async () => {
    tempDir = tmpdir();
    logPath = join(tempDir, `test-log-${Date.now()}.jsonl`);
  });

  afterEach(async () => {
    if (existsSync(logPath)) {
      await unlink(logPath);
    }
  });

  const createLogEntry = (
    level: LogLevel,
    message: string,
    timestamp?: string
  ): LogEntry => ({
    timestamp: timestamp ?? new Date().toISOString(),
    level,
    message,
  });

  const writeLogEntry = async (entry: LogEntry): Promise<void> => {
    const line = JSON.stringify(entry) + '\n';
    await appendFile(logPath, line, 'utf8');
  };

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const streamer = new LogStreamer({ logPath: '/tmp/test.log' });
      expect(streamer).toBeInstanceOf(LogStreamer);
    });

    it('should initialize with custom minLevel', () => {
      const streamer = new LogStreamer({
        logPath: '/tmp/test.log',
        minLevel: 'warn',
      });
      expect(streamer).toBeInstanceOf(LogStreamer);
    });

    it('should initialize with custom format', () => {
      const streamer = new LogStreamer({
        logPath: '/tmp/test.log',
        format: 'json',
      });
      expect(streamer).toBeInstanceOf(LogStreamer);
    });
  });

  describe('start', () => {
    it('should start watching an existing file', async () => {
      await writeFile(logPath, '', 'utf8');
      const streamer = new LogStreamer({ logPath });
      
      await streamer.start();
      
      // Should not throw
      streamer.stop();
    });

    it('should start watching a non-existent file', async () => {
      const streamer = new LogStreamer({ logPath });
      
      await streamer.start();
      
      // Should not throw
      streamer.stop();
    });

    it('should read existing content when starting', async () => {
      const entry = createLogEntry('info', 'Existing entry');
      await writeFile(logPath, JSON.stringify(entry) + '\n', 'utf8');
      
      const streamer = new LogStreamer({ logPath });
      const receivedEntries: LogEntry[] = [];
      
      streamer.onEntry((entry) => {
        receivedEntries.push(entry);
      });
      
      await streamer.start();
      
      // Wait a bit for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(receivedEntries.length).toBeGreaterThanOrEqual(1);
      expect(receivedEntries[0]!.message).toBe('Existing entry');
      
      streamer.stop();
    });

    it('should not start twice', async () => {
      await writeFile(logPath, '', 'utf8');
      const streamer = new LogStreamer({ logPath });
      
      await streamer.start();
      await streamer.start(); // Should be idempotent
      
      streamer.stop();
    });
  });

  describe('stop', () => {
    it('should stop watching', async () => {
      await writeFile(logPath, '', 'utf8');
      const streamer = new LogStreamer({ logPath });
      
      await streamer.start();
      streamer.stop();
      
      // Should not throw
      expect(true).toBe(true);
    });

    it('should clear callbacks', async () => {
      await writeFile(logPath, '', 'utf8');
      const streamer = new LogStreamer({ logPath });
      
      const callback = vi.fn();
      streamer.onEntry(callback);
      
      await streamer.start();
      streamer.stop();
      
      // Write after stop - callback should not be called
      await writeLogEntry(createLogEntry('info', 'After stop'));
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('onEntry', () => {
    it('should call callback when new entry is written', async () => {
      await writeFile(logPath, '', 'utf8');
      const streamer = new LogStreamer({ logPath });
      
      const receivedEntries: LogEntry[] = [];
      streamer.onEntry((entry) => {
        receivedEntries.push(entry);
      });
      
      await streamer.start();
      
      // Wait for initial read
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      // Write new entry
      await writeLogEntry(createLogEntry('info', 'New entry'));
      
      // Wait for file watch to trigger
      await new Promise((resolve) => setTimeout(resolve, 200));
      
      expect(receivedEntries.length).toBeGreaterThanOrEqual(1);
      expect(receivedEntries.some((e) => e.message === 'New entry')).toBe(true);
      
      streamer.stop();
    });

    it('should call multiple callbacks', async () => {
      await writeFile(logPath, '', 'utf8');
      const streamer = new LogStreamer({ logPath });
      
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      streamer.onEntry(callback1);
      streamer.onEntry(callback2);
      
      await streamer.start();
      
      // Wait for initial read
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      // Write new entry
      await writeLogEntry(createLogEntry('info', 'New entry'));
      
      // Wait for file watch to trigger
      await new Promise((resolve) => setTimeout(resolve, 200));
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      
      streamer.stop();
    });

    it('should continue calling other callbacks if one throws', async () => {
      await writeFile(logPath, '', 'utf8');
      const streamer = new LogStreamer({ logPath });
      
      const callback1 = vi.fn(() => {
        throw new Error('Callback error');
      });
      const callback2 = vi.fn();
      
      streamer.onEntry(callback1);
      streamer.onEntry(callback2);
      
      await streamer.start();
      
      // Wait for initial read
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      // Write new entry
      await writeLogEntry(createLogEntry('info', 'New entry'));
      
      // Wait for file watch to trigger
      await new Promise((resolve) => setTimeout(resolve, 200));
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      
      streamer.stop();
    });
  });

  describe('level filtering', () => {
    it('should filter entries below minLevel', async () => {
      await writeFile(logPath, '', 'utf8');
      const streamer = new LogStreamer({
        logPath,
        minLevel: 'warn',
      });
      
      const receivedEntries: LogEntry[] = [];
      streamer.onEntry((entry) => {
        receivedEntries.push(entry);
      });
      
      await streamer.start();
      
      // Wait for initial read
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      // Write entries at different levels
      await writeLogEntry(createLogEntry('debug', 'Debug message'));
      await writeLogEntry(createLogEntry('info', 'Info message'));
      await writeLogEntry(createLogEntry('warn', 'Warn message'));
      await writeLogEntry(createLogEntry('error', 'Error message'));
      
      // Wait for file watch to trigger
      await new Promise((resolve) => setTimeout(resolve, 200));
      
      // Should only receive warn and error
      const messages = receivedEntries.map((e) => e.message);
      expect(messages).not.toContain('Debug message');
      expect(messages).not.toContain('Info message');
      expect(messages).toContain('Warn message');
      expect(messages).toContain('Error message');
      
      streamer.stop();
    });

    it('should update minLevel dynamically', async () => {
      await writeFile(logPath, '', 'utf8');
      const streamer = new LogStreamer({
        logPath,
        minLevel: 'info',
      });
      
      const receivedEntries: LogEntry[] = [];
      streamer.onEntry((entry) => {
        receivedEntries.push(entry);
      });
      
      await streamer.start();
      
      // Wait for initial read
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      // Write info entry
      await writeLogEntry(createLogEntry('info', 'Info message'));
      
      // Wait for file watch
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Change minLevel to warn
      streamer.setMinLevel('warn');
      
      // Write another info entry (should be filtered)
      await writeLogEntry(createLogEntry('info', 'Info after level change'));
      
      // Wait for file watch
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Should have received first info but not second
      const messages = receivedEntries.map((e) => e.message);
      expect(messages).toContain('Info message');
      expect(messages).not.toContain('Info after level change');
      
      streamer.stop();
    });
  });

  describe('format', () => {
    it('should format entries as JSON when format is json', () => {
      const streamer = new LogStreamer({
        logPath: '/tmp/test.log',
        format: 'json',
      });
      
      const entry = createLogEntry('info', 'Test message');
      const formatted = (streamer as any).formatEntry(entry);
      
      expect(formatted).toBe(JSON.stringify(entry));
    });

    it('should format entries as pretty when format is pretty', () => {
      const streamer = new LogStreamer({
        logPath: '/tmp/test.log',
        format: 'pretty',
      });
      
      const entry = createLogEntry(
        'info',
        'Test message',
        '2026-01-10T14:30:00.000Z'
      );
      const formatted = (streamer as any).formatEntry(entry);
      
      expect(formatted).toContain('[2026-01-10 14:30:00]');
      expect(formatted).toContain('INFO');
      expect(formatted).toContain('Test message');
    });

    it('should include context in pretty format', () => {
      const streamer = new LogStreamer({
        logPath: '/tmp/test.log',
        format: 'pretty',
      });
      
      const entry: LogEntry = {
        timestamp: '2026-01-10T14:30:00.000Z',
        level: 'info',
        message: 'Test message',
        context: { key: 'value' },
      };
      const formatted = (streamer as any).formatEntry(entry);
      
      expect(formatted).toContain('Context:');
      expect(formatted).toContain('"key"');
      expect(formatted).toContain('"value"');
    });

    it('should include sessionId in pretty format', () => {
      const streamer = new LogStreamer({
        logPath: '/tmp/test.log',
        format: 'pretty',
      });
      
      const entry: LogEntry = {
        timestamp: '2026-01-10T14:30:00.000Z',
        level: 'info',
        message: 'Test message',
        sessionId: 'PM-2026-01-10-14-30-00-001',
      };
      const formatted = (streamer as any).formatEntry(entry);
      
      expect(formatted).toContain('session: PM-2026-01-10-14-30-00-001');
    });
  });

  describe('file rotation', () => {
    it('should handle file truncation by resetting position', async () => {
      await writeFile(logPath, '', 'utf8');
      const streamer = new LogStreamer({ logPath });
      
      const receivedEntries: LogEntry[] = [];
      streamer.onEntry((entry) => {
        receivedEntries.push(entry);
      });
      
      await streamer.start();
      
      // Wait for initial read
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      // Write some entries
      await writeLogEntry(createLogEntry('info', 'Entry 1'));
      await writeLogEntry(createLogEntry('info', 'Entry 2'));
      
      // Wait for file watch
      await new Promise((resolve) => setTimeout(resolve, 200));
      
      // Truncate file (simulate rotation)
      await writeFile(logPath, '', 'utf8');
      
      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Write new entry after truncation
      await writeLogEntry(createLogEntry('info', 'Entry after rotation'));
      
      // Wait for file watch
      await new Promise((resolve) => setTimeout(resolve, 200));
      
      // Should receive entry after rotation
      const messages = receivedEntries.map((e) => e.message);
      expect(messages).toContain('Entry after rotation');
      
      streamer.stop();
    });
  });

  describe('error handling', () => {
    it('should handle malformed JSON lines gracefully', async () => {
      await writeFile(logPath, '', 'utf8');
      const streamer = new LogStreamer({ logPath });
      
      const receivedEntries: LogEntry[] = [];
      streamer.onEntry((entry) => {
        receivedEntries.push(entry);
      });
      
      await streamer.start();
      
      // Wait for initial read
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      // Write malformed JSON
      await appendFile(logPath, 'not valid json\n', 'utf8');
      
      // Write valid entry
      await writeLogEntry(createLogEntry('info', 'Valid entry'));
      
      // Wait for file watch
      await new Promise((resolve) => setTimeout(resolve, 200));
      
      // Should only receive valid entry
      const messages = receivedEntries.map((e) => e.message);
      expect(messages).toContain('Valid entry');
      expect(messages.length).toBeGreaterThanOrEqual(1);
      
      streamer.stop();
    });

    it('should handle file deletion gracefully', async () => {
      await writeFile(logPath, '', 'utf8');
      const streamer = new LogStreamer({ logPath });
      
      await streamer.start();
      
      // Wait for initial read
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      // Delete file
      await unlink(logPath);
      
      // Wait a bit - should not throw
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      streamer.stop();
    });
  });
});
