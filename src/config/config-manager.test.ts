/**
 * Tests for ConfigManager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { writeFile, mkdir, rm, access } from 'fs/promises';
import { join } from 'path';
import { ConfigManager, resolveConfigPath, loadYamlFile } from './config-manager.js';
import { getDefaultConfig } from './default-config.js';
import { validateConfig, ConfigValidationError } from './config-schema.js';
import type { PuppetMasterConfig } from '../types/config.js';

describe('ConfigManager', () => {
  const testDir = join(process.cwd(), '.test-config');
  const testConfigPath = join(testDir, 'config.yaml');

  beforeEach(async () => {
    // Create test directory
    try {
      await mkdir(testDir, { recursive: true });
    } catch {
      // Directory might already exist
    }
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('getDefaultConfig', () => {
    it('should return valid default config', () => {
      const config = getDefaultConfig();
      expect(() => validateConfig(config)).not.toThrow();
      expect(config.project.name).toBe('Untitled');
      expect(config.tiers.phase.platform).toBe('claude');
    });

    it('should match PuppetMasterConfig schema', () => {
      const config = getDefaultConfig();
      expect(config).toHaveProperty('project');
      expect(config).toHaveProperty('tiers');
      expect(config).toHaveProperty('branching');
      expect(config).toHaveProperty('verification');
      expect(config).toHaveProperty('memory');
      expect(config).toHaveProperty('budgets');
      expect(config).toHaveProperty('budgetEnforcement');
      expect(config).toHaveProperty('logging');
      expect(config).toHaveProperty('cliPaths');
    });
  });

  describe('validateConfig', () => {
    it('should accept valid config', () => {
      const config = getDefaultConfig();
      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should reject config missing required keys', () => {
      const invalid = { project: {} };
      expect(() => validateConfig(invalid)).toThrow(ConfigValidationError);
    });

    it('should reject config with invalid platform', () => {
      const config = getDefaultConfig();
      (config.tiers.phase as { platform: string }).platform = 'invalid' as any;
      expect(() => validateConfig(config)).toThrow(ConfigValidationError);
    });

    it('should reject config with invalid enum values', () => {
      const config = getDefaultConfig();
      (config.branching as { granularity: string }).granularity = 'invalid' as any;
      expect(() => validateConfig(config)).toThrow(ConfigValidationError);
    });

    it('should reject config with wrong types', () => {
      const config = getDefaultConfig();
      (config.project as { name: unknown }).name = 123;
      expect(() => validateConfig(config)).toThrow(ConfigValidationError);
    });
  });

  describe('ConfigManager.load', () => {
    it('should return default config when file does not exist', async () => {
      const manager = new ConfigManager('/nonexistent/config.yaml');
      const config = await manager.load();
      expect(config.project.name).toBe('Untitled');
    });

    it('should load valid YAML config file', async () => {
      const yamlContent = `
project:
  name: "TestProject"
  working_directory: "./test"
tiers:
  phase:
    platform: "claude"
    model: "opus-4.5"
    self_fix: false
    max_iterations: 3
    escalation: null
  task:
    platform: "codex"
    model: "gpt-5.2-high"
    self_fix: true
    max_iterations: 5
    escalation: "phase"
  subtask:
    platform: "cursor"
    model: "sonnet-4.5-thinking"
    self_fix: true
    max_iterations: 10
    escalation: "task"
  iteration:
    platform: "cursor"
    model: "auto"
    self_fix: false
    max_iterations: 3
    escalation: "subtask"
branching:
  base_branch: "main"
  naming_pattern: "ralph/{phase}/{task}"
  granularity: "per-task"
  push_policy: "per-subtask"
  merge_policy: "squash"
  auto_pr: true
verification:
  browser_adapter: "dev-browser"
  screenshot_on_failure: true
  evidence_directory: ".puppet-master/evidence"
memory:
  progress_file: "progress.txt"
  agents_file: "AGENTS.md"
  prd_file: ".puppet-master/prd.json"
  multi_level_agents: true
  agents_enforcement:
    require_update_on_failure: true
    require_update_on_gotcha: true
    gate_fails_on_missing_update: true
    reviewer_must_acknowledge: true
budgets:
  claude:
    max_calls_per_run: 5
    max_calls_per_hour: 3
    max_calls_per_day: 10
    cooldown_hours: 5
    fallback_platform: "codex"
  codex:
    max_calls_per_run: 50
    max_calls_per_hour: 20
    max_calls_per_day: 100
    fallback_platform: "cursor"
  cursor:
    max_calls_per_run: "unlimited"
    max_calls_per_hour: "unlimited"
    max_calls_per_day: "unlimited"
    fallback_platform: null
budget_enforcement:
  on_limit_reached: "fallback"
  warn_at_percentage: 80
  notify_on_fallback: true
logging:
  level: "info"
  retention_days: 30
cli_paths:
  cursor: "cursor-agent"
  codex: "codex"
  claude: "claude"
`;
      await writeFile(testConfigPath, yamlContent, 'utf-8');

      const manager = new ConfigManager(testConfigPath);
      const config = await manager.load();

      expect(config.project.name).toBe('TestProject');
      expect(config.project.workingDirectory).toBe('./test');
      expect(config.tiers.phase.platform).toBe('claude');
    });

    it('should convert snake_case to camelCase', async () => {
      const yamlContent = `
project:
  name: "Test"
  working_directory: "."
tiers:
  phase:
    platform: "cursor"
    model: "auto"
    self_fix: true
    max_iterations: 1
    escalation: null
  task:
    platform: "cursor"
    model: "auto"
    self_fix: true
    max_iterations: 1
    escalation: "phase"
  subtask:
    platform: "cursor"
    model: "auto"
    self_fix: true
    max_iterations: 1
    escalation: "task"
  iteration:
    platform: "cursor"
    model: "auto"
    self_fix: true
    max_iterations: 1
    escalation: "subtask"
branching:
  base_branch: "main"
  naming_pattern: "test"
  granularity: "single"
  push_policy: "per-phase"
  merge_policy: "merge"
  auto_pr: false
verification:
  browser_adapter: "test"
  screenshot_on_failure: false
  evidence_directory: "test"
memory:
  progress_file: "test"
  agents_file: "test"
  prd_file: "test"
  multi_level_agents: false
  agents_enforcement:
    require_update_on_failure: false
    require_update_on_gotcha: false
    gate_fails_on_missing_update: false
    reviewer_must_acknowledge: false
budgets:
  claude:
    max_calls_per_run: 1
    max_calls_per_hour: 1
    max_calls_per_day: 1
    fallback_platform: null
  codex:
    max_calls_per_run: 1
    max_calls_per_hour: 1
    max_calls_per_day: 1
    fallback_platform: null
  cursor:
    max_calls_per_run: "unlimited"
    max_calls_per_hour: "unlimited"
    max_calls_per_day: "unlimited"
    fallback_platform: null
budget_enforcement:
  on_limit_reached: "pause"
  warn_at_percentage: 50
  notify_on_fallback: false
logging:
  level: "error"
  retention_days: 1
cli_paths:
  cursor: "test"
  codex: "test"
  claude: "test"
`;
      await writeFile(testConfigPath, yamlContent, 'utf-8');

      const manager = new ConfigManager(testConfigPath);
      const config = await manager.load();

      // Verify camelCase conversion
      expect(config.project.workingDirectory).toBeDefined();
      expect(config.tiers.phase.selfFix).toBe(true);
      expect(config.tiers.phase.maxIterations).toBe(1);
      expect(config.branching.baseBranch).toBe('main');
      expect(config.branching.namingPattern).toBe('test');
      expect(config.verification.browserAdapter).toBe('test');
      expect(config.verification.screenshotOnFailure).toBe(false);
      expect(config.memory.progressFile).toBe('test');
      expect(config.memory.multiLevelAgents).toBe(false);
      expect(config.memory.agentsEnforcement.requireUpdateOnFailure).toBe(false);
      expect(config.budgets.claude.maxCallsPerRun).toBe(1);
      expect(config.budgets.claude.maxCallsPerHour).toBe(1);
      expect(config.budgets.claude.maxCallsPerDay).toBe(1);
      expect(config.budgetEnforcement.onLimitReached).toBe('pause');
      expect(config.budgetEnforcement.warnAtPercentage).toBe(50);
      expect(config.logging.retentionDays).toBe(1);
      expect(config.cliPaths.cursor).toBe('test');
    });

    it('should throw on invalid YAML', async () => {
      const invalidYaml = 'invalid: yaml: content: [';
      await writeFile(testConfigPath, invalidYaml, 'utf-8');

      const manager = new ConfigManager(testConfigPath);
      await expect(manager.load()).rejects.toThrow();
    });

    it('should throw on invalid config structure', async () => {
      const invalidYaml = `
project:
  name: 123  # Invalid type
`;
      await writeFile(testConfigPath, invalidYaml, 'utf-8');

      const manager = new ConfigManager(testConfigPath);
      await expect(manager.load()).rejects.toThrow(ConfigValidationError);
    });
  });

  describe('ConfigManager.validate', () => {
    it('should validate valid config', () => {
      const manager = new ConfigManager();
      const config = getDefaultConfig();
      expect(() => manager.validate(config)).not.toThrow();
    });

    it('should throw on invalid config', () => {
      const manager = new ConfigManager();
      const invalid = { project: { name: 'test' } };
      expect(() => manager.validate(invalid)).toThrow(ConfigValidationError);
    });
  });

  describe('ConfigManager.merge', () => {
    it('should merge partial config overrides', () => {
      const manager = new ConfigManager();
      const base = getDefaultConfig();
      const overrides: Partial<PuppetMasterConfig> = {
        project: {
          name: 'MergedProject',
          workingDirectory: './merged',
        },
      };

      const merged = manager.merge(base, overrides);
      expect(merged.project.name).toBe('MergedProject');
      expect(merged.project.workingDirectory).toBe('./merged');
      expect(merged.tiers.phase.platform).toBe(base.tiers.phase.platform);
    });

    it('should deep merge nested objects', () => {
      const manager = new ConfigManager();
      const base = getDefaultConfig();
      const overrides: Partial<PuppetMasterConfig> = {
        memory: {
          ...base.memory,
          agentsEnforcement: {
            requireUpdateOnFailure: false,
            requireUpdateOnGotcha: true,
            gateFailsOnMissingUpdate: true,
            reviewerMustAcknowledge: true,
          },
        },
      };

      const merged = manager.merge(base, overrides);
      expect(merged.memory.agentsEnforcement.requireUpdateOnFailure).toBe(false);
      expect(merged.memory.agentsEnforcement.requireUpdateOnGotcha).toBe(true);
    });

    it('should merge budgets correctly', () => {
      const manager = new ConfigManager();
      const base = getDefaultConfig();
      const overrides: Partial<PuppetMasterConfig> = {
        budgets: {
          claude: {
            maxCallsPerRun: 10,
            maxCallsPerHour: 5,
            maxCallsPerDay: 20,
            fallbackPlatform: 'cursor',
          },
          codex: base.budgets.codex,
          cursor: base.budgets.cursor,
        },
      };

      const merged = manager.merge(base, overrides);
      expect(merged.budgets.claude.maxCallsPerRun).toBe(10);
      expect(merged.budgets.codex.maxCallsPerRun).toBe(base.budgets.codex.maxCallsPerRun);
    });
  });

  describe('ConfigManager.getConfigPath', () => {
    it('should return provided config path', () => {
      const customPath = '/custom/config.yaml';
      const manager = new ConfigManager(customPath);
      expect(manager.getConfigPath()).toBe(customPath);
    });

    it('should return resolved path when not provided', () => {
      const manager = new ConfigManager();
      const path = manager.getConfigPath();
      expect(path).toBeDefined();
      expect(typeof path).toBe('string');
    });
  });

  describe('resolveConfigPath', () => {
    it('should return provided path when given', () => {
      const customPath = '/custom/path.yaml';
      expect(resolveConfigPath(customPath)).toBe(customPath);
    });

    it('should return default path when not provided', () => {
      const path = resolveConfigPath();
      expect(path).toContain('.puppet-master');
      expect(path).toContain('config.yaml');
    });
  });

  describe('loadYamlFile', () => {
    it('should load valid YAML file', async () => {
      const yamlContent = `
test:
  key: value
  number: 123
`;
      await writeFile(testConfigPath, yamlContent, 'utf-8');

      const result = await loadYamlFile(testConfigPath);
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should throw on file not found', async () => {
      await expect(loadYamlFile('/nonexistent/file.yaml')).rejects.toThrow();
    });

    it('should throw on invalid YAML', async () => {
      const invalidYaml = 'invalid: yaml: [';
      await writeFile(testConfigPath, invalidYaml, 'utf-8');

      await expect(loadYamlFile(testConfigPath)).rejects.toThrow();
    });
  });
});
