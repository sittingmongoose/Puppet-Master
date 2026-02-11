//! State machines for orchestrator and tier lifecycle management
//!
//! Implements robust state machines with:
//! - Validated state transitions
//! - Event-driven architecture  
//! - Transition history tracking
//! - Timestamp recording for audit trail

use crate::types::*;
use anyhow::{anyhow, Result};
use chrono::{DateTime, Utc};

/// State transition record for state machines
#[derive(Debug, Clone)]
pub struct StateTransition<S: Clone> {
    pub from_state: S,
    pub to_state: S,
    pub timestamp: DateTime<Utc>,
    pub event: String,
}

impl<S: Clone> StateTransition<S> {
    pub fn new(from_state: S, to_state: S, event: impl Into<String>) -> Self {
        Self {
            from_state,
            to_state,
            timestamp: Utc::now(),
            event: event.into(),
        }
    }
}

// ============================================================================
// Orchestrator State Machine
// ============================================================================

/// Main orchestrator state machine
/// 
/// State flow: Idle → Planning → Executing ⇄ Paused → Complete/Error
#[derive(Debug, Clone)]
pub struct OrchestratorStateMachine {
    current_state: OrchestratorState,
    history: Vec<StateTransition<OrchestratorState>>,
}

impl OrchestratorStateMachine {
    /// Create new orchestrator state machine in Idle state
    pub fn new() -> Self {
        Self {
            current_state: OrchestratorState::Idle,
            history: Vec::new(),
        }
    }

    /// Get current state
    pub fn current_state(&self) -> OrchestratorState {
        self.current_state
    }

    /// Get transition history
    pub fn history(&self) -> &[StateTransition<OrchestratorState>] {
        &self.history
    }

    /// Send event to state machine, triggering transition if valid
    pub fn send(&mut self, event: OrchestratorEvent) -> Result<OrchestratorState> {
        let event_str = format!("{:?}", event);
        let new_state = match (&self.current_state, &event) {
            // From Idle
            (OrchestratorState::Idle, OrchestratorEvent::Start) => OrchestratorState::Planning,
            
            // From Planning
            (OrchestratorState::Planning, OrchestratorEvent::PlanComplete) => {
                OrchestratorState::Executing
            }
            (OrchestratorState::Planning, OrchestratorEvent::Error(_)) => OrchestratorState::Error,
            
            // From Executing
            (OrchestratorState::Executing, OrchestratorEvent::Pause) => OrchestratorState::Paused,
            (OrchestratorState::Executing, OrchestratorEvent::Complete) => {
                OrchestratorState::Complete
            }
            (OrchestratorState::Executing, OrchestratorEvent::Error(_)) => OrchestratorState::Error,
            
            // From Paused
            (OrchestratorState::Paused, OrchestratorEvent::Resume) => OrchestratorState::Executing,
            (OrchestratorState::Paused, OrchestratorEvent::Stop) => OrchestratorState::Idle,
            
            // From Error
            (OrchestratorState::Error, OrchestratorEvent::Reset) => OrchestratorState::Idle,
            
            // From Complete
            (OrchestratorState::Complete, OrchestratorEvent::Reset) => OrchestratorState::Idle,
            
            // Invalid transitions
            _ => {
                return Err(anyhow!(
                    "Invalid orchestrator state transition: {:?} -> {:?}",
                    self.current_state,
                    event_str
                ));
            }
        };

        self.transition_to(new_state, event_str);
        Ok(new_state)
    }

    /// Force transition to new state (internal use, bypasses validation)
    fn transition_to(&mut self, new_state: OrchestratorState, event: String) {
        let transition = StateTransition {
            from_state: self.current_state,
            to_state: new_state,
            event,
            timestamp: Utc::now(),
        };
        
        self.history.push(transition);
        self.current_state = new_state;
    }

    /// Check if currently in executing state
    pub fn is_executing(&self) -> bool {
        self.current_state == OrchestratorState::Executing
    }

    /// Check if currently paused
    pub fn is_paused(&self) -> bool {
        self.current_state == OrchestratorState::Paused
    }

    /// Check if complete
    pub fn is_complete(&self) -> bool {
        self.current_state == OrchestratorState::Complete
    }

    /// Check if in error state
    pub fn is_error(&self) -> bool {
        self.current_state == OrchestratorState::Error
    }
}

impl Default for OrchestratorStateMachine {
    fn default() -> Self {
        Self::new()
    }
}

/// Orchestrator events
#[derive(Debug, Clone)]
pub enum OrchestratorEvent {
    Start,
    PlanComplete,
    Pause,
    Resume,
    Stop,
    Complete,
    Error(String),
    Reset,
    /// State changed event
    StateChanged {
        old_state: OrchestratorState,
        new_state: OrchestratorState,
    },
    /// Iteration started
    IterationStarted {
        tier_id: String,
        iteration: u32,
    },
    /// Iteration completed
    IterationCompleted {
        tier_id: String,
        iteration: u32,
        success: bool,
    },
    /// Output line from running process
    OutputLine {
        tier_id: String,
        line: String,
        line_type: OutputLineType,
    },
    /// PuppetMasterEvent wrapper for events to be published externally
    PuppetMasterEvent(PuppetMasterEvent),
}

// ============================================================================
// Tier State Machine
// ============================================================================

/// Tier execution state machine
/// 
/// State flow: Pending → Planning → Running → Gating → Passed/Failed/Escalated
///            Running can also transition to Retrying → Running
#[derive(Debug, Clone)]
pub struct TierStateMachine {
    tier_id: String,
    tier_type: TierType,
    current_state: TierState,
    current_iteration: u32,
    max_iterations: u32,
    history: Vec<StateTransition<TierState>>,
}

impl TierStateMachine {
    /// Create new tier state machine
    pub fn new(tier_id: String, tier_type: TierType, max_iterations: u32) -> Self {
        Self {
            tier_id,
            tier_type,
            current_state: TierState::Pending,
            current_iteration: 0,
            max_iterations,
            history: Vec::new(),
        }
    }

    /// Get current state
    pub fn current_state(&self) -> TierState {
        self.current_state
    }

    /// Get current iteration (0-based, increments when starting iteration)
    pub fn current_iteration(&self) -> u32 {
        self.current_iteration
    }

    /// Get max iterations
    pub fn max_iterations(&self) -> u32 {
        self.max_iterations
    }

    /// Get tier ID
    pub fn tier_id(&self) -> &str {
        &self.tier_id
    }

    /// Get tier type
    pub fn tier_type(&self) -> TierType {
        self.tier_type
    }

    /// Get transition history
    pub fn history(&self) -> &[StateTransition<TierState>] {
        &self.history
    }

    /// Check if max iterations reached
    pub fn is_max_iterations_reached(&self) -> bool {
        self.current_iteration >= self.max_iterations
    }

    /// Send event to state machine
    pub fn send(&mut self, event: TierEvent) -> Result<TierState> {
        let event_str = format!("{:?}", event);
        let new_state = match (&self.current_state, &event) {
            // From Pending
            (TierState::Pending, TierEvent::StartPlanning) => TierState::Planning,
            
            // From Planning
            (TierState::Planning, TierEvent::StartExecution) => {
                self.current_iteration += 1;
                TierState::Running
            }
            (TierState::Planning, TierEvent::Fail(_)) => TierState::Failed,
            
            // From Running
            (TierState::Running, TierEvent::Complete) => TierState::Gating,
            (TierState::Running, TierEvent::Retry) => {
                if self.is_max_iterations_reached() {
                    return Err(anyhow!(
                        "Cannot retry tier {}: max iterations ({}) reached",
                        self.tier_id,
                        self.max_iterations
                    ));
                }
                self.current_iteration += 1;
                TierState::Retrying
            }
            (TierState::Running, TierEvent::Fail(_reason)) => {
                if self.is_max_iterations_reached() {
                    TierState::Failed
                } else {
                    TierState::Retrying
                }
            }
            (TierState::Running, TierEvent::Escalate(_)) => TierState::Escalated,
            
            // From Gating
            (TierState::Gating, TierEvent::GatePass) => TierState::Passed,
            (TierState::Gating, TierEvent::GateFail(_)) => {
                if self.is_max_iterations_reached() {
                    TierState::Failed
                } else {
                    TierState::Retrying
                }
            }
            (TierState::Gating, TierEvent::Escalate(_)) => TierState::Escalated,
            
            // From Retrying
            (TierState::Retrying, TierEvent::StartExecution) => {
                self.current_iteration += 1;
                TierState::Running
            }
            (TierState::Retrying, TierEvent::Escalate(_)) => TierState::Escalated,
            
            // From Escalated
            (TierState::Escalated, TierEvent::Resume) => TierState::Running,
            (TierState::Escalated, TierEvent::Fail(_)) => TierState::Failed,
            
            // From terminal states, only Reset allowed
            (TierState::Passed | TierState::Failed, TierEvent::Reset) => TierState::Pending,
            
            // Invalid transitions
            _ => {
                return Err(anyhow!(
                    "Invalid tier state transition for {}: {:?} -> {:?}",
                    self.tier_id,
                    self.current_state,
                    event_str
                ));
            }
        };

        self.transition_to(new_state, event_str);
        Ok(new_state)
    }

    /// Force transition to new state
    fn transition_to(&mut self, new_state: TierState, event: String) {
        let transition = StateTransition {
            from_state: self.current_state,
            to_state: new_state,
            event,
            timestamp: Utc::now(),
        };
        
        self.history.push(transition);
        self.current_state = new_state;
    }

    /// Check if tier is in a terminal state
    pub fn is_terminal(&self) -> bool {
        matches!(
            self.current_state,
            TierState::Passed | TierState::Failed
        )
    }

    /// Check if tier is running
    pub fn is_running(&self) -> bool {
        matches!(
            self.current_state,
            TierState::Running | TierState::Retrying
        )
    }

    /// Check if tier needs escalation
    pub fn needs_escalation(&self) -> bool {
        self.current_state == TierState::Escalated
    }

    /// Reset to pending state (clears iteration count)
    pub fn reset(&mut self) -> Result<()> {
        self.send(TierEvent::Reset)?;
        self.current_iteration = 0;
        Ok(())
    }
}

/// Tier events
#[derive(Debug, Clone)]
pub enum TierEvent {
    StartPlanning,
    StartExecution,
    Complete,
    Retry,
    GatePass,
    GateFail(String),
    Fail(String),
    Escalate(String),
    Resume,
    Reset,
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_orchestrator_state_machine_happy_path() {
        let mut sm = OrchestratorStateMachine::new();
        assert_eq!(sm.current_state(), OrchestratorState::Idle);

        sm.send(OrchestratorEvent::Start).unwrap();
        assert_eq!(sm.current_state(), OrchestratorState::Planning);

        sm.send(OrchestratorEvent::PlanComplete).unwrap();
        assert_eq!(sm.current_state(), OrchestratorState::Executing);

        sm.send(OrchestratorEvent::Complete).unwrap();
        assert_eq!(sm.current_state(), OrchestratorState::Complete);

        assert_eq!(sm.history().len(), 3);
    }

    #[test]
    fn test_orchestrator_pause_resume() {
        let mut sm = OrchestratorStateMachine::new();
        sm.send(OrchestratorEvent::Start).unwrap();
        sm.send(OrchestratorEvent::PlanComplete).unwrap();
        
        sm.send(OrchestratorEvent::Pause).unwrap();
        assert_eq!(sm.current_state(), OrchestratorState::Paused);
        assert!(sm.is_paused());

        sm.send(OrchestratorEvent::Resume).unwrap();
        assert_eq!(sm.current_state(), OrchestratorState::Executing);
        assert!(sm.is_executing());
    }

    #[test]
    fn test_orchestrator_error_handling() {
        let mut sm = OrchestratorStateMachine::new();
        sm.send(OrchestratorEvent::Start).unwrap();
        sm.send(OrchestratorEvent::PlanComplete).unwrap();

        sm.send(OrchestratorEvent::Error("Test error".to_string())).unwrap();
        assert_eq!(sm.current_state(), OrchestratorState::Error);
        assert!(sm.is_error());

        sm.send(OrchestratorEvent::Reset).unwrap();
        assert_eq!(sm.current_state(), OrchestratorState::Idle);
    }

    #[test]
    fn test_orchestrator_invalid_transition() {
        let mut sm = OrchestratorStateMachine::new();
        let result = sm.send(OrchestratorEvent::Complete);
        assert!(result.is_err());
    }

    #[test]
    fn test_tier_state_machine_happy_path() {
        let mut sm = TierStateMachine::new("1.1.1".to_string(), TierType::Subtask, 3);
        assert_eq!(sm.current_state(), TierState::Pending);
        assert_eq!(sm.current_iteration(), 0);

        sm.send(TierEvent::StartPlanning).unwrap();
        assert_eq!(sm.current_state(), TierState::Planning);

        sm.send(TierEvent::StartExecution).unwrap();
        assert_eq!(sm.current_state(), TierState::Running);
        assert_eq!(sm.current_iteration(), 1);

        sm.send(TierEvent::Complete).unwrap();
        assert_eq!(sm.current_state(), TierState::Gating);

        sm.send(TierEvent::GatePass).unwrap();
        assert_eq!(sm.current_state(), TierState::Passed);
        assert!(sm.is_terminal());
    }

    #[test]
    fn test_tier_retry_logic() {
        let mut sm = TierStateMachine::new("1.1.1".to_string(), TierType::Subtask, 3);
        sm.send(TierEvent::StartPlanning).unwrap();
        sm.send(TierEvent::StartExecution).unwrap();

        sm.send(TierEvent::Retry).unwrap();
        assert_eq!(sm.current_state(), TierState::Retrying);
        assert_eq!(sm.current_iteration(), 2);

        sm.send(TierEvent::StartExecution).unwrap();
        assert_eq!(sm.current_state(), TierState::Running);
    }

    #[test]
    fn test_tier_max_iterations() {
        let mut sm = TierStateMachine::new("1.1.1".to_string(), TierType::Subtask, 2);
        sm.send(TierEvent::StartPlanning).unwrap();
        sm.send(TierEvent::StartExecution).unwrap();
        assert_eq!(sm.current_iteration(), 1);

        sm.send(TierEvent::Retry).unwrap();
        assert_eq!(sm.current_iteration(), 2);
        assert!(sm.is_max_iterations_reached());

        // Should fail because max iterations reached
        let result = sm.send(TierEvent::Retry);
        assert!(result.is_err());
    }

    #[test]
    fn test_tier_escalation() {
        let mut sm = TierStateMachine::new("1.1.1".to_string(), TierType::Subtask, 3);
        sm.send(TierEvent::StartPlanning).unwrap();
        sm.send(TierEvent::StartExecution).unwrap();

        sm.send(TierEvent::Escalate("Need help".to_string())).unwrap();
        assert_eq!(sm.current_state(), TierState::Escalated);
        assert!(sm.needs_escalation());

        sm.send(TierEvent::Resume).unwrap();
        assert_eq!(sm.current_state(), TierState::Running);
    }

    #[test]
    fn test_tier_gate_failure_retry() {
        let mut sm = TierStateMachine::new("1.1.1".to_string(), TierType::Subtask, 3);
        sm.send(TierEvent::StartPlanning).unwrap();
        sm.send(TierEvent::StartExecution).unwrap();
        sm.send(TierEvent::Complete).unwrap();

        sm.send(TierEvent::GateFail("Tests failed".to_string())).unwrap();
        assert_eq!(sm.current_state(), TierState::Retrying);
        assert_eq!(sm.current_iteration(), 1);
    }

    #[test]
    fn test_tier_reset() {
        let mut sm = TierStateMachine::new("1.1.1".to_string(), TierType::Subtask, 3);
        sm.send(TierEvent::StartPlanning).unwrap();
        sm.send(TierEvent::StartExecution).unwrap();
        sm.send(TierEvent::Complete).unwrap();
        sm.send(TierEvent::GatePass).unwrap();

        sm.reset().unwrap();
        assert_eq!(sm.current_state(), TierState::Pending);
        assert_eq!(sm.current_iteration(), 0);
    }
}
