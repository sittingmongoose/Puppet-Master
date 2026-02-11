//! Worker/Reviewer separation for quality assurance
//!
//! Implements separation of concerns:
//! - Worker: Executes the work
//! - Reviewer: Validates and provides feedback
//! - Handles ping-pong (COMPLETE vs REVISE)

use crate::types::*;
use serde::{Deserialize, Serialize};

/// Worker/Reviewer coordinator
#[derive(Debug)]
pub struct WorkerReviewer {
    /// Enable review mode
    enabled: bool,
    /// Maximum review cycles before escalation
    max_review_cycles: u32,
    /// Review criteria configuration
    criteria: ReviewCriteria,
}

impl WorkerReviewer {
    /// Create new worker/reviewer coordinator
    pub fn new(enabled: bool, max_review_cycles: u32, criteria: ReviewCriteria) -> Self {
        Self {
            enabled,
            max_review_cycles,
            criteria,
        }
    }

    /// Create with defaults
    pub fn with_defaults() -> Self {
        Self::new(
            true,
            3,
            ReviewCriteria {
                require_tests: true,
                require_documentation: true,
                require_style_compliance: true,
                require_security_check: false,
                custom_checks: Vec::new(),
            },
        )
    }

    /// Check if review is enabled
    pub fn is_enabled(&self) -> bool {
        self.enabled
    }

    /// Determine if work should go to reviewer
    pub fn should_review(&self, signal: &CompletionSignal, cycle: u32) -> bool {
        if !self.enabled {
            return false;
        }

        if cycle >= self.max_review_cycles {
            return false;
        }

        matches!(signal, CompletionSignal::Complete)
    }

    /// Build reviewer prompt
    pub fn build_review_prompt(
        &self,
        tier_title: &str,
        tier_description: &str,
        acceptance_criteria: &[String],
        work_summary: &str,
    ) -> String {
        let mut prompt = String::new();

        prompt.push_str("# Code Review Required\n\n");
        prompt.push_str("## Task\n\n");
        prompt.push_str(&format!("**{}**\n\n", tier_title));
        prompt.push_str(&format!("{}\n\n", tier_description));

        if !acceptance_criteria.is_empty() {
            prompt.push_str("## Acceptance Criteria\n\n");
            for criterion in acceptance_criteria {
                prompt.push_str(&format!("- {}\n", criterion));
            }
            prompt.push_str("\n");
        }

        prompt.push_str("## Work Summary\n\n");
        prompt.push_str(work_summary);
        prompt.push_str("\n\n");

        prompt.push_str("## Review Criteria\n\n");

        if self.criteria.require_tests {
            prompt.push_str("- [ ] Tests are present and comprehensive\n");
            prompt.push_str("- [ ] Tests cover edge cases and error scenarios\n");
            prompt.push_str("- [ ] All tests pass\n");
        }

        if self.criteria.require_documentation {
            prompt.push_str("- [ ] Code is well-documented\n");
            prompt.push_str("- [ ] Public APIs have documentation comments\n");
            prompt.push_str("- [ ] Complex logic is explained\n");
        }

        if self.criteria.require_style_compliance {
            prompt.push_str("- [ ] Code follows project style guidelines\n");
            prompt.push_str("- [ ] No linting errors\n");
            prompt.push_str("- [ ] Formatting is consistent\n");
        }

        if self.criteria.require_security_check {
            prompt.push_str("- [ ] No security vulnerabilities\n");
            prompt.push_str("- [ ] Input validation is present\n");
            prompt.push_str("- [ ] Secrets are not committed\n");
        }

        for check in &self.criteria.custom_checks {
            prompt.push_str(&format!("- [ ] {}\n", check));
        }

        prompt.push_str("\n");
        prompt.push_str("## Instructions\n\n");
        prompt.push_str("Review the work thoroughly:\n");
        prompt.push_str("1. Verify all acceptance criteria are met\n");
        prompt.push_str("2. Check each review criterion above\n");
        prompt.push_str("3. Test the functionality\n");
        prompt.push_str("4. If approved, signal: `PUPPET_MASTER: COMPLETE`\n");
        prompt
            .push_str("5. If revisions needed, signal: `PUPPET_MASTER: REVISE - [specific feedback]`\n");

        prompt
    }

    /// Parse review result from completion signal
    pub fn parse_review_result(&self, signal: &CompletionSignal) -> ReviewResult {
        match signal {
            CompletionSignal::Complete => ReviewResult::new(
                true,
                "Approved".to_string(),
                "Work approved by reviewer".to_string(),
            ),
            CompletionSignal::Gutter => ReviewResult::new(
                false,
                "Needs revision".to_string(),
                "Agent reached gutter state".to_string(),
            ),
            _ => ReviewResult::new(
                false,
                "Unexpected".to_string(),
                "Unexpected signal received".to_string(),
            ),
        }
    }

    /// Build worker revision prompt
    pub fn build_revision_prompt(
        &self,
        original_prompt: &str,
        review_result: &ReviewResult,
    ) -> String {
        let mut prompt = String::new();

        prompt.push_str("# Revision Required\n\n");
        prompt.push_str("## Original Task\n\n");
        prompt.push_str(original_prompt);
        prompt.push_str("\n\n");

        prompt.push_str("## Review Feedback\n\n");
        prompt.push_str(&review_result.reasoning);
        prompt.push_str("\n\n");

        if !review_result.improvements.is_empty() {
            prompt.push_str("## Requested Revisions\n\n");
            for revision in &review_result.improvements {
                prompt.push_str(&format!("- {}\n", revision));
            }
            prompt.push_str("\n");
        }

        prompt.push_str("## Instructions\n\n");
        prompt.push_str("Address the review feedback:\n");
        prompt.push_str("1. Review the feedback and requested revisions\n");
        prompt.push_str("2. Make the necessary changes\n");
        prompt.push_str("3. Verify all issues are resolved\n");
        prompt.push_str("4. Signal completion: `PUPPET_MASTER: COMPLETE`\n");

        prompt
    }

    /// Check if max review cycles reached
    pub fn is_max_cycles_reached(&self, cycle: u32) -> bool {
        cycle >= self.max_review_cycles
    }

    /// Get review criteria
    pub fn criteria(&self) -> &ReviewCriteria {
        &self.criteria
    }
}

impl Default for WorkerReviewer {
    fn default() -> Self {
        Self::with_defaults()
    }
}

/// Review criteria configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewCriteria {
    pub require_tests: bool,
    pub require_documentation: bool,
    pub require_style_compliance: bool,
    pub require_security_check: bool,
    pub custom_checks: Vec<String>,
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_wr() -> WorkerReviewer {
        WorkerReviewer::with_defaults()
    }

    #[test]
    fn test_should_review() {
        let wr = create_test_wr();

        assert!(wr.should_review(&CompletionSignal::Complete, 0));
        assert!(wr.should_review(&CompletionSignal::Complete, 1));
        assert!(wr.should_review(&CompletionSignal::Complete, 2));

        assert!(!wr.should_review(&CompletionSignal::Complete, 3));

        assert!(!wr.should_review(&CompletionSignal::Timeout, 0));
        assert!(!wr.should_review(&CompletionSignal::Stalled, 0));
    }

    #[test]
    fn test_build_review_prompt() {
        let wr = create_test_wr();

        let prompt = wr.build_review_prompt(
            "Test Task",
            "This is a test",
            &vec!["Must work".to_string()],
            "Implemented feature X",
        );

        assert!(prompt.contains("Code Review Required"));
        assert!(prompt.contains("Test Task"));
        assert!(prompt.contains("This is a test"));
        assert!(prompt.contains("Must work"));
        assert!(prompt.contains("Implemented feature X"));
        assert!(prompt.contains("Tests are present"));
        assert!(prompt.contains("Code is well-documented"));
    }

    #[test]
    fn test_parse_review_result_approved() {
        let wr = create_test_wr();

        let result = wr.parse_review_result(&CompletionSignal::Complete);
        assert!(result.passed);
    }

    #[test]
    fn test_parse_review_result_revise() {
        let wr = create_test_wr();

        let result = wr.parse_review_result(&CompletionSignal::Gutter);
        assert!(!result.passed);
    }

    #[test]
    fn test_build_revision_prompt() {
        let wr = create_test_wr();

        let review_result = ReviewResult::new(
            false,
            "Needs work".to_string(),
            "Please add more tests".to_string(),
        );

        let prompt = wr.build_revision_prompt("Original task description", &review_result);

        assert!(prompt.contains("Revision Required"));
        assert!(prompt.contains("Original task description"));
        assert!(prompt.contains("Please add more tests"));
    }

    #[test]
    fn test_is_max_cycles_reached() {
        let wr = create_test_wr();

        assert!(!wr.is_max_cycles_reached(0));
        assert!(!wr.is_max_cycles_reached(1));
        assert!(!wr.is_max_cycles_reached(2));
        assert!(wr.is_max_cycles_reached(3));
        assert!(wr.is_max_cycles_reached(4));
    }

    #[test]
    fn test_disabled_review() {
        let wr = WorkerReviewer::new(
            false,
            3,
            ReviewCriteria {
                require_tests: true,
                require_documentation: true,
                require_style_compliance: true,
                require_security_check: false,
                custom_checks: Vec::new(),
            },
        );

        assert!(!wr.is_enabled());
        assert!(!wr.should_review(&CompletionSignal::Complete, 0));
    }
}
