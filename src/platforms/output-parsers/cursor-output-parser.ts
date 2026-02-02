/**
 * Cursor Output Parser
 *
 * Parses output from Cursor CLI (cursor-agent).
 * Handles Cursor-specific markers and formats.
 *
 * Per BUILD_QUEUE_IMPROVEMENTS.md P1-T10.
 */

import type { Platform } from '../../types/platforms.js';
import type { ParsedPlatformOutput } from './types.js';
import { BaseOutputParser } from './base-output-parser.js';

/**
 * CU-P0-T04: NDJSON event types from Cursor stream-json output
 */
interface StreamJsonEvent {
  type: 'init' | 'message' | 'tool_use' | 'tool_result' | 'error' | 'result';
  [key: string]: unknown;
}

/**
 * CU-P0-T04: JSON output structure from Cursor
 */
interface JsonOutput {
  response?: string;
  stats?: {
    tokens?: number;
    session_id?: string;
  };
  error?: string;
}

/**
 * Cursor-specific output parser.
 *
 * CU-P0-T04: Enhanced to support JSON and stream-json output formats.
 *
 * Cursor CLI outputs:
 * - Plain text with <ralph>COMPLETE</ralph> / <ralph>GUTTER</ralph> signals
 * - JSON: Single JSON object with response/stats/error
 * - stream-json: NDJSON events (init, message, tool_use, tool_result, error, result)
 * - Session ID in PM-YYYY-MM-DD-HH-MM-SS-NNN format
 * - Token counts as "tokens: N" or similar
 */
export class CursorOutputParser extends BaseOutputParser {
  protected getPlatformName(): Platform {
    return 'cursor';
  }

  /**
   * Parse Cursor CLI output (text format).
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

  /**
   * CU-P0-T04: Parse structured output (json or stream-json format).
   *
   * @param output - Raw output from Cursor CLI
   * @param format - Output format ('json' or 'stream-json')
   * @returns Normalized parsed output
   */
  parseStructured(output: string, format: 'json' | 'stream-json'): ParsedPlatformOutput {
    try {
      if (format === 'stream-json') {
        return this.parseStreamJson(output);
      } else {
        return this.parseJson(output);
      }
    } catch (error) {
      // Fallback to text parsing on error
      console.warn('[CursorOutputParser] Structured parse error, falling back to text:', error);
      return this.parse(output);
    }
  }

  /**
   * CU-P0-T04: Parse stream-json format (NDJSON events).
   */
  private parseStreamJson(output: string): ParsedPlatformOutput {
    const parsed = this.createBaseParsedOutput(output);
    let assistantText = '';
    let sessionId: string | undefined;
    let tokensUsed: number | undefined;

    // Parse NDJSON lines
    const lines = output.trim().split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const event = JSON.parse(line) as StreamJsonEvent;

        switch (event.type) {
          case 'init':
            // Extract session metadata
            if (typeof event.session_id === 'string') {
              sessionId = event.session_id;
            }
            break;

          case 'message':
            // Extract assistant text from message events
            if (event.content && typeof event.content === 'string') {
              assistantText += event.content;
            } else if (Array.isArray(event.content)) {
              // Handle array of content blocks
              for (const block of event.content) {
                if (typeof block === 'object' && block !== null && 'text' in block) {
                  assistantText += String(block.text);
                }
              }
            }
            break;

          case 'result':
            // Final result may contain stats
            if (event.stats && typeof event.stats === 'object') {
              const stats = event.stats as Record<string, unknown>;
              if (typeof stats.tokens === 'number') {
                tokensUsed = stats.tokens;
              }
              if (typeof stats.session_id === 'string') {
                sessionId = stats.session_id;
              }
            }
            break;

          case 'error': {
            // Extract error information
            const errorMsg = typeof event.error === 'string' ? event.error : String(event.error);
            parsed.errors.push(errorMsg);
            break;
          }
        }
      } catch {
        // Skip invalid JSON lines
        continue;
      }
    }

    // Search for <ralph> signals in assistant text
    if (assistantText.includes('<ralph>GUTTER</ralph>')) {
      parsed.completionSignal = 'GUTTER';
    } else if (assistantText.includes('<ralph>COMPLETE</ralph>')) {
      parsed.completionSignal = 'COMPLETE';
    }

    // Set metadata
    if (sessionId) {
      parsed.sessionId = sessionId;
    }
    if (tokensUsed !== undefined) {
      parsed.tokensUsed = tokensUsed;
    }

    // Store raw assistant text as rawOutput
    parsed.rawOutput = assistantText || output;

    return parsed;
  }

  /**
   * CU-P0-T04: Parse json format (single JSON object).
   */
  private parseJson(output: string): ParsedPlatformOutput {
    const parsed = this.createBaseParsedOutput(output);

    try {
      const json = JSON.parse(output) as JsonOutput;

      // Extract response text
      const responseText = json.response || '';

      // Search for <ralph> signals
      if (responseText.includes('<ralph>GUTTER</ralph>')) {
        parsed.completionSignal = 'GUTTER';
      } else if (responseText.includes('<ralph>COMPLETE</ralph>')) {
        parsed.completionSignal = 'COMPLETE';
      }

      // Extract stats
      if (json.stats) {
        if (typeof json.stats.tokens === 'number') {
          parsed.tokensUsed = json.stats.tokens;
        }
        if (typeof json.stats.session_id === 'string') {
          parsed.sessionId = json.stats.session_id;
        }
      }

      // Extract error
      if (json.error) {
        parsed.errors.push(String(json.error));
      }

      // Store response as rawOutput
      parsed.rawOutput = responseText || output;

      return parsed;
    } catch (error) {
      // If JSON parsing fails, fall back to text parsing
      console.warn('[CursorOutputParser] JSON parse error:', error);
      return this.parse(output);
    }
  }
}

/**
 * Create a CursorOutputParser instance.
 */
export function createCursorOutputParser(): CursorOutputParser {
  return new CursorOutputParser();
}
