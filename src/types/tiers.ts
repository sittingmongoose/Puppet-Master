/**
 * Tier hierarchy and verification types
 * 
 * This file defines types for the four-tier hierarchy (Phase/Task/Subtask/Iteration)
 * and related verification structures.
 * See ARCHITECTURE.md Section 5 (Tier State Manager) for tier hierarchy details.
 */

import type { TierState, TierType } from './state.js';

/**
 * Canonical criterion types for the verification system.
 *
 * These are the ONLY valid runtime types. The prompt/spec may use other names
 * (TEST:, CLI_VERIFY:, etc.) which are mapped to these types during parsing.
 *
 * Mapping from spec types (STATE_FILES.md) to runtime types:
 * - TEST:         → 'command'  (runs test suite)
 * - CLI_VERIFY:   → 'command'  (runs CLI command)
 * - FILE_VERIFY:  → 'file_exists'
 * - REGEX_VERIFY: → 'regex'
 * - BROWSER_VERIFY: → 'browser_verify'
 * - PERF_VERIFY:  → 'command'  (runs command with timing)
 * - AI_VERIFY:    → 'ai'
 *
 * NOTE: 'manual' type is NOT supported - all criteria must be machine-verifiable.
 * See REQUIREMENTS.md "no manual tests" requirement.
 */
export type CriterionType = 'regex' | 'file_exists' | 'browser_verify' | 'command' | 'ai';

/**
 * Criterion interface.
 * Represents an acceptance criterion for a tier.
 */
export interface Criterion {
  id: string;
  description: string;
  type: CriterionType;
  target: string;
  options?: Record<string, unknown>;
  passed?: boolean;
}

/**
 * Test command interface.
 * Represents a single test command to execute.
 */
export interface TestCommand {
  command: string;
  args?: string[];
  workingDirectory?: string;
  timeout?: number;
}

/**
 * Test plan interface.
 * Represents a collection of test commands to execute.
 */
export interface TestPlan {
  commands: TestCommand[];
  failFast: boolean;
}

/**
 * Tier plan interface.
 * Represents the planning information for a tier.
 */
export interface TierPlan {
  id: string;
  title: string;
  description: string;
  approach?: string[];
  dependencies?: string[];
  /**
   * Subtask IDs within the same task that must complete before this subtask.
   * Used by ParallelExecutor to determine execution order.
   * See BUILD_QUEUE_IMPROVEMENTS.md P2-T01.
   */
  dependsOn?: string[];
  /** Planning steps for the tier */
  steps?: string[];
  /** Context information for prompt building */
  context?: string;
  /** Constraints for this tier */
  constraints?: string[];
}

/**
 * Evidence interface.
 * Represents verification evidence collected during tier execution.
 */
export interface Evidence {
  type: 'log' | 'screenshot' | 'file' | 'metric';
  path: string;
  summary: string;
  timestamp: string;
}

/**
 * Tier node interface.
 * Represents a node in the four-tier hierarchy (Phase/Task/Subtask/Iteration).
 * See ARCHITECTURE.md Section 5.1 (Tier Hierarchy).
 */
export interface TierNode {
  id: string;
  type: TierType;
  state: TierState;
  parentId: string | null;
  childIds: string[];
  plan: TierPlan;
  acceptanceCriteria: Criterion[];
  testPlan: TestPlan;
  evidence: Evidence[];
  iterations: number;
  maxIterations: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Verifier result interface.
 * Represents the result of a single verifier execution.
 */
export interface VerifierResult {
  type: string;
  target: string;
  passed: boolean;
  evidencePath?: string;
  summary: string;
  error?: string;
  durationMs: number;
}

/**
 * Gate report interface.
 * Represents a gate verification report with all verifier results.
 */
export interface GateReport {
  gateId: string;
  timestamp: string;
  verifiersRun: VerifierResult[];
  overallPassed: boolean;
  failureType?: 'minor' | 'major';
  summary: string;
  enforcementViolations?: import('../agents/gate-enforcer.js').Violation[];
}

/**
 * Gate result interface.
 * Represents the overall result of a gate verification.
 */
export interface GateResult {
  passed: boolean;
  report: GateReport;
  failureReason?: string;
}

/**
 * Advancement result type (discriminated union).
 * Represents the result of checking whether to advance to the next tier.
 * See ARCHITECTURE.md Section 5.2 (Auto-Advancement Logic).
 */
export type AdvancementResult =
  | { action: 'continue'; next: TierNode }
  | { action: 'advance_task'; next: TierNode }
  | { action: 'advance_phase'; next: TierNode }
  | { action: 'complete' }
  | { action: 'task_gate_failed'; gate: GateResult }
  | { action: 'phase_gate_failed'; gate: GateResult };
