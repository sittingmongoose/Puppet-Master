/**
 * Doctor command - System health checks
 * 
 * Implements the `puppet-master doctor` command that:
 * - Checks CLI tool availability
 * - Checks Node.js version
 * - Checks Git availability
 * - Validates configuration
 * - Checks directory permissions
 */

import { spawn } from 'node:child_process';
import { access, constants } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { Command } from 'commander';
import { ConfigManager } from '../../config/config-manager.js';
import type { CommandModule } from './index.js';

/**
 * Options for the doctor command
 */
export interface DoctorOptions {
  config?: string;
  fix?: boolean;
  verbose?: boolean;
}

/**
 * Result of a check
 */
export interface CheckResult {
  passed: boolean;
  message: string;
  fixable?: boolean;
  fixCommand?: string;
}

/**
 * Interface for checks
 */
interface Check {
  name: string;
  description: string;
  run(): Promise<CheckResult>;
}

/**
 * Run a command and return stdout
 */
async function runCommand(cmd: string, args: string[], timeout = 5000): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { shell: true });
    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      proc.kill('SIGKILL');
      reject(new Error(`Command timed out after ${timeout}ms`));
    }, timeout);

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`Command failed: ${cmd} ${args.join(' ')}\n${stderr}`));
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

/**
 * Check if a command is available
 */
async function isCommandAvailable(cmd: string, args: string[] = ['--version']): Promise<boolean> {
  try {
    await runCommand(cmd, args, 5000);
    return true;
  } catch {
    return false;
  }
}

/**
 * Git check - verifies Git is installed and .git directory exists
 */
class GitCheck implements Check {
  readonly name = 'Git';
  readonly description = 'Check Git CLI and repository';

  async run(): Promise<CheckResult> {
    try {
      // Check Git CLI
      const gitAvailable = await isCommandAvailable('git', ['--version']);
      if (!gitAvailable) {
        return {
          passed: false,
          message: 'Git CLI not found',
          fixable: true,
          fixCommand: 'Install Git from https://git-scm.com/',
        };
      }

      // Check .git directory
      const gitDirExists = existsSync('.git');
      if (!gitDirExists) {
        return {
          passed: false,
          message: 'Not in a Git repository',
          fixable: true,
          fixCommand: 'Run `git init` to initialize a repository',
        };
      }

      return {
        passed: true,
        message: 'Git CLI available and in a Git repository',
      };
    } catch (error) {
      return {
        passed: false,
        message: `Git check failed: ${(error as Error).message}`,
      };
    }
  }
}

/**
 * Node.js version check - verifies Node.js >= 20
 */
class NodeVersionCheck implements Check {
  readonly name = 'Node.js Version';
  readonly description = 'Check Node.js version >= 20';

  async run(): Promise<CheckResult> {
    try {
      const version = process.version;
      // Parse version string (e.g., "v20.10.0")
      const match = version.match(/^v(\d+)\.(\d+)\.(\d+)/);
      if (!match) {
        return {
          passed: false,
          message: `Unable to parse Node.js version: ${version}`,
        };
      }

      const major = parseInt(match[1], 10);
      if (major < 20) {
        return {
          passed: false,
          message: `Node.js version ${version} is less than 20.0.0`,
          fixable: true,
          fixCommand: 'Install Node.js 20+ from https://nodejs.org/',
        };
      }

      return {
        passed: true,
        message: `Node.js version ${version} meets requirement (>= 20.0.0)`,
      };
    } catch (error) {
      return {
        passed: false,
        message: `Node.js version check failed: ${(error as Error).message}`,
      };
    }
  }
}

/**
 * Cursor CLI check
 */
class CursorCheck implements Check {
  readonly name = 'Cursor CLI';
  readonly description = 'Check Cursor CLI availability';

  async run(): Promise<CheckResult> {
    try {
      const available = await isCommandAvailable('cursor', ['--version']);
      if (available) {
        return {
          passed: true,
          message: 'Cursor CLI is available',
        };
      }

      return {
        passed: false,
        message: 'Cursor CLI not found',
        fixable: true,
        fixCommand: 'Install Cursor CLI or add to PATH',
      };
    } catch (error) {
      return {
        passed: false,
        message: `Cursor CLI check failed: ${(error as Error).message}`,
      };
    }
  }
}

/**
 * Codex CLI check
 */
class CodexCheck implements Check {
  readonly name = 'Codex CLI';
  readonly description = 'Check Codex CLI availability';

  async run(): Promise<CheckResult> {
    try {
      const available = await isCommandAvailable('codex', ['--version']);
      if (available) {
        return {
          passed: true,
          message: 'Codex CLI is available',
        };
      }

      return {
        passed: false,
        message: 'Codex CLI not found',
        fixable: true,
        fixCommand: 'Install Codex CLI or add to PATH',
      };
    } catch (error) {
      return {
        passed: false,
        message: `Codex CLI check failed: ${(error as Error).message}`,
      };
    }
  }
}

/**
 * Claude CLI check
 */
class ClaudeCheck implements Check {
  readonly name = 'Claude CLI';
  readonly description = 'Check Claude CLI availability';

  async run(): Promise<CheckResult> {
    try {
      const available = await isCommandAvailable('claude', ['--version']);
      if (available) {
        return {
          passed: true,
          message: 'Claude CLI is available',
        };
      }

      return {
        passed: false,
        message: 'Claude CLI not found',
        fixable: true,
        fixCommand: 'Install Claude CLI or add to PATH',
      };
    } catch (error) {
      return {
        passed: false,
        message: `Claude CLI check failed: ${(error as Error).message}`,
      };
    }
  }
}

/**
 * Config check - validates configuration file
 */
class ConfigCheck implements Check {
  readonly name = 'Configuration';
  readonly description = 'Check configuration file validity';
  private configPath?: string;

  constructor(configPath?: string) {
    this.configPath = configPath;
  }

  async run(): Promise<CheckResult> {
    try {
      const configManager = new ConfigManager(this.configPath);
      await configManager.load();
      return {
        passed: true,
        message: 'Configuration file is valid',
      };
    } catch (error) {
      return {
        passed: false,
        message: `Configuration validation failed: ${(error as Error).message}`,
        fixable: true,
        fixCommand: 'Fix configuration file or use --config to specify a valid config',
      };
    }
  }
}

/**
 * Directory check - verifies .puppet-master directory exists and is writable
 */
class DirectoryCheck implements Check {
  readonly name = 'Puppet Master Directory';
  readonly description = 'Check .puppet-master directory exists and is writable';

  async run(): Promise<CheckResult> {
    try {
      const dirPath = '.puppet-master';

      // Check if directory exists
      if (!existsSync(dirPath)) {
        return {
          passed: false,
          message: '.puppet-master directory does not exist',
          fixable: true,
          fixCommand: 'Run `mkdir -p .puppet-master` to create the directory',
        };
      }

      // Check write permissions
      try {
        await access(dirPath, constants.W_OK);
        return {
          passed: true,
          message: '.puppet-master directory exists and is writable',
        };
      } catch {
        return {
          passed: false,
          message: '.puppet-master directory exists but is not writable',
          fixable: true,
          fixCommand: 'Fix directory permissions for .puppet-master',
        };
      }
    } catch (error) {
      return {
        passed: false,
        message: `Directory check failed: ${(error as Error).message}`,
      };
    }
  }
}

/**
 * Print check result
 */
function printCheckResult(check: Check, result: CheckResult, verbose: boolean): void {
  const icon = result.passed ? '✅' : '❌';
  console.log(`${icon} ${check.name}: ${result.message}`);

  if (verbose && result.fixable && result.fixCommand) {
    console.log(`   Fix: ${result.fixCommand}`);
  }
}

/**
 * Main doctor action
 */
export async function doctorAction(options: DoctorOptions): Promise<void> {
  console.log('\n🔍 Running system checks...\n');
  console.log('='.repeat(60));

  const checks: Check[] = [
    new GitCheck(),
    new NodeVersionCheck(),
    new CursorCheck(),
    new CodexCheck(),
    new ClaudeCheck(),
    new ConfigCheck(options.config),
    new DirectoryCheck(),
  ];

  let allPassed = true;
  const results: Array<{ check: Check; result: CheckResult }> = [];

  for (const check of checks) {
    try {
      const result = await check.run();
      results.push({ check, result });
      printCheckResult(check, result, options.verbose ?? false);

      if (!result.passed) {
        allPassed = false;
        // TODO: Implement fix logic if options.fix is true
      }
    } catch (error) {
      const result: CheckResult = {
        passed: false,
        message: `Check failed: ${(error as Error).message}`,
      };
      results.push({ check, result });
      printCheckResult(check, result, options.verbose ?? false);
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(60));

  if (allPassed) {
    console.log('\n✅ All checks passed');
    process.exit(0);
  } else {
    console.log('\n❌ Some checks failed');
    if (!options.verbose) {
      console.log('Run with --verbose to see fix suggestions');
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
      .description('Check system configuration and dependencies')
      .option('-c, --config <path>', 'Path to config file')
      .option('--fix', 'Attempt to fix issues (not implemented in basic version)')
      .option('-v, --verbose', 'Show detailed output')
      .action(async (options: DoctorOptions) => {
        await doctorAction(options);
      });
  }
}

/**
 * Export singleton instance for registration
 */
export const doctorCommand = new DoctorCommand();
