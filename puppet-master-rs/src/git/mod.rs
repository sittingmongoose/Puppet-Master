//! Git integration for Puppet Master
//!
//! Provides git operations, branch management, commit formatting,
//! and PR automation for the Puppet Master workflow.

mod branch_strategy;
mod commit_formatter;
mod git_manager;
mod pr_manager;
mod worktree_manager;

pub use branch_strategy::BranchStrategyManager;
pub use commit_formatter::CommitFormatter;
pub use git_manager::GitManager;
pub use pr_manager::PrManager;
pub use worktree_manager::{MergeResult, WorktreeInfo, WorktreeManager};
