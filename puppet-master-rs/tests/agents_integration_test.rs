//! Integration test for agents_promotion and agents_gate_enforcer
//!
//! This test demonstrates the full lifecycle:
//! 1. Record pattern usage during iterations
//! 2. Enforce gate rules before tier completion
//! 3. Promote high-value learnings after tier completion

use puppet_master::state::{AgentsManager, GateEnforcer, PromotionConfig, PromotionEngine};
use puppet_master::types::AgentDefinition;
use tempfile::TempDir;

#[test]
fn test_full_agents_lifecycle() {
    let temp_dir = TempDir::new().unwrap();
    let workspace = temp_dir.path();

    // Initialize components
    let agents_manager = AgentsManager::new(workspace);
    let gate_enforcer = GateEnforcer::new();
    let mut promotion_engine = PromotionEngine::new(PromotionConfig {
        min_usage_count: 3,
        min_success_rate: 0.75,
        promotion_threshold: 0.65,
    });

    let tier_id = "phase1.task1";
    let parent_tier = "phase1";

    // === PHASE 1: Record pattern usage during iterations ===
    // Simulate successful iterations that use patterns
    for _ in 0..10 {
        promotion_engine
            .record_usage("Always validate inputs before processing", tier_id, true)
            .unwrap();
    }

    for _ in 0..5 {
        promotion_engine
            .record_usage("Log all API calls for debugging", tier_id, true)
            .unwrap();
    }

    // This pattern fails too often - should not be promoted
    for _ in 0..3 {
        promotion_engine
            .record_usage("Skip error handling for performance", tier_id, false)
            .unwrap();
    }

    // === PHASE 2: Build AGENTS.md with learnings ===
    agents_manager
        .append_pattern(
            tier_id,
            "Always validate inputs before processing".to_string(),
        )
        .unwrap();
    agents_manager
        .append_pattern(tier_id, "Log all API calls for debugging".to_string())
        .unwrap();
    agents_manager
        .append_failure(tier_id, "Skip error handling causes crashes".to_string())
        .unwrap();

    // === PHASE 3: Enforce gate before tier completion ===
    let agents_doc = agents_manager.load(tier_id).unwrap();
    let agents_path = agents_manager.get_agents_path(tier_id);
    let agents_content = std::fs::read_to_string(&agents_path).unwrap();

    let enforcement_result = gate_enforcer.enforce(&agents_content, &agents_doc).unwrap();

    assert!(
        enforcement_result.passed,
        "Gate enforcement should pass with proper AGENTS.md: {:?}",
        enforcement_result.violations
    );

    // === PHASE 4: Promote learnings after tier completion ===
    let candidates = promotion_engine.evaluate(&agents_doc.agents);

    // Should have 1 candidate (the high-success pattern with 10 uses)
    assert!(!candidates.is_empty(), "Should have promotion candidates");

    // The top candidate should be the most successful pattern
    let top_candidate = &candidates[0];
    assert_eq!(
        top_candidate.entry_text,
        "Always validate inputs before processing"
    );
    assert_eq!(top_candidate.source_tier, tier_id);
    assert_eq!(top_candidate.target_tier, parent_tier);
    assert!(
        top_candidate.score >= 0.65,
        "Promotion score should meet threshold"
    );
    assert_eq!(top_candidate.usage_count, 10);
    assert_eq!(top_candidate.success_rate, 1.0);

    // Promote to parent tier
    promotion_engine
        .promote(top_candidate, &agents_manager)
        .unwrap();

    // Verify promotion
    let parent_doc = agents_manager.load(parent_tier).unwrap();
    let promoted_patterns: Vec<_> = parent_doc
        .agents
        .iter()
        .filter(|a| a.role == "pattern")
        .collect();

    assert_eq!(promoted_patterns.len(), 1, "Should have 1 promoted pattern");
    assert!(
        promoted_patterns[0]
            .description
            .contains("Always validate inputs"),
        "Promoted pattern should contain original text"
    );
    assert!(
        promoted_patterns[0].description.contains("promoted"),
        "Promoted pattern should be marked as promoted"
    );
    assert!(
        promoted_patterns[0].description.contains("10x usage"),
        "Promoted pattern should show usage count"
    );
    assert!(
        promoted_patterns[0].description.contains("100.0% success"),
        "Promoted pattern should show success rate"
    );

    println!("✓ Full agents lifecycle test passed!");
    println!("  - Recorded usage for 3 patterns");
    println!("  - Enforced gate rules (passed)");
    println!("  - Evaluated promotion candidates");
    println!("  - Promoted 1 high-value pattern to parent tier");
}

#[test]
fn test_gate_blocks_incomplete_agents() {
    let temp_dir = TempDir::new().unwrap();
    let workspace = temp_dir.path();

    let agents_manager = AgentsManager::new(workspace);
    let gate_enforcer = GateEnforcer::new();

    let tier_id = "phase1.task1";

    // Create minimal AGENTS.md with only 1 pattern (needs 2)
    agents_manager
        .append_pattern(tier_id, "Only one pattern".to_string())
        .unwrap();

    let agents_doc = agents_manager.load(tier_id).unwrap();
    let agents_path = agents_manager.get_agents_path(tier_id);
    let agents_content = std::fs::read_to_string(&agents_path).unwrap();

    let enforcement_result = gate_enforcer.enforce(&agents_content, &agents_doc).unwrap();

    // Should have warning about not enough patterns
    let has_min_patterns_violation = enforcement_result
        .violations
        .iter()
        .any(|v| v.rule == "min-patterns");

    assert!(
        has_min_patterns_violation,
        "Should have min-patterns violation"
    );

    println!("✓ Gate enforcement blocks incomplete AGENTS.md");
}

#[test]
fn test_promotion_requires_sufficient_usage() {
    let mut promotion_engine = PromotionEngine::with_defaults();
    let tier_id = "phase1.task1";

    // Only 2 uses - not enough for promotion (requires 3)
    promotion_engine
        .record_usage("Rarely used pattern", tier_id, true)
        .unwrap();
    promotion_engine
        .record_usage("Rarely used pattern", tier_id, true)
        .unwrap();

    let entries = vec![AgentDefinition::new(
        "Rarely used pattern",
        "pattern",
        "Rarely used pattern",
    )];

    let candidates = promotion_engine.evaluate(&entries);

    assert_eq!(
        candidates.len(),
        0,
        "Should not promote pattern with insufficient usage"
    );

    println!("✓ Promotion requires sufficient usage count");
}

#[test]
fn test_promotion_requires_high_success_rate() {
    let mut promotion_engine = PromotionEngine::with_defaults();
    let tier_id = "phase1.task1";

    // 3 uses but only 1 success = 33% success rate (requires 75%)
    promotion_engine
        .record_usage("Unreliable pattern", tier_id, true)
        .unwrap();
    promotion_engine
        .record_usage("Unreliable pattern", tier_id, false)
        .unwrap();
    promotion_engine
        .record_usage("Unreliable pattern", tier_id, false)
        .unwrap();

    let entries = vec![AgentDefinition::new(
        "Unreliable pattern",
        "pattern",
        "Unreliable pattern",
    )];

    let candidates = promotion_engine.evaluate(&entries);

    assert_eq!(
        candidates.len(),
        0,
        "Should not promote pattern with low success rate"
    );

    println!("✓ Promotion requires high success rate");
}
