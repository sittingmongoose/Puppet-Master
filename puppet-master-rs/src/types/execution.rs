//! Execution request and result types.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use async_trait::async_trait;
use std::path::PathBuf;
use std::time::Duration;

use super::platform::Platform;

/// Request to execute a task with an AI agent.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecutionRequest {
    /// The prompt/instruction to send to the agent.
    pub prompt: String,

    /// Model to use.
    pub model: String,

    /// Working directory for execution.
    pub working_directory: PathBuf,

    /// Run in non-interactive mode.
    #[serde(default = "default_true")]
    pub non_interactive: bool,

    /// Timeout in milliseconds (soft timeout).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub timeout_ms: Option<u64>,

    /// Hard timeout in milliseconds (process kill).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub hard_timeout_ms: Option<u64>,

    /// Enable plan mode (for Cursor/Codex).
    #[serde(default)]
    pub plan_mode: bool,

    /// Reasoning effort (for Claude/Gemini).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reasoning_effort: Option<String>,

    /// Additional CLI arguments.
    #[serde(default)]
    pub extra_args: Vec<String>,

    /// Session ID for tracking.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub session_id: Option<String>,

    /// Platform to use.
    pub platform: Platform,

    /// Context files to include.
    #[serde(default)]
    pub context_files: Vec<PathBuf>,

    /// Environment variables to set.
    #[serde(default)]
    pub env_vars: std::collections::HashMap<String, String>,
}

fn default_true() -> bool {
    true
}

impl ExecutionRequest {
    /// Creates a new execution request with minimal parameters.
    pub fn new(
        platform: Platform,
        model: impl Into<String>,
        prompt: impl Into<String>,
        working_directory: PathBuf,
    ) -> Self {
        Self {
            prompt: prompt.into(),
            model: model.into(),
            working_directory,
            non_interactive: true,
            timeout_ms: None,
            hard_timeout_ms: None,
            plan_mode: false,
            reasoning_effort: None,
            extra_args: Vec::new(),
            session_id: None,
            platform,
            context_files: Vec::new(),
            env_vars: std::collections::HashMap::new(),
        }
    }

    /// Sets the timeout.
    pub fn with_timeout(mut self, timeout: Duration) -> Self {
        self.timeout_ms = Some(timeout.as_millis() as u64);
        self
    }

    /// Sets the hard timeout.
    pub fn with_hard_timeout(mut self, timeout: Duration) -> Self {
        self.hard_timeout_ms = Some(timeout.as_millis() as u64);
        self
    }

    /// Enables plan mode.
    pub fn with_plan_mode(mut self, enabled: bool) -> Self {
        self.plan_mode = enabled;
        self
    }

    /// Sets reasoning effort.
    pub fn with_reasoning_effort(mut self, effort: impl Into<String>) -> Self {
        self.reasoning_effort = Some(effort.into());
        self
    }

    /// Sets the session ID.
    pub fn with_session_id(mut self, session_id: impl Into<String>) -> Self {
        self.session_id = Some(session_id.into());
        self
    }

    /// Adds extra CLI arguments.
    pub fn with_extra_args(mut self, args: Vec<String>) -> Self {
        self.extra_args = args;
        self
    }

    /// Adds context files.
    pub fn with_context_files(mut self, files: Vec<PathBuf>) -> Self {
        self.context_files = files;
        self
    }

    /// Adds an environment variable.
    pub fn with_env(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.env_vars.insert(key.into(), value.into());
        self
    }
}

/// Result of an execution.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecutionResult {
    /// Whether the execution succeeded.
    pub success: bool,

    /// Output from the execution.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub output: Option<String>,

    /// Exit code from the process.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exit_code: Option<i32>,

    /// Duration in milliseconds.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub duration_ms: Option<u64>,

    /// Files changed during execution.
    #[serde(default)]
    pub files_changed: Vec<PathBuf>,

    /// Learnings/accomplishments from the execution.
    #[serde(default)]
    pub learnings: Vec<String>,

    /// Completion signal detected.
    #[serde(default)]
    pub completion_signal: CompletionSignal,

    /// Error message if failed.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_message: Option<String>,

    /// Start timestamp.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub started_at: Option<DateTime<Utc>>,

    /// Completion timestamp.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub completed_at: Option<DateTime<Utc>>,

    /// Session ID.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub session_id: Option<String>,

    /// Process ID.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub process_id: Option<u32>,

    /// Git commit SHA created during execution.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub git_commit: Option<String>,

    /// Tokens used (if available).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tokens_used: Option<u64>,
}

impl ExecutionResult {
    /// Creates a new successful execution result.
    pub fn success() -> Self {
        Self {
            success: true,
            output: None,
            exit_code: Some(0),
            duration_ms: None,
            files_changed: Vec::new(),
            learnings: Vec::new(),
            completion_signal: CompletionSignal::None,
            error_message: None,
            started_at: None,
            completed_at: None,
            session_id: None,
            process_id: None,
            git_commit: None,
            tokens_used: None,
        }
    }

    /// Creates a new failed execution result.
    pub fn failure(error: impl Into<String>) -> Self {
        Self {
            success: false,
            output: None,
            exit_code: Some(1),
            duration_ms: None,
            files_changed: Vec::new(),
            learnings: Vec::new(),
            completion_signal: CompletionSignal::None,
            error_message: Some(error.into()),
            started_at: None,
            completed_at: None,
            session_id: None,
            process_id: None,
            git_commit: None,
            tokens_used: None,
        }
    }

    /// Sets the output.
    pub fn with_output(mut self, output: impl Into<String>) -> Self {
        self.output = Some(output.into());
        self
    }

    /// Sets the duration.
    pub fn with_duration(mut self, duration: Duration) -> Self {
        self.duration_ms = Some(duration.as_millis() as u64);
        self
    }

    /// Sets files changed.
    pub fn with_files_changed(mut self, files: Vec<PathBuf>) -> Self {
        self.files_changed = files;
        self
    }

    /// Sets the completion signal.
    pub fn with_completion_signal(mut self, signal: CompletionSignal) -> Self {
        self.completion_signal = signal;
        self
    }

    /// Sets timestamps.
    pub fn with_timestamps(mut self, started: DateTime<Utc>, completed: DateTime<Utc>) -> Self {
        self.started_at = Some(started);
        self.completed_at = Some(completed);
        self
    }

    /// Sets the git commit.
    pub fn with_git_commit(mut self, commit: impl Into<String>) -> Self {
        self.git_commit = Some(commit.into());
        self
    }
}

/// Completion signal from agent output.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum CompletionSignal {
    /// Agent explicitly signaled completion.
    Complete,
    /// Agent reached gutter (end of output with no action).
    Gutter,
    /// No completion signal detected.
    None,
    /// Execution timed out.
    Timeout,
    /// Execution stalled (no output for extended period).
    Stalled,
    /// Execution error.
    Error(String),
}

impl Default for CompletionSignal {
    fn default() -> Self {
        Self::None
    }
}

impl std::fmt::Display for CompletionSignal {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Complete => write!(f, "Complete"),
            Self::Gutter => write!(f, "Gutter"),
            Self::None => write!(f, "None"),
            Self::Timeout => write!(f, "Timeout"),
            Self::Stalled => write!(f, "Stalled"),
            Self::Error(e) => write!(f, "Error: {}", e),
        }
    }
}

/// Execution mode for AI platforms.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ExecutionMode {
    /// Standard execution mode.
    Standard,
    /// Plan mode (for Cursor/Codex).
    Plan,
    /// Interactive mode.
    Interactive,
}

impl Default for ExecutionMode {
    fn default() -> Self {
        Self::Standard
    }
}

/// Reasoning effort level (for Claude/Gemini).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ReasoningEffort {
    /// Low reasoning effort.
    Low,
    /// Medium reasoning effort.
    Medium,
    /// High reasoning effort.
    High,
}

impl Default for ReasoningEffort {
    fn default() -> Self {
        Self::Medium
    }
}

impl std::fmt::Display for ReasoningEffort {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Low => write!(f, "low"),
            Self::Medium => write!(f, "medium"),
            Self::High => write!(f, "high"),
        }
    }
}

/// Status of an execution.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ExecutionStatus {
    /// Execution is pending.
    Pending,
    /// Execution is running.
    Running,
    /// Execution completed successfully.
    Success,
    /// Execution failed.
    Failed,
    /// Execution timed out.
    TimedOut,
    /// Execution was cancelled.
    Cancelled,
}

impl Default for ExecutionStatus {
    fn default() -> Self {
        Self::Pending
    }
}

impl std::fmt::Display for ExecutionStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Pending => write!(f, "Pending"),
            Self::Running => write!(f, "Running"),
            Self::Success => write!(f, "Success"),
            Self::Failed => write!(f, "Failed"),
            Self::TimedOut => write!(f, "Timed Out"),
            Self::Cancelled => write!(f, "Cancelled"),
        }
    }
}

/// A line of output from execution.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OutputLine {
    /// The output text.
    pub text: String,
    /// Type of output line.
    pub line_type: super::events::OutputLineType,
    /// When the line was output.
    pub timestamp: DateTime<Utc>,
}

impl OutputLine {
    /// Creates a new output line.
    pub fn new(text: impl Into<String>, line_type: super::events::OutputLineType) -> Self {
        Self {
            text: text.into(),
            line_type,
            timestamp: Utc::now(),
        }
    }
}

/// Review result from worker reviewer.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReviewResult {
    /// Whether the review passed.
    pub passed: bool,
    /// Review verdict/decision.
    pub verdict: String,
    /// Reasoning for the verdict.
    pub reasoning: String,
    /// Suggested improvements.
    #[serde(default)]
    pub improvements: Vec<String>,
    /// When the review was completed.
    pub reviewed_at: DateTime<Utc>,
}

impl ReviewResult {
    /// Creates a new review result.
    pub fn new(passed: bool, verdict: impl Into<String>, reasoning: impl Into<String>) -> Self {
        Self {
            passed,
            verdict: verdict.into(),
            reasoning: reasoning.into(),
            improvements: Vec::new(),
            reviewed_at: Utc::now(),
        }
    }
}

/// Role of an agent or reviewer.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Role {
    /// Worker agent executing tasks.
    Worker,
    /// Reviewer agent checking work.
    Reviewer,
    /// Orchestrator managing workflow.
    Orchestrator,
}

impl std::fmt::Display for Role {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Worker => write!(f, "Worker"),
            Self::Reviewer => write!(f, "Reviewer"),
            Self::Orchestrator => write!(f, "Orchestrator"),
        }
    }
}

/// Verification method type.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum VerificationMethod {
    /// Command execution verification.
    Command,
    /// File existence check.
    FileExists,
    /// Regular expression match.
    Regex,
    /// Custom script verification.
    Script,
}

impl std::fmt::Display for VerificationMethod {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Command => write!(f, "Command"),
            Self::FileExists => write!(f, "File Exists"),
            Self::Regex => write!(f, "Regex"),
            Self::Script => write!(f, "Script"),
        }
    }
}

/// Verifier trait for implementing verification logic.
#[async_trait]
pub trait Verifier: Send + Sync {
    /// Verifies a criterion and returns a result.
    async fn verify(&self, criterion: &super::prd::Criterion) -> VerifierResult;

    /// Returns the type of this verifier.
    fn verifier_type(&self) -> &str;
}

/// Result of a verification.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifierResult {
    /// Whether verification passed.
    pub passed: bool,
    /// Result message.
    pub message: String,
    /// Evidence collected.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub evidence: Option<super::prd::Evidence>,
    /// Timestamp of verification.
    pub timestamp: DateTime<Utc>,
}

impl VerifierResult {
    /// Creates a new successful verification result.
    pub fn success(message: impl Into<String>) -> Self {
        Self {
            passed: true,
            message: message.into(),
            evidence: None,
            timestamp: Utc::now(),
        }
    }

    /// Creates a new failed verification result.
    pub fn failure(message: impl Into<String>) -> Self {
        Self {
            passed: false,
            message: message.into(),
            evidence: None,
            timestamp: Utc::now(),
        }
    }

    /// Sets the evidence.
    pub fn with_evidence(mut self, evidence: super::prd::Evidence) -> Self {
        self.evidence = Some(evidence);
        self
    }
}

/// Type of evidence data.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum EvidenceType {
    /// Text-based evidence.
    Text,
    /// File path evidence.
    File,
    /// Command output evidence.
    CommandOutput,
    /// Screenshot or image.
    Image,
    /// Test result.
    TestResult,
    /// Git commit.
    GitCommit,
}

impl std::fmt::Display for EvidenceType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Text => write!(f, "Text"),
            Self::File => write!(f, "File"),
            Self::CommandOutput => write!(f, "Command Output"),
            Self::Image => write!(f, "Image"),
            Self::TestResult => write!(f, "Test Result"),
            Self::GitCommit => write!(f, "Git Commit"),
        }
    }
}

/// Evidence data container.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EvidenceData {
    /// Type of evidence.
    pub evidence_type: EvidenceType,
    /// Evidence content.
    pub content: String,
    /// Associated file path if applicable.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file_path: Option<PathBuf>,
    /// Timestamp when evidence was collected.
    pub timestamp: DateTime<Utc>,
}

impl EvidenceData {
    /// Creates new text evidence.
    pub fn text(content: impl Into<String>) -> Self {
        Self {
            evidence_type: EvidenceType::Text,
            content: content.into(),
            file_path: None,
            timestamp: Utc::now(),
        }
    }

    /// Creates new file evidence.
    pub fn file(path: PathBuf, content: impl Into<String>) -> Self {
        Self {
            evidence_type: EvidenceType::File,
            content: content.into(),
            file_path: Some(path),
            timestamp: Utc::now(),
        }
    }
}

/// Information about a running process.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessInfo {
    /// Process ID.
    pub pid: u32,

    /// Command that was executed.
    pub command: String,

    /// Command arguments.
    #[serde(default)]
    pub args: Vec<String>,

    /// When the process started.
    pub start_time: DateTime<Utc>,

    /// Timeout configuration.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub timeout: Option<Duration>,

    /// Working directory.
    pub working_directory: PathBuf,

    /// Session ID.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub session_id: Option<String>,

    /// Platform being used.
    pub platform: Platform,

    /// Model being used.
    pub model: String,
}

impl ProcessInfo {
    /// Creates a new process info.
    pub fn new(
        pid: u32,
        command: impl Into<String>,
        platform: Platform,
        model: impl Into<String>,
        working_directory: PathBuf,
    ) -> Self {
        Self {
            pid,
            command: command.into(),
            args: Vec::new(),
            start_time: Utc::now(),
            timeout: None,
            working_directory,
            session_id: None,
            platform,
            model: model.into(),
        }
    }

    /// Returns whether the process has timed out.
    pub fn is_timed_out(&self) -> bool {
        if let Some(timeout) = self.timeout {
            let elapsed = Utc::now()
                .signed_duration_since(self.start_time)
                .to_std()
                .unwrap_or(Duration::from_secs(0));
            elapsed >= timeout
        } else {
            false
        }
    }

    /// Returns the elapsed time since the process started.
    pub fn elapsed(&self) -> Duration {
        Utc::now()
            .signed_duration_since(self.start_time)
            .to_std()
            .unwrap_or(Duration::from_secs(0))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_execution_request_builder() {
        let req = ExecutionRequest::new(
            Platform::Cursor,
            "claude-3-5-sonnet",
            "Test prompt",
            PathBuf::from("/tmp"),
        )
        .with_plan_mode(true)
        .with_session_id("session123");

        assert_eq!(req.platform, Platform::Cursor);
        assert!(req.plan_mode);
        assert_eq!(req.session_id, Some("session123".to_string()));
    }

    #[test]
    fn test_execution_result_success() {
        let result = ExecutionResult::success()
            .with_output("Success!")
            .with_completion_signal(CompletionSignal::Complete);

        assert!(result.success);
        assert_eq!(result.completion_signal, CompletionSignal::Complete);
        assert_eq!(result.output, Some("Success!".to_string()));
    }

    #[test]
    fn test_execution_result_failure() {
        let result = ExecutionResult::failure("Something went wrong");

        assert!(!result.success);
        assert_eq!(
            result.error_message,
            Some("Something went wrong".to_string())
        );
    }

    #[test]
    fn test_completion_signal_display() {
        assert_eq!(CompletionSignal::Complete.to_string(), "Complete");
        assert_eq!(CompletionSignal::Gutter.to_string(), "Gutter");
        assert_eq!(CompletionSignal::None.to_string(), "None");
    }

    #[test]
    fn test_process_info() {
        let info = ProcessInfo::new(
            12345,
            "cursor",
            Platform::Cursor,
            "claude-3-5-sonnet",
            PathBuf::from("/tmp"),
        );

        assert_eq!(info.pid, 12345);
        assert_eq!(info.platform, Platform::Cursor);
        assert!(!info.is_timed_out());
    }
}
