/**
 * ConfigManager class for loading and managing configuration
 * 
 * Handles YAML file loading, snake_case to camelCase conversion,
 * validation, merging, and path resolution.
 */

import { readFile, access, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import yaml from 'js-yaml';
import type { PuppetMasterConfig } from '../types/config.js';
import { getDefaultConfig, adjustConfigForInstalledPlatforms } from './default-config.js';
import { validateConfig } from './config-schema.js';
import { SecretsManager } from './secrets-manager.js';
import { PlatformDetector } from '../platforms/platform-detector.js';

/**
 * ConfigManager class for loading and managing configuration files
 */
export class ConfigManager {
  private configPath: string;

  /**
   * Create a new ConfigManager instance
   * @param configPath - Optional path to config file. If not provided, will resolve automatically.
   */
  constructor(configPath?: string) {
    this.configPath = configPath ?? resolveConfigPath();
  }

  /**
   * Get the resolved config path
   * @returns The resolved config file path
   */
  getConfigPath(): string {
    return this.configPath;
  }

  /**
   * Load configuration from file or return defaults
   * @param autoCreate - If true, automatically create default config.yaml when missing or corrupt (default: false)
   * @returns Loaded and validated configuration
   * @throws ConfigValidationError if config is invalid
   */
  async load(autoCreate = false): Promise<PuppetMasterConfig> {
    // P2-T12: Load secrets from env vars and optional local `.env` file.
    // Non-fatal when `.env` is missing.
    new SecretsManager().loadSecrets();

    // Check if config file exists
    let fileExists = false;
    try {
      await access(this.configPath);
      fileExists = true;
    } catch {
      // File doesn't exist
      fileExists = false;
    }

    // If file doesn't exist and autoCreate is enabled, create default config
    if (!fileExists) {
      const defaultConfig = getDefaultConfig();
      try {
        const detector = new PlatformDetector(defaultConfig.cliPaths);
        const installed = await detector.getInstalledPlatforms();
        const adjustedConfig = adjustConfigForInstalledPlatforms(defaultConfig, installed);
        
        // Auto-create config file if requested
        if (autoCreate) {
          try {
            await this.save(adjustedConfig);
            console.log(`[ConfigManager] Auto-created default config at ${this.configPath}`);
          } catch (saveError) {
            console.warn(`[ConfigManager] Failed to auto-create config: ${saveError instanceof Error ? saveError.message : String(saveError)}`);
            // Continue with in-memory config even if save fails
          }
        }
        
        return adjustedConfig;
      } catch {
        // If detection fails, return default config as-is
        if (autoCreate) {
          try {
            await this.save(defaultConfig);
            console.log(`[ConfigManager] Auto-created default config at ${this.configPath} (platform detection failed)`);
          } catch (saveError) {
            console.warn(`[ConfigManager] Failed to auto-create config: ${saveError instanceof Error ? saveError.message : String(saveError)}`);
          }
        }
        return defaultConfig;
      }
    }

    // Load and parse YAML file
    let yamlContent: unknown;
    try {
      yamlContent = await loadYamlFile(this.configPath);
    } catch (error) {
      // Config file exists but is corrupt - auto-create if requested
      if (autoCreate) {
        console.warn(`[ConfigManager] Config file is corrupt: ${error instanceof Error ? error.message : String(error)}`);
        const defaultConfig = getDefaultConfig();
        try {
          const detector = new PlatformDetector(defaultConfig.cliPaths);
          const installed = await detector.getInstalledPlatforms();
          const adjustedConfig = adjustConfigForInstalledPlatforms(defaultConfig, installed);
          await this.save(adjustedConfig);
          console.log(`[ConfigManager] Replaced corrupt config with defaults at ${this.configPath}`);
          return adjustedConfig;
        } catch {
          await this.save(defaultConfig);
          console.log(`[ConfigManager] Replaced corrupt config with defaults at ${this.configPath} (platform detection failed)`);
          return defaultConfig;
        }
      }
      // Re-throw error if not auto-creating
      throw error;
    }
    
    // Convert snake_case to camelCase
    const converted = convertSnakeCaseToCamelCase(yamlContent);
    applyLegacyTaskFailureStyle(converted);
    
    // Validate
    try {
      validateConfig(converted);
    } catch (validationError) {
      // Config file exists but is invalid - auto-create if requested
      if (autoCreate) {
        console.warn(`[ConfigManager] Config validation failed: ${validationError instanceof Error ? validationError.message : String(validationError)}`);
        const defaultConfig = getDefaultConfig();
        try {
          const detector = new PlatformDetector(defaultConfig.cliPaths);
          const installed = await detector.getInstalledPlatforms();
          const adjustedConfig = adjustConfigForInstalledPlatforms(defaultConfig, installed);
          await this.save(adjustedConfig);
          console.log(`[ConfigManager] Replaced invalid config with defaults at ${this.configPath}`);
          return adjustedConfig;
        } catch {
          await this.save(defaultConfig);
          console.log(`[ConfigManager] Replaced invalid config with defaults at ${this.configPath} (platform detection failed)`);
          return defaultConfig;
        }
      }
      // Re-throw error if not auto-creating
      throw validationError;
    }
    
    const config = converted as PuppetMasterConfig;
    
    // Adjust config to use only installed platforms
    try {
      const detector = new PlatformDetector(config.cliPaths);
      const installed = await detector.getInstalledPlatforms();
      return adjustConfigForInstalledPlatforms(config, installed);
    } catch {
      // If detection fails, return config as-is
      return config;
    }
  }

  /**
   * Validate a configuration object
   * @param config - Configuration object to validate
   * @returns Validated configuration
   * @throws ConfigValidationError if config is invalid
   */
  validate(config: unknown): PuppetMasterConfig {
    // Convert snake_case to camelCase if needed
    const converted = convertSnakeCaseToCamelCase(config);
    applyLegacyTaskFailureStyle(converted);
    validateConfig(converted);
    return converted as PuppetMasterConfig;
  }

  /**
   * Merge base configuration with overrides
   * @param base - Base configuration
   * @param overrides - Partial configuration to merge
   * @returns Merged configuration
   */
  merge(base: PuppetMasterConfig, overrides: Partial<PuppetMasterConfig>): PuppetMasterConfig {
    return deepMerge(base, overrides);
  }

  /**
   * Save configuration to file
   * @param config - Configuration to save
   * @throws Error if validation fails or file write fails
   */
  async save(config: PuppetMasterConfig): Promise<void> {
    // Validate before saving
    validateConfig(config);

    // Convert camelCase back to snake_case for YAML output
    const yamlObj = convertCamelCaseToSnakeCase(config, undefined, undefined);

    // Ensure directory exists
    const dir = dirname(this.configPath);
    await mkdir(dir, { recursive: true });

    // Write YAML file
    const yamlContent = yaml.dump(yamlObj, { indent: 2 });
    await writeFile(this.configPath, yamlContent, 'utf-8');
  }
}

/**
 * Resolve config file path using resolution order:
 * 1. Provided path (if exists)
 * 2. .puppet-master/config.yaml (if exists)
 * 3. puppet-master.yaml in cwd (if exists)
 * 4. Defaults to .puppet-master/config.yaml
 */
export function resolveConfigPath(providedPath?: string): string {
  if (providedPath) {
    return providedPath;
  }

  // Get current working directory (project root)
  const cwd = process.cwd();
  
  // Check .puppet-master/config.yaml
  const puppetMasterConfig = join(cwd, '.puppet-master', 'config.yaml');
  
  // Check puppet-master.yaml in cwd
  const cwdConfig = join(cwd, 'puppet-master.yaml');
  
  // Resolution order: .puppet-master/config.yaml -> puppet-master.yaml -> default to .puppet-master/config.yaml
  if (existsSync(puppetMasterConfig)) {
    return puppetMasterConfig;
  }
  if (existsSync(cwdConfig)) {
    return cwdConfig;
  }

  // Default to .puppet-master/config.yaml
  return puppetMasterConfig;
}

/**
 * Load and parse YAML file
 * @param path - Path to YAML file
 * @returns Parsed YAML content
 */
export async function loadYamlFile(path: string): Promise<unknown> {
  try {
    const content = await readFile(path, 'utf-8');
    return yaml.load(content, { filename: path });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load YAML file at ${path}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Convert snake_case object keys to camelCase
 * Handles nested objects and arrays recursively
 */
function convertSnakeCaseToCamelCase(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertSnakeCaseToCamelCase(item));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key);
    result[camelKey] = convertSnakeCaseToCamelCase(value);
  }
  return result;
}

function applyLegacyTaskFailureStyle(config: unknown): void {
  if (typeof config !== 'object' || config === null) {
    return;
  }
  const root = config as Record<string, unknown>;
  const tiers = root.tiers;
  if (!tiers || typeof tiers !== 'object') {
    return;
  }
  const tierKeys = ['phase', 'task', 'subtask', 'iteration', 'gateReview', 'gate_review'];
  for (const key of tierKeys) {
    const tier = (tiers as Record<string, unknown>)[key];
    if (!tier || typeof tier !== 'object') {
      continue;
    }
    const tierRecord = tier as Record<string, unknown>;
    if (tierRecord.taskFailureStyle !== undefined) {
      continue;
    }
    if (tierRecord.selfFix === true) {
      tierRecord.taskFailureStyle = 'spawn_new_agent';
      delete tierRecord.selfFix;
      continue;
    }
    if (tierRecord.selfFix === false) {
      tierRecord.taskFailureStyle = 'skip_retries';
      delete tierRecord.selfFix;
    }
  }
}

/**
 * Convert snake_case string to camelCase
 */
function snakeToCamel(str: string): string {
  if (str === 'max_attempts') {
    return 'maxIterations';
  }
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase string to snake_case
 */
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convert camelCase object keys to snake_case
 * Handles nested objects and arrays recursively
 * Special handling: tiers.iteration.maxIterations -> max_attempts (not max_iterations)
 */
function convertCamelCaseToSnakeCase(obj: unknown, parentKey?: string, grandParentKey?: string): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertCamelCaseToSnakeCase(item, parentKey, grandParentKey));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Special case: tiers.iteration.maxIterations -> max_attempts
    let snakeKey: string;
    if (key === 'maxIterations' && parentKey === 'iteration' && grandParentKey === 'tiers') {
      snakeKey = 'max_attempts';
    } else {
      snakeKey = camelToSnake(key);
    }
    result[snakeKey] = convertCamelCaseToSnakeCase(value, key, parentKey);
  }
  return result;
}

/**
 * Deep merge two objects
 */
function deepMerge(base: PuppetMasterConfig, overrides: Partial<PuppetMasterConfig>): PuppetMasterConfig {
  const result: PuppetMasterConfig = { ...base };

  // Merge project
  if (overrides.project) {
    result.project = { ...base.project, ...overrides.project };
  }

  // Merge tiers
  if (overrides.tiers) {
    result.tiers = {
      phase: overrides.tiers.phase ?? base.tiers.phase,
      task: overrides.tiers.task ?? base.tiers.task,
      subtask: overrides.tiers.subtask ?? base.tiers.subtask,
      iteration: overrides.tiers.iteration ?? base.tiers.iteration,
    };
  }

  // Merge branching
  if (overrides.branching) {
    result.branching = { ...base.branching, ...overrides.branching };
  }

  // Merge verification
  if (overrides.verification) {
    result.verification = { ...base.verification, ...overrides.verification };
  }

  // Merge memory (including nested agentsEnforcement)
  if (overrides.memory) {
    result.memory = {
      ...base.memory,
      ...overrides.memory,
      agentsEnforcement: overrides.memory.agentsEnforcement
        ? { ...base.memory.agentsEnforcement, ...overrides.memory.agentsEnforcement }
        : base.memory.agentsEnforcement,
    };
  }

  // Merge budgets (including nested budget configs)
  if (overrides.budgets) {
    result.budgets = {
      claude: overrides.budgets.claude ? { ...base.budgets.claude, ...overrides.budgets.claude } : base.budgets.claude,
      codex: overrides.budgets.codex ? { ...base.budgets.codex, ...overrides.budgets.codex } : base.budgets.codex,
      cursor: overrides.budgets.cursor ? { ...base.budgets.cursor, ...overrides.budgets.cursor } : base.budgets.cursor,
      gemini: overrides.budgets.gemini ? { ...base.budgets.gemini, ...overrides.budgets.gemini } : base.budgets.gemini,
      copilot: overrides.budgets.copilot ? { ...base.budgets.copilot, ...overrides.budgets.copilot } : base.budgets.copilot,
    };
  }

  // Merge budgetEnforcement
  if (overrides.budgetEnforcement) {
    result.budgetEnforcement = { ...base.budgetEnforcement, ...overrides.budgetEnforcement };
  }

  // Merge logging
  if (overrides.logging) {
    result.logging = { ...base.logging, ...overrides.logging };
  }

  // Merge cliPaths
  if (overrides.cliPaths) {
    result.cliPaths = { ...base.cliPaths, ...overrides.cliPaths };
  }

  // Merge models (optional, P2-T05)
  if (overrides.models) {
    if (base.models) {
      result.models = {
        level1: { ...base.models.level1, ...overrides.models.level1 },
        level2: { ...base.models.level2, ...overrides.models.level2 },
        level3: { ...base.models.level3, ...overrides.models.level3 },
      };
    } else {
      result.models = overrides.models;
    }
  }

  // Merge complexityRouting (optional, P2-T05)
  if (overrides.complexityRouting) {
    if (base.complexityRouting) {
      result.complexityRouting = {
        trivial: { ...base.complexityRouting.trivial, ...overrides.complexityRouting.trivial },
        simple: { ...base.complexityRouting.simple, ...overrides.complexityRouting.simple },
        standard: { ...base.complexityRouting.standard, ...overrides.complexityRouting.standard },
        critical: { ...base.complexityRouting.critical, ...overrides.complexityRouting.critical },
      };
    } else {
      result.complexityRouting = overrides.complexityRouting;
    }
  }

  // Merge loopGuard (optional, P2-T02)
  if (overrides.loopGuard) {
    result.loopGuard = { ...(base.loopGuard ?? {}), ...overrides.loopGuard };
  }

  return result;
}
