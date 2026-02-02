/**
 * PRManager for RWM Puppet Master
 * 
 * Manages GitHub Pull Requests via gh CLI.
 * 
 * See REQUIREMENTS.md Section 27.3 for PR configuration details.
 */

import { spawn, type ChildProcess } from 'node:child_process';

/**
 * PR configuration
 */
export interface PRConfig {
  /** Whether PR creation is enabled */
  enabled: boolean;
  /** When to create PRs */
  createOn: 'task_complete' | 'phase_complete';
  /** Whether to auto-merge PRs */
  autoMerge: boolean;
  /** Whether reviews are required */
  requireReview: boolean;
  /** Optional PR template path */
  template?: string;
  /** Labels to apply to PRs */
  labels: string[];
}

/**
 * Information about a pull request
 */
export interface PRInfo {
  /** PR number */
  number: number;
  /** PR URL */
  url: string;
  /** PR title */
  title: string;
  /** PR state */
  state: 'open' | 'merged' | 'closed';
}

/**
 * Result of gh command execution
 */
interface GhResult {
  /** Standard output */
  stdout: string;
  /** Standard error output */
  stderr: string;
  /** Exit code */
  exitCode: number;
}

/**
 * Manages GitHub Pull Requests via gh CLI
 */
export class PRManager {
  private readonly workingDirectory: string;

  /**
   * Creates a new PRManager instance
   * @param workingDirectory - Git repository working directory
   */
  constructor(workingDirectory: string) {
    this.workingDirectory = workingDirectory;
  }

  /**
   * Check if gh CLI is available
   */
  async isAvailable(): Promise<boolean> {
    const result = await this.runGh(['--version']);
    return result.exitCode === 0;
  }

  /**
   * Create a pull request
   * @param title - PR title
   * @param body - PR body/description
   * @param base - Base branch (default: main)
   * @returns PRInfo with PR details
   * @throws Error if gh CLI is not available or PR creation fails
   */
  async createPR(title: string, body: string, base: string = 'main'): Promise<PRInfo> {
    const available = await this.isAvailable();
    if (!available) {
      throw new Error('gh CLI is not available');
    }

    const args = [
      'pr',
      'create',
      '--title',
      title,
      '--body',
      body,
      '--base',
      base,
      '--json',
      'number,url,title,state',
    ];

    const result = await this.runGh(args);
    if (result.exitCode !== 0) {
      throw new Error(`Failed to create PR: ${result.stderr || result.stdout}`);
    }

    try {
      const prData = JSON.parse(result.stdout.trim());
      // gh CLI returns an array with a single PR object
      const pr = Array.isArray(prData) ? prData[0] : prData;
      return {
        number: pr.number,
        url: pr.url,
        title: pr.title,
        state: pr.state.toLowerCase() as 'open' | 'merged' | 'closed',
      };
    } catch (error) {
      throw new Error(`Failed to parse PR response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get information about a PR by number
   * @param number - PR number
   * @returns PRInfo or null if PR not found
   */
  async getPR(number: number): Promise<PRInfo | null> {
    const available = await this.isAvailable();
    if (!available) {
      return null;
    }

    const args = ['pr', 'view', number.toString(), '--json', 'number,url,title,state'];
    const result = await this.runGh(args);
    if (result.exitCode !== 0) {
      return null;
    }

    try {
      const prData = JSON.parse(result.stdout.trim());
      const pr = Array.isArray(prData) ? prData[0] : prData;
      return {
        number: pr.number,
        url: pr.url,
        title: pr.title,
        state: pr.state.toLowerCase() as 'open' | 'merged' | 'closed',
      };
    } catch {
      return null;
    }
  }

  /**
   * Merge a pull request
   * @param number - PR number
   * @param method - Merge method (default: merge)
   * @returns true if merge succeeded, false otherwise
   */
  async mergePR(number: number, method: 'merge' | 'squash' | 'rebase' = 'merge'): Promise<boolean> {
    const available = await this.isAvailable();
    if (!available) {
      return false;
    }

    const args = ['pr', 'merge', number.toString(), '--' + method];
    const result = await this.runGh(args);
    return result.exitCode === 0;
  }

  /**
   * Add labels to a PR
   * @param number - PR number
   * @param labels - Labels to add
   */
  async addLabels(number: number, labels: string[]): Promise<void> {
    if (labels.length === 0) {
      return;
    }

    const available = await this.isAvailable();
    if (!available) {
      throw new Error('gh CLI is not available');
    }

    const args = ['pr', 'edit', number.toString(), '--add-label', labels.join(',')];
    const result = await this.runGh(args);
    if (result.exitCode !== 0) {
      throw new Error(`Failed to add labels: ${result.stderr || result.stdout}`);
    }
  }

  /**
   * Execute a gh CLI command
   * @param args - Command arguments
   * @returns Promise resolving to GhResult
   */
  private async runGh(args: string[]): Promise<GhResult> {
    return new Promise((resolve) => {
      const proc: ChildProcess = spawn('gh', args, {
        cwd: this.workingDirectory,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      if (proc.stdout) {
        proc.stdout.on('data', (data: Buffer) => {
          stdout += data.toString();
        });
      }

      if (proc.stderr) {
        proc.stderr.on('data', (data: Buffer) => {
          stderr += data.toString();
        });
      }

      proc.on('close', (exitCode: number | null) => {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: exitCode ?? -1,
        });
      });

      proc.on('error', () => {
        resolve({
          stdout: '',
          stderr: 'Failed to spawn gh process',
          exitCode: -1,
        });
      });
    });
  }
}
