/**
 * Gemini Error Message Parser
 * 
 * Parses Gemini CLI error messages to extract quota/reset information.
 * 
 * Example error: "You have exhausted your capacity on this model. Your quota will reset after 8h44m7s."
 */

import type { ErrorParseResult, PlatformUsageInfo } from '../types.js';

/**
 * Parses Gemini error messages for quota information
 */
export class GeminiErrorParser {
  /**
   * Parses error message for quota/reset information
   * 
   * @param errorMessage - Error message from Gemini CLI
   * @returns Parse result with usage info if found
   */
  parse(errorMessage: string): ErrorParseResult {
    // Pattern: "You have exhausted your capacity. Your quota will reset after XhYmZs."
    const resetPattern = /quota will reset after (\d+)h(\d+)m(\d+)s/i;
    const exhaustedPattern = /exhausted your capacity/i;

    const resetMatch = errorMessage.match(resetPattern);
    const exhaustedMatch = errorMessage.match(exhaustedPattern);

    if (!resetMatch || !exhaustedMatch) {
      return {
        found: false,
        errorMessage,
      };
    }

    const resetHours = parseInt(resetMatch[1], 10);
    const resetMinutes = parseInt(resetMatch[2], 10);
    const resetSeconds = parseInt(resetMatch[3], 10);

    // Calculate reset time (current time + reset duration)
    const now = new Date();
    const resetMs = (resetHours * 60 * 60 + resetMinutes * 60 + resetSeconds) * 1000;
    const resetsAt = new Date(now.getTime() + resetMs).toISOString();

    // Gemini doesn't provide limit in error message, so we can't determine exact usage
    // But we know capacity is exhausted (remaining = 0)
    const usageInfo: PlatformUsageInfo = {
      platform: 'gemini',
      currentUsage: 0, // Unknown, but capacity exhausted
      limit: 0, // Unknown
      remaining: 0,
      resetsAt,
      period: 'unknown',
      source: 'error',
      metadata: {
        resetHours,
        resetMinutes,
        resetSeconds,
        exhausted: true,
      },
    };

    return {
      found: true,
      usageInfo,
      errorMessage,
    };
  }
}
