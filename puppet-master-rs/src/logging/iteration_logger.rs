//! Iteration Logger
//!
//! Detailed logging for each iteration execution.
//! Tracks performance, token usage, file changes, and outcomes.

use crate::types::Platform;
use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fs::OpenOptions;
use std::io::Write;
use std::path::PathBuf;

/// Iteration logger for detailed execution tracking
pub struct IterationLogger {
    log_dir: PathBuf,
}

/// Complete log for a single iteration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IterationLog {
    /// Session ID this iteration belongs to
    pub session_id: String,
    /// Unique iteration ID
    pub iteration_id: String,
    /// Platform used
    pub platform: Platform,
    /// Model used
    pub model: String,
    /// Prompt size in characters
    pub prompt_size: usize,
    /// Response size in characters
    pub response_size: usize,
    /// Duration in milliseconds
    pub duration_ms: u64,
    /// Exit code (if applicable)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exit_code: Option<i32>,
    /// Completion signal
    #[serde(skip_serializing_if = "Option::is_none")]
    pub completion_signal: Option<String>,
    /// Files that were changed
    pub files_changed: Vec<String>,
    /// Token usage statistics
    #[serde(skip_serializing_if = "Option::is_none")]
    pub token_usage: Option<TokenUsage>,
    /// Errors that occurred
    pub errors: Vec<String>,
    /// When iteration started
    pub started_at: DateTime<Utc>,
    /// When iteration ended
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ended_at: Option<DateTime<Utc>>,
    /// Success status
    pub success: bool,
}

/// Token usage statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenUsage {
    /// Input tokens
    pub input_tokens: u64,
    /// Output tokens
    pub output_tokens: u64,
    /// Total tokens
    pub total_tokens: u64,
    /// Estimated cost in USD
    #[serde(skip_serializing_if = "Option::is_none")]
    pub estimated_cost: Option<f64>,
}

impl TokenUsage {
    /// Create new token usage
    pub fn new(input_tokens: u64, output_tokens: u64) -> Self {
        Self {
            input_tokens,
            output_tokens,
            total_tokens: input_tokens + output_tokens,
            estimated_cost: None,
        }
    }

    /// Add cost estimate
    pub fn with_cost(mut self, cost: f64) -> Self {
        self.estimated_cost = Some(cost);
        self
    }
}

impl IterationLog {
    /// Create a new iteration log
    pub fn new(
        session_id: impl Into<String>,
        iteration_id: impl Into<String>,
        platform: Platform,
        model: impl Into<String>,
    ) -> Self {
        Self {
            session_id: session_id.into(),
            iteration_id: iteration_id.into(),
            platform,
            model: model.into(),
            prompt_size: 0,
            response_size: 0,
            duration_ms: 0,
            exit_code: None,
            completion_signal: None,
            files_changed: Vec::new(),
            token_usage: None,
            errors: Vec::new(),
            started_at: Utc::now(),
            ended_at: None,
            success: false,
        }
    }

    /// Set prompt size
    pub fn with_prompt_size(mut self, size: usize) -> Self {
        self.prompt_size = size;
        self
    }

    /// Set response size
    pub fn with_response_size(mut self, size: usize) -> Self {
        self.response_size = size;
        self
    }

    /// Set duration
    pub fn with_duration(mut self, duration_ms: u64) -> Self {
        self.duration_ms = duration_ms;
        self
    }

    /// Set exit code
    pub fn with_exit_code(mut self, code: i32) -> Self {
        self.exit_code = Some(code);
        self
    }

    /// Set completion signal
    pub fn with_completion_signal(mut self, signal: impl Into<String>) -> Self {
        self.completion_signal = Some(signal.into());
        self
    }

    /// Add a changed file
    pub fn add_file_changed(&mut self, file: impl Into<String>) {
        self.files_changed.push(file.into());
    }

    /// Set files changed
    pub fn with_files_changed(mut self, files: Vec<String>) -> Self {
        self.files_changed = files;
        self
    }

    /// Set token usage
    pub fn with_token_usage(mut self, usage: TokenUsage) -> Self {
        self.token_usage = Some(usage);
        self
    }

    /// Add an error
    pub fn add_error(&mut self, error: impl Into<String>) {
        self.errors.push(error.into());
    }

    /// Set errors
    pub fn with_errors(mut self, errors: Vec<String>) -> Self {
        self.errors = errors;
        self
    }

    /// Mark as complete
    pub fn complete(mut self, success: bool) -> Self {
        self.ended_at = Some(Utc::now());
        self.success = success;
        if let Some(ended) = self.ended_at {
            self.duration_ms = (ended - self.started_at).num_milliseconds() as u64;
        }
        self
    }

    /// Convert to JSONL format
    pub fn to_jsonl(&self) -> Result<String> {
        let json = serde_json::to_string(self).context("Failed to serialize iteration log")?;
        Ok(format!("{}\n", json))
    }
}

impl IterationLogger {
    /// Create a new iteration logger
    pub fn new(log_dir: PathBuf) -> Self {
        Self { log_dir }
    }

    /// Log an iteration
    pub fn log(&self, iteration_log: &IterationLog) -> Result<()> {
        // Create log directory if needed
        std::fs::create_dir_all(&self.log_dir).with_context(|| {
            format!(
                "Failed to create iteration log directory {}",
                self.log_dir.display()
            )
        })?;

        // Create a log file per session
        let log_file = self.log_dir.join(format!("{}.jsonl", iteration_log.session_id));

        // Open file in append mode
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&log_file)
            .with_context(|| format!("Failed to open iteration log file {}", log_file.display()))?;

        // Write JSONL entry
        let jsonl = iteration_log.to_jsonl()?;
        file.write_all(jsonl.as_bytes())
            .context("Failed to write iteration log")?;

        log::debug!(
            "Logged iteration {} for session {}",
            iteration_log.iteration_id,
            iteration_log.session_id
        );

        Ok(())
    }

    /// Read all iterations for a session
    pub fn read_session(&self, session_id: &str) -> Result<Vec<IterationLog>> {
        let log_file = self.log_dir.join(format!("{}.jsonl", session_id));

        if !log_file.exists() {
            return Ok(Vec::new());
        }

        let content = std::fs::read_to_string(&log_file)
            .with_context(|| format!("Failed to read iteration log {}", log_file.display()))?;

        let mut logs = Vec::new();

        for (line_num, line) in content.lines().enumerate() {
            if line.trim().is_empty() {
                continue;
            }

            match serde_json::from_str::<IterationLog>(line) {
                Ok(log) => logs.push(log),
                Err(e) => {
                    log::warn!(
                        "Failed to parse iteration log at line {}: {}",
                        line_num + 1,
                        e
                    );
                }
            }
        }

        Ok(logs)
    }

    /// Read a specific iteration
    pub fn read_iteration(&self, session_id: &str, iteration_id: &str) -> Result<Option<IterationLog>> {
        let logs = self.read_session(session_id)?;
        Ok(logs.into_iter().find(|log| log.iteration_id == iteration_id))
    }

    /// Get statistics for a session
    pub fn session_stats(&self, session_id: &str) -> Result<SessionStats> {
        let logs = self.read_session(session_id)?;

        let total_iterations = logs.len();
        let successful_iterations = logs.iter().filter(|log| log.success).count();
        let failed_iterations = total_iterations - successful_iterations;

        let total_duration_ms = logs.iter().map(|log| log.duration_ms).sum();
        let total_tokens = logs
            .iter()
            .filter_map(|log| log.token_usage.as_ref())
            .map(|usage| usage.total_tokens)
            .sum();

        let total_cost = logs
            .iter()
            .filter_map(|log| log.token_usage.as_ref())
            .filter_map(|usage| usage.estimated_cost)
            .sum();

        let files_changed: std::collections::HashSet<_> = logs
            .iter()
            .flat_map(|log| &log.files_changed)
            .cloned()
            .collect();

        Ok(SessionStats {
            total_iterations,
            successful_iterations,
            failed_iterations,
            total_duration_ms,
            total_tokens,
            total_cost,
            unique_files_changed: files_changed.len(),
        })
    }

    /// List all sessions with iteration logs
    pub fn list_sessions(&self) -> Result<Vec<String>> {
        if !self.log_dir.exists() {
            return Ok(Vec::new());
        }

        let mut sessions = Vec::new();

        for entry in std::fs::read_dir(&self.log_dir)? {
            let entry = entry?;
            let path = entry.path();

            if path.is_file() {
                if let Some(file_name) = path.file_stem() {
                    if let Some(name_str) = file_name.to_str() {
                        sessions.push(name_str.to_string());
                    }
                }
            }
        }

        Ok(sessions)
    }

    /// Delete logs for a session
    pub fn delete_session(&self, session_id: &str) -> Result<()> {
        let log_file = self.log_dir.join(format!("{}.jsonl", session_id));

        if log_file.exists() {
            std::fs::remove_file(&log_file)
                .with_context(|| format!("Failed to delete session log {}", log_file.display()))?;
        }

        Ok(())
    }
}

/// Statistics for a session
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionStats {
    /// Total number of iterations
    pub total_iterations: usize,
    /// Number of successful iterations
    pub successful_iterations: usize,
    /// Number of failed iterations
    pub failed_iterations: usize,
    /// Total duration in milliseconds
    pub total_duration_ms: u64,
    /// Total tokens used
    pub total_tokens: u64,
    /// Total estimated cost
    pub total_cost: f64,
    /// Number of unique files changed
    pub unique_files_changed: usize,
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_log_and_read_iteration() {
        let temp_dir = TempDir::new().unwrap();
        let logger = IterationLogger::new(temp_dir.path().to_path_buf());

        let log = IterationLog::new("session1", "iter1", Platform::Cursor, "claude-3")
            .with_prompt_size(1000)
            .with_response_size(500)
            .with_duration(5000)
            .with_exit_code(0)
            .complete(true);

        logger.log(&log).unwrap();

        let logs = logger.read_session("session1").unwrap();
        assert_eq!(logs.len(), 1);
        assert_eq!(logs[0].iteration_id, "iter1");
        assert!(logs[0].success);
    }

    #[test]
    fn test_session_stats() {
        let temp_dir = TempDir::new().unwrap();
        let logger = IterationLogger::new(temp_dir.path().to_path_buf());

        // Log successful iteration
        // Note: complete() recalculates duration_ms from timestamps, overwriting any
        // manually set duration. So we don't use with_duration() here.
        let log1 = IterationLog::new("session1", "iter1", Platform::Cursor, "claude-3")
            .with_token_usage(TokenUsage::new(1000, 500).with_cost(0.05))
            .complete(true);
        logger.log(&log1).unwrap();

        // Log failed iteration
        let log2 = IterationLog::new("session1", "iter2", Platform::Cursor, "claude-3")
            .with_token_usage(TokenUsage::new(800, 400).with_cost(0.04))
            .complete(false);
        logger.log(&log2).unwrap();

        let stats = logger.session_stats("session1").unwrap();
        assert_eq!(stats.total_iterations, 2);
        assert_eq!(stats.successful_iterations, 1);
        assert_eq!(stats.failed_iterations, 1);
        // Duration is calculated from timestamps which are very close together,
        // so total_duration_ms will be close to 0
        assert!(stats.total_duration_ms < 100, "Duration should be minimal, got {}", stats.total_duration_ms);
        assert_eq!(stats.total_tokens, 2700);
        assert!((stats.total_cost - 0.09).abs() < 0.001);
    }

    #[test]
    fn test_list_sessions() {
        let temp_dir = TempDir::new().unwrap();
        let logger = IterationLogger::new(temp_dir.path().to_path_buf());

        let log1 = IterationLog::new("session1", "iter1", Platform::Cursor, "model1").complete(true);
        let log2 = IterationLog::new("session2", "iter1", Platform::Claude, "model2").complete(true);

        logger.log(&log1).unwrap();
        logger.log(&log2).unwrap();

        let sessions = logger.list_sessions().unwrap();
        assert_eq!(sessions.len(), 2);
        assert!(sessions.contains(&"session1".to_string()));
        assert!(sessions.contains(&"session2".to_string()));
    }

    #[test]
    fn test_delete_session() {
        let temp_dir = TempDir::new().unwrap();
        let logger = IterationLogger::new(temp_dir.path().to_path_buf());

        let log = IterationLog::new("session1", "iter1", Platform::Cursor, "model").complete(true);
        logger.log(&log).unwrap();

        let sessions = logger.list_sessions().unwrap();
        assert_eq!(sessions.len(), 1);

        logger.delete_session("session1").unwrap();

        let sessions = logger.list_sessions().unwrap();
        assert_eq!(sessions.len(), 0);
    }

    #[test]
    fn test_files_changed() {
        let temp_dir = TempDir::new().unwrap();
        let logger = IterationLogger::new(temp_dir.path().to_path_buf());

        let log = IterationLog::new("session1", "iter1", Platform::Cursor, "model")
            .with_files_changed(vec!["file1.rs".to_string(), "file2.rs".to_string()])
            .complete(true);

        logger.log(&log).unwrap();

        let stats = logger.session_stats("session1").unwrap();
        assert_eq!(stats.unique_files_changed, 2);
    }
}
