//! Activity Logger
//!
//! Logs activity events (user actions, system events) for audit trail.
//! Maintains a chronological log of all significant events in the orchestration.

use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::PathBuf;

// DRY:HELPER:ActivityLogger
/// Activity logger for audit trail
pub struct ActivityLogger {
    log_path: PathBuf,
}

// DRY:HELPER:ActivityEvent
/// Single activity event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActivityEvent {
    /// When the event occurred
    pub timestamp: DateTime<Utc>,
    /// Type of event
    pub event_type: ActivityEventType,
    /// Human-readable description
    pub description: String,
    /// Additional metadata
    #[serde(default)]
    pub metadata: HashMap<String, String>,
}

impl ActivityEvent {
    // DRY:HELPER:ActivityEvent::new
    /// Create a new activity event
    pub fn new(event_type: ActivityEventType, description: impl Into<String>) -> Self {
        Self {
            timestamp: Utc::now(),
            event_type,
            description: description.into(),
            metadata: HashMap::new(),
        }
    }

    // DRY:HELPER:ActivityEvent::with_metadata
    /// Add metadata
    pub fn with_metadata(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.metadata.insert(key.into(), value.into());
        self
    }

    // DRY:HELPER:ActivityEvent::with_metadata_map
    /// Add multiple metadata entries
    pub fn with_metadata_map(mut self, metadata: HashMap<String, String>) -> Self {
        self.metadata.extend(metadata);
        self
    }

    // DRY:HELPER:ActivityEvent::to_jsonl
    /// Convert to JSONL format
    pub fn to_jsonl(&self) -> Result<String> {
        let json = serde_json::to_string(self).context("Failed to serialize activity event")?;
        Ok(format!("{}\n", json))
    }
}

// DRY:HELPER:ActivityEventType
/// Types of activity events
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ActivityEventType {
    /// Project was created
    ProjectCreated,
    /// Project was opened
    ProjectOpened,
    /// Orchestration started
    OrchestrationStarted,
    /// Orchestration was paused
    OrchestrationPaused,
    /// Orchestration completed
    OrchestrationCompleted,
    /// Configuration changed
    ConfigChanged,
    /// Doctor command run
    DoctorRun,
    /// Platform switched
    PlatformSwitched,
    /// Manual intervention required
    ManualIntervention,
    /// User resumed execution
    UserResume,
    /// User stopped execution
    UserStop,
    /// Gate passed
    GatePassed,
    /// Gate failed
    GateFailed,
    /// Iteration completed
    IterationCompleted,
    /// Error occurred
    ErrorOccurred,
    /// Budget warning
    BudgetWarning,
    /// Budget exceeded
    BudgetExceeded,
    /// File modified
    FileModified,
    /// Git commit created
    GitCommit,
    /// Archive created
    ArchiveCreated,
    /// Pattern promoted
    PatternPromoted,
    /// System event
    SystemEvent,
}

impl std::fmt::Display for ActivityEventType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::ProjectCreated => write!(f, "Project Created"),
            Self::ProjectOpened => write!(f, "Project Opened"),
            Self::OrchestrationStarted => write!(f, "Orchestration Started"),
            Self::OrchestrationPaused => write!(f, "Orchestration Paused"),
            Self::OrchestrationCompleted => write!(f, "Orchestration Completed"),
            Self::ConfigChanged => write!(f, "Config Changed"),
            Self::DoctorRun => write!(f, "Doctor Run"),
            Self::PlatformSwitched => write!(f, "Platform Switched"),
            Self::ManualIntervention => write!(f, "Manual Intervention"),
            Self::UserResume => write!(f, "User Resume"),
            Self::UserStop => write!(f, "User Stop"),
            Self::GatePassed => write!(f, "Gate Passed"),
            Self::GateFailed => write!(f, "Gate Failed"),
            Self::IterationCompleted => write!(f, "Iteration Completed"),
            Self::ErrorOccurred => write!(f, "Error Occurred"),
            Self::BudgetWarning => write!(f, "Budget Warning"),
            Self::BudgetExceeded => write!(f, "Budget Exceeded"),
            Self::FileModified => write!(f, "File Modified"),
            Self::GitCommit => write!(f, "Git Commit"),
            Self::ArchiveCreated => write!(f, "Archive Created"),
            Self::PatternPromoted => write!(f, "Pattern Promoted"),
            Self::SystemEvent => write!(f, "System Event"),
        }
    }
}

impl ActivityLogger {
    // DRY:HELPER:ActivityLogger::new
    /// Create a new activity logger
    pub fn new(log_path: PathBuf) -> Self {
        Self { log_path }
    }

    // DRY:HELPER:ActivityLogger::log
    /// Log an activity event
    pub fn log(&self, event: ActivityEvent) -> Result<()> {
        // Create parent directory if needed
        if let Some(parent) = self.log_path.parent() {
            std::fs::create_dir_all(parent)
                .with_context(|| format!("Failed to create log directory {}", parent.display()))?;
        }

        // Open file in append mode
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.log_path)
            .with_context(|| format!("Failed to open activity log {}", self.log_path.display()))?;

        // Write JSONL entry
        let jsonl = event.to_jsonl()?;
        file.write_all(jsonl.as_bytes())
            .context("Failed to write activity event")?;

        log::trace!(
            "Logged activity: {} - {}",
            event.event_type,
            event.description
        );

        Ok(())
    }

    // DRY:HELPER:ActivityLogger::log_simple
    /// Log a simple event with just type and description
    pub fn log_simple(
        &self,
        event_type: ActivityEventType,
        description: impl Into<String>,
    ) -> Result<()> {
        let event = ActivityEvent::new(event_type, description);
        self.log(event)
    }

    // DRY:HELPER:ActivityLogger::log_with_metadata
    /// Log an event with metadata
    pub fn log_with_metadata(
        &self,
        event_type: ActivityEventType,
        description: impl Into<String>,
        metadata: HashMap<String, String>,
    ) -> Result<()> {
        let event = ActivityEvent::new(event_type, description).with_metadata_map(metadata);
        self.log(event)
    }

    // DRY:HELPER:ActivityLogger::read_all
    /// Read all activity events from the log
    pub fn read_all(&self) -> Result<Vec<ActivityEvent>> {
        if !self.log_path.exists() {
            return Ok(Vec::new());
        }

        let content = std::fs::read_to_string(&self.log_path)
            .with_context(|| format!("Failed to read activity log {}", self.log_path.display()))?;

        let mut events = Vec::new();

        for (line_num, line) in content.lines().enumerate() {
            if line.trim().is_empty() {
                continue;
            }

            match serde_json::from_str::<ActivityEvent>(line) {
                Ok(event) => events.push(event),
                Err(e) => {
                    log::warn!(
                        "Failed to parse activity event at line {}: {}",
                        line_num + 1,
                        e
                    );
                }
            }
        }

        Ok(events)
    }

    // DRY:HELPER:ActivityLogger::read_range
    /// Read events within a time range
    pub fn read_range(
        &self,
        start: DateTime<Utc>,
        end: DateTime<Utc>,
    ) -> Result<Vec<ActivityEvent>> {
        let all_events = self.read_all()?;

        Ok(all_events
            .into_iter()
            .filter(|e| e.timestamp >= start && e.timestamp <= end)
            .collect())
    }

    // DRY:HELPER:ActivityLogger::read_by_type
    /// Read events of a specific type
    pub fn read_by_type(&self, event_type: ActivityEventType) -> Result<Vec<ActivityEvent>> {
        let all_events = self.read_all()?;

        Ok(all_events
            .into_iter()
            .filter(|e| e.event_type == event_type)
            .collect())
    }

    // DRY:HELPER:ActivityLogger::count_by_type
    /// Get event count by type
    pub fn count_by_type(&self) -> Result<HashMap<ActivityEventType, usize>> {
        let all_events = self.read_all()?;
        let mut counts = HashMap::new();

        for event in all_events {
            *counts.entry(event.event_type).or_insert(0) += 1;
        }

        Ok(counts)
    }

    // DRY:HELPER:ActivityLogger::read_recent
    /// Get the most recent N events
    pub fn read_recent(&self, count: usize) -> Result<Vec<ActivityEvent>> {
        let mut events = self.read_all()?;
        events.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        events.truncate(count);
        Ok(events)
    }

    // DRY:HELPER:ActivityLogger::clear
    /// Clear the activity log
    pub fn clear(&self) -> Result<()> {
        if self.log_path.exists() {
            std::fs::remove_file(&self.log_path).with_context(|| {
                format!("Failed to clear activity log {}", self.log_path.display())
            })?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_log_and_read() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("activity.jsonl");
        let logger = ActivityLogger::new(log_path);

        logger
            .log_simple(ActivityEventType::ProjectCreated, "Created test project")
            .unwrap();

        logger
            .log_simple(
                ActivityEventType::OrchestrationStarted,
                "Started orchestration",
            )
            .unwrap();

        let events = logger.read_all().unwrap();
        assert_eq!(events.len(), 2);
        assert_eq!(events[0].event_type, ActivityEventType::ProjectCreated);
        assert_eq!(
            events[1].event_type,
            ActivityEventType::OrchestrationStarted
        );
    }

    #[test]
    fn test_log_with_metadata() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("activity.jsonl");
        let logger = ActivityLogger::new(log_path);

        let mut metadata = HashMap::new();
        metadata.insert("platform".to_string(), "cursor".to_string());
        metadata.insert("model".to_string(), "claude-3".to_string());

        logger
            .log_with_metadata(
                ActivityEventType::PlatformSwitched,
                "Switched to Cursor",
                metadata,
            )
            .unwrap();

        let events = logger.read_all().unwrap();
        assert_eq!(events.len(), 1);
        assert_eq!(events[0].metadata.get("platform").unwrap(), "cursor");
        assert_eq!(events[0].metadata.get("model").unwrap(), "claude-3");
    }

    #[test]
    fn test_read_by_type() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("activity.jsonl");
        let logger = ActivityLogger::new(log_path);

        logger
            .log_simple(ActivityEventType::ProjectCreated, "Created")
            .unwrap();
        logger
            .log_simple(ActivityEventType::GatePassed, "Gate 1 passed")
            .unwrap();
        logger
            .log_simple(ActivityEventType::GatePassed, "Gate 2 passed")
            .unwrap();

        let gate_events = logger.read_by_type(ActivityEventType::GatePassed).unwrap();
        assert_eq!(gate_events.len(), 2);
    }

    #[test]
    fn test_count_by_type() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("activity.jsonl");
        let logger = ActivityLogger::new(log_path);

        logger
            .log_simple(ActivityEventType::GatePassed, "Gate 1")
            .unwrap();
        logger
            .log_simple(ActivityEventType::GatePassed, "Gate 2")
            .unwrap();
        logger
            .log_simple(ActivityEventType::GateFailed, "Gate 3")
            .unwrap();

        let counts = logger.count_by_type().unwrap();
        assert_eq!(counts.get(&ActivityEventType::GatePassed), Some(&2));
        assert_eq!(counts.get(&ActivityEventType::GateFailed), Some(&1));
    }

    #[test]
    fn test_read_recent() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("activity.jsonl");
        let logger = ActivityLogger::new(log_path);

        for i in 0..10 {
            logger
                .log_simple(ActivityEventType::SystemEvent, format!("Event {}", i))
                .unwrap();
            std::thread::sleep(std::time::Duration::from_millis(5));
        }

        let recent = logger.read_recent(3).unwrap();
        assert_eq!(recent.len(), 3);
        // Should be in reverse chronological order
        assert!(recent[0].description.contains("Event 9"));
    }

    #[test]
    fn test_clear() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("activity.jsonl");
        let logger = ActivityLogger::new(log_path.clone());

        logger
            .log_simple(ActivityEventType::SystemEvent, "Test")
            .unwrap();

        assert!(log_path.exists());
        logger.clear().unwrap();
        assert!(!log_path.exists());
    }
}
