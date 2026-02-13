//! Git manager - Core git operations via CLI

use crate::types::{GitResult, GitStatus};
use anyhow::{Context, Result};
use log::{debug, info, warn};
use serde_json::json;
use std::path::PathBuf;
use tokio::fs::OpenOptions;
use tokio::io::AsyncWriteExt;

/// Git manager handles all git operations via CLI
#[derive(Clone)]
pub struct GitManager {
    repo_path: PathBuf,
    log_path: PathBuf,
}

impl GitManager {
    /// Create a new git manager for a repository
    pub fn new(repo_path: PathBuf) -> Self {
        let log_path = repo_path.join(".puppet-master").join("git-actions.log");
        Self {
            repo_path,
            log_path,
        }
    }

    /// Initialize git repository if not already initialized
    pub async fn init(&self) -> Result<GitResult> {
        info!("Initializing git repository at {:?}", self.repo_path);
        self.run_git_cmd(&["init"]).await
    }

    /// Get current status
    pub async fn status(&self) -> Result<GitStatus> {
        let result = self.run_git_cmd(&["status", "--porcelain"]).await?;

        if !result.success {
            return Ok(GitStatus::new("unknown"));
        }

        let mut staged_count: u32 = 0;
        let mut unstaged_count: u32 = 0;
        let mut untracked_count: u32 = 0;

        for line in result.message.lines() {
            if line.len() < 3 {
                continue;
            }
            let status = &line[0..2];

            match status {
                " M" | "M " | "MM" => unstaged_count += 1,
                "A " | "AM" => staged_count += 1,
                "??" => untracked_count += 1,
                _ => {}
            }
        }

        let branch = self.current_branch().await?;
        let (ahead, behind) = self.get_ahead_behind().await?;

        let is_clean = staged_count == 0 && unstaged_count == 0 && untracked_count == 0;

        Ok(GitStatus {
            branch,
            is_clean,
            staged_count,
            unstaged_count,
            untracked_count,
            head_sha: None,
            remote_branch: None,
            ahead_count: ahead,
            behind_count: behind,
        })
    }

    /// Get current branch name
    pub async fn current_branch(&self) -> Result<String> {
        let result = self.run_git_cmd(&["branch", "--show-current"]).await?;
        Ok(result.message.trim().to_string())
    }

    /// List all branches
    pub async fn branch_list(&self) -> Result<Vec<String>> {
        let result = self.run_git_cmd(&["branch", "--list"]).await?;
        let branches: Vec<String> = result
            .message
            .lines()
            .map(|line| line.trim_start_matches("* ").trim().to_string())
            .collect();
        Ok(branches)
    }

    /// Create a new branch
    pub async fn create_branch(&self, name: &str) -> Result<GitResult> {
        info!("Creating branch: {}", name);
        let result = self.run_git_cmd(&["checkout", "-b", name]).await?;
        self.log_action("create_branch", name, &result).await?;
        Ok(result)
    }

    /// Checkout existing branch
    pub async fn checkout(&self, branch: &str) -> Result<GitResult> {
        info!("Checking out branch: {}", branch);
        let result = self.run_git_cmd(&["checkout", branch]).await?;
        self.log_action("checkout", branch, &result).await?;
        Ok(result)
    }

    /// Add files to staging
    pub async fn add(&self, paths: &[String]) -> Result<GitResult> {
        let mut args = vec!["add"];
        let path_refs: Vec<&str> = paths.iter().map(|s| s.as_str()).collect();
        args.extend(path_refs);

        debug!("Adding files: {:?}", paths);
        let result = self.run_git_cmd(&args).await?;
        self.log_action("add", &paths.join(", "), &result).await?;
        Ok(result)
    }

    /// Stage all changes (equivalent to `git add -A`).
    pub async fn add_all(&self) -> Result<GitResult> {
        debug!("Adding all changes");
        let result = self.run_git_cmd(&["add", "-A"]).await?;
        self.log_action("add_all", "-A", &result).await?;
        Ok(result)
    }

    /// Commit staged changes
    pub async fn commit(&self, message: &str) -> Result<GitResult> {
        info!("Committing: {}", message);
        let result = self.run_git_cmd(&["commit", "-m", message]).await?;
        self.log_action("commit", message, &result).await?;
        Ok(result)
    }

    /// Push to remote
    pub async fn push(&self, remote: &str, branch: &str) -> Result<GitResult> {
        info!("Pushing {} to {}", branch, remote);
        let result = self.run_git_cmd(&["push", remote, branch]).await?;
        self.log_action("push", &format!("{}/{}", remote, branch), &result)
            .await?;
        Ok(result)
    }

    /// Pull from remote
    pub async fn pull(&self) -> Result<GitResult> {
        info!("Pulling from remote");
        let result = self.run_git_cmd(&["pull"]).await?;
        self.log_action("pull", "", &result).await?;
        Ok(result)
    }

    /// Reset to a specific state
    pub async fn reset(&self, mode: &str, target: &str) -> Result<GitResult> {
        warn!("Resetting: {} to {}", mode, target);
        let result = self.run_git_cmd(&["reset", mode, target]).await?;
        self.log_action("reset", &format!("{} {}", mode, target), &result)
            .await?;
        Ok(result)
    }

    /// Get diff of modified files
    pub async fn diff_files(&self) -> Result<Vec<String>> {
        let result = self.run_git_cmd(&["diff", "--name-only"]).await?;
        let files: Vec<String> = result
            .message
            .lines()
            .map(|line| line.trim().to_string())
            .filter(|line| !line.is_empty())
            .collect();
        Ok(files)
    }

    /// Get HEAD commit SHA
    pub async fn get_head_sha(&self) -> Result<String> {
        let result = self.run_git_cmd(&["rev-parse", "HEAD"]).await?;
        Ok(result.message.trim().to_string())
    }

    /// Get ahead/behind count compared to remote
    async fn get_ahead_behind(&self) -> Result<(u32, u32)> {
        let result = self
            .run_git_cmd(&["rev-list", "--left-right", "--count", "HEAD...@{upstream}"])
            .await;

        if let Ok(result) = result {
            let parts: Vec<&str> = result.message.trim().split_whitespace().collect();
            if parts.len() == 2 {
                let ahead = parts[0].parse().unwrap_or(0);
                let behind = parts[1].parse().unwrap_or(0);
                return Ok((ahead, behind));
            }
        }

        Ok((0, 0))
    }

    /// Run a git command
    pub(crate) async fn run_git_cmd(&self, args: &[&str]) -> Result<GitResult> {
        let output = tokio::process::Command::new("git")
            .current_dir(&self.repo_path)
            .args(args)
            .output()
            .await
            .context("Failed to execute git command")?;

        let success = output.status.success();
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();

        if !success {
            debug!("Git command failed: git {}", args.join(" "));
            debug!("Stderr: {}", stderr);
        }

        let message = if success { stdout } else { stderr };

        if success {
            Ok(GitResult::success(message))
        } else {
            Ok(GitResult::failure(message))
        }
    }

    /// Log git action to JSONL file
    async fn log_action(&self, action: &str, details: &str, result: &GitResult) -> Result<()> {
        // Ensure directory exists
        if let Some(parent) = self.log_path.parent() {
            tokio::fs::create_dir_all(parent).await?;
        }

        let log_entry = json!({
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "action": action,
            "details": details,
            "success": result.success,
        });

        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.log_path)
            .await?;

        file.write_all(log_entry.to_string().as_bytes()).await?;
        file.write_all(b"\n").await?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    async fn setup_test_repo() -> (TempDir, GitManager) {
        let temp_dir = TempDir::new().unwrap();
        let manager = GitManager::new(temp_dir.path().to_path_buf());
        manager.init().await.unwrap();
        (temp_dir, manager)
    }

    #[tokio::test]
    async fn test_init() {
        let temp_dir = TempDir::new().unwrap();
        let manager = GitManager::new(temp_dir.path().to_path_buf());
        let result = manager.init().await.unwrap();
        assert!(result.success);
    }

    #[tokio::test]
    async fn test_current_branch() {
        let (_temp_dir, manager) = setup_test_repo().await;
        let branch = manager.current_branch().await.unwrap();
        assert!(!branch.is_empty());
    }

    #[tokio::test]
    async fn test_create_branch() {
        let (_temp_dir, manager) = setup_test_repo().await;
        let result = manager.create_branch("test-branch").await.unwrap();
        assert!(result.success);

        let current = manager.current_branch().await.unwrap();
        assert_eq!(current, "test-branch");
    }
}
