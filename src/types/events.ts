/**
 * Event types for state machine transitions
 * 
 * This file defines the event types used for state transitions in both
 * the orchestrator and tier state machines.
 * See ARCHITECTURE.md Section 3.3 (State Transitions Table).
 */

import type { OrchestratorState, TierState } from './state.js';

/**
 * Orchestrator event type (discriminated union).
 * Events that trigger state transitions in the orchestrator state machine.
 */
export type OrchestratorEvent =
  | { type: 'INIT' }
  | { type: 'START' }
  | { type: 'PAUSE'; reason?: string }
  | { type: 'RESUME' }
  | { type: 'STOP' }
  | { type: 'ERROR'; error: string }
  | { type: 'COMPLETE' }
  | { type: 'REPLAN'; scope?: string };

/**
 * Tier event type (discriminated union).
 * Events that trigger state transitions in tier state machines.
 */
export type TierEvent =
  | { type: 'TIER_SELECTED' }
  | { type: 'PLAN_APPROVED' }
  | { type: 'ITERATION_COMPLETE'; success: boolean }
  | { type: 'ITERATION_FAILED'; error: string }
  | { type: 'MAX_ATTEMPTS' }
  | { type: 'GATE_PASSED' }
  | { type: 'GATE_FAILED_MINOR' }
  | { type: 'GATE_FAILED_MAJOR' }
  | { type: 'RETRY' }
  | { type: 'NEW_ATTEMPT' };

/**
 * State transition interface.
 * Represents a state transition with its source, event, target, and optional action.
 */
export interface StateTransition {
  from: OrchestratorState | TierState;
  event: OrchestratorEvent | TierEvent;
  to: OrchestratorState | TierState;
  action?: string;
}
