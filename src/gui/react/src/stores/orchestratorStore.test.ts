import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useOrchestratorStore } from './orchestratorStore';

describe('orchestratorStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const { reset } = useOrchestratorStore.getState();
    reset();
  });

  it('has initial idle status', () => {
    const { status } = useOrchestratorStore.getState();
    expect(status).toBe('idle');
  });

  it('setStatus changes status', () => {
    const { setStatus } = useOrchestratorStore.getState();
    
    act(() => {
      setStatus('running');
    });
    
    expect(useOrchestratorStore.getState().status).toBe('running');
  });

  it('setStatus running sets startTime', () => {
    const { setStatus } = useOrchestratorStore.getState();
    
    act(() => {
      setStatus('running');
    });
    
    expect(useOrchestratorStore.getState().startTime).toBeInstanceOf(Date);
  });

  it('setCurrentItem updates current item', () => {
    const { setCurrentItem } = useOrchestratorStore.getState();
    const item = {
      id: 'PH0-T01',
      type: 'task' as const,
      title: 'Test Task',
      status: 'running' as const,
    };
    
    act(() => {
      setCurrentItem(item);
    });
    
    expect(useOrchestratorStore.getState().currentItem).toEqual(item);
  });

  it('updateProgress merges progress', () => {
    const { updateProgress } = useOrchestratorStore.getState();
    
    act(() => {
      updateProgress({ overall: 50 });
    });
    
    const { progress } = useOrchestratorStore.getState();
    expect(progress.overall).toBe(50);
    expect(progress.phase).toEqual({ current: 0, total: 0 }); // unchanged
  });

  it('addOutput appends output with id', () => {
    const { addOutput } = useOrchestratorStore.getState();
    
    act(() => {
      addOutput({
        timestamp: new Date(),
        type: 'stdout',
        content: 'Test output',
      });
    });
    
    const { output } = useOrchestratorStore.getState();
    expect(output).toHaveLength(1);
    expect(output[0]?.content).toBe('Test output');
    expect(output[0]?.id).toMatch(/^output-/);
  });

  it('clearOutput removes all output', () => {
    const { addOutput, clearOutput } = useOrchestratorStore.getState();
    
    act(() => {
      addOutput({ timestamp: new Date(), type: 'stdout', content: 'Line 1' });
      addOutput({ timestamp: new Date(), type: 'stdout', content: 'Line 2' });
    });
    
    expect(useOrchestratorStore.getState().output).toHaveLength(2);
    
    act(() => {
      clearOutput();
    });
    
    expect(useOrchestratorStore.getState().output).toHaveLength(0);
  });

  it('setError updates lastError', () => {
    const { setError } = useOrchestratorStore.getState();
    
    act(() => {
      setError('Something went wrong');
    });
    
    expect(useOrchestratorStore.getState().lastError).toBe('Something went wrong');
  });

  it('reset returns to initial state', () => {
    const { setStatus, setCurrentItem, addOutput, setError, reset } = useOrchestratorStore.getState();
    
    act(() => {
      setStatus('running');
      setCurrentItem({ id: 'test', type: 'task', title: 'Test', status: 'running' });
      addOutput({ timestamp: new Date(), type: 'stdout', content: 'Output' });
      setError('Error');
    });
    
    act(() => {
      reset();
    });
    
    const state = useOrchestratorStore.getState();
    expect(state.status).toBe('idle');
    expect(state.currentItem).toBeNull();
    expect(state.output).toHaveLength(0);
    expect(state.lastError).toBeNull();
    expect(state.startTime).toBeNull();
  });
});
