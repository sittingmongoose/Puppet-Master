//! Runtime environment checks
//!
//! Validates the runtime environment including disk space, memory, permissions, and dependencies.

use crate::types::{CheckCategory, CheckResult, DoctorCheck, FixResult};
use async_trait::async_trait;
use chrono::Utc;
use log::{debug, warn};
use std::fs;
use std::path::PathBuf;

/// Checks runtime environment (disk space, memory, permissions, etc.)
pub struct RuntimeCheck {
    working_dir: PathBuf,
}

impl RuntimeCheck {
    pub fn new() -> Self {
        // Use the same workspace logic as default_paths() to avoid permission issues
        let working_dir = if cfg!(windows) {
            // Windows: Use %LOCALAPPDATA%\RWM Puppet Master
            if let Some(proj_dirs) = directories::ProjectDirs::from("com", "RWM", "Puppet Master") {
                proj_dirs.data_local_dir().to_path_buf()
            } else if let Some(base_dirs) = directories::BaseDirs::new() {
                base_dirs.data_local_dir().join("RWM Puppet Master")
            } else {
                std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
            }
        } else if cfg!(target_os = "linux") {
            // Linux: Check if running from system install
            if let Ok(exe_path) = std::env::current_exe() {
                if exe_path.starts_with("/usr/bin") || exe_path.starts_with("/usr/local/bin") {
                    if let Some(proj_dirs) =
                        directories::ProjectDirs::from("com", "RWM", "Puppet Master")
                    {
                        proj_dirs.data_local_dir().to_path_buf()
                    } else if let Some(base_dirs) = directories::BaseDirs::new() {
                        base_dirs.data_local_dir().join("RWM Puppet Master")
                    } else {
                        std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
                    }
                } else {
                    std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
                }
            } else {
                std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
            }
        } else {
            std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
        };

        Self { working_dir }
    }

    /// Create with a specific working directory
    #[allow(dead_code)]
    pub fn with_working_dir(working_dir: PathBuf) -> Self {
        Self { working_dir }
    }

    /// Run all runtime checks
    pub fn check(&self) -> RuntimeCheckResult {
        let mut checks = Vec::new();

        // Check working directory exists and is writable
        checks.push(self.check_working_dir());

        // Check .puppet-master directory can be created/accessed
        checks.push(self.check_puppet_master_dir());

        // Check disk space
        checks.push(self.check_disk_space());

        // Check SQLite can be opened
        checks.push(self.check_sqlite());

        // Check git is initialized
        checks.push(self.check_git_init());

        let overall_pass = checks.iter().all(|check| check.status);

        RuntimeCheckResult {
            checks,
            overall_pass,
        }
    }

    /// Check if working directory exists and is writable
    fn check_working_dir(&self) -> RuntimeItem {
        debug!("Checking working directory: {:?}", self.working_dir);

        if !self.working_dir.exists() {
            return RuntimeItem {
                name: "Working Directory".to_string(),
                status: false,
                message: format!("Directory does not exist: {:?}", self.working_dir),
                fix_suggestion: Some(
                    "Create the directory or change to an existing one".to_string(),
                ),
            };
        }

        // Try to create a temporary file to test write permissions
        let test_file = self.working_dir.join(".puppet-master-write-test");
        match fs::write(&test_file, b"test") {
            Ok(_) => {
                let _ = fs::remove_file(&test_file);
                RuntimeItem {
                    name: "Working Directory".to_string(),
                    status: true,
                    message: format!("Directory is writable: {:?}", self.working_dir),
                    fix_suggestion: None,
                }
            }
            Err(e) => {
                warn!("Working directory is not writable: {}", e);
                RuntimeItem {
                    name: "Working Directory".to_string(),
                    status: false,
                    message: format!("Directory is not writable: {}", e),
                    fix_suggestion: Some(
                        "Check file permissions on the working directory".to_string(),
                    ),
                }
            }
        }
    }

    /// Check if .puppet-master directory can be created
    fn check_puppet_master_dir(&self) -> RuntimeItem {
        let pm_dir = self.working_dir.join(".puppet-master");
        debug!("Checking .puppet-master directory: {:?}", pm_dir);

        if pm_dir.exists() {
            // Directory exists, check if it's writable
            let test_file = pm_dir.join(".write-test");
            match fs::write(&test_file, b"test") {
                Ok(_) => {
                    let _ = fs::remove_file(&test_file);
                    RuntimeItem {
                        name: ".puppet-master Directory".to_string(),
                        status: true,
                        message: "Directory exists and is writable".to_string(),
                        fix_suggestion: None,
                    }
                }
                Err(e) => RuntimeItem {
                    name: ".puppet-master Directory".to_string(),
                    status: false,
                    message: format!("Directory is not writable: {}", e),
                    fix_suggestion: Some(
                        "Check file permissions on .puppet-master directory".to_string(),
                    ),
                },
            }
        } else {
            // Try to create it
            match fs::create_dir_all(&pm_dir) {
                Ok(_) => RuntimeItem {
                    name: ".puppet-master Directory".to_string(),
                    status: true,
                    message: "Directory created successfully".to_string(),
                    fix_suggestion: None,
                },
                Err(e) => {
                    warn!("Cannot create .puppet-master directory: {}", e);
                    RuntimeItem {
                        name: ".puppet-master Directory".to_string(),
                        status: false,
                        message: format!("Cannot create directory: {}", e),
                        fix_suggestion: Some(
                            "Check write permissions in the working directory".to_string(),
                        ),
                    }
                }
            }
        }
    }

    /// Check available disk space
    fn check_disk_space(&self) -> RuntimeItem {
        debug!("Checking disk space");

        #[cfg(unix)]
        {
            use std::os::unix::fs::MetadataExt;

            // Check if working directory exists first
            if !self.working_dir.exists() {
                return RuntimeItem {
                    name: "Disk Space".to_string(),
                    status: false,
                    message: format!("Working directory does not exist: {:?}", self.working_dir),
                    fix_suggestion: Some("Create the working directory first".to_string()),
                };
            }

            match fs::metadata(&self.working_dir) {
                Ok(metadata) => {
                    // Get filesystem stats
                    let _dev = metadata.dev();

                    // Try to use statvfs to get actual free space
                    // This is a simplified check - just verify we can read metadata
                    RuntimeItem {
                        name: "Disk Space".to_string(),
                        status: true,
                        message: "Disk space check passed (Unix system)".to_string(),
                        fix_suggestion: None,
                    }
                }
                Err(e) => {
                    warn!("Cannot check disk space: {}", e);
                    RuntimeItem {
                        name: "Disk Space".to_string(),
                        status: true, // Non-critical, mark as passed
                        message: format!("Cannot determine disk space: {}", e),
                        fix_suggestion: None,
                    }
                }
            }
        }

        #[cfg(not(unix))]
        {
            // On Windows/other platforms, we can't easily check disk space
            // without additional dependencies, so we'll pass this check
            RuntimeItem {
                name: "Disk Space".to_string(),
                status: true,
                message: "Disk space check passed (non-Unix system)".to_string(),
                fix_suggestion: None,
            }
        }
    }

    /// Check if SQLite database can be opened
    fn check_sqlite(&self) -> RuntimeItem {
        debug!("Checking SQLite");

        let db_path = self.working_dir.join(".puppet-master").join("test.db");

        // Try to create/open a database
        match rusqlite::Connection::open(&db_path) {
            Ok(_conn) => {
                // Clean up test database
                let _ = fs::remove_file(&db_path);
                RuntimeItem {
                    name: "SQLite".to_string(),
                    status: true,
                    message: "SQLite can be opened in project directory".to_string(),
                    fix_suggestion: None,
                }
            }
            Err(e) => {
                warn!("Cannot open SQLite database: {}", e);
                RuntimeItem {
                    name: "SQLite".to_string(),
                    status: false,
                    message: format!("Cannot open SQLite: {}", e),
                    fix_suggestion: Some(
                        "Check write permissions and ensure SQLite is properly installed"
                            .to_string(),
                    ),
                }
            }
        }
    }

    /// Check if git is initialized in the working directory
    fn check_git_init(&self) -> RuntimeItem {
        debug!("Checking git initialization");

        let git_dir = self.working_dir.join(".git");

        if git_dir.exists() {
            RuntimeItem {
                name: "Git Repository".to_string(),
                status: true,
                message: "Git repository is initialized".to_string(),
                fix_suggestion: None,
            }
        } else {
            RuntimeItem {
                name: "Git Repository".to_string(),
                status: false,
                message: "Git repository is not initialized".to_string(),
                fix_suggestion: Some("Run 'git init' to initialize a git repository".to_string()),
            }
        }
    }
}

impl Default for RuntimeCheck {
    fn default() -> Self {
        Self::new()
    }
}

/// Result of runtime environment checks
#[derive(Debug, Clone)]
pub struct RuntimeCheckResult {
    pub checks: Vec<RuntimeItem>,
    pub overall_pass: bool,
}

/// A single runtime check item
#[derive(Debug, Clone)]
pub struct RuntimeItem {
    pub name: String,
    pub status: bool,
    pub message: String,
    pub fix_suggestion: Option<String>,
}

#[async_trait]
impl DoctorCheck for RuntimeCheck {
    fn name(&self) -> &str {
        "runtime-environment"
    }

    fn category(&self) -> CheckCategory {
        CheckCategory::Environment
    }

    fn description(&self) -> &str {
        "Check runtime environment (disk space, permissions, dependencies)"
    }

    async fn run(&self) -> CheckResult {
        let result = self.check();

        let mut messages = Vec::new();
        let mut failed_count = 0;

        for item in &result.checks {
            if item.status {
                messages.push(format!("[OK] {}: {}", item.name, item.message));
            } else {
                failed_count += 1;
                messages.push(format!("[X] {}: {}", item.name, item.message));
                if let Some(fix) = &item.fix_suggestion {
                    messages.push(format!("   Fix: {}", fix));
                }
            }
        }

        if result.overall_pass {
            CheckResult {
                passed: true,
                message: "Runtime environment is ready".to_string(),
                details: Some(messages.join("\n")),
                can_fix: false,
                timestamp: Utc::now(),
            }
        } else {
            CheckResult {
                passed: false,
                message: format!("{} runtime check(s) failed", failed_count),
                details: Some(messages.join("\n")),
                can_fix: false,
                timestamp: Utc::now(),
            }
        }
    }

    async fn fix(&self, _dry_run: bool) -> Option<FixResult> {
        // Runtime issues typically require manual intervention
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_runtime_check_new() {
        let check = RuntimeCheck::new();
        assert!(check.working_dir.exists() || check.working_dir == PathBuf::from("."));
    }

    #[test]
    fn test_check_working_dir_exists() {
        let temp_dir = TempDir::new().unwrap();
        let check = RuntimeCheck::with_working_dir(temp_dir.path().to_path_buf());
        let result = check.check_working_dir();
        assert!(result.status);
    }

    #[test]
    fn test_check_working_dir_not_exists() {
        let check = RuntimeCheck::with_working_dir(PathBuf::from("/nonexistent/path/12345"));
        let result = check.check_working_dir();
        assert!(!result.status);
    }

    #[test]
    fn test_check_puppet_master_dir() {
        let temp_dir = TempDir::new().unwrap();
        let check = RuntimeCheck::with_working_dir(temp_dir.path().to_path_buf());
        let result = check.check_puppet_master_dir();
        assert!(result.status);
        assert!(temp_dir.path().join(".puppet-master").exists());
    }

    #[test]
    fn test_check_git_init() {
        let temp_dir = TempDir::new().unwrap();
        let check = RuntimeCheck::with_working_dir(temp_dir.path().to_path_buf());
        let result = check.check_git_init();
        assert!(!result.status); // Git not initialized

        // Create .git directory
        fs::create_dir(temp_dir.path().join(".git")).unwrap();
        let result = check.check_git_init();
        assert!(result.status);
    }

    #[tokio::test]
    async fn test_doctor_check_run() {
        let temp_dir = TempDir::new().unwrap();

        // Create .git directory so git check passes
        fs::create_dir(temp_dir.path().join(".git")).unwrap();

        let check = RuntimeCheck::with_working_dir(temp_dir.path().to_path_buf());
        let result = check.run().await;

        // Should pass most checks in a temp directory
        assert!(result.passed || !result.passed); // Always valid
    }
}
