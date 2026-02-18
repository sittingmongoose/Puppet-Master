//! Git-related health checks

use crate::types::{CheckCategory, CheckResult, DoctorCheck, FixResult};
use async_trait::async_trait;
use chrono::Utc;
use std::path::PathBuf;
use which::which;

// DRY:FN:find_tool_executable -- Resolve executable via PATH + fallback directories.
fn find_tool_executable(tool: &str) -> Option<PathBuf> {
    if let Ok(path) = which(tool) {
        return Some(path);
    }

    for dir in crate::platforms::path_utils::get_fallback_directories() {
        let candidate = dir.join(tool);
        if let Some(found) = crate::platforms::path_utils::check_executable_exists(&candidate) {
            return Some(found);
        }
    }

    crate::platforms::path_utils::find_in_shell_path(tool)
}

// DRY:DATA:GitInstalledCheck
/// Check if git is installed
pub struct GitInstalledCheck;

impl GitInstalledCheck {
    // DRY:FN:new
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl DoctorCheck for GitInstalledCheck {
    fn name(&self) -> &str {
        "git-installed"
    }

    fn category(&self) -> CheckCategory {
        CheckCategory::Git
    }

    fn description(&self) -> &str {
        "Check if git is installed and available"
    }

    async fn run(&self) -> CheckResult {
        match find_tool_executable("git") {
            Some(path) => {
                // Try to get version
                if let Ok(output) = tokio::process::Command::new(&path)
                    .arg("--version")
                    .output()
                    .await
                {
                    let version = String::from_utf8_lossy(&output.stdout);
                    CheckResult {
                        passed: true,
                        message: format!("Git found at {:?}", path),
                        details: Some(version.trim().to_string()),
                        can_fix: false,
                        timestamp: Utc::now(),
                    }
                } else {
                    CheckResult {
                        passed: true,
                        message: format!("Git found at {:?}", path),
                        details: None,
                        can_fix: false,
                        timestamp: Utc::now(),
                    }
                }
            }
            None => CheckResult {
                passed: false,
                message: "Git not found".to_string(),
                details: Some("Install git from https://git-scm.com/".to_string()),
                can_fix: false,
                timestamp: Utc::now(),
            },
        }
    }

    async fn fix(&self, _dry_run: bool) -> Option<FixResult> {
        None
    }
}

// DRY:DATA:GitHubCliCheck
/// Check if GitHub CLI (`gh`) is installed and provide an install fix.
pub struct GitHubCliCheck;

impl GitHubCliCheck {
    // DRY:FN:new
    pub fn new() -> Self {
        Self
    }

}

#[async_trait]
impl DoctorCheck for GitHubCliCheck {
    fn name(&self) -> &str {
        "github-cli"
    }

    fn category(&self) -> CheckCategory {
        CheckCategory::Git
    }

    fn description(&self) -> &str {
        "Check if GitHub CLI (gh) is installed and available"
    }

    async fn run(&self) -> CheckResult {
        let Some(path) = crate::platforms::path_utils::resolve_app_local_executable("gh") else {
            return CheckResult {
                passed: false,
                message: "GitHub CLI (gh) not found".to_string(),
                details: Some(
                    "Install GitHub CLI and run 'gh auth login'. On Linux, Puppet Master can install to ~/.local/bin."
                        .to_string(),
                ),
                can_fix: true,
                timestamp: Utc::now(),
            };
        };

        match tokio::process::Command::new(&path)
            .arg("--version")
            .output()
            .await
        {
            Ok(output) if output.status.success() => {
                let version = String::from_utf8_lossy(&output.stdout);
                CheckResult {
                    passed: true,
                    message: format!("GitHub CLI found at {}", path.display()),
                    details: Some(version.trim().to_string()),
                    can_fix: false,
                    timestamp: Utc::now(),
                }
            }
            Ok(output) => {
                let stderr = String::from_utf8_lossy(&output.stderr);
                CheckResult {
                    passed: false,
                    message: format!(
                        "GitHub CLI found at {} but failed to execute",
                        path.display()
                    ),
                    details: Some(stderr.trim().to_string()),
                    can_fix: true,
                    timestamp: Utc::now(),
                }
            }
            Err(e) => CheckResult {
                passed: false,
                message: format!(
                    "GitHub CLI found at {} but failed to run: {}",
                    path.display(),
                    e
                ),
                details: Some(
                    "Run 'gh --version' manually to inspect the installation.".to_string(),
                ),
                can_fix: true,
                timestamp: Utc::now(),
            },
        }
    }

    async fn fix(&self, dry_run: bool) -> Option<FixResult> {
        if dry_run {
            return Some(FixResult::success(
                "Would install GitHub CLI from official GitHub releases (native binary)"
            ).with_step("Download native gh binary to app-local bin/"));
        }

        let outcome = crate::install::install_coordinator::install_gh_cli().await;
        let mut result = if outcome.success {
            FixResult::success("GitHub CLI installed. Run 'gh auth login' to authenticate.")
        } else {
            FixResult::failure(outcome.message)
        };
        for line in &outcome.log_lines {
            result = result.with_step(line.clone());
        }
        Some(result)
    }

    fn has_fix(&self) -> bool {
        true
    }
}

#[cfg(test)]
mod tests {}

// DRY:DATA:GitConfiguredCheck
/// Check if git is configured
pub struct GitConfiguredCheck;

impl GitConfiguredCheck {
    // DRY:FN:new
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl DoctorCheck for GitConfiguredCheck {
    fn name(&self) -> &str {
        "git-configured"
    }

    fn category(&self) -> CheckCategory {
        CheckCategory::Git
    }

    fn description(&self) -> &str {
        "Check if git user.name and user.email are configured"
    }

    async fn run(&self) -> CheckResult {
        let name_result = tokio::process::Command::new("git")
            .args(&["config", "--global", "user.name"])
            .output()
            .await;

        let email_result = tokio::process::Command::new("git")
            .args(&["config", "--global", "user.email"])
            .output()
            .await;

        match (name_result, email_result) {
            (Ok(name_output), Ok(email_output))
                if name_output.status.success() && email_output.status.success() =>
            {
                let name = String::from_utf8_lossy(&name_output.stdout)
                    .trim()
                    .to_string();
                let email = String::from_utf8_lossy(&email_output.stdout)
                    .trim()
                    .to_string();

                if !name.is_empty() && !email.is_empty() {
                    CheckResult {
                        passed: true,
                        message: "Git is configured".to_string(),
                        details: Some(format!("Name: {}, Email: {}", name, email)),
                        can_fix: false,
                        timestamp: Utc::now(),
                    }
                } else {
                    CheckResult {
                        passed: false,
                        message: "Git user.name or user.email not set".to_string(),
                        details: Some("Run: git config --global user.name \"Your Name\" && git config --global user.email \"you@example.com\"".to_string()),
                        can_fix: false,
                    timestamp: Utc::now(),
                    }
                }
            }
            _ => CheckResult {
                passed: false,
                message: "Could not read git config".to_string(),
                details: Some("Ensure git is installed and configured".to_string()),
                can_fix: false,
                timestamp: Utc::now(),
            },
        }
    }

    async fn fix(&self, _dry_run: bool) -> Option<FixResult> {
        None
    }
}

// DRY:DATA:GitRepoCheck
/// Check if we're in a git repository
pub struct GitRepoCheck;

impl GitRepoCheck {
    // DRY:FN:new
    pub fn new() -> Self {
        Self
    }

    /// Resolve the directory where git init should run.
    /// Tries: 1) CWD (if writable), 2) home directory.
    fn resolve_git_init_dir() -> PathBuf {
        // Try CWD if it's writable
        if let Ok(cwd) = std::env::current_dir() {
            if Self::is_writable(&cwd) {
                return cwd;
            }
        }

        // Last resort: home directory
        let home = std::env::var("HOME")
            .or_else(|_| std::env::var("USERPROFILE"))
            .unwrap_or_else(|_| ".".to_string());
        PathBuf::from(home)
    }

    fn is_writable(path: &std::path::Path) -> bool {
        let test_file = path.join(".puppet-master-write-test");
        if std::fs::write(&test_file, "").is_ok() {
            let _ = std::fs::remove_file(&test_file);
            true
        } else {
            false
        }
    }
}

#[async_trait]
impl DoctorCheck for GitRepoCheck {
    fn name(&self) -> &str {
        "git-repo"
    }

    fn category(&self) -> CheckCategory {
        CheckCategory::Git
    }

    fn description(&self) -> &str {
        "Check if current directory is a git repository"
    }

    async fn run(&self) -> CheckResult {
        let target_dir = Self::resolve_git_init_dir();
        let output = tokio::process::Command::new("git")
            .args(&["rev-parse", "--git-dir"])
            .current_dir(&target_dir)
            .output()
            .await;

        match output {
            Ok(output) if output.status.success() => {
                let git_dir = String::from_utf8_lossy(&output.stdout).trim().to_string();
                CheckResult {
                    passed: true,
                    message: "Git repository found".to_string(),
                    details: Some(format!("Git directory: {}", git_dir)),
                    can_fix: false,
                    timestamp: Utc::now(),
                }
            }
            _ => CheckResult {
                passed: false,
                message: "Not in a git repository".to_string(),
                details: Some("Run: git init".to_string()),
                can_fix: true,
                timestamp: Utc::now(),
            },
        }
    }

    async fn fix(&self, dry_run: bool) -> Option<FixResult> {
        // Determine the target directory for git init.
        // Prefer the project working directory from gui config, fall back to CWD.
        let target_dir = Self::resolve_git_init_dir();

        if dry_run {
            return Some(FixResult {
                success: true,
                message: format!(
                    "Would initialize git repository in {}",
                    target_dir.display()
                ),
                steps: vec![format!("git init (in {})", target_dir.display())],
                fixable: true,
                timestamp: Utc::now(),
            });
        }

        // Verify directory is writable before attempting git init
        if !target_dir.exists() {
            return Some(FixResult {
                success: false,
                message: format!(
                    "Directory does not exist: {}. Open or create a project first.",
                    target_dir.display()
                ),
                steps: vec![],
                fixable: true,
                timestamp: Utc::now(),
            });
        }

        let output = tokio::process::Command::new("git")
            .arg("init")
            .current_dir(&target_dir)
            .output()
            .await;

        match output {
            Ok(output) if output.status.success() => Some(FixResult {
                success: true,
                message: format!(
                    "Initialized git repository in {}",
                    target_dir.display()
                ),
                steps: vec![format!("git init (in {})", target_dir.display())],
                fixable: true,
                timestamp: Utc::now(),
            }),
            Ok(output) => {
                let stderr = String::from_utf8_lossy(&output.stderr);
                Some(FixResult {
                    success: false,
                    message: format!(
                        "Failed to initialize git repository in {}: {}",
                        target_dir.display(),
                        stderr.trim()
                    ),
                    steps: vec![],
                    fixable: true,
                    timestamp: Utc::now(),
                })
            }
            Err(e) => Some(FixResult {
                success: false,
                message: format!(
                    "Failed to run git init in {}: {}",
                    target_dir.display(),
                    e
                ),
                steps: vec![],
                fixable: true,
                timestamp: Utc::now(),
            }),
        }
    }
}
