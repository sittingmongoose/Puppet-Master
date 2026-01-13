/**
 * FreshSpawner
 *
 * Spawns completely fresh agent processes for each iteration.
 *
 * ARCHITECTURE:
 * FreshSpawner is a low-level utility for spawning fresh agent processes with
 * proper isolation. It can be used directly for process spawning, or by platform
 * runners (BasePlatformRunner implementations) as a building block.
 *
 * The ExecutionEngine uses PlatformRunnerContract implementations (platform runners),
 * which may internally use FreshSpawner or implement their own spawning logic.
 * FreshSpawner provides a standardized way to ensure fresh process spawning with:
 * - Clean working directory verification
 * - Git stash handling
 * - Context file copying
 * - Environment variable filtering
 * - Process audit logging
 * - Timeout management
 *
 * USAGE:
 * - Direct usage: For spawning processes outside the platform runner system
 * - Platform runners: Can use FreshSpawner internally to implement spawnFreshProcess()
 * - ExecutionEngine: Uses platform runners, which may use FreshSpawner
 *
 * See REQUIREMENTS.md Section 26 (Fresh Agent Enforcement)
 * and REQUIREMENTS.md Section 26.3 (Process Isolation Mechanics).
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { mkdir, writeFile, copyFile, access, rm } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { constants } from 'node:fs';
import type { Platform } from '../types/index.js';

export interface SpawnConfig {
  workingDirectory: string;
  timeout: number;
  hardTimeout: number;
  environmentVars: Record<string, string>;
  allowSessionResume?: boolean;
}

export interface SpawnRequest {
  prompt: string;
  platform: Platform;
  model?: string;
  contextFiles: string[];
  iterationId: string;
}

export interface SpawnResult {
  processId: number;
  startedAt: string;
  stdin: NodeJS.WritableStream;
  stdout: NodeJS.ReadableStream;
  stderr: NodeJS.ReadableStream;
  cleanup: () => Promise<void>;
}

export interface ProcessAudit {
  iterationId: string;
  process: {
    pid: number;
    startedAt: string;
    endedAt?: string;
    exitCode?: number;
    freshSpawn: true;
    sessionResumed: false;
  };
  contextFilesProvided: string[];
  workingDirectory: string;
  environmentVarsSet: string[];
}

interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

interface RunningSpawn {
  proc: ChildProcess;
  audit: ProcessAudit;
  auditPath: string;
  exitPromise: Promise<{ exitCode: number | null; signal: NodeJS.Signals | null }>;
  timeoutTimer: NodeJS.Timeout | null;
  hardTimeoutTimer: NodeJS.Timeout | null;
  tempFiles: string[]; // Temp files created for context file copying
}

export class FreshSpawner {
  private readonly config: Required<SpawnConfig>;
  private readonly runningByPid = new Map<number, RunningSpawn>();

  constructor(config: SpawnConfig) {
    this.config = {
      ...config,
      allowSessionResume: config.allowSessionResume ?? false,
    };
  }

  async spawn(request: SpawnRequest): Promise<SpawnResult> {
    await this.prepareWorkingDirectory();

    // Copy context files to temp location if needed (REQUIREMENTS.md 26.3 step 3)
    const tempFiles = await this.copyContextFiles(request.contextFiles);

    const env = this.setEnvironment(request.iterationId);
    const { command, args } = this.buildCommand(request);

    const proc: ChildProcess = spawn(command, args, {
      cwd: this.config.workingDirectory,
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (!proc.pid) {
      throw new Error('FreshSpawner failed to spawn process (no PID assigned)');
    }

    if (!proc.stdin || !proc.stdout || !proc.stderr) {
      try {
        proc.kill('SIGKILL');
      } catch {
        // ignore
      }
      throw new Error('FreshSpawner spawned process without expected stdio streams');
    }

    const processId = proc.pid;
    const startedAt = new Date().toISOString();

    const exitPromise = FreshSpawner.waitForExit(proc);

    const timeoutTimer =
      this.config.timeout > 0
        ? setTimeout(() => {
            try {
              proc.kill('SIGTERM');
            } catch {
              // ignore
            }
          }, this.config.timeout)
        : null;

    const hardTimeoutTimer =
      this.config.hardTimeout > 0
        ? setTimeout(() => {
            try {
              proc.kill('SIGKILL');
            } catch {
              // ignore
            }
          }, this.config.hardTimeout)
        : null;

    // Note: stdout/stderr streams are returned to caller for reading
    // Do NOT attach listeners here - caller will attach their own

    const result: SpawnResult = {
      processId,
      startedAt,
      stdin: proc.stdin,
      stdout: proc.stdout,
      stderr: proc.stderr,
      cleanup: async () => this.cleanupAfterSpawn(processId),
    };

    const audit = this.createProcessAudit(request, result);
    const auditPath = await this.writeAudit(audit);

    const running: RunningSpawn = {
      proc,
      audit,
      auditPath,
      exitPromise,
      timeoutTimer,
      hardTimeoutTimer,
      tempFiles,
    };

    this.runningByPid.set(processId, running);

    proc.once('close', (code) => {
      const state = this.runningByPid.get(processId);
      if (!state) {
        return;
      }
      state.audit.process.endedAt = new Date().toISOString();
      if (typeof code === 'number') {
        state.audit.process.exitCode = code;
      }
      void this.writeAudit(state.audit).catch(() => undefined);
    });

    proc.once('error', () => {
      const state = this.runningByPid.get(processId);
      if (!state) {
        return;
      }
      state.audit.process.endedAt = new Date().toISOString();
      state.audit.process.exitCode = -1;
      void this.writeAudit(state.audit).catch(() => undefined);
    });

    return result;
  }

  async prepareWorkingDirectory(): Promise<void> {
    await this.stashUncommitted();
    const clean = await this.verifyCleanState();
    if (!clean) {
      throw new Error(`Working directory is not clean: ${this.config.workingDirectory}`);
    }
  }

  async cleanupAfterSpawn(pid: number): Promise<void> {
    const state = this.runningByPid.get(pid);
    if (!state) {
      return;
    }

    if (state.timeoutTimer) {
      clearTimeout(state.timeoutTimer);
    }
    if (state.hardTimeoutTimer) {
      clearTimeout(state.hardTimeoutTimer);
    }

    const proc = state.proc;

    if (proc.exitCode === null) {
      try {
        proc.kill('SIGTERM');
      } catch {
        // ignore
      }

      const exited = await FreshSpawner.waitForWithTimeout(state.exitPromise, 1_000);
      if (!exited && proc.exitCode === null) {
        try {
          proc.kill('SIGKILL');
        } catch {
          // ignore
        }
        await FreshSpawner.waitForWithTimeout(state.exitPromise, 1_000);
      }
    }

    const { exitCode } = await state.exitPromise;
    if (!state.audit.process.endedAt) {
      state.audit.process.endedAt = new Date().toISOString();
    }
    if (typeof exitCode === 'number' && state.audit.process.exitCode === undefined) {
      state.audit.process.exitCode = exitCode;
    }

    await this.writeAudit(state.audit);

    // Clean up temp files created for context file copying
    await this.cleanupTempFiles(state.tempFiles);

    this.runningByPid.delete(pid);
  }

  createProcessAudit(request: SpawnRequest, result: SpawnResult): ProcessAudit {
    const environmentVarsSet = FreshSpawner.getExplicitEnvironmentKeys(this.config.environmentVars);

    return {
      iterationId: request.iterationId,
      process: {
        pid: result.processId,
        startedAt: result.startedAt,
        freshSpawn: true,
        sessionResumed: false,
      },
      contextFilesProvided: [...request.contextFiles],
      workingDirectory: this.config.workingDirectory,
      environmentVarsSet,
    };
  }

  private setEnvironment(iterationId: string): Record<string, string> {
    // Filter out sensitive environment variables per REQUIREMENTS.md 26.3
    // (no sensitive data in environment)
    const sensitivePatterns = [
      /^.*PASSWORD.*$/i,
      /^.*SECRET.*$/i,
      /^.*KEY.*$/i,
      /^.*TOKEN.*$/i,
      /^.*CREDENTIAL.*$/i,
      /^.*AUTH.*$/i,
      /^AWS_.*$/,
      /^GCP_.*$/,
      /^AZURE_.*$/,
      /^.*API_KEY.*$/i,
    ];

    const filteredEnv: Record<string, string> = {};
    
    // Copy safe environment variables
    for (const [key, value] of Object.entries(process.env)) {
      if (value === undefined) {
        continue;
      }
      
      // Skip sensitive variables
      const isSensitive = sensitivePatterns.some((pattern) => pattern.test(key));
      if (!isSensitive) {
        filteredEnv[key] = value;
      }
    }

    // Add configured environment variables (these are explicitly allowed)
    Object.assign(filteredEnv, this.config.environmentVars);

    // Add required Puppet Master variables
    filteredEnv.PUPPET_MASTER_ITERATION = iterationId;
    filteredEnv.NODE_ENV = 'production';

    return filteredEnv;
  }

  private async verifyCleanState(): Promise<boolean> {
    const result = await this.runCommand('git', ['status', '--porcelain']);
    if (result.exitCode !== 0) {
      return false;
    }
    return result.stdout.trim().length === 0;
  }

  private async stashUncommitted(): Promise<void> {
    const clean = await this.verifyCleanState();
    if (clean) {
      return;
    }

    const message = `puppet-master auto-stash ${new Date().toISOString()}`;
    const result = await this.runCommand('git', ['stash', 'push', '--include-untracked', '--message', message]);
    
    if (result.exitCode !== 0) {
      throw new Error(
        `Failed to stash uncommitted changes: ${result.stderr || 'git stash command failed'}`
      );
    }

    // Verify stash succeeded by checking clean state again
    const stillClean = await this.verifyCleanState();
    if (!stillClean) {
      throw new Error(
        'Working directory still not clean after stash operation. Stash may have failed silently.'
      );
    }
  }

  private async writeAudit(audit: ProcessAudit): Promise<string> {
    const iterationsDir = join(this.config.workingDirectory, '.puppet-master', 'logs', 'iterations');
    await mkdir(iterationsDir, { recursive: true });

    const safeId = FreshSpawner.sanitizeId(audit.iterationId);
    const filePath = join(iterationsDir, `iter-${safeId}.json`);

    // Convert to snake_case JSON format per REQUIREMENTS.md 26.6
    const jsonAudit = {
      iteration_id: audit.iterationId,
      process: {
        pid: audit.process.pid,
        started_at: audit.process.startedAt,
        ended_at: audit.process.endedAt,
        exit_code: audit.process.exitCode,
        fresh_spawn: audit.process.freshSpawn,
        session_resumed: audit.process.sessionResumed,
      },
      context_files_provided: audit.contextFilesProvided,
      working_directory: audit.workingDirectory,
      environment_vars_set: audit.environmentVarsSet,
    };

    await writeFile(filePath, JSON.stringify(jsonAudit, null, 2), 'utf-8');
    return filePath;
  }

  private buildCommand(request: SpawnRequest): { command: string; args: string[] } {
    const baseArgs = request.model ? ['--model', request.model] : [];

    switch (request.platform) {
      case 'cursor':
        return {
          command: 'cursor-agent',
          args: [...baseArgs, '-p', request.prompt],
        };
      case 'claude':
        return {
          command: 'claude',
          args: [...baseArgs, '-p', request.prompt],
        };
      case 'codex':
        return {
          command: 'codex',
          args: ['exec', request.prompt, ...baseArgs],
        };
      default: {
        const exhaustive: never = request.platform;
        return exhaustive;
      }
    }
  }

  /**
   * Copy context files to temp location if needed (REQUIREMENTS.md 26.3 step 3).
   * Files that don't exist in the working directory are copied to a temp location.
   * Returns array of temp file paths created (for cleanup).
   */
  private async copyContextFiles(contextFiles: string[]): Promise<string[]> {
    if (contextFiles.length === 0) {
      return [];
    }

    const tempDir = join(this.config.workingDirectory, '.puppet-master', 'temp', `context-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    const tempFiles: string[] = [];

    for (const contextFile of contextFiles) {
      // Check if file exists in working directory
      const workingPath = join(this.config.workingDirectory, contextFile);
      try {
        await access(workingPath, constants.F_OK);
        // File exists in working directory, no need to copy
        continue;
      } catch {
        // File doesn't exist in working directory, try to find and copy it
        // For now, we'll create an empty file as a placeholder
        // In a full implementation, we might search for the file in other locations
        const tempPath = join(tempDir, basename(contextFile));
        try {
          // Try to copy from absolute path or relative to project root
          await copyFile(contextFile, tempPath);
          tempFiles.push(tempPath);
        } catch {
          // If copy fails, create empty placeholder (or skip)
          // This is a conservative approach - in production, you might want to
          // search for the file in known locations or throw an error
        }
      }
    }

    return tempFiles;
  }

  /**
   * Clean up temp files created for context file copying.
   */
  private async cleanupTempFiles(tempFiles: string[]): Promise<void> {
    for (const tempFile of tempFiles) {
      try {
        await rm(tempFile, { force: true });
      } catch {
        // Ignore cleanup errors
      }
    }

    // Also try to remove temp directory if empty
    if (tempFiles.length > 0) {
      const tempDir = dirname(tempFiles[0]);
      try {
        await rm(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  private async runCommand(command: string, args: string[]): Promise<CommandResult> {
    return new Promise((resolve) => {
      const proc = spawn(command, args, {
        cwd: this.config.workingDirectory,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      proc.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString();
      });
      proc.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      proc.once('close', (exitCode) => {
        resolve({
          exitCode: exitCode ?? -1,
          stdout,
          stderr,
        });
      });

      proc.once('error', (error) => {
        resolve({
          exitCode: -1,
          stdout,
          stderr: error instanceof Error ? error.message : 'Failed to spawn command',
        });
      });
    });
  }

  private static sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9-_]/g, '_');
  }

  private static getExplicitEnvironmentKeys(environmentVars: Record<string, string>): string[] {
    const keys = new Set<string>(['NODE_ENV', 'PUPPET_MASTER_ITERATION']);
    for (const key of Object.keys(environmentVars)) {
      keys.add(key);
    }
    return Array.from(keys).sort();
  }

  private static waitForExit(
    proc: ChildProcess
  ): Promise<{ exitCode: number | null; signal: NodeJS.Signals | null }> {
    return new Promise((resolve) => {
      const done = (exitCode: number | null, signal: NodeJS.Signals | null): void => {
        resolve({ exitCode, signal });
      };

      proc.once('close', (exitCode, signal) => done(exitCode, signal));
      proc.once('error', () => done(-1, null));
    });
  }

  private static async waitForWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<boolean> {
    if (timeoutMs <= 0) {
      await promise;
      return true;
    }

    let timer: NodeJS.Timeout | null = null;
    try {
      await Promise.race([
        promise.then(() => undefined),
        new Promise<void>((resolve) => {
          timer = setTimeout(resolve, timeoutMs);
        }),
      ]);
      return timer === null;
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }
}

