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
import { ConfigManager } from '../../config/config-manager.js';

// CLI checks
import { CursorCliCheck } from '../../doctor/checks/cli-tools.js';
import { CodexCliCheck } from '../../doctor/checks/cli-tools.js';
import { ClaudeCliCheck } from '../../doctor/checks/cli-tools.js';
import { GeminiCliCheck } from '../../doctor/checks/cli-tools.js';
import { CopilotCliCheck, CopilotSdkCheck } from '../../doctor/checks/cli-tools.js';
import { PlaywrightBrowsersCheck } from '../../doctor/checks/playwright-check.js';

// Git checks
import {
  GitAvailableCheck,
  GitConfigCheck,
  GitRepoCheck,
} from '../../doctor/checks/git-check.js';
import { SecretsCheck } from '../../doctor/checks/secrets-check.js';

// Runtime checks
import {
  NodeVersionCheck,
  NpmAvailableCheck,
  NpmNodeCompatibilityCheck,
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
  fixAvailable: boolean;
  fixDescription?: string;
}

/**
 * Run checks request body interface.
 */
interface RunChecksRequest {
  checks?: string[];
  category?: CheckCategory;
  platforms?: string[]; // Filter checks to only run for selected platforms
}

/**
 * Fix check request body interface.
 */
interface FixCheckRequest {
  checkName: string;
  dryRun?: boolean;
}

/**
 * Creates a CheckRegistry and registers all available checks.
 * 
 * @returns CheckRegistry instance with all checks registered
 */
async function createCheckRegistry(): Promise<CheckRegistry> {
  const registry = new CheckRegistry();
  const configManager = new ConfigManager();
  const config = await configManager.load();

  // Register CLI checks
  registry.register(new CursorCliCheck(config.cliPaths));
  registry.register(new CodexCliCheck(config.cliPaths));
  registry.register(new ClaudeCliCheck(config.cliPaths));
  registry.register(new GeminiCliCheck(config.cliPaths));
  registry.register(new CopilotCliCheck(config.cliPaths));
  registry.register(new CopilotSdkCheck());

  // Register Git checks
  registry.register(new GitAvailableCheck());
  registry.register(new GitConfigCheck());
  registry.register(new GitRepoCheck());
  registry.register(new SecretsCheck());

  // Register Runtime checks
  registry.register(new NodeVersionCheck());
  registry.register(new NpmAvailableCheck());
  registry.register(new NpmNodeCompatibilityCheck());
  registry.register(new PlaywrightBrowsersCheck());

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
 * 
 * @param registryFactory - Optional factory function for creating CheckRegistry (for testing)
 */
export function createDoctorRoutes(
  registryFactory?: () => Promise<CheckRegistry>
): Router {
  const router = createRouter();
  const registryPromise = registryFactory ? registryFactory() : createCheckRegistry();

  /**
   * GET /api/doctor/checks
   * Returns list of available checks.
   */
  router.get('/doctor/checks', async (_req: Request, res: Response) => {
    try {
      const registry = await registryPromise;
      const checks = registry.getRegisteredChecks();
      const installationManager = new InstallationManager();
      
      const checkInfos: CheckInfo[] = checks.map((check) => ({
        name: check.name,
        category: check.category,
        description: check.description,
        fixAvailable: installationManager.getInstallCommand(check.name) !== null,
        fixDescription: installationManager.getInstallCommand(check.name)?.description,
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
   * Body: { checks?: string[], category?: CheckCategory, platforms?: string[] }
   */
  router.post('/doctor/run', async (req: Request, res: Response) => {
    try {
      const body = req.body as RunChecksRequest;
      const registry = await registryPromise;
      const installationManager = new InstallationManager();

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

      // Filter by platforms if specified
      if (body.platforms && body.platforms.length > 0) {
        const platformCheckNames = new Set<string>();
        body.platforms.forEach((platform) => {
          platformCheckNames.add(`${platform}-cli`);
        });
        
        results = results.filter((result) => {
          // Include platform-specific CLI checks
          if (platformCheckNames.has(result.name)) {
            return true;
          }
          // Include non-platform checks (git, runtime, project, etc.)
          if (!result.name.includes('-cli')) {
            return true;
          }
          // Exclude other platform checks
          return false;
        });
      }

      const resultsWithFixInfo = results.map((result) => ({
        ...result,
        fixAvailable: installationManager.getInstallCommand(result.name) !== null,
      }));

      // Return as 'checks' for consistency with frontend expectations
      res.json({ checks: resultsWithFixInfo, results: resultsWithFixInfo });
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
      const dryRun = body.dryRun === true;

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
      const result = await installationManager.installWithResult(checkName, {
        skipConfirmation: true,
        dryRun,
      });

      if (result.success) {
        res.json({
          success: true,
          output:
            result.output ||
            `Successfully fixed: ${installCommand.description}`,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: result.error || `Failed to fix: ${checkName}`,
        output: result.output,
        code: 'INSTALL_FAILED',
      });
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
