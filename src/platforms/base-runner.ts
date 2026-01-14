/**
 * Base Platform Runner for RWM Puppet Master
 * 
 * Abstract base class that implements PlatformRunnerContract and provides
 * common functionality for all platform-specific runners.
 * 
 * Per REQUIREMENTS.md Section 26.2 (Platform Runner Contract) and
 * ARCHITECTURE.md Section 6.1.1 (Base Runner).
 */

import { EventEmitter } from 'events';
import { ChildProcess } from 'child_process';
import type {
  Platform,
  ExecutionRequest,
  ExecutionResult,
  RunningProcess,
  PlatformRunnerContract,
} from '../types/platforms.js';
import type {
  PlatformCapabilities as DiscoveryPlatformCapabilities,
  QuotaInfo,
  CooldownInfo,
} from '../types/capabilities.js';
import { CapabilityDiscoveryService } from './capability-discovery.js';

/**
 * Abstract base class for platform runners.
 * 
 * Provides common functionality while leaving platform-specific behavior
 * to subclasses via abstract methods.
 */
export abstract class BasePlatformRunner
  extends EventEmitter
  implements PlatformRunnerContract
{
  abstract readonly platform: Platform;
  readonly sessionReuseAllowed: boolean = false;
  readonly allowedContextFiles: string[] = [
    'progress.txt',
    'AGENTS.md',
    'prd.json',
    '.puppet-master/plans/*',
  ];
  readonly defaultTimeout: number;
  readonly hardTimeout: number;

  protected processes: Map<number, ChildProcess> = new Map();
  protected capabilityService: CapabilityDiscoveryService;

  /**
   * Creates a new BasePlatformRunner instance.
   * 
   * @param capabilityService - Capability discovery service (required)
   * @param defaultTimeout - Default timeout in milliseconds (default: 300000 = 5 minutes)
   * @param hardTimeout - Hard timeout in milliseconds (default: 1800000 = 30 minutes)
   * @param allowedContextFiles - Allowed context files (default: standard list)
   */
  constructor(
    capabilityService: CapabilityDiscoveryService,
    defaultTimeout: number = 300_000,
    hardTimeout: number = 1_800_000,
    allowedContextFiles?: string[]
  ) {
    super();
    this.capabilityService = capabilityService;
    this.defaultTimeout = defaultTimeout;
    this.hardTimeout = hardTimeout;
    if (allowedContextFiles) {
      this.allowedContextFiles = allowedContextFiles;
    }
  }

  /**
   * Abstract method: Platform-specific process spawning.
   * 
   * Subclasses must implement this to spawn the platform-specific CLI process.
   */
  protected abstract spawn(request: ExecutionRequest): Promise<ChildProcess>;

  /**
   * Abstract method: Build command-line arguments.
   * 
   * Subclasses must implement this to build platform-specific CLI arguments.
   */
  protected abstract buildArgs(request: ExecutionRequest): string[];

  /**
   * Abstract method: Parse platform output.
   * 
   * Subclasses must implement this to parse platform-specific output format.
   */
  protected abstract parseOutput(output: string): ExecutionResult;

  /**
   * Spawns a fresh process for execution.
   * 
   * Implements PlatformRunnerContract.spawnFreshProcess.
   * Creates a new process and tracks it by PID.
   */
  async spawnFreshProcess(
    request: ExecutionRequest
  ): Promise<RunningProcess> {
    await this.prepareWorkingDirectory(request.workingDirectory);

    const proc = await this.spawn(request);

    if (!proc.pid) {
      throw new Error(`Failed to spawn ${this.platform} process: no PID assigned`);
    }

    // Track process
    this.processes.set(proc.pid, proc);

    // Create RunningProcess object
    const runningProcess: RunningProcess = {
      pid: proc.pid,
      platform: this.platform,
      startedAt: new Date().toISOString(),
      stdin: proc.stdin!,
      stdout: proc.stdout!,
      stderr: proc.stderr!,
    };

    return runningProcess;
  }

  /**
   * Prepares the working directory for execution.
   * 
   * Implements PlatformRunnerContract.prepareWorkingDirectory.
   * Default implementation does nothing - subclasses can override.
   */
  async prepareWorkingDirectory(_path: string): Promise<void> {
    // Default implementation: no-op
    // Subclasses can override for platform-specific preparation
  }

  /**
   * Cleans up after execution.
   * 
   * Implements PlatformRunnerContract.cleanupAfterExecution.
   * Ensures process is terminated and removes from tracking.
   */
  async cleanupAfterExecution(pid: number): Promise<void> {
    const proc = this.processes.get(pid);
    if (proc) {
      // Ensure process is terminated
      if (!proc.killed && proc.exitCode === null) {
        try {
          await this.terminateProcess(pid);
        } catch {
          // Process may already be dead
        }
      }
      // Remove from tracking
      this.processes.delete(pid);
    }
  }

  /**
   * Terminates a process with SIGTERM.
   * 
   * Implements PlatformRunnerContract.terminateProcess.
   */
  async terminateProcess(pid: number): Promise<void> {
    const proc = this.processes.get(pid);
    if (proc && !proc.killed && proc.exitCode === null) {
      proc.kill('SIGTERM');
    }
  }

  /**
   * Force kills a process with SIGKILL.
   * 
   * Implements PlatformRunnerContract.forceKillProcess.
   */
  async forceKillProcess(pid: number): Promise<void> {
    const proc = this.processes.get(pid);
    if (proc && !proc.killed) {
      proc.kill('SIGKILL');
    }
  }

  /**
   * Captures stdout as an AsyncIterable.
   * 
   * Implements PlatformRunnerContract.captureStdout.
   */
  async *captureStdout(pid: number): AsyncIterable<string> {
    const proc = this.processes.get(pid);
    if (!proc || !proc.stdout) {
      return;
    }

    const stream = proc.stdout;
    let buffer = '';

    // Use event-based iteration for Node.js streams
    const chunks: string[] = [];
    let streamEnded = false;
    let streamError: Error | null = null;

    stream.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      chunks.push(text);
      
      // Emit output event
      this.emit('output', {
        pid,
        chunk: text,
        stream: 'stdout' as const,
      });
    });

    stream.on('end', () => {
      streamEnded = true;
    });

    stream.on('error', (error: Error) => {
      streamError = error;
      streamEnded = true;
    });

    // Yield chunks as they arrive
    while (!streamEnded || chunks.length > 0) {
      if (chunks.length > 0) {
        const text = chunks.shift()!;
        buffer += text;

        // Yield complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          yield line;
        }
      } else {
        // Wait a bit for more data
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    // Yield remaining buffer
    if (buffer) {
      yield buffer;
    }

    if (streamError) {
      throw streamError;
    }
  }

  /**
   * Captures stderr as an AsyncIterable.
   * 
   * Implements PlatformRunnerContract.captureStderr.
   */
  async *captureStderr(pid: number): AsyncIterable<string> {
    const proc = this.processes.get(pid);
    if (!proc || !proc.stderr) {
      return;
    }

    const stream = proc.stderr;
    let buffer = '';

    // Use event-based iteration for Node.js streams
    const chunks: string[] = [];
    let streamEnded = false;
    let streamError: Error | null = null;

    stream.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      chunks.push(text);
      
      // Emit output event
      this.emit('output', {
        pid,
        chunk: text,
        stream: 'stderr' as const,
      });
    });

    stream.on('end', () => {
      streamEnded = true;
    });

    stream.on('error', (error: Error) => {
      streamError = error;
      streamEnded = true;
    });

    // Yield chunks as they arrive
    while (!streamEnded || chunks.length > 0) {
      if (chunks.length > 0) {
        const text = chunks.shift()!;
        buffer += text;

        // Yield complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          yield line;
        }
      } else {
        // Wait a bit for more data
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    // Yield remaining buffer
    if (buffer) {
      yield buffer;
    }

    if (streamError) {
      throw streamError;
    }
  }

  /**
   * Gets the full transcript of a process.
   * 
   * Implements PlatformRunnerContract.getTranscript.
   */
  async getTranscript(pid: number): Promise<string> {
    const stdoutParts: string[] = [];
    const stderrParts: string[] = [];

    // Collect stdout
    for await (const chunk of this.captureStdout(pid)) {
      stdoutParts.push(chunk);
    }

    // Collect stderr
    for await (const chunk of this.captureStderr(pid)) {
      stderrParts.push(chunk);
    }

    const stdout = stdoutParts.join('\n');
    const stderr = stderrParts.join('\n');

    if (stderr) {
      return `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`;
    }
    return stdout;
  }

  /**
   * Executes a request and returns the result.
   * 
   * Orchestrates the full execution cycle: spawn → collect output → parse.
   * This is a convenience method that wraps spawnFreshProcess and handles
   * the complete lifecycle.
   */
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const startTime = Date.now();
    let runningProcess: RunningProcess | null = null;

    try {
      // Spawn fresh process
      runningProcess = await this.spawnFreshProcess(request);
      const pid = runningProcess.pid;

      // Collect output
      const stdoutParts: string[] = [];
      const stderrParts: string[] = [];

      // Set up stdout collection
      const stdoutPromise = (async () => {
        for await (const chunk of this.captureStdout(pid)) {
          stdoutParts.push(chunk);
        }
      })();

      // Set up stderr collection
      const stderrPromise = (async () => {
        for await (const chunk of this.captureStderr(pid)) {
          stderrParts.push(chunk);
        }
      })();

      // Wait for process to exit
      const proc = this.processes.get(pid);
      if (!proc) {
        throw new Error(`Process ${pid} not found after spawning`);
      }

      await new Promise<void>((resolve, reject) => {
        proc.on('exit', (_code) => {
          resolve();
        });
        proc.on('error', (error) => {
          reject(error);
        });
      });

      // Wait for streams to finish
      await Promise.all([stdoutPromise, stderrPromise]);

      // Get exit code
      const exitCode = proc.exitCode ?? 1;

      // Combine output
      const output = stdoutParts.join('\n');
      const stderr = stderrParts.join('\n');
      const fullOutput = stderr ? `${output}\n${stderr}` : output;

      // Parse output
      const result = this.parseOutput(fullOutput);
      
      // Update result with process info
      result.processId = pid;
      result.duration = Date.now() - startTime;
      result.exitCode = exitCode;

      // Emit complete event
      this.emit('complete', {
        pid,
        result,
      });

      // Cleanup
      await this.cleanupAfterExecution(pid);

      return result;
    } catch (error) {
      const pid = runningProcess?.pid;
      if (pid) {
        // Emit error event
        this.emit('error', {
          pid,
          error: error instanceof Error ? error : new Error(String(error)),
        });

        // Cleanup on error
        await this.cleanupAfterExecution(pid);
      }

      throw error;
    }
  }

  /**
   * Gets platform capabilities.
   * 
   * Delegates to CapabilityDiscoveryService to get cached or probe capabilities.
   */
  async getCapabilities(): Promise<DiscoveryPlatformCapabilities> {
    const cached = await this.capabilityService.getCached(this.platform);
    if (cached) {
      return cached.capabilities;
    }

    // If not cached, probe
    const probeResult = await this.capabilityService.probe(this.platform);
    return probeResult.capabilities;
  }

  /**
   * Checks quota information.
   * 
   * Delegates to CapabilityDiscoveryService to get quota info.
   */
  async checkQuota(): Promise<QuotaInfo> {
    const cached = await this.capabilityService.getCached(this.platform);
    if (cached) {
      return cached.quotaInfo;
    }

    // If not cached, probe
    const probeResult = await this.capabilityService.probe(this.platform);
    return probeResult.quotaInfo;
  }

  /**
   * Checks cooldown information.
   * 
   * Delegates to CapabilityDiscoveryService to get cooldown info.
   */
  async checkCooldown(): Promise<CooldownInfo> {
    const cached = await this.capabilityService.getCached(this.platform);
    if (cached) {
      return cached.cooldownInfo;
    }

    // If not cached, probe
    const probeResult = await this.capabilityService.probe(this.platform);
    return probeResult.cooldownInfo;
  }
}
