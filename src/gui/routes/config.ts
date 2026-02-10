/**
 * Configuration API routes for RWM Puppet Master GUI
 * 
 * Provides REST endpoints for loading, saving, and validating configuration.
 * See BUILD_QUEUE_PHASE_9.md PH9-T07 for specification.
 */

import type { Router, Request, Response } from 'express';
import { Router as createRouter } from 'express';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ConfigManager } from '../../config/config-manager.js';
import type { PuppetMasterConfig } from '../../types/config.js';
import {
  getGeminiModels,
  getCopilotModels,
} from '../../platforms/index.js';
import { getCursorModels } from '../../platforms/cursor-models.js';
import { getCodexModels, getCodexModelsWithCache } from '../../platforms/codex-models.js';
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

const MODEL_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours (static catalogs)
const CURSOR_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour (Cursor CLI discovery can change more frequently)
const PLATFORM_DISCOVERY_TIMEOUT_MS = 3500;
let modelCache: ModelCacheEntry | null = null;
let cursorDiscoveredCache: { models: Array<{ id: string; label: string }>; timestamp: number } | null = null;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

function ensureAutoOption(platformModels: Array<{ id: string; label: string; reasoningLevels?: string[] }>) {
  const hasAuto = platformModels.some((m) => m.id === 'auto');
  if (!hasAuto) {
    return [{ id: 'auto', label: 'Auto (recommended)' }, ...platformModels];
  }
  const autoIndex = platformModels.findIndex((m) => m.id === 'auto');
  if (autoIndex > 0) {
    const auto = platformModels[autoIndex];
    const others = platformModels.filter((_, i) => i !== autoIndex);
    return [{ ...auto, label: 'Auto (recommended)' }, ...others];
  }
  return platformModels.map((m) => (m.id === 'auto' ? { ...m, label: 'Auto (recommended)' } : m));
}

function removeAuto(platformModels: Array<{ id: string; label: string; reasoningLevels?: string[] }>) {
  return platformModels.filter((m) => m.id !== 'auto');
}

function buildStaticModelCatalog(): Record<Platform, Array<{ id: string; label: string; reasoningLevels?: string[] }>> {
  const cursorStatic = getCursorModels();
  const codexStatic = getCodexModels();
  const claudeStatic = getClaudeModels();
  const geminiStatic = getGeminiModels();
  const copilotStatic = getCopilotModels();

  return {
    // NOTE: "auto" is a Puppet Master model option only for Cursor.
    cursor: ensureAutoOption(
      Array.isArray(cursorStatic) && cursorStatic.length > 0
        ? cursorStatic.map((m) => ({ id: m.id, label: m.label || m.id }))
        : [{ id: 'auto', label: 'Auto (recommended)' }]
    ),
    codex: removeAuto(
      Array.isArray(codexStatic) && codexStatic.length > 0
        ? codexStatic.map((m) => ({ id: m.id, label: m.label || m.id, reasoningLevels: m.reasoningLevels }))
        : []
    ),
    claude: removeAuto(
      Array.isArray(claudeStatic) && claudeStatic.length > 0
        ? claudeStatic.map((m) => ({ id: m.id, label: m.label || m.id, reasoningLevels: m.reasoningLevels }))
        : []
    ),
    gemini: removeAuto(
      Array.isArray(geminiStatic) && geminiStatic.length > 0
        ? geminiStatic.map((m) => ({ id: m.id, label: m.label || m.id }))
        : []
    ),
    copilot: removeAuto(
      Array.isArray(copilotStatic) && copilotStatic.length > 0
        ? copilotStatic.map((m) => ({ id: m.id, label: m.label || m.id, reasoningLevels: m.reasoningLevels }))
        : []
    ),
  };
}

/**
 * Create config routes.
 *
 * @param baseDirectory - Optional project root; when set, config and capabilities paths are resolved from it (fixes Config page when server cwd differs from project).
 * @returns Express Router with configuration management endpoints.
 */
export function createConfigRoutes(baseDirectory?: string): Router {
  const router = createRouter();
  const configPath = baseDirectory ? join(baseDirectory, '.puppet-master', 'config.yaml') : undefined;

  /**
   * GET /api/config
   * Returns current configuration loaded from file or defaults.
   * Auto-creates default config if missing or corrupt.
   * Query parameter: ?refresh=true to bypass cache (for frontend cache invalidation)
   */
  router.get('/config', async (req: Request, res: Response) => {
    try {
      const configManager = new ConfigManager(configPath);
      // Auto-create config if missing or corrupt, but do not run slow platform detection here.
      const config = await configManager.load(true, { adjustForInstalledPlatforms: false });

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
      if (baseDirectory) console.warn('[Config] GET /config failed (baseDirectory:', baseDirectory, '):', err.message);
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

      // Validate and save using project config path
      const configManager = new ConfigManager(configPath);
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

      // Validate configuration (path only needed for consistency; validate does not read file)
      const configManager = new ConfigManager(configPath);
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
  router.get('/config/capabilities', async (req: Request, res: Response) => {
    try {
      const command = resolvePlatformCommand('cursor');
      const candidates = getCursorCommandCandidates();
      const selectedBinary = candidates[0] || command;
      
      const auth = getPlatformAuthStatus('cursor');

      // Default: keep this endpoint fast for the Config page. Only do live discovery when requested.
      const forceDiscover = req.query.refresh === 'true' || req.query.discover === 'true';
      
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
        if (forceDiscover) {
          models = await withTimeout(getCursorModelsWithDiscovery(selectedBinary, true), 3000);
        } else {
          // Static list is immediate and avoids CLI calls that can be slow when the user is not logged in.
          models = getCursorModels().map((m) => ({ ...m, source: 'static' as const }));
        }
      } catch {
        models = getCursorModels().map((m) => ({ ...m, source: 'static' as const }));
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

      // Fast path for normal UI loads:
      // return static model lists quickly, but attempt a fast Cursor CLI model discovery
      // (short timeout + cache) so the Config dropdown reflects the user's actual Cursor build.
      if (!forceRefresh) {
        const staticModels = buildStaticModelCatalog();

        // Cursor only: best-effort discovery (fast, non-billable). Cache separately.
        try {
          const nowCursor = Date.now();
          if (!cursorDiscoveredCache || (nowCursor - cursorDiscoveredCache.timestamp) > CURSOR_CACHE_TTL_MS) {
            const cliPath = resolvePlatformCommand('cursor');
            const discovered = await withTimeout(getCursorModelsWithDiscovery(cliPath, true), 2000);
            if (Array.isArray(discovered) && discovered.length > 0) {
              const models = discovered.map((m) => ({ id: m.id, label: m.label || m.id }));
              cursorDiscoveredCache = { models, timestamp: nowCursor };
            }
          }
        } catch {
          // Ignore and keep static cursor list.
        }

        if (cursorDiscoveredCache && cursorDiscoveredCache.models.length > 0) {
          staticModels.cursor = ensureAutoOption(cursorDiscoveredCache.models);
        }

        modelCache = {
          models: staticModels,
          timestamp: now,
        };
        clearTimeout(requestTimeout);
        res.json(staticModels);
        return;
      }

      const capabilitiesDir = baseDirectory ? join(baseDirectory, '.puppet-master', 'capabilities') : '.puppet-master/capabilities';

      // Load config to get CLI paths (use project root so discovery works when cwd differs)
      const configManager = new ConfigManager(configPath);
      let config: PuppetMasterConfig;
      try {
        config = await configManager.load();
      } catch {
        // If config doesn't exist, use defaults
        const { getDefaultConfig } = await import('../../config/default-config.js');
        config = getDefaultConfig();
      }

      // Initialize discovery service with config CLI paths and project capabilities dir
      const discoveryService = new CapabilityDiscoveryService(
        capabilitiesDir,
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
        // Codex: Prefer local Codex cache (no subprocess / no network), fallback to curated static list.
        (async () => {
          const models = await getCodexModelsWithCache();
          if (!Array.isArray(models) || models.length === 0) {
            console.warn('[Config] Codex models list is empty, using fallback');
            return [];
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
                  reasoningLevels: staticModel?.reasoningLevels,
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
            return [];
          }
          return staticModels.map(m => ({ id: m.id, label: m.label || m.id, reasoningLevels: m.reasoningLevels }));
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
            return [];
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
                  reasoningLevels: staticModel?.reasoningLevels,
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
            return [];
          }
          return staticModels.map(m => ({ id: m.id, label: m.label || m.id, reasoningLevels: m.reasoningLevels }));
        })(),
      ]);
      
      const models = {
        cursor: ensureAutoOption(cursorModels),
        codex: removeAuto(codexModels),
        claude: removeAuto(claudeModels),
        gemini: removeAuto(geminiModels),
        copilot: removeAuto(copilotModels),
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
      if (baseDirectory) console.warn('[Config] GET /config/models failed (baseDirectory:', baseDirectory, '):', err.message);
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

    // Fast path: most desktop launches are not inside a Git repo. Avoid spawning
    // multiple synchronous git commands that can each block the event loop up to
    // the timeout when not in a worktree.
    const root = baseDirectory ?? process.cwd();
    if (!existsSync(join(root, '.git'))) {
      res.json({
        branches: [],
        remoteName: '',
        remoteUrl: '',
        userName: '',
        userEmail: '',
        currentBranch: '',
      });
      return;
    }

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
