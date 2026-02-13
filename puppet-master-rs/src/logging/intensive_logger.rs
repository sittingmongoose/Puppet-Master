//! Intensive Logger
//!
//! Provides verbose logging for debugging purposes.
//! When enabled, logs every state transition, CLI invocation, and file operation.

use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::PathBuf;
use std::time::Instant;

/// Intensive logger for verbose debugging
pub struct IntensiveLogger {
    log_path: PathBuf,
    enabled: bool,
}

/// Intensive log entry with detailed context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntensiveLogEntry {
    /// When the log occurred
    pub timestamp: DateTime<Utc>,
    /// Module name
    pub module: String,
    /// Function name
    pub function: String,
    /// Log level
    pub level: LogLevel,
    /// Log message
    pub message: String,
    /// Function arguments (serialized)
    #[serde(default)]
    pub args: HashMap<String, String>,
    /// Result/return value (if applicable)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub result: Option<String>,
    /// Execution duration in milliseconds
    #[serde(skip_serializing_if = "Option::is_none")]
    pub duration_ms: Option<u64>,
    /// Additional context
    #[serde(default)]
    pub context: HashMap<String, String>,
}

/// Log levels for intensive logging
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum LogLevel {
    /// Trace level - most verbose
    Trace,
    /// Debug level
    Debug,
    /// Info level
    Info,
    /// Warn level
    Warn,
    /// Error level
    Error,
}

impl std::fmt::Display for LogLevel {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Trace => write!(f, "TRACE"),
            Self::Debug => write!(f, "DEBUG"),
            Self::Info => write!(f, "INFO"),
            Self::Warn => write!(f, "WARN"),
            Self::Error => write!(f, "ERROR"),
        }
    }
}

impl IntensiveLogEntry {
    /// Create a new intensive log entry
    pub fn new(
        module: impl Into<String>,
        function: impl Into<String>,
        level: LogLevel,
        message: impl Into<String>,
    ) -> Self {
        Self {
            timestamp: Utc::now(),
            module: module.into(),
            function: function.into(),
            level,
            message: message.into(),
            args: HashMap::new(),
            result: None,
            duration_ms: None,
            context: HashMap::new(),
        }
    }

    /// Add an argument
    pub fn with_arg(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.args.insert(key.into(), value.into());
        self
    }

    /// Add multiple arguments
    pub fn with_args(mut self, args: HashMap<String, String>) -> Self {
        self.args.extend(args);
        self
    }

    /// Add result
    pub fn with_result(mut self, result: impl Into<String>) -> Self {
        self.result = Some(result.into());
        self
    }

    /// Add duration
    pub fn with_duration(mut self, duration_ms: u64) -> Self {
        self.duration_ms = Some(duration_ms);
        self
    }

    /// Add context
    pub fn with_context(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.context.insert(key.into(), value.into());
        self
    }

    /// Add multiple context entries
    pub fn with_context_map(mut self, context: HashMap<String, String>) -> Self {
        self.context.extend(context);
        self
    }

    /// Convert to JSONL format
    pub fn to_jsonl(&self) -> Result<String> {
        let json =
            serde_json::to_string(self).context("Failed to serialize intensive log entry")?;
        Ok(format!("{}\n", json))
    }
}

impl IntensiveLogger {
    /// Create a new intensive logger
    pub fn new(log_path: PathBuf, enabled: bool) -> Self {
        Self { log_path, enabled }
    }

    /// Check if intensive logging is enabled
    pub fn is_enabled(&self) -> bool {
        self.enabled
    }

    /// Enable intensive logging
    pub fn enable(&mut self) {
        self.enabled = true;
        log::info!("Intensive logging enabled");
    }

    /// Disable intensive logging
    pub fn disable(&mut self) {
        self.enabled = false;
        log::info!("Intensive logging disabled");
    }

    /// Log an entry
    pub fn log(&self, entry: IntensiveLogEntry) -> Result<()> {
        if !self.enabled {
            return Ok(());
        }

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
            .with_context(|| format!("Failed to open intensive log {}", self.log_path.display()))?;

        // Write JSONL entry
        let jsonl = entry.to_jsonl()?;
        file.write_all(jsonl.as_bytes())
            .context("Failed to write intensive log entry")?;

        Ok(())
    }

    /// Log a simple message
    pub fn log_simple(
        &self,
        module: impl Into<String>,
        function: impl Into<String>,
        level: LogLevel,
        message: impl Into<String>,
    ) -> Result<()> {
        let entry = IntensiveLogEntry::new(module, function, level, message);
        self.log(entry)
    }

    /// Log a function call with arguments
    pub fn log_call(
        &self,
        module: impl Into<String>,
        function: impl Into<String>,
        args: HashMap<String, String>,
    ) -> Result<()> {
        let entry = IntensiveLogEntry::new(module, function, LogLevel::Debug, "Function called")
            .with_args(args);
        self.log(entry)
    }

    /// Log a function result
    pub fn log_result(
        &self,
        module: impl Into<String>,
        function: impl Into<String>,
        result: impl Into<String>,
        duration_ms: u64,
    ) -> Result<()> {
        let entry = IntensiveLogEntry::new(module, function, LogLevel::Debug, "Function returned")
            .with_result(result)
            .with_duration(duration_ms);
        self.log(entry)
    }

    /// Log a state transition
    pub fn log_state_transition(
        &self,
        from_state: impl Into<String>,
        to_state: impl Into<String>,
        reason: impl Into<String>,
    ) -> Result<()> {
        let mut context = HashMap::new();
        context.insert("from_state".to_string(), from_state.into());
        context.insert("to_state".to_string(), to_state.into());

        let entry = IntensiveLogEntry::new("state", "transition", LogLevel::Info, reason)
            .with_context_map(context);

        self.log(entry)
    }

    /// Log a CLI invocation
    pub fn log_cli_invocation(
        &self,
        platform: impl Into<String>,
        command: impl Into<String>,
        args: Vec<String>,
    ) -> Result<()> {
        let mut arg_map = HashMap::new();
        arg_map.insert("platform".to_string(), platform.into());
        arg_map.insert("command".to_string(), command.into());
        arg_map.insert("args".to_string(), args.join(" "));

        let entry = IntensiveLogEntry::new("cli", "invoke", LogLevel::Debug, "CLI invocation")
            .with_args(arg_map);

        self.log(entry)
    }

    /// Log a file operation
    pub fn log_file_operation(
        &self,
        operation: impl Into<String>,
        path: impl Into<String>,
        details: Option<HashMap<String, String>>,
    ) -> Result<()> {
        let mut context = HashMap::new();
        context.insert("operation".to_string(), operation.into());
        context.insert("path".to_string(), path.into());

        if let Some(details) = details {
            context.extend(details);
        }

        let entry = IntensiveLogEntry::new("fs", "operation", LogLevel::Debug, "File operation")
            .with_context_map(context);

        self.log(entry)
    }

    /// Read all log entries
    pub fn read_all(&self) -> Result<Vec<IntensiveLogEntry>> {
        if !self.log_path.exists() {
            return Ok(Vec::new());
        }

        let content = std::fs::read_to_string(&self.log_path)
            .with_context(|| format!("Failed to read intensive log {}", self.log_path.display()))?;

        let mut entries = Vec::new();

        for (line_num, line) in content.lines().enumerate() {
            if line.trim().is_empty() {
                continue;
            }

            match serde_json::from_str::<IntensiveLogEntry>(line) {
                Ok(entry) => entries.push(entry),
                Err(e) => {
                    log::warn!(
                        "Failed to parse intensive log entry at line {}: {}",
                        line_num + 1,
                        e
                    );
                }
            }
        }

        Ok(entries)
    }

    /// Read entries by module
    pub fn read_by_module(&self, module: &str) -> Result<Vec<IntensiveLogEntry>> {
        let all_entries = self.read_all()?;
        Ok(all_entries
            .into_iter()
            .filter(|e| e.module == module)
            .collect())
    }

    /// Read entries by level
    pub fn read_by_level(&self, level: LogLevel) -> Result<Vec<IntensiveLogEntry>> {
        let all_entries = self.read_all()?;
        Ok(all_entries
            .into_iter()
            .filter(|e| e.level == level)
            .collect())
    }

    /// Read recent entries
    pub fn read_recent(&self, count: usize) -> Result<Vec<IntensiveLogEntry>> {
        let mut entries = self.read_all()?;
        entries.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        entries.truncate(count);
        Ok(entries)
    }

    /// Clear the log
    pub fn clear(&self) -> Result<()> {
        if self.log_path.exists() {
            std::fs::remove_file(&self.log_path).with_context(|| {
                format!("Failed to clear intensive log {}", self.log_path.display())
            })?;
        }
        Ok(())
    }
}

/// Timer for measuring function execution
pub struct FunctionTimer {
    module: String,
    function: String,
    start: Instant,
}

impl FunctionTimer {
    /// Start a new timer
    pub fn new(module: impl Into<String>, function: impl Into<String>) -> Self {
        Self {
            module: module.into(),
            function: function.into(),
            start: Instant::now(),
        }
    }

    /// Stop the timer and return duration in milliseconds
    pub fn stop(self) -> (String, String, u64) {
        let duration_ms = self.start.elapsed().as_millis() as u64;
        (self.module, self.function, duration_ms)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_intensive_logger_disabled() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("intensive.jsonl");
        let logger = IntensiveLogger::new(log_path.clone(), false);

        assert!(!logger.is_enabled());

        logger
            .log_simple("test", "function", LogLevel::Info, "Test message")
            .unwrap();

        // Should not create file when disabled
        assert!(!log_path.exists());
    }

    #[test]
    fn test_intensive_logger_enabled() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("intensive.jsonl");
        let logger = IntensiveLogger::new(log_path.clone(), true);

        assert!(logger.is_enabled());

        logger
            .log_simple("test", "function", LogLevel::Info, "Test message")
            .unwrap();

        assert!(log_path.exists());

        let entries = logger.read_all().unwrap();
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].module, "test");
        assert_eq!(entries[0].function, "function");
    }

    #[test]
    fn test_log_with_args() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("intensive.jsonl");
        let logger = IntensiveLogger::new(log_path, true);

        let mut args = HashMap::new();
        args.insert("param1".to_string(), "value1".to_string());
        args.insert("param2".to_string(), "value2".to_string());

        logger.log_call("module", "function", args).unwrap();

        let entries = logger.read_all().unwrap();
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].args.len(), 2);
        assert_eq!(entries[0].args.get("param1").unwrap(), "value1");
    }

    #[test]
    fn test_log_with_result_and_duration() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("intensive.jsonl");
        let logger = IntensiveLogger::new(log_path, true);

        logger
            .log_result("module", "function", "success", 150)
            .unwrap();

        let entries = logger.read_all().unwrap();
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].result, Some("success".to_string()));
        assert_eq!(entries[0].duration_ms, Some(150));
    }

    #[test]
    fn test_log_state_transition() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("intensive.jsonl");
        let logger = IntensiveLogger::new(log_path, true);

        logger
            .log_state_transition("idle", "running", "User started orchestration")
            .unwrap();

        let entries = logger.read_all().unwrap();
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].module, "state");
        assert_eq!(entries[0].context.get("from_state").unwrap(), "idle");
        assert_eq!(entries[0].context.get("to_state").unwrap(), "running");
    }

    #[test]
    fn test_log_cli_invocation() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("intensive.jsonl");
        let logger = IntensiveLogger::new(log_path, true);

        logger
            .log_cli_invocation(
                "cursor",
                "execute",
                vec!["--model".to_string(), "claude-3".to_string()],
            )
            .unwrap();

        let entries = logger.read_all().unwrap();
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].module, "cli");
        assert_eq!(entries[0].args.get("platform").unwrap(), "cursor");
        assert!(entries[0].args.get("args").unwrap().contains("--model"));
    }

    #[test]
    fn test_log_file_operation() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("intensive.jsonl");
        let logger = IntensiveLogger::new(log_path, true);

        let mut details = HashMap::new();
        details.insert("size".to_string(), "1024".to_string());

        logger
            .log_file_operation("write", "/tmp/test.txt", Some(details))
            .unwrap();

        let entries = logger.read_all().unwrap();
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].module, "fs");
        assert_eq!(entries[0].context.get("operation").unwrap(), "write");
        assert_eq!(entries[0].context.get("size").unwrap(), "1024");
    }

    #[test]
    fn test_read_by_module() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("intensive.jsonl");
        let logger = IntensiveLogger::new(log_path, true);

        logger
            .log_simple("module1", "fn1", LogLevel::Info, "Message 1")
            .unwrap();
        logger
            .log_simple("module2", "fn2", LogLevel::Info, "Message 2")
            .unwrap();
        logger
            .log_simple("module1", "fn3", LogLevel::Info, "Message 3")
            .unwrap();

        let module1_entries = logger.read_by_module("module1").unwrap();
        assert_eq!(module1_entries.len(), 2);
    }

    #[test]
    fn test_read_by_level() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("intensive.jsonl");
        let logger = IntensiveLogger::new(log_path, true);

        logger
            .log_simple("test", "fn1", LogLevel::Info, "Info message")
            .unwrap();
        logger
            .log_simple("test", "fn2", LogLevel::Error, "Error message")
            .unwrap();
        logger
            .log_simple("test", "fn3", LogLevel::Info, "Another info")
            .unwrap();

        let info_entries = logger.read_by_level(LogLevel::Info).unwrap();
        assert_eq!(info_entries.len(), 2);

        let error_entries = logger.read_by_level(LogLevel::Error).unwrap();
        assert_eq!(error_entries.len(), 1);
    }

    #[test]
    fn test_enable_disable() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("intensive.jsonl");
        let mut logger = IntensiveLogger::new(log_path, false);

        assert!(!logger.is_enabled());

        logger.enable();
        assert!(logger.is_enabled());

        logger.disable();
        assert!(!logger.is_enabled());
    }

    #[test]
    fn test_function_timer() {
        let timer = FunctionTimer::new("test", "function");
        std::thread::sleep(std::time::Duration::from_millis(10));
        let (module, function, duration_ms) = timer.stop();

        assert_eq!(module, "test");
        assert_eq!(function, "function");
        assert!(duration_ms >= 10);
    }

    #[test]
    fn test_log_level_ordering() {
        assert!(LogLevel::Trace < LogLevel::Debug);
        assert!(LogLevel::Debug < LogLevel::Info);
        assert!(LogLevel::Info < LogLevel::Warn);
        assert!(LogLevel::Warn < LogLevel::Error);
    }

    #[test]
    fn test_clear() {
        let temp_dir = TempDir::new().unwrap();
        let log_path = temp_dir.path().join("intensive.jsonl");
        let logger = IntensiveLogger::new(log_path.clone(), true);

        logger
            .log_simple("test", "fn", LogLevel::Info, "Test")
            .unwrap();

        assert!(log_path.exists());
        logger.clear().unwrap();
        assert!(!log_path.exists());
    }
}
