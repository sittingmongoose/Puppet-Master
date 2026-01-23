/**
 * Process Registry
 *
 * Tracks spawned processes by session and provides cross-platform termination.
 * Enables reliable stop/pause/kill operations across CLI and GUI.
 *
 * See BUILD_QUEUE_IMPROVEMENTS.md P0-T21.
 */

import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import { dirname } from 'path';

/**
 * Record of a single spawned process
 */
export interface ProcessRecord {
  /** Process ID */
  pid: number;
  /** Platform where process was spawned (cursor, claude, codex, etc.) */
  platform: string;
  /** Command that was executed */
  command: string;
  /** ISO timestamp when process was spawned */
  spawnedAt: string;
  /** Current status of the process */
  status: 'running' | 'terminated' | 'killed';
}

/**
 * Session registry containing all processes for a session
 */
export interface SessionRegistry {
  /** Unique session identifier */
  sessionId: string;
  /** PID of the orchestrator process */
  orchestratorPid: number;
  /** All processes spawned during this session */
  processes: ProcessRecord[];
  /** ISO timestamp when session started */
  startedAt: string;
  /** Current status of the session */
  status: 'active' | 'stopped' | 'crashed';
}

/**
 * ProcessRegistry class
 *
 * Manages process tracking and termination for a session.
 * Persists to `.puppet-master/sessions/{sessionId}.json`
 */
export class ProcessRegistry {
  private registry: SessionRegistry | null = null;

  /**
   * Creates a new ProcessRegistry instance.
   * @param sessionId - Session identifier
   * @param registryPath - Path to session registry file
   */
  constructor(
    private readonly sessionId: string,
    private readonly registryPath: string
  ) {}

  /**
   * Initializes the registry (loads existing or creates new).
   */
  async initialize(): Promise<void> {
    this.registry = await this.load();
    if (!this.registry) {
      this.registry = {
        sessionId: this.sessionId,
        orchestratorPid: process.pid,
        processes: [],
        startedAt: new Date().toISOString(),
        status: 'active',
      };
      await this.save();
    }
  }

  /**
   * Registers a new process.
   * @param pid - Process ID
   * @param platform - Platform name
   * @param command - Command that was executed
   */
  async registerProcess(pid: number, platform: string, command: string): Promise<void> {
    if (!this.registry) {
      await this.initialize();
    }

    const record: ProcessRecord = {
      pid,
      platform,
      command,
      spawnedAt: new Date().toISOString(),
      status: 'running',
    };

    this.registry!.processes.push(record);
    await this.save();
  }

  /**
   * Terminates a specific process.
   * @param pid - Process ID to terminate
   * @param force - Whether to force kill (SIGKILL on Unix, /F on Windows)
   */
  async terminateProcess(pid: number, force: boolean = false): Promise<void> {
    if (!this.registry) {
      await this.initialize();
    }

    // Find the process record
    const record = this.registry!.processes.find((p) => p.pid === pid);
    if (!record || record.status !== 'running') {
      return; // Already terminated or not found
    }

    try {
      await this.terminateProcessCrossPlatform(pid, force);
      record.status = force ? 'killed' : 'terminated';
      await this.save();
    } catch (error) {
      // Process may have already exited, mark as terminated
      record.status = 'terminated';
      await this.save();
    }
  }

  /**
   * Terminates all running processes in this session.
   * @param force - Whether to force kill all processes
   */
  async terminateAll(force: boolean = false): Promise<void> {
    if (!this.registry) {
      await this.initialize();
    }

    const runningProcesses = this.registry!.processes.filter((p) => p.status === 'running');

    // Terminate all running processes
    for (const record of runningProcesses) {
      await this.terminateProcess(record.pid, force);
    }

    // Update session status
    this.registry!.status = 'stopped';
    await this.save();
  }

  /**
   * Gets all running processes.
   * @returns Array of running process records
   */
  async getRunningProcesses(): Promise<ProcessRecord[]> {
    if (!this.registry) {
      await this.initialize();
    }

    return this.registry!.processes.filter((p) => p.status === 'running');
  }

  /**
   * Gets the full session registry.
   * @returns Session registry or null if not initialized
   */
  getRegistry(): SessionRegistry | null {
    return this.registry;
  }

  /**
   * Terminates a process using cross-platform method.
   * @param pid - Process ID to terminate
   * @param force - Whether to force kill
   */
  private async terminateProcessCrossPlatform(pid: number, force: boolean): Promise<void> {
    if (process.platform === 'win32') {
      // Windows: use taskkill
      return new Promise((resolve, reject) => {
        const signal = force ? '/F' : '/T';
        const proc = spawn('taskkill', [signal, '/PID', String(pid)], {
          stdio: 'ignore',
        });

        proc.on('close', (code) => {
          if (code === 0 || code === 128) {
            // 128 = process not found (already terminated)
            resolve();
          } else {
            reject(new Error(`taskkill exited with code ${code}`));
          }
        });

        proc.on('error', reject);
      });
    } else {
      // Unix: use process.kill with process groups
      const signal = force ? 'SIGKILL' : 'SIGTERM';
      try {
        // Try to kill process group (negative PID)
        process.kill(-pid, signal);
      } catch (err) {
        // Fallback: kill single process
        try {
          process.kill(pid, signal);
        } catch (innerErr) {
          // Process may have already exited
          const error = innerErr as NodeJS.ErrnoException;
          if (error.code !== 'ESRCH') {
            // ESRCH = No such process (already terminated)
            throw innerErr;
          }
        }
      }
    }
  }

  /**
   * Saves the registry to disk.
   */
  private async save(): Promise<void> {
    if (!this.registry) {
      return;
    }

    // Ensure directory exists
    await fs.mkdir(dirname(this.registryPath), { recursive: true });

    // Write registry file
    await fs.writeFile(this.registryPath, JSON.stringify(this.registry, null, 2), 'utf-8');
  }

  /**
   * Loads the registry from disk.
   * @returns Session registry or null if file doesn't exist
   */
  private async load(): Promise<SessionRegistry | null> {
    try {
      const content = await fs.readFile(this.registryPath, 'utf-8');
      const registry = JSON.parse(content) as SessionRegistry;

      // Validate structure
      if (
        !registry.sessionId ||
        !registry.processes ||
        !Array.isArray(registry.processes) ||
        !registry.startedAt
      ) {
        throw new Error('Invalid session registry structure');
      }

      return registry;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null; // File doesn't exist
      }
      throw error;
    }
  }
}
