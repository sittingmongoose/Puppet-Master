/**
 * Transition types for state machines
 *
 * Defines strongly-typed transition entries used by the core transition tables.
 * See ARCHITECTURE.md Section 3.3 (State Transitions Table).
 */

import type { OrchestratorState, TierState } from './state.js';
import type { OrchestratorEvent, TierEvent } from './events.js';

/**
 * Action identifiers that may be associated with a state transition.
 */
export type StateTransitionAction =
  | 'generate_plan'
  | 'begin_execution'
  | 'run_gate_checks'
  | 'spawn_new_attempt'
  | 'mark_failed'
  | 'record_evidence'
  | 'self_fix_attempt'
  | 'escalate'
  | 'reset_for_retry';

/**
 * Orchestrator transition entry.
 */
export interface OrchestratorTransition {
  from: OrchestratorState;
  event: OrchestratorEvent['type'];
  to: OrchestratorState;
  action?: StateTransitionAction;
}

/**
 * Tier transition entry.
 */
export interface TierTransition {
  from: TierState;
  event: TierEvent['type'];
  to: TierState;
  action?: StateTransitionAction;
}

