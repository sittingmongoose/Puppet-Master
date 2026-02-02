/**
 * Metrics API routes for RWM Puppet Master GUI
 *
 * Provides REST endpoint for loading operational metrics.
 * P2-T08: Comprehensive Metrics Collection
 */

import type { Router, Request, Response } from 'express';
import { Router as createRouter } from 'express';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import { promises as fs } from 'fs';
import { MetricsCollector, type MetricsReport } from '../../metrics/metrics-collector.js';
import { UsageTracker } from '../../memory/usage-tracker.js';

interface ErrorResponse {
  error: string;
  code: string;
}

export function createMetricsRoutes(baseDirectory?: string): Router {
  const router = createRouter();
  const projectBaseDir = baseDirectory ? resolve(baseDirectory) : process.cwd();

  /**
   * GET /api/metrics
   *
   * Query parameters:
   * - projectPath: optional project root path (defaults to baseDirectory or process.cwd()).
   *
   * Behavior:
   * - Prefer snapshot `.puppet-master/metrics/latest.json` if present
   * - Otherwise compute report from `.puppet-master/usage/usage.jsonl`
   * - If neither exists, return an empty report computed from zero usage events
   */
  router.get('/metrics', async (req: Request, res: Response) => {
    try {
      const { projectPath } = req.query;

      const projectDir =
        projectPath && typeof projectPath === 'string' ? resolve(projectPath) : projectBaseDir;

      const snapshotPath = join(projectDir, '.puppet-master', 'metrics', 'latest.json');
      if (existsSync(snapshotPath)) {
        try {
          const content = await fs.readFile(snapshotPath, 'utf-8');
          const report = JSON.parse(content) as MetricsReport;
          res.json(report);
          return;
        } catch (error) {
          const err = error as Error;
          res.status(500).json({
            error: `Failed to parse metrics snapshot: ${err.message}`,
            code: 'PARSE_ERROR',
          } as ErrorResponse);
          return;
        }
      }

      const usagePath = join(projectDir, '.puppet-master', 'usage', 'usage.jsonl');
      const usageTracker = new UsageTracker(usagePath);
      const usageEvents = existsSync(usagePath) ? await usageTracker.getAll() : [];

      const collector = new MetricsCollector();
      const report = collector.generateReport({ usageEvents });
      res.json(report);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to load metrics',
        code: 'LOAD_ERROR',
      } as ErrorResponse);
    }
  });

  return router;
}

