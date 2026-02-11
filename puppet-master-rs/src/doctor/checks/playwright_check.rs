//! Playwright readiness check
//!
//! Verifies Playwright is installed (via `npx playwright --version`) and that
//! at least one browser binary is available.

use crate::types::{CheckCategory, CheckResult, DoctorCheck, FixResult};
use async_trait::async_trait;
use chrono::Utc;
use std::path::PathBuf;
use std::process::Stdio;
use tokio::process::Command;
use tokio::time::{timeout, Duration};

async fn run_command(program: &str, args: &[&str], timeout_duration: Duration) -> Result<std::process::Output, String> {
    let mut cmd = Command::new(program);
    cmd.args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .kill_on_drop(true);

    match timeout(timeout_duration, cmd.output()).await {
        Ok(Ok(output)) => Ok(output),
        Ok(Err(e)) => Err(format!("Failed to run {program}: {e}")),
        Err(_) => Err(format!(
            "Timed out running {program} {:?}",
            args
        )),
    }
}

fn combined_output(output: &std::process::Output) -> String {
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    format!("{}{}", stdout, stderr).trim().to_string()
}

fn default_ms_playwright_dir() -> Option<PathBuf> {
    let home = std::env::var_os("HOME")?;
    Some(PathBuf::from(home).join(".cache").join("ms-playwright"))
}

fn any_playwright_browser_dirs_exist(browsers_dir: &PathBuf) -> Result<Vec<String>, String> {
    let mut found = Vec::new();
    if !browsers_dir.exists() {
        return Ok(found);
    }

    let entries = std::fs::read_dir(browsers_dir)
        .map_err(|e| format!("Failed to read {browsers_dir:?}: {e}"))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {e}"))?;
        let name = entry.file_name().to_string_lossy().to_string();
        if name.starts_with("chromium-") || name.starts_with("firefox-") || name.starts_with("webkit-") {
            found.push(name);
        }
    }

    Ok(found)
}

/// Checks Playwright is installed and browsers are available.
pub struct PlaywrightCheck;

impl PlaywrightCheck {
    pub fn new() -> Self {
        Self
    }
}

impl Default for PlaywrightCheck {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl DoctorCheck for PlaywrightCheck {
    fn name(&self) -> &str {
        "playwright-browsers"
    }

    fn category(&self) -> CheckCategory {
        CheckCategory::Environment
    }

    fn description(&self) -> &str {
        "Check Playwright is installed (npx) and browsers are available"
    }

    async fn run(&self) -> CheckResult {
        let browsers_path_note = match std::env::var("PLAYWRIGHT_BROWSERS_PATH") {
            Ok(v) => format!("PLAYWRIGHT_BROWSERS_PATH={v}"),
            Err(_) => "PLAYWRIGHT_BROWSERS_PATH is not set".to_string(),
        };

        // 1) Verify Playwright CLI is available.
        let version_output = match run_command(
            "npx",
            &["--no-install", "playwright", "--version"],
            Duration::from_secs(10),
        )
        .await
        {
            Ok(out) => Ok(out),
            Err(_) => run_command("npx", &["playwright", "--version"], Duration::from_secs(10)).await,
        };

        let version_text = match version_output {
            Ok(out) if out.status.success() => combined_output(&out),
            Ok(out) => {
                return CheckResult {
                    passed: false,
                    message: "Playwright CLI not available via npx".to_string(),
                    details: Some(format!(
                        "{browsers_path_note}. npx output: {}\nSuggestion: ensure Playwright is installed (e.g. npm i -D playwright) and try: npx playwright --version",
                        combined_output(&out)
                    )),
                    can_fix: false,
                    timestamp: Utc::now(),
                };
            }
            Err(e) => {
                return CheckResult {
                    passed: false,
                    message: "Failed to run npx playwright".to_string(),
                    details: Some(format!(
                        "{browsers_path_note}. Error: {e}\nSuggestion: ensure Node.js + npm are installed, then install Playwright and run: npx playwright install"
                    )),
                    can_fix: false,
                    timestamp: Utc::now(),
                };
            }
        };

        // 2) Check browser binaries.
        // Prefer using Playwright's own executablePath() (same approach as TS), falling back to cache dir.
        let node_script = r#"
          const fs = require('fs');
          const { chromium, firefox, webkit } = require('playwright');
          const paths = {
            chromium: chromium.executablePath(),
            firefox: firefox.executablePath(),
            webkit: webkit.executablePath(),
          };
          console.log(JSON.stringify(paths));
        "#;

        let mut found = Vec::new();

        if let Ok(out) = run_command("node", &["-e", node_script], Duration::from_secs(10)).await {
            if out.status.success() {
                if let Ok(value) = serde_json::from_slice::<serde_json::Value>(&out.stdout) {
                    for (label, key) in [("chromium", "chromium"), ("firefox", "firefox"), ("webkit", "webkit")] {
                        if let Some(path) = value.get(key).and_then(|v| v.as_str()) {
                            if std::path::Path::new(path).exists() {
                                found.push(format!("{label}: {path}"));
                            }
                        }
                    }
                }
            }
        }

        if found.is_empty() {
            // Fallback: look for cached browser directories.
            let browsers_dir = match std::env::var("PLAYWRIGHT_BROWSERS_PATH") {
                Ok(v) if !v.is_empty() && v != "0" => Some(PathBuf::from(v)),
                _ => default_ms_playwright_dir(),
            };

            if let Some(dir) = browsers_dir {
                match any_playwright_browser_dirs_exist(&dir) {
                    Ok(dirs) if !dirs.is_empty() => {
                        found.extend(dirs.into_iter().map(|d| format!("cache: {dir:?}/{d}")));
                    }
                    Ok(_) => {}
                    Err(e) => {
                        return CheckResult {
                            passed: false,
                            message: "Playwright browsers check failed".to_string(),
                            details: Some(format!("{browsers_path_note}. Error: {e}")),
                            can_fix: false,
                            timestamp: Utc::now(),
                        };
                    }
                }
            }
        }

        if found.is_empty() {
            return CheckResult {
                passed: false,
                message: "Playwright is installed but browser binaries are missing".to_string(),
                details: Some(format!(
                    "{browsers_path_note}. Playwright version: {version_text}.\nSuggestion: run: npx playwright install (or: PLAYWRIGHT_BROWSERS_PATH=0 npx playwright install)"
                )),
                can_fix: false,
                timestamp: Utc::now(),
            };
        }

        CheckResult {
            passed: true,
            message: "Playwright browsers are available".to_string(),
            details: Some(format!(
                "{browsers_path_note}. Playwright version: {version_text}. Found: {}",
                found.join(", ")
            )),
            can_fix: false,
            timestamp: Utc::now(),
        }
    }

    async fn fix(&self, _dry_run: bool) -> Option<FixResult> {
        None
    }
}
