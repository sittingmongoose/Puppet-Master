//! Process spawning with audit trails
//!
//! Wraps tokio::process::Command with:
//! - Audit trail capture (environment, args, working directory)
//! - Timeout support
//! - Output capture (stdout/stderr)
//! - Fresh process guarantee (no reuse)

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Stdio;
use std::time::Duration;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;
use tokio::time::timeout;

// DRY:DATA:SpawnConfig
/// Configuration for process spawning
#[derive(Debug, Clone)]
pub struct SpawnConfig {
    /// Working directory for process
    pub working_dir: PathBuf,
    /// Timeout in seconds (0 = no timeout)
    pub timeout_secs: u64,
    /// Environment variables
    pub env_vars: Vec<(String, String)>,
    /// Whether to capture stdout
    pub capture_stdout: bool,
    /// Whether to capture stderr
    pub capture_stderr: bool,
}

impl Default for SpawnConfig {
    fn default() -> Self {
        Self {
            working_dir: std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")),
            timeout_secs: 3600, // 1 hour
            env_vars: Vec::new(),
            capture_stdout: true,
            capture_stderr: true,
        }
    }
}

// DRY:DATA:SpawnResult
/// Result of process execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpawnResult {
    /// Exit code
    pub exit_code: Option<i32>,
    /// Standard output
    pub stdout: String,
    /// Standard error
    pub stderr: String,
    /// Execution duration in milliseconds
    pub duration_ms: u64,
    /// Whether process timed out
    pub timed_out: bool,
}

// DRY:DATA:ProcessAudit
/// Audit trail for process execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessAudit {
    /// Command executed
    pub command: String,
    /// Arguments passed
    pub args: Vec<String>,
    /// Working directory
    pub working_dir: PathBuf,
    /// Environment variables set
    pub env_vars: Vec<(String, String)>,
    /// Process ID
    pub pid: Option<u32>,
    /// Start time (ISO 8601)
    pub started_at: String,
    /// End time (ISO 8601)
    pub ended_at: Option<String>,
    /// Exit code
    pub exit_code: Option<i32>,
    /// Execution duration in milliseconds
    pub duration_ms: Option<u64>,
}

// DRY:DATA:FreshSpawn
/// Fresh process spawner
pub struct FreshSpawn {
    config: SpawnConfig,
}

impl FreshSpawn {
    /// Create new spawner with configuration
    pub fn new(config: SpawnConfig) -> Self {
        Self { config }
    }

    /// Create with default configuration
    pub fn with_defaults() -> Self {
        Self::new(SpawnConfig::default())
    }

    /// Spawn a fresh process and wait for completion
    ///
    /// # Arguments
    /// * `command` - Command to execute
    /// * `args` - Command arguments
    ///
    /// # Returns
    /// SpawnResult with exit code and output
    pub async fn spawn(
        &self,
        command: impl AsRef<str>,
        args: &[String],
    ) -> Result<(SpawnResult, ProcessAudit)> {
        let command = command.as_ref();
        let start_time = std::time::Instant::now();
        let started_at = chrono::Utc::now().to_rfc3339();

        // Build command
        let mut cmd = Command::new(command);
        cmd.args(args)
            .current_dir(&self.config.working_dir)
            .envs(self.config.env_vars.iter().cloned());

        // Configure stdio
        if self.config.capture_stdout {
            cmd.stdout(Stdio::piped());
        }
        if self.config.capture_stderr {
            cmd.stderr(Stdio::piped());
        }

        // Spawn process
        let mut child = cmd.spawn().context("Failed to spawn process")?;
        let pid = child.id();

        // Capture output streams
        let stdout_handle = if self.config.capture_stdout {
            let stdout = child.stdout.take().unwrap();
            Some(tokio::spawn(async move {
                let reader = BufReader::new(stdout);
                let mut lines = reader.lines();
                let mut output = Vec::new();
                while let Ok(Some(line)) = lines.next_line().await {
                    output.push(line);
                }
                output.join("\n")
            }))
        } else {
            None
        };

        let stderr_handle = if self.config.capture_stderr {
            let stderr = child.stderr.take().unwrap();
            Some(tokio::spawn(async move {
                let reader = BufReader::new(stderr);
                let mut lines = reader.lines();
                let mut output = Vec::new();
                while let Ok(Some(line)) = lines.next_line().await {
                    output.push(line);
                }
                output.join("\n")
            }))
        } else {
            None
        };

        // Wait for process with timeout
        let timed_out;
        let exit_status = if self.config.timeout_secs > 0 {
            match timeout(Duration::from_secs(self.config.timeout_secs), child.wait()).await {
                Ok(Ok(status)) => {
                    timed_out = false;
                    Some(status)
                }
                Ok(Err(e)) => {
                    return Err(e).context("Failed to wait for process");
                }
                Err(_) => {
                    // Timeout - kill process
                    let _ = child.kill().await;
                    timed_out = true;
                    None
                }
            }
        } else {
            timed_out = false;
            Some(child.wait().await.context("Failed to wait for process")?)
        };

        // Collect output
        let stdout = if let Some(handle) = stdout_handle {
            handle.await.unwrap_or_default()
        } else {
            String::new()
        };

        let stderr = if let Some(handle) = stderr_handle {
            handle.await.unwrap_or_default()
        } else {
            String::new()
        };

        let duration_ms = start_time.elapsed().as_millis() as u64;
        let ended_at = chrono::Utc::now().to_rfc3339();
        let exit_code = exit_status.and_then(|s| s.code());

        let result = SpawnResult {
            exit_code,
            stdout: stdout.clone(),
            stderr: stderr.clone(),
            duration_ms,
            timed_out,
        };

        let audit = ProcessAudit {
            command: command.to_string(),
            args: args.to_vec(),
            working_dir: self.config.working_dir.clone(),
            env_vars: self.config.env_vars.clone(),
            pid,
            started_at,
            ended_at: Some(ended_at),
            exit_code,
            duration_ms: Some(duration_ms),
        };

        Ok((result, audit))
    }

    /// Get configuration
    pub fn config(&self) -> &SpawnConfig {
        &self.config
    }
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_spawn_successful_command() {
        let spawner = FreshSpawn::with_defaults();

        let (result, audit) = spawner.spawn("echo", &["hello".to_string()]).await.unwrap();

        assert_eq!(result.exit_code, Some(0));
        assert!(result.stdout.contains("hello"));
        assert!(!result.timed_out);
        assert_eq!(audit.command, "echo");
        assert_eq!(audit.args, vec!["hello"]);
    }

    #[tokio::test]
    async fn test_spawn_failed_command() {
        let spawner = FreshSpawn::with_defaults();

        // Use 'false' command which exits with code 1
        let (result, _) = spawner.spawn("false", &[]).await.unwrap();

        assert_ne!(result.exit_code, Some(0));
        assert!(!result.timed_out);
    }

    #[tokio::test]
    async fn test_spawn_with_timeout() {
        let config = SpawnConfig {
            timeout_secs: 1,
            ..Default::default()
        };
        let spawner = FreshSpawn::new(config);

        // Sleep command that exceeds timeout
        let (result, _) = spawner.spawn("sleep", &["10".to_string()]).await.unwrap();

        assert!(result.timed_out);
    }

    #[tokio::test]
    async fn test_spawn_with_env_vars() {
        let config = SpawnConfig {
            env_vars: vec![("TEST_VAR".to_string(), "test_value".to_string())],
            ..Default::default()
        };
        let spawner = FreshSpawn::new(config);

        // Echo environment variable
        let (result, audit) = spawner
            .spawn("sh", &["-c".to_string(), "echo $TEST_VAR".to_string()])
            .await
            .unwrap();

        assert_eq!(result.exit_code, Some(0));
        assert!(result.stdout.contains("test_value"));
        assert_eq!(audit.env_vars.len(), 1);
    }

    #[tokio::test]
    async fn test_spawn_captures_stderr() {
        let spawner = FreshSpawn::with_defaults();

        // Command that writes to stderr
        let (result, _) = spawner
            .spawn("sh", &["-c".to_string(), "echo error >&2".to_string()])
            .await
            .unwrap();

        assert!(result.stderr.contains("error"));
    }

    #[tokio::test]
    async fn test_audit_trail() {
        let spawner = FreshSpawn::with_defaults();

        let (_, audit) = spawner.spawn("echo", &["test".to_string()]).await.unwrap();

        assert_eq!(audit.command, "echo");
        assert_eq!(audit.args, vec!["test"]);
        assert!(audit.pid.is_some());
        assert!(audit.ended_at.is_some());
        assert!(audit.duration_ms.is_some());
    }
}
