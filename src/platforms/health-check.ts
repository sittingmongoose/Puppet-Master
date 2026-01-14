/**
 * Platform Health Check for RWM Puppet Master
 * 
 * Validates platform CLI availability, checks version information,
 * and reports health status.
 * 
 * Per BUILD_QUEUE_PHASE_3.md PH3-T09 (Platform Health Check) and
 * REQUIREMENTS.md Section 15.1 (Doctor Checks).
 */

import { spawn } from 'child_process';
import type { Platform } from '../types/config.js';
import type { PlatformCapabilities } from '../types/capabilities.js';
import { CapabilityDiscoveryService } from './capability-discovery.js';
import { PlatformRegistry } from './registry.js';

/**
 * Result of a platform health check.
 */
export interface HealthCheckResult {
  /** Whether the platform is healthy (CLI available and executable) */
  healthy: boolean;
  
  /** Human-readable message describing the health status */
  message: string;
  
  /** Version string if available, undefined if version check failed */
  version?: string;
  
  /** Platform capabilities if available, undefined if not discovered */
  capabilities?: PlatformCapabilities;
}

/**
 * Maps platform to CLI command name.
 * 
 * Uses the same mapping as capability-discovery.ts for consistency.
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
 * Checks if a CLI command exists and is executable.
 * 
 * Attempts to run the command with --version flag.
 * 
 * @param command - The CLI command to check
 * @returns Promise that resolves to version string if available, or rejects if command is not available
 */
async function checkCliAvailability(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, ['--version'], {
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
        // Command succeeded, return output (may contain version)
        resolve(stdout || stderr);
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
      }
    });

    proc.on('error', (error) => {
      // Command not found or not executable
      reject(error);
    });
  });
}

/**
 * Parses version from CLI output.
 * 
 * Attempts to extract version number from output string.
 * 
 * @param output - CLI output string
 * @returns Version string if found, undefined otherwise
 */
function parseVersion(output: string): string | undefined {
  // Try various version patterns
  const versionMatch = output.match(/version\s+([\d.]+)/i) ||
                       output.match(/v([\d.]+)/i) ||
                       output.match(/([\d.]+)/);
  
  return versionMatch ? versionMatch[1] : undefined;
}

/**
 * Platform Health Checker
 * 
 * Validates platform CLI availability and reports health status.
 * Integrates with CapabilityDiscoveryService for capability reporting.
 */
export class PlatformHealthChecker {
  private readonly capabilityService: CapabilityDiscoveryService;

  /**
   * Creates a new PlatformHealthChecker instance.
   * 
   * @param capabilityService - Capability discovery service (optional, creates default if not provided)
   */
  constructor(capabilityService?: CapabilityDiscoveryService) {
    this.capabilityService = capabilityService || new CapabilityDiscoveryService();
  }

  /**
   * Checks the health of a single platform.
   * 
   * Validates:
   * - CLI command exists and is executable
   * - Version information (if available)
   * - Platform capabilities (from capability discovery service)
   * 
   * @param platform - The platform to check
   * @returns Promise that resolves to health check result
   */
  async checkPlatform(platform: Platform): Promise<HealthCheckResult> {
    const command = getPlatformCommand(platform);
    
    let healthy = false;
    let message = '';
    let version: string | undefined;
    let capabilities: PlatformCapabilities | undefined;

    // Check CLI availability
    try {
      const output = await checkCliAvailability(command);
      healthy = true;
      message = `Platform ${platform} is available and executable`;
      
      // Try to parse version from output
      version = parseVersion(output);
      
      // Get capabilities from discovery service
      try {
        const cached = await this.capabilityService.getCached(platform);
        if (cached) {
          capabilities = cached.capabilities;
        } else {
          // If not cached, try to probe (but don't fail if it fails)
          try {
            const probeResult = await this.capabilityService.probe(platform);
            capabilities = probeResult.capabilities;
          } catch {
            // Probe failed, but CLI is available, so continue without capabilities
          }
        }
      } catch {
        // Capability discovery failed, but CLI is available, so continue
      }
    } catch (error) {
      healthy = false;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('ENOENT') || errorMessage.includes('not found')) {
        message = `Platform ${platform} CLI (${command}) not found in PATH`;
      } else if (errorMessage.includes('EACCES') || errorMessage.toLowerCase().includes('permission denied')) {
        message = `Platform ${platform} CLI (${command}) is not executable`;
      } else {
        message = `Platform ${platform} CLI (${command}) check failed: ${errorMessage}`;
      }
    }

    return {
      healthy,
      message,
      version,
      capabilities,
    };
  }

  /**
   * Checks the health of all registered platforms.
   * 
   * Iterates over all platforms in the registry and checks each one.
   * 
   * @param registry - Platform registry instance
   * @returns Promise that resolves to a map of platform to health check result
   */
  async checkAll(registry: PlatformRegistry): Promise<Map<Platform, HealthCheckResult>> {
    const results = new Map<Platform, HealthCheckResult>();
    const platforms = registry.getAvailable();

    // Check each platform
    for (const platform of platforms) {
      const result = await this.checkPlatform(platform);
      results.set(platform, result);
    }

    return results;
  }
}
