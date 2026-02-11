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

use crate::platforms::{BaseRunner, PlatformRunner};
use crate::types::{ExecutionRequest, ExecutionResult, Platform};
use anyhow::Result;
use async_trait::async_trait;
use log::warn;
use std::sync::Arc;

/// GitHub Copilot CLI runner
pub struct CopilotRunner {
    base: Arc<BaseRunner>,
}

impl CopilotRunner {
    /// Create a new Copilot runner
    pub fn new() -> Self {
        Self {
            base: Arc::new(BaseRunner::new("copilot".to_string())),
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
        let args = self.build_args(request);
        self.base.execute_command(request, args, None).await
    }

    async fn is_available(&self) -> bool {
        BaseRunner::is_command_available("copilot").await
    }

    async fn discover_models(&self) -> Result<Vec<String>> {
        // Copilot does not expose model selection in programmatic mode.
        // Default model is Claude Sonnet 4.5 (GitHub reserves right to change).
        // Model switching only available via /model slash command in interactive mode.
        warn!("GitHub Copilot does not support model discovery in programmatic mode");
        Ok(vec![
            "claude-sonnet-4-5".to_string(), // Default as of 2026
        ])
    }

    fn build_args(&self, request: &ExecutionRequest) -> Vec<String> {
        let mut args = Vec::new();

        // Add prompt
        args.push("-p".to_string());
        args.push(request.prompt.clone());

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

    #[tokio::test]
    async fn test_discover_models() {
        let runner = CopilotRunner::new();
        // Use timeout to prevent hanging if copilot CLI is not installed
        let result = tokio::time::timeout(
            std::time::Duration::from_secs(5),
            runner.discover_models(),
        ).await;
        
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
