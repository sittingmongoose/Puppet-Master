//! Centralized state transition tables and validation
//!
//! Defines valid state transitions for:
//! - Orchestrator state machine
//! - Tier state machine
//! - Transition validation helpers

use crate::types::{OrchestratorState, TierState};
use std::collections::HashMap;

/// Orchestrator state transition
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct OrchestratorTransition {
    /// Source state
    pub from: OrchestratorState,
    /// Target state
    pub to: OrchestratorState,
}

/// Tier state transition
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct TierTransition {
    /// Source state
    pub from: TierState,
    /// Target state
    pub to: TierState,
}

/// State transition tables
pub struct StateTransitions {
    /// Valid orchestrator transitions
    _orchestrator_transitions: Vec<OrchestratorTransition>,
    /// Valid tier transitions
    _tier_transitions: Vec<TierTransition>,
    /// Cached lookup for orchestrator transitions
    orchestrator_lookup: HashMap<OrchestratorState, Vec<OrchestratorState>>,
    /// Cached lookup for tier transitions
    tier_lookup: HashMap<TierState, Vec<TierState>>,
}

impl StateTransitions {
    /// Create new state transition tables
    pub fn new() -> Self {
        let orchestrator_transitions = Self::orchestrator_transition_table();
        let tier_transitions = Self::tier_transition_table();

        // Build lookup tables for fast validation
        let mut orchestrator_lookup: HashMap<OrchestratorState, Vec<OrchestratorState>> =
            HashMap::new();
        for transition in &orchestrator_transitions {
            orchestrator_lookup
                .entry(transition.from)
                .or_insert_with(Vec::new)
                .push(transition.to);
        }

        let mut tier_lookup: HashMap<TierState, Vec<TierState>> = HashMap::new();
        for transition in &tier_transitions {
            tier_lookup
                .entry(transition.from)
                .or_insert_with(Vec::new)
                .push(transition.to);
        }

        Self {
            _orchestrator_transitions: orchestrator_transitions,
            _tier_transitions: tier_transitions,
            orchestrator_lookup,
            tier_lookup,
        }
    }

    /// Check if orchestrator transition is valid
    pub fn is_valid_orchestrator_transition(
        &self,
        from: OrchestratorState,
        to: OrchestratorState,
    ) -> bool {
        self.orchestrator_lookup
            .get(&from)
            .map(|valid_states| valid_states.contains(&to))
            .unwrap_or(false)
    }

    /// Check if tier transition is valid
    pub fn is_valid_tier_transition(&self, from: TierState, to: TierState) -> bool {
        self.tier_lookup
            .get(&from)
            .map(|valid_states| valid_states.contains(&to))
            .unwrap_or(false)
    }

    /// Get valid next orchestrator states from current state
    pub fn get_valid_orchestrator_states(
        &self,
        from: OrchestratorState,
    ) -> Vec<OrchestratorState> {
        self.orchestrator_lookup
            .get(&from)
            .cloned()
            .unwrap_or_default()
    }

    /// Get valid next tier states from current state
    pub fn get_valid_tier_states(&self, from: TierState) -> Vec<TierState> {
        self.tier_lookup.get(&from).cloned().unwrap_or_default()
    }

    /// Orchestrator state transition table
    ///
    /// Transitions based on ARCHITECTURE.md Section 3.3:
    /// - Idle → Planning (on INIT)
    /// - Planning → Executing (on START)
    /// - Executing → Paused (on PAUSE)
    /// - Executing → Complete (on COMPLETE)
    /// - Executing → Error (on ERROR)
    /// - Paused → Executing (on RESUME)
    /// - Error → Planning (on REPLAN)
    /// - Any → Idle (on STOP)
    fn orchestrator_transition_table() -> Vec<OrchestratorTransition> {
        vec![
            // From Idle
            OrchestratorTransition {
                from: OrchestratorState::Idle,
                to: OrchestratorState::Planning,
            },
            // From Planning
            OrchestratorTransition {
                from: OrchestratorState::Planning,
                to: OrchestratorState::Executing,
            },
            OrchestratorTransition {
                from: OrchestratorState::Planning,
                to: OrchestratorState::Error,
            },
            OrchestratorTransition {
                from: OrchestratorState::Planning,
                to: OrchestratorState::Idle,
            },
            // From Executing
            OrchestratorTransition {
                from: OrchestratorState::Executing,
                to: OrchestratorState::Paused,
            },
            OrchestratorTransition {
                from: OrchestratorState::Executing,
                to: OrchestratorState::Complete,
            },
            OrchestratorTransition {
                from: OrchestratorState::Executing,
                to: OrchestratorState::Error,
            },
            OrchestratorTransition {
                from: OrchestratorState::Executing,
                to: OrchestratorState::Idle,
            },
            // From Paused
            OrchestratorTransition {
                from: OrchestratorState::Paused,
                to: OrchestratorState::Executing,
            },
            OrchestratorTransition {
                from: OrchestratorState::Paused,
                to: OrchestratorState::Idle,
            },
            // From Error
            OrchestratorTransition {
                from: OrchestratorState::Error,
                to: OrchestratorState::Planning,
            },
            OrchestratorTransition {
                from: OrchestratorState::Error,
                to: OrchestratorState::Idle,
            },
            // From Complete
            OrchestratorTransition {
                from: OrchestratorState::Complete,
                to: OrchestratorState::Idle,
            },
        ]
    }

    /// Tier state transition table
    ///
    /// Transitions based on ARCHITECTURE.md Section 3.3:
    /// - Pending → Planning (on TIER_SELECTED)
    /// - Planning → Running (on PLAN_APPROVED)
    /// - Running → Gating (on ITERATION_COMPLETE)
    /// - Running → Retrying (on ITERATION_FAILED)
    /// - Running → Failed (on MAX_ATTEMPTS)
    /// - Running → Escalated (on ESCALATE)
    /// - Gating → Passed (on GATE_PASSED)
    /// - Gating → Running (on GATE_FAILED_MINOR, self-fix attempt)
    /// - Gating → Escalated (on GATE_FAILED_MAJOR)
    /// - Retrying → Running (on NEW_ATTEMPT)
    /// - Failed → Pending (on RETRY, reset for retry)
    /// - Escalated → Running (on RESUME)
    fn tier_transition_table() -> Vec<TierTransition> {
        vec![
            // From Pending
            TierTransition {
                from: TierState::Pending,
                to: TierState::Planning,
            },
            TierTransition {
                from: TierState::Pending,
                to: TierState::Skipped,
            },
            // From Planning
            TierTransition {
                from: TierState::Planning,
                to: TierState::Running,
            },
            TierTransition {
                from: TierState::Planning,
                to: TierState::Failed,
            },
            // From Running
            TierTransition {
                from: TierState::Running,
                to: TierState::Gating,
            },
            TierTransition {
                from: TierState::Running,
                to: TierState::Retrying,
            },
            TierTransition {
                from: TierState::Running,
                to: TierState::Failed,
            },
            TierTransition {
                from: TierState::Running,
                to: TierState::Escalated,
            },
            // From Gating
            TierTransition {
                from: TierState::Gating,
                to: TierState::Passed,
            },
            TierTransition {
                from: TierState::Gating,
                to: TierState::Running,
            },
            TierTransition {
                from: TierState::Gating,
                to: TierState::Escalated,
            },
            TierTransition {
                from: TierState::Gating,
                to: TierState::Retrying,
            },
            // From Retrying
            TierTransition {
                from: TierState::Retrying,
                to: TierState::Running,
            },
            TierTransition {
                from: TierState::Retrying,
                to: TierState::Failed,
            },
            // From Escalated
            TierTransition {
                from: TierState::Escalated,
                to: TierState::Running,
            },
            TierTransition {
                from: TierState::Escalated,
                to: TierState::Failed,
            },
            // From Failed
            TierTransition {
                from: TierState::Failed,
                to: TierState::Pending,
            },
            TierTransition {
                from: TierState::Failed,
                to: TierState::Reopened,
            },
            // From Passed
            TierTransition {
                from: TierState::Passed,
                to: TierState::Reopened,
            },
            // From Reopened
            TierTransition {
                from: TierState::Reopened,
                to: TierState::Planning,
            },
            // From Skipped
            TierTransition {
                from: TierState::Skipped,
                to: TierState::Pending,
            },
        ]
    }
}

impl Default for StateTransitions {
    fn default() -> Self {
        Self::new()
    }
}

// Use OnceLock for lazy static initialization (Rust 2024 compatible)
use std::sync::OnceLock;

static TRANSITIONS: OnceLock<StateTransitions> = OnceLock::new();

/// Get global state transitions instance
pub fn get_transitions() -> &'static StateTransitions {
    TRANSITIONS.get_or_init(|| StateTransitions::new())
}

/// Check if orchestrator transition is valid (convenience function)
pub fn can_transition_orchestrator(from: OrchestratorState, to: OrchestratorState) -> bool {
    get_transitions().is_valid_orchestrator_transition(from, to)
}

/// Check if tier transition is valid (convenience function)
pub fn can_transition_tier(from: TierState, to: TierState) -> bool {
    get_transitions().is_valid_tier_transition(from, to)
}

/// Get valid next orchestrator states (convenience function)
pub fn get_valid_next_orchestrator_states(from: OrchestratorState) -> Vec<OrchestratorState> {
    get_transitions().get_valid_orchestrator_states(from)
}

/// Get valid next tier states (convenience function)
pub fn get_valid_next_tier_states(from: TierState) -> Vec<TierState> {
    get_transitions().get_valid_tier_states(from)
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_orchestrator_happy_path() {
        let transitions = StateTransitions::new();

        // Idle → Planning
        assert!(transitions
            .is_valid_orchestrator_transition(OrchestratorState::Idle, OrchestratorState::Planning));

        // Planning → Executing
        assert!(transitions.is_valid_orchestrator_transition(
            OrchestratorState::Planning,
            OrchestratorState::Executing
        ));

        // Executing → Complete
        assert!(transitions.is_valid_orchestrator_transition(
            OrchestratorState::Executing,
            OrchestratorState::Complete
        ));
    }

    #[test]
    fn test_orchestrator_pause_resume() {
        let transitions = StateTransitions::new();

        // Executing → Paused
        assert!(transitions.is_valid_orchestrator_transition(
            OrchestratorState::Executing,
            OrchestratorState::Paused
        ));

        // Paused → Executing
        assert!(transitions.is_valid_orchestrator_transition(
            OrchestratorState::Paused,
            OrchestratorState::Executing
        ));
    }

    #[test]
    fn test_orchestrator_invalid_transition() {
        let transitions = StateTransitions::new();

        // Complete → Executing (invalid)
        assert!(!transitions.is_valid_orchestrator_transition(
            OrchestratorState::Complete,
            OrchestratorState::Executing
        ));

        // Idle → Complete (invalid)
        assert!(!transitions
            .is_valid_orchestrator_transition(OrchestratorState::Idle, OrchestratorState::Complete));
    }

    #[test]
    fn test_tier_happy_path() {
        let transitions = StateTransitions::new();

        // Pending → Planning
        assert!(transitions.is_valid_tier_transition(TierState::Pending, TierState::Planning));

        // Planning → Running
        assert!(transitions.is_valid_tier_transition(TierState::Planning, TierState::Running));

        // Running → Gating
        assert!(transitions.is_valid_tier_transition(TierState::Running, TierState::Gating));

        // Gating → Passed
        assert!(transitions.is_valid_tier_transition(TierState::Gating, TierState::Passed));
    }

    #[test]
    fn test_tier_retry_flow() {
        let transitions = StateTransitions::new();

        // Running → Retrying
        assert!(transitions.is_valid_tier_transition(TierState::Running, TierState::Retrying));

        // Retrying → Running
        assert!(transitions.is_valid_tier_transition(TierState::Retrying, TierState::Running));
    }

    #[test]
    fn test_tier_escalation() {
        let transitions = StateTransitions::new();

        // Running → Escalated
        assert!(transitions.is_valid_tier_transition(TierState::Running, TierState::Escalated));

        // Escalated → Running (resume)
        assert!(transitions.is_valid_tier_transition(TierState::Escalated, TierState::Running));
    }

    #[test]
    fn test_tier_invalid_transition() {
        let transitions = StateTransitions::new();

        // Passed → Running (invalid)
        assert!(!transitions.is_valid_tier_transition(TierState::Passed, TierState::Running));

        // Pending → Passed (invalid - must go through planning/running/gating)
        assert!(!transitions.is_valid_tier_transition(TierState::Pending, TierState::Passed));
    }

    #[test]
    fn test_get_valid_orchestrator_states() {
        let transitions = StateTransitions::new();

        let valid = transitions.get_valid_orchestrator_states(OrchestratorState::Executing);
        assert!(valid.contains(&OrchestratorState::Paused));
        assert!(valid.contains(&OrchestratorState::Complete));
        assert!(valid.contains(&OrchestratorState::Error));
    }

    #[test]
    fn test_get_valid_tier_states() {
        let transitions = StateTransitions::new();

        let valid = transitions.get_valid_tier_states(TierState::Running);
        assert!(valid.contains(&TierState::Gating));
        assert!(valid.contains(&TierState::Retrying));
        assert!(valid.contains(&TierState::Failed));
        assert!(valid.contains(&TierState::Escalated));
    }

    #[test]
    fn test_convenience_functions() {
        // Test global convenience functions
        assert!(can_transition_orchestrator(
            OrchestratorState::Idle,
            OrchestratorState::Planning
        ));

        assert!(can_transition_tier(TierState::Pending, TierState::Planning));

        let valid_orch = get_valid_next_orchestrator_states(OrchestratorState::Executing);
        assert!(!valid_orch.is_empty());

        let valid_tier = get_valid_next_tier_states(TierState::Running);
        assert!(!valid_tier.is_empty());
    }
}
