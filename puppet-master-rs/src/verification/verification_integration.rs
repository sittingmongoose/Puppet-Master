//! Verification integration wiring for EvidenceStore + EventBus.

use crate::logging::BroadcastEventBus;
use crate::state::EvidenceStore;
use crate::types::{GateReport, TestPlan};
use crate::verification::GateRunConfig;
use anyhow::{Context, Result};
use std::path::Path;

use super::{GateRunner, VerifierRegistry};

/// Wires verification components together.
pub struct VerificationIntegration {
    gate_runner: GateRunner,
    evidence_store: EvidenceStore,
    event_bus: BroadcastEventBus,
}

impl VerificationIntegration {
    /// Create a new integration rooted at the repo root.
    pub fn new(repo_root: impl AsRef<Path>, config: GateRunConfig) -> Result<Self> {
        let repo_root = repo_root.as_ref();
        let evidence_root = repo_root.join(".puppet-master").join("evidence");
        let evidence_store = EvidenceStore::new(&evidence_root).with_context(|| {
            format!(
                "Failed to initialize EvidenceStore at {}",
                evidence_root.display()
            )
        })?;
        let event_bus = BroadcastEventBus::new();

        let mut registry = VerifierRegistry::new();
        registry.register_defaults();

        let gate_runner = GateRunner::with_integration(
            registry,
            config,
            evidence_store.clone(),
            event_bus.clone(),
        );

        Ok(Self {
            gate_runner,
            evidence_store,
            event_bus,
        })
    }

    pub fn evidence_store(&self) -> &EvidenceStore {
        &self.evidence_store
    }

    pub fn event_bus(&self) -> &BroadcastEventBus {
        &self.event_bus
    }

    pub async fn run_gate(
        &self,
        gate_type: &str,
        gate_id: &str,
        criteria: &[crate::types::Criterion],
        test_plan: Option<&TestPlan>,
    ) -> GateReport {
        self.gate_runner
            .run_gate(gate_type, gate_id, criteria, test_plan)
            .await
    }
}
