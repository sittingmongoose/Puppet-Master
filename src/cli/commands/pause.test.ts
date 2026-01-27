/**
 * Tests for pause command
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { PauseCommand, pauseAction } from './pause.js';
import type { PuppetMasterConfig } from '../../types/config.js';
import type { PRD } from '../../types/prd.js';

// Mock dependencies
vi.mock('../../config/config-manager.js', () => ({
  ConfigManager: vi.fn(),
}));

vi.mock('../../memory/prd-manager.js', () => ({
  PrdManager: vi.fn(),
}));

vi.mock('../../core/state-persistence.js', () => ({
  StatePersistence: vi.fn(),
}));

import { ConfigManager } from '../../config/config-manager.js';
import { PrdManager } from '../../memory/prd-manager.js';
import { StatePersistence } from '../../core/state-persistence.js';

describe('PauseCommand', () => {
  let command: PauseCommand;
  let mockProgram: Command;

  beforeEach(() => {
    command = new PauseCommand();
    mockProgram = new Command();
    vi.clearAllMocks();
  });

  describe('CommandModule implementation', () => {
    it('should implement CommandModule interface', () => {
      expect(command).toBeDefined();
      expect(typeof command.register).toBe('function');
    });

    it('should register pause command with program', () => {
      const registerSpy = vi.spyOn(mockProgram, 'command');
      command.register(mockProgram);

      expect(registerSpy).toHaveBeenCalledWith('pause');
    });

    it('should set correct description', () => {
      const descriptionSpy = vi.spyOn(Command.prototype, 'description');
      command.register(mockProgram);

      expect(descriptionSpy).toHaveBeenCalledWith('Pause orchestration execution');
    });

    it('should register all expected options', () => {
      const optionSpy = vi.spyOn(Command.prototype, 'option');
      command.register(mockProgram);

      const optionCalls = optionSpy.mock.calls.map(call => call[0]);
      expect(optionCalls).toContain('-c, --config <path>');
      expect(optionCalls).toContain('-r, --reason <text>');
      expect(optionCalls).toContain('-f, --force');
    });
  });
});

describe('pauseAction', () => {
  let mockConfig: PuppetMasterConfig;
  let mockConfigManager: {
    load: ReturnType<typeof vi.fn>;
  };
  let mockPrdManager: {
    load: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let mockStatePersistence: {
    createCheckpoint: ReturnType<typeof vi.fn>;
  };

  /**
   * Helper to create a sample PRD
   */
  function createSamplePRD(): PRD {
    const now = new Date().toISOString();
    return {
      project: 'TestProject',
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      branchName: 'main',
      description: 'Test PRD',
      phases: [],
      metadata: {
        totalPhases: 0,
        completedPhases: 0,
        totalTasks: 0,
        completedTasks: 0,
        totalSubtasks: 0,
        completedSubtasks: 0,
      },
    };
  }

  /**
   * Helper to create a PRD with orchestrator state
   */
  function createPRDWithState(orchestratorState: 'executing' | 'paused' | 'idle' | 'planning' | 'complete' | 'error'): PRD {
    const prd = createSamplePRD();
    prd.orchestratorState = orchestratorState;
    prd.orchestratorContext = {
      state: orchestratorState,
      currentPhaseId: null,
      currentTaskId: null,
      currentSubtaskId: null,
      currentIterationId: null,
    };
    return prd;
  }

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
        gemini: 'gemini',
        copilot: 'copilot',
      },
      logging: {
        level: 'info',
        retentionDays: 7,
      },
      tiers: {
        phase: {
          platform: 'cursor',
          model: 'default',
          taskFailureStyle: 'spawn_new_agent',
          maxIterations: 10,
          escalation: null,
        },
        task: {
          platform: 'cursor',
          model: 'default',
          taskFailureStyle: 'spawn_new_agent',
          maxIterations: 10,
          escalation: null,
        },
        subtask: {
          platform: 'cursor',
          model: 'default',
          taskFailureStyle: 'spawn_new_agent',
          maxIterations: 10,
          escalation: null,
        },
        iteration: {
          platform: 'cursor',
          model: 'default',
          taskFailureStyle: 'spawn_new_agent',
          maxIterations: 10,
          escalation: null,
        },
      },
      branching: {
        baseBranch: 'main',
        namingPattern: 'ralph/{tier}-{id}',
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
        progressFile: '.puppet-master/progress.txt',
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
        claude: {
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
        cursor: {
          maxCallsPerRun: 100,
          maxCallsPerHour: 50,
          maxCallsPerDay: 200,
          fallbackPlatform: null,
        },
        gemini: {
          maxCallsPerRun: 100,
          maxCallsPerHour: 50,
          maxCallsPerDay: 200,
          fallbackPlatform: null,
        },
        copilot: {
          maxCallsPerRun: 100,
          maxCallsPerHour: 50,
          maxCallsPerDay: 200,
          fallbackPlatform: null,
        },
      },
      budgetEnforcement: {
        onLimitReached: 'fallback',
        warnAtPercentage: 80,
        notifyOnFallback: false,
      },
    };

    mockConfigManager = {
      load: vi.fn().mockResolvedValue(mockConfig),
    };

    mockPrdManager = {
      load: vi.fn().mockResolvedValue(createPRDWithState('executing')),
      save: vi.fn().mockResolvedValue(undefined),
    };

    mockStatePersistence = {
      createCheckpoint: vi.fn().mockResolvedValue(undefined),
    };

    (ConfigManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockConfigManager);
    (PrdManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockPrdManager);
    (StatePersistence as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockStatePersistence);

    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('config loading', () => {
    it('should load config using ConfigManager', async () => {
      await pauseAction({});

      expect(ConfigManager).toHaveBeenCalled();
      expect(mockConfigManager.load).toHaveBeenCalled();
    });

    it('should use provided config path', async () => {
      await pauseAction({ config: '/custom/config.yaml' });

      expect(ConfigManager).toHaveBeenCalledWith('/custom/config.yaml');
    });
  });

  describe('PRD loading', () => {
    it('should load PRD using PrdManager', async () => {
      await pauseAction({});

      expect(PrdManager).toHaveBeenCalledWith(mockConfig.memory.prdFile);
      expect(mockPrdManager.load).toHaveBeenCalled();
    });
  });

  describe('state validation', () => {
    it('should error when orchestrator is not running', async () => {
      const prd = createSamplePRD();
      delete prd.orchestratorState;
      mockPrdManager.load.mockResolvedValue(prd);

      await pauseAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Orchestrator is not running')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should error when orchestrator is already paused', async () => {
      const prd = createPRDWithState('paused');
      mockPrdManager.load.mockResolvedValue(prd);

      await pauseAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Orchestrator is already paused')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should error when orchestrator is in invalid state', async () => {
      const prd = createPRDWithState('idle');
      mockPrdManager.load.mockResolvedValue(prd);

      await pauseAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Cannot pause from state: idle')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should allow pause when orchestrator is executing', async () => {
      const prd = createPRDWithState('executing');
      mockPrdManager.load.mockResolvedValue(prd);

      await pauseAction({});

      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('Cannot pause')
      );
      expect(mockStatePersistence.createCheckpoint).toHaveBeenCalled();
    });
  });

  describe('checkpoint creation', () => {
    it('should create checkpoint when pausing', async () => {
      const prd = createPRDWithState('executing');
      mockPrdManager.load.mockResolvedValue(prd);

      await pauseAction({});

      expect(mockStatePersistence.createCheckpoint).toHaveBeenCalled();
      const checkpointName = (mockStatePersistence.createCheckpoint as ReturnType<typeof vi.fn>).mock.calls[0]![0];
      expect(checkpointName).toMatch(/^pause-/);
    });

    it('should include reason in checkpoint name when provided', async () => {
      const prd = createPRDWithState('executing');
      mockPrdManager.load.mockResolvedValue(prd);

      await pauseAction({ reason: 'test-reason' });

      expect(mockStatePersistence.createCheckpoint).toHaveBeenCalled();
      const checkpointName = (mockStatePersistence.createCheckpoint as ReturnType<typeof vi.fn>).mock.calls[0]![0];
      expect(checkpointName).toContain('pause-');
      expect(checkpointName).toContain('test-reason');
    });

    it('should error when checkpoint creation fails', async () => {
      const prd = createPRDWithState('executing');
      mockPrdManager.load.mockResolvedValue(prd);
      mockStatePersistence.createCheckpoint.mockRejectedValue(new Error('Checkpoint error'));

      await pauseAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create checkpoint: Checkpoint error')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should error when no orchestrator state exists in PRD', async () => {
      const prd = createSamplePRD();
      delete prd.orchestratorState;
      delete prd.orchestratorContext;
      mockPrdManager.load.mockResolvedValue(prd);

      // First check will fail, but we need to set state to executing for the second check
      prd.orchestratorState = 'executing';
      prd.orchestratorContext = undefined;

      await pauseAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('No orchestrator state found in PRD')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('PRD state update', () => {
    it('should update PRD state to paused', async () => {
      const prd = createPRDWithState('executing');
      mockPrdManager.load.mockResolvedValue(prd);

      await pauseAction({});

      expect(mockPrdManager.save).toHaveBeenCalled();
      const savedPRD = (mockPrdManager.save as ReturnType<typeof vi.fn>).mock.calls[0]![0] as PRD;
      expect(savedPRD.orchestratorState).toBe('paused');
    });

    it('should save pause reason in orchestrator context', async () => {
      const prd = createPRDWithState('executing');
      mockPrdManager.load.mockResolvedValue(prd);

      await pauseAction({ reason: 'User requested pause' });

      expect(mockPrdManager.save).toHaveBeenCalled();
      const savedPRD = (mockPrdManager.save as ReturnType<typeof vi.fn>).mock.calls[0]![0] as PRD;
      expect(savedPRD.orchestratorContext?.pauseReason).toBe('User requested pause');
    });

    it('should not set pause reason when not provided', async () => {
      const prd = createPRDWithState('executing');
      mockPrdManager.load.mockResolvedValue(prd);

      await pauseAction({});

      expect(mockPrdManager.save).toHaveBeenCalled();
      const savedPRD = (mockPrdManager.save as ReturnType<typeof vi.fn>).mock.calls[0]![0] as PRD;
      // pauseReason should be undefined if not provided
      expect(savedPRD.orchestratorContext?.pauseReason).toBeUndefined();
    });
  });

  describe('confirmation output', () => {
    it('should display success message', async () => {
      const prd = createPRDWithState('executing');
      mockPrdManager.load.mockResolvedValue(prd);

      await pauseAction({});

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Orchestration paused successfully')
      );
    });

    it('should display checkpoint name', async () => {
      const prd = createPRDWithState('executing');
      mockPrdManager.load.mockResolvedValue(prd);

      await pauseAction({});

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const checkpointLog = logCalls.find(call => call[0]?.toString().includes('Checkpoint:'));
      expect(checkpointLog).toBeDefined();
    });

    it('should display reason when provided', async () => {
      const prd = createPRDWithState('executing');
      mockPrdManager.load.mockResolvedValue(prd);

      await pauseAction({ reason: 'Maintenance window' });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Reason: Maintenance window')
      );
    });

    it('should not display reason when not provided', async () => {
      const prd = createPRDWithState('executing');
      mockPrdManager.load.mockResolvedValue(prd);

      await pauseAction({});

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const reasonLog = logCalls.find(call => call[0]?.toString().includes('Reason:'));
      expect(reasonLog).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should handle config loading errors', async () => {
      mockConfigManager.load.mockRejectedValue(new Error('Config error'));

      await pauseAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error pausing orchestration'),
        expect.stringContaining('Config error')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle PRD loading errors', async () => {
      mockPrdManager.load.mockRejectedValue(new Error('PRD error'));

      await pauseAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error pausing orchestration'),
        expect.stringContaining('PRD error')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle PRD save errors', async () => {
      const prd = createPRDWithState('executing');
      mockPrdManager.load.mockResolvedValue(prd);
      mockPrdManager.save.mockRejectedValue(new Error('Save error'));

      await pauseAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error pausing orchestration'),
        expect.stringContaining('Save error')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('force flag', () => {
    it('should accept force flag (no-op for now)', async () => {
      const prd = createPRDWithState('executing');
      mockPrdManager.load.mockResolvedValue(prd);

      await pauseAction({ force: true });

      // Force flag is accepted but doesn't change behavior yet
      expect(mockStatePersistence.createCheckpoint).toHaveBeenCalled();
    });
  });
});
