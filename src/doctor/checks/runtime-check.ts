/**
 * Runtime Environment Checks for RWM Puppet Master Doctor System
 * 
 * Provides checks for Node.js, npm, yarn, and Python runtime environments.
 * 
 * Per BUILD_QUEUE_PHASE_6.md PH6-T04 (Runtime Check).
 */

import { spawn } from 'child_process';
import { homedir } from 'node:os';
import { delimiter, join } from 'node:path';
import semver from 'semver';
import type { DoctorCheck, CheckResult } from '../check-registry.js';

/**
 * Build env with enriched PATH so node/npm are found when GUI or CLI runs with minimal PATH
 * (e.g. systemd, packaged app). Matches pattern used in cli-tools.ts and login routes.
 */
function getEnrichedEnv(): NodeJS.ProcessEnv {
  const home = homedir();
  const npmGlobalPrefix = home ? join(home, '.npm-global') : '';
  const npmGlobalBin = npmGlobalPrefix
    ? (process.platform === 'win32' ? npmGlobalPrefix : join(npmGlobalPrefix, 'bin'))
    : '';
  const extraPaths = [
    npmGlobalBin,
    join(home, '.local', 'bin'),
    '/usr/local/bin',
    '/opt/homebrew/bin',
    '/opt/homebrew/sbin',
  ].filter(Boolean);
  const currentPath = process.env.PATH || '';
  const enrichedPath = [...extraPaths, currentPath].filter(Boolean).join(delimiter);
  const env: NodeJS.ProcessEnv = { ...process.env, PATH: enrichedPath };
  if (npmGlobalPrefix) {
    env.HOME = home;
    env.npm_config_prefix = npmGlobalPrefix;
    env.NPM_CONFIG_PREFIX = npmGlobalPrefix;
  }
  return env;
}

/**
 * Parsed version information
 */
interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
}

/**
 * Executes a command and returns stdout output.
 *
 * @param command - Command to execute
 * @param args - Command arguments
 * @param timeout - Timeout in milliseconds (default: 5000)
 * @param env - Optional env (e.g. getEnrichedEnv()) so command is found when PATH is minimal
 * @returns Promise resolving to stdout output
 */
async function runCommand(
  command: string,
  args: string[],
  timeout = 5000,
  env?: NodeJS.ProcessEnv
): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      env: env ?? process.env,
    });

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
        reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
      }
    });

    proc.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

/**
 * Parses a version string into major, minor, patch components.
 * 
 * Handles various version formats:
 * - "v18.0.0" -> { major: 18, minor: 0, patch: 0 }
 * - "18.0.0" -> { major: 18, minor: 0, patch: 0 }
 * - "Python 3.8.5" -> { major: 3, minor: 8, patch: 5 }
 * 
 * @param versionString - Version string to parse
 * @returns Parsed version object
 * @throws Error if version cannot be parsed
 */
export function parseVersion(versionString: string): ParsedVersion {
  // Extract version number from string (handles "v18.0.0", "18.0.0", "Python 3.8.5", etc.)
  const versionMatch = versionString.match(/(\d+)\.(\d+)\.(\d+)/);
  
  if (!versionMatch) {
    throw new Error(`Unable to parse version from: ${versionString}`);
  }

  return {
    major: parseInt(versionMatch[1], 10),
    minor: parseInt(versionMatch[2], 10),
    patch: parseInt(versionMatch[3], 10),
  };
}

/**
 * Compares two version objects.
 * 
 * @param v1 - First version
 * @param v2 - Second version
 * @returns -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
export function compareVersions(v1: ParsedVersion, v2: ParsedVersion): -1 | 0 | 1 {
  if (v1.major !== v2.major) {
    return v1.major > v2.major ? 1 : -1;
  }
  if (v1.minor !== v2.minor) {
    return v1.minor > v2.minor ? 1 : -1;
  }
  if (v1.patch !== v2.patch) {
    return v1.patch > v2.patch ? 1 : -1;
  }
  return 0;
}

/**
 * Check for Node.js version (minimum 18.0.0)
 */
export class NodeVersionCheck implements DoctorCheck {
  readonly name = 'node-version';
  readonly category = 'runtime' as const;
  readonly description = 'Checks Node.js version meets minimum requirement (18.0.0)';

  private readonly minimumVersion = '18.0.0';

  async run(): Promise<CheckResult> {
    const env = getEnrichedEnv();
    try {
      const output = await runCommand('node', ['--version'], 5000, env);
      const version = output.trim();

      // Use semver for proper comparison
      if (semver.gte(version, this.minimumVersion)) {
        return {
          name: this.name,
          category: this.category,
          passed: true,
          message: `Node.js version ${version} meets minimum requirement (${this.minimumVersion})`,
          details: `Found version: ${version}`,
          durationMs: 0, // Will be set by registry
        };
      } else {
        return {
          name: this.name,
          category: this.category,
          passed: false,
          message: `Node.js version ${version} is below minimum requirement (${this.minimumVersion})`,
          details: `Found version: ${version}, required: ${this.minimumVersion}`,
          fixSuggestion: 'Install Node.js 18+ from https://nodejs.org',
          durationMs: 0,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Node.js not found or version check failed: ${errorMessage}`,
        details: error instanceof Error ? error.stack : undefined,
        fixSuggestion: 'Install Node.js 18+ from https://nodejs.org',
        durationMs: 0,
      };
    }
  }
}

/**
 * Check for npm availability and configuration
 */
export class NpmAvailableCheck implements DoctorCheck {
  readonly name = 'npm-available';
  readonly category = 'runtime' as const;
  readonly description = 'Checks if npm is available, reports version, and validates configuration';

  async run(): Promise<CheckResult> {
    const env = getEnrichedEnv();
    try {
      const output = await runCommand('npm', ['--version'], 5000, env);
      const version = output.trim();

      // Check npm prefix configuration
      let prefixWarning = '';
      let prefixDetails = '';
      try {
        const prefix = await runCommand('npm', ['config', 'get', 'prefix'], 3000, env);
        const prefixPath = prefix.trim();
        
        // Check if prefix points to system directory (requires sudo for -g installs)
        const isSystemPrefix = prefixPath.startsWith('/usr/local') || 
                               prefixPath.startsWith('/opt/') || 
                               prefixPath === '/usr';
        
        if (isSystemPrefix) {
          prefixWarning = ' WARNING: npm prefix is set to a system directory, which may cause EACCES errors during global installations.';
          prefixDetails = `\n\nCurrent prefix: ${prefixPath}\nRecommended: Set to user-writable directory like ~/.npm-global\nFix: Run 'npm config set prefix ~/.npm-global' and add ~/.npm-global/bin to your PATH`;
        } else {
          prefixDetails = `\n\nCurrent prefix: ${prefixPath} (user-writable ✓)`;
        }
      } catch (error) {
        prefixWarning = ' (could not check npm prefix configuration)';
      }

      return {
        name: this.name,
        category: this.category,
        passed: !prefixWarning.includes('WARNING'),
        message: `npm is available (version ${version})${prefixWarning}`,
        details: `Found version: ${version}${prefixDetails}`,
        fixSuggestion: prefixWarning.includes('WARNING') 
          ? 'Run: npm config set prefix ~/.npm-global\nThen add to PATH: export PATH=~/.npm-global/bin:$PATH'
          : undefined,
        durationMs: 0,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `npm not found: ${errorMessage}`,
        details: error instanceof Error ? error.stack : undefined,
        fixSuggestion: 'Install npm (usually comes with Node.js from https://nodejs.org)',
        durationMs: 0,
      };
    }
  }
}

/**
 * Check for yarn availability (optional)
 */
export class YarnAvailableCheck implements DoctorCheck {
  readonly name = 'yarn-available';
  readonly category = 'runtime' as const;
  readonly description = 'Checks if yarn is available (optional, warns if not found)';

  async run(): Promise<CheckResult> {
    const env = getEnrichedEnv();
    try {
      const output = await runCommand('yarn', ['--version'], 5000, env);
      const version = output.trim();

      return {
        name: this.name,
        category: this.category,
        passed: true,
        message: `yarn is available (version ${version})`,
        details: `Found version: ${version}`,
        durationMs: 0,
      };
    } catch (error) {
      // Yarn is optional, so we warn but don't fail
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `yarn not found (optional): ${errorMessage}`,
        details: 'yarn is optional and not required for RWM Puppet Master',
        fixSuggestion: 'Install yarn with: npm install -g yarn (optional)',
        durationMs: 0,
      };
    }
  }
}

/**
 * Check for Python version (optional, minimum 3.8)
 */
export class PythonVersionCheck implements DoctorCheck {
  readonly name = 'python-version';
  readonly category = 'runtime' as const;
  readonly description = 'Checks Python version meets minimum requirement (3.8, optional)';

  private readonly minimumVersion: ParsedVersion = { major: 3, minor: 8, patch: 0 };

  async run(): Promise<CheckResult> {
    const env = getEnrichedEnv();
    // Try python3 first, then python
    let output: string;
    let command: string;

    try {
      output = await runCommand('python3', ['--version'], 5000, env);
      command = 'python3';
    } catch {
      try {
        output = await runCommand('python', ['--version'], 5000, env);
        command = 'python';
      } catch (error) {
        // Python is optional, so we warn but don't fail
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          name: this.name,
          category: this.category,
          passed: false,
          message: `Python not found (optional): ${errorMessage}`,
          details: 'Python is optional and not required for RWM Puppet Master',
          fixSuggestion: 'Install Python 3.8+ from https://www.python.org (optional)',
          durationMs: 0,
        };
      }
    }

    try {
      const versionString = output.trim();
      const parsedVersion = parseVersion(versionString);
      const comparison = compareVersions(parsedVersion, this.minimumVersion);

      if (comparison >= 0) {
        return {
          name: this.name,
          category: this.category,
          passed: true,
          message: `Python version ${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch} meets minimum requirement (3.8.0)`,
          details: `Found version: ${versionString} (via ${command})`,
          durationMs: 0,
        };
      } else {
        return {
          name: this.name,
          category: this.category,
          passed: false,
          message: `Python version ${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch} is below minimum requirement (3.8.0)`,
          details: `Found version: ${versionString}, required: 3.8.0`,
          fixSuggestion: 'Install Python 3.8+ from https://www.python.org (optional)',
          durationMs: 0,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Unable to parse Python version: ${errorMessage}`,
        details: `Output: ${output}`,
        fixSuggestion: 'Install Python 3.8+ from https://www.python.org (optional)',
        durationMs: 0,
      };
    }
  }
}

/**
 * Check for npm/node version compatibility
 */
export class NpmNodeCompatibilityCheck implements DoctorCheck {
  readonly name = 'npm-node-compatibility';
  readonly category = 'runtime' as const;
  readonly description = 'Checks that npm and Node.js versions are compatible';

  async run(): Promise<CheckResult> {
    const env = getEnrichedEnv();
    try {
      // Get Node version
      const nodeOutput = await runCommand('node', ['--version'], 5000, env);
      const nodeVersion = nodeOutput.trim();
      
      // Get npm version
      const npmOutput = await runCommand('npm', ['--version'], 5000, env);
      const npmVersion = npmOutput.trim();

      // Parse versions
      const nodeMatch = nodeVersion.match(/v?(\d+)\.(\d+)\.(\d+)/);
      const npmMatch = npmVersion.match(/(\d+)\.(\d+)\.(\d+)/);

      if (!nodeMatch || !npmMatch) {
        return {
          name: this.name,
          category: this.category,
          passed: false,
          message: 'Unable to parse node or npm version',
          details: `Node: ${nodeVersion}, npm: ${npmVersion}`,
          durationMs: 0,
        };
      }

      const nodeMajor = parseInt(nodeMatch[1], 10);
      const nodeMinor = parseInt(nodeMatch[2], 10);
      const npmMajor = parseInt(npmMatch[1], 10);
      const npmMinor = parseInt(npmMatch[2], 10);

      // Compatibility matrix:
      // Node 18.x requires npm 8.x+
      // Node 20.x requires npm 9.x+
      // Node 22.x requires npm 10.x+
      let requiredNpmMajor = 8;
      let passed = true;
      let warning = '';

      if (nodeMajor >= 22) {
        requiredNpmMajor = 10;
      } else if (nodeMajor >= 20) {
        requiredNpmMajor = 9;
      } else if (nodeMajor >= 18) {
        requiredNpmMajor = 8;
      }

      if (npmMajor < requiredNpmMajor) {
        passed = false;
        warning = ` (requires npm ${requiredNpmMajor}.x+)`;
      } else if (npmMajor === requiredNpmMajor && npmMinor < 0) {
        // Warn if using exact minimum version
        warning = ' (consider updating npm)';
      }

      const message = passed
        ? `npm ${npmVersion} is compatible with Node.js ${nodeVersion}`
        : `npm ${npmVersion} is not compatible with Node.js ${nodeVersion}${warning}`;

      return {
        name: this.name,
        category: this.category,
        passed,
        message,
        details: `Node.js: ${nodeVersion} (requires npm ${requiredNpmMajor}.x+)\nnpm: ${npmVersion}${passed ? ' ✓' : ' ✗'}`,
        fixSuggestion: passed ? undefined : `Update npm: npm install -g npm@latest\n\nThis will update npm to the latest version compatible with your Node.js version.`,
        durationMs: 0,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Could not check npm/node compatibility: ${errorMessage}`,
        details: error instanceof Error ? error.stack : undefined,
        durationMs: 0,
      };
    }
  }
}
