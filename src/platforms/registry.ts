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
import { GeminiRunner } from './gemini-runner.js';
import { CopilotRunner } from './copilot-runner.js';
import { resolveUnderProjectRoot } from '../utils/project-paths.js';
import { FreshSpawner } from '../core/fresh-spawn.js';

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
   * @param config - Configuration object (used for CLI paths and working directory)
   * @param projectRoot - Optional canonical project root (resolves capability cache under it)
   * @returns A new PlatformRegistry instance with all runners registered
   */
  static createDefault(config: PuppetMasterConfig, projectRoot?: string): PlatformRegistry {
    const registry = new PlatformRegistry();
    const cacheDir = projectRoot
      ? resolveUnderProjectRoot(projectRoot, '.puppet-master/capabilities')
      : '.puppet-master/capabilities';
    const capabilityService = new CapabilityDiscoveryService(
      cacheDir,
      config.cliPaths
    );

    // Create FreshSpawner instance for process isolation (P1-T09)
    // Use project working directory and default timeouts
    // Tier-specific timeouts will be set per request, not per runner
    const workingDirectory = config.project.workingDirectory || '.';
    const freshSpawner = new FreshSpawner({
      workingDirectory,
      timeout: 300_000, // 5 minutes default (will be overridden per request)
      hardTimeout: 1_800_000, // 30 minutes default (will be overridden per request)
      environmentVars: {},
      allowSessionResume: false,
    });

    // Register Cursor runner
    const cursorRunner = new CursorRunner(
      capabilityService,
      config.cliPaths.cursor,
      300_000,
      1_800_000,
      freshSpawner
    );
    registry.register('cursor', cursorRunner);

    // Register Codex runner
    const codexRunner = new CodexRunner(
      capabilityService,
      300_000,
      1_800_000,
      freshSpawner
    );
    registry.register('codex', codexRunner);

    // Register Claude runner
    const claudeRunner = new ClaudeRunner(
      capabilityService,
      config.cliPaths.claude,
      300_000,
      1_800_000,
      freshSpawner
    );
    registry.register('claude', claudeRunner);

    // Register Gemini runner
    const geminiRunner = new GeminiRunner(
      capabilityService,
      config.cliPaths.gemini,
      600_000, // Gemini uses longer default timeout
      900_000,
      freshSpawner
    );
    registry.register('gemini', geminiRunner);

    // Register Copilot CLI runner.
    // The SDK exists, but the CLI runner is the most robust default for desktop launches
    // and matches the project's "CLI-only" constraint.
    const copilotRunner = new CopilotRunner(
      capabilityService,
      config.cliPaths.copilot,
      300_000,
      1_800_000,
      freshSpawner
    );
    registry.register('copilot', copilotRunner);

    // NOTE: Antigravity runner removed - GUI-only, not suitable for automation
    // See plan: /root/.claude/plans/snoopy-wondering-mountain.md

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
