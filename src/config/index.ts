/**
 * Configuration module barrel exports
 * 
 * Re-exports all config-related functionality
 */

export { ConfigManager, resolveConfigPath, loadYamlFile } from './config-manager.js';
export { getDefaultConfig } from './default-config.js';
export { validateConfig, ConfigValidationError } from './config-schema.js';

// Re-export types using type-only exports
export type {
  PuppetMasterConfig,
  Platform,
  ProjectConfig,
  CliPathsConfig,
  LoggingConfig,
  TierConfig,
  BranchingConfig,
  VerificationConfig,
  AgentsEnforcementConfig,
  MemoryConfig,
  BudgetConfig,
  PlatformBudgets,
  BudgetEnforcementConfig,
  TiersConfig,
} from '../types/config.js';
