/**
 * Copilot Output Parser
 *
 * Parses output from GitHub Copilot CLI.
 * Handles text-based output format (no JSON available).
 *
 * Per BUILD_QUEUE_IMPROVEMENTS.md P1-T10.
 */

import type { ParsedPlatformOutput } from './types.js';
import { BaseOutputParser } from './base-output-parser.js';

/**
 * Copilot-specific output parser.
 *
 * GitHub Copilot CLI outputs text-based responses only.
 * No JSON output format is available.
 *
 * Output is parsed for:
 * - <ralph>COMPLETE</ralph> / <ralph>GUTTER</ralph> signals
 * - Files changed
 * - Test results
 * - Errors and warnings
 */
export class CopilotOutputParser extends BaseOutputParser {
  /**
   * Parse Copilot CLI output.
   *
   * @param output - Raw output from Copilot CLI
   * @returns Normalized parsed output
   */
  parse(output: string): ParsedPlatformOutput {
    try {
      // Copilot only outputs plain text
      const parsed = this.createBaseParsedOutput(output);

      // Copilot-specific: Model is always Claude Sonnet 4.5 (default)
      // but can be changed via /model command which is interactive only
      // We don't know the model from output, so leave it undefined

      // Copilot-specific: Try to extract any session/conversation ID
      // that might appear in debug output or JSON-like formats
      const conversationMatch = output.match(
        /(?:conversation|session|chat)[_-]?[iI]d[:\s"']+([^\s"',}\]]+)/
      );
      if (conversationMatch && !parsed.sessionId) {
        parsed.sessionId = conversationMatch[1];
      }

      return parsed;
    } catch (error) {
      // Never throw - return minimal valid output
      console.warn('[CopilotOutputParser] Parse error:', error);
      return {
        completionSignal: 'NONE',
        filesChanged: [],
        testResults: [],
        errors: [],
        warnings: [],
        rawOutput: output,
      };
    }
  }
}

/**
 * Create a CopilotOutputParser instance.
 */
export function createCopilotOutputParser(): CopilotOutputParser {
  return new CopilotOutputParser();
}
