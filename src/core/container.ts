/**
 * Dependency Injection Container
 * 
 * Simple DI container for RWM Puppet Master that supports singleton, transient, and factory patterns.
 * Provides registration and resolution of dependencies without external frameworks.
 * 
 * See BUILD_QUEUE_PHASE_4.md PH4-T09 for implementation details.
 */

import type { PuppetMasterConfig } from '../types/config.js';
import { ConfigManager } from '../config/config-manager.js';
import { PrdManager } from '../memory/prd-manager.js';
import { ProgressManager } from '../memory/progress-manager.js';
import type { AgentsManagerConfig } from '../memory/agents-manager.js';
import { AgentsManager } from '../memory/agents-manager.js';
import { EvidenceStore } from '../memory/evidence-store.js';
import { UsageTracker } from '../memory/usage-tracker.js';
import { GitManager } from '../git/git-manager.js';
import { PlatformRegistry } from '../platforms/registry.js';
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
 * @param projectPath - Project working directory path
 * @returns Configured container with all dependencies registered
 */
export function createContainer(config: PuppetMasterConfig, projectPath: string): Container {
  const container = new Container();

  // Register config values (instances)
  container.registerInstance('config', config);
  container.registerInstance('projectPath', projectPath);

  // Register managers (singletons)
  container.register('configManager', () => new ConfigManager(), 'singleton');
  container.register('prdManager', () => new PrdManager(config.memory.prdFile), 'singleton');
  container.register('progressManager', () => new ProgressManager(config.memory.progressFile), 'singleton');
  
  // Build AgentsManagerConfig from config
  const agentsConfig: AgentsManagerConfig = {
    rootPath: config.memory.agentsFile,
    multiLevelEnabled: config.memory.multiLevelAgents,
    modulePattern: 'src/*/AGENTS.md',
    phasePattern: '.puppet-master/agents/phase-*.md',
    taskPattern: '.puppet-master/agents/task-*.md',
    projectRoot: projectPath,
  };
  container.register('agentsManager', () => new AgentsManager(agentsConfig), 'singleton');
  
  container.register('evidenceStore', () => new EvidenceStore(config.verification.evidenceDirectory), 'singleton');
  container.register('usageTracker', () => new UsageTracker(), 'singleton');
  container.register('gitManager', () => new GitManager(projectPath), 'singleton');

  // Register platform components
  container.register('platformRegistry', () => new PlatformRegistry(), 'singleton');

  // Register verification components
  container.register('verifierRegistry', () => {
    const registry = new VerifierRegistry();
    const evidenceStore = container.resolve<EvidenceStore>('evidenceStore');
    const platformRegistry = container.resolve<PlatformRegistry>('platformRegistry');

    registry.register(new RegexVerifier());
    registry.register(new FileExistsVerifier());
    registry.register(new CommandVerifier(evidenceStore));
    registry.register(new BrowserVerifier(evidenceStore));
    registry.register(new AIVerifier(platformRegistry, evidenceStore));

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