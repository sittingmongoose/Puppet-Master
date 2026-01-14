/**
 * Iteration Logger for RWM Puppet Master
 * 
 * Logs detailed information about each iteration execution to JSON files,
 * organized by subtask ID. Tracks prompts, outputs, timing, completion
 * signals, and test results.
 */

import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import type { Platform } from '../types/index.js';
import type { IterationResult } from '../core/execution-engine.js';

/**
 * Log entry for a single iteration
 */
export interface IterationLog {
  iterationId: string;
  subtaskId: string;
  sessionId: string;
  platform: Platform;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  prompt: string;
  output?: string;
  exitCode?: number;
  completionSignal?: 'COMPLETE' | 'GUTTER' | null;
  filesChanged: string[];
  testsRun: { command: string; passed: boolean }[];
}

/**
 * Logger for iteration execution details
 */
export class IterationLogger {
  private readonly logsDir: string;
  private readonly sessionId: string;
  private readonly activeIterations = new Map<string, IterationLog>();
  private readonly iterationCounts = new Map<string, number>();

  constructor(logsDir: string, sessionId: string) {
    this.logsDir = logsDir;
    this.sessionId = sessionId;
  }

  /**
   * Start logging a new iteration
   * @param subtaskId Parent subtask ID
   * @param platform Platform being used
   * @param prompt Full prompt sent to the agent
   * @returns Iteration ID
   */
  async startIteration(
    subtaskId: string,
    platform: Platform,
    prompt: string
  ): Promise<string> {
    // Get next iteration number for this subtask
    const count = this.iterationCounts.get(subtaskId) ?? 0;
    const nextNumber = count + 1;
    this.iterationCounts.set(subtaskId, nextNumber);

    // Generate iteration ID
    const iterationNumber = String(nextNumber).padStart(3, '0');
    const iterationId = `${subtaskId}-iter-${iterationNumber}`;

    // Create log entry
    const log: IterationLog = {
      iterationId,
      subtaskId,
      sessionId: this.sessionId,
      platform,
      startedAt: new Date().toISOString(),
      prompt,
      filesChanged: [],
      testsRun: [],
    };

    // Store in memory for updates
    this.activeIterations.set(iterationId, log);

    // Ensure directory exists
    const logPath = this.getLogPath(subtaskId, iterationNumber);
    await this.ensureDirectory(dirname(logPath));

    // Write initial log file
    await writeFile(logPath, JSON.stringify(log, null, 2), 'utf8');

    return iterationId;
  }

  /**
   * Update iteration log with output
   * @param iterationId Iteration ID
   * @param output Output received from the agent
   */
  async logOutput(iterationId: string, output: string): Promise<void> {
    const log = this.activeIterations.get(iterationId);
    if (!log) {
      // Try to load from disk
      const loaded = await this.getIterationLog(iterationId);
      if (!loaded) {
        throw new Error(`Iteration ${iterationId} not found`);
      }
      this.activeIterations.set(iterationId, loaded);
      loaded.output = output;
      await this.saveLog(loaded);
      return;
    }

    log.output = output;
    await this.saveLog(log);
  }

  /**
   * Complete iteration logging with result
   * @param iterationId Iteration ID
   * @param result Iteration result
   */
  async completeIteration(
    iterationId: string,
    result: IterationResult
  ): Promise<void> {
    const log = this.activeIterations.get(iterationId);
    if (!log) {
      // Try to load from disk
      const loaded = await this.getIterationLog(iterationId);
      if (!loaded) {
        throw new Error(`Iteration ${iterationId} not found`);
      }
      this.activeIterations.set(iterationId, loaded);
      this.updateLogFromResult(loaded, result);
      await this.saveLog(loaded);
      this.activeIterations.delete(iterationId);
      return;
    }

    this.updateLogFromResult(log, result);
    await this.saveLog(log);
    this.activeIterations.delete(iterationId);
  }

  /**
   * Retrieve a specific iteration log
   * @param iterationId Iteration ID
   * @returns Iteration log or null if not found
   */
  async getIterationLog(iterationId: string): Promise<IterationLog | null> {
    // Check active iterations first
    const active = this.activeIterations.get(iterationId);
    if (active) {
      return { ...active };
    }

    // Parse iteration ID to get subtask and number
    const match = iterationId.match(/^(.+)-iter-(\d+)$/);
    if (!match) {
      return null;
    }

    const [, subtaskId, iterationNumber] = match;
    const logPath = this.getLogPath(subtaskId, iterationNumber);

    if (!existsSync(logPath)) {
      return null;
    }

    try {
      const content = await readFile(logPath, 'utf8');
      return JSON.parse(content) as IterationLog;
    } catch {
      return null;
    }
  }

  /**
   * Get all iterations for a subtask
   * @param subtaskId Subtask ID
   * @returns Array of iteration logs, sorted by iteration number
   */
  async getIterationsForSubtask(subtaskId: string): Promise<IterationLog[]> {
    const subtaskDir = join(this.logsDir, 'iterations', subtaskId);

    if (!existsSync(subtaskDir)) {
      return [];
    }

    try {
      const files = await readdir(subtaskDir);
      const logs: IterationLog[] = [];

      for (const file of files) {
        if (!file.endsWith('.json')) {
          continue;
        }

        const logPath = join(subtaskDir, file);
        try {
          const content = await readFile(logPath, 'utf8');
          const log = JSON.parse(content) as IterationLog;
          logs.push(log);
        } catch {
          // Skip invalid JSON files
          continue;
        }
      }

      // Sort by iteration number (extract from filename or iterationId)
      logs.sort((a, b) => {
        const aMatch = a.iterationId.match(/-iter-(\d+)$/);
        const bMatch = b.iterationId.match(/-iter-(\d+)$/);
        const aNum = aMatch ? parseInt(aMatch[1]!, 10) : 0;
        const bNum = bMatch ? parseInt(bMatch[1]!, 10) : 0;
        return aNum - bNum;
      });

      return logs;
    } catch {
      return [];
    }
  }

  /**
   * Update log entry from iteration result
   */
  private updateLogFromResult(log: IterationLog, result: IterationResult): void {
    log.completedAt = new Date().toISOString();
    log.durationMs = result.duration;
    log.exitCode = result.exitCode;
    log.completionSignal = result.completionSignal ?? null;
    log.filesChanged = result.filesChanged;
    
    // Convert learnings to test results if needed
    // For now, testsRun is populated from result if available
    // This may need adjustment based on how tests are tracked
    if (result.output) {
      log.output = result.output;
    }
  }

  /**
   * Save log to disk
   */
  private async saveLog(log: IterationLog): Promise<void> {
    const match = log.iterationId.match(/^(.+)-iter-(\d+)$/);
    if (!match) {
      throw new Error(`Invalid iteration ID: ${log.iterationId}`);
    }

    const [, subtaskId, iterationNumber] = match;
    const logPath = this.getLogPath(subtaskId, iterationNumber);
    await this.ensureDirectory(dirname(logPath));
    await writeFile(logPath, JSON.stringify(log, null, 2), 'utf8');
  }

  /**
   * Get log file path for a subtask and iteration number
   */
  private getLogPath(subtaskId: string, iterationNumber: string): string {
    return join(
      this.logsDir,
      'iterations',
      subtaskId,
      `${iterationNumber}.json`
    );
  }

  /**
   * Ensure directory exists, creating it if needed
   */
  private async ensureDirectory(dirPath: string): Promise<void> {
    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true });
    }
  }
}
