//! Platform-specific types and configurations.

use serde::{Deserialize, Serialize};
use std::fmt;
use std::str::FromStr;
use thiserror::Error;

// DRY:DATA:Platform
/// Supported AI assistant platforms.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Platform {
    /// Cursor IDE
    Cursor,
    /// OpenAI Codex CLI
    Codex,
    /// Anthropic Claude Desktop
    Claude,
    /// Google Gemini
    Gemini,
    /// GitHub Copilot
    Copilot,
}

impl Platform {
    // DRY:FN:all
    /// Returns all available platforms.
    pub fn all() -> &'static [Platform] {
        &[
            Platform::Cursor,
            Platform::Codex,
            Platform::Claude,
            Platform::Gemini,
            Platform::Copilot,
        ]
    }

    // DRY:FN:default_cli_name
    /// Returns the default CLI binary name for this platform.
    pub fn default_cli_name(&self) -> &'static str {
        crate::platforms::platform_specs::cli_binary_names(*self)
            .first()
            .copied()
            .expect("platform_specs must define at least one CLI binary name")
    }
    // DRY:FN:resolve_cli_command

    /// DRY:FN:resolve_cli_command — Resolve the best available CLI command using platform_specs.
    pub fn resolve_cli_command(&self) -> String {
        // Copilot uses npx -y @github/copilot so the agentic CLI is always used; resolve npx only.
        if matches!(self, Platform::Copilot) {
            return crate::platforms::path_utils::resolve_executable("npx")
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_else(|| "npx".to_string());
        }

        let app_bin = crate::install::app_paths::get_app_bin_dir();
        let cli_names = crate::platforms::platform_specs::cli_binary_names(*self);

        // Check app-local bin first (app-managed installations).
        for name in cli_names {
            let candidate = app_bin.join(name);
            if candidate.exists() && candidate.is_file() {
                return candidate.to_string_lossy().to_string();
            }
        }

        // Fall back to system PATH (for backward compat).
        for name in cli_names {
            if which::which(name).is_ok() {
                return (*name).to_string();
            }
        }

        // Backward-compatible fallback for older Cursor installs.
        if matches!(self, Platform::Cursor) && which::which("cursor-agent").is_ok() {
            return "cursor-agent".to_string();
        }

        cli_names
            .first()
            .copied()
            .unwrap_or(self.default_cli_name())
            .to_string()
    }

    // DRY:FN:supports_plan_mode
    /// Returns whether this platform supports plan mode.
    pub fn supports_plan_mode(&self) -> bool {
        crate::platforms::platform_specs::supports_plan_mode(*self)
    }

    // DRY:FN:supports_reasoning_effort
    /// Returns whether this platform supports reasoning effort.
    pub fn supports_reasoning_effort(&self) -> bool {
        crate::platforms::platform_specs::supports_effort(*self)
    }

    // DRY:FN:reasoning_is_model_based
    /// Returns whether reasoning is encoded in model names (true only for Cursor).
    pub fn reasoning_is_model_based(&self) -> bool {
        crate::platforms::platform_specs::reasoning_is_model_based(*self)
    }

    // DRY:FN:has_auto_mode
    /// Returns whether this platform has an auto model selection mode (true only for Cursor).
    pub fn has_auto_mode(&self) -> bool {
        crate::platforms::platform_specs::has_auto_mode(*self)
    }

    // DRY:FN:from_str_loose
    /// Parse from string, returning `None` instead of `Err` for convenience.
    pub fn from_str_loose(s: &str) -> Option<Platform> {
        s.parse().ok()
    }
}

impl fmt::Display for Platform {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Platform::Cursor => write!(f, "cursor"),
            Platform::Codex => write!(f, "codex"),
            Platform::Claude => write!(f, "claude"),
            Platform::Gemini => write!(f, "gemini"),
            Platform::Copilot => write!(f, "copilot"),
        }
    }
}

// DRY:DATA:UnknownPlatformError
/// Error type for platform parsing.
#[derive(Debug, Error)]
#[error("Unknown platform: {0}")]
pub struct UnknownPlatformError(String);

impl FromStr for Platform {
    type Err = UnknownPlatformError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "cursor" => Ok(Platform::Cursor),
            "codex" => Ok(Platform::Codex),
            "claude" => Ok(Platform::Claude),
            "gemini" => Ok(Platform::Gemini),
            "copilot" => Ok(Platform::Copilot),
            _ => Err(UnknownPlatformError(s.to_string())),
        }
    }
}

// DRY:DATA:CliPaths
/// CLI paths for each platform.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CliPaths {
    /// Path to Cursor CLI executable.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,

    /// Path to Codex CLI executable.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub codex: Option<String>,

    /// Path to Claude CLI executable.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub claude: Option<String>,

    /// Path to Gemini CLI executable.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub gemini: Option<String>,

    /// Path to GitHub CLI (for Copilot).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub copilot: Option<String>,
}

impl Default for CliPaths {
    fn default() -> Self {
        Self {
            cursor: None,
            codex: None,
            claude: None,
            gemini: None,
            copilot: None,
        }
    }
}

impl CliPaths {
    // DRY:FN:get
    /// Gets the CLI path for a specific platform.
    pub fn get(&self, platform: Platform) -> Option<&str> {
        match platform {
            Platform::Cursor => self.cursor.as_deref(),
            Platform::Codex => self.codex.as_deref(),
            Platform::Claude => self.claude.as_deref(),
            Platform::Gemini => self.gemini.as_deref(),
            Platform::Copilot => self.copilot.as_deref(),
        }
    }

    // DRY:FN:set
    /// Sets the CLI path for a specific platform.
    pub fn set(&mut self, platform: Platform, path: String) {
        match platform {
            Platform::Cursor => self.cursor = Some(path),
            Platform::Codex => self.codex = Some(path),
            Platform::Claude => self.claude = Some(path),
            Platform::Gemini => self.gemini = Some(path),
            Platform::Copilot => self.copilot = Some(path),
        }
    }
}

impl crate::config::gui_config::CliPaths {
    // DRY:FN:get
    /// DRY:FN:gui_cli_paths_get — Compatibility accessor for GUI CLI paths.
    pub fn get(&self, platform: Platform) -> Option<&str> {
        let path = match platform {
            Platform::Cursor => self.cursor.as_str(),
            Platform::Codex => self.codex.as_str(),
            Platform::Claude => self.claude.as_str(),
            Platform::Gemini => self.gemini.as_str(),
            Platform::Copilot => self.copilot.as_str(),
        };
        if path.trim().is_empty() {
            None
        } else {
            Some(path)
        }
    }
}

// DRY:DATA:PlatformConfig
/// Platform-specific configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlatformConfig {
    /// The platform type.
    pub platform: Platform,

    /// Model identifier (e.g., "claude-3-5-sonnet", "gemini-2.0-flash-thinking").
    pub model: String,

    /// Platform name.
    pub name: String,

    /// Executable path or command.
    pub executable: String,

    /// Reasoning effort level (for Codex/Claude/Gemini).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reasoning_effort: Option<String>,

    /// Enable plan mode (for Cursor/Codex/Claude/Gemini/Copilot).
    #[serde(default)]
    pub plan_mode: bool,

    /// Custom CLI path for this platform.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cli_path: Option<String>,

    /// Additional platform-specific arguments.
    #[serde(default)]
    pub extra_args: Vec<String>,

    /// Whether this platform is enabled.
    #[serde(default)]
    pub enabled: bool,

    /// Environment variable name for API key.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub api_key_env: Option<String>,

    /// Maximum tokens for this platform.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,

    /// Temperature setting for model.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>,

    /// Whether platform is available.
    #[serde(default)]
    pub available: bool,

    /// Platform priority.
    #[serde(default)]
    pub priority: u32,

    /// Usage quota.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub quota: Option<u64>,
}

impl PlatformConfig {
    // DRY:FN:new
    /// Creates a new platform configuration.
    pub fn new(platform: Platform, model: impl Into<String>) -> Self {
        let platform_name = format!("{:?}", platform);
        let executable = match platform {
            Platform::Cursor => "agent".to_string(),
            Platform::Codex => "codex".to_string(),
            Platform::Claude => "claude".to_string(),
            Platform::Gemini => "gemini".to_string(),
            Platform::Copilot => "copilot".to_string(),
        };

        Self {
            platform,
            model: model.into(),
            name: platform_name,
            executable,
            reasoning_effort: None,
            plan_mode: false,
            cli_path: None,
            extra_args: Vec::new(),
            enabled: true,
            api_key_env: None,
            max_tokens: None,
            temperature: None,
            available: false,
            priority: 0,
            quota: None,
        }
    }

    // DRY:FN:with_reasoning_effort
    /// Sets the reasoning effort level.
    pub fn with_reasoning_effort(mut self, effort: impl Into<String>) -> Self {
        self.reasoning_effort = Some(effort.into());
        self
    }

    // DRY:FN:with_plan_mode
    /// Enables plan mode.
    pub fn with_plan_mode(mut self, enabled: bool) -> Self {
        self.plan_mode = enabled;
        self
    }

    // DRY:FN:with_cli_path
    /// Sets a custom CLI path.
    pub fn with_cli_path(mut self, path: impl Into<String>) -> Self {
        self.cli_path = Some(path.into());
        self
    }

    // DRY:FN:with_extra_args
    /// Adds extra arguments.
    pub fn with_extra_args(mut self, args: Vec<String>) -> Self {
        self.extra_args = args;
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_platform_from_str() {
        assert_eq!("cursor".parse::<Platform>().unwrap(), Platform::Cursor);
        assert_eq!("CODEX".parse::<Platform>().unwrap(), Platform::Codex);
        assert_eq!("Claude".parse::<Platform>().unwrap(), Platform::Claude);
        assert!("invalid".parse::<Platform>().is_err());
    }

    #[test]
    fn test_platform_display() {
        assert_eq!(Platform::Cursor.to_string(), "cursor");
        assert_eq!(Platform::Gemini.to_string(), "gemini");
    }

    /// Auth map keys use Debug format (PascalCase). Setup and load_auth_status_map must use the same key.
    #[test]
    fn test_platform_debug_format_matches_auth_map_key() {
        assert_eq!(format!("{:?}", Platform::Cursor), "Cursor");
        assert_eq!(format!("{:?}", Platform::Codex), "Codex");
        assert_eq!(format!("{:?}", Platform::Claude), "Claude");
        assert_eq!(format!("{:?}", Platform::Gemini), "Gemini");
        assert_eq!(format!("{:?}", Platform::Copilot), "Copilot");
    }

    #[test]
    fn test_platform_features() {
        // All 5 platforms support plan mode
        assert!(Platform::Cursor.supports_plan_mode());
        assert!(Platform::Claude.supports_plan_mode());
        assert!(Platform::Copilot.supports_plan_mode());
        assert!(Platform::Codex.supports_plan_mode());
        assert!(Platform::Gemini.supports_plan_mode());

        // Effort: Claude, Codex, Copilot = true; Cursor, Gemini = false
        assert!(Platform::Claude.supports_reasoning_effort());
        assert!(Platform::Codex.supports_reasoning_effort());
        assert!(Platform::Copilot.supports_reasoning_effort());
        assert!(!Platform::Cursor.supports_reasoning_effort());
        assert!(!Platform::Gemini.supports_reasoning_effort());

        // Model-based reasoning: only Cursor
        assert!(Platform::Cursor.reasoning_is_model_based());
        assert!(!Platform::Claude.reasoning_is_model_based());

        // Auto mode: only Cursor
        assert!(Platform::Cursor.has_auto_mode());
        assert!(!Platform::Claude.has_auto_mode());
    }

    #[test]
    fn test_resolve_cli_command_has_fallback() {
        for platform in Platform::all() {
            let command = platform.resolve_cli_command();
            assert!(!command.is_empty());
        }
    }

    #[test]
    fn test_cli_paths() {
        let mut paths = CliPaths::default();
        paths.set(Platform::Cursor, "/usr/bin/cursor".to_string());
        assert_eq!(paths.get(Platform::Cursor), Some("/usr/bin/cursor"));
        assert_eq!(paths.get(Platform::Codex), None);
    }
}
