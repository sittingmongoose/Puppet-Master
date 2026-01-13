/**
 * GitManager for RWM Puppet Master
 * 
 * Manages git operations using child_process.spawn.
 * Logs all operations to git-actions.log in JSONL format per STATE_FILES.md Section 7.3.
 * 
 * See REQUIREMENTS.md Section 27 for git protocol details.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { appendFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * Result of a git command execution
 */
export interface GitResult {
  /** Whether the command succeeded (exit code 0) */
  success: boolean;
  /** Standard output from the command */
  stdout: string;
  /** Standard error output from the command */
  stderr: string;
  /** Exit code from the command */
  exitCode: number;
}

/**
 * Options for commit operation
 */
export interface CommitOptions {
  /** Commit message */
  message: string;
  /** Specific files to commit (if not provided, commits all staged files) */
  files?: string[];
  /** Whether to amend the previous commit */
  amend?: boolean;
}

/**
 * Options for push operation
 */
export interface PushOptions {
  /** Remote name (default: origin) */
  remote?: string;
  /** Branch name (default: current branch) */
  branch?: string;
  /** Whether to force push */
  force?: boolean;
}

/**
 * Information about a git commit
 */
export interface CommitInfo {
  /** Full commit SHA */
  sha: string;
  /** Short commit SHA (7 characters) */
  shortSha: string;
  /** Commit message */
  message: string;
  /** Author name and email */
  author: string;
  /** Commit date (ISO format) */
  date: string;
}

/**
 * Working directory status
 */
export interface GitStatus {
  /** Current branch name */
  branch: string;
  /** List of staged files */
  staged: string[];
  /** List of modified files */
  modified: string[];
  /** List of untracked files */
  untracked: string[];
  /** Number of commits ahead of remote */
  ahead: number;
  /** Number of commits behind remote */
  behind: number;
}

/**
 * Log entry for git actions log
 */
export interface GitLogEntry {
  /** Timestamp in ISO format */
  timestamp: string;
  /** Action name (commit, push, checkout, etc.) */
  action: string;
  /** Command arguments (optional) */
  args?: string[];
  /** Result: success or failure */
  result: 'success' | 'failure';
  /** Commit message (for commit actions) */
  message?: string;
  /** Commit SHA (for commit actions) */
  sha?: string;
  /** Branch name (for branch operations) */
  branch?: string;
  /** Remote name (for push/pull operations) */
  remote?: string;
  /** Additional metadata */
  [key: string]: unknown;
}

/**
 * GitManager handles all git operations
 */
export class GitManager {
  private readonly workingDirectory: string;
  private readonly logPath: string;

  /**
   * Creates a new GitManager instance
   * @param workingDirectory - Git repository working directory
   * @param logPath - Path to git-actions.log file (default: .puppet-master/logs/git-actions.log)
   */
  constructor(workingDirectory: string, logPath?: string) {
    this.workingDirectory = workingDirectory;
    this.logPath = logPath || '.puppet-master/logs/git-actions.log';
  }

  /**
   * Ensures the log directory exists
   */
  private async ensureLogDirectory(): Promise<void> {
    const dir = dirname(this.logPath);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }

  /**
   * Executes a git command using spawn
   * @param args - Git command arguments
   * @returns Promise resolving to GitResult
   */
  private async run(args: string[]): Promise<GitResult> {
    return new Promise((resolve) => {
      const proc: ChildProcess = spawn('git', args, {
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
          success: exitCode === 0,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: exitCode ?? -1,
        });
      });

      proc.on('error', () => {
        resolve({
          success: false,
          stdout: '',
          stderr: 'Failed to spawn git process',
          exitCode: -1,
        });
      });
    });
  }

  /**
   * Logs a git action to git-actions.log
   * @param action - Action name
   * @param result - Git command result
   * @param metadata - Additional metadata to include in log
   */
  private async logAction(
    action: string,
    result: GitResult,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.ensureLogDirectory();

    const logEntry: GitLogEntry = {
      timestamp: new Date().toISOString(),
      action,
      args: metadata?.args as string[] | undefined,
      result: result.success ? 'success' : 'failure',
      ...metadata,
    };

    // Remove undefined values
    Object.keys(logEntry).forEach((key) => {
      if (logEntry[key] === undefined) {
        delete logEntry[key];
      }
    });

    const jsonLine = JSON.stringify(logEntry) + '\n';
    await appendFile(this.logPath, jsonLine, 'utf-8');
  }

  /**
   * Checks if git is available on the system
   * @returns Promise resolving to true if git is available
   */
  async isAvailable(): Promise<boolean> {
    const result = await this.run(['--version']);
    await this.logAction('check_availability', result);
    return result.success;
  }

  /**
   * Gets the git version
   * @returns Promise resolving to version string
   */
  async getVersion(): Promise<string> {
    const result = await this.run(['--version']);
    if (result.success) {
      return result.stdout;
    }
    throw new Error(`Failed to get git version: ${result.stderr}`);
  }

  /**
   * Gets the current branch name
   * @returns Promise resolving to branch name
   */
  async getCurrentBranch(): Promise<string> {
    const result = await this.run(['rev-parse', '--abbrev-ref', 'HEAD']);
    if (result.success) {
      return result.stdout;
    }
    
    // If HEAD doesn't exist (no commits), try to get branch from symbolic-ref
    const symbolicRefResult = await this.run(['symbolic-ref', '--short', 'HEAD']);
    if (symbolicRefResult.success) {
      return symbolicRefResult.stdout;
    }
    
    throw new Error(`Failed to get current branch: ${result.stderr}`);
  }

  /**
   * Stages files for commit
   * @param files - Files to stage (use '.' for all files)
   * @returns Promise resolving to GitResult
   */
  async add(files: string[] | '.'): Promise<GitResult> {
    const args = files === '.' ? ['add', '.'] : ['add', ...files];
    const result = await this.run(args);
    await this.logAction('add', result, { files: files === '.' ? '.' : files });
    return result;
  }

  /**
   * Creates a commit
   * @param options - Commit options
   * @returns Promise resolving to GitResult with commit SHA in stdout if successful
   */
  async commit(options: CommitOptions): Promise<GitResult> {
    // Stage files if specified
    if (options.files && options.files.length > 0) {
      const addResult = await this.add(options.files);
      if (!addResult.success) {
        await this.logAction('commit', addResult, { message: options.message });
        return addResult;
      }
    }

    // Build commit command
    const args = ['commit', '-m', options.message];
    if (options.amend) {
      args.push('--amend', '--no-edit');
    }

    const result = await this.run(args);

    // Get commit SHA if successful
    let sha: string | undefined;
    if (result.success) {
      const shaResult = await this.run(['rev-parse', 'HEAD']);
      if (shaResult.success) {
        sha = shaResult.stdout;
      }
    }

    await this.logAction('commit', result, {
      message: options.message,
      sha,
      files_count: options.files?.length,
    });

    return result;
  }

  /**
   * Pushes to remote repository
   * @param options - Push options
   * @returns Promise resolving to GitResult
   */
  async push(options?: PushOptions): Promise<GitResult> {
    const remote = options?.remote || 'origin';
    const branch = options?.branch || (await this.getCurrentBranch());
    const args = ['push', remote, branch];
    
    if (options?.force) {
      args.push('--force');
    }

    const result = await this.run(args);
    await this.logAction('push', result, {
      branch,
      remote,
      result: result.success ? 'success' : 'failure',
    });

    return result;
  }

  /**
   * Pulls from remote repository
   * @param remote - Remote name (default: origin)
   * @returns Promise resolving to GitResult
   */
  async pull(remote: string = 'origin'): Promise<GitResult> {
    const branch = await this.getCurrentBranch();
    const result = await this.run(['pull', remote, branch]);
    await this.logAction('pull', result, { branch, remote });
    return result;
  }

  /**
   * Checks out a branch or commit
   * @param branchOrCommit - Branch name or commit SHA
   * @returns Promise resolving to GitResult
   */
  async checkout(branchOrCommit: string): Promise<GitResult> {
    const result = await this.run(['checkout', branchOrCommit]);
    await this.logAction('checkout', result, { branch: branchOrCommit });
    return result;
  }

  /**
   * Creates a new branch
   * @param name - Branch name
   * @param checkout - Whether to checkout the branch after creating (default: true)
   * @returns Promise resolving to GitResult
   */
  async createBranch(name: string, checkout: boolean = true): Promise<GitResult> {
    const result = await this.run(['branch', name]);
    
    if (result.success && checkout) {
      const checkoutResult = await this.checkout(name);
      await this.logAction('branch_create', result, { name, base: await this.getCurrentBranch().catch(() => 'unknown') });
      return checkoutResult;
    }

    await this.logAction('branch_create', result, { name });
    return result;
  }

  /**
   * Deletes a branch
   * @param name - Branch name
   * @param force - Whether to force delete (default: false)
   * @returns Promise resolving to GitResult
   */
  async deleteBranch(name: string, force: boolean = false): Promise<GitResult> {
    const args = ['branch', force ? '-D' : '-d', name];
    const result = await this.run(args);
    await this.logAction('branch_delete', result, { name, force });
    return result;
  }

  /**
   * Merges a branch into the current branch
   * @param branch - Branch to merge
   * @returns Promise resolving to GitResult
   */
  async merge(branch: string): Promise<GitResult> {
    const currentBranch = await this.getCurrentBranch();
    const result = await this.run(['merge', branch]);
    await this.logAction('merge', result, {
      source: branch,
      target: currentBranch,
    });
    return result;
  }

  /**
   * Stashes changes
   * @param message - Optional stash message
   * @returns Promise resolving to GitResult
   */
  async stash(message?: string): Promise<GitResult> {
    const args = message ? ['stash', 'push', '-m', message] : ['stash'];
    const result = await this.run(args);
    await this.logAction('stash', result, { message });
    return result;
  }

  /**
   * Pops the most recent stash
   * @returns Promise resolving to GitResult
   */
  async stashPop(): Promise<GitResult> {
    const result = await this.run(['stash', 'pop']);
    await this.logAction('stash_pop', result);
    return result;
  }

  /**
   * Gets recent commits
   * @param count - Number of commits to retrieve (default: 10)
   * @returns Promise resolving to array of CommitInfo
   */
  async getRecentCommits(count: number = 10): Promise<CommitInfo[]> {
    const result = await this.run([
      'log',
      `-${count}`,
      '--pretty=format:%H|%h|%s|%an <%ae>|%ai',
      '--no-merges',
    ]);

    if (!result.success) {
      return [];
    }

    const commits: CommitInfo[] = [];
    const lines = result.stdout.split('\n').filter((line) => line.trim().length > 0);

    for (const line of lines) {
      const parts = line.split('|');
      if (parts.length === 5) {
        commits.push({
          sha: parts[0],
          shortSha: parts[1],
          message: parts[2],
          author: parts[3],
          date: parts[4],
        });
      }
    }

    return commits;
  }

  /**
   * Gets the working directory status
   * @returns Promise resolving to GitStatus
   */
  async getStatus(): Promise<GitStatus> {
    // Get branch name
    const branchResult = await this.run(['rev-parse', '--abbrev-ref', 'HEAD']);
    const branch = branchResult.success ? branchResult.stdout : 'unknown';

    // Get status in porcelain format
    const statusResult = await this.run(['status', '--porcelain', '-b']);
    if (!statusResult.success) {
      throw new Error(`Failed to get git status: ${statusResult.stderr}`);
    }

    const staged: string[] = [];
    const modified: string[] = [];
    const untracked: string[] = [];

    const lines = statusResult.stdout.split('\n');
    for (const line of lines) {
      if (line.startsWith('##')) {
        // Branch info line, parse ahead/behind
        continue;
      }

      const trimmed = line.trim();
      if (trimmed.length === 0) {
        continue;
      }

      const status = trimmed.substring(0, 2);
      const file = trimmed.substring(3);

      if (status[0] === '?' && status[1] === '?') {
        untracked.push(file);
      } else if (status[0] !== ' ' && status[0] !== '?') {
        staged.push(file);
      } else if (status[1] !== ' ' && status[1] !== '?') {
        modified.push(file);
      }
    }

    // Get ahead/behind counts
    let ahead = 0;
    let behind = 0;
    const branchInfoResult = await this.run(['status', '-sb']);
    if (branchInfoResult.success) {
      const branchLine = branchInfoResult.stdout.split('\n')[0];
      const aheadMatch = branchLine.match(/ahead (\d+)/);
      const behindMatch = branchLine.match(/behind (\d+)/);
      ahead = aheadMatch ? parseInt(aheadMatch[1], 10) : 0;
      behind = behindMatch ? parseInt(behindMatch[1], 10) : 0;
    }

    return {
      branch,
      staged,
      modified,
      untracked,
      ahead,
      behind,
    };
  }

  /**
   * Gets the diff
   * @param staged - Whether to show staged diff (default: false, shows working directory diff)
   * @returns Promise resolving to diff string
   */
  async diff(staged: boolean = false): Promise<string> {
    const args = staged ? ['diff', '--cached'] : ['diff'];
    const result = await this.run(args);
    
    if (!result.success) {
      throw new Error(`Failed to get diff: ${result.stderr}`);
    }

    return result.stdout;
  }
}
