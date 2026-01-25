/**
 * E2E Tests for Quota Management (P1-G15)
 * 
 * Tests quota enforcement, token-based quotas, and cooldown behavior.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { QuotaManager, QuotaExhaustedError } from '../../src/platforms/quota-manager.js';
import { UsageTracker } from '../../src/memory/usage-tracker.js';
import type { Platform, PlatformBudgets, BudgetEnforcementConfig } from '../../src/types/config.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('E2E: Quota Management', () => {
  let tempDir: string;
  let usageTracker: UsageTracker;
  let quotaManager: QuotaManager;

  const defaultBudgets: PlatformBudgets = {
    claude: {
      maxCallsPerRun: 10,
      maxCallsPerHour: 100,
      maxCallsPerDay: 1000,
      maxTokensPerRun: 50000,
      maxTokensPerHour: 500000,
      maxTokensPerDay: 5000000,
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
      fallbackPlatform: null,
    },
    gemini: {
      maxCallsPerRun: 10,
      maxCallsPerHour: 100,
      maxCallsPerDay: 1000,
      cooldownHours: 1,
      fallbackPlatform: null,
    },
    copilot: {
      maxCallsPerRun: 10,
      maxCallsPerHour: 100,
      maxCallsPerDay: 1000,
      cooldownHours: 1,
      fallbackPlatform: null,
    },
  };

  const defaultEnforcement: BudgetEnforcementConfig = {
    pauseOnExhaustion: false,
    fallbackBehavior: 'fallback',
    warnAtPercentage: 80,
    maxCascadeDepth: 2,
  };

  beforeEach(async () => {
    tempDir = join(tmpdir(), `quota-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    const usagePath = join(tempDir, 'usage.jsonl');
    usageTracker = new UsageTracker(usagePath);
    quotaManager = new QuotaManager(usageTracker, defaultBudgets, defaultEnforcement);
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Call-based quota enforcement', () => {
    it('allows execution when under quota', async () => {
      const result = await quotaManager.canProceed('claude');
      expect(result.allowed).toBe(true);
    });

    it('tracks call usage correctly', async () => {
      // Record some usage
      for (let i = 0; i < 5; i++) {
        await quotaManager.recordUsage('claude', 1000, 1000);
      }

      const quotaInfo = await quotaManager.checkQuota('claude');
      expect(quotaInfo.remaining).toBe(5); // 10 - 5 = 5 remaining
    });

    it('blocks execution when call quota exhausted', async () => {
      // Use up all calls
      for (let i = 0; i < 10; i++) {
        await quotaManager.recordUsage('claude', 1000, 1000);
      }

      // Should throw QuotaExhaustedError
      await expect(quotaManager.checkQuota('claude')).rejects.toThrow(QuotaExhaustedError);
    });

    it('canProceed returns false when quota exhausted', async () => {
      // Use up all calls
      for (let i = 0; i < 10; i++) {
        await quotaManager.recordUsage('claude', 1000, 1000);
      }

      const result = await quotaManager.canProceed('claude');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Quota exhausted');
    });
  });

  describe('Token-based quota enforcement', () => {
    it('tracks token usage correctly', async () => {
      // Record usage with high token counts
      await quotaManager.recordUsage('claude', 10000, 1000);
      await quotaManager.recordUsage('claude', 10000, 1000);

      // Should still be within token limit (50000 per run)
      const quotaInfo = await quotaManager.checkQuota('claude');
      expect(quotaInfo.remaining).toBeGreaterThan(0);
    });

    it('blocks when token quota exhausted before call quota', async () => {
      // Set up a manager with low token limit
      const lowTokenBudgets: PlatformBudgets = {
        ...defaultBudgets,
        claude: {
          ...defaultBudgets.claude,
          maxCallsPerRun: 100, // High call limit
          maxTokensPerRun: 10000, // Low token limit
        },
      };
      const lowTokenManager = new QuotaManager(usageTracker, lowTokenBudgets, defaultEnforcement);

      // Record 5 calls with 5000 tokens each = 25000 tokens
      for (let i = 0; i < 5; i++) {
        await lowTokenManager.recordUsage('claude', 5000, 1000);
      }

      // Should be blocked by tokens even though calls are low
      await expect(lowTokenManager.checkQuota('claude')).rejects.toThrow(QuotaExhaustedError);
    });
  });

  describe('Soft limit warnings', () => {
    it('logs warning at 80% usage', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Use 8 of 10 calls (80%)
      for (let i = 0; i < 8; i++) {
        await quotaManager.recordUsage('claude', 1000, 1000);
      }

      // Check quota should trigger warning
      await quotaManager.checkQuota('claude');

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Soft limit warning'));
      warnSpy.mockRestore();
    });
  });

  describe('Cooldown behavior', () => {
    it('triggers cooldown when quota exhausted', async () => {
      // Use up all calls
      for (let i = 0; i < 10; i++) {
        await quotaManager.recordUsage('claude', 1000, 1000);
      }

      const cooldownInfo = await quotaManager.checkCooldown('claude');
      expect(cooldownInfo.active).toBe(true);
    });

    it('allows execution after cooldown expires', async () => {
      // Create manager with very short cooldown
      const shortCooldownBudgets: PlatformBudgets = {
        ...defaultBudgets,
        claude: {
          ...defaultBudgets.claude,
          cooldownHours: 0.0001, // Very short cooldown
        },
      };
      const shortCooldownManager = new QuotaManager(usageTracker, shortCooldownBudgets, defaultEnforcement);

      // Use up all calls
      for (let i = 0; i < 10; i++) {
        await shortCooldownManager.recordUsage('claude', 1000, 1000);
      }

      // Wait for cooldown to expire (should be nearly instant)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Cooldown should be expired
      const cooldownInfo = await shortCooldownManager.checkCooldown('claude');
      expect(cooldownInfo.active).toBe(false);
    });
  });

  describe('Platform selection', () => {
    it('recommends platform with best quota availability', async () => {
      // Use some Claude quota
      for (let i = 0; i < 8; i++) {
        await quotaManager.recordUsage('claude', 1000, 1000);
      }

      // Codex should have more remaining quota
      const tiers = [
        { platform: 'claude' as Platform, model: 'sonnet', selfFix: true, maxIterations: 3 },
        { platform: 'codex' as Platform, model: 'gpt-5.2-codex', selfFix: true, maxIterations: 3 },
      ];

      const recommended = await quotaManager.getRecommendedPlatform(tiers);
      expect(recommended).toBe('codex');
    });

    it('returns null when all platforms exhausted', async () => {
      // Exhaust both platforms
      for (let i = 0; i < 10; i++) {
        await quotaManager.recordUsage('claude', 1000, 1000);
        await quotaManager.recordUsage('codex', 1000, 1000);
      }

      const tiers = [
        { platform: 'claude' as Platform, model: 'sonnet', selfFix: true, maxIterations: 3 },
        { platform: 'codex' as Platform, model: 'gpt-5.2-codex', selfFix: true, maxIterations: 3 },
      ];

      const recommended = await quotaManager.getRecommendedPlatform(tiers);
      expect(recommended).toBeNull();
    });
  });
});
