//! Permission audit logging for platform operations
//!
//! This module provides comprehensive audit logging for permission-related events:
//! - Tool approvals and rejections
//! - File access attempts
//! - Shell command executions
//! - Interactive prompts and responses
//!
//! Audit logs are persisted to `.puppet-master/audit/permissions.jsonl` in JSONL format
//! for efficient querying and long-term storage.

use crate::types::Platform;
use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use log::{debug, error, info};
use serde::{Deserialize, Serialize};
use std::fs::{self, File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tokio::sync::Mutex;

/// Permission event type
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum PermissionAction {
    /// Tool usage approval/rejection
    ToolApproval,
    /// File read access
    FileRead,
    /// File write access
    FileWrite,
    /// Shell command execution
    ShellCommand,
    /// Interactive prompt response
    InteractivePrompt,
    /// API access
    ApiAccess,
}

impl std::fmt::Display for PermissionAction {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PermissionAction::ToolApproval => write!(f, "tool_approval"),
            PermissionAction::FileRead => write!(f, "file_read"),
            PermissionAction::FileWrite => write!(f, "file_write"),
            PermissionAction::ShellCommand => write!(f, "shell_command"),
            PermissionAction::InteractivePrompt => write!(f, "interactive_prompt"),
            PermissionAction::ApiAccess => write!(f, "api_access"),
        }
    }
}

/// Permission event details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionEvent {
    /// Unique event ID
    pub id: String,
    /// Timestamp of event
    pub timestamp: DateTime<Utc>,
    /// Platform that requested permission
    pub platform: Platform,
    /// Type of permission action
    pub action: PermissionAction,
    /// Tool name (if applicable)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_name: Option<String>,
    /// Whether permission was approved
    pub approved: bool,
    /// Additional details about the event
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<String>,
    /// File path (for file operations)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file_path: Option<String>,
    /// Command (for shell operations)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub command: Option<String>,
    /// User who approved/rejected (if known)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user: Option<String>,
    /// Session ID for grouping related events
    #[serde(skip_serializing_if = "Option::is_none")]
    pub session_id: Option<String>,
}

impl PermissionEvent {
    /// Create a new permission event
    pub fn new(platform: Platform, action: PermissionAction, approved: bool) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: Utc::now(),
            platform,
            action,
            tool_name: None,
            approved,
            details: None,
            file_path: None,
            command: None,
            user: None,
            session_id: None,
        }
    }

    /// Set tool name
    pub fn with_tool(mut self, tool_name: impl Into<String>) -> Self {
        self.tool_name = Some(tool_name.into());
        self
    }

    /// Set details
    pub fn with_details(mut self, details: impl Into<String>) -> Self {
        self.details = Some(details.into());
        self
    }

    /// Set file path
    pub fn with_file_path(mut self, path: impl Into<String>) -> Self {
        self.file_path = Some(path.into());
        self
    }

    /// Set command
    pub fn with_command(mut self, command: impl Into<String>) -> Self {
        self.command = Some(command.into());
        self
    }

    /// Set user
    pub fn with_user(mut self, user: impl Into<String>) -> Self {
        self.user = Some(user.into());
        self
    }

    /// Set session ID
    pub fn with_session_id(mut self, session_id: impl Into<String>) -> Self {
        self.session_id = Some(session_id.into());
        self
    }
}

/// Query parameters for audit log
#[derive(Debug, Clone, Default)]
pub struct AuditQuery {
    /// Filter by platform
    pub platform: Option<Platform>,
    /// Filter by action type
    pub action: Option<PermissionAction>,
    /// Filter by approval status
    pub approved: Option<bool>,
    /// Filter by time range (start)
    pub start_time: Option<DateTime<Utc>>,
    /// Filter by time range (end)
    pub end_time: Option<DateTime<Utc>>,
    /// Filter by tool name
    pub tool_name: Option<String>,
    /// Filter by session ID
    pub session_id: Option<String>,
    /// Maximum number of results
    pub limit: Option<usize>,
}

impl AuditQuery {
    /// Create a new empty query
    pub fn new() -> Self {
        Self::default()
    }

    /// Filter by platform
    pub fn platform(mut self, platform: Platform) -> Self {
        self.platform = Some(platform);
        self
    }

    /// Filter by action
    pub fn action(mut self, action: PermissionAction) -> Self {
        self.action = Some(action);
        self
    }

    /// Filter by approval status
    pub fn approved(mut self, approved: bool) -> Self {
        self.approved = Some(approved);
        self
    }

    /// Filter by time range
    pub fn time_range(mut self, start: DateTime<Utc>, end: DateTime<Utc>) -> Self {
        self.start_time = Some(start);
        self.end_time = Some(end);
        self
    }

    /// Filter by tool name
    pub fn tool_name(mut self, tool_name: impl Into<String>) -> Self {
        self.tool_name = Some(tool_name.into());
        self
    }

    /// Filter by session ID
    pub fn session_id(mut self, session_id: impl Into<String>) -> Self {
        self.session_id = Some(session_id.into());
        self
    }

    /// Limit number of results
    pub fn limit(mut self, limit: usize) -> Self {
        self.limit = Some(limit);
        self
    }

    /// Check if an event matches this query
    fn matches(&self, event: &PermissionEvent) -> bool {
        if let Some(platform) = self.platform {
            if event.platform != platform {
                return false;
            }
        }

        if let Some(ref action) = self.action {
            if &event.action != action {
                return false;
            }
        }

        if let Some(approved) = self.approved {
            if event.approved != approved {
                return false;
            }
        }

        if let Some(start) = self.start_time {
            if event.timestamp < start {
                return false;
            }
        }

        if let Some(end) = self.end_time {
            if event.timestamp > end {
                return false;
            }
        }

        if let Some(ref tool_name) = self.tool_name {
            if event.tool_name.as_ref() != Some(tool_name) {
                return false;
            }
        }

        if let Some(ref session_id) = self.session_id {
            if event.session_id.as_ref() != Some(session_id) {
                return false;
            }
        }

        true
    }
}

/// Permission audit logger
pub struct PermissionAudit {
    /// Path to audit log file
    log_path: PathBuf,
    /// File handle (mutex protected for thread safety)
    file_handle: Arc<Mutex<Option<File>>>,
}

impl PermissionAudit {
    /// Create a new permission audit logger
    pub fn new(base_dir: impl AsRef<Path>) -> Result<Self> {
        let audit_dir = base_dir.as_ref().join(".puppet-master").join("audit");
        fs::create_dir_all(&audit_dir).context("Failed to create audit directory")?;

        let log_path = audit_dir.join("permissions.jsonl");

        Ok(Self {
            log_path,
            file_handle: Arc::new(Mutex::new(None)),
        })
    }

    /// Get default audit logger (in home directory)
    pub fn default_location() -> Result<Self> {
        let home = directories::BaseDirs::new()
            .context("Failed to get home directory")?
            .home_dir()
            .to_path_buf();
        Self::new(home)
    }

    /// Open the log file for writing
    async fn open_file(&self) -> Result<()> {
        let mut handle = self.file_handle.lock().await;
        if handle.is_none() {
            let file = OpenOptions::new()
                .create(true)
                .append(true)
                .open(&self.log_path)
                .context("Failed to open audit log file")?;
            *handle = Some(file);
            debug!("Opened audit log: {:?}", self.log_path);
        }
        Ok(())
    }

    /// Log a permission event
    pub async fn log(&self, event: PermissionEvent) -> Result<()> {
        self.open_file().await?;

        let json = serde_json::to_string(&event).context("Failed to serialize permission event")?;

        let mut handle = self.file_handle.lock().await;
        if let Some(file) = handle.as_mut() {
            writeln!(file, "{}", json).context("Failed to write to audit log")?;
            file.flush().context("Failed to flush audit log")?;

            info!(
                "Audit: {} - {} - {} ({})",
                event.platform,
                event.action,
                if event.approved {
                    "APPROVED"
                } else {
                    "REJECTED"
                },
                event.id
            );
        }

        Ok(())
    }

    /// Log a tool approval event
    pub async fn log_tool_approval(
        &self,
        platform: Platform,
        tool_name: impl Into<String>,
        approved: bool,
    ) -> Result<()> {
        let event = PermissionEvent::new(platform, PermissionAction::ToolApproval, approved)
            .with_tool(tool_name);
        self.log(event).await
    }

    /// Log a file access event
    pub async fn log_file_access(
        &self,
        platform: Platform,
        file_path: impl Into<String>,
        write: bool,
        approved: bool,
    ) -> Result<()> {
        let action = if write {
            PermissionAction::FileWrite
        } else {
            PermissionAction::FileRead
        };
        let event = PermissionEvent::new(platform, action, approved).with_file_path(file_path);
        self.log(event).await
    }

    /// Log a shell command event
    pub async fn log_shell_command(
        &self,
        platform: Platform,
        command: impl Into<String>,
        approved: bool,
    ) -> Result<()> {
        let event = PermissionEvent::new(platform, PermissionAction::ShellCommand, approved)
            .with_command(command);
        self.log(event).await
    }

    /// Query audit log
    pub async fn query(&self, query: AuditQuery) -> Result<Vec<PermissionEvent>> {
        if !self.log_path.exists() {
            return Ok(Vec::new());
        }

        let file = File::open(&self.log_path).context("Failed to open audit log for reading")?;
        let reader = BufReader::new(file);

        let mut results = Vec::new();

        for line in reader.lines() {
            let line = line.context("Failed to read audit log line")?;
            if line.trim().is_empty() {
                continue;
            }

            match serde_json::from_str::<PermissionEvent>(&line) {
                Ok(event) => {
                    if query.matches(&event) {
                        results.push(event);

                        if let Some(limit) = query.limit {
                            if results.len() >= limit {
                                break;
                            }
                        }
                    }
                }
                Err(e) => {
                    error!("Failed to parse audit log entry: {}", e);
                }
            }
        }

        Ok(results)
    }

    /// Get all events for a platform
    pub async fn get_by_platform(&self, platform: Platform) -> Result<Vec<PermissionEvent>> {
        self.query(AuditQuery::new().platform(platform)).await
    }

    /// Get recent events (last N)
    pub async fn get_recent(&self, limit: usize) -> Result<Vec<PermissionEvent>> {
        self.query(AuditQuery::new().limit(limit)).await
    }

    /// Get events in time range
    pub async fn get_by_time_range(
        &self,
        start: DateTime<Utc>,
        end: DateTime<Utc>,
    ) -> Result<Vec<PermissionEvent>> {
        self.query(AuditQuery::new().time_range(start, end)).await
    }

    /// Get approval statistics for a platform
    pub async fn get_approval_stats(&self, platform: Platform) -> Result<ApprovalStats> {
        let events = self.get_by_platform(platform).await?;

        let mut stats = ApprovalStats {
            platform,
            total_events: events.len(),
            approved_count: 0,
            rejected_count: 0,
            by_action: std::collections::HashMap::new(),
        };

        for event in events {
            if event.approved {
                stats.approved_count += 1;
            } else {
                stats.rejected_count += 1;
            }

            let action_stats = stats
                .by_action
                .entry(event.action.clone())
                .or_insert_with(|| ActionStats {
                    total: 0,
                    approved: 0,
                    rejected: 0,
                });

            action_stats.total += 1;
            if event.approved {
                action_stats.approved += 1;
            } else {
                action_stats.rejected += 1;
            }
        }

        Ok(stats)
    }

    /// Clear old audit logs (older than specified duration)
    pub async fn clear_old_logs(&self, older_than: chrono::Duration) -> Result<usize> {
        let cutoff = Utc::now() - older_than;

        if !self.log_path.exists() {
            return Ok(0);
        }

        let file = File::open(&self.log_path).context("Failed to open audit log for reading")?;
        let reader = BufReader::new(file);

        let mut kept_events = Vec::new();
        let mut removed_count = 0;

        for line in reader.lines() {
            let line = line.context("Failed to read audit log line")?;
            if line.trim().is_empty() {
                continue;
            }

            match serde_json::from_str::<PermissionEvent>(&line) {
                Ok(event) => {
                    if event.timestamp >= cutoff {
                        kept_events.push(line);
                    } else {
                        removed_count += 1;
                    }
                }
                Err(_) => {
                    // Keep malformed lines to avoid data loss
                    kept_events.push(line);
                }
            }
        }

        // Rewrite the log file with only kept events
        let temp_path = self.log_path.with_extension("jsonl.tmp");
        let mut temp_file =
            File::create(&temp_path).context("Failed to create temporary audit log")?;

        for line in kept_events {
            writeln!(temp_file, "{}", line).context("Failed to write to temporary audit log")?;
        }

        temp_file
            .flush()
            .context("Failed to flush temporary audit log")?;
        drop(temp_file);

        // Replace old log with new one
        fs::rename(&temp_path, &self.log_path).context("Failed to replace audit log")?;

        // Close the file handle so it can be reopened
        let mut handle = self.file_handle.lock().await;
        *handle = None;

        info!("Cleared {} old audit log entries", removed_count);
        Ok(removed_count)
    }
}

/// Approval statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApprovalStats {
    pub platform: Platform,
    pub total_events: usize,
    pub approved_count: usize,
    pub rejected_count: usize,
    pub by_action: std::collections::HashMap<PermissionAction, ActionStats>,
}

/// Statistics per action type
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionStats {
    pub total: usize,
    pub approved: usize,
    pub rejected: usize,
}

impl ApprovalStats {
    /// Get approval rate (0.0 to 1.0)
    pub fn approval_rate(&self) -> f64 {
        if self.total_events == 0 {
            0.0
        } else {
            self.approved_count as f64 / self.total_events as f64
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_permission_event_builder() {
        let event = PermissionEvent::new(Platform::Cursor, PermissionAction::ToolApproval, true)
            .with_tool("bash")
            .with_details("Execute build script");

        assert_eq!(event.platform, Platform::Cursor);
        assert_eq!(event.action, PermissionAction::ToolApproval);
        assert!(event.approved);
        assert_eq!(event.tool_name, Some("bash".to_string()));
        assert_eq!(event.details, Some("Execute build script".to_string()));
    }

    #[tokio::test]
    async fn test_audit_log_creation() {
        let temp_dir = TempDir::new().unwrap();
        let audit = PermissionAudit::new(temp_dir.path()).unwrap();

        let event = PermissionEvent::new(Platform::Cursor, PermissionAction::ToolApproval, true);
        audit.log(event).await.unwrap();

        assert!(
            temp_dir
                .path()
                .join(".puppet-master/audit/permissions.jsonl")
                .exists()
        );
    }

    #[tokio::test]
    async fn test_audit_query() {
        let temp_dir = TempDir::new().unwrap();
        let audit = PermissionAudit::new(temp_dir.path()).unwrap();

        // Log several events
        audit
            .log_tool_approval(Platform::Cursor, "bash", true)
            .await
            .unwrap();
        audit
            .log_tool_approval(Platform::Codex, "python", false)
            .await
            .unwrap();
        audit
            .log_file_access(Platform::Cursor, "/tmp/test.txt", true, true)
            .await
            .unwrap();

        // Query by platform
        let cursor_events = audit.get_by_platform(Platform::Cursor).await.unwrap();
        assert_eq!(cursor_events.len(), 2);

        // Query by action
        let tool_events = audit
            .query(AuditQuery::new().action(PermissionAction::ToolApproval))
            .await
            .unwrap();
        assert_eq!(tool_events.len(), 2);

        // Query by approval status
        let approved_events = audit.query(AuditQuery::new().approved(true)).await.unwrap();
        assert_eq!(approved_events.len(), 2);
    }

    #[tokio::test]
    async fn test_approval_stats() {
        let temp_dir = TempDir::new().unwrap();
        let audit = PermissionAudit::new(temp_dir.path()).unwrap();

        audit
            .log_tool_approval(Platform::Cursor, "bash", true)
            .await
            .unwrap();
        audit
            .log_tool_approval(Platform::Cursor, "python", true)
            .await
            .unwrap();
        audit
            .log_tool_approval(Platform::Cursor, "rm", false)
            .await
            .unwrap();

        let stats = audit.get_approval_stats(Platform::Cursor).await.unwrap();

        assert_eq!(stats.total_events, 3);
        assert_eq!(stats.approved_count, 2);
        assert_eq!(stats.rejected_count, 1);
        assert_eq!(stats.approval_rate(), 2.0 / 3.0);
    }

    #[tokio::test]
    async fn test_clear_old_logs() {
        let temp_dir = TempDir::new().unwrap();
        let audit = PermissionAudit::new(temp_dir.path()).unwrap();

        // Log some events
        for _ in 0..5 {
            audit
                .log_tool_approval(Platform::Cursor, "bash", true)
                .await
                .unwrap();
        }

        // Clear logs older than 1 hour (should clear nothing since events are recent)
        let removed = audit
            .clear_old_logs(chrono::Duration::hours(1))
            .await
            .unwrap();
        assert_eq!(removed, 0);

        // Query should still return all events
        let events = audit.get_by_platform(Platform::Cursor).await.unwrap();
        assert_eq!(events.len(), 5);
    }

    #[test]
    fn test_audit_query_builder() {
        let query = AuditQuery::new()
            .platform(Platform::Cursor)
            .action(PermissionAction::ToolApproval)
            .approved(true)
            .limit(10);

        assert_eq!(query.platform, Some(Platform::Cursor));
        assert_eq!(query.action, Some(PermissionAction::ToolApproval));
        assert_eq!(query.approved, Some(true));
        assert_eq!(query.limit, Some(10));
    }
}
