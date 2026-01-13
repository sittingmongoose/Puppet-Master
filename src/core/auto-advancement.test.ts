/**
 * Tests for AutoAdvancement
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { AutoAdvancement } from './auto-advancement.js';
import { TierStateManager } from './tier-state-manager.js';
import { PrdManager } from '../memory/index.js';
import type { GateResult } from '../types/tiers.js';
import type { ItemStatus, Phase, PRD, Subtask, Task } from '../types/prd.js';

describe('auto-advancement', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createGateResult(passed: boolean): GateResult {
    return {
      passed,
      report: {
        gateId: 'gate-001',
        timestamp: new Date().toISOString(),
        verifiersRun: [],
        overallPassed: passed,
      },
      ...(passed ? {} : { failureReason: 'Gate failed' }),
    };
  }

  function createSubtask(now: string, id: string, taskId: string, status: ItemStatus): Subtask {
    return {
      id,
      taskId,
      title: id,
      description: id,
      status,
      priority: 1,
      acceptanceCriteria: [],
      testPlan: { commands: [], failFast: true },
      iterations: [],
      maxIterations: 3,
      createdAt: now,
      notes: '',
    };
  }

  function createTask(now: string, id: string, phaseId: string, status: ItemStatus, subtasks: Subtask[]): Task {
    return {
      id,
      phaseId,
      title: id,
      description: id,
      status,
      priority: 1,
      acceptanceCriteria: [],
      testPlan: { commands: [], failFast: true },
      subtasks,
      createdAt: now,
      notes: '',
    };
  }

  function createPhase(now: string, id: string, status: ItemStatus, tasks: Task[]): Phase {
    return {
      id,
      title: id,
      description: id,
      status,
      priority: 1,
      acceptanceCriteria: [],
      testPlan: { commands: [], failFast: true },
      tasks,
      createdAt: now,
      notes: '',
    };
  }

  function createPrd(now: string, phases: Phase[]): PRD {
    const tasks = phases.flatMap((phase) => phase.tasks);
    const subtasks = tasks.flatMap((task) => task.subtasks);

    return {
      project: 'TestProject',
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      branchName: 'main',
      description: 'Test PRD',
      phases,
      metadata: {
        totalPhases: phases.length,
        completedPhases: phases.filter((phase) => phase.status === 'passed').length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((task) => task.status === 'passed').length,
        totalSubtasks: subtasks.length,
        completedSubtasks: subtasks.filter((subtask) => subtask.status === 'passed').length,
      },
    };
  }

  async function withTierStateManager(
    prd: PRD,
    fn: (manager: TierStateManager) => Promise<void>
  ): Promise<void> {
    const testDir = `.puppet-master-test-auto-advancement-${Math.random().toString(16).slice(2)}`;
    const prdPath = join(testDir, 'prd.json');

    try {
      await fs.rm(testDir, { recursive: true, force: true });
      await fs.mkdir(testDir, { recursive: true });

      const prdManager = new PrdManager(prdPath);
      await prdManager.save(prd);

      const manager = new TierStateManager(prdManager);
      await manager.initialize();

      await fn(manager);
    } finally {
      try {
        await fs.rm(testDir, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
  }

  it('continues to next subtask', async () => {
    const now = new Date().toISOString();
    const taskId = 'TK-001-001';
    const phaseId = 'PH-001';

    const subtaskDone = createSubtask(now, 'ST-001-001-001', taskId, 'passed');
    const subtaskNext = createSubtask(now, 'ST-001-001-002', taskId, 'pending');
    const task = createTask(now, taskId, phaseId, 'running', [subtaskDone, subtaskNext]);
    const phase = createPhase(now, phaseId, 'running', [task]);

    await withTierStateManager(createPrd(now, [phase]), async (manager) => {
      manager.setCurrentSubtask(subtaskDone.id);

      const advancement = new AutoAdvancement(manager);
      const taskGateSpy = vi.spyOn(advancement, 'runTaskGate');
      const phaseGateSpy = vi.spyOn(advancement, 'runPhaseGate');

      const result = await advancement.checkAndAdvance();
      expect(result.action).toBe('continue');
      expect(result.next?.id).toBe(subtaskNext.id);
      expect(taskGateSpy).not.toHaveBeenCalled();
      expect(phaseGateSpy).not.toHaveBeenCalled();
    });
  });

  it('triggers task gate when subtasks complete', async () => {
    const now = new Date().toISOString();
    const phaseId = 'PH-001';

    const task1Id = 'TK-001-001';
    const task2Id = 'TK-001-002';

    const task1SubA = createSubtask(now, 'ST-001-001-001', task1Id, 'passed');
    const task1SubB = createSubtask(now, 'ST-001-001-002', task1Id, 'passed');
    const task1 = createTask(now, task1Id, phaseId, 'running', [task1SubA, task1SubB]);

    const task2Sub = createSubtask(now, 'ST-001-002-001', task2Id, 'pending');
    const task2 = createTask(now, task2Id, phaseId, 'pending', [task2Sub]);

    const phase = createPhase(now, phaseId, 'running', [task1, task2]);

    await withTierStateManager(createPrd(now, [phase]), async (manager) => {
      manager.setCurrentSubtask(task1SubB.id);

      const advancement = new AutoAdvancement(manager);
      const taskGateSpy = vi.spyOn(advancement, 'runTaskGate').mockResolvedValue(createGateResult(true));
      const phaseGateSpy = vi.spyOn(advancement, 'runPhaseGate');

      const result = await advancement.checkAndAdvance();
      expect(taskGateSpy).toHaveBeenCalledTimes(1);
      expect(taskGateSpy.mock.calls[0]?.[0]?.id).toBe(task1Id);
      expect(phaseGateSpy).not.toHaveBeenCalled();
      expect(result.action).toBe('advance_task');
    });
  });

  it('advances to next task on task gate pass', async () => {
    const now = new Date().toISOString();
    const phaseId = 'PH-001';

    const task1Id = 'TK-001-001';
    const task2Id = 'TK-001-002';

    const task1Sub = createSubtask(now, 'ST-001-001-001', task1Id, 'passed');
    const task1 = createTask(now, task1Id, phaseId, 'running', [task1Sub]);

    const task2Sub = createSubtask(now, 'ST-001-002-001', task2Id, 'pending');
    const task2 = createTask(now, task2Id, phaseId, 'pending', [task2Sub]);

    const phase = createPhase(now, phaseId, 'running', [task1, task2]);

    await withTierStateManager(createPrd(now, [phase]), async (manager) => {
      manager.setCurrentSubtask(task1Sub.id);

      const advancement = new AutoAdvancement(manager);
      vi.spyOn(advancement, 'runTaskGate').mockResolvedValue(createGateResult(true));

      const result = await advancement.checkAndAdvance();
      expect(result.action).toBe('advance_task');
      expect(result.next?.id).toBe(task2Id);
    });
  });

  it('triggers phase gate when tasks complete', async () => {
    const now = new Date().toISOString();

    const phase1Id = 'PH-001';
    const phase2Id = 'PH-002';

    const task1Id = 'TK-001-001';
    const subtask1Id = 'ST-001-001-001';

    const task = createTask(now, task1Id, phase1Id, 'running', [
      createSubtask(now, subtask1Id, task1Id, 'passed'),
    ]);

    const phase1 = createPhase(now, phase1Id, 'running', [task]);
    const phase2 = createPhase(now, phase2Id, 'pending', [
      createTask(now, 'TK-002-001', phase2Id, 'pending', [
        createSubtask(now, 'ST-002-001-001', 'TK-002-001', 'pending'),
      ]),
    ]);

    await withTierStateManager(createPrd(now, [phase1, phase2]), async (manager) => {
      manager.setCurrentSubtask(subtask1Id);

      const advancement = new AutoAdvancement(manager);
      vi.spyOn(advancement, 'runTaskGate').mockResolvedValue(createGateResult(true));
      const phaseGateSpy = vi.spyOn(advancement, 'runPhaseGate').mockResolvedValue(createGateResult(true));

      const result = await advancement.checkAndAdvance();
      expect(phaseGateSpy).toHaveBeenCalledTimes(1);
      expect(phaseGateSpy.mock.calls[0]?.[0]?.id).toBe(phase1Id);
      expect(result.action).toBe('advance_phase');
      expect(result.next?.id).toBe(phase2Id);
    });
  });

  it('returns complete when all phases done', async () => {
    const now = new Date().toISOString();
    const phaseId = 'PH-001';
    const taskId = 'TK-001-001';
    const subtaskId = 'ST-001-001-001';

    const phase = createPhase(now, phaseId, 'running', [
      createTask(now, taskId, phaseId, 'running', [createSubtask(now, subtaskId, taskId, 'passed')]),
    ]);

    await withTierStateManager(createPrd(now, [phase]), async (manager) => {
      manager.setCurrentSubtask(subtaskId);

      const advancement = new AutoAdvancement(manager);
      vi.spyOn(advancement, 'runTaskGate').mockResolvedValue(createGateResult(true));
      vi.spyOn(advancement, 'runPhaseGate').mockResolvedValue(createGateResult(true));

      const result = await advancement.checkAndAdvance();
      expect(result.action).toBe('complete');
    });
  });

  it('handles phase gate failure', async () => {
    const now = new Date().toISOString();
    const phaseId = 'PH-001';
    const taskId = 'TK-001-001';
    const subtaskId = 'ST-001-001-001';

    const phase = createPhase(now, phaseId, 'running', [
      createTask(now, taskId, phaseId, 'running', [createSubtask(now, subtaskId, taskId, 'passed')]),
    ]);

    await withTierStateManager(createPrd(now, [phase]), async (manager) => {
      manager.setCurrentSubtask(subtaskId);

      const advancement = new AutoAdvancement(manager);
      vi.spyOn(advancement, 'runTaskGate').mockResolvedValue(createGateResult(true));
      vi.spyOn(advancement, 'runPhaseGate').mockResolvedValue(createGateResult(false));

      const result = await advancement.checkAndAdvance();
      expect(result.action).toBe('phase_gate_failed');
      expect(result.gate?.passed).toBe(false);
    });
  });

  it('handles task gate failure', async () => {
    const now = new Date().toISOString();
    const phaseId = 'PH-001';
    const taskId = 'TK-001-001';
    const subtaskId = 'ST-001-001-001';

    const phase = createPhase(now, phaseId, 'running', [
      createTask(now, taskId, phaseId, 'running', [createSubtask(now, subtaskId, taskId, 'passed')]),
    ]);

    await withTierStateManager(createPrd(now, [phase]), async (manager) => {
      manager.setCurrentSubtask(subtaskId);

      const advancement = new AutoAdvancement(manager);
      vi.spyOn(advancement, 'runTaskGate').mockResolvedValue(createGateResult(false));
      const phaseGateSpy = vi.spyOn(advancement, 'runPhaseGate');

      const result = await advancement.checkAndAdvance();
      expect(result.action).toBe('task_gate_failed');
      expect(result.gate?.passed).toBe(false);
      expect(phaseGateSpy).not.toHaveBeenCalled();
    });
  });

  it('does not report complete when no current selection and failures exist', async () => {
    const now = new Date().toISOString();
    const phaseId = 'PH-001';
    const taskId = 'TK-001-001';
    const subtaskId = 'ST-001-001-001';

    const phase = createPhase(now, phaseId, 'running', [
      createTask(now, taskId, phaseId, 'running', [createSubtask(now, subtaskId, taskId, 'failed')]),
    ]);

    await withTierStateManager(createPrd(now, [phase]), async (manager) => {
      expect(manager.getCurrentSubtask()).toBeNull();
      expect(manager.getCurrentTask()).toBeNull();
      expect(manager.getCurrentPhase()).toBeNull();

      const advancement = new AutoAdvancement(manager);
      const result = await advancement.checkAndAdvance();
      expect(result.action).toBe('continue');
      expect(result.next?.id).toBe(subtaskId);
    });
  });
});
