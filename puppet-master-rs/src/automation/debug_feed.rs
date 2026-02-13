//! Debug feed correlation for automation runs.

use crate::automation::{DebugFeedEvent, DebugSource};
use crate::logging::LogEntry;
use crate::types::PuppetMasterEvent;
use anyhow::{Context, Result};
use chrono::Utc;
use serde::Serialize;
use std::collections::HashMap;
use std::path::{Path, PathBuf};

/// Output paths for persisted debug artifacts.
#[derive(Debug, Clone)]
pub struct DebugBundlePaths {
    pub timeline_path: PathBuf,
    pub summary_path: PathBuf,
}

/// In-memory debug feed collector.
#[derive(Debug, Default)]
pub struct DebugFeedCollector {
    run_id: String,
    events: Vec<DebugFeedEvent>,
}

impl DebugFeedCollector {
    pub fn new(run_id: String) -> Self {
        Self {
            run_id,
            events: Vec::new(),
        }
    }

    pub fn record_system(&mut self, kind: &str, message: &str, payload: serde_json::Value) {
        self.events.push(DebugFeedEvent {
            run_id: self.run_id.clone(),
            step_id: None,
            source: DebugSource::System,
            kind: kind.to_string(),
            message: message.to_string(),
            payload,
            timestamp: Utc::now(),
        });
    }

    pub fn record_step(
        &mut self,
        step_id: &str,
        kind: &str,
        message: &str,
        payload: serde_json::Value,
    ) {
        self.events.push(DebugFeedEvent {
            run_id: self.run_id.clone(),
            step_id: Some(step_id.to_string()),
            source: DebugSource::Step,
            kind: kind.to_string(),
            message: message.to_string(),
            payload,
            timestamp: Utc::now(),
        });
    }

    pub fn record_backend_event(&mut self, event: &PuppetMasterEvent) {
        let payload = serde_json::to_value(event).unwrap_or_else(|_| serde_json::json!({}));
        let kind = event_type_name(event).to_string();
        self.events.push(DebugFeedEvent {
            run_id: self.run_id.clone(),
            step_id: None,
            source: DebugSource::BackendEvent,
            kind,
            message: "backend event observed".to_string(),
            payload,
            timestamp: Utc::now(),
        });
    }

    pub fn record_log_entry(&mut self, entry: &LogEntry) {
        self.events.push(DebugFeedEvent {
            run_id: self.run_id.clone(),
            step_id: None,
            source: DebugSource::Log,
            kind: format!("{:?}", entry.level).to_lowercase(),
            message: entry.message.clone(),
            payload: serde_json::json!({
                "timestamp": entry.timestamp,
                "raw": entry.raw,
            }),
            timestamp: Utc::now(),
        });
    }

    pub fn events(&self) -> &[DebugFeedEvent] {
        &self.events
    }

    pub fn write_bundle(&self, root: &Path) -> Result<DebugBundlePaths> {
        std::fs::create_dir_all(root)
            .with_context(|| format!("Failed to create debug root {}", root.display()))?;

        let timeline_path = root.join("timeline.jsonl");
        let summary_path = root.join("summary.md");

        write_jsonl(&timeline_path, &self.events)?;
        write_summary(&summary_path, &self.events)?;

        Ok(DebugBundlePaths {
            timeline_path,
            summary_path,
        })
    }
}

fn event_type_name(event: &PuppetMasterEvent) -> &'static str {
    match event {
        PuppetMasterEvent::StateChanged { .. } => "state_changed",
        PuppetMasterEvent::TierChanged { .. } => "tier_changed",
        PuppetMasterEvent::IterationStart { .. } => "iteration_start",
        PuppetMasterEvent::IterationComplete { .. } => "iteration_complete",
        PuppetMasterEvent::GateStart { .. } => "gate_start",
        PuppetMasterEvent::GateComplete { .. } => "gate_complete",
        PuppetMasterEvent::BudgetUpdate { .. } => "budget_update",
        PuppetMasterEvent::Log { .. } => "log",
        PuppetMasterEvent::Error { .. } => "error",
        PuppetMasterEvent::Output { .. } => "output",
        PuppetMasterEvent::Progress { .. } => "progress",
        PuppetMasterEvent::ProjectLoaded { .. } => "project_loaded",
        PuppetMasterEvent::AgentsUpdated { .. } => "agents_updated",
        PuppetMasterEvent::Commit { .. } => "commit",
        PuppetMasterEvent::ProcessKilled { .. } => "process_killed",
        PuppetMasterEvent::StartChainStep { .. } => "start_chain_step",
        PuppetMasterEvent::StartChainComplete { .. } => "start_chain_complete",
        PuppetMasterEvent::ParallelExecutionStarted { .. } => "parallel_execution_started",
        PuppetMasterEvent::ParallelExecutionCompleted { .. } => "parallel_execution_completed",
        PuppetMasterEvent::ParallelSubtaskCompleted { .. } => "parallel_subtask_completed",
        PuppetMasterEvent::ParallelSubtaskError { .. } => "parallel_subtask_error",
        PuppetMasterEvent::ReplanComplete { .. } => "replan_complete",
        PuppetMasterEvent::ItemReopened { .. } => "item_reopened",
        PuppetMasterEvent::ReviewerVerdict { .. } => "reviewer_verdict",
        PuppetMasterEvent::Timeout { .. } => "timeout",
        PuppetMasterEvent::Escalation { .. } => "escalation",
        PuppetMasterEvent::RetryAttempt { .. } => "retry_attempt",
        PuppetMasterEvent::BranchCreated { .. } => "branch_created",
        PuppetMasterEvent::BranchMerged { .. } => "branch_merged",
        PuppetMasterEvent::PullRequestCreated { .. } => "pull_request_created",
        PuppetMasterEvent::EvidenceStored { .. } => "evidence_stored",
        PuppetMasterEvent::SessionStarted { .. } => "session_started",
        PuppetMasterEvent::SessionEnded { .. } => "session_ended",
        PuppetMasterEvent::ConfigLoaded { .. } => "config_loaded",
        PuppetMasterEvent::ConfigValidationError { .. } => "config_validation_error",
        PuppetMasterEvent::OrchestratorPaused { .. } => "orchestrator_paused",
        PuppetMasterEvent::OrchestratorResumed { .. } => "orchestrator_resumed",
        PuppetMasterEvent::UserInteractionRequired { .. } => "user_interaction_required",
        PuppetMasterEvent::Custom { .. } => "custom",
    }
}

fn write_jsonl<T: Serialize>(path: &Path, items: &[T]) -> Result<()> {
    let mut out = String::new();
    for item in items {
        out.push_str(
            &serde_json::to_string(item).context("Failed to serialize debug timeline entry")?,
        );
        out.push('\n');
    }

    std::fs::write(path, out)
        .with_context(|| format!("Failed to write debug timeline {}", path.display()))
}

fn write_summary(path: &Path, events: &[DebugFeedEvent]) -> Result<()> {
    let mut by_source: HashMap<String, usize> = HashMap::new();
    let mut by_kind: HashMap<String, usize> = HashMap::new();

    for event in events {
        *by_source
            .entry(format!("{:?}", event.source).to_lowercase())
            .or_insert(0) += 1;
        *by_kind.entry(event.kind.clone()).or_insert(0) += 1;
    }

    let mut content = String::new();
    content.push_str("# GUI Automation Debug Summary\n\n");
    content.push_str(&format!("Total events: {}\n\n", events.len()));

    content.push_str("## By Source\n\n");
    for (source, count) in by_source {
        content.push_str(&format!("- {}: {}\n", source, count));
    }

    content.push_str("\n## Top Event Kinds\n\n");
    let mut kinds: Vec<(String, usize)> = by_kind.into_iter().collect();
    kinds.sort_by(|a, b| b.1.cmp(&a.1));
    for (kind, count) in kinds.into_iter().take(20) {
        content.push_str(&format!("- {}: {}\n", kind, count));
    }

    std::fs::write(path, content)
        .with_context(|| format!("Failed to write debug summary {}", path.display()))
}
