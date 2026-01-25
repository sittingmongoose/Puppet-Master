/**
 * E2E Tests for State Persistence - Pause/Resume with Full Context Restoration
 *
 * Tests verify that iterationCount, lastError, and gateResult are correctly
 * restored after pause/resume and checkpoint restoration.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { StatePersistence } from './state-persistence.js';
import { OrchestratorStateMachine } from './orchestrator-state-machine.js';
import { TierStateMachine } from './tier-state-machine.js';
import { PrdManager } from '../memory/index.js';
import type { GateResult } from '../types/tiers.js';

describe('state-persistence E2E - pause/resume with full context restoration', () => {
  const testDir = '.puppet-master-test-e2e';
  const prdPath = join(testDir, 'prd.json');
  const checkpointDir = join(testDir, 'checkpoints');
  let prdManager: PrdManager;
  let persistence: StatePersistence;

  beforeEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore if doesn't exist
    }
    await fs.mkdir(testDir, { recursive: true });

    prdManager = new PrdManager(prdPath);
    persistence = new StatePersistence(prdManager, checkpointDir);

    // Create minimal PRD structure for testing
    const prd = await prdManager.load();
    prd.phases = [
      {
        id: 'PH-001',
        title: 'Test Phase',
        description: 'Test phase for E2E',
        status: 'pending',
        priority: 1,
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: true },
        tasks: [
          {
            id: 'TK-001-001',
            phaseId: 'PH-001',
            title: 'Test Task',
            description: 'Test task',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [],
            testPlan: { commands: [], failFast: true },
            subtasks: [
              {
                id: 'ST-001-001-001',
                taskId: 'TK-001-001',
                title: 'Test Subtask',
                description: 'Test subtask',
                status: 'pending',
                priority: 1,
                acceptanceCriteria: [],
                testPlan: { commands: [], failFast: true },
                iterations: [],
                maxIterations: 5,
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
    ];
    await prdManager.save(prd);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore errors
    }
  });

  it('restores iterationCount after pause → checkpoint → resume', async () => {
    // Step 1: Create tier machine and simulate 3 failed iterations
    const orchestrator = new OrchestratorStateMachine();
    orchestrator.send({ type: 'INIT' });
    orchestrator.send({ type: 'START' });

    const tierMachines = new Map<string, TierStateMachine>();
    const subtaskMachine = new TierStateMachine({
      tierType: 'subtask',
      itemId: 'ST-001-001-001',
      maxIterations: 5,
    });

    // Transition to running state
    subtaskMachine.send({ type: 'TIER_SELECTED' });
    subtaskMachine.send({ type: 'PLAN_APPROVED' });

    // Simulate 3 failed iterations (with proper state transitions)
    subtaskMachine.send({ type: 'ITERATION_FAILED', error: 'First failure' });
    expect(subtaskMachine.getIterationCount()).toBe(1);
    expect(subtaskMachine.getCurrentState()).toBe('retrying');

    subtaskMachine.send({ type: 'NEW_ATTEMPT' }); // Back to running
    subtaskMachine.send({ type: 'ITERATION_FAILED', error: 'Second failure' });
    expect(subtaskMachine.getIterationCount()).toBe(2);

    subtaskMachine.send({ type: 'NEW_ATTEMPT' }); // Back to running
    subtaskMachine.send({ type: 'ITERATION_FAILED', error: 'Third failure' });

    expect(subtaskMachine.getIterationCount()).toBe(3);
    expect(subtaskMachine.getCurrentState()).toBe('retrying');

    tierMachines.set('ST-001-001-001', subtaskMachine);

    // Step 2: Save state and create checkpoint (simulating pause)
    await persistence.saveState(orchestrator, tierMachines);
    await persistence.createCheckpoint('pause-after-3-iterations');

    // Step 3: Restore from checkpoint (simulating resume in new process)
    const checkpointState = await persistence.restoreCheckpoint('pause-after-3-iterations');
    expect(checkpointState).not.toBeNull();

    const { tiers: restoredTiers } = await persistence.restoreStateMachines(checkpointState!);

    // Step 4: Verify iterationCount is restored correctly
    const restoredSubtask = restoredTiers.get('ST-001-001-001');
    expect(restoredSubtask).toBeDefined();
    expect(restoredSubtask!.getIterationCount()).toBe(3);
    expect(restoredSubtask!.getCurrentState()).toBe('retrying');

    // Step 5: Verify we can continue from iteration 4 (not restart at 0)
    const context = restoredSubtask!.getContext();
    expect(context.iterationCount).toBe(3);
  });

  it('restores lastError after pause → checkpoint → resume', async () => {
    // Step 1: Create tier machine with error
    const orchestrator = new OrchestratorStateMachine();
    orchestrator.send({ type: 'INIT' });
    orchestrator.send({ type: 'START' });

    const tierMachines = new Map<string, TierStateMachine>();
    const subtaskMachine = new TierStateMachine({
      tierType: 'subtask',
      itemId: 'ST-001-001-001',
      maxIterations: 5,
    });

    subtaskMachine.send({ type: 'TIER_SELECTED' });
    subtaskMachine.send({ type: 'PLAN_APPROVED' });
    subtaskMachine.send({ type: 'ITERATION_FAILED', error: 'Critical error message' });

    const context = subtaskMachine.getContext();
    expect(context.lastError).toBe('Critical error message');

    tierMachines.set('ST-001-001-001', subtaskMachine);

    // Step 2: Save and checkpoint
    await persistence.saveState(orchestrator, tierMachines);
    await persistence.createCheckpoint('pause-with-error');

    // Step 3: Restore
    const checkpointState = await persistence.restoreCheckpoint('pause-with-error');
    const { tiers: restoredTiers } = await persistence.restoreStateMachines(checkpointState!);

    // Step 4: Verify lastError is restored
    const restoredSubtask = restoredTiers.get('ST-001-001-001');
    const restoredContext = restoredSubtask!.getContext();
    expect(restoredContext.lastError).toBe('Critical error message');
  });

  it('restores gateResult after pause → checkpoint → resume', async () => {
    // Step 1: Create tier machine with gate result
    const orchestrator = new OrchestratorStateMachine();
    orchestrator.send({ type: 'INIT' });
    orchestrator.send({ type: 'START' });

    const tierMachines = new Map<string, TierStateMachine>();
    const subtaskMachine = new TierStateMachine({
      tierType: 'subtask',
      itemId: 'ST-001-001-001',
      maxIterations: 5,
    });

    subtaskMachine.send({ type: 'TIER_SELECTED' });
    subtaskMachine.send({ type: 'PLAN_APPROVED' });
    subtaskMachine.send({ type: 'ITERATION_COMPLETE', success: true });

    // Manually set gateResult (in real code, this happens during gate execution)
    const gateResult: GateResult = {
      passed: false,
      report: {
        gateId: 'ST-001-001-001',
        timestamp: new Date().toISOString(),
        verifiersRun: [],
        overallPassed: false,
        failureType: 'minor',
        summary: 'Test failure',
      },
      failureReason: 'Test failure',
    };

    // To set gateResult, we need to simulate a gate failure
    subtaskMachine.send({ type: 'GATE_FAILED_MINOR' });

    // Now restore internal context to set the gateResult
    subtaskMachine.restoreInternalContext({ gateResult });

    const context = subtaskMachine.getContext();
    expect(context.gateResult).toEqual(gateResult);

    tierMachines.set('ST-001-001-001', subtaskMachine);

    // Step 2: Save and checkpoint
    await persistence.saveState(orchestrator, tierMachines);
    await persistence.createCheckpoint('pause-with-gate-result');

    // Step 3: Restore
    const checkpointState = await persistence.restoreCheckpoint('pause-with-gate-result');
    const { tiers: restoredTiers } = await persistence.restoreStateMachines(checkpointState!);

    // Step 4: Verify gateResult is restored
    const restoredSubtask = restoredTiers.get('ST-001-001-001');
    const restoredContext = restoredSubtask!.getContext();
    expect(restoredContext.gateResult).toEqual(gateResult);
  });

  it('respects maxIterations constraint when restoring iterationCount', async () => {
    // Step 1: Create tier machine with maxIterations=3 but somehow persisted count=5 (edge case)
    const orchestrator = new OrchestratorStateMachine();
    orchestrator.send({ type: 'INIT' });

    const tierMachines = new Map<string, TierStateMachine>();
    const subtaskMachine = new TierStateMachine({
      tierType: 'subtask',
      itemId: 'ST-001-001-001',
      maxIterations: 3,
    });

    subtaskMachine.send({ type: 'TIER_SELECTED' });
    subtaskMachine.send({ type: 'PLAN_APPROVED' });

    // Manually set an iteration count that exceeds maxIterations (simulating corrupted state)
    subtaskMachine.restoreInternalContext({ iterationCount: 10 });

    tierMachines.set('ST-001-001-001', subtaskMachine);

    // Step 2: Save and checkpoint
    await persistence.saveState(orchestrator, tierMachines);
    await persistence.createCheckpoint('pause-with-excessive-count');

    // Step 3: Restore
    const checkpointState = await persistence.restoreCheckpoint('pause-with-excessive-count');
    const { tiers: restoredTiers } = await persistence.restoreStateMachines(checkpointState!);

    // Step 4: Verify iterationCount is clamped to maxIterations
    const restoredSubtask = restoredTiers.get('ST-001-001-001');
    expect(restoredSubtask!.getIterationCount()).toBe(3); // Clamped to maxIterations
  });

  it('restores all context fields together in a complete pause/resume cycle', async () => {
    // Step 1: Create complex state with all fields populated
    const orchestrator = new OrchestratorStateMachine();
    orchestrator.send({ type: 'INIT' });
    orchestrator.send({ type: 'START' });

    const tierMachines = new Map<string, TierStateMachine>();
    const subtaskMachine = new TierStateMachine({
      tierType: 'subtask',
      itemId: 'ST-001-001-001',
      maxIterations: 5,
    });

    subtaskMachine.send({ type: 'TIER_SELECTED' });
    subtaskMachine.send({ type: 'PLAN_APPROVED' });
    subtaskMachine.send({ type: 'ITERATION_FAILED', error: 'Error 1' });
    subtaskMachine.send({ type: 'NEW_ATTEMPT' }); // Back to running
    subtaskMachine.send({ type: 'ITERATION_FAILED', error: 'Error 2' });

    const gateResult: GateResult = {
      passed: false,
      report: {
        gateId: 'ST-001-001-001',
        timestamp: new Date().toISOString(),
        verifiersRun: [],
        overallPassed: false,
        summary: 'Gate failed',
      },
    };
    subtaskMachine.restoreInternalContext({ gateResult });

    const beforeContext = subtaskMachine.getContext();
    expect(beforeContext.iterationCount).toBe(2);
    expect(beforeContext.lastError).toBe('Error 2');
    expect(beforeContext.gateResult).toEqual(gateResult);

    tierMachines.set('ST-001-001-001', subtaskMachine);

    // Step 2: Pause via state machine
    orchestrator.send({ type: 'PAUSE', reason: 'User requested pause' });
    await persistence.saveState(orchestrator, tierMachines);
    await persistence.createCheckpoint('complete-pause');

    // Step 3: Resume via state machine
    const checkpointState = await persistence.restoreCheckpoint('complete-pause');
    const { orchestrator: restoredOrch, tiers: restoredTiers } =
      await persistence.restoreStateMachines(checkpointState!);

    // Step 4: Verify ALL context fields restored
    const restoredSubtask = restoredTiers.get('ST-001-001-001');
    const afterContext = restoredSubtask!.getContext();

    expect(afterContext.iterationCount).toBe(2);
    expect(afterContext.lastError).toBe('Error 2');
    expect(afterContext.gateResult).toEqual(gateResult);
    expect(afterContext.state).toBe('retrying');
    expect(afterContext.maxIterations).toBe(5);

    // Verify orchestrator state
    expect(restoredOrch.getCurrentState()).toBe('paused');
    expect(restoredOrch.getContext().pauseReason).toBe('User requested pause');
  });
});
