import { describe, it, expect } from 'vitest';
import { CircuitBreaker, CircuitBreakerOpenError } from './circuit-breaker.js';
import { BasePlatformRunner } from './base-runner.js';
import type { ExecutionRequest, ExecutionResult, Platform, RunningProcess } from '../types/platforms.js';
import type { ChildProcess } from 'child_process';

describe('CircuitBreaker', () => {
  it('tracks failures and opens after threshold', () => {
    const cb = new CircuitBreaker(3, 60_000, 2);

    cb.recordFailure(1_000);
    cb.recordFailure(2_000);
    cb.recordFailure(3_000);

    expect(() => cb.assertCanExecute(3_001)).toThrow(CircuitBreakerOpenError);
    expect(cb.getSnapshot().state).toBe('OPEN');
    expect(cb.getSnapshot().failures).toBe(3);
  });

  it('transitions to HALF_OPEN after cooldown elapses', () => {
    const cb = new CircuitBreaker(3, 10, 2);

    cb.recordFailure(1);
    cb.recordFailure(2);
    cb.recordFailure(3);

    // Still within cooldown -> OPEN rejects
    expect(() => cb.assertCanExecute(12)).toThrow(CircuitBreakerOpenError);
    expect(cb.getSnapshot().state).toBe('OPEN');

    // After cooldown -> HALF_OPEN allows
    expect(() => cb.assertCanExecute(14)).not.toThrow();
    expect(cb.getSnapshot().state).toBe('HALF_OPEN');
    expect(cb.getSnapshot().halfOpenSuccesses).toBe(0);
  });

  it('closes after enough successes in HALF_OPEN', () => {
    const cb = new CircuitBreaker(3, 10, 2);

    cb.recordFailure(1);
    cb.recordFailure(2);
    cb.recordFailure(3);
    cb.assertCanExecute(20); // transitions to HALF_OPEN

    cb.recordSuccess(21);
    expect(cb.getSnapshot().state).toBe('HALF_OPEN');

    cb.recordSuccess(22);
    const snap = cb.getSnapshot();
    expect(snap.state).toBe('CLOSED');
    expect(snap.failures).toBe(0);
    expect(snap.halfOpenSuccesses).toBe(0);
  });

  it('re-opens immediately if a HALF_OPEN attempt fails', () => {
    const cb = new CircuitBreaker(3, 10, 2);

    cb.recordFailure(1);
    cb.recordFailure(2);
    cb.recordFailure(3);
    cb.assertCanExecute(20); // transitions to HALF_OPEN

    cb.recordFailure(21);
    expect(cb.getSnapshot().state).toBe('OPEN');
  });
});

describe('BasePlatformRunner circuit breaker integration', () => {
  class NoSpawnWhenOpenRunner extends BasePlatformRunner {
    readonly platform: Platform = 'cursor';
    spawnFreshProcessCalled = false;

    protected getCommand(): string {
      return 'no-op';
    }

    protected buildArgs(_request: ExecutionRequest): string[] {
      return [];
    }

    protected parseOutput(output: string): ExecutionResult {
      return {
        success: true,
        output,
        exitCode: 0,
        duration: 0,
        processId: 0,
      };
    }

    protected async spawn(_request: ExecutionRequest): Promise<ChildProcess> {
      throw new Error('spawn() should not be called in this test');
    }

    // Override to make it obvious if execute() tries to spawn while OPEN.
    override async spawnFreshProcess(_request: ExecutionRequest): Promise<RunningProcess> {
      this.spawnFreshProcessCalled = true;
      throw new Error('spawnFreshProcess() should not be called when OPEN');
    }

    forceOpen(): void {
      const now = Date.now();
      this.circuitBreaker.recordFailure(now);
      this.circuitBreaker.recordFailure(now);
      this.circuitBreaker.recordFailure(now);
    }
  }

  it('fails fast when circuit is OPEN (does not spawn)', async () => {
    const runner = new NoSpawnWhenOpenRunner({} as any);
    runner.forceOpen();

    const req: ExecutionRequest = {
      prompt: 'hello',
      workingDirectory: process.cwd(),
      nonInteractive: true,
    };

    await expect(runner.execute(req)).rejects.toBeInstanceOf(CircuitBreakerOpenError);
    expect(runner.spawnFreshProcessCalled).toBe(false);
  });
});

