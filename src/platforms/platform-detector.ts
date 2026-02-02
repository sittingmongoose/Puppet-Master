/**
 * Platform Detector Service for RWM Puppet Master
 * 
 * Detects which platforms are installed and available for use.
 * Used by first boot wizard and config page to filter available platforms.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import type { Platform } from '../types/config.js';
import type { CliPathsConfig } from '../types/config.js';
import { getCursorCommandCandidates, resolvePlatformCommand } from './constants.js';
import { getPlatformAuthStatus } from './auth-status.js';

/**
 * CLI invocation structure
 */
interface CliInvocation {
  command: string;
  argsPrefix?: string[];
}

/**
 * Result of checking CLI availability
 */
interface CliAvailabilityResult {
  available: boolean;
  version?: string;
  error?: string;
}

/**
 * Check if a CLI command is available and can run a version flag
 */
async function checkCliAvailable(
  invocation: CliInvocation,
  args: string[] = ['--version'],
  timeout: number = 10000
): Promise<CliAvailabilityResult> {
  return new Promise((resolve) => {
    const proc: ChildProcess = spawn(invocation.command, [...(invocation.argsPrefix ?? []), ...args], {
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      proc.kill('SIGKILL');
      resolve({
        available: false,
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
        const version = stdout.trim().split('\n')[0].trim();
        resolve({
          available: true,
          version: version || 'unknown',
        });
      } else {
        resolve({
          available: false,
          error: `Command exited with code ${code}${stderr ? `: ${stderr.trim()}` : ''}`,
        });
      }
    });

    proc.on('error', (error) => {
      clearTimeout(timer);
      resolve({
        available: false,
        error: error.message,
      });
    });
  });
}

/**
 * Platform installation status
 */
export interface PlatformStatus {
  /** Platform identifier */
  platform: Platform;
  /** Whether the platform CLI is installed and available */
  installed: boolean;
  /** Version string if available */
  version?: string;
  /** Error message if not installed */
  error?: string;
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
  /** List of installed platforms */
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

    const platforms: Record<Platform, PlatformStatus> = {
      cursor: await this.detectCursor(),
      codex: await this.detectCodex(),
      claude: await this.detectClaude(),
      gemini: await this.detectGemini(),
      copilot: await this.detectCopilot(),
    };

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
      if (status.installed) {
        installedPlatforms.push(platform);
      } else {
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
    const candidates: CliInvocation[] = getCursorCommandCandidates(this.cliPaths).map((c) => ({
      command: c,
    }));

    for (const candidate of candidates) {
      const result = await checkCliAvailable(candidate, ['--version']);
      if (result.available) {
        const auth = getPlatformAuthStatus('cursor');
        return {
          platform: 'cursor',
          installed: true,
          version: result.version,
          authenticated: auth.status !== 'not_authenticated',
          command: candidate.command,
        };
      }
    }

    return {
      platform: 'cursor',
      installed: false,
      error: 'Cursor CLI not found',
    };
  }

  /**
   * Detect Codex CLI installation
   */
  private async detectCodex(): Promise<PlatformStatus> {
    const candidates: CliInvocation[] = [];
    const configured = resolvePlatformCommand('codex', this.cliPaths);
    if (this.cliPaths.codex && this.cliPaths.codex.trim() !== '') {
      candidates.push({ command: configured });
    } else {
      candidates.push({ command: configured });
      candidates.push({ command: 'npx', argsPrefix: ['--no-install', 'codex'] });
    }

    for (const candidate of candidates) {
      const result = await checkCliAvailable(candidate, ['--version'], 15_000);
      if (result.available) {
        const auth = getPlatformAuthStatus('codex');
        return {
          platform: 'codex',
          installed: true,
          version: result.version,
          authenticated: auth.status !== 'not_authenticated',
          command: candidate.command,
        };
      }
    }

    return {
      platform: 'codex',
      installed: false,
      error: 'Codex CLI not found',
    };
  }

  /**
   * Detect Claude CLI installation
   */
  private async detectClaude(): Promise<PlatformStatus> {
    const candidates: CliInvocation[] = [];
    const configured = resolvePlatformCommand('claude', this.cliPaths);
    if (this.cliPaths.claude && this.cliPaths.claude.trim() !== '') {
      candidates.push({ command: configured });
    } else {
      candidates.push({ command: configured });
      candidates.push({ command: 'npx', argsPrefix: ['--no-install', '@anthropic-ai/claude'] });
    }

    for (const candidate of candidates) {
      const result = await checkCliAvailable(candidate, ['--version'], 15_000);
      if (result.available) {
        const auth = getPlatformAuthStatus('claude');
        return {
          platform: 'claude',
          installed: true,
          version: result.version,
          authenticated: auth.status !== 'not_authenticated',
          command: candidate.command,
        };
      }
    }

    return {
      platform: 'claude',
      installed: false,
      error: 'Claude CLI not found',
    };
  }

  /**
   * Detect Gemini CLI installation
   */
  private async detectGemini(): Promise<PlatformStatus> {
    const candidates: CliInvocation[] = [];
    const configured = resolvePlatformCommand('gemini', this.cliPaths);
    if (this.cliPaths.gemini && this.cliPaths.gemini.trim() !== '') {
      candidates.push({ command: configured });
    } else {
      candidates.push({ command: configured });
      candidates.push({ command: 'npx', argsPrefix: ['--no-install', '@google/gemini-cli'] });
    }

    for (const candidate of candidates) {
      const result = await checkCliAvailable(candidate, ['--version'], 15_000);
      if (result.available) {
        const auth = getPlatformAuthStatus('gemini');
        return {
          platform: 'gemini',
          installed: true,
          version: result.version,
          authenticated: auth.status !== 'not_authenticated',
          command: candidate.command,
        };
      }
    }

    return {
      platform: 'gemini',
      installed: false,
      error: 'Gemini CLI not found',
    };
  }

  /**
   * Detect Copilot SDK installation
   * 
   * Note: Copilot uses SDK, not CLI, so we check for the SDK package
   */
  private async detectCopilot(): Promise<PlatformStatus> {
    // Copilot uses SDK, check if @github/copilot-sdk is available
    // For now, we'll check if the SDK runner can be instantiated
    // This is a simplified check - in production, we'd check for the actual SDK package
    
    // Check for GitHub token which is required for Copilot
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (token) {
      // Assume SDK is available if token is present
      // In a real implementation, we'd check for the actual SDK package
      return {
        platform: 'copilot',
        installed: true,
        authenticated: true,
        command: 'sdk',
      };
    }

    return {
      platform: 'copilot',
      installed: false,
      error: 'Copilot SDK not available (requires GITHUB_TOKEN or GH_TOKEN)',
    };
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }
}
