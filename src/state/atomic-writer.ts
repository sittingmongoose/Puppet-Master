/**
 * Atomic Writer for State Persistence
 *
 * Provides atomic file writes with backup and recovery to prevent corruption
 * on crash. Implements temp file → verify → atomic rename pattern with
 * configurable backup rotation.
 *
 * Addresses Issue #6 from ClaudesMajorImprovements.md.
 */

import { promises as fs } from 'fs';
import { dirname } from 'path';
import type { LoggerService } from '../logging/logger-service.js';

/**
 * Error thrown when state write verification fails
 */
export class StateWriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StateWriteError';
  }
}

/**
 * Error thrown when no recoverable state can be found
 */
export class StateRecoveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StateRecoveryError';
  }
}

/**
 * AtomicWriter class for atomic file operations with backup and recovery.
 *
 * Ensures writes are atomic by:
 * 1. Writing to a temporary file
 * 2. Verifying the write succeeded
 * 3. Backing up the existing file (if it exists)
 * 4. Atomically renaming the temp file to the target
 *
 * Provides recovery by:
 * - Trying main file first
 * - Falling back to .backup file if main is corrupted
 * - Falling back to numbered backups if needed
 */
export class AtomicWriter {
  private readonly backupCount: number;
  private readonly logger?: LoggerService;

  /**
   * Creates a new AtomicWriter instance.
   * @param backupCount - Number of backups to keep (default: 3)
   * @param logger - Optional logger for recovery events
   */
  constructor(backupCount: number = 3, logger?: LoggerService) {
    this.backupCount = backupCount;
    this.logger = logger;
  }

  /**
   * Writes content to a file atomically with backup.
   * @param filePath - Path to the target file
   * @param content - Content to write
   * @throws StateWriteError if verification fails
   */
  async write(filePath: string, content: string): Promise<void> {
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    const backupPath = `${filePath}.backup`;

    try {
      // Ensure directory exists
      await this.ensureDirectoryExists(filePath);

      // 1. Write to temp file
      await fs.writeFile(tempPath, content, 'utf8');

      // 2. Verify write succeeded
      const verified = await fs.readFile(tempPath, 'utf8');
      if (content !== verified) {
        await fs.unlink(tempPath).catch(() => {
          // Ignore cleanup errors
        });
        throw new StateWriteError('State write verification failed: content mismatch');
      }

      // 3. Backup existing file (if exists)
      if (await this.exists(filePath)) {
        await this.rotateBackups(filePath);
        await fs.rename(filePath, backupPath);
      }

      // 4. Atomic rename
      await fs.rename(tempPath, filePath);
    } catch (error) {
      // Clean up temp file on error
      await fs.unlink(tempPath).catch(() => {
        // Ignore cleanup errors
      });

      // Re-throw if it's our error, otherwise wrap it
      if (error instanceof StateWriteError) {
        throw error;
      }
      throw new StateWriteError(`Failed to write state atomically: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Reads content from a file with automatic recovery from backups.
   * @param filePath - Path to the file to read
   * @returns The file content
   * @throws StateRecoveryError if no recoverable state found
   */
  async read(filePath: string): Promise<string> {
    // Try main file first
    if (await this.exists(filePath)) {
      try {
        return await fs.readFile(filePath, 'utf8');
      } catch (error) {
        // Main file corrupted, try backup
        if (this.logger) {
          this.logger.warn('Main state file corrupted, attempting recovery from backup', {
            filePath,
            error: error instanceof Error ? error.message : String(error),
          });
        } else {
          console.warn(`Main file corrupted, trying backup: ${filePath}`);
        }
      }
    }

    // Try .backup file
    const backupPath = `${filePath}.backup`;
    if (await this.exists(backupPath)) {
      try {
        if (this.logger) {
          this.logger.warn('Recovering state from backup file', { filePath, backupPath });
        } else {
          console.warn(`Recovering from backup: ${backupPath}`);
        }
        return await fs.readFile(backupPath, 'utf8');
      } catch (error) {
        // Backup also corrupted, try numbered backups
        if (this.logger) {
          this.logger.warn('Backup file also corrupted, trying numbered backups', {
            filePath,
            backupPath,
            error: error instanceof Error ? error.message : String(error),
          });
        } else {
          console.warn(`Backup also corrupted, trying numbered backups: ${backupPath}`);
        }
      }
    }

    // Try numbered backups (newest first)
    for (let i = this.backupCount; i >= 1; i--) {
      const numberedBackup = `${filePath}.backup.${i}`;
      if (await this.exists(numberedBackup)) {
        try {
          if (this.logger) {
            this.logger.warn('Recovering state from numbered backup', {
              filePath,
              backupPath: numberedBackup,
              backupNumber: i,
            });
          } else {
            console.warn(`Recovering from numbered backup: ${numberedBackup}`);
          }
          return await fs.readFile(numberedBackup, 'utf8');
        } catch (error) {
          // Continue to next backup
          if (this.logger) {
            this.logger.warn('Numbered backup corrupted, trying next', {
              filePath,
              backupPath: numberedBackup,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      }
    }

    // No recoverable state found
    throw new StateRecoveryError(`No recoverable state found for ${filePath}`);
  }

  /**
   * Rotates backup files to keep the last N backups.
   * @param filePath - Path to the file being backed up
   */
  private async rotateBackups(filePath: string): Promise<void> {
    const backupPath = `${filePath}.backup`;

    // If .backup exists, we need to rotate it
    if (await this.exists(backupPath)) {
      // Remove the oldest backup if we're at the limit
      const oldestBackup = `${filePath}.backup.${this.backupCount}`;
      if (await this.exists(oldestBackup)) {
        await fs.unlink(oldestBackup).catch(() => {
          // Ignore errors
        });
      }

      // Shift existing numbered backups: .backup.N → .backup.N+1, etc. (in reverse order)
      for (let i = this.backupCount - 1; i >= 1; i--) {
        const current = `${filePath}.backup.${i}`;
        const next = `${filePath}.backup.${i + 1}`;

        if (await this.exists(current)) {
          await fs.rename(current, next).catch(() => {
            // Ignore errors if next already exists
          });
        }
      }

      // Move .backup to .backup.1
      const firstBackup = `${filePath}.backup.1`;
      await fs.rename(backupPath, firstBackup).catch(() => {
        // Ignore errors if firstBackup already exists
      });
    }
  }

  /**
   * Checks if a file exists.
   * @param filePath - Path to check
   * @returns True if file exists, false otherwise
   */
  private async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Ensures the directory for a file path exists.
   * @param filePath - The file path
   */
  private async ensureDirectoryExists(filePath: string): Promise<void> {
    const dir = dirname(filePath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}
