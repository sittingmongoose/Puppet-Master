/**
 * MetricsReporter (P2-T08)
 *
 * Formats `MetricsReport` for CLI output.
 */

import type { MetricsReport } from './metrics-collector.js';

export type MetricsOutputFormat = 'json' | 'csv';

export class MetricsReporter {
  toJson(report: MetricsReport): string {
    return JSON.stringify(report, null, 2);
  }

  toCsv(report: MetricsReport): string {
    const lines: string[] = [];

    // Summary section: metric,value
    lines.push('metric,value');
    lines.push(`generatedAt,${escapeCsv(report.generatedAt)}`);
    lines.push(`totalIterations,${report.summary.totalIterations}`);
    lines.push(`successfulIterations,${report.summary.successfulIterations}`);
    lines.push(`failedIterations,${report.summary.failedIterations}`);
    lines.push(`averageIterationDurationMs,${report.summary.averageIterationDurationMs}`);
    lines.push(`firstPassSuccessRate,${report.summary.firstPassSuccessRate}`);
    lines.push(`averageRevisionsPerSubtask,${report.summary.averageRevisionsPerSubtask}`);
    lines.push(`escalationRate,${report.summary.escalationRate}`);
    lines.push(`totalDurationMs,${report.summary.totalDurationMs}`);

    lines.push('');

    // Platform section
    lines.push('platform,calls,tokensUsed,estimatedCostUSD,averageLatencyMs,errorRate');
    for (const p of report.summary.platformMetrics) {
      lines.push(
        [
          p.platform,
          p.calls,
          p.tokensUsed,
          p.estimatedCostUSD,
          p.averageLatencyMs,
          p.errorRate,
        ].join(',')
      );
    }

    lines.push('');

    // Notes section
    lines.push('note');
    for (const note of report.notes) {
      lines.push(escapeCsv(note));
    }

    return lines.join('\n');
  }
}

function escapeCsv(value: string): string {
  // Minimal CSV escaping: quote if contains comma, quote, or newline.
  const needsQuotes = /[,"\n]/.test(value);
  if (!needsQuotes) {
    return value;
  }
  const escaped = value.replaceAll('"', '""');
  return `"${escaped}"`;
}

