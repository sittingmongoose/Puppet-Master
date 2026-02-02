/**
 * State transition tables and helpers
 *
 * Centralized transition definitions for orchestrator and tier state machines.
 * See ARCHITECTURE.md Section 3.3 (State Transitions Table).
 */

import type { OrchestratorState, TierState } from '../types/state.js';
import type { OrchestratorEvent, TierEvent } from '../types/events.js';
import type {
  OrchestratorTransition,
  TierTransition,
  StateTransitionAction,
} from '../types/transitions.js';

/**
 * Orchestrator state transitions (per ARCHITECTURE.md Section 3.3).
 */
export const ORCHESTRATOR_TRANSITIONS = [
  { from: 'idle', event: 'INIT', to: 'planning' },
  { from: 'planning', event: 'START', to: 'executing' },
  { from: 'executing', event: 'PAUSE', to: 'paused' },
  { from: 'executing', event: 'ERROR', to: 'error' },
  { from: 'executing', event: 'COMPLETE', to: 'complete' },
  { from: 'paused', event: 'RESUME', to: 'executing' },
  { from: 'error', event: 'REPLAN', to: 'planning' },
  { from: 'idle', event: 'STOP', to: 'idle' },
  { from: 'planning', event: 'STOP', to: 'idle' },
  { from: 'executing', event: 'STOP', to: 'idle' },
  { from: 'paused', event: 'STOP', to: 'idle' },
  { from: 'error', event: 'STOP', to: 'idle' },
  { from: 'complete', event: 'STOP', to: 'idle' },
] as const satisfies readonly OrchestratorTransition[];

/**
 * Tier state transitions (per ARCHITECTURE.md Section 3.3).
 */
export const TIER_TRANSITIONS = [
  { from: 'pending', event: 'TIER_SELECTED', to: 'planning', action: 'generate_plan' },
  { from: 'planning', event: 'PLAN_APPROVED', to: 'running', action: 'begin_execution' },
  { from: 'running', event: 'ITERATION_COMPLETE', to: 'gating', action: 'run_gate_checks' },
  { from: 'running', event: 'ITERATION_FAILED', to: 'retrying', action: 'spawn_new_attempt' },
  { from: 'running', event: 'MAX_ATTEMPTS', to: 'failed', action: 'mark_failed' },
  { from: 'gating', event: 'GATE_PASSED', to: 'passed', action: 'record_evidence' },
  { from: 'gating', event: 'GATE_FAILED_MINOR', to: 'running', action: 'self_fix_attempt' },
  { from: 'gating', event: 'GATE_FAILED_MAJOR', to: 'escalated', action: 'escalate' },
  { from: 'failed', event: 'RETRY', to: 'pending', action: 'reset_for_retry' },
  { from: 'retrying', event: 'NEW_ATTEMPT', to: 'running' },
] as const satisfies readonly TierTransition[];

function findOrchestratorTransition(
  from: OrchestratorState,
  event: OrchestratorEvent['type']
): OrchestratorTransition | null {
  return (
    ORCHESTRATOR_TRANSITIONS.find((transition) => {
      return transition.from === from && transition.event === event;
    }) ?? null
  );
}

function findTierTransition(from: TierState, event: TierEvent['type']): TierTransition | null {
  return (
    TIER_TRANSITIONS.find((transition) => {
      return transition.from === from && transition.event === event;
    }) ?? null
  );
}

/**
 * Returns true when an orchestrator transition is allowed.
 */
export function isValidOrchestratorTransition(
  from: OrchestratorState,
  event: OrchestratorEvent['type']
): boolean {
  return findOrchestratorTransition(from, event) !== null;
}

/**
 * Gets the next orchestrator state for a given (state, event) pair.
 * Returns null when the transition is not allowed.
 */
export function getNextOrchestratorState(
  from: OrchestratorState,
  event: OrchestratorEvent['type']
): OrchestratorState | null {
  return findOrchestratorTransition(from, event)?.to ?? null;
}

/**
 * Returns true when a tier transition is allowed.
 */
export function isValidTierTransition(from: TierState, event: TierEvent['type']): boolean {
  return findTierTransition(from, event) !== null;
}

/**
 * Gets the next tier state for a given (state, event) pair.
 * Returns null when the transition is not allowed.
 */
export function getNextTierState(from: TierState, event: TierEvent['type']): TierState | null {
  return findTierTransition(from, event)?.to ?? null;
}

/**
 * Gets the transition action (if any) for a given tier transition.
 * Returns null when the transition has no action or is not allowed.
 */
export function getTransitionAction(
  from: TierState,
  event: TierEvent['type']
): StateTransitionAction | null {
  return findTierTransition(from, event)?.action ?? null;
}

