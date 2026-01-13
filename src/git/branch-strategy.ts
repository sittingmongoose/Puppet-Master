/**
 * Branch Strategy for RWM Puppet Master
 * 
 * Implements branch strategies for single, per-phase, and per-task granularity.
 * See REQUIREMENTS.md Section 14 for branch strategy requirements.
 */

import type { GitManager, GitResult } from './git-manager.js';

/**
 * Configuration for branch strategy
 */
export interface BranchStrategyConfig {
  /** Branch granularity strategy */
  granularity: 'single' | 'per-phase' | 'per-task';
  /** Base branch to start from */
  baseBranch: string;
  /** Branch naming pattern (e.g., "ralph/{phase}/{task}") */
  namingPattern: string;
}

/**
 * Context for branch operations
 */
export interface BranchContext {
  /** Phase identifier (e.g., "PH-001") */
  phaseId?: string;
  /** Task identifier (e.g., "TK-001-001") */
  taskId?: string;
  /** Subtask identifier (e.g., "ST-001-001-001") */
  subtaskId?: string;
  /** Whether the phase/task is complete (for merge decisions) */
  isComplete?: boolean;
}

/**
 * Branch strategy interface
 */
export interface BranchStrategy {
  /** The granularity strategy this instance implements */
  readonly granularity: 'single' | 'per-phase' | 'per-task';
  
  /**
   * Gets the branch name for the given context
   * @param context - Branch context
   * @returns Branch name
   */
  getBranchName(context: BranchContext): string;
  
  /**
   * Determines if a new branch should be created
   * @param context - Branch context
   * @returns true if a new branch should be created
   */
  shouldCreateBranch(context: BranchContext): boolean;
  
  /**
   * Determines if the current branch should be merged
   * @param context - Branch context
   * @returns true if the branch should be merged
   */
  shouldMerge(context: BranchContext): boolean;
  
  /**
   * Ensures the branch exists and is checked out
   * @param context - Branch context
   * @returns Promise that resolves when branch is ready
   */
  ensureBranch(context: BranchContext): Promise<void>;
  
  /**
   * Merges the current branch to the target branch
   * @param targetBranch - Target branch to merge into
   * @returns Promise resolving to GitResult
   */
  mergeToBranch(targetBranch: string): Promise<GitResult>;
}

/**
 * Base implementation for branch strategies
 */
export abstract class BaseBranchStrategy implements BranchStrategy {
  protected readonly config: BranchStrategyConfig;
  protected readonly gitManager: GitManager;
  protected currentBranchName: string | null = null;
  protected lastPhaseId: string | null = null;
  protected lastTaskId: string | null = null;

  constructor(config: BranchStrategyConfig, gitManager: GitManager) {
    this.config = config;
    this.gitManager = gitManager;
  }

  abstract readonly granularity: 'single' | 'per-phase' | 'per-task';
  abstract getBranchName(context: BranchContext): string;
  abstract shouldCreateBranch(context: BranchContext): boolean;
  abstract shouldMerge(context: BranchContext): boolean;

  /**
   * Formats a branch name using the pattern and context
   * @param pattern - Naming pattern (e.g., "ralph/{phase}/{task}")
   * @param context - Branch context
   * @returns Formatted branch name
   */
  protected formatBranchName(pattern: string, context: BranchContext): string {
    let branchName = pattern;
    
    // Replace placeholders
    if (context.phaseId) {
      branchName = branchName.replace(/{phase}/g, context.phaseId.toLowerCase());
    }
    if (context.taskId) {
      branchName = branchName.replace(/{task}/g, context.taskId.toLowerCase());
    }
    if (context.subtaskId) {
      branchName = branchName.replace(/{subtask}/g, context.subtaskId.toLowerCase());
    }
    
    // Remove any remaining placeholders
    branchName = branchName.replace(/{phase}/g, '');
    branchName = branchName.replace(/{task}/g, '');
    branchName = branchName.replace(/{subtask}/g, '');
    
    // Clean up any double slashes or trailing slashes
    branchName = branchName.replace(/\/+/g, '/').replace(/\/$/, '');
    
    return branchName;
  }

  /**
   * Ensures the branch exists and is checked out
   * @param context - Branch context
   */
  async ensureBranch(context: BranchContext): Promise<void> {
    const branchName = this.getBranchName(context);
    
    // Check if we're already on the correct branch
    try {
      const currentBranch = await this.gitManager.getCurrentBranch();
      if (currentBranch === branchName) {
        this.currentBranchName = branchName;
        // Track phase/task for change detection
        if (context.phaseId) {
          this.lastPhaseId = context.phaseId;
        }
        if (context.taskId) {
          this.lastTaskId = context.taskId;
        }
        return;
      }
    } catch {
      // If we can't get current branch, continue to create/checkout
    }

    // Try to checkout the branch first (in case it exists)
    const checkoutResult = await this.gitManager.checkout(branchName);
    
    if (checkoutResult.success) {
      // Branch exists and we checked it out
      this.currentBranchName = branchName;
    } else if (this.shouldCreateBranch(context)) {
      // Branch doesn't exist, create it
      const createResult = await this.gitManager.createBranch(branchName, true);
      if (!createResult.success) {
        throw new Error(`Failed to create branch ${branchName}: ${createResult.stderr}`);
      }
      this.currentBranchName = branchName;
    } else {
      // For single strategy or when we shouldn't create, ensure we're on base branch
      const baseResult = await this.gitManager.checkout(this.config.baseBranch);
      if (!baseResult.success) {
        throw new Error(`Failed to checkout base branch ${this.config.baseBranch}: ${baseResult.stderr}`);
      }
      this.currentBranchName = this.config.baseBranch;
    }
    
    // Track phase/task for change detection
    if (context.phaseId) {
      this.lastPhaseId = context.phaseId;
    }
    if (context.taskId) {
      this.lastTaskId = context.taskId;
    }
  }

  /**
   * Merges the current branch to the target branch
   * @param targetBranch - Target branch to merge into
   * @returns Promise resolving to GitResult
   */
  async mergeToBranch(targetBranch: string): Promise<GitResult> {
    // Checkout target branch first
    const checkoutResult = await this.gitManager.checkout(targetBranch);
    if (!checkoutResult.success) {
      return checkoutResult;
    }

    // Merge the source branch
    const sourceBranch = this.currentBranchName || await this.gitManager.getCurrentBranch();
    return await this.gitManager.merge(sourceBranch);
  }

  /**
   * Checks if phase has changed
   * @param context - Branch context
   * @returns true if phase has changed
   */
  protected hasPhaseChanged(context: BranchContext): boolean {
    if (!context.phaseId) {
      return false;
    }
    return this.lastPhaseId !== null && this.lastPhaseId !== context.phaseId;
  }

  /**
   * Checks if task has changed
   * @param context - Branch context
   * @returns true if task has changed
   */
  protected hasTaskChanged(context: BranchContext): boolean {
    if (!context.taskId) {
      return false;
    }
    return this.lastTaskId !== null && this.lastTaskId !== context.taskId;
  }
}

/**
 * Single branch strategy - all work on one branch
 */
export class SingleBranchStrategy extends BaseBranchStrategy {
  readonly granularity = 'single' as const;

  getBranchName(_context: BranchContext): string {
    return this.config.baseBranch;
  }

  shouldCreateBranch(_context: BranchContext): boolean {
    return false;
  }

  shouldMerge(_context: BranchContext): boolean {
    return false;
  }
}

/**
 * Per-phase branch strategy - new branch per phase
 */
export class PerPhaseBranchStrategy extends BaseBranchStrategy {
  readonly granularity = 'per-phase' as const;

  getBranchName(context: BranchContext): string {
    if (!context.phaseId) {
      return this.config.baseBranch;
    }
    return this.formatBranchName(this.config.namingPattern, context);
  }

  shouldCreateBranch(context: BranchContext): boolean {
    if (!context.phaseId) {
      return false;
    }
    // Create branch when phase changes or when starting first phase
    return this.lastPhaseId === null || this.hasPhaseChanged(context);
  }

  shouldMerge(context: BranchContext): boolean {
    // Merge when phase is complete
    return context.isComplete === true && context.phaseId !== undefined;
  }
}

/**
 * Per-task branch strategy - new branch per task
 */
export class PerTaskBranchStrategy extends BaseBranchStrategy {
  readonly granularity = 'per-task' as const;

  getBranchName(context: BranchContext): string {
    if (!context.phaseId || !context.taskId) {
      return this.config.baseBranch;
    }
    return this.formatBranchName(this.config.namingPattern, context);
  }

  shouldCreateBranch(context: BranchContext): boolean {
    if (!context.phaseId || !context.taskId) {
      return false;
    }
    // Create branch when task changes or when starting first task
    return this.lastTaskId === null || this.hasTaskChanged(context);
  }

  shouldMerge(context: BranchContext): boolean {
    // Merge when task is complete
    return context.isComplete === true && context.taskId !== undefined;
  }
}

/**
 * Factory function to create a branch strategy instance
 * @param config - Branch strategy configuration
 * @param gitManager - GitManager instance
 * @returns BranchStrategy instance
 */
export function createBranchStrategy(
  config: BranchStrategyConfig,
  gitManager: GitManager
): BranchStrategy {
  switch (config.granularity) {
    case 'single':
      return new SingleBranchStrategy(config, gitManager);
    case 'per-phase':
      return new PerPhaseBranchStrategy(config, gitManager);
    case 'per-task':
      return new PerTaskBranchStrategy(config, gitManager);
    default:
      throw new Error(`Unknown granularity: ${config.granularity}`);
  }
}
