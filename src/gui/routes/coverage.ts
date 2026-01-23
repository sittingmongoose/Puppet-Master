/**
 * Coverage API routes for RWM Puppet Master GUI
 * 
 * Provides REST endpoints for loading and displaying coverage reports.
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T18 for specification.
 */

import type { Router, Request, Response } from 'express';
import { Router as createRouter } from 'express';
import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import type { CoverageReport } from '../../start-chain/validators/coverage-validator.js';

/**
 * Error response interface.
 */
interface ErrorResponse {
  error: string;
  code: string;
}

/**
 * Create coverage routes.
 * 
 * Returns Express Router with coverage report endpoints.
 * @param baseDirectory - Optional base directory for project discovery
 */
export function createCoverageRoutes(baseDirectory?: string): Router {
  const router = createRouter();
  const projectBaseDir = baseDirectory ? resolve(baseDirectory) : process.cwd();

  /**
   * GET /api/coverage/data
   * Loads coverage report from .puppet-master/requirements/coverage.json
   * Query parameters:
   *   - projectPath: Optional project path (defaults to baseDirectory or process.cwd())
   */
  router.get('/coverage/data', async (req: Request, res: Response) => {
    try {
      const { projectPath } = req.query;

      // Resolve project directory
      const projectDir = projectPath && typeof projectPath === 'string' 
        ? resolve(projectPath) 
        : projectBaseDir;

      // Construct coverage report path
      const coveragePath = join(projectDir, '.puppet-master', 'requirements', 'coverage.json');

      // Check if file exists
      if (!existsSync(coveragePath)) {
        res.status(404).json({
          error: 'Coverage report not found. Run Start Chain to generate a coverage report.',
          code: 'NOT_FOUND',
        } as ErrorResponse);
        return;
      }

      // Read and parse coverage report
      try {
        const fileContent = await fs.readFile(coveragePath, 'utf-8');
        const coverageReport: CoverageReport = JSON.parse(fileContent);

        // Validate that it's a valid CoverageReport structure
        if (typeof coverageReport.coverageRatio !== 'number' || 
            !Array.isArray(coverageReport.missingRequirements)) {
          res.status(500).json({
            error: 'Invalid coverage report format',
            code: 'INVALID_FORMAT',
          } as ErrorResponse);
          return;
        }

        res.json({ coverage: coverageReport });
      } catch (parseError) {
        const err = parseError as Error;
        res.status(500).json({
          error: `Failed to parse coverage report: ${err.message}`,
          code: 'PARSE_ERROR',
        } as ErrorResponse);
      }
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to load coverage report',
        code: 'LOAD_ERROR',
      } as ErrorResponse);
    }
  });

  return router;
}
