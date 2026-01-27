/**
 * ExecutionEngine
 *
 * Base execution engine that coordinates iteration spawning and tracking.
 * Platform runners are implemented in Phase 3; this engine uses the runner contract.
 *
 * See ARCHITECTURE.md Section 4.5 (Fresh Agent Enforcement)
 * and REQUIREMENTS.md Section 26 (Fresh Agent Enforcement + Runner Contract).
 */

import type { ExecutionRequest, PlatformRunnerContract, ProcessInfo, TierPlan } from '../types/index.js';
import type { Platform } from '../types/config.js';
import type { ProgressEntry } from '../memory/progress-manager.js';
import type { AgentsContent } from '../memory/agents-manager.js';
import type { TierNode } from './tier-node.js';
import type { FailureInfo, PromptContext } from './prompt-builder.js';
import { PromptBuilder } from './prompt-builder.js';
import { GitManager } from '../git/git-manager.js';
import type { ProcessRegistry } from './process-registry.js';

export interface IterationContext {
  tierNode: TierNode;
  iterationNumber: number;
  maxIterations: number;
  projectPath: string;
  projectName: string;
  sessionId: string;
  platform: Platform;
  model?: string;
  planMode?: boolean;
  reasoningEffort?: 'Low' | 'Medium' | 'High' | 'Extra high';
  outputFormat?: 'text' | 'json' | 'stream-json';
  permissionMode?: 'default' | 'acceptEdits' | 'plan' | 'dontAsk' | 'bypassPermissions';
  allowedTools?: string;
  progressEntries: ProgressEntry[];
  agentsContent: AgentsContent[];
  subtaskPlan: TierPlan;
}

export interface IterationResult {
  success: boolean;
  output: string;
  processId: number;
  duration: number;
  exitCode: number;
  completionSignal?: 'COMPLETE' | 'GUTTER';
  learnings: string[];
  filesChanged: string[];
  error?: string;
}

export interface ExecutionConfig {
  defaultTimeout: number;
  hardTimeout: number;
  stallDetection: StallDetectionConfig;
  killAgentOnFailure?: boolean; // Default: true (kill on failure)
}

export interface StallDetectionConfig {
  noOutputTimeout: number;
  identicalOutputThreshold: number;
  enabled: boolean;
}

type CompletionSignal = 'COMPLETE' | 'GUTTER';

interface ProcessAuditRecord {
  context: IterationContext;
  processId: number;
  result: IterationResult;
  timestamp: string;
}

export class ExecutionEngine {
  private readonly config: ExecutionConfig;
  private readonly promptBuilder: PromptBuilder;
  private runner: PlatformRunnerContract | null = null;
  private gitManager: GitManager | null = null;
  private processRegistry: ProcessRegistry | null = null;

  private readonly processInfoByPid = new Map<number, ProcessInfo>();
  private readonly processAudits: ProcessAuditRecord[] = [];

  private readonly outputCallbacks: Array<(output: string) => void> = [];
  private readonly completeCallbacks: Array<(result: IterationResult) => void> = [];

  constructor(config: ExecutionConfig, promptBuilder: PromptBuilder = new PromptBuilder()) {
    this.config = config;
    this.promptBuilder = promptBuilder;
  }

  setRunner(runner: PlatformRunnerContract): void {
    this.runner = runner;
  }

  setGitManager(gitManager: GitManager): void {
    this.gitManager = gitManager;
  }

  setProcessRegistry(processRegistry: ProcessRegistry): void {
    this.processRegistry = processRegistry;
  }

  onOutput(callback: (output: string) => void): void {
    this.outputCallbacks.push(callback);
  }

  onComplete(callback: (result: IterationResult) => void): void {
    this.completeCallbacks.push(callback);
  }

  getRunningProcesses(): ProcessInfo[] {
    return Array.from(this.processInfoByPid.values());
  }

  async spawnIteration(context: IterationContext, runner?: PlatformRunnerContract): Promise<IterationResult> {
    // Use provided runner or fall back to stored runner (for backwards compatibility)
    const activeRunner = runner || this.runner;
    if (!activeRunner) {
      throw new Error('ExecutionEngine runner not set and no runner provided');
    }

    // Capture baseline git status for iteration bookkeeping (best-effort).
    // Do not allow git failures to affect iteration execution.
    if (this.gitManager) {
      try {
        await this.gitManager.getStatus();
      } catch {
        // ignore
      }
    }

    const prompt = this.buildIterationPrompt(context);
    const request: ExecutionRequest = {
      prompt,
      model: context.model,
      planMode: context.planMode,
      reasoningEffort: context.reasoningEffort,
      outputFormat: context.outputFormat,
      permissionMode: context.permissionMode,
      allowedTools: context.allowedTools,
      workingDirectory: context.projectPath,
      nonInteractive: true,
      timeout: this.config.defaultTimeout,
    };

    const startTime = Date.now();
    await activeRunner.prepareWorkingDirectory(context.projectPath);

    const runningProcess = await activeRunner.spawnFreshProcess(request);
    const processId = runningProcess.pid;

    this.processInfoByPid.set(processId, {
      pid: processId,
      platform: activeRunner.platform,
      startedAt: new Date().toISOString(),
      status: 'running',
    });

    // Register with ProcessRegistry
    if (this.processRegistry) {
      try {
        await this.processRegistry.registerProcess(
          processId,
          activeRunner.platform,
          prompt.substring(0, 100) // Store first 100 chars of prompt as command reference
        );
      } catch (error) {
        // Log but don't fail iteration if registry fails
        console.error('[ExecutionEngine] Failed to register process with ProcessRegistry:', error);
      }
    }

    const outputChunks: string[] = [];
    const outputHistory: string[] = [];
    const historyLimit = Math.max(10, this.config.stallDetection.identicalOutputThreshold);

    let completionSignal: CompletionSignal | undefined;
    let stopRequested = false;
    let timedOut = false;
    let stalled = false;
    let errorMessage: string | undefined;

    let resolveStop: (() => void) | null = null;
    const stopPromise = new Promise<void>((resolve) => {
      resolveStop = resolve;
    });

    let hardTimeoutTimer: NodeJS.Timeout | null = null;
    hardTimeoutTimer = setTimeout(() => {
      timedOut = true;
      stopRequested = true;
      errorMessage = `Hard timeout exceeded (${this.config.hardTimeout}ms)`;
      resolveStop?.();
    }, this.config.hardTimeout);

    let noOutputTimer: NodeJS.Timeout | null = null;
    const scheduleNoOutputTimer = (): void => {
      if (!this.config.stallDetection.enabled) {
        return;
      }
      if (this.config.stallDetection.noOutputTimeout <= 0) {
        return;
      }
      if (noOutputTimer) {
        clearTimeout(noOutputTimer);
      }
      noOutputTimer = setTimeout(() => {
        stalled = true;
        stopRequested = true;
        errorMessage = `No output for ${this.config.stallDetection.noOutputTimeout}ms`;
        resolveStop?.();
      }, this.config.stallDetection.noOutputTimeout);
    };

    const pushOutput = (chunk: string): void => {
      if (stopRequested) {
        return;
      }

      outputChunks.push(chunk);
      outputHistory.push(chunk);
      while (outputHistory.length > historyLimit) {
        outputHistory.shift();
      }

      for (const callback of this.outputCallbacks) {
        callback(chunk);
      }

      scheduleNoOutputTimer();

      if (completionSignal === undefined) {
        const signal = ExecutionEngine.extractCompletionSignal(chunk);
        if (signal) {
          completionSignal = signal;
          stopRequested = true;
          resolveStop?.();
          return;
        }
      }

      if (this.detectStall(outputHistory)) {
        stalled = true;
        stopRequested = true;
        errorMessage = 'Stall detected (repeated identical output)';
        resolveStop?.();
      }
    };

    scheduleNoOutputTimer();

    const consume = async (iterable: AsyncIterable<string>): Promise<void> => {
      const iterator = iterable[Symbol.asyncIterator]();
      try {
        while (!stopRequested) {
          const { value, done } = await iterator.next();
          if (done) {
            break;
          }
          pushOutput(value);
        }
      } catch (error) {
        if (!stopRequested) {
          errorMessage = error instanceof Error ? error.message : String(error);
          stopRequested = true;
          resolveStop?.();
        }
      } finally {
        try {
          await iterator.return?.();
        } catch {
          // ignore
        }
      }
    };

    const outputTask = Promise.allSettled([
      consume(activeRunner.captureStdout(processId)),
      consume(activeRunner.captureStderr(processId)),
    ]).then(() => undefined);

    await Promise.race([outputTask, stopPromise]);

    if (hardTimeoutTimer) {
      clearTimeout(hardTimeoutTimer);
    }
    if (noOutputTimer) {
      clearTimeout(noOutputTimer);
    }

    // Handle timeouts and stalls - respect killAgentOnFailure setting
    if (timedOut) {
      await this.handleTimeout(processId);
    } else if (stalled) {
      const shouldKill = this.config.killAgentOnFailure !== false;
      if (shouldKill) {
        await this.killIteration(processId);
      } else {
        console.warn(`[ExecutionEngine] Agent kept alive for debugging (stall detected). PID: ${processId}`);
        this.logManualKillInstructions(processId);
      }
    }

    let transcript: string | null = null;
    try {
      transcript = await activeRunner.getTranscript(processId);
    } catch {
      transcript = null;
    }

    try {
      await activeRunner.cleanupAfterExecution(processId);
    } catch {
      // ignore
    }

    const duration = Date.now() - startTime;
    const output = transcript ?? outputChunks.join('');

    let filesChanged: string[] = [];
    if (this.gitManager) {
      try {
        filesChanged = await this.gitManager.getDiffFiles();
      } catch {
        filesChanged = [];
      }
    }

    const success = !timedOut && !stalled && completionSignal === 'COMPLETE';
    const exitCode = success ? 0 : 1;

    const result: IterationResult = {
      success,
      output,
      processId,
      duration,
      exitCode,
      ...(completionSignal ? { completionSignal } : {}),
      learnings: [],
      filesChanged,
      ...(errorMessage ? { error: errorMessage } : {}),
    };

    // Handle failed iterations (not timeout/stall) - respect killAgentOnFailure setting
    if (!success && !timedOut && !stalled) {
      const shouldKill = this.config.killAgentOnFailure !== false;
      if (shouldKill) {
        await this.killIteration(processId);
      } else {
        console.warn(`[ExecutionEngine] Agent kept alive for debugging (iteration failed). PID: ${processId}`);
        this.logManualKillInstructions(processId);
        // Update process status to indicate kept alive
        const processInfo = this.processInfoByPid.get(processId);
        if (processInfo) {
          this.processInfoByPid.set(processId, {
            ...processInfo,
            status: 'completed', // Mark as completed but process is still alive
          });
        }
      }
    } else {
      const processInfo = this.processInfoByPid.get(processId);
      if (processInfo) {
        this.processInfoByPid.set(processId, {
          ...processInfo,
          status: timedOut || stalled ? 'killed' : 'completed',
        });
      }
    }

    this.recordProcessAudit(context, processId, result);

    for (const callback of this.completeCallbacks) {
      callback(result);
    }

    return result;
  }

  async killIteration(processId: number): Promise<void> {
    const runner = this.runner;
    if (!runner) {
      return;
    }

    try {
      await runner.terminateProcess(processId);
    } catch {
      // ignore
    }

    try {
      await runner.forceKillProcess(processId);
    } catch {
      // ignore
    }

    // Also terminate via ProcessRegistry for cross-platform consistency
    if (this.processRegistry) {
      try {
        await this.processRegistry.terminateProcess(processId, true);
      } catch {
        // ignore
      }
    }

    const processInfo = this.processInfoByPid.get(processId);
    if (processInfo) {
      this.processInfoByPid.set(processId, { ...processInfo, status: 'killed' });
    }
  }

  private buildIterationPrompt(context: IterationContext): string {
    const subtask = context.tierNode;
    const task = subtask.parent;
    const phase = task?.parent;

    if (!task || !phase) {
      throw new Error(`IterationContext tierNode ${subtask.id} missing parent task or phase`);
    }

    const promptContext: PromptContext = {
      subtask,
      task,
      phase,
      projectName: context.projectName,
      sessionId: context.sessionId,
      platform: context.platform,
      iterationNumber: context.iterationNumber,
      maxIterations: context.maxIterations,
      progressEntries: context.progressEntries,
      agentsContent: context.agentsContent,
      previousFailures: this.derivePreviousFailures(context),
    };

    return this.promptBuilder.buildIterationPrompt(promptContext);
  }

  private derivePreviousFailures(context: IterationContext): FailureInfo[] {
    const subtaskId = context.tierNode.id;

    const failures = this.processAudits
      .filter((audit) => audit.context.tierNode.id === subtaskId)
      .filter((audit) => !audit.result.success)
      .map((audit) => {
        const fallbackError =
          audit.result.error ??
          (audit.result.completionSignal === 'GUTTER' ? 'Agent signaled GUTTER' : 'Iteration failed');

        return {
          iterationNumber: audit.context.iterationNumber,
          error: fallbackError,
        } satisfies FailureInfo;
      })
      .sort((a, b) => a.iterationNumber - b.iterationNumber);

    return failures;
  }

  private detectStall(output: string[]): boolean {
    if (!this.config.stallDetection.enabled) {
      return false;
    }

    const threshold = this.config.stallDetection.identicalOutputThreshold;
    if (threshold <= 1) {
      return false;
    }

    if (output.length < threshold) {
      return false;
    }

    const recent = output.slice(-threshold).map((chunk) => chunk.trim());
    const first = recent[0];
    if (!first) {
      return false;
    }

    return recent.every((chunk) => chunk === first);
  }

  private async handleTimeout(processId: number): Promise<void> {
    const shouldKill = this.config.killAgentOnFailure !== false;
    if (shouldKill) {
      await this.killIteration(processId);
    } else {
      console.warn(`[ExecutionEngine] Agent kept alive for debugging (timeout). PID: ${processId}`);
      this.logManualKillInstructions(processId);
    }
  }

  private logManualKillInstructions(processId: number): void {
    const isWindows = process.platform === 'win32';
    const killCommand = isWindows
      ? `taskkill /PID ${processId} /F`
      : `kill ${processId}`;
    console.info(`[ExecutionEngine] To kill manually: ${killCommand}`);
  }

  private recordProcessAudit(
    context: IterationContext,
    processId: number,
    result: IterationResult
  ): void {
    this.processAudits.push({
      context,
      processId,
      result,
      timestamp: new Date().toISOString(),
    });
  }

  private static extractCompletionSignal(chunk: string): CompletionSignal | undefined {
    if (chunk.includes('<ralph>COMPLETE</ralph>')) {
      return 'COMPLETE';
    }
    if (chunk.includes('<ralph>GUTTER</ralph>')) {
      return 'GUTTER';
    }
    return undefined;
  }
}

