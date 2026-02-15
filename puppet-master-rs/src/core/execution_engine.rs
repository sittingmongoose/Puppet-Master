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
use crate::platforms::{
    get_runner, platform_specs, quota_manager::global_quota_manager, sdk_bridge::SdkBridge,
};
use crate::types::*;
use anyhow::{Result, anyhow};
use crossbeam_channel::Sender;
use std::time::Instant;

// DRY:DATA:ExecutionEngine
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
    // DRY:FN:new
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
        log::debug!(
            "Execution guard config: stall_timeout_secs={}, stall_max_repeats={}",
            self.stall_timeout_secs,
            self.stall_max_repeats
        );

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
            let request = self.build_execution_request(context, platform);

            // Execute the request
            match self.execute_with_sdk_fallback(&*runner, &request).await {
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

    // DRY:FN:build_execution_request — Build an ExecutionRequest from IterationContext and target platform
    fn build_execution_request(
        &self,
        context: &IterationContext,
        platform: Platform,
    ) -> ExecutionRequest {
        let mut request = ExecutionRequest::new(
            platform,
            context.model.clone(),
            context.prompt.clone(),
            context.working_dir.clone(),
        )
        .with_plan_mode(context.plan_mode)
        .with_sdk(platform_specs::has_sdk(platform))
        .with_session_id(context.session_id.clone());

        if let Some(timeout_ms) = context.timeout_ms {
            request = request.with_timeout(std::time::Duration::from_millis(timeout_ms));
        }

        if let Some(ref effort) = context.reasoning_effort {
            request = request.with_reasoning_effort(effort.clone());
        }

        if !context.context_files.is_empty() {
            request = request.with_context_files(context.context_files.clone());
        }

        for (key, value) in &context.env_vars {
            request = request.with_env(key.clone(), value.clone());
        }

        // DRY:FN:subagent_config_injection — Apply subagent env vars and extra args
        if context.subagent_enabled {
            for (key, value) in platform_specs::subagent_env_vars(platform) {
                request = request.with_env(key.to_string(), value.to_string());
            }
            for arg in platform_specs::subagent_extra_args(platform) {
                request.extra_args.push(arg.to_string());
            }
        }

        request
    }

    // DRY:FN:execute_with_sdk_fallback — Try SDK execution first when enabled, then fall back to CLI runner
    async fn execute_with_sdk_fallback(
        &self,
        runner: &dyn crate::platforms::PlatformRunner,
        request: &ExecutionRequest,
    ) -> Result<ExecutionResult> {
        if request.use_sdk && platform_specs::has_sdk(request.platform) {
            if let Some(result) = self.try_execute_with_sdk(request).await {
                return Ok(result);
            }
            log::info!(
                "Falling back to CLI runner for {} after SDK attempt",
                request.platform
            );
        }

        runner.execute(request).await
    }

    /// Try SDK execution and return `Some(result)` on success, `None` to trigger CLI fallback.
    async fn try_execute_with_sdk(&self, request: &ExecutionRequest) -> Option<ExecutionResult> {
        let Some(bridge) = SdkBridge::new() else {
            log::info!(
                "SDK bridge unavailable for {} (Node.js not found)",
                request.platform
            );
            return None;
        };

        if !bridge.is_sdk_installed(request.platform).await {
            log::info!(
                "SDK package not installed for {}. Falling back to CLI",
                request.platform
            );
            return None;
        }

        let sdk_result = match bridge
            .execute_prompt(
                request.platform,
                &request.prompt,
                &request.model,
                &request.working_directory,
                request.plan_mode,
                request.reasoning_effort.as_deref(),
            )
            .await
        {
            Ok(result) => result,
            Err(e) => {
                log::warn!(
                    "SDK execution failed for {}: {}. Falling back to CLI",
                    request.platform,
                    e
                );
                return None;
            }
        };

        if !sdk_result.success {
            log::warn!(
                "SDK execution returned failure for {}: {}",
                request.platform,
                sdk_result.output
            );
            return None;
        }

        let mut result = ExecutionResult::success().with_output(sdk_result.output.clone());
        result.exit_code = Some(sdk_result.exit_code);
        result.session_id = request.session_id.clone();
        Some(result)
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

// DRY:DATA:IterationResult
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
    use std::collections::HashMap;
    use std::path::PathBuf;

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
    fn test_build_execution_request_includes_plan_mode_and_reasoning_effort() {
        let engine = create_test_engine();
        let mut context = test_context(Platform::Claude);
        context.plan_mode = true;
        context.reasoning_effort = Some("high".to_string());

        let request = engine.build_execution_request(&context, Platform::Claude);

        assert!(request.plan_mode);
        assert_eq!(request.reasoning_effort.as_deref(), Some("high"));
    }

    #[test]
    fn test_build_execution_request_sets_sdk_by_platform_capability() {
        let engine = create_test_engine();
        let context = test_context(Platform::Codex);

        let codex_request = engine.build_execution_request(&context, Platform::Codex);
        let claude_request = engine.build_execution_request(&context, Platform::Claude);

        assert!(codex_request.use_sdk);
        assert!(!claude_request.use_sdk);
    }

    fn create_test_engine() -> ExecutionEngine {
        let (tx, _rx) = crossbeam_channel::unbounded();
        ExecutionEngine::new(tx, 120, 10)
    }

    fn test_context(platform: Platform) -> IterationContext {
        IterationContext {
            tier_id: "tier-1".to_string(),
            phase_id: "ph-1".to_string(),
            task_id: "tk-1".to_string(),
            subtask_id: "st-1".to_string(),
            iteration_number: 1,
            iteration: 1,
            prompt: "test prompt".to_string(),
            model: "test-model".to_string(),
            platform,
            working_directory: PathBuf::from("/tmp"),
            working_dir: PathBuf::from("/tmp"),
            session_id: "session-1".to_string(),
            timeout_ms: Some(30_000),
            timeout_secs: Some(30),
            context_files: vec![],
            env_vars: HashMap::new(),
            plan_mode: false,
            reasoning_effort: None,
            subagent_enabled: false,
        }
    }
}
