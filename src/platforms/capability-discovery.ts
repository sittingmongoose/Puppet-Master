/**
 * Capability Discovery Service for RWM Puppet Master
 * 
 * This service probes platform CLIs to discover capabilities and caches results.
 * Per REQUIREMENTS.md Section 26.1-26.4 (Discovery Protocol) and
 * STATE_FILES.md Section 4.2 (Capability Cache Schema).
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import type { CliPathsConfig, Platform } from '../types/config.js';
import type {
  CapabilityProbeResult,
  PlatformCapabilities,
  QuotaInfo,
  CooldownInfo,
} from '../types/capabilities.js';
import { getPlatformAuthStatus } from './auth-status.js';
import { getCursorCommandCandidates, resolvePlatformCommand } from './constants.js';

/**
 * Executes a CLI command and returns stdout output.
 */
async function executeCommand(
  command: string,
  args: string[],
  timeoutMs: number = 10_000
): Promise<{ ok: true; output: string } | { ok: false; error: string; errorCode?: string }> {
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      proc.kill('SIGKILL');
      resolve({ ok: false, error: `Command timed out after ${timeoutMs}ms` });
    }, timeoutMs);

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve({ ok: true, output: stdout || stderr });
      } else {
        resolve({
          ok: false,
          error: `Command failed with code ${code}: ${stderr || stdout}`,
        });
      }
    });

    proc.on('error', (error) => {
      clearTimeout(timer);
      const errno = error as NodeJS.ErrnoException;
      resolve({
        ok: false,
        error: error.message,
        errorCode: typeof errno.code === 'string' ? errno.code : undefined,
      });
    });
  });
}

/**
 * Parses version from CLI output.
 */
function parseVersion(output: string): string {
  // Try to extract version number from output
  const versionMatch = output.match(/version\s+([\d.]+)/i) || 
                       output.match(/v([\d.]+)/i) ||
                       output.match(/([\d.]+)/);
  
  return versionMatch ? versionMatch[1] : 'unknown';
}

/**
 * Parses capabilities from help output.
 * Returns default capabilities with basic detection.
 */
function parseCapabilities(helpOutput: string): PlatformCapabilities {
  const lowerOutput = helpOutput.toLowerCase();
  
  return {
    streaming: lowerOutput.includes('stream') || lowerOutput.includes('output-format'),
    codeExecution: lowerOutput.includes('exec') || lowerOutput.includes('run'),
    imageGeneration: lowerOutput.includes('image') || lowerOutput.includes('generate'),
    fileAccess: lowerOutput.includes('file') || lowerOutput.includes('read'),
    webSearch: lowerOutput.includes('web') || lowerOutput.includes('search'),
    computerUse: lowerOutput.includes('computer') || lowerOutput.includes('use'),
    maxContextTokens: 100000, // Default reasonable value
    maxOutputTokens: 4000, // Default reasonable value
    supportedLanguages: ['typescript', 'javascript', 'python'], // Default common languages
  };
}

/**
 * Creates default capabilities for missing CLI.
 */
function createDefaultCapabilities(): PlatformCapabilities {
  return {
    streaming: false,
    codeExecution: false,
    imageGeneration: false,
    fileAccess: false,
    webSearch: false,
    computerUse: false,
    maxContextTokens: 0,
    maxOutputTokens: 0,
    supportedLanguages: [],
  };
}

/**
 * Creates default quota info.
 */
function createDefaultQuotaInfo(): QuotaInfo {
  return {
    remaining: Number.MAX_SAFE_INTEGER,
    limit: Number.MAX_SAFE_INTEGER,
    resetsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    period: 'day',
  };
}

/**
 * Creates default cooldown info.
 */
function createDefaultCooldownInfo(): CooldownInfo {
  return {
    active: false,
    endsAt: null,
    reason: null,
  };
}

/**
 * Capability Discovery Service
 * 
 * Probes platform CLIs to discover capabilities and caches results.
 */
export class CapabilityDiscoveryService {
  private readonly cacheDir: string;
  private readonly cliPaths: Partial<CliPathsConfig> | null;

  constructor(
    cacheDir: string = '.puppet-master/capabilities',
    cliPaths?: Partial<CliPathsConfig> | null
  ) {
    this.cacheDir = cacheDir;
    this.cliPaths = cliPaths ?? null;
  }

  /**
   * Ensures the cache directory exists.
   */
  private async ensureCacheDir(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Gets the cache file paths for a platform.
   */
  private getCachePaths(platform: Platform): { yaml: string; json: string } {
    return {
      yaml: join(this.cacheDir, `${platform}.yaml`),
      json: join(this.cacheDir, `${platform}.json`),
    };
  }

  /**
   * Probes a platform CLI to discover capabilities.
   * 
   * Runs CLI with --help and --version flags, parses output.
   * Returns default capabilities if CLI is missing.
   */
  async probe(platform: Platform): Promise<CapabilityProbeResult> {
    const timestamp = new Date().toISOString();

    let version = 'unknown';
    let capabilities = createDefaultCapabilities();
    let command = resolvePlatformCommand(platform, this.cliPaths);
    let runnable = false;

    const candidates =
      platform === 'cursor'
        ? getCursorCommandCandidates(this.cliPaths)
        : [resolvePlatformCommand(platform, this.cliPaths)];

    // Probe candidates until one can actually run.
    for (const candidate of candidates) {
      const versionResult = await executeCommand(candidate, ['--version'], 5_000);
      const helpResult = await executeCommand(candidate, ['--help'], 5_000);

      if (versionResult.ok || helpResult.ok) {
        command = candidate;
        runnable = true;
        if (versionResult.ok) {
          version = parseVersion(versionResult.output);
        }
        if (helpResult.ok) {
          capabilities = parseCapabilities(helpResult.output);
        }
        break;
      }
    }

    const authStatus = getPlatformAuthStatus(platform).status;

    const result: CapabilityProbeResult = {
      platform,
      command,
      runnable,
      authStatus,
      version,
      capabilities,
      quotaInfo: createDefaultQuotaInfo(),
      cooldownInfo: createDefaultCooldownInfo(),
      probeTimestamp: timestamp,
    };

    // Cache the result
    await this.cacheResult(platform, result);

    return result;
  }

  /**
   * Gets cached capability probe result.
   * 
   * Reads from YAML cache file (preferred) or JSON cache file.
   */
  async getCached(platform: Platform): Promise<CapabilityProbeResult | null> {
    const paths = this.getCachePaths(platform);

    try {
      // Try YAML first (human-readable)
      try {
        const yamlContent = await fs.readFile(paths.yaml, 'utf-8');
        const data = yaml.load(yamlContent) as CapabilityProbeResult;
        return data;
      } catch {
        // YAML not found, try JSON
      }

      // Try JSON
      try {
        const jsonContent = await fs.readFile(paths.json, 'utf-8');
        const data = JSON.parse(jsonContent) as CapabilityProbeResult;
        return data;
      } catch {
        // Neither file exists
        return null;
      }
    } catch {
      return null;
    }
  }

  /**
   * Forces a re-probe and updates the cache.
   */
  async refresh(platform: Platform): Promise<CapabilityProbeResult> {
    return this.probe(platform);
  }

  /**
   * Checks if the cache is valid (not older than maxAgeMs).
   */
  async isCacheValid(platform: Platform, maxAgeMs: number): Promise<boolean> {
    const cached = await this.getCached(platform);
    
    if (!cached) {
      return false;
    }

    const probeTime = new Date(cached.probeTimestamp).getTime();
    const now = Date.now();
    const age = now - probeTime;

    return age < maxAgeMs;
  }

  /**
   * Caches a probe result to both YAML and JSON formats.
   */
  private async cacheResult(
    platform: Platform,
    result: CapabilityProbeResult
  ): Promise<void> {
    await this.ensureCacheDir();
    const paths = this.getCachePaths(platform);

    // Write YAML (human-readable)
    const yamlContent = yaml.dump(result, {
      indent: 2,
      lineWidth: 100,
    });
    await fs.writeFile(paths.yaml, yamlContent, 'utf-8');

    // Write JSON (machine-readable)
    const jsonContent = JSON.stringify(result, null, 2);
    await fs.writeFile(paths.json, jsonContent, 'utf-8');
  }
}
