/**
 * Tests for Orchestrator
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Orchestrator } from './orchestrator.js';
import type {
  OrchestratorConfig,
  OrchestratorDependencies,
} from './orchestrator.js';
import type { PuppetMasterConfig } from '../types/config.js';
import type { TierNode } from './tier-node.js';
import type { IterationResult } from './execution-engine.js';
import type { AdvancementResult } from './auto-advancement.js';
import type { GateResult } from '../types/tiers.js';
import type { OrchestratorStateMachine } from './orchestrator-state-machine.js';
import type { TierStateManager } from './tier-state-manager.js';
import type { AutoAdvancement } from './auto-advancement.js';

/**
 * Test helper interface to access private methods and properties of Orchestrator
 */
interface OrchestratorForTesting {
  stateMachine: OrchestratorStateMachine;
  tierStateManager: TierStateManager;
  autoAdvancement: AutoAdvancement;
  handleIterationResult: (result: IterationResult, tier: TierNode) => Promise<void>;
  handleGateResult: (result: GateResult, tier: TierNode) => Promise<void>;
  handleAdvancement: (result: AdvancementResult) => Promise<void>;
  recordProgress: (result: IterationResult, tier: TierNode) => Promise<void>;
  commitChanges: (result: IterationResult, tier: TierNode) => Promise<void>;
}

describe('Orchestrator', () => {
  let mockConfig: PuppetMasterConfig;
  let mockDeps: OrchestratorDependencies;
  let orchestrator: Orchestrator;

  beforeEach(() => {
    mockConfig = {
      project: {
        name: 'test-project',
        workingDirectory: '/test/project',
      },
      cliPaths: {
        cursor: 'cursor',
        codex: 'codex',
        claude: 'claude',
      },
      logging: {
        level: 'info',
        retentionDays: 7,
      },
      tiers: {
        phase: {
          platform: 'cursor',
          model: 'default',
          selfFix: true,
          maxIterations: 10,
          escalation: null,
        },
        task: {
          platform: 'cursor',
          model: 'default',
          selfFix: true,
          maxIterations: 10,
          escalation: null,
        },
        subtask: {
          platform: 'cursor',
          model: 'default',
          selfFix: true,
          maxIterations: 10,
          escalation: null,
        },
        iteration: {
          platform: 'cursor',
          model: 'default',
          selfFix: true,
          maxIterations: 10,
          escalation: null,
        },
      },
      branching: {
        baseBranch: 'main',
        namingPattern: 'ralph/{id}',
        granularity: 'single',
        pushPolicy: 'per-iteration',
        mergePolicy: 'merge',
        autoPr: false,
      },
      verification: {
        browserAdapter: 'playwright',
        screenshotOnFailure: true,
        evidenceDirectory: '.puppet-master/evidence',
      },
      memory: {
        progressFile: 'progress.txt',
        agentsFile: 'AGENTS.md',
        prdFile: '.puppet-master/prd.json',
        multiLevelAgents: false,
        agentsEnforcement: {
          requireUpdateOnFailure: false,
          requireUpdateOnGotcha: false,
          gateFailsOnMissingUpdate: false,
          reviewerMustAcknowledge: false,
        },
      },
      budgets: {
        cursor: {
          maxCallsPerRun: 100,
          maxCallsPerHour: 50,
          maxCallsPerDay: 200,
          fallbackPlatform: null,
        },
        codex: {
          maxCallsPerRun: 100,
          maxCallsPerHour: 50,
          maxCallsPerDay: 200,
          fallbackPlatform: null,
        },
        claude: {
          maxCallsPerRun: 100,
          maxCallsPerHour: 50,
          maxCallsPerDay: 200,
          fallbackPlatform: null,
        },
      },
      budgetEnforcement: {
        onLimitReached: 'pause',
        warnAtPercentage: 80,
        notifyOnFallback: false,
      },
    };

    mockDeps = {
      configManager: {
        load: vi.fn().mockResolvedValue(mockConfig),
        getConfigPath: vi.fn().mockReturnValue('.puppet-master/config.yaml'),
      } as unknown as OrchestratorDependencies['configManager'],
      prdManager: {
        load: vi.fn().mockResolvedValue({
          phases: [],
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: '1.0.0',
          },
        }),
        save: vi.fn().mockResolvedValue(undefined),
      } as unknown as OrchestratorDependencies['prdManager'],
      progressManager: {
        getLatest: vi.fn().mockResolvedValue([]),
        append: vi.fn().mockResolvedValue(undefined),
        generateSessionId: vi.fn().mockReturnValue('PM-2026-01-11-12-00-00-001'),
      } as unknown as OrchestratorDependencies['progressManager'],
      agentsManager: {
        loadForContext: vi.fn().mockResolvedValue([]),
      } as unknown as OrchestratorDependencies['agentsManager'],
      evidenceStore: {
        save: vi.fn().mockResolvedValue(undefined),
      } as unknown as OrchestratorDependencies['evidenceStore'],
      usageTracker: {
        record: vi.fn().mockResolvedValue(undefined),
      } as unknown as OrchestratorDependencies['usageTracker'],
      gitManager: {
        getStatus: vi.fn().mockResolvedValue({
          branch: 'main',
          staged: [],
          modified: [],
          untracked: [],
          ahead: 0,
          behind: 0,
        }),
        add: vi.fn().mockResolvedValue({ success: true, stdout: '', stderr: '', exitCode: 0 }),
        commit: vi.fn().mockResolvedValue({ success: true, stdout: '', stderr: '', exitCode: 0 }),
      } as unknown as OrchestratorDependencies['gitManager'],
      platformRunner: {
        platform: 'cursor',
        sessionReuseAllowed: false,
        allowedContextFiles: [],
        defaultTimeout: 300000,
        hardTimeout: 600000,
        spawnFreshProcess: vi.fn(),
        prepareWorkingDirectory: vi.fn().mockResolvedValue(undefined),
        cleanupAfterExecution: vi.fn().mockResolvedValue(undefined),
        terminateProcess: vi.fn().mockResolvedValue(undefined),
        forceKillProcess: vi.fn().mockResolvedValue(undefined),
        captureStdout: vi.fn(),
        captureStderr: vi.fn(),
        getTranscript: vi.fn().mockResolvedValue(''),
      } as unknown as OrchestratorDependencies['platformRunner'],
      verificationIntegration: {
        runTaskGate: vi.fn(),
        runPhaseGate: vi.fn(),
        runSubtaskVerification: vi.fn(),
        handleGateResult: vi.fn(),
      } as unknown as OrchestratorDependencies['verificationIntegration'],
    };

    const orchestratorConfig: OrchestratorConfig = {
      config: mockConfig,
      projectPath: '/test/project',
    };

    orchestrator = new Orchestrator(orchestratorConfig);
  });

  describe('constructor', () => {
    it('creates orchestrator with correct initial state', () => {
      expect(orchestrator.getState()).toBe('idle');
    });
  });

  describe('initialize', () => {
    it('initializes all components', async () => {
      await orchestrator.initialize(mockDeps);

      expect(mockDeps.prdManager.load).toHaveBeenCalled();
      expect(orchestrator.getState()).toBe('planning');
    });
  });

  describe('start', () => {
    beforeEach(async () => {
      await orchestrator.initialize(mockDeps);
    });

    it('transitions to executing state and begins loop', async () => {
      // Mock tier state manager to return no subtasks (loop will exit quickly)
      const mockTierStateManager = {
        getCurrentSubtask: vi.fn().mockReturnValue(null),
        getCurrentPhase: vi.fn().mockReturnValue(null),
        getCurrentTask: vi.fn().mockReturnValue(null),
        getAllSubtasks: vi.fn().mockReturnValue([]),
        syncToPrd: vi.fn().mockResolvedValue(undefined),
      };

      (orchestrator as unknown as OrchestratorForTesting).tierStateManager = mockTierStateManager as unknown as TierStateManager;
      (orchestrator as unknown as OrchestratorForTesting).autoAdvancement = {
        checkAndAdvance: vi.fn().mockResolvedValue({
          action: 'complete',
          message: 'All complete',
        } as AdvancementResult),
      } as unknown as AutoAdvancement;

      await orchestrator.start();

      expect(orchestrator.getState()).toBe('complete');
    });

    it('throws error if not in planning state', async () => {
      // Create a new orchestrator without initializing to test error case
      const newOrchestrator = new Orchestrator({
        config: mockConfig,
        projectPath: '/test/project',
      });
      // State is 'idle' without initialization, so start() should throw
      await expect(newOrchestrator.start()).rejects.toThrow('Cannot start from state: idle');
    });
  });

  describe('pause', () => {
    beforeEach(async () => {
      await orchestrator.initialize(mockDeps);
      orchestrator.getState(); // Access state to ensure initialized
    });

    it('transitions to paused state', async () => {
      // First transition to executing
      (orchestrator as unknown as OrchestratorForTesting).stateMachine.send({ type: 'START' });

      await orchestrator.pause('test reason');

      expect(orchestrator.getState()).toBe('paused');
    });

    it('throws error if not in executing state', async () => {
      await expect(orchestrator.pause()).rejects.toThrow('Cannot pause from state:');
    });
  });

  describe('resume', () => {
    beforeEach(async () => {
      await orchestrator.initialize(mockDeps);
    });

    it('transitions from paused to executing', async () => {
      // First transition to executing, then pause
      (orchestrator as unknown as OrchestratorForTesting).stateMachine.send({ type: 'START' });
      (orchestrator as unknown as OrchestratorForTesting).stateMachine.send({ type: 'PAUSE' });

      const mockTierStateManager = {
        getCurrentSubtask: vi.fn().mockReturnValue(null),
        getCurrentPhase: vi.fn().mockReturnValue(null),
        getCurrentTask: vi.fn().mockReturnValue(null),
        getAllSubtasks: vi.fn().mockReturnValue([]),
        syncToPrd: vi.fn().mockResolvedValue(undefined),
      };

      (orchestrator as unknown as OrchestratorForTesting).tierStateManager = mockTierStateManager as unknown as TierStateManager;
      (orchestrator as unknown as OrchestratorForTesting).autoAdvancement = {
        checkAndAdvance: vi.fn().mockResolvedValue({
          action: 'complete',
          message: 'All complete',
        } as AdvancementResult),
      } as unknown as AutoAdvancement;

      await orchestrator.resume();

      expect(orchestrator.getState()).toBe('complete');
    });

    it('throws error if not in paused state', async () => {
      await expect(orchestrator.resume()).rejects.toThrow('Cannot resume from state:');
    });
  });

  describe('stop', () => {
    beforeEach(async () => {
      await orchestrator.initialize(mockDeps);
    });

    it('transitions to idle state and syncs PRD', async () => {
      await orchestrator.stop();

      expect(orchestrator.getState()).toBe('idle');
      expect(mockDeps.prdManager.save).toHaveBeenCalled();
    });
  });

  describe('getState', () => {
    it('returns current orchestrator state', () => {
      expect(orchestrator.getState()).toBe('idle');
    });
  });

  describe('getProgress', () => {
    beforeEach(async () => {
      await orchestrator.initialize(mockDeps);
    });

    it('returns progress information', () => {
      const progress = orchestrator.getProgress();

      expect(progress).toHaveProperty('state');
      expect(progress).toHaveProperty('currentPhase');
      expect(progress).toHaveProperty('currentTask');
      expect(progress).toHaveProperty('currentSubtask');
      expect(progress).toHaveProperty('completedSubtasks');
      expect(progress).toHaveProperty('totalSubtasks');
      expect(progress).toHaveProperty('iterationsRun');
      expect(progress).toHaveProperty('startedAt');
      expect(progress).toHaveProperty('elapsedTime');
    });
  });

  describe('handleIterationResult', () => {
    beforeEach(async () => {
      await orchestrator.initialize(mockDeps);
    });

    it('handles successful iteration result', async () => {
      const mockSubtask = {
        id: 'ST-001-001-001',
        data: {
          iterations: 0,
          title: 'Test Subtask',
        },
        stateMachine: {
          send: vi.fn(),
        },
        getState: vi.fn().mockReturnValue('running'),
      } as unknown as TierNode;

      const result: IterationResult = {
        success: true,
        output: '<ralph>COMPLETE</ralph>',
        processId: 12345,
        duration: 5000,
        exitCode: 0,
        completionSignal: 'COMPLETE',
        learnings: ['Learned something'],
        filesChanged: ['src/test.ts'],
      };

      await (orchestrator as unknown as OrchestratorForTesting).handleIterationResult(result, mockSubtask);

      expect(mockSubtask.stateMachine.send).toHaveBeenCalled();
    });

    it('handles failed iteration result', async () => {
      const mockSubtask = {
        id: 'ST-001-001-001',
        data: {
          iterations: 0,
          title: 'Test Subtask',
        },
        stateMachine: {
          send: vi.fn(),
        },
        getState: vi.fn().mockReturnValue('running'),
      } as unknown as TierNode;

      const result: IterationResult = {
        success: false,
        output: 'Error occurred',
        processId: 12345,
        duration: 5000,
        exitCode: 1,
        error: 'Test error',
        learnings: [],
        filesChanged: [],
      };

      await (orchestrator as unknown as OrchestratorForTesting).handleIterationResult(result, mockSubtask);

      expect(mockSubtask.stateMachine.send).toHaveBeenCalledWith({
        type: 'ITERATION_FAILED',
        error: expect.any(String),
      });
    });
  });

  describe('handleGateResult', () => {
    beforeEach(async () => {
      await orchestrator.initialize(mockDeps);
    });

    it('handles passed gate result', async () => {
      const mockTier = {
        stateMachine: {
          send: vi.fn(),
        },
      } as unknown as TierNode;

      const result: GateResult = {
        passed: true,
        report: {
          gateId: 'test-gate',
          timestamp: new Date().toISOString(),
          overallPassed: true,
          verifiersRun: [],
          summary: 'Gate passed',
        },
      };

      await (orchestrator as unknown as OrchestratorForTesting).handleGateResult(result, mockTier);

      expect(mockTier.stateMachine.send).toHaveBeenCalledWith({ type: 'GATE_PASSED' });
    });

    it('handles failed gate result (minor)', async () => {
      const mockTier = {
        stateMachine: {
          send: vi.fn(),
        },
      } as unknown as TierNode;

      const result: GateResult = {
        passed: false,
        report: {
          gateId: 'test-gate',
          timestamp: new Date().toISOString(),
          overallPassed: false,
          verifiersRun: [],
          summary: 'Gate failed',
        },
        failureReason: 'Test failure',
      };

      await (orchestrator as unknown as OrchestratorForTesting).handleGateResult(result, mockTier);

      expect(mockTier.stateMachine.send).toHaveBeenCalledWith({
        type: expect.stringMatching(/GATE_FAILED/),
      });
    });
  });

  describe('handleAdvancement', () => {
    beforeEach(async () => {
      await orchestrator.initialize(mockDeps);
    });

    it('handles continue action', async () => {
      const mockTier = {
        id: 'ST-001-001-001',
        type: 'subtask',
      } as TierNode;

      const result: AdvancementResult = {
        action: 'continue',
        next: mockTier,
        message: 'Continue with next subtask',
      };

      const mockTierStateManager = {
        setCurrentSubtask: vi.fn(),
        syncToPrd: vi.fn().mockResolvedValue(undefined),
      };

      (orchestrator as unknown as OrchestratorForTesting).tierStateManager = mockTierStateManager as unknown as TierStateManager;

      await (orchestrator as unknown as OrchestratorForTesting).handleAdvancement(result);

      expect(mockTierStateManager.setCurrentSubtask).toHaveBeenCalledWith('ST-001-001-001');
    });

    it('handles complete action', async () => {
      // Transition to executing state first (COMPLETE only works from executing)
      (orchestrator as unknown as OrchestratorForTesting).stateMachine.send({ type: 'START' });
      expect(orchestrator.getState()).toBe('executing');

      const result: AdvancementResult = {
        action: 'complete',
        message: 'All complete',
      };

      await (orchestrator as unknown as OrchestratorForTesting).handleAdvancement(result);

      expect(orchestrator.getState()).toBe('complete');
    });
  });

  describe('recordProgress', () => {
    beforeEach(async () => {
      await orchestrator.initialize(mockDeps);
    });

    it('records progress entry', async () => {
      const mockSubtask = {
        id: 'ST-001-001-001',
        data: {
          title: 'Test Subtask',
        },
      } as TierNode;

      const result: IterationResult = {
        success: true,
        output: 'Success',
        processId: 12345,
        duration: 5000,
        exitCode: 0,
        learnings: ['Learned something'],
        filesChanged: ['src/test.ts'],
      };

      await (orchestrator as unknown as OrchestratorForTesting).recordProgress(result, mockSubtask);

      expect(mockDeps.progressManager.append).toHaveBeenCalled();
    });
  });

  describe('commitChanges', () => {
    beforeEach(async () => {
      await orchestrator.initialize(mockDeps);
    });

    it('commits changes when files are changed', async () => {
      const mockSubtask = {
        id: 'ST-001-001-001',
        data: {
          title: 'Test Subtask',
        },
      } as TierNode;

      const result: IterationResult = {
        success: true,
        output: 'Success',
        processId: 12345,
        duration: 5000,
        exitCode: 0,
        learnings: [],
        filesChanged: ['src/test.ts'],
      };

      vi.mocked(mockDeps.gitManager.getStatus).mockResolvedValue({
        branch: 'main',
        staged: [],
        modified: ['src/test.ts'],
        untracked: [],
        ahead: 0,
        behind: 0,
      });

      await (orchestrator as unknown as OrchestratorForTesting).commitChanges(result, mockSubtask);

      expect(mockDeps.gitManager.add).toHaveBeenCalled();
      expect(mockDeps.gitManager.commit).toHaveBeenCalled();
    });

    it('skips commit when no files changed', async () => {
      const mockSubtask = {
        id: 'ST-001-001-001',
        data: {
          title: 'Test Subtask',
        },
      } as TierNode;

      const result: IterationResult = {
        success: true,
        output: 'Success',
        processId: 12345,
        duration: 5000,
        exitCode: 0,
        learnings: [],
        filesChanged: [],
      };

      await (orchestrator as unknown as OrchestratorForTesting).commitChanges(result, mockSubtask);

      expect(mockDeps.gitManager.add).not.toHaveBeenCalled();
      expect(mockDeps.gitManager.commit).not.toHaveBeenCalled();
    });
  });
});
