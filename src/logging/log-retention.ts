/**
 * Log Retention & Archiving for RWM Puppet Master
 * 
 * Provides log file lifecycle management: rotation when size limits are exceeded,
 * deletion of expired logs based on retention period, and optional gzip archiving.
 */

import { readdir, stat, unlink, rename, readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

/**
 * Configuration for log retention
 */
export interface RetentionConfig {
  /** Maximum age in days before logs are deleted (default: 30) */
  maxAgeDays: number;
  /** Maximum file size in bytes before rotation (default: 10MB) */
  maxSizeBytes: number;
  /** Whether to archive old logs (default: true) */
  archiveOld: boolean;
  /** Optional archive directory (default: logsDir/archive/) */
  archiveDir?: string;
}

/**
 * Result of a cleanup operation
 */
export interface CleanupResult {
  /** Files that were deleted */
  deletedFiles: string[];
  /** Files that were rotated */
  rotatedFiles: string[];
  /** Files that were archived */
  archivedFiles: string[];
  /** Total bytes freed (deleted + archived) */
  freedBytes: number;
}

/**
 * Statistics about log files
 */
export interface LogStats {
  /** Total number of log files */
  totalFiles: number;
  /** Total size of all log files in bytes */
  totalSizeBytes: number;
  /** Date of the oldest file, or null if no files */
  oldestFileDate: Date | null;
  /** Date of the newest file, or null if no files */
  newestFileDate: Date | null;
  /** Files sorted by age with metadata */
  filesByAge: Array<{ path: string; ageDays: number; sizeBytes: number }>;
}

/**
 * Log retention manager
 */
export class LogRetention {
  private readonly logsDir: string;
  private readonly config: RetentionConfig;
  private readonly archiveDir: string;

  /**
   * Create a new LogRetention instance
   * @param logsDir Directory containing log files
   * @param config Retention configuration
   */
  constructor(logsDir: string, config: RetentionConfig) {
    this.logsDir = logsDir;
    this.config = config;
    this.archiveDir = config.archiveDir ?? join(logsDir, 'archive');
  }

  /**
   * Check if a file needs rotation based on size
   */
  async shouldRotate(logPath: string): Promise<boolean> {
    try {
      if (!existsSync(logPath)) {
        return false;
      }

      const stats = await stat(logPath);
      return stats.size > this.config.maxSizeBytes;
    } catch (error) {
      // If we can't stat the file, assume it doesn't need rotation
      return false;
    }
  }

  /**
   * Check if a file is expired based on age
   */
  async isExpired(logPath: string): Promise<boolean> {
    try {
      if (!existsSync(logPath)) {
        return false;
      }

      const stats = await stat(logPath);
      const ageMs = Date.now() - stats.mtimeMs;
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      return ageDays > this.config.maxAgeDays;
    } catch (error) {
      // If we can't stat the file, assume it's not expired
      return false;
    }
  }

  /**
   * Rotate a log file by appending a rotation number
   * @param logPath Path to the log file to rotate
   * @returns Path to the rotated file, or null if rotation not needed
   */
  async rotate(logPath: string): Promise<string | null> {
    try {
      if (!existsSync(logPath)) {
        return null;
      }

      // Check if rotation is needed
      if (!(await this.shouldRotate(logPath))) {
        return null;
      }

      // Find the next rotation number
      const dir = dirname(logPath);
      const baseName = basename(logPath);
      const files = await readdir(dir);
      
      // Find existing rotation numbers
      const rotationPattern = new RegExp(`^${baseName.replace(/\./g, '\\.')}\\.(\\d+)$`);
      let maxRotation = 0;
      
      for (const file of files) {
        const match = file.match(rotationPattern);
        if (match) {
          const num = parseInt(match[1]!, 10);
          if (num > maxRotation) {
            maxRotation = num;
          }
        }
      }

      // Create rotated filename
      const rotatedPath = join(dir, `${baseName}.${maxRotation + 1}`);
      
      // Rename the file
      await rename(logPath, rotatedPath);
      
      return rotatedPath;
    } catch (error) {
      // If rotation fails, return null (don't throw)
      console.error(`[LogRetention] Failed to rotate ${logPath}:`, error);
      return null;
    }
  }

  /**
   * Archive a log file by compressing it with gzip
   * @param logPath Path to the log file to archive
   * @returns Path to the archived file
   */
  async archive(logPath: string): Promise<string> {
    try {
      if (!existsSync(logPath)) {
        throw new Error(`File does not exist: ${logPath}`);
      }

      // Ensure archive directory exists
      if (!existsSync(this.archiveDir)) {
        await mkdir(this.archiveDir, { recursive: true });
      }

      // Read the file
      const content = await readFile(logPath);
      
      // Compress with gzip
      const compressed = await gzipAsync(content);
      
      // Create archive filename
      const baseName = basename(logPath);
      const archivePath = join(this.archiveDir, `${baseName}.gz`);
      
      // Write compressed file
      await writeFile(archivePath, compressed);
      
      // Delete original file
      await unlink(logPath);
      
      return archivePath;
    } catch (error) {
      throw new Error(`Failed to archive ${logPath}: ${error}`);
    }
  }

  /**
   * Get statistics about log files in the logs directory
   */
  async getLogStats(): Promise<LogStats> {
    const files: Array<{ path: string; ageDays: number; sizeBytes: number; mtime: Date }> = [];
    
    try {
      // Recursively collect all log files
      await this.collectLogFiles(this.logsDir, files);
      
      if (files.length === 0) {
        return {
          totalFiles: 0,
          totalSizeBytes: 0,
          oldestFileDate: null,
          newestFileDate: null,
          filesByAge: [],
        };
      }

      // Calculate totals
      const totalSizeBytes = files.reduce((sum, f) => sum + f.sizeBytes, 0);
      
      // Find oldest and newest
      const sortedByDate = [...files].sort((a, b) => a.mtime.getTime() - b.mtime.getTime());
      const oldestFileDate = sortedByDate[0]!.mtime;
      const newestFileDate = sortedByDate[sortedByDate.length - 1]!.mtime;

      // Sort by age (oldest first)
      const filesByAge = files
        .map((f) => ({
          path: f.path,
          ageDays: f.ageDays,
          sizeBytes: f.sizeBytes,
        }))
        .sort((a, b) => b.ageDays - a.ageDays);

      return {
        totalFiles: files.length,
        totalSizeBytes,
        oldestFileDate,
        newestFileDate,
        filesByAge,
      };
    } catch (error) {
      console.error('[LogRetention] Failed to get log stats:', error);
      return {
        totalFiles: 0,
        totalSizeBytes: 0,
        oldestFileDate: null,
        newestFileDate: null,
        filesByAge: [],
      };
    }
  }

  /**
   * Recursively collect log files from directory
   */
  private async collectLogFiles(
    dir: string,
    files: Array<{ path: string; ageDays: number; sizeBytes: number; mtime: Date }>
  ): Promise<void> {
    try {
      if (!existsSync(dir)) {
        return;
      }

      const entries = await readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        // Skip archive directory
        if (entry.isDirectory() && entry.name === 'archive') {
          continue;
        }
        
        if (entry.isDirectory()) {
          // Recursively process subdirectories
          await this.collectLogFiles(fullPath, files);
        } else if (entry.isFile()) {
          // Check if it's a log file (ends with .log or is a rotated log)
          if (entry.name.endsWith('.log') || /\.log\.\d+$/.test(entry.name)) {
            try {
              const stats = await stat(fullPath);
              const ageMs = Date.now() - stats.mtimeMs;
              const ageDays = ageMs / (1000 * 60 * 60 * 24);
              
              files.push({
                path: fullPath,
                ageDays,
                sizeBytes: stats.size,
                mtime: stats.mtime,
              });
            } catch (statError) {
              // Skip files we can't stat
              continue;
            }
          }
        }
      }
    } catch (error) {
      // Continue processing other files if one directory fails
      console.error(`[LogRetention] Failed to read directory ${dir}:`, error);
    }
  }

  /**
   * Perform cleanup: delete expired files, rotate oversized files, archive old files
   */
  async cleanup(): Promise<CleanupResult> {
    const result: CleanupResult = {
      deletedFiles: [],
      rotatedFiles: [],
      archivedFiles: [],
      freedBytes: 0,
    };

    try {
      // Collect all log files
      const logFiles: string[] = [];
      await this.collectLogFilePaths(this.logsDir, logFiles);

      for (const logPath of logFiles) {
        try {
          // Check if expired
          if (await this.isExpired(logPath)) {
            // Get file size before deletion
            const stats = await stat(logPath);
            const size = stats.size;
            
            // Delete expired file
            await unlink(logPath);
            result.deletedFiles.push(logPath);
            result.freedBytes += size;
            continue;
          }

          // Check if needs rotation
          if (await this.shouldRotate(logPath)) {
            const rotatedPath = await this.rotate(logPath);
            if (rotatedPath) {
              result.rotatedFiles.push(rotatedPath);
              
              // If archiving is enabled, archive rotated files that are old enough
              if (this.config.archiveOld) {
                // Check if rotated file is old enough to archive
                // Archive rotated files that are older than half the retention period
                const archiveThresholdDays = this.config.maxAgeDays / 2;
                const rotatedStats = await stat(rotatedPath);
                const rotatedAgeMs = Date.now() - rotatedStats.mtimeMs;
                const rotatedAgeDays = rotatedAgeMs / (1000 * 60 * 60 * 24);
                
                if (rotatedAgeDays > archiveThresholdDays) {
                  try {
                    const archivePath = await this.archive(rotatedPath);
                    result.archivedFiles.push(archivePath);
                    
                    // Calculate freed bytes (original size - compressed size)
                    const archiveStats = await stat(archivePath);
                    const originalSize = rotatedStats.size;
                    const compressedSize = archiveStats.size;
                    result.freedBytes += originalSize - compressedSize;
                  } catch (archiveError) {
                    // Continue if archiving fails
                    console.error(`[LogRetention] Failed to archive ${rotatedPath}:`, archiveError);
                  }
                }
              }
            }
          }
        } catch (fileError) {
          // Continue processing other files if one fails
          console.error(`[LogRetention] Error processing ${logPath}:`, fileError);
        }
      }

      // Also check for old rotated files that should be archived or deleted
      await this.cleanupRotatedFiles(result);

      return result;
    } catch (error) {
      console.error('[LogRetention] Cleanup error:', error);
      // Return partial results even if cleanup fails
      return result;
    }
  }

  /**
   * Collect log file paths recursively
   */
  private async collectLogFilePaths(dir: string, paths: string[]): Promise<void> {
    try {
      if (!existsSync(dir)) {
        return;
      }

      const entries = await readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        // Skip archive directory
        if (entry.isDirectory() && entry.name === 'archive') {
          continue;
        }
        
        if (entry.isDirectory()) {
          await this.collectLogFilePaths(fullPath, paths);
        } else if (entry.isFile()) {
          // Include .log files and rotated logs (but not .gz archives)
          if (entry.name.endsWith('.log') || /\.log\.\d+$/.test(entry.name)) {
            paths.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Continue processing other directories
      console.error(`[LogRetention] Failed to collect paths from ${dir}:`, error);
    }
  }

  /**
   * Clean up old rotated files
   */
  private async cleanupRotatedFiles(result: CleanupResult): Promise<void> {
    try {
      const logFiles: string[] = [];
      await this.collectLogFilePaths(this.logsDir, logFiles);

      for (const logPath of logFiles) {
        // Only process rotated files (those matching .log.N pattern)
        if (!/\.log\.\d+$/.test(logPath)) {
          continue;
        }

        try {
          // Check if expired
          if (await this.isExpired(logPath)) {
            const stats = await stat(logPath);
            const size = stats.size;
            
            await unlink(logPath);
            result.deletedFiles.push(logPath);
            result.freedBytes += size;
            continue;
          }

          // If archiving is enabled, archive old rotated files
          if (this.config.archiveOld) {
            const archiveThresholdDays = this.config.maxAgeDays / 2;
            const stats = await stat(logPath);
            const ageMs = Date.now() - stats.mtimeMs;
            const ageDays = ageMs / (1000 * 60 * 60 * 24);
            
            if (ageDays > archiveThresholdDays) {
              // Check if already archived
              const baseName = basename(logPath);
              const archivePath = join(this.archiveDir, `${baseName}.gz`);
              
              if (!existsSync(archivePath)) {
                try {
                  const archivedPath = await this.archive(logPath);
                  result.archivedFiles.push(archivedPath);
                  
                  const archiveStats = await stat(archivedPath);
                  const originalSize = stats.size;
                  const compressedSize = archiveStats.size;
                  result.freedBytes += originalSize - compressedSize;
                } catch (archiveError) {
                  // Continue if archiving fails
                  console.error(`[LogRetention] Failed to archive ${logPath}:`, archiveError);
                }
              }
            }
          }
        } catch (fileError) {
          // Continue processing other files
          console.error(`[LogRetention] Error processing rotated file ${logPath}:`, fileError);
        }
      }
    } catch (error) {
      console.error('[LogRetention] Error cleaning up rotated files:', error);
    }
  }
}
