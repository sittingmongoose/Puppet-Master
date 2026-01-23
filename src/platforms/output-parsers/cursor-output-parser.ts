/**
 * Cursor Output Parser
 *
 * Parses output from Cursor CLI (cursor-agent).
 * Handles Cursor-specific markers and formats.
 *
 * Per BUILD_QUEUE_IMPROVEMENTS.md P1-T10.
 */

import type { ParsedPlatformOutput } from './types.js';
import { BaseOutputParser } from './base-output-parser.js';

/**
 * Cursor-specific output parser.
 *
 * Cursor CLI outputs plain text with:
 * - <ralph>COMPLETE</ralph> / <ralph>GUTTER</ralph> signals
 * - Session ID in PM-YYYY-MM-DD-HH-MM-SS-NNN format
 * - Token counts as "tokens: N" or similar
 */
export class CursorOutputParser extends BaseOutputParser {
  /**
   * Parse Cursor CLI output.
   *
   * @param output - Raw output from Cursor CLI
   * @returns Normalized parsed output
   */
  parse(output: string): ParsedPlatformOutput {
    try {
      // Use base parsing for common fields
      const parsed = this.createBaseParsedOutput(output);

      // Cursor-specific: Check for case-sensitive signals (legacy behavior)
      // The base parser is case-insensitive, but Cursor historically used exact match
      const hasExactComplete = output.includes('<ralph>COMPLETE</ralph>');
      const hasExactGutter = output.includes('<ralph>GUTTER</ralph>');

      // If exact match found, ensure we have the right signal
      if (hasExactGutter) {
        parsed.completionSignal = 'GUTTER';
      } else if (hasExactComplete) {
        parsed.completionSignal = 'COMPLETE';
      }

      return parsed;
    } catch (error) {
      // Never throw - return minimal valid output
      console.warn('[CursorOutputParser] Parse error:', error);
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
 * Create a CursorOutputParser instance.
 */
export function createCursorOutputParser(): CursorOutputParser {
  return new CursorOutputParser();
}
