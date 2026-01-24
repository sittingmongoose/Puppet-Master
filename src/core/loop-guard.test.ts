/**
 * Tests for LoopGuard
 *
 * @see BUILD_QUEUE_IMPROVEMENTS.md P2-T02: Loop Guards
 */

import { describe, it, expect, vi } from 'vitest';
import { LoopGuard, LoopGuardMessage } from './loop-guard.js';
import type { LoopGuardConfig } from '../types/config.js';

describe('LoopGuard', () => {
  const defaultConfig: LoopGuardConfig = {
    enabled: true,
    maxRepetitions: 3,
    suppressReplyRelay: false,
  };

  describe('control/system message blocking', () => {
    it('blocks control messages', () => {
      const guard = new LoopGuard(defaultConfig);
      expect(guard.shouldAllow({ kind: 'control', content: 'test' })).toBe(false);
    });

    it('blocks system messages', () => {
      const guard = new LoopGuard(defaultConfig);
      expect(guard.shouldAllow({ kind: 'system', content: 'test' })).toBe(false);
    });

    it('allows non-control/non-system messages', () => {
      const guard = new LoopGuard(defaultConfig);
      expect(guard.shouldAllow({ kind: 'reviewer_feedback', content: 'test' })).toBe(true);
      expect(guard.shouldAllow({ kind: 'worker_output', content: 'test' })).toBe(true);
    });
  });

  describe('reply relay suppression', () => {
    it('suppresses reply messages when configured', () => {
      const guard = new LoopGuard({ ...defaultConfig, suppressReplyRelay: true });
      expect(guard.shouldAllow({ kind: 'reply', content: 'test' })).toBe(false);
    });

    it('allows reply messages when not configured', () => {
      const guard = new LoopGuard({ ...defaultConfig, suppressReplyRelay: false });
      expect(guard.shouldAllow({ kind: 'reply', content: 'test' })).toBe(true);
    });
  });

  describe('repetition detection', () => {
    it('allows messages below maxRepetitions threshold', () => {
      const guard = new LoopGuard({ ...defaultConfig, maxRepetitions: 3 });
      const msg: LoopGuardMessage = { kind: 'reviewer_feedback', content: 'same feedback' };

      expect(guard.shouldAllow(msg)).toBe(true); // 1
      expect(guard.shouldAllow(msg)).toBe(true); // 2
      expect(guard.shouldAllow(msg)).toBe(true); // 3
    });

    it('blocks messages at maxRepetitions threshold', () => {
      const guard = new LoopGuard({ ...defaultConfig, maxRepetitions: 3 });
      const msg: LoopGuardMessage = { kind: 'reviewer_feedback', content: 'same feedback' };

      guard.shouldAllow(msg); // 1
      guard.shouldAllow(msg); // 2
      guard.shouldAllow(msg); // 3
      expect(guard.shouldAllow(msg)).toBe(false); // 4 - blocked
    });

    it('tracks different messages separately', () => {
      const guard = new LoopGuard({ ...defaultConfig, maxRepetitions: 2 });
      const msg1: LoopGuardMessage = { kind: 'feedback', content: 'message 1' };
      const msg2: LoopGuardMessage = { kind: 'feedback', content: 'message 2' };

      expect(guard.shouldAllow(msg1)).toBe(true); // msg1: 1
      expect(guard.shouldAllow(msg2)).toBe(true); // msg2: 1
      expect(guard.shouldAllow(msg1)).toBe(true); // msg1: 2
      expect(guard.shouldAllow(msg2)).toBe(true); // msg2: 2
      expect(guard.shouldAllow(msg1)).toBe(false); // msg1: 3 - blocked
      expect(guard.shouldAllow(msg2)).toBe(false); // msg2: 3 - blocked
    });

    it('considers kind, from, to, and content in hash', () => {
      const guard = new LoopGuard({ ...defaultConfig, maxRepetitions: 1 });

      // Same content, different kind
      guard.shouldAllow({ kind: 'type_a', content: 'same' });
      expect(guard.shouldAllow({ kind: 'type_b', content: 'same' })).toBe(true);

      // Same content and kind, different from
      guard.shouldAllow({ kind: 'type_c', from: 'a', content: 'same' });
      expect(guard.shouldAllow({ kind: 'type_c', from: 'b', content: 'same' })).toBe(true);

      // Same content, kind, and from, different to
      guard.shouldAllow({ kind: 'type_d', from: 'a', to: 'x', content: 'same' });
      expect(guard.shouldAllow({ kind: 'type_d', from: 'a', to: 'y', content: 'same' })).toBe(true);
    });
  });

  describe('reset()', () => {
    it('clears message history', () => {
      const guard = new LoopGuard({ ...defaultConfig, maxRepetitions: 2 });
      const msg: LoopGuardMessage = { kind: 'test', content: 'data' };

      guard.shouldAllow(msg); // 1
      guard.shouldAllow(msg); // 2
      expect(guard.shouldAllow(msg)).toBe(false); // 3 - blocked

      guard.reset();

      expect(guard.shouldAllow(msg)).toBe(true); // 1 again after reset
    });

    it('clears unique message count', () => {
      const guard = new LoopGuard(defaultConfig);

      guard.shouldAllow({ kind: 'a', content: '1' });
      guard.shouldAllow({ kind: 'b', content: '2' });
      expect(guard.getUniqueMessageCount()).toBe(2);

      guard.reset();
      expect(guard.getUniqueMessageCount()).toBe(0);
    });
  });

  describe('disabled guard', () => {
    it('allows all messages when disabled', () => {
      const guard = new LoopGuard({ ...defaultConfig, enabled: false });

      // Control messages allowed
      expect(guard.shouldAllow({ kind: 'control', content: 'test' })).toBe(true);
      expect(guard.shouldAllow({ kind: 'system', content: 'test' })).toBe(true);

      // Reply messages allowed even with suppressReplyRelay
      const guardWithSuppression = new LoopGuard({
        enabled: false,
        maxRepetitions: 3,
        suppressReplyRelay: true,
      });
      expect(guardWithSuppression.shouldAllow({ kind: 'reply', content: 'test' })).toBe(true);

      // Repetitions allowed beyond threshold
      const msg: LoopGuardMessage = { kind: 'test', content: 'same' };
      for (let i = 0; i < 10; i++) {
        expect(guard.shouldAllow(msg)).toBe(true);
      }
    });
  });

  describe('getCount()', () => {
    it('returns count for seen messages', () => {
      const guard = new LoopGuard(defaultConfig);
      const msg: LoopGuardMessage = { kind: 'test', content: 'data' };

      expect(guard.getCount(msg)).toBe(0);
      guard.shouldAllow(msg);
      expect(guard.getCount(msg)).toBe(1);
      guard.shouldAllow(msg);
      expect(guard.getCount(msg)).toBe(2);
    });

    it('returns 0 for unseen messages', () => {
      const guard = new LoopGuard(defaultConfig);
      expect(guard.getCount({ kind: 'never_seen', content: 'data' })).toBe(0);
    });
  });

  describe('getUniqueMessageCount()', () => {
    it('tracks number of unique messages', () => {
      const guard = new LoopGuard(defaultConfig);

      expect(guard.getUniqueMessageCount()).toBe(0);

      guard.shouldAllow({ kind: 'a', content: '1' });
      expect(guard.getUniqueMessageCount()).toBe(1);

      guard.shouldAllow({ kind: 'a', content: '1' }); // Same message
      expect(guard.getUniqueMessageCount()).toBe(1);

      guard.shouldAllow({ kind: 'b', content: '2' }); // Different message
      expect(guard.getUniqueMessageCount()).toBe(2);
    });
  });

  describe('logging', () => {
    it('logs warning when blocking repeated messages', () => {
      const guard = new LoopGuard({ ...defaultConfig, maxRepetitions: 1 });
      const msg: LoopGuardMessage = { kind: 'test', content: 'data' };
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      guard.shouldAllow(msg); // 1
      guard.shouldAllow(msg); // 2 - blocked

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[LoopGuard] Loop detected')
      );

      warnSpy.mockRestore();
    });
  });
});
