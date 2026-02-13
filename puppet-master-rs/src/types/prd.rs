//! PRD (Product Requirements Document) types and work queue structures.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

use super::platform::Platform;
use super::state::TierState;

/// Product Requirements Document - the top-level work queue structure.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PRD {
    /// Metadata about the PRD and project.
    pub metadata: PRDMetadata,

    /// List of phases in execution order.
    pub phases: Vec<Phase>,
}

/// Metadata about the PRD and overall project progress.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PRDMetadata {
    /// Project name.
    pub name: String,

    /// Project description.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    /// PRD version.
    #[serde(default = "default_version")]
    pub version: String,

    /// Total number of tasks across all phases.
    #[serde(default)]
    pub total_tasks: u32,

    /// Total number of subtasks across all tasks.
    #[serde(default)]
    pub total_subtasks: u32,

    /// Number of completed items.
    #[serde(default)]
    pub completed_count: u32,

    /// Total tests defined.
    #[serde(default)]
    pub total_tests: u32,

    /// Tests that have passed.
    #[serde(default)]
    pub passed_tests: u32,

    /// When the PRD was created.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created_at: Option<DateTime<Utc>>,

    /// When the PRD was last updated.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<DateTime<Utc>>,
}

fn default_version() -> String {
    "1.0.0".to_string()
}

/// A phase - top-level organizational unit.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Phase {
    /// Unique phase identifier.
    pub id: String,

    /// Phase title.
    pub title: String,

    /// Phase goal/objective.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub goal: Option<String>,

    /// Detailed phase description.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    /// Current execution status.
    #[serde(default)]
    pub status: ItemStatus,

    /// Tasks in this phase.
    #[serde(default)]
    pub tasks: Vec<Task>,

    /// Number of iterations/attempts for this phase.
    #[serde(default)]
    pub iterations: u32,

    /// Evidence collected for this phase.
    #[serde(default)]
    pub evidence: Vec<Evidence>,

    /// Gate report for phase completion.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub gate_report: Option<GateReport>,

    /// Orchestrator state for this phase.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub orchestrator_state: Option<TierState>,

    /// Orchestrator context.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub orchestrator_context: Option<serde_json::Value>,

    /// Phase dependencies (IDs of phases that must complete first).
    #[serde(default)]
    pub dependencies: Vec<String>,
}

/// A task within a phase.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    /// Unique task identifier.
    pub id: String,

    /// Task title.
    pub title: String,

    /// Detailed task description.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    /// Current execution status.
    #[serde(default)]
    pub status: ItemStatus,

    /// Subtasks in this task.
    #[serde(default)]
    pub subtasks: Vec<Subtask>,

    /// Evidence collected for this task.
    #[serde(default)]
    pub evidence: Vec<Evidence>,

    /// Gate reports for this task.
    #[serde(default)]
    pub gate_reports: Vec<GateReport>,

    /// Task dependencies (IDs of tasks that must complete first).
    #[serde(default)]
    pub dependencies: Vec<String>,

    /// Estimated complexity.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub complexity: Option<String>,

    /// Task type/category.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub task_type: Option<String>,
}

/// A subtask within a task.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Subtask {
    /// Unique subtask identifier.
    pub id: String,

    /// Parent task ID.
    pub task_id: String,

    /// Subtask title.
    pub title: String,

    /// Detailed subtask description.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    /// Success criterion for this subtask.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub criterion: Option<Criterion>,

    /// Current execution status.
    #[serde(default)]
    pub status: ItemStatus,

    /// Number of iterations/attempts.
    #[serde(default)]
    pub iterations: u32,

    /// Evidence collected for this subtask.
    #[serde(default)]
    pub evidence: Vec<Evidence>,

    /// Execution plan for this subtask.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub plan: Option<String>,

    /// Acceptance criteria.
    #[serde(default)]
    pub acceptance_criteria: Vec<String>,

    /// Associated iteration records.
    #[serde(default)]
    pub iteration_records: Vec<Iteration>,
}

/// An individual iteration/attempt of a subtask.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Iteration {
    /// Unique iteration identifier.
    pub id: String,

    /// Parent subtask ID.
    pub subtask_id: String,

    /// Attempt number (1-indexed).
    pub attempt_number: u32,

    /// Iteration status.
    #[serde(default)]
    pub status: ItemStatus,

    /// Platform used for this iteration.
    pub platform: Platform,

    /// Model used.
    pub model: String,

    /// Session ID for this iteration.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub session_id: Option<String>,

    /// Process ID.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub process_id: Option<u32>,

    /// Start timestamp.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub started_at: Option<DateTime<Utc>>,

    /// Completion timestamp.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub completed_at: Option<DateTime<Utc>>,

    /// Duration in milliseconds.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub duration_ms: Option<u64>,

    /// Execution output/logs.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub output: Option<String>,

    /// Git commit SHA for this iteration.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub git_commit: Option<String>,

    /// Files changed during this iteration.
    #[serde(default)]
    pub files_changed: Vec<String>,

    /// Error message if failed.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_message: Option<String>,
}

/// Item status enum - comprehensive status tracking.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ItemStatus {
    /// Item is pending, not yet started.
    Pending,
    /// Planning phase for this item.
    Planning,
    /// Item is currently running.
    Running,
    /// Gating/verification in progress.
    Gating,
    /// Item passed all checks.
    Passed,
    /// Item failed.
    Failed,
    /// Item was skipped.
    Skipped,
    /// Item escalated to higher tier.
    Escalated,
    /// Item reopened after passing.
    Reopened,
    /// Item is blocked by dependencies.
    Blocked,
}

impl Default for ItemStatus {
    fn default() -> Self {
        Self::Pending
    }
}

impl std::fmt::Display for ItemStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Pending => write!(f, "Pending"),
            Self::Planning => write!(f, "Planning"),
            Self::Running => write!(f, "Running"),
            Self::Gating => write!(f, "Gating"),
            Self::Passed => write!(f, "Passed"),
            Self::Failed => write!(f, "Failed"),
            Self::Skipped => write!(f, "Skipped"),
            Self::Escalated => write!(f, "Escalated"),
            Self::Reopened => write!(f, "Reopened"),
            Self::Blocked => write!(f, "Blocked"),
        }
    }
}

impl ItemStatus {
    /// Returns whether this status represents completion.
    pub fn is_complete(&self) -> bool {
        matches!(
            self,
            Self::Passed | Self::Failed | Self::Skipped | Self::Escalated
        )
    }

    /// Returns whether this status represents active work.
    pub fn is_active(&self) -> bool {
        matches!(self, Self::Planning | Self::Running | Self::Gating)
    }

    /// Returns whether this status represents success.
    pub fn is_success(&self) -> bool {
        matches!(self, Self::Passed)
    }

    /// Returns whether this status represents failure.
    pub fn is_failure(&self) -> bool {
        matches!(self, Self::Failed | Self::Escalated)
    }
}

/// Evidence collected during execution.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Evidence {
    /// Evidence type/category.
    pub evidence_type: String,

    /// File path to evidence.
    pub path: PathBuf,

    /// Timestamp when evidence was collected.
    pub timestamp: DateTime<Utc>,

    /// Description of the evidence.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    /// Additional metadata.
    #[serde(default)]
    pub metadata: HashMap<String, String>,
}

/// Gate report from verification/validation.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GateReport {
    /// Gate type/name.
    pub gate_type: String,

    /// Whether the gate passed.
    pub passed: bool,

    /// Timestamp of the gate check.
    pub timestamp: DateTime<Utc>,

    /// Detailed report/findings.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub report: Option<String>,

    /// Criteria checked.
    #[serde(default)]
    pub criteria: Vec<Criterion>,

    /// Reviewer notes.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reviewer_notes: Option<String>,
}

/// Success criterion for validation.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Criterion {
    /// Criterion identifier.
    pub id: String,

    /// Criterion description.
    pub description: String,

    /// Whether this criterion was met.
    #[serde(default)]
    pub met: bool,

    /// How this criterion is verified.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub verification_method: Option<String>,

    /// Expected outcome.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expected: Option<String>,

    /// Actual outcome.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub actual: Option<String>,
}

/// Type of criterion for classification.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum CriterionType {
    /// Functional requirement.
    Functional,
    /// Performance requirement.
    Performance,
    /// Quality requirement.
    Quality,
    /// Security requirement.
    Security,
    /// Compliance requirement.
    Compliance,
}

impl std::fmt::Display for CriterionType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Functional => write!(f, "Functional"),
            Self::Performance => write!(f, "Performance"),
            Self::Quality => write!(f, "Quality"),
            Self::Security => write!(f, "Security"),
            Self::Compliance => write!(f, "Compliance"),
        }
    }
}

/// Result of evaluating a single criterion.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CriterionResult {
    /// Criterion that was evaluated.
    pub criterion: Criterion,
    /// Whether the criterion passed.
    pub passed: bool,
    /// Detailed result message.
    pub message: String,
    /// Timestamp of evaluation.
    pub timestamp: DateTime<Utc>,
}

/// Result of a gate evaluation.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GateResult {
    /// Gate identifier.
    pub gate_id: String,
    /// Whether the gate passed.
    pub passed: bool,
    /// Individual criterion results.
    pub criterion_results: Vec<CriterionResult>,
    /// Overall gate message.
    pub message: String,
    /// Timestamp of gate evaluation.
    pub timestamp: DateTime<Utc>,
}

/// Decision made by a gate.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum GateDecision {
    /// Gate passed - proceed.
    Pass,
    /// Gate failed - stop.
    Fail,
    /// Gate requires human review.
    Review,
    /// Gate skipped.
    Skip,
}

impl std::fmt::Display for GateDecision {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Pass => write!(f, "Pass"),
            Self::Fail => write!(f, "Fail"),
            Self::Review => write!(f, "Review"),
            Self::Skip => write!(f, "Skip"),
        }
    }
}

/// Result of running a test.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TestResult {
    /// Test name.
    pub name: String,
    /// Whether the test passed.
    pub passed: bool,
    /// Test output.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub output: Option<String>,
    /// Test duration in milliseconds.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub duration_ms: Option<u64>,
    /// Timestamp of test execution.
    pub timestamp: DateTime<Utc>,
}

/// Test plan containing a collection of tests to execute.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TestPlan {
    /// Name of the test plan.
    pub name: String,
    /// List of test commands or specifications.
    pub tests: Vec<String>,
    /// Test timeout in seconds.
    #[serde(default)]
    pub timeout_seconds: u64,
}

/// Priority level for tasks/items.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Priority {
    /// Low priority.
    Low,
    /// Medium priority.
    Medium,
    /// High priority.
    High,
    /// Critical priority.
    Critical,
}

impl Default for Priority {
    fn default() -> Self {
        Self::Medium
    }
}

impl std::fmt::Display for Priority {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Low => write!(f, "Low"),
            Self::Medium => write!(f, "Medium"),
            Self::High => write!(f, "High"),
            Self::Critical => write!(f, "Critical"),
        }
    }
}

impl PRD {
    /// Creates a new empty PRD.
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            metadata: PRDMetadata {
                name: name.into(),
                description: None,
                version: default_version(),
                total_tasks: 0,
                total_subtasks: 0,
                completed_count: 0,
                total_tests: 0,
                passed_tests: 0,
                created_at: Some(Utc::now()),
                updated_at: Some(Utc::now()),
            },
            phases: Vec::new(),
        }
    }

    /// Recalculates metadata based on current phases/tasks/subtasks.
    pub fn update_metadata(&mut self) {
        self.metadata.total_tasks = self.phases.iter().map(|p| p.tasks.len() as u32).sum();

        self.metadata.total_subtasks = self
            .phases
            .iter()
            .flat_map(|p| &p.tasks)
            .map(|t| t.subtasks.len() as u32)
            .sum();

        self.metadata.completed_count = self
            .phases
            .iter()
            .flat_map(|p| &p.tasks)
            .flat_map(|t| &t.subtasks)
            .filter(|s| s.status.is_success())
            .count() as u32;

        self.metadata.updated_at = Some(Utc::now());
    }

    /// Finds a phase by ID.
    pub fn find_phase(&self, phase_id: &str) -> Option<&Phase> {
        self.phases.iter().find(|p| p.id == phase_id)
    }

    /// Finds a phase by ID (mutable).
    pub fn find_phase_mut(&mut self, phase_id: &str) -> Option<&mut Phase> {
        self.phases.iter_mut().find(|p| p.id == phase_id)
    }

    /// Finds a task by ID across all phases.
    pub fn find_task(&self, task_id: &str) -> Option<&Task> {
        self.phases
            .iter()
            .flat_map(|p| &p.tasks)
            .find(|t| t.id == task_id)
    }

    /// Finds a subtask by ID across all tasks.
    pub fn find_subtask(&self, subtask_id: &str) -> Option<&Subtask> {
        self.phases
            .iter()
            .flat_map(|p| &p.tasks)
            .flat_map(|t| &t.subtasks)
            .find(|s| s.id == subtask_id)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_item_status_queries() {
        assert!(ItemStatus::Passed.is_complete());
        assert!(ItemStatus::Passed.is_success());
        assert!(ItemStatus::Running.is_active());
        assert!(ItemStatus::Failed.is_failure());
    }

    #[test]
    fn test_prd_creation() {
        let prd = PRD::new("Test Project");
        assert_eq!(prd.metadata.name, "Test Project");
        assert_eq!(prd.phases.len(), 0);
        assert!(prd.metadata.created_at.is_some());
    }

    #[test]
    fn test_prd_metadata_update() {
        let mut prd = PRD::new("Test");

        let phase = Phase {
            id: "phase1".to_string(),
            title: "Phase 1".to_string(),
            goal: None,
            description: None,
            status: ItemStatus::Running,
            tasks: vec![Task {
                id: "task1".to_string(),
                title: "Task 1".to_string(),
                description: None,
                status: ItemStatus::Passed,
                subtasks: vec![],
                evidence: vec![],
                gate_reports: vec![],
                dependencies: vec![],
                complexity: None,
                task_type: None,
            }],
            iterations: 0,
            evidence: vec![],
            gate_report: None,
            orchestrator_state: None,
            orchestrator_context: None,
            dependencies: vec![],
        };

        prd.phases.push(phase);
        prd.update_metadata();

        assert_eq!(prd.metadata.total_tasks, 1);
    }

    #[test]
    fn test_prd_find_operations() {
        let mut prd = PRD::new("Test");

        let phase = Phase {
            id: "phase1".to_string(),
            title: "Phase 1".to_string(),
            goal: None,
            description: None,
            status: ItemStatus::Running,
            tasks: vec![Task {
                id: "task1".to_string(),
                title: "Task 1".to_string(),
                description: None,
                status: ItemStatus::Running,
                subtasks: vec![],
                evidence: vec![],
                gate_reports: vec![],
                dependencies: vec![],
                complexity: None,
                task_type: None,
            }],
            iterations: 0,
            evidence: vec![],
            gate_report: None,
            orchestrator_state: None,
            orchestrator_context: None,
            dependencies: vec![],
        };

        prd.phases.push(phase);

        assert!(prd.find_phase("phase1").is_some());
        assert!(prd.find_task("task1").is_some());
        assert!(prd.find_phase("invalid").is_none());
    }
}
