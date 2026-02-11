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

use crate::platforms::{BaseRunner, PlatformRunner};
use crate::types::{ExecutionRequest, ExecutionResult, Platform};
use anyhow::{anyhow, Result};
use async_trait::async_trait;
use log::{debug, warn};
use std::sync::Arc;
use tokio::process::Command;

/// Gemini CLI runner
pub struct GeminiRunner {
    base: Arc<BaseRunner>,
}

impl GeminiRunner {
    /// Create a new Gemini runner
    pub fn new() -> Self {
        Self {
            base: Arc::new(BaseRunner::new("gemini".to_string())),
        }
    }

    /// Discover models via CLI
    async fn discover_models_from_cli(&self) -> Result<Vec<String>> {
        debug!("Discovering Gemini models via CLI");

        let output = Command::new("gemini")
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
        let args = self.build_args(request);
        self.base.execute_command(request, args, None).await
    }

    async fn is_available(&self) -> bool {
        BaseRunner::is_command_available("gemini").await
    }

    async fn discover_models(&self) -> Result<Vec<String>> {
        // Try CLI discovery first
        if let Ok(models) = self.discover_models_from_cli().await {
            if !models.is_empty() {
                return Ok(models);
            }
        }

        // Fallback to known Gemini models
        warn!("CLI model discovery failed, using known Gemini models");
        Ok(vec![
            "gemini-2.5-pro".to_string(),
            "gemini-2.5-flash".to_string(),
            "gemini-2.5-flash-lite".to_string(),
            "gemini-3-pro-preview".to_string(),
            "gemini-3-flash-preview".to_string(),
        ])
    }

    fn build_args(&self, request: &ExecutionRequest) -> Vec<String> {
        let mut args = Vec::new();

        // Add prompt
        args.push("-p".to_string());
        args.push(request.prompt.clone());

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

    #[tokio::test]
    async fn test_discover_models() {
        let runner = GeminiRunner::new();
        // Use timeout to prevent hanging if gemini CLI is not installed
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
            Err(_) => {} // Timeout is acceptable
        }
    }
}
