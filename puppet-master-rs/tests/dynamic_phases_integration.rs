//! Integration test for dynamic feature phases (Phase 9+).
//!
//! Tests:
//! 1. Feature detection after core phase 8 generates stable dynamic phases
//! 2. Persistence: dynamic phases serialize/deserialize in interview state YAML
//! 3. Ordering: PhaseManager maintains correct phase ordering and totals
//! 4. Resume: loading state restores dynamic phases correctly

use puppet_master::interview::{
    create_state, detect_features_from_state, load_state_at_output_dir, save_state_at_output_dir,
    Decision, InterviewOrchestrator, InterviewOrchestratorConfig, InterviewPhaseDefinition,
    PhaseManager, PlatformModelPair,
};
use puppet_master::types::Platform;
use tempfile::TempDir;

#[test]
fn test_dynamic_phase_persistence() {
    let temp_dir = TempDir::new().unwrap();
    let output_dir = temp_dir.path().join("interview");
    std::fs::create_dir_all(&output_dir).unwrap();

    // Create initial state with decisions that should trigger feature detection
    let mut state = create_state("test feature", "claude", false, vec![]);

    // Add decisions that mention authentication multiple times
    for i in 0..3 {
        state.decisions.push(Decision {
            phase: format!("phase_{}", i),
            summary: format!("OAuth authentication decision {}", i),
            reasoning: "Need secure login with JWT tokens".to_string(),
            timestamp: chrono::Utc::now().to_rfc3339(),
        });
    }

    // Add decisions that mention API multiple times
    for i in 0..3 {
        state.decisions.push(Decision {
            phase: format!("phase_{}", i),
            summary: format!("REST API design decision {}", i),
            reasoning: "Need RESTful endpoints with OpenAPI".to_string(),
            timestamp: chrono::Utc::now().to_rfc3339(),
        });
    }

    // Detect features
    let features = detect_features_from_state(&state);
    assert!(!features.is_empty(), "Should detect at least one feature");

    // Create a phase manager and add dynamic phases
    let mut phase_manager = PhaseManager::new();
    assert_eq!(phase_manager.total_phases(), 8);

    for feature in &features {
        let phase_id = format!("feature-{}", feature.id);
        phase_manager.add_dynamic_phase(&phase_id, &feature.name, &feature.description);
    }

    let total_with_dynamic = phase_manager.total_phases();
    assert!(
        total_with_dynamic > 8,
        "Should have more than 8 phases after adding dynamic phases"
    );

    // Extract dynamic phases and add to state
    state.dynamic_phases = phase_manager.dynamic_phases();
    assert_eq!(
        state.dynamic_phases.len(),
        total_with_dynamic - 8,
        "State should have correct number of dynamic phases"
    );

    // Save state to YAML
    let state_path = save_state_at_output_dir(&mut state, &output_dir).unwrap();
    assert!(state_path.exists(), "State file should be created");

    // Verify YAML contains dynamic phases
    let yaml_content = std::fs::read_to_string(&state_path).unwrap();
    assert!(
        yaml_content.contains("dynamicPhases"),
        "YAML should contain dynamicPhases field"
    );
    assert!(
        yaml_content.contains("feature-"),
        "YAML should contain feature phase IDs"
    );

    // Load state back
    let loaded_state = load_state_at_output_dir(&output_dir)
        .unwrap()
        .expect("Should load saved state");

    assert_eq!(
        loaded_state.dynamic_phases.len(),
        state.dynamic_phases.len(),
        "Loaded state should have same number of dynamic phases"
    );

    // Verify phase IDs match
    for (original, loaded) in state.dynamic_phases.iter().zip(&loaded_state.dynamic_phases) {
        assert_eq!(original.id, loaded.id, "Phase IDs should match");
        assert_eq!(original.name, loaded.name, "Phase names should match");
        assert_eq!(
            original.description, loaded.description,
            "Phase descriptions should match"
        );
    }

    // Create new phase manager and restore dynamic phases
    let mut restored_pm = PhaseManager::new();
    assert_eq!(restored_pm.total_phases(), 8);

    restored_pm.restore_dynamic_phases(loaded_state.dynamic_phases.clone());
    assert_eq!(
        restored_pm.total_phases(),
        total_with_dynamic,
        "Restored phase manager should have same total phases"
    );

    // Verify phases are in correct order
    for i in 8..restored_pm.total_phases() {
        let phase = restored_pm.phases()[i].clone();
        assert!(
            phase.id.starts_with("feature-"),
            "Dynamic phase should have feature- prefix"
        );
    }
}

#[test]
fn test_orchestrator_dynamic_phase_resume() {
    let temp_dir = TempDir::new().unwrap();
    let output_dir = temp_dir.path().join("interview");
    std::fs::create_dir_all(&output_dir).unwrap();

    // Create orchestrator config
    let config = InterviewOrchestratorConfig {
        feature: "test feature".to_string(),
        first_principles: false,
        context_files: vec![],
        context_content: None,
        project_context: None,
        base_dir: temp_dir.path().to_path_buf(),
        output_dir: output_dir.clone(),
        primary_platform: PlatformModelPair {
            platform: Platform::Claude,
            model: "claude-3".to_string(),
        },
        backup_platforms: vec![],
        project_name: "test".to_string(),
        generate_initial_agents_md: false,
        generate_playwright_requirements: false,
        interaction_mode: "expert".to_string(),
        research_config: None,
    };

    let mut orch = InterviewOrchestrator::new(config);

    // Create state with dynamic phases
    let mut state = create_state("test feature", "claude", false, vec![]);
    state.current_domain_phase = 8; // At first dynamic phase

    // Add dynamic phases
    let dynamic_phases = vec![
        InterviewPhaseDefinition {
            id: "feature-auth".to_string(),
            domain: "Feature: Authentication".to_string(),
            name: "Authentication".to_string(),
            description: "Auth deep dive".to_string(),
            min_questions: 3,
            max_questions: 8,
        },
        InterviewPhaseDefinition {
            id: "feature-api".to_string(),
            domain: "Feature: API".to_string(),
            name: "API Layer".to_string(),
            description: "API design deep dive".to_string(),
            min_questions: 3,
            max_questions: 8,
        },
    ];
    state.dynamic_phases = dynamic_phases;

    // Resume from state
    orch.set_state(state.clone());

    // Verify phase manager has correct total
    let pm = orch.get_phase_manager();
    assert_eq!(pm.total_phases(), 10, "Should have 8 core + 2 dynamic phases");
    assert_eq!(pm.current_index(), 8, "Should be at first dynamic phase");

    // Verify current phase is the dynamic one
    let current = pm.current_phase().unwrap();
    assert_eq!(current.id, "feature-auth");
    assert_eq!(current.name, "Authentication");

    // Verify we can navigate through dynamic phases
    assert!(!pm.is_complete(), "Should not be complete");

    // Verify the orchestrator state matches
    let orch_state = orch.get_state();
    assert_eq!(
        orch_state.dynamic_phases.len(),
        2,
        "State should have 2 dynamic phases"
    );
}

#[test]
fn test_dynamic_phase_ordering_and_navigation() {
    let mut pm = PhaseManager::new();

    // Start with 8 core phases
    assert_eq!(pm.total_phases(), 8);
    assert_eq!(pm.current_index(), 0);

    // Navigate to phase 7 (last core phase)
    for _ in 0..7 {
        assert!(pm.advance());
    }
    assert_eq!(pm.current_index(), 7);
    assert_eq!(pm.current_phase().unwrap().id, "testing_verification");

    // Add dynamic phases
    pm.add_dynamic_phase("feature-auth", "Authentication", "Auth");
    pm.add_dynamic_phase("feature-api", "API", "API");
    pm.add_dynamic_phase("feature-payment", "Payment", "Payment");

    assert_eq!(pm.total_phases(), 11);

    // Advance past last core phase
    pm.mark_current_complete();
    assert_eq!(pm.current_index(), 8);
    assert_eq!(pm.current_phase().unwrap().id, "feature-auth");

    // Advance through dynamic phases
    pm.mark_current_complete();
    assert_eq!(pm.current_index(), 9);
    assert_eq!(pm.current_phase().unwrap().id, "feature-api");

    pm.mark_current_complete();
    assert_eq!(pm.current_index(), 10);
    assert_eq!(pm.current_phase().unwrap().id, "feature-payment");

    // Mark last phase complete
    pm.mark_current_complete();
    assert_eq!(pm.current_index(), 11);
    assert!(pm.is_complete());
    assert!(pm.current_phase().is_none());
}

#[test]
fn test_no_panic_with_dynamic_phase_active() {
    let mut pm = PhaseManager::new();

    // Add dynamic phases
    pm.add_dynamic_phase("feature-test", "Test Feature", "Test description");

    // Set index to the dynamic phase
    pm.set_index(8);

    // Should not panic when accessing current phase
    let phase = pm.current_phase();
    assert!(phase.is_some());
    assert_eq!(phase.unwrap().id, "feature-test");

    // Should not panic when checking if complete
    assert!(!pm.is_complete());

    // Should not panic when advancing
    pm.mark_current_complete();
    assert!(pm.is_complete());
}
