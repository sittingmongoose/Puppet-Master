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

/**
 * P1-G05: Stagnation detector for detecting "no progress" scenarios.
 * 
 * Complements the CircuitBreaker by detecting:
 * - No file changes across iterations
 * - Same error repeated multiple times
 * - Repeated identical outputs
 * 
 * Based on Ralph-Claude-Code's CB_NO_PROGRESS_THRESHOLD=3.
 */
export interface StagnationSnapshot {
  consecutiveNoFileChanges: number;
  repeatedErrorCount: number;
  lastErrorHash: string | null;
  lastOutputHash: string | null;
  repeatedOutputCount: number;
  isStagnant: boolean;
}

export interface StagnationConfig {
  /** Number of consecutive iterations with no file changes before stagnation (default: 3) */
  noProgressThreshold?: number;
  /** Number of repeated identical errors before stagnation (default: 3) */
  repeatedErrorThreshold?: number;
  /** Number of repeated identical outputs before stagnation (default: 2) */
  repeatedOutputThreshold?: number;
}

/**
 * Detects stagnation patterns that indicate the agent is not making progress.
 */
export class StagnationDetector {
  private consecutiveNoFileChanges = 0;
  private repeatedErrorCount = 0;
  private lastErrorHash: string | null = null;
  private lastOutputHash: string | null = null;
  private repeatedOutputCount = 0;
  
  private readonly noProgressThreshold: number;
  private readonly repeatedErrorThreshold: number;
  private readonly repeatedOutputThreshold: number;

  constructor(config: StagnationConfig = {}) {
    this.noProgressThreshold = config.noProgressThreshold ?? 3;
    this.repeatedErrorThreshold = config.repeatedErrorThreshold ?? 3;
    this.repeatedOutputThreshold = config.repeatedOutputThreshold ?? 2;
  }

  /**
   * Record an iteration result and check for stagnation.
   * 
   * @param filesChanged - Array of files changed in this iteration
   * @param error - Error message if iteration failed
   * @param output - Output hash or summary for comparison
   * @returns true if stagnation is detected
   */
  recordIteration(
    filesChanged: string[],
    error: string | null = null,
    output: string | null = null
  ): boolean {
    // Track file changes
    if (filesChanged.length === 0) {
      this.consecutiveNoFileChanges++;
    } else {
      this.consecutiveNoFileChanges = 0;
    }

    // Track repeated errors
    if (error) {
      const errorHash = this.computeHash(error);
      if (this.lastErrorHash === errorHash) {
        this.repeatedErrorCount++;
      } else {
        this.lastErrorHash = errorHash;
        this.repeatedErrorCount = 1;
      }
    } else {
      this.repeatedErrorCount = 0;
      this.lastErrorHash = null;
    }

    // Track repeated outputs
    if (output) {
      const outputHash = this.computeHash(output);
      if (this.lastOutputHash === outputHash) {
        this.repeatedOutputCount++;
      } else {
        this.lastOutputHash = outputHash;
        this.repeatedOutputCount = 1;
      }
    }

    return this.isStagnant();
  }

  /**
   * Check if any stagnation condition is met.
   */
  isStagnant(): boolean {
    return (
      this.consecutiveNoFileChanges >= this.noProgressThreshold ||
      this.repeatedErrorCount >= this.repeatedErrorThreshold ||
      this.repeatedOutputCount >= this.repeatedOutputThreshold
    );
  }

  /**
   * Get the reason for stagnation (if any).
   */
  getStagnationReason(): string | null {
    if (this.consecutiveNoFileChanges >= this.noProgressThreshold) {
      return `No file changes for ${this.consecutiveNoFileChanges} consecutive iterations`;
    }
    if (this.repeatedErrorCount >= this.repeatedErrorThreshold) {
      return `Same error repeated ${this.repeatedErrorCount} times`;
    }
    if (this.repeatedOutputCount >= this.repeatedOutputThreshold) {
      return `Identical output ${this.repeatedOutputCount} times in a row`;
    }
    return null;
  }

  /**
   * Reset all counters (e.g., when starting a new subtask).
   */
  reset(): void {
    this.consecutiveNoFileChanges = 0;
    this.repeatedErrorCount = 0;
    this.lastErrorHash = null;
    this.lastOutputHash = null;
    this.repeatedOutputCount = 0;
  }

  /**
   * Get snapshot for debugging/logging.
   */
  getSnapshot(): StagnationSnapshot {
    return {
      consecutiveNoFileChanges: this.consecutiveNoFileChanges,
      repeatedErrorCount: this.repeatedErrorCount,
      lastErrorHash: this.lastErrorHash,
      lastOutputHash: this.lastOutputHash,
      repeatedOutputCount: this.repeatedOutputCount,
      isStagnant: this.isStagnant(),
    };
  }

  /**
   * Compute a simple hash for comparison.
   */
  private computeHash(content: string): string {
    // Simple hash for comparison - just first 100 chars normalized
    const normalized = content.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 100);
    return normalized;
  }
}

