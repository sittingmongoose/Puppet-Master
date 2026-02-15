//! Error Logger
//!
//! Structured error logging with categorization, severity levels, and persistence.
//! Maintains a comprehensive error log for debugging and monitoring.

use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::PathBuf;

// DRY:HELPER:ErrorLogger
/// Error logger for structured error recording
pub struct ErrorLogger {
    log_path: PathBuf,
}

// DRY:HELPER:ErrorRecord
/// Single error record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorRecord {
    /// When the error occurred
    pub timestamp: DateTime<Utc>,
    /// Category of the error
    pub error_type: ErrorCategory,
    /// Error message
    pub message: String,
    /// Additional context
    #[serde(default)]
    pub context: HashMap<String, String>,
    /// Stack trace if available
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stack_trace: Option<String>,
    /// Error severity
    pub severity: ErrorSeverity,
}

// DRY:HELPER:ErrorCategory
/// Categories of errors
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ErrorCategory {
    /// Platform/CLI errors
    Platform,
    /// Configuration errors
    Config,
    /// State management errors
    State,
    /// Git operation errors
    Git,
    /// Verification errors
    Verification,
    /// System errors
    System,
    /// Network errors
    Network,
}

impl std::fmt::Display for ErrorCategory {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Platform => write!(f, "Platform"),
            Self::Config => write!(f, "Config"),
            Self::State => write!(f, "State"),
            Self::Git => write!(f, "Git"),
            Self::Verification => write!(f, "Verification"),
            Self::System => write!(f, "System"),
            Self::Network => write!(f, "Network"),
        }
    }
}

// DRY:HELPER:ErrorSeverity
/// Error severity levels
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ErrorSeverity {
    /// Low severity - informational
    Low,
    /// Medium severity - warning
    Medium,
    /// High severity - error
    High,
    /// Critical severity - fatal
    Critical,
}

impl std::fmt::Display for ErrorSeverity {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Low => write!(f, "Low"),
            Self::Medium => write!(f, "Medium"),
            Self::High => write!(f, "High"),
            Self::Critical => write!(f, "Critical"),
        }
    }
}

impl ErrorRecord {
    // DRY:HELPER:ErrorRecord::new
    /// Create a new error record
    pub fn new(
        error_type: ErrorCategory,
        message: impl Into<String>,
        severity: ErrorSeverity,
    ) -> Self {
        Self {
            timestamp: Utc::now(),
            error_type,
            message: message.into(),
            context: HashMap::new(),
            stack_trace: None,
            severity,
        }
    }

    // DRY:HELPER:ErrorRecord::with_context
    /// Add context information
    pub fn with_context(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.context.insert(key.into(), value.into());
        self
    }

    // DRY:HELPER:ErrorRecord::with_context_map
    /// Add multiple context entries
    pub fn with_context_map(mut self, context: HashMap<String, String>) -> Self {
        self.context.extend(context);
        self
    }

    // DRY:HELPER:ErrorRecord::with_stack_trace
    /// Add stack trace
    pub fn with_stack_trace(mut self, stack_trace: impl Into<String>) -> Self {
        self.stack_trace = Some(stack_trace.into());
        self
    }

    // DRY:HELPER:ErrorRecord::to_jsonl
    /// Convert to JSONL format
    pub fn to_jsonl(&self) -> Result<String> {
        let json = serde_json::to_string(self).context("Failed to serialize error record")?;
        Ok(format!("{}\n", json))
    }
}

impl ErrorLogger {
    // DRY:HELPER:ErrorLogger::new
    /// Create a new error logger
    pub fn new(log_path: PathBuf) -> Self {
        Self { log_path }
    }

    // DRY:HELPER:ErrorLogger::log_error
    /// Log an error
    pub fn log_error(
        &self,
        category: ErrorCategory,
        message: impl Into<String>,
        context: HashMap<String, String>,
    ) -> Result<()> {
        let record =
            ErrorRecord::new(category, message, ErrorSeverity::High).with_context_map(context);
        self.log(record)
    }

    // DRY:HELPER:ErrorLogger::log
    /// Log an error record
    pub fn log(&self, record: ErrorRecord) -> Result<()> {
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
            .with_context(|| format!("Failed to open error log {}", self.log_path.display()))?;

        // Write JSONL entry
        let jsonl = record.to_jsonl()?;
        file.write_all(jsonl.as_bytes())
            .context("Failed to write error record")?;

        log::trace!(
            "Logged error: {} [{}] - {}",
            record.error_type,
            record.severity,
            record.message
        );

        Ok(())
    }

    // DRY:HELPER:ErrorLogger::get_recent_errors
    /// Get recent errors
    pub fn get_recent_errors(&self, count: usize) -> Result<Vec<ErrorRecord>> {
        let mut errors = self.read_all()?;
        errors.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        errors.truncate(count);
        Ok(errors)
    }

    // DRY:HELPER:ErrorLogger::get_errors_by_category
    /// Get errors by category
    pub fn get_errors_by_category(&self, category: ErrorCategory) -> Result<Vec<ErrorRecord>> {
        let all_errors = self.read_all()?;
        Ok(all_errors
            .into_iter()
            .filter(|e| e.error_type == category)
            .collect())
    }

    // DRY:HELPER:ErrorLogger::get_errors_by_severity
    /// Get errors by severity
    pub fn get_errors_by_severity(&self, severity: ErrorSeverity) -> Result<Vec<ErrorRecord>> {
        let all_errors = self.read_all()?;
        Ok(all_errors
            .into_iter()
            .filter(|e| e.severity == severity)
            .collect())
    }

    // DRY:HELPER:ErrorLogger::read_all
    /// Read all error records
    pub fn read_all(&self) -> Result<Vec<ErrorRecord>> {
        if !self.log_path.exists() {
            return Ok(Vec::new());
        }

        let content = std::fs::read_to_string(&self.log_path)
            .with_context(|| format!("Failed to read error log {}", self.log_path.display()))?;

        let mut records = Vec::new();

        for (line_num, line) in content.lines().enumerate() {
            if line.trim().is_empty() {
                continue;
            }

            match serde_json::from_str::<ErrorRecord>(line) {
                Ok(record) => records.push(record),
                Err(e) => {
                    log::warn!(
                        "Failed to parse error record at line {}: {}",
                        line_num + 1,
                        e
                    );
                }
            }
        }

        Ok(records)
    }

    // DRY:HELPER:ErrorLogger::read_range
    /// Read errors within a time range
    pub fn read_range(&self, start: DateTime<Utc>, end: DateTime<Utc>) -> Result<Vec<ErrorRecord>> {
        let all_errors = self.read_all()?;

        Ok(all_errors
            .into_iter()
            .filter(|e| e.timestamp >= start && e.timestamp <= end)
            .collect())
    }

    // DRY:HELPER:ErrorLogger::count_by_category
    /// Get error count by category
    pub fn count_by_category(&self) -> Result<HashMap<ErrorCategory, usize>> {
        let all_errors = self.read_all()?;
        let mut counts = HashMap::new();

        for error in all_errors {
            *counts.entry(error.error_type).or_insert(0) += 1;
        }

        Ok(counts)
    }

    // DRY:HELPER:ErrorLogger::count_by_severity
    /// Get error count by severity
    pub fn count_by_severity(&self) -> Result<HashMap<ErrorSeverity, usize>> {
        let all_errors = self.read_all()?;
        let mut counts = HashMap::new();

        for error in all_errors {
            *counts.entry(error.severity).or_insert(0) += 1;
        }

        Ok(counts)
    }

    // DRY:HELPER:ErrorLogger::clear
    /// Clear the error log
    pub fn clear(&self) -> Result<()> {
        if self.log_path.exists() {
            std::fs::remove_file(&self.log_path).with_context(|| {
                format!("Failed to clear error log {}", self.log_path.display())
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
    fn test_error_record_creation() {
        let record = ErrorRecord::new(ErrorCategory::Platform, "Test error", ErrorSeverity::High);
        assert_eq!(record.error_type, ErrorCategory::Platform);
        assert_eq!(record.message, "Test error");
        assert_eq!(record.severity, ErrorSeverity::High);
        assert!(record.context.is_empty());
        assert!(record.stack_trace.is_none());
    }

    #[test]
    fn test_error_record_with_context() {
        let record = ErrorRecord::new(ErrorCategory::Git, "Git error", ErrorSeverity::Medium)
            .with_context("repo", "/path/to/repo")
            .with_context("branch", "main");

        assert_eq!(record.context.len(), 2);
        assert_eq!(record.context.get("repo").unwrap(), "/path/to/repo");
        assert_eq!(record.context.get("branch").unwrap(), "main");
    }

    #[test]
    fn test_error_record_with_stack_trace() {
        let record = ErrorRecord::new(
            ErrorCategory::System,
            "System error",
            ErrorSeverity::Critical,
        )
        .with_stack_trace("line 1\nline 2\nline 3");

        assert!(record.stack_trace.is_some());
        assert!(record.stack_trace.unwrap().contains("line 2"));
    }

    #[test]
    fn test_log_and_read() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("errors.jsonl");
        let logger = ErrorLogger::new(log_path);

        let mut context = HashMap::new();
        context.insert("test".to_string(), "value".to_string());

        logger
            .log_error(ErrorCategory::Platform, "Platform error", context)
            .unwrap();

        logger
            .log_error(ErrorCategory::Config, "Config error", HashMap::new())
            .unwrap();

        let errors = logger.read_all().unwrap();
        assert_eq!(errors.len(), 2);
        assert_eq!(errors[0].error_type, ErrorCategory::Platform);
        assert_eq!(errors[1].error_type, ErrorCategory::Config);
    }

    #[test]
    fn test_get_recent_errors() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("errors.jsonl");
        let logger = ErrorLogger::new(log_path);

        for i in 0..10 {
            logger
                .log_error(
                    ErrorCategory::System,
                    format!("Error {}", i),
                    HashMap::new(),
                )
                .unwrap();
            std::thread::sleep(std::time::Duration::from_millis(5));
        }

        let recent = logger.get_recent_errors(3).unwrap();
        assert_eq!(recent.len(), 3);
        // Should be in reverse chronological order
        assert!(recent[0].message.contains("Error 9"));
    }

    #[test]
    fn test_get_errors_by_category() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("errors.jsonl");
        let logger = ErrorLogger::new(log_path);

        logger
            .log_error(ErrorCategory::Platform, "Error 1", HashMap::new())
            .unwrap();
        logger
            .log_error(ErrorCategory::Git, "Error 2", HashMap::new())
            .unwrap();
        logger
            .log_error(ErrorCategory::Platform, "Error 3", HashMap::new())
            .unwrap();

        let platform_errors = logger
            .get_errors_by_category(ErrorCategory::Platform)
            .unwrap();
        assert_eq!(platform_errors.len(), 2);

        let git_errors = logger.get_errors_by_category(ErrorCategory::Git).unwrap();
        assert_eq!(git_errors.len(), 1);
    }

    #[test]
    fn test_count_by_category() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("errors.jsonl");
        let logger = ErrorLogger::new(log_path);

        logger
            .log_error(ErrorCategory::Platform, "Error 1", HashMap::new())
            .unwrap();
        logger
            .log_error(ErrorCategory::Platform, "Error 2", HashMap::new())
            .unwrap();
        logger
            .log_error(ErrorCategory::Git, "Error 3", HashMap::new())
            .unwrap();

        let counts = logger.count_by_category().unwrap();
        assert_eq!(counts.get(&ErrorCategory::Platform), Some(&2));
        assert_eq!(counts.get(&ErrorCategory::Git), Some(&1));
    }

    #[test]
    fn test_severity_ordering() {
        assert!(ErrorSeverity::Low < ErrorSeverity::Medium);
        assert!(ErrorSeverity::Medium < ErrorSeverity::High);
        assert!(ErrorSeverity::High < ErrorSeverity::Critical);
    }

    #[test]
    fn test_count_by_severity() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("errors.jsonl");
        let logger = ErrorLogger::new(log_path);

        let record1 = ErrorRecord::new(ErrorCategory::Platform, "Low error", ErrorSeverity::Low);
        let record2 = ErrorRecord::new(
            ErrorCategory::Platform,
            "Critical error",
            ErrorSeverity::Critical,
        );
        let record3 = ErrorRecord::new(ErrorCategory::Git, "Medium error", ErrorSeverity::Medium);

        logger.log(record1).unwrap();
        logger.log(record2).unwrap();
        logger.log(record3).unwrap();

        let counts = logger.count_by_severity().unwrap();
        assert_eq!(counts.get(&ErrorSeverity::Low), Some(&1));
        assert_eq!(counts.get(&ErrorSeverity::Medium), Some(&1));
        assert_eq!(counts.get(&ErrorSeverity::Critical), Some(&1));
    }

    #[test]
    fn test_clear() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("errors.jsonl");
        let logger = ErrorLogger::new(log_path.clone());

        logger
            .log_error(ErrorCategory::System, "Test error", HashMap::new())
            .unwrap();

        assert!(log_path.exists());
        logger.clear().unwrap();
        assert!(!log_path.exists());
    }
}
