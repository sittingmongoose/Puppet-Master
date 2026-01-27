/**
 * Config command - View and manage configuration
 *
 * Implements `puppet-master config`:
 * - `config show`  : display current configuration
 * - `config set`   : set a configuration value
 * - `config save`  : save configuration to file
 * - `config path`  : show config file path
 *
 * Enhanced CLI config management for feature parity with GUI.
 */

import { Command } from 'commander';
import { promises as fs } from 'fs';
import * as yaml from 'js-yaml';
import { ConfigManager } from '../../config/config-manager.js';
import type { PuppetMasterConfig } from '../../types/config.js';
import type { CommandModule } from './index.js';

export interface ConfigShowOptions {
  config?: string;
  json?: boolean;
  section?: string;
}

export interface ConfigSetOptions {
  config?: string;
}

export interface ConfigSaveOptions {
  config?: string;
  output?: string;
  format?: 'yaml' | 'json';
}

/**
 * Show current configuration
 */
export async function configShowAction(options: ConfigShowOptions): Promise<void> {
  try {
    const configManager = new ConfigManager(options.config);
    const config = await configManager.load();

    let output: unknown = config;

    // Filter to specific section if requested
    if (options.section) {
      const sections = options.section.split('.');
      let current: unknown = config;
      for (const section of sections) {
        if (current && typeof current === 'object' && section in current) {
          current = (current as Record<string, unknown>)[section];
        } else {
          console.error(`Section not found: ${options.section}`);
          process.exit(1);
        }
      }
      output = current;
    }

    if (options.json) {
      console.log(JSON.stringify(output, null, 2));
    } else {
      console.log(yaml.dump(output, { indent: 2, lineWidth: 100 }));
    }
  } catch (error) {
    console.error('Error loading configuration:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Set a configuration value
 */
export async function configSetAction(
  key: string,
  value: string,
  options: ConfigSetOptions
): Promise<void> {
  try {
    const configManager = new ConfigManager(options.config);
    const config = await configManager.load();

    // Parse the key path (e.g., "tiers.phase.model" -> ["tiers", "phase", "model"])
    const keyPath = key.split('.');
    
    // Navigate to the parent object
    let current: Record<string, unknown> = config as unknown as Record<string, unknown>;
    for (let i = 0; i < keyPath.length - 1; i++) {
      const segment = keyPath[i];
      if (!(segment in current) || typeof current[segment] !== 'object') {
        console.error(`Invalid key path: ${key}`);
        console.error(`Segment "${segment}" does not exist or is not an object.`);
        process.exit(1);
      }
      current = current[segment] as Record<string, unknown>;
    }

    const finalKey = keyPath[keyPath.length - 1];

    // Parse the value (try JSON first, then use as string)
    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(value);
    } catch {
      // If not valid JSON, try YAML
      try {
        parsedValue = yaml.load(value);
      } catch {
        // Use as plain string
        parsedValue = value;
      }
    }

    // Set the value
    current[finalKey] = parsedValue;

    // Save the updated config
    const configPath = configManager.getConfigPath();
    const configContent = yaml.dump(config, { indent: 2, lineWidth: 100 });
    await fs.writeFile(configPath, configContent, 'utf-8');

    console.log(`✓ Set ${key} = ${JSON.stringify(parsedValue)}`);
    console.log(`  Saved to: ${configPath}`);
  } catch (error) {
    console.error('Error setting configuration:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Save configuration to file
 */
export async function configSaveAction(options: ConfigSaveOptions): Promise<void> {
  try {
    const configManager = new ConfigManager(options.config);
    const config = await configManager.load();

    const format = options.format || 'yaml';
    const outputPath = options.output || configManager.getConfigPath();

    let content: string;
    if (format === 'json') {
      content = JSON.stringify(config, null, 2);
    } else {
      content = yaml.dump(config, { indent: 2, lineWidth: 100 });
    }

    await fs.writeFile(outputPath, content, 'utf-8');
    console.log(`✓ Configuration saved to: ${outputPath}`);
  } catch (error) {
    console.error('Error saving configuration:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Show config file path
 */
export async function configPathAction(options: { config?: string }): Promise<void> {
  try {
    const configManager = new ConfigManager(options.config);
    const configPath = configManager.getConfigPath();
    console.log(configPath);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

export class ConfigCommand implements CommandModule {
  register(program: Command): void {
    const configCmd = program
      .command('config')
      .description('View and manage configuration');

    configCmd
      .command('show')
      .description('Display current configuration')
      .option('-c, --config <path>', 'Path to config file')
      .option('--json', 'Output as JSON (default: YAML)')
      .option('-s, --section <path>', 'Show specific section (e.g., "tiers.phase")')
      .action(async (opts) => {
        await configShowAction({
          config: opts.config,
          json: opts.json,
          section: opts.section,
        });
      });

    configCmd
      .command('set <key> <value>')
      .description('Set a configuration value (e.g., config set tiers.phase.model "claude-sonnet-4")')
      .option('-c, --config <path>', 'Path to config file')
      .action(async (key: string, value: string, opts) => {
        await configSetAction(key, value, { config: opts.config });
      });

    configCmd
      .command('save')
      .description('Save configuration to file')
      .option('-c, --config <path>', 'Path to source config file')
      .option('-o, --output <path>', 'Output path (default: same as source)')
      .option('-f, --format <format>', 'Output format (yaml or json)', 'yaml')
      .action(async (opts) => {
        await configSaveAction({
          config: opts.config,
          output: opts.output,
          format: opts.format as 'yaml' | 'json',
        });
      });

    configCmd
      .command('path')
      .description('Show config file path')
      .option('-c, --config <path>', 'Path to config file')
      .action(async (opts) => {
        await configPathAction({ config: opts.config });
      });

    // Default to show if no subcommand
    configCmd
      .option('-c, --config <path>', 'Path to config file')
      .option('--json', 'Output as JSON')
      .action(async (opts) => {
        await configShowAction({ config: opts.config, json: opts.json });
      });
  }
}

export const configCommand = new ConfigCommand();
