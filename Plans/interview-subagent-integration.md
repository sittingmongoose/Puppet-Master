# Interview Feature Subagent Integration — Implementation Plan

## Plan Document Status

**This is a PLAN DOCUMENT ONLY** — No code changes have been made. This document contains:
- Subagent persona assignments for each interview phase
- Integration architecture and design
- Code changes required
- Configuration options
- Implementation examples

## Executive Summary

This plan integrates Cursor subagent personas into the interview orchestrator to enhance phase-specific expertise, improve research quality, validate answers, and generate better documentation. Each interview phase will leverage specialized subagents aligned with its domain.

## Relationship to Orchestrator Plan

This document covers the **interview flow** (multi-phase interview: Scope, Architecture, UX, Data, Security, Deployment, Performance, Testing). The **orchestrator plan** (`Plans/orchestrator-subagent-integration.md`) covers the **main run loop** (Phase → Task → Subtask → Iteration execution) and defines shared concerns: config-wiring validation, start/end verification at phase/task/subtask, and quality verification. For interview-specific start/end verification (e.g. at each interview phase boundary), mirror the orchestrator plan’s **"Start and End Verification at Phase, Task, and Subtask"** and define interview-phase quality criteria (e.g. document completeness, requirement clarity). Subagent names and platform invocation should stay consistent across both plans.

## Subagent Phase Assignments

### Phase 1: Scope & Goals
**Primary Subagent:** `product-manager`
- **Purpose:** Product strategy, roadmap planning, feature prioritization
- **Use Cases:**
  - Generate questions about target users, success criteria, MVP boundaries
  - Validate scope decisions against product best practices
  - Synthesize goals into structured requirements

### Phase 2: Architecture & Technology
**Primary Subagent:** `architect-reviewer`
- **Purpose:** System design validation, architectural patterns, technology evaluation
- **Use Cases:**
  - Generate questions about tech stack, scalability, integration patterns
  - Validate architecture decisions for scalability and maintainability
  - Review technology compatibility

### Phase 3: Product / UX
**Primary Subagent:** `ux-researcher`
- **Purpose:** User insights, usability testing, design decisions
- **Use Cases:**
  - Generate questions about user workflows, accessibility, edge cases
  - Research UX patterns and best practices
  - Validate UX decisions against user research methodologies

### Phase 4: Data & Persistence
**Primary Subagent:** `database-administrator`
- **Purpose:** Database design, data architecture, persistence strategies
- **Use Cases:**
  - Generate questions about schema design, migrations, backup strategies
  - Validate data architecture decisions
  - Ensure high availability and performance considerations

### Phase 5: Security & Secrets
**Primary Subagent:** `security-auditor`
- **Purpose:** Security assessments, compliance validation, vulnerability identification
- **Use Cases:**
  - Generate questions about authentication, authorization, encryption
  - Validate security decisions against compliance frameworks
  - Review threat models and security controls

**Secondary Subagent:** `compliance-auditor`
- **Purpose:** Regulatory frameworks, data privacy, security standards
- **Use Cases:**
  - Validate compliance requirements (GDPR, HIPAA, etc.)
  - Check data privacy implications

### Phase 6: Deployment & Environments
**Primary Subagent:** `devops-engineer`
- **Purpose:** CI/CD, infrastructure, deployment strategies
- **Use Cases:**
  - Generate questions about deployment targets, CI/CD pipelines
  - Validate deployment strategies
  - Review infrastructure automation

**Secondary Subagent:** `deployment-engineer`
- **Purpose:** CI/CD pipelines, release automation, deployment strategies
- **Use Cases:**
  - Validate blue-green/canary deployment strategies
  - Review rollback procedures

### Phase 7: Performance & Reliability
**Primary Subagent:** `performance-engineer`
- **Purpose:** Performance optimization, scalability, bottleneck identification
- **Use Cases:**
  - Generate questions about latency targets, retry logic, failover
  - Validate performance decisions
  - Review resource budgets and scalability plans

### Phase 8: Testing & Verification
**Primary Subagent:** `qa-expert`
- **Purpose:** Test strategy, quality assurance, test planning
- **Use Cases:**
  - Generate questions about test types, coverage goals, acceptance criteria
  - Validate test strategy completeness
  - Review test automation approaches

**Secondary Subagent:** `test-automator`
- **Purpose:** Test automation frameworks, CI/CD integration
- **Use Cases:**
  - Generate test automation strategies
  - Validate CI/CD integration for tests

### Cross-Phase Subagents

**Document Generation:**
- `technical-writer` — Generate phase documents, AGENTS.md, requirements
- `knowledge-synthesizer` — Cross-phase analysis, technology matrix generation

**Answer Validation:**
- `debugger` — Validate technical feasibility of answers
- `code-reviewer` — Validate technical decisions and architecture choices

**Research Operations:**
- `ux-researcher` — Web research via Browser MCP (when configured)
- `context-manager` — Manage interview state and context across phases

## Integration Architecture

### 1. Subagent Configuration

Add to `InterviewOrchestratorConfig`:

```rust
pub struct InterviewOrchestratorConfig {
    // ... existing fields ...
    
    /// Subagent configuration per phase
    pub subagent_config: Option<SubagentConfig>,
}

pub struct SubagentConfig {
    /// Enable subagents for phase-specific expertise
    pub enable_phase_subagents: bool,
    /// Enable subagents for research operations
    pub enable_research_subagents: bool,
    /// Enable subagents for answer validation
    pub enable_validation_subagents: bool,
    /// Enable subagents for document generation
    pub enable_document_subagents: bool,
    /// Map phase ID to primary subagent name
    pub phase_subagents: HashMap<String, String>,
    /// Map phase ID to secondary subagent names
    pub phase_secondary_subagents: HashMap<String, Vec<String>>,
}
```

### 2. Prompt Template Enhancement

Modify `prompt_templates.rs` to include subagent invocation instructions:

```rust
pub fn generate_system_prompt(
    config: &PromptConfig,
    phase_index: usize,
    previous_docs: &[String],
    current_phase_qa: &[super::state::InterviewQA],
    subagent_config: Option<&SubagentConfig>,
) -> String {
    // ... existing prompt generation ...
    
    // Add subagent instructions if configured
    if let Some(subagent_cfg) = subagent_config {
        if subagent_cfg.enable_phase_subagents {
            if let Some(subagent_name) = subagent_cfg.phase_subagents.get(&phase_id) {
                parts.push(format!(
                    "\n**Subagent Support:**\n\
                     You can invoke the {} subagent for specialized expertise:\n\
                     - Use `/{} <task>` to delegate research or validation tasks\n\
                     - Use `/{} validate <decision>` to validate technical decisions\n\
                     - The subagent will provide expert analysis in this domain",
                    subagent_name, subagent_name, subagent_name
                ));
            }
        }
    }
    
    // ... rest of prompt ...
}
```

### 3. Research Engine Integration

Enhance `research_engine.rs` to use subagents:

```rust
impl ResearchEngine {
    /// Performs pre-question research using a specialized subagent
    pub async fn research_pre_question_with_subagent(
        &self,
        topic: &str,
        context: &str,
        working_dir: &Path,
        subagent_name: Option<&str>,
    ) -> Result<ResearchResult> {
        let research_prompt = if let Some(subagent) = subagent_name {
            // Invoke subagent for specialized research
            format!(
                r#"/{} Research the following topic for interview preparation:

**Topic:** {}
**Context:** {}

Provide:
1. Current best practices
2. Common technologies and versions
3. Common pitfalls
4. Key considerations
5. Technology compatibility

Format as markdown with clear sections."#,
                subagent, topic, context
            )
        } else {
            self.build_pre_question_prompt(topic, context)
        };
        
        self.execute_research_ai_call(&research_prompt, working_dir).await
    }
}
```

### 4. Answer Validation Integration

Add validation methods to orchestrator:

```rust
impl InterviewOrchestrator {
    /// Validates a user answer using a specialized subagent
    pub async fn validate_answer_with_subagent(
        &self,
        question: &str,
        answer: &str,
        phase_id: &str,
    ) -> Result<ValidationResult> {
        let subagent_name = self.config.subagent_config
            .as_ref()
            .and_then(|cfg| cfg.phase_subagents.get(phase_id));
        
        if let Some(subagent) = subagent_name {
            let validation_prompt = format!(
                r#"/{} Validate this interview answer:

**Question:** {}
**Answer:** {}
**Phase:** {}

Check:
1. Technical feasibility
2. Version/compatibility
3. Potential issues
4. Best practice alignment
5. Follow-up recommendations

Provide validation report."#,
                subagent, question, answer, phase_id
            );
            
            // Execute validation via platform runner
            // ... implementation ...
        }
        
        Ok(ValidationResult::default())
    }
}
```

### 5. Document Generation Integration

Enhance document writers to use subagents:

```rust
impl DocumentWriter {
    /// Writes phase document with subagent assistance
    pub fn write_phase_document_with_subagent(
        phase: &InterviewPhaseDefinition,
        decisions: &[Decision],
        qa_history: &[InterviewQA],
        output_dir: &Path,
        phase_number: usize,
        subagent_name: Option<&str>,
    ) -> Result<PathBuf> {
        // Generate base document
        let path = Self::write_phase_document(
            phase, decisions, qa_history, output_dir, phase_number
        )?;
        
        // Enhance with subagent if configured
        if let Some(subagent) = subagent_name {
            let enhancement_prompt = format!(
                r#"/{} Review and enhance this phase document:

**Phase:** {}
**Document Path:** {}

Review the document for:
1. Completeness
2. Technical accuracy
3. Best practices
4. Missing considerations

Provide enhancement suggestions."#,
                subagent, phase.name, path.display()
            );
            
            // Execute enhancement via platform runner
            // ... implementation ...
        }
        
        Ok(path)
    }
}
```

### 5.1 AGENTS.md content: DRY Method for target projects

When the interview generates **AGENTS.md** for the **target project** (at completion, via `write_agents_md` / `generate_agents_md`), it should include a **DRY Method** section so that all agents working on that project (during orchestrator runs or later) follow reuse-first guidelines. Puppet Master uses DRY in its own codebase; the same discipline applied to target projects reduces duplication and keeps them maintainable.

**What to add to generated AGENTS.md:**

- **Section: "Technology & version constraints"** (or "Stack conventions"): Explicit, actionable rules so agents always use the versions and conventions chosen in the interview. All content is **born from the interview** (especially Architecture & Technology phase). Examples:
  - "Always use **React 18** (or the pinned version from the interview)."
  - "Always use **Pydantic v2** (e.g. pydantic>=2.5.0) and Pydantic type hints; ensure code is thoroughly documented."
  - "Pin all production dependencies to exact versions; no 'latest'."
  - "Use Rust 1.75+ (or the pinned edition/version from Architecture)."
  - Any other technology/version/convention that the interview captured (framework major version, linter/formatter version, etc.).
  - **Source:** Architecture phase decisions and Q&A; optionally the **technology matrix** (`TechnologyExtractor`) to get structured (name, version) entries. For well-known stacks (Python+Pydantic, React, Rust, etc.), the generator can add **convention templates** (e.g. "Use Pydantic v2") when that tech is detected, so agents get consistent "always use X version" guidance even if the interview didn’t spell it out word-for-word.
  - Place this section near the top (e.g. after Overview, before or as part of Architecture Notes) so agents see it early.

- **Section: "DRY Method (Reuse-First)"** (or equivalent), containing:
  - **Before writing new code:** Check existing modules, docs, and (if the project uses tagging) grep for `DRY:` (or the project’s chosen tag) in the area you’re working. Prefer reusing existing functions, components, or config over adding new ones.
  - **Single source of truth:** Do not duplicate constants, config, or spec data; centralize and reference (e.g. one config module, one place for API/base URLs, one place for schema).
  - **Tag reusable items:** When adding something that is intended for reuse, tag it so future agents can find it (e.g. `// DRY:FN:name` for functions, `// DRY:HELPER:name` for utilities, or language-appropriate convention; for a TypeScript project, JSDoc or a short comment; for Python, docstring or comment). The exact tag format can be stack-agnostic or tailored in the generator.
  - **Optional:** A short "Where to look" for this project (e.g. "Check `src/lib/` and `docs/` for existing helpers; grep for `DRY:` in the crate/module you’re editing"). If the interview has identified a catalog or index (e.g. a docs folder, a README section), reference it here.

**Implementation:**

- **Technology & version constraints:** In `agents_md_generator.rs`, add a dedicated section (e.g. "## Technology & version constraints" or "## Stack conventions") that:
  - Derives from Architecture phase: format decisions and Q&A that mention versions, frameworks, or "use X" into bullet rules (e.g. "Always use React 18", "Pin all production dependencies to exact versions").
  - Optionally use **`technology_matrix::TechnologyExtractor`** (or equivalent) to get structured `(name, version)` entries from completed phases and render them as "Always use &lt;name&gt; &lt;version&gt;" (or "Use &lt;name&gt; &lt;version&gt; or later" where appropriate).
  - **Convention templates:** When the interview has identified a well-known stack, inject standard convention lines so agents get consistent guidance even if the interview didn’t phrase them exactly (e.g. if Python + Pydantic or "data validation" → "Use Pydantic v2 (e.g. pydantic>=2.5.0); use Pydantic type hints; ensure code is thoroughly documented"; if React → "Use React 18+ (or the pinned version from Architecture)"; if Rust → "Use the Rust edition and version pinned in Architecture"). Keep templates in a small table or match in the generator (keyed by detected language/framework from Architecture phase or feature_detector).
- In the same module, add the **DRY Method** block of markdown. DRY content can be a **static template** (stack-agnostic) or **parameterized** by project type (e.g. Rust vs TypeScript vs Python) if the interview has detected or chosen a stack, so that tagging examples and "where to look" match the project.
- Place **Technology & version constraints** near the top (after Overview, before or as part of Architecture Notes); place **DRY Method** after Overview/Architecture and before or after Codebase Patterns so it is visible and part of the standard agent read.
- The interview writes AGENTS.md to **base_dir** (project root) when `generate_initial_agents_md` is true, which matches STATE_FILES (AGENTS.md at project root). Ensure that config is enabled when the goal is to seed the project with AGENTS.md including these sections (default is currently `false` in the default config).

**Gaps, potential issues, and improvements**

- **Config default:** `generate_initial_agents_md` is currently `false` in the default interview config. For the DRY section to be seeded, this flag must be true when the interview runs. Consider making it default true, or document that users must enable "Generate initial AGENTS.md" (or equivalent) so the target project gets the DRY guidelines.
- **Stack/language for parameterization:** The plan says the DRY block can be parameterized by project type. The interview does not yet pass a "project language" or "stack" into `generate_agents_md`. The Architecture phase captures tech stack and versions; that state could be passed so the generator emits language-appropriate tagging examples (e.g. Rust: `// DRY:FN:name`; Python: docstring or `# DRY:FN:name`; TypeScript: JSDoc or comment). Add an optional parameter to the generator (e.g. `project_language: Option<&str>`) and derive it from Architecture phase decisions if present.
- **Preserve DRY section when agents update AGENTS.md:** The generated DO section already says "Update AGENTS.md with learnings after significant iterations." Agents might append or edit AGENTS.md and accidentally remove or dilute the DRY section. Add a line inside the generated DRY block: "When updating AGENTS.md with learnings, keep this DRY Method section; do not remove it."
- **Projects created without the full interview:** If a project is created via the wizard only (no interview) or is an existing repo with no interview run, there will be no generated AGENTS.md and thus no DRY section. Room for improvement: (1) document that DRY-seeded AGENTS.md is only for interview-completed projects, or (2) have the wizard or start-chain add a minimal AGENTS.md with a DRY section when creating a new project, so projects still get reuse-first guidelines even without the full interview.
- **Overwrite vs. merge:** When the interview runs and `generate_initial_agents_md` is true, `write_agents_md` overwrites any existing AGENTS.md at project root. If the user had previously added custom content, it is lost. For a first-time interview this is fine; for a re-run or "regenerate docs" flow, consider a merge policy (e.g. preserve user-added sections, or prompt before overwrite). Mark as optional/future unless product requires it.
- **Catalog for target project:** The target project will not have a widget catalog or platform_specs. The DRY section can still say "check existing modules and grep for DRY: (or this project's tag) before adding new code." Optionally add: "As the project grows, maintain a short index (e.g. docs/reusable.md or a README section) listing reusable modules and where they live; check it before adding new code."
- **Technology & version constraints — convention templates:** The generator will include a small set of well-known convention templates (e.g. Pydantic v2, React 18, Rust edition) keyed by detected stack. Keep the list maintainable: document in code or in this plan which stacks get which template lines; add new templates when a technology is commonly requested (e.g. "always use TypeScript strict mode"). Avoid duplicating the same rule from both interview decisions and a template; prefer interview-sourced content when present, and use templates to fill in only when the interview implies the stack but didn’t spell out the exact line.
- **Technology & version constraints — preserve when updating:** Add a line inside the generated "Technology & version constraints" section: "When updating AGENTS.md with learnings, keep this section; do not remove it." (Same idea as the DRY section preserve rule.)
- **Stack detection for convention templates:** The plan says "when the interview has identified a well-known stack" but does not specify how. Options: (1) derive from Architecture phase Q&A text (e.g. keyword/language detection: "React", "Pydantic", "Rust"); (2) add a structured "detected_stack" or "primary_language" field to interview state populated at Architecture phase completion; (3) use feature_detector or technology_matrix categories. Decide and document so the generator has a single, clear input for template selection.
- **Wiring TechnologyExtractor into generate_agents_md:** The plan says "optionally use technology_matrix::TechnologyExtractor". Currently `generate_agents_md(project_name, completed_phases, feature_description)` does not take extracted tech entries. Either: (1) have `write_agents_md` (or the caller) call `TechnologyExtractor::extract(completed_phases)` and pass the result into `generate_agents_md` as an optional parameter, or (2) call the extractor inside `generate_agents_md` from `completed_phases`. Document the chosen wiring so "Technology & version constraints" can render structured (name, version) lines from the matrix when available.
- **Section placement:** "Technology & version constraints" is specified as "near the top (e.g. after Overview, before or as part of Architecture Notes)". For implementers: prefer **its own section** (e.g. "## Technology & version constraints") immediately after Overview and before "## Architecture Notes", so agents see version rules before detailed architecture text; avoid burying it as a subsection if the goal is visibility.

**Cross-reference:** MiscPlan (Plans/MiscPlan.md) describes target-project DRY as interview-seeded and points here for implementation.

### 5.2 DRY method when implementing interview code (Puppet Master codebase)

When implementing or changing **interview-related code** in Puppet Master (interview tab, phase UI, research engine, document generation, agents_md_generator), follow the same **DRY method** as the rest of the codebase so new UI and helpers stay consistent and discoverable.

- **Widget catalog:** Before adding new UI, check **`docs/gui-widget-catalog.md`** and use existing widgets (e.g. `styled_button`, `page_header`, `toggler`, `selectable_label`, `modal_overlay`). Interview views live in `src/views/` and should reuse widgets from `src/widgets/`.
- **Platform data:** Use **`platform_specs`** (e.g. `platform_specs::cli_binary_names`, `platform_specs::fallback_model_ids`) for any platform-specific behavior in the interview flow; do not hardcode CLI names, models, or capabilities.
- **Tagging:** Tag new reusable items with `// DRY:WIDGET:`, `// DRY:FN:`, `// DRY:DATA:`, or `// DRY:HELPER:` so they appear in grep and the catalog. If a widget does not fit, add `// UI-DRY-EXCEPTION: <reason>`.
- **After widget/catalog changes:** Run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` (warn-only).

**Cross-reference:** The orchestrator plan (**Plans/orchestrator-subagent-integration.md**) has a full **"DRY Method and GUI Widget Catalog"** section; AGENTS.md is the project-wide source for DRY rules. This subsection ensures the interview plan explicitly applies those rules to interview implementation.

## Implementation Phases

### Phase 1: Configuration & Infrastructure
1. Add `SubagentConfig` struct
2. Extend `InterviewOrchestratorConfig`
3. Add subagent configuration to GUI
4. Create subagent mapping utilities
5. **DRY (Puppet Master code):** When adding interview UI or helpers, follow DRY per §5.2 (widget catalog, platform_specs, tagging; run catalog scripts after widget changes)

### Phase 2: Prompt Integration
1. Modify `prompt_templates.rs` to include subagent instructions
2. Add subagent invocation syntax to prompts
3. Update prompt generation to pass subagent config

### Phase 3: Research Integration
1. Enhance `ResearchEngine` to use subagents
2. Update pre-question research to invoke phase-specific subagents
3. Update post-answer research to use validation subagents

### Phase 4: Validation Integration
1. Add answer validation methods to orchestrator
2. Integrate validation subagents (debugger, code-reviewer)
3. Add validation results to interview state

### Phase 5: Document Generation Integration
1. Enhance `DocumentWriter` to use technical-writer subagent
2. Use knowledge-synthesizer for technology matrix
3. Use qa-expert and test-automator for test strategy
4. **AGENTS.md — Technology & version constraints:** Add a "Technology & version constraints" (or "Stack conventions") section to generated AGENTS.md per §5.1, derived from Architecture phase and optionally technology_matrix; include convention templates for well-known stacks (e.g. Pydantic v2, React 18) when detected.
5. **AGENTS.md DRY section:** Add a DRY Method (reuse-first) section to generated AGENTS.md per §5.1 so target-project agents follow reuse-first and tag reusable items

### Phase 6: Testing & Refinement
1. Test subagent invocations for each phase
2. Validate research quality improvements
3. Measure document generation quality
4. Refine subagent prompts based on results

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

## Benefits

1. **Phase-Specific Expertise:** Each phase leverages subagents with domain expertise
2. **Better Research:** Research operations use specialized knowledge
3. **Improved Validation:** Answers validated by appropriate experts
4. **Enhanced Documentation:** Documents generated with technical writing expertise
5. **Quality Assurance:** Multiple validation layers ensure completeness

## Considerations

1. **Subagent Availability:** Ensure subagents are available in `.claude/agents/` or `.cursor/agents/`
2. **Platform Support:** Subagent invocation requires Cursor platform (agent command)
3. **Cost:** Multiple subagent invocations may increase token usage
4. **Latency:** Subagent invocations add latency to interview flow
5. **Error Handling:** Graceful fallback when subagents unavailable

## Next Steps

1. Review and approve this plan
2. Implement Phase 1 (Configuration & Infrastructure)
3. Test subagent discovery and invocation
4. Iterate on implementation phases
5. Measure quality improvements

## GUI gaps: Interview tab

The Config view has an **Interview** tab (tab index 6) bound to `InterviewGuiConfig`. The following gaps must be closed so interview behavior is controllable from the UI and correctly wired to the run.

**Already in GUI (gui_config.rs)**

- `platform`, `model`, `reasoning_level`, `backup_platforms`, `max_questions_per_phase`, `first_principles`, `output_dir`, `require_architecture_confirmation`, `generate_playwright_requirements`, `generate_initial_agents_md`, `vision_provider`.

**Gaps (add or wire)**

| Item | Current state | Action |
|------|----------------|--------|
| **min_questions_per_phase** | Not in `InterviewGuiConfig` | Add field (default e.g. 1); add number input in Interview tab; wire into `InterviewOrchestratorConfig` and use in phase-complete logic. |
| **max_questions_per_phase** | Present; single number | Add **"Unlimited"** option (e.g. checkbox or special value 0 = unlimited) so users can allow unbounded questions per phase; wire to orchestrator (phase stops when min met and either max reached or unlimited). |
| **Wiring to InterviewOrchestratorConfig** | Several GUI fields are not passed to the interview orchestrator at runtime | Per orchestrator plan Gaps: add `min_questions_per_phase`, `max_questions_per_phase` (with unlimited), `require_architecture_confirmation`, `vision_provider` to `InterviewOrchestratorConfig`; set from `gui_config.interview` in `app.rs` when starting the interview; use in phase_manager and prompt/research flows. |
| **generate_initial_agents_md** | In GUI; default in code is `true` | Ensure default and tooltip reflect §5.1: when true, generated AGENTS.md includes DRY and Technology & version constraints. Tooltip: "Generate AGENTS.md at project root with DRY method and technology/version rules from the interview." |

**Placement in Interview tab**

- Use existing widgets (e.g. `responsive_form_row`, `styled_text_input`, toggler, help_tooltip). Add a row "Min questions per phase" and "Max questions per phase" (with "Unlimited" checkbox or 0 = unlimited). Keep layout consistent with other Interview tab controls. Run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` after UI changes (DRY, per AGENTS.md).

**Cross-reference**

- MiscPlan §7.5: Cleanup/evidence UI lives in Config → Advanced; Interview tab is separate. No overlap.
- Orchestrator plan Gaps: "Interviewer Enhancements and Config Wiring" — same wiring requirement for interview config.

## Subagent File Management

### Current State
Subagent files are currently located in `.claude/agents/` directory (40 subagent persona files).

### Requirements
1. **Copy subagents to project:** Subagent files must be available in the Puppet Master project for use during interviews
2. **Platform-specific locations:** Different platforms expect subagents in different locations:
   - **Cursor**: `.cursor/agents/` or `~/.cursor/agents/`
   - **Claude Code**: `.claude/agents/` or `~/.claude/agents/`
   - **Codex**: `.codex/agents/` or `~/.codex/agents/`
   - **Gemini**: `.gemini/agents/` or `~/.gemini/agents/`
   - **GitHub Copilot**: `.github/agents/` or `~/.copilot/agents/`

### Implementation Strategy

#### 1. Subagent Discovery Module
Create `src/interview/subagent_manager.rs`:

```rust
//! Subagent file management and discovery

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use anyhow::{Result, Context};

pub struct SubagentManager {
    project_dir: PathBuf,
    subagent_cache: HashMap<String, SubagentInfo>,
}

#[derive(Debug, Clone)]
pub struct SubagentInfo {
    pub name: String,
    pub description: String,
    pub file_path: PathBuf,
    pub platform_locations: Vec<PathBuf>,
}

impl SubagentManager {
    /// Discovers subagents from source location (.claude/agents/)
    pub fn discover_subagents(source_dir: &Path) -> Result<Vec<SubagentInfo>> {
        let agents_dir = source_dir.join(".claude/agents");
        let mut subagents = Vec::new();
        
        if agents_dir.exists() {
            for entry in std::fs::read_dir(&agents_dir)? {
                let entry = entry?;
                let path = entry.path();
                
                if path.extension().and_then(|s| s.to_str()) == Some("md") {
                    if let Some(info) = Self::parse_subagent_file(&path)? {
                        subagents.push(info);
                    }
                }
            }
        }
        
        Ok(subagents)
    }
    
    /// Copies subagents to platform-specific locations in project
    pub fn copy_subagents_to_project(
        source_dir: &Path,
        project_dir: &Path,
        platforms: &[Platform],
    ) -> Result<()> {
        let subagents = Self::discover_subagents(source_dir)?;
        
        for platform in platforms {
            let target_dir = Self::platform_agents_dir(project_dir, *platform);
            std::fs::create_dir_all(&target_dir)
                .context("Failed to create platform agents directory")?;
            
            for subagent in &subagents {
                let target_path = target_dir.join(format!("{}.md", subagent.name));
                std::fs::copy(&subagent.file_path, &target_path)
                    .context("Failed to copy subagent file")?;
            }
        }
        
        Ok(())
    }
    
    fn platform_agents_dir(project_dir: &Path, platform: Platform) -> PathBuf {
        match platform {
            Platform::Cursor => project_dir.join(".cursor/agents"),
            Platform::Claude => project_dir.join(".claude/agents"),
            Platform::Codex => project_dir.join(".codex/agents"),
            Platform::Gemini => project_dir.join(".gemini/agents"),
            Platform::Copilot => project_dir.join(".github/agents"),
        }
    }
    
    fn parse_subagent_file(path: &Path) -> Result<Option<SubagentInfo>> {
        let content = std::fs::read_to_string(path)?;
        // Parse YAML frontmatter to extract name and description
        // ... implementation ...
        Ok(None) // Placeholder
    }
}
```

#### 2. Integration into Interview Orchestrator
Add subagent file management to orchestrator initialization:

```rust
impl InterviewOrchestrator {
    pub fn new(config: InterviewOrchestratorConfig) -> Result<Self> {
        // Copy subagents to project if configured
        if let Some(subagent_cfg) = &config.subagent_config {
            if subagent_cfg.enable_phase_subagents {
                SubagentManager::copy_subagents_to_project(
                    &config.base_dir,
                    &config.output_dir,
                    &[config.primary_platform.platform],
                )?;
            }
        }
        
        // ... rest of initialization ...
    }
}
```

## Platform-Specific Subagent Invocation

### Recent Release Notes (February 2026)

#### Cursor CLI (v2.5 - Feb 17, 2026)
- **Async Subagents:** Subagents can run asynchronously, parent agent continues working
- **Subagent Trees:** Subagents can spawn their own subagents
- **Performance:** Lower latency, better streaming feedback
- **Known Issue:** `/subagent-name` syntax currently broken in CLI (works in editor)

**Invocation Method:**
```bash
# Syntax: /subagent-name <task>
# Example in prompt:
"/product-manager Research target users for this feature"
```

**Implementation:**
```rust
// Cursor subagent invocation
fn invoke_cursor_subagent(
    subagent_name: &str,
    task: &str,
    platform: Platform,
) -> String {
    format!("/{} {}", subagent_name, task)
}
```

#### Codex CLI (v0.104.0 - Feb 18, 2026)
- **Protocol Updates:** Distinct approval IDs for command approvals to support multiple approvals within single shell command execution
- **App-Server v2:** Emits notifications when threads are archived/unarchived, enabling clients to react without polling
- **WebSocket Proxy:** Added `WS_PROXY`/`WSS_PROXY` environment support (including lowercase variants) for websocket proxying
- **Multi-Agent Roles:** Customizable via config (from 0.102.0)
- **MCP Server:** Codex exposed as MCP server for multi-agent workflows
- **Bug Fixes:** Reduced false-positive safety-check downgrade behavior, fixed Ctrl+C/Ctrl+D in cwd-change prompt

**Invocation Method:**
Codex uses MCP (Model Context Protocol) server tools:
- `codex` tool - Creates new Codex session
- `codex-reply` tool - Continues existing session

**Implementation:**
```rust
// Codex subagent invocation via MCP
fn invoke_codex_subagent(
    subagent_name: &str,
    task: &str,
) -> ExecutionRequest {
    // Codex subagents are invoked via MCP server tools
    // Requires running: codex mcp-server
    ExecutionRequest::new(
        Platform::Codex,
        "default".to_string(),
        format!(
            r#"Use the {} agent to: {}"#,
            subagent_name, task
        ),
        // ... working_dir ...
    )
}
```

#### Claude Code CLI (v2.1.45 - Feb 17-18, 2026)
- **Agent Teams Fix:** Fixed skills invoked by subagents appearing in main session
- **Bedrock/Vertex Support:** Fixed Agent Teams teammates failing on Bedrock, Vertex, Foundry
- **Performance:** Improved memory usage, startup performance

**Invocation Methods:**

**Method 1: --agents JSON flag (Dynamic)**
```bash
claude --agents '{
  "product-manager": {
    "description": "Product strategy expert",
    "prompt": "You are a product manager..."
  }
}' -p "Research target users"
```

**Method 2: Automatic invocation (File-based)**
Subagents defined in `.claude/agents/*.md` are automatically invoked when task matches description.

**Implementation:**
```rust
// Claude Code subagent invocation
fn invoke_claude_subagent(
    subagent_name: &str,
    task: &str,
    subagent_defs: &HashMap<String, SubagentDef>,
) -> Vec<String> {
    // Option 1: Use --agents flag with JSON
    let mut args = vec!["--agents".to_string()];
    let agents_json = serde_json::json!({
        subagent_name: subagent_defs.get(subagent_name)
    });
    args.push(agents_json.to_string());
    args.push("-p".to_string());
    args.push(format!("{}", task));
    args
    
    // Option 2: Rely on automatic invocation based on description
    // Just include subagent name in prompt naturally
}
```

#### Gemini CLI (v0.29.0 - Feb 17, 2026)
**Latest Stable:** v0.29.0 (Feb 17, 2026)  
**Preview:** v0.30.0-preview.0 (Feb 17, 2026)

- **Plan Mode:** Formalized 5-phase sequential planning workflow
- **Subagent Registration:** Fixed to ensure sub-agents are registered regardless of tools.allowed
- **Policy Engine:** Deprecated --allowed-tools and excludeTools in favor of policy engine
- **Tool Output Masking:** Enabled by default for better context management
- **Memory System:** Session-linked tool output storage and cleanup
- **Dynamic Policy Registration:** For subagents (from v0.28.0)
- **Event-Driven Scheduler:** For tool execution (from v0.28.0)

**Invocation Method:**
Subagents are exposed as **tools** to the main agent. Main agent calls tool by name.

**Requirements:**
- Must enable in `settings.json`: `{"experimental": {"enableAgents": true}}`
- Subagents defined in `.gemini/agents/*.md` or `~/.gemini/agents/*.md`

**Implementation:**
```rust
// Gemini subagent invocation
fn invoke_gemini_subagent(
    subagent_name: &str,
    task: &str,
) -> String {
    // Gemini subagents are invoked as tools
    // The main agent calls the tool by name
    // Format: Natural language mentioning the subagent
    format!(
        "Use the {} subagent to: {}",
        subagent_name, task
    )
}
```

#### GitHub Copilot CLI (v0.0.411 - Feb 17, 2026)
**Latest Stable:** v0.0.411 (Feb 17, 2026)  
**Pre-release:** v0.0.412-1 (Feb 18, 2026)

- **Fleets Feature:** `/fleet` command for parallel subagents (now available to all users in v0.0.411)
- **Delegation:** `/delegate` for background tasks
- **Custom Agents:** `/agent AGENT-NAME` for explicit invocation
- **Autopilot Mode:** Now available to all users (v0.0.411)
- **SDK APIs:** Added for plan mode, autopilot, fleet, and workspace files
- **Cross-Session Memory:** Ask about past work, files, and PRs across sessions (experimental, v0.0.412)
- **Memory Improvements:** Reduced memory usage in alt-screen mode during long sessions

**Invocation Methods:**

**Method 1: /fleet (Parallel subagents)**
```bash
copilot -p "/fleet Implement authentication system"
```

**Method 2: /delegate (Background task)**
```bash
copilot -p "/delegate Review security implementation"
```

**Method 3: /agent (Explicit invocation)**
```bash
copilot -p "/agent security-auditor Review authentication code"
```

**Implementation:**
```rust
// Copilot subagent invocation
fn invoke_copilot_subagent(
    subagent_name: &str,
    task: &str,
    invocation_type: CopilotInvocationType,
) -> String {
    match invocation_type {
        CopilotInvocationType::Fleet => {
            format!("/fleet {}", task)
        }
        CopilotInvocationType::Delegate => {
            format!("/delegate {}", task)
        }
        CopilotInvocationType::Explicit => {
            format!("/agent {} {}", subagent_name, task)
        }
    }
}

enum CopilotInvocationType {
    Fleet,      // Parallel subagents
    Delegate,   // Background task
    Explicit,   // Explicit agent name
}
```

### Platform-Specific Invocation Wrapper

Create unified interface for platform-specific invocation:

```rust
// src/interview/subagent_invoker.rs

use crate::types::Platform;

pub struct SubagentInvoker;

impl SubagentInvoker {
    /// Invokes a subagent using platform-specific syntax
    pub fn invoke_subagent(
        platform: Platform,
        subagent_name: &str,
        task: &str,
        context: &SubagentContext,
    ) -> String {
        match platform {
            Platform::Cursor => {
                // Cursor: /subagent-name syntax
                // Note: Currently broken in CLI, works in editor
                format!("/{} {}", subagent_name, task)
            }
            Platform::Codex => {
                // Codex: Natural language via MCP tools
                format!(
                    "Use the {} agent to: {}",
                    subagent_name, task
                )
            }
            Platform::Claude => {
                // Claude: Either --agents flag or automatic invocation
                if context.use_dynamic_agents {
                    // Would need to build --agents JSON flag
                    format!("Use the {} subagent to: {}", subagent_name, task)
                } else {
                    // Rely on automatic invocation from .claude/agents/
                    format!(
                        "Use the {} subagent (available in .claude/agents/) to: {}",
                        subagent_name, task
                    )
                }
            }
            Platform::Gemini => {
                // Gemini: Subagents exposed as tools
                format!(
                    "Call the {} tool to: {}",
                    subagent_name, task
                )
            }
            Platform::Copilot => {
                // Copilot: /agent, /fleet, or /delegate
                match context.copilot_invocation_type {
                    Some(CopilotInvocationType::Fleet) => {
                        format!("/fleet {}", task)
                    }
                    Some(CopilotInvocationType::Delegate) => {
                        format!("/delegate {}", task)
                    }
                    _ => {
                        format!("/agent {} {}", subagent_name, task)
                    }
                }
            }
        }
    }
}

pub struct SubagentContext {
    pub use_dynamic_agents: bool,
    pub copilot_invocation_type: Option<CopilotInvocationType>,
}

pub enum CopilotInvocationType {
    Fleet,
    Delegate,
    Explicit,
}
```

## Updated Configuration

Add platform-specific invocation settings:

```rust
pub struct SubagentConfig {
    // ... existing fields ...
    
    /// Platform-specific invocation settings
    pub platform_settings: HashMap<Platform, PlatformSubagentSettings>,
}

pub struct PlatformSubagentSettings {
    /// For Claude: Use --agents flag vs automatic invocation
    pub use_dynamic_agents: bool,
    /// For Copilot: Preferred invocation type
    pub copilot_invocation_type: Option<CopilotInvocationType>,
    /// For Gemini: Require enableAgents setting
    pub require_experimental_flag: bool,
}
```

## Updated Considerations

1. **Subagent File Management:** 
   - Copy subagents from `.claude/agents/` to platform-specific locations
   - Maintain subagent files in project for team sharing
   - Handle platform-specific file format differences

2. **Platform Support:**
   - **Cursor:** `/subagent-name` syntax (broken in CLI as of Feb 2026, works in editor)
   - **Codex:** MCP server tools or natural language
   - **Claude Code:** `--agents` JSON flag or automatic file-based invocation
   - **Gemini:** Tool-based invocation (requires `enableAgents: true`)
   - **GitHub Copilot:** `/fleet`, `/delegate`, or `/agent` commands

3. **Recent Changes (as of Feb 18, 2026):**
   - **Cursor 2.5 (Feb 17):** Async subagents, subagent trees, plugins marketplace
   - **Codex 0.104.0 (Feb 18):** Distinct approval IDs, thread archive notifications, websocket proxy support
   - **Claude Code 2.1.45 (Feb 17-18):** Agent Teams fixes, Sonnet 4.6 support, performance improvements
   - **Gemini v0.29.0 (Feb 17):** Plan mode formalization, subagent registration fixes, policy engine improvements
   - **Copilot 0.0.411 (Feb 17):** Fleets/autopilot available to all users, SDK APIs, memory improvements
   - **Note:** Versions are changing rapidly - verify latest versions before implementation

4. **Error Handling:**
   - Graceful fallback when subagents unavailable
   - Platform-specific error detection (e.g., Cursor CLI limitation)
   - Fallback to direct platform invocation without subagents

5. **Cost & Performance:**
   - Multiple subagent invocations increase token usage
   - Async subagents (Cursor 2.5) reduce latency
   - Platform-specific optimizations (e.g., Copilot fleets for parallel work)


## Platform-Specific Limitations & Workarounds

### Cursor CLI Limitation (Feb 2026)
**Issue:** `/subagent-name` syntax is currently broken in Cursor CLI (works in editor)
**Workaround Options:**
1. Use Cursor editor for subagent-enabled interviews
2. Fallback to direct platform invocation without subagents
3. Monitor Cursor releases for CLI fix

### Gemini Experimental Flag Requirement
**Issue:** Gemini requires `enableAgents: true` in settings.json
**Solution:** 
- Check for `.gemini/settings.json` existence
- Automatically add/update experimental flag if needed
- Warn user if flag cannot be set

### Codex MCP Server Requirement
**Issue:** Codex subagents require MCP server mode
**Solution:**
- Detect if `codex mcp-server` is available
- Provide clear error message if MCP server not running
- Document MCP server setup in user guide

### Claude Code Dynamic vs File-Based
**Decision:** Support both methods
- Default to file-based (simpler, more reliable)
- Option to use `--agents` JSON flag for dynamic subagents
- Configuration option to choose method

## Testing Strategy

### Subagent File Management Tests
1. Test subagent discovery from `.claude/agents/`
2. Test copying to all platform-specific locations
3. Test YAML frontmatter parsing
4. Test handling missing or malformed subagent files

### Platform-Specific Invocation Tests
1. **Cursor:** Test `/subagent-name` syntax (expect failure in CLI)
2. **Codex:** Test MCP server tool invocation
3. **Claude Code:** Test both `--agents` flag and file-based invocation
4. **Gemini:** Test tool-based invocation with `enableAgents: true`
5. **Copilot:** Test `/fleet`, `/delegate`, and `/agent` commands

### Integration Tests
1. Test subagent invocation for each phase
2. Test fallback behavior when subagents unavailable
3. Test platform failover with subagent support
4. Measure performance impact of subagent invocations

