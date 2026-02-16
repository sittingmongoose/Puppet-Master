//! Script verifier - runs script files and checks exit codes/output.

use crate::types::{Criterion, Evidence, Verifier, VerifierResult};
use async_trait::async_trait;
use chrono::Utc;
use log::debug;
use serde::Deserialize;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::time::Duration;
use tokio::process::Command;

// DRY:DATA:ScriptVerifier
/// Verifier that executes script files.
pub struct ScriptVerifier;

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ScriptSpec {
    path: String,
    #[serde(default)]
    args: Vec<String>,
    #[serde(default)]
    cwd: Option<PathBuf>,
    #[serde(default)]
    env: HashMap<String, String>,
    #[serde(default)]
    timeout_ms: Option<u64>,
    #[serde(default)]
    pass_token: Option<String>,
    #[serde(default)]
    language: Option<String>,
}

impl ScriptVerifier {
    // DRY:FN:new
    pub fn new() -> Self {
        Self
    }

    fn parse_spec(expected: Option<&str>) -> ScriptSpec {
        let raw = expected.unwrap_or("").trim();
        if raw.starts_with('{') {
            if let Ok(spec) = serde_json::from_str::<ScriptSpec>(raw) {
                return spec;
            }
        }

        ScriptSpec {
            path: raw.to_string(),
            args: Vec::new(),
            cwd: None,
            env: HashMap::new(),
            timeout_ms: None,
            pass_token: None,
            language: None,
        }
    }

    fn language_interpreter(language: &str) -> Option<&'static str> {
        match language.to_lowercase().as_str() {
            "sh" | "shell" => Some("sh"),
            "bash" => Some("bash"),
            "python" | "py" => Some("python3"),
            "node" | "js" | "javascript" => Some("node"),
            "ruby" | "rb" => Some("ruby"),
            "cmd" | "bat" | "batch" => Some("cmd"),
            _ => None,
        }
    }

    /// Determine the interpreter for a script file.
    fn get_interpreter(path: &str, language: Option<&str>) -> Result<String, String> {
        if let Some(lang) = language {
            if let Some(i) = Self::language_interpreter(lang) {
                return Ok(i.to_string());
            }
            return Err(format!("Unsupported script language: {lang}"));
        }

        let extension = Path::new(path)
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("");

        Ok(match extension {
            "sh" => "sh".to_string(),
            "bash" => "bash".to_string(),
            "py" | "python" => "python3".to_string(),
            "js" | "mjs" | "cjs" | "ts" => "node".to_string(),
            "rb" => "ruby".to_string(),
            "bat" | "cmd" => "cmd".to_string(),
            "" => "sh".to_string(),
            _ => return Err(format!("Unsupported script extension: {extension}")),
        })
    }

    async fn execute(interpreter: &str, spec: &ScriptSpec) -> Result<std::process::Output, String> {
        let mut cmd = Command::new(interpreter);
        if interpreter == "cmd" {
            cmd.arg("/C").arg(&spec.path).args(&spec.args);
        } else {
            cmd.arg(&spec.path).args(&spec.args);
        }
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
            .map_err(|e| format!("Failed to spawn script interpreter '{interpreter}': {e}"))?;

        if let Some(timeout_ms) = spec.timeout_ms {
            let timeout = Duration::from_millis(timeout_ms);
            let mut child_opt = Some(child);
            let output = tokio::select! {
                result = async {
                    let child = child_opt.take().expect("child");
                    child.wait_with_output().await
                } => result.map_err(|e| format!("Script execution failed: {e}"))?,
                _ = tokio::time::sleep(timeout) => {
                    if let Some(mut child) = child_opt.take() {
                        let _ = child.kill().await;
                    }
                    return Err(format!("Script timed out after {timeout_ms}ms"));
                }
            };
            Ok(output)
        } else {
            child
                .wait_with_output()
                .await
                .map_err(|e| format!("Script execution failed: {e}"))
        }
    }
}

#[async_trait]
impl Verifier for ScriptVerifier {
    fn verifier_type(&self) -> &str {
        "script"
    }

    async fn verify(&self, criterion: &Criterion) -> VerifierResult {
        let spec = Self::parse_spec(criterion.expected.as_deref());
        let script_path = spec.path.as_str();

        debug!("Executing script: {}", script_path);

        // Check if script exists.
        if script_path.is_empty() || !Path::new(script_path).exists() {
            return VerifierResult::failure(format!("Script not found: {script_path}"));
        }

        // Determine interpreter.
        let interpreter = match Self::get_interpreter(script_path, spec.language.as_deref()) {
            Ok(i) => i,
            Err(e) => return VerifierResult::failure(e),
        };

        let output = match Self::execute(&interpreter, &spec).await {
            Ok(o) => o,
            Err(e) => return VerifierResult::failure(format!("Failed to execute script: {e}")),
        };

        let exit_code = output.status.code().unwrap_or(-1);
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();

        let mut passed = exit_code == 0;
        let mut token_note = String::new();

        if let Some(token) = spec.pass_token.as_deref() {
            let has_token = stdout.contains(token) || stderr.contains(token);
            passed = passed && has_token;
            token_note = format!(" passToken={token} present={has_token}");
        }

        let message = if passed {
            format!("Script passed (exit={exit_code}){token_note}: {script_path}")
        } else {
            format!("Script failed (exit={exit_code}){token_note}: {script_path}")
        };

        let evidence_content = format!(
            "Script: {}\nInterpreter: {}\nArgs: {:?}\nCwd: {}\nExit Code: {}\nTimeoutMs: {}\nEnv: {:?}\n\nStdout:\n{}\n\nStderr:\n{}",
            script_path,
            interpreter,
            spec.args,
            spec.cwd
                .as_ref()
                .map(|p| p.display().to_string())
                .unwrap_or_else(|| "<inherit>".to_string()),
            exit_code,
            spec.timeout_ms
                .map(|v| v.to_string())
                .unwrap_or_else(|| "<none>".to_string()),
            spec.env,
            stdout,
            stderr
        );

        let evidence = Evidence {
            evidence_type: "script_output".to_string(),
            path: PathBuf::from(script_path),
            timestamp: Utc::now(),
            description: Some(format!("Script execution: {script_path}")),
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
    #[cfg(unix)]
    use std::io::Write;
    #[cfg(unix)]
    use std::os::unix::fs::PermissionsExt;
    #[cfg(unix)]
    use tempfile::NamedTempFile;
    #[cfg(windows)]
    use tempfile::tempdir;

    #[tokio::test]
    async fn test_script_verifier_success() {
        #[cfg(unix)]
        let mut temp_file = NamedTempFile::new().unwrap();
        #[cfg(unix)]
        write!(temp_file, "#!/bin/sh\necho 'test'\nexit 0\n").unwrap();

        #[cfg(unix)]
        {
            // Make executable.
            let mut perms = std::fs::metadata(temp_file.path()).unwrap().permissions();
            perms.set_mode(0o755);
            std::fs::set_permissions(temp_file.path(), perms).unwrap();
        }

        #[cfg(unix)]
        let path = temp_file.path().to_string_lossy().to_string();

        #[cfg(windows)]
        let temp_dir = tempdir().unwrap();
        #[cfg(windows)]
        let script_path = temp_dir.path().join("ok.bat");
        #[cfg(windows)]
        std::fs::write(&script_path, "@echo off\r\necho test\r\nexit /b 0\r\n").unwrap();
        #[cfg(windows)]
        let path = script_path.to_string_lossy().to_string();

        let verifier = ScriptVerifier::new();
        let criterion = Criterion {
            id: "test-1".to_string(),
            description: "Run test script".to_string(),
            met: false,
            verification_method: Some("script".to_string()),
            expected: Some(path),
            actual: None,
        };

        let result = verifier.verify(&criterion).await;
        assert!(result.passed);
    }

    #[test]
    fn test_interpreter_detection() {
        assert_eq!(
            ScriptVerifier::get_interpreter("test.sh", None).unwrap(),
            "sh"
        );
        assert_eq!(
            ScriptVerifier::get_interpreter("test.py", None).unwrap(),
            "python3"
        );
        assert_eq!(
            ScriptVerifier::get_interpreter("test.js", None).unwrap(),
            "node"
        );
        assert_eq!(
            ScriptVerifier::get_interpreter("test.bat", None).unwrap(),
            "cmd"
        );
        assert!(ScriptVerifier::get_interpreter("test.unknown", None).is_err());
        assert_eq!(
            ScriptVerifier::get_interpreter("test.unknown", Some("bash")).unwrap(),
            "bash"
        );
        assert_eq!(
            ScriptVerifier::get_interpreter("test.unknown", Some("batch")).unwrap(),
            "cmd"
        );
    }
}
