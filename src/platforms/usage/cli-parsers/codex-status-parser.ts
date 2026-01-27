/**
 * Codex CLI Status Command Parser
 * 
 * Parses Codex CLI `/status` command output to extract token usage.
 * 
 * Example output:
 * ```
 * Input tokens: 1,234
 * Output tokens: 5,678
 * Total tokens: 6,912
 * ```
 */

import type { CliParseResult, PlatformUsageInfo } from '../types.js';

/**
 * Parses Codex CLI `/status` command output
 */
export class CodexStatusParser {
  /**
   * Parses CLI output for token usage information
   * 
   * @param output - CLI command output
   * @returns Parse result with usage info if successful
   */
  parse(output: string): CliParseResult {
    // Patterns for token counts
    const inputPattern = /Input tokens?:\s*([\d,]+)/i;
    const outputPattern = /Output tokens?:\s*([\d,]+)/i;
    const totalPattern = /Total tokens?:\s*([\d,]+)/i;

    const inputMatch = output.match(inputPattern);
    const outputMatch = output.match(outputPattern);
    const totalMatch = output.match(totalPattern);

    if (!inputMatch && !outputMatch && !totalMatch) {
      return {
        success: false,
        rawOutput: output,
      };
    }

    const parseNumber = (str: string): number => {
      return parseInt(str.replace(/,/g, ''), 10);
    };

    const inputTokens = inputMatch ? parseNumber(inputMatch[1]) : 0;
    const outputTokens = outputMatch ? parseNumber(outputMatch[1]) : 0;
    const totalTokens = totalMatch ? parseNumber(totalMatch[1]) : (inputTokens + outputTokens);

    // Codex `/status` doesn't provide quota info, only usage
    // So we can't determine limit or remaining
    const usageInfo: PlatformUsageInfo = {
      platform: 'codex',
      currentUsage: 0, // Not available from /status
      limit: 0, // Not available from /status
      remaining: 0, // Not available from /status
      resetsAt: null, // Not available from /status
      period: 'unknown',
      tokens: {
        input: inputTokens,
        output: outputTokens,
        total: totalTokens,
      },
      source: 'cli',
      metadata: {
        command: '/status',
      },
    };

    return {
      success: true,
      usageInfo,
      rawOutput: output,
    };
  }
}
