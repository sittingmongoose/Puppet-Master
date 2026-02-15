//! CLI availability checks

use crate::doctor::InstallationManager;
use crate::types::{CheckCategory, CheckResult, DoctorCheck, FixResult, Platform};
use async_trait::async_trait;
use chrono::Utc;
use which::which;

/// Base check for CLI availability
struct CliCheck {
    name: String,
    command: String,
    install_instructions: String,
    platform: Platform,
}

impl CliCheck {
    fn new(name: &str, command: &str, install_instructions: &str, platform: Platform) -> Self {
        Self {
            name: name.to_string(),
            command: command.to_string(),
            install_instructions: install_instructions.to_string(),
            platform,
        }
    }

    async fn check_cli(&self) -> CheckResult {
        // Step 1: Try which (system PATH)
        if let Ok(path) = which(&self.command) {
            return CheckResult {
                passed: true,
                message: format!("{} found at {:?}", self.name, path),
                details: None,
                can_fix: false,
                timestamp: Utc::now(),
            };
        }

        // Step 2: Search fallback directories
        let fallback_dirs = crate::platforms::path_utils::get_fallback_directories();
        for dir in &fallback_dirs {
            let candidate = dir.join(&self.command);
            if let Some(found) = crate::platforms::path_utils::check_executable_exists(&candidate) {
                return CheckResult {
                    passed: true,
                    message: format!("{} found at {:?} (fallback)", self.name, found),
                    details: None,
                    can_fix: false,
                    timestamp: Utc::now(),
                };
            }
        }

        // Step 3: Search platform_specs default install paths with expand_home
        let install_paths =
            crate::platforms::platform_specs::default_install_paths(self.platform);
        for install_path in install_paths {
            let expanded = crate::platforms::path_utils::expand_home(install_path);
            let path = std::path::PathBuf::from(&expanded);
            if let Some(found) = crate::platforms::path_utils::check_executable_exists(&path) {
                return CheckResult {
                    passed: true,
                    message: format!("{} found at {:?} (default install path)", self.name, found),
                    details: None,
                    can_fix: false,
                    timestamp: Utc::now(),
                };
            }
        }

        // Step 4: Try shell profile PATH parsing
        if let Some(found) = crate::platforms::path_utils::find_in_shell_path(&self.command) {
            return CheckResult {
                passed: true,
                message: format!("{} found at {:?} (shell PATH)", self.name, found),
                details: None,
                can_fix: false,
                timestamp: Utc::now(),
            };
        }

        // Not found anywhere
        let searched = install_paths;
        let details = if searched.is_empty() {
            self.install_instructions.clone()
        } else {
            format!(
                "{}\nSearched: {}",
                self.install_instructions,
                searched.join(", ")
            )
        };
        CheckResult {
            passed: false,
            message: format!("{} not found in PATH", self.name),
            details: Some(details),
            can_fix: true,
            timestamp: Utc::now(),
        }
    }

    // DRY:FN:cli_fix -- Common fix implementation using platform_specs install commands
    async fn fix_cli(&self, dry_run: bool) -> Option<FixResult> {
        if dry_run {
            let os = if cfg!(target_os = "windows") {
                "windows"
            } else if cfg!(target_os = "macos") {
                "macos"
            } else {
                "linux"
            };
            let methods = crate::platforms::platform_specs::install_methods_for(self.platform, os);
            let cmd = methods
                .first()
                .map(|m| format!("Would run: {}", m.command))
                .unwrap_or_else(|| format!("No install method for {} on {}", self.name, os));
            return Some(FixResult::success(cmd));
        }
        let manager = InstallationManager::new();
        match manager.execute_install(self.platform) {
            Ok(result) => Some(if result.success {
                FixResult::success(result.message)
            } else {
                FixResult::failure(result.message)
            }),
            Err(e) => Some(FixResult::failure(format!("Install failed: {}", e))),
        }
    }
}

// DRY:FN:cli_check_from_specs -- Build CLI check from platform_specs data
fn cli_check_from_specs(platform: Platform) -> CliCheck {
    use crate::platforms::platform_specs;
    let spec = platform_specs::get_spec(platform);
    let binary = spec.cli_binary_names.first().copied().unwrap_or("unknown");
    let install_cmd = spec
        .install_methods
        .first()
        .map(|m| m.command)
        .unwrap_or("See platform documentation");
    CliCheck::new(
        spec.display_name,
        binary,
        &format!("Install {}: {}", spec.display_name, install_cmd),
        platform,
    )
}

// DRY:DATA:CursorCheck
/// Cursor CLI check
pub struct CursorCheck(CliCheck);

impl CursorCheck {
    // DRY:FN:new
    pub fn new() -> Self {
        Self(cli_check_from_specs(Platform::Cursor))
    }
}

#[async_trait]
impl DoctorCheck for CursorCheck {
    fn name(&self) -> &str {
        "cursor-cli"
    }
    fn category(&self) -> CheckCategory {
        CheckCategory::Cli
    }
    fn description(&self) -> &str {
        "Check if Cursor CLI is available"
    }
    async fn run(&self) -> CheckResult {
        self.0.check_cli().await
    }
    async fn fix(&self, dry_run: bool) -> Option<FixResult> {
        self.0.fix_cli(dry_run).await
    }
    fn has_fix(&self) -> bool {
        true
    }
}

// DRY:DATA:CodexCheck
/// Codex CLI check
pub struct CodexCheck(CliCheck);

impl CodexCheck {
    // DRY:FN:new
    pub fn new() -> Self {
        Self(cli_check_from_specs(Platform::Codex))
    }
}

#[async_trait]
impl DoctorCheck for CodexCheck {
    fn name(&self) -> &str {
        "codex-cli"
    }
    fn category(&self) -> CheckCategory {
        CheckCategory::Cli
    }
    fn description(&self) -> &str {
        "Check if Codex CLI is available"
    }
    async fn run(&self) -> CheckResult {
        self.0.check_cli().await
    }
    async fn fix(&self, dry_run: bool) -> Option<FixResult> {
        self.0.fix_cli(dry_run).await
    }
    fn has_fix(&self) -> bool {
        true
    }
}

// DRY:DATA:ClaudeCheck
/// Claude Code CLI check
pub struct ClaudeCheck(CliCheck);

impl ClaudeCheck {
    // DRY:FN:new
    pub fn new() -> Self {
        Self(cli_check_from_specs(Platform::Claude))
    }
}

#[async_trait]
impl DoctorCheck for ClaudeCheck {
    fn name(&self) -> &str {
        "claude-cli"
    }
    fn category(&self) -> CheckCategory {
        CheckCategory::Cli
    }
    fn description(&self) -> &str {
        "Check if Claude Code CLI is available"
    }
    async fn run(&self) -> CheckResult {
        self.0.check_cli().await
    }
    async fn fix(&self, dry_run: bool) -> Option<FixResult> {
        self.0.fix_cli(dry_run).await
    }
    fn has_fix(&self) -> bool {
        true
    }
}

// DRY:DATA:GeminiCheck
/// Gemini CLI check
pub struct GeminiCheck(CliCheck);

impl GeminiCheck {
    // DRY:FN:new
    pub fn new() -> Self {
        Self(cli_check_from_specs(Platform::Gemini))
    }
}

#[async_trait]
impl DoctorCheck for GeminiCheck {
    fn name(&self) -> &str {
        "gemini-cli"
    }
    fn category(&self) -> CheckCategory {
        CheckCategory::Cli
    }
    fn description(&self) -> &str {
        "Check if Gemini CLI is available"
    }
    async fn run(&self) -> CheckResult {
        self.0.check_cli().await
    }
    async fn fix(&self, dry_run: bool) -> Option<FixResult> {
        self.0.fix_cli(dry_run).await
    }
    fn has_fix(&self) -> bool {
        true
    }
}

// DRY:DATA:CopilotCheck
/// Copilot CLI check
pub struct CopilotCheck(CliCheck);

impl CopilotCheck {
    // DRY:FN:new
    pub fn new() -> Self {
        Self(cli_check_from_specs(Platform::Copilot))
    }
}

#[async_trait]
impl DoctorCheck for CopilotCheck {
    fn name(&self) -> &str {
        "copilot-cli"
    }
    fn category(&self) -> CheckCategory {
        CheckCategory::Cli
    }
    fn description(&self) -> &str {
        "Check if GitHub Copilot CLI is available"
    }
    async fn run(&self) -> CheckResult {
        self.0.check_cli().await
    }
    async fn fix(&self, dry_run: bool) -> Option<FixResult> {
        self.0.fix_cli(dry_run).await
    }
    fn has_fix(&self) -> bool {
        true
    }
}
