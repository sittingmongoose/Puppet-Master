//! Execution engine for running iterations with platform runners
//!
//! Handles:
//! - Platform runner execution with quota awareness
//! - Automatic platform failover on quota exhaustion
//! - Output capture and parsing
//! - Timeout management
//! - Stall detection (no output / repeated output)
//! - Completion signal parsing

use crate::core::state_machine::OrchestratorEvent;
use crate::interview::failover::is_quota_error;
use crate::platforms::{get_runner, quota_manager::global_quota_manager};
use crate::types::*;
use anyhow::{Result, anyhow};
use crossbeam_channel::Sender;
use std::time::Instant;

/// Execution engine for running platform iterations with quota-aware failover
#[derive(Debug)]
pub struct ExecutionEngine {
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
        event_sender: Sender<OrchestratorEvent>,
        stall_timeout_secs: u64,
        stall_max_repeats: usize,
    ) -> Self {
        Self {
            event_sender,
            stall_timeout_secs,
            stall_max_repeats,
        }
    }

    /// Execute a single iteration with platform runner and quota-aware failover
    pub async fn execute_iteration(&self, context: &IterationContext) -> Result<IterationResult> {
        let start_time = Instant::now();

        // Emit iteration started event
        let _ = self.event_sender.send(OrchestratorEvent::IterationStarted {
            tier_id: context.tier_id.clone(),
            iteration: context.iteration,
        });

        // Build fallback chain: preferred platform first, then fallback candidates
        let mut candidates: Vec<Platform> = Vec::with_capacity(6);
        candidates.push(context.platform);
        candidates.extend_from_slice(fallback_chain_for(context.platform));

        let mut last_error: Option<String> = None;

        // Try each platform in the failover chain
        for (attempt, &platform) in candidates.iter().enumerate() {
            log::info!(
                "Attempting execution on {} (attempt {} of {})",
                platform,
                attempt + 1,
                candidates.len()
            );

            // Check quota before execution
            if let Err(e) = global_quota_manager().enforce_quota(platform) {
                log::warn!(
                    "Quota exhausted for {}: {}. Trying next platform...",
                    platform,
                    e
                );
                last_error = Some(format!("Quota exhausted: {}", e));
                continue;
            }

            // Emit platform selection event
            let _ = self.event_sender.send(OrchestratorEvent::PlatformSelected {
                tier_id: context.tier_id.clone(),
                platform,
                attempt: attempt as u32,
            });

            // Get platform runner
            let runner = match get_runner(platform).await {
                Ok(r) => r,
                Err(e) => {
                    log::warn!(
                        "Failed to get runner for {}: {}. Trying next...",
                        platform,
                        e
                    );
                    last_error = Some(format!("Runner unavailable: {}", e));
                    continue;
                }
            };

            // Build execution request
            let mut request = ExecutionRequest::new(
                platform,
                context.model.clone(),
                context.prompt.clone(),
                context.working_dir.clone(),
            );

            if let Some(timeout_ms) = context.timeout_ms {
                request = request.with_timeout(std::time::Duration::from_millis(timeout_ms));
            }

            request = request.with_session_id(context.session_id.clone());

            if !context.context_files.is_empty() {
                request = request.with_context_files(context.context_files.clone());
            }

            for (key, value) in &context.env_vars {
                request = request.with_env(key.clone(), value.clone());
            }

            // Execute the request
            match runner.execute(&request).await {
                Ok(result) => {
                    if result.success {
                        let output = result.output.unwrap_or_default();
                        let signal = self.parse_completion_signal_from_output(&output);
                        let duration = start_time.elapsed();

                        // Emit iteration completed event
                        let _ = self
                            .event_sender
                            .send(OrchestratorEvent::IterationCompleted {
                                tier_id: context.tier_id.clone(),
                                iteration: context.iteration,
                                success: matches!(signal, CompletionSignal::Complete),
                            });

                        return Ok(IterationResult {
                            signal,
                            duration_secs: duration.as_secs(),
                            output_lines: output.lines().count(),
                            output,
                        });
                    } else {
                        let error_msg = result.error_message.unwrap_or_default();

                        // Check if this is a quota/rate limit error
                        if is_quota_error(&error_msg) {
                            log::warn!(
                                "Quota/rate limit error detected for {}: {}. Trying next platform...",
                                platform,
                                error_msg
                            );
                            last_error = Some(format!("Quota error: {}", error_msg));
                            continue;
                        } else {
                            // Non-quota error, fail immediately
                            return Err(anyhow!("Execution failed: {}", error_msg));
                        }
                    }
                }
                Err(e) => {
                    let error_msg = format!("{}", e);

                    // Check if this is a quota/rate limit error
                    if is_quota_error(&error_msg) {
                        log::warn!(
                            "Quota/rate limit error in runner for {}: {}. Trying next platform...",
                            platform,
                            error_msg
                        );
                        last_error = Some(format!("Quota error: {}", error_msg));
                        continue;
                    } else {
                        // Non-quota error, fail immediately
                        return Err(anyhow!("Runner execution error: {}", e));
                    }
                }
            }
        }

        // All platforms exhausted
        Err(anyhow!(
            "All platforms exhausted. Last error: {}",
            last_error.unwrap_or_else(|| "Unknown error".to_string())
        ))
    }

    /// Parse completion signal from output text
    fn parse_completion_signal_from_output(&self, output: &str) -> CompletionSignal {
        // Check each line for signals
        for line in output.lines() {
            if let Some(signal) = self.parse_completion_signal(line) {
                return signal;
            }
        }

        // Default to Complete if no specific signal found and execution succeeded
        CompletionSignal::Complete
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
}

fn fallback_chain_for(platform: Platform) -> &'static [Platform] {
    match platform {
        Platform::Cursor => &[
            Platform::Codex,
            Platform::Claude,
            Platform::Gemini,
            Platform::Copilot,
        ],
        Platform::Codex => &[
            Platform::Claude,
            Platform::Cursor,
            Platform::Gemini,
            Platform::Copilot,
        ],
        Platform::Claude => &[
            Platform::Cursor,
            Platform::Codex,
            Platform::Gemini,
            Platform::Copilot,
        ],
        Platform::Gemini => &[
            Platform::Copilot,
            Platform::Codex,
            Platform::Cursor,
            Platform::Claude,
        ],
        Platform::Copilot => &[
            Platform::Gemini,
            Platform::Codex,
            Platform::Cursor,
            Platform::Claude,
        ],
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
    /// Full output captured from agent
    pub output: String,
}

/// Extract reason from completion signal line
#[allow(dead_code)]
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

    fn create_test_engine() -> ExecutionEngine {
        let (tx, _rx) = crossbeam_channel::unbounded();
        ExecutionEngine::new(tx, 120, 10)
    }
}
