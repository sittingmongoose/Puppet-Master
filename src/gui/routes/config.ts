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
import {
  getGeminiModels,
  getCopilotModels,
} from '../../platforms/index.js';
import { getCursorModels } from '../../platforms/cursor-models.js';
import { getCodexModels } from '../../platforms/codex-models.js';
import { getClaudeModels } from '../../platforms/claude-models.js';
import { getCursorCommandCandidates, resolvePlatformCommand } from '../../platforms/constants.js';
import { getPlatformAuthStatus } from '../../platforms/auth-status.js';
import { probeCursorMCP, detectCursorConfig } from '../../platforms/capability-discovery.js';
import { getCursorModelsWithDiscovery, type DiscoveredCursorModel } from '../../platforms/cursor-models.js';

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

  /**
   * CU-P1-T09: GET /api/config/capabilities
   * Returns Cursor capabilities (binary, modes, output formats, auth, models, MCP).
   */
  router.get('/config/capabilities', async (_req: Request, res: Response) => {
    try {
      const command = resolvePlatformCommand('cursor');
      const candidates = getCursorCommandCandidates();
      const selectedBinary = candidates[0] || command;
      
      const auth = getPlatformAuthStatus('cursor');
      
      // Probe MCP (non-blocking)
      let mcpResult;
      try {
        mcpResult = await probeCursorMCP(selectedBinary, 3000);
      } catch {
        mcpResult = { available: false, error: 'Probe failed' };
      }
      
      // Detect config (non-blocking)
      let configResult;
      try {
        configResult = await detectCursorConfig();
      } catch {
        configResult = { found: false };
      }
      
      // Get models with discovery
      let models: DiscoveredCursorModel[] = [];
      try {
        models = await getCursorModelsWithDiscovery(selectedBinary, true);
      } catch {
        models = [];
      }
      
      // Ensure models is always an array
      const safeModels = Array.isArray(models) ? models : [];
      
      res.json({
        binary: {
          selected: selectedBinary,
          candidates: candidates.slice(0, 3), // First 3 candidates
        },
        modes: ['default', 'plan', 'ask'],
        outputFormats: ['text', 'json', 'stream-json'],
        auth: {
          status: auth.status,
          hasApiKey: auth.status === 'authenticated',
          // Never reveal the key value
        },
        models: {
          source: safeModels.length > 0 && safeModels[0]?.source === 'discovered' ? 'discovered' : 'static',
          count: safeModels.length,
          sample: Array.isArray(safeModels) ? safeModels.slice(0, 5).map((m: DiscoveredCursorModel) => ({ id: m.id, label: m.label, source: m.source })) : [],
        },
        mcp: {
          available: mcpResult.available,
          serverCount: mcpResult.serverCount || 0,
          servers: mcpResult.servers?.slice(0, 5) || [],
        },
        config: {
          found: configResult.found,
          path: configResult.path,
          hasPermissions: configResult.hasPermissions || false,
        },
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to get capabilities',
        code: 'CAPABILITIES_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * GET /api/config/models
   * Returns suggested models for all platforms.
   * Useful for GUI model selection dropdowns and datalists.
   * P1: Enhanced to return models for all platforms (cursor, codex, claude, gemini, copilot).
   */
  router.get('/config/models', (_req: Request, res: Response) => {
    try {
      res.json({
        cursor: getCursorModels().map(m => ({ id: m.id, label: m.label || m.id, provider: m.provider })),
        codex: getCodexModels().map(m => ({ id: m.id, label: m.label || m.id })),
        claude: getClaudeModels().map(m => ({ id: m.id, label: m.label || m.id })),
        gemini: getGeminiModels().map(m => ({ id: m.id, label: m.label || m.id })),
        copilot: getCopilotModels().map(m => ({ id: m.id, label: m.label || m.id })),
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to fetch model catalogs',
        code: 'MODELS_ERROR',
      } as ErrorResponse);
    }
  });

  return router;
}
