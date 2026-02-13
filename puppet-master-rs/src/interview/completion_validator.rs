//! Zero-gaps completion validation for interviews.
//!
//! Checks that all domain categories are covered, no critical items are
//! unanswered, and no conflicting decisions exist.

use super::phase_manager::PhaseManager;
use super::state::InterviewState;

/// Severity of a validation issue.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ValidationSeverity {
    /// Must be resolved before completion.
    Error,
    /// Should be addressed but does not block completion.
    Warning,
}

/// A single validation issue found during completion checks.
#[derive(Debug, Clone)]
pub struct ValidationIssue {
    /// Which domain or area the issue relates to.
    pub domain: String,
    /// Human-readable description of the issue.
    pub message: String,
    /// How severe this issue is.
    pub severity: ValidationSeverity,
}

/// Result of running completion validation.
#[derive(Debug, Clone)]
pub struct ValidationResult {
    /// Whether the interview passes validation (no errors).
    pub is_valid: bool,
    /// All issues found.
    pub issues: Vec<ValidationIssue>,
}

impl ValidationResult {
    /// Returns only the error-level issues.
    pub fn errors(&self) -> Vec<&ValidationIssue> {
        self.issues
            .iter()
            .filter(|i| i.severity == ValidationSeverity::Error)
            .collect()
    }

    /// Returns only the warning-level issues.
    pub fn warnings(&self) -> Vec<&ValidationIssue> {
        self.issues
            .iter()
            .filter(|i| i.severity == ValidationSeverity::Warning)
            .collect()
    }

    /// Finds the index of the first phase with issues, if any.
    pub fn first_issue_phase_index(&self, phase_manager: &PhaseManager) -> Option<usize> {
        // Extract phase IDs from error issues
        for issue in self.errors() {
            // Try to match domain name to phase
            for (idx, phase) in phase_manager.phases().iter().enumerate() {
                if issue.domain.contains(&phase.domain) || issue.domain == phase.id {
                    return Some(idx);
                }
            }
        }
        None
    }
}

/// Validates that an interview is complete and has zero gaps.
pub fn validate_completion(
    state: &InterviewState,
    phase_manager: &PhaseManager,
) -> ValidationResult {
    let mut issues = Vec::new();

    // Check 1: All domain categories should have at least some coverage.
    check_domain_coverage(state, phase_manager, &mut issues);

    // Check 2: Minimum questions answered per completed phase.
    check_minimum_questions(state, &mut issues);

    // Check 3: No conflicting decisions.
    check_conflicting_decisions(state, &mut issues);

    // Check 4: No vague or TBD items in decisions.
    check_vague_decisions(state, &mut issues);

    // Check 5: Detect ambiguous language in answers (TBD/later/maybe).
    check_ambiguous_answers(state, &mut issues);

    // Check 6: Version pinning for architecture phase.
    check_version_pinning(state, &mut issues);

    // Check 7: Deployment targets specified.
    check_deployment_targets(state, &mut issues);

    // Check 8: No open items.
    check_open_items(state, &mut issues);

    let is_valid = !issues
        .iter()
        .any(|i| i.severity == ValidationSeverity::Error);

    ValidationResult { is_valid, issues }
}

/// Ensures all 8 standard domain phases have been completed.
fn check_domain_coverage(
    state: &InterviewState,
    phase_manager: &PhaseManager,
    issues: &mut Vec<ValidationIssue>,
) {
    for phase in phase_manager.phases() {
        if !state.completed_phases.contains(&phase.id) {
            issues.push(ValidationIssue {
                domain: phase.domain.clone(),
                message: format!("Phase '{}' has not been completed.", phase.name),
                severity: ValidationSeverity::Error,
            });
        }
    }
}

/// Ensures each completed phase had at least 2 questions answered.
fn check_minimum_questions(state: &InterviewState, issues: &mut Vec<ValidationIssue>) {
    // Simple check: total questions should be at least 2 per completed phase.
    let expected_min = state.completed_phases.len() * 2;
    if state.history.len() < expected_min {
        issues.push(ValidationIssue {
            domain: "Overall".to_string(),
            message: format!(
                "Only {} questions answered across {} phases (expected at least {}).",
                state.history.len(),
                state.completed_phases.len(),
                expected_min,
            ),
            severity: ValidationSeverity::Warning,
        });
    }
}

/// Checks for decisions that may conflict with each other.
fn check_conflicting_decisions(state: &InterviewState, issues: &mut Vec<ValidationIssue>) {
    // Simple heuristic: look for decisions in different phases that contain
    // contradictory keywords.
    let contradiction_pairs = [
        ("monolith", "microservice"),
        ("sql", "nosql"),
        ("server-side", "client-side"),
        ("serverless", "dedicated server"),
    ];

    let summaries: Vec<String> = state
        .decisions
        .iter()
        .map(|d| d.summary.to_lowercase())
        .collect();

    for (a, b) in &contradiction_pairs {
        let has_a = summaries.iter().any(|s| s.contains(a));
        let has_b = summaries.iter().any(|s| s.contains(b));
        if has_a && has_b {
            issues.push(ValidationIssue {
                domain: "Decisions".to_string(),
                message: format!("Potential conflict: decisions reference both '{a}' and '{b}'."),
                severity: ValidationSeverity::Warning,
            });
        }
    }
}

/// Flags decisions that contain vague or TBD language.
fn check_vague_decisions(state: &InterviewState, issues: &mut Vec<ValidationIssue>) {
    let vague_markers = ["tbd", "to be determined", "tba", "not sure", "maybe"];

    for decision in &state.decisions {
        let lower = decision.summary.to_lowercase();
        for marker in &vague_markers {
            if lower.contains(marker) {
                issues.push(ValidationIssue {
                    domain: decision.phase.clone(),
                    message: format!(
                        "Decision contains vague language ('{marker}'): {}",
                        decision.summary
                    ),
                    severity: ValidationSeverity::Error,
                });
                break;
            }
        }
    }
}

/// Checks for ambiguous language in user answers (TBD/later/maybe).
fn check_ambiguous_answers(state: &InterviewState, issues: &mut Vec<ValidationIssue>) {
    let ambiguous_markers = ["tbd", "to be determined", "later", "maybe", "not sure", "unsure"];

    for qa in &state.history {
        let lower = qa.answer.to_lowercase();
        for marker in &ambiguous_markers {
            if lower.contains(marker) {
                issues.push(ValidationIssue {
                    domain: "Answers".to_string(),
                    message: format!(
                        "Answer contains ambiguous language ('{marker}'): {}",
                        qa.answer.chars().take(80).collect::<String>()
                    ),
                    severity: ValidationSeverity::Error,
                });
                break;
            }
        }
    }
}

/// Verifies that technology versions are explicitly pinned in Architecture phase.
fn check_version_pinning(state: &InterviewState, issues: &mut Vec<ValidationIssue>) {
    let unpinned_markers = ["latest", "current", "stable"];
    
    // Check decisions from architecture phase
    let arch_decisions: Vec<_> = state
        .decisions
        .iter()
        .filter(|d| d.phase == "architecture_technology")
        .collect();

    for decision in arch_decisions {
        let lower = decision.summary.to_lowercase();
        for marker in &unpinned_markers {
            if lower.contains(marker) {
                issues.push(ValidationIssue {
                    domain: "Architecture & Technology".to_string(),
                    message: format!(
                        "Decision uses unpinned version tag ('{marker}'): {}",
                        decision.summary
                    ),
                    severity: ValidationSeverity::Error,
                });
                break;
            }
        }
    }

    // Check Q&A from architecture phase - look for version patterns
    let arch_qa: Vec<_> = state
        .history
        .iter()
        .enumerate()
        .filter(|(i, _)| {
            // Heuristic: first ~10 questions likely cover architecture
            *i < 10 || state.history.len() < 10
        })
        .map(|(_, qa)| qa)
        .collect();

    // Look for technology mentions without version patterns (X.Y.Z or vX.Y.Z)
    let version_regex = regex::Regex::new(r"\d+\.\d+(?:\.\d+)?").ok();
    let tech_keywords = [
        "rust", "node", "react", "vue", "python", "typescript", "go",
        "postgres", "mysql", "mongodb", "redis", "docker", "kubernetes",
    ];

    for qa in arch_qa {
        let lower_answer = qa.answer.to_lowercase();
        
        for tech in &tech_keywords {
            if lower_answer.contains(tech) {
                // Check if a version pattern exists nearby
                let has_version = version_regex
                    .as_ref()
                    .map(|re| re.is_match(&qa.answer))
                    .unwrap_or(false);

                if !has_version {
                    issues.push(ValidationIssue {
                        domain: "Architecture & Technology".to_string(),
                        message: format!(
                            "Technology mentioned without specific version: '{tech}' in answer to: {}",
                            qa.question.chars().take(60).collect::<String>()
                        ),
                        severity: ValidationSeverity::Warning,
                    });
                    break;
                }
            }
        }
    }
}

/// Verifies that deployment targets are specified in Deployment phase.
fn check_deployment_targets(state: &InterviewState, issues: &mut Vec<ValidationIssue>) {
    let deploy_keywords = [
        "cloud", "server", "desktop", "mobile", "web", "embedded",
        "aws", "azure", "gcp", "docker", "kubernetes", "vm",
    ];

    // Check decisions from deployment phase
    let deploy_decisions: Vec<_> = state
        .decisions
        .iter()
        .filter(|d| d.phase == "deployment_environments")
        .collect();

    if deploy_decisions.is_empty() {
        // Deployment phase not completed or no decisions recorded
        return;
    }

    // Look for at least one deployment target keyword
    let has_target = deploy_decisions.iter().any(|d| {
        let lower = d.summary.to_lowercase();
        deploy_keywords.iter().any(|kw| lower.contains(kw))
    });

    if !has_target {
        issues.push(ValidationIssue {
            domain: "Deployment & Environments".to_string(),
            message: "No specific deployment target identified (cloud/server/desktop/mobile/etc.)".to_string(),
            severity: ValidationSeverity::Error,
        });
    }
}

/// Checks for explicit "open items" mentions in decisions or answers.
fn check_open_items(state: &InterviewState, issues: &mut Vec<ValidationIssue>) {
    let open_markers = ["open item", "unresolved", "pending", "todo", "to do"];

    // Check decisions
    for decision in &state.decisions {
        let lower = decision.summary.to_lowercase();
        for marker in &open_markers {
            if lower.contains(marker) {
                issues.push(ValidationIssue {
                    domain: decision.phase.clone(),
                    message: format!(
                        "Decision mentions open items ('{marker}'): {}",
                        decision.summary
                    ),
                    severity: ValidationSeverity::Error,
                });
                break;
            }
        }
    }

    // Check Q&A history
    for qa in &state.history {
        let lower = qa.answer.to_lowercase();
        for marker in &open_markers {
            if lower.contains(marker) {
                issues.push(ValidationIssue {
                    domain: "Answers".to_string(),
                    message: format!(
                        "Answer mentions open items ('{marker}'): {}",
                        qa.answer.chars().take(80).collect::<String>()
                    ),
                    severity: ValidationSeverity::Error,
                });
                break;
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::interview::state::{Decision, create_state};

    fn make_complete_state() -> InterviewState {
        let mut state = create_state("test", "claude", false, vec![]);
        state.completed_phases = vec![
            "scope_goals".to_string(),
            "architecture_technology".to_string(),
            "product_ux".to_string(),
            "data_persistence".to_string(),
            "security_secrets".to_string(),
            "deployment_environments".to_string(),
            "performance_reliability".to_string(),
            "testing_verification".to_string(),
        ];
        // Add enough questions (2 per phase = 16).
        for i in 0..16 {
            state.history.push(crate::interview::state::InterviewQA {
                question: format!("Q{i}"),
                answer: format!("A{i}"),
                timestamp: "2026-01-01T00:00:00Z".to_string(),
            });
        }
        state
    }

    #[test]
    fn test_valid_completion() {
        let state = make_complete_state();
        let pm = PhaseManager::new();
        let result = validate_completion(&state, &pm);
        assert!(result.is_valid);
        assert!(result.errors().is_empty());
    }

    #[test]
    fn test_missing_phase() {
        let mut state = make_complete_state();
        state.completed_phases.retain(|p| p != "security_secrets");
        let pm = PhaseManager::new();
        let result = validate_completion(&state, &pm);
        assert!(!result.is_valid);
        assert!(
            result
                .errors()
                .iter()
                .any(|i| i.message.contains("Security"))
        );
    }

    #[test]
    fn test_vague_decision() {
        let mut state = make_complete_state();
        state.decisions.push(Decision {
            phase: "scope_goals".to_string(),
            summary: "Database choice TBD".to_string(),
            reasoning: String::new(),
            timestamp: "2026-01-01T00:00:00Z".to_string(),
        });
        let pm = PhaseManager::new();
        let result = validate_completion(&state, &pm);
        assert!(!result.is_valid);
        assert!(result.errors().iter().any(|i| i.message.contains("vague")));
    }

    #[test]
    fn test_conflicting_decisions_warning() {
        let mut state = make_complete_state();
        state.decisions.push(Decision {
            phase: "architecture_technology".to_string(),
            summary: "Use monolith architecture".to_string(),
            reasoning: String::new(),
            timestamp: "2026-01-01T00:00:00Z".to_string(),
        });
        state.decisions.push(Decision {
            phase: "deployment_environments".to_string(),
            summary: "Deploy to AWS as microservice mesh".to_string(),
            reasoning: String::new(),
            timestamp: "2026-01-01T00:00:00Z".to_string(),
        });
        let pm = PhaseManager::new();
        let result = validate_completion(&state, &pm);
        // Conflict is a warning, not an error.
        assert!(result.is_valid);
        assert!(!result.warnings().is_empty());
    }

    #[test]
    fn test_insufficient_questions_warning() {
        let mut state = make_complete_state();
        state.history.clear();
        state.history.push(crate::interview::state::InterviewQA {
            question: "Q1".to_string(),
            answer: "A1".to_string(),
            timestamp: "2026-01-01T00:00:00Z".to_string(),
        });
        let pm = PhaseManager::new();
        let result = validate_completion(&state, &pm);
        // Insufficient questions is a warning.
        assert!(!result.warnings().is_empty());
    }

    #[test]
    fn test_ambiguous_answer() {
        let mut state = make_complete_state();
        state.history.push(crate::interview::state::InterviewQA {
            question: "What database?".to_string(),
            answer: "Maybe PostgreSQL or TBD".to_string(),
            timestamp: "2026-01-01T00:00:00Z".to_string(),
        });
        let pm = PhaseManager::new();
        let result = validate_completion(&state, &pm);
        assert!(!result.is_valid);
        assert!(result.errors().iter().any(|e| e.message.contains("ambiguous")));
    }

    #[test]
    fn test_unpinned_version() {
        let mut state = make_complete_state();
        state.decisions.push(Decision {
            phase: "architecture_technology".to_string(),
            summary: "Use Rust latest version".to_string(),
            reasoning: String::new(),
            timestamp: "2026-01-01T00:00:00Z".to_string(),
        });
        let pm = PhaseManager::new();
        let result = validate_completion(&state, &pm);
        assert!(!result.is_valid);
        assert!(result.errors().iter().any(|e| e.message.contains("unpinned")));
    }

    #[test]
    fn test_missing_deployment_target() {
        let mut state = make_complete_state();
        state.decisions.push(Decision {
            phase: "deployment_environments".to_string(),
            summary: "We'll figure it out later".to_string(),
            reasoning: String::new(),
            timestamp: "2026-01-01T00:00:00Z".to_string(),
        });
        let pm = PhaseManager::new();
        let result = validate_completion(&state, &pm);
        assert!(!result.is_valid);
        // Should catch both "no deployment target" and "later" ambiguity
        assert!(result.errors().len() >= 1);
    }

    #[test]
    fn test_open_items_detected() {
        let mut state = make_complete_state();
        state.decisions.push(Decision {
            phase: "scope_goals".to_string(),
            summary: "Feature X is an open item pending review".to_string(),
            reasoning: String::new(),
            timestamp: "2026-01-01T00:00:00Z".to_string(),
        });
        let pm = PhaseManager::new();
        let result = validate_completion(&state, &pm);
        assert!(!result.is_valid);
        assert!(result.errors().iter().any(|e| e.message.contains("open items")));
    }

    #[test]
    fn test_first_issue_phase_index() {
        let mut state = make_complete_state();
        state.decisions.retain(|d| d.phase != "architecture_technology");
        state.decisions.push(Decision {
            phase: "architecture_technology".to_string(),
            summary: "Use latest Rust".to_string(),
            reasoning: String::new(),
            timestamp: "2026-01-01T00:00:00Z".to_string(),
        });
        let pm = PhaseManager::new();
        let result = validate_completion(&state, &pm);
        assert!(!result.is_valid);
        
        // Should identify architecture phase (index 1) as having issues
        let issue_idx = result.first_issue_phase_index(&pm);
        assert_eq!(issue_idx, Some(1));
    }
}
