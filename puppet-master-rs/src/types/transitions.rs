//! State transition types for orchestrator and tier state machines.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::state::{OrchestratorState, TierState};

/// Trigger that caused a state transition.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum TransitionTrigger {
    /// Manual user action
    Manual,
    /// Automatic based on conditions
    Automatic,
    /// Gate validation passed
    GatePassed,
    /// Gate validation failed
    GateFailed,
    /// Error occurred
    Error,
    /// Timeout reached
    Timeout,
    /// External event
    External,
    /// Completion of work
    Completed,
    /// Retry after failure
    Retry,
}

impl TransitionTrigger {
    /// Returns a human-readable description.
    pub fn description(&self) -> &'static str {
        match self {
            Self::Manual => "Manually triggered by user",
            Self::Automatic => "Automatically triggered by system",
            Self::GatePassed => "Gate validation passed",
            Self::GateFailed => "Gate validation failed",
            Self::Error => "Error condition detected",
            Self::Timeout => "Timeout reached",
            Self::External => "External event received",
            Self::Completed => "Work completed successfully",
            Self::Retry => "Retrying after failure",
        }
    }
}

/// Action to take during a state transition.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum TransitionAction {
    /// Log the transition
    Log,
    /// Send notification
    Notify,
    /// Save checkpoint to disk
    SaveCheckpoint,
    /// Run validation gate
    RunGate,
    /// Escalate to higher tier
    Escalate,
    /// Roll back to previous state
    Rollback,
    /// Execute cleanup
    Cleanup,
    /// Update metrics
    UpdateMetrics,
}

impl TransitionAction {
    /// Returns a human-readable description.
    pub fn description(&self) -> &'static str {
        match self {
            Self::Log => "Log transition details",
            Self::Notify => "Send notification to observers",
            Self::SaveCheckpoint => "Save state checkpoint to disk",
            Self::RunGate => "Execute validation gate",
            Self::Escalate => "Escalate to higher tier",
            Self::Rollback => "Roll back to previous state",
            Self::Cleanup => "Execute cleanup procedures",
            Self::UpdateMetrics => "Update performance metrics",
        }
    }
}

/// Orchestrator-level state transition.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OrchestratorTransition {
    /// State transitioning from
    pub from_state: OrchestratorState,

    /// State transitioning to
    pub to_state: OrchestratorState,

    /// What triggered this transition
    pub trigger: TransitionTrigger,

    /// When the transition occurred
    pub timestamp: DateTime<Utc>,

    /// Optional reason or context
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,

    /// Actions to perform during transition
    #[serde(default)]
    pub actions: Vec<TransitionAction>,
}

impl OrchestratorTransition {
    /// Creates a new orchestrator transition.
    pub fn new(
        from_state: OrchestratorState,
        to_state: OrchestratorState,
        trigger: TransitionTrigger,
    ) -> Self {
        Self {
            from_state,
            to_state,
            trigger,
            timestamp: Utc::now(),
            reason: None,
            actions: Vec::new(),
        }
    }

    /// Sets the reason and returns self for chaining.
    pub fn with_reason(mut self, reason: impl Into<String>) -> Self {
        self.reason = Some(reason.into());
        self
    }

    /// Adds an action and returns self for chaining.
    pub fn with_action(mut self, action: TransitionAction) -> Self {
        self.actions.push(action);
        self
    }

    /// Checks if this is a valid transition.
    pub fn is_valid(&self) -> bool {
        // Implement state machine rules
        use OrchestratorState::*;
        matches!(
            (&self.from_state, &self.to_state),
            (Idle, Planning)
                | (Planning, Executing)
                | (Planning, Error)
                | (Executing, Paused)
                | (Executing, Error)
                | (Executing, Complete)
                | (Paused, Executing)
                | (Paused, Error)
                | (Error, Planning)
                | (Error, Idle)
                | (Complete, Idle)
        )
    }
}

/// Tier-level state transition.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TierTransition {
    /// Tier identifier
    pub tier_id: String,

    /// State transitioning from
    pub from_state: TierState,

    /// State transitioning to
    pub to_state: TierState,

    /// What triggered this transition
    pub trigger: TransitionTrigger,

    /// When the transition occurred
    pub timestamp: DateTime<Utc>,

    /// Optional reason or context
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,

    /// Actions to perform during transition
    #[serde(default)]
    pub actions: Vec<TransitionAction>,

    /// Duration in the previous state (milliseconds)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub duration_ms: Option<u64>,
}

impl TierTransition {
    /// Creates a new tier transition.
    pub fn new(
        tier_id: impl Into<String>,
        from_state: TierState,
        to_state: TierState,
        trigger: TransitionTrigger,
    ) -> Self {
        Self {
            tier_id: tier_id.into(),
            from_state,
            to_state,
            trigger,
            timestamp: Utc::now(),
            reason: None,
            actions: Vec::new(),
            duration_ms: None,
        }
    }

    /// Sets the reason and returns self for chaining.
    pub fn with_reason(mut self, reason: impl Into<String>) -> Self {
        self.reason = Some(reason.into());
        self
    }

    /// Adds an action and returns self for chaining.
    pub fn with_action(mut self, action: TransitionAction) -> Self {
        self.actions.push(action);
        self
    }

    /// Sets the duration and returns self for chaining.
    pub fn with_duration(mut self, duration_ms: u64) -> Self {
        self.duration_ms = Some(duration_ms);
        self
    }

    /// Checks if this is a valid transition.
    pub fn is_valid(&self) -> bool {
        // Implement state machine rules
        use TierState::*;
        matches!(
            (&self.from_state, &self.to_state),
            (Pending, Planning)
                | (Planning, Running)
                | (Running, Gating)
                | (Running, Failed)
                | (Gating, Passed)
                | (Gating, Failed)
                | (Failed, Retrying)
                | (Retrying, Running)
                | (Passed, Reopened)
                | (Pending, Skipped)
        )
    }
}

/// Transition history for tracking state changes.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TransitionHistory {
    /// Orchestrator transitions
    pub orchestrator_transitions: Vec<OrchestratorTransition>,

    /// Tier transitions
    pub tier_transitions: Vec<TierTransition>,
}

impl TransitionHistory {
    /// Creates a new empty history.
    pub fn new() -> Self {
        Self::default()
    }

    /// Records an orchestrator transition.
    pub fn record_orchestrator(&mut self, transition: OrchestratorTransition) {
        self.orchestrator_transitions.push(transition);
    }

    /// Records a tier transition.
    pub fn record_tier(&mut self, transition: TierTransition) {
        self.tier_transitions.push(transition);
    }

    /// Returns transitions for a specific tier.
    pub fn for_tier(&self, tier_id: &str) -> Vec<&TierTransition> {
        self.tier_transitions
            .iter()
            .filter(|t| t.tier_id == tier_id)
            .collect()
    }

    /// Returns the most recent orchestrator state.
    pub fn current_orchestrator_state(&self) -> Option<OrchestratorState> {
        self.orchestrator_transitions
            .last()
            .map(|t| t.to_state.clone())
    }

    /// Returns the most recent tier state.
    pub fn current_tier_state(&self, tier_id: &str) -> Option<TierState> {
        self.tier_transitions
            .iter()
            .filter(|t| t.tier_id == tier_id)
            .last()
            .map(|t| t.to_state.clone())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_transition_trigger_description() {
        assert_eq!(
            TransitionTrigger::GatePassed.description(),
            "Gate validation passed"
        );
        assert_eq!(
            TransitionTrigger::Manual.description(),
            "Manually triggered by user"
        );
    }

    #[test]
    fn test_transition_action_description() {
        assert_eq!(
            TransitionAction::SaveCheckpoint.description(),
            "Save state checkpoint to disk"
        );
        assert_eq!(
            TransitionAction::Escalate.description(),
            "Escalate to higher tier"
        );
    }

    #[test]
    fn test_orchestrator_transition_builder() {
        let transition = OrchestratorTransition::new(
            OrchestratorState::Planning,
            OrchestratorState::Executing,
            TransitionTrigger::Automatic,
        )
        .with_reason("Planning phase completed")
        .with_action(TransitionAction::Log)
        .with_action(TransitionAction::SaveCheckpoint);

        assert_eq!(transition.from_state, OrchestratorState::Planning);
        assert_eq!(transition.to_state, OrchestratorState::Executing);
        assert_eq!(transition.actions.len(), 2);
        assert!(transition.is_valid());
    }

    #[test]
    fn test_orchestrator_transition_validation() {
        // Valid transition
        let valid = OrchestratorTransition::new(
            OrchestratorState::Idle,
            OrchestratorState::Planning,
            TransitionTrigger::Manual,
        );
        assert!(valid.is_valid());

        // Invalid transition
        let invalid = OrchestratorTransition::new(
            OrchestratorState::Complete,
            OrchestratorState::Executing,
            TransitionTrigger::Manual,
        );
        assert!(!invalid.is_valid());
    }

    #[test]
    fn test_tier_transition() {
        let transition = TierTransition::new(
            "TIER-001",
            TierState::Pending,
            TierState::Planning,
            TransitionTrigger::Automatic,
        )
        .with_reason("Tier ready to execute")
        .with_duration(5000);

        assert_eq!(transition.tier_id, "TIER-001");
        assert_eq!(transition.duration_ms, Some(5000));
        assert!(transition.is_valid());
    }

    #[test]
    fn test_tier_transition_validation() {
        // Valid transition
        let valid = TierTransition::new(
            "TIER-001",
            TierState::Running,
            TierState::Gating,
            TransitionTrigger::Automatic,
        );
        assert!(valid.is_valid());

        // Invalid transition
        let invalid = TierTransition::new(
            "TIER-001",
            TierState::Passed,
            TierState::Running,
            TransitionTrigger::Retry,
        );
        assert!(!invalid.is_valid());
    }

    #[test]
    fn test_transition_history() {
        let mut history = TransitionHistory::new();

        history.record_orchestrator(OrchestratorTransition::new(
            OrchestratorState::Idle,
            OrchestratorState::Planning,
            TransitionTrigger::Manual,
        ));

        history.record_tier(TierTransition::new(
            "TIER-001",
            TierState::Pending,
            TierState::Planning,
            TransitionTrigger::Automatic,
        ));

        history.record_tier(TierTransition::new(
            "TIER-002",
            TierState::Pending,
            TierState::Planning,
            TransitionTrigger::Automatic,
        ));

        assert_eq!(history.orchestrator_transitions.len(), 1);
        assert_eq!(history.tier_transitions.len(), 2);
        assert_eq!(history.for_tier("TIER-001").len(), 1);
        assert_eq!(
            history.current_orchestrator_state(),
            Some(OrchestratorState::Planning)
        );
        assert_eq!(
            history.current_tier_state("TIER-001"),
            Some(TierState::Planning)
        );
    }
}
