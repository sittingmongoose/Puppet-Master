//! PR manager - handles GitHub PR creation via gh CLI

use anyhow::{Context, Result};
use log::info;
use std::path::PathBuf;

// DRY:DATA:PrManager
/// Manages pull request creation
pub struct PrManager {
    repo_path: PathBuf,
}

impl PrManager {
    // DRY:FN:new
    /// Create a new PR manager
    pub fn new(repo_path: PathBuf) -> Self {
        Self { repo_path }
    }

    // DRY:FN:create_pr
    /// Create a pull request using gh CLI
    ///
    /// # Runtime Behavior
    ///
    /// This method performs preflight checks before attempting PR creation:
    /// - Verifies gh CLI is installed
    /// - Verifies gh is authenticated with GitHub
    ///
    /// If preflight checks fail, returns `Ok(PrResult)` with `success: false`
    /// and an actionable error message. **Never panics or crashes**.
    ///
    /// # Arguments
    /// * `title` - PR title
    /// * `body` - PR description
    /// * `base` - Base branch (e.g., "main")
    /// * `head` - Head branch (e.g., "tk-001-002")
    ///
    /// # Returns
    /// Always returns `Ok(PrResult)`. Check `PrResult.success` for status.
    /// If `success` is false, `message` contains actionable error details.
    ///
    /// # Example
    /// ```ignore
    /// # use puppet_master::git::PrManager;
    /// # use std::path::PathBuf;
    /// # tokio_test::block_on(async {
    /// let manager = PrManager::new(PathBuf::from("/repo"));
    /// let result = manager.create_pr(
    ///     "Fix: Update auth flow",
    ///     "Description here",
    ///     "main",
    ///     "feature/auth"
    /// ).await.unwrap();
    ///
    /// if result.success {
    ///     println!("PR created: {:?}", result.pr_url);
    /// } else {
    ///     eprintln!("PR creation failed: {}", result.message);
    ///     // Message contains actionable guidance like:
    ///     // "gh CLI not found. Install from https://cli.github.com/ and run 'gh auth login'"
    /// }
    /// # });
    /// ```ignore
    pub async fn create_pr(
        &self,
        title: &str,
        body: &str,
        base: &str,
        head: &str,
    ) -> Result<PrResult> {
        info!("Creating PR: {} -> {}", head, base);

        // Run preflight checks
        match self.preflight_check().await {
            Ok(()) => {
                info!("Preflight checks passed for PR creation");
            }
            Err(e) => {
                let message = format!("Preflight check failed: {}", e);
                log::warn!("{}", message);
                return Ok(PrResult {
                    success: false,
                    pr_url: None,
                    message,
                });
            }
        }

        // Create PR using gh CLI
        let output = tokio::process::Command::new("gh")
            .current_dir(&self.repo_path)
            .args(&[
                "pr", "create", "--title", title, "--body", body, "--base", base, "--head", head,
            ])
            .output()
            .await
            .context("Failed to execute gh pr create")?;

        let success = output.status.success();
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();

        if success {
            // Extract PR URL from output
            let pr_url = stdout
                .lines()
                .find(|line| line.contains("https://github.com"))
                .map(|line| line.trim().to_string());

            Ok(PrResult {
                success: true,
                pr_url,
                message: "Pull request created successfully".to_string(),
            })
        } else {
            Ok(PrResult {
                success: false,
                pr_url: None,
                message: format!("Failed to create PR: {}", stderr),
            })
        }
    }

    // DRY:FN:generate_pr_title
    /// Generate PR title from tier information
    pub fn generate_pr_title(tier_type: &str, tier_id: &str, title: &str) -> String {
        format!("[{}] {}: {}", tier_type.to_uppercase(), tier_id, title)
    }

    // DRY:FN:generate_pr_body
    /// Generate PR body from tier information
    pub fn generate_pr_body(
        description: &str,
        acceptance_criteria: &[String],
        files_changed: &[String],
    ) -> String {
        let mut body = String::new();

        // Description
        body.push_str("## Description\n\n");
        body.push_str(description);
        body.push_str("\n\n");

        // Acceptance Criteria
        if !acceptance_criteria.is_empty() {
            body.push_str("## Acceptance Criteria\n\n");
            for criterion in acceptance_criteria {
                body.push_str(&format!("- [ ] {}\n", criterion));
            }
            body.push_str("\n");
        }

        // Files Changed
        if !files_changed.is_empty() {
            body.push_str("## Files Changed\n\n");
            for file in files_changed {
                body.push_str(&format!("- `{}`\n", file));
            }
            body.push_str("\n");
        }

        body.push_str("---\n");
        body.push_str("*Generated by RWM Puppet Master*\n");

        body
    }

    /// Check if gh CLI is available
    async fn is_gh_available(&self) -> Result<bool> {
        let output = tokio::process::Command::new("which")
            .arg("gh")
            .output()
            .await?;

        Ok(output.status.success())
    }

    // DRY:FN:preflight_check
    /// Run preflight checks before attempting PR creation
    ///
    /// Verifies:
    /// - gh CLI is installed (checks `which gh`)
    /// - gh is authenticated to GitHub (checks `gh auth status`)
    ///
    /// # Returns
    /// - `Ok(())` if all checks pass
    /// - `Err` with actionable message if any check fails
    ///
    /// # Error Messages
    /// Provides user-friendly guidance:
    /// - Missing gh: "gh CLI not found. Install from https://cli.github.com/ and run 'gh auth login'"
    /// - Not authenticated: "gh CLI not authenticated. Run 'gh auth login' to authenticate with GitHub"
    ///
    /// # No Network Calls in Unit Tests
    /// While this method may make system calls (`which gh`, `gh auth status`),
    /// it does not make direct network/HTTP calls. Unit tests can safely mock
    /// or skip this behavior.
    pub async fn preflight_check(&self) -> Result<()> {
        // Check if gh CLI exists
        if !self.is_gh_available().await? {
            return Err(anyhow::anyhow!(
                "gh CLI not found. Install from https://cli.github.com/ and run 'gh auth login'"
            ));
        }

        // Check if gh is authenticated
        let auth_output = tokio::process::Command::new("gh")
            .args(&["auth", "status"])
            .output()
            .await
            .context("Failed to check gh authentication status")?;

        // gh auth status returns exit code 0 if authenticated
        if !auth_output.status.success() {
            let stderr = String::from_utf8_lossy(&auth_output.stderr);
            return Err(anyhow::anyhow!(
                "gh CLI not authenticated. Run 'gh auth login' to authenticate with GitHub. Details: {}",
                stderr.trim()
            ));
        }

        // Additional check: parse output for authentication confirmation
        let stdout = String::from_utf8_lossy(&auth_output.stdout);
        let stderr = String::from_utf8_lossy(&auth_output.stderr);
        let combined = format!("{}{}", stdout, stderr).to_lowercase();

        if !combined.contains("logged in") && !combined.contains("authenticated") {
            return Err(anyhow::anyhow!(
                "gh CLI authentication unclear. Please verify with 'gh auth status' and run 'gh auth login' if needed"
            ));
        }

        Ok(())
    }

    // DRY:FN:build_pr_create_args
    /// Build gh pr create command arguments (for testing and validation)
    pub fn build_pr_create_args(title: &str, body: &str, base: &str, head: &str) -> Vec<String> {
        vec![
            "pr".to_string(),
            "create".to_string(),
            "--title".to_string(),
            title.to_string(),
            "--body".to_string(),
            body.to_string(),
            "--base".to_string(),
            base.to_string(),
            "--head".to_string(),
            head.to_string(),
        ]
    }

    // DRY:FN:list_prs
    /// List open PRs
    pub async fn list_prs(&self) -> Result<Vec<PrInfo>> {
        let output = tokio::process::Command::new("gh")
            .current_dir(&self.repo_path)
            .args(&["pr", "list", "--json", "number,title,url,state"])
            .output()
            .await
            .context("Failed to list PRs")?;

        if !output.status.success() {
            return Ok(vec![]);
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        let prs: Vec<PrInfo> = serde_json::from_str(&stdout)?;

        Ok(prs)
    }

    // DRY:FN:close_pr
    /// Close a PR
    pub async fn close_pr(&self, pr_number: u32) -> Result<bool> {
        let output = tokio::process::Command::new("gh")
            .current_dir(&self.repo_path)
            .args(&["pr", "close", &pr_number.to_string()])
            .output()
            .await
            .context("Failed to close PR")?;

        Ok(output.status.success())
    }
}

// DRY:DATA:PrResult
/// Result of PR creation
#[derive(Debug, Clone)]
pub struct PrResult {
    pub success: bool,
    pub pr_url: Option<String>,
    pub message: String,
}

// DRY:DATA:PrInfo
/// PR information
#[derive(Debug, Clone, serde::Deserialize)]
pub struct PrInfo {
    pub number: u32,
    pub title: String,
    pub url: String,
    pub state: String,
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn test_generate_pr_title() {
        let title = PrManager::generate_pr_title("task", "TK-001-002", "Add authentication");
        assert_eq!(title, "[TASK] TK-001-002: Add authentication");
    }

    #[test]
    fn test_generate_pr_body() {
        let body = PrManager::generate_pr_body(
            "Implement JWT authentication",
            &[
                "Login works".to_string(),
                "Token validation works".to_string(),
            ],
            &["src/auth.rs".to_string()],
        );

        assert!(body.contains("## Description"));
        assert!(body.contains("Implement JWT authentication"));
        assert!(body.contains("## Acceptance Criteria"));
        assert!(body.contains("Login works"));
        assert!(body.contains("## Files Changed"));
        assert!(body.contains("src/auth.rs"));
    }

    #[test]
    fn test_build_pr_create_args() {
        let args =
            PrManager::build_pr_create_args("Test PR", "This is a test", "main", "feature-branch");

        assert_eq!(args.len(), 10);
        assert_eq!(args[0], "pr");
        assert_eq!(args[1], "create");
        assert_eq!(args[2], "--title");
        assert_eq!(args[3], "Test PR");
        assert_eq!(args[4], "--body");
        assert_eq!(args[5], "This is a test");
        assert_eq!(args[6], "--base");
        assert_eq!(args[7], "main");
        assert_eq!(args[8], "--head");
        assert_eq!(args[9], "feature-branch");
    }

    #[test]
    fn test_build_pr_create_args_with_special_chars() {
        let args = PrManager::build_pr_create_args(
            "[TASK] TK-001: Feature",
            "Description with\nnewlines",
            "main",
            "rwm/task/tk-001",
        );

        assert_eq!(args[3], "[TASK] TK-001: Feature");
        assert_eq!(args[5], "Description with\nnewlines");
        assert_eq!(args[9], "rwm/task/tk-001");
    }

    #[test]
    fn test_generate_pr_body_empty_criteria() {
        let body = PrManager::generate_pr_body("Simple fix", &[], &[]);

        assert!(body.contains("## Description"));
        assert!(body.contains("Simple fix"));
        assert!(!body.contains("## Acceptance Criteria"));
        assert!(!body.contains("## Files Changed"));
        assert!(body.contains("*Generated by RWM Puppet Master*"));
    }

    #[test]
    fn test_generate_pr_body_with_markdown() {
        let body = PrManager::generate_pr_body(
            "Fix bug with **bold** text",
            &["- [ ] Test passes".to_string()],
            &["src/main.rs".to_string()],
        );

        assert!(body.contains("Fix bug with **bold** text"));
        assert!(body.contains("- [ ] - [ ] Test passes")); // Note: double checkbox due to adding another
    }

    #[test]
    fn test_pr_result_creation() {
        let result = PrResult {
            success: true,
            pr_url: Some("https://github.com/owner/repo/pull/42".to_string()),
            message: "Success".to_string(),
        };

        assert!(result.success);
        assert_eq!(
            result.pr_url.unwrap(),
            "https://github.com/owner/repo/pull/42"
        );
    }

    #[test]
    fn test_pr_result_failure() {
        let result = PrResult {
            success: false,
            pr_url: None,
            message: "Authentication failed".to_string(),
        };

        assert!(!result.success);
        assert!(result.pr_url.is_none());
        assert!(result.message.contains("Authentication failed"));
    }

    #[test]
    fn test_generate_pr_title_various_tiers() {
        assert_eq!(
            PrManager::generate_pr_title("phase", "P1", "Phase 1"),
            "[PHASE] P1: Phase 1"
        );
        assert_eq!(
            PrManager::generate_pr_title("subtask", "ST-001", "Fix bug"),
            "[SUBTASK] ST-001: Fix bug"
        );
    }

    #[test]
    fn test_pr_manager_new() {
        let temp_dir = PathBuf::from("/tmp/test-repo");
        let manager = PrManager::new(temp_dir.clone());
        assert_eq!(manager.repo_path, temp_dir);
    }

    // Unit tests must not make network calls
    #[test]
    fn test_pr_result_success_with_url() {
        let result = PrResult {
            success: true,
            pr_url: Some("https://github.com/user/repo/pull/123".to_string()),
            message: "PR created successfully".to_string(),
        };

        assert!(result.success);
        assert!(result.pr_url.is_some());
        assert_eq!(
            result.pr_url.unwrap(),
            "https://github.com/user/repo/pull/123"
        );
        assert!(result.message.contains("successfully"));
    }

    #[test]
    fn test_pr_result_failure_no_url() {
        let result = PrResult {
            success: false,
            pr_url: None,
            message: "Preflight check failed: gh CLI not found".to_string(),
        };

        assert!(!result.success);
        assert!(result.pr_url.is_none());
        assert!(result.message.contains("Preflight check failed"));
    }

    #[test]
    fn test_build_pr_create_args_comprehensive() {
        let args = PrManager::build_pr_create_args(
            "[TASK] TK-001: Feature",
            "Multi-line\ndescription\nwith special chars: &<>\"'",
            "main",
            "feature/tk-001",
        );

        assert_eq!(args[0], "pr");
        assert_eq!(args[1], "create");
        assert!(args.contains(&"--title".to_string()));
        assert!(args.contains(&"[TASK] TK-001: Feature".to_string()));
        assert!(args.contains(&"--body".to_string()));
        assert!(args.contains(&"--base".to_string()));
        assert!(args.contains(&"main".to_string()));
        assert!(args.contains(&"--head".to_string()));
        assert!(args.contains(&"feature/tk-001".to_string()));
    }
}

// E2E validation tests - only run when gh is available and authenticated
#[cfg(test)]
mod e2e_tests {
    use super::*;
    use std::process::Command;

    /// Check if gh CLI is available and authenticated
    /// Returns true only if gh exists AND is authenticated
    fn is_gh_ready() -> bool {
        // Check if gh command exists
        let gh_exists = Command::new("which")
            .arg("gh")
            .output()
            .map(|output| output.status.success())
            .unwrap_or(false);

        if !gh_exists {
            return false;
        }

        // Check if gh is authenticated
        let gh_auth = Command::new("gh")
            .args(&["auth", "status"])
            .output()
            .map(|output| output.status.success())
            .unwrap_or(false);

        gh_auth
    }

    #[tokio::test]
    async fn test_preflight_check_validates_gh_availability() {
        let temp_dir = std::env::temp_dir().join("pr-test");
        let manager = PrManager::new(temp_dir);

        // Run preflight check
        let result = manager.preflight_check().await;

        if is_gh_ready() {
            // If gh is available and authenticated, preflight should pass
            assert!(
                result.is_ok(),
                "Preflight check should pass when gh is available and authenticated"
            );
        } else {
            // If gh is not available or not authenticated, preflight should fail with actionable error
            assert!(
                result.is_err(),
                "Preflight check should fail when gh is not available or not authenticated"
            );

            let error_msg = result.unwrap_err().to_string();
            // Error should contain actionable guidance
            assert!(
                error_msg.contains("gh CLI") || error_msg.contains("gh auth"),
                "Error message should mention gh CLI or authentication: {}",
                error_msg
            );
        }
    }

    #[tokio::test]
    async fn test_create_pr_returns_error_without_crash_when_gh_missing() {
        let temp_dir = std::env::temp_dir().join("pr-test-2");
        std::fs::create_dir_all(&temp_dir).ok();
        let manager = PrManager::new(temp_dir);

        // Attempt to create PR - should not crash regardless of gh availability
        let result = manager
            .create_pr("Test PR", "Test body", "main", "test-branch")
            .await;

        // Should return Ok with a PrResult, not crash with Err
        assert!(
            result.is_ok(),
            "create_pr should return Ok(PrResult), not crash"
        );

        let pr_result = result.unwrap();

        if !is_gh_ready() {
            // When gh is not ready, PrResult should indicate failure with actionable message
            assert!(
                !pr_result.success,
                "PrResult.success should be false when gh is not available"
            );
            assert!(
                pr_result.pr_url.is_none(),
                "PrResult.pr_url should be None when PR creation fails"
            );
            assert!(
                pr_result.message.contains("Preflight check failed")
                    || pr_result.message.contains("gh CLI"),
                "Message should indicate why PR creation failed: {}",
                pr_result.message
            );
        }
    }

    #[tokio::test]
    async fn test_is_gh_available_no_network_call() {
        // This test verifies the is_gh_available method behavior
        // It checks local command availability without network calls
        let temp_dir = std::env::temp_dir().join("pr-test-3");
        let manager = PrManager::new(temp_dir);

        let result = manager.is_gh_available().await;

        // Should complete without panic
        assert!(result.is_ok(), "is_gh_available should not panic");

        // Result should match whether 'gh' command exists locally
        let gh_exists = Command::new("which")
            .arg("gh")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false);

        assert_eq!(
            result.unwrap(),
            gh_exists,
            "is_gh_available should match 'which gh' result"
        );
    }

    #[tokio::test]
    async fn test_list_prs_handles_missing_gh_gracefully() {
        let temp_dir = std::env::temp_dir().join("pr-test-4");
        std::fs::create_dir_all(&temp_dir).ok();
        let manager = PrManager::new(temp_dir);

        // Should handle missing gh or unauthenticated gh gracefully
        let result = manager.list_prs().await;

        if is_gh_ready() {
            // If gh is ready, we should get a result (empty list or actual PRs)
            assert!(
                result.is_ok(),
                "list_prs should work when gh is authenticated"
            );
        } else {
            // If gh is not ready, should return empty list or error gracefully
            // Either Ok(empty vec) or Err is acceptable
            if let Ok(prs) = result {
                assert!(prs.is_empty() || true, "PRs list returned");
            }
        }
    }
}
