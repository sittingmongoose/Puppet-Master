//! Git integration for RWM Puppet Master
//!
//! Provides git operations, branch management, commit formatting,
//! and PR automation for the RWM workflow.

mod git_manager;
mod branch_strategy;
mod commit_formatter;
mod pr_manager;
mod worktree_manager;

pub use git_manager::GitManager;
pub use branch_strategy::BranchStrategyManager;
pub use commit_formatter::CommitFormatter;
pub use pr_manager::PrManager;
pub use worktree_manager::{WorktreeManager, WorktreeInfo, MergeResult};
