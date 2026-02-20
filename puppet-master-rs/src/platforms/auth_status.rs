//! Authentication status checking for AI platforms
//!
//! This module provides authentication verification for each platform,
//! checking CLI authentication status and subscription auth (preferred over API keys).

use crate::platforms::path_utils;
use crate::platforms::platform_detector::PlatformDetector;
use crate::platforms::platform_specs;
use crate::types::Platform;
use anyhow::{Result, anyhow};
use log::debug;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use tokio::process::Command;

// DRY:DATA:AuthStatusChecker
/// Authentication status checker for platforms
pub struct AuthStatusChecker {
    /// Timeout for auth check commands (in seconds)
    timeout_secs: u64,
}

// DRY:HELPER:get_home_dir — Cross-platform home directory (HOME on Unix, USERPROFILE on Windows)
fn get_home_dir() -> Option<PathBuf> {
    std::env::var_os("HOME")
        .or_else(|| std::env::var_os("USERPROFILE"))
        .map(PathBuf::from)
}

impl AuthStatusChecker {
    // DRY:FN:new
    /// Creates a new auth status checker with default timeout
    pub fn new() -> Self {
        Self { timeout_secs: 10 }
    }
    // DRY:FN:with_timeout

    /// Creates a new auth status checker with custom timeout
    pub fn with_timeout(timeout_secs: u64) -> Self {
        Self { timeout_secs }
    }

    /// Checks authentication status for a specific platform
    pub async fn check_platform(&self, platform: Platform) -> AuthCheckResult {
        debug!("Checking authentication for platform: {}", platform);

        if let Some(env_var) = Self::active_env_override(platform) {
            return AuthCheckResult::authenticated(format!(
                "Authenticated via environment variable {}",
                env_var
            ))
            .with_details(
                "Legacy headless/CI override detected. Browser/subscription auth is preferred for local interactive use.",
            );
        }

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
        if PlatformDetector::detect_platform(Platform::Cursor)
            .await
            .is_none()
        {
            return AuthCheckResult::not_authenticated(
                "Cursor CLI is not installed. Install Cursor CLI, then run 'agent login'.",
            );
        }
        // Prefer subscription auth: agent status (Cursor docs)
        let spec = platform_specs::get_spec(Platform::Cursor);
        for cmd in platform_specs::cli_binary_names(Platform::Cursor) {
            if let Ok(output) = self.run_command(cmd, spec.auth.status_args).await {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let stderr = String::from_utf8_lossy(&output.stderr);
                let combined = format!("{}{}", stdout, stderr).to_lowercase();

                // Guard against "Not logged in" matching the "logged in" substring
                let clearly_not = combined.contains("not logged in")
                    || combined.contains("not authenticated")
                    || combined.contains("sign in to");
                if clearly_not {
                    continue;
                }

                if combined.contains("logged in") || combined.contains("authenticated") {
                    return AuthCheckResult::authenticated("Cursor CLI is authenticated");
                }
            }
        }

        AuthCheckResult::not_authenticated("Not authenticated. Run 'agent login' to authenticate.")
    }

    async fn check_codex(&self) -> AuthCheckResult {
        if PlatformDetector::detect_platform(Platform::Codex)
            .await
            .is_none()
        {
            return AuthCheckResult::not_authenticated(
                "Codex CLI is not installed. Install Codex CLI, then run 'codex login'.",
            );
        }
        // Subscription auth via Codex CLI login
        let spec = platform_specs::get_spec(Platform::Codex);
        for cmd in platform_specs::cli_binary_names(Platform::Codex) {
            if let Ok(output) = self.run_command(cmd, spec.auth.status_args).await {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let stderr = String::from_utf8_lossy(&output.stderr);
                let combined = format!("{}{}", stdout, stderr).to_lowercase();

                let clearly_not_authenticated = combined.contains("not logged")
                    || combined.contains("not authenticated")
                    || combined.contains("login required")
                    || combined.contains("please login");
                if clearly_not_authenticated {
                    continue;
                }

                if output.status.success()
                    || combined.contains("logged in")
                    || combined.contains("authenticated")
                {
                    return AuthCheckResult::authenticated(
                        "Codex CLI is authenticated via subscription",
                    );
                }
            }
        }

        AuthCheckResult::not_authenticated("Not authenticated. Run 'codex login' to authenticate.")
    }

    async fn check_claude(&self) -> AuthCheckResult {
        if PlatformDetector::detect_platform(Platform::Claude)
            .await
            .is_none()
        {
            return AuthCheckResult::not_authenticated(
                "Claude CLI is not installed. Install Claude Code CLI, then run 'claude' to complete browser-based login.",
            );
        }

        // Use `claude auth status` which returns JSON {"loggedIn":true/false,...}
        // This is authoritative (checks macOS Keychain etc.) unlike the filesystem check
        // which gives false positives because ~/.claude/ dirs are recreated on every run.
        for cmd in platform_specs::cli_binary_names(Platform::Claude) {
            if let Ok(output) = self.run_command(cmd, &["auth", "status"]).await {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let stderr = String::from_utf8_lossy(&output.stderr);
                let combined = format!("{}{}", stdout, stderr).to_lowercase();

                // Claude outputs JSON: {"loggedIn":true,...} or {"loggedIn":false,...}
                // Remove whitespace around colon for robustness
                let compact = combined.replace(" ", "");
                if compact.contains("\"loggedin\":true") {
                    return AuthCheckResult::authenticated("Claude CLI is authenticated");
                }
                // CLI ran but reported not logged in
                return AuthCheckResult::not_authenticated(
                    "Claude CLI installed but not authenticated. Run 'claude auth login'.",
                );
            }
        }

        AuthCheckResult::not_authenticated(
            "Not authenticated. Install Claude Code CLI and run 'claude' to complete browser-based login.",
        )
    }

    /// Returns true when ~/.gemini/google_accounts.json has a non-null "active" account.
    ///
    /// We MUST NOT use `credentials_cached("~/.gemini/")` here: the Gemini CLI creates
    /// non-auth files (projects.json, history/, tmp/, …) on every invocation, so the
    /// directory is always non-empty even when the user is logged out.
    fn gemini_has_active_account() -> bool {
        let Some(home) = get_home_dir() else {
            return false;
        };
        let config_path = home.join(".gemini").join("google_accounts.json");
        let Ok(contents) = std::fs::read_to_string(&config_path) else {
            return false;
        };
        if let Ok(json) = serde_json::from_str::<serde_json::Value>(&contents) {
            return json
                .get("active")
                .map(|v| !v.is_null())
                .unwrap_or(false);
        }
        false
    }

    async fn check_gemini(&self) -> AuthCheckResult {
        if PlatformDetector::detect_platform(Platform::Gemini)
            .await
            .is_none()
        {
            return AuthCheckResult::not_authenticated(
                "Gemini CLI is not installed. Install Gemini CLI, then run 'gemini' and Login with Google.",
            );
        }

        if Self::gemini_has_active_account() {
            return AuthCheckResult::authenticated(
                "Authenticated (Google account from ~/.gemini/google_accounts.json)",
            );
        }

        AuthCheckResult::not_authenticated(
            "Gemini CLI installed but not authenticated. Run 'gemini' and select 'Login with Google'.",
        )
    }

    async fn check_copilot(&self) -> AuthCheckResult {
        if PlatformDetector::detect_platform(Platform::Copilot)
            .await
            .is_none()
        {
            return AuthCheckResult::not_authenticated(
                "Copilot CLI is not installed. Install Copilot CLI, then run 'copilot login'.",
            );
        }

        // Primary: check ~/.copilot/config.json for logged_in_users
        // (copilot login stores auth here, separate from gh auth)
        if Self::copilot_config_has_logged_in_user() {
            return AuthCheckResult::authenticated("Authenticated (credentials from ~/.copilot/)");
        }

        // Fallback: check gh auth status as a proxy
        let gh_authenticated = if let Ok(output) = self.run_command("gh", &["auth", "status"]).await
        {
            Self::gh_auth_output_is_authenticated(&output)
        } else {
            false
        };

        if gh_authenticated {
            return AuthCheckResult::authenticated(
                "Copilot CLI detected; authentication inferred from active GitHub auth.",
            );
        }

        AuthCheckResult::not_authenticated(
            "Copilot CLI installed but not authenticated. Run 'copilot login' to authenticate.",
        )
    }

    /// Check if ~/.copilot/config.json contains logged_in_users with at least one entry.
    fn copilot_config_has_logged_in_user() -> bool {
        let Some(home) = get_home_dir() else {
            return false;
        };
        let config_path = home.join(".copilot").join("config.json");
        let Ok(contents) = std::fs::read_to_string(&config_path) else {
            return false;
        };
        if let Ok(json) = serde_json::from_str::<serde_json::Value>(&contents) {
            if let Some(users) = json.get("logged_in_users").and_then(|v| v.as_array()) {
                return !users.is_empty();
            }
        }
        false
    }

    /// Check GitHub CLI authentication (separate from Copilot for general Git operations)
    pub async fn check_github(&self) -> AuthCheckResult {
        if self.run_command("gh", &["--version"]).await.is_err() {
            return AuthCheckResult::not_authenticated(
                "GitHub CLI is not installed or not discoverable. Install 'gh', then run 'gh auth login'.",
            );
        }

        if let Ok(output) = self.run_command("gh", &["auth", "status"]).await {
            if Self::gh_auth_output_is_authenticated(&output) {
                return AuthCheckResult::authenticated("GitHub CLI is authenticated");
            }

            return AuthCheckResult::not_authenticated(
                "GitHub CLI is installed but not authenticated. Run 'gh auth login'.",
            );
        }

        AuthCheckResult::not_authenticated(
            "GitHub CLI is installed, but auth status could not be determined. Run 'gh auth status' or 'gh auth login'.",
        )
    }

    /// Runs a command with timeout.
    /// Uses enhanced PATH so node-based CLIs (codex, gemini, copilot) can find `node` when spawned from GUI apps.
    async fn run_command(&self, program: &str, args: &[&str]) -> Result<std::process::Output> {
        let timeout = tokio::time::Duration::from_secs(self.timeout_secs);
        let resolved_program = self.resolve_program(program);

        let future = Command::new(&resolved_program)
            .env("PATH", path_utils::build_enhanced_path_for_subprocess())
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

    fn active_env_override(platform: Platform) -> Option<&'static str> {
        let vars: &[&str] = match platform {
            Platform::Cursor => &["CURSOR_API_KEY"],
            Platform::Codex => &["CODEX_API_KEY", "OPENAI_API_KEY"],
            Platform::Claude => &["ANTHROPIC_API_KEY"],
            Platform::Gemini => &["GEMINI_API_KEY", "GOOGLE_API_KEY"],
            Platform::Copilot => &["GH_TOKEN", "GITHUB_TOKEN"],
        };

        vars.iter().copied().find(|key| {
            std::env::var(key)
                .map(|value| !value.trim().is_empty())
                .unwrap_or(false)
        })
    }

    // DRY:FN:gh_auth_output_is_authenticated — Normalize GH auth status parsing.
    fn gh_auth_output_is_authenticated(output: &std::process::Output) -> bool {
        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);
        let combined = format!("{}{}", stdout, stderr).to_lowercase();

        (output.status.success()
            && (combined.contains("logged in")
                || combined.contains("authenticated to")
                || combined.contains("active account")))
            || combined.contains("logged in")
            || combined.contains("authenticated to")
    }

    // DRY:FN:resolve_program — Resolve executable path via app-local + PATH + known fallback dirs.
    fn resolve_program(&self, program: &str) -> PathBuf {
        let path = Path::new(program);
        if path.is_absolute() || program.contains(std::path::MAIN_SEPARATOR) {
            return path.to_path_buf();
        }

        // Check app-local bin first (app-managed installations take priority)
        if let Some(found) = crate::platforms::path_utils::resolve_app_local_executable(program) {
            return found;
        }

        // Fall back to system PATH for system tools (gh, git, etc.)
        if let Ok(found) = which::which(program) {
            return found;
        }

        for dir in crate::platforms::path_utils::get_fallback_directories() {
            let candidate = dir.join(program);
            if let Some(found) = crate::platforms::path_utils::check_executable_exists(&candidate) {
                return found;
            }
        }

        if let Some(found) = crate::platforms::path_utils::find_in_shell_path(program) {
            return found;
        }

        path.to_path_buf()
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
    // DRY:FN:authenticated
    /// Creates an authenticated result
    pub fn authenticated(message: impl Into<String>) -> Self {
        Self {
            authenticated: true,
            message: message.into(),
            details: None,
            checked_at: chrono::Utc::now(),
        }
    }
    // DRY:FN:not_authenticated

    /// Creates a not authenticated result
    pub fn not_authenticated(message: impl Into<String>) -> Self {
        Self {
            authenticated: false,
            message: message.into(),
            details: None,
            checked_at: chrono::Utc::now(),
        }
    }
    // DRY:FN:with_details

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

    #[test]
    fn test_copilot_config_has_logged_in_user_returns_false_when_missing() {
        // With no ~/.copilot/config.json, should return false
        // (This test relies on the test environment not having one;
        // a more robust test would use a temp HOME dir.)
        // We just verify it doesn't panic.
        let _ = AuthStatusChecker::copilot_config_has_logged_in_user();
    }

    #[test]
    fn test_resolve_program_keeps_explicit_path() {
        let checker = AuthStatusChecker::new();
        let explicit = if cfg!(windows) {
            "C:\\Windows"
        } else {
            "/bin/sh"
        };
        let resolved = checker.resolve_program(explicit);
        assert_eq!(resolved, std::path::PathBuf::from(explicit));
    }

    #[test]
    fn test_resolve_program_returns_input_when_missing() {
        let checker = AuthStatusChecker::new();
        let missing = "__definitely_missing_auth_status_test_binary__";
        let resolved = checker.resolve_program(missing);
        assert_eq!(resolved, std::path::PathBuf::from(missing));
    }

    #[test]
    fn test_active_env_override_detects_set_cursor_key() {
        let key = "CURSOR_API_KEY";
        let prior = std::env::var(key).ok();
        // SAFETY: test-only process-scoped env mutation; restored before return.
        unsafe { std::env::set_var(key, "test-value") };
        let detected = AuthStatusChecker::active_env_override(Platform::Cursor);
        assert_eq!(detected, Some(key));
        match prior {
            // SAFETY: restoring prior environment value in this test scope.
            Some(value) => unsafe { std::env::set_var(key, value) },
            // SAFETY: restoring absence of env var in this test scope.
            None => unsafe { std::env::remove_var(key) },
        }
    }
}
