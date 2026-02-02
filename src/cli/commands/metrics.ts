/**
 * Metrics command - Show operational metrics
 *
 * Implements `puppet-master metrics`:
 * - Reads `.puppet-master/metrics/latest.json` if present (written by Orchestrator)
 * - Falls back to generating a report from UsageTracker events
 * - Outputs JSON (default) or CSV
 */

import { Command } from 'commander';
import { join } from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { ConfigManager } from '../../config/config-manager.js';
import { deriveProjectRootFromConfigPath } from '../../utils/project-paths.js';
import { MetricsCollector, type MetricsReport } from '../../metrics/metrics-collector.js';
import { MetricsReporter } from '../../metrics/metrics-reporter.js';
import { UsageTracker } from '../../memory/usage-tracker.js';
import type { CommandModule } from './index.js';

export interface MetricsOptions {
  config?: string;
  format?: 'json' | 'csv';
}

function resolveProjectRoot(configPath?: string): { projectRoot: string; resolvedConfigPath: string } {
  const configManager = new ConfigManager(configPath);
  const resolvedConfigPath = configManager.getConfigPath();
  const projectRoot = deriveProjectRootFromConfigPath(resolvedConfigPath);
  return { projectRoot, resolvedConfigPath };
}

function resolveSnapshotPath(projectRoot: string): string {
  return join(projectRoot, '.puppet-master', 'metrics', 'latest.json');
}

async function readJsonSafely<T>(filePath: string): Promise<T | null> {
  try {
    if (!existsSync(filePath)) {
      return null;
    }
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

async function computeMetricsReport(projectRoot: string): Promise<MetricsReport> {
  const usagePath = join(projectRoot, '.puppet-master', 'usage', 'usage.jsonl');
  const usageTracker = new UsageTracker(usagePath);
  const usageEvents = await usageTracker.getAll();

  const collector = new MetricsCollector();
  return collector.generateReport({ usageEvents });
}

export async function metricsAction(options: MetricsOptions): Promise<void> {
  const format = options.format ?? 'json';
  if (format !== 'json' && format !== 'csv') {
    throw new Error(`Invalid format: ${format}. Expected 'json' or 'csv'.`);
  }

  const { projectRoot } = resolveProjectRoot(options.config);
  const snapshotPath = resolveSnapshotPath(projectRoot);

  const fromSnapshot = await readJsonSafely<MetricsReport>(snapshotPath);
  const report = fromSnapshot ?? (await computeMetricsReport(projectRoot));

  const reporter = new MetricsReporter();
  if (format === 'csv') {
    console.log(reporter.toCsv(report));
  } else {
    console.log(reporter.toJson(report));
  }
}

export class MetricsCommand implements CommandModule {
  register(program: Command): void {
    program
      .command('metrics')
      .description('Show operational metrics (tokens, costs, success rates)')
      .option('-c, --config <path>', 'Path to config file')
      .option('--format <format>', 'Output format: json or csv', 'json')
      .action(async (opts: { config?: string; format?: string }) => {
        await metricsAction({
          config: opts.config,
          format: (opts.format as 'json' | 'csv' | undefined) ?? 'json',
        });
      });
  }
}

export const metricsCommand = new MetricsCommand();

