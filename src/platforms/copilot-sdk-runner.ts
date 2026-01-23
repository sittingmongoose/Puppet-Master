/**
 * GitHub Copilot SDK Platform Runner
 *
 * Executes prompts via the official GitHub Copilot SDK (@github/copilot-sdk).
 * Uses JSON-RPC communication with Copilot CLI instead of process spawning.
 *
 * Benefits over CLI spawning:
 * - Model selection (SessionConfig.model)
 * - Custom tool definitions
 * - Structured responses (no text parsing)
 * - Session persistence (opt-in)
 *
 * Per REQUIREMENTS.md Section 26.2 (Platform Runner Contract)
 *
 * @see https://github.com/github/copilot-sdk - Official SDK repository
 */

import { EventEmitter } from 'events';
import { Readable, Writable, PassThrough } from 'stream';
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

// SDK types - will be available after npm install
// For now, define minimal interfaces for type safety
interface CopilotClient {
  start(): Promise<void>;
  stop(): Promise<void>;
  getStatus(): Promise<{ version: string; cliVersion?: string }>;
  getAuthStatus(): Promise<{ authenticated: boolean; authType?: string }>;
  listModels(): Promise<string[]>;
  createSession(config: SessionConfig): Promise<CopilotSession>;
  resumeSession?(state: unknown): Promise<CopilotSession>;
}

interface SessionConfig {
  model?: string;
  tools?: CopilotTool[];
}

interface CopilotSession {
  send(options: { prompt: string }): Promise<CopilotResponse>;
  export?(): Promise<unknown>;
  destroy(): Promise<void>;
}

interface CopilotResponse {
  status: 'completed' | 'error' | 'tool_use';
  content: string;
  tokensUsed?: number;
  toolCalls?: Array<{ name: string; result: unknown }>;
}

interface CopilotTool {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
  handler: (params: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Configuration for the Copilot SDK runner.
 */
export interface CopilotSdkRunnerConfig {
  /** Default model to use (default: claude-sonnet-4.5) */
  defaultModel?: string;
  /** Enable session persistence across iterations (default: false) */
  sessionPersistence?: boolean;
  /** Custom tools to expose to Copilot */
  customTools?: CopilotTool[];
}

/**
 * GitHub Copilot SDK-based Platform Runner
 *
 * Uses the official SDK for structured communication instead of CLI spawning.
 * Provides model selection, custom tools, and optional session persistence.
 */
export class CopilotSdkRunner extends EventEmitter implements PlatformRunnerContract {
  readonly platform: Platform = 'copilot';
  readonly sessionReuseAllowed: boolean;
  readonly allowedContextFiles: string[] = [
    'progress.txt',
    'AGENTS.md',
    'prd.json',
    '.puppet-master/plans/*',
  ];
  readonly defaultTimeout: number;
  readonly hardTimeout: number;

  private client: CopilotClient | null = null;
  private session: CopilotSession | null = null;
  private capabilityService: CapabilityDiscoveryService;
  private rateLimiter?: RateLimiter;
  private quotaManager?: QuotaManager;
  private config: CopilotSdkRunnerConfig;

  // Track "processes" for compatibility with existing interface
  // SDK doesn't use real processes, so we simulate with virtual PIDs
  private virtualProcesses: Map<number, VirtualProcess> = new Map();
  private nextVirtualPid: number = 100000; // Start high to avoid conflicts

  /**
   * Creates a new CopilotSdkRunner instance.
   *
   * @param capabilityService - Capability discovery service
   * @param config - SDK runner configuration
   * @param defaultTimeout - Default timeout in milliseconds (default: 300000 = 5 minutes)
   * @param hardTimeout - Hard timeout in milliseconds (default: 1800000 = 30 minutes)
   * @param rateLimiter - Optional rate limiter
   * @param quotaManager - Optional quota manager
   */
  constructor(
    capabilityService: CapabilityDiscoveryService,
    config: CopilotSdkRunnerConfig = {},
    defaultTimeout: number = 300_000,
    hardTimeout: number = 1_800_000,
    rateLimiter?: RateLimiter,
    quotaManager?: QuotaManager
  ) {
    super();
    this.capabilityService = capabilityService;
    this.config = {
      defaultModel: config.defaultModel ?? 'claude-sonnet-4.5',
      sessionPersistence: config.sessionPersistence ?? false,
      customTools: config.customTools ?? [],
    };
    this.defaultTimeout = defaultTimeout;
    this.hardTimeout = hardTimeout;
    this.sessionReuseAllowed = config.sessionPersistence ?? false;
    this.rateLimiter = rateLimiter;
    this.quotaManager = quotaManager;
  }

  /**
   * Initializes the SDK client.
   * Must be called before executing requests.
   */
  async initialize(): Promise<void> {
    if (this.client) {
      return; // Already initialized
    }

    // Dynamic import of the SDK
    const { CopilotClient: SdkClient } = await import('@github/copilot-sdk');
    this.client = new SdkClient() as unknown as CopilotClient;
    await this.client.start();
  }

  /**
   * Shuts down the SDK client.
   */
  async shutdown(): Promise<void> {
    if (this.session) {
      await this.session.destroy();
      this.session = null;
    }
    if (this.client) {
      await this.client.stop();
      this.client = null;
    }
  }

  /**
   * Gets SDK client status including authentication.
   */
  async getClientStatus(): Promise<{
    version: string;
    cliVersion?: string;
    authenticated: boolean;
    authType?: string;
    models: string[];
  }> {
    await this.initialize();
    if (!this.client) {
      throw new Error('SDK client not initialized');
    }

    const [status, authStatus, models] = await Promise.all([
      this.client.getStatus(),
      this.client.getAuthStatus(),
      this.client.listModels(),
    ]);

    return {
      version: status.version,
      cliVersion: status.cliVersion,
      authenticated: authStatus.authenticated,
      authType: authStatus.authType,
      models,
    };
  }

  /**
   * Spawns a fresh "process" for execution.
   *
   * Note: The SDK doesn't use real processes. This creates a virtual process
   * representation for compatibility with the PlatformRunnerContract interface.
   */
  async spawnFreshProcess(request: ExecutionRequest): Promise<RunningProcess> {
    await this.initialize();

    // Create virtual process with mock streams
    const virtualPid = this.nextVirtualPid++;
    const stdout = new PassThrough();
    const stderr = new PassThrough();
    const stdin = new PassThrough();

    const virtualProcess: VirtualProcess = {
      pid: virtualPid,
      startedAt: new Date().toISOString(),
      stdout,
      stderr,
      stdin,
      output: '',
      completed: false,
      request,
    };

    this.virtualProcesses.set(virtualPid, virtualProcess);

    return {
      pid: virtualPid,
      platform: this.platform,
      startedAt: virtualProcess.startedAt,
      stdin: stdin as unknown as NodeJS.WritableStream,
      stdout: stdout as unknown as NodeJS.ReadableStream,
      stderr: stderr as unknown as NodeJS.ReadableStream,
    };
  }

  /**
   * Prepares the working directory for execution.
   * SDK handles this internally.
   */
  async prepareWorkingDirectory(_path: string): Promise<void> {
    // SDK handles working directory internally
  }

  /**
   * Cleans up after execution.
   */
  async cleanupAfterExecution(pid: number): Promise<void> {
    const virtualProcess = this.virtualProcesses.get(pid);
    if (virtualProcess) {
      virtualProcess.stdout.end();
      virtualProcess.stderr.end();
      virtualProcess.stdin.end();
      this.virtualProcesses.delete(pid);
    }

    // Destroy session if not using persistence
    if (!this.config.sessionPersistence && this.session) {
      await this.session.destroy();
      this.session = null;
    }
  }

  /**
   * Terminates a process (no-op for SDK as there's no real process).
   */
  async terminateProcess(pid: number): Promise<void> {
    const virtualProcess = this.virtualProcesses.get(pid);
    if (virtualProcess) {
      virtualProcess.completed = true;
    }
  }

  /**
   * Force kills a process (no-op for SDK).
   */
  async forceKillProcess(pid: number): Promise<void> {
    await this.terminateProcess(pid);
  }

  /**
   * Captures stdout as an AsyncIterable.
   */
  async *captureStdout(pid: number): AsyncIterable<string> {
    const virtualProcess = this.virtualProcesses.get(pid);
    if (!virtualProcess) {
      return;
    }

    for await (const chunk of virtualProcess.stdout) {
      yield chunk.toString();
    }
  }

  /**
   * Captures stderr as an AsyncIterable.
   */
  async *captureStderr(pid: number): AsyncIterable<string> {
    const virtualProcess = this.virtualProcesses.get(pid);
    if (!virtualProcess) {
      return;
    }

    for await (const chunk of virtualProcess.stderr) {
      yield chunk.toString();
    }
  }

  /**
   * Gets the full transcript of a process.
   */
  async getTranscript(pid: number): Promise<string> {
    const virtualProcess = this.virtualProcesses.get(pid);
    return virtualProcess?.output ?? '';
  }

  /**
   * Executes a request using the SDK.
   *
   * This is the main execution method that uses SDK's structured API
   * instead of CLI process spawning.
   */
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      // Check rate limit and quota before execution
      if (this.rateLimiter) {
        await this.rateLimiter.waitForSlot(this.platform);
      }
      if (this.quotaManager) {
        await this.quotaManager.checkQuota(this.platform);
      }

      await this.initialize();
      if (!this.client) {
        throw new Error('SDK client not initialized');
      }

      // Create or reuse session
      if (!this.session || !this.config.sessionPersistence) {
        const sessionConfig: SessionConfig = {
          model: request.model ?? this.config.defaultModel,
          tools: this.config.customTools,
        };
        this.session = await this.client.createSession(sessionConfig);
      }

      // Spawn virtual process for tracking
      const runningProcess = await this.spawnFreshProcess(request);
      const virtualProcess = this.virtualProcesses.get(runningProcess.pid)!;

      // Execute via SDK
      const response = await this.session.send({
        prompt: request.prompt,
      });

      // Store output
      virtualProcess.output = response.content;
      virtualProcess.completed = true;

      // Write to virtual stdout for compatibility
      virtualProcess.stdout.write(response.content);
      virtualProcess.stdout.end();

      // Parse result
      const duration = Date.now() - startTime;
      const result = this.parseResponse(response, runningProcess.pid, duration);

      // Emit complete event
      this.emit('complete', {
        pid: runningProcess.pid,
        result,
      });

      // Cleanup
      await this.cleanupAfterExecution(runningProcess.pid);

      // Record usage
      if (this.rateLimiter) {
        this.rateLimiter.recordCall(this.platform);
      }
      if (this.quotaManager) {
        const tokens = response.tokensUsed ?? Math.max(100, Math.floor(duration / 10));
        await this.quotaManager.recordUsage(this.platform, tokens, duration);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Record usage even on error
      if (this.rateLimiter) {
        this.rateLimiter.recordCall(this.platform);
      }
      if (this.quotaManager) {
        await this.quotaManager
          .recordUsage(this.platform, 100, duration)
          .catch(() => undefined);
      }

      throw error;
    }
  }

  /**
   * Parses SDK response into ExecutionResult.
   */
  private parseResponse(
    response: CopilotResponse,
    processId: number,
    duration: number
  ): ExecutionResult {
    // Check for completion signals in tool calls
    let success = response.status === 'completed';
    let error: string | undefined;

    if (response.toolCalls) {
      for (const toolCall of response.toolCalls) {
        if (toolCall.name === 'mark_complete') {
          success = true;
        } else if (toolCall.name === 'mark_stuck') {
          success = false;
          error = 'Agent signaled stuck via mark_stuck tool';
        }
      }
    }

    // Fallback: check for legacy text signals
    if (response.content.includes('<ralph>GUTTER</ralph>')) {
      success = false;
      error = 'Agent signaled GUTTER - stuck and cannot proceed';
    }

    return {
      success,
      output: response.content,
      exitCode: success ? 0 : 1,
      duration,
      tokensUsed: response.tokensUsed,
      processId,
      error,
    };
  }

  /**
   * Gets platform capabilities.
   * Uses SDK methods for richer information.
   */
  async getCapabilities(): Promise<DiscoveryPlatformCapabilities> {
    // Try to get from cache first
    const cached = await this.capabilityService.getCached(this.platform);
    if (cached) {
      return cached.capabilities;
    }

    // Return default capabilities for SDK-based execution
    return {
      streaming: true,
      codeExecution: true,
      imageGeneration: false,
      fileAccess: true,
      webSearch: true,
      computerUse: false,
      maxContextTokens: 200000,
      maxOutputTokens: 8192,
      supportedLanguages: ['typescript', 'javascript', 'python', 'java', 'go', 'rust', 'c', 'cpp'],
    };
  }

  /**
   * Checks quota information.
   */
  async checkQuota(): Promise<QuotaInfo> {
    const cached = await this.capabilityService.getCached(this.platform);
    if (cached) {
      return cached.quotaInfo;
    }
    return {
      remaining: -1,
      limit: -1,
      resetsAt: new Date().toISOString(),
      period: 'run',
    };
  }

  /**
   * Checks cooldown information.
   */
  async checkCooldown(): Promise<CooldownInfo> {
    const cached = await this.capabilityService.getCached(this.platform);
    if (cached) {
      return cached.cooldownInfo;
    }
    return {
      active: false,
      endsAt: null,
      reason: null,
    };
  }
}

/**
 * Virtual process representation for SDK execution.
 * The SDK doesn't use real processes, so we simulate for interface compatibility.
 */
interface VirtualProcess {
  pid: number;
  startedAt: string;
  stdout: PassThrough;
  stderr: PassThrough;
  stdin: PassThrough;
  output: string;
  completed: boolean;
  request: ExecutionRequest;
}

/**
 * Factory function to create a CopilotSdkRunner.
 */
export function createCopilotSdkRunner(
  capabilityService: CapabilityDiscoveryService,
  config?: CopilotSdkRunnerConfig
): CopilotSdkRunner {
  return new CopilotSdkRunner(capabilityService, config);
}
