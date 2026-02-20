//! Gemini CLI platform runner
//!
//! Executes tasks using the Google Gemini CLI.
//! Uses subscription-based auth (Google AI/Gemini), NOT per-use API keys.
//!
//! ## Command: `gemini`
//! ## Installation: `npm install -g @google/gemini-cli` or `brew install gemini-cli`
//!
//! ## Key flags (headless/non-interactive mode)
//! - `-p "prompt"` or `--prompt "prompt"` — Headless mode with prompt
//! - `--output-format text|json|stream-json` — Output format
//!   - `json`: `{ response, stats, error? }`
//!   - `stream-json`: JSONL events (init, message, tool_use, tool_result, error, result)
//! - `--approval-mode <mode>` — Tool approval:
//!   - `yolo` or `--yolo` — Auto-approve all tool calls (recommended for automation)
//!   - `auto_edit` — Auto-approve edit tools only
//!   - `plan` — Read-only mode (requires `experimental.plan: true` in settings)
//! - `--model <model>` or `-m <model>` — Model selection
//!   - `auto` (recommended) — Automatic model selection by task complexity
//!   - `gemini-2.5-pro`, `gemini-3-pro-preview` — Pro models (complex reasoning)
//!   - `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-3-flash-preview` — Flash models
//! - `--sandbox` or `-s` — Sandbox execution environment
//! - `--include-directories <dir1,dir2>` — Multi-directory workspace (max 5)
//! - `--debug` or `-d` — Debug/verbose output
//! - `--non-interactive` — Ensure no user input prompts (CI/CD)
//! - `--resume [session-id]` — Resume session (NOT used by Puppet Master)
//!
//! ## Model discovery
//! - `gemini models` — List available models dynamically
//!
//! ## Authentication
//! - OAuth via `gemini` first run (interactive)
//! - `GEMINI_API_KEY` or `GOOGLE_API_KEY` env var (headless/automation)
//! - Vertex AI: `GOOGLE_APPLICATION_CREDENTIALS` + `GOOGLE_CLOUD_PROJECT`
//! - Uses Google subscription, not per-use API charges
//!
//! ## Configuration
//! - User: `~/.gemini/settings.json` (highest precedence)
//! - Project: `.gemini/settings.json`
//! - Context: `GEMINI.md` files (hierarchical loading up to 200 dirs)
//! - `.geminiignore` for file exclusion
//!
//! ## Puppet Master policy
//! - Fresh process per iteration (no `--resume`, no session reuse)
//! - Uses `--approval-mode yolo` for autonomous execution
//! - Uses `--output-format json` for structured output

use crate::platforms::context_files::{append_prompt_attachments, context_file_parent_dirs};
use crate::platforms::{BaseRunner, PlatformRunner, platform_specs};
use crate::types::{ExecutionRequest, ExecutionResult, Platform};
use anyhow::{Result, anyhow};
use async_trait::async_trait;
use log::{debug, warn};
use std::sync::Arc;
use tokio::process::Command;

// DRY:DATA:GeminiRunner — Gemini CLI runner
/// Gemini CLI runner
pub struct GeminiRunner {
    base: Arc<BaseRunner>,
}

impl GeminiRunner {
    // DRY:FN:new — Create a new Gemini runner
    /// Create a new Gemini runner
    pub fn new() -> Self {
        let command = Platform::Gemini.resolve_cli_command();
        Self {
            base: Arc::new(BaseRunner::new(command, Platform::Gemini)),
        }
    }

    /// Discover models via CLI
    async fn discover_models_from_cli(&self) -> Result<Vec<String>> {
        debug!("Discovering Gemini models via CLI");

        let output = Command::new(&self.base.command)
            .arg("models")
            .output()
            .await?;

        if !output.status.success() {
            return Err(anyhow!("Failed to discover models"));
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        let models: Vec<String> = stdout
            .lines()
            .filter(|line| !line.trim().is_empty())
            .filter(|line| !line.starts_with('#') && !line.starts_with("//"))
            .map(|line| line.trim().to_string())
            .collect();

        Ok(models)
    }
}

impl Default for GeminiRunner {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl PlatformRunner for GeminiRunner {
    fn platform(&self) -> Platform {
        Platform::Gemini
    }

    async fn execute(&self, request: &ExecutionRequest) -> Result<ExecutionResult> {
        use crate::platforms::CompletionSignal as ParserCompletionSignal;
        use crate::platforms::create_parser;
        use crate::types::CompletionSignal as TypesCompletionSignal;

        let args = self.build_args(request);
        let mut result = self.base.execute_command(request, args, None).await?;

        // Parse output using platform-specific parser
        if let Some(output) = &result.output {
            let parser = create_parser(Platform::Gemini);
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
        for cmd in platform_specs::cli_binary_names(Platform::Gemini) {
            if BaseRunner::is_command_available(cmd).await {
                return true;
            }
        }
        false
    }

    async fn discover_models(&self) -> Result<Vec<String>> {
        // Try CLI discovery first
        if let Ok(models) = self.discover_models_from_cli().await {
            if !models.is_empty() {
                return Ok(models);
            }
        }

        warn!("CLI model discovery returned no models for Gemini");
        Ok(Vec::new())
    }

    fn build_args(&self, request: &ExecutionRequest) -> Vec<String> {
        let mut args = Vec::new();

        // Add prompt (Gemini attaches files via @path tokens)
        let prompt = append_prompt_attachments(&request.prompt, &request.context_files, "@");
        args.push("-p".to_string());
        args.push(prompt);

        // JSON output format
        args.push("--output-format".to_string());
        args.push("json".to_string());

        // Approval mode based on plan_mode
        args.push("--approval-mode".to_string());
        if request.plan_mode {
            args.push("plan".to_string());
        } else {
            args.push("yolo".to_string());
        }

        // Add model
        args.push("--model".to_string());
        args.push(request.model.clone());

        // Allow Gemini access to referenced attachment locations (max 5)
        // DRY:FN:gemini_working_dir — Pass working directory via --include-directories
        let mut dirs = context_file_parent_dirs(&request.context_files);

        // Add working directory if different from CWD
        let cwd = std::env::current_dir().unwrap_or_default();
        if request.working_directory != cwd {
            dirs.push(request.working_directory.clone());
        }

        if !dirs.is_empty() {
            let include = dirs
                .into_iter()
                .take(5)
                .map(|d| d.display().to_string())
                .collect::<Vec<_>>()
                .join(",");
            args.push(
                platform_specs::get_spec(Platform::Gemini)
                    .working_dir_flag
                    .unwrap_or("--include-directories")
                    .to_string(),
            );
            args.push(include);
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
    async fn test_gemini_runner_creation() {
        let runner = GeminiRunner::new();
        assert_eq!(runner.platform(), Platform::Gemini);
    }

    #[test]
    fn test_build_args() {
        let runner = GeminiRunner::new();
        let request = ExecutionRequest::new(
            Platform::Gemini,
            "gemini-2.0-flash-exp".to_string(),
            "Test prompt".to_string(),
            PathBuf::from("/tmp"),
        );

        let args = runner.build_args(&request);

        assert!(args.contains(&"-p".to_string()));
        assert!(args.contains(&"Test prompt".to_string()));
        assert!(args.contains(&"--output-format".to_string()));
        assert!(args.contains(&"json".to_string()));
        assert!(args.contains(&"--approval-mode".to_string()));
        assert!(args.contains(&"yolo".to_string()));
        assert!(args.contains(&"--model".to_string()));
        assert!(args.contains(&"gemini-2.0-flash-exp".to_string()));
    }

    #[test]
    fn test_build_args_plan_mode() {
        let runner = GeminiRunner::new();
        let request = ExecutionRequest::new(
            Platform::Gemini,
            "gemini-2.0-flash-exp".to_string(),
            "Test prompt".to_string(),
            PathBuf::from("/tmp"),
        )
        .with_plan_mode(true);

        let args = runner.build_args(&request);

        assert!(args.contains(&"--approval-mode".to_string()));
        assert!(args.contains(&"plan".to_string()));
    }

    #[test]
    fn test_build_args_with_context_files() {
        let runner = GeminiRunner::new();
        let request = ExecutionRequest::new(
            Platform::Gemini,
            "gemini-2.0-flash-exp".to_string(),
            "Test prompt".to_string(),
            PathBuf::from("/tmp"),
        )
        .with_context_files(vec![PathBuf::from("/tmp/ref.png")]);

        let args = runner.build_args(&request);

        assert!(args.iter().any(|a| a.contains("@/tmp/ref.png")));
        assert!(args.contains(&"--include-directories".to_string()));
    }

    #[tokio::test]
    async fn test_discover_models() {
        let runner = GeminiRunner::new();
        // Use timeout to prevent hanging if gemini CLI is not installed
        let result =
            tokio::time::timeout(std::time::Duration::from_secs(5), runner.discover_models()).await;

        match result {
            Ok(models) => {
                assert!(models.is_ok());
                let model_list = models.unwrap();
                assert!(!model_list.is_empty());
            }
            Err(_) => {} // Timeout is acceptable
        }
    }
}
