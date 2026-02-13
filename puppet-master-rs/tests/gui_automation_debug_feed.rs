use puppet_master::automation::DebugFeedCollector;

#[test]
fn test_debug_feed_bundle_written() {
    let temp = tempfile::tempdir().expect("tempdir");
    let mut feed = DebugFeedCollector::new("run-1".to_string());

    feed.record_system(
        "test_event",
        "debug feed test event",
        serde_json::json!({"k":"v"}),
    );

    let bundle = feed
        .write_bundle(temp.path())
        .expect("write_bundle should pass");

    assert!(bundle.timeline_path.exists());
    assert!(bundle.summary_path.exists());

    let timeline = std::fs::read_to_string(bundle.timeline_path).expect("timeline readable");
    assert!(timeline.contains("test_event"));
}
