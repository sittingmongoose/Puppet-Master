/**
 * Tests for Worker/Reviewer Orchestrator
 *
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T13
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  WorkerReviewerOrchestrator,
  shouldUseWorkerReviewer,
  createWorkerReviewerOrchestrator,
} from './worker-reviewer.js';
import type {
  WorkerResult,
} from './worker-reviewer.js';
import type { PuppetMasterConfig } from '../types/config.js';
import type { IterationContext, IterationResult } from './execution-engine.js';
import type { TierNode } from './tier-node.js';
import type { ProgressManager } from '../memory/index.js';
import { PlatformRegistry } from '../platforms/registry.js';

// Mock platform runner
const createMockRunner = () => ({
  platform: 'claude' as const,
  spawnFreshProcess: vi.fn().mockResolvedValue({ pid: 12345 }),
  prepareWorkingDirectory: vi.fn().mockResolvedValue(undefined),
  captureStdout: vi.fn().mockImplementation(async function* () {
    yield '```json\n{"verdict": "SHIP", "confidence": 0.9, "reason": "All good"}\n```\n';
    yield '<ralph>COMPLETE</ralph>';
  }),
  captureStderr: vi.fn().mockImplementation(async function* () {
    // Empty
  }),
  terminateProcess: vi.fn().mockResolvedValue(undefined),
  forceKillProcess: vi.fn().mockResolvedValue(undefined),
  getTranscript: vi.fn().mockResolvedValue(''),
  cleanupAfterExecution: vi.fn().mockResolvedValue(undefined),
});

// Mock progress manager
const createMockProgressManager = (): ProgressManager => ({
  generateSessionId: vi.fn().mockReturnValue('test-session-123'),
  append: vi.fn().mockResolvedValue(undefined),
  getLatest: vi.fn().mockResolvedValue([]),
  getByItemId: vi.fn().mockResolvedValue([]),
  clear: vi.fn().mockResolvedValue(undefined),
} as unknown as ProgressManager);

// Mock tier node
const createMockTierNode = (id: string, type: 'subtask' | 'task' | 'phase'): TierNode => ({
  id,
  type,
  data: {
    title: `Test ${type}`,
    description: `Description for ${id}`,
    acceptanceCriteria: [
      { id: 'AC-001', description: 'Criterion 1', type: 'test' },
      { id: 'AC-002', description: 'Criterion 2', type: 'test' },
    ],
    testPlan: {
      commands: [{ command: 'npm', args: ['test'] }],
    },
    plan: { description: 'Test plan', approach: [], dependencies: [] },
    maxIterations: 3,
    iterations: 0,
  },
  parent: type === 'subtask' ? createMockTierNode('TK-001', 'task') : 
          type === 'task' ? createMockTierNode('PH-001', 'phase') : undefined,
  children: [],
  stateMachine: {
    getIterationCount: vi.fn().mockReturnValue(1),
    getState: vi.fn().mockReturnValue('running'),
    send: vi.fn().mockReturnValue(true),
  },
  getState: vi.fn().mockReturnValue('running'),
} as unknown as TierNode);

// Mock config with reviewer enabled
const createMockConfig = (reviewerEnabled = true): PuppetMasterConfig => ({
  project: { name: 'test-project', workingDirectory: '/test' },
  tiers: {
    phase: { platform: 'cursor', model: 'gpt-4', selfFix: true, maxIterations: 3, escalation: null },
    task: { platform: 'cursor', model: 'gpt-4', selfFix: true, maxIterations: 3, escalation: 'phase' },
    subtask: { platform: 'cursor', model: 'gpt-4', selfFix: true, maxIterations: 5, escalation: 'task' },
    iteration: { platform: 'cursor', model: 'gpt-4', selfFix: false, maxIterations: 1, escalation: null },
    reviewer: reviewerEnabled ? {
      platform: 'claude',
      model: 'sonnet',
      enabled: true,
      confidenceThreshold: 0.7,
      maxReviewerIterations: 3,
    } : undefined,
  },
  branching: {
    baseBranch: 'main',
    namingPattern: 'puppet/{phase}/{task}',
    granularity: 'per-task',
    pushPolicy: 'per-subtask',
    mergePolicy: 'squash',
    autoPr: false,
  },
  verification: { browserAdapter: 'playwright', screenshotOnFailure: true, evidenceDirectory: '.puppet-master/evidence' },
  memory: {
    progressFile: 'progress.txt',
    agentsFile: 'AGENTS.md',
    prdFile: 'prd.json',
    multiLevelAgents: false,
    agentsEnforcement: {
      requireUpdateOnFailure: true,
      requireUpdateOnGotcha: true,
      gateFailsOnMissingUpdate: false,
      reviewerMustAcknowledge: false,
    },
  },
  budgets: {
    claude: { maxCallsPerRun: 100, maxCallsPerHour: 50, maxCallsPerDay: 200, fallbackPlatform: null },
    codex: { maxCallsPerRun: 100, maxCallsPerHour: 50, maxCallsPerDay: 200, fallbackPlatform: null },
    cursor: { maxCallsPerRun: 100, maxCallsPerHour: 50, maxCallsPerDay: 200, fallbackPlatform: null },
    gemini: { maxCallsPerRun: 100, maxCallsPerHour: 50, maxCallsPerDay: 200, fallbackPlatform: null },
    copilot: { maxCallsPerRun: 100, maxCallsPerHour: 50, maxCallsPerDay: 200, fallbackPlatform: null },
  },
  budgetEnforcement: { onLimitReached: 'pause', warnAtPercentage: 80, notifyOnFallback: true },
  logging: { level: 'info', retentionDays: 7 },
  cliPaths: {
    cursor: 'cursor',
    codex: 'codex',
    claude: 'claude',
    gemini: 'gemini',
    copilot: 'copilot',
  },
});

// Mock iteration context
const createMockIterationContext = (subtask: TierNode): IterationContext => ({
  tierNode: subtask,
  iterationNumber: 1,
  maxIterations: 5,
  projectPath: '/test/project',
  projectName: 'test-project',
  sessionId: 'test-session-123',
  platform: 'cursor',
  model: 'gpt-4',
  progressEntries: [],
  agentsContent: [],
  subtaskPlan: {
    id: subtask.id,
    title: subtask.data.title,
    description: subtask.data.description,
    approach: [],
    dependencies: [],
  },
});

describe('WorkerReviewerOrchestrator', () => {
  let mockRegistry: PlatformRegistry;
  let mockProgressManager: ProgressManager;
  let mockRunner: ReturnType<typeof createMockRunner>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRegistry = new PlatformRegistry();
    mockRunner = createMockRunner();
    mockRegistry.register('claude', mockRunner as unknown as Parameters<typeof mockRegistry.register>[1]);
    mockProgressManager = createMockProgressManager();
  });

  describe('shouldUseWorkerReviewer', () => {
    it('returns true when reviewer config is present and enabled', () => {
      const config = createMockConfig(true);
      expect(shouldUseWorkerReviewer(config)).toBe(true);
    });

    it('returns false when reviewer config is absent', () => {
      const config = createMockConfig(false);
      expect(shouldUseWorkerReviewer(config)).toBe(false);
    });

    it('returns false when reviewer is explicitly disabled', () => {
      const config = createMockConfig(true);
      config.tiers.reviewer!.enabled = false;
      expect(shouldUseWorkerReviewer(config)).toBe(false);
    });
  });

  describe('createWorkerReviewerOrchestrator', () => {
    it('creates orchestrator when config is present', () => {
      const config = createMockConfig(true);
      const orchestrator = createWorkerReviewerOrchestrator(
        config,
        mockRegistry,
        mockProgressManager
      );
      expect(orchestrator).not.toBeNull();
      expect(orchestrator).toBeInstanceOf(WorkerReviewerOrchestrator);
    });

    it('returns null when config is absent', () => {
      const config = createMockConfig(false);
      const orchestrator = createWorkerReviewerOrchestrator(
        config,
        mockRegistry,
        mockProgressManager
      );
      expect(orchestrator).toBeNull();
    });
  });

  describe('isEnabled', () => {
    it('returns true when enabled is not explicitly false', () => {
      const config = createMockConfig(true);
      const orchestrator = createWorkerReviewerOrchestrator(
        config,
        mockRegistry,
        mockProgressManager
      )!;
      expect(orchestrator.isEnabled()).toBe(true);
    });
  });

  describe('runReviewerPhase', () => {
    it('returns continue when worker did not claim done', async () => {
      const config = createMockConfig(true);
      const orchestrator = createWorkerReviewerOrchestrator(
        config,
        mockRegistry,
        mockProgressManager
      )!;

      const subtask = createMockTierNode('ST-001', 'subtask');
      const context = createMockIterationContext(subtask);

      const workerResult: WorkerResult = {
        claimsDone: false,
        output: 'Still working...',
        filesChanged: [],
        processId: 1234,
        duration: 5000,
      };

      const outcome = await orchestrator.runReviewerPhase(workerResult, context);

      expect(outcome.status).toBe('continue');
      expect(outcome.workerResult).toBe(workerResult);
      expect(outcome.reviewerResult).toBeUndefined();
    });

    it('returns failed when worker has error', async () => {
      const config = createMockConfig(true);
      const orchestrator = createWorkerReviewerOrchestrator(
        config,
        mockRegistry,
        mockProgressManager
      )!;

      const subtask = createMockTierNode('ST-001', 'subtask');
      const context = createMockIterationContext(subtask);

      const workerResult: WorkerResult = {
        claimsDone: true,
        output: 'Error occurred',
        filesChanged: [],
        processId: 1234,
        duration: 5000,
        error: 'Something went wrong',
      };

      const outcome = await orchestrator.runReviewerPhase(workerResult, context);

      expect(outcome.status).toBe('failed');
      expect(outcome.workerResult).toBe(workerResult);
    });

    it('returns complete when reviewer says SHIP with high confidence', async () => {
      const config = createMockConfig(true);
      const orchestrator = createWorkerReviewerOrchestrator(
        config,
        mockRegistry,
        mockProgressManager
      )!;

      const subtask = createMockTierNode('ST-001', 'subtask');
      const context = createMockIterationContext(subtask);

      const workerResult: WorkerResult = {
        claimsDone: true,
        output: 'Task completed successfully',
        filesChanged: ['src/test.ts'],
        processId: 1234,
        duration: 5000,
        completionSignal: 'COMPLETE',
      };

      const outcome = await orchestrator.runReviewerPhase(workerResult, context);

      expect(outcome.status).toBe('complete');
      expect(outcome.workerResult).toBe(workerResult);
      expect(outcome.reviewerResult).toBeDefined();
      expect(outcome.reviewerResult!.verdict).toBe('SHIP');
      expect(outcome.reviewerResult!.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('returns revise when reviewer says REVISE', async () => {
      // Mock runner to return REVISE verdict
      mockRunner.captureStdout.mockImplementation(async function* () {
        yield '```json\n{"verdict": "REVISE", "confidence": 0.8, "feedback": "Tests missing", "failedCriteria": ["AC-001"]}\n```\n';
        yield '<ralph>COMPLETE</ralph>';
      });

      const config = createMockConfig(true);
      const orchestrator = createWorkerReviewerOrchestrator(
        config,
        mockRegistry,
        mockProgressManager
      )!;

      const subtask = createMockTierNode('ST-001', 'subtask');
      const context = createMockIterationContext(subtask);

      const workerResult: WorkerResult = {
        claimsDone: true,
        output: 'Task completed',
        filesChanged: ['src/test.ts'],
        processId: 1234,
        duration: 5000,
        completionSignal: 'COMPLETE',
      };

      const outcome = await orchestrator.runReviewerPhase(workerResult, context);

      expect(outcome.status).toBe('revise');
      expect(outcome.reviewerResult).toBeDefined();
      expect(outcome.reviewerResult!.verdict).toBe('REVISE');
      expect(outcome.reviewerResult!.feedback).toBe('Tests missing');
      expect(outcome.reviewerResult!.failedCriteria).toContain('AC-001');
      expect(outcome.combinedFeedback).toBeDefined();
    });

    it('treats low confidence SHIP as REVISE', async () => {
      // Mock runner to return SHIP with low confidence
      mockRunner.captureStdout.mockImplementation(async function* () {
        yield '```json\n{"verdict": "SHIP", "confidence": 0.5, "reason": "Unsure"}\n```\n';
        yield '<ralph>COMPLETE</ralph>';
      });

      const config = createMockConfig(true);
      const orchestrator = createWorkerReviewerOrchestrator(
        config,
        mockRegistry,
        mockProgressManager
      )!;

      const subtask = createMockTierNode('ST-001', 'subtask');
      const context = createMockIterationContext(subtask);

      const workerResult: WorkerResult = {
        claimsDone: true,
        output: 'Task completed',
        filesChanged: ['src/test.ts'],
        processId: 1234,
        duration: 5000,
        completionSignal: 'COMPLETE',
      };

      const outcome = await orchestrator.runReviewerPhase(workerResult, context);

      // Low confidence SHIP (0.5 < 0.7 threshold) should be treated as REVISE
      expect(outcome.status).toBe('revise');
    });
  });

  describe('toWorkerResult', () => {
    it('converts IterationResult to WorkerResult correctly', () => {
      const iterationResult: IterationResult = {
        success: true,
        output: 'Test output',
        processId: 1234,
        duration: 5000,
        exitCode: 0,
        completionSignal: 'COMPLETE',
        learnings: ['learned something'],
        filesChanged: ['src/test.ts'],
      };

      const workerResult = WorkerReviewerOrchestrator.toWorkerResult(iterationResult);

      expect(workerResult.claimsDone).toBe(true);
      expect(workerResult.output).toBe('Test output');
      expect(workerResult.filesChanged).toEqual(['src/test.ts']);
      expect(workerResult.processId).toBe(1234);
      expect(workerResult.duration).toBe(5000);
      expect(workerResult.completionSignal).toBe('COMPLETE');
    });

    it('sets claimsDone to false when not successful', () => {
      const iterationResult: IterationResult = {
        success: false,
        output: 'Test output',
        processId: 1234,
        duration: 5000,
        exitCode: 1,
        learnings: [],
        filesChanged: [],
        error: 'Failed',
      };

      const workerResult = WorkerReviewerOrchestrator.toWorkerResult(iterationResult);

      expect(workerResult.claimsDone).toBe(false);
      expect(workerResult.error).toBe('Failed');
    });

    it('sets claimsDone to false when completionSignal is not COMPLETE', () => {
      const iterationResult: IterationResult = {
        success: true,
        output: 'Test output',
        processId: 1234,
        duration: 5000,
        exitCode: 0,
        completionSignal: 'GUTTER',
        learnings: [],
        filesChanged: [],
      };

      const workerResult = WorkerReviewerOrchestrator.toWorkerResult(iterationResult);

      expect(workerResult.claimsDone).toBe(false);
      expect(workerResult.completionSignal).toBe('GUTTER');
    });
  });
});

describe('Reviewer output parsing', () => {
  let mockRegistry: PlatformRegistry;
  let mockProgressManager: ProgressManager;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRegistry = new PlatformRegistry();
    mockProgressManager = createMockProgressManager();
  });

  it('parses valid JSON verdict correctly', async () => {
    const mockRunner = createMockRunner();
    mockRunner.captureStdout.mockImplementation(async function* () {
      yield '```json\n{"verdict": "SHIP", "confidence": 0.95, "reason": "All tests pass"}\n```';
    });
    mockRegistry.register('claude', mockRunner as unknown as Parameters<typeof mockRegistry.register>[1]);

    const config = createMockConfig(true);
    const orchestrator = createWorkerReviewerOrchestrator(
      config,
      mockRegistry,
      mockProgressManager
    )!;

    const subtask = createMockTierNode('ST-001', 'subtask');
    const context = createMockIterationContext(subtask);

    const workerResult: WorkerResult = {
      claimsDone: true,
      output: 'Done',
      filesChanged: ['src/test.ts'],
      processId: 1234,
      duration: 5000,
      completionSignal: 'COMPLETE',
    };

    const outcome = await orchestrator.runReviewerPhase(workerResult, context);

    expect(outcome.reviewerResult?.verdict).toBe('SHIP');
    expect(outcome.reviewerResult?.confidence).toBe(0.95);
  });

  it('falls back to heuristics when JSON is invalid', async () => {
    const mockRunner = createMockRunner();
    mockRunner.captureStdout.mockImplementation(async function* () {
      yield 'After reviewing, I think we should SHIP this code.';
    });
    mockRegistry.register('claude', mockRunner as unknown as Parameters<typeof mockRegistry.register>[1]);

    const config = createMockConfig(true);
    const orchestrator = createWorkerReviewerOrchestrator(
      config,
      mockRegistry,
      mockProgressManager
    )!;

    const subtask = createMockTierNode('ST-001', 'subtask');
    const context = createMockIterationContext(subtask);

    const workerResult: WorkerResult = {
      claimsDone: true,
      output: 'Done',
      filesChanged: ['src/test.ts'],
      processId: 1234,
      duration: 5000,
      completionSignal: 'COMPLETE',
    };

    const outcome = await orchestrator.runReviewerPhase(workerResult, context);

    // Heuristic parsing should detect SHIP
    expect(outcome.reviewerResult?.verdict).toBe('SHIP');
    // But with low confidence due to heuristic
    expect(outcome.reviewerResult?.confidence).toBe(0.5);
  });

  it('defaults to REVISE when no clear verdict', async () => {
    const mockRunner = createMockRunner();
    mockRunner.captureStdout.mockImplementation(async function* () {
      yield 'I am not sure about this code.';
    });
    mockRegistry.register('claude', mockRunner as unknown as Parameters<typeof mockRegistry.register>[1]);

    const config = createMockConfig(true);
    const orchestrator = createWorkerReviewerOrchestrator(
      config,
      mockRegistry,
      mockProgressManager
    )!;

    const subtask = createMockTierNode('ST-001', 'subtask');
    const context = createMockIterationContext(subtask);

    const workerResult: WorkerResult = {
      claimsDone: true,
      output: 'Done',
      filesChanged: ['src/test.ts'],
      processId: 1234,
      duration: 5000,
      completionSignal: 'COMPLETE',
    };

    const outcome = await orchestrator.runReviewerPhase(workerResult, context);

    // Should default to REVISE for safety
    expect(outcome.reviewerResult?.verdict).toBe('REVISE');
  });
});
