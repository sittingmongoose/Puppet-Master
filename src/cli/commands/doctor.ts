/**
 * Doctor command - System health checks using CheckRegistry
 * 
 * Implements the `puppet-master doctor` command that:
 * - Runs all registered doctor checks via CheckRegistry
 * - Supports category filtering
 * - Supports automatic installation fixes
 * - Supports JSON and formatted output
 * - Uses DoctorReporter for formatted output
 * 
 * Per BUILD_QUEUE_PHASE_6.md PH6-T08 (CLI Doctor Command).
 */

import { Command } from 'commander';
import { CheckRegistry } from '../../doctor/check-registry.js';
import type { CheckCategory, CheckResult } from '../../doctor/check-registry.js';
import { InstallationManager } from '../../doctor/installation-manager.js';
import { DoctorReporter } from '../../doctor/doctor-reporter.js';
import type { ReportOptions } from '../../doctor/doctor-reporter.js';
import { ConfigManager } from '../../config/config-manager.js';

// CLI checks
import { CursorCliCheck } from '../../doctor/checks/cli-tools.js';
import { CodexCliCheck } from '../../doctor/checks/cli-tools.js';
import { ClaudeCliCheck } from '../../doctor/checks/cli-tools.js';
import { GeminiCliCheck } from '../../doctor/checks/cli-tools.js';
import { CopilotCliCheck } from '../../doctor/checks/cli-tools.js';
import { PlaywrightBrowsersCheck } from '../../doctor/checks/playwright-check.js';
import { UsageQuotaCheck } from '../../doctor/checks/usage-check.js';

// Git checks
import {
  GitAvailableCheck,
  GitConfigCheck,
  GitRepoCheck,
} from '../../doctor/checks/git-check.js';
import { SecretsCheck } from '../../doctor/checks/secrets-check.js';

// Runtime checks
import {
  NodeVersionCheck,
  NpmAvailableCheck,
} from '../../doctor/checks/runtime-check.js';

// Project checks
import {
  ProjectDirCheck,
  ConfigFileCheck,
  SubdirectoriesCheck,
} from '../../doctor/checks/project-check.js';

import type { CommandModule } from './index.js';

/**
 * Options for the doctor command
 */
export interface DoctorCommandOptions {
  /** Filter checks by category */
  category?: CheckCategory;
  /** Attempt to install missing dependencies */
  fix?: boolean;
  /** Output results as JSON */
  json?: boolean;
  /** Show detailed output */
  verbose?: boolean;
  /** Path to config file (currently not used by checks, reserved for future) */
  config?: string;
}

/**
 * Creates a CheckRegistry and registers all available checks
 * 
 * @param configPath - Optional config file path (currently unused)
 * @returns CheckRegistry instance with all checks registered
 */
async function createCheckRegistry(configPath?: string): Promise<CheckRegistry> {
  const registry = new CheckRegistry();
  const configManager = new ConfigManager(configPath);
  const config = await configManager.load();

  // Register CLI checks
  registry.register(new CursorCliCheck(config.cliPaths));
  registry.register(new CodexCliCheck(config.cliPaths));
  registry.register(new ClaudeCliCheck(config.cliPaths));
  registry.register(new GeminiCliCheck(config.cliPaths));
  registry.register(new CopilotCliCheck(config.cliPaths));

  // Register Git checks
  registry.register(new GitAvailableCheck());
  registry.register(new GitConfigCheck());
  registry.register(new GitRepoCheck());
  registry.register(new SecretsCheck());

  // Register Runtime checks
  registry.register(new NodeVersionCheck());
  registry.register(new NpmAvailableCheck());
  registry.register(new PlaywrightBrowsersCheck());

  // Register Project checks
  registry.register(new ProjectDirCheck());
  registry.register(new ConfigFileCheck());
  registry.register(new SubdirectoriesCheck());

  // P1: Register Usage/Quota checks
  registry.register(new UsageQuotaCheck());

  return registry;
}

/**
 * Attempts to fix failed checks by installing missing dependencies
 * 
 * @param failedResults - Array of failed check results
 * @param installationManager - InstallationManager instance
 * @returns Promise resolving when fix attempts are complete
 */
async function attemptFixes(
  failedResults: CheckResult[],
  installationManager: InstallationManager
): Promise<void> {
  console.log('\n🔧 Attempting to fix failed checks...\n');

  for (const result of failedResults) {
    const installCommand = installationManager.getInstallCommand(result.name);
    if (!installCommand) {
      console.log(`⚠ No install command available for: ${result.name}`);
      continue;
    }

    console.log(`Installing: ${installCommand.description}`);
    const success = await installationManager.install(result.name, {
      skipConfirmation: false, // Ask user for confirmation
    });

    if (success) {
      console.log(`✓ Successfully fixed: ${result.name}\n`);
    } else {
      console.log(`✗ Failed to fix: ${result.name}\n`);
    }
  }
}

/**
 * Main doctor action function
 * 
 * @param options - Doctor command options
 */
export async function doctorAction(
  options: DoctorCommandOptions
): Promise<void> {
  try {
    // Create check registry and register all checks
    const registry = await createCheckRegistry(options.config);

    // Run checks (all or filtered by category)
    let results: CheckResult[];
    if (options.category) {
      results = await registry.runCategory(options.category);
    } else {
      results = await registry.runAll();
    }

    // If --fix flag is set, attempt to install missing dependencies
    if (options.fix) {
      const installationManager = new InstallationManager();
      const failedResults = results.filter((r) => !r.passed);
      if (failedResults.length > 0) {
        await attemptFixes(failedResults, installationManager);
        // Re-run checks after fixes
        if (options.category) {
          results = await registry.runCategory(options.category);
        } else {
          results = await registry.runAll();
        }
      }
    }

    // Format and display results
    if (options.json) {
      // JSON output - output raw CheckResult array
      console.log(JSON.stringify(results, null, 2));
    } else {
      // Formatted output using DoctorReporter
      const reporterOptions: ReportOptions = {
        colors: true, // Enable colors by default
        verbose: options.verbose ?? false,
        groupByCategory: true,
      };

      const reporter = new DoctorReporter(reporterOptions);
      const formattedOutput = reporter.formatResults(results);
      console.log(formattedOutput);
    }

    // Exit with appropriate code
    const allPassed = results.every((r) => r.passed);
    if (allPassed) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error running doctor checks:', errorMessage);
    
    if (options.verbose && error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

/**
 * DoctorCommand class implementing CommandModule interface
 */
export class DoctorCommand implements CommandModule {
  /**
   * Register the doctor command with the Commander.js program
   */
  register(program: Command): void {
    program
      .command('doctor')
      .description('Run system health checks and validate configuration')
      .option('-c, --config <path>', 'Path to config file')
      .option('--category <cat>', 'Filter checks by category (cli, git, runtime, project, network)')
      .option('--fix', 'Attempt to install missing dependencies')
      .option('--json', 'Output results as JSON')
      .option('-v, --verbose', 'Show detailed output')
      .action(async (options: DoctorCommandOptions) => {
        await doctorAction(options);
      });
  }
}

/**
 * Export singleton instance for registration
 */
export const doctorCommand = new DoctorCommand();
