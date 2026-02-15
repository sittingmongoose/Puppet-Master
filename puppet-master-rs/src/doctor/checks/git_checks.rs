//! Git-related health checks

use crate::types::{CheckCategory, CheckResult, DoctorCheck, FixResult};
use async_trait::async_trait;
use chrono::Utc;
use which::which;

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
        match which("git") {
            Ok(path) => {
                // Try to get version
                if let Ok(output) = tokio::process::Command::new("git")
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
            Err(_) => CheckResult {
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
        let output = tokio::process::Command::new("git")
            .args(&["rev-parse", "--git-dir"])
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
        if dry_run {
            return Some(FixResult {
                success: true,
                message: "Would initialize git repository".to_string(),
                steps: vec!["git init".to_string()],
                fixable: true,
                timestamp: Utc::now(),
            });
        }

        let output = tokio::process::Command::new("git")
            .arg("init")
            .output()
            .await;

        match output {
            Ok(output) if output.status.success() => Some(FixResult {
                success: true,
                message: "Initialized git repository".to_string(),
                steps: vec!["git init".to_string()],
                fixable: true,
                timestamp: Utc::now(),
            }),
            _ => Some(FixResult {
                success: false,
                message: "Failed to initialize git repository".to_string(),
                steps: vec![],
                fixable: true,
                timestamp: Utc::now(),
            }),
        }
    }
}
