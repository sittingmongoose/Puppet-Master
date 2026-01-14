/**
 * Verification Integration Tests
 * 
 * Comprehensive tests for VerificationIntegration class.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VerificationIntegration } from './verification-integration.js';
import { GateRunner, VerifierRegistry } from './gate-runner.js';
import { TierStateManager } from '../core/tier-state-manager.js';
import { EvidenceStore } from '../memory/evidence-store.js';
import { PrdManager } from '../memory/index.js';
import { TierNode } from '../core/tier-node.js';
import type { GateReport, GateResult, Criterion } from '../types/tiers.js';
import type { PRD, Phase, Task, Subtask } from '../types/prd.js';
import { tmpdir } from 'os';
import { join } from 'path';

describe('VerificationIntegration', () => {
  let integration: VerificationIntegration;
  let gateRunner: GateRunner;
  let tierStateManager: TierStateManager;
  let evidenceStore: EvidenceStore;
  let prdManager: PrdManager;
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `verification-integration-test-${Date.now()}`);
    evidenceStore = new EvidenceStore(join(testDir, 'evidence'));
    await evidenceStore.initialize();

    const verifierRegistry = new VerifierRegistry();
    gateRunner = new GateRunner(verifierRegistry, evidenceStore);

    prdManager = new PrdManager(join(testDir, 'prd.json'));
    tierStateManager = new TierStateManager(prdManager);

    integration = new VerificationIntegration(
      gateRunner,
      tierStateManager,
      evidenceStore
    );
  });

  function createTestPRD(): PRD {
    const now = new Date().toISOString();
    const subtask: Subtask = {
      id: 'ST-001-001-001',
      taskId: 'TK-001-001',
      title: 'Test Subtask',
      description: 'Test',
      status: 'passed',
      priority: 1,
      acceptanceCriteria: [],
      testPlan: { commands: [], failFast: true },
      iterations: [],
      maxIterations: 3,
      createdAt: now,
      notes: '',
    };

    const task: Task = {
      id: 'TK-001-001',
      phaseId: 'PH-001',
      title: 'Test Task',
      description: 'Test',
      status: 'gating',
      priority: 1,
      acceptanceCriteria: [
        {
          id: 'ac-1',
          description: 'File exists',
          type: 'file_exists',
          target: 'test.txt',
        },
      ],
      testPlan: {
        commands: [
          {
            command: 'npm',
            args: ['test'],
            workingDirectory: '/test',
            timeout: 5000,
          },
        ],
        failFast: true,
      },
      subtasks: [subtask],
      createdAt: now,
      notes: '',
    };

    const phase: Phase = {
      id: 'PH-001',
      title: 'Test Phase',
      description: 'Test',
      status: 'gating',
      priority: 1,
      acceptanceCriteria: [
        {
          id: 'ac-1',
          description: 'All tasks passed',
          type: 'ai',
          target: 'phase',
        },
      ],
      testPlan: { commands: [], failFast: true },
      tasks: [task],
      createdAt: now,
      notes: '',
    };

    return {
      project: 'TestProject',
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      branchName: 'main',
      description: 'Test PRD',
      phases: [phase],
      metadata: {
        totalPhases: 1,
        completedPhases: 0,
        totalTasks: 1,
        completedTasks: 0,
        totalSubtasks: 1,
        completedSubtasks: 1,
      },
    };
  }

  async function createTierNode(id: string): Promise<TierNode> {
    const prd = createTestPRD();
    await prdManager.save(prd);
    await tierStateManager.initialize();

    const root = tierStateManager.getRoot();
    return root.findDescendant(id) ?? root;
  }

  describe('runTaskGate', () => {
    it('should collect criteria from task acceptanceCriteria', async () => {
      const task = await createTierNode('TK-001-001');
      const runGateSpy = vi.spyOn(gateRunner, 'runGate');

      const mockReport: GateReport = {
        gateId: 'task-gate-TK-001-001',
        timestamp: new Date().toISOString(),
        verifiersRun: [],
        overallPassed: true,
        summary: 'Gate passed',
      };

      runGateSpy.mockResolvedValue(mockReport);

      const result = await integration.runTaskGate(task);

      expect(runGateSpy).toHaveBeenCalledWith(
        'task-gate-TK-001-001',
        expect.arrayContaining([
          expect.objectContaining({
            id: 'ac-1',
            type: 'file_exists',
            target: 'test.txt',
          }),
        ])
      );

      expect(result.passed).toBe(true);
      expect(result.report).toEqual(mockReport);
    });

    it('should convert testPlan commands to CommandCriterion', async () => {
      const task = await createTierNode('TK-001-001');
      const runGateSpy = vi.spyOn(gateRunner, 'runGate');

      const mockReport: GateReport = {
        gateId: 'task-gate-TK-001-001',
        timestamp: new Date().toISOString(),
        verifiersRun: [],
        overallPassed: true,
        summary: 'Gate passed',
      };

      runGateSpy.mockResolvedValue(mockReport);

      await integration.runTaskGate(task);

      const criteria = runGateSpy.mock.calls[0]?.[1] as Criterion[];
      const commandCriteria = criteria.filter((c) => c.type === 'command');

      expect(commandCriteria).toHaveLength(1);
      expect(commandCriteria[0]).toMatchObject({
        id: 'command-0',
        description: 'Run test command: npm',
        type: 'command',
        target: 'npm',
        options: {
          args: ['test'],
          cwd: '/test',
          timeout: 5000,
          expectedExitCode: 0,
        },
      });
    });

    it('should return GateResult with correct structure', async () => {
      const task = await createTierNode('TK-001-001');
      const mockReport: GateReport = {
        gateId: 'task-gate-TK-001-001',
        timestamp: new Date().toISOString(),
        verifiersRun: [],
        overallPassed: true,
        summary: 'Gate passed',
      };

      vi.spyOn(gateRunner, 'runGate').mockResolvedValue(mockReport);

      const result = await integration.runTaskGate(task);

      expect(result).toMatchObject({
        passed: true,
        report: mockReport,
        failureReason: undefined,
      });
    });

    it('should include failureReason when gate fails', async () => {
      const task = await createTierNode('TK-001-001');
      const mockReport: GateReport = {
        gateId: 'task-gate-TK-001-001',
        timestamp: new Date().toISOString(),
        verifiersRun: [
          {
            type: 'file_exists',
            target: 'test.txt',
            passed: false,
            summary: 'File not found',
            error: 'ENOENT',
            durationMs: 10,
          },
        ],
        overallPassed: false,
        failureType: 'minor',
        summary: 'Gate failed',
      };

      vi.spyOn(gateRunner, 'runGate').mockResolvedValue(mockReport);

      const result = await integration.runTaskGate(task);

      expect(result.passed).toBe(false);
      expect(result.failureReason).toBeDefined();
      expect(result.failureReason).toContain('file_exists');
    });
  });

  describe('runPhaseGate', () => {
    it('should collect criteria from phase acceptanceCriteria', async () => {
      const phase = await createTierNode('PH-001');
      const runGateSpy = vi.spyOn(gateRunner, 'runGate');

      const mockReport: GateReport = {
        gateId: 'phase-gate-PH-001',
        timestamp: new Date().toISOString(),
        verifiersRun: [],
        overallPassed: true,
        summary: 'Gate passed',
      };

      runGateSpy.mockResolvedValue(mockReport);

      const result = await integration.runPhaseGate(phase);

      expect(runGateSpy).toHaveBeenCalledWith(
        'phase-gate-PH-001',
        expect.arrayContaining([
          expect.objectContaining({
            id: 'ac-1',
            type: 'ai',
            target: 'phase',
          }),
        ])
      );

      expect(result.passed).toBe(true);
    });

    it('should include aggregate check for child tasks', async () => {
      const phase = await createTierNode('PH-001');
      const runGateSpy = vi.spyOn(gateRunner, 'runGate');

      const mockReport: GateReport = {
        gateId: 'phase-gate-PH-001',
        timestamp: new Date().toISOString(),
        verifiersRun: [],
        overallPassed: true,
        summary: 'Gate passed',
      };

      runGateSpy.mockResolvedValue(mockReport);

      await integration.runPhaseGate(phase);

      const criteria = runGateSpy.mock.calls[0]?.[1] as Criterion[];
      const aggregateCheck = criteria.find((c) => c.id === 'aggregate-check-all-tasks-passed');

      expect(aggregateCheck).toBeDefined();
      expect(aggregateCheck?.type).toBe('command');
    });

    it('should not include aggregate check if phase has no children', async () => {
      const prd = createTestPRD();
      prd.phases[0]!.tasks = [];
      await prdManager.save(prd);
      await tierStateManager.initialize();

      const phase = tierStateManager.getRoot().findDescendant('PH-001')!;
      const runGateSpy = vi.spyOn(gateRunner, 'runGate');

      const mockReport: GateReport = {
        gateId: 'phase-gate-PH-001',
        timestamp: new Date().toISOString(),
        verifiersRun: [],
        overallPassed: true,
        summary: 'Gate passed',
      };

      runGateSpy.mockResolvedValue(mockReport);

      await integration.runPhaseGate(phase);

      const criteria = runGateSpy.mock.calls[0]?.[1] as Criterion[];
      const aggregateCheck = criteria.find((c) => c.id === 'aggregate-check-all-tasks-passed');

      expect(aggregateCheck).toBeUndefined();
    });
  });

  describe('handleGateResult', () => {
    it('should transition to PASSED state when gate passes', async () => {
      const task = await createTierNode('TK-001-001');
      const transitionSpy = vi.spyOn(tierStateManager, 'transitionTier');

      const result: GateResult = {
        passed: true,
        report: {
          gateId: 'task-gate-TK-001-001',
          timestamp: new Date().toISOString(),
          verifiersRun: [],
          overallPassed: true,
          summary: 'Gate passed',
        },
      };

      integration.handleGateResult(result, task);

      expect(transitionSpy).toHaveBeenCalledWith('TK-001-001', { type: 'GATE_PASSED' });
    });

    it('should transition to RUNNING state when gate fails with minor failure', async () => {
      const task = await createTierNode('TK-001-001');
      const transitionSpy = vi.spyOn(tierStateManager, 'transitionTier');

      const result: GateResult = {
        passed: false,
        report: {
          gateId: 'task-gate-TK-001-001',
          timestamp: new Date().toISOString(),
          verifiersRun: [
            {
              type: 'regex',
              target: 'test.txt',
              passed: false,
              summary: 'Pattern not found',
              durationMs: 10,
            },
          ],
          overallPassed: false,
          failureType: 'minor',
          summary: 'Gate failed (minor)',
        },
        failureReason: 'Failed verifiers: regex (test.txt)',
      };

      integration.handleGateResult(result, task);

      expect(transitionSpy).toHaveBeenCalledWith('TK-001-001', { type: 'GATE_FAILED_MINOR' });
    });

    it('should transition to ESCALATED state when gate fails with major failure', async () => {
      const task = await createTierNode('TK-001-001');
      const transitionSpy = vi.spyOn(tierStateManager, 'transitionTier');

      const result: GateResult = {
        passed: false,
        report: {
          gateId: 'task-gate-TK-001-001',
          timestamp: new Date().toISOString(),
          verifiersRun: [
            {
              type: 'browser_verify',
              target: 'test.html',
              passed: false,
              summary: 'Browser test failed',
              durationMs: 100,
            },
          ],
          overallPassed: false,
          failureType: 'major',
          summary: 'Gate failed (major)',
        },
        failureReason: 'Failed verifiers: browser_verify (test.html)',
      };

      integration.handleGateResult(result, task);

      expect(transitionSpy).toHaveBeenCalledWith('TK-001-001', { type: 'GATE_FAILED_MAJOR' });
    });

    it('should default to minor failure when failureType is undefined', async () => {
      const task = await createTierNode('TK-001-001');
      const transitionSpy = vi.spyOn(tierStateManager, 'transitionTier');

      const result: GateResult = {
        passed: false,
        report: {
          gateId: 'task-gate-TK-001-001',
          timestamp: new Date().toISOString(),
          verifiersRun: [
            {
              type: 'command',
              target: 'npm test',
              passed: false,
              summary: 'Command failed',
              durationMs: 10,
            },
          ],
          overallPassed: false,
          // failureType is undefined
          summary: 'Gate failed',
        },
        failureReason: 'Failed verifiers: command (npm test)',
      };

      integration.handleGateResult(result, task);

      expect(transitionSpy).toHaveBeenCalledWith('TK-001-001', { type: 'GATE_FAILED_MINOR' });
    });
  });

  describe('runSubtaskVerification', () => {
    it('should run verification for subtask and return verifier results', async () => {
      const subtask = await createTierNode('ST-001-001-001');
      const runGateSpy = vi.spyOn(gateRunner, 'runGate');

      const mockReport: GateReport = {
        gateId: 'subtask-gate-ST-001-001-001',
        timestamp: new Date().toISOString(),
        verifiersRun: [
          {
            type: 'file_exists',
            target: 'test.txt',
            passed: true,
            summary: 'File exists',
            durationMs: 5,
          },
        ],
        overallPassed: true,
        summary: 'Verification passed',
      };

      runGateSpy.mockResolvedValue(mockReport);

      const results = await integration.runSubtaskVerification(subtask);

      expect(runGateSpy).toHaveBeenCalledWith(
        'subtask-gate-ST-001-001-001',
        expect.any(Array)
      );

      expect(results).toEqual(mockReport.verifiersRun);
    });
  });

  describe('criteria collection', () => {
    it('should handle empty acceptanceCriteria', async () => {
      const prd = createTestPRD();
      prd.phases[0]!.tasks[0]!.acceptanceCriteria = [];
      prd.phases[0]!.tasks[0]!.testPlan.commands = [];
      await prdManager.save(prd);
      await tierStateManager.initialize();

      const task = tierStateManager.getRoot().findDescendant('TK-001-001')!;
      const runGateSpy = vi.spyOn(gateRunner, 'runGate');

      const mockReport: GateReport = {
        gateId: 'task-gate-TK-001-001',
        timestamp: new Date().toISOString(),
        verifiersRun: [],
        overallPassed: true,
        summary: 'Gate passed',
      };

      runGateSpy.mockResolvedValue(mockReport);

      await integration.runTaskGate(task);

      const criteria = runGateSpy.mock.calls[0]?.[1] as Criterion[];
      expect(criteria).toHaveLength(0);
    });

    it('should handle multiple test commands', async () => {
      const prd = createTestPRD();
      prd.phases[0]!.tasks[0]!.testPlan.commands = [
        { command: 'npm', args: ['test'] },
        { command: 'npm', args: ['lint'] },
        { command: 'npm', args: ['build'] },
      ];
      await prdManager.save(prd);
      await tierStateManager.initialize();

      const task = tierStateManager.getRoot().findDescendant('TK-001-001')!;
      const runGateSpy = vi.spyOn(gateRunner, 'runGate');

      const mockReport: GateReport = {
        gateId: 'task-gate-TK-001-001',
        timestamp: new Date().toISOString(),
        verifiersRun: [],
        overallPassed: true,
        summary: 'Gate passed',
      };

      runGateSpy.mockResolvedValue(mockReport);

      await integration.runTaskGate(task);

      const criteria = runGateSpy.mock.calls[0]?.[1] as Criterion[];
      const commandCriteria = criteria.filter((c) => c.type === 'command');

      expect(commandCriteria).toHaveLength(3);
      expect(commandCriteria[0]?.id).toBe('command-0');
      expect(commandCriteria[1]?.id).toBe('command-1');
      expect(commandCriteria[2]?.id).toBe('command-2');
    });
  });
});
