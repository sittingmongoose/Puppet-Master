/**
 * Codex Output Parser
 *
 * Parses output from Codex CLI.
 * Handles both JSONL event stream and plain text formats.
 *
 * Per BUILD_QUEUE_IMPROVEMENTS.md P1-T10.
 */

import type { ParsedPlatformOutput } from './types.js';
import { BaseOutputParser } from './base-output-parser.js';

/**
 * Codex JSONL event types.
 */
interface CodexEvent {
  type?: string;
  event?: string;
  data?: unknown;
  message?: string;
  content?: string;
  session_id?: string;
  tokens?: number;
  model?: string;
}

/**
 * Codex-specific output parser.
 *
 * Codex CLI can output:
 * - JSONL event stream (with --json flag)
 * - Plain text output
 *
 * JSONL events may include:
 * - Session information
 * - Token usage
 * - Tool execution results
 * - Final response content
 */
export class CodexOutputParser extends BaseOutputParser {
  /**
   * Parse Codex CLI output.
   *
   * @param output - Raw output from Codex CLI
   * @returns Normalized parsed output
   */
  parse(output: string): ParsedPlatformOutput {
    try {
      // Check if output looks like JSONL
      const isJsonl = this.looksLikeJsonl(output);

      if (isJsonl) {
        return this.parseJsonlOutput(output);
      }

      // Fall back to text parsing
      return this.parseTextOutput(output);
    } catch (error) {
      // Never throw - return minimal valid output
      console.warn('[CodexOutputParser] Parse error:', error);
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
   * Check if output looks like JSONL (newline-delimited JSON).
   */
  private looksLikeJsonl(output: string): boolean {
    const trimmed = output.trim();
    if (!trimmed) return false;

    // Check if first non-empty line starts with { or [
    const firstLine = trimmed.split('\n')[0]?.trim();
    return firstLine ? firstLine.startsWith('{') || firstLine.startsWith('[') : false;
  }

  /**
   * Parse JSONL output format.
   */
  private parseJsonlOutput(output: string): ParsedPlatformOutput {
    const lines = output.split('\n').filter((line) => line.trim());
    const events: CodexEvent[] = [];
    let combinedContent = '';
    let sessionId: string | undefined;
    let tokensUsed: number | undefined;
    let model: string | undefined;

    // Parse each JSONL line
    for (const line of lines) {
      try {
        const event = JSON.parse(line) as CodexEvent;
        events.push(event);

        // Extract session ID
        if (event.session_id && !sessionId) {
          sessionId = event.session_id;
        }

        // Extract token count
        if (event.tokens && !tokensUsed) {
          tokensUsed = event.tokens;
        }

        // Extract model
        if (event.model && !model) {
          model = event.model;
        }

        // Accumulate content
        if (event.content) {
          combinedContent += event.content;
        }
        if (event.message) {
          combinedContent += event.message;
        }
        if (event.data && typeof event.data === 'string') {
          combinedContent += event.data;
        }
      } catch {
        // Not valid JSON, add as plain text
        combinedContent += line + '\n';
      }
    }

    // Parse the combined content for signals and other data
    const contentToParse = combinedContent || output;
    const parsed = this.createBaseParsedOutput(contentToParse);

    // Override with JSONL-extracted values
    if (sessionId) parsed.sessionId = sessionId;
    if (tokensUsed) parsed.tokensUsed = tokensUsed;
    if (model) parsed.model = model;

    // Keep raw output as original
    parsed.rawOutput = output;

    return parsed;
  }

  /**
   * Parse plain text output format.
   */
  private parseTextOutput(output: string): ParsedPlatformOutput {
    const parsed = this.createBaseParsedOutput(output);

    // Codex-specific: Try to extract session ID from various formats
    const sessionIdMatch = output.match(/["']?session[_-]?id["']?\s*[:=]\s*["']?([^"'\s]+)["']?/i);
    if (sessionIdMatch && !parsed.sessionId) {
      parsed.sessionId = sessionIdMatch[1];
    }

    return parsed;
  }
}

/**
 * Create a CodexOutputParser instance.
 */
export function createCodexOutputParser(): CodexOutputParser {
  return new CodexOutputParser();
}
