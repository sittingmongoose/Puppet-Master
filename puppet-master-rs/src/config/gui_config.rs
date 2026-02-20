//! GUI-specific config structures for the Config page
//!
//! This module provides the data structures used by the Config page's 7-tab UI.
//! It supports loading from and saving to YAML, and integrates with git for branch info.

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;
use std::process::Command;

use crate::types::config::DEFAULT_GUI_AUTOMATION_ARTIFACTS_DIR;

// ============================================================================
// Top-level GUI Config
// ============================================================================

// DRY:DATA:GuiConfig
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
    #[serde(default)]
    pub interview: InterviewGuiConfig,
    #[serde(default)]
    pub gui_automation: GuiAutomationGuiConfig,
}

// ============================================================================
// Tab 0: Project Config (basic info, not heavily edited in UI but displayed)
// ============================================================================

// DRY:DATA:ProjectConfig
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

// DRY:DATA:TiersConfig
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct TiersConfig {
    pub phase: TierConfig,
    pub task: TierConfig,
    pub subtask: TierConfig,
    pub iteration: TierConfig,
}

// DRY:DATA:TierConfig
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

// DRY:DATA:BranchingConfig
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

// DRY:DATA:VerificationConfig
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
// Tab 3b: GUI Automation Config
// ============================================================================

// DRY:DATA:GuiAutomationGuiConfig
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GuiAutomationGuiConfig {
    #[serde(default = "default_enabled_gui_automation")]
    pub enabled: bool,
    #[serde(default = "default_gui_automation_mode")]
    pub mode: String,
    #[serde(default = "default_gui_automation_isolation")]
    pub workspace_isolation: String,
    #[serde(default = "default_gui_automation_artifacts")]
    pub artifacts_directory: String,
    #[serde(default = "default_gui_automation_visual_threshold")]
    pub visual_diff_threshold: f32,
}

impl Default for GuiAutomationGuiConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            mode: default_gui_automation_mode(),
            workspace_isolation: default_gui_automation_isolation(),
            artifacts_directory: default_gui_automation_artifacts(),
            visual_diff_threshold: default_gui_automation_visual_threshold(),
        }
    }
}

fn default_gui_automation_mode() -> String {
    "hybrid".to_string()
}

fn default_enabled_gui_automation() -> bool {
    true
}

fn default_gui_automation_isolation() -> String {
    "ephemeralClone".to_string()
}

fn default_gui_automation_artifacts() -> String {
    DEFAULT_GUI_AUTOMATION_ARTIFACTS_DIR.to_string()
}

fn default_gui_automation_visual_threshold() -> f32 {
    0.01
}

// ============================================================================
// Tab 4: Memory Config
// ============================================================================

// DRY:DATA:MemoryConfig
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

// DRY:DATA:BudgetsConfig
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct BudgetsConfig {
    pub cursor: PlatformBudget,
    pub codex: PlatformBudget,
    pub claude: PlatformBudget,
    pub gemini: PlatformBudget,
    pub copilot: PlatformBudget,
}

// DRY:DATA:PlatformBudget
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

// DRY:DATA:AdvancedConfig
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

    // Installation scope
    #[serde(default)]
    pub install_scope: InstallScope,

    // Per-platform experimental features toggle
    #[serde(default)]
    pub experimental_enabled: std::collections::HashMap<String, bool>,

    // Per-platform subagent/multi-agent toggle
    #[serde(default)]
    pub subagent_enabled: std::collections::HashMap<String, bool>,

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
            install_scope: InstallScope::default(),
            experimental_enabled: std::collections::HashMap::new(),
            subagent_enabled: std::collections::HashMap::new(),
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

// DRY:DATA:InstallScope — Installation scope for platform CLIs
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum InstallScope {
    /// System-wide installation (default PATH)
    Global,
    /// Project-local installation (./node_modules/.bin/ for npm-based platforms)
    ProjectLocal,
}

impl Default for InstallScope {
    fn default() -> Self {
        Self::Global
    }
}

impl std::fmt::Display for InstallScope {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Global => write!(f, "Global"),
            Self::ProjectLocal => write!(f, "Project Local"),
        }
    }
}

// DRY:DATA:CliPaths
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

// DRY:DATA:RateLimits
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RateLimits {
    pub cursor: RateLimit,
    pub codex: RateLimit,
    pub claude: RateLimit,
    pub gemini: RateLimit,
    pub copilot: RateLimit,
}

// DRY:DATA:RateLimit
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

// DRY:DATA:ExecutionConfig
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

// DRY:DATA:CheckpointingConfig
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

// DRY:DATA:LoopGuardConfig
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

// DRY:DATA:NetworkConfig
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
// Tab 7: Interview Config
// ============================================================================

// DRY:DATA:InterviewGuiConfig
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InterviewGuiConfig {
    #[serde(default = "default_interview_platform")]
    pub platform: String,
    #[serde(default = "default_interview_model")]
    pub model: String,
    #[serde(default = "default_reasoning_level")]
    pub reasoning_level: String,
    #[serde(default)]
    pub backup_platforms: Vec<BackupPlatformEntry>,
    #[serde(default = "default_max_questions_per_phase")]
    pub max_questions_per_phase: u32,
    #[serde(default)]
    pub first_principles: bool,
    #[serde(default = "default_interview_output_dir")]
    pub output_dir: String,
    #[serde(default = "default_true_interview")]
    pub require_architecture_confirmation: bool,
    #[serde(default = "default_true_interview")]
    pub generate_playwright_requirements: bool,
    #[serde(default = "default_true_interview")]
    pub generate_initial_agents_md: bool,
    /// Preferred platform for vision-capable image references (filtered by capabilities).
    #[serde(default = "default_vision_provider")]
    pub vision_provider: String,
}

impl Default for InterviewGuiConfig {
    fn default() -> Self {
        Self {
            platform: default_interview_platform(),
            model: default_interview_model(),
            reasoning_level: default_reasoning_level(),
            backup_platforms: vec![BackupPlatformEntry {
                platform: "cursor".to_string(),
                model: "claude-sonnet-4-5-20250929".to_string(),
            }],
            max_questions_per_phase: default_max_questions_per_phase(),
            first_principles: false,
            output_dir: default_interview_output_dir(),
            require_architecture_confirmation: true,
            generate_playwright_requirements: true,
            generate_initial_agents_md: true,
            vision_provider: default_vision_provider(),
        }
    }
}

// DRY:DATA:BackupPlatformEntry
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupPlatformEntry {
    pub platform: String,
    pub model: String,
}

fn default_interview_platform() -> String {
    "claude".to_string()
}

fn default_interview_model() -> String {
    "claude-sonnet-4-5-20250929".to_string()
}

fn default_reasoning_level() -> String {
    "medium".to_string()
}

fn default_max_questions_per_phase() -> u32 {
    8
}

fn default_interview_output_dir() -> String {
    ".puppet-master/interview".to_string()
}

fn default_vision_provider() -> String {
    "codex".to_string()
}

fn default_true_interview() -> bool {
    true
}

// ============================================================================
// Git Info (for branching tab)
// ============================================================================

// DRY:DATA:GitInfo
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

// DRY:FN:load_config
/// Load config from a YAML file
pub fn load_config(path: &Path) -> Result<GuiConfig> {
    // Check if file exists, return default if not
    if !path.exists() {
        log::info!(
            "Config file {} does not exist, using defaults",
            path.display()
        );
        return Ok(GuiConfig::default());
    }

    let content = std::fs::read_to_string(path)
        .with_context(|| format!("Failed to read config from {}", path.display()))?;

    let config: GuiConfig =
        serde_yaml::from_str(&content).with_context(|| "Failed to parse config YAML")?;

    Ok(config)
}

// DRY:FN:save_config
/// Save config to a YAML file
pub fn save_config(path: &Path, config: &GuiConfig) -> Result<()> {
    // Ensure parent directory exists
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)
            .with_context(|| format!("Failed to create parent directory {}", parent.display()))?;
    }

    let yaml =
        serde_yaml::to_string(config).with_context(|| "Failed to serialize config to YAML")?;

    std::fs::write(path, yaml)
        .with_context(|| format!("Failed to write config to {}", path.display()))?;

    Ok(())
}

// DRY:FN:get_git_info
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
    if let Ok(output) = Command::new("git").args(["config", "user.name"]).output() {
        if output.status.success() {
            info.user_name = String::from_utf8_lossy(&output.stdout).trim().to_string();
        }
    }

    // Get user email
    if let Ok(output) = Command::new("git").args(["config", "user.email"]).output() {
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

// DRY:FN:build_model_map — Builds HashMap<platform_name, Vec<model_id>> from platform_specs fallback data
/// Build the initial (empty) model map for all platforms.
/// Models are populated dynamically via model discovery at runtime.
pub fn build_model_map() -> HashMap<String, Vec<String>> {
    use crate::types::Platform;

    let mut map = HashMap::new();
    for platform in Platform::all() {
        map.insert(platform.to_string(), Vec::new());
    }
    map
}
