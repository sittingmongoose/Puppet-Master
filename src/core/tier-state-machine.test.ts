/**
 * Tests for TierStateMachine
 */

import { describe, it, expect, vi } from 'vitest';
import { TierStateMachine } from './tier-state-machine.js';

function createRunningMachine(config?: { maxIterations?: number }): TierStateMachine {
  const machine = new TierStateMachine({
    tierType: 'task',
    itemId: 'TK-1',
    maxIterations: config?.maxIterations ?? 3,
  });

  machine.send({ type: 'TIER_SELECTED' });
  machine.send({ type: 'PLAN_APPROVED' });

  return machine;
}

function createGatingMachine(config?: { maxIterations?: number }): TierStateMachine {
  const machine = createRunningMachine(config);
  machine.send({ type: 'ITERATION_COMPLETE', success: true });
  return machine;
}

describe('tier-state-machine', () => {
  it('starts in pending', () => {
    const machine = new TierStateMachine({
      tierType: 'task',
      itemId: 'TK-1',
      maxIterations: 3,
    });

    expect(machine.getCurrentState()).toBe('pending');
    expect(machine.getIterationCount()).toBe(0);
    expect(machine.getContext()).toEqual({
      tierType: 'task',
      itemId: 'TK-1',
      state: 'pending',
      iterationCount: 0,
      maxIterations: 3,
    });
  });

  it('follows the success path pending -> passed', () => {
    const machine = new TierStateMachine({
      tierType: 'task',
      itemId: 'TK-1',
      maxIterations: 3,
    });

    expect(machine.send({ type: 'TIER_SELECTED' })).toBe(true);
    expect(machine.getCurrentState()).toBe('planning');

    expect(machine.send({ type: 'PLAN_APPROVED' })).toBe(true);
    expect(machine.getCurrentState()).toBe('running');

    expect(machine.send({ type: 'ITERATION_COMPLETE', success: true })).toBe(true);
    expect(machine.getCurrentState()).toBe('gating');

    expect(machine.send({ type: 'GATE_PASSED' })).toBe(true);
    expect(machine.getCurrentState()).toBe('passed');
    expect(machine.getIterationCount()).toBe(0);
  });

  it('increments iteration count and records lastError on ITERATION_FAILED', () => {
    const machine = createRunningMachine({ maxIterations: 3 });

    expect(machine.send({ type: 'ITERATION_FAILED', error: 'boom' })).toBe(true);
    expect(machine.getCurrentState()).toBe('retrying');
    expect(machine.getIterationCount()).toBe(1);
    expect(machine.getContext().lastError).toBe('boom');

    expect(machine.send({ type: 'NEW_ATTEMPT' })).toBe(true);
    expect(machine.getCurrentState()).toBe('running');
    expect(machine.getIterationCount()).toBe(1);
  });

  it('transitions to failed when maxIterations is reached', () => {
    const machine = createRunningMachine({ maxIterations: 2 });

    expect(machine.send({ type: 'ITERATION_FAILED', error: 'first' })).toBe(true);
    expect(machine.getCurrentState()).toBe('retrying');
    expect(machine.getIterationCount()).toBe(1);

    expect(machine.send({ type: 'NEW_ATTEMPT' })).toBe(true);
    expect(machine.getCurrentState()).toBe('running');

    expect(machine.send({ type: 'ITERATION_FAILED', error: 'second' })).toBe(true);
    expect(machine.getCurrentState()).toBe('failed');
    expect(machine.getIterationCount()).toBe(2);
    expect(machine.getContext().lastError).toBe('second');
  });

  it('transitions running -> failed on MAX_ATTEMPTS', () => {
    const machine = createRunningMachine({ maxIterations: 5 });

    expect(machine.send({ type: 'MAX_ATTEMPTS' })).toBe(true);
    expect(machine.getCurrentState()).toBe('failed');
  });

  it('transitions gating -> running on GATE_FAILED_MINOR', () => {
    const machine = createGatingMachine();

    expect(machine.getCurrentState()).toBe('gating');
    expect(machine.send({ type: 'GATE_FAILED_MINOR' })).toBe(true);
    expect(machine.getCurrentState()).toBe('running');
  });

  it('transitions gating -> escalated on GATE_FAILED_MAJOR', () => {
    const machine = createGatingMachine();

    expect(machine.getCurrentState()).toBe('gating');
    expect(machine.send({ type: 'GATE_FAILED_MAJOR' })).toBe(true);
    expect(machine.getCurrentState()).toBe('escalated');
  });

  it('resets iteration count and clears lastError on RETRY', () => {
    const machine = createRunningMachine({ maxIterations: 1 });

    expect(machine.send({ type: 'ITERATION_FAILED', error: 'boom' })).toBe(true);
    expect(machine.getCurrentState()).toBe('failed');
    expect(machine.getIterationCount()).toBe(1);

    expect(machine.send({ type: 'RETRY' })).toBe(true);
    expect(machine.getCurrentState()).toBe('pending');
    expect(machine.getIterationCount()).toBe(0);
    expect(machine.getContext().lastError).toBeUndefined();
  });

  it('calls onTransition for valid transitions', () => {
    const onTransition = vi.fn();
    const machine = new TierStateMachine({
      tierType: 'task',
      itemId: 'TK-1',
      maxIterations: 1,
      onTransition,
    });

    machine.send({ type: 'TIER_SELECTED' });
    machine.send({ type: 'PLAN_APPROVED' });
    machine.send({ type: 'ITERATION_FAILED', error: 'boom' });

    expect(onTransition).toHaveBeenCalledWith('pending', { type: 'TIER_SELECTED' }, 'planning');
    expect(onTransition).toHaveBeenCalledWith('planning', { type: 'PLAN_APPROVED' }, 'running');
    expect(onTransition).toHaveBeenCalledWith('running', { type: 'MAX_ATTEMPTS' }, 'failed');
  });
});

