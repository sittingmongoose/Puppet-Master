/**
 * Wiring Audit Types
 * 
 * Types for the implementation wiring audit system that detects:
 * - Orphan exports (exported but never imported)
 * - Unused container registrations
 * - Missing dependency injections
 * - Dead imports
 * - Event name mismatches
 * - Verifier registration gaps
 * 
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T22 for implementation details.
 */

/**
 * Types of wiring issues that can be detected.
 */
export type WiringIssueType =
  | 'orphan_export'        // Exported symbol never imported anywhere
  | 'unused_registration'  // Container registration never resolved
  | 'missing_injection'    // Dependency expected but not provided
  | 'dead_import'          // Import statement not used in file
  | 'unresolved_dependency' // Dependency type exists but no implementation
  | 'event_mismatch';      // Backend/frontend event name mismatch

/**
 * Severity levels for wiring issues.
 */
export type WiringSeverity = 'error' | 'warning';

/**
 * Location information for a wiring issue.
 */
export interface WiringLocation {
  /** File path relative to project root */
  file: string;
  /** Line number (1-indexed) */
  line?: number;
  /** Column number (1-indexed) */
  column?: number;
  /** Symbol name (function, class, variable, etc.) */
  symbol: string;
}

/**
 * A single wiring issue detected by the audit.
 */
export interface WiringIssue {
  /** Type of wiring failure */
  type: WiringIssueType;
  /** Severity of the issue */
  severity: WiringSeverity;
  /** Location where the issue was detected */
  location: WiringLocation;
  /** Human-readable description of the issue */
  description: string;
  /** Suggested fix for the issue */
  suggestion: string;
  /** Additional context or related locations */
  relatedLocations?: WiringLocation[];
}

/**
 * Configuration for the wiring audit.
 */
export interface WiringAuditConfig {
  /** Root directory of the project */
  rootDir: string;
  /** Glob patterns to include in audit */
  include: string[];
  /** Glob patterns to exclude from audit */
  exclude: string[];
  /** Entry point files (allowed to have unused exports) */
  entryPoints: string[];
  /** Path to the DI container file */
  containerFile: string;
  /** Paths that are allowed to have orphan exports */
  allowedOrphanPaths?: string[];
  /** Specific symbols to ignore */
  ignoreSymbols?: string[];
}

/**
 * Summary statistics from the wiring audit.
 */
export interface WiringAuditSummary {
  /** Total exports found */
  totalExports: number;
  /** Orphan exports (no imports) */
  orphanExports: number;
  /** Total container registrations */
  totalRegistrations: number;
  /** Unused registrations */
  unusedRegistrations: number;
  /** Total constructor injections expected */
  totalInjections: number;
  /** Missing injections */
  missingInjections: number;
  /** Total imports found */
  totalImports: number;
  /** Dead imports */
  deadImports: number;
  /** Event mismatches */
  eventMismatches: number;
  /** Verifier gaps */
  verifierGaps: number;
}

/**
 * Result of a wiring audit run.
 */
export interface WiringAuditResult {
  /** All detected issues */
  issues: WiringIssue[];
  /** Summary statistics */
  summary: WiringAuditSummary;
  /** Whether the audit passed (no errors) */
  passed: boolean;
  /** Duration of the audit in milliseconds */
  durationMs: number;
  /** Timestamp when audit was run */
  timestamp: string;
  /** Configuration used for the audit */
  config: WiringAuditConfig;
}

/**
 * Export information extracted from source files.
 */
export interface ExportInfo {
  /** Symbol name being exported */
  symbol: string;
  /** File containing the export */
  file: string;
  /** Line number of the export */
  line: number;
  /** Whether it's a type-only export */
  isType: boolean;
  /** Whether it's a re-export from another file */
  isReExport: boolean;
  /** Original source file for re-exports */
  reExportSource?: string;
}

/**
 * Import information extracted from source files.
 */
export interface ImportInfo {
  /** Symbol name being imported */
  symbol: string;
  /** File containing the import */
  file: string;
  /** Line number of the import */
  line: number;
  /** Source module path */
  fromModule: string;
  /** Whether it's a type-only import */
  isType: boolean;
  /** Whether the import is actually used in the file */
  isUsed: boolean;
}

/**
 * Container registration information.
 */
export interface RegistrationInfo {
  /** Registration key */
  key: string;
  /** Line number of registration */
  line: number;
  /** Registration type (singleton, transient, factory) */
  registrationType: 'singleton' | 'transient' | 'factory' | 'instance';
  /** Factory function source (if available) */
  factorySource?: string;
}

/**
 * Container resolution information.
 */
export interface ResolutionInfo {
  /** Resolution key */
  key: string;
  /** File where resolution occurs */
  file: string;
  /** Line number of resolution */
  line: number;
}

/**
 * Event emission information.
 */
export interface EventEmission {
  /** Event type/name */
  eventType: string;
  /** File where emission occurs */
  file: string;
  /** Line number */
  line: number;
}

/**
 * Event subscription information.
 */
export interface EventSubscription {
  /** Event type/name being listened for */
  eventType: string;
  /** File where subscription occurs */
  file: string;
  /** Line number */
  line: number;
}

/**
 * RWM-specific audit configuration.
 */
export interface RWMAuditConfig {
  /** Project root directory */
  projectRoot: string;
  /** Path to orchestrator file */
  orchestratorFile: string;
  /** Path to container file */
  containerFile: string;
  /** Path to event bus file */
  eventBusFile: string;
  /** Path to tiers type file */
  tiersFile: string;
  /** Path to frontend dashboard file */
  dashboardFile: string;
}

/**
 * Default configuration for RWM audits.
 */
export const DEFAULT_RWM_AUDIT_CONFIG: Omit<RWMAuditConfig, 'projectRoot'> = {
  orchestratorFile: 'src/core/orchestrator.ts',
  containerFile: 'src/core/container.ts',
  eventBusFile: 'src/logging/event-bus.ts',
  tiersFile: 'src/types/tiers.ts',
  dashboardFile: 'src/gui/public/js/dashboard.js',
};

// =============================================================================
// Dead Code Detection Types (P1-T25)
// =============================================================================

/**
 * Types of dead code issues that can be detected.
 */
export type DeadCodeIssueType =
  | 'orphan_export'      // Exported symbol never imported anywhere
  | 'unused_class'       // Class is never instantiated
  | 'unused_function'    // Function is never called
  | 'unused_method'      // Method is never called (and not interface impl)
  | 'unreachable_code'   // Code that can never be executed
  | 'unused_parameter';  // Parameter that is never used (future)

/**
 * A single dead code issue detected by the detector.
 */
export interface DeadCodeIssue {
  /** Type of dead code issue */
  type: DeadCodeIssueType;
  /** Severity of the issue */
  severity: 'error' | 'warning';
  /** File path relative to project root */
  file: string;
  /** Line number (1-indexed) */
  line: number;
  /** Symbol name */
  symbol: string;
  /** Human-readable description */
  description: string;
  /** Lines of code impacted (for prioritization) */
  linesOfCode: number;
  /** Parent class name (for methods) */
  parentClass?: string;
}

/**
 * Configuration for the dead code detector.
 */
export interface DeadCodeDetectorConfig {
  /** Root directory of the project */
  rootDir: string;
  /** Entry point files (exports allowed to be unused) */
  entryPoints: string[];
  /** Paths to skip for unused class/function checks */
  skipPaths: string[];
  /** Symbols to ignore (e.g., reserved names) */
  ignoreSymbols: string[];
  /** Whether to check for unused methods */
  checkMethods: boolean;
  /** Whether to include test files in analysis */
  includeTests: boolean;
}

/**
 * Summary statistics from the dead code detection.
 */
export interface DeadCodeSummary {
  /** Total lines of dead code found */
  totalDeadLines: number;
  /** Lines by issue type */
  byType: Record<DeadCodeIssueType, number>;
  /** Top N largest orphans (by lines of code) */
  largestOrphans: DeadCodeIssue[];
  /** Total issues by severity */
  errorCount: number;
  warningCount: number;
}

/**
 * Result of a dead code detection run.
 */
export interface DeadCodeReport {
  /** All detected issues */
  issues: DeadCodeIssue[];
  /** Summary statistics */
  summary: DeadCodeSummary;
  /** Whether the detection passed (no errors) */
  passed: boolean;
  /** Duration of the detection in milliseconds */
  durationMs: number;
  /** Timestamp when detection was run */
  timestamp: string;
  /** Configuration used */
  config: DeadCodeDetectorConfig;
}

/**
 * Default configuration for dead code detection.
 */
export const DEFAULT_DEAD_CODE_CONFIG: Omit<DeadCodeDetectorConfig, 'rootDir'> = {
  entryPoints: [
    'src/cli/index.ts',
    'src/gui/server.ts',
    'src/gui/start-gui.ts',
    'src/index.ts',
  ],
  skipPaths: [
    'src/types/',           // Type definitions are often orphaned by design
    'node_modules/',
  ],
  ignoreSymbols: [
    'constructor',
    'default',
  ],
  checkMethods: true,
  includeTests: false,
};
