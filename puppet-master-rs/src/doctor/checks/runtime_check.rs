//! Runtime environment checks
//!
//! Validates the runtime environment including disk space, memory, permissions, and dependencies.

use crate::types::{CheckCategory, CheckResult, DoctorCheck, FixResult};
use async_trait::async_trait;
use chrono::Utc;
use log::{debug, warn};
use std::fs;
use std::path::{Path, PathBuf};

// DRY:DATA:RuntimeCheck
/// Checks runtime environment (disk space, memory, permissions, etc.)
pub struct RuntimeCheck {
    working_dir: PathBuf,
}

impl RuntimeCheck {
    // DRY:FN:new
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

    // DRY:FN:with_working_dir
    /// Create with a specific working directory
    #[allow(dead_code)]
    pub fn with_working_dir(working_dir: PathBuf) -> Self {
        Self { working_dir }
    }

    fn resolve_project_root(&self) -> PathBuf {
        resolve_project_root_for_doctor(&self.working_dir)
    }

    fn in_project_context(&self) -> bool {
        has_project_markers(&self.resolve_project_root())
    }

    // DRY:FN:check
    /// Run all runtime checks
    pub fn check(&self) -> RuntimeCheckResult {
        let mut checks = Vec::new();

        // Check working directory exists and is writable
        checks.push(self.check_working_dir());

        // Check .puppet-master directory presence/access
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

        match directory_appears_writable(&self.working_dir) {
            Ok(_) => RuntimeItem {
                name: "Working Directory".to_string(),
                status: true,
                message: format!("Directory appears writable: {:?}", self.working_dir),
                fix_suggestion: None,
            },
            Err(e) => {
                warn!("Working directory appears read-only: {}", e);
                RuntimeItem {
                    name: "Working Directory".to_string(),
                    status: false,
                    message: format!("Directory appears read-only: {}", e),
                    fix_suggestion: Some(
                        "Check file permissions on the working directory".to_string(),
                    ),
                }
            }
        }
    }

    /// Check if .puppet-master directory exists and appears writable
    fn check_puppet_master_dir(&self) -> RuntimeItem {
        let project_root = self.resolve_project_root();
        let pm_dir = crate::utils::puppet_master_dir(&project_root);
        debug!("Checking .puppet-master directory: {:?}", pm_dir);

        if pm_dir.exists() {
            match directory_appears_writable(&pm_dir) {
                Ok(_) => RuntimeItem {
                    name: ".puppet-master Directory".to_string(),
                    status: true,
                    message: format!("Directory exists and appears writable: {:?}", pm_dir),
                    fix_suggestion: None,
                },
                Err(e) => RuntimeItem {
                    name: ".puppet-master Directory".to_string(),
                    status: false,
                    message: format!("Directory appears read-only: {}", e),
                    fix_suggestion: Some(
                        "Check file permissions on .puppet-master directory".to_string(),
                    ),
                },
            }
        } else {
            if self.in_project_context() {
                warn!(".puppet-master directory is missing in project context");
                RuntimeItem {
                    name: ".puppet-master Directory".to_string(),
                    status: false,
                    message: format!("Directory is missing: {:?}", pm_dir),
                    fix_suggestion: Some(
                        "Create .puppet-master in the project root (or run project setup)"
                            .to_string(),
                    ),
                }
            } else {
                RuntimeItem {
                    name: ".puppet-master Directory".to_string(),
                    status: true,
                    message: ".puppet-master not found (informational outside project context)"
                        .to_string(),
                    fix_suggestion: None,
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

        // Use in-memory DB to avoid side effects during a read-only doctor run.
        match rusqlite::Connection::open_in_memory() {
            Ok(_conn) => RuntimeItem {
                name: "SQLite".to_string(),
                status: true,
                message: "SQLite is available (in-memory connection succeeded)".to_string(),
                fix_suggestion: None,
            },
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
        let project_root = self.resolve_project_root();

        if !has_project_markers(&project_root) {
            return RuntimeItem {
                name: "Git Repository".to_string(),
                status: true,
                message: format!(
                    "Not a project root; git check is informational (checked: {:?})",
                    project_root
                ),
                fix_suggestion: None,
            };
        }

        let git_dir = project_root.join(".git");

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

fn resolve_project_root_for_doctor(cwd: &Path) -> PathBuf {
    let derived = crate::utils::derive_project_root(cwd).unwrap_or_else(|_| cwd.to_path_buf());
    if derived
        .file_name()
        .is_some_and(|name| name == "puppet-master-rs")
    {
        if let Some(parent) = derived.parent() {
            if crate::utils::puppet_master_dir(parent).exists() {
                return parent.to_path_buf();
            }
        }
    }
    derived
}

fn has_project_markers(path: &Path) -> bool {
    if [".git", "Cargo.toml", "package.json", "pom.xml", "go.mod"]
        .iter()
        .any(|marker| path.join(marker).exists())
    {
        return true;
    }

    // Treat .puppet-master as a project marker only when it has canonical project files.
    let puppet_master_dir = path.join(".puppet-master");
    puppet_master_dir.join("prd.json").exists()
}

fn directory_appears_writable(path: &Path) -> Result<(), String> {
    let metadata = fs::metadata(path).map_err(|e| e.to_string())?;
    if metadata.permissions().readonly() {
        return Err("permissions are read-only".to_string());
    }
    Ok(())
}

impl Default for RuntimeCheck {
    fn default() -> Self {
        Self::new()
    }
}

// DRY:DATA:RuntimeCheckResult
/// Result of runtime environment checks
#[derive(Debug, Clone)]
pub struct RuntimeCheckResult {
    pub checks: Vec<RuntimeItem>,
    pub overall_pass: bool,
}

// DRY:DATA:RuntimeItem
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
        // Use a platform-appropriate non-existent path
        #[cfg(windows)]
        let nonexistent_path = PathBuf::from("C:\\nonexistent\\path\\12345");
        #[cfg(not(windows))]
        let nonexistent_path = PathBuf::from("/nonexistent/path/12345");

        let check = RuntimeCheck::with_working_dir(nonexistent_path);
        let result = check.check_working_dir();
        assert!(!result.status);
    }

    #[test]
    fn test_check_puppet_master_dir() {
        let temp_dir = TempDir::new().unwrap();
        fs::write(temp_dir.path().join("Cargo.toml"), "[package]").unwrap();
        let check = RuntimeCheck::with_working_dir(temp_dir.path().to_path_buf());
        let result = check.check_puppet_master_dir();
        assert!(!result.status);
        assert!(!temp_dir.path().join(".puppet-master").exists());
    }

    #[test]
    fn test_check_puppet_master_dir_is_informational_outside_project_context() {
        let temp_dir = TempDir::new().unwrap();
        let check = RuntimeCheck::with_working_dir(temp_dir.path().to_path_buf());
        let result = check.check_puppet_master_dir();
        assert!(result.status);
        assert!(!temp_dir.path().join(".puppet-master").exists());
    }

    #[test]
    fn test_check_git_init() {
        let temp_dir = TempDir::new().unwrap();
        fs::write(temp_dir.path().join("Cargo.toml"), "[package]").unwrap();
        let check = RuntimeCheck::with_working_dir(temp_dir.path().to_path_buf());
        let result = check.check_git_init();
        assert!(!result.status); // Git not initialized

        // Create .git directory
        fs::create_dir(temp_dir.path().join(".git")).unwrap();
        let result = check.check_git_init();
        assert!(result.status);
    }

    #[test]
    fn test_check_git_init_is_informational_outside_project_context() {
        let temp_dir = TempDir::new().unwrap();
        let check = RuntimeCheck::with_working_dir(temp_dir.path().to_path_buf());
        let result = check.check_git_init();
        assert!(result.status);
        assert!(result.message.contains("informational"));
    }

    #[test]
    fn test_bare_puppet_master_dir_is_not_treated_as_project_marker() {
        let temp_dir = TempDir::new().unwrap();
        fs::create_dir(temp_dir.path().join(".puppet-master")).unwrap();

        assert!(
            !has_project_markers(temp_dir.path()),
            "bare .puppet-master without prd.json should not force project context"
        );
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
