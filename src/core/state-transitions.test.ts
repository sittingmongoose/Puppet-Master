/**
 * Tests for state transition tables and helpers
 */

import { describe, it, expect } from 'vitest';
import {
  ORCHESTRATOR_TRANSITIONS,
  TIER_TRANSITIONS,
  isValidOrchestratorTransition,
  getNextOrchestratorState,
  isValidTierTransition,
  getNextTierState,
  getTransitionAction,
} from './state-transitions.js';

describe('state-transitions', () => {
  describe('orchestrator transitions', () => {
    it.each(ORCHESTRATOR_TRANSITIONS)(
      'allows $from + $event -> $to',
      (transition) => {
        expect(isValidOrchestratorTransition(transition.from, transition.event)).toBe(true);
        expect(getNextOrchestratorState(transition.from, transition.event)).toBe(transition.to);
      }
    );

    it.each([
      { from: 'idle', event: 'START' },
      { from: 'planning', event: 'PAUSE' },
      { from: 'paused', event: 'COMPLETE' },
      { from: 'complete', event: 'INIT' },
    ] as const)('rejects $from + $event', ({ from, event }) => {
      expect(isValidOrchestratorTransition(from, event)).toBe(false);
      expect(getNextOrchestratorState(from, event)).toBeNull();
    });
  });

  describe('tier transitions', () => {
    it.each(TIER_TRANSITIONS)(
      'allows $from + $event -> $to',
      (transition) => {
        expect(isValidTierTransition(transition.from, transition.event)).toBe(true);
        expect(getNextTierState(transition.from, transition.event)).toBe(transition.to);
      }
    );

    it.each(TIER_TRANSITIONS)(
      'returns correct action for $from + $event',
      (transition) => {
        const expectedAction = 'action' in transition ? transition.action : null;
        expect(getTransitionAction(transition.from, transition.event)).toBe(expectedAction);
      }
    );

    it.each([
      { from: 'pending', event: 'PLAN_APPROVED' },
      { from: 'planning', event: 'ITERATION_FAILED' },
      { from: 'running', event: 'GATE_PASSED' },
      { from: 'gating', event: 'NEW_ATTEMPT' },
      { from: 'passed', event: 'RETRY' },
    ] as const)('rejects $from + $event', ({ from, event }) => {
      expect(isValidTierTransition(from, event)).toBe(false);
      expect(getNextTierState(from, event)).toBeNull();
      expect(getTransitionAction(from, event)).toBeNull();
    });
  });
});
