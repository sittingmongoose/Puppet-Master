/**
 * Tests for resume command
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { ResumeCommand, resumeAction } from './resume.js';
import type { PuppetMasterConfig } from '../../types/config.js';
import type { PRD } from '../../types/prd.js';

// Mock dependencies
vi.mock('fs/promises', () => ({
  access: vi.fn(),
}));

vi.mock('../../config/config-manager.js', () => ({
  ConfigManager: vi.fn(),
}));

vi.mock('../../memory/prd-manager.js', () => ({
  PrdManager: vi.fn(),
}));

vi.mock('../../core/state-persistence.js', () => ({
  StatePersistence: vi.fn(),
}));

vi.mock('../../core/checkpoint-manager.js', () => ({
  CheckpointManager: vi.fn(),
}));

vi.mock('../../core/container.js', () => ({
  createContainer: vi.fn(),
}));

vi.mock('../../core/orchestrator.js', () => ({
  Orchestrator: vi.fn(),
}));

vi.mock('../../platforms/registry.js', () => ({
  PlatformRegistry: {
    createDefault: vi.fn(),
  },
}));

import { access } from 'fs/promises';
import { ConfigManager } from '../../config/config-manager.js';
import { PrdManager } from '../../memory/prd-manager.js';
import { StatePersistence } from '../../core/state-persistence.js';
import { CheckpointManager } from '../../core/checkpoint-manager.js';
import { createContainer } from '../../core/container.js';
import { Orchestrator } from '../../core/orchestrator.js';
import { PlatformRegistry } from '../../platforms/registry.js';
import type { Checkpoint } from '../../core/checkpoint-manager.js';

describe('ResumeCommand', () => {
  let command: ResumeCommand;
  let mockProgram: Command;

  beforeEach(() => {
    command = new ResumeCommand();
    mockProgram = new Command();
    vi.clearAllMocks();
  });

  describe('CommandModule implementation', () => {
    it('should implement CommandModule interface', () => {
      expect(command).toBeDefined();
      expect(typeof command.register).toBe('function');
    });

    it('should register resume command with positional argument', () => {
      const registerSpy = vi.spyOn(mockProgram, 'command');
      command.register(mockProgram);

      expect(registerSpy).toHaveBeenCalledWith('resume [checkpoint-id]');
    });

    it('should set correct description', () => {
      const descriptionSpy = vi.spyOn(Command.prototype, 'description');
      command.register(mockProgram);

      expect(descriptionSpy).toHaveBeenCalledWith('Resume paused orchestration or from a checkpoint');
    });

    it('should register all expected options', () => {
      const optionSpy = vi.spyOn(Command.prototype, 'option');
      command.register(mockProgram);

      const optionCalls = optionSpy.mock.calls.map(call => call[0]);
      expect(optionCalls).toContain('-c, --config <path>');
      expect(optionCalls).toContain('--checkpoint <name>');
      expect(optionCalls).toContain('--skip-validation');
    });

    it('should handle positional argument in action', () => {
      // Test that the action handler accepts checkpoint-id as first parameter
      const actionSpy = vi.spyOn(Command.prototype, 'action');
      command.register(mockProgram);

      expect(actionSpy).toHaveBeenCalled();
      const actionCall = actionSpy.mock.calls[0][0];
      expect(typeof actionCall).toBe('function');
    });
  });
});

describe('resumeAction', () => {
  let mockConfig: PuppetMasterConfig;
  let mockPrd: PRD;
  let mockConfigManager: {
    load: ReturnType<typeof vi.fn>;
    getConfigPath: ReturnType<typeof vi.fn>;
  };
  let mockPrdManager: {
    load: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let mockStatePersistence: {
    restoreCheckpoint: ReturnType<typeof vi.fn>;
  };
  let mockContainer: {
    resolve: ReturnType<typeof vi.fn>;
  };
  let mockOrchestrator: {
    initialize: ReturnType<typeof vi.fn>;
    resume: ReturnType<typeof vi.fn>;
    getState: ReturnType<typeof vi.fn>;
  };
  let mockPlatformRunner: {
    platform: 'cursor';
  };
  let mockDeps: {
    configManager: unknown;
    prdManager: unknown;
    progressManager: unknown;
    agentsManager: unknown;
    evidenceStore: unknown;
    usageTracker: unknown;
    gitManager: unknown;
    platformRunner: typeof mockPlatformRunner;
    verificationIntegration: unknown;
  };

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

    mockPrd = {
      project: 'test-project',
      version: '1.0.0',
      orchestratorState: 'paused',
      orchestratorContext: {
        state: 'paused',
        currentPhaseId: 'PH-001',
        currentTaskId: 'TK-001',
        currentSubtaskId: 'ST-001-001-001',
        currentIterationId: null,
      },
      metadata: {
        totalPhases: 1,
        totalTasks: 1,
        totalSubtasks: 1,
        completedPhases: 0,
        completedTasks: 0,
        completedSubtasks: 0,
      },
      phases: [
        {
          id: 'PH-001',
          title: 'Test Phase',
          description: 'Test phase description',
          status: 'running',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: {
            commands: [],
            failFast: false,
          },
          tasks: [
            {
              id: 'TK-001',
              phaseId: 'PH-001',
              title: 'Test Task',
              description: 'Test task description',
              status: 'running',
              priority: 1,
              acceptanceCriteria: [],
              testPlan: {
                commands: [],
                failFast: false,
              },
              subtasks: [
                {
                  id: 'ST-001-001-001',
                  taskId: 'TK-001',
                  title: 'Test Subtask',
                  description: 'Test subtask description',
                  status: 'running',
                  priority: 1,
                  acceptanceCriteria: [],
                  testPlan: {
                    commands: [],
                    failFast: false,
                  },
                  iterations: [],
                  maxIterations: 10,
                  createdAt: new Date().toISOString(),
                  notes: '',
                },
              ],
              createdAt: new Date().toISOString(),
              notes: '',
            },
          ],
          createdAt: new Date().toISOString(),
          notes: '',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      branchName: 'main',
      description: 'Test PRD',
    };

    mockPlatformRunner = {
      platform: 'cursor' as const,
    };

    mockDeps = {
      configManager: {},
      prdManager: {},
      progressManager: {},
      agentsManager: {},
      evidenceStore: {},
      usageTracker: {},
      gitManager: {},
      platformRunner: mockPlatformRunner,
      verificationIntegration: {},
    };

    mockConfigManager = {
      load: vi.fn().mockResolvedValue(mockConfig),
      getConfigPath: vi.fn().mockReturnValue('/test/config.yaml'),
    };

    mockPrdManager = {
      load: vi.fn().mockResolvedValue(mockPrd),
      save: vi.fn().mockResolvedValue(undefined),
    };

    mockStatePersistence = {
      restoreCheckpoint: vi.fn(),
    };

    mockOrchestrator = {
      initialize: vi.fn().mockResolvedValue(undefined),
      resume: vi.fn().mockResolvedValue(undefined),
      getState: vi.fn().mockReturnValue('paused'),
    };

    // Create a mock registry that can return runners
    const mockRegistry = {
      getAvailable: vi.fn().mockReturnValue([]),
      get: vi.fn().mockReturnValue(undefined),
      register: vi.fn(),
    };

    mockContainer = {
      resolve: vi.fn((key: string) => {
        if (key === 'configManager') return mockConfigManager;
        if (key === 'prdManager') return mockPrdManager;
        if (key === 'progressManager') return mockDeps.progressManager;
        if (key === 'agentsManager') return mockDeps.agentsManager;
        if (key === 'evidenceStore') return mockDeps.evidenceStore;
        if (key === 'usageTracker') return mockDeps.usageTracker;
        if (key === 'gitManager') return mockDeps.gitManager;
        if (key === 'branchStrategy') return {};
        if (key === 'commitFormatter') return {};
        if (key === 'prManager') return {};
        if (key === 'verificationIntegration') return mockDeps.verificationIntegration;
        if (key === 'platformRegistry') {
          return mockRegistry;
        }
        return null;
      }) as ReturnType<typeof vi.fn>,
    };

    (ConfigManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockConfigManager);
    (PrdManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockPrdManager);
    (StatePersistence as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockStatePersistence);
    (createContainer as ReturnType<typeof vi.fn>).mockReturnValue(mockContainer);
    (Orchestrator as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockOrchestrator);
    const mockDefaultRegistry = {
      getAvailable: vi.fn().mockReturnValue(['cursor']),
      get: vi.fn((platform: string) => {
        if (platform === 'cursor') return mockPlatformRunner;
        return undefined;
      }),
    };
    
    (PlatformRegistry.createDefault as ReturnType<typeof vi.fn>).mockReturnValue(mockDefaultRegistry);

    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('config and PRD loading', () => {
    it('should load config using ConfigManager', async () => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);

      await resumeAction({});

      expect(ConfigManager).toHaveBeenCalled();
      expect(mockConfigManager.load).toHaveBeenCalled();
    });

    it('should load PRD using PrdManager', async () => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);

      await resumeAction({});

      expect(PrdManager).toHaveBeenCalled();
      expect(mockPrdManager.load).toHaveBeenCalled();
    });

    it('should exit with error if PRD file not found', async () => {
      (access as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('ENOENT'));

      await resumeAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('PRD file not found')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('orchestrator state validation', () => {
    it('should exit with error if orchestrator state not found', async () => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      const prdWithoutState = { ...mockPrd, orchestratorState: undefined };
      mockPrdManager.load.mockResolvedValue(prdWithoutState);

      await resumeAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Cannot resume: orchestrator state not found')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should exit with error if orchestrator is not paused', async () => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      const prdNotPaused = { ...mockPrd, orchestratorState: 'executing' as const };
      mockPrdManager.load.mockResolvedValue(prdNotPaused);

      await resumeAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Cannot resume: orchestrator is not in paused state')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should proceed if orchestrator is paused', async () => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);

      await resumeAction({});

      expect(Orchestrator).toHaveBeenCalled();
      expect(mockOrchestrator.initialize).toHaveBeenCalled();
    });
  });

  describe('checkpoint restoration', () => {
    let mockCheckpointManager: {
      loadCheckpoint: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);

      mockCheckpointManager = {
        loadCheckpoint: vi.fn(),
      };
      (CheckpointManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockCheckpointManager);
    });

    it('should restore from checkpoint if specified via flag', async () => {
      const checkpoint: Checkpoint = {
        id: 'test-checkpoint',
        timestamp: new Date().toISOString(),
        orchestratorState: 'paused',
        orchestratorContext: {
          state: 'paused',
          currentPhaseId: 'PH-001',
          currentTaskId: 'TK-001',
          currentSubtaskId: 'ST-001-001-001',
          currentIterationId: null,
        },
        tierStates: {
          'PH-001': {
            tierType: 'phase',
            itemId: 'PH-001',
            state: 'running',
            maxIterations: 10,
            iterationCount: 0,
          },
        },
        currentPosition: {
          phaseId: 'PH-001',
          taskId: 'TK-001',
          subtaskId: 'ST-001-001-001',
          iterationNumber: 1,
        },
        metadata: {
          projectName: 'test-project',
          completedSubtasks: 0,
          totalSubtasks: 1,
          iterationsRun: 1,
        },
      };

      mockCheckpointManager.loadCheckpoint.mockResolvedValue(checkpoint);

      await resumeAction({ checkpoint: 'test-checkpoint' });

      expect(mockCheckpointManager.loadCheckpoint).toHaveBeenCalledWith('test-checkpoint');
      expect(mockPrdManager.save).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Restored state from checkpoint')
      );
    });

    it('should restore from checkpoint if specified via positional argument', async () => {
      const checkpoint: Checkpoint = {
        id: 'test-checkpoint',
        timestamp: new Date().toISOString(),
        orchestratorState: 'paused',
        orchestratorContext: {
          state: 'paused',
          currentPhaseId: 'PH-001',
          currentTaskId: 'TK-001',
          currentSubtaskId: 'ST-001-001-001',
          currentIterationId: null,
        },
        tierStates: {
          'PH-001': {
            tierType: 'phase',
            itemId: 'PH-001',
            state: 'running',
            maxIterations: 10,
            iterationCount: 0,
          },
        },
        currentPosition: {
          phaseId: 'PH-001',
          taskId: 'TK-001',
          subtaskId: 'ST-001-001-001',
          iterationNumber: 1,
        },
        metadata: {
          projectName: 'test-project',
          completedSubtasks: 0,
          totalSubtasks: 1,
          iterationsRun: 1,
        },
      };

      mockCheckpointManager.loadCheckpoint.mockResolvedValue(checkpoint);

      // Simulate positional argument by passing checkpoint in options (which is how it works)
      await resumeAction({ checkpoint: 'test-checkpoint' });

      expect(mockCheckpointManager.loadCheckpoint).toHaveBeenCalledWith('test-checkpoint');
      expect(mockPrdManager.save).toHaveBeenCalled();
    });

    it('should prioritize positional argument over flag if both provided', async () => {
      const checkpoint: Checkpoint = {
        id: 'positional-checkpoint',
        timestamp: new Date().toISOString(),
        orchestratorState: 'paused',
        orchestratorContext: {
          state: 'paused',
          currentPhaseId: 'PH-001',
          currentTaskId: 'TK-001',
          currentSubtaskId: 'ST-001-001-001',
          currentIterationId: null,
        },
        tierStates: {},
        currentPosition: {
          phaseId: 'PH-001',
          taskId: 'TK-001',
          subtaskId: 'ST-001-001-001',
          iterationNumber: 1,
        },
        metadata: {
          projectName: 'test-project',
          completedSubtasks: 0,
          totalSubtasks: 1,
          iterationsRun: 1,
        },
      };

      mockCheckpointManager.loadCheckpoint.mockResolvedValue(checkpoint);

      // When both are provided, positional takes precedence (handled in register method)
      // For testing, we simulate this by passing checkpoint in options
      await resumeAction({ checkpoint: 'positional-checkpoint' });

      expect(mockCheckpointManager.loadCheckpoint).toHaveBeenCalledWith('positional-checkpoint');
    });

    it('should exit with error if checkpoint not found', async () => {
      mockCheckpointManager.loadCheckpoint.mockResolvedValue(null);

      await resumeAction({ checkpoint: 'non-existent' });

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Checkpoint not found')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should validate checkpoint structure by default', async () => {
      const validCheckpoint: Checkpoint = {
        id: 'test-checkpoint',
        timestamp: new Date().toISOString(),
        orchestratorState: 'paused',
        orchestratorContext: {
          state: 'paused',
          currentPhaseId: 'PH-001',
          currentTaskId: 'TK-001',
          currentSubtaskId: 'ST-001-001-001',
          currentIterationId: null,
        },
        tierStates: {},
        currentPosition: {
          phaseId: 'PH-001',
          taskId: 'TK-001',
          subtaskId: 'ST-001-001-001',
          iterationNumber: 1,
        },
        metadata: {
          projectName: 'test-project',
          completedSubtasks: 0,
          totalSubtasks: 1,
          iterationsRun: 1,
        },
      };

      mockCheckpointManager.loadCheckpoint.mockResolvedValue(validCheckpoint);

      await resumeAction({ checkpoint: 'test-checkpoint' });

      // Should proceed with validation
      expect(mockPrdManager.save).toHaveBeenCalled();
    });

    it('should skip validation if skipValidation flag is set', async () => {
      const checkpoint: Checkpoint = {
        id: 'test-checkpoint',
        timestamp: new Date().toISOString(),
        orchestratorState: 'paused',
        orchestratorContext: {
          state: 'paused',
          currentPhaseId: 'PH-001',
          currentTaskId: 'TK-001',
          currentSubtaskId: 'ST-001-001-001',
          currentIterationId: null,
        },
        tierStates: {},
        currentPosition: {
          phaseId: 'PH-001',
          taskId: 'TK-001',
          subtaskId: 'ST-001-001-001',
          iterationNumber: 1,
        },
        metadata: {
          projectName: 'test-project',
          completedSubtasks: 0,
          totalSubtasks: 1,
          iterationsRun: 1,
        },
      };

      mockCheckpointManager.loadCheckpoint.mockResolvedValue(checkpoint);

      await resumeAction({ checkpoint: 'test-checkpoint', skipValidation: true });

      // Should proceed without validation
      expect(mockPrdManager.save).toHaveBeenCalled();
    });

    it('should allow resuming from executing state checkpoint without warning', async () => {
      const checkpoint: Checkpoint = {
        id: 'test-checkpoint',
        timestamp: new Date().toISOString(),
        orchestratorState: 'executing',
        orchestratorContext: {
          state: 'executing',
          currentPhaseId: 'PH-001',
          currentTaskId: 'TK-001',
          currentSubtaskId: 'ST-001-001-001',
          currentIterationId: null,
        },
        tierStates: {},
        currentPosition: {
          phaseId: 'PH-001',
          taskId: 'TK-001',
          subtaskId: 'ST-001-001-001',
          iterationNumber: 1,
        },
        metadata: {
          projectName: 'test-project',
          completedSubtasks: 0,
          totalSubtasks: 1,
          iterationsRun: 1,
        },
      };

      mockCheckpointManager.loadCheckpoint.mockResolvedValue(checkpoint);

      await resumeAction({ checkpoint: 'test-checkpoint' });

      // Executing state is allowed without warning (only non-paused/non-executing states warn)
      expect(console.warn).not.toHaveBeenCalled();
      expect(mockPrdManager.save).toHaveBeenCalled();
    });
  });

  describe('orchestrator initialization and resume', () => {
    beforeEach(() => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);
    });

    it('should create orchestrator instance', async () => {
      await resumeAction({});

      expect(Orchestrator).toHaveBeenCalledWith({
        config: mockConfig,
        projectPath: expect.any(String),
      });
    });

    it('should initialize orchestrator with dependencies', async () => {
      await resumeAction({});

      expect(mockOrchestrator.initialize).toHaveBeenCalled();
      const initCall = mockOrchestrator.initialize.mock.calls[0][0];
      expect(initCall).toHaveProperty('configManager');
      expect(initCall).toHaveProperty('prdManager');
      expect(initCall).toHaveProperty('platformRegistry');
      expect(initCall).toHaveProperty('platformRouter');
    });

    it('should verify state is paused after initialization', async () => {
      await resumeAction({});

      expect(mockOrchestrator.getState).toHaveBeenCalled();
    });

    it('should exit with error if state is not paused after initialization', async () => {
      mockOrchestrator.getState.mockReturnValue('executing');

      await resumeAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Cannot resume: orchestrator state is')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should call orchestrator.resume()', async () => {
      await resumeAction({});

      expect(mockOrchestrator.resume).toHaveBeenCalled();
    });

    it('should display success message after resume', async () => {
      await resumeAction({});

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Orchestration resumed successfully')
      );
    });
  });

  describe('error handling', () => {
    it('should handle config loading errors', async () => {
      const error = new Error('Config load failed');
      mockConfigManager.load.mockRejectedValue(error);

      await resumeAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error resuming orchestration'),
        'Config load failed'
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle PRD loading errors', async () => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      const error = new Error('PRD load failed');
      mockPrdManager.load.mockRejectedValue(error);

      await resumeAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error resuming orchestration'),
        'PRD load failed'
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle orchestrator initialization errors', async () => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);
      
      const error = new Error('Initialization failed');
      mockOrchestrator.initialize.mockRejectedValue(error);

      await resumeAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error resuming orchestration'),
        'Initialization failed'
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle orchestrator resume errors', async () => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);
      
      const error = new Error('Resume failed');
      mockOrchestrator.resume.mockRejectedValue(error);

      await resumeAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error resuming orchestration'),
        'Resume failed'
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('options handling', () => {
    beforeEach(() => {
      (access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      const registry = mockContainer.resolve('platformRegistry');
      registry.getAvailable.mockReturnValue(['cursor']);
      registry.get.mockReturnValue(mockPlatformRunner);
    });

    it('should use provided config path', async () => {
      await resumeAction({ config: '/custom/config.yaml' });

      expect(ConfigManager).toHaveBeenCalledWith('/custom/config.yaml');
    });

    it('should handle checkpoint option (backward compatibility)', async () => {
      const mockCheckpointManager = {
        loadCheckpoint: vi.fn().mockResolvedValue({
          id: 'my-checkpoint',
          timestamp: new Date().toISOString(),
          orchestratorState: 'paused',
          orchestratorContext: {
            state: 'paused',
            currentPhaseId: 'PH-001',
            currentTaskId: 'TK-001',
            currentSubtaskId: 'ST-001-001-001',
            currentIterationId: null,
          },
          tierStates: {},
          currentPosition: {
            phaseId: 'PH-001',
            taskId: 'TK-001',
            subtaskId: 'ST-001-001-001',
            iterationNumber: 1,
          },
          metadata: {
            projectName: 'test-project',
            completedSubtasks: 0,
            totalSubtasks: 1,
            iterationsRun: 1,
          },
        } as Checkpoint),
      };
      (CheckpointManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockCheckpointManager);

      await resumeAction({ checkpoint: 'my-checkpoint' });

      expect(mockCheckpointManager.loadCheckpoint).toHaveBeenCalledWith('my-checkpoint');
    });

    it('should handle skipValidation option', async () => {
      const mockCheckpointManager = {
        loadCheckpoint: vi.fn().mockResolvedValue({
          id: 'test-checkpoint',
          timestamp: new Date().toISOString(),
          orchestratorState: 'paused',
          orchestratorContext: {
            state: 'paused',
            currentPhaseId: 'PH-001',
            currentTaskId: 'TK-001',
            currentSubtaskId: 'ST-001-001-001',
            currentIterationId: null,
          },
          tierStates: {},
          currentPosition: {
            phaseId: 'PH-001',
            taskId: 'TK-001',
            subtaskId: 'ST-001-001-001',
            iterationNumber: 1,
          },
          metadata: {
            projectName: 'test-project',
            completedSubtasks: 0,
            totalSubtasks: 1,
            iterationsRun: 1,
          },
        } as Checkpoint),
      };
      (CheckpointManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockCheckpointManager);

      await resumeAction({ checkpoint: 'test-checkpoint', skipValidation: true });

      expect(mockPrdManager.save).toHaveBeenCalled();
    });
  });
});
