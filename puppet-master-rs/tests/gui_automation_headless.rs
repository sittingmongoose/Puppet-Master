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
