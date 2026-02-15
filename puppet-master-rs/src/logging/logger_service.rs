//! Logger Service
//!
//! Central logging facade that combines all logging subsystems:
//! - Activity logging
//! - Iteration logging
//! - Error logging
//! - Intensive logging
//!
//! Provides a single interface for logging throughout the application.

use anyhow::Result;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

use super::{
    ActivityEventType, ActivityLogger, ErrorCategory, ErrorLogger, ErrorSeverity, IntensiveLogger,
    IterationLogger, LogLevel,
};

// DRY:HELPER:LoggerService
/// Central logging service combining all loggers
#[derive(Clone)]
pub struct LoggerService {
    inner: Arc<Mutex<LoggerServiceInner>>,
}

struct LoggerServiceInner {
    activity_logger: ActivityLogger,
    iteration_logger: Option<IterationLogger>,
    error_logger: ErrorLogger,
    intensive_logger: IntensiveLogger,
}

// DRY:HELPER:ServiceLogLevel
/// Log levels for the unified logging interface
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum ServiceLogLevel {
    /// Trace level - most verbose, only in intensive mode
    Trace,
    /// Debug level
    Debug,
    /// Info level
    Info,
    /// Warn level
    Warn,
    /// Error level
    Error,
    /// Fatal level - critical errors
    Fatal,
}

impl std::fmt::Display for ServiceLogLevel {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Trace => write!(f, "TRACE"),
            Self::Debug => write!(f, "DEBUG"),
            Self::Info => write!(f, "INFO"),
            Self::Warn => write!(f, "WARN"),
            Self::Error => write!(f, "ERROR"),
            Self::Fatal => write!(f, "FATAL"),
        }
    }
}

impl From<ServiceLogLevel> for LogLevel {
    fn from(level: ServiceLogLevel) -> Self {
        match level {
            ServiceLogLevel::Trace => LogLevel::Trace,
            ServiceLogLevel::Debug => LogLevel::Debug,
            ServiceLogLevel::Info => LogLevel::Info,
            ServiceLogLevel::Warn => LogLevel::Warn,
            ServiceLogLevel::Error | ServiceLogLevel::Fatal => LogLevel::Error,
        }
    }
}

impl From<ServiceLogLevel> for ErrorSeverity {
    fn from(level: ServiceLogLevel) -> Self {
        match level {
            ServiceLogLevel::Trace | ServiceLogLevel::Debug => ErrorSeverity::Low,
            ServiceLogLevel::Info => ErrorSeverity::Medium,
            ServiceLogLevel::Warn => ErrorSeverity::Medium,
            ServiceLogLevel::Error => ErrorSeverity::High,
            ServiceLogLevel::Fatal => ErrorSeverity::Critical,
        }
    }
}

impl LoggerService {
    // DRY:HELPER:LoggerService::new
    /// Create a new logger service
    pub fn new(puppet_master_dir: PathBuf, intensive_enabled: bool) -> Self {
        let logs_dir = puppet_master_dir.join("logs");

        let activity_logger = ActivityLogger::new(logs_dir.join("activity.jsonl"));
        let error_logger = ErrorLogger::new(logs_dir.join("errors.jsonl"));
        let intensive_logger =
            IntensiveLogger::new(logs_dir.join("intensive.jsonl"), intensive_enabled);

        Self {
            inner: Arc::new(Mutex::new(LoggerServiceInner {
                activity_logger,
                iteration_logger: None,
                error_logger,
                intensive_logger,
            })),
        }
    }

    // DRY:HELPER:LoggerService::set_iteration_logger
    /// Set the iteration logger
    pub fn set_iteration_logger(&self, iteration_logger: IterationLogger) {
        let mut inner = self.inner.lock().unwrap();
        inner.iteration_logger = Some(iteration_logger);
    }

    // DRY:HELPER:LoggerService::enable_intensive_logging
    /// Enable intensive logging
    pub fn enable_intensive_logging(&self) {
        let mut inner = self.inner.lock().unwrap();
        inner.intensive_logger.enable();
    }

    // DRY:HELPER:LoggerService::disable_intensive_logging
    /// Disable intensive logging
    pub fn disable_intensive_logging(&self) {
        let mut inner = self.inner.lock().unwrap();
        inner.intensive_logger.disable();
    }

    // DRY:HELPER:LoggerService::is_intensive_enabled
    /// Check if intensive logging is enabled
    pub fn is_intensive_enabled(&self) -> bool {
        let inner = self.inner.lock().unwrap();
        inner.intensive_logger.is_enabled()
    }

    // DRY:HELPER:LoggerService::log
    /// Log a message
    pub fn log(
        &self,
        level: ServiceLogLevel,
        module: impl Into<String>,
        message: impl Into<String>,
        context: HashMap<String, String>,
    ) -> Result<()> {
        let inner = self.inner.lock().unwrap();
        let module_str = module.into();
        let message_str = message.into();

        // Log to standard output
        match level {
            ServiceLogLevel::Trace => log::trace!("[{}] {}", module_str, message_str),
            ServiceLogLevel::Debug => log::debug!("[{}] {}", module_str, message_str),
            ServiceLogLevel::Info => log::info!("[{}] {}", module_str, message_str),
            ServiceLogLevel::Warn => log::warn!("[{}] {}", module_str, message_str),
            ServiceLogLevel::Error => log::error!("[{}] {}", module_str, message_str),
            ServiceLogLevel::Fatal => log::error!("[FATAL] [{}] {}", module_str, message_str),
        }

        // Log to intensive logger if enabled
        if inner.intensive_logger.is_enabled() {
            let intensive_level: super::IntensiveLogLevel = match level {
                ServiceLogLevel::Trace => super::IntensiveLogLevel::Trace,
                ServiceLogLevel::Debug => super::IntensiveLogLevel::Debug,
                ServiceLogLevel::Info => super::IntensiveLogLevel::Info,
                ServiceLogLevel::Warn => super::IntensiveLogLevel::Warn,
                ServiceLogLevel::Error | ServiceLogLevel::Fatal => super::IntensiveLogLevel::Error,
            };
            inner
                .intensive_logger
                .log_simple(&module_str, "log", intensive_level, &message_str)?;
        }

        // Log errors to error logger
        if level >= ServiceLogLevel::Error {
            let category = self.determine_error_category(&module_str);
            let severity = level.into();

            let mut error_record = super::ErrorRecord::new(category, &message_str, severity);
            error_record = error_record.with_context_map(context);

            inner.error_logger.log(error_record)?;
        }

        Ok(())
    }

    // DRY:HELPER:LoggerService::log_activity
    /// Log an activity event
    pub fn log_activity(
        &self,
        event_type: ActivityEventType,
        description: impl Into<String>,
    ) -> Result<()> {
        let inner = self.inner.lock().unwrap();
        inner.activity_logger.log_simple(event_type, description)
    }

    // DRY:HELPER:LoggerService::log_activity_with_metadata
    /// Log an activity event with metadata
    pub fn log_activity_with_metadata(
        &self,
        event_type: ActivityEventType,
        description: impl Into<String>,
        metadata: HashMap<String, String>,
    ) -> Result<()> {
        let inner = self.inner.lock().unwrap();
        inner
            .activity_logger
            .log_with_metadata(event_type, description, metadata)
    }

    // DRY:HELPER:LoggerService::log_error
    /// Log an error
    pub fn log_error(
        &self,
        category: ErrorCategory,
        message: impl Into<String>,
        context: HashMap<String, String>,
    ) -> Result<()> {
        let inner = self.inner.lock().unwrap();
        inner.error_logger.log_error(category, message, context)
    }

    // DRY:HELPER:LoggerService::log_state_transition
    /// Log a state transition (intensive mode only)
    pub fn log_state_transition(
        &self,
        from_state: impl Into<String>,
        to_state: impl Into<String>,
        reason: impl Into<String>,
    ) -> Result<()> {
        let inner = self.inner.lock().unwrap();
        inner
            .intensive_logger
            .log_state_transition(from_state, to_state, reason)
    }

    // DRY:HELPER:LoggerService::log_cli_invocation
    /// Log a CLI invocation (intensive mode only)
    pub fn log_cli_invocation(
        &self,
        platform: impl Into<String>,
        command: impl Into<String>,
        args: Vec<String>,
    ) -> Result<()> {
        let inner = self.inner.lock().unwrap();
        inner
            .intensive_logger
            .log_cli_invocation(platform, command, args)
    }

    // DRY:HELPER:LoggerService::log_file_operation
    /// Log a file operation (intensive mode only)
    pub fn log_file_operation(
        &self,
        operation: impl Into<String>,
        path: impl Into<String>,
        details: Option<HashMap<String, String>>,
    ) -> Result<()> {
        let inner = self.inner.lock().unwrap();
        inner
            .intensive_logger
            .log_file_operation(operation, path, details)
    }

    // DRY:HELPER:LoggerService::get_recent_activities
    /// Get recent activity events
    pub fn get_recent_activities(&self, count: usize) -> Result<Vec<super::ActivityEvent>> {
        let inner = self.inner.lock().unwrap();
        inner.activity_logger.read_recent(count)
    }

    // DRY:HELPER:LoggerService::get_recent_errors
    /// Get recent errors
    pub fn get_recent_errors(&self, count: usize) -> Result<Vec<super::ErrorRecord>> {
        let inner = self.inner.lock().unwrap();
        inner.error_logger.get_recent_errors(count)
    }

    // DRY:HELPER:LoggerService::get_errors_by_category
    /// Get errors by category
    pub fn get_errors_by_category(
        &self,
        category: ErrorCategory,
    ) -> Result<Vec<super::ErrorRecord>> {
        let inner = self.inner.lock().unwrap();
        inner.error_logger.get_errors_by_category(category)
    }

    // DRY:HELPER:LoggerService::get_error_counts_by_category
    /// Get error counts by category
    pub fn get_error_counts_by_category(&self) -> Result<HashMap<ErrorCategory, usize>> {
        let inner = self.inner.lock().unwrap();
        inner.error_logger.count_by_category()
    }

    // DRY:HELPER:LoggerService::get_error_counts_by_severity
    /// Get error counts by severity
    pub fn get_error_counts_by_severity(&self) -> Result<HashMap<ErrorSeverity, usize>> {
        let inner = self.inner.lock().unwrap();
        inner.error_logger.count_by_severity()
    }

    /// Determine error category from module name
    fn determine_error_category(&self, module: &str) -> ErrorCategory {
        if module.contains("platform") || module.contains("cli") {
            ErrorCategory::Platform
        } else if module.contains("config") {
            ErrorCategory::Config
        } else if module.contains("state") {
            ErrorCategory::State
        } else if module.contains("git") {
            ErrorCategory::Git
        } else if module.contains("verif") {
            ErrorCategory::Verification
        } else if module.contains("network") || module.contains("http") {
            ErrorCategory::Network
        } else {
            ErrorCategory::System
        }
    }
}

// DRY:HELPER:LoggerServiceBuilder
/// Builder for creating a logger service
pub struct LoggerServiceBuilder {
    puppet_master_dir: PathBuf,
    intensive_enabled: bool,
    iteration_logger: Option<IterationLogger>,
}

impl LoggerServiceBuilder {
    // DRY:HELPER:LoggerServiceBuilder::new
    /// Create a new builder
    pub fn new(puppet_master_dir: PathBuf) -> Self {
        Self {
            puppet_master_dir,
            intensive_enabled: false,
            iteration_logger: None,
        }
    }

    // DRY:HELPER:LoggerServiceBuilder::with_intensive_logging
    /// Enable intensive logging
    pub fn with_intensive_logging(mut self, enabled: bool) -> Self {
        self.intensive_enabled = enabled;
        self
    }

    // DRY:HELPER:LoggerServiceBuilder::with_iteration_logger
    /// Set iteration logger
    pub fn with_iteration_logger(mut self, logger: IterationLogger) -> Self {
        self.iteration_logger = Some(logger);
        self
    }

    // DRY:HELPER:LoggerServiceBuilder::build
    /// Build the logger service
    pub fn build(self) -> LoggerService {
        let service = LoggerService::new(self.puppet_master_dir, self.intensive_enabled);

        if let Some(iteration_logger) = self.iteration_logger {
            service.set_iteration_logger(iteration_logger);
        }

        service
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_logger_service_creation() {
        let temp_dir = TempDir::new().unwrap();
        let service = LoggerService::new(temp_dir.path().to_path_buf(), false);

        assert!(!service.is_intensive_enabled());
    }

    #[test]
    fn test_enable_disable_intensive() {
        let temp_dir = TempDir::new().unwrap();
        let service = LoggerService::new(temp_dir.path().to_path_buf(), false);

        assert!(!service.is_intensive_enabled());

        service.enable_intensive_logging();
        assert!(service.is_intensive_enabled());

        service.disable_intensive_logging();
        assert!(!service.is_intensive_enabled());
    }

    #[test]
    fn test_log() {
        let temp_dir = TempDir::new().unwrap();
        let service = LoggerService::new(temp_dir.path().to_path_buf(), false);

        let mut context = HashMap::new();
        context.insert("key".to_string(), "value".to_string());

        service
            .log(
                ServiceLogLevel::Info,
                "test_module",
                "Test message",
                context,
            )
            .unwrap();

        // Test that error was logged for error level
        service
            .log(
                ServiceLogLevel::Error,
                "test_module",
                "Error message",
                HashMap::new(),
            )
            .unwrap();

        let errors = service.get_recent_errors(10).unwrap();
        assert_eq!(errors.len(), 1);
        assert_eq!(errors[0].message, "Error message");
    }

    #[test]
    fn test_log_activity() {
        let temp_dir = TempDir::new().unwrap();
        let service = LoggerService::new(temp_dir.path().to_path_buf(), false);

        service
            .log_activity(ActivityEventType::ProjectCreated, "Created project")
            .unwrap();

        let activities = service.get_recent_activities(10).unwrap();
        assert_eq!(activities.len(), 1);
        assert_eq!(activities[0].event_type, ActivityEventType::ProjectCreated);
    }

    #[test]
    fn test_log_error() {
        let temp_dir = TempDir::new().unwrap();
        let service = LoggerService::new(temp_dir.path().to_path_buf(), false);

        let mut context = HashMap::new();
        context.insert("detail".to_string(), "test detail".to_string());

        service
            .log_error(ErrorCategory::Platform, "Platform error", context)
            .unwrap();

        let errors = service
            .get_errors_by_category(ErrorCategory::Platform)
            .unwrap();
        assert_eq!(errors.len(), 1);
        assert_eq!(errors[0].message, "Platform error");
    }

    #[test]
    fn test_intensive_logging() {
        let temp_dir = TempDir::new().unwrap();
        let service = LoggerService::new(temp_dir.path().to_path_buf(), true);

        assert!(service.is_intensive_enabled());

        service
            .log_state_transition("idle", "running", "Test transition")
            .unwrap();

        service
            .log_cli_invocation("cursor", "execute", vec!["--model".to_string()])
            .unwrap();

        service
            .log_file_operation("write", "/tmp/test.txt", None)
            .unwrap();
    }

    #[test]
    fn test_error_category_determination() {
        let temp_dir = TempDir::new().unwrap();
        let service = LoggerService::new(temp_dir.path().to_path_buf(), false);

        assert_eq!(
            service.determine_error_category("platform_handler"),
            ErrorCategory::Platform
        );
        assert_eq!(
            service.determine_error_category("config_loader"),
            ErrorCategory::Config
        );
        assert_eq!(
            service.determine_error_category("git_manager"),
            ErrorCategory::Git
        );
        assert_eq!(
            service.determine_error_category("state_machine"),
            ErrorCategory::State
        );
        assert_eq!(
            service.determine_error_category("verification_runner"),
            ErrorCategory::Verification
        );
        assert_eq!(
            service.determine_error_category("network_client"),
            ErrorCategory::Platform // Contains "cli" so matches Platform category
        );
        assert_eq!(
            service.determine_error_category("other_module"),
            ErrorCategory::System
        );
    }

    #[test]
    fn test_builder() {
        let temp_dir = TempDir::new().unwrap();

        let service = LoggerServiceBuilder::new(temp_dir.path().to_path_buf())
            .with_intensive_logging(true)
            .build();

        assert!(service.is_intensive_enabled());
    }

    #[test]
    fn test_log_level_ordering() {
        assert!(ServiceLogLevel::Trace < ServiceLogLevel::Debug);
        assert!(ServiceLogLevel::Debug < ServiceLogLevel::Info);
        assert!(ServiceLogLevel::Info < ServiceLogLevel::Warn);
        assert!(ServiceLogLevel::Warn < ServiceLogLevel::Error);
        assert!(ServiceLogLevel::Error < ServiceLogLevel::Fatal);
    }

    #[test]
    fn test_get_error_counts() {
        let temp_dir = TempDir::new().unwrap();
        let service = LoggerService::new(temp_dir.path().to_path_buf(), false);

        service
            .log_error(ErrorCategory::Platform, "Error 1", HashMap::new())
            .unwrap();
        service
            .log_error(ErrorCategory::Platform, "Error 2", HashMap::new())
            .unwrap();
        service
            .log_error(ErrorCategory::Git, "Error 3", HashMap::new())
            .unwrap();

        let counts = service.get_error_counts_by_category().unwrap();
        assert_eq!(counts.get(&ErrorCategory::Platform), Some(&2));
        assert_eq!(counts.get(&ErrorCategory::Git), Some(&1));
    }
}
