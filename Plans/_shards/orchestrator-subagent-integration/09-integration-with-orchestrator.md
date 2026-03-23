## Integration with Orchestrator

### Overseer (controlling role)

The controlling AI role within the Orchestrator is the **Overseer**. Canonical definition and responsibilities are in **Plans/Glossary.md**.

### Orchestrator Modifications

```rust
// src/core/orchestrator.rs (additions)

pub struct Orchestrator {
    // ... existing fields ...
    subagent_selector: Arc<SubagentSelector>,
    subagent_manager: Arc<SubagentManager>,
}

impl Orchestrator {
    pub fn new(config: OrchestratorConfig) -> Result<Self> {
        // ... existing initialization ...

        // Initialize subagent selector
        let project_context = Self::detect_project_context(&config.paths.workspace)?;
        let subagent_selector = Arc::new(SubagentSelector::new(project_context)?);

        // Initialize subagent manager (from interview plan)
        let subagent_manager = Arc::new(SubagentManager::new(&config.paths.workspace)?);

        Ok(Self {
            // ... existing fields ...
            subagent_selector,
            subagent_manager,
        })
    }

    /// Select and invoke subagents for tier execution
    async fn execute_tier_with_subagents(
        &self,
        tier_node: &TierNode,
        context: &OrchestratorContext,
    ) -> Result<()> {
        // Build tier context
        let tier_context = self.build_tier_context(tier_node, context)?;
        // build_tier_context MUST populate workspace/worktree/runtime snapshot fields
        // from the same frozen tier-start config snapshot used by validation/persistence.

        // Select subagents
        // DRY REQUIREMENT: SubagentSelector MUST use subagent_registry:: functions — NEVER hardcode subagent names
        let mut subagent_names = self.subagent_selector.select_for_tier(
            tier_node.tier_type,
            &tier_context,
        );

        // Apply tier overrides (replace if non-empty, else use selected list)
        // DRY REQUIREMENT: Validate override names using subagent_registry::is_valid_subagent_name()
        if let Some(overrides) = self.get_tier_overrides(tier_node.tier_type) {
            if !overrides.is_empty() {
                // Validate all override names against canonical list
                for name in &overrides {
                    if !subagent_registry::is_valid_subagent_name(name) {
                        return Err(anyhow!("Invalid subagent name in override: {}", name));
                    }
                }
                subagent_names = overrides;
            }
        }

        // Filter disabled subagents
        // DRY REQUIREMENT: Validate disabled names using subagent_registry::is_valid_subagent_name()
        subagent_names.retain(|name| {
            if !subagent_registry::is_valid_subagent_name(name) {
                log::warn!("Invalid subagent name in disabled list: {}", name);
                false
            } else {
                !self.is_subagent_disabled(name)
            }
        });

        // Add required subagents
        // DRY REQUIREMENT: Validate required names using subagent_registry::is_valid_subagent_name()
        if let Some(required) = self.get_required_subagents(tier_node.tier_type) {
            for req in required {
                if !subagent_registry::is_valid_subagent_name(&req) {
                    return Err(anyhow!("Invalid subagent name in required list: {}", req));
                }
                if !subagent_names.contains(&req) {
                    subagent_names.push(req);
                }
            }
        }

        // Get platform and model for this tier
        let platform = self.get_platform_for_tier(tier_node.tier_type)?;
        let model = self.get_model_for_tier(tier_node.tier_type)?;

        // Get coordination context
        let coordination_context = self.coordinator.get_coordination_context(&tier_context.workspace).await?;

        // Register agents in coordination state before execution
        for subagent_name in &subagent_names {
            let agent_id = format!("{}-{}", subagent_name, tier_node.id);
            self.coordinator.register_agent(ActiveAgent {
                agent_id: agent_id.clone(),
                platform,
                tier_id: tier_node.id.clone(),
                worktree_path: context.worktree_path.clone(),
                files_being_edited: Vec::new(), // Updated during execution
                current_operation: format!("Executing {} tier", tier_node.tier_type),
                started_at: Utc::now(),
                last_update: Utc::now(),
            }).await?;
        }

        // Execute subagents (sequential or parallel based on config)
        if self.config.enable_parallel_subagents {
            // Execute subagents in parallel
            let mut tasks = Vec::new();
            for subagent_name in &subagent_names {
                let task = self.execute_subagent_async(
                    platform,
                    &model,
                    subagent_name,
                    tier_node,
                    &tier_context,
                    &coordination_context,
                );
                tasks.push(task);
            }

            // Wait for all subagents to complete
            let results = futures::future::join_all(tasks).await;

            // Check for failures
            for result in results {
                result??; // Propagate errors
            }
        } else {
            // Execute subagents sequentially
            for subagent_name in &subagent_names {
                self.execute_subagent(
                    platform,
                    &model,
                    subagent_name,
                    tier_node,
                    &tier_context,
                    &coordination_context,
                ).await?;
            }
        }

        // Unregister agents from coordination state after execution
        for subagent_name in &subagent_names {
            let agent_id = format!("{}-{}", subagent_name, tier_node.id);
            self.coordinator.unregister_agent(&agent_id).await?;
        }

        Ok(())
    }

    // DRY:FN:execute_subagent — Execute a single subagent for a tier
    async fn execute_subagent(
        &self,
        platform: Platform,
        model: &str,
        subagent_name: &str,
        tier_node: &TierNode,
        tier_context: &TierContext,
        coordination_context: &str,
    ) -> Result<SubagentOutput> {
        let agent_id = format!("{}-{}", subagent_name, tier_node.id);

        // Build subagent invocation prompt with coordination context
        let invocation = self.build_subagent_invocation(
            subagent_name,
            &tier_node.description,
            tier_context,
            coordination_context,
        )?;

        // Update coordination state: mark agent as active
        self.coordinator.update_agent_operation(
            &agent_id,
            format!("Executing {}: {}", subagent_name, tier_node.title),
        ).await?;

        // Execute via platform runner with subagent
        let output = self.execute_with_subagent(
            platform,
            model,
            subagent_name,
            &invocation,
            tier_context,
        ).await?;

        // Update coordination state: extract file operations from output
        let file_operations = self.extract_file_operations_from_output(&output)?;
        self.coordinator.update_agent_files(&agent_id, &file_operations).await?;

        Ok(output)
    }

    // DRY:FN:build_subagent_invocation — Build platform-specific subagent invocation prompt
    // DRY REQUIREMENT: MUST use platform_specs::get_subagent_invocation_format() — NEVER hardcode platform-specific formats
    fn build_subagent_invocation(
        &self,
        subagent_name: &str,
        task_description: &str,
        tier_context: &TierContext,
        coordination_context: &str,
    ) -> Result<String> {
        // Build platform-specific subagent invocation using platform_specs
        let platform = self.get_platform_for_tier(tier_context.tier_type)?;

        // DRY: Use platform_specs to get subagent invocation format (DRY:DATA:platform_specs)
        // DO NOT hardcode match statements for Platform::Cursor, Platform::Codex, etc.
        // DO NOT duplicate platform-specific format strings here
        let invocation_format = platform_specs::get_subagent_invocation_format(platform)?;

        // Format invocation using platform-specific format from platform_specs
        let invocation = invocation_format
            .replace("{subagent}", subagent_name)
            .replace("{task}", task_description)
            .replace("{context}", &format_tier_context(tier_context))
            .replace("{coordination}", coordination_context);

        Ok(invocation)
    }

    // DRY:FN:extract_file_operations_from_output — Extract file paths from subagent output
    fn extract_file_operations_from_output(
        &self,
        output: &SubagentOutput,
    ) -> Result<Vec<PathBuf>> {
        // Extract file paths from subagent output
        // Can parse from task_report, downstream_context, or findings
        let mut files = Vec::new();

        // Extract from findings (file field)
        for finding in &output.findings {
            if let Some(file) = &finding.file {
                files.push(file.clone());
            }
        }

        // Extract from task_report (parse file mentions)
        // Implementation: regex or text parsing to find file paths

        Ok(files)
    }
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

**Error handling:**

- **Subagent selection failure:** If subagent selection fails, log warning and fall back to default subagent or skip subagents
- **Coordination registration failure:** If coordination registration fails, log warning and continue (coordination is best-effort)
- **Subagent execution failure:** If subagent execution fails, log error and continue with next subagent (or fail tier if critical)
- **Coordination update failure:** If coordination update fails, log warning and continue (coordination updates are best-effort)

    // DRY:FN:build_tier_context -- Build tier context for subagent selection
    fn build_tier_context(
        &self,
        tier_node: &TierNode,
        context: &OrchestratorContext,
    ) -> Result<TierContext> {
        // Detect language if not already cached
        let primary_language = self.subagent_selector
            .detect_language(&context.workspace)?
            .first()
            .map(|l| l.name.clone());

        // Determine domain from task type or description
        let domain = self.infer_domain(tier_node);

        // Detect framework
        let framework = self.detect_framework(&context.workspace)?;

        // Build context
        Ok(TierContext {
            tier_type: tier_node.tier_type,
            tier_id: tier_node.id.clone(),
            title: tier_node.title.clone(),
            description: tier_node.description.clone(),
            primary_language,
            domain,
            framework,
            needs_architecture_review: tier_node.tier_type == TierType::Phase,
            needs_product_planning: false, // Can be inferred from phase content
            subtask_focus: self.infer_subtask_focus(tier_node),
            has_errors: false, // Updated from iteration results
            needs_code_review: false,
            needs_testing: false,
            error_patterns: Vec::new(),
            parent_subagents: None, // Set from parent tier
        })
    }
}
```

## Configuration

### Subagent Configuration

```yaml
# .puppet-master/config.yaml (additions)

subagentConfig:
  enableTierSubagents: true

  # Override automatic selection
  tierOverrides:
    phase:
      default: ["project-manager"]
      architecture: ["architect-reviewer", "project-manager"]
      product: ["product-manager", "project-manager"]

    task:
      # Language-specific overrides
      rust: ["rust-engineer"]
      python: ["python-pro"]
      javascript: ["javascript-pro"]
      typescript: ["typescript-pro"]

      # Domain-specific overrides
      backend: ["backend-developer"]
      frontend: ["frontend-developer"]
      mobile: ["mobile-developer"]

    subtask:
      testing: ["test-automator"]
      documentation: ["technical-writer"]
      review: ["code-reviewer"]

    iteration:
      errors: ["debugger"]
      review: ["code-reviewer"]
      testing: ["qa-expert"]

  # Disable specific subagents
  disabledSubagents: []

  # Require specific subagents
  requiredSubagents: []
```

