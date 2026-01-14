/**
 * Log Streamer for RWM Puppet Master
 * 
 * Provides real-time log file streaming for CLI --follow flag support.
 * Watches log files for changes and emits new entries with filtering and formatting.
 */

import { open, stat } from 'fs/promises';
import { watch, read as fsRead } from 'fs';
import { dirname } from 'path';
import { promisify } from 'util';
import type { LogLevel, LogEntry } from './logger-service.js';

const read = promisify(fsRead);

/**
 * Level hierarchy for filtering (matches logger-service)
 */
const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Options for log streaming
 */
export interface StreamOptions {
  /** Path to the JSONL log file to watch */
  logPath: string;
  /** Minimum log level to include (default: 'info') */
  minLevel?: LogLevel;
  /** Output format: 'json' for raw JSON, 'pretty' for formatted terminal output (default: 'pretty') */
  format?: 'json' | 'pretty';
}

/**
 * Log streamer that watches a log file and emits new entries
 */
export class LogStreamer {
  private watcher: ReturnType<typeof watch> | null = null;
  private position: number = 0;
  private callbacks: Array<(entry: LogEntry) => void> = [];
  private minLevel: LogLevel;
  private format: 'json' | 'pretty';
  private readonly logPath: string;
  private isWatching: boolean = false;
  private readInProgress: boolean = false;

  constructor(options: StreamOptions) {
    this.logPath = options.logPath;
    this.minLevel = options.minLevel ?? 'info';
    this.format = options.format ?? 'pretty';
  }

  /**
   * Start watching the log file for changes
   */
  async start(): Promise<void> {
    if (this.isWatching) {
      return;
    }

    // Initialize position - start from beginning to read existing content
    this.position = 0;

    this.isWatching = true;

    // Try to watch the file, fall back to watching directory if file doesn't exist
    try {
      this.watcher = watch(this.logPath, async (eventType, _filename) => {
        if ((eventType === 'change' || eventType === 'rename') && !this.readInProgress) {
          this.readInProgress = true;
          try {
            // Small delay to allow multiple rapid writes to accumulate
            await new Promise((resolve) => setImmediate(resolve));
            // Keep reading until we catch up (in case of rapid writes)
            let lastSize = 0;
            do {
              lastSize = await this.getFileSize();
              await this.readNewLines();
              // Small delay to check if more content arrived
              await new Promise((resolve) => setImmediate(resolve));
            } while (await this.getFileSize() > lastSize);
          } finally {
            this.readInProgress = false;
          }
        }
      });
    } catch (error) {
      // File doesn't exist, watch the directory instead
      const dir = dirname(this.logPath);
      const filename = this.logPath.split('/').pop() || this.logPath;
      this.watcher = watch(dir, async (eventType, changedFilename) => {
        if (changedFilename === filename && (eventType === 'change' || eventType === 'rename') && !this.readInProgress) {
          this.readInProgress = true;
          try {
            await new Promise((resolve) => setImmediate(resolve));
            // Keep reading until we catch up (in case of rapid writes)
            let lastSize = 0;
            do {
              lastSize = await this.getFileSize();
              await this.readNewLines();
              // Small delay to check if more content arrived
              await new Promise((resolve) => setImmediate(resolve));
            } while (await this.getFileSize() > lastSize);
          } finally {
            this.readInProgress = false;
          }
        }
      });
    }

    // Read any existing content immediately
    // readNewLines() will update position as it reads
    this.readInProgress = true;
    try {
      await this.readNewLines();
    } finally {
      this.readInProgress = false;
    }
  }

  /**
   * Stop watching the log file
   */
  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    this.isWatching = false;
    this.callbacks = [];
  }

  /**
   * Register a callback to receive new log entries
   */
  onEntry(callback: (entry: LogEntry) => void): void {
    this.callbacks.push(callback);
  }

  /**
   * Set the minimum log level filter
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Get current file size
   */
  private async getFileSize(): Promise<number> {
    try {
      const stats = await stat(this.logPath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Read new lines from the file since last position
   */
  private async readNewLines(): Promise<void> {
    // Note: readInProgress is managed by the caller (watcher callback) to prevent concurrent reads
    
    try {
      // Check if file exists
      let stats;
      try {
        stats = await stat(this.logPath);
      } catch (error) {
        // File doesn't exist, nothing to read
        return;
      }

      // Handle file truncation/rotation
      if (this.position > stats.size) {
        this.position = 0;
      }

      // If no new content, return
      if (this.position >= stats.size) {
        return;
      }

      // Open file and read from current position
      const fd = await open(this.logPath, 'r');
      try {
        const bytesToRead = stats.size - this.position;
        const buffer = Buffer.alloc(bytesToRead);
        const result = await read(fd.fd, buffer, 0, bytesToRead, this.position);

        if (result.bytesRead > 0) {
          const content = buffer.toString('utf8', 0, result.bytesRead);
          const lines = content.split('\n');

          // Process complete lines
          // If content ends with '\n', the last element of lines will be empty string
          // If content doesn't end with '\n', the last element is incomplete
          const completeLines = content.endsWith('\n')
            ? lines.slice(0, -1) // Remove empty string after final newline
            : lines.slice(0, -1); // Remove incomplete last line
          
          for (const line of completeLines) {
            const trimmed = line.trim();
            if (trimmed) {
              try {
                const entry: LogEntry = JSON.parse(trimmed);
                if (this.shouldInclude(entry)) {
                  this.emitEntry(entry);
                }
              } catch (error) {
                // Skip malformed JSON lines
                // Could optionally log parse errors, but we'll skip silently
              }
            }
          }

          // Update position
          if (content.endsWith('\n')) {
            // All content was complete
            this.position += result.bytesRead;
          } else if (completeLines.length > 0) {
            // Some lines were complete, move position to end of last complete line
            const completeContent = completeLines.join('\n') + '\n';
            this.position += Buffer.byteLength(completeContent, 'utf8');
          }
          // If no complete lines, position stays the same (will retry on next change)
        }
      } finally {
        await fd.close();
      }
    } catch (error) {
      // Handle read errors gracefully
      // Could optionally emit error event, but we'll skip silently
    }
  }

  /**
   * Check if entry should be included based on level filter
   */
  private shouldInclude(entry: LogEntry): boolean {
    return LEVEL_ORDER[entry.level] >= LEVEL_ORDER[this.minLevel];
  }

  /**
   * Emit entry to all registered callbacks
   */
  private emitEntry(entry: LogEntry): void {
    const formatted = this.formatEntry(entry);
    for (const callback of this.callbacks) {
      try {
        callback(entry);
      } catch (error) {
        // Continue emitting to other callbacks if one throws
        // Could optionally log callback errors
      }
    }
  }

  /**
   * Format entry based on format option
   */
  private formatEntry(entry: LogEntry): string {
    if (this.format === 'json') {
      return JSON.stringify(entry);
    }

    // Pretty format: [YYYY-MM-DD HH:MM:SS] LEVEL: message
    const timestamp = new Date(entry.timestamp).toISOString()
      .replace('T', ' ')
      .replace(/\.\d{3}Z$/, '');
    
    const levelUpper = entry.level.toUpperCase().padEnd(5);
    let output = `[${timestamp}] ${levelUpper}: ${entry.message}`;

    // Add context if present
    if (entry.context && Object.keys(entry.context).length > 0) {
      const contextStr = JSON.stringify(entry.context, null, 2)
        .split('\n')
        .map(line => `  ${line}`)
        .join('\n');
      output += `\nContext:\n${contextStr}`;
    }

    // Add sessionId if present
    if (entry.sessionId) {
      output += ` (session: ${entry.sessionId})`;
    }

    return output;
  }
}
