/**
 * Installation Manager for RWM Puppet Master Doctor System
 * 
 * Maps failed doctor checks to installation commands and executes them.
 * 
 * Per BUILD_QUEUE_PHASE_6.md PH6-T06 (Installation Manager).
 */

import { spawn, type ChildProcess } from 'node:child_process';
import * as readline from 'node:readline';

/**
 * Platform type for installation commands
 */
export type Platform = 'darwin' | 'linux' | 'win32';

/**
 * Installation command definition
 */
export interface InstallCommand {
  /** Check name that triggers this install */
  check: string;
  /** Shell command to execute */
  command: string;
  /** Human-readable description */
  description: string;
  /** Whether command needs elevated privileges */
  requiresSudo: boolean;
  /** Supported platforms */
  platforms: Platform[];
}

/**
 * Options for installation
 */
export interface InstallOptions {
  /** If true, only log the command without executing */
  dryRun?: boolean;
  /** If true, skip user confirmation */
  skipConfirmation?: boolean;
}

/**
 * Installation result
 */
export interface InstallResult {
  /** Whether installation succeeded */
  success: boolean;
  /** Error message if installation failed */
  error?: string;
  /** Command that was executed */
  command: string;
  /** Output from the command */
  output?: string;
}

/**
 * Manager for installing missing dependencies
 * 
 * Maps failed doctor checks to installation commands and provides
 * methods to execute them with user confirmation.
 */
export class InstallationManager {
  private readonly commands = new Map<string, InstallCommand>();

  constructor() {
    this.registerDefaultCommands();
  }

  /**
   * Registers a custom install command
   * 
   * @param cmd - Install command to register
   */
  registerCommand(cmd: InstallCommand): void {
    this.commands.set(cmd.check, cmd);
  }

  /**
   * Gets the install command for a check name
   * 
   * @param checkName - Name of the check
   * @returns InstallCommand if found, null otherwise
   */
  getInstallCommand(checkName: string): InstallCommand | null {
    return this.commands.get(checkName) ?? null;
  }

  /**
   * Gets all available install commands for the current platform
   * 
   * @returns Array of InstallCommand instances for current platform
   */
  getAvailableInstalls(): InstallCommand[] {
    const platform = this.getCurrentPlatform();
    return Array.from(this.commands.values()).filter((cmd) =>
      cmd.platforms.includes(platform)
    );
  }

  /**
   * Gets the current OS platform
   * 
   * @returns Platform string ('darwin', 'linux', or 'win32')
   */
  getCurrentPlatform(): Platform {
    const platform = process.platform;
    if (platform === 'darwin') return 'darwin';
    if (platform === 'linux') return 'linux';
    if (platform === 'win32') return 'win32';
    // Default to linux for other Unix-like systems
    return 'linux';
  }

  /**
   * Installs a dependency for a failed check
   * 
   * @param checkName - Name of the check that failed
   * @param options - Installation options
   * @returns Promise resolving to true if installation succeeded, false otherwise
   */
  async install(
    checkName: string,
    options: InstallOptions = {}
  ): Promise<boolean> {
    const cmd = this.getInstallCommand(checkName);
    if (!cmd) {
      console.error(`No install command found for check: ${checkName}`);
      return false;
    }

    const platform = this.getCurrentPlatform();
    if (!cmd.platforms.includes(platform)) {
      console.error(
        `Install command for ${checkName} is not supported on platform: ${platform}`
      );
      return false;
    }

    // Dry run mode - just log the command
    if (options.dryRun) {
      console.log(`[DRY RUN] Would execute: ${cmd.command}`);
      console.log(`Description: ${cmd.description}`);
      if (cmd.requiresSudo) {
        console.log('Note: This command requires elevated privileges');
      }
      return true;
    }

    // Confirm with user before executing
    if (!options.skipConfirmation) {
      const confirmed = await this.confirmInstallation(cmd);
      if (!confirmed) {
        console.log('Installation cancelled by user');
        return false;
      }
    }

    // Execute the installation
    try {
      const result = await this.executeCommand(cmd.command);
      if (result.success) {
        console.log(`✓ Successfully installed: ${cmd.description}`);
        if (result.output) {
          console.log(result.output);
        }
        return true;
      } else {
        console.error(`✗ Installation failed: ${cmd.description}`);
        if (result.error) {
          console.error(`Error: ${result.error}`);
        }
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`✗ Installation error: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Registers default install commands
   */
  private registerDefaultCommands(): void {
    // Cursor CLI installation
    this.registerCommand({
      check: 'cursor-cli',
      command: 'curl https://cursor.com/install -fsSL | bash',
      description: 'Install Cursor Agent CLI',
      requiresSudo: false,
      platforms: ['darwin', 'linux'],
    });

    // Codex CLI installation
    this.registerCommand({
      check: 'codex-cli',
      command: 'npm install -g @openai/codex',
      description: 'Install Codex CLI',
      requiresSudo: false,
      platforms: ['darwin', 'linux', 'win32'],
    });

    // Claude CLI installation - prefer curl-based install for Unix, npm for Windows
    const claudeCommand =
      this.getCurrentPlatform() === 'win32'
        ? 'npm install -g @anthropic-ai/claude-code'
        : 'curl -fsSL https://claude.ai/install.sh | bash';
    this.registerCommand({
      check: 'claude-cli',
      command: claudeCommand,
      description: 'Install Claude CLI',
      requiresSudo: false,
      platforms: ['darwin', 'linux', 'win32'],
    });

    // Project directory initialization
    this.registerCommand({
      check: 'project-dir',
      command: 'puppet-master init',
      description: 'Initialize project directory',
      requiresSudo: false,
      platforms: ['darwin', 'linux', 'win32'],
    });
  }

  /**
   * Confirms installation with the user
   * 
   * @param cmd - Install command to confirm
   * @returns Promise resolving to true if user confirmed, false otherwise
   */
  private async confirmInstallation(cmd: InstallCommand): Promise<boolean> {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      console.log(`\nInstallation: ${cmd.description}`);
      console.log(`Command: ${cmd.command}`);
      if (cmd.requiresSudo) {
        console.log('⚠ This command requires elevated privileges');
      }
      rl.question('Proceed with installation? (y/N): ', (answer) => {
        rl.close();
        const confirmed =
          answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
        resolve(confirmed);
      });
    });
  }

  /**
   * Executes a shell command
   * 
   * @param command - Command to execute
   * @param timeout - Timeout in milliseconds (default: 300000 = 5 minutes)
   * @returns Promise resolving to install result
   */
  private async executeCommand(
    command: string,
    timeout: number = 300000
  ): Promise<InstallResult> {
    return new Promise((resolve) => {
      const proc: ChildProcess = spawn(command, [], {
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      const timer = setTimeout(() => {
        proc.kill('SIGKILL');
        resolve({
          success: false,
          error: `Command timed out after ${timeout}ms`,
          command,
        });
      }, timeout);

      proc.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      proc.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) {
          resolve({
            success: true,
            command,
            output: stdout || stderr,
          });
        } else {
          resolve({
            success: false,
            error: `Command exited with code ${code}${stderr ? `: ${stderr.trim()}` : ''}`,
            command,
            output: stderr || stdout,
          });
        }
      });

      proc.on('error', (error) => {
        clearTimeout(timer);
        resolve({
          success: false,
          error: error.message,
          command,
        });
      });
    });
  }
}
