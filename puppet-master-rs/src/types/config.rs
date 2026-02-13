//! Configuration types for the RWM Puppet Master.

use serde::{Deserialize, Serialize};
use std::fmt;
use std::path::PathBuf;

use super::platform::{Platform, PlatformConfig};

/// Top-level configuration for the Puppet Master.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PuppetMasterConfig {
    /// Project configuration.
    pub project: ProjectConfig,

    /// Tier-specific configurations.
    pub tiers: TierConfigs,

    /// Git branching configuration.
    #[serde(default)]
    pub branching: BranchingConfig,

    /// Verification configuration.
    #[serde(default)]
    pub verification: VerificationConfig,

    /// Memory/state file configuration.
    #[serde(default)]
    pub memory: MemoryConfig,

    /// Budget and quota configuration.
    #[serde(default)]
    pub budget: BudgetConfig,

    /// Logging configuration.
    #[serde(default)]
    pub logging: LoggingConfig,

    /// Orchestrator-specific configuration.
    #[serde(default)]
    pub orchestrator: OrchestratorConfig,

    /// Platform configurations.
    #[serde(default)]
    pub platforms: std::collections::HashMap<String, PlatformConfig>,

    /// Path configuration.
    #[serde(default)]
    pub paths: PathConfig,

    /// UI configuration.
    #[serde(default)]
    pub ui: UiConfig,

    /// P2-T09: Configurable escalation chains.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub escalation: Option<EscalationChainsConfig>,

    /// Interview configuration.
    #[serde(default)]
    pub interview: InterviewConfig,

    /// GUI automation configuration.
    #[serde(default)]
    pub gui_automation: GuiAutomationConfig,
}

/// Orchestrator-specific configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OrchestratorConfig {
    pub max_depth: u32,
    pub max_iterations: u32,
    pub progress_file: String,
    pub prd_file: String,
    pub session_prefix: String,
}

impl Default for OrchestratorConfig {
    fn default() -> Self {
        Self {
            max_depth: 3,
            max_iterations: 10,
            progress_file: "progress.txt".to_string(),
            prd_file: "prd.json".to_string(),
            session_prefix: "PM".to_string(),
        }
    }
}

/// Path configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PathConfig {
    pub workspace: PathBuf,
    pub prd_path: PathBuf,
    pub progress_path: PathBuf,
    pub agents_root: PathBuf,
    pub evidence_root: PathBuf,
    pub usage_file: PathBuf,
    pub event_db: PathBuf,
}

impl Default for PathConfig {
    fn default() -> Self {
        let workspace = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
        Self {
            workspace: workspace.clone(),
            prd_path: workspace.join("prd.json"),
            progress_path: workspace.join("progress.txt"),
            agents_root: workspace.join(".puppet-master").join("agents"),
            evidence_root: workspace.join(".puppet-master").join("evidence"),
            usage_file: workspace
                .join(".puppet-master")
                .join("usage")
                .join("usage.jsonl"),
            event_db: workspace.join(".puppet-master").join("events.db"),
        }
    }
}

/// UI configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UiConfig {
    pub theme: String,
    pub auto_scroll: bool,
    pub show_timestamps: bool,
}

impl Default for UiConfig {
    fn default() -> Self {
        Self {
            theme: "dark".to_string(),
            auto_scroll: true,
            show_timestamps: true,
        }
    }
}

/// Project-level configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectConfig {
    /// Project name.
    pub name: String,

    /// Working directory for the project.
    pub working_directory: PathBuf,

    /// Project description.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    /// Project version.
    #[serde(default = "default_version")]
    pub version: String,
}

fn default_version() -> String {
    "1.0.0".to_string()
}

/// Configuration container for all tiers.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TierConfigs {
    /// Phase-level configuration.
    pub phase: TierConfig,

    /// Task-level configuration.
    pub task: TierConfig,

    /// Subtask-level configuration.
    pub subtask: TierConfig,

    /// Iteration-level configuration.
    pub iteration: TierConfig,
}

/// Configuration for a single tier level.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TierConfig {
    /// Platform to use for this tier.
    pub platform: Platform,

    /// Model identifier.
    pub model: String,

    /// Model level (L1/L2/L3).
    #[serde(default)]
    pub model_level: ModelLevel,

    /// Reasoning effort (for Claude/Gemini).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reasoning_effort: Option<String>,

    /// Enable plan mode (for Cursor/Codex).
    #[serde(default)]
    pub plan_mode: bool,

    /// Task failure handling style.
    #[serde(default)]
    pub task_failure_style: TaskFailureStyle,

    /// Maximum iterations/retries for this tier.
    #[serde(default = "default_max_iterations")]
    pub max_iterations: u32,

    /// Default tier to escalate to (when escalation is required).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub escalation: Option<EscalationTarget>,

    /// Soft timeout in milliseconds.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub timeout_ms: Option<u64>,

    /// Hard timeout in milliseconds (process kill).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub hard_timeout_ms: Option<u64>,

    /// Complexity level for this tier.
    #[serde(default)]
    pub complexity: Complexity,

    /// Task type hints.
    #[serde(default)]
    pub task_types: Vec<TaskType>,
}

fn default_max_iterations() -> u32 {
    3
}

/// Model capability level.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ModelLevel {
    /// Entry-level models (fast, cheap).
    #[serde(rename = "L1")]
    Level1,
    /// Mid-tier models (balanced).
    #[serde(rename = "L2")]
    Level2,
    /// Premium models (most capable).
    #[serde(rename = "L3")]
    Level3,
}

impl Default for ModelLevel {
    fn default() -> Self {
        Self::Level2
    }
}

impl fmt::Display for ModelLevel {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Level1 => write!(f, "L1"),
            Self::Level2 => write!(f, "L2"),
            Self::Level3 => write!(f, "L3"),
        }
    }
}

/// Task complexity level.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Complexity {
    /// Trivial tasks (< 5 min).
    Trivial,
    /// Simple tasks (5-15 min).
    Simple,
    /// Standard tasks (15-60 min).
    Standard,
    /// Critical/complex tasks (> 60 min).
    Critical,
}

impl Default for Complexity {
    fn default() -> Self {
        Self::Standard
    }
}

impl fmt::Display for Complexity {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Trivial => write!(f, "Trivial"),
            Self::Simple => write!(f, "Simple"),
            Self::Standard => write!(f, "Standard"),
            Self::Critical => write!(f, "Critical"),
        }
    }
}

/// Type of work being performed.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum TaskType {
    /// New feature development.
    Feature,
    /// Bug fix.
    Bugfix,
    /// Code refactoring.
    Refactor,
    /// Test creation/maintenance.
    Test,
    /// Documentation.
    Docs,
    /// Performance optimization.
    Performance,
    /// Security fix.
    Security,
    /// Infrastructure/tooling.
    Infrastructure,
}

impl fmt::Display for TaskType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Feature => write!(f, "Feature"),
            Self::Bugfix => write!(f, "Bugfix"),
            Self::Refactor => write!(f, "Refactor"),
            Self::Test => write!(f, "Test"),
            Self::Docs => write!(f, "Docs"),
            Self::Performance => write!(f, "Performance"),
            Self::Security => write!(f, "Security"),
            Self::Infrastructure => write!(f, "Infrastructure"),
        }
    }
}

/// How to handle task failures.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum TaskFailureStyle {
    /// Spawn a new agent instance on failure.
    SpawnNewAgent,
    /// Continue with the same agent.
    ContinueSameAgent,
    /// Skip retries, mark as failed.
    SkipRetries,
}

impl Default for TaskFailureStyle {
    fn default() -> Self {
        Self::ContinueSameAgent
    }
}

/// Git branching configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BranchingConfig {
    /// Base branch to branch from.
    #[serde(default = "default_base_branch")]
    pub base_branch: String,

    /// Branch naming pattern.
    #[serde(default = "default_naming_pattern")]
    pub naming_pattern: String,

    /// Branching granularity.
    #[serde(default)]
    pub granularity: Granularity,

    /// Push policy.
    #[serde(default)]
    pub push_policy: PushPolicy,

    /// Merge policy.
    #[serde(default)]
    pub merge_policy: MergePolicy,

    /// Automatically create PRs.
    #[serde(default)]
    pub auto_pr: bool,
}

impl Default for BranchingConfig {
    fn default() -> Self {
        Self {
            base_branch: default_base_branch(),
            naming_pattern: default_naming_pattern(),
            granularity: Granularity::default(),
            push_policy: PushPolicy::default(),
            merge_policy: MergePolicy::default(),
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

/// Branching granularity level.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Granularity {
    /// One branch per phase.
    Phase,
    /// One branch per task.
    Task,
    /// One branch per subtask.
    Subtask,
    /// One branch per iteration.
    Iteration,
    /// No branching.
    None,
}

impl Default for Granularity {
    fn default() -> Self {
        Self::Task
    }
}

/// When to push branches.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum PushPolicy {
    /// Push after each commit.
    Always,
    /// Push only on tier completion.
    OnComplete,
    /// Push only on successful gate.
    OnGatePass,
    /// Never push automatically.
    Never,
}

impl Default for PushPolicy {
    fn default() -> Self {
        Self::OnComplete
    }
}

/// How to merge branches.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum MergePolicy {
    /// Merge automatically on gate pass.
    Auto,
    /// Create PR for review.
    PullRequest,
    /// Manual merge only.
    Manual,
}

impl Default for MergePolicy {
    fn default() -> Self {
        Self::PullRequest
    }
}

/// Verification and gating configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerificationConfig {
    /// Browser adapter for testing.
    #[serde(default = "default_browser_adapter")]
    pub browser_adapter: String,

    /// Take screenshots on failure.
    #[serde(default = "default_true")]
    pub screenshot_on_failure: bool,

    /// Evidence storage directory.
    #[serde(default = "default_evidence_directory")]
    pub evidence_directory: PathBuf,

    /// Enable strict verification.
    #[serde(default)]
    pub strict_mode: bool,
}

impl Default for VerificationConfig {
    fn default() -> Self {
        Self {
            browser_adapter: default_browser_adapter(),
            screenshot_on_failure: default_true(),
            evidence_directory: default_evidence_directory(),
            strict_mode: false,
        }
    }
}

fn default_browser_adapter() -> String {
    "playwright".to_string()
}

fn default_true() -> bool {
    true
}

fn default_evidence_directory() -> PathBuf {
    PathBuf::from("evidence")
}

/// GUI automation execution configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GuiAutomationConfig {
    /// Enable GUI automation tooling.
    #[serde(default = "default_true")]
    pub enabled: bool,

    /// Default mode (headless|native|hybrid).
    #[serde(default = "default_gui_automation_mode")]
    pub mode: String,

    /// Isolation policy (ephemeralClone by default for full-action).
    #[serde(default = "default_gui_automation_isolation")]
    pub workspace_isolation: String,

    /// Artifact output directory.
    #[serde(default = "default_gui_automation_artifacts")]
    pub artifacts_directory: PathBuf,

    /// Visual diff threshold ratio (0.0-1.0).
    #[serde(default = "default_gui_automation_visual_threshold")]
    pub visual_diff_threshold: f32,
}

impl Default for GuiAutomationConfig {
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

fn default_gui_automation_isolation() -> String {
    "ephemeralClone".to_string()
}

fn default_gui_automation_artifacts() -> PathBuf {
    PathBuf::from(".puppet-master/evidence/gui-automation")
}

fn default_gui_automation_visual_threshold() -> f32 {
    0.01
}

/// Memory and state file configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MemoryConfig {
    /// Progress tracking file.
    #[serde(default = "default_progress_file")]
    pub progress_file: PathBuf,

    /// Agents file path.
    #[serde(default = "default_agents_file")]
    pub agents_file: PathBuf,

    /// PRD file path.
    #[serde(default = "default_prd_file")]
    pub prd_file: PathBuf,

    /// Use multi-level agents file structure.
    #[serde(default = "default_true")]
    pub multi_level_agents: bool,

    /// Enforce agents file constraints.
    #[serde(default = "default_true")]
    pub agents_enforcement: bool,
}

impl Default for MemoryConfig {
    fn default() -> Self {
        Self {
            progress_file: default_progress_file(),
            agents_file: default_agents_file(),
            prd_file: default_prd_file(),
            multi_level_agents: default_true(),
            agents_enforcement: default_true(),
        }
    }
}

fn default_progress_file() -> PathBuf {
    PathBuf::from("progress.txt")
}

fn default_agents_file() -> PathBuf {
    PathBuf::from("AGENTS.md")
}

fn default_prd_file() -> PathBuf {
    PathBuf::from("PRD.md")
}

/// Budget and quota configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BudgetConfig {
    /// Maximum API calls per run.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_calls_per_run: Option<u32>,

    /// Maximum API calls per hour.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_calls_per_hour: Option<u32>,

    /// Maximum API calls per day.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_calls_per_day: Option<u32>,

    /// Maximum tokens per run.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens_per_run: Option<u64>,

    /// Maximum tokens per hour.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens_per_hour: Option<u64>,

    /// Maximum tokens per day.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens_per_day: Option<u64>,

    /// Cooldown period in hours after hitting limit.
    #[serde(default = "default_cooldown_hours")]
    pub cooldown_hours: u32,

    /// Fallback platform when limit reached.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fallback_platform: Option<Platform>,

    /// Budget enforcement configuration.
    #[serde(default)]
    pub enforcement: BudgetEnforcementConfig,
}

impl Default for BudgetConfig {
    fn default() -> Self {
        Self {
            max_calls_per_run: None,
            max_calls_per_hour: None,
            max_calls_per_day: None,
            max_tokens_per_run: None,
            max_tokens_per_hour: None,
            max_tokens_per_day: None,
            cooldown_hours: default_cooldown_hours(),
            fallback_platform: None,
            enforcement: BudgetEnforcementConfig::default(),
        }
    }
}

fn default_cooldown_hours() -> u32 {
    1
}

/// Budget enforcement configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BudgetEnforcementConfig {
    /// Action to take when limit is reached.
    #[serde(default)]
    pub on_limit_reached: LimitAction,

    /// Warn at this percentage of limit.
    #[serde(default = "default_warn_percentage")]
    pub warn_at_percentage: u8,

    /// Soft limit percentage (warnings).
    #[serde(default = "default_soft_limit_percent")]
    pub soft_limit_percent: u8,

    /// Hard limit percentage (enforcement).
    #[serde(default = "default_hard_limit_percent")]
    pub hard_limit_percent: u8,
}

impl Default for BudgetEnforcementConfig {
    fn default() -> Self {
        Self {
            on_limit_reached: LimitAction::default(),
            warn_at_percentage: default_warn_percentage(),
            soft_limit_percent: default_soft_limit_percent(),
            hard_limit_percent: default_hard_limit_percent(),
        }
    }
}

fn default_warn_percentage() -> u8 {
    75
}

fn default_soft_limit_percent() -> u8 {
    90
}

fn default_hard_limit_percent() -> u8 {
    100
}

/// Action to take when budget limit is reached.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum LimitAction {
    /// Fall back to alternate platform.
    Fallback,
    /// Pause execution.
    Pause,
    /// Queue requests for later.
    Queue,
    /// Fail immediately.
    Fail,
}

impl Default for LimitAction {
    fn default() -> Self {
        Self::Pause
    }
}

/// Logging configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoggingConfig {
    /// Log level.
    #[serde(default = "default_log_level")]
    pub level: String,

    /// Log retention in days.
    #[serde(default = "default_retention_days")]
    pub retention_days: u32,

    /// Enable intensive logging.
    #[serde(default)]
    pub intensive: bool,

    /// Log file path.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub log_file: Option<PathBuf>,
}

impl Default for LoggingConfig {
    fn default() -> Self {
        Self {
            level: default_log_level(),
            retention_days: default_retention_days(),
            intensive: false,
            log_file: None,
        }
    }
}

fn default_log_level() -> String {
    "info".to_string()
}

fn default_retention_days() -> u32 {
    7
}

// =============================================================================
// P2-T09: Escalation chain configuration
// =============================================================================

/// Default tier to escalate to when escalation is required.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum EscalationTarget {
    Phase,
    Task,
    Subtask,
}

/// Chain key used under `escalation.chains`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum EscalationChainKey {
    /// YAML key: `testFailure`
    TestFailure,
    Acceptance,
    Timeout,
    Structural,
    Error,
}

/// Action to take for a given chain step.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EscalationChainAction {
    SelfFix,
    KickDown,
    Escalate,
    Pause,
    Retry,
}

/// A single step in an escalation chain.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EscalationChainStepConfig {
    pub action: EscalationChainAction,

    /// Maximum number of attempts this step applies for (range width).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_attempts: Option<u32>,

    /// Only meaningful for `action: escalate`.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub to: Option<EscalationTarget>,

    /// If true, orchestrator should emit a warning/notification.
    #[serde(default)]
    pub notify: bool,
}

/// Escalation chains configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EscalationChainsConfig {
    #[serde(default)]
    pub chains: std::collections::HashMap<EscalationChainKey, Vec<EscalationChainStepConfig>>,
}

// =============================================================================
// Interview configuration
// =============================================================================

/// Configuration for the interactive requirements interview.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InterviewConfig {
    /// Primary AI platform for interviewing.
    #[serde(default = "default_interview_platform")]
    pub platform: String,

    /// Primary model for interviewing.
    #[serde(default = "default_interview_model")]
    pub model: String,

    /// Reasoning/effort level for the interview AI (low/medium/high/max).
    #[serde(default = "default_reasoning_level")]
    pub reasoning_level: String,

    /// Backup platforms with models (tried in order if primary exhausted).
    #[serde(default)]
    pub backup_platforms: Vec<PlatformModelPair>,

    /// Max questions per domain phase (default: 8).
    #[serde(default = "default_max_questions_per_phase")]
    pub max_questions_per_phase: u32,

    /// Whether to use first-principles mode.
    #[serde(default)]
    pub first_principles: bool,

    /// Output directory for interview documents.
    #[serde(default = "default_interview_output_dir")]
    pub output_dir: String,

    /// Require explicit architecture/tech confirmation.
    #[serde(default = "default_true")]
    pub require_architecture_confirmation: bool,

    /// Generate Playwright test requirements.
    #[serde(default = "default_true")]
    pub generate_playwright_requirements: bool,

    /// Generate initial AGENTS.md from interview results.
    #[serde(default = "default_true")]
    pub generate_initial_agents_md: bool,

    /// Interaction mode (expert or eli5).
    #[serde(default = "default_interaction_mode")]
    pub interaction_mode: String,
}

impl Default for InterviewConfig {
    fn default() -> Self {
        Self {
            platform: default_interview_platform(),
            model: default_interview_model(),
            reasoning_level: default_reasoning_level(),
            backup_platforms: vec![PlatformModelPair {
                platform: "cursor".to_string(),
                model: "claude-sonnet-4-5-20250929".to_string(),
            }],
            max_questions_per_phase: default_max_questions_per_phase(),
            first_principles: false,
            output_dir: default_interview_output_dir(),
            require_architecture_confirmation: true,
            generate_playwright_requirements: true,
            generate_initial_agents_md: true,
            interaction_mode: default_interaction_mode(),
        }
    }
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

fn default_interaction_mode() -> String {
    "expert".to_string()
}

/// A platform + model pair for backup platform configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlatformModelPair {
    pub platform: String,
    pub model: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_model_level_display() {
        assert_eq!(ModelLevel::Level1.to_string(), "L1");
        assert_eq!(ModelLevel::Level2.to_string(), "L2");
        assert_eq!(ModelLevel::Level3.to_string(), "L3");
    }

    #[test]
    fn test_complexity_default() {
        assert_eq!(Complexity::default(), Complexity::Standard);
    }

    #[test]
    fn test_branching_config_defaults() {
        let config = BranchingConfig::default();
        assert_eq!(config.base_branch, "main");
        assert_eq!(config.granularity, Granularity::Task);
        assert!(!config.auto_pr);
    }

    #[test]
    fn test_budget_config_defaults() {
        let config = BudgetConfig::default();
        assert_eq!(config.cooldown_hours, 1);
        assert_eq!(config.enforcement.warn_at_percentage, 75);
    }
}

/// Validation error for configuration.
#[derive(Debug, Clone, thiserror::Error)]
pub enum ValidationError {
    /// Missing required field.
    #[error("Missing required field: {0}")]
    MissingField(String),

    /// Invalid value for a field.
    #[error("Invalid value for {field}: {message}")]
    InvalidValue {
        /// Field name.
        field: String,
        /// Error message.
        message: String,
    },

    /// Invalid path.
    #[error("Invalid path: {0}")]
    InvalidPath(PathBuf),

    /// Configuration conflict.
    #[error("Configuration conflict: {0}")]
    Conflict(String),

    /// General validation error.
    #[error("{0}")]
    General(String),
}
