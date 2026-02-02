/**
 * Git module barrel export
 * 
 * Re-exports GitManager and related types, plus branch strategy implementations,
 * commit formatter, and PR manager.
 */

export { GitManager } from './git-manager.js';
export type {
  GitResult,
  CommitOptions,
  PushOptions,
  CommitInfo,
  GitStatus,
  GitLogEntry,
} from './git-manager.js';

export {
  createBranchStrategy,
  SingleBranchStrategy,
  PerPhaseBranchStrategy,
  PerTaskBranchStrategy,
  BaseBranchStrategy,
} from './branch-strategy.js';
export type {
  BranchStrategy,
  BranchStrategyConfig,
  BranchContext,
} from './branch-strategy.js';

export { CommitFormatter } from './commit-formatter.js';
export type {
  CommitTier,
  CommitContext,
} from './commit-formatter.js';

export { PRManager } from './pr-manager.js';
export type {
  PRConfig,
  PRInfo,
} from './pr-manager.js';

export { WorktreeManager } from './worktree-manager.js';
export type {
  WorktreeInfo,
  MergeResult,
  WorktreeConfig,
} from './worktree-manager.js';
