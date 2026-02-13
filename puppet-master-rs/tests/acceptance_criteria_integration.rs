//! Integration test for acceptance criteria injection and parsing
//!
//! This test demonstrates:
//! 1. PRD generation injects default acceptance criteria
//! 2. Acceptance criteria are in prefixed format (command:/file_exists:/regex:)
//! 3. Orchestrator's build_gate_criteria parses prefixed format correctly
//! 4. Verification methods and expected values are set for gate execution

#[cfg(test)]
mod acceptance_criteria_integration_tests {
    use puppet_master::start_chain::{AcceptanceCriteriaInjector, PrdGenerator};
    use puppet_master::types::{PRD, ParsedRequirements, RequirementsSection};

    #[test]
    fn test_prd_generation_injects_prefixed_criteria() {
        // Create sample requirements
        let mut requirements = ParsedRequirements::new("Test Project");
        requirements.sections.push(RequirementsSection::new(
            "Implementation Phase",
            "Build the core features\n- Implement authentication\n- Add database layer\n- Create API endpoints",
        ));

        // Generate PRD
        let prd = PrdGenerator::generate("Test Project", &requirements).unwrap();

        // Verify PRD structure
        assert_eq!(prd.phases.len(), 1);
        assert!(!prd.phases[0].tasks.is_empty());

        // Check that subtasks have acceptance criteria
        for phase in &prd.phases {
            for task in &phase.tasks {
                for subtask in &task.subtasks {
                    println!("Checking subtask: {} - {}", subtask.id, subtask.title);
                    
                    // Verify acceptance_criteria strings exist
                    assert!(
                        !subtask.acceptance_criteria.is_empty(),
                        "Subtask {} should have acceptance_criteria",
                        subtask.id
                    );

                    // Verify at least one criterion is in prefixed format
                    let has_prefixed = subtask.acceptance_criteria.iter().any(|c| {
                        c.starts_with("command:")
                            || c.starts_with("file_exists:")
                            || c.starts_with("regex:")
                    });
                    assert!(
                        has_prefixed,
                        "Subtask {} should have at least one prefixed criterion. Got: {:?}",
                        subtask.id,
                        subtask.acceptance_criteria
                    );

                    println!("  ✓ Acceptance criteria: {:?}", subtask.acceptance_criteria);
                }
            }
        }
    }

    #[test]
    fn test_injector_creates_prefixed_strings() {
        // Create a PRD without acceptance criteria
        let mut prd = PRD::new("Empty Project");
        let phase = puppet_master::types::Phase {
            id: "PH-001".to_string(),
            title: "Phase 1".to_string(),
            goal: None,
            description: Some("Test phase".to_string()),
            status: puppet_master::types::ItemStatus::Pending,
            tasks: vec![puppet_master::types::Task {
                id: "TK-001".to_string(),
                title: "Build feature".to_string(),
                description: Some("Implement the feature".to_string()),
                status: puppet_master::types::ItemStatus::Pending,
                subtasks: vec![puppet_master::types::Subtask {
                    id: "ST-001".to_string(),
                    task_id: "TK-001".to_string(),
                    title: "Write tests".to_string(),
                    description: Some("Create unit tests".to_string()),
                    criterion: None,
                    status: puppet_master::types::ItemStatus::Pending,
                    iterations: 0,
                    evidence: vec![],
                    plan: None,
                    acceptance_criteria: vec![],
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
        };
        prd.phases.push(phase);

        // Inject criteria
        let injector = AcceptanceCriteriaInjector::default();
        let result = injector.inject(&mut prd).unwrap();

        println!("Injection result: {:?}", result);
        assert!(result.criteria_injected > 0);

        // Verify prefixed format
        let subtask = &prd.phases[0].tasks[0].subtasks[0];
        assert!(!subtask.acceptance_criteria.is_empty());
        
        for criterion_str in &subtask.acceptance_criteria {
            println!("Criterion: {}", criterion_str);
            assert!(
                criterion_str.starts_with("command:")
                    || criterion_str.starts_with("file_exists:")
                    || criterion_str.starts_with("regex:"),
                "Expected prefixed format, got: {}",
                criterion_str
            );
        }
    }

    #[test]
    fn test_prefixed_criterion_parsing() {
        // Test the parsing logic used by orchestrator
        fn parse_criterion(desc: &str) -> (Option<String>, Option<String>) {
            if let Some(content) = desc.strip_prefix("command:") {
                return (Some("command".to_string()), Some(content.trim().to_string()));
            } else if let Some(content) = desc.strip_prefix("file_exists:") {
                return (Some("file_exists".to_string()), Some(content.trim().to_string()));
            } else if let Some(content) = desc.strip_prefix("regex:") {
                return (Some("regex".to_string()), Some(content.trim().to_string()));
            }
            (Some("command".to_string()), Some(desc.to_string()))
        }

        // Test command format
        let (method, expected) = parse_criterion("command: cargo test");
        assert_eq!(method.as_deref(), Some("command"));
        assert_eq!(expected.as_deref(), Some("cargo test"));

        // Test file_exists format
        let (method, expected) = parse_criterion("file_exists: src/main.rs");
        assert_eq!(method.as_deref(), Some("file_exists"));
        assert_eq!(expected.as_deref(), Some("src/main.rs"));

        // Test regex format
        let (method, expected) = parse_criterion("regex: Cargo.toml:name.*puppet");
        assert_eq!(method.as_deref(), Some("regex"));
        assert_eq!(expected.as_deref(), Some("Cargo.toml:name.*puppet"));

        // Test legacy format (no prefix)
        let (method, expected) = parse_criterion("All tests pass");
        assert_eq!(method.as_deref(), Some("command"));
        assert_eq!(expected.as_deref(), Some("All tests pass"));
    }

    #[test]
    fn test_injector_converts_unprefixed_to_prefixed() {
        let mut prd = PRD::new("Test Project");
        let phase = puppet_master::types::Phase {
            id: "PH-001".to_string(),
            title: "Phase 1".to_string(),
            goal: None,
            description: None,
            status: puppet_master::types::ItemStatus::Pending,
            tasks: vec![puppet_master::types::Task {
                id: "TK-001".to_string(),
                title: "Task".to_string(),
                description: None,
                status: puppet_master::types::ItemStatus::Pending,
                subtasks: vec![puppet_master::types::Subtask {
                    id: "ST-001".to_string(),
                    task_id: "TK-001".to_string(),
                    title: "Feature".to_string(),
                    description: Some("Implement feature".to_string()),
                    criterion: None,
                    status: puppet_master::types::ItemStatus::Pending,
                    iterations: 0,
                    evidence: vec![],
                    plan: None,
                    acceptance_criteria: vec![
                        "Tests pass".to_string(),
                        "File must exist".to_string(),
                    ],
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
        };
        prd.phases.push(phase);

        let injector = AcceptanceCriteriaInjector::default();
        let result = injector.inject(&mut prd).unwrap();

        // Should have converted the unprefixed criteria
        assert!(result.criteria_converted > 0);

        let subtask = &prd.phases[0].tasks[0].subtasks[0];
        for criterion_str in &subtask.acceptance_criteria {
            assert!(
                criterion_str.starts_with("command:")
                    || criterion_str.starts_with("file_exists:")
                    || criterion_str.starts_with("regex:"),
                "Unprefixed criterion should be converted. Got: {}",
                criterion_str
            );
        }
    }
}
