//! AI Verifier
//!
//! Uses AI platforms to perform semantic verification of criteria.
//! Asks AI to analyze context and determine if a criterion is met.

use crate::platforms::global_registry;
use crate::state::EvidenceStore;
use crate::types::{Criterion, Evidence, EvidenceType, Platform, Verifier, VerifierResult};
use anyhow::{Context, Result};
use async_trait::async_trait;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::str::FromStr;
use std::time::{Duration, Instant};
use tokio::process::Command;

/// AI-based verifier using platform CLI
pub struct AIVerifier {
    config: AIVerifierConfig,
}

/// Configuration for AI verifier
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIVerifierConfig {
    /// Platform to use (cursor, codex, claude, gemini, copilot)
    pub platform: String,
    /// Model to use (if applicable)
    pub model: Option<String>,
    /// Timeout in seconds
    pub timeout_seconds: u64,
    /// Working directory for context
    pub working_directory: Option<PathBuf>,
    /// Files to include as context
    pub context_files: Vec<PathBuf>,
}

impl Default for AIVerifierConfig {
    fn default() -> Self {
        Self {
            platform: "cursor".to_string(),
            model: None,
            timeout_seconds: 60,
            working_directory: None,
            context_files: Vec::new(),
        }
    }
}

impl AIVerifier {
    /// Create a new AI verifier with default configuration
    pub fn new() -> Self {
        Self {
            config: AIVerifierConfig::default(),
        }
    }

    /// Create a new AI verifier with custom configuration
    pub fn with_config(config: AIVerifierConfig) -> Self {
        Self { config }
    }

    /// Build verification prompt with context
    fn build_verification_prompt(&self, criterion: &Criterion) -> String {
        let mut prompt = String::new();

        prompt.push_str("You are a verification assistant. Your task is to determine if the following criterion has been met.\n\n");
        prompt.push_str("CRITERION:\n");
        prompt.push_str(&format!("ID: {}\n", criterion.id));
        prompt.push_str(&format!("Description: {}\n", criterion.description));

        if let Some(expected) = &criterion.expected {
            prompt.push_str(&format!("Expected: {}\n", expected));
        }

        if let Some(actual) = &criterion.actual {
            prompt.push_str(&format!("Actual: {}\n", actual));
        }

        prompt.push_str("\nCONTEXT:\n");
        prompt.push_str("Please analyze the current state of the project and determine if this criterion is met.\n\n");

        // Add context files if available
        if !self.config.context_files.is_empty() {
            prompt.push_str("Relevant files to check:\n");
            for file in &self.config.context_files {
                prompt.push_str(&format!("- {}\n", file.display()));
            }
            prompt.push('\n');
        }

        prompt.push_str("INSTRUCTIONS:\n");
        prompt.push_str("1. Analyze the criterion carefully\n");
        prompt.push_str("2. Check relevant files and code if applicable\n");
        prompt.push_str("3. Provide your assessment\n\n");
        prompt.push_str("Respond with EXACTLY ONE of these formats:\n");
        prompt.push_str("PASS: <brief reason why criterion is met>\n");
        prompt.push_str("FAIL: <brief reason why criterion is not met>\n\n");
        prompt.push_str("Your response:");

        prompt
    }

    /// Parse AI response for pass/fail determination
    fn parse_ai_response(&self, response: &str) -> Result<(bool, String)> {
        let response = response.trim();

        // Look for PASS: or FAIL: prefix
        if let Some(pass_index) = response.find("PASS:") {
            let reason = response[pass_index + 5..].trim();
            return Ok((true, reason.to_string()));
        }

        if let Some(fail_index) = response.find("FAIL:") {
            let reason = response[fail_index + 5..].trim();
            return Ok((false, reason.to_string()));
        }

        // If no clear prefix, try to infer from keywords
        let lower_response = response.to_lowercase();
        if lower_response.contains("criterion is met")
            || lower_response.contains("requirement is satisfied")
            || lower_response.contains("passes")
        {
            return Ok((true, response.to_string()));
        }

        if lower_response.contains("criterion is not met")
            || lower_response.contains("requirement is not satisfied")
            || lower_response.contains("fails")
        {
            return Ok((false, response.to_string()));
        }

        // Default to failure if unclear
        Ok((false, format!("AI response unclear: {}", response)))
    }

    /// Execute platform CLI to get AI assessment (async, non-blocking)
    async fn execute_platform_cli(&self, prompt: &str) -> Result<PlatformCliExecution> {
        let platform = Platform::from_str(&self.config.platform)
            .with_context(|| format!("Unknown platform: {}", self.config.platform))?;

        let working_dir =
            self.config.working_directory.clone().unwrap_or(
                std::env::current_dir().context("Failed to determine current directory")?,
            );

        // Verify platform is available before spawning.
        let registry = global_registry().await?;
        if !registry.is_available(platform).await {
            anyhow::bail!("Platform '{}' is not available", platform);
        }

        let (command, args) = self.build_platform_command(platform, prompt, &working_dir);

        let mut cmd = Command::new(&command);
        cmd.args(&args)
            .current_dir(&working_dir)
            .stdin(Stdio::null())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .kill_on_drop(true);

        let child = cmd
            .spawn()
            .with_context(|| format!("Failed to spawn {} CLI ({})", platform, command))?;

        let timeout_duration = Duration::from_secs(self.config.timeout_seconds);
        let mut child_opt = Some(child);

        let output = tokio::select! {
            result = async {
                let child = child_opt.take().expect("child");
                child.wait_with_output().await
            } => result.with_context(|| format!("{} CLI execution failed", platform))?,
            _ = tokio::time::sleep(timeout_duration) => {
                if let Some(mut child) = child_opt.take() {
                    let _ = child.kill().await;
                }
                anyhow::bail!("{} CLI execution timed out after {}s", platform, self.config.timeout_seconds);
            }
        };

        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();

        if !output.status.success() {
            anyhow::bail!(
                "{} CLI command failed: {} (stderr: {})",
                platform,
                output.status,
                stderr.trim()
            );
        }

        let parsed = parse_platform_output(platform, &stdout);

        Ok(PlatformCliExecution {
            platform,
            command,
            args,
            stdout,
            stderr,
            json: parsed.json,
            response_text: parsed.response_text,
            session_id: parsed.session_id,
        })
    }

    fn build_platform_command(
        &self,
        platform: Platform,
        prompt: &str,
        working_dir: &Path,
    ) -> (String, Vec<String>) {
        let mut args: Vec<String> = Vec::new();

        let command = match platform {
            Platform::Cursor => {
                if which::which("agent").is_ok() {
                    "agent".to_string()
                } else {
                    "cursor-agent".to_string()
                }
            }
            Platform::Codex => "codex".to_string(),
            Platform::Claude => "claude".to_string(),
            Platform::Gemini => "gemini".to_string(),
            Platform::Copilot => "copilot".to_string(),
        };

        match platform {
            Platform::Cursor => {
                args.push("-p".to_string());
                args.push(prompt.to_string());
                if let Some(model) = &self.config.model {
                    args.push("--model".to_string());
                    args.push(model.clone());
                }
                args.push("--output-format".to_string());
                args.push("json".to_string());
            }
            Platform::Codex => {
                args.push("exec".to_string());
                args.push(prompt.to_string());
                args.push("--full-auto".to_string());
                args.push("--json".to_string());
                if let Some(model) = &self.config.model {
                    args.push("--model".to_string());
                    args.push(model.clone());
                }
                args.push("--color".to_string());
                args.push("never".to_string());
                args.push("--cd".to_string());
                args.push(working_dir.display().to_string());
            }
            Platform::Claude => {
                args.push("-p".to_string());
                args.push(prompt.to_string());
                if let Some(model) = &self.config.model {
                    args.push("--model".to_string());
                    args.push(model.clone());
                }
                args.push("--output-format".to_string());
                args.push("json".to_string());
                args.push("--no-session-persistence".to_string());
                args.push("--permission-mode".to_string());
                args.push("bypassPermissions".to_string());
            }
            Platform::Gemini => {
                args.push("-p".to_string());
                args.push(prompt.to_string());
                args.push("--output-format".to_string());
                args.push("json".to_string());
                args.push("--approval-mode".to_string());
                args.push("yolo".to_string());
                if let Some(model) = &self.config.model {
                    args.push("--model".to_string());
                    args.push(model.clone());
                }
            }
            Platform::Copilot => {
                args.push("-p".to_string());
                args.push(prompt.to_string());
                args.push("--allow-all-tools".to_string());
                args.push("--stream".to_string());
                args.push("off".to_string());
                args.push("--allow-all-paths".to_string());
                args.push("--allow-all-urls".to_string());
            }
        }

        (command, args)
    }

    async fn store_verification_evidence(
        &self,
        criterion_id: &str,
        exec: &PlatformCliExecution,
        prompt: &str,
        passed: bool,
        reasoning: &str,
    ) -> Result<Evidence> {
        let now = Utc::now();
        let tier_id = criterion_id.to_string();
        let session_id = exec
            .session_id
            .clone()
            .unwrap_or_else(|| generate_session_id(now));

        let evidence_root = self
            .config
            .working_directory
            .clone()
            .unwrap_or(std::env::current_dir().context("Failed to determine current directory")?)
            .join(".puppet-master")
            .join("evidence");

        let store = tokio::task::spawn_blocking(move || EvidenceStore::new(&evidence_root))
            .await
            .context("EvidenceStore init join error")??;

        let mut metadata = HashMap::new();
        metadata.insert("platform".to_string(), exec.platform.to_string());
        metadata.insert("passed".to_string(), passed.to_string());
        if let Some(model) = &self.config.model {
            metadata.insert("model".to_string(), model.clone());
        }

        let command = exec.command.clone();
        let args = exec.args.clone();
        let response_text = exec.response_text.clone();
        let stdout = exec.stdout.clone();
        let stderr = exec.stderr.clone();
        let json = exec.json.clone();

        let evidence_blob = serde_json::to_vec(&serde_json::json!({
            "platform": exec.platform.to_string(),
            "command": command,
            "args": args,
            "model": self.config.model.clone(),
            "passed": passed,
            "reasoning": reasoning,
            "prompt": prompt,
            "response_text": response_text,
            "stdout": stdout,
            "stderr": stderr,
            "json": json,
        }))
        .context("Failed to serialize AI verification evidence")?;

        tokio::task::spawn_blocking(move || {
            store.store_evidence(
                &tier_id,
                &session_id,
                EvidenceType::TestResult,
                &evidence_blob,
                metadata,
            )
        })
        .await
        .context("EvidenceStore write join error")?
    }
}

#[derive(Debug, Clone)]
struct PlatformCliExecution {
    platform: Platform,
    command: String,
    args: Vec<String>,
    stdout: String,
    stderr: String,
    json: Option<Value>,
    response_text: String,
    session_id: Option<String>,
}

#[derive(Debug, Clone)]
struct ParsedPlatformOutput {
    json: Option<Value>,
    response_text: String,
    session_id: Option<String>,
}

fn parse_platform_output(platform: Platform, stdout: &str) -> ParsedPlatformOutput {
    match platform {
        Platform::Cursor => {
            let json_parse = serde_json::from_str::<Value>(stdout)
                .or_else(|_| serde_json::from_str::<Value>(&stdout.replace("\\\"", "\"")));
            if let Ok(json) = json_parse {
                let response_text = json
                    .get("response")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();
                let session_id = json
                    .get("stats")
                    .and_then(|v| v.get("session_id"))
                    .and_then(|v| v.as_str())
                    .map(str::to_string);
                return ParsedPlatformOutput {
                    json: Some(json),
                    response_text: if response_text.is_empty() {
                        stdout.to_string()
                    } else {
                        response_text
                    },
                    session_id,
                };
            }
            ParsedPlatformOutput {
                json: None,
                response_text: stdout.to_string(),
                session_id: None,
            }
        }
        Platform::Claude => {
            if let Ok(json) = serde_json::from_str::<Value>(stdout) {
                let response_text = json
                    .get("result")
                    .and_then(|v| v.as_str())
                    .or_else(|| json.get("response").and_then(|v| v.as_str()))
                    .or_else(|| json.get("content").and_then(|v| v.as_str()))
                    .or_else(|| json.get("text").and_then(|v| v.as_str()))
                    .unwrap_or("")
                    .to_string();
                let session_id = json
                    .get("session_id")
                    .and_then(|v| v.as_str())
                    .map(str::to_string);
                return ParsedPlatformOutput {
                    json: Some(json),
                    response_text: if response_text.is_empty() {
                        stdout.to_string()
                    } else {
                        response_text
                    },
                    session_id,
                };
            }
            ParsedPlatformOutput {
                json: None,
                response_text: stdout.to_string(),
                session_id: None,
            }
        }
        Platform::Gemini => {
            if let Ok(json) = serde_json::from_str::<Value>(stdout) {
                let response_text = json
                    .get("response")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();
                let session_id = json
                    .get("session_id")
                    .and_then(|v| v.as_str())
                    .map(str::to_string);
                return ParsedPlatformOutput {
                    json: Some(json),
                    response_text: if response_text.is_empty() {
                        stdout.to_string()
                    } else {
                        response_text
                    },
                    session_id,
                };
            }
            ParsedPlatformOutput {
                json: None,
                response_text: stdout.to_string(),
                session_id: None,
            }
        }
        Platform::Codex => {
            let mut last_json: Option<Value> = None;
            let mut session_id: Option<String> = None;
            let mut combined = String::new();

            for line in stdout.lines().map(str::trim).filter(|l| !l.is_empty()) {
                if let Ok(json) = serde_json::from_str::<Value>(line) {
                    if session_id.is_none() {
                        session_id = json
                            .get("session_id")
                            .and_then(|v| v.as_str())
                            .map(str::to_string);
                    }

                    if let Some(text) = json
                        .get("finalResponse")
                        .and_then(|v| v.as_str())
                        .or_else(|| json.get("final_response").and_then(|v| v.as_str()))
                        .or_else(|| json.get("content").and_then(|v| v.as_str()))
                        .or_else(|| json.get("message").and_then(|v| v.as_str()))
                        .or_else(|| json.get("data").and_then(|v| v.as_str()))
                    {
                        combined.push_str(text);
                        combined.push('\n');
                    }

                    last_json = Some(json);
                }
            }

            ParsedPlatformOutput {
                json: last_json,
                response_text: if combined.trim().is_empty() {
                    stdout.to_string()
                } else {
                    combined.trim().to_string()
                },
                session_id,
            }
        }
        Platform::Copilot => ParsedPlatformOutput {
            json: None,
            response_text: stdout.to_string(),
            session_id: None,
        },
    }
}

fn generate_session_id(now: chrono::DateTime<Utc>) -> String {
    format!(
        "PM-{}-{:03}",
        now.format("%Y-%m-%d-%H-%M-%S"),
        now.timestamp_subsec_millis()
    )
}

impl Default for AIVerifier {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl Verifier for AIVerifier {
    fn verifier_type(&self) -> &str {
        "ai"
    }

    async fn verify(&self, criterion: &Criterion) -> VerifierResult {
        let started = Instant::now();
        let prompt = self.build_verification_prompt(criterion);

        let exec = match self.execute_platform_cli(&prompt).await {
            Ok(v) => v,
            Err(e) => {
                return VerifierResult::failure(format!(
                    "AI verification failed after {:.2}s: {}",
                    started.elapsed().as_secs_f64(),
                    e
                ));
            }
        };

        let (passed, reasoning) = match self.parse_ai_response(&exec.response_text) {
            Ok(v) => v,
            Err(e) => {
                return VerifierResult::failure(format!(
                    "AI verification parse failed after {:.2}s: {}",
                    started.elapsed().as_secs_f64(),
                    e
                ));
            }
        };

        let message = format!(
            "AI verification ({}): {}",
            if passed { "PASSED" } else { "FAILED" },
            reasoning
        );

        let evidence = match self
            .store_verification_evidence(&criterion.id, &exec, &prompt, passed, &reasoning)
            .await
        {
            Ok(ev) => Some(ev),
            Err(e) => {
                log::warn!("Failed to store AI verification evidence: {}", e);
                None
            }
        };

        VerifierResult {
            passed,
            message,
            evidence,
            timestamp: Utc::now(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ai_verifier_creation() {
        let verifier = AIVerifier::new();
        assert_eq!(verifier.verifier_type(), "ai");
        assert_eq!(verifier.config.platform, "cursor");
    }

    #[test]
    fn test_ai_verifier_with_config() {
        let config = AIVerifierConfig {
            platform: "claude".to_string(),
            model: Some("claude-3-opus".to_string()),
            timeout_seconds: 120,
            working_directory: Some(PathBuf::from("/tmp")),
            context_files: vec![PathBuf::from("test.rs")],
        };

        let verifier = AIVerifier::with_config(config);
        assert_eq!(verifier.config.platform, "claude");
        assert_eq!(verifier.config.model, Some("claude-3-opus".to_string()));
        assert_eq!(verifier.config.timeout_seconds, 120);
    }

    #[test]
    fn test_build_verification_prompt() {
        let verifier = AIVerifier::new();
        let criterion = Criterion {
            id: "test-1".to_string(),
            description: "System should handle errors gracefully".to_string(),
            met: false,
            verification_method: Some("ai".to_string()),
            expected: Some("Error handling implemented".to_string()),
            actual: None,
        };

        let prompt = verifier.build_verification_prompt(&criterion);

        assert!(prompt.contains("test-1"));
        assert!(prompt.contains("System should handle errors gracefully"));
        assert!(prompt.contains("Error handling implemented"));
        assert!(prompt.contains("PASS:"));
        assert!(prompt.contains("FAIL:"));
    }

    #[test]
    fn test_parse_ai_response_pass() {
        let verifier = AIVerifier::new();

        let response = "PASS: Error handling is properly implemented with try-catch blocks";
        let (passed, reason) = verifier.parse_ai_response(response).unwrap();

        assert!(passed);
        assert!(reason.contains("Error handling is properly implemented"));
    }

    #[test]
    fn test_parse_ai_response_fail() {
        let verifier = AIVerifier::new();

        let response = "FAIL: No error handling found in the code";
        let (passed, reason) = verifier.parse_ai_response(response).unwrap();

        assert!(!passed);
        assert!(reason.contains("No error handling found"));
    }

    #[test]
    fn test_parse_ai_response_inference() {
        let verifier = AIVerifier::new();

        // Test inference from keywords
        let response1 = "The criterion is met based on the implementation";
        let (passed1, _) = verifier.parse_ai_response(response1).unwrap();
        assert!(passed1);

        let response2 = "The requirement is not satisfied due to missing tests";
        let (passed2, _) = verifier.parse_ai_response(response2).unwrap();
        assert!(!passed2);
    }

    #[test]
    fn test_parse_ai_response_unclear() {
        let verifier = AIVerifier::new();

        let response = "This is an unclear response";
        let (passed, reason) = verifier.parse_ai_response(response).unwrap();

        // Should default to fail for unclear responses
        assert!(!passed);
        assert!(reason.contains("unclear"));
    }

    #[test]
    fn test_default_config() {
        let config = AIVerifierConfig::default();
        assert_eq!(config.platform, "cursor");
        assert_eq!(config.timeout_seconds, 60);
        assert!(config.model.is_none());
        assert!(config.context_files.is_empty());
    }

    #[tokio::test]
    async fn test_verify_with_invalid_platform_fails_fast() {
        let config = AIVerifierConfig {
            platform: "not-a-platform".to_string(),
            model: None,
            timeout_seconds: 1,
            working_directory: None,
            context_files: vec![],
        };
        let verifier = AIVerifier::with_config(config);
        let criterion = Criterion {
            id: "mock-1".to_string(),
            description: "Mock criterion for testing".to_string(),
            met: false,
            verification_method: Some("ai".to_string()),
            expected: Some("Should pass".to_string()),
            actual: None,
        };

        let result = verifier.verify(&criterion).await;
        assert!(!result.passed);
        assert!(result.message.contains("Unknown platform"));
    }

    #[test]
    fn test_build_platform_command_args() {
        let config = AIVerifierConfig {
            platform: "claude".to_string(),
            model: Some("claude-sonnet-4-5".to_string()),
            timeout_seconds: 60,
            working_directory: Some(PathBuf::from("/tmp")),
            context_files: vec![],
        };
        let verifier = AIVerifier::with_config(config);

        let (cmd, args) =
            verifier.build_platform_command(Platform::Claude, "hello", Path::new("/tmp"));

        assert_eq!(cmd, "claude");
        assert!(args.contains(&"-p".to_string()));
        assert!(args.contains(&"hello".to_string()));
        assert!(args.contains(&"--model".to_string()));
        assert!(args.contains(&"claude-sonnet-4-5".to_string()));
        assert!(args.contains(&"--output-format".to_string()));
        assert!(args.contains(&"json".to_string()));
        assert!(args.contains(&"--no-session-persistence".to_string()));
        assert!(args.contains(&"--permission-mode".to_string()));
        assert!(args.contains(&"bypassPermissions".to_string()));
    }

    #[test]
    fn test_parse_platform_output_cursor_json() {
        let stdout = r#"{\"response\":\"PASS: ok\",\"stats\":{\"session_id\":\"PM-2026-02-11-12-00-00-123\"}}"#;
        let parsed = parse_platform_output(Platform::Cursor, stdout);
        assert_eq!(parsed.response_text, "PASS: ok");
        assert_eq!(
            parsed.session_id,
            Some("PM-2026-02-11-12-00-00-123".to_string())
        );
        assert!(parsed.json.is_some());
    }

    #[test]
    fn test_parse_platform_output_codex_jsonl_combines_content() {
        let stdout =
            "{\"session_id\":\"S1\",\"content\":\"PASS: first\"}\n{\"content\":\"\nmore\"}\n";
        let parsed = parse_platform_output(Platform::Codex, stdout);
        assert!(parsed.response_text.contains("PASS: first"));
        assert_eq!(parsed.session_id, Some("S1".to_string()));
        assert!(parsed.json.is_some());
    }
}
