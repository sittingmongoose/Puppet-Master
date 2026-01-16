/**
 * Configuration API routes for RWM Puppet Master GUI
 * 
 * Provides REST endpoints for loading, saving, and validating configuration.
 * See BUILD_QUEUE_PHASE_9.md PH9-T07 for specification.
 */

import type { Router, Request, Response } from 'express';
import { Router as createRouter } from 'express';
import { ConfigManager } from '../../config/config-manager.js';
import type { PuppetMasterConfig } from '../../types/config.js';

/**
 * Error response interface.
 */
interface ErrorResponse {
  error: string;
  code: string;
}

/**
 * Create config routes.
 * 
 * Returns Express Router with configuration management endpoints.
 */
export function createConfigRoutes(): Router {
  const router = createRouter();

  /**
   * GET /api/config
   * Returns current configuration loaded from file or defaults.
   */
  router.get('/config', async (_req: Request, res: Response) => {
    try {
      const configManager = new ConfigManager();
      const config = await configManager.load();

      res.json({ config });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to load configuration',
        code: 'LOAD_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * PUT /api/config
   * Saves configuration to file with validation.
   * Body: { config: PuppetMasterConfig }
   */
  router.put('/config', async (req: Request, res: Response) => {
    try {
      const { config } = req.body;

      if (!config || typeof config !== 'object') {
        res.status(400).json({
          error: 'Configuration object is required',
          code: 'BAD_REQUEST',
        } as ErrorResponse);
        return;
      }

      // Validate configuration
      const configManager = new ConfigManager();
      try {
        configManager.validate(config);
      } catch (validationError) {
        const err = validationError as Error;
        res.status(400).json({
          success: false,
          errors: [err.message],
        });
        return;
      }

      // Save configuration
      await configManager.save(config as PuppetMasterConfig);

      res.json({ success: true });
    } catch (error) {
      const err = error as Error;
      
      // Check if it's a validation error
      if (err.message.includes('Missing required key') || err.message.includes('Invalid')) {
        res.status(400).json({
          success: false,
          errors: [err.message],
        });
        return;
      }

      res.status(500).json({
        success: false,
        errors: [err.message || 'Failed to save configuration'],
      });
    }
  });

  /**
   * POST /api/config/validate
   * Validates configuration without saving.
   * Body: { config: PuppetMasterConfig }
   */
  router.post('/config/validate', async (req: Request, res: Response) => {
    try {
      const { config } = req.body;

      if (!config || typeof config !== 'object') {
        res.status(400).json({
          valid: false,
          errors: ['Configuration object is required'],
        });
        return;
      }

      // Validate configuration
      const configManager = new ConfigManager();
      try {
        configManager.validate(config);
        res.json({ valid: true, errors: [] });
      } catch (validationError) {
        const err = validationError as Error;
        res.json({
          valid: false,
          errors: [err.message],
        });
      }
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        valid: false,
        errors: [err.message || 'Validation failed'],
      });
    }
  });

  return router;
}
