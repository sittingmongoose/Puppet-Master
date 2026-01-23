/**
 * Configuration Override Utility
 * 
 * Provides functions to merge CLI overrides into configuration objects.
 * CLI overrides take precedence over config file values.
 */

import type { PuppetMasterConfig, StartChainStepConfig, Platform } from '../types/config.js';

/**
 * Options for overriding start chain step configuration
 */
export interface StartChainStepOverride {
  platform?: Platform;
  model?: string;
}

/**
 * Options for overriding start chain configuration
 */
export interface StartChainOverride {
  requirementsInterview?: StartChainStepOverride;
  prd?: StartChainStepOverride;
  architecture?: StartChainStepOverride;
  validation?: StartChainStepOverride;
  coverage?: StartChainStepOverride;
}

/**
 * Apply CLI overrides to a configuration object.
 * CLI overrides take precedence over existing config values.
 * 
 * @param config - Base configuration to override
 * @param overrides - CLI override options
 * @returns New configuration object with overrides applied (does not mutate original)
 */
export function applyConfigOverrides(
  config: PuppetMasterConfig,
  overrides: StartChainOverride
): PuppetMasterConfig {
  // Create a deep copy to avoid mutating the original
  const result: PuppetMasterConfig = JSON.parse(JSON.stringify(config));

  // Initialize startChain if it doesn't exist
  if (!result.startChain) {
    result.startChain = {};
  }

  // Apply overrides for each step
  for (const [step, stepOverride] of Object.entries(overrides)) {
    if (!stepOverride) continue;

    const stepKey = step as keyof StartChainOverride;
    if (!['requirementsInterview', 'prd', 'architecture', 'validation', 'coverage'].includes(stepKey)) {
      continue;
    }

    // Initialize step config if it doesn't exist
    if (!result.startChain[stepKey]) {
      // For coverage, we need to preserve the CoverageValidationConfig structure
      // For other steps, we can use an empty object
      if (stepKey === 'coverage') {
        // Coverage extends both StartChainStepConfig and CoverageValidationConfig
        // We'll only override platform/model, preserving existing coverage config if any
        result.startChain[stepKey] = result.startChain[stepKey] || {} as any;
      } else {
        result.startChain[stepKey] = {} as any;
      }
    }

    const stepConfig = result.startChain[stepKey] as StartChainStepConfig;

    // Apply platform override
    if (stepOverride.platform !== undefined) {
      stepConfig.platform = stepOverride.platform;
    }

    // Apply model override
    if (stepOverride.model !== undefined) {
      stepConfig.model = stepOverride.model;
    }
  }

  return result;
}

/**
 * Merge a single step override into the config.
 * Helper function for simpler override scenarios.
 * 
 * @param config - Base configuration
 * @param step - Step name (e.g., 'prd', 'architecture')
 * @param override - Override values
 * @returns New configuration with override applied
 */
export function applyStepOverride(
  config: PuppetMasterConfig,
  step: 'requirementsInterview' | 'prd' | 'architecture' | 'validation' | 'coverage',
  override: StartChainStepOverride
): PuppetMasterConfig {
  return applyConfigOverrides(config, { [step]: override });
}
