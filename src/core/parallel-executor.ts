/**
 * ParallelExecutor for RWM Puppet Master
 *
 * Coordinates parallel execution of subtasks using git worktrees for isolation.
 * Uses dependency analysis to determine execution levels and a semaphore
 * to limit concurrent executions.
 *
 * See BUILD_QUEUE_IMPROVEMENTS.md P2-T01 for requirements.
 */

import type { TierNode } from './tier-node.js';
import type { ExecutionEngine, IterationContext, IterationResult } from './execution-engine.js';
import type { PlatformRunnerContract } from '../types/platforms.js';
import type { WorktreeManager, MergeResult, WorktreeInfo } from '../git/worktree-manager.js';
import type { EventBus } from '../logging/event-bus.js';
import {
  buildDependencyGraph,
  getReadySubtasks,
  validateDependencies,
  type DependencyGraph,
} from './dependency-analyzer.js';

/**
 * Result of a parallel execution run
 */
export interface ParallelExecutionResult {
  /** Overall success (all subtasks passed) */
  success: boolean;
  /** Individual results per subtask */
  results: Map<string, SubtaskExecutionResult>;
  /** Subtasks that had merge conflicts */
  conflictSubtasks: string[];
  /** Total execution time in milliseconds */
  totalDurationMs: number;
  /** Maximum concurrency actually used */
  maxConcurrencyUsed: number;
}

/**
 * Result for a single subtask execution
 */
export interface SubtaskExecutionResult {
  /** Subtask ID */
  subtaskId: string;
  /** Whether execution succeeded */
  success: boolean;
  /** Iteration result (if executed) */
  iterationResult?: IterationResult;
  /** Merge result (if merged) */
  mergeResult?: MergeResult;
  /** Worktree info (if created) */
  worktreeInfo?: WorktreeInfo;
  /** Execution time in milliseconds */
  durationMs: number;
  /** Error message if failed */
  error?: string;
  /** Execution level in dependency graph */
  level: number;
}

/**
 * Configuration for ParallelExecutor
 */
export interface ParallelExecutorConfig {
  /** Maximum concurrent executions (default: 3) */
  maxConcurrency: number;
  /** Whether to continue execution after a subtask fails (default: false) */
  continueOnFailure: boolean;
  /** Whether to merge results back to main branch (default: true) */
  mergeResults: boolean;
  /** Target branch for merging (default: current branch) */
  targetBranch?: string;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ParallelExecutorConfig = {
  maxConcurrency: 3,
  continueOnFailure: false,
  mergeResults: true,
};

/**
 * Simple semaphore for limiting concurrency
 */
class Semaphore {
  private currentCount: number = 0;
  private waitQueue: Array<() => void> = [];

  constructor(private readonly maxCount: number) {}

  async acquire(): Promise<void> {
    if (this.currentCount < this.maxCount) {
      this.currentCount++;
      return;
    }

    // Wait for a slot to become available
    return new Promise((resolve) => {
      this.waitQueue.push(() => {
        this.currentCount++;
        resolve();
      });
    });
  }

  release(): void {
    this.currentCount--;
    const next = this.waitQueue.shift();
    if (next) {
      next();
    }
  }

  getCurrentCount(): number {
    return this.currentCount;
  }
}

/**
 * ParallelExecutor coordinates parallel subtask execution
 */
export class ParallelExecutor {
  private readonly config: ParallelExecutorConfig;
  private readonly semaphore: Semaphore;

  constructor(
    private readonly worktreeManager: WorktreeManager,
    private readonly executionEngine: ExecutionEngine,
    private readonly eventBus: EventBus | null,
    config?: Partial<ParallelExecutorConfig>
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.semaphore = new Semaphore(this.config.maxConcurrency);
  }

  /**
   * Execute subtasks in parallel respecting dependencies
   * @param subtasks - Array of subtask TierNodes to execute
   * @param contextBuilder - Function to build IterationContext for each subtask
   * @param runnerProvider - Function to get platform runner for each subtask
   * @returns ParallelExecutionResult with all outcomes
   */
  async executeParallel(
    subtasks: TierNode[],
    contextBuilder: (subtask: TierNode, worktreePath: string) => Promise<IterationContext>,
    runnerProvider: (subtask: TierNode) => PlatformRunnerContract
  ): Promise<ParallelExecutionResult> {
    const startTime = Date.now();
    const results = new Map<string, SubtaskExecutionResult>();
    const conflictSubtasks: string[] = [];
    let maxConcurrencyUsed = 0;

    // Validate dependencies first
    const validation = validateDependencies(subtasks);
    if (!validation.isValid) {
      throw new Error(`Invalid dependencies: ${validation.errors.join('; ')}`);
    }

    // Build dependency graph
    const graph = buildDependencyGraph(subtasks);

    // Emit parallel execution started event
    this.emitEvent('parallel_execution_started', {
      totalSubtasks: subtasks.length,
      levels: graph.levels.length,
      maxConcurrency: this.config.maxConcurrency,
    });

    // Track execution state
    const completedIds = new Set<string>();
    const inProgressIds = new Set<string>();
    const failedIds = new Set<string>();

    // Process all subtasks
    let allSuccess = true;
    let levelIndex = 0;

    for (const level of graph.levels) {
      // Get subtask IDs at this level
      const levelSubtaskIds = new Set(level.map(n => n.id));

      // Execute all subtasks in this level in parallel
      const levelPromises = level.map(async (subtask) => {
        // Wait for semaphore slot
        await this.semaphore.acquire();
        inProgressIds.add(subtask.id);

        // Track max concurrency
        const currentConcurrency = this.semaphore.getCurrentCount();
        maxConcurrencyUsed = Math.max(maxConcurrencyUsed, currentConcurrency);

        try {
          const result = await this.executeSubtaskInWorktree(
            subtask,
            contextBuilder,
            runnerProvider,
            levelIndex
          );
          results.set(subtask.id, result);

          if (result.success) {
            completedIds.add(subtask.id);

            // Handle merge if configured
            if (this.config.mergeResults && result.worktreeInfo) {
              const mergeResult = await this.worktreeManager.mergeWorktree(
                subtask.id,
                this.config.targetBranch
              );
              result.mergeResult = mergeResult;

              if (!mergeResult.success) {
                result.success = false;
                result.error = `Merge conflict: ${mergeResult.conflictFiles.join(', ')}`;
                conflictSubtasks.push(subtask.id);
                failedIds.add(subtask.id);
                allSuccess = false;
              }
            }
          } else {
            failedIds.add(subtask.id);
            allSuccess = false;
          }

          // Emit subtask completed event
          this.emitEvent('parallel_subtask_completed', {
            subtaskId: subtask.id,
            success: result.success,
            level: levelIndex,
            durationMs: result.durationMs,
          });

        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          results.set(subtask.id, {
            subtaskId: subtask.id,
            success: false,
            durationMs: Date.now() - startTime,
            error: errorMsg,
            level: levelIndex,
          });
          failedIds.add(subtask.id);
          allSuccess = false;

          this.emitEvent('parallel_subtask_error', {
            subtaskId: subtask.id,
            error: errorMsg,
            level: levelIndex,
          });

        } finally {
          inProgressIds.delete(subtask.id);
          this.semaphore.release();
        }
      });

      // Wait for all subtasks in this level to complete
      await Promise.all(levelPromises);

      // Check if we should continue after failures
      if (!this.config.continueOnFailure && failedIds.size > 0) {
        // Stop execution - don't process remaining levels
        break;
      }

      levelIndex++;
    }

    const totalDurationMs = Date.now() - startTime;

    // Emit parallel execution completed event
    this.emitEvent('parallel_execution_completed', {
      success: allSuccess,
      totalSubtasks: subtasks.length,
      completedSubtasks: completedIds.size,
      failedSubtasks: failedIds.size,
      conflictSubtasks: conflictSubtasks.length,
      totalDurationMs,
      maxConcurrencyUsed,
    });

    return {
      success: allSuccess && conflictSubtasks.length === 0,
      results,
      conflictSubtasks,
      totalDurationMs,
      maxConcurrencyUsed,
    };
  }

  /**
   * Execute a single subtask in an isolated worktree
   */
  private async executeSubtaskInWorktree(
    subtask: TierNode,
    contextBuilder: (subtask: TierNode, worktreePath: string) => Promise<IterationContext>,
    runnerProvider: (subtask: TierNode) => PlatformRunnerContract,
    level: number
  ): Promise<SubtaskExecutionResult> {
    const startTime = Date.now();
    const agentId = subtask.id;

    // Emit worktree creation event
    this.emitEvent('worktree_creating', { agentId, subtaskId: subtask.id });

    // Create worktree
    let worktreePath: string;
    try {
      worktreePath = await this.worktreeManager.createWorktree(agentId);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        subtaskId: subtask.id,
        success: false,
        durationMs: Date.now() - startTime,
        error: `Failed to create worktree: ${errorMsg}`,
        level,
      };
    }

    const worktreeInfo = this.worktreeManager.getWorktree(agentId);

    // Emit worktree created event
    this.emitEvent('worktree_created', {
      agentId,
      subtaskId: subtask.id,
      path: worktreePath,
      branch: worktreeInfo?.branch,
    });

    try {
      // Build iteration context with worktree path
      const context = await contextBuilder(subtask, worktreePath);

      // Get platform runner
      const runner = runnerProvider(subtask);

      // Execute iteration in worktree
      const iterationResult = await this.executionEngine.spawnIteration(context, runner);

      return {
        subtaskId: subtask.id,
        success: iterationResult.success && iterationResult.completionSignal === 'COMPLETE',
        iterationResult,
        worktreeInfo,
        durationMs: Date.now() - startTime,
        level,
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        subtaskId: subtask.id,
        success: false,
        worktreeInfo,
        durationMs: Date.now() - startTime,
        error: `Execution failed: ${errorMsg}`,
        level,
      };

    } finally {
      // Clean up worktree on failure or if merge not needed
      if (!this.config.mergeResults) {
        await this.worktreeManager.destroyWorktree(agentId, true).catch(() => {
          // Ignore cleanup errors
        });

        this.emitEvent('worktree_destroyed', {
          agentId,
          subtaskId: subtask.id,
        });
      }
    }
  }

  /**
   * Execute subtasks sequentially (fallback mode)
   * Used when parallel execution is disabled or fails
   */
  async executeSequential(
    subtasks: TierNode[],
    contextBuilder: (subtask: TierNode, worktreePath: string) => Promise<IterationContext>,
    runnerProvider: (subtask: TierNode) => PlatformRunnerContract,
    projectPath: string
  ): Promise<ParallelExecutionResult> {
    const startTime = Date.now();
    const results = new Map<string, SubtaskExecutionResult>();

    // Sort by dependencies if any
    const validation = validateDependencies(subtasks);
    if (!validation.isValid) {
      throw new Error(`Invalid dependencies: ${validation.errors.join('; ')}`);
    }

    let graph: DependencyGraph;
    try {
      graph = buildDependencyGraph(subtasks);
    } catch {
      // If graph building fails, use original order
      graph = { levels: [subtasks], nodes: new Map(), hasDependencies: false, hasCycles: false };
    }

    const sortedSubtasks = graph.levels.flat();
    let allSuccess = true;

    for (let i = 0; i < sortedSubtasks.length; i++) {
      const subtask = sortedSubtasks[i];
      const subtaskStart = Date.now();

      try {
        // Build context with main project path (no worktree)
        const context = await contextBuilder(subtask, projectPath);
        const runner = runnerProvider(subtask);

        // Execute
        const iterationResult = await this.executionEngine.spawnIteration(context, runner);
        const success = iterationResult.success && iterationResult.completionSignal === 'COMPLETE';

        results.set(subtask.id, {
          subtaskId: subtask.id,
          success,
          iterationResult,
          durationMs: Date.now() - subtaskStart,
          level: graph.nodes.get(subtask.id)?.level ?? i,
        });

        if (!success) {
          allSuccess = false;
          if (!this.config.continueOnFailure) {
            break;
          }
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        results.set(subtask.id, {
          subtaskId: subtask.id,
          success: false,
          durationMs: Date.now() - subtaskStart,
          error: errorMsg,
          level: graph.nodes.get(subtask.id)?.level ?? i,
        });
        allSuccess = false;

        if (!this.config.continueOnFailure) {
          break;
        }
      }
    }

    return {
      success: allSuccess,
      results,
      conflictSubtasks: [],
      totalDurationMs: Date.now() - startTime,
      maxConcurrencyUsed: 1,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): ParallelExecutorConfig {
    return { ...this.config };
  }

  /**
   * Check if parallel execution is available
   * (worktree manager must be properly initialized)
   */
  isAvailable(): boolean {
    return this.worktreeManager !== null && this.executionEngine !== null;
  }

  /**
   * Emit event to EventBus if available
   */
  private emitEvent(
    type: 'parallel_execution_started',
    data: { totalSubtasks: number; levels: number; maxConcurrency: number }
  ): void;
  private emitEvent(
    type: 'parallel_execution_completed',
    data: { success: boolean; totalSubtasks: number; completedSubtasks: number; failedSubtasks: number; conflictSubtasks: number; totalDurationMs: number; maxConcurrencyUsed: number }
  ): void;
  private emitEvent(
    type: 'parallel_subtask_completed',
    data: { subtaskId: string; success: boolean; level: number; durationMs: number }
  ): void;
  private emitEvent(
    type: 'parallel_subtask_error',
    data: { subtaskId: string; error: string; level: number }
  ): void;
  private emitEvent(
    type: 'worktree_creating',
    data: { agentId: string; subtaskId: string }
  ): void;
  private emitEvent(
    type: 'worktree_created',
    data: { agentId: string; subtaskId: string; path: string; branch?: string }
  ): void;
  private emitEvent(
    type: 'worktree_destroyed',
    data: { agentId: string; subtaskId: string }
  ): void;
  private emitEvent(type: string, data: Record<string, unknown>): void {
    if (this.eventBus) {
      // Type assertion is safe because overloads ensure correct data for each type
      this.eventBus.emit({ type, ...data } as Parameters<typeof this.eventBus.emit>[0]);
    }
  }
}

/**
 * Factory function to create ParallelExecutor
 */
export function createParallelExecutor(
  worktreeManager: WorktreeManager,
  executionEngine: ExecutionEngine,
  eventBus: EventBus | null,
  config?: Partial<ParallelExecutorConfig>
): ParallelExecutor {
  return new ParallelExecutor(worktreeManager, executionEngine, eventBus, config);
}
