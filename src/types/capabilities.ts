/**
 * Platform capability discovery types for RWM Puppet Master
 * 
 * This file defines TypeScript interfaces for platform capability discovery,
 * probing results, quota tracking, and cooldown management.
 * 
 * These types support the capability discovery service and caching mechanism
 * in `.puppet-master/capabilities/`.
 * 
 * Per REQUIREMENTS.md Section 26 (Platform Discovery & Capability Probing)
 * and Section 23 (Quota / Cooldown-Aware Scheduling).
 */

import type { Platform } from './config.js';

export type PlatformAuthStatus =
  | 'authenticated'
  | 'not_authenticated'
  | 'skipped'
  | 'unknown';

/**
 * Feature flag type for capability booleans.
 */
export type FeatureFlag = boolean;

/**
 * Platform capabilities discovered at runtime.
 * 
 * Represents the capabilities that a platform CLI supports, as determined
 * through discovery/probing operations.
 */
export interface PlatformCapabilities {
  /** Whether the platform supports streaming output */
  streaming: boolean;
  
  /** Whether the platform can execute code */
  codeExecution: boolean;
  
  /** Whether the platform can generate images */
  imageGeneration: boolean;
  
  /** Whether the platform has file system access */
  fileAccess: boolean;
  
  /** Whether the platform can perform web searches */
  webSearch: boolean;
  
  /** Whether the platform can perform computer use actions */
  computerUse: boolean;
  
  /** Maximum context tokens supported */
  maxContextTokens: number;
  
  /** Maximum output tokens supported */
  maxOutputTokens: number;
  
  /** List of programming languages supported */
  supportedLanguages: string[];
}

/**
 * Information about quota limits and usage.
 * 
 * Tracks remaining quota, limits, and reset information for a platform.
 * Per REQUIREMENTS.md Section 23.3 (Budget Configuration).
 */
export interface QuotaInfo {
  /** Remaining quota available */
  remaining: number;
  
  /** Total quota limit */
  limit: number;
  
  /** ISO 8601 timestamp when quota resets */
  resetsAt: string;
  
  /** Time period for this quota (run, hour, or day) */
  period: 'run' | 'hour' | 'day';
}

/**
 * Information about active cooldowns.
 * 
 * Tracks whether a platform is in a cooldown period and when it will end.
 * Per REQUIREMENTS.md Section 23.5 (Cooldown Handling).
 */
export interface CooldownInfo {
  /** Whether a cooldown is currently active */
  active: boolean;
  
  /** ISO 8601 timestamp when cooldown ends, or null if not active */
  endsAt: string | null;
  
  /** Explanation for why the cooldown was triggered, or null if not active */
  reason: string | null;
}

/**
 * Result of a capability probe operation.
 * 
 * Contains the discovered capabilities, version information, and current
 * quota/cooldown status for a platform.
 */
export interface CapabilityProbeResult {
  /** The platform that was probed */
  platform: Platform;

  /** The CLI command that was used (config override or fallback) */
  command: string;

  /** Whether the CLI could actually be executed (not just found) */
  runnable: boolean;

  /** Best-effort auth readiness status (local-only; may be skipped/unknown) */
  authStatus: PlatformAuthStatus;

  /** Version string of the platform CLI */
  version: string;
  
  /** Discovered capabilities of the platform */
  capabilities: PlatformCapabilities;
  
  /** Current quota information */
  quotaInfo: QuotaInfo;
  
  /** Current cooldown information */
  cooldownInfo: CooldownInfo;
  
  /** ISO 8601 timestamp when the probe was performed */
  probeTimestamp: string;
}
