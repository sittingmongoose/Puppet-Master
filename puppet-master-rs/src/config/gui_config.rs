//! GUI-specific config structures for the Config page
//!
//! This module provides the data structures used by the Config page's 7-tab UI.
//! It supports loading from and saving to YAML, and integrates with git for branch info.

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;
use std::process::Command;

// ============================================================================
// Top-level GUI Config
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GuiConfig {
    pub project: ProjectConfig,
    pub tiers: TiersConfig,
    pub branching: BranchingConfig,
    pub verification: VerificationConfig,
    pub memory: MemoryConfig,
    pub budgets: BudgetsConfig,
    pub advanced: AdvancedConfig,
}

// ============================================================================
// Tab 0: Project Config (basic info, not heavily edited in UI but displayed)
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectConfig {
    pub name: String,
    pub working_directory: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(default = "default_version")]
    pub version: String,
}

impl Default for ProjectConfig {
    fn default() -> Self {
        Self {
            name: "My Project".to_string(),
            working_directory: std::env::current_dir()
                .ok()
                .and_then(|p| p.to_str().map(String::from))
                .unwrap_or_else(|| ".".to_string()),
            description: None,
            version: default_version(),
        }
    }
}

fn default_version() -> String {
    "1.0.0".to_string()
}

// ============================================================================
// Tab 1: Tiers Config (4 tiers: phase, task, subtask, iteration)
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct TiersConfig {
    pub phase: TierConfig,
    pub task: TierConfig,
    pub subtask: TierConfig,
    pub iteration: TierConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TierConfig {
    pub platform: String, // "cursor", "codex", "claude", "gemini", "copilot"
    pub model: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reasoning_effort: Option<String>, // "default", "low", "medium", "high", "xhigh"
    #[serde(default)]
    pub plan_mode: bool,
    #[serde(default)]
    pub ask_mode: bool,
    #[serde(default = "default_output_format")]
    pub output_format: String, // "text", "json", "stream-json"
    #[serde(default = "default_max_iterations")]
    pub max_iterations: u32,
    #[serde(default = "default_task_failure_style")]
    pub task_failure_style: String, // "spawn_new_agent", "continue_same_agent", "skip_retries"
}

impl Default for TierConfig {
    fn default() -> Self {
        Self {
            platform: "cursor".to_string(),
            model: "gpt-5".to_string(),
            reasoning_effort: None,
            plan_mode: false,
            ask_mode: false,
            output_format: default_output_format(),
            max_iterations: default_max_iterations(),
            task_failure_style: default_task_failure_style(),
        }
    }
}

fn default_output_format() -> String {
    "text".to_string()
}

fn default_max_iterations() -> u32 {
    3
}

fn default_task_failure_style() -> String {
    "continue_same_agent".to_string()
}

// ============================================================================
// Tab 2: Branching Config
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BranchingConfig {
    #[serde(default = "default_base_branch")]
    pub base_branch: String,
    #[serde(default = "default_naming_pattern")]
    pub naming_pattern: String,
    #[serde(default = "default_granularity")]
    pub granularity: String, // "single", "per_phase", "per_task"
    #[serde(default)]
    pub auto_pr: bool,
}

impl Default for BranchingConfig {
    fn default() -> Self {
        Self {
            base_branch: default_base_branch(),
            naming_pattern: default_naming_pattern(),
            granularity: default_granularity(),
            auto_pr: false,
        }
    }
}

fn default_base_branch() -> String {
    "main".to_string()
}

fn default_naming_pattern() -> String {
    "rwm/{tier}/{id}".to_string()
}

fn default_granularity() -> String {
    "per_phase".to_string()
}

// ============================================================================
// Tab 3: Verification Config
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerificationConfig {
    #[serde(default = "default_browser_adapter")]
    pub browser_adapter: String,
    #[serde(default = "default_evidence_directory")]
    pub evidence_directory: String,
    #[serde(default)]
    pub screenshot_on_failure: bool,
}

impl Default for VerificationConfig {
    fn default() -> Self {
        Self {
            browser_adapter: default_browser_adapter(),
            evidence_directory: default_evidence_directory(),
            screenshot_on_failure: true,
        }
    }
}

fn default_browser_adapter() -> String {
    "playwright".to_string()
}

fn default_evidence_directory() -> String {
    ".puppet-master/evidence".to_string()
}

// ============================================================================
// Tab 4: Memory Config
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MemoryConfig {
    #[serde(default = "default_progress_file")]
    pub progress_file: String,
    #[serde(default = "default_agents_file")]
    pub agents_file: String,
    #[serde(default = "default_prd_file")]
    pub prd_file: String,
    #[serde(default)]
    pub multi_level_agents: bool,
}

impl Default for MemoryConfig {
    fn default() -> Self {
        Self {
            progress_file: default_progress_file(),
            agents_file: default_agents_file(),
            prd_file: default_prd_file(),
            multi_level_agents: false,
        }
    }
}

fn default_progress_file() -> String {
    "progress.txt".to_string()
}

fn default_agents_file() -> String {
    ".puppet-master/agents/agents.json".to_string()
}

fn default_prd_file() -> String {
    "prd.json".to_string()
}

// ============================================================================
// Tab 5: Budgets Config (per-platform budgets)
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct BudgetsConfig {
    pub cursor: PlatformBudget,
    pub codex: PlatformBudget,
    pub claude: PlatformBudget,
    pub gemini: PlatformBudget,
    pub copilot: PlatformBudget,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlatformBudget {
    #[serde(default = "default_max_calls_per_run")]
    pub max_calls_per_run: u32,
    #[serde(default = "default_max_calls_per_hour")]
    pub max_calls_per_hour: u32,
    #[serde(default = "default_max_calls_per_day")]
    pub max_calls_per_day: u32,
    #[serde(default)]
    pub unlimited_auto_mode: bool, // Cursor only
}

impl Default for PlatformBudget {
    fn default() -> Self {
        Self {
            max_calls_per_run: default_max_calls_per_run(),
            max_calls_per_hour: default_max_calls_per_hour(),
            max_calls_per_day: default_max_calls_per_day(),
            unlimited_auto_mode: false,
        }
    }
}

fn default_max_calls_per_run() -> u32 {
    100
}

fn default_max_calls_per_hour() -> u32 {
    200
}

fn default_max_calls_per_day() -> u32 {
    1000
}

// ============================================================================
// Tab 6: Advanced Config
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdvancedConfig {
    // Logging
    #[serde(default = "default_log_level")]
    pub log_level: String, // "error", "warn", "info", "debug"
    #[serde(default = "default_process_timeout")]
    pub process_timeout_ms: u64,
    #[serde(default = "default_parallel_iterations")]
    pub parallel_iterations: u32,
    #[serde(default)]
    pub intensive_logging: bool,

    // CLI Paths
    #[serde(default)]
    pub cli_paths: CliPaths,

    // Rate Limits
    #[serde(default)]
    pub rate_limits: RateLimits,

    // Execution Strategy
    #[serde(default)]
    pub execution: ExecutionConfig,

    // Checkpointing
    #[serde(default)]
    pub checkpointing: CheckpointingConfig,

    // Loop Guard
    #[serde(default)]
    pub loop_guard: LoopGuardConfig,

    // Network/Security
    #[serde(default)]
    pub network: NetworkConfig,
}

impl Default for AdvancedConfig {
    fn default() -> Self {
        Self {
            log_level: default_log_level(),
            process_timeout_ms: default_process_timeout(),
            parallel_iterations: default_parallel_iterations(),
            intensive_logging: false,
            cli_paths: CliPaths::default(),
            rate_limits: RateLimits::default(),
            execution: ExecutionConfig::default(),
            checkpointing: CheckpointingConfig::default(),
            loop_guard: LoopGuardConfig::default(),
            network: NetworkConfig::default(),
        }
    }
}

fn default_log_level() -> String {
    "info".to_string()
}

fn default_process_timeout() -> u64 {
    300000 // 5 minutes
}

fn default_parallel_iterations() -> u32 {
    1
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CliPaths {
    #[serde(default)]
    pub cursor: String,
    #[serde(default)]
    pub codex: String,
    #[serde(default)]
    pub claude: String,
    #[serde(default)]
    pub gemini: String,
    #[serde(default)]
    pub copilot: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RateLimits {
    pub cursor: RateLimit,
    pub codex: RateLimit,
    pub claude: RateLimit,
    pub gemini: RateLimit,
    pub copilot: RateLimit,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RateLimit {
    #[serde(default = "default_calls_per_minute")]
    pub calls_per_minute: u32,
    #[serde(default = "default_cooldown_ms")]
    pub cooldown_ms: u64,
}

impl Default for RateLimit {
    fn default() -> Self {
        Self {
            calls_per_minute: default_calls_per_minute(),
            cooldown_ms: default_cooldown_ms(),
        }
    }
}

fn default_calls_per_minute() -> u32 {
    60
}

fn default_cooldown_ms() -> u64 {
    1000
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ExecutionConfig {
    #[serde(default)]
    pub kill_on_failure: bool,
    #[serde(default)]
    pub enable_parallel: bool,
    #[serde(default = "default_max_parallel_phases")]
    pub max_parallel_phases: u32,
    #[serde(default = "default_max_parallel_tasks")]
    pub max_parallel_tasks: u32,
}

fn default_max_parallel_phases() -> u32 {
    1
}

fn default_max_parallel_tasks() -> u32 {
    3
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckpointingConfig {
    #[serde(default)]
    pub enabled: bool,
    #[serde(default = "default_checkpoint_interval")]
    pub interval_seconds: u64,
    #[serde(default = "default_max_checkpoints")]
    pub max_checkpoints: u32,
    #[serde(default)]
    pub on_subtask_complete: bool,
    #[serde(default)]
    pub on_shutdown: bool,
}

impl Default for CheckpointingConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            interval_seconds: default_checkpoint_interval(),
            max_checkpoints: default_max_checkpoints(),
            on_subtask_complete: false,
            on_shutdown: true,
        }
    }
}

fn default_checkpoint_interval() -> u64 {
    300 // 5 minutes
}

fn default_max_checkpoints() -> u32 {
    10
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoopGuardConfig {
    #[serde(default)]
    pub enabled: bool,
    #[serde(default = "default_max_repetitions")]
    pub max_repetitions: u32,
    #[serde(default)]
    pub suppress_reply_relay: bool,
}

impl Default for LoopGuardConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            max_repetitions: default_max_repetitions(),
            suppress_reply_relay: false,
        }
    }
}

fn default_max_repetitions() -> u32 {
    3
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NetworkConfig {
    #[serde(default)]
    pub lan_mode: bool,
    #[serde(default)]
    pub trust_proxy: bool,
    #[serde(default = "default_allowed_origins")]
    pub allowed_origins: String,
}

impl Default for NetworkConfig {
    fn default() -> Self {
        Self {
            lan_mode: false,
            trust_proxy: false,
            allowed_origins: default_allowed_origins(),
        }
    }
}

fn default_allowed_origins() -> String {
    "*".to_string()
}

// ============================================================================
// Git Info (for branching tab)
// ============================================================================

#[derive(Debug, Clone, Default)]
pub struct GitInfo {
    pub current_branch: String,
    pub remote_url: String,
    pub user_name: String,
    pub user_email: String,
    pub branches: Vec<String>,
}

// ============================================================================
// Load/Save Functions
// ============================================================================

/// Load config from a YAML file
pub fn load_config(path: &Path) -> Result<GuiConfig> {
    let content = std::fs::read_to_string(path)
        .with_context(|| format!("Failed to read config from {}", path.display()))?;
    
    let config: GuiConfig = serde_yaml::from_str(&content)
        .with_context(|| "Failed to parse config YAML")?;
    
    Ok(config)
}

/// Save config to a YAML file
pub fn save_config(path: &Path, config: &GuiConfig) -> Result<()> {
    let yaml = serde_yaml::to_string(config)
        .with_context(|| "Failed to serialize config to YAML")?;
    
    std::fs::write(path, yaml)
        .with_context(|| format!("Failed to write config to {}", path.display()))?;
    
    Ok(())
}

/// Get git information for the current repository
pub fn get_git_info() -> GitInfo {
    let mut info = GitInfo::default();

    // Get current branch
    if let Ok(output) = Command::new("git")
        .args(["rev-parse", "--abbrev-ref", "HEAD"])
        .output()
    {
        if output.status.success() {
            info.current_branch = String::from_utf8_lossy(&output.stdout).trim().to_string();
        }
    }

    // Get remote URL
    if let Ok(output) = Command::new("git")
        .args(["remote", "get-url", "origin"])
        .output()
    {
        if output.status.success() {
            info.remote_url = String::from_utf8_lossy(&output.stdout).trim().to_string();
        }
    }

    // Get user name
    if let Ok(output) = Command::new("git")
        .args(["config", "user.name"])
        .output()
    {
        if output.status.success() {
            info.user_name = String::from_utf8_lossy(&output.stdout).trim().to_string();
        }
    }

    // Get user email
    if let Ok(output) = Command::new("git")
        .args(["config", "user.email"])
        .output()
    {
        if output.status.success() {
            info.user_email = String::from_utf8_lossy(&output.stdout).trim().to_string();
        }
    }

    // Get all branches
    if let Ok(output) = Command::new("git")
        .args(["branch", "--list", "--format=%(refname:short)"])
        .output()
    {
        if output.status.success() {
            info.branches = String::from_utf8_lossy(&output.stdout)
                .lines()
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect();
        }
    }

    info
}

/// Get available models for a platform
pub fn get_models_for_platform(platform: &str) -> Vec<String> {
    match platform {
        "cursor" => vec![
            "gpt-5".to_string(),
            "gpt-5-turbo".to_string(),
            "gpt-4.1".to_string(),
            "gpt-4.5".to_string(),
        ],
        "codex" => vec![
            "gpt-5.2-codex".to_string(),
            "gpt-5.1-codex".to_string(),
            "gpt-4.3-codex".to_string(),
        ],
        "claude" => vec![
            "claude-sonnet-4-5".to_string(),
            "claude-sonnet-4-3".to_string(),
            "claude-opus-4".to_string(),
            "claude-haiku-4".to_string(),
        ],
        "gemini" => vec![
            "gemini-2.5-pro".to_string(),
            "gemini-2.5-flash".to_string(),
            "gemini-2.0-ultra".to_string(),
        ],
        "copilot" => vec![
            "gpt-5-copilot".to_string(),
            "gpt-4.5-copilot".to_string(),
        ],
        _ => vec![],
    }
}

/// Check if a model supports reasoning effort
pub fn model_supports_reasoning(platform: &str, _model: &str) -> bool {
    matches!(platform, "claude" | "gemini")
}

/// Build the initial model map for all platforms
pub fn build_model_map() -> HashMap<String, Vec<String>> {
    let mut map = HashMap::new();
    for platform in &["cursor", "codex", "claude", "gemini", "copilot"] {
        map.insert(platform.to_string(), get_models_for_platform(platform));
    }
    map
}
