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
import * as readline from 'readline';
import { CheckRegistry } from '../../doctor/check-registry.js';
import type { CheckCategory, CheckResult } from '../../doctor/check-registry.js';
import { InstallationManager } from '../../doctor/installation-manager.js';
import { DoctorReporter } from '../../doctor/doctor-reporter.js';
import type { ReportOptions } from '../../doctor/doctor-reporter.js';
import { ConfigManager } from '../../config/config-manager.js';
import { PlatformDetector } from '../../platforms/platform-detector.js';
import type { Platform } from '../../types/config.js';

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
  NpmNodeCompatibilityCheck,
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
  /** Filter checks by platforms (comma-separated) */
  platforms?: string;
  /** Attempt to install missing dependencies */
  fix?: boolean;
  /** Output results as JSON */
  json?: boolean;
  /** Show detailed output */
  verbose?: boolean;
  /** Path to config file (currently not used by checks, reserved for future) */
  config?: string;
  /** Interactive platform selection */
  interactive?: boolean;
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
  registry.register(new NpmNodeCompatibilityCheck());
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
 * Prompt user to select platforms interactively
 */
async function promptPlatformSelection(
  installedPlatforms: Platform[],
  allPlatforms: Platform[]
): Promise<Platform[]> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log('\nAvailable platforms:');
    allPlatforms.forEach((platform, index) => {
      const isInstalled = installedPlatforms.includes(platform);
      const status = isInstalled ? '[INSTALLED]' : '[NOT INSTALLED]';
      console.log(`  ${index + 1}. ${platform.charAt(0).toUpperCase() + platform.slice(1)} ${status}`);
    });
    console.log(`  ${allPlatforms.length + 1}. All installed platforms`);
    console.log(`  ${allPlatforms.length + 2}. All platforms (including uninstalled)`);
    console.log('  0. Cancel\n');

    rl.question('Select platforms to check (comma-separated numbers, or press Enter for all installed): ', (answer) => {
      rl.close();

      if (!answer.trim()) {
        // Default to all installed platforms
        resolve(installedPlatforms);
        return;
      }

      const selections = answer.split(',').map((s) => parseInt(s.trim(), 10));
      
      if (selections.includes(0)) {
        // Cancel
        process.exit(0);
      }

      if (selections.includes(allPlatforms.length + 1)) {
        // All installed platforms
        resolve(installedPlatforms);
        return;
      }

      if (selections.includes(allPlatforms.length + 2)) {
        // All platforms
        resolve(allPlatforms);
        return;
      }

      const selectedPlatforms: Platform[] = [];
      selections.forEach((num) => {
        if (num >= 1 && num <= allPlatforms.length) {
          selectedPlatforms.push(allPlatforms[num - 1]);
        }
      });

      resolve(selectedPlatforms.length > 0 ? selectedPlatforms : installedPlatforms);
    });
  });
}

/**
 * Parse platforms from comma-separated string
 */
function parsePlatforms(platformsStr: string): Platform[] {
  const validPlatforms: Platform[] = ['cursor', 'codex', 'claude', 'gemini', 'copilot'];
  const platforms = platformsStr.split(',').map((p) => p.trim().toLowerCase() as Platform);
  return platforms.filter((p) => validPlatforms.includes(p));
}

/**
 * Filter check results by selected platforms
 */
function filterResultsByPlatforms(results: CheckResult[], platforms: Platform[]): CheckResult[] {
  if (platforms.length === 0) {
    return results;
  }

  const platformCheckNames = new Set<string>();
  platforms.forEach((platform) => {
    platformCheckNames.add(`${platform}-cli`);
  });

  return results.filter((result) => {
    // Include platform-specific CLI checks
    if (platformCheckNames.has(result.name)) {
      return true;
    }
    // Include non-platform checks (git, runtime, project, etc.)
    if (!result.name.includes('-cli')) {
      return true;
    }
    // Exclude other platform checks
    return false;
  });
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
    // Load config
    const configManager = new ConfigManager(options.config);
    const config = await configManager.load();

    // Detect installed platforms
    const detector = new PlatformDetector(config.cliPaths);
    const detectionResult = await detector.detectInstalledPlatforms();
    const installedPlatforms = detectionResult.installedPlatforms;
    const allPlatforms: Platform[] = ['cursor', 'codex', 'claude', 'gemini', 'copilot'];

    // Determine which platforms to check
    let selectedPlatforms: Platform[] = [];
    
    if (options.platforms) {
      // Parse platforms from command line
      selectedPlatforms = parsePlatforms(options.platforms);
      if (selectedPlatforms.length === 0) {
        console.error('Error: Invalid platforms specified. Valid platforms: cursor, codex, claude, gemini, copilot');
        process.exit(1);
      }
    } else if (options.interactive || (!options.json && process.stdin.isTTY)) {
      // Interactive selection (if TTY and not JSON mode)
      selectedPlatforms = await promptPlatformSelection(installedPlatforms, allPlatforms);
    } else {
      // Default: use all installed platforms
      selectedPlatforms = installedPlatforms;
    }

    // Show selected platforms
    if (!options.json && selectedPlatforms.length > 0) {
      console.log(`\nChecking platforms: ${selectedPlatforms.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}\n`);
    }

    // Create check registry and register all checks
    const registry = await createCheckRegistry(options.config);

    // Run checks (all or filtered by category)
    let results: CheckResult[];
    if (options.category) {
      results = await registry.runCategory(options.category);
    } else {
      results = await registry.runAll();
    }

    // Filter results by selected platforms
    if (selectedPlatforms.length > 0) {
      results = filterResultsByPlatforms(results, selectedPlatforms);
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
      .option('--platforms <platforms>', 'Filter checks by platforms (comma-separated: cursor,codex,claude,gemini,copilot)')
      .option('--interactive', 'Interactively select platforms to check')
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
