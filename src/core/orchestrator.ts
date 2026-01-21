/**
 * Orchestrator
 *
 * Main orchestrator class that coordinates all components and implements
 * the main orchestration loop for the RWM Puppet Master system.
 *
 * See ARCHITECTURE.md Section 2.1 (Core Modules) and BUILD_QUEUE_PHASE_4.md PH4-T08.
 */

import type { OrchestratorState } from '../types/state.js';
import type { PuppetMasterConfig } from '../types/config.js';
import type { TierPlan } from '../types/tiers.js';
import type { PRD } from '../types/prd.js';
import type { PlatformRunnerContract, ExecutionRequest, RunningProcess } from '../types/platforms.js';
import type { IterationContext, IterationResult } from './execution-engine.js';
import type { AdvancementResult } from './auto-advancement.js';
import type { GateResult } from '../types/tiers.js';
import type { ProgressEntry } from '../memory/progress-manager.js';
import type { EscalationDecision } from './escalation.js';
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
import type { GitManager } from '../git/index.js';
import type { VerificationIntegration } from '../verification/verification-integration.js';
import type { EventBus } from '../logging/event-bus.js';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { validateConfig as validateConfigSchema } from '../config/config-schema.js';
import type { Platform } from '../types/config.js';

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
  prdPath?: string;
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
  platformRunner: PlatformRunnerContract;
  verificationIntegration: VerificationIntegration;
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

/**
 * Main Orchestrator class
 */
export class Orchestrator {
  private readonly stateMachine: OrchestratorStateMachine;
  private readonly tierStateManager: TierStateManager;
  private readonly autoAdvancement: AutoAdvancement;
  private readonly escalation: Escalation;
  private readonly executionEngine: ExecutionEngine;
  private readonly promptBuilder: PromptBuilder;
  private readonly outputParser: OutputParser;
  private readonly deps: OrchestratorDependencies;
  private readonly config: PuppetMasterConfig;
  private readonly eventBus: EventBus | null;

  private startedAt: Date | null = null;
  private iterationsRun: number = 0;
  private loopRunning: boolean = false;
  private loopAborted: boolean = false;

  constructor(orchestratorConfig: OrchestratorConfig) {
    this.config = orchestratorConfig.config;
    this.eventBus = orchestratorConfig.eventBus || null;
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

    // Set up execution engine with platform runner
    this.executionEngine.setRunner(deps.platformRunner);

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

    // Initialize state machine to planning state
    this.stateMachine.send({ type: 'INIT' });
  }

  /**
   * Begin orchestration loop
   */
  async start(): Promise<void> {
    if (this.stateMachine.getCurrentState() !== 'planning') {
      throw new Error(`Cannot start from state: ${this.stateMachine.getCurrentState()}`);
    }

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

    this.startedAt = new Date();
    this.iterationsRun = 0;
    this.loopRunning = true;
    this.loopAborted = false;

    await this.runLoop();
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

    this.loopAborted = true;
  }

  /**
   * Resume execution
   */
  async resume(): Promise<void> {
    if (this.stateMachine.getCurrentState() !== 'paused') {
      throw new Error(`Cannot resume from state: ${this.stateMachine.getCurrentState()}`);
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

    // Publish state change event
    if (this.eventBus) {
      this.eventBus.emit({
        type: 'state_changed',
        from: previousState,
        to: newState,
      });
    }

    this.loopAborted = true;
    this.loopRunning = false;

    // Sync state to PRD
    await this.tierStateManager.syncToPrd();
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

        // Build iteration context
        const context = await this.buildIterationContext(subtask);

        // Publish iteration_started event
        if (this.eventBus) {
          this.eventBus.emit({
            type: 'iteration_started',
            subtaskId: subtask.id,
            iterationNumber: context.iterationNumber,
          });
        }

        // Execute iteration
        const result = await this.executionEngine.spawnIteration(context);

        // Publish iteration_completed event
        if (this.eventBus) {
          this.eventBus.emit({
            type: 'iteration_completed',
            subtaskId: subtask.id,
            passed: result.success,
          });
        }

        // Handle result
        await this.handleIterationResult(result, subtask);

        // Record progress
        await this.recordProgress(result, subtask);

        // Publish budget update event
        await this.publishBudgetUpdateEvent(subtask);

        // Commit changes
        await this.commitChanges(result, subtask);

        // Check advancement
        const advancement = await this.autoAdvancement.checkAndAdvance();
        await this.handleAdvancement(advancement);

        this.iterationsRun++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Publish error event
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

        this.stateMachine.send({ type: 'ERROR', error: errorMessage });
        throw error;
      }
    }
  }

  /**
   * Build iteration context for execution
   */
  private async buildIterationContext(subtask: TierNode): Promise<IterationContext> {
    const task = subtask.parent;
    const phase = task?.parent;

    if (!task || !phase) {
      throw new Error(`Subtask ${subtask.id} missing parent task or phase`);
    }

    // Get iteration number
    const iterationNumber = subtask.data.iterations + 1;

    // Load progress entries
    const progressEntries = await this.deps.progressManager.getLatest(10);

    // Load agents content
    const agentsContent = await this.deps.agentsManager.loadForContext({
      phaseId: phase.id,
      taskId: task.id,
      filesTargeted: [],
    });

    // Build progress content string
    const progressContent = progressEntries
      .map((entry: ProgressEntry) => {
        const lines = [
          `${entry.timestamp} - ${entry.itemId} (${entry.status})`,
          `  Session: ${entry.sessionId}`,
          `  Platform: ${entry.platform}`,
          `  Duration: ${entry.duration}`,
        ];

        if (entry.accomplishments.length > 0) {
          lines.push('  Accomplishments:');
          entry.accomplishments.forEach((acc: string) => lines.push(`    - ${acc}`));
        }

        if (entry.filesChanged.length > 0) {
          lines.push('  Files Changed:');
          entry.filesChanged.forEach((file: { path: string; description: string }) =>
            lines.push(`    - ${file.path} - ${file.description}`)
          );
        }

        return lines.join('\n');
      })
      .join('\n\n');

    // Build agents content array
    const agentsContentArray = agentsContent.map((agent) => agent.content);

    // Get tier plan from subtask
    const subtaskPlan: TierPlan = {
      id: subtask.id,
      title: subtask.data.title,
      description: subtask.data.description,
      approach: subtask.data.plan.approach,
      dependencies: subtask.data.plan.dependencies,
    };

    return {
      subtaskId: subtask.id,
      taskId: task.id,
      phaseId: phase.id,
      iterationNumber,
      projectPath: this.config.project.workingDirectory,
      progressContent,
      agentsContent: agentsContentArray,
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
   * Handle iteration result
   */
  private async handleIterationResult(result: IterationResult, subtask: TierNode): Promise<void> {
    // Parse output
    const parsed = this.outputParser.parse(result.output);

    // Update subtask iterations count
    subtask.data.iterations = result.success ? subtask.data.iterations + 1 : subtask.data.iterations;

    if (result.success && result.completionSignal === 'COMPLETE') {
      // Mark iteration as complete
      subtask.stateMachine.send({ type: 'ITERATION_COMPLETE', success: true });

      // Transition to gating
      subtask.stateMachine.send({ type: 'ITERATION_COMPLETE', success: true });
    } else if (result.completionSignal === 'GUTTER' || !result.success) {
      // Mark iteration as failed
      const errorMsg = result.error ?? parsed.errors.join('; ') ?? 'Iteration failed';
      subtask.stateMachine.send({ type: 'ITERATION_FAILED', error: errorMsg });

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
  }

  /**
   * Handle gate result
   */
  private async handleGateResult(result: GateResult, tier: TierNode): Promise<void> {
    if (result.passed) {
      tier.stateMachine.send({ type: 'GATE_PASSED' });
    } else {
      // Determine if minor or major failure
      const isMinor = this.isMinorFailure(result);
      if (isMinor) {
        tier.stateMachine.send({ type: 'GATE_FAILED_MINOR' });
      } else {
        tier.stateMachine.send({ type: 'GATE_FAILED_MAJOR' });
      }
    }

    // Publish gate_complete event
    if (this.eventBus) {
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

    // Sync state to PRD
    await this.tierStateManager.syncToPrd();
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
          this.tierStateManager.setCurrentSubtask(result.next.id);
        }
        break;

      case 'advance_task':
        if (result.next) {
          this.tierStateManager.setCurrentTask(result.next.id);
        }
        // Publish progress event after task advancement
        this.publishProgressEvent();
        break;

      case 'advance_phase':
        if (result.next) {
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
        this.stateMachine.send({ type: 'COMPLETE' });
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
  private async publishBudgetUpdateEvent(subtask: TierNode): Promise<void> {
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

  /**
   * Record progress
   */
  private async recordProgress(result: IterationResult, subtask: TierNode): Promise<void> {
    const sessionId = this.deps.progressManager.generateSessionId();
    const platform = this.config.tiers.subtask.platform;
    const duration = `${Math.floor(result.duration / 60000)}m ${Math.floor((result.duration % 60000) / 1000)}s`;

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
      learnings: result.learnings,
      nextSteps: [],
    };

    await this.deps.progressManager.append(entry);
  }

  /**
   * Commit changes to git
   */
  private async commitChanges(result: IterationResult, subtask: TierNode): Promise<void> {
    if (result.filesChanged.length === 0) {
      return;
    }

    // Check git status
    const status = await this.deps.gitManager.getStatus();
    if (status.modified.length === 0 && status.untracked.length === 0) {
      return;
    }

    // Stage all changes
    await this.deps.gitManager.add(['.']);

    // Commit with formatted message
    const message = `ralph: [subtask] ${subtask.id} ${subtask.data.title}`;
    const commitResult = await this.deps.gitManager.commit({ message, files: result.filesChanged });

    // Publish commit event if successful
    if (commitResult.success && this.eventBus) {
      // Get commit SHA
      const sha = await this.deps.gitManager.getHeadSha();

      if (sha) {
        this.eventBus.emit({
          type: 'commit',
          sha,
          message,
          files: result.filesChanged.length,
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
  private determineFailureType(result: GateResult): 'test' | 'acceptance' | 'timeout' | 'error' {
    if (!result.failureReason) {
      return 'error';
    }

    const reason = result.failureReason.toLowerCase();
    if (reason.includes('timeout')) {
      return 'timeout';
    }
    if (reason.includes('test')) {
      return 'test';
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
    switch (decision.action) {
      case 'self_fix':
        await this.escalation.executeSelfFix(decision, tier);
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

      // Try to get project path from config or use current working directory
      const projectPath = this.config.project.workingDirectory || process.cwd();
      const gitDir = join(projectPath, '.git');

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
  private parsePlanFromOutput(output: string, scope: 'phase' | 'task' | 'subtask'): TierPlan {
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

    // Get platform and model for this tier type
    const tierConfig = this.config.tiers[scope];
    const platform = tierConfig.platform;
    const model = tierConfig.model;

    // Build replan prompt
    const prompt = this.buildReplanPrompt(tier, scope);

    // Invoke planning agent via platform runner
    const runner = this.deps.platformRunner;
    const request: ExecutionRequest = {
      prompt,
      model,
      workingDirectory: this.config.project.workingDirectory,
      nonInteractive: true,
      timeout: 300000, // 5 minutes for planning
    };

    // Spawn process and collect output
    await runner.prepareWorkingDirectory(this.config.project.workingDirectory);
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

    // Increment iteration count
    currentSubtask.data.iterations += 1;

    // Build iteration context
    const context = await this.buildIterationContext(currentSubtask);

    // Publish iteration_started event
    if (this.eventBus) {
      this.eventBus.emit({
        type: 'iteration_started',
        subtaskId: currentSubtask.id,
        iterationNumber: context.iterationNumber,
      });
    }

    // Execute iteration
    const result = await this.executionEngine.spawnIteration(context);

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

    // Record progress
    await this.recordProgress(result, currentSubtask);

    // Publish budget update
    await this.publishBudgetUpdateEvent(currentSubtask);

    // Commit changes
    await this.commitChanges(result, currentSubtask);
  }
}
