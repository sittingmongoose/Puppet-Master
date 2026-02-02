/**
 * Contracts Module
 * 
 * Single source of truth for cross-file contracts that enforce consistency
 * between related definitions in different files.
 * 
 * Contracts defined here are validated by src/audits/contract-validator.ts
 * and enforced at build/CI time via scripts/validate-contracts.ts.
 * 
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T23 for implementation details.
 */

// Event Contract
export {
  EVENT_CONTRACT,
  ALL_BACKEND_EVENT_NAMES,
  FRONTEND_EVENT_MAP,
  ALL_FRONTEND_MESSAGE_TYPES,
  BACKEND_TO_FRONTEND_MAP,
  isBackendEventName,
  isFrontendMessageType,
  getBackendToFrontend,
} from './events.contract.js';

export type {
  BackendEventName,
  FrontendMessageType,
} from './events.contract.js';

// Criterion Type Contract
export {
  CRITERION_TYPE_CONTRACT,
  ALL_CRITERION_TYPES,
  ALL_VERIFIER_CLASSES,
  SPEC_TO_RUNTIME_MAP,
  ALL_SPEC_TOKENS,
  VERIFIER_FILE_MAP,
  EXCLUDED_CRITERION_TYPES,
  isCriterionType,
  isSpecToken,
  getSpecToRuntime,
  getVerifierClass,
} from './criterion-types.contract.js';

export type {
  CriterionType,
  VerifierClassName,
  SpecToken,
} from './criterion-types.contract.js';

// PRD Schema Contract
export {
  VERIFIER_TOKEN_PATTERNS,
  ANY_VERIFIER_TOKEN_PATTERN,
  PRD_STATUS_VALUES,
  PRD_ID_PATTERNS,
  PRD_SCHEMA_EXPECTATIONS,
  isValidPrdId,
  parseVerifierToken,
  isValidCriterionType,
  isValidPrdStatus,
  getVerifierTokenExamples,
} from './prd-schema.contract.js';

export type { PrdItemStatus } from './prd-schema.contract.js';
