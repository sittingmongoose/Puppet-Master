/**
 * Orchestrator
 *
 * Main orchestrator class that coordinates all components and implements
 * the main orchestration loop for the RWM Puppet Master system.
 *
 * See ARCHITECTURE.md Section 2.1 (Core Modules) and BUILD_QUEUE_PHASE_4.md PH4-T08.
 */

import type { OrchestratorContext, OrchestratorState, TierState, TierType } from '../types/state.js';
import type { PuppetMasterConfig } from '../types/config.js';
import type { TierPlan } from '../types/tiers.js';
import type { PRD } from '../types/prd.js';
import type { ExecutionRequest } from '../types/platforms.js';
import { type PlatformRouter, NoPlatformAvailableError } from './platform-router.js';
import { PlatformRegistry } from '../platforms/registry.js';
import { PlatformHealthChecker } from '../platforms/health-check.js';
import { HealthMonitor } from '../platforms/health-monitor.js';
import {
  CapabilityDiscoveryService,
  CapabilityValidationError,
} from '../platforms/capability-discovery.js';
import type { TierEvent } from '../types/events.js';
import type { IterationContext, IterationResult } from './execution-engine.js';
import type { AdvancementResult } from './auto-advancement.js';
import type { GateResult } from '../types/tiers.js';
import type { ProgressEntry } from '../memory/progress-manager.js';
import type { EscalationDecision, FailureType } from './escalation.js';
import { OrchestratorStateMachine } from './orchestrator-state-machine.js';
import { TierStateManager } from './tier-state-manager.js';
import { AutoAdvancement } from './auto-advancement.js';
import { Escalation } from './escalation.js';
import { ExecutionEngine } from './execution-engine.js';
import { PromptBuilder } from './prompt-builder.js';
import { OutputParser } from './output-parser.js';
import { TierNode } from './tier-node.js';
import type { ConfigManager } from '../config/config-manager.js';
import type { PrdManager } from '../memory/index.js';
import type { ProgressManager } from '../memory/index.js';
import type { AgentsManager } from '../memory/index.js';
import type { EvidenceStore } from '../memory/index.js';
import type { UsageTracker } from '../memory/index.js';
import type {
  GitManager,
  BranchStrategy,
  BranchContext,
  CommitFormatter,
  CommitContext,
  PRManager,
} from '../git/index.js';
import { WorktreeManager } from '../git/index.js';
import type { VerificationIntegration } from '../verification/verification-integration.js';
import type { EventBus } from '../logging/event-bus.js';
import type { PromotionEngine, AgentsEntry } from '../agents/index.js';
import type { MultiLevelLoader } from '../agents/index.js';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { validateConfig as validateConfigSchema } from '../config/config-schema.js';
import type { Platform } from '../types/config.js';
import { resolveWorkingDirectory } from '../utils/project-paths.js';
import { StatePersistence } from './state-persistence.js';
import { CheckpointManager } from './checkpoint-manager.js';
import type { CurrentPosition, CheckpointMetadata } from './checkpoint-manager.js';
import { TierStateMachine, type TierContext } from './tier-state-machine.js';
import {
  WorkerReviewerOrchestrator,
  shouldUseWorkerReviewer,
  createWorkerReviewerOrchestrator,
} from './worker-reviewer.js';
import { LoopGuard } from './loop-guard.js';
import { ParallelExecutor } from './parallel-executor.js';
import type { ParallelExecutionResult } from './parallel-executor.js';
import { validateDependencies, DependencyCycleError } from './dependency-analyzer.js';
import { EventLedger } from '../state/event-ledger.js';
import { MetricsCollector } from '../metrics/metrics-collector.js';
import { QuotaExhaustedError } from '../platforms/quota-manager.js';

// Best-effort copy of PlatformRouter fallback preferences, used when a platform
// is known-unhealthy and we want deterministic alternatives.
const ROUTING_FALLBACK_CHAIN: Record<Platform, Platform[]> = {
  cursor: ['codex', 'claude', 'gemini', 'copilot'],
  codex: ['claude', 'cursor', 'gemini', 'copilot'],
  claude: ['codex', 'cursor', 'gemini', 'copilot'],
  gemini: ['copilot', 'codex', 'cursor', 'claude'],
  copilot: ['gemini', 'codex', 'cursor', 'claude'],
};

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * CLI check result interface
 */
export interface CLICheckResult {
  allAvailable: boolean;
  missing: string[];
}

/**
 * Configuration for orchestrator initialization
 */
export interface OrchestratorConfig {
  config: PuppetMasterConfig;
  projectPath: string;
  eventBus?: EventBus;
}

/**
 * All dependencies required by the orchestrator
 */
export interface OrchestratorDependencies {
  configManager: ConfigManager;
  prdManager: PrdManager;
  progressManager: ProgressManager;
  agentsManager: AgentsManager;
  evidenceStore: EvidenceStore;
  usageTracker: UsageTracker;
  gitManager: GitManager;
  branchStrategy: BranchStrategy;
  commitFormatter: CommitFormatter;
  prManager: PRManager;
  platformRegistry: PlatformRegistry;
  platformRouter: PlatformRouter;
  verificationIntegration: VerificationIntegration;
  /** P0-G02: Capability discovery service for preflight validation */
  capabilityDiscovery?: CapabilityDiscoveryService;
  /** Promotion engine for auto-promoting learnings to AGENTS.md */
  promotionEngine?: PromotionEngine;
  /** Multi-level loader for checking duplicate entries during promotion */
  multiLevelLoader?: MultiLevelLoader;
}

/**
 * Progress information interface
 */
export interface OrchestratorProgress {
  state: OrchestratorState;
  currentPhase: { id: string; title: string } | null;
  currentTask: { id: string; title: string } | null;
  currentSubtask: { id: string; title: string } | null;
  completedSubtasks: number;
  totalSubtasks: number;
  iterationsRun: number;
  startedAt: string;
  elapsedTime: number;
}

export interface PlatformHealthSnapshot {
  platforms: Partial<
    Record<
      Platform,
      {
        status: 'healthy' | 'degraded' | 'unhealthy';
        latencyMs: number;
        lastCheck: string;
        consecutiveFailures: number;
        lastError?: string;
      }
    >
  >;
}

/**
 * Main Orchestrator class
 */
export class Orchestrator {
  private stateMachine: OrchestratorStateMachine;
  private readonly tierStateManager: TierStateManager;
  private readonly autoAdvancement: AutoAdvancement;
  private readonly escalation: Escalation;
  private readonly executionEngine: ExecutionEngine;
  private readonly promptBuilder: PromptBuilder;
  private readonly outputParser: OutputParser;
  private readonly deps: OrchestratorDependencies;
  private readonly config: PuppetMasterConfig;
  private readonly eventBus: EventBus | null;
  private readonly projectRoot: string;
  private readonly workingDirectory: string;
  private eventLedger: EventLedger | null = null;
  private healthMonitor: HealthMonitor | null = null;
  private metricsCollector: MetricsCollector | null = null;

  private startedAt: Date | null = null;
  private iterationsRun: number = 0;
  private loopRunning: boolean = false;
  private loopAborted: boolean = false;

  private statePersistence: StatePersistence | null = null;
  private checkpointManager: CheckpointManager | null = null;
  private workerReviewerOrchestrator: WorkerReviewerOrchestrator | null = null;
  private loopGuard: LoopGuard | null = null;
  private loopGuardSubtaskId: string | undefined;
  private parallelExecutor: ParallelExecutor | null = null;
  private worktreeManager: WorktreeManager | null = null;

  /**
   * P0-G09: Queue for storing iterations when quota is exhausted.
   * Items are added when 'queue' behavior is triggered and processed on resume.
   */
  private iterationQueue: Array<{
    subtaskId: string;
    platform: Platform;
    queuedAt: Date;
    resetsAt: string; // ISO string from QuotaExhaustedError
  }> = [];

  private requireTierTransition(tier: TierNode, event: TierEvent, reason: string): void {
    const from = tier.getState();
    const ok = tier.stateMachine.send(event);
    if (!ok) {
      throw new Error(
        `Invalid tier transition: ${tier.type} ${tier.id} (${from}) + ${event.type} (${reason})`
      );
    }

    // Persist transition to SQLite ledger (P2-T03).
    if (this.eventLedger) {
      const to = tier.getState();
      const ctx = tier.stateMachine.getContext();
      const timestamp = new Date().toISOString();

      // Event-type record (matches CLI examples like --type iteration_complete).
      this.eventLedger.append({
        timestamp,
        type: event.type.toLowerCase(),
        tierId: tier.id,
        data: {
          tierType: tier.type,
          from,
          to,
          eventType: event.type,
          iterationCount: ctx.iterationCount,
          maxIterations: ctx.maxIterations,
          lastError: ctx.lastError,
          gateResult: ctx.gateResult,
        },
      });

      // Generic transition record.
      this.eventLedger.append({
        timestamp,
        type: 'tier_state_changed',
        tierId: tier.id,
        data: {
          tierType: tier.type,
          from,
          to,
          eventType: event.type,
          iterationCount: ctx.iterationCount,
          maxIterations: ctx.maxIterations,
          lastError: ctx.lastError,
          gateResult: ctx.gateResult,
        },
      });
    }

    // Publish tier change event (for GUI/observers).
    if (this.eventBus) {
      this.eventBus.emit({
        type: 'tier_changed',
        tierId: tier.id,
        from,
        to: tier.getState(),
      });
    }

    // Record transition for metrics (primarily escalation tracking).
    this.metricsCollector?.recordTierTransition(tier.id, from, tier.getState());
  }

  private ensureSubtaskReadyForIteration(subtask: TierNode): void {
    const state = subtask.getState();

    switch (state) {
      case 'pending':
        this.requireTierTransition(subtask, { type: 'TIER_SELECTED' }, 'selecting subtask for iteration');
        this.requireTierTransition(subtask, { type: 'PLAN_APPROVED' }, 'approving plan before iteration');
        return;
      case 'planning':
        this.requireTierTransition(subtask, { type: 'PLAN_APPROVED' }, 'approving plan before iteration');
        return;
      case 'retrying':
        this.requireTierTransition(subtask, { type: 'NEW_ATTEMPT' }, 'starting new attempt before iteration');
        return;
      case 'running':
        return;
      case 'gating':
      case 'passed':
      case 'failed':
      case 'escalated':
        // These states must be handled by the caller (gate/advance/stop), not by spawning an iteration.
        return;
      default: {
        const exhaustive: never = state;
        throw new Error(`Unhandled subtask state: ${exhaustive}`);
      }
    }
  }

  constructor(orchestratorConfig: OrchestratorConfig) {
    this.config = orchestratorConfig.config;
    this.eventBus = orchestratorConfig.eventBus || null;
    this.projectRoot = orchestratorConfig.projectPath;
    this.workingDirectory = resolveWorkingDirectory(this.projectRoot, this.config.project.workingDirectory);
    this.stateMachine = new OrchestratorStateMachine();
    
    // These will be initialized in initialize() when deps are provided
    this.tierStateManager = null as unknown as TierStateManager;
    this.autoAdvancement = null as unknown as AutoAdvancement;
    this.escalation = null as unknown as Escalation;
    this.executionEngine = new ExecutionEngine({
      defaultTimeout: 300000, // 5 minutes
      hardTimeout: 600000, // 10 minutes
      stallDetection: {
        enabled: true,
        noOutputTimeout: 120000, // 2 minutes
        identicalOutputThreshold: 10,
      },
      killAgentOnFailure: this.config.execution?.killAgentOnFailure ?? true,
    });
    this.promptBuilder = new PromptBuilder();
    this.outputParser = new OutputParser();

    // Dependencies will be set in initialize()
    this.deps = null as unknown as OrchestratorDependencies;
  }

  /**
   * Initialize all components
   */
  async initialize(deps: OrchestratorDependencies): Promise<void> {
    // Store dependencies
    (this as unknown as { deps: OrchestratorDependencies }).deps = deps;

    // Platform Health Monitoring (P2-T07)
    // Start periodic checks immediately; status is used to avoid unhealthy platforms.
    const healthChecker = new PlatformHealthChecker(undefined, this.config.cliPaths);
    this.healthMonitor = new HealthMonitor({
      registry: deps.platformRegistry,
      checker: healthChecker,
      config: { checkIntervalMs: 30_000 },
    });
    await this.healthMonitor.startMonitoring(deps.platformRegistry.getAvailable());

    // Initialize SQLite event ledger (P2-T03)
    const ledgerPath = join(this.projectRoot, '.puppet-master', 'events.db');
    (this as unknown as { eventLedger: EventLedger | null }).eventLedger = new EventLedger(ledgerPath);

    // Initialize tier state manager
    (this as unknown as { tierStateManager: TierStateManager }).tierStateManager = new TierStateManager(deps.prdManager);
    await this.tierStateManager.initialize();

    // Initialize auto-advancement
    (this as unknown as { autoAdvancement: AutoAdvancement }).autoAdvancement = new AutoAdvancement(
      this.tierStateManager,
      deps.verificationIntegration
    );

    // Initialize escalation
    (this as unknown as { escalation: Escalation }).escalation = new Escalation(this.tierStateManager, this.config);

    // Initialize state persistence
    const checkpointDir = join(this.projectRoot, '.puppet-master', 'checkpoints');
    (this as unknown as { statePersistence: StatePersistence }).statePersistence = new StatePersistence(
      deps.prdManager,
      checkpointDir
    );

    // Initialize checkpoint manager
    const maxCheckpoints = this.config.checkpointing?.maxCheckpoints ?? 10;
    (this as unknown as { checkpointManager: CheckpointManager }).checkpointManager = new CheckpointManager(
      checkpointDir,
      maxCheckpoints
    );

    // Initialize worker/reviewer orchestrator if configured (P1-T13)
    if (shouldUseWorkerReviewer(this.config)) {
      (this as unknown as { workerReviewerOrchestrator: WorkerReviewerOrchestrator | null }).workerReviewerOrchestrator =
        createWorkerReviewerOrchestrator(
          this.config,
          deps.platformRegistry,
          deps.progressManager,
          this.promptBuilder
        );
      console.log('[Orchestrator] Worker/Reviewer separation enabled');
    }

    // Initialize loop guard if configured (P2-T02)
    if (this.config.loopGuard?.enabled) {
      (this as unknown as { loopGuard: LoopGuard | null }).loopGuard = new LoopGuard(this.config.loopGuard);
      console.log('[Orchestrator] Loop guard enabled');
    }

    // Initialize parallel execution if configured (P2-T01)
    const parallelConfig = this.config.execution?.parallel;
    if (parallelConfig?.enabled) {
      const worktreeDir = parallelConfig.worktreeDir ?? '.puppet-master/worktrees';
      const worktreeManager = new WorktreeManager(this.projectRoot, deps.gitManager, {
        worktreeDir,
        cleanupOnMerge: true,
      });
      (this as unknown as { worktreeManager: WorktreeManager }).worktreeManager = worktreeManager;
      
      const parallelExecutor = new ParallelExecutor(
        worktreeManager,
        this.executionEngine,
        this.eventBus,
        {
          maxConcurrency: parallelConfig.maxConcurrency ?? 3,
          continueOnFailure: parallelConfig.continueOnFailure ?? false,
          mergeResults: parallelConfig.mergeResults ?? true,
          targetBranch: parallelConfig.targetBranch,
        }
      );
      (this as unknown as { parallelExecutor: ParallelExecutor }).parallelExecutor = parallelExecutor;
      console.log(`[Orchestrator] Parallel execution enabled (maxConcurrency: ${parallelConfig.maxConcurrency ?? 3})`);
    }

    // Set up execution engine (runner will be set per iteration via PlatformRouter)
    this.executionEngine.setGitManager(deps.gitManager);

    // Register output callbacks for EventBus streaming
    if (this.eventBus) {
      this.executionEngine.onOutput((output: string) => {
        const currentSubtask = this.tierStateManager.getCurrentSubtask();
        if (currentSubtask && this.eventBus) {
          this.eventBus.emit({
            type: 'output_chunk',
            subtaskId: currentSubtask.id,
            chunk: output,
          });
        }
      });
    }

    // Restore orchestrator state (PRD preferred; ledger is fallback) (P2-T03).
    const prd = await deps.prdManager.load();
    const prdHasOrchestratorState = Boolean(prd.orchestratorState && prd.orchestratorContext);

    if (prdHasOrchestratorState) {
      this.stateMachine = new OrchestratorStateMachine({ initialState: prd.orchestratorState });
      this.stateMachine.restoreInternalContext(prd.orchestratorContext as OrchestratorContext);

      this.eventLedger?.append({
        timestamp: new Date().toISOString(),
        type: 'orchestrator_restored',
        data: {
          source: 'prd',
          state: this.stateMachine.getCurrentState(),
          context: this.stateMachine.getContext(),
        },
      });
    } else {
      const recovered = this.eventLedger?.recover() ?? null;
      if (recovered) {
        const snap = recovered.snapshot;
        this.stateMachine = new OrchestratorStateMachine({ initialState: snap.orchestratorState });
        this.stateMachine.restoreInternalContext(snap.orchestratorContext);
        this.restoreTierStatesFromLedgerSnapshot(snap.tierStates);

        this.eventLedger?.append({
          timestamp: new Date().toISOString(),
          type: 'orchestrator_restored',
          data: {
            source: recovered.recoveredFrom,
            state: this.stateMachine.getCurrentState(),
            context: this.stateMachine.getContext(),
            lastEventTimestamp: recovered.lastEventTimestamp,
          },
        });
      } else {
        const previousState = this.stateMachine.getCurrentState();
        this.stateMachine.send({ type: 'INIT' });
        const newState = this.stateMachine.getCurrentState();

        this.eventLedger?.append({
          timestamp: new Date().toISOString(),
          type: 'orchestrator_state_changed',
          data: { from: previousState, to: newState, eventType: 'INIT', context: this.stateMachine.getContext() },
        });
      }
    }

    // Record an initial snapshot for crash recovery and inspection.
    this.appendLedgerSnapshot('initialize');

    // Set up signal handlers for graceful shutdown with checkpoint
    this.setupSignalHandlers();
  }

  /**
   * Set up signal handlers for graceful shutdown with checkpoint
   */
  private setupSignalHandlers(): void {
    const handleSignal = async (signal: NodeJS.Signals): Promise<void> => {
      console.log(`Received ${signal}, creating checkpoint and shutting down...`);
      try {
        if (this.config.checkpointing?.enabled && this.config.checkpointing?.checkpointOnShutdown) {
          await this.createCheckpoint('shutdown');
        }
      } catch (error) {
        console.warn('Failed to create checkpoint on shutdown:', error);
      }
      process.exit(0);
    };

    process.on('SIGTERM', handleSignal);
    process.on('SIGINT', handleSignal);
  }

  /**
   * Begin orchestration loop
   * 
   * P0-G02: Calls validateReadyForExecution() before starting to ensure
   * all required platforms are available, authenticated, and not stale.
   */
  async start(): Promise<void> {
    if (this.stateMachine.getCurrentState() !== 'planning') {
      throw new Error(`Cannot start from state: ${this.stateMachine.getCurrentState()}`);
    }

    // P0-G02: Preflight validation - check all required platforms before starting
    await this.validatePreflightRequirements();

    const previousState = this.stateMachine.getCurrentState();
    this.stateMachine.send({ type: 'START' });
    const newState = this.stateMachine.getCurrentState();

    // Publish state change event
    if (this.eventBus) {
      this.eventBus.emit({
        type: 'state_changed',
        from: previousState,
        to: newState,
      });
    }

    // Persist orchestrator transition (P2-T03)
    this.eventLedger?.append({
      timestamp: new Date().toISOString(),
      type: 'orchestrator_state_changed',
      data: {
        from: previousState,
        to: newState,
        eventType: 'START',
        context: this.stateMachine.getContext(),
      },
    });

    this.startedAt = new Date();
    this.metricsCollector = new MetricsCollector({ startedAt: this.startedAt });
    this.iterationsRun = 0;
    this.loopRunning = true;
    this.loopAborted = false;

    await this.runLoop();
  }

  /**
   * Validates that all platforms required by the current configuration are ready.
   * 
   * P0-G02: Per ARCHITECTURE.md Section 8.3 (Orchestrator Integration).
   * Throws CapabilityValidationError if validation fails.
   */
  private async validatePreflightRequirements(): Promise<void> {
    const capabilityDiscovery = this.deps.capabilityDiscovery;
    
    // If no capability discovery service provided, skip validation (backwards compatibility)
    if (!capabilityDiscovery) {
      console.warn(
        '[Orchestrator] No capability discovery service provided. ' +
        'Skipping preflight validation. Consider running `puppet-master doctor` first.'
      );
      return;
    }

    // Extract required platforms from tier configuration
    const requiredPlatforms = this.getRequiredPlatformsFromConfig();
    
    if (requiredPlatforms.length === 0) {
      console.warn('[Orchestrator] No platforms configured in tiers. Skipping preflight validation.');
      return;
    }

    // Emit preflight event
    if (this.eventBus) {
      this.eventBus.emit({
        type: 'preflight_started',
        platforms: requiredPlatforms,
      });
    }

    const validation = await capabilityDiscovery.validateReadyForExecution(requiredPlatforms);

    if (!validation.ready) {
      // Emit failure event
      if (this.eventBus) {
        this.eventBus.emit({
          type: 'preflight_failed',
          issues: validation.issues,
          suggestions: validation.suggestions,
          mustRunDoctor: validation.mustRunDoctor,
        });
      }

      // Build helpful error message
      const suggestion = validation.mustRunDoctor
        ? "Run 'puppet-master doctor' to discover and validate capabilities"
        : validation.suggestions.join('; ');
      
      throw new CapabilityValidationError(
        'Cannot start execution: ' + validation.issues.join('; '),
        validation.issues,
        suggestion
      );
    }

    // Emit success event
    if (this.eventBus) {
      this.eventBus.emit({
        type: 'preflight_passed',
        platforms: requiredPlatforms,
      });
    }
  }

  /**
   * Extracts all unique platforms required by the tier configuration.
   */
  private getRequiredPlatformsFromConfig(): Platform[] {
    const platforms = new Set<Platform>();
    
    const tierConfigs = this.config.tiers;
    if (tierConfigs.phase?.platform) platforms.add(tierConfigs.phase.platform);
    if (tierConfigs.task?.platform) platforms.add(tierConfigs.task.platform);
    if (tierConfigs.subtask?.platform) platforms.add(tierConfigs.subtask.platform);
    if (tierConfigs.iteration?.platform) platforms.add(tierConfigs.iteration.platform);
    
    return Array.from(platforms);
  }

  /**
   * Pause execution
   */
  async pause(reason?: string): Promise<void> {
    if (this.stateMachine.getCurrentState() !== 'executing') {
      throw new Error(`Cannot pause from state: ${this.stateMachine.getCurrentState()}`);
    }

    const previousState = this.stateMachine.getCurrentState();
    this.stateMachine.send({ type: 'PAUSE', reason });
    const newState = this.stateMachine.getCurrentState();

    // Publish state change event
    if (this.eventBus) {
      this.eventBus.emit({
        type: 'state_changed',
        from: previousState,
        to: newState,
      });
    }

    this.eventLedger?.append({
      timestamp: new Date().toISOString(),
      type: 'orchestrator_state_changed',
      data: {
        from: previousState,
        to: newState,
        eventType: 'PAUSE',
        reason,
        context: this.stateMachine.getContext(),
      },
    });

    this.loopAborted = true;
  }

  /**
   * Resume execution
   */
  async resume(): Promise<void> {
    if (this.stateMachine.getCurrentState() !== 'paused') {
      throw new Error(`Cannot resume from state: ${this.stateMachine.getCurrentState()}`);
    }

    // P0-G09: Log queue status on resume
    if (this.iterationQueue.length > 0) {
      console.log(`[Orchestrator] Resuming with ${this.iterationQueue.length} queued iteration(s)`);

      // Check if any queued items have passed their reset time
      const now = new Date().toISOString();
      const readyItems = this.iterationQueue.filter((item) => item.resetsAt <= now);
      const waitingItems = this.iterationQueue.filter((item) => item.resetsAt > now);

      if (readyItems.length > 0) {
        console.log(`[Orchestrator] ${readyItems.length} queued item(s) ready for retry`);
      }
      if (waitingItems.length > 0) {
        const nextReset = waitingItems.reduce(
          (min, item) => (item.resetsAt < min ? item.resetsAt : min),
          waitingItems[0].resetsAt
        );
        console.log(`[Orchestrator] ${waitingItems.length} item(s) still waiting, next reset at ${nextReset}`);
      }

      // Clear the queue - runLoop will naturally retry the current subtask
      this.iterationQueue = [];
    }

    const previousState = this.stateMachine.getCurrentState();
    this.stateMachine.send({ type: 'RESUME' });
    const newState = this.stateMachine.getCurrentState();

    // Publish state change event
    if (this.eventBus) {
      this.eventBus.emit({
        type: 'state_changed',
        from: previousState,
        to: newState,
      });
    }

    this.eventLedger?.append({
      timestamp: new Date().toISOString(),
      type: 'orchestrator_state_changed',
      data: {
        from: previousState,
        to: newState,
        eventType: 'RESUME',
        context: this.stateMachine.getContext(),
      },
    });

    this.loopRunning = true;
    this.loopAborted = false;

    await this.runLoop();
  }

  /**
   * Cleanly terminate
   */
  async stop(): Promise<void> {
    const previousState = this.stateMachine.getCurrentState();
    this.stateMachine.send({ type: 'STOP' });
    const newState = this.stateMachine.getCurrentState();

    // Stop background health checks (P2-T07).
    this.healthMonitor?.stopMonitoring();

    // Publish state change event
    if (this.eventBus) {
      this.eventBus.emit({
        type: 'state_changed',
        from: previousState,
        to: newState,
      });
    }

    this.eventLedger?.append({
      timestamp: new Date().toISOString(),
      type: 'orchestrator_state_changed',
      data: {
        from: previousState,
        to: newState,
        eventType: 'STOP',
        context: this.stateMachine.getContext(),
      },
    });

    this.loopAborted = true;
    this.loopRunning = false;

    // Create checkpoint before stopping if enabled
    if (this.config.checkpointing?.enabled && this.config.checkpointing?.checkpointOnShutdown) {
      try {
        await this.createCheckpoint('shutdown');
      } catch (error) {
        console.warn('Failed to create checkpoint on stop:', error);
      }
    }

    // Sync state to PRD
    await this.tierStateManager.syncToPrd();

    // Ensure ledger is flushed/closed on stop (best-effort)
    this.eventLedger?.close();
  }

  /**
   * Get current orchestrator state
   */
  getState(): OrchestratorState {
    return this.stateMachine.getCurrentState();
  }

  /**
   * Get current progress information
   */
  getProgress(): OrchestratorProgress {
    const currentPhase = this.tierStateManager.getCurrentPhase();
    const currentTask = this.tierStateManager.getCurrentTask();
    const currentSubtask = this.tierStateManager.getCurrentSubtask();

    const allSubtasks = this.tierStateManager.getAllSubtasks();
    const completedSubtasks = allSubtasks.filter((s) => s.getState() === 'passed').length;

    const elapsedTime = this.startedAt
      ? Math.floor((Date.now() - this.startedAt.getTime()) / 1000)
      : 0;

    return {
      state: this.getState(),
      currentPhase: currentPhase
        ? { id: currentPhase.id, title: currentPhase.data.title }
        : null,
      currentTask: currentTask ? { id: currentTask.id, title: currentTask.data.title } : null,
      currentSubtask: currentSubtask
        ? { id: currentSubtask.id, title: currentSubtask.data.title }
        : null,
      completedSubtasks,
      totalSubtasks: allSubtasks.length,
      iterationsRun: this.iterationsRun,
      startedAt: this.startedAt?.toISOString() ?? new Date().toISOString(),
      elapsedTime,
    };
  }

  /**
   * Get current platform health snapshot for GUI display (P2-T07).
   *
   * Returns a JSON-serializable structure (Dates converted to ISO strings).
   */
  getPlatformHealthSnapshot(): PlatformHealthSnapshot {
    const snapshot: PlatformHealthSnapshot['platforms'] = {};
    const all = this.healthMonitor?.getAllHealth() ?? new Map();

    for (const [platformAny, status] of all.entries()) {
      const platform = platformAny as Platform;
      snapshot[platform] = {
        status: status.status,
        latencyMs: status.latencyMs,
        lastCheck: status.lastCheck.toISOString(),
        consecutiveFailures: status.consecutiveFailures,
        lastError: status.lastError,
      };
    }

    return { platforms: snapshot };
  }

  /**
   * Load a project into the orchestrator
   */
  async loadProject(params: {
    path: string;
    prd: PRD;
    config: PuppetMasterConfig;
  }): Promise<void> {
    if (!this.deps || !this.deps.prdManager) {
      throw new Error('Orchestrator not initialized. Call initialize() first.');
    }

    // Update PRD manager with new PRD
    await this.deps.prdManager.save(params.prd);

    // Reload tier state from PRD
    await this.tierStateManager.initialize();

    // Publish project_loaded event
    if (this.eventBus) {
      this.eventBus.emit({
        type: 'project_loaded',
        name: params.prd.project,
        path: params.path,
        phasesTotal: params.prd.phases?.length || 0,
        tasksTotal: params.prd.metadata?.totalTasks || 0,
        subtasksTotal: params.prd.metadata?.totalSubtasks || 0,
      });
    }
  }

  /**
   * Get current loaded project info
   */
  async getCurrentProject(): Promise<{ name: string; phasesTotal: number; tasksTotal: number; subtasksTotal: number } | null> {
    if (!this.deps || !this.deps.prdManager) {
      return null;
    }

    try {
      const prd = await this.deps.prdManager.load();
      if (!prd) {
        return null;
      }

      return {
        name: prd.project,
        phasesTotal: prd.phases?.length || 0,
        tasksTotal: prd.metadata?.totalTasks || 0,
        subtasksTotal: prd.metadata?.totalSubtasks || 0,
      };
    } catch {
      return null;
    }
  }

  /**
   * Get the TierStateManager instance
   */
  getTierStateManager(): TierStateManager {
    return this.tierStateManager;
  }

  /**
   * Main orchestration loop
   */
  private async runLoop(): Promise<void> {
    while (this.stateMachine.getCurrentState() === 'executing' && !this.loopAborted) {
      try {
        // Get current subtask
        const subtask = this.tierStateManager.getCurrentSubtask();
        if (!subtask) {
          // No more subtasks, check if we should advance or complete
          const advancement = await this.autoAdvancement.checkAndAdvance();
          await this.handleAdvancement(advancement);
          continue;
        }

        // Reset loop guard when switching subtasks (P2-T02)
        if (this.loopGuard && subtask.id !== this.loopGuardSubtaskId) {
          this.loopGuard.reset();
          this.loopGuardSubtaskId = subtask.id;
        }

        const subtaskState = subtask.getState();

        // If a subtask is already complete, do not spawn an iteration — advance selection.
        if (subtaskState === 'passed') {
          const advancement = await this.autoAdvancement.checkAndAdvance();
          await this.handleAdvancement(advancement);
          continue;
        }

        // If we're in gating (e.g., restored from PRD mid-flight), run the subtask gate now.
        if (subtaskState === 'gating') {
          // No transcript available when resuming from gating state
          const gate = await this.deps.verificationIntegration.runSubtaskGate(subtask, undefined);
          await this.handleGateResult(gate, subtask);
          const advancement = await this.autoAdvancement.checkAndAdvance();
          await this.handleAdvancement(advancement);
          continue;
        }

        // Escalated/failed subtasks are not runnable; stop rather than looping forever.
        if (subtaskState === 'escalated' || subtaskState === 'failed') {
          throw new Error(`Current subtask ${subtask.id} is not runnable (state: ${subtaskState}).`);
        }

        // Ensure the tier state machine is in a valid state before spawning an iteration.
        this.ensureSubtaskReadyForIteration(subtask);

        // Build iteration context
        const context = await this.buildIterationContext(subtask);

        // Get platform runner from registry based on selected platform
        const runner = this.deps.platformRegistry.get(context.platform);
        if (!runner) {
          throw new Error(`Platform runner not available for platform: ${context.platform}`);
        }

        // Ensure correct branch before executing the iteration
        const task = subtask.parent;
        const phase = task?.parent;
        if (phase && task) {
          const branchContext: BranchContext = {
            phaseId: phase.id,
            taskId: task.id,
            subtaskId: subtask.id,
            isComplete: false,
          };
          await this.deps.branchStrategy.ensureBranch(branchContext);
        }

        // Publish iteration_started event
        if (this.eventBus) {
          this.eventBus.emit({
            type: 'iteration_started',
            subtaskId: subtask.id,
            iterationNumber: context.iterationNumber,
          });
        }

        // P0-G09: Execute iteration with quota fallback handling
        const result = await this.executeWithQuotaFallback(context, runner, subtask.id);

        // Publish iteration_completed event
        if (this.eventBus) {
          this.eventBus.emit({
            type: 'iteration_completed',
            subtaskId: subtask.id,
            passed: result.success,
          });
        }

        // Worker/Reviewer separation (P1-T13): If enabled and worker claims done,
        // run reviewer phase before proceeding to gate
        let shouldRunGate = result.success && result.completionSignal === 'COMPLETE';
        let reviewerFeedback: string | undefined;

        if (shouldRunGate && this.workerReviewerOrchestrator?.isEnabled()) {
          const workerResult = WorkerReviewerOrchestrator.toWorkerResult(result);
          const outcome = await this.workerReviewerOrchestrator.runReviewerPhase(workerResult, context);

          // Publish reviewer event
          if (this.eventBus && outcome.reviewerResult) {
            this.eventBus.emit({
              type: 'reviewer_verdict',
              subtaskId: subtask.id,
              verdict: outcome.reviewerResult.verdict,
              confidence: outcome.reviewerResult.confidence,
            });
          }
          if (outcome.reviewerResult) {
            this.metricsCollector?.recordReviewerVerdict(subtask.id, outcome.reviewerResult.verdict);
          }

          if (outcome.status === 'revise') {
            // Reviewer says REVISE - don't run gate, will retry in next iteration
            shouldRunGate = false;
            reviewerFeedback = outcome.combinedFeedback;
            console.log(`[Orchestrator] Reviewer verdict: REVISE for ${subtask.id}`);

            // Loop guard check (P2-T02): Detect repeated identical feedback
            if (this.loopGuard) {
              const feedbackMessage = {
                kind: 'reviewer_feedback',
                content: outcome.combinedFeedback ?? '',
              };
              if (!this.loopGuard.shouldAllow(feedbackMessage)) {
                // Identical feedback repeated too many times - force immediate failure
                console.log(`[Orchestrator] Loop guard triggered: repeated REVISE feedback for ${subtask.id}, forcing MAX_ATTEMPTS`);
                // Set iteration count to maxIterations-1 so that handleIterationFailed
                // will increment to maxIterations and trigger MAX_ATTEMPTS failure
                const maxIter = subtask.data.maxIterations;
                subtask.stateMachine.restoreInternalContext({ iterationCount: maxIter - 1 });
                result.success = false;
                result.completionSignal = undefined;
                result.error = 'MAX_ATTEMPTS: Reviewer feedback loop detected - identical feedback repeated';
                // Continue to handleIterationResult which will transition to failed state
              } else {
                // Normal REVISE - mark iteration as needing revision
                result.success = false;
                result.completionSignal = undefined;
                result.error = `Reviewer verdict: REVISE - ${outcome.reviewerResult?.feedback ?? 'No feedback'}`;
              }
            } else {
              // Loop guard not enabled - normal REVISE handling
              result.success = false;
              result.completionSignal = undefined;
              result.error = `Reviewer verdict: REVISE - ${outcome.reviewerResult?.feedback ?? 'No feedback'}`;
            }
          } else if (outcome.status === 'complete') {
            // Reviewer says SHIP - proceed to gate
            console.log(`[Orchestrator] Reviewer verdict: SHIP for ${subtask.id} (confidence: ${outcome.reviewerResult?.confidence})`);
          } else if (outcome.status === 'failed') {
            shouldRunGate = false;
            console.log(`[Orchestrator] Worker failed for ${subtask.id}`);
          }
        }

        // Record iteration metrics (after potential reviewer modification)
        this.metricsCollector?.recordIteration(context, result);

        // Handle result (after potential reviewer modification)
        await this.handleIterationResult(result, subtask);

        // Run the subtask gate immediately after a COMPLETE signal so advancement can proceed.
        // Only if worker completed AND (reviewer approved OR reviewer not enabled)
        if (shouldRunGate) {
          // Pass execution output as transcript for AGENTS.md enforcement
          const gate = await this.deps.verificationIntegration.runSubtaskGate(subtask, result.output);
          await this.handleGateResult(gate, subtask);
        }

        // Record progress (include reviewer feedback if present)
        await this.recordProgress(result, subtask, reviewerFeedback);

        // Publish budget update event
        await this.publishBudgetUpdateEvent(subtask);

        // Commit changes
        await this.commitChanges(result, subtask);

        // Check advancement
        const advancement = await this.autoAdvancement.checkAndAdvance();
        await this.handleAdvancement(advancement);

        // Persist latest metrics snapshot for CLI/GUI consumption (best-effort).
        await this.writeMetricsSnapshotBestEffort();

        this.iterationsRun++;

        // Create periodic checkpoint if enabled and interval reached
        if (
          this.config.checkpointing?.enabled &&
          this.iterationsRun > 0 &&
          this.iterationsRun % (this.config.checkpointing.interval ?? 10) === 0
        ) {
          await this.createPeriodicCheckpoint();
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // P0-G06: Handle NoPlatformAvailableError gracefully by pausing instead of crashing
        if (error instanceof NoPlatformAvailableError) {
          console.warn(`[Orchestrator] No platform available: ${errorMessage}`);
          console.warn('[Orchestrator] Pausing execution. Run `puppet-master doctor` to resolve, then resume.');

          // Emit specific event for GUI/monitoring
          if (this.eventBus) {
            this.eventBus.emit({
              type: 'error',
              error: `No platform available: ${errorMessage}`,
              context: {
                state: this.stateMachine.getCurrentState(),
                iterationsRun: this.iterationsRun,
                errorType: 'no_platform_available',
                recoverable: true,
                suggestion: 'Run `puppet-master doctor` to check platform availability and authentication, then resume execution.',
              },
            });
          }

          // Pause instead of transitioning to error state
          const previousState = this.stateMachine.getCurrentState();
          this.stateMachine.send({ type: 'PAUSE', reason: `No platform available: ${errorMessage}` });
          const newState = this.stateMachine.getCurrentState();

          this.eventLedger?.append({
            timestamp: new Date().toISOString(),
            type: 'orchestrator_state_changed',
            data: {
              from: previousState,
              to: newState,
              eventType: 'PAUSE',
              reason: `No platform available: ${errorMessage}`,
              context: this.stateMachine.getContext(),
            },
          });

          // Exit loop gracefully (don't throw)
          this.loopRunning = false;
          return;
        }

        // Publish error event for other errors
        if (this.eventBus) {
          this.eventBus.emit({
            type: 'error',
            error: errorMessage,
            context: {
              state: this.stateMachine.getCurrentState(),
              iterationsRun: this.iterationsRun,
            },
          });
        }

        const previousState = this.stateMachine.getCurrentState();
        this.stateMachine.send({ type: 'ERROR', error: errorMessage });
        const newState = this.stateMachine.getCurrentState();

        this.eventLedger?.append({
          timestamp: new Date().toISOString(),
          type: 'orchestrator_state_changed',
          data: {
            from: previousState,
            to: newState,
            eventType: 'ERROR',
            error: errorMessage,
            context: this.stateMachine.getContext(),
          },
        });

        this.appendLedgerSnapshot('error');
        throw error;
      }
    }
  }

  /**
   * Build iteration context for execution
   */
  private async buildIterationContext(
    subtask: TierNode,
    overrideWorkingDir?: string
  ): Promise<IterationContext> {
    const task = subtask.parent;
    const phase = task?.parent;

    if (!task || !phase) {
      throw new Error(`Subtask ${subtask.id} missing parent task or phase`);
    }

    // Get iteration number
    const iterationNumber = subtask.stateMachine.getIterationCount() + 1;

    // Load progress entries
    const progressEntries = await this.deps.progressManager.getLatest(10);

    // Load agents content
    const agentsContent = await this.deps.agentsManager.loadForContext({
      phaseId: phase.id,
      taskId: task.id,
      filesTargeted: [],
    });

    // Get tier plan from subtask
    const subtaskPlan: TierPlan = {
      // Preserve any optional routing overrides carried on the plan (e.g., platform/modelLevel).
      ...subtask.data.plan,
      id: subtask.id,
      title: subtask.data.title,
      description: subtask.data.description,
      approach: subtask.data.plan.approach,
      dependencies: subtask.data.plan.dependencies,
    };

    // P0-G06: Use PlatformRouter to select platform, with graceful error handling
    let platformConfig;
    try {
      platformConfig = this.deps.platformRouter.selectPlatform(subtask, 'execute', subtaskPlan);
    } catch (error) {
      if (error instanceof NoPlatformAvailableError) {
        // Emit event for GUI/logging before throwing
        this.eventBus?.emit({
          type: 'error',
          error: `No platform available for subtask ${subtask.id}: ${error.message}`,
          context: {
            subtaskId: subtask.id,
            errorType: 'no_platform_available',
            suggestion: 'Run `puppet-master doctor` to check platform availability and authentication',
          },
        });
        throw error;
      }
      throw error;
    }

    // Avoid unhealthy platforms when routing (P2-T07).
    if (this.healthMonitor && !this.healthMonitor.isRoutable(platformConfig.platform)) {
      const preferred = platformConfig.platform;
      const orderedCandidates = [preferred, ...(ROUTING_FALLBACK_CHAIN[preferred] ?? [])];
      const available = orderedCandidates.filter((p) => this.deps.platformRegistry.get(p) !== undefined);
      const routable = available.filter((p) => this.healthMonitor?.isRoutable(p) === true);
      const best = this.healthMonitor.pickBestPlatform(routable);

      if (best && best !== preferred) {
        const overridePlan = { ...subtaskPlan, platform: best } as TierPlan & { platform: Platform };
        try {
          platformConfig = this.deps.platformRouter.selectPlatform(subtask, 'execute', overridePlan);
        } catch (error) {
          if (error instanceof NoPlatformAvailableError) {
            this.eventBus?.emit({
              type: 'error',
              error: `No fallback platform available: ${error.message}`,
              context: {
                subtaskId: subtask.id,
                preferredPlatform: preferred,
                errorType: 'no_platform_available',
                suggestion: 'Run `puppet-master doctor` to check platform availability',
              },
            });
            throw error;
          }
          throw error;
        }
      }
    }

    // Use override working dir if provided (for worktrees), otherwise use normal working dir
    const projectPath = overrideWorkingDir ?? this.workingDirectory;

    return {
      tierNode: subtask,
      iterationNumber,
      maxIterations: subtask.data.maxIterations,
      projectPath,
      projectName: this.config.project.name,
      sessionId: this.deps.progressManager.generateSessionId(),
      platform: platformConfig.platform,
      model: platformConfig.model,
      planMode: platformConfig.planMode,
      reasoningEffort: platformConfig.reasoningEffort,
      outputFormat: platformConfig.outputFormat,
      permissionMode: platformConfig.permissionMode,
      allowedTools: platformConfig.allowedTools,
      progressEntries,
      agentsContent,
      subtaskPlan,
    };
  }

  /**
   * Execute a single iteration
   */
  private async executeIteration(): Promise<IterationResult> {
    const subtask = this.tierStateManager.getCurrentSubtask();
    if (!subtask) {
      throw new Error('No current subtask to execute');
    }

    const context = await this.buildIterationContext(subtask);
    return await this.executionEngine.spawnIteration(context);
  }

  /**
   * P0-G09: Execute iteration with quota fallback handling.
   *
   * Implements 'fallback', 'pause', 'queue' behaviors based on config.budgetEnforcement.onLimitReached.
   * - 'fallback': Try alternative platform up to maxFallbackDepth (default: 3)
   * - 'pause': Wait for quota to reset and retry
   * - 'queue': Queue the iteration for later (currently throws, not fully implemented)
   *
   * @param context - Iteration context
   * @param runner - Primary platform runner
   * @param subtaskId - Subtask ID for logging
   * @param fallbackDepth - Current fallback depth (prevents infinite loops)
   * @param maxFallbackDepth - Maximum fallback depth (default: 3)
   */
  private async executeWithQuotaFallback(
    context: IterationContext,
    runner: import('../types/platforms.js').PlatformRunnerContract,
    subtaskId: string,
    fallbackDepth: number = 0,
    maxFallbackDepth: number = 3
  ): Promise<IterationResult> {
    try {
      return await this.executionEngine.spawnIteration(context, runner);
    } catch (error) {
      // Only handle QuotaExhaustedError
      if (!(error instanceof QuotaExhaustedError)) {
        throw error;
      }

      const quotaError = error as QuotaExhaustedError;
      const behavior = this.config.budgetEnforcement?.onLimitReached ?? 'pause';
      const platform = quotaError.platform;

      console.warn(
        `[Orchestrator] Quota exhausted for ${platform}: ${quotaError.message}`
      );

      // Emit quota_exhausted event
      if (this.eventBus) {
        this.eventBus.emit({
          type: 'quota_exhausted',
          platform,
          period: quotaError.period,
          resetsAt: quotaError.resetsAt,
          behavior,
        });
      }

      if (behavior === 'fallback') {
        // Check fallback depth limit
        if (fallbackDepth >= maxFallbackDepth) {
          console.error(
            `[Orchestrator] Max fallback depth (${maxFallbackDepth}) reached, cannot fallback further`
          );
          throw new Error(
            `Quota exhausted on all platforms after ${maxFallbackDepth} fallback attempts: ${quotaError.message}`
          );
        }

        // Get fallback platform from budget config
        const budgetConfig = this.config.budgets?.[platform];
        const fallbackPlatform = budgetConfig?.fallbackPlatform;

        if (!fallbackPlatform) {
          console.warn(
            `[Orchestrator] No fallback platform configured for ${platform}, using fallback chain`
          );
          // Use the fallback chain defined at top of file
          const chain = ROUTING_FALLBACK_CHAIN[platform] ?? [];
          const availableFallback = chain.find((p) => {
            try {
              return this.deps.platformRegistry.get(p) !== undefined;
            } catch {
              return false;
            }
          });

          if (!availableFallback) {
            throw new Error(
              `Quota exhausted for ${platform} and no fallback platforms available: ${quotaError.message}`
            );
          }

          return this.tryFallbackPlatform(
            context,
            availableFallback,
            subtaskId,
            fallbackDepth,
            maxFallbackDepth,
            platform
          );
        }

        return this.tryFallbackPlatform(
          context,
          fallbackPlatform,
          subtaskId,
          fallbackDepth,
          maxFallbackDepth,
          platform
        );
      } else if (behavior === 'pause') {
        // Wait for quota to reset
        const resetsAt = new Date(quotaError.resetsAt);
        const now = new Date();
        const waitMs = Math.max(0, resetsAt.getTime() - now.getTime());

        // Cap wait time at 1 hour to avoid indefinite waits
        const maxWaitMs = 60 * 60 * 1000;
        const actualWaitMs = Math.min(waitMs, maxWaitMs);

        if (actualWaitMs > 0) {
          console.log(
            `[Orchestrator] Pausing for ${Math.round(actualWaitMs / 1000)}s until quota resets at ${quotaError.resetsAt}`
          );
          await new Promise((resolve) => setTimeout(resolve, actualWaitMs));
          // Retry with same platform after wait
          return this.executeWithQuotaFallback(
            context,
            runner,
            subtaskId,
            fallbackDepth,
            maxFallbackDepth
          );
        } else {
          // Reset time has passed, retry immediately
          return this.executeWithQuotaFallback(
            context,
            runner,
            subtaskId,
            fallbackDepth,
            maxFallbackDepth
          );
        }
      } else if (behavior === 'queue') {
        // P0-G09: Queue the iteration for later processing
        console.log(`[Orchestrator] Quota exhausted for ${platform}, queueing iteration for ${subtaskId}`);

        // Add to queue
        this.iterationQueue.push({
          subtaskId,
          platform,
          queuedAt: new Date(),
          resetsAt: quotaError.resetsAt,
        });

        // Emit event for GUI/monitoring
        if (this.eventBus) {
          this.eventBus.emit({
            type: 'iteration_queued',
            subtaskId,
            platform,
            resetsAt: quotaError.resetsAt,
            queueLength: this.iterationQueue.length,
          });
        }

        // Pause orchestrator - user can resume after quota refreshes
        const previousState = this.stateMachine.getCurrentState();
        this.stateMachine.send({
          type: 'PAUSE',
          reason: `Quota exhausted for ${platform}. ${this.iterationQueue.length} iteration(s) queued. Quota resets at ${quotaError.resetsAt}`,
        });

        this.eventLedger?.append({
          timestamp: new Date().toISOString(),
          type: 'orchestrator_state_changed',
          data: {
            from: previousState,
            to: this.stateMachine.getCurrentState(),
            eventType: 'PAUSE',
            reason: `Quota exhausted - iteration queued`,
            queueLength: this.iterationQueue.length,
          },
        });

        // Exit the execution (will be retried on resume)
        this.loopRunning = false;

        // Return a placeholder result - the iteration didn't actually run
        return {
          success: false,
          output: '',
          error: `Iteration queued due to quota exhaustion. Resume after ${quotaError.resetsAt}`,
          completionSignal: undefined,
          filesChanged: [],
          learnings: [],
          processId: -1,
          duration: 0,
          exitCode: -1,
        };
      } else {
        // Unknown behavior, throw
        throw quotaError;
      }
    }
  }

  /**
   * P0-G09: Try executing with a fallback platform.
   */
  private async tryFallbackPlatform(
    context: IterationContext,
    fallbackPlatform: Platform,
    subtaskId: string,
    fallbackDepth: number,
    maxFallbackDepth: number,
    originalPlatform: Platform
  ): Promise<IterationResult> {
    console.log(
      `[Orchestrator] Falling back from ${originalPlatform} to ${fallbackPlatform} (depth: ${fallbackDepth + 1})`
    );

    // Emit fallback event if configured to notify
    if (this.config.budgetEnforcement?.notifyOnFallback && this.eventBus) {
      this.eventBus.emit({
        type: 'platform_fallback',
        fromPlatform: originalPlatform,
        toPlatform: fallbackPlatform,
        reason: 'quota_exhausted',
      });
    }

    const fallbackRunner = this.deps.platformRegistry.get(fallbackPlatform);
    if (!fallbackRunner) {
      throw new Error(
        `Fallback platform ${fallbackPlatform} not available in registry`
      );
    }

    // Update context with new platform
    const fallbackContext: IterationContext = {
      ...context,
      platform: fallbackPlatform,
    };

    // Recursively try with fallback, incrementing depth
    return this.executeWithQuotaFallback(
      fallbackContext,
      fallbackRunner,
      subtaskId,
      fallbackDepth + 1,
      maxFallbackDepth
    );
  }

  /**
   * Persist latest metrics snapshot for CLI/GUI consumption (P2-T08).
   *
   * This is best-effort: failures should not impact orchestration.
   * The snapshot is written under:
   *   <projectRoot>/.puppet-master/metrics/latest.json
   */
  private async writeMetricsSnapshotBestEffort(): Promise<void> {
    if (!this.metricsCollector) {
      return;
    }

    try {
      const usageEvents = await this.deps.usageTracker.getAll();
      const report = this.metricsCollector.generateReport({ usageEvents });

      const dir = join(this.projectRoot, '.puppet-master', 'metrics');
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, 'latest.json'), JSON.stringify(report, null, 2), 'utf-8');
    } catch (error) {
      console.warn('[Orchestrator] Failed to write metrics snapshot:', error);
    }
  }

  /**
   * Handle iteration result
   */
  private async handleIterationResult(result: IterationResult, subtask: TierNode): Promise<void> {
    // Parse output
    const parsed = this.outputParser.parse(result.output);

    // Git is the source of truth for changed files. Output parsing is bonus info.
    if (parsed.filesChanged.length > 0) {
      const merged = new Set<string>(result.filesChanged);
      for (const file of parsed.filesChanged) {
        merged.add(file);
      }
      result.filesChanged = Array.from(merged);
    }

    // Update subtask iterations count
    subtask.data.iterations = result.success ? subtask.data.iterations + 1 : subtask.data.iterations;

    if (result.success && result.completionSignal === 'COMPLETE') {
      // Mark iteration as complete
      this.requireTierTransition(subtask, { type: 'ITERATION_COMPLETE', success: true }, 'iteration completed');
    } else if (result.completionSignal === 'GUTTER' || !result.success) {
      // Mark iteration as failed
      const errorMsg = result.error ?? parsed.errors.join('; ') ?? 'Iteration failed';
      this.requireTierTransition(subtask, { type: 'ITERATION_FAILED', error: errorMsg }, 'iteration failed');

      // Check if we should retry or escalate
      const state = subtask.getState();
      if (state === 'retrying') {
        // Will retry
      } else if (state === 'failed') {
        // Max attempts reached, will be handled by escalation
      }
    }

    // Sync state to PRD
    await this.tierStateManager.syncToPrd();

    // Persist a snapshot after each iteration result for crash recovery (P2-T03).
    this.appendLedgerSnapshot('iteration_result');
  }

  /**
   * Handle gate result
   */
  private async handleGateResult(result: GateResult, tier: TierNode): Promise<void> {
    if (result.passed) {
      this.requireTierTransition(tier, { type: 'GATE_PASSED' }, 'gate passed');
    } else {
      // Determine if minor or major failure
      const explicitFailureType = result.report?.failureType;
      const isMinor = explicitFailureType ? explicitFailureType === 'minor' : this.isMinorFailure(result);
      this.requireTierTransition(
        tier,
        { type: isMinor ? 'GATE_FAILED_MINOR' : 'GATE_FAILED_MAJOR' },
        'gate failed'
      );
    }

    // Publish gate_complete event
    if (this.eventBus && (tier.type === 'task' || tier.type === 'phase')) {
      const tierType = tier.type === 'task' ? 'task' : tier.type === 'phase' ? 'phase' : 'task';
      const evidence = result.report?.summary;

      this.eventBus.emit({
        type: 'gate_complete',
        tierId: tier.id,
        tierType,
        passed: result.passed,
        evidence,
      });
    }

    // Commit gate result with proper format (best-effort; skip if no changes)
    const gateTier: CommitContext['tier'] | null =
      tier.type === 'task' ? 'task_gate' : tier.type === 'phase' ? 'phase_gate' : null;
    if (gateTier) {
      const status = await this.deps.gitManager.getStatus();
      if (status.staged.length > 0 || status.modified.length > 0 || status.untracked.length > 0) {
        await this.deps.gitManager.add('.');
        const gateCommitContext: CommitContext = {
          tier: gateTier,
          itemId: tier.id,
          summary: tier.data.title,
          status: result.passed ? 'PASS' : 'FAIL',
        };
        const message = this.deps.commitFormatter.format(gateCommitContext);
        await this.deps.gitManager.commit({ message });
      }
    }

    // Sync state to PRD
    await this.tierStateManager.syncToPrd();

    // Persist a snapshot after gate results for crash recovery (P2-T03).
    this.appendLedgerSnapshot('gate_result');
  }

  /**
   * Handle advancement decision
   */
  private async handleAdvancement(result: AdvancementResult): Promise<void> {
    switch (result.action) {
      case 'continue':
        if (result.next) {
          if (result.next.type === 'subtask') {
            this.tierStateManager.setCurrentSubtask(result.next.id);
          } else if (result.next.type === 'task') {
            this.tierStateManager.setCurrentTask(result.next.id);
          } else if (result.next.type === 'phase') {
            this.tierStateManager.setCurrentPhase(result.next.id);
          }
        }
        break;

      case 'advance_subtask':
        if (result.next) {
          // Check if previous subtask completed (passed state)
          const previousSubtask = this.tierStateManager.getCurrentSubtask();
          if (
            previousSubtask &&
            previousSubtask.getState() === 'passed' &&
            this.config.checkpointing?.enabled &&
            this.config.checkpointing?.checkpointOnSubtaskComplete
          ) {
            await this.createCheckpoint('subtask-complete');
          }
          this.tierStateManager.setCurrentSubtask(result.next.id);
        }
        break;

      case 'advance_task':
        if (result.next) {
          // Merge completed task branch if strategy indicates it should be merged.
          const currentSubtask = this.tierStateManager.getCurrentSubtask();
          const currentTask = this.tierStateManager.getCurrentTask();
          const completedTask = currentTask ?? currentSubtask?.parent ?? null;
          const completedPhase = completedTask?.parent ?? null;

          if (completedTask) {
            const branchContext: BranchContext = {
              phaseId: completedPhase?.id,
              taskId: completedTask.id,
              isComplete: true,
            };
            if (this.deps.branchStrategy.shouldMerge(branchContext)) {
              try {
                await this.deps.branchStrategy.mergeToBranch(this.config.branching.baseBranch);
              } catch (error) {
                // P0-G20: Use configurable git error handling
                this.handleGitError('merge', error, { tierId: completedTask.id });
              }
            }
          }

          this.tierStateManager.setCurrentTask(result.next.id);
        }
        // Publish progress event after task advancement
        this.publishProgressEvent();
        break;

      case 'advance_phase':
        if (result.next) {
          // Merge completed phase branch if strategy indicates it should be merged.
          const currentPhase = this.tierStateManager.getCurrentPhase();
          if (currentPhase) {
            const branchContext: BranchContext = {
              phaseId: currentPhase.id,
              isComplete: true,
            };
            if (this.deps.branchStrategy.shouldMerge(branchContext)) {
              try {
                await this.deps.branchStrategy.mergeToBranch(this.config.branching.baseBranch);
              } catch (error) {
                // P0-G20: Use configurable git error handling
                this.handleGitError('merge', error, { tierId: currentPhase.id });
              }
            }
          }

          this.tierStateManager.setCurrentPhase(result.next.id);
        }
        // Publish progress event after phase advancement
        this.publishProgressEvent();
        break;

      case 'run_task_gate':
      case 'run_phase_gate':
        // Gates are run by AutoAdvancement, result contains gate result
        if (result.gate && result.next) {
          // Publish gate_start event (gate has already been executed, but we're processing it now)
          if (this.eventBus) {
            const tierType = result.next.type === 'task' ? 'task' : 'phase';
            // Get verifier info from the gate report if available, otherwise from acceptance criteria
            const gateReport = result.gate.report;
            const firstVerifier = gateReport?.verifiersRun?.[0];
            const verifierType = firstVerifier?.type || result.next.data.acceptanceCriteria[0]?.type || 'unknown';
            const target = firstVerifier?.target || result.next.data.acceptanceCriteria[0]?.target || 'unknown';

            this.eventBus.emit({
              type: 'gate_start',
              tierId: result.next.id,
              tierType,
              verifierType,
              target,
            });
          }

          await this.handleGateResult(result.gate, result.next);

          // Push / PR after successful gate
          if (result.gate.passed) {
            const shouldPush = this.shouldPushNow(result.next.type);
            if (shouldPush) {
              try {
                await this.deps.gitManager.push();
              } catch (error) {
                // P0-G20: Use configurable git error handling
                this.handleGitError('push', error, { tierId: result.next.id });
              }
            }

            // Auto-create PR for completed tasks when enabled
            if (this.config.branching.autoPr && result.next.type === 'task') {
              try {
                const prTitle = `Task ${result.next.id}: ${result.next.data.title}`;
                const prBody = `Completed task ${result.next.id}\n\n${result.next.data.description}`;
                await this.deps.prManager.createPR(prTitle, prBody, this.config.branching.baseBranch);
              } catch (error) {
                // P0-G20: Use configurable git error handling
                this.handleGitError('pr', error, { tierId: result.next.id, branch: this.config.branching.baseBranch });
              }
            }
          }
        }
        // Publish progress event after gate passes
        this.publishProgressEvent();
        break;

      case 'task_gate_failed':
      case 'phase_gate_failed':
        if (result.gate && result.next) {
          await this.handleGateResult(result.gate, result.next);
          // Handle escalation if needed
          const failureContext = {
            tier: result.next,
            gateResult: result.gate,
            failureType: this.determineFailureType(result.gate),
            failureCount: result.next.data.iterations,
            maxAttempts: result.next.data.maxIterations,
          };
          const escalationDecision = this.escalation.determineAction(failureContext);
          await this.executeEscalation(escalationDecision, result.next);
        }
        break;

      case 'complete':
        {
          const previousState = this.stateMachine.getCurrentState();
          this.stateMachine.send({ type: 'COMPLETE' });
          const newState = this.stateMachine.getCurrentState();

          this.eventLedger?.append({
            timestamp: new Date().toISOString(),
            type: 'orchestrator_state_changed',
            data: {
              from: previousState,
              to: newState,
              eventType: 'COMPLETE',
              context: this.stateMachine.getContext(),
            },
          });
          this.appendLedgerSnapshot('complete');
        }
        this.loopAborted = true;
        // Publish final progress event
        this.publishProgressEvent();
        break;
    }

    // Sync state to PRD
    await this.tierStateManager.syncToPrd();
  }

  /**
   * Calculate and publish progress event
   */
  private publishProgressEvent(): void {
    if (!this.eventBus) {
      return;
    }

    const allPhases = this.tierStateManager.getAllPhases();
    const allTasks = this.tierStateManager.getAllTasks();
    const allSubtasks = this.tierStateManager.getAllSubtasks();

    const phasesComplete = allPhases.filter((p) => p.getState() === 'passed').length;
    const tasksComplete = allTasks.filter((t) => t.getState() === 'passed').length;
    const subtasksComplete = allSubtasks.filter((s) => s.getState() === 'passed').length;

    this.eventBus.emit({
      type: 'progress',
      phasesTotal: allPhases.length,
      phasesComplete,
      tasksTotal: allTasks.length,
      tasksComplete,
      subtasksTotal: allSubtasks.length,
      subtasksComplete,
    });
  }

  /**
   * Publish budget update event
   */
  private async publishBudgetUpdateEvent(_subtask: TierNode): Promise<void> {
    if (!this.eventBus || !this.deps.usageTracker) {
      return;
    }

    const platform = this.config.tiers.subtask.platform;

    // Get current usage counts
    const hourCount = await this.deps.usageTracker.getCallCountInLastHour(platform);
    const dayCount = await this.deps.usageTracker.getCallCountToday(platform);

    // Get budget limits from config
    const budget = this.config.budgets[platform];
    const hourLimit = this.getLimitValue(budget.maxCallsPerHour);
    const dayLimit = this.getLimitValue(budget.maxCallsPerDay);

    // Use the most restrictive limit (hour or day)
    const used = Math.max(hourCount, dayCount);
    const limit = hourLimit !== Infinity && dayLimit !== Infinity 
      ? Math.min(hourLimit, dayLimit)
      : hourLimit !== Infinity ? hourLimit : dayLimit;

    // Check for cooldown (simplified - would need QuotaManager for full cooldown tracking)
    let cooldownUntil: string | undefined;
    if (budget.cooldownHours && used >= limit) {
      const cooldownEnd = new Date(Date.now() + budget.cooldownHours * 60 * 60 * 1000);
      cooldownUntil = cooldownEnd.toISOString();
    }

    this.eventBus.emit({
      type: 'budget_update',
      platform,
      used,
      limit: limit === Infinity ? Number.MAX_SAFE_INTEGER : limit,
      cooldownUntil,
    });
  }

  /**
   * Helper to get limit value (handles 'unlimited' string)
   */
  private getLimitValue(limit: number | 'unlimited'): number {
    if (limit === 'unlimited') {
      return Infinity;
    }
    return limit;
  }

  private shouldPushNow(tierType: TierType): boolean {
    const policy = this.config.branching.pushPolicy;

    // Iterations aren't pushed independently, only gate completions
    if (tierType === 'iteration') {
      return false;
    }

    switch (policy) {
      case 'per-iteration':
        return true;
      case 'per-subtask':
        return tierType === 'subtask';
      case 'per-task':
        return tierType === 'task' || tierType === 'subtask';
      case 'per-phase':
        return tierType === 'phase' || tierType === 'task' || tierType === 'subtask';
      default:
        return false;
    }
  }

  /**
   * P0-G20: Handle git operation errors based on config.
   * Checks failOnGitError and criticalGitOperations to decide whether to throw or warn.
   */
  private handleGitError(
    operation: 'merge' | 'push' | 'pr',
    error: unknown,
    _context?: { tierId?: string; branch?: string }
  ): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const failOnError = this.config.branching.failOnGitError ?? false;
    const criticalOps = this.config.branching.criticalGitOperations ?? [];
    const isCritical = criticalOps.includes(operation);

    // Emit warning event (use 'log' type with warn level)
    this.eventBus?.emit({
      type: 'log',
      level: 'warn',
      message: `Git ${operation} failed: ${errorMessage} (critical: ${isCritical}, will fail: ${failOnError && isCritical})`,
    });

    // Log warning
    console.warn(`Failed to ${operation}:`, error);

    // Throw if configured to fail on this operation
    if (failOnError && isCritical) {
      throw new Error(
        `Critical git operation '${operation}' failed: ${errorMessage}. ` +
          'Set branching.failOnGitError=false to treat as warning.'
      );
    }
  }

  /**
   * Record progress
   */
  private async recordProgress(
    result: IterationResult,
    subtask: TierNode,
    reviewerFeedback?: string
  ): Promise<void> {
    const sessionId = this.deps.progressManager.generateSessionId();
    const platform = this.config.tiers.subtask.platform;
    const duration = `${Math.floor(result.duration / 60000)}m ${Math.floor((result.duration % 60000) / 1000)}s`;

    // Include reviewer feedback in learnings if present
    const learnings = [...result.learnings];
    if (reviewerFeedback) {
      learnings.push(`[Reviewer Feedback] ${reviewerFeedback}`);
    }

    const entry: ProgressEntry = {
      timestamp: new Date().toISOString(),
      itemId: subtask.id,
      sessionId,
      platform,
      duration,
      status: result.success ? 'SUCCESS' : 'FAILED',
      accomplishments: result.learnings,
      filesChanged: result.filesChanged.map((path) => ({ path, description: 'Modified' })),
      testsRun: [],
      learnings,
      nextSteps: reviewerFeedback ? ['Address reviewer feedback'] : [],
    };

    await this.deps.progressManager.append(entry);

    // Auto-promote patterns if enabled
    if (this.config.memory.agentsEnforcement?.autoPromotePatterns && result.success) {
      await this.autoPromoteLearnings(result.learnings, subtask.id);
    }
  }

  /**
   * Auto-promote extracted learnings to AGENTS.md.
   * Called when autoPromotePatterns is enabled.
   */
  private async autoPromoteLearnings(learnings: string[], tierId: string): Promise<void> {
    if (!this.deps.promotionEngine || !this.deps.multiLevelLoader) {
      return;
    }

    for (const learning of learnings) {
      // Determine entry type based on learning content
      const lowerLearning = learning.toLowerCase();
      let entryType: AgentsEntry['type'] = 'pattern';
      
      if (lowerLearning.includes('gotcha') || lowerLearning.includes('error') || lowerLearning.includes('failed')) {
        entryType = 'gotcha';
      } else if (lowerLearning.includes('do not') || lowerLearning.includes("don't") || lowerLearning.includes('never')) {
        entryType = 'dont';
      } else if (lowerLearning.includes('always') || lowerLearning.includes('must') || lowerLearning.includes('should')) {
        entryType = 'do';
      }

      const entry: AgentsEntry = {
        type: entryType,
        content: learning,
        section: entryType === 'pattern' ? 'codebasePatterns' : entryType === 'gotcha' ? 'commonFailureModes' : entryType === 'do' ? 'doItems' : 'dontItems',
        level: 'root', // Start at root, promotion engine will handle hierarchy
      };

      // Track usage for potential future promotion
      this.deps.promotionEngine.trackUsage(entry, tierId);

      // Evaluate for immediate promotion based on rules
      const candidate = this.deps.promotionEngine.evaluate(entry);
      
      if (candidate) {
        try {
          await this.deps.promotionEngine.promote(
            candidate,
            this.deps.multiLevelLoader,
            this.deps.agentsManager
          );
          
          if (this.eventBus) {
            this.eventBus.emit({
              type: 'agents_updated',
              updatedFiles: [this.config.memory.agentsFile],
            });
          }
        } catch {
          // Silently ignore promotion errors (e.g., duplicate entries)
        }
      }

      // Also directly add to AGENTS.md if it matches certain patterns
      if (entryType === 'gotcha') {
        try {
          await this.deps.agentsManager.addGotcha({
            description: learning,
            fix: '', // Agent should provide fix in future iterations
          });
        } catch {
          // Ignore if already exists
        }
      } else if (entryType === 'pattern') {
        try {
          await this.deps.agentsManager.addPattern({
            description: learning,
            context: 'Auto-extracted from iteration learnings',
          });
        } catch {
          // Ignore if already exists
        }
      }
    }
  }

  /**
   * Commit changes to git
   */
  private async commitChanges(result: IterationResult, subtask: TierNode): Promise<void> {
    // Check git status
    const status = await this.deps.gitManager.getStatus();
    if (status.staged.length === 0 && status.modified.length === 0 && status.untracked.length === 0) {
      return;
    }

    // Ensure we have a best-effort file list for logging/progress (optional).
    if (result.filesChanged.length === 0) {
      try {
        result.filesChanged = await this.deps.gitManager.getDiffFiles();
      } catch {
        // ignore
      }
    }

    // Stage all changes
    await this.deps.gitManager.add('.');

    // Commit with formatted message
    const commitContext: CommitContext = {
      tier: 'iteration',
      itemId: subtask.id,
      summary: subtask.data.title,
    };
    const message = this.deps.commitFormatter.format(commitContext);
    const commitResult = await this.deps.gitManager.commit({ message });

    // Publish commit event if successful
    if (commitResult.success && this.eventBus) {
      // Get commit SHA
      const sha = await this.deps.gitManager.getHeadSha();

      if (sha) {
        this.eventBus.emit({
          type: 'commit',
          sha,
          message,
          files:
            result.filesChanged.length > 0
              ? result.filesChanged.length
              : status.staged.length + status.modified.length + status.untracked.length,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Determine if failure is minor
   */
  private isMinorFailure(result: GateResult): boolean {
    // Minor failures are typically test failures or acceptance criteria issues
    // Major failures are timeouts, errors, or critical issues
    if (!result.failureReason) {
      return false;
    }

    const minorIndicators = ['test', 'acceptance', 'criteria'];
    const majorIndicators = ['timeout', 'error', 'fatal', 'exception'];

    const reason = result.failureReason.toLowerCase();
    if (majorIndicators.some((indicator) => reason.includes(indicator))) {
      return false;
    }

    return minorIndicators.some((indicator) => reason.includes(indicator));
  }

  /**
   * Determine failure type from gate result
   */
  private determineFailureType(result: GateResult): FailureType {
    if (!result.failureReason) {
      return 'error';
    }

    const reason = result.failureReason.toLowerCase();
    if (reason.includes('timeout')) {
      return 'timeout';
    }
    if (
      reason.includes('structural') ||
      reason.includes('schema') ||
      reason.includes('contract') ||
      reason.includes('invalid prd') ||
      reason.includes('parse error') ||
      reason.includes('yaml') ||
      reason.includes('json')
    ) {
      return 'structural';
    }
    if (reason.includes('test')) {
      return 'test_failure';
    }
    if (reason.includes('acceptance') || reason.includes('criteria')) {
      return 'acceptance';
    }
    return 'error';
  }

  /**
   * Execute escalation decision
   */
  private async executeEscalation(decision: EscalationDecision, tier: TierNode): Promise<void> {
    if (decision.notify) {
      const message = `[Escalation] ${tier.type} ${tier.id}: ${decision.action} — ${decision.reason}`;
      // Always log to console as a fallback; eventBus is optional.
      console.warn(message);
      this.eventBus?.emit({ type: 'log', level: 'warn', message });
    }

    switch (decision.action) {
      case 'self_fix':
        await this.escalation.executeSelfFix(decision, tier);
        break;

      case 'retry':
        await this.escalation.executeRetry(decision, tier);
        break;

      case 'kick_down':
        await this.escalation.executeKickDown(decision, tier);
        // Reinitialize tier state manager after kick-down
        await this.tierStateManager.initialize();
        break;

      case 'escalate':
        await this.escalation.executeEscalate(decision, tier);
        break;

      case 'pause':
        await this.pause(decision.reason || 'Escalation pause');
        break;
    }
  }

  /**
   * Validate PRD structure
   */
  async validatePRD(): Promise<ValidationResult> {
    const errors: string[] = [];

    if (!this.deps || !this.deps.prdManager) {
      return { valid: false, errors: ['Orchestrator not initialized'] };
    }

    try {
      const prd = await this.deps.prdManager.load();
      if (!prd) {
        return { valid: false, errors: ['No PRD loaded'] };
      }

      // Check PRD structure
      if (!prd.phases || prd.phases.length === 0) {
        errors.push('PRD has no phases defined');
      }

      // Check metadata
      if (!prd.metadata) {
        errors.push('PRD missing metadata section');
      }

      // Check each phase has tasks
      if (prd.phases) {
        for (const phase of prd.phases) {
          if (!phase.tasks || phase.tasks.length === 0) {
            errors.push(`Phase ${phase.id} has no tasks`);
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [`Failed to load PRD: ${error instanceof Error ? error.message : String(error)}`],
      };
    }
  }

  /**
   * Validate configuration structure
   */
  async validateConfig(): Promise<ValidationResult> {
    const errors: string[] = [];

    try {
      // Use the existing validateConfig function from config-schema
      validateConfigSchema(this.config);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof Error) {
        errors.push(error.message);
      } else {
        errors.push(String(error));
      }
      return {
        valid: false,
        errors,
      };
    }
  }

  /**
   * Check that all required CLI tools are available
   */
  async checkRequiredCLIs(): Promise<CLICheckResult> {
    const requiredPlatforms = new Set<Platform>([
      this.config.tiers.phase.platform,
      this.config.tiers.task.platform,
      this.config.tiers.subtask.platform,
      this.config.tiers.iteration.platform,
    ]);

    const missing: string[] = [];

    for (const platform of Array.from(requiredPlatforms)) {
      const cliPath = this.config.cliPaths[platform];
      if (!cliPath) {
        missing.push(platform);
        continue;
      }

      const available = await this.isCommandAvailable(cliPath);
      if (!available) {
        missing.push(platform);
      }
    }

    return {
      allAvailable: missing.length === 0,
      missing,
    };
  }

  /**
   * Check if git repository is initialized
   */
  async checkGitRepo(): Promise<ValidationResult> {
    const errors: string[] = [];

    // Check if we have a project path
    if (!this.deps || !this.deps.prdManager) {
      return { valid: false, errors: ['Orchestrator not initialized'] };
    }

    try {
      const prd = await this.deps.prdManager.load();
      if (!prd) {
        return { valid: false, errors: ['No project loaded'] };
      }

      // Git repository is expected at the canonical project root.
      const gitDir = join(this.projectRoot, '.git');

      if (!existsSync(gitDir)) {
        errors.push('Git repository not initialized');
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [`Failed to check git repository: ${error instanceof Error ? error.message : String(error)}`],
      };
    }
  }

  /**
   * Check if a command is available
   */
  private async isCommandAvailable(cmd: string): Promise<boolean> {
    return new Promise((resolve) => {
      const proc = spawn(cmd, ['--version'], { shell: true });
      proc.on('close', (code) => resolve(code === 0));
      proc.on('error', () => resolve(false));
    });
  }

  /**
   * Get tier by ID (helper method)
   */
  getTierById(tierId: string): TierNode | null {
    return this.tierStateManager.getTierById(tierId);
  }

  /**
   * Build prompt for replanning a tier
   */
  private buildReplanPrompt(tier: TierNode, scope: 'phase' | 'task' | 'subtask'): string {
    const currentPlan = tier.data.plan;
    const acceptanceCriteria = tier.data.acceptanceCriteria.map((c) => c.description).join('\n');
    const parentContext = tier.parent ? `Parent: ${tier.parent.data.title} (${tier.parent.id})` : '';

    return `You are replanning a ${scope} tier in the RWM Puppet Master system.

TIER INFORMATION:
- ID: ${tier.id}
- Title: ${tier.data.title}
- Description: ${tier.data.description}
${parentContext ? `- ${parentContext}` : ''}

CURRENT PLAN:
${JSON.stringify(currentPlan, null, 2)}

ACCEPTANCE CRITERIA:
${acceptanceCriteria}

Please generate a new plan for this ${scope}. The plan should include:
1. A clear approach (array of steps)
2. Dependencies (if any)
3. Updated description if needed

Return the plan as a JSON object matching this structure:
{
  "id": "${tier.id}",
  "title": "${tier.data.title}",
  "description": "...",
  "approach": ["step1", "step2", ...],
  "dependencies": ["dep1", "dep2", ...]
}`;
  }

  /**
   * Parse plan from AI output
   */
  private parsePlanFromOutput(output: string, _scope: 'phase' | 'task' | 'subtask'): TierPlan {
    // Try to extract JSON from output
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          id: parsed.id || '',
          title: parsed.title || '',
          description: parsed.description || '',
          approach: parsed.approach || [],
          dependencies: parsed.dependencies || [],
        };
      } catch {
        // Fall through to default
      }
    }

    // Fallback: create a basic plan from the output
    return {
      id: '',
      title: '',
      description: output.substring(0, 500),
      approach: output.split('\n').filter((line) => line.trim().length > 0).slice(0, 10),
      dependencies: [],
    };
  }

  /**
   * Retry current failed subtask
   */
  async retry(): Promise<void> {
    const currentSubtask = this.tierStateManager.getCurrentSubtask();

    if (!currentSubtask) {
      throw new Error('No current subtask to retry');
    }

    const state = currentSubtask.getState();
    if (state !== 'failed' && state !== 'retrying') {
      throw new Error(`Cannot retry subtask in state: ${state}`);
    }

    // Reset iteration count (don't increment, just reset to 0)
    currentSubtask.data.iterations = 0;

    // Reset state to pending
    currentSubtask.stateMachine.reset();

    // Sync to PRD
    await this.tierStateManager.syncToPrd();

    // If orchestrator is paused or stopped, resume execution
    const orchestratorState = this.getState();
    if (orchestratorState === 'paused' || orchestratorState === 'idle') {
      await this.resume();
    }
  }

  /**
   * Replan a tier (regenerate its plan using AI)
   */
  async replan(tierId: string, scope: 'phase' | 'task' | 'subtask'): Promise<void> {
    const tier = this.tierStateManager.getTierById(tierId);

    if (!tier) {
      throw new Error(`Tier not found: ${tierId}`);
    }

    // Validate scope matches tier type
    if (tier.type !== scope) {
      throw new Error(`Scope ${scope} does not match tier type ${tier.type}`);
    }

    // P0-G06: Get platform and model for this tier type using PlatformRouter
    let platformConfig;
    try {
      platformConfig = this.deps.platformRouter.selectPlatform(tier, 'execute');
    } catch (error) {
      if (error instanceof NoPlatformAvailableError) {
        this.eventBus?.emit({
          type: 'error',
          error: `No platform available for replan: ${error.message}`,
          context: {
            tierId: tier.id,
            errorType: 'no_platform_available',
            suggestion: 'Run `puppet-master doctor` to check platform availability',
          },
        });
        throw error;
      }
      throw error;
    }
    const platform = platformConfig.platform;
    const model = platformConfig.model;

    // Build replan prompt
    const prompt = this.buildReplanPrompt(tier, scope);

    // Get platform runner from registry
    const runner = this.deps.platformRegistry.get(platform);
    if (!runner) {
      throw new Error(`Platform runner not available for platform: ${platform}`);
    }
    const request: ExecutionRequest = {
      prompt,
      model,
      workingDirectory: this.workingDirectory,
      nonInteractive: true,
      timeout: 300000, // 5 minutes for planning
    };

    // Spawn process and collect output
    await runner.prepareWorkingDirectory(this.workingDirectory);
    const runningProcess = await runner.spawnFreshProcess(request);

    // Collect output from stdout and stderr
    const outputChunks: string[] = [];
    const errorChunks: string[] = [];

    runningProcess.stdout.on('data', (chunk: Buffer) => {
      outputChunks.push(chunk.toString());
    });

    runningProcess.stderr.on('data', (chunk: Buffer) => {
      errorChunks.push(chunk.toString());
    });

    // Wait for process to complete
    await new Promise<void>((resolve, reject) => {
      let stdoutEnded = false;
      let stderrEnded = false;
      let timeout: NodeJS.Timeout | null = null;

      const checkComplete = (): void => {
        if (stdoutEnded && stderrEnded) {
          if (timeout) {
            clearTimeout(timeout);
          }
          resolve();
        }
      };

      runningProcess.stdout.on('end', () => {
        stdoutEnded = true;
        checkComplete();
      });

      runningProcess.stderr.on('end', () => {
        stderrEnded = true;
        checkComplete();
      });

      runningProcess.stdout.on('error', (err) => {
        console.warn('Replan stdout error:', err);
        stdoutEnded = true;
        checkComplete();
      });

      runningProcess.stderr.on('error', (err) => {
        console.warn('Replan stderr error:', err);
        stderrEnded = true;
        checkComplete();
      });

      // Timeout after 5 minutes
      timeout = setTimeout(() => {
        reject(new Error('Replan timeout after 5 minutes'));
      }, 300000);
    });

    const output = outputChunks.join('');
    const errors = errorChunks.join('');

    // Log errors but don't fail
    if (errors) {
      console.warn('Replan stderr output:', errors);
    }

    // Parse new plan from output
    const newPlan = this.parsePlanFromOutput(output, scope);

    // Update tier plan
    tier.data.plan = {
      ...tier.data.plan,
      ...newPlan,
      id: tier.id,
      title: tier.data.title,
    };

    // Reset iteration count
    tier.data.iterations = 0;

    // Reset state if needed
    if (tier.getState() === 'failed') {
      tier.stateMachine.reset();
    }

    // Sync to PRD
    await this.tierStateManager.syncToPrd();

    // Publish replan event
    if (this.eventBus) {
      this.eventBus.emit({
        type: 'replan_complete',
        tierId,
        scope,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Reopen a completed item
   */
  async reopenItem(tierId: string, reason: string): Promise<void> {
    const tier = this.tierStateManager.getTierById(tierId);

    if (!tier) {
      throw new Error(`Tier not found: ${tierId}`);
    }

    const state = tier.getState();
    if (state !== 'passed') {
      throw new Error(`Cannot reopen tier in state: ${state}. Only passed tiers can be reopened.`);
    }

    // Set pass=false
    // Reset iteration count
    tier.data.iterations = 0;

    // Reset state to pending
    tier.stateMachine.reset();

    // Log reason in progress/audit trail
    if (this.deps.progressManager) {
      const sessionId = this.deps.progressManager.generateSessionId();
      await this.deps.progressManager.append({
        timestamp: new Date().toISOString(),
        itemId: tierId,
        sessionId,
        platform: this.config.tiers.subtask.platform,
        duration: '0m 0s',
        status: 'PARTIAL',
        accomplishments: [`Reopened: ${reason}`],
        filesChanged: [],
        testsRun: [],
        learnings: [],
        nextSteps: [],
      });
    }

    // Sync to PRD
    await this.tierStateManager.syncToPrd();

    // Publish reopen event
    if (this.eventBus) {
      this.eventBus.emit({
        type: 'item_reopened',
        tierId,
        reason,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Kill current running process(es)
   */
  async killCurrentProcess(): Promise<void> {
    // Get current running processes from execution engine
    const runningProcesses = this.executionEngine.getRunningProcesses();

    if (runningProcesses.length === 0) {
      throw new Error('No process running');
    }

    // Kill all running processes (there should typically be only one)
    for (const processInfo of runningProcesses) {
      try {
        // Try SIGTERM first
        process.kill(processInfo.pid, 'SIGTERM');

        // Wait 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Check if still alive and SIGKILL if needed
        try {
          process.kill(processInfo.pid, 0); // Check if process exists
          process.kill(processInfo.pid, 'SIGKILL');
        } catch {
          // Process already dead, continue
        }
      } catch (error) {
        console.warn(`Failed to kill process ${processInfo.pid}:`, error);
      }
    }

    // Publish event
    if (this.eventBus) {
      this.eventBus.emit({
        type: 'process_killed',
        pids: runningProcesses.map((p) => p.pid),
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Spawn a fresh iteration for the current subtask
   */
  async spawnFreshIteration(): Promise<void> {
    const currentSubtask = this.tierStateManager.getCurrentSubtask();

    if (!currentSubtask) {
      throw new Error('No current subtask to execute');
    }

    const subtaskState = currentSubtask.getState();

    if (subtaskState === 'passed') {
      throw new Error(`Cannot spawn iteration for passed subtask: ${currentSubtask.id}`);
    }

    if (subtaskState === 'gating') {
      // No transcript available when resuming from gating state
      const gate = await this.deps.verificationIntegration.runSubtaskGate(currentSubtask, undefined);
      await this.handleGateResult(gate, currentSubtask);
      return;
    }

    if (subtaskState === 'failed' || subtaskState === 'escalated') {
      throw new Error(`Cannot spawn iteration for subtask ${currentSubtask.id} in state: ${subtaskState}`);
    }

    this.ensureSubtaskReadyForIteration(currentSubtask);

    // Increment iteration count
    currentSubtask.data.iterations += 1;

    // Build iteration context
    const context = await this.buildIterationContext(currentSubtask);

    // Get platform runner from registry based on selected platform
    const runner = this.deps.platformRegistry.get(context.platform);
    if (!runner) {
      throw new Error(`Platform runner not available for platform: ${context.platform}`);
    }

    // Publish iteration_started event
    if (this.eventBus) {
      this.eventBus.emit({
        type: 'iteration_started',
        subtaskId: currentSubtask.id,
        iterationNumber: context.iterationNumber,
      });
    }

    // Execute iteration with platform-specific runner
    const result = await this.executionEngine.spawnIteration(context, runner);

    // Publish iteration_completed event
    if (this.eventBus) {
      this.eventBus.emit({
        type: 'iteration_completed',
        subtaskId: currentSubtask.id,
        passed: result.success,
      });
    }

    // Handle result
    await this.handleIterationResult(result, currentSubtask);

    // Run the subtask gate immediately after a COMPLETE signal.
    if (result.success && result.completionSignal === 'COMPLETE') {
      // Pass execution output as transcript for AGENTS.md enforcement
      const gate = await this.deps.verificationIntegration.runSubtaskGate(currentSubtask, result.output);
      await this.handleGateResult(gate, currentSubtask);
    }

    // Record progress
    await this.recordProgress(result, currentSubtask);

    // Publish budget update
    await this.publishBudgetUpdateEvent(currentSubtask);

    // Commit changes
    await this.commitChanges(result, currentSubtask);
  }

  // ============================================================================
  // SQLite Event Ledger (P2-T03)
  // ============================================================================

  private appendLedgerSnapshot(reason: string): void {
    if (!this.eventLedger) {
      return;
    }

    const tierStates: Record<string, TierContext> = {};
    for (const [id, machine] of this.getAllTierMachines().entries()) {
      tierStates[id] = machine.getContext();
    }

    this.eventLedger.append({
      timestamp: new Date().toISOString(),
      type: 'snapshot',
      data: {
        reason,
        snapshot: {
          orchestratorState: this.stateMachine.getCurrentState(),
          orchestratorContext: this.stateMachine.getContext(),
          tierStates,
        },
      },
    });
  }

  private restoreTierStatesFromLedgerSnapshot(tierStates: Record<string, TierContext>): void {
    for (const [tierId, ctx] of Object.entries(tierStates)) {
      const node = this.tierStateManager.getTierById(tierId);
      if (!node) {
        continue;
      }
      this.restoreTierNodeFromContext(node, ctx);
    }
  }

  private restoreTierNodeFromContext(node: TierNode, ctx: TierContext): void {
    node.stateMachine.reset();
    const events = Orchestrator.getEventsFromPendingToState(ctx.state);
    for (const event of events) {
      node.stateMachine.send(event);
    }
    node.stateMachine.restoreInternalContext({
      iterationCount: ctx.iterationCount,
      lastError: ctx.lastError,
      gateResult: ctx.gateResult,
    });
  }

  private static getEventsFromPendingToState(desired: TierState): TierEvent[] {
    switch (desired) {
      case 'pending':
        return [];
      case 'planning':
        return [{ type: 'TIER_SELECTED' }];
      case 'running':
        return [{ type: 'TIER_SELECTED' }, { type: 'PLAN_APPROVED' }];
      case 'retrying':
        return [
          { type: 'TIER_SELECTED' },
          { type: 'PLAN_APPROVED' },
          { type: 'ITERATION_FAILED', error: 'Restored from ledger' },
        ];
      case 'gating':
        return [
          { type: 'TIER_SELECTED' },
          { type: 'PLAN_APPROVED' },
          { type: 'ITERATION_COMPLETE', success: true },
        ];
      case 'passed':
        return [
          { type: 'TIER_SELECTED' },
          { type: 'PLAN_APPROVED' },
          { type: 'ITERATION_COMPLETE', success: true },
          { type: 'GATE_PASSED' },
        ];
      case 'failed':
        return [{ type: 'TIER_SELECTED' }, { type: 'PLAN_APPROVED' }, { type: 'MAX_ATTEMPTS' }];
      case 'escalated':
        return [
          { type: 'TIER_SELECTED' },
          { type: 'PLAN_APPROVED' },
          { type: 'ITERATION_COMPLETE', success: true },
          { type: 'GATE_FAILED_MAJOR' },
        ];
      default: {
        const exhaustive: never = desired;
        return exhaustive;
      }
    }
  }

  /**
   * Collect all tier state machines from tier nodes
   */
  private getAllTierMachines(): Map<string, TierStateMachine> {
    const machines = new Map<string, TierStateMachine>();

    // Collect from all phases, tasks, and subtasks
    const allPhases = this.tierStateManager.getAllPhases();
    for (const phase of allPhases) {
      machines.set(phase.id, phase.stateMachine);

      for (const task of phase.getChildren()) {
        machines.set(task.id, task.stateMachine);

        for (const subtask of task.getChildren()) {
          machines.set(subtask.id, subtask.stateMachine);
        }
      }
    }

    return machines;
  }

  /**
   * Create a periodic checkpoint
   */
  private async createPeriodicCheckpoint(): Promise<void> {
    if (!this.config.checkpointing?.enabled || !this.statePersistence || !this.checkpointManager) {
      return;
    }

    try {
      // Save current state first
      await this.statePersistence.saveState(this.stateMachine, this.getAllTierMachines());

      // Get current state
      const state = await this.statePersistence.loadState();
      if (!state) {
        return;
      }

      // Get current position
      const position = this.getCurrentPosition();

      // Get metadata
      const metadata = this.getCheckpointMetadata();

      // Create checkpoint
      await this.checkpointManager.createCheckpointWithMetadata(state, position, metadata);
    } catch (error) {
      // Log but don't fail execution
      console.warn('Failed to create periodic checkpoint:', error);
    }
  }

  /**
   * Create a checkpoint with a reason
   */
  private async createCheckpoint(reason: string): Promise<void> {
    if (!this.config.checkpointing?.enabled || !this.statePersistence || !this.checkpointManager) {
      return;
    }

    try {
      // Save current state first
      await this.statePersistence.saveState(this.stateMachine, this.getAllTierMachines());

      // Get current state
      const state = await this.statePersistence.loadState();
      if (!state) {
        return;
      }

      // Get current position
      const position = this.getCurrentPosition();

      // Get metadata
      const metadata = this.getCheckpointMetadata();

      // Create checkpoint
      await this.checkpointManager.createCheckpointWithMetadata(state, position, metadata);
    } catch (error) {
      // Log but don't fail execution
      console.warn(`Failed to create checkpoint (${reason}):`, error);
    }
  }

  // ============================================================================
  // Parallel Execution Support (P2-T01)
  // ============================================================================

  /**
   * Check if a task should be executed in parallel mode
   * A task is eligible for parallel execution if:
   * 1. Parallel execution is enabled globally
   * 2. Task has parallel: true OR has no explicit setting and has multiple pending subtasks
   * 3. Subtasks have dependencies that allow parallelization
   */
  private shouldUseParallelExecution(task: TierNode): boolean {
    // Must have parallel executor enabled
    if (!this.parallelExecutor) {
      return false;
    }

    // Check task-level parallel flag
    const taskParallel = task.data.parallel;
    if (taskParallel === false) {
      return false; // Explicitly disabled for this task
    }

    // Get pending subtasks
    const pendingSubtasks = task.getChildren().filter((s) => s.getState() === 'pending');
    if (pendingSubtasks.length <= 1) {
      return false; // No benefit from parallel execution
    }

    // Validate dependencies are valid before attempting parallel
    try {
      const validation = validateDependencies(pendingSubtasks);
      if (!validation.isValid) {
        console.log(
          `[Orchestrator] Parallel execution disabled for ${task.id}: ${validation.errors.join('; ')}`
        );
        return false;
      }
    } catch (error) {
      if (error instanceof DependencyCycleError) {
        console.log(`[Orchestrator] Parallel execution disabled for ${task.id}: dependency cycle detected`);
        return false;
      }
      throw error;
    }

    // Parallel can be used
    return taskParallel === true || this.config.execution?.parallel?.enabled === true;
  }

  /**
   * Execute a task's subtasks in parallel
   * Uses worktrees for isolation and merges results back
   */
  private async executeTaskInParallel(task: TierNode): Promise<void> {
    if (!this.parallelExecutor || !this.worktreeManager) {
      throw new Error('Parallel executor not initialized');
    }

    const pendingSubtasks = task.getChildren().filter(
      (s) => s.getState() === 'pending' || s.getState() === 'running'
    );

    if (pendingSubtasks.length === 0) {
      console.log(`[Orchestrator] No pending subtasks for parallel execution in ${task.id}`);
      return;
    }

    console.log(
      `[Orchestrator] Starting parallel execution for ${task.id} with ${pendingSubtasks.length} subtasks`
    );

    // Build context for each subtask
    const contextBuilder = async (subtask: TierNode, worktreePath: string) => {
      // Build the iteration context with worktree-specific working directory
      const context = await this.buildIterationContext(subtask, worktreePath);
      return context;
    };

    // Get runner for each subtask
    const runnerProvider = (subtask: TierNode) => {
      const platform = this.getSubtaskPlatform(subtask);
      const runner = this.deps.platformRegistry.get(platform);
      if (!runner) {
        throw new Error(`Platform runner not available for platform: ${platform}`);
      }
      return runner;
    };

    // Execute all subtasks in parallel
    const result = await this.parallelExecutor.executeParallel(
      pendingSubtasks,
      contextBuilder,
      runnerProvider
    );

    // Process results
    await this.processParallelResults(result, pendingSubtasks, task);
  }

  /**
   * Get the platform for a subtask
   */
  private getSubtaskPlatform(_subtask: TierNode): Platform {
    // Try to get from subtask config
    const tierConfig = this.config.tiers.iteration;
    return tierConfig?.platform ?? 'cursor';
  }

  /**
   * Process results from parallel execution
   */
  private async processParallelResults(
    result: ParallelExecutionResult,
    subtasks: TierNode[],
    task: TierNode
  ): Promise<void> {
    console.log(
      `[Orchestrator] Parallel execution completed: success=${result.success}, ` +
      `maxConcurrencyUsed=${result.maxConcurrencyUsed}, duration=${result.totalDurationMs}ms`
    );

    // Update each subtask based on its result
    for (const subtask of subtasks) {
      const subtaskResult = result.results.get(subtask.id);
      if (!subtaskResult) {
        console.warn(`[Orchestrator] No result for subtask ${subtask.id}`);
        continue;
      }

      // Record per-subtask iteration metrics for parallel executions (best-effort).
      if (subtaskResult.iterationResult) {
        const syntheticContext = {
          tierNode: subtask,
          iterationNumber: 1,
          platform: this.getSubtaskPlatform(subtask),
        } as unknown as IterationContext;
        this.metricsCollector?.recordIteration(syntheticContext, subtaskResult.iterationResult);
      }

      if (subtaskResult.success) {
        // Transition subtask through iteration complete and trigger gate
        this.requireTierTransition(
          subtask,
          { type: 'ITERATION_COMPLETE', success: true },
          'parallel complete'
        );
        
        // Run gate for successful subtask
        if (subtaskResult.iterationResult) {
          const gate = await this.deps.verificationIntegration.runSubtaskGate(
            subtask,
            subtaskResult.iterationResult.output
          );
          await this.handleGateResult(gate, subtask);
        }

        // Record progress
        if (subtaskResult.iterationResult) {
          await this.recordProgress(subtaskResult.iterationResult, subtask);
        }
      } else {
        // Handle failure
        console.log(`[Orchestrator] Parallel subtask ${subtask.id} failed: ${subtaskResult.error}`);
        
        // Check if this was a merge conflict
        if (result.conflictSubtasks.includes(subtask.id)) {
          // Generate conflict resolution subtask
          await this.generateConflictResolutionSubtask(subtask, task, subtaskResult);
        } else {
          // Normal failure - let existing retry logic handle it
          const failureResult: IterationResult = {
            success: false,
            output: subtaskResult.error ?? 'Parallel execution failed',
            processId: 0,
            duration: subtaskResult.durationMs,
            exitCode: 1,
            completionSignal: undefined,
            learnings: [],
            filesChanged: [],
            error: subtaskResult.error,
          };
          await this.handleIterationResult(failureResult, subtask);
        }
      }
    }

    // Persist snapshot after processing parallel results (best-effort).
    await this.writeMetricsSnapshotBestEffort();

    // Update iteration count for this run
    this.iterationsRun += subtasks.length;
  }

  /**
   * Generate a conflict resolution subtask when merge fails
   * This creates a synthetic subtask that will resolve the conflict
   */
  private async generateConflictResolutionSubtask(
    conflictSubtask: TierNode,
    _task: TierNode,
    result: import('./parallel-executor.js').SubtaskExecutionResult
  ): Promise<void> {
    console.log(`[Orchestrator] Generating conflict resolution subtask for ${conflictSubtask.id}`);

    // For now, mark the subtask as failed with conflict info
    // A full implementation would create a new subtask in the PRD
    const conflictInfo = result.mergeResult
      ? `Merge conflict with files: ${result.mergeResult.conflictFiles.join(', ')}`
      : 'Merge conflict occurred';

    const failureResult: IterationResult = {
      success: false,
      output: conflictInfo,
      processId: 0,
      duration: result.durationMs,
      exitCode: 1,
      completionSignal: undefined,
      learnings: [],
      filesChanged: [],
      error: `MERGE_CONFLICT: ${conflictInfo}. Manual resolution required.`,
    };
    await this.handleIterationResult(failureResult, conflictSubtask);

    // Emit event for conflict
    if (this.eventBus) {
      this.eventBus.emit({
        type: 'parallel_subtask_error',
        subtaskId: conflictSubtask.id,
        error: conflictInfo,
        level: result.level,
      });
    }
  }

  /**
   * Get current position in execution
   */
  private getCurrentPosition(): CurrentPosition {
    const context = this.stateMachine.getContext();
    const currentSubtask = this.tierStateManager.getCurrentSubtask();
    const currentTask = this.tierStateManager.getCurrentTask();
    const currentPhase = this.tierStateManager.getCurrentPhase();

    return {
      phaseId: currentPhase?.id ?? context.currentPhaseId ?? null,
      taskId: currentTask?.id ?? context.currentTaskId ?? null,
      subtaskId: currentSubtask?.id ?? context.currentSubtaskId ?? null,
      iterationNumber: currentSubtask ? currentSubtask.stateMachine.getIterationCount() : 0,
    };
  }

  /**
   * Get checkpoint metadata
   */
  private getCheckpointMetadata(): CheckpointMetadata {
    const allSubtasks = this.tierStateManager.getAllSubtasks();
    const completedSubtasks = allSubtasks.filter((s) => s.getState() === 'passed').length;

    return {
      projectName: this.config.project.name,
      completedSubtasks,
      totalSubtasks: allSubtasks.length,
      iterationsRun: this.iterationsRun,
    };
  }
}
