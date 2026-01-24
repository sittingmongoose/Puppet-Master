import { describe, it, expect } from 'vitest';
import { MetricsCollector } from './metrics-collector.js';
import type { IterationContext, IterationResult } from '../core/execution-engine.js';
import type { UsageEvent } from '../types/usage.js';

function makeIterationContext(input: {
  subtaskId: string;
  iterationNumber: number;
  platform: 'cursor' | 'codex' | 'claude' | 'gemini' | 'copilot';
}): IterationContext {
  // We only need a small subset in MetricsCollector; cast for test convenience.
  return {
    tierNode: { id: input.subtaskId } as unknown as IterationContext['tierNode'],
    iterationNumber: input.iterationNumber,
    platform: input.platform,
  } as unknown as IterationContext;
}

function makeIterationResult(input: Partial<IterationResult> & { duration: number }): IterationResult {
  const { duration, ...rest } = input;
  return {
    success: false,
    output: '',
    processId: 123,
    duration,
    exitCode: 0,
    completionSignal: undefined,
    learnings: [],
    filesChanged: [],
    ...rest,
  };
}

describe('MetricsCollector', () => {
  it('computes iteration and quality metrics', () => {
    const collector = new MetricsCollector({ startedAt: new Date('2026-01-01T00:00:00.000Z') });

    // Subtask A succeeds on first attempt
    collector.recordIteration(
      makeIterationContext({ subtaskId: 'ST-A', iterationNumber: 1, platform: 'cursor' }),
      makeIterationResult({ duration: 1000, success: true, completionSignal: 'COMPLETE' })
    );

    // Subtask B fails once then succeeds
    collector.recordIteration(
      makeIterationContext({ subtaskId: 'ST-B', iterationNumber: 1, platform: 'claude' }),
      makeIterationResult({ duration: 500, success: false, completionSignal: undefined })
    );
    collector.recordIteration(
      makeIterationContext({ subtaskId: 'ST-B', iterationNumber: 2, platform: 'claude' }),
      makeIterationResult({ duration: 700, success: true, completionSignal: 'COMPLETE' })
    );

    // Escalation for C (no iterations)
    collector.recordTierTransition('ST-C', 'running', 'escalated');

    const report = collector.generateReport();

    expect(report.summary.totalIterations).toBe(3);
    expect(report.summary.successfulIterations).toBe(2);
    expect(report.summary.failedIterations).toBe(1);
    expect(report.summary.averageIterationDurationMs).toBe(Math.round((1000 + 500 + 700) / 3));

    // First pass: A success, B first attempt failed => 1/2
    expect(report.summary.firstPassSuccessRate).toBeCloseTo(0.5, 5);

    // Revisions: A 0, B 1 => avg 0.5
    expect(report.summary.averageRevisionsPerSubtask).toBeCloseTo(0.5, 5);

    // Escalation rate: observed subtasks are A,B,C => 1/3
    expect(report.summary.escalationRate).toBeCloseTo(1 / 3, 5);
  });

  it('ingests usage events for platform tokens/cost/latency/error rate', () => {
    const collector = new MetricsCollector({ startedAt: new Date('2026-01-01T00:00:00.000Z') });

    const usage: UsageEvent[] = [
      {
        timestamp: '2026-01-01T00:00:01.000Z',
        platform: 'claude',
        action: 'usage',
        tokens: 1000,
        durationMs: 2000,
        success: true,
      },
      {
        timestamp: '2026-01-01T00:00:02.000Z',
        platform: 'claude',
        action: 'usage',
        tokens: 500,
        durationMs: 1000,
        success: false,
        error: 'boom',
      },
      {
        timestamp: '2026-01-01T00:00:03.000Z',
        platform: 'cursor',
        action: 'usage',
        tokens: 200,
        durationMs: 400,
        success: true,
      },
    ];

    const report = collector.generateReport({ usageEvents: usage });

    const claude = report.summary.platformMetrics.find((p) => p.platform === 'claude');
    expect(claude).toBeTruthy();
    expect(claude!.calls).toBe(2);
    expect(claude!.tokensUsed).toBe(1500);
    expect(claude!.averageLatencyMs).toBe(Math.round((2000 + 1000) / 2));
    expect(claude!.errorRate).toBeCloseTo(0.5, 5);
    expect(claude!.estimatedCostUSD).toBeGreaterThan(0);

    const cursor = report.summary.platformMetrics.find((p) => p.platform === 'cursor');
    expect(cursor).toBeTruthy();
    expect(cursor!.calls).toBe(1);
    expect(cursor!.tokensUsed).toBe(200);
  });
});

