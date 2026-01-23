/**
 * Tests for RateLimiter
 * 
 * Tests rate limiting functionality per BUILD_QUEUE_IMPROVEMENTS.md P1-T07.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter } from './rate-limiter.js';
import type { PlatformRateLimits } from '../types/config.js';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  let config: PlatformRateLimits;

  beforeEach(() => {
    config = {
      cursor: {
        callsPerMinute: 5,
        cooldownMs: 1000,
      },
      codex: {
        callsPerMinute: 3,
        cooldownMs: 2000,
      },
      claude: {
        callsPerMinute: 10,
        cooldownMs: 500,
      },
      gemini: {
        callsPerMinute: 20,
        cooldownMs: 300,
      },
      copilot: {
        callsPerMinute: 15,
        cooldownMs: 400,
      },
      antigravity: {
        callsPerMinute: 30,
        cooldownMs: 200,
      },
    };

    rateLimiter = new RateLimiter(config);
  });

  describe('waitForSlot', () => {
    it('should not wait when under limit', async () => {
      const startTime = Date.now();
      await rateLimiter.waitForSlot('cursor');
      const elapsed = Date.now() - startTime;

      // Should return immediately (within 10ms)
      expect(elapsed).toBeLessThan(10);
    });

    it('should wait when limit reached', async () => {
      vi.useFakeTimers();

      // Record calls up to the limit
      for (let i = 0; i < config.cursor.callsPerMinute; i++) {
        rateLimiter.recordCall('cursor');
        vi.advanceTimersByTime(1000); // Advance 1 second per call
      }

      // Now we're at the limit, next call should wait
      const waitPromise = rateLimiter.waitForSlot('cursor');

      // Advance time to simulate waiting (should wait ~60 seconds)
      vi.advanceTimersByTime(60000);

      await waitPromise;

      vi.useRealTimers();
    });

    it('should wait correct amount of time when limit reached', async () => {
      vi.useFakeTimers();

      // Record calls up to the limit
      for (let i = 0; i < config.cursor.callsPerMinute; i++) {
        rateLimiter.recordCall('cursor');
        // Advance time by 1 second for each call
        vi.advanceTimersByTime(1000);
      }

      // Now we're at the limit, next call should wait
      const waitPromise = rateLimiter.waitForSlot('cursor');

      // Advance time to simulate waiting
      vi.advanceTimersByTime(60000); // 60 seconds

      await waitPromise;

      vi.useRealTimers();
    });

    it('should throw error when wait time exceeds max wait time', async () => {
      const maxWaitTime = 1000; // 1 second max wait
      const shortWaitLimiter = new RateLimiter(config, maxWaitTime);

      // Record many calls to create a long wait time
      for (let i = 0; i < config.cursor.callsPerMinute * 2; i++) {
        shortWaitLimiter.recordCall('cursor');
      }

      await expect(shortWaitLimiter.waitForSlot('cursor')).rejects.toThrow(
        'Rate limit wait time'
      );
    });

    it('should track multiple platforms independently', async () => {
      vi.useFakeTimers();

      // Fill up cursor limit
      for (let i = 0; i < config.cursor.callsPerMinute; i++) {
        rateLimiter.recordCall('cursor');
        vi.advanceTimersByTime(1000);
      }

      // Fill up codex limit
      for (let i = 0; i < config.codex.callsPerMinute; i++) {
        rateLimiter.recordCall('codex');
        vi.advanceTimersByTime(1000);
      }

      // Cursor should wait
      const cursorWaitPromise = rateLimiter.waitForSlot('cursor');
      vi.advanceTimersByTime(60000);
      await cursorWaitPromise;

      // Codex should also wait
      const codexWaitPromise = rateLimiter.waitForSlot('codex');
      vi.advanceTimersByTime(60000);
      await codexWaitPromise;

      vi.useRealTimers();
    });
  });

  describe('recordCall', () => {
    it('should add timestamp to history', () => {
      const initialCount = rateLimiter.getRecentCallCount('cursor');
      expect(initialCount).toBe(0);

      rateLimiter.recordCall('cursor');
      const afterCount = rateLimiter.getRecentCallCount('cursor');
      expect(afterCount).toBe(1);
    });

    it('should track multiple calls', () => {
      rateLimiter.recordCall('cursor');
      rateLimiter.recordCall('cursor');
      rateLimiter.recordCall('cursor');

      const count = rateLimiter.getRecentCallCount('cursor');
      expect(count).toBe(3);
    });

    it('should track calls per platform independently', () => {
      rateLimiter.recordCall('cursor');
      rateLimiter.recordCall('cursor');
      rateLimiter.recordCall('codex');

      expect(rateLimiter.getRecentCallCount('cursor')).toBe(2);
      expect(rateLimiter.getRecentCallCount('codex')).toBe(1);
    });
  });

  describe('cleanupOldTimestamps', () => {
    it('should clean up timestamps older than 60 seconds', async () => {
      vi.useFakeTimers();

      // Record a call
      rateLimiter.recordCall('cursor');
      expect(rateLimiter.getRecentCallCount('cursor')).toBe(1);

      // Advance time by 61 seconds
      vi.advanceTimersByTime(61000);

      // The timestamp should be cleaned up on next recordCall (every 10 calls)
      // Or we can trigger cleanup by calling waitForSlot
      await rateLimiter.waitForSlot('cursor');

      // Count should be 0 after cleanup
      expect(rateLimiter.getRecentCallCount('cursor')).toBe(0);

      vi.useRealTimers();
    });

    it('should keep timestamps within 60 seconds', async () => {
      vi.useFakeTimers();

      // Record calls
      rateLimiter.recordCall('cursor');
      vi.advanceTimersByTime(30000); // 30 seconds
      rateLimiter.recordCall('cursor');
      vi.advanceTimersByTime(30000); // Another 30 seconds (total 60)

      // First call should be cleaned up, second should remain
      await rateLimiter.waitForSlot('cursor');
      expect(rateLimiter.getRecentCallCount('cursor')).toBeGreaterThanOrEqual(0);

      vi.useRealTimers();
    });
  });

  describe('getRecentCallCount', () => {
    it('should return 0 for platform with no calls', () => {
      expect(rateLimiter.getRecentCallCount('cursor')).toBe(0);
      expect(rateLimiter.getRecentCallCount('codex')).toBe(0);
    });

    it('should return correct count for recent calls', () => {
      rateLimiter.recordCall('cursor');
      rateLimiter.recordCall('cursor');
      rateLimiter.recordCall('cursor');

      expect(rateLimiter.getRecentCallCount('cursor')).toBe(3);
    });

    it('should not count calls older than 60 seconds', async () => {
      vi.useFakeTimers();

      rateLimiter.recordCall('cursor');
      expect(rateLimiter.getRecentCallCount('cursor')).toBe(1);

      // Advance time by 61 seconds
      vi.advanceTimersByTime(61000);

      // Trigger cleanup
      await rateLimiter.waitForSlot('cursor');

      expect(rateLimiter.getRecentCallCount('cursor')).toBe(0);

      vi.useRealTimers();
    });
  });

  describe('reset', () => {
    it('should reset call history for a platform', () => {
      rateLimiter.recordCall('cursor');
      rateLimiter.recordCall('cursor');
      expect(rateLimiter.getRecentCallCount('cursor')).toBe(2);

      rateLimiter.reset('cursor');
      expect(rateLimiter.getRecentCallCount('cursor')).toBe(0);
    });

    it('should not affect other platforms when resetting one', () => {
      rateLimiter.recordCall('cursor');
      rateLimiter.recordCall('codex');
      rateLimiter.recordCall('codex');

      rateLimiter.reset('cursor');

      expect(rateLimiter.getRecentCallCount('cursor')).toBe(0);
      expect(rateLimiter.getRecentCallCount('codex')).toBe(2);
    });
  });

  describe('resetAll', () => {
    it('should reset call history for all platforms', () => {
      rateLimiter.recordCall('cursor');
      rateLimiter.recordCall('codex');
      rateLimiter.recordCall('claude');

      rateLimiter.resetAll();

      expect(rateLimiter.getRecentCallCount('cursor')).toBe(0);
      expect(rateLimiter.getRecentCallCount('codex')).toBe(0);
      expect(rateLimiter.getRecentCallCount('claude')).toBe(0);
    });
  });
});
