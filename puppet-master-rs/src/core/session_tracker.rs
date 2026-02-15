//! Session tracking and management
//!
//! Generates unique session IDs and tracks lifecycle:
//! - Session ID format: PM-YYYY-MM-DD-HH-MM-SS-NNN
//! - JSONL logging for audit trail
//! - Session state transitions

use crate::types::*;
use anyhow::Result;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::{File, OpenOptions};
use std::io::{BufWriter, Write};
use std::path::PathBuf;
use std::sync::Mutex;

// DRY:DATA:SessionTracker
/// Session tracker for managing active sessions
#[derive(Debug)]
pub struct SessionTracker {
    /// Active sessions (session_id -> SessionInfo)
    active_sessions: Mutex<HashMap<String, SessionInfo>>,
    /// JSONL log file path
    log_path: PathBuf,
    /// Log file writer (wrapped in mutex for thread safety)
    log_writer: Mutex<Option<BufWriter<File>>>,
    /// Sequence counter for sessions started in the same second
    sequence_counter: Mutex<HashMap<String, u32>>,
}

impl SessionTracker {
    // DRY:FN:new
    /// Create new session tracker
    pub fn new(log_path: PathBuf) -> Result<Self> {
        // Ensure parent directory exists
        if let Some(parent) = log_path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        // Open log file in append mode
        let file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&log_path)?;
        let writer = BufWriter::new(file);

        Ok(Self {
            active_sessions: Mutex::new(HashMap::new()),
            log_path,
            log_writer: Mutex::new(Some(writer)),
            sequence_counter: Mutex::new(HashMap::new()),
        })
    }
    // DRY:FN:generate_session_id

    /// Generate new session ID: PM-YYYY-MM-DD-HH-MM-SS-NNN
    pub fn generate_session_id(&self) -> String {
        let now = Utc::now();
        let timestamp = now.format("%Y-%m-%d-%H-%M-%S").to_string();

        let mut counter = self.sequence_counter.lock().unwrap();
        let seq = counter.entry(timestamp.clone()).or_insert(0);
        *seq += 1;
        let sequence = *seq;
        drop(counter);

        format!("PM-{}-{:03}", timestamp, sequence)
    }
    // DRY:FN:start_session

    /// Start a new session
    pub fn start_session(
        &self,
        tier_id: String,
        tier_type: TierType,
        platform: Platform,
        model: String,
    ) -> Result<String> {
        let session_id = self.generate_session_id();
        let now = Utc::now();

        let info = SessionInfo {
            session_id: session_id.clone(),
            tier_id: tier_id.clone(),
            tier_type,
            platform,
            model: model.clone(),
            started_at: now,
            completed_at: None,
            state: SessionState::Running,
            process_id: None,
        };

        {
            let mut sessions = self.active_sessions.lock().unwrap();
            sessions.insert(session_id.clone(), info.clone());
        }

        self.write_log_entry(&SessionLogEntry::Started {
            session_id: session_id.clone(),
            tier_id,
            platform: format!("{:?}", platform),
            timestamp: now,
        })?;

        Ok(session_id)
    }
    // DRY:FN:complete_session

    /// Complete a session
    pub fn complete_session(&self, session_id: &str) -> Result<()> {
        let now = Utc::now();

        {
            let mut sessions = self.active_sessions.lock().unwrap();
            if let Some(info) = sessions.get_mut(session_id) {
                info.completed_at = Some(now);
                info.state = SessionState::Completed;
            }
        }

        self.write_log_entry(&SessionLogEntry::Completed {
            session_id: session_id.to_string(),
            timestamp: now,
        })?;

        Ok(())
    }
    // DRY:FN:stop_session

    /// Stop a session (user-initiated)
    pub fn stop_session(&self, session_id: &str) -> Result<()> {
        let now = Utc::now();

        {
            let mut sessions = self.active_sessions.lock().unwrap();
            if let Some(info) = sessions.get_mut(session_id) {
                info.completed_at = Some(now);
                info.state = SessionState::Stopped;
            }
        }

        self.write_log_entry(&SessionLogEntry::Stopped {
            session_id: session_id.to_string(),
            timestamp: now,
        })?;

        Ok(())
    }
    // DRY:FN:fail_session

    /// Fail a session
    pub fn fail_session(&self, session_id: &str, error: String) -> Result<()> {
        let now = Utc::now();

        {
            let mut sessions = self.active_sessions.lock().unwrap();
            if let Some(info) = sessions.get_mut(session_id) {
                info.completed_at = Some(now);
                info.state = SessionState::Failed;
            }
        }

        self.write_log_entry(&SessionLogEntry::Failed {
            session_id: session_id.to_string(),
            error,
            timestamp: now,
        })?;

        Ok(())
    }
    // DRY:FN:get_session

    /// Get session info
    pub fn get_session(&self, session_id: &str) -> Option<SessionInfo> {
        let sessions = self.active_sessions.lock().unwrap();
        sessions.get(session_id).cloned()
    }
    // DRY:FN:get_active_sessions

    /// Get all active sessions
    pub fn get_active_sessions(&self) -> Vec<SessionInfo> {
        let sessions = self.active_sessions.lock().unwrap();
        sessions
            .values()
            .filter(|s| s.state == SessionState::Running)
            .cloned()
            .collect()
    }
    // DRY:FN:get_all_sessions

    /// Get all sessions
    pub fn get_all_sessions(&self) -> Vec<SessionInfo> {
        let sessions = self.active_sessions.lock().unwrap();
        sessions.values().cloned().collect()
    }
    // DRY:FN:cleanup_sessions

    /// Remove completed/failed sessions from active list
    pub fn cleanup_sessions(&self) {
        let mut sessions = self.active_sessions.lock().unwrap();
        sessions.retain(|_, info| info.state == SessionState::Running);
    }

    /// Write log entry to JSONL file
    fn write_log_entry(&self, entry: &SessionLogEntry) -> Result<()> {
        let mut writer_lock = self.log_writer.lock().unwrap();
        if let Some(writer) = writer_lock.as_mut() {
            let json = serde_json::to_string(entry)?;
            writeln!(writer, "{}", json)?;
            writer.flush()?;
        }
        Ok(())
    }
    // DRY:FN:log_path

    /// Get log file path
    pub fn log_path(&self) -> &PathBuf {
        &self.log_path
    }
}

/// Session log entry for JSONL
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "event", rename_all = "snake_case")]
enum SessionLogEntry {
    Started {
        session_id: String,
        tier_id: String,
        platform: String,
        timestamp: DateTime<Utc>,
    },
    Completed {
        session_id: String,
        timestamp: DateTime<Utc>,
    },
    Stopped {
        session_id: String,
        timestamp: DateTime<Utc>,
    },
    Failed {
        session_id: String,
        error: String,
        timestamp: DateTime<Utc>,
    },
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_generate_session_id() {
        let dir = tempdir().unwrap();
        let log_path = dir.path().join("sessions.jsonl");
        let tracker = SessionTracker::new(log_path).unwrap();

        let id1 = tracker.generate_session_id();
        let id2 = tracker.generate_session_id();

        assert!(id1.starts_with("PM-"));
        assert!(id2.starts_with("PM-"));
        assert_ne!(id1, id2);
    }

    #[test]
    fn test_session_lifecycle() -> Result<()> {
        let dir = tempdir().unwrap();
        let log_path = dir.path().join("sessions.jsonl");
        let tracker = SessionTracker::new(log_path)?;

        let session_id = tracker.start_session(
            "1.1.1".to_string(),
            TierType::Subtask,
            Platform::Cursor,
            "claude-3-5-sonnet".to_string(),
        )?;

        let active = tracker.get_active_sessions();
        assert_eq!(active.len(), 1);
        assert_eq!(active[0].session_id, session_id);
        assert_eq!(active[0].state, SessionState::Running);

        tracker.complete_session(&session_id)?;

        let info = tracker.get_session(&session_id).unwrap();
        assert_eq!(info.state, SessionState::Completed);
        assert!(info.completed_at.is_some());

        Ok(())
    }

    #[test]
    fn test_stop_session() -> Result<()> {
        let dir = tempdir().unwrap();
        let log_path = dir.path().join("sessions.jsonl");
        let tracker = SessionTracker::new(log_path)?;

        let session_id = tracker.start_session(
            "1.1.1".to_string(),
            TierType::Subtask,
            Platform::Cursor,
            "claude-3-5-sonnet".to_string(),
        )?;

        tracker.stop_session(&session_id)?;

        let info = tracker.get_session(&session_id).unwrap();
        assert_eq!(info.state, SessionState::Stopped);

        Ok(())
    }

    #[test]
    fn test_fail_session() -> Result<()> {
        let dir = tempdir().unwrap();
        let log_path = dir.path().join("sessions.jsonl");
        let tracker = SessionTracker::new(log_path)?;

        let session_id = tracker.start_session(
            "1.1.1".to_string(),
            TierType::Subtask,
            Platform::Cursor,
            "claude-3-5-sonnet".to_string(),
        )?;

        tracker.fail_session(&session_id, "Test error".to_string())?;

        let info = tracker.get_session(&session_id).unwrap();
        assert_eq!(info.state, SessionState::Failed);

        Ok(())
    }

    #[test]
    fn test_cleanup_sessions() -> Result<()> {
        let dir = tempdir().unwrap();
        let log_path = dir.path().join("sessions.jsonl");
        let tracker = SessionTracker::new(log_path)?;

        let id1 = tracker.start_session(
            "1.1.1".to_string(),
            TierType::Subtask,
            Platform::Cursor,
            "model".to_string(),
        )?;
        let id2 = tracker.start_session(
            "1.1.2".to_string(),
            TierType::Subtask,
            Platform::Cursor,
            "model".to_string(),
        )?;

        tracker.complete_session(&id1)?;

        tracker.cleanup_sessions();

        let active = tracker.get_active_sessions();
        assert_eq!(active.len(), 1);
        assert_eq!(active[0].session_id, id2);

        Ok(())
    }

    #[test]
    fn test_multiple_sessions_same_second() {
        let dir = tempdir().unwrap();
        let log_path = dir.path().join("sessions.jsonl");
        let tracker = SessionTracker::new(log_path).unwrap();

        let mut ids = Vec::new();
        for _ in 0..5 {
            ids.push(tracker.generate_session_id());
        }

        for i in 0..ids.len() {
            for j in (i + 1)..ids.len() {
                assert_ne!(ids[i], ids[j]);
            }
        }
    }
}
