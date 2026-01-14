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
import type { Platform } from '../types/config.js';
import type {
  CapabilityProbeResult,
  PlatformCapabilities,
  QuotaInfo,
  CooldownInfo,
} from '../types/capabilities.js';

/**
 * Maps platform to CLI command name.
 */
function getPlatformCommand(platform: Platform): string {
  switch (platform) {
    case 'cursor':
      return 'cursor-agent';
    case 'codex':
      return 'codex';
    case 'claude':
      return 'claude';
    default:
      return platform;
  }
}

/**
 * Executes a CLI command and returns stdout output.
 */
async function executeCommand(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
      }
    });

    proc.on('error', (error) => {
      reject(error);
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

  constructor(cacheDir: string = '.puppet-master/capabilities') {
    this.cacheDir = cacheDir;
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
    const command = getPlatformCommand(platform);
    const timestamp = new Date().toISOString();

    let version = 'unknown';
    let capabilities = createDefaultCapabilities();

    try {
      // Try to get version
      try {
        const versionOutput = await executeCommand(command, ['--version']);
        version = parseVersion(versionOutput);
      } catch {
        // Version command failed, use default
      }

      // Try to get help output for capabilities
      try {
        const helpOutput = await executeCommand(command, ['--help']);
        capabilities = parseCapabilities(helpOutput);
      } catch {
        // Help command failed, use default capabilities
      }
    } catch {
      // CLI is missing or not executable, return default capabilities
      capabilities = createDefaultCapabilities();
    }

    const result: CapabilityProbeResult = {
      platform,
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
