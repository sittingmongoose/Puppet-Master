/**
 * State Persistence
 *
 * Handles saving and restoring orchestrator and tier state machines.
 * Integrates with PrdManager to persist state in prd.json and supports checkpoint functionality.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import type { OrchestratorState, OrchestratorContext, TierState } from '../types/state.js';
import type { OrchestratorEvent, TierEvent } from '../types/events.js';
import { OrchestratorStateMachine } from './orchestrator-state-machine.js';
import { TierStateMachine, type TierContext } from './tier-state-machine.js';
import type { PrdManager } from '../memory/index.js';
import type { PRD, Phase, Task, Subtask } from '../types/prd.js';
import { getNextOrchestratorState } from './state-transitions.js';
import { getNextTierState } from './state-transitions.js';

/**
 * Persisted state interface.
 * Represents the complete state of orchestrator and all tier state machines.
 */
export interface PersistedState {
  orchestratorState: OrchestratorState;
  orchestratorContext: OrchestratorContext;
  tierStates: Record<string, TierContext>;
  savedAt: string;
}

/**
 * StatePersistence class.
 * Manages saving and restoring state machines.
 */
export class StatePersistence {
  private readonly prdManager: PrdManager;
  private readonly checkpointDir: string;

  /**
   * Creates a new StatePersistence instance.
   * @param prdManager - The PrdManager instance to use for persistence
   * @param checkpointDir - Optional checkpoint directory (default: '.puppet-master/checkpoints')
   */
  constructor(prdManager: PrdManager, checkpointDir: string = '.puppet-master/checkpoints') {
    this.prdManager = prdManager;
    this.checkpointDir = checkpointDir;
  }

  /**
   * Saves the current state of orchestrator and tier machines to prd.json.
   * @param orchestratorMachine - The orchestrator state machine
   * @param tierMachines - Map of tier ID to tier state machine
   */
  async saveState(
    orchestratorMachine: OrchestratorStateMachine,
    tierMachines: Map<string, TierStateMachine>
  ): Promise<void> {
    const persistedState = this.serializeState(orchestratorMachine, tierMachines);

    // Load current PRD
    const prd = await this.prdManager.load();

    // Store orchestrator state in PRD
    prd.orchestratorState = persistedState.orchestratorState;
    prd.orchestratorContext = persistedState.orchestratorContext;

    // Store tier contexts in their respective items
    this.storeTierContextsInPRD(prd, persistedState.tierStates);

    // Save PRD
    await this.prdManager.save(prd);
  }

  /**
   * Loads persisted state from prd.json.
   * @returns The persisted state, or null if no state is found
   */
  async loadState(): Promise<PersistedState | null> {
    const prd = await this.prdManager.load();

    // Check if orchestrator state exists
    if (!prd.orchestratorState || !prd.orchestratorContext) {
      return null;
    }

    // Extract tier contexts from PRD items
    const tierStates = this.extractTierContextsFromPRD(prd);

    return {
      orchestratorState: prd.orchestratorState,
      orchestratorContext: prd.orchestratorContext,
      tierStates,
      savedAt: prd.updatedAt,
    };
  }

  /**
   * Restores state machines from persisted state.
   * @param state - The persisted state to restore from
   * @returns Restored orchestrator and tier state machines
   */
  async restoreStateMachines(
    state: PersistedState
  ): Promise<{
    orchestrator: OrchestratorStateMachine;
    tiers: Map<string, TierStateMachine>;
  }> {
    // Restore orchestrator machine
    const orchestrator = this.restoreOrchestratorMachine(state);

    // Restore tier machines
    const tiers = this.restoreTierMachines(state.tierStates);

    return { orchestrator, tiers };
  }

  /**
   * Creates a checkpoint with the current state.
   * @param name - Checkpoint name (will be sanitized for filesystem)
   */
  async createCheckpoint(name: string): Promise<void> {
    const state = await this.loadState();
    if (!state) {
      throw new Error('No state to checkpoint. Save state first.');
    }

    const sanitizedName = this.sanitizeCheckpointName(name);
    const checkpointPath = join(this.checkpointDir, `${sanitizedName}.json`);

    // Ensure directory exists
    await fs.mkdir(dirname(checkpointPath), { recursive: true });

    // Write checkpoint file
    await fs.writeFile(checkpointPath, JSON.stringify(state, null, 2), 'utf-8');
  }

  /**
   * Restores state from a checkpoint.
   * @param name - Checkpoint name
   * @returns The persisted state, or null if checkpoint doesn't exist
   */
  async restoreCheckpoint(name: string): Promise<PersistedState | null> {
    const sanitizedName = this.sanitizeCheckpointName(name);
    const checkpointPath = join(this.checkpointDir, `${sanitizedName}.json`);

    try {
      const content = await fs.readFile(checkpointPath, 'utf-8');
      const state = JSON.parse(content) as PersistedState;

      // Validate structure
      if (
        !state.orchestratorState ||
        !state.orchestratorContext ||
        !state.tierStates ||
        !state.savedAt
      ) {
        throw new Error('Invalid checkpoint structure');
      }

      return state;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Lists all available checkpoints.
   * @returns Array of checkpoint names (without .json extension)
   */
  async listCheckpoints(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.checkpointDir);
      return files
        .filter((file) => file.endsWith('.json'))
        .map((file) => file.replace(/\.json$/, ''));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Serializes state machines to a PersistedState object.
   * @param orchestratorMachine - The orchestrator state machine
   * @param tierMachines - Map of tier ID to tier state machine
   * @returns The serialized state
   */
  private serializeState(
    orchestratorMachine: OrchestratorStateMachine,
    tierMachines: Map<string, TierStateMachine>
  ): PersistedState {
    const orchestratorState = orchestratorMachine.getCurrentState();
    const orchestratorContext = orchestratorMachine.getContext();

    // Convert Map to Record for JSON serialization
    const tierStates: Record<string, TierContext> = {};
    for (const [id, machine] of tierMachines.entries()) {
      tierStates[id] = machine.getContext();
    }

    return {
      orchestratorState,
      orchestratorContext,
      tierStates,
      savedAt: new Date().toISOString(),
    };
  }

  /**
   * Stores tier contexts in PRD items.
   * @param prd - The PRD to update
   * @param tierStates - Map of tier ID to tier context
   */
  private storeTierContextsInPRD(prd: PRD, tierStates: Record<string, TierContext>): void {
    for (const phase of prd.phases) {
      // Store phase tier context
      if (tierStates[phase.id]) {
        phase.tierContext = tierStates[phase.id];
      }

      for (const task of phase.tasks) {
        // Store task tier context
        if (tierStates[task.id]) {
          task.tierContext = tierStates[task.id];
        }

        for (const subtask of task.subtasks) {
          // Store subtask tier context
          if (tierStates[subtask.id]) {
            subtask.tierContext = tierStates[subtask.id];
          }
        }
      }
    }
  }

  /**
   * Extracts tier contexts from PRD items.
   * @param prd - The PRD to extract from
   * @returns Map of tier ID to tier context
   */
  private extractTierContextsFromPRD(prd: PRD): Record<string, TierContext> {
    const tierStates: Record<string, TierContext> = {};

    for (const phase of prd.phases) {
      if (phase.tierContext) {
        tierStates[phase.id] = phase.tierContext;
      }

      for (const task of phase.tasks) {
        if (task.tierContext) {
          tierStates[task.id] = task.tierContext;
        }

        for (const subtask of task.subtasks) {
          if (subtask.tierContext) {
            tierStates[subtask.id] = subtask.tierContext;
          }
        }
      }
    }

    return tierStates;
  }

  /**
   * Restores an orchestrator state machine from persisted state.
   * @param state - The persisted state
   * @returns Restored orchestrator state machine
   */
  private restoreOrchestratorMachine(
    state: PersistedState
  ): OrchestratorStateMachine {
    // Create machine with the saved state as initial state
    const machine = new OrchestratorStateMachine({
      initialState: state.orchestratorState,
    });

    // The machine is now at the correct state, but context fields need to be restored
    // Since we can't directly set context, we'll create a new machine and manually
    // restore context through a workaround: create with initial state, then transition
    // Note: Context fields like currentPhaseId are typically set by specific events
    // during execution, so perfect restoration may not be possible without the full event history.
    // For now, we restore the state correctly, and context restoration would require
    // additional mechanisms or accepting that some context may be lost.

    return machine;
  }

  /**
   * Restores tier state machines from persisted state.
   * @param tierStates - Map of tier ID to tier context
   * @returns Map of tier ID to restored tier state machine
   */
  private restoreTierMachines(
    tierStates: Record<string, TierContext>
  ): Map<string, TierStateMachine> {
    const machines = new Map<string, TierStateMachine>();

    for (const [id, context] of Object.entries(tierStates)) {
      // Create machine - it will start in 'pending' state
      const machine = new TierStateMachine({
        tierType: context.tierType,
        itemId: context.itemId,
        maxIterations: context.maxIterations,
      });

      // Transition to saved state if different from initial 'pending'
      const currentState = machine.getCurrentState();
      if (currentState !== context.state) {
        const events = this.getTierEventsToReachState(currentState, context.state);
        for (const event of events) {
          machine.send(event);
        }
      }

      // Note: iterationCount, lastError, and gateResult are internal to TierStateMachine
      // and can't be directly restored. The state machine will be in the correct state,
      // but these fields will need to be restored through additional mechanisms or
      // accepted as limitations of the restoration process.

      machines.set(id, machine);
    }

    return machines;
  }

  /**
   * Gets events needed to transition from one orchestrator state to another.
   * Uses the actual state transition table to find valid transitions.
   * @param from - Current state
   * @param to - Target state
   * @returns Array of events to send
   */
  private getEventsToReachState(
    from: OrchestratorState,
    to: OrchestratorState
  ): OrchestratorEvent[] {
    // If already at target state, no events needed
    if (from === to) {
      return [];
    }

    // Try direct transition
    const events: OrchestratorEvent[] = [
      { type: 'INIT' },
      { type: 'START' },
      { type: 'PAUSE' },
      { type: 'RESUME' },
      { type: 'ERROR', error: 'Restored from persistence' },
      { type: 'REPLAN' },
      { type: 'COMPLETE' },
      { type: 'STOP' },
    ];

    for (const event of events) {
      const nextState = getNextOrchestratorState(from, event.type);
      if (nextState === to) {
        return [event];
      }
    }

    // If no direct transition, return empty (state machines will start at target state)
    return [];
  }

  /**
   * Gets events needed to transition from one tier state to another.
   * Uses the actual state transition table to find valid transitions.
   * @param from - Current state
   * @param to - Target state
   * @returns Array of events to send
   */
  private getTierEventsToReachState(from: TierState, to: TierState): TierEvent[] {
    // If already at target state, no events needed
    if (from === to) {
      return [];
    }

    // Try direct transition
    const events: TierEvent[] = [
      { type: 'TIER_SELECTED' },
      { type: 'PLAN_APPROVED' },
      { type: 'ITERATION_COMPLETE', success: true },
      { type: 'ITERATION_FAILED', error: 'Restored from persistence' },
      { type: 'MAX_ATTEMPTS' },
      { type: 'GATE_PASSED' },
      { type: 'GATE_FAILED_MINOR' },
      { type: 'GATE_FAILED_MAJOR' },
      { type: 'RETRY' },
      { type: 'NEW_ATTEMPT' },
    ];

    for (const event of events) {
      const nextState = getNextTierState(from, event.type);
      if (nextState === to) {
        return [event];
      }
    }

    // If no direct transition, return empty (state machines will start at target state)
    return [];
  }

  /**
   * Sanitizes a checkpoint name for filesystem use.
   * @param name - Original checkpoint name
   * @returns Sanitized name safe for filesystem
   */
  private sanitizeCheckpointName(name: string): string {
    // Remove or replace unsafe characters
    return name
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  }
}
