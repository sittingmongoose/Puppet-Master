/**
 * Worker/Reviewer Orchestrator
 *
 * Implements the Ralph Wiggum Model's recommended two-phase iteration pattern:
 * - Worker agent: Does the coding implementation
 * - Reviewer agent: Verifies work with fresh context, decides SHIP vs REVISE
 *
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T13 and ClaudesMajorImprovements.md Issue #5.
 */

import type { Platform, ReviewerConfig, PuppetMasterConfig } from '../types/config.js';
import type { TierPlan, Criterion, TestPlan } from '../types/tiers.js';
import type { PlatformRunnerContract, ExecutionRequest, RunningProcess } from '../types/platforms.js';
import type { IterationContext, IterationResult } from './execution-engine.js';
import type { TierNode } from './tier-node.js';
import type { ProgressManager, ProgressEntry } from '../memory/index.js';
import { PlatformRegistry } from '../platforms/registry.js';
import { PromptBuilder } from './prompt-builder.js';

/**
 * Result from worker phase execution.
 */
export interface WorkerResult {
  /** Whether worker claims the subtask is complete */
  claimsDone: boolean;
  /** Raw output from worker execution */
  output: string;
  /** Files changed by the worker */
  filesChanged: string[];
  /** Whether tests passed (if run) */
  testsPassed?: boolean;
  /** Process ID of worker */
  processId: number;
  /** Execution duration in ms */
  duration: number;
  /** Completion signal from worker */
  completionSignal?: 'COMPLETE' | 'GUTTER';
  /** Error message if failed */
  error?: string;
}

/**
 * Result from reviewer phase execution.
 */
export interface ReviewerResult {
  /** Verdict: SHIP (accept) or REVISE (reject and provide feedback) */
  verdict: 'SHIP' | 'REVISE';
  /** Confidence level (0.0 - 1.0) */
  confidence: number;
  /** Feedback for worker if REVISE */
  feedback?: string;
  /** Specific criteria that failed */
  failedCriteria?: string[];
  /** Raw output from reviewer */
  output: string;
  /** Process ID of reviewer */
  processId: number;
  /** Execution duration in ms */
  duration: number;
}

/**
 * Final outcome of worker/reviewer iteration.
 */
export interface IterationOutcome {
  /** Overall status */
  status: 'complete' | 'revise' | 'continue' | 'failed';
  /** Worker result */
  workerResult: WorkerResult;
  /** Reviewer result (only if worker claimed done) */
  reviewerResult?: ReviewerResult;
  /** Combined feedback for next iteration */
  combinedFeedback?: string;
}

/**
 * Context for reviewer prompt building.
 */
export interface ReviewerContext {
  /** Subtask being reviewed */
  subtask: TierNode;
  /** Task containing the subtask */
  task: TierNode;
  /** Phase containing the task */
  phase: TierNode;
  /** Project name */
  projectName: string;
  /** Session ID */
  sessionId: string;
  /** Platform for reviewer */
  platform: Platform;
  /** Files changed by worker */
  filesChanged: string[];
  /** Test results (if available) */
  testResults?: string;
  /** Acceptance criteria to verify */
  acceptanceCriteria: Criterion[];
  /** Test plan for verification */
  testPlan: TestPlan;
  /** Worker's completion claim */
  workerClaimsDone: boolean;
}

/**
 * Configuration for WorkerReviewerOrchestrator.
 */
export interface WorkerReviewerConfig {
  /** Reviewer configuration (platform, model, etc.) */
  reviewerConfig: ReviewerConfig;
  /** Full config for context */
  config: PuppetMasterConfig;
  /** Platform registry for getting runners */
  platformRegistry: PlatformRegistry;
  /** Progress manager for recording feedback */
  progressManager: ProgressManager;
  /** Prompt builder */
  promptBuilder: PromptBuilder;
}

/**
 * WorkerReviewerOrchestrator
 *
 * Coordinates two-phase iteration execution following the Ralph Wiggum Model pattern.
 */
export class WorkerReviewerOrchestrator {
  private readonly reviewerConfig: ReviewerConfig;
  private readonly config: PuppetMasterConfig;
  private readonly platformRegistry: PlatformRegistry;
  private readonly progressManager: ProgressManager;
  private readonly promptBuilder: PromptBuilder;

  constructor(workerReviewerConfig: WorkerReviewerConfig) {
    this.reviewerConfig = workerReviewerConfig.reviewerConfig;
    this.config = workerReviewerConfig.config;
    this.platformRegistry = workerReviewerConfig.platformRegistry;
    this.progressManager = workerReviewerConfig.progressManager;
    this.promptBuilder = workerReviewerConfig.promptBuilder;
  }

  /**
   * Check if worker/reviewer separation is enabled.
   */
  isEnabled(): boolean {
    return this.reviewerConfig.enabled !== false;
  }

  /**
   * Run a full worker/reviewer iteration cycle.
   *
   * @param workerResult - Result from worker execution (already completed)
   * @param context - Original iteration context
   * @returns Final iteration outcome
   */
  async runReviewerPhase(
    workerResult: WorkerResult,
    context: IterationContext
  ): Promise<IterationOutcome> {
    // If worker didn't claim done, no need for reviewer
    if (!workerResult.claimsDone) {
      return {
        status: 'continue',
        workerResult,
      };
    }

    // If worker failed, no need for reviewer
    if (workerResult.error || workerResult.completionSignal === 'GUTTER') {
      return {
        status: 'failed',
        workerResult,
      };
    }

    // Run reviewer phase
    const reviewerResult = await this.runReviewer(context, workerResult);

    // Evaluate verdict
    if (reviewerResult.verdict === 'SHIP') {
      const threshold = this.reviewerConfig.confidenceThreshold ?? 0.7;
      if (reviewerResult.confidence >= threshold) {
        return {
          status: 'complete',
          workerResult,
          reviewerResult,
        };
      }
      // Low confidence SHIP - treat as soft REVISE
      console.warn(
        `[WorkerReviewerOrchestrator] SHIP verdict with low confidence (${reviewerResult.confidence} < ${threshold}), treating as REVISE`
      );
    }

    // REVISE verdict - write feedback for next iteration
    const feedback = await this.writeFeedback(context, reviewerResult);

    return {
      status: 'revise',
      workerResult,
      reviewerResult,
      combinedFeedback: feedback,
    };
  }

  /**
   * Run the reviewer agent with fresh context.
   */
  private async runReviewer(
    context: IterationContext,
    workerResult: WorkerResult
  ): Promise<ReviewerResult> {
    const runner = this.platformRegistry.get(this.reviewerConfig.platform);
    if (!runner) {
      throw new Error(`Reviewer platform not available: ${this.reviewerConfig.platform}`);
    }

    const subtask = context.tierNode;
    const task = subtask.parent;
    const phase = task?.parent;

    if (!task || !phase) {
      throw new Error(`Subtask ${subtask.id} missing parent task or phase`);
    }

    // Build reviewer context (minimal, focused)
    const reviewerContext: ReviewerContext = {
      subtask,
      task,
      phase,
      projectName: context.projectName,
      sessionId: this.progressManager.generateSessionId(), // Fresh session for reviewer
      platform: this.reviewerConfig.platform,
      filesChanged: workerResult.filesChanged,
      testResults: this.extractTestResults(workerResult.output),
      acceptanceCriteria: subtask.data.acceptanceCriteria,
      testPlan: subtask.data.testPlan,
      workerClaimsDone: workerResult.claimsDone,
    };

    // Build focused reviewer prompt
    const prompt = this.buildReviewerPrompt(reviewerContext);

    const request: ExecutionRequest = {
      prompt,
      model: this.reviewerConfig.model,
      workingDirectory: context.projectPath,
      nonInteractive: true,
      timeout: 120_000, // 2 minutes for reviewer (shorter than worker)
    };

    const startTime = Date.now();
    await runner.prepareWorkingDirectory(context.projectPath);

    const runningProcess = await runner.spawnFreshProcess(request);
    const processId = runningProcess.pid;

    // Capture output
    const outputChunks: string[] = [];
    let completedNormally = false;

    try {
      for await (const chunk of runner.captureStdout(processId)) {
        outputChunks.push(chunk);
        // Check for completion signal
        if (chunk.includes('<ralph>COMPLETE</ralph>') || chunk.includes('VERDICT:')) {
          completedNormally = true;
          break;
        }
      }
    } catch {
      // Ignore capture errors
    }

    // Also capture stderr
    try {
      for await (const chunk of runner.captureStderr(processId)) {
        outputChunks.push(chunk);
      }
    } catch {
      // Ignore capture errors
    }

    const duration = Date.now() - startTime;
    const output = outputChunks.join('');

    // Parse reviewer output
    return this.parseReviewerOutput(output, processId, duration);
  }

  /**
   * Build a focused prompt for the reviewer.
   * Reviewer sees: subtask description, criteria, files changed, test results
   * Reviewer does NOT see: worker's debug output, worker's reasoning
   */
  private buildReviewerPrompt(context: ReviewerContext): string {
    const lines: string[] = [];

    lines.push('# Code Review Request');
    lines.push('');
    lines.push('You are a code reviewer. Your task is to verify that implementation work meets acceptance criteria.');
    lines.push('');
    lines.push('## Subtask Under Review');
    lines.push('');
    lines.push(`- **ID:** ${context.subtask.id}`);
    lines.push(`- **Title:** ${context.subtask.data.title}`);
    lines.push(`- **Description:** ${context.subtask.data.description}`);
    lines.push('');
    lines.push('## Acceptance Criteria to Verify');
    lines.push('');
    if (context.acceptanceCriteria.length === 0) {
      lines.push('- (No explicit criteria specified)');
    } else {
      for (const criterion of context.acceptanceCriteria) {
        lines.push(`- [ ] **${criterion.id}:** ${criterion.description}`);
      }
    }
    lines.push('');
    lines.push('## Files Changed by Worker');
    lines.push('');
    if (context.filesChanged.length === 0) {
      lines.push('- (No files changed)');
    } else {
      for (const file of context.filesChanged) {
        lines.push(`- \`${file}\``);
      }
    }
    lines.push('');
    lines.push('## Test Plan');
    lines.push('');
    if (context.testPlan.commands.length === 0) {
      lines.push('- (No test commands specified)');
    } else {
      for (const cmd of context.testPlan.commands) {
        const args = cmd.args?.join(' ') ?? '';
        lines.push(`- \`${cmd.command} ${args}\`.trim()`);
      }
    }
    lines.push('');
    if (context.testResults) {
      lines.push('## Test Results (from worker)');
      lines.push('');
      lines.push('```');
      lines.push(context.testResults);
      lines.push('```');
      lines.push('');
    }
    lines.push('## Your Task');
    lines.push('');
    lines.push('1. Review the changed files for correctness');
    lines.push('2. Run the test commands to verify they pass');
    lines.push('3. Check each acceptance criterion');
    lines.push('4. Decide: **SHIP** (accept) or **REVISE** (reject with feedback)');
    lines.push('');
    lines.push('## Response Format');
    lines.push('');
    lines.push('Provide your verdict in this exact JSON format:');
    lines.push('');
    lines.push('```json');
    lines.push('{');
    lines.push('  "verdict": "SHIP" | "REVISE",');
    lines.push('  "confidence": 0.0-1.0,');
    lines.push('  "reason": "Brief explanation",');
    lines.push('  "failedCriteria": ["criterion-id-1", "criterion-id-2"],');
    lines.push('  "feedback": "Specific feedback for worker if REVISE"');
    lines.push('}');
    lines.push('```');
    lines.push('');
    lines.push('Then signal completion: `<ralph>COMPLETE</ralph>`');

    return lines.join('\n');
  }

  /**
   * Parse reviewer output to extract verdict.
   */
  private parseReviewerOutput(output: string, processId: number, duration: number): ReviewerResult {
    // Try to find JSON block in output
    const jsonMatch = output.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        return {
          verdict: parsed.verdict === 'SHIP' ? 'SHIP' : 'REVISE',
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
          feedback: parsed.feedback,
          failedCriteria: Array.isArray(parsed.failedCriteria) ? parsed.failedCriteria : undefined,
          output,
          processId,
          duration,
        };
      } catch {
        // JSON parse failed, fall through to heuristics
      }
    }

    // Fallback: heuristic parsing
    const hasShip = /\bSHIP\b/i.test(output);
    const hasRevise = /\bREVISE\b/i.test(output);

    // Extract feedback from common patterns
    let feedback: string | undefined;
    const feedbackMatch = output.match(/feedback[:\s]+"([^"]+)"/i) ||
                          output.match(/feedback[:\s]+([^\n]+)/i);
    if (feedbackMatch) {
      feedback = feedbackMatch[1].trim();
    }

    // Determine verdict
    let verdict: 'SHIP' | 'REVISE' = 'REVISE'; // Default to REVISE for safety
    if (hasShip && !hasRevise) {
      verdict = 'SHIP';
    } else if (hasRevise) {
      verdict = 'REVISE';
    }

    return {
      verdict,
      confidence: 0.5, // Low confidence for heuristic parse
      feedback,
      output,
      processId,
      duration,
    };
  }

  /**
   * Extract test results from worker output.
   */
  private extractTestResults(output: string): string | undefined {
    // Look for common test output patterns
    const patterns = [
      /PASS|FAIL.*\n[\s\S]*?(?=\n\n|\n$)/gi,
      /Tests?:\s*\d+.*\n[\s\S]*?(?=\n\n|\n$)/gi,
      /✓|✗.*\n[\s\S]*?(?=\n\n|\n$)/gi,
      /npm test[\s\S]*?(?=\n\n\n|\n$)/gi,
    ];

    for (const pattern of patterns) {
      const match = output.match(pattern);
      if (match) {
        return match.join('\n').substring(0, 2000); // Limit size
      }
    }

    return undefined;
  }

  /**
   * Write feedback from reviewer for the next worker iteration.
   */
  private async writeFeedback(
    context: IterationContext,
    reviewerResult: ReviewerResult
  ): Promise<string> {
    const feedbackParts: string[] = [];

    feedbackParts.push(`[Reviewer Feedback - Iteration ${context.iterationNumber}]`);
    feedbackParts.push(`Verdict: ${reviewerResult.verdict}`);
    feedbackParts.push(`Confidence: ${reviewerResult.confidence}`);

    if (reviewerResult.feedback) {
      feedbackParts.push(`Feedback: ${reviewerResult.feedback}`);
    }

    if (reviewerResult.failedCriteria && reviewerResult.failedCriteria.length > 0) {
      feedbackParts.push(`Failed Criteria: ${reviewerResult.failedCriteria.join(', ')}`);
    }

    const combinedFeedback = feedbackParts.join('\n');

    // Record in progress
    // Use PARTIAL status for reviewer feedback (worker did work, but revision needed)
    const entry: ProgressEntry = {
      timestamp: new Date().toISOString(),
      sessionId: context.sessionId,
      itemId: context.tierNode.id,
      platform: this.reviewerConfig.platform,
      status: 'PARTIAL',
      duration: `${reviewerResult.duration}ms`,
      accomplishments: [`Reviewer verdict: ${reviewerResult.verdict}`],
      filesChanged: [],
      testsRun: [],
      learnings: reviewerResult.feedback ? [reviewerResult.feedback] : [],
      nextSteps: reviewerResult.failedCriteria ?? [],
    };

    await this.progressManager.append(entry);

    return combinedFeedback;
  }

  /**
   * Convert standard IterationResult to WorkerResult.
   */
  static toWorkerResult(result: IterationResult): WorkerResult {
    return {
      claimsDone: result.success && result.completionSignal === 'COMPLETE',
      output: result.output,
      filesChanged: result.filesChanged,
      testsPassed: result.success,
      processId: result.processId,
      duration: result.duration,
      completionSignal: result.completionSignal,
      error: result.error,
    };
  }
}

/**
 * Check if worker/reviewer separation should be used.
 */
export function shouldUseWorkerReviewer(config: PuppetMasterConfig): boolean {
  const reviewerConfig = config.tiers.reviewer;
  if (!reviewerConfig) {
    return false;
  }
  return reviewerConfig.enabled !== false;
}

/**
 * Create a WorkerReviewerOrchestrator if configuration is present.
 */
export function createWorkerReviewerOrchestrator(
  config: PuppetMasterConfig,
  platformRegistry: PlatformRegistry,
  progressManager: ProgressManager,
  promptBuilder?: PromptBuilder
): WorkerReviewerOrchestrator | null {
  if (!shouldUseWorkerReviewer(config)) {
    return null;
  }

  const reviewerConfig = config.tiers.reviewer!;

  return new WorkerReviewerOrchestrator({
    reviewerConfig,
    config,
    platformRegistry,
    progressManager,
    promptBuilder: promptBuilder ?? new PromptBuilder(),
  });
}
