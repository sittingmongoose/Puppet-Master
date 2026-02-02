/**
 * File Locking Utilities
 * 
 * Provides file-based locking to prevent corruption during concurrent access.
 * Used primarily for exclusive locks on prd.json during updates.
 * 
 * See STATE_FILES.md Section 10 for locking strategy.
 */

import { promises as fs } from 'fs';
import { hostname } from 'os';
import { dirname } from 'path';

/**
 * Options for file locking behavior.
 */
export interface LockOptions {
  /** Maximum time to wait for lock acquisition (ms, default 5000) */
  timeout: number;
  /** Interval between lock acquisition attempts (ms, default 100) */
  retryInterval: number;
  /** Maximum age of lock before considering stale (ms, default 30000) */
  staleTimeout: number;
}

/**
 * Information stored in a lock file.
 */
export interface LockInfo {
  /** Process ID that holds the lock */
  pid: number;
  /** Hostname where the process is running */
  hostname: string;
  /** Timestamp when the lock was acquired (ms since epoch) */
  timestamp: number;
}

/**
 * FileLocker class for managing file locks.
 * 
 * Uses lock files with `.lock` suffix containing process metadata.
 * Automatically detects and clears stale locks (processes that died).
 */
export class FileLocker {
  private readonly options: LockOptions;

  /**
   * Creates a new FileLocker instance.
   * @param options - Optional lock options (merged with defaults)
   */
  constructor(options?: Partial<LockOptions>) {
    this.options = {
      timeout: 5000,
      retryInterval: 100,
      staleTimeout: 30000,
      ...options,
    };
  }

  /**
   * Gets the lock file path for a given file path.
   * @param filePath - The file path to lock
   * @returns The lock file path (filePath + '.lock')
   */
  private getLockPath(filePath: string): string {
    return `${filePath}.lock`;
  }

  /**
   * Reads lock information from a lock file.
   * @param lockPath - Path to the lock file
   * @returns Lock info if file exists and is valid, null otherwise
   */
  private async readLockInfo(lockPath: string): Promise<LockInfo | null> {
    try {
      const content = await fs.readFile(lockPath, 'utf-8');
      const info = JSON.parse(content) as LockInfo;
      
      // Validate structure
      if (
        typeof info.pid === 'number' &&
        typeof info.hostname === 'string' &&
        typeof info.timestamp === 'number'
      ) {
        return info;
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Writes lock information to a lock file.
   * Creates parent directory if needed.
   * @param lockPath - Path to the lock file
   */
  private async writeLockInfo(lockPath: string): Promise<void> {
    const lockInfo: LockInfo = {
      pid: process.pid,
      hostname: hostname(),
      timestamp: Date.now(),
    };
    
    // Ensure parent directory exists
    const parentDir = dirname(lockPath);
    await fs.mkdir(parentDir, { recursive: true });
    
    await fs.writeFile(lockPath, JSON.stringify(lockInfo), {
      encoding: 'utf-8',
      flag: 'wx',
    });
  }

  /**
   * Checks if a lock file represents a stale lock (process is dead).
   * @param lockPath - Path to the lock file
   * @returns True if lock is stale, false otherwise
   */
  private async isStale(lockPath: string): Promise<boolean> {
    const lockInfo = await this.readLockInfo(lockPath);
    if (!lockInfo) {
      return true; // Invalid lock file is considered stale
    }
    
    // Check if lock is too old (timestamp-based check)
    const age = Date.now() - lockInfo.timestamp;
    if (age > this.options.staleTimeout) {
      return true;
    }
    
    // Check if process is still running
    // process.kill(pid, 0) throws if process doesn't exist
    try {
      process.kill(lockInfo.pid, 0);
      return false; // Process exists, lock is not stale
    } catch {
      return true; // Process doesn't exist, lock is stale
    }
  }

  /**
   * Acquires an exclusive lock on a file.
   * Waits for existing locks to be released and clears stale locks.
   * @param filePath - The file path to lock
   * @throws Error if lock cannot be acquired within timeout
   */
  async acquire(filePath: string): Promise<void> {
    const lockPath = this.getLockPath(filePath);

    const startTime = Date.now();

    for (;;) {
      try {
        await this.writeLockInfo(lockPath);
        return;
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;

        if (code !== 'EEXIST') {
          const elapsed = Date.now() - startTime;
          if (elapsed >= this.options.timeout) {
            throw error instanceof Error
              ? error
              : new Error(`Lock timeout: Could not acquire lock for ${lockPath}`);
          }

          await new Promise((resolve) => setTimeout(resolve, this.options.retryInterval));
          continue;
        }

        if (await this.isStale(lockPath)) {
          try {
            await fs.unlink(lockPath);
          } catch {
            // Ignore errors when clearing stale lock
          }
          continue;
        }

        const elapsed = Date.now() - startTime;
        if (elapsed >= this.options.timeout) {
          throw new Error(
            `Lock timeout: Could not acquire lock for ${lockPath} within ${this.options.timeout}ms`
          );
        }

        await new Promise((resolve) => setTimeout(resolve, this.options.retryInterval));
      }
    }
  }

  /**
   * Releases a lock on a file.
   * @param filePath - The file path to unlock
   */
  async release(filePath: string): Promise<void> {
    const lockPath = this.getLockPath(filePath);
    
    try {
      // Verify we own the lock before releasing
      const info = await this.readLockInfo(lockPath);
      if (info && info.pid === process.pid) {
        await fs.unlink(lockPath);
      }
    } catch {
      // Ignore errors when releasing (lock might not exist)
    }
  }

  /**
   * Checks if a file is currently locked.
   * @param filePath - The file path to check
   * @returns True if file is locked, false otherwise
   */
  async isLocked(filePath: string): Promise<boolean> {
    const lockPath = this.getLockPath(filePath);
    
    try {
      await fs.access(lockPath);
      // Lock file exists, check if it's stale
      if (await this.isStale(lockPath)) {
        return false; // Stale lock doesn't count
      }
      return true;
    } catch {
      return false; // Lock file doesn't exist
    }
  }

  /**
   * Executes an operation under an exclusive lock.
   * Ensures the lock is released even if the operation throws.
   * @param filePath - The file path to lock
   * @param operation - The operation to execute
   * @returns The result of the operation
   */
  async withLock<T>(filePath: string, operation: () => Promise<T>): Promise<T> {
    await this.acquire(filePath);
    
    try {
      return await operation();
    } finally {
      await this.release(filePath);
    }
  }
}

/**
 * Executes an operation under an exclusive file lock.
 * 
 * Convenience helper that creates a FileLocker instance and executes
 * the operation under lock.
 * 
 * @param filePath - The file path to lock
 * @param operation - The operation to execute
 * @param options - Optional lock options
 * @returns The result of the operation
 * 
 * @example
 * ```typescript
 * await withFileLock('/path/to/file.json', async () => {
 *   // File is locked during this operation
 *   await updateFile();
 * });
 * ```
 */
export async function withFileLock<T>(
  filePath: string,
  operation: () => Promise<T>,
  options?: Partial<LockOptions>
): Promise<T> {
  const locker = new FileLocker(options);
  return locker.withLock(filePath, operation);
}
