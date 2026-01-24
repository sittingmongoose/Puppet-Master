/**
 * Platform Router for RWM Puppet Master
 * 
 * Routes to different platforms based on tier type and action.
 * Implements fallback chain when preferred platform is unavailable.
 * 
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T08 for implementation details.
 */

import type { PuppetMasterConfig, TierConfig, Platform } from '../types/config.js';
import type { TierNode } from './tier-node.js';
import type { TierPlan } from '../types/tiers.js';
import type { TierType } from '../types/state.js';
import { PlatformRegistry } from '../platforms/registry.js';
import { ComplexityClassifier, DEFAULT_COMPLEXITY_ROUTING_MATRIX } from './complexity-classifier.js';

/**
 * Platform configuration result from router.
 */
export interface PlatformConfig {
  platform: Platform;
  model: string;
  planMode?: boolean;
  selfFix: boolean;
  maxIterations: number;
  escalation: 'phase' | 'task' | 'subtask' | null;
}

/**
 * Error thrown when no platforms are available.
 */
export class NoPlatformAvailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoPlatformAvailableError';
  }
}

/**
 * Platform Router class.
 * Selects appropriate platform per tier based on configuration and availability.
 */
export class PlatformRouter {
  private readonly config: PuppetMasterConfig;
  private readonly registry: PlatformRegistry;

  /**
   * Fallback chain mapping for each platform.
   * When a preferred platform is unavailable, try these in order.
   */
  private readonly fallbackChain: Record<Platform, Platform[]> = {
    cursor: ['codex', 'claude', 'gemini', 'copilot'],
    codex: ['claude', 'cursor', 'gemini', 'copilot'],
    claude: ['codex', 'cursor', 'gemini', 'copilot'],
    gemini: ['copilot', 'codex', 'cursor', 'claude'],
    copilot: ['gemini', 'codex', 'cursor', 'claude'],
  };

  constructor(config: PuppetMasterConfig, registry: PlatformRegistry) {
    this.config = config;
    this.registry = registry;
  }

  /**
   * Select platform for a tier based on tier type, action, and optional tier plan.
   * 
   * Priority order:
   * 1. TierPlan platform override (if specified)
   * 2. Tier-specific config (phase, task, subtask, iteration)
   * 3. Gate review config (for review actions)
   * 4. Fallback chain if preferred platform unavailable
   * 
   * @param tier - Tier node
   * @param action - Action type ('execute' or 'review')
   * @param tierPlan - Optional tier plan with platform override
   * @returns Platform configuration
   * @throws NoPlatformAvailableError if no platforms are available
   */
  selectPlatform(
    tier: TierNode,
    action: 'execute' | 'review',
    tierPlan?: TierPlan
  ): PlatformConfig {
    const tierType = tier.type;
    const modelLevelOverride = this.getTierPlanModelLevelOverride(tierPlan);

    // Priority 1: TierPlan platform override (if specified)
    // Note: TierPlan from types/tiers.ts is simple, but tier-plan-generator creates
    // PhasePlan/TaskPlan/SubtaskPlan with platform. For now, we check if tierPlan
    // has a platform property (could be from PhasePlan/TaskPlan/SubtaskPlan structure).
    // This allows future enhancement to pass platform from tier plan generator.
    if (tierPlan && typeof tierPlan === 'object' && 'platform' in tierPlan) {
      const planPlatform = (tierPlan as { platform?: Platform }).platform;
      if (planPlatform) {
        // Use the plan-specified platform when possible; otherwise fall back from it.
        const selectedPlatform = this.isAvailable(planPlatform)
          ? planPlatform
          : this.getFallbackWithModel(
              planPlatform,
              tierType,
              this.getModelForOverride(modelLevelOverride) ?? undefined
            ).platform;

        let tierConfig = this.getTierConfigForPlatform(selectedPlatform, tierType);

        // P2-T05: If a model level override is present for subtask execution, override model only.
        if (action === 'execute' && tierType === 'subtask') {
          const overrideModel = this.getModelForOverride(modelLevelOverride);
          if (overrideModel) {
            tierConfig = { ...tierConfig, model: overrideModel };
          }
        }

        this.logSelection(tier, action, tierConfig.platform, 'tierPlan');
        return tierConfig;
      }
    }

    // Priority 2: Gate review config (for review actions)
    if (action === 'review') {
      const gateReviewConfig = this.config.tiers.gate_review;
      if (gateReviewConfig) {
        if (this.isAvailable(gateReviewConfig.platform)) {
          this.logSelection(tier, action, gateReviewConfig.platform, 'gate_review');
          return this.tierConfigToPlatformConfig(gateReviewConfig);
        }
        // Fallback for gate review
        const fallback = this.getFallback(gateReviewConfig.platform, tierType);
        this.logSelection(tier, action, fallback.platform, 'gate_review_fallback');
        return fallback;
      }
      // If no gate_review config, fall through to tier-specific config
    }

    // P2-T05: Complexity-based model routing (subtask execution only)
    if (action === 'execute' && tierType === 'subtask' && this.config.models) {
      const routed = this.getComplexityRoutedSubtaskConfig(tier, modelLevelOverride);
      if (routed) {
        this.logSelection(tier, action, routed.config.platform, routed.reason);
        return routed.config;
      }
    }

    // Priority 3: Tier-specific config
    const tierConfig = this.config.tiers[tierType];
    if (this.isAvailable(tierConfig.platform)) {
      this.logSelection(tier, action, tierConfig.platform, 'tier_config');
      return this.tierConfigToPlatformConfig(tierConfig);
    }

    // Priority 4: Fallback chain
    const fallback = this.getFallback(tierConfig.platform, tierType);
    this.logSelection(tier, action, fallback.platform, 'fallback');
    return fallback;
  }

  /**
   * Check if a platform is available in the registry.
   * 
   * @param platform - Platform to check
   * @returns True if platform is available
   */
  private isAvailable(platform: Platform): boolean {
    const runner = this.registry.get(platform);
    return runner !== undefined;
  }

  /**
   * Get fallback platform configuration when preferred platform is unavailable.
   * 
   * @param preferred - Preferred platform that is unavailable
   * @param tierType - Tier type (used to get config template)
   * @returns Fallback platform configuration
   * @throws NoPlatformAvailableError if no platforms are available
   */
  private getFallback(preferred: Platform, tierType: TierType): PlatformConfig {
    const fallbacks = this.fallbackChain[preferred] || [];
    
    for (const fallbackPlatform of fallbacks) {
      if (this.isAvailable(fallbackPlatform)) {
        // Use subtask config as template (per task spec)
        // But override platform and model from the fallback platform's tier config
        const fallbackTierConfig = this.config.tiers.subtask;
        const targetTierConfig = this.config.tiers[tierType];
        
        // Try to get the fallback platform's config for this tier type
        // If not available, use subtask config as template
        return {
          platform: fallbackPlatform,
          model: targetTierConfig.model, // Keep model from tier type
          planMode: fallbackTierConfig.planMode,
          selfFix: fallbackTierConfig.selfFix,
          maxIterations: fallbackTierConfig.maxIterations,
          escalation: fallbackTierConfig.escalation,
        };
      }
    }

    // No platforms available
    throw new NoPlatformAvailableError(
      `No available platforms found. Preferred: ${preferred}, Tried fallbacks: ${fallbacks.join(', ')}`
    );
  }

  /**
   * Like getFallback(), but allows overriding the model string while falling back.
   */
  private getFallbackWithModel(preferred: Platform, tierType: TierType, modelOverride?: string): PlatformConfig {
    const fallbacks = this.fallbackChain[preferred] || [];

    for (const fallbackPlatform of fallbacks) {
      if (this.isAvailable(fallbackPlatform)) {
        const fallbackTierConfig = this.config.tiers.subtask;
        const targetTierConfig = this.config.tiers[tierType];
        return {
          platform: fallbackPlatform,
          model: modelOverride ?? targetTierConfig.model,
          planMode: fallbackTierConfig.planMode,
          selfFix: fallbackTierConfig.selfFix,
          maxIterations: fallbackTierConfig.maxIterations,
          escalation: fallbackTierConfig.escalation,
        };
      }
    }

    throw new NoPlatformAvailableError(
      `No available platforms found. Preferred: ${preferred}, Tried fallbacks: ${fallbacks.join(', ')}`
    );
  }

  private getTierPlanModelLevelOverride(tierPlan?: TierPlan): 'level1' | 'level2' | 'level3' | null {
    if (!tierPlan || typeof tierPlan !== 'object') {
      return null;
    }
    if (!('modelLevel' in tierPlan)) {
      return null;
    }
    const value = (tierPlan as { modelLevel?: unknown }).modelLevel;
    return this.isModelLevel(value) ? value : null;
  }

  private isModelLevel(value: unknown): value is 'level1' | 'level2' | 'level3' {
    return value === 'level1' || value === 'level2' || value === 'level3';
  }

  private getModelForOverride(modelLevel: 'level1' | 'level2' | 'level3' | null): string | null {
    if (!modelLevel) {
      return null;
    }
    const models = this.config.models;
    if (!models) {
      return null;
    }
    return models[modelLevel].model;
  }

  private getComplexityRoutedSubtaskConfig(
    tier: TierNode,
    modelLevelOverride: 'level1' | 'level2' | 'level3' | null
  ): { config: PlatformConfig; reason: string } | null {
    const models = this.config.models;
    if (!models) {
      return null;
    }

    const matrix = this.config.complexityRouting ?? DEFAULT_COMPLEXITY_ROUTING_MATRIX;
    const classifier = new ComplexityClassifier(matrix);
    const { complexity, taskType } = classifier.classify(tier);
    const modelLevel = modelLevelOverride ?? classifier.getModelLevel(complexity, taskType);
    const selectedModel = models[modelLevel].model;

    // Use the configured platform for that model level.
    const preferredPlatform = models[modelLevel].platform;

    const template = this.config.tiers.subtask;
    if (this.isAvailable(preferredPlatform)) {
      return {
        config: {
          platform: preferredPlatform,
          model: selectedModel,
          planMode: template.planMode,
          selfFix: template.selfFix,
          maxIterations: template.maxIterations,
          escalation: template.escalation,
        },
        reason: `complexity_routing(${complexity}/${taskType}->${modelLevel})`,
      };
    }

    const fallback = this.getFallbackWithModel(preferredPlatform, 'subtask', selectedModel);
    return {
      config: {
        ...fallback,
        planMode: template.planMode,
        selfFix: template.selfFix,
        maxIterations: template.maxIterations,
        escalation: template.escalation,
      },
      reason: `complexity_routing_fallback(${complexity}/${taskType}->${modelLevel})`,
    };
  }

  /**
   * Get tier config for a specific platform.
   * Uses the tier type's config but overrides platform.
   * 
   * @param platform - Platform to use
   * @param tierType - Tier type
   * @returns Platform configuration
   */
  private getTierConfigForPlatform(platform: Platform, tierType: TierType): PlatformConfig {
    const tierConfig = this.config.tiers[tierType];
    return {
      platform,
      model: tierConfig.model,
      planMode: tierConfig.planMode,
      selfFix: tierConfig.selfFix,
      maxIterations: tierConfig.maxIterations,
      escalation: tierConfig.escalation,
    };
  }

  /**
   * Convert TierConfig to PlatformConfig.
   * 
   * @param tierConfig - Tier configuration
   * @returns Platform configuration
   */
  private tierConfigToPlatformConfig(tierConfig: TierConfig): PlatformConfig {
    return {
      platform: tierConfig.platform,
      model: tierConfig.model,
      planMode: tierConfig.planMode,
      selfFix: tierConfig.selfFix,
      maxIterations: tierConfig.maxIterations,
      escalation: tierConfig.escalation,
    };
  }

  /**
   * Log platform selection for debugging.
   * 
   * @param tier - Tier node
   * @param action - Action type
   * @param platform - Selected platform
   * @param reason - Reason for selection
   */
  private logSelection(
    tier: TierNode,
    action: 'execute' | 'review',
    platform: Platform,
    reason: string
  ): void {
    // Use console.log for now - could be enhanced with proper logging
    console.log(
      `[PlatformRouter] Selected platform: ${platform} for ${tier.type} ${tier.id} (${action}), reason: ${reason}`
    );
  }
}
