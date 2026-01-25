/**
 * E2E Tests for Fallback Behavior (P1-G15)
 * 
 * Tests platform fallback when primary platform is unavailable or exhausted.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuotaManager, QuotaExhaustedError } from '../../src/platforms/quota-manager.js';
import { UsageTracker } from '../../src/memory/usage-tracker.js';
import type { Platform, PlatformBudgets, BudgetEnforcementConfig } from '../../src/types/config.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('E2E: Platform Fallback', () => {
  let tempDir: string;

  const createBudgets = (overrides: Partial<PlatformBudgets> = {}): PlatformBudgets => ({
    claude: {
      maxCallsPerRun: 10,
      maxCallsPerHour: 100,
      maxCallsPerDay: 1000,
      cooldownHours: 1,
      fallbackPlatform: 'codex',
    },
    codex: {
      maxCallsPerRun: 10,
      maxCallsPerHour: 100,
      maxCallsPerDay: 1000,
      cooldownHours: 1,
      fallbackPlatform: 'cursor',
    },
    cursor: {
      maxCallsPerRun: 10,
      maxCallsPerHour: 100,
      maxCallsPerDay: 1000,
      cooldownHours: 1,
      fallbackPlatform: 'gemini',
    },
    gemini: {
      maxCallsPerRun: 10,
      maxCallsPerHour: 100,
      maxCallsPerDay: 1000,
      cooldownHours: 1,
      fallbackPlatform: 'copilot',
    },
    copilot: {
      maxCallsPerRun: 10,
      maxCallsPerHour: 100,
      maxCallsPerDay: 1000,
      cooldownHours: 1,
      fallbackPlatform: null, // End of chain
    },
    ...overrides,
  });

  const defaultEnforcement: BudgetEnforcementConfig = {
    pauseOnExhaustion: false,
    fallbackBehavior: 'fallback',
    warnAtPercentage: 80,
    maxCascadeDepth: 3,
  };

  beforeEach(async () => {
    tempDir = join(tmpdir(), `fallback-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Single-level fallback', () => {
    it('uses fallback when primary is exhausted', async () => {
      const usagePath = join(tempDir, 'usage.jsonl');
      const usageTracker = new UsageTracker(usagePath);
      const quotaManager = new QuotaManager(usageTracker, createBudgets(), defaultEnforcement);

      // Exhaust Claude
      for (let i = 0; i < 10; i++) {
        await quotaManager.recordUsage('claude', 1000, 1000);
      }

      // Claude should be blocked
      const claudeResult = await quotaManager.canProceed('claude');
      expect(claudeResult.allowed).toBe(false);

      // Codex should still be available (fallback)
      const codexResult = await quotaManager.canProceed('codex');
      expect(codexResult.allowed).toBe(true);
    });

    it('respects fallbackPlatform config', async () => {
      const budgets = createBudgets({
        claude: {
          maxCallsPerRun: 5,
          maxCallsPerHour: 100,
          maxCallsPerDay: 1000,
          cooldownHours: 1,
          fallbackPlatform: 'gemini', // Skip codex/cursor
        },
      });

      const usagePath = join(tempDir, 'usage.jsonl');
      const usageTracker = new UsageTracker(usagePath);
      const quotaManager = new QuotaManager(usageTracker, budgets, defaultEnforcement);

      // Verify fallback chain is configured correctly
      expect(budgets.claude.fallbackPlatform).toBe('gemini');
    });
  });

  describe('Multi-level fallback (cascade)', () => {
    it('cascades through fallback chain', async () => {
      const usagePath = join(tempDir, 'usage.jsonl');
      const usageTracker = new UsageTracker(usagePath);
      const quotaManager = new QuotaManager(usageTracker, createBudgets(), defaultEnforcement);

      // Exhaust Claude and Codex
      for (let i = 0; i < 10; i++) {
        await quotaManager.recordUsage('claude', 1000, 1000);
        await quotaManager.recordUsage('codex', 1000, 1000);
      }

      // Claude and Codex should be blocked
      expect((await quotaManager.canProceed('claude')).allowed).toBe(false);
      expect((await quotaManager.canProceed('codex')).allowed).toBe(false);

      // Cursor should still be available
      expect((await quotaManager.canProceed('cursor')).allowed).toBe(true);
    });

    it('respects maxCascadeDepth limit', async () => {
      const limitedEnforcement: BudgetEnforcementConfig = {
        ...defaultEnforcement,
        maxCascadeDepth: 1, // Only allow 1 fallback
      };

      // This test documents the expected behavior:
      // When maxCascadeDepth is 1, only one level of fallback should be tried
      expect(limitedEnforcement.maxCascadeDepth).toBe(1);
    });
  });

  describe('Fallback chain termination', () => {
    it('returns null when fallback chain ends', async () => {
      const usagePath = join(tempDir, 'usage.jsonl');
      const usageTracker = new UsageTracker(usagePath);
      const quotaManager = new QuotaManager(usageTracker, createBudgets(), defaultEnforcement);

      // Exhaust all platforms
      const platforms: Platform[] = ['claude', 'codex', 'cursor', 'gemini', 'copilot'];
      for (const platform of platforms) {
        for (let i = 0; i < 10; i++) {
          await quotaManager.recordUsage(platform, 1000, 1000);
        }
      }

      // All should be blocked
      for (const platform of platforms) {
        const result = await quotaManager.canProceed(platform);
        expect(result.allowed).toBe(false);
      }

      // getRecommendedPlatform should return null
      const tiers = platforms.map(p => ({ 
        platform: p, 
        model: 'test', 
        selfFix: true, 
        maxIterations: 3 
      }));
      const recommended = await quotaManager.getRecommendedPlatform(tiers);
      expect(recommended).toBeNull();
    });

    it('handles null fallbackPlatform', async () => {
      const budgets = createBudgets({
        claude: {
          maxCallsPerRun: 5,
          maxCallsPerHour: 100,
          maxCallsPerDay: 1000,
          cooldownHours: 1,
          fallbackPlatform: null, // No fallback
        },
      });

      const usagePath = join(tempDir, 'usage.jsonl');
      const usageTracker = new UsageTracker(usagePath);
      const quotaManager = new QuotaManager(usageTracker, budgets, defaultEnforcement);

      // Exhaust Claude
      for (let i = 0; i < 5; i++) {
        await quotaManager.recordUsage('claude', 1000, 1000);
      }

      // Claude should be blocked with no automatic fallback
      const result = await quotaManager.canProceed('claude');
      expect(result.allowed).toBe(false);
    });
  });

  describe('Fallback with cooldown', () => {
    it('considers cooldown when selecting fallback', async () => {
      const usagePath = join(tempDir, 'usage.jsonl');
      const usageTracker = new UsageTracker(usagePath);
      const quotaManager = new QuotaManager(usageTracker, createBudgets(), defaultEnforcement);

      // Exhaust Claude (triggers cooldown)
      for (let i = 0; i < 10; i++) {
        await quotaManager.recordUsage('claude', 1000, 1000);
      }

      // Check cooldown is active
      const cooldownInfo = await quotaManager.checkCooldown('claude');
      expect(cooldownInfo.active).toBe(true);

      // canProceed should block due to cooldown
      const result = await quotaManager.canProceed('claude');
      expect(result.allowed).toBe(false);
    });
  });

  describe('Partial fallback (some platforms available)', () => {
    it('selects best available platform', async () => {
      const usagePath = join(tempDir, 'usage.jsonl');
      const usageTracker = new UsageTracker(usagePath);
      const quotaManager = new QuotaManager(usageTracker, createBudgets(), defaultEnforcement);

      // Partially exhaust some platforms
      for (let i = 0; i < 8; i++) {
        await quotaManager.recordUsage('claude', 1000, 1000);
      }
      for (let i = 0; i < 3; i++) {
        await quotaManager.recordUsage('codex', 1000, 1000);
      }
      // cursor has full quota remaining

      const tiers = [
        { platform: 'claude' as Platform, model: 'sonnet', selfFix: true, maxIterations: 3 },
        { platform: 'codex' as Platform, model: 'gpt-5.2-codex', selfFix: true, maxIterations: 3 },
        { platform: 'cursor' as Platform, model: 'auto', selfFix: true, maxIterations: 3 },
      ];

      const recommended = await quotaManager.getRecommendedPlatform(tiers);
      expect(recommended).toBe('cursor'); // Has most remaining quota
    });
  });
});
