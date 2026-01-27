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
import type { RateLimiter } from '../budget/rate-limiter.js';
import type { QuotaManager } from './quota-manager.js';
import { QuotaExhaustedError } from './quota-manager.js';
import type { FreshSpawner, SpawnRequest, SpawnResult } from '../core/fresh-spawn.js';
import { CircuitBreaker, CircuitBreakerOpenError } from './circuit-breaker.js';

/**
 * Error thrown when a runner execution exceeds its configured time limits.
 *
 * - **soft**: `request.timeout` exceeded; runner requested graceful termination (SIGTERM)
 * - **hard**: `request.hardTimeout` exceeded; runner forced termination (SIGKILL)
 */
export class TimeoutError extends Error {
  readonly name = 'TimeoutError';

  constructor(
    public readonly type: 'soft' | 'hard',
    public readonly elapsed: number
  ) {
    super(`${type} timeout after ${elapsed}ms`);
  }
}

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
  /**
   * Running processes when using FreshSpawner (keyed by PID).
   * 
   * When using FreshSpawner, we don't have a ChildProcess to track,
   * but we need to access the streams for captureStdout/captureStderr.
   */
  private readonly runningProcesses: Map<number, RunningProcess> = new Map();
  /**
   * P0-G13: Store SpawnResults to access waitForExit method.
   * Used when FreshSpawner is in use to get actual exit code.
   */
  private readonly spawnResults: Map<number, SpawnResult> = new Map();
  /**
   * Captured stdout/stderr for each spawned process (keyed by PID).
   *
   * Important: transcripts must be captured once at spawn time to avoid
   * re-attaching stream listeners after a stream has already ended.
   */
  private readonly capturedOutput: Map<number, { stdout: string; stderr: string }> = new Map();
  protected capabilityService: CapabilityDiscoveryService;
  protected rateLimiter?: RateLimiter;
  protected quotaManager?: QuotaManager;
  protected freshSpawner?: FreshSpawner;
  protected readonly circuitBreaker: CircuitBreaker;

  /**
   * Creates a new BasePlatformRunner instance.
   * 
   * @param capabilityService - Capability discovery service (required)
   * @param defaultTimeout - Default timeout in milliseconds (default: 300000 = 5 minutes)
   * @param hardTimeout - Hard timeout in milliseconds (default: 1800000 = 30 minutes)
   * @param allowedContextFiles - Allowed context files (default: standard list)
   * @param rateLimiter - Optional rate limiter for enforcing call rate limits (P1-T07)
   * @param quotaManager - Optional quota manager for enforcing quota limits (P1-T07)
   * @param freshSpawner - Optional FreshSpawner for process isolation (P1-T09)
   */
  constructor(
    capabilityService: CapabilityDiscoveryService,
    defaultTimeout: number = 300_000,
    hardTimeout: number = 1_800_000,
    allowedContextFiles?: string[],
    rateLimiter?: RateLimiter,
    quotaManager?: QuotaManager,
    freshSpawner?: FreshSpawner
  ) {
    super();
    this.capabilityService = capabilityService;
    this.defaultTimeout = defaultTimeout;
    this.hardTimeout = hardTimeout;
    this.circuitBreaker = new CircuitBreaker();
    if (allowedContextFiles) {
      this.allowedContextFiles = allowedContextFiles;
    }
    this.rateLimiter = rateLimiter;
    this.quotaManager = quotaManager;
    this.freshSpawner = freshSpawner;
  }

  /**
   * Abstract method: Platform-specific process spawning.
   * 
   * Subclasses must implement this to spawn the platform-specific CLI process.
   * NOTE: This is used as a fallback when FreshSpawner is not provided.
   */
  protected abstract spawn(request: ExecutionRequest): Promise<ChildProcess>;

  /**
   * Abstract method: Get the platform command executable.
   * 
   * Subclasses must implement this to return the platform-specific CLI command.
   */
  protected abstract getCommand(): string;

  /**
   * Abstract method: Build command-line arguments.
   * 
   * Subclasses must implement this to build platform-specific CLI arguments.
   */
  protected abstract buildArgs(request: ExecutionRequest): string[];

  /**
   * Whether the platform writes the prompt to stdin instead of passing it as an argument.
   * 
   * Subclasses can override this to return true if the platform writes the prompt to stdin.
   * Default is false (prompt is passed as an argument).
   */
  protected writesPromptToStdin(): boolean {
    return false;
  }

  /**
   * Get custom environment variables for the platform.
   * 
   * Subclasses can override this to return platform-specific environment variables.
   * Default returns an empty object.
   */
  protected getCustomEnv(_request: ExecutionRequest): Record<string, string> {
    return {};
  }

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
   * 
   * If FreshSpawner is provided, uses it for process isolation, git state verification,
   * audit logging, and timeout handling. Otherwise, falls back to direct spawn.
   */
  async spawnFreshProcess(
    request: ExecutionRequest
  ): Promise<RunningProcess> {
    // Use FreshSpawner if available (P1-T09)
    if (this.freshSpawner) {
      // Generate iteration ID for audit logging
      const iterationId = `${this.platform}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Get command and args from runner
      const command = this.getCommand();
      const args = this.buildArgs(request);
      
      // Build SpawnRequest
      const spawnRequest: SpawnRequest = {
        prompt: request.prompt,
        platform: this.platform,
        model: request.model,
        contextFiles: request.contextFiles ?? this.allowedContextFiles,
        iterationId,
        customCommand: command,
        customArgs: args,
        customEnv: this.getCustomEnv(request),
        writePromptToStdin: this.writesPromptToStdin(),
      };

      // Spawn using FreshSpawner
      const spawnResult = await this.freshSpawner.spawn(spawnRequest);
      
      // Track process (FreshSpawner manages the actual ChildProcess internally)
      // We still track it here for compatibility with existing code
      const proc = this.processes.get(spawnResult.processId);
      if (proc) {
        // Process already tracked (shouldn't happen, but handle gracefully)
      }

      // Capture stdout/stderr once at spawn time to avoid transcript race conditions.
      const output = { stdout: '', stderr: '' };
      this.capturedOutput.set(spawnResult.processId, output);

      const appendChunk = (chunk: Buffer | string): string =>
        typeof chunk === 'string' ? chunk : chunk.toString();

      if (spawnResult.stdout) {
        spawnResult.stdout.on('data', (chunk: Buffer | string) => {
          output.stdout += appendChunk(chunk);
        });
      }
      if (spawnResult.stderr) {
        spawnResult.stderr.on('data', (chunk: Buffer | string) => {
          output.stderr += appendChunk(chunk);
        });
      }

      // Create RunningProcess object
      const runningProcess: RunningProcess = {
        pid: spawnResult.processId,
        platform: this.platform,
        startedAt: spawnResult.startedAt,
        stdin: spawnResult.stdin,
        stdout: spawnResult.stdout,
        stderr: spawnResult.stderr,
      };

      // Store for access by captureStdout/captureStderr
      this.runningProcesses.set(spawnResult.processId, runningProcess);
      
      // P0-G13: Store SpawnResult for later access to waitForExit
      this.spawnResults.set(spawnResult.processId, spawnResult);

      return runningProcess;
    }

    // Fallback to direct spawn (backward compatibility)
    await this.prepareWorkingDirectory(request.workingDirectory);

    const proc = await this.spawn(request);

    if (!proc.pid) {
      throw new Error(`Failed to spawn ${this.platform} process: no PID assigned`);
    }

    // Track process
    this.processes.set(proc.pid, proc);

    // Capture stdout/stderr once at spawn time to avoid transcript race conditions.
    const output = { stdout: '', stderr: '' };
    this.capturedOutput.set(proc.pid, output);

    const appendChunk = (chunk: Buffer | string): string =>
      typeof chunk === 'string' ? chunk : chunk.toString();

    if (proc.stdout) {
      proc.stdout.on('data', (chunk: Buffer | string) => {
        output.stdout += appendChunk(chunk);
      });
    }
    if (proc.stderr) {
      proc.stderr.on('data', (chunk: Buffer | string) => {
        output.stderr += appendChunk(chunk);
      });
    }

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
   * If FreshSpawner is provided, delegates to it for git state verification.
   * Otherwise, does nothing (subclasses can override).
   */
  async prepareWorkingDirectory(_path: string): Promise<void> {
    // If FreshSpawner is provided, it handles git state verification
    // FreshSpawner.prepareWorkingDirectory() is called internally during spawn()
    // So we don't need to call it here separately
    // This method is kept for backward compatibility and for subclasses to override
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
    // Clean up running process if using FreshSpawner
    this.runningProcesses.delete(pid);
    // P0-G13: Clean up SpawnResult tracking
    this.spawnResults.delete(pid);
    // Always clean up captured transcripts to prevent unbounded growth.
    this.capturedOutput.delete(pid);
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
    // Try to get from processes first (direct spawn)
    let stream: NodeJS.ReadableStream | undefined;
    const proc = this.processes.get(pid);
    if (proc && proc.stdout) {
      stream = proc.stdout;
    } else {
      // Try to get from runningProcesses (FreshSpawner)
      const runningProcess = this.runningProcesses.get(pid);
      if (runningProcess && runningProcess.stdout) {
        stream = runningProcess.stdout;
      }
    }

    if (!stream) {
      return;
    }
    let buffer = '';

    // Use event-based iteration for Node.js streams
    const chunks: string[] = [];
    let streamEnded =
      ('readableEnded' in stream &&
        (stream as NodeJS.ReadableStream & { readableEnded?: boolean }).readableEnded === true) ||
      ('destroyed' in stream && (stream as NodeJS.ReadableStream & { destroyed?: boolean }).destroyed === true);
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

    stream.on('close', () => {
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
    // Try to get from processes first (direct spawn)
    let stream: NodeJS.ReadableStream | undefined;
    const proc = this.processes.get(pid);
    if (proc && proc.stderr) {
      stream = proc.stderr;
    } else {
      // Try to get from runningProcesses (FreshSpawner)
      const runningProcess = this.runningProcesses.get(pid);
      if (runningProcess && runningProcess.stderr) {
        stream = runningProcess.stderr;
      }
    }

    if (!stream) {
      return;
    }
    let buffer = '';

    // Use event-based iteration for Node.js streams
    const chunks: string[] = [];
    let streamEnded =
      ('readableEnded' in stream &&
        (stream as NodeJS.ReadableStream & { readableEnded?: boolean }).readableEnded === true) ||
      ('destroyed' in stream && (stream as NodeJS.ReadableStream & { destroyed?: boolean }).destroyed === true);
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

    stream.on('close', () => {
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
    const captured = this.capturedOutput.get(pid);
    if (!captured) {
      return '';
    }

    const stdout = captured.stdout;
    const stderr = captured.stderr;

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
    let softTimeoutId: NodeJS.Timeout | null = null;
    let hardTimeoutId: NodeJS.Timeout | null = null;
    let timeoutType: 'soft' | 'hard' | null = null;
    let didCleanup = false;
    let breakerRecorded = false;

    const clearTimers = (): void => {
      if (softTimeoutId) {
        clearTimeout(softTimeoutId);
        softTimeoutId = null;
      }
      if (hardTimeoutId) {
        clearTimeout(hardTimeoutId);
        hardTimeoutId = null;
      }
    };

    try {
      // Circuit breaker (P2-T06): fail fast when this platform is unhealthy.
      // Do this before quota/rate-limit checks so OPEN platforms short-circuit immediately.
      this.circuitBreaker.assertCanExecute();

      // Check rate limit and quota before execution (P1-T07)
      if (this.rateLimiter) {
        await this.rateLimiter.waitForSlot(this.platform);
      }
      if (this.quotaManager) {
        // This will throw QuotaExhaustedError if hard limit is reached
        // P0: Pass model to checkQuota for Cursor Auto mode unlimited detection
        await this.quotaManager.checkQuota(this.platform, request.model);
      }

      // Spawn fresh process
      runningProcess = await this.spawnFreshProcess(request);
      const pid = runningProcess.pid;

      // Collect output
      const stdoutParts: string[] = [];
      const stderrParts: string[] = [];

      // When using FreshSpawner, it handles timeouts internally
      // We still need to wait for the process to exit and collect output
      const usingFreshSpawner = this.freshSpawner !== undefined;
      
      let exitCode = 1;
      
      if (usingFreshSpawner) {
        // FreshSpawner handles timeouts, so we don't set up our own timers
        // Collect output directly from the streams (already set up in spawnFreshProcess)
        // The output is being captured in capturedOutput map
        // Wait for streams to finish by reading from them
        const stdoutPromise = (async () => {
          for await (const chunk of this.readStreamAsAsyncIterable(runningProcess.stdout)) {
            stdoutParts.push(chunk);
          }
        })();

        const stderrPromise = (async () => {
          for await (const chunk of this.readStreamAsAsyncIterable(runningProcess.stderr)) {
            stderrParts.push(chunk);
          }
        })();

        await Promise.all([stdoutPromise, stderrPromise]);
        
        // P0-G13: Use waitForExit to get actual exit code from FreshSpawner
        const spawnResult = this.spawnResults.get(pid);
        if (spawnResult) {
          const exitResult = await spawnResult.waitForExit();
          exitCode = exitResult.exitCode ?? 1;
        } else {
          // Fallback if spawnResult not found (shouldn't happen)
          console.warn(`[BasePlatformRunner] SpawnResult not found for PID ${pid}, defaulting to exit code 0`);
          exitCode = 0;
        }
      } else {
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
        // Fallback path: direct spawn with our own timeout handling
        const proc = this.processes.get(pid);
        if (!proc) {
          throw new Error(`Process ${pid} not found after spawning`);
        }

        const timeoutMs = request.timeout ?? this.defaultTimeout;
        const computedHardTimeoutMs = request.hardTimeout ?? Math.floor(timeoutMs * 1.5);
        // Ensure hard timeout is always strictly after soft timeout (when both enabled).
        const hardTimeoutMs =
          timeoutMs > 0
            ? Math.max(computedHardTimeoutMs, timeoutMs + 1)
            : computedHardTimeoutMs;

        // Soft timeout: request graceful stop (SIGTERM).
        if (timeoutMs > 0) {
          softTimeoutId = setTimeout(() => {
            if (timeoutType === null) {
              timeoutType = 'soft';
            }
            // Log + emit for debugging/observability.
            console.warn(`[${this.platform}] Soft timeout exceeded (${timeoutMs}ms) for pid=${pid}; requesting SIGTERM`);
            this.emit('timeout', { pid, type: 'soft' as const, timeoutMs, hardTimeoutMs });
            void this.terminateProcess(pid).catch(() => undefined);
          }, timeoutMs);
        }

        // Hard timeout: force kill (SIGKILL).
        if (hardTimeoutMs > 0) {
          hardTimeoutId = setTimeout(() => {
            timeoutType = 'hard';
            console.warn(`[${this.platform}] Hard timeout exceeded (${hardTimeoutMs}ms) for pid=${pid}; forcing SIGKILL`);
            this.emit('timeout', { pid, type: 'hard' as const, timeoutMs, hardTimeoutMs });
            void this.forceKillProcess(pid).catch(() => undefined);
          }, hardTimeoutMs);
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
        exitCode = proc.exitCode ?? 1;
      }

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

      // Circuit breaker result accounting (P2-T06)
      // - Any timeout counts as failure (regardless of parse result).
      // - Otherwise use `result.success` to decide failure vs success.
      if (timeoutType) {
        this.circuitBreaker.recordFailure();
        breakerRecorded = true;
      } else if (result.success) {
        this.circuitBreaker.recordSuccess();
        breakerRecorded = true;
      } else {
        this.circuitBreaker.recordFailure();
        breakerRecorded = true;
      }

      // Emit complete event
      this.emit('complete', {
        pid,
        result,
      });

      // Cleanup
      await this.cleanupAfterExecution(pid);
      didCleanup = true;

      clearTimers();

      // Record usage after successful execution (P1-T07)
      const duration = Date.now() - startTime;
      if (this.rateLimiter) {
        this.rateLimiter.recordCall(this.platform);
      }
      if (this.quotaManager) {
        // P0-G21: Use actual tokens when available, fall back to estimation
        // Parsers like GeminiOutputParser extract tokensUsed from output
        const tokens = result.tokensUsed ?? Math.max(100, Math.floor(duration / 10));
        // P0: Pass model to recordUsage for Cursor Auto mode unlimited detection
        await this.quotaManager.recordUsage(this.platform, tokens, duration, request.model);
      }

      if (timeoutType) {
        throw new TimeoutError(timeoutType, Date.now() - startTime);
      }

      return result;
    } catch (error) {
      // Circuit breaker failure accounting (P2-T06)
      // Count real platform execution failures, but do NOT count:
      // - CircuitBreakerOpenError: already OPEN, fail-fast only
      // - QuotaExhaustedError: quota is not "platform unhealthy"
      if (
        breakerRecorded === false &&
        !(error instanceof CircuitBreakerOpenError) &&
        !(error instanceof QuotaExhaustedError)
      ) {
        this.circuitBreaker.recordFailure();
        breakerRecorded = true;
      }

      const pid = runningProcess?.pid;
      if (pid) {
        // Emit error event (only if listeners exist).
        // Node's EventEmitter treats 'error' as special and will throw if unhandled.
        if (this.listenerCount('error') > 0) {
          this.emit('error', {
            pid,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }

        // Record usage even on error for accurate tracking (P1-T07)
        const duration = Date.now() - startTime;
        if (this.rateLimiter) {
          this.rateLimiter.recordCall(this.platform);
        }
        if (this.quotaManager) {
          // P0-G21: On error, we don't have parsed output, so use duration-based estimation
          const estimatedTokens = Math.max(100, Math.floor(duration / 10));
          // P0: Pass model to recordUsage for Cursor Auto mode unlimited detection
          await this.quotaManager.recordUsage(this.platform, estimatedTokens, duration, request.model).catch(() => {
            // Ignore errors when recording usage on failure
          });
        }

        // Cleanup on error (avoid double-cleanup if we already cleaned up on the happy-path).
        if (!didCleanup) {
          await this.cleanupAfterExecution(pid);
          didCleanup = true;
        }
      }

      clearTimers();

      throw error;
    }
  }

  /**
   * Helper method to read a stream as an AsyncIterable.
   * Used when collecting output from FreshSpawner streams.
   */
  private async *readStreamAsAsyncIterable(
    stream: NodeJS.ReadableStream
  ): AsyncIterable<string> {
    const chunks: string[] = [];
    let streamEnded = false;
    let streamError: Error | null = null;

    stream.on('data', (chunk: Buffer) => {
      chunks.push(chunk.toString());
    });

    stream.on('end', () => {
      streamEnded = true;
    });

    stream.on('close', () => {
      streamEnded = true;
    });

    stream.on('error', (error: Error) => {
      streamError = error;
      streamEnded = true;
    });

    while (!streamEnded || chunks.length > 0) {
      if (chunks.length > 0) {
        yield chunks.shift()!;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    if (streamError) {
      throw streamError;
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
  /**
   * Checks quota for this platform.
   * P0: Supports model parameter for Cursor Auto mode unlimited detection.
   * 
   * @param model - Optional model name (used for Cursor Auto mode detection)
   */
  async checkQuota(model?: string): Promise<QuotaInfo> {
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

  /**
   * Best-effort platform health check (P2-T07).
   *
   * Default implementation uses capability discovery probe and fails if the
   * underlying CLI is not runnable.
   *
   * Runners may override this for richer checks (auth, smoke tests, etc.).
   */
  async healthCheck(): Promise<void> {
    const probe = await this.capabilityService.probe(this.platform);
    if (!probe.runnable) {
      // P1-G18: Add recovery guidance to error message
      throw new Error(
        `Platform ${this.platform} CLI is not runnable (command: ${probe.command}). ` +
        `Run 'puppet-master doctor' to diagnose and 'puppet-master login ${this.platform}' to authenticate.`
      );
    }
  }
}
