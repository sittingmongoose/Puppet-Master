use puppet_master::automation::{
    GuiAction, GuiAssertion, GuiRunMode, GuiRunSpec, GuiStep, WorkspaceIsolation,
    run_gui_automation,
};
use serde_json::Value;
use std::fs;

fn login_context_cycle_steps(prefix: &str, context_action_id: &str) -> Vec<GuiStep> {
    vec![
        GuiStep {
            id: format!("open-{}-context", prefix),
            action: GuiAction::Execute {
                action_id: context_action_id.to_string(),
            },
            assertions: Vec::new(),
            timeout_ms: None,
        },
        GuiStep {
            id: format!("{}-copy", prefix),
            action: GuiAction::Execute {
                action_id: "context.copy".to_string(),
            },
            assertions: Vec::new(),
            timeout_ms: None,
        },
        GuiStep {
            id: format!("{}-select-all", prefix),
            action: GuiAction::Execute {
                action_id: "context.select_all".to_string(),
            },
            assertions: Vec::new(),
            timeout_ms: None,
        },
        GuiStep {
            id: format!("{}-paste", prefix),
            action: GuiAction::Execute {
                action_id: "context.paste_mock".to_string(),
            },
            assertions: Vec::new(),
            timeout_ms: None,
        },
    ]
}

#[test]
fn test_headless_automation_run() {
    let temp = tempfile::tempdir().expect("tempdir");

    let spec = GuiRunSpec {
        scenario_name: "headless-test".to_string(),
        mode: GuiRunMode::Headless,
        full_action: false,
        workspace_root: std::env::current_dir().expect("cwd"),
        artifacts_root: temp.path().to_path_buf(),
        workspace_isolation: WorkspaceIsolation::EphemeralClone,
        capture_full_bundle: true,
        steps: vec![
            GuiStep {
                id: "goto-dashboard".to_string(),
                action: GuiAction::Navigate {
                    page: "dashboard".to_string(),
                },
                assertions: vec![GuiAssertion::PageIs {
                    page: "dashboard".to_string(),
                }],
                timeout_ms: None,
            },
            GuiStep {
                id: "goto-wizard".to_string(),
                action: GuiAction::Navigate {
                    page: "wizard".to_string(),
                },
                assertions: vec![GuiAssertion::PageIs {
                    page: "wizard".to_string(),
                }],
                timeout_ms: None,
            },
        ],
        ..GuiRunSpec::default()
    };

    let result = run_gui_automation(spec).expect("run_gui_automation should succeed");

    assert!(
        result.passed,
        "headless run should pass: {}",
        result.message
    );
    assert!(!result.step_results.is_empty());
    assert!(!result.artifact_manifest.entries.is_empty());
    assert!(result.debug_timeline_path.is_some());
    assert!(result.debug_summary_path.is_some());
}

#[test]
fn login_context_menu_actions_are_automated_in_headless_mode() {
    let temp = tempfile::tempdir().expect("tempdir");
    let mut steps = vec![GuiStep {
        id: "goto-login".to_string(),
        action: GuiAction::Navigate {
            page: "login".to_string(),
        },
        assertions: vec![GuiAssertion::PageIs {
            page: "login".to_string(),
        }],
        timeout_ms: None,
    }];

    for (prefix, action_id) in [
        ("summary", "login.context.summary"),
        ("cursor", "login.context.cursor"),
        ("codex", "login.context.codex"),
        ("claude", "login.context.claude"),
        ("gemini", "login.context.gemini"),
        ("copilot", "login.context.copilot"),
        ("github", "login.context.github"),
        ("git", "login.context.git"),
        ("cli", "login.context.cli"),
    ] {
        steps.extend(login_context_cycle_steps(prefix, action_id));
    }

    steps.push(GuiStep {
        id: "final-snapshot".to_string(),
        action: GuiAction::Snapshot {
            label: "login-context-state".to_string(),
        },
        assertions: Vec::new(),
        timeout_ms: None,
    });

    let spec = GuiRunSpec {
        scenario_name: "login-context-menu".to_string(),
        mode: GuiRunMode::Headless,
        full_action: false,
        workspace_root: std::env::current_dir().expect("cwd"),
        artifacts_root: temp.path().to_path_buf(),
        workspace_isolation: WorkspaceIsolation::EphemeralClone,
        capture_full_bundle: true,
        steps,
        ..GuiRunSpec::default()
    };

    let result = run_gui_automation(spec).expect("run_gui_automation should succeed");
    assert!(
        result.passed,
        "login context run should pass: {}",
        result.message
    );

    let snapshot_path = result.artifacts_root.join("login-context-state.json");
    let snapshot_raw = fs::read_to_string(&snapshot_path).expect("snapshot json");
    let snapshot: Value = serde_json::from_str(&snapshot_raw).expect("valid snapshot json");

    let menu = snapshot
        .get("activeContextMenu")
        .and_then(|v| v.as_str())
        .unwrap_or_default();
    assert!(
        menu.contains("LoginSurface"),
        "expected active login context menu, got: {}",
        menu
    );

    let toast_count = snapshot
        .get("toastCount")
        .and_then(|v| v.as_u64())
        .unwrap_or(0);
    assert!(toast_count >= 24, "expected many context-menu toasts");

    let latest_toast = snapshot
        .get("latestToastMessage")
        .and_then(|v| v.as_str())
        .unwrap_or_default();
    assert!(
        latest_toast.contains("Paste is disabled for read-only login text"),
        "expected read-only paste guard toast, got: {}",
        latest_toast
    );
}

#[test]
fn toast_context_menu_actions_are_automated_in_headless_mode() {
    let temp = tempfile::tempdir().expect("tempdir");

    let spec = GuiRunSpec {
        scenario_name: "toast-context-menu".to_string(),
        mode: GuiRunMode::Headless,
        full_action: false,
        workspace_root: std::env::current_dir().expect("cwd"),
        artifacts_root: temp.path().to_path_buf(),
        workspace_isolation: WorkspaceIsolation::EphemeralClone,
        capture_full_bundle: true,
        steps: vec![
            GuiStep {
                id: "goto-login".to_string(),
                action: GuiAction::Navigate {
                    page: "login".to_string(),
                },
                assertions: vec![GuiAssertion::PageIs {
                    page: "login".to_string(),
                }],
                timeout_ms: None,
            },
            GuiStep {
                id: "open-login-summary-context".to_string(),
                action: GuiAction::Execute {
                    action_id: "login.context.summary".to_string(),
                },
                assertions: Vec::new(),
                timeout_ms: None,
            },
            GuiStep {
                id: "trigger-read-only-login-paste-toast".to_string(),
                action: GuiAction::Execute {
                    action_id: "context.paste_mock".to_string(),
                },
                assertions: vec![GuiAssertion::ToastContains {
                    text: "Paste is disabled for read-only login text.".to_string(),
                }],
                timeout_ms: None,
            },
            GuiStep {
                id: "open-latest-toast-context".to_string(),
                action: GuiAction::Execute {
                    action_id: "toast.context.latest".to_string(),
                },
                assertions: Vec::new(),
                timeout_ms: None,
            },
            GuiStep {
                id: "copy-toast-text".to_string(),
                action: GuiAction::Execute {
                    action_id: "context.copy".to_string(),
                },
                assertions: vec![GuiAssertion::ToastContains {
                    text: "Copied to clipboard".to_string(),
                }],
                timeout_ms: None,
            },
            GuiStep {
                id: "select-all-toast-text".to_string(),
                action: GuiAction::Execute {
                    action_id: "context.select_all".to_string(),
                },
                assertions: vec![GuiAssertion::ToastContains {
                    text: "Selected toast text and copied to clipboard".to_string(),
                }],
                timeout_ms: None,
            },
            GuiStep {
                id: "paste-toast-text".to_string(),
                action: GuiAction::Execute {
                    action_id: "context.paste_mock".to_string(),
                },
                assertions: vec![GuiAssertion::ToastContains {
                    text: "Paste is disabled for read-only toast text.".to_string(),
                }],
                timeout_ms: None,
            },
            GuiStep {
                id: "snapshot".to_string(),
                action: GuiAction::Snapshot {
                    label: "toast-context-state".to_string(),
                },
                assertions: Vec::new(),
                timeout_ms: None,
            },
        ],
        ..GuiRunSpec::default()
    };

    let result = run_gui_automation(spec).expect("run_gui_automation should succeed");
    assert!(
        result.passed,
        "toast context run should pass: {}",
        result.message
    );

    let snapshot_path = result.artifacts_root.join("toast-context-state.json");
    let snapshot_raw = fs::read_to_string(&snapshot_path).expect("snapshot json");
    let snapshot: Value = serde_json::from_str(&snapshot_raw).expect("valid snapshot json");

    let menu = snapshot
        .get("activeContextMenu")
        .and_then(|v| v.as_str())
        .unwrap_or_default();
    assert!(
        menu.contains("Toast"),
        "expected active toast context menu, got: {}",
        menu
    );

    let toast_count = snapshot
        .get("toastCount")
        .and_then(|v| v.as_u64())
        .unwrap_or(0);
    assert!(toast_count >= 4, "expected context-menu toasts to be present");

    let latest_toast = snapshot
        .get("latestToastMessage")
        .and_then(|v| v.as_str())
        .unwrap_or_default();
    assert!(
        latest_toast.contains("Paste is disabled for read-only toast text."),
        "unexpected latest toast: {}",
        latest_toast
    );
}

#[test]
fn doctor_run_all_completes_with_async_task_drain_in_headless_mode() {
    let temp = tempfile::tempdir().expect("tempdir");

    let spec = GuiRunSpec {
        scenario_name: "doctor-run-all-async".to_string(),
        mode: GuiRunMode::Headless,
        full_action: false,
        workspace_root: std::env::current_dir().expect("cwd"),
        artifacts_root: temp.path().to_path_buf(),
        workspace_isolation: WorkspaceIsolation::EphemeralClone,
        capture_full_bundle: true,
        steps: vec![
            GuiStep {
                id: "goto-doctor".to_string(),
                action: GuiAction::Navigate {
                    page: "doctor".to_string(),
                },
                assertions: vec![GuiAssertion::PageIs {
                    page: "doctor".to_string(),
                }],
                timeout_ms: Some(30_000),
            },
            GuiStep {
                id: "doctor-run-all".to_string(),
                action: GuiAction::Execute {
                    action_id: "doctor.run_all".to_string(),
                },
                assertions: vec![
                    GuiAssertion::DoctorRunning { value: false },
                    GuiAssertion::DoctorResultCountAtLeast { count: 1 },
                    GuiAssertion::ToastContains {
                        text: "Running".to_string(),
                    },
                ],
                timeout_ms: Some(300_000),
            },
            GuiStep {
                id: "doctor-snapshot".to_string(),
                action: GuiAction::Snapshot {
                    label: "doctor-run-all-state".to_string(),
                },
                assertions: Vec::new(),
                timeout_ms: Some(30_000),
            },
        ],
        ..GuiRunSpec::default()
    };

    let result = run_gui_automation(spec).expect("run_gui_automation should succeed");
    assert!(
        result.passed,
        "doctor run-all scenario should pass: {}",
        result.message
    );

    let snapshot_path = result.artifacts_root.join("doctor-run-all-state.json");
    let snapshot_raw = fs::read_to_string(&snapshot_path).expect("doctor snapshot json");
    let snapshot: Value = serde_json::from_str(&snapshot_raw).expect("valid doctor snapshot json");

    assert_eq!(
        snapshot
            .get("doctorRunning")
            .and_then(|v| v.as_bool())
            .unwrap_or(true),
        false,
        "doctor should be idle after run_all task drain"
    );
    let doctor_checks = snapshot
        .get("doctorChecks")
        .and_then(|v| v.as_array())
        .cloned()
        .unwrap_or_default();
    assert!(
        !doctor_checks.is_empty(),
        "doctor snapshot should include populated check results"
    );
}

#[test]
fn setup_detection_completes_with_platform_statuses_in_headless_mode() {
    let temp = tempfile::tempdir().expect("tempdir");

    let spec = GuiRunSpec {
        scenario_name: "setup-detection".to_string(),
        mode: GuiRunMode::Headless,
        full_action: false,
        workspace_root: std::env::current_dir().expect("cwd"),
        artifacts_root: temp.path().to_path_buf(),
        workspace_isolation: WorkspaceIsolation::EphemeralClone,
        capture_full_bundle: true,
        steps: vec![
            GuiStep {
                id: "goto-setup".to_string(),
                action: GuiAction::Navigate {
                    page: "setup".to_string(),
                },
                assertions: vec![GuiAssertion::PageIs {
                    page: "setup".to_string(),
                }],
                timeout_ms: Some(30_000),
            },
            GuiStep {
                id: "run-setup-detection".to_string(),
                action: GuiAction::Execute {
                    action_id: "setup.run_detection".to_string(),
                },
                assertions: vec![
                    GuiAssertion::SetupChecking { value: false },
                    GuiAssertion::SetupPlatformCountAtLeast { count: 5 },
                ],
                timeout_ms: Some(240_000),
            },
            GuiStep {
                id: "setup-snapshot".to_string(),
                action: GuiAction::Snapshot {
                    label: "setup-detection-state".to_string(),
                },
                assertions: Vec::new(),
                timeout_ms: Some(30_000),
            },
        ],
        ..GuiRunSpec::default()
    };

    let result = run_gui_automation(spec).expect("run_gui_automation should succeed");
    assert!(
        result.passed,
        "setup detection scenario should pass: {}",
        result.message
    );

    let snapshot_path = result.artifacts_root.join("setup-detection-state.json");
    let snapshot_raw = fs::read_to_string(&snapshot_path).expect("setup snapshot json");
    let snapshot: Value = serde_json::from_str(&snapshot_raw).expect("valid setup snapshot json");

    let platform_statuses = snapshot
        .get("setupPlatformStatuses")
        .and_then(|v| v.as_array())
        .cloned()
        .unwrap_or_default();
    assert!(
        platform_statuses.len() >= 5,
        "expected setup snapshot to include all platform statuses"
    );
}

#[test]
fn doctor_fix_transition_updates_state_in_headless_mode() {
    let temp = tempfile::tempdir().expect("tempdir");

    let spec = GuiRunSpec {
        scenario_name: "doctor-fix-transition".to_string(),
        mode: GuiRunMode::Headless,
        full_action: false,
        workspace_root: std::env::current_dir().expect("cwd"),
        artifacts_root: temp.path().to_path_buf(),
        workspace_isolation: WorkspaceIsolation::EphemeralClone,
        capture_full_bundle: true,
        steps: vec![
            GuiStep {
                id: "goto-doctor".to_string(),
                action: GuiAction::Navigate {
                    page: "doctor".to_string(),
                },
                assertions: vec![GuiAssertion::PageIs {
                    page: "doctor".to_string(),
                }],
                timeout_ms: Some(30_000),
            },
            GuiStep {
                id: "run-state-directory-check".to_string(),
                action: GuiAction::Execute {
                    action_id: "doctor.run.state_directory".to_string(),
                },
                assertions: vec![GuiAssertion::DoctorRunning { value: false }],
                timeout_ms: Some(120_000),
            },
            GuiStep {
                id: "fix-state-directory-dry-run".to_string(),
                action: GuiAction::Execute {
                    action_id: "doctor.fix.state_directory_dry_run".to_string(),
                },
                assertions: vec![
                    GuiAssertion::DoctorRunning { value: false },
                    GuiAssertion::ToastContains {
                        text: "state-directory".to_string(),
                    },
                ],
                timeout_ms: Some(120_000),
            },
            GuiStep {
                id: "doctor-fix-snapshot".to_string(),
                action: GuiAction::Snapshot {
                    label: "doctor-fix-transition-state".to_string(),
                },
                assertions: Vec::new(),
                timeout_ms: Some(30_000),
            },
        ],
        ..GuiRunSpec::default()
    };

    let result = run_gui_automation(spec).expect("run_gui_automation should succeed");
    assert!(
        result.passed,
        "doctor fix transition scenario should pass: {}",
        result.message
    );
}

#[test]
fn doctor_details_context_menu_actions_are_automated_in_headless_mode() {
    let temp = tempfile::tempdir().expect("tempdir");

    let spec = GuiRunSpec {
        scenario_name: "doctor-details-context-menu".to_string(),
        mode: GuiRunMode::Headless,
        full_action: false,
        workspace_root: std::env::current_dir().expect("cwd"),
        artifacts_root: temp.path().to_path_buf(),
        workspace_isolation: WorkspaceIsolation::EphemeralClone,
        capture_full_bundle: true,
        steps: vec![
            GuiStep {
                id: "goto-doctor".to_string(),
                action: GuiAction::Navigate {
                    page: "doctor".to_string(),
                },
                assertions: vec![GuiAssertion::PageIs {
                    page: "doctor".to_string(),
                }],
                timeout_ms: Some(30_000),
            },
            GuiStep {
                id: "run-state-directory-check".to_string(),
                action: GuiAction::Execute {
                    action_id: "doctor.run.state_directory".to_string(),
                },
                assertions: vec![GuiAssertion::DoctorRunning { value: false }],
                timeout_ms: Some(120_000),
            },
            GuiStep {
                id: "expand-state-directory-details".to_string(),
                action: GuiAction::Execute {
                    action_id: "doctor.expand.state_directory".to_string(),
                },
                assertions: Vec::new(),
                timeout_ms: Some(30_000),
            },
            GuiStep {
                id: "open-state-directory-details-context-menu".to_string(),
                action: GuiAction::Execute {
                    action_id: "doctor.context.details.state_directory".to_string(),
                },
                assertions: Vec::new(),
                timeout_ms: Some(30_000),
            },
            GuiStep {
                id: "select-all-doctor-details".to_string(),
                action: GuiAction::Execute {
                    action_id: "context.select_all".to_string(),
                },
                assertions: vec![GuiAssertion::ToastContains {
                    text: "Selected all doctor details and copied to clipboard".to_string(),
                }],
                timeout_ms: Some(30_000),
            },
            GuiStep {
                id: "snapshot".to_string(),
                action: GuiAction::Snapshot {
                    label: "doctor-details-context-state".to_string(),
                },
                assertions: Vec::new(),
                timeout_ms: Some(30_000),
            },
        ],
        ..GuiRunSpec::default()
    };

    let result = run_gui_automation(spec).expect("run_gui_automation should succeed");
    assert!(
        result.passed,
        "doctor details context scenario should pass: {}",
        result.message
    );
}

/// Captures a headless screenshot of the dashboard (header visible) to a fixed
/// artifacts path for before/after visual comparison. Run header_screenshot_for_visual_before
/// before layout changes, then header_screenshot_for_visual_after after, to get two PNGs
/// in the same directory. Run with `--test-threads=1` to avoid parallel clone conflicts.
fn run_header_screenshot_test(step_id: &str) {
    let workspace = std::env::current_dir().expect("cwd");
    let artifacts_root = workspace
        .join(".puppet-master")
        .join("evidence")
        .join("gui-automation")
        .join("header-visual");

    let spec = GuiRunSpec {
        scenario_name: "header-visual".to_string(),
        mode: GuiRunMode::Headless,
        full_action: false,
        workspace_root: workspace.clone(),
        artifacts_root: artifacts_root.clone(),
        workspace_isolation: WorkspaceIsolation::EphemeralClone,
        capture_full_bundle: true,
        steps: vec![GuiStep {
            id: step_id.to_string(),
            action: GuiAction::Navigate {
                page: "dashboard".to_string(),
            },
            assertions: vec![GuiAssertion::PageIs {
                page: "dashboard".to_string(),
            }],
            timeout_ms: None,
        }],
        ..GuiRunSpec::default()
    };

    let result = run_gui_automation(spec).expect("run_gui_automation should succeed");
    assert!(
        result.passed,
        "header screenshot run should pass: {}",
        result.message
    );
    eprintln!(
        "Header screenshot written to: {}/{}_auto.png",
        artifacts_root.display(),
        step_id
    );
}

#[test]
fn header_screenshot_for_visual_before() {
    run_header_screenshot_test("header-before");
}

#[test]
fn header_screenshot_for_visual_after() {
    run_header_screenshot_test("header-after");
}

#[test]
fn wizard_displays_all_platforms_with_availability_indicators() {
    let temp = tempfile::tempdir().expect("tempdir");

    let spec = GuiRunSpec {
        scenario_name: "wizard-platform-availability".to_string(),
        mode: GuiRunMode::Headless,
        full_action: false,
        workspace_root: std::env::current_dir().expect("cwd"),
        artifacts_root: temp.path().to_path_buf(),
        workspace_isolation: WorkspaceIsolation::EphemeralClone,
        capture_full_bundle: true,
        steps: vec![
            // First run detection to populate platform_statuses
            GuiStep {
                id: "goto-setup".to_string(),
                action: GuiAction::Navigate {
                    page: "setup".to_string(),
                },
                assertions: vec![GuiAssertion::PageIs {
                    page: "setup".to_string(),
                }],
                timeout_ms: Some(30_000),
            },
            GuiStep {
                id: "run-detection".to_string(),
                action: GuiAction::Execute {
                    action_id: "setup.run_detection".to_string(),
                },
                assertions: vec![
                    GuiAssertion::ToastContains {
                        text: "Detection complete".to_string(),
                    },
                ],
                timeout_ms: Some(120_000),
            },
            // Now go to wizard and check that platforms are shown
            GuiStep {
                id: "goto-wizard".to_string(),
                action: GuiAction::Navigate {
                    page: "wizard".to_string(),
                },
                assertions: vec![GuiAssertion::PageIs {
                    page: "wizard".to_string(),
                }],
                timeout_ms: None,
            },
            GuiStep {
                id: "wizard-with-platform-status".to_string(),
                action: GuiAction::Snapshot {
                    label: "wizard-platform-status".to_string(),
                },
                assertions: Vec::new(),
                timeout_ms: None,
            },
        ],
        ..GuiRunSpec::default()
    };

    let result = run_gui_automation(spec).expect("run_gui_automation should succeed");
    assert!(
        result.passed,
        "wizard platform availability test should pass: {}",
        result.message
    );

    // Verify snapshot contains platform statuses
    let snapshot_path = result.artifacts_root.join("wizard-platform-status.json");
    let snapshot_raw = fs::read_to_string(&snapshot_path).expect("wizard snapshot json");
    let snapshot: Value = serde_json::from_str(&snapshot_raw).expect("valid wizard snapshot json");

    // Verify platform_statuses exists and is not empty
    let platform_statuses = snapshot
        .get("setupPlatformStatuses")
        .and_then(|v| v.as_array())
        .cloned()
        .unwrap_or_default();
    assert!(
        !platform_statuses.is_empty(),
        "wizard should have access to platform_statuses for indicating availability"
    );
}

#[test]
fn config_displays_all_platforms_with_availability_indicators() {
    let temp = tempfile::tempdir().expect("tempdir");

    let spec = GuiRunSpec {
        scenario_name: "config-platform-availability".to_string(),
        mode: GuiRunMode::Headless,
        full_action: false,
        workspace_root: std::env::current_dir().expect("cwd"),
        artifacts_root: temp.path().to_path_buf(),
        workspace_isolation: WorkspaceIsolation::EphemeralClone,
        capture_full_bundle: true,
        steps: vec![
            // First run detection to populate platform_statuses
            GuiStep {
                id: "goto-setup".to_string(),
                action: GuiAction::Navigate {
                    page: "setup".to_string(),
                },
                assertions: vec![GuiAssertion::PageIs {
                    page: "setup".to_string(),
                }],
                timeout_ms: Some(30_000),
            },
            GuiStep {
                id: "run-detection".to_string(),
                action: GuiAction::Execute {
                    action_id: "setup.run_detection".to_string(),
                },
                assertions: vec![
                    GuiAssertion::ToastContains {
                        text: "Detection complete".to_string(),
                    },
                ],
                timeout_ms: Some(120_000),
            },
            // Now go to config and check that platforms are shown
            GuiStep {
                id: "goto-config".to_string(),
                action: GuiAction::Navigate {
                    page: "config".to_string(),
                },
                assertions: vec![GuiAssertion::PageIs {
                    page: "config".to_string(),
                }],
                timeout_ms: None,
            },
            GuiStep {
                id: "config-with-platform-status".to_string(),
                action: GuiAction::Snapshot {
                    label: "config-platform-status".to_string(),
                },
                assertions: Vec::new(),
                timeout_ms: None,
            },
        ],
        ..GuiRunSpec::default()
    };

    let result = run_gui_automation(spec).expect("run_gui_automation should succeed");
    assert!(
        result.passed,
        "config platform availability test should pass: {}",
        result.message
    );

    // Verify snapshot contains platform statuses
    let snapshot_path = result.artifacts_root.join("config-platform-status.json");
    let snapshot_raw = fs::read_to_string(&snapshot_path).expect("config snapshot json");
    let snapshot: Value = serde_json::from_str(&snapshot_raw).expect("valid config snapshot json");

    // Verify platform_statuses exists and is not empty
    let platform_statuses = snapshot
        .get("setupPlatformStatuses")
        .and_then(|v| v.as_array())
        .cloned()
        .unwrap_or_default();
    assert!(
        !platform_statuses.is_empty(),
        "config should have access to platform_statuses for indicating availability"
    );
}
