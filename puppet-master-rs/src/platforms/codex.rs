//! Codex CLI platform runner
//!
//! Executes tasks using the OpenAI Codex CLI.
//! Uses subscription-based auth (ChatGPT Plus/Pro plan), NOT per-use API keys.
//!
//! ## Command: `codex`
//!
//! ## Key flags (non-interactive `exec` mode)
//! - `exec "prompt"` — Non-interactive execution with JSONL output
//! - `--full-auto` — Convenience mode for sandboxed automatic execution
//! - `--json` or `--experimental-json` — JSONL event stream output
//! - `--model <model>` or `-m <model>` — Model selection (e.g., `gpt-5.2-codex`)
//! - `--cd <dir>` or `-C <dir>` — Working directory
//! - `--color <mode>` — ANSI color: `always | never | auto` (use `never` for parsing)
//! - `--max-turns <n>` — Cap agentic turns
//! - `--skip-git-repo-check` — Allow running outside Git repository
//! - `--output-last-message <path>` or `-o <path>` — Write final message to file
//! - `--output-schema <path>` — Structured JSON output with custom schema
//! - `--sandbox <mode>` — `read-only | workspace-write | danger-full-access`
//! - `--add-dir <path>` — Grant additional directories write access (repeatable)
//! - `--image <path>` or `-i <path>` — Attach image files
//! - `--profile <name>` or `-p <name>` — Load config profile from `~/.codex/config.toml`
//! - `-c key=value` or `--config key=value` — Inline config overrides
//! - `--search` — Enable web search capability
//! - `-c model_reasoning_effort=<level>` — Override reasoning effort via config key
//!
//! ## Authentication
//! - Reuses saved CLI auth by default
//! - `CODEX_API_KEY` env var for CI/headless (for `codex exec` only)
//! - `codex login --device-auth` for headless device-code flow
//! - Uses ChatGPT/Codex subscription, not per-use API charges
//!
//! ## Configuration
//! - `~/.codex/config.toml` for persistent settings
//! - Team config: `.codex/` in cwd/parents/repo root + `~/.codex` + `/etc/codex`
//!
//! ## Puppet Master policy
//! - Fresh process per iteration (no `/resume`, no session reuse)
//! - Uses `--full-auto` for autonomous execution
//! - Uses `--json` for structured JSONL output
//! - Uses `--color never` for clean output parsing

use crate::platforms::context_files::{context_file_parent_dirs, has_image_extension};
use crate::platforms::{BaseRunner, PlatformRunner, platform_specs};
use crate::types::{ExecutionRequest, ExecutionResult, Platform};
use anyhow::{Result, anyhow};
use async_trait::async_trait;
use log::{debug, warn};
use std::sync::Arc;

// DRY:DATA:CodexRunner
/// Codex CLI runner
pub struct CodexRunner {
    base: Arc<BaseRunner>,
}

impl CodexRunner {
    // DRY:FN:new — Create a new Codex runner
    /// Create a new Codex runner
    pub fn new() -> Self {
        let command = Platform::Codex.resolve_cli_command();
        Self {
            base: Arc::new(BaseRunner::new(command, Platform::Codex)),
        }
    }

    /// Discover models from Codex config
    async fn discover_models_from_config(&self) -> Result<Vec<String>> {
        debug!("Discovering Codex models from config");

        // Codex config is TOML at ~/.codex/config.toml
        if let Some(home) = directories::BaseDirs::new() {
            let config_path = home.home_dir().join(".codex").join("config.toml");

            if config_path.exists() {
                if let Ok(content) = tokio::fs::read_to_string(&config_path).await {
                    // Parse TOML for model settings
                    let mut models = Vec::new();
                    for line in content.lines() {
                        let trimmed = line.trim();
                        if trimmed.starts_with("model") && trimmed.contains('=') {
                            if let Some(val) = trimmed.split('=').nth(1) {
                                let model = val.trim().trim_matches('"').trim_matches('\'');
                                if !model.is_empty() {
                                    models.push(model.to_string());
                                }
                            }
                        }
                    }
                    if !models.is_empty() {
                        return Ok(models);
                    }
                }
            }
        }

        Err(anyhow!("No models found in Codex config"))
    }
}

impl Default for CodexRunner {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl PlatformRunner for CodexRunner {
    fn platform(&self) -> Platform {
        Platform::Codex
    }

    async fn execute(&self, request: &ExecutionRequest) -> Result<ExecutionResult> {
        use crate::platforms::CompletionSignal as ParserCompletionSignal;
        use crate::platforms::create_parser;
        use crate::types::CompletionSignal as TypesCompletionSignal;

        let args = self.build_args(request);
        let mut result = self.base.execute_command(request, args, None).await?;

        // Parse output using platform-specific parser
        if let Some(output) = &result.output {
            let parser = create_parser(Platform::Codex);
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
        for cmd in platform_specs::cli_binary_names(Platform::Codex) {
            if BaseRunner::is_command_available(cmd).await {
                return true;
            }
        }
        false
    }

    async fn discover_models(&self) -> Result<Vec<String>> {
        // Try config-based discovery
        if let Ok(models) = self.discover_models_from_config().await {
            if !models.is_empty() {
                return Ok(models);
            }
        }

        // Fallback to known Codex models
        warn!("Config-based model discovery failed, using known Codex models");
        Ok(platform_specs::fallback_model_ids(Platform::Codex)
            .into_iter()
            .map(str::to_string)
            .collect())
    }

    fn build_args(&self, request: &ExecutionRequest) -> Vec<String> {
        let mut args = Vec::new();

        // Codex uses "exec" subcommand
        args.push("exec".to_string());

        // Add prompt
        args.push(request.prompt.clone());

        // Plan mode uses read-only sandbox behavior.
        if request.plan_mode {
            args.push("--sandbox".to_string());
            args.push("read-only".to_string());
        } else {
            args.push("--full-auto".to_string());
        }

        // JSON output
        args.push("--json".to_string());

        // Model
        args.push("--model".to_string());
        args.push(request.model.clone());

        // Disable color output for parsing
        args.push("--color".to_string());
        args.push("never".to_string());

        // DRY:FN:codex_working_dir — Pass working directory via platform_specs working_dir_flag.
        args.push(
            platform_specs::get_spec(Platform::Codex)
                .working_dir_flag
                .unwrap_or("--cd")
                .to_string(),
        );
        args.push(request.working_directory.display().to_string());

        // Allow access to any referenced file locations
        for dir in context_file_parent_dirs(&request.context_files) {
            args.push("--add-dir".to_string());
            args.push(dir.display().to_string());
        }

        // Attach image files (Codex supports -i/--image)
        for p in &request.context_files {
            if has_image_extension(p.as_path()) {
                args.push("--image".to_string());
                args.push(p.display().to_string());
            }
        }

        // Reasoning effort override via config key (supported by current Codex CLI)
        if let Some(ref effort) = request.reasoning_effort {
            args.push("-c".to_string());
            args.push(format!("model_reasoning_effort={effort}"));
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
    async fn test_codex_runner_creation() {
        let runner = CodexRunner::new();
        assert_eq!(runner.platform(), Platform::Codex);
    }

    #[test]
    fn test_build_args() {
        let runner = CodexRunner::new();
        let request = ExecutionRequest::new(
            Platform::Codex,
            "gpt-4o".to_string(),
            "Test prompt".to_string(),
            PathBuf::from("/tmp"),
        );

        let args = runner.build_args(&request);

        assert!(args.contains(&"exec".to_string()));
        assert!(args.contains(&"Test prompt".to_string()));
        assert!(args.contains(&"--full-auto".to_string()));
        assert!(args.contains(&"--json".to_string()));
        assert!(args.contains(&"--model".to_string()));
        assert!(args.contains(&"gpt-4o".to_string()));
        assert!(args.contains(&"--color".to_string()));
        assert!(args.contains(&"never".to_string()));
    }

    #[test]
    fn test_build_args_with_reasoning_effort() {
        let runner = CodexRunner::new();
        let request = ExecutionRequest::new(
            Platform::Codex,
            "o3-mini".to_string(),
            "Test prompt".to_string(),
            PathBuf::from("/tmp"),
        )
        .with_reasoning_effort("high");

        let args = runner.build_args(&request);

        assert!(args.contains(&"-c".to_string()));
        assert!(args.contains(&"model_reasoning_effort=high".to_string()));
        assert!(!args.contains(&"--reasoning-effort".to_string()));
    }

    #[test]
    fn test_build_args_plan_mode() {
        let runner = CodexRunner::new();
        let request = ExecutionRequest::new(
            Platform::Codex,
            "gpt-4o".to_string(),
            "Test prompt".to_string(),
            PathBuf::from("/tmp"),
        )
        .with_plan_mode(true);

        let args = runner.build_args(&request);

        // Should not have --full-auto in plan mode; should enforce read-only plan behavior
        assert!(!args.contains(&"--full-auto".to_string()));
        assert!(args.contains(&"--sandbox".to_string()));
        assert!(args.contains(&"read-only".to_string()));
    }

    #[test]
    fn test_build_args_with_images() {
        let runner = CodexRunner::new();
        let request = ExecutionRequest::new(
            Platform::Codex,
            "gpt-5.2-codex".to_string(),
            "Test prompt".to_string(),
            PathBuf::from("/tmp"),
        )
        .with_context_files(vec![PathBuf::from("/tmp/ref.png"), PathBuf::from("/tmp/ref.txt")]);

        let args = runner.build_args(&request);

        // Image file attached, non-image ignored
        assert!(args.contains(&"--image".to_string()));
        assert!(args.contains(&"/tmp/ref.png".to_string()));
        assert!(!args.contains(&"/tmp/ref.txt".to_string()));
        assert!(args.contains(&"--add-dir".to_string()));
        assert!(args.contains(&"/tmp".to_string()));
    }

    #[tokio::test]
    async fn test_discover_models() {
        let runner = CodexRunner::new();
        // Use timeout to prevent hanging if codex CLI is not installed
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
