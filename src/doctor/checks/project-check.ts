/**
 * Project Setup Checks for RWM Puppet Master Doctor System
 * 
 * Provides checks for project directory structure, configuration file,
 * required subdirectories, and AGENTS.md presence.
 * 
 * Per BUILD_QUEUE_PHASE_6.md PH6-T05 (Project Setup Check).
 */

import { existsSync, statSync } from 'fs';
import { join } from 'path';
import type { DoctorCheck, CheckResult } from '../check-registry.js';
import { ConfigManager } from '../../config/config-manager.js';
import { ConfigValidationError } from '../../config/config-schema.js';

/**
 * Check that .puppet-master directory exists
 */
export class ProjectDirCheck implements DoctorCheck {
  readonly name = 'project-dir';
  readonly category = 'project';
  readonly description = 'Check that .puppet-master directory exists';

  async run(): Promise<CheckResult> {
    const cwd = process.cwd();
    const puppetMasterDir = join(cwd, '.puppet-master');

    if (!existsSync(puppetMasterDir)) {
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: '.puppet-master directory not found',
        fixSuggestion: 'Run puppet-master init to initialize',
        durationMs: 0,
      };
    }

    const stat = statSync(puppetMasterDir);
    if (!stat.isDirectory()) {
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: '.puppet-master exists but is not a directory',
        fixSuggestion: 'Remove .puppet-master and run puppet-master init',
        durationMs: 0,
      };
    }

    return {
      name: this.name,
      category: this.category,
      passed: true,
      message: '.puppet-master directory exists',
      durationMs: 0,
    };
  }
}

/**
 * Check that config.yaml exists and is valid
 */
export class ConfigFileCheck implements DoctorCheck {
  readonly name = 'config-file';
  readonly category = 'project';
  readonly description = 'Check that config.yaml exists and is valid';

  async run(): Promise<CheckResult> {
    const cwd = process.cwd();
    const configPath = join(cwd, '.puppet-master', 'config.yaml');

    if (!existsSync(configPath)) {
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: 'config.yaml not found',
        fixSuggestion: 'Run puppet-master init to create config.yaml',
        durationMs: 0,
      };
    }

    try {
      // Use ConfigManager to load and validate config
      // ConfigManager handles YAML parsing, snake_case conversion, and validation
      const configManager = new ConfigManager(configPath);
      await configManager.load();

      return {
        name: this.name,
        category: this.category,
        passed: true,
        message: 'config.yaml exists and is valid',
        durationMs: 0,
      };
    } catch (error) {
      if (error instanceof ConfigValidationError) {
        return {
          name: this.name,
          category: this.category,
          passed: false,
          message: `config.yaml is invalid: ${error.message}`,
          details: error.message,
          fixSuggestion: `Fix config.yaml: ${error.message}`,
          durationMs: 0,
        };
      }

      // YAML parsing error or other errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Failed to parse config.yaml: ${errorMessage}`,
        details: error instanceof Error ? error.stack : undefined,
        fixSuggestion: 'Fix YAML syntax errors in config.yaml',
        durationMs: 0,
      };
    }
  }
}

/**
 * Check that required subdirectories exist
 */
export class SubdirectoriesCheck implements DoctorCheck {
  readonly name = 'subdirectories';
  readonly category = 'project';
  readonly description = 'Check that required subdirectories exist';

  private readonly requiredDirs = ['checkpoints', 'evidence', 'logs', 'usage'];

  async run(): Promise<CheckResult> {
    const cwd = process.cwd();
    const puppetMasterDir = join(cwd, '.puppet-master');

    if (!existsSync(puppetMasterDir)) {
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: '.puppet-master directory not found',
        fixSuggestion: 'Run puppet-master init to initialize',
        durationMs: 0,
      };
    }

    const missingDirs: string[] = [];
    const existingDirs: string[] = [];

    for (const dir of this.requiredDirs) {
      const dirPath = join(puppetMasterDir, dir);
      if (existsSync(dirPath)) {
        const stat = statSync(dirPath);
        if (stat.isDirectory()) {
          existingDirs.push(dir);
        } else {
          missingDirs.push(dir);
        }
      } else {
        missingDirs.push(dir);
      }
    }

    if (missingDirs.length === 0) {
      return {
        name: this.name,
        category: this.category,
        passed: true,
        message: 'All required subdirectories exist',
        durationMs: 0,
      };
    }

    const details = `Missing directories: ${missingDirs.join(', ')}`;
    return {
      name: this.name,
      category: this.category,
      passed: false,
      message: `Missing ${missingDirs.length} required subdirector${missingDirs.length === 1 ? 'y' : 'ies'}`,
      details,
      fixSuggestion: 'Create missing directories',
      durationMs: 0,
    };
  }
}

/**
 * Check that AGENTS.md exists
 */
export class AgentsFileCheck implements DoctorCheck {
  readonly name = 'agents-file';
  readonly category = 'project';
  readonly description = 'Check that AGENTS.md exists';

  async run(): Promise<CheckResult> {
    const cwd = process.cwd();
    
    // Check in project root first
    const rootAgentsPath = join(cwd, 'AGENTS.md');
    if (existsSync(rootAgentsPath)) {
      const stat = statSync(rootAgentsPath);
      if (stat.isFile()) {
        return {
          name: this.name,
          category: this.category,
          passed: true,
          message: 'AGENTS.md exists in project root',
          durationMs: 0,
        };
      }
    }

    // Check in .puppet-master directory
    const puppetMasterAgentsPath = join(cwd, '.puppet-master', 'AGENTS.md');
    if (existsSync(puppetMasterAgentsPath)) {
      const stat = statSync(puppetMasterAgentsPath);
      if (stat.isFile()) {
        return {
          name: this.name,
          category: this.category,
          passed: true,
          message: 'AGENTS.md exists in .puppet-master directory',
          durationMs: 0,
        };
      }
    }

    // Not found - return warning (passed: false but not critical)
    return {
      name: this.name,
      category: this.category,
      passed: false,
      message: 'AGENTS.md not found in project root or .puppet-master',
      fixSuggestion: 'Create AGENTS.md file in project root',
      durationMs: 0,
    };
  }
}
