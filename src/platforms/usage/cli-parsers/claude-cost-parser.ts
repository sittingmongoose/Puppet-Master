/**
 * Claude CLI Cost Command Parser
 * 
 * Parses Claude CLI `/cost` command output to extract API token usage.
 * 
 * Example output (for API users):
 * ```
 * API Token Usage:
 *   Input: 1,234 tokens
 *   Output: 5,678 tokens
 *   Total: 6,912 tokens
 * ```
 */

import type { CliParseResult, PlatformUsageInfo } from '../types.js';

/**
 * Parses Claude CLI `/cost` command output
 */
export class ClaudeCostParser {
  /**
   * Parses CLI output for API token usage information
   * 
   * @param output - CLI command output
   * @returns Parse result with usage info if successful
   */
  parse(output: string): CliParseResult {
    // Patterns for token counts
    const inputPattern = /Input:\s*([\d,]+)\s*tokens?/i;
    const outputPattern = /Output:\s*([\d,]+)\s*tokens?/i;
    const totalPattern = /Total:\s*([\d,]+)\s*tokens?/i;

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

    // Claude `/cost` doesn't provide quota info, only usage
    // So we can't determine limit or remaining
    const usageInfo: PlatformUsageInfo = {
      platform: 'claude',
      currentUsage: 0, // Not available from /cost
      limit: 0, // Not available from /cost
      remaining: 0, // Not available from /cost
      resetsAt: null, // Not available from /cost
      period: 'unknown',
      tokens: {
        input: inputTokens,
        output: outputTokens,
        total: totalTokens,
      },
      source: 'cli',
      metadata: {
        command: '/cost',
      },
    };

    return {
      success: true,
      usageInfo,
      rawOutput: output,
    };
  }
}
