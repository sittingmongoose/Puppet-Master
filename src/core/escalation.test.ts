/**
 * Tests for Escalation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { getDefaultConfig } from '../config/default-config.js';
import { PrdManager } from '../memory/index.js';
import type { PRD } from '../types/prd.js';
import type { GateResult } from '../types/tiers.js';
import { Escalation } from './escalation.js';
import { TierStateManager } from './tier-state-manager.js';

describe('escalation', () => {
  const testDir = '.puppet-master-test-escalation';
  const prdPath = join(testDir, 'prd.json');
  let prdManager: PrdManager;
  let tierStateManager: TierStateManager;

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
          description: 'Phase description',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [
            {
              id: 'TK-001-001',
              phaseId: 'PH-001',
              title: 'Task 1',
              description: 'Task description',
              status: 'pending',
              priority: 1,
              acceptanceCriteria: [],
              testPlan: {
                commands: [{ command: 'npm', args: ['run', 'typecheck'] }],
                failFast: true,
              },
              subtasks: [
                {
                  id: 'ST-001-001-001',
                  taskId: 'TK-001-001',
                  title: 'Subtask 1',
                  description: 'Subtask description',
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

  function createGateFailure(failureReason: string): GateResult {
    const now = new Date().toISOString();
    return {
      passed: false,
      report: {
        gateId: 'gate-1',
        timestamp: now,
        verifiersRun: [],
        summary: failureReason,
        overallPassed: false,
      },
      failureReason,
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

    tierStateManager = new TierStateManager(prdManager);
    await tierStateManager.initialize();
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it('returns self-fix decision when enabled for minor failures', () => {
    const config = getDefaultConfig();
    config.memory.prdFile = prdPath;
    config.tiers.task.selfFix = true;

    const escalation = new Escalation(tierStateManager, config);
    const task = tierStateManager.getTask('TK-001-001')!;

    const decision = escalation.determineAction({
      tier: task,
      gateResult: createGateFailure('tests failing'),
      failureType: 'test_failure',
      failureCount: 0,
      maxAttempts: 3,
    });

    expect(decision.action).toBe('self_fix');
    expect(decision.selfFixInstructions).toContain('Investigate and fix');
  });

  it('rejects self-fix when disabled and returns kick-down for task-tier minor failures', () => {
    const config = getDefaultConfig();
    config.memory.prdFile = prdPath;
    config.tiers.task.selfFix = false;

    const escalation = new Escalation(tierStateManager, config);
    const task = tierStateManager.getTask('TK-001-001')!;

    const decision = escalation.determineAction({
      tier: task,
      gateResult: createGateFailure('acceptance mismatch'),
      failureType: 'acceptance',
      failureCount: 0,
      maxAttempts: 3,
    });

    expect(decision.action).toBe('kick_down');
    expect(decision.newSubtasks?.length).toBeGreaterThan(0);
  });

  it('executeSelfFix transitions gating -> running (retry on same tier)', async () => {
    const config = getDefaultConfig();
    config.memory.prdFile = prdPath;

    const escalation = new Escalation(tierStateManager, config);
    const task = tierStateManager.getTask('TK-001-001')!;

    task.stateMachine.send({ type: 'TIER_SELECTED' });
    task.stateMachine.send({ type: 'PLAN_APPROVED' });
    task.stateMachine.send({ type: 'ITERATION_COMPLETE', success: true });
    expect(task.getState()).toBe('gating');

    await escalation.executeSelfFix({ action: 'self_fix', reason: 'minor failure' }, task);
    expect(task.getState()).toBe('running');
  });

  it('executeKickDown creates new subtasks in the PRD', async () => {
    const config = getDefaultConfig();
    config.memory.prdFile = prdPath;
    config.tiers.task.selfFix = false;

    const escalation = new Escalation(tierStateManager, config);
    const taskBefore = tierStateManager.getTask('TK-001-001')!;

    const decision = escalation.determineAction({
      tier: taskBefore,
      gateResult: createGateFailure('tests failing'),
      failureType: 'test_failure',
      failureCount: 0,
      maxAttempts: 3,
    });

    expect(decision.action).toBe('kick_down');
    await escalation.executeKickDown(decision, taskBefore);

    const prd = await prdManager.load();
    const updatedTask = prd.phases[0].tasks[0];
    expect(updatedTask.subtasks.length).toBe(2);
    expect(updatedTask.subtasks.map((s) => s.id)).toContain('ST-001-001-002');

    const taskAfter = tierStateManager.getTask('TK-001-001')!;
    const subtaskIds = taskAfter.getChildren().map((child) => child.id);
    expect(subtaskIds).toContain('ST-001-001-002');
  });

  it('escalates when max attempts are exceeded', () => {
    const config = getDefaultConfig();
    config.memory.prdFile = prdPath;

    const escalation = new Escalation(tierStateManager, config);
    const task = tierStateManager.getTask('TK-001-001')!;

    const decision = escalation.determineAction({
      tier: task,
      gateResult: createGateFailure('still failing'),
      failureType: 'test_failure',
      failureCount: 3,
      maxAttempts: 3,
    });

    expect(decision.action).toBe('escalate');
    expect(decision.escalateTo).toBe('phase');
  });

  it('executeEscalate flags the higher tier as current selection', async () => {
    const config = getDefaultConfig();
    config.memory.prdFile = prdPath;

    const escalation = new Escalation(tierStateManager, config);
    const subtask = tierStateManager.getSubtask('ST-001-001-001')!;

    subtask.stateMachine.send({ type: 'TIER_SELECTED' });
    subtask.stateMachine.send({ type: 'PLAN_APPROVED' });
    subtask.stateMachine.send({ type: 'ITERATION_COMPLETE', success: true });
    expect(subtask.getState()).toBe('gating');

    const decision = escalation.determineAction({
      tier: subtask,
      gateResult: createGateFailure('repeated failures'),
      failureType: 'test_failure',
      failureCount: 2,
      maxAttempts: 2,
    });

    expect(decision.action).toBe('escalate');
    expect(decision.escalateTo).toBe('task');

    await escalation.executeEscalate(decision, subtask);
    expect(subtask.getState()).toBe('escalated');
    expect(tierStateManager.getCurrentTask()?.id).toBe('TK-001-001');
  });

  it('returns pause for timeout failures under attempt limits', () => {
    const config = getDefaultConfig();
    config.memory.prdFile = prdPath;

    const escalation = new Escalation(tierStateManager, config);
    const task = tierStateManager.getTask('TK-001-001')!;

    const decision = escalation.determineAction({
      tier: task,
      gateResult: createGateFailure('process stalled'),
      failureType: 'timeout',
      failureCount: 0,
      maxAttempts: 3,
    });

    expect(decision.action).toBe('pause');
  });

  it('uses escalation chain for test_failure: retry(2) -> self_fix(1) -> escalate(to task)', () => {
    const config = getDefaultConfig();
    config.memory.prdFile = prdPath;
    config.escalation = {
      chains: {
        testFailure: [
          { action: 'retry', maxAttempts: 2 },
          { action: 'self_fix', maxAttempts: 1 },
          { action: 'escalate', to: 'task' },
        ],
      },
    };

    const escalation = new Escalation(tierStateManager, config);
    const subtask = tierStateManager.getSubtask('ST-001-001-001')!;
    const gateResult = createGateFailure('tests failing');

    const d1 = escalation.determineAction({
      tier: subtask,
      gateResult,
      failureType: 'test_failure',
      failureCount: 0,
      maxAttempts: 10,
    });
    expect(d1.action).toBe('retry');
    expect(d1.reason).toContain('attempt 1/10');

    const d2 = escalation.determineAction({
      tier: subtask,
      gateResult,
      failureType: 'test_failure',
      failureCount: 1,
      maxAttempts: 10,
    });
    expect(d2.action).toBe('retry');
    expect(d2.reason).toContain('attempt 2/10');

    const d3 = escalation.determineAction({
      tier: subtask,
      gateResult,
      failureType: 'test_failure',
      failureCount: 2,
      maxAttempts: 10,
    });
    expect(d3.action).toBe('self_fix');
    expect(d3.selfFixInstructions).toContain('Investigate and fix');
    expect(d3.selfFixInstructions).toContain('ST-001-001-001');

    const d4 = escalation.determineAction({
      tier: subtask,
      gateResult,
      failureType: 'test_failure',
      failureCount: 3,
      maxAttempts: 10,
    });
    expect(d4.action).toBe('escalate');
    expect(d4.escalateTo).toBe('task');
    expect(d4.reason).toContain('Escalating by chain to task');
  });

  it('uses escalation chain for timeout: retry(1) -> pause(notify: true)', () => {
    const config = getDefaultConfig();
    config.memory.prdFile = prdPath;
    config.escalation = {
      chains: {
        timeout: [{ action: 'retry', maxAttempts: 1 }, { action: 'pause', notify: true }],
      },
    };

    const escalation = new Escalation(tierStateManager, config);
    const task = tierStateManager.getTask('TK-001-001')!;
    const gateResult = createGateFailure('process stalled');

    const d1 = escalation.determineAction({
      tier: task,
      gateResult,
      failureType: 'timeout',
      failureCount: 0,
      maxAttempts: 10,
    });
    expect(d1.action).toBe('retry');
    expect(d1.notify).toBe(false);

    const d2 = escalation.determineAction({
      tier: task,
      gateResult,
      failureType: 'timeout',
      failureCount: 1,
      maxAttempts: 10,
    });
    expect(d2.action).toBe('pause');
    expect(d2.notify).toBe(true);
    expect(d2.reason).toContain('Paused by escalation chain');
  });

  it('skips unsupported chain steps (kick_down on subtask) and selects the next supported step', () => {
    const config = getDefaultConfig();
    config.memory.prdFile = prdPath;
    config.escalation = {
      chains: {
        testFailure: [{ action: 'kick_down', maxAttempts: 1 }, { action: 'retry' }],
      },
    };

    const escalation = new Escalation(tierStateManager, config);
    const subtask = tierStateManager.getSubtask('ST-001-001-001')!;

    const decision = escalation.determineAction({
      tier: subtask,
      gateResult: createGateFailure('tests failing'),
      failureType: 'test_failure',
      failureCount: 0,
      maxAttempts: 3,
    });

    expect(decision.action).toBe('retry');
    expect(decision.newSubtasks).toBeUndefined();
    expect(decision.newTasks).toBeUndefined();
    expect(decision.reason).toContain('Retrying after test failure');
  });
});

