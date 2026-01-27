/**
 * Claude Error Message Parser
 * 
 * Parses Claude CLI error messages and HTTP responses to extract quota/reset information.
 * 
 * Handles:
 * - Rate limit errors (429) with Retry-After header
 * - Error body with reset time
 * - Error codes: 429, 413, 503, 529
 */

import type { ErrorParseResult, PlatformUsageInfo } from '../types.js';

export interface ClaudeErrorContext {
  /** HTTP status code */
  statusCode?: number;
  /** Retry-After header value */
  retryAfter?: string;
  /** Error response body */
  body?: string;
}

/**
 * Parses Claude error messages/responses for quota information
 */
export class ClaudeErrorParser {
  /**
   * Parses error message/response for quota/reset information
   * 
   * @param errorMessage - Error message from Claude CLI or API
   * @param context - Optional HTTP context (status code, headers, body)
   * @returns Parse result with usage info if found
   */
  parse(errorMessage: string, context?: ClaudeErrorContext): ErrorParseResult {
    // Check for rate limit status codes
    const isRateLimit = context?.statusCode === 429 || context?.statusCode === 413 || context?.statusCode === 503 || context?.statusCode === 529;

    if (!isRateLimit && !context?.retryAfter) {
      // Try to parse reset time from error message
      const resetPattern = /reset (?:after|in|at) (.+)/i;
      const resetMatch = errorMessage.match(resetPattern);

      if (!resetMatch) {
        return {
          found: false,
          errorMessage,
        };
      }

      // Try to parse the reset time string
      const resetTimeStr = resetMatch[1].trim();
      const resetsAt = this.parseResetTime(resetTimeStr);

      if (!resetsAt) {
        return {
          found: false,
          errorMessage,
        };
      }

      const usageInfo: PlatformUsageInfo = {
        platform: 'claude',
        currentUsage: 0, // Unknown
        limit: 0, // Unknown
        remaining: 0,
        resetsAt,
        period: 'unknown',
        source: 'error',
        metadata: {
          statusCode: context?.statusCode,
        },
      };

      return {
        found: true,
        usageInfo,
        errorMessage,
      };
    }

    // Parse Retry-After header (seconds or HTTP date)
    let resetsAt: string | null = null;
    if (context?.retryAfter) {
      const retryAfter = context.retryAfter.trim();
      
      // Check if it's a number (seconds)
      const seconds = parseInt(retryAfter, 10);
      if (!isNaN(seconds)) {
        const now = new Date();
        resetsAt = new Date(now.getTime() + seconds * 1000).toISOString();
      } else {
        // Try to parse as HTTP date
        const date = new Date(retryAfter);
        if (!isNaN(date.getTime())) {
          resetsAt = date.toISOString();
        }
      }
    }

    if (!resetsAt) {
      return {
        found: false,
        errorMessage,
      };
    }

    const usageInfo: PlatformUsageInfo = {
      platform: 'claude',
      currentUsage: 0, // Unknown
      limit: 0, // Unknown
      remaining: 0,
      resetsAt,
      period: 'unknown',
      source: 'error',
      metadata: {
        statusCode: context?.statusCode,
        retryAfter: context?.retryAfter,
      },
    };

    return {
      found: true,
      usageInfo,
      errorMessage,
    };
  }

  /**
   * Parses reset time string (e.g., "in 3h 42m", "after 8h44m7s", "2026-01-26T14:30:00Z")
   */
  private parseResetTime(timeStr: string): string | null {
    // Try ISO 8601 format first
    const isoDate = new Date(timeStr);
    if (!isNaN(isoDate.getTime())) {
      return isoDate.toISOString();
    }

    // Try relative time patterns
    const relativePattern = /(?:in|after)\s*(\d+)h(?:\s*(\d+)m)?(?:\s*(\d+)s)?/i;
    const match = timeStr.match(relativePattern);
    
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = match[2] ? parseInt(match[2], 10) : 0;
      const seconds = match[3] ? parseInt(match[3], 10) : 0;
      
      const now = new Date();
      const resetMs = (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
      return new Date(now.getTime() + resetMs).toISOString();
    }

    return null;
  }
}
