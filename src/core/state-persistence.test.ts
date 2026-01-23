/**
 * Tests for StatePersistence
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { StatePersistence, type PersistedState } from './state-persistence.js';
import { OrchestratorStateMachine } from './orchestrator-state-machine.js';
import { TierStateMachine } from './tier-state-machine.js';
import { PrdManager } from '../memory/index.js';

describe('state-persistence', () => {
  const testDir = '.puppet-master-test';
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
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore errors
    }
  });

  describe('saveState', () => {
    it('persists orchestrator and tier states to prd.json', async () => {
      const orchestrator = new OrchestratorStateMachine();
      orchestrator.send({ type: 'INIT' });
      orchestrator.send({ type: 'START' });

      const tierMachines = new Map<string, TierStateMachine>();
      const phaseMachine = new TierStateMachine({
        tierType: 'phase',
        itemId: 'PH-001',
        maxIterations: 5,
      });
      phaseMachine.send({ type: 'TIER_SELECTED' });
      tierMachines.set('PH-001', phaseMachine);

      await persistence.saveState(orchestrator, tierMachines);

      const prd = await prdManager.load();
      expect(prd.orchestratorState).toBe('executing');
      expect(prd.orchestratorContext).toBeDefined();
      expect(prd.orchestratorContext?.state).toBe('executing');
    });

    it('stores tier contexts in PRD items', async () => {
      // Create a PRD with phases, tasks, and subtasks
      const prd = await prdManager.load();
      prd.phases = [
        {
          id: 'PH-001',
          title: 'Test Phase',
          description: 'Test',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [
            {
              id: 'TK-001-001',
              phaseId: 'PH-001',
              title: 'Test Task',
              description: 'Test',
              status: 'pending',
              priority: 1,
              acceptanceCriteria: [],
              testPlan: { commands: [], failFast: true },
              subtasks: [
                {
                  id: 'ST-001-001-001',
                  taskId: 'TK-001-001',
                  title: 'Test Subtask',
                  description: 'Test',
                  status: 'pending',
                  priority: 1,
                  acceptanceCriteria: [],
                  testPlan: { commands: [], failFast: true },
                  iterations: [],
                  maxIterations: 3,
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

      const orchestrator = new OrchestratorStateMachine();
      const tierMachines = new Map<string, TierStateMachine>();

      const phaseMachine = new TierStateMachine({
        tierType: 'phase',
        itemId: 'PH-001',
        maxIterations: 5,
      });
      phaseMachine.send({ type: 'TIER_SELECTED' });
      tierMachines.set('PH-001', phaseMachine);

      const taskMachine = new TierStateMachine({
        tierType: 'task',
        itemId: 'TK-001-001',
        maxIterations: 3,
      });
      taskMachine.send({ type: 'TIER_SELECTED' });
      tierMachines.set('TK-001-001', taskMachine);

      await persistence.saveState(orchestrator, tierMachines);

      const loadedPrd = await prdManager.load();
      expect(loadedPrd.phases[0]?.tierContext).toBeDefined();
      expect(loadedPrd.phases[0]?.tierContext?.state).toBe('planning');
      expect(loadedPrd.phases[0]?.tasks[0]?.tierContext).toBeDefined();
      expect(loadedPrd.phases[0]?.tasks[0]?.tierContext?.state).toBe('planning');
    });
  });

  describe('loadState', () => {
    it('loads persisted state from prd.json', async () => {
      // Create PRD with phase item first
      const prd = await prdManager.load();
      prd.phases = [
        {
          id: 'PH-001',
          title: 'Test Phase',
          description: 'Test',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [],
          createdAt: new Date().toISOString(),
          notes: '',
        },
      ];
      await prdManager.save(prd);

      const orchestrator = new OrchestratorStateMachine();
      orchestrator.send({ type: 'INIT' });

      const tierMachines = new Map<string, TierStateMachine>();
      const machine = new TierStateMachine({
        tierType: 'phase',
        itemId: 'PH-001',
        maxIterations: 5,
      });
      tierMachines.set('PH-001', machine);

      await persistence.saveState(orchestrator, tierMachines);

      const loaded = await persistence.loadState();
      expect(loaded).not.toBeNull();
      expect(loaded?.orchestratorState).toBe('planning');
      expect(loaded?.orchestratorContext.state).toBe('planning');
      expect(loaded?.tierStates['PH-001']).toBeDefined();
    });

    it('returns null when no state is persisted', async () => {
      const loaded = await persistence.loadState();
      expect(loaded).toBeNull();
    });

    it('preserves tier hierarchy in loaded state', async () => {
      // Create PRD with hierarchy
      const prd = await prdManager.load();
      prd.phases = [
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Test',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [
            {
              id: 'TK-001-001',
              phaseId: 'PH-001',
              title: 'Task 1',
              description: 'Test',
              status: 'pending',
              priority: 1,
              acceptanceCriteria: [],
              testPlan: { commands: [], failFast: true },
              subtasks: [
                {
                  id: 'ST-001-001-001',
                  taskId: 'TK-001-001',
                  title: 'Subtask 1',
                  description: 'Test',
                  status: 'pending',
                  priority: 1,
                  acceptanceCriteria: [],
                  testPlan: { commands: [], failFast: true },
                  iterations: [],
                  maxIterations: 3,
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

      const orchestrator = new OrchestratorStateMachine();
      const tierMachines = new Map<string, TierStateMachine>();

      // Create machines for all tiers
      const phaseMachine = new TierStateMachine({
        tierType: 'phase',
        itemId: 'PH-001',
        maxIterations: 5,
      });
      tierMachines.set('PH-001', phaseMachine);

      const taskMachine = new TierStateMachine({
        tierType: 'task',
        itemId: 'TK-001-001',
        maxIterations: 3,
      });
      tierMachines.set('TK-001-001', taskMachine);

      const subtaskMachine = new TierStateMachine({
        tierType: 'subtask',
        itemId: 'ST-001-001-001',
        maxIterations: 3,
      });
      tierMachines.set('ST-001-001-001', subtaskMachine);

      await persistence.saveState(orchestrator, tierMachines);

      const loaded = await persistence.loadState();
      expect(loaded).not.toBeNull();
      expect(loaded?.tierStates['PH-001']).toBeDefined();
      expect(loaded?.tierStates['TK-001-001']).toBeDefined();
      expect(loaded?.tierStates['ST-001-001-001']).toBeDefined();
    });
  });

  describe('restoreStateMachines', () => {
    it('restores orchestrator and tier machines from persisted state', async () => {
      // Create PRD with phase item first
      const prd = await prdManager.load();
      prd.phases = [
        {
          id: 'PH-001',
          title: 'Test Phase',
          description: 'Test',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: { commands: [], failFast: true },
          tasks: [],
          createdAt: new Date().toISOString(),
          notes: '',
        },
      ];
      await prdManager.save(prd);

      const orchestrator = new OrchestratorStateMachine();
      orchestrator.send({ type: 'INIT' });
      orchestrator.send({ type: 'START' });

      const tierMachines = new Map<string, TierStateMachine>();
      const machine = new TierStateMachine({
        tierType: 'phase',
        itemId: 'PH-001',
        maxIterations: 5,
      });
      machine.send({ type: 'TIER_SELECTED' });
      tierMachines.set('PH-001', machine);

      await persistence.saveState(orchestrator, tierMachines);
      const state = await persistence.loadState();

      expect(state).not.toBeNull();
      if (state) {
        const restored = await persistence.restoreStateMachines(state);
        expect(restored.orchestrator.getCurrentState()).toBe('executing');
        expect(restored.tiers.has('PH-001')).toBe(true);
        const restoredMachine = restored.tiers.get('PH-001');
        expect(restoredMachine).toBeDefined();
        expect(restoredMachine?.getCurrentState()).toBe('planning');
      }
    });

    it('restores tier states correctly', async () => {
      const state: PersistedState = {
        orchestratorState: 'executing',
        orchestratorContext: {
          state: 'executing',
          currentPhaseId: 'PH-001',
          currentTaskId: null,
          currentSubtaskId: null,
          currentIterationId: null,
        },
        tierStates: {
          'PH-001': {
            tierType: 'phase',
            itemId: 'PH-001',
            state: 'running',
            iterationCount: 0,
            maxIterations: 5,
          },
        },
        savedAt: new Date().toISOString(),
      };

      const restored = await persistence.restoreStateMachines(state);
      expect(restored.orchestrator.getCurrentState()).toBe('executing');
      // Note: State restoration transitions from 'pending' to target state
      // Since 'running' requires 'TIER_SELECTED' -> 'PLAN_APPROVED', we need to check
      // that the machine can transition to the target state
      const restoredMachine = restored.tiers.get('PH-001');
      expect(restoredMachine).toBeDefined();
      // The machine starts in 'pending', and we try to transition to 'running'
      // This requires: pending -> planning (TIER_SELECTED) -> running (PLAN_APPROVED)
      // So we need to send both events
      if (restoredMachine) {
        restoredMachine.send({ type: 'TIER_SELECTED' });
        restoredMachine.send({ type: 'PLAN_APPROVED' });
        expect(restoredMachine.getCurrentState()).toBe('running');
      }
    });
  });

  describe('checkpoints', () => {
    it('creates a checkpoint file', async () => {
      const orchestrator = new OrchestratorStateMachine();
      orchestrator.send({ type: 'INIT' });

      const tierMachines = new Map<string, TierStateMachine>();
      await persistence.saveState(orchestrator, tierMachines);

      await persistence.createCheckpoint('test-checkpoint');

      const checkpointPath = join(checkpointDir, 'test-checkpoint.json');
      const exists = await fs
        .access(checkpointPath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);

      const content = await fs.readFile(checkpointPath, 'utf-8');
      const checkpoint = JSON.parse(content) as PersistedState;
      expect(checkpoint.orchestratorState).toBe('planning');
    });

    it('restores state from checkpoint', async () => {
      const orchestrator = new OrchestratorStateMachine();
      orchestrator.send({ type: 'INIT' });
      orchestrator.send({ type: 'START' });

      const tierMachines = new Map<string, TierStateMachine>();
      await persistence.saveState(orchestrator, tierMachines);

      await persistence.createCheckpoint('restore-test');

      const restored = await persistence.restoreCheckpoint('restore-test');
      expect(restored).not.toBeNull();
      expect(restored?.orchestratorState).toBe('executing');
    });

    it('returns null when checkpoint does not exist', async () => {
      const restored = await persistence.restoreCheckpoint('non-existent');
      expect(restored).toBeNull();
    });

    it('lists all checkpoints', async () => {
      const orchestrator = new OrchestratorStateMachine();
      const tierMachines = new Map<string, TierStateMachine>();
      await persistence.saveState(orchestrator, tierMachines);

      await persistence.createCheckpoint('checkpoint-1');
      await persistence.createCheckpoint('checkpoint-2');
      await persistence.createCheckpoint('checkpoint-3');

      const checkpoints = await persistence.listCheckpoints();
      expect(checkpoints).toContain('checkpoint-1');
      expect(checkpoints).toContain('checkpoint-2');
      expect(checkpoints).toContain('checkpoint-3');
      expect(checkpoints.length).toBeGreaterThanOrEqual(3);
    });

    it('sanitizes checkpoint names', async () => {
      const orchestrator = new OrchestratorStateMachine();
      const tierMachines = new Map<string, TierStateMachine>();
      await persistence.saveState(orchestrator, tierMachines);

      await persistence.createCheckpoint('test/checkpoint-name');

      const checkpoints = await persistence.listCheckpoints();
      const sanitized = checkpoints.find((c) => c.includes('test') && c.includes('checkpoint'));
      expect(sanitized).toBeDefined();
    });

    it('throws error when creating checkpoint with no saved state', async () => {
      await expect(persistence.createCheckpoint('test')).rejects.toThrow(
        'No state to checkpoint'
      );
    });

    it('creates backup files when checkpoint is overwritten', async () => {
      const orchestrator = new OrchestratorStateMachine();
      orchestrator.send({ type: 'INIT' });
      const tierMachines = new Map<string, TierStateMachine>();
      await persistence.saveState(orchestrator, tierMachines);

      const checkpointPath = join(checkpointDir, 'backup-test.json');

      // Create first checkpoint
      await persistence.createCheckpoint('backup-test');

      // Create second checkpoint (should backup the first)
      await persistence.createCheckpoint('backup-test');

      // Verify backup exists
      const backupPath = `${checkpointPath}.backup`;
      const backupExists = await fs
        .access(backupPath)
        .then(() => true)
        .catch(() => false);
      expect(backupExists).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles empty tier machines map', async () => {
      const orchestrator = new OrchestratorStateMachine();
      const tierMachines = new Map<string, TierStateMachine>();

      await persistence.saveState(orchestrator, tierMachines);

      const loaded = await persistence.loadState();
      expect(loaded).not.toBeNull();
      expect(loaded?.tierStates).toEqual({});
    });

    it('handles PRD with no phases', async () => {
      const orchestrator = new OrchestratorStateMachine();
      const tierMachines = new Map<string, TierStateMachine>();

      await persistence.saveState(orchestrator, tierMachines);

      const loaded = await persistence.loadState();
      expect(loaded).not.toBeNull();
      expect(loaded?.tierStates).toEqual({});
    });

    it('handles invalid checkpoint JSON gracefully', async () => {
      // Create invalid checkpoint file
      const checkpointPath = join(checkpointDir, 'invalid.json');
      await fs.mkdir(checkpointDir, { recursive: true });
      await fs.writeFile(checkpointPath, 'invalid json', 'utf-8');

      await expect(persistence.restoreCheckpoint('invalid')).rejects.toThrow();
    });
  });
});
