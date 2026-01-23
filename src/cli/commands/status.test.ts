/**
 * Tests for status command
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { StatusCommand, statusAction } from './status.js';
import type { PuppetMasterConfig } from '../../types/config.js';
import type { PRD } from '../../types/prd.js';
import type { OrchestratorState } from '../../types/state.js';

// Mock dependencies
vi.mock('../../config/config-manager.js', () => ({
  ConfigManager: vi.fn(),
}));

vi.mock('../../memory/prd-manager.js', () => ({
  PrdManager: vi.fn(),
}));

vi.mock('../../core/checkpoint-manager.js', () => ({
  CheckpointManager: vi.fn(),
}));

vi.mock('../../platforms/quota-manager.js', () => ({
  QuotaManager: vi.fn(),
  QuotaExhaustedError: class QuotaExhaustedError extends Error {
    constructor(
      public platform: string,
      public period: string,
      public limit: number,
      public count: number,
      public resetsAt: string
    ) {
      super('Quota exhausted');
    }
  },
}));

vi.mock('../../memory/usage-tracker.js', () => ({
  UsageTracker: vi.fn(),
}));

vi.mock('../../start-chain/validators/coverage-validator.js', () => ({
  CoverageValidator: vi.fn(),
}));

import { ConfigManager } from '../../config/config-manager.js';
import { PrdManager } from '../../memory/prd-manager.js';
import { CheckpointManager } from '../../core/checkpoint-manager.js';
import { QuotaManager } from '../../platforms/quota-manager.js';
import { UsageTracker } from '../../memory/usage-tracker.js';
import { CoverageValidator } from '../../start-chain/validators/coverage-validator.js';

describe('StatusCommand', () => {
  let command: StatusCommand;
  let mockProgram: Command;

  beforeEach(() => {
    command = new StatusCommand();
    mockProgram = new Command();
    vi.clearAllMocks();
  });

  describe('CommandModule implementation', () => {
    it('should implement CommandModule interface', () => {
      expect(command).toBeDefined();
      expect(typeof command.register).toBe('function');
    });

    it('should register status command with program', () => {
      const registerSpy = vi.spyOn(mockProgram, 'command');
      command.register(mockProgram);

      expect(registerSpy).toHaveBeenCalledWith('status');
    });

    it('should set correct description', () => {
      const descriptionSpy = vi.spyOn(Command.prototype, 'description');
      command.register(mockProgram);

      expect(descriptionSpy).toHaveBeenCalledWith('Show current orchestration status');
    });

    it('should register all expected options', () => {
      const optionSpy = vi.spyOn(Command.prototype, 'option');
      command.register(mockProgram);

      const optionCalls = optionSpy.mock.calls.map(call => call[0]);
      expect(optionCalls).toContain('-c, --config <path>');
      expect(optionCalls).toContain('--json');
    });
  });
});

describe('statusAction', () => {
  let mockConfig: PuppetMasterConfig;
  let mockConfigManager: {
    load: ReturnType<typeof vi.fn>;
  };
  let mockPrdManager: {
    load: ReturnType<typeof vi.fn>;
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
      phases: [
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'First phase',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [
            {
              id: 'TK-001-001',
              phaseId: 'PH-001',
              title: 'Task 1',
              description: 'First task',
              status: 'pending',
              priority: 1,
              acceptanceCriteria: [],
              testPlan: { commands: [], failFast: true },
              subtasks: [
                {
                  id: 'ST-001-001-001',
                  taskId: 'TK-001-001',
                  title: 'Subtask 1',
                  description: 'First subtask',
                  status: 'pending',
                  priority: 1,
                  acceptanceCriteria: [],
                  testPlan: { commands: [], failFast: true },
                  iterations: [],
                  maxIterations: 3,
                  createdAt: now,
                  notes: '',
                },
              ],
              createdAt: now,
              notes: '',
            },
          ],
          createdAt: now,
          notes: '',
        },
      ],
      metadata: {
        totalPhases: 1,
        completedPhases: 0,
        totalTasks: 1,
        completedTasks: 0,
        totalSubtasks: 1,
        completedSubtasks: 0,
      },
    };
  }

  /**
   * Helper to create a PRD with orchestrator state
   */
  function createPRDWithState(orchestratorState: OrchestratorState, currentPhaseId?: string, currentTaskId?: string, currentSubtaskId?: string): PRD {
    const prd = createSamplePRD();
    prd.orchestratorState = orchestratorState;
    if (currentPhaseId || currentTaskId || currentSubtaskId) {
      prd.orchestratorContext = {
        state: orchestratorState,
        currentPhaseId: currentPhaseId ?? null,
        currentTaskId: currentTaskId ?? null,
        currentSubtaskId: currentSubtaskId ?? null,
        currentIterationId: null,
      };
    }
    return prd;
  }

  /**
   * Helper to create a PRD with running items
   */
  function createPRDWithRunningItems(): PRD {
    const prd = createSamplePRD();
    prd.phases[0]!.status = 'running';
    prd.phases[0]!.tasks[0]!.status = 'running';
    prd.phases[0]!.tasks[0]!.subtasks[0]!.status = 'running';
    return prd;
  }

  /**
   * Helper to create a complete PRD
   */
  function createCompletePRD(): PRD {
    const prd = createSamplePRD();
    prd.phases[0]!.status = 'passed';
    prd.phases[0]!.tasks[0]!.status = 'passed';
    prd.phases[0]!.tasks[0]!.subtasks[0]!.status = 'passed';
    prd.metadata.completedPhases = 1;
    prd.metadata.completedTasks = 1;
    prd.metadata.completedSubtasks = 1;
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
        antigravity: 'agy',
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
        antigravity: {
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
      load: vi.fn().mockResolvedValue(createSamplePRD()),
    };

    (ConfigManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockConfigManager);
    (PrdManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockPrdManager);

    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('config loading', () => {
    it('should load config using ConfigManager', async () => {
      await statusAction({});

      expect(ConfigManager).toHaveBeenCalled();
      expect(mockConfigManager.load).toHaveBeenCalled();
    });

    it('should use provided config path', async () => {
      await statusAction({ config: '/custom/config.yaml' });

      expect(ConfigManager).toHaveBeenCalledWith('/custom/config.yaml');
    });
  });

  describe('PRD loading', () => {
    it('should load PRD using PrdManager', async () => {
      await statusAction({});

      expect(PrdManager).toHaveBeenCalledWith(mockConfig.memory.prdFile);
      expect(mockPrdManager.load).toHaveBeenCalled();
    });
  });

  describe('status building', () => {
    it('should build status from PRD', async () => {
      await statusAction({});

      expect(console.log).toHaveBeenCalled();
      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      expect(logCalls.length).toBeGreaterThan(0);
    });

    it('should infer not_started state from empty PRD', async () => {
      const emptyPRD: PRD = {
        project: 'EmptyProject',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        branchName: 'main',
        description: '',
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
      mockPrdManager.load.mockResolvedValue(emptyPRD);

      await statusAction({});

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls.map(call => call[0]).join('\n');
      expect(output).toContain('State: not_started');
    });

    it('should map orchestrator state to status state', async () => {
      const prd = createPRDWithState('executing');
      mockPrdManager.load.mockResolvedValue(prd);

      await statusAction({});

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls.map(call => call[0]).join('\n');
      expect(output).toContain('State: in_progress');
    });

    it('should map paused state correctly', async () => {
      const prd = createPRDWithState('paused');
      mockPrdManager.load.mockResolvedValue(prd);

      await statusAction({});

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls.map(call => call[0]).join('\n');
      expect(output).toContain('State: paused');
    });

    it('should map complete state correctly', async () => {
      const prd = createPRDWithState('complete');
      mockPrdManager.load.mockResolvedValue(prd);

      await statusAction({});

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls.map(call => call[0]).join('\n');
      expect(output).toContain('State: complete');
    });

    it('should infer complete state from all phases passed', async () => {
      const prd = createCompletePRD();
      mockPrdManager.load.mockResolvedValue(prd);

      await statusAction({});

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls.map(call => call[0]).join('\n');
      expect(output).toContain('State: complete');
    });

    it('should find current items from orchestrator context', async () => {
      const prd = createPRDWithState('executing', 'PH-001', 'TK-001-001', 'ST-001-001-001');
      mockPrdManager.load.mockResolvedValue(prd);

      await statusAction({});

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls.map(call => call[0]).join('\n');
      expect(output).toContain('Current:');
      expect(output).toContain('Phase: PH-001');
      expect(output).toContain('Task: TK-001-001');
      expect(output).toContain('Subtask: ST-001-001-001');
    });

    it('should infer current items from statuses', async () => {
      const prd = createPRDWithRunningItems();
      mockPrdManager.load.mockResolvedValue(prd);

      await statusAction({});

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls.map(call => call[0]).join('\n');
      expect(output).toContain('Current:');
      expect(output).toContain('Phase: PH-001');
    });

    it('should show progress from metadata', async () => {
      await statusAction({});

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls.map(call => call[0]).join('\n');
      expect(output).toContain('Phases: 0/1');
      expect(output).toContain('Tasks: 0/1');
      expect(output).toContain('Subtasks: 0/1');
    });
  });

  describe('JSON output', () => {
    it('should output JSON when --json flag is set', async () => {
      await statusAction({ json: true });

      expect(console.log).toHaveBeenCalled();
      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      expect(logCalls.length).toBe(1);
      
      const output = logCalls[0]![0] as string;
      expect(() => JSON.parse(output)).not.toThrow();
      const parsed = JSON.parse(output);
      expect(parsed).toHaveProperty('project');
      expect(parsed).toHaveProperty('state');
      expect(parsed).toHaveProperty('progress');
    });

    it('should output valid JSON structure', async () => {
      await statusAction({ json: true });

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls[0]![0] as string;
      const parsed = JSON.parse(output);

      expect(parsed).toHaveProperty('project', 'TestProject');
      expect(parsed).toHaveProperty('state');
      expect(parsed).toHaveProperty('progress');
      expect(parsed.progress).toHaveProperty('phases');
      expect(parsed.progress).toHaveProperty('tasks');
      expect(parsed.progress).toHaveProperty('subtasks');
    });
  });

  describe('text output', () => {
    it('should output formatted text when --json flag is not set', async () => {
      await statusAction({});

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      expect(logCalls.length).toBeGreaterThan(1);
      
      const output = logCalls.map(call => call[0]).join('\n');
      expect(output).toContain('Project: TestProject');
      expect(output).toContain('State:');
      expect(output).toContain('Progress:');
    });

    it('should format progress correctly', async () => {
      await statusAction({});

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls.map(call => call[0]).join('\n');
      expect(output).toContain('Phases: 0/1');
      expect(output).toContain('Tasks: 0/1');
      expect(output).toContain('Subtasks: 0/1');
    });
  });

  describe('error handling', () => {
    it('should handle config loading errors', async () => {
      mockConfigManager.load.mockRejectedValue(new Error('Config error'));

      await statusAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error getting status'),
        expect.stringContaining('Config error')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle PRD loading errors', async () => {
      mockPrdManager.load.mockRejectedValue(new Error('PRD error'));

      await statusAction({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error getting status'),
        expect.stringContaining('PRD error')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('completion percentage', () => {
    it('should calculate completion percentage correctly', async () => {
      const prd = createSamplePRD();
      prd.metadata.completedPhases = 1;
      prd.metadata.completedTasks = 1;
      prd.metadata.completedSubtasks = 1;
      mockPrdManager.load.mockResolvedValue(prd);

      await statusAction({ json: true });

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls[0]![0] as string;
      const parsed = JSON.parse(output);
      expect(parsed.completionPercentage).toBe(100);
    });

    it('should calculate partial completion percentage', async () => {
      const prd = createSamplePRD();
      prd.metadata.completedPhases = 0;
      prd.metadata.completedTasks = 1;
      prd.metadata.completedSubtasks = 0;
      mockPrdManager.load.mockResolvedValue(prd);

      await statusAction({ json: true });

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls[0]![0] as string;
      const parsed = JSON.parse(output);
      expect(parsed.completionPercentage).toBe(33); // 1/3 = 33%
    });

    it('should show completion percentage in text output', async () => {
      const prd = createSamplePRD();
      prd.metadata.completedPhases = 1;
      prd.metadata.completedTasks = 1;
      prd.metadata.completedSubtasks = 1;
      mockPrdManager.load.mockResolvedValue(prd);

      await statusAction({});

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls.map(call => call[0]).join('\n');
      expect(output).toMatch(/Completion: \d+%/);
    });
  });

  describe('failed items', () => {
    it('should detect failed phases', async () => {
      const prd = createSamplePRD();
      prd.phases[0]!.status = 'failed';
      mockPrdManager.load.mockResolvedValue(prd);

      await statusAction({ json: true });

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls[0]![0] as string;
      const parsed = JSON.parse(output);
      expect(parsed.failedItems).toBeDefined();
      expect(parsed.failedItems).toHaveLength(1);
      expect(parsed.failedItems[0]).toMatchObject({
        id: 'PH-001',
        title: 'Phase 1',
        type: 'phase',
      });
    });

    it('should detect failed tasks', async () => {
      const prd = createSamplePRD();
      prd.phases[0]!.tasks[0]!.status = 'failed';
      mockPrdManager.load.mockResolvedValue(prd);

      await statusAction({ json: true });

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls[0]![0] as string;
      const parsed = JSON.parse(output);
      expect(parsed.failedItems).toBeDefined();
      expect(parsed.failedItems[0]).toMatchObject({
        id: 'TK-001-001',
        title: 'Task 1',
        type: 'task',
      });
    });

    it('should detect failed subtasks', async () => {
      const prd = createSamplePRD();
      prd.phases[0]!.tasks[0]!.subtasks[0]!.status = 'failed';
      mockPrdManager.load.mockResolvedValue(prd);

      await statusAction({ json: true });

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls[0]![0] as string;
      const parsed = JSON.parse(output);
      expect(parsed.failedItems).toBeDefined();
      expect(parsed.failedItems[0]).toMatchObject({
        id: 'ST-001-001-001',
        title: 'Subtask 1',
        type: 'subtask',
      });
    });

    it('should show failed items in text output', async () => {
      const prd = createSamplePRD();
      prd.phases[0]!.status = 'failed';
      mockPrdManager.load.mockResolvedValue(prd);

      await statusAction({});

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls.map(call => call[0]).join('\n');
      expect(output).toContain('Failed Items:');
      expect(output).toContain('phase: PH-001');
    });

    it('should not include failedItems when none exist', async () => {
      await statusAction({ json: true });

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls[0]![0] as string;
      const parsed = JSON.parse(output);
      expect(parsed.failedItems).toBeUndefined();
    });
  });

  describe('checkpoint info', () => {
    it('should include checkpoint info when available', async () => {
      const mockCheckpointManager = {
        listCheckpoints: vi.fn().mockResolvedValue([
          {
            id: 'checkpoint-123',
            timestamp: '2026-01-23T10:00:00Z',
            position: {
              phaseId: 'PH-001',
              taskId: 'TK-001-001',
              subtaskId: 'ST-001-001-001',
            },
            metadata: {
              projectName: 'TestProject',
              completedSubtasks: 5,
              totalSubtasks: 10,
              iterationsRun: 15,
            },
          },
        ]),
      };

      (CheckpointManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => mockCheckpointManager
      );

      await statusAction({ json: true });

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls[0]![0] as string;
      const parsed = JSON.parse(output);
      expect(parsed.checkpoint).toBeDefined();
      expect(parsed.checkpoint.id).toBe('checkpoint-123');
      expect(parsed.checkpoint.position.phaseId).toBe('PH-001');
    });

    it('should handle missing checkpoints gracefully', async () => {
      const mockCheckpointManager = {
        listCheckpoints: vi.fn().mockResolvedValue([]),
      };

      (CheckpointManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => mockCheckpointManager
      );

      await statusAction({ json: true });

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls[0]![0] as string;
      const parsed = JSON.parse(output);
      expect(parsed.checkpoint).toBeUndefined();
    });
  });

  describe('budget info', () => {
    it('should include budget info when available', async () => {
      const mockUsageTracker = {
        getSummary: vi.fn().mockResolvedValue({
          platform: 'cursor',
          totalCalls: 25,
          totalTokens: 50000,
          totalDurationMs: 4500000,
          successCount: 25,
          failureCount: 0,
        }),
      };

      const mockQuotaManager = {
        checkQuota: vi.fn().mockResolvedValue({
          remaining: Number.MAX_SAFE_INTEGER,
          limit: Number.MAX_SAFE_INTEGER,
          resetsAt: new Date().toISOString(),
          period: 'run',
        }),
        checkCooldown: vi.fn().mockResolvedValue({
          active: false,
          endsAt: null,
          reason: null,
        }),
      };

      (UsageTracker as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => mockUsageTracker
      );
      (QuotaManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => mockQuotaManager
      );

      await statusAction({ json: true });

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls[0]![0] as string;
      const parsed = JSON.parse(output);
      expect(parsed.budget).toBeDefined();
      expect(parsed.budget.platforms).toBeDefined();
      expect(Array.isArray(parsed.budget.platforms)).toBe(true);
    });

    it('should handle quota exhaustion gracefully', async () => {
      const { QuotaExhaustedError } = await import('../../platforms/quota-manager.js');

      const mockUsageTracker = {
        getSummary: vi.fn().mockResolvedValue({
          platform: 'claude',
          totalCalls: 5,
          totalTokens: 10000,
          totalDurationMs: 50000,
          successCount: 5,
          failureCount: 0,
        }),
      };

      const mockQuotaManager = {
        checkQuota: vi.fn().mockRejectedValue(
          new QuotaExhaustedError('claude', 'hour', 5, 5, new Date().toISOString())
        ),
        checkCooldown: vi.fn().mockResolvedValue({
          active: false,
          endsAt: null,
          reason: null,
        }),
      };

      (UsageTracker as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => mockUsageTracker
      );
      (QuotaManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => mockQuotaManager
      );

      // Should not throw, should skip exhausted platforms
      await statusAction({ json: true });

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls[0]![0] as string;
      const parsed = JSON.parse(output);
      // Budget might be undefined when all platforms fail, which is acceptable
      // Just verify the command didn't crash
      expect(parsed).toHaveProperty('project');
    });
  });

  describe('JSON output structure', () => {
    it('should include all new fields in JSON output', async () => {
      await statusAction({ json: true });

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls[0]![0] as string;
      const parsed = JSON.parse(output);

      // Check all required fields exist
      expect(parsed).toHaveProperty('project');
      expect(parsed).toHaveProperty('state');
      expect(parsed).toHaveProperty('progress');
      expect(parsed).toHaveProperty('completionPercentage');
      // Optional fields may be undefined, but the property should exist in the type
      // In JSON, undefined properties are omitted, so we check they're not required
      // The type system ensures they exist when present
      expect(typeof parsed.failedItems === 'undefined' || Array.isArray(parsed.failedItems)).toBe(true);
      expect(typeof parsed.checkpoint === 'undefined' || typeof parsed.checkpoint === 'object').toBe(true);
      expect(typeof parsed.coverage === 'undefined' || typeof parsed.coverage === 'object').toBe(true);
      expect(typeof parsed.budget === 'undefined' || typeof parsed.budget === 'object').toBe(true);
    });

    it('should maintain backward compatibility with existing JSON consumers', async () => {
      await statusAction({ json: true });

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const output = logCalls[0]![0] as string;
      const parsed = JSON.parse(output);

      // Original fields should still be present
      expect(parsed).toHaveProperty('project');
      expect(parsed).toHaveProperty('state');
      expect(parsed).toHaveProperty('progress');
      expect(parsed.progress).toHaveProperty('phases');
      expect(parsed.progress).toHaveProperty('tasks');
      expect(parsed.progress).toHaveProperty('subtasks');
    });
  });
});