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
        match which(&self.command) {
            Ok(path) => CheckResult {
                passed: true,
                message: format!("{} found at {:?}", self.name, path),
                details: None,
                can_fix: false,
                timestamp: Utc::now(),
            },
            Err(_) => CheckResult {
                passed: false,
                message: format!("{} not found in PATH", self.name),
                details: Some(self.install_instructions.clone()),
                can_fix: true,
                timestamp: Utc::now(),
            },
        }
    }
}

/// Cursor CLI check
pub struct CursorCheck(CliCheck);

impl CursorCheck {
    pub fn new() -> Self {
        Self(CliCheck::new(
            "Cursor",
            "agent",
            "Install Cursor from https://cursor.sh/ and ensure agent (or cursor-agent) is in PATH",
            Platform::Cursor,
        ))
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
        if dry_run {
            return Some(FixResult::success("Would run: curl -fsSL https://cursor.com/install | bash"));
        }
        let manager = InstallationManager::new();
        match manager.execute_install(self.0.platform) {
            Ok(result) => Some(if result.success {
                FixResult::success(result.message)
            } else {
                FixResult::failure(result.message)
            }),
            Err(e) => Some(FixResult::failure(format!("Install failed: {}", e))),
        }
    }

    fn has_fix(&self) -> bool {
        true
    }
}

/// Codex CLI check
pub struct CodexCheck(CliCheck);

impl CodexCheck {
    pub fn new() -> Self {
        Self(CliCheck::new(
            "Codex",
            "codex",
            "Install Codex CLI: npm install -g @openai/codex",
            Platform::Codex,
        ))
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
        if dry_run {
            return Some(FixResult::success("Would run: npm install -g @openai/codex"));
        }
        let manager = InstallationManager::new();
        match manager.execute_install(self.0.platform) {
            Ok(result) => Some(if result.success {
                FixResult::success(result.message)
            } else {
                FixResult::failure(result.message)
            }),
            Err(e) => Some(FixResult::failure(format!("Install failed: {}", e))),
        }
    }

    fn has_fix(&self) -> bool {
        true
    }
}

/// Claude Code CLI check
pub struct ClaudeCheck(CliCheck);

impl ClaudeCheck {
    pub fn new() -> Self {
        Self(CliCheck::new(
            "Claude Code",
            "claude",
            "Install Claude Code CLI: curl -fsSL https://claude.ai/install.sh | bash",
            Platform::Claude,
        ))
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
        if dry_run {
            return Some(FixResult::success("Would run: curl -fsSL https://claude.ai/install.sh | bash"));
        }
        let manager = InstallationManager::new();
        match manager.execute_install(self.0.platform) {
            Ok(result) => Some(if result.success {
                FixResult::success(result.message)
            } else {
                FixResult::failure(result.message)
            }),
            Err(e) => Some(FixResult::failure(format!("Install failed: {}", e))),
        }
    }

    fn has_fix(&self) -> bool {
        true
    }
}

/// Gemini CLI check
pub struct GeminiCheck(CliCheck);

impl GeminiCheck {
    pub fn new() -> Self {
        Self(CliCheck::new(
            "Gemini",
            "gemini",
            "Install Gemini CLI: npm install -g @google/gemini-cli",
            Platform::Gemini,
        ))
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
        if dry_run {
            return Some(FixResult::success("Would run: npm install -g @google/gemini-cli"));
        }
        let manager = InstallationManager::new();
        match manager.execute_install(self.0.platform) {
            Ok(result) => Some(if result.success {
                FixResult::success(result.message)
            } else {
                FixResult::failure(result.message)
            }),
            Err(e) => Some(FixResult::failure(format!("Install failed: {}", e))),
        }
    }

    fn has_fix(&self) -> bool {
        true
    }
}

/// Copilot CLI check
pub struct CopilotCheck(CliCheck);

impl CopilotCheck {
    pub fn new() -> Self {
        Self(CliCheck::new(
            "GitHub Copilot",
            "copilot",
            "Install GitHub Copilot CLI: gh extension install github/gh-copilot",
            Platform::Copilot,
        ))
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
        if dry_run {
            return Some(FixResult::success("Would run: gh extension install github/gh-copilot (requires gh)"));
        }
        let manager = InstallationManager::new();
        match manager.execute_install(self.0.platform) {
            Ok(result) => Some(if result.success {
                FixResult::success(result.message)
            } else {
                FixResult::failure(result.message)
            }),
            Err(e) => Some(FixResult::failure(format!("Install failed: {}", e))),
        }
    }

    fn has_fix(&self) -> bool {
        true
    }
}
