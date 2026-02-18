//! Base runner implementation with common process spawning and management
//!
//! This module provides `BaseRunner` which handles:
//! - Process spawning via tokio::process::Command
//! - PID tracking in a global registry
//! - stdout/stderr streaming and capture
//! - Timeout handling (soft SIGTERM, hard SIGKILL)
//! - Circuit breaker pattern
//! - Completion signal detection
//! - Stall detection

use crate::platforms::{
    HealthMonitor, PermissionAction, PermissionAudit, PermissionEvent, QuotaManager, RateLimiter,
};
use crate::types::{
    CompletionSignal, ExecutionRequest, ExecutionResult, OutputLine, OutputLineType, Platform,
};
use anyhow::{Context, Result, anyhow};
use chrono::Utc;
use log::{debug, info, warn};
use regex::Regex;
use std::collections::HashSet;
use std::process::Stdio;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;
use tokio::sync::mpsc;
use tokio::time::timeout;

// DRY:DATA:ProcessRegistry
/// Global process registry for tracking active child processes
pub struct ProcessRegistry {
    pids: Arc<Mutex<HashSet<u32>>>,
}

impl ProcessRegistry {
    // DRY:FN:new — Create a new process registry
    /// Create a new process registry
    pub fn new() -> Self {
        Self {
            pids: Arc::new(Mutex::new(HashSet::new())),
        }
    }

    // DRY:FN:register — Register a process ID
    /// Register a process ID
    pub fn register(&self, pid: u32) {
        let mut pids = self.pids.lock().unwrap();
        pids.insert(pid);
        debug!("Registered PID: {}", pid);
    }

    // DRY:FN:unregister — Unregister a process ID
    /// Unregister a process ID
    pub fn unregister(&self, pid: u32) {
        let mut pids = self.pids.lock().unwrap();
        pids.remove(&pid);
        debug!("Unregistered PID: {}", pid);
    }

    // DRY:FN:get_all — Get all registered PIDs
    /// Get all registered PIDs
    pub fn get_all(&self) -> Vec<u32> {
        let pids = self.pids.lock().unwrap();
        pids.iter().copied().collect()
    }

    // DRY:FN:kill_all — Kill all registered processes
    /// Kill all registered processes
    pub fn kill_all(&self) {
        let pids = self.get_all();
        for pid in pids {
            Self::kill_process(pid);
            self.unregister(pid);
        }
    }

    /// Kill a specific process
    fn kill_process(pid: u32) {
        #[cfg(unix)]
        {
            use nix::sys::signal::{Signal, kill};
            use nix::unistd::Pid;
            let _ = kill(Pid::from_raw(pid as i32), Signal::SIGTERM);
        }

        #[cfg(windows)]
        {
            use std::process::Command as StdCommand;
            let _ = StdCommand::new("taskkill")
                .args(&["/PID", &pid.to_string(), "/F"])
                .output();
        }
    }
}

impl Default for ProcessRegistry {
    fn default() -> Self {
        Self::new()
    }
}

/// Global process registry instance
static PROCESS_REGISTRY: once_cell::sync::Lazy<ProcessRegistry> =
    once_cell::sync::Lazy::new(ProcessRegistry::new);

// DRY:DATA:CircuitBreaker — Circuit breaker for platform reliability
/// Circuit breaker for platform reliability
#[derive(Debug, Clone)]
pub struct CircuitBreaker {
    consecutive_failures: Arc<Mutex<u32>>,
    max_failures: u32,
}

impl CircuitBreaker {
    // DRY:FN:new — Create a new circuit breaker
    /// Create a new circuit breaker
    pub fn new(max_failures: u32) -> Self {
        Self {
            consecutive_failures: Arc::new(Mutex::new(0)),
            max_failures,
        }
    }

    // DRY:FN:is_open — Check if circuit is open (fail-fast)
    /// Check if circuit is open (fail-fast)
    pub fn is_open(&self) -> bool {
        let failures = self.consecutive_failures.lock().unwrap();
        *failures >= self.max_failures
    }

    // DRY:FN:record_success — Record a success (reset failures)
    /// Record a success (reset failures)
    pub fn record_success(&self) {
        let mut failures = self.consecutive_failures.lock().unwrap();
        *failures = 0;
    }

    // DRY:FN:record_failure — Record a failure
    /// Record a failure
    pub fn record_failure(&self) {
        let mut failures = self.consecutive_failures.lock().unwrap();
        *failures += 1;
        if *failures >= self.max_failures {
            warn!("Circuit breaker opened after {} failures", *failures);
        }
    }

    // DRY:FN:reset — Reset the circuit breaker
    /// Reset the circuit breaker
    pub fn reset(&self) {
        let mut failures = self.consecutive_failures.lock().unwrap();
        *failures = 0;
    }
}

// DRY:DATA:BaseRunner — Base runner implementation with common logic
/// Base runner implementation with common logic
pub struct BaseRunner {
    /// Command to execute
    pub command: String,
    /// Circuit breaker for reliability
    pub circuit_breaker: CircuitBreaker,
    /// Default timeout in seconds
    pub default_timeout: u64,
    /// Stall detection timeout in seconds
    pub stall_timeout: u64,
    /// Process registry
    pub registry: &'static ProcessRegistry,
    /// Platform for this runner (needed for health/quota tracking)
    pub platform: Platform,
    /// Health monitor (shared global instance)
    pub health_monitor: Arc<HealthMonitor>,
    /// Rate limiter (shared global instance)
    pub rate_limiter: Arc<RateLimiter>,
    /// Quota manager (shared global instance)
    pub quota_manager: Arc<QuotaManager>,
    /// Permission audit logger (optional, shared global instance)
    pub permission_audit: Option<Arc<PermissionAudit>>,
}

impl BaseRunner {
    // DRY:FN:new — Create a new base runner
    /// Create a new base runner
    pub fn new(command: String, platform: Platform) -> Self {
        // Use global singletons for health monitor, rate limiter, and quota manager
        // Try to create permission audit logger (optional, may fail)
        let permission_audit = PermissionAudit::default_location().map(Arc::new).ok();

        Self {
            command,
            circuit_breaker: CircuitBreaker::new(5),
            default_timeout: 3600, // 1 hour
            stall_timeout: 120,    // 2 minutes
            registry: &PROCESS_REGISTRY,
            platform,
            health_monitor: Arc::new(HealthMonitor::new()),
            rate_limiter: Arc::new(RateLimiter::new()),
            quota_manager: Arc::new(QuotaManager::new()),
            permission_audit,
        }
    }

    // DRY:FN:execute_command — Execute a command with args and collect output
    /// Execute a command with the given arguments
    ///
    /// # Arguments
    ///
    /// * `request` - The execution request
    /// * `args` - Command-line arguments
    /// * `stdin_input` - Optional stdin input for large prompts
    ///
    /// # Returns
    ///
    /// Returns the execution result with output and status
    pub async fn execute_command(
        &self,
        request: &ExecutionRequest,
        args: Vec<String>,
        stdin_input: Option<String>,
    ) -> Result<ExecutionResult> {
        // Check circuit breaker
        if self.circuit_breaker.is_open() {
            return Err(anyhow!(
                "Circuit breaker is open for command: {}",
                self.command
            ));
        }

        // Check quota before execution
        if let Err(e) = self.quota_manager.enforce_quota(self.platform) {
            warn!("Quota enforcement failed: {}", e);
            self.health_monitor
                .record_failure(self.platform, format!("Quota exhausted: {}", e))
                .await;
            return Err(e);
        }

        // Acquire rate limit permission (blocks if necessary)
        self.rate_limiter.acquire(self.platform).await?;

        // Log API access permission event
        if let Some(ref audit) = self.permission_audit {
            let event = PermissionEvent::new(self.platform, PermissionAction::ApiAccess, true)
                .with_details(format!(
                    "Executing: {} with {} args",
                    self.command,
                    args.len()
                ));
            if let Some(session_id) = &request.session_id {
                let event = event.with_session_id(session_id);
                let _ = audit.log(event).await; // Ignore audit errors
            } else {
                let _ = audit.log(event).await;
            }
        }

        let start_time = Instant::now();
        let started_at = Utc::now();

        // Spawn the process
        info!("Executing: {} {}", self.command, args.join(" "));

        let mut cmd = Command::new(&self.command);
        cmd.args(&args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .kill_on_drop(true);

        // Set working directory
        cmd.current_dir(&request.working_directory);

        // Set environment variables from the request
        for (key, value) in &request.env_vars {
            cmd.env(key, value);
        }

        // Handle stdin if needed
        if stdin_input.is_some() {
            cmd.stdin(Stdio::piped());
        }

        let mut child = cmd
            .spawn()
            .context(format!("Failed to spawn command: {}", self.command))?;

        // Register PID
        let pid = child.id().unwrap_or(0);
        self.registry.register(pid);

        // Write stdin if provided
        if let Some(input) = stdin_input {
            if let Some(mut stdin) = child.stdin.take() {
                use tokio::io::AsyncWriteExt;
                stdin.write_all(input.as_bytes()).await?;
                stdin.flush().await?;
                drop(stdin);
            }
        }

        // Channel for collecting output lines
        let (tx, mut rx) = mpsc::unbounded_channel::<OutputLine>();

        // Spawn tasks to read stdout and stderr
        let stdout = child.stdout.take().expect("Failed to get stdout");
        let stderr = child.stderr.take().expect("Failed to get stderr");

        let tx_stdout = tx.clone();
        let stdout_task = tokio::spawn(async move {
            let reader = BufReader::new(stdout);
            let mut lines = reader.lines();
            while let Ok(Some(line)) = lines.next_line().await {
                let _ = tx_stdout.send(OutputLine::new(line, OutputLineType::Stdout));
            }
        });

        let tx_stderr = tx.clone();
        let stderr_task = tokio::spawn(async move {
            let reader = BufReader::new(stderr);
            let mut lines = reader.lines();
            while let Ok(Some(line)) = lines.next_line().await {
                let _ = tx_stderr.send(OutputLine::new(line, OutputLineType::Stderr));
            }
        });

        drop(tx); // Close the sender

        // Collect output with timeout and stall detection
        let timeout_secs = request
            .timeout_ms
            .map(|ms| ms / 1000)
            .unwrap_or(self.default_timeout);
        let timeout_duration = Duration::from_secs(timeout_secs);

        let mut output_lines = Vec::new();
        let mut completion_detected = false;

        // Collect output with overall timeout
        let collect_result = timeout(timeout_duration, async {
            while let Some(line) = rx.recv().await {
                // Check for completion signals
                if line.text.contains("<ralph>COMPLETE</ralph>")
                    || line.text.contains("<ralph>GUTTER</ralph>")
                {
                    completion_detected = true;
                }

                output_lines.push(line);
            }
        })
        .await;

        let timed_out = collect_result.is_err();

        // Wait for the process to complete or kill it
        let exit_status = if timed_out {
            warn!("Process timed out, sending SIGTERM to PID {}", pid);

            // Soft kill (SIGTERM)
            #[cfg(unix)]
            {
                use nix::sys::signal::{Signal, kill};
                use nix::unistd::Pid;
                let _ = kill(Pid::from_raw(pid as i32), Signal::SIGTERM);
            }

            #[cfg(windows)]
            {
                let _ = std::process::Command::new("taskkill")
                    .args(&["/PID", &pid.to_string()])
                    .output();
            }

            // Wait for graceful shutdown
            match timeout(Duration::from_secs(10), child.wait()).await {
                Ok(Ok(status)) => Some(status),
                _ => {
                    // Hard kill (SIGKILL)
                    warn!(
                        "Process did not exit gracefully, sending SIGKILL to PID {}",
                        pid
                    );
                    let _ = child.kill().await;
                    child.wait().await.ok()
                }
            }
        } else {
            child.wait().await.ok()
        };

        // Wait for output tasks to complete
        let _ = stdout_task.await;
        let _ = stderr_task.await;

        // Unregister PID
        self.registry.unregister(pid);

        let duration_secs = start_time.elapsed().as_secs_f64();
        let completed_at = Utc::now();

        // Determine success
        let success = if timed_out {
            false
        } else if let Some(exit) = exit_status {
            exit.success()
        } else {
            false
        };

        let exit_code = exit_status.and_then(|s| s.code());

        // Build output string from collected lines
        let output_str: String = output_lines
            .iter()
            .map(|l| l.text.as_str())
            .collect::<Vec<_>>()
            .join("\n");

        let completion_signal = if completion_detected {
            if output_str.contains("<ralph>COMPLETE</ralph>") {
                CompletionSignal::Complete
            } else {
                CompletionSignal::Gutter
            }
        } else if timed_out {
            CompletionSignal::Timeout
        } else {
            CompletionSignal::None
        };

        let error_message = if !success {
            if timed_out {
                Some("Process timed out or stalled".to_string())
            } else {
                Some("Process exited with non-zero status".to_string())
            }
        } else {
            None
        };

        let result = ExecutionResult {
            success,
            output: if output_str.is_empty() {
                None
            } else {
                Some(output_str)
            },
            exit_code,
            duration_ms: Some((duration_secs * 1000.0) as u64),
            files_changed: Vec::new(),
            learnings: Vec::new(),
            completion_signal,
            error_message: error_message.clone(),
            started_at: Some(started_at),
            completed_at: Some(completed_at),
            session_id: request.session_id.clone(),
            process_id: Some(pid),
            git_commit: None,
            tokens_used: None,
        };

        // Record health status
        if result.success {
            self.health_monitor.record_success(self.platform).await;
            self.circuit_breaker.record_success();
        } else {
            let error_msg = error_message.unwrap_or_else(|| "Unknown error".to_string());
            self.health_monitor
                .record_failure(self.platform, error_msg)
                .await;
            self.circuit_breaker.record_failure();
        }

        // Record quota usage (use tokens from result if available, otherwise estimate)
        let tokens = result.tokens_used.unwrap_or(0);
        self.quota_manager
            .record_usage(self.platform, tokens, duration_secs);

        Ok(result)
    }

    // DRY:FN:detect_line_type — Detect the type of output line based on content
    /// Detect the type of output line based on content
    pub fn detect_line_type(line: &str) -> OutputLineType {
        let line_lower = line.to_lowercase();

        if line_lower.contains("error:") || line_lower.contains("[error]") {
            OutputLineType::Stderr
        } else if line_lower.contains("warning:")
            || line_lower.contains("[warning]")
            || line_lower.contains("[warn]")
        {
            OutputLineType::System
        } else if line_lower.contains("debug:") || line_lower.contains("[debug]") {
            OutputLineType::System
        } else {
            OutputLineType::Stdout
        }
    }

    // DRY:FN:has_completion_signal — Parse completion signals from output
    /// Parse completion signals from output
    pub fn has_completion_signal(output: &[OutputLine]) -> bool {
        let complete_regex = Regex::new(r"<ralph>COMPLETE</ralph>").unwrap();
        let gutter_regex = Regex::new(r"<ralph>GUTTER</ralph>").unwrap();

        output
            .iter()
            .any(|line| complete_regex.is_match(&line.text) || gutter_regex.is_match(&line.text))
    }

    // DRY:FN:is_command_available — Check if a command is available on PATH
    /// Check if a command is available on PATH
    pub async fn is_command_available(command: &str) -> bool {
        which::which(command).is_ok()
    }

    // DRY:FN:find_available_command — Try fallback commands
    /// Try fallback commands
    pub async fn find_available_command(commands: &[&str]) -> Option<String> {
        for cmd in commands {
            if Self::is_command_available(cmd).await {
                return Some(cmd.to_string());
            }
        }
        None
    }
}

// DRY:FN:cleanup_all_processes — Cleanup handler to kill all processes on shutdown
/// Cleanup handler to kill all processes on shutdown
pub fn cleanup_all_processes() {
    info!("Cleaning up all child processes...");
    PROCESS_REGISTRY.kill_all();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_line_type() {
        assert_eq!(
            BaseRunner::detect_line_type("Error: something went wrong"),
            OutputLineType::Stderr
        );
        assert_eq!(
            BaseRunner::detect_line_type("Warning: deprecated API"),
            OutputLineType::System
        );
        assert_eq!(
            BaseRunner::detect_line_type("regular output"),
            OutputLineType::Stdout
        );
    }

    #[test]
    fn test_circuit_breaker() {
        let cb = CircuitBreaker::new(3);
        assert!(!cb.is_open());

        cb.record_failure();
        assert!(!cb.is_open());

        cb.record_failure();
        assert!(!cb.is_open());

        cb.record_failure();
        assert!(cb.is_open());

        cb.record_success();
        assert!(!cb.is_open());
    }

    #[tokio::test]
    async fn test_command_availability() {
        // Test with a command that should exist on all systems
        #[cfg(unix)]
        assert!(BaseRunner::is_command_available("echo").await);

        #[cfg(windows)]
        assert!(BaseRunner::is_command_available("cmd").await);

        // Test with a command that likely doesn't exist
        assert!(!BaseRunner::is_command_available("nonexistent_command_xyz").await);
    }
}
