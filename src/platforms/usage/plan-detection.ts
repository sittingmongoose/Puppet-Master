/**
 * Plan Detection Service
 * 
 * Unified service for detecting platform subscription plans/tiers.
 * Aggregates detection methods from all platforms:
 * - Claude: API-based (customer_type/subscription_type)
 * - Codex: Quota inference
 * - Gemini: Quota limits
 * - Cursor: Manual config
 * - Copilot: Quota limits
 */

import type { Platform } from '../../types/config.js';
import type { PlanInfo } from './types.js';
import { UsageProvider } from './usage-provider.js';

/**
 * Plan detection service
 */
export class PlanDetectionService {
  private usageProvider: UsageProvider;

  constructor(usageProvider: UsageProvider) {
    this.usageProvider = usageProvider;
  }

  /**
   * Detects plan information for a platform
   * 
   * @param platform - Platform to detect plan for
   * @param options - Platform-specific options
   * @returns Plan info or null if detection fails
   */
  async detectPlan(
    platform: Platform,
    options?: {
      organizationId?: string; // Claude
      org?: string; // Copilot
      location?: string; // Gemini
      manualConfig?: {
        tier?: string;
        customerType?: string;
        subscriptionType?: string;
      }; // Cursor/Codex manual config
    }
  ): Promise<PlanInfo | null> {
    switch (platform) {
      case 'claude':
        return await this.detectClaudePlan(options?.organizationId);
      case 'codex':
        return await this.detectCodexPlan(options?.manualConfig);
      case 'gemini':
        return await this.detectGeminiPlan(options?.location);
      case 'copilot':
        return await this.detectCopilotPlan(options?.org);
      case 'cursor':
        return await this.detectCursorPlan(options?.manualConfig);
    }
  }

  /**
   * Detects Claude plan via API
   */
  private async detectClaudePlan(organizationId?: string): Promise<PlanInfo | null> {
    // Use UsageProvider's getUsage to get plan info via API
    // This ensures credentials are properly configured
    const usageInfo = await this.usageProvider.getUsage('claude', { organizationId });
    if (!usageInfo || !usageInfo.metadata) {
      return null;
    }
    
    return {
      platform: 'claude',
      customerType: usageInfo.metadata.customerType as string,
      subscriptionType: usageInfo.metadata.subscriptionType as string,
      detectedFrom: 'api',
    };
  }

  /**
   * Detects Codex plan via quota inference
   * 
   * Codex doesn't have a usage API, so we infer plan from:
   * - Error messages (quota limits)
   * - Manual config
   * - Default assumptions
   */
  private async detectCodexPlan(manualConfig?: { tier?: string; customerType?: string; subscriptionType?: string }): Promise<PlanInfo | null> {
    // If manual config provided, use it
    if (manualConfig?.tier) {
      return {
        platform: 'codex',
        tier: manualConfig.tier,
        customerType: manualConfig.customerType,
        subscriptionType: manualConfig.subscriptionType,
        detectedFrom: 'manual-config',
      };
    }

    // Try to infer from usage/quota if available
    // Codex has different limits based on subscription:
    // - Free: 5 requests per 5 hours
    // - Plus: Higher limits
    // - Team/Enterprise: Even higher limits
    
    // For now, return null (no API to query)
    // In the future, could parse error messages or check SDK usage
    return null;
  }

  /**
   * Detects Gemini plan via quota limits
   */
  private async detectGeminiPlan(location?: string): Promise<PlanInfo | null> {
    // Use UsageProvider's getUsage to get quota info, then infer plan from limits
    const usageInfo = await this.usageProvider.getUsage('gemini', { location });
    if (!usageInfo) {
      return null;
    }
    
    // Infer tier from quota limits
    let tier: string | undefined;
    if (usageInfo.limit >= 1000000) {
      tier = 'enterprise';
    } else if (usageInfo.limit >= 100000) {
      tier = 'pro';
    } else if (usageInfo.limit >= 10000) {
      tier = 'standard';
    } else {
      tier = 'free';
    }

    return {
      platform: 'gemini',
      tier,
      detectedFrom: 'quota-limits',
    };
  }

  /**
   * Detects Copilot plan via quota limits
   */
  private async detectCopilotPlan(org?: string): Promise<PlanInfo | null> {
    if (!org) {
      return null;
    }
    // Use UsageProvider's getUsage to get quota info, then infer plan from limits
    const usageInfo = await this.usageProvider.getUsage('copilot', { org });
    if (!usageInfo) {
      return null;
    }
    
    // Infer tier from premium requests limit
    let tier: string | undefined;
    if (usageInfo.limit >= 1000) {
      tier = 'enterprise';
    } else if (usageInfo.limit >= 500) {
      tier = 'team';
    } else if (usageInfo.limit >= 200) {
      tier = 'pro';
    } else {
      tier = 'free';
    }

    return {
      platform: 'copilot',
      customerType: 'organization', // API is organization-level only
      tier,
      detectedFrom: 'quota-limits',
    };
  }

  /**
   * Detects Cursor plan via manual config
   * 
   * Cursor doesn't have a usage API, so plan detection relies on:
   * - Manual config (user specifies their plan)
   * - Auto mode unlimited flag (indicates grandfathered plan)
   */
  private async detectCursorPlan(manualConfig?: { tier?: string; customerType?: string; subscriptionType?: string }): Promise<PlanInfo | null> {
    // If manual config provided, use it
    if (manualConfig?.tier) {
      return {
        platform: 'cursor',
        tier: manualConfig.tier,
        customerType: manualConfig.customerType,
        subscriptionType: manualConfig.subscriptionType,
        detectedFrom: 'manual-config',
      };
    }

    // Could check config for autoModeUnlimited flag to infer grandfathered plan
    // But that's handled elsewhere (QuotaManager)
    
    return null;
  }

  /**
   * Detects plans for all platforms
   * 
   * @param options - Platform-specific options
   * @returns Map of platform to plan info
   */
  async detectAllPlans(options?: {
    claude?: { organizationId?: string };
    copilot?: { org?: string };
    gemini?: { location?: string };
    codex?: { manualConfig?: { tier?: string; customerType?: string; subscriptionType?: string } };
    cursor?: { manualConfig?: { tier?: string; customerType?: string; subscriptionType?: string } };
  }): Promise<Map<Platform, PlanInfo | null>> {
    const results = new Map<Platform, PlanInfo | null>();

    // Detect in parallel for better performance
    const [claude, codex, gemini, copilot, cursor] = await Promise.all([
      this.detectPlan('claude', options?.claude),
      this.detectPlan('codex', options?.codex),
      this.detectPlan('gemini', options?.gemini),
      this.detectPlan('copilot', options?.copilot),
      this.detectPlan('cursor', options?.cursor),
    ]);

    results.set('claude', claude);
    results.set('codex', codex);
    results.set('gemini', gemini);
    results.set('copilot', copilot);
    results.set('cursor', cursor);

    return results;
  }
}
