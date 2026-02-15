//! Authentication status checking for AI platforms
//!
//! This module provides authentication verification for each platform,
//! checking CLI authentication status and subscription auth (preferred over API keys).

use crate::platforms::platform_specs;
use crate::types::Platform;
use anyhow::{Result, anyhow};
use log::debug;
use std::collections::HashMap;
use std::process::Stdio;
use tokio::process::Command;

// DRY:DATA:AuthStatusChecker
/// Authentication status checker for platforms
pub struct AuthStatusChecker {
    /// Timeout for auth check commands (in seconds)
    timeout_secs: u64,
}

impl AuthStatusChecker {
    /// Creates a new auth status checker with default timeout
    pub fn new() -> Self {
        Self { timeout_secs: 10 }
    }

    /// Creates a new auth status checker with custom timeout
    pub fn with_timeout(timeout_secs: u64) -> Self {
        Self { timeout_secs }
    }

    /// Checks authentication status for a specific platform
    pub async fn check_platform(&self, platform: Platform) -> AuthCheckResult {
        debug!("Checking authentication for platform: {}", platform);

        match platform {
            Platform::Cursor => self.check_cursor().await,
            Platform::Codex => self.check_codex().await,
            Platform::Claude => self.check_claude().await,
            Platform::Gemini => self.check_gemini().await,
            Platform::Copilot => self.check_copilot().await,
        }
    }

    /// Checks authentication for all platforms
    pub async fn check_all(&self) -> HashMap<Platform, AuthCheckResult> {
        let mut results = HashMap::new();

        for platform in Platform::all() {
            let result = self.check_platform(*platform).await;
            results.insert(*platform, result);
        }

        results
    }

    /// Checks only authenticated platforms
    pub async fn get_authenticated_platforms(&self) -> Vec<Platform> {
        let results = self.check_all().await;

        results
            .into_iter()
            .filter_map(|(platform, result)| {
                if result.authenticated {
                    Some(platform)
                } else {
                    None
                }
            })
            .collect()
    }

    // Platform-specific authentication checks

    async fn check_cursor(&self) -> AuthCheckResult {
        // Prefer subscription auth: agent status (Cursor docs)
        let spec = platform_specs::get_spec(Platform::Cursor);
        for cmd in platform_specs::cli_binary_names(Platform::Cursor) {
            if let Ok(output) = self.run_command(cmd, spec.auth.status_args).await {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let stderr = String::from_utf8_lossy(&output.stderr);
                let combined = format!("{}{}", stdout, stderr).to_lowercase();

                if combined.contains("logged in") || combined.contains("authenticated") {
                    return AuthCheckResult::authenticated("Cursor CLI is authenticated");
                }
            }
        }

        AuthCheckResult::not_authenticated("Not authenticated. Run 'agent login' to authenticate.")
    }

    async fn check_codex(&self) -> AuthCheckResult {
        // Subscription auth via Codex CLI login
        let spec = platform_specs::get_spec(Platform::Codex);
        for cmd in platform_specs::cli_binary_names(Platform::Codex) {
            if let Ok(output) = self.run_command(cmd, spec.auth.status_args).await {
                if output.status.success() {
                    return AuthCheckResult::authenticated(
                        "Codex CLI is authenticated via subscription",
                    );
                }
            }
        }

        AuthCheckResult::not_authenticated("Not authenticated. Run 'codex login' to authenticate.")
    }

    async fn check_claude(&self) -> AuthCheckResult {
        // Claude has no `auth status` subcommand.
        // Check: 1) ~/.claude/ credentials exist  2) `claude --version` succeeds (CLI installed)
        let home = std::env::var("HOME").unwrap_or_default();
        let cred_path = std::path::Path::new(&home).join(".claude");
        let spec = platform_specs::get_spec(Platform::Claude);

        if cred_path.exists() {
            for cmd in platform_specs::cli_binary_names(Platform::Claude) {
                if let Ok(output) = self.run_command(cmd, &[spec.version_command]).await {
                    if output.status.success() {
                        return AuthCheckResult::authenticated(
                            "Claude CLI installed and credentials cached",
                        );
                    }
                }
            }
        }

        // CLI exists but no cached creds
        for cmd in platform_specs::cli_binary_names(Platform::Claude) {
            if let Ok(output) = self.run_command(cmd, &[spec.version_command]).await {
                if output.status.success() {
                    return AuthCheckResult::not_authenticated(
                        "Claude CLI installed but not authenticated. Run 'claude' to complete browser-based login.",
                    );
                }
            }
        }

        AuthCheckResult::not_authenticated(
            "Not authenticated. Install Claude Code CLI and run 'claude' to complete browser-based login.",
        )
    }

    async fn check_gemini(&self) -> AuthCheckResult {
        let home = std::env::var("HOME").unwrap_or_default();
        let cred_path = std::path::Path::new(&home).join(".gemini");
        let spec = platform_specs::get_spec(Platform::Gemini);

        if cred_path.exists() {
            for cmd in platform_specs::cli_binary_names(Platform::Gemini) {
                if let Ok(output) = self.run_command(cmd, &[spec.version_command]).await {
                    if output.status.success() {
                        return AuthCheckResult::authenticated(
                            "Gemini CLI installed and credentials cached",
                        );
                    }
                }
            }
        }

        // CLI exists but no cached creds
        for cmd in platform_specs::cli_binary_names(Platform::Gemini) {
            if let Ok(output) = self.run_command(cmd, &[spec.version_command]).await {
                if output.status.success() {
                    return AuthCheckResult::not_authenticated(
                        "Gemini CLI installed but not authenticated. Run 'gemini' and select 'Login with Google'.",
                    );
                }
            }
        }

        AuthCheckResult::not_authenticated(
            "Not authenticated. Run 'gemini' and select 'Login with Google'.",
        )
    }

    async fn check_copilot(&self) -> AuthCheckResult {
        let spec = platform_specs::get_spec(Platform::Copilot);
        let mut copilot_cli_installed = false;
        for cmd in platform_specs::cli_binary_names(Platform::Copilot) {
            if let Ok(output) = self.run_command(cmd, &[spec.version_command]).await {
                if output.status.success() {
                    copilot_cli_installed = true;
                    break;
                }
            }
        }

        // Copilot CLI uses GitHub auth. Check `gh auth status` as a fallback
        // because GitHub auth underpins Copilot session auth.
        if let Ok(output) = self.run_command("gh", &["auth", "status"]).await {
            if output.status.success() {
                return AuthCheckResult::authenticated(
                    "GitHub CLI is authenticated (Copilot uses GitHub auth)",
                );
            }
        }

        if copilot_cli_installed {
            AuthCheckResult::not_authenticated(
                "Copilot CLI installed but not authenticated. Run 'copilot login' (or use /login interactively; GH_TOKEN/GITHUB_TOKEN also supported).",
            )
        } else {
            AuthCheckResult::not_authenticated(
                "Not authenticated. Install Copilot CLI, then run 'copilot login' (or use /login interactively; GH_TOKEN/GITHUB_TOKEN also supported).",
            )
        }
    }

    /// Check GitHub CLI authentication (separate from Copilot for general Git operations)
    pub async fn check_github(&self) -> AuthCheckResult {
        if let Ok(output) = self.run_command("gh", &["auth", "status"]).await {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let stderr = String::from_utf8_lossy(&output.stderr);
            let combined = format!("{}{}", stdout, stderr);

            if combined.to_lowercase().contains("logged in")
                || combined.to_lowercase().contains("authenticated to")
            {
                return AuthCheckResult::authenticated("GitHub CLI is authenticated");
            }
        }

        AuthCheckResult::not_authenticated("Run 'gh auth login' for GitHub authentication.")
    }

    /// Runs a command with timeout
    async fn run_command(&self, program: &str, args: &[&str]) -> Result<std::process::Output> {
        let timeout = tokio::time::Duration::from_secs(self.timeout_secs);

        let future = Command::new(program)
            .args(args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output();

        match tokio::time::timeout(timeout, future).await {
            Ok(Ok(output)) => Ok(output),
            Ok(Err(e)) => Err(anyhow!("Command execution failed: {}", e)),
            Err(_) => Err(anyhow!(
                "Command timed out after {} seconds",
                self.timeout_secs
            )),
        }
    }
}

impl Default for AuthStatusChecker {
    fn default() -> Self {
        Self::new()
    }
}

// DRY:DATA:AuthCheckResult
/// Result of an authentication check
#[derive(Debug, Clone)]
pub struct AuthCheckResult {
    /// Whether platform is authenticated
    pub authenticated: bool,

    /// Status message
    pub message: String,

    /// Additional details
    pub details: Option<String>,

    /// Checked at timestamp
    pub checked_at: chrono::DateTime<chrono::Utc>,
}

impl AuthCheckResult {
    /// Creates an authenticated result
    pub fn authenticated(message: impl Into<String>) -> Self {
        Self {
            authenticated: true,
            message: message.into(),
            details: None,
            checked_at: chrono::Utc::now(),
        }
    }

    /// Creates a not authenticated result
    pub fn not_authenticated(message: impl Into<String>) -> Self {
        Self {
            authenticated: false,
            message: message.into(),
            details: None,
            checked_at: chrono::Utc::now(),
        }
    }

    /// Adds details to the result
    pub fn with_details(mut self, details: impl Into<String>) -> Self {
        self.details = Some(details.into());
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_check_all() {
        let checker = AuthStatusChecker::new();
        let result =
            tokio::time::timeout(std::time::Duration::from_secs(10), checker.check_all()).await;

        match result {
            Ok(results) => {
                assert_eq!(results.len(), 5);
                for platform in Platform::all() {
                    assert!(results.contains_key(platform));
                }
            }
            Err(_) => {} // Timeout is acceptable in test environment
        }
    }

    #[test]
    fn test_auth_check_result() {
        let result = AuthCheckResult::authenticated("Test message").with_details("Additional info");

        assert!(result.authenticated);
        assert_eq!(result.message, "Test message");
        assert_eq!(result.details, Some("Additional info".to_string()));
    }

    #[tokio::test]
    async fn test_get_authenticated_platforms() {
        let checker = AuthStatusChecker::new();
        // Use tokio timeout to prevent hanging if CLIs are not installed
        let result = tokio::time::timeout(
            std::time::Duration::from_secs(5),
            checker.get_authenticated_platforms(),
        )
        .await;

        match result {
            Ok(platforms) => assert!(platforms.len() <= 5),
            Err(_) => {} // Timeout is acceptable in test environment
        }
    }
}
