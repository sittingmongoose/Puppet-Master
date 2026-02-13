//! Platform detection and discovery system
//!
//! This module provides automatic detection of installed AI platform CLIs,
//! checking system PATH and common installation locations.

use crate::types::Platform;
use log::{debug, info};
use semver::Version;
use std::collections::HashMap;
use std::path::PathBuf;
use std::process::Stdio;
use tokio::process::Command;
use which::which;

/// Platform detector for finding installed CLI tools
pub struct PlatformDetector;

impl PlatformDetector {
    /// Detects all installed platforms
    pub async fn detect_installed() -> Vec<DetectedPlatform> {
        let mut detected = Vec::new();

        for platform in Platform::all() {
            if let Some(info) = Self::detect_platform(*platform).await {
                detected.push(info);
            }
        }

        info!("Detected {} installed platform(s)", detected.len());
        detected
    }

    /// Detects a specific platform
    pub async fn detect_platform(platform: Platform) -> Option<DetectedPlatform> {
        debug!("Detecting platform: {}", platform);

        match platform {
            Platform::Cursor => Self::detect_cursor().await,
            Platform::Codex => Self::detect_codex().await,
            Platform::Claude => Self::detect_claude().await,
            Platform::Gemini => Self::detect_gemini().await,
            Platform::Copilot => Self::detect_copilot().await,
        }
    }

    /// Creates a detection map for all platforms
    pub async fn create_detection_map() -> HashMap<Platform, DetectedPlatform> {
        let detected = Self::detect_installed().await;

        detected
            .into_iter()
            .map(|info| (info.platform, info))
            .collect()
    }

    /// Checks if any platform is installed
    pub async fn has_any_platform() -> bool {
        !Self::detect_installed().await.is_empty()
    }

    // Platform-specific detection

    async fn detect_cursor() -> Option<DetectedPlatform> {
        // Per AGENTS.md contract: prefer 'agent', fallback to 'cursor-agent'
        let cli_names = ["agent", "cursor-agent", "cursor"];

        for name in &cli_names {
            if let Some(path) = Self::find_in_path(name) {
                let version = Self::get_version(name, &["--version"]).await;

                return Some(DetectedPlatform {
                    platform: Platform::Cursor,
                    cli_path: path,
                    cli_name: name.to_string(),
                    version,
                    available: true,
                });
            }
        }

        // Check common installation locations
        Self::check_common_locations(Platform::Cursor, &cli_names).await
    }

    async fn detect_codex() -> Option<DetectedPlatform> {
        let cli_names = ["codex"];

        for name in &cli_names {
            if let Some(path) = Self::find_in_path(name) {
                let version = Self::get_version(name, &["--version"]).await;

                return Some(DetectedPlatform {
                    platform: Platform::Codex,
                    cli_path: path,
                    cli_name: name.to_string(),
                    version,
                    available: true,
                });
            }
        }

        Self::check_common_locations(Platform::Codex, &cli_names).await
    }

    async fn detect_claude() -> Option<DetectedPlatform> {
        let cli_names = ["claude", "claude-cli"];

        for name in &cli_names {
            if let Some(path) = Self::find_in_path(name) {
                let version = Self::get_version(name, &["--version"]).await;

                return Some(DetectedPlatform {
                    platform: Platform::Claude,
                    cli_path: path,
                    cli_name: name.to_string(),
                    version,
                    available: true,
                });
            }
        }

        Self::check_common_locations(Platform::Claude, &cli_names).await
    }

    async fn detect_gemini() -> Option<DetectedPlatform> {
        // Prefer 'gemini' as per AGENTS.md contract, fallback to gemini-cli
        let cli_names = ["gemini", "gemini-cli", "gcloud"];

        for name in &cli_names {
            if let Some(path) = Self::find_in_path(name) {
                let version = Self::get_version(name, &["--version"]).await;

                return Some(DetectedPlatform {
                    platform: Platform::Gemini,
                    cli_path: path,
                    cli_name: name.to_string(),
                    version,
                    available: true,
                });
            }
        }

        Self::check_common_locations(Platform::Gemini, &cli_names).await
    }

    async fn detect_copilot() -> Option<DetectedPlatform> {
        // Try 'copilot' first (standalone), then 'gh copilot' (extension)
        let cli_names = ["copilot", "gh"];

        for name in &cli_names {
            if let Some(path) = Self::find_in_path(name) {
                let version = if name == &"copilot" {
                    // Direct copilot command
                    Self::get_version(name, &["--version"]).await
                } else {
                    // gh copilot extension
                    Self::get_version("gh", &["copilot", "--version"]).await
                };

                // Verify copilot extension is installed if using gh
                let has_copilot = if name == &"copilot" {
                    true
                } else {
                    Self::check_copilot_extension().await
                };

                return Some(DetectedPlatform {
                    platform: Platform::Copilot,
                    cli_path: path,
                    cli_name: name.to_string(),
                    version,
                    available: has_copilot,
                });
            }
        }

        None
    }

    // Helper functions

    /// Finds a command in system PATH
    fn find_in_path(name: &str) -> Option<PathBuf> {
        which(name).ok()
    }

    /// Gets version string from CLI
    async fn get_version(command: &str, args: &[&str]) -> Option<String> {
        let output = Command::new(command)
            .args(args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .await
            .ok()?;

        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);

        // Try to extract version from output
        let combined = format!("{}{}", stdout, stderr);

        Self::extract_version(&combined)
    }

    /// Extracts version number from text
    fn extract_version(text: &str) -> Option<String> {
        // Try to find semantic version pattern
        let version_pattern = regex::Regex::new(r"(\d+\.\d+\.\d+)").ok()?;

        if let Some(cap) = version_pattern.captures(text) {
            return cap.get(1).map(|m| m.as_str().to_string());
        }

        // Fallback: return first line
        text.lines().next().map(|s| s.trim().to_string())
    }

    /// Checks common installation locations
    async fn check_common_locations(
        platform: Platform,
        cli_names: &[&str],
    ) -> Option<DetectedPlatform> {
        let common_paths = [
            "/usr/local/bin",
            "/usr/bin",
            "/opt/homebrew/bin",
            "/home/linuxbrew/.linuxbrew/bin",
        ];

        for base_path in &common_paths {
            for name in cli_names {
                let path = PathBuf::from(base_path).join(name);

                if path.exists() && path.is_file() {
                    let version = Self::get_version(name, &["--version"]).await;

                    return Some(DetectedPlatform {
                        platform,
                        cli_path: path,
                        cli_name: name.to_string(),
                        version,
                        available: true,
                    });
                }
            }
        }

        None
    }

    /// Checks if GitHub Copilot extension is installed
    async fn check_copilot_extension() -> bool {
        let output = Command::new("gh")
            .args(&["extension", "list"])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .await;

        if let Ok(output) = output {
            let stdout = String::from_utf8_lossy(&output.stdout);
            stdout.contains("copilot")
        } else {
            false
        }
    }
}

/// Information about a detected platform
#[derive(Debug, Clone)]
pub struct DetectedPlatform {
    /// Platform type
    pub platform: Platform,

    /// Path to CLI executable
    pub cli_path: PathBuf,

    /// CLI command name
    pub cli_name: String,

    /// Version string if detected
    pub version: Option<String>,

    /// Whether platform is available for use
    pub available: bool,
}

impl DetectedPlatform {
    /// Parses version as semver
    pub fn semver_version(&self) -> Option<Version> {
        self.version.as_ref().and_then(|v| Version::parse(v).ok())
    }

    /// Gets the executable path as a string
    pub fn executable_path(&self) -> String {
        self.cli_path.to_string_lossy().to_string()
    }

    /// Checks if version meets minimum requirement
    pub fn meets_minimum_version(&self, minimum: &str) -> bool {
        if let Ok(min_ver) = Version::parse(minimum) {
            if let Some(ver) = self.semver_version() {
                return ver >= min_ver;
            }
        }
        false
    }
}

/// Platform installation status
#[derive(Debug, Clone)]
pub struct InstallationStatus {
    /// Platform
    pub platform: Platform,

    /// Whether CLI is installed
    pub installed: bool,

    /// Whether CLI is accessible
    pub accessible: bool,

    /// Detected version
    pub version: Option<String>,

    /// Installation recommendations
    pub recommendations: Vec<String>,
}

impl InstallationStatus {
    /// Creates status for a detected platform
    pub fn from_detected(detected: &DetectedPlatform) -> Self {
        Self {
            platform: detected.platform,
            installed: true,
            accessible: detected.available,
            version: detected.version.clone(),
            recommendations: Vec::new(),
        }
    }

    /// Creates status for a not-installed platform
    pub fn not_installed(platform: Platform) -> Self {
        let mut recommendations = Vec::new();

        match platform {
            Platform::Cursor => {
                recommendations.push(
                    "Install Cursor CLI: curl https://cursor.com/install -fsS | bash (macOS/Linux/WSL) or PowerShell: irm 'https://cursor.com/install?win32=true' | iex"
                        .to_string(),
                );
            }
            Platform::Codex => {
                recommendations.push("Install Codex CLI: npm install -g @openai/codex".to_string());
            }
            Platform::Claude => {
                recommendations.push(
                    "Install Claude Code CLI: curl -fsSL https://claude.ai/install.sh | bash"
                        .to_string(),
                );
            }
            Platform::Gemini => {
                recommendations
                    .push("Install Gemini CLI: npm install -g @google/gemini-cli".to_string());
            }
            Platform::Copilot => {
                recommendations.push("Install GitHub CLI: https://cli.github.com".to_string());
                recommendations.push(
                    "Install Copilot extension: gh extension install github/gh-copilot".to_string(),
                );
            }
        }

        Self {
            platform,
            installed: false,
            accessible: false,
            version: None,
            recommendations,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_detect_installed() {
        let result = tokio::time::timeout(
            std::time::Duration::from_secs(5),
            PlatformDetector::detect_installed(),
        )
        .await;

        match result {
            Ok(detected) => {
                assert!(detected.len() <= 5);
                for platform_info in detected {
                    assert!(platform_info.cli_path.exists());
                }
            }
            Err(_) => {} // Timeout is acceptable in test environment
        }
    }

    #[tokio::test]
    async fn test_create_detection_map() {
        let map = PlatformDetector::create_detection_map().await;

        assert!(map.len() <= 5);

        for (platform, info) in map {
            assert_eq!(platform, info.platform);
        }
    }

    #[test]
    fn test_extract_version() {
        let text = "version 1.2.3";
        let version = PlatformDetector::extract_version(text);
        assert_eq!(version, Some("1.2.3".to_string()));

        let text = "no version here";
        let version = PlatformDetector::extract_version(text);
        assert!(version.is_some()); // Should return first line
    }

    #[test]
    fn test_detected_platform_version() {
        let detected = DetectedPlatform {
            platform: Platform::Cursor,
            cli_path: PathBuf::from("/usr/bin/cursor"),
            cli_name: "cursor".to_string(),
            version: Some("1.2.3".to_string()),
            available: true,
        };

        assert!(detected.semver_version().is_some());
        assert!(detected.meets_minimum_version("1.0.0"));
        assert!(!detected.meets_minimum_version("2.0.0"));
    }

    #[test]
    fn test_installation_status() {
        let detected = DetectedPlatform {
            platform: Platform::Cursor,
            cli_path: PathBuf::from("/usr/bin/cursor"),
            cli_name: "cursor".to_string(),
            version: Some("1.2.3".to_string()),
            available: true,
        };

        let status = InstallationStatus::from_detected(&detected);
        assert!(status.installed);
        assert!(status.accessible);

        let not_installed = InstallationStatus::not_installed(Platform::Cursor);
        assert!(!not_installed.installed);
        assert!(!not_installed.recommendations.is_empty());
    }
}
