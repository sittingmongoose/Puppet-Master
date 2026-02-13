//! Platform-specific types and configurations.

use serde::{Deserialize, Serialize};
use std::fmt;
use std::str::FromStr;
use thiserror::Error;

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

    /// Returns the default CLI binary name for this platform.
    pub fn default_cli_name(&self) -> &'static str {
        match self {
            Platform::Cursor => "agent",
            Platform::Codex => "codex",
            Platform::Claude => "claude",
            Platform::Gemini => "gemini",
            Platform::Copilot => "copilot",
        }
    }

    /// Returns whether this platform supports plan mode.
    pub fn supports_plan_mode(&self) -> bool {
        matches!(
            self,
            Platform::Cursor
                | Platform::Codex
                | Platform::Claude
                | Platform::Gemini
                | Platform::Copilot
        )
    }

    /// Returns whether this platform supports reasoning effort.
    pub fn supports_reasoning_effort(&self) -> bool {
        matches!(self, Platform::Codex | Platform::Claude | Platform::Gemini)
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

    /// Sets the reasoning effort level.
    pub fn with_reasoning_effort(mut self, effort: impl Into<String>) -> Self {
        self.reasoning_effort = Some(effort.into());
        self
    }

    /// Enables plan mode.
    pub fn with_plan_mode(mut self, enabled: bool) -> Self {
        self.plan_mode = enabled;
        self
    }

    /// Sets a custom CLI path.
    pub fn with_cli_path(mut self, path: impl Into<String>) -> Self {
        self.cli_path = Some(path.into());
        self
    }

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

    #[test]
    fn test_platform_features() {
        assert!(Platform::Cursor.supports_plan_mode());
        assert!(Platform::Claude.supports_plan_mode());
        assert!(Platform::Copilot.supports_plan_mode());
        assert!(Platform::Claude.supports_reasoning_effort());
        assert!(Platform::Codex.supports_reasoning_effort());
        assert!(!Platform::Cursor.supports_reasoning_effort());
    }

    #[test]
    fn test_cli_paths() {
        let mut paths = CliPaths::default();
        paths.set(Platform::Cursor, "/usr/bin/cursor".to_string());
        assert_eq!(paths.get(Platform::Cursor), Some("/usr/bin/cursor"));
        assert_eq!(paths.get(Platform::Codex), None);
    }
}
