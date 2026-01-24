/**
 * Audits Module
 * 
 * Provides implementation wiring audit capabilities to detect:
 * - Orphan exports
 * - Unused container registrations
 * - Missing dependency injections
 * - Dead imports
 * - Event name mismatches
 * - Verifier registration gaps
 * - Cross-file contract violations
 * - Dead code (unused classes, functions, methods)
 * - AI-assisted semantic gap detection (P1-T26)
 * 
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T22, P1-T23, P1-T25, and P1-T26 for implementation details.
 */

// Types
export type {
  WiringIssueType,
  WiringSeverity,
  WiringLocation,
  WiringIssue,
  WiringAuditConfig,
  WiringAuditSummary,
  WiringAuditResult,
  ExportInfo,
  ImportInfo,
  RegistrationInfo,
  ResolutionInfo,
  EventEmission,
  EventSubscription,
  RWMAuditConfig,
  // Dead code types (P1-T25)
  DeadCodeIssueType,
  DeadCodeIssue,
  DeadCodeDetectorConfig,
  DeadCodeSummary,
  DeadCodeReport,
} from './types.js';

export { DEFAULT_RWM_AUDIT_CONFIG, DEFAULT_DEAD_CODE_CONFIG } from './types.js';

// Generic Wiring Auditor
export { WiringAuditor, createDefaultConfig } from './wiring-audit.js';

// RWM-Specific Auditor
export { auditRWMWiring, runFullAudit } from './rwm-specific-audit.js';

// Contract Validator (P1-T23)
export {
  ContractValidator,
  createContractValidator,
  validateContracts,
} from './contract-validator.js';

export type {
  ContractViolation,
  ContractValidationResult,
  ContractValidatorConfig,
} from './contract-validator.js';

// Dead Code Detector (P1-T25)
export {
  DeadCodeDetector,
  createDeadCodeDetector,
  detectDeadCode,
} from './dead-code-detector.js';

// AI Gap Detector (P1-T26)
export {
  AIGapDetector,
  createAIGapDetector,
} from './ai-gap-detector.js';

// Integration Path Matrix and Validator (P1-T27)
export {
  INTEGRATION_PATH_MATRIX,
  getPathsByCategory,
  getPathsByPriority,
  getPathById,
  getCriticalPaths,
  getRequiredTestFiles,
  getDependentPaths,
} from './integration-path-matrix.js';

export type {
  IntegrationPath,
  IntegrationPathPriority,
  IntegrationPathCategory,
} from './integration-path-matrix.js';

export {
  IntegrationPathValidator,
  createIntegrationPathValidator,
  validateIntegrationPaths,
  checkCriticalPaths,
} from './integration-path-validator.js';

export type {
  PathValidationResult,
  ValidationSummary,
  IntegrationPathValidationResult,
  IntegrationPathValidatorConfig,
} from './integration-path-validator.js';
