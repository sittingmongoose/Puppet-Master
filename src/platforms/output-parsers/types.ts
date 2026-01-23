/**
 * Platform Output Parser Types
 *
 * Defines interfaces for platform-specific output parsing that normalizes
 * different output formats to a common structure.
 *
 * Per BUILD_QUEUE_IMPROVEMENTS.md P1-T10.
 */

import type { TestResult } from '../../types/prd.js';

/**
 * Completion signal type.
 * Indicates whether the agent completed successfully, is stuck (gutter), or neither.
 */
export type CompletionSignal = 'COMPLETE' | 'GUTTER' | 'NONE';

/**
 * RALPH_STATUS block extracted from agent output.
 * Agents may emit structured status blocks with additional context.
 */
export interface RalphStatusBlock {
  status: 'COMPLETE' | 'GUTTER';
  message?: string;
  filesChanged?: string[];
  testsRun?: string[];
  errors?: string[];
}

/**
 * Normalized output from any platform.
 * All platform-specific parsers produce this common structure.
 */
export interface ParsedPlatformOutput {
  /** Detected completion signal (COMPLETE, GUTTER, or NONE) */
  completionSignal: CompletionSignal;

  /** Parsed RALPH_STATUS block if present in output */
  statusBlock?: RalphStatusBlock;

  /** Files detected as changed in the output */
  filesChanged: string[];

  /** Test results extracted from output */
  testResults: TestResult[];

  /** Errors extracted from output */
  errors: string[];

  /** Warnings extracted from output */
  warnings: string[];

  /** The original raw output string */
  rawOutput: string;

  /** Session ID if present (format: PM-YYYY-MM-DD-HH-MM-SS-NNN) */
  sessionId?: string;

  /** Token count if reported by the platform */
  tokensUsed?: number;

  /** Model name if reported by the platform */
  model?: string;

  /** Learnings extracted from output (gotcha:, learned:, note:, etc.) */
  learnings?: string[];

  /** Suggested AGENTS.md update if detected */
  suggestedAgentsUpdate?: string;
}

/**
 * Platform output parser interface.
 * Each platform implements this to parse its specific output format.
 */
export interface PlatformOutputParser {
  /**
   * Parse platform output into normalized structure.
   *
   * IMPORTANT: This method should NEVER throw on malformed input.
   * Always return a valid ParsedPlatformOutput with at least rawOutput set.
   *
   * @param output - Raw output string from the platform
   * @returns Normalized parsed output
   */
  parse(output: string): ParsedPlatformOutput;
}
