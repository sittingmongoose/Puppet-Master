/**
 * Tests for reopen command
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { ReopenCommand, reopenAction } from './reopen.js';
import type { PuppetMasterConfig } from '../../types/config.js';
import type { PRD, Phase, Task, Subtask } from '../../types/prd.js';

// Mock dependencies
vi.mock('../../config/config-manager.js', () => ({
  ConfigManager: vi.fn(),
}));

vi.mock('../../memory/prd-manager.js', () => ({
  PrdManager: vi.fn(),
}));

vi.mock('../../memory/evidence-store.js', () => ({
  EvidenceStore: vi.fn(),
}));

vi.mock('node:readline/promises', () => ({
  createInterface: vi.fn(),
}));

vi.mock('fs', () => ({
  promises: {
    unlink: vi.fn(),
  },
}));

import { ConfigManager } from '../../config/config-manager.js';
import { PrdManager } from '../../memory/prd-manager.js';
import { EvidenceStore } from '../../memory/evidence-store.js';
import * as readline from 'node:readline/promises';
import { promises as fs } from 'fs';

describe('ReopenCommand', () => {
  let command: ReopenCommand;
  let mockProgram: Command;

  beforeEach(() => {
    command = new ReopenCommand();
    mockProgram = new Command();
    vi.clearAllMocks();
  });

  describe('CommandModule implementation', () => {
    it('should implement CommandModule interface', () => {
      expect(command).toBeDefined();
      expect(typeof command.register).toBe('function');
    });

    it('should register reopen command with program', () => {
      const registerSpy = vi.spyOn(mockProgram, 'command');
      command.register(mockProgram);

      expect(registerSpy).toHaveBeenCalledWith('reopen <item-id>');
    });

    it('should set correct description', () => {
      const descriptionSpy = vi.spyOn(Command.prototype, 'description');
      command.register(mockProgram);

      expect(descriptionSpy).toHaveBeenCalledWith('Reopen a completed item (passed/failed/skipped)');
    });

    it('should register all expected options', () => {
      const optionSpy = vi.spyOn(Command.prototype, 'option');
      command.register(mockProgram);

      const optionCalls = optionSpy.mock.calls.map(call => call[0]);
      expect(optionCalls).toContain('-c, --config <path>');
      expect(optionCalls).toContain('--clear-evidence');
      expect(optionCalls).toContain('-y, --yes');
    });
  });
});

describe('reopenAction', () => {
  let mockConfig: PuppetMasterConfig;
  let mockConfigManager: {
    load: ReturnType<typeof vi.fn>;
  };
  let mockPrdManager: {
    load: ReturnType<typeof vi.fn>;
    findItem: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let mockEvidenceStore: {
    getEvidence: ReturnType<typeof vi.fn>;
  };
  let mockReadlineInterface: {
    question: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
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
   * Helper to create a sample phase
   */
  function createSamplePhase(id: string, status: Phase['status']): Phase {
    const now = new Date().toISOString();
    return {
      id,
      title: `Phase ${id}`,
      description: 'Test phase',
      status,
      priority: 1,
      acceptanceCriteria: [],
      testPlan: { commands: [], failFast: false },
      tasks: [],
      createdAt: now,
      notes: '',
    };
  }

  /**
   * Helper to create a sample task
   */
  function createSampleTask(id: string, phaseId: string, status: Task['status']): Task {
    const now = new Date().toISOString();
    return {
      id,
      phaseId,
      title: `Task ${id}`,
      description: 'Test task',
      status,
      priority: 1,
      acceptanceCriteria: [],
      testPlan: { commands: [], failFast: false },
      subtasks: [],
      createdAt: now,
      notes: '',
    };
  }

  /**
   * Helper to create a sample subtask
   */
  function createSampleSubtask(id: string, taskId: string, status: Subtask['status']): Subtask {
    const now = new Date().toISOString();
    return {
      id,
      taskId,
      title: `Subtask ${id}`,
      description: 'Test subtask',
      status,
      priority: 1,
      acceptanceCriteria: [],
      testPlan: { commands: [], failFast: false },
      iterations: [
        {
          id: 'IT-001-001-001-001',
          subtaskId: id,
          attemptNumber: 1,
          status: 'succeeded',
          startedAt: now,
          completedAt: now,
          platform: 'cursor',
          model: 'claude-sonnet',
          sessionId: 'PM-2026-01-01-00-00-00-001',
          processId: 12345,
        },
      ],
      maxIterations: 5,
      createdAt: now,
      notes: '',
    };
  }

  beforeEach(() => {
    // Reset readline mock
    vi.clearAllMocks();
    mockReadlineInterface = {
      question: vi.fn().mockResolvedValue('y'),
      close: vi.fn(),
    };
    (readline.createInterface as ReturnType<typeof vi.fn>).mockReturnValue(mockReadlineInterface);
    
    mockConfig = {
      project: {
        name: 'TestProject',
        workingDirectory: '/test',
      },
      tiers: {
        phase: { platform: 'cursor', model: 'claude-sonnet', taskFailureStyle: 'skip_retries', maxIterations: 3, escalation: null },
        task: { platform: 'cursor', model: 'claude-sonnet', taskFailureStyle: 'skip_retries', maxIterations: 3, escalation: 'phase' },
        subtask: { platform: 'cursor', model: 'claude-sonnet', taskFailureStyle: 'skip_retries', maxIterations: 3, escalation: 'task' },
        iteration: { platform: 'cursor', model: 'claude-sonnet', taskFailureStyle: 'skip_retries', maxIterations: 3, escalation: 'subtask' },
      },
      branching: {
        baseBranch: 'main',
        namingPattern: 'ralph/{tier}',
        granularity: 'single',
        pushPolicy: 'per-subtask',
        mergePolicy: 'squash',
        autoPr: true,
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
          requireUpdateOnFailure: true,
          requireUpdateOnGotcha: true,
          gateFailsOnMissingUpdate: true,
          reviewerMustAcknowledge: true,
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
      logging: {
        level: 'info',
        retentionDays: 30,
      },
      cliPaths: {
        cursor: 'cursor-agent',
        codex: 'codex',
        claude: 'claude',
        gemini: 'gemini',
        copilot: 'copilot',
      },
    };

    mockConfigManager = {
      load: vi.fn().mockResolvedValue(mockConfig),
    };

    mockPrdManager = {
      load: vi.fn().mockResolvedValue(createSamplePRD()),
      findItem: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
    };

    mockEvidenceStore = {
      getEvidence: vi.fn().mockResolvedValue([]),
    };

    (ConfigManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(function () {
      return mockConfigManager;
    });
    (PrdManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(function () {
      return mockPrdManager;
    });
    (EvidenceStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(function () {
      return mockEvidenceStore;
    });
    // Reset the mock before each test
    (readline.createInterface as ReturnType<typeof vi.fn>).mockReturnValue(mockReadlineInterface);

    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('config loading', () => {
    it('should load config using ConfigManager', async () => {
      const subtask = createSampleSubtask('ST-001-001-001', 'TK-001-001', 'failed');
      mockPrdManager.findItem.mockResolvedValue(subtask);
      const prd = createSamplePRD();
      prd.phases.push(createSamplePhase('PH-001', 'passed'));
      prd.phases[0]!.tasks.push(createSampleTask('TK-001-001', 'PH-001', 'passed'));
      prd.phases[0]!.tasks[0]!.subtasks.push(subtask);
      mockPrdManager.load.mockResolvedValue(prd);

      await reopenAction('ST-001-001-001', {});

      expect(ConfigManager).toHaveBeenCalled();
      expect(mockConfigManager.load).toHaveBeenCalled();
    });

    it('should use provided config path', async () => {
      const subtask = createSampleSubtask('ST-001-001-001', 'TK-001-001', 'failed');
      mockPrdManager.findItem.mockResolvedValue(subtask);
      const prd = createSamplePRD();
      prd.phases.push(createSamplePhase('PH-001', 'passed'));
      prd.phases[0]!.tasks.push(createSampleTask('TK-001-001', 'PH-001', 'passed'));
      prd.phases[0]!.tasks[0]!.subtasks.push(subtask);
      mockPrdManager.load.mockResolvedValue(prd);

      await reopenAction('ST-001-001-001', { config: '/custom/config.yaml' });

      expect(ConfigManager).toHaveBeenCalledWith('/custom/config.yaml');
    });
  });

  describe('item finding', () => {
    it('should find item by ID', async () => {
      const subtask = createSampleSubtask('ST-001-001-001', 'TK-001-001', 'failed');
      mockPrdManager.findItem.mockResolvedValue(subtask);
      const prd = createSamplePRD();
      prd.phases.push(createSamplePhase('PH-001', 'passed'));
      prd.phases[0]!.tasks.push(createSampleTask('TK-001-001', 'PH-001', 'passed'));
      prd.phases[0]!.tasks[0]!.subtasks.push(subtask);
      mockPrdManager.load.mockResolvedValue(prd);

      await reopenAction('ST-001-001-001', {});

      expect(mockPrdManager.findItem).toHaveBeenCalledWith('ST-001-001-001');
    });

    it('should error when item not found', async () => {
      mockPrdManager.findItem.mockResolvedValue(null);

      await reopenAction('ST-999-999-999', {});

      expect(console.error).toHaveBeenCalledWith('Error: Item not found: ST-999-999-999');
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('status validation', () => {
    it('should allow reopening failed item', async () => {
      const subtask = createSampleSubtask('ST-001-001-001', 'TK-001-001', 'failed');
      mockPrdManager.findItem.mockResolvedValue(subtask);
      const prd = createSamplePRD();
      prd.phases.push(createSamplePhase('PH-001', 'passed'));
      prd.phases[0]!.tasks.push(createSampleTask('TK-001-001', 'PH-001', 'passed'));
      prd.phases[0]!.tasks[0]!.subtasks.push(subtask);
      mockPrdManager.load.mockResolvedValue(prd);

      await reopenAction('ST-001-001-001', {});

      expect(console.error).not.toHaveBeenCalledWith(expect.stringContaining('Cannot reopen'));
      expect(mockPrdManager.save).toHaveBeenCalled();
    });

    it('should allow reopening skipped item', async () => {
      const subtask = createSampleSubtask('ST-001-001-001', 'TK-001-001', 'skipped');
      mockPrdManager.findItem.mockResolvedValue(subtask);
      const prd = createSamplePRD();
      prd.phases.push(createSamplePhase('PH-001', 'passed'));
      prd.phases[0]!.tasks.push(createSampleTask('TK-001-001', 'PH-001', 'passed'));
      prd.phases[0]!.tasks[0]!.subtasks.push(subtask);
      mockPrdManager.load.mockResolvedValue(prd);

      await reopenAction('ST-001-001-001', {});

      expect(console.error).not.toHaveBeenCalledWith(expect.stringContaining('Cannot reopen'));
      expect(mockPrdManager.save).toHaveBeenCalled();
    });

    it('should allow reopening already reopened item', async () => {
      const subtask = createSampleSubtask('ST-001-001-001', 'TK-001-001', 'reopened');
      mockPrdManager.findItem.mockResolvedValue(subtask);
      const prd = createSamplePRD();
      prd.phases.push(createSamplePhase('PH-001', 'passed'));
      prd.phases[0]!.tasks.push(createSampleTask('TK-001-001', 'PH-001', 'passed'));
      prd.phases[0]!.tasks[0]!.subtasks.push(subtask);
      mockPrdManager.load.mockResolvedValue(prd);

      await reopenAction('ST-001-001-001', {});

      expect(console.error).not.toHaveBeenCalledWith(expect.stringContaining('Cannot reopen'));
      expect(mockPrdManager.save).toHaveBeenCalled();
    });

    it('should error when item is pending', async () => {
      const subtask = createSampleSubtask('ST-001-001-001', 'TK-001-001', 'pending');
      mockPrdManager.findItem.mockResolvedValue(subtask);

      await reopenAction('ST-001-001-001', {});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Cannot reopen item with status')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should error when item is running', async () => {
      const subtask = createSampleSubtask('ST-001-001-001', 'TK-001-001', 'running');
      mockPrdManager.findItem.mockResolvedValue(subtask);

      await reopenAction('ST-001-001-001', {});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Cannot reopen item with status')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('confirmation for passed items', () => {
    it('should prompt for confirmation when reopening passed item', async () => {
      const prd = createSamplePRD();
      const phase = createSamplePhase('PH-001', 'passed');
      const task = createSampleTask('TK-001-001', 'PH-001', 'passed');
      const subtask = createSampleSubtask('ST-001-001-001', 'TK-001-001', 'passed');
      task.subtasks.push(subtask);
      phase.tasks.push(task);
      prd.phases.push(phase);
      
      // Mock findItem to return the subtask (this is called first for validation)
      mockPrdManager.findItem.mockResolvedValue(subtask);
      // Mock load to return the PRD with the item (this is called later to modify)
      mockPrdManager.load.mockResolvedValue(prd);
      mockReadlineInterface.question.mockResolvedValue('y');

      await reopenAction('ST-001-001-001', {});

      // Verify findItem was called for validation
      expect(mockPrdManager.findItem).toHaveBeenCalledWith('ST-001-001-001');
      // Verify load was called to get PRD for modification  
      expect(mockPrdManager.load).toHaveBeenCalled();
      // Verify confirmation was prompted (only for passed items without --yes)
      expect(readline.createInterface).toHaveBeenCalled();
      expect(mockReadlineInterface.question).toHaveBeenCalledWith(
        expect.stringContaining('is passed. Reopen?')
      );
      expect(mockReadlineInterface.close).toHaveBeenCalled();
      // Verify save was called after confirmation
      expect(mockPrdManager.save).toHaveBeenCalled();
    });

    it('should skip confirmation with --yes flag', async () => {
      const subtask = createSampleSubtask('ST-001-001-001', 'TK-001-001', 'passed');
      mockPrdManager.findItem.mockResolvedValue(subtask);
      const prd = createSamplePRD();
      prd.phases.push(createSamplePhase('PH-001', 'passed'));
      prd.phases[0]!.tasks.push(createSampleTask('TK-001-001', 'PH-001', 'passed'));
      prd.phases[0]!.tasks[0]!.subtasks.push(subtask);
      mockPrdManager.load.mockResolvedValue(prd);

      await reopenAction('ST-001-001-001', { yes: true });

      expect(readline.createInterface).not.toHaveBeenCalled();
      expect(mockPrdManager.save).toHaveBeenCalled();
    });

    it('should cancel when user declines confirmation', async () => {
      const prd = createSamplePRD();
      const phase = createSamplePhase('PH-001', 'passed');
      const task = createSampleTask('TK-001-001', 'PH-001', 'passed');
      const subtask = createSampleSubtask('ST-001-001-001', 'TK-001-001', 'passed');
      task.subtasks.push(subtask);
      phase.tasks.push(task);
      prd.phases.push(phase);
      
      mockPrdManager.findItem.mockResolvedValue(subtask);
      mockPrdManager.load.mockResolvedValue(prd);
      mockReadlineInterface.question.mockResolvedValue('n');

      await reopenAction('ST-001-001-001', {});

      expect(console.log).toHaveBeenCalledWith('Reopen cancelled.');
      expect(process.exit).toHaveBeenCalledWith(0);
      expect(mockPrdManager.save).not.toHaveBeenCalled();
    });

    it('should accept "yes" as confirmation', async () => {
      const prd = createSamplePRD();
      const phase = createSamplePhase('PH-001', 'passed');
      const task = createSampleTask('TK-001-001', 'PH-001', 'passed');
      const subtask = createSampleSubtask('ST-001-001-001', 'TK-001-001', 'passed');
      task.subtasks.push(subtask);
      phase.tasks.push(task);
      prd.phases.push(phase);
      
      mockPrdManager.findItem.mockResolvedValue(subtask);
      mockPrdManager.load.mockResolvedValue(prd);
      mockReadlineInterface.question.mockResolvedValue('yes');

      await reopenAction('ST-001-001-001', {});

      expect(mockPrdManager.save).toHaveBeenCalled();
    });
  });

  describe('item reopening', () => {
    it('should update item status to reopened', async () => {
      const subtask = createSampleSubtask('ST-001-001-001', 'TK-001-001', 'failed');
      mockPrdManager.findItem.mockResolvedValue(subtask);
      const prd = createSamplePRD();
      prd.phases.push(createSamplePhase('PH-001', 'passed'));
      prd.phases[0]!.tasks.push(createSampleTask('TK-001-001', 'PH-001', 'passed'));
      prd.phases[0]!.tasks[0]!.subtasks.push(subtask);
      mockPrdManager.load.mockResolvedValue(prd);

      await reopenAction('ST-001-001-001', {});

      expect(mockPrdManager.save).toHaveBeenCalled();
      const savedPrd = (mockPrdManager.save as ReturnType<typeof vi.fn>).mock.calls[0]![0] as PRD;
      const savedSubtask = savedPrd.phases[0]!.tasks[0]!.subtasks[0]!;
      expect(savedSubtask.status).toBe('reopened');
      expect(savedSubtask.notes).toContain('Reopened: Reopened via CLI command');
      expect(savedSubtask.completedAt).toBeUndefined();
    });

    it('should reset iterations for subtasks', async () => {
      const subtask = createSampleSubtask('ST-001-001-001', 'TK-001-001', 'failed');
      expect(subtask.iterations.length).toBe(1);
      mockPrdManager.findItem.mockResolvedValue(subtask);
      const prd = createSamplePRD();
      prd.phases.push(createSamplePhase('PH-001', 'passed'));
      prd.phases[0]!.tasks.push(createSampleTask('TK-001-001', 'PH-001', 'passed'));
      prd.phases[0]!.tasks[0]!.subtasks.push(subtask);
      mockPrdManager.load.mockResolvedValue(prd);

      await reopenAction('ST-001-001-001', {});

      expect(mockPrdManager.save).toHaveBeenCalled();
      const savedPrd = (mockPrdManager.save as ReturnType<typeof vi.fn>).mock.calls[0]![0] as PRD;
      const savedSubtask = savedPrd.phases[0]!.tasks[0]!.subtasks[0]!;
      expect(savedSubtask.iterations).toEqual([]);
    });

    it('should not reset iterations for tasks or phases', async () => {
      const task = createSampleTask('TK-001-001', 'PH-001', 'failed');
      mockPrdManager.findItem.mockResolvedValue(task);
      const prd = createSamplePRD();
      prd.phases.push(createSamplePhase('PH-001', 'passed'));
      prd.phases[0]!.tasks.push(task);
      mockPrdManager.load.mockResolvedValue(prd);

      await reopenAction('TK-001-001', {});

      expect(mockPrdManager.save).toHaveBeenCalled();
      // Tasks don't have iterations, so nothing to check
    });
  });

  describe('evidence clearing', () => {
    it('should clear evidence when --clear-evidence flag is provided', async () => {
      const subtask = createSampleSubtask('ST-001-001-001', 'TK-001-001', 'failed');
      mockPrdManager.findItem.mockResolvedValue(subtask);
      const prd = createSamplePRD();
      prd.phases.push(createSamplePhase('PH-001', 'passed'));
      prd.phases[0]!.tasks.push(createSampleTask('TK-001-001', 'PH-001', 'passed'));
      prd.phases[0]!.tasks[0]!.subtasks.push(subtask);
      mockPrdManager.load.mockResolvedValue(prd);
      
      const evidence = [
        { type: 'log' as const, path: '/test/evidence/test.log', summary: 'Test log', timestamp: new Date().toISOString(), itemId: 'ST-001-001-001' },
        { type: 'screenshot' as const, path: '/test/evidence/test.png', summary: 'Test screenshot', timestamp: new Date().toISOString(), itemId: 'ST-001-001-001' },
      ];
      mockEvidenceStore.getEvidence.mockResolvedValue(evidence);
      (fs.unlink as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await reopenAction('ST-001-001-001', { clearEvidence: true });

      expect(mockEvidenceStore.getEvidence).toHaveBeenCalledWith('ST-001-001-001');
      expect(fs.unlink).toHaveBeenCalledTimes(2);
      expect(fs.unlink).toHaveBeenCalledWith('/test/evidence/test.log');
      expect(fs.unlink).toHaveBeenCalledWith('/test/evidence/test.png');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Cleared 2 evidence file(s)'));
    });

    it('should not clear evidence when flag is not provided', async () => {
      const subtask = createSampleSubtask('ST-001-001-001', 'TK-001-001', 'failed');
      mockPrdManager.findItem.mockResolvedValue(subtask);
      const prd = createSamplePRD();
      prd.phases.push(createSamplePhase('PH-001', 'passed'));
      prd.phases[0]!.tasks.push(createSampleTask('TK-001-001', 'PH-001', 'passed'));
      prd.phases[0]!.tasks[0]!.subtasks.push(subtask);
      mockPrdManager.load.mockResolvedValue(prd);

      await reopenAction('ST-001-001-001', {});

      expect(mockEvidenceStore.getEvidence).not.toHaveBeenCalled();
      expect(fs.unlink).not.toHaveBeenCalled();
    });

    it('should handle evidence clearing errors gracefully', async () => {
      const subtask = createSampleSubtask('ST-001-001-001', 'TK-001-001', 'failed');
      mockPrdManager.findItem.mockResolvedValue(subtask);
      const prd = createSamplePRD();
      prd.phases.push(createSamplePhase('PH-001', 'passed'));
      prd.phases[0]!.tasks.push(createSampleTask('TK-001-001', 'PH-001', 'passed'));
      prd.phases[0]!.tasks[0]!.subtasks.push(subtask);
      mockPrdManager.load.mockResolvedValue(prd);
      
      const evidence = [
        { type: 'log' as const, path: '/test/evidence/test.log', summary: 'Test log', timestamp: new Date().toISOString(), itemId: 'ST-001-001-001' },
      ];
      mockEvidenceStore.getEvidence.mockResolvedValue(evidence);
      (fs.unlink as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('File not found'));

      await reopenAction('ST-001-001-001', { clearEvidence: true });

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to delete evidence file')
      );
      // Should still complete successfully
      expect(mockPrdManager.save).toHaveBeenCalled();
    });
  });

  describe('output messages', () => {
    it('should display confirmation message after reopening', async () => {
      const subtask = createSampleSubtask('ST-001-001-001', 'TK-001-001', 'failed');
      mockPrdManager.findItem.mockResolvedValue(subtask);
      const prd = createSamplePRD();
      prd.phases.push(createSamplePhase('PH-001', 'passed'));
      prd.phases[0]!.tasks.push(createSampleTask('TK-001-001', 'PH-001', 'passed'));
      prd.phases[0]!.tasks[0]!.subtasks.push(subtask);
      mockPrdManager.load.mockResolvedValue(prd);

      await reopenAction('ST-001-001-001', {});

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('has been reopened')
      );
    });

    it('should display evidence cleared message when clearing evidence', async () => {
      const subtask = createSampleSubtask('ST-001-001-001', 'TK-001-001', 'failed');
      mockPrdManager.findItem.mockResolvedValue(subtask);
      const prd = createSamplePRD();
      prd.phases.push(createSamplePhase('PH-001', 'passed'));
      prd.phases[0]!.tasks.push(createSampleTask('TK-001-001', 'PH-001', 'passed'));
      prd.phases[0]!.tasks[0]!.subtasks.push(subtask);
      mockPrdManager.load.mockResolvedValue(prd);
      mockEvidenceStore.getEvidence.mockResolvedValue([
        { type: 'log' as const, path: '/test/evidence/test.log', summary: 'Test log', timestamp: new Date().toISOString(), itemId: 'ST-001-001-001' },
      ]);
      (fs.unlink as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await reopenAction('ST-001-001-001', { clearEvidence: true });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Evidence files have been cleared')
      );
    });
  });

  describe('error handling', () => {
    it('should handle config loading errors', async () => {
      mockConfigManager.load.mockRejectedValue(new Error('Config error'));

      await reopenAction('ST-001-001-001', {});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error reopening item'),
        'Config error'
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle PRD loading errors', async () => {
      const subtask = createSampleSubtask('ST-001-001-001', 'TK-001-001', 'failed');
      mockPrdManager.findItem.mockResolvedValue(subtask);
      mockPrdManager.load.mockRejectedValue(new Error('PRD error'));

      await reopenAction('ST-001-001-001', {});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error reopening item'),
        'PRD error'
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
});
