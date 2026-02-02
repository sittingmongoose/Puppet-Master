/**
 * Escalation chain helpers (P2-T09)
 *
 * Pure helpers for selecting which escalation step should apply for a given
 * failure type and attempt number.
 *
 * Notes:
 * - Config is loaded from YAML and converted to camelCase by ConfigManager, so:
 *   - YAML `test_failure` becomes config key `testFailure`
 * - `attempt` here is 1-based (attempt 1 is the first failure).
 */
import type { TierType } from '../types/state.js';
import type { EscalationChainStepConfig } from '../types/config.js';

export interface EscalationChainSelection {
  step: EscalationChainStepConfig;
  index: number;
}

/**
 * Failure type used by escalation chains (P2-T09).
 *
 * These values are produced by `Orchestrator.determineFailureType()` and
 * mapped to chain keys via `mapFailureTypeToChainKey()`.
 */
export type EscalationChainFailureType = 'test_failure' | 'acceptance' | 'timeout' | 'structural' | 'error';

/**
 * Map an internal failure type to the config key used in `escalation.chains`.
 *
 * Because the config loader converts snake_case to camelCase, YAML `test_failure`
 * becomes config key `testFailure`.
 */
export function mapFailureTypeToChainKey(failureType: EscalationChainFailureType): string {
  if (failureType === 'test_failure') {
    return 'testFailure';
  }

  return failureType;
}

/**
 * Select the escalation-chain step for a given 1-based attempt number.
 *
 * Deterministic selection rules:
 * - Steps define contiguous attempt "ranges" in order.
 * - `maxAttempts` is the width of that range.
 * - Missing `maxAttempts` is treated as infinite width (covers all remaining attempts).
 * - If all steps are finite and `attempt` exceeds the sum, the last step is chosen.
 *
 * Returns both the chosen step and its index so the caller can skip unsupported
 * actions by selecting a later step.
 */
export function selectEscalationChainStep(chain: readonly EscalationChainStepConfig[], attempt: number): EscalationChainSelection {
  const normalizedAttempt = toPositiveInt(attempt);

  if (chain.length === 0) {
    throw new Error('selectEscalationChainStep: chain is empty');
  }

  let remaining = normalizedAttempt;

  for (let index = 0; index < chain.length; index += 1) {
    const step = chain[index];
    const maxAttempts = toMaxAttempts(step.maxAttempts);

    if (maxAttempts === Number.POSITIVE_INFINITY) {
      return { step, index };
    }

    if (remaining <= maxAttempts) {
      return { step, index };
    }

    remaining -= maxAttempts;
  }

  return { step: chain[chain.length - 1], index: chain.length - 1 };
}

/**
 * Type guard-ish helper: normalize a configured escalation target.
 * (Used by callers when mapping `step.to` into a TierType.)
 */
export function toTierType(value: EscalationChainStepConfig['to']): TierType | undefined {
  if (!value) {
    return undefined;
  }
  return value as TierType;
}

function toPositiveInt(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error(`selectEscalationChainStep: attempt must be finite, got ${String(value)}`);
  }

  const int = Math.trunc(value);
  if (int < 1) {
    throw new Error(`selectEscalationChainStep: attempt must be >= 1, got ${String(value)}`);
  }

  return int;
}

function toMaxAttempts(value: number | undefined): number {
  if (value === undefined) {
    return Number.POSITIVE_INFINITY;
  }

  if (!Number.isFinite(value)) {
    return Number.POSITIVE_INFINITY;
  }

  const int = Math.trunc(value);
  if (int <= 0) {
    return 0;
  }

  return int;
}
