/**
 * TierStateMachine
 *
 * Per-tier state machine implementation for Phase/Task/Subtask/Iteration.
 * See ARCHITECTURE.md Section 3.2 (Tier State Machine).
 */

import type { TierState, TierType } from '../types/state.js';
import type { TierEvent } from '../types/events.js';
import type { GateResult } from '../types/tiers.js';
import { getNextTierState } from './state-transitions.js';

export interface TierContext {
  tierType: TierType;
  itemId: string;
  state: TierState;
  iterationCount: number;
  maxIterations: number;
  lastError?: string;
  gateResult?: GateResult;
}

export interface TierStateMachineConfig {
  tierType: TierType;
  itemId: string;
  maxIterations: number;
  onTransition?: (from: TierState, event: TierEvent, to: TierState) => void;
}

export class TierStateMachine {
  private readonly tierType: TierType;
  private readonly itemId: string;
  private readonly maxIterations: number;
  private readonly onTransition?: (from: TierState, event: TierEvent, to: TierState) => void;

  private context: TierContext;

  constructor(config: TierStateMachineConfig) {
    this.tierType = config.tierType;
    this.itemId = config.itemId;
    this.maxIterations = TierStateMachine.resolveMaxIterations(config.maxIterations);
    this.onTransition = config.onTransition;

    this.context = TierStateMachine.createInitialContext({
      tierType: this.tierType,
      itemId: this.itemId,
      maxIterations: this.maxIterations,
    });
  }

  getCurrentState(): TierState {
    return this.context.state;
  }

  getContext(): TierContext {
    return { ...this.context };
  }

  getIterationCount(): number {
    return this.context.iterationCount;
  }

  send(event: TierEvent): boolean {
    if (!this.canSend(event)) {
      return false;
    }

    this.transition(event);
    return true;
  }

  canSend(event: TierEvent): boolean {
    return getNextTierState(this.context.state, event.type) !== null;
  }

  reset(): void {
    this.context = TierStateMachine.createInitialContext({
      tierType: this.tierType,
      itemId: this.itemId,
      maxIterations: this.maxIterations,
    });
  }

  /**
   * Restores internal context fields from persisted state.
   * Call after state transitions to restore iteration count and error state.
   *
   * @param context - Partial context with fields to restore
   */
  restoreInternalContext(context: Partial<TierContext>): void {
    if (context.iterationCount !== undefined) {
      // Ensure iteration count doesn't exceed maxIterations
      this.context.iterationCount = Math.min(context.iterationCount, this.maxIterations);
    }
    if (context.lastError !== undefined) {
      this.context.lastError = context.lastError;
    }
    if (context.gateResult !== undefined) {
      this.context.gateResult = context.gateResult;
    }
  }

  private transition(event: TierEvent): void {
    const from = this.context.state;

    if (from === 'running' && event.type === 'ITERATION_FAILED') {
      const nextState = this.handleIterationFailed(event);
      const isMaxAttempts = nextState === 'failed';

      this.context.state = nextState;

      const transitionEvent: TierEvent = isMaxAttempts ? { type: 'MAX_ATTEMPTS' } : event;
      this.onTransition?.(from, { ...transitionEvent }, nextState);
      return;
    }

    const to = getNextTierState(from, event.type);
    if (to === null) {
      return;
    }

    this.context.state = to;
    this.updateContext(event);
    this.onTransition?.(from, { ...event }, to);
  }

  private updateContext(event: TierEvent): void {
    switch (event.type) {
      case 'RETRY': {
        this.context.iterationCount = 0;
        delete this.context.lastError;
        delete this.context.gateResult;
        break;
      }
      default: {
        break;
      }
    }
  }

  private handleIterationFailed(event: TierEvent): TierState {
    if (event.type !== 'ITERATION_FAILED') {
      return this.context.state;
    }

    this.context.iterationCount += 1;
    this.context.lastError = event.error;

    if (this.checkMaxAttempts()) {
      return getNextTierState('running', 'MAX_ATTEMPTS') ?? 'failed';
    }

    return getNextTierState('running', 'ITERATION_FAILED') ?? 'retrying';
  }

  private checkMaxAttempts(): boolean {
    return this.context.iterationCount >= this.context.maxIterations;
  }

  private static createInitialContext(config: {
    tierType: TierType;
    itemId: string;
    maxIterations: number;
  }): TierContext {
    return {
      tierType: config.tierType,
      itemId: config.itemId,
      state: 'pending',
      iterationCount: 0,
      maxIterations: config.maxIterations,
    };
  }

  private static resolveMaxIterations(configured: number): number {
    if (!Number.isFinite(configured)) {
      return 1;
    }

    return Math.max(1, Math.trunc(configured));
  }
}

