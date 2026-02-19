# Orchestrator Subagent Integration — Implementation Plan

## Plan Document Status

**This is a PLAN DOCUMENT ONLY** — No code changes have been made. This document contains:
- Dynamic subagent selection strategy for each tier level
- Language/technology detection and matching
- Implementation architecture
- Code changes required
- Configuration options

## Executive Summary

This plan integrates Cursor subagent personas into the orchestrator at each tier level (Phase → Task → Subtask → Iteration) to provide specialized expertise dynamically based on project context. Subagent selection adapts to project language, domain, task type, and current needs.

## Relationship Between the Two Plans

The project uses **two plan documents** that divide scope by execution context:

| Plan | Scope | Tier levels |
|------|--------|-------------|
| **orchestrator-subagent-integration.md** (this document) | Main run loop: PRD-driven execution of Phase → Task → Subtask → Iteration. Subagent selection, plan mode, config wiring, and start/end verification for the **orchestrator** run. | Phase, Task, Subtask, Iteration |
| **interview-subagent-integration.md** | Interview flow: multi-phase interview (Scope & Goals, Architecture, UX, Data, Security, Deployment, Performance, Testing). Subagent persona assignments **per interview phase**, prompt integration, research/validation, document generation. | Interview phases (1–8 and cross-phase) |

**Overlap and consistency:** Both plans reference subagent names, platform invocation, and config (e.g. tier config, plan mode). The **orchestrator** plan is the single source of truth for: tier-level subagent strategy, config-wiring validation at Phase/Task/Subtask/Iteration, and start/end verification (wiring + quality). The **interview** plan is the source of truth for: interview-phase subagent assignments, interview-specific config (e.g. `InterviewOrchestratorConfig`), and interview testing. When implementing, resolve any conflict by tier/context: orchestrator run vs interview run.

## Tier-Level Subagent Strategy

### Phase Level (Strategic Planning)

**Primary Subagents:**
- `project-manager`: Overall project coordination, timeline, resource management
- `architect-reviewer`: System design validation, architectural decisions
- `product-manager`: Product strategy, requirements prioritization

**Selection Logic:**
- Default: `project-manager` for coordination
- If architecture decisions needed: `architect-reviewer`
- If product/feature planning: `product-manager`
- Can use multiple subagents in parallel for complex phases

**Use Cases:**
- Phase planning and breakdown
- Dependency analysis
- Risk assessment
- Resource allocation
- Architecture validation

### Task Level (Domain-Specific Work)

**Dynamic Selection Based On:**

1. **Project Language Detection:**
   - `rust-engineer` → Rust projects (Cargo.toml detected)
   - `python-pro` → Python projects (requirements.txt, pyproject.toml)
   - `javascript-pro` → JavaScript/Node.js (package.json)
   - `typescript-pro` → TypeScript (tsconfig.json)
   - `swift-expert` → Swift projects (Package.swift, .xcodeproj)
   - `java-architect` → Java projects (pom.xml, build.gradle)
   - `csharp-developer` → C# projects (.csproj, .sln)
   - `php-pro` → PHP projects (composer.json)
   - `golang-pro` → Go projects (go.mod)

2. **Task Domain:**
   - `backend-developer` → Backend/API tasks
   - `frontend-developer` → Frontend/UI tasks
   - `fullstack-developer` → Full-stack tasks
   - `mobile-developer` → Mobile app tasks
   - `devops-engineer` → Infrastructure/deployment tasks
   - `database-administrator` → Database tasks
   - `security-auditor` → Security-focused tasks
   - `performance-engineer` → Performance optimization tasks

3. **Framework-Specific:**
   - `react-specialist` → React projects
   - `vue-expert` → Vue.js projects
   - `nextjs-developer` → Next.js projects
   - `laravel-specialist` → Laravel projects

**Selection Priority:**
1. Language-specific engineer (if detected)
2. Domain expert (backend/frontend/etc.)
3. Framework specialist (if applicable)
4. Fallback to `fullstack-developer`

**Example:**
- Rust backend API task → `rust-engineer` + `backend-developer`
- React frontend task → `react-specialist` + `frontend-developer`
- Python data processing → `python-pro` + `backend-developer`

### Subtask Level (Focused Implementation)

**Dynamic Selection Based On:**

1. **Subtask Type:**
   - `code-reviewer` → Code review subtasks
   - `test-automator` → Testing subtasks
   - `technical-writer` → Documentation subtasks
   - `api-designer` → API design subtasks
   - `ui-designer` → UI/UX design subtasks
   - `database-administrator` → Database subtasks
   - `security-engineer` → Security implementation subtasks

2. **Inherited from Task:**
   - Language-specific engineer (if task has one)
   - Domain expert (if task has one)

3. **Specialized Needs:**
   - `accessibility-tester` → Accessibility requirements
   - `compliance-auditor` → Compliance/regulatory needs
   - `performance-engineer` → Performance-critical subtasks

**Selection Logic:**
- Inherit language/domain from parent task
- Add specialized subagent based on subtask focus
- Can use multiple subagents (e.g., `rust-engineer` + `test-automator`)

### Iteration Level (Execution & Debugging)

**Dynamic Selection Based On:**

1. **Iteration State:**
   - `debugger` → When errors/failures detected
   - `code-reviewer` → For code quality checks
   - `qa-expert` → For testing/validation
   - `performance-engineer` → For performance issues

2. **Error Patterns:**
   - Compilation errors → Language-specific engineer + `debugger`
   - Test failures → `test-automator` + `debugger`
   - Security issues → `security-auditor` + `debugger`
   - Performance issues → `performance-engineer` + `debugger`

3. **Inherited Context:**
   - Language from task/subtask
   - Domain from task/subtask
   - Specialized needs from subtask

**Selection Logic:**
- Primary: Language/domain expert from parent tiers
- Secondary: Specialized role based on iteration needs
- Tertiary: `debugger` if errors present

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
    
    fn language_to_subagent(&self, lang: &str) -> Option<String> {
        match lang {
            "rust" => Some("rust-engineer".to_string()),
            "python" => Some("python-pro".to_string()),
            "javascript" => Some("javascript-pro".to_string()),
            "typescript" => Some("typescript-pro".to_string()),
            "swift" => Some("swift-expert".to_string()),
            "java" => Some("java-architect".to_string()),
            "csharp" => Some("csharp-developer".to_string()),
            "php" => Some("php-pro".to_string()),
            "go" => Some("golang-pro".to_string()),
            _ => None,
        }
    }
    
    fn framework_to_subagent(&self, framework: &str) -> Option<String> {
        match framework.to_lowercase().as_str() {
            "react" => Some("react-specialist".to_string()),
            "vue" => Some("vue-expert".to_string()),
            "nextjs" | "next.js" => Some("nextjs-developer".to_string()),
            "laravel" => Some("laravel-specialist".to_string()),
            _ => None,
        }
    }
}
```

### Tier Context

```rust
// src/types/state.rs (additions)

pub struct TierContext {
    pub tier_type: TierType,
    pub tier_id: String,
    pub title: String,
    pub description: String,
    
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
        
        // Select subagents
        let subagent_names = self.subagent_selector.select_for_tier(
            tier_node.tier_type,
            &tier_context,
        );
        
        // Invoke subagents via platform runner
        let platform = self.get_platform_for_tier(tier_node.tier_type);
        let model = self.get_model_for_tier(tier_node.tier_type);
        
        for subagent_name in &subagent_names {
            let invocation = self.build_subagent_invocation(
                subagent_name,
                &tier_node.description,
                &tier_context,
            )?;
            
            // Execute via platform runner with subagent
            self.execute_with_subagent(
                platform,
                model,
                subagent_name,
                invocation,
                &tier_context,
            ).await?;
        }
        
        Ok(())
    }
    
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

## Benefits

1. **Dynamic Adaptation:** Automatically selects appropriate subagents based on project context
2. **Language Awareness:** Never uses Rust engineer for Swift projects
3. **Domain Expertise:** Matches subagents to task domains (backend/frontend/etc.)
4. **Error Handling:** Automatically invokes debugger when errors occur
5. **Specialization:** Uses specialized subagents for focused tasks
6. **Inheritance:** Subagents flow down the tier hierarchy appropriately

## Implementation Phases

### Phase 1: Project Context Detection
- [ ] Implement `ProjectContext` detection
- [ ] Language detection from codebase files
- [ ] Framework detection
- [ ] Domain inference from task descriptions

### Phase 2: Subagent Selector
- [ ] Implement `SubagentSelector` with tier-level selection logic
- [ ] Language-to-subagent mapping
- [ ] Framework-to-subagent mapping
- [ ] Domain-to-subagent mapping

### Phase 3: Orchestrator Integration
- [ ] Add subagent selection to orchestrator
- [ ] Build tier context from tier nodes
- [ ] Invoke subagents via platform runners
- [ ] Handle subagent responses

### Phase 4: Error Pattern Detection
- [ ] Detect error patterns from iteration outputs
- [ ] Automatically invoke debugger/security-auditor/etc.
- [ ] Pattern-based subagent selection

### Phase 5: Testing & Refinement
- [ ] Test with different project types (Rust, Python, JavaScript, Swift)
- [ ] Verify subagent selection accuracy
- [ ] Refine selection logic based on results
- [ ] **Platform CLI verification (smoke tests)**: Run real CLIs per platform with minimal subagent-style prompts; assert exit success and non-empty/expected output; environment-gated or manual where CI has no CLI/auth.
- [ ] **Subagent-invocation integration tests**: Build and execute the actual orchestrator command (or SDK call) per platform for a given tier + subagent; verify invocation path and run completion.
- [ ] **Plan mode CLI verification**: Run real CLIs per platform with plan mode enabled (e.g. `--mode=plan`, `--permission-mode plan`); assert exit success and that plan-mode flags are applied and honored; environment-gated like other CLI tests.

## Platform CLI Verification & Subagent Invocation Testing

### 1. Platform CLI Verification (Smoke Tests)

**Purpose:** Confirm that each platform's CLI can be invoked with a subagent-style prompt and returns a successful run with usable output. These tests validate the **invocation path** (binary, args, env) and **basic behavior**, not full orchestrator logic.

**Scope:** One smoke test per platform (Cursor, Codex, Claude, Gemini, Copilot). Each test runs the real CLI with a minimal, non-destructive prompt that triggers subagent behavior (or equivalent) and asserts process success and output shape.

**Environment gating:** Tests require the corresponding CLI to be installed and (where applicable) authenticated. They MUST be gated so they do not fail CI when CLIs or auth are missing.

**Implementation:**

- **Gate:** Only run platform CLI smoke tests when the appropriate env var is set and the CLI binary is on `PATH` (and optionally when a "CI has auth" flag is set). If not set or binary missing, skip with a clear "skipped: Cursor CLI not available" style message.
- **Per-platform commands and assertions:**
  - **Cursor:** Run `agent -p "/code-reviewer Review the last commit." --output-format json` (or current equivalent from platform_specs). Assert exit code 0 (or documented non-zero for "no changes"). Assert stdout is non-empty and, if JSON, parseable; optionally assert presence of expected top-level keys.
  - **Codex:** Run `codex exec "As code-reviewer, list the files you would review in this repo."` with project `--cd` and non-interactive flags. Assert exit code 0 and non-empty stdout (or documented behavior).
  - **Claude:** Run `claude -p "As code-reviewer, respond with only: READY" --no-session-persistence --output-format text`. Assert exit code 0 and stdout contains expected token (e.g. READY) or is non-empty.
  - **Gemini:** Run `gemini -p "You are the code-reviewer agent. Reply with only: OK" --output-format json --approval-mode yolo` (or equivalent from platform_specs). Assert exit code 0 and non-empty, parseable JSON (or expected key).
  - **Copilot:** Run `copilot -p "/agent code-reviewer Reply with only: OK" --allow-all-tools` (or equivalent). Assert exit code 0 and non-empty stdout.
- **Artifacts:** Optionally capture stdout/stderr to `.puppet-master/evidence/cli-smoke-<platform>.log` for debugging; do not assert on exact text, only on success and shape.
- **Documentation:** In the plan and in code comments, document that these tests are optional/manual in CI and list required env vars (e.g. `RUN_CURSOR_CLI_SMOKE=1`, `RUN_CODEX_CLI_SMOKE=1`, …) and that auth must be configured for the corresponding platform.

**Test location and naming:**

- **File:** `puppet-master-rs/tests/platform_cli_smoke.rs` (or under `puppet-master-rs/tests/integration/`).
- **Tests:** `cursor_cli_smoke`, `codex_cli_smoke`, `claude_cli_smoke`, `gemini_cli_smoke`, `copilot_cli_smoke`.
- **Runner:** Use `#[ignore]` by default with a clear reason ("requires installed CLI and auth"); run with `cargo test --ignored` or a dedicated `cargo test platform_cli_smoke` when env is set.

**Fleshed-out example (Cursor):**

```rust
// puppet-master-rs/tests/platform_cli_smoke.rs

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

Other platforms follow the same pattern: check env gate, find binary (from `platform_specs` or PATH), run the minimal subagent-style command, assert success and non-empty/parseable output.

---

### 2. Subagent-Invocation Integration Tests

**Purpose:** Verify that the **exact** command line (or SDK call) the orchestrator would use for a given tier and subagent is built correctly and that executing it completes without unexpected failure. This catches regressions in argument construction, subagent naming, and platform-specific flags.

**Scope:** At least one integration test per platform that (1) builds the invocation (command + args + env or SDK request) as the orchestrator would, (2) runs it against the real CLI (or a script that mimics it), and (3) asserts that the run completes successfully and, where possible, that the invocation path (e.g. subagent name in the prompt) is correct.

**Implementation:**

- **Orchestrator invocation builder:** Use the same code path the orchestrator uses to build the CLI command or SDK call (e.g. a function that takes `platform`, `tier_type`, `subagent_name`, `prompt`, `model` and returns `Command` or `CopilotRequest`). Do not duplicate logic in tests.
- **Per-platform integration test:**
  - Build the invocation for a fixed scenario (e.g. tier = Task, subagent = `code-reviewer`, minimal prompt).
  - Execute it (real CLI or, if documented, a script that echoes the command and returns success for CI without auth).
  - Assert: process success; optionally that stdout/stderr contain the subagent name or expected token; and that no "unknown subagent" or "invalid flag" style errors appear in stderr.
- **Environment gating:** Same as smoke tests: skip when CLI is not available or auth is not configured; use env vars (e.g. `RUN_SUBAGENT_INVOCATION_TESTS=1`) and optional `#[ignore]` so CI without CLIs still passes.
- **Artifacts:** Log the exact command or SDK request and, if possible, a short excerpt of stdout/stderr to `.puppet-master/evidence/subagent-invocation-<platform>.log` for debugging.

**Test location and naming:**

- **File:** `puppet-master-rs/tests/subagent_invocation_integration.rs` (or under `puppet-master-rs/tests/integration/`).
- **Tests:** `cursor_subagent_invocation`, `codex_subagent_invocation`, `claude_subagent_invocation`, `gemini_subagent_invocation`, `copilot_subagent_invocation`.
- **Runner:** Same as smoke tests; run with env set or `cargo test --ignored` / `cargo test subagent_invocation`.

**Fleshed-out example (invocation builder + one platform):**

```rust
// puppet-master-rs/tests/subagent_invocation_integration.rs

/// Builds the exact Command the orchestrator would use for Cursor + subagent.
fn build_cursor_subagent_command(
    subagent_name: &str,
    prompt: &str,
    model: &str,
    workspace: &std::path::Path,
) -> std::process::Command {
    use std::process::Command;
    let binary = crate::platforms::platform_specs::cli_binary_names(crate::types::Platform::Cursor)
        .first()
        .copied()
        .unwrap_or("agent");
    let full_prompt = format!("/{} {}", subagent_name, prompt);
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

**Summary table:**

| Test type | What it runs | What it asserts | When to run |
|-----------|---------------|-----------------|-------------|
| Platform CLI smoke | Real CLI + minimal subagent cmd | Exit success, non-empty/parseable output | Env-gated or manual |
| Subagent-invocation integration | Orchestrator's command/call for tier+subagent | Invocation succeeds; output shape / no "invalid" errors | Env-gated or manual |
| Plan mode CLI verification | Real CLI + plan mode flags | Exit success; plan-mode flag present and honored | Env-gated or manual |

Both sections should be referenced from Phase 5 and from any "Testing" or "Verification" summary in the plan so implementers and reviewers know that real CLI and invocation-path verification are in scope.

---

### 3. Plan Mode CLI Verification (Real-CLI Tests)

**Purpose:** Confirm that each platform's CLI accepts and honors plan mode when invoked with the same flags the orchestrator uses (e.g. `--mode=plan`, `--permission-mode plan`, `--sandbox read-only`, `--approval-mode plan`). This validates plan mode end-to-end in the real CLIs, not just that we pass the right args.

**Scope:** One plan-mode test per platform (Cursor, Codex, Claude, Gemini, Copilot). Each test runs the real CLI with plan mode enabled and a minimal prompt, then asserts process success and (where possible) that the platform behaved in a plan-like way (e.g. read-only, or plan output present).

**Environment gating:** Same as other CLI tests: require CLI on PATH and (where applicable) auth; gate with an env var (e.g. `RUN_PLAN_MODE_CLI_TESTS=1`) and use `#[ignore]` so CI without CLIs/auth still passes.

**Implementation:**

- **Gate:** Only run when the appropriate env var is set and the CLI binary is available. Skip with a clear "skipped: plan mode CLI test (set RUN_PLAN_MODE_CLI_TESTS=1)" style message if not set or binary missing.
- **Per-platform commands (must match runner build_args when plan_mode is true):**
  - **Cursor:** `agent -p "Reply with only: PLAN_OK" --mode plan --output-format json`. Assert exit code 0 and non-empty stdout; optionally assert `--mode` and `plan` appear in the effective command or in logs.
  - **Claude:** `claude -p "Reply with only: PLAN_OK" --permission-mode plan --no-session-persistence --output-format text`. Assert exit code 0 and stdout contains expected token or is non-empty.
  - **Codex:** `codex exec "Reply with only: PLAN_OK" --sandbox read-only --json --color never --cd <workspace>`. Assert exit code 0 and non-empty stdout (read-only sandbox implies plan-like behavior).
  - **Gemini:** `gemini -p "Reply with only: PLAN_OK" --approval-mode plan --output-format json` (and `--yolo` omitted). Assert exit code 0 and non-empty output; skip or warn if `experimental.plan` is not enabled in settings.
  - **Copilot:** Run with the same flags the Copilot runner uses when `plan_mode` is true (omit `--allow-all-paths` / `--allow-all-urls`), e.g. `copilot -p "Reply with only: PLAN_OK" --allow-all-tools --stream off -s`. Assert exit code 0 and non-empty stdout.
- **Assertions:** (1) Process exit success. (2) Stdout non-empty (or parseable JSON where applicable). (3) Optionally: verify that the command line actually contained the plan-mode flag (e.g. by logging the command and asserting the flag string is present, or by using the same builder as the runner and checking args).
- **Artifacts:** Optionally capture stdout/stderr to `.puppet-master/evidence/plan-mode-cli-<platform>.log` for debugging.
- **Documentation:** Document in plan and code that these tests are optional/manual in CI; list env var `RUN_PLAN_MODE_CLI_TESTS=1` and that auth must be configured for the corresponding platform.

**Test location and naming:**

- **File:** `puppet-master-rs/tests/plan_mode_cli_verification.rs` (or under `puppet-master-rs/tests/integration/`).
- **Tests:** `cursor_plan_mode_cli`, `codex_plan_mode_cli`, `claude_plan_mode_cli`, `gemini_plan_mode_cli`, `copilot_plan_mode_cli`.
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

### Current State

Plan mode is implemented per tier (phase, task, subtask, iteration) and flows from GUI/config → tier config → `IterationContext.plan_mode` → `ExecutionRequest.plan_mode` → each platform runner. Start-chain flows (interview, PRD generator, etc.) already use `plan_mode: true` explicitly.

**Per-platform implementation (today):**

| Platform   | Plan mode implementation | Notes |
|-----------|---------------------------|--------|
| Cursor    | `--mode plan` (else `--force`) | Native; read-only planning then execute. |
| Claude    | `--permission-mode plan`       | Native; read-only analysis. |
| Codex     | `--sandbox read-only` (no `--full-auto`) | Read-only sandbox; no native "plan" flag. |
| Gemini    | `--approval-mode plan` (else `yolo`)     | May require `experimental.plan: true` in `~/.gemini/settings.json`. |
| Copilot   | Omit `--allow-all-paths` / `--allow-all-urls` when plan_mode | Restrictive mode; no dedicated plan flag in CLI. |

### Plan Mode & Platform CLI Updates (Last ~2 Months)

The following summarizes recent CLI releases (Dec 2025 – Feb 2026) that affect plan mode, subagents, hooks, plugins, and related behavior. Use this to keep `platform_specs`, runners, and AGENTS.md aligned with current behavior.

**Cursor (agent / cursor-agent)**  
- **Jan 16, 2026:** Plan mode and Ask mode in CLI: `/plan` or `--mode=plan`, `/ask` or `--mode=ask`; cloud handoff with `&`; one-click MCP auth; word-level diffs.  
- **v2.4 (Jan 22):** Subagents (parallel, custom configs).  
- **v2.5 (Feb 17):** Plugins (marketplace: skills, subagents, MCP, hooks, rules); async subagents (can spawn child subagents); sandbox network access controls.  
- **Impact:** Plan mode implementation (`--mode plan`) is correct. Subagent and plugin support has expanded; consider documenting plugins and async subagents in platform capabilities.

**Codex**  
- **0.100 (Feb 12):** ReadOnlyAccess policy, memory slash commands (`/m_update`, `/m_drop`), experimental JS REPL, app-server websocket refresh.  
- **0.101 (Feb 12):** Memory/model stability, model slug preservation.  
- **0.104 (Feb 18):** Distinct approval IDs for multi-approval shell commands; app-server v2 (thread archive notifications); `WS_PROXY`/`WSS_PROXY`; safety-check and cwd-prompt fixes.  
- **Sandbox:** `--sandbox read-only | workspace-write | danger-full-access`; no native "plan" flag; our use of `--sandbox read-only` for plan mode remains correct.  
- **Subagents/MCP:** Codex as MCP server (`codex mcp-server`) exposes `codex`/`codex-reply` tools; community `codex-subagents-mcp` uses profiles (e.g. `sandbox_mode = "read-only"` for review).  
- **Impact:** No change to plan-mode mapping. Subagent/MCP integration for Codex is relevant for orchestrator subagent invocation.

**Claude Code**  
- **v2.1.41–v2.1.45 (Feb 2026):** CLI auth commands, Windows ARM64, prompt cache and startup improvements; v2.1.45: Sonnet 4.6, `spinnerTipsOverride`, SDK rate limit types, `enabledPlugins`/`extraKnownMarketplaces` from `--add-dir`, permission destination persistence, plugin command availability fix.  
- **Plan mode:** `--permission-mode plan` (unchanged).  
- **Subagents:** `.claude/agents/` markdown definitions; built-in Explore/Plan/General-purpose; SDK subagent support.  
- **Hooks:** SessionStart, UserPromptSubmit, PreToolUse, PermissionRequest, PostToolUse, SubagentStart/SubagentStop, etc.; config via `/hooks` or `~/.claude/settings.json` / project settings.  
- **Plugins:** `.claude-plugin/plugin.json`; skills namespaced as `/plugin-name:skill-name`.  
- **Impact:** Plan mode and subagent/hook/plugin docs are still accurate; v2.1.45 plugin and `--add-dir` behavior may matter for project-specific plugins.

**Gemini CLI**  
- **v0.22–v0.28 (Dec 2025 – Feb 2026):** Extensions (Conductor, Endor Labs), Colab headless use, Agent Skills (built-in skills, `/agents refresh`, `/skills`), policy engine (modes like `plan`, granular shell allowlisting), hooks visibility, default folder trust.  
- **v0.24–v0.26:** Agent skills by default, generalist agent, skill-creator/pr-creator skills, rewind/introspect.  
- **v0.28 (Feb 3):** Auth/consent, custom themes, Positron IDE, `/prompt-suggest`.  
- **Plan mode:** Experimental; enable with `experimental.plan: true` in settings; `--approval-mode=plan` or `general.defaultApprovalMode: "plan"`; tool restrictions (read-only + write only in plans dir); policies can allow e.g. `run_shell_command` for `git status`/`git diff` or research subagents in plan mode.  
- **Subagents:** `experimental.enableAgents: true`; built-in codebase_investigator, cli_help, generalist; custom agents in `~/.gemini/agents/*.md` or `.gemini/agents/*.md`.  
- **Impact:** Our use of `--approval-mode plan` is correct. Document that `experimental.plan: true` (and optionally `enableAgents`) may be required; policy engine and research subagents in plan mode are relevant for advanced use.

**GitHub Copilot CLI**  
- **Jan 14–21, 2026:** Plan mode in interactive UI (Shift+Tab); advanced reasoning models; GPT-5.2-Codex; inline steering; background delegation `&`; `/review`; context auto-compaction; automation flags (`--silent`, `--share`, `--available-tools`, `--excluded-tools`).  
- **Plan mode:** Interactive only (Shift+Tab); no dedicated `--plan` flag for headless `-p` usage. Programmatic use remains `-p` with existing flags; our "omit `--allow-all-paths`/`--allow-all-urls` when plan_mode" remains the way to get more restrictive behavior in headless.  
- **SDK:** Plan mode and related APIs available in SDK for custom integrations.  
- **Impact:** No change to our headless plan-mode mapping; document that native plan mode is interactive; if Copilot adds a headless plan flag or SDK plan option, switch to it in runner and platform_specs.

**Summary for this plan**  
- Plan mode: Cursor, Claude, Gemini implementations are up to date; Codex (read-only sandbox) and Copilot (restrictive flags) unchanged.  
- Subagents/hooks/plugins: All five platforms have had relevant changes (Cursor plugins/async subagents; Codex MCP; Claude plugins/hooks; Gemini skills/policies/subagents; Copilot SDK). Keep platform-capabilities and subagent-integration sections in sync with release notes and official docs.

**Gaps vs "use plan mode for every request":**

1. **Default is off** — All tiers default to `plan_mode: false` in `default_config` and in YAML, so users must enable it per tier.
2. **No global override** — There is no single “use plan mode for all tiers” or “prefer plan mode by default” setting; only per-tier toggles in Config and Wizard.
3. **No one-click “all tiers”** — Enabling plan mode for every tier requires toggling four tier cards.
4. **Subagent invocations** — When subagent integration is added, `ExecutionRequest` built for subagent runs must receive the same `plan_mode` as the tier (so plan mode is applied to every request, including subagent calls).
5. **Gemini** — `--approval-mode plan` can require `experimental.plan: true` in settings; we do not currently validate or document this at runtime.
6. **Copilot** — If the CLI gains a native plan flag (e.g. `--plan` or plan mode in SDK), we should prefer it over “omit allow-all” and document it in `platform_specs` and AGENTS.md.

### Recommendations

**1. Default plan mode to true for all tiers**

- In `default_config.rs`, set `plan_mode: true` for `phase`, `task`, `subtask`, and `iteration`.
- In `config_override.rs` and any YAML defaults, use `plan_mode: true` unless we explicitly want a “fast/loose” default.
- Rationale: You prefer plan mode for every request for better results; making it the default matches that and reduces the need to turn it on in four places.

**2. Global “Use plan mode for all tiers” (in scope — see “GUI and Backend Scope” below)**

- Add a single GUI control (e.g. in Config, above or beside tier cards): “Use plan mode for all tiers” that:
  - When turned on: sets `plan_mode: true` for phase, task, subtask, and iteration.
  - When turned off: sets `plan_mode: false` for all (or restores last per-tier values if we store them).
- Optionally persist a “prefer plan mode” default so new tiers or new configs start with plan mode on; the global toggle can apply that default.

**3. One-click “Enable plan mode for all tiers” (in scope)**

- In Config (and optionally Wizard), add a button or link: “Enable plan mode for all tiers” that sets all four tier `plan_mode` to `true` in one action (single message or batch update).
- Complements the global toggle and makes it easy to align with “plan mode for every request” without editing each card.

**4. Ensure plan mode flows into subagent invocations**

- When building `ExecutionRequest` (or equivalent) for subagent runs (e.g. in `execute_tier_with_subagents` or the platform adapter), pass through the tier’s `plan_mode` (from `TierConfig` or `IterationContext`) so that:
  - Every orchestrator-driven request (including subagent calls) respects the tier’s plan mode setting.
- In the subagent integration plan and code, explicitly document that `plan_mode` is taken from the tier and applied to the request used for the subagent.

**5. Platform-specific robustness (in scope)**

- **Gemini:** When `plan_mode` is true and platform is Gemini, document in GUI tooltip and add a Doctor check that reads `~/.gemini/settings.json` and warns if `experimental.plan` is not set.
- **Copilot:** When a native plan flag exists, add it to `platform_specs` and the Copilot runner (e.g. `--plan` or equivalent) and use it when `plan_mode` is true, instead of or in addition to omitting `--allow-all-paths` / `--allow-all-urls`.
- **Codex:** Current “read-only sandbox” behavior is a reasonable stand-in for plan mode; if Codex adds an explicit plan/read-only flag, prefer that and document in AGENTS.md.

**6. Tooltip and discoverability (in scope)**

- Update the `tier.plan_mode` tooltip to state that plan mode is recommended for all tiers for best results (e.g. “Recommended: enable for all tiers for more reliable, step-by-step behavior”).
- In Wizard, consider defaulting the plan mode toggles to true when creating a new run so new users get the preferred behavior without searching for the option.

**7. GUI gaps summary (cross-plan)**

- **Config:** Plan mode and subagent UI live in Config (Tiers tab, optional global toggle, Subagents section). **MiscPlan** adds cleanup/evidence under Config → Advanced (§7.5); **Worktree** adds Branching tab controls. Ensure a single Save persists the whole GuiConfig (including plan mode, subagents, cleanup, branching) and that Option B run-config build includes all of these so the run sees current UI state.
- **Platform CLI capabilities (hooks, skills, plugins, extensions):** This plan documents them in **"Platform-Specific Capabilities & Extensions"** below. We pass subagent names and plan mode via **prompt/CLI args**; we do not require Cursor plugins or Claude hooks for core orchestration. **MiscPlan §7.6** summarizes how cleanup/prepare are implemented in Puppet Master and how we might optionally leverage or document platform hooks/skills. When changing subagent invocation, keep platform_specs and AGENTS.md aligned with CLI release notes.

### Implementation checklist

**Plan mode — backend**
- [ ] Change default `plan_mode` to `true` for all tiers in `default_config.rs`, `config_override.rs`, and GUI defaults.
- [ ] Add `use_plan_mode_all_tiers` (and optional `last_per_tier_plan_mode`) to persisted config; apply in tier config load/sync so all tiers become true/false when global is toggled.
- [ ] Ensure subagent/invocation path receives tier `plan_mode` and passes it into `ExecutionRequest` (document in subagent plan and in code).

**Plan mode — frontend (Config)**
- [ ] Add global “Use plan mode for all tiers” toggle in Config (above tier cards); message and handler; persist; when global on, tier plan_mode toggles disabled and show true.
- [ ] Add “Enable plan mode for all tiers” one-click button in Config; message and handler; persist.
- [ ] Update `tier.plan_mode` tooltip in `widgets/tooltips.rs` to recommend enabling for all tiers; add Gemini plan-mode hint on tier card when platform is Gemini and plan mode on.

**Plan mode — frontend (Wizard)**
- [ ] Default plan mode to true for new runs in Wizard; add “Enable plan mode for all tiers” in Wizard when tier plan-mode toggles exist.

**Subagent — backend**
- [ ] Add subagent config struct and load/save from `config.yaml` (or app config); orchestrator uses `enable_tier_subagents`, `tier_overrides`, `disabled_subagents`, `required_subagents`.

**Subagent — frontend (Config)**
- [ ] Add “Subagents” section on Config: enable toggle, tier overrides (per-tier list or multi-select), disabled/required lists; messages and handlers; persist to same config as backend.

**Doctor**
- [ ] Add Gemini + plan mode check in Doctor: read `~/.gemini/settings.json`, warn if `experimental.plan` missing when any tier has Gemini and plan_mode true.

**Other**
- [ ] When Copilot (or Codex) gains a native plan flag, add it to `platform_specs` and the runner and update AGENTS.md.
- [ ] **Fully test plan mode in the CLIs:** Add plan mode CLI verification tests (run each platform CLI with plan mode enabled; assert exit success and correct flags); env-gated like `platform_cli_smoke` (e.g. `RUN_PLAN_MODE_CLI_TESTS=1`). See "3. Plan Mode CLI Verification" in this plan.
- [ ] Unit tests for global plan-mode toggle and one-click; subagent config load/apply tests.
- [ ] **Resolve gaps:** Before or during implementation, resolve each item in **"Gaps and Clarifications"** (persistence location for plan-mode global, subagent in GuiConfig, Doctor config source, canonical subagent list, tier-overrides shape, orchestrator/subagent code path, Message/handlers, TierId type, **interview config wiring — Gap §9**).
- [ ] **Mitigate potential issues:** Review **"Potential Issues"** and address defaults, validation, platform adapters, caching, and persistence so the feature is robust in production.
- [ ] **DRY method and widget catalog:** Check `docs/gui-widget-catalog.md` before adding UI; use existing widgets; tag new reusable items with `DRY:WIDGET:`, `DRY:FN:`, or `DRY:DATA:`; run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` after widget changes.
- [ ] **Interview config wiring:** Wire interview settings per **"Interviewer Enhancements and Config Wiring"**: add `min_questions_per_phase` and `max_questions_per_phase` (Option for unlimited) to `InterviewOrchestratorConfig`, set from `gui_config.interview` in `app.rs`, use in PhaseManager and phase-complete logic and prompts; add GUI controls (Min / Max with Unlimited). Wire `require_architecture_confirmation` and `vision_provider` into `InterviewOrchestratorConfig` and use in interview flow (architecture gate; vision platform when image flows exist).
- [ ] **Config-wiring validation at each tier:** Implement `validate_config_wiring_for_tier` (or equivalent) and call it at **Phase start, Task start, Subtask start, Iteration start** in the main orchestrator (and at phase/sub-tier start in the interview orchestrator). Fail fast when required config is missing; warn when a GUI/file field is not present in execution config. See **"Avoiding Built but Not Wired"** and **Implementation Notes — Config-wiring validation**.
- [ ] **AGENTS.md wiring checklist:** Add to AGENTS.md (e.g. under Pre-Completion Verification Checklist or DO): for any new execution-affecting config, follow the three-step wiring checklist (add to execution config, set at construction from GUI/file, use in runtime); link to this plan or REQUIREMENTS.md.
- [ ] **Start and end verification:** Implement start-of-phase/task/subtask verification (config-wiring + wiring/readiness: GUI? backend? steps make sense? gaps?) and end-of-phase/task/subtask verification (wiring re-check + acceptance gate + quality verification / code review). See **"Start and End Verification at Phase, Task, and Subtask"**; resolve gaps there (quality definition per tier, readiness checklist source of truth, interview-phase mirror).

This keeps plan mode as the preferred behavior for every request while preserving the ability to turn it off per tier or globally when needed.

---

## GUI and Backend Scope (All In-Scope Now)

All previously "optional" or "later" plan-mode and subagent GUI/backend items are **in scope now**. The following specifies frontend and backend so they work end-to-end.

### 1. Plan Mode — Backend

- **Defaults:** In `default_config.rs`, set `plan_mode: true` for phase, task, subtask, iteration. In `config_override.rs` (and any YAML defaults), use `plan_mode: true` unless explicitly overridden. In `gui_config.rs` default, set `plan_mode: true` for any tier defaults used by the GUI.
- **Global “use plan mode for all tiers”:** Add to persisted config (e.g. `GuiConfig` or app settings that save to `.puppet-master/settings.json` or equivalent): `use_plan_mode_all_tiers: bool`. Optionally: `last_per_tier_plan_mode: Option<HashMap<TierId, bool>>` to restore when turning the global off. When `use_plan_mode_all_tiers == true`, any load or sync of tier config forces all four tiers’ `plan_mode` to `true` (optionally store previous per-tier values before overwriting). When toggled off, set all tiers to `false` or restore from `last_per_tier_plan_mode`. Prefer write-through so tier configs and saved YAML stay in sync.
- **Subagent invocations:** When building `ExecutionRequest` for subagent runs (e.g. in `execute_tier_with_subagents` or the platform adapter), set `request.plan_mode = tier_config.plan_mode` (from `TierConfig` or `IterationContext`). Document in plan and code.
- **Gemini:** In Doctor, add a check: if any tier uses Gemini and `plan_mode == true`, warn that `experimental.plan: true` may be required in `~/.gemini/settings.json`. Optionally probe the file and only warn if the setting is missing. In Config, when platform is Gemini and plan mode is on, show a short tooltip or help: “Gemini plan mode may require `experimental.plan: true` in ~/.gemini/settings.json.”

### 2. Plan Mode — Frontend (Config)

- **DRY:** Use existing widgets from `docs/gui-widget-catalog.md` (e.g. toggler, styled_button); tag any new reusable widget with `// DRY:WIDGET:`.
- **Global toggle:** In Config, above the tier cards, add one toggle: “Use plan mode for all tiers”. Message e.g. `Message::ConfigUsePlanModeAllTiersToggled(bool)`. Handler: if `true`, set all four tier configs’ `plan_mode` to `true` and persist `use_plan_mode_all_tiers = true`; if `false`, set all to `false` (or restore from `last_per_tier_plan_mode`) and persist. When global is on, tier plan_mode toggles are disabled and show true; when global is off, tier toggles are editable.
- **One-click button:** Next to or under the global toggle, add button “Enable plan mode for all tiers”. Message e.g. `Message::ConfigEnablePlanModeAllTiers`. Handler: set phase, task, subtask, iteration `plan_mode` to `true` and set `use_plan_mode_all_tiers = true`; persist.
- **Tooltip:** In `widgets/tooltips.rs`, update `tier.plan_mode` to: “When enabled, the AI creates a detailed plan before writing code. Recommended: enable for all tiers for more reliable, step-by-step behavior. Optional for simple iterations.”
- **Persistence:** Ensure `use_plan_mode_all_tiers` (and optional `last_per_tier_plan_mode`) are saved/loaded with the rest of GUI config.

### 3. Plan Mode — Frontend (Wizard)

- **Default for new runs:** When the Wizard builds initial tier config for a new run, set `plan_mode: true` for all tiers (from `default_config` or explicitly in wizard init). Wizard tier/plan-mode toggles should reflect this.
- **One-click:** If the Wizard has tier-level plan mode toggles, add “Enable plan mode for all tiers” (same semantics as Config) so users can align all tiers in one action.

### 4. Subagent — Backend

- **Config model:** Add (or extend) a struct for subagent config used at runtime (e.g. in `config/` or `types/config.rs`): `enable_tier_subagents: bool`, `tier_overrides: TierSubagentOverrides` (e.g. map tier → list of subagent names), `disabled_subagents: Vec<String>`, `required_subagents: Vec<String>` (optional). Load from `.puppet-master/config.yaml` under `subagentConfig`; if missing, use defaults: `enable_tier_subagents: true`, empty overrides, empty disabled/required.
- **Orchestrator:** When selecting subagents for a tier, if `enable_tier_subagents` is false, skip subagent invocation (or use a single “general” path). If true, run selection logic then apply overrides: for that tier, if `tier_overrides` has an entry, use it (or merge/filter with selected list). Filter out any in `disabled_subagents`; optionally require any in `required_subagents`.
- **Persistence:** When the GUI changes subagent settings, write back to config (YAML or same store as rest of app config); single save path that includes subagent config.

### 5. Subagent — Frontend (Config)

- **DRY:** Check `docs/gui-widget-catalog.md` before adding controls; use existing toggler, styled_button, layout helpers; tag new reusable widgets/helpers with `DRY:WIDGET:` or `DRY:FN:`; run `scripts/generate-widget-catalog.sh` after changes.
- **Section:** Add a “Subagents” section on the Config page (below tier cards or in a collapsible block). Controls: (1) **Enable tier subagents:** one toggle bound to `subagentConfig.enableTierSubagents`. Message e.g. `Message::ConfigSubagentEnableTierSubagentsToggled(bool)`. (2) **Tier overrides:** For each tier (phase/task/subtask/iteration), a text field or list editor for override subagent names (comma-separated or multi-select from a fixed list of known subagent names). (3) **Disabled subagents:** one list (comma-separated or tag input) for `disabledSubagents`. (4) **Required subagents:** same for `requiredSubagents`. Messages: e.g. `ConfigSubagentTierOverrideChanged(tier, list)`, `ConfigSubagentDisabledListChanged(Vec<String>)`, `ConfigSubagentRequiredListChanged(Vec<String>)`. Handler: update in-memory config and persist; backend reads from same persisted config.
- **Discovery:** Subagent names in the override UI come from a constant list (e.g. from this plan’s persona list: project-manager, architect-reviewer, product-manager, rust-engineer, python-pro, code-reviewer, test-automator, …) or from a future subagent registry; document so UI and backend share the same names.

### 6. Doctor — Gemini Plan Mode Check

- **Check:** In `doctor/` (new check or inside existing config check): if any tier has platform Gemini and `plan_mode == true`, check `~/.gemini/settings.json` for `experimental.plan: true` (or equivalent path); if missing, add Doctor warning: “Gemini plan mode is enabled for a tier but experimental.plan may not be set in ~/.gemini/settings.json.” Prefer reading the file and only warning when plan mode is on and setting is missing.

### 7. Implementation Checklist (GUI & Backend — Add/Expand)

See the updated **Implementation checklist** below; it includes all of the above as concrete tasks.

---

## Gaps and Clarifications

These items are underspecified or inconsistent in the plan. Resolve them during implementation so frontend and backend work end-to-end.

### 1. Where to persist `use_plan_mode_all_tiers`

- **Gap:** The plan says add to “GuiConfig or app settings that save to `.puppet-master/settings.json`”.
- **Clarify:** Choose one: (a) Add `use_plan_mode_all_tiers` (and optional `last_per_tier_plan_mode`) to **GuiConfig** and persist in the same YAML as tiers (same file/save path as Config), or (b) persist in **settings.json** (e.g. `.puppet-master/settings.json`) and have Config load/save it from there. The app currently has both: `gui_config` save/load to a config path (e.g. pm-config.yaml) and settings.json for other state. Recommend (a) so plan-mode global state lives with tier config in one place.

### 2. Subagent config in GuiConfig

- **Gap:** Plan says load subagent config from `.puppet-master/config.yaml` under `subagentConfig`, and “single save path that includes subagent config,” but **GuiConfig** (in `config/gui_config.rs`) has no `subagentConfig` field.
- **Clarify:** Add a top-level field to **GuiConfig**, e.g. `subagent: SubagentGuiConfig`, with `enable_tier_subagents`, `tier_overrides`, `disabled_subagents`, `required_subagents`. Serialize as `subagentConfig` in YAML (or `subagent` with serde rename) so load/save use the same file as the rest of Config. Ensure default in GuiConfig matches plan defaults (enable_tier_subagents: true, empty overrides/lists).

### 3. Doctor Gemini plan-mode check: source of tier config

- **Gap:** The check must know “any tier has platform Gemini and plan_mode == true.” Doctor checks currently have `async fn run(&self) -> CheckResult` with no parameters.
- **Clarify:** The Gemini plan-mode check should **discover and load the project config** inside `run()`: use `config_discovery::discover_config_path(None)` then `gui_config::load_config(path)` (or the same loader the Config page uses). If the file is not GuiConfig-shaped, fall back to “skip check” or “warn: could not read tier config.” This keeps the DoctorCheck trait unchanged and uses the same config file as the app.

### 4. Canonical list of subagent names

- **Gap:** The plan scatters subagent names across Tier-Level Subagent Strategy (project-manager, rust-engineer, code-reviewer, …). The GUI and backend need a **single shared list** for validation and multi-select.
- **Clarify:** Add a **“Known subagent names”** section or table in this plan (or a constant in code, e.g. in `platform_specs` or a new `subagent_registry` module) listing all allowed names: phase (project-manager, architect-reviewer, product-manager), task (rust-engineer, python-pro, …, backend-developer, …), subtask (code-reviewer, test-automator, …), iteration (debugger, qa-expert, …). Use this for UI multi-select and for validating override/disabled/required lists.

**Known subagent names (canonical list for UI and validation):**

| Category | Names |
|----------|--------|
| Phase | `project-manager`, `architect-reviewer`, `product-manager` |
| Task (language) | `rust-engineer`, `python-pro`, `javascript-pro`, `typescript-pro`, `swift-expert`, `java-architect`, `csharp-developer`, `php-pro`, `golang-pro` |
| Task (domain) | `backend-developer`, `frontend-developer`, `fullstack-developer`, `mobile-developer`, `devops-engineer`, `database-administrator`, `security-auditor`, `performance-engineer` |
| Task (framework) | `react-specialist`, `vue-expert`, `nextjs-developer`, `laravel-specialist` |
| Subtask | `code-reviewer`, `test-automator`, `technical-writer`, `api-designer`, `ui-designer`, `security-engineer`, `accessibility-tester`, `compliance-auditor` |
| Iteration | `debugger`, `qa-expert` |

Use the union of all names for override/disabled/required lists; optionally restrict multi-select by tier in the UI.


### 5. Tier overrides: one list per tier vs contextual keys

- **Gap:** YAML shows `tierOverrides.phase.default`, `.phase.architecture`, `.phase.product`, `.task.rust`, `.task.python`, etc. The GUI section says “for each tier (phase/task/subtask/iteration), a text field or list editor for override subagent names.”
- **Clarify:** Decide (a) **Simple:** one list per tier (phase, task, subtask, iteration) so `tier_overrides` is e.g. `HashMap<TierName, Vec<String>>` and YAML is `phase: [project-manager]`, `task: [rust-engineer]`, or (b) **Full:** keep contextual keys (phase.default, phase.architecture, task.rust, …) and add UI for them (e.g. phase: “default” / “architecture” / “product” with a list each). For first implementation, (a) is enough; document that contextual overrides can be added later if needed.

### 6. Orchestrator and subagent code not yet present

- **Gap:** The plan references `execute_tier_with_subagents`, `build_subagent_invocation`, `execute_with_subagent`, and `SubagentSelector`. These do not exist in the codebase yet; they are specified in the plan’s “Integration with Orchestrator” and Phase 3.
- **Clarify:** Phase 3 (and any subagent execution path) must: (1) Read `enable_tier_subagents` from config; if false, skip subagent invocation (or use a single non-subagent path). (2) When building the list of subagents for a tier, apply `tier_overrides` (replace or merge with selected list), then filter by `disabled_subagents` and ensure `required_subagents` are included. (3) When building `ExecutionRequest` for each subagent run, set `request.plan_mode = tier_config.plan_mode`. Ensure the checklist item “Ensure subagent/invocation path receives tier plan_mode” is done in that code path.

### 7. Message enum and app.rs handlers

- **Gap:** The plan names messages (e.g. `ConfigUsePlanModeAllTiersToggled`, `ConfigEnablePlanModeAllTiers`, `ConfigSubagentEnableTierSubagentsToggled`, …) but does not list all new `Message` variants or where each is handled in `app.rs`.
- **Clarify:** During implementation, add every new variant to the `Message` enum and a corresponding branch in `App::update`. Document in the plan or in code: “Plan mode global: ConfigUsePlanModeAllTiersToggled, ConfigEnablePlanModeAllTiers; Subagent: ConfigSubagentEnableTierSubagentsToggled, ConfigSubagentTierOverrideChanged, ConfigSubagentDisabledListChanged, ConfigSubagentRequiredListChanged.”

### 8. Tier id type for `last_per_tier_plan_mode`

- **Gap:** Plan says `last_per_tier_plan_mode: Option<HashMap<TierId, bool>>`. The codebase uses tier names as strings (e.g. `"phase"`, `"task"`).
- **Clarify:** Use `HashMap<String, bool>` keyed by tier name (`"phase"`, `"task"`, `"subtask"`, `"iteration"`) unless a dedicated `TierId` type already exists; then use that consistently.

### 9. Interview config wiring and execution config

- **Gap:** Several interview settings exist in `InterviewGuiConfig` and `InterviewConfig` but are not in `InterviewOrchestratorConfig` and are never used in `interview/` (orchestrator, phase_manager, prompt_templates). See **"Interviewer Enhancements and Config Wiring"** and **"Avoiding Built but Not Wired"** in this plan.
- **Clarify:** (1) **Min/max questions:** Add `min_questions_per_phase` and `max_questions_per_phase` (Option for unlimited) to `InterviewOrchestratorConfig`; set from `gui_config.interview` in `app.rs`; pass into PhaseManager and use in phase-complete logic and prompts. (2) **require_architecture_confirmation** and **vision_provider:** Add to `InterviewOrchestratorConfig`, set at construction, and use in interview flow (architecture gate and vision platform selection). (3) For any future execution-affecting interview setting, follow the three-step wiring checklist: add to execution config, set at construction, use in runtime.

---

## DRY Method and GUI Widget Catalog

The codebase follows the **DRY method** (reuse-first) and uses a **widget catalog** for UI. When implementing the plan-mode and subagent GUI (Config, Wizard, Doctor), follow these rules so new UI stays consistent and discoverable.

### Widget catalog

- **Before adding any new UI:** Check **`docs/gui-widget-catalog.md`** (the full widget and data-source catalog). Use existing widgets instead of hand-rolling (e.g. `styled_button`, `page_header`, `refresh_button`, `toggler`, `selectable_label`, `help_tooltip`, `themed_panel`, `modal_overlay`).
- **Location:** The catalog is at `docs/gui-widget-catalog.md`; AGENTS.md references it as the place to check before creating new UI. Reusable widgets live in `puppet-master-rs/src/widgets/`.
- **Plan-mode and subagent UI:** For the global plan-mode toggle, one-click button, and Subagents section, prefer existing controls (toggler, styled_button, layout helpers). If no widget fits, add a new one and register it in the catalog (see below).

### DRY tagging

- **Tag all new reusable items** so agents and developers can find them via `grep -r "DRY:" puppet-master-rs/src/`.
- **Conventions (from AGENTS.md):**
  - `// DRY:WIDGET:<name>` — Reusable UI widget (see `src/widgets/`).
  - `// DRY:DATA:<name>` — Single source of truth data (e.g. subagent name list, config struct).
  - `// DRY:FN:<name>` — Reusable helper or query function.
  - `// DRY:HELPER:<name>` — Shared utility.
- **What to tag in this plan’s scope:** New widgets or helpers used by Config/Wizard/Doctor (e.g. a subagent multi-select helper, or a “plan mode global” row widget if factored out). New data sources (e.g. canonical subagent list constant or module) as `DRY:DATA:`. New message handlers or config helpers as `DRY:FN:` where appropriate.
- **Bespoke UI:** If you must implement something that doesn’t use an existing widget, add an inline rationale: `// UI-DRY-EXCEPTION: <reason>`.

### After widget or catalog changes

- Run **`scripts/generate-widget-catalog.sh`** to refresh the catalog.
- Run **`scripts/check-widget-reuse.sh`** (warn-only, exit 0) to catch reuse opportunities.

### Checklist

- [ ] **DRY / catalog:** Before implementing plan-mode and subagent GUI, read `docs/gui-widget-catalog.md` and use existing widgets where possible; tag new reusable widgets/helpers/data with `DRY:WIDGET:`, `DRY:FN:`, or `DRY:DATA:`; run `generate-widget-catalog.sh` and `check-widget-reuse.sh` after UI changes.

---

## Potential Issues

Risks, edge cases, and failure modes to watch during implementation and testing.

### 1. Default for `use_plan_mode_all_tiers` and existing configs

- **Issue:** If we default `use_plan_mode_all_tiers` to `true`, the first time an existing project loads (with no such key), we might force all tiers to plan mode and overwrite user’s previous per-tier choices.
- **Mitigation:** Default `use_plan_mode_all_tiers` to `false` so existing configs are unchanged. Only users who turn the global toggle on get “all tiers plan mode.” Optionally, when the key is missing, do not force tier values on load.

### 2. Invalid subagent names in overrides

- **Issue:** User can type or paste invalid names in tier overrides or disabled/required lists. Orchestrator or platform CLI may then receive unknown names and fail or misbehave.
- **Mitigation:** Validate against the canonical subagent list (see Gaps §4). In UI: prefer multi-select or autocomplete from allowed names; on save or apply, warn or reject invalid entries. In backend: filter unknown names or fail fast with a clear error.

### 3. Gemini settings path and format

- **Issue:** `~/.gemini/settings.json` must be resolved (home dir on all platforms). JSON might be missing, malformed, or use a different structure; the `experimental.plan` key might be nested (e.g. `experimental.plan` or under another key).
- **Mitigation:** (1) **Path:** Use the same path resolution as the rest of the app (e.g. `platforms::path_utils::expand_home` or `dirs::home_dir()` + join) so `~/.gemini/settings.json` works on all platforms. (2) **Key:** Confirm in Gemini CLI docs; typically `experimental.plan` (boolean) or nested under `experimental`. Parse JSON and check that key; if missing or false, emit the warning. (3) **Errors:** On missing file or parse error, Doctor check should warn “could not read Gemini settings” and not assume plan is disabled.

### 4. Doctor check when config is not GuiConfig

- **Issue:** Some projects may use a different config format (e.g. legacy or alternate YAML shape). `gui_config::load_config` might fail or return a partial struct.
- **Mitigation:** In the Gemini plan-mode check, if load fails or tiers are missing, skip the check or emit a neutral warning (“could not load tier config; ensure config file is valid”) so Doctor doesn’t fail hard.

### 5. Wizard vs Config and global plan mode

- **Issue:** Wizard has its own `wizard_tier_configs`; if we default plan mode to true there, we must ensure that when the user finishes the wizard and a run is created, we don’t overwrite or ignore the global `use_plan_mode_all_tiers` from Config (or vice versa).
- **Mitigation:** **Decision:** When the user completes the Wizard and creates a run, use Wizard tier config as the source of truth for that run (platform, model, plan_mode per tier). When Wizard persists to the config file (e.g. on Save or Apply), merge with existing Config: apply “global plan mode on ⇒ set all tier plan_mode true” and write subagent config from Config if present, so the saved file stays consistent. Wizard UI does not need the global plan-mode toggle; per-tier plan mode toggles (and optional “Enable plan mode for all tiers” button) are enough.

### 6. Tier overrides are per tier type, not per node

- **Issue:** Overrides are keyed by tier type (phase, task, subtask, iteration). All parallel subtasks share the same “subtask” override list, so we can’t say “Subtask A: rust-engineer, Subtask B: react-specialist” via overrides.
- **Mitigation:** Accept for v1 that overrides are per tier type. Document that per-node overrides (or context-aware overrides) are out of scope for the first version. Dynamic selection (language/framework) still differentiates parallel subtasks when overrides are not set.

### 7. Subagent personas and non-Cursor platforms

- **Issue:** Plan describes “Cursor subagent personas.” Codex, Claude, Gemini, Copilot may not recognize the same names or syntax (e.g. `/code-reviewer` vs prompt preamble).
- **Mitigation:** In platform runners, when building the prompt or args for a subagent, use platform_specs or a small adapter (e.g. `subagent_prompt_prefix(platform, subagent_name) -> String`) so that: Cursor => `/subagent_name ` + user prompt; Codex/Claude/Gemini/Copilot => “As <subagent_name>, ” + user prompt in system or first message, or omit if platform has no convention. Document in AGENTS.md which platforms support which subagent semantics. Implement the adapter so adding a new platform is a single match arm or config entry.

### 8. Caching of project context / language detection

- **Issue:** Subagent selection runs language/framework detection (e.g. filesystem reads). If run on every tier or every iteration, it could be slow or redundant.
- **Mitigation:** Cache detection per workspace path (cache key: canonical workspace path). Invalidate when the config is reloaded or the workspace path for the run changes. Expose a single entry point (e.g. `get_project_context(workspace) -> Result<ProjectContext>`) that returns cached value if valid. Phase 1/2 implement this; the orchestrator calls that entry point instead of running detection on every tier. Consider a TTL or “cache for the duration of the run” so long sessions don’t hold stale data if the user edits the repo.

### 9. Required vs disabled subagents conflict

- **Issue:** User could add the same name to both “required” and “disabled.” Backend behavior could be ambiguous.
- **Mitigation:** **Rule: required wins.** When building the final subagent list: (1) Start from selected list or override list. (2) Add all names in `required_subagents`. (3) Remove any name in `disabled_subagents` unless it is in `required_subagents`. Document this in code and in the Config UI tooltip. In the UI, optionally grey out or hide in the disabled list any name that appears in required.

### 10. Meaning of empty override list

- **Issue:** If `tier_overrides.phase = []`, does that mean “no subagents for phase” or “no override; use auto-selected list”?
- **Mitigation:** **Rule: missing or empty override = use auto-selection.** Only a non-empty override list for a tier replaces the selector output. To force no subagents for a tier, the user sets `enable_tier_subagents` false (global) or we add a per-tier “use no subagents” option in a later version. **Implement:** In the orchestrator, if `tier_overrides.get(tier)` is `None` or `Some([])`, use the list from `SubagentSelector::select_for_tier`; otherwise use the override list. Document in code and in the Config tooltip for tier overrides.

### 11. Persistence and dirty state

- **Issue:** User toggles global plan mode or subagent settings and switches tab or closes before save. Changes could be lost or only partially written.
- **Mitigation:** Follow existing Config save behavior: save on explicit Save action and/or mark dirty and prompt on leave. Ensure `use_plan_mode_all_tiers`, `last_per_tier_plan_mode` (if used), and the full `subagent` block (SubagentGuiConfig) are part of the same `GuiConfig` struct and are written in the same `gui_config::save_config()` call from the Config view so we never persist only tier config without plan-mode global or subagent settings. When the user clicks Save on any Config tab, the entire `gui_config` (including these fields) is serialized to the same YAML file.

### 12. Start/end verification overhead and quality definition

- **Issue:** Start and end verification at every Phase/Task/Subtask (wiring, readiness, acceptance, quality) adds latency and requires a clear definition of "quality" and who addresses unrelated failures.
- **Mitigation:** (1) Quality over performance: run full checks; do not skip or weaken for speed. Scope quality checks to changed files or this tier’s artifacts. (2) Define a small canonical quality checklist per tier (e.g. in this plan or verification config): reviewer subagent (required) plus gate criteria (clippy, tests, etc.). (3) Reviewer subagent runs in all three cases: always at end-of-tier, on retry, and when quality gate fails. (4) Unrelated failures (e.g. pre-existing tech debt) are addressed by the parent-tier orchestrator (retry, different subagent, escalate). Reuse existing gates where possible; end verification should call into current gate logic rather than duplicate it.

---

## Interviewer Enhancements and Config Wiring

This section addresses **interview-specific** config that is built in the GUI and/or config types but not yet wired into the interview execution path, and defines **min/max questions per phase** behavior plus process and validation to avoid "built but not wired" across the app.

### Current state: interview config wiring gap

The Config tab (Interview tab) and `InterviewGuiConfig` / `PuppetMasterConfig.interview` (`InterviewConfig`) define several settings. The **interview orchestrator** is built with `InterviewOrchestratorConfig` in `app.rs` (from `gui_config.interview`). Only a subset of GUI/config fields are passed into `InterviewOrchestratorConfig` and used in `interview/` (orchestrator, phase_manager, prompt_templates, completion_validator).

**Audit result — interview settings:**

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
   - **Accept** phase complete only when the current phase’s question count is **≥** `min_questions_per_phase`.
   - If `max_questions_per_phase` is `Some(n)`, **reject** or defer phase complete if count **>** n (or treat as soft cap and accept when agent signals complete and count ≤ n).
   - If `max_questions_per_phase` is `None` (unlimited), no upper bound check.

3. **Wiring (full path):**
   - **Types:** Add to `InterviewGuiConfig` and `InterviewConfig`: `min_questions_per_phase: u32`, `max_questions_per_phase: Option<u32>` (and remove or repurpose the old single `max_questions_per_phase`).
   - **Execution config:** Add the same two fields to `InterviewOrchestratorConfig` (`interview/orchestrator.rs`).
   - **Construction:** In `app.rs`, when building `InterviewOrchestratorConfig` from `gui_config.interview`, set `min_questions_per_phase` and `max_questions_per_phase` from `gui_config.interview`.
   - **Phase manager:** Pass these into phase definitions or into `PhaseManager` (e.g. in `default_phases()` / `add_dynamic_phase()`), so each phase has min/max available.
   - **Orchestrator logic:** In `process_ai_turn` (or equivalent), when `parsed.is_phase_complete`, compute current phase question count; if count < min, reject (e.g. send back "Ask at least N questions"); if max is `Some(m)` and count > m, either reject or accept depending on product rule; otherwise accept.
   - **Prompts:** In `prompt_templates.rs` (or equivalent), inject the configured min (and max if set) into the instructions, e.g. "Ask at least {min} questions…" and "Do not exceed {max} questions…" when max is set.
   - **GUI:** Interview tab: replace single max control with Min (number input) and Max (number input + "Unlimited" option). Use existing DRY widgets and tooltips.
   - **Docs:** AGENTS.md or interview doc: document min/max and Unlimited; tooltips in Config.
   - **Tests:** Unit tests for min/max logic (accept/reject at boundaries); integration test that builds config from `gui_config` and runs one phase; env-gated smoke if needed.

### Other unwired interview settings — resolution

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

### Approach A: Process — explicit wiring steps and checklist

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

### Approach B: Tier-level config-wiring validation (Phase / Task / Subtask / Iteration)

**Rule:** The orchestrator (or a shared validation layer) runs a **config-wiring check at each tier boundary** — when entering a Phase, when entering a Task, when entering a Subtask, and when entering an Iteration. The check verifies that the config that **should** affect execution at that tier is **present and actually used** (e.g. tier config exists, plan_mode is read from config, interview limits are present in interview config when in interview flow). This catches "built but not wired" even when the checklist is missed.

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

**Summary table — where validation runs:**

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

Beyond config-wiring validation (which runs at **start** of each tier), this section defines a **broader start verification** (wiring + readiness) and an **end verification** (wiring again + **quality review**) at Phase, Task, and Subtask boundaries. The goal is to catch things that need to be wired, confirm GUI/backend are in sync, validate that steps make sense, and at the end not only pass acceptance criteria but ensure the work was done well via actual code review.

### Start-of-phase / start-of-task / start-of-subtask verification

When the orchestrator **enters** a Phase, Task, or Subtask, run the following **before** building execution context or spawning the agent:

1. **Config-wiring check (existing):** Run `validate_config_wiring_for_tier` (or equivalent) for this tier — tier config present, plan_mode/subagent/interview fields wired. See **Approach B** above.
2. **Wiring and readiness checklist (new):**
   - **Does the GUI need to be updated?** For any execution-affecting setting that this tier uses: is there a corresponding control or display in the Config (or Wizard) so the user can see and change it? If a new setting was added to the backend and is used at this tier, the GUI should expose it (or document why it is internal-only).
   - **Does the backend need to be updated?** For any control or config field that the user can set in the GUI: is it read and applied in the execution path for this tier? If the GUI has a setting that should affect this tier but the backend does not use it, treat as "built but not wired" and fail or warn per policy.
   - **Do these steps make sense?** For this tier, is the sequence of operations (load config → select subagents → build request → run) consistent with the plan and with the config schema? For example: if subagents are enabled for this tier, is the subagent list actually derived from config and not hardcoded?
   - **Gaps or potential issues:** Are there known gaps (e.g. missing persistence, missing validation, platform-specific limitations) that could affect this tier? Optionally run a lightweight "gap check" (e.g. list of known gaps per tier type) and log or warn so operators see them.

**Implementation:** These can be part of the same validation module (e.g. `config_wiring.rs`) or a separate "readiness" step. Entry point could be `verify_tier_start(tier_type, config, context) -> Result<(), StartVerificationError>` that (1) calls the existing config-wiring validator and (2) runs the wiring/readiness checklist above. If any item fails (e.g. GUI missing for a backend setting), fail fast or warn according to project policy.

### End-of-phase / end-of-task / end-of-subtask verification

When the orchestrator **completes** a Phase, Task, or Subtask (e.g. all iterations or sub-items done, acceptance criteria about to be checked), run:

1. **Wiring check again (did we wire what we built?):** Re-run the same wiring/readiness questions as at start, but in "completion" context: for the work just done at this tier, are all new or touched config/settings properly wired (GUI ↔ backend ↔ execution)? This catches cases where work during the tier introduced a new setting or UI that was not yet connected.
2. **Acceptance criteria (existing):** Run the existing verification gate (e.g. criteria from PRD, command/file/regex checks). This remains the "did we meet the spec?" check.
3. **Quality verification (new):** Beyond acceptance criteria, **review the code (or artifacts) produced at this tier** to ensure the work was done well — not just "does it pass the gate?" but "is it maintainable, correct, and aligned with project standards?" Both of the following are **required** (no human review; agent-driven only):
   - **Structured code review by reviewer subagent (required, not optional):** Run a dedicated reviewer subagent (e.g. `code-reviewer`) at end-of-phase/task/subtask. It inspects the diff or artifacts and outputs pass/fail + feedback. There is no path that skips this. Do **not** use human review.
   - **Quality criteria in the gate (required as well):** Extend the verification gate for this tier to include automated quality items (e.g. "no new clippy warnings," "new code has tests," "no TODOs without tickets"). Linters, formatters, test coverage delta, and security scanners run on changed files for this tier and fail or warn if below threshold.

**Implementation:** End verification can live in the same place as the existing gate (e.g. after `check_phase_completion` or task/subtask completion). Add a function e.g. `verify_tier_end(tier_type, outcome, diff_or_artifacts, config) -> Result<(), EndVerificationError>` that (1) re-runs wiring/readiness for the completed tier, (2) runs acceptance criteria (or delegates to existing gate), (3) runs quality verification. If quality fails, the plan should define whether the tier is marked "incomplete" (rework) or "complete with warnings" (log and proceed).

### Summary table — start vs end, what runs when

| Boundary | When | Config-wiring | Wiring/readiness (GUI? backend? steps? gaps?) | Acceptance criteria | Quality verification |
|----------|------|----------------|-----------------------------------------------|--------------------|------------------------|
| **Start Phase** | Enter phase | Yes | Yes | — | — |
| **Start Task** | Enter task | Yes | Yes | — | — |
| **Start Subtask** | Enter subtask | Yes | Yes | — | — |
| **Start Iteration** | Enter iteration | Yes | (optional; can defer to tier) | — | — |
| **End Phase** | Phase complete | — | Yes (re-check) | Yes (gate) | Yes (code/artifact review) |
| **End Task** | Task complete | — | Yes (re-check) | Yes (gate) | Yes (code/artifact review) |
| **End Subtask** | Subtask complete | — | Yes (re-check) | Yes (gate) | Yes (code/artifact review) |

### Gaps and potential issues in start/end verification

**Gaps:**

- **Definition of "quality" per tier:** The plan does not yet define a single canonical "quality checklist" (e.g. clippy, tests, coverage, code-review checklist). Implementers should add a small spec or table: for Phase/Task/Subtask, what quality checks run at end? (e.g. Phase: doc quality; Task: design doc; Subtask: code + tests + linter.)
- **Who runs quality review in agent-driven runs:** The reviewer subagent runs in **all three** situations: (1) **always** at end-of-tier, (2) **on retry** when the tier is retried after failure, and (3) **when quality gate fails** (re-run reviewer as part of the feedback loop). There is no scenario that skips the reviewer; it is required for every completion or retry.
- **Readiness checklist source of truth:** The questions "Does GUI need to be updated? Does backend need to be updated?" require a mapping from "execution-affecting settings" to "GUI controls" and "backend usage." That mapping could live in code (e.g. a static list per tier), in the plan, or in a small config. Without it, the readiness step is heuristic or manual.
- **Interview flow:** The interview orchestrator has its own phases (Scope, Architecture, UX, …). Start/end verification for **interview phases** should mirror this (start: wiring + readiness; end: wiring re-check + acceptance + quality for interview artifacts). The interview plan (`interview-subagent-integration.md`) should reference this section and define interview-phase-specific quality criteria (e.g. document completeness, requirement clarity).

**Potential issues:**

- **Quality over performance:** Quality of verification is paramount. Do not prioritize speed or "cheap" checks over completeness and correctness. Run full wiring, readiness, acceptance, and quality checks (including reviewer subagent and gate criteria) at start and end of each tier. Scope quality checks to changed files or this tier's artifacts to stay practical, but do not skip or weaken verification for performance reasons.
- **Unrelated failures and who addresses them:** Automated quality checks (linters, coverage) can fail for reasons unrelated to this tier's work (e.g. pre-existing tech debt). **The parent-tier orchestrator** is responsible for addressing these: when a Subtask fails due to an unrelated issue, the Task-level orchestrator decides (retry, assign a different subagent such as a tech-debt fixer, escalate to Phase level). When a Task fails, the Phase-level orchestrator decides. When a Phase fails, the top-level orchestrator escalates to the user. Unrelated failures must be addressed by someone; they cannot be silently bypassed. Tier-scoped checks (e.g. "no new warnings in this subtask's files") reduce unrelated failures but do not eliminate them; the parent-tier escalation flow handles what remains.
- **Feedback loop:** When end verification fails (acceptance or quality), the agent or user needs clear feedback (what failed, which file/criterion, suggested fix). Integrate with the existing "incomplete task + feedback" flow (e.g. prepend feedback to task file, re-run iteration) so rework is guided.
- **Consistency with existing gates:** The codebase may already have verification gates between tiers. Start/end verification should **complement** them: start = before work; end = after work (gate + quality). Ensure we do not duplicate gate logic; the "acceptance criteria" at end can call the existing gate.

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection

## Next Steps

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
- **What to add:** (1) Read `enable_tier_subagents` and subagent config from the same config source as tier config (e.g. from run config or GuiConfig). (2) When executing a tier, if subagents enabled: call `SubagentSelector::select_for_tier`, apply `tier_overrides` (replace if non-empty, else use selected list), filter `disabled_subagents`, add `required_subagents`. (3) For each subagent name, build an `ExecutionRequest` (prompt, model, **plan_mode from tier_config**, etc.) and run via the existing platform runner (same path as non-subagent iterations). (4) `build_subagent_invocation` and `execute_with_subagent` can be methods that take `tier_config` (for plan_mode and platform/model) and call the runner. Platform/model: use `tier_config_for(tier_node.tier_type).platform` and `.model` (no separate get_platform_for_tier needed if you use tier_config_for).

### Phase 4: Error Pattern Detection

- **Where:** In the orchestrator or in a small helper that parses iteration output (e.g. stderr/stdout). Update `TierContext.has_errors` or `error_patterns` from the result of the last iteration so the next selection can add debugger/security-auditor etc.
- **What:** Define how to detect “compilation error,” “test failure,” “security issue” (e.g. regex on stderr or exit codes). Keep it simple for v1 (e.g. non-zero exit + keyword in stderr).

### SubagentManager

- The plan references `SubagentManager` “from interview plan.” If that module exists, use it for whatever it provides (e.g. loading agent definitions from disk). If it does not exist, implement only what Phase 3 needs: subagent selection and invocation via the existing runner; no separate “manager” is strictly required for v1.

### Config-wiring validation (Phase / Task / Subtask / Iteration)

- **Where:** New module e.g. `src/core/config_wiring.rs` or `src/verification/config_wiring.rs` (or split: `config_wiring/orchestrator.rs` and `config_wiring/interview.rs`). The main orchestrator calls the validator from `src/core/orchestrator.rs` at each tier boundary; the interview orchestrator calls an interview-specific validator from `src/interview/orchestrator.rs` at phase (and any sub-tier) start.
- **What:** Implement `validate_config_wiring_for_tier(tier_type, config_snapshot, context) -> Result<(), WiringError>` (or equivalent) that checks: for **Phase** — phase tier config present, plan_mode/orchestrator flags applied, interview config fields present when in interview run; for **Task** — task tier config present, subagent config present and applied; for **Subtask** — subtask tier config present, subagent list from config; for **Iteration** — iteration tier config present, request built from tier config. Fail fast when required config is missing; warn when a GUI/file field is not present in execution config. See **"Avoiding Built but Not Wired"** in this plan for the full table and fail vs warn policy.
- **When called:** Immediately before the orchestrator builds execution context or spawns the agent for that tier (i.e. at Phase start, Task start, Subtask start, Iteration start). Do not skip validation for "fast path" or tests unless explicitly gated (e.g. env var to disable for a specific test).

### Start and end verification (wiring + readiness + quality)

- **Where:** Same verification module as config-wiring (e.g. `src/verification/` or `src/core/`) or a dedicated `tier_verification.rs`. The main orchestrator calls `verify_tier_start` when entering a Phase/Task/Subtask (after or as part of config-wiring) and `verify_tier_end` when completing a Phase/Task/Subtask (after acceptance gate; quality step can be part of gate or separate).
- **What:** Start: config-wiring (existing) + wiring/readiness checklist (GUI updated? backend updated? steps make sense? known gaps?). End: wiring re-check + existing acceptance gate + quality verification. Quality verification is **both** (1) required reviewer subagent (code-reviewer) at end-of-tier, on retry, and when gate fails; (2) gate criteria (clippy, tests, etc.). Parent-tier orchestrator addresses unrelated failures. See **"Start and End Verification at Phase, Task, and Subtask"** for the table and gaps. Define per-tier quality checklist (e.g. Phase: docs; Task: design; Subtask: code + tests + clippy) in code or config.
- **When called:** Start at Phase/Task/Subtask entry; end at Phase/Task/Subtask completion (before marking tier complete). Iteration can use tier-level checks only (no separate iteration start/end verification unless needed).

### Considerations #6 (Subagent availability / files)

- “Check if subagent files exist before selection” is optional for v1. Cursor and other platforms may resolve subagent names internally (e.g. built-in or workspace config). If we later support custom agent files (e.g. under `.cursor/agents/` or similar), add a check then; for now, treat the canonical list as valid and let the platform CLI fail if a name is unsupported.

---

## Parallel Execution & Subagent Integration

### Current Parallel Execution Capabilities

The orchestrator already supports parallel execution of subtasks:

1. **Dependency Analysis**: Uses `DependencyAnalyzer` with Kahn's topological sort to build execution levels
2. **Parallel Executor**: Executes subtasks concurrently within dependency levels
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
            
            // Select subagents for THIS subtask (independent of others)
            let subagent_names = self.subagent_selector.select_for_tier(
                TierType::Subtask,
                &tier_context,
            );
            
            // Execute with selected subagents
            self.execute_tier_with_subagents(&tier_node, &tier_context, &subagent_names).await
        })).await;
        
        // ... cleanup ...
    }
}
```

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
    /// Select subagents with dependency context
    pub fn select_with_dependency_context(
        &self,
        tier_node: &TierNode,
        completed_dependencies: &[TierNode],
        tier_context: &TierContext,
    ) -> Vec<String> {
        let mut subagents = self.select_for_tier(tier_node.tier_type, tier_context);
        
        // Inherit language/domain from completed dependencies
        for dep in completed_dependencies {
            if let Some(dep_context) = self.get_tier_context(dep) {
                // Inherit language if not already set
                if tier_context.primary_language.is_none() {
                    if let Some(lang) = &dep_context.primary_language {
                        if let Some(subagent) = self.language_to_subagent(lang) {
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

### Handling Concurrent Subagent Execution

When multiple subagents run in parallel:

1. **Worktree Isolation**: Each subtask has its own worktree, so subagents don't interfere
2. **Independent Selection**: Each subtask selects subagents independently based on its own context
3. **Resource Management**: Platform runners handle concurrent invocations
4. **Context Sharing**: Completed subtasks share results via dependency chain, not direct subagent communication

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

```rust
// src/core/subagent_selector.rs (additions)

pub struct SubagentConflictDetector;

impl SubagentConflictDetector {
    /// Check for potential conflicts between parallel subagents
    pub fn detect_conflicts(
        &self,
        subagent_groups: &[Vec<String>],
        tier_contexts: &[TierContext],
    ) -> Vec<Conflict> {
        let mut conflicts = Vec::new();
        
        // Check for overlapping file modifications
        for (i, context_a) in tier_contexts.iter().enumerate() {
            for (j, context_b) in tier_contexts.iter().enumerate().skip(i + 1) {
                if self.files_overlap(context_a, context_b) {
                    conflicts.push(Conflict {
                        type_: ConflictType::FileOverlap,
                        subtask_a: i,
                        subtask_b: j,
                        files: self.get_overlapping_files(context_a, context_b),
                    });
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
    
    fn files_overlap(&self, context_a: &TierContext, context_b: &TierContext) -> bool {
        // Check if subtasks modify overlapping files
        // This would require tracking file modifications per subtask
        false // Placeholder
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

```yaml
# .puppet-master/config.yaml (additions)

orchestrator:
  enableParallelExecution: true
  
  parallelConfig:
    maxConcurrent: 3
    continueOnFailure: false
    taskTimeoutSecs: 3600
  
  # Subagent-specific parallel settings
  subagentParallelConfig:
    # Allow different subagents to run in parallel
    allowParallelSubagents: true
    
    # Maximum concurrent subagent invocations per platform
    maxConcurrentPerPlatform:
      cursor: 3
      codex: 2
      claude: 3
      gemini: 2
      copilot: 2
    
    # Conflict detection
    detectConflicts: true
    failOnConflict: false  # Warn but continue
    
    # Context inheritance from dependencies
    inheritFromDependencies: true
    inheritLanguage: true
    inheritDomain: true
```

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

### Overview

Each platform supports various extensibility mechanisms (hooks, extensions, plugins, skills, SDKs) that can significantly enhance subagent integration. These capabilities are evolving rapidly and offer powerful ways to customize subagent behavior, add context, validate actions, and orchestrate multi-agent workflows.

### Cursor: Skills, Plugins, Hooks, MCP Servers

**Skills** (`SKILL.md` files):
- **Location**: `.cursor/skills/`, `~/.cursor/skills/`, `.claude/skills/`, `.codex/skills/`
- **Use Case**: Package subagent-specific knowledge and workflows
- **Integration**: Skills can be automatically invoked by agents when relevant
- **Example**: Create a `rust-subagent-skill` that provides Rust-specific context

**Plugins** (Marketplace):
- **Location**: `.cursor/plugins/` or installed via marketplace
- **Components**: Skills, subagents, MCP servers, hooks, rules
- **Use Case**: Package complete subagent configurations for distribution
- **Integration**: Plugins can include subagent definitions and hooks to manage them

**Hooks**:
- **Events**: `SessionStart`, `PreToolUse`, `PostToolUse`, `SubagentStart`, `SubagentStop`
- **Use Case**: Intercept subagent invocations, add context, validate actions
- **Example**: Hook on `SubagentStart` to inject project-specific context

**MCP Servers**:
- **Use Case**: Connect Cursor to external tools that subagents can use
- **Integration**: Subagents can leverage MCP tools for specialized tasks

**Implementation Example:**
```rust
// Create a Cursor skill for subagent context
// .cursor/skills/rust-subagent-context/SKILL.md
---
name: rust-subagent-context
description: Provides Rust-specific context for rust-engineer subagent
---

When the rust-engineer subagent is invoked:
1. Load Cargo.toml and analyze dependencies
2. Check for unsafe code patterns
3. Review clippy configuration
4. Provide ownership pattern guidance
```

### Codex: SDK, MCP Server Mode, Hooks, Skills

**Agents SDK** (`@openai/codex-sdk`):
- **Capability**: Programmatic orchestration of Codex sessions
- **Use Case**: Build custom multi-agent workflows with subagents
- **Integration**: Use SDK to invoke Codex with subagent configurations
- **Example**: Orchestrate multiple Codex sessions as subagents

**MCP Server Mode** (`codex mcp-server`):
- **Tools**: `codex` (start session), `codex-reply` (continue session)
- **Use Case**: Expose Codex as a tool that other agents can invoke
- **Integration**: Puppet Master can invoke Codex subagents via MCP
- **Benefits**: Deterministic, reviewable workflows with full traces

**Hooks**:
- **Location**: `~/.codex/config.toml` or project-level config
- **Events**: Similar to Claude Code hooks
- **Use Case**: Intercept subagent invocations, add validation

**Skills**:
- **Location**: `.codex/skills/`
- **Use Case**: Package subagent-specific knowledge

**Implementation Example:**
```rust
// Use Codex SDK for programmatic subagent orchestration
use codex_sdk::CodexClient;

async fn invoke_codex_subagent_via_sdk(
    subagent_name: &str,
    task: &str,
) -> Result<String> {
    let client = CodexClient::new()?;
    
    // Configure Codex session with subagent context
    let session = client.create_session(CodexConfig {
        prompt: format!("Use {} subagent to: {}", subagent_name, task),
        model: Some("gpt-5".to_string()),
        sandbox: Some("workspace-write".to_string()),
        approval_policy: Some("never".to_string()),
        // ... other config
    }).await?;
    
    Ok(session.thread_id)
}

// Or use Codex as MCP server
// codex mcp-server exposes 'codex' and 'codex-reply' tools
```

### Claude Code: Plugins, Agents, Hooks, Agent SDK

**Plugins**:
- **Components**: Skills, agents (subagents), hooks, MCP servers, commands
- **Location**: `.claude-plugin/plugin.json` + component directories
- **Use Case**: Package complete subagent configurations
- **Distribution**: Via marketplaces or GitHub repos
- **Integration**: Plugins can define custom subagents and hooks to manage them

**Agents** (Subagents):
- **Location**: `.claude/agents/*.md` with YAML frontmatter
- **Capabilities**: Custom prompts, tools, models, hooks
- **Use Case**: Define specialized subagents for specific tasks
- **Integration**: Automatically invoked when task matches description

**Hooks**:
- **Events**: `SubagentStart`, `SubagentStop`, `PreToolUse`, `PostToolUse`, `TaskCompleted`
- **Types**: Command, prompt, agent hooks
- **Use Case**: Intercept subagent lifecycle, add context, validate actions
- **Integration**: Hooks can inject context into subagents or block actions

**Agent SDK** (TypeScript/Python):
- **Capability**: Programmatic agent orchestration
- **Use Case**: Build custom multi-agent workflows
- **Integration**: Use SDK to programmatically invoke subagents

**Implementation Example:**
```rust
// Define a Claude Code subagent with hooks
// .claude/agents/rust-engineer.md
---
name: rust-engineer
description: Expert Rust developer
tools: Read, Write, Edit, Bash, Glob, Grep
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "$CLAUDE_PROJECT_DIR/.claude/hooks/rust-safety-check.sh"
---

// Hook to validate Rust commands
// .claude/hooks/rust-safety-check.sh
#!/bin/bash
COMMAND=$(jq -r '.tool_input.command' < /dev/stdin)

if echo "$COMMAND" | grep -q 'unsafe'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: "Unsafe Rust code detected - review required"
    }
  }'
else
  exit 0
fi
```

### Gemini: Extensions, Hooks, MCP Servers, Skills

**Extensions**:
- **Components**: Prompts, MCP servers, custom commands, hooks, sub-agents, agent skills
- **Installation**: `gemini extensions install <github-repo-url>`
- **Use Case**: Package complete subagent configurations
- **Distribution**: Via GitHub repositories
- **Integration**: Extensions can define custom subagents and hooks

**Hooks**:
- **Events**: `SessionStart`, `BeforeAgent`, `BeforeTool`, `AfterTool`, `BeforeModel`, `AfterModel`
- **Use Case**: Intercept subagent invocations, add context, validate actions
- **Integration**: Hooks can filter tools, modify prompts, block actions

**MCP Servers**:
- **Transport**: HTTP, SSE, Stdio
- **Use Case**: Connect Gemini to external tools for subagents
- **Integration**: Subagents can use MCP tools

**Skills**:
- **Location**: Packaged in extensions
- **Use Case**: Subagent-specific knowledge

**Implementation Example:**
```json
// Gemini extension with subagent hooks
// .gemini/extensions/rust-subagent/hooks.json
{
  "hooks": {
    "BeforeTool": [
      {
        "matcher": "write_file|replace",
        "hooks": [
          {
            "name": "rust-safety-check",
            "type": "command",
            "command": "$GEMINI_PROJECT_DIR/.gemini/hooks/rust-validate.sh",
            "timeout": 5000
          }
        ]
      }
    ]
  }
}
```

### GitHub Copilot: Skills, SDK, Extensions

**Skills**:
- **Location**: `.github/skills/` (project), `~/.copilot/skills/` (user)
- **Format**: `SKILL.md` with YAML frontmatter
- **Use Case**: Package subagent-specific knowledge
- **Integration**: Skills modify Copilot's behavior for specialized tasks

**SDK** (Node.js/TypeScript, Python, Go, .NET):
- **Capability**: Programmatic Copilot agent integration
- **Use Case**: Build custom workflows with Copilot subagents
- **Integration**: Use SDK to invoke Copilot with subagent configurations

**Extensions**:
- **Location**: GitHub repositories
- **Use Case**: Package skills and custom configurations
- **Distribution**: Via GitHub

**Implementation Example:**
```rust
// Use Copilot SDK for programmatic subagent invocation
use copilot_sdk::CopilotClient;

async fn invoke_copilot_subagent_via_sdk(
    subagent_name: &str,
    task: &str,
) -> Result<String> {
    let client = CopilotClient::new()?;
    
    // Invoke Copilot with subagent context
    let response = client.execute(CopilotRequest {
        prompt: format!("/agent {} {}", subagent_name, task),
        allow_all_tools: true,
        // ... other config
    }).await?;
    
    Ok(response.content)
}
```

## Leveraging Platform Capabilities for Subagent Integration

### Strategy 1: Platform-Specific Subagent Packages

Create platform-specific packages that define subagents and their configurations:

**Cursor Plugin:**
```
.cursor/plugins/rust-subagents/
├── .cursor-plugin/
│   └── plugin.json
├── agents/
│   └── rust-engineer.md
└── hooks/
    └── hooks.json  # Hooks to manage rust-engineer subagent
```

**Claude Code Plugin:**
```
.claude-plugin/
└── plugin.json
agents/
└── rust-engineer.md
hooks/
└── hooks.json
```

**Gemini Extension:**
```
.gemini/extensions/rust-subagents/
├── agents/
│   └── rust-engineer.md
└── hooks/
    └── hooks.json
```

### Strategy 2: Hooks for Subagent Lifecycle Management

Use hooks to intercept and enhance subagent behavior:

**Common Hook Patterns:**

1. **SubagentStart Hook**: Inject project context
```json
{
  "hooks": {
    "SubagentStart": [
      {
        "matcher": "rust-engineer",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/inject-rust-context.sh"
          }
        ]
      }
    ]
  }
}
```

2. **PreToolUse Hook**: Validate subagent actions
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "agent",
            "prompt": "Validate this Bash command for Rust project safety: $ARGUMENTS"
          }
        ]
      }
    ]
  }
}
```

3. **SubagentStop Hook**: Quality gates
```json
{
  "hooks": {
    "SubagentStop": [
      {
        "matcher": "rust-engineer",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/rust-quality-gate.sh"
          }
        ]
      }
    ]
  }
}
```

### Strategy 3: SDK-Based Orchestration

Use platform SDKs for programmatic subagent control:

**Codex SDK Multi-Agent Workflow:**
```rust
// Use Codex SDK to orchestrate multiple subagents
use codex_sdk::CodexClient;

pub struct CodexSubagentOrchestrator {
    client: CodexClient,
}

impl CodexSubagentOrchestrator {
    async fn execute_with_subagents(
        &self,
        subagents: Vec<String>,
        task: &str,
    ) -> Result<()> {
        // Create multiple Codex sessions as subagents
        let mut sessions = Vec::new();
        
        for subagent_name in subagents {
            let session = self.client.create_session(CodexConfig {
                prompt: format!("As {}, {}", subagent_name, task),
                // ... config
            }).await?;
            sessions.push(session);
        }
        
        // Wait for all subagents to complete
        // Merge results
        Ok(())
    }
}
```

**Copilot SDK Integration:**
```rust
// Use Copilot SDK for subagent invocation
use copilot_sdk::CopilotClient;

pub struct CopilotSubagentInvoker {
    client: CopilotClient,
}

impl CopilotSubagentInvoker {
    async fn invoke_fleet(
        &self,
        task: &str,
    ) -> Result<String> {
        self.client.execute(CopilotRequest {
            prompt: format!("/fleet {}", task),
            allow_all_tools: true,
        }).await
    }
    
    async fn invoke_subagent(
        &self,
        subagent_name: &str,
        task: &str,
    ) -> Result<String> {
        self.client.execute(CopilotRequest {
            prompt: format!("/agent {} {}", subagent_name, task),
            allow_all_tools: true,
        }).await
    }
}
```

### Strategy 4: MCP Server Integration

Use MCP servers to expose subagent capabilities:

**Codex as MCP Server:**
```rust
// Run Codex as MCP server, then invoke via MCP tools
// This enables deterministic, traceable workflows

pub async fn invoke_codex_via_mcp(
    mcp_client: &McpClient,
    subagent_name: &str,
    task: &str,
) -> Result<String> {
    let result = mcp_client.call_tool("codex", json!({
        "prompt": format!("As {}, {}", subagent_name, task),
        "sandbox": "workspace-write",
        "approval-policy": "never",
    })).await?;
    
    Ok(result.get("threadId").unwrap().as_str().unwrap().to_string())
}
```

### Strategy 5: Skills for Subagent Context

Create skills that provide subagent-specific knowledge:

**Rust Subagent Skill:**
```markdown
---
name: rust-subagent-context
description: Provides Rust-specific context for rust-engineer subagent
---

When rust-engineer subagent is active:
1. Load Cargo.toml and analyze dependencies
2. Check for unsafe code usage
3. Review clippy configuration
4. Provide ownership pattern guidance
5. Check for common Rust pitfalls
```

## Updated Implementation Architecture

### Platform Capability Manager

```rust
// src/core/platform_capability_manager.rs

pub struct PlatformCapabilityManager {
    cursor_skills: Vec<SkillInfo>,
    claude_plugins: Vec<PluginInfo>,
    gemini_extensions: Vec<ExtensionInfo>,
    codex_sdk: Option<CodexSdkClient>,
    copilot_sdk: Option<CopilotSdkClient>,
}

impl PlatformCapabilityManager {
    /// Discover platform-specific capabilities
    pub fn discover_capabilities(&self, platform: Platform) -> Result<Capabilities> {
        match platform {
            Platform::Cursor => self.discover_cursor_capabilities(),
            Platform::Claude => self.discover_claude_capabilities(),
            Platform::Gemini => self.discover_gemini_capabilities(),
            Platform::Codex => self.discover_codex_capabilities(),
            Platform::Copilot => self.discover_copilot_capabilities(),
        }
    }
    
    /// Install platform-specific subagent package
    pub fn install_subagent_package(
        &self,
        platform: Platform,
        package: &SubagentPackage,
    ) -> Result<()> {
        match platform {
            Platform::Cursor => self.install_cursor_plugin(package),
            Platform::Claude => self.install_claude_plugin(package),
            Platform::Gemini => self.install_gemini_extension(package),
            _ => Ok(()), // Codex/Copilot use SDK or built-in
        }
    }
    
    /// Configure hooks for subagent lifecycle
    pub fn configure_subagent_hooks(
        &self,
        platform: Platform,
        subagent_name: &str,
        hooks: &SubagentHooks,
    ) -> Result<()> {
        match platform {
            Platform::Cursor => self.configure_cursor_hooks(subagent_name, hooks),
            Platform::Claude => self.configure_claude_hooks(subagent_name, hooks),
            Platform::Gemini => self.configure_gemini_hooks(subagent_name, hooks),
            _ => Ok(()),
        }
    }
}
```

### Enhanced Subagent Invoker

```rust
// src/core/subagent_invoker.rs (enhanced)

impl SubagentInvoker {
    /// Invoke subagent using platform-specific capabilities
    pub async fn invoke_with_capabilities(
        &self,
        platform: Platform,
        subagent_name: &str,
        task: &str,
        capabilities: &PlatformCapabilities,
    ) -> Result<String> {
        match platform {
            Platform::Codex if capabilities.has_sdk => {
                // Use Codex SDK for programmatic control
                self.invoke_via_codex_sdk(subagent_name, task).await
            }
            Platform::Codex if capabilities.has_mcp_server => {
                // Use Codex MCP server
                self.invoke_via_mcp(subagent_name, task).await
            }
            Platform::Copilot if capabilities.has_sdk => {
                // Use Copilot SDK
                self.invoke_via_copilot_sdk(subagent_name, task).await
            }
            Platform::Claude if capabilities.has_agent_sdk => {
                // Use Claude Agent SDK
                self.invoke_via_claude_sdk(subagent_name, task).await
            }
            _ => {
                // Fallback to CLI invocation
                self.invoke_via_cli(platform, subagent_name, task).await
            }
        }
    }
}
```

## Benefits of Platform Capabilities

1. **Rich Context**: Hooks can inject project-specific context into subagents
2. **Validation**: Hooks can validate subagent actions before execution
3. **Quality Gates**: Hooks can enforce quality standards before subagent completion
4. **Programmatic Control**: SDKs enable deterministic, traceable workflows
5. **Packaging**: Plugins/extensions make subagent configurations shareable
6. **Lifecycle Management**: Hooks provide fine-grained control over subagent behavior
7. **Tool Integration**: MCP servers enable subagents to use external tools
8. **Knowledge Packaging**: Skills package domain-specific knowledge for subagents

## Implementation Considerations

1. **Platform Detection**: Detect which capabilities are available for each platform
2. **Fallback Strategy**: Always have CLI fallback if SDK/MCP unavailable
3. **Capability Caching**: Cache capability detection to avoid repeated checks
4. **Version Compatibility**: Check platform versions for capability support
5. **Configuration Management**: Manage platform-specific configs (hooks, plugins, etc.)
6. **Error Handling**: Gracefully handle missing capabilities
7. **Documentation**: Document which capabilities are required/optional

## Next Steps

1. **Research Latest Capabilities**: Continuously monitor platform release notes
2. **Implement Capability Detection**: Detect available hooks, SDKs, plugins
3. **Create Platform Packages**: Build platform-specific subagent packages
4. **Integrate SDKs**: Use Codex SDK and Copilot SDK for programmatic control
5. **Configure Hooks**: Set up hooks for subagent lifecycle management
6. **Test Integration**: Verify platform capabilities work with subagent system


## Ralph Loop Pattern Integration

### Overview

The [Ralph Wiggum Loop pattern](https://gist.github.com/gsemet/1ef024fc426cfc75f946302033a69812) provides a proven orchestrator pattern for autonomous task execution with quality gates. While designed for VS Code Copilot, its concepts can enhance our orchestrator subagent integration.

### Key Concepts from Ralph Loop

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
**Enhancement**: Add visual progress tracking similar to Ralph Loop

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
// Enhanced orchestrator loop with Ralph Loop patterns

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
        let subagents = self.subagent_selector.select_for_tier(
            next_task.tier_type,
            &tier_context,
        );
        
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

### Benefits of Ralph Loop Integration

1. **Better Quality Assurance**: Three-tier QA catches issues at multiple levels
2. **Clear Progress Visibility**: Visual status symbols make progress obvious
3. **Rework Prioritization**: Incomplete tasks are fixed before new work
4. **Safe Pausing**: PAUSE.md allows safe editing of tasks/progress
5. **Better Commit History**: Amended commits for rework keep history clean
6. **Phase Discipline**: Prevents jumping ahead to next phase prematurely

### Implementation Considerations

1. **Progress File Format**: Use Markdown with status symbols for readability
2. **Inspector Feedback**: Prepend feedback to task files so subagents see it first
3. **Pause File Location**: `.puppet-master/PAUSE.md` for easy access
4. **Commit Amending**: Track which commits are reworks vs new work
5. **Inspector Subagents**: Could use specialized subagents for inspection (code-reviewer, qa-expert)

### Updated Configuration

```yaml
# .puppet-master/config.yaml (additions)

orchestrator:
  # Ralph Loop enhancements
  enableRalphLoopPatterns: true
  
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

