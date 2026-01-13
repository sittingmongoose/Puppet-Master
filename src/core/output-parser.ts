/**
 * OutputParser
 *
 * Parses agent output to extract completion signals, learnings, files changed,
 * test results, errors, and gutter indicators.
 *
 * See REQUIREMENTS.md Section 18 (Gutter Detection) and Appendix G (completion signals).
 */

import type { TestResult } from '../types/prd.js';

/**
 * Completion signal type.
 * Indicates whether the agent completed successfully, is stuck (gutter), or neither.
 */
export type CompletionSignal = 'COMPLETE' | 'GUTTER' | 'NONE';

/**
 * Parsed output interface.
 * Contains all extracted information from agent output.
 */
export interface ParsedOutput {
  completionSignal: CompletionSignal;
  learnings: string[];
  filesChanged: string[];
  testResults: TestResult[];
  errors: string[];
  warnings: string[];
  suggestedAgentsUpdate?: string;
}

/**
 * Output parser class.
 * Extracts structured information from agent output text.
 */
export class OutputParser {
  // Pattern for completion signal
  private static readonly COMPLETE_PATTERN = /<ralph>COMPLETE<\/ralph>/i;
  private static readonly GUTTER_PATTERN = /<ralph>GUTTER<\/ralph>/i;

  // Pattern for files changed (created, modified, updated, wrote)
  private static readonly FILES_CHANGED_PATTERN =
    /(?:created|modified|updated|wrote|changed|edited)\s+[`"]?([^`"\s]+(?:\.\w+)?)[`"]?/gi;

  // Pattern for test commands and results
  private static readonly TEST_PATTERN =
    /(?:npm\s+test|vitest|jest|pytest|npm\s+run\s+test).*?(?:PASS|FAIL|passed|failed|✓|✗)/gi;

  // Pattern for learnings
  private static readonly LEARNINGS_PATTERN =
    /(?:learned|gotcha|note|important|remember|pattern):\s*(.+?)(?:\n|$)/gi;

  // Pattern for errors
  private static readonly ERROR_PATTERN =
    /(?:error|failed|exception|fatal):\s*(.+?)(?:\n|$)/gi;

  // Pattern for warnings
  private static readonly WARNING_PATTERN =
    /(?:warning|warn|deprecated):\s*(.+?)(?:\n|$)/gi;

  // Patterns for gutter indicators
  private static readonly TOKEN_LIMIT_PATTERN =
    /(?:token\s+limit|max\s+tokens|context\s+length|exceeded|too\s+long)/i;

  // Track command failures for gutter detection
  private readonly commandFailures = new Map<string, number>();

  /**
   * Parse agent output and extract all relevant information.
   */
  parse(output: string): ParsedOutput {
    const completionSignal = this.detectCompletionSignal(output);
    const learnings = this.extractLearnings(output);
    const filesChanged = this.extractFilesChanged(output);
    const testResults = this.extractTestResults(output);
    const errors = this.extractErrors(output);
    const warnings = this.extractWarnings(output);
    const suggestedAgentsUpdate = this.extractSuggestedAgentsUpdate(output);

    // Track command failures for gutter detection
    this.trackCommandFailures(testResults, errors);

    return {
      completionSignal,
      learnings,
      filesChanged,
      testResults,
      errors,
      warnings,
      ...(suggestedAgentsUpdate ? { suggestedAgentsUpdate } : {}),
    };
  }

  /**
   * Detect completion signal in output.
   */
  detectCompletionSignal(output: string): CompletionSignal {
    if (OutputParser.COMPLETE_PATTERN.test(output)) {
      return 'COMPLETE';
    }
    if (OutputParser.GUTTER_PATTERN.test(output)) {
      return 'GUTTER';
    }
    return 'NONE';
  }

  /**
   * Extract learnings from output.
   * Looks for patterns like "learned:", "gotcha:", "note:", "important:".
   */
  extractLearnings(output: string): string[] {
    const learnings: string[] = [];
    const pattern = OutputParser.LEARNINGS_PATTERN;
    pattern.lastIndex = 0; // Reset regex state

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(output)) !== null) {
      const learning = match[1]?.trim();
      if (learning) {
        learnings.push(learning);
      }
    }

    return learnings;
  }

  /**
   * Extract files changed from output.
   * Looks for patterns like "created file.ts", "modified src/index.ts", etc.
   */
  extractFilesChanged(output: string): string[] {
    const files: string[] = [];
    const pattern = OutputParser.FILES_CHANGED_PATTERN;
    pattern.lastIndex = 0; // Reset regex state

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(output)) !== null) {
      const file = match[1]?.trim();
      if (file && !files.includes(file)) {
        files.push(file);
      }
    }

    return files;
  }

  /**
   * Extract test results from output.
   * Parses test command output to identify pass/fail status.
   */
  extractTestResults(output: string): TestResult[] {
    const results: TestResult[] = [];
    const pattern = OutputParser.TEST_PATTERN;
    pattern.lastIndex = 0; // Reset regex state

    // Find all test command mentions
    const testMatches: Array<{ index: number; match: string }> = [];
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(output)) !== null) {
      if (match.index !== undefined) {
        testMatches.push({ index: match.index, match: match[0] });
      }
    }

    // Parse each test match
    for (const { match: testMatch } of testMatches) {
      const passed = /(?:PASS|passed|✓)/i.test(testMatch);
      const failed = /(?:FAIL|failed|✗)/i.test(testMatch);

      // Extract command name
      const commandMatch = testMatch.match(/(npm\s+test|vitest|jest|pytest|npm\s+run\s+test)/i);
      const command = commandMatch ? commandMatch[1] : 'test';

      if (passed || failed) {
        results.push({
          command,
          passed,
          output: testMatch,
        });
      }
    }

    return results;
  }

  /**
   * Extract errors from output.
   * Looks for patterns like "error:", "failed:", "exception:".
   */
  extractErrors(output: string): string[] {
    const errors: string[] = [];
    const pattern = OutputParser.ERROR_PATTERN;
    pattern.lastIndex = 0; // Reset regex state

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(output)) !== null) {
      const error = match[1]?.trim();
      if (error) {
        errors.push(error);
      }
    }

    return errors;
  }

  /**
   * Extract warnings from output.
   * Looks for patterns like "warning:", "warn:", "deprecated:".
   */
  extractWarnings(output: string): string[] {
    const warnings: string[] = [];
    const pattern = OutputParser.WARNING_PATTERN;
    pattern.lastIndex = 0; // Reset regex state

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(output)) !== null) {
      const warning = match[1]?.trim();
      if (warning) {
        warnings.push(warning);
      }
    }

    return warnings;
  }

  /**
   * Detect gutter indicators in output.
   * Per REQUIREMENTS.md Section 18.1:
   * - Same command failed 3x
   * - Repeated identical output
   * - Token limit indicators
   * - Explicit GUTTER signal (handled by detectCompletionSignal)
   */
  detectGutterIndicators(output: string): boolean {
    // Check for explicit GUTTER signal
    if (this.detectCompletionSignal(output) === 'GUTTER') {
      return true;
    }

    // Check for token limit indicators
    if (OutputParser.TOKEN_LIMIT_PATTERN.test(output)) {
      return true;
    }

    // Check for repeated identical output
    if (this.hasRepeatedIdenticalOutput(output)) {
      return true;
    }

    // Check for same command failed 3x
    if (this.hasRepeatedCommandFailures(output)) {
      return true;
    }

    return false;
  }

  /**
   * Extract suggested AGENTS.md update content.
   * Looks for patterns indicating the agent wants to update AGENTS.md.
   */
  private extractSuggestedAgentsUpdate(output: string): string | undefined {
    // Look for patterns like "update AGENTS.md", "add to AGENTS.md", etc.
    const patterns = [
      /(?:update|add|append|note)\s+(?:to\s+)?AGENTS\.md[:\s]+([\s\S]+?)(?:\n\n|\n---|$)/i,
      /AGENTS\.md\s+(?:update|addition|note)[:\s]+([\s\S]+?)(?:\n\n|\n---|$)/i,
    ];

    for (const pattern of patterns) {
      const match = output.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  /**
   * Check if output contains repeated identical chunks.
   * This indicates the agent is stuck in a loop.
   */
  private hasRepeatedIdenticalOutput(output: string): boolean {
    const lines = output.split('\n').filter((line) => line.trim().length > 0);
    if (lines.length < 3) {
      return false;
    }

    // Check for 3+ consecutive identical lines
    let consecutiveCount = 1;
    let previousLine: string | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === previousLine) {
        consecutiveCount++;
        if (consecutiveCount >= 3) {
          return true;
        }
      } else {
        consecutiveCount = 1;
        previousLine = trimmed;
      }
    }

    return false;
  }

  /**
   * Track command failures for gutter detection.
   * Called during parse() to maintain failure counts.
   */
  private trackCommandFailures(testResults: TestResult[], errors: string[]): void {
    // Track failures from test results
    for (const result of testResults) {
      if (!result.passed) {
        const count = (this.commandFailures.get(result.command) || 0) + 1;
        this.commandFailures.set(result.command, count);
      } else {
        // Reset count on success
        this.commandFailures.set(result.command, 0);
      }
    }

    // Also check for error patterns that might indicate command failures
    for (const error of errors) {
      // Try to extract command from error message
      const commandMatch = error.match(/(npm|vitest|jest|pytest|node|tsc)\s+\w+/i);
      if (commandMatch) {
        const command = commandMatch[0];
        const count = (this.commandFailures.get(command) || 0) + 1;
        this.commandFailures.set(command, count);
      }
    }
  }

  /**
   * Check if same command failed 3+ times.
   * Checks the tracked failure counts.
   */
  private hasRepeatedCommandFailures(_output: string): boolean {
    // Check if any command has failed 3+ times
    for (const count of Array.from(this.commandFailures.values())) {
      if (count >= 3) {
        return true;
      }
    }
    return false;
  }

  /**
   * Reset internal state (useful for testing).
   */
  reset(): void {
    this.commandFailures.clear();
  }
}
