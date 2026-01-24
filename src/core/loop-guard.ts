/**
 * Loop Guard for preventing infinite ping-pong loops in multi-agent scenarios.
 *
 * Implements deterministic loop detection using message hashing and counting.
 * Designed to break worker/reviewer feedback cycles when the same feedback
 * is repeated beyond a configurable threshold.
 *
 * @see BUILD_QUEUE_IMPROVEMENTS.md P2-T02: Loop Guards
 */

import { createHash } from 'crypto';
import type { LoopGuardConfig } from '../types/config.js';

/**
 * Message structure for loop guard evaluation.
 * Represents a message that may be checked for repetition.
 */
export interface LoopGuardMessage {
  /** Message type: control, system, reply, reviewer_feedback, etc. */
  kind: string;
  /** Optional sender identifier */
  from?: string;
  /** Optional recipient identifier */
  to?: string;
  /** Message content to hash for repetition detection */
  content: string;
}

/**
 * LoopGuard tracks message patterns and prevents repeated identical messages.
 *
 * Rules:
 * 1. Never allow control/system messages (always blocked)
 * 2. Suppress reply messages if configured (suppressReplyRelay)
 * 3. Block messages after maxRepetitions of identical content
 */
export class LoopGuard {
  /** Map of message hash to occurrence count */
  private messageHistory: Map<string, number> = new Map();

  /** Configuration for this guard instance */
  private readonly config: LoopGuardConfig;

  /**
   * Creates a new LoopGuard instance.
   *
   * @param config - Loop guard configuration
   */
  constructor(config: LoopGuardConfig) {
    this.config = config;
  }

  /**
   * Checks if a message should be allowed through.
   *
   * @param message - The message to evaluate
   * @returns true if the message should be allowed, false if blocked
   */
  shouldAllow(message: LoopGuardMessage): boolean {
    // Guard disabled - allow everything
    if (!this.config.enabled) {
      return true;
    }

    // Rule 1: Never allow control/system messages
    if (message.kind === 'control' || message.kind === 'system') {
      return false;
    }

    // Rule 2: Suppress reply relay if configured
    if (this.config.suppressReplyRelay && message.kind === 'reply') {
      return false;
    }

    // Rule 3: Detect repeated patterns
    const hash = this.hashMessage(message);
    const count = this.messageHistory.get(hash) ?? 0;
    const newCount = count + 1;

    // Update count
    this.messageHistory.set(hash, newCount);

    // Block if at or above threshold
    if (newCount > this.config.maxRepetitions) {
      console.warn(
        `[LoopGuard] Loop detected: message seen ${newCount} times (max: ${this.config.maxRepetitions}), blocking`
      );
      return false;
    }

    return true;
  }

  /**
   * Computes a deterministic hash of message fields.
   *
   * Uses MD5 for speed (not security-critical).
   * Hashes: kind, from, to, and content fields.
   *
   * @param message - The message to hash
   * @returns Hex-encoded MD5 hash
   */
  private hashMessage(message: LoopGuardMessage): string {
    const data = [
      message.kind ?? '',
      message.from ?? '',
      message.to ?? '',
      message.content ?? '',
    ].join('|');

    return createHash('md5').update(data).digest('hex');
  }

  /**
   * Clears the message history.
   *
   * Should be called when switching subtasks or starting a new context
   * to prevent false positives from unrelated messages.
   */
  reset(): void {
    this.messageHistory.clear();
  }

  /**
   * Gets the current count for a specific message.
   * Useful for testing and debugging.
   *
   * @param message - The message to check
   * @returns The current count, or 0 if not seen
   */
  getCount(message: LoopGuardMessage): number {
    const hash = this.hashMessage(message);
    return this.messageHistory.get(hash) ?? 0;
  }

  /**
   * Gets the total number of unique messages tracked.
   * Useful for monitoring and debugging.
   *
   * @returns Number of unique message hashes tracked
   */
  getUniqueMessageCount(): number {
    return this.messageHistory.size;
  }
}
