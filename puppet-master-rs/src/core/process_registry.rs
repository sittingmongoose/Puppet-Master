//! Process registry for tracking and terminating spawned processes
//!
//! Tracks all child processes spawned during execution with:
//! - Cross-platform termination (SIGTERM/SIGKILL on Unix, TerminateProcess on Windows)
//! - Process metadata and status tracking
//! - Session-based registry persistence
//! - Clean shutdown support

use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

#[cfg(unix)]
use nix::sys::signal::{kill, Signal};
#[cfg(unix)]
use nix::unistd::Pid;

/// Status of a tracked process
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProcessStatus {
    /// Process is running
    Running,
    /// Process was gracefully terminated
    Terminated,
    /// Process was forcefully killed
    Killed,
    /// Process exited on its own
    Exited,
}

/// Record of a single spawned process
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessRecord {
    /// Process ID
    pub pid: u32,
    /// Platform that spawned this process
    pub platform: String,
    /// Command that was executed
    pub command: String,
    /// Arguments passed to command
    pub args: Vec<String>,
    /// When the process was spawned
    pub spawned_at: DateTime<Utc>,
    /// Current status
    pub status: ProcessStatus,
    /// When process ended (if not running)
    pub ended_at: Option<DateTime<Utc>>,
    /// Exit code (if exited)
    pub exit_code: Option<i32>,
}

/// Session-level process registry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionRegistry {
    /// Session ID
    pub session_id: String,
    /// Orchestrator PID
    pub orchestrator_pid: u32,
    /// All tracked processes
    pub processes: Vec<ProcessRecord>,
    /// When session started
    pub started_at: DateTime<Utc>,
    /// Session status
    pub status: SessionStatus,
}

/// Status of a session
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SessionStatus {
    /// Session is active
    Active,
    /// Session was stopped gracefully
    Stopped,
    /// Session crashed or was interrupted
    Crashed,
}

/// Process registry manager
pub struct ProcessRegistry {
    /// Session ID
    session_id: String,
    /// Path to registry file
    registry_path: PathBuf,
    /// In-memory registry
    registry: SessionRegistry,
}

impl ProcessRegistry {
    /// Create new process registry
    ///
    /// # Arguments
    /// * `session_id` - Unique session identifier
    /// * `registry_path` - Path to persist registry (e.g., .puppet-master/sessions/{id}.json)
    pub fn new(session_id: String, registry_path: PathBuf) -> Self {
        let orchestrator_pid = std::process::id();
        
        let registry = SessionRegistry {
            session_id: session_id.clone(),
            orchestrator_pid,
            processes: Vec::new(),
            started_at: Utc::now(),
            status: SessionStatus::Active,
        };

        Self {
            session_id,
            registry_path,
            registry,
        }
    }

    /// Initialize registry (load existing or create new)
    pub async fn initialize(&mut self) -> Result<()> {
        // Try to load existing registry
        if self.registry_path.exists() {
            let json = fs::read_to_string(&self.registry_path)
                .context("Failed to read registry file")?;
            self.registry = serde_json::from_str(&json)
                .context("Failed to deserialize registry")?;
        }
        
        // Ensure directory exists
        if let Some(parent) = self.registry_path.parent() {
            fs::create_dir_all(parent)
                .context("Failed to create registry directory")?;
        }

        // Save initial state
        self.save().await?;

        Ok(())
    }

    /// Register a new process
    ///
    /// # Arguments
    /// * `pid` - Process ID
    /// * `platform` - Platform name (e.g., "cursor", "claude")
    /// * `command` - Command executed
    /// * `args` - Command arguments
    pub async fn register(
        &mut self,
        pid: u32,
        platform: impl Into<String>,
        command: impl Into<String>,
        args: Vec<String>,
    ) -> Result<()> {
        let record = ProcessRecord {
            pid,
            platform: platform.into(),
            command: command.into(),
            args,
            spawned_at: Utc::now(),
            status: ProcessStatus::Running,
            ended_at: None,
            exit_code: None,
        };

        self.registry.processes.push(record);
        self.save().await?;

        Ok(())
    }

    /// Unregister a process (mark as exited)
    ///
    /// # Arguments
    /// * `pid` - Process ID to unregister
    /// * `exit_code` - Exit code if known
    pub async fn unregister(&mut self, pid: u32, exit_code: Option<i32>) -> Result<()> {
        if let Some(record) = self.registry.processes.iter_mut().find(|p| p.pid == pid) {
            record.status = ProcessStatus::Exited;
            record.ended_at = Some(Utc::now());
            record.exit_code = exit_code;
            self.save().await?;
        }

        Ok(())
    }

    /// Terminate a specific process
    ///
    /// # Arguments
    /// * `pid` - Process ID to terminate
    /// * `force` - If true, use SIGKILL/TerminateProcess; if false, use SIGTERM
    pub async fn kill_process(&mut self, pid: u32, force: bool) -> Result<()> {
        // Find the process record
        let record = self.registry.processes.iter_mut().find(|p| p.pid == pid);
        
        if let Some(record) = record {
            if record.status != ProcessStatus::Running {
                // Already terminated
                return Ok(());
            }

            // Attempt termination
            let result = terminate_process(pid, force);
            
            match result {
                Ok(()) => {
                    record.status = if force {
                        ProcessStatus::Killed
                    } else {
                        ProcessStatus::Terminated
                    };
                    record.ended_at = Some(Utc::now());
                    self.save().await?;
                }
                Err(e) => {
                    // Process may have already exited
                    if is_process_not_found_error(&e) {
                        record.status = ProcessStatus::Exited;
                        record.ended_at = Some(Utc::now());
                        self.save().await?;
                    } else {
                        return Err(e);
                    }
                }
            }
        }

        Ok(())
    }

    /// Terminate all running processes
    ///
    /// # Arguments
    /// * `force` - If true, force kill all processes
    pub async fn kill_all(&mut self, force: bool) -> Result<()> {
        let running_pids: Vec<u32> = self
            .registry
            .processes
            .iter()
            .filter(|p| p.status == ProcessStatus::Running)
            .map(|p| p.pid)
            .collect();

        for pid in running_pids {
            // Ignore errors for individual processes
            let _ = self.kill_process(pid, force).await;
        }

        self.registry.status = SessionStatus::Stopped;
        self.save().await?;

        Ok(())
    }

    /// Kill processes by platform
    ///
    /// # Arguments
    /// * `platform` - Platform name to filter by
    /// * `force` - Whether to force kill
    pub async fn kill_by_platform(&mut self, platform: &str, force: bool) -> Result<()> {
        let matching_pids: Vec<u32> = self
            .registry
            .processes
            .iter()
            .filter(|p| p.platform == platform && p.status == ProcessStatus::Running)
            .map(|p| p.pid)
            .collect();

        for pid in matching_pids {
            let _ = self.kill_process(pid, force).await;
        }

        Ok(())
    }

    /// Get all currently running processes
    pub fn list_active(&self) -> Vec<&ProcessRecord> {
        self.registry
            .processes
            .iter()
            .filter(|p| p.status == ProcessStatus::Running)
            .collect()
    }

    /// Get all processes for a specific platform
    pub fn list_by_platform(&self, platform: &str) -> Vec<&ProcessRecord> {
        self.registry
            .processes
            .iter()
            .filter(|p| p.platform == platform)
            .collect()
    }

    /// Get full registry
    pub fn get_registry(&self) -> &SessionRegistry {
        &self.registry
    }

    /// Mark session as crashed
    pub async fn mark_crashed(&mut self) -> Result<()> {
        self.registry.status = SessionStatus::Crashed;
        self.save().await
    }

    /// Save registry to disk
    async fn save(&self) -> Result<()> {
        let json = serde_json::to_string_pretty(&self.registry)
            .context("Failed to serialize registry")?;
        
        // Atomic write using temp file
        let temp_path = self.registry_path.with_extension("tmp");
        fs::write(&temp_path, json)
            .context("Failed to write temp registry file")?;
        
        fs::rename(&temp_path, &self.registry_path)
            .context("Failed to rename registry file")?;

        Ok(())
    }
}

/// Cross-platform process termination
fn terminate_process(pid: u32, force: bool) -> Result<()> {
    #[cfg(unix)]
    {
        let signal = if force {
            Signal::SIGKILL
        } else {
            Signal::SIGTERM
        };
        
        let pid = Pid::from_raw(pid as i32);
        
        // Try to kill process group first (negative PID)
        let group_result = kill(Pid::from_raw(-pid.as_raw()), signal);
        
        if group_result.is_err() {
            // Fallback to single process
            kill(pid, signal)
                .context("Failed to send signal to process")?;
        }
        
        Ok(())
    }

    #[cfg(windows)]
    {
        use std::process::Command;
        
        let force_flag = if force { "/F" } else { "/T" };
        
        let output = Command::new("taskkill")
            .args(&[force_flag, "/PID", &pid.to_string()])
            .output()
            .context("Failed to execute taskkill")?;

        if !output.status.success() {
            let code = output.status.code().unwrap_or(-1);
            // Code 128 means process not found (already terminated)
            if code != 128 {
                return Err(anyhow::anyhow!(
                    "taskkill failed with code {}: {}",
                    code,
                    String::from_utf8_lossy(&output.stderr)
                ));
            }
        }

        Ok(())
    }
}

/// Check if error indicates process not found
fn is_process_not_found_error(error: &anyhow::Error) -> bool {
    let error_str = error.to_string().to_lowercase();
    error_str.contains("no such process") || error_str.contains("esrch")
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_registry_initialization() {
        let temp_dir = TempDir::new().unwrap();
        let registry_path = temp_dir.path().join("session.json");
        
        let mut registry = ProcessRegistry::new("test-session".to_string(), registry_path);
        registry.initialize().await.unwrap();

        assert_eq!(registry.registry.session_id, "test-session");
        assert_eq!(registry.registry.status, SessionStatus::Active);
    }

    #[tokio::test]
    async fn test_register_process() {
        let temp_dir = TempDir::new().unwrap();
        let registry_path = temp_dir.path().join("session.json");
        
        let mut registry = ProcessRegistry::new("test-session".to_string(), registry_path);
        registry.initialize().await.unwrap();

        registry
            .register(12345, "cursor", "echo", vec!["hello".to_string()])
            .await
            .unwrap();

        assert_eq!(registry.registry.processes.len(), 1);
        let process = &registry.registry.processes[0];
        assert_eq!(process.pid, 12345);
        assert_eq!(process.platform, "cursor");
        assert_eq!(process.status, ProcessStatus::Running);
    }

    #[tokio::test]
    async fn test_unregister_process() {
        let temp_dir = TempDir::new().unwrap();
        let registry_path = temp_dir.path().join("session.json");
        
        let mut registry = ProcessRegistry::new("test-session".to_string(), registry_path);
        registry.initialize().await.unwrap();

        registry
            .register(12345, "cursor", "echo", vec![])
            .await
            .unwrap();

        registry.unregister(12345, Some(0)).await.unwrap();

        let process = &registry.registry.processes[0];
        assert_eq!(process.status, ProcessStatus::Exited);
        assert_eq!(process.exit_code, Some(0));
    }

    #[tokio::test]
    async fn test_list_active() {
        let temp_dir = TempDir::new().unwrap();
        let registry_path = temp_dir.path().join("session.json");
        
        let mut registry = ProcessRegistry::new("test-session".to_string(), registry_path);
        registry.initialize().await.unwrap();

        // Register multiple processes
        registry.register(100, "cursor", "cmd1", vec![]).await.unwrap();
        registry.register(200, "claude", "cmd2", vec![]).await.unwrap();
        registry.unregister(100, Some(0)).await.unwrap();

        let active = registry.list_active();
        assert_eq!(active.len(), 1);
        assert_eq!(active[0].pid, 200);
    }

    #[tokio::test]
    async fn test_list_by_platform() {
        let temp_dir = TempDir::new().unwrap();
        let registry_path = temp_dir.path().join("session.json");
        
        let mut registry = ProcessRegistry::new("test-session".to_string(), registry_path);
        registry.initialize().await.unwrap();

        registry.register(100, "cursor", "cmd1", vec![]).await.unwrap();
        registry.register(200, "claude", "cmd2", vec![]).await.unwrap();
        registry.register(300, "cursor", "cmd3", vec![]).await.unwrap();

        let cursor_procs = registry.list_by_platform("cursor");
        assert_eq!(cursor_procs.len(), 2);
    }

    #[tokio::test]
    async fn test_mark_crashed() {
        let temp_dir = TempDir::new().unwrap();
        let registry_path = temp_dir.path().join("session.json");
        
        let mut registry = ProcessRegistry::new("test-session".to_string(), registry_path);
        registry.initialize().await.unwrap();

        registry.mark_crashed().await.unwrap();
        assert_eq!(registry.registry.status, SessionStatus::Crashed);
    }

    #[tokio::test]
    async fn test_persistence() {
        let temp_dir = TempDir::new().unwrap();
        let registry_path = temp_dir.path().join("session.json");
        
        // Create and save
        {
            let mut registry = ProcessRegistry::new("test-session".to_string(), registry_path.clone());
            registry.initialize().await.unwrap();
            registry.register(12345, "cursor", "echo", vec![]).await.unwrap();
        }

        // Load and verify
        {
            let mut registry = ProcessRegistry::new("test-session".to_string(), registry_path);
            registry.initialize().await.unwrap();
            assert_eq!(registry.registry.processes.len(), 1);
            assert_eq!(registry.registry.processes[0].pid, 12345);
        }
    }
}
