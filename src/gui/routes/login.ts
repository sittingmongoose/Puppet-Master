/**
 * Login API routes for RWM Puppet Master GUI
 * 
 * Provides REST endpoints for platform authentication status and management.
 * Feature parity with CLI `puppet-master login` command.
 */

import type { Router, Request, Response } from 'express';
import { Router as createRouter } from 'express';
import type { Platform } from '../../types/config.js';
import { getPlatformAuthStatus, type PlatformAuthStatus, type PlatformAuthCheckResult } from '../../platforms/auth-status.js';

/**
 * Error response interface.
 */
interface ErrorResponse {
  error: string;
  code: string;
}

/**
 * Platform authentication info for API response
 */
interface PlatformAuthInfo {
  platform: Platform;
  status: PlatformAuthStatus;
  details?: string;
  fixSuggestion?: string;
  envVar?: string;
  getUrl?: string;
}

/**
 * Platform authentication configuration
 */
const PLATFORM_AUTH_CONFIG: Record<Platform, { envVar: string; getUrl: string; description: string }> = {
  cursor: {
    envVar: '',
    getUrl: 'https://cursor.sh',
    description: 'Cursor authentication is managed through the Cursor IDE.',
  },
  codex: {
    envVar: 'OPENAI_API_KEY',
    getUrl: 'https://platform.openai.com/api-keys',
    description: 'OpenAI API key for Codex CLI.',
  },
  claude: {
    envVar: 'ANTHROPIC_API_KEY',
    getUrl: 'https://console.anthropic.com/settings/keys',
    description: 'Anthropic API key for Claude Code.',
  },
  gemini: {
    envVar: 'GEMINI_API_KEY',
    getUrl: 'https://aistudio.google.com/app/apikey',
    description: 'Google API key for Gemini CLI.',
  },
  copilot: {
    envVar: 'GH_TOKEN',
    getUrl: 'https://github.com/settings/tokens',
    description: 'GitHub token with Copilot permission.',
  },
};

const PLATFORMS: Platform[] = ['cursor', 'codex', 'claude', 'gemini', 'copilot'];

/**
 * Create login routes.
 * 
 * Returns Express Router with authentication endpoints.
 */
export function createLoginRoutes(): Router {
  const router = createRouter();

  /**
   * GET /api/login/status
   * Get authentication status for all platforms.
   */
  router.get('/login/status', async (_req: Request, res: Response) => {
    try {
      const statuses: PlatformAuthInfo[] = [];

      for (const platform of PLATFORMS) {
        const authStatus = getPlatformAuthStatus(platform);
        const config = PLATFORM_AUTH_CONFIG[platform];

        statuses.push({
          platform,
          status: authStatus.status,
          details: authStatus.details,
          fixSuggestion: authStatus.fixSuggestion,
          envVar: config.envVar || undefined,
          getUrl: config.getUrl,
        });
      }

      // Calculate summary
      const authenticated = statuses.filter((s) => s.status === 'authenticated').length;
      const notAuthenticated = statuses.filter((s) => s.status === 'not_authenticated').length;
      const skipped = statuses.filter((s) => s.status === 'skipped').length;

      res.json({
        platforms: statuses,
        summary: {
          total: PLATFORMS.length,
          authenticated,
          notAuthenticated,
          skipped,
        },
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to get auth status',
        code: 'AUTH_STATUS_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * GET /api/login/status/:platform
   * Get authentication status for a specific platform.
   */
  router.get('/login/status/:platform', async (req: Request, res: Response) => {
    try {
      const { platform } = req.params;
      const normalizedPlatform = platform.toLowerCase() as Platform;

      if (!PLATFORMS.includes(normalizedPlatform)) {
        res.status(400).json({
          error: `Invalid platform: ${platform}`,
          code: 'INVALID_PLATFORM',
          validPlatforms: PLATFORMS,
        } as ErrorResponse & { validPlatforms: string[] });
        return;
      }

      const authStatus = getPlatformAuthStatus(normalizedPlatform);
      const config = PLATFORM_AUTH_CONFIG[normalizedPlatform];

      res.json({
        platform: normalizedPlatform,
        status: authStatus.status,
        details: authStatus.details,
        fixSuggestion: authStatus.fixSuggestion,
        envVar: config.envVar || undefined,
        getUrl: config.getUrl,
        description: config.description,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to get auth status',
        code: 'AUTH_STATUS_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * GET /api/login/instructions/:platform
   * Get authentication instructions for a specific platform.
   */
  router.get('/login/instructions/:platform', async (req: Request, res: Response) => {
    try {
      const { platform } = req.params;
      const normalizedPlatform = platform.toLowerCase() as Platform;

      if (!PLATFORMS.includes(normalizedPlatform)) {
        res.status(400).json({
          error: `Invalid platform: ${platform}`,
          code: 'INVALID_PLATFORM',
        } as ErrorResponse);
        return;
      }

      const config = PLATFORM_AUTH_CONFIG[normalizedPlatform];

      // Platform-specific instructions
      const instructions: Record<Platform, string[]> = {
        cursor: [
          '1. Open Cursor IDE',
          '2. Sign in with your account (Settings → Account)',
          '3. Cursor CLI will automatically use your IDE authentication',
        ],
        codex: [
          '1. Visit https://platform.openai.com/api-keys',
          '2. Create a new API key',
          '3. Set OPENAI_API_KEY environment variable:',
          '   export OPENAI_API_KEY="sk-..."',
          '4. Or use `puppet-master login codex` to save to .env',
        ],
        claude: [
          '1. Visit https://console.anthropic.com/settings/keys',
          '2. Create a new API key',
          '3. Set ANTHROPIC_API_KEY environment variable:',
          '   export ANTHROPIC_API_KEY="sk-ant-..."',
          '4. Or use `puppet-master login claude` to save to .env',
        ],
        gemini: [
          '1. Visit https://aistudio.google.com/app/apikey',
          '2. Create a new API key',
          '3. Set GEMINI_API_KEY environment variable:',
          '   export GEMINI_API_KEY="AIza..."',
          '4. Or use `puppet-master login gemini` to save to .env',
        ],
        copilot: [
          '1. Run `copilot /login` in your terminal',
          '2. Follow the browser authentication flow',
          '3. Alternatively, set GH_TOKEN with Copilot permissions:',
          '   export GH_TOKEN="ghp_..."',
          '4. Or use `puppet-master login copilot` for guidance',
        ],
      };

      res.json({
        platform: normalizedPlatform,
        description: config.description,
        envVar: config.envVar || 'N/A (CLI-based auth)',
        getUrl: config.getUrl,
        instructions: instructions[normalizedPlatform],
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to get instructions',
        code: 'INSTRUCTIONS_ERROR',
      } as ErrorResponse);
    }
  });

  return router;
}
