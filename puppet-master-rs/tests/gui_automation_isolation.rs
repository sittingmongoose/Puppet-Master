use puppet_master::automation::workspace_clone::{
    build_artifact_manifest, create_ephemeral_clone, ensure_path_within,
};

#[test]
fn test_ephemeral_clone_and_path_guard() {
    let source = tempfile::tempdir().expect("source tempdir");
    let source_file = source.path().join("file.txt");
    std::fs::write(&source_file, "hello").expect("write source file");

    let cloned = create_ephemeral_clone(source.path(), "test-run-id").expect("clone should work");
    let cloned_file = cloned.clone_root.join("file.txt");

    assert!(cloned_file.exists());
    ensure_path_within(&cloned.clone_root, &cloned_file).expect("path should be within root");

    let outside = tempfile::tempdir().expect("outside tempdir");
    let outside_file = outside.path().join("oops.txt");
    std::fs::write(&outside_file, "oops").expect("write outside file");

    let err = ensure_path_within(&cloned.clone_root, &outside_file);
    assert!(err.is_err(), "outside path must be rejected");

    let manifest = build_artifact_manifest(&cloned.clone_root).expect("manifest should build");
    assert!(!manifest.entries.is_empty());

    cloned.cleanup().expect("cleanup should pass");
}
