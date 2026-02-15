//! Escalation chain helpers (P2-T09)
//!
//! Pure helpers for selecting which escalation step should apply for a given
//! failure type and attempt number.

use crate::types::{EscalationChainKey, EscalationChainStepConfig, EscalationTarget, TierType};
use anyhow::{Result, anyhow};

// DRY:DATA:EscalationChainFailureType
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EscalationChainFailureType {
    TestFailure,
    Acceptance,
    Timeout,
    Structural,
    Error,
}

// DRY:DATA:EscalationChainSelection
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct EscalationChainSelection {
    pub step: EscalationChainStepConfig,
    pub index: usize,
}

// DRY:FN:map_failure_type_to_chain_key
/// Map an internal failure type to the config key used in `escalation.chains`.
pub fn map_failure_type_to_chain_key(
    failure_type: EscalationChainFailureType,
) -> EscalationChainKey {
    match failure_type {
        EscalationChainFailureType::TestFailure => EscalationChainKey::TestFailure,
        EscalationChainFailureType::Acceptance => EscalationChainKey::Acceptance,
        EscalationChainFailureType::Timeout => EscalationChainKey::Timeout,
        EscalationChainFailureType::Structural => EscalationChainKey::Structural,
        EscalationChainFailureType::Error => EscalationChainKey::Error,
    }
}

// DRY:FN:select_escalation_chain_step
/// Select the escalation-chain step for a given 1-based attempt number.
///
/// Deterministic selection rules:
/// - Steps define contiguous attempt "ranges" in order.
/// - `max_attempts` is the width of that range.
/// - Missing `max_attempts` is treated as infinite width (covers all remaining attempts).
/// - If all steps are finite and `attempt` exceeds the sum, the last step is chosen.
pub fn select_escalation_chain_step(
    chain: &[EscalationChainStepConfig],
    attempt: u32,
) -> Result<EscalationChainSelection> {
    if chain.is_empty() {
        return Err(anyhow!("select_escalation_chain_step: chain is empty"));
    }

    if attempt < 1 {
        return Err(anyhow!(
            "select_escalation_chain_step: attempt must be >= 1, got {}",
            attempt
        ));
    }

    let mut remaining = attempt;

    for (index, step) in chain.iter().enumerate() {
        let max_attempts = to_max_attempts(step.max_attempts);

        if max_attempts.is_none() {
            return Ok(EscalationChainSelection {
                step: step.clone(),
                index,
            });
        }

        let width = max_attempts.unwrap_or(0);
        if remaining <= width {
            return Ok(EscalationChainSelection {
                step: step.clone(),
                index,
            });
        }

        remaining = remaining.saturating_sub(width);
    }

    Ok(EscalationChainSelection {
        step: chain[chain.len() - 1].clone(),
        index: chain.len() - 1,
    })
}

// DRY:FN:to_tier_type
/// Normalize configured tier target into a TierType.
pub fn to_tier_type(value: Option<EscalationTarget>) -> Option<TierType> {
    match value {
        Some(EscalationTarget::Phase) => Some(TierType::Phase),
        Some(EscalationTarget::Task) => Some(TierType::Task),
        Some(EscalationTarget::Subtask) => Some(TierType::Subtask),
        None => None,
    }
}

fn to_max_attempts(value: Option<u32>) -> Option<u32> {
    match value {
        None => None,
        Some(v) if v == 0 => Some(0),
        Some(v) => Some(v),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::EscalationChainAction;

    #[test]
    fn maps_failure_types() {
        assert_eq!(
            map_failure_type_to_chain_key(EscalationChainFailureType::TestFailure),
            EscalationChainKey::TestFailure
        );
        assert_eq!(
            map_failure_type_to_chain_key(EscalationChainFailureType::Timeout),
            EscalationChainKey::Timeout
        );
    }

    #[test]
    fn selects_chain_step_based_on_ranges() {
        let chain = vec![
            EscalationChainStepConfig {
                action: EscalationChainAction::Retry,
                max_attempts: Some(2),
                to: None,
                notify: false,
            },
            EscalationChainStepConfig {
                action: EscalationChainAction::SelfFix,
                max_attempts: Some(1),
                to: None,
                notify: false,
            },
            EscalationChainStepConfig {
                action: EscalationChainAction::Escalate,
                max_attempts: None,
                to: Some(EscalationTarget::Phase),
                notify: false,
            },
        ];

        assert_eq!(
            select_escalation_chain_step(&chain, 1).unwrap().step.action,
            EscalationChainAction::Retry
        );
        assert_eq!(
            select_escalation_chain_step(&chain, 2).unwrap().step.action,
            EscalationChainAction::Retry
        );
        assert_eq!(
            select_escalation_chain_step(&chain, 3).unwrap().step.action,
            EscalationChainAction::SelfFix
        );
        assert_eq!(
            select_escalation_chain_step(&chain, 4).unwrap().step.action,
            EscalationChainAction::Escalate
        );
    }

    #[test]
    fn treats_undefined_max_attempts_as_infinite() {
        let chain = vec![EscalationChainStepConfig {
            action: EscalationChainAction::Escalate,
            max_attempts: None,
            to: Some(EscalationTarget::Task),
            notify: false,
        }];

        assert_eq!(
            select_escalation_chain_step(&chain, 10)
                .unwrap()
                .step
                .action,
            EscalationChainAction::Escalate
        );
    }

    #[test]
    fn throws_on_empty_chain_or_invalid_attempt() {
        let chain: Vec<EscalationChainStepConfig> = vec![];
        assert!(select_escalation_chain_step(&chain, 1).is_err());

        let chain = vec![EscalationChainStepConfig {
            action: EscalationChainAction::Retry,
            max_attempts: Some(1),
            to: None,
            notify: false,
        }];
        assert!(select_escalation_chain_step(&chain, 0).is_err());
    }

    #[test]
    fn coerces_tier_types_when_provided() {
        assert_eq!(
            to_tier_type(Some(EscalationTarget::Phase)),
            Some(TierType::Phase)
        );
        assert_eq!(to_tier_type(None), None);
    }

    #[test]
    fn test_escalation_target_selection_with_mixed_chain() {
        // Simulate a realistic escalation chain:
        // Attempts 1-2: Retry
        // Attempt 3: SelfFix
        // Attempts 4+: Escalate to Phase
        let chain = vec![
            EscalationChainStepConfig {
                action: EscalationChainAction::Retry,
                max_attempts: Some(2),
                to: None,
                notify: false,
            },
            EscalationChainStepConfig {
                action: EscalationChainAction::SelfFix,
                max_attempts: Some(1),
                to: None,
                notify: true,
            },
            EscalationChainStepConfig {
                action: EscalationChainAction::Escalate,
                max_attempts: None, // infinite - covers all remaining
                to: Some(EscalationTarget::Phase),
                notify: true,
            },
        ];

        // Test attempt 1 - should be Retry
        let selection = select_escalation_chain_step(&chain, 1).unwrap();
        assert_eq!(selection.step.action, EscalationChainAction::Retry);
        assert_eq!(selection.index, 0);
        assert!(!selection.step.notify);

        // Test attempt 2 - should still be Retry
        let selection = select_escalation_chain_step(&chain, 2).unwrap();
        assert_eq!(selection.step.action, EscalationChainAction::Retry);
        assert_eq!(selection.index, 0);

        // Test attempt 3 - should be SelfFix
        let selection = select_escalation_chain_step(&chain, 3).unwrap();
        assert_eq!(selection.step.action, EscalationChainAction::SelfFix);
        assert_eq!(selection.index, 1);
        assert!(selection.step.notify);

        // Test attempt 4 - should be Escalate
        let selection = select_escalation_chain_step(&chain, 4).unwrap();
        assert_eq!(selection.step.action, EscalationChainAction::Escalate);
        assert_eq!(selection.index, 2);
        assert_eq!(selection.step.to, Some(EscalationTarget::Phase));

        // Test attempt 10 - should still be Escalate (infinite range)
        let selection = select_escalation_chain_step(&chain, 10).unwrap();
        assert_eq!(selection.step.action, EscalationChainAction::Escalate);
        assert_eq!(selection.index, 2);
    }

    #[test]
    fn test_escalation_target_selection_with_kickdown() {
        // Test chain with KickDown action
        let chain = vec![
            EscalationChainStepConfig {
                action: EscalationChainAction::Retry,
                max_attempts: Some(1),
                to: None,
                notify: false,
            },
            EscalationChainStepConfig {
                action: EscalationChainAction::KickDown,
                max_attempts: Some(2),
                to: Some(EscalationTarget::Subtask),
                notify: true,
            },
            EscalationChainStepConfig {
                action: EscalationChainAction::Escalate,
                max_attempts: None,
                to: Some(EscalationTarget::Task),
                notify: true,
            },
        ];

        let selection = select_escalation_chain_step(&chain, 2).unwrap();
        assert_eq!(selection.step.action, EscalationChainAction::KickDown);
        assert_eq!(selection.step.to, Some(EscalationTarget::Subtask));
    }

    #[test]
    fn test_escalation_target_selection_exceeds_finite_chain() {
        // All steps have finite max_attempts
        let chain = vec![
            EscalationChainStepConfig {
                action: EscalationChainAction::Retry,
                max_attempts: Some(2),
                to: None,
                notify: false,
            },
            EscalationChainStepConfig {
                action: EscalationChainAction::Pause,
                max_attempts: Some(1),
                to: None,
                notify: true,
            },
        ];

        // Attempt 4 exceeds the sum (2+1=3), should return last step
        let selection = select_escalation_chain_step(&chain, 4).unwrap();
        assert_eq!(selection.step.action, EscalationChainAction::Pause);
        assert_eq!(selection.index, 1);
    }

    #[test]
    fn test_all_escalation_targets_map_correctly() {
        assert_eq!(
            to_tier_type(Some(EscalationTarget::Phase)),
            Some(TierType::Phase)
        );
        assert_eq!(
            to_tier_type(Some(EscalationTarget::Task)),
            Some(TierType::Task)
        );
        assert_eq!(
            to_tier_type(Some(EscalationTarget::Subtask)),
            Some(TierType::Subtask)
        );
    }
}
