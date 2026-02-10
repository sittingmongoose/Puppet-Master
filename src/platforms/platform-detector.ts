/**
 * Platform Detector Service for RWM Puppet Master
 * 
 * Detects which platforms are installed and available for use.
 * Used by first boot wizard and config page to filter available platforms.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { delimiter, join } from 'node:path';
import type { Platform } from '../types/config.js';
import type { CliPathsConfig } from '../types/config.js';
import { getCursorCommandCandidates, resolvePlatformCommand } from './constants.js';

/**
 * CLI invocation structure
 */
interface CliInvocation {
  command: string;
  argsPrefix?: string[];
}

/**
 * Result of probing a CLI invocation.
 */
interface CliProbeResult {
  /** True when the command could be spawned (i.e. not ENOENT). */
  installed: boolean;
  /** True when the probe exited 0. */
  runnable: boolean;
  version?: string;
  stdout?: string;
  stderr?: string;
  error?: string;
}

/**
 * Probe a CLI command:
 * - installed: command is present/spawnable (ENOENT => false)
 * - runnable: probe exited successfully (exit code 0)
 */
async function checkCliAvailable(
  invocation: CliInvocation,
  args: string[] = ['--version'],
  timeout: number = 10000,
  env?: NodeJS.ProcessEnv
): Promise<CliProbeResult> {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (result: CliProbeResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const proc: ChildProcess = spawn(invocation.command, [...(invocation.argsPrefix ?? []), ...args], {
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: env ?? process.env,
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      proc.kill('SIGKILL');
      settle({
        installed: true,
        runnable: false,
        stdout,
        stderr,
        error: `Command timed out after ${timeout}ms`,
      });
    }, timeout);

    proc.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        const out = stdout.trim();
        const version = out.split('\n')[0]?.trim();
        settle({
          installed: true,
          runnable: true,
          version: version || 'unknown',
          stdout,
          stderr,
        });
        return;
      }

      settle({
        installed: true,
        runnable: false,
        stdout,
        stderr,
        error: `Command exited with code ${code ?? 'unknown'}${stderr ? `: ${stderr.trim()}` : ''}`,
      });
    });

    proc.on('error', (error) => {
      clearTimeout(timer);
      const errno = error as NodeJS.ErrnoException;
      const installed = errno.code !== 'ENOENT';
      settle({
        installed,
        runnable: false,
        stdout,
        stderr,
        error: error.message,
      });
    });
  });
}

/**
 * Platform installation status
 */
export interface PlatformRequirement {
  kind: 'node';
  requiredMajor: number;
  currentMajor?: number;
}

export interface PlatformStatus {
  /** Platform identifier */
  platform: Platform;
  /** Whether the platform CLI is installed (spawnable). */
  installed: boolean;
  /** Whether the platform CLI probe succeeded (exit 0). */
  runnable: boolean;
  /** Version string if available */
  version?: string;
  /** Error message if not installed */
  error?: string;
  /** Runtime/tooling requirements which block runnable=true (e.g. Node major mismatch). */
  requirements?: PlatformRequirement[];
  /** Whether platform is authenticated (for platforms that require auth) */
  authenticated?: boolean;
  /** Command that was used to detect the platform */
  command?: string;
}

/**
 * Result of platform detection
 */
export interface PlatformDetectionResult {
  /** Status for each platform */
  platforms: Record<Platform, PlatformStatus>;
  /** List of runnable (ready-to-use) platforms */
  installedPlatforms: Platform[];
  /** List of uninstalled platforms */
  uninstalledPlatforms: Platform[];
}

/**
 * Platform Detector Service
 * 
 * Detects which platforms are installed by checking CLI availability.
 */
export class PlatformDetector {
  private cache: Map<Platform, PlatformStatus> | null = null;
  private cacheTimestamp: number = 0;
  private readonly cacheTTL = 60_000; // 1 minute cache

  constructor(private readonly cliPaths: CliPathsConfig) {}

  /**
   * Detect installation status for all platforms
   * 
   * @param forceRefresh - If true, bypass cache and check again
   * @returns Platform detection result with status for each platform
   */
  async detectInstalledPlatforms(forceRefresh = false): Promise<PlatformDetectionResult> {
    // Use cache if available and not expired
    if (!forceRefresh && this.cache && Date.now() - this.cacheTimestamp < this.cacheTTL) {
      return this.buildResult(this.cache);
    }

    // Run checks concurrently. Sequential checks can take 60s+ when CLIs are missing
    // (each probe times out), which causes severe GUI slowdowns and onboarding hangs.
    const [cursor, codex, claude, gemini, copilot] = await Promise.all([
      this.detectCursor(),
      this.detectCodex(),
      this.detectClaude(),
      this.detectGemini(),
      this.detectCopilot(),
    ]);

    const platforms: Record<Platform, PlatformStatus> = { cursor, codex, claude, gemini, copilot };

    // Update cache
    this.cache = new Map(Object.entries(platforms) as [Platform, PlatformStatus][]);
    this.cacheTimestamp = Date.now();

    return this.buildResult(this.cache);
  }

  /**
   * Get installation status for a specific platform
   * 
   * @param platform - Platform to check
   * @param forceRefresh - If true, bypass cache
   * @returns Platform status
   */
  async getPlatformStatus(platform: Platform, forceRefresh = false): Promise<PlatformStatus> {
    const result = await this.detectInstalledPlatforms(forceRefresh);
    return result.platforms[platform];
  }

  /**
   * Get list of installed platforms
   * 
   * @param forceRefresh - If true, bypass cache
   * @returns Array of installed platform identifiers
   */
  async getInstalledPlatforms(forceRefresh = false): Promise<Platform[]> {
    const result = await this.detectInstalledPlatforms(forceRefresh);
    return result.installedPlatforms;
  }

  /**
   * Check if a specific platform is installed
   * 
   * @param platform - Platform to check
   * @param forceRefresh - If true, bypass cache
   * @returns True if platform is installed
   */
  async isPlatformInstalled(platform: Platform, forceRefresh = false): Promise<boolean> {
    const status = await this.getPlatformStatus(platform, forceRefresh);
    return status.installed;
  }

  /**
   * Build result object from platform status map
   */
  private buildResult(statusMap: Map<Platform, PlatformStatus>): PlatformDetectionResult {
    const platforms: Record<Platform, PlatformStatus> = {
      cursor: statusMap.get('cursor')!,
      codex: statusMap.get('codex')!,
      claude: statusMap.get('claude')!,
      gemini: statusMap.get('gemini')!,
      copilot: statusMap.get('copilot')!,
    };

    const installedPlatforms: Platform[] = [];
    const uninstalledPlatforms: Platform[] = [];

    for (const [platform, status] of statusMap.entries()) {
      // "installedPlatforms" is semantically "runnable platforms" for GUI onboarding UX.
      if (status.runnable) {
        installedPlatforms.push(platform);
      }
      if (!status.installed) {
        uninstalledPlatforms.push(platform);
      }
    }

    return {
      platforms,
      installedPlatforms,
      uninstalledPlatforms,
    };
  }

  /**
   * Detect Cursor CLI installation
   */
  private async detectCursor(): Promise<PlatformStatus> {
    const env = this.getEnrichedEnv();
    const candidates: CliInvocation[] = getCursorCommandCandidates(this.cliPaths).map((c) => ({
      command: c,
    }));

    let installedButNotRunnable: PlatformStatus | null = null;
    for (const candidate of candidates) {
      const result = await checkCliAvailable(candidate, ['--version'], 10_000, env);
      if (result.runnable) {
        return {
          platform: 'cursor',
          installed: true,
          runnable: true,
          version: result.version,
          command: candidate.command,
        };
      }

      if (result.installed && !installedButNotRunnable) {
        installedButNotRunnable = {
          platform: 'cursor',
          installed: true,
          runnable: false,
          error: result.error || 'Cursor CLI installed but not runnable',
          command: [candidate.command, ...(candidate.argsPrefix ?? []), '--version'].join(' '),
        };
      }
    }

    if (installedButNotRunnable) {
      return installedButNotRunnable;
    }

    return {
      platform: 'cursor',
      installed: false,
      runnable: false,
      error: 'Cursor CLI not found',
    };
  }

  /**
   * Detect Codex CLI installation
   */
  private async detectCodex(): Promise<PlatformStatus> {
    const env = this.getEnrichedEnv();
    const candidates: CliInvocation[] = [];
    const configured = resolvePlatformCommand('codex', this.cliPaths);
    if (this.cliPaths.codex && this.cliPaths.codex.trim() !== '') {
      candidates.push({ command: configured });
    } else {
      candidates.push({ command: configured });
      candidates.push({ command: 'npx', argsPrefix: ['--no-install', 'codex'] });
    }

    let installedButNotRunnable: PlatformStatus | null = null;
    for (const candidate of candidates) {
      const result = await checkCliAvailable(candidate, ['--version'], 15_000, env);
      if (result.runnable) {
        return {
          platform: 'codex',
          installed: true,
          runnable: true,
          version: result.version,
          command: candidate.command,
        };
      }

      // For npx fallbacks, only treat as installed when runnable (otherwise npx may exist but codex does not).
      if (candidate.command === 'npx') {
        continue;
      }

      if (result.installed && !installedButNotRunnable) {
        installedButNotRunnable = {
          platform: 'codex',
          installed: true,
          runnable: false,
          error: result.error || 'Codex CLI installed but not runnable',
          command: [candidate.command, ...(candidate.argsPrefix ?? []), '--version'].join(' '),
        };
      }
    }

    if (installedButNotRunnable) {
      return installedButNotRunnable;
    }

    return {
      platform: 'codex',
      installed: false,
      runnable: false,
      error: 'Codex CLI not found',
    };
  }

  /**
   * Detect Claude CLI installation
   */
  private async detectClaude(): Promise<PlatformStatus> {
    const env = this.getEnrichedEnv();
    const candidates: CliInvocation[] = [];
    const configured = resolvePlatformCommand('claude', this.cliPaths);
    if (this.cliPaths.claude && this.cliPaths.claude.trim() !== '') {
      candidates.push({ command: configured });
    } else {
      candidates.push({ command: configured });
      candidates.push({ command: 'npx', argsPrefix: ['--no-install', '@anthropic-ai/claude'] });
    }

    let installedButNotRunnable: PlatformStatus | null = null;
    for (const candidate of candidates) {
      const result = await checkCliAvailable(candidate, ['--version'], 15_000, env);
      if (result.runnable) {
        return {
          platform: 'claude',
          installed: true,
          runnable: true,
          version: result.version,
          command: candidate.command,
        };
      }

      if (candidate.command === 'npx') {
        continue;
      }

      if (result.installed && !installedButNotRunnable) {
        installedButNotRunnable = {
          platform: 'claude',
          installed: true,
          runnable: false,
          error: result.error || 'Claude CLI installed but not runnable',
          command: [candidate.command, ...(candidate.argsPrefix ?? []), '--version'].join(' '),
        };
      }
    }

    if (installedButNotRunnable) {
      return installedButNotRunnable;
    }

    return {
      platform: 'claude',
      installed: false,
      runnable: false,
      error: 'Claude CLI not found',
    };
  }

  /**
   * Detect Gemini CLI installation
   */
  private async detectGemini(): Promise<PlatformStatus> {
    const env = this.getEnrichedEnv();
    const candidates: CliInvocation[] = [];
    const configured = resolvePlatformCommand('gemini', this.cliPaths);
    if (this.cliPaths.gemini && this.cliPaths.gemini.trim() !== '') {
      candidates.push({ command: configured });
    } else {
      candidates.push({ command: configured });
      candidates.push({ command: 'npx', argsPrefix: ['--no-install', '@google/gemini-cli'] });
    }

    let installedButNotRunnable: PlatformStatus | null = null;
    for (const candidate of candidates) {
      const result = await checkCliAvailable(candidate, ['--version'], 15_000, env);
      if (result.runnable) {
        return {
          platform: 'gemini',
          installed: true,
          runnable: true,
          version: result.version,
          command: candidate.command,
        };
      }

      if (candidate.command === 'npx') {
        continue;
      }

      if (result.installed && !installedButNotRunnable) {
        installedButNotRunnable = {
          platform: 'gemini',
          installed: true,
          runnable: false,
          error: result.error || 'Gemini CLI installed but not runnable',
          command: [candidate.command, ...(candidate.argsPrefix ?? []), '--version'].join(' '),
        };
      }
    }

    if (installedButNotRunnable) {
      return installedButNotRunnable;
    }

    return {
      platform: 'gemini',
      installed: false,
      runnable: false,
      error: 'Gemini CLI not found',
    };
  }

  /**
   * Detect Copilot CLI installation
   */
  private async detectCopilot(): Promise<PlatformStatus> {
    const env = this.getEnrichedEnv();
    const candidates: CliInvocation[] = [];
    const configured = resolvePlatformCommand('copilot', this.cliPaths);
    candidates.push({ command: configured });

    // GitHub CLI Copilot subcommand (common alternative installation):
    // `gh extension install github/gh-copilot` exposes `gh copilot ...` (no standalone `copilot` binary).
    // Treat this as installed for onboarding UX.
    candidates.push({ command: 'gh', argsPrefix: ['copilot'] });

    // If a plain command name is configured, also probe common absolute install locations.
    // This helps when PATH is minimal or when the process PATH ordering breaks /usr/bin/env node resolution.
    if (configured === 'copilot' && process.platform !== 'win32') {
      const home = homedir();
      const common = [
        home ? join(home, '.local', 'bin', 'copilot') : '',
        '/usr/local/bin/copilot',
        '/opt/homebrew/bin/copilot',
      ].filter(Boolean);
      for (const p of common) {
        try {
          if (existsSync(p)) {
            candidates.push({ command: p });
          }
        } catch {
          // ignore
        }
      }
    }

    const errors: string[] = [];
    let installedButNotRunnable: PlatformStatus | null = null;

    // Copilot CLI has had multiple version flags across releases; try a few fast probes.
    const probes: string[][] = [
      ['--version'],
      ['-v'],
      ['version'],
      ['--help'],
    ];

    for (const candidate of candidates) {
      for (const args of probes) {
        const result = await checkCliAvailable(candidate, args, 15_000, env);
        const invocationString = [candidate.command, ...(candidate.argsPrefix ?? []), ...args].join(' ');

        if (result.runnable) {
          return {
            platform: 'copilot',
            installed: true,
            runnable: true,
            version: result.version,
            command: invocationString,
          };
        }

        if (result.installed && !installedButNotRunnable) {
          const requirements: PlatformRequirement[] = [];
          const combined = `${result.stderr ?? ''}\n${result.stdout ?? ''}`.trim();
          const nodeReq = this.parseNodeMajorRequirement(combined);
          if (nodeReq) requirements.push(nodeReq);

          installedButNotRunnable = {
            platform: 'copilot',
            installed: true,
            runnable: false,
            error: result.error || 'Copilot CLI installed but not runnable',
            requirements: requirements.length > 0 ? requirements : undefined,
            command: invocationString,
          };
        }

        if (result.error) {
          errors.push(`${invocationString} → ${result.error}`);
        }
      }
    }

    if (installedButNotRunnable) {
      return installedButNotRunnable;
    }

    return {
      platform: 'copilot',
      installed: false,
      runnable: false,
      error: errors.length > 0 ? `Copilot CLI not found (last errors: ${errors.slice(0, 2).join(' | ')})` : 'Copilot CLI not found',
    };
  }

  private parseNodeMajorRequirement(stderrOrStdout: string): PlatformRequirement | null {
    if (!stderrOrStdout) return null;
    const text = stderrOrStdout.replace(/\r/g, '\n');

    // Common Copilot error patterns:
    // - "requires Node.js v24 or higher"
    // - "requires Node.js v24+"
    // - "... requires Node v24"
    const requiredMatch = text.match(/requires\s+node(?:\.js)?\s+v?(\d+)(?:\+|\b)/i);
    if (!requiredMatch) return null;
    const requiredMajor = parseInt(requiredMatch[1] ?? '0', 10);
    if (!Number.isFinite(requiredMajor) || requiredMajor <= 0) return null;

    // Try to parse current version if present in the error output.
    const currentMatch = text.match(/current\s+node(?:\.js)?\s+version:\s*v?(\d+)\./i)
      ?? text.match(/\byou\s+are\s+running\s+node\s+v?(\d+)\./i)
      ?? text.match(/\bnode\s+v?(\d+)\.\d+\.\d+\b/i);
    const currentMajor = currentMatch ? parseInt(currentMatch[1] ?? '0', 10) : undefined;
    return {
      kind: 'node',
      requiredMajor,
      currentMajor: currentMajor && Number.isFinite(currentMajor) && currentMajor > 0 ? currentMajor : undefined,
    };
  }

  private getEnrichedEnv(): NodeJS.ProcessEnv {
    const home = homedir();
    const npmGlobalPrefix = home ? join(home, '.npm-global') : '';
    const npmGlobalBin = npmGlobalPrefix
      ? (process.platform === 'win32' ? npmGlobalPrefix : join(npmGlobalPrefix, 'bin'))
      : '';

    // Windows: npm default global bin is %APPDATA%\npm (used when user runs npm -g without prefix)
    const windowsNpmBin = process.platform === 'win32' && process.env.APPDATA
      ? join(process.env.APPDATA, 'npm')
      : '';

    const extraPaths = [
      npmGlobalBin,
      windowsNpmBin,
      home ? join(home, '.local', 'bin') : '',
      home ? join(home, '.volta', 'bin') : '',
      home ? join(home, '.asdf', 'shims') : '',
      '/usr/local/bin',
      '/opt/homebrew/bin',
      '/opt/homebrew/sbin',
      '/snap/bin',
    ].filter(Boolean);

    const currentPath = process.env.PATH || '';
    const enrichedPath = [...extraPaths, currentPath].filter(Boolean).join(delimiter);

    const env: NodeJS.ProcessEnv = {
      ...process.env,
      PATH: enrichedPath,
    };

    if (npmGlobalPrefix) {
      env.HOME = home;
      env.npm_config_prefix = npmGlobalPrefix;
      env.NPM_CONFIG_PREFIX = npmGlobalPrefix;
    }

    return env;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }
}
