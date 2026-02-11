//! Log Streamer
//!
//! Watch and stream JSONL log files:
//! - File watching with notify crate
//! - Track file position for new entries only
//! - Callback-based event emission
//! - Log level filtering

use anyhow::{Context, Result};
use notify::{Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use std::fs::File;
use std::io::{BufRead, BufReader, Seek, SeekFrom};
use std::path::{Path, PathBuf};
use std::sync::mpsc::{channel, Receiver, Sender};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

/// Log level filter
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum LogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
}

impl LogLevel {
    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "trace" => Some(Self::Trace),
            "debug" => Some(Self::Debug),
            "info" => Some(Self::Info),
            "warn" | "warning" => Some(Self::Warn),
            "error" => Some(Self::Error),
            _ => None,
        }
    }
}

/// Log entry
#[derive(Debug, Clone)]
pub struct LogEntry {
    pub timestamp: String,
    pub level: LogLevel,
    pub message: String,
    pub raw: String,
}

/// Log streamer for watching JSONL files
pub struct LogStreamer {
    path: PathBuf,
    position: Arc<Mutex<u64>>,
    min_level: LogLevel,
    callback: Arc<Mutex<Box<dyn FnMut(LogEntry) + Send + 'static>>>,
    _watcher: RecommendedWatcher,
    watcher_rx: Receiver<notify::Result<Event>>,
}

impl LogStreamer {
    /// Create a new log streamer
    pub fn new<F>(path: impl AsRef<Path>, min_level: LogLevel, callback: F) -> Result<Self>
    where
        F: FnMut(LogEntry) + Send + 'static,
    {
        let path = path.as_ref().to_path_buf();

        // Get initial file size
        let position = if path.exists() {
            std::fs::metadata(&path)?.len()
        } else {
            0
        };

        let position = Arc::new(Mutex::new(position));
        let callback = Arc::new(Mutex::new(Box::new(callback) as Box<dyn FnMut(LogEntry) + Send>));

        // Set up file watcher
        let (tx, rx) = channel();
        let mut watcher = notify::recommended_watcher(tx)
            .context("Failed to create file watcher")?;

        // Watch the log file directory
        if let Some(parent) = path.parent() {
            watcher
                .watch(parent, RecursiveMode::NonRecursive)
                .with_context(|| format!("Failed to watch directory {}", parent.display()))?;
        }

        log::info!("Log streamer watching {}", path.display());

        Ok(Self {
            path,
            position,
            min_level,
            callback,
            _watcher: watcher,
            watcher_rx: rx,
        })
    }

    /// Start streaming logs (blocking)
    pub fn stream(&mut self) -> Result<()> {
        // Read any existing new lines first
        self.read_new_lines()?;

        loop {
            match self.watcher_rx.recv_timeout(Duration::from_millis(100)) {
                Ok(Ok(event)) => {
                    if self.is_relevant_event(&event) {
                        self.read_new_lines()?;
                    }
                }
                Ok(Err(e)) => {
                    log::warn!("File watcher error: {}", e);
                }
                Err(std::sync::mpsc::RecvTimeoutError::Timeout) => {
                    // Check for new lines periodically
                    self.read_new_lines()?;
                }
                Err(std::sync::mpsc::RecvTimeoutError::Disconnected) => {
                    log::info!("File watcher disconnected");
                    break;
                }
            }
        }

        Ok(())
    }

    /// Check if an event is relevant
    fn is_relevant_event(&self, event: &Event) -> bool {
        match event.kind {
            EventKind::Modify(_) | EventKind::Create(_) => {
                event.paths.iter().any(|p| p == &self.path)
            }
            _ => false,
        }
    }

    /// Read new lines from the log file
    fn read_new_lines(&mut self) -> Result<()> {
        if !self.path.exists() {
            return Ok(());
        }

        let mut file = File::open(&self.path)
            .with_context(|| format!("Failed to open log file {}", self.path.display()))?;

        let mut position = self.position.lock().unwrap();

        // Seek to last position
        file.seek(SeekFrom::Start(*position))?;

        let reader = BufReader::new(file);
        let mut new_position = *position;

        for line in reader.lines() {
            let line = line?;
            new_position += line.len() as u64 + 1; // +1 for newline

            if line.trim().is_empty() {
                continue;
            }

            if let Some(entry) = self.parse_log_line(&line) {
                if entry.level >= self.min_level {
                    let mut callback = self.callback.lock().unwrap();
                    callback(entry);
                }
            }
        }

        *position = new_position;
        Ok(())
    }

    /// Parse a JSONL log line
    fn parse_log_line(&self, line: &str) -> Option<LogEntry> {
        // Try to parse as JSON
        if let Ok(json) = serde_json::from_str::<serde_json::Value>(line) {
            let timestamp = json.get("timestamp")?.as_str()?.to_string();
            let level_str = json.get("level")?.as_str()?;
            let level = LogLevel::from_str(level_str)?;
            let message = json.get("message")?.as_str()?.to_string();

            Some(LogEntry {
                timestamp,
                level,
                message,
                raw: line.to_string(),
            })
        } else {
            // Fallback: treat as plain text
            Some(LogEntry {
                timestamp: chrono::Utc::now().to_rfc3339(),
                level: LogLevel::Info,
                message: line.to_string(),
                raw: line.to_string(),
            })
        }
    }

    /// Spawn streaming in a background thread
    pub fn spawn(mut self) -> thread::JoinHandle<Result<()>> {
        thread::spawn(move || self.stream())
    }
}

/// Create a log streamer and spawn it in a background thread
pub fn spawn_log_streamer<F>(
    path: impl AsRef<Path>,
    min_level: LogLevel,
    callback: F,
) -> Result<thread::JoinHandle<Result<()>>>
where
    F: FnMut(LogEntry) + Send + 'static,
{
    let streamer = LogStreamer::new(path, min_level, callback)?;
    Ok(streamer.spawn())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};
    use std::sync::Arc;
    use tempfile::TempDir;

    #[test]
    fn test_parse_json_log() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("test.jsonl");

        let counter = Arc::new(AtomicUsize::new(0));
        let counter_clone = counter.clone();

        let mut streamer = LogStreamer::new(log_path.clone(), LogLevel::Info, move |_entry| {
            counter_clone.fetch_add(1, Ordering::SeqCst);
        })
        .unwrap();

        // Write a JSON log line
        std::fs::write(
            &log_path,
            r#"{"timestamp":"2024-01-01T00:00:00Z","level":"info","message":"Test message"}"#,
        )
        .unwrap();

        // Read new lines
        streamer.read_new_lines().unwrap();

        assert_eq!(counter.load(Ordering::SeqCst), 1);
    }

    #[test]
    fn test_level_filtering() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("test.jsonl");

        let counter = Arc::new(AtomicUsize::new(0));
        let counter_clone = counter.clone();

        let mut streamer = LogStreamer::new(log_path.clone(), LogLevel::Warn, move |_entry| {
            counter_clone.fetch_add(1, Ordering::SeqCst);
        })
        .unwrap();

        // Write logs at different levels
        let mut content = String::new();
        content.push_str(r#"{"timestamp":"2024-01-01T00:00:00Z","level":"info","message":"Info"}"#);
        content.push('\n');
        content.push_str(r#"{"timestamp":"2024-01-01T00:00:01Z","level":"warn","message":"Warn"}"#);
        content.push('\n');
        content
            .push_str(r#"{"timestamp":"2024-01-01T00:00:02Z","level":"error","message":"Error"}"#);
        content.push('\n');

        std::fs::write(&log_path, content).unwrap();

        streamer.read_new_lines().unwrap();

        // Should only see warn and error (2 messages)
        assert_eq!(counter.load(Ordering::SeqCst), 2);
    }
}
