/**
 * Configuration API routes for RWM Puppet Master GUI
 * 
 * Provides REST endpoints for loading, saving, and validating configuration.
 * See BUILD_QUEUE_PHASE_9.md PH9-T07 for specification.
 */

import type { Router, Request, Response } from 'express';
import { Router as createRouter } from 'express';
import { execSync } from 'node:child_process';
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
import { CapabilityDiscoveryService } from '../../platforms/capability-discovery.js';
import type { Platform } from '../../types/config.js';

/**
 * Error response interface.
 */
interface ErrorResponse {
  error: string;
  code: string;
}

/**
 * Model cache with TTL (24 hours).
 */
interface ModelCacheEntry {
  models: Record<Platform, Array<{ id: string; label: string; reasoningLevels?: string[] }>>;
  timestamp: number;
}

const MODEL_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const PLATFORM_DISCOVERY_TIMEOUT_MS = 3500;
let modelCache: ModelCacheEntry | null = null;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
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
   * Query parameter: ?refresh=true to bypass cache (for frontend cache invalidation)
   */
  router.get('/config', async (req: Request, res: Response) => {
    try {
      const configManager = new ConfigManager();
      const config = await configManager.load();

      // Add cache control header to hint to frontend about caching
      const refresh = req.query.refresh === 'true';
      if (refresh) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else {
        res.setHeader('Cache-Control', 'private, max-age=300'); // 5 minutes
      }

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

      // Invalidate model cache to force refresh on next request
      modelCache = null;

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
   * Task 4.3: Enhanced with dynamic discovery and caching.
   * 
   * Query parameters:
   * - refresh: Set to 'true' to bypass cache and force refresh
   */
  router.get('/config/models', async (req: Request, res: Response) => {
    const requestTimeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({
          error: 'Model discovery timed out',
          code: 'MODELS_TIMEOUT',
        } as ErrorResponse);
      }
    }, 10_000);

    try {
      const forceRefresh = req.query.refresh === 'true';
      const now = Date.now();
      
      // Check cache validity
      if (!forceRefresh && modelCache && (now - modelCache.timestamp) < MODEL_CACHE_TTL_MS) {
        return res.json(modelCache.models);
      }
      
      // Load config to get CLI paths
      const configManager = new ConfigManager();
      let config: PuppetMasterConfig;
      try {
        config = await configManager.load();
      } catch {
        // If config doesn't exist, use defaults
        const { getDefaultConfig } = await import('../../config/default-config.js');
        config = getDefaultConfig();
      }
      
      // Initialize discovery service with config CLI paths
      const discoveryService = new CapabilityDiscoveryService(
        '.puppet-master/capabilities',
        config.cliPaths || undefined,
        24
      );
      
      // Fetch models with dynamic discovery where available
      const [cursorModels, codexModels, claudeModels, geminiModels, copilotModels] = await Promise.all([
        // Cursor: Use dynamic discovery with fallback to static
        (async () => {
          try {
            const cliPath = resolvePlatformCommand('cursor', config.cliPaths);
            const models = await withTimeout(getCursorModelsWithDiscovery(cliPath, true), PLATFORM_DISCOVERY_TIMEOUT_MS);
            if (Array.isArray(models) && models.length > 0) {
              return models.map(m => ({ id: m.id, label: m.label || m.id, provider: m.provider }));
            }
          } catch (err) {
            console.warn('[Config] Cursor model discovery failed, using static list:', err instanceof Error ? err.message : String(err));
          }
          // Fallback to static models
          const staticModels = getCursorModels();
          if (!Array.isArray(staticModels) || staticModels.length === 0) {
            console.warn('[Config] Cursor static models list is empty');
            return [{ id: 'auto', label: 'Auto (recommended)' }];
          }
          return staticModels.map(m => ({ id: m.id, label: m.label || m.id, provider: m.provider }));
        })(),
        // Codex: Static list with reasoning levels (always available)
        (() => {
          const models = getCodexModels();
          if (!Array.isArray(models) || models.length === 0) {
            console.warn('[Config] Codex models list is empty, using fallback');
            return [{ id: 'auto', label: 'Auto (recommended)' }];
          }
          return models.map(m => ({ 
            id: m.id, 
            label: m.label || m.id,
            reasoningLevels: m.reasoningLevels,
          }));
        })(),
        // Claude: Try dynamic discovery, fallback to static
        (async () => {
          try {
            const discovered = await withTimeout(discoveryService.discoverModels('claude'), PLATFORM_DISCOVERY_TIMEOUT_MS);
            if (Array.isArray(discovered) && discovered.length > 0) {
              // Map discovered IDs to full model info
              const staticModels = getClaudeModels();
              const mapped = discovered.map(id => {
                const staticModel = staticModels.find(m => m.id === id);
                return {
                  id,
                  label: staticModel?.label || id,
                };
              });
              if (mapped.length > 0) return mapped;
            }
          } catch (err) {
            console.warn('[Config] Claude model discovery failed, using static list:', err instanceof Error ? err.message : String(err));
          }
          // Fallback to static models
          const staticModels = getClaudeModels();
          if (!Array.isArray(staticModels) || staticModels.length === 0) {
            console.warn('[Config] Claude static models list is empty');
            return [{ id: 'auto', label: 'Auto (recommended)' }];
          }
          return staticModels.map(m => ({ id: m.id, label: m.label || m.id }));
        })(),
        // Gemini: Use dynamic discovery with fallback to static
        (async () => {
          try {
            const discovered = await withTimeout(discoveryService.discoverModels('gemini'), PLATFORM_DISCOVERY_TIMEOUT_MS);
            if (Array.isArray(discovered) && discovered.length > 0) {
              const staticModels = getGeminiModels();
              const mapped = discovered.map(id => {
                const staticModel = staticModels.find(m => m.id === id);
                return {
                  id,
                  label: staticModel?.label || id,
                };
              });
              if (mapped.length > 0) return mapped;
            }
          } catch (err) {
            console.warn('[Config] Gemini model discovery failed, using static list:', err instanceof Error ? err.message : String(err));
          }
          // Fallback to static models
          const staticModels = getGeminiModels();
          if (!Array.isArray(staticModels) || staticModels.length === 0) {
            console.warn('[Config] Gemini static models list is empty');
            return [{ id: 'auto', label: 'Auto (recommended)' }];
          }
          return staticModels.map(m => ({ id: m.id, label: m.label || m.id }));
        })(),
        // Copilot: Use dynamic discovery with fallback to static
        (async () => {
          try {
            const discovered = await withTimeout(discoveryService.discoverModels('copilot'), PLATFORM_DISCOVERY_TIMEOUT_MS);
            if (Array.isArray(discovered) && discovered.length > 0) {
              const staticModels = getCopilotModels();
              const mapped = discovered.map(rawId => {
                // Ensure we have a string ID (SDK may return objects)
                const id = typeof rawId === 'string' ? rawId : String(rawId);
                const staticModel = staticModels.find(m => m.id === id);
                return {
                  id,
                  label: staticModel?.label || id,
                };
              });
              if (mapped.length > 0) return mapped;
            }
          } catch (err) {
            console.warn('[Config] Copilot model discovery failed, using static list:', err instanceof Error ? err.message : String(err));
          }
          // Fallback to static models
          const staticModels = getCopilotModels();
          if (!Array.isArray(staticModels) || staticModels.length === 0) {
            console.warn('[Config] Copilot static models list is empty');
            return [{ id: 'auto', label: 'Auto (recommended)' }];
          }
          return staticModels.map(m => ({ id: m.id, label: m.label || m.id }));
        })(),
      ]);
      
      // Ensure "auto" is always included as first option for each platform
      const ensureAutoOption = (platformModels: Array<{ id: string; label: string }>) => {
        const hasAuto = platformModels.some(m => m.id === 'auto');
        if (!hasAuto) {
          return [{ id: 'auto', label: 'Auto (recommended)' }, ...platformModels];
        }
        // Move auto to front if it exists
        const autoIndex = platformModels.findIndex(m => m.id === 'auto');
        if (autoIndex > 0) {
          const auto = platformModels[autoIndex];
          const others = platformModels.filter((_, i) => i !== autoIndex);
          return [{ ...auto, label: 'Auto (recommended)' }, ...others];
        }
        return platformModels.map(m => m.id === 'auto' ? { ...m, label: 'Auto (recommended)' } : m);
      };

      const models = {
        cursor: ensureAutoOption(cursorModels),
        codex: ensureAutoOption(codexModels),
        claude: ensureAutoOption(claudeModels),
        gemini: ensureAutoOption(geminiModels),
        copilot: ensureAutoOption(copilotModels),
      };
      
      // Update cache
      modelCache = {
        models,
        timestamp: now,
      };
      
      clearTimeout(requestTimeout);
      res.json(models);
    } catch (error) {
      clearTimeout(requestTimeout);
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to fetch model catalogs',
        code: 'MODELS_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * GET /api/config/git-info
   * Returns git repository information: branches, remote URL, user name/email, current branch.
   */
  router.get('/config/git-info', async (_req: Request, res: Response) => {
    const execOpts = { encoding: 'utf8' as const, timeout: 5000 };

    const runGit = (cmd: string): string => {
      try {
        return execSync(cmd, execOpts).trim();
      } catch {
        return '';
      }
    };

    const branchesRaw = runGit("git branch -a --format='%(refname:short)'");
    const branches = branchesRaw
      ? branchesRaw.split('\n').map(b => b.replace(/^'|'$/g, '').trim()).filter(Boolean)
      : [];
    const remoteUrl = runGit('git remote get-url origin');
    const userName = runGit('git config user.name');
    const userEmail = runGit('git config user.email');
    const currentBranch = runGit('git rev-parse --abbrev-ref HEAD');

    // Derive remote name from the first remote (usually "origin")
    const remoteName = runGit('git remote') ? runGit('git remote').split('\n')[0] : '';

    res.json({
      branches,
      remoteName,
      remoteUrl,
      userName,
      userEmail,
      currentBranch,
    });
  });

  return router;
}
