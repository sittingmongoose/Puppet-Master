/**
 * Doctor API routes for RWM Puppet Master GUI
 * 
 * Provides REST endpoints for listing, running, and fixing doctor checks.
 * See BUILD_QUEUE_PHASE_9.md PH9-T11 for specification.
 */

import type { Router, Request, Response } from 'express';
import { Router as createRouter } from 'express';
import { CheckRegistry } from '../../doctor/check-registry.js';
import type { CheckCategory, CheckResult } from '../../doctor/check-registry.js';
import { InstallationManager } from '../../doctor/installation-manager.js';

// CLI checks
import { CursorCliCheck } from '../../doctor/checks/cli-tools.js';
import { CodexCliCheck } from '../../doctor/checks/cli-tools.js';
import { ClaudeCliCheck } from '../../doctor/checks/cli-tools.js';

// Git checks
import {
  GitAvailableCheck,
  GitConfigCheck,
  GitRepoCheck,
} from '../../doctor/checks/git-check.js';

// Runtime checks
import {
  NodeVersionCheck,
  NpmAvailableCheck,
} from '../../doctor/checks/runtime-check.js';

// Project checks
import {
  ProjectDirCheck,
  ConfigFileCheck,
  SubdirectoriesCheck,
} from '../../doctor/checks/project-check.js';

/**
 * Error response interface.
 */
interface ErrorResponse {
  error: string;
  code: string;
}

/**
 * Check info response interface.
 */
interface CheckInfo {
  name: string;
  category: CheckCategory;
  description: string;
}

/**
 * Run checks request body interface.
 */
interface RunChecksRequest {
  checks?: string[];
  category?: CheckCategory;
}

/**
 * Fix check request body interface.
 */
interface FixCheckRequest {
  checkName: string;
}

/**
 * Creates a CheckRegistry and registers all available checks.
 * 
 * @returns CheckRegistry instance with all checks registered
 */
function createCheckRegistry(): CheckRegistry {
  const registry = new CheckRegistry();

  // Register CLI checks
  registry.register(new CursorCliCheck());
  registry.register(new CodexCliCheck());
  registry.register(new ClaudeCliCheck());

  // Register Git checks
  registry.register(new GitAvailableCheck());
  registry.register(new GitConfigCheck());
  registry.register(new GitRepoCheck());

  // Register Runtime checks
  registry.register(new NodeVersionCheck());
  registry.register(new NpmAvailableCheck());

  // Register Project checks
  registry.register(new ProjectDirCheck());
  registry.register(new ConfigFileCheck());
  registry.register(new SubdirectoriesCheck());

  return registry;
}

/**
 * Create doctor routes.
 * 
 * Returns Express Router with doctor management endpoints.
 */
export function createDoctorRoutes(): Router {
  const router = createRouter();

  /**
   * GET /api/doctor/checks
   * Returns list of available checks.
   */
  router.get('/doctor/checks', async (_req: Request, res: Response) => {
    try {
      const registry = createCheckRegistry();
      const checks = registry.getRegisteredChecks();
      
      const checkInfos: CheckInfo[] = checks.map((check) => ({
        name: check.name,
        category: check.category,
        description: check.description,
      }));

      res.json({ checks: checkInfos });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to load checks',
        code: 'LOAD_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * POST /api/doctor/run
   * Runs checks with optional filtering.
   * Body: { checks?: string[], category?: CheckCategory }
   */
  router.post('/doctor/run', async (req: Request, res: Response) => {
    try {
      const body = req.body as RunChecksRequest;
      const registry = createCheckRegistry();

      let results: CheckResult[];

      if (body.checks && body.checks.length > 0) {
        // Run specific checks by name
        const checkPromises = body.checks.map((checkName) =>
          registry.runOne(checkName)
        );
        const checkResults = await Promise.all(checkPromises);
        results = checkResults.filter((r): r is CheckResult => r !== null);
      } else if (body.category) {
        // Run all checks in category
        results = await registry.runCategory(body.category);
      } else {
        // Run all checks
        results = await registry.runAll();
      }

      res.json({ results });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to run checks',
        code: 'RUN_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * POST /api/doctor/fix
   * Attempts to fix a failed check.
   * Body: { checkName: string }
   */
  router.post('/doctor/fix', async (req: Request, res: Response) => {
    try {
      const body = req.body as FixCheckRequest;
      const { checkName } = body;

      if (!checkName) {
        res.status(400).json({
          error: 'checkName is required',
          code: 'MISSING_PARAM',
        } as ErrorResponse);
        return;
      }

      const installationManager = new InstallationManager();
      const installCommand = installationManager.getInstallCommand(checkName);

      if (!installCommand) {
        res.status(404).json({
          error: `No fix available for check: ${checkName}`,
          code: 'NO_FIX_AVAILABLE',
        } as ErrorResponse);
        return;
      }

      // Attempt installation (skip confirmation for API calls)
      const success = await installationManager.install(checkName, {
        skipConfirmation: true,
        dryRun: false,
      });

      if (success) {
        res.json({
          success: true,
          output: `Successfully fixed: ${installCommand.description}`,
        });
      } else {
        res.status(500).json({
          success: false,
          output: `Failed to fix: ${checkName}`,
        });
      }
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to fix check',
        code: 'FIX_ERROR',
      } as ErrorResponse);
    }
  });

  return router;
}
