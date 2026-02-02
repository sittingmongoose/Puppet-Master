/**
 * Installation Manager for RWM Puppet Master Doctor System
 * 
 * Maps failed doctor checks to installation commands and executes them.
 * 
 * Per BUILD_QUEUE_PHASE_6.md PH6-T06 (Installation Manager).
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { homedir } from 'node:os';
import path from 'node:path';
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
   * Installs a dependency for a failed check and returns detailed output.
   *
   * Intended for non-interactive callers (GUI/API) that need command output/error text.
   * This method does NOT print success/failure banners; it returns them to the caller.
   */
  async installWithResult(
    checkName: string,
    options: InstallOptions = {}
  ): Promise<InstallResult> {
    const cmd = this.getInstallCommand(checkName);
    if (!cmd) {
      return {
        success: false,
        error: `No install command found for check: ${checkName}`,
        command: '',
      };
    }

    const platform = this.getCurrentPlatform();
    if (!cmd.platforms.includes(platform)) {
      return {
        success: false,
        error: `Install command for ${checkName} is not supported on platform: ${platform}`,
        command: cmd.command,
      };
    }

    if (options.dryRun) {
      const sudoNote = cmd.requiresSudo ? '\nNote: requires elevated privileges.' : '';
      return {
        success: true,
        command: cmd.command,
        output: `[DRY RUN] Would execute: ${cmd.command}\nDescription: ${cmd.description}${sudoNote}`,
      };
    }

    if (!options.skipConfirmation) {
      const confirmed = await this.confirmInstallation(cmd);
      if (!confirmed) {
        return {
          success: false,
          error: 'Installation cancelled by user',
          command: cmd.command,
        };
      }
    }

    return this.executeCommand(cmd.command);
  }

  /**
   * Registers default install commands
   */
  private registerDefaultCommands(): void {
    // Cursor CLI installation
    // Unix: curl installer; Windows: winget
    const cursorCommand =
      this.getCurrentPlatform() === 'win32'
        ? 'winget install Cursor.Cursor --accept-package-agreements --accept-source-agreements'
        : 'curl https://cursor.com/install -fsSL | bash';
    this.registerCommand({
      check: 'cursor-cli',
      command: cursorCommand,
      description: 'Install Cursor Agent CLI',
      requiresSudo: false,
      platforms: ['darwin', 'linux', 'win32'],
    });

    // Codex CLI installation
    // Note: Puppet Master uses @openai/codex-sdk which requires both:
    // 1. Global CLI: npm install -g @openai/codex
    // 2. SDK package: npm install @openai/codex-sdk (handled as project dependency)
    this.registerCommand({
      check: 'codex-cli',
      command: 'npm install -g @openai/codex && npm install @openai/codex-sdk',
      description: 'Install Codex CLI and SDK package',
      requiresSudo: false,
      platforms: ['darwin', 'linux', 'win32'],
    });

    // Claude CLI installation - native installers per https://code.claude.com/docs/en/setup
    // Unix: curl | bash; Windows: PowerShell irm | iex (npm deprecated)
    const claudeCommand =
      this.getCurrentPlatform() === 'win32'
        ? 'powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://claude.ai/install.ps1 | iex"'
        : 'curl -fsSL https://claude.ai/install.sh | bash';
    this.registerCommand({
      check: 'claude-cli',
      command: claudeCommand,
      description: 'Install Claude CLI (native)',
      requiresSudo: false,
      platforms: ['darwin', 'linux', 'win32'],
    });

    // Playwright browser binaries installation
    this.registerCommand({
      check: 'playwright-browsers',
      command: 'npx playwright install',
      description: 'Install Playwright browser binaries',
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

    // GitHub Copilot SDK installation
    this.registerCommand({
      check: 'copilot-sdk',
      command: 'npm install @github/copilot-sdk',
      description: 'Install GitHub Copilot SDK (and ensure Copilot CLI is available)',
      requiresSudo: false,
      platforms: ['darwin', 'linux', 'win32'],
    });

    // GitHub Copilot CLI installation (used by SDK)
    // P0-G19: Corrected package name from @github/copilot-cli to @github/copilot
    this.registerCommand({
      check: 'copilot-cli',
      command: 'npm install -g @github/copilot',
      description: 'Install GitHub Copilot CLI',
      requiresSudo: false,
      platforms: ['darwin', 'linux', 'win32'],
    });

    // Gemini CLI installation
    // Supports npm (all platforms) and brew (macOS)
    const platform = this.getCurrentPlatform();
    const geminiCommand =
      platform === 'darwin'
        ? 'brew install gemini-cli || npm install -g @google/gemini-cli'
        : 'npm install -g @google/gemini-cli';
    this.registerCommand({
      check: 'gemini-cli',
      command: geminiCommand,
      description: 'Install Gemini CLI',
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
   * Validates that node and npm versions are compatible for installation
   * 
   * @returns Object with compatible flag and error message if incompatible
   */
  private async validateNodeNpmVersions(): Promise<{ compatible: boolean; error?: string; details?: string }> {
    try {
      const { spawn } = await import('node:child_process');
      
      // Get node version
      const nodeVersion = await new Promise<string>((resolve, reject) => {
        const proc = spawn('node', ['--version'], { stdio: ['ignore', 'pipe', 'pipe'] });
        let stdout = '';
        proc.stdout?.on('data', (data: Buffer) => { stdout += data.toString(); });
        proc.on('close', (code) => {
          if (code === 0) resolve(stdout.trim());
          else reject(new Error('Failed to get node version'));
        });
        proc.on('error', reject);
        setTimeout(() => { proc.kill(); reject(new Error('Timeout')); }, 5000);
      });

      // Get npm version
      const npmVersion = await new Promise<string>((resolve, reject) => {
        const proc = spawn('npm', ['--version'], { stdio: ['ignore', 'pipe', 'pipe'] });
        let stdout = '';
        proc.stdout?.on('data', (data: Buffer) => { stdout += data.toString(); });
        proc.on('close', (code) => {
          if (code === 0) resolve(stdout.trim());
          else reject(new Error('Failed to get npm version'));
        });
        proc.on('error', reject);
        setTimeout(() => { proc.kill(); reject(new Error('Timeout')); }, 5000);
      });

      // Parse versions
      const nodeMatch = nodeVersion.match(/v?(\d+)\.(\d+)\.(\d+)/);
      const npmMatch = npmVersion.match(/(\d+)\.(\d+)\.(\d+)/);

      if (!nodeMatch || !npmMatch) {
        return {
          compatible: false,
          error: 'Unable to parse node or npm version',
          details: `Node: ${nodeVersion}, npm: ${npmVersion}`,
        };
      }

      const nodeMajor = parseInt(nodeMatch[1], 10);
      const npmMajor = parseInt(npmMatch[1], 10);

      // Node 18+ requires npm 8+, Node 20+ requires npm 9+
      const requiredNpmVersion = nodeMajor >= 20 ? 9 : 8;

      if (npmMajor < requiredNpmVersion) {
        return {
          compatible: false,
          error: `npm version ${npmVersion} is not compatible with Node.js ${nodeVersion}`,
          details: `Node.js ${nodeMajor}.x requires npm ${requiredNpmVersion}.x or higher. Current npm: ${npmVersion}. Update with: npm install -g npm@latest`,
        };
      }

      return { compatible: true };
    } catch (error) {
      // If we can't check, assume compatible but log warning
      console.warn('[InstallationManager] Could not validate node/npm versions:', error);
      return { compatible: true };
    }
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
    return new Promise(async (resolve) => {
      // Validate node/npm versions before npm install commands
      if (command.includes('npm install')) {
        const validation = await this.validateNodeNpmVersions();
        if (!validation.compatible) {
          resolve({
            success: false,
            error: validation.error || 'Node/npm version incompatibility',
            command,
            output: validation.details,
          });
          return;
        }
      }

      const home = homedir();
      const npmGlobalPrefix = home ? path.join(home, '.npm-global') : '';
      const npmGlobalBin = npmGlobalPrefix
        ? (process.platform === 'win32' ? npmGlobalPrefix : path.join(npmGlobalPrefix, 'bin'))
        : '';
      const needsNpmGlobalPrefix = command.includes('npm install -g');

      // Build PATH that includes common tool locations (npm, brew, etc.)
      // When launched from a desktop shortcut (Tauri/Finder), the PATH may not
      // include /usr/local/bin, /opt/homebrew/bin, or ~/.local/bin.
      const extraPaths = [
        npmGlobalBin,
        '/usr/local/bin',
        '/opt/homebrew/bin',
        '/opt/homebrew/sbin',
        `${process.env.HOME}/.local/bin`,
        `${process.env.HOME}/.nvm/versions/node/*/bin`,
        '/usr/local/lib/puppet-master/node/bin',
        '/opt/puppet-master/node/bin',
      ].filter(Boolean);
      const currentPath = process.env.PATH || '/usr/bin:/bin';
      const enrichedPath = [...extraPaths, currentPath].join(':');
      const env: NodeJS.ProcessEnv = { ...process.env, PATH: enrichedPath };
      
      // CRITICAL FIX: Always use user-writable prefix for npm -g installs
      // This prevents EACCES errors when system node is in /opt or /usr/local
      if (needsNpmGlobalPrefix && npmGlobalPrefix) {
        env.npm_config_prefix = npmGlobalPrefix;
        if (npmGlobalBin) {
          env.PATH = [npmGlobalBin, env.PATH].filter(Boolean).join(path.delimiter);
        }
      }

      const proc: ChildProcess = spawn(command, [], {
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        env,
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
          // Enhanced error messages for common issues
          let errorMessage = `Command exited with code ${code}`;
          let actionableDetails = stderr || stdout || '';
          
          // EACCES - Permission denied
          if (actionableDetails.includes('EACCES') || actionableDetails.includes('permission denied')) {
            errorMessage = 'Permission denied - cannot write to system directories';
            actionableDetails = `${actionableDetails}\n\nACTION: The installer is trying to use user-writable directories (~/.npm-global), but npm may be configured to use system directories. Try:\n1. Run: npm config get prefix\n2. If it shows /usr/local or /opt, run: npm config set prefix ~/.npm-global\n3. Add ~/.npm-global/bin to your PATH\n4. Retry installation from Doctor page`;
          }
          
          // ENOTFOUND - Network error
          else if (actionableDetails.includes('ENOTFOUND') || actionableDetails.includes('getaddrinfo')) {
            errorMessage = 'Network error - cannot reach package registry';
            actionableDetails = `${actionableDetails}\n\nACTION: Check your internet connection and try again. If you're behind a proxy, configure npm proxy settings.`;
          }
          
          // ETARGET - Version not found
          else if (actionableDetails.includes('ETARGET') || actionableDetails.includes('No matching version')) {
            errorMessage = 'Package version not found';
            actionableDetails = `${actionableDetails}\n\nACTION: The requested package or version does not exist. Check the package name and try again.`;
          }
          
          // ERR_INVALID_URL - Invalid package name
          else if (actionableDetails.includes('ERR_INVALID_URL') || actionableDetails.includes('Invalid URL')) {
            errorMessage = 'Invalid package name or URL';
            actionableDetails = `${actionableDetails}\n\nACTION: Check that the package name is correct.`;
          }
          
          resolve({
            success: false,
            error: stderr ? errorMessage : `${errorMessage}${stderr ? `: ${stderr.trim()}` : ''}`,
            command,
            output: actionableDetails.trim(),
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
