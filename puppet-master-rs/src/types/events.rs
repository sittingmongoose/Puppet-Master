//! Event types for the event bus and logging system.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

use super::platform::Platform;
use super::prd::GateReport;
use super::state::{OrchestratorState, TierState, TierType};

/// Events emitted by the Puppet Master orchestrator.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum PuppetMasterEvent {
    /// Orchestrator state changed.
    StateChanged {
        from: OrchestratorState,
        to: OrchestratorState,
        timestamp: DateTime<Utc>,
        #[serde(skip_serializing_if = "Option::is_none")]
        reason: Option<String>,
    },

    /// A tier's state changed.
    TierChanged {
        tier_id: String,
        tier_type: TierType,
        from_state: TierState,
        to_state: TierState,
        timestamp: DateTime<Utc>,
    },

    /// An iteration started.
    IterationStart {
        item_id: String,
        platform: Platform,
        model: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        reasoning_effort: Option<String>,
        attempt: u32,
        session_id: String,
        timestamp: DateTime<Utc>,
    },

    /// An iteration completed.
    IterationComplete {
        item_id: String,
        success: bool,
        duration_ms: u64,
        #[serde(skip_serializing_if = "Option::is_none")]
        output_summary: Option<String>,
        timestamp: DateTime<Utc>,
    },

    /// Gate verification started.
    GateStart {
        tier_id: String,
        gate_type: String,
        timestamp: DateTime<Utc>,
    },

    /// Gate verification completed.
    GateComplete {
        tier_id: String,
        passed: bool,
        report: GateReport,
        timestamp: DateTime<Utc>,
    },

    /// Budget usage updated.
    BudgetUpdate {
        platform: Platform,
        used: u64,
        limit: u64,
        percentage: f64,
        timestamp: DateTime<Utc>,
    },

    /// Log message.
    Log {
        level: LogLevel,
        message: String,
        source: String,
        timestamp: DateTime<Utc>,
    },

    /// Error occurred.
    Error {
        message: String,
        source: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        tier_id: Option<String>,
        timestamp: DateTime<Utc>,
    },

    /// Output line from execution.
    Output {
        line: String,
        source: String,
        line_type: OutputLineType,
        timestamp: DateTime<Utc>,
    },

    /// Progress update.
    Progress {
        phase_progress: f64,
        task_progress: f64,
        subtask_progress: f64,
        iteration_progress: f64,
        overall_progress: f64,
        timestamp: DateTime<Utc>,
    },

    /// Project loaded.
    ProjectLoaded {
        name: String,
        path: PathBuf,
        timestamp: DateTime<Utc>,
    },

    /// AGENTS.md file updated.
    AgentsUpdated {
        path: PathBuf,
        timestamp: DateTime<Utc>,
    },

    /// Git commit created.
    Commit {
        sha: String,
        message: String,
        files_changed: Vec<PathBuf>,
        timestamp: DateTime<Utc>,
    },

    /// Process killed.
    ProcessKilled {
        pid: u32,
        reason: String,
        timestamp: DateTime<Utc>,
    },

    /// Start chain step beginning.
    StartChainStep {
        step: u32,
        total: u32,
        description: String,
        timestamp: DateTime<Utc>,
    },

    /// Start chain completed.
    StartChainComplete {
        success: bool,
        #[serde(skip_serializing_if = "Option::is_none")]
        message: Option<String>,
        timestamp: DateTime<Utc>,
    },

    /// Parallel execution started.
    ParallelExecutionStarted {
        subtask_ids: Vec<String>,
        timestamp: DateTime<Utc>,
    },

    /// Parallel execution completed.
    ParallelExecutionCompleted {
        subtask_ids: Vec<String>,
        success_count: u32,
        failure_count: u32,
        duration_ms: u64,
        timestamp: DateTime<Utc>,
    },

    /// A subtask in parallel execution completed.
    ParallelSubtaskCompleted {
        subtask_id: String,
        success: bool,
        duration_ms: u64,
        timestamp: DateTime<Utc>,
    },

    /// A subtask in parallel execution errored.
    ParallelSubtaskError {
        subtask_id: String,
        error: String,
        timestamp: DateTime<Utc>,
    },

    /// Replan completed.
    ReplanComplete {
        tier_id: String,
        tier_type: TierType,
        plan: String,
        timestamp: DateTime<Utc>,
    },

    /// Item reopened after passing.
    ItemReopened {
        item_id: String,
        reason: String,
        timestamp: DateTime<Utc>,
    },

    /// Reviewer verdict received.
    ReviewerVerdict {
        tier_id: String,
        verdict: String,
        reasoning: String,
        timestamp: DateTime<Utc>,
    },

    /// Timeout occurred.
    Timeout {
        tier_id: String,
        timeout_ms: u64,
        timestamp: DateTime<Utc>,
    },

    /// Escalation triggered.
    Escalation {
        from_tier_id: String,
        to_tier_id: String,
        reason: String,
        timestamp: DateTime<Utc>,
    },

    /// Retry attempted.
    RetryAttempt {
        tier_id: String,
        attempt: u32,
        max_attempts: u32,
        timestamp: DateTime<Utc>,
    },

    /// Branch created.
    BranchCreated {
        branch_name: String,
        from_branch: String,
        timestamp: DateTime<Utc>,
    },

    /// Branch merged.
    BranchMerged {
        branch_name: String,
        into_branch: String,
        timestamp: DateTime<Utc>,
    },

    /// Pull request created.
    PullRequestCreated {
        pr_number: u32,
        branch_name: String,
        title: String,
        timestamp: DateTime<Utc>,
    },

    /// Evidence stored.
    EvidenceStored {
        tier_id: String,
        evidence_type: String,
        path: PathBuf,
        timestamp: DateTime<Utc>,
    },

    /// Session started.
    SessionStarted {
        session_id: String,
        platform: Platform,
        timestamp: DateTime<Utc>,
    },

    /// Session ended.
    SessionEnded {
        session_id: String,
        duration_ms: u64,
        timestamp: DateTime<Utc>,
    },

    /// Configuration loaded.
    ConfigLoaded {
        config_path: PathBuf,
        timestamp: DateTime<Utc>,
    },

    /// Configuration validation error.
    ConfigValidationError {
        errors: Vec<String>,
        timestamp: DateTime<Utc>,
    },

    /// Orchestrator paused.
    OrchestratorPaused {
        reason: String,
        timestamp: DateTime<Utc>,
    },

    /// Orchestrator resumed.
    OrchestratorResumed {
        timestamp: DateTime<Utc>,
    },

    /// User interaction required.
    UserInteractionRequired {
        message: String,
        tier_id: String,
        timestamp: DateTime<Utc>,
    },

    /// Custom event with arbitrary data.
    Custom {
        event_type: String,
        data: serde_json::Value,
        timestamp: DateTime<Utc>,
    },
}

impl PuppetMasterEvent {
    /// Returns the timestamp of this event.
    pub fn timestamp(&self) -> DateTime<Utc> {
        match self {
            Self::StateChanged { timestamp, .. } => *timestamp,
            Self::TierChanged { timestamp, .. } => *timestamp,
            Self::IterationStart { timestamp, .. } => *timestamp,
            Self::IterationComplete { timestamp, .. } => *timestamp,
            Self::GateStart { timestamp, .. } => *timestamp,
            Self::GateComplete { timestamp, .. } => *timestamp,
            Self::BudgetUpdate { timestamp, .. } => *timestamp,
            Self::Log { timestamp, .. } => *timestamp,
            Self::Error { timestamp, .. } => *timestamp,
            Self::Output { timestamp, .. } => *timestamp,
            Self::Progress { timestamp, .. } => *timestamp,
            Self::ProjectLoaded { timestamp, .. } => *timestamp,
            Self::AgentsUpdated { timestamp, .. } => *timestamp,
            Self::Commit { timestamp, .. } => *timestamp,
            Self::ProcessKilled { timestamp, .. } => *timestamp,
            Self::StartChainStep { timestamp, .. } => *timestamp,
            Self::StartChainComplete { timestamp, .. } => *timestamp,
            Self::ParallelExecutionStarted { timestamp, .. } => *timestamp,
            Self::ParallelExecutionCompleted { timestamp, .. } => *timestamp,
            Self::ParallelSubtaskCompleted { timestamp, .. } => *timestamp,
            Self::ParallelSubtaskError { timestamp, .. } => *timestamp,
            Self::ReplanComplete { timestamp, .. } => *timestamp,
            Self::ItemReopened { timestamp, .. } => *timestamp,
            Self::ReviewerVerdict { timestamp, .. } => *timestamp,
            Self::Timeout { timestamp, .. } => *timestamp,
            Self::Escalation { timestamp, .. } => *timestamp,
            Self::RetryAttempt { timestamp, .. } => *timestamp,
            Self::BranchCreated { timestamp, .. } => *timestamp,
            Self::BranchMerged { timestamp, .. } => *timestamp,
            Self::PullRequestCreated { timestamp, .. } => *timestamp,
            Self::EvidenceStored { timestamp, .. } => *timestamp,
            Self::SessionStarted { timestamp, .. } => *timestamp,
            Self::SessionEnded { timestamp, .. } => *timestamp,
            Self::ConfigLoaded { timestamp, .. } => *timestamp,
            Self::ConfigValidationError { timestamp, .. } => *timestamp,
            Self::OrchestratorPaused { timestamp, .. } => *timestamp,
            Self::OrchestratorResumed { timestamp, .. } => *timestamp,
            Self::UserInteractionRequired { timestamp, .. } => *timestamp,
            Self::Custom { timestamp, .. } => *timestamp,
        }
    }

    /// Returns whether this event represents an error.
    pub fn is_error(&self) -> bool {
        matches!(
            self,
            Self::Error { .. }
                | Self::ConfigValidationError { .. }
                | Self::ParallelSubtaskError { .. }
        )
    }

    /// Returns whether this event represents a state change.
    pub fn is_state_change(&self) -> bool {
        matches!(self, Self::StateChanged { .. } | Self::TierChanged { .. })
    }

    /// Creates a log event.
    pub fn log(level: LogLevel, message: impl Into<String>, source: impl Into<String>) -> Self {
        Self::Log {
            level,
            message: message.into(),
            source: source.into(),
            timestamp: Utc::now(),
        }
    }

    /// Creates an error event.
    pub fn error(message: impl Into<String>, source: impl Into<String>) -> Self {
        Self::Error {
            message: message.into(),
            source: source.into(),
            tier_id: None,
            timestamp: Utc::now(),
        }
    }

    /// Creates a progress update event.
    pub fn progress(
        phase: f64,
        task: f64,
        subtask: f64,
        iteration: f64,
        overall: f64,
    ) -> Self {
        Self::Progress {
            phase_progress: phase,
            task_progress: task,
            subtask_progress: subtask,
            iteration_progress: iteration,
            overall_progress: overall,
            timestamp: Utc::now(),
        }
    }
}

/// Log level for log events.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum LogLevel {
    /// Trace-level logging.
    Trace,
    /// Debug-level logging.
    Debug,
    /// Informational logging.
    Info,
    /// Warning-level logging.
    Warn,
    /// Error-level logging.
    Error,
}

impl std::fmt::Display for LogLevel {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Trace => write!(f, "TRACE"),
            Self::Debug => write!(f, "DEBUG"),
            Self::Info => write!(f, "INFO"),
            Self::Warn => write!(f, "WARN"),
            Self::Error => write!(f, "ERROR"),
        }
    }
}

impl std::str::FromStr for LogLevel {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "trace" => Ok(Self::Trace),
            "debug" => Ok(Self::Debug),
            "info" => Ok(Self::Info),
            "warn" | "warning" => Ok(Self::Warn),
            "error" => Ok(Self::Error),
            _ => Err(format!("Unknown log level: {}", s)),
        }
    }
}

/// Type of output line.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum OutputLineType {
    /// Standard output.
    Stdout,
    /// Standard error.
    Stderr,
    /// System message.
    System,
    /// Agent message.
    Agent,
}

impl std::fmt::Display for OutputLineType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Stdout => write!(f, "stdout"),
            Self::Stderr => write!(f, "stderr"),
            Self::System => write!(f, "system"),
            Self::Agent => write!(f, "agent"),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_event_timestamp() {
        let event = PuppetMasterEvent::log(LogLevel::Info, "Test message", "test");
        assert!(event.timestamp() <= Utc::now());
    }

    #[test]
    fn test_event_is_error() {
        let error_event = PuppetMasterEvent::error("Test error", "test");
        assert!(error_event.is_error());

        let log_event = PuppetMasterEvent::log(LogLevel::Info, "Test", "test");
        assert!(!log_event.is_error());
    }

    #[test]
    fn test_log_level_ordering() {
        assert!(LogLevel::Error > LogLevel::Warn);
        assert!(LogLevel::Warn > LogLevel::Info);
        assert!(LogLevel::Info > LogLevel::Debug);
        assert!(LogLevel::Debug > LogLevel::Trace);
    }

    #[test]
    fn test_log_level_from_str() {
        assert_eq!("info".parse::<LogLevel>().unwrap(), LogLevel::Info);
        assert_eq!("WARN".parse::<LogLevel>().unwrap(), LogLevel::Warn);
        assert_eq!("error".parse::<LogLevel>().unwrap(), LogLevel::Error);
        assert!("invalid".parse::<LogLevel>().is_err());
    }

    #[test]
    fn test_output_line_type_display() {
        assert_eq!(OutputLineType::Stdout.to_string(), "stdout");
        assert_eq!(OutputLineType::Stderr.to_string(), "stderr");
        assert_eq!(OutputLineType::System.to_string(), "system");
        assert_eq!(OutputLineType::Agent.to_string(), "agent");
    }

    #[test]
    fn test_progress_event() {
        let event = PuppetMasterEvent::progress(25.0, 50.0, 75.0, 100.0, 60.0);
        
        if let PuppetMasterEvent::Progress {
            phase_progress,
            task_progress,
            subtask_progress,
            iteration_progress,
            overall_progress,
            ..
        } = event
        {
            assert_eq!(phase_progress, 25.0);
            assert_eq!(task_progress, 50.0);
            assert_eq!(subtask_progress, 75.0);
            assert_eq!(iteration_progress, 100.0);
            assert_eq!(overall_progress, 60.0);
        } else {
            panic!("Expected Progress event");
        }
    }
}
