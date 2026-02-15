use puppet_master::types::{Criterion, Verifier};
use puppet_master::verification::IcedGuiVerifier;

#[tokio::test]
async fn test_iced_gui_verifier_runs() {
    let temp = tempfile::tempdir().expect("tempdir");
    let expected = serde_json::json!({
        "mode": "headless",
        "fullAction": false,
        "workspaceRoot": std::env::current_dir().expect("cwd"),
        "artifactsRoot": temp.path(),
        "workspaceIsolation": "ephemeralClone",
        "captureFullBundle": true
    })
    .to_string();

    let criterion = Criterion {
        id: "gui-verifier-1".to_string(),
        description: "Run iced gui verifier".to_string(),
        met: false,
        verification_method: Some("iced_gui".to_string()),
        expected: Some(expected),
        actual: None,
    };

    let verifier = IcedGuiVerifier::new();
    let result = verifier.verify(&criterion).await;

    assert!(
        result.message.contains("Iced GUI verifier"),
        "unexpected verifier message: {}",
        result.message
    );
    assert!(result.evidence.is_some());
}
