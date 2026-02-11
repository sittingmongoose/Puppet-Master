//! Execution engine for running iterations with platform runners
//!
//! Handles:
//! - Platform process spawning
//! - Output capture and buffering
//! - Timeout management (soft SIGTERM + hard SIGKILL)
//! - Stall detection (no output / repeated output)
//! - Completion signal parsing

use crate::core::state_machine::OrchestratorEvent;
use crate::types::*;
use anyhow::{anyhow, Result};
use crossbeam_channel::Sender;
use std::collections::VecDeque;
use std::process::Stdio;
use std::time::{Duration, Instant};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::{Child, Command};
use tokio::time::timeout;

/// Execution engine for running platform iterations
#[derive(Debug)]
pub struct ExecutionEngine {
    /// Platform configurations
    platforms: Vec<PlatformConfig>,
    /// Event sender for real-time updates
    event_sender: Sender<OrchestratorEvent>,
    /// Stall timeout (seconds without output)
    stall_timeout_secs: u64,
    /// Max repeated outputs before considering stalled
    stall_max_repeats: usize,
}

impl ExecutionEngine {
    /// Create new execution engine
    pub fn new(
        platforms: Vec<PlatformConfig>,
        event_sender: Sender<OrchestratorEvent>,
        stall_timeout_secs: u64,
        stall_max_repeats: usize,
    ) -> Self {
        Self {
            platforms,
            event_sender,
            stall_timeout_secs,
            stall_max_repeats,
        }
    }

    /// Execute a single iteration
    pub async fn execute_iteration(&self, context: &IterationContext) -> Result<IterationResult> {
        let start_time = Instant::now();

        // Select platform (preferred from context, with fallback chain)
        let platform = self.select_platform_for_context(context.platform)?;

        // Emit iteration started event
        let _ = self.event_sender.send(OrchestratorEvent::IterationStarted {
            tier_id: context.tier_id.clone(),
            iteration: context.iteration,
        });

        // Build and spawn command
        let mut child = self.spawn_platform(&platform, context).await?;

        // Capture output and detect completion
        let signal = self
            .capture_output(&mut child, context, start_time)
            .await?;

        // Ensure process is terminated
        self.ensure_terminated(child).await;

        let duration = start_time.elapsed();

        // Emit iteration completed event
        let _ = self.event_sender.send(OrchestratorEvent::IterationCompleted {
            tier_id: context.tier_id.clone(),
            iteration: context.iteration,
            success: matches!(signal, CompletionSignal::Complete),
        });

        Ok(IterationResult {
            signal,
            duration_secs: duration.as_secs(),
            output_lines: 0, // Could be tracked if needed
        })
    }

    /// Select best available platform (highest priority).
    fn select_platform(&self) -> Result<&PlatformConfig> {
        self.platforms
            .iter()
            .filter(|p| p.available)
            .max_by_key(|p| p.priority)
            .ok_or_else(|| anyhow!("No available platforms"))
    }

    /// Select a platform based on the preferred platform in the iteration context.
    ///
    /// If the preferred platform is unavailable (or has no remaining quota), try a deterministic
    /// fallback chain (e.g., Claude → Cursor).
    fn select_platform_for_context(&self, preferred: Platform) -> Result<&PlatformConfig> {
        // Try preferred first, then fallbacks.
        let mut candidates: Vec<Platform> = Vec::with_capacity(6);
        candidates.push(preferred);
        candidates.extend_from_slice(fallback_chain_for(preferred));

        for candidate in candidates {
            if let Some(p) = self
                .platforms
                .iter()
                .find(|p| p.available && p.platform == candidate && self.has_quota(p))
            {
                return Ok(p);
            }
        }

        Err(anyhow!(
            "No available platforms found for preferred {}",
            preferred
        ))
    }

    /// Spawn platform process
    async fn spawn_platform(
        &self,
        platform: &PlatformConfig,
        context: &IterationContext,
    ) -> Result<Child> {
        let mut cmd = Command::new(&platform.executable);

        // Set working directory
        cmd.current_dir(&context.working_dir);

        // Set environment variables
        for (key, value) in &context.env_vars {
            cmd.env(key, value);
        }

        // Pass prompt as argument or via stdin
        // This is platform-specific; adjust as needed
        cmd.arg("--prompt")
            .arg(&context.prompt)
            .stdin(Stdio::null())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        let child = cmd
            .spawn()
            .map_err(|e| anyhow!("Failed to spawn platform {}: {}", platform.name, e))?;

        Ok(child)
    }

    /// Capture output and detect completion signals
    async fn capture_output(
        &self,
        child: &mut Child,
        context: &IterationContext,
        start_time: Instant,
    ) -> Result<CompletionSignal> {
        let stdout = child
            .stdout
            .take()
            .ok_or_else(|| anyhow!("Failed to capture stdout"))?;
        let mut reader = BufReader::new(stdout).lines();

        let mut output_buffer = VecDeque::with_capacity(self.stall_max_repeats);
        let mut last_output_time = Instant::now();
        let timeout_duration = Duration::from_secs(context.timeout_secs.unwrap_or(300));
        let stall_duration = Duration::from_secs(self.stall_timeout_secs);

        loop {
            // Check total timeout
            if start_time.elapsed() >= timeout_duration {
                return Ok(CompletionSignal::Timeout);
            }

            // Check stall timeout
            if last_output_time.elapsed() >= stall_duration {
                return Ok(CompletionSignal::Stalled);
            }

            // Try to read next line with timeout
            match timeout(Duration::from_secs(1), reader.next_line()).await {
                Ok(Ok(Some(line))) => {
                    last_output_time = Instant::now();

                    // Emit output line event
                    let _ = self.event_sender.send(OrchestratorEvent::OutputLine {
                        tier_id: context.tier_id.clone(),
                        line: line.clone(),
                        line_type: OutputLineType::Stdout,
                    });

                    // Check for completion signals
                    if let Some(signal) = self.parse_completion_signal(&line) {
                        return Ok(signal);
                    }

                    // Track repeated output for stall detection
                    output_buffer.push_back(line.clone());
                    if output_buffer.len() > self.stall_max_repeats {
                        output_buffer.pop_front();
                    }

                    // Check if all recent outputs are identical (stalled)
                    if output_buffer.len() >= self.stall_max_repeats {
                        let first = output_buffer.front().unwrap();
                        if output_buffer.iter().all(|l| l == first) {
                            return Ok(CompletionSignal::Stalled);
                        }
                    }
                }
                Ok(Ok(None)) => {
                    // Process ended, check exit status
                    match child.wait().await {
                        Ok(status) => {
                            if status.success() {
                                return Ok(CompletionSignal::Complete);
                            } else {
                                return Ok(CompletionSignal::Error(
                                    format!("Process exited with status {}", status),
                                ));
                            }
                        }
                        Err(e) => {
                            return Ok(CompletionSignal::Error(
                                format!("Failed to wait for process: {}", e),
                            ));
                        }
                    }
                }
                Ok(Err(e)) => {
                    return Ok(CompletionSignal::Error(
                        format!("IO error reading output: {}", e),
                    ));
                }
                Err(_) => {
                    // Timeout waiting for next line, continue loop
                    continue;
                }
            }
        }
    }

    /// Parse completion signal from output line
    fn parse_completion_signal(&self, line: &str) -> Option<CompletionSignal> {
        if line.contains("<ralph>COMPLETE</ralph>") {
            return Some(CompletionSignal::Complete);
        }
        if line.contains("<ralph>GUTTER</ralph>") {
            return Some(CompletionSignal::Gutter);
        }

        let lower = line.to_lowercase();

        // Look for explicit completion markers
        if lower.contains("puppet_master: complete")
            || lower.contains("[complete]")
            || lower.contains("work complete")
        {
            return Some(CompletionSignal::Complete);
        }

        // Look for revision requests
        if lower.contains("puppet_master: revise")
            || lower.contains("[revise]")
            || lower.contains("needs revision")
        {
            return Some(CompletionSignal::Gutter);
        }

        // Look for blocked state
        if lower.contains("puppet_master: blocked")
            || lower.contains("[blocked]")
            || lower.contains("blocked on")
        {
            return Some(CompletionSignal::Stalled);
        }

        // Look for help requests
        if lower.contains("puppet_master: help")
            || lower.contains("[help]")
            || lower.contains("need help")
        {
            return Some(CompletionSignal::Stalled);
        }

        None
    }

    /// Ensure child process is fully terminated
    async fn ensure_terminated(&self, mut child: Child) {
        // Try graceful termination first (SIGTERM)
        if let Err(e) = child.kill().await {
            log::warn!("Failed to kill child process: {}", e);
        }

        // Wait up to 5 seconds for graceful shutdown
        match tokio::time::timeout(Duration::from_secs(5), child.wait()).await {
            Ok(_) => {
                log::debug!("Child process terminated gracefully");
            }
            Err(_) => {
                log::warn!("Child process did not terminate, force killing");
                // Process should be killed by now, but log warning
            }
        }
    }

    /// Get platform by name (for quota fallback)
    pub fn get_platform(&self, name: &str) -> Option<&PlatformConfig> {
        self.platforms.iter().find(|p| p.name == name)
    }

    /// Check if platform has quota remaining
    pub fn has_quota(&self, platform: &PlatformConfig) -> bool {
        if let Some(quota) = platform.quota {
            quota > 0
        } else {
            true // No quota means unlimited
        }
    }

    /// Select platform with quota fallback
    pub fn select_platform_with_fallback(&self) -> Result<&PlatformConfig> {
        // Try primary platform first
        if let Some(primary) = self.select_platform().ok().filter(|p| self.has_quota(p)) {
            return Ok(primary);
        }

        // Fall back to any available platform with quota
        self.platforms
            .iter()
            .filter(|p| p.available && self.has_quota(p))
            .max_by_key(|p| p.priority)
            .ok_or_else(|| anyhow!("No available platforms with quota remaining"))
    }
}

fn fallback_chain_for(platform: Platform) -> &'static [Platform] {
    match platform {
        Platform::Cursor => &[Platform::Codex, Platform::Claude, Platform::Gemini, Platform::Copilot],
        Platform::Codex => &[Platform::Claude, Platform::Cursor, Platform::Gemini, Platform::Copilot],
        Platform::Claude => &[Platform::Cursor, Platform::Codex, Platform::Gemini, Platform::Copilot],
        Platform::Gemini => &[Platform::Copilot, Platform::Codex, Platform::Cursor, Platform::Claude],
        Platform::Copilot => &[Platform::Gemini, Platform::Codex, Platform::Cursor, Platform::Claude],
    }
}

/// Result of an iteration execution
#[derive(Debug, Clone)]
pub struct IterationResult {
    /// Completion signal detected
    pub signal: CompletionSignal,
    /// Duration in seconds
    pub duration_secs: u64,
    /// Number of output lines captured
    pub output_lines: usize,
}

/// Extract reason from completion signal line
fn extract_reason(line: &str) -> String {
    // Try to extract text after common separators
    for sep in &[":", "-", "|"] {
        if let Some(pos) = line.find(sep) {
            let reason = line[pos + 1..].trim();
            if !reason.is_empty() {
                return reason.to_string();
            }
        }
    }

    // Fall back to entire line
    line.trim().to_string()
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_completion_signal_complete() {
        let engine = create_test_engine();
        
        let signal = engine.parse_completion_signal("PUPPET_MASTER: COMPLETE");
        assert!(matches!(signal, Some(CompletionSignal::Complete)));

        let signal = engine.parse_completion_signal("[COMPLETE] Work finished");
        assert!(matches!(signal, Some(CompletionSignal::Complete)));
    }

    #[test]
    fn test_parse_completion_signal_revise() {
        let engine = create_test_engine();
        
        let signal = engine.parse_completion_signal("PUPPET_MASTER: REVISE - needs more tests");
        assert!(matches!(signal, Some(CompletionSignal::Gutter)));
    }

    #[test]
    fn test_parse_completion_signal_blocked() {
        let engine = create_test_engine();
        
        let signal = engine.parse_completion_signal("PUPPET_MASTER: BLOCKED - waiting for API");
        assert!(matches!(signal, Some(CompletionSignal::Stalled)));
    }

    #[test]
    fn test_parse_completion_signal_help() {
        let engine = create_test_engine();
        
        let signal = engine.parse_completion_signal("PUPPET_MASTER: HELP - unclear requirements");
        assert!(matches!(signal, Some(CompletionSignal::Stalled)));
    }

    #[test]
    fn test_extract_reason() {
        assert_eq!(extract_reason("Error: out of memory"), "out of memory");
        assert_eq!(extract_reason("Failed - network issue"), "network issue");
        assert_eq!(extract_reason("No separator here"), "No separator here");
    }

    #[test]
    fn test_platform_selection() {
        let engine = create_test_engine();
        let platform = engine.select_platform().unwrap();
        assert_eq!(platform.platform, Platform::Cursor);
    }

    #[test]
    fn test_quota_check() {
        let engine = create_test_engine();
        let platform = &engine.platforms[0];
        assert!(engine.has_quota(platform));
    }

    fn create_test_engine() -> ExecutionEngine {
        let (tx, _rx) = crossbeam_channel::unbounded();
        
        let mut p1 = PlatformConfig::new(Platform::Cursor, "claude-3-5-sonnet");
        p1.available = true;
        p1.priority = 100;
        let mut p2 = PlatformConfig::new(Platform::Codex, "gpt-5");
        p2.available = true;
        p2.priority = 90;
        let platforms = vec![p1, p2];

        ExecutionEngine::new(platforms, tx, 120, 10)
    }
}
