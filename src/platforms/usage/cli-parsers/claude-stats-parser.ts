/**
 * Claude CLI Stats Command Parser
 * 
 * Parses Claude CLI `/stats` command output to extract usage patterns.
 * 
 * Example output (for subscribers):
 * ```
 * Usage Statistics:
 *   Requests today: 42
 *   Requests this week: 156
 *   Requests this month: 623
 * ```
 */

import type { CliParseResult, PlatformUsageInfo } from '../types.js';

/**
 * Parses Claude CLI `/stats` command output
 */
export class ClaudeStatsParser {
  /**
   * Parses CLI output for usage pattern information
   * 
   * @param output - CLI command output
   * @returns Parse result with usage info if successful
   */
  parse(output: string): CliParseResult {
    // Patterns for usage counts
    const todayPattern = /Requests today:\s*([\d,]+)/i;
    const weekPattern = /Requests this week:\s*([\d,]+)/i;
    const monthPattern = /Requests this month:\s*([\d,]+)/i;

    const todayMatch = output.match(todayPattern);
    const weekMatch = output.match(weekPattern);
    const monthMatch = output.match(monthPattern);

    if (!todayMatch && !weekMatch && !monthMatch) {
      return {
        success: false,
        rawOutput: output,
      };
    }

    const parseNumber = (str: string): number => {
      return parseInt(str.replace(/,/g, ''), 10);
    };

    const todayCount = todayMatch ? parseNumber(todayMatch[1]) : 0;
    const weekCount = weekMatch ? parseNumber(weekMatch[1]) : 0;
    const monthCount = monthMatch ? parseNumber(monthMatch[1]) : 0;

    // Claude `/stats` doesn't provide quota info, only usage
    // So we can't determine limit or remaining
    // Use today's count as current usage
    const usageInfo: PlatformUsageInfo = {
      platform: 'claude',
      currentUsage: todayCount,
      limit: 0, // Not available from /stats
      remaining: 0, // Not available from /stats
      resetsAt: null, // Not available from /stats
      period: 'day',
      source: 'cli',
      metadata: {
        command: '/stats',
        todayCount,
        weekCount,
        monthCount,
      },
    };

    return {
      success: true,
      usageInfo,
      rawOutput: output,
    };
  }
}
