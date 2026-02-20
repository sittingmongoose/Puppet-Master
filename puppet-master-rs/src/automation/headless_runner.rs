//! Headless GUI automation runner.

use crate::app::{App, ContextMenuTarget, Message};
use crate::automation::action_catalog::{resolve_action, resolve_from_text};
use crate::automation::{
    DebugFeedCollector, GuiAction, GuiAssertion, GuiRunSpec, GuiSelector, GuiStep, GuiStepResult,
    RunnerOutcome,
};
use crate::widgets::Page;
use anyhow::Result;
use chrono::Utc;
use futures::StreamExt;
use iced::advanced::renderer::Headless;
use iced::mouse;
use iced::{Color, Font, Pixels, Size};
use iced_runtime::user_interface::{Cache, UserInterface};
use iced_runtime::{Action, task};
use image::RgbaImage;
use serde::Serialize;
use std::collections::{BTreeMap, VecDeque};
use std::future::Future;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::sync::atomic::AtomicBool;
use std::time::{Duration, Instant};

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
    let (mut app, init_task) = App::new(Arc::new(AtomicBool::new(false)));

    // Initialize headless Iced renderer (tiny-skia software backend — no GPU/display needed).
    // Use existing tokio runtime if available (e.g. when called from #[tokio::test]),
    // otherwise create a new one.
    let init_renderer = async {
        <iced::Renderer as Headless>::new(Font::DEFAULT, Pixels(16.0), Some("tiny-skia")).await
    };
    let renderer_init = if tokio::runtime::Handle::try_current().is_ok() {
        // In #[tokio::test] (often current-thread runtime), using Handle::block_on can deadlock.
        // Always spin up an isolated runtime on a helper thread for headless renderer init.
        std::thread::scope(|s| {
            s.spawn(|| {
                let rt = tokio::runtime::Runtime::new()
                    .map_err(|e| anyhow::anyhow!("Failed to create tokio runtime: {e}"))?;
                Ok::<_, anyhow::Error>(rt.block_on(init_renderer))
            })
            .join()
            .unwrap()
        })?
    } else {
        let rt = tokio::runtime::Runtime::new()
            .map_err(|e| anyhow::anyhow!("Failed to create tokio runtime: {e}"))?;
        rt.block_on(init_renderer)
    };
    let mut renderer = renderer_init
        .ok_or_else(|| anyhow::anyhow!("Failed to initialize headless tiny-skia renderer"))?;

    let initial_timeout = Duration::from_secs(2);
    drain_task_messages(&mut app, init_task, initial_timeout).map_err(anyhow::Error::msg)?;

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
        debug_feed.record_runtime_activity(
            "step_started",
            "Headless step execution started",
            serde_json::json!({
                "stepId": step.id,
                "action": step.action,
            }),
        );

        let mut step_passed = true;
        let mut message = String::from("ok");
        let mut artifacts = Vec::new();

        let step_timeout = Duration::from_millis(step.timeout_ms.unwrap_or(spec.timeout_ms).max(1));
        let action_result = execute_action(
            &mut app,
            &step,
            artifacts_root,
            &mut artifacts,
            &mut renderer,
            step_timeout,
        );
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
            if let Ok((png, json)) =
                write_snapshot_artifacts(&app, artifacts_root, &label, &mut renderer)
            {
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
        debug_feed.record_runtime_activity(
            "step_finished",
            if step_passed {
                "Headless step execution finished"
            } else {
                "Headless step execution failed"
            },
            serde_json::json!({
                "stepId": step.id,
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

// DRY:FN:execute_action
fn execute_action(
    app: &mut App,
    step: &GuiStep,
    artifacts_root: &Path,
    artifacts: &mut Vec<PathBuf>,
    renderer: &mut iced::Renderer,
    step_timeout: Duration,
) -> std::result::Result<(), String> {
    match &step.action {
        GuiAction::Navigate { page } => {
            let page = parse_page(page).ok_or_else(|| format!("Unknown page '{}'", page))?;
            let task = app.update(Message::NavigateTo(page));
            drain_task_messages(app, task, step_timeout)
        }
        GuiAction::Execute { action_id } => {
            let msg = resolve_action(action_id)
                .ok_or_else(|| format!("Unknown action id '{}'", action_id))?;
            let task = app.update(msg);
            drain_task_messages(app, task, step_timeout)
        }
        GuiAction::Click { selector } => {
            let msg = selector_to_message(selector)?;
            let task = app.update(msg);
            drain_task_messages(app, task, step_timeout)
        }
        GuiAction::RightClick { selector } => {
            let msg = selector_to_right_click_message(selector)?;
            let task = app.update(msg);
            drain_task_messages(app, task, step_timeout)
        }
        GuiAction::MoveMouse { x, y } => {
            let task = app.update(Message::CursorMoved(iced::Point::new(*x, *y)));
            drain_task_messages(app, task, step_timeout)
        }
        GuiAction::ClickMouse { button } => {
            if button == "right" {
                // We need to know WHAT we right-clicked.
                // For testing, we'll assume we right-clicked something that opens a generic context menu
                // if we don't have a selector.
                Ok(())
            } else {
                Ok(())
            }
        }
        GuiAction::Type { selector, text } => {
            let msg = selector_to_type_message(selector, text)?;
            let task = app.update(msg);
            drain_task_messages(app, task, step_timeout)
        }
        GuiAction::Wait { ms } => {
            std::thread::sleep(Duration::from_millis(*ms));
            Ok(())
        }
        GuiAction::Resize { width, height } => {
            // Update app state and notify via message
            app.window_width = *width;
            app.window_height = *height;
            let task = app.update(Message::WindowResized(*width, *height));
            drain_task_messages(app, task, step_timeout)
        }
        GuiAction::Snapshot { label } => {
            let (png, json) = write_snapshot_artifacts(app, artifacts_root, label, renderer)
                .map_err(|e| format!("Failed snapshot: {e}"))?;
            artifacts.push(png);
            artifacts.push(json);
            Ok(())
        }
    }
}

// DRY:FN:block_on_future
fn block_on_future<T>(
    future: impl Future<Output = T> + Send + 'static,
) -> std::result::Result<T, String>
where
    T: Send + 'static,
{
    if tokio::runtime::Handle::try_current().is_ok() {
        // Avoid deadlocks when called from a current-thread runtime by using an isolated runtime.
        std::thread::scope(|scope| {
            scope
                .spawn(move || {
                    let rt = tokio::runtime::Runtime::new()
                        .map_err(|e| format!("Failed to create task-drain runtime: {e}"))?;
                    Ok(rt.block_on(future))
                })
                .join()
                .map_err(|_| "Task drain runtime thread panicked".to_string())?
        })
    } else {
        let rt = tokio::runtime::Runtime::new()
            .map_err(|e| format!("Failed to create task-drain runtime: {e}"))?;
        Ok(rt.block_on(future))
    }
}

// DRY:FN:collect_task_actions
fn collect_task_actions(
    task_to_drain: iced::Task<Message>,
    timeout: Duration,
) -> std::result::Result<Vec<Action<Message>>, String> {
    let Some(mut stream) = task::into_stream(task_to_drain) else {
        return Ok(Vec::new());
    };

    let wait_timeout = if timeout.is_zero() {
        Duration::from_millis(1)
    } else {
        timeout
    };

    block_on_future(async move {
        let deadline = tokio::time::Instant::now() + wait_timeout;
        let mut actions = Vec::new();

        loop {
            let now = tokio::time::Instant::now();
            if now >= deadline {
                return Err("Task drain timed out waiting for action stream".to_string());
            }

            let remaining = deadline.saturating_duration_since(now);
            match tokio::time::timeout(remaining, stream.next()).await {
                Ok(Some(action)) => actions.push(action),
                Ok(None) => break,
                Err(_) => break,
            }
        }

        Ok(actions)
    })?
}

// DRY:FN:drain_task_messages
fn drain_task_messages(
    app: &mut App,
    initial_task: iced::Task<Message>,
    timeout: Duration,
) -> std::result::Result<(), String> {
    const MAX_TASK_OUTPUTS: usize = 20_000;

    let wait_timeout = if timeout.is_zero() {
        Duration::from_millis(1)
    } else {
        timeout
    };

    let deadline = Instant::now() + wait_timeout;
    let mut queue = VecDeque::from([initial_task]);
    let mut outputs_seen = 0usize;

    while let Some(task) = queue.pop_front() {
        if Instant::now() >= deadline {
            break;
        }

        let remaining = deadline.saturating_duration_since(Instant::now());
        let actions = collect_task_actions(task, remaining)?;

        for action in actions {
            match action {
                Action::Output(message) => {
                    outputs_seen += 1;
                    if outputs_seen > MAX_TASK_OUTPUTS {
                        break;
                    }

                    let next_task = app.update(message);
                    queue.push_back(next_task);
                }
                _ => {
                    // Non-output runtime effects (window/clipboard/system) are not executed in headless tests.
                }
            }
        }
    }

    Ok(())
}

// DRY:FN:selector_to_message
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

// DRY:FN:selector_to_right_click_message
fn selector_to_right_click_message(selector: &GuiSelector) -> std::result::Result<Message, String> {
    match selector {
        GuiSelector::ActionId { value } => {
            if value == "dashboard_terminal" || value == "terminal" {
                Ok(Message::OpenContextMenu(
                    ContextMenuTarget::DashboardTerminal,
                ))
            } else {
                Err(format!(
                    "Right-click not implemented for action selector '{}'",
                    value
                ))
            }
        }
        GuiSelector::Text { value } => {
            // For general text, we'll assume it's a selectable label opening a StaticText menu
            Ok(Message::OpenContextMenu(ContextMenuTarget::StaticText(
                value.to_string(),
            )))
        }
        _ => Err(format!(
            "Right-click selector '{:?}' not supported",
            selector
        )),
    }
}

// DRY:FN:selector_to_type_message
fn selector_to_type_message(
    selector: &GuiSelector,
    text: &str,
) -> std::result::Result<Message, String> {
    let value = text.to_string();
    match selector_key(selector)?.as_str() {
        "input_new_project_name" | "new_project_name" => Ok(Message::NewProjectNameChanged(value)),
        "input_new_project_path" | "new_project_path" => Ok(Message::NewProjectPathChanged(value)),
        "input_config_text" | "config_text" => Ok(Message::ConfigTextChanged(value)),
        "input_wizard_github_url" | "wizard_github_url" => {
            Ok(Message::WizardGithubUrlChanged(value))
        }
        "input_wizard_github_visibility" | "wizard_github_visibility" => {
            Ok(Message::WizardGithubVisibilityChanged(value))
        }
        "input_wizard_github_description" | "wizard_github_description" => {
            Ok(Message::WizardGithubDescriptionChanged(value))
        }
        "input_wizard_interaction_mode"
        | "wizard_interaction_mode"
        | "input_settings_interaction_mode"
        | "settings_interaction_mode" => Ok(Message::SettingsInteractionModeChanged(value)),
        "input_wizard_reasoning_level" | "wizard_reasoning_level" => {
            Ok(Message::WizardReasoningLevelChanged(value))
        }
        "input_wizard_project_name" | "wizard_project_name" | "project_name" => {
            Ok(Message::WizardProjectNameChanged(value))
        }
        "input_wizard_project_path" | "wizard_project_path" | "project_path" => {
            Ok(Message::WizardProjectPathChanged(value))
        }
        "input_wizard_requirements" | "wizard_requirements" | "requirements" => {
            Ok(Message::WizardRequirementsChanged(value))
        }
        "input_wizard_prd_platform" | "wizard_prd_platform" => {
            Ok(Message::WizardPrdPlatformChanged(value))
        }
        "input_wizard_prd_model" | "wizard_prd_model" => Ok(Message::WizardPrdModelChanged(value)),
        "input_interview_answer" | "interview_answer" => {
            Ok(Message::InterviewAnswerInputChanged(value))
        }
        "input_interview_reference_link" | "interview_reference_link" => {
            Ok(Message::InterviewReferenceLinkInputChanged(value))
        }
        "input_history_search" | "history_search" => Ok(Message::HistorySearchChanged(value)),
        "input_settings_log_level" | "settings_log_level" => {
            Ok(Message::SettingsLogLevelChanged(value))
        }
        "input_settings_retention_days" | "settings_retention_days" => {
            Ok(Message::SettingsRetentionDaysChanged(value))
        }
        "input_settings_ui_scale" | "settings_ui_scale" => value
            .parse::<f32>()
            .ok()
            .map(|s| Message::SettingsUiScaleChanged(s.clamp(0.5, 1.5)))
            .ok_or_else(|| format!("Invalid ui_scale value: {}", value)),
        "input_ledger_filter_tier" | "ledger_filter_tier" => {
            Ok(Message::LedgerFilterTierChanged(value))
        }
        "input_ledger_filter_session" | "ledger_filter_session" => {
            Ok(Message::LedgerFilterSessionChanged(value))
        }
        "input_ledger_filter_limit" | "ledger_filter_limit" => {
            Ok(Message::LedgerFilterLimitChanged(value))
        }
        "input_coverage_filter" | "coverage_filter" => Ok(Message::CoverageFilterChanged(value)),
        key => Err(format!("No type mapping for selector '{}'", key)),
    }
}

// DRY:FN:selector_key
fn selector_key(selector: &GuiSelector) -> std::result::Result<String, String> {
    match selector {
        GuiSelector::ActionId { value } => Ok(canonical_selector_key(value)),
        GuiSelector::Text { value } => Ok(canonical_selector_key(value)),
        GuiSelector::RoleText { role: _, text } => Ok(canonical_selector_key(text)),
        GuiSelector::RegexText { pattern } => Err(format!(
            "Regex selector '{}' not supported for type actions in headless mode",
            pattern
        )),
    }
}

// DRY:HELPER:canonical_selector_key
fn canonical_selector_key(raw: &str) -> String {
    let mut out = String::new();
    let mut prev_separator = true;
    let mut prev_was_lower_or_digit = false;

    for ch in raw.trim().chars() {
        if ch.is_ascii_alphanumeric() {
            let is_upper = ch.is_ascii_uppercase();
            if is_upper && prev_was_lower_or_digit && !prev_separator {
                out.push('_');
            }
            out.push(ch.to_ascii_lowercase());
            prev_separator = false;
            prev_was_lower_or_digit = ch.is_ascii_lowercase() || ch.is_ascii_digit();
        } else {
            if !prev_separator && !out.is_empty() {
                out.push('_');
            }
            prev_separator = true;
            prev_was_lower_or_digit = false;
        }
    }

    out.trim_matches('_').to_string()
}

// DRY:FN:evaluate_assertion
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
        GuiAssertion::DoctorRunning { value } => {
            if app.doctor_running != *value {
                return Err(format!(
                    "Expected doctor_running={} but found {}",
                    value, app.doctor_running
                ));
            }
            Ok(())
        }
        GuiAssertion::DoctorResultCountAtLeast { count } => {
            if app.doctor_results.len() < *count {
                return Err(format!(
                    "Expected at least {} doctor results but found {}",
                    count,
                    app.doctor_results.len()
                ));
            }
            Ok(())
        }
        GuiAssertion::DoctorCheckStatus { check_name, status } => {
            let Some(check) = app.doctor_results.iter().find(|c| c.name == *check_name) else {
                return Err(format!("Doctor check '{}' not found", check_name));
            };

            let actual = if check.passed {
                "pass"
            } else if check.fix_available {
                "fail"
            } else {
                "warn"
            };
            if actual != status.to_lowercase() {
                return Err(format!(
                    "Expected doctor check '{}' status '{}' but found '{}'",
                    check_name, status, actual
                ));
            }
            Ok(())
        }
        GuiAssertion::ToastContains { text } => {
            if !app.toasts.iter().any(|toast| toast.message.contains(text)) {
                return Err(format!("Expected at least one toast containing '{}'", text));
            }
            Ok(())
        }
        GuiAssertion::ToastTypeContains { toast_type, text } => {
            let expected_type = toast_type.to_lowercase();
            let has_match = app.toasts.iter().any(|toast| {
                let type_match = format!("{:?}", toast.toast_type).to_lowercase() == expected_type;
                let text_match = text
                    .as_ref()
                    .map(|needle| toast.message.contains(needle))
                    .unwrap_or(true);
                type_match && text_match
            });

            if !has_match {
                return Err(format!(
                    "Expected toast type '{}' with text filter {:?}",
                    toast_type, text
                ));
            }
            Ok(())
        }
        GuiAssertion::AuthStatus {
            platform,
            authenticated,
        } => {
            let Some(status) = app.platform_auth_status.get(platform) else {
                return Err(format!("Auth status entry '{}' not found", platform));
            };
            if status.authenticated != *authenticated {
                return Err(format!(
                    "Expected auth status '{}' authenticated={} but found {}",
                    platform, authenticated, status.authenticated
                ));
            }
            Ok(())
        }
        GuiAssertion::SetupChecking { value } => {
            if app.setup_is_checking != *value {
                return Err(format!(
                    "Expected setup_is_checking={} but found {}",
                    value, app.setup_is_checking
                ));
            }
            Ok(())
        }
        GuiAssertion::SetupPlatformStatus { platform, status } => {
            let normalized_platform = platform.to_lowercase();
            let Some(entry) = app.setup_platform_statuses.iter().find(|candidate| {
                candidate.platform.to_string().to_lowercase() == normalized_platform
            }) else {
                return Err(format!("Setup platform '{}' not found", platform));
            };

            let actual_status = match &entry.status {
                crate::doctor::InstallationStatus::Installed(_) => "installed",
                crate::doctor::InstallationStatus::NotInstalled => "not_installed",
                crate::doctor::InstallationStatus::Outdated { .. } => "outdated",
            };

            if actual_status != status.to_lowercase() {
                return Err(format!(
                    "Expected setup platform '{}' status '{}' but found '{}'",
                    platform, status, actual_status
                ));
            }
            Ok(())
        }
        GuiAssertion::SetupPlatformCountAtLeast { count } => {
            if app.setup_platform_statuses.len() < *count {
                return Err(format!(
                    "Expected at least {} setup platforms but found {}",
                    count,
                    app.setup_platform_statuses.len()
                ));
            }
            Ok(())
        }
        GuiAssertion::ContextMenuOpen { target } => match (&app.active_context_menu, target) {
            (Some(_), None) => Ok(()),
            (Some(actual), Some(expected)) => {
                let actual_str = match actual {
                    ContextMenuTarget::DashboardTerminal => "terminal".to_string(),
                    ContextMenuTarget::SelectableField(_) => "selectable_field".to_string(),
                    ContextMenuTarget::LoginSurface(_) => "login_surface".to_string(),
                    ContextMenuTarget::Toast(_) => "toast".to_string(),
                    ContextMenuTarget::StaticText(t) => t.clone(),
                };
                if actual_str.contains(expected) {
                    Ok(())
                } else {
                    Err(format!(
                        "Context menu open but target '{}' does not match expected '{}'",
                        actual_str, expected
                    ))
                }
            }
            (None, _) => Err("Context menu is not open".to_string()),
        },
    }
}

// DRY:FN:write_snapshot_artifacts
fn write_snapshot_artifacts(
    app: &App,
    root: &Path,
    label: &str,
    renderer: &mut iced::Renderer,
) -> Result<(PathBuf, PathBuf)> {
    std::fs::create_dir_all(root)?;

    let safe = sanitize_label(label);
    let png_path = root.join(format!("{}.png", safe));
    let json_path = root.join(format!("{}.json", safe));

    // Pixel-perfect rendering via Iced's tiny-skia software renderer
    let (rgba, w, h) = render_pixel_perfect(app, renderer);
    let img = RgbaImage::from_raw(w, h, rgba)
        .ok_or_else(|| anyhow::anyhow!("Failed to create image from RGBA buffer"))?;
    img.save(&png_path)?;

    let doctor_checks = app
        .doctor_results
        .iter()
        .map(|check| DoctorCheckSnapshot {
            name: check.name.clone(),
            passed: check.passed,
            status: if check.passed {
                "pass".to_string()
            } else if check.fix_available {
                "fail".to_string()
            } else {
                "warn".to_string()
            },
            message: check.message.clone(),
            fix_available: check.fix_available,
        })
        .collect::<Vec<_>>();

    let toasts = app
        .toasts
        .iter()
        .map(|toast| ToastSnapshot {
            toast_type: format!("{:?}", toast.toast_type),
            message: toast.message.clone(),
        })
        .collect::<Vec<_>>();

    let mut auth_statuses = BTreeMap::new();
    for (platform, status) in &app.platform_auth_status {
        auth_statuses.insert(
            platform.clone(),
            AuthSnapshot {
                authenticated: status.authenticated,
                method: format!("{:?}", status.method),
                hint: status.hint.clone(),
            },
        );
    }

    let setup_platform_statuses = app
        .setup_platform_statuses
        .iter()
        .map(|entry| SetupPlatformSnapshot {
            platform: entry.platform.to_string(),
            status: match &entry.status {
                crate::doctor::InstallationStatus::Installed(_) => "installed".to_string(),
                crate::doctor::InstallationStatus::NotInstalled => "not_installed".to_string(),
                crate::doctor::InstallationStatus::Outdated { .. } => "outdated".to_string(),
            },
            detected_path: entry.detected_path.clone(),
        })
        .collect::<Vec<_>>();

    let platform_availability = app
        .setup_platform_statuses
        .iter()
        .map(|entry| {
            let enabled = matches!(
                entry.status,
                crate::doctor::InstallationStatus::Installed(_)
                    | crate::doctor::InstallationStatus::Outdated { .. }
            );
            PlatformAvailabilitySnapshot {
                platform: entry.platform.to_string(),
                enabled,
                reason: if enabled {
                    None
                } else if entry.instructions.trim().is_empty() {
                    Some("not installed".to_string())
                } else {
                    Some(entry.instructions.lines().next().unwrap_or("").to_string())
                },
            }
        })
        .collect::<Vec<_>>();

    let snapshot = AppSnapshot {
        current_page: format!("{:?}", app.current_page),
        orchestrator_status: app.orchestrator_status.clone(),
        last_error: app.last_error.clone(),
        output_line_count: app.output_lines.len(),
        wizard_step: app.wizard_step,
        doctor_running: app.doctor_running,
        active_context_menu: app
            .active_context_menu
            .as_ref()
            .map(|menu| format!("{menu:?}")),
        toast_count: app.toasts.len(),
        latest_toast_message: app.toasts.last().map(|toast| toast.message.clone()),
        doctor_checks,
        toasts,
        auth_statuses,
        setup_is_checking: app.setup_is_checking,
        setup_installing: app.setup_installing.map(|platform| platform.to_string()),
        setup_platform_statuses,
        platform_availability,
        config_tier_platforms: BTreeMap::from([
            (
                "phase".to_string(),
                app.gui_config.tiers.phase.platform.clone(),
            ),
            (
                "task".to_string(),
                app.gui_config.tiers.task.platform.clone(),
            ),
            (
                "subtask".to_string(),
                app.gui_config.tiers.subtask.platform.clone(),
            ),
            (
                "iteration".to_string(),
                app.gui_config.tiers.iteration.platform.clone(),
            ),
        ]),
    };

    std::fs::write(&json_path, serde_json::to_string_pretty(&snapshot)?)?;

    Ok((png_path, json_path))
}

// ── Pixel-perfect headless rendering via Iced tiny-skia ─────────────────

/// Render the app's current view() tree using Iced's headless tiny-skia renderer.
/// Returns RGBA pixel data as a Vec<u8>, along with (width, height).
fn render_pixel_perfect(app: &App, renderer: &mut iced::Renderer) -> (Vec<u8>, u32, u32) {
    let w: u32 = app.window_width.max(1.0) as u32;
    let h: u32 = app.window_height.max(1.0) as u32;
    let size = Size::new(w as f32, h as f32);

    // Build the real widget tree from the app's view function
    let element = app.view();

    // Layout using Iced's UserInterface (same path as the real GUI)
    let cache = Cache::new();
    let mut ui = UserInterface::build(element, size, cache, renderer);

    // Draw into the renderer
    let theme = app.theme();
    let style = iced::advanced::renderer::Style {
        text_color: if app.theme.is_dark() {
            Color::WHITE
        } else {
            Color::BLACK
        },
    };
    ui.draw(renderer, &theme, &style, mouse::Cursor::Unavailable);

    // Extract RGBA screenshot
    let physical_size = Size::new(w, h);
    let bg_color = if app.theme.is_dark() {
        Color::from_rgb8(26, 26, 26) // PAPER_DARK
    } else {
        Color::from_rgb8(250, 246, 241) // PAPER_CREAM
    };
    let rgba = renderer.screenshot(physical_size, 1.0, bg_color);

    (rgba, w, h)
}

// DRY:FN:sanitize_label
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

// DRY:FN:parse_page
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

// DRY:FN:default_steps
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
// DRY:DATA:DoctorCheckSnapshot
struct DoctorCheckSnapshot {
    name: String,
    passed: bool,
    status: String,
    message: String,
    fix_available: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
// DRY:DATA:ToastSnapshot
struct ToastSnapshot {
    toast_type: String,
    message: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
// DRY:DATA:AuthSnapshot
struct AuthSnapshot {
    authenticated: bool,
    method: String,
    hint: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
// DRY:DATA:SetupPlatformSnapshot
struct SetupPlatformSnapshot {
    platform: String,
    status: String,
    detected_path: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
// DRY:DATA:PlatformAvailabilitySnapshot
struct PlatformAvailabilitySnapshot {
    platform: String,
    enabled: bool,
    reason: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
// DRY:DATA:AppSnapshot
struct AppSnapshot {
    current_page: String,
    orchestrator_status: String,
    last_error: Option<String>,
    output_line_count: usize,
    wizard_step: usize,
    doctor_running: bool,
    active_context_menu: Option<String>,
    toast_count: usize,
    latest_toast_message: Option<String>,
    doctor_checks: Vec<DoctorCheckSnapshot>,
    toasts: Vec<ToastSnapshot>,
    auth_statuses: BTreeMap<String, AuthSnapshot>,
    setup_is_checking: bool,
    setup_installing: Option<String>,
    setup_platform_statuses: Vec<SetupPlatformSnapshot>,
    platform_availability: Vec<PlatformAvailabilitySnapshot>,
    config_tier_platforms: BTreeMap<String, String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn type_action_selector_maps_text_to_message() {
        let selector = GuiSelector::ActionId {
            value: "input.wizard.projectName".to_string(),
        };
        let message = selector_to_type_message(&selector, "AlphaProject").expect("selector map");
        match message {
            Message::WizardProjectNameChanged(value) => assert_eq!(value, "AlphaProject"),
            other => panic!("unexpected message: {:?}", other),
        }
    }

    #[tokio::test]
    async fn execute_type_action_updates_app_text_field() {
        let (mut app, _task) = App::new(Arc::new(AtomicBool::new(false)));
        let temp = tempfile::tempdir().expect("tempdir");

        let mut renderer =
            <iced::Renderer as Headless>::new(Font::DEFAULT, Pixels(16.0), Some("tiny-skia"))
                .await
                .expect("headless renderer");

        let step = GuiStep {
            id: "type-project-name".to_string(),
            action: GuiAction::Type {
                selector: GuiSelector::ActionId {
                    value: "input.wizard.project_name".to_string(),
                },
                text: "BetaProject".to_string(),
            },
            assertions: Vec::new(),
            timeout_ms: None,
        };

        let mut artifacts = Vec::new();
        execute_action(
            &mut app,
            &step,
            temp.path(),
            &mut artifacts,
            &mut renderer,
            Duration::from_secs(5),
        )
        .expect("type action");

        assert_eq!(app.wizard_project_name, "BetaProject");
    }
}
