/**
 * Tests for ActivityLogger
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ActivityLogger } from './activity-logger.js';
import type { ActivityEvent } from './activity-logger.js';

describe('ActivityLogger', () => {
  let tempDir: string;
  let logPath: string;
  const sessionId = 'PM-2026-01-13-10-00-00-001';

  beforeEach(async () => {
    tempDir = join(tmpdir(), `activity-logger-test-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });
    logPath = join(tempDir, 'activity.log');
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
        await import('fs/promises').then((fs) => fs.rmdir(tempDir));
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  describe('Constructor', () => {
    it('should create logger with correct log path and sessionId', () => {
      const logger = new ActivityLogger(logPath, sessionId);
      expect(logger).toBeInstanceOf(ActivityLogger);
    });
  });

  describe('logStateChange', () => {
    it('should write correct JSONL entry for state change', async () => {
      const logger = new ActivityLogger(logPath, sessionId);
      logger.logStateChange('idle', 'planning', 'START');

      // Wait a bit for async write
      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = await readFile(logPath, 'utf8');
      const lines = content.trim().split('\n');
      expect(lines).toHaveLength(1);

      const event = JSON.parse(lines[0]!) as ActivityEvent;
      expect(event.timestamp).toBeDefined();
      expect(event.eventType).toBe('state_change');
      expect(event.sessionId).toBe(sessionId);
      expect(event.details.from).toBe('idle');
      expect(event.details.to).toBe('planning');
      expect(event.details.event).toBe('START');
    });
  });

  describe('logTierTransition', () => {
    it('should write correct JSONL entry for tier transition', async () => {
      const logger = new ActivityLogger(logPath, sessionId);
      logger.logTierTransition('PH-001', 'pending', 'running');

      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = await readFile(logPath, 'utf8');
      const lines = content.trim().split('\n');
      expect(lines).toHaveLength(1);

      const event = JSON.parse(lines[0]!) as ActivityEvent;
      expect(event.eventType).toBe('tier_transition');
      expect(event.sessionId).toBe(sessionId);
      expect(event.details.tierId).toBe('PH-001');
      expect(event.details.from).toBe('pending');
      expect(event.details.to).toBe('running');
    });
  });

  describe('logPhaseStart', () => {
    it('should write correct JSONL entry for phase start', async () => {
      const logger = new ActivityLogger(logPath, sessionId);
      logger.logPhaseStart('PH-001', 'Phase 1: Setup');

      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = await readFile(logPath, 'utf8');
      const lines = content.trim().split('\n');
      expect(lines).toHaveLength(1);

      const event = JSON.parse(lines[0]!) as ActivityEvent;
      expect(event.eventType).toBe('phase_start');
      expect(event.sessionId).toBe(sessionId);
      expect(event.details.phaseId).toBe('PH-001');
      expect(event.details.title).toBe('Phase 1: Setup');
    });
  });

  describe('logPhaseComplete', () => {
    it('should write correct JSONL entry for phase complete (passed)', async () => {
      const logger = new ActivityLogger(logPath, sessionId);
      logger.logPhaseComplete('PH-001', 'passed');

      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = await readFile(logPath, 'utf8');
      const lines = content.trim().split('\n');
      expect(lines).toHaveLength(1);

      const event = JSON.parse(lines[0]!) as ActivityEvent;
      expect(event.eventType).toBe('phase_complete');
      expect(event.sessionId).toBe(sessionId);
      expect(event.details.phaseId).toBe('PH-001');
      expect(event.details.status).toBe('passed');
    });

    it('should write correct JSONL entry for phase complete (failed)', async () => {
      const logger = new ActivityLogger(logPath, sessionId);
      logger.logPhaseComplete('PH-001', 'failed');

      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = await readFile(logPath, 'utf8');
      const lines = content.trim().split('\n');
      expect(lines).toHaveLength(1);

      const event = JSON.parse(lines[0]!) as ActivityEvent;
      expect(event.eventType).toBe('phase_complete');
      expect(event.details.status).toBe('failed');
    });
  });

  describe('logTaskStart', () => {
    it('should write correct JSONL entry for task start', async () => {
      const logger = new ActivityLogger(logPath, sessionId);
      logger.logTaskStart('TK-001-001', 'Task 1: Initialize');

      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = await readFile(logPath, 'utf8');
      const lines = content.trim().split('\n');
      expect(lines).toHaveLength(1);

      const event = JSON.parse(lines[0]!) as ActivityEvent;
      expect(event.eventType).toBe('task_start');
      expect(event.sessionId).toBe(sessionId);
      expect(event.details.taskId).toBe('TK-001-001');
      expect(event.details.title).toBe('Task 1: Initialize');
    });
  });

  describe('logTaskComplete', () => {
    it('should write correct JSONL entry for task complete (passed)', async () => {
      const logger = new ActivityLogger(logPath, sessionId);
      logger.logTaskComplete('TK-001-001', 'passed');

      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = await readFile(logPath, 'utf8');
      const lines = content.trim().split('\n');
      expect(lines).toHaveLength(1);

      const event = JSON.parse(lines[0]!) as ActivityEvent;
      expect(event.eventType).toBe('task_complete');
      expect(event.sessionId).toBe(sessionId);
      expect(event.details.taskId).toBe('TK-001-001');
      expect(event.details.status).toBe('passed');
    });

    it('should write correct JSONL entry for task complete (failed)', async () => {
      const logger = new ActivityLogger(logPath, sessionId);
      logger.logTaskComplete('TK-001-001', 'failed');

      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = await readFile(logPath, 'utf8');
      const lines = content.trim().split('\n');
      expect(lines).toHaveLength(1);

      const event = JSON.parse(lines[0]!) as ActivityEvent;
      expect(event.eventType).toBe('task_complete');
      expect(event.details.status).toBe('failed');
    });
  });

  describe('logError', () => {
    it('should capture error message and stack trace', async () => {
      const logger = new ActivityLogger(logPath, sessionId);
      const error = new Error('Test error message');
      error.stack = 'Error: Test error message\n    at test.ts:1:1';
      logger.logError(error, { context: 'test' });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = await readFile(logPath, 'utf8');
      const lines = content.trim().split('\n');
      expect(lines).toHaveLength(1);

      const event = JSON.parse(lines[0]!) as ActivityEvent;
      expect(event.eventType).toBe('error');
      expect(event.sessionId).toBe(sessionId);
      expect(event.details.message).toBe('Test error message');
      expect(event.details.stack).toBeDefined();
      expect(event.details.name).toBe('Error');
      expect(event.details.context).toBe('test');
    });
  });

  describe('getRecentActivity', () => {
    it('should read and parse recent entries correctly', async () => {
      const logger = new ActivityLogger(logPath, sessionId);
      
      // Write multiple events
      logger.logPhaseStart('PH-001', 'Phase 1');
      await new Promise((resolve) => setTimeout(resolve, 50));
      logger.logTaskStart('TK-001-001', 'Task 1');
      await new Promise((resolve) => setTimeout(resolve, 50));
      logger.logTaskComplete('TK-001-001', 'passed');
      await new Promise((resolve) => setTimeout(resolve, 50));

      const events = await logger.getRecentActivity(3);
      expect(events).toHaveLength(3);
      
      // Most recent first
      expect(events[0]?.eventType).toBe('task_complete');
      expect(events[1]?.eventType).toBe('task_start');
      expect(events[2]?.eventType).toBe('phase_start');
    });

    it('should return limited number of entries', async () => {
      const logger = new ActivityLogger(logPath, sessionId);
      
      // Write 5 events
      for (let i = 0; i < 5; i++) {
        logger.logPhaseStart(`PH-00${i}`, `Phase ${i}`);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const events = await logger.getRecentActivity(3);
      expect(events).toHaveLength(3);
    });

    it('should handle empty file gracefully', async () => {
      const logger = new ActivityLogger(logPath, sessionId);
      
      // Create empty file
      await import('fs/promises').then((fs) => fs.writeFile(logPath, ''));

      const events = await logger.getRecentActivity(10);
      expect(events).toHaveLength(0);
    });

    it('should handle file not found gracefully', async () => {
      const nonExistentPath = join(tempDir, 'non-existent.log');
      const logger = new ActivityLogger(nonExistentPath, sessionId);

      const events = await logger.getRecentActivity(10);
      expect(events).toHaveLength(0);
    });

    it('should include sessionId in all entries', async () => {
      const logger = new ActivityLogger(logPath, sessionId);
      logger.logPhaseStart('PH-001', 'Phase 1');
      await new Promise((resolve) => setTimeout(resolve, 50));

      const events = await logger.getRecentActivity(1);
      expect(events).toHaveLength(1);
      expect(events[0]?.sessionId).toBe(sessionId);
    });
  });

  describe('Multiple log entries', () => {
    it('should write entries sequentially', async () => {
      const logger = new ActivityLogger(logPath, sessionId);
      
      logger.logPhaseStart('PH-001', 'Phase 1');
      await new Promise((resolve) => setTimeout(resolve, 50));
      logger.logTaskStart('TK-001-001', 'Task 1');
      await new Promise((resolve) => setTimeout(resolve, 50));
      logger.logTaskComplete('TK-001-001', 'passed');
      await new Promise((resolve) => setTimeout(resolve, 50));

      const content = await readFile(logPath, 'utf8');
      const lines = content.trim().split('\n');
      expect(lines).toHaveLength(3);

      const event1 = JSON.parse(lines[0]!) as ActivityEvent;
      const event2 = JSON.parse(lines[1]!) as ActivityEvent;
      const event3 = JSON.parse(lines[2]!) as ActivityEvent;

      expect(event1.eventType).toBe('phase_start');
      expect(event2.eventType).toBe('task_start');
      expect(event3.eventType).toBe('task_complete');
    });
  });
});
