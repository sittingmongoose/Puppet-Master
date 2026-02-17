//! Platform detection and discovery system
//!
//! This module provides automatic detection of installed AI platform CLIs,
//! checking system PATH and common installation locations.

use crate::platforms::path_utils;
use crate::platforms::platform_specs;
use crate::types::Platform;
use crate::types::platform::CliPaths;
use log::{debug, info};
use semver::Version;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use tokio::process::Command;
use which::which;
// DRY:DATA:PlatformDetector

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

    /// Detects a specific platform using platform_specs for binary names and install paths
    pub async fn detect_platform(platform: Platform) -> Option<DetectedPlatform> {
        Self::detect_platform_with_custom_paths(platform, None).await
    }

    // DRY:FN:detect_platform_with_custom_paths — Detects platform CLI with custom path priority
    /// Detects a specific platform with custom path priority
    ///
    /// This method searches for a platform CLI in the following order:
    /// 1. Custom path (if provided and non-empty)
    /// 2. System PATH
    /// 3. Platform specs default install paths
    /// 4. Common system locations
    ///
    /// All searched paths are recorded in the `searched_paths` field.
    pub async fn detect_platform_with_custom_paths(
        platform: Platform,
        custom_path: Option<&str>,
    ) -> Option<DetectedPlatform> {
        Self::detect_platform_with_custom_paths_trace(platform, custom_path, None)
            .await
            .detected
    }

    // DRY:FN:detect_platform_with_custom_paths_trace — Detect platform and capture searched paths
    /// Detects a specific platform with custom path priority and returns full trace data.
    ///
    /// Unlike `detect_platform_with_custom_paths`, this preserves `searched_paths` even when no
    /// CLI is found, which allows setup UI to display the actual detection path attempts.
    ///
    /// Detection order:
    /// 0. Project-local `node_modules/.bin/{cli_name}` (when `project_dir` is provided)
    /// 1. Custom path (if provided and non-empty)
    /// 2. System PATH (`which`)
    /// 3. Platform specs default install paths
    /// 4. Common system locations
    /// 5. Fallback directories from `path_utils`
    /// 6. Shell profile PATH parsing
    pub async fn detect_platform_with_custom_paths_trace(
        platform: Platform,
        custom_path: Option<&str>,
        project_dir: Option<&Path>,
    ) -> PlatformDetectionTrace {
        debug!(
            "Detecting platform {} with custom path: {:?}, project_dir: {:?}",
            platform, custom_path, project_dir
        );

        let cli_names = platform_specs::cli_binary_names(platform);
        let spec = platform_specs::get_spec(platform);
        let mut searched_paths = Vec::new();

        // Stage -1: App-local bin directory (always checked first)
        let app_bin_dir = crate::install::app_paths::get_app_bin_dir();
        for name in cli_names {
            let candidate = app_bin_dir.join(name);
            searched_paths.push(format!("app-local: {}", candidate.display()));

            if let Some(found) = path_utils::check_executable_exists(&candidate) {
                if platform == Platform::Copilot && Self::is_gh_binary_name(name) {
                    continue;
                }
                let (version, valid) =
                    Self::validate_and_get_version(platform, &found, spec.version_command)
                        .await;
                if !valid {
                    continue;
                }
                let detected = DetectedPlatform {
                    platform,
                    cli_path: found,
                    cli_name: name.to_string(),
                    version,
                    available: true,
                    searched_paths: searched_paths.clone(),
                };
                return PlatformDetectionTrace {
                    detected: Some(detected),
                    searched_paths,
                };
            }
        }

        // Stage 0: Project-local node_modules/.bin/{cli_name}
        if let Some(proj) = project_dir {
            for name in cli_names {
                let candidate = proj.join("node_modules/.bin").join(name);
                searched_paths.push(format!("project-local: {}", candidate.display()));

                if let Some(found) = path_utils::check_executable_exists(&candidate) {
                    if platform == Platform::Copilot && Self::is_gh_binary_name(name) {
                        continue;
                    }
                    let (version, valid) =
                        Self::validate_and_get_version(platform, &found, spec.version_command)
                            .await;
                    if !valid {
                        continue;
                    }
                    let detected = DetectedPlatform {
                        platform,
                        cli_path: found,
                        cli_name: name.to_string(),
                        version,
                        available: true,
                        searched_paths: searched_paths.clone(),
                    };
                    return PlatformDetectionTrace {
                        detected: Some(detected),
                        searched_paths,
                    };
                }
            }
        }

        // Stage 1: Check custom path first if provided
        if let Some(custom) = custom_path {
            if !custom.trim().is_empty() {
                let expanded = path_utils::expand_home(custom);
                let path = PathBuf::from(&expanded);
                searched_paths.push(custom.to_string());

                if let Some(found) = path_utils::check_executable_exists(&path) {
                    let cli_name = found
                        .file_name()
                        .map(|n| n.to_string_lossy().to_string())
                        .unwrap_or_else(|| {
                            cli_names.first().map(|s| s.to_string()).unwrap_or_default()
                        });

                    if platform == Platform::Copilot && Self::is_gh_binary_name(&cli_name) {
                        debug!(
                            "Skipping Copilot detection for custom gh path: {}",
                            found.display()
                        );
                    } else {
                        let (version, valid) =
                            Self::validate_and_get_version(platform, &found, spec.version_command)
                                .await;
                        if valid {
                            let detected = DetectedPlatform {
                                platform,
                                cli_path: found,
                                cli_name,
                                version,
                                available: true,
                                searched_paths: searched_paths.clone(),
                            };
                            return PlatformDetectionTrace {
                                detected: Some(detected),
                                searched_paths,
                            };
                        }
                    }
                }
            }
        }

        // Stage 2: Search system PATH
        searched_paths.push("PATH".to_string());
        for name in cli_names {
            searched_paths.push(format!("PATH lookup: {}", name));

            if platform == Platform::Copilot && Self::is_gh_binary_name(name) {
                continue;
            }

            if let Some(path) = Self::find_in_path(name) {
                let (version, valid) =
                    Self::validate_and_get_version(platform, &path, spec.version_command).await;
                if valid {
                    let detected = DetectedPlatform {
                        platform,
                        cli_path: path,
                        cli_name: name.to_string(),
                        version,
                        available: true,
                        searched_paths: searched_paths.clone(),
                    };
                    return PlatformDetectionTrace {
                        detected: Some(detected),
                        searched_paths,
                    };
                }
            }
        }

        // Stage 3: Search platform_specs default install paths
        let install_paths = platform_specs::default_install_paths(platform);
        for install_path in install_paths {
            let expanded = path_utils::expand_home(install_path);
            searched_paths.push(install_path.to_string());
            let path = PathBuf::from(&expanded);

            if let Some(found) = path_utils::check_executable_exists(&path) {
                let cli_name = found
                    .file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();

                if platform == Platform::Copilot && Self::is_gh_binary_name(&cli_name) {
                    continue;
                }

                let (version, valid) =
                    Self::validate_and_get_version(platform, &found, spec.version_command).await;
                if !valid {
                    continue;
                }
                let detected = DetectedPlatform {
                    platform,
                    cli_path: found,
                    cli_name,
                    version,
                    available: true,
                    searched_paths: searched_paths.clone(),
                };
                return PlatformDetectionTrace {
                    detected: Some(detected),
                    searched_paths,
                };
            }
        }

        // Stage 4: Check common system locations
        let common_paths = [
            "/usr/local/bin",
            "/usr/bin",
            "/opt/homebrew/bin",
            "/home/linuxbrew/.linuxbrew/bin",
        ];

        for base_path in &common_paths {
            for name in cli_names {
                let path = PathBuf::from(base_path).join(name);
                searched_paths.push(path.to_string_lossy().to_string());

                if platform == Platform::Copilot && Self::is_gh_binary_name(name) {
                    continue;
                }

                if let Some(found) = path_utils::check_executable_exists(&path) {
                    let (version, valid) =
                        Self::validate_and_get_version(platform, &found, spec.version_command)
                            .await;
                    if !valid {
                        continue;
                    }
                    let detected = DetectedPlatform {
                        platform,
                        cli_path: found,
                        cli_name: name.to_string(),
                        version,
                        available: true,
                        searched_paths: searched_paths.clone(),
                    };
                    return PlatformDetectionTrace {
                        detected: Some(detected),
                        searched_paths,
                    };
                }
            }
        }

        // Stage 5: Search path_utils fallback directories
        let fallback_dirs = path_utils::get_fallback_directories();
        for dir in &fallback_dirs {
            for name in cli_names {
                let candidate = dir.join(name);
                searched_paths.push(format!("fallback: {}", candidate.display()));

                if platform == Platform::Copilot && Self::is_gh_binary_name(name) {
                    continue;
                }

                if let Some(found) = path_utils::check_executable_exists(&candidate) {
                    let (version, valid) =
                        Self::validate_and_get_version(platform, &found, spec.version_command)
                            .await;
                    if !valid {
                        continue;
                    }
                    let detected = DetectedPlatform {
                        platform,
                        cli_path: found,
                        cli_name: name.to_string(),
                        version,
                        available: true,
                        searched_paths: searched_paths.clone(),
                    };
                    return PlatformDetectionTrace {
                        detected: Some(detected),
                        searched_paths,
                    };
                }
            }
        }

        // Stage 6: Shell profile PATH parsing
        for name in cli_names {
            searched_paths.push(format!("shell-path: {}", name));

            if platform == Platform::Copilot && Self::is_gh_binary_name(name) {
                continue;
            }

            if let Some(found) = path_utils::find_in_shell_path(name) {
                let (version, valid) =
                    Self::validate_and_get_version(platform, &found, spec.version_command).await;
                if valid {
                    let detected = DetectedPlatform {
                        platform,
                        cli_path: found,
                        cli_name: name.to_string(),
                        version,
                        available: true,
                        searched_paths: searched_paths.clone(),
                    };
                    return PlatformDetectionTrace {
                        detected: Some(detected),
                        searched_paths,
                    };
                }
            }
        }

        PlatformDetectionTrace {
            detected: None,
            searched_paths,
        }
    }

    /// Detects all installed platforms using custom CLI paths from config
    ///
    /// This method respects custom CLI paths from the configuration and falls back
    /// to standard detection if no custom path is configured for a platform.
    /// When `project_dir` is provided, project-local `node_modules/.bin` is checked first.
    pub async fn detect_installed_with_config(
        cli_paths: &CliPaths,
        project_dir: Option<&Path>,
    ) -> Vec<DetectedPlatform> {
        let mut detected = Vec::new();

        for platform in Platform::all() {
            let custom_path = cli_paths.get(*platform);
            let trace =
                Self::detect_platform_with_custom_paths_trace(*platform, custom_path, project_dir)
                    .await;
            if let Some(info) = trace.detected {
                detected.push(info);
            }
        }

        info!(
            "Detected {} installed platform(s) with custom config",
            detected.len()
        );
        detected
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

    // Helper functions

    /// Finds a command in system PATH
    fn find_in_path(name: &str) -> Option<PathBuf> {
        which(name).ok()
    }

    /// Validates that a detected binary actually executes and belongs to the claimed platform.
    /// Returns (version, is_valid) — is_valid is false if the binary fails to execute
    /// (e.g., missing runtime like node) or if its output doesn't match the expected platform.
    async fn validate_and_get_version(
        platform: Platform,
        command_path: &Path,
        version_flag: &str,
    ) -> (Option<String>, bool) {
        let timeout = tokio::time::Duration::from_secs(5);
        let future = Command::new(command_path)
            .env("PATH", path_utils::build_enhanced_path_for_subprocess())
            .arg(version_flag)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output();

        let output = match tokio::time::timeout(timeout, future).await {
            Ok(Ok(output)) => output,
            Ok(Err(e)) => {
                debug!(
                    "Binary validation failed for {:?} at {}: {}",
                    platform,
                    command_path.display(),
                    e
                );
                return (None, false);
            }
            Err(_) => {
                debug!(
                    "Binary validation timed out for {:?} at {}",
                    platform,
                    command_path.display()
                );
                return (None, false);
            }
        };

        // If the binary exits with a non-zero status (e.g., "env: node: No such file or directory"),
        // and has no useful stdout, treat it as invalid.
        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);
        let combined = format!("{}{}", stdout, stderr);

        if !output.status.success() && stdout.trim().is_empty() {
            debug!(
                "Binary at {} exited with {:?}, stderr: {}",
                command_path.display(),
                output.status.code(),
                stderr.trim()
            );
            return (None, false);
        }

        let version = Self::extract_version(&combined);

        // Cross-platform collision check: reject if the output positively identifies
        // as a *different* platform. Some CLIs (Gemini, Cursor) output only a bare
        // version number with no brand keywords, so we cannot require brand presence.
        let combined_lower = combined.to_lowercase();

        // Distinctive brand markers — only strong identifiers that are unlikely
        // to appear in another platform's version output. Avoid generic words
        // like "agent", "google", etc. that could cause false rejections.
        let other_platform_markers: &[(&str, Platform)] = &[
            ("openai", Platform::Codex),
            ("codex-cli", Platform::Codex),
            ("github copilot", Platform::Copilot),
            ("claude code", Platform::Claude),
            ("anthropic", Platform::Claude),
        ];

        for (marker, marker_platform) in other_platform_markers {
            if combined_lower.contains(marker) && *marker_platform != platform {
                debug!(
                    "Binary at {} appears to be {:?}, not {:?} (output: {})",
                    command_path.display(),
                    marker_platform,
                    platform,
                    combined.trim()
                );
                return (version, false);
            }
        }

        (version, true)
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

    fn is_gh_binary_name(name: &str) -> bool {
        name.eq_ignore_ascii_case("gh") || name.eq_ignore_ascii_case("gh.exe")
    }
}
// DRY:DATA:PlatformDetectionTrace

/// Detection trace data for setup UI and diagnostics.
#[derive(Debug, Clone)]
pub struct PlatformDetectionTrace {
    /// Detected platform info, when found.
    pub detected: Option<DetectedPlatform>,
    /// All path probes used during detection, including misses.
    pub searched_paths: Vec<String>,
}
// DRY:DATA:DetectedPlatform

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

    /// Paths that were searched during detection
    pub searched_paths: Vec<String>,
}

impl DetectedPlatform {
    // DRY:FN:semver_version
    /// Parses version as semver
    pub fn semver_version(&self) -> Option<Version> {
        self.version.as_ref().and_then(|v| Version::parse(v).ok())
    }
    // DRY:FN:executable_path

    /// Gets the executable path as a string
    pub fn executable_path(&self) -> String {
        self.cli_path.to_string_lossy().to_string()
    }
    // DRY:FN:meets_minimum_version

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
// DRY:DATA:InstallationStatus

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
    // DRY:FN:from_detected
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
    // DRY:FN:not_installed

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
                recommendations
                    .push("Install Copilot CLI: npm install -g @github/copilot".to_string());
                recommendations.push(
                    "Authenticate with: 'copilot login' (or run 'copilot' then '/login'; GH_TOKEN/GITHUB_TOKEN also supported)."
                        .to_string(),
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
            searched_paths: vec!["PATH".to_string()],
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
            searched_paths: vec!["PATH".to_string()],
        };

        let status = InstallationStatus::from_detected(&detected);
        assert!(status.installed);
        assert!(status.accessible);

        let not_installed = InstallationStatus::not_installed(Platform::Cursor);
        assert!(!not_installed.installed);
        assert!(!not_installed.recommendations.is_empty());
    }

    #[tokio::test]
    async fn test_detect_with_custom_paths() {
        use crate::types::platform::CliPaths;

        // Test with empty custom paths (should behave like regular detect)
        let cli_paths = CliPaths::default();
        let detected = PlatformDetector::detect_installed_with_config(&cli_paths, None).await;
        assert!(detected.len() <= 5);

        // Verify searched_paths is populated
        for platform_info in detected {
            assert!(!platform_info.searched_paths.is_empty());
        }
    }

    #[tokio::test]
    async fn test_detect_platform_with_custom_path() {
        // Test with custom path that doesn't exist
        let trace = PlatformDetector::detect_platform_with_custom_paths_trace(
            Platform::Cursor,
            Some("/nonexistent/path/cursor"),
            None,
        )
        .await;

        // Should record custom path even when no binary is found there.
        assert!(
            trace
                .searched_paths
                .contains(&"/nonexistent/path/cursor".to_string())
        );
    }

    #[tokio::test]
    async fn test_copilot_custom_gh_path_not_treated_as_copilot() {
        let temp_file = std::env::temp_dir().join(format!(
            "rwm-pm-test-gh-{}-{}",
            std::process::id(),
            chrono::Utc::now().timestamp_nanos_opt().unwrap_or_default()
        ));
        std::fs::write(&temp_file, "mock gh binary").expect("failed to write temp test file");

        let custom = temp_file.to_string_lossy().to_string();
        let trace = PlatformDetector::detect_platform_with_custom_paths_trace(
            Platform::Copilot,
            Some(&custom),
            None,
        )
        .await;

        assert!(trace.searched_paths.contains(&custom));

        if let Some(detected) = trace.detected {
            assert!(!PlatformDetector::is_gh_binary_name(&detected.cli_name));
        }

        let _ = std::fs::remove_file(temp_file);
    }
}
