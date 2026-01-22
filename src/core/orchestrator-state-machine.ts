/**
 * OrchestratorStateMachine
 *
 * Main orchestrator state machine implementation.
 * See ARCHITECTURE.md Section 3.1 (Orchestrator States).
 */

import type { OrchestratorContext, OrchestratorState } from '../types/state.js';
import type { OrchestratorEvent } from '../types/events.js';
import type { OrchestratorTransition } from '../types/transitions.js';
import { getNextOrchestratorState, ORCHESTRATOR_TRANSITIONS } from './state-transitions.js';

export interface TransitionRecord {
  from: OrchestratorState;
  event: OrchestratorEvent;
  to: OrchestratorState;
  timestamp: string;
  action?: string;
}

export interface StateMachineConfig {
  initialState?: OrchestratorState;
  throwOnInvalidTransition?: boolean;
  maxHistorySize?: number;
  onTransition?: (record: TransitionRecord) => void;
}

export class OrchestratorStateMachine {
  private readonly initialState: OrchestratorState;
  private readonly throwOnInvalidTransition: boolean;
  private readonly maxHistorySize: number;
  private readonly onTransition?: (record: TransitionRecord) => void;

  private context: OrchestratorContext;
  private history: TransitionRecord[] = [];

  constructor(config?: StateMachineConfig) {
    this.initialState = config?.initialState ?? 'idle';
    this.throwOnInvalidTransition = config?.throwOnInvalidTransition ?? false;
    this.maxHistorySize = OrchestratorStateMachine.resolveMaxHistorySize(config?.maxHistorySize);
    this.onTransition = config?.onTransition;

    this.context = OrchestratorStateMachine.createInitialContext(this.initialState);
  }

  getCurrentState(): OrchestratorState {
    return this.context.state;
  }

  getContext(): OrchestratorContext {
    return { ...this.context };
  }

  send(event: OrchestratorEvent): boolean {
    if (!this.canSend(event)) {
      if (this.throwOnInvalidTransition) {
        throw new Error(
          `Invalid orchestrator transition: ${this.context.state} + ${event.type}`
        );
      }
      return false;
    }

    this.transition(event);
    return true;
  }

  canSend(event: OrchestratorEvent): boolean {
    return getNextOrchestratorState(this.context.state, event.type) !== null;
  }

  getHistory(): TransitionRecord[] {
    return [...this.history];
  }

  reset(): void {
    this.context = OrchestratorStateMachine.createInitialContext(this.initialState);
    this.history = [];
  }

  /**
   * Restores internal context fields from persisted state.
   * Call after state transitions to restore pauseReason, errorMessage, and tier IDs.
   *
   * @param context - Partial context with fields to restore
   */
  restoreInternalContext(context: Partial<OrchestratorContext>): void {
    if (context.pauseReason !== undefined) {
      this.context.pauseReason = context.pauseReason;
    }
    if (context.errorMessage !== undefined) {
      this.context.errorMessage = context.errorMessage;
    }
    if (context.currentPhaseId !== undefined) {
      this.context.currentPhaseId = context.currentPhaseId;
    }
    if (context.currentTaskId !== undefined) {
      this.context.currentTaskId = context.currentTaskId;
    }
    if (context.currentSubtaskId !== undefined) {
      this.context.currentSubtaskId = context.currentSubtaskId;
    }
    if (context.currentIterationId !== undefined) {
      this.context.currentIterationId = context.currentIterationId;
    }
  }

  private transition(event: OrchestratorEvent): void {
    const from = this.context.state;
    const to = getNextOrchestratorState(from, event.type);

    if (to === null) {
      if (this.throwOnInvalidTransition) {
        throw new Error(`Invalid orchestrator transition: ${from} + ${event.type}`);
      }
      return;
    }

    this.context.state = to;
    this.updateContext(event);
    this.recordTransition(from, event, to);
  }

  private updateContext(event: OrchestratorEvent): void {
    switch (event.type) {
      case 'ERROR': {
        this.context.errorMessage = event.error;
        delete this.context.pauseReason;
        break;
      }
      case 'PAUSE': {
        if (event.reason !== undefined) {
          this.context.pauseReason = event.reason;
        } else {
          delete this.context.pauseReason;
        }
        break;
      }
      case 'RESUME': {
        delete this.context.pauseReason;
        break;
      }
      case 'REPLAN': {
        delete this.context.errorMessage;
        break;
      }
      case 'STOP': {
        delete this.context.errorMessage;
        delete this.context.pauseReason;
        this.context.currentPhaseId = null;
        this.context.currentTaskId = null;
        this.context.currentSubtaskId = null;
        this.context.currentIterationId = null;
        break;
      }
      default: {
        break;
      }
    }
  }

  private recordTransition(
    from: OrchestratorState,
    event: OrchestratorEvent,
    to: OrchestratorState
  ): void {
    const transitions: readonly OrchestratorTransition[] = ORCHESTRATOR_TRANSITIONS;

    const transitionAction =
      transitions.find((transition) => {
        return transition.from === from && transition.event === event.type;
      })?.action ?? undefined;

    const record: TransitionRecord = {
      from,
      event: { ...event },
      to,
      timestamp: new Date().toISOString(),
      ...(transitionAction ? { action: transitionAction } : {}),
    };

    this.history.push(record);
    while (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    this.onTransition?.(record);
  }

  private static createInitialContext(initialState: OrchestratorState): OrchestratorContext {
    return {
      state: initialState,
      currentPhaseId: null,
      currentTaskId: null,
      currentSubtaskId: null,
      currentIterationId: null,
    };
  }

  private static resolveMaxHistorySize(configured: number | undefined): number {
    if (configured === undefined) {
      return 100;
    }

    if (!Number.isFinite(configured)) {
      return 100;
    }

    return Math.max(0, Math.trunc(configured));
  }
}
