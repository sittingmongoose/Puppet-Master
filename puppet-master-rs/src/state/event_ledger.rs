//! Event Ledger
//!
//! SQLite-based event logging system with:
//! - WAL mode for concurrent access
//! - Event storage with flexible querying
//! - State snapshot support

use crate::types::PuppetMasterEvent;
use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use rusqlite::{Connection, OptionalExtension, params};
use serde_json;
use std::path::Path;
use std::sync::{Arc, Mutex};

// DRY:DATA:EventLedger
/// Thread-safe event ledger
#[derive(Clone)]
pub struct EventLedger {
    inner: Arc<Mutex<Connection>>,
}

impl EventLedger {
    // DRY:FN:new
    /// Create a new event ledger
    pub fn new(path: impl AsRef<Path>) -> Result<Self> {
        let path = path.as_ref();

        // Create parent directory
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)
                .with_context(|| format!("Failed to create directory {}", parent.display()))?;
        }

        let conn = Connection::open(path)
            .with_context(|| format!("Failed to open event database at {}", path.display()))?;

        // Enable WAL mode for better concurrency
        conn.execute_batch("PRAGMA journal_mode=WAL;")
            .context("Failed to enable WAL mode")?;

        // Create table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS events (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                type TEXT NOT NULL,
                tier_id TEXT,
                session_id TEXT,
                data TEXT NOT NULL,
                indexed_at TEXT DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )
        .context("Failed to create events table")?;

        // Create indexes for common queries
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)",
            [],
        )?;
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_events_type ON events(type)",
            [],
        )?;
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_events_tier_id ON events(tier_id)",
            [],
        )?;
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id)",
            [],
        )?;

        log::info!("Event ledger initialized at {}", path.display());

        Ok(Self {
            inner: Arc::new(Mutex::new(conn)),
        })
    }

    // DRY:FN:insert_event
    /// Insert an event into the ledger
    pub fn insert_event(&self, event: PuppetMasterEvent) -> Result<String> {
        let conn = self.inner.lock().unwrap();

        let id = uuid::Uuid::new_v4().to_string();
        let timestamp = Utc::now().to_rfc3339();
        let event_type = Self::get_event_type(&event);
        let tier_id = Self::get_tier_id(&event);
        let session_id = Self::get_session_id(&event);
        let data = serde_json::to_string(&event).context("Failed to serialize event")?;

        conn.execute(
            "INSERT INTO events (id, timestamp, type, tier_id, session_id, data) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, timestamp, event_type, tier_id, session_id, data],
        )
        .context("Failed to insert event")?;

        log::trace!("Inserted event {} of type {}", id, event_type);
        Ok(id)
    }

    /// Get event type string from variant
    fn get_event_type(event: &PuppetMasterEvent) -> String {
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
        .to_string()
    }

    /// Extract tier ID from event
    fn get_tier_id(event: &PuppetMasterEvent) -> Option<String> {
        match event {
            PuppetMasterEvent::TierChanged { tier_id, .. }
            | PuppetMasterEvent::GateStart { tier_id, .. }
            | PuppetMasterEvent::GateComplete { tier_id, .. }
            | PuppetMasterEvent::EvidenceStored { tier_id, .. }
            | PuppetMasterEvent::Error {
                tier_id: Some(tier_id),
                ..
            }
            | PuppetMasterEvent::ReplanComplete { tier_id, .. }
            | PuppetMasterEvent::ReviewerVerdict { tier_id, .. }
            | PuppetMasterEvent::Timeout { tier_id, .. }
            | PuppetMasterEvent::RetryAttempt { tier_id, .. }
            | PuppetMasterEvent::UserInteractionRequired { tier_id, .. } => Some(tier_id.clone()),
            PuppetMasterEvent::IterationStart { item_id, .. }
            | PuppetMasterEvent::IterationComplete { item_id, .. }
            | PuppetMasterEvent::ItemReopened { item_id, .. } => Some(item_id.clone()),
            _ => None,
        }
    }

    /// Extract session ID from event
    fn get_session_id(event: &PuppetMasterEvent) -> Option<String> {
        match event {
            PuppetMasterEvent::IterationStart { session_id, .. } => Some(session_id.clone()),
            PuppetMasterEvent::SessionStarted { session_id, .. }
            | PuppetMasterEvent::SessionEnded { session_id, .. } => Some(session_id.clone()),
            _ => None,
        }
    }

    // DRY:FN:query_events
    /// Query events with filters
    pub fn query_events(&self, filters: EventFilters) -> Result<Vec<EventRecord>> {
        let conn = self.inner.lock().unwrap();

        let mut query =
            "SELECT id, timestamp, type, tier_id, session_id, data FROM events WHERE 1=1"
                .to_string();
        let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

        if let Some(event_type) = &filters.event_type {
            query.push_str(" AND type = ?");
            params.push(Box::new(event_type.clone()));
        }

        if let Some(tier_id) = &filters.tier_id {
            query.push_str(" AND tier_id = ?");
            params.push(Box::new(tier_id.clone()));
        }

        if let Some(session_id) = &filters.session_id {
            query.push_str(" AND session_id = ?");
            params.push(Box::new(session_id.clone()));
        }

        if let Some(after) = &filters.after {
            query.push_str(" AND timestamp >= ?");
            params.push(Box::new(after.to_rfc3339()));
        }

        if let Some(before) = &filters.before {
            query.push_str(" AND timestamp <= ?");
            params.push(Box::new(before.to_rfc3339()));
        }

        if filters.order_desc {
            query.push_str(" ORDER BY timestamp DESC");
        } else {
            query.push_str(" ORDER BY timestamp ASC");
        }

        if let Some(limit) = filters.limit {
            query.push_str(" LIMIT ?");
            params.push(Box::new(limit as i64));
        }

        let mut stmt = conn.prepare(&query)?;
        let param_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|p| p.as_ref()).collect();

        let rows = stmt.query_map(&param_refs[..], |row| {
            Ok(EventRecord {
                id: row.get(0)?,
                timestamp: row.get::<_, String>(1)?,
                event_type: row.get(2)?,
                tier_id: row.get(3)?,
                session_id: row.get(4)?,
                data: row.get(5)?,
            })
        })?;

        let mut records = Vec::new();
        for row in rows {
            records.push(row?);
        }

        Ok(records)
    }

    // DRY:FN:count_events
    /// Count events matching filters
    pub fn count_events(&self, filters: EventFilters) -> Result<usize> {
        let conn = self.inner.lock().unwrap();

        let mut query = "SELECT COUNT(*) FROM events WHERE 1=1".to_string();
        let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

        if let Some(event_type) = &filters.event_type {
            query.push_str(" AND type = ?");
            params.push(Box::new(event_type.clone()));
        }

        if let Some(tier_id) = &filters.tier_id {
            query.push_str(" AND tier_id = ?");
            params.push(Box::new(tier_id.clone()));
        }

        if let Some(session_id) = &filters.session_id {
            query.push_str(" AND session_id = ?");
            params.push(Box::new(session_id.clone()));
        }

        if let Some(after) = &filters.after {
            query.push_str(" AND timestamp >= ?");
            params.push(Box::new(after.to_rfc3339()));
        }

        if let Some(before) = &filters.before {
            query.push_str(" AND timestamp <= ?");
            params.push(Box::new(before.to_rfc3339()));
        }

        let mut stmt = conn.prepare(&query)?;
        let param_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|p| p.as_ref()).collect();

        let count: i64 = stmt.query_row(&param_refs[..], |row| row.get(0))?;
        Ok(count as usize)
    }

    // DRY:FN:save_snapshot
    /// Save state snapshot as a Custom event
    pub fn save_snapshot(&self, snapshot_id: &str, data: &str) -> Result<String> {
        let event = PuppetMasterEvent::Custom {
            event_type: format!("state_snapshot:{}", snapshot_id),
            data: serde_json::Value::String(data.to_string()),
            timestamp: Utc::now(),
        };

        self.insert_event(event)
    }

    // DRY:FN:load_snapshot
    /// Load latest state snapshot
    pub fn load_snapshot(&self) -> Result<Option<String>> {
        let conn = self.inner.lock().unwrap();

        let result: Option<String> = conn
            .query_row(
                "SELECT data FROM events WHERE type = 'custom' AND data LIKE '%state_snapshot%' ORDER BY timestamp DESC LIMIT 1",
                [],
                |row| row.get(0),
            )
            .optional()?;

        Ok(result)
    }
}

// DRY:DATA:EventFilters
/// Event query filters
#[derive(Debug, Default, Clone)]
pub struct EventFilters {
    pub event_type: Option<String>,
    pub tier_id: Option<String>,
    pub session_id: Option<String>,
    pub after: Option<DateTime<Utc>>,
    pub before: Option<DateTime<Utc>>,
    pub order_desc: bool,
    pub limit: Option<usize>,
}

// DRY:DATA:EventRecord
/// Event record from database
#[derive(Debug, Clone)]
pub struct EventRecord {
    pub id: String,
    pub timestamp: String,
    pub event_type: String,
    pub tier_id: Option<String>,
    pub session_id: Option<String>,
    pub data: String,
}

impl EventRecord {
    // DRY:FN:parse_event
    /// Parse the event data
    pub fn parse_event(&self) -> Result<PuppetMasterEvent> {
        serde_json::from_str(&self.data).context("Failed to parse event JSON")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{TierState, TierType};
    use tempfile::TempDir;

    #[test]
    fn test_insert_and_query() {
        let temp_dir = TempDir::new().unwrap();
        let db_path = temp_dir.path().join("events.db");

        let ledger = EventLedger::new(&db_path).unwrap();

        let event = PuppetMasterEvent::TierChanged {
            tier_id: "phase1".to_string(),
            tier_type: TierType::Phase,
            from_state: TierState::Pending,
            to_state: TierState::Running,
            timestamp: chrono::Utc::now(),
        };

        ledger.insert_event(event).unwrap();

        let filters = EventFilters {
            event_type: Some("tier_changed".to_string()),
            ..Default::default()
        };

        let events = ledger.query_events(filters).unwrap();
        assert_eq!(events.len(), 1);
    }

    #[test]
    fn test_count_events() {
        let temp_dir = TempDir::new().unwrap();
        let db_path = temp_dir.path().join("events.db");

        let ledger = EventLedger::new(&db_path).unwrap();

        for i in 0..5 {
            let event = PuppetMasterEvent::TierChanged {
                tier_id: format!("phase{}", i),
                tier_type: TierType::Phase,
                from_state: TierState::Pending,
                to_state: TierState::Running,
                timestamp: chrono::Utc::now(),
            };
            ledger.insert_event(event).unwrap();
        }

        let count = ledger.count_events(EventFilters::default()).unwrap();
        assert_eq!(count, 5);
    }
}
