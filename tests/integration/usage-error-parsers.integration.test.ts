/**
 * Usage Error Parsers Integration Tests
 * 
 * Tests for error message parsers (Codex, Gemini, Claude).
 * 
 * These tests verify:
 * - Parsers extract quota/reset information from error messages
 * - Parsers handle invalid/missing patterns gracefully
 * - Parsers return correct PlatformUsageInfo structures
 */

import { describe, it, expect } from 'vitest';
import { CodexErrorParser } from '../../src/platforms/usage/error-parsers/codex-parser.js';
import { GeminiErrorParser } from '../../src/platforms/usage/error-parsers/gemini-parser.js';
import { ClaudeErrorParser } from '../../src/platforms/usage/error-parsers/claude-parser.js';

describe('Usage Error Parsers', () => {
  describe('CodexErrorParser', () => {
    const parser = new CodexErrorParser();

    it('should parse Codex quota limit error correctly', () => {
      const errorMessage = "You've reached your 5-hour message limit. Try again in 3h 42m.";
      const result = parser.parse(errorMessage);

      expect(result.found).toBe(true);
      expect(result.usageInfo).not.toBeNull();
      expect(result.usageInfo?.platform).toBe('codex');
      expect(result.usageInfo?.currentUsage).toBe(5);
      expect(result.usageInfo?.limit).toBe(5);
      expect(result.usageInfo?.remaining).toBe(0);
      expect(result.usageInfo?.period).toBe('hour');
      expect(result.usageInfo?.source).toBe('error');
      expect(result.usageInfo?.resetsAt).toBeTruthy();
      expect(result.usageInfo?.metadata?.limitHours).toBe(5);
      expect(result.usageInfo?.metadata?.resetHours).toBe(3);
      expect(result.usageInfo?.metadata?.resetMinutes).toBe(42);
    });

    it('should parse Codex error with only hours', () => {
      const errorMessage = "You've reached your 10-hour message limit. Try again in 2h.";
      const result = parser.parse(errorMessage);

      expect(result.found).toBe(true);
      expect(result.usageInfo).not.toBeNull();
      expect(result.usageInfo?.limit).toBe(10);
      expect(result.usageInfo?.metadata?.resetHours).toBe(2);
      expect(result.usageInfo?.metadata?.resetMinutes).toBe(0);
    });

    it('should return found=false for invalid error message', () => {
      const errorMessage = 'Some generic error occurred';
      const result = parser.parse(errorMessage);

      expect(result.found).toBe(false);
      expect(result.usageInfo).toBeUndefined();
    });

    it('should calculate reset time correctly', () => {
      const errorMessage = "You've reached your 5-hour message limit. Try again in 1h 30m.";
      const before = new Date();
      const result = parser.parse(errorMessage);
      const after = new Date();

      expect(result.found).toBe(true);
      expect(result.usageInfo?.resetsAt).toBeTruthy();
      
      const resetTime = new Date(result.usageInfo!.resetsAt!);
      const expectedReset = new Date(before.getTime() + (1 * 60 + 30) * 60 * 1000);
      
      // Allow 1 second tolerance
      expect(Math.abs(resetTime.getTime() - expectedReset.getTime())).toBeLessThan(1000);
    });
  });

  describe('GeminiErrorParser', () => {
    const parser = new GeminiErrorParser();

    it('should parse Gemini quota reset error correctly', () => {
      const errorMessage = 'You have exhausted your capacity on this model. Your quota will reset after 8h44m7s.';
      const result = parser.parse(errorMessage);

      expect(result.found).toBe(true);
      expect(result.usageInfo).not.toBeNull();
      expect(result.usageInfo?.platform).toBe('gemini');
      expect(result.usageInfo?.source).toBe('error');
      expect(result.usageInfo?.resetsAt).toBeTruthy();
      expect(result.usageInfo?.metadata?.resetHours).toBe(8);
      expect(result.usageInfo?.metadata?.resetMinutes).toBe(44);
      expect(result.usageInfo?.metadata?.resetSeconds).toBe(7);
      expect(result.usageInfo?.metadata?.exhausted).toBe(true);
    });

    it('should parse Gemini error with exhausted pattern', () => {
      const errorMessage = 'You have exhausted your capacity. Your quota will reset after 2h15m30s.';
      const result = parser.parse(errorMessage);

      expect(result.found).toBe(true);
      expect(result.usageInfo).not.toBeNull();
      expect(result.usageInfo?.metadata?.resetHours).toBe(2);
      expect(result.usageInfo?.metadata?.resetMinutes).toBe(15);
      expect(result.usageInfo?.metadata?.resetSeconds).toBe(30);
    });

    it('should return found=false for invalid error message', () => {
      const errorMessage = 'Some generic error occurred';
      const result = parser.parse(errorMessage);

      expect(result.found).toBe(false);
      expect(result.usageInfo).toBeUndefined();
    });
  });

  describe('ClaudeErrorParser', () => {
    const parser = new ClaudeErrorParser();

    it('should parse Claude rate limit error with Retry-After header', () => {
      const errorMessage = 'Rate limit exceeded';
      const context = {
        statusCode: 429,
        retryAfter: '3600', // 1 hour in seconds
      };

      const result = parser.parse(errorMessage, context);

      expect(result.found).toBe(true);
      expect(result.usageInfo).not.toBeNull();
      expect(result.usageInfo?.platform).toBe('claude');
      expect(result.usageInfo?.source).toBe('error');
      expect(result.usageInfo?.resetsAt).toBeTruthy();
      expect(result.usageInfo?.metadata?.statusCode).toBe(429);
      expect(result.usageInfo?.metadata?.retryAfter).toBe('3600');
    });

    it('should parse Claude 413 error (payload too large)', () => {
      const errorMessage = 'Request entity too large';
      const context = {
        statusCode: 413,
        retryAfter: '1800', // 30 minutes
      };

      const result = parser.parse(errorMessage, context);

      expect(result.found).toBe(true);
      expect(result.usageInfo?.metadata?.statusCode).toBe(413);
    });

    it('should parse Claude 503 error (service unavailable)', () => {
      const errorMessage = 'Service temporarily unavailable';
      const context = {
        statusCode: 503,
        retryAfter: '60', // 1 minute
      };

      const result = parser.parse(errorMessage, context);

      expect(result.found).toBe(true);
      expect(result.usageInfo?.metadata?.statusCode).toBe(503);
    });

    it('should parse Claude error with reset time in message', () => {
      // Parser logic: if statusCode is rate limit (429/413/503/529) but no retryAfter,
      // it tries to parse reset time from error message using "reset after/in/at" pattern
      // However, if statusCode is set, it first checks for retryAfter
      // So we need either retryAfter OR no statusCode for message parsing to work
      const errorMessage = 'Rate limit exceeded. Reset after 2026-01-27T00:00:00Z';
      // Don't provide statusCode so parser tries message parsing
      const context = {};

      const result = parser.parse(errorMessage, context);

      // Should parse ISO date format from message
      expect(result.found).toBe(true);
      expect(result.usageInfo?.resetsAt).toBeTruthy();
      expect(result.usageInfo?.resetsAt).toContain('2026-01-27');
    });

    it('should return found=false for non-rate-limit errors', () => {
      const errorMessage = 'Invalid request';
      const context = {
        statusCode: 400,
      };

      const result = parser.parse(errorMessage, context);

      expect(result.found).toBe(false);
    });
  });
});
