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
import { homedir } from 'os';
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
  timeoutMs: number = 10_000,
  testMode: boolean = false
): Promise<{ ok: true; output: string } | { ok: false; error: string; errorCode?: string }> {
  return new Promise((resolve) => {
    const effectiveTimeout = testMode ? Math.min(timeoutMs, 500) : timeoutMs;
    const proc = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      proc.kill('SIGKILL');
      resolve({ ok: false, error: `Command timed out after ${effectiveTimeout}ms` });
    }, effectiveTimeout);

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
 * CU-P1-T07: MCP detection result.
 */
export interface MCPDetectionResult {
  available: boolean;
  serverCount?: number;
  servers?: string[];
  error?: string;
}

/**
 * CU-P1-T08: Cursor config detection result.
 */
export interface CursorConfigDetectionResult {
  found: boolean;
  path?: string;
  hasPermissions?: boolean;
  error?: string;
}

/**
 * CU-P1-T08: Detect Cursor CLI config/permissions file presence.
 * 
 * Checks common Cursor config locations in read-only mode.
 * 
 * @returns Config detection result
 */
export async function detectCursorConfig(): Promise<CursorConfigDetectionResult> {
  const homeDir = homedir();
  const configPaths: string[] = [];

  // Common config locations
  if (homeDir) {
    // Unix-like: ~/.cursor/config.json, ~/.config/cursor/config.json
    configPaths.push(
      join(homeDir, '.cursor', 'config.json'),
      join(homeDir, '.config', 'cursor', 'config.json')
    );
  }

  // Windows paths (when running from WSL or native)
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || process.env.LOCALAPPDATA;
    if (appData) {
      configPaths.push(
        join(appData, 'Cursor', 'config.json'),
        join(appData, 'cursor', 'config.json')
      );
    }
  }

  // Check each path
  for (const configPath of configPaths) {
    try {
      await fs.access(configPath);
      
      // File exists, try to read it (read-only)
      try {
        const content = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(content);
        
        // Check if permissions/allow/deny patterns exist
        const hasPermissions = !!(
          config.permissions ||
          config.allow ||
          config.deny ||
          config.allowPatterns ||
          config.denyPatterns
        );

        return {
          found: true,
          path: configPath,
          hasPermissions,
        };
      } catch (parseError) {
        // File exists but couldn't parse - still report it
        return {
          found: true,
          path: configPath,
          hasPermissions: false,
          error: 'Could not parse config file',
        };
      }
    } catch {
      // File doesn't exist at this path, continue
      continue;
    }
  }

  // No config file found
  return {
    found: false,
  };
}

/**
 * CU-P1-T07: Probe Cursor MCP capabilities using `agent mcp list`.
 * 
 * @param command - Cursor CLI command (default: 'agent')
 * @param timeoutMs - Timeout in milliseconds (default: 5000)
 * @returns MCP detection result
 */
export async function probeCursorMCP(
  command: string = 'agent',
  timeoutMs: number = 5000,
  testMode: boolean = false
): Promise<MCPDetectionResult> {
  try {
    const result = await executeCommand(command, ['mcp', 'list'], timeoutMs, testMode);
    
    if (!result.ok) {
      return {
        available: false,
        error: result.error,
      };
    }

    // Parse MCP list output
    const output = result.output.trim();
    if (!output || output.toLowerCase().includes('no mcp servers') || output.toLowerCase().includes('no servers')) {
      return {
        available: true,
        serverCount: 0,
        servers: [],
      };
    }

    // Try to extract server names from output
    // Format may vary, but typically lists server names
    const lines = output.split('\n').filter(line => line.trim());
    const servers: string[] = [];
    
    for (const line of lines) {
      // Skip headers and separators
      if (line.includes('─') || line.includes('═') || line.toLowerCase().includes('server')) {
        continue;
      }
      
      // Extract server name (first word or column)
      const parts = line.trim().split(/\s+/);
      if (parts.length > 0 && parts[0] && !parts[0].match(/^\d+$/)) {
        servers.push(parts[0]);
      }
    }

    return {
      available: true,
      serverCount: servers.length > 0 ? servers.length : undefined,
      servers: servers.length > 0 ? servers : undefined,
    };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
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
 * Test Gemini-specific capabilities via smoke tests.
 * Non-blocking: failures don't prevent capability discovery.
 */
async function testGeminiCapabilities(command: string, testMode: boolean = false): Promise<{
  sandbox: boolean;
  multiDirectory: boolean;
  streaming: boolean;
  modelDiscovery: boolean;
}> {
  const results = {
    sandbox: false,
    multiDirectory: false,
    streaming: false,
    modelDiscovery: false,
  };

  const timeout = testMode ? 500 : 3000;

  // Test sandbox support (non-blocking)
  try {
    const sandboxTest = await executeCommand(command, ['-p', 'test', '--sandbox', '--output-format', 'json'], timeout, testMode);
    results.sandbox = sandboxTest.ok || sandboxTest.error?.includes('sandbox') !== false;
  } catch {
    // Ignore failures
  }

  // Test multi-directory support (non-blocking)
  try {
    const multiDirTest = await executeCommand(command, ['-p', 'test', '--include-directories', '/tmp', '--output-format', 'json'], timeout, testMode);
    results.multiDirectory = multiDirTest.ok || multiDirTest.error?.includes('include-directories') !== false;
  } catch {
    // Ignore failures
  }

  // Test streaming support (non-blocking)
  try {
    const streamTest = await executeCommand(command, ['-p', 'test', '--output-format', 'stream-json'], timeout, testMode);
    results.streaming = streamTest.ok || streamTest.error?.includes('stream-json') !== false;
  } catch {
    // Ignore failures
  }

  // Test model discovery command (non-blocking)
  try {
    const modelsTest = await executeCommand(command, ['models'], timeout, testMode);
    results.modelDiscovery = modelsTest.ok;
  } catch {
    // Ignore failures
  }

  return results;
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
 * Validation result from preflight check.
 * Per ARCHITECTURE.md Section 8 (Capability Discovery Service).
 */
export interface PreflightValidationResult {
  /** Whether execution can proceed */
  ready: boolean;
  /** List of issues that prevent or warn about execution */
  issues: string[];
  /** Whether user must run puppet-master doctor */
  mustRunDoctor: boolean;
  /** Suggestions for fixing each issue */
  suggestions: string[];
}

/**
 * Error thrown when preflight validation fails.
 */
export class CapabilityValidationError extends Error {
  readonly issues: string[];
  readonly suggestion: string;

  constructor(message: string, issues: string[], suggestion: string) {
    super(message);
    this.name = 'CapabilityValidationError';
    this.issues = issues;
    this.suggestion = suggestion;
  }
}

/**
 * Capability Discovery Service
 * 
 * Probes platform CLIs to discover capabilities and caches results.
 */
export class CapabilityDiscoveryService {
  private readonly cacheDir: string;
  private readonly cliPaths: Partial<CliPathsConfig> | null;
  /** Default staleness threshold in hours */
  private readonly stalenessThresholdHours: number;
  private readonly testMode: boolean;

  constructor(
    cacheDir: string = '.puppet-master/capabilities',
    cliPaths?: Partial<CliPathsConfig> | null,
    stalenessThresholdHours: number = 24,
    testMode: boolean = false
  ) {
    this.cacheDir = cacheDir;
    this.cliPaths = cliPaths ?? null;
    this.stalenessThresholdHours = stalenessThresholdHours;
    this.testMode = testMode;
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
      const versionResult = await executeCommand(candidate, ['--version'], 5_000, this.testMode);
      const helpResult = await executeCommand(candidate, ['--help'], 5_000, this.testMode);

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

    // Enhanced capability detection for Gemini
    if (platform === 'gemini' && runnable && command) {
      try {
        const geminiTests = await testGeminiCapabilities(command, this.testMode);
        // Update capabilities based on test results
        capabilities.streaming = geminiTests.streaming || capabilities.streaming;
        // Note: sandbox, multiDirectory, and modelDiscovery are Gemini-specific
        // and could be stored in a platform-specific extension if needed
      } catch {
        // Gemini-specific tests failed, use defaults from help parsing
      }
    }

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
   * P1-G06/P1-G09: Discovers available models for a platform.
   * 
   * For Copilot: Requires SDK (will dynamically import)
   * For Claude: Returns known model list from claude-models.ts
   * For Codex: Returns known model list from codex-models.ts
   * For Cursor: Returns known model list from cursor-models.ts
   * For Gemini: Returns known model list from gemini-models.ts
   * 
   * @param platform Platform to discover models for
   * @returns List of available model names, or empty array if discovery fails
   */
  async discoverModels(platform: Platform): Promise<string[]> {
    try {
      if (platform === 'copilot') {
        // Try to use SDK for dynamic model discovery
        try {
          const { CopilotClient: SdkClient } = await import('@github/copilot-sdk');
          const client = new SdkClient() as unknown as { start(): Promise<void>; listModels(): Promise<Array<string | { id?: string; name?: string }>>; stop(): Promise<void> };
          await client.start();
          const models = await client.listModels();
          await client.stop();
          // SDK may return model objects or strings - extract IDs only
          return models.map(m => {
            if (typeof m === 'string') return m;
            if (typeof m === 'object' && m !== null) {
              return m.id || m.name || String(m);
            }
            return String(m);
          });
        } catch (sdkError) {
          // SDK not available, fall back to known models
          console.warn('[CapabilityDiscovery] Copilot SDK not available for model discovery, using static list');
          const { KNOWN_COPILOT_MODELS } = await import('./copilot-models.js');
          return [...KNOWN_COPILOT_MODELS];
        }
      }

      // For other platforms, return static model lists
      switch (platform) {
        case 'claude': {
          // Try dynamic discovery via Claude API if API key is available
          const apiKey = process.env.ANTHROPIC_API_KEY;
          if (apiKey) {
            try {
              const response = await fetch('https://api.anthropic.com/v1/models', {
                headers: {
                  'x-api-key': apiKey,
                  'anthropic-version': '2023-06-01',
                },
              });
              if (response.ok) {
                const data = await response.json() as { data: Array<{ id: string; display_name?: string }> };
                // Extract model IDs, prioritizing aliases
                const discoveredModels = data.data
                  .map(m => m.id)
                  .filter(id => id.startsWith('claude-') || ['sonnet', 'opus', 'haiku'].includes(id));
                if (discoveredModels.length > 0) {
                  return discoveredModels;
                }
              }
            } catch (apiError) {
              console.warn('[CapabilityDiscovery] Claude API discovery failed, using static list:', apiError instanceof Error ? apiError.message : String(apiError));
            }
          }
          // Fallback to static list
          const { KNOWN_CLAUDE_MODELS } = await import('./claude-models.js');
          return [...KNOWN_CLAUDE_MODELS];
        }
        case 'codex': {
          const { KNOWN_CODEX_MODELS } = await import('./codex-models.js');
          return [...KNOWN_CODEX_MODELS];
        }
        case 'cursor': {
          const { KNOWN_CURSOR_MODELS } = await import('./cursor-models.js');
          return [...KNOWN_CURSOR_MODELS];
        }
        case 'gemini': {
          // Try dynamic discovery with fallback to static list
          try {
            const { getGeminiModelsWithDiscovery } = await import('./gemini-models.js');
            const cliPath = this.cliPaths?.gemini || resolvePlatformCommand('gemini', this.cliPaths);
            const models = await getGeminiModelsWithDiscovery(cliPath, true);
            return models.map(m => m.id);
          } catch {
            // Fallback to static list
            const { KNOWN_GEMINI_MODELS } = await import('./gemini-models.js');
            return [...KNOWN_GEMINI_MODELS];
          }
        }
        default:
          return [];
      }
    } catch (error) {
      console.warn(`[CapabilityDiscovery] Failed to discover models for ${platform}:`, error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  /**
   * P1-G06/P1-G09: Probes a platform and includes model discovery.
   * 
   * Extended probe that also discovers available models.
   */
  async probeWithModels(platform: Platform): Promise<CapabilityProbeResult> {
    const result = await this.probe(platform);
    const models = await this.discoverModels(platform);
    result.capabilities.availableModels = models;
    // Re-cache with models
    await this.cacheResult(platform, result);
    return result;
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

  /**
   * Validates that all required platforms are ready for execution.
   * 
   * Per ARCHITECTURE.md Section 8.1 (Refusal Rules), checks:
   * - Capability data exists for all required platforms
   * - All required platforms are runnable (CLI executable)
   * - All required platforms are authenticated
   * - Capability data is not stale
   * 
   * P0-G02: Preflight validation before orchestrator starts.
   * 
   * @param requiredPlatforms - Platforms that must be available for execution
   * @returns Validation result with issues and suggestions
   */
  async validateReadyForExecution(
    requiredPlatforms: Platform[]
  ): Promise<PreflightValidationResult> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Remove duplicates
    const platforms = [...new Set(requiredPlatforms)];

    for (const platform of platforms) {
      const cached = await this.getCached(platform);

      // Check 1: Capability data exists
      if (!cached) {
        issues.push(`Missing capability discovery for ${platform}`);
        suggestions.push(`Run 'puppet-master doctor' to discover ${platform} capabilities`);
        continue;
      }

      // Check 2: Platform CLI is runnable
      if (!cached.runnable) {
        issues.push(`${platform} CLI is not runnable (command: ${cached.command})`);
        suggestions.push(`Install ${platform} CLI or check your cliPaths configuration`);
      }

      // Check 3: Platform is authenticated (not_authenticated is a blocker)
      if (cached.authStatus === 'not_authenticated') {
        issues.push(`${platform} is not authenticated`);
        suggestions.push(`Run 'puppet-master login ${platform}' or set required environment variables`);
      }

      // Check 4: Capability data is not stale
      const discoveredAt = new Date(cached.probeTimestamp);
      const hoursOld = (Date.now() - discoveredAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursOld > this.stalenessThresholdHours) {
        issues.push(
          `Capability data for ${platform} is stale (${hoursOld.toFixed(1)}h old, threshold: ${this.stalenessThresholdHours}h)`
        );
        suggestions.push(`Run 'puppet-master doctor --refresh' to update ${platform} capabilities`);
      }

      // Check 5: Cooldown is not active
      if (cached.cooldownInfo.active) {
        const endsAt = cached.cooldownInfo.endsAt 
          ? new Date(cached.cooldownInfo.endsAt).toLocaleString()
          : 'unknown';
        issues.push(
          `${platform} is in cooldown until ${endsAt}` +
          (cached.cooldownInfo.reason ? ` (reason: ${cached.cooldownInfo.reason})` : '')
        );
        suggestions.push(`Wait for cooldown to end or use a different platform`);
      }
    }

    return {
      ready: issues.length === 0,
      issues,
      mustRunDoctor: issues.some(
        (i) => i.includes('Missing capability') || i.includes('not runnable') || i.includes('stale')
      ),
      suggestions,
    };
  }
}
