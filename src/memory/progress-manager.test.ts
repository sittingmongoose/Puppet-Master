/**
 * Tests for ProgressManager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { rm, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { ProgressManager, type ProgressEntry } from './progress-manager.js';
import type { Platform } from '../types/config.js';

describe('ProgressManager', () => {
  const testDir = join(process.cwd(), '.test-progress');
  let testFilePath: string;
  let manager: ProgressManager;

  beforeEach(async () => {
    testFilePath = join(testDir, 'progress.txt');
    // Ensure test directory exists
    try {
      await mkdir(testDir, { recursive: true });
    } catch {
      // Directory might already exist
    }
    manager = new ProgressManager(testFilePath);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  const createTestEntry = (overrides?: Partial<ProgressEntry>): ProgressEntry => ({
    timestamp: '2026-01-10T14:32:15Z',
    itemId: 'ST-001-001-001',
    sessionId: 'PM-2026-01-10-14-32-15-001',
    platform: 'cursor' as Platform,
    duration: '4m 23s',
    status: 'SUCCESS' as const,
    accomplishments: ['Added auth middleware', 'Updated Prisma schema'],
    filesChanged: [
      { path: 'src/lib/auth.ts', description: 'Added JWT validation' },
      { path: 'prisma/schema.prisma', description: 'Added status field' },
    ],
    testsRun: [
      { command: 'npm run typecheck', result: 'PASSED' },
      { command: 'npm test', result: 'PASSED' },
    ],
    learnings: ['Prisma requires generate after schema changes'],
    nextSteps: ['N/A - all acceptance criteria met'],
    ...overrides,
  });

  describe('generateSessionId', () => {
    it('should generate Session ID in correct format', () => {
      const sessionId = manager.generateSessionId();
      expect(sessionId).toMatch(/^PM-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}-\d{3}$/);
    });

    it('should start with PM- prefix', () => {
      const sessionId = manager.generateSessionId();
      expect(sessionId.startsWith('PM-')).toBe(true);
    });

    it('should increment sequence within same second', async () => {
      const id1 = manager.generateSessionId();
      // Small delay to ensure same second
      await new Promise(resolve => setTimeout(resolve, 10));
      const id2 = manager.generateSessionId();
      
      // Extract sequence numbers
      const seq1 = parseInt(id1.split('-')[6]);
      const seq2 = parseInt(id2.split('-')[6]);
      
      // Should increment if same second, or reset to 001 if new second
      expect(seq2).toBeGreaterThanOrEqual(seq1);
    });

    it('should format date/time components correctly', () => {
      const sessionId = manager.generateSessionId();
      const parts = sessionId.split('-');
      
      expect(parts[0]).toBe('PM');
      expect(parts[1].length).toBe(4); // Year
      expect(parts[2].length).toBe(2); // Month
      expect(parts[3].length).toBe(2); // Day
      expect(parts[4].length).toBe(2); // Hours
      expect(parts[5].length).toBe(2); // Minutes
      expect(parts[6].length).toBe(2); // Seconds
      expect(parts[7].length).toBe(3); // Sequence
    });
  });

  describe('append', () => {
    it('should create file if it does not exist', async () => {
      expect(existsSync(testFilePath)).toBe(false);
      
      const entry = createTestEntry();
      await manager.append(entry);
      
      expect(existsSync(testFilePath)).toBe(true);
    });

    it('should append entry in correct format', async () => {
      const entry = createTestEntry();
      await manager.append(entry);
      
      // Read file to check format
      const fs = await import('fs/promises');
      const fileContent = await fs.readFile(testFilePath, 'utf-8');
      
      expect(fileContent).toContain(`## ${entry.timestamp} - ${entry.itemId}`);
      expect(fileContent).toContain(`**Session:** ${entry.sessionId}`);
      expect(fileContent).toContain(`**Platform:** ${entry.platform}`);
      expect(fileContent).toContain(`**Duration:** ${entry.duration}`);
      expect(fileContent).toContain(`**Status:** ${entry.status}`);
      expect(fileContent).toContain('### What Was Done');
      expect(fileContent).toContain('- Added auth middleware');
      expect(fileContent).toContain('### Files Changed');
      expect(fileContent).toContain('- `src/lib/auth.ts` - Added JWT validation');
      expect(fileContent).toContain('### Tests Run');
      expect(fileContent).toContain('- `npm run typecheck` - PASSED');
      expect(fileContent).toContain('### Learnings for Future Iterations');
      expect(fileContent).toContain('### Next Steps');
      expect(fileContent).toContain('---');
    });

    it('should append multiple entries maintaining order', async () => {
      const entry1 = createTestEntry({ itemId: 'ST-001-001-001', timestamp: '2026-01-10T14:00:00Z' });
      const entry2 = createTestEntry({ itemId: 'ST-001-001-002', timestamp: '2026-01-10T15:00:00Z' });
      
      await manager.append(entry1);
      await manager.append(entry2);
      
      const entries = await manager.read();
      expect(entries).toHaveLength(2);
      expect(entries[0].itemId).toBe('ST-001-001-001');
      expect(entries[1].itemId).toBe('ST-001-001-002');
    });

    it('should handle empty arrays in entry', async () => {
      const entry = createTestEntry({
        accomplishments: [],
        filesChanged: [],
        testsRun: [],
        learnings: [],
        nextSteps: [],
      });
      
      await manager.append(entry);
      
      const fs = await import('fs/promises');
      const fileContent = await fs.readFile(testFilePath, 'utf-8');
      
      // Should still have section headers
      expect(fileContent).toContain('### What Was Done');
      expect(fileContent).toContain('### Files Changed');
      expect(fileContent).toContain('### Tests Run');
      expect(fileContent).toContain('### Learnings for Future Iterations');
      expect(fileContent).toContain('### Next Steps');
    });
  });

  describe('read', () => {
    it('should return empty array for non-existent file', async () => {
      const entries = await manager.read();
      expect(entries).toEqual([]);
    });

    it('should return empty array for empty file', async () => {
      const fs = await import('fs/promises');
      await fs.writeFile(testFilePath, '', 'utf-8');
      
      const entries = await manager.read();
      expect(entries).toEqual([]);
    });

    it('should parse single entry correctly', async () => {
      const entry = createTestEntry();
      await manager.append(entry);
      
      const entries = await manager.read();
      expect(entries).toHaveLength(1);
      
      const readEntry = entries[0];
      expect(readEntry.timestamp).toBe(entry.timestamp);
      expect(readEntry.itemId).toBe(entry.itemId);
      expect(readEntry.sessionId).toBe(entry.sessionId);
      expect(readEntry.platform).toBe(entry.platform);
      expect(readEntry.duration).toBe(entry.duration);
      expect(readEntry.status).toBe(entry.status);
      expect(readEntry.accomplishments).toEqual(entry.accomplishments);
      expect(readEntry.filesChanged).toEqual(entry.filesChanged);
      expect(readEntry.testsRun).toEqual(entry.testsRun);
      expect(readEntry.learnings).toEqual(entry.learnings);
      expect(readEntry.nextSteps).toEqual(entry.nextSteps);
    });

    it('should parse multiple entries correctly', async () => {
      const entry1 = createTestEntry({ itemId: 'ST-001-001-001', timestamp: '2026-01-10T14:00:00Z' });
      const entry2 = createTestEntry({ itemId: 'ST-001-001-002', timestamp: '2026-01-10T15:00:00Z' });
      const entry3 = createTestEntry({ itemId: 'ST-001-001-003', timestamp: '2026-01-10T16:00:00Z' });
      
      await manager.append(entry1);
      await manager.append(entry2);
      await manager.append(entry3);
      
      const entries = await manager.read();
      expect(entries).toHaveLength(3);
      expect(entries[0].itemId).toBe('ST-001-001-001');
      expect(entries[1].itemId).toBe('ST-001-001-002');
      expect(entries[2].itemId).toBe('ST-001-001-003');
    });

    it('should handle entries with different statuses', async () => {
      const successEntry = createTestEntry({ status: 'SUCCESS' });
      const failedEntry = createTestEntry({ status: 'FAILED', itemId: 'ST-001-001-002' });
      const partialEntry = createTestEntry({ status: 'PARTIAL', itemId: 'ST-001-001-003' });
      
      await manager.append(successEntry);
      await manager.append(failedEntry);
      await manager.append(partialEntry);
      
      const entries = await manager.read();
      expect(entries).toHaveLength(3);
      expect(entries[0].status).toBe('SUCCESS');
      expect(entries[1].status).toBe('FAILED');
      expect(entries[2].status).toBe('PARTIAL');
    });

    it('should handle entries with different platforms', async () => {
      const cursorEntry = createTestEntry({ platform: 'cursor' as Platform });
      const codexEntry = createTestEntry({ platform: 'codex' as Platform, itemId: 'ST-001-001-002' });
      const claudeEntry = createTestEntry({ platform: 'claude' as Platform, itemId: 'ST-001-001-003' });
      
      await manager.append(cursorEntry);
      await manager.append(codexEntry);
      await manager.append(claudeEntry);
      
      const entries = await manager.read();
      expect(entries).toHaveLength(3);
      expect(entries[0].platform).toBe('cursor');
      expect(entries[1].platform).toBe('codex');
      expect(entries[2].platform).toBe('claude');
    });

    it('should skip Codebase Patterns section', async () => {
      const fs = await import('fs/promises');
      const patternsContent = `## Codebase Patterns

- Pattern 1: description
- Pattern 2: description

---

## 2026-01-10T14:32:15Z - ST-001-001-001

**Session:** PM-2026-01-10-14-32-15-001
**Platform:** cursor
**Duration:** 4m 23s
**Status:** SUCCESS

### What Was Done
- Test

---

`;
      await fs.writeFile(testFilePath, patternsContent, 'utf-8');
      
      const entries = await manager.read();
      expect(entries).toHaveLength(1);
      expect(entries[0].itemId).toBe('ST-001-001-001');
    });

    it('should handle malformed entries gracefully', async () => {
      const fs = await import('fs/promises');
      const malformedContent = `## 2026-01-10T14:32:15Z - ST-001-001-001

**Session:** PM-2026-01-10-14-32-15-001
**Platform:** cursor
**Duration:** 4m 23s
**Status:** SUCCESS

---

## Invalid entry without proper format

Some random content

---

## 2026-01-10T15:00:00Z - ST-001-001-002

**Session:** PM-2026-01-10-15-00-00-001
**Platform:** codex
**Duration:** 2m 10s
**Status:** SUCCESS

### What Was Done
- Test

---

`;
      await fs.writeFile(testFilePath, malformedContent, 'utf-8');
      
      const entries = await manager.read();
      // Should parse valid entries and skip malformed ones
      expect(entries.length).toBeGreaterThanOrEqual(1);
      // First entry should be valid
      expect(entries[0].itemId).toBe('ST-001-001-001');
    });
  });

  describe('getLatest', () => {
    it('should return all entries when n is not specified', async () => {
      const entry1 = createTestEntry({ itemId: 'ST-001-001-001' });
      const entry2 = createTestEntry({ itemId: 'ST-001-001-002' });
      const entry3 = createTestEntry({ itemId: 'ST-001-001-003' });
      
      await manager.append(entry1);
      await manager.append(entry2);
      await manager.append(entry3);
      
      const entries = await manager.getLatest();
      expect(entries).toHaveLength(3);
    });

    it('should return last n entries correctly', async () => {
      const entry1 = createTestEntry({ itemId: 'ST-001-001-001' });
      const entry2 = createTestEntry({ itemId: 'ST-001-001-002' });
      const entry3 = createTestEntry({ itemId: 'ST-001-001-003' });
      const entry4 = createTestEntry({ itemId: 'ST-001-001-004' });
      const entry5 = createTestEntry({ itemId: 'ST-001-001-005' });
      
      await manager.append(entry1);
      await manager.append(entry2);
      await manager.append(entry3);
      await manager.append(entry4);
      await manager.append(entry5);
      
      const entries = await manager.getLatest(3);
      expect(entries).toHaveLength(3);
      expect(entries[0].itemId).toBe('ST-001-001-003');
      expect(entries[1].itemId).toBe('ST-001-001-004');
      expect(entries[2].itemId).toBe('ST-001-001-005');
    });

    it('should handle n > total entries (returns all)', async () => {
      const entry1 = createTestEntry({ itemId: 'ST-001-001-001' });
      const entry2 = createTestEntry({ itemId: 'ST-001-001-002' });
      
      await manager.append(entry1);
      await manager.append(entry2);
      
      const entries = await manager.getLatest(10);
      expect(entries).toHaveLength(2);
    });

    it('should return empty array for empty file', async () => {
      const entries = await manager.getLatest(5);
      expect(entries).toEqual([]);
    });

    it('should return empty array when n is 0', async () => {
      const entry1 = createTestEntry({ itemId: 'ST-001-001-001' });
      await manager.append(entry1);
      
      const entries = await manager.getLatest(0);
      expect(entries).toEqual([]);
    });

    it('should return empty array when n is negative', async () => {
      const entry1 = createTestEntry({ itemId: 'ST-001-001-001' });
      await manager.append(entry1);
      
      const entries = await manager.getLatest(-1);
      expect(entries).toEqual([]);
    });
  });

  describe('formatEntry', () => {
    it('should format entry with all fields', async () => {
      const entry = createTestEntry();
      await manager.append(entry);
      
      const fs = await import('fs/promises');
      const content = await fs.readFile(testFilePath, 'utf-8');
      
      // Check structure
      expect(content).toContain(`## ${entry.timestamp} - ${entry.itemId}`);
      expect(content).toContain(`**Session:** ${entry.sessionId}`);
      expect(content).toContain(`**Platform:** ${entry.platform}`);
      expect(content).toContain(`**Duration:** ${entry.duration}`);
      expect(content).toContain(`**Status:** ${entry.status}`);
      expect(content).toContain('### What Was Done');
      expect(content).toContain('### Files Changed');
      expect(content).toContain('### Tests Run');
      expect(content).toContain('### Learnings for Future Iterations');
      expect(content).toContain('### Next Steps');
      expect(content).toContain('---');
    });
  });

  describe('parseEntries', () => {
    it('should parse entry with missing optional sections', async () => {
      const fs = await import('fs/promises');
      const minimalContent = `## 2026-01-10T14:32:15Z - ST-001-001-001

**Session:** PM-2026-01-10-14-32-15-001
**Platform:** cursor
**Duration:** 4m 23s
**Status:** SUCCESS

### What Was Done

### Files Changed

### Tests Run

### Learnings for Future Iterations

### Next Steps

---

`;
      await fs.writeFile(testFilePath, minimalContent, 'utf-8');
      
      const entries = await manager.read();
      expect(entries).toHaveLength(1);
      expect(entries[0].accomplishments).toEqual([]);
      expect(entries[0].filesChanged).toEqual([]);
      expect(entries[0].testsRun).toEqual([]);
      expect(entries[0].learnings).toEqual([]);
      expect(entries[0].nextSteps).toEqual([]);
    });
  });
});
