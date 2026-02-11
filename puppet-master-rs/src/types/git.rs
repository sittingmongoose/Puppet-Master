//! Git integration types.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Result of a git operation.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitResult {
    /// Whether the operation succeeded.
    pub success: bool,
    /// Result message.
    pub message: String,
    /// Commit SHA if applicable.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub commit_sha: Option<String>,
    /// Branch name if applicable.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub branch: Option<String>,
    /// Files affected.
    #[serde(default)]
    pub files: Vec<PathBuf>,
    /// Timestamp of operation.
    pub timestamp: DateTime<Utc>,
}

impl GitResult {
    /// Creates a new successful git result.
    pub fn success(message: impl Into<String>) -> Self {
        Self {
            success: true,
            message: message.into(),
            commit_sha: None,
            branch: None,
            files: Vec::new(),
            timestamp: Utc::now(),
        }
    }

    /// Creates a new failed git result.
    pub fn failure(message: impl Into<String>) -> Self {
        Self {
            success: false,
            message: message.into(),
            commit_sha: None,
            branch: None,
            files: Vec::new(),
            timestamp: Utc::now(),
        }
    }

    /// Sets the commit SHA.
    pub fn with_commit_sha(mut self, sha: impl Into<String>) -> Self {
        self.commit_sha = Some(sha.into());
        self
    }

    /// Sets the branch.
    pub fn with_branch(mut self, branch: impl Into<String>) -> Self {
        self.branch = Some(branch.into());
        self
    }

    /// Sets the files.
    pub fn with_files(mut self, files: Vec<PathBuf>) -> Self {
        self.files = files;
        self
    }
}

/// Status of the git repository.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitStatus {
    /// Current branch name.
    pub branch: String,
    /// Whether the working directory is clean.
    pub is_clean: bool,
    /// Number of staged files.
    pub staged_count: u32,
    /// Number of unstaged changes.
    pub unstaged_count: u32,
    /// Number of untracked files.
    pub untracked_count: u32,
    /// Latest commit SHA.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub head_sha: Option<String>,
    /// Remote tracking branch.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub remote_branch: Option<String>,
    /// Whether ahead of remote.
    #[serde(default)]
    pub ahead_count: u32,
    /// Whether behind remote.
    #[serde(default)]
    pub behind_count: u32,
}

impl GitStatus {
    /// Creates a new git status.
    pub fn new(branch: impl Into<String>) -> Self {
        Self {
            branch: branch.into(),
            is_clean: true,
            staged_count: 0,
            unstaged_count: 0,
            untracked_count: 0,
            head_sha: None,
            remote_branch: None,
            ahead_count: 0,
            behind_count: 0,
        }
    }

    /// Returns whether there are any changes.
    pub fn has_changes(&self) -> bool {
        self.staged_count > 0 || self.unstaged_count > 0 || self.untracked_count > 0
    }
}

/// Branch strategy for organizing work.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum BranchStrategy {
    /// Single main branch (all work on main).
    MainOnly,
    /// Feature branches (branch per feature).
    Feature,
    /// Tier-based branches (branch per phase/task).
    Tier,
    /// Release branches.
    Release,
}

impl Default for BranchStrategy {
    fn default() -> Self {
        Self::Feature
    }
}

impl std::fmt::Display for BranchStrategy {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::MainOnly => write!(f, "main-only"),
            Self::Feature => write!(f, "feature"),
            Self::Tier => write!(f, "tier"),
            Self::Release => write!(f, "release"),
        }
    }
}

/// Git configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitConfig {
    /// Whether git integration is enabled.
    #[serde(default = "default_true")]
    pub enabled: bool,
    /// Branch strategy to use.
    #[serde(default)]
    pub branch_strategy: BranchStrategy,
    /// Commit policy.
    #[serde(default)]
    pub commit_policy: CommitPolicy,
    /// Auto-commit after successful iterations.
    #[serde(default)]
    pub auto_commit: bool,
    /// Auto-push to remote.
    #[serde(default)]
    pub auto_push: bool,
    /// Commit message template.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub commit_message_template: Option<String>,
}

fn default_true() -> bool {
    true
}

impl Default for GitConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            branch_strategy: BranchStrategy::default(),
            commit_policy: CommitPolicy::default(),
            auto_commit: false,
            auto_push: false,
            commit_message_template: None,
        }
    }
}

/// When to create commits.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum CommitPolicy {
    /// Commit after each iteration.
    PerIteration,
    /// Commit after each subtask.
    PerSubtask,
    /// Commit after each task.
    PerTask,
    /// Commit after each phase.
    PerPhase,
    /// Manual commits only.
    Manual,
}

impl Default for CommitPolicy {
    fn default() -> Self {
        Self::PerSubtask
    }
}

impl std::fmt::Display for CommitPolicy {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::PerIteration => write!(f, "per-iteration"),
            Self::PerSubtask => write!(f, "per-subtask"),
            Self::PerTask => write!(f, "per-task"),
            Self::PerPhase => write!(f, "per-phase"),
            Self::Manual => write!(f, "manual"),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_git_result() {
        let result = GitResult::success("Committed changes")
            .with_commit_sha("abc123")
            .with_branch("main");

        assert!(result.success);
        assert_eq!(result.commit_sha, Some("abc123".to_string()));
        assert_eq!(result.branch, Some("main".to_string()));
    }

    #[test]
    fn test_git_status() {
        let status = GitStatus::new("main");

        assert_eq!(status.branch, "main");
        assert!(status.is_clean);
        assert!(!status.has_changes());
    }

    #[test]
    fn test_branch_strategy_display() {
        assert_eq!(BranchStrategy::Feature.to_string(), "feature");
        assert_eq!(BranchStrategy::MainOnly.to_string(), "main-only");
    }

    #[test]
    fn test_commit_policy_display() {
        assert_eq!(CommitPolicy::PerSubtask.to_string(), "per-subtask");
        assert_eq!(CommitPolicy::Manual.to_string(), "manual");
    }
}
