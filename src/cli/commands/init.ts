/**
 * Init command - Initialize a new RWM Puppet Master project
 * 
 * Implements the `puppet-master init` command that:
 * - Creates the .puppet-master directory structure
 * - Generates a default config.yaml file
 * - Creates an initial AGENTS.md file
 */

import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { Command } from 'commander';
import yaml from 'js-yaml';
import { getDefaultConfig } from '../../config/default-config.js';
import type { PuppetMasterConfig } from '../../types/config.js';
import type { CommandModule } from './index.js';
import type { PRD } from '../../types/prd.js';

/**
 * Options for the init command
 */
export interface InitOptions {
  projectName?: string;
  force?: boolean;
}

/**
 * Convert camelCase string to snake_case
 */
function camelToSnake(str: string): string {
  // Special case: maxIterations stays as max_iterations (not max_attempts)
  return str.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

/**
 * Convert camelCase object keys to snake_case recursively
 * Handles nested objects and arrays
 */
function convertCamelCaseToSnakeCase(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertCamelCaseToSnakeCase(item));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnake(key);
    result[snakeKey] = convertCamelCaseToSnakeCase(value);
  }
  return result;
}

/**
 * Generate config.yaml content from default config
 */
function generateConfigYaml(projectName?: string): string {
  const config = getDefaultConfig();
  
  // Update project name if provided
  if (projectName) {
    config.project.name = projectName;
  }
  
  // Convert to snake_case for YAML output
  const snakeCaseConfig = convertCamelCaseToSnakeCase(config);
  
  // Use js-yaml to dump with proper formatting
  return yaml.dump(snakeCaseConfig, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  });
}

/**
 * Create the full directory structure
 */
async function createDirectoryStructure(baseDir: string): Promise<void> {
  const directories = [
    join(baseDir, 'requirements'),
    join(baseDir, 'plans'),
    join(baseDir, 'agents'),
    join(baseDir, 'capabilities'),
    join(baseDir, 'checkpoints'),
    join(baseDir, 'evidence', 'test-logs'),
    join(baseDir, 'evidence', 'screenshots'),
    join(baseDir, 'evidence', 'browser-traces'),
    join(baseDir, 'evidence', 'file-snapshots'),
    join(baseDir, 'evidence', 'metrics'),
    join(baseDir, 'evidence', 'gate-reports'),
    join(baseDir, 'logs', 'iterations'),
    join(baseDir, 'usage'),
  ];

  // Create all directories
  for (const dir of directories) {
    await mkdir(dir, { recursive: true });
  }
}

/**
 * Main init action
 */
export async function initAction(options: InitOptions): Promise<void> {
  const cwd = process.cwd();
  const puppetMasterDir = join(cwd, '.puppet-master');
  const configPath = join(puppetMasterDir, 'config.yaml');
  const agentsPath = join(cwd, 'AGENTS.md');
  const progressPath = join(cwd, 'progress.txt');
  const prdPath = join(puppetMasterDir, 'prd.json');
  const architecturePath = join(puppetMasterDir, 'architecture.md');

  // Check if .puppet-master already exists
  if (existsSync(puppetMasterDir)) {
    if (!options.force) {
      console.error(`Error: .puppet-master directory already exists at ${puppetMasterDir}`);
      console.error('Use --force to overwrite existing files');
      process.exit(1);
    }
  }

  try {
    // Create directory structure
    await createDirectoryStructure(puppetMasterDir);

    // Generate and write config.yaml
    const configYaml = generateConfigYaml(options.projectName);
    await writeFile(configPath, configYaml, 'utf-8');

    // Create schema-valid empty PRD scaffold (PrdManager.load requires phases[])
    const now = new Date().toISOString();
    const emptyPrd: PRD = {
      project: options.projectName ?? 'Untitled',
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      branchName: 'main',
      description: '',
      phases: [],
      metadata: {
        totalPhases: 0,
        completedPhases: 0,
        totalTasks: 0,
        completedTasks: 0,
        totalSubtasks: 0,
        completedSubtasks: 0,
      },
    };
    await writeFile(prdPath, `${JSON.stringify(emptyPrd, null, 2)}\n`, 'utf-8');

    // Create empty architecture.md
    await writeFile(architecturePath, '', 'utf-8');

    // Create empty progress.txt (do not clobber unless --force)
    if (existsSync(progressPath) && !options.force) {
      console.warn(`⚠️  Skipping existing file (use --force to overwrite): ${progressPath}`);
    } else {
      await writeFile(progressPath, '', 'utf-8');
    }

    // Create empty AGENTS.md at project root (do not clobber unless --force)
    if (existsSync(agentsPath) && !options.force) {
      console.warn(`⚠️  Skipping existing file (use --force to overwrite): ${agentsPath}`);
    } else {
      await writeFile(agentsPath, '', 'utf-8');
    }

    console.log('✅ Initialized RWM Puppet Master project');
    console.log(`   Created: ${puppetMasterDir}`);
    console.log(`   Created: ${configPath}`);
    console.log(`   Created: ${agentsPath}`);
    console.log(`   Created: ${progressPath}`);
  } catch (error) {
    console.error('Failed to initialize project:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * InitCommand class implementing CommandModule interface
 */
export class InitCommand implements CommandModule {
  /**
   * Register the init command with the Commander.js program
   */
  register(program: Command): void {
    program
      .command('init')
      .description('Initialize a new RWM Puppet Master project')
      .option('--project-name <name>', 'Project name (default: Untitled)')
      .option('--force', 'Overwrite existing files if .puppet-master already exists')
      .action(async (options: InitOptions) => {
        await initAction(options);
      });
  }
}

/**
 * Export singleton instance for registration
 */
export const initCommand = new InitCommand();
