/**
 * Permission Audit Logger
 *
 * Centralized in-memory audit log for all permission-related decisions
 * across platforms. Tracks what flags were applied, what prompts were
 * detected, and what SDK permission callbacks were invoked.
 *
 * This log is queryable per-platform and serializable to JSON for
 * debugging, post-mortem analysis, and integration with the EventBus.
 */

import type { Platform } from '../types/platforms.js';
import type { PermissionPromptDetection } from './permission-prompt-detector.js';

/**
 * Types of permission audit events.
 */
export type PermissionAuditEventType =
  | 'flags_applied'
  | 'prompt_detected'
  | 'sdk_permission_request'
  | 'sdk_permission_decision'
  | 'probe_result';

/**
 * A single entry in the permission audit log.
 */
export interface PermissionAuditEntry {
  /** ISO timestamp of the event */
  timestamp: string;
  /** Platform that generated the event */
  platform: Platform;
  /** Type of permission event */
  event: PermissionAuditEventType;
  /** Event-specific details */
  details: Record<string, unknown>;
}

/**
 * In-memory permission audit logger.
 *
 * Thread-safe for single-process Node.js usage (no mutex needed).
 * Entries are capped at MAX_ENTRIES to prevent unbounded growth.
 */
export class PermissionAuditLogger {
  private entries: PermissionAuditEntry[] = [];

  /** Maximum entries to retain (oldest are dropped when exceeded) */
  private static readonly MAX_ENTRIES = 1000;

  /**
   * Logs the permission-related CLI flags that were applied to a platform invocation.
   */
  logFlagsApplied(
    platform: Platform,
    flags: Record<string, string | boolean | undefined>
  ): void {
    this.addEntry({
      timestamp: new Date().toISOString(),
      platform,
      event: 'flags_applied',
      details: { flags },
    });
  }

  /**
   * Logs a detected permission prompt in agent output.
   */
  logPromptDetected(detection: PermissionPromptDetection): void {
    this.addEntry({
      timestamp: detection.timestamp,
      platform: detection.platform,
      event: 'prompt_detected',
      details: {
        pattern: detection.pattern,
        context: detection.context,
      },
    });
  }

  /**
   * Logs an incoming SDK permission request (before decision).
   */
  logSdkPermissionRequest(
    platform: Platform,
    requestType: string,
    resource: string
  ): void {
    this.addEntry({
      timestamp: new Date().toISOString(),
      platform,
      event: 'sdk_permission_request',
      details: { requestType, resource },
    });
  }

  /**
   * Logs the decision made for an SDK permission request.
   */
  logSdkPermissionDecision(
    platform: Platform,
    requestType: string,
    resource: string,
    decision: string,
    reason?: string
  ): void {
    this.addEntry({
      timestamp: new Date().toISOString(),
      platform,
      event: 'sdk_permission_decision',
      details: { requestType, resource, decision, reason },
    });
  }

  /**
   * Logs the result of a capability probe (e.g., Cursor approval flag discovery).
   */
  logProbeResult(
    platform: Platform,
    probeType: string,
    result: Record<string, unknown>
  ): void {
    this.addEntry({
      timestamp: new Date().toISOString(),
      platform,
      event: 'probe_result',
      details: { probeType, ...result },
    });
  }

  /**
   * Returns all audit entries.
   */
  getEntries(): ReadonlyArray<PermissionAuditEntry> {
    return this.entries;
  }

  /**
   * Returns audit entries for a specific platform.
   */
  getEntriesForPlatform(platform: Platform): PermissionAuditEntry[] {
    return this.entries.filter((e) => e.platform === platform);
  }

  /**
   * Returns audit entries of a specific event type.
   */
  getEntriesByType(eventType: PermissionAuditEventType): PermissionAuditEntry[] {
    return this.entries.filter((e) => e.event === eventType);
  }

  /**
   * Returns the total number of entries.
   */
  get size(): number {
    return this.entries.length;
  }

  /**
   * Serializes the audit log to a JSON string.
   */
  toJSON(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  /**
   * Clears all entries.
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * Adds an entry, enforcing the max size cap.
   */
  private addEntry(entry: PermissionAuditEntry): void {
    this.entries.push(entry);
    // Drop oldest entries when cap is exceeded
    if (this.entries.length > PermissionAuditLogger.MAX_ENTRIES) {
      this.entries = this.entries.slice(-PermissionAuditLogger.MAX_ENTRIES);
    }
  }
}
