//! Integration test for test-strategy.json criteria merging into prompts
//!
//! Verifies the complete flow:
//! 1. Load test-strategy.json
//! 2. Merge criteria into TierTree
//! 3. Build prompt with merged criteria
//! 4. Verify merged criteria appear in output

use puppet_master::core::{prompt_builder::PromptBuilder, tier_node::TierTree};
use puppet_master::types::*;
use serde_json::json;
use std::fs;
use tempfile::TempDir;

#[test]
fn test_integration_test_strategy_to_prompt() {
    // Create temporary workspace
    let temp_dir = TempDir::new().unwrap();
    let workspace = temp_dir.path();

    // Create .puppet-master/interview directory
    let interview_dir = workspace.join(".puppet-master/interview");
    fs::create_dir_all(&interview_dir).unwrap();

    // Create test-strategy.json
    let test_strategy = json!({
        "project": "Integration Test Project",
        "generatedAt": "2024-02-03T00:00:00Z",
        "coverageLevel": "Standard",
        "items": [
            {
                "id": "TEST-001",
                "sourcePhaseId": "phase1",
                "criterion": "Test strategy: UI must render correctly",
                "testType": "playwright",
                "testFile": "tests/ui.spec.ts",
                "testName": "test_ui_rendering",
                "verificationCommand": "npm run test:e2e"
            },
            {
                "id": "TEST-002",
                "sourcePhaseId": "subtask1",
                "criterion": "Test strategy: Button clicks must work",
                "testType": "playwright",
                "testFile": "tests/interactions.spec.ts",
                "testName": "test_button_clicks",
                "verificationCommand": "npm run test:e2e -- interactions.spec.ts"
            }
        ]
    });

    let json_path = interview_dir.join("test-strategy.json");
    fs::write(
        &json_path,
        serde_json::to_string_pretty(&test_strategy).unwrap(),
    )
    .unwrap();

    // Create PRD with phase, task, and subtask
    let prd = PRD {
        metadata: PRDMetadata {
            name: "Integration Test Project".to_string(),
            description: Some("Testing test strategy integration".to_string()),
            version: "1.0.0".to_string(),
            total_tasks: 1,
            total_subtasks: 1,
            completed_count: 0,
            total_tests: 0,
            passed_tests: 0,
            created_at: None,
            updated_at: None,
        },
        phases: vec![Phase {
            id: "phase1".to_string(),
            title: "Integration Phase".to_string(),
            goal: Some("Test integration".to_string()),
            description: Some("Phase for integration testing".to_string()),
            status: ItemStatus::Pending,
            tasks: vec![Task {
                id: "task1".to_string(),
                title: "Integration Task".to_string(),
                description: Some("Task for integration testing".to_string()),
                status: ItemStatus::Pending,
                subtasks: vec![Subtask {
                    id: "subtask1".to_string(),
                    task_id: "task1".to_string(),
                    title: "Integration Subtask".to_string(),
                    description: Some("Subtask for integration testing".to_string()),
                    criterion: None,
                    status: ItemStatus::Pending,
                    iterations: 0,
                    evidence: vec![],
                    plan: None,
                    acceptance_criteria: vec!["PRD: Core functionality works".to_string()],
                    iteration_records: vec![],
                }],
                evidence: vec![],
                gate_reports: vec![],
                dependencies: vec![],
                complexity: None,
                task_type: None,
            }],
            iterations: 0,
            evidence: vec![],
            gate_report: None,
            orchestrator_state: None,
            orchestrator_context: None,
            dependencies: vec![],
        }],
    };

    // Build tier tree with test strategy
    let tree = TierTree::from_prd_with_base_path(&prd, 3, Some(workspace)).unwrap();

    // Verify phase has test strategy criterion merged
    let phase = tree.find_by_id("phase1").unwrap();
    assert!(
        !phase.acceptance_criteria.is_empty(),
        "Phase should have acceptance criteria"
    );
    assert!(
        phase.acceptance_criteria[0].contains("UI must render correctly"),
        "Phase should have test strategy criterion merged. Got: {:?}",
        phase.acceptance_criteria
    );

    // Verify subtask has both PRD and test strategy criteria
    let subtask = tree.find_by_id("subtask1").unwrap();
    assert_eq!(
        subtask.acceptance_criteria.len(),
        2,
        "Subtask should have 2 criteria (1 PRD + 1 test strategy)"
    );
    assert_eq!(
        subtask.acceptance_criteria[0], "PRD: Core functionality works",
        "First criterion should be from PRD"
    );
    assert!(
        subtask.acceptance_criteria[1].contains("Button clicks must work"),
        "Second criterion should be from test strategy. Got: {}",
        subtask.acceptance_criteria[1]
    );

    // Build prompt for subtask
    let builder = PromptBuilder::new();
    let prompt = builder.build_prompt(&tree, "subtask1", 1, None).unwrap();

    // Verify prompt includes both PRD and test strategy criteria
    assert!(
        prompt.contains("PRD: Core functionality works"),
        "Prompt should contain PRD criterion"
    );
    assert!(
        prompt.contains("Button clicks must work"),
        "Prompt should contain test strategy criterion"
    );
    assert!(
        prompt.contains("Acceptance Criteria"),
        "Prompt should have acceptance criteria section"
    );

    // Verify prompt structure
    assert!(prompt.contains("Iteration 1"));
    assert!(prompt.contains("Integration Subtask"));
    assert!(prompt.contains("Integration Phase > Integration Task > Integration Subtask"));

    println!("✅ Integration test passed!");
    println!("\nGenerated prompt excerpt:");
    println!("---");
    // Find and print the acceptance criteria section
    if let Some(start) = prompt.find("### Acceptance Criteria") {
        let end = prompt[start..]
            .find("\n\n")
            .map(|i| start + i)
            .unwrap_or(prompt.len());
        println!("{}", &prompt[start..end]);
    }
    println!("---");
}

#[test]
fn test_integration_test_strategy_graceful_missing() {
    // Test that tree builds fine without test-strategy.json
    let temp_dir = TempDir::new().unwrap();
    let workspace = temp_dir.path();

    // Don't create test-strategy.json

    let prd = PRD {
        metadata: PRDMetadata {
            name: "Test Project".to_string(),
            description: Some("Test".to_string()),
            version: "1.0.0".to_string(),
            total_tasks: 0,
            total_subtasks: 0,
            completed_count: 0,
            total_tests: 0,
            passed_tests: 0,
            created_at: None,
            updated_at: None,
        },
        phases: vec![Phase {
            id: "phase1".to_string(),
            title: "Phase 1".to_string(),
            goal: None,
            description: Some("Test phase".to_string()),
            status: ItemStatus::Pending,
            tasks: vec![],
            iterations: 0,
            evidence: vec![],
            gate_report: None,
            orchestrator_state: None,
            orchestrator_context: None,
            dependencies: vec![],
        }],
    };

    // Should succeed even without test-strategy.json
    let tree = TierTree::from_prd_with_base_path(&prd, 3, Some(workspace)).unwrap();

    // Phase should exist but have no criteria (none in PRD, none in test strategy)
    let phase = tree.find_by_id("phase1").unwrap();
    assert_eq!(phase.acceptance_criteria.len(), 0);

    println!("✅ Graceful degradation test passed!");
}

#[test]
fn test_integration_test_strategy_fuzzy_matching() {
    // Test that fuzzy phase ID matching works
    let temp_dir = TempDir::new().unwrap();
    let workspace = temp_dir.path();

    let interview_dir = workspace.join(".puppet-master/interview");
    fs::create_dir_all(&interview_dir).unwrap();

    // Test strategy uses underscore naming
    let test_strategy = json!({
        "project": "Fuzzy Match Test",
        "generatedAt": "2024-02-03T00:00:00Z",
        "coverageLevel": "Standard",
        "items": [
            {
                "id": "TEST-001",
                "sourcePhaseId": "product_ux",  // underscore version
                "criterion": "Test: UX should be intuitive",
                "testType": "playwright",
                "testFile": "tests/ux.spec.ts",
                "testName": "test_ux",
                "verificationCommand": "npm test"
            }
        ]
    });

    let json_path = interview_dir.join("test-strategy.json");
    fs::write(
        &json_path,
        serde_json::to_string_pretty(&test_strategy).unwrap(),
    )
    .unwrap();

    // PRD uses space naming
    let prd = PRD {
        metadata: PRDMetadata {
            name: "Test".to_string(),
            description: None,
            version: "1.0.0".to_string(),
            total_tasks: 0,
            total_subtasks: 0,
            completed_count: 0,
            total_tests: 0,
            passed_tests: 0,
            created_at: None,
            updated_at: None,
        },
        phases: vec![Phase {
            id: "phase1".to_string(),
            title: "Product UX".to_string(), // space version - should fuzzy match
            goal: None,
            description: Some("User experience phase".to_string()),
            status: ItemStatus::Pending,
            tasks: vec![],
            iterations: 0,
            evidence: vec![],
            gate_report: None,
            orchestrator_state: None,
            orchestrator_context: None,
            dependencies: vec![],
        }],
    };

    let tree = TierTree::from_prd_with_base_path(&prd, 3, Some(workspace)).unwrap();

    // Fuzzy matching should map "product_ux" → "phase1" via title "Product UX"
    let phase = tree.find_by_id("phase1").unwrap();
    assert!(
        !phase.acceptance_criteria.is_empty(),
        "Fuzzy matching should have mapped product_ux to phase1"
    );
    assert!(
        phase.acceptance_criteria[0].contains("UX should be intuitive"),
        "Test strategy criterion should be merged via fuzzy match"
    );

    println!("✅ Fuzzy matching test passed!");
}
