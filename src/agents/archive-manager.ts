/**
 * Archive Manager for RWM Puppet Master
 * 
 * Manages archiving of AGENTS.md files before updates.
 * Archives are stored with timestamps and hashes for retrieval and comparison.
 * 
 * See BUILD_QUEUE_PHASE_8.md PH8-T05.
 */

import { createHash } from 'crypto';
import { readFile, writeFile, mkdir, copyFile, unlink, rename } from 'fs/promises';
import { join, dirname } from 'path';
import { withFileLock } from '../utils/index.js';

/**
 * Archive entry interface.
 * Represents a single archived file.
 */
export interface ArchiveEntry {
  /** Unique identifier (timestamp-hash) */
  id: string;
  /** Original file path that was archived */
  originalPath: string;
  /** Path to the archived file */
  archivePath: string;
  /** ISO timestamp when archive was created */
  createdAt: string;
  /** Full SHA-256 hash of the archived file content */
  hash: string;
  /** Optional reason for archiving */
  reason?: string;
}

/**
 * ArchiveManager class.
 * 
 * Manages archiving, listing, restoring, and diffing of AGENTS.md files.
 */
export class ArchiveManager {
  private readonly archiveDir: string;
  private readonly indexPath: string;

  /**
   * Creates a new ArchiveManager instance.
   * @param archiveDir - Directory where archives are stored (default: '.puppet-master/archives/agents')
   */
  constructor(archiveDir: string = '.puppet-master/archives/agents') {
    this.archiveDir = archiveDir;
    this.indexPath = join(archiveDir, 'index.json');
  }

  /**
   * Archives a file by creating a timestamped backup.
   * @param path - Path to the file to archive
   * @param reason - Optional reason for archiving
   * @returns ArchiveEntry for the created archive
   * @throws Error if file cannot be read or archived
   */
  async archive(path: string, reason?: string): Promise<ArchiveEntry> {
    // Ensure archive directory exists
    await mkdir(this.archiveDir, { recursive: true });

    // Read file content
    const content = await readFile(path, 'utf-8');

    // Calculate hash
    const hash = this.calculateHash(content);
    const hashPrefix = hash.substring(0, 12);

    // Generate timestamp (YYYYMMDDHHmmss)
    const now = new Date();
    const timestamp = this.formatTimestamp(now);

    // Generate archive ID and filename
    const id = `${timestamp}-${hashPrefix}`;
    const archivePath = join(this.archiveDir, `${id}.md`);

    // Copy file to archive location
    await copyFile(path, archivePath);

    // Create archive entry
    const entry: ArchiveEntry = {
      id,
      originalPath: path,
      archivePath,
      createdAt: now.toISOString(),
      hash,
      reason,
    };

    // Update index
    await this.addToIndex(entry);

    return entry;
  }

  /**
   * Lists all available archives, optionally filtered by original path.
   * @param originalPath - Optional path to filter archives by
   * @returns Array of ArchiveEntry objects
   */
  async list(originalPath?: string): Promise<ArchiveEntry[]> {
    const index = await this.loadIndex();
    
    if (originalPath) {
      return index.filter(entry => entry.originalPath === originalPath);
    }
    
    return index;
  }

  /**
   * Restores an archived file to its original location.
   * @param archiveId - ID of the archive to restore
   * @throws Error if archive not found or cannot be restored
   */
  async restore(archiveId: string): Promise<void> {
    const index = await this.loadIndex();
    const entry = index.find(e => e.id === archiveId);
    
    if (!entry) {
      throw new Error(`Archive not found: ${archiveId}`);
    }

    // Check if archive file exists
    try {
      await readFile(entry.archivePath, 'utf-8');
    } catch (error) {
      throw new Error(`Archive file not found: ${entry.archivePath}`);
    }

    // Ensure original directory exists
    await this.ensureDirExists(dirname(entry.originalPath));

    // Copy archive back to original location
    await copyFile(entry.archivePath, entry.originalPath);
  }

  /**
   * Generates a line-by-line diff between an archived file and the current file.
   * @param archiveId - ID of the archive to compare
   * @param currentPath - Path to the current file
   * @returns Diff string showing added (+) and removed (-) lines
   * @throws Error if archive or current file cannot be read
   */
  async diff(archiveId: string, currentPath: string): Promise<string> {
    const index = await this.loadIndex();
    const entry = index.find(e => e.id === archiveId);
    
    if (!entry) {
      throw new Error(`Archive not found: ${archiveId}`);
    }

    // Read archived content
    let archivedContent: string;
    try {
      archivedContent = await readFile(entry.archivePath, 'utf-8');
    } catch (error) {
      throw new Error(`Archive file not found: ${entry.archivePath}`);
    }

    // Read current content
    let currentContent: string;
    try {
      currentContent = await readFile(currentPath, 'utf-8');
    } catch (error) {
      throw new Error(`Current file not found: ${currentPath}`);
    }

    // Generate diff
    return this.generateDiff(archivedContent, currentContent);
  }

  /**
   * Retrieves the content of an archived file.
   * @param archiveId - ID of the archive to retrieve
   * @returns File content, or null if archive not found
   */
  async get(archiveId: string): Promise<string | null> {
    const index = await this.loadIndex();
    const entry = index.find(e => e.id === archiveId);
    
    if (!entry) {
      return null;
    }

    try {
      return await readFile(entry.archivePath, 'utf-8');
    } catch (error) {
      return null;
    }
  }

  /**
   * Prunes archives older than the specified maximum age.
   * @param maxAge - Maximum age in milliseconds
   * @returns Number of archives deleted
   */
  async prune(maxAge: number): Promise<number> {
    const index = await this.loadIndex();
    const now = Date.now();
    const cutoff = now - maxAge;
    
    const toDelete: ArchiveEntry[] = [];
    const toKeep: ArchiveEntry[] = [];

    for (const entry of index) {
      const createdAt = new Date(entry.createdAt).getTime();
      if (createdAt < cutoff) {
        toDelete.push(entry);
      } else {
        toKeep.push(entry);
      }
    }

    // Delete archive files
    for (const entry of toDelete) {
      try {
        await unlink(entry.archivePath);
      } catch (error) {
        // Ignore errors if file doesn't exist
      }
    }

    // Update index
    await this.saveIndex(toKeep);

    return toDelete.length;
  }

  /**
   * Calculates SHA-256 hash of content.
   * @param content - Content to hash
   * @returns Hex digest of the hash
   */
  private calculateHash(content: string): string {
    const hash = createHash('sha256');
    hash.update(content);
    return hash.digest('hex');
  }

  /**
   * Formats a date as YYYYMMDDHHmmss timestamp.
   * @param date - Date to format
   * @returns Formatted timestamp string
   */
  private formatTimestamp(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Generates a simple line-by-line diff.
   * @param oldContent - Old file content
   * @param newContent - New file content
   * @returns Diff string with + and - prefixes
   */
  private generateDiff(oldContent: string, newContent: string): string {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    
    const diff: string[] = [];
    const maxLines = Math.max(oldLines.length, newLines.length);

    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      if (oldLine === undefined) {
        // Line added
        diff.push(`+ ${newLine}`);
      } else if (newLine === undefined) {
        // Line removed
        diff.push(`- ${oldLine}`);
      } else if (oldLine !== newLine) {
        // Line changed
        diff.push(`- ${oldLine}`);
        diff.push(`+ ${newLine}`);
      } else {
        // Line unchanged (optional: include context)
        // For simplicity, we'll only show changes
      }
    }

    return diff.join('\n');
  }

  /**
   * Ensures a directory exists, creating it if necessary.
   * @param filePath - Path to a file (directory will be created for its parent)
   */
  private async ensureDirectoryExists(filePath: string): Promise<void> {
    const dir = dirname(filePath);
    try {
      await mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
      const err = error as NodeJS.ErrnoException;
      if (err.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Ensures a directory path exists, creating it if necessary.
   * @param dirPath - Path to a directory
   */
  private async ensureDirExists(dirPath: string): Promise<void> {
    try {
      await mkdir(dirPath, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
      const err = error as NodeJS.ErrnoException;
      if (err.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Loads the archive index from disk.
   * @returns Array of ArchiveEntry objects
   */
  private async loadIndex(): Promise<ArchiveEntry[]> {
    try {
      const content = await readFile(this.indexPath, 'utf-8');
      return JSON.parse(content) as ArchiveEntry[];
    } catch (error) {
      // Index doesn't exist, return empty array
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Saves the archive index to disk.
   * @param entries - Array of ArchiveEntry objects to save
   */
  private async saveIndex(entries: ArchiveEntry[]): Promise<void> {
    await withFileLock(this.indexPath, async () => {
      await this.ensureDirExists(dirname(this.indexPath));
      const tempPath = `${this.indexPath}.tmp`;
      await writeFile(tempPath, JSON.stringify(entries, null, 2), 'utf-8');
      await rename(tempPath, this.indexPath);
    });
  }

  /**
   * Adds an entry to the index.
   * @param entry - ArchiveEntry to add
   */
  private async addToIndex(entry: ArchiveEntry): Promise<void> {
    const index = await this.loadIndex();
    index.push(entry);
    await this.saveIndex(index);
  }
}
