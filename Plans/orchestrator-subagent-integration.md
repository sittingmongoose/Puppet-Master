# Orchestrator Subagent Integration -- Implementation Plan

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.
> **Integration policy note (2026-02-24):** Runtime integration follows the ProviderTransport taxonomy (SSOT: `Plans/Contracts_V0.md`): Cursor/Claude Code = `CliBridge`, Codex/Copilot/Gemini = `DirectApi`, OpenCode = `ServerBridge`. Any Codex/Copilot SDK references in this file are historical context only and are not implementation targets.


## Plan Document Status

**This is a PLAN DOCUMENT ONLY** -- No code changes have been made. This document contains:
- Dynamic subagent selection strategy for each tier level
- Language/technology detection and matching
- Implementation architecture
- Code changes required
- Configuration options

## Executive Summary
Internal multi-agent orchestration in Puppet Master is PM-native. Parent and child supervision, timeout propagation, thread and run lineage, shell isolation, cancellation, and crew scheduling are owned by this document together with `Plans/Contracts_V0.md` and `Plans/storage-plan.md`.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

References to external bridge or A2A mapping material are adapter guidance only. They MUST NOT be read as approval for PM-internal child orchestration, child-run control messages, budget propagation, or crew coordination to move onto A2A semantics.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_Stream_Mapping_External_Reference_A2A.md

Every child spawn, retry, cancellation, timeout, pause, resume, and completion path MUST preserve PM lineage fields (`run_id`, `thread_id`, `parent_run_id`, `child_run_id`) plus requested/effective runtime descriptors where applicable. Parent oversight and audit visibility are mandatory even when a child is executing through a bridged provider surface.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md
## Rewrite alignment (2026-02-21)

This plan remains authoritative for tier policy (Phase/Task/Subtask/Iteration), subagent selection policy, and wiring/verification requirements. As the rewrite lands (see `Plans/rewrite-tie-in-memo.md`):

- Platform-specific runner details should converge on **Providers** that emit a normalized streaming **event model**
- Tool gating/permissions should be centralized in the tool policy engine; orchestrator policy should *consume* normalized events/tools, not re-implement per-platform parsing
- Start/end verification, "built but not wired" checks, and tier boundary semantics should be represented as explicit events for replayability


### Persistence and event emission (rewrite)

- **Seglog:** Emit to the canonical seglog stream: tier start/end, iteration start/end, verification results, subagent invocation boundaries, and any event that must be replayable. Use the unified event model; do not add one-off log files for run history.
- **redb:** Persist in redb (per storage-plan.md schema): orchestrator **run** metadata (run id, PRD ref, status, timestamps); **session** identity and linkage to run; **checkpoints** at phase/task/subtask boundaries for resume and recovery. Config used by the run is built at run start per Option B (see config-wiring below).
- Implementation: run/session/checkpoint writes and seglog appends should be called from the same orchestrator boundaries (e.g. after verification, on tier advance) so state and event stream stay consistent.

### Config Wiring — Option B: Build at Run Start (Resolved, Canonical Definition) {#config-wiring}

At run start, the orchestrator builds the full execution config by merging three sources in this precedence order (later overrides earlier):
1. **GUI config defaults** (from redb `config:gui.*`): platform, model, effort, plan_mode defaults.
2. **Interview output config** (from interview artifacts): subagent assignments, phase config, research settings, technology-specific overrides.
3. **Per-tier overrides** (from PRD/plan tasks): any task-level overrides for platform, model, or effort.

Merge rules:
- Scalar values: last writer wins (per precedence).
- Arrays (e.g., `subagents`): concatenate and deduplicate.
- Objects: deep merge (per-key override).

The merged config is validated by `validate_config_wiring_for_tier()` before execution begins.

### Test Strategy Loading {#test-strategy-loading}

- Orchestrator loads `.puppet-master/interview/test-strategy.json` if present.
- Merges `items[].criterion` into tier acceptance criteria and injects relevant excerpts into prompt context.
- Missing/invalid file is WARN-only (no crash); continue execution with PRD/plan criteria only.

ContractRef: SchemaID:pm.test_strategy.schema.v1, PolicyRule:Decision_Policy.md§2

## Relationship Between the Two Plans

The rewrite no longer treats `Phase -> Task -> Subtask -> Iteration` as the canonical orchestration ontology.

Canonical orchestration identity is:
- `Feature Seam`
- `Work Package`
- `Node`
- graph generation lineage
- lane/worktree lineage

Rules:
- any surviving phase/task/subtask language is derived decomposition/view language only
- conversational actors, interview actors, and document builders may share runtime identity semantics with orchestration actors without becoming graph objects
- worktree ownership, recovery, approval, usage, and routing must align to run/node/attempt/lane/worktree identity rather than to `tier_id`

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md
## Tier-Level Subagent Strategy
Canonical worker strategy remains graph-owned rather than tier-owned, but provider/runtime selection for node workers must now use the reconciled runtime ontology.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Run_Graph_View.md

Required orchestration rules:
- node execution selects from the same provider-entry / account-or-profile model used elsewhere in the rewrite.
- the orchestrator may request a provider family pool, but the frozen requested/effective runtime snapshot must still identify the concrete provider entry selected for each node worker.
- OpenCode subagent execution selects a server profile, not an account row.
- GitHub Copilot and Codex subagent execution use direct-provider account rows rather than legacy CLI assumptions.
- orchestrator-side skill and MCP behavior follows the PM-native skill/MCP model and does not require provider-specific native skill delivery contracts.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Skills_System.md
## Debug-capable investigation orchestration

Orchestrator may launch shared investigations when builds, tests, environment setup, or runtime verification fail.

Required rules:
- Orchestrator does not switch into the Assistant `Debug` mode strip; instead, it uses the same shared investigation contracts and debug-capable tools under orchestration ownership
- investigation state remains subordinate to the owning attempt / remediation lineage rather than replacing orchestrator run identity
- delegated workers may contribute evidence, traces, or fixes to the same `investigation_id` when they are operating on the same issue
- only one mutation-capable investigation may target the same project/worktree at a time unless the orchestrator explicitly isolates work in a separate worktree or host context

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md, ContractName:Plans/MiscPlan.md

## Dynamic Subagent Selection Architecture

### Project Context Detection

```rust
// src/core/subagent_selector.rs

pub struct ProjectContext {
    pub languages: Vec<DetectedLanguage>,
    pub frameworks: Vec<String>,
    pub domain: ProjectDomain,
    pub task_type: Option<TaskType>,
    pub error_patterns: Vec<ErrorPattern>,
}

#[derive(Debug, Clone)]
pub struct DetectedLanguage {
    pub name: String,           // "rust", "python", "javascript"
    pub confidence: f32,        // 0.0-1.0
    pub indicators: Vec<String>, // ["Cargo.toml", "src/main.rs"]
}

pub enum ProjectDomain {
    Backend,
    Frontend,
    FullStack,
    Mobile,
    Infrastructure,
    Data,
    Embedded,
    Unknown,
}

pub enum ErrorPattern {
    CompilationError,
    TestFailure,
    SecurityIssue,
    PerformanceIssue,
    RuntimeError,
}
```

### Subagent Selector

```rust
// src/core/subagent_selector.rs

pub struct SubagentSelector {
    project_context: ProjectContext,
    available_subagents: HashMap<String, SubagentInfo>,
}

impl SubagentSelector {
    /// Detect project language from codebase
    // DRY:FN:detect_language — Detect programming languages in workspace
    pub fn detect_language(&self, workspace: &Path) -> Result<Vec<DetectedLanguage>> {
        let mut languages = Vec::new();

        // Check for language indicators
        if workspace.join("Cargo.toml").exists() {
            languages.push(DetectedLanguage {
                name: "rust".to_string(),
                confidence: 0.95,
                indicators: vec!["Cargo.toml".to_string()],
            });
        }

        if workspace.join("package.json").exists() {
            // Check for TypeScript
            if workspace.join("tsconfig.json").exists() {
                languages.push(DetectedLanguage {
                    name: "typescript".to_string(),
                    confidence: 0.9,
                    indicators: vec!["package.json".to_string(), "tsconfig.json".to_string()],
                });
            } else {
                languages.push(DetectedLanguage {
                    name: "javascript".to_string(),
                    confidence: 0.85,
                    indicators: vec!["package.json".to_string()],
                });
            }
        }

        if workspace.join("requirements.txt").exists() || workspace.join("pyproject.toml").exists() {
            languages.push(DetectedLanguage {
                name: "python".to_string(),
                confidence: 0.9,
                indicators: vec!["requirements.txt".to_string()],
            });
        }

        // Add more language detection...

        Ok(languages)
    }

    /// Select subagent for tier level
    // DRY:FN:select_for_tier — Select subagents for a tier based on context
    pub fn select_for_tier(
        &self,
        tier_type: TierType,
        tier_context: &TierContext,
    ) -> Vec<String> {
        match tier_type {
            TierType::Phase => self.select_for_phase(tier_context),
            TierType::Task => self.select_for_task(tier_context),
            TierType::Subtask => self.select_for_subtask(tier_context),
            TierType::Iteration => self.select_for_iteration(tier_context),
        }
    }

    fn select_for_phase(&self, context: &TierContext) -> Vec<String> {
        let mut subagents = vec!["project-manager".to_string()];

        // Add architect if architecture decisions needed
        if context.needs_architecture_review {
            subagents.push("architect-reviewer".to_string());
        }

        // Add product manager if product planning
        if context.needs_product_planning {
            subagents.push("product-manager".to_string());
        }

        subagents
    }

    fn select_for_task(&self, context: &TierContext) -> Vec<String> {
        let mut subagents = Vec::new();

        // 1. Language-specific engineer
        if let Some(lang) = &context.primary_language {
            if let Some(subagent) = self.language_to_subagent(lang) {
                subagents.push(subagent);
            }
        }

        // 2. Domain expert
        match &context.domain {
            ProjectDomain::Backend => {
                subagents.push("backend-developer".to_string());
            }
            ProjectDomain::Frontend => {
                subagents.push("frontend-developer".to_string());
            }
            ProjectDomain::FullStack => {
                subagents.push("fullstack-developer".to_string());
            }
            ProjectDomain::Mobile => {
                subagents.push("mobile-developer".to_string());
            }
            ProjectDomain::Infrastructure => {
                subagents.push("devops-engineer".to_string());
            }
            _ => {}
        }

        // 3. Framework specialist
        if let Some(framework) = &context.framework {
            if let Some(subagent) = self.framework_to_subagent(framework) {
                subagents.push(subagent);
            }
        }

        // Fallback
        if subagents.is_empty() {
            subagents.push("fullstack-developer".to_string());
        }

        subagents
    }

    fn select_for_subtask(&self, context: &TierContext) -> Vec<String> {
        let mut subagents = Vec::new();

        // Inherit from task
        if let Some(task_subagents) = &context.parent_subagents {
            subagents.extend(task_subagents.clone());
        }

        // Add specialized subagent based on subtask focus
        match &context.subtask_focus {
            Some(SubtaskFocus::CodeReview) => {
                subagents.push("code-reviewer".to_string());
            }
            Some(SubtaskFocus::Testing) => {
                subagents.push("test-automator".to_string());
            }
            Some(SubtaskFocus::Documentation) => {
                subagents.push("technical-writer".to_string());
            }
            Some(SubtaskFocus::APIDesign) => {
                subagents.push("api-designer".to_string());
            }
            Some(SubtaskFocus::UIDesign) => {
                subagents.push("ui-designer".to_string());
            }
            Some(SubtaskFocus::Security) => {
                subagents.push("security-engineer".to_string());
            }
            Some(SubtaskFocus::Performance) => {
                subagents.push("performance-engineer".to_string());
            }
            _ => {}
        }

        subagents
    }

    fn select_for_iteration(&self, context: &TierContext) -> Vec<String> {
        let mut subagents = Vec::new();

        // Inherit from parent tiers
        if let Some(parent_subagents) = &context.parent_subagents {
            subagents.extend(parent_subagents.clone());
        }

        // Add specialized roles based on iteration state
        if context.has_errors {
            subagents.push("debugger".to_string());
        }

        if context.needs_code_review {
            subagents.push("code-reviewer".to_string());
        }

        if context.needs_testing {
            subagents.push("qa-expert".to_string());
        }

        // Error pattern matching
        for pattern in &context.error_patterns {
            match pattern {
                ErrorPattern::SecurityIssue => {
                    subagents.push("security-auditor".to_string());
                }
                ErrorPattern::PerformanceIssue => {
                    subagents.push("performance-engineer".to_string());
                }
                _ => {}
            }
        }

        subagents
    }

    // DRY:DATA:language_to_subagent_mapping — Single source of truth for language → subagent mapping
    // DRY REQUIREMENT: MUST use subagent_registry::get_subagent_for_language() — NEVER hardcode language → subagent mappings
    fn language_to_subagent(&self, lang: &str) -> Option<String> {
        // Use canonical subagent registry (DRY:DATA:subagent_registry)
        // DO NOT use match statements like: match lang { "rust" => Some("rust-engineer".to_string()), ... }
        subagent_registry::get_subagent_for_language(lang)
    }

    // DRY:DATA:framework_to_subagent_mapping — Single source of truth for framework → subagent mapping
    // DRY REQUIREMENT: MUST use subagent_registry::get_subagent_for_framework() — NEVER hardcode framework → subagent mappings
    fn framework_to_subagent(&self, framework: &str) -> Option<String> {
        // Use canonical subagent registry (DRY:DATA:subagent_registry)
        // DO NOT use match statements like: match framework { "react" => Some("react-specialist".to_string()), ... }
        subagent_registry::get_subagent_for_framework(framework)
    }
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

### Tier Context

```rust
// src/types/state.rs (additions)

pub struct TierContext {
    pub tier_type: TierType,
    pub tier_id: String,
    pub title: String,
    pub description: String,
    pub workspace: PathBuf,
    pub worktree_path: Option<PathBuf>,

    // Project context
    pub primary_language: Option<String>,
    pub domain: ProjectDomain,
    pub framework: Option<String>,

    // Tier-specific
    pub needs_architecture_review: bool,
    pub needs_product_planning: bool,
    pub subtask_focus: Option<SubtaskFocus>,

    // Iteration state
    pub has_errors: bool,
    pub needs_code_review: bool,
    pub needs_testing: bool,
    pub error_patterns: Vec<ErrorPattern>,

    // Inheritance
    pub parent_subagents: Option<Vec<String>>,

    // Frozen tier-runtime snapshot
    pub requested_persona: Option<String>,
    pub effective_persona: Option<String>,
    pub requested_platform: Option<Platform>,
    pub effective_platform: Platform,
    pub requested_model: Option<String>,
    pub effective_model: String,
    pub persona_stage: Option<String>,
}

pub enum SubtaskFocus {
    CodeReview,
    Testing,
    Documentation,
    APIDesign,
    UIDesign,
    Security,
    Performance,
    Database,
}
```

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

  executionLimits:
    maxNestingDepth: 4
    maxTotalSpawnedAgents: 99
    maxToolRoundsPerAgent: 200
    maxConcurrentCrewsPerPlatform: 4
    maxConcurrentAgentsPerCrew: 8
    maxTotalActiveAgents: 32

  taskEnvelopeDefaults:
    timeoutMs: inherit_parent_remaining_budget

  tierOverrides:
    phase:
      default: ["project-manager"]
      architecture: ["architect-reviewer", "project-manager"]
      product: ["product-manager", "project-manager"]
    task:
      rust: ["rust-engineer"]
      python: ["python-pro"]
      javascript: ["javascript-pro"]
      typescript: ["typescript-pro"]
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

  disabledSubagents: []
  requiredSubagents: []
```

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Executor_Protocol.md

`executionLimits` is the SSOT for global subagent concurrency and budget defaults. Surface-specific caps such as interview reviewer limits may narrow these values, but MUST NOT widen them.

ContractRef: ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Crosswalk.md

PM-native internal orchestration scope:
- parent-child control, timeout propagation, cancellation, and crew coordination stay under PM runtime contracts
- bridged-provider or A2A material may inform adapter translation only
- no external bridge contract may replace PM lineage, requested/effective state, or audit visibility

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md

#### Child effective authority and timeout contract

Child execution is parent-clamped at dispatch time:
- child runs inherit the parent's effective tool policy, write scope, runtime/account surface restrictions, and remaining budget as hard upper bounds
- child-specific requests MAY narrow those bounds, but they MUST NOT widen them
- the orchestrator snapshots the effective child authority in spawn/start metadata so audit, cancellation, and budget enforcement operate on the same frozen view

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md

Envelope schema (per task):
- `timeoutMs` (u64): maximum wall-clock milliseconds for the child task. Default: `inherit_parent_remaining_budget`.
- `parentRemainingBudgetMs` (u64): the parent's remaining budget at dispatch time, computed as `parent_timeout - parent_elapsed`.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Architecture_Invariants.md

Propagation rules:
- `timeoutMs` defaults to the parent's remaining budget (`parentRemainingBudgetMs`)
- per-task overrides MAY narrow the timeout (`timeoutMs < parentRemainingBudgetMs`)
- per-task overrides MUST NOT exceed the parent's remaining budget; if a requested `timeoutMs` exceeds `parentRemainingBudgetMs`, the orchestrator clamps it and emits a diagnostic warning
- at each nesting level, `parentRemainingBudgetMs` is recalculated from the dispatching agent's own remaining budget, not from the original root budget
- before child dispatch, budget preflight checks evaluate the estimated request cost against the child-visible remaining run/session budgets; an over-budget request fails closed with `kill.budget_exceeded` and the child is not started
- after a provider response, actual cost recording MAY terminate the child with `done.budget_exceeded` when cumulative run or session spend crosses budget, but the usage record is durably written before teardown

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Executor_Protocol.md

Enforcement:
- when `timeoutMs` expires, the orchestrator sends cancellation to the child task
- provider processes get a 5-second grace period; MCP and LSP helper surfaces get a 3-second grace period before forceful teardown
- timeout expiration produces a structured `done.task_timeout` terminal record with the child's task identity, elapsed time, and effective timeout value

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md

#### Shell and runtime isolation contract

Shell and runtime isolation is enforced at the orchestrator level. These rules are implementation contracts, not advisory governance.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md

Scope rules:
- each agent tree receives its own shell instance set; shell instances MUST NOT be shared across agent trees
- environment variables MUST NOT leak across session, agent, or crew boundaries; each shell instance starts with a clean environment derived from project configuration, not inherited from sibling or parent runtime mutations
- the orchestrator retains full visibility into child communication and shell/runtime identity for audit, diagnostics, and cancellation

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/storage-plan.md

Lifecycle rules:
- shell instances are created at agent-tree spawn time and destroyed at agent-tree teardown
- if a shell instance crashes or becomes unresponsive, the orchestrator MUST NOT silently reuse a sibling shell; it creates a new isolated shell or fails the task with a structured error
- shell teardown at agent-tree completion MUST clean up child processes, temporary files, and environment state associated with that shell instance

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md

#### Child teardown and deallocation


#### Task tool contract alignment

Orchestrator delegation uses the shared `task` contract rather than an orchestration-local lifecycle.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md

Child lifecycle:
`pending → running → completed | failed | cancelled | timed_out`

Alignment rules:
- resume reuses the same `delegated_session_id`
- `owner_hint` resolves by exact match against `crew.roles`; on no match the current session remains the owner
- hidden or unavailable subagents are not advertised as choices
- nested `task` remains denied by default
- retries are parent-owned policy rather than child self-retry behavior
## Benefits

1. **Dynamic Adaptation:** Automatically selects appropriate subagents based on project context
2. **Language Awareness:** Never uses Rust engineer for Swift projects
3. **Domain Expertise:** Matches subagents to task domains (backend/frontend/etc.)
4. **Error Handling:** Automatically invokes debugger when errors occur
5. **Specialization:** Uses specialized subagents for focused tasks
6. **Inheritance:** Subagents flow down the tier hierarchy appropriately

## Implementation Phases

### Implementation note: Phase 1 - Project Context Detection
- [ ] Implement `ProjectContext` detection
- [ ] Language detection from codebase files
- [ ] Framework detection
- [ ] Domain inference from task descriptions

### Implementation note: Phase 2 - Subagent Selector
- [ ] Implement `SubagentSelector` with tier-level selection logic
- [ ] Language-to-subagent mapping
- [ ] Framework-to-subagent mapping
- [ ] Domain-to-subagent mapping

### Implementation note: Phase 3 - Orchestrator Integration
- [ ] Add subagent selection to orchestrator
- [ ] Build tier context from tier nodes
- [ ] Invoke subagents via platform runners
- [ ] Handle subagent responses

### Implementation note: Phase 4 - Error Pattern Detection
- [ ] Detect error patterns from iteration outputs
- [ ] Automatically invoke debugger/security-auditor/etc.
- [ ] Pattern-based subagent selection

### Phase 5: Testing & Refinement
- [ ] Test with different project types (Rust, Python, JavaScript, Swift)
- [ ] Verify subagent selection accuracy
- [ ] Refine selection logic based on results
- [ ] **Provider connectivity smoke tests**: Run transport-specific smoke checks with minimal subagent-style prompts; CLI smoke for CLI-bridged providers (Cursor, Claude Code), direct API smoke for Direct-provider Gemini, and server-endpoint/tool-handshake smoke for Server-bridged OpenCode; assert success and expected output/response shape; environment-gated or manual where CI has no auth/connectivity.
- [ ] **Subagent-invocation integration tests**: Build and execute the actual orchestrator CLI command per platform for a given tier + subagent; verify invocation path and run completion.
- [ ] **Plan mode CLI verification (CLI-bridged only)**: Run real CLIs for CLI-bridged providers (Cursor, Claude Code) with plan mode enabled (e.g. `--mode=plan`, `--permission-mode plan`); assert exit success and that plan-mode flags are applied and honored; environment-gated like other CLI tests.

## Provider Connectivity Smoke Tests & Subagent Invocation Testing

### 1. Provider Connectivity Smoke Tests

**Purpose:** Confirm that each provider's invocation path (CLI for CLI-bridged providers, server endpoint/tool handshake for Server-bridged OpenCode, and API for Direct providers) can be exercised with a subagent-style prompt and returns a successful run with usable output. These tests validate the **invocation path** (binary/server/API, args, env) and **basic behavior**, not full orchestrator logic.

**Scope:** One smoke test per provider (Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, Gemini). CLI-bridged providers (Cursor, Claude Code) run their real CLIs; Server-bridged OpenCode is validated via server endpoint/tool handshake (no CLI requirement); Direct providers (Codex, GitHub Copilot, Gemini) use minimal API calls. Each test issues a minimal, non-destructive prompt that triggers subagent behavior (or equivalent) and asserts process/response success and output shape.

**Environment gating:** Tests are transport-specific and require corresponding prerequisites (CLI installed for CLI-bridged providers, reachable/authenticated OpenCode server for Server-bridged, API key/auth for Direct providers). They MUST be gated so they do not fail CI when prerequisites are missing.

ContractRef: PolicyRule:Decision_Policy.md§2

**Implementation:**

- **Gate:** Only run provider connectivity smoke tests when the appropriate env var is set and required transport prerequisites are available. If not set or prerequisite missing, skip with a clear message (for example, "skipped: Cursor CLI not available", "skipped: OpenCode endpoint not configured", or "skipped: Gemini API key missing").
- **Per-platform commands and assertions:**
  - **Cursor:** Run `agent -p "/code-reviewer Review the last commit." --output-format json` (or current equivalent from platform_specs). Assert exit code 0 (or documented non-zero for "no changes"). Assert stdout is non-empty and, if JSON, parseable; optionally assert presence of expected top-level keys.
  - **Claude:** Run `claude -p "As code-reviewer, respond with only: READY" --no-session-persistence --output-format text`. Assert exit code 0 and stdout contains expected token (e.g. READY) or is non-empty.
  - **OpenCode:** Validate ServerBridge connectivity by performing a minimal server endpoint/tool handshake (for example, list tools or execute a no-op tool call). Assert successful handshake/response and expected response shape.
  - **Codex:** Codex is a Direct API provider; verify API connectivity with a minimal request. Assert successful response and non-empty, parseable JSON.
  - **GitHub Copilot:** Copilot is a Direct API provider; verify API connectivity with a minimal request. Assert successful response and non-empty, parseable JSON.
  - **Gemini:** Gemini is a Direct API provider; verify API connectivity by sending a minimal generation request via the Gemini API. Assert a successful response with non-empty, parseable JSON.
- **Artifacts:** Optionally capture stdout/stderr to `.puppet-master/evidence/cli-smoke-<platform>.log` for debugging; do not assert on exact text, only on success and shape.
- **Documentation:** In the plan and in code comments, document that these tests are optional/manual in CI and list required env vars (e.g. `RUN_CURSOR_CLI_SMOKE=1`, `RUN_OPENCODE_SERVER_SMOKE=1`, `RUN_GEMINI_API_SMOKE=1`) and that auth/connectivity must be configured for the corresponding provider.

**Test location and naming:**

- **File:** `puppet-master-rs/tests/provider_connectivity_smoke.rs` (or under `puppet-master-rs/tests/integration/`).
- **Tests:** `cursor_cli_smoke`, `claude_cli_smoke`, `opencode_server_smoke`, `codex_api_smoke`, `copilot_api_smoke`, `gemini_api_smoke`.
- **Runner:** Use `#[ignore]` by default with a clear reason ("requires provider auth/connectivity prerequisites"); run with `cargo test --ignored` or a dedicated `cargo test provider_connectivity_smoke` when env is set.

**Fleshed-out example (Cursor):**

```rust
// puppet-master-rs/tests/provider_connectivity_smoke.rs

#[test]
#[ignore = "Requires Cursor CLI (agent) installed and authenticated; set RUN_CURSOR_CLI_SMOKE=1"]
fn cursor_cli_smoke() {
    if std::env::var("RUN_CURSOR_CLI_SMOKE").is_err() {
        return;
    }
    let binary = which_binary("agent").or_else(|| which_binary("cursor-agent"))
        .expect("Cursor CLI not on PATH");
    let output = std::process::Command::new(binary)
        .args(["-p", "/code-reviewer Reply with only: SMOKE_OK", "--output-format", "json"])
        .output()
        .expect("Failed to run Cursor CLI");
    assert!(output.status.success(), "Cursor CLI failed: stderr = {:?}", String::from_utf8_lossy(&output.stderr));
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(!stdout.trim().is_empty(), "Cursor CLI produced empty stdout");
    if let Ok(json) = serde_json::from_str::<serde_json::Value>(&stdout) {
        assert!(json.is_object() || json.is_array(), "Expected JSON object or array");
    }
}
```

Other providers follow the same transport-specific pattern: check env gate, run the minimal connectivity probe for that provider transport (CLI, server handshake, or API), and assert success with non-empty/parseable output.

---

### 2. Subagent-Invocation Integration Tests

**Purpose:** Verify that the **exact** command line the orchestrator would use for a given tier and subagent is built correctly and that executing it completes without unexpected failure. This catches regressions in argument construction, subagent naming, and platform-specific flags.

**Scope:** At least one integration test per platform that (1) builds the invocation (command + args + env) as the orchestrator would, (2) runs it against the real CLI (or a script that mimics it), and (3) asserts that the run completes successfully and, where possible, that the invocation path (e.g. subagent name in the prompt) is correct.

**Implementation:**

- **Orchestrator invocation builder:** Use the same code path the orchestrator uses to build the CLI command (e.g. a function that takes `platform`, `tier_type`, `subagent_name`, `prompt`, `model` and returns `Command`). Do not duplicate logic in tests.
- **Per-platform integration test:**
  - Build the invocation for a fixed scenario (e.g. tier = Task, subagent = `code-reviewer`, minimal prompt).
  - Execute it (real CLI or, if documented, a script that echoes the command and returns success for CI without auth).
  - Assert: process success; optionally that stdout/stderr contain the subagent name or expected token; and that no "unknown subagent" or "invalid flag" style errors appear in stderr.
- **Environment gating:** Same as smoke tests: skip when CLI is not available or auth is not configured; use env vars (e.g. `RUN_SUBAGENT_INVOCATION_TESTS=1`) and optional `#[ignore]` so CI without CLIs still passes.
- **Artifacts:** Log the exact command and, if possible, a short excerpt of stdout/stderr to `.puppet-master/evidence/subagent-invocation-<platform>.log` for debugging.

**Test location and naming:**

- **File:** `puppet-master-rs/tests/subagent_invocation_integration.rs` (or under `puppet-master-rs/tests/integration/`).
- **Tests:** `cursor_subagent_invocation`, `codex_subagent_invocation`, `claude_subagent_invocation`, `gemini_subagent_invocation`, `copilot_subagent_invocation`.
- **Runner:** Same as smoke tests; run with env set or `cargo test --ignored` / `cargo test subagent_invocation`.

**Fleshed-out example (invocation builder + one platform):**

```rust
// puppet-master-rs/tests/subagent_invocation_integration.rs

/// Builds the exact Command the orchestrator would use for Cursor + subagent.
// DRY requirement: must use platform_specs::cli_binary_names() — never hardcode "agent" or "cursor-agent"
// DRY requirement: must use platform_specs::get_subagent_invocation_format() — never hardcode "/{subagent} {prompt}" format
fn build_cursor_subagent_command(
    subagent_name: &str,
    prompt: &str,
    model: &str,
    workspace: &std::path::Path,
) -> std::process::Command {
    use std::process::Command;
    // DRY: Use platform_specs for binary name — DO NOT hardcode "agent"
    let binary = crate::platforms::platform_specs::cli_binary_names(crate::types::Platform::Cursor)
        .first()
        .copied()
        .unwrap_or("agent");
    // DRY: Use platform_specs for invocation format — DO NOT hardcode "/{subagent} {prompt}"
    let invocation_format = platform_specs::get_subagent_invocation_format(Platform::Cursor)
        .unwrap_or_else(|_| "/{} {}".to_string());
    let full_prompt = invocation_format
        .replace("{subagent}", subagent_name)
        .replace("{task}", prompt);
    let mut cmd = Command::new(binary);
    cmd.arg("-p").arg(&full_prompt)
        .arg("--output-format").arg("json");
    if !model.is_empty() && model != "auto" {
        cmd.arg("--model").arg(model);
    }
    cmd.current_dir(workspace);
    cmd
}

#[tokio::test]
#[ignore = "Requires Cursor CLI and auth; set RUN_SUBAGENT_INVOCATION_TESTS=1"]
async fn cursor_subagent_invocation() {
    if std::env::var("RUN_SUBAGENT_INVOCATION_TESTS").is_err() {
        return;
    }
    let workspace = tempfile::tempdir().unwrap();
    let cmd = build_cursor_subagent_command(
        "code-reviewer",
        "Reply with only: INVOKED",
        "auto",
        workspace.path(),
    );
    let output = cmd.output().expect("Failed to run Cursor");
    assert!(output.status.success(), "Invocation failed: {:?}", String::from_utf8_lossy(&output.stderr));
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("code-reviewer") || stdout.contains("INVOKED") || !stdout.trim().is_empty(),
            "Expected subagent or echo in output: {}", stdout);
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

**Summary table:**

| Test type | What it runs | What it asserts | When to run |
|-----------|---------------|-----------------|-------------|
| Platform CLI smoke | Real CLI + minimal subagent cmd | Exit success, non-empty/parseable output | Env-gated or manual |
| Subagent-invocation integration | Orchestrator's command/call for tier+subagent | Invocation succeeds; output shape / no "invalid" errors | Env-gated or manual |
| Plan mode CLI verification | Real CLI + plan mode flags for CLI-bridged providers | Exit success; plan-mode flag present and honored | Env-gated or manual |

Both sections should be referenced from Phase 5 and from any "Testing" or "Verification" summary in the plan so implementers and reviewers know that real CLI and invocation-path verification are in scope.

---

### 3. Plan Mode CLI Verification (Real-CLI Tests)

**Purpose:** Confirm that each CLI-bridged platform accepts and honors plan mode when invoked with the same flags the orchestrator uses for that CLI surface (for example `--mode=plan` or `--permission-mode plan`). This validates plan mode end-to-end in the real CLIs, not just that we pass the right args.

**Scope:** One plan-mode test per CLI-bridged provider (`Cursor CLI`, `Claude Code CLI`). Direct providers (`Gemini`, `Codex`, `GitHub Copilot`) are verified through PM runtime-policy and provider-integration tests rather than through CLI plan-mode commands. Each CLI test runs the real CLI with plan mode enabled and a minimal prompt, then asserts process success and, where possible, that the platform behaved in a plan-like way.

**Environment gating:** Same as other CLI tests: require CLI on PATH and (where applicable) auth; gate with an env var (e.g. `RUN_PLAN_MODE_CLI_TESTS=1`) and use `#[ignore]` so CI without CLIs/auth still passes.

**Implementation:**

- **Gate:** Only run when the appropriate env var is set and the CLI binary is available. Skip with a clear "skipped: plan mode CLI test (set RUN_PLAN_MODE_CLI_TESTS=1)" style message if not set or binary missing.
- **Per-platform commands (must match runner build_args when plan_mode is true):**
  - **Cursor:** `agent -p "Reply with only: PLAN_OK" --mode plan --output-format json`. Assert exit code 0 and non-empty stdout; optionally assert `--mode` and `plan` appear in the effective command or in logs.
  - **Claude:** `claude -p "Reply with only: PLAN_OK" --permission-mode plan --no-session-persistence --output-format text`. Assert exit code 0 and stdout contains expected token or is non-empty.
- **Assertions:** (1) Process exit success. (2) Stdout non-empty (or parseable JSON where applicable). (3) Optionally: verify that the command line actually contained the plan-mode flag (e.g. by logging the command and asserting the flag string is present, or by using the same builder as the runner and checking args).
- **Artifacts:** Optionally capture stdout/stderr to `.puppet-master/evidence/plan-mode-cli-<platform>.log` for debugging.
- **Documentation:** Document in plan and code that these tests are optional/manual in CI; list env var `RUN_PLAN_MODE_CLI_TESTS=1` and that auth must be configured for the corresponding platform.

**Test location and naming:**

- **File:** `puppet-master-rs/tests/plan_mode_cli_verification.rs` (or under `puppet-master-rs/tests/integration/`).
- **Tests:** `cursor_plan_mode_cli`, `claude_plan_mode_cli`.
- **Runner:** Use `#[ignore]` by default with reason "requires installed CLI and auth; set RUN_PLAN_MODE_CLI_TESTS=1"; run with `cargo test --ignored` or `cargo test plan_mode_cli` when env is set.

**Fleshed-out example (Cursor plan mode):**

```rust
// puppet-master-rs/tests/plan_mode_cli_verification.rs

#[test]
#[ignore = "Requires Cursor CLI and auth; set RUN_PLAN_MODE_CLI_TESTS=1"]
fn cursor_plan_mode_cli() {
    if std::env::var("RUN_PLAN_MODE_CLI_TESTS").is_err() {
        return;
    }
    let binary = which_binary("agent").or_else(|| which_binary("cursor-agent"))
        .expect("Cursor CLI not on PATH");
    // Same flags as CursorRunner when request.plan_mode == true
    let output = std::process::Command::new(binary)
        .args([
            "-p", "Reply with only: PLAN_OK",
            "--mode", "plan",
            "--output-format", "json",
        ])
        .output()
        .expect("Failed to run Cursor CLI");
    assert!(output.status.success(), "Cursor plan mode CLI failed: stderr = {:?}", String::from_utf8_lossy(&output.stderr));
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(!stdout.trim().is_empty(), "Cursor plan mode produced empty stdout");
    // Optional: assert --mode plan was honored (e.g. no file writes in stderr for plan mode)
}
```

Other platforms follow the same pattern: use the exact plan-mode flags from the corresponding runner's `build_args` when `request.plan_mode` is true, run the CLI, assert success and non-empty/expected output.

**Relationship to other tests:** Plan mode CLI verification complements (1) platform CLI smoke tests (which may run without plan mode) and (2) subagent-invocation tests (which can run with or without plan mode). Plan mode tests focus specifically on "plan mode on" and ensure we fully test it in the real CLIs as we do for subagent and basic smoke.

## Plan Mode Strategy & Defaults

The orchestrator must follow the reconciled PM rule for delegated work in `ask` and `plan`.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md, ContractName:Plans/assistant-chat-design.md

Canonical decision:
- `ask` and `plan` may launch delegated child runs only for read-only research or analysis.
- required planning dependencies may still be child runs when they remain read-only.
- parent mode is a hard ceiling.
- the orchestrator must not silently widen a read-only planning run into execution authority.

The orchestrator should classify planning children as `required` or `optional` so planning completion and summarization behave deterministically.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md
## GUI and Backend Scope (All In-Scope Now)

All previously "optional" or "later" plan-mode and subagent GUI/backend items are **in scope now**. The following specifies frontend and backend so they work end-to-end.

### 1. Plan Mode -- Backend

- **Defaults:** In `default_config.rs`, set `plan_mode: false` for phase, task, subtask, iteration. In `config_override.rs` and YAML defaults, use `plan_mode: false` unless explicitly overridden. In `gui_config.rs`, keep tier defaults at `false` for migration-safe behavior.
- **Global "use plan mode for all tiers":** Add `use_plan_mode_all_tiers: bool` to `GuiConfig` (canonical storage; no separate `settings.json` key). Optionally add `last_per_tier_plan_mode: Option<HashMap<String, bool>>` to restore per-tier values when turning the global toggle off. When `use_plan_mode_all_tiers == true`, load/sync forces all four tier `plan_mode` values to `true`. When toggled off, restore `last_per_tier_plan_mode` or set all to `false`. Use write-through so tier configs and saved YAML stay in sync.
- **Subagent invocations:** When building `ExecutionRequest` for subagent runs (e.g. in `execute_tier_with_subagents` or the platform adapter), set `request.plan_mode = tier_config.plan_mode` (from `TierConfig` or `IterationContext`). Document in plan and code.
- **Gemini:** Gemini is a Direct API provider; plan-mode constraints are applied via API parameters. In Doctor, validate Gemini API key presence when any tier uses Gemini. No CLI settings file interaction is needed.

### 2. Plan Mode -- Frontend (Config)

- **DRY:** Use existing widgets from `docs/gui-widget-catalog.md` (e.g. toggler, styled_button); tag any new reusable widget with `// DRY:WIDGET:`.
- **Global toggle:** In Config, above the tier cards, add one toggle: "Use plan mode for all tiers". Message e.g. `Message::ConfigUsePlanModeAllTiersToggled(bool)`. Handler: if `true`, set all four tier configs' `plan_mode` to `true` and persist `use_plan_mode_all_tiers = true`; if `false`, set all to `false` (or restore from `last_per_tier_plan_mode`) and persist. When global is on, tier plan_mode toggles are disabled and show true; when global is off, tier toggles are editable.
- **One-click button:** Next to or under the global toggle, add button "Enable plan mode for all tiers". Message e.g. `Message::ConfigEnablePlanModeAllTiers`. Handler: set phase, task, subtask, iteration `plan_mode` to `true` and set `use_plan_mode_all_tiers = true`; persist.
- **Tooltip:** In `widgets/tooltips.rs`, update `tier.plan_mode` to: "When enabled, the AI creates a detailed plan before writing code. Recommended: enable for all tiers for more reliable, step-by-step behavior. Optional for simple iterations."
- **Persistence:** Ensure `use_plan_mode_all_tiers` (and optional `last_per_tier_plan_mode`) are saved/loaded with the rest of GUI config.

### 3. Plan Mode -- Frontend (Wizard)

- **Default for new runs:** When the Wizard builds initial tier config for a new run, set `plan_mode: false` for all tiers (from `default_config` or explicitly in wizard init). Wizard tier/plan-mode toggles should reflect this.
- **One-click:** If the Wizard has tier-level plan mode toggles, add "Enable plan mode for all tiers" (same semantics as Config) so users can align all tiers in one action.

### 4. Subagent -- Backend

The orchestrator launches PM child runs, not provider-native ad hoc agent processes.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Personas.md, ContractName:Plans/storage-plan.md

Backend requirements:
- every delegated launch creates a canonical child-run record.
- each child is marked `required` or `optional`.
- child routing resolves requested versus effective Persona, runtime surface, model, and effort.
- capability narrowing is applied before launch.
- child lifecycle actions remain distinct: retry, reroute, replacement, resume, cancellation.
- parent orchestration state is a projection over child records/events, not a separate ad hoc store.

Parent orchestration responsibilities:
- maintain child rollups by batch and subgroup.
- consolidate overlapping child escalations before asking the user.
- summarize required child outcomes before optional findings.
- keep unresolved required children from being treated as complete.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md
### 5. Subagent -- Frontend (Config)

- **DRY:** Check `docs/gui-widget-catalog.md` before adding controls; use existing toggler, styled_button, layout helpers; tag new reusable widgets/helpers with `DRY:WIDGET:` or `DRY:FN:`; run `scripts/generate-widget-catalog.sh` after changes.
- **Section:** Add a "Subagents" section on the Config page (below tier cards or in a collapsible block). Controls: (1) **Enable tier subagents:** one toggle bound to `subagentConfig.enableTierSubagents`. Message e.g. `Message::ConfigSubagentEnableTierSubagentsToggled(bool)`. (2) **Tier overrides:** For each tier (phase/task/subtask/iteration), a text field or list editor for override subagent names (comma-separated or multi-select from a fixed list of known subagent names). (3) **Disabled subagents:** one list (comma-separated or tag input) for `disabledSubagents`. (4) **Required subagents:** same for `requiredSubagents`. Messages: e.g. `ConfigSubagentTierOverrideChanged(tier, list)`, `ConfigSubagentDisabledListChanged(Vec<String>)`, `ConfigSubagentRequiredListChanged(Vec<String>)`. Handler: update in-memory config and persist; backend reads from same persisted config.
- **Subagent personas / info setup:** Provide a **place to setup and view subagent personas/info**. (1) **Seed/import:** Discover provider-native definitions (for example the project's `.claude/agents` directory) and import them into Puppet Master Persona storage as starter content; imported files may supply the initial name and description/purpose, but they are not canonical runtime storage. (2) **User control:** Users can **add their own** Personas and **delete any** imported or user-created Persona from Puppet Master storage. (3) **Smaller footprint:** Support an optional pass (e.g. AI or batch job) to **trim** persona content to a smaller token footprint while preserving intent; the normalized result is saved back into Puppet Master Persona storage with provenance to the imported source. (4) **Canonical Persona content -- single source:** User edits happen in the Personas UI and persist to Puppet Master Persona storage defined in `Plans/Personas.md`, not to provider-native directories and not as a second runtime source in `SubagentGuiConfig`. At runtime, resolve the subagent name to the canonical Persona stored by Puppet Master; provider-native files remain import/refresh sources only. UI: dedicated "Subagent personas" tab or subsection (Config or Setup); list showing name + description; "Edit" to change the canonical Persona content; "Add" / "Delete" for list management.
- **Discovery:** Subagent names in the override UI come from a constant list (e.g. from this plan's persona list: project-manager, architect-reviewer, product-manager, rust-engineer, python-pro, code-reviewer, test-automator, ...) or from a future subagent registry; document so UI and backend share the same names.

### 6. Doctor -- Gemini Plan Mode Check

- **Check:** In `doctor/` (new check or inside existing config check): if any tier has platform Gemini, validate that a Google Gemini API key is configured. Gemini is a Direct API provider; no CLI settings file check is needed.

### 7. Implementation Checklist (GUI & Backend -- Add/Expand)

See the updated **Implementation checklist** below; it includes all of the above as concrete tasks.

---

## Gaps and Clarifications

These items are underspecified or inconsistent in the plan. Resolve them during implementation so frontend and backend work end-to-end.

### 1. Where to persist `use_plan_mode_all_tiers`

- **Gap:** The plan says add to "GuiConfig or app settings that save to `.puppet-master/settings.json`".
- **Clarify:**

**Plan Mode Global State (Resolved — Option A: GuiConfig):**
- Add `use_plan_mode_all_tiers: bool` to `GuiConfig`.
- Default: `false` (migration-safe; users opt in).
- Persisted in redb (`config:gui.use_plan_mode_all_tiers`).
- SSOT: this field in GuiConfig. `settings.json` is NOT used for this setting.
- GUI: toggle in Settings → Orchestration → "Use plan mode for all tiers" checkbox.
- Per-tier overrides still available (stored separately in tier config).

### 2. Subagent config in GuiConfig

- **Gap:** Plan says load subagent config from `.puppet-master/config.yaml` under `subagentConfig`, and "single save path that includes subagent config," but **GuiConfig** (in `config/gui_config.rs`) has no `subagentConfig` field.
- **Clarify:** Add a top-level field to **GuiConfig**, e.g. `subagent: SubagentGuiConfig`, with `enable_tier_subagents`, `tier_overrides`, `disabled_subagents`, `required_subagents`. Serialize as `subagentConfig` in YAML (or `subagent` with serde rename) so load/save use the same file as the rest of Config. Ensure default in GuiConfig matches plan defaults (enable_tier_subagents: true, empty overrides/lists). **Persona content storage:** For the "Subagent personas / info setup" feature, do **not** store canonical Persona body overrides inside `SubagentGuiConfig`. Persona description/instruction edits persist in Puppet Master Persona storage per `Plans/Personas.md`; config may store selection or visibility state only if needed. At runtime, resolve the subagent name against Puppet Master Persona storage first; provider-native agent directories are seed/import sources only. Orchestrator and interview both read the same canonical Persona content.

### 3. Doctor Gemini plan-mode check: source of tier config

- **Gap:** The check must know "any tier has platform Gemini and plan_mode == true." Doctor checks currently have `async fn run(&self) -> CheckResult` with no parameters.
- **Clarify:** The Gemini plan-mode check should **discover and load the project config** inside `run()`: use `config_discovery::discover_config_path(None)` then `gui_config::load_config(path)` (or the same loader the Config page uses). If the file is not GuiConfig-shaped, fall back to "skip check" or "warn: could not read tier config." This keeps the DoctorCheck trait unchanged and uses the same config file as the app.

### 4. Canonical list of subagent names

### Delegated tool-contract alignment

Orchestrator delegation enters the same `task` tool child-run contract used elsewhere.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Commands_System.md, ContractName:Plans/interview-subagent-integration.md

Rules:
- no provider-native `/subagent`, `/agent`, `/fleet`, or `/delegate` syntax is normative orchestrator runtime behavior.
- launch validation goes through `subagent_registry` and the requested/effective runtime pipeline.
- explicit runtime-surface requests do not silently fallback.
- Copilot-native routing remains strict-denied unless the parent is already Copilot-rooted.
- command subtasks and orchestrator child runs are not separate runtime classes.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Run_Modes.md
### 5. Tier overrides: one list per tier vs contextual keys

- **Gap:** YAML shows `tierOverrides.phase.default`, `.phase.architecture`, `.phase.product`, `.task.rust`, `.task.python`, etc. The GUI section says "for each tier (phase/task/subtask/iteration), a text field or list editor for override subagent names."
- **Clarify:** Decide (a) **Simple:** one list per tier (phase, task, subtask, iteration) so `tier_overrides` is e.g. `HashMap<TierName, Vec<String>>` and YAML is `phase: [project-manager]`, `task: [rust-engineer]`, or (b) **Full:** keep contextual keys (phase.default, phase.architecture, task.rust, ...) and add UI for them (e.g. phase: "default" / "architecture" / "product" with a list each). For first implementation, (a) is enough; document that contextual overrides can be added later if needed.

### 6. Orchestrator and subagent code not yet present

- **Gap:** The plan references `execute_tier_with_subagents`, `build_subagent_invocation`, `execute_with_subagent`, and `SubagentSelector`. These do not exist in the codebase yet; they are specified in the plan's "Integration with Orchestrator" and Phase 3.
- **Clarify:** Phase 3 (and any subagent execution path) must: (1) Read `enable_tier_subagents` from config; if false, skip subagent invocation (or use a single non-subagent path). (2) When building the list of subagents for a tier, apply `tier_overrides` (replace or merge with selected list), then filter by `disabled_subagents` and ensure `required_subagents` are included. (3) When building `ExecutionRequest` for each subagent run, set `request.plan_mode = tier_config.plan_mode`. Ensure the checklist item "Ensure subagent/invocation path receives tier plan_mode" is done in that code path.

### 7. Message enum and app.rs handlers

- **Gap:** The plan names messages (e.g. `ConfigUsePlanModeAllTiersToggled`, `ConfigEnablePlanModeAllTiers`, `ConfigSubagentEnableTierSubagentsToggled`, ...) but does not list all new `Message` variants or where each is handled in `app.rs`.
- **Clarify:** During implementation, add every new variant to the `Message` enum and a corresponding branch in `App::update`. Document in the plan or in code: "Plan mode global: ConfigUsePlanModeAllTiersToggled, ConfigEnablePlanModeAllTiers; Subagent: ConfigSubagentEnableTierSubagentsToggled, ConfigSubagentTierOverrideChanged, ConfigSubagentDisabledListChanged, ConfigSubagentRequiredListChanged."

### 8. Tier id type for `last_per_tier_plan_mode`

- **Gap:** Plan says `last_per_tier_plan_mode: Option<HashMap<TierId, bool>>`. The codebase uses tier names as strings (e.g. `"phase"`, `"task"`).
- **Clarify:** Use `HashMap<String, bool>` keyed by tier name (`"phase"`, `"task"`, `"subtask"`, `"iteration"`) unless a dedicated `TierId` type already exists; then use that consistently.

### 9. Interview config wiring and execution config

- **Gap:** Several interview settings exist in `InterviewGuiConfig` and `InterviewConfig` but are not in `InterviewOrchestratorConfig` and are never used in `interview/` (orchestrator, phase_manager, prompt_templates). See **"Interviewer Enhancements and Config Wiring"** and **"Avoiding Built but Not Wired"** in this plan.
- **Clarify:** (1) **Min/max questions:** Add `min_questions_per_phase` and `max_questions_per_phase` (Option for unlimited) to `InterviewOrchestratorConfig`; set from `gui_config.interview` in `app.rs`; pass into PhaseManager and use in phase-complete logic and prompts. (2) **require_architecture_confirmation** and **vision_provider:** Add to `InterviewOrchestratorConfig`, set at construction, and use in interview flow (architecture gate and vision platform selection). (3) For any future execution-affecting interview setting, follow the three-step wiring checklist: add to execution config, set at construction, use in runtime.

### 10. Platform-specific subagent output parsers

- **Gap:** Structured handoff validation (`validate_subagent_output`) needs platform-specific parsers: JSON for Cursor/Claude/Gemini, JSONL for Codex, text parsing for Copilot. The plan does not yet specify parser implementation details or fallback behavior when parsing fails.
- **Clarify:** (1) **JSON parsers:** For Cursor/Claude/Gemini, use `serde_json` to parse `--output-format json` output into `SubagentOutput`. Handle missing fields gracefully (e.g., `downstream_context: None` if field absent). (2) **JSONL parser:** For Codex, parse `--json` or `--experimental-json` JSONL stream; aggregate events into single `SubagentOutput` (last event wins for fields, accumulate findings). (3) **Text parser:** For Copilot, use regex or pattern matching to extract "Task Report:", "Downstream Context:", "Findings:" sections from text output. If sections missing, treat as malformed and retry. (4) **Fallback:** If parsing fails after retry, create partial `SubagentOutput { task_report: raw_output, downstream_context: None, findings: vec![] }` and mark tier as "complete with warnings" rather than failing the run.

**Subagent Output Parser Fallback (Resolved):**

Platform-specific parsers handle output from each Provider:
- **Cursor/Claude/Gemini:** JSON parser (stream-json NDJSON events)
- **Codex:** JSONL parser (newline-delimited JSON events)
- **Copilot:** Text parser (plain text output, regex-based signal extraction)

When a platform-specific parser fails:
1. **Log:** Record parse error in seglog (`parser.error` event) with the first 500 characters of raw output for diagnostics.
2. **Generic fallback:** Attempt generic text extraction — scan for completion signals (including legacy naming variants), error patterns (stack traces, "error:", "fatal:"), and file modification markers.
3. **If generic succeeds:** Use extracted data; flag the turn as `parser_fallback_used` in seglog metadata.
4. **If generic also fails:** Treat as a Provider error. Retry once with the same Provider. If retry also fails, surface error to user: "Could not parse output from [Provider]. [Retry] [Skip] [View raw output]."
5. **Never silently drop output.** All raw output is preserved in the seglog event regardless of parse success.

### 11. Subagent Persona info: storage, overrides, and injection

- **Resolved:** Persona storage layout, schema, validation, GUI management, and context-injection rules are canonically defined in `Plans/Personas.md` (SSOT). This gap is closed; do not restate those definitions here.
- **Summary:** (1) **Storage:** `Plans/Personas.md` §2 — project-local (`.puppet-master/personas/<id>/PERSONA.md`) overrides global (`~/.config/puppet-master/personas/<id>/PERSONA.md`). (2) **Overrides:** User edits Personas via the GUI (Settings > Advanced > Personas); edits persist to Puppet Master Persona storage only — never to `.claude/`, `.github/`, or other provider-native dirs (`Plans/Personas.md` §4.4). (3) **Injection:** The context compiler resolves the Persona and injects its Markdown body into the Instruction Bundle (`Plans/Personas.md` §5.2). Orchestrator and interview use the same injection logic. (4) **Interview:** Interview selects Personas dynamically by phase/tech stack; Persona overrides supply custom content for selected Personas but do not change *which* Personas are selected (`Plans/Personas.md` §5.2).

ContractRef: ContractName:Plans/Personas.md#PERSONA-INJECTION, ContractName:Plans/Personas.md#STORAGE-LAYOUT

---

## DRY Method Compliance

**CRITICAL:** All code in this plan MUST follow DRY principles. This section documents DRY requirements and violations to avoid.

ContractRef: PolicyRule:Plans/DRY_Rules.md#dry-method-compliance

### DRY Requirements

1. **Platform Data -- ALWAYS use platform_specs:**
   - ❌ **NEVER** hardcode platform CLI commands, binary names, models, auth, or capabilities
   - ✅ **ALWAYS** use `platform_specs::` functions (e.g., `platform_specs::cli_binary_names()`, `platform_specs::get_subagent_invocation_format()`, `platform_specs::supports_effort()`)
   - ✅ **ALWAYS** use `platform_specs::discover_platform_capabilities()` instead of platform match statements

2. **Subagent Names -- ALWAYS use subagent_registry:**
   - ❌ **NEVER** hardcode subagent names in match statements or mappings
   - ✅ **ALWAYS** use `subagent_registry::` functions (e.g., `subagent_registry::get_subagent_for_language()`, `subagent_registry::is_valid_subagent_name()`)
   - ✅ **ALWAYS** reference `DRY:DATA:subagent_registry` as the single source of truth

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

3. **Tag All Reusable Items:**
   - ✅ Tag reusable functions: `// DRY:FN:<name> -- Description`
   - ✅ Tag reusable data structures: `// DRY:DATA:<name> -- Description`
   - ✅ Tag reusable widgets: `// DRY:WIDGET:<name> -- Description`
   - ✅ Tag reusable helpers: `// DRY:HELPER:<name> -- Description`

4. **Widget Reuse:**
   - ✅ **ALWAYS** check `docs/gui-widget-catalog.md` before creating new UI
   - ✅ **ALWAYS** use existing widgets from `src/widgets/`
   - ✅ If bespoke UI is required, add `// UI-DRY-EXCEPTION: <reason>`

### DRY Violations Fixed in This Plan

- ✅ `build_subagent_invocation`: Now uses `platform_specs::get_subagent_invocation_format()` instead of hardcoded platform match
- ✅ `language_to_subagent` / `framework_to_subagent`: Now use `subagent_registry::` functions instead of hardcoded mappings
- ✅ `platform_agents_dir`: Now uses `platform_specs::get_agents_directory_name()` instead of hardcoded platform match
- ✅ `invoke_subagent`: Now uses `platform_specs::get_subagent_invocation_format()` instead of hardcoded platform match
- ✅ `discover_capabilities`: Now uses `platform_specs::discover_platform_capabilities()` instead of hardcoded platform match
- ✅ Subagent registry: Created `DRY:DATA:subagent_registry` module as single source of truth for all subagent names and mappings

### DRY Method and GUI Widget Catalog

The codebase follows the **DRY method** (reuse-first) and uses a **widget catalog** for UI. When implementing the plan-mode and subagent GUI (Config, Wizard, Doctor), follow these rules so new UI stays consistent and discoverable.

### Widget catalog

- **Before adding any new UI:** Check **`docs/gui-widget-catalog.md`** (the full widget and data-source catalog). Use existing widgets instead of hand-rolling (e.g. `styled_button`, `page_header`, `refresh_button`, `toggler`, `selectable_label`, `help_tooltip`, `themed_panel`, `modal_overlay`).
- **Location:** The catalog is at `docs/gui-widget-catalog.md`; AGENTS.md references it as the place to check before creating new UI. Reusable widgets live in `puppet-master-rs/src/widgets/`.
- **Plan-mode and subagent UI:** For the global plan-mode toggle, one-click button, and Subagents section, prefer existing controls (toggler, styled_button, layout helpers). If no widget fits, add a new one and register it in the catalog (see below).

### DRY tagging

- **Tag all new reusable items** so agents and developers can find them via `grep -r "DRY:" puppet-master-rs/src/`.
- **Conventions (from AGENTS.md):**
  - `// DRY:WIDGET:<name>` -- Reusable UI widget (see `src/widgets/`).
  - `// DRY:DATA:<name>` -- Single source of truth data (e.g. subagent name list, config struct).
  - `// DRY:FN:<name>` -- Reusable helper or query function.
  - `// DRY:HELPER:<name>` -- Shared utility.
- **What to tag in this plan's scope:** New widgets or helpers used by Config/Wizard/Doctor (e.g. a subagent multi-select helper, or a "plan mode global" row widget if factored out). New data sources (e.g. canonical subagent list constant or module) as `DRY:DATA:`. New message handlers or config helpers as `DRY:FN:` where appropriate.
- **Bespoke UI:** If you must implement something that doesn't use an existing widget, add an inline rationale: `// UI-DRY-EXCEPTION: <reason>`.

### After widget or catalog changes

- Run **`scripts/generate-widget-catalog.sh`** to refresh the catalog.
- Run **`scripts/check-widget-reuse.sh`** (warn-only, exit 0) to catch reuse opportunities.

### Checklist

- [ ] **DRY / catalog:** Before implementing plan-mode and subagent GUI, read `docs/gui-widget-catalog.md` and use existing widgets where possible; tag new reusable widgets/helpers/data with `DRY:WIDGET:`, `DRY:FN:`, or `DRY:DATA:`; run `generate-widget-catalog.sh` and `check-widget-reuse.sh` after UI changes.

---

## Potential Issues

Risks, edge cases, and failure modes to watch during implementation and testing.

### 1. Default for `use_plan_mode_all_tiers` and existing configs

- **Issue:** If we default `use_plan_mode_all_tiers` to `true`, the first time an existing project loads (with no such key), we might force all tiers to plan mode and overwrite user's previous per-tier choices.
- **Mitigation:** Default `use_plan_mode_all_tiers` to `false` so existing configs are unchanged. Only users who turn the global toggle on get "all tiers plan mode." Optionally, when the key is missing, do not force tier values on load.

### 2. Invalid subagent names in overrides

- **Issue:** User can type or paste invalid names in tier overrides or disabled/required lists. Orchestrator or platform CLI may then receive unknown names and fail or misbehave.
**Subagent Name Validation (Resolved):**

**In UI (GUI config):**
- Use **autocomplete/multi-select** populated from the canonical subagent name registry. Invalid names cannot be entered.
- If a name is typed that doesn't match any registered subagent, show inline error: "Unknown subagent: [name]. Check spelling or register the subagent first."

**On save/apply:**
- **Reject** invalid entries with a clear error message. Do not save config with invalid subagent names.

**In backend (execution):**
- **Fail fast** with a clear error: "Unknown subagent '[name]' in tier config. Available: [list]." Do not silently filter.
- Emit `config.validation.failed` seglog event.

**Canonical subagent name registry:** Maintained in `platform_specs` or a dedicated `subagent_registry` module. Names are stable strings (kebab-case, e.g., `architect-reviewer`, `security-auditor`).

### 3. Gemini API key validation

- **Issue:** Gemini is a Direct API provider. The Doctor check must validate that a Google Gemini API key is present and valid when any tier uses Gemini.
- **Mitigation:** (1) **Key:** Check for the configured Gemini API key in app settings. (2) **Validation:** Optionally send a lightweight API probe to verify the key is active. (3) **Errors:** If no key is configured and a tier uses Gemini, Doctor should warn "Gemini API key is not configured; Gemini tiers will fail."

### 4. Doctor check when config is not GuiConfig

- **Issue:** Some projects may use a different config format (e.g. legacy or alternate YAML shape). `gui_config::load_config` might fail or return a partial struct.
- **Mitigation:** In the Gemini plan-mode check, if load fails or tiers are missing, skip the check or emit a neutral warning ("could not load tier config; ensure config file is valid") so Doctor doesn't fail hard.

### 5. Wizard vs Config and global plan mode

- **Issue:** Wizard has its own `wizard_tier_configs`; even with default plan mode set to false, we must ensure that when the user finishes the wizard and a run is created, we don't overwrite or ignore the global `use_plan_mode_all_tiers` from Config (or vice versa).
- **Mitigation:** **Decision:** When the user completes the Wizard and creates a run, use Wizard tier config as the source of truth for that run (platform, model, plan_mode per tier). When Wizard persists to the config file (e.g. on Save or Apply), merge with existing Config: apply "global plan mode on ⇒ set all tier plan_mode true" and write subagent config from Config if present, so the saved file stays consistent. Wizard UI does not need the global plan-mode toggle; per-tier plan mode toggles (and optional "Enable plan mode for all tiers" button) are enough.

### 6. Tier overrides are per tier type, not per node

- **Issue:** Overrides are keyed by tier type (phase, task, subtask, iteration). All parallel subtasks share the same "subtask" override list, so we can't say "Subtask A: rust-engineer, Subtask B: react-specialist" via overrides.
- **Mitigation:** Accept for v1 that overrides are per tier type. Document that per-node overrides (or context-aware overrides) are out of scope for the first version. Dynamic selection (language/framework) still differentiates parallel subtasks when overrides are not set.

### 7. Subagent personas and non-Cursor platforms

- **Issue:** Plan describes "Cursor subagent personas." Codex, Claude, Gemini, Copilot may not recognize the same names or syntax (e.g. `/code-reviewer` vs prompt preamble).
- **Mitigation:** In platform runners, when building the prompt or args for a subagent, use platform_specs or a small adapter (e.g. `subagent_prompt_prefix(platform, subagent_name) -> String`) so that: Cursor => `/subagent_name ` + user prompt; Codex/Claude/Gemini/Copilot => "As <subagent_name>, " + user prompt in system or first message, or omit if platform has no convention. Document in AGENTS.md which platforms support which subagent semantics. Implement the adapter so adding a new platform is a single match arm or config entry.

### 8. Caching of project context / language detection

- **Issue:** Subagent selection runs language/framework detection (e.g. filesystem reads). If run on every tier or every iteration, it could be slow or redundant.
- **Mitigation:** Cache detection per workspace path (cache key: canonical workspace path). Invalidate when the config is reloaded or the workspace path for the run changes. Expose a single entry point (e.g. `get_project_context(workspace) -> Result<ProjectContext>`) that returns cached value if valid. Phase 1/2 implement this; the orchestrator calls that entry point instead of running detection on every tier. Consider a TTL or "cache for the duration of the run" so long sessions don't hold stale data if the user edits the repo.

### 9. Required vs disabled subagents conflict

- **Issue:** User could add the same name to both "required" and "disabled." Backend behavior could be ambiguous.
- **Mitigation:** **Rule: required wins.** When building the final subagent list: (1) Start from selected list or override list. (2) Add all names in `required_subagents`. (3) Remove any name in `disabled_subagents` unless it is in `required_subagents`. Document this in code and in the Config UI tooltip. In the UI, optionally grey out or hide in the disabled list any name that appears in required.

### 10. Meaning of empty override list

- **Issue:** If `tier_overrides.phase = []`, does that mean "no subagents for phase" or "no override; use auto-selected list"?
- **Mitigation:** **Rule: missing or empty override = use auto-selection.** Only a non-empty override list for a tier replaces the selector output. To force no subagents for a tier, the user sets `enable_tier_subagents` false (global) or we add a per-tier "use no subagents" option in a later version. **Implement:** In the orchestrator, if `tier_overrides.get(tier)` is `None` or `Some([])`, use the list from `SubagentSelector::select_for_tier`; otherwise use the override list. Document in code and in the Config tooltip for tier overrides.

### 11. Persistence and dirty state

- **Issue:** User toggles global plan mode or subagent settings and switches tab or closes before save. Changes could be lost or only partially written.
- **Mitigation:** Follow existing Config save behavior: save on explicit Save action and/or mark dirty and prompt on leave. Ensure `use_plan_mode_all_tiers`, `last_per_tier_plan_mode` (if used), and the full `subagent` block (SubagentGuiConfig) are part of the same `GuiConfig` struct and are written in the same `gui_config::save_config()` call from the Config view so we never persist only tier config without plan-mode global or subagent settings. When the user clicks Save on any Config tab, the entire `gui_config` (including these fields) is serialized to the same YAML file.

### 12. Start/end verification overhead and quality definition

- **Issue:** Start and end verification at every Phase/Task/Subtask (wiring, readiness, acceptance, quality) adds latency and requires a clear definition of "quality" and who addresses unrelated failures.
- **Mitigation:** (1) Quality over performance: run full checks; do not skip or weaken for speed. Scope quality checks to changed files or this tier's artifacts to stay practical. (2) Define a small canonical quality checklist per tier (e.g. in this plan or verification config): reviewer subagent (required) plus gate criteria (clippy, tests, etc.). (3) Reviewer subagent runs in all three cases: always at end-of-tier, on retry, and when quality gate fails. (4) Unrelated failures (e.g. pre-existing tech debt) are addressed by the parent-tier orchestrator (retry, different subagent, escalate). Reuse existing gates where possible; end verification should call into current gate logic rather than duplicate it.

### 13. Platform-specific hook integration and parser reliability

- **Issue:** Lifecycle hooks and structured handoff validation require platform-specific implementations (native hooks vs orchestrator middleware, JSON vs JSONL vs text parsing). Parsers may fail on edge cases (malformed JSON, missing sections in text, JSONL aggregation errors).
- **Mitigation:** (1) **Hooks:** For platforms with native hooks (Cursor, Claude, Gemini), register Puppet Master hooks that delegate to platform hooks where possible; for others (Codex, Copilot), use orchestrator-level middleware. Document which platforms use which approach. (2) **Parsers:** Implement robust parsers with fallback behavior: JSON parsers handle missing fields gracefully; JSONL parser aggregates events safely (last event wins, accumulate findings); text parser uses multiple patterns and validates extracted sections. (3) **Fail-safe:** If parsing fails after retry, create partial `SubagentOutput` and mark tier as "complete with warnings" rather than crashing. (4) **Testing:** Add integration tests for each platform's parser with malformed input, missing fields, and edge cases to ensure reliability.

### 14. Subagent persona overrides (token budget and scope)

- **Issue:** Custom instruction snippets in persona overrides could be long; injecting them into every subagent prompt may consume token budget or conflict with platform limits.
- **Mitigation:** (1) Persona edits apply to any subagent name that exists in the current list (imported from provider-native seed files or user-created in Puppet Master storage). The canonical content lives in Puppet Master Persona storage; do not maintain a second runtime source in config. (2) Optionally cap length of editable Persona instruction/description content in UI and storage workflows (e.g. 500-1000 chars for inline override affordances) and document that persona text is prepended to the prompt so users are aware of token impact. (3) Use the same resolution (canonical Puppet Master Persona content, with optional re-import/trim refresh) in both orchestrator and interview.

---

## Interviewer Enhancements and Config Wiring

This section addresses **interview-specific** config that is built in the GUI and/or config types but not yet wired into the interview execution path, and defines **min/max questions per phase** behavior plus process and validation to avoid "built but not wired" across the app.

### Current state: interview config wiring gap

The Config tab (Interview tab) and `InterviewGuiConfig` / `PuppetMasterConfig.interview` (`InterviewConfig`) define several settings. The **interview orchestrator** is built with `InterviewOrchestratorConfig` in `app.rs` (from `gui_config.interview`). Only a subset of GUI/config fields are passed into `InterviewOrchestratorConfig` and used in `interview/` (orchestrator, phase_manager, prompt_templates, completion_validator).

**Audit result -- interview settings:**

| Field | In GUI / InterviewConfig | In InterviewOrchestratorConfig | Used in interview/ | Status |
|-------|--------------------------|--------------------------------|-------------------|--------|
| `platform`, `model`, `backup_platforms` | Yes | Yes (primary_platform, backup_platforms) | Yes | Wired |
| `output_dir` | Yes | Yes (output_dir) | Yes | Wired |
| `reasoning_level` | Yes | Via request.reasoning_effort | Yes | Wired |
| `first_principles` | Yes | Yes | Yes | Wired |
| `generate_playwright_requirements`, `generate_initial_agents_md` | Yes | Yes | Yes | Wired |
| **`max_questions_per_phase`** | Yes | **No** | **No** (PhaseManager uses hardcoded 3/8) | **Not wired** |
| **`require_architecture_confirmation`** | Yes | **No** | **No** | **Not wired** |
| **`vision_provider`** | Yes | **No** | **No** | **Not wired** |

So three interview settings are currently **built but not wired**. Users who change them in Config see no effect on interview behavior.

### Interview question limits (min / max per phase)

**Planned change:**

1. **Replace** the single "Max questions per phase" with:
   - **Minimum questions per phase** (e.g. `min_questions_per_phase: u32`, default 3).
   - **Max questions per phase** with an **Unlimited** option (e.g. `max_questions_per_phase: Option<u32>`; `None` = unlimited).

2. **Dynamic behavior:** The interview agent may signal phase completion (e.g. `<<<PM_PHASE_COMPLETE>>>`). The orchestrator should:
   - **Accept** phase complete only when the current phase's question count is **≥** `min_questions_per_phase`.
   - If `max_questions_per_phase` is `None` (unlimited), no upper bound check.

**Max Questions Per Phase — Soft Cap (Resolved):**
When `max_questions_per_phase` is configured:
- **Soft cap with grace:** Accept phase completion when the agent signals complete and question count ≤ `max + 1` (one grace question for wrap-up).
- **Force-complete:** If question count exceeds `max + 1` without the agent signaling complete, force-complete the phase:
  - Emit a `phase.force_completed` seglog event with `reason: "max_questions_exceeded"`.
  - Use the answers collected so far as the phase output.
  - Log a warning: "Phase [X] force-completed after [N] questions (max: [max])."
- **No reject:** Never reject a phase that has already collected valid answers. The cap prevents runaway agent loops, not data loss.
- Config: `interview.phases.{phase_name}.max_questions` (per-phase), `interview.max_questions_per_phase` (global default).

3. **Wiring (full path):**
   - **Types:** Add to `InterviewGuiConfig` and `InterviewConfig`: `min_questions_per_phase: u32`, `max_questions_per_phase: Option<u32>` (and remove or repurpose the old single `max_questions_per_phase`).
   - **Execution config:** Add the same two fields to `InterviewOrchestratorConfig` (`interview/orchestrator.rs`).
   - **Construction:** In `app.rs`, when building `InterviewOrchestratorConfig` from `gui_config.interview`, set `min_questions_per_phase` and `max_questions_per_phase` from `gui_config.interview`.
   - **Phase manager:** Pass these into phase definitions or into `PhaseManager` (e.g. in `default_phases()` / `add_dynamic_phase()`), so each phase has min/max available.
   - **Orchestrator logic:** In `process_ai_turn` (or equivalent), when `parsed.is_phase_complete`, compute current phase question count; if count < min, reject (e.g. send back "Ask at least N questions"); if max is `Some(m)` and count > m, either reject or accept depending on product rule; otherwise accept.
   - **Prompts:** In `prompt_templates.rs` (or equivalent), inject the configured min (and max if set) into the instructions, e.g. "Ask at least {min} questions..." and "Do not exceed {max} questions..." when max is set.
   - **GUI:** Interview tab: replace single max control with Min (number input) and Max (number input + "Unlimited" option). Use existing DRY widgets and tooltips.
   - **Docs:** AGENTS.md or interview doc: document min/max and Unlimited; tooltips in Config.
   - **Tests:** Unit tests for min/max logic (accept/reject at boundaries); integration test that builds config from `gui_config` and runs one phase; env-gated smoke if needed.

### Other unwired interview settings -- resolution

- **`require_architecture_confirmation`**
  **Intended behavior:** Before leaving certain phases (e.g. architecture/tech stack), the interview requires explicit user or agent confirmation of architecture/tech choices.
  **Wiring:** Add `require_architecture_confirmation: bool` to `InterviewOrchestratorConfig`; set from `gui_config.interview` in `app.rs`. In the interview flow, add a step or phase gate that, when this is true, waits for or prompts for explicit confirmation (e.g. a dedicated phase or a prompt line) before allowing phase complete. Document in interview prompts and in AGENTS.md.

- **`vision_provider`**
  **Intended behavior:** When the interview or follow-up uses image/vision (e.g. screenshots, diagrams), this setting selects the preferred platform for vision-capable requests.
  **Wiring:** Add `vision_provider: String` to `InterviewOrchestratorConfig`; set from `gui_config.interview` in `app.rs`. When building requests that include images, use this platform (filtered by platform_specs vision capability). If no image flow exists yet, wire the field and leave the behavior as "use when implementing image/vision flows"; document that in the plan or code.

### Main-run config source note

The **main orchestrator** (run loop) gets config via `ConfigManager::discover()` and `get_config()` (i.e. from disk as `PuppetMasterConfig`). The Config tab saves `GuiConfig` to the same path. Ensure the saved YAML shape is compatible with `PuppetMasterConfig` for all execution-affecting fields (tiers, orchestrator, interview, etc.) so that saving from the Config tab does not drop or default values that the run expects. If the run uses a project hint (e.g. current project path), prefer `ConfigManager::discover_with_hint(project_path)` so the run uses the same file the user edited.

---

## Avoiding "Built but Not Wired"

To prevent users from hitting settings that exist in the UI and requirements but never affect execution, this plan adopts **two complementary approaches**: (A) **process and explicit wiring steps**, and (B) **tier-level config-wiring validation** at Phase, Task, Subtask, and Iteration.

### Approach A: Process -- explicit wiring steps and checklist

**Rule:** For every new config or feature that **affects execution** (interview limits, tier plan_mode, subagent toggles, etc.), the implementation **must** include explicit wiring steps. This applies to both the orchestrator/subagent work and to other flows (e.g. interview, start-chain, Doctor).

**Wiring checklist (per feature/setting):**

1. **Execution config type:** Add the field to the **runtime config** used by the component that executes (e.g. `InterviewOrchestratorConfig`, or the `PuppetMasterConfig` / tier config used by the main orchestrator). Do not only add it to GUI or file-only config.
2. **Construction / load:** When building that runtime config from GUI or from file (e.g. in `app.rs` when starting the interview, or when the run loads config), **set** the field from the source of truth (e.g. `gui_config.interview.*`, or `config.tiers.phase.*`).
3. **Runtime use:** In the execution path (orchestrator, phase manager, prompt builder, runner), **read** the field and use it to decide behavior (e.g. min/max question checks, plan_mode, subagent list). No "dead" fields in the execution config.

**Where to document:**

- **This plan:** The "Interviewer Enhancements and Config Wiring" and "Avoiding Built but Not Wired" sections are the canonical description. New features that add execution-affecting config should reference this checklist in their implementation notes.
- **AGENTS.md:** Add a short subsection (e.g. under "DO" or "Pre-Completion Verification Checklist") that says: for any new execution-affecting config, follow the three-step wiring checklist (add to execution config, set at construction, use in runtime). Link to this plan or to REQUIREMENTS.md if a more detailed wiring policy is written there.
- **REQUIREMENTS.md (optional):** If the project keeps a requirements doc, add a line under non-functional or process requirements: "All execution-affecting configuration must be wired: present in execution config, set when building from GUI/file, and used in the execution path."

**Who does it:** Implementers and reviewers. Code review should verify that new settings that appear in the Config UI or config file have a corresponding execution-config field and usage in the right module (interview, core/orchestrator, etc.).

**UI wiring enforcement (GUI projects):** For user projects that include a GUI, the wiring matrix (`.puppet-master/project/ui/wiring_matrix.json`) and command catalog (`.puppet-master/project/ui/ui_command_catalog.json`) serve as the mechanical enforcement of "built but not wired" for the UI layer. Every interactive element must appear in the wiring matrix with a bound command and handler; orphan elements and orphan commands are both validation failures. This complements the config-wiring validation (Approach B) by extending "no unwired features" to the UI surface of the user project. The orchestrator's tier-boundary validation (§Start and End Verification) includes a UI wiring check for nodes with UI scope.

### Approach B: Tier-level config-wiring validation (Phase / Task / Subtask / Iteration)

**Rule:** The orchestrator (or a shared validation layer) runs a **config-wiring check at each tier boundary** -- when entering a Phase, when entering a Task, when entering a Subtask, and when entering an Iteration. The check verifies that the config that **should** affect execution at that tier is **present and actually used** (e.g. tier config exists, plan_mode is read from config, interview limits are present in interview config when in interview flow). This catches "built but not wired" even when the checklist is missed.

**Rationale for "at each tier":** A single run-start check can miss tier-specific wiring (e.g. task-tier plan_mode not applied for a task). Checking at Phase, Task, Subtask, and Iteration ensures that the config in effect for that tier is the one the code path uses, and that no tier is accidentally running with defaults or stale values.

**What to validate (by tier):**

- **Phase (start of phase):**
  - Tier config for phase is present (platform, model, plan_mode, etc.).
  - If global plan-mode is used, it is reflected in phase tier config (or explicitly overridden).
  - If this run is an **interview** run: interview execution config (e.g. `InterviewOrchestratorConfig`) includes min/max questions and any other execution-affecting interview fields that the interview flow is supposed to use; if any are missing, validation fails or warns (see below).
- **Task (start of task):**
  - Tier config for task is present and matches config source (e.g. from run config).
  - Subagent config (if subagents enabled) is present and applied (e.g. overrides, disabled, required lists are read from config).
- **Subtask (start of subtask):**
  - Tier config for subtask is present.
  - Subagent list for this subtask is derived from config (selector + overrides) and not hardcoded.
- **Iteration (start of iteration):**
  - Tier config for iteration is present (platform, model, plan_mode).
  - Iteration request (e.g. `ExecutionRequest`) is built using that tier config (plan_mode, platform, model), not defaults.

**How to implement:**

- **Single validation entry point:** Introduce a function or small module, e.g. `validate_config_wiring_for_tier(tier_type, config_snapshot, context) -> Result<(), WiringError>`. It receives the current tier type (Phase/Task/Subtask/Iteration), the config (or the relevant slice: tier config, interview config, subagent config), and optional context (e.g. "interview run" vs "main run"). It checks the items above for that tier and returns Ok or an error listing what is missing or unused.
- **Where to call:** In the main orchestrator, at the point where execution **enters** a new Phase, Task, Subtask, or Iteration (e.g. immediately before building the execution context or spawning the agent for that tier), call this validator. For the **interview** orchestrator, call an interview-specific validator at phase start (and at any sub-tier if the interview has task/subtask-like boundaries) that checks `InterviewOrchestratorConfig` for min/max, require_architecture_confirmation, vision_provider.
- **Fail-fast vs warn:** **Recommendation:** Fail fast (return error, log, and surface to user) when a **required** execution-affecting field is missing from the execution config (e.g. tier config for that tier is absent). **Warn** (log and optionally toast) when a field exists in GUI/file config but is not present in the execution config (classic "built but not wired"). This keeps runs from proceeding with wrong config while highlighting wiring gaps without blocking if the product chooses to allow default behavior for optional fields.
- **Tests:** Add unit tests that build config from `gui_config` (or from a minimal `PuppetMasterConfig`), then call the validator for each tier type; assert that when a known execution-affecting field is missing from the execution config, the validator fails or warns as specified. Integration test: start a run (or interview) and trigger one phase and one task; assert validation ran (e.g. via log or a test double).

**Summary table -- where validation runs:**

| Tier      | When                    | What is checked                                                                 |
|-----------|-------------------------|----------------------------------------------------------------------------------|
| Phase     | Start of phase          | Phase tier config present; plan_mode/orchestrator flags; interview config (if interview run). |
| Task      | Start of task           | Task tier config present; subagent config present and applied.                   |
| Subtask   | Start of subtask        | Subtask tier config present; subagent list from config.                          |
| Iteration | Start of iteration      | Iteration tier config present; request built from tier config.                   |

### Combining A and B

- **Process (A)** reduces wiring omissions by making the checklist mandatory for new features.
- **Validation (B)** at each Phase/Task/Subtask/Iteration catches remaining omissions and ensures that the config in effect at that tier is the one the code uses. Together, they keep "built but not wired" from reaching users.

---

## Start and End Verification at Phase, Task, and Subtask

Beyond config-wiring validation (which runs at **start** of each tier), this section defines a **broader start verification** (wiring + readiness) and an **end verification** (wiring again + **quality review**) at Phase, Task, and Subtask boundaries. The goal is to catch things that need to be wired, confirm GUI/backend are in sync, validate that steps make sense, and at the end not only pass acceptance criteria but ensure the work was done well via actual code review. **Human-in-the-Loop (HITL):** Optional pause for human approval at these same boundaries is specified in **Plans/human-in-the-loop.md** (runs after end verification, before advancing to the next tier).

Canonical lifecycle alignment:
- Verification results are persisted as seglog/redb events and projections (`config.validation.*`, `run.qa_cycle_*`, HITL events), not as authoritative ad hoc JSON files.
- Executor node `status` remains governed by `Plans/Executor_Protocol.md`; labels such as `waiting_approval`, `needs_review`, and warning states are overlays/projections, not replacement node statuses.
- Start verification blocks before any provider spawn. End verification runs before promotion and before any HITL pause for the same tier.

### Start-of-phase / start-of-task / start-of-subtask verification

When the orchestrator **enters** a Phase, Task, or Subtask, run the following **before** building execution context or spawning the agent:

1. **Config-wiring check (existing):** Run `validate_config_wiring_for_tier` (or equivalent) for this tier -- tier config present, plan_mode/subagent/interview fields wired. See **Approach B** above.
2. **Wiring and readiness checklist (new):**
   - **Does the GUI need to be updated?** For any execution-affecting setting that this tier uses: is there a corresponding control or display in the Config (or Wizard) so the user can see and change it? If a new setting was added to the backend and is used at this tier, the GUI should expose it (or document why it is internal-only).
   - **Does the backend need to be updated?** For any control or config field that the user can set in the GUI: is it read and applied in the execution path for this tier? If the GUI has a setting that should affect this tier but the backend does not use it, treat as "built but not wired" and fail or warn per policy.
   - **Do these steps make sense?** For this tier, is the sequence of operations (load config → select subagents → build request → run) consistent with the plan and with the config schema? For example: if subagents are enabled for this tier, is the subagent list actually derived from config and not hardcoded?
   - **Gaps or potential issues:** Are there known gaps (e.g. missing persistence, missing validation, platform-specific limitations) that could affect this tier? Optionally run a lightweight "gap check" (e.g. list of known gaps per tier type) and log or warn so operators see them.
   - **UI wiring check (GUI projects):** If `.puppet-master/project/ui/` exists and the current tier node's scope involves UI work, verify that the node's `contract_refs` include at least one wiring matrix entry or command catalog ID. At end-of-tier, re-run the "no unbound UI actions" check against the current state of `ui/wiring_matrix.json` to ensure new interactive elements added during execution are wired.

**BeforeTierStart verification responsibilities:**

- **Load tier config:** Load tier configuration from `PuppetMasterConfig` (or equivalent) for this tier type
- **Validate config wiring:** Call `validate_config_wiring_for_tier(tier_type, config)` to check tier config present, plan_mode/subagent/interview fields wired
- **Check GUI-backend mapping:** Load GUI-backend mapping (from `config_wiring.rs` or static list) and verify all execution-affecting settings have GUI controls
- **Check backend-GUI mapping:** Verify all GUI controls are read and applied in execution path for this tier
- **Validate operation sequence:** Check that operation sequence (load config → select subagents → build request → run) is consistent with config schema
- **Run gap check:** Load known gaps per tier type and log/warn if any affect this tier
- **Build verification result:** Create `StartVerificationResult` with pass/fail status and detailed findings

**DuringTierStart verification responsibilities:**

- **Log verification results:** Log verification results to `.puppet-master/logs/verification.log`
- **Handle failures:** If verification fails, either fail fast (per policy) or warn and continue (per policy)
- **Update state:** Update orchestrator state with verification results

**AfterTierStart verification responsibilities:**

- **Persist verification results:** Emit canonical `config.validation.passed|warning|failed` events and update redb projections for this tier/runtime snapshot
- **Track verification history:** Add verification entry to verification history for this tier

**Implementation:** Create `src/verification/tier_start.rs` with `verify_tier_start()` function. Integrate with orchestrator tier entry point.

**Integration with orchestrator:**

In `src/core/orchestrator.rs`, extend tier entry logic:

```rust
use crate::verification::tier_start::{verify_tier_start, StartVerificationError, StartVerificationResult};

impl Orchestrator {
    pub async fn execute_tier(
        &self,
        tier_node: &TierNode,
        context: &OrchestratorContext,
    ) -> Result<()> {
        // Run start verification BEFORE building execution context
        let verification_result = verify_tier_start(
            tier_node.tier_type,
            &self.config,
            context,
        ).await?;

        // Handle verification failures
        match verification_result.status {
            VerificationStatus::Pass => {
                // Continue with tier execution
            }
            VerificationStatus::Fail => {
                match self.config.verification_policy {
                    VerificationPolicy::FailFast => {
                        return Err(anyhow!("Tier start verification failed: {:?}", verification_result.findings));
                    }
                    VerificationPolicy::WarnAndContinue => {
                        tracing::warn!("Tier start verification failed: {:?}", verification_result.findings);
                        // Continue with tier execution
                    }
                }
            }
            VerificationStatus::Warning => {
                tracing::warn!("Tier start verification warnings: {:?}", verification_result.findings);
                // Continue with tier execution
            }
        }

        // Log verification results
        self.log_verification_result(&tier_node.id, &verification_result).await?;

        // Persist verification results
        self.persist_verification_result(&tier_node.id, &verification_result).await?;

        // Build execution context (only if verification passed or warn-and-continue)
        let execution_context = self.build_execution_context(tier_node, context)?;

        // Continue with tier execution...
        Ok(())
    }
}
```

**Verification function implementation:**

```rust
// src/verification/tier_start.rs

use crate::types::{TierType, Platform};
use crate::config::PuppetMasterConfig;
use crate::core::OrchestratorContext;
use anyhow::{Result, Context};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StartVerificationResult {
    pub tier_type: TierType,
    pub tier_id: String,
    pub status: VerificationStatus,
    pub findings: Vec<VerificationFinding>,
    pub timestamp: chrono::DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VerificationStatus {
    Pass,
    Fail,
    Warning,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerificationFinding {
    pub category: FindingCategory,
    pub severity: FindingSeverity,
    pub message: String,
    pub suggestion: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FindingCategory {
    ConfigWiring,
    GuiBackendMapping,
    BackendGuiMapping,
    OperationSequence,
    KnownGaps,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FindingSeverity {
    Critical,
    Major,
    Minor,
    Info,
}

// DRY:FN:verify_tier_start — Verify tier readiness before execution
pub async fn verify_tier_start(
    tier_type: TierType,
    config: &PuppetMasterConfig,
    context: &OrchestratorContext,
) -> Result<StartVerificationResult> {
    let mut findings = Vec::new();

    // 1. Config-wiring check
    let config_wiring_result = validate_config_wiring_for_tier(tier_type, config)?;
    if !config_wiring_result.passed {
        findings.extend(config_wiring_result.findings.into_iter().map(|f| VerificationFinding {
            category: FindingCategory::ConfigWiring,
            severity: FindingSeverity::Critical,
            message: f,
            suggestion: Some("Ensure tier config is present and all required fields are wired".to_string()),
        }));
    }

    // 2. GUI-backend mapping check
    let gui_backend_result = check_gui_backend_mapping(tier_type, config)?;
    if !gui_backend_result.passed {
        findings.extend(gui_backend_result.findings.into_iter().map(|f| VerificationFinding {
            category: FindingCategory::GuiBackendMapping,
            severity: FindingSeverity::Major,
            message: f,
            suggestion: Some("Add GUI control for this backend setting or document why it is internal-only".to_string()),
        }));
    }

    // 3. Backend-GUI mapping check
    let backend_gui_result = check_backend_gui_mapping(tier_type, config)?;
    if !backend_gui_result.passed {
        findings.extend(backend_gui_result.findings.into_iter().map(|f| VerificationFinding {
            category: FindingCategory::BackendGuiMapping,
            severity: FindingSeverity::Major,
            message: f,
            suggestion: Some("Read and apply this GUI setting in the execution path for this tier".to_string()),
        }));
    }

    // 4. Operation sequence validation
    let sequence_result = validate_operation_sequence(tier_type, config)?;
    if !sequence_result.passed {
        findings.extend(sequence_result.findings.into_iter().map(|f| VerificationFinding {
            category: FindingCategory::OperationSequence,
            severity: FindingSeverity::Major,
            message: f,
            suggestion: Some("Ensure operation sequence matches config schema and plan".to_string()),
        }));
    }

    // 5. Gap check
    let gap_result = check_known_gaps(tier_type)?;
    if !gap_result.gaps.is_empty() {
        for gap in gap_result.gaps {
            findings.push(VerificationFinding {
                category: FindingCategory::KnownGaps,
                severity: FindingSeverity::Info,
                message: gap.description,
                suggestion: gap.mitigation,
            });
        }
    }

    // Determine overall status
    let status = if findings.iter().any(|f| matches!(f.severity, FindingSeverity::Critical)) {
        VerificationStatus::Fail
    } else if findings.iter().any(|f| matches!(f.severity, FindingSeverity::Major)) {
        VerificationStatus::Warning
    } else {
        VerificationStatus::Pass
    };

    Ok(StartVerificationResult {
        tier_type,
        tier_id: context.tier_id.clone(),
        status,
        findings,
        timestamp: Utc::now(),
    })
}

fn validate_config_wiring_for_tier(
    tier_type: TierType,
    config: &PuppetMasterConfig,
) -> Result<ConfigWiringResult> {
    // Implementation: check tier config present, plan_mode/subagent/interview fields wired
    // ...
}

fn check_gui_backend_mapping(
    tier_type: TierType,
    config: &PuppetMasterConfig,
) -> Result<MappingCheckResult> {
    // Load GUI-backend mapping (from config_wiring.rs or static list)
    let mapping = load_gui_backend_mapping(tier_type)?;

    // Check all execution-affecting settings have GUI controls
    // ...
}

fn check_backend_gui_mapping(
    tier_type: TierType,
    config: &PuppetMasterConfig,
) -> Result<MappingCheckResult> {
    // Load backend-GUI mapping
    let mapping = load_backend_gui_mapping(tier_type)?;

    // Check all GUI controls are read and applied in execution path
    // ...
}

fn validate_operation_sequence(
    tier_type: TierType,
    config: &PuppetMasterConfig,
) -> Result<SequenceValidationResult> {
    // Check operation sequence consistency
    // ...
}

fn check_known_gaps(tier_type: TierType) -> Result<GapCheckResult> {
    // Load known gaps per tier type
    let gaps = load_known_gaps(tier_type)?;

    Ok(GapCheckResult { gaps })
}
```

**Error handling:**

- **Config loading failure:** If tier config cannot be loaded, return `VerificationStatus::Fail` with Critical finding
- **Mapping load failure:** If GUI-backend or backend-GUI mapping cannot be loaded, return `VerificationStatus::Warning` with Info finding (mapping may not exist yet)
- **Gap check failure:** If gap check fails, log warning and continue (gaps are informational)

### End-of-phase / end-of-task / end-of-subtask verification

When the orchestrator **completes** a Phase, Task, or Subtask (e.g. all iterations or sub-items done, acceptance criteria about to be checked), run:

1. **Wiring check again (did we wire what we built?):** Re-run the same wiring/readiness questions as at start, but in "completion" context: for the work just done at this tier, are all new or touched config/settings properly wired (GUI ↔ backend ↔ execution)? This catches cases where work during the tier introduced a new setting or UI that was not yet connected.
2. **Acceptance criteria (existing):** Run the existing verification gate (e.g. criteria from PRD, command/file/regex checks). This remains the "did we meet the spec?" check.
3. **Quality verification (new):** Beyond acceptance criteria, **review the code (or artifacts) produced at this tier** to ensure the work was done well -- not just "does it pass the gate?" but "is it maintainable, correct, and aligned with project standards?" Both of the following are **required** (no human review; agent-driven only):
   - **Structured code review by reviewer subagent (required, not optional):** Run a dedicated reviewer subagent (e.g. `code-reviewer`) at end-of-phase/task/subtask. It inspects the diff or artifacts and outputs pass/fail + feedback. There is no path that skips this. Do **not** use human review.
   - **Quality criteria in the gate (required as well):** Extend the verification gate for this tier to include automated quality items (e.g. "no new clippy warnings," "new code has tests," "no TODOs without tickets").
4. **Document packaging verification (new):** End-of-run verification MUST enforce `Plans/Document_Packaging_Policy.md` for any Markdown/text artifact under `.puppet-master/**` produced during the run that reached packaging triggers.

ContractRef: ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014

**Quality Gate: Fail vs Warn Rules (Resolved):**

| Check | Severity | Action |
|-------|----------|--------|
| Linter errors (error-level) | Critical | **Fail** — block tier completion |
| Linter warnings (warn-level) | Advisory | **Warn** — log, do not block |
| Formatter violations | Advisory | **Warn** — log, do not block |
| Test failures | Critical | **Fail** — block tier completion |
| Test coverage delta < 0% | Advisory | **Warn** — log, do not block |
| Build errors | Critical | **Fail** — block tier completion |
| Type check errors | Critical | **Fail** — block tier completion |

Threshold source: per-project `.puppet-master/quality.json` (if exists). If file is missing, use built-in defaults (no coverage threshold, linter/test/build errors fail, everything else warns).
Config: `quality.gate.{check_name}.action` — override per check (`"fail"` or `"warn"`).

**BeforeTierEnd verification responsibilities:**

- **Collect tier artifacts:** Collect all artifacts produced during this tier (code changes, documents, test results, etc.)
- **Compute diff:** Compute git diff for changed files in this tier (if applicable)
- **Load tier context:** Load tier context and execution history for this tier
- **Prepare verification context:** Build verification context with artifacts, diff, tier context, and config

**DuringTierEnd verification responsibilities:**

- **Re-run wiring check:** Re-run wiring/readiness check for completed tier (check if new config/settings were introduced and are properly wired)
- **Run acceptance criteria:** Run existing verification gate (PRD criteria, command/file/regex checks)
- **Run quality verification:**
  - **Code review by reviewer subagent:** Invoke reviewer subagent (e.g., `code-reviewer`) to review diff/artifacts
  - **Quality gate criteria:** Run automated quality checks (linters, formatters, test coverage, security scanners)
- **Run Document Set verification:** For large Markdown/text artifacts produced in the run, execute full Document Set audit checks (A/B/C) and fail tier completion on any packaging verification breach.
- **Collect verification results:** Collect all verification results (wiring, acceptance, quality)
- **Determine tier status:** Determine if tier should be marked "complete", "incomplete" (rework), or "complete with warnings"

**AfterTierEnd verification responsibilities:**

- **Persist verification results:** Save verification results to `.puppet-master/state/verification-{tier_id}-end.json`
- **Update tier status:** Update tier status in PRD/state based on verification results
- **Generate feedback:** If verification failed, generate feedback for agent/user (what failed, which file/criterion, suggested fix)
- **Handle failures:** If quality fails, either mark tier as "incomplete" (rework) or "complete with warnings" (log and proceed) per policy

**Implementation:** Create `src/verification/tier_end.rs` with `verify_tier_end()` function. Integrate with orchestrator tier completion point.

**Integration with orchestrator:**

In `src/core/orchestrator.rs`, extend tier completion logic:

```rust
use crate::verification::tier_end::{verify_tier_end, EndVerificationError, EndVerificationResult, TierStatus};

impl Orchestrator {
    pub async fn complete_tier(
        &self,
        tier_node: &TierNode,
        outcome: &TierOutcome,
        context: &OrchestratorContext,
    ) -> Result<TierStatus> {
        // Collect tier artifacts
        let artifacts = self.collect_tier_artifacts(tier_node, context).await?;

        // Compute diff
        let diff = self.compute_tier_diff(tier_node, context).await?;

        // Run end verification
        let verification_result = verify_tier_end(
            tier_node.tier_type,
            outcome,
            &artifacts,
            &diff,
            &self.config,
            context,
        ).await?;

        // Handle verification results
        let tier_status = match verification_result.status {
            VerificationStatus::Pass => {
                // Mark tier as complete
                TierStatus::Complete
            }
            VerificationStatus::Fail => {
                // Mark tier as incomplete (rework required)
                TierStatus::Incomplete {
                    reason: format!("Verification failed: {:?}", verification_result.findings),
                    feedback: verification_result.feedback.clone(),
                }
            }
            VerificationStatus::Warning => {
                // Mark tier as complete with warnings
                TierStatus::CompleteWithWarnings {
                    warnings: verification_result.findings,
                }
            }
        };

        // Persist verification results
        self.persist_verification_result(&tier_node.id, &verification_result).await?;

        // Update tier status in PRD/state
        self.update_tier_status(tier_node, &tier_status).await?;

        // Generate feedback if verification failed
        if matches!(tier_status, TierStatus::Incomplete { .. }) {
            self.generate_verification_feedback(tier_node, &verification_result).await?;
        }

        Ok(tier_status)
    }
}
```

**Verification function implementation:**

```rust
// src/verification/tier_end.rs

use crate::types::{TierType, Platform};
use crate::config::PuppetMasterConfig;
use crate::core::{OrchestratorContext, TierOutcome};
use crate::platforms::PlatformRunner;
use anyhow::{Result, Context};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EndVerificationResult {
    pub tier_type: TierType,
    pub tier_id: String,
    pub status: VerificationStatus,
    pub wiring_check: WiringCheckResult,
    pub acceptance_check: AcceptanceCheckResult,
    pub quality_check: QualityCheckResult,
    pub findings: Vec<VerificationFinding>,
    pub feedback: Option<String>,
    pub timestamp: chrono::DateTime<Utc>,
}

// DRY:FN:verify_tier_end — Verify tier completion and quality
pub async fn verify_tier_end(
    tier_type: TierType,
    outcome: &TierOutcome,
    artifacts: &TierArtifacts,
    diff: &Option<String>,
    config: &PuppetMasterConfig,
    context: &OrchestratorContext,
) -> Result<EndVerificationResult> {
    let mut findings = Vec::new();

    // 1. Re-run wiring check
    let wiring_result = re_run_wiring_check(tier_type, config, context).await?;
    if !wiring_result.passed {
        findings.extend(wiring_result.findings.into_iter().map(|f| VerificationFinding {
            category: FindingCategory::ConfigWiring,
            severity: FindingSeverity::Major,
            message: f,
            suggestion: Some("Ensure new config/settings introduced during tier are properly wired".to_string()),
        }));
    }

    // 2. Run acceptance criteria
    let acceptance_result = run_acceptance_criteria(tier_type, outcome, artifacts, config).await?;
    if !acceptance_result.passed {
        findings.extend(acceptance_result.findings.into_iter().map(|f| VerificationFinding {
            category: FindingCategory::AcceptanceCriteria,
            severity: FindingSeverity::Critical,
            message: f,
            suggestion: Some("Ensure acceptance criteria from PRD are met".to_string()),
        }));
    }

    // 3. Run quality verification
    let quality_result = run_quality_verification(tier_type, artifacts, diff, config, context).await?;
    if !quality_result.passed {
        findings.extend(quality_result.findings.into_iter().map(|f| VerificationFinding {
            category: FindingCategory::Quality,
            severity: f.severity,
            message: f.message,
            suggestion: f.suggestion,
        }));
    }

    // Determine overall status
    let status = if findings.iter().any(|f| matches!(f.severity, FindingSeverity::Critical)) {
        VerificationStatus::Fail
    } else if findings.iter().any(|f| matches!(f.severity, FindingSeverity::Major)) {
        VerificationStatus::Warning
    } else {
        VerificationStatus::Pass
    };

    // Generate feedback if verification failed
    let feedback = if matches!(status, VerificationStatus::Fail) {
        Some(generate_verification_feedback(&findings, artifacts, diff)?)
    } else {
        None
    };

    Ok(EndVerificationResult {
        tier_type,
        tier_id: context.tier_id.clone(),
        status,
        wiring_check: wiring_result,
        acceptance_check: acceptance_result,
        quality_check: quality_result,
        findings,
        feedback,
        timestamp: Utc::now(),
    })
}

async fn run_quality_verification(
    tier_type: TierType,
    artifacts: &TierArtifacts,
    diff: &Option<String>,
    config: &PuppetMasterConfig,
    context: &OrchestratorContext,
) -> Result<QualityCheckResult> {
    let mut findings = Vec::new();

    // 3a. Code review by reviewer subagent (required, not optional)
    let reviewer_result = run_reviewer_subagent(tier_type, artifacts, diff, config, context).await?;
    if !reviewer_result.passed {
        findings.extend(reviewer_result.findings);
    }

    // 3b. Quality gate criteria (required as well)
    let quality_gate_result = run_quality_gate_criteria(tier_type, artifacts, diff, config).await?;
    if !quality_gate_result.passed {
        findings.extend(quality_gate_result.findings);
    }

    Ok(QualityCheckResult {
        passed: findings.is_empty(),
        reviewer_result,
        quality_gate_result,
        findings,
    })
}

async fn run_reviewer_subagent(
    tier_type: TierType,
    artifacts: &TierArtifacts,
    diff: &Option<String>,
    config: &PuppetMasterConfig,
    context: &OrchestratorContext,
) -> Result<ReviewerResult> {
    // DRY requirement: must use subagent_registry::get_subagents_for_tier() to get reviewer subagent — never hardcode "code-reviewer"
    // Get reviewer subagent for this tier type
    let reviewer_subagent = get_reviewer_subagent_for_tier(tier_type)?;
    // Implementation note: get_reviewer_subagent_for_tier() must use subagent_registry::get_subagents_for_tier(TierType::Subtask)
    // and filter for "code-reviewer" or use subagent_registry::get_reviewer_subagent_for_tier() if such a function exists

    // Build review prompt
    let review_prompt = build_review_prompt(artifacts, diff, tier_type)?;

    // DRY requirement: must use platform_specs functions — never hardcode platform-specific behavior
    // Invoke reviewer subagent via platform runner
    let platform = get_platform_for_tier(tier_type, config)?;
    let model = get_model_for_tier(tier_type, config)?;

    // DRY: Use platform_specs to get runner — DO NOT use match statements for platform selection
    let runner = get_platform_runner(platform)?;
    // DRY requirement: execute_with_subagent must use platform_specs::get_subagent_invocation_format() internally
    let review_output = runner.execute_with_subagent(
        &reviewer_subagent,
        &review_prompt,
        &context.workspace,
    ).await?;

    // Parse reviewer output as structured SubagentOutput
    let parsed_output = parse_reviewer_output(&review_output.stdout)?;

    // Extract findings from reviewer output
    let findings = parsed_output.findings.into_iter()
        .map(|f| QualityFinding {
            severity: f.severity,
            message: f.description,
            file: f.file,
            line: f.line,
            suggestion: f.suggestion,
        })
        .collect();

    Ok(ReviewerResult {
        passed: findings.iter().all(|f| matches!(f.severity, Severity::Info | Severity::Minor)),
        findings,
        reviewer_feedback: parsed_output.task_report,
    })
}

async fn run_quality_gate_criteria(
    tier_type: TierType,
    artifacts: &TierArtifacts,
    diff: &Option<String>,
    config: &PuppetMasterConfig,
) -> Result<QualityGateResult> {
    let mut findings = Vec::new();

    // Get quality criteria for this tier type
    let quality_criteria = get_quality_criteria_for_tier(tier_type)?;

    // Run each quality check
    for criterion in quality_criteria {
        let check_result = run_quality_check(&criterion, artifacts, diff, config).await?;
        if !check_result.passed {
            findings.push(QualityFinding {
                severity: criterion.severity,
                message: check_result.message,
                file: check_result.file,
                line: check_result.line,
                suggestion: check_result.suggestion,
            });
        }
    }

    Ok(QualityGateResult {
        passed: findings.is_empty(),
        findings,
    })
}

fn get_quality_criteria_for_tier(tier_type: TierType) -> Result<Vec<QualityCriterion>> {
    match tier_type {
        TierType::Phase => Ok(vec![
            QualityCriterion {
                name: "document_quality".to_string(),
                check_type: QualityCheckType::DocumentReview,
                severity: FindingSeverity::Major,
            },
        ]),
        TierType::Task => Ok(vec![
            QualityCriterion {
                name: "design_doc_quality".to_string(),
                check_type: QualityCheckType::DocumentReview,
                severity: FindingSeverity::Major,
            },
        ]),
        TierType::Subtask => Ok(vec![
            QualityCriterion {
                name: "no_new_clippy_warnings".to_string(),
                check_type: QualityCheckType::Linter,
                severity: FindingSeverity::Major,
            },
            QualityCriterion {
                name: "new_code_has_tests".to_string(),
                check_type: QualityCheckType::TestCoverage,
                severity: FindingSeverity::Critical,
            },
            QualityCriterion {
                name: "no_todos_without_tickets".to_string(),
                check_type: QualityCheckType::CodeReview,
                severity: FindingSeverity::Minor,
            },
        ]),
        TierType::Iteration => Ok(vec![]), // Iteration quality checked at subtask level
    }
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, Gate:GATE-005

**Error handling:**

- **Artifact collection failure:** If artifacts cannot be collected, return `VerificationStatus::Warning` with Info finding
- **Diff computation failure:** If diff cannot be computed, log warning and continue (diff may not be applicable)
- **Reviewer subagent failure:** If reviewer subagent fails, return `VerificationStatus::Fail` with Critical finding (reviewer is required)
- **Quality gate failure:** If quality gate fails, return appropriate status based on severity (Critical → Fail, Major/Minor → Warning)

### Summary table -- start vs end, what runs when

| Boundary | When | Config-wiring | Wiring/readiness (GUI? backend? steps? gaps?) | Acceptance criteria | Quality verification |
|----------|------|----------------|-----------------------------------------------|--------------------|------------------------|
| **Start Phase** | Enter phase | Yes | Yes | -- | -- |
| **Start Task** | Enter task | Yes | Yes | -- | -- |
| **Start Subtask** | Enter subtask | Yes | Yes | -- | -- |
| **Start Iteration** | Enter iteration | Yes | (optional; can defer to tier) | -- | -- |
| **End Phase** | Phase complete | -- | Yes (re-check) | Yes (gate) | Yes (code/artifact review) |
| **End Task** | Task complete | -- | Yes (re-check) | Yes (gate) | Yes (code/artifact review) |
| **End Subtask** | Subtask complete | -- | Yes (re-check) | Yes (gate) | Yes (code/artifact review) |

### Gaps and potential issues in start/end verification
This section closes the remaining start/end verification gaps and is normative.

### Canonical validation-table source of truth
Start/end verification uses one static mapping table maintained with the orchestrator code and referenced by the planning docs.

Each row MUST contain:
- config field
- GUI control or UI source
- backend consumer
- applicable tier set (`phase`, `task`, `subtask`, `iteration`, `interview_phase` as applicable)
- required/optional execution impact
- default/fallback behavior

This table is the source of truth for `validate_config_wiring_for_tier(...)`. Readiness MUST NOT be heuristic prose.

ContractRef: ContractName:Plans/Contracts_V0.md, PolicyRule:Plans/orchestrator-subagent-integration.md#config-wiring-verification

### Start-of-tier verification
Start-of-phase, start-of-task, and start-of-subtask verification always run the same categories in this order:
1. config-wiring validation against the canonical table
2. readiness validation for required upstream artifacts and dependencies
3. operation-sequence validation
4. known-gap detection for execution-affecting unresolved prerequisites

A tier MUST NOT start when a required execution-affecting field is unwired, unavailable, or inconsistent.

ContractRef: ContractName:Plans/Executor_Protocol.md, PolicyRule:Plans/orchestrator-subagent-integration.md#tier-start-preconditions

### End-of-tier verification
End-of-phase, end-of-task, and end-of-subtask verification always run the same categories in this order:
1. config-wiring re-check for execution-affecting settings used during the tier
2. acceptance check for the tier’s declared outputs and completion criteria
3. quality review
4. feedback emission for any failed requirement, quality finding, or retry/remediation trigger

### Canonical quality matrix
| Tier | Required quality review |
|---|---|
| Phase | artifact completeness, acceptance coverage, cross-doc integrity, terminology alignment |
| Task | design/contract correctness, dependency consistency, fit with parent phase intent |
| Subtask | code review, tests for touched scope, lint/format for touched scope, implementation acceptance |
| Iteration | local acceptance of the concrete retry/fix objective when iteration-level execution is used |
| Interview phase | document completeness, decision clarity, unresolved-clarification handling, output readiness for downstream plan generation |

### Reviewer participation
The reviewer/quality path is not optional.
- it runs at the end of every tier completion path
- it runs again on retry paths when the tier is re-attempted after a failure
- it runs when a quality gate fails and the remediation loop feeds back into the same tier

### Failure vs warning policy
- required execution-affecting mismatches fail verification
- missing or inconsistent upstream dependencies required for the declared tier objective fail verification
- display-only, observability-only, or deferred non-execution-affecting mismatches may warn when they do not change runtime behavior
- performance concerns MUST NOT weaken the verification categories; implementation may scope work to changed artifacts, but may not silently skip categories

ContractRef: PolicyRule:Plans/orchestrator-subagent-integration.md#verification-category-invariant

### Interview-phase mirror
Interview phases use the same start/end pattern:
- start = wiring + readiness + sequence
- end = wiring re-check + acceptance + quality

`interview-subagent-integration.md` is responsible for the interview-phase-specific quality criteria and UI/runtime consequences, but it MUST mirror this contract rather than invent an alternate lifecycle.

ContractRef: ContractName:Plans/interview-subagent-integration.md

### Unrelated-failure escalation
When a tier fails because of issues outside its intended scope:
1. retry once automatically using the same config
2. if retry also fails, raise an Assistant chat CTA with review, skip, retry, and abort options
3. use a modal instead only for P0 risk such as possible data loss or workspace corruption
4. do not silently bypass unrelated failures

### Feedback loop
Verification failures MUST produce structured feedback identifying the failing criterion, affected artifact or file when known, and the expected next action. Rework loops reuse the existing incomplete-task / remediation flow rather than inventing a separate ad hoc channel.

ContractRef: ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md
### 1. Hook-Based Lifecycle Middleware (BeforeTier/AfterTier)

**Concept:** Puppet Master should support **BeforeTier** and **AfterTier** hooks that run automatically at tier boundaries (Phase, Task, Subtask, Iteration). Hooks handle lifecycle concerns (tracking, state management, validation) separately from execution logic.

**Platform-specific hook registration:**

- **Cursor:** Register hooks in `.cursor/hooks.json` or `~/.cursor/hooks.json` for native hooks (`SubagentStart`, `SubagentStop`, `beforeSubmitPrompt`, `afterAgentResponse`). Also implement orchestrator-level hooks in Rust that wrap platform calls. **Note:** CLI subagents have reported issues (Feb 2026); use orchestrator-level hooks as primary, native hooks as enhancement when CLI subagents are fixed.
- **Codex:** Use CLI lifecycle outputs and orchestrator-managed hooks/middleware. Implement orchestrator-level hooks as primary middleware.
- **Claude Code:** Register hooks in `.claude/settings.json` for native hooks (`SubagentStart`, `SubagentStop`, `PreToolUse`, `PostToolUse`, `SessionStart`, `SessionEnd`). Also implement orchestrator-level hooks. Native hooks can block operations (exit code 2) or inject context.
- **Gemini:** Gemini is a Direct API provider; hooks are implemented at the orchestrator level. No platform-native hook config file is needed for Gemini.
- **Copilot:** Use CLI lifecycle outputs and orchestrator-managed hooks/middleware. Implement orchestrator-level hooks as primary.

**Hook trait definition:**

```rust
// src/core/hooks.rs or src/verification/hooks.rs

use crate::types::{Platform, TierType};
use crate::core::state_persistence::TierContext;
use anyhow::Result;

/// Hook context passed to BeforeTier hook
pub struct BeforeTierContext {
    pub tier_id: String,
    pub tier_type: TierType,
    pub platform: Platform,
    pub model: String,
    pub selected_subagents: Vec<String>,
    pub config_snapshot: serde_json::Value, // Serialized tier config + orchestrator config
    pub known_gaps: Vec<String>, // Known gaps/issues that could affect this tier
}

/// Hook context passed to AfterTier hook
pub struct AfterTierContext {
    pub tier_id: String,
    pub tier_type: TierType,
    pub platform: Platform,
    pub subagent_output: String, // Raw stdout from subagent
    pub completion_status: CompletionStatus, // Success, Failure, Warning
    pub iteration_count: u32,
}

pub enum CompletionStatus {
    Success,
    Failure(String),
    Warning(String),
}

/// BeforeTier hook trait
pub trait BeforeTierHook: Send + Sync {
    /// Execute hook before tier starts
    fn execute(&self, ctx: &BeforeTierContext) -> Result<BeforeTierResult>;

    /// Hook name for logging/debugging
    fn name(&self) -> &str;
}

/// AfterTier hook trait
pub trait AfterTierHook: Send + Sync {
    /// Execute hook after tier completes
    fn execute(&self, ctx: &AfterTierContext) -> Result<AfterTierResult>;

    /// Hook name for logging/debugging
    fn name(&self) -> &str;
}

pub struct BeforeTierResult {
    /// Active subagent to track (from selection or override)
    pub active_subagent: Option<String>,
    /// Additional context to inject into subagent prompt
    pub injected_context: Option<String>,
    /// Whether to block tier start (hook can prevent execution)
    pub block: bool,
    /// Block reason if blocking
    pub block_reason: Option<String>,
}

pub struct AfterTierResult {
    /// Whether handoff validation passed
    pub validation_passed: bool,
    /// Validation error if failed
    pub validation_error: Option<String>,
    /// Whether to request retry (one chance)
    pub request_retry: bool,
    /// Retry reason
    pub retry_reason: Option<String>,
}

/// Hook registry that manages all hooks
pub struct HookRegistry {
    before_tier_hooks: Vec<Box<dyn BeforeTierHook>>,
    after_tier_hooks: Vec<Box<dyn AfterTierHook>>,
}

impl HookRegistry {
    pub fn new() -> Self {
        Self {
            before_tier_hooks: Vec::new(),
            after_tier_hooks: Vec::new(),
        }
    }

    pub fn register_before_tier(&mut self, hook: Box<dyn BeforeTierHook>) {
        self.before_tier_hooks.push(hook);
    }

    pub fn register_after_tier(&mut self, hook: Box<dyn AfterTierHook>) {
        self.after_tier_hooks.push(hook);
    }

    /// Execute all BeforeTier hooks (safe wrapper)
    pub fn execute_before_tier(&self, ctx: &BeforeTierContext) -> Result<BeforeTierResult> {
        let mut active_subagent = None;
        let mut injected_contexts = Vec::new();
        let mut block = false;
        let mut block_reason = None;

        for hook in &self.before_tier_hooks {
            match safe_hook_main(|| hook.execute(ctx)) {
                Ok(result) => {
                    if result.block {
                        block = true;
                        block_reason = Some(result.block_reason.unwrap_or_else(|| format!("Hook {} blocked", hook.name())));
                        break; // Stop on first block
                    }
                    if let Some(subagent) = result.active_subagent {
                        active_subagent = Some(subagent);
                    }
                    if let Some(ctx) = result.injected_context {
                        injected_contexts.push(ctx);
                    }
                }
                Err(e) => {
                    log::warn!("BeforeTier hook {} failed: {}", hook.name(), e);
                    // Continue with other hooks (fail-safe)
                }
            }
        }

        Ok(BeforeTierResult {
            active_subagent,
            injected_context: if injected_contexts.is_empty() {
                None
            } else {
                Some(injected_contexts.join("\n\n"))
            },
            block,
            block_reason,
        })
    }

    /// Execute all AfterTier hooks (safe wrapper)
    pub fn execute_after_tier(&self, ctx: &AfterTierContext) -> Result<AfterTierResult> {
        let mut validation_passed = true;
        let mut validation_error = None;
        let mut request_retry = false;
        let mut retry_reason = None;

        for hook in &self.after_tier_hooks {
            match safe_hook_main(|| hook.execute(ctx)) {
                Ok(result) => {
                    if !result.validation_passed {
                        validation_passed = false;
                        validation_error = result.validation_error;
                        request_retry = result.request_retry;
                        retry_reason = result.retry_reason;
                        break; // Stop on first validation failure
                    }
                }
                Err(e) => {
                    log::warn!("AfterTier hook {} failed: {}", hook.name(), e);
                    // Continue with other hooks (fail-safe)
                }
            }
        }

        Ok(AfterTierResult {
            validation_passed,
            validation_error,
            request_retry,
            retry_reason,
        })
    }
}

/// Safe hook wrapper that guarantees structured output
fn safe_hook_main<F, T>(hook_fn: F) -> Result<T>
where
    F: FnOnce() -> Result<T>,
{
    hook_fn()
}
```

**Built-in hooks (implement in `src/core/hooks/builtin.rs`):**

1. **ActiveSubagentTrackerHook** (BeforeTier): Sets `active_subagent` in `TierContext`; persists tracking updates through canonical runtime storage and projection.
2. **TierContextInjectorHook** (BeforeTier): Injects current phase/task/subtask status, config snapshot, known gaps into subagent prompt.
3. **StaleStatePrunerHook** (BeforeTier): Prunes verification state older than 2 hours; creates state directories on first write.
4. **HandoffValidatorHook** (AfterTier): Validates subagent output format (calls `validate_subagent_output`); requests retry on malformed output.

**Integration with orchestrator:**

In `src/core/orchestrator.rs`, modify `execute_tier`:

```rust
async fn execute_tier(&self, tier_id: &str) -> Result<()> {
    // ... existing state transition logic ...

    // BEFORE TIER: Execute BeforeTier hooks
    let before_ctx = BeforeTierContext {
        tier_id: tier_id.to_string(),
        tier_type,
        platform: tier_config.platform,
        model: tier_config.model.clone(),
        selected_subagents: self.get_selected_subagents(tier_id)?,
        config_snapshot: serde_json::to_value(&tier_config)?,
        known_gaps: self.get_known_gaps_for_tier(tier_type)?,
    };

    let before_result = self.hook_registry.execute_before_tier(&before_ctx)?;

    if before_result.block {
        return Err(anyhow!("Tier {} blocked by hook: {}", tier_id, before_result.block_reason.unwrap_or_default()));
    }

    // Update TierContext with active subagent
    if let Some(subagent) = before_result.active_subagent {
        self.update_tier_context(tier_id, |ctx| {
            ctx.active_subagent = Some(subagent);
        })?;
    }

    // Inject context into prompt if provided
    let prompt = if let Some(injected) = before_result.injected_context {
        format!("{}\n\n{}", prompt, injected)
    } else {
        prompt
    };

    // ... existing iteration execution ...

    // AFTER TIER: Execute AfterTier hooks
    let after_ctx = AfterTierContext {
        tier_id: tier_id.to_string(),
        tier_type,
        platform: tier_config.platform,
        subagent_output: iteration_result.output.clone(),
        completion_status: if gate_report.passed {
            CompletionStatus::Success
        } else {
            CompletionStatus::Failure(gate_report.report.unwrap_or_default())
        },
        iteration_count: attempt,
    };

    let after_result = self.hook_registry.execute_after_tier(&after_ctx)?;

    if !after_result.validation_passed {
        if after_result.request_retry && attempt < max_iterations {
            // Retry with format instruction
            let retry_prompt = format!("{}\n\nIMPORTANT: Format your output as structured JSON with task_report, downstream_context, and findings fields.", prompt);
            previous_feedback = Some(after_result.retry_reason.unwrap_or_else(|| "Output format validation failed".to_string()));
            continue; // Retry iteration
        } else {
            // Fail-safe: proceed with warnings
            log::warn!("Tier {} output validation failed but proceeding: {}", tier_id, after_result.validation_error.unwrap_or_default());
            // Mark tier as complete with warnings
        }
    }

    // ... rest of tier completion logic ...
}
```

**BeforeTier hook responsibilities (detailed):**

- **Track active subagent:** Record which subagent is active at this tier (e.g., `active_subagent: Option<String>` in `TierContext`). Persist the tracking change through canonical runtime events and storage projections rather than through `.puppet-master/state/active-subagents.json`.
- **Inject tier context:** Add current phase/task/subtask status, config snapshot, and known gaps to subagent prompt or context. Format: "Current tier: {tier_id}, Type: {tier_type}, Platform: {platform}, Model: {model}. Known gaps: {gaps}. Config: {config_summary}."
- **Prune stale state:** Clean up verification state older than threshold (e.g., 2 hours). Check modification time of files in `.puppet-master/verification/<session-id>/`; delete if `mtime < now - 2 hours`.
- **Lazy state creation:** Create verification state directories on first write (no explicit setup commands). Create `.puppet-master/verification/<session-id>/` if it doesn't exist when first hook writes state.

**AfterTier hook responsibilities (detailed):**

- **Validate subagent output format:** Check that output matches structured handoff contract (see #2 below). Call `validate_subagent_output(output, platform)`; return `validation_passed: false` if malformed.
- **Track completion:** Update active subagent tracking (clear `active_subagent` in `TierContext`) and mark tier completion through the same canonical runtime projection used for active tracking.
- **Safe error handling:** Guarantee structured output even on hook failure. Wrap hook execution in `safe_hook_main`; on panic or error, return `{ "status": "error", "message": "...", "details": {...} }` instead of crashing.

**Platform-native hook integration:**

For platforms with native hooks, create adapter hooks that delegate:

```rust
// src/core/hooks/platform_adapters.rs

/// Cursor native hook adapter
pub struct CursorNativeHookAdapter {
    hook_script_path: PathBuf, // Path to .cursor/hooks.json registered script
}

impl BeforeTierHook for CursorNativeHookAdapter {
    fn execute(&self, ctx: &BeforeTierContext) -> Result<BeforeTierResult> {
        // Call Cursor hook script via subprocess
        // Pass context as JSON stdin
        // Parse JSON stdout
        // Return BeforeTierResult
    }
}

// Similar adapters for Claude Code, Gemini
```

**Implementation:** Create `src/core/hooks.rs` or `src/verification/hooks.rs` with `BeforeTierHook` and `AfterTierHook` traits. Register hooks per tier type in `HookRegistry`. Call hooks automatically at tier boundaries (before `verify_tier_start`, after `verify_tier_end`) in `orchestrator.rs::execute_tier`. For platforms with native hooks, register Puppet Master hooks that delegate to platform hooks where possible. **Default hooks:** Always register built-in hooks (ActiveSubagentTrackerHook, TierContextInjectorHook, StaleStatePrunerHook, HandoffValidatorHook) even if platform-native hooks are also registered.

### 2. Structured Handoff Report Validation

**Concept:** Enforce a standardized output format for subagent invocations. Every subagent must produce a structured handoff report with required fields. If output is malformed, block and request one retry (fail-safe after retry).

**BeforeHandoffValidation responsibilities:**

- **Detect output format:** Detect if subagent output is structured (JSON) or unstructured (text)
- **Load validation schema:** Load validation schema for `SubagentOutput` format
- **Prepare validation context:** Build validation context with expected fields and format requirements

**DuringHandoffValidation responsibilities:**

- **Parse structured output:** Attempt to parse output as structured `SubagentOutput` JSON
- **Validate required fields:** Validate that all required fields are present (`task_report` is required)
- **Validate field types:** Validate that field types match schema (string, array, enum, etc.)
- **Validate findings format:** Validate that findings array contains valid `Finding` objects with required fields
- **Extract from text (fallback):** If JSON parsing fails, attempt to extract structured data from text output
- **Request retry if malformed:** If output is malformed and retry not yet attempted, request one retry with format instruction

**AfterHandoffValidation responsibilities:**

- **Persist validation results:** Save validation results to `.puppet-master/state/handoff-validation-{tier_id}.json`
- **Update tier context:** Update tier context with validated `SubagentOutput` (task_report, downstream_context, findings)
- **Handle validation failures:** If validation fails after retry, proceed with partial output but mark tier as "complete with warnings"

**Required output format:**

```rust
// src/types/subagent_output.rs (new file)

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
// DRY:DATA:SubagentOutput — Structured subagent output format
pub struct SubagentOutput {
    /// Task report: what the subagent did
    pub task_report: String,
    /// Downstream context: information for next tier/subagent
    #[serde(skip_serializing_if = "Option::is_none")]
    pub downstream_context: Option<String>,
    /// Findings: quality issues, blockers, recommendations
    #[serde(default)]
    pub findings: Vec<Finding>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Finding {
    pub severity: Severity,
    pub category: String,   // e.g., "security", "performance", "maintainability"
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file: Option<PathBuf>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub line: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub suggestion: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Severity {
    Critical,
    Major,
    Minor,
    Info,
}

#[derive(Debug, thiserror::Error)]
pub enum ValidationError {
    #[error("JSON parse error: {0}")]
    JsonParse(#[from] serde_json::Error),
    #[error("Missing required field: {0}")]
    MissingField(String),
    #[error("Invalid severity: {0}")]
    InvalidSeverity(String),
    #[error("Text extraction failed: {0}")]
    TextExtraction(String),
    #[error("Validation failed after retry: {0}")]
    ValidationFailedAfterRetry(String),
}
```

**Platform-specific parser implementation:**

Extend `src/platforms/output_parser.rs` with new parser methods:

```rust
// Add to ParsedOutput struct:
pub struct ParsedOutput {
    // ... existing fields ...
    /// Parsed subagent output if structured format detected
    pub subagent_output: Option<SubagentOutput>,
}

// Add to OutputParser trait:
pub trait OutputParser: Send + Sync {
    // ... existing methods ...

    /// Parse structured subagent output (platform-specific)
    fn parse_subagent_output(&self, stdout: &str, stderr: &str) -> Result<SubagentOutput, ValidationError>;

    /// Extract structured output from text (fallback)
    fn extract_subagent_output_from_text(&self, stdout: &str, stderr: &str) -> Result<SubagentOutput, ValidationError>;
}

// Implementation for each platform parser:

impl OutputParser for CursorOutputParser {
    // DRY REQUIREMENT: Tag with // DRY:FN:parse_subagent_output_cursor
    fn parse_subagent_output(&self, stdout: &str, _stderr: &str) -> Result<SubagentOutput, ValidationError> {
        // DRY requirement: output format detection must use platform_specs — do not hardcode "--output-format json"
        // Cursor outputs JSON with --output-format json (from platform_specs)
        // Implementation note: Use platform_specs to determine expected output format for this platform
        let json: serde_json::Value = serde_json::from_str(stdout)
            .map_err(|e| ValidationError::JsonParse(e))?;

        // Extract structured fields
        let task_report = json.get("task_report")
            .and_then(|v| v.as_str())
            .ok_or_else(|| ValidationError::MissingField("task_report".to_string()))?
            .to_string();

        let downstream_context = json.get("downstream_context")
            .and_then(|v| v.as_str())
            .map(String::from);

        let findings = json.get("findings")
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|item| {
                        serde_json::from_value::<Finding>(item.clone()).ok()
                    })
                    .collect()
            })
            .unwrap_or_default();

        Ok(SubagentOutput {
            task_report,
            downstream_context,
            findings,
        })
    }

    fn extract_subagent_output_from_text(&self, stdout: &str, _stderr: &str) -> Result<SubagentOutput, ValidationError> {
        // Fallback: extract from text output
        // Look for structured markers (e.g., "Task Report:", "Findings:", etc.)
        // Or use LLM to extract structured data from text
        // Implementation depends on platform output format

        // Simple text extraction (can be enhanced with LLM)
        let task_report = if let Some(start) = stdout.find("Task Report:") {
            let end = stdout[start..].find("\n\n").unwrap_or(stdout.len() - start);
            stdout[start + 12..start + end].trim().to_string()
        } else {
            stdout.to_string() // Fallback: use entire output as task report
        };

        Ok(SubagentOutput {
            task_report,
            downstream_context: None,
            findings: Vec::new(), // Cannot extract findings from text reliably
        })
    }
}

// Similar implementations for other platform parsers...
```

**Validation workflow:**

```rust
// src/core/handoff_validation.rs

use crate::types::subagent_output::{SubagentOutput, ValidationError};
use crate::platforms::{PlatformRunner, OutputParser};

// DRY:DATA:HandoffValidator — Structured handoff validation system
pub struct HandoffValidator {
    parser: Box<dyn OutputParser>,
    max_retries: u32,
}

impl HandoffValidator {
    // DRY:FN:validate_subagent_output — Validate subagent output format
    // DRY requirement: must use platform_specs to determine parser type — never hardcode parser selection by platform
    pub async fn validate_subagent_output(
        &self,
        stdout: &str,
        stderr: &str,
        platform: Platform,
        retry_count: u32,
    ) -> Result<SubagentOutput, ValidationError> {
        // DRY: parser selection must use platform_specs to determine output format — do not use match platform statements
        // Try structured parsing first
        match self.parser.parse_subagent_output(stdout, stderr) {
            Ok(output) => {
                // Validate required fields
                self.validate_required_fields(&output)?;
                Ok(output)
            }
            Err(ValidationError::JsonParse(_)) => {
                // JSON parse failed, try text extraction
                if retry_count < self.max_retries {
                    // Request retry with format instruction
                    return Err(ValidationError::ValidationFailedAfterRetry(
                        "Output is not valid JSON. Please output structured JSON format.".to_string()
                    ));
                }

                // Max retries reached, try text extraction as fallback
                self.parser.extract_subagent_output_from_text(stdout, stderr)
                    .map_err(|e| ValidationError::TextExtraction(format!("Failed to extract from text: {}", e)))
            }
            Err(e) => {
                // Other validation error
                if retry_count < self.max_retries {
                    return Err(ValidationError::ValidationFailedAfterRetry(
                        format!("Validation failed: {}", e)
                    ));
                }
                Err(e)
            }
        }
    }

    fn validate_required_fields(&self, output: &SubagentOutput) -> Result<(), ValidationError> {
        // Validate task_report is not empty
        if output.task_report.trim().is_empty() {
            return Err(ValidationError::MissingField("task_report".to_string()));
        }

        // Validate findings have required fields
        for finding in &output.findings {
            if finding.description.trim().is_empty() {
                return Err(ValidationError::MissingField("finding.description".to_string()));
            }

            // Validate severity is valid
            match finding.severity {
                Severity::Critical | Severity::Major | Severity::Minor | Severity::Info => {}
            }
        }

        Ok(())
    }
}
```

**Integration with orchestrator:**

In `src/core/orchestrator.rs`, extend subagent execution:

```rust
use crate::core::handoff_validation::HandoffValidator;

impl Orchestrator {
    async fn execute_with_subagent(
        &self,
        platform: Platform,
        model: &str,
        subagent_name: &str,
        prompt: &str,
        context: &TierContext,
    ) -> Result<SubagentOutput> {
        let runner = self.get_platform_runner(platform)?;
        let mut retry_count = 0;

        loop {
            // Execute subagent
            let output = runner.execute_with_subagent(
                subagent_name,
                prompt,
                &context.workspace,
            ).await?;

            // Validate handoff output
            let validator = HandoffValidator::new(platform)?;
            match validator.validate_subagent_output(
                &output.stdout,
                &output.stderr,
                platform,
                retry_count,
            ).await {
                Ok(validated_output) => {
                    // Validation passed
                    return Ok(validated_output);
                }
                Err(ValidationError::ValidationFailedAfterRetry(msg)) => {
                    // Request retry with format instruction
                    retry_count += 1;
                    if retry_count >= validator.max_retries() {
                        // Max retries reached, proceed with partial output
                        tracing::warn!("Handoff validation failed after {} retries: {}", retry_count, msg);
                        return Ok(validator.extract_partial_output(&output.stdout, &output.stderr)?);
                    }

                    // Update prompt with format instruction
                    let updated_prompt = format!(
                        "{}\n\n**IMPORTANT:** Output must be valid JSON matching this format:\n{}\n\nCurrent output was not valid JSON. Please retry with structured JSON output.",
                        prompt,
                        serde_json::to_string_pretty(&SubagentOutput::example())?
                    );

                    // Continue loop with updated prompt
                    continue;
                }
                Err(e) => {
                    return Err(anyhow!("Handoff validation error: {}", e));
                }
            }
        }
    }
}
```

**Error handling:**

- **JSON parse failure:** If JSON parsing fails, attempt text extraction; if that fails and retry not attempted, request retry with format instruction
- **Missing field failure:** If required field is missing, request retry with field requirement instruction
- **Invalid severity failure:** If severity is invalid, request retry with valid severity values
- **Max retries reached:** If max retries reached, proceed with partial output but mark tier as "complete with warnings"

```rust
                    .filter_map(|v| serde_json::from_value(v.clone()).ok())
                    .collect()
            })
            .unwrap_or_default();

        Ok(SubagentOutput {
            task_report,
            downstream_context,
            findings,
        })
    }
}

impl OutputParser for CodexOutputParser {
    // DRY:FN:parse_subagent_output_codex -- Parse Codex subagent output
    // DRY REQUIREMENT: Output format detection MUST use platform_specs -- DO NOT hardcode "JSONL" or output format
    ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Executor_Protocol.md
    fn parse_subagent_output(&self, stdout: &str, _stderr: &str) -> Result<SubagentOutput, ValidationError> {
        // DRY: Use platform_specs to determine expected output format -- DO NOT hardcode "Codex outputs JSONL"
        // Codex outputs JSONL (one JSON object per line) -- format from platform_specs
        let mut task_report = String::new();
        let mut downstream_context = None;
        let mut findings = Vec::new();

        for line in stdout.lines() {
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(line) {
                // Look for Turn event with structured output
                if let Some(event_type) = json.get("type").and_then(|v| v.as_str()) {
                    if event_type == "Turn" || event_type == "turn" {
                        if let Some(content) = json.get("content") {
                            // Try to parse content as SubagentOutput
                            if let Ok(output) = serde_json::from_value::<SubagentOutput>(content.clone()) {
                                return Ok(output);
                            }
                            // Fallback: extract text content
                            if let Some(text) = content.as_str() {
                                task_report.push_str(text);
                            }
                        }
                    }
                }

                // Aggregate findings from multiple events
                if let Some(f) = json.get("findings").and_then(|v| v.as_array()) {
                    for finding_val in f {
                        if let Ok(finding) = serde_json::from_value::<Finding>(finding_val.clone()) {
                            findings.push(finding);
                        }
                    }
                }
            }
        }

        // If no structured output found, try to extract from text
        if task_report.is_empty() {
            return Err(ValidationError::TextExtraction("No structured output found in JSONL".to_string()));
        }

        Ok(SubagentOutput {
            task_report,
            downstream_context,
            findings,
        })
    }
}

impl OutputParser for ClaudeOutputParser {
    // DRY:FN:parse_subagent_output_claude -- Parse Claude Code subagent output
    // DRY REQUIREMENT: Output format detection MUST use platform_specs -- DO NOT hardcode "--output-format json"
    ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Executor_Protocol.md
    fn parse_subagent_output(&self, stdout: &str, _stderr: &str) -> Result<SubagentOutput, ValidationError> {
        // DRY: Use platform_specs to determine expected output format -- DO NOT hardcode "Claude outputs JSON"
        // Claude outputs JSON with --output-format json -- format from platform_specs
        let json: serde_json::Value = serde_json::from_str(stdout)?;

        // Claude wraps output in "result" -> "content" or direct fields
        let content = json.get("result")
            .and_then(|r| r.get("content"))
            .or_else(|| Some(&json))
            .ok_or_else(|| ValidationError::MissingField("result.content".to_string()))?;

        // Try direct parse
        if let Ok(output) = serde_json::from_value::<SubagentOutput>(content.clone()) {
            return Ok(output);
        }

        // Fallback: extract fields manually
        let task_report = content.get("task_report")
            .and_then(|v| v.as_str())
            .or_else(|| content.as_str())
            .ok_or_else(|| ValidationError::MissingField("task_report".to_string()))?
            .to_string();

        let downstream_context = content.get("downstream_context")
            .and_then(|v| v.as_str())
            .map(String::from);

        let findings = content.get("findings")
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|v| serde_json::from_value(v.clone()).ok())
                    .collect()
            })
            .unwrap_or_default();

        Ok(SubagentOutput {
            task_report,
            downstream_context,
            findings,
        })
    }
}

impl OutputParser for GeminiOutputParser {
    // DRY:FN:parse_subagent_output_gemini -- Parse Gemini subagent output
    // DRY REQUIREMENT: Output format detection MUST use platform_specs -- DO NOT hardcode "--output-format json"
    ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Executor_Protocol.md
    fn parse_subagent_output(&self, stdout: &str, _stderr: &str) -> Result<SubagentOutput, ValidationError> {
        // DRY: Use platform_specs to determine expected output format -- DO NOT hardcode "Gemini outputs JSON"
        // Gemini outputs JSON with --output-format json -- format from platform_specs
        let json: serde_json::Value = serde_json::from_str(stdout)?;

        // Gemini wraps in "candidates" -> [0] -> "content" -> "parts" -> [0] -> "text"
        let text = json.get("candidates")
            .and_then(|c| c.as_array())
            .and_then(|arr| arr.get(0))
            .and_then(|c| c.get("content"))
            .and_then(|c| c.get("parts"))
            .and_then(|p| p.as_array())
            .and_then(|arr| arr.get(0))
            .and_then(|p| p.get("text"))
            .and_then(|t| t.as_str())
            .ok_or_else(|| ValidationError::MissingField("candidates[0].content.parts[0].text".to_string()))?;

        // Try to parse text as JSON (Gemini may output JSON as text)
        if let Ok(output) = serde_json::from_str::<SubagentOutput>(text) {
            return Ok(output);
        }

        // Fallback: extract from text patterns
        Err(ValidationError::TextExtraction("Gemini text output requires pattern extraction".to_string()))
    }
}

impl OutputParser for CopilotOutputParser {
    // DRY:FN:parse_subagent_output_copilot -- Parse Copilot subagent output
    // DRY REQUIREMENT: Output format detection MUST use platform_specs -- DO NOT hardcode "Copilot outputs text"
    ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Executor_Protocol.md
    fn parse_subagent_output(&self, stdout: &str, _stderr: &str) -> Result<SubagentOutput, ValidationError> {
        // DRY: Use platform_specs to determine expected output format -- DO NOT hardcode "Copilot outputs text"
        // Copilot outputs text (no JSON) -- format from platform_specs
        // Extract structured sections via regex/pattern matching

        let combined = format!("{stdout}\n{stderr}");

        // Pattern: ## Task Report\n\n...content...
        let task_report_re = Regex::new(r"(?s)##\s*Task\s*Report\s*\n\n(.*?)(?=\n##|\z)").unwrap();
        let task_report = task_report_re.captures(&combined)
            .and_then(|cap| cap.get(1))
            .map(|m| m.as_str().trim().to_string())
            .ok_or_else(|| ValidationError::MissingField("Task Report section".to_string()))?;

        // Pattern: ## Downstream Context\n\n...content... (optional)
        let downstream_re = Regex::new(r"(?s)##\s*Downstream\s*Context\s*\n\n(.*?)(?=\n##|\z)").unwrap();
        let downstream_context = downstream_re.captures(&combined)
            .and_then(|cap| cap.get(1))
            .map(|m| m.as_str().trim().to_string());

        // Pattern: ## Findings\n\n- [Severity] Category: Description (file:line) Suggestion
        let findings_re = Regex::new(r"(?m)^-\s*\[(Critical|Major|Minor|Info)\]\s*(\w+):\s*(.*?)(?:\s*\(([^:]+):(\d+)\))?(?:\s*Suggestion:\s*(.*))?$").unwrap();
        let mut findings = Vec::new();

        if let Some(findings_section) = Regex::new(r"(?s)##\s*Findings\s*\n\n(.*?)(?=\n##|\z)").unwrap().captures(&combined) {
            for cap in findings_re.captures_iter(findings_section.get(1).unwrap().as_str()) {
                let severity = match cap.get(1).unwrap().as_str() {
                    "Critical" => Severity::Critical,
                    "Major" => Severity::Major,
                    "Minor" => Severity::Minor,
                    "Info" => Severity::Info,
                    _ => continue,
                };

                findings.push(Finding {
                    severity,
                    category: cap.get(2).unwrap().as_str().to_string(),
                    description: cap.get(3).unwrap().as_str().to_string(),
                    file: cap.get(4).map(|m| PathBuf::from(m.as_str())),
                    line: cap.get(5).and_then(|m| m.as_str().parse().ok()),
                    suggestion: cap.get(6).map(|m| m.as_str().to_string()),
                });
            }
        }

        Ok(SubagentOutput {
            task_report,
            downstream_context,
            findings,
        })
    }
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

**Validation function:**

```rust
// src/core/hooks/handoff_validator.rs

use crate::platforms::output_parser::{OutputParser, create_parser};
use crate::types::{Platform, SubagentOutput};
use crate::core::hooks::ValidationError;

pub fn validate_subagent_output(
    output: &str,
    stderr: &str,
    platform: Platform,
) -> Result<SubagentOutput, ValidationError> {
    let parser = create_parser(platform);
    parser.parse_subagent_output(output, stderr)
}
```

**Validation logic in AfterTier hook:** AfterTier hook calls `validate_subagent_output(output: &str, stderr: &str, platform: Platform) -> Result<SubagentOutput, ValidationError>`. If validation fails:
1. Log error with details (platform, error type, partial output snippet).
2. Request one retry (re-run subagent with "format your output as structured JSON" instruction appended to prompt).
3. If retry also fails, proceed with partial output (fail-safe) but mark tier as "complete with warnings" in `TierContext`.

**Integration with existing ParsedOutput:**

Modify `src/platforms/output_parser.rs` to populate `subagent_output` field:

```rust
impl OutputParser for CursorOutputParser {
    fn parse(&self, stdout: &str, stderr: &str) -> ParsedOutput {
        let mut output = ParsedOutput::new(stdout.to_string());
        // ... existing parsing ...

        // Try to parse structured subagent output
        output.subagent_output = self.parse_subagent_output(stdout, stderr).ok();

        output
    }
}
```

**Benefits:** Ensures Phase/Task/Subtask reliably know what their subagents produced; enables automated remediation loops; supports cross-tier context passing; provides structured error reporting for debugging.

### 3. Remediation Loop for Critical/Major Findings

**Concept:** When quality verification finds Critical or Major issues, block tier completion and enter a remediation loop. Re-run reviewer subagent until Critical/Major findings are resolved or escalated. Minor/Info findings log and proceed.

**Severity levels:**

- **Critical:** Security vulnerabilities, data loss risks, breaking changes -- **block completion**.
- **Major:** Performance issues, maintainability problems, test failures -- **block completion**.
- **Minor:** Code style, minor optimizations, suggestions -- **log and proceed**.
- **Info:** Documentation, comments, non-blocking recommendations -- **log and proceed**.

**Remediation loop implementation:**

```rust
// src/core/remediation.rs (new file)

use crate::types::SubagentOutput;
use crate::core::hooks::Severity;
use crate::core::orchestrator::Orchestrator;

// DRY:DATA:RemediationLoop — Remediation loop for Critical/Major findings
pub struct RemediationLoop {
    max_retries: u32,
    orchestrator: Arc<Orchestrator>,
}

impl RemediationLoop {
    // DRY:FN:new — Create remediation loop
    pub fn new(max_retries: u32, orchestrator: Arc<Orchestrator>) -> Self {
        Self { max_retries, orchestrator }
    }

    // DRY:FN:run — Run remediation loop for a tier
    // DRY REQUIREMENT: Reviewer subagent name MUST come from subagent_registry — NEVER hardcode "code-reviewer"
    ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Contracts_V0.md
    /// Run remediation loop for a tier
    pub async fn run(
        &self,
        tier_id: &str,
        reviewer_output: SubagentOutput,
    ) -> Result<RemediationResult> {
        // DRY: Severity filtering logic is reusable — consider extracting to DRY:FN:filter_critical_major_findings
        let critical_major: Vec<_> = reviewer_output.findings
            .iter()
            .filter(|f| matches!(f.severity, Severity::Critical | Severity::Major))
            .collect();

        if critical_major.is_empty() {
            // Only Minor/Info findings: log and proceed
            self.log_findings(&reviewer_output.findings);
            return Ok(RemediationResult::Complete);
        }

        // Critical/Major findings: enter remediation loop
        let mut retry_count = 0;
        let mut current_findings = critical_major.clone();

        while retry_count < self.max_retries {
            // Mark tier as incomplete
            self.orchestrator.mark_tier_incomplete(tier_id, &current_findings).await?;

            // Build remediation prompt
            let remediation_prompt = self.build_remediation_prompt(&current_findings);

            // DRY REQUIREMENT: Overseer and reviewer subagent names MUST come from subagent_registry — NEVER hardcode names
            // Re-run overseer subagent with remediation prompt
            // Implementation note: re_run_overseer_with_prompt MUST use subagent_registry to get overseer subagent name
            ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Contracts_V0.md
            let overseer_result = self.orchestrator
                .re_run_overseer_with_prompt(tier_id, &remediation_prompt)
                .await?;

            // DRY REQUIREMENT: Reviewer subagent name MUST come from subagent_registry::get_reviewer_subagent_for_tier()
            // Re-run reviewer subagent
            // Implementation note: re_run_reviewer MUST use subagent_registry to get reviewer subagent name
            ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Contracts_V0.md
            let reviewer_result = self.orchestrator
                .re_run_reviewer(tier_id)
                .await?;

            // Parse new findings
            let new_critical_major: Vec<_> = reviewer_result.findings
                .iter()
                .filter(|f| matches!(f.severity, Severity::Critical | Severity::Major))
                .collect();

            if new_critical_major.is_empty() {
                // All Critical/Major resolved
                return Ok(RemediationResult::Resolved);
            }

            // Check if findings changed (progress made)
            if self.findings_unchanged(&current_findings, &new_critical_major) {
                retry_count += 1;
                if retry_count >= self.max_retries {
                    // Escalate to parent-tier orchestrator
                    return Ok(RemediationResult::Escalate(new_critical_major));
                }
            } else {
                // Progress made, reset retry count
                retry_count = 0;
            }

            current_findings = new_critical_major;
        }

        Ok(RemediationResult::Escalate(current_findings))
    }

    fn build_remediation_prompt(&self, findings: &[&Finding]) -> String {
        let mut prompt = "CRITICAL/Major findings must be fixed before tier completion:\n\n".to_string();
        for finding in findings {
            prompt.push_str(&format!(
                "- [{}] {}: {}\n",
                format!("{:?}", finding.severity),
                finding.category,
                finding.description
            ));
            if let Some(file) = &finding.file {
                prompt.push_str(&format!("  File: {}\n", file.display()));
            }
            if let Some(line) = finding.line {
                prompt.push_str(&format!("  Line: {}\n", line));
            }
            if let Some(suggestion) = &finding.suggestion {
                prompt.push_str(&format!("  Suggestion: {}\n", suggestion));
            }
            prompt.push('\n');
        }
        prompt.push_str("\nPlease fix these issues and re-run verification.");
        prompt
    }

    fn findings_unchanged(&self, old: &[&Finding], new: &[&Finding]) -> bool {
        // Compare finding descriptions and locations
        old.len() == new.len() && old.iter().all(|o| {
            new.iter().any(|n| {
                o.description == n.description
                    && o.file == n.file
                    && o.line == n.line
            })
        })
    }

    fn log_findings(&self, findings: &[Finding]) {
        for finding in findings {
            log::info!(
                "[{}] {}: {}",
                format!("{:?}", finding.severity),
                finding.category,
                finding.description
            );
        }
    }
}

pub enum RemediationResult {
    Complete, // No Critical/Major findings
    Resolved, // Critical/Major findings resolved
    Escalate(Vec<Finding>), // Escalate to parent-tier orchestrator
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

**Integration with orchestrator:**

In `src/core/orchestrator.rs`, after gate passes and reviewer subagent runs:

```rust
// After reviewer subagent completes
let reviewer_output = parse_reviewer_output(&iteration_result.output)?;

// Run remediation loop
let remediation_result = self.remediation_loop
    .run(tier_id, reviewer_output)
    .await?;

match remediation_result {
    RemediationResult::Complete => {
        // Proceed with tier completion
    }
    RemediationResult::Resolved => {
        // Re-run gate to verify fixes
        // Then proceed with tier completion
    }
    RemediationResult::Escalate(findings) => {
        // Escalate to parent-tier orchestrator
        self.escalate_to_parent(tier_id, findings).await?;
        return Err(anyhow!("Tier {} escalated due to unresolved Critical/Major findings", tier_id));
    }
}
```

**Platform-specific implementation:** Works identically across all platforms -- remediation loop is orchestrator-level logic, not platform-specific. All platforms receive remediation prompts and re-run subagents the same way. The overseer and reviewer subagents are re-run using the same platform/model as the original tier execution.

**Integration with existing quality verification:** This extends the existing "required reviewer subagent" requirement. The reviewer must output structured findings with severity; the orchestrator enforces the remediation loop. The remediation loop runs **after** the gate passes but **before** tier completion, ensuring Critical/Major issues are addressed before advancing.

### 4. Cross-Run Knowledge Continuity

**Concept:** Persist architectural decisions, established patterns, tech choices, and lessons learned across runs through canonical runtime storage, planning artifacts, and handoff bundles. When a new run starts, load prior context from those canonical sources to maintain continuity.

**What to persist:**

- **Architectural decisions:** Tech stack choices, design patterns, framework selections.
- **Established patterns:** Code organization, naming conventions, testing strategies.
- **Tech choices:** Dependency versions, tool configurations, environment setup.
- **Pitfalls encountered:** Known issues, workarounds, anti-patterns to avoid.

**Canonical storage posture:**

- orchestration continuity is derived from seglog/redb-backed runtime state, stored plan outputs, and normalized handoff bundles.
- `.puppet-master/memory/*` is not the canonical continuity source for orchestrator child runs.
- continuity records should be queryable and attributable without requiring a memory-manager sidecar file hierarchy.

**When to persist:** At phase completion, especially after planning/architecture work, extract durable decisions and patterns from canonical outputs and store them through the same runtime/project persistence path used for other orchestrator artifacts.

**When to load:** At run start, before Phase 1 begins, assemble continuity context from canonical persisted decisions, stored outputs, and handoff projections. The same continuity inputs may inform child selection (for example, a prior Rust decision may bias toward a Rust-focused child Persona), but they do not create subagent-specific durable memory.

**Platform-specific implementation:** Platform-agnostic. All platforms benefit from canonical continuity inputs injected into prompts, but the continuity source remains runtime storage and structured artifacts rather than memory files.

### 5. Active Agent Tracking

Active child tracking must project from canonical storage and events rather than from mutable side files.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md

Rules:
- `active-agents.json` is not canonical runtime truth.
- child visibility, conflict prevention, and status rollups come from seglog/redb projections.
- launch order, batch membership, subgroup membership, and parent-child lineage are canonical projection fields.
- stale child entries are resolved through canonical status and expiry logic, not side-file cleanup heuristics.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md
### 6. Safe Error Handling (Guaranteed Structured Output)

**Concept:** Hooks and verification functions must never crash the session. Use wrappers that guarantee structured output (JSON or Result) even on failure.

**Wrapper pattern:**

```rust
pub fn safe_hook_main<F>(hook_fn: F) -> String
where
    F: FnOnce() -> Result<HookOutput, HookError>,
{
    match hook_fn() {
        Ok(output) => serde_json::to_string(&output).unwrap_or_else(|_| r#"{"status":"ok"}"#.to_string()),
        Err(e) => serde_json::to_string(&HookErrorOutput {
            status: "error",
            message: e.to_string(),
            details: None,
        }).unwrap_or_else(|_| r#"{"status":"error","message":"unknown"}"#.to_string()),
    }
}
```

**Application:**

- **BeforeTier/AfterTier hooks:** Wrap hook execution in `safe_hook_main` so hooks never crash.
- **Verification functions:** Return `Result<(), VerificationError>` with structured error types.
- **Subagent output parsing:** On parse failure, return `SubagentOutput { task_report: raw_output, downstream_context: None, findings: vec![] }` (partial output) rather than crashing.

**Platform-specific implementation:** Platform-agnostic -- safe error handling is Rust-level. All platforms benefit from the same wrappers.

### 7. Lazy Lifecycle (State Created on First Write)

**Concept:** Verification state directories are created lazily (on first write) and pruned after inactivity. No explicit setup/teardown commands required.

**Lazy creation:**

- **BeforeTier hook:** On first tier start, create `.puppet-master/verification/<session-id>/` if it doesn't exist.
- **State files:** Create on first write (e.g., `active-subagents.json`, `handoff-reports.json`).
- **No setup command:** Users don't need to run "puppet-master setup" -- state is created automatically.

**Stale pruning:**

- **BeforeTier hook:** Prune verification state older than threshold (e.g., 2 hours of inactivity).
- **Pruning logic:** Check modification time of state files; delete if older than threshold.
- **No teardown command:** Cleanup happens automatically during normal operation.

**Platform-specific implementation:** Platform-agnostic -- lazy lifecycle is orchestrator-level file system management. All platforms benefit from the same behavior.

### 8. Structured Handoff Contract Enforcement at Runtime

**Concept:** Enforce the structured handoff format (Task Report + Downstream Context + Findings) at runtime via AfterTier hook validation, not just in prompts. This ensures reliability even if prompts are modified.

**Enforcement:**

- **AfterTier hook:** Calls `validate_subagent_output()` (see #2 above).
- **On validation failure:** Block response, request one retry with format instruction.
- **After retry:** If still malformed, proceed with partial output (fail-safe) but mark tier as "complete with warnings."

**Documentation:** Document the contract in AGENTS.md and in subagent prompt templates. State that subagents **must** produce structured output; runtime validation enforces it.

**Platform-specific implementation:**

- **Cursor/Codex/Claude/Gemini:** Parse JSON output; validate required fields (`task_report`, `downstream_context`, `findings`).
- **Copilot:** Parse text output; extract structured sections via regex or pattern matching; validate presence.

**Integration with existing plan:** This complements the existing "required reviewer subagent" requirement. The reviewer must produce structured output; runtime validation ensures it.

### Platform-Specific Implementation Summary

| Feature | Cursor | Codex | Claude | Gemini | Copilot | Implementation Level |
|---------|--------|-------|--------|--------|---------|---------------------|
| **BeforeTier/AfterTier hooks** | Native hooks + orchestrator | CLI/provider bridge hooks + orchestrator | Native hooks + orchestrator | Native hooks + orchestrator | Orchestrator only | Orchestrator + platform hooks |
| **Handoff validation** | JSON parse | JSONL parse | JSON parse | JSON parse | Text parse | Platform-specific parser |
| **Remediation loop** | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator (platform-agnostic) |
| **Cross-session memory** | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator (platform-agnostic) |
| **Active agent tracking** | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator (platform-agnostic) |
| **Safe error handling** | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator (platform-agnostic) |
| **Lazy lifecycle** | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator (platform-agnostic) |
| **Contract enforcement** | JSON validation | JSONL validation | JSON validation | JSON validation | Text validation | Platform-specific validator |

**Key insight:** Most features are **orchestrator-level** (platform-agnostic). Only handoff validation and contract enforcement need platform-specific parsers (JSON vs JSONL vs text). Hooks can leverage platform-native hooks where available (Cursor, Claude, Gemini) but also work via orchestrator-level middleware for all platforms.

### Integration with Start/End Verification

These lifecycle and quality features **complement** the existing start/end verification:

- **BeforeTier hook** runs **before** `verify_tier_start` (tracks active subagent, injects context, prunes state).
- **AfterTier hook** runs **after** `verify_tier_end` (validates handoff format, tracks completion, safe error handling).
- **Remediation loop** extends the existing "required reviewer subagent" -- reviewer outputs structured findings; orchestrator enforces remediation.
- **Cross-session memory** enhances Phase 1 context (loads prior decisions before planning).
- **Active agent tracking** enhances logging and debugging (shows which subagent ran at each tier).

### Additional Gaps and Potential Issues for Lifecycle and Quality Features

**Gap #14: Platform-native hook registration and discovery**

**Issue:** How do we discover and register platform-native hooks (Cursor `.cursor/hooks.json`, Claude `.claude/settings.json`)? Gemini is a Direct API provider and does not use a platform-native hook config file. Should Puppet Master auto-discover hooks or require explicit configuration?

**Mitigation:**
- **Auto-discovery:** Scan for hook config files in project root and home directory on startup. Register discovered hooks as adapters.
- **Explicit config:** Add `platform_hooks` section to `PuppetMasterConfig`:
  ```yaml
  platform_hooks:
    cursor:
      enabled: true
      config_path: ".cursor/hooks.json"
    claude:
      enabled: true
      config_path: ".claude/settings.json"
    gemini:
      enabled: false
      # Gemini is a Direct API provider; hooks are orchestrator-level only
  ```
- **Fallback:** If platform-native hooks fail or are unavailable, fall back to orchestrator-level hooks (always available).

**Gap #15: Hook execution order and dependencies**

**Issue:** When multiple hooks are registered (built-in + platform-native), what is the execution order? Can hooks depend on each other? What if one hook blocks execution?

**Mitigation:**
- **Execution order:** Built-in hooks run first (ActiveSubagentTrackerHook, TierContextInjectorHook, StaleStatePrunerHook), then platform-native hooks, then custom hooks.
- **Dependencies:** Hooks should be independent. If a hook needs data from another hook, use shared context (`BeforeTierContext`/`AfterTierContext`).
- **Blocking:** First hook that blocks stops execution. Log which hook blocked and why.

**Gap #16: Structured output parsing reliability**

**Issue:** Platform output formats may vary (JSON vs JSONL vs text). Parsers may fail on edge cases (malformed JSON, partial output, streaming output). How do we handle parsing failures gracefully?

**Mitigation:**
- **Multi-pass parsing:** Try JSON parse first, then JSONL, then text extraction. Use best-effort parsing with fallbacks.
- **Partial output handling:** If parsing fails, extract what we can (e.g., `task_report` from text even if `findings` missing). Mark tier as "complete with warnings."
- **Parser testing:** Comprehensive test suite for each platform parser with edge cases (malformed JSON, unicode, large outputs, streaming).
- **Parser versioning:** Track parser version and platform CLI version. Update parsers when platform CLI changes.

**Gap #17: Remediation loop infinite retry risk**

**Issue:** Remediation loop could retry indefinitely if findings never resolve (e.g., false positives, unrelated failures). How do we detect and break infinite loops?

**Mitigation:**
- **Max retries:** Hard limit (default: 3) on remediation retries per tier.
- **Progress detection:** Compare findings between retries. If findings unchanged after 2 retries, escalate (don't retry again).
- **Escalation threshold:** After max retries, escalate to parent-tier orchestrator. Parent-tier can decide to skip, fix manually, or re-plan.
- **Timeout:** Remediation loop has overall timeout (e.g., 30 minutes). If timeout exceeded, escalate.

**Gap #18: Memory persistence conflicts and staleness**

**Issue:** Memory files may become stale (outdated decisions), conflict between runs (different decisions), or grow unbounded. How do we manage memory lifecycle?

**Mitigation:**
- **Versioning:** Each memory entry has timestamp. Load only recent entries (e.g., last 30 days) unless explicitly requested.
- **Conflict resolution:** When loading memory, detect conflicts (e.g., "Rust + Actix" vs "Python + FastAPI"). Prompt user or use most recent decision.
- **Pruning:** Prune old memory entries (older than threshold, e.g., 90 days) unless marked as "persistent."
- **Size limits:** Limit memory file sizes (e.g., max 10MB per file). Rotate or archive old entries.

**Gap #19: Active subagent tracking accuracy**

**Issue:** Active subagent tracking may be inaccurate if subagent selection changes mid-tier, or if platform-native hooks override selection. How do we ensure tracking reflects reality?

**Mitigation:**
- **Single source of truth:** `TierContext.active_subagent` is set by BeforeTier hook (built-in ActiveSubagentTrackerHook). Platform-native hooks can override but must update `TierContext`.
- **Validation:** AfterTier hook validates that tracked subagent matches actual execution (check platform logs or output for subagent name).
- **Fallback:** If tracking fails, infer subagent from output patterns (e.g., "rust-engineer" if output mentions Rust-specific patterns).

**Gap #20: Safe error handling performance overhead**

**Issue:** Wrapping every hook/verification function in `safe_hook_main` adds overhead. Could impact performance for high-frequency operations.

**Mitigation:**
- **Selective wrapping:** Only wrap hooks and verification functions that could panic or fail unpredictably. Trusted functions (e.g., simple getters) don't need wrapping.
- **Lazy evaluation:** Use `Result` types instead of panics where possible. Only wrap functions that could panic.
- **Performance testing:** Benchmark wrapped vs unwrapped functions. If overhead > 5%, optimize or remove wrapping for hot paths.

**Gap #21: Lazy lifecycle state directory permissions**

**Issue:** Lazy creation of state directories may fail due to permissions (e.g., `.puppet-master/verification/` not writable). How do we handle permission errors gracefully?

**Mitigation:**
- **Permission check:** Before creating directories, check write permissions. If not writable, log error and continue (state won't be persisted but execution continues).
- **Fallback location:** If default location not writable, try fallback (e.g., `/tmp/puppet-master-<user>/`).
- **User notification:** Log clear error message with instructions (e.g., "Cannot create state directory. Run: chmod 755 .puppet-master").

**Gap #22: Structured handoff contract enforcement prompt injection**

**Issue:** Subagents may ignore structured output format instructions in prompts. Runtime validation catches this, but retry may also fail if subagent doesn't understand format requirement.

**Mitigation:**
- **Explicit format examples:** Include JSON schema example in prompt:
  ```
  Required output format:
  {
    "task_report": "What I did...",
    "downstream_context": "Info for next tier...",
    "findings": [{"severity": "critical", "category": "security", ...}]
  }
  ```
- **Platform-specific instructions:** For Copilot (text-only), provide markdown format example instead of JSON.
- **Validation feedback:** If retry fails, include validation error in retry prompt: "Your output was missing 'task_report' field. Please include it."
- **Fail-safe:** After retry fails, extract partial output (best-effort) and proceed with warnings.

**Gap #23: Cross-platform hook adapter complexity**

**Issue:** Platform-native hook adapters (CursorNativeHookAdapter, ClaudeNativeHookAdapter, GeminiNativeHookAdapter) must handle different hook formats, communication protocols (JSON stdin/stdout, exit codes), and error handling. This adds complexity.

**Mitigation:**
- **Unified adapter trait:** Define `PlatformHookAdapter` trait with common interface:
  ```rust
  trait PlatformHookAdapter: Send + Sync {
      fn execute_before_tier(&self, ctx: &BeforeTierContext) -> Result<BeforeTierResult>;
      fn execute_after_tier(&self, ctx: &AfterTierContext) -> Result<AfterTierResult>;
      fn platform(&self) -> Platform;
  }
  ```
- **Platform-specific implementations:** Each platform adapter handles its own format/protocol internally.
- **Testing:** Test each adapter with mock hook scripts. Verify JSON parsing, exit code handling, error cases.
- **Documentation:** Document hook format for each platform in `docs/platform-hooks.md`.

**Gap #24: Memory extraction from Phase 1 output**

**Issue:** How do we extract architectural decisions, patterns, tech choices, and pitfalls from Phase 1 (Planning/Architecture) output? Phase 1 output is unstructured text, not structured JSON.

**Mitigation:**
- **Pattern matching:** Use regex/pattern matching to extract decisions (e.g., "We chose Rust + Actix" → save as architectural decision).
- **LLM extraction:** Run a lightweight extraction subagent (e.g., `project-manager`) on Phase 1 output to extract structured memory entries.
- **Manual tagging:** Allow Phase 1 subagent to explicitly tag decisions (e.g., `<memory:architecture>Rust + Actix</memory:architecture>`).
- **Best-effort:** Extract what we can. Missing extractions don't block execution; memory is enhancement, not requirement.

**Gap #25: Remediation loop subagent re-execution context**

**Issue:** When remediation loop re-runs overseer/reviewer subagents, do they get the same context (prompt, files, state) as original execution, or modified context (remediation prompt, updated files)?

**Mitigation:**
- **Modified context:** Re-run with remediation prompt appended, but include original context (files, state) so subagent has full picture.
- **Incremental fixes:** Each retry builds on previous fixes. Include previous iteration's output in context.
- **State preservation:** Don't reset tier state between remediation retries. Preserve progress (e.g., files modified, tests run).

**Gap #26: Hook performance impact on tier execution time**

**Issue:** Hooks add overhead to tier execution (BeforeTier hooks run before every tier start, AfterTier hooks run after every tier completion). Could slow down fast tiers significantly.

**Mitigation:**
- **Async hooks:** Run hooks asynchronously where possible (e.g., StaleStatePrunerHook can run in background).
- **Selective execution:** Skip hooks for Iteration tier (too frequent) or only run critical hooks (ActiveSubagentTrackerHook, HandoffValidatorHook).
- **Caching:** Cache hook results when inputs unchanged (e.g., TierContextInjectorHook can cache injected context for same tier type).
- **Performance monitoring:** Track hook execution time. If hooks > 10% of tier time, optimize or skip non-critical hooks.

**Gap #27: Structured output validation false positives**

**Issue:** Validation may incorrectly reject valid output (false positive) if parser is too strict, or accept invalid output (false negative) if parser is too lenient.

**Mitigation:**
- **Lenient validation:** Accept partial output (e.g., missing `downstream_context` is OK, missing `task_report` is not). Only reject if critical fields missing.
- **Parser testing:** Test with real platform outputs to tune validation strictness. Aim for < 1% false positive rate.
- **User feedback:** If validation fails, log raw output for debugging. Allow users to report false positives.
- **Parser updates:** Update parsers based on user feedback and platform CLI changes.

### Implementation Notes

- **Where:** New module `src/core/hooks.rs` or `src/verification/hooks.rs` for hook system; `src/core/memory.rs` for cross-session persistence; extend `SubagentOutput` in `src/types/` for structured handoff.
- **What:** Implement `BeforeTierHook` and `AfterTierHook` traits; `save_memory()` and `load_memory()` functions; `validate_subagent_output()` with platform-specific parsers; remediation loop in orchestrator completion logic.
- **When:** Hooks run automatically at tier boundaries; memory persists at Phase completion and loads at run start; remediation loop runs when Critical/Major findings detected.

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection

## Platform capability next steps

1. Review and approve this plan
2. Implement Phase 1 (Project Context Detection)
3. Implement Phase 2 (Subagent Selector)
4. Integrate with orchestrator
5. Test with real projects

---

## Implementation Notes (Where Code Lives and What to Add)

Short notes so implementers know where to put code and what the orchestrator already provides.

### Phase 1: Project Context Detection

- **Where:** New module e.g. `src/core/subagent_selector.rs` or `src/core/project_context.rs`; language/framework detection can live there or in a small `src/core/detection/` (e.g. `language.rs`, `framework.rs`).
- **What:** Implement `ProjectContext`, `DetectedLanguage`, and detection that scans workspace paths (Cargo.toml, package.json, etc.). Cache results per workspace path (or in-memory for the run) so Phase 2 and the orchestrator do not recompute every time. Expose a function like `detect_project_context(workspace: &Path) -> Result<ProjectContext>`.

### Phase 2: Subagent Selector

- **Where:** Same module as Phase 1 or `src/core/subagent_selector.rs`; use the **Known subagent names** table (Gaps §4) as the canonical list; consider `DRY:DATA:subagent_names` in a shared constant or `subagent_registry` module.
- **What:** `SubagentSelector::new(project_context)`, `select_for_tier(tier_type, tier_context) -> Vec<String>`, and the language/framework/domain mappings from the Tier-Level Subagent Strategy. No platform calls yet; pure logic. If SubagentManager is used, it may come from another plan (e.g. interview); otherwise treat it as optional for v1 (or a thin wrapper that just holds workspace path).

### Phase 3: Orchestrator Integration

- **Where:** `src/core/orchestrator.rs`. The orchestrator already has `tier_config_for(tier_type) -> &TierConfig` (platform, model, plan_mode, etc.); use it for subagent runs.
- **What to add:** (1) Read `enable_tier_subagents` and subagent config from the same config source as tier config (e.g. from run config or GuiConfig). (2) When executing a tier, if subagents enabled: call `SubagentSelector::select_for_tier`, apply `tier_overrides` (replace if non-empty, else use selected list), filter `disabled_subagents`, add `required_subagents`. (3) **Register agent in coordination state** before execution (see "Agent Coordination and Communication"). (4) **Get coordination context** and inject into prompt (warns agent about active files/operations). (5) For each subagent name, build an `ExecutionRequest` (prompt with coordination context, model, **plan_mode from tier_config**, etc.) and run via the existing platform runner (same path as non-subagent iterations). (6) **Update coordination state** during execution (files being edited, current operation). (7) **Unregister agent** after execution completes. (8) `build_subagent_invocation` and `execute_with_subagent` can be methods that take `tier_config` (for plan_mode and platform/model) and call the runner. Platform/model: use `tier_config_for(tier_node.tier_type).platform` and `.model` (no separate get_platform_for_tier needed if you use tier_config_for).

### Phase 4: Error Pattern Detection

- **Where:** In the orchestrator or in a small helper that parses iteration output (e.g. stderr/stdout). Update `TierContext.has_errors` or `error_patterns` from the result of the last iteration so the next selection can add debugger/security-auditor etc.
- **What:** Define how to detect "compilation error," "test failure," "security issue" (e.g. regex on stderr or exit codes). Keep it simple for v1 (e.g. non-zero exit + keyword in stderr).

### SubagentManager

- The plan references `SubagentManager` "from interview plan." If that module exists, use it for whatever it provides (e.g. loading agent definitions from disk). If it does not exist, implement only what Phase 3 needs: subagent selection and invocation via the existing runner; no separate "manager" is strictly required for v1.

### Config-wiring validation (Phase / Task / Subtask / Iteration)

- **Where:** New module e.g. `src/core/config_wiring.rs` or `src/verification/config_wiring.rs` (or split: `config_wiring/orchestrator.rs` and `config_wiring/interview.rs`). The main orchestrator calls the validator from `src/core/orchestrator.rs` at each tier boundary; the interview orchestrator calls an interview-specific validator from `src/interview/orchestrator.rs` at phase (and any sub-tier) start.
- **What:** Implement `validate_config_wiring_for_tier(tier_type, config_snapshot, context) -> Result<(), WiringError>` (or equivalent) that checks: for **Phase** -- phase tier config present, plan_mode/orchestrator flags applied, interview config fields present when in interview run; for **Task** -- task tier config present, subagent config present and applied; for **Subtask** -- subtask tier config present, subagent list from config; for **Iteration** -- iteration tier config present, request built from tier config. See the **"Config-Wiring Validation: Required vs Optional Fields (Resolved)"** table in the Build Queue checklist above for the fail vs warn policy per field.
- **When called:** Immediately before the orchestrator builds execution context or spawns the agent for that tier (i.e. at Phase start, Task start, Subtask start, Iteration start). Do not skip validation for "fast path" or tests unless explicitly gated (e.g. env var to disable for a specific test).

### Start and end verification (wiring + readiness + quality)

- **Where:** Same verification module as config-wiring (e.g. `src/verification/` or `src/core/`) or a dedicated `tier_verification.rs`. The main orchestrator calls `verify_tier_start` when entering a Phase/Task/Subtask (after or as part of config-wiring) and `verify_tier_end` when completing a Phase/Task/Subtask (after acceptance gate; quality step can be part of gate or separate).
- **What:** Start: config-wiring (existing) + wiring/readiness checklist (GUI updated? backend updated? steps make sense? known gaps?). End: wiring re-check + existing acceptance gate + quality verification. Quality verification is **both** (1) required reviewer subagent (code-reviewer) at end-of-tier, on retry, and when gate fails; (2) gate criteria (clippy, tests, etc.). Parent-tier orchestrator addresses unrelated failures. See **"Start and End Verification at Phase, Task, and Subtask"** for the table and gaps. Define per-tier quality checklist (e.g. Phase: docs; Task: design; Subtask: code + tests + clippy) in code or config.
- **When called:** Start at Phase/Task/Subtask entry; end at Phase/Task/Subtask completion (before marking tier complete). Iteration can use tier-level checks only (no separate iteration start/end verification unless needed).
- **Integration with hooks:** BeforeTier hook runs **before** `verify_tier_start` (tracks active subagent, injects context, prunes stale state). AfterTier hook runs **after** `verify_tier_end` (validates handoff format, tracks completion). See **"Lifecycle and Quality Features"** for hook implementation.

### Agent coordination

- **Where:** New module `src/core/agent_coordination.rs` for cross-platform coordination over canonical runtime state. Platform runners read projected coordination state and consume injected coordination context; optional debug mirrors may exist, but they are not the source of truth.
- **What:** (1) **Canonical coordination projection (cross-platform):** Implement `AgentCoordinator` over child-run state, lineage, current file activity, and platform/runtime metadata projected from seglog/redb. Register agents before execution, update status during execution from hooks/provider events/tool activity, unregister or terminally resolve after execution. **This enables cross-platform coordination** without making `active-agents.json` the canon. (2) **Prompt injection:** Inject coordination context into each agent's prompt (active agents with platform info, files being modified, warnings about conflicts). Include platform identifier so agents know which platform other agents are using. (3) **Status updates:** Extract file operations from agent output (parse file paths, use platform hooks/provider events) and update canonical coordination state periodically. (4) **Conflict prevention:** Check projected coordination state before execution to detect file conflicts; warn agents or delay execution if conflicts detected.
- **When called:** Register agent before tier execution (include platform from tier_config); update status during execution (periodically or on file operations); unregister after execution by resolving the child run through canonical status projection. See **"Agent Coordination and Communication"** for full details and cross-platform examples.

### Lifecycle hooks and quality features

- **Where:** New module `src/core/hooks.rs` or `src/verification/hooks.rs` for hook system; canonical persistence and recovery projections in seglog/redb for continuity; extend `SubagentOutput` in `src/types/` for structured handoff format; remediation loop in orchestrator completion logic (`src/core/orchestrator.rs`).
- **What:** (1) **BeforeTier/AfterTier hooks:** Implement hook traits, register hooks per tier type, call automatically at tier boundaries. For platforms with native hooks (Cursor, Claude, Gemini), register Puppet Master hooks that delegate where possible; for Codex/Copilot, use orchestrator-level middleware and canonical coordination projection. (2) **Structured handoff validation:** `validate_subagent_output()` with platform-specific parsers (JSON for Cursor/Claude/Gemini, JSONL for Codex, text parsing for Copilot). (3) **Remediation loop:** Parse findings from reviewer subagent output; filter Critical/Major; block completion and re-run until resolved or max retries; escalate to parent-tier on max retries. (4) **Cross-run continuity:** Persist architectural decisions, patterns, and tech choices as canonical outputs and projections at Phase completion; reload them at run start through handoff/context assembly rather than child-memory files. (5) **Active agent tracking:** `active_subagent: Option<String>` in `TierContext`; update in BeforeTier/AfterTier hooks; persist through canonical runtime storage and projections. (6) **Safe error handling:** Wrap hooks and verification in `safe_hook_main()` that guarantees structured output even on failure. (7) **Lazy lifecycle:** Create verification state on first write; prune stale state (>2 hours) in BeforeTier hook. (8) **Contract enforcement:** AfterTier hook validates handoff format; retry on malformed output; fail-safe after retry.
- **When called:** Hooks run automatically at tier boundaries (before `verify_tier_start`, after `verify_tier_end`). Cross-run continuity persists at Phase completion and loads through run-start context assembly. Remediation loop runs when Critical/Major findings detected. See **"Lifecycle and Quality Features"** for full details and platform-specific implementation notes.

### Considerations #6 (Subagent availability / files)

- "Check if subagent files exist before selection" is optional for v1. Cursor and other platforms may resolve subagent names internally (e.g. built-in or workspace config). If we later support custom agent files (e.g. under `.cursor/agents/` or similar), add a check then; for now, treat the canonical list as valid and let the platform CLI fail if a name is unsupported.

---

## Parallel Execution & Subagent Integration

### Current Parallel Execution Capabilities

The orchestrator already supports parallel execution of subtasks:

1. **Dependency Analysis**: Uses `DependencyAnalyzer` with Kahn's topological sort to build execution levels
2. **Parallel Executor (`ParallelExecutor`)**: Executes subtasks concurrently within dependency levels
3. **Worktree Isolation**: Each parallel subtask runs in its own git worktree
4. **Dependency-Aware**: Respects `TierNode.dependencies` to determine execution order

**Execution Flow:**
```
Level 0: [Subtask A, Subtask B] → Run in parallel (no dependencies)
Level 1: [Subtask C] → Runs after A and B complete
Level 2: [Subtask D] → Runs after C completes
```

### Subagent Selection for Parallel Subtasks

When subtasks run in parallel, each subtask can have **different subagents** selected independently:

**Example Scenario:**
- **Subtask A** (Rust backend API): `rust-engineer` + `backend-developer`
- **Subtask B** (React frontend UI): `react-specialist` + `frontend-developer`
- Both run in parallel (Level 0), each with their own specialized subagents

**Implementation:**

```rust
// src/core/orchestrator.rs (modifications to execute_subtasks_parallel)

async fn execute_subtasks_parallel(&self, subtask_ids: &[String]) -> Result<Vec<Result<()>>> {
    // ... existing dependency analysis ...

    // Get parallelizable groups
    let groups = self.dependency_analyzer.get_parallelizable_groups(dependencies)?;

    // Execute each group sequentially
    for group in groups {
        // Create worktrees for each subtask
        for id in &group {
            let _ = self.create_subtask_worktree(id).await?;
        }

        // Execute subtasks in parallel, each with its own subagent selection
        let results = join_all(group.iter().map(|id| async {
            let tree = self.tier_tree.lock().unwrap();
            let tier_node = tree.find_by_id(id).unwrap();

            // Build context for this specific subtask
            let tier_context = self.build_tier_context(&tier_node, &context)?;

            // DRY REQUIREMENT: Subagent selection MUST use subagent_selector which uses subagent_registry — NEVER hardcode subagent names
            ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Contracts_V0.md
            // Select subagents for THIS subtask (independent of others)
            let subagent_names = self.subagent_selector.select_for_tier(
                TierType::Subtask,
                &tier_context,
            );
            // DRY: Validate selected subagent names using subagent_registry::is_valid_subagent_name()
            for name in &subagent_names {
                if !subagent_registry::is_valid_subagent_name(name) {
                    log::warn!("Invalid subagent name selected: {}", name);
                }
            }

            // DRY REQUIREMENT: execute_tier_with_subagents MUST use platform_specs for platform-specific invocation
            ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Executor_Protocol.md
            // Execute with selected subagents
            self.execute_tier_with_subagents(&tier_node, &tier_context, &subagent_names).await
        })).await;

        // ... cleanup ...
    }
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

### Context Flow Through Dependency Chains

Subagents can inherit context from completed dependencies:

**Dependency Chain Example:**
```
Subtask A (rust-engineer) → Subtask B (rust-engineer + test-automator)
```

**Implementation:**

```rust
// src/core/subagent_selector.rs (additions)

impl SubagentSelector {
    // DRY:FN:select_with_dependency_context — Select subagents with dependency context
    // DRY REQUIREMENT: MUST use subagent_registry::get_subagent_for_language() — NEVER hardcode language → subagent mappings
    ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Contracts_V0.md
    /// Select subagents with dependency context
    pub fn select_with_dependency_context(
        &self,
        tier_node: &TierNode,
        completed_dependencies: &[TierNode],
        tier_context: &TierContext,
    ) -> Vec<String> {
        let mut subagents = self.select_for_tier(tier_node.tier_type, tier_context);

        // DRY REQUIREMENT: language_to_subagent MUST use subagent_registry::get_subagent_for_language()
        ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Contracts_V0.md
        // Inherit language/domain from completed dependencies
        for dep in completed_dependencies {
            if let Some(dep_context) = self.get_tier_context(dep) {
                // Inherit language if not already set
                if tier_context.primary_language.is_none() {
                    if let Some(lang) = &dep_context.primary_language {
                        // DRY: Use subagent_registry — DO NOT call self.language_to_subagent which may hardcode mappings
                        if let Some(subagent) = subagent_registry::get_subagent_for_language(lang) {
                            if !subagents.contains(&subagent) {
                                subagents.insert(0, subagent); // Prioritize inherited language
                            }
                        }
                    }
                }

                // Inherit domain if not already set
                if tier_context.domain == ProjectDomain::Unknown {
                    // Use domain from dependency
                }
            }
        }

        subagents
    }
}
```

### Agent Coordination and Communication

When multiple agents/subagents run concurrently (parallel subtasks, different tiers, or same tier with multiple subagents), they need **coordination** to avoid conflicts, understand what others are working on, and not "freak out" when code changes around them.

This owner section defines both the canonical live coordination projection and the canonical attributable crew message-board contract used when agents need questions, decisions, warnings, or requests to survive beyond transient status updates.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

#### Canonical crew message-board contract

PM-managed multi-agent collaboration uses a canonical file-backed message board at `.puppet-master/state/agent-messages.json` for attributable cross-agent coordination that cannot be reduced to live status projection alone.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

The message board complements the active-agent coordination projection:
- active-agent state answers who is active, what files are in flight, and which operations are currently running
- the message board answers who asked, warned, decided, or requested something, who it targeted, and whether that exchange was resolved

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Contracts_V0.md

Canonical message schema:
- `message_id` (UUID)
- `from_agent_id`
- `from_platform`
- `to_agent_id?` for direct routing
- `to_agent_type?` for role-wide routing
- `to_tier_id?` for tier-wide routing
- `message_type` = `Question | Answer | Update | Request | Decision | Warning | Announcement`
- `priority` = `low | normal | high | urgent`
- `subject`
- `content`
- `context` (files mentioned, operations mentioned, sender tier, related message ids)
- `thread_id?`
- `in_reply_to?`
- `created_at`
- `read_by[]`
- `resolved`

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Commands_System.md, ContractName:Plans/Architecture_Invariants.md

Routing rules:
- direct routing uses `to_agent_id`
- role-wide routing uses `to_agent_type`
- tier-wide routing uses `to_tier_id`
- broadcast routing leaves all three target selectors empty
- the orchestrator MUST be able to inspect every message regardless of agent-local visibility filters
- agent-local views MUST be filtered to direct messages, type-matched messages, tier-matched messages, broadcast messages, and file-relevant messages for the agent's active work

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Priority and rate limits:
- `normal` is the default priority
- `high` and `urgent` are reserved for blockers, conflict warnings, or manager-requested escalations
- each agent is capped at **10 messages per minute** across all routing modes
- when an agent hits the cap, PM MUST emit a structured throttling diagnostic and require the sender to coalesce or defer additional messages rather than silently dropping them

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md

Threading and lifecycle:
- `thread_id` groups related coordination exchanges
- `in_reply_to` links replies to the causal parent message
- messages move through created, read, replied, resolved, and expired/archive states
- unresolved blocker threads and unresolved coordination requests MUST remain visible until resolved or explicitly superseded, even when ordinary retention archives stale messages after 24 hours

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md

**Benefits of coordination:**

- **Conflict prevention:** Agents know what files/modules others are modifying, avoiding simultaneous edits
- **Context awareness:** Agents understand what other agents are working on, reducing confusion when seeing changes
- **Efficient collaboration:** Agents can build on each other's work, reference shared decisions, and avoid duplicate effort
- **Reduced errors:** Agents don't overwrite each other's changes or create conflicting implementations
- **Cross-platform coordination:** Agents from different platforms (Codex, Claude, Cursor, Gemini, Copilot) can coordinate with each other through shared state files

**Coordination mechanisms:**

1. **Shared state files (existing):** All agents read `progress.txt`, `AGENTS.md`, `prd.json` -- these provide **asynchronous** coordination (agents see what others have done, not what they're doing now).

2. **Real-time coordination state (new, cross-platform):** Add a canonical coordination projection, optionally mirrored to `.puppet-master/state/active-agents.json` for debugging, that tracks:
   - Which agents/subagents are currently active (including platform: "codex", "claude", "cursor", "gemini", "copilot")
   - What files/modules each agent is working on
   - What operations each agent is performing (e.g., "editing src/api.rs", "running tests")
   - Platform identifier (so agents know which platform other agents are using)
   - Timestamp of last update

   **This projected coordination works across ALL platforms** -- a Codex agent can see what a Claude agent is doing, and vice versa. All platforms consume the same canonical coordination state even if a debug JSON mirror exists.

3. **Attributable crew message board (canonical):** Use `.puppet-master/state/agent-messages.json` for durable questions, answers, decisions, warnings, requests, and announcements that agents or the orchestrator need to revisit after transient status updates.

4. **Provider-bridge coordination (current):**

   - No same-platform shared thread/session coordination path is active.
   - Codex and Copilot follow the same projected coordination contract as Cursor/Claude/Gemini.
   - Cross-platform and same-platform coordination both use canonical coordination state + prompt injection.

5. **Cross-worktree awareness:** Even when agents run in separate worktrees, they can:
   - Read shared state files from main repo (progress.txt, prd.json)
   - Read the projected active-agent state to see what others are doing (regardless of platform)
   - Write their own status through the same projected coordination path before starting work
   - Update status as they work (file being edited, operation in progress)

6. **Prompt injection:** Inject coordination context into each agent's prompt:
   ```
   **Active Agents:**
   - rust-engineer (Codex) is editing src/api.rs (started 2 minutes ago)
   - test-automator (Claude Code) is running tests in tests/api_test.rs (started 1 minute ago)

   **Files Being Modified:**
   - src/api.rs (by rust-engineer on Codex)
   - tests/api_test.rs (by test-automator on Claude Code)

   **Your Task:** Implement authentication middleware. Avoid editing src/api.rs until rust-engineer finishes.
   ```

**Cross-platform coordination example:**

When a Codex agent and a Claude Code agent work simultaneously:

```
1. Codex agent (rust-engineer) starts Subtask A:
   - Registers in active-agents.json:
     {
       "agent_id": "rust-engineer-1.1.1",
       "platform": "codex",
       "tier_id": "1.1.1",
       "current_operation": "Starting API implementation",
       "files_being_edited": []
     }

2. Claude Code agent (test-automator) starts Subtask B (parallel):
   - Reads active-agents.json before starting
   - Sees: "rust-engineer (Codex) is working on Subtask A"
   - Registers itself:
     {
       "agent_id": "test-automator-1.1.2",
       "platform": "claude",
       "tier_id": "1.1.2",
       "current_operation": "Starting test implementation",
       "files_being_edited": []
     }

3. Codex agent begins editing src/api.rs:
   - Updates coordination projection:
     {
       "agent_id": "rust-engineer-1.1.1",
       "platform": "codex",
       "files_being_edited": ["src/api.rs"],
       "current_operation": "Editing src/api.rs to add POST /users endpoint"
     }

4. Claude Code agent reads coordination state (periodic check):
   - Sees: "rust-engineer (Codex) is editing src/api.rs"
   - Prompt includes: "**Active Agents:** rust-engineer (Codex) is editing src/api.rs. **Your Task:** Add tests for POST /users endpoint. Wait for rust-engineer to finish src/api.rs before adding tests."
   - Agent understands context and avoids editing src/api.rs

5. Codex agent completes:
   - Unregisters from coordination projection
   - Claude Code agent can now safely edit src/api.rs for tests
```

**Platform field in coordination state:**

The coordination projection includes a `platform` field so agents know which platform other agents are using:

```json
{
  "active_agents": {
    "rust-engineer-1.1.1": {
      "agent_id": "rust-engineer-1.1.1",
      "platform": "codex",
      "tier_id": "1.1.1",
      "worktree_path": ".puppet-master/worktrees/1.1.1",
      "files_being_edited": ["src/api.rs"],
      "current_operation": "Editing src/api.rs",
      "started_at": "2026-02-18T10:00:00Z",
      "last_update": "2026-02-18T10:02:00Z"
    },
    "test-automator-1.1.2": {
      "agent_id": "test-automator-1.1.2",
      "platform": "claude",
      "tier_id": "1.1.2",
      "worktree_path": ".puppet-master/worktrees/1.1.2",
      "files_being_edited": ["tests/api_test.rs"],
      "current_operation": "Writing tests for API endpoint",
      "started_at": "2026-02-18T10:01:00Z",
      "last_update": "2026-02-18T10:03:00Z"
    }
  },
  "last_updated": "2026-02-18T10:03:00Z"
}
```

This allows agents to see not just what others are doing, but also which platform they're using, which can be useful context (e.g., "Codex agent is working on this, Claude agent is working on that").

**Implementation:**

```rust
// src/core/agent_coordination.rs (new module)

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
// DRY:DATA:ActiveAgent — Active agent coordination state
pub struct ActiveAgent {
    pub agent_id: String, // e.g., "rust-engineer", "test-automator"
    pub platform: Platform, // "codex", "claude", "cursor", "gemini", "copilot" - enables cross-platform coordination
    pub tier_id: String,
    pub worktree_path: Option<PathBuf>, // None if main repo
    pub files_being_edited: Vec<PathBuf>,
    pub current_operation: String, // e.g., "editing src/api.rs", "running tests"
    pub started_at: DateTime<Utc>,
    pub last_update: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentCoordinationState {
    pub active_agents: HashMap<String, ActiveAgent>, // keyed by agent_id
    pub last_updated: DateTime<Utc>,
}

// DRY:DATA:AgentCoordinator — Agent coordination state manager
pub struct AgentCoordinator {
    state_file: PathBuf,
}

impl AgentCoordinator {
    // DRY:FN:new — Create agent coordinator
    pub fn new(project_root: &Path) -> Self {
        Self {
            state_file: project_root.join(".puppet-master").join("state").join("active-agents.json"),
        }
    }

    // DRY:FN:register_agent — Register an agent as active
    // DRY REQUIREMENT: Agent platform field MUST be from tier_config.platform — NEVER hardcode platform
    ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Models_System.md
    /// Register an agent as active
    pub async fn register_agent(&self, agent: ActiveAgent) -> Result<()> {
        // DRY: Validate agent_id format if needed — use subagent_registry::is_valid_subagent_name() for subagent names
        let mut state = self.load_state().await?;
        state.active_agents.insert(agent.agent_id.clone(), agent);
        state.last_updated = Utc::now();
        self.save_state(&state).await
    }

    /// Update agent status (files being edited, current operation)
    pub async fn update_agent_status(
        &self,
        agent_id: &str,
        files_being_edited: Vec<PathBuf>,
        current_operation: String,
    ) -> Result<()> {
        let mut state = self.load_state().await?;
        if let Some(agent) = state.active_agents.get_mut(agent_id) {
            agent.files_being_edited = files_being_edited;
            agent.current_operation = current_operation;
            agent.last_update = Utc::now();
            state.last_updated = Utc::now();
            self.save_state(&state).await
        } else {
            Err(anyhow!("Agent {} not found", agent_id))
        }
    }

    /// Unregister an agent (when it completes)
    pub async fn unregister_agent(&self, agent_id: &str) -> Result<()> {
        let mut state = self.load_state().await?;
        state.active_agents.remove(agent_id);
        state.last_updated = Utc::now();
        self.save_state(&state).await
    }

    // DRY:FN:get_coordination_context — Get coordination context for prompt injection
    /// Get coordination context for prompt injection
    pub async fn get_coordination_context(&self) -> Result<String> {
        let state = self.load_state().await?;
        let mut context = String::new();

        if !state.active_agents.is_empty() {
            context.push_str("**Active Agents:**\n");
            for agent in state.active_agents.values() {
                let age = Utc::now().signed_duration_since(agent.started_at);
                // DRY REQUIREMENT: Platform display name MUST use platform_specs::display_name_for() — NEVER hardcode platform names
                ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Models_System.md
                let platform_display = platform_specs::display_name_for(agent.platform);
                context.push_str(&format!(
                    "- {} ({}) is {} (started {} ago, tier: {})\n",
                    agent.agent_id,
                    platform_display, // Use platform_specs for display name
                    agent.current_operation,
                    format_duration(age),
                    agent.tier_id
                ));
            }

            context.push_str("\n**Files Being Modified:**\n");
            let mut all_files: Vec<_> = state.active_agents.values()
                .flat_map(|a| &a.files_being_edited)
                .collect();
            all_files.sort();
            all_files.dedup();
            for file in all_files {
                let agents: Vec<_> = state.active_agents.values()
                    .filter(|a| a.files_being_edited.contains(file))
                    .map(|a| &a.agent_id)
                    .collect();
                context.push_str(&format!(
                    "- {} (by {})\n",
                    file.display(),
                    agents.join(", ")
                ));
            }
        }

        Ok(context)
    }

    async fn load_state(&self) -> Result<AgentCoordinationState> {
        if self.state_file.exists() {
            let json = std::fs::read_to_string(&self.state_file)?;
            let state: AgentCoordinationState = serde_json::from_str(&json)?;
            // Prune stale agents (no update in last hour)
            let mut pruned = state.clone();
            let cutoff = Utc::now() - chrono::Duration::hours(1);
            pruned.active_agents.retain(|_, agent| agent.last_update > cutoff);
            if pruned.active_agents.len() != state.active_agents.len() {
                self.save_state(&pruned).await?;
            }
            Ok(pruned)
        } else {
            Ok(AgentCoordinationState {
                active_agents: HashMap::new(),
                last_updated: Utc::now(),
            })
        }
    }

    async fn save_state(&self, state: &AgentCoordinationState) -> Result<()> {
        std::fs::create_dir_all(self.state_file.parent().unwrap())?;
        let json = serde_json::to_string_pretty(state)?;
        std::fs::write(&self.state_file, json)?;
        Ok(())
    }
}

fn format_duration(d: chrono::Duration) -> String {
    if d.num_minutes() < 1 {
        format!("{}s", d.num_seconds())
    } else if d.num_hours() < 1 {
        format!("{}m", d.num_minutes())
    } else {
        format!("{}h {}m", d.num_hours(), d.num_minutes() % 60)
    }
}
```

**Integration with orchestrator:**

In `src/core/orchestrator.rs`, before executing a tier:

```rust
// Before tier execution
let coordinator = AgentCoordinator::new(&self.config.project.working_directory);

// Register this agent/subagent as active (includes platform for cross-platform coordination)
coordinator.register_agent(ActiveAgent {
    agent_id: format!("{}-{}", subagent_name, tier_id),
    platform: tier_config.platform, // Include platform so other agents know which platform this agent uses
    tier_id: tier_id.to_string(),
    worktree_path: self.get_tier_worktree(tier_id),
    files_being_edited: Vec::new(), // Will update as agent works
    current_operation: format!("Starting tier {}", tier_id),
    started_at: Utc::now(),
    last_update: Utc::now(),
}).await?;

// Get coordination context and inject into prompt
let coordination_context = coordinator.get_coordination_context().await?;
let enhanced_prompt = if !coordination_context.is_empty() {
    format!("{}\n\n{}", prompt, coordination_context)
} else {
    prompt
};

// During execution, update status periodically (e.g., when agent edits files)
// This requires parsing agent output or using platform-specific hooks
// For now, update on tier completion

// After tier execution
coordinator.unregister_agent(&format!("{}-{}", subagent_name, tier_id)).await?;
```

**Provider coordination model (Codex/Copilot included):**

- **Canonical mode:** Coordination projection for all platforms, optionally mirrored to `active-agents.json` for debugging.
- **Scope:** Works for same-platform and cross-platform crews using the same state schema.
- **Runtime path:** Direct-provider invocation via direct provider calls (no local CLI bridge); no SDK threads/sessions.
- **Prompt contract:** Every subagent receives coordination context built from shared state.

**When to use coordination modes:**

- **File-based coordination (canonical):** Always on for orchestrator-managed runs. All platforms (Codex, Claude, Cursor, Gemini, Copilot) read/write the same coordination file.
- **Platform-native hooks (optional enrichments):** Use hook events where available to improve update fidelity, but keep the file-based state as the single source of coordination truth.

**Benefits:**

- **Reduced conflicts:** Agents know what files others are editing, avoiding simultaneous modifications. Coordination context warns agents: "rust-engineer is editing src/api.rs -- avoid this file."
- **Better context:** Agents understand what others are working on, reducing confusion when seeing changes. Agent sees: "test-automator is running tests -- these test failures are expected."
- **Efficient collaboration:** Agents can reference shared decisions and avoid duplicate work. Agent sees: "architect-reviewer established pattern X -- use this pattern."
- **No "freaking out":** Agents see coordination context explaining why code is changing, who is changing it, and what they're doing. Reduces false alarms and confusion.
- **Platform-neutral:** one coordination contract across providers keeps behavior deterministic and replayable.

**Coordination state updates:**

- **Before execution:** Agent registers in coordination state with initial operation description.
- **During execution:** Agent updates coordination state periodically (e.g., every 30 seconds or when file operations occur):
  - Files being edited (extracted from agent output or platform hooks)
  - Current operation (e.g., "editing src/api.rs", "running cargo test")
  - Progress updates
- **After execution:** Agent unregisters from coordination state.

**Extracting file operations from agent output:**

- **Parse agent output:** Use output parser to detect file paths mentioned in agent responses (e.g., "I'm editing src/api.rs" or file paths in diffs).
- **Platform hooks:** For platforms with native hooks (Cursor, Claude, Gemini), use `PreToolUse`/`PostToolUse` hooks to detect file operations in real-time.
- **Provider event adapters:** For Codex/Copilot, use normalized CLI stream/tool events to detect file operations in real time.

**Example coordination flow (cross-platform):**

```
1. Agent A (rust-engineer, Codex) starts Subtask A: registers in the coordination projection
   - agent_id: "rust-engineer-1.1.1"
   - platform: "codex"
   - current_operation: "Starting implementation of API endpoint"
   - files_being_edited: []

2. Agent A begins editing: updates coordination state
   - files_being_edited: ["src/api.rs"]
   - current_operation: "Editing src/api.rs to add POST /users endpoint"

3. Agent B (test-automator, Claude Code) starts Subtask B (parallel): reads coordination state
   - Sees: "rust-engineer (Codex) is editing src/api.rs"
   - Prompt includes: "**Active Agents:** rust-engineer (Codex) is editing src/api.rs (started 1 minute ago). **Your Task:** Add tests for POST /users endpoint. Wait for rust-engineer to finish src/api.rs before adding tests."

4. Agent B (Claude Code) waits or works on other files, then proceeds when Agent A (Codex) finishes
   - Cross-platform coordination: Claude agent sees Codex agent's status via the shared coordination projection

5. Agent A (Codex) completes: unregisters from coordination state
   - Agent B (Claude Code) can now safely edit src/api.rs for tests
```

**Key point:** Canonical coordination projection enables **cross-platform communication**. A Codex agent and a Claude Code agent can coordinate through the same active-agent state even when they run on different providers/CLIs.

**Provider-bridge runner integration (canonical):**

- **All platform runners (Cursor, Codex, Claude, Gemini, Copilot):** read/update canonical coordination state and consume the same prompt injection contract.
- **No shared provider sessions/threads:** orchestrator keeps fresh-process isolation per iteration and uses canonical projections plus events for coordination.

**Implementation notes:**

- **Where:** New module `src/core/agent_coordination.rs` for canonical coordination projection; platform runners read/write coordination state and consume injected context.
- **What:** Implement `AgentCoordinator`, inject coordination context into prompts, and keep status updates provider-agnostic.
- **When:** Register agent before execution; update status during execution (periodically or on file operations); unregister after execution.

### Puppet Master Crews (Teams/Fleets Alternative)

Crew mode is a multi-model coordination overlay over child runs.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md

Canonical crew rules:
- members are child runs.
- model/provider diversity is the default distinguishing axis.
- the same task and often the same Persona are preserved across the crew.
- member-to-member coordination occurs through an attributable crew board.
- the parent owns final synthesis and user-facing escalation.
- crew shared state is explicit shared coordination state, not hidden long-term member memory.

Crew defaults and confirmation:
- default crews live in the model/runtime settings surface.
- first crew invocation asks whether to use the default crew if one exists.
- after model choice, PM resolves each member’s provider/runtime surface and discloses the resulting mapping.
- if any member is Copilot, the crew normalizes to Copilot as a crew-level provider constraint.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/CLI_Bridged_Providers.md
### Gaps and Potential Issues for Crews Feature

Gap-era crew notes in this section are retired as canonical guidance. The live crew rules now resolve through the orchestrator contracts elsewhere in this document rather than through illustrative fallback numbers, and the superseded gap-era examples that previously followed this heading MUST NOT be implemented as live crew canon.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Crosswalk.md

#### Canonical crew-cap and availability rules

Crew admission MUST use `executionLimits` as the sole live source for:
- `maxConcurrentCrewsPerPlatform = 4`
- `maxConcurrentAgentsPerCrew = 8`
- `maxTotalActiveAgents = 32`
- `maxNestingDepth = 4`
- `maxTotalSpawnedAgents = 99`
- `maxToolRoundsPerAgent = 200`

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Crosswalk.md

Later illustrative examples in this file MUST NOT widen or replace those values. Availability checks MAY narrow admission further based on platform support, current saturation, quota posture, or policy, but they MUST fail closed rather than inventing alternate per-gap ceilings.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md

#### Crew lifecycle, cleanup, and GUI routing

Crew lifecycle, timeout propagation, cancellation, and cleanup follow the canonical parent/child orchestration and runtime lifecycle contracts. This section no longer defines separate crew-only timeout ceilings, alternate cleanup paths, or stale concurrency examples.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

GUI and future Assistant-surface affordances for crews remain consumer projections. They MUST disclose canonical crew/member state and runtime ceilings, but they do not become the owner of orchestration authority.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Crosswalk.md

#### Future Assistant-surface note

User-initiated crews remain future Assistant functionality. When that surface lands, platform selection, queueing, and subagent admission still resolve through the same orchestrator-owned ceilings and compatibility checks defined here and in `executionLimits`; future UX MUST NOT reintroduce alternative defaults such as "20 total crews" or "3 crews per subagent type".

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Crosswalk.md

### Additional Enhancements for Crews

**Enhancement #1: Crew templates and presets**

Allow users (when Assistant feature is added) to save crew configurations as templates:

```rust
pub struct CrewTemplate {
    pub name: String,
    pub subagents: Vec<String>,
    pub default_task: Option<String>,
    pub description: String,
}

// Users can create templates like:
// "Full Stack Crew": [rust-engineer, frontend-developer, test-automator, code-reviewer]
// "Security Review Crew": [security-auditor, compliance-auditor, code-reviewer]
```

**Enhancement #2: Crew performance metrics**

Track and display crew performance:
- Average time to complete tasks
- Success rate (tasks completed vs failed)
- Member utilization (how often each subagent type is used)
- Platform usage distribution

**Enhancement #3: Crew learning and adaptation**

Crews can learn from past executions:
- Track which subagent combinations work best for different task types
- Suggest optimal crew compositions based on historical data
- Adapt crew behavior based on success patterns

**Enhancement #4: Crew scheduling and prioritization**

When multiple crews are queued:
- Prioritize crews by tier dependency (crews for earlier tiers run first)
- Schedule crews based on platform quota availability
- Allow users to reorder crew execution (when Assistant feature is added)

**Gap #52: Crew integration with PRD/plan generation**

**Issue:** When the interview generates PRD/plans, should it account for crews? Should plans specify which tasks/subtasks benefit from crews? Should plans include crew recommendations?

**Mitigation:**
- **Crew-aware plan generation:** When interview generates PRD/plans, include crew recommendations for tasks that would benefit from multiple subagents working together
- **Plan annotations:** Add crew hints to PRD tasks/subtasks (e.g., "This subtask benefits from a crew: rust-engineer + test-automator + code-reviewer")
- **Crew templates in plans:** Plans can reference crew templates (e.g., "Use 'Full Stack Crew' template for this phase")
- **Orchestrator awareness:** Orchestrator reads crew hints from PRD and automatically creates crews when appropriate

**Integration with interview plan generation:**

When interview generates PRD (`prd.json`), add crew metadata to tasks/subtasks:

```json
{
  "phases": [
    {
      "tasks": [
        {
          "subtasks": [
            {
              "id": "ST-001-001-001",
              "title": "Implement authentication API",
              "crew_recommendation": {
                "suggested": true,
                "subagents": ["rust-engineer", "security-auditor", "test-automator"],
                "rationale": "Requires security expertise, implementation, and testing"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

**Gap #53: Crew coordination with interview phases**

**Issue:** Can crews be used during the interview itself? Should interview phases use crews for research/validation/documentation?

**Mitigation:**
- **Interview phase crews:** Interview phases can use crews internally (e.g., Architecture phase crew: architect-reviewer + knowledge-synthesizer + technical-writer)
- **Research crews:** Research operations can use crews (e.g., multiple researchers working in parallel)
- **Document generation crews:** Document generation can use crews (e.g., technical-writer + knowledge-synthesizer + qa-expert)
- **Cross-phase coordination:** Crews can coordinate across interview phases (e.g., Architecture crew shares decisions with Testing crew)

**Note:** This is separate from orchestrator-initiated crews for execution tiers. Interview crews are for interview flow only.

**Why this is valuable:**

1. **Cross-platform communication:** Works for all supported providers (Cursor, Claude Code, OpenCode, Codex, Gemini, GitHub Copilot), even those without native teams/fleets support
2. **Orchestrator visibility:** Boss agent (orchestrator) can monitor all subagent communication, providing insights into what subagents are doing and how they're coordinating
3. **Platform-agnostic:** Can be used alongside native teams/fleets (Claude Code Teams, Copilot Fleets) but provides fallback and cross-platform capabilities
4. **Enhanced coordination:** Enables more sophisticated coordination patterns (agents asking for help, sharing decisions, requesting reviews)
5. **Unified interface:** Single communication system works the same way across all providers

**Comparison with native solutions:**

| Feature | Claude Code Teams | Copilot Fleets | Puppet Master Communication |
|---------|------------------|----------------|---------------------------|
| Cross-platform | ❌ Claude only | ❌ Copilot only | ✅ All supported providers |
| Orchestrator visibility | Limited | Limited | ✅ Full visibility |
| Agent-to-agent messaging | ✅ Native | ❌ Not supported | ✅ Supported |
| File-based (no API) | ❌ Uses API | ❌ Uses API | ✅ File-based |
| Works with CLI-only | ❌ Requires Teams API | ❌ Requires Fleets API | ✅ Pure file-based |

**Architecture:**

The communication system extends the existing coordination state with a message board/queue:

```
.puppet-master/state/
├── active-agents.json          # Optional debug mirror of agent status tracking
└── agent-messages.json         # New: agent-to-agent messages
```

**Message structure:**

```rust
// src/core/agent_communication.rs (new module)

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
// DRY:DATA:AgentMessage — Agent-to-agent message structure
pub struct AgentMessage {
    pub message_id: String, // UUID
    pub from_agent_id: String, // e.g., "rust-engineer-1.1.1"
    pub from_platform: Platform,
    pub to_agent_id: Option<String>, // None = broadcast
    pub to_agent_type: Option<String>, // e.g., "test-automator", "code-reviewer"
    pub to_tier_id: Option<String>, // e.g., "1.1" (all agents in this tier)
    pub message_type: MessageType,
    pub subject: String, // Brief summary
    pub content: String, // Full message content
    pub context: MessageContext, // Files, operations, etc.
    pub thread_id: Option<String>, // For threaded conversations
    pub in_reply_to: Option<String>, // message_id of message being replied to
    pub created_at: DateTime<Utc>,
    pub read_by: Vec<String>, // agent_ids that have read this message
    pub resolved: bool, // Whether this message/request has been resolved
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageType {
    Question, // Agent asking a question
    Answer, // Agent answering a question
    Update, // Agent sharing progress/status update
    Request, // Agent requesting help/review/approval
    Decision, // Agent sharing a decision (architecture, pattern, etc.)
    Warning, // Agent warning about conflicts/issues
    Announcement, // Agent announcing completion/blocker
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageContext {
    pub files_mentioned: Vec<PathBuf>,
    pub operations_mentioned: Vec<String>, // e.g., "editing src/api.rs", "running tests"
    pub tier_id: String,
    pub related_messages: Vec<String>, // message_ids
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentMessageBoard {
    pub messages: Vec<AgentMessage>,
    pub last_updated: DateTime<Utc>,
    pub schema_version: u32,
}
```

**Message routing:**

Messages can be routed to:
- **Direct:** Specific agent ID (`to_agent_id`)
- **By type:** All agents of a specific type (`to_agent_type`, e.g., "all test-automators")
- **By tier:** All agents in a specific tier (`to_tier_id`)
- **Broadcast:** All active agents (`to_agent_id = None`, `to_agent_type = None`, `to_tier_id = None`)

**Usage examples:**

**Example 1: Agent asking for help**

```rust
// Rust engineer needs help with testing
coordinator.post_message(AgentMessage {
    message_id: uuid::Uuid::new_v4().to_string(),
    from_agent_id: "rust-engineer-1.1.1".to_string(),
    from_platform: Platform::Codex,
    to_agent_type: Some("test-automator".to_string()), // Ask all test-automators
    message_type: MessageType::Question,
    subject: "Need help writing tests for POST /users endpoint".to_string(),
    content: "I've implemented the POST /users endpoint in src/api.rs. Can someone help me write comprehensive tests? The endpoint handles validation, authentication, and database insertion.".to_string(),
    context: MessageContext {
        files_mentioned: vec![PathBuf::from("src/api.rs")],
        operations_mentioned: vec!["implemented POST /users endpoint".to_string()],
        tier_id: "1.1.1".to_string(),
        related_messages: vec![],
    },
    thread_id: None,
    in_reply_to: None,
    created_at: Utc::now(),
    read_by: vec![],
    resolved: false,
}).await?;
```

**Example 2: Agent sharing a decision**

```rust
// Architect reviewer shares architectural decision
coordinator.post_message(AgentMessage {
    message_id: uuid::Uuid::new_v4().to_string(),
    from_agent_id: "architect-reviewer-1.0".to_string(),
    from_platform: Platform::Claude,
    to_tier_id: Some("1.1".to_string()), // Share with all agents in tier 1.1
    message_type: MessageType::Decision,
    subject: "Architecture decision: Use Actix-web for API server".to_string(),
    content: "After reviewing requirements, I've decided we should use Actix-web for the API server. This provides async/await support, good performance, and strong Rust ecosystem integration. All agents working on API-related tasks should use this framework.".to_string(),
    context: MessageContext {
        files_mentioned: vec![],
        operations_mentioned: vec!["architecture review".to_string()],
        tier_id: "1.0".to_string(),
        related_messages: vec![],
    },
    thread_id: None,
    in_reply_to: None,
    created_at: Utc::now(),
    read_by: vec![],
    resolved: false,
}).await?;
```

**Example 3: Agent warning about conflicts**

```rust
// Agent warns about file conflict
coordinator.post_message(AgentMessage {
    message_id: uuid::Uuid::new_v4().to_string(),
    from_agent_id: "test-automator-1.1.2".to_string(),
    from_platform: Platform::Claude,
    to_agent_id: Some("rust-engineer-1.1.1".to_string()), // Direct message
    message_type: MessageType::Warning,
    subject: "File conflict: src/api.rs".to_string(),
    content: "I'm about to add tests for src/api.rs. Are you still editing it? I'll wait if you need more time.".to_string(),
    context: MessageContext {
        files_mentioned: vec![PathBuf::from("src/api.rs")],
        operations_mentioned: vec!["adding tests".to_string()],
        tier_id: "1.1.2".to_string(),
        related_messages: vec![],
    },
    thread_id: None,
    in_reply_to: None,
    created_at: Utc::now(),
    read_by: vec![],
    resolved: false,
}).await?;
```

**Integration with orchestrator:**

The orchestrator monitors all messages and can:
- **Track agent communication:** See which agents are talking to each other
- **Detect blockers:** Identify when agents are stuck or need help
- **Monitor decisions:** Track architectural decisions and ensure consistency
- **Detect conflicts:** See warnings about file conflicts before they happen
- **Provide insights:** Show communication patterns in GUI

**Integration with agent prompts:**

Messages are injected into agent prompts as part of coordination context:

```rust
// In orchestrator, before executing agent
let coordination_context = coordinator.get_coordination_context().await?;
let messages = coordinator.get_messages_for_agent(&agent_id, &tier_id).await?;
let message_context = coordinator.format_messages_for_prompt(&messages)?;

let enhanced_prompt = format!(
    "{}\n\n{}\n\n**Messages from other agents:**\n{}",
    prompt,
    coordination_context,
    message_context
);
```

**Message filtering:**

Agents only see messages relevant to them:
- Messages addressed to their agent_id
- Messages addressed to their agent type
- Messages addressed to their tier_id
- Broadcast messages
- Messages mentioning files they're working on

**Message threading:**

Messages can be threaded (conversations):
- `thread_id`: Groups related messages together
- `in_reply_to`: Links reply to original message
- Agents can follow threads to see conversation history

**Message lifecycle:**

- **Created:** Agent posts message
- **Read:** Agent reads message (tracked in `read_by`)
- **Replied:** Agent replies (creates new message with `in_reply_to`)
- **Resolved:** Message marked as resolved (e.g., question answered, request fulfilled)
- **Expired:** Old messages (>24 hours) are archived or deleted

**Implementation:**

```rust
// src/core/agent_communication.rs

// DRY:DATA:AgentCommunicator — Agent-to-agent message communication
pub struct AgentCommunicator {
    message_board_file: PathBuf,
    coordinator: AgentCoordinator, // Reuse coordination state
}

impl AgentCommunicator {
    // DRY:FN:new — Create agent communicator
    pub fn new(project_root: &Path) -> Self {
        Self {
            message_board_file: project_root.join(".puppet-master").join("state").join("agent-messages.json"),
            coordinator: AgentCoordinator::new(project_root),
        }
    }

    // DRY:FN:post_message — Post a message to the message board
    // DRY REQUIREMENT: Validate agent_id using subagent_registry::is_valid_subagent_name() if it's a subagent name
    /// Post a message to the message board
    pub async fn post_message(&self, message: AgentMessage) -> Result<()> {
        // DRY: Validate message.from_agent_id if it's a subagent name (not a tier-specific ID)
        // Implementation note: Extract subagent name from agent_id if format is "subagent-tier_id"
        // and validate using subagent_registry::is_valid_subagent_name()
        let mut board = self.load_message_board().await?;
        board.messages.push(message);
        board.last_updated = Utc::now();
        self.save_message_board(&board).await
    }

    /// Get messages relevant to an agent
    pub async fn get_messages_for_agent(
        &self,
        agent_id: &str,
        tier_id: &str,
        agent_type: Option<&str>,
    ) -> Result<Vec<AgentMessage>> {
        let board = self.load_message_board().await?;
        let active_agents = self.coordinator.load_state().await?;

        // Filter messages relevant to this agent
        let relevant: Vec<_> = board.messages.iter()
            .filter(|msg| {
                // Direct message
                if let Some(ref to_id) = msg.to_agent_id {
                    if to_id == agent_id {
                        return true;
                    }
                }

                // Message to agent type
                if let Some(ref to_type) = msg.to_agent_type {
                    if agent_type.map(|t| t == to_type).unwrap_or(false) {
                        return true;
                    }
                }

                // Message to tier
                if let Some(ref to_tier) = msg.to_tier_id {
                    if to_tier == tier_id {
                        return true;
                    }
                }

                // Broadcast (no specific recipient)
                if msg.to_agent_id.is_none() && msg.to_agent_type.is_none() && msg.to_tier_id.is_none() {
                    return true;
                }

                // Message mentions files agent is working on
                if let Some(agent) = active_agents.active_agents.get(agent_id) {
                    for file in &agent.files_being_edited {
                        if msg.context.files_mentioned.contains(file) {
                            return true;
                        }
                    }
                }

                false
            })
            .cloned()
            .collect();

        Ok(relevant)
    }

    /// Format messages for prompt injection
    pub fn format_messages_for_prompt(&self, messages: &[AgentMessage]) -> Result<String> {
        if messages.is_empty() {
            return Ok(String::new());
        }

        let mut formatted = String::new();
        formatted.push_str("**Recent Messages from Other Agents:**\n\n");

        for msg in messages.iter().take(10) { // Limit to 10 most recent
            // DRY REQUIREMENT: Platform display name MUST use platform_specs::display_name_for() — NEVER hardcode platform names
            ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Models_System.md
            let platform_display = platform_specs::display_name_for(msg.from_platform);
            let from_info = format!("{} ({})", msg.from_agent_id, platform_display);
            let message_type_str = match msg.message_type {
                MessageType::Question => "❓ Question",
                MessageType::Answer => "✅ Answer",
                MessageType::Update => "📢 Update",
                MessageType::Request => "🙏 Request",
                MessageType::Decision => "🎯 Decision",
                MessageType::Warning => "⚠️ Warning",
                MessageType::Announcement => "📣 Announcement",
            };

            formatted.push_str(&format!(
                "- **{}** from {}: {}\n  {}\n",
                message_type_str,
                from_info,
                msg.subject,
                msg.content
            ));

            if !msg.context.files_mentioned.is_empty() {
                formatted.push_str(&format!(
                    "  Files: {}\n",
                    msg.context.files_mentioned.iter()
                        .map(|f| f.display().to_string())
                        .collect::<Vec<_>>()
                        .join(", ")
                ));
            }
        }

        Ok(formatted)
    }

    /// Mark message as read
    pub async fn mark_message_read(&self, message_id: &str, agent_id: &str) -> Result<()> {
        let mut board = self.load_message_board().await?;
        if let Some(msg) = board.messages.iter_mut().find(|m| m.message_id == message_id) {
            if !msg.read_by.contains(&agent_id.to_string()) {
                msg.read_by.push(agent_id.to_string());
                self.save_message_board(&board).await?;
            }
        }
        Ok(())
    }

    /// Archive old messages (>24 hours)
    pub async fn archive_old_messages(&self) -> Result<()> {
        let mut board = self.load_message_board().await?;
        let cutoff = Utc::now() - chrono::Duration::hours(24);

        let (active, archived): (Vec<_>, Vec<_>) = board.messages
            .into_iter()
            .partition(|msg| msg.created_at > cutoff || !msg.resolved);

        board.messages = active;
        self.save_message_board(&board).await?;

        // Save archived messages to separate file
        if !archived.is_empty() {
            let archive_file = self.message_board_file.with_extension("archive.json");
            // Append to archive file
            // ...
        }

        Ok(())
    }

    async fn load_message_board(&self) -> Result<AgentMessageBoard> {
        // Similar to AgentCoordinator::load_state
        // ...
    }

    async fn save_message_board(&self, board: &AgentMessageBoard) -> Result<()> {
        // Similar to AgentCoordinator::save_state (with locking)
        // ...
    }
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

**Integration with agent execution:**

Agents can post messages during execution:

```rust
// In orchestrator, during agent execution
// Parse agent output for message commands
if agent_output.contains("@message") || agent_output.contains("@ask") {
    // Extract message from agent output
    let message = parse_message_from_output(&agent_output)?;
    communicator.post_message(message).await?;
}

// Before agent execution, inject messages into prompt
let messages = communicator.get_messages_for_agent(&agent_id, &tier_id, Some(&agent_type)).await?;
let message_context = communicator.format_messages_for_prompt(&messages)?;
```

**Orchestrator monitoring:**

The orchestrator can monitor all messages for insights:

```rust
// In orchestrator
pub struct OrchestratorInsights {
    pub active_conversations: Vec<ConversationThread>,
    pub pending_questions: Vec<AgentMessage>,
    pub recent_decisions: Vec<AgentMessage>,
    pub conflict_warnings: Vec<AgentMessage>,
}

impl OrchestratorInsights {
    pub async fn analyze_communication(&self, communicator: &AgentCommunicator) -> Result<Self> {
        let board = communicator.load_message_board().await?;

        // Analyze messages for insights
        // ...
    }
}
```

**Benefits:**

1. **Cross-platform:** Works for all providers, even without native teams/fleets
2. **Orchestrator visibility:** Boss agent can see all subagent communication
3. **Enhanced coordination:** Agents can ask for help, share decisions, warn about conflicts
4. **File-based:** No API calls, pure file-based (fits Puppet Master architecture)
5. **Flexible routing:** Messages can be direct, by type, by tier, or broadcast
6. **Threaded conversations:** Supports multi-turn conversations
7. **Integration:** Works seamlessly with existing coordination state

**Potential issues and mitigations:**

- **Message spam:** Limit message rate per agent (max 10 messages/minute)
- **Large message board:** Archive old messages, limit message history
- **File locking:** Use same locking mechanism as coordination state
- **Message parsing:** Agents may not always format messages correctly -- provide clear instructions in prompts
- **Orphaned messages:** Messages from crashed agents -- mark as resolved after agent unregisters

**Next steps:**

1. Add message board to coordination state
2. Implement `AgentCommunicator` with message posting/reading
3. Integrate message injection into agent prompts
4. Add orchestrator monitoring/insights
5. Add GUI visualization of agent communication
6. Test with multiple agents across different platforms

### Gaps and Potential Issues for Agent Coordination

**Gap #28: File locking and concurrent writes**

**Issue:** Multiple agents may write to `active-agents.json` simultaneously, causing race conditions, file corruption, or lost updates. The current implementation reads the entire file, modifies it, and writes it back -- this is not atomic.

**Mitigation:**
- **File locking:** Use advisory file locks (e.g., `flock` on Unix, `File::lock` in Rust) to ensure exclusive access during writes. Implement retry logic with exponential backoff if lock acquisition fails.
- **Atomic writes:** Write to a temporary file (`active-agents.json.tmp`), then atomically rename to `active-agents.json` (rename is atomic on most filesystems).
- **Read-modify-write with retry:** If file changes between read and write, reload and retry (up to 3 attempts).
- **Lock timeout:** If lock cannot be acquired within 5 seconds, log warning and proceed (coordination may be stale but execution continues).

```rust
// src/core/agent_coordination.rs (enhanced)

use std::fs::File;
use std::io::{Read, Write};
use std::os::unix::fs::FileExt; // For file locking on Unix

impl AgentCoordinator {
    async fn save_state_with_lock(&self, state: &AgentCoordinationState) -> Result<()> {
        let lock_file = self.state_file.with_extension("lock");
        let mut attempts = 0;
        const MAX_ATTEMPTS: u32 = 3;

        loop {
            // Try to acquire lock
            match self.acquire_lock(&lock_file).await {
                Ok(_) => break,
                Err(e) if attempts < MAX_ATTEMPTS => {
                    attempts += 1;
                    tokio::time::sleep(tokio::time::Duration::from_millis(100 * attempts)).await;
                    continue;
                }
                Err(e) => {
                    // Lock timeout — log warning but proceed
                    tracing::warn!("Could not acquire coordination lock after {} attempts: {}. Proceeding without lock.", MAX_ATTEMPTS, e);
                    break;
                }
            }
        }

        // Write to temp file first
        let temp_file = self.state_file.with_extension("tmp");
        let json = serde_json::to_string_pretty(state)?;
        std::fs::write(&temp_file, json)?;

        // Atomic rename
        std::fs::rename(&temp_file, &self.state_file)?;

        // Release lock
        let _ = std::fs::remove_file(&lock_file);

        Ok(())
    }

    async fn acquire_lock(&self, lock_file: &Path) -> Result<()> {
        // Create lock file with PID
        let pid = std::process::id();
        let lock_content = format!("{}\n", pid);

        // Try to create lock file exclusively
        match std::fs::OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(lock_file)
        {
            Ok(mut file) => {
                file.write_all(lock_content.as_bytes())?;
                Ok(())
            }
            Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => {
                // Check if lock is stale (process no longer exists)
                if let Ok(content) = std::fs::read_to_string(lock_file) {
                    if let Ok(lock_pid) = content.trim().parse::<u32>() {
                        // Check if process exists (Unix-specific)
                        if !self.process_exists(lock_pid) {
                            // Stale lock — remove it
                            let _ = std::fs::remove_file(lock_file);
                            return self.acquire_lock(lock_file).await;
                        }
                    }
                }
                Err(anyhow!("Lock file exists"))
            }
            Err(e) => Err(anyhow!("Failed to create lock: {}", e)),
        }
    }

    fn process_exists(&self, pid: u32) -> bool {
        // Unix-specific: check if process exists
        #[cfg(unix)]
        {
            use std::process::Command;
            Command::new("kill")
                .args(&["-0", &pid.to_string()])
                .output()
                .map(|o| o.status.success())
                .unwrap_or(false)
        }
        #[cfg(not(unix))]
        {
            // Windows: use different approach
            true // Assume exists for now
        }
    }
}
```

**Gap #29: Error handling and file corruption recovery**

**Issue:** If `active-agents.json` becomes corrupted (invalid JSON, partial write, disk full), coordination breaks. Agents may not be able to register or read coordination state.

**Mitigation:**
- **JSON validation:** Validate JSON structure after reading. If invalid, try to parse what we can (best-effort recovery).
- **Backup before write:** Create backup (`active-agents.json.bak`) before each write. If write fails, restore from backup.
- **Fallback to empty state:** If file is corrupted and cannot be recovered, start with empty state (all agents unregistered). Log warning.
- **Corruption detection:** Check file size, JSON validity, and schema compliance. If corrupted, attempt recovery or reset.

```rust
async fn load_state(&self) -> Result<AgentCoordinationState> {
    if self.state_file.exists() {
        let json = match std::fs::read_to_string(&self.state_file) {
            Ok(json) => json,
            Err(e) => {
                tracing::error!("Failed to read coordination state: {}. Using empty state.", e);
                return Ok(AgentCoordinationState::default());
            }
        };

        // Try to parse JSON
        match serde_json::from_str::<AgentCoordinationState>(&json) {
            Ok(state) => {
                // Validate schema (check required fields)
                self.validate_state(&state)?;
                Ok(state)
            }
            Err(e) => {
                // Try backup
                let backup_file = self.state_file.with_extension("bak");
                if backup_file.exists() {
                    tracing::warn!("Coordination state corrupted. Attempting backup recovery.");
                    if let Ok(backup_json) = std::fs::read_to_string(&backup_file) {
                        if let Ok(backup_state) = serde_json::from_str(&backup_json) {
                            tracing::info!("Recovered coordination state from backup.");
                            return Ok(backup_state);
                        }
                    }
                }

                // Last resort: empty state
                tracing::error!("Coordination state corrupted and backup recovery failed: {}. Using empty state.", e);
                Ok(AgentCoordinationState::default())
            }
        }
    } else {
        Ok(AgentCoordinationState::default())
    }
}

fn validate_state(&self, state: &AgentCoordinationState) -> Result<()> {
    // Validate schema: check that all agents have required fields
    for (agent_id, agent) in &state.active_agents {
        if agent.agent_id.is_empty() {
            return Err(anyhow!("Invalid agent: empty agent_id"));
        }
        if agent.tier_id.is_empty() {
            return Err(anyhow!("Invalid agent {}: empty tier_id", agent_id));
        }
        // Check for reasonable timestamps (not in future, not too old)
        let now = Utc::now();
        if agent.started_at > now {
            return Err(anyhow!("Invalid agent {}: started_at in future", agent_id));
        }
        if agent.started_at < now - chrono::Duration::days(7) {
            // Agent running for 7+ days is likely stale
            tracing::warn!("Agent {} has been running for 7+ days — likely stale", agent_id);
        }
    }
    Ok(())
}
```

**Gap #30: Stale agent cleanup and crash recovery**

**Issue:** If an agent crashes or is killed without unregistering, it remains in `active-agents.json` indefinitely, causing false conflicts and stale coordination state.

**Mitigation:**
- **Heartbeat mechanism:** Agents update `last_update` timestamp periodically (every 30 seconds). Prune agents with `last_update` older than threshold (e.g., 5 minutes).
- **Process existence check:** When loading state, check if agent's process still exists (via PID if stored, or by checking worktree activity). Remove stale entries.
- **Automatic cleanup:** Before each coordination read/write, prune stale agents (no update in last 5 minutes).
- **Crash detection:** Detect agent crashes (process exit, worktree deletion) and automatically unregister.

```rust
async fn load_state(&self) -> Result<AgentCoordinationState> {
    // ... existing load logic ...

    // Prune stale agents
    let mut pruned = state.clone();
    let cutoff = Utc::now() - chrono::Duration::minutes(5); // 5 minute timeout
    let initial_count = pruned.active_agents.len();

    pruned.active_agents.retain(|agent_id, agent| {
        // Check if agent is stale
        if agent.last_update < cutoff {
            tracing::info!("Pruning stale agent: {} (last update: {} ago)",
                agent_id,
                Utc::now().signed_duration_since(agent.last_update));
            return false;
        }

        // Check if worktree still exists (if applicable)
        if let Some(ref worktree) = agent.worktree_path {
            if !worktree.exists() {
                tracing::info!("Pruning agent {}: worktree {} no longer exists", agent_id, worktree.display());
                return false;
            }
        }

        true
    });

    if pruned.active_agents.len() != initial_count {
        // Save pruned state
        self.save_state(&pruned).await?;
    }

    Ok(pruned)
}
```

**Gap #31: File operation extraction reliability**

**Issue:** Extracting file operations from agent output is unreliable. Agents may mention files they don't edit, or edit files they don't mention. Platform hooks may not fire for all file operations.

**Mitigation:**
- **Multi-source extraction:** Combine multiple sources: (1) agent output parsing (regex for file paths), (2) platform hooks (`PreToolUse`/`PostToolUse`), (3) provider stream/tool events from CLI output adapters, (4) git diff detection (compare worktree before/after).
- **Confidence scoring:** Assign confidence scores to file operations (high: platform hook detected, medium: agent mentioned, low: inferred from context). Only include high/medium confidence files in coordination state.
- **Validation:** After agent completes, validate claimed files against actual git diff. If mismatch, log warning and update coordination state.
- **Best-effort updates:** If file extraction fails, still register agent with empty `files_being_edited` list. Coordination context will still show agent is active, just without file details.

```rust
pub struct FileOperationExtractor;

impl FileOperationExtractor {
    /// Extract file operations from multiple sources
    pub async fn extract_files(
        &self,
        agent_output: &str,
        platform_hooks: Option<Vec<String>>, // Files detected by platform hooks
        git_diff: Option<Vec<PathBuf>>, // Files changed in git diff
    ) -> Vec<PathBuf> {
        let mut files = std::collections::HashSet::new();

        // Source 1: Platform hooks (highest confidence)
        if let Some(hook_files) = platform_hooks {
            for file in hook_files {
                files.insert(PathBuf::from(file));
            }
        }

        // Source 2: Git diff (high confidence)
        if let Some(diff_files) = git_diff {
            for file in diff_files {
                files.insert(file);
            }
        }

        // Source 3: Agent output parsing (medium confidence)
        let output_files = self.parse_files_from_output(agent_output);
        for file in output_files {
            files.insert(file);
        }

        files.into_iter().collect()
    }

    fn parse_files_from_output(&self, output: &str) -> Vec<PathBuf> {
        // Regex patterns for common file mentions
        let patterns = vec![
            r#"editing\s+([^\s]+\.(rs|ts|js|py|go|java))"#i,
            r#"modifying\s+([^\s]+\.(rs|ts|js|py|go|java))"#i,
            r#""([^"]+\.(rs|ts|js|py|go|java))""#,
            r#"'([^']+\.(rs|ts|js|py|go|java))'"#,
        ];

        let mut files = Vec::new();
        for pattern in patterns {
            let re = regex::Regex::new(pattern).unwrap();
            for cap in re.captures_iter(output) {
                if let Some(file_match) = cap.get(1) {
                    files.push(PathBuf::from(file_match.as_str()));
                }
            }
        }

        files
    }
}
```

**Gap #32: Coordination state size limits and performance**

**Issue:** If many agents run simultaneously (50+), `active-agents.json` becomes large, causing slow reads/writes and prompt token bloat. Coordination context injected into prompts may exceed token limits.

**Mitigation:**
- **Size limits:** Limit coordination state to max 100 active agents. If exceeded, prune oldest agents (by `started_at`).
- **Prompt context limits:** Limit coordination context to max 2000 tokens. If exceeded, summarize (e.g., "15 agents active, 8 editing files") or filter (only show agents editing files in current directory).
- **Lazy loading:** Only load coordination state when needed (before agent execution), not on every orchestrator tick.
- **Caching:** Cache coordination context for 5 seconds to avoid repeated file reads.
- **Filtering:** Allow filtering coordination context by tier, platform, or file path to reduce size.

```rust
pub async fn get_coordination_context(
    &self,
    filter: Option<CoordinationFilter>, // Filter by tier, platform, file path
) -> Result<String> {
    let state = self.load_state().await?;
    let mut context = String::new();

    // Apply filters
    let filtered_agents: Vec<_> = state.active_agents.values()
        .filter(|agent| {
            if let Some(ref filter) = filter {
                if let Some(ref tier_filter) = filter.tier_id {
                    if agent.tier_id != *tier_filter {
                        return false;
                    }
                }
                if let Some(ref platform_filter) = filter.platform {
                    if agent.platform != *platform_filter {
                        return false;
                    }
                }
                if let Some(ref file_filter) = filter.file_path {
                    if !agent.files_being_edited.iter().any(|f| f == file_filter) {
                        return false;
                    }
                }
            }
            true
        })
        .collect();

    // Limit to max agents
    let max_agents = 20; // Limit to prevent token bloat
    let agents_to_show: Vec<_> = filtered_agents.iter().take(max_agents).collect();

    if agents_to_show.is_empty() {
        return Ok(String::new());
    }

    // Build context (same as before but with limit)
    // ... existing context building logic ...

    // If context exceeds token limit, summarize
    let estimated_tokens = context.len() / 4; // Rough estimate
    if estimated_tokens > 2000 {
        context = self.summarize_coordination_context(&agents_to_show)?;
    }

    Ok(context)
}

pub struct CoordinationFilter {
    pub tier_id: Option<String>,
    pub platform: Option<Platform>,
    pub file_path: Option<PathBuf>,
}
```

**Gap #33: Conflict resolution and file locking**

**Issue:** If two agents want to edit the same file, coordination context warns them, but there's no automatic conflict resolution. Agents may ignore warnings or both proceed, causing merge conflicts.

**Mitigation:**
- **Conflict detection:** Before agent starts, check coordination state for file conflicts. If conflict detected, either (1) delay agent start, (2) select alternative files, or (3) escalate to orchestrator.
- **File-level locking:** Extend coordination state to include file locks (which agent has "locked" a file for editing). Agents must acquire lock before editing.
- **Lock timeout:** File locks expire after 30 minutes (agent should finish editing by then). Stale locks are automatically released.
- **Orchestrator intervention:** If conflict persists, orchestrator can serialize execution (run agents sequentially instead of parallel) or reassign files.

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileLock {
    pub file_path: PathBuf,
    pub locked_by: String, // agent_id
    pub locked_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

impl AgentCoordinator {
    /// Check for file conflicts before agent starts
    pub async fn check_file_conflicts(
        &self,
        agent_id: &str,
        files_to_edit: &[PathBuf],
    ) -> Result<Vec<FileConflict>> {
        let state = self.load_state().await?;
        let mut conflicts = Vec::new();

        for file in files_to_edit {
            // Check if any other agent is editing this file
            for (other_agent_id, other_agent) in &state.active_agents {
                if *other_agent_id != agent_id && other_agent.files_being_edited.contains(file) {
                    conflicts.push(FileConflict {
                        file: file.clone(),
                        conflicting_agent: other_agent_id.clone(),
                        conflicting_platform: other_agent.platform.clone(),
                    });
                }
            }
        }

        Ok(conflicts)
    }

    /// Acquire file lock (if available)
    pub async fn acquire_file_lock(
        &self,
        agent_id: &str,
        file: &Path,
        duration_minutes: u64,
    ) -> Result<bool> {
        let mut state = self.load_state().await?;

        // Check if file is already locked
        // (This would require extending AgentCoordinationState with file_locks field)
        // For now, check files_being_edited

        // If not locked, add to agent's files_being_edited
        if let Some(agent) = state.active_agents.get_mut(agent_id) {
            if !agent.files_being_edited.contains(file) {
                agent.files_being_edited.push(file.to_path_buf());
                agent.last_update = Utc::now();
                self.save_state(&state).await?;
                return Ok(true);
            }
        }

        Ok(false) // File already locked
    }
}

pub struct FileConflict {
    pub file: PathBuf,
    pub conflicting_agent: String,
    pub conflicting_platform: Platform,
}
```

**Gap #34: Path normalization and worktree handling**

**Issue:** Agents may report file paths in different formats (relative vs absolute, worktree paths vs main repo paths). Coordination state may not correctly match files across worktrees.

**Mitigation:**
- **Path normalization:** Normalize all paths to relative paths from project root before storing in coordination state.
- **Worktree path resolution:** Convert worktree paths to main repo paths (e.g., `.puppet-master/worktrees/A/src/api.rs` → `src/api.rs`).
- **Path comparison:** Use canonical paths for comparison (resolve symlinks, normalize separators).

```rust
impl AgentCoordinator {
    fn normalize_path(&self, path: &Path, project_root: &Path) -> PathBuf {
        // If path is absolute, make it relative to project root
        if path.is_absolute() {
            if let Ok(relative) = path.strip_prefix(project_root) {
                return relative.to_path_buf();
            }
        }

        // If path is in worktree, convert to main repo path
        if let Ok(stripped) = path.strip_prefix(".puppet-master/worktrees/") {
            // Extract worktree name and file path
            if let Some(components) = stripped.components().next() {
                // Remove worktree prefix, keep file path
                return stripped.strip_prefix(components).unwrap_or(stripped).to_path_buf();
            }
        }

        path.to_path_buf()
    }
}
```

**Gap #35: Coordination-event ingestion fallback**

**Issue:** If provider event ingestion fails (e.g. adapter parse errors, stream interruption), coordination updates can degrade, and there is no explicit fallback policy.

**Mitigation:**
- **Fallback detection:** Detect event-ingestion failures (parser error, stream timeout, malformed event). Automatically continue with baseline coordination projection updates.
- **Baseline-first coordination:** Keep canonical coordination projection as the primary path; event ingestion is an enrichment layer only.
- **Error handling:** Log ingestion failures but do not block execution. Continue with baseline coordination projection updates.

**Gap #36: Coordination metrics and monitoring**

**Issue:** No visibility into coordination effectiveness. Can't tell if coordination is preventing conflicts, how often agents wait, or if coordination state is accurate.

**Mitigation:**
- **Metrics:** Track coordination events (agent registered, conflicts detected, stale agents pruned, file locks acquired).
- **Logging:** Log coordination state changes (agent registered/unregistered, file conflicts detected, coordination context injected).
- **Monitoring:** Add coordination state to GUI (show active agents, file locks, conflicts).
- **Analytics:** Track coordination effectiveness (conflicts prevented, false positives, coordination accuracy).

### Improvements to Agent Coordination

**Improvement #1: Coordination state querying and filtering**

Add methods to query coordination state by platform, tier, file path, or agent ID:

```rust
impl AgentCoordinator {
    pub async fn get_agents_by_platform(&self, platform: Platform) -> Result<Vec<ActiveAgent>> {
        let state = self.load_state().await?;
        Ok(state.active_agents.values()
            .filter(|a| a.platform == platform)
            .cloned()
            .collect())
    }

    pub async fn get_agents_by_tier(&self, tier_id: &str) -> Result<Vec<ActiveAgent>> {
        let state = self.load_state().await?;
        Ok(state.active_agents.values()
            .filter(|a| a.tier_id == tier_id)
            .cloned()
            .collect())
    }

    pub async fn get_agents_editing_file(&self, file: &Path) -> Result<Vec<ActiveAgent>> {
        let state = self.load_state().await?;
        Ok(state.active_agents.values()
            .filter(|a| a.files_being_edited.contains(file))
            .cloned()
            .collect())
    }
}
```

**Improvement #2: Coordination state backup and recovery**

Automatically backup coordination state before each write, with retention policy:

```rust
impl AgentCoordinator {
    async fn save_state(&self, state: &AgentCoordinationState) -> Result<()> {
        // Backup current state
        if self.state_file.exists() {
            let backup_file = self.state_file.with_extension(format!("bak.{}", Utc::now().timestamp()));
            let _ = std::fs::copy(&self.state_file, &backup_file);

            // Cleanup old backups (keep last 10)
            self.cleanup_old_backups().await?;
        }

        // Save new state (with locking as above)
        self.save_state_with_lock(state).await
    }

    async fn cleanup_old_backups(&self) -> Result<()> {
        // Implementation: list backup files, sort by timestamp, keep last 10
        // ...
    }
}
```

**Improvement #3: Coordination state validation and schema versioning**

Add schema versioning to coordination state to handle format changes:

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentCoordinationState {
    pub schema_version: u32, // Current version: 1
    pub active_agents: HashMap<String, ActiveAgent>,
    pub last_updated: DateTime<Utc>,
}

impl AgentCoordinator {
    fn validate_schema_version(&self, state: &AgentCoordinationState) -> Result<()> {
        const CURRENT_SCHEMA_VERSION: u32 = 1;

        if state.schema_version != CURRENT_SCHEMA_VERSION {
            return Err(anyhow!(
                "Coordination state schema version mismatch: expected {}, got {}",
                CURRENT_SCHEMA_VERSION,
                state.schema_version
            ));
        }

        Ok(())
    }

    async fn migrate_schema(&self, old_state: AgentCoordinationState) -> Result<AgentCoordinationState> {
        // Migrate old schema versions to current
        // ...
    }
}
```

### Handling Concurrent Subagent Execution

When multiple subagents run in parallel:

1. **Worktree Isolation**: Each subtask has its own worktree, so subagents don't interfere
2. **Independent Selection**: Each subtask selects subagents independently based on its own context
3. **Resource Management**: Platform runners handle concurrent invocations
4. **Context Sharing**: Completed subtasks share results via dependency chain, not direct subagent communication
5. **Coordination**: Agents coordinate through shared state files and real-time coordination state (see "Agent Coordination and Communication" above)

**Example:**
```rust
// Parallel execution with different subagents
Level 0:
  - Subtask A (rust-engineer) → Worktree: .puppet-master/worktrees/A
  - Subtask B (react-specialist) → Worktree: .puppet-master/worktrees/B
  - Subtask C (python-pro) → Worktree: .puppet-master/worktrees/C

// All run concurrently, each with appropriate subagent
// Results merged back to main branch after completion
```

### Subagent Conflict Prevention

**Potential Conflicts:**
1. **File Conflicts**: Multiple subagents modifying same files
2. **Resource Conflicts**: Platform quota limits
3. **Context Conflicts**: Conflicting architectural decisions

**Mitigation Strategies:**

**Coordination-based prevention (primary):** Use agent coordination (see "Agent Coordination and Communication" above) to prevent conflicts:
- Agents register files they're editing in `active-agents.json`
- Before starting work, agents check coordination state for file conflicts
- If conflict detected, agent waits or selects alternative files
- Coordination context injected into prompts warns agents about active files

**Conflict detection (secondary):** Detect conflicts before execution:

```rust
// src/core/subagent_selector.rs (additions)

pub struct SubagentConflictDetector;

impl SubagentConflictDetector {
    /// Check for potential conflicts between parallel subagents using coordination state
    pub async fn detect_conflicts(
        &self,
        subagent_groups: &[Vec<String>],
        tier_contexts: &[TierContext],
        coordinator: &AgentCoordinator,
    ) -> Vec<Conflict> {
        let mut conflicts = Vec::new();
        let coordination_state = coordinator.load_state().await.ok();

        // Check for overlapping file modifications using coordination state
        for (i, context_a) in tier_contexts.iter().enumerate() {
            for (j, context_b) in tier_contexts.iter().enumerate().skip(i + 1) {
                if let Some(state) = &coordination_state {
                    // Check if any active agents are editing overlapping files
                    let files_a: Vec<_> = state.active_agents.values()
                        .filter(|a| a.tier_id == context_a.item_id)
                        .flat_map(|a| &a.files_being_edited)
                        .collect();
                    let files_b: Vec<_> = state.active_agents.values()
                        .filter(|a| a.tier_id == context_b.item_id)
                        .flat_map(|a| &a.files_being_edited)
                        .collect();

                    let overlapping: Vec<_> = files_a.iter()
                        .filter(|f| files_b.contains(f))
                        .collect();

                    if !overlapping.is_empty() {
                        conflicts.push(Conflict {
                            type_: ConflictType::FileOverlap,
                            subtask_a: i,
                            subtask_b: j,
                            files: overlapping.iter().map(|f| (*f).clone()).collect(),
                        });
                    }
                }
            }
        }

        // Check for architectural conflicts
        for (i, subagents_a) in subagent_groups.iter().enumerate() {
            for (j, subagents_b) in subagent_groups.iter().enumerate().skip(i + 1) {
                if self.has_architectural_conflict(subagents_a, subagents_b) {
                    conflicts.push(Conflict {
                        type_: ConflictType::Architectural,
                        subtask_a: i,
                        subtask_b: j,
                        files: Vec::new(),
                    });
                }
            }
        }

        conflicts
    }

    fn has_architectural_conflict(
        &self,
        subagents_a: &[String],
        subagents_b: &[String],
    ) -> bool {
        // Check if subagents might make conflicting decisions
        // e.g., architect-reviewer vs different language engineers
        subagents_a.contains(&"architect-reviewer".to_string()) &&
        subagents_b.contains(&"architect-reviewer".to_string())
    }
}

pub enum ConflictType {
    FileOverlap,
    Architectural,
    ResourceLimit,
}

pub struct Conflict {
    pub type_: ConflictType,
    pub subtask_a: usize,
    pub subtask_b: usize,
    pub files: Vec<String>,
}
```

### Parallel Execution Configuration

**Concurrency caps rationale:** Per-platform concurrency limits exist for two reasons:

1. **Provider rate limits:** Each platform (Cursor, Codex, Claude Code, Gemini, Copilot) enforces rate limits on concurrent requests. Exceeding them causes throttling, errors, or temporary bans.
2. **Dev-machine load:** Agent processes consume CPU, disk I/O, and memory on the machine hosting the project folder. Running too many concurrent processes degrades the user's development environment.

**Source of caps:** The canonical concurrency limits are defined in §Subagent Configuration `executionLimits` (this file). The plan graph defines only dependency structure (`depends_on`, plus blocking edges such as `blockers`/`unblocks` where applicable); max concurrent is an execution/config concern. See `Plans/Crosswalk.md` §3.7 for the ownership table.

**Crew limits vs agent limits:** These are separate concepts:
- **Per-platform agent cap:** limits individual concurrent agent/subagent processes per platform. This is what hits rate limits and machine load.
- **Crew cap** (`maxConcurrentCrewsPerPlatform`): limits concurrent crew groups per platform. A crew is a logical group of subagents working together.

Both limits apply: a crew spawn must not exceed either the crew cap or the per-platform agent cap. See §Subagent Configuration `executionLimits` for canonical values.

### Benefits of Parallel Subagent Execution

1. **Faster Execution**: Multiple specialized subagents work simultaneously
2. **Better Specialization**: Each subtask gets the right subagent for its domain
3. **Resource Efficiency**: Worktrees isolate changes, preventing conflicts
4. **Scalability**: Can handle complex projects with many parallel subtasks

### Example: Multi-Language Project

**Scenario:** Full-stack project with Rust backend and React frontend

**Phase 1: Setup**
- `project-manager` coordinates

**Task 1: Backend API**
- Subtask 1.1: Database schema (parallelizable)
  - `rust-engineer` + `database-administrator`
- Subtask 1.2: API endpoints (parallelizable)
  - `rust-engineer` + `api-designer`
- Subtask 1.3: Authentication (depends on 1.1, 1.2)
  - `rust-engineer` + `security-engineer`

**Task 2: Frontend UI**
- Subtask 2.1: Component library (parallelizable)
  - `react-specialist` + `frontend-developer`
- Subtask 2.2: API integration (depends on Task 1)
  - `react-specialist` + `frontend-developer`

**Execution Flow:**
```
Level 0 (Parallel):
  - 1.1: rust-engineer + database-administrator
  - 1.2: rust-engineer + api-designer
  - 2.1: react-specialist + frontend-developer

Level 1 (After Level 0):
  - 1.3: rust-engineer + security-engineer (inherits context from 1.1, 1.2)

Level 2 (After Task 1):
  - 2.2: react-specialist + frontend-developer (inherits API context from Task 1)
```

### Implementation Considerations

1. **Subagent Selection Timing**: Select subagents **before** building dependency groups, so each subtask knows its subagents
2. **Context Caching**: Cache project context detection to avoid repeated filesystem scans
3. **Worktree Management**: Ensure worktrees are created before subagent execution
4. **Result Aggregation**: Merge subagent outputs correctly when dependencies complete
5. **Error Handling**: If one parallel subtask fails, handle gracefully based on `continue_on_failure` config

### Updated Orchestrator Flow

```rust
// High-level flow with subagents and parallel execution

1. Detect project context (language, framework, domain) - CACHED
2. For each tier level:
   a. Build dependency graph
   b. Get parallelizable groups
   c. For each group:
      - Select subagents for each subtask (independent)
      - Create worktrees
      - Execute subtasks in parallel with their subagents
      - Merge results
      - Cleanup worktrees
3. Advance to next dependency level
```


## Platform-Specific Capabilities & Extensions
### Platform capability overview

Platform capability handling is provider-first and uses three execution classes:
- direct providers
- CLI-bridged providers
- server-bridged providers

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Prompt_Pipeline.md

### Capability surface by platform

**Cursor CLI**
- `cursor-agent` is the execution runtime.
- PM-managed account roots and PM-derived MCP/instruction projections define the CLI boundary.

**Claude Code CLI**
- CLI-backed execution with subscriber, console/API, and SSO setup families.
- PM-native skill and MCP handling remains canonical.

**Gemini direct**
- direct API-key provider.
- runtime invocation is not a CLI subprocess.

**Gemini CLI**
- separate CLI-backed provider entry.
- may expose routing behavior that differs from the originally requested model.

**Codex**
- direct provider with `ChatGPT` and `API key` account rows.
- no Codex CLI runtime requirement in this plan.

**GitHub Copilot**
- direct provider with billing/entity semantics beneath the auth-backed account row.
- no Copilot CLI runtime requirement in this plan.

**OpenCode**
- server-bridged provider via managed or attached server profiles.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md
## Leveraging Platform Capabilities for Subagent Integration

### Strategy 1: Platform-Specific Subagent Packages

Create platform-native packages (skills/plugins/extensions/agent files) that define subagent context and lifecycle hooks. Installation and discovery must route through `platform_specs` and provider-aware helpers.

### Strategy 2: Hook-Based Lifecycle Management

Use platform hooks to enrich lifecycle events (context injection, validation, quality checks) while keeping orchestrator policy and verification gates as the enforcement authority.

### Strategy 3: MCP Server Integration

Use MCP for tool exposure and interoperability where supported. Tool permissions, evidence, and run policy remain centralized in orchestrator/runtime.

### Strategy 4: CLI Invocation as Execution Truth

All subagent work executes through provider CLI commands. Determinism comes from explicit args/env plus normalized event parsing from CLI output.

## Updated Implementation Architecture

### Platform Capability Manager

```rust
// src/core/platform_capability_manager.rs

pub struct PlatformCapabilityManager {
    cursor_skills: Vec<SkillInfo>,
    claude_plugins: Vec<PluginInfo>,
    gemini_extensions: Vec<ExtensionInfo>,
    codex_mcp_available: bool,
    copilot_skills_available: bool,
}

impl PlatformCapabilityManager {
    // DRY:FN:discover_capabilities — Discover platform-specific capabilities using platform_specs
    pub fn discover_capabilities(&self, platform: Platform) -> Result<Capabilities> {
        platform_specs::discover_platform_capabilities(platform)
    }
}
```

Capability snapshot rules:
- Capability evaluation happens at run start and produces a frozen snapshot for the run/tier.
- Precedence is: live runtime discovery -> provider policy snapshot -> static model/platform baseline.
- `platform.capability_evaluated` is the canonical persistence event for that snapshot and any gated features.
- This manager complements provider `capabilities.get`; it does not replace the provider-facing capability API.

### Enhanced Subagent Invoker

```rust
// src/core/subagent_invoker.rs (enhanced)

impl SubagentInvoker {
    // DRY:FN:invoke_with_capabilities — Invoke subagent using platform-specific capabilities
    pub async fn invoke_with_capabilities(
        &self,
        platform: Platform,
        subagent_name: &str,
        task: &str,
        capabilities: &PlatformCapabilities,
    ) -> Result<String> {
        if !subagent_registry::is_valid_subagent_name(subagent_name) {
            return Err(anyhow!("Invalid subagent name: {}", subagent_name));
        }

        let invocation_method =
            platform_specs::get_subagent_invocation_method(platform, capabilities)?;

        match invocation_method {
            InvocationMethod::Mcp => self.invoke_via_mcp(platform, subagent_name, task).await,
            InvocationMethod::Cli => self.invoke_via_cli(platform, subagent_name, task).await,
        }
    }
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

## Benefits of Platform Capabilities

1. **Rich Context:** Hooks and skills inject domain context into subagents.
2. **Validation:** Hook + orchestrator checks can reject unsafe actions.
3. **Quality Gates:** Lifecycle hooks and gates enforce completion quality.
4. **Deterministic Runtime:** Provider execution is explicit and replayable (transport-aware: CLI-bridged, direct-provider, or server-bridged per ProviderTransport taxonomy).
5. **Packaging:** Plugins/extensions keep subagent assets reusable.
6. **Tool Integration:** MCP extends tool access without changing orchestrator core.

## Implementation Considerations

1. **Platform Detection:** Detect available capabilities per provider CLI/runtime.
2. **Capability Caching:** Cache detection results to reduce startup overhead.
3. **Version Compatibility:** Guard capability use by known version constraints.
4. **Configuration Management:** Keep platform-specific config paths explicit.
5. **Error Handling:** Capability misses degrade gracefully to base CLI flow.
6. **Documentation:** Keep capability docs aligned with provider contracts.

## Next Steps

1. **Track release notes:** Keep `platform_specs` and runner flags current.
2. **Expand capability detection:** Add structured detection for hooks/skills/MCP support.
3. **Package templates:** Provide reusable platform package templates.
4. **Hook coverage:** Add hook-driven evidence points where useful.
5. **Integration tests:** Verify capability-driven invocation remains deterministic.

## Autonomous QA Loop Pattern Integration

### Overview

The [autonomous QA loop pattern](https://gist.github.com/gsemet/1ef024fc426cfc75f946302033a69812) provides a proven orchestrator pattern for autonomous task execution with quality gates. While designed for VS Code Copilot, its concepts can enhance our orchestrator subagent integration.

### Key Concepts from Autonomous QA Loop

1. **Orchestrator/Subagent Separation**: Orchestrator manages loop, subagents implement tasks
2. **Three-Tier QA System**: Preflight → Task Inspector → Phase Inspector
3. **Progress Tracking**: Visual status symbols (⬜ 🔄 ✅ 🔴) with detailed tracking
4. **Task Prioritization**: Incomplete tasks (🔴) prioritized over new tasks
5. **Phase-Aware Execution**: Only work on current phase, don't jump ahead
6. **Pause Mechanism**: `PAUSE.md` file to safely halt execution
7. **Commit Strategy**: Amend commits for rework, conventional commits for new work

### Integration Opportunities

#### 1. Enhanced Progress Tracking

**Current State**: Orchestrator tracks tier state in state machines
**Enhancement**: Add visual progress tracking similar to an autonomous QA loop

```rust
// src/core/progress_tracker.rs (new)

pub struct TaskProgress {
    pub task_id: String,
    pub status: TaskStatus,
    pub phase: String,
    pub inspector_notes: Option<String>,
    pub last_inspector_feedback: Option<String>,
}

pub enum TaskStatus {
    NotStarted,      // ⬜
    InProgress,      // 🔄
    Completed,       // ✅ (verified by inspector)
    Incomplete,      // 🔴 (requires rework)
    Skipped,         // ⏸️
}

pub struct ProgressTracker {
    tasks: Vec<TaskProgress>,
    current_phase: String,
}

impl ProgressTracker {
    /// Prioritize incomplete tasks
    pub fn get_next_task(&self) -> Option<&TaskProgress> {
        // First: incomplete tasks in current phase
        self.tasks.iter()
            .filter(|t| t.phase == self.current_phase)
            .find(|t| matches!(t.status, TaskStatus::Incomplete))
            // Then: not started tasks in current phase
            .or_else(|| {
                self.tasks.iter()
                    .filter(|t| t.phase == self.current_phase)
                    .find(|t| matches!(t.status, TaskStatus::NotStarted))
            })
    }
}
```

#### 2. Three-Tier QA System

**Current State**: Orchestrator has verification gates between tiers
**Enhancement**: Add per-task and per-phase inspection

```rust
// src/core/qa_system.rs (new)

pub struct QASystem {
    preflight_runner: PreflightRunner,
    task_inspector: TaskInspector,
    phase_inspector: PhaseInspector,
}

impl QASystem {
    /// Tier 1: Preflight checks (run by subagent before marking complete)
    pub async fn run_preflight(&self, tier_id: &str) -> Result<PreflightResult> {
        // Existing preflight logic
    }

    /// Tier 2: Task Inspector (run after each task completion)
    pub async fn inspect_task(
        &self,
        task_id: &str,
        task_file: &Path,
        commit_hash: &str,
    ) -> TaskInspectionResult {
        // Review commit changes
        // Verify acceptance criteria met
        // Check test coverage
        // Return: Complete or Incomplete with feedback
    }

    /// Tier 3: Phase Inspector (run when phase completes)
    pub async fn inspect_phase(
        &self,
        phase_name: &str,
        phase_tasks: &[String],
    ) -> PhaseInspectionResult {
        // Review all phase commits
        // Verify phase-level acceptance criteria
        // Check integration between tasks
        // Generate validation report
    }
}
```

#### 3. Task Inspector Integration

**Enhancement**: Add automatic task inspection after subagent completion

```rust
// src/core/orchestrator.rs (modifications)

impl Orchestrator {
    async fn execute_tier_with_subagents(
        &self,
        tier_node: &TierNode,
        context: &OrchestratorContext,
    ) -> Result<()> {
        // ... existing subagent selection and execution ...

        // Execute subagent
        let result = self.execute_with_subagent(...).await?;

        // Tier 2: Task Inspector (automatic after completion)
        if tier_node.tier_type == TierType::Subtask {
            let inspection = self.qa_system.inspect_task(
                &tier_node.id,
                &task_file_path,
                &latest_commit_hash,
            ).await?;

            match inspection.status {
                InspectionStatus::Complete => {
                    // Mark as ✅ Completed
                    self.progress_tracker.mark_completed(&tier_node.id).await?;
                }
                InspectionStatus::Incomplete { feedback } => {
                    // Mark as 🔴 Incomplete with feedback
                    self.progress_tracker.mark_incomplete(
                        &tier_node.id,
                        feedback,
                    ).await?;

                    // Prepend feedback to task file for next iteration
                    self.prepend_task_feedback(&tier_node.id, feedback).await?;
                }
            }
        }

        Ok(())
    }
}
```

#### 4. Phase Inspector

**Enhancement**: Add phase-level validation

```rust
// src/core/orchestrator.rs (additions)

impl Orchestrator {
    async fn check_phase_completion(&self, phase_id: &str) -> Result<()> {
        let all_tasks_complete = self.progress_tracker
            .phase_tasks_complete(phase_id)?;

        if all_tasks_complete {
            // Tier 3: Phase Inspector
            let phase_report = self.qa_system.inspect_phase(
                phase_id,
                &self.progress_tracker.get_phase_tasks(phase_id)?,
            ).await?;

            // Advance to next phase
            self.progress_tracker.advance_phase().await?;
        }

        Ok(())
    }
}
```

#### 5. Pause Mechanism

**Enhancement**: Add `PAUSE.md` file check before each iteration

```rust
// src/core/orchestrator.rs (additions)

impl Orchestrator {
    async fn check_pause_gate(&self) -> Result<bool> {
        let pause_file = self.config.paths.workspace
            .join(".puppet-master")
            .join("PAUSE.md");

        if pause_file.exists() {
            log::info!("Pause gate active - orchestrator halted");
            // Emit event for GUI
            return Ok(true);
        }

        Ok(false)
    }

    async fn run_loop(&self) -> Result<()> {
        loop {
            // Check pause gate first
            if self.check_pause_gate().await? {
                return Ok(()); // Exit loop, wait for resume
            }

            // ... rest of loop ...
        }
    }
}
```

#### 6. Commit Strategy for Rework

**Enhancement**: Amend commits for incomplete task rework

```rust
// src/core/orchestrator.rs (modifications)

impl Orchestrator {
    async fn commit_tier_progress(
        &self,
        tier_id: &str,
        tier_type: TierType,
        iteration: u32,
        is_rework: bool,
    ) -> Result<()> {
        let message = if is_rework {
            // For rework, amend previous commit
            format!("tier: {} iteration {} (after review)", tier_id, iteration)
        } else {
            format!("tier: {} iteration {} complete", tier_id, iteration)
        };

        if is_rework {
            // Amend previous commit
            self.git_manager.commit_amend(&message).await?;
        } else {
            // New commit
            self.git_manager.commit(&message).await?;
        }

        Ok(())
    }
}
```

### Updated Orchestrator Loop

```rust
// Enhanced orchestrator loop with autonomous QA loop patterns

async fn run_enhanced_loop(&self) -> Result<()> {
    loop {
        // Step 0: Check pause gate
        if self.check_pause_gate().await? {
            return Ok(()); // Paused
        }

        // Step 1: Read progress
        let progress = self.progress_tracker.read().await?;

        // Step 2: Get next task (prioritize incomplete)
        let next_task = match progress.get_next_task() {
            Some(task) => task,
            None => {
                // All tasks complete
                break;
            }
        };

        // Step 3: Execute with subagent
        // DRY REQUIREMENT: Subagent selection MUST use subagent_selector which uses subagent_registry
        let subagents = self.subagent_selector.select_for_tier(
            next_task.tier_type,
            &tier_context,
        );
        // DRY: Validate selected subagent names using subagent_registry::is_valid_subagent_name()

        // DRY REQUIREMENT: execute_with_subagents MUST use platform_specs for platform-specific invocation
        ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Executor_Protocol.md
        let result = self.execute_with_subagents(
            &next_task.tier_node,
            &subagents,
        ).await?;

        // Step 4: Run preflight (Tier 1 QA)
        let preflight_result = self.qa_system.run_preflight(&next_task.id).await?;
        if !preflight_result.passed {
            self.progress_tracker.mark_incomplete(
                &next_task.id,
                format!("Preflight failed: {}", preflight_result.errors.join(", ")),
            ).await?;
            continue;
        }

        // Step 5: Task Inspector (Tier 2 QA)
        let inspection = self.qa_system.inspect_task(
            &next_task.id,
            &next_task.file_path,
            &result.commit_hash,
        ).await?;

        match inspection.status {
            InspectionStatus::Complete => {
                self.progress_tracker.mark_completed(&next_task.id).await?;
            }
            InspectionStatus::Incomplete { feedback } => {
                self.progress_tracker.mark_incomplete(
                    &next_task.id,
                    feedback.clone(),
                ).await?;
                self.prepend_task_feedback(&next_task.id, feedback).await?;
                continue; // Re-loop to fix incomplete task
            }
        }

        // Step 6: Check phase completion
        if self.progress_tracker.phase_complete(&next_task.phase)? {
            // Tier 3: Phase Inspector
            let phase_report = self.qa_system.inspect_phase(
                &next_task.phase,
                &self.progress_tracker.get_phase_tasks(&next_task.phase)?,
            ).await?;

            // Advance to next phase
            self.progress_tracker.advance_phase().await?;
        }
    }

    Ok(())
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

### Benefits of Autonomous QA Loop Integration

1. **Better Quality Assurance**: Three-tier QA catches issues at multiple levels
2. **Clear Progress Visibility**: Visual status symbols make progress obvious
3. **Rework Prioritization**: Incomplete tasks are fixed before new work
4. **Safe Pausing**: PAUSE.md allows safe editing of tasks/progress
5. **Better Commit History**: Amended commits for rework keep history clean
6. **Phase Discipline**: Prevents jumping ahead to next phase prematurely

### Autonomous QA loop implementation considerations

1. **Progress File Format**: Use Markdown with status symbols for readability
2. **Inspector Feedback**: Prepend feedback to task files so subagents see it first
3. **Pause File Location**: `.puppet-master/PAUSE.md` for easy access
4. **Commit Amending**: Track which commits are reworks vs new work
5. **Inspector Subagents**: Could use specialized subagents for inspection (code-reviewer, qa-expert)

### Updated Configuration

```yaml
# .puppet-master/config.yaml (additions)

orchestrator:
  # Autonomous QA loop enhancements
  enableAutonomousQaLoopPatterns: true

  # Three-tier QA system
  qaSystem:
    enablePreflight: true
    enableTaskInspector: true
    enablePhaseInspector: true

  # Progress tracking
  progressTracking:
    useVisualStatus: true  # ⬜ 🔄 ✅ 🔴
    trackInspectorFeedback: true
    prependFeedbackToTasks: true

  # Commit strategy
  commits:
    amendForRework: true
    conventionalFormat: true
```

## Change Summary

- 2026-02-26: Added capability introspection and media-generation gating requirement: Orchestrator MUST call `capabilities.get` before dispatching `media.generate`; gates execution on real-time capability state. SSOT: `Plans/Media_Generation_and_Capabilities.md`. ContractRef: ToolID:capabilities.get, ToolID:media.generate, ContractName:Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM
- 2026-02-24: Updated **plan graph consumption (user projects)** so Puppet Master orchestrator consumes **SHARDED-ONLY** plan graphs and executes headless from `.puppet-master/project/plan_graph/index.json` + `.puppet-master/project/plan_graph/nodes/<node_id>.json`.
- 2026-02-24: Locked decision: no canonical `.puppet-master/project/plan_graph.json`; monolithic derived export (if materialized) lives at `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json`; the sharded representation is the sole canonical choice.
- 2026-02-24: Made required user-project artifacts explicit under `.puppet-master/project/` (requirements.md, contracts/, plan.md, plan_graph shards, acceptance_manifest.json, auto_decisions.jsonl) and reaffirmed canonical persistence in seglog.
- 2026-02-24: Added sharding/consumption rules (deterministic `node_id`, minimum required fields for `index.json` and node shards, and `edges.json` consistency validation).
## Persona and Effective Runtime Resolution Addendum (2026-03-06)

This addendum updates the orchestrator plan so tier execution uses the Persona system as the first-class runtime role contract.

### Canonical tier reminder

The orchestrator tier model remains:
- Phase
- Task
- Subtask
- Iteration

Resolved reminder: **Iteration** remains the lowest tier. Persona switching should not introduce new tiers.

### Tier-specific Persona defaults
### Orchestrator Persona config contract

Orchestrator MUST persist one canonical Persona-resolution config object separate from delegated-subagent registry data.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Personas.md

Minimum fields:
- `mode` (`manual | auto | hybrid`)
- `tier_personas`
  - `phase`
  - `task`
  - `subtask`
  - `iteration`
- `operation_frame_personas`
  - `planning`
  - `execution`
  - `review`
  - `verification`
- optional per-tier platform/model overrides
- optional next-run explicit override
  - `requested_persona`
  - optional `requested_platform`
  - optional `requested_model`
  - `expires_after_run_start` (bool)

Rules:
- `tier_personas` expresses the default Persona per tier when no higher-precedence override wins.
- `operation_frame_personas` refines same-tier switching without creating new tiers.
- All configured Persona IDs MUST validate against `persona_registry`, not only `subagent_registry`.
  ContractRef: ContractName:Plans/Personas.md
- Delegated child-run validation still uses `subagent_registry`; surface-level runtime selection uses `persona_registry`.

The orchestrator must support Persona defaults and/or auto Persona resolution per tier.

Examples:
- **Phase:** strategic/planning Personas such as `project-manager`, `architect-reviewer`, `collaborator`
- **Task:** domain/language Personas such as `rust-engineer`, `frontend-developer`, `backend-developer`, `devops-engineer`
- **Subtask:** reviewer/writer/specialist Personas such as `code-reviewer`, `technical-writer`, `security-engineer`
- **Iteration:** execution/debugging/verification Personas such as `rust-engineer`, `frontend-developer`, `debugger`, `qa-expert`

### Planning vs execution Persona switching

The orchestrator may switch Persona within the same tier depending on the current mental frame, without changing tier structure.

Examples:
- planning/discussion inside a task -> `collaborator` or planning Persona
- execution inside the same task -> implementation Persona such as `rust-engineer`
- review/verification after execution -> reviewer Persona such as `code-reviewer` or `qa-expert`

### Requested vs effective runtime state for every tier run

Each orchestrator tier run must record:
- requested Persona,
- effective Persona,
- selection source,
- selection reason,
- requested/effective platform/model/variant,
- applied Persona controls,
- skipped Persona controls.

This must be available to event stream consumers and UI surfaces.

### Auto Persona resolution in orchestrator

When not manually set, orchestrator should auto-resolve Persona based on:
- tier level,
- task type,
- repo language/framework,
- current operation type (planning vs execution vs review),
- PRD/plan recommendations,
- config overrides.

Examples:
- Rust code execution in iteration -> `rust-engineer`
- planning mode at a tier boundary -> `collaborator`
- repo discovery before edits -> `explorer`
- production-readiness validation -> `sre`

### Registry normalization

Legacy references to `explore` are stale and must be normalized to `explorer` in the canonical registry and all derived selection logic.

### Provider-native seed sources are not canonical

Any earlier language implying `.claude/agents` or similar directories are the source of truth is superseded by `Plans/Personas.md`.

Canonical rule:
- provider-native directories are seed/import sources only,
- Puppet Master Persona storage is the sole canonical source after import.

### Acceptance criteria addendum

- Orchestrator must support Persona defaults/auto selection per tier.
- Iteration remains the lowest tier; Persona switching must not add tiers.
- Every tier run must emit effective Persona/model/platform state and selection reason.
- Registry and plan language must standardize on `explorer`, not `explore`.

## Runtime Scheduler, Parallelism, and Remediation Addendum (2026-03-08)

### 1. Orchestrator scheduling model

The orchestrator MUST align with the executor's scored ready-set model.
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

Required runtime behavior:
- maintain a global ready set across runnable graph nodes
- select work using the canonical score tuple
- dispatch up to available capacity each scheduler wake cycle
- continue unrelated runnable work when some nodes are blocked on approval, clarification, auth, or other explicit blocked states
- emit queue-analysis observability for every scheduling decision

### 2. Parallel execution contract

Parallelism is not just topological ordering. It is a combination of:
- canonical DAG readiness
- available capacity
- worktree/runtime isolation
- blocked/backoff states
- remediation lane handling

Required rule:
- if multiple nodes are ready and capacity permits, the orchestrator may dispatch more than one node in the same wake cycle using the global score order

### 3. Worktree-native conflict control

The orchestrator MUST keep worktree-native isolation rather than adopt file-lease orchestration.
ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/storage-plan.md

Required additions:
- record declared touch sets when available
- expose merge/conflict risk as scheduler observability
- classify merge-risk-driven non-dispatch as `blocked` or `capacity_deferred`, not as opaque absence
- use backoff/yield policies when a parallel attempt cannot safely proceed yet

This packet does not introduce a file-lease system.

### 4. Wakeup and cascade semantics

The orchestrator is the primary consumer of event-driven wakeups.

Required wake causes:
- node finished
- verifier finished
- HITL resolved
- clarification resolved
- remediation finished
- backoff expired
- capacity changed
- restore/recovery finished
- replan patch applied

Required cascade rule:
- direct dependents of newly completed nodes are reevaluated immediately
- newly ready nodes are eligible in the same wake cycle

### 5. Runtime fields surfaced by orchestrator

Each tier/node runtime projection MUST be able to surface at least:
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md
- `attempt_count`
- `retry_count`
- `failure_class`
- `blocked_reason_code`
- `wake_reason`
- `scheduler_lane`
- `scheduler_score_breakdown`
- `ready_since_utc`
- `selected_at_utc`
- `backoff_until_utc`
- `safe_point_id`
- `remediation_root_id`
- `remediation_parent_attempt_id`
- `replan_generation`

### 6. Remediation and self-healing flow

Canonical remediation flow:
1. node attempt runs
2. verification/review produces structured findings or failure class
3. orchestrator classifies outcome
4. if class requires remediation, spawn remediation child lineage
5. remediation child runs against the same canonical context plus finding set
6. on remediation success, parent node retries according to policy and safe-point rules
7. if retry ceiling or remediation ceiling is exceeded, pause/escalate with exact recovery options

Remediation lineage is required for:
- verifier-driven fixes
- reviewer-driven critical/major fixes
- forced-remediation audit outcomes

### 7. Retry/backoff matrix (orchestrator consumer contract)

The orchestrator MUST implement the shared classifier behavior below and MUST preserve the classifier family emitted by the executor rather than coercing blocked reasons into `failure_class`.
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Run_Modes.md

| classifier family | classifier | auto retry | backoff | safe-point rollback | remediation child | terminal / escalation |
|---|---|---|---|---|---|---|
| `failure_class` | `provider_transient` | yes | `1s, 2s, 4s` | no | no | fail after 3 attempts |
| `failure_class` | `structured_output_invalid` | one format retry | none | no | optional after failed retry | escalate to remediation or `needs_review` |
| `failure_class` | `verification_failed` | no direct blind retry | none | yes | yes | pause after remediation ceiling |
| `failure_class` | `reviewer_findings` | no direct blind retry | none | yes | yes | pause after remediation ceiling |
| `blocked_reason_code` | `permission_denied` | no | none | no | no | blocked with exact recovery CTA |
| `blocked_reason_code` | `user_declined` | no | none | no | no | blocked with exact recovery CTA |
| `blocked_reason_code` | `headless_ask_denied` | no | none | no | no | blocked or denied outcome |
| `blocked_reason_code` | `filesafe_blocked` | no | none | no | no | blocked with approve-once / allowlist CTA when allowed |
| `blocked_reason_code` | `external_side_effect_blocked` | no | none | no | no | blocked; preserve local work |
| `failure_class` | `auth_expired` | refresh once, then no | immediate after refresh | no | no | block pending re-auth if refresh cannot recover |
| `failure_class` | `storage_io` | no | none | no | no | hard fail |
| `failure_class` | `graph_integrity` | no | none | no | no | hard fail |
| `blocked_reason_code` | `replan_required` | no | none | no | no | blocked until patch applied |

### 8. Decomposition degradation boundary

Orchestrator behavior MUST distinguish:
ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Progression_Gates.md
- draft planning/decomposition before canonical graph lock
- canonical orchestrator execution after graph lock

Required rule:
- orchestrator may consume a degraded flat draft plan only if the degradation was recorded before canonical graph lock
- once the sharded graph is canonical, invalid graph structure is an integrity failure, not a fallback case
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/chain-wizard-flexibility.md

### 9. Event-driven GUI alignment

Any remaining orchestrator text implying steady-state polling for queue/message correctness must be updated to event-driven projection updates.

Polling may remain only for debug/watchdog or non-authoritative background refresh use cases.

### 10. Acceptance criteria

- Orchestrator and executor use the same scored ready-set model.
- Parallel work continues while unrelated nodes are blocked.
- Remediation child lineage is explicit.
- Retry behavior follows the shared failure-class matrix.
- Worktree-native isolation remains the basis for parallel safety.
- Queue and remediation UI update from event/projection streams rather than polling loops.
## Runtime Scheduler Consumer / Subagent Reconciliation Addendum (2026-03-09)

The orchestrator is the primary consumer of the runtime scheduler contract and MUST treat queue analysis, attempt identity, remediation lineage, and blocked outcomes as first-class orchestration inputs.
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Graph_View.md

### Required orchestration fields per runnable unit
Every runnable orchestration unit MUST retain and propagate:
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Graph_View.md
- `run_id`
- `thread_id`
- `node_id`
- `attempt_id`
- `replan_generation`
- `scheduler_lane`
- `manual_priority`
- `transitive_unblock_count`
- `ready_since_utc`
- effective concurrency lane / capacity pool
- permission / model snapshot identifiers

### Parent-child lineage rules
Subagents and remediation children are not free-floating tasks. The orchestrator MUST preserve parent-child lineage across spawn, result ingestion, verification, and retry. A remediation child inherits correlation to the failed parent attempt but receives its own `attempt_id`.
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Project_Output_Artifacts.md

### Blocked outcome handling
When a unit is blocked by auth, FileSafe, permission policy, or external side-effect approval, the orchestrator MUST:
- preserve completed local work
- mark the unit blocked rather than failed
- store the exact `blocked_reason_code`
- surface only the recovery actions allowed for that reason
- avoid hidden retries or hidden fallback paths
ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md

### Wake-consumer behavior
Orchestrator projections MUST update immediately on runtime wakeups so newly-unblocked work can be reconsidered in the same event cycle. It MUST NOT wait for a periodic sweep to discover runnable work.
ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Executor_Protocol.md

### Draft decomposition fallback boundary
Interview/planning-stage decomposition fallback may flatten only before graph lock. After graph lock, the orchestrator MUST treat invalid graph structure as integrity failure rather than silently continuing with a degraded execution plan.
ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Executor_Protocol.md
## Orchestrator Runtime Consumer and Remediation Execution Reconciliation Addendum (2026-03-09)

The orchestrator is the primary consumer of the canonical runtime scheduler contract.

### Runtime consumption rules
- consume canonical event names and identities from `Plans/Contracts_V0.md`
- reevaluate directly affected runnable units in the same wake cycle after `node.prerequisite_resolved`
- treat shortage of slots as `non_selected_reason = capacity_deferred`, not as a blocked outcome
- preserve completed local work for blocked outcomes and surface only the canonical `allowed_action_ids[]`
- do not hide retries, fallback loops, or provider-local resubmission inside orchestrator code paths

### Remediation execution model
Remediation work is a runnable child attempt.

Required rules:
- child remediation attempts receive their own `attempt_id`
- child remediation attempts inherit correlation to the parent attempt through `remediation_root_id`, `parent_attempt_id`, and `remediation_generation`
- remediation children are visible to queue analysis, run graph, orchestrator lists, and artifact navigation even when they are not canonical graph nodes
- the parent node is not dispatchable while remediation child execution is active
- if remediation requires a scope-changing replan, the runtime creates new canonical graph work only after the replan is accepted/applied

### Same-cycle scheduling
Newly unblocked canonical nodes and remediation children that become runnable in a wake cycle MUST be considered before that wake cycle ends. Orchestrator projections MUST update from committed runtime events/projections rather than timer polling.
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md

## Runtime Enum and Counter Alignment Addendum

The orchestrator is a consumer of canonical runtime contracts and MUST NOT redefine them locally.

Required rules:
- use `failure_class` only for classified attempt outcomes
- use `blocked_reason_code` only for unresolved prerequisites or intentionally prevented work
- preserve ordered `allowed_action_ids[]` exactly as emitted by runtime contracts
- treat slot shortage as `capacity_deferred`, not blocked
- create a new `attempt_id` for every retry, prerequisite resume, remediation rerun, or safe-point-restored rerun
- respect the independent counter-family model; `retry_count` is display-only

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Executor_Protocol.md
