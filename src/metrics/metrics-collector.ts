/**
 * MetricsCollector (P2-T08)
 *
 * Collects operational metrics for the orchestrator and platform usage.
 *
 * Design goals:
 * - Low coupling: can be used by orchestrator (live) and by CLI/GUI (offline) via UsageTracker events.
 * - JSON-friendly reporting: internal Maps are converted to arrays for output.
 * - Best-effort cost estimation: uses a small heuristic pricing table (documented).
 */

import type { Platform } from '../types/config.js';
import type { TierState } from '../types/state.js';
import type { UsageEvent } from '../types/usage.js';
import type { IterationContext, IterationResult } from '../core/execution-engine.js';

export interface PlatformMetrics {
  calls: number;
  tokensUsed: number;
  estimatedCostUSD: number;
  averageLatencyMs: number;
  errorRate: number; // 0..1
}

export interface OrchestratorMetrics {
  // Iteration metrics
  totalIterations: number;
  successfulIterations: number;
  failedIterations: number;
  averageIterationDurationMs: number;

  // Platform metrics
  platformMetrics: Map<Platform, PlatformMetrics>;

  // Quality metrics
  firstPassSuccessRate: number; // 0..1
  averageRevisionsPerSubtask: number;
  escalationRate: number; // 0..1

  // Time metrics
  totalDurationMs: number;
}

export interface MetricsReport {
  generatedAt: string;
  summary: Omit<OrchestratorMetrics, 'platformMetrics'> & {
    platformMetrics: Array<{ platform: Platform } & PlatformMetrics>;
  };
  notes: string[];
}

/**
 * Minimal token usage shape for direct recording (optional).
 * Most code paths use `UsageEvent` ingestion instead.
 */
export interface TokenUsage {
  tokensUsed: number;
  durationMs: number;
  success: boolean;
  model?: string;
  action?: string;
}

interface PlatformAccumulator {
  calls: number;
  tokensUsed: number;
  costUsd: number;
  latencyTotalMs: number;
  failures: number;
}

interface IterationAccumulator {
  totalIterations: number;
  successfulIterations: number;
  failedIterations: number;
  durationTotalMs: number;
}

interface SubtaskOutcome {
  firstAttempted: boolean;
  firstAttemptSucceeded: boolean;
  completed: boolean;
  completionIterationNumber?: number;
  maxIterationNumberSeen: number;
}

export class MetricsCollector {
  private readonly startedAtMs: number;

  private readonly iterationAcc: IterationAccumulator = {
    totalIterations: 0,
    successfulIterations: 0,
    failedIterations: 0,
    durationTotalMs: 0,
  };

  private readonly platformAcc = new Map<Platform, PlatformAccumulator>();
  private readonly subtaskOutcomes = new Map<string, SubtaskOutcome>();
  private readonly escalatedSubtasks = new Set<string>();
  private readonly reviewerVerdictsBySubtask = new Map<string, { ship: number; revise: number }>();

  constructor(opts?: { startedAt?: Date }) {
    this.startedAtMs = (opts?.startedAt ?? new Date()).getTime();
  }

  /**
   * Record an orchestrator iteration result.
   *
   * Note: In this codebase, a "successful iteration" for workflow purposes is
   * generally `result.success && result.completionSignal === 'COMPLETE'`.
   * We keep the same definition here so quality metrics match advancement behavior.
   */
  recordIteration(context: IterationContext, result: IterationResult): void {
    this.iterationAcc.totalIterations += 1;
    this.iterationAcc.durationTotalMs += result.duration;

    const isComplete =
      result.success === true && result.completionSignal === 'COMPLETE';

    if (isComplete) {
      this.iterationAcc.successfulIterations += 1;
    } else {
      this.iterationAcc.failedIterations += 1;
    }

    const subtaskId = context.tierNode.id;
    const iterationNumber = context.iterationNumber;

    const existing: SubtaskOutcome = this.subtaskOutcomes.get(subtaskId) ?? {
      firstAttempted: false,
      firstAttemptSucceeded: false,
      completed: false,
      maxIterationNumberSeen: 0,
    };

    existing.maxIterationNumberSeen = Math.max(existing.maxIterationNumberSeen, iterationNumber);

    if (iterationNumber === 1) {
      existing.firstAttempted = true;
      existing.firstAttemptSucceeded = isComplete;
    }

    // Only set completion once (first time we see a COMPLETE).
    if (isComplete && !existing.completed) {
      existing.completed = true;
      existing.completionIterationNumber = iterationNumber;
    }

    this.subtaskOutcomes.set(subtaskId, existing);
  }

  /**
   * Record a platform call directly (optional).
   * Prefer `ingestUsageEvents()` when available.
   */
  recordPlatformCall(platform: Platform, usage: TokenUsage): void {
    const acc = this.platformAcc.get(platform) ?? MetricsCollector.createPlatformAccumulator();

    acc.calls += 1;
    acc.tokensUsed += Math.max(0, Math.floor(usage.tokensUsed));
    acc.latencyTotalMs += Math.max(0, Math.floor(usage.durationMs));
    if (!usage.success) {
      acc.failures += 1;
    }

    // Best-effort: cost based only on total tokens (no input/output split).
    acc.costUsd += MetricsCollector.estimateCostUsd(platform, usage.tokensUsed, usage.model);

    this.platformAcc.set(platform, acc);
  }

  /**
   * Ingest persisted usage events from UsageTracker (`.puppet-master/usage/usage.jsonl`).
   * This is how we get token counts (and therefore cost estimates) across the system.
   */
  ingestUsageEvents(events: UsageEvent[]): void {
    for (const event of events) {
      const acc = this.platformAcc.get(event.platform) ?? MetricsCollector.createPlatformAccumulator();

      acc.calls += 1;
      acc.tokensUsed += Math.max(0, Math.floor(event.tokens ?? 0));
      acc.latencyTotalMs += Math.max(0, Math.floor(event.durationMs));
      if (!event.success) {
        acc.failures += 1;
      }
      acc.costUsd += MetricsCollector.estimateCostUsd(event.platform, event.tokens ?? 0);

      this.platformAcc.set(event.platform, acc);
    }
  }

  /**
   * Record a tier transition. This is used primarily for escalation rate.
   *
   * We infer subtask-ness by seeing a tierId appear in `recordIteration()`. If a tier
   * transitions to `escalated` and we haven't seen an iteration yet, we still record it.
   */
  recordTierTransition(tierId: string, from: TierState, to: TierState): void {
    if (to === 'escalated' && from !== 'escalated') {
      this.escalatedSubtasks.add(tierId);
    }
  }

  /**
   * Record a reviewer verdict (P1-T13 worker/reviewer separation).
   *
   * We keep this as supplemental context. The primary quality metric
   * `averageRevisionsPerSubtask` is derived from completion iteration number.
   */
  recordReviewerVerdict(subtaskId: string, verdict: 'SHIP' | 'REVISE'): void {
    const current = this.reviewerVerdictsBySubtask.get(subtaskId) ?? { ship: 0, revise: 0 };
    if (verdict === 'SHIP') {
      current.ship += 1;
    } else {
      current.revise += 1;
    }
    this.reviewerVerdictsBySubtask.set(subtaskId, current);
  }

  /**
   * Produce the current aggregated metrics and report.
   * Optionally pass usage events for one-shot aggregation.
   */
  generateReport(opts?: { usageEvents?: UsageEvent[] }): MetricsReport {
    if (opts?.usageEvents) {
      this.ingestUsageEvents(opts.usageEvents);
    }

    const avgIterationDuration =
      this.iterationAcc.totalIterations === 0
        ? 0
        : Math.round(this.iterationAcc.durationTotalMs / this.iterationAcc.totalIterations);

    const attemptedSubtasks = Array.from(this.subtaskOutcomes.values()).filter((s) => s.firstAttempted).length;
    const firstPassSuccesses = Array.from(this.subtaskOutcomes.values()).filter((s) => s.firstAttemptSucceeded).length;
    const firstPassSuccessRate = attemptedSubtasks === 0 ? 0 : firstPassSuccesses / attemptedSubtasks;

    const completed = Array.from(this.subtaskOutcomes.values()).filter((s) => s.completed && s.completionIterationNumber !== undefined);
    const totalRevisions = completed.reduce((sum, s) => sum + Math.max(0, (s.completionIterationNumber ?? 1) - 1), 0);
    const averageRevisionsPerSubtask = completed.length === 0 ? 0 : totalRevisions / completed.length;

    // Escalation rate: among subtasks we have observed (via iterations) plus any escalations.
    const observedSubtaskIds = new Set<string>(this.subtaskOutcomes.keys());
    for (const tierId of this.escalatedSubtasks) {
      observedSubtaskIds.add(tierId);
    }
    const escalationRate =
      observedSubtaskIds.size === 0 ? 0 : this.escalatedSubtasks.size / observedSubtaskIds.size;

    const platformMetricsArray: Array<{ platform: Platform } & PlatformMetrics> = [];
    const metricsMap = new Map<Platform, PlatformMetrics>();

    for (const [platform, acc] of this.platformAcc.entries()) {
      const avgLatency = acc.calls === 0 ? 0 : Math.round(acc.latencyTotalMs / acc.calls);
      const errorRate = acc.calls === 0 ? 0 : acc.failures / acc.calls;

      const pm: PlatformMetrics = {
        calls: acc.calls,
        tokensUsed: acc.tokensUsed,
        estimatedCostUSD: MetricsCollector.roundUsd(acc.costUsd),
        averageLatencyMs: avgLatency,
        errorRate,
      };
      metricsMap.set(platform, pm);
      platformMetricsArray.push({ platform, ...pm });
    }

    // Stable ordering for output.
    platformMetricsArray.sort((a, b) => a.platform.localeCompare(b.platform));

    const totalDurationMs = Math.max(0, Date.now() - this.startedAtMs);

    const summary: OrchestratorMetrics = {
      totalIterations: this.iterationAcc.totalIterations,
      successfulIterations: this.iterationAcc.successfulIterations,
      failedIterations: this.iterationAcc.failedIterations,
      averageIterationDurationMs: avgIterationDuration,
      platformMetrics: metricsMap,
      firstPassSuccessRate,
      averageRevisionsPerSubtask,
      escalationRate,
      totalDurationMs,
    };

    return {
      generatedAt: new Date().toISOString(),
      summary: {
        totalIterations: summary.totalIterations,
        successfulIterations: summary.successfulIterations,
        failedIterations: summary.failedIterations,
        averageIterationDurationMs: summary.averageIterationDurationMs,
        firstPassSuccessRate: summary.firstPassSuccessRate,
        averageRevisionsPerSubtask: summary.averageRevisionsPerSubtask,
        escalationRate: summary.escalationRate,
        totalDurationMs: summary.totalDurationMs,
        platformMetrics: platformMetricsArray,
      },
      notes: [
        'Token usage is sourced from UsageTracker events (usage.jsonl).',
        'Cost is an estimate based on tokens only (no input/output split).',
      ],
    };
  }

  private static createPlatformAccumulator(): PlatformAccumulator {
    return {
      calls: 0,
      tokensUsed: 0,
      costUsd: 0,
      latencyTotalMs: 0,
      failures: 0,
    };
  }

  /**
   * Best-effort pricing table (USD per 1K tokens).
   *
   * We do not have reliable model identifiers and do not have input/output token splits,
   * so we intentionally keep this coarse and documented as an estimate.
   */
  private static estimateCostUsd(platform: Platform, tokens: number, _model?: string): number {
    const tokensSafe = Math.max(0, tokens);
    const usdPer1k = (() => {
      switch (platform) {
        case 'claude':
          return 0.015;
        case 'codex':
          return 0.01;
        case 'cursor':
          return 0.01;
        case 'gemini':
          return 0.005;
        case 'copilot':
          return 0.0; // typically subscription-based; treat as $0 estimate
        default: {
          const exhaustive: never = platform;
          return exhaustive;
        }
      }
    })();

    return (tokensSafe / 1000) * usdPer1k;
  }

  private static roundUsd(value: number): number {
    // Keep small values readable but stable.
    return Math.round(value * 1_000_000) / 1_000_000;
  }
}

