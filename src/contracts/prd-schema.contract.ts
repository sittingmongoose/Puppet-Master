/**
 * PRD Schema Contract - Single Source of Truth for PRD Structure
 * 
 * This file defines the canonical schema expectations for PRD generation,
 * including verifier token patterns and acceptance criteria format.
 * 
 * RULES:
 * 1. PRD prompts MUST use criterion types from criterion-types.contract.ts
 * 2. Verifier tokens MUST match patterns defined here
 * 3. PRD parsing MUST validate against this contract
 * 4. Contract is validated by contract-validator.ts
 * 
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T23 for implementation details.
 */

import {
  type CriterionType,
  type SpecToken,
  SPEC_TO_RUNTIME_MAP,
  ALL_SPEC_TOKENS,
  ALL_CRITERION_TYPES,
} from './criterion-types.contract.js';

/**
 * Verifier token pattern definitions.
 * 
 * These patterns define how verifier tokens appear in acceptance criteria targets.
 * Format: TOKEN:target_value
 */
export const VERIFIER_TOKEN_PATTERNS = {
  /** Test command: TEST:npm test */
  TEST: /^TEST:(.+)$/,
  /** CLI verification: CLI_VERIFY:npm run typecheck */
  CLI_VERIFY: /^CLI_VERIFY:(.+)$/,
  /** Performance verification: PERF_VERIFY:duration<1000ms:npm run build */
  PERF_VERIFY: /^PERF_VERIFY:(.+)$/,
  /** File verification: FILE_VERIFY:path/to/file:exists */
  FILE_VERIFY: /^FILE_VERIFY:(.+)$/,
  /** Regex verification: REGEX_VERIFY:file:pattern */
  REGEX_VERIFY: /^REGEX_VERIFY:(.+)$/,
  /** Browser verification: BROWSER_VERIFY:scenario-name */
  BROWSER_VERIFY: /^BROWSER_VERIFY:(.+)$/,
  /** AI verification: AI_VERIFY:prompt */
  AI_VERIFY: /^AI_VERIFY:(.+)$/,
} as const satisfies Record<SpecToken, RegExp>;

/**
 * Combined pattern to match any verifier token.
 */
export const ANY_VERIFIER_TOKEN_PATTERN = new RegExp(
  `^(${ALL_SPEC_TOKENS.join('|')}):(.+)$`
);

/**
 * PRD item status values.
 * These are the ONLY valid status values for PRD items.
 */
export const PRD_STATUS_VALUES = [
  'pending',
  'planning',
  'running',
  'gating',
  'passed',
  'failed',
  'escalated',
  'reopened',
] as const;

export type PrdItemStatus = (typeof PRD_STATUS_VALUES)[number];

/**
 * PRD ID format patterns.
 * Validates the format of PRD item IDs.
 */
export const PRD_ID_PATTERNS = {
  /** Phase ID: PH-001, PH-002, etc. */
  phase: /^PH-\d{3}$/,
  /** Task ID: TK-001-001, TK-001-002, etc. */
  task: /^TK-\d{3}-\d{3}$/,
  /** Subtask ID: ST-001-001-001, etc. */
  subtask: /^ST-\d{3}-\d{3}-\d{3}$/,
  /** Criterion ID: {itemId}-AC-001 */
  criterion: /^(PH|TK|ST)-[\d-]+-AC-\d{3}$/,
} as const;

/**
 * Validate a PRD ID format.
 */
export function isValidPrdId(id: string, type: keyof typeof PRD_ID_PATTERNS): boolean {
  return PRD_ID_PATTERNS[type].test(id);
}

/**
 * Parse a verifier token from a criterion target.
 * 
 * @param target - The criterion target string (e.g., "TEST:npm test")
 * @returns Parsed token info or null if not a token format
 */
export function parseVerifierToken(target: string): {
  token: SpecToken;
  value: string;
  runtimeType: CriterionType;
} | null {
  const match = ANY_VERIFIER_TOKEN_PATTERN.exec(target);
  if (!match) {
    return null;
  }

  const token = match[1] as SpecToken;
  const value = match[2];
  const runtimeType = SPEC_TO_RUNTIME_MAP[token];

  return { token, value, runtimeType };
}

/**
 * Validate that a criterion type string is valid.
 */
export function isValidCriterionType(type: string): type is CriterionType {
  return (ALL_CRITERION_TYPES as readonly string[]).includes(type);
}

/**
 * Validate that a status string is valid.
 */
export function isValidPrdStatus(status: string): status is PrdItemStatus {
  return (PRD_STATUS_VALUES as readonly string[]).includes(status);
}

/**
 * PRD schema expectations for validation.
 */
export const PRD_SCHEMA_EXPECTATIONS = {
  /**
   * Required top-level fields in prd.json
   */
  requiredFields: [
    'project',
    'version',
    'createdAt',
    'updatedAt',
    'branchName',
    'description',
    'phases',
    'metadata',
  ] as const,

  /**
   * Required phase fields
   */
  requiredPhaseFields: [
    'id',
    'title',
    'description',
    'status',
    'priority',
    'acceptanceCriteria',
    'testPlan',
    'tasks',
    'createdAt',
    'notes',
  ] as const,

  /**
   * Required task fields
   */
  requiredTaskFields: [
    'id',
    'phaseId',
    'title',
    'description',
    'status',
    'priority',
    'acceptanceCriteria',
    'testPlan',
    'subtasks',
    'createdAt',
    'notes',
  ] as const,

  /**
   * Required subtask fields
   */
  requiredSubtaskFields: [
    'id',
    'taskId',
    'title',
    'description',
    'status',
    'priority',
    'acceptanceCriteria',
    'testPlan',
    'iterations',
    'maxIterations',
    'createdAt',
    'notes',
  ] as const,

  /**
   * Required criterion fields
   */
  requiredCriterionFields: ['id', 'description', 'type', 'target'] as const,

  /**
   * Default values for new items
   */
  defaults: {
    status: 'pending' as PrdItemStatus,
    branchName: 'ralph/main',
    maxIterations: 3,
    failFast: true,
  } as const,
} as const;

/**
 * Get example verifier tokens for documentation/prompts.
 */
export function getVerifierTokenExamples(): Record<SpecToken, string> {
  return {
    TEST: 'TEST:npm test',
    CLI_VERIFY: 'CLI_VERIFY:npm run typecheck',
    PERF_VERIFY: 'PERF_VERIFY:duration<5000ms:npm run build',
    FILE_VERIFY: 'FILE_VERIFY:src/auth.ts:exists',
    REGEX_VERIFY: 'REGEX_VERIFY:package.json:"version": "1\\.0\\.0"',
    BROWSER_VERIFY: 'BROWSER_VERIFY:login-success',
    AI_VERIFY: 'AI_VERIFY:Verify the implementation follows best practices',
  };
}
