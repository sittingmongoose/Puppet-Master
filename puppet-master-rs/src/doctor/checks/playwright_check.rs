//! Playwright readiness check
//!
//! Verifies Playwright is installed (via `npx playwright --version`) and that
//! at least one browser binary is available.

use crate::types::{CheckCategory, CheckResult, DoctorCheck, FixResult};
use async_trait::async_trait;
use chrono::Utc;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use tokio::process::Command;
use tokio::time::{Duration, timeout};

fn combined_output(output: &std::process::Output) -> String {
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    format!("{}{}", stdout, stderr).trim().to_string()
}

fn repo_root_from_cwd(cwd: &Path) -> PathBuf {
    // Same logic as BrowserVerifier::repo_root_from_cwd
    if cwd.file_name().is_some_and(|n| n == "puppet-master-rs") {
        cwd.parent().unwrap_or(cwd).to_path_buf()
    } else {
        cwd.to_path_buf()
    }
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
        if name.starts_with("chromium-")
            || name.starts_with("firefox-")
            || name.starts_with("webkit-")
        {
            found.push(name);
        }
    }

    Ok(found)
}

// DRY:DATA:PlaywrightCheck
/// Checks Playwright is installed and browsers are available.
pub struct PlaywrightCheck;

impl PlaywrightCheck {
    // DRY:FN:new
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
        // Determine repo root (same logic as BrowserVerifier)
        let cwd = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
        let repo_root = repo_root_from_cwd(&cwd);

        let browsers_path_note = match std::env::var("PLAYWRIGHT_BROWSERS_PATH") {
            Ok(v) => format!("PLAYWRIGHT_BROWSERS_PATH={v}"),
            Err(_) => "PLAYWRIGHT_BROWSERS_PATH is not set".to_string(),
        };

        // 1) Verify Playwright CLI is available from repo_root
        let version_output = {
            let mut cmd = Command::new("npx");
            cmd.args(&["--no-install", "playwright", "--version"])
                .current_dir(&repo_root)
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .kill_on_drop(true);

            match timeout(Duration::from_secs(10), cmd.output()).await {
                Ok(Ok(out)) if out.status.success() => Some(out),
                _ => {
                    let mut cmd2 = Command::new("npx");
                    cmd2.args(&["playwright", "--version"])
                        .current_dir(&repo_root)
                        .stdout(Stdio::piped())
                        .stderr(Stdio::piped())
                        .kill_on_drop(true);

                    timeout(Duration::from_secs(10), cmd2.output())
                        .await
                        .ok()
                        .and_then(|r| r.ok())
                }
            }
        };

        let version_text = match version_output {
            Some(out) if out.status.success() => combined_output(&out),
            Some(out) => {
                return CheckResult {
                    passed: false,
                    message: "Playwright CLI not available via npx".to_string(),
                    details: Some(format!(
                        "{browsers_path_note}. npx output: {}\nSuggestion: ensure Playwright is installed (e.g. npm i -D playwright) and try: npx playwright --version",
                        combined_output(&out)
                    )),
                    can_fix: true, // Can be fixed by installing dependencies
                    timestamp: Utc::now(),
                };
            }
            None => {
                return CheckResult {
                    passed: false,
                    message: "Failed to run npx playwright".to_string(),
                    details: Some(format!(
                        "{browsers_path_note}. Error: npx command timed out or failed\nSuggestion: ensure Node.js + npm are installed, then install Playwright and run: npx playwright install"
                    )),
                    can_fix: true, // Can be fixed by installing
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

        let mut cmd = Command::new("node");
        cmd.args(&["-e", node_script])
            .current_dir(&repo_root)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .kill_on_drop(true);

        if let Ok(out) = timeout(Duration::from_secs(10), cmd.output()).await {
            if let Ok(out) = out {
                if out.status.success() {
                    if let Ok(value) = serde_json::from_slice::<serde_json::Value>(&out.stdout) {
                        for (label, key) in [
                            ("chromium", "chromium"),
                            ("firefox", "firefox"),
                            ("webkit", "webkit"),
                        ] {
                            if let Some(path) = value.get(key).and_then(|v| v.as_str()) {
                                if std::path::Path::new(path).exists() {
                                    found.push(format!("{label}: {path}"));
                                }
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
                can_fix: true, // Can be fixed by running playwright install
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

    fn has_fix(&self) -> bool {
        true
    }

    async fn fix(&self, dry_run: bool) -> Option<FixResult> {
        let cwd = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
        let repo_root = repo_root_from_cwd(&cwd);

        let mut steps = Vec::new();

        if dry_run {
            steps.push(format!("Would determine repo root: {repo_root:?}"));
            steps.push("Would check if package-lock.json exists".to_string());
            steps.push("Would run: npm ci (or npm install if no package-lock.json)".to_string());
            steps.push("Would run: npx playwright install".to_string());

            #[cfg(target_os = "linux")]
            steps.push(
                "Would run: npx playwright install --with-deps (on Linux, best-effort)".to_string(),
            );

            return Some(
                FixResult::success("Dry run: would install Playwright dependencies and browsers")
                    .with_step(steps.join("\n")),
            );
        }

        // Step 1: Determine repo root
        steps.push(format!("Determined repo root: {repo_root:?}"));

        // Step 2: Ensure JS dependencies are installed
        let package_lock = repo_root.join("package-lock.json");
        let npm_command = if package_lock.exists() {
            steps.push("Found package-lock.json, using 'npm ci'".to_string());
            "ci"
        } else {
            steps.push("No package-lock.json found, using 'npm install'".to_string());
            "install"
        };

        // Run npm ci/install
        let mut npm_cmd = Command::new("npm");
        npm_cmd
            .arg(npm_command)
            .current_dir(&repo_root)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .kill_on_drop(true);

        match timeout(Duration::from_secs(120), npm_cmd.output()).await {
            Ok(Ok(output)) if output.status.success() => {
                steps.push(format!("Successfully ran 'npm {npm_command}'"));
            }
            Ok(Ok(output)) => {
                let stderr = String::from_utf8_lossy(&output.stderr);
                steps.push(format!("npm {npm_command} failed: {stderr}"));
                return Some(
                    FixResult::failure(format!("Failed to run 'npm {npm_command}'"))
                        .with_step(steps.join("\n")),
                );
            }
            Ok(Err(e)) => {
                steps.push(format!("Failed to execute npm: {e}"));
                return Some(
                    FixResult::failure("Failed to execute npm command").with_step(steps.join("\n")),
                );
            }
            Err(_) => {
                steps.push("npm command timed out after 120 seconds".to_string());
                return Some(
                    FixResult::failure("npm command timed out").with_step(steps.join("\n")),
                );
            }
        }

        // Step 3: Install Playwright browsers
        let mut playwright_cmd = Command::new("npx");
        playwright_cmd
            .args(&["playwright", "install"])
            .current_dir(&repo_root)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .kill_on_drop(true);

        match timeout(Duration::from_secs(300), playwright_cmd.output()).await {
            Ok(Ok(output)) if output.status.success() => {
                steps.push("Successfully ran 'npx playwright install'".to_string());
            }
            Ok(Ok(output)) => {
                let stderr = String::from_utf8_lossy(&output.stderr);
                steps.push(format!("npx playwright install failed: {stderr}"));
                return Some(
                    FixResult::failure("Failed to install Playwright browsers")
                        .with_step(steps.join("\n")),
                );
            }
            Ok(Err(e)) => {
                steps.push(format!("Failed to execute npx playwright install: {e}"));
                return Some(
                    FixResult::failure("Failed to execute playwright install command")
                        .with_step(steps.join("\n")),
                );
            }
            Err(_) => {
                steps.push("playwright install command timed out after 300 seconds".to_string());
                return Some(
                    FixResult::failure("playwright install timed out").with_step(steps.join("\n")),
                );
            }
        }

        // Step 4: On Linux, try to install system dependencies (best-effort)
        #[cfg(target_os = "linux")]
        {
            steps.push(
                "Attempting to install system dependencies on Linux (best-effort)".to_string(),
            );
            let mut deps_cmd = Command::new("npx");
            deps_cmd
                .args(&["playwright", "install", "--with-deps"])
                .current_dir(&repo_root)
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .kill_on_drop(true);

            match timeout(Duration::from_secs(300), deps_cmd.output()).await {
                Ok(Ok(output)) if output.status.success() => {
                    steps.push("Successfully installed system dependencies".to_string());
                }
                Ok(Ok(_)) => {
                    steps.push(
                        "System dependencies installation failed (non-critical, continuing)"
                            .to_string(),
                    );
                }
                Ok(Err(_)) | Err(_) => {
                    steps.push("Could not install system dependencies (non-critical)".to_string());
                }
            }
        }

        Some(
            FixResult::success("Playwright dependencies and browsers installed successfully")
                .with_step(steps.join("\n")),
        )
    }
}
