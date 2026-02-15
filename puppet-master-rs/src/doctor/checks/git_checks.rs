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

    // DRY:FN:install_plan -- OS-specific install command for GitHub CLI.
    fn install_plan() -> (String, String) {
        #[cfg(target_os = "windows")]
        {
            return (
                "Install GitHub CLI via winget".to_string(),
                "winget install --id GitHub.cli -e --accept-source-agreements --accept-package-agreements"
                    .to_string(),
            );
        }

        #[cfg(target_os = "macos")]
        {
            return (
                "Install GitHub CLI via Homebrew".to_string(),
                "brew install gh".to_string(),
            );
        }

        #[cfg(target_os = "linux")]
        {
            let cmd = r#"set -euo pipefail
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

arch="$(uname -m)"
case "$arch" in
  x86_64|amd64) gh_arch="amd64" ;;
  aarch64|arm64) gh_arch="arm64" ;;
  *) echo "Unsupported CPU architecture: $arch" >&2; exit 1 ;;
esac

version="$(curl -fsSL https://api.github.com/repos/cli/cli/releases/latest | sed -n 's/.*"tag_name": *"v\([^"]*\)".*/\1/p' | head -n 1)"
[ -n "$version" ] || { echo "Failed to detect latest GitHub CLI version" >&2; exit 1; }

archive="gh_${version}_linux_${gh_arch}.tar.gz"
curl -fsSL "https://github.com/cli/cli/releases/download/v${version}/${archive}" -o "$tmp_dir/$archive"
tar -xzf "$tmp_dir/$archive" -C "$tmp_dir"

mkdir -p "$HOME/.local/bin"
cp "$tmp_dir/gh_${version}_linux_${gh_arch}/bin/gh" "$HOME/.local/bin/gh"
chmod +x "$HOME/.local/bin/gh""#;

            return (
                "Install GitHub CLI to ~/.local/bin from official release".to_string(),
                cmd.to_string(),
            );
        }

        #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
        {
            (
                "Unsupported operating system".to_string(),
                String::new(),
            )
        }
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
        let Some(path) = find_tool_executable("gh") else {
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
                    message: format!("GitHub CLI found at {} but failed to execute", path.display()),
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
                details: Some("Run 'gh --version' manually to inspect the installation.".to_string()),
                can_fix: true,
                timestamp: Utc::now(),
            },
        }
    }

    async fn fix(&self, dry_run: bool) -> Option<FixResult> {
        let (summary, command) = Self::install_plan();
        if command.is_empty() {
            return Some(FixResult::failure(
                "Automatic GitHub CLI installation is not supported on this OS.",
            ));
        }

        if dry_run {
            return Some(
                FixResult::success(format!("Would install GitHub CLI: {}", summary))
                    .with_step(format!("Would run: {}", command)),
            );
        }

        let output = if cfg!(target_os = "windows") {
            tokio::process::Command::new("cmd")
                .args(["/C", &command])
                .output()
                .await
        } else {
            tokio::process::Command::new("sh")
                .args(["-c", &command])
                .output()
                .await
        };

        match output {
            Ok(output) if output.status.success() => Some(
                FixResult::success("GitHub CLI installed. Run 'gh auth login' to authenticate.")
                    .with_step(summary)
                    .with_step(command),
            ),
            Ok(output) => {
                let stderr = String::from_utf8_lossy(&output.stderr);
                let details = stderr.trim();
                let message = if details.is_empty() {
                    "GitHub CLI installation failed.".to_string()
                } else {
                    format!("GitHub CLI installation failed: {}", details)
                };
                Some(FixResult::failure(message).with_step(summary).with_step(command))
            }
            Err(e) => Some(
                FixResult::failure(format!("Failed to start GitHub CLI installation: {}", e))
                    .with_step(summary)
                    .with_step(command),
            ),
        }
    }

    fn has_fix(&self) -> bool {
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn github_install_plan_is_not_empty() {
        let (summary, command) = GitHubCliCheck::install_plan();
        assert!(!summary.trim().is_empty());
        #[cfg(any(target_os = "windows", target_os = "macos", target_os = "linux"))]
        assert!(!command.trim().is_empty());
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
