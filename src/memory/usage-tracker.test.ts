/**
 * Tests for UsageTracker
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { rm, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { UsageTracker } from './usage-tracker.js';
import type { UsageEvent } from '../types/usage.js';
import type { Platform } from '../types/config.js';

describe('UsageTracker', () => {
  const testDir = join(process.cwd(), '.test-usage');
  let testFilePath: string;
  let tracker: UsageTracker;

  beforeEach(async () => {
    testFilePath = join(testDir, 'usage.jsonl');
    // Ensure test directory exists
    try {
      await mkdir(testDir, { recursive: true });
    } catch {
      // Directory might already exist
    }
    tracker = new UsageTracker(testFilePath);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  const createTestEvent = (overrides?: Partial<Omit<UsageEvent, 'timestamp'>>): Omit<UsageEvent, 'timestamp'> => ({
    platform: 'cursor' as Platform,
    action: 'iteration',
    durationMs: 30000,
    success: true,
    ...overrides,
  });

  describe('track', () => {
    it('should create file if it does not exist', async () => {
      expect(existsSync(testFilePath)).toBe(false);

      const event = createTestEvent();
      await tracker.track(event);

      expect(existsSync(testFilePath)).toBe(true);
    });

    it('should create directory if it does not exist', async () => {
      const nestedPath = join(testDir, 'nested', 'usage.jsonl');
      const nestedTracker = new UsageTracker(nestedPath);

      const event = createTestEvent();
      await nestedTracker.track(event);

      expect(existsSync(nestedPath)).toBe(true);
    });

    it('should append event in JSONL format', async () => {
      const event = createTestEvent({
        platform: 'claude',
        action: 'phase_gate',
        tokens: 5000,
        durationMs: 30000,
        sessionId: 'PM-2026-01-10-14-00-00-001',
        itemId: 'PH-001',
        success: true,
      });

      await tracker.track(event);

      const fs = await import('fs/promises');
      const content = await fs.readFile(testFilePath, 'utf-8');
      const lines = content.trim().split('\n');

      expect(lines).toHaveLength(1);
      const parsed = JSON.parse(lines[0]) as UsageEvent;

      expect(parsed.platform).toBe('claude');
      expect(parsed.action).toBe('phase_gate');
      expect(parsed.tokens).toBe(5000);
      expect(parsed.durationMs).toBe(30000);
      expect(parsed.sessionId).toBe('PM-2026-01-10-14-00-00-001');
      expect(parsed.itemId).toBe('PH-001');
      expect(parsed.success).toBe(true);
      expect(parsed.timestamp).toBeDefined();
      expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should add timestamp automatically', async () => {
      const before = new Date();
      const event = createTestEvent();
      await tracker.track(event);

      const events = await tracker.getAll();
      expect(events).toHaveLength(1);

      const eventDate = new Date(events[0].timestamp);
      const after = new Date();

      expect(eventDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(eventDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should append multiple events maintaining order', async () => {
      const event1 = createTestEvent({ platform: 'cursor', action: 'iteration' });
      const event2 = createTestEvent({ platform: 'codex', action: 'task_gate' });
      const event3 = createTestEvent({ platform: 'claude', action: 'phase_gate' });

      await tracker.track(event1);
      await tracker.track(event2);
      await tracker.track(event3);

      const events = await tracker.getAll();
      expect(events).toHaveLength(3);
      expect(events[0].platform).toBe('cursor');
      expect(events[1].platform).toBe('codex');
      expect(events[2].platform).toBe('claude');
    });

    it('should handle events with optional fields', async () => {
      const event = createTestEvent({
        tokens: undefined,
        sessionId: undefined,
        itemId: undefined,
        error: undefined,
      });

      await tracker.track(event);

      const events = await tracker.getAll();
      expect(events).toHaveLength(1);
      expect(events[0].tokens).toBeUndefined();
      expect(events[0].sessionId).toBeUndefined();
      expect(events[0].itemId).toBeUndefined();
      expect(events[0].error).toBeUndefined();
    });

    it('should handle failed events with error messages', async () => {
      const event = createTestEvent({
        success: false,
        error: 'Timeout after 60 seconds',
      });

      await tracker.track(event);

      const events = await tracker.getAll();
      expect(events).toHaveLength(1);
      expect(events[0].success).toBe(false);
      expect(events[0].error).toBe('Timeout after 60 seconds');
    });
  });

  describe(':memory: (no file created)', () => {
    it('should not create a file when path is :memory:', async () => {
      const memTracker = new UsageTracker(':memory:');
      const cwd = process.cwd();
      const memoryPath = join(cwd, ':memory:');

      await memTracker.track(createTestEvent());
      const events = await memTracker.getAll();

      expect(events).toEqual([]);
      expect(existsSync(memoryPath)).toBe(false);
    });

    it('getAll returns [] for :memory:', async () => {
      const memTracker = new UsageTracker(':memory:');
      await memTracker.track(createTestEvent({ platform: 'claude' }));

      const events = await memTracker.getAll();
      expect(events).toEqual([]);
    });
  });

  describe('getAll', () => {
    it('should return empty array for non-existent file', async () => {
      const events = await tracker.getAll();
      expect(events).toEqual([]);
    });

    it('should return empty array for empty file', async () => {
      const fs = await import('fs/promises');
      await fs.writeFile(testFilePath, '', 'utf-8');

      const events = await tracker.getAll();
      expect(events).toEqual([]);
    });

    it('should return all events from file', async () => {
      const event1 = createTestEvent({ platform: 'cursor' });
      const event2 = createTestEvent({ platform: 'codex' });
      const event3 = createTestEvent({ platform: 'claude' });

      await tracker.track(event1);
      await tracker.track(event2);
      await tracker.track(event3);

      const events = await tracker.getAll();
      expect(events).toHaveLength(3);
    });

    it('should parse events correctly', async () => {
      const event = createTestEvent({
        platform: 'claude',
        action: 'start_chain',
        tokens: 5000,
        durationMs: 30000,
        sessionId: 'PM-2026-01-10-14-00-00-001',
        itemId: 'PH-001',
        success: true,
      });

      await tracker.track(event);

      const events = await tracker.getAll();
      expect(events).toHaveLength(1);

      const readEvent = events[0];
      expect(readEvent.platform).toBe('claude');
      expect(readEvent.action).toBe('start_chain');
      expect(readEvent.tokens).toBe(5000);
      expect(readEvent.durationMs).toBe(30000);
      expect(readEvent.sessionId).toBe('PM-2026-01-10-14-00-00-001');
      expect(readEvent.itemId).toBe('PH-001');
      expect(readEvent.success).toBe(true);
    });

    it('should skip invalid JSON lines gracefully', async () => {
      const fs = await import('fs/promises');
      const content = `{"timestamp":"2026-01-10T14:00:00Z","platform":"cursor","action":"iteration","durationMs":30000,"success":true}
invalid json line
{"timestamp":"2026-01-10T14:05:00Z","platform":"codex","action":"task_gate","durationMs":25000,"success":true}
not json either
{"timestamp":"2026-01-10T14:10:00Z","platform":"claude","action":"phase_gate","durationMs":20000,"success":true}
`;
      await fs.writeFile(testFilePath, content, 'utf-8');

      const events = await tracker.getAll();
      // Should have 3 valid events
      expect(events).toHaveLength(3);
      expect(events[0].platform).toBe('cursor');
      expect(events[1].platform).toBe('codex');
      expect(events[2].platform).toBe('claude');
    });

    it('should skip lines with missing required fields', async () => {
      const fs = await import('fs/promises');
      const content = `{"timestamp":"2026-01-10T14:00:00Z","platform":"cursor","action":"iteration","durationMs":30000,"success":true}
{"timestamp":"2026-01-10T14:05:00Z","platform":"codex"}
{"timestamp":"2026-01-10T14:10:00Z","platform":"claude","action":"phase_gate","durationMs":20000,"success":true}
`;
      await fs.writeFile(testFilePath, content, 'utf-8');

      const events = await tracker.getAll();
      // Should have 2 valid events (missing required fields in second line)
      expect(events).toHaveLength(2);
      expect(events[0].platform).toBe('cursor');
      expect(events[1].platform).toBe('claude');
    });

    it('should handle empty lines', async () => {
      const fs = await import('fs/promises');
      const content = `{"timestamp":"2026-01-10T14:00:00Z","platform":"cursor","action":"iteration","durationMs":30000,"success":true}

{"timestamp":"2026-01-10T14:05:00Z","platform":"codex","action":"task_gate","durationMs":25000,"success":true}
`;
      await fs.writeFile(testFilePath, content, 'utf-8');

      const events = await tracker.getAll();
      expect(events).toHaveLength(2);
    });
  });

  describe('getByPlatform', () => {
    it('should return events for specific platform', async () => {
      await tracker.track(createTestEvent({ platform: 'cursor' }));
      await tracker.track(createTestEvent({ platform: 'codex' }));
      await tracker.track(createTestEvent({ platform: 'claude' }));
      await tracker.track(createTestEvent({ platform: 'cursor' }));

      const cursorEvents = await tracker.getByPlatform('cursor');
      expect(cursorEvents).toHaveLength(2);
      expect(cursorEvents.every(e => e.platform === 'cursor')).toBe(true);
    });

    it('should return empty array if no events for platform', async () => {
      await tracker.track(createTestEvent({ platform: 'cursor' }));
      await tracker.track(createTestEvent({ platform: 'codex' }));

      const claudeEvents = await tracker.getByPlatform('claude');
      expect(claudeEvents).toEqual([]);
    });

    it('should return empty array for empty file', async () => {
      const events = await tracker.getByPlatform('cursor');
      expect(events).toEqual([]);
    });
  });

  describe('getInPeriod', () => {
    it('should return events within time range', async () => {
      // Create events at different times
      const fs = await import('fs/promises');
      await fs.writeFile(testFilePath, '', 'utf-8');

      // Event before range
      await fs.appendFile(testFilePath, JSON.stringify({
        timestamp: '2026-01-10T11:00:00Z',
        platform: 'cursor',
        action: 'iteration',
        durationMs: 30000,
        success: true,
      }) + '\n', 'utf-8');

      // Events in range
      await fs.appendFile(testFilePath, JSON.stringify({
        timestamp: '2026-01-10T12:30:00Z',
        platform: 'codex',
        action: 'task_gate',
        durationMs: 25000,
        success: true,
      }) + '\n', 'utf-8');

      await fs.appendFile(testFilePath, JSON.stringify({
        timestamp: '2026-01-10T13:00:00Z',
        platform: 'claude',
        action: 'phase_gate',
        durationMs: 20000,
        success: true,
      }) + '\n', 'utf-8');

      // Event after range
      await fs.appendFile(testFilePath, JSON.stringify({
        timestamp: '2026-01-10T14:00:00Z',
        platform: 'cursor',
        action: 'iteration',
        durationMs: 30000,
        success: true,
      }) + '\n', 'utf-8');

      const since = new Date('2026-01-10T12:00:00Z');
      const until = new Date('2026-01-10T13:30:00Z');

      const events = await tracker.getInPeriod(since, until);
      expect(events).toHaveLength(2);
      expect(events[0].platform).toBe('codex');
      expect(events[1].platform).toBe('claude');
    });

    it('should use current time if until not provided', async () => {
      const pastTime = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      const recentTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago

      const fs = await import('fs/promises');
      await fs.writeFile(testFilePath, '', 'utf-8');

      // Old event
      await fs.appendFile(testFilePath, JSON.stringify({
        timestamp: pastTime.toISOString(),
        platform: 'cursor',
        action: 'iteration',
        durationMs: 30000,
        success: true,
      }) + '\n', 'utf-8');

      // Recent event
      await fs.appendFile(testFilePath, JSON.stringify({
        timestamp: recentTime.toISOString(),
        platform: 'codex',
        action: 'task_gate',
        durationMs: 25000,
        success: true,
      }) + '\n', 'utf-8');

      const events = await tracker.getInPeriod(new Date(Date.now() - 60 * 60 * 1000)); // Last hour
      expect(events.length).toBeGreaterThanOrEqual(1);
      expect(events.some(e => e.platform === 'codex')).toBe(true);
    });

    it('should return empty array if no events in period', async () => {
      const futureTime = new Date('2026-12-31T12:00:00Z');
      const events = await tracker.getInPeriod(futureTime);
      expect(events).toEqual([]);
    });
  });

  describe('query', () => {
    beforeEach(async () => {
      // Set up test data with various events
      const fs = await import('fs/promises');
      await fs.writeFile(testFilePath, '', 'utf-8');

      // Cursor events
      await fs.appendFile(testFilePath, JSON.stringify({
        timestamp: '2026-01-10T12:00:00Z',
        platform: 'cursor',
        action: 'iteration',
        durationMs: 30000,
        success: true,
      }) + '\n', 'utf-8');

      await fs.appendFile(testFilePath, JSON.stringify({
        timestamp: '2026-01-10T13:00:00Z',
        platform: 'cursor',
        action: 'gate_review',
        durationMs: 20000,
        success: true,
      }) + '\n', 'utf-8');

      // Codex events
      await fs.appendFile(testFilePath, JSON.stringify({
        timestamp: '2026-01-10T14:00:00Z',
        platform: 'codex',
        action: 'task_gate',
        durationMs: 25000,
        success: true,
      }) + '\n', 'utf-8');

      // Claude events
      await fs.appendFile(testFilePath, JSON.stringify({
        timestamp: '2026-01-10T15:00:00Z',
        platform: 'claude',
        action: 'phase_gate',
        durationMs: 20000,
        success: true,
      }) + '\n', 'utf-8');
    });

    it('should filter by platform', async () => {
      const events = await tracker.query({ platform: 'cursor' });
      expect(events).toHaveLength(2);
      expect(events.every(e => e.platform === 'cursor')).toBe(true);
    });

    it('should filter by action', async () => {
      const events = await tracker.query({ action: 'iteration' });
      expect(events).toHaveLength(1);
      expect(events[0].action).toBe('iteration');
    });

    it('should filter by time range', async () => {
      const since = new Date('2026-01-10T13:00:00Z');
      const until = new Date('2026-01-10T14:30:00Z');

      const events = await tracker.query({ since, until });
      expect(events).toHaveLength(2);
      expect(events[0].platform).toBe('cursor');
      expect(events[1].platform).toBe('codex');
    });

    it('should combine multiple filters', async () => {
      const since = new Date('2026-01-10T12:00:00Z');
      const events = await tracker.query({
        platform: 'cursor',
        action: 'iteration',
        since,
      });

      expect(events).toHaveLength(1);
      expect(events[0].platform).toBe('cursor');
      expect(events[0].action).toBe('iteration');
    });

    it('should respect limit parameter', async () => {
      const events = await tracker.query({ limit: 2 });
      expect(events).toHaveLength(2);
    });

    it('should return empty array if limit is 0', async () => {
      const events = await tracker.query({ limit: 0 });
      expect(events).toEqual([]);
    });

    it('should return empty array if no matches', async () => {
      const events = await tracker.query({ platform: 'claude', action: 'iteration' });
      expect(events).toEqual([]);
    });
  });

  describe('getSummary', () => {
    it('should calculate summary statistics correctly', async () => {
      await tracker.track(createTestEvent({
        platform: 'claude',
        tokens: 5000,
        durationMs: 30000,
        success: true,
      }));

      await tracker.track(createTestEvent({
        platform: 'claude',
        tokens: 3000,
        durationMs: 20000,
        success: true,
      }));

      await tracker.track(createTestEvent({
        platform: 'claude',
        tokens: 2000,
        durationMs: 15000,
        success: false,
      }));

      const summary = await tracker.getSummary('claude');
      expect(summary.platform).toBe('claude');
      expect(summary.totalCalls).toBe(3);
      expect(summary.totalTokens).toBe(10000);
      expect(summary.totalDurationMs).toBe(65000);
      expect(summary.successCount).toBe(2);
      expect(summary.failureCount).toBe(1);
    });

    it('should handle events without tokens', async () => {
      await tracker.track(createTestEvent({
        platform: 'cursor',
        tokens: undefined,
        durationMs: 30000,
        success: true,
      }));

      const summary = await tracker.getSummary('cursor');
      expect(summary.totalTokens).toBe(0);
    });

    it('should respect since parameter', async () => {
      const fs = await import('fs/promises');
      await fs.writeFile(testFilePath, '', 'utf-8');

      // Old event
      await fs.appendFile(testFilePath, JSON.stringify({
        timestamp: '2026-01-10T10:00:00Z',
        platform: 'claude',
        action: 'phase_gate',
        tokens: 5000,
        durationMs: 30000,
        success: true,
      }) + '\n', 'utf-8');

      // Recent event
      await fs.appendFile(testFilePath, JSON.stringify({
        timestamp: '2026-01-10T14:00:00Z',
        platform: 'claude',
        action: 'phase_gate',
        tokens: 3000,
        durationMs: 20000,
        success: true,
      }) + '\n', 'utf-8');

      const since = new Date('2026-01-10T12:00:00Z');
      const summary = await tracker.getSummary('claude', since);

      expect(summary.totalCalls).toBe(1);
      expect(summary.totalTokens).toBe(3000);
    });

    it('should return zero summary for platform with no events', async () => {
      const summary = await tracker.getSummary('claude');
      expect(summary.platform).toBe('claude');
      expect(summary.totalCalls).toBe(0);
      expect(summary.totalTokens).toBe(0);
      expect(summary.totalDurationMs).toBe(0);
      expect(summary.successCount).toBe(0);
      expect(summary.failureCount).toBe(0);
    });
  });

  describe('getCallCountInLastHour', () => {
    it('should count events in last hour', async () => {
      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      const fs = await import('fs/promises');
      await fs.writeFile(testFilePath, '', 'utf-8');

      // Old event (outside last hour)
      await fs.appendFile(testFilePath, JSON.stringify({
        timestamp: twoHoursAgo.toISOString(),
        platform: 'claude',
        action: 'phase_gate',
        durationMs: 30000,
        success: true,
      }) + '\n', 'utf-8');

      // Recent events (within last hour)
      await fs.appendFile(testFilePath, JSON.stringify({
        timestamp: thirtyMinutesAgo.toISOString(),
        platform: 'claude',
        action: 'phase_gate',
        durationMs: 20000,
        success: true,
      }) + '\n', 'utf-8');

      await fs.appendFile(testFilePath, JSON.stringify({
        timestamp: now.toISOString(),
        platform: 'claude',
        action: 'task_gate',
        durationMs: 25000,
        success: true,
      }) + '\n', 'utf-8');

      const count = await tracker.getCallCountInLastHour('claude');
      expect(count).toBe(2);
    });

    it('should return 0 if no events in last hour', async () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

      const fs = await import('fs/promises');
      await fs.appendFile(testFilePath, JSON.stringify({
        timestamp: twoHoursAgo.toISOString(),
        platform: 'claude',
        action: 'phase_gate',
        durationMs: 30000,
        success: true,
      }) + '\n', 'utf-8');

      const count = await tracker.getCallCountInLastHour('claude');
      expect(count).toBe(0);
    });

    it('should return 0 for platform with no events', async () => {
      const count = await tracker.getCallCountInLastHour('claude');
      expect(count).toBe(0);
    });
  });

  describe('getCallCountToday', () => {
    it('should count events since start of current day (UTC)', async () => {
      const now = new Date();
      const startOfToday = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0,
        0
      ));
      const yesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
      const todayMidday = new Date(startOfToday.getTime() + 12 * 60 * 60 * 1000);

      const fs = await import('fs/promises');
      await fs.writeFile(testFilePath, '', 'utf-8');

      // Yesterday's event
      await fs.appendFile(testFilePath, JSON.stringify({
        timestamp: yesterday.toISOString(),
        platform: 'claude',
        action: 'phase_gate',
        durationMs: 30000,
        success: true,
      }) + '\n', 'utf-8');

      // Today's events
      await fs.appendFile(testFilePath, JSON.stringify({
        timestamp: todayMidday.toISOString(),
        platform: 'claude',
        action: 'phase_gate',
        durationMs: 20000,
        success: true,
      }) + '\n', 'utf-8');

      await fs.appendFile(testFilePath, JSON.stringify({
        timestamp: now.toISOString(),
        platform: 'claude',
        action: 'task_gate',
        durationMs: 25000,
        success: true,
      }) + '\n', 'utf-8');

      const count = await tracker.getCallCountToday('claude');
      expect(count).toBe(2);
    });

    it('should return 0 if no events today', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const fs = await import('fs/promises');
      await fs.appendFile(testFilePath, JSON.stringify({
        timestamp: yesterday.toISOString(),
        platform: 'claude',
        action: 'phase_gate',
        durationMs: 30000,
        success: true,
      }) + '\n', 'utf-8');

      const count = await tracker.getCallCountToday('claude');
      expect(count).toBe(0);
    });

    it('should return 0 for platform with no events', async () => {
      const count = await tracker.getCallCountToday('claude');
      expect(count).toBe(0);
    });
  });
});
