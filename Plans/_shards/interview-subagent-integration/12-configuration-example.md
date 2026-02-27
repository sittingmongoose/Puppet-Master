## Configuration Example

```rust
let subagent_config = SubagentConfig {
    enable_phase_subagents: true,
    enable_research_subagents: true,
    enable_validation_subagents: true,
    enable_document_subagents: true,
    phase_subagents: HashMap::from([
        ("scope_goals".to_string(), "product-manager".to_string()),
        ("architecture_technology".to_string(), "architect-reviewer".to_string()),
        ("product_ux".to_string(), "ux-researcher".to_string()),
        ("data_persistence".to_string(), "database-administrator".to_string()),
        ("security_secrets".to_string(), "security-auditor".to_string()),
        ("deployment_environments".to_string(), "devops-engineer".to_string()),
        ("performance_reliability".to_string(), "performance-engineer".to_string()),
        ("testing_verification".to_string(), "qa-expert".to_string()),
    ]),
    phase_secondary_subagents: HashMap::from([
        ("security_secrets".to_string(), vec!["compliance-auditor".to_string()]),
        ("deployment_environments".to_string(), vec!["deployment-engineer".to_string()]),
        ("testing_verification".to_string(), vec!["test-automator".to_string()]),
    ]),
};
```

