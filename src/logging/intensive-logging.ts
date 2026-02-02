/**
 * Intensive logging utilities.
 *
 * Goals:
 * - Capture decision rationale in a structured way.
 * - Capture console.* output with minimal risk (no global behavior change unless enabled).
 */

import { appendFile } from 'fs/promises';
import type { LoggerService } from './logger-service.js';

export interface DecisionLog {
  title: string;
  rationale: string;
  alternatives?: string[];
  consequences?: string[];
  context?: Record<string, unknown>;
}

export function logDecision(logger: LoggerService, decision: DecisionLog): void {
  logger.info(`[Decision] ${decision.title}`, {
    rationale: decision.rationale,
    alternatives: decision.alternatives,
    consequences: decision.consequences,
    ...decision.context,
  });
}

function safeStringify(value: unknown): string {
  try {
    if (typeof value === 'string') return value;
    if (value instanceof Error) {
      return `${value.name}: ${value.message}${value.stack ? `\n${value.stack}` : ''}`;
    }
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export interface ConsoleCaptureHandle {
  restore: () => void;
}

/**
 * Minimal-risk console capture:
 * - Wraps console methods and forwards to LoggerService.
 * - Also appends raw console lines to a file path for easy grepping.
 * - Uses a recursion guard to avoid infinite loops when transports write to console.
 */
export function installConsoleCapture(logger: LoggerService, rawLogPath: string): ConsoleCaptureHandle {
  const original = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };

  let inCapture = false;

  const forward = (level: 'debug' | 'info' | 'warn' | 'error', args: unknown[]): void => {
    if (inCapture) return;
    inCapture = true;
    try {
      const message = args.map(safeStringify).join(' ');
      logger[level](message, { source: 'console' });
      // Best-effort raw append; do not await.
      appendFile(rawLogPath, `${new Date().toISOString()} [console.${level}] ${message}\n`).catch(() => undefined);
    } finally {
      inCapture = false;
    }
  };

  console.log = (...args: unknown[]) => {
    original.log(...args);
    forward('info', args);
  };
  console.info = (...args: unknown[]) => {
    original.info(...args);
    forward('info', args);
  };
  console.warn = (...args: unknown[]) => {
    original.warn(...args);
    forward('warn', args);
  };
  console.error = (...args: unknown[]) => {
    original.error(...args);
    forward('error', args);
  };
  console.debug = (...args: unknown[]) => {
    original.debug(...args);
    forward('debug', args);
  };

  return {
    restore: () => {
      console.log = original.log;
      console.info = original.info;
      console.warn = original.warn;
      console.error = original.error;
      console.debug = original.debug;
    },
  };
}
