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
 * 
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T22, P1-T23, and P1-T25 for implementation details.
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
