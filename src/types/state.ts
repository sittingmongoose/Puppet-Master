/**
 * State machine types for RWM Puppet Master
 * 
 * This file defines the core state types for the orchestrator and tier state machines.
 * See ARCHITECTURE.md Section 3 (State Machine Design) for state diagrams.
 */

/**
 * Orchestrator state type.
 * Represents the overall state of the orchestrator.
 * See ARCHITECTURE.md Section 3.1 (Orchestrator States).
 */
export type OrchestratorState =
  | 'idle'
  | 'planning'
  | 'executing'
  | 'paused'
  | 'error'
  | 'complete';

/**
 * Tier state type.
 * Represents the state of a tier (Phase, Task, Subtask, or Iteration).
 * See ARCHITECTURE.md Section 3.2 (Tier State Machine).
 */
export type TierState =
  | 'pending'
  | 'planning'
  | 'running'
  | 'gating'
  | 'passed'
  | 'failed'
  | 'escalated'
  | 'retrying';

/**
 * Tier type.
 * Represents the tier level in the four-tier hierarchy.
 */
export type TierType = 'phase' | 'task' | 'subtask' | 'iteration';

/**
 * Orchestrator context interface.
 * Tracks the current state and active tier IDs in the orchestrator.
 */
export interface OrchestratorContext {
  state: OrchestratorState;
  currentPhaseId: string | null;
  currentTaskId: string | null;
  currentSubtaskId: string | null;
  currentIterationId: string | null;
  errorMessage?: string;
  pauseReason?: string;
}
