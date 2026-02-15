//! Failure escalation handling
//!
//! Implements escalation chain:
//! 1. Self-fix: Try to resolve the issue autonomously
//! 2. Kick-down: Delegate to subordinate agent
//! 3. Escalate: Elevate to senior agent
//! 4. Pause: Stop and notify user for manual intervention

use crate::types::*;
use serde::{Deserialize, Serialize};

// DRY:DATA:EscalationEngine
/// Escalation engine for handling failures
#[derive(Debug)]
pub struct EscalationEngine {
    /// Max self-fix attempts before escalating
    max_self_fix_attempts: u32,
    /// Max kick-down attempts before escalating further
    max_kick_down_attempts: u32,
}

impl EscalationEngine {
    /// Create new escalation engine
    pub fn new(max_self_fix_attempts: u32, max_kick_down_attempts: u32) -> Self {
        Self {
            max_self_fix_attempts,
            max_kick_down_attempts,
        }
    }

    /// Create with default settings
    pub fn with_defaults() -> Self {
        Self::new(2, 1)
    }

    /// Determine escalation action based on failure context
    pub fn determine_action(
        &self,
        failure_type: &FailureType,
        attempt_count: u32,
        _tier_state: TierState,
    ) -> EscalationAction {
        match failure_type {
            // Transient failures: try retry first
            FailureType::Timeout | FailureType::Stalled | FailureType::TemporaryError => {
                if attempt_count <= self.max_self_fix_attempts {
                    EscalationAction::Retry
                } else if attempt_count <= self.max_self_fix_attempts + self.max_kick_down_attempts
                {
                    EscalationAction::Skip
                } else {
                    EscalationAction::EscalateToParent
                }
            }

            // Technical failures: skip to troubleshooter
            FailureType::BuildError
            | FailureType::TestFailure
            | FailureType::LintError
            | FailureType::CompilationError => {
                if attempt_count <= self.max_kick_down_attempts {
                    EscalationAction::Retry
                } else {
                    EscalationAction::EscalateToParent
                }
            }

            // Conceptual failures: escalate immediately
            FailureType::RequirementsUnclear
            | FailureType::Blocked
            | FailureType::MissingDependency => EscalationAction::EscalateToParent,

            // Critical failures: pause for user intervention
            FailureType::PermissionDenied
            | FailureType::ResourceExhausted
            | FailureType::QuotaExceeded
            | FailureType::CriticalError => EscalationAction::PauseForUser,

            // Gate failures: analyze and decide
            FailureType::GateFailed => {
                if attempt_count <= self.max_self_fix_attempts {
                    EscalationAction::Retry
                } else {
                    EscalationAction::PauseForUser
                }
            }

            // User-requested help: pause immediately
            FailureType::HelpRequested => EscalationAction::PauseForUser,

            // Unknown: retry after a retry attempt
            FailureType::Unknown => {
                if attempt_count <= 1 {
                    EscalationAction::Retry
                } else {
                    EscalationAction::EscalateToParent
                }
            }
        }
    }

    /// Classify failure from completion signal
    pub fn classify_failure(&self, signal: &CompletionSignal) -> FailureType {
        match signal {
            CompletionSignal::Complete => FailureType::Unknown,
            CompletionSignal::Timeout => FailureType::Timeout,
            CompletionSignal::Stalled => FailureType::Stalled,
            CompletionSignal::Error(message) => self.classify_from_message(message),
            CompletionSignal::Gutter => FailureType::GateFailed,
            CompletionSignal::None => FailureType::Unknown,
        }
    }

    /// Classify failure from error message
    fn classify_from_message(&self, message: &str) -> FailureType {
        let lower = message.to_lowercase();

        if lower.contains("permission denied") || lower.contains("access denied") {
            FailureType::PermissionDenied
        } else if lower.contains("out of memory")
            || lower.contains("disk full")
            || lower.contains("resource exhausted")
        {
            FailureType::ResourceExhausted
        } else if lower.contains("quota") || lower.contains("rate limit") {
            FailureType::QuotaExceeded
        } else if lower.contains("build failed") || lower.contains("compilation failed") {
            FailureType::CompilationError
        } else if lower.contains("test failed") || lower.contains("assertion failed") {
            FailureType::TestFailure
        } else if lower.contains("lint") || lower.contains("style") {
            FailureType::LintError
        } else if lower.contains("unclear")
            || lower.contains("ambiguous")
            || lower.contains("requirements")
        {
            FailureType::RequirementsUnclear
        } else if lower.contains("dependency") || lower.contains("missing") {
            FailureType::MissingDependency
        } else {
            FailureType::Unknown
        }
    }

    /// Build escalation prompt
    pub fn build_escalation_prompt(
        &self,
        action: &EscalationAction,
        failure_type: &FailureType,
        error_context: &str,
    ) -> String {
        let mut prompt = String::new();

        prompt.push_str("# Escalation Required\n\n");
        prompt.push_str(&format!("**Action**: {}\n", action));
        prompt.push_str(&format!("**Failure Type**: {:?}\n\n", failure_type));

        prompt.push_str("## Context\n\n");
        prompt.push_str(error_context);
        prompt.push_str("\n\n");

        match action {
            EscalationAction::Retry => {
                prompt.push_str("## Retry Instructions\n\n");
                prompt.push_str("Analyze the failure and attempt to resolve it autonomously:\n");
                prompt.push_str("1. Review the error message and context\n");
                prompt.push_str("2. Identify the root cause\n");
                prompt.push_str("3. Apply a fix\n");
                prompt.push_str("4. Verify the fix works\n");
                prompt.push_str("5. Signal completion or request further help if needed\n");
            }
            EscalationAction::Skip => {
                prompt.push_str("## Skip Instructions\n\n");
                prompt.push_str(
                    "This issue has been delegated to a specialized troubleshooting agent:\n",
                );
                prompt.push_str("1. Focus on technical debugging\n");
                prompt.push_str("2. Check logs, build output, and test results\n");
                prompt.push_str("3. Apply targeted fixes\n");
                prompt.push_str("4. Escalate if the issue is beyond your scope\n");
            }
            EscalationAction::EscalateToParent => {
                prompt.push_str("## Escalation Instructions\n\n");
                prompt.push_str(
                    "This issue requires senior-level attention or architectural review:\n",
                );
                prompt.push_str("1. Review requirements and acceptance criteria\n");
                prompt.push_str("2. Consider alternative approaches\n");
                prompt.push_str("3. Provide architectural guidance\n");
                prompt.push_str("4. Signal completion or pause for user input\n");
            }
            EscalationAction::PauseForUser => {
                prompt.push_str("## Pause Required\n\n");
                prompt.push_str("User intervention is required:\n");
                prompt.push_str("- Review the error context above\n");
                prompt.push_str("- Address the underlying issue\n");
                prompt.push_str("- Resume orchestration when ready\n");
            }
            EscalationAction::Fail => {
                prompt.push_str("## Failure\n\n");
                prompt.push_str("This item has been marked as failed.\n");
            }
        }

        prompt
    }

    /// Check if should auto-retry
    pub fn should_auto_retry(&self, failure_type: &FailureType) -> bool {
        matches!(
            failure_type,
            FailureType::Timeout
                | FailureType::Stalled
                | FailureType::TemporaryError
                | FailureType::TestFailure
        )
    }
}

impl Default for EscalationEngine {
    fn default() -> Self {
        Self::with_defaults()
    }
}

// DRY:DATA:FailureType
/// Type of failure
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum FailureType {
    Timeout,
    Stalled,
    BuildError,
    CompilationError,
    TestFailure,
    LintError,
    RequirementsUnclear,
    Blocked,
    MissingDependency,
    PermissionDenied,
    ResourceExhausted,
    QuotaExceeded,
    GateFailed,
    HelpRequested,
    CriticalError,
    TemporaryError,
    Unknown,
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_transient_failure_escalation() {
        let engine = EscalationEngine::with_defaults();

        let action = engine.determine_action(&FailureType::Timeout, 1, TierState::Running);
        assert_eq!(action, EscalationAction::Retry);

        let action = engine.determine_action(&FailureType::Timeout, 2, TierState::Running);
        assert_eq!(action, EscalationAction::Retry);

        let action = engine.determine_action(&FailureType::Timeout, 3, TierState::Running);
        assert_eq!(action, EscalationAction::Skip);

        let action = engine.determine_action(&FailureType::Timeout, 4, TierState::Running);
        assert_eq!(action, EscalationAction::EscalateToParent);
    }

    #[test]
    fn test_technical_failure_escalation() {
        let engine = EscalationEngine::with_defaults();

        let action = engine.determine_action(&FailureType::TestFailure, 1, TierState::Running);
        assert_eq!(action, EscalationAction::Retry);

        let action = engine.determine_action(&FailureType::TestFailure, 2, TierState::Running);
        assert_eq!(action, EscalationAction::EscalateToParent);
    }

    #[test]
    fn test_conceptual_failure_escalation() {
        let engine = EscalationEngine::with_defaults();

        let action =
            engine.determine_action(&FailureType::RequirementsUnclear, 1, TierState::Running);
        assert_eq!(action, EscalationAction::EscalateToParent);
    }

    #[test]
    fn test_critical_failure_escalation() {
        let engine = EscalationEngine::with_defaults();

        let action = engine.determine_action(&FailureType::PermissionDenied, 1, TierState::Running);
        assert_eq!(action, EscalationAction::PauseForUser);
    }

    #[test]
    fn test_classify_failure_from_signal() {
        let engine = EscalationEngine::with_defaults();

        assert_eq!(
            engine.classify_failure(&CompletionSignal::Timeout),
            FailureType::Timeout
        );
        assert_eq!(
            engine.classify_failure(&CompletionSignal::Stalled),
            FailureType::Stalled
        );
        assert_eq!(
            engine.classify_failure(&CompletionSignal::Gutter),
            FailureType::GateFailed
        );
    }

    #[test]
    fn test_classify_failure_from_message() {
        let engine = EscalationEngine::with_defaults();

        assert_eq!(
            engine.classify_from_message("Permission denied"),
            FailureType::PermissionDenied
        );
        assert_eq!(
            engine.classify_from_message("Out of memory"),
            FailureType::ResourceExhausted
        );
        assert_eq!(
            engine.classify_from_message("Quota exceeded"),
            FailureType::QuotaExceeded
        );
        assert_eq!(
            engine.classify_from_message("Build failed"),
            FailureType::CompilationError
        );
        assert_eq!(
            engine.classify_from_message("Test failed: assertion"),
            FailureType::TestFailure
        );
    }

    #[test]
    fn test_should_auto_retry() {
        let engine = EscalationEngine::with_defaults();

        assert!(engine.should_auto_retry(&FailureType::Timeout));
        assert!(engine.should_auto_retry(&FailureType::Stalled));
        assert!(engine.should_auto_retry(&FailureType::TestFailure));
        assert!(!engine.should_auto_retry(&FailureType::PermissionDenied));
        assert!(!engine.should_auto_retry(&FailureType::RequirementsUnclear));
    }

    #[test]
    fn test_build_escalation_prompt() {
        let engine = EscalationEngine::with_defaults();

        let prompt = engine.build_escalation_prompt(
            &EscalationAction::Retry,
            &FailureType::TestFailure,
            "Test suite failed with 3 errors",
        );

        assert!(prompt.contains("Escalation Required"));
        assert!(prompt.contains("Retry"));
        assert!(prompt.contains("TestFailure"));
        assert!(prompt.contains("Test suite failed with 3 errors"));
        assert!(prompt.contains("Retry Instructions"));
    }
}
