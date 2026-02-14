//! Claude Code CLI platform runner
//!
//! Executes tasks using the Claude Code CLI (Anthropic).
//! Uses subscription-based auth (Claude Max/Pro plan), NOT per-use API keys.
//!
//! ## Command: `claude`
//!
//! ## Key flags (headless/non-interactive `-p` mode)
//! - `-p "prompt"` or `--print "prompt"` — Headless print mode
//! - `--model <model>` — Model selection (e.g., `sonnet`, `opus`, `claude-sonnet-4-5`)
//! - `--output-format text|json|stream-json` — Output format
//! - `--no-session-persistence` — Disable session save (use for fresh process per iteration)
//! - `--permission-mode <mode>` — Permission behavior:
//!   - `default` — Normal permissions
//!   - `acceptEdits` — Auto-accept file edits
//!   - `plan` — Read-only analysis mode
//!   - `dontAsk` — Skip permission prompts
//!   - `bypassPermissions` — Bypass all permissions
//! - `--dangerously-skip-permissions` — Bypass all permission checks (trusted envs only)
//! - `--allowedTools <tools>` — Comma-separated tool whitelist (e.g., "Read,Edit,Bash")
//! - `--disallowedTools <tools>` — Comma-separated tool blacklist
//! - `--max-turns <n>` — Limit agentic turns
//! - `--append-system-prompt "..."` — Append to system prompt
//! - `--append-system-prompt-file <path>` — Append from file
//! - `--add-dir <path>` — Allow access to specific directories
//! - `--agent <name>` — Specify primary agent
//! - `--agents <json>` — Define multiple subagents
//! - `--chrome` — Enable Chrome integration for browser automation
//! - `--debug` — Debug output (verbose logging)
//! - `--betas` — Enable beta features
//! - `--input-format stream-json` — For piped/streaming input data
//!
//! ## Authentication
//! - Uses local auth from Claude app (subscription-based)
//! - No API key required for subscription users
//!
//! ## Session management
//! - `claude -c` — Continue last conversation (NOT used by Puppet Master)
//! - `claude --resume <session-id>` — Resume session (NOT used by Puppet Master)
//!
//! ## Config file hierarchy
//! 1. `/etc/claude-code/managed-settings.json` (enterprise/global)
//! 2. `.claude/settings.local.json` (local/personal)
//! 3. `.claude/settings.json` (shared/team)
//! 4. `~/.claude/settings.json` (user-global)
//!
//! ## Puppet Master policy
//! - Fresh process per iteration (no `-c`/`--continue`, no `--resume`)
//! - Uses `--no-session-persistence` to prevent session saves
//! - Plan mode uses `--permission-mode plan` flag
//! - Always uses `--output-format json` for structured output

use crate::platforms::context_files::{append_prompt_attachments, context_file_parent_dirs};
use crate::platforms::{BaseRunner, PlatformRunner};
use crate::types::{ExecutionRequest, ExecutionResult, Platform};
use anyhow::{Result, anyhow};
use async_trait::async_trait;
use log::{debug, warn};
use std::sync::Arc;
use tokio::process::Command;

/// Claude Code CLI runner
pub struct ClaudeRunner {
    base: Arc<BaseRunner>,
}

impl ClaudeRunner {
    /// Create a new Claude runner
    pub fn new() -> Self {
        Self {
            base: Arc::new(BaseRunner::new("claude".to_string(), Platform::Claude)),
        }
    }

    /// Discover models via CLI
    async fn discover_models_from_cli(&self) -> Result<Vec<String>> {
        debug!("Discovering Claude models via CLI");

        // Try to get model list from help or config
        let output = Command::new("claude").arg("--help").output().await?;

        if output.status.success() {
            let help_text = String::from_utf8_lossy(&output.stdout);

            // Parse model names from help text
            let mut models = Vec::new();
            for line in help_text.lines() {
                if line.contains("claude-") {
                    // Extract model name
                    if let Some(model) = line.split_whitespace().find(|s| s.starts_with("claude-"))
                    {
                        models.push(model.to_string());
                    }
                }
            }

            if !models.is_empty() {
                return Ok(models);
            }
        }

        Err(anyhow!("Failed to discover models from CLI"))
    }
}

impl Default for ClaudeRunner {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl PlatformRunner for ClaudeRunner {
    fn platform(&self) -> Platform {
        Platform::Claude
    }

    async fn execute(&self, request: &ExecutionRequest) -> Result<ExecutionResult> {
        use crate::platforms::CompletionSignal as ParserCompletionSignal;
        use crate::platforms::create_parser;
        use crate::types::CompletionSignal as TypesCompletionSignal;

        let args = self.build_args(request);
        let mut result = self.base.execute_command(request, args, None).await?;

        // Parse output using platform-specific parser
        if let Some(output) = &result.output {
            let parser = create_parser(Platform::Claude);
            let parsed = parser.parse(output, "");

            result.files_changed = parsed.files_changed.into_iter().map(|s| s.into()).collect();
            result.learnings = parsed.learnings;

            if let Some(token_usage) = parsed.token_usage {
                result.tokens_used = token_usage.total_tokens;
            }

            if let Some(signal) = parsed.completion_signal {
                result.completion_signal = match signal {
                    ParserCompletionSignal::Complete => TypesCompletionSignal::Complete,
                    ParserCompletionSignal::Gutter => TypesCompletionSignal::Gutter,
                };
            }

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
        BaseRunner::is_command_available("claude").await
    }

    async fn discover_models(&self) -> Result<Vec<String>> {
        // Try CLI discovery first
        if let Ok(models) = self.discover_models_from_cli().await {
            if !models.is_empty() {
                return Ok(models);
            }
        }

        // Fallback to known Claude models
        warn!("CLI model discovery failed, using known Claude models");
        Ok(vec![
            "claude-sonnet-4-5".to_string(),
            "claude-sonnet-4".to_string(),
            "claude-opus-4".to_string(),
            "claude-haiku-4".to_string(),
            "sonnet".to_string(),
            "opus".to_string(),
        ])
    }

    fn build_args(&self, request: &ExecutionRequest) -> Vec<String> {
        let mut args = Vec::new();

        // Add prompt
        args.push("-p".to_string());
        args.push(append_prompt_attachments(
            &request.prompt,
            &request.context_files,
            "",
        ));

        // Add model
        args.push("--model".to_string());
        args.push(request.model.clone());

        // JSON output format
        args.push("--output-format".to_string());
        args.push("json".to_string());

        // No session persistence for orchestrator use
        args.push("--no-session-persistence".to_string());

        // Permission mode based on plan_mode
        args.push("--permission-mode".to_string());
        if request.plan_mode {
            args.push("plan".to_string());
        } else {
            // bypassPermissions for fully autonomous operation
            args.push("bypassPermissions".to_string());
        }

        // Allow additional reference directories
        for dir in context_file_parent_dirs(&request.context_files) {
            args.push("--add-dir".to_string());
            args.push(dir.display().to_string());
        }

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
    async fn test_claude_runner_creation() {
        let runner = ClaudeRunner::new();
        assert_eq!(runner.platform(), Platform::Claude);
    }

    #[test]
    fn test_build_args() {
        let runner = ClaudeRunner::new();
        let request = ExecutionRequest::new(
            Platform::Claude,
            "claude-3-5-sonnet-20241022".to_string(),
            "Test prompt".to_string(),
            PathBuf::from("/tmp"),
        );

        let args = runner.build_args(&request);

        assert!(args.contains(&"-p".to_string()));
        assert!(args.contains(&"Test prompt".to_string()));
        assert!(args.contains(&"--model".to_string()));
        assert!(args.contains(&"claude-3-5-sonnet-20241022".to_string()));
        assert!(args.contains(&"--output-format".to_string()));
        assert!(args.contains(&"json".to_string()));
        assert!(args.contains(&"--no-session-persistence".to_string()));
        assert!(args.contains(&"--permission-mode".to_string()));
        assert!(args.contains(&"bypassPermissions".to_string()));
    }

    #[test]
    fn test_build_args_plan_mode() {
        let runner = ClaudeRunner::new();
        let request = ExecutionRequest::new(
            Platform::Claude,
            "claude-3-5-sonnet-20241022".to_string(),
            "Test prompt".to_string(),
            PathBuf::from("/tmp"),
        )
        .with_plan_mode(true);

        let args = runner.build_args(&request);

        assert!(args.contains(&"--permission-mode".to_string()));
        assert!(args.contains(&"plan".to_string()));
    }

    #[test]
    fn test_build_args_with_context_files() {
        let runner = ClaudeRunner::new();
        let request = ExecutionRequest::new(
            Platform::Claude,
            "claude-3-5-sonnet-20241022".to_string(),
            "Test prompt".to_string(),
            PathBuf::from("/tmp"),
        )
        .with_context_files(vec![PathBuf::from("/tmp/ref.png")]);

        let args = runner.build_args(&request);

        assert!(args.iter().any(|a| a.contains("/tmp/ref.png")));
        assert!(args.contains(&"--add-dir".to_string()));
    }

    #[tokio::test]
    async fn test_discover_models() {
        let runner = ClaudeRunner::new();
        // Use timeout to prevent hanging if claude CLI is not installed
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
