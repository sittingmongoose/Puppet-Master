/**
 * Tests for UpdateDetector
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { writeFile, rm, mkdir } from 'fs/promises';
import { join } from 'path';
import { UpdateDetector } from './update-detector.js';
import type { FileSnapshot, UpdateResult } from './update-detector.js';
import { EventBus } from '../logging/event-bus.js';
import type { PuppetMasterEvent } from '../logging/event-bus.js';

describe('UpdateDetector', () => {
  const testDir = join(process.cwd(), '.test-update-detector');

  beforeEach(async () => {
    // Create test directory
    try {
      await mkdir(testDir, { recursive: true });
    } catch {
      // Directory might already exist
    }
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('constructor', () => {
    it('should create instance without event bus', () => {
      const detector = new UpdateDetector();
      expect(detector).toBeInstanceOf(UpdateDetector);
    });

    it('should create instance with event bus', () => {
      const eventBus = new EventBus();
      const detector = new UpdateDetector(eventBus);
      expect(detector).toBeInstanceOf(UpdateDetector);
    });
  });

  describe('getFileHash', () => {
    it('should calculate SHA-256 hash of file contents', async () => {
      const detector = new UpdateDetector();
      const filePath = join(testDir, 'test.txt');
      await writeFile(filePath, 'test content', 'utf-8');

      const hash = await detector.getFileHash(filePath);
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA-256 hex digest is 64 characters
    });

    it('should produce same hash for same content', async () => {
      const detector = new UpdateDetector();
      const filePath1 = join(testDir, 'test1.txt');
      const filePath2 = join(testDir, 'test2.txt');
      const content = 'same content';

      await writeFile(filePath1, content, 'utf-8');
      await writeFile(filePath2, content, 'utf-8');

      const hash1 = await detector.getFileHash(filePath1);
      const hash2 = await detector.getFileHash(filePath2);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different content', async () => {
      const detector = new UpdateDetector();
      const filePath1 = join(testDir, 'test1.txt');
      const filePath2 = join(testDir, 'test2.txt');

      await writeFile(filePath1, 'content 1', 'utf-8');
      await writeFile(filePath2, 'content 2', 'utf-8');

      const hash1 = await detector.getFileHash(filePath1);
      const hash2 = await detector.getFileHash(filePath2);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty files', async () => {
      const detector = new UpdateDetector();
      const filePath = join(testDir, 'empty.txt');
      await writeFile(filePath, '', 'utf-8');

      const hash = await detector.getFileHash(filePath);
      expect(hash).toBeTruthy();
      expect(hash.length).toBe(64);
    });

    it('should throw error for non-existent file', async () => {
      const detector = new UpdateDetector();
      const filePath = join(testDir, 'nonexistent.txt');

      await expect(detector.getFileHash(filePath)).rejects.toThrow();
    });
  });

  describe('takeSnapshot', () => {
    it('should create snapshot for existing file', async () => {
      const detector = new UpdateDetector();
      const filePath = join(testDir, 'test.txt');
      await writeFile(filePath, 'test content', 'utf-8');

      await detector.takeSnapshot([filePath]);

      // Access private snapshots via reflection or test via other methods
      const hasChanged = await detector.hasChanged(filePath);
      expect(hasChanged).toBe(false);
    });

    it('should create snapshots for multiple files', async () => {
      const detector = new UpdateDetector();
      const filePath1 = join(testDir, 'test1.txt');
      const filePath2 = join(testDir, 'test2.txt');
      await writeFile(filePath1, 'content 1', 'utf-8');
      await writeFile(filePath2, 'content 2', 'utf-8');

      await detector.takeSnapshot([filePath1, filePath2]);

      const hasChanged1 = await detector.hasChanged(filePath1);
      const hasChanged2 = await detector.hasChanged(filePath2);
      expect(hasChanged1).toBe(false);
      expect(hasChanged2).toBe(false);
    });

    it('should handle missing files gracefully', async () => {
      const detector = new UpdateDetector();
      const filePath = join(testDir, 'nonexistent.txt');

      // Should not throw
      await expect(detector.takeSnapshot([filePath])).resolves.not.toThrow();
    });

    it('should update snapshot if called multiple times', async () => {
      const detector = new UpdateDetector();
      const filePath = join(testDir, 'test.txt');
      await writeFile(filePath, 'initial content', 'utf-8');

      await detector.takeSnapshot([filePath]);
      const changed1 = await detector.hasChanged(filePath);
      expect(changed1).toBe(false);

      // Modify file
      await writeFile(filePath, 'modified content', 'utf-8');
      const changed2 = await detector.hasChanged(filePath);
      expect(changed2).toBe(true);

      // Take new snapshot
      await detector.takeSnapshot([filePath]);
      const changed3 = await detector.hasChanged(filePath);
      expect(changed3).toBe(false);
    });
  });

  describe('hasChanged', () => {
    it('should return false for unchanged file', async () => {
      const detector = new UpdateDetector();
      const filePath = join(testDir, 'test.txt');
      await writeFile(filePath, 'test content', 'utf-8');

      await detector.takeSnapshot([filePath]);
      const changed = await detector.hasChanged(filePath);

      expect(changed).toBe(false);
    });

    it('should return true for changed file', async () => {
      const detector = new UpdateDetector();
      const filePath = join(testDir, 'test.txt');
      await writeFile(filePath, 'initial content', 'utf-8');

      await detector.takeSnapshot([filePath]);
      await writeFile(filePath, 'modified content', 'utf-8');
      const changed = await detector.hasChanged(filePath);

      expect(changed).toBe(true);
    });

    it('should return false for file without snapshot', async () => {
      const detector = new UpdateDetector();
      const filePath = join(testDir, 'test.txt');
      await writeFile(filePath, 'test content', 'utf-8');

      const changed = await detector.hasChanged(filePath);
      expect(changed).toBe(false);
    });

    it('should return true if file is deleted after snapshot', async () => {
      const detector = new UpdateDetector();
      const filePath = join(testDir, 'test.txt');
      await writeFile(filePath, 'test content', 'utf-8');

      await detector.takeSnapshot([filePath]);
      await rm(filePath);

      const changed = await detector.hasChanged(filePath);
      expect(changed).toBe(true);
    });
  });

  describe('checkForUpdates', () => {
    it('should detect no updates when files unchanged', async () => {
      const detector = new UpdateDetector();
      const filePath = join(testDir, 'test.txt');
      await writeFile(filePath, 'test content', 'utf-8');

      await detector.takeSnapshot([filePath]);
      const result = await detector.checkForUpdates([filePath]);

      expect(result.hasUpdates).toBe(false);
      expect(result.updatedFiles).toHaveLength(0);
      expect(result.previousHashes.has(filePath)).toBe(true);
      expect(result.currentHashes.has(filePath)).toBe(true);
      expect(result.previousHashes.get(filePath)).toBe(result.currentHashes.get(filePath));
    });

    it('should detect updates when files changed', async () => {
      const detector = new UpdateDetector();
      const filePath = join(testDir, 'test.txt');
      await writeFile(filePath, 'initial content', 'utf-8');

      await detector.takeSnapshot([filePath]);
      await writeFile(filePath, 'modified content', 'utf-8');
      const result = await detector.checkForUpdates([filePath]);

      expect(result.hasUpdates).toBe(true);
      expect(result.updatedFiles).toContain(filePath);
      expect(result.previousHashes.get(filePath)).not.toBe(result.currentHashes.get(filePath));
    });

    it('should detect updates for multiple changed files', async () => {
      const detector = new UpdateDetector();
      const filePath1 = join(testDir, 'test1.txt');
      const filePath2 = join(testDir, 'test2.txt');
      await writeFile(filePath1, 'content 1', 'utf-8');
      await writeFile(filePath2, 'content 2', 'utf-8');

      await detector.takeSnapshot([filePath1, filePath2]);
      await writeFile(filePath1, 'modified 1', 'utf-8');
      await writeFile(filePath2, 'modified 2', 'utf-8');
      const result = await detector.checkForUpdates([filePath1, filePath2]);

      expect(result.hasUpdates).toBe(true);
      expect(result.updatedFiles).toHaveLength(2);
      expect(result.updatedFiles).toContain(filePath1);
      expect(result.updatedFiles).toContain(filePath2);
    });

    it('should detect partial updates when only some files changed', async () => {
      const detector = new UpdateDetector();
      const filePath1 = join(testDir, 'test1.txt');
      const filePath2 = join(testDir, 'test2.txt');
      await writeFile(filePath1, 'content 1', 'utf-8');
      await writeFile(filePath2, 'content 2', 'utf-8');

      await detector.takeSnapshot([filePath1, filePath2]);
      await writeFile(filePath1, 'modified 1', 'utf-8');
      // filePath2 unchanged
      const result = await detector.checkForUpdates([filePath1, filePath2]);

      expect(result.hasUpdates).toBe(true);
      expect(result.updatedFiles).toHaveLength(1);
      expect(result.updatedFiles).toContain(filePath1);
      expect(result.updatedFiles).not.toContain(filePath2);
    });

    it('should handle missing files in checkForUpdates', async () => {
      const detector = new UpdateDetector();
      const filePath = join(testDir, 'test.txt');
      await writeFile(filePath, 'test content', 'utf-8');

      await detector.takeSnapshot([filePath]);
      await rm(filePath);
      const result = await detector.checkForUpdates([filePath]);

      expect(result.hasUpdates).toBe(true);
      expect(result.updatedFiles).toContain(filePath);
      expect(result.previousHashes.has(filePath)).toBe(true);
      expect(result.currentHashes.get(filePath)).toBe('');
    });

    it('should handle files without snapshots', async () => {
      const detector = new UpdateDetector();
      const filePath = join(testDir, 'test.txt');
      await writeFile(filePath, 'test content', 'utf-8');

      // No snapshot taken
      const result = await detector.checkForUpdates([filePath]);

      expect(result.hasUpdates).toBe(false);
      expect(result.updatedFiles).toHaveLength(0);
      expect(result.currentHashes.has(filePath)).toBe(true);
      expect(result.previousHashes.has(filePath)).toBe(false);
    });

    it('should emit agents_updated event when changes detected', async () => {
      const eventBus = new EventBus();
      const detector = new UpdateDetector(eventBus);
      const filePath = join(testDir, 'test.txt');
      await writeFile(filePath, 'initial content', 'utf-8');

      const receivedEvents: PuppetMasterEvent[] = [];
      eventBus.subscribe('agents_updated', (event) => {
        receivedEvents.push(event);
      });

      await detector.takeSnapshot([filePath]);
      await writeFile(filePath, 'modified content', 'utf-8');
      await detector.checkForUpdates([filePath]);

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0].type).toBe('agents_updated');
      if (receivedEvents[0].type === 'agents_updated') {
        expect(receivedEvents[0].updatedFiles).toContain(filePath);
      }
    });

    it('should not emit event when no changes detected', async () => {
      const eventBus = new EventBus();
      const detector = new UpdateDetector(eventBus);
      const filePath = join(testDir, 'test.txt');
      await writeFile(filePath, 'test content', 'utf-8');

      const receivedEvents: PuppetMasterEvent[] = [];
      eventBus.subscribe('agents_updated', (event) => {
        receivedEvents.push(event);
      });

      await detector.takeSnapshot([filePath]);
      await detector.checkForUpdates([filePath]);

      expect(receivedEvents).toHaveLength(0);
    });

    it('should not emit event when event bus not provided', async () => {
      const detector = new UpdateDetector(); // No event bus
      const filePath = join(testDir, 'test.txt');
      await writeFile(filePath, 'initial content', 'utf-8');

      await detector.takeSnapshot([filePath]);
      await writeFile(filePath, 'modified content', 'utf-8');
      const result = await detector.checkForUpdates([filePath]);

      // Should still detect changes
      expect(result.hasUpdates).toBe(true);
      // But no event bus to emit to, so no error should occur
    });
  });

  describe('reset', () => {
    it('should clear all snapshots', async () => {
      const detector = new UpdateDetector();
      const filePath = join(testDir, 'test.txt');
      await writeFile(filePath, 'test content', 'utf-8');

      await detector.takeSnapshot([filePath]);
      const changed1 = await detector.hasChanged(filePath);
      expect(changed1).toBe(false);

      detector.reset();

      // After reset, hasChanged should return false (no snapshot)
      const changed2 = await detector.hasChanged(filePath);
      expect(changed2).toBe(false);

      // checkForUpdates should not find previous hashes
      const result = await detector.checkForUpdates([filePath]);
      expect(result.previousHashes.has(filePath)).toBe(false);
    });

    it('should allow taking new snapshots after reset', async () => {
      const detector = new UpdateDetector();
      const filePath = join(testDir, 'test.txt');
      await writeFile(filePath, 'initial content', 'utf-8');

      await detector.takeSnapshot([filePath]);
      detector.reset();

      await writeFile(filePath, 'new content', 'utf-8');
      await detector.takeSnapshot([filePath]);
      const changed = await detector.hasChanged(filePath);
      expect(changed).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle files with special characters in content', async () => {
      const detector = new UpdateDetector();
      const filePath = join(testDir, 'test.txt');
      const content = 'content with\nnewlines\tand\ttabs';
      await writeFile(filePath, content, 'utf-8');

      await detector.takeSnapshot([filePath]);
      const changed = await detector.hasChanged(filePath);
      expect(changed).toBe(false);

      await writeFile(filePath, 'different content', 'utf-8');
      const changed2 = await detector.hasChanged(filePath);
      expect(changed2).toBe(true);
    });

    it('should handle very large files', async () => {
      const detector = new UpdateDetector();
      const filePath = join(testDir, 'large.txt');
      const largeContent = 'x'.repeat(10000);
      await writeFile(filePath, largeContent, 'utf-8');

      await detector.takeSnapshot([filePath]);
      const changed = await detector.hasChanged(filePath);
      expect(changed).toBe(false);

      await writeFile(filePath, largeContent + 'y', 'utf-8');
      const changed2 = await detector.hasChanged(filePath);
      expect(changed2).toBe(true);
    });

    it('should handle unicode content', async () => {
      const detector = new UpdateDetector();
      const filePath = join(testDir, 'unicode.txt');
      const unicodeContent = 'Hello 世界 🌍';
      await writeFile(filePath, unicodeContent, 'utf-8');

      await detector.takeSnapshot([filePath]);
      const changed = await detector.hasChanged(filePath);
      expect(changed).toBe(false);

      await writeFile(filePath, 'Hello 世界 🌎', 'utf-8');
      const changed2 = await detector.hasChanged(filePath);
      expect(changed2).toBe(true);
    });
  });
});
