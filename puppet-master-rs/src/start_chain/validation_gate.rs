//! Validation gate - validates PRD quality before execution begins.
//!
//! Checks for completeness, consistency, and feasibility
//! of the PRD to ensure it's ready for execution.

use crate::types::PRD;
use anyhow::Result;
use log::{debug, info, warn};
use serde::{Deserialize, Serialize};

/// Validates PRD quality.
pub struct ValidationGate;

/// Result of PRD validation.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ValidationResult {
    /// Whether validation passed.
    pub passed: bool,
    /// Validation errors (blocking issues).
    pub errors: Vec<ValidationError>,
    /// Validation warnings (non-blocking).
    pub warnings: Vec<ValidationWarning>,
    /// Overall quality score (0.0 to 100.0).
    pub score: f64,
    /// Individual check results.
    pub checks: Vec<CheckResult>,
}

/// A validation error (blocking).
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ValidationError {
    /// Error code.
    pub code: String,
    /// Error message.
    pub message: String,
    /// Location in PRD (e.g., "Phase PH-001", "Task TK-002").
    pub location: String,
    /// Severity level.
    pub severity: Severity,
}

/// A validation warning (non-blocking).
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ValidationWarning {
    /// Warning code.
    pub code: String,
    /// Warning message.
    pub message: String,
    /// Location in PRD.
    pub location: String,
    /// Suggested fix.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub suggestion: Option<String>,
}

/// Severity level.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Severity {
    /// Informational only.
    Info,
    /// Low severity.
    Low,
    /// Medium severity.
    Medium,
    /// High severity (should fix).
    High,
    /// Critical severity (must fix).
    Critical,
}

impl std::fmt::Display for Severity {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Info => write!(f, "Info"),
            Self::Low => write!(f, "Low"),
            Self::Medium => write!(f, "Medium"),
            Self::High => write!(f, "High"),
            Self::Critical => write!(f, "Critical"),
        }
    }
}

/// Result of an individual validation check.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckResult {
    /// Check name.
    pub name: String,
    /// Whether this check passed.
    pub passed: bool,
    /// Check score (0.0 to 100.0).
    pub score: f64,
    /// Details about the check.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<String>,
}

impl ValidationGate {
    /// Validate a PRD.
    pub fn validate(prd: &PRD) -> Result<ValidationResult> {
        info!("Validating PRD: {}", prd.metadata.name);

        let mut errors = Vec::new();
        let mut warnings = Vec::new();
        let mut checks = Vec::new();

        // Run validation checks
        Self::check_metadata(prd, &mut errors, &mut warnings, &mut checks);
        Self::check_phases(prd, &mut errors, &mut warnings, &mut checks);
        Self::check_tasks(prd, &mut errors, &mut warnings, &mut checks);
        Self::check_subtasks(prd, &mut errors, &mut warnings, &mut checks);
        Self::check_dependencies(prd, &mut errors, &mut warnings, &mut checks);
        Self::check_completeness(prd, &mut errors, &mut warnings, &mut checks);

        // Calculate overall score
        let score = Self::calculate_score(&checks, &errors, &warnings);
        let passed = errors.is_empty() || errors.iter().all(|e| e.severity < Severity::High);

        if !passed {
            warn!("PRD validation failed with {} errors", errors.len());
        } else {
            info!("PRD validation passed with score: {:.1}", score);
        }

        Ok(ValidationResult {
            passed,
            errors,
            warnings,
            score,
            checks,
        })
    }

    /// Check PRD metadata.
    fn check_metadata(
        prd: &PRD,
        errors: &mut Vec<ValidationError>,
        warnings: &mut Vec<ValidationWarning>,
        checks: &mut Vec<CheckResult>,
    ) {
        debug!("Checking PRD metadata");

        let mut score: f64 = 100.0;
        let mut issues = Vec::new();

        if prd.metadata.name.is_empty() {
            errors.push(ValidationError {
                code: "META-001".to_string(),
                message: "PRD must have a name".to_string(),
                location: "metadata".to_string(),
                severity: Severity::Critical,
            });
            score -= 30.0;
            issues.push("Missing name");
        }

        if prd.metadata.description.is_none() || prd.metadata.description.as_ref().map(|d| d.is_empty()).unwrap_or(true) {
            warnings.push(ValidationWarning {
                code: "META-002".to_string(),
                message: "PRD should have a description".to_string(),
                location: "metadata".to_string(),
                suggestion: Some("Add a project description to help understand the goals".to_string()),
            });
            score -= 10.0;
            issues.push("Missing description");
        }

        if prd.metadata.created_at.is_none() {
            score -= 5.0;
        }

        checks.push(CheckResult {
            name: "Metadata Check".to_string(),
            passed: score >= 70.0,
            score,
            details: if issues.is_empty() {
                Some("All metadata present".to_string())
            } else {
                Some(format!("Issues: {}", issues.join(", ")))
            },
        });
    }

    /// Check phases.
    fn check_phases(
        prd: &PRD,
        errors: &mut Vec<ValidationError>,
        warnings: &mut Vec<ValidationWarning>,
        checks: &mut Vec<CheckResult>,
    ) {
        debug!("Checking phases");

        let mut score: f64 = 100.0;

        if prd.phases.is_empty() {
            errors.push(ValidationError {
                code: "PHASE-001".to_string(),
                message: "PRD must have at least one phase".to_string(),
                location: "phases".to_string(),
                severity: Severity::Critical,
            });
            score = 0.0;
        } else {
            // Check each phase
            for phase in &prd.phases {
                if phase.id.is_empty() {
                    errors.push(ValidationError {
                        code: "PHASE-002".to_string(),
                        message: "Phase must have an ID".to_string(),
                        location: format!("phase: {}", phase.title),
                        severity: Severity::Critical,
                    });
                    score -= 20.0;
                }

                if phase.title.is_empty() {
                    errors.push(ValidationError {
                        code: "PHASE-003".to_string(),
                        message: "Phase must have a title".to_string(),
                        location: format!("phase: {}", phase.id),
                        severity: Severity::High,
                    });
                    score -= 15.0;
                }

                if phase.tasks.is_empty() {
                    warnings.push(ValidationWarning {
                        code: "PHASE-004".to_string(),
                        message: "Phase has no tasks".to_string(),
                        location: format!("phase: {}", phase.id),
                        suggestion: Some("Add at least one task to the phase".to_string()),
                    });
                    score -= 10.0;
                }
            }

            // Check for duplicate phase IDs
            let mut phase_ids = std::collections::HashSet::new();
            for phase in &prd.phases {
                if !phase_ids.insert(&phase.id) {
                    errors.push(ValidationError {
                        code: "PHASE-005".to_string(),
                        message: format!("Duplicate phase ID: {}", phase.id),
                        location: "phases".to_string(),
                        severity: Severity::Critical,
                    });
                    score -= 20.0;
                }
            }
        }

        checks.push(CheckResult {
            name: "Phase Check".to_string(),
            passed: score >= 70.0,
            score: score.max(0.0_f64),
            details: Some(format!("{} phases validated", prd.phases.len())),
        });
    }

    /// Check tasks.
    fn check_tasks(
        prd: &PRD,
        errors: &mut Vec<ValidationError>,
        warnings: &mut Vec<ValidationWarning>,
        checks: &mut Vec<CheckResult>,
    ) {
        debug!("Checking tasks");

        let mut score: f64 = 100.0;
        let mut task_count = 0;
        let mut task_ids = std::collections::HashSet::new();

        for phase in &prd.phases {
            for task in &phase.tasks {
                task_count += 1;

                if task.id.is_empty() {
                    errors.push(ValidationError {
                        code: "TASK-001".to_string(),
                        message: "Task must have an ID".to_string(),
                        location: format!("phase: {}, task: {}", phase.id, task.title),
                        severity: Severity::Critical,
                    });
                    score -= 15.0;
                }

                if !task_ids.insert(&task.id) {
                    errors.push(ValidationError {
                        code: "TASK-002".to_string(),
                        message: format!("Duplicate task ID: {}", task.id),
                        location: format!("phase: {}", phase.id),
                        severity: Severity::Critical,
                    });
                    score -= 15.0;
                }

                if task.title.is_empty() {
                    errors.push(ValidationError {
                        code: "TASK-003".to_string(),
                        message: "Task must have a title".to_string(),
                        location: format!("task: {}", task.id),
                        severity: Severity::High,
                    });
                    score -= 10.0;
                }

                if task.subtasks.is_empty() {
                    warnings.push(ValidationWarning {
                        code: "TASK-004".to_string(),
                        message: "Task has no subtasks".to_string(),
                        location: format!("task: {}", task.id),
                        suggestion: Some("Add at least one subtask to define the work".to_string()),
                    });
                    score -= 5.0;
                }
            }
        }

        checks.push(CheckResult {
            name: "Task Check".to_string(),
            passed: score >= 70.0,
            score: f64::max(score, 0.0),
            details: Some(format!("{} tasks validated", task_count)),
        });
    }

    /// Check subtasks.
    fn check_subtasks(
        prd: &PRD,
        errors: &mut Vec<ValidationError>,
        warnings: &mut Vec<ValidationWarning>,
        checks: &mut Vec<CheckResult>,
    ) {
        debug!("Checking subtasks");

        let mut score: f64 = 100.0;
        let mut subtask_count = 0;
        let mut subtask_ids = std::collections::HashSet::new();

        for phase in &prd.phases {
            for task in &phase.tasks {
                for subtask in &task.subtasks {
                    subtask_count += 1;

                    if subtask.id.is_empty() {
                        errors.push(ValidationError {
                            code: "SUBTASK-001".to_string(),
                            message: "Subtask must have an ID".to_string(),
                            location: format!("task: {}", task.id),
                            severity: Severity::Critical,
                        });
                        score -= 10.0;
                    }

                    if !subtask_ids.insert(&subtask.id) {
                        errors.push(ValidationError {
                            code: "SUBTASK-002".to_string(),
                            message: format!("Duplicate subtask ID: {}", subtask.id),
                            location: format!("task: {}", task.id),
                            severity: Severity::Critical,
                        });
                        score -= 10.0;
                    }

                    if subtask.title.is_empty() {
                        errors.push(ValidationError {
                            code: "SUBTASK-003".to_string(),
                            message: "Subtask must have a title".to_string(),
                            location: format!("subtask: {}", subtask.id),
                            severity: Severity::High,
                        });
                        score -= 8.0;
                    }

                    if subtask.acceptance_criteria.is_empty() && subtask.criterion.is_none() {
                        warnings.push(ValidationWarning {
                            code: "SUBTASK-004".to_string(),
                            message: "Subtask has no acceptance criteria".to_string(),
                            location: format!("subtask: {}", subtask.id),
                            suggestion: Some("Add acceptance criteria to define success".to_string()),
                        });
                        score -= 5.0;
                    }
                }
            }
        }

        checks.push(CheckResult {
            name: "Subtask Check".to_string(),
            passed: score >= 70.0,
            score: f64::max(score, 0.0),
            details: Some(format!("{} subtasks validated", subtask_count)),
        });
    }

    /// Check dependencies.
    fn check_dependencies(
        prd: &PRD,
        errors: &mut Vec<ValidationError>,
        _warnings: &mut Vec<ValidationWarning>,
        checks: &mut Vec<CheckResult>,
    ) {
        debug!("Checking dependencies");

        let mut score: f64 = 100.0;

        // Collect all valid IDs
        let phase_ids: std::collections::HashSet<_> = prd.phases.iter().map(|p| &p.id).collect();
        let task_ids: std::collections::HashSet<_> = prd.phases.iter()
            .flat_map(|p| &p.tasks)
            .map(|t| &t.id)
            .collect();

        // Check phase dependencies
        for phase in &prd.phases {
            for dep_id in &phase.dependencies {
                if !phase_ids.contains(dep_id) {
                    errors.push(ValidationError {
                        code: "DEP-001".to_string(),
                        message: format!("Phase dependency not found: {}", dep_id),
                        location: format!("phase: {}", phase.id),
                        severity: Severity::High,
                    });
                    score -= 15.0;
                }

                // Check for circular dependencies
                if dep_id == &phase.id {
                    errors.push(ValidationError {
                        code: "DEP-002".to_string(),
                        message: "Phase cannot depend on itself".to_string(),
                        location: format!("phase: {}", phase.id),
                        severity: Severity::Critical,
                    });
                    score -= 20.0;
                }
            }

            // Check task dependencies
            for task in &phase.tasks {
                for dep_id in &task.dependencies {
                    if !task_ids.contains(dep_id) {
                        errors.push(ValidationError {
                            code: "DEP-003".to_string(),
                            message: format!("Task dependency not found: {}", dep_id),
                            location: format!("task: {}", task.id),
                            severity: Severity::High,
                        });
                        score -= 10.0;
                    }

                    if dep_id == &task.id {
                        errors.push(ValidationError {
                            code: "DEP-004".to_string(),
                            message: "Task cannot depend on itself".to_string(),
                            location: format!("task: {}", task.id),
                            severity: Severity::Critical,
                        });
                        score -= 15.0;
                    }
                }
            }
        }

        checks.push(CheckResult {
            name: "Dependency Check".to_string(),
            passed: score >= 70.0,
            score: f64::max(score, 0.0),
            details: Some("Dependencies validated".to_string()),
        });
    }

    /// Check completeness.
    fn check_completeness(
        prd: &PRD,
        _errors: &mut Vec<ValidationError>,
        warnings: &mut Vec<ValidationWarning>,
        checks: &mut Vec<CheckResult>,
    ) {
        debug!("Checking completeness");

        let mut score: f64 = 100.0;

        let total_phases = prd.phases.len();
        let total_tasks: usize = prd.phases.iter().map(|p| p.tasks.len()).sum();
        let total_subtasks: usize = prd.phases.iter()
            .flat_map(|p| &p.tasks)
            .map(|t| t.subtasks.len())
            .sum();

        if total_phases == 0 {
            score -= 40.0;
        } else if total_phases < 2 {
            warnings.push(ValidationWarning {
                code: "COMP-001".to_string(),
                message: "PRD has only one phase".to_string(),
                location: "prd".to_string(),
                suggestion: Some("Consider breaking work into multiple phases".to_string()),
            });
            score -= 10.0;
        }

        if total_tasks == 0 {
            score -= 40.0;
        } else if total_tasks < total_phases {
            warnings.push(ValidationWarning {
                code: "COMP-002".to_string(),
                message: "Some phases have no tasks".to_string(),
                location: "prd".to_string(),
                suggestion: Some("Ensure each phase has at least one task".to_string()),
            });
            score -= 10.0;
        }

        if total_subtasks == 0 {
            score -= 30.0;
        } else if total_subtasks < total_tasks {
            warnings.push(ValidationWarning {
                code: "COMP-003".to_string(),
                message: "Some tasks have no subtasks".to_string(),
                location: "prd".to_string(),
                suggestion: Some("Ensure each task has at least one subtask".to_string()),
            });
            score -= 10.0;
        }

        checks.push(CheckResult {
            name: "Completeness Check".to_string(),
            passed: score >= 70.0,
            score: f64::max(score, 0.0),
            details: Some(format!(
                "{} phases, {} tasks, {} subtasks",
                total_phases, total_tasks, total_subtasks
            )),
        });
    }

    /// Calculate overall score.
    fn calculate_score(
        checks: &[CheckResult],
        errors: &[ValidationError],
        warnings: &[ValidationWarning],
    ) -> f64 {
        if checks.is_empty() {
            return 0.0;
        }

        // Average of check scores
        let check_score: f64 = checks.iter().map(|c| c.score).sum::<f64>() / checks.len() as f64;

        // Penalty for errors and warnings
        let error_penalty = errors.len() as f64 * 5.0;
        let warning_penalty = warnings.len() as f64 * 2.0;

        (check_score - error_penalty - warning_penalty).max(0.0).min(100.0)
    }

    /// Generate a validation report.
    pub fn format_report(result: &ValidationResult) -> String {
        let mut report = String::from("# PRD Validation Report\n\n");

        report.push_str(&format!("**Status:** {}\n", if result.passed { "[OK] PASSED" } else { "[FAIL] FAILED" }));
        report.push_str(&format!("**Score:** {:.1}/100.0\n\n", result.score));

        if !result.errors.is_empty() {
            report.push_str("## Errors\n\n");
            for error in &result.errors {
                report.push_str(&format!(
                    "- **[{}]** {} - {} ({})\n  Location: {}\n",
                    error.severity, error.code, error.message, error.severity, error.location
                ));
            }
            report.push('\n');
        }

        if !result.warnings.is_empty() {
            report.push_str("## Warnings\n\n");
            for warning in &result.warnings {
                report.push_str(&format!(
                    "- **[{}]** {}\n  Location: {}\n",
                    warning.code, warning.message, warning.location
                ));
                if let Some(ref suggestion) = warning.suggestion {
                    report.push_str(&format!("  Suggestion: {}\n", suggestion));
                }
            }
            report.push('\n');
        }

        report.push_str("## Validation Checks\n\n");
        for check in &result.checks {
            let status = if check.passed { "[OK]" } else { "[WARN]" };
            report.push_str(&format!(
                "- {} **{}**: {:.1}/100.0\n",
                status, check.name, check.score
            ));
            if let Some(ref details) = check.details {
                report.push_str(&format!("  {}\n", details));
            }
        }

        report
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{PRDMetadata, ItemStatus, Phase, Task, Subtask};

    #[test]
    fn test_validate_empty_prd() {
        let prd = PRD::new("Test");
        let result = ValidationGate::validate(&prd).unwrap();
        
        assert!(!result.passed);
        assert!(!result.errors.is_empty());
    }

    #[test]
    fn test_validate_valid_prd() {
        let mut prd = PRD::new("Test Project");
        
        let phase = Phase {
            id: "PH-001".to_string(),
            title: "Phase 1".to_string(),
            goal: None,
            description: Some("Test phase".to_string()),
            status: ItemStatus::Pending,
            tasks: vec![Task {
                id: "TK-001".to_string(),
                title: "Task 1".to_string(),
                description: Some("Test task".to_string()),
                status: ItemStatus::Pending,
                subtasks: vec![Subtask {
                    id: "ST-001".to_string(),
                    task_id: "TK-001".to_string(),
                    title: "Subtask 1".to_string(),
                    description: Some("Test".to_string()),
                    criterion: None,
                    status: ItemStatus::Pending,
                    iterations: 0,
                    evidence: vec![],
                    plan: None,
                    acceptance_criteria: vec!["Test criterion".to_string()],
                    iteration_records: vec![],
                }],
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
        prd.metadata.description = Some("Test description".to_string());

        let result = ValidationGate::validate(&prd).unwrap();
        assert!(result.score > 80.0);
    }

    #[test]
    fn test_duplicate_phase_ids() {
        let mut prd = PRD::new("Test");
        
        prd.phases.push(Phase {
            id: "PH-001".to_string(),
            title: "Phase 1".to_string(),
            goal: None,
            description: None,
            status: ItemStatus::Pending,
            tasks: vec![],
            iterations: 0,
            evidence: vec![],
            gate_report: None,
            orchestrator_state: None,
            orchestrator_context: None,
            dependencies: vec![],
        });

        prd.phases.push(Phase {
            id: "PH-001".to_string(),
            title: "Phase 2".to_string(),
            goal: None,
            description: None,
            status: ItemStatus::Pending,
            tasks: vec![],
            iterations: 0,
            evidence: vec![],
            gate_report: None,
            orchestrator_state: None,
            orchestrator_context: None,
            dependencies: vec![],
        });

        let result = ValidationGate::validate(&prd).unwrap();
        assert!(result.errors.iter().any(|e| e.code == "PHASE-005"));
    }

    #[test]
    fn test_format_report() {
        let result = ValidationResult {
            passed: true,
            errors: vec![],
            warnings: vec![],
            score: 95.0,
            checks: vec![
                CheckResult {
                    name: "Test Check".to_string(),
                    passed: true,
                    score: 95.0,
                    details: Some("All good".to_string()),
                }
            ],
        };

        let report = ValidationGate::format_report(&result);
        assert!(report.contains("PASSED"));
        assert!(report.contains("95.0"));
    }
}
