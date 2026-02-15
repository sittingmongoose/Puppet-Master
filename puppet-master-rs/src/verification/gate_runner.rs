//! Gate execution engine
//!
//! Runs verification gates at tier boundaries (Task, Phase) to ensure
//! quality standards are met before progression.

use crate::logging::BroadcastEventBus;
use crate::state::EvidenceStore;
use crate::types::*;
use chrono::Utc;
use log::{debug, info, warn};
use std::collections::HashMap;
use std::time::Instant;

use super::verifier::VerifierRegistry;

// DRY:DATA:GateRunConfig
/// Configuration for gate execution.
#[derive(Debug, Clone)]
pub struct GateRunConfig {
    /// Execute verifiers in parallel (faster) or sequentially (safer).
    pub parallel_execution: bool,
    /// Stop on first failure or continue to collect all failures.
    pub stop_on_first_failure: bool,
    /// Collect evidence even for passing criteria.
    pub collect_all_evidence: bool,
    /// Timeout for the entire gate run in seconds.
    pub timeout_seconds: u64,
}

impl Default for GateRunConfig {
    fn default() -> Self {
        Self {
            parallel_execution: false,
            stop_on_first_failure: false,
            collect_all_evidence: true,
            timeout_seconds: 600, // 10 minutes
        }
    }
}

// DRY:DATA:GateRunner
/// Gate runner executes verification gates.
pub struct GateRunner {
    registry: VerifierRegistry,
    config: GateRunConfig,
    evidence_store: Option<EvidenceStore>,
    event_bus: Option<BroadcastEventBus>,
}

impl GateRunner {
    // DRY:FN:new
    /// Create a new gate runner with default verifiers registered.
    pub fn new(config: GateRunConfig) -> Self {
        let mut registry = VerifierRegistry::new();
        registry.register_defaults();

        Self {
            registry,
            config,
            evidence_store: None,
            event_bus: None,
        }
    }

    // DRY:FN:with_registry
    /// Create gate runner with custom verifier registry.
    pub fn with_registry(registry: VerifierRegistry, config: GateRunConfig) -> Self {
        Self {
            registry,
            config,
            evidence_store: None,
            event_bus: None,
        }
    }

    // DRY:FN:with_integration
    /// Create gate runner wired to an EvidenceStore + EventBus.
    pub fn with_integration(
        registry: VerifierRegistry,
        config: GateRunConfig,
        evidence_store: EvidenceStore,
        event_bus: BroadcastEventBus,
    ) -> Self {
        Self {
            registry,
            config,
            evidence_store: Some(evidence_store),
            event_bus: Some(event_bus),
        }
    }

    // DRY:FN:run_gate
    /// Run a gate for a tier.
    pub async fn run_gate(
        &self,
        gate_type: &str,
        gate_id: &str,
        criteria: &[Criterion],
        _test_plan: Option<&TestPlan>,
    ) -> GateReport {
        info!("Starting gate: {} for {}", gate_type, gate_id);
        let start = Instant::now();
        let session_id = generate_gate_session_id();

        let criterion_results = match tokio::time::timeout(
            std::time::Duration::from_secs(self.config.timeout_seconds),
            async {
                if self.config.parallel_execution {
                    self.verify_criteria_parallel(gate_id, &session_id, criteria)
                        .await
                } else {
                    self.verify_criteria_sequential(gate_id, &session_id, criteria)
                        .await
                }
            },
        )
        .await
        {
            Ok(v) => v,
            Err(_) => {
                warn!(
                    "Gate {} for {} timed out after {}s",
                    gate_type, gate_id, self.config.timeout_seconds
                );
                let updated_criteria: Vec<Criterion> = criteria
                    .iter()
                    .map(|c| {
                        let mut updated = c.clone();
                        updated.met = false;
                        updated.actual = Some(format!(
                            "Gate timed out after {}s",
                            self.config.timeout_seconds
                        ));
                        updated
                    })
                    .collect();

                return GateReport {
                    gate_type: gate_type.to_string(),
                    passed: false,
                    timestamp: Utc::now(),
                    report: Some(format!(
                        "Gate timed out after {}s",
                        self.config.timeout_seconds
                    )),
                    criteria: updated_criteria,
                    reviewer_notes: None,
                };
            }
        };

        let all_passed = criterion_results.iter().all(|cr| cr.passed);

        let duration = start.elapsed();
        info!(
            "Gate {} for {} completed in {:.2}s: passed={}",
            gate_type,
            gate_id,
            duration.as_secs_f64(),
            all_passed
        );

        let mut results_by_id: HashMap<&str, &CriterionResult> = HashMap::new();
        for r in &criterion_results {
            results_by_id.insert(r.criterion.id.as_str(), r);
        }

        let updated_criteria: Vec<Criterion> = criteria
            .iter()
            .map(|c| {
                let mut updated = c.clone();
                if let Some(r) = results_by_id.get(c.id.as_str()) {
                    updated.met = r.passed;
                    updated.actual = Some(r.message.clone());
                }
                updated
            })
            .collect();

        let report_text = if all_passed {
            format!(
                "All {} criteria passed for gate {}",
                criteria.len(),
                gate_id
            )
        } else {
            let failed_count = criterion_results.iter().filter(|cr| !cr.passed).count();
            format!(
                "{} of {} criteria failed for gate {}",
                failed_count,
                criteria.len(),
                gate_id
            )
        };

        GateReport {
            gate_type: gate_type.to_string(),
            passed: all_passed,
            timestamp: Utc::now(),
            report: Some(report_text),
            criteria: updated_criteria,
            reviewer_notes: None,
        }
    }

    async fn verify_criteria_sequential(
        &self,
        gate_id: &str,
        session_id: &str,
        criteria: &[Criterion],
    ) -> Vec<CriterionResult> {
        let mut results = Vec::with_capacity(criteria.len());
        let mut stopped = false;

        for criterion in criteria {
            if stopped {
                results.push(skipped_result(
                    criterion,
                    "Skipped due to stop-on-first-failure",
                ));
                continue;
            }

            let result = self.verify_criterion(gate_id, session_id, criterion).await;

            if !result.passed && self.config.stop_on_first_failure {
                warn!("Criterion failed, stopping: {}", criterion.id);
                stopped = true;
            }

            results.push(result);
        }

        results
    }

    async fn verify_criteria_parallel(
        &self,
        gate_id: &str,
        session_id: &str,
        criteria: &[Criterion],
    ) -> Vec<CriterionResult> {
        let mut join_set = tokio::task::JoinSet::new();
        let mut results: HashMap<String, CriterionResult> = HashMap::new();

        for criterion in criteria.iter().cloned() {
            let registry = self.registry.clone();
            let evidence_store = self.evidence_store.clone();
            let event_bus = self.event_bus.clone();
            let gate_id = gate_id.to_string();
            let session_id = session_id.to_string();
            let collect_all_evidence = self.config.collect_all_evidence;

            join_set.spawn(async move {
                verify_one(
                    registry,
                    evidence_store,
                    event_bus,
                    &gate_id,
                    &session_id,
                    collect_all_evidence,
                    &criterion,
                )
                .await
            });
        }

        let mut stop = false;
        while let Some(joined) = join_set.join_next().await {
            match joined {
                Ok(r) => {
                    let id = r.criterion.id.clone();
                    if !r.passed && self.config.stop_on_first_failure {
                        stop = true;
                    }
                    results.insert(id, r);

                    if stop {
                        join_set.abort_all();
                        break;
                    }
                }
                Err(e) => {
                    warn!("Criterion verification task join error: {e}");
                }
            }
        }

        criteria
            .iter()
            .map(|c| {
                results
                    .remove(&c.id)
                    .unwrap_or_else(|| skipped_result(c, "Skipped due to stop-on-first-failure"))
            })
            .collect()
    }

    async fn verify_criterion(
        &self,
        gate_id: &str,
        session_id: &str,
        criterion: &Criterion,
    ) -> CriterionResult {
        debug!("Verifying criterion: {}", criterion.id);

        verify_one(
            self.registry.clone(),
            self.evidence_store.clone(),
            self.event_bus.clone(),
            gate_id,
            session_id,
            self.config.collect_all_evidence,
            criterion,
        )
        .await
    }
}

fn generate_gate_session_id() -> String {
    let now = Utc::now();
    format!(
        "PM-{}-{:03}",
        now.format("%Y-%m-%d-%H-%M-%S"),
        now.timestamp_subsec_millis()
    )
}

fn skipped_result(criterion: &Criterion, reason: &str) -> CriterionResult {
    CriterionResult {
        criterion: criterion.clone(),
        passed: false,
        message: reason.to_string(),
        timestamp: Utc::now(),
    }
}

async fn verify_one(
    registry: VerifierRegistry,
    evidence_store: Option<EvidenceStore>,
    event_bus: Option<BroadcastEventBus>,
    gate_id: &str,
    session_id: &str,
    collect_all_evidence: bool,
    criterion: &Criterion,
) -> CriterionResult {
    let verifier_result = match registry.verify(criterion).await {
        Ok(result) => result,
        Err(e) => {
            warn!("Verification failed for {}: {}", criterion.id, e);
            return CriterionResult {
                criterion: criterion.clone(),
                passed: false,
                message: format!("Verification error: {}", e),
                timestamp: Utc::now(),
            };
        }
    };

    if let Some(store) = evidence_store {
        if collect_all_evidence || !verifier_result.passed {
            if let Some(ev) = verifier_result.evidence.as_ref() {
                let tier_id = gate_id.to_string();
                let session_id = session_id.to_string();
                let mut metadata = ev.metadata.clone();
                metadata.insert("criterionId".to_string(), criterion.id.clone());
                metadata.insert("verifierType".to_string(), registry_key(criterion));

                let evidence_type = match ev.evidence_type.as_str() {
                    "command_output" | "script_output" => EvidenceType::CommandOutput,
                    _ => EvidenceType::Text,
                };

                let store2 = store.clone();
                let bus2 = event_bus.clone();
                let path_hint = ev.path.clone();

                let res = tokio::task::spawn_blocking(move || {
                    if let Some(content) = metadata.get("content").cloned() {
                        store2.store_text(&tier_id, &session_id, evidence_type, &content, metadata)
                    } else if let Ok(bytes) = std::fs::read(&path_hint) {
                        store2.store_evidence(
                            &tier_id,
                            &session_id,
                            evidence_type,
                            &bytes,
                            metadata,
                        )
                    } else {
                        Ok(Evidence {
                            evidence_type: evidence_type.to_string(),
                            path: path_hint,
                            timestamp: Utc::now(),
                            description: Some("No persistable evidence payload".to_string()),
                            metadata,
                        })
                    }
                })
                .await;

                if let Ok(Ok(stored)) = res {
                    if let Some(bus) = bus2 {
                        bus.emit(PuppetMasterEvent::EvidenceStored {
                            tier_id: gate_id.to_string(),
                            evidence_type: stored.evidence_type.clone(),
                            path: stored.path.clone(),
                            timestamp: stored.timestamp,
                        });
                    }
                }
            }
        }
    }

    CriterionResult {
        criterion: criterion.clone(),
        passed: verifier_result.passed,
        message: verifier_result.message,
        timestamp: Utc::now(),
    }
}

fn registry_key(criterion: &Criterion) -> String {
    criterion
        .verification_method
        .clone()
        .unwrap_or_else(|| "command".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_gate_runner_empty() {
        let config = GateRunConfig::default();
        let runner = GateRunner::new(config);

        let report = runner.run_gate("task", "TK-001-001", &[], None).await;

        assert!(report.passed);
    }
}
