//! State machine integration tests
//!
//! Tests for orchestrator and tier state machine transitions.

use puppet_master::core::state_machine::{
    OrchestratorEvent, OrchestratorStateMachine, TierEvent, TierStateMachine,
};
use puppet_master::types::{OrchestratorState, TierState, TierType};

#[test]
fn test_orchestrator_state_lifecycle() {
    let mut sm = OrchestratorStateMachine::new();

    // Start from Idle
    assert_eq!(sm.current_state(), OrchestratorState::Idle);

    // Transition to Planning
    assert!(sm.send(OrchestratorEvent::Start).is_ok());
    assert_eq!(sm.current_state(), OrchestratorState::Planning);

    // Transition to Executing
    assert!(sm.send(OrchestratorEvent::PlanComplete).is_ok());
    assert_eq!(sm.current_state(), OrchestratorState::Executing);

    // Can pause from Executing
    assert!(sm.send(OrchestratorEvent::Pause).is_ok());
    assert_eq!(sm.current_state(), OrchestratorState::Paused);

    // Resume to Executing
    assert!(sm.send(OrchestratorEvent::Resume).is_ok());
    assert_eq!(sm.current_state(), OrchestratorState::Executing);

    // Complete
    assert!(sm.send(OrchestratorEvent::Complete).is_ok());
    assert_eq!(sm.current_state(), OrchestratorState::Complete);
}

#[test]
fn test_orchestrator_error_transition() {
    let mut sm = OrchestratorStateMachine::new();

    // Go to Planning
    sm.send(OrchestratorEvent::Start).unwrap();
    assert_eq!(sm.current_state(), OrchestratorState::Planning);

    // Can transition to Error
    assert!(
        sm.send(OrchestratorEvent::Error("Test error".to_string()))
            .is_ok()
    );
    assert_eq!(sm.current_state(), OrchestratorState::Error);

    // Can recover from Error to Idle
    assert!(sm.send(OrchestratorEvent::Reset).is_ok());
    assert_eq!(sm.current_state(), OrchestratorState::Idle);
}

#[test]
fn test_orchestrator_invalid_transitions() {
    let mut sm = OrchestratorStateMachine::new();

    // Cannot go directly from Idle to Complete
    assert!(sm.send(OrchestratorEvent::Complete).is_err());
    assert_eq!(sm.current_state(), OrchestratorState::Idle);

    // Valid transition to Planning
    sm.send(OrchestratorEvent::Start).unwrap();

    // Cannot go from Planning to Paused
    assert!(sm.send(OrchestratorEvent::Pause).is_err());
    assert_eq!(sm.current_state(), OrchestratorState::Planning);
}

#[test]
fn test_tier_state_transitions() {
    let mut sm = TierStateMachine::new("TEST-T01".to_string(), TierType::Task, 5);

    // Start from Pending
    assert_eq!(sm.current_state(), TierState::Pending);

    // Start planning
    assert!(sm.send(TierEvent::StartPlanning).is_ok());
    assert_eq!(sm.current_state(), TierState::Planning);

    // Start execution
    assert!(sm.send(TierEvent::StartExecution).is_ok());
    assert_eq!(sm.current_state(), TierState::Running);
    assert_eq!(sm.current_iteration(), 1);

    // Complete and go to gating
    assert!(sm.send(TierEvent::Complete).is_ok());
    assert_eq!(sm.current_state(), TierState::Gating);

    // Pass the gate
    assert!(sm.send(TierEvent::GatePass).is_ok());
    assert_eq!(sm.current_state(), TierState::Passed);
    assert!(sm.is_terminal());
}

#[test]
fn test_tier_retry_logic() {
    let mut sm = TierStateMachine::new("TEST-T02".to_string(), TierType::Task, 3);

    // Start execution
    sm.send(TierEvent::StartPlanning).unwrap();
    sm.send(TierEvent::StartExecution).unwrap();
    assert_eq!(sm.current_iteration(), 1);

    // Fail and retry
    assert!(sm.send(TierEvent::Fail("Test failure".to_string())).is_ok());
    assert_eq!(sm.current_state(), TierState::Retrying);

    // Try again
    sm.send(TierEvent::StartExecution).unwrap();
    assert_eq!(sm.current_state(), TierState::Running);
    assert_eq!(sm.current_iteration(), 2);

    // This time complete successfully
    sm.send(TierEvent::Complete).unwrap();
    sm.send(TierEvent::GatePass).unwrap();
    assert_eq!(sm.current_state(), TierState::Passed);
}

#[test]
fn test_tier_max_iterations() {
    let mut sm = TierStateMachine::new("TEST-T03".to_string(), TierType::Subtask, 2);

    // Use up all iterations
    for i in 1..=2 {
        sm.send(TierEvent::StartPlanning).ok();
        sm.send(TierEvent::StartExecution).unwrap();
        assert_eq!(sm.current_iteration(), i);

        if i < 2 {
            sm.send(TierEvent::Fail("Fail".to_string())).unwrap();
            assert_eq!(sm.current_state(), TierState::Retrying);
        }
    }

    // Final failure after max iterations
    sm.send(TierEvent::Fail("Final fail".to_string())).unwrap();
    assert_eq!(sm.current_state(), TierState::Failed);
    assert!(sm.is_max_iterations_reached());
}

#[test]
fn test_tier_escalation() {
    let mut sm = TierStateMachine::new("TEST-T04".to_string(), TierType::Task, 3);

    // Start execution
    sm.send(TierEvent::StartPlanning).unwrap();
    sm.send(TierEvent::StartExecution).unwrap();

    // Escalate
    assert!(
        sm.send(TierEvent::Escalate("Needs human intervention".to_string()))
            .is_ok()
    );
    assert_eq!(sm.current_state(), TierState::Escalated);

    // Resume after escalation
    assert!(sm.send(TierEvent::Resume).is_ok());
    assert_eq!(sm.current_state(), TierState::Running);
}

#[test]
fn test_tier_gate_failure_retry() {
    let mut sm = TierStateMachine::new("TEST-T05".to_string(), TierType::Task, 3);

    // Complete execution but fail gate
    sm.send(TierEvent::StartPlanning).unwrap();
    sm.send(TierEvent::StartExecution).unwrap();
    sm.send(TierEvent::Complete).unwrap();
    assert_eq!(sm.current_state(), TierState::Gating);

    // Fail gate
    assert!(
        sm.send(TierEvent::GateFail("Gate check failed".to_string()))
            .is_ok()
    );
    assert_eq!(sm.current_state(), TierState::Retrying);

    // Try again
    sm.send(TierEvent::StartExecution).unwrap();
    assert_eq!(sm.current_iteration(), 2);
}

#[test]
fn test_tier_state_history() {
    let mut sm = TierStateMachine::new("TEST-T06".to_string(), TierType::Phase, 5);

    // Make several transitions
    sm.send(TierEvent::StartPlanning).unwrap();
    sm.send(TierEvent::StartExecution).unwrap();
    sm.send(TierEvent::Complete).unwrap();
    sm.send(TierEvent::GatePass).unwrap();

    // Check history
    let history = sm.history();
    assert!(history.len() >= 4, "Should have at least 4 transitions");

    // Verify transitions are ordered
    assert_eq!(history[0].from_state, TierState::Pending);
    assert_eq!(history[0].to_state, TierState::Planning);
}

#[test]
fn test_tier_state_reset() {
    let mut sm = TierStateMachine::new("TEST-T07".to_string(), TierType::Task, 3);

    // Run to completion
    sm.send(TierEvent::StartPlanning).unwrap();
    sm.send(TierEvent::StartExecution).unwrap();
    sm.send(TierEvent::Complete).unwrap();
    sm.send(TierEvent::GatePass).unwrap();
    assert_eq!(sm.current_state(), TierState::Passed);

    // Reset
    assert!(sm.send(TierEvent::Reset).is_ok());
    assert_eq!(sm.current_state(), TierState::Pending);
}
