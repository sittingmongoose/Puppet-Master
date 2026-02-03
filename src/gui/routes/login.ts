/**
 * Login API routes for RWM Puppet Master GUI
 * 
 * Provides REST endpoints for platform authentication status and management.
 * Feature parity with CLI `puppet-master login` command.
 */

import type { Router, Request, Response } from 'express';
import { Router as createRouter } from 'express';
import { spawn, execSync } from 'node:child_process';
import { homedir } from 'node:os';
import path from 'node:path';
import { join } from 'node:path';
import type { Platform } from '../../types/config.js';
import { getPlatformAuthStatus, type PlatformAuthStatus } from '../../platforms/auth-status.js';

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
/** Platforms that can trigger login (includes 'github' for Git config, not in PLATFORMS) */
const LOGIN_PLATFORMS: string[] = [...PLATFORMS, 'github'];

/**
 * Check if a CLI command is available in PATH.
 * Uses 'which' on Unix-like systems, 'where' on Windows.
 * @param command - Command name to check
 * @param enrichedPath - Optional enriched PATH to use
 * @returns true if command exists, false otherwise
 */
function isCommandAvailable(command: string, enrichedPath?: string): boolean {
  try {
    const env = enrichedPath ? { ...process.env, PATH: enrichedPath } : process.env;
    const whichCmd = process.platform === 'win32' ? 'where' : 'which';
    execSync(`${whichCmd} ${command}`, { 
      stdio: 'ignore',
      env,
    });
    return true;
  } catch {
    return false;
  }
}

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
  router.get('/login/status/*', async (req: Request, res: Response) => {
    try {
      const platform = (req.params[0] ?? '').split('/')[0];
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
  router.get('/login/instructions/*', async (req: Request, res: Response) => {
    try {
      const platform = (req.params[0] ?? '').split('/')[0];
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

  /**
   * POST /api/login/:platform
   * Trigger CLI-based login for a platform (fire-and-forget).
   *
   * Spawns the platform's native login command which typically opens a browser.
   * The response is returned immediately — the caller should poll /api/login/status
   * to detect when authentication completes.
   */
  router.post('/login/*', async (req: Request, res: Response) => {
    try {
      const platform = (req.params[0] ?? '').split('/')[0];
      const normalizedPlatform = platform.toLowerCase() as Platform | 'github';

      if (!LOGIN_PLATFORMS.includes(normalizedPlatform)) {
        res.status(400).json({
          success: false,
          error: `Invalid platform: ${platform}`,
          code: 'INVALID_PLATFORM',
          validPlatforms: LOGIN_PLATFORMS,
        });
        return;
      }

      // Cursor has no CLI login — advise user to open the app
      if (normalizedPlatform === 'cursor') {
        res.json({
          success: true,
          message: 'Cursor uses app-based authentication. Open the Cursor IDE and sign in through Settings > Account.',
        });
        return;
      }

      // Map platform to CLI login command + args (github = Git config via gh, not Copilot)
      const loginCommands: Record<string, { cmd: string; args: string[] }> = {
        claude:  { cmd: 'claude',  args: ['login'] },
        codex:   { cmd: 'codex',   args: ['login'] },
        gemini:  { cmd: 'gemini',  args: ['auth', 'login'] },
        copilot: { cmd: 'gh',      args: ['auth', 'login', '--web'] },
        github:  { cmd: 'gh',      args: ['auth', 'login', '--web'] },
      };

      const loginCmd = loginCommands[normalizedPlatform];
      if (!loginCmd) {
        res.status(400).json({
          success: false,
          error: `No CLI login command available for ${normalizedPlatform}.`,
          code: 'NO_LOGIN_COMMAND',
        });
        return;
      }

      // Build enriched PATH (same pattern as installation-manager.ts)
      const home = homedir();
      const npmGlobalPrefix = home ? path.join(home, '.npm-global') : '';
      const npmGlobalBin = npmGlobalPrefix
        ? (process.platform === 'win32' ? npmGlobalPrefix : path.join(npmGlobalPrefix, 'bin'))
        : '';
      const extraPaths = [
        npmGlobalBin,
        '/usr/local/bin',
        '/opt/homebrew/bin',
        '/opt/homebrew/sbin',
        join(home, '.local', 'bin'),
      ];
      const currentPath = process.env.PATH || '/usr/bin:/bin';
      const enrichedPath = [currentPath, ...extraPaths].filter(Boolean).join(path.delimiter);
      const env: NodeJS.ProcessEnv = { ...process.env, PATH: enrichedPath };
      if (npmGlobalPrefix) {
        env.HOME = home;
        env.npm_config_prefix = npmGlobalPrefix;
        env.NPM_CONFIG_PREFIX = npmGlobalPrefix;
        if (npmGlobalBin) {
          env.PATH = [npmGlobalBin, env.PATH].filter(Boolean).join(path.delimiter);
        }
      }

      // Validate CLI command is available BEFORE spawning
      if (!isCommandAvailable(loginCmd.cmd, enrichedPath)) {
        const config = normalizedPlatform !== 'github' ? PLATFORM_AUTH_CONFIG[normalizedPlatform as Platform] : undefined;
        const message = normalizedPlatform === 'github'
          ? 'GitHub CLI (gh) is not installed or not in PATH. Install it from https://cli.github.com/'
          : `The ${normalizedPlatform} CLI is not installed or not in PATH.`;
        res.status(400).json({
          success: false,
          error: `CLI command '${loginCmd.cmd}' not found in PATH`,
          code: 'CLI_NOT_FOUND',
          details: message,
          fixSuggestion: config ? `Install the ${normalizedPlatform} CLI first, or set ${config.envVar || 'the API key'} directly.` : 'Install gh from https://cli.github.com/',
          envVar: config?.envVar || undefined,
          getUrl: config?.getUrl || 'https://cli.github.com/',
        });
        return;
      }

      // Launch interactive logins in a real terminal window (gh/codex/claude/gemini need TTY).
      // Keep window open with explicit "read" so user can see output and close with Enter.
      const commandLine = `${loginCmd.cmd} ${loginCmd.args.join(' ')}`;
      const keepOpenScript = `export PATH="${enrichedPath}"; ${commandLine}; echo; echo 'Press Enter to close...'; read x`;

      const launchInTerminal = (): boolean => {
        try {
          if (process.platform === 'win32') {
            const child = spawn('cmd', ['/K', commandLine], { detached: true, stdio: 'ignore', env });
            child.unref();
            return true;
          }

          if (process.platform === 'darwin') {
            const appleScript = `tell application "Terminal"\nactivate\ndo script ${JSON.stringify(keepOpenScript)}\nend tell`;
            const child = spawn('osascript', ['-e', appleScript], { detached: true, stdio: 'ignore', env });
            child.unref();
            return true;
          }

          // linux: use read x to keep window open; konsole uses --noclose (some versions don't support --hold)
          const terminals: Array<{ cmd: string; args: string[] }> = [
            { cmd: 'x-terminal-emulator', args: ['-e', 'bash', '-lc', keepOpenScript] },
            { cmd: 'gnome-terminal', args: ['--', 'bash', '-lc', keepOpenScript] },
            { cmd: 'konsole', args: ['--noclose', '-e', 'bash', '-lc', keepOpenScript] },
            { cmd: 'xterm', args: ['-hold', '-e', 'bash', '-lc', keepOpenScript] },
            { cmd: 'xfce4-terminal', args: ['-e', 'bash', '-lc', keepOpenScript] },
          ];

          for (const t of terminals) {
            if (isCommandAvailable(t.cmd, enrichedPath)) {
              const child = spawn(t.cmd, t.args, { detached: true, stdio: 'ignore', env });
              child.unref();
              return true;
            }
          }
        } catch (err) {
          console.error(`[login] Failed to launch terminal for ${normalizedPlatform}:`, err);
        }
        return false;
      };

      if (!launchInTerminal()) {
        // Fallback: fire-and-forget spawn (may fail without TTY)
        const child = spawn(loginCmd.cmd, loginCmd.args, {
          shell: true,
          detached: true,
          stdio: 'ignore',
          env,
        });
        child.unref();
      }

      // Get the config URL for this platform (github is not in PLATFORM_AUTH_CONFIG)
      const config = normalizedPlatform !== 'github' ? PLATFORM_AUTH_CONFIG[normalizedPlatform as Platform] : undefined;

      res.json({
        success: true,
        message: normalizedPlatform === 'github'
          ? 'GitHub login initiated. A browser window should open to complete authentication for Git.'
          : `Login initiated for ${normalizedPlatform}. A browser window should open shortly to complete authentication.`,
        note: 'Poll /api/login/status to detect when authentication completes.',
        authUrl: config?.getUrl ?? (normalizedPlatform === 'github' ? 'https://github.com' : undefined),
        command: `${loginCmd.cmd} ${loginCmd.args.join(' ')}`,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        error: err.message || `Failed to initiate login`,
        code: 'LOGIN_SPAWN_ERROR',
      });
    }
  });

  return router;
}
