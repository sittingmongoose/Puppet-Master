/**
 * Update Detector for RWM Puppet Master
 * 
 * Tracks AGENTS.md file changes during execution by comparing SHA-256 hashes.
 * Emits events when changes are detected.
 */

import { createHash } from 'crypto';
import { readFile, stat } from 'fs/promises';
import type { EventBus } from '../logging/event-bus.js';

/**
 * File snapshot interface.
 * Tracks a file's hash and metadata at a point in time.
 */
export interface FileSnapshot {
  /** File path */
  path: string;
  /** SHA-256 hash of file contents */
  hash: string;
  /** ISO timestamp when snapshot was taken */
  lastChecked: string;
  /** ISO timestamp of file's last modification time */
  lastModified: string;
}

/**
 * Update result interface.
 * Contains information about detected file changes.
 */
export interface UpdateResult {
  /** Whether any updates were detected */
  hasUpdates: boolean;
  /** Array of file paths that have changed */
  updatedFiles: string[];
  /** Map of file paths to their previous hashes */
  previousHashes: Map<string, string>;
  /** Map of file paths to their current hashes */
  currentHashes: Map<string, string>;
}

/**
 * UpdateDetector class.
 * 
 * Tracks file changes by maintaining snapshots of file hashes.
 * Can detect when files are modified and emit events.
 */
export class UpdateDetector {
  private snapshots: Map<string, FileSnapshot> = new Map();
  private eventBus?: EventBus;

  /**
   * Create a new UpdateDetector instance.
   * 
   * @param eventBus - Optional EventBus for emitting update events
   */
  constructor(eventBus?: EventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Take snapshots of the specified file paths.
   * Creates or updates snapshots with current file hashes and metadata.
   * 
   * @param paths - Array of file paths to snapshot
   */
  async takeSnapshot(paths: string[]): Promise<void> {
    const now = new Date().toISOString();

    for (const path of paths) {
      try {
        const hash = await this.getFileHash(path);
        const stats = await stat(path);
        const lastModified = stats.mtime.toISOString();

        this.snapshots.set(path, {
          path,
          hash,
          lastChecked: now,
          lastModified,
        });
      } catch (error) {
        // If file doesn't exist or can't be read, skip it
        // We'll handle missing files in checkForUpdates
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error;
        }
      }
    }
  }

  /**
   * Check for updates in the specified file paths.
   * Compares current file hashes with stored snapshots.
   * 
   * @param paths - Array of file paths to check
   * @returns UpdateResult with detected changes
   */
  async checkForUpdates(paths: string[]): Promise<UpdateResult> {
    const updatedFiles: string[] = [];
    const previousHashes = new Map<string, string>();
    const currentHashes = new Map<string, string>();

    for (const path of paths) {
      const snapshot = this.snapshots.get(path);
      let currentHash: string | null = null;

      try {
        currentHash = await this.getFileHash(path);
        currentHashes.set(path, currentHash);
      } catch (error) {
        // File might not exist or be unreadable
        // If we had a snapshot, this is a change (file deleted)
        if (snapshot) {
          updatedFiles.push(path);
          previousHashes.set(path, snapshot.hash);
          currentHashes.set(path, '');
        }
        continue;
      }

      // If no snapshot exists, this is a new file (not an update)
      if (!snapshot) {
        continue;
      }

      previousHashes.set(path, snapshot.hash);

      // Compare hashes
      if (snapshot.hash !== currentHash) {
        updatedFiles.push(path);
      }
    }

    const hasUpdates = updatedFiles.length > 0;

    // Emit event if updates detected and event bus is available
    if (hasUpdates && this.eventBus) {
      this.eventBus.emit({
        type: 'agents_updated',
        updatedFiles: [...updatedFiles],
      });
    }

    return {
      hasUpdates,
      updatedFiles,
      previousHashes,
      currentHashes,
    };
  }

  /**
   * Calculate SHA-256 hash of a file's contents.
   * 
   * @param path - File path to hash
   * @returns Hex digest of the file's SHA-256 hash
   * @throws Error if file cannot be read
   */
  async getFileHash(path: string): Promise<string> {
    const content = await readFile(path, 'utf-8');
    const hash = createHash('sha256');
    hash.update(content);
    return hash.digest('hex');
  }

  /**
   * Check if a specific file has changed since its last snapshot.
   * 
   * @param path - File path to check
   * @returns true if file has changed, false otherwise
   */
  async hasChanged(path: string): Promise<boolean> {
    const snapshot = this.snapshots.get(path);
    if (!snapshot) {
      // No snapshot means we can't determine if it changed
      return false;
    }

    try {
      const currentHash = await this.getFileHash(path);
      return snapshot.hash !== currentHash;
    } catch {
      // File doesn't exist or can't be read
      // If we had a snapshot, the file was deleted (changed)
      return true;
    }
  }

  /**
   * Reset all snapshots.
   * Clears the internal snapshot map.
   */
  reset(): void {
    this.snapshots.clear();
  }
}
