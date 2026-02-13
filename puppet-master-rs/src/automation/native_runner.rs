//! Native window smoke runner.

use crate::automation::{DebugFeedCollector, GuiRunSpec, GuiStepResult, RunnerOutcome};
use anyhow::{Context, Result};
use chrono::Utc;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::thread;
use std::time::Duration;

/// Marker type for native execution API.
#[derive(Debug, Clone, Copy)]
pub struct NativeRunner;

impl NativeRunner {
    pub fn run(
        spec: &GuiRunSpec,
        workspace_root: &Path,
        artifacts_root: &Path,
        debug_feed: &mut DebugFeedCollector,
    ) -> Result<RunnerOutcome> {
        run(spec, workspace_root, artifacts_root, debug_feed)
    }
}

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
    let screenshot_ok = capture_native_screenshot(&screenshot_path)?;

    // Best-effort graceful shutdown.
    let _ = child.kill();
    let _ = child.wait();

    let finished_at = Utc::now();

    let mut artifacts = Vec::new();
    if screenshot_ok {
        artifacts.push(screenshot_path);
    }

    let passed = screenshot_ok;
    let message = if screenshot_ok {
        "native smoke run completed".to_string()
    } else {
        "native smoke run completed without screenshot tool".to_string()
    };

    debug_feed.record_step(
        &step_id,
        "native_finished",
        &message,
        serde_json::json!({
            "passed": passed,
            "artifacts": artifacts,
        }),
    );

    Ok(RunnerOutcome {
        passed,
        message,
        step_results: vec![GuiStepResult {
            id: step_id,
            passed,
            message: if passed {
                "captured native screenshot".to_string()
            } else {
                "no screenshot command available (grim/gnome-screenshot/import)".to_string()
            },
            started_at,
            finished_at,
            artifacts,
        }],
    })
}

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

fn capture_native_screenshot(path: &Path) -> Result<bool> {
    #[cfg(not(target_os = "linux"))]
    {
        let _ = path;
        return Ok(false);
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

        for (cmd, args) in candidates {
            let status = Command::new(cmd).args(&args).status();
            if let Ok(status) = status {
                if status.success() {
                    return Ok(true);
                }
            }
        }

        Ok(false)
    }
}
