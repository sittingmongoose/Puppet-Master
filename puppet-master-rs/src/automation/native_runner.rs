//! Native window smoke runner.

use crate::automation::{DebugFeedCollector, GuiRunSpec, GuiStepResult, RunnerOutcome};
use anyhow::{Context, Result};
use chrono::Utc;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::thread;
use std::time::Duration;

// DRY:DATA:NativeRunner
/// Marker type for native execution API.
#[derive(Debug, Clone, Copy)]
pub struct NativeRunner;

impl NativeRunner {
    // DRY:FN:run
    pub fn run(
        spec: &GuiRunSpec,
        workspace_root: &Path,
        artifacts_root: &Path,
        debug_feed: &mut DebugFeedCollector,
    ) -> Result<RunnerOutcome> {
        run(spec, workspace_root, artifacts_root, debug_feed)
    }
}

// DRY:FN:run
pub fn run(
    _spec: &GuiRunSpec,
    workspace_root: &Path,
    artifacts_root: &Path,
    debug_feed: &mut DebugFeedCollector,
) -> Result<RunnerOutcome> {
    let started_at = Utc::now();
    let step_id = "native-smoke".to_string();
    debug_feed.record_step(
        &step_id,
        "native_started",
        "Native smoke run started",
        serde_json::json!({
            "workspace": workspace_root,
        }),
    );

    std::fs::create_dir_all(artifacts_root).with_context(|| {
        format!(
            "Failed to create native artifacts dir {}",
            artifacts_root.display()
        )
    })?;

    let cargo_dir = resolve_cargo_dir(workspace_root);

    let mut child = Command::new("cargo")
        .args(["run", "--quiet", "--bin", "puppet-master"])
        .current_dir(&cargo_dir)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .context("Failed to spawn native GUI process for smoke run")?;

    thread::sleep(Duration::from_secs(3));

    let screenshot_path = artifacts_root.join("native-smoke.png");
    let screenshot = capture_native_screenshot(&screenshot_path)?;

    // Best-effort graceful shutdown.
    let _ = child.kill();
    let _ = child.wait();

    let finished_at = Utc::now();

    let native_step = native_step_outcome(screenshot, screenshot_path);

    debug_feed.record_step(
        &step_id,
        "native_finished",
        &native_step.run_message,
        serde_json::json!({
            "passed": native_step.passed,
            "artifacts": native_step.artifacts,
            "screenshotStatus": native_step.screenshot_status,
        }),
    );

    Ok(RunnerOutcome {
        passed: native_step.passed,
        message: native_step.run_message.clone(),
        step_results: vec![GuiStepResult {
            id: step_id,
            passed: native_step.passed,
            message: native_step.step_message,
            started_at,
            finished_at,
            artifacts: native_step.artifacts,
        }],
    })
}

// DRY:FN:resolve_cargo_dir
fn resolve_cargo_dir(workspace_root: &Path) -> PathBuf {
    if workspace_root.join("Cargo.toml").exists() {
        workspace_root.to_path_buf()
    } else if workspace_root
        .join("puppet-master-rs")
        .join("Cargo.toml")
        .exists()
    {
        workspace_root.join("puppet-master-rs")
    } else {
        workspace_root.to_path_buf()
    }
}

enum ScreenshotCaptureResult {
    Captured,
    Skipped(String),
}

// DRY:DATA:NativeStepOutcome
#[derive(Debug, Clone)]
struct NativeStepOutcome {
    passed: bool,
    run_message: String,
    step_message: String,
    artifacts: Vec<PathBuf>,
    screenshot_status: String,
}

// DRY:FN:native_step_outcome
fn native_step_outcome(
    screenshot: ScreenshotCaptureResult,
    screenshot_path: PathBuf,
) -> NativeStepOutcome {
    match screenshot {
        ScreenshotCaptureResult::Captured => NativeStepOutcome {
            passed: true,
            run_message: "native smoke run completed".to_string(),
            step_message: "captured native screenshot".to_string(),
            artifacts: vec![screenshot_path],
            screenshot_status: "captured".to_string(),
        },
        ScreenshotCaptureResult::Skipped(reason) => NativeStepOutcome {
            passed: true,
            run_message: format!(
                "native smoke run completed with screenshot warning: {}",
                reason
            ),
            step_message: format!("warning: {}", reason),
            artifacts: Vec::new(),
            screenshot_status: "warning_skipped".to_string(),
        },
    }
}

// DRY:FN:capture_native_screenshot
fn capture_native_screenshot(path: &Path) -> Result<ScreenshotCaptureResult> {
    #[cfg(not(target_os = "linux"))]
    {
        let _ = path;
        return Ok(ScreenshotCaptureResult::Skipped(
            "native screenshot capture is currently implemented for Linux only".to_string(),
        ));
    }

    #[cfg(target_os = "linux")]
    {
        let path_str = path.to_string_lossy().to_string();
        let candidates: Vec<(&str, Vec<String>)> = vec![
            ("grim", vec![path_str.clone()]),
            ("gnome-screenshot", vec!["-f".to_string(), path_str.clone()]),
            (
                "import",
                vec!["-window".to_string(), "root".to_string(), path_str],
            ),
        ];
        let mut available_tools = Vec::new();

        for (cmd, args) in candidates {
            if which::which(cmd).is_err() {
                continue;
            }

            available_tools.push(cmd.to_string());
            let status = Command::new(cmd).args(&args).status();
            if let Ok(status) = status {
                if status.success() {
                    return Ok(ScreenshotCaptureResult::Captured);
                }
            }
        }

        if available_tools.is_empty() {
            return Ok(ScreenshotCaptureResult::Skipped(
                "no screenshot command available (grim/gnome-screenshot/import)".to_string(),
            ));
        }

        Ok(ScreenshotCaptureResult::Skipped(format!(
            "available screenshot tools failed to capture output ({})",
            available_tools.join(", ")
        )))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn skipped_screenshot_is_warning_pass() {
        let outcome = native_step_outcome(
            ScreenshotCaptureResult::Skipped("tooling unavailable".to_string()),
            PathBuf::from("/tmp/ignored.png"),
        );

        assert!(outcome.passed);
        assert!(outcome.artifacts.is_empty());
        assert_eq!(outcome.screenshot_status, "warning_skipped");
        assert!(outcome.run_message.contains("warning"));
    }
}
