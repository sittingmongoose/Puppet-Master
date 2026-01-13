/**
 * Tests for TierStateManager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { TierStateManager } from './tier-state-manager.js';
import { PrdManager } from '../memory/index.js';
import type { PRD } from '../types/prd.js';

describe('tier-state-manager', () => {
  const testDir = '.puppet-master-test-tier-state-manager';
  const prdPath = join(testDir, 'prd.json');
  let prdManager: PrdManager;
  let manager: TierStateManager;

  function createSamplePrd(): PRD {
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
          description: 'Completed phase',
          status: 'passed',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [
            {
              id: 'TK-001-001',
              phaseId: 'PH-001',
              title: 'Task 1',
              description: 'Completed task',
              status: 'passed',
              priority: 1,
              acceptanceCriteria: [],
              testPlan: { commands: [], failFast: true },
              subtasks: [
                {
                  id: 'ST-001-001-001',
                  taskId: 'TK-001-001',
                  title: 'Subtask 1',
                  description: 'Completed subtask',
                  status: 'passed',
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
        {
          id: 'PH-002',
          title: 'Phase 2',
          description: 'Active phase',
          status: 'pending',
          priority: 2,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [
            {
              id: 'TK-002-001',
              phaseId: 'PH-002',
              title: 'Task 1',
              description: 'Active task',
              status: 'running',
              priority: 1,
              acceptanceCriteria: [],
              testPlan: { commands: [], failFast: true },
              subtasks: [
                {
                  id: 'ST-002-001-001',
                  taskId: 'TK-002-001',
                  title: 'Subtask A',
                  description: 'Pending subtask',
                  status: 'pending',
                  priority: 1,
                  acceptanceCriteria: [],
                  testPlan: { commands: [], failFast: true },
                  iterations: [],
                  maxIterations: 3,
                  createdAt: now,
                  notes: '',
                },
                {
                  id: 'ST-002-001-002',
                  taskId: 'TK-002-001',
                  title: 'Subtask B',
                  description: 'Failed subtask',
                  status: 'failed',
                  priority: 2,
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
        totalPhases: 2,
        completedPhases: 1,
        totalTasks: 2,
        completedTasks: 1,
        totalSubtasks: 3,
        completedSubtasks: 1,
      },
    };
  }

  beforeEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
    await fs.mkdir(testDir, { recursive: true });

    prdManager = new PrdManager(prdPath);
    await prdManager.save(createSamplePrd());

    manager = new TierStateManager(prdManager);
    await manager.initialize();
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it('initializes from PRD and indexes tiers', () => {
    const phases = manager.getAllPhases().map((node) => node.id);
    expect(phases).toEqual(['PH-001', 'PH-002']);

    expect(manager.getPhase('PH-001')?.id).toBe('PH-001');
    expect(manager.getTask('TK-002-001')?.id).toBe('TK-002-001');
    expect(manager.getSubtask('ST-002-001-001')?.id).toBe('ST-002-001-001');

    expect(manager.findNode('PH-002')?.id).toBe('PH-002');
  });

  it('sets current phase/task/subtask on initialize', () => {
    expect(manager.getCurrentPhase()?.id).toBe('PH-002');
    expect(manager.getCurrentTask()?.id).toBe('TK-002-001');
    expect(manager.getCurrentSubtask()?.id).toBe('ST-002-001-001');
  });

  it('supports setCurrentPhase/Task/Subtask', () => {
    manager.setCurrentPhase('PH-001');
    expect(manager.getCurrentPhase()?.id).toBe('PH-001');
    expect(manager.getCurrentTask()).toBeNull();
    expect(manager.getCurrentSubtask()).toBeNull();

    manager.setCurrentTask('TK-001-001');
    expect(manager.getCurrentPhase()?.id).toBe('PH-001');
    expect(manager.getCurrentTask()?.id).toBe('TK-001-001');
    expect(manager.getCurrentSubtask()).toBeNull();

    manager.setCurrentSubtask('ST-001-001-001');
    expect(manager.getCurrentPhase()?.id).toBe('PH-001');
    expect(manager.getCurrentTask()?.id).toBe('TK-001-001');
    expect(manager.getCurrentSubtask()?.id).toBe('ST-001-001-001');
  });

  it('finds next pending items', () => {
    const nextPhase = manager.getNextPendingPhase();
    expect(nextPhase?.id).toBe('PH-002');

    const nextTask = manager.getNextPendingTask(manager.getPhase('PH-002')!);
    expect(nextTask).toBeNull();

    const taskNode = manager.getTask('TK-002-001')!;
    const nextSubtask = manager.getNextPendingSubtask(taskNode);
    expect(nextSubtask?.id).toBe('ST-002-001-001');
  });

  it('transitions a tier node by ID', () => {
    const before = manager.getSubtask('ST-002-001-001')!;
    const other = manager.getSubtask('ST-002-001-002')!;

    expect(before.getState()).toBe('pending');
    expect(other.getState()).toBe('failed');

    const ok = manager.transitionTier('ST-002-001-001', { type: 'TIER_SELECTED' });
    expect(ok).toBe(true);
    expect(before.getState()).toBe('planning');
    expect(other.getState()).toBe('failed');

    const missing = manager.transitionTier('ST-999-999-999', { type: 'TIER_SELECTED' });
    expect(missing).toBe(false);
  });

  it('returns failed and completed items', () => {
    const failed = manager.getFailedItems().map((n) => n.id);
    expect(failed).toContain('ST-002-001-002');

    const completed = manager.getCompletedItems().map((n) => n.id);
    expect(completed).toContain('PH-001');
    expect(completed).toContain('TK-001-001');
    expect(completed).toContain('ST-001-001-001');
  });

  it('syncs tier state back to PRD', async () => {
    manager.transitionTier('ST-002-001-001', { type: 'TIER_SELECTED' });
    await manager.syncToPrd();

    const prd = await prdManager.load();
    const phase = prd.phases.find((p) => p.id === 'PH-002')!;
    const task = phase.tasks.find((t) => t.id === 'TK-002-001')!;
    const subtask = task.subtasks.find((s) => s.id === 'ST-002-001-001')!;

    expect(subtask.status).toBe('planning');
    expect(subtask.tierContext?.state).toBe('planning');
  });
});

