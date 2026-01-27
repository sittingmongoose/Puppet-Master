/**
 * Usage tracking types for platform usage providers
 * 
 * Defines interfaces for platform-reported usage data from APIs, error messages, and CLI commands.
 */

import type { Platform } from '../../types/config.js';

/**
 * Platform-reported usage information
 */
export interface PlatformUsageInfo {
  /** Platform this usage is for */
  platform: Platform;
  /** Current usage count (calls/requests) */
  currentUsage: number;
  /** Usage limit (calls/requests) */
  limit: number;
  /** Remaining usage */
  remaining: number;
  /** When the quota resets (ISO 8601 timestamp) */
  resetsAt: string | null;
  /** Period this quota applies to (hour, day, month, etc.) */
  period: 'hour' | 'day' | 'month' | 'run' | 'unknown';
  /** Token usage (if available) */
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
  /** Source of this usage data */
  source: 'api' | 'error' | 'cli' | 'sdk';
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Plan/subscription information detected from usage APIs
 */
export interface PlanInfo {
  /** Platform */
  platform: Platform;
  /** Customer type (e.g., 'individual', 'organization') */
  customerType?: string;
  /** Subscription type (e.g., 'pro', 'team', 'enterprise') */
  subscriptionType?: string;
  /** Tier name (e.g., 'free', 'pro', 'unlimited') */
  tier?: string;
  /** Detected from source */
  detectedFrom: 'api' | 'quota-limits' | 'manual-config';
}

/**
 * Error message parsing result
 */
export interface ErrorParseResult {
  /** Whether quota/reset info was found */
  found: boolean;
  /** Parsed usage info (if found) */
  usageInfo?: PlatformUsageInfo;
  /** Raw error message */
  errorMessage: string;
}

/**
 * CLI command parsing result
 */
export interface CliParseResult {
  /** Whether usage info was successfully parsed */
  success: boolean;
  /** Parsed usage info (if successful) */
  usageInfo?: PlatformUsageInfo;
  /** Raw CLI output */
  rawOutput: string;
}
