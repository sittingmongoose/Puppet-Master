/**
 * QuotaManager for RWM Puppet Master
 * 
 * Manages platform quotas and cooldowns per REQUIREMENTS.md Section 23 (Budget Management).
 * Integrates with UsageTracker to calculate remaining quotas and detect active cooldowns.
 */

import type { Platform, PlatformBudgets, TierConfig, BudgetEnforcementConfig } from '../types/config.js';
import type { QuotaInfo, CooldownInfo } from '../types/capabilities.js';
import { UsageTracker } from '../memory/usage-tracker.js';

/**
 * Error thrown when quota is exhausted (hard limit reached).
 */
export class QuotaExhaustedError extends Error {
  readonly name = 'QuotaExhaustedError';

  constructor(
    public readonly platform: Platform,
    public readonly period: 'run' | 'hour' | 'day',
    public readonly limit: number,
    public readonly count: number,
    public readonly resetsAt: string
  ) {
    super(
      `Quota exhausted for platform ${platform} in ${period} period: ${count}/${limit} calls used. Resets at ${resetsAt}`
    );
  }
}

/**
 * QuotaManager tracks platform quotas and cooldowns
 */
export class QuotaManager {
  private usageTracker: UsageTracker;
  private budgets: PlatformBudgets;
  private budgetEnforcement: BudgetEnforcementConfig;
  private runStartTime: Date;
  private cooldownStarts: Map<Platform, Date> = new Map();
  private softLimitPercent: number;
  private hardLimitPercent: number;

  constructor(
    usageTracker: UsageTracker,
    budgets: PlatformBudgets,
    budgetEnforcement: BudgetEnforcementConfig,
    runStartTime?: Date,
    softLimitPercent: number = 80,
    hardLimitPercent: number = 100
  ) {
    this.usageTracker = usageTracker;
    this.budgets = budgets;
    this.budgetEnforcement = budgetEnforcement;
    this.runStartTime = runStartTime || new Date();
    this.softLimitPercent = softLimitPercent;
    this.hardLimitPercent = hardLimitPercent;
  }

  /**
   * Checks quota for a platform and returns quota information.
   * Calculates remaining quota across run, hour, and day periods.
   * P1-G04: Now checks both call-based and token-based quotas.
   * 
   * Throws QuotaExhaustedError when hard limit is reached.
   * Logs warning when soft limit is reached but allows execution.
   * 
   * @param platform - Platform to check quota for
   * @returns QuotaInfo with remaining quota and reset time
   * @throws QuotaExhaustedError when hard limit (100%) is reached
   */
  async checkQuota(platform: Platform): Promise<QuotaInfo> {
    const budget = this.budgets[platform];
    
    // Get usage counts for each period (calls)
    const runCount = await this.getRunPeriodCount(platform);
    const hourCount = await this.usageTracker.getCallCountInLastHour(platform);
    const dayCount = await this.usageTracker.getCallCountToday(platform);

    // P1-G04: Get token counts for each period
    const runTokens = await this.getRunPeriodTokens(platform);
    const hourTokens = await this.getTokenCountInLastHour(platform);
    const dayTokens = await this.getTokenCountToday(platform);

    // Calculate limits (calls)
    const runLimit = this.getLimitValue(budget.maxCallsPerRun);
    const hourLimit = this.getLimitValue(budget.maxCallsPerHour);
    const dayLimit = this.getLimitValue(budget.maxCallsPerDay);

    // P1-G04: Calculate token limits
    const runTokenLimit = this.getLimitValue(budget.maxTokensPerRun);
    const hourTokenLimit = this.getLimitValue(budget.maxTokensPerHour);
    const dayTokenLimit = this.getLimitValue(budget.maxTokensPerDay);

    // Calculate remaining for calls
    const runRemaining = runLimit - runCount;
    const hourRemaining = hourLimit - hourCount;
    const dayRemaining = dayLimit - dayCount;

    // P1-G04: Calculate remaining for tokens
    const runTokensRemaining = runTokenLimit - runTokens;
    const hourTokensRemaining = hourTokenLimit - hourTokens;
    const dayTokensRemaining = dayTokenLimit - dayTokens;

    // Find the most restrictive period (combining both calls and tokens)
    type QuotaPeriod = { 
      period: 'run' | 'hour' | 'day'; 
      remaining: number; 
      limit: number; 
      count: number;
      type: 'calls' | 'tokens';
    };
    
    const periods: QuotaPeriod[] = [
      { period: 'run', remaining: runRemaining, limit: runLimit, count: runCount, type: 'calls' },
      { period: 'hour', remaining: hourRemaining, limit: hourLimit, count: hourCount, type: 'calls' },
      { period: 'day', remaining: dayRemaining, limit: dayLimit, count: dayCount, type: 'calls' },
      // P1-G04: Include token periods (only if configured)
      ...(budget.maxTokensPerRun !== undefined 
        ? [{ period: 'run' as const, remaining: runTokensRemaining, limit: runTokenLimit, count: runTokens, type: 'tokens' as const }] 
        : []),
      ...(budget.maxTokensPerHour !== undefined 
        ? [{ period: 'hour' as const, remaining: hourTokensRemaining, limit: hourTokenLimit, count: hourTokens, type: 'tokens' as const }] 
        : []),
      ...(budget.maxTokensPerDay !== undefined 
        ? [{ period: 'day' as const, remaining: dayTokensRemaining, limit: dayTokenLimit, count: dayTokens, type: 'tokens' as const }] 
        : []),
    ];

    // Sort by percentage used (descending) to find most restrictive
    // Using percentage because limits have different scales (calls vs tokens)
    periods.sort((a, b) => {
      const aPercent = a.limit > 0 ? a.count / a.limit : 0;
      const bPercent = b.limit > 0 ? b.count / b.limit : 0;
      return bPercent - aPercent; // Higher percentage = more restrictive
    });
    const mostRestrictive = periods[0];

    // Calculate reset time based on period
    const resetsAt = this.calculateResetTime(mostRestrictive.period);

    // Calculate percentage used
    const percentageUsed = mostRestrictive.limit > 0 
      ? (mostRestrictive.count / mostRestrictive.limit) * 100 
      : 0;

    // Check hard limit (100% or configured hardLimitPercent)
    if (percentageUsed >= this.hardLimitPercent) {
      const unitLabel = mostRestrictive.type === 'tokens' ? 'tokens' : 'calls';
      throw new QuotaExhaustedError(
        platform,
        mostRestrictive.period,
        mostRestrictive.limit,
        mostRestrictive.count,
        `${resetsAt} (${unitLabel})`
      );
    }

    // Check soft limit (warnAtPercentage or configured softLimitPercent)
    const softLimit = this.budgetEnforcement.warnAtPercentage || this.softLimitPercent;
    if (percentageUsed >= softLimit) {
      const unitLabel = mostRestrictive.type === 'tokens' ? 'tokens' : 'calls';
      console.warn(
        `[QuotaManager] Soft limit warning for ${platform}: ${mostRestrictive.count}/${mostRestrictive.limit} ${unitLabel} used (${percentageUsed.toFixed(1)}%) in ${mostRestrictive.period} period. Resets at ${resetsAt}`
      );
    }

    return {
      remaining: Math.max(0, mostRestrictive.remaining),
      limit: mostRestrictive.limit,
      resetsAt,
      period: mostRestrictive.period,
    };
  }

  /**
   * Checks if a platform is in cooldown
   */
  async checkCooldown(platform: Platform): Promise<CooldownInfo> {
    const budget = this.budgets[platform];
    const cooldownHours = budget.cooldownHours;

    // If no cooldown configured, no cooldown is active
    if (!cooldownHours) {
      return {
        active: false,
        endsAt: null,
        reason: null,
      };
    }

    const cooldownStart = this.cooldownStarts.get(platform);
    
    // If no cooldown start recorded, no cooldown is active
    if (!cooldownStart) {
      return {
        active: false,
        endsAt: null,
        reason: null,
      };
    }

    const now = new Date();
    const cooldownEnd = new Date(cooldownStart.getTime() + cooldownHours * 60 * 60 * 1000);

    // Check if cooldown has expired
    if (now >= cooldownEnd) {
      // Cooldown expired, clear it
      this.cooldownStarts.delete(platform);
      return {
        active: false,
        endsAt: null,
        reason: null,
      };
    }

    // Cooldown is still active
    return {
      active: true,
      endsAt: cooldownEnd.toISOString(),
      reason: `Cooldown triggered after hitting quota limit`,
    };
  }

  /**
   * Records usage for a platform and checks if limits were hit
   */
  async recordUsage(platform: Platform, tokens: number, duration: number): Promise<void> {
    // Record usage via UsageTracker
    await this.usageTracker.track({
      platform,
      action: 'usage',
      tokens,
      durationMs: duration,
      success: true,
    });

    // Check if any limit was hit and trigger cooldown if needed
    await this.checkAndTriggerCooldown(platform);
  }

  /**
   * Composite check to determine if execution can proceed
   */
  async canProceed(platform: Platform): Promise<{ allowed: boolean; reason?: string }> {
    // Check quota.
    // `checkQuota()` enforces hard limits by throwing QuotaExhaustedError, but callers of
    // `canProceed()` should receive a structured allow/deny result instead of an exception.
    try {
      await this.checkQuota(platform);
    } catch (error) {
      if (error instanceof QuotaExhaustedError) {
        return { allowed: false, reason: error.message };
      }
      throw error;
    }

    // Check cooldown
    const cooldownInfo = await this.checkCooldown(platform);
    if (cooldownInfo.active) {
      return {
        allowed: false,
        reason: `Cooldown active until ${cooldownInfo.endsAt}`,
      };
    }

    return { allowed: true };
  }

  /**
   * Gets the recommended platform from a list of tier configs
   * Returns the platform with the best quota availability
   */
  async getRecommendedPlatform(tiers: TierConfig[]): Promise<Platform | null> {
    // Extract unique platforms from tiers
    const platforms = Array.from(new Set(tiers.map(tier => tier.platform)));

    // Check each platform and collect availability info
    const platformScores: Array<{ platform: Platform; remaining: number }> = [];

    for (const platform of platforms) {
      const proceed = await this.canProceed(platform);
      if (!proceed.allowed) {
        continue; // Skip platforms that can't proceed
      }

      const quotaInfo = await this.checkQuota(platform);
      platformScores.push({
        platform,
        remaining: quotaInfo.remaining,
      });
    }

    // If no platforms available, return null
    if (platformScores.length === 0) {
      return null;
    }

    // Sort by remaining quota (descending) and return the best
    platformScores.sort((a, b) => b.remaining - a.remaining);
    return platformScores[0].platform;
  }

  /**
   * Gets the count of calls for the run period (since run start)
   */
  private async getRunPeriodCount(platform: Platform): Promise<number> {
    const events = await this.usageTracker.getInPeriod(this.runStartTime);
    return events.filter(event => event.platform === platform).length;
  }

  /**
   * P1-G04: Gets the token count for the run period
   */
  private async getRunPeriodTokens(platform: Platform): Promise<number> {
    const events = await this.usageTracker.getInPeriod(this.runStartTime);
    return events
      .filter(event => event.platform === platform)
      .reduce((sum, event) => sum + (event.tokens || 0), 0);
  }

  /**
   * P1-G04: Gets the token count for the last hour
   */
  private async getTokenCountInLastHour(platform: Platform): Promise<number> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const events = await this.usageTracker.getInPeriod(oneHourAgo);
    return events
      .filter(event => event.platform === platform)
      .reduce((sum, event) => sum + (event.tokens || 0), 0);
  }

  /**
   * P1-G04: Gets the token count for today (UTC)
   */
  private async getTokenCountToday(platform: Platform): Promise<number> {
    const now = new Date();
    const startOfDay = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));
    const events = await this.usageTracker.getInPeriod(startOfDay);
    return events
      .filter(event => event.platform === platform)
      .reduce((sum, event) => sum + (event.tokens || 0), 0);
  }

  /**
   * Converts 'unlimited' or number to a numeric limit value
   */
  private getLimitValue(limit: number | 'unlimited' | undefined): number {
    if (limit === 'unlimited' || limit === undefined) {
      return Number.MAX_SAFE_INTEGER;
    }
    return limit;
  }

  /**
   * Calculates the reset time for a quota period
   */
  private calculateResetTime(period: 'run' | 'hour' | 'day'): string {
    const now = new Date();

    switch (period) {
      case 'run': {
        // Run period doesn't reset until run ends (not applicable for reset time)
        // Return a far future date or run end time
        // For now, return next hour as placeholder
        return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
      }
      
      case 'hour': {
        // Reset at next hour boundary
        const nextHour = new Date(now);
        nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
        return nextHour.toISOString();
      }
      
      case 'day': {
        // Reset at next day boundary (UTC)
        const nextDay = new Date(now);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);
        nextDay.setUTCHours(0, 0, 0, 0);
        return nextDay.toISOString();
      }
    }
  }

  /**
   * Checks if any limit was hit and triggers cooldown if needed
   */
  private async checkAndTriggerCooldown(platform: Platform): Promise<void> {
    const budget = this.budgets[platform];
    const cooldownHours = budget.cooldownHours;

    // If no cooldown configured, nothing to do
    if (!cooldownHours) {
      return;
    }

    // Check if any limit was hit.
    // `checkQuota()` may throw when hard limits are reached; cooldown should still be triggered,
    // but recordUsage() must not fail just because we hit a limit.
    try {
      const quotaInfo = await this.checkQuota(platform);
      if (quotaInfo.remaining <= 0) {
        this.cooldownStarts.set(platform, new Date());
      }
    } catch (error) {
      if (error instanceof QuotaExhaustedError) {
        this.cooldownStarts.set(platform, new Date());
        return;
      }
      throw error;
    }
  }
}
