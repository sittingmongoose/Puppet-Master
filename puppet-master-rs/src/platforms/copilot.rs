//! GitHub Copilot CLI platform runner
//!
//! Executes tasks using the GitHub Copilot CLI.
//! Uses subscription-based auth (Copilot Pro/Pro+/Business/Enterprise), NOT per-use API keys.
//!
//! ## Command: `copilot`
//!
//! ## Key flags (programmatic `-p` mode)
//! - `-p "prompt"` or `--prompt "prompt"` — Programmatic mode (single prompt, output, exit)
//! - `--allow-all-tools` — Auto-approve all tools (required for autonomous operation)
//! - `--allow-tool <spec>` — Allow specific tool (e.g., `'shell(git)'`, `'write'`, `'MCP_SERVER'`)
//! - `--deny-tool <spec>` — Prevent specific tool (takes precedence over allow)
//! - `--allow-all-paths` — Disable path verification (auto-approve file access)
//! - `--allow-all-urls` — Disable URL verification
//! - `--allow-url <domain>` — Pre-approve specific domain
//! - `--stream on|off` — Enable/disable streaming output
//! - `-s` — Streamlined output (answer only, for parsing/scripting)
//! - `--resume [ID]` — Resume session (NOT used by Puppet Master)
//! - `--continue` — Resume most recent session (NOT used by Puppet Master)
//! - `--agent=<name>` — Specify custom agent
//! - `--disable-parallel-tools-execution` — Run tools sequentially
//!
//! ## Model selection
//! - `/model` command (interactive mode only, not available in `-p` mode)
//! - Default model: Claude Sonnet 4.5 (GitHub reserves right to change)
//! - Model availability depends on subscription tier
//!
//! ## Authentication
//! - `/login` command (interactive)
//! - `GH_TOKEN` or `GITHUB_TOKEN` env var with "Copilot Requests" permission
//! - Requires GitHub Copilot Pro, Pro+, Business, or Enterprise plan
//!
//! ## Context files (custom instructions)
//! - `CLAUDE.md`, `GEMINI.md`, `AGENTS.md` (in git root & cwd)
//! - `.github/instructions/**/*.instructions.md`
//! - `.github/copilot-instructions.md` (repository-wide)
//! - `$HOME/.copilot/copilot-instructions.md` (user-level)
//!
//! ## Notes
//! - Copilot does NOT support JSON output format — text output is parsed manually
//! - Copilot does NOT expose model selection in programmatic mode
//! - `--stream off` and `--silent` may be undocumented features
//!
//! ## Puppet Master policy
//! - Fresh process per iteration (no `--resume`, no `--continue`)
//! - Uses `-p` mode with `--allow-all-tools` and `--allow-all-paths`
//! - Disables streaming for easier output parsing

use crate::platforms::context_files::append_prompt_attachments;
use crate::platforms::{BaseRunner, PlatformRunner, platform_specs};
use crate::types::{ExecutionRequest, ExecutionResult, Platform};
use anyhow::Result;
use async_trait::async_trait;
use log::warn;
use std::sync::Arc;

// DRY:DATA:CopilotRunner — GitHub Copilot CLI runner
/// GitHub Copilot CLI runner
pub struct CopilotRunner {
    base: Arc<BaseRunner>,
}

impl CopilotRunner {
    // DRY:FN:new — Create a new Copilot runner
    /// Create a new Copilot runner
    pub fn new() -> Self {
        let command = Platform::Copilot.resolve_cli_command();
        Self {
            base: Arc::new(BaseRunner::new(command, Platform::Copilot)),
        }
    }
}

impl Default for CopilotRunner {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl PlatformRunner for CopilotRunner {
    fn platform(&self) -> Platform {
        Platform::Copilot
    }

    async fn execute(&self, request: &ExecutionRequest) -> Result<ExecutionResult> {
        use crate::platforms::CompletionSignal as ParserCompletionSignal;
        use crate::platforms::create_parser;
        use crate::types::CompletionSignal as TypesCompletionSignal;

        let args = self.build_args(request);
        let mut result = self.base.execute_command(request, args, None).await?;

        // Parse output using platform-specific parser
        if let Some(output) = &result.output {
            let parser = create_parser(Platform::Copilot);
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
        for cmd in platform_specs::cli_binary_names(Platform::Copilot) {
            if BaseRunner::is_command_available(cmd).await {
                return true;
            }
        }
        false
    }

    async fn discover_models(&self) -> Result<Vec<String>> {
        // Copilot does not expose model selection in programmatic mode.
        // Default model is Claude Sonnet 4.5 (GitHub reserves right to change).
        // Model switching only available via /model slash command in interactive mode.
        warn!("GitHub Copilot does not support model discovery in programmatic mode");
        Ok(platform_specs::fallback_model_ids(Platform::Copilot)
            .into_iter()
            .map(str::to_string)
            .collect())
    }

    fn build_args(&self, request: &ExecutionRequest) -> Vec<String> {
        let mut args = Vec::new();

        // Add prompt (Copilot attaches files via @path tokens)
        let prompt = append_prompt_attachments(&request.prompt, &request.context_files, "@");
        args.push("-p".to_string());
        args.push(prompt);

        // Silent mode for headless (response only, easier to parse)
        args.push("-s".to_string());

        // Allow all tools (required for autonomous operation)
        args.push("--allow-all-tools".to_string());

        // Disable streaming for easier parsing
        args.push("--stream".to_string());
        args.push("off".to_string());

        // Allow all paths and URLs if not in plan mode
        if !request.plan_mode {
            args.push("--allow-all-paths".to_string());
            args.push("--allow-all-urls".to_string());
        }

        // DRY:FN:copilot_working_dir — Pass working directory via --add-dir
        let cwd = std::env::current_dir().unwrap_or_default();
        if request.working_directory != cwd {
            if let Some(flag) = platform_specs::get_spec(Platform::Copilot).working_dir_flag {
                args.push(flag.to_string());
                args.push(request.working_directory.display().to_string());
            }
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
    async fn test_copilot_runner_creation() {
        let runner = CopilotRunner::new();
        assert_eq!(runner.platform(), Platform::Copilot);
    }

    #[test]
    fn test_build_args() {
        let runner = CopilotRunner::new();
        let request = ExecutionRequest::new(
            Platform::Copilot,
            "github-copilot".to_string(),
            "Test prompt".to_string(),
            PathBuf::from("/tmp"),
        );

        let args = runner.build_args(&request);

        assert!(args.contains(&"-p".to_string()));
        assert!(args.contains(&"Test prompt".to_string()));
        assert!(args.contains(&"-s".to_string())); // Silent mode for headless
        assert!(args.contains(&"--allow-all-tools".to_string()));
        assert!(args.contains(&"--stream".to_string()));
        assert!(args.contains(&"off".to_string()));
        // Default (not plan mode) should include --allow-all-paths and --allow-all-urls
        assert!(args.contains(&"--allow-all-paths".to_string()));
        assert!(args.contains(&"--allow-all-urls".to_string()));
    }

    #[test]
    fn test_build_args_plan_mode() {
        let runner = CopilotRunner::new();
        let request = ExecutionRequest::new(
            Platform::Copilot,
            "github-copilot".to_string(),
            "Test prompt".to_string(),
            PathBuf::from("/tmp"),
        )
        .with_plan_mode(true);

        let args = runner.build_args(&request);

        // Plan mode should NOT include --allow-all-paths
        assert!(!args.contains(&"--allow-all-paths".to_string()));
    }

    #[test]
    fn test_build_args_with_context_files() {
        let runner = CopilotRunner::new();
        let request = ExecutionRequest::new(
            Platform::Copilot,
            "github-copilot".to_string(),
            "Test prompt".to_string(),
            PathBuf::from("/tmp"),
        )
        .with_context_files(vec![PathBuf::from("/tmp/ref.png")]);

        let args = runner.build_args(&request);

        assert!(args.iter().any(|a| a.contains("@/tmp/ref.png")));
    }

    #[tokio::test]
    async fn test_discover_models() {
        let runner = CopilotRunner::new();
        // Use timeout to prevent hanging if copilot CLI is not installed
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
