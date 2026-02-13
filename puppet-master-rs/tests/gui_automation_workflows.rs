use puppet_master::automation::{GuiRunMode, GuiRunSpec, WorkspaceIsolation, run_gui_automation};

#[test]
fn test_native_smoke_run_gated() {
    if std::env::var("RUN_NATIVE_SMOKE").ok().as_deref() != Some("1") {
        return;
    }

    let temp = tempfile::tempdir().expect("tempdir");

    let spec = GuiRunSpec {
        scenario_name: "native-smoke-test".to_string(),
        mode: GuiRunMode::Native,
        full_action: false,
        workspace_root: std::env::current_dir().expect("cwd"),
        artifacts_root: temp.path().to_path_buf(),
        workspace_isolation: WorkspaceIsolation::InPlaceDirect,
        capture_full_bundle: true,
        ..GuiRunSpec::default()
    };

    let result = run_gui_automation(spec).expect("native run should execute");
    assert!(!result.step_results.is_empty());
}
