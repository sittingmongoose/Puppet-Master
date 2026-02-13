#[test]
fn test_mcp_wrapper_script_contract_methods_exist() {
    let repo_root = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("repo root")
        .to_path_buf();

    let script_path = repo_root
        .join("scripts")
        .join("mcp-gui-automation-server.js");
    assert!(
        script_path.exists(),
        "missing script: {}",
        script_path.display()
    );

    let content = std::fs::read_to_string(&script_path).expect("script readable");

    for method in [
        "gui_run_scenario",
        "gui_run_step",
        "gui_get_debug_feed",
        "gui_get_artifact",
        "gui_list_actions",
    ] {
        assert!(
            content.contains(method),
            "script missing MCP method name {}",
            method
        );
    }
}
