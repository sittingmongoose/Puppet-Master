import { describe, it, expect } from 'vitest';
import { MetricsReporter } from './metrics-reporter.js';
import type { MetricsReport } from './metrics-collector.js';

describe('MetricsReporter', () => {
  it('formats JSON deterministically', () => {
    const reporter = new MetricsReporter();
    const report: MetricsReport = {
      generatedAt: '2026-01-01T00:00:00.000Z',
      summary: {
        totalIterations: 1,
        successfulIterations: 1,
        failedIterations: 0,
        averageIterationDurationMs: 1000,
        firstPassSuccessRate: 1,
        averageRevisionsPerSubtask: 0,
        escalationRate: 0,
        totalDurationMs: 1000,
        platformMetrics: [
          {
            platform: 'claude',
            calls: 1,
            tokensUsed: 123,
            estimatedCostUSD: 0.001,
            averageLatencyMs: 1000,
            errorRate: 0,
          },
        ],
      },
      notes: ['note-a'],
    };

    const json = reporter.toJson(report);
    expect(json).toContain('"generatedAt": "2026-01-01T00:00:00.000Z"');
    expect(json).toContain('"platform": "claude"');
  });

  it('formats CSV with summary and platform sections', () => {
    const reporter = new MetricsReporter();
    const report: MetricsReport = {
      generatedAt: '2026-01-01T00:00:00.000Z',
      summary: {
        totalIterations: 2,
        successfulIterations: 1,
        failedIterations: 1,
        averageIterationDurationMs: 500,
        firstPassSuccessRate: 0.5,
        averageRevisionsPerSubtask: 1,
        escalationRate: 0,
        totalDurationMs: 2000,
        platformMetrics: [
          {
            platform: 'cursor',
            calls: 2,
            tokensUsed: 200,
            estimatedCostUSD: 0,
            averageLatencyMs: 300,
            errorRate: 0.5,
          },
        ],
      },
      notes: ['Tokens are estimated, not exact.'],
    };

    const csv = reporter.toCsv(report);
    expect(csv).toContain('metric,value');
    expect(csv).toContain('totalIterations,2');
    expect(csv).toContain('platform,calls,tokensUsed,estimatedCostUSD,averageLatencyMs,errorRate');
    expect(csv).toContain('cursor,2,200,0,300,0.5');
    expect(csv).toContain('note');
  });
});

