/**
 * Platform Registry for RWM Puppet Master
 * 
 * Manages platform runner instances and provides factory methods.
 * 
 * Per BUILD_QUEUE_PHASE_3.md PH3-T08 (Platform Registry).
 */

import type { Platform } from '../types/config.js';
import type { PuppetMasterConfig } from '../types/config.js';
import { BasePlatformRunner } from './base-runner.js';
import { CapabilityDiscoveryService } from './capability-discovery.js';
import { CursorRunner } from './cursor-runner.js';
import { CodexRunner } from './codex-runner.js';
import { ClaudeRunner } from './claude-runner.js';

/**
 * Platform Registry
 * 
 * Manages platform runner instances in a singleton pattern.
 * Provides methods to register, retrieve, and list available runners.
 */
export class PlatformRegistry {
  private static instance: PlatformRegistry | null = null;
  private runners: Map<Platform, BasePlatformRunner> = new Map();

  /**
   * Creates a new PlatformRegistry instance.
   * 
   * For singleton access, use getInstance().
   * For factory-created instances, use createDefault().
   */
  constructor() {
    // Public constructor allows creation of new instances for testing
    // Use getInstance() for singleton access, or createDefault() for factory pattern
  }

  /**
   * Gets the singleton instance of PlatformRegistry.
   * 
   * @returns The singleton PlatformRegistry instance
   */
  static getInstance(): PlatformRegistry {
    if (!PlatformRegistry.instance) {
      PlatformRegistry.instance = new PlatformRegistry();
    }
    return PlatformRegistry.instance;
  }

  /**
   * Creates a default PlatformRegistry instance with all runners registered.
   * 
   * Factory method that creates a new registry instance, instantiates all
   * platform runners, and registers them.
   * 
   * @param config - Configuration object (used for CLI paths)
   * @returns A new PlatformRegistry instance with all runners registered
   */
  static createDefault(config: PuppetMasterConfig): PlatformRegistry {
    const registry = new PlatformRegistry();
    const capabilityService = new CapabilityDiscoveryService();

    // Register Cursor runner
    const cursorRunner = new CursorRunner(
      capabilityService,
      config.cliPaths.cursor
    );
    registry.register('cursor', cursorRunner);

    // Register Codex runner
    const codexRunner = new CodexRunner(capabilityService);
    registry.register('codex', codexRunner);

    // Register Claude runner
    const claudeRunner = new ClaudeRunner(
      capabilityService,
      config.cliPaths.claude
    );
    registry.register('claude', claudeRunner);

    return registry;
  }

  /**
   * Registers a platform runner.
   * 
   * @param platform - The platform identifier
   * @param runner - The platform runner instance
   */
  register(platform: Platform, runner: BasePlatformRunner): void {
    this.runners.set(platform, runner);
  }

  /**
   * Gets a platform runner by platform identifier.
   * 
   * @param platform - The platform identifier
   * @returns The platform runner instance, or undefined if not registered
   */
  get(platform: Platform): BasePlatformRunner | undefined {
    return this.runners.get(platform);
  }

  /**
   * Gets all available platforms (platforms with registered runners).
   * 
   * @returns Array of platform identifiers that have registered runners
   */
  getAvailable(): Platform[] {
    return Array.from(this.runners.keys());
  }

  /**
   * Clears all registered runners.
   * Useful for testing or resetting the registry.
   */
  clear(): void {
    this.runners.clear();
  }
}
