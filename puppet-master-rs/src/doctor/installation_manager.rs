//! Installation Manager
//!
//! Manages detection and installation guidance for CLI tools across platforms.
//! Provides status checks, platform-specific installation instructions, and
//! execution of official install commands.

use crate::platforms::path_utils;
use crate::platforms::platform_specs;
use crate::types::Platform;
use anyhow::Result;
use log::debug;
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::process::Command;
use which::which;

// DRY:DATA:InstallationStatus
/// Installation status for a CLI tool
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum InstallationStatus {
    /// Tool is installed with the specified version
    Installed(String),
    /// Tool is not installed
    NotInstalled,
    /// Tool is installed but outdated
    Outdated {
        /// Currently installed version
        current: String,
        /// Latest available version (if known)
        latest: String,
    },
}

// DRY:DATA:InstallResult
/// Result of an install attempt
#[derive(Debug, Clone)]
pub struct InstallResult {
    pub success: bool,
    pub message: String,
}

impl InstallResult {
    // DRY:FN:success
    pub fn success(message: impl Into<String>) -> Self {
        Self {
            success: true,
            message: message.into(),
        }
    }
    // DRY:FN:failure
    pub fn failure(message: impl Into<String>) -> Self {
        Self {
            success: false,
            message: message.into(),
        }
    }
}

impl std::fmt::Display for InstallationStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Installed(version) => write!(f, "Installed (v{})", version),
            Self::NotInstalled => write!(f, "Not Installed"),
            Self::Outdated { current, latest } => {
                write!(f, "Outdated (v{} → v{})", current, latest)
            }
        }
    }
}

// DRY:DATA:OperatingSystem
/// Operating system detection
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OperatingSystem {
    /// Linux
    Linux,
    /// macOS
    MacOS,
    /// Windows
    Windows,
    /// Unknown/Other
    Unknown,
}

impl OperatingSystem {
    // DRY:FN:detect
    /// Detect the current operating system
    pub fn detect() -> Self {
        #[cfg(target_os = "linux")]
        return Self::Linux;

        #[cfg(target_os = "macos")]
        return Self::MacOS;

        #[cfg(target_os = "windows")]
        return Self::Windows;

        #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
        return Self::Unknown;
    }
}

// DRY:DATA:InstallationManager
/// Installation manager for CLI tools
pub struct InstallationManager {
    os: OperatingSystem,
}

impl InstallationManager {
    // DRY:FN:new
    /// Create a new installation manager
    pub fn new() -> Self {
        Self {
            os: OperatingSystem::detect(),
        }
    }

    // DRY:FN:check_installation
    /// Check installation status of a platform's CLI tool
    pub fn check_installation(&self, platform: Platform) -> InstallationStatus {
        // Try each CLI name in order until one is found
        for cli_name in platform_specs::cli_binary_names(platform) {
            if let Some(version) = self.get_cli_version(cli_name) {
                return InstallationStatus::Installed(version);
            }
        }

        InstallationStatus::NotInstalled
    }

    /// Get version of a CLI tool using robust detection
    fn get_cli_version(&self, cli_name: &str) -> Option<String> {
        debug!("Checking version for CLI: {}", cli_name);

        // Step 1: Try to find the executable using which::which()
        let exe_path = match self.find_executable(cli_name) {
            Some(path) => {
                debug!("Found {} at: {}", cli_name, path.display());
                path
            }
            None => {
                debug!("No executable found for CLI: {}", cli_name);
                return None;
            }
        };

        // Step 2: Get version from the found executable
        self.get_version_from_path(&exe_path, cli_name)
    }

    /// Find executable using which::which() and fallback directories
    fn find_executable(&self, cli_name: &str) -> Option<PathBuf> {
        // Step 1: Try which::which() first (searches PATH)
        if let Ok(path) = which(cli_name) {
            debug!("Found {} in PATH via which: {}", cli_name, path.display());
            return Some(path);
        }

        // Step 2: Check common installation directories
        let fallback_dirs = self.get_fallback_directories();

        for dir in fallback_dirs {
            let exe_path = dir.join(cli_name);

            // On Windows, also try with .exe extension
            #[cfg(target_os = "windows")]
            {
                let exe_with_ext = dir.join(format!("{}.exe", cli_name));
                if exe_with_ext.exists() && exe_with_ext.is_file() {
                    debug!(
                        "Found {} in fallback directory: {}",
                        cli_name,
                        exe_with_ext.display()
                    );
                    return Some(exe_with_ext);
                }
            }

            if exe_path.exists() && exe_path.is_file() {
                debug!(
                    "Found {} in fallback directory: {}",
                    cli_name,
                    exe_path.display()
                );
                return Some(exe_path);
            }
        }

        // Step 3: Try expanding shell PATH from profiles (GUI apps often miss shell PATH)
        if let Some(path) = self.find_in_shell_path(cli_name) {
            return Some(path);
        }

        None
    }

    /// Get fallback directories to search for executables.
    /// Delegates to `path_utils::get_fallback_directories`.
    fn get_fallback_directories(&self) -> Vec<PathBuf> {
        crate::platforms::path_utils::get_fallback_directories()
    }

    /// Try to find executable by expanding shell PATH from profile files.
    /// Delegates to `path_utils::find_in_shell_path`.
    fn find_in_shell_path(&self, cli_name: &str) -> Option<PathBuf> {
        crate::platforms::path_utils::find_in_shell_path(cli_name)
    }

    /// Get version from an executable path.
    /// Uses enhanced PATH so node-based CLIs can find `node` when spawned from GUI apps.
    fn get_version_from_path(&self, exe_path: &Path, cli_name: &str) -> Option<String> {
        let enhanced_path = path_utils::build_enhanced_path_for_subprocess();

        // Special case for Copilot: prefer `copilot version` and fall back to `--version`.
        if cli_name == "copilot" {
            for version_flag in ["version", "--version"] {
                if let Ok(output) = Command::new(exe_path)
                    .env("PATH", &enhanced_path)
                    .arg(version_flag)
                    .output()
                {
                    if output.status.success() {
                        let version_str = String::from_utf8_lossy(&output.stdout);
                        let version = self.extract_version(&version_str);
                        if !version.is_empty() {
                            debug!("Found copilot version: {}", version);
                            return Some(version);
                        }
                    }
                }
            }
            return None;
        }

        // Try common version flags
        let version_flags = ["--version", "-v", "version"];

        for flag in &version_flags {
            match Command::new(exe_path)
                .env("PATH", &enhanced_path)
                .arg(flag)
                .output()
            {
                Ok(output) => {
                    if output.status.success() {
                        let version_str = String::from_utf8_lossy(&output.stdout);
                        let stderr_str = String::from_utf8_lossy(&output.stderr);
                        let combined = format!("{}{}", version_str, stderr_str);
                        let version = self.extract_version(&combined);
                        if !version.is_empty() {
                            debug!("Found {} version with flag {}: {}", cli_name, flag, version);
                            return Some(version);
                        }
                    }
                }
                Err(e) => {
                    debug!(
                        "Failed to execute '{}' with flag '{}': {}",
                        exe_path.display(),
                        flag,
                        e
                    );
                }
            }
        }

        debug!("No version found for CLI: {}", cli_name);
        None
    }

    /// Extract version number from version string
    fn extract_version(&self, version_str: &str) -> String {
        // Look for version patterns like "1.2.3" or "v1.2.3"
        let version_regex = regex::Regex::new(r"v?(\d+\.\d+\.\d+)").unwrap();

        if let Some(captures) = version_regex.captures(version_str) {
            if let Some(version) = captures.get(1) {
                return version.as_str().to_string();
            }
        }

        // Fallback: return first line, trimmed
        version_str.lines().next().unwrap_or("").trim().to_string()
    }

    // DRY:FN:get_installation_instructions
    /// Get installation instructions for a platform
    pub fn get_installation_instructions(&self, platform: Platform) -> String {
        match platform {
            Platform::Cursor => self.get_cursor_instructions(),
            Platform::Codex => self.get_codex_instructions(),
            Platform::Claude => self.get_claude_instructions(),
            Platform::Gemini => self.get_gemini_instructions(),
            Platform::Copilot => self.get_copilot_instructions(),
        }
    }

    fn os_id(&self) -> &'static str {
        match self.os {
            OperatingSystem::Linux => "linux",
            OperatingSystem::MacOS => "macos",
            OperatingSystem::Windows => "windows",
            OperatingSystem::Unknown => "unknown",
        }
    }

    // DRY:FN:build_platform_instructions -- Shared install instructions with app-local target dir
    fn build_platform_instructions(&self, platform: Platform) -> String {
        let spec = platform_specs::get_spec(platform);
        let bin_dir = crate::install::app_paths::get_app_bin_dir();

        let mut out = format!(
            "Install {} via Puppet Master:\n\n  Target directory: {}\n\nUse the Setup/Doctor INSTALL button to install into the app-local bin directory.\n",
            spec.display_name,
            bin_dir.display()
        );

        if let Some(cmd) = spec.auth.login_command {
            let args = if spec.auth.login_args.is_empty() {
                String::new()
            } else {
                format!(" {}", spec.auth.login_args.join(" "))
            };
            out.push_str(&format!("\nAuthenticate:\n  {}{}\n", cmd, args));
        } else if spec.auth.uses_browser_auth {
            out.push_str(
                "\nAuthenticate:\n  Launch the CLI and complete the browser-based login.\n",
            );
        }

        let manual_methods = platform_specs::install_methods_for(platform, self.os_id());
        if !manual_methods.is_empty() {
            out.push_str("\nManual install options (system-wide):\n");
            for m in manual_methods {
                out.push_str(&format!("  - {}: {}\n", m.method, m.command));
            }
        }

        out
    }

    fn get_cursor_instructions(&self) -> String {
        self.build_platform_instructions(Platform::Cursor)
    }

    fn get_codex_instructions(&self) -> String {
        self.build_platform_instructions(Platform::Codex)
    }

    fn get_claude_instructions(&self) -> String {
        self.build_platform_instructions(Platform::Claude)
    }

    fn get_gemini_instructions(&self) -> String {
        self.build_platform_instructions(Platform::Gemini)
    }

    fn get_copilot_instructions(&self) -> String {
        self.build_platform_instructions(Platform::Copilot)
    }

    // DRY:FN:check_all_platforms
    /// Check all platforms and return a summary
    pub fn check_all_platforms(&self) -> Vec<(Platform, InstallationStatus)> {
        Platform::all()
            .iter()
            .map(|&platform| (platform, self.check_installation(platform)))
            .collect()
    }

    // DRY:FN:execute_install
    /// Execute the official install command for a platform.
    /// Spawns the install script/command; user may need to interact (e.g. confirm).
    pub fn execute_install(&self, platform: Platform) -> Result<InstallResult> {
        match platform {
            Platform::Cursor => self.execute_cursor_install(),
            Platform::Codex => self.execute_codex_install(),
            Platform::Claude => self.execute_claude_install(),
            Platform::Gemini => self.execute_gemini_install(),
            Platform::Copilot => self.execute_copilot_install(),
        }
    }

    fn execute_cursor_install(&self) -> Result<InstallResult> {
        let rt = tokio::runtime::Handle::try_current()
            .map(|h| {
                tokio::task::block_in_place(|| {
                    h.block_on(async {
                        crate::install::install_coordinator::install_platform(
                            crate::types::Platform::Cursor,
                        )
                        .await
                    })
                })
            })
            .unwrap_or_else(|_| {
                tokio::runtime::Runtime::new().unwrap().block_on(
                    crate::install::install_coordinator::install_platform(
                        crate::types::Platform::Cursor,
                    ),
                )
            });
        if rt.success {
            Ok(InstallResult::success(rt.message))
        } else {
            Ok(InstallResult::failure(rt.message))
        }
    }

    fn execute_codex_install(&self) -> Result<InstallResult> {
        let rt = tokio::runtime::Handle::try_current()
            .map(|h| {
                tokio::task::block_in_place(|| {
                    h.block_on(async {
                        crate::install::install_coordinator::install_platform(
                            crate::types::Platform::Codex,
                        )
                        .await
                    })
                })
            })
            .unwrap_or_else(|_| {
                tokio::runtime::Runtime::new().unwrap().block_on(
                    crate::install::install_coordinator::install_platform(
                        crate::types::Platform::Codex,
                    ),
                )
            });
        if rt.success {
            Ok(InstallResult::success(rt.message))
        } else {
            Ok(InstallResult::failure(rt.message))
        }
    }

    fn execute_claude_install(&self) -> Result<InstallResult> {
        let rt = tokio::runtime::Handle::try_current()
            .map(|h| {
                tokio::task::block_in_place(|| {
                    h.block_on(async {
                        crate::install::install_coordinator::install_platform(
                            crate::types::Platform::Claude,
                        )
                        .await
                    })
                })
            })
            .unwrap_or_else(|_| {
                tokio::runtime::Runtime::new().unwrap().block_on(
                    crate::install::install_coordinator::install_platform(
                        crate::types::Platform::Claude,
                    ),
                )
            });
        if rt.success {
            Ok(InstallResult::success(rt.message))
        } else {
            Ok(InstallResult::failure(rt.message))
        }
    }

    fn execute_gemini_install(&self) -> Result<InstallResult> {
        let rt = tokio::runtime::Handle::try_current()
            .map(|h| {
                tokio::task::block_in_place(|| {
                    h.block_on(async {
                        crate::install::install_coordinator::install_platform(
                            crate::types::Platform::Gemini,
                        )
                        .await
                    })
                })
            })
            .unwrap_or_else(|_| {
                tokio::runtime::Runtime::new().unwrap().block_on(
                    crate::install::install_coordinator::install_platform(
                        crate::types::Platform::Gemini,
                    ),
                )
            });
        if rt.success {
            Ok(InstallResult::success(rt.message))
        } else {
            Ok(InstallResult::failure(rt.message))
        }
    }

    fn execute_copilot_install(&self) -> Result<InstallResult> {
        let rt = tokio::runtime::Handle::try_current()
            .map(|h| {
                tokio::task::block_in_place(|| {
                    h.block_on(async {
                        crate::install::install_coordinator::install_platform(
                            crate::types::Platform::Copilot,
                        )
                        .await
                    })
                })
            })
            .unwrap_or_else(|_| {
                tokio::runtime::Runtime::new().unwrap().block_on(
                    crate::install::install_coordinator::install_platform(
                        crate::types::Platform::Copilot,
                    ),
                )
            });
        if rt.success {
            Ok(InstallResult::success(rt.message))
        } else {
            Ok(InstallResult::failure(rt.message))
        }
    }

    // DRY:FN:get_installation_report
    /// Get a formatted report of all platform installations
    pub fn get_installation_report(&self) -> String {
        let mut report = String::new();
        report.push_str("Platform CLI Installation Status\n");
        report.push_str("================================\n\n");

        for (platform, status) in self.check_all_platforms() {
            report.push_str(&format!("{:<12} {}\n", format!("{}:", platform), status));
        }

        report
    }
}

impl Default for InstallationManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_installation_manager_creation() {
        let manager = InstallationManager::new();
        // Should detect OS successfully
        assert!(matches!(
            manager.os,
            OperatingSystem::Linux | OperatingSystem::MacOS | OperatingSystem::Windows
        ));
    }

    #[test]
    fn test_os_detection() {
        let os = OperatingSystem::detect();
        // Should match one of the known OSes in CI
        #[cfg(target_os = "linux")]
        assert_eq!(os, OperatingSystem::Linux);

        #[cfg(target_os = "macos")]
        assert_eq!(os, OperatingSystem::MacOS);

        #[cfg(target_os = "windows")]
        assert_eq!(os, OperatingSystem::Windows);
    }

    #[test]
    fn test_extract_version() {
        let manager = InstallationManager::new();

        assert_eq!(manager.extract_version("v1.2.3"), "1.2.3");
        assert_eq!(manager.extract_version("version 2.0.1"), "2.0.1");
        assert_eq!(manager.extract_version("tool v3.4.5-beta"), "3.4.5");
    }

    #[test]
    fn test_installation_status_display() {
        let installed = InstallationStatus::Installed("1.0.0".to_string());
        assert_eq!(installed.to_string(), "Installed (v1.0.0)");

        let not_installed = InstallationStatus::NotInstalled;
        assert_eq!(not_installed.to_string(), "Not Installed");

        let outdated = InstallationStatus::Outdated {
            current: "1.0.0".to_string(),
            latest: "2.0.0".to_string(),
        };
        assert_eq!(outdated.to_string(), "Outdated (v1.0.0 → v2.0.0)");
    }

    #[test]
    fn test_get_installation_instructions() {
        let manager = InstallationManager::new();

        for platform in Platform::all() {
            let instructions = manager.get_installation_instructions(*platform);
            assert!(!instructions.is_empty());
            assert!(instructions.contains("Install"));
        }
    }

    #[test]
    fn test_check_all_platforms() {
        let manager = InstallationManager::new();
        let results = manager.check_all_platforms();

        assert_eq!(results.len(), Platform::all().len());

        for (platform, _status) in results {
            // Status should be either Installed or NotInstalled
            // We can't assert specific status as it depends on the test environment
            assert!(Platform::all().contains(&platform));
        }
    }

    #[test]
    fn test_get_installation_report() {
        let manager = InstallationManager::new();
        let report = manager.get_installation_report();

        assert!(report.contains("Platform CLI Installation Status"));
        assert!(report.contains("cursor"));
        assert!(report.contains("codex"));
        assert!(report.contains("claude"));
        assert!(report.contains("gemini"));
        assert!(report.contains("copilot"));
    }

    #[test]
    fn test_cursor_instructions() {
        let manager = InstallationManager::new();
        let instructions = manager.get_cursor_instructions();

        assert!(instructions.contains("Cursor"));
        assert!(instructions.contains("Target directory"));
        assert!(instructions.contains("INSTALL"));
    }

    #[test]
    fn test_copilot_instructions() {
        let manager = InstallationManager::new();
        let instructions = manager.get_copilot_instructions();

        assert!(instructions.contains("Copilot"));
        assert!(instructions.contains("Authenticate"));
        assert!(instructions.contains("copilot login"));
    }

    #[test]
    fn test_claude_instructions_do_not_use_auth_login_subcommand() {
        let manager = InstallationManager::new();
        let instructions = manager.get_claude_instructions();

        assert!(!instructions.contains("claude auth login"));
        assert!(instructions.contains("Authenticate"));
    }
}
