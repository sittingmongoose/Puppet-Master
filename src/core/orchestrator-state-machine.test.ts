/**
 * Tests for OrchestratorStateMachine
 */

import { describe, it, expect, vi } from 'vitest';
import { OrchestratorStateMachine } from './orchestrator-state-machine.js';

describe('orchestrator-state-machine', () => {
  it('starts in idle by default', () => {
    const machine = new OrchestratorStateMachine();

    expect(machine.getCurrentState()).toBe('idle');
    expect(machine.getContext()).toEqual({
      state: 'idle',
      currentPhaseId: null,
      currentTaskId: null,
      currentSubtaskId: null,
      currentIterationId: null,
    });
  });

  it('transitions idle -> planning on INIT', () => {
    const machine = new OrchestratorStateMachine();

    expect(machine.send({ type: 'INIT' })).toBe(true);
    expect(machine.getCurrentState()).toBe('planning');
  });

  it('transitions planning -> executing on START', () => {
    const machine = new OrchestratorStateMachine();

    machine.send({ type: 'INIT' });
    expect(machine.send({ type: 'START' })).toBe(true);
    expect(machine.getCurrentState()).toBe('executing');
  });

  it('transitions executing -> paused on PAUSE and records reason in context', () => {
    const machine = new OrchestratorStateMachine();

    machine.send({ type: 'INIT' });
    machine.send({ type: 'START' });

    expect(machine.send({ type: 'PAUSE', reason: 'user requested' })).toBe(true);
    expect(machine.getCurrentState()).toBe('paused');
    expect(machine.getContext().pauseReason).toBe('user requested');
  });

  it('transitions paused -> executing on RESUME and clears pause reason', () => {
    const machine = new OrchestratorStateMachine();

    machine.send({ type: 'INIT' });
    machine.send({ type: 'START' });
    machine.send({ type: 'PAUSE', reason: 'waiting' });

    expect(machine.send({ type: 'RESUME' })).toBe(true);
    expect(machine.getCurrentState()).toBe('executing');
    expect(machine.getContext().pauseReason).toBeUndefined();
  });

  it('transitions executing -> error on ERROR and records error in context', () => {
    const machine = new OrchestratorStateMachine();

    machine.send({ type: 'INIT' });
    machine.send({ type: 'START' });

    expect(machine.send({ type: 'ERROR', error: 'boom' })).toBe(true);
    expect(machine.getCurrentState()).toBe('error');
    expect(machine.getContext().errorMessage).toBe('boom');
  });

  it('transitions error -> planning on REPLAN and clears error', () => {
    const machine = new OrchestratorStateMachine();

    machine.send({ type: 'INIT' });
    machine.send({ type: 'START' });
    machine.send({ type: 'ERROR', error: 'boom' });

    expect(machine.send({ type: 'REPLAN' })).toBe(true);
    expect(machine.getCurrentState()).toBe('planning');
    expect(machine.getContext().errorMessage).toBeUndefined();
  });

  it('transitions executing -> complete on COMPLETE', () => {
    const machine = new OrchestratorStateMachine();

    machine.send({ type: 'INIT' });
    machine.send({ type: 'START' });

    expect(machine.send({ type: 'COMPLETE' })).toBe(true);
    expect(machine.getCurrentState()).toBe('complete');
  });

  it('ignores invalid transitions by default', () => {
    const machine = new OrchestratorStateMachine();

    expect(machine.canSend({ type: 'START' })).toBe(false);
    expect(machine.send({ type: 'START' })).toBe(false);
    expect(machine.getCurrentState()).toBe('idle');
    expect(machine.getHistory()).toHaveLength(0);
  });

  it('throws on invalid transitions when configured', () => {
    const machine = new OrchestratorStateMachine({ throwOnInvalidTransition: true });

    expect(() => machine.send({ type: 'START' })).toThrow(
      /Invalid orchestrator transition: idle \+ START/
    );
    expect(machine.getCurrentState()).toBe('idle');
  });

  it('tracks transition history and calls onTransition', () => {
    const onTransition = vi.fn();
    const machine = new OrchestratorStateMachine({ onTransition, maxHistorySize: 10 });

    machine.send({ type: 'INIT' });
    machine.send({ type: 'START' });

    const history = machine.getHistory();
    expect(history).toHaveLength(2);

    expect(history[0]).toEqual(
      expect.objectContaining({
        from: 'idle',
        to: 'planning',
        event: { type: 'INIT' },
      })
    );
    expect(history[0]?.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    expect(history[1]).toEqual(
      expect.objectContaining({
        from: 'planning',
        to: 'executing',
        event: { type: 'START' },
      })
    );

    expect(onTransition).toHaveBeenCalledTimes(2);
    expect(onTransition).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'idle',
        to: 'planning',
        event: { type: 'INIT' },
      })
    );
  });

  it('enforces maxHistorySize by dropping oldest entries', () => {
    const machine = new OrchestratorStateMachine({ maxHistorySize: 2 });

    machine.send({ type: 'INIT' });
    machine.send({ type: 'START' });
    machine.send({ type: 'PAUSE', reason: 'break' });

    const history = machine.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0]).toEqual(expect.objectContaining({ event: { type: 'START' } }));
    expect(history[1]).toEqual(
      expect.objectContaining({ event: { type: 'PAUSE', reason: 'break' } })
    );
  });

  it('reset() returns to the initial state and clears history', () => {
    const machine = new OrchestratorStateMachine({ initialState: 'planning' });

    expect(machine.getCurrentState()).toBe('planning');
    machine.send({ type: 'START' });
    expect(machine.getHistory()).toHaveLength(1);

    machine.reset();
    expect(machine.getCurrentState()).toBe('planning');
    expect(machine.getHistory()).toHaveLength(0);
    expect(machine.getContext().errorMessage).toBeUndefined();
    expect(machine.getContext().pauseReason).toBeUndefined();
  });
});

