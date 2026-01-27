/**
 * Gemini CLI Stats Command Parser
 * 
 * Parses Gemini CLI `/stats` command output to extract per-model usage.
 * 
 * Example output:
 * ```
 * Usage Statistics:
 *   Model: gemini-2.5-pro
 *     Requests: 42
 *     Input tokens: 12,345
 *     Output tokens: 67,890
 *     Tool calls: 5
 *     File modifications: 3
 * ```
 */

import type { CliParseResult, PlatformUsageInfo } from '../types.js';

/**
 * Parses Gemini CLI `/stats` command output
 */
export class GeminiStatsParser {
  /**
   * Parses CLI output for per-model usage information
   * 
   * @param output - CLI command output
   * @returns Parse result with usage info if successful
   */
  parse(output: string): CliParseResult {
    // Patterns for usage counts
    const requestsPattern = /Requests:\s*([\d,]+)/i;
    const inputTokensPattern = /Input tokens:\s*([\d,]+)/i;
    const outputTokensPattern = /Output tokens:\s*([\d,]+)/i;
    const toolCallsPattern = /Tool calls:\s*([\d,]+)/i;
    const fileModsPattern = /File modifications:\s*([\d,]+)/i;
    const modelPattern = /Model:\s*([^\n]+)/i;

    const requestsMatch = output.match(requestsPattern);
    const inputTokensMatch = output.match(inputTokensPattern);
    const outputTokensMatch = output.match(outputTokensPattern);
    const toolCallsMatch = output.match(toolCallsPattern);
    const fileModsMatch = output.match(fileModsPattern);
    const modelMatch = output.match(modelPattern);

    if (!requestsMatch && !inputTokensMatch && !outputTokensMatch) {
      return {
        success: false,
        rawOutput: output,
      };
    }

    const parseNumber = (str: string): number => {
      return parseInt(str.replace(/,/g, ''), 10);
    };

    const requests = requestsMatch ? parseNumber(requestsMatch[1]) : 0;
    const inputTokens = inputTokensMatch ? parseNumber(inputTokensMatch[1]) : 0;
    const outputTokens = outputTokensMatch ? parseNumber(outputTokensMatch[1]) : 0;
    const totalTokens = inputTokens + outputTokens;
    const toolCalls = toolCallsMatch ? parseNumber(toolCallsMatch[1]) : 0;
    const fileMods = fileModsMatch ? parseNumber(fileModsMatch[1]) : 0;
    const model = modelMatch ? modelMatch[1].trim() : undefined;

    // Gemini `/stats` doesn't provide quota info, only usage
    // So we can't determine limit or remaining
    const usageInfo: PlatformUsageInfo = {
      platform: 'gemini',
      currentUsage: requests,
      limit: 0, // Not available from /stats
      remaining: 0, // Not available from /stats
      resetsAt: null, // Not available from /stats
      period: 'unknown',
      tokens: {
        input: inputTokens,
        output: outputTokens,
        total: totalTokens,
      },
      source: 'cli',
      metadata: {
        command: '/stats',
        model,
        requests,
        toolCalls,
        fileModifications: fileMods,
      },
    };

    return {
      success: true,
      usageInfo,
      rawOutput: output,
    };
  }
}
