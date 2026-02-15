//! SDK bridge for programmatic model listing via Node.js SDKs.
//!
//! Bridges to Copilot SDK (@github/copilot-sdk) and Codex SDK (@openai/codex-sdk)
//! by spawning small inline Node.js scripts. Falls back gracefully when Node.js
//! or SDKs are unavailable.
//!
//! - DRY:DATA:SDK_BRIDGE — Node.js SDK bridge for Copilot/Codex model listing

use crate::platforms::platform_specs;
use crate::types::Platform;
use anyhow::{Context, Result};
use log::{debug, info, warn};
use serde::Deserialize;
use std::path::PathBuf;
use std::process::Stdio;
use which::which;
// DRY:DATA:SdkExecutionResult

/// Result from SDK-based execution
/// DRY:DATA:sdk_execution_result — Structured result from SDK task execution
#[derive(Debug, Clone, Deserialize)]
pub struct SdkExecutionResult {
    /// Whether execution succeeded
    pub success: bool,
    /// Output text from the SDK
    pub output: String,
    /// Exit code (0 = success)
    pub exit_code: i32,
}
// DRY:DATA:SdkBridge

/// DRY:FN:sdk_bridge — Bridge to Node.js SDKs for model listing and programmatic control
pub struct SdkBridge {
    node_path: PathBuf,
}

impl SdkBridge {
    // DRY:FN:new
    /// Creates a new SDK bridge, detecting Node.js automatically.
    pub fn new() -> Option<Self> {
        let node_path = which("node").ok()?;
        Some(Self { node_path })
    }
    // DRY:FN:with_node_path

    /// Creates a bridge with a specific Node.js path.
    pub fn with_node_path(node_path: PathBuf) -> Option<Self> {
        if node_path.exists() {
            Some(Self { node_path })
        } else {
            None
        }
    }
    // DRY:FN:is_available

    /// Whether the SDK bridge is available (Node.js found).
    /// DRY:FN:sdk_bridge_available — Check if Node.js is available for SDK calls
    pub fn is_available(&self) -> bool {
        self.node_path.exists()
    }

    /// Whether a specific platform SDK is installed.
    /// DRY:FN:sdk_installed — Check if a platform's npm SDK package is installed
    pub async fn is_sdk_installed(&self, platform: Platform) -> bool {
        let spec = platform_specs::get_spec(platform);
        let Some(sdk) = &spec.sdk else {
            return false;
        };

        // Try to require the package to see if it's installed
        let script = format!(
            "try {{ require.resolve('{}'); process.exit(0); }} catch {{ process.exit(1); }}",
            sdk.package_name
        );

        let output = tokio::process::Command::new(&self.node_path)
            .args(["-e", &script])
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .output()
            .await;

        matches!(output, Ok(o) if o.status.success())
    }

    /// List models from Copilot SDK.
    /// DRY:FN:list_models_copilot — Fetch available models via @github/copilot-sdk
    pub async fn list_models_copilot(&self) -> Result<Vec<String>> {
        if !platform_specs::has_sdk(Platform::Copilot) {
            anyhow::bail!("Copilot does not have SDK support in platform_specs");
        }

        // The Copilot SDK uses JSON-RPC to communicate with the CLI.
        // We try to list models via the SDK's model listing capability.
        let script = r#"
const sdk = require('@github/copilot-sdk');
async function main() {
    try {
        const client = new sdk.CopilotClient();
        const models = await client.listModels();
        const ids = models.map(m => m.id || m.name || m);
        console.log(JSON.stringify(ids));
    } catch (e) {
        // Fallback: try parsing copilot model list
        console.log(JSON.stringify([]));
    }
}
main();
"#;

        self.run_node_script(script, "Copilot SDK model listing")
            .await
    }

    /// List models from Codex SDK.
    /// DRY:FN:list_models_codex — Fetch available models via @openai/codex-sdk
    pub async fn list_models_codex(&self) -> Result<Vec<String>> {
        if !platform_specs::has_sdk(Platform::Codex) {
            anyhow::bail!("Codex does not have SDK support in platform_specs");
        }

        // The Codex SDK wraps the CLI binary and communicates via JSONL.
        // Model listing is done by querying available models.
        let script = r#"
const { Codex } = require('@openai/codex-sdk');
async function main() {
    try {
        const client = new Codex();
        const models = await client.listModels();
        const ids = models.map(m => m.id || m.name || m);
        console.log(JSON.stringify(ids));
    } catch (e) {
        // Fallback: empty list (will use platform_specs fallback)
        console.log(JSON.stringify([]));
    }
}
main();
"#;

        self.run_node_script(script, "Codex SDK model listing")
            .await
    }

    /// List models for any SDK-capable platform.
    /// DRY:FN:list_models_via_sdk — Dispatch model listing to the appropriate SDK
    pub async fn list_models(&self, platform: Platform) -> Result<Vec<String>> {
        match platform {
            Platform::Copilot => self.list_models_copilot().await,
            Platform::Codex => self.list_models_codex().await,
            _ => anyhow::bail!("{:?} does not have SDK support", platform),
        }
    }

    /// DRY:FN:sdk_execute_prompt — Execute a prompt via SDK for Copilot or Codex
    /// Returns the SDK output as a string. Falls back with error if SDK unavailable.
    pub async fn execute_prompt(
        &self,
        platform: Platform,
        prompt: &str,
        model: &str,
        working_dir: &std::path::Path,
        plan_mode: bool,
        reasoning_effort: Option<&str>,
    ) -> Result<SdkExecutionResult> {
        if !platform_specs::has_sdk(platform) {
            anyhow::bail!("{:?} does not have SDK support", platform);
        }

        match platform {
            Platform::Codex => {
                self.execute_codex(prompt, model, working_dir, plan_mode, reasoning_effort)
                    .await
            }
            Platform::Copilot => self.execute_copilot(prompt, model, working_dir).await,
            _ => anyhow::bail!("{:?} does not support SDK execution", platform),
        }
    }

    /// Execute prompt via Codex SDK (@openai/codex-sdk)
    async fn execute_codex(
        &self,
        prompt: &str,
        model: &str,
        working_dir: &std::path::Path,
        plan_mode: bool,
        reasoning_effort: Option<&str>,
    ) -> Result<SdkExecutionResult> {
        let escaped_prompt = prompt.replace('\\', "\\\\").replace('`', "\\`").replace('$', "\\$");
        let escaped_model = model.replace('\\', "\\\\").replace('"', "\\\"");
        let escaped_effort = reasoning_effort
            .map(|v| v.replace('\\', "\\\\").replace('"', "\\\""));
        let working_dir_str = working_dir.to_string_lossy();
        let approval_policy = if plan_mode { "on-request" } else { "on-request" };
        let sandbox_mode = if plan_mode {
            "read-only"
        } else {
            "workspace-write"
        };
        let effort_line = escaped_effort
            .as_deref()
            .map(|value| format!("modelReasoningEffort: \"{value}\","))
            .unwrap_or_default();

        let script = format!(r#"
const {{ Codex }} = require('@openai/codex-sdk');
async function main() {{
    const client = new Codex();
    const thread = await client.startThread({{
        model: "{escaped_model}",
        approvalPolicy: "{approval_policy}",
        sandboxMode: "{sandbox_mode}",
        workingDirectory: "{working_dir_str}",
        {effort_line}
    }});
    const result = await thread.run(`{escaped_prompt}`);
    const output = result.finalResponse || result.items?.map(i => i.text || '').join('\n') || '';
    console.log(JSON.stringify({{ success: true, output, exit_code: 0 }}));
}}
main().catch(e => {{
    console.log(JSON.stringify({{ success: false, output: e.message, exit_code: 1 }}));
}});
"#);

        self.run_node_script_raw(&script, "Codex SDK execution").await
    }

    /// Execute prompt via Copilot SDK (@github/copilot-sdk)
    async fn execute_copilot(
        &self,
        prompt: &str,
        model: &str,
        working_dir: &std::path::Path,
    ) -> Result<SdkExecutionResult> {
        let escaped_prompt = prompt.replace('\\', "\\\\").replace('`', "\\`").replace('$', "\\$");
        let escaped_model = model.replace('\\', "\\\\").replace('"', "\\\"");
        let working_dir_str = working_dir.to_string_lossy();

        let script = format!(r#"
const sdk = require('@github/copilot-sdk');
async function main() {{
    const client = new sdk.CopilotClient({{
        model: "{escaped_model}",
        workingDirectory: "{working_dir_str}",
    }});
    const result = await client.run(`{escaped_prompt}`);
    const output = typeof result === 'string' ? result : JSON.stringify(result);
    console.log(JSON.stringify({{ success: true, output, exit_code: 0 }}));
}}
main().catch(e => {{
    console.log(JSON.stringify({{ success: false, output: e.message, exit_code: 1 }}));
}});
"#);

        self.run_node_script_raw(&script, "Copilot SDK execution").await
    }

    /// Run a Node.js script and parse JSON execution result.
    async fn run_node_script_raw(&self, script: &str, context: &str) -> Result<SdkExecutionResult> {
        debug!("Running {}", context);

        let output = tokio::process::Command::new(&self.node_path)
            .args(["-e", script])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .await
            .context(format!("Failed to spawn Node.js for {}", context))?;

        let stdout = String::from_utf8_lossy(&output.stdout);
        let trimmed = stdout.trim();

        if trimmed.is_empty() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Ok(SdkExecutionResult {
                success: false,
                output: format!("{} produced no output. stderr: {}", context, stderr.trim()),
                exit_code: output.status.code().unwrap_or(1),
            });
        }

        // Try to parse as structured result
        if let Ok(result) = serde_json::from_str::<SdkExecutionResult>(trimmed) {
            return Ok(result);
        }

        // Fallback: treat raw output as success
        Ok(SdkExecutionResult {
            success: output.status.success(),
            output: trimmed.to_string(),
            exit_code: output.status.code().unwrap_or(if output.status.success() { 0 } else { 1 }),
        })
    }

    /// Run a Node.js script and parse JSON array output.
    async fn run_node_script(&self, script: &str, context: &str) -> Result<Vec<String>> {
        debug!("Running {}", context);

        let output = tokio::process::Command::new(&self.node_path)
            .args(["-e", script])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .await
            .context(format!("Failed to spawn Node.js for {}", context))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            warn!("{} failed: {}", context, stderr.trim());
            anyhow::bail!("{} failed: {}", context, stderr.trim());
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        let trimmed = stdout.trim();

        if trimmed.is_empty() {
            info!("{} returned empty output", context);
            return Ok(Vec::new());
        }

        let models: Vec<String> = serde_json::from_str(trimmed)
            .context(format!("{} returned invalid JSON: {}", context, trimmed))?;

        info!("{} found {} model(s)", context, models.len());
        Ok(models)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sdk_bridge_creation() {
        // SdkBridge::new() returns None if node isn't installed, Some if it is
        // Either way, this shouldn't panic
        let _bridge = SdkBridge::new();
    }

    #[test]
    fn test_sdk_bridge_with_invalid_path() {
        let bridge = SdkBridge::with_node_path(PathBuf::from("/nonexistent/node"));
        assert!(bridge.is_none());
    }

    #[test]
    fn test_has_sdk_platforms() {
        // Verify platform_specs alignment
        assert!(platform_specs::has_sdk(Platform::Copilot));
        assert!(platform_specs::has_sdk(Platform::Codex));
        assert!(!platform_specs::has_sdk(Platform::Claude));
        assert!(!platform_specs::has_sdk(Platform::Cursor));
        assert!(!platform_specs::has_sdk(Platform::Gemini));
    }

    #[tokio::test]
    async fn test_sdk_installed_check_no_sdk_platform() {
        // Claude doesn't have SDK, so is_sdk_installed should return false
        if let Some(bridge) = SdkBridge::new() {
            assert!(!bridge.is_sdk_installed(Platform::Claude).await);
        }
    }

    #[test]
    fn test_sdk_execution_result_deserialize() {
        let json = r#"{"success": true, "output": "hello world", "exit_code": 0}"#;
        let result: SdkExecutionResult = serde_json::from_str(json).unwrap();
        assert!(result.success);
        assert_eq!(result.output, "hello world");
        assert_eq!(result.exit_code, 0);
    }

    #[test]
    fn test_sdk_execution_result_failure() {
        let json = r#"{"success": false, "output": "error occurred", "exit_code": 1}"#;
        let result: SdkExecutionResult = serde_json::from_str(json).unwrap();
        assert!(!result.success);
        assert_eq!(result.exit_code, 1);
    }
}
