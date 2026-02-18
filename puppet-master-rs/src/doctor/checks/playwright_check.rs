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
use tokio::time::{timeout, Duration};

fn combined_output(output: &std::process::Output) -> String {
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    format!("{}{}", stdout, stderr).trim().to_string()
}

fn resolve_project_root_for_doctor(cwd: &Path) -> PathBuf {
    let derived = crate::utils::derive_project_root(cwd).unwrap_or_else(|_| cwd.to_path_buf());
    if derived
        .file_name()
        .is_some_and(|name| name == "puppet-master-rs")
    {
        if let Some(parent) = derived.parent() {
            if crate::utils::puppet_master_dir(parent).exists() {
                return parent.to_path_buf();
            }
        }
    }
    derived
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

fn resolve_tool(name: &str) -> Option<PathBuf> {
    crate::platforms::path_utils::resolve_executable(name)
}

async fn read_playwright_version_with_node(node_path: &Path, repo_root: &Path) -> Option<String> {
    let node_script = r#"
      try {
        const pkg = require('playwright/package.json');
        if (pkg && pkg.version) {
          console.log(pkg.version);
          process.exit(0);
        }
        process.exit(1);
      } catch {
        process.exit(1);
      }
    "#;

    let mut cmd = Command::new(node_path);
    cmd.args(["-e", node_script])
        .current_dir(repo_root)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .kill_on_drop(true);

    match timeout(Duration::from_secs(10), cmd.output()).await {
        Ok(Ok(output)) if output.status.success() => {
            let version = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if version.is_empty() {
                None
            } else {
                Some(version)
            }
        }
        _ => None,
    }
}

async fn read_playwright_version_with_npx(npx_path: &Path, repo_root: &Path) -> Option<String> {
    let mut cmd = Command::new(npx_path);
    cmd.args(["--no-install", "playwright", "--version"])
        .current_dir(repo_root)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .kill_on_drop(true);

    match timeout(Duration::from_secs(10), cmd.output()).await {
        Ok(Ok(out)) if out.status.success() => Some(combined_output(&out)),
        _ => None,
    }
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
        // Determine project root from current working directory.
        let cwd = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
        let repo_root = resolve_project_root_for_doctor(&cwd);

        let browsers_path_note = match std::env::var("PLAYWRIGHT_BROWSERS_PATH") {
            Ok(v) => format!("PLAYWRIGHT_BROWSERS_PATH={v}"),
            Err(_) => "PLAYWRIGHT_BROWSERS_PATH is not set".to_string(),
        };

        let Some(node_path) = resolve_tool("node") else {
            return CheckResult {
                passed: false,
                message: "Node.js not found".to_string(),
                details: Some(
                    "Playwright checks require Node.js. Install Node.js, then rerun doctor."
                        .to_string(),
                ),
                can_fix: true,
                timestamp: Utc::now(),
            };
        };
        let Some(npm_path) = resolve_tool("npm") else {
            return CheckResult {
                passed: false,
                message: "npm not found".to_string(),
                details: Some(format!(
                    "Node found at {}, but npm is missing.",
                    node_path.display()
                )),
                can_fix: true,
                timestamp: Utc::now(),
            };
        };
        let npx_path = resolve_tool("npx");

        // 1) Verify Playwright package/CLI can be resolved from project root.
        let version_text = if let Some(version) =
            read_playwright_version_with_node(&node_path, &repo_root).await
        {
            version
        } else if let Some(npx) = &npx_path {
            if let Some(version) = read_playwright_version_with_npx(npx, &repo_root).await {
                version
            } else {
                return CheckResult {
                    passed: false,
                    message: "Playwright package not available".to_string(),
                    details: Some(format!(
                        "{browsers_path_note}. Could not resolve Playwright with node or npx from {}.\nSuggestion: install dependencies (npm ci or npm install), then run: npx playwright install",
                        repo_root.display()
                    )),
                    can_fix: true,
                    timestamp: Utc::now(),
                };
            }
        } else {
            return CheckResult {
                passed: false,
                message: "Playwright package not available".to_string(),
                details: Some(format!(
                    "{browsers_path_note}. Playwright package lookup failed and npx is unavailable.\nNode: {}, npm: {}\nSuggestion: install dependencies (npm ci or npm install), then install browsers.",
                    node_path.display(),
                    npm_path.display()
                )),
                can_fix: true,
                timestamp: Utc::now(),
            };
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

        let mut cmd = Command::new(&node_path);
        cmd.args(["-e", node_script])
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
        if dry_run {
            return Some(
                FixResult::success("Would install Playwright and download browser binaries")
                    .with_step("npm install -g playwright (app-local prefix)")
                    .with_step("npx playwright install"),
            );
        }

        let outcome = crate::install::install_coordinator::install_playwright().await;
        let mut result = if outcome.success {
            FixResult::success("Playwright installed successfully.")
        } else {
            FixResult::failure(outcome.message)
        };
        for line in &outcome.log_lines {
            result = result.with_step(line.clone());
        }
        Some(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn finds_browser_cache_directories() {
        let temp_dir = TempDir::new().unwrap();
        fs::create_dir_all(temp_dir.path().join("chromium-1234")).unwrap();
        fs::create_dir_all(temp_dir.path().join("webkit-5678")).unwrap();

        let found = any_playwright_browser_dirs_exist(&temp_dir.path().to_path_buf()).unwrap();
        assert_eq!(found.len(), 2);
    }

    #[test]
    fn resolves_workspace_parent_from_puppet_master_rs_cwd() {
        let root = TempDir::new().unwrap();
        fs::create_dir_all(root.path().join(".puppet-master")).unwrap();
        let crate_dir = root.path().join("puppet-master-rs");
        fs::create_dir_all(&crate_dir).unwrap();
        fs::write(
            crate_dir.join("Cargo.toml"),
            "[package]\nname='x'\nversion='0.1.0'",
        )
        .unwrap();

        let resolved = resolve_project_root_for_doctor(&crate_dir);
        assert_eq!(resolved, root.path());
    }
}
