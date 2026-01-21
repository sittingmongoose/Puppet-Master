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

export interface IterationContext {
  tierNode: TierNode;
  iterationNumber: number;
  maxIterations: number;
  projectPath: string;
  projectName: string;
  sessionId: string;
  platform: Platform;
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

  onOutput(callback: (output: string) => void): void {
    this.outputCallbacks.push(callback);
  }

  onComplete(callback: (result: IterationResult) => void): void {
    this.completeCallbacks.push(callback);
  }

  getRunningProcesses(): ProcessInfo[] {
    return Array.from(this.processInfoByPid.values());
  }

  async spawnIteration(context: IterationContext): Promise<IterationResult> {
    const runner = this.runner;
    if (!runner) {
      throw new Error('ExecutionEngine runner not set');
    }

    const prompt = this.buildIterationPrompt(context);
    const request: ExecutionRequest = {
      prompt,
      workingDirectory: context.projectPath,
      nonInteractive: true,
      timeout: this.config.defaultTimeout,
    };

    const startTime = Date.now();
    await runner.prepareWorkingDirectory(context.projectPath);

    const runningProcess = await runner.spawnFreshProcess(request);
    const processId = runningProcess.pid;

    this.processInfoByPid.set(processId, {
      pid: processId,
      platform: runner.platform,
      startedAt: new Date().toISOString(),
      status: 'running',
    });

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
      consume(runner.captureStdout(processId)),
      consume(runner.captureStderr(processId)),
    ]).then(() => undefined);

    await Promise.race([outputTask, stopPromise]);

    if (hardTimeoutTimer) {
      clearTimeout(hardTimeoutTimer);
    }
    if (noOutputTimer) {
      clearTimeout(noOutputTimer);
    }

    if (timedOut) {
      await this.handleTimeout(processId);
    } else if (stalled) {
      await this.killIteration(processId);
    }

    let transcript: string | null = null;
    try {
      transcript = await runner.getTranscript(processId);
    } catch {
      transcript = null;
    }

    try {
      await runner.cleanupAfterExecution(processId);
    } catch {
      // ignore
    }

    const duration = Date.now() - startTime;
    const output = transcript ?? outputChunks.join('');

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
      filesChanged: [],
      ...(errorMessage ? { error: errorMessage } : {}),
    };

    const processInfo = this.processInfoByPid.get(processId);
    if (processInfo) {
      this.processInfoByPid.set(processId, {
        ...processInfo,
        status: timedOut || stalled ? 'killed' : 'completed',
      });
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
    await this.killIteration(processId);
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

