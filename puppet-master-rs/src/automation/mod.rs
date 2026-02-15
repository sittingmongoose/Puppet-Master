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
    Snapshot { label: String },
}

// DRY:DATA:GuiAssertion — Assertion variants for validating automation steps
/// Assertions evaluated after a step.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum GuiAssertion {
    PageIs { page: String },
    NoLastError,
    OrchestratorStatus { status: String },
    OutputContains { text: String },
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

fn default_workspace_root() -> PathBuf {
    std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
}

fn default_artifacts_root() -> PathBuf {
    PathBuf::from(".puppet-master/evidence/gui-automation")
}

fn default_timeout_ms() -> u64 {
    120_000
}

fn default_true() -> bool {
    true
}

fn normalize_run_id(spec: &mut GuiRunSpec) {
    if !spec.run_id.trim().is_empty() {
        return;
    }

    spec.run_id = format!("GA-{}", Utc::now().format("%Y-%m-%d-%H-%M-%S-%3f"));
}

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

    if spec.full_action && spec.workspace_isolation != WorkspaceIsolation::EphemeralClone {
        bail!(
            "full-action runs require workspaceIsolation=ephemeralClone; got {:?}",
            spec.workspace_isolation
        );
    }

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
            let outcome = headless_runner::run(
                &spec,
                &effective_workspace_root,
                &artifacts_root,
                &mut debug_feed,
            )?;
            passed &= outcome.passed;
            step_results.extend(outcome.step_results);
            messages.push(outcome.message);
        }
        GuiRunMode::Native => {
            let outcome = native_runner::run(
                &spec,
                &effective_workspace_root,
                &artifacts_root,
                &mut debug_feed,
            )?;
            passed &= outcome.passed;
            step_results.extend(outcome.step_results);
            messages.push(outcome.message);
        }
        GuiRunMode::Hybrid => {
            let headless_outcome = headless_runner::run(
                &spec,
                &effective_workspace_root,
                &artifacts_root,
                &mut debug_feed,
            )?;
            passed &= headless_outcome.passed;
            step_results.extend(headless_outcome.step_results);
            messages.push(format!("headless: {}", headless_outcome.message));

            let native_outcome = native_runner::run(
                &spec,
                &effective_workspace_root,
                &artifacts_root,
                &mut debug_feed,
            )?;
            passed &= native_outcome.passed;
            step_results.extend(native_outcome.step_results);
            messages.push(format!("native: {}", native_outcome.message));
        }
    }

    let debug_paths = debug_feed.write_bundle(&artifacts_root)?;

    let artifact_manifest = build_artifact_manifest(&artifacts_root)?;

    if let Some(cloned) = &cloned_workspace {
        if !spec.retain_workspace {
            cloned.cleanup()?;
            debug_feed.record_system(
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
        }
    }

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
