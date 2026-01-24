/**
 * Gemini Output Parser
 *
 * Parses output from Gemini CLI.
 * Handles JSON output format with response/stats/error structure.
 *
 * Per BUILD_QUEUE_IMPROVEMENTS.md P1-T10.
 */

import type { ParsedPlatformOutput } from './types.js';
import { BaseOutputParser } from './base-output-parser.js';

/**
 * Gemini JSON output structure.
 */
interface GeminiJsonOutput {
  response?: string;
  stats?: {
    models?: Record<string, unknown>;
    tools?: Record<string, unknown>;
    files?: Record<string, unknown>;
    tokens?: number;
    input_tokens?: number;
    output_tokens?: number;
  };
  error?: string | { message?: string; code?: string };
  model?: string;
  session_id?: string;
}

/**
 * Gemini stream-json event types.
 */
interface GeminiStreamEvent {
  type?: 'init' | 'message' | 'tool_use' | 'tool_result' | 'error' | 'result';
  data?: unknown;
  content?: string;
  response?: string;
  error?: string;
  tokens?: number;
  model?: string;
}

/**
 * Gemini-specific output parser.
 *
 * Gemini CLI outputs:
 * - JSON format: { response, stats, error? }
 * - stream-json format: JSONL events
 *
 * JSON output includes:
 * - response: Main AI-generated content
 * - stats: Usage statistics (models, tools, files)
 * - error: Error object if present
 */
export class GeminiOutputParser extends BaseOutputParser {
  /**
   * Parse Gemini CLI output.
   *
   * @param output - Raw output from Gemini CLI
   * @returns Normalized parsed output
   */
  parse(output: string): ParsedPlatformOutput {
    try {
      const trimmed = output.trim();

      // Check if it looks like stream-json (multiple JSON lines)
      if (this.looksLikeStreamJson(trimmed)) {
        return this.parseStreamJsonOutput(output);
      }

      // Try to parse as single JSON object
      if (trimmed.startsWith('{')) {
        return this.parseJsonOutput(output);
      }

      // Fall back to text parsing
      return this.parseTextOutput(output);
    } catch (error) {
      // Never throw - return minimal valid output
      console.warn('[GeminiOutputParser] Parse error:', error);
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
   * Check if output looks like stream-json (multiple JSON lines).
   */
  private looksLikeStreamJson(output: string): boolean {
    const lines = output.split('\n').filter((line) => line.trim());
    if (lines.length < 2) return false;

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
   * Parse JSON output format.
   */
  private parseJsonOutput(output: string): ParsedPlatformOutput {
    let jsonOutput: GeminiJsonOutput;
    let success = true;
    let responseText = '';
    const errors: string[] = [];

    try {
      jsonOutput = JSON.parse(output) as GeminiJsonOutput;
      responseText = jsonOutput.response || '';

      // Extract error if present
      if (jsonOutput.error) {
        success = false;
        if (typeof jsonOutput.error === 'string') {
          errors.push(jsonOutput.error);
        } else if (jsonOutput.error.message) {
          errors.push(jsonOutput.error.message);
        }
      }
    } catch (parseError) {
      // JSON parse failed
      console.warn('[GeminiOutputParser] JSON parse failed:', parseError);
      return this.parseTextOutput(output);
    }

    // Parse the response text for signals and other data
    const parsed = this.createBaseParsedOutput(responseText || output);

    // Add extracted errors
    if (errors.length > 0) {
      parsed.errors = [...errors, ...parsed.errors];
    }

    // Extract metadata from JSON
    if (jsonOutput.model) {
      parsed.model = jsonOutput.model;
    }
    if (jsonOutput.session_id) {
      parsed.sessionId = jsonOutput.session_id;
    }

    // Extract token count from stats
    if (jsonOutput.stats) {
      const stats = jsonOutput.stats;
      if (stats.tokens) {
        parsed.tokensUsed = stats.tokens;
      } else if (stats.output_tokens) {
        parsed.tokensUsed = stats.output_tokens;
      }
    }

    // Keep raw output as the extracted response text (not the full JSON wrapper)
    // so runners can surface the assistant response directly.
    parsed.rawOutput = responseText;

    // Adjust success based on GUTTER signal
    if (parsed.completionSignal === 'GUTTER') {
      if (!parsed.errors.some((e) => e.includes('GUTTER'))) {
        parsed.errors.unshift('Agent signaled GUTTER - stuck and cannot proceed');
      }
    }

    return parsed;
  }

  /**
   * Parse stream-json (JSONL) output format.
   */
  private parseStreamJsonOutput(output: string): ParsedPlatformOutput {
    const lines = output.split('\n').filter((line) => line.trim());
    let combinedContent = '';
    let tokensUsed: number | undefined;
    let model: string | undefined;
    const errors: string[] = [];

    for (const line of lines) {
      try {
        const event = JSON.parse(line) as GeminiStreamEvent;

        // Extract content from various event types
        if (event.content) {
          combinedContent += event.content;
        }
        if (event.response) {
          combinedContent += event.response;
        }
        if (event.data && typeof event.data === 'string') {
          combinedContent += event.data;
        }

        // Extract error
        if (event.error) {
          errors.push(event.error);
        }

        // Extract tokens
        if (event.tokens && !tokensUsed) {
          tokensUsed = event.tokens;
        }

        // Extract model
        if (event.model && !model) {
          model = event.model;
        }
      } catch {
        // Not valid JSON, add as plain text
        combinedContent += line + '\n';
      }
    }

    // Parse the combined content
    const contentToParse = combinedContent || output;
    const parsed = this.createBaseParsedOutput(contentToParse);

    // Add extracted errors
    if (errors.length > 0) {
      parsed.errors = [...errors, ...parsed.errors];
    }

    // Override with stream-extracted values
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
    return this.createBaseParsedOutput(output);
  }
}

/**
 * Create a GeminiOutputParser instance.
 */
export function createGeminiOutputParser(): GeminiOutputParser {
  return new GeminiOutputParser();
}
