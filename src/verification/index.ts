/**
 * Verification module exports
 * 
 * Exports gate runner, verifier registry, and all verifier implementations.
 */

export { GateRunner, VerifierRegistry } from './gate-runner.js';
export type { GateConfig } from './gate-runner.js';

export { VerificationIntegration } from './verification-integration.js';

// Export all verifiers
export { BrowserVerifier } from './verifiers/browser-verifier.js';
export type {
  BrowserCriterion,
  BrowserCriterionOptions,
  BrowserAction,
  BrowserActionType,
  BrowserVerifierConfig,
} from './verifiers/browser-verifier.js';

export { CommandVerifier } from './verifiers/command-verifier.js';
export type {
  CommandCriterion,
  CommandCriterionOptions,
} from './verifiers/command-verifier.js';

export { FileExistsVerifier } from './verifiers/file-exists-verifier.js';
export type {
  FileExistsCriterion,
  FileExistsOptions,
} from './verifiers/file-exists-verifier.js';

export { RegexVerifier } from './verifiers/regex-verifier.js';
export type {
  RegexCriterion,
  RegexCriterionOptions,
} from './verifiers/regex-verifier.js';

export { AIVerifier } from './verifiers/ai-verifier.js';
export type {
  AICriterion,
  AICriterionOptions,
  AIVerificationResult,
} from './verifiers/ai-verifier.js';

export type { Verifier } from './verifiers/verifier.js';
