## Configuration Example

```rust
let subagent_config = SubagentConfig {
    enable_phase_subagents: true,
    enable_research_subagents: true,
    enable_validation_subagents: true,
    enable_document_subagents: true,
    stage_personas: HashMap::from([
        ("questioning".to_string(), "product-manager".to_string()),
        ("research".to_string(), "architect-reviewer".to_string()),
        ("validation".to_string(), "qa-expert".to_string()),
        ("drafting".to_string(), "technical-writer".to_string()),
        ("review".to_string(), "reviewer".to_string()),
    ]),
    phase_secondary_subagents: HashMap::from([
        ("security_secrets".to_string(), vec!["compliance-auditor".to_string()]),
        ("deployment_environments".to_string(), vec!["deployment-engineer".to_string()]),
        ("testing_verification".to_string(), vec!["test-automator".to_string()]),
    ]),
};
```

