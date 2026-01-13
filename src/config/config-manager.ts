/**
 * ConfigManager class for loading and managing configuration
 * 
 * Handles YAML file loading, snake_case to camelCase conversion,
 * validation, merging, and path resolution.
 */

import { readFile, access } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import type { PuppetMasterConfig } from '../types/config.js';
import { getDefaultConfig } from './default-config.js';
import { validateConfig } from './config-schema.js';

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
   * @returns Loaded and validated configuration
   * @throws ConfigValidationError if config is invalid
   */
  async load(): Promise<PuppetMasterConfig> {
    // Check if config file exists
    let fileExists = false;
    try {
      await access(this.configPath);
      fileExists = true;
    } catch {
      // File doesn't exist, return defaults
      return getDefaultConfig();
    }

    if (!fileExists) {
      return getDefaultConfig();
    }

    // Load YAML file
    const yamlContent = await loadYamlFile(this.configPath);
    
    // Convert snake_case to camelCase
    const converted = convertSnakeCaseToCamelCase(yamlContent);
    
    // Validate and return
    validateConfig(converted);
    return converted as PuppetMasterConfig;
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

  return result;
}
