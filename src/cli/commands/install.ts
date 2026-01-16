/**
 * Install command - Install missing dependencies
 * 
 * Implements the `puppet-master install` command that:
 * - Runs doctor checks to identify missing tools
 * - Allows installing specific tools or all missing
 * - Confirms before installing (unless --yes)
 * - Uses InstallationManager to perform installations
 * 
 * Per BUILD_QUEUE_PHASE_10.md PH10-T04 (CLI Install Command).
 */

import { Command } from 'commander';
import * as readline from 'node:readline';
import { CheckRegistry } from '../../doctor/check-registry.js';
import type { CheckResult } from '../../doctor/check-registry.js';
import { InstallationManager } from '../../doctor/installation-manager.js';
import type { CommandModule } from './index.js';

// CLI checks
import { CursorCliCheck } from '../../doctor/checks/cli-tools.js';
import { CodexCliCheck } from '../../doctor/checks/cli-tools.js';
import { ClaudeCliCheck } from '../../doctor/checks/cli-tools.js';

// Git checks
import {
  GitAvailableCheck,
  GitConfigCheck,
  GitRepoCheck,
} from '../../doctor/checks/git-check.js';

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

/**
 * Options for the install command
 */
export interface InstallOptions {
  /** Specific tool to install (e.g., 'cursor', 'codex', 'claude') */
  tool?: string;
  /** Install all missing tools */
  all?: boolean;
  /** Skip confirmation prompt */
  yes?: boolean;
  /** Show what would be installed without actually installing */
  dryRun?: boolean;
}

/**
 * Creates a CheckRegistry and registers all available checks
 * 
 * Reuses the same pattern from doctor.ts to ensure consistency
 * 
 * @returns CheckRegistry instance with all checks registered
 */
function createCheckRegistry(): CheckRegistry {
  const registry = new CheckRegistry();

  // Register CLI checks
  registry.register(new CursorCliCheck());
  registry.register(new CodexCliCheck());
  registry.register(new ClaudeCliCheck());

  // Register Git checks
  registry.register(new GitAvailableCheck());
  registry.register(new GitConfigCheck());
  registry.register(new GitRepoCheck());

  // Register Runtime checks
  registry.register(new NodeVersionCheck());
  registry.register(new NpmAvailableCheck());

  // Register Project checks
  registry.register(new ProjectDirCheck());
  registry.register(new ConfigFileCheck());
  registry.register(new SubdirectoriesCheck());

  return registry;
}

/**
 * Maps check names to tool names for user-friendly display
 */
const checkNameToToolName: Record<string, string> = {
  'cursor-cli': 'Cursor CLI',
  'codex-cli': 'Codex CLI',
  'claude-cli': 'Claude CLI',
  'project-dir': 'Project Directory',
};

/**
 * Gets a user-friendly tool name from a check name
 */
function getToolName(checkName: string): string {
  return checkNameToToolName[checkName] || checkName;
}

/**
 * Confirms installation with the user
 * 
 * @param toolsToInstall - Array of check names that will be installed
 * @returns Promise resolving to true if user confirmed, false otherwise
 */
async function confirmInstallation(toolsToInstall: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\nThe following tools will be installed:');
    for (const tool of toolsToInstall) {
      console.log(`  - ${getToolName(tool)}`);
    }
    rl.question('\nProceed with installation? (y/N): ', (answer) => {
      rl.close();
      const confirmed =
        answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
      resolve(confirmed);
    });
  });
}

/**
 * Main install action function
 * 
 * @param options - Install command options
 */
export async function installAction(
  options: InstallOptions
): Promise<void> {
  try {
    // Create check registry and run checks
    const registry = createCheckRegistry();
    const results = await registry.runAll();

    // Filter to failed checks that have install commands
    const installationManager = new InstallationManager();
    const failedChecks = results.filter((r) => !r.passed);
    const installableChecks = failedChecks.filter((check) => {
      const installCmd = installationManager.getInstallCommand(check.name);
      return installCmd !== null;
    });

    if (installableChecks.length === 0) {
      console.log('✓ All required tools are already installed.');
      process.exit(0);
      return;
    }

    // Filter based on options
    let toolsToInstall: CheckResult[];
    if (options.tool) {
      // Find check by tool name (support both 'cursor' and 'cursor-cli')
      const toolName = options.tool.toLowerCase();
      const matchingCheck = installableChecks.find((check) => {
        const checkNameLower = check.name.toLowerCase();
        return (
          checkNameLower === toolName ||
          checkNameLower === `${toolName}-cli` ||
          checkNameLower.includes(toolName)
        );
      });

      if (!matchingCheck) {
        console.error(
          `Error: Tool "${options.tool}" not found or already installed.`
        );
        console.log('\nAvailable tools to install:');
        for (const check of installableChecks) {
          console.log(`  - ${getToolName(check.name)}`);
        }
        process.exit(1);
        return;
      }

      toolsToInstall = [matchingCheck];
    } else if (options.all) {
      toolsToInstall = installableChecks;
    } else {
      // No tool specified and --all not used, show what's available
      console.log('Missing tools detected:');
      for (const check of installableChecks) {
        console.log(`  - ${getToolName(check.name)}`);
      }
      console.log(
        '\nTo install a specific tool: puppet-master install <tool-name>'
      );
      console.log('To install all missing tools: puppet-master install --all');
      process.exit(0);
      return;
    }

    // Display what will be installed
    console.log('\n📦 Installation Plan:');
    for (const check of toolsToInstall) {
      const installCmd = installationManager.getInstallCommand(check.name);
      if (installCmd) {
        console.log(`  - ${getToolName(check.name)}`);
        if (options.dryRun) {
          console.log(`    Command: ${installCmd.command}`);
          console.log(`    Description: ${installCmd.description}`);
        }
      }
    }

    // Confirm with user (unless --yes or --dry-run)
    if (!options.yes && !options.dryRun) {
      const checkNames = toolsToInstall.map((c) => c.name);
      const confirmed = await confirmInstallation(checkNames);
      if (!confirmed) {
        console.log('Installation cancelled by user.');
        process.exit(0);
        return;
      }
    }

    // Perform installations
    let successCount = 0;
    let failureCount = 0;

    for (const check of toolsToInstall) {
      const installCmd = installationManager.getInstallCommand(check.name);
      if (!installCmd) {
        console.error(`⚠ No install command available for: ${check.name}`);
        failureCount++;
        continue;
      }

      if (options.dryRun) {
        console.log(`\n[DRY RUN] Would install: ${getToolName(check.name)}`);
        successCount++;
      } else {
        console.log(`\n🔧 Installing: ${getToolName(check.name)}...`);
        const success = await installationManager.install(check.name, {
          dryRun: false,
          skipConfirmation: true, // Already confirmed above
        });

        if (success) {
          console.log(`✓ Successfully installed: ${getToolName(check.name)}`);
          successCount++;
        } else {
          console.error(`✗ Failed to install: ${getToolName(check.name)}`);
          failureCount++;
        }
      }
    }

    // Report results
    console.log('\n📊 Installation Summary:');
    console.log(`  Successful: ${successCount}`);
    console.log(`  Failed: ${failureCount}`);

    if (failureCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error during installation:', errorMessage);
    process.exit(1);
  }
}

/**
 * InstallCommand class implementing CommandModule interface
 */
export class InstallCommand implements CommandModule {
  /**
   * Register the install command with the Commander.js program
   */
  register(program: Command): void {
    program
      .command('install [tool]')
      .description('Install missing dependencies detected by doctor checks')
      .option('--all', 'Install all missing tools')
      .option('--yes', 'Skip confirmation prompt')
      .option('--dry-run', 'Show what would be installed without installing')
      .action(async (tool: string | undefined, options: InstallOptions) => {
        // Merge tool argument into options
        const mergedOptions: InstallOptions = {
          ...options,
          tool: tool || options.tool,
        };
        await installAction(mergedOptions);
      });
  }
}

/**
 * Export singleton instance for registration
 */
export const installCommand = new InstallCommand();
