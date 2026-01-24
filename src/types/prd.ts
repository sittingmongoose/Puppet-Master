/**
 * PRD (Product Requirements Document) types
 * 
 * This file defines types for the structured work queue (prd.json).
 * See STATE_FILES.md Section 3.3 for the complete schema specification.
 */

import type { Criterion, TestPlan } from './tiers.js';
import type { OrchestratorContext, OrchestratorState } from './state.js';
import type { TierContext } from '../core/tier-state-machine.js';

/**
 * Item status type.
 * Represents the status of a phase, task, or subtask.
 * See STATE_FILES.md Section 3.3.
 */
export type ItemStatus =
  | 'pending'
  | 'planning'
  | 'running'
  | 'gating'
  | 'passed'
  | 'failed'
  | 'escalated'
  | 'reopened';

/**
 * Test result interface.
 * Represents the result of a test command execution.
 */
export interface TestResult {
  command: string;
  passed: boolean;
  output?: string;
  exitCode?: number;
  durationMs?: number;
}

/**
 * Criterion result interface.
 * Represents the result of checking an acceptance criterion.
 */
export interface CriterionResult {
  criterionId: string;
  passed: boolean;
  evidence?: string;
}

/**
 * Evidence item interface.
 * Represents a single piece of evidence.
 * See STATE_FILES.md Section 3.3.
 */
export interface EvidenceItem {
  type: 'log' | 'screenshot' | 'file' | 'metric';
  path: string;
  summary: string;
}

/**
 * Evidence interface for PRD.
 * Represents verification evidence collected during tier execution.
 * See STATE_FILES.md Section 3.3.
 */
export interface Evidence {
  collectedAt: string;
  items: EvidenceItem[];
}

/**
 * Verifier result interface for PRD.
 * Represents the result of a single verifier execution.
 * See STATE_FILES.md Section 3.3.
 */
export interface VerifierResult {
  type: string;
  target: string;
  passed: boolean;
  evidencePath?: string;
  summary: string;
  durationMs: number;
}

/**
 * Gate report interface for PRD.
 * Represents a gate verification report.
 * See STATE_FILES.md Section 3.3.
 */
export interface GateReport {
  gateType: 'task' | 'phase';
  executedAt: string;
  platform: string;
  model: string;
  testResults: TestResult[];
  acceptanceResults: CriterionResult[];
  verifierResults: VerifierResult[];
  passed: boolean;
  decision: 'pass' | 'self_fix' | 'kick_down' | 'escalate';
  reason?: string;
  agentsUpdated: boolean;
}

/**
 * Source reference interface.
 * Represents a link from a PRD item back to the source requirements document.
 * Used for traceability: "Which PRD items cover Requirement 4.2?"
 */
export interface SourceRef {
  /** File path to the source requirements document */
  sourcePath: string;
  /** Section heading path (e.g., "Requirements > Section 4.2") */
  sectionPath: string;
  /** SHA-256 hash of the source text excerpt */
  excerptHash: string;
  /** Optional line number range [start, end] in the source file */
  lineNumbers?: [number, number];
}

/**
 * Iteration interface.
 * Represents a single iteration attempt for a subtask.
 * See STATE_FILES.md Section 3.3.
 */
export interface Iteration {
  id: string; // Format: "IT-001-001-001-001"
  subtaskId: string;
  attemptNumber: number;
  status: 'running' | 'succeeded' | 'failed';
  startedAt: string;
  completedAt?: string;
  platform: string;
  model: string;
  sessionId: string; // Format: PM-YYYY-MM-DD-HH-MM-SS-NNN
  processId: number;
  output?: string;
  testsRun?: TestResult[];
  acceptanceChecked?: CriterionResult[];
  gitCommit?: string;
}

/**
 * Subtask interface.
 * Represents a subtask within a task.
 * See STATE_FILES.md Section 3.3.
 */
export interface Subtask {
  id: string; // Format: "ST-001-001-001"
  taskId: string;
  title: string;
  description: string;
  status: ItemStatus;
  priority: number;
  acceptanceCriteria: Criterion[];
  testPlan: TestPlan;
  iterations: Iteration[];
  maxIterations: number;
  evidence?: Evidence;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  notes: string;
  /**
   * Optional source references for traceability.
   * Links this PRD item back to the source requirements document sections.
   */
  sourceRefs?: SourceRef[];
  /**
   * Optional tier context for state persistence.
   * Used by StatePersistence to save/restore tier state machine state.
   */
  tierContext?: TierContext;
  /**
   * Optional dependency list for parallel execution.
   * Array of subtask IDs within the same task that must complete before this subtask.
   * If empty or undefined, subtask has no dependencies and can run in parallel.
   * See BUILD_QUEUE_IMPROVEMENTS.md P2-T01.
   */
  dependsOn?: string[];
}

/**
 * Task interface.
 * Represents a task within a phase.
 * See STATE_FILES.md Section 3.3.
 */
export interface Task {
  id: string; // Format: "TK-001-001"
  phaseId: string;
  title: string;
  description: string;
  status: ItemStatus;
  priority: number;
  acceptanceCriteria: Criterion[];
  testPlan: TestPlan;
  subtasks: Subtask[];
  evidence?: Evidence;
  gateReport?: GateReport;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  notes: string;
  /**
   * Optional source references for traceability.
   * Links this PRD item back to the source requirements document sections.
   */
  sourceRefs?: SourceRef[];
  /**
   * Optional tier context for state persistence.
   * Used by StatePersistence to save/restore tier state machine state.
   */
  tierContext?: TierContext;
  /**
   * Optional override for parallel execution of subtasks.
   * - true: Enable parallel execution for this task's subtasks
   * - false: Force sequential execution
   * - undefined: Use global config setting
   * See BUILD_QUEUE_IMPROVEMENTS.md P2-T01.
   */
  parallel?: boolean;
}

/**
 * Phase interface.
 * Represents a phase in the project.
 * See STATE_FILES.md Section 3.3.
 */
export interface Phase {
  id: string; // Format: "PH-001"
  title: string;
  description: string;
  status: ItemStatus;
  priority: number;
  acceptanceCriteria: Criterion[];
  testPlan: TestPlan;
  tasks: Task[];
  evidence?: Evidence;
  gateReport?: GateReport;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  notes: string;
  /**
   * Optional source references for traceability.
   * Links this PRD item back to the source requirements document sections.
   */
  sourceRefs?: SourceRef[];
  /**
   * Optional tier context for state persistence.
   * Used by StatePersistence to save/restore tier state machine state.
   */
  tierContext?: TierContext;
}

/**
 * PRD metadata interface.
 * Represents counts and statistics for the PRD.
 * See STATE_FILES.md Section 3.3.
 */
export interface PRDMetadata {
  totalPhases: number;
  completedPhases: number;
  totalTasks: number;
  completedTasks: number;
  totalSubtasks: number;
  completedSubtasks: number;
}

/**
 * PRD (Product Requirements Document) interface.
 * Root interface for the structured work queue.
 * See STATE_FILES.md Section 3.3.
 */
export interface PRD {
  project: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  branchName: string;
  description: string;
  phases: Phase[];
  metadata: PRDMetadata;
  /**
   * Optional orchestrator state persistence.
   * Used by StatePersistence to save/restore orchestrator state.
   */
  orchestratorState?: OrchestratorState;
  orchestratorContext?: OrchestratorContext;
}
