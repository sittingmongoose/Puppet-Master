/**
 * Base Output Parser
 *
 * Provides shared parsing utilities for all platform-specific parsers.
 * Contains common patterns for completion signals, session IDs, tokens, etc.
 *
 * Per BUILD_QUEUE_IMPROVEMENTS.md P1-T10.
 */

import type { TestResult } from '../../types/prd.js';
import type {
  CompletionSignal,
  ParsedPlatformOutput,
  PlatformOutputParser,
  RalphStatusBlock,
} from './types.js';

/**
 * Base output parser with shared utilities.
 * Platform-specific parsers extend this class.
 */
export abstract class BaseOutputParser implements PlatformOutputParser {
  // Common patterns used across all platforms

  /** Pattern for COMPLETE signal */
  protected static readonly COMPLETE_PATTERN = /<ralph>COMPLETE<\/ralph>/i;

  /** Pattern for GUTTER signal */
  protected static readonly GUTTER_PATTERN = /<ralph>GUTTER<\/ralph>/i;

  /** Pattern for session ID (PM-YYYY-MM-DD-HH-MM-SS-NNN) */
  protected static readonly SESSION_ID_PATTERN = /PM-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}-\d{3}/;

  /** Pattern for token count (various formats) */
  protected static readonly TOKEN_PATTERN = /["']?tokens?["']?\s*[:=\s]\s*(\d+)/i;

  /** Pattern for files changed */
  protected static readonly FILES_CHANGED_PATTERN =
    /(?:created|modified|updated|wrote|changed|edited)\s+[`"]?([^`"\s]+(?:\.\w+)?)[`"]?/gi;

  /** Pattern for learnings */
  protected static readonly LEARNINGS_PATTERN =
    /(?:learned|gotcha|note|important|remember|pattern):\s*(.+?)(?:\n|$)/gi;

  /** Pattern for errors */
  protected static readonly ERROR_PATTERN =
    /(?:error|failed|exception|fatal):\s*(.+?)(?:\n|$)/gi;

  /** Pattern for warnings */
  protected static readonly WARNING_PATTERN =
    /(?:warning|warn|deprecated):\s*(.+?)(?:\n|$)/gi;

  /** Pattern for test commands and results */
  protected static readonly TEST_PATTERN =
    /(?:npm\s+test|vitest|jest|pytest|npm\s+run\s+test).*?(?:PASS|FAIL|passed|failed|✓|✗)/gi;

  /** Pattern for RALPH_STATUS block (JSON or XML-like) */
  protected static readonly RALPH_STATUS_PATTERN =
    /<RALPH_STATUS>([\s\S]*?)<\/RALPH_STATUS>/i;

  /**
   * Parse output. Subclasses implement platform-specific logic.
   */
  abstract parse(output: string): ParsedPlatformOutput;

  /**
   * Detect completion signal in output.
   */
  protected detectCompletionSignal(output: string): CompletionSignal {
    // Check for GUTTER first (takes precedence if both present)
    if (BaseOutputParser.GUTTER_PATTERN.test(output)) {
      return 'GUTTER';
    }
    if (BaseOutputParser.COMPLETE_PATTERN.test(output)) {
      return 'COMPLETE';
    }
    return 'NONE';
  }

  /**
   * Extract session ID from output.
   */
  protected extractSessionId(output: string): string | undefined {
    const match = output.match(BaseOutputParser.SESSION_ID_PATTERN);
    return match ? match[0] : undefined;
  }

  /**
   * Extract token count from output.
   */
  protected extractTokenCount(output: string): number | undefined {
    const match = output.match(BaseOutputParser.TOKEN_PATTERN);
    return match ? parseInt(match[1], 10) : undefined;
  }

  /**
   * Extract files changed from output.
   */
  protected extractFilesChanged(output: string): string[] {
    const files: string[] = [];
    const pattern = new RegExp(BaseOutputParser.FILES_CHANGED_PATTERN.source, 'gi');

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
   * Extract learnings from output.
   */
  protected extractLearnings(output: string): string[] {
    const learnings: string[] = [];
    const pattern = new RegExp(BaseOutputParser.LEARNINGS_PATTERN.source, 'gi');

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
   * Extract errors from output.
   */
  protected extractErrors(output: string): string[] {
    const errors: string[] = [];
    const pattern = new RegExp(BaseOutputParser.ERROR_PATTERN.source, 'gi');

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
   */
  protected extractWarnings(output: string): string[] {
    const warnings: string[] = [];
    const pattern = new RegExp(BaseOutputParser.WARNING_PATTERN.source, 'gi');

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
   * Extract test results from output.
   */
  protected extractTestResults(output: string): TestResult[] {
    const results: TestResult[] = [];
    const pattern = new RegExp(BaseOutputParser.TEST_PATTERN.source, 'gi');

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(output)) !== null) {
      const testMatch = match[0];
      const passed = /(?:PASS|passed|✓)/i.test(testMatch);
      const failed = /(?:FAIL|failed|✗)/i.test(testMatch);

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
   * Extract RALPH_STATUS block from output.
   */
  protected extractRalphStatusBlock(output: string): RalphStatusBlock | undefined {
    const match = output.match(BaseOutputParser.RALPH_STATUS_PATTERN);
    if (!match || !match[1]) {
      return undefined;
    }

    const content = match[1].trim();

    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(content) as Partial<RalphStatusBlock>;
      if (parsed.status === 'COMPLETE' || parsed.status === 'GUTTER') {
        return {
          status: parsed.status,
          message: parsed.message,
          filesChanged: parsed.filesChanged,
          testsRun: parsed.testsRun,
          errors: parsed.errors,
        };
      }
    } catch {
      // Not JSON, try to parse as simple text
      if (content.toLowerCase().includes('complete')) {
        return { status: 'COMPLETE', message: content };
      }
      if (content.toLowerCase().includes('gutter')) {
        return { status: 'GUTTER', message: content };
      }
    }

    return undefined;
  }

  /**
   * Extract suggested AGENTS.md update from output.
   */
  protected extractSuggestedAgentsUpdate(output: string): string | undefined {
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
   * Create a base parsed output with common fields.
   * Subclasses call this and then add platform-specific fields.
   */
  protected createBaseParsedOutput(output: string): ParsedPlatformOutput {
    const completionSignal = this.detectCompletionSignal(output);
    const statusBlock = this.extractRalphStatusBlock(output);
    const sessionId = this.extractSessionId(output);
    const tokensUsed = this.extractTokenCount(output);
    const filesChanged = this.extractFilesChanged(output);
    const testResults = this.extractTestResults(output);
    const errors = this.extractErrors(output);
    const warnings = this.extractWarnings(output);
    const learnings = this.extractLearnings(output);
    const suggestedAgentsUpdate = this.extractSuggestedAgentsUpdate(output);

    return {
      completionSignal,
      statusBlock,
      filesChanged,
      testResults,
      errors,
      warnings,
      rawOutput: output,
      sessionId,
      tokensUsed,
      learnings: learnings.length > 0 ? learnings : undefined,
      suggestedAgentsUpdate,
    };
  }
}
