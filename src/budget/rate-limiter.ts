/**
 * RateLimiter for RWM Puppet Master
 * 
 * Enforces rate limits per platform to prevent API throttling.
 * Tracks calls per minute and implements cooldown when limits are hit.
 * 
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T07 for requirements.
 */

import type { Platform, PlatformRateLimits } from '../types/config.js';

/**
 * Maximum wait time to prevent indefinite blocking (5 minutes).
 */
const MAX_WAIT_TIME_MS = 5 * 60 * 1000;

/**
 * Rate limiter that tracks and enforces call rate limits per platform.
 */
export class RateLimiter {
  private callHistory: Map<Platform, number[]> = new Map();
  private config: PlatformRateLimits;
  private maxWaitTimeMs: number;

  /**
   * Creates a new RateLimiter instance.
   * 
   * @param config - Rate limit configuration per platform
   * @param maxWaitTimeMs - Maximum time to wait for a slot (default: 5 minutes)
   */
  constructor(config: PlatformRateLimits, maxWaitTimeMs: number = MAX_WAIT_TIME_MS) {
    this.config = config;
    this.maxWaitTimeMs = maxWaitTimeMs;
  }

  /**
   * Waits for an available slot if the rate limit has been reached.
   * 
   * Filters recent calls (last 60 seconds) and waits if the limit is reached.
   * Has a maximum wait time to prevent indefinite blocking.
   * 
   * @param platform - Platform to check rate limit for
   * @throws Error if wait time exceeds maxWaitTimeMs
   */
  async waitForSlot(platform: Platform): Promise<void> {
    const history = this.callHistory.get(platform) || [];
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Filter recent calls (last 60 seconds)
    const recentCalls = history.filter(timestamp => timestamp > oneMinuteAgo);

    const limit = this.config[platform].callsPerMinute;

    // If limit not reached, no need to wait
    if (recentCalls.length < limit) {
      return;
    }

    // Calculate wait time: time until the oldest call in the window expires
    const oldestCall = recentCalls[0];
    const waitTime = 60000 - (now - oldestCall);

    // Don't wait longer than max wait time
    if (waitTime > this.maxWaitTimeMs) {
      throw new Error(
        `Rate limit wait time (${waitTime}ms) exceeds maximum (${this.maxWaitTimeMs}ms) for platform ${platform}`
      );
    }

    // Log rate limit event
    console.info(
      `[RateLimiter] Rate limit reached for ${platform} (${recentCalls.length}/${limit} calls in last minute), waiting ${waitTime}ms`
    );

    // Wait for the calculated time
    await this.sleep(waitTime);

    // Clean up old timestamps after waiting
    this.cleanupOldTimestamps(platform);
  }

  /**
   * Records a call for the specified platform.
   * Adds the current timestamp to the call history.
   * 
   * @param platform - Platform that made the call
   */
  recordCall(platform: Platform): void {
    const history = this.callHistory.get(platform) || [];
    const now = Date.now();

    // Add current timestamp
    history.push(now);

    // Clean up old timestamps periodically (every 10 calls to avoid overhead)
    if (history.length % 10 === 0) {
      this.cleanupOldTimestamps(platform);
    }

    this.callHistory.set(platform, history);
  }

  /**
   * Cleans up timestamps older than 60 seconds for a platform.
   * Prevents memory leaks from unbounded timestamp storage.
   * 
   * @param platform - Platform to clean up
   */
  private cleanupOldTimestamps(platform: Platform): void {
    const history = this.callHistory.get(platform);
    if (!history) {
      return;
    }

    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Keep only timestamps from the last 60 seconds
    const recentHistory = history.filter(timestamp => timestamp > oneMinuteAgo);
    this.callHistory.set(platform, recentHistory);
  }

  /**
   * Sleeps for the specified number of milliseconds.
   * 
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Gets the current call count for a platform in the last minute.
   * Useful for monitoring and debugging.
   * 
   * @param platform - Platform to check
   * @returns Number of calls in the last 60 seconds
   */
  getRecentCallCount(platform: Platform): number {
    const history = this.callHistory.get(platform) || [];
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    return history.filter(timestamp => timestamp > oneMinuteAgo).length;
  }

  /**
   * Resets the call history for a platform.
   * Useful for testing or manual reset scenarios.
   * 
   * @param platform - Platform to reset
   */
  reset(platform: Platform): void {
    this.callHistory.delete(platform);
  }

  /**
   * Resets call history for all platforms.
   */
  resetAll(): void {
    this.callHistory.clear();
  }
}
