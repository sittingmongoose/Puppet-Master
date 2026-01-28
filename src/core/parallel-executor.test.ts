/**
 * Tests for ParallelExecutor
 *
 * See BUILD_QUEUE_IMPROVEMENTS.md P2-T01
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ParallelExecutor, createParallelExecutor } from './parallel-executor.js';
import { TierNode, type TierNodeData } from './tier-node.js';
import type { ExecutionEngine, IterationContext, IterationResult } from './execution-engine.js';
import type { WorktreeManager, MergeResult, WorktreeInfo } from '../git/worktree-manager.js';
import type { EventBus } from '../logging/event-bus.js';
import type { TierPlan } from '../types/tiers.js';

/**
 * Create a mock WorktreeManager
 */
function createMockWorktreeManager(): WorktreeManager {
  const worktrees = new Map<string, WorktreeInfo>();

  return {
    createWorktree: vi.fn(async (agentId: string) => {
      const info: WorktreeInfo = {
        agentId,
        path: `/tmp/worktree-${agentId}`,
        branch: `worktree/${agentId}`,
        baseBranch: 'main',
        createdAt: new Date().toISOString(),
        status: 'active',
      };
      worktrees.set(agentId, info);
      return info.path;
    }),
    destroyWorktree: vi.fn(async (agentId: string) => {
      worktrees.delete(agentId);
    }),
    mergeWorktree: vi.fn(async (agentId: string, _targetBranch?: string): Promise<MergeResult> => {
      const info = worktrees.get(agentId);
      return {
        success: true,
        conflictFiles: [],
        sourceBranch: info?.branch || `worktree/${agentId}`,
        targetBranch: 'main',
        mergeCommitSha: 'abc123',
      };
    }),
    getWorktree: vi.fn((agentId: string) => worktrees.get(agentId)),
    hasWorktree: vi.fn((agentId: string) => worktrees.has(agentId)),
    listWorktrees: vi.fn(() => Array.from(worktrees.values())),
    cleanupAll: vi.fn(async () => { worktrees.clear(); }),
  } as unknown as WorktreeManager;
}

/**
 * Create a mock ExecutionEngine
 */
function createMockExecutionEngine(
  resultOverrides?: Partial<IterationResult>
): ExecutionEngine {
  return {
    spawnIteration: vi.fn(async (_context: IterationContext): Promise<IterationResult> => ({
      success: true,
      output: 'Test output',
      processId: 12345,
      duration: 1000,
      exitCode: 0,
      completionSignal: 'COMPLETE',
      learnings: [],
      filesChanged: ['file1.ts'],
      ...resultOverrides,
    })),
  } as unknown as ExecutionEngine;
}

/**
 * Create a mock EventBus
 */
function createMockEventBus(): EventBus {
  return {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  } as unknown as EventBus;
}

/**
 * Helper to create a mock subtask TierNode
 */
function createSubtaskNode(
  id: string,
  dependsOn: string[] = []
): TierNode {
  const plan: TierPlan = {
    id: `plan-${id}`,
    title: `Plan for ${id}`,
    description: `Plan description for ${id}`,
    steps: [],
    context: '',
    constraints: [],
    dependsOn,
  };

  const data: TierNodeData = {
    id,
    type: 'subtask',
    title: `Subtask ${id}`,
    description: `Description for ${id}`,
    plan,
    acceptanceCriteria: [],
    testPlan: { commands: [], failFast: false },
    evidence: [],
    iterations: 0,
    maxIterations: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return new TierNode(data);
}

/**
 * Create a mock context builder
 */
function createMockContextBuilder(): (subtask: TierNode, worktreePath: string) => Promise<IterationContext> {
  return async (subtask: TierNode, worktreePath: string): Promise<IterationContext> => ({
    tierNode: subtask,
    iterationNumber: 1,
    maxIterations: 3,
    projectPath: worktreePath,
    projectName: 'test-project',
    sessionId: 'PM-2026-01-24-12-00-00-001',
    platform: 'codex',
    progressEntries: [],
    agentsContent: [],
    subtaskPlan: subtask.data.plan,
  });
}

/**
 * Create a mock runner provider
 */
function createMockRunnerProvider() {
  return (_subtask: TierNode) => ({
    platform: 'codex' as const,
    sessionReuseAllowed: false,
    allowedContextFiles: [],
    defaultTimeout: 300000,
    hardTimeout: 600000,
    spawnFreshProcess: vi.fn(),
    prepareWorkingDirectory: vi.fn(),
    cleanupAfterExecution: vi.fn(),
    terminateProcess: vi.fn(),
    forceKillProcess: vi.fn(),
    captureStdout: vi.fn(),
    captureStderr: vi.fn(),
    getTranscript: vi.fn(),
  }) as unknown as import('../types/platforms.js').PlatformRunnerContract;
}

describe('ParallelExecutor', () => {
  let worktreeManager: WorktreeManager;
  let executionEngine: ExecutionEngine;
  let eventBus: EventBus;
  let executor: ParallelExecutor;

  beforeEach(() => {
    worktreeManager = createMockWorktreeManager();
    executionEngine = createMockExecutionEngine();
    eventBus = createMockEventBus();
    executor = createParallelExecutor(worktreeManager, executionEngine, eventBus, {
      maxConcurrency: 2,
    });
  });

  describe('executeParallel', () => {
    it('should execute independent subtasks in parallel', async () => {
      const subtasks = [
        createSubtaskNode('ST-001'),
        createSubtaskNode('ST-002'),
        createSubtaskNode('ST-003'),
      ];

      const result = await executor.executeParallel(
        subtasks,
        createMockContextBuilder(),
        createMockRunnerProvider()
      );

      expect(result.success).toBe(true);
      expect(result.results.size).toBe(3);
      expect(result.conflictSubtasks).toHaveLength(0);

      // All should have been executed
      expect(executionEngine.spawnIteration).toHaveBeenCalledTimes(3);

      // Worktrees should have been created
      expect(worktreeManager.createWorktree).toHaveBeenCalledTimes(3);
    });

    it('should respect dependency order', async () => {
      const subtasks = [
        createSubtaskNode('ST-001'),
        createSubtaskNode('ST-002', ['ST-001']),
        createSubtaskNode('ST-003', ['ST-002']),
      ];

      const executionOrder: string[] = [];
      const spawnIterationMock = vi.mocked(executionEngine.spawnIteration);
      const originalImplementation = spawnIterationMock.getMockImplementation();
      spawnIterationMock.mockImplementation(async (context: IterationContext) => {
        executionOrder.push(context.tierNode.id);
        if (!originalImplementation) {
          throw new Error('Missing spawnIteration implementation');
        }
        return originalImplementation(context);
      });

      const result = await executor.executeParallel(
        subtasks,
        createMockContextBuilder(),
        createMockRunnerProvider()
      );

      expect(result.success).toBe(true);

      // Verify execution order respects dependencies
      const idx1 = executionOrder.indexOf('ST-001');
      const idx2 = executionOrder.indexOf('ST-002');
      const idx3 = executionOrder.indexOf('ST-003');

      expect(idx1).toBeLessThan(idx2);
      expect(idx2).toBeLessThan(idx3);
    });

    it('should respect maxConcurrency', async () => {
      // Create more subtasks than maxConcurrency
      const subtasks = [
        createSubtaskNode('ST-001'),
        createSubtaskNode('ST-002'),
        createSubtaskNode('ST-003'),
        createSubtaskNode('ST-004'),
      ];

      const result = await executor.executeParallel(
        subtasks,
        createMockContextBuilder(),
        createMockRunnerProvider()
      );

      expect(result.success).toBe(true);
      // Max concurrency used should not exceed configured max
      expect(result.maxConcurrencyUsed).toBeLessThanOrEqual(2);
    });

    it('should handle subtask failure', async () => {
      const failingEngine = createMockExecutionEngine({
        success: false,
        completionSignal: undefined,
        error: 'Subtask failed',
      });

      const failingExecutor = createParallelExecutor(
        worktreeManager,
        failingEngine,
        eventBus,
        { maxConcurrency: 2, continueOnFailure: false }
      );

      const subtasks = [
        createSubtaskNode('ST-001'),
        createSubtaskNode('ST-002'),
      ];

      const result = await failingExecutor.executeParallel(
        subtasks,
        createMockContextBuilder(),
        createMockRunnerProvider()
      );

      expect(result.success).toBe(false);
    });

    it('should continue on failure when configured', async () => {
      // First subtask fails, second succeeds
      let callCount = 0;
      const mixedEngine = {
        spawnIteration: vi.fn(async (): Promise<IterationResult> => {
          callCount++;
          if (callCount === 1) {
            return {
              success: false,
              output: 'Failed',
              processId: 12345,
              duration: 1000,
              exitCode: 1,
              learnings: [],
              filesChanged: [],
              error: 'First failed',
            };
          }
          return {
            success: true,
            output: 'Success',
            processId: 12346,
            duration: 1000,
            exitCode: 0,
            completionSignal: 'COMPLETE',
            learnings: [],
            filesChanged: [],
          };
        }),
      } as unknown as ExecutionEngine;

      const continueExecutor = createParallelExecutor(
        worktreeManager,
        mixedEngine,
        eventBus,
        { maxConcurrency: 1, continueOnFailure: true }
      );

      // Sequential deps so we control order
      const subtasks = [
        createSubtaskNode('ST-001'),
        createSubtaskNode('ST-002', ['ST-001']),
      ];

      const result = await continueExecutor.executeParallel(
        subtasks,
        createMockContextBuilder(),
        createMockRunnerProvider()
      );

      // Overall should fail
      expect(result.success).toBe(false);
      // But both should have been attempted
      expect(mixedEngine.spawnIteration).toHaveBeenCalledTimes(2);
    });

    it('should handle merge conflicts', async () => {
      const conflictWorktreeManager = createMockWorktreeManager();
      vi.mocked(conflictWorktreeManager.mergeWorktree).mockImplementation(async (agentId: string): Promise<MergeResult> => ({
        success: false,
        conflictFiles: ['conflicting-file.ts'],
        sourceBranch: `worktree/${agentId}`,
        targetBranch: 'main',
        error: 'Merge conflict detected',
      }));

      const conflictExecutor = createParallelExecutor(
        conflictWorktreeManager,
        executionEngine,
        eventBus,
        { maxConcurrency: 2, mergeResults: true }
      );

      const subtasks = [createSubtaskNode('ST-001')];

      const result = await conflictExecutor.executeParallel(
        subtasks,
        createMockContextBuilder(),
        createMockRunnerProvider()
      );

      expect(result.success).toBe(false);
      expect(result.conflictSubtasks).toContain('ST-001');
    });

    it('should emit events during execution', async () => {
      const subtasks = [createSubtaskNode('ST-001')];

      await executor.executeParallel(
        subtasks,
        createMockContextBuilder(),
        createMockRunnerProvider()
      );

      // Check that events were emitted
      expect(eventBus.emit).toHaveBeenCalled();

      // Check for specific event types
      const emittedEvents = vi.mocked(eventBus.emit).mock.calls.map(
        (call) => (call[0] as { type: string }).type
      );

      expect(emittedEvents).toContain('parallel_execution_started');
      expect(emittedEvents).toContain('worktree_creating');
      expect(emittedEvents).toContain('worktree_created');
      expect(emittedEvents).toContain('parallel_subtask_completed');
      expect(emittedEvents).toContain('parallel_execution_completed');
    });

    it('should throw on invalid dependencies', async () => {
      const subtasks = [
        createSubtaskNode('ST-001', ['ST-GHOST']),
      ];

      await expect(
        executor.executeParallel(
          subtasks,
          createMockContextBuilder(),
          createMockRunnerProvider()
        )
      ).rejects.toThrow(/Invalid dependencies/);
    });

    it('should throw on circular dependencies', async () => {
      const subtasks = [
        createSubtaskNode('ST-001', ['ST-002']),
        createSubtaskNode('ST-002', ['ST-001']),
      ];

      await expect(
        executor.executeParallel(
          subtasks,
          createMockContextBuilder(),
          createMockRunnerProvider()
        )
      ).rejects.toThrow(/Circular/i);
    });
  });

  describe('executeSequential', () => {
    it('should execute subtasks one by one', async () => {
      const subtasks = [
        createSubtaskNode('ST-001'),
        createSubtaskNode('ST-002'),
      ];

      const result = await executor.executeSequential(
        subtasks,
        createMockContextBuilder(),
        createMockRunnerProvider(),
        '/project'
      );

      expect(result.success).toBe(true);
      expect(result.results.size).toBe(2);
      expect(result.maxConcurrencyUsed).toBe(1);
    });

    it('should stop on failure when not configured to continue', async () => {
      let callCount = 0;
      const failingEngine = {
        spawnIteration: vi.fn(async (): Promise<IterationResult> => {
          callCount++;
          return {
            success: false,
            output: 'Failed',
            processId: 12345,
            duration: 1000,
            exitCode: 1,
            learnings: [],
            filesChanged: [],
            error: 'Failed',
          };
        }),
      } as unknown as ExecutionEngine;

      const failingExecutor = createParallelExecutor(
        worktreeManager,
        failingEngine,
        eventBus,
        { maxConcurrency: 1, continueOnFailure: false }
      );

      const subtasks = [
        createSubtaskNode('ST-001'),
        createSubtaskNode('ST-002'),
        createSubtaskNode('ST-003'),
      ];

      const result = await failingExecutor.executeSequential(
        subtasks,
        createMockContextBuilder(),
        createMockRunnerProvider(),
        '/project'
      );

      expect(result.success).toBe(false);
      // Should have stopped after first failure
      expect(callCount).toBe(1);
    });

    it('should respect dependency order', async () => {
      const executionOrder: string[] = [];
      const trackingEngine = {
        spawnIteration: vi.fn(async (context: IterationContext): Promise<IterationResult> => {
          executionOrder.push(context.tierNode.id);
          return {
            success: true,
            output: 'Success',
            processId: 12345,
            duration: 1000,
            exitCode: 0,
            completionSignal: 'COMPLETE',
            learnings: [],
            filesChanged: [],
          };
        }),
      } as unknown as ExecutionEngine;

      const trackingExecutor = createParallelExecutor(
        worktreeManager,
        trackingEngine,
        eventBus,
        { maxConcurrency: 1 }
      );

      // Out of order in array but has dependencies
      const subtasks = [
        createSubtaskNode('ST-C', ['ST-B']),
        createSubtaskNode('ST-A'),
        createSubtaskNode('ST-B', ['ST-A']),
      ];

      await trackingExecutor.executeSequential(
        subtasks,
        createMockContextBuilder(),
        createMockRunnerProvider(),
        '/project'
      );

      const idxA = executionOrder.indexOf('ST-A');
      const idxB = executionOrder.indexOf('ST-B');
      const idxC = executionOrder.indexOf('ST-C');

      expect(idxA).toBeLessThan(idxB);
      expect(idxB).toBeLessThan(idxC);
    });
  });

  describe('getConfig', () => {
    it('should return current configuration', () => {
      const config = executor.getConfig();

      expect(config.maxConcurrency).toBe(2);
      expect(config.continueOnFailure).toBe(false);
      expect(config.mergeResults).toBe(true);
    });
  });

  describe('isAvailable', () => {
    it('should return true when properly initialized', () => {
      expect(executor.isAvailable()).toBe(true);
    });
  });

  describe('createParallelExecutor factory', () => {
    it('should create executor with default config', () => {
      const newExecutor = createParallelExecutor(
        worktreeManager,
        executionEngine,
        eventBus
      );

      const config = newExecutor.getConfig();
      expect(config.maxConcurrency).toBe(3); // default
      expect(config.continueOnFailure).toBe(false); // default
    });

    it('should create executor with custom config', () => {
      const newExecutor = createParallelExecutor(
        worktreeManager,
        executionEngine,
        eventBus,
        { maxConcurrency: 5, continueOnFailure: true }
      );

      const config = newExecutor.getConfig();
      expect(config.maxConcurrency).toBe(5);
      expect(config.continueOnFailure).toBe(true);
    });
  });
});
