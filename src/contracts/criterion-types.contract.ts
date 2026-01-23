/**
 * Criterion Type Contract - Single Source of Truth for Verification Types
 * 
 * This file defines the canonical criterion types used in the verification system.
 * It maps criterion types to verifier classes and spec tokens to runtime types.
 * 
 * RULES:
 * 1. src/types/tiers.ts CriterionType MUST match types defined here
 * 2. src/core/container.ts MUST register verifiers for all types
 * 3. src/start-chain/prompts/prd-prompt.ts MUST only use valid types
 * 4. 'manual' type is INTENTIONALLY EXCLUDED - all criteria must be machine-verifiable
 * 5. Contract is validated by contract-validator.ts
 * 
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T23 for implementation details.
 */

/**
 * SINGLE SOURCE OF TRUTH for criterion types.
 * 
 * Maps runtime criterion type → verifier class name.
 * These are the ONLY valid types for acceptance criteria.
 */
export const CRITERION_TYPE_CONTRACT = {
  /**
   * Command-based verification.
   * Runs shell commands (test suites, CLI tools, performance checks).
   * Used for: TEST:, CLI_VERIFY:, PERF_VERIFY: tokens
   */
  command: 'CommandVerifier',

  /**
   * Regex-based verification.
   * Matches patterns in file contents.
   * Used for: REGEX_VERIFY: tokens
   */
  regex: 'RegexVerifier',

  /**
   * File existence verification.
   * Checks if files/directories exist.
   * Used for: FILE_VERIFY: tokens
   */
  file_exists: 'FileExistsVerifier',

  /**
   * Browser-based verification.
   * Runs Playwright browser automation.
   * Used for: BROWSER_VERIFY: tokens
   */
  browser_verify: 'BrowserVerifier',

  /**
   * AI-assisted verification.
   * Uses AI platform to verify complex conditions.
   * Used for: AI_VERIFY: tokens or semantic verification
   */
  ai: 'AIVerifier',

  // NOTE: 'manual' type is INTENTIONALLY NOT INCLUDED
  // All criteria must be machine-verifiable per REQUIREMENTS.md
} as const;

/**
 * Criterion type union (derived from contract).
 */
export type CriterionType = keyof typeof CRITERION_TYPE_CONTRACT;

/**
 * Verifier class name type.
 */
export type VerifierClassName = (typeof CRITERION_TYPE_CONTRACT)[CriterionType];

/**
 * Array of all criterion types for runtime validation.
 */
export const ALL_CRITERION_TYPES: readonly CriterionType[] = Object.keys(
  CRITERION_TYPE_CONTRACT
) as CriterionType[];

/**
 * Array of all verifier class names for registration validation.
 */
export const ALL_VERIFIER_CLASSES: readonly VerifierClassName[] = Object.values(
  CRITERION_TYPE_CONTRACT
) as VerifierClassName[];

/**
 * Spec token to runtime type mapping.
 * 
 * Maps PRD/spec criterion tokens (e.g., "TEST:") to runtime CriterionType.
 * Used by PRD prompt generation and parsing.
 */
export const SPEC_TO_RUNTIME_MAP = {
  /** Test suite execution */
  TEST: 'command',
  /** CLI command verification */
  CLI_VERIFY: 'command',
  /** Performance verification (timed command) */
  PERF_VERIFY: 'command',
  /** File existence check */
  FILE_VERIFY: 'file_exists',
  /** Regex pattern matching */
  REGEX_VERIFY: 'regex',
  /** Browser automation */
  BROWSER_VERIFY: 'browser_verify',
  /** AI-assisted verification */
  AI_VERIFY: 'ai',
} as const satisfies Record<string, CriterionType>;

/**
 * Spec token type.
 */
export type SpecToken = keyof typeof SPEC_TO_RUNTIME_MAP;

/**
 * Array of all spec tokens for validation.
 */
export const ALL_SPEC_TOKENS: readonly SpecToken[] = Object.keys(
  SPEC_TO_RUNTIME_MAP
) as SpecToken[];

/**
 * Verifier class file mapping.
 * Maps verifier class names to their source file paths (relative to src/).
 */
export const VERIFIER_FILE_MAP: Record<VerifierClassName, string> = {
  CommandVerifier: 'verification/verifiers/command-verifier.ts',
  RegexVerifier: 'verification/verifiers/regex-verifier.ts',
  FileExistsVerifier: 'verification/verifiers/file-exists-verifier.ts',
  BrowserVerifier: 'verification/verifiers/browser-verifier.ts',
  AIVerifier: 'verification/verifiers/ai-verifier.ts',
};

/**
 * Type guard to check if a string is a valid criterion type.
 */
export function isCriterionType(type: string): type is CriterionType {
  return (ALL_CRITERION_TYPES as readonly string[]).includes(type);
}

/**
 * Type guard to check if a string is a valid spec token.
 */
export function isSpecToken(token: string): token is SpecToken {
  return (ALL_SPEC_TOKENS as readonly string[]).includes(token);
}

/**
 * Get the runtime criterion type for a spec token.
 * Returns undefined if token is not recognized.
 */
export function getSpecToRuntime(token: string): CriterionType | undefined {
  if (isSpecToken(token)) {
    return SPEC_TO_RUNTIME_MAP[token];
  }
  return undefined;
}

/**
 * Get the verifier class name for a criterion type.
 */
export function getVerifierClass(type: CriterionType): VerifierClassName {
  return CRITERION_TYPE_CONTRACT[type];
}

/**
 * Explicitly excluded types with reasons.
 * Documents types that are intentionally NOT supported.
 */
export const EXCLUDED_CRITERION_TYPES = {
  /**
   * Manual verification is not supported.
   * All acceptance criteria must be machine-verifiable.
   * See REQUIREMENTS.md "no manual tests" requirement.
   */
  manual: 'Machine verification required - no manual verification allowed',
} as const;
