//! Progress Manager
//!
//! Manages the progress.txt file with append-only markdown format:
//! - Session ID generation (PM-YYYY-MM-DD-HH-MM-SS-NNN)
//! - Append progress entries in structured format
//! - Parse and read existing entries

use crate::types::{ItemStatus, ProgressEntry};
use anyhow::{Context, Result};
use chrono::Utc;
use std::fs::{File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};

// DRY:DATA:ProgressManager
/// Thread-safe progress manager
#[derive(Clone)]
pub struct ProgressManager {
    inner: Arc<Mutex<ProgressManagerInner>>,
}

struct ProgressManagerInner {
    path: PathBuf,
    session_counter: u32,
}

impl ProgressManager {
    // DRY:FN:new
    /// Create a new progress manager
    pub fn new(path: impl AsRef<Path>) -> Result<Self> {
        let path = path.as_ref().to_path_buf();

        // Create parent directory if it doesn't exist
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)
                .with_context(|| format!("Failed to create directory {}", parent.display()))?;
        }

        // Create file if it doesn't exist
        if !path.exists() {
            File::create(&path)
                .with_context(|| format!("Failed to create progress file {}", path.display()))?;
        }

        Ok(Self {
            inner: Arc::new(Mutex::new(ProgressManagerInner {
                path,
                session_counter: 0,
            })),
        })
    }

    // DRY:FN:generate_session_id
    /// Generate a new session ID
    pub fn generate_session_id(&self) -> String {
        let mut inner = self.inner.lock().unwrap();
        inner.session_counter += 1;

        let now = Utc::now();
        format!(
            "PM-{}-{:03}",
            now.format("%Y-%m-%d-%H-%M-%S"),
            inner.session_counter
        )
    }

    // DRY:FN:append_entry
    /// Append a progress entry
    pub fn append_entry(&self, entry: &ProgressEntry) -> Result<()> {
        let inner = self.inner.lock().unwrap();

        // Create parent directory if needed
        if let Some(parent) = inner.path.parent() {
            std::fs::create_dir_all(parent).with_context(|| {
                format!("Failed to create progress directory {}", parent.display())
            })?;
        }

        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&inner.path)
            .with_context(|| format!("Failed to open progress file {}", inner.path.display()))?;

        // Format the entry
        let content = self.format_entry(entry);

        file.write_all(content.as_bytes()).with_context(|| {
            format!("Failed to write to progress file {}", inner.path.display())
        })?;

        log::debug!("Appended progress entry for {}", entry.item_id);
        Ok(())
    }

    /// Format a progress entry as markdown
    fn format_entry(&self, entry: &ProgressEntry) -> String {
        let mut content = String::new();

        content.push_str(&format!("\n## {} ({})\n", entry.item_id, entry.status));
        content.push_str(&format!("- Progress: {:.1}%\n", entry.progress));
        content.push_str(&format!(
            "- Timestamp: {}\n",
            entry.timestamp.format("%Y-%m-%d %H:%M:%S UTC")
        ));

        if let Some(ref message) = entry.message {
            content.push_str(&format!("- Message: {}\n", message));
        }

        content.push('\n');
        content
    }

    // DRY:FN:read_entries
    /// Read all progress entries
    pub fn read_entries(&self) -> Result<Vec<ProgressEntry>> {
        let inner = self.inner.lock().unwrap();

        if !inner.path.exists() {
            return Ok(vec![]);
        }

        let file = File::open(&inner.path)
            .with_context(|| format!("Failed to open progress file {}", inner.path.display()))?;

        let reader = BufReader::new(file);
        let mut entries = Vec::new();
        let mut current_entry: Option<ProgressEntry> = None;

        for line in reader.lines() {
            let line = line?;
            let trimmed = line.trim();

            if trimmed.is_empty() {
                continue;
            }

            // Check for new entry header: ## item_id (status)
            if trimmed.starts_with("## ") {
                // Save previous entry
                if let Some(entry) = current_entry.take() {
                    entries.push(entry);
                }

                // Parse header
                if let Some(parsed) = self.parse_header(trimmed) {
                    current_entry = Some(parsed);
                }
            } else if trimmed.starts_with("- ") && current_entry.is_some() {
                // Parse field
                let field = &trimmed[2..];

                if let Some(value) = field.strip_prefix("Progress: ") {
                    if let Some(entry) = current_entry.as_mut() {
                        entry.progress = value.trim_end_matches('%').parse::<f64>().unwrap_or(0.0);
                    }
                } else if let Some(value) = field.strip_prefix("Status: ") {
                    if let Some(entry) = current_entry.as_mut() {
                        entry.status = self.parse_status(value);
                    }
                } else if let Some(value) = field.strip_prefix("Message: ") {
                    if let Some(entry) = current_entry.as_mut() {
                        entry.message = Some(value.to_string());
                    }
                }
            }
        }

        // Save last entry
        if let Some(entry) = current_entry {
            entries.push(entry);
        }

        Ok(entries)
    }

    /// Parse entry header
    fn parse_header(&self, header: &str) -> Option<ProgressEntry> {
        // Format: ## item_id (status)
        let header = header.trim_start_matches("## ").trim();

        let paren_start = header.rfind('(')?;
        let paren_end = header.rfind(')')?;

        let item_id = header[..paren_start].trim().to_string();
        let status_str = &header[paren_start + 1..paren_end];

        Some(ProgressEntry::new(
            item_id,
            self.parse_status(status_str),
            0.0,
        ))
    }

    /// Parse status from string
    fn parse_status(&self, status: &str) -> ItemStatus {
        match status.to_lowercase().as_str() {
            "pending" => ItemStatus::Pending,
            "planning" => ItemStatus::Planning,
            "running" | "in_progress" | "in progress" => ItemStatus::Running,
            "gating" => ItemStatus::Gating,
            "passed" | "completed" => ItemStatus::Passed,
            "failed" => ItemStatus::Failed,
            "blocked" => ItemStatus::Blocked,
            "skipped" => ItemStatus::Skipped,
            "escalated" => ItemStatus::Escalated,
            "reopened" => ItemStatus::Reopened,
            _ => ItemStatus::Pending,
        }
    }

    // DRY:FN:get_item_entries
    /// Get entries for a specific item
    pub fn get_item_entries(&self, item_id: &str) -> Result<Vec<ProgressEntry>> {
        let entries = self.read_entries()?;
        Ok(entries
            .into_iter()
            .filter(|e| e.item_id == item_id)
            .collect())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_generate_session_id() {
        let temp_dir = TempDir::new().unwrap();
        let progress_path = temp_dir.path().join("progress.txt");

        let manager = ProgressManager::new(&progress_path).unwrap();
        let id1 = manager.generate_session_id();
        let id2 = manager.generate_session_id();

        assert!(id1.starts_with("PM-"));
        assert!(id2.starts_with("PM-"));
        assert_ne!(id1, id2);
    }

    #[test]
    fn test_append_and_read() {
        let temp_dir = TempDir::new().unwrap();
        let progress_path = temp_dir.path().join("progress.txt");

        let manager = ProgressManager::new(&progress_path).unwrap();

        let entry = ProgressEntry::new("phase1", ItemStatus::Passed, 100.0)
            .with_message("Completed successfully");

        manager.append_entry(&entry).unwrap();

        let entries = manager.read_entries().unwrap();
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].item_id, "phase1");
    }
}
