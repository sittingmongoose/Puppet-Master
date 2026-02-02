/**
 * AI Gap Detection Types
 *
 * Types for the AI-assisted gap detection system that identifies semantic gaps
 * between PRD specifications, architecture design, and actual codebase.
 *
 * Static analysis catches syntax/structural issues but misses:
 * - Semantic gaps (PRD says "handle errors" but no error handling exists)
 * - Integration gaps (components exist but aren't connected)
 * - Missing edge cases
 * - Architectural misalignments
 *
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T26 for implementation details.
 */

import type { Platform } from './config.js';

// =============================================================================
// Gap Type Definitions
// =============================================================================

/**
 * Types of gaps that can be detected by AI analysis.
 *
 * Each type represents a category of semantic issues that static analysis cannot catch.
 */
export type GapType =
  | 'missing_implementation'  // PRD item with no corresponding code
  | 'integration_gap'         // Components exist but aren't connected
  | 'architectural_mismatch'  // Code doesn't follow architecture design
  | 'missing_error_handling'  // External calls without try/catch, no timeout/retry
  | 'missing_edge_case'       // Boundary conditions not handled
  | 'incomplete_feature'      // Partial implementation, TODOs, stubs
  | 'untested_path'           // Code paths without test coverage
  | 'config_gap';             // Config options referenced but not defined

/**
 * Severity levels for detected gaps.
 *
 * - critical: Must block deployment; system cannot function
 * - high: Should fix before production; significant risk
 * - medium: Should fix eventually; moderate risk
 * - low: Nice to fix; minimal risk
 */
export type GapSeverity = 'critical' | 'high' | 'medium' | 'low';

// =============================================================================
// Input Types
// =============================================================================

/**
 * Information about a file in the codebase.
 */
export interface CodebaseFile {
  /** Relative path from project root */
  path: string;
  /** File size in bytes */
  size: number;
  /** Whether this is a source file (vs config, docs, etc.) */
  isSource: boolean;
  /** Exported symbols (for source files) */
  exports?: string[];
  /** Imported modules (for source files) */
  imports?: string[];
}

/**
 * Information about a module/component in the codebase.
 */
export interface CodebaseModule {
  /** Module name (directory name or logical grouping) */
  name: string;
  /** Module path relative to source root */
  path: string;
  /** Description of module purpose (if discernible) */
  description?: string;
  /** Files in this module */
  files: string[];
  /** Public exports from this module */
  exports: string[];
  /** Dependencies on other modules */
  dependencies: string[];
}

/**
 * Structure of the codebase for gap analysis.
 */
export interface CodebaseStructure {
  /** Project root directory */
  projectRoot: string;
  /** Source directories */
  sourceDirs: string[];
  /** All files in the project */
  files: CodebaseFile[];
  /** Logical modules/components */
  modules: CodebaseModule[];
  /** Entry point files */
  entryPoints: string[];
  /** Configuration files */
  configFiles: string[];
  /** Total lines of code (approximate) */
  totalLinesOfCode?: number;
}

/**
 * Information about existing tests in the codebase.
 */
export interface TestInfo {
  /** Test file path */
  file: string;
  /** Number of test cases (approximate) */
  testCount: number;
  /** Coverage patterns (what the tests cover) */
  coveragePatterns: string[];
  /** Test framework used */
  framework?: 'vitest' | 'jest' | 'mocha' | 'other';
}

/**
 * Input for AI gap detection.
 *
 * Provides all artifacts needed for comprehensive gap analysis.
 */
export interface GapDetectionInput {
  /** PRD content (summary or full) */
  prd: GapDetectionPRDSummary;
  /** Architecture document content */
  architecture: string;
  /** Codebase structure information */
  codebaseStructure: CodebaseStructure;
  /** Existing test information */
  existingTests: TestInfo[];
  /** Optional: Project-specific context */
  projectContext?: {
    /** Project name */
    name: string;
    /** Project type (node, python, etc.) */
    type: string;
    /** Key technologies used */
    technologies: string[];
  };
}

/**
 * Summarized PRD for gap detection input.
 *
 * Contains essential PRD information without full content for prompt efficiency.
 */
export interface GapDetectionPRDSummary {
  /** Project name */
  project: string;
  /** Total number of phases */
  phaseCount: number;
  /** Total number of tasks */
  taskCount: number;
  /** Total number of subtasks */
  subtaskCount: number;
  /** Summarized phases with key information */
  phases: GapDetectionPhaseSummary[];
}

/**
 * Summarized phase for gap detection.
 */
export interface GapDetectionPhaseSummary {
  /** Phase ID */
  id: string;
  /** Phase title */
  title: string;
  /** Tasks in this phase */
  tasks: GapDetectionTaskSummary[];
}

/**
 * Summarized task for gap detection.
 */
export interface GapDetectionTaskSummary {
  /** Task ID */
  id: string;
  /** Task title */
  title: string;
  /** Subtasks in this task */
  subtasks: GapDetectionSubtaskSummary[];
}

/**
 * Summarized subtask for gap detection.
 */
export interface GapDetectionSubtaskSummary {
  /** Subtask ID */
  id: string;
  /** Subtask title */
  title: string;
  /** Acceptance criteria descriptions */
  acceptanceCriteria: string[];
}

// =============================================================================
// Output Types
// =============================================================================

/**
 * A single gap detected by AI analysis.
 */
export interface DetectedGap {
  /** Unique gap identifier (e.g., GAP-001) */
  id: string;
  /** Type of gap */
  type: GapType;
  /** Severity level */
  severity: GapSeverity;
  /** Related PRD item ID (if applicable) */
  prdItemId?: string;
  /** Location in codebase (file path or component) */
  location?: string;
  /** Human-readable description of the gap */
  description: string;
  /** Evidence explaining WHY this is a gap */
  evidence: string;
  /** Suggested fix for the gap */
  suggestedFix: string;
}

/**
 * Coverage metrics from gap detection.
 */
export interface GapDetectionCoverage {
  /** Number of PRD items that have corresponding code */
  prdItemsCovered: number;
  /** Total number of PRD items analyzed */
  prdItemsTotal: number;
  /** Number of architecture components implemented */
  architectureComponentsCovered: number;
  /** Total architecture components specified */
  architectureComponentsTotal: number;
}

/**
 * Result of AI gap detection analysis.
 */
export interface GapDetectionResult {
  /** Detected gaps */
  gaps: DetectedGap[];
  /** Coverage metrics */
  coverage: GapDetectionCoverage;
  /** AI's confidence in the analysis (0-1) */
  confidence: number;
  /** Analysis timestamp */
  timestamp: string;
  /** Duration of analysis in milliseconds */
  durationMs: number;
  /** Any warnings during analysis */
  warnings?: string[];
  /** Error if analysis failed */
  error?: string;
}

// =============================================================================
// Configuration Types
// =============================================================================

/**
 * Configuration for AIGapDetector.
 */
export interface AIGapDetectorConfig {
  /** AI platform to use for gap detection */
  platform: Platform;
  /** Model to use (platform-specific) */
  model?: string;
  /** Temperature for AI generation (default: 0.2 for consistency) */
  temperature?: number;
  /** Maximum tokens for response */
  maxTokens?: number;
  /** Timeout for AI request in milliseconds */
  timeout?: number;
}

/**
 * Configuration for AIGapValidator.
 */
export interface AIGapValidatorConfig {
  /** Enable AI gap detection (default: true) */
  enabled: boolean;
  /** Maximum number of high-severity gaps before failing (default: 5) */
  maxHighGaps: number;
  /** Block pipeline on any critical gaps (default: true) */
  blockOnCritical: boolean;
  /** AI platform configuration */
  detector: AIGapDetectorConfig;
  /** Path to save reports (relative to project root) */
  reportPath?: string;
}

/**
 * Default configuration for AIGapValidator.
 */
export const DEFAULT_AI_GAP_VALIDATOR_CONFIG: AIGapValidatorConfig = {
  enabled: true,
  maxHighGaps: 5,
  blockOnCritical: true,
  detector: {
    platform: 'claude',
    temperature: 0.2,
    maxTokens: 8000,
    timeout: 120_000, // 2 minutes
  },
  reportPath: '.puppet-master/audits/ai-gap-detection.json',
};

/**
 * Default configuration for AIGapDetector.
 */
export const DEFAULT_AI_GAP_DETECTOR_CONFIG: AIGapDetectorConfig = {
  platform: 'claude',
  temperature: 0.2,
  maxTokens: 8000,
  timeout: 120_000,
};

// =============================================================================
// Validation Types
// =============================================================================

/**
 * Validation error from gap analysis.
 */
export interface GapValidationError {
  /** Error code */
  code: 'AI_GAP_CRITICAL' | 'AI_GAP_TOO_MANY_HIGH' | 'AI_GAP_DETECTION_FAILED';
  /** Error message */
  message: string;
  /** Location (file path or component) */
  path?: string;
  /** Suggested fix */
  suggestion?: string;
}

/**
 * Validation warning from gap analysis.
 */
export interface GapValidationWarning {
  /** Warning code */
  code: 'AI_GAP_HIGH' | 'AI_GAP_MEDIUM' | 'AI_GAP_LOW' | 'AI_GAP_SKIPPED';
  /** Warning message */
  message: string;
}

/**
 * Result of AI gap validation.
 */
export interface AIGapValidationResult {
  /** Whether validation passed */
  passed: boolean;
  /** Validation errors */
  errors: GapValidationError[];
  /** Validation warnings */
  warnings: GapValidationWarning[];
  /** Full gap detection result */
  gapDetectionResult?: GapDetectionResult;
  /** Path to saved report */
  reportPath?: string;
}

// =============================================================================
// Schema for AI Response (JSON Schema-like structure for prompts)
// =============================================================================

/**
 * JSON Schema structure for AI gap detection response.
 *
 * This is used in prompts to constrain AI output format.
 */
export const GAP_DETECTION_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', pattern: '^GAP-\\d{3}$' },
          type: {
            type: 'string',
            enum: [
              'missing_implementation',
              'integration_gap',
              'architectural_mismatch',
              'missing_error_handling',
              'missing_edge_case',
              'incomplete_feature',
              'untested_path',
              'config_gap',
            ],
          },
          severity: {
            type: 'string',
            enum: ['critical', 'high', 'medium', 'low'],
          },
          prdItemId: { type: 'string' },
          location: { type: 'string' },
          description: { type: 'string' },
          evidence: { type: 'string' },
          suggestedFix: { type: 'string' },
        },
        required: ['id', 'type', 'severity', 'description', 'evidence', 'suggestedFix'],
      },
    },
    coverage: {
      type: 'object',
      properties: {
        prdItemsCovered: { type: 'number' },
        prdItemsTotal: { type: 'number' },
        architectureComponentsCovered: { type: 'number' },
        architectureComponentsTotal: { type: 'number' },
      },
      required: ['prdItemsCovered', 'prdItemsTotal', 'architectureComponentsCovered', 'architectureComponentsTotal'],
    },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
  },
  required: ['gaps', 'coverage', 'confidence'],
} as const;
