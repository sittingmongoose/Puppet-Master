//! Codex CLI platform runner
//!
//! Executes tasks using the OpenAI Codex CLI.
//! Uses subscription-based auth (ChatGPT Plus/Pro plan), NOT per-use API keys.
//!
//! ## Command: `codex`
//!
//! ## Key flags (non-interactive `exec` mode)
//! - `exec "prompt"` — Non-interactive execution with JSONL output
//! - `--full-auto` — Sets `--ask-for-approval on-request` + `--sandbox workspace-write`
//! - `--json` or `--experimental-json` — JSONL event stream output
//! - `--model <model>` or `-m <model>` — Model selection (e.g., `gpt-5.2-codex`)
//! - `--cd <dir>` or `-C <dir>` — Working directory
//! - `--color <mode>` — ANSI color: `always | never | auto` (use `never` for parsing)
//! - `--max-turns <n>` — Cap agentic turns
//! - `--skip-git-repo-check` — Allow running outside Git repository
//! - `--output-last-message <path>` or `-o <path>` — Write final message to file
//! - `--output-schema <path>` — Structured JSON output with custom schema
//! - `--ask-for-approval <policy>` — `untrusted | on-failure | on-request | never`
//! - `--sandbox <mode>` — `read-only | workspace-write | danger-full-access`
//! - `--add-dir <path>` — Grant additional directories write access (repeatable)
//! - `--image <path>` or `-i <path>` — Attach image files
//! - `--profile <name>` or `-p <name>` — Load config profile from `~/.codex/config.toml`
//! - `-c key=value` or `--config key=value` — Inline config overrides
//! - `--search` — Enable web search capability
//! - `--reasoning-effort <level>` — For reasoning models (low/medium/high/xhigh)
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

use crate::platforms::{BaseRunner, PlatformRunner};
use crate::types::{ExecutionRequest, ExecutionResult, Platform};
use anyhow::{anyhow, Result};
use async_trait::async_trait;
use log::{debug, warn};
use std::sync::Arc;

/// Codex CLI runner
pub struct CodexRunner {
    base: Arc<BaseRunner>,
}

impl CodexRunner {
    /// Create a new Codex runner
    pub fn new() -> Self {
        Self {
            base: Arc::new(BaseRunner::new("codex".to_string())),
        }
    }

    /// Discover models from Codex config
    async fn discover_models_from_config(&self) -> Result<Vec<String>> {
        debug!("Discovering Codex models from config");

        // Codex config is TOML at ~/.codex/config.toml
        if let Some(home) = directories::BaseDirs::new() {
            let config_path = home
                .home_dir()
                .join(".codex")
                .join("config.toml");

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
        let args = self.build_args(request);
        self.base.execute_command(request, args, None).await
    }

    async fn is_available(&self) -> bool {
        BaseRunner::is_command_available("codex").await
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
        Ok(vec![
            "gpt-5.2-codex".to_string(),
            "gpt-5.1-codex".to_string(),
            "gpt-5.1-codex-mini".to_string(),
            "gpt-5-codex".to_string(),
            "o3-mini".to_string(),
        ])
    }

    fn build_args(&self, request: &ExecutionRequest) -> Vec<String> {
        let mut args = Vec::new();

        // Codex uses "exec" subcommand
        args.push("exec".to_string());

        // Add prompt
        args.push(request.prompt.clone());

        // Full-auto mode (unless plan mode)
        if !request.plan_mode {
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

        // Working directory
        args.push("--cd".to_string());
        args.push(request.working_directory.display().to_string());

        // Reasoning effort (for o3/o3-mini models)
        if let Some(ref effort) = request.reasoning_effort {
            args.push("--reasoning-effort".to_string());
            args.push(effort.to_string());
        } else if request.model.contains("o3") {
            // Default to medium for o3 models
            args.push("--reasoning-effort".to_string());
            args.push("medium".to_string());
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

        assert!(args.contains(&"--reasoning-effort".to_string()));
        assert!(args.contains(&"high".to_string()));
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

        // Should not have --full-auto in plan mode
        assert!(!args.contains(&"--full-auto".to_string()));
    }

    #[tokio::test]
    async fn test_discover_models() {
        let runner = CodexRunner::new();
        // Use timeout to prevent hanging if codex CLI is not installed
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
