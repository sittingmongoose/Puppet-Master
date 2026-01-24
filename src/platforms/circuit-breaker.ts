/**
 * Circuit Breaker (P2-T06)
 *
 * Implements a simple, dependency-free circuit breaker for platform calls.
 *
 * States:
 * - CLOSED: Normal operation; failures are counted.
 * - OPEN: Calls fail fast until cooldown elapses.
 * - HALF_OPEN: After cooldown, allow limited "test" calls; close after enough successes.
 *
 * This is intentionally generic so it can be reused anywhere we need to guard a flaky dependency.
 */

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerSnapshot {
  state: CircuitBreakerState;
  failures: number;
  lastFailure: number;
  halfOpenSuccesses: number;
  failureThreshold: number;
  cooldownMs: number;
  halfOpenSuccessThreshold: number;
}

/**
 * Error thrown when the circuit breaker is OPEN and cooldown has not elapsed.
 */
export class CircuitBreakerOpenError extends Error {
  readonly name = 'CircuitBreakerOpenError';

  constructor(public readonly retryAfterMs: number) {
    super(`Circuit breaker is OPEN; retry after ${retryAfterMs}ms`);
  }
}

/**
 * Simple circuit breaker implementation with explicit hooks.
 *
 * We prefer explicit `assertCanExecute()` + `recordSuccess()` / `recordFailure()` over a wrapped
 * `execute(fn)` so callers can decide what constitutes a "failure" (e.g. non-exceptional results).
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED';
  private failures = 0;
  private lastFailure = 0;
  private halfOpenSuccesses = 0;

  constructor(
    private readonly failureThreshold: number = 3,
    private readonly cooldownMs: number = 60_000,
    private readonly halfOpenSuccessThreshold: number = 2
  ) {}

  /**
   * Throws if the circuit is OPEN and still cooling down.
   * Transitions OPEN -> HALF_OPEN once the cooldown has elapsed.
   */
  assertCanExecute(nowMs: number = Date.now()): void {
    if (this.state !== 'OPEN') {
      return;
    }

    const elapsed = Math.max(0, nowMs - this.lastFailure);
    if (elapsed > this.cooldownMs) {
      this.state = 'HALF_OPEN';
      this.halfOpenSuccesses = 0;
      return;
    }

    const retryAfterMs = Math.max(0, this.cooldownMs - elapsed);
    throw new CircuitBreakerOpenError(retryAfterMs);
  }

  /**
   * Record a successful operation.
   *
   * - In CLOSED: resets failure counter (consecutive failures).
   * - In HALF_OPEN: counts success; closes once threshold reached.
   */
  recordSuccess(_nowMs: number = Date.now()): void {
    if (this.state === 'HALF_OPEN') {
      this.halfOpenSuccesses++;
      if (this.halfOpenSuccesses >= this.halfOpenSuccessThreshold) {
        this.state = 'CLOSED';
        this.failures = 0;
        this.halfOpenSuccesses = 0;
      }
      return;
    }

    // CLOSED (or unexpected state): success resets consecutive failures.
    this.failures = 0;
  }

  /**
   * Record a failed operation.
   *
   * - In CLOSED: increments failures; opens once threshold reached.
   * - In HALF_OPEN: immediately re-opens.
   * - In OPEN: refreshes lastFailure timestamp (extends cooldown).
   */
  recordFailure(nowMs: number = Date.now()): void {
    this.failures++;
    this.lastFailure = nowMs;

    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.halfOpenSuccesses = 0;
      return;
    }

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.halfOpenSuccesses = 0;
    }
  }

  /**
   * Snapshot state for debugging/tests.
   */
  getSnapshot(): CircuitBreakerSnapshot {
    return {
      state: this.state,
      failures: this.failures,
      lastFailure: this.lastFailure,
      halfOpenSuccesses: this.halfOpenSuccesses,
      failureThreshold: this.failureThreshold,
      cooldownMs: this.cooldownMs,
      halfOpenSuccessThreshold: this.halfOpenSuccessThreshold,
    };
  }
}

