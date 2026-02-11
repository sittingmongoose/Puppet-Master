//! State machine types for orchestrator and tier execution.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fmt;

/// Top-level orchestrator state.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum OrchestratorState {
    /// Orchestrator is idle, waiting to start.
    Idle,
    /// Planning the next execution step.
    Planning,
    /// Executing a tier (phase/task/subtask/iteration).
    Executing,
    /// Execution is paused (manual or automatic).
    Paused,
    /// An error occurred during execution.
    Error,
    /// All work is complete.
    Complete,
}

impl Default for OrchestratorState {
    fn default() -> Self {
        Self::Idle
    }
}

impl fmt::Display for OrchestratorState {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Idle => write!(f, "Idle"),
            Self::Planning => write!(f, "Planning"),
            Self::Executing => write!(f, "Executing"),
            Self::Paused => write!(f, "Paused"),
            Self::Error => write!(f, "Error"),
            Self::Complete => write!(f, "Complete"),
        }
    }
}

/// State of an individual tier (phase, task, subtask, or iteration).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum TierState {
    /// Tier is pending, not yet started.
    Pending,
    /// Planning execution for this tier.
    Planning,
    /// Tier is currently running.
    Running,
    /// Gating (validation/verification) in progress.
    Gating,
    /// Tier passed all checks.
    Passed,
    /// Tier failed.
    Failed,
    /// Tier escalated to higher level.
    Escalated,
    /// Tier is being retried.
    Retrying,
    /// Tier was skipped.
    Skipped,
    /// Tier was reopened after passing.
    Reopened,
}

impl Default for TierState {
    fn default() -> Self {
        Self::Pending
    }
}

impl fmt::Display for TierState {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Pending => write!(f, "Pending"),
            Self::Planning => write!(f, "Planning"),
            Self::Running => write!(f, "Running"),
            Self::Gating => write!(f, "Gating"),
            Self::Passed => write!(f, "Passed"),
            Self::Failed => write!(f, "Failed"),
            Self::Escalated => write!(f, "Escalated"),
            Self::Retrying => write!(f, "Retrying"),
            Self::Skipped => write!(f, "Skipped"),
            Self::Reopened => write!(f, "Reopened"),
        }
    }
}

impl TierState {
    /// Returns whether this state represents completion (success or failure).
    pub fn is_complete(&self) -> bool {
        matches!(
            self,
            Self::Passed | Self::Failed | Self::Escalated | Self::Skipped
        )
    }

    /// Returns whether this state represents active execution.
    pub fn is_active(&self) -> bool {
        matches!(
            self,
            Self::Planning | Self::Running | Self::Gating | Self::Retrying
        )
    }

    /// Returns whether this state represents a successful outcome.
    pub fn is_success(&self) -> bool {
        matches!(self, Self::Passed)
    }

    /// Returns whether this state represents a failure outcome.
    pub fn is_failure(&self) -> bool {
        matches!(self, Self::Failed | Self::Escalated)
    }
}

/// Type of execution tier in the hierarchy.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum TierType {
    /// Top-level phase.
    Phase,
    /// Task within a phase.
    Task,
    /// Subtask within a task.
    Subtask,
    /// Individual iteration/attempt of a subtask.
    Iteration,
}

impl fmt::Display for TierType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Phase => write!(f, "Phase"),
            Self::Task => write!(f, "Task"),
            Self::Subtask => write!(f, "Subtask"),
            Self::Iteration => write!(f, "Iteration"),
        }
    }
}

/// Context information for the orchestrator's current execution state.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OrchestratorContext {
    /// Current phase ID being executed.
    pub current_phase_id: Option<String>,

    /// Current task ID being executed.
    pub current_task_id: Option<String>,

    /// Current subtask ID being executed.
    pub current_subtask_id: Option<String>,

    /// Current iteration ID being executed.
    pub current_iteration_id: Option<String>,

    /// Reason for pause (if paused).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pause_reason: Option<String>,

    /// Error message (if in error state).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_message: Option<String>,

    /// Timestamp of last state change.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_state_change: Option<DateTime<Utc>>,

    /// Number of retries for current item.
    #[serde(default)]
    pub retry_count: u32,

    /// Maximum retries allowed.
    #[serde(default)]
    pub max_retries: u32,
}

impl OrchestratorContext {
    /// Creates a new empty context.
    pub fn new() -> Self {
        Self::default()
    }

    /// Sets the current phase ID.
    pub fn with_phase_id(mut self, id: impl Into<String>) -> Self {
        self.current_phase_id = Some(id.into());
        self
    }

    /// Sets the current task ID.
    pub fn with_task_id(mut self, id: impl Into<String>) -> Self {
        self.current_task_id = Some(id.into());
        self
    }

    /// Sets the current subtask ID.
    pub fn with_subtask_id(mut self, id: impl Into<String>) -> Self {
        self.current_subtask_id = Some(id.into());
        self
    }

    /// Sets the current iteration ID.
    pub fn with_iteration_id(mut self, id: impl Into<String>) -> Self {
        self.current_iteration_id = Some(id.into());
        self
    }

    /// Clears all tier IDs.
    pub fn clear_tiers(&mut self) {
        self.current_phase_id = None;
        self.current_task_id = None;
        self.current_subtask_id = None;
        self.current_iteration_id = None;
    }

    /// Returns the deepest active tier type.
    pub fn active_tier_type(&self) -> Option<TierType> {
        if self.current_iteration_id.is_some() {
            Some(TierType::Iteration)
        } else if self.current_subtask_id.is_some() {
            Some(TierType::Subtask)
        } else if self.current_task_id.is_some() {
            Some(TierType::Task)
        } else if self.current_phase_id.is_some() {
            Some(TierType::Phase)
        } else {
            None
        }
    }
}

/// Represents a state transition with metadata.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StateTransition {
    /// State transitioning from.
    pub from: String,

    /// State transitioning to.
    pub to: String,

    /// Timestamp of the transition.
    pub timestamp: DateTime<Utc>,

    /// Trigger or reason for the transition.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub trigger: Option<String>,

    /// Additional metadata about the transition.
    #[serde(default, skip_serializing_if = "serde_json::Map::is_empty")]
    pub metadata: serde_json::Map<String, serde_json::Value>,
}

impl StateTransition {
    /// Creates a new state transition.
    pub fn new(from: impl Into<String>, to: impl Into<String>) -> Self {
        Self {
            from: from.into(),
            to: to.into(),
            timestamp: Utc::now(),
            trigger: None,
            metadata: serde_json::Map::new(),
        }
    }

    /// Sets the trigger/reason for the transition.
    pub fn with_trigger(mut self, trigger: impl Into<String>) -> Self {
        self.trigger = Some(trigger.into());
        self
    }

    /// Adds metadata to the transition.
    pub fn with_metadata(mut self, key: String, value: serde_json::Value) -> Self {
        self.metadata.insert(key, value);
        self
    }
}

/// Result of auto-advancement evaluation.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdvancementResult {
    /// Whether advancement should occur.
    pub should_advance: bool,
    /// Reason for the decision.
    pub reason: String,
    /// Confidence score (0.0 to 1.0).
    #[serde(default)]
    pub confidence: f64,
    /// Timestamp of evaluation.
    pub timestamp: DateTime<Utc>,
}

impl AdvancementResult {
    /// Creates a new advancement result.
    pub fn new(should_advance: bool, reason: impl Into<String>) -> Self {
        Self {
            should_advance,
            reason: reason.into(),
            confidence: 1.0,
            timestamp: Utc::now(),
        }
    }

    /// Sets the confidence score.
    pub fn with_confidence(mut self, confidence: f64) -> Self {
        self.confidence = confidence.clamp(0.0, 1.0);
        self
    }
}

/// Action to take when escalating a tier.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum EscalationAction {
    /// Retry at current tier.
    Retry,
    /// Escalate to parent tier.
    EscalateToParent,
    /// Skip current tier.
    Skip,
    /// Pause and wait for user input.
    PauseForUser,
    /// Fail immediately.
    Fail,
}

impl fmt::Display for EscalationAction {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Retry => write!(f, "Retry"),
            Self::EscalateToParent => write!(f, "Escalate to Parent"),
            Self::Skip => write!(f, "Skip"),
            Self::PauseForUser => write!(f, "Pause for User"),
            Self::Fail => write!(f, "Fail"),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tier_state_queries() {
        assert!(TierState::Passed.is_complete());
        assert!(TierState::Passed.is_success());
        assert!(!TierState::Passed.is_failure());

        assert!(TierState::Running.is_active());
        assert!(!TierState::Running.is_complete());

        assert!(TierState::Failed.is_complete());
        assert!(TierState::Failed.is_failure());
        assert!(!TierState::Failed.is_success());
    }

    #[test]
    fn test_orchestrator_context() {
        let ctx = OrchestratorContext::new()
            .with_phase_id("phase1")
            .with_task_id("task1");

        assert_eq!(ctx.current_phase_id, Some("phase1".to_string()));
        assert_eq!(ctx.current_task_id, Some("task1".to_string()));
        assert_eq!(ctx.active_tier_type(), Some(TierType::Task));
    }

    #[test]
    fn test_state_transition() {
        let transition = StateTransition::new("idle", "planning")
            .with_trigger("user_command")
            .with_metadata("phase".to_string(), serde_json::json!("phase1"));

        assert_eq!(transition.from, "idle");
        assert_eq!(transition.to, "planning");
        assert_eq!(transition.trigger, Some("user_command".to_string()));
        assert!(transition.metadata.contains_key("phase"));
    }
}

/// Context for an iteration execution.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IterationContext {
    pub tier_id: String,
    pub phase_id: String,
    pub task_id: String,
    pub subtask_id: String,
    pub iteration_number: u32,
    pub iteration: u32,
    pub prompt: String,
    pub model: String,
    pub platform: super::platform::Platform,
    pub working_directory: std::path::PathBuf,
    pub working_dir: std::path::PathBuf,
    pub session_id: String,
    pub timeout_ms: Option<u64>,
    pub timeout_secs: Option<u64>,
    pub context_files: Vec<std::path::PathBuf>,
    pub env_vars: std::collections::HashMap<String, String>,
}

/// Information about a session.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionInfo {
    pub session_id: String,
    pub tier_id: String,
    pub tier_type: TierType,
    pub platform: super::platform::Platform,
    pub model: String,
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub state: SessionState,
    pub process_id: Option<u32>,
}

/// State of a session.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum SessionState {
    Running,
    Completed,
    Failed,
    Stopped,
}
