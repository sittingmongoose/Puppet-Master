/**
 * Login API routes for RWM Puppet Master GUI
 * 
 * Provides REST endpoints for platform authentication status and management.
 * Feature parity with CLI `puppet-master login` command.
 */

import type { Router, Request, Response } from 'express';
import { Router as createRouter } from 'express';
import { spawn, execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
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

interface LoginCommand {
  cmd: string;
  args: string[];
}

/**
 * Platform authentication configuration
 */
const PLATFORM_AUTH_CONFIG: Record<Platform, { envVar: string; getUrl: string; description: string }> = {
  cursor: {
    envVar: 'CURSOR_API_KEY',
    getUrl: 'https://cursor.com',
    description: 'Cursor Agent supports interactive login (`agent login`) or CURSOR_API_KEY for headless usage.',
  },
  codex: {
    envVar: 'OPENAI_API_KEY',
    getUrl: 'https://platform.openai.com/api-keys',
    description: 'OpenAI API key for Codex CLI.',
  },
  claude: {
    envVar: 'ANTHROPIC_API_KEY',
    getUrl: 'https://console.anthropic.com/settings/keys',
    description: 'Claude Code supports subscription login (setup-token) or API keys.',
  },
  gemini: {
    envVar: 'GEMINI_API_KEY',
    getUrl: 'https://github.com/google-gemini/gemini-cli',
    description: 'Gemini CLI supports interactive OAuth login (recommended) or API keys.',
  },
  copilot: {
    envVar: 'GH_TOKEN',
    getUrl: 'https://docs.github.com/copilot/how-tos/set-up/installing-github-copilot-in-the-cli',
    description: 'GitHub Copilot CLI authentication (interactive login recommended).',
  },
};

const PLATFORMS: Platform[] = ['cursor', 'codex', 'claude', 'gemini', 'copilot'];
/** Platforms that can trigger login (includes 'github' for Git config, not in PLATFORMS) */
const LOGIN_PLATFORMS: string[] = [...PLATFORMS, 'github'];

/** Platforms that support CLI logout: command + args (e.g. gh auth logout, codex logout) */
const LOGOUT_COMMANDS: Record<string, { cmd: string; args: string[] }> = {
  github:  { cmd: 'gh',   args: ['auth', 'logout'] },
  copilot: { cmd: 'gh',   args: ['auth', 'logout'] },
  cursor:  { cmd: 'agent', args: ['logout'] },
  codex:   { cmd: 'codex', args: ['logout'] },
};

/**
 * Build OS-appropriate extra PATH directories for finding CLI tools (e.g. gh).
 * Includes common install locations on Linux, macOS, and Windows so login/logout
 * work when the process has a minimal PATH (e.g. launched from desktop shortcut).
 */
function getExtraPathDirectories(home: string, npmGlobalBin: string): string[] {
  const isWin = process.platform === 'win32';
  const base = [
    npmGlobalBin,
    home ? join(home, 'bin') : '',
  ].filter(Boolean);

  if (isWin) {
    const programFiles = process.env['ProgramFiles'] || process.env['PROGRAMFILES'] || 'C:\\Program Files';
    const localAppData = process.env['LOCALAPPDATA'] || (home ? join(home, 'AppData', 'Local') : '');
    const appData = process.env['APPDATA'] || (home ? join(home, 'AppData', 'Roaming') : '');
    const programData = process.env['ProgramData'] || process.env['PROGRAMDATA'] || 'C:\\ProgramData';
    return [
      ...base,
      // npm default global bin on Windows
      appData ? join(appData, 'npm') : '',
      join(programFiles, 'GitHub CLI'),
      localAppData ? join(localAppData, 'GitHub CLI') : '',
      join(programData, 'chocolatey', 'bin'),
      home ? join(home, 'scoop', 'shims') : '',
    ].filter(Boolean);
  }

  // Linux and macOS
  const unixPaths = [
    '/usr/local/bin',
    '/opt/homebrew/bin',
    '/opt/homebrew/sbin',
    home ? join(home, '.local', 'bin') : '',
    home ? join(home, '.volta', 'bin') : '',
    home ? join(home, '.asdf', 'shims') : '',
    '/snap/bin',
    ...base,
  ];
  return unixPaths.filter(Boolean);
}

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

function getGhHostsPath(home: string): string | null {
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || (home ? join(home, 'AppData', 'Roaming') : '');
    if (!appData) return null;
    return join(appData, 'GitHub CLI', 'hosts.yml');
  }
  return home ? join(home, '.config', 'gh', 'hosts.yml') : null;
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
   * Uses LOGIN_PLATFORMS so 'github' is valid (Git auth via gh).
   */
  router.get('/login/status/*', async (req: Request, res: Response) => {
    try {
      const platform = (req.params[0] ?? '').split('/')[0];
      const normalizedPlatform = platform.toLowerCase() as Platform | 'github';

      if (!LOGIN_PLATFORMS.includes(normalizedPlatform)) {
        console.debug('[login] GET /login/status/* rejected platform', { method: req.method, path: req.path, platform: normalizedPlatform });
        res.status(400).json({
          error: `Invalid platform: ${platform}`,
          code: 'INVALID_PLATFORM',
          validPlatforms: LOGIN_PLATFORMS,
        } as ErrorResponse & { validPlatforms: string[] });
        return;
      }

      if (normalizedPlatform === 'github') {
        // Synthetic status for GitHub (Git auth via gh) – not in PLATFORM_AUTH_CONFIG
        let status: PlatformAuthStatus = 'not_authenticated';
        let details = 'Git auth via GitHub CLI (gh). Use Login to GitHub to authenticate.';
        const home = homedir();
        const npmGlobalPrefix = home ? path.join(home, '.npm-global') : '';
        const npmGlobalBin = npmGlobalPrefix
          ? (process.platform === 'win32' ? npmGlobalPrefix : path.join(npmGlobalPrefix, 'bin'))
          : '';
        const extraPaths = getExtraPathDirectories(home || '', npmGlobalBin);
        const defaultPath = process.platform === 'win32' ? 'C:\\Windows\\System32' : '/usr/bin:/bin';
        const currentPath = process.env.PATH || process.env.Path || defaultPath;
        const enrichedPath = [currentPath, ...extraPaths].filter(Boolean).join(path.delimiter);
        if (isCommandAvailable('gh', enrichedPath)) {
          const hostsPath = getGhHostsPath(home || '');
          if (hostsPath && existsSync(hostsPath)) {
            status = 'authenticated';
            details = 'GitHub CLI (gh) appears authenticated (hosts.yml present).';
          } else {
            status = 'not_authenticated';
            details = 'GitHub CLI (gh) is installed, but not authenticated.';
          }
        } else {
          details = 'GitHub CLI (gh) is not installed or not in PATH.';
        }
        res.json({
          platform: 'github',
          status,
          details,
          fixSuggestion: status === 'not_authenticated' ? 'Run Login to GitHub or: gh auth login --web' : undefined,
          getUrl: 'https://cli.github.com/',
          description: 'Git authentication via GitHub CLI for push/pull.',
        });
        return;
      }

      const authStatus = getPlatformAuthStatus(normalizedPlatform as Platform);
      const config = PLATFORM_AUTH_CONFIG[normalizedPlatform as Platform];

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
   * Uses LOGIN_PLATFORMS so 'github' is valid.
   */
  router.get('/login/instructions/*', async (req: Request, res: Response) => {
    try {
      const platform = (req.params[0] ?? '').split('/')[0];
      const normalizedPlatform = platform.toLowerCase() as Platform | 'github';

      if (!LOGIN_PLATFORMS.includes(normalizedPlatform)) {
        res.status(400).json({
          error: `Invalid platform: ${platform}`,
          code: 'INVALID_PLATFORM',
          validPlatforms: LOGIN_PLATFORMS,
        } as ErrorResponse & { validPlatforms: string[] });
        return;
      }

      if (normalizedPlatform === 'github') {
        res.json({
          platform: 'github',
          description: 'Git authentication via GitHub CLI for push/pull.',
          envVar: 'N/A (CLI-based auth)',
          getUrl: 'https://cli.github.com/',
          instructions: [
            '1. Install GitHub CLI from https://cli.github.com/',
            '2. Run: gh auth login --web',
            '3. Complete authentication in the browser',
            '4. Or use the Login page "LOGIN TO GITHUB" button',
          ],
        });
        return;
      }

      const config = PLATFORM_AUTH_CONFIG[normalizedPlatform as Platform];

      // Platform-specific instructions
      const instructions: Record<Platform, string[]> = {
        cursor: [
          '1. Run: agent login',
          '2. Complete the browser/device authentication flow',
          '3. Verify with: agent status',
          '4. Optional fallback: set CURSOR_API_KEY for headless/CI usage',
        ],
        codex: [
          '1. Run: codex login',
          '2. Complete the browser/device authentication flow',
          '3. Verify with: codex --help',
          '4. Optional fallback: set OPENAI_API_KEY in your environment',
        ],
        claude: [
          '1. Run: claude setup-token',
          '2. Complete the subscription authentication flow (browser/device)',
          '3. Verify with: claude --version',
          '4. Optional fallback: set ANTHROPIC_API_KEY (API key auth)',
        ],
        gemini: [
          '1. Run: gemini',
          '2. Choose "Login with Google" and complete OAuth in your browser',
          '3. Verify with: gemini --help',
          '4. Optional fallback: set GEMINI_API_KEY or GOOGLE_API_KEY',
        ],
        copilot: [
          '1. Run `copilot login` in your terminal',
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
   * Validation uses LOGIN_PLATFORMS (includes 'github'); 400 responses return validPlatforms: LOGIN_PLATFORMS.
   *
   * Spawns the platform's native login command which typically opens a browser.
   * The response is returned immediately — the caller should poll /api/login/status
   * to detect when authentication completes.
   */
  router.post('/login/*', async (req: Request, res: Response) => {
    try {
      const pathSegments = (req.params[0] ?? '').split('/').filter(Boolean);
      const platformSegment = pathSegments[0] ?? '';
      const action = pathSegments[1]?.toLowerCase();
      const normalizedPlatform = platformSegment.toLowerCase() as Platform | 'github';

      // POST /api/login/:platform/logout — run CLI logout where supported
      if (action === 'logout') {
        if (!LOGIN_PLATFORMS.includes(normalizedPlatform)) {
          res.status(400).json({
            success: false,
            error: `Invalid platform: ${platformSegment}`,
            code: 'INVALID_PLATFORM',
            validPlatforms: LOGIN_PLATFORMS,
          });
          return;
        }
        const logoutCmd = LOGOUT_COMMANDS[normalizedPlatform];
        if (!logoutCmd) {
          res.status(400).json({
            success: false,
            error: `Logout not supported for ${normalizedPlatform}. Supported: ${Object.keys(LOGOUT_COMMANDS).join(', ')}.`,
            code: 'LOGOUT_NOT_SUPPORTED',
          });
          return;
        }
        const home = homedir();
        const npmGlobalPrefix = home ? path.join(home, '.npm-global') : '';
        const npmGlobalBin = npmGlobalPrefix
          ? (process.platform === 'win32' ? npmGlobalPrefix : path.join(npmGlobalPrefix, 'bin'))
          : '';
        const extraPaths = getExtraPathDirectories(home || '', npmGlobalBin);
        const defaultPath = process.platform === 'win32' ? 'C:\\Windows\\System32' : '/usr/bin:/bin';
        const currentPath = process.env.PATH || process.env.Path || defaultPath;
        const enrichedPath = [currentPath, ...extraPaths].filter(Boolean).join(path.delimiter);
        const env: NodeJS.ProcessEnv = { ...process.env, PATH: enrichedPath };
        if (npmGlobalPrefix) {
          env.HOME = home;
          env.NPM_CONFIG_PREFIX = npmGlobalPrefix;
          // Do not force-prepend npmGlobalBin: ordering matters when duplicate CLIs exist
          // (e.g. /usr/local/bin/gemini newer than ~/.npm-global/bin/gemini on macOS).
        }
        if (!isCommandAvailable(logoutCmd.cmd, enrichedPath)) {
          res.status(400).json({
            success: false,
            error: `CLI '${logoutCmd.cmd}' not found. Install it to log out.`,
            code: 'CLI_NOT_FOUND',
          });
          return;
        }
        await new Promise<void>((resolve, reject) => {
          const child = spawn(logoutCmd.cmd, logoutCmd.args, {
            stdio: ['ignore', 'pipe', 'pipe'],
            env,
          });
          child.on('close', () => resolve()); // Idempotent: already logged out is still success
          child.on('error', reject);
        });
        res.json({ success: true, message: `Logged out from ${normalizedPlatform}.` });
        return;
      }

      // Login flow below
      const platform = platformSegment;
      if (!LOGIN_PLATFORMS.includes(normalizedPlatform)) {
        console.debug('[login] POST /login/* rejected platform', { method: req.method, path: req.path, platform: normalizedPlatform });
        res.status(400).json({
          success: false,
          error: `Invalid platform: ${platform}`,
          code: 'INVALID_PLATFORM',
          validPlatforms: LOGIN_PLATFORMS,
        });
        return;
      }

      // Cursor has no CLI login — advise user to open the app
      // Preferred login command candidates per platform (first available command wins).
      const loginCommands: Record<string, LoginCommand[]> = {
        cursor: [
          { cmd: 'agent', args: ['login'] },
          { cmd: 'cursor-agent', args: ['login'] },
        ],
        // Claude Code uses `setup-token` for subscription-based login.
        // Some environments may still rely on ANTHROPIC_API_KEY (no CLI "login" subcommand).
        claude: [{ cmd: 'claude', args: ['setup-token'] }],
        codex: [
          { cmd: 'codex', args: ['login'] },
          { cmd: 'codex', args: ['login', '--device-auth'] },
        ],
        gemini: [
          { cmd: 'gemini', args: [] },
        ],
        copilot: [
          // Preferred: Copilot CLI-native login flow.
          { cmd: 'copilot', args: ['login'] },
          // Fallback: authenticate via GitHub CLI if available.
          { cmd: 'gh', args: ['auth', 'login', '--web'] },
        ],
        github: [{ cmd: 'gh', args: ['auth', 'login', '--web'] }],
      };

      const loginCandidates = loginCommands[normalizedPlatform];
      if (!loginCandidates || loginCandidates.length === 0) {
        res.status(400).json({
          success: false,
          error: `No CLI login command available for ${normalizedPlatform}.`,
          code: 'NO_LOGIN_COMMAND',
        });
        return;
      }

      // Build enriched PATH (same pattern as installation-manager.ts); OS-specific for Linux, macOS, Windows.
      const home = homedir();
      const npmGlobalPrefix = home ? path.join(home, '.npm-global') : '';
      const npmGlobalBin = npmGlobalPrefix
        ? (process.platform === 'win32' ? npmGlobalPrefix : path.join(npmGlobalPrefix, 'bin'))
        : '';
      const extraPaths = getExtraPathDirectories(home || '', npmGlobalBin);
      const defaultPath = process.platform === 'win32' ? 'C:\\Windows\\System32' : '/usr/bin:/bin';
      const currentPath = process.env.PATH || process.env.Path || defaultPath;
      const enrichedPath = [currentPath, ...extraPaths].filter(Boolean).join(path.delimiter);
      const env: NodeJS.ProcessEnv = { ...process.env, PATH: enrichedPath };
      if (npmGlobalPrefix) {
        env.HOME = home;
        env.npm_config_prefix = npmGlobalPrefix;
        env.NPM_CONFIG_PREFIX = npmGlobalPrefix;
        // Do not force-prepend npmGlobalBin: ordering matters when duplicate CLIs exist.
      }

      const loginCmd = loginCandidates.find((candidate) =>
        isCommandAvailable(candidate.cmd, enrichedPath)
      );

      // Validate that at least one compatible command is available before spawning.
      if (!loginCmd) {
        const config = normalizedPlatform !== 'github' ? PLATFORM_AUTH_CONFIG[normalizedPlatform as Platform] : undefined;
        const message = normalizedPlatform === 'github'
          ? 'GitHub CLI (gh) is not installed or not in PATH. Install it from https://cli.github.com/'
          : `No compatible ${normalizedPlatform} login CLI was found in PATH.`;
        res.status(400).json({
          success: false,
          error: `No login CLI command found in PATH for ${normalizedPlatform}`,
          code: 'CLI_NOT_FOUND',
          checkedCommands: loginCandidates.map((candidate) => candidate.cmd),
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

      const terminalLaunched = launchInTerminal();
      if (!terminalLaunched) {
        console.debug('[login] Terminal launch failed for', normalizedPlatform, '- using fallback spawn (no visible window may open)');
        // Fallback: fire-and-forget spawn (may fail without TTY)
        const child = spawn(loginCmd.cmd, loginCmd.args, {
          shell: true,
          detached: true,
          stdio: 'ignore',
          env,
        });
        child.unref();
      }

      // Always include authUrl so user can open manually if terminal/browser did not open
      const config = normalizedPlatform !== 'github' ? PLATFORM_AUTH_CONFIG[normalizedPlatform as Platform] : undefined;
      const authUrl = config?.getUrl ?? (normalizedPlatform === 'github' ? 'https://github.com' : undefined);

      res.json({
        success: true,
        message: normalizedPlatform === 'github'
          ? 'GitHub login initiated. A browser window should open to complete authentication for Git.'
          : `Login initiated for ${normalizedPlatform}. A browser window should open shortly to complete authentication.`,
        note: 'Poll /api/login/status to detect when authentication completes.',
        authUrl: authUrl ?? undefined,
        terminalLaunched,
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
