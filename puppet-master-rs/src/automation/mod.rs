//! GUI automation framework for the Rust/Iced application.
//!
//! This module provides:
//! - Scenario-based GUI automation specs
//! - Headless and native execution modes
//! - Debug feed correlation artifacts
//! - Ephemeral workspace isolation for full-action runs

pub mod action_catalog;
pub mod debug_feed;
pub mod headless_runner;
pub mod native_runner;
pub mod workspace_clone;

use anyhow::{Context, Result, bail};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};

use crate::types::config::DEFAULT_GUI_AUTOMATION_ARTIFACTS_DIR;

pub use action_catalog::{ActionDefinition, list_actions, resolve_action};
pub use debug_feed::{DebugBundlePaths, DebugFeedCollector};
pub use headless_runner::HeadlessRunner;
pub use native_runner::NativeRunner;
pub use workspace_clone::{ClonedWorkspace, build_artifact_manifest, ensure_path_within};

// DRY:DATA:GuiRunMode — GUI automation execution modes
/// Automation execution mode.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum GuiRunMode {
    Headless,
    Native,
    Hybrid,
}

impl Default for GuiRunMode {
    fn default() -> Self {
        Self::Hybrid
    }
}

impl std::fmt::Display for GuiRunMode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Headless => write!(f, "headless"),
            Self::Native => write!(f, "native"),
            Self::Hybrid => write!(f, "hybrid"),
        }
    }
}

// DRY:DATA:WorkspaceIsolation — Workspace isolation strategies for automation specs
/// Workspace isolation behavior.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum WorkspaceIsolation {
    EphemeralClone,
    SameWorkspaceWithBackups,
    InPlaceDirect,
}

impl Default for WorkspaceIsolation {
    fn default() -> Self {
        Self::EphemeralClone
    }
}

// DRY:DATA:GuiSelector — Selector definitions usable by automation steps
/// Selector abstraction used by automation steps.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum GuiSelector {
    ActionId { value: String },
    Text { value: String },
    RoleText { role: String, text: String },
    RegexText { pattern: String },
}

// DRY:DATA:GuiAction — Step action definitions for GUI automation
/// Step action.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum GuiAction {
    Navigate { page: String },
    Execute { action_id: String },
    Click { selector: GuiSelector },
    Type { selector: GuiSelector, text: String },
    Wait { ms: u64 },
    Resize { width: f32, height: f32 },
    Snapshot { label: String },
}

// DRY:DATA:GuiAssertion — Assertion variants for validating automation steps
/// Assertions evaluated after a step.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum GuiAssertion {
    PageIs {
        page: String,
    },
    NoLastError,
    OrchestratorStatus {
        status: String,
    },
    OutputContains {
        text: String,
    },
    DoctorRunning {
        value: bool,
    },
    DoctorResultCountAtLeast {
        count: usize,
    },
    DoctorCheckStatus {
        check_name: String,
        status: String,
    },
    ToastContains {
        text: String,
    },
    ToastTypeContains {
        toast_type: String,
        #[serde(default)]
        text: Option<String>,
    },
    AuthStatus {
        platform: String,
        authenticated: bool,
    },
    SetupChecking {
        value: bool,
    },
    SetupPlatformStatus {
        platform: String,
        status: String,
    },
    SetupPlatformCountAtLeast {
        count: usize,
    },
}

// DRY:DATA:GuiStep — Single step declaration for automation scenarios
/// Single scenario step.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GuiStep {
    pub id: String,
    pub action: GuiAction,
    #[serde(default)]
    pub assertions: Vec<GuiAssertion>,
    #[serde(default)]
    pub timeout_ms: Option<u64>,
}

// DRY:DATA:GuiStepResult — Result produced by a single automation step
/// Per-step execution result.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GuiStepResult {
    pub id: String,
    pub passed: bool,
    pub message: String,
    pub started_at: DateTime<Utc>,
    pub finished_at: DateTime<Utc>,
    #[serde(default)]
    pub artifacts: Vec<PathBuf>,
}

// DRY:DATA:ArtifactManifestEntry — Metadata entry describing automation artifacts
/// Artifact entry metadata.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArtifactManifestEntry {
    pub relative_path: String,
    pub kind: String,
    pub md5: String,
    pub bytes: u64,
}

// DRY:DATA:ArtifactManifest — Manifest that lists automation artifacts
/// Artifact manifest.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArtifactManifest {
    pub root: PathBuf,
    #[serde(default)]
    pub entries: Vec<ArtifactManifestEntry>,
}

// DRY:DATA:DebugSource — Categories of automation debug feed events
/// Debug feed source kind.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum DebugSource {
    Step,
    BackendEvent,
    Log,
    System,
}

// DRY:DATA:DebugFeedEvent — Event emitted to the automation debug feed
/// Single debug feed event.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DebugFeedEvent {
    pub run_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub step_id: Option<String>,
    pub source: DebugSource,
    pub kind: String,
    pub message: String,
    #[serde(default)]
    pub payload: serde_json::Value,
    pub timestamp: DateTime<Utc>,
}

// DRY:DATA:GuiRunSpec — Full specification for running GUI automation
/// Complete automation run specification.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GuiRunSpec {
    #[serde(default)]
    pub run_id: String,
    #[serde(default)]
    pub scenario_name: String,
    #[serde(default)]
    pub mode: GuiRunMode,
    #[serde(default = "default_true")]
    pub full_action: bool,
    #[serde(default = "default_workspace_root")]
    pub workspace_root: PathBuf,
    #[serde(default = "default_artifacts_root")]
    pub artifacts_root: PathBuf,
    #[serde(default)]
    pub workspace_isolation: WorkspaceIsolation,
    #[serde(default)]
    pub retain_workspace: bool,
    #[serde(default)]
    pub capture_full_bundle: bool,
    #[serde(default = "default_timeout_ms")]
    pub timeout_ms: u64,
    #[serde(default)]
    pub steps: Vec<GuiStep>,
}

impl Default for GuiRunSpec {
    fn default() -> Self {
        Self {
            run_id: String::new(),
            scenario_name: "default".to_string(),
            mode: GuiRunMode::Hybrid,
            full_action: true,
            workspace_root: default_workspace_root(),
            artifacts_root: default_artifacts_root(),
            workspace_isolation: WorkspaceIsolation::default(),
            retain_workspace: false,
            capture_full_bundle: true,
            timeout_ms: default_timeout_ms(),
            steps: Vec::new(),
        }
    }
}

// DRY:DATA:GuiRunResult — Captured results emitted by GUI automation runs
/// Final run result.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GuiRunResult {
    pub run_id: String,
    pub scenario_name: String,
    pub mode: GuiRunMode,
    pub started_at: DateTime<Utc>,
    pub finished_at: DateTime<Utc>,
    pub passed: bool,
    pub message: String,
    pub workspace_root: PathBuf,
    pub effective_workspace_root: PathBuf,
    pub artifacts_root: PathBuf,
    #[serde(default)]
    pub step_results: Vec<GuiStepResult>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub debug_timeline_path: Option<PathBuf>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub debug_summary_path: Option<PathBuf>,
    pub artifact_manifest: ArtifactManifest,
}

// DRY:FN:default_workspace_root
fn default_workspace_root() -> PathBuf {
    std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
}

// DRY:FN:default_artifacts_root
fn default_artifacts_root() -> PathBuf {
    PathBuf::from(DEFAULT_GUI_AUTOMATION_ARTIFACTS_DIR)
}

// DRY:FN:default_timeout_ms
fn default_timeout_ms() -> u64 {
    120_000
}

// DRY:FN:default_true
fn default_true() -> bool {
    true
}

// DRY:FN:normalize_run_id
static RUN_ID_COUNTER: AtomicU64 = AtomicU64::new(0);

// DRY:FN:normalize_run_id
fn normalize_run_id(spec: &mut GuiRunSpec) {
    if !spec.run_id.trim().is_empty() {
        return;
    }

    let nonce = RUN_ID_COUNTER.fetch_add(1, Ordering::Relaxed);
    let pid = std::process::id();
    spec.run_id = format!(
        "GA-{}-p{}-n{}",
        Utc::now().format("%Y-%m-%d-%H-%M-%S-%6f"),
        pid,
        nonce
    );
}

// DRY:FN:run_artifact_root
fn run_artifact_root(spec: &GuiRunSpec) -> PathBuf {
    if spec.artifacts_root.is_absolute() {
        return spec.artifacts_root.join(&spec.run_id);
    }

    spec.workspace_root
        .join(&spec.artifacts_root)
        .join(&spec.run_id)
}

// DRY:FN:run_gui_automation — Execute a GUI automation run using the configured mode
/// Execute a GUI automation run using the configured mode.
pub fn run_gui_automation(mut spec: GuiRunSpec) -> Result<GuiRunResult> {
    normalize_run_id(&mut spec);

    validate_workspace_isolation(spec.workspace_isolation, spec.full_action)?;

    let started_at = Utc::now();
    let artifacts_root = run_artifact_root(&spec);
    std::fs::create_dir_all(&artifacts_root).with_context(|| {
        format!(
            "Failed to create artifacts dir {}",
            artifacts_root.display()
        )
    })?;

    let mut debug_feed = DebugFeedCollector::new(spec.run_id.clone());
    debug_feed.record_system(
        "run_started",
        "GUI automation run started",
        serde_json::json!({
            "mode": spec.mode,
            "workspace": spec.workspace_root,
            "fullAction": spec.full_action,
        }),
    );
    debug_feed.record_runtime_activity(
        "run_started",
        "GUI automation run started",
        serde_json::json!({
            "mode": spec.mode,
            "workspace": spec.workspace_root,
            "fullAction": spec.full_action,
        }),
    );

    let mut cloned_workspace: Option<ClonedWorkspace> = None;
    let effective_workspace_root = if spec.workspace_isolation == WorkspaceIsolation::EphemeralClone
    {
        let cloned = workspace_clone::create_ephemeral_clone(&spec.workspace_root, &spec.run_id)?;
        let root = cloned.clone_root.clone();
        debug_feed.record_system(
            "workspace_cloned",
            "Created ephemeral workspace clone",
            serde_json::json!({
                "cloneRoot": root,
            }),
        );
        debug_feed.record_runtime_activity(
            "workspace_cloned",
            "Created ephemeral workspace clone",
            serde_json::json!({
                "cloneRoot": root,
            }),
        );
        cloned_workspace = Some(cloned);
        root
    } else {
        spec.workspace_root.clone()
    };

    let mut step_results = Vec::new();
    let mut passed = true;
    let mut messages = Vec::new();

    match spec.mode {
        GuiRunMode::Headless => {
            debug_feed.record_runtime_activity(
                "runner_started",
                "Starting headless runner",
                serde_json::json!({
                    "runner": "headless",
                }),
            );
            let outcome = headless_runner::run(
                &spec,
                &effective_workspace_root,
                &artifacts_root,
                &mut debug_feed,
            )?;
            passed &= outcome.passed;
            step_results.extend(outcome.step_results);
            messages.push(outcome.message);
            debug_feed.record_runtime_activity(
                "runner_finished",
                "Headless runner completed",
                serde_json::json!({
                    "runner": "headless",
                    "passed": outcome.passed,
                }),
            );
        }
        GuiRunMode::Native => {
            debug_feed.record_runtime_activity(
                "runner_started",
                "Starting native runner",
                serde_json::json!({
                    "runner": "native",
                }),
            );
            let outcome = native_runner::run(
                &spec,
                &effective_workspace_root,
                &artifacts_root,
                &mut debug_feed,
            )?;
            passed &= outcome.passed;
            step_results.extend(outcome.step_results);
            messages.push(outcome.message);
            debug_feed.record_runtime_activity(
                "runner_finished",
                "Native runner completed",
                serde_json::json!({
                    "runner": "native",
                    "passed": outcome.passed,
                }),
            );
        }
        GuiRunMode::Hybrid => {
            debug_feed.record_runtime_activity(
                "runner_started",
                "Starting hybrid runners",
                serde_json::json!({
                    "runner": "hybrid",
                }),
            );
            let headless_outcome = headless_runner::run(
                &spec,
                &effective_workspace_root,
                &artifacts_root,
                &mut debug_feed,
            )?;
            passed &= headless_outcome.passed;
            step_results.extend(headless_outcome.step_results);
            messages.push(format!("headless: {}", headless_outcome.message));
            debug_feed.record_runtime_activity(
                "runner_finished",
                "Headless stage completed",
                serde_json::json!({
                    "runner": "headless",
                    "passed": headless_outcome.passed,
                }),
            );

            let native_outcome = native_runner::run(
                &spec,
                &effective_workspace_root,
                &artifacts_root,
                &mut debug_feed,
            )?;
            passed &= native_outcome.passed;
            step_results.extend(native_outcome.step_results);
            messages.push(format!("native: {}", native_outcome.message));
            debug_feed.record_runtime_activity(
                "runner_finished",
                "Native stage completed",
                serde_json::json!({
                    "runner": "native",
                    "passed": native_outcome.passed,
                }),
            );
        }
    }

    if let Some(cloned) = &cloned_workspace {
        if !spec.retain_workspace {
            cloned.cleanup()?;
            debug_feed.record_system(
                "workspace_cleaned",
                "Removed ephemeral workspace clone",
                serde_json::json!({}),
            );
            debug_feed.record_runtime_activity(
                "workspace_cleaned",
                "Removed ephemeral workspace clone",
                serde_json::json!({}),
            );
        } else {
            debug_feed.record_system(
                "workspace_retained",
                "Retained ephemeral workspace clone for debugging",
                serde_json::json!({
                    "cloneRoot": cloned.clone_root,
                }),
            );
            debug_feed.record_runtime_activity(
                "workspace_retained",
                "Retained ephemeral workspace clone for debugging",
                serde_json::json!({
                    "cloneRoot": cloned.clone_root,
                }),
            );
        }
    }

    debug_feed.record_runtime_activity(
        "run_finished",
        "GUI automation run finished",
        serde_json::json!({
            "passed": passed,
            "mode": spec.mode,
            "stepCount": step_results.len(),
        }),
    );

    let debug_paths = debug_feed.write_bundle(&artifacts_root)?;

    let artifact_manifest = build_artifact_manifest(&artifacts_root)?;

    let finished_at = Utc::now();

    Ok(GuiRunResult {
        run_id: spec.run_id,
        scenario_name: spec.scenario_name,
        mode: spec.mode,
        started_at,
        finished_at,
        passed,
        message: messages.join("; "),
        workspace_root: spec.workspace_root,
        effective_workspace_root,
        artifacts_root,
        step_results,
        debug_timeline_path: Some(debug_paths.timeline_path),
        debug_summary_path: Some(debug_paths.summary_path),
        artifact_manifest,
    })
}

// DRY:DATA:RunnerOutcome — Shared helper result for automation runners
/// Runner outcome helper shared by headless/native runners.
#[derive(Debug, Clone)]
pub struct RunnerOutcome {
    pub passed: bool,
    pub message: String,
    pub step_results: Vec<GuiStepResult>,
}

// DRY:FN:validate_workspace_isolation
fn validate_workspace_isolation(isolation: WorkspaceIsolation, full_action: bool) -> Result<()> {
    match isolation {
        WorkspaceIsolation::EphemeralClone => Ok(()),
        WorkspaceIsolation::SameWorkspaceWithBackups => bail!(
            "workspaceIsolation=sameWorkspaceWithBackups is not implemented yet; use ephemeralClone (fullAction={full_action})"
        ),
        WorkspaceIsolation::InPlaceDirect => bail!(
            "workspaceIsolation=inPlaceDirect is not implemented yet; use ephemeralClone (fullAction={full_action})"
        ),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_workspace() -> tempfile::TempDir {
        let temp = tempfile::tempdir().expect("tempdir");
        std::fs::write(temp.path().join("README.md"), "gui automation workspace")
            .expect("workspace seed");
        temp
    }

    #[test]
    fn unsupported_workspace_isolation_modes_fail_fast() {
        let workspace = make_workspace();
        let artifacts = tempfile::tempdir().expect("tempdir");

        for isolation in [
            WorkspaceIsolation::SameWorkspaceWithBackups,
            WorkspaceIsolation::InPlaceDirect,
        ] {
            let spec = GuiRunSpec {
                scenario_name: "unsupported-isolation".to_string(),
                mode: GuiRunMode::Headless,
                full_action: false,
                workspace_root: workspace.path().to_path_buf(),
                artifacts_root: artifacts.path().to_path_buf(),
                workspace_isolation: isolation,
                capture_full_bundle: false,
                steps: vec![GuiStep {
                    id: "nav-dashboard".to_string(),
                    action: GuiAction::Navigate {
                        page: "dashboard".to_string(),
                    },
                    assertions: Vec::new(),
                    timeout_ms: None,
                }],
                ..GuiRunSpec::default()
            };

            let err = run_gui_automation(spec)
                .expect_err("unsupported isolation should fail")
                .to_string();
            assert!(
                err.contains("not implemented yet"),
                "unexpected error: {}",
                err
            );
        }
    }

    #[test]
    fn run_emits_backend_and_log_debug_events() {
        let workspace = make_workspace();
        let artifacts = tempfile::tempdir().expect("tempdir");

        let spec = GuiRunSpec {
            scenario_name: "debug-feed-runtime-events".to_string(),
            mode: GuiRunMode::Headless,
            full_action: false,
            workspace_root: workspace.path().to_path_buf(),
            artifacts_root: artifacts.path().to_path_buf(),
            workspace_isolation: WorkspaceIsolation::EphemeralClone,
            capture_full_bundle: false,
            steps: vec![GuiStep {
                id: "nav-dashboard".to_string(),
                action: GuiAction::Navigate {
                    page: "dashboard".to_string(),
                },
                assertions: Vec::new(),
                timeout_ms: None,
            }],
            ..GuiRunSpec::default()
        };

        let result = run_gui_automation(spec).expect("run_gui_automation");
        let timeline = result.debug_timeline_path.as_ref().expect("timeline path");
        let content = std::fs::read_to_string(timeline).expect("timeline readable");

        let events: Vec<DebugFeedEvent> = content
            .lines()
            .filter(|line| !line.trim().is_empty())
            .map(|line| serde_json::from_str(line).expect("timeline event parse"))
            .collect();

        assert!(
            events
                .iter()
                .any(|event| matches!(event.source, DebugSource::BackendEvent)),
            "expected at least one backend event source in debug feed"
        );
        assert!(
            events
                .iter()
                .any(|event| matches!(event.source, DebugSource::Log)),
            "expected at least one log source in debug feed"
        );
    }
}
