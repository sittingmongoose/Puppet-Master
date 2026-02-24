//! Install coordinator — single entry point for all CLI installations.
//!
//! Dispatches to the appropriate installer for each platform and provides a
//! uniform [`InstallOutcome`] result type consumed by Doctor, Wizard, and the
//! installation manager.

use crate::types::Platform;
use std::path::PathBuf;

// DRY:DATA:InstallOutcome — Unified result type for all install operations
/// Uniform result returned by every install function in this module.
#[derive(Debug, Clone)]
pub struct InstallOutcome {
    /// Whether the installation succeeded.
    pub success: bool,
    /// Human-readable summary message.
    pub message: String,
    /// All log lines emitted during installation (stdout + stderr).
    pub log_lines: Vec<String>,
    /// Path to the installed binary, if known.
    pub installed_path: Option<PathBuf>,
}

impl InstallOutcome {
    /// Create a successful outcome with a message (no log lines).
    pub fn success(message: impl Into<String>) -> Self {
        Self {
            success: true,
            message: message.into(),
            log_lines: Vec::new(),
            installed_path: None,
        }
    }

    /// Create a failure outcome with only a message.
    pub fn failure(message: impl Into<String>) -> Self {
        Self {
            success: false,
            message: message.into(),
            log_lines: Vec::new(),
            installed_path: None,
        }
    }

    /// Create a failure outcome with accumulated log lines.
    pub fn failure_with_log(message: impl Into<String>, log_lines: Vec<String>) -> Self {
        Self {
            success: false,
            message: message.into(),
            log_lines,
            installed_path: None,
        }
    }
}

// DRY:FN:install_node — Install Node.js system-wide
/// Install Node.js system-wide (apt / brew / winget + nvm fallback).
pub async fn install_node() -> InstallOutcome {
    crate::install::node_installer::install_node_system_wide().await
}

// DRY:FN:install_gh_cli — Install GitHub CLI to app-local bin directory
/// Download and install the GitHub CLI binary into `{APP_DATA_DIR}/bin/gh`.
pub async fn install_gh_cli() -> InstallOutcome {
    crate::install::github_cli_installer::install_gh_to_app_bin().await
}

// DRY:FN:install_playwright — Install Playwright and download browsers
/// Install Playwright (npm) and download browser binaries to the app data directory.
pub async fn install_playwright() -> InstallOutcome {
    crate::install::playwright_installer::install_playwright_app_local().await
}

// DRY:FN:install_platform — Deprecated platform install entry point
/// Automatic platform CLI installation has been removed.
/// Returns a failure outcome with manual setup guidance.
pub async fn install_platform(platform: Platform) -> InstallOutcome {
    let spec = crate::platforms::platform_specs::get_spec(platform);
    let mut guidance = format!(
        "Automatic {} installation has been removed. Install the provider CLI manually.",
        spec.display_name
    );

    if let Some(cmd) = spec.auth.login_command {
        if !spec.auth.login_args.is_empty() {
            guidance.push_str(&format!(
                " Then authenticate with: {} {}",
                cmd,
                spec.auth.login_args.join(" ")
            ));
        }
    } else if spec.auth.uses_browser_auth {
        guidance.push_str(" Then authenticate with the CLI's browser/device flow.");
    }

    InstallOutcome::failure(guidance)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn install_outcome_success_has_success_true() {
        let o = InstallOutcome::success("ok");
        assert!(o.success);
        assert_eq!(o.message, "ok");
        assert!(o.log_lines.is_empty());
    }

    #[test]
    fn install_outcome_failure_has_success_false() {
        let o = InstallOutcome::failure("no");
        assert!(!o.success);
    }

    #[test]
    fn install_outcome_failure_with_log_preserves_lines() {
        let lines = vec!["line1".to_string(), "line2".to_string()];
        let o = InstallOutcome::failure_with_log("msg", lines.clone());
        assert!(!o.success);
        assert_eq!(o.log_lines, lines);
    }
}
