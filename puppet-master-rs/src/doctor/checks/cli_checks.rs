//! CLI availability checks

use crate::types::{CheckCategory, CheckResult, DoctorCheck, FixResult, Platform};
use async_trait::async_trait;
use chrono::Utc;

/// Base check for CLI availability
struct CliCheck {
    name: String,
    install_instructions: String,
    platform: Platform,
}

impl CliCheck {
    fn new(name: &str, _command: &str, install_instructions: &str, platform: Platform) -> Self {
        Self {
            name: name.to_string(),
            install_instructions: install_instructions.to_string(),
            platform,
        }
    }

    async fn check_cli(&self) -> CheckResult {
        // Use PlatformDetector for unified detection (includes binary validation)
        use crate::platforms::platform_detector::PlatformDetector;

        if let Some(detected) = PlatformDetector::detect_platform(self.platform).await {
            let version_info = detected
                .version
                .as_deref()
                .map(|v| format!(" (v{})", v))
                .unwrap_or_default();
            return CheckResult {
                passed: true,
                message: format!(
                    "{} found at {}{}",
                    self.name,
                    detected.cli_path.display(),
                    version_info
                ),
                details: None,
                can_fix: false,
                timestamp: Utc::now(),
            };
        }

        // Not found or binary validation failed
        let install_paths = crate::platforms::platform_specs::default_install_paths(self.platform);
        let details = if install_paths.is_empty() {
            self.install_instructions.clone()
        } else {
            format!(
                "{}\nSearched: {}",
                self.install_instructions,
                install_paths.join(", ")
            )
        };
        CheckResult {
            passed: false,
            message: format!("{} not found or not functional", self.name),
            details: Some(details),
            can_fix: false,
            timestamp: Utc::now(),
        }
    }

    // DRY:FN:cli_fix -- Manual guidance for platform CLI checks
    async fn fix_cli(&self, dry_run: bool) -> Option<FixResult> {
        let guidance = format!(
            "Automatic {} installation has been removed. Install it manually and authenticate before retrying detection.",
            self.name
        );
        if dry_run {
            return Some(FixResult::success(guidance));
        }
        Some(FixResult::failure(guidance))
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
        false
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
        false
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
        false
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
        false
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
        false
    }
}
