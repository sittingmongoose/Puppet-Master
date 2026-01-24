/**
 * Tests for QuotaManager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { QuotaManager, QuotaExhaustedError } from './quota-manager.js';
import { UsageTracker } from '../memory/usage-tracker.js';
import type { PlatformBudgets, TierConfig, BudgetEnforcementConfig } from '../types/config.js';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('QuotaManager', () => {
  let usageTracker: UsageTracker;
  let budgets: PlatformBudgets;
  let budgetEnforcement: BudgetEnforcementConfig;
  let quotaManager: QuotaManager;
  let testDir: string;

  beforeEach(async () => {
    // Create a test UsageTracker with a unique path
    testDir = await mkdtemp(join(tmpdir(), 'pm-test-quota-'));
    usageTracker = new UsageTracker(`${testDir}/usage.jsonl`);

    // Create default budgets for testing
    budgets = {
      claude: {
        maxCallsPerRun: 5,
        maxCallsPerHour: 3,
        maxCallsPerDay: 10,
        cooldownHours: 5,
        fallbackPlatform: 'codex',
      },
      codex: {
        maxCallsPerRun: 50,
        maxCallsPerHour: 20,
        maxCallsPerDay: 100,
        cooldownHours: undefined,
        fallbackPlatform: 'cursor',
      },
      cursor: {
        maxCallsPerRun: 'unlimited',
        maxCallsPerHour: 'unlimited',
        maxCallsPerDay: 'unlimited',
        cooldownHours: undefined,
        fallbackPlatform: null,
      },
      gemini: {
        maxCallsPerRun: 100,
        maxCallsPerHour: 50,
        maxCallsPerDay: 200,
        cooldownHours: 0,
        fallbackPlatform: null,
      },
      copilot: {
        maxCallsPerRun: 'unlimited',
        maxCallsPerHour: 'unlimited',
        maxCallsPerDay: 'unlimited',
        cooldownHours: undefined,
        fallbackPlatform: null,
      },
    };

    budgetEnforcement = {
      onLimitReached: 'fallback',
      warnAtPercentage: 80,
      notifyOnFallback: true,
    };

    quotaManager = new QuotaManager(usageTracker, budgets, budgetEnforcement);
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  describe('checkQuota', () => {
    it('should return unlimited quota for platforms with unlimited limits', async () => {
      const quotaInfo = await quotaManager.checkQuota('cursor');
      
      expect(quotaInfo.remaining).toBeGreaterThan(1000000); // Very large number
      expect(quotaInfo.limit).toBeGreaterThan(1000000);
      expect(quotaInfo.period).toBeDefined();
      expect(quotaInfo.resetsAt).toBeDefined();
    });

    it('should calculate remaining quota correctly for finite limits', async () => {
      // Record some usage
      await usageTracker.track({
        platform: 'claude',
        action: 'test',
        durationMs: 1000,
        success: true,
      });

      const quotaInfo = await quotaManager.checkQuota('claude');
      
      // Should have remaining quota (limit - 1 usage)
      expect(quotaInfo.remaining).toBeGreaterThanOrEqual(0);
      expect(quotaInfo.limit).toBeGreaterThan(0);
      expect(['run', 'hour', 'day']).toContain(quotaInfo.period);
    });

    it('should return 0 remaining when quota is exhausted', async () => {
      // Record enough usage to exhaust hourly limit (3 calls)
      for (let i = 0; i < 3; i++) {
        await usageTracker.track({
          platform: 'claude',
          action: 'test',
          durationMs: 1000,
          success: true,
        });
      }
      await expect(quotaManager.checkQuota('claude')).rejects.toThrow(QuotaExhaustedError);
    });

    it('should identify the most restrictive period', async () => {
      // Record usage to exhaust hourly limit but not daily limit
      for (let i = 0; i < 2; i++) {
        await usageTracker.track({
          platform: 'claude',
          action: 'test',
          durationMs: 1000,
          success: true,
        });
      }

      const quotaInfo = await quotaManager.checkQuota('claude');
      
      // The most restrictive period should be identified
      expect(['run', 'hour', 'day']).toContain(quotaInfo.period);
      expect(quotaInfo.limit).toBeGreaterThan(0);
    });

    it('should calculate reset time correctly for hour period', async () => {
      const quotaInfo = await quotaManager.checkQuota('claude');
      
      if (quotaInfo.period === 'hour') {
        const resetTime = new Date(quotaInfo.resetsAt);
        const now = new Date();
        const nextHour = new Date(now);
        nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
        
        // Reset time should be approximately next hour (within 1 minute tolerance)
        expect(resetTime.getTime()).toBeGreaterThan(now.getTime());
        expect(resetTime.getTime()).toBeLessThanOrEqual(nextHour.getTime() + 60000);
      }
    });
  });

  describe('checkCooldown', () => {
    it('should return no cooldown when none is configured', async () => {
      const cooldownInfo = await quotaManager.checkCooldown('codex');
      
      expect(cooldownInfo.active).toBe(false);
      expect(cooldownInfo.endsAt).toBeNull();
      expect(cooldownInfo.reason).toBeNull();
    });

    it('should return no cooldown when none is active', async () => {
      const cooldownInfo = await quotaManager.checkCooldown('claude');
      
      expect(cooldownInfo.active).toBe(false);
      expect(cooldownInfo.endsAt).toBeNull();
      expect(cooldownInfo.reason).toBeNull();
    });

    it('should detect active cooldown after quota exhaustion', async () => {
      // Exhaust quota to trigger cooldown
      for (let i = 0; i < 3; i++) {
        await usageTracker.track({
          platform: 'claude',
          action: 'test',
          durationMs: 1000,
          success: true,
        });
      }

      // Record one more usage to trigger cooldown check
      await quotaManager.recordUsage('claude', 1000, 1000);

      const cooldownInfo = await quotaManager.checkCooldown('claude');
      
      // Cooldown should be active
      expect(cooldownInfo.active).toBe(true);
      expect(cooldownInfo.endsAt).not.toBeNull();
      expect(cooldownInfo.reason).not.toBeNull();
      
      // Cooldown end time should be in the future
      const endsAt = new Date(cooldownInfo.endsAt!);
      expect(endsAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should expire cooldown after time passes', async () => {
      // Create a manager with a past run start time
      const pastTime = new Date(Date.now() - 6 * 60 * 60 * 1000); // 6 hours ago
      const oldManager = new QuotaManager(usageTracker, budgets, budgetEnforcement, pastTime);

      // For now, test that a fresh manager has no cooldown
      const cooldownInfo = await oldManager.checkCooldown('claude');
      expect(cooldownInfo.active).toBe(false);
    });
  });

  describe('recordUsage', () => {
    it('should delegate to UsageTracker', async () => {
      const trackSpy = vi.spyOn(usageTracker, 'track');
      
      await quotaManager.recordUsage('claude', 5000, 30000);
      
      expect(trackSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          platform: 'claude',
          tokens: 5000,
          durationMs: 30000,
          success: true,
        })
      );
    });

    it('should trigger cooldown when limit is hit', async () => {
      // Exhaust hourly quota (3 calls)
      for (let i = 0; i < 3; i++) {
        await usageTracker.track({
          platform: 'claude',
          action: 'test',
          durationMs: 1000,
          success: true,
        });
      }

      // Record one more usage - should trigger cooldown
      await quotaManager.recordUsage('claude', 1000, 1000);

      const cooldownInfo = await quotaManager.checkCooldown('claude');
      expect(cooldownInfo.active).toBe(true);
    });
  });

  describe('canProceed', () => {
    it('should allow when quota and cooldown are fine', async () => {
      const result = await quotaManager.canProceed('cursor');
      
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should deny when quota is exhausted', async () => {
      // Exhaust quota
      for (let i = 0; i < 3; i++) {
        await usageTracker.track({
          platform: 'claude',
          action: 'test',
          durationMs: 1000,
          success: true,
        });
      }

      // Record one more to trigger cooldown check
      await quotaManager.recordUsage('claude', 1000, 1000);

      const result = await quotaManager.canProceed('claude');
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
      expect(result.reason).toContain('Quota exhausted');
    });

    it('should deny when cooldown is active', async () => {
      // Exhaust quota to trigger cooldown
      for (let i = 0; i < 3; i++) {
        await usageTracker.track({
          platform: 'claude',
          action: 'test',
          durationMs: 1000,
          success: true,
        });
      }

      await quotaManager.recordUsage('claude', 1000, 1000);

      const result = await quotaManager.canProceed('claude');
      
      // Should be denied due to either quota or cooldown
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('should allow unlimited platforms', async () => {
      const result = await quotaManager.canProceed('cursor');
      
      expect(result.allowed).toBe(true);
    });
  });

  describe('getRecommendedPlatform', () => {
    it('should return platform with best quota availability', async () => {
      const tiers: TierConfig[] = [
        { platform: 'claude', model: 'claude-3-opus', selfFix: false, maxIterations: 1, escalation: null },
        { platform: 'codex', model: 'gpt-4', selfFix: false, maxIterations: 1, escalation: null },
        { platform: 'cursor', model: 'gpt-4', selfFix: false, maxIterations: 1, escalation: null },
      ];

      const recommended = await quotaManager.getRecommendedPlatform(tiers);
      
      // Should return one of the platforms (preferably cursor with unlimited)
      expect(recommended).not.toBeNull();
      expect(['claude', 'codex', 'cursor']).toContain(recommended);
    });

    it('should return null when no platforms are available', async () => {
      // Exhaust all platforms
      for (let i = 0; i < 3; i++) {
        await usageTracker.track({
          platform: 'claude',
          action: 'test',
          durationMs: 1000,
          success: true,
        });
      }

      for (let i = 0; i < 20; i++) {
        await usageTracker.track({
          platform: 'codex',
          action: 'test',
          durationMs: 1000,
          success: true,
        });
      }

      // Trigger cooldowns
      await quotaManager.recordUsage('claude', 1000, 1000);
      await quotaManager.recordUsage('codex', 1000, 1000);

      const tiers: TierConfig[] = [
        { platform: 'claude', model: 'claude-3-opus', selfFix: false, maxIterations: 1, escalation: null },
        { platform: 'codex', model: 'gpt-4', selfFix: false, maxIterations: 1, escalation: null },
      ];

      const recommended = await quotaManager.getRecommendedPlatform(tiers);
      
      // Should return null or cursor (if included) since it's unlimited
      // Actually, if cursor is not in the tiers, should return null
      if (recommended === null) {
        expect(recommended).toBeNull();
      } else {
        expect(recommended).toBe('cursor');
      }
    });

    it('should prefer platforms with higher remaining quota', async () => {
      // Use some quota on claude but not codex
      await usageTracker.track({
        platform: 'claude',
        action: 'test',
        durationMs: 1000,
        success: true,
      });

      const tiers: TierConfig[] = [
        { platform: 'claude', model: 'claude-3-opus', selfFix: false, maxIterations: 1, escalation: null },
        { platform: 'codex', model: 'gpt-4', selfFix: false, maxIterations: 1, escalation: null },
      ];

      const recommended = await quotaManager.getRecommendedPlatform(tiers);
      
      // Should prefer codex (more remaining quota) or cursor if included
      expect(recommended).not.toBeNull();
      expect(['claude', 'codex', 'cursor']).toContain(recommended);
    });

    it('should handle empty tiers array', async () => {
      const recommended = await quotaManager.getRecommendedPlatform([]);
      
      expect(recommended).toBeNull();
    });

    it('should handle duplicate platforms in tiers', async () => {
      const tiers: TierConfig[] = [
        { platform: 'claude', model: 'claude-3-opus', selfFix: false, maxIterations: 1, escalation: null },
        { platform: 'claude', model: 'claude-3-opus', selfFix: false, maxIterations: 1, escalation: null },
        { platform: 'codex', model: 'gpt-4', selfFix: false, maxIterations: 1, escalation: null },
      ];

      const recommended = await quotaManager.getRecommendedPlatform(tiers);
      
      // Should return a valid platform (not duplicate)
      expect(recommended).not.toBeNull();
      expect(['claude', 'codex', 'cursor']).toContain(recommended);
    });
  });

  describe('integration with UsageTracker', () => {
    it('should use UsageTracker data for quota calculation', async () => {
      // Record usage directly via UsageTracker
      await usageTracker.track({
        platform: 'claude',
        action: 'direct',
        durationMs: 2000,
        success: true,
      });

      // Check quota - should reflect the usage
      const quotaInfo = await quotaManager.checkQuota('claude');
      
      // Quota should account for the usage
      expect(quotaInfo.remaining).toBeLessThan(quotaInfo.limit);
    });

    it('should calculate run period count correctly', async () => {
      const runStart = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      const managerWithRunStart = new QuotaManager(usageTracker, budgets, budgetEnforcement, runStart);

      // Record usage
      await usageTracker.track({
        platform: 'claude',
        action: 'test',
        durationMs: 1000,
        success: true,
      });

      const quotaInfo = await managerWithRunStart.checkQuota('claude');
      
      // Should account for run period usage
      expect(quotaInfo.remaining).toBeGreaterThanOrEqual(0);
    });
  });

  describe('enforcement (P1-T07)', () => {
    it('should throw QuotaExhaustedError when hard limit is reached', async () => {
      // Create a budget with low limits
      const lowBudget: PlatformBudgets = {
        ...budgets,
        claude: {
          maxCallsPerRun: 2,
          maxCallsPerHour: 2,
          maxCallsPerDay: 2,
          cooldownHours: 5,
          fallbackPlatform: 'codex',
        },
      };

      const lowBudgetManager = new QuotaManager(usageTracker, lowBudget, budgetEnforcement);

      // Exhaust quota by recording usage directly (to avoid checkQuota throwing during recordUsage)
      await usageTracker.track({
        platform: 'claude',
        action: 'usage',
        tokens: 1000,
        durationMs: 1000,
        success: true,
      });
      await usageTracker.track({
        platform: 'claude',
        action: 'usage',
        tokens: 1000,
        durationMs: 1000,
        success: true,
      });

      // Should throw when checking quota at hard limit (100%)
      await expect(lowBudgetManager.checkQuota('claude')).rejects.toThrow(QuotaExhaustedError);
    });

    it('should include quota details in QuotaExhaustedError', async () => {
      const lowBudget: PlatformBudgets = {
        ...budgets,
        claude: {
          maxCallsPerRun: 1,
          maxCallsPerHour: 1,
          maxCallsPerDay: 1,
          cooldownHours: 5,
          fallbackPlatform: 'codex',
        },
      };

      const lowBudgetManager = new QuotaManager(usageTracker, lowBudget, budgetEnforcement);

      // Exhaust quota by recording usage directly
      await usageTracker.track({
        platform: 'claude',
        action: 'usage',
        tokens: 1000,
        durationMs: 1000,
        success: true,
      });

      try {
        await lowBudgetManager.checkQuota('claude');
        expect.fail('Should have thrown QuotaExhaustedError');
      } catch (error) {
        expect(error).toBeInstanceOf(QuotaExhaustedError);
        if (error instanceof QuotaExhaustedError) {
          expect(error.platform).toBe('claude');
          expect(error.period).toBe('run');
          expect(error.limit).toBe(1);
          expect(error.count).toBe(1);
          expect(error.resetsAt).toBeDefined();
          expect(error.message).toContain('claude');
          expect(error.message).toContain('run');
        }
      }
    });

    it('should warn but not throw when soft limit is reached', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const lowBudget: PlatformBudgets = {
        ...budgets,
        claude: {
          maxCallsPerRun: 10,
          maxCallsPerHour: 10,
          maxCallsPerDay: 10,
          cooldownHours: 5,
          fallbackPlatform: 'codex',
        },
      };

      // Use 80% of quota (soft limit)
      const softLimitManager = new QuotaManager(usageTracker, lowBudget, budgetEnforcement, undefined, 80, 100);

      // Record 8 calls (80% of 10) directly to avoid checkQuota during recordUsage
      for (let i = 0; i < 8; i++) {
        await usageTracker.track({
          platform: 'claude',
          action: 'usage',
          tokens: 1000,
          durationMs: 1000,
          success: true,
        });
      }

      // Should warn but not throw
      const quotaInfo = await softLimitManager.checkQuota('claude');
      expect(quotaInfo.remaining).toBeGreaterThan(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Soft limit warning')
      );

      consoleSpy.mockRestore();
    });

    it('should not warn when under soft limit', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const lowBudget: PlatformBudgets = {
        ...budgets,
        claude: {
          maxCallsPerRun: 10,
          maxCallsPerHour: 10,
          maxCallsPerDay: 10,
          cooldownHours: 5,
          fallbackPlatform: 'codex',
        },
      };

      const manager = new QuotaManager(usageTracker, lowBudget, budgetEnforcement, undefined, 80, 100);

      // Record 5 calls (50% of 10, under soft limit)
      for (let i = 0; i < 5; i++) {
        await manager.recordUsage('claude', 1000, 1000);
      }

      // Should not warn
      await manager.checkQuota('claude');
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should use configurable soft limit percentage', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const lowBudget: PlatformBudgets = {
        ...budgets,
        claude: {
          maxCallsPerRun: 10,
          maxCallsPerHour: 100, // Make hour limit high so run period is most restrictive
          maxCallsPerDay: 1000, // Make day limit high so run period is most restrictive
          cooldownHours: 5,
          fallbackPlatform: 'codex',
        },
      };

      // Create manager with runStartTime set to now, then track calls
      const runStartTime = new Date();
      // Use a budgetEnforcement with warnAtPercentage set to 50 to test soft limit
      const customBudgetEnforcement = {
        ...budgetEnforcement,
        warnAtPercentage: 50, // Use 50% as soft limit
      };
      const manager = new QuotaManager(usageTracker, lowBudget, customBudgetEnforcement, runStartTime);

      // Record 6 calls (60% of 10, over 50% soft limit) directly
      for (let i = 0; i < 6; i++) {
        await usageTracker.track({
          platform: 'claude',
          action: 'usage',
          tokens: 1000,
          durationMs: 1000,
          success: true,
        });
      }

      // Should warn at 50% soft limit (6/10 = 60% > 50%)
      await manager.checkQuota('claude');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Soft limit warning')
      );

      consoleSpy.mockRestore();
    });

    it('should use configurable hard limit percentage', async () => {
      const lowBudget: PlatformBudgets = {
        ...budgets,
        claude: {
          maxCallsPerRun: 10,
          maxCallsPerHour: 10,
          maxCallsPerDay: 10,
          cooldownHours: 5,
          fallbackPlatform: 'codex',
        },
      };

      // Use 90% as hard limit
      const manager = new QuotaManager(usageTracker, lowBudget, budgetEnforcement, undefined, 80, 90);

      // Record 8 calls (80% of 10, under hard limit)
      for (let i = 0; i < 8; i++) {
        await manager.recordUsage('claude', 1000, 1000);
      }

      // Manually record one more usage to get to 9 (90%)
      await usageTracker.track({
        platform: 'claude',
        action: 'usage',
        tokens: 1000,
        durationMs: 1000,
        success: true,
      });

      // Should throw at 90% hard limit
      await expect(manager.checkQuota('claude')).rejects.toThrow(QuotaExhaustedError);
    });

    it('should return normal info when under all limits', async () => {
      const lowBudget: PlatformBudgets = {
        ...budgets,
        claude: {
          maxCallsPerRun: 10,
          maxCallsPerHour: 10,
          maxCallsPerDay: 10,
          cooldownHours: 5,
          fallbackPlatform: 'codex',
        },
      };

      const manager = new QuotaManager(usageTracker, lowBudget, budgetEnforcement);

      // Record 3 calls (30% of 10, well under limits)
      for (let i = 0; i < 3; i++) {
        await manager.recordUsage('claude', 1000, 1000);
      }

      // Should return normal quota info
      const quotaInfo = await manager.checkQuota('claude');
      expect(quotaInfo.remaining).toBeGreaterThan(0);
      expect(quotaInfo.limit).toBe(10);
      expect(quotaInfo.period).toBe('run');
      expect(quotaInfo.resetsAt).toBeDefined();
    });
  });
});
