//! Git worktree manager - Manages git worktrees for parallel task execution
//!
//! Each task/subtask can run in its own worktree to avoid conflicts and enable
//! true parallel development across multiple branches.

use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use log::{debug, info, warn};
use std::path::PathBuf;
use tokio::fs;
use tokio::process::Command;

// DRY:DATA:WorktreeManager
/// Manages git worktrees for parallel task execution
pub struct WorktreeManager {
    repo_root: PathBuf,
    worktree_base: PathBuf,
}

// DRY:DATA:WorktreeInfo
/// Information about a worktree
#[derive(Debug, Clone)]
pub struct WorktreeInfo {
    pub path: PathBuf,
    pub branch: String,
    pub tier_id: String,
    pub created_at: DateTime<Utc>,
    pub is_active: bool,
}

// DRY:DATA:MergeResult
/// Result of a merge operation
#[derive(Debug, Clone)]
pub struct MergeResult {
    pub success: bool,
    pub conflicts: Vec<String>,
    pub files_changed: Vec<String>,
}

impl WorktreeManager {
    // DRY:FN:new
    /// Create a new worktree manager
    pub fn new(repo_root: PathBuf) -> Self {
        let worktree_base = repo_root.join(".puppet-master").join("worktrees");
        Self {
            repo_root,
            worktree_base,
        }
    }

    // DRY:FN:create_worktree
    /// Create a new worktree for a tier
    pub async fn create_worktree(&self, tier_id: &str, branch: &str) -> Result<WorktreeInfo> {
        info!(
            "Creating worktree for tier '{}' on branch '{}'",
            tier_id, branch
        );

        // Ensure worktree base directory exists
        fs::create_dir_all(&self.worktree_base)
            .await
            .context("Failed to create worktree base directory")?;

        // Create worktree path
        let worktree_path = self.worktree_base.join(tier_id);

        // Check if worktree already exists
        if worktree_path.exists() {
            warn!(
                "Worktree already exists at {:?}, removing it first",
                worktree_path
            );
            self.remove_worktree(tier_id).await?;
        }

        // Create the worktree
        let output = Command::new("git")
            .current_dir(&self.repo_root)
            .args(&["worktree", "add", "-b", branch])
            .arg(&worktree_path)
            .output()
            .await
            .context("Failed to execute git worktree add")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            anyhow::bail!("Failed to create worktree: {}", stderr);
        }

        debug!("Worktree created successfully at {:?}", worktree_path);

        Ok(WorktreeInfo {
            path: worktree_path,
            branch: branch.to_string(),
            tier_id: tier_id.to_string(),
            created_at: Utc::now(),
            is_active: true,
        })
    }

    // DRY:FN:list_worktrees
    /// List all worktrees
    pub async fn list_worktrees(&self) -> Result<Vec<WorktreeInfo>> {
        debug!("Listing all worktrees");

        let output = Command::new("git")
            .current_dir(&self.repo_root)
            .args(&["worktree", "list", "--porcelain"])
            .output()
            .await
            .context("Failed to execute git worktree list")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            anyhow::bail!("Failed to list worktrees: {}", stderr);
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        let mut worktrees = Vec::new();
        let mut current_worktree: Option<(PathBuf, String)> = None;

        for line in stdout.lines() {
            if line.starts_with("worktree ") {
                // Save previous worktree if exists
                if let Some((path, branch)) = current_worktree.take() {
                    if let Some(tier_id) = self.extract_tier_id(&path) {
                        worktrees.push(WorktreeInfo {
                            path,
                            branch,
                            tier_id,
                            created_at: Utc::now(), // We don't have creation time from git
                            is_active: true,
                        });
                    }
                }

                // Start new worktree
                let path_str = line.strip_prefix("worktree ").unwrap_or("");
                current_worktree = Some((PathBuf::from(path_str), String::new()));
            } else if line.starts_with("branch ") {
                if let Some((_, ref mut branch)) = current_worktree {
                    let branch_str = line.strip_prefix("branch refs/heads/").unwrap_or("");
                    *branch = branch_str.to_string();
                }
            }
        }

        // Save last worktree
        if let Some((path, branch)) = current_worktree {
            if let Some(tier_id) = self.extract_tier_id(&path) {
                worktrees.push(WorktreeInfo {
                    path,
                    branch,
                    tier_id,
                    created_at: Utc::now(),
                    is_active: true,
                });
            }
        }

        Ok(worktrees)
    }

    // DRY:FN:remove_worktree
    /// Remove a worktree (after merging)
    pub async fn remove_worktree(&self, tier_id: &str) -> Result<()> {
        info!("Removing worktree for tier '{}'", tier_id);

        let worktree_path = self.worktree_base.join(tier_id);

        if !worktree_path.exists() {
            debug!("Worktree does not exist, nothing to remove");
            return Ok(());
        }

        // Remove the worktree
        let output = Command::new("git")
            .current_dir(&self.repo_root)
            .args(&["worktree", "remove", "--force"])
            .arg(&worktree_path)
            .output()
            .await
            .context("Failed to execute git worktree remove")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            warn!("Failed to remove worktree cleanly: {}", stderr);

            // Try to remove the directory manually
            if worktree_path.exists() {
                fs::remove_dir_all(&worktree_path)
                    .await
                    .context("Failed to remove worktree directory")?;
            }
        }

        debug!("Worktree removed successfully");
        Ok(())
    }

    // DRY:FN:merge_worktree
    /// Merge worktree changes back to target branch
    pub async fn merge_worktree(&self, tier_id: &str, target_branch: &str) -> Result<MergeResult> {
        info!(
            "Merging worktree '{}' into branch '{}'",
            tier_id, target_branch
        );

        // Get the worktree info
        let worktrees = self.list_worktrees().await?;
        let worktree = worktrees
            .iter()
            .find(|w| w.tier_id == tier_id)
            .context("Worktree not found")?;

        let source_branch = &worktree.branch;

        // Switch to target branch in main repo
        let checkout_output = Command::new("git")
            .current_dir(&self.repo_root)
            .args(&["checkout", target_branch])
            .output()
            .await
            .context("Failed to checkout target branch")?;

        if !checkout_output.status.success() {
            let stderr = String::from_utf8_lossy(&checkout_output.stderr);
            anyhow::bail!("Failed to checkout target branch: {}", stderr);
        }

        // Merge the source branch
        let merge_output = Command::new("git")
            .current_dir(&self.repo_root)
            .args(&["merge", "--no-ff", source_branch])
            .output()
            .await
            .context("Failed to merge worktree branch")?;

        let success = merge_output.status.success();
        let _stdout = String::from_utf8_lossy(&merge_output.stdout);
        let _stderr = String::from_utf8_lossy(&merge_output.stderr);

        // Check for conflicts
        let mut conflicts = Vec::new();
        if !success {
            // Get list of conflicted files
            let status_output = Command::new("git")
                .current_dir(&self.repo_root)
                .args(&["diff", "--name-only", "--diff-filter=U"])
                .output()
                .await
                .context("Failed to get conflict list")?;

            if status_output.status.success() {
                let conflict_stdout = String::from_utf8_lossy(&status_output.stdout);
                conflicts = conflict_stdout.lines().map(|s| s.to_string()).collect();
            }
        }

        // Get list of changed files
        let mut files_changed = Vec::new();
        if success {
            let diff_output = Command::new("git")
                .current_dir(&self.repo_root)
                .args(&["diff", "--name-only", "HEAD~1", "HEAD"])
                .output()
                .await
                .context("Failed to get changed files")?;

            if diff_output.status.success() {
                let diff_stdout = String::from_utf8_lossy(&diff_output.stdout);
                files_changed = diff_stdout.lines().map(|s| s.to_string()).collect();
            }
        }

        debug!(
            "Merge result: success={}, conflicts={}, files_changed={}",
            success,
            conflicts.len(),
            files_changed.len()
        );

        Ok(MergeResult {
            success,
            conflicts,
            files_changed,
        })
    }

    // DRY:FN:prune
    /// Clean up stale worktrees
    pub async fn prune(&self) -> Result<u32> {
        info!("Pruning stale worktrees");

        let output = Command::new("git")
            .current_dir(&self.repo_root)
            .args(&["worktree", "prune", "--verbose"])
            .output()
            .await
            .context("Failed to execute git worktree prune")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            anyhow::bail!("Failed to prune worktrees: {}", stderr);
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        let pruned_count = stdout.lines().count() as u32;

        debug!("Pruned {} stale worktree(s)", pruned_count);
        Ok(pruned_count)
    }

    /// Extract tier ID from worktree path
    fn extract_tier_id(&self, path: &PathBuf) -> Option<String> {
        // Only return tier_id if the path is under our worktree_base
        if !path.starts_with(&self.worktree_base) {
            return None;
        }

        path.file_name()
            .and_then(|name| name.to_str())
            .map(|s| s.to_string())
    }

    // DRY:FN:get_worktree_path
    /// Get the path for a specific tier's worktree
    pub fn get_worktree_path(&self, tier_id: &str) -> PathBuf {
        self.worktree_base.join(tier_id)
    }

    // DRY:FN:worktree_exists
    /// Check if a worktree exists for a tier
    pub async fn worktree_exists(&self, tier_id: &str) -> bool {
        self.get_worktree_path(tier_id).exists()
    }

    // DRY:FN:detect_orphaned_worktrees
    /// Detect orphaned worktrees that are not tracked by git
    ///
    /// Returns worktree paths that exist in .puppet-master/worktrees but are not
    /// registered in git's worktree list (likely leaked after a crash).
    pub async fn detect_orphaned_worktrees(&self) -> Result<Vec<PathBuf>> {
        debug!("Detecting orphaned worktrees");

        // Get list of worktrees tracked by git
        let git_worktrees = self.list_worktrees().await?;
        let git_worktree_paths: std::collections::HashSet<PathBuf> =
            git_worktrees.into_iter().map(|w| w.path).collect();

        // Scan the worktree base directory
        let mut orphaned = Vec::new();

        if !self.worktree_base.exists() {
            debug!("Worktree base directory does not exist");
            return Ok(orphaned);
        }

        let mut entries = fs::read_dir(&self.worktree_base)
            .await
            .context("Failed to read worktree base directory")?;

        while let Some(entry) = entries.next_entry().await? {
            let path = entry.path();

            // Only consider directories
            if !path.is_dir() {
                continue;
            }

            // Check if this worktree is tracked by git
            if !git_worktree_paths.contains(&path) {
                warn!("Found orphaned worktree: {:?}", path);
                orphaned.push(path);
            }
        }

        Ok(orphaned)
    }

    /// Check if a worktree is safe to prune
    ///
    /// A worktree is safe to prune if:
    /// - It's not in git's worktree list
    /// - It doesn't have uncommitted changes
    /// - It's under our worktree_base directory
    async fn is_safe_to_prune(&self, worktree_path: &PathBuf) -> bool {
        // Must be under our worktree_base
        if !worktree_path.starts_with(&self.worktree_base) {
            warn!("Worktree {:?} is not under worktree_base", worktree_path);
            return false;
        }

        // Must be a directory
        if !worktree_path.is_dir() {
            return false;
        }

        // Check if it has a .git file (worktrees have .git files, not directories)
        let git_file = worktree_path.join(".git");
        if !git_file.exists() {
            debug!(
                "Worktree {:?} has no .git file, safe to remove",
                worktree_path
            );
            return true;
        }

        // Check for uncommitted changes using git status
        let status_output = Command::new("git")
            .current_dir(worktree_path)
            .args(&["status", "--porcelain"])
            .output()
            .await;

        match status_output {
            Ok(output) => {
                if !output.status.success() {
                    // Git command failed, worktree might be corrupted
                    debug!(
                        "Git status failed for {:?}, considering safe to prune",
                        worktree_path
                    );
                    return true;
                }

                let stdout = String::from_utf8_lossy(&output.stdout);
                if stdout.trim().is_empty() {
                    debug!("Worktree {:?} has no uncommitted changes", worktree_path);
                    true
                } else {
                    warn!(
                        "Worktree {:?} has uncommitted changes, not safe to prune",
                        worktree_path
                    );
                    warn!("Changes:\n{}", stdout);
                    false
                }
            }
            Err(e) => {
                warn!("Failed to check git status for {:?}: {}", worktree_path, e);
                false
            }
        }
    }

    // DRY:FN:recover_orphaned_worktrees
    /// Recover from leaked/orphaned worktrees after a crash
    ///
    /// This safely removes orphaned worktrees that were created by Puppet Master
    /// but not properly cleaned up after a crash. Only removes worktrees that:
    /// - Are not tracked by git
    /// - Have no uncommitted changes
    /// - Are under .puppet-master/worktrees/
    ///
    /// Returns the number of worktrees recovered/removed.
    pub async fn recover_orphaned_worktrees(&self) -> Result<usize> {
        info!("Starting worktree recovery");

        let orphaned = self.detect_orphaned_worktrees().await?;

        if orphaned.is_empty() {
            info!("No orphaned worktrees found");
            return Ok(0);
        }

        info!("Found {} potentially orphaned worktree(s)", orphaned.len());

        let mut recovered = 0;

        for worktree_path in orphaned {
            if !self.is_safe_to_prune(&worktree_path).await {
                warn!("Skipping worktree {:?} - not safe to prune", worktree_path);
                continue;
            }

            info!("Removing orphaned worktree: {:?}", worktree_path);

            // Try to remove using git worktree remove first
            let git_remove = Command::new("git")
                .current_dir(&self.repo_root)
                .args(&["worktree", "remove", "--force"])
                .arg(&worktree_path)
                .output()
                .await;

            match git_remove {
                Ok(output) if output.status.success() => {
                    info!("Successfully removed worktree via git: {:?}", worktree_path);
                    recovered += 1;
                }
                _ => {
                    // Git remove failed, try manual removal
                    debug!("Git worktree remove failed, trying manual removal");

                    match fs::remove_dir_all(&worktree_path).await {
                        Ok(_) => {
                            info!(
                                "Successfully removed worktree directory: {:?}",
                                worktree_path
                            );
                            recovered += 1;
                        }
                        Err(e) => {
                            warn!("Failed to remove worktree {:?}: {}", worktree_path, e);
                        }
                    }
                }
            }
        }

        // Run git worktree prune to clean up git's internal tracking
        if recovered > 0 {
            info!("Running git worktree prune to clean up internal state");
            let _ = self.prune().await;
        }

        info!(
            "Worktree recovery complete: {} worktree(s) removed",
            recovered
        );
        Ok(recovered)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    async fn setup_test_repo() -> Result<TempDir> {
        let temp_dir = TempDir::new()?;

        // Initialize git repo
        Command::new("git")
            .current_dir(temp_dir.path())
            .args(&["init"])
            .output()
            .await?;

        // Configure git
        Command::new("git")
            .current_dir(temp_dir.path())
            .args(&["config", "user.email", "test@example.com"])
            .output()
            .await?;

        Command::new("git")
            .current_dir(temp_dir.path())
            .args(&["config", "user.name", "Test User"])
            .output()
            .await?;

        // Create initial commit
        let test_file = temp_dir.path().join("README.md");
        fs::write(&test_file, b"# Test Repo").await?;

        Command::new("git")
            .current_dir(temp_dir.path())
            .args(&["add", "README.md"])
            .output()
            .await?;

        Command::new("git")
            .current_dir(temp_dir.path())
            .args(&["commit", "-m", "Initial commit"])
            .output()
            .await?;

        Ok(temp_dir)
    }

    #[tokio::test]
    async fn test_worktree_manager_new() {
        let repo = PathBuf::from("/tmp/test-repo");
        let manager = WorktreeManager::new(repo.clone());
        assert_eq!(manager.repo_root, repo);
        assert_eq!(
            manager.worktree_base,
            repo.join(".puppet-master").join("worktrees")
        );
    }

    #[tokio::test]
    async fn test_create_worktree() {
        let temp_dir = setup_test_repo().await.unwrap();
        let manager = WorktreeManager::new(temp_dir.path().to_path_buf());

        let result = manager.create_worktree("tier1", "feature/tier1").await;
        assert!(result.is_ok());

        let info = result.unwrap();
        assert_eq!(info.tier_id, "tier1");
        assert_eq!(info.branch, "feature/tier1");
        assert!(info.path.exists());
    }

    #[tokio::test]
    async fn test_list_worktrees() {
        let temp_dir = setup_test_repo().await.unwrap();
        let manager = WorktreeManager::new(temp_dir.path().to_path_buf());

        // Create a worktree
        manager
            .create_worktree("tier1", "feature/tier1")
            .await
            .unwrap();

        // List worktrees
        let worktrees = manager.list_worktrees().await.unwrap();
        assert!(!worktrees.is_empty());

        let tier1 = worktrees.iter().find(|w| w.tier_id == "tier1");
        assert!(tier1.is_some());
    }

    #[tokio::test]
    async fn test_remove_worktree() {
        let temp_dir = setup_test_repo().await.unwrap();
        let manager = WorktreeManager::new(temp_dir.path().to_path_buf());

        // Create and remove worktree
        manager
            .create_worktree("tier1", "feature/tier1")
            .await
            .unwrap();
        let result = manager.remove_worktree("tier1").await;
        assert!(result.is_ok());

        // Verify it's removed
        let worktree_path = manager.get_worktree_path("tier1");
        assert!(!worktree_path.exists());
    }

    #[tokio::test]
    async fn test_worktree_exists() {
        let temp_dir = setup_test_repo().await.unwrap();
        let manager = WorktreeManager::new(temp_dir.path().to_path_buf());

        assert!(!manager.worktree_exists("tier1").await);

        manager
            .create_worktree("tier1", "feature/tier1")
            .await
            .unwrap();
        assert!(manager.worktree_exists("tier1").await);
    }

    #[tokio::test]
    async fn test_get_worktree_path() {
        let temp_dir = TempDir::new().unwrap();
        let manager = WorktreeManager::new(temp_dir.path().to_path_buf());

        let path = manager.get_worktree_path("tier1");
        assert_eq!(
            path,
            temp_dir
                .path()
                .join(".puppet-master")
                .join("worktrees")
                .join("tier1")
        );
    }

    #[test]
    fn test_extract_tier_id() {
        let temp_dir = TempDir::new().unwrap();
        let manager = WorktreeManager::new(temp_dir.path().to_path_buf());

        let worktree_path = manager.worktree_base.join("tier1");
        assert_eq!(
            manager.extract_tier_id(&worktree_path),
            Some("tier1".to_string())
        );

        let other_path = PathBuf::from("/some/other/path");
        assert_eq!(manager.extract_tier_id(&other_path), None);
    }

    #[tokio::test]
    async fn test_detect_orphaned_worktrees_empty() {
        let temp_dir = setup_test_repo().await.unwrap();
        let manager = WorktreeManager::new(temp_dir.path().to_path_buf());

        // No worktrees yet
        let orphaned = manager.detect_orphaned_worktrees().await.unwrap();
        assert!(orphaned.is_empty());
    }

    #[tokio::test]
    async fn test_detect_orphaned_worktrees_with_orphan() {
        let temp_dir = setup_test_repo().await.unwrap();
        let manager = WorktreeManager::new(temp_dir.path().to_path_buf());

        // Create worktree base directory
        fs::create_dir_all(&manager.worktree_base).await.unwrap();

        // Create an orphaned worktree directory (not tracked by git)
        let orphan_path = manager.worktree_base.join("orphan-tier");
        fs::create_dir_all(&orphan_path).await.unwrap();
        fs::write(orphan_path.join("test.txt"), b"orphan")
            .await
            .unwrap();

        // Detect orphaned worktrees
        let orphaned = manager.detect_orphaned_worktrees().await.unwrap();
        assert_eq!(orphaned.len(), 1);
        assert_eq!(orphaned[0], orphan_path);
    }

    #[tokio::test]
    async fn test_detect_orphaned_worktrees_ignores_tracked() {
        let temp_dir = setup_test_repo().await.unwrap();
        let manager = WorktreeManager::new(temp_dir.path().to_path_buf());

        // Create a tracked worktree
        manager
            .create_worktree("tier1", "feature/tier1")
            .await
            .unwrap();

        // Create an orphaned worktree
        let orphan_path = manager.worktree_base.join("orphan-tier");
        fs::create_dir_all(&orphan_path).await.unwrap();

        // Detect orphaned - should only find the orphan, not the tracked one
        let orphaned = manager.detect_orphaned_worktrees().await.unwrap();
        assert_eq!(orphaned.len(), 1);
        assert_eq!(orphaned[0], orphan_path);
    }

    #[tokio::test]
    async fn test_is_safe_to_prune_outside_base() {
        let temp_dir = setup_test_repo().await.unwrap();
        let manager = WorktreeManager::new(temp_dir.path().to_path_buf());

        let outside_path = PathBuf::from("/tmp/outside-worktree");
        assert!(!manager.is_safe_to_prune(&outside_path).await);
    }

    #[tokio::test]
    async fn test_is_safe_to_prune_no_git() {
        let temp_dir = setup_test_repo().await.unwrap();
        let manager = WorktreeManager::new(temp_dir.path().to_path_buf());

        // Create directory without .git
        fs::create_dir_all(&manager.worktree_base).await.unwrap();
        let no_git_path = manager.worktree_base.join("no-git");
        fs::create_dir_all(&no_git_path).await.unwrap();

        assert!(manager.is_safe_to_prune(&no_git_path).await);
    }

    #[tokio::test]
    async fn test_recover_orphaned_worktrees_empty() {
        let temp_dir = setup_test_repo().await.unwrap();
        let manager = WorktreeManager::new(temp_dir.path().to_path_buf());

        let recovered = manager.recover_orphaned_worktrees().await.unwrap();
        assert_eq!(recovered, 0);
    }

    #[tokio::test]
    async fn test_recover_orphaned_worktrees_removes_orphan() {
        let temp_dir = setup_test_repo().await.unwrap();
        let manager = WorktreeManager::new(temp_dir.path().to_path_buf());

        // Create worktree base directory
        fs::create_dir_all(&manager.worktree_base).await.unwrap();

        // Create an orphaned worktree directory (no .git, so safe to prune)
        let orphan_path = manager.worktree_base.join("orphan-tier");
        fs::create_dir_all(&orphan_path).await.unwrap();
        fs::write(orphan_path.join("test.txt"), b"orphan")
            .await
            .unwrap();

        // Recover orphaned worktrees
        let recovered = manager.recover_orphaned_worktrees().await.unwrap();
        assert_eq!(recovered, 1);

        // Verify orphan is removed
        assert!(!orphan_path.exists());
    }

    #[tokio::test]
    async fn test_recover_orphaned_worktrees_preserves_tracked() {
        let temp_dir = setup_test_repo().await.unwrap();
        let manager = WorktreeManager::new(temp_dir.path().to_path_buf());

        // Create a tracked worktree
        let tracked_info = manager
            .create_worktree("tier1", "feature/tier1")
            .await
            .unwrap();

        // Create an orphaned worktree (no .git file)
        let orphan_path = manager.worktree_base.join("orphan-tier");
        fs::create_dir_all(&orphan_path).await.unwrap();

        // Recover - should remove orphan but not tracked
        let recovered = manager.recover_orphaned_worktrees().await.unwrap();
        assert_eq!(recovered, 1);

        // Verify tracked worktree still exists
        assert!(tracked_info.path.exists());
        assert!(!orphan_path.exists());
    }
}
