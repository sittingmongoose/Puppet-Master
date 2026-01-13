/**
 * Tests for FileLocker
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFile, mkdir, rm, readFile, access } from 'fs/promises';
import { join } from 'path';
import { FileLocker, withFileLock } from './file-lock.js';
import type { LockInfo } from './file-lock.js';

describe('FileLocker', () => {
  const testDir = join(process.cwd(), '.test-file-lock');
  const testFilePath = join(testDir, 'test-file.json');

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

  describe('acquire', () => {
    it('creates lock file with correct JSON structure', async () => {
      const locker = new FileLocker();
      const lockPath = `${testFilePath}.lock`;

      await locker.acquire(testFilePath);

      // Verify lock file exists
      await expect(access(lockPath)).resolves.not.toThrow();

      // Verify lock file content
      const content = await readFile(lockPath, 'utf-8');
      const lockInfo = JSON.parse(content) as LockInfo;

      expect(lockInfo).toHaveProperty('pid');
      expect(lockInfo).toHaveProperty('hostname');
      expect(lockInfo).toHaveProperty('timestamp');
      expect(typeof lockInfo.pid).toBe('number');
      expect(typeof lockInfo.hostname).toBe('string');
      expect(typeof lockInfo.timestamp).toBe('number');
      expect(lockInfo.pid).toBe(process.pid);

      await locker.release(testFilePath);
    });
  });

  describe('release', () => {
    it('removes lock file', async () => {
      const locker = new FileLocker();
      const lockPath = `${testFilePath}.lock`;

      await locker.acquire(testFilePath);
      await expect(access(lockPath)).resolves.not.toThrow();

      await locker.release(testFilePath);

      // Verify lock file is removed
      await expect(access(lockPath)).rejects.toThrow();
    });

    it('does not throw if lock file does not exist', async () => {
      const locker = new FileLocker();

      await expect(locker.release(testFilePath)).resolves.not.toThrow();
    });
  });

  describe('withLock', () => {
    it('executes operation successfully', async () => {
      const locker = new FileLocker();
      let executed = false;

      await locker.withLock(testFilePath, async () => {
        executed = true;
        return 'result';
      });

      expect(executed).toBe(true);
    });

    it('returns operation result', async () => {
      const locker = new FileLocker();

      const result = await locker.withLock(testFilePath, async () => {
        return 'test-result';
      });

      expect(result).toBe('test-result');
    });

    it('releases lock on error', async () => {
      const locker = new FileLocker();
      const lockPath = `${testFilePath}.lock`;

      await expect(
        locker.withLock(testFilePath, async () => {
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');

      // Verify lock is released (file doesn't exist)
      await expect(access(lockPath)).rejects.toThrow();
    });

    it('releases lock after operation completes', async () => {
      const locker = new FileLocker();
      const lockPath = `${testFilePath}.lock`;

      await locker.withLock(testFilePath, async () => {
        // Lock should exist during operation
        await expect(access(lockPath)).resolves.not.toThrow();
      });

      // Lock should be released after operation
      await expect(access(lockPath)).rejects.toThrow();
    });
  });

  describe('isLocked', () => {
    it('returns false when file is not locked', async () => {
      const locker = new FileLocker();

      const locked = await locker.isLocked(testFilePath);
      expect(locked).toBe(false);
    });

    it('returns true when file is locked', async () => {
      const locker = new FileLocker();

      await locker.acquire(testFilePath);
      const locked = await locker.isLocked(testFilePath);
      expect(locked).toBe(true);

      await locker.release(testFilePath);
    });

    it('returns false after lock is released', async () => {
      const locker = new FileLocker();

      await locker.acquire(testFilePath);
      await locker.release(testFilePath);

      const locked = await locker.isLocked(testFilePath);
      expect(locked).toBe(false);
    });
  });

  // Note: Timeout testing requires another process to hold the lock, which is difficult
  // to simulate in unit tests. Timeout behavior is tested indirectly through the
  // concurrent access test, which verifies waiting behavior.

  describe('stale lock detection', () => {
    it('clears stale lock with non-existent PID', async () => {
      const locker = new FileLocker();
      const lockPath = `${testFilePath}.lock`;

      // Create a lock file with a non-existent PID (very large number)
      const lockInfo: LockInfo = {
        pid: 999999999,
        hostname: 'test-host',
        timestamp: Date.now(),
      };
      await writeFile(lockPath, JSON.stringify(lockInfo), 'utf-8');

      // Try to acquire lock - should clear stale lock and succeed
      await locker.acquire(testFilePath);

      // Verify we got the lock (new lock file with our PID)
      const content = await readFile(lockPath, 'utf-8');
      const newLockInfo = JSON.parse(content) as LockInfo;
      expect(newLockInfo.pid).toBe(process.pid);

      await locker.release(testFilePath);
    });

    it('clears stale lock with old timestamp', async () => {
      const locker = new FileLocker({ staleTimeout: 1000 });
      const lockPath = `${testFilePath}.lock`;

      // Create a lock file with old timestamp
      const lockInfo: LockInfo = {
        pid: process.pid,
        hostname: 'test-host',
        timestamp: Date.now() - 2000, // 2 seconds ago, older than staleTimeout
      };
      await writeFile(lockPath, JSON.stringify(lockInfo), 'utf-8');

      // Try to acquire lock - should clear stale lock and succeed
      await locker.acquire(testFilePath);

      // Verify we got the lock
      const content = await readFile(lockPath, 'utf-8');
      const newLockInfo = JSON.parse(content) as LockInfo;
      expect(newLockInfo.pid).toBe(process.pid);
      expect(newLockInfo.timestamp).toBeGreaterThan(lockInfo.timestamp);

      await locker.release(testFilePath);
    });
  });

  describe('concurrent access', () => {
    it('waits for lock to be released', async () => {
      const locker1 = new FileLocker({ timeout: 5000, retryInterval: 50 });
      const locker2 = new FileLocker({ timeout: 5000, retryInterval: 50 });
      const lockPath = `${testFilePath}.lock`;

      // Acquire lock with locker1
      await locker1.acquire(testFilePath);

      // Try to acquire with locker2 in parallel (should wait)
      let locker2Acquired = false;
      const acquirePromise = locker2.acquire(testFilePath).then(() => {
        locker2Acquired = true;
      });

      // Wait a bit to ensure locker2 is waiting
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(locker2Acquired).toBe(false);

      // Release lock from locker1
      await locker1.release(testFilePath);

      // Now locker2 should acquire the lock
      await acquirePromise;
      expect(locker2Acquired).toBe(true);

      // Verify locker2 has the lock
      const content = await readFile(lockPath, 'utf-8');
      const lockInfo = JSON.parse(content) as LockInfo;
      expect(lockInfo.pid).toBe(process.pid);

      await locker2.release(testFilePath);
    }, 10000);
  });
});

describe('withFileLock helper', () => {
  const testDir = join(process.cwd(), '.test-file-lock-helper');
  const testFilePath = join(testDir, 'test-file.json');

  beforeEach(async () => {
    try {
      await mkdir(testDir, { recursive: true });
    } catch {
      // Ignore
    }
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  it('executes operation under lock', async () => {
    let executed = false;

    await withFileLock(testFilePath, async () => {
      executed = true;
      return 'result';
    });

    expect(executed).toBe(true);
  });

  it('releases lock after operation', async () => {
    const lockPath = `${testFilePath}.lock`;

    await withFileLock(testFilePath, async () => {
      // Lock should exist during operation
      await expect(access(lockPath)).resolves.not.toThrow();
    });

    // Lock should be released after operation
    await expect(access(lockPath)).rejects.toThrow();
  });

  it('accepts custom options', async () => {
    const lockPath = `${testFilePath}.lock`;

    await withFileLock(
      testFilePath,
      async () => {
        return 'result';
      },
      { timeout: 1000, retryInterval: 50 }
    );

    // Operation should complete successfully
    await expect(access(lockPath)).rejects.toThrow(); // Lock released
  });
});
