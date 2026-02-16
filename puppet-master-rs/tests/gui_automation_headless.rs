use puppet_master::automation::{
    GuiAction, GuiAssertion, GuiRunMode, GuiRunSpec, GuiStep, WorkspaceIsolation,
    run_gui_automation,
};

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
