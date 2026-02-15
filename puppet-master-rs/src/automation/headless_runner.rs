//! Headless GUI automation runner.

use crate::app::{App, Message};
use crate::automation::action_catalog::{resolve_action, resolve_from_text};
use crate::automation::{
    DebugFeedCollector, GuiAction, GuiAssertion, GuiRunSpec, GuiSelector, GuiStep, GuiStepResult,
    RunnerOutcome,
};
use crate::widgets::Page;
use anyhow::Result;
use chrono::Utc;
use image::{Rgb, RgbImage};
use serde::Serialize;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::sync::atomic::AtomicBool;
use std::time::Duration;

impl HeadlessRunner {
    // DRY:FN:run
    /// Execute a headless scenario run.
    pub fn run(
        spec: &GuiRunSpec,
        _workspace_root: &Path,
        artifacts_root: &Path,
        debug_feed: &mut DebugFeedCollector,
    ) -> Result<RunnerOutcome> {
        run(spec, _workspace_root, artifacts_root, debug_feed)
    }
}

// DRY:DATA:HeadlessRunner
/// Marker type for namespaced API.
#[derive(Debug, Clone, Copy)]
pub struct HeadlessRunner;

// DRY:FN:run
pub fn run(
    spec: &GuiRunSpec,
    _workspace_root: &Path,
    artifacts_root: &Path,
    debug_feed: &mut DebugFeedCollector,
) -> Result<RunnerOutcome> {
    let (mut app, _task) = App::new(Arc::new(AtomicBool::new(false)));

    let mut passed = true;
    let mut results = Vec::new();

    let steps = if spec.steps.is_empty() {
        default_steps()
    } else {
        spec.steps.clone()
    };

    for step in steps {
        let started_at = Utc::now();
        debug_feed.record_step(
            &step.id,
            "step_started",
            "Step execution started",
            serde_json::json!({ "action": step.action }),
        );

        let mut step_passed = true;
        let mut message = String::from("ok");
        let mut artifacts = Vec::new();

        let action_result = execute_action(&mut app, &step, artifacts_root, &mut artifacts);
        if let Err(err) = action_result {
            step_passed = false;
            message = err;
        }

        if step_passed {
            for assertion in &step.assertions {
                if let Err(err) = evaluate_assertion(&app, assertion) {
                    step_passed = false;
                    message = err;
                    break;
                }
            }
        }

        if spec.capture_full_bundle {
            let label = format!("{}_auto", step.id);
            if let Ok((png, json)) = write_snapshot_artifacts(&app, artifacts_root, &label) {
                artifacts.push(png);
                artifacts.push(json);
            }
        }

        let finished_at = Utc::now();
        debug_feed.record_step(
            &step.id,
            "step_finished",
            if step_passed {
                "Step execution finished"
            } else {
                "Step execution failed"
            },
            serde_json::json!({
                "passed": step_passed,
                "message": message,
                "artifacts": artifacts,
            }),
        );

        if !step_passed {
            passed = false;
        }

        results.push(GuiStepResult {
            id: step.id,
            passed: step_passed,
            message,
            started_at,
            finished_at,
            artifacts,
        });
    }

    Ok(RunnerOutcome {
        passed,
        message: if passed {
            "headless scenario completed".to_string()
        } else {
            "headless scenario completed with failures".to_string()
        },
        step_results: results,
    })
}

fn execute_action(
    app: &mut App,
    step: &GuiStep,
    artifacts_root: &Path,
    artifacts: &mut Vec<PathBuf>,
) -> std::result::Result<(), String> {
    match &step.action {
        GuiAction::Navigate { page } => {
            let page = parse_page(page).ok_or_else(|| format!("Unknown page '{}'", page))?;
            let _ = app.update(Message::NavigateTo(page));
            Ok(())
        }
        GuiAction::Execute { action_id } => {
            let msg = resolve_action(action_id)
                .ok_or_else(|| format!("Unknown action id '{}'", action_id))?;
            let _ = app.update(msg);
            Ok(())
        }
        GuiAction::Click { selector } => {
            let msg = selector_to_message(selector)?;
            let _ = app.update(msg);
            Ok(())
        }
        GuiAction::Type { selector, text: _ } => {
            // Current implementation maps type actions to known selectors where possible.
            // Freeform text entry support can be added incrementally with field-level action IDs.
            let msg = selector_to_message(selector)?;
            let _ = app.update(msg);
            Ok(())
        }
        GuiAction::Wait { ms } => {
            std::thread::sleep(Duration::from_millis(*ms));
            Ok(())
        }
        GuiAction::Snapshot { label } => {
            let (png, json) = write_snapshot_artifacts(app, artifacts_root, label)
                .map_err(|e| format!("Failed snapshot: {e}"))?;
            artifacts.push(png);
            artifacts.push(json);
            Ok(())
        }
    }
}

fn selector_to_message(selector: &GuiSelector) -> std::result::Result<Message, String> {
    match selector {
        GuiSelector::ActionId { value } => {
            resolve_action(value).ok_or_else(|| format!("Unknown action selector '{}'", value))
        }
        GuiSelector::Text { value } => {
            resolve_from_text(value).ok_or_else(|| format!("No mapping for text '{}'", value))
        }
        GuiSelector::RoleText { role: _, text } => {
            resolve_from_text(text).ok_or_else(|| format!("No mapping for role/text '{}'", text))
        }
        GuiSelector::RegexText { pattern } => Err(format!(
            "Regex selector '{}' not supported in headless mode",
            pattern
        )),
    }
}

fn evaluate_assertion(app: &App, assertion: &GuiAssertion) -> std::result::Result<(), String> {
    match assertion {
        GuiAssertion::PageIs { page } => {
            let expected = parse_page(page).ok_or_else(|| format!("Unknown page '{}'", page))?;
            if app.current_page != expected {
                return Err(format!(
                    "Expected page {:?} but found {:?}",
                    expected, app.current_page
                ));
            }
            Ok(())
        }
        GuiAssertion::NoLastError => {
            if let Some(err) = &app.last_error {
                return Err(format!("Expected no last error but found: {}", err));
            }
            Ok(())
        }
        GuiAssertion::OrchestratorStatus { status } => {
            if app.orchestrator_status.to_lowercase() != status.to_lowercase() {
                return Err(format!(
                    "Expected orchestrator status '{}' but found '{}'",
                    status, app.orchestrator_status
                ));
            }
            Ok(())
        }
        GuiAssertion::OutputContains { text } => {
            if !app.output_lines.iter().any(|line| line.text.contains(text)) {
                return Err(format!("Expected output to contain '{}'", text));
            }
            Ok(())
        }
    }
}

fn write_snapshot_artifacts(app: &App, root: &Path, label: &str) -> Result<(PathBuf, PathBuf)> {
    std::fs::create_dir_all(root)?;

    let safe = sanitize_label(label);
    let png_path = root.join(format!("{}.png", safe));
    let json_path = root.join(format!("{}.json", safe));

    let mut image = RgbImage::new(1280, 720);
    for pixel in image.pixels_mut() {
        *pixel = Rgb([20, 24, 30]);
    }
    image.save(&png_path)?;

    let snapshot = AppSnapshot {
        current_page: format!("{:?}", app.current_page),
        orchestrator_status: app.orchestrator_status.clone(),
        last_error: app.last_error.clone(),
        output_line_count: app.output_lines.len(),
        wizard_step: app.wizard_step,
        doctor_running: app.doctor_running,
    };

    std::fs::write(&json_path, serde_json::to_string_pretty(&snapshot)?)?;

    Ok((png_path, json_path))
}

fn sanitize_label(value: &str) -> String {
    value
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '-' || c == '_' {
                c
            } else {
                '_'
            }
        })
        .collect()
}

fn parse_page(page: &str) -> Option<Page> {
    match page.trim().to_lowercase().as_str() {
        "dashboard" => Some(Page::Dashboard),
        "projects" => Some(Page::Projects),
        "wizard" => Some(Page::Wizard),
        "config" => Some(Page::Config),
        "doctor" => Some(Page::Doctor),
        "tiers" => Some(Page::Tiers),
        "evidence" => Some(Page::Evidence),
        "metrics" => Some(Page::Metrics),
        "history" => Some(Page::History),
        "coverage" => Some(Page::Coverage),
        "memory" => Some(Page::Memory),
        "ledger" => Some(Page::Ledger),
        "login" => Some(Page::Login),
        "settings" => Some(Page::Settings),
        "setup" => Some(Page::Setup),
        "interview" => Some(Page::Interview),
        _ => None,
    }
}

fn default_steps() -> Vec<GuiStep> {
    vec![
        GuiStep {
            id: "nav-dashboard".to_string(),
            action: GuiAction::Navigate {
                page: "dashboard".to_string(),
            },
            assertions: vec![GuiAssertion::PageIs {
                page: "dashboard".to_string(),
            }],
            timeout_ms: None,
        },
        GuiStep {
            id: "nav-wizard".to_string(),
            action: GuiAction::Navigate {
                page: "wizard".to_string(),
            },
            assertions: vec![GuiAssertion::PageIs {
                page: "wizard".to_string(),
            }],
            timeout_ms: None,
        },
    ]
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct AppSnapshot {
    current_page: String,
    orchestrator_status: String,
    last_error: Option<String>,
    output_line_count: usize,
    wizard_step: usize,
    doctor_running: bool,
}
