/**
 * Claude Output Parser
 *
 * Parses output from Claude CLI.
 * Handles stream-json, JSON, and plain text formats.
 *
 * Per BUILD_QUEUE_IMPROVEMENTS.md P1-T10.
 */

import type { ParsedPlatformOutput } from './types.js';
import { BaseOutputParser } from './base-output-parser.js';

/**
 * Claude stream-json event types.
 */
interface ClaudeStreamEvent {
  type?: string;
  subtype?: string;
  message?: unknown;
  content_block?: {
    type?: string;
    text?: string;
  };
  delta?: {
    type?: string;
    text?: string;
  };
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
  session_id?: string;
  tokens?: number;
  model?: string;
}

/**
 * Claude-specific output parser.
 *
 * Claude CLI can output:
 * - stream-json format (JSONL with message events)
 * - Single JSON object
 * - Plain text
 *
 * Stream events include:
 * - message_start, content_block_start, content_block_delta
 * - Tool use events
 * - Usage information
 */
export class ClaudeOutputParser extends BaseOutputParser {
  /**
   * Parse Claude CLI output.
   *
   * @param output - Raw output from Claude CLI
   * @returns Normalized parsed output
   */
  parse(output: string): ParsedPlatformOutput {
    try {
      const trimmed = output.trim();

      // Check output format
      if (this.looksLikeStreamJson(trimmed)) {
        return this.parseStreamJsonOutput(output);
      }

      if (this.looksLikeSingleJson(trimmed)) {
        return this.parseSingleJsonOutput(output);
      }

      // Fall back to text parsing
      return this.parseTextOutput(output);
    } catch (error) {
      // Never throw - return minimal valid output
      console.warn('[ClaudeOutputParser] Parse error:', error);
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
   * Check if output looks like stream-json (JSONL with multiple lines).
   */
  private looksLikeStreamJson(output: string): boolean {
    const lines = output.split('\n').filter((line) => line.trim());
    if (lines.length < 2) return false;

    // Check if first line is a JSON object
    const firstLine = lines[0]?.trim();
    if (!firstLine?.startsWith('{')) return false;

    // Stream-json typically has multiple JSON lines
    let jsonLineCount = 0;
    for (const line of lines.slice(0, 5)) {
      try {
        JSON.parse(line);
        jsonLineCount++;
      } catch {
        // Not JSON
      }
    }

    return jsonLineCount >= 2;
  }

  /**
   * Check if output looks like a single JSON object.
   */
  private looksLikeSingleJson(output: string): boolean {
    const trimmed = output.trim();
    return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
           (trimmed.startsWith('[') && trimmed.endsWith(']'));
  }

  /**
   * Parse stream-json (JSONL) output format.
   */
  private parseStreamJsonOutput(output: string): ParsedPlatformOutput {
    const lines = output.split('\n').filter((line) => line.trim());
    let combinedText = '';
    let sessionId: string | undefined;
    let tokensUsed: number | undefined;
    let model: string | undefined;

    for (const line of lines) {
      try {
        const event = JSON.parse(line) as ClaudeStreamEvent;

        // Extract session ID
        if (event.session_id && !sessionId) {
          sessionId = event.session_id;
        }

        // Extract model
        if (event.model && !model) {
          model = event.model;
        }

        // Extract tokens from usage
        if (event.usage) {
          const outputTokens = event.usage.output_tokens;
          if (outputTokens && (!tokensUsed || outputTokens > tokensUsed)) {
            tokensUsed = outputTokens;
          }
        }

        // Direct tokens field
        if (event.tokens && !tokensUsed) {
          tokensUsed = event.tokens;
        }

        // Extract text content from various event types
        if (event.content_block?.text) {
          combinedText += event.content_block.text;
        }
        if (event.delta?.text) {
          combinedText += event.delta.text;
        }
        if (event.message && typeof event.message === 'string') {
          combinedText += event.message;
        }
      } catch {
        // Not valid JSON, could be plain text mixed in
        combinedText += line + '\n';
      }
    }

    // Parse the combined text for signals
    const contentToParse = combinedText || output;
    const parsed = this.createBaseParsedOutput(contentToParse);

    // Override with stream-extracted values
    if (sessionId) parsed.sessionId = sessionId;
    if (tokensUsed) parsed.tokensUsed = tokensUsed;
    if (model) parsed.model = model;

    // Keep raw output as original
    parsed.rawOutput = output;

    return parsed;
  }

  /**
   * Parse single JSON output format.
   * Supports CLI --output-format json shape per https://code.claude.com/docs/en/headless:
   * - result: main text; session_id, usage (input_tokens, output_tokens), model.
   */
  private parseSingleJsonOutput(output: string): ParsedPlatformOutput {
    try {
      const json = JSON.parse(output) as Record<string, unknown>;

      // Extract text content from various possible fields (result is headless default)
      let textContent = '';
      if (typeof json.result === 'string') {
        textContent = json.result;
      } else if (typeof json.response === 'string') {
        textContent = json.response;
      } else if (typeof json.content === 'string') {
        textContent = json.content;
      } else if (typeof json.text === 'string') {
        textContent = json.text;
      } else if (typeof json.message === 'string') {
        textContent = json.message;
      }

      // Parse the text content
      const parsed = this.createBaseParsedOutput(textContent || output);

      // Extract metadata from JSON
      if (typeof json.session_id === 'string') {
        parsed.sessionId = json.session_id;
      }
      if (typeof json.tokens === 'number') {
        parsed.tokensUsed = json.tokens;
      }
      const usage = json.usage as Record<string, unknown> | undefined;
      if (usage && parsed.tokensUsed === undefined) {
        if (typeof usage.output_tokens === 'number') {
          parsed.tokensUsed = usage.output_tokens;
        } else if (typeof usage.input_tokens === 'number' && typeof usage.output_tokens === 'number') {
          parsed.tokensUsed = (usage.input_tokens as number) + (usage.output_tokens as number);
        }
      }
      if (typeof json.model === 'string') {
        parsed.model = json.model;
      }

      // Keep raw output as original
      parsed.rawOutput = output;

      return parsed;
    } catch {
      // JSON parse failed, fall back to text
      return this.parseTextOutput(output);
    }
  }

  /**
   * Parse plain text output format.
   */
  private parseTextOutput(output: string): ParsedPlatformOutput {
    return this.createBaseParsedOutput(output);
  }
}

/**
 * Create a ClaudeOutputParser instance.
 */
export function createClaudeOutputParser(): ClaudeOutputParser {
  return new ClaudeOutputParser();
}
