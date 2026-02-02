/**
 * Tests for IterationLogger
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile, readdir, unlink, rmdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname as pathDirname } from 'path';
import { tmpdir } from 'os';
import { IterationLogger, type IterationLog } from './iteration-logger.js';
import type { IterationResult } from '../core/execution-engine.js';
import type { Platform } from '../types/index.js';

describe('IterationLogger', () => {
  let tempDir: string;
  let logger: IterationLogger;
  const sessionId = 'PM-2026-01-10-14-30-00-001';

  beforeEach(() => {
    tempDir = join(tmpdir(), `iteration-logger-test-${Date.now()}`);
    logger = new IterationLogger(tempDir, sessionId);
  });

  afterEach(async () => {
    // Cleanup temp files
    if (existsSync(tempDir)) {
      try {
        const iterationsDir = join(tempDir, 'iterations');
        if (existsSync(iterationsDir)) {
          const subtaskDirs = await readdir(iterationsDir);
          for (const subtaskDir of subtaskDirs) {
            const subtaskPath = join(iterationsDir, subtaskDir);
            const files = await readdir(subtaskPath);
            for (const file of files) {
              await unlink(join(subtaskPath, file)).catch(() => {});
            }
            await rmdir(subtaskPath).catch(() => {});
          }
          await rmdir(iterationsDir).catch(() => {});
        }
        await rmdir(tempDir).catch(() => {});
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  describe('startIteration', () => {
    it('should create log file with correct structure', async () => {
      const subtaskId = 'ST-001-001-001';
      const platform: Platform = 'cursor';
      const prompt = 'Test prompt';

      const iterationId = await logger.startIteration(subtaskId, platform, prompt);

      expect(iterationId).toBe(`${subtaskId}-iter-001`);

      const logPath = join(tempDir, 'iterations', subtaskId, '001.json');
      expect(existsSync(logPath)).toBe(true);

      const content = await readFile(logPath, 'utf8');
      const log: IterationLog = JSON.parse(content);

      expect(log.iterationId).toBe(iterationId);
      expect(log.subtaskId).toBe(subtaskId);
      expect(log.sessionId).toBe(sessionId);
      expect(log.platform).toBe(platform);
      expect(log.prompt).toBe(prompt);
      expect(log.startedAt).toBeDefined();
      expect(log.filesChanged).toEqual([]);
      expect(log.testsRun).toEqual([]);
      expect(log.completedAt).toBeUndefined();
      expect(log.durationMs).toBeUndefined();
    });

    it('should generate unique iteration IDs', async () => {
      const subtaskId = 'ST-001-001-001';
      const platform: Platform = 'cursor';
      const prompt = 'Test prompt';

      const id1 = await logger.startIteration(subtaskId, platform, prompt);
      const id2 = await logger.startIteration(subtaskId, platform, prompt);
      const id3 = await logger.startIteration(subtaskId, platform, prompt);

      expect(id1).toBe(`${subtaskId}-iter-001`);
      expect(id2).toBe(`${subtaskId}-iter-002`);
      expect(id3).toBe(`${subtaskId}-iter-003`);
    });

    it('should create directory structure automatically', async () => {
      const subtaskId = 'ST-001-001-001';
      const platform: Platform = 'cursor';
      const prompt = 'Test prompt';

      await logger.startIteration(subtaskId, platform, prompt);

      const iterationsDir = join(tempDir, 'iterations');
      const subtaskDir = join(iterationsDir, subtaskId);

      expect(existsSync(iterationsDir)).toBe(true);
      expect(existsSync(subtaskDir)).toBe(true);
    });

    it('should handle different subtasks independently', async () => {
      const subtaskId1 = 'ST-001-001-001';
      const subtaskId2 = 'ST-001-001-002';
      const platform: Platform = 'cursor';
      const prompt = 'Test prompt';

      const id1 = await logger.startIteration(subtaskId1, platform, prompt);
      const id2 = await logger.startIteration(subtaskId2, platform, prompt);

      expect(id1).toBe(`${subtaskId1}-iter-001`);
      expect(id2).toBe(`${subtaskId2}-iter-001`);

      const logPath1 = join(tempDir, 'iterations', subtaskId1, '001.json');
      const logPath2 = join(tempDir, 'iterations', subtaskId2, '001.json');

      expect(existsSync(logPath1)).toBe(true);
      expect(existsSync(logPath2)).toBe(true);
    });
  });

  describe('logOutput', () => {
    it('should update existing iteration log with output', async () => {
      const subtaskId = 'ST-001-001-001';
      const platform: Platform = 'cursor';
      const prompt = 'Test prompt';
      const output = 'Test output from agent';

      const iterationId = await logger.startIteration(subtaskId, platform, prompt);
      await logger.logOutput(iterationId, output);

      const logPath = join(tempDir, 'iterations', subtaskId, '001.json');
      const content = await readFile(logPath, 'utf8');
      const log: IterationLog = JSON.parse(content);

      expect(log.output).toBe(output);
      expect(log.prompt).toBe(prompt); // Original prompt should remain
    });

    it('should load from disk if not in memory', async () => {
      const subtaskId = 'ST-001-001-001';
      const platform: Platform = 'cursor';
      const prompt = 'Test prompt';
      const output = 'Test output';

      const iterationId = await logger.startIteration(subtaskId, platform, prompt);

      // Create a new logger instance (simulating different process)
      const logger2 = new IterationLogger(tempDir, sessionId);
      await logger2.logOutput(iterationId, output);

      const log = await logger2.getIterationLog(iterationId);
      expect(log).not.toBeNull();
      expect(log!.output).toBe(output);
    });

    it('should throw error for non-existent iteration', async () => {
      await expect(
        logger.logOutput('ST-001-001-001-iter-999', 'output')
      ).rejects.toThrow('Iteration ST-001-001-001-iter-999 not found');
    });
  });

  describe('completeIteration', () => {
    it('should finalize log with result data', async () => {
      const subtaskId = 'ST-001-001-001';
      const platform: Platform = 'cursor';
      const prompt = 'Test prompt';
      const output = 'Test output';

      const iterationId = await logger.startIteration(subtaskId, platform, prompt);
      await logger.logOutput(iterationId, output);

      const result: IterationResult = {
        success: true,
        output,
        processId: 12345,
        duration: 5000,
        exitCode: 0,
        completionSignal: 'COMPLETE',
        learnings: ['Learning 1', 'Learning 2'],
        filesChanged: ['src/file1.ts', 'src/file2.ts'],
      };

      await logger.completeIteration(iterationId, result);

      const logPath = join(tempDir, 'iterations', subtaskId, '001.json');
      const content = await readFile(logPath, 'utf8');
      const log: IterationLog = JSON.parse(content);

      expect(log.completedAt).toBeDefined();
      expect(log.durationMs).toBe(5000);
      expect(log.exitCode).toBe(0);
      expect(log.completionSignal).toBe('COMPLETE');
      expect(log.filesChanged).toEqual(['src/file1.ts', 'src/file2.ts']);
      expect(log.output).toBe(output);
    });

    it('should handle result without completion signal', async () => {
      const subtaskId = 'ST-001-001-001';
      const platform: Platform = 'cursor';
      const prompt = 'Test prompt';

      const iterationId = await logger.startIteration(subtaskId, platform, prompt);

      const result: IterationResult = {
        success: false,
        output: 'Error output',
        processId: 12345,
        duration: 3000,
        exitCode: 1,
        learnings: [],
        filesChanged: [],
      };

      await logger.completeIteration(iterationId, result);

      const log = await logger.getIterationLog(iterationId);
      expect(log).not.toBeNull();
      expect(log!.completionSignal).toBeNull();
      expect(log!.exitCode).toBe(1);
    });

    it('should load from disk if not in memory', async () => {
      const subtaskId = 'ST-001-001-001';
      const platform: Platform = 'cursor';
      const prompt = 'Test prompt';

      const iterationId = await logger.startIteration(subtaskId, platform, prompt);

      // Create a new logger instance
      const logger2 = new IterationLogger(tempDir, sessionId);

      const result: IterationResult = {
        success: true,
        output: 'Output',
        processId: 12345,
        duration: 1000,
        exitCode: 0,
        learnings: [],
        filesChanged: [],
      };

      await logger2.completeIteration(iterationId, result);

      const log = await logger2.getIterationLog(iterationId);
      expect(log).not.toBeNull();
      expect(log!.completedAt).toBeDefined();
    });
  });

  describe('getIterationLog', () => {
    it('should retrieve existing log', async () => {
      const subtaskId = 'ST-001-001-001';
      const platform: Platform = 'cursor';
      const prompt = 'Test prompt';

      const iterationId = await logger.startIteration(subtaskId, platform, prompt);

      const log = await logger.getIterationLog(iterationId);

      expect(log).not.toBeNull();
      expect(log!.iterationId).toBe(iterationId);
      expect(log!.subtaskId).toBe(subtaskId);
      expect(log!.prompt).toBe(prompt);
    });

    it('should return null for non-existent log', async () => {
      const log = await logger.getIterationLog('ST-001-001-001-iter-999');
      expect(log).toBeNull();
    });

    it('should return null for invalid iteration ID format', async () => {
      const log = await logger.getIterationLog('invalid-id');
      expect(log).toBeNull();
    });

    it('should return copy of active iteration', async () => {
      const subtaskId = 'ST-001-001-001';
      const platform: Platform = 'cursor';
      const prompt = 'Test prompt';

      const iterationId = await logger.startIteration(subtaskId, platform, prompt);

      const log1 = await logger.getIterationLog(iterationId);
      const log2 = await logger.getIterationLog(iterationId);

      expect(log1).not.toBeNull();
      expect(log2).not.toBeNull();
      // Should be different objects (copies)
      expect(log1).not.toBe(log2);
    });
  });

  describe('getIterationsForSubtask', () => {
    it('should return all iterations for a subtask', async () => {
      const subtaskId = 'ST-001-001-001';
      const platform: Platform = 'cursor';
      const prompt = 'Test prompt';

      await logger.startIteration(subtaskId, platform, prompt);
      await logger.startIteration(subtaskId, platform, prompt);
      await logger.startIteration(subtaskId, platform, prompt);

      const logs = await logger.getIterationsForSubtask(subtaskId);

      expect(logs.length).toBe(3);
      expect(logs[0]!.iterationId).toBe(`${subtaskId}-iter-001`);
      expect(logs[1]!.iterationId).toBe(`${subtaskId}-iter-002`);
      expect(logs[2]!.iterationId).toBe(`${subtaskId}-iter-003`);
    });

    it('should return empty array for non-existent subtask', async () => {
      const logs = await logger.getIterationsForSubtask('ST-999-999-999');
      expect(logs).toEqual([]);
    });

    it('should sort iterations by iteration number', async () => {
      const subtaskId = 'ST-001-001-001';
      const platform: Platform = 'cursor';
      const prompt = 'Test prompt';

      // Create iterations out of order
      await logger.startIteration(subtaskId, platform, prompt);
      await logger.startIteration(subtaskId, platform, prompt);
      await logger.startIteration(subtaskId, platform, prompt);

      const logs = await logger.getIterationsForSubtask(subtaskId);

      expect(logs.length).toBe(3);
      // Verify sorted order
      for (let i = 0; i < logs.length; i++) {
        const expectedNum = String(i + 1).padStart(3, '0');
        expect(logs[i]!.iterationId).toBe(`${subtaskId}-iter-${expectedNum}`);
      }
    });

    it('should handle multiple subtasks independently', async () => {
      const subtaskId1 = 'ST-001-001-001';
      const subtaskId2 = 'ST-001-001-002';
      const platform: Platform = 'cursor';
      const prompt = 'Test prompt';

      await logger.startIteration(subtaskId1, platform, prompt);
      await logger.startIteration(subtaskId1, platform, prompt);
      await logger.startIteration(subtaskId2, platform, prompt);

      const logs1 = await logger.getIterationsForSubtask(subtaskId1);
      const logs2 = await logger.getIterationsForSubtask(subtaskId2);

      expect(logs1.length).toBe(2);
      expect(logs2.length).toBe(1);
    });

    it('should skip invalid JSON files', async () => {
      const subtaskId = 'ST-001-001-001';
      const platform: Platform = 'cursor';
      const prompt = 'Test prompt';

      await logger.startIteration(subtaskId, platform, prompt);

      // Manually create an invalid JSON file
      const invalidPath = join(tempDir, 'iterations', subtaskId, '999.json');
      const { writeFile, mkdir } = await import('fs/promises');
      await mkdir(pathDirname(invalidPath), { recursive: true });
      await writeFile(invalidPath, 'invalid json', 'utf8');

      const logs = await logger.getIterationsForSubtask(subtaskId);

      // Should only return the valid log
      expect(logs.length).toBe(1);
      expect(logs[0]!.iterationId).toBe(`${subtaskId}-iter-001`);
    });
  });

  describe('concurrent iterations', () => {
    it('should handle concurrent iterations for same subtask', async () => {
      const subtaskId = 'ST-001-001-001';
      const platform: Platform = 'cursor';
      const prompt = 'Test prompt';

      // Start multiple iterations concurrently
      const promises = [
        logger.startIteration(subtaskId, platform, prompt),
        logger.startIteration(subtaskId, platform, prompt),
        logger.startIteration(subtaskId, platform, prompt),
      ];

      const iterationIds = await Promise.all(promises);

      expect(iterationIds.length).toBe(3);
      expect(iterationIds[0]).toBe(`${subtaskId}-iter-001`);
      expect(iterationIds[1]).toBe(`${subtaskId}-iter-002`);
      expect(iterationIds[2]).toBe(`${subtaskId}-iter-003`);
    });
  });

  describe('JSON formatting', () => {
    it('should format JSON with 2-space indent', async () => {
      const subtaskId = 'ST-001-001-001';
      const platform: Platform = 'cursor';
      const prompt = 'Test prompt';

      await logger.startIteration(subtaskId, platform, prompt);

      const logPath = join(tempDir, 'iterations', subtaskId, '001.json');
      const content = await readFile(logPath, 'utf8');

      // Check that it's pretty-printed (has newlines and indentation)
      expect(content).toContain('\n');
      expect(content).toContain('  '); // 2-space indent

      // Verify it's valid JSON
      const log = JSON.parse(content);
      expect(log).toBeDefined();
    });
  });
});
