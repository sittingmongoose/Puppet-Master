//! Cursor CLI platform runner
//!
//! Executes tasks using the Cursor AI agent CLI.
//! Uses subscription-based auth (Cursor Pro plan), NOT per-use API keys.
//!
//! ## Installation
//! - macOS/Linux: `curl https://cursor.com/install -fsS | bash`
//! - Windows: `irm 'https://cursor.com/install?win32=true' | iex`
//!
//! ## Command variants
//! - `agent` (preferred)
//! - `cursor-agent` (fallback)
//!
//! ## Key flags (headless/non-interactive mode)
//! - `-p "prompt"` or `--print "prompt"` — Headless print mode
//! - `--model <model>` or `-m <model>` — Model selection
//! - `--mode=plan|ask` — Plan (read-only) or Ask (Q&A) mode
//! - `--output-format text|json|stream-json` — Output format (requires -p)
//! - `--stream-partial-output` — Incremental updates with stream-json
//! - `--force` or `-f` — Force file/command changes in headless mode
//! - `-a <key>` or `--api-key <key>` — API key for headless auth
//! - `--resume [chatId]` — Resume previous chat (NOT used by Puppet Master)
//! - `--list-models` — List available AI models
//!
//! ## Model discovery
//! - `agent models` or `agent --list-models`
//!
//! ## MCP support
//! - `agent mcp list` — List MCP servers
//! - `agent mcp list-tools <server>` — List tools from MCP server
//!
//! ## Authentication
//! - `agent login` — Interactive browser auth
//! - `agent status` — Check auth status
//! - `CURSOR_API_KEY` env var for headless/CI
//! - Uses Cursor Pro subscription, not per-use API charges
//!
//! ## Puppet Master policy
//! - Fresh process per iteration (no `--resume`, no session reuse)
//! - Always uses `-p` mode with `--force` for autonomous operation
//! - Prompts > 32KB are sent via stdin

use crate::platforms::context_files::append_prompt_attachments;
use crate::platforms::{BaseRunner, PlatformRunner, platform_specs};
use crate::types::{ExecutionRequest, ExecutionResult, Platform};
use anyhow::{Result, anyhow};
use async_trait::async_trait;
use log::{debug, info, warn};
use std::sync::Arc;
use tokio::process::Command;

const LARGE_PROMPT_THRESHOLD: usize = 32 * 1024; // 32KB

// DRY:DATA:CursorRunner — Cursor CLI runner
/// Cursor CLI runner
pub struct CursorRunner {
    base: Arc<BaseRunner>,
    command: String,
}

impl CursorRunner {
    // DRY:FN:new — Create a new Cursor runner
    /// Create a new Cursor runner
    pub fn new() -> Self {
        let command = Platform::Cursor.resolve_cli_command();
        Self {
            base: Arc::new(BaseRunner::new(command.clone(), Platform::Cursor)),
            command,
        }
    }

    /// Initialize the runner (find available command)
    async fn _init(&mut self) {
        if let Some(cmd) =
            BaseRunner::find_available_command(platform_specs::cli_binary_names(Platform::Cursor))
                .await
        {
            info!("Using Cursor command: {}", cmd);
            self.command = cmd.clone();
            self.base = Arc::new(BaseRunner::new(cmd, Platform::Cursor));
        }
    }

    /// Discover models via CLI
    async fn discover_models_from_cli(&self) -> Result<Vec<String>> {
        debug!("Discovering Cursor models via CLI");

        let output = Command::new(&self.command).arg("models").output().await?;

        if !output.status.success() {
            return Err(anyhow!("Failed to discover models"));
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        let models: Vec<String> = stdout
            .lines()
            .filter(|line| !line.trim().is_empty())
            .map(|line| line.trim().to_string())
            .collect();

        Ok(models)
    }
}

impl Default for CursorRunner {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl PlatformRunner for CursorRunner {
    fn platform(&self) -> Platform {
        Platform::Cursor
    }

    async fn execute(&self, request: &ExecutionRequest) -> Result<ExecutionResult> {
        use crate::platforms::CompletionSignal as ParserCompletionSignal;
        use crate::platforms::create_parser;
        use crate::types::CompletionSignal as TypesCompletionSignal;

        let mut effective_request = request.clone();
        effective_request.prompt =
            append_prompt_attachments(&request.prompt, &request.context_files, "");

        // Build arguments
        let args = self.build_args(&effective_request);

        // Check if we need to use stdin for large prompts
        let use_stdin = effective_request.prompt.len() > LARGE_PROMPT_THRESHOLD;

        let stdin_input = if use_stdin {
            debug!(
                "Using stdin for large prompt ({} bytes)",
                effective_request.prompt.len()
            );
            Some(effective_request.prompt.clone())
        } else {
            None
        };

        // Execute via base runner
        let mut result = self
            .base
            .execute_command(&effective_request, args, stdin_input)
            .await?;

        // Parse output using platform-specific parser
        if let Some(output) = &result.output {
            let parser = create_parser(Platform::Cursor);
            let parsed = parser.parse(output, ""); // stderr is already merged in output

            // Populate result with parsed data
            result.files_changed = parsed.files_changed.into_iter().map(|s| s.into()).collect();
            result.learnings = parsed.learnings;

            // Update token usage if available
            if let Some(token_usage) = parsed.token_usage {
                result.tokens_used = token_usage.total_tokens;
            }

            // If parsed output detected a more specific completion signal, use it
            if let Some(signal) = parsed.completion_signal {
                result.completion_signal = match signal {
                    ParserCompletionSignal::Complete => TypesCompletionSignal::Complete,
                    ParserCompletionSignal::Gutter => TypesCompletionSignal::Gutter,
                };
            }

            // If errors were detected, include them in error_message
            if !parsed.errors.is_empty() {
                let error_msgs: Vec<String> =
                    parsed.errors.iter().map(|e| e.message.clone()).collect();
                if let Some(existing_error) = &result.error_message {
                    result.error_message = Some(format!(
                        "{}\nParsed errors: {}",
                        existing_error,
                        error_msgs.join("; ")
                    ));
                } else {
                    result.error_message =
                        Some(format!("Parsed errors: {}", error_msgs.join("; ")));
                }
            }
        }

        Ok(result)
    }

    async fn is_available(&self) -> bool {
        if BaseRunner::is_command_available(&self.command).await {
            return true;
        }

        for cmd in platform_specs::cli_binary_names(Platform::Cursor) {
            if BaseRunner::is_command_available(cmd).await {
                return true;
            }
        }

        // DRY REQUIREMENT: Backward compatibility check MUST use platform_specs — DO NOT hardcode "cursor-agent"
        // Backward compatibility for older Cursor installs (cursor-agent is already in platform_specs::cli_binary_names)
        // This check is redundant since platform_specs already includes "cursor-agent" as a fallback binary name
        false
    }

    async fn discover_models(&self) -> Result<Vec<String>> {
        // Try CLI discovery first
        if let Ok(models) = self.discover_models_from_cli().await {
            if !models.is_empty() {
                return Ok(models);
            }
        }

        warn!("CLI model discovery returned no models for Cursor");
        Ok(Vec::new())
    }

    fn build_args(&self, request: &ExecutionRequest) -> Vec<String> {
        let mut args = Vec::new();

        // Check if we should use stdin
        let use_stdin = request.prompt.len() > LARGE_PROMPT_THRESHOLD;

        if !use_stdin {
            // Add prompt as argument
            args.push("-p".to_string());
            args.push(request.prompt.clone());
        }

        // Add model
        args.push("--model".to_string());
        args.push(request.model.clone());

        // Plan mode or force for headless autonomous file changes
        if request.plan_mode {
            args.push("--mode".to_string());
            args.push("plan".to_string());
        } else {
            args.push("--force".to_string());
        }

        // Always request JSON output for structured parsing
        args.push("--output-format".to_string());
        args.push("json".to_string());

        // NOTE: Cursor uses --add-dir in platform_specs, but it doesn't need explicit working_dir
        // flag since cmd.current_dir() (set by base runner) is sufficient

        // Add any extra args
        for arg in &request.extra_args {
            args.push(arg.clone());
        }

        args
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[tokio::test]
    async fn test_cursor_runner_creation() {
        let runner = CursorRunner::new();
        assert_eq!(runner.platform(), Platform::Cursor);
    }

    #[test]
    fn test_build_args() {
        let runner = CursorRunner::new();
        let request = ExecutionRequest::new(
            Platform::Cursor,
            "gpt-4o".to_string(),
            "Test prompt".to_string(),
            PathBuf::from("/tmp"),
        );

        let args = runner.build_args(&request);

        assert!(args.contains(&"-p".to_string()));
        assert!(args.contains(&"Test prompt".to_string()));
        assert!(args.contains(&"--model".to_string()));
        assert!(args.contains(&"gpt-4o".to_string()));
        assert!(args.contains(&"--force".to_string()));
        assert!(args.contains(&"--output-format".to_string()));
        assert!(args.contains(&"json".to_string()));
    }

    #[test]
    fn test_build_args_with_plan_mode() {
        let runner = CursorRunner::new();
        let request = ExecutionRequest::new(
            Platform::Cursor,
            "gpt-4o".to_string(),
            "Test prompt".to_string(),
            PathBuf::from("/tmp"),
        )
        .with_plan_mode(true);

        let args = runner.build_args(&request);

        assert!(args.contains(&"--mode".to_string()));
        assert!(args.contains(&"plan".to_string()));
    }

    #[test]
    fn test_large_prompt_detection() {
        let runner = CursorRunner::new();
        let large_prompt = "x".repeat(LARGE_PROMPT_THRESHOLD + 1);
        let request = ExecutionRequest::new(
            Platform::Cursor,
            "gpt-4o".to_string(),
            large_prompt,
            PathBuf::from("/tmp"),
        );

        let args = runner.build_args(&request);

        // Should not contain -p flag for large prompts
        assert!(!args.contains(&"-p".to_string()));
    }

    #[tokio::test]
    async fn test_discover_models() {
        let runner = CursorRunner::new();
        // Use timeout to prevent hanging if cursor CLI is not installed
        let result =
            tokio::time::timeout(std::time::Duration::from_secs(5), runner.discover_models()).await;

        match result {
            Ok(models) => {
                assert!(models.is_ok());
                let model_list = models.unwrap();
                assert!(!model_list.is_empty());
            }
            Err(_) => {} // Timeout is acceptable in test environment
        }
    }
}
