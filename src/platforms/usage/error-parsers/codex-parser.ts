/**
 * Codex Error Message Parser
 * 
 * Parses Codex CLI error messages to extract quota/reset information.
 * 
 * Example error: "You've reached your 5-hour message limit. Try again in 3h 42m."
 */

import type { ErrorParseResult, PlatformUsageInfo } from '../types.js';

/**
 * Parses Codex error messages for quota information
 */
export class CodexErrorParser {
  /**
   * Parses error message for quota/reset information
   * 
   * @param errorMessage - Error message from Codex CLI
   * @returns Parse result with usage info if found
   */
  parse(errorMessage: string): ErrorParseResult {
    // Pattern: "You've reached your X-hour message limit. Try again in Yh Zm."
    const limitPattern = /reached your (\d+)-hour message limit/i;
    const resetPattern = /Try again in (\d+)h(?: (\d+)m)?/i;

    const limitMatch = errorMessage.match(limitPattern);
    const resetMatch = errorMessage.match(resetPattern);

    if (!limitMatch || !resetMatch) {
      return {
        found: false,
        errorMessage,
      };
    }

    const limitHours = parseInt(limitMatch[1], 10);
    const resetHours = parseInt(resetMatch[1], 10);
    const resetMinutes = resetMatch[2] ? parseInt(resetMatch[2], 10) : 0;

    // Calculate reset time (current time + reset duration)
    const now = new Date();
    const resetMs = (resetHours * 60 + resetMinutes) * 60 * 1000;
    const resetsAt = new Date(now.getTime() + resetMs).toISOString();

    const usageInfo: PlatformUsageInfo = {
      platform: 'codex',
      currentUsage: limitHours, // Assume limit reached
      limit: limitHours,
      remaining: 0,
      resetsAt,
      period: 'hour',
      source: 'error',
      metadata: {
        limitHours,
        resetHours,
        resetMinutes,
      },
    };

    return {
      found: true,
      usageInfo,
      errorMessage,
    };
  }
}
