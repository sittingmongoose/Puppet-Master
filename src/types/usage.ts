/**
 * Usage tracking types for RWM Puppet Master
 * 
 * Defines types for tracking platform usage events in usage.jsonl.
 * Per STATE_FILES.md Section 4 and REQUIREMENTS.md Section 23.
 */

import type { Platform } from './config.js';

/**
 * Usage event recorded in usage.jsonl
 * 
 * Matches STATE_FILES.md Section 4 schema (UPDATED v2.1).
 * Each line in usage.jsonl is a JSON object of this type.
 */
export interface UsageEvent {
  /** ISO 8601 timestamp (UTC) */
  timestamp: string;
  /** Platform that was used */
  platform: Platform;
  /** Action type (e.g., 'iteration', 'gate_review', 'start_chain', 'phase_gate', 'task_gate') */
  action: string;
  /** Number of tokens used (optional) */
  tokens?: number;
  /** Duration in milliseconds */
  durationMs: number;
  /** Session ID (format: PM-YYYY-MM-DD-HH-MM-SS-NNN) */
  sessionId?: string;
  /** Item ID (e.g., 'PH-001', 'TK-001-001', 'ST-001-001-001') */
  itemId?: string;
  /** Whether the action succeeded */
  success: boolean;
  /** Error message if success is false */
  error?: string;
}

/**
 * Query parameters for filtering usage events
 */
export interface UsageQuery {
  /** Filter by platform */
  platform?: Platform;
  /** Filter by action type */
  action?: string;
  /** Only include events after this date */
  since?: Date;
  /** Only include events before this date */
  until?: Date;
  /** Maximum number of results to return */
  limit?: number;
}

/**
 * Aggregated usage statistics for a platform
 */
export interface UsageSummary {
  /** Platform this summary is for */
  platform: Platform;
  /** Total number of calls/events */
  totalCalls: number;
  /** Total tokens used (sum of all tokens, 0 if not tracked) */
  totalTokens: number;
  /** Total duration in milliseconds */
  totalDurationMs: number;
  /** Number of successful calls */
  successCount: number;
  /** Number of failed calls */
  failureCount: number;
}
