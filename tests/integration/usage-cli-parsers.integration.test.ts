/**
 * Usage CLI Parsers Integration Tests
 * 
 * Tests for CLI command output parsers (Codex /status, Claude /cost /stats, Gemini /stats).
 * 
 * These tests verify:
 * - Parsers extract usage information from CLI output
 * - Parsers handle various output formats
 * - Parsers return correct PlatformUsageInfo structures
 */

import { describe, it, expect } from 'vitest';
import { CodexStatusParser } from '../../src/platforms/usage/cli-parsers/codex-status-parser.js';
import { ClaudeCostParser } from '../../src/platforms/usage/cli-parsers/claude-cost-parser.js';
import { ClaudeStatsParser } from '../../src/platforms/usage/cli-parsers/claude-stats-parser.js';
import { GeminiStatsParser } from '../../src/platforms/usage/cli-parsers/gemini-stats-parser.js';

describe('Usage CLI Parsers', () => {
  describe('CodexStatusParser', () => {
    const parser = new CodexStatusParser();

    it('should parse Codex /status output correctly', () => {
      const output = `Input tokens: 1,234
Output tokens: 5,678
Total tokens: 6,912`;

      const result = parser.parse(output);

      expect(result.success).toBe(true);
      expect(result.usageInfo).not.toBeNull();
      expect(result.usageInfo?.platform).toBe('codex');
      expect(result.usageInfo?.tokens?.input).toBe(1234);
      expect(result.usageInfo?.tokens?.output).toBe(5678);
      expect(result.usageInfo?.tokens?.total).toBe(6912);
      expect(result.usageInfo?.source).toBe('cli');
      expect(result.usageInfo?.metadata?.command).toBe('/status');
    });

    it('should parse Codex /status with single token count', () => {
      const output = `Input token: 500
Output token: 1000`;

      const result = parser.parse(output);

      expect(result.success).toBe(true);
      expect(result.usageInfo?.tokens?.input).toBe(500);
      expect(result.usageInfo?.tokens?.output).toBe(1000);
      expect(result.usageInfo?.tokens?.total).toBe(1500);
    });

    it('should parse Codex /status with only total tokens', () => {
      const output = 'Total tokens: 10,000';

      const result = parser.parse(output);

      expect(result.success).toBe(true);
      expect(result.usageInfo?.tokens?.total).toBe(10000);
    });

    it('should handle output without token information', () => {
      const output = 'Some other output';

      const result = parser.parse(output);

      expect(result.success).toBe(false);
      expect(result.usageInfo).toBeUndefined();
    });

    it('should handle numbers without commas', () => {
      const output = `Input tokens: 1234
Output tokens: 5678`;

      const result = parser.parse(output);

      expect(result.success).toBe(true);
      expect(result.usageInfo?.tokens?.input).toBe(1234);
      expect(result.usageInfo?.tokens?.output).toBe(5678);
    });
  });

  describe('ClaudeCostParser', () => {
    const parser = new ClaudeCostParser();

    it('should parse Claude /cost output correctly', () => {
      const output = `API Token Usage:
  Input: 50,000 tokens
  Output: 25,000 tokens
  Total: 75,000 tokens`;

      const result = parser.parse(output);

      expect(result.success).toBe(true);
      expect(result.usageInfo).not.toBeNull();
      expect(result.usageInfo?.platform).toBe('claude');
      expect(result.usageInfo?.tokens?.input).toBe(50000);
      expect(result.usageInfo?.tokens?.output).toBe(25000);
      expect(result.usageInfo?.tokens?.total).toBe(75000);
      expect(result.usageInfo?.source).toBe('cli');
      expect(result.usageInfo?.metadata?.command).toBe('/cost');
    });

    it('should handle single token format', () => {
      const output = `Input: 60,000 token
Output: 40,000 token`;

      const result = parser.parse(output);

      expect(result.success).toBe(true);
      expect(result.usageInfo?.tokens?.input).toBe(60000);
      expect(result.usageInfo?.tokens?.output).toBe(40000);
    });
  });

  describe('ClaudeStatsParser', () => {
    const parser = new ClaudeStatsParser();

    it('should parse Claude /stats output correctly', () => {
      const output = `Usage Statistics:
  Requests today: 42
  Requests this week: 156
  Requests this month: 623`;

      const result = parser.parse(output);

      expect(result.success).toBe(true);
      expect(result.usageInfo).not.toBeNull();
      expect(result.usageInfo?.platform).toBe('claude');
      expect(result.usageInfo?.currentUsage).toBe(42);
      expect(result.usageInfo?.period).toBe('day');
      expect(result.usageInfo?.source).toBe('cli');
      expect(result.usageInfo?.metadata?.command).toBe('/stats');
      expect(result.usageInfo?.metadata?.todayCount).toBe(42);
      expect(result.usageInfo?.metadata?.weekCount).toBe(156);
      expect(result.usageInfo?.metadata?.monthCount).toBe(623);
    });

    it('should parse with only today count', () => {
      const output = `Requests today: 50`;

      const result = parser.parse(output);

      expect(result.success).toBe(true);
      expect(result.usageInfo?.currentUsage).toBe(50);
      expect(result.usageInfo?.period).toBe('day');
    });
  });

  describe('GeminiStatsParser', () => {
    const parser = new GeminiStatsParser();

    it('should parse Gemini /stats output correctly', () => {
      const output = `Usage Statistics:
  Model: gemini-2.5-pro
    Requests: 42
    Input tokens: 12,345
    Output tokens: 67,890
    Tool calls: 5
    File modifications: 3`;

      const result = parser.parse(output);

      expect(result.success).toBe(true);
      expect(result.usageInfo).not.toBeNull();
      expect(result.usageInfo?.platform).toBe('gemini');
      expect(result.usageInfo?.currentUsage).toBe(42);
      expect(result.usageInfo?.tokens?.input).toBe(12345);
      expect(result.usageInfo?.tokens?.output).toBe(67890);
      expect(result.usageInfo?.tokens?.total).toBe(80235);
      expect(result.usageInfo?.source).toBe('cli');
      expect(result.usageInfo?.metadata?.command).toBe('/stats');
      expect(result.usageInfo?.metadata?.model).toBe('gemini-2.5-pro');
      expect(result.usageInfo?.metadata?.toolCalls).toBe(5);
      expect(result.usageInfo?.metadata?.fileModifications).toBe(3);
    });

    it('should parse with minimal information', () => {
      const output = `Requests: 50`;

      const result = parser.parse(output);

      expect(result.success).toBe(true);
      expect(result.usageInfo?.currentUsage).toBe(50);
    });
  });
});
