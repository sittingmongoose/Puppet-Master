/**
 * WorktreeManager for RWM Puppet Master
 *
 * Manages git worktrees for parallel subtask execution.
 * Each parallel agent gets an isolated worktree to work in,
 * preventing file conflicts during concurrent execution.
 *
 * See BUILD_QUEUE_IMPROVEMENTS.md P2-T01 for requirements.
 * Pattern inspired by Zeroshot implementation.
 */

import { mkdir, rm, access } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { GitManager } from './git-manager.js';
import type { GitResult } from './git-manager.js';

/**
 * Information about a single worktree
 */
export interface WorktreeInfo {
  /** Unique agent identifier */
  agentId: string;
  /** Absolute path to worktree directory */
  path: string;
  /** Branch name for this worktree */
  branch: string;
  /** Base branch this worktree was created from */
  baseBranch: string;
  /** Creation timestamp */
  createdAt: string;
  /** Current status */
  status: 'active' | 'merging' | 'merged' | 'conflict' | 'destroyed';
}

/**
 * Result of a merge operation
 */
export interface MergeResult {
  /** Whether the merge succeeded */
  success: boolean;
  /** Files with conflicts (if any) */
  conflictFiles: string[];
  /** The worktree branch that was merged */
  sourceBranch: string;
  /** The target branch merged into */
  targetBranch: string;
  /** Merge commit SHA (if successful) */
  mergeCommitSha?: string;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Configuration for WorktreeManager
 */
export interface WorktreeConfig {
  /** Base directory for worktrees (default: .puppet-master/worktrees) */
  worktreeDir: string;
  /** Whether to cleanup worktree immediately after merge (default: true) */
  cleanupOnMerge: boolean;
  /** Prefix for worktree branch names (default: worktree/) */
  branchPrefix: string;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: WorktreeConfig = {
  worktreeDir: '.puppet-master/worktrees',
  cleanupOnMerge: true,
  branchPrefix: 'worktree/',
};

/**
 * WorktreeManager handles git worktree operations for parallel execution
 */
export class WorktreeManager {
  private readonly gitManager: GitManager;
  private readonly projectRoot: string;
  private readonly config: WorktreeConfig;
  private readonly worktrees: Map<string, WorktreeInfo> = new Map();

  /**
   * Creates a new WorktreeManager instance
   * @param projectRoot - Root directory of the git repository
   * @param gitManager - GitManager instance for git operations
   * @param config - Optional configuration overrides
   */
  constructor(
    projectRoot: string,
    gitManager: GitManager,
    config?: Partial<WorktreeConfig>
  ) {
    this.projectRoot = resolve(projectRoot);
    this.gitManager = gitManager;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get the full path to the worktree directory
   */
  private getWorktreeBasePath(): string {
    return join(this.projectRoot, this.config.worktreeDir);
  }

  /**
   * Get the full path for a specific agent's worktree
   */
  private getWorktreePath(agentId: string): string {
    return join(this.getWorktreeBasePath(), agentId);
  }

  /**
   * Generate branch name for a worktree
   */
  private generateBranchName(agentId: string): string {
    return `${this.config.branchPrefix}${agentId}`;
  }

  /**
   * Execute a git command in the project root
   */
  private async gitExec(args: string[]): Promise<GitResult> {
    // Use a temporary GitManager pointed at project root for worktree commands
    const rootGit = new GitManager(this.projectRoot);
    return this.executeGitCommand(rootGit, args);
  }

  /**
   * Execute a git command using spawn (matches GitManager pattern)
   */
  private async executeGitCommand(gitManager: GitManager, args: string[]): Promise<GitResult> {
    // GitManager doesn't expose a raw execute method, so we need to use spawn directly
    const { spawn } = await import('node:child_process');
    
    return new Promise((resolve) => {
      const proc = spawn('git', args, {
        cwd: this.projectRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      proc.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      proc.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

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
   * Ensure the worktree base directory exists
   */
  private async ensureWorktreeDir(): Promise<void> {
    const basePath = this.getWorktreeBasePath();
    await mkdir(basePath, { recursive: true });
  }

  /**
   * Creates a new worktree for an agent
   * @param agentId - Unique identifier for the agent
   * @param baseBranch - Optional base branch to create from (defaults to current branch)
   * @returns Path to the created worktree
   */
  async createWorktree(agentId: string, baseBranch?: string): Promise<string> {
    // Check if worktree already exists for this agent
    if (this.worktrees.has(agentId)) {
      const existing = this.worktrees.get(agentId)!;
      if (existing.status === 'active') {
        throw new Error(`Worktree already exists for agent: ${agentId}`);
      }
    }

    await this.ensureWorktreeDir();

    // Get current branch if base not specified
    const currentBranch = baseBranch || await this.gitManager.getCurrentBranch();
    const worktreePath = this.getWorktreePath(agentId);
    const branchName = this.generateBranchName(agentId);

    // Create the worktree with a new branch
    const result = await this.gitExec([
      'worktree', 'add',
      '-b', branchName,
      worktreePath,
      currentBranch,
    ]);

    if (!result.success) {
      throw new Error(`Failed to create worktree for ${agentId}: ${result.stderr}`);
    }

    // Track the worktree
    const info: WorktreeInfo = {
      agentId,
      path: worktreePath,
      branch: branchName,
      baseBranch: currentBranch,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    this.worktrees.set(agentId, info);

    return worktreePath;
  }

  /**
   * Destroys a worktree for an agent
   * @param agentId - Agent identifier
   * @param force - Force removal even if there are uncommitted changes
   */
  async destroyWorktree(agentId: string, force: boolean = false): Promise<void> {
    const info = this.worktrees.get(agentId);
    if (!info) {
      // Worktree not tracked, try to remove anyway
      const worktreePath = this.getWorktreePath(agentId);
      await this.removeWorktreeByPath(worktreePath, force);
      return;
    }

    // Remove the worktree
    const args = ['worktree', 'remove'];
    if (force) {
      args.push('--force');
    }
    args.push(info.path);

    const result = await this.gitExec(args);

    if (!result.success) {
      // Try force removal of the directory if git worktree remove fails
      if (force) {
        try {
          await rm(info.path, { recursive: true, force: true });
        } catch {
          // Ignore cleanup errors
        }
      } else {
        throw new Error(`Failed to destroy worktree for ${agentId}: ${result.stderr}`);
      }
    }

    // Delete the branch if it still exists
    const branchName = info.branch;
    await this.gitExec(['branch', '-D', branchName]).catch(() => {
      // Ignore branch deletion errors (branch may already be deleted)
    });

    // Update tracking
    info.status = 'destroyed';
    this.worktrees.delete(agentId);
  }

  /**
   * Remove a worktree by path (used for cleanup)
   */
  private async removeWorktreeByPath(path: string, force: boolean = false): Promise<void> {
    const args = ['worktree', 'remove'];
    if (force) {
      args.push('--force');
    }
    args.push(path);

    const result = await this.gitExec(args);
    if (!result.success && force) {
      // Force directory removal as fallback
      try {
        await rm(path, { recursive: true, force: true });
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Merges a worktree branch back into the target branch
   * @param agentId - Agent identifier
   * @param targetBranch - Branch to merge into (defaults to base branch)
   * @returns MergeResult indicating success or conflict details
   */
  async mergeWorktree(agentId: string, targetBranch?: string): Promise<MergeResult> {
    const info = this.worktrees.get(agentId);
    if (!info) {
      throw new Error(`No worktree found for agent: ${agentId}`);
    }

    const target = targetBranch || info.baseBranch;
    info.status = 'merging';

    // First, checkout the target branch in the main repo
    const checkoutResult = await this.gitExec(['checkout', target]);
    if (!checkoutResult.success) {
      info.status = 'active';
      return {
        success: false,
        conflictFiles: [],
        sourceBranch: info.branch,
        targetBranch: target,
        error: `Failed to checkout target branch: ${checkoutResult.stderr}`,
      };
    }

    // Attempt to merge the worktree branch
    const mergeResult = await this.gitExec(['merge', '--no-ff', info.branch, '-m', `Merge ${info.branch} (agent: ${agentId})`]);

    if (mergeResult.success) {
      // Get the merge commit SHA
      const shaResult = await this.gitExec(['rev-parse', 'HEAD']);
      const mergeCommitSha = shaResult.success ? shaResult.stdout : undefined;

      info.status = 'merged';

      // Cleanup if configured
      if (this.config.cleanupOnMerge) {
        await this.destroyWorktree(agentId, true).catch(() => {
          // Log but don't fail on cleanup errors
        });
      }

      return {
        success: true,
        conflictFiles: [],
        sourceBranch: info.branch,
        targetBranch: target,
        mergeCommitSha,
      };
    }

    // Merge failed - check for conflicts
    info.status = 'conflict';
    const conflictFiles = await this.getConflictFiles();

    // Abort the merge to leave clean state
    await this.gitExec(['merge', '--abort']);

    return {
      success: false,
      conflictFiles,
      sourceBranch: info.branch,
      targetBranch: target,
      error: mergeResult.stderr || 'Merge conflict detected',
    };
  }

  /**
   * Get list of files with conflicts
   */
  private async getConflictFiles(): Promise<string[]> {
    const result = await this.gitExec(['diff', '--name-only', '--diff-filter=U']);
    if (!result.success || !result.stdout) {
      return [];
    }
    return result.stdout.split('\n').filter(line => line.trim().length > 0);
  }

  /**
   * Lists all tracked worktrees
   */
  listWorktrees(): WorktreeInfo[] {
    return Array.from(this.worktrees.values());
  }

  /**
   * Gets information about a specific worktree
   */
  getWorktree(agentId: string): WorktreeInfo | undefined {
    return this.worktrees.get(agentId);
  }

  /**
   * Checks if a worktree exists for an agent
   */
  hasWorktree(agentId: string): boolean {
    return this.worktrees.has(agentId);
  }

  /**
   * Lists all git worktrees (including those not tracked by this manager)
   */
  async listGitWorktrees(): Promise<Array<{ path: string; branch: string; commit: string }>> {
    const result = await this.gitExec(['worktree', 'list', '--porcelain']);
    if (!result.success) {
      return [];
    }

    const worktrees: Array<{ path: string; branch: string; commit: string }> = [];
    const lines = result.stdout.split('\n');
    
    let currentWorktree: { path: string; branch: string; commit: string } | null = null;
    
    for (const line of lines) {
      if (line.startsWith('worktree ')) {
        if (currentWorktree) {
          worktrees.push(currentWorktree);
        }
        currentWorktree = { path: line.substring(9), branch: '', commit: '' };
      } else if (line.startsWith('HEAD ') && currentWorktree) {
        currentWorktree.commit = line.substring(5);
      } else if (line.startsWith('branch ') && currentWorktree) {
        currentWorktree.branch = line.substring(7).replace('refs/heads/', '');
      }
    }
    
    if (currentWorktree) {
      worktrees.push(currentWorktree);
    }

    return worktrees;
  }

  /**
   * Cleans up all worktrees managed by this instance
   * @param force - Force removal even with uncommitted changes
   */
  async cleanupAll(force: boolean = true): Promise<void> {
    const agentIds = Array.from(this.worktrees.keys());
    
    for (const agentId of agentIds) {
      try {
        await this.destroyWorktree(agentId, force);
      } catch {
        // Continue cleanup even if individual worktrees fail
      }
    }
  }

  /**
   * Cleans up orphaned worktrees (worktrees in the directory but not tracked)
   * Useful for crash recovery
   */
  async cleanupOrphanedWorktrees(): Promise<string[]> {
    const cleaned: string[] = [];
    const basePath = this.getWorktreeBasePath();

    // Check if base path exists
    try {
      await access(basePath);
    } catch {
      return cleaned; // Directory doesn't exist, nothing to clean
    }

    // Get all git worktrees
    const gitWorktrees = await this.listGitWorktrees();
    
    // Find worktrees in our directory that aren't tracked
    for (const wt of gitWorktrees) {
      if (wt.path.startsWith(basePath)) {
        // Extract agent ID from path
        const agentId = wt.path.substring(basePath.length + 1);
        
        if (!this.worktrees.has(agentId)) {
          // Orphaned worktree - clean it up
          try {
            await this.removeWorktreeByPath(wt.path, true);
            
            // Also try to delete the branch
            if (wt.branch.startsWith(this.config.branchPrefix)) {
              await this.gitExec(['branch', '-D', wt.branch]).catch(() => {});
            }
            
            cleaned.push(wt.path);
          } catch {
            // Ignore cleanup errors
          }
        }
      }
    }

    return cleaned;
  }

  /**
   * Restores tracking for worktrees that exist on disk
   * Useful after restart to recover state
   */
  async restoreFromDisk(): Promise<number> {
    const gitWorktrees = await this.listGitWorktrees();
    const basePath = this.getWorktreeBasePath();
    let restored = 0;

    for (const wt of gitWorktrees) {
      if (wt.path.startsWith(basePath) && !wt.path.endsWith(this.projectRoot)) {
        const agentId = wt.path.substring(basePath.length + 1);
        
        if (!this.worktrees.has(agentId)) {
          // Determine base branch (strip prefix if present)
          const baseBranch = wt.branch.startsWith(this.config.branchPrefix)
            ? 'main' // Default assumption, could be improved
            : wt.branch;

          this.worktrees.set(agentId, {
            agentId,
            path: wt.path,
            branch: wt.branch,
            baseBranch,
            createdAt: new Date().toISOString(), // Unknown, use now
            status: 'active',
          });
          restored++;
        }
      }
    }

    return restored;
  }

  /**
   * Gets the count of active worktrees
   */
  getActiveCount(): number {
    let count = 0;
    for (const info of this.worktrees.values()) {
      if (info.status === 'active' || info.status === 'merging') {
        count++;
      }
    }
    return count;
  }
}
