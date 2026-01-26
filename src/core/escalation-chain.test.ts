import { describe, it, expect } from 'vitest';
import {
  mapFailureTypeToChainKey,
  selectEscalationChainStep,
  toTierType,
} from './escalation-chain.js';

describe('escalation-chain helpers', () => {
  it('maps test_failure to testFailure', () => {
    expect(mapFailureTypeToChainKey('test_failure')).toBe('testFailure');
  });

  it('maps other failure types directly', () => {
    expect(mapFailureTypeToChainKey('timeout')).toBe('timeout');
  });

  it('selects chain step based on maxAttempts ranges', () => {
    const chain = [
      { action: 'retry', maxAttempts: 2 },
      { action: 'self_fix', maxAttempts: 1 },
      { action: 'escalate', to: 'phase' },
    ] as const;

    expect(selectEscalationChainStep(chain, 1).step.action).toBe('retry');
    expect(selectEscalationChainStep(chain, 2).step.action).toBe('retry');
    expect(selectEscalationChainStep(chain, 3).step.action).toBe('self_fix');
    expect(selectEscalationChainStep(chain, 4).step.action).toBe('escalate');
  });

  it('treats undefined maxAttempts as infinite', () => {
    const chain = [{ action: 'escalate', to: 'task' }] as const;
    expect(selectEscalationChainStep(chain, 10).step.action).toBe('escalate');
  });

  it('throws on empty chain or invalid attempt', () => {
    expect(() => selectEscalationChainStep([], 1)).toThrow();
    expect(() => selectEscalationChainStep([{ action: 'retry' }], 0)).toThrow();
  });

  it('coerces tier types when provided', () => {
    expect(toTierType('phase')).toBe('phase');
    expect(toTierType(undefined)).toBeUndefined();
  });
});
