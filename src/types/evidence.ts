/**
 * Evidence type definitions
 * 
 * Types for evidence artifacts stored by EvidenceStore.
 * See STATE_FILES.md Section 6 and REQUIREMENTS.md Section 25.5.
 */

/**
 * Evidence type union.
 * Represents the different types of evidence artifacts.
 */
export type EvidenceType = 
  | 'log' 
  | 'screenshot' 
  | 'trace' 
  | 'snapshot' 
  | 'metric' 
  | 'gate-report';

/**
 * Stored evidence interface.
 * Represents a single evidence artifact stored by EvidenceStore.
 * Extends the base Evidence interface with itemId and metadata.
 */
export interface StoredEvidence {
  /** Type of evidence */
  type: EvidenceType;
  /** File system path to the evidence file */
  path: string;
  /** Human-readable summary of the evidence */
  summary: string;
  /** ISO timestamp when evidence was collected */
  timestamp: string;
  /** Item ID (phase, task, subtask, or iteration ID) */
  itemId: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Alias for StoredEvidence for backward compatibility.
 * @deprecated Use StoredEvidence instead
 */
export type Evidence = StoredEvidence;

/**
 * Verifier result summary.
 * Used in gate reports to summarize verifier execution.
 */
export interface VerifierResultSummary {
  /** Verifier type (e.g., 'TEST', 'CLI_VERIFY', 'BROWSER_VERIFY') */
  type: string;
  /** Target that was verified */
  target: string;
  /** Whether verification passed */
  passed: boolean;
  /** Optional path to evidence file */
  evidencePath?: string;
  /** Summary of verification result */
  summary: string;
}

/**
 * Gate report evidence.
 * Represents a complete gate report stored as evidence.
 */
export interface GateReportEvidence {
  /** Gate ID (e.g., 'TK-001-001') */
  gateId: string;
  /** ISO timestamp when gate was executed */
  timestamp: string;
  /** List of verifiers that were run */
  verifiersRun: VerifierResultSummary[];
  /** Whether the gate overall passed */
  overallPassed: boolean;
  /** Tier type for this gate */
  tierType: 'phase' | 'task' | 'subtask';
}
