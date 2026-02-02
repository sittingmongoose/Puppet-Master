/**
 * Configuration Override Utility
 * 
 * Provides functions to merge CLI overrides into configuration objects.
 * CLI overrides take precedence over config file values.
 */

import type { PuppetMasterConfig, StartChainStepConfig, CoverageValidationConfig, Platform } from '../types/config.js';

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

const DEFAULT_COVERAGE_VALIDATION_CONFIG: CoverageValidationConfig = {
  enabled: true,
  minCoverageRatio: 0.5,
  largeDocThreshold: 5000,
  veryLargeDocThreshold: 10000,
  minPhasesForVeryLargeDoc: 2,
  maxGenericCriteria: 5,
  enableAICoverageDiff: true,
};

function applyStepConfigOverride(stepConfig: StartChainStepConfig, override: StartChainStepOverride): void {
  if (override.platform !== undefined) {
    stepConfig.platform = override.platform;
  }
  if (override.model !== undefined) {
    stepConfig.model = override.model;
  }
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
    switch (stepKey) {
      case 'requirementsInterview': {
        result.startChain.requirementsInterview ??= {};
        applyStepConfigOverride(result.startChain.requirementsInterview, stepOverride);
        break;
      }
      case 'prd': {
        result.startChain.prd ??= {};
        applyStepConfigOverride(result.startChain.prd, stepOverride);
        break;
      }
      case 'architecture': {
        result.startChain.architecture ??= {};
        applyStepConfigOverride(result.startChain.architecture, stepOverride);
        break;
      }
      case 'validation': {
        result.startChain.validation ??= {};
        applyStepConfigOverride(result.startChain.validation, stepOverride);
        break;
      }
      case 'coverage': {
        result.startChain.coverage ??= { ...DEFAULT_COVERAGE_VALIDATION_CONFIG };
        applyStepConfigOverride(result.startChain.coverage, stepOverride);
        break;
      }
      default:
        break;
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
