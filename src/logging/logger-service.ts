/**
 * Logger Service for RWM Puppet Master
 * 
 * Provides foundational logging infrastructure with multiple transports
 * (console and file) and support for log levels, context, and child loggers.
 */

import { appendFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { existsSync } from 'fs';

/**
 * Log levels ordered from least to most severe
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log entry structure
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  sessionId?: string;
}

/**
 * Transport interface for pluggable log destinations
 */
export interface LogTransport {
  write(entry: LogEntry): void | Promise<void>;
}

/**
 * Logger options for constructor
 */
export interface LoggerOptions {
  minLevel?: LogLevel;
  sessionId?: string;
  transports?: LogTransport[];
}

/**
 * Level hierarchy for filtering
 */
const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Console transport with ANSI color formatting
 */
export class ConsoleTransport implements LogTransport {
  private readonly colors = {
    debug: '\x1b[36m', // cyan
    info: '\x1b[32m',  // green
    warn: '\x1b[33m',  // yellow
    error: '\x1b[31m', // red
    reset: '\x1b[0m',
    dim: '\x1b[2m',
  };

  write(entry: LogEntry): void {
    const color = this.colors[entry.level];
    const reset = this.colors.reset;
    const dim = this.colors.dim;
    
    // Format timestamp: YYYY-MM-DD HH:MM:SS
    const timestamp = new Date(entry.timestamp).toISOString()
      .replace('T', ' ')
      .replace(/\.\d{3}Z$/, '');
    
    const levelUpper = entry.level.toUpperCase().padEnd(5);
    let output = `${dim}[${timestamp}]${reset} ${color}${levelUpper}${reset}: ${entry.message}`;
    
    // Add context if present
    if (entry.context && Object.keys(entry.context).length > 0) {
      const contextStr = JSON.stringify(entry.context, null, 2)
        .split('\n')
        .map(line => `  ${line}`)
        .join('\n');
      output += `\n${dim}Context:${reset}\n${contextStr}`;
    }
    
    // Add sessionId if present
    if (entry.sessionId) {
      output += ` ${dim}(session: ${entry.sessionId})${reset}`;
    }
    
    // Write to appropriate stream.
    // Use stdout/stderr directly to avoid recursion if console.* is captured.
    if (entry.level === 'error') {
      process.stderr.write(output + '\n');
    } else {
      process.stdout.write(output + '\n');
    }
  }
}

/**
 * File transport that writes JSONL format
 */
export class FileTransport implements LogTransport {
  private readonly filePath: string;
  private initialized = false;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async write(entry: LogEntry): Promise<void> {
    try {
      // Ensure directory exists
      if (!this.initialized) {
        const dir = dirname(this.filePath);
        if (!existsSync(dir)) {
          await mkdir(dir, { recursive: true });
        }
        this.initialized = true;
      }
      
      // Write JSONL line
      const line = JSON.stringify(entry) + '\n';
      await appendFile(this.filePath, line, 'utf8');
    } catch (error) {
      // Best-effort fallback if file write fails (avoid console recursion).
      const msg = `[Logger] Failed to write to file ${this.filePath}: ${error instanceof Error ? error.message : String(error)}\n`;
      process.stderr.write(msg);
    }
  }
}

/**
 * Logger service with multiple transports and log level filtering
 */
export class LoggerService {
  private transports: LogTransport[] = [];
  private minLevel: LogLevel;
  private sessionId?: string;
  private context: Record<string, unknown> = {};

  constructor(options: LoggerOptions = {}) {
    this.minLevel = options.minLevel ?? 'info';
    this.sessionId = options.sessionId;
    this.transports = options.transports ?? [];
  }

  /**
   * Add a transport to the logger
   */
  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  /**
   * Set the minimum log level
   */
  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Create a child logger with inherited context
   */
  child(context: Record<string, unknown>): LoggerService {
    const childLogger = new LoggerService({
      minLevel: this.minLevel,
      sessionId: this.sessionId,
      transports: this.transports,
    });
    childLogger.context = { ...this.context, ...context };
    return childLogger;
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  /**
   * Log an error message
   */
  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }

  /**
   * Internal log method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): void {
    // Check if level should be logged
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.minLevel]) {
      return;
    }

    // Merge contexts
    const mergedContext = {
      ...this.context,
      ...context,
    };

    // Create log entry
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: Object.keys(mergedContext).length > 0 ? mergedContext : undefined,
      sessionId: this.sessionId,
    };

    // Write to all transports
    for (const transport of this.transports) {
      try {
        const result = transport.write(entry);
        // Handle async transports
        if (result instanceof Promise) {
          result.catch((error) => {
            process.stderr.write(`[Logger] Transport write failed: ${error instanceof Error ? error.message : String(error)}\n`);
          });
        }
      } catch (error) {
        process.stderr.write(`[Logger] Transport write error: ${error instanceof Error ? error.message : String(error)}\n`);
      }
    }
  }
}
