//! Command verifier - runs shell commands and validates exit codes/output.

use crate::types::{Criterion, Evidence, Verifier, VerifierResult};
use async_trait::async_trait;
use chrono::Utc;
use log::debug;
use regex::Regex;
use serde::Deserialize;
use std::collections::HashMap;
use std::path::PathBuf;
use std::process::Stdio;
use std::time::Duration;
use tokio::process::Command;

// DRY:DATA:CommandVerifier
/// Verifier that executes shell commands.
pub struct CommandVerifier;

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CommandSpec {
    command: String,
    #[serde(default)]
    cwd: Option<PathBuf>,
    #[serde(default)]
    env: HashMap<String, String>,
    #[serde(default)]
    timeout_ms: Option<u64>,
    #[serde(default)]
    expected_exit_code: Option<i32>,
    #[serde(default)]
    stdout_regex: Option<String>,
    #[serde(default)]
    stderr_regex: Option<String>,
    #[serde(default)]
    output_regex: Option<String>,
}

impl CommandVerifier {
    // DRY:FN:new
    pub fn new() -> Self {
        Self
    }

    fn parse_spec(expected: Option<&str>) -> CommandSpec {
        let raw = expected.unwrap_or("true").trim();
        if raw.starts_with('{') {
            if let Ok(spec) = serde_json::from_str::<CommandSpec>(raw) {
                return spec;
            }
        }

        CommandSpec {
            command: raw.to_string(),
            cwd: None,
            env: HashMap::new(),
            timeout_ms: None,
            expected_exit_code: None,
            stdout_regex: None,
            stderr_regex: None,
            output_regex: None,
        }
    }

    async fn execute(spec: &CommandSpec) -> Result<std::process::Output, String> {
        // DRY:PLATFORM:shell_command - Use cmd /c on Windows, sh -c on Unix
        let mut cmd = if cfg!(target_os = "windows") {
            let mut c = Command::new("cmd");
            c.args(["/C", &spec.command]);
            c
        } else {
            let mut c = Command::new("sh");
            c.args(["-c", &spec.command]);
            c
        };
        
        cmd.stdin(Stdio::null())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .kill_on_drop(true);

        if let Some(cwd) = &spec.cwd {
            cmd.current_dir(cwd);
        }

        for (k, v) in &spec.env {
            cmd.env(k, v);
        }

        let child = cmd
            .spawn()
            .map_err(|e| format!("Failed to spawn shell: {e}"))?;

        if let Some(timeout_ms) = spec.timeout_ms {
            let timeout = Duration::from_millis(timeout_ms);
            let mut child_opt = Some(child);
            let output = tokio::select! {
                result = async {
                    let child = child_opt.take().expect("child");
                    child.wait_with_output().await
                } => result.map_err(|e| format!("Command execution failed: {e}"))?,
                _ = tokio::time::sleep(timeout) => {
                    if let Some(mut child) = child_opt.take() {
                        let _ = child.kill().await;
                    }
                    return Err(format!("Command timed out after {timeout_ms}ms"));
                }
            };
            Ok(output)
        } else {
            child
                .wait_with_output()
                .await
                .map_err(|e| format!("Command execution failed: {e}"))
        }
    }
}

#[async_trait]
impl Verifier for CommandVerifier {
    fn verifier_type(&self) -> &str {
        "command"
    }

    async fn verify(&self, criterion: &Criterion) -> VerifierResult {
        let spec = Self::parse_spec(criterion.expected.as_deref());

        debug!("Executing command: {}", spec.command);

        let output = match Self::execute(&spec).await {
            Ok(o) => o,
            Err(e) => return VerifierResult::failure(format!("Failed to execute command: {e}")),
        };

        let exit_code = output.status.code().unwrap_or(-1);
        let expected_exit = spec.expected_exit_code.unwrap_or(0);
        let exit_ok = exit_code == expected_exit;

        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        let combined = format!("{}\n{}", stdout, stderr);

        let mut regex_errors: Vec<String> = Vec::new();

        let mut check = |label: &str, pat: &Option<String>, hay: &str| {
            if let Some(p) = pat {
                match Regex::new(p) {
                    Ok(re) => {
                        if !re.is_match(hay) {
                            regex_errors.push(format!("{label} did not match: {p}"));
                        }
                    }
                    Err(e) => regex_errors.push(format!("Invalid {label} regex '{p}': {e}")),
                }
            }
        };

        check("stdout_regex", &spec.stdout_regex, &stdout);
        check("stderr_regex", &spec.stderr_regex, &stderr);
        check("output_regex", &spec.output_regex, &combined);

        let passed = exit_ok && regex_errors.is_empty();

        let mut message = if passed {
            format!("Command passed (exit={exit_code})")
        } else {
            let mut parts = Vec::new();
            if !exit_ok {
                parts.push(format!("exit={exit_code} expected={expected_exit}"));
            }
            parts.extend(regex_errors.clone());
            format!("Command failed: {}", parts.join("; "))
        };

        if let Some(cwd) = &spec.cwd {
            message.push_str(&format!(" (cwd={})", cwd.display()));
        }

        let evidence_content = format!(
            "Command: {}\nCwd: {}\nExpected Exit: {}\nExit Code: {}\nTimeoutMs: {}\nEnv: {:?}\n\nStdout:\n{}\n\nStderr:\n{}",
            spec.command,
            spec.cwd
                .as_ref()
                .map(|p| p.display().to_string())
                .unwrap_or_else(|| "<inherit>".to_string()),
            expected_exit,
            exit_code,
            spec.timeout_ms
                .map(|v| v.to_string())
                .unwrap_or_else(|| "<none>".to_string()),
            spec.env,
            stdout,
            stderr
        );

        let evidence = Evidence {
            evidence_type: "command_output".to_string(),
            path: PathBuf::from(format!("/tmp/evidence-cmd-{}", criterion.id)),
            timestamp: Utc::now(),
            description: Some(format!("Command execution: {}", spec.command)),
            metadata: {
                let mut m = HashMap::new();
                m.insert("content".to_string(), evidence_content);
                m
            },
        };

        VerifierResult {
            passed,
            message,
            evidence: Some(evidence),
            timestamp: Utc::now(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_command_verifier_success() {
        let verifier = CommandVerifier::new();

        let expected = if cfg!(windows) {
            "cmd /c echo hello"
        } else {
            "echo 'hello'"
        };

        let criterion = Criterion {
            id: "test-1".to_string(),
            description: "Echo test".to_string(),
            met: false,
            verification_method: Some("command".to_string()),
            expected: Some(expected.to_string()),
            actual: None,
        };

        let result = verifier.verify(&criterion).await;
        assert!(result.passed);
    }

    #[tokio::test]
    async fn test_command_verifier_failure() {
        let verifier = CommandVerifier::new();

        let expected = if cfg!(windows) {
            "cmd /c exit 1"
        } else {
            "false"
        };

        let criterion = Criterion {
            id: "test-2".to_string(),
            description: "Failing command".to_string(),
            met: false,
            verification_method: Some("command".to_string()),
            expected: Some(expected.to_string()),
            actual: None,
        };

        let result = verifier.verify(&criterion).await;
        assert!(!result.passed);
    }
}
