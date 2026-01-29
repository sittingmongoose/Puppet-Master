/**
 * Platform Management API Routes for RWM Puppet Master GUI
 * 
 * Provides REST endpoints for platform detection, installation, and selection.
 */

import type { Router, Request, Response } from 'express';
import { Router as createRouter } from 'express';
import { existsSync } from 'fs';
import { join } from 'path';
import { PlatformDetector, type PlatformStatus } from '../../platforms/platform-detector.js';
import { InstallationManager } from '../../doctor/installation-manager.js';
import { ConfigManager } from '../../config/config-manager.js';
import type { Platform } from '../../types/config.js';

/**
 * Error response interface
 */
interface ErrorResponse {
  error: string;
  code: string;
}

/**
 * Platform status response
 */
interface PlatformStatusResponse {
  platforms: Record<Platform, PlatformStatus>;
  installedPlatforms: Platform[];
  uninstalledPlatforms: Platform[];
}

/**
 * First boot status response
 */
interface FirstBootStatusResponse {
  isFirstBoot: boolean;
  missingConfig: boolean;
  missingCapabilities: boolean;
}

/**
 * Install platform request body
 */
interface InstallPlatformRequest {
  platform: Platform;
  dryRun?: boolean;
}

/**
 * Select platforms request body
 */
interface SelectPlatformsRequest {
  platforms: Platform[];
}

/**
 * Create platform routes
 * 
 * @returns Express Router with platform management endpoints
 */
export function createPlatformRoutes(): Router {
  const router = createRouter();

  /**
   * GET /api/platforms/status
   * Returns installation status for all platforms
   */
  router.get('/platforms/status', async (_req: Request, res: Response) => {
    try {
      const configManager = new ConfigManager();
      const config = await configManager.load();
      const detector = new PlatformDetector(config.cliPaths);
      const result = await detector.detectInstalledPlatforms();

      res.json({
        platforms: result.platforms,
        installedPlatforms: result.installedPlatforms,
        uninstalledPlatforms: result.uninstalledPlatforms,
      } as PlatformStatusResponse);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to detect platforms',
        code: 'DETECTION_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * GET /api/platforms/installed
   * Returns list of installed platforms
   */
  router.get('/platforms/installed', async (_req: Request, res: Response) => {
    try {
      const configManager = new ConfigManager();
      const config = await configManager.load();
      const detector = new PlatformDetector(config.cliPaths);
      const installed = await detector.getInstalledPlatforms();

      res.json({ platforms: installed });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to get installed platforms',
        code: 'DETECTION_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * GET /api/platforms/first-boot
   * Returns first boot status (whether setup wizard should be shown)
   */
  router.get('/platforms/first-boot', async (_req: Request, res: Response) => {
    try {
      const configManager = new ConfigManager();
      const configPath = configManager.getConfigPath();
      const configExists = existsSync(configPath);

      // Check for capabilities file
      const capabilitiesPath = join(process.cwd(), '.puppet-master', 'capabilities', 'capabilities.json');
      const capabilitiesExists = existsSync(capabilitiesPath);

      // Check if config has any platforms configured
      let hasPlatformsConfigured = false;
      if (configExists) {
        try {
          const config = await configManager.load();
          // Check if any tier has a platform configured
          hasPlatformsConfigured = !!(
            config.tiers?.phase?.platform ||
            config.tiers?.task?.platform ||
            config.tiers?.subtask?.platform ||
            config.tiers?.iteration?.platform
          );
        } catch {
          // Config exists but invalid - treat as first boot
          hasPlatformsConfigured = false;
        }
      }

      const isFirstBoot = !configExists || !capabilitiesExists || !hasPlatformsConfigured;

      res.json({
        isFirstBoot,
        missingConfig: !configExists,
        missingCapabilities: !capabilitiesExists,
      } as FirstBootStatusResponse);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to check first boot status',
        code: 'FIRST_BOOT_CHECK_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * POST /api/platforms/install
   * Install a specific platform
   */
  router.post('/platforms/install', async (req: Request, res: Response) => {
    try {
      const body = req.body as InstallPlatformRequest;
      const { platform } = body;
      const dryRun = body.dryRun === true;

      if (!platform) {
        res.status(400).json({
          error: 'platform is required',
          code: 'MISSING_PARAM',
        } as ErrorResponse);
        return;
      }

      const validPlatforms: Platform[] = ['cursor', 'codex', 'claude', 'gemini', 'copilot'];
      if (!validPlatforms.includes(platform)) {
        res.status(400).json({
          error: `Invalid platform: ${platform}. Valid platforms: ${validPlatforms.join(', ')}`,
          code: 'INVALID_PLATFORM',
        } as ErrorResponse);
        return;
      }

      const installationManager = new InstallationManager();
      
      // Map platform to check name
      const checkNameMap: Record<Platform, string> = {
        cursor: 'cursor-cli',
        codex: 'codex-cli',
        claude: 'claude-cli',
        gemini: 'gemini-cli',
        copilot: 'copilot-cli',
      };

      const checkName = checkNameMap[platform];
      const installCommand = installationManager.getInstallCommand(checkName);

      if (!installCommand) {
        res.status(404).json({
          error: `No installation command available for platform: ${platform}`,
          code: 'NO_INSTALL_COMMAND',
        } as ErrorResponse);
        return;
      }

      // Attempt installation
      const result = await installationManager.installWithResult(checkName, {
        skipConfirmation: true,
        dryRun,
      });

      if (result.success) {
        res.json({
          success: true,
          output: result.output || `Successfully installed: ${platform}`,
          command: result.command,
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error || `Failed to install: ${platform}`,
          output: result.output,
          command: result.command,
          code: 'INSTALL_FAILED',
        });
      }
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to install platform',
        code: 'INSTALL_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * POST /api/platforms/select
   * Save user's platform selections to config
   */
  router.post('/platforms/select', async (req: Request, res: Response) => {
    try {
      const body = req.body as SelectPlatformsRequest;
      const { platforms } = body;

      if (!Array.isArray(platforms)) {
        res.status(400).json({
          error: 'platforms must be an array',
          code: 'INVALID_PARAM',
        } as ErrorResponse);
        return;
      }

      const validPlatforms: Platform[] = ['cursor', 'codex', 'claude', 'gemini', 'copilot'];
      const invalidPlatforms = platforms.filter((p) => !validPlatforms.includes(p as Platform));
      if (invalidPlatforms.length > 0) {
        res.status(400).json({
          error: `Invalid platforms: ${invalidPlatforms.join(', ')}. Valid platforms: ${validPlatforms.join(', ')}`,
          code: 'INVALID_PLATFORM',
        } as ErrorResponse);
        return;
      }

      const configManager = new ConfigManager();
      const config = await configManager.load();

      // Update config to use only selected platforms
      // If a tier uses an unselected platform, change it to the first selected platform
      const firstSelectedPlatform = platforms[0] as Platform | undefined;
      
      if (firstSelectedPlatform) {
        // Update tiers to use selected platforms
        // For now, we'll set all tiers to use the first selected platform
        // In a more sophisticated implementation, we'd preserve user's tier preferences
        if (config.tiers) {
          if (config.tiers.phase && !platforms.includes(config.tiers.phase.platform)) {
            config.tiers.phase.platform = firstSelectedPlatform;
          }
          if (config.tiers.task && !platforms.includes(config.tiers.task.platform)) {
            config.tiers.task.platform = firstSelectedPlatform;
          }
          if (config.tiers.subtask && !platforms.includes(config.tiers.subtask.platform)) {
            config.tiers.subtask.platform = firstSelectedPlatform;
          }
          if (config.tiers.iteration && !platforms.includes(config.tiers.iteration.platform)) {
            config.tiers.iteration.platform = firstSelectedPlatform;
          }
        }

        // Save updated config
        await configManager.save(config);
      }

      res.json({
        success: true,
        message: `Platform selections saved: ${platforms.join(', ')}`,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to save platform selections',
        code: 'SAVE_ERROR',
      } as ErrorResponse);
    }
  });

  return router;
}
