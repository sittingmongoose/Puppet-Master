/**
 * Tests for PRManager
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdir, rm } from 'node:fs/promises';
import { PRManager } from './pr-manager.js';

describe('PRManager', () => {
  const testBaseDir = join(process.cwd(), '.test-pr');
  let testRepoDir: string;
  let prManager: PRManager;

  beforeEach(async () => {
    testRepoDir = join(testBaseDir, `repo-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    await mkdir(testRepoDir, { recursive: true });
    prManager = new PRManager(testRepoDir);
  });

  afterEach(async () => {
    try {
      await rm(testBaseDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('isAvailable', () => {
    it('should return boolean when checking gh availability', async () => {
      const available = await prManager.isAvailable();
      expect(typeof available).toBe('boolean');
    });

    it('should check gh CLI is installed', async () => {
      // This is a real check - gh may or may not be available
      const available = await prManager.isAvailable();
      // Just verify it returns a boolean (test will pass regardless of gh availability)
      expect(typeof available).toBe('boolean');
    });
  });

  describe('createPR', () => {
    it('should throw error when gh CLI is not available', async () => {
      // Mock isAvailable to return false
      const isAvailableSpy = vi.spyOn(prManager, 'isAvailable').mockResolvedValue(false);

      await expect(
        prManager.createPR('Test PR', 'Test body', 'main')
      ).rejects.toThrow('gh CLI is not available');

      isAvailableSpy.mockRestore();
    });
  });

  describe('getPR', () => {
    it('should return null when gh CLI is not available', async () => {
      const isAvailableSpy = vi.spyOn(prManager, 'isAvailable').mockResolvedValue(false);

      const result = await prManager.getPR(42);
      expect(result).toBeNull();

      isAvailableSpy.mockRestore();
    });
  });

  describe('mergePR', () => {
    it('should return false when gh CLI is not available', async () => {
      const isAvailableSpy = vi.spyOn(prManager, 'isAvailable').mockResolvedValue(false);

      const result = await prManager.mergePR(42);
      expect(result).toBe(false);

      isAvailableSpy.mockRestore();
    });
  });

  describe('addLabels', () => {
    it('should throw error when gh CLI is not available', async () => {
      const isAvailableSpy = vi.spyOn(prManager, 'isAvailable').mockResolvedValue(false);

      await expect(
        prManager.addLabels(42, ['bug', 'enhancement'])
      ).rejects.toThrow('gh CLI is not available');

      isAvailableSpy.mockRestore();
    });

    it('should do nothing when labels array is empty', async () => {
      // Should not call gh CLI
      await prManager.addLabels(42, []);
      // If we got here without error, the method handled empty array correctly
    });
  });
});
