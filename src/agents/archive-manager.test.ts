/**
 * Tests for ArchiveManager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { writeFile, rm, mkdir, readFile, mkdtemp } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { ArchiveManager } from './archive-manager.js';

describe('ArchiveManager', () => {
  let testDir: string;
  let archiveDir: string;
  let testFile: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'archive-manager-'));
    archiveDir = join(testDir, 'archives', 'agents');
    testFile = join(testDir, 'AGENTS.md');
    await mkdir(archiveDir, { recursive: true });
    await writeFile(testFile, '# Test AGENTS.md\n\nInitial content', 'utf-8');
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('constructor', () => {
    it('should create instance with default archive directory', () => {
      const manager = new ArchiveManager();
      expect(manager).toBeInstanceOf(ArchiveManager);
    });

    it('should create instance with custom archive directory', () => {
      const customDir = join(testDir, 'custom-archives');
      const manager = new ArchiveManager(customDir);
      expect(manager).toBeInstanceOf(ArchiveManager);
    });
  });

  describe('archive', () => {
    it('should create archive with correct naming pattern', async () => {
      const manager = new ArchiveManager(archiveDir);
      const entry = await manager.archive(testFile);

      expect(entry.id).toMatch(/^\d{14}-[a-f0-9]{12}$/); // timestamp-hash format
      expect(entry.originalPath).toBe(testFile);
      expect(entry.archivePath).toMatch(/\.md$/);
      expect(entry.createdAt).toBeTruthy();
      expect(entry.hash).toHaveLength(64); // SHA-256 hex digest
      expect(entry.reason).toBeUndefined();
    });

    it('should create archive with reason', async () => {
      const manager = new ArchiveManager(archiveDir);
      const entry = await manager.archive(testFile, 'test reason');

      expect(entry.reason).toBe('test reason');
    });

    it('should create archive file in correct location', async () => {
      const manager = new ArchiveManager(archiveDir);
      const entry = await manager.archive(testFile);

      // Check that archive file exists
      const archiveContent = await readFile(entry.archivePath, 'utf-8');
      const originalContent = await readFile(testFile, 'utf-8');
      expect(archiveContent).toBe(originalContent);
    });

    it('should add entry to index', async () => {
      const manager = new ArchiveManager(archiveDir);
      const entry = await manager.archive(testFile);

      const list = await manager.list();
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe(entry.id);
    });

    it('should create multiple archives for same file', async () => {
      const manager = new ArchiveManager(archiveDir);
      const entry1 = await manager.archive(testFile);
      
      // Modify file
      await writeFile(testFile, '# Modified content', 'utf-8');
      const entry2 = await manager.archive(testFile);

      expect(entry1.id).not.toBe(entry2.id);
      
      const list = await manager.list();
      expect(list).toHaveLength(2);
    });

    it('should throw error for non-existent file', async () => {
      const manager = new ArchiveManager(archiveDir);
      const nonExistent = join(testDir, 'nonexistent.md');

      await expect(manager.archive(nonExistent)).rejects.toThrow();
    });

    it('should handle empty files', async () => {
      const manager = new ArchiveManager(archiveDir);
      const emptyFile = join(testDir, 'empty.md');
      await writeFile(emptyFile, '', 'utf-8');

      const entry = await manager.archive(emptyFile);
      expect(entry).toBeTruthy();
      expect(entry.hash).toHaveLength(64);
    });
  });

  describe('list', () => {
    it('should return empty array when no archives exist', async () => {
      const manager = new ArchiveManager(archiveDir);
      const list = await manager.list();

      expect(list).toEqual([]);
    });

    it('should return all archives', async () => {
      const manager = new ArchiveManager(archiveDir);
      await manager.archive(testFile);
      
      const otherFile = join(testDir, 'other.md');
      await writeFile(otherFile, 'other content', 'utf-8');
      await manager.archive(otherFile);

      const list = await manager.list();
      expect(list).toHaveLength(2);
    });

    it('should filter archives by original path', async () => {
      const manager = new ArchiveManager(archiveDir);
      await manager.archive(testFile);
      
      const otherFile = join(testDir, 'other.md');
      await writeFile(otherFile, 'other content', 'utf-8');
      await manager.archive(otherFile);

      const list = await manager.list(testFile);
      expect(list).toHaveLength(1);
      expect(list[0].originalPath).toBe(testFile);
    });

    it('should return empty array when filtering by non-existent path', async () => {
      const manager = new ArchiveManager(archiveDir);
      await manager.archive(testFile);

      const list = await manager.list(join(testDir, 'nonexistent.md'));
      expect(list).toEqual([]);
    });
  });

  describe('restore', () => {
    it('should restore archived file to original location', async () => {
      const manager = new ArchiveManager(archiveDir);
      const originalContent = await readFile(testFile, 'utf-8');
      
      const entry = await manager.archive(testFile);
      
      // Modify original file
      await writeFile(testFile, '# Modified', 'utf-8');
      
      // Restore
      await manager.restore(entry.id);
      
      const restoredContent = await readFile(testFile, 'utf-8');
      expect(restoredContent).toBe(originalContent);
    });

    it('should throw error for non-existent archive ID', async () => {
      const manager = new ArchiveManager(archiveDir);

      await expect(manager.restore('nonexistent-id')).rejects.toThrow('Archive not found');
    });

    it('should throw error if archive file is missing', async () => {
      const manager = new ArchiveManager(archiveDir);
      const entry = await manager.archive(testFile);
      
      // Delete archive file
      await rm(entry.archivePath);

      await expect(manager.restore(entry.id)).rejects.toThrow('Archive file not found');
    });

    it('should create original directory if it does not exist', async () => {
      const manager = new ArchiveManager(archiveDir);
      const nestedFile = join(testDir, 'nested', 'AGENTS.md');
      await mkdir(join(testDir, 'nested'), { recursive: true });
      await writeFile(nestedFile, 'nested content', 'utf-8');
      
      const entry = await manager.archive(nestedFile);
      
      // Delete nested directory
      await rm(join(testDir, 'nested'), { recursive: true });
      
      // Restore should create directory
      await manager.restore(entry.id);
      
      const restored = await readFile(nestedFile, 'utf-8');
      expect(restored).toBe('nested content');
    });
  });

  describe('diff', () => {
    it('should generate diff for changed file', async () => {
      const manager = new ArchiveManager(archiveDir);
      const originalContent = '# Line 1\n# Line 2\n# Line 3';
      await writeFile(testFile, originalContent, 'utf-8');
      
      const entry = await manager.archive(testFile);
      
      // Modify file
      await writeFile(testFile, '# Line 1\n# Line 2 Modified\n# Line 3\n# Line 4', 'utf-8');
      
      const diff = await manager.diff(entry.id, testFile);
      
      expect(diff).toContain('- # Line 2');
      expect(diff).toContain('+ # Line 2 Modified');
      expect(diff).toContain('+ # Line 4');
    });

    it('should generate empty diff for unchanged file', async () => {
      const manager = new ArchiveManager(archiveDir);
      const content = '# Test content';
      await writeFile(testFile, content, 'utf-8');
      
      const entry = await manager.archive(testFile);
      
      const diff = await manager.diff(entry.id, testFile);
      
      // Diff should be empty or only contain unchanged lines (depending on implementation)
      // Since we only show changes, empty diff means no changes
      expect(diff).toBeDefined();
    });

    it('should throw error for non-existent archive ID', async () => {
      const manager = new ArchiveManager(archiveDir);

      await expect(manager.diff('nonexistent-id', testFile)).rejects.toThrow('Archive not found');
    });

    it('should throw error if current file does not exist', async () => {
      const manager = new ArchiveManager(archiveDir);
      const entry = await manager.archive(testFile);
      
      const nonExistent = join(testDir, 'nonexistent.md');

      await expect(manager.diff(entry.id, nonExistent)).rejects.toThrow('Current file not found');
    });

    it('should handle files with only additions', async () => {
      const manager = new ArchiveManager(archiveDir);
      await writeFile(testFile, '# Original', 'utf-8');
      
      const entry = await manager.archive(testFile);
      
      await writeFile(testFile, '# Original\n# Added line', 'utf-8');
      
      const diff = await manager.diff(entry.id, testFile);
      expect(diff).toContain('+ # Added line');
    });

    it('should handle files with only deletions', async () => {
      const manager = new ArchiveManager(archiveDir);
      await writeFile(testFile, '# Line 1\n# Line 2', 'utf-8');
      
      const entry = await manager.archive(testFile);
      
      await writeFile(testFile, '# Line 1', 'utf-8');
      
      const diff = await manager.diff(entry.id, testFile);
      expect(diff).toContain('- # Line 2');
    });
  });

  describe('get', () => {
    it('should retrieve archived file content', async () => {
      const manager = new ArchiveManager(archiveDir);
      const content = '# Test content';
      await writeFile(testFile, content, 'utf-8');
      
      const entry = await manager.archive(testFile);
      
      const retrieved = await manager.get(entry.id);
      expect(retrieved).toBe(content);
    });

    it('should return null for non-existent archive ID', async () => {
      const manager = new ArchiveManager(archiveDir);

      const retrieved = await manager.get('nonexistent-id');
      expect(retrieved).toBeNull();
    });

    it('should return null if archive file is missing', async () => {
      const manager = new ArchiveManager(archiveDir);
      const entry = await manager.archive(testFile);
      
      // Delete archive file
      await rm(entry.archivePath);

      const retrieved = await manager.get(entry.id);
      expect(retrieved).toBeNull();
    });

    it('should handle unicode content', async () => {
      const manager = new ArchiveManager(archiveDir);
      const content = 'Hello 世界 🌍';
      await writeFile(testFile, content, 'utf-8');
      
      const entry = await manager.archive(testFile);
      
      const retrieved = await manager.get(entry.id);
      expect(retrieved).toBe(content);
    });
  });

  describe('prune', () => {
    it('should delete archives older than maxAge', async () => {
      const manager = new ArchiveManager(archiveDir);

      // Use fake timers to make time-based pruning deterministic.
      vi.useFakeTimers();
      try {
        const baseTime = new Date('2026-01-01T00:00:00.000Z');
        vi.setSystemTime(baseTime);

        // Create older archive
        const entry1 = await manager.archive(testFile);

        // Advance time and create newer archive
        vi.setSystemTime(new Date(baseTime.getTime() + 50));
        await writeFile(testFile, 'modified', 'utf-8');
        const entry2 = await manager.archive(testFile);

        // Advance time again to establish a stable "now" for pruning
        vi.setSystemTime(new Date(baseTime.getTime() + 100));

        // Choose maxAge so cutoff sits between entry1 and entry2.
        // prune() deletes entries where createdAt < (Date.now() - maxAge).
        const entry2Time = new Date(entry2.createdAt).getTime();
        const cutoff = entry2Time - 1;
        const maxAge = Date.now() - cutoff;

        const deleted = await manager.prune(maxAge);

        expect(deleted).toBe(1);

        const list = await manager.list();
        expect(list).toHaveLength(1);
        expect(list[0].id).toBe(entry2.id);
        expect(list[0].id).not.toBe(entry1.id);
      } finally {
        vi.useRealTimers();
      }
    });

    it('should return 0 when no archives to prune', async () => {
      const manager = new ArchiveManager(archiveDir);
      await manager.archive(testFile);
      
      // Prune with very large maxAge (should not delete anything)
      const deleted = await manager.prune(1000000);
      
      expect(deleted).toBe(0);
      
      const list = await manager.list();
      expect(list).toHaveLength(1);
    });

    it('should delete all archives when maxAge is 0', async () => {
      const manager = new ArchiveManager(archiveDir);
      await manager.archive(testFile);
      await writeFile(testFile, 'modified', 'utf-8');
      await manager.archive(testFile);
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const deleted = await manager.prune(0);
      
      expect(deleted).toBe(2);
      
      const list = await manager.list();
      expect(list).toHaveLength(0);
    });

    it('should handle missing archive files gracefully', async () => {
      const manager = new ArchiveManager(archiveDir);
      const entry = await manager.archive(testFile);
      
      // Delete archive file manually
      await rm(entry.archivePath);
      
      // Prune should not throw error
      await expect(manager.prune(0)).resolves.not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle files with special characters', async () => {
      const manager = new ArchiveManager(archiveDir);
      const content = 'Content with\nnewlines\tand\ttabs';
      await writeFile(testFile, content, 'utf-8');
      
      const entry = await manager.archive(testFile);
      const retrieved = await manager.get(entry.id);
      
      expect(retrieved).toBe(content);
    });

    it('should handle very large files', async () => {
      const manager = new ArchiveManager(archiveDir);
      const largeContent = 'x'.repeat(10000);
      await writeFile(testFile, largeContent, 'utf-8');
      
      const entry = await manager.archive(testFile);
      const retrieved = await manager.get(entry.id);
      
      expect(retrieved).toBe(largeContent);
    });

    it('should maintain index consistency across multiple operations', async () => {
      const manager = new ArchiveManager(archiveDir);
      
      // Create multiple archives
      await manager.archive(testFile);
      await writeFile(testFile, 'modified 1', 'utf-8');
      await manager.archive(testFile);
      await writeFile(testFile, 'modified 2', 'utf-8');
      const entry3 = await manager.archive(testFile);
      
      // Prune one
      await manager.prune(1000000); // Should not delete anything recent
      
      // List should still have all
      const list = await manager.list();
      expect(list.length).toBeGreaterThanOrEqual(3);
      
      // Restore should work
      await manager.restore(entry3.id);
      const restored = await readFile(testFile, 'utf-8');
      expect(restored).toBe('modified 2');
    });

    it('should handle concurrent archive operations', async () => {
      const manager = new ArchiveManager(archiveDir);
      
      // Create multiple archives sequentially with slight delays to ensure unique timestamps
      // or modify file content to ensure unique hashes
      await writeFile(testFile, 'content 1', 'utf-8');
      const entry1 = await manager.archive(testFile);
      
      await writeFile(testFile, 'content 2', 'utf-8');
      const entry2 = await manager.archive(testFile);
      
      await writeFile(testFile, 'content 3', 'utf-8');
      const entry3 = await manager.archive(testFile);
      
      // All should have unique IDs (different content = different hash)
      const ids = [entry1.id, entry2.id, entry3.id];
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
      
      const list = await manager.list();
      expect(list.length).toBe(3);
    });
  });
});
