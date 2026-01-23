/**
 * Dependency Injection Container
 * 
 * Simple DI container for RWM Puppet Master that supports singleton, transient, and factory patterns.
 * Provides registration and resolution of dependencies without external frameworks.
 * 
 * See BUILD_QUEUE_PHASE_4.md PH4-T09 for implementation details.
 */

import type { PuppetMasterConfig } from '../types/config.js';
import type { CriterionType } from '../types/tiers.js';
import { ConfigManager } from '../config/config-manager.js';
import { PrdManager } from '../memory/prd-manager.js';
import { ProgressManager } from '../memory/progress-manager.js';
import type { AgentsManagerConfig } from '../memory/agents-manager.js';
import { AgentsManager } from '../memory/agents-manager.js';
import { EvidenceStore } from '../memory/evidence-store.js';
import { UsageTracker } from '../memory/usage-tracker.js';
import { GitManager } from '../git/git-manager.js';
import { createBranchStrategy } from '../git/branch-strategy.js';
import type { BranchStrategyConfig } from '../git/branch-strategy.js';
import { CommitFormatter } from '../git/commit-formatter.js';
import { PRManager } from '../git/pr-manager.js';
import { PlatformRegistry } from '../platforms/registry.js';
import { PlatformRouter } from './platform-router.js';
import { VerifierRegistry } from '../verification/gate-runner.js';
import { RegexVerifier } from '../verification/verifiers/regex-verifier.js';
import { FileExistsVerifier } from '../verification/verifiers/file-exists-verifier.js';
import { CommandVerifier } from '../verification/verifiers/command-verifier.js';
import { BrowserVerifier } from '../verification/verifiers/browser-verifier.js';
import { AIVerifier } from '../verification/verifiers/ai-verifier.js';
import { GateRunner } from '../verification/gate-runner.js';
import { VerificationIntegration } from '../verification/verification-integration.js';
import { TierStateManager } from './tier-state-manager.js';
import { AutoAdvancement } from './auto-advancement.js';
import { Escalation } from './escalation.js';
import type { ExecutionConfig } from './execution-engine.js';
import { ExecutionEngine } from './execution-engine.js';
import { resolveUnderProjectRoot } from '../utils/project-paths.js';

/**
 * Registration type for container entries.
 */
export type RegistrationType = 'singleton' | 'transient' | 'factory';

/**
 * Simple dependency injection container.
 * Supports singleton, transient, and factory registration patterns.
 */
export class Container {
  private readonly singletons = new Map<string, unknown>();
  private readonly factories = new Map<string, () => unknown>();
  private readonly registrations = new Map<string, RegistrationType>();

  /**
   * Register a factory function for a key.
   * @param key - Registration key
   * @param factory - Factory function that creates the instance
   * @param type - Registration type (default: 'singleton')
   */
  register<T>(key: string, factory: () => T, type: RegistrationType = 'singleton'): void {
    this.factories.set(key, factory);
    this.registrations.set(key, type);
  }

  /**
   * Register a pre-created instance (always singleton).
   * @param key - Registration key
   * @param instance - Instance to register
   */
  registerInstance<T>(key: string, instance: T): void {
    this.singletons.set(key, instance);
    this.registrations.set(key, 'singleton');
  }

  /**
   * Resolve a dependency by key.
   * @param key - Registration key
   * @returns Resolved instance
   * @throws Error if key is not registered
   */
  resolve<T>(key: string): T {
    const registrationType = this.registrations.get(key);

    if (!registrationType) {
      throw new Error(`No registration found for key: ${key}`);
    }

    // Handle singleton
    if (registrationType === 'singleton') {
      if (this.singletons.has(key)) {
        return this.singletons.get(key) as T;
      }

      const factory = this.factories.get(key);
      if (factory) {
        const instance = factory() as T;
        this.singletons.set(key, instance);
        return instance;
      }

      // Instance was registered directly
      return this.singletons.get(key) as T;
    }

    // Handle transient or factory
    const factory = this.factories.get(key);
    if (!factory) {
      throw new Error(`No factory found for key: ${key}`);
    }

    return factory() as T;
  }

  /**
   * Check if a key is registered.
   * @param key - Registration key
   * @returns True if key is registered
   */
  has(key: string): boolean {
    return this.registrations.has(key);
  }

  /**
   * Clear all registrations (useful for testing).
   */
  clear(): void {
    this.singletons.clear();
    this.factories.clear();
    this.registrations.clear();
  }
}

/**
 * Creates a container with all dependencies wired up.
 * @param config - Puppet Master configuration
 * @param projectRoot - Canonical project root directory path (absolute recommended)
 * @param configPath - Optional resolved config path used to load the config
 * @param prdPath - Optional PRD file path override (honors CLI --prd flag)
 * @returns Configured container with all dependencies registered
 */
export function createContainer(config: PuppetMasterConfig, projectRoot: string, configPath?: string, prdPath?: string): Container {
  const container = new Container();

  // Register config values (instances)
  container.registerInstance('config', config);
  // Backwards-compatible key + explicit projectRoot key
  container.registerInstance('projectPath', projectRoot);
  container.registerInstance('projectRoot', projectRoot);

  // Register managers (singletons)
  container.register('configManager', () => new ConfigManager(configPath), 'singleton');
  // Use prdPath override if provided (from CLI --prd flag), otherwise use config.memory.prdFile
  const resolvedPrdPath = prdPath ?? config.memory.prdFile;
  container.register(
    'prdManager',
    () => new PrdManager(resolveUnderProjectRoot(projectRoot, resolvedPrdPath)),
    'singleton'
  );
  container.register(
    'progressManager',
    () => new ProgressManager(resolveUnderProjectRoot(projectRoot, config.memory.progressFile)),
    'singleton'
  );
  
  // Build AgentsManagerConfig from config
  const agentsConfig: AgentsManagerConfig = {
    rootPath: config.memory.agentsFile,
    multiLevelEnabled: config.memory.multiLevelAgents,
    modulePattern: 'src/*/AGENTS.md',
    phasePattern: '.puppet-master/agents/phase-*.md',
    taskPattern: '.puppet-master/agents/task-*.md',
    projectRoot,
  };
  container.register('agentsManager', () => new AgentsManager(agentsConfig), 'singleton');
  
  container.register(
    'evidenceStore',
    () => new EvidenceStore(resolveUnderProjectRoot(projectRoot, config.verification.evidenceDirectory)),
    'singleton'
  );
  container.register(
    'usageTracker',
    () => new UsageTracker(resolveUnderProjectRoot(projectRoot, '.puppet-master/usage/usage.jsonl')),
    'singleton'
  );
  container.register(
    'gitManager',
    () =>
      new GitManager(
        projectRoot,
        resolveUnderProjectRoot(projectRoot, '.puppet-master/logs/git-actions.log')
      ),
    'singleton'
  );
  container.register('branchStrategy', () => {
    const resolvedConfig = container.resolve<PuppetMasterConfig>('config');
    const gitManager = container.resolve<GitManager>('gitManager');
    const strategyConfig: BranchStrategyConfig = {
      granularity: resolvedConfig.branching.granularity,
      baseBranch: resolvedConfig.branching.baseBranch,
      namingPattern: resolvedConfig.branching.namingPattern,
    };
    return createBranchStrategy(strategyConfig, gitManager);
  }, 'singleton');
  container.register('commitFormatter', () => new CommitFormatter(), 'singleton');
  container.register('prManager', () => new PRManager(projectRoot), 'singleton');

  // Register platform components
  container.register('platformRegistry', () => {
    const registry = new PlatformRegistry();
    // Initialize with default runners if needed (will be done in start command)
    return registry;
  }, 'singleton');

  container.register('platformRouter', () => {
    const config = container.resolve<PuppetMasterConfig>('config');
    const platformRegistry = container.resolve<PlatformRegistry>('platformRegistry');
    return new PlatformRouter(config, platformRegistry);
  }, 'singleton');

  // Register verification components
  // NOTE: Verifiers must match canonical CriterionType from src/types/tiers.ts:
  //   'regex'         → RegexVerifier
  //   'file_exists'   → FileExistsVerifier
  //   'command'       → CommandVerifier (handles TEST:, CLI_VERIFY:, PERF_VERIFY:)
  //   'browser_verify'→ BrowserVerifier
  //   'ai'            → AIVerifier
  // 'manual' type is NOT supported - all criteria must be machine-verifiable.
  container.register('verifierRegistry', () => {
    const registry = new VerifierRegistry();
    const evidenceStore = container.resolve<EvidenceStore>('evidenceStore');
    const platformRegistry = container.resolve<PlatformRegistry>('platformRegistry');

    registry.register(new RegexVerifier());        // type: 'regex'
    registry.register(new FileExistsVerifier());   // type: 'file_exists'
    registry.register(new CommandVerifier(evidenceStore));    // type: 'command'
    registry.register(new BrowserVerifier(evidenceStore));    // type: 'browser_verify'
    registry.register(new AIVerifier(platformRegistry, evidenceStore)); // type: 'ai'

    // Fail fast if we missed a canonical verifier type.
    const canonicalTypes: CriterionType[] = [
      'regex',
      'file_exists',
      'browser_verify',
      'command',
      'ai',
    ];
    const missing = canonicalTypes.filter((t) => registry.get(t) === null);
    if (missing.length > 0) {
      throw new Error(`VerifierRegistry missing verifiers for types: ${missing.join(', ')}`);
    }

    return registry;
  }, 'singleton');

  container.register('gateRunner', () => {
    const verifierRegistry = container.resolve<VerifierRegistry>('verifierRegistry');
    const evidenceStore = container.resolve<EvidenceStore>('evidenceStore');
    return new GateRunner(verifierRegistry, evidenceStore);
  }, 'singleton');

  // Register core components (must come after verification for VerificationIntegration)
  container.register('tierStateManager', () => {
    const prdManager = container.resolve<PrdManager>('prdManager');
    return new TierStateManager(prdManager);
  }, 'singleton');

  container.register('verificationIntegration', () => {
    const gateRunner = container.resolve<GateRunner>('gateRunner');
    const tierStateManager = container.resolve<TierStateManager>('tierStateManager');
    const evidenceStore = container.resolve<EvidenceStore>('evidenceStore');
    return new VerificationIntegration(gateRunner, tierStateManager, evidenceStore);
  }, 'singleton');

  container.register('autoAdvancement', () => {
    const tierStateManager = container.resolve<TierStateManager>('tierStateManager');
    const verificationIntegration = container.resolve<VerificationIntegration>('verificationIntegration');
    return new AutoAdvancement(tierStateManager, verificationIntegration);
  }, 'singleton');

  container.register('escalation', () => {
    const tierStateManager = container.resolve<TierStateManager>('tierStateManager');
    const config = container.resolve<PuppetMasterConfig>('config');
    return new Escalation(tierStateManager, config);
  }, 'singleton');

  // ExecutionEngine needs ExecutionConfig - build from config
  container.register('executionEngine', () => {
    // ExecutionEngine requires ExecutionConfig with defaultTimeout, hardTimeout, and stallDetection
    // Using reasonable defaults for now - these could come from config in the future
    const executionConfig: ExecutionConfig = {
      defaultTimeout: 300_000, // 5 minutes
      hardTimeout: 1_800_000, // 30 minutes
      stallDetection: {
        enabled: true,
        noOutputTimeout: 300_000, // 5 minutes
        identicalOutputThreshold: 3,
      },
    };
    return new ExecutionEngine(executionConfig);
  }, 'singleton');

  return container;
}

/**
 * Creates an orchestrator instance using the container.
 * Note: This function may not work until PH4-T08 (Orchestrator class) is implemented.
 * @param config - Puppet Master configuration
 * @param projectPath - Project working directory path
 * @returns Orchestrator instance
 * @throws Error if Orchestrator class is not available
 */
export function createOrchestrator(config: PuppetMasterConfig, projectPath: string): unknown {
  const container = createContainer(config, projectPath);
  
  // Try to resolve orchestrator - will fail if not registered
  // This is a placeholder until Orchestrator class is implemented (PH4-T08)
  if (!container.has('orchestrator')) {
    throw new Error('Orchestrator not yet implemented. Please complete PH4-T08 first.');
  }
  
  return container.resolve('orchestrator');
}