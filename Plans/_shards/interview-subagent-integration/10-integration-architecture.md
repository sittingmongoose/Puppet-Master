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

Enhance `research_engine.rs` to use subagents with detailed error handling, retry logic, and structured output parsing.

**Normative runtime contract:**

- Research is **advisory input** to questioning and drafting; it does not directly mutate canonical project artifacts.
- Each research run emits a seglog artifact/event with at least: `research_run_id`, `phase_id`, `topic`, `persona_id`, `provider`, `model`, `citations[]`, `summary`, and `raw_output_ref`.
- Research results are cached by `(phase_id, topic_hash, context_hash)` for the lifetime of the interview run; resume reuses cached results unless the underlying context materially changed.
- If cited web research is used, the stored artifact MUST preserve inline-citation/source mapping so later prompts can quote or summarize without losing provenance.
- Failure mode is non-fatal: if research fails, the phase manager records a warning artifact and continues with reduced-context questioning.

ContractRef: ContractName:Plans/newtools.md, Primitive:Seglog, ContractName:Plans/assistant-chat-design.md

**BeforeResearch responsibilities:**

- **Determine research subagent:** Determine which research subagent to use (from phase config or fallback)
- **Build research context:** Build research context with topic, interview context, prior phase decisions, and detected frameworks
- **Check subagent availability:** Verify research subagent is available for the configured platform

**DuringResearch responsibilities:**

- **Build research prompt:** Build research prompt with subagent invocation, topic, context, and research criteria
- **Execute research:** Invoke research subagent via platform runner
- **Parse structured output:** Parse research output as structured `SubagentOutput` with research findings
- **Extract research findings:** Extract research findings from parsed output (best practices, technologies, pitfalls, considerations, compatibility)

**AfterResearch responsibilities:**

- **Persist research results:** Save research results to interview state
- **Update phase context:** Update phase context with research findings for use in questions
- **Generate research summary:** Generate research summary for injection into question prompts

**Implementation:** Extend `src/interview/research_engine.rs` with detailed research workflow.

```rust
use crate::types::subagent_output::{SubagentOutput, Finding};
use crate::platforms::PlatformRunner;
use crate::core::handoff_validation::HandoffValidator;

impl ResearchEngine {
    /// Performs pre-question research using a specialized subagent
    pub async fn research_pre_question_with_subagent(
        &self,
        topic: &str,
        context: &str,
        working_dir: &Path,
        phase_id: &str,
        subagent_name: Option<&str>,
    ) -> Result<ResearchResult> {
        // Determine research subagent
        let research_subagent = subagent_name.or_else(|| {
            self.get_research_subagent_for_phase(phase_id).ok()
        });
        
        // Build research context
        let research_context = self.build_research_context(topic, context, phase_id).await?;
        
        // Build research prompt
        let research_prompt = if let Some(subagent) = research_subagent {
            self.build_subagent_research_prompt(
                subagent,
                topic,
                context,
                &research_context,
            )?
        } else {
            self.build_pre_question_prompt(topic, context)
        };
        
        // Execute research
        let research_output = if let Some(subagent) = research_subagent {
            // Execute with subagent
            self.execute_research_with_subagent(
                subagent,
                &research_prompt,
                working_dir,
            ).await?
        } else {
            // Execute without subagent (fallback)
            self.execute_research_ai_call(&research_prompt, working_dir).await?
        };
        
        // Parse structured output
        let parsed_output = self.parse_research_output(&research_output)?;
        
        // Extract research findings
        let research_findings = self.extract_research_findings(&parsed_output)?;
        
        // Persist research results
        self.persist_research_result(phase_id, topic, &research_findings).await?;
        
        // Generate research summary
        let research_summary = self.generate_research_summary(&research_findings)?;
        
        Ok(ResearchResult {
            topic: topic.to_string(),
            findings: research_findings,
            summary: research_summary,
            raw_output: research_output,
        })
    }
    
    fn build_subagent_research_prompt(
        &self,
        subagent: &str,
        topic: &str,
        context: &str,
        research_context: &ResearchContext,
    ) -> Result<String> {
        Ok(format!(
            r#"/{} Research the following topic for interview preparation:

**Topic:** {}
**Context:** {}
**Prior Phase Decisions:** {}
**Detected Frameworks:** {}

Provide structured research output with:
1. Current best practices
2. Common technologies and versions
3. Common pitfalls
4. Key considerations
5. Technology compatibility

Format as structured JSON matching SubagentOutput format with findings categorized by type."#,
            subagent,
            topic,
            context,
            format_decisions(&research_context.prior_decisions),
            research_context.detected_frameworks.join(", ")
        ))
    }
    
    async fn execute_research_with_subagent(
        &self,
        subagent: &str,
        prompt: &str,
        working_dir: &Path,
    ) -> Result<String> {
        let platform = self.config.primary_platform.platform;
        let model = self.config.primary_platform.model.clone();
        let runner = self.get_platform_runner(platform)?;
        
        // Execute research via platform runner
        let output = runner.execute_with_subagent(
            subagent,
            prompt,
            working_dir,
        ).await?;
        
        // Validate handoff output
        let validator = HandoffValidator::new(platform)?;
        let validated_output = validator.validate_subagent_output(
            &output.stdout,
            &output.stderr,
            platform,
            0, // No retry for research (research is informational)
        ).await?;
        
        // Return task_report as research output
        Ok(validated_output.task_report)
    }
    
    fn parse_research_output(&self, output: &str) -> Result<SubagentOutput> {
        // Try to parse as structured JSON first
        if let Ok(json) = serde_json::from_str::<SubagentOutput>(output) {
            return Ok(json);
        }
        
        // Fallback: extract from text output
        self.extract_research_from_text(output)
    }
    
    fn extract_research_findings(&self, parsed_output: &SubagentOutput) -> Result<ResearchFindings> {
        // Extract research findings from SubagentOutput
        // Map findings to research categories (best practices, technologies, pitfalls, etc.)
        let mut findings = ResearchFindings::default();
        
        for finding in &parsed_output.findings {
            match finding.category.as_str() {
                "best_practices" => findings.best_practices.push(finding.description.clone()),
                "technologies" => findings.technologies.push(finding.description.clone()),
                "pitfalls" => findings.pitfalls.push(finding.description.clone()),
                "considerations" => findings.considerations.push(finding.description.clone()),
                "compatibility" => findings.compatibility.push(finding.description.clone()),
                _ => {} // Unknown category
            }
        }
        
        // Also extract from task_report if structured
        // Implementation: parse task_report for research sections
        
        Ok(findings)
    }
    
    fn generate_research_summary(&self, findings: &ResearchFindings) -> Result<String> {
        // Generate markdown summary from research findings
        let mut summary = String::new();
        
        if !findings.best_practices.is_empty() {
            summary.push_str("## Best Practices\n\n");
            for practice in &findings.best_practices {
                summary.push_str(&format!("- {}\n", practice));
            }
            summary.push_str("\n");
        }
        
        if !findings.technologies.is_empty() {
            summary.push_str("## Technologies\n\n");
            for tech in &findings.technologies {
                summary.push_str(&format!("- {}\n", tech));
            }
            summary.push_str("\n");
        }
        
        if !findings.pitfalls.is_empty() {
            summary.push_str("## Common Pitfalls\n\n");
            for pitfall in &findings.pitfalls {
                summary.push_str(&format!("- {}\n", pitfall));
            }
            summary.push_str("\n");
        }
        
        if !findings.considerations.is_empty() {
            summary.push_str("## Key Considerations\n\n");
            for consideration in &findings.considerations {
                summary.push_str(&format!("- {}\n", consideration));
            }
            summary.push_str("\n");
        }
        
        if !findings.compatibility.is_empty() {
            summary.push_str("## Technology Compatibility\n\n");
            for compat in &findings.compatibility {
                summary.push_str(&format!("- {}\n", compat));
            }
        }
        
        Ok(summary)
    }
}

#[derive(Debug, Default)]
pub struct ResearchFindings {
    pub best_practices: Vec<String>,
    pub technologies: Vec<String>,
    pub pitfalls: Vec<String>,
    pub considerations: Vec<String>,
    pub compatibility: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct ResearchResult {
    pub topic: String,
    pub findings: ResearchFindings,
    pub summary: String,
    pub raw_output: String,
}
```

**Error handling:**

- **Research subagent determination failure:** If research subagent cannot be determined, fall back to non-subagent research
- **Research execution failure:** If research execution fails, log error and return empty research result (research is informational)
- **Output parsing failure:** If output parsing fails, attempt text extraction; if that fails, return empty research result
- **Finding extraction failure:** If finding extraction fails, log warning and return partial findings

### 4. Answer Validation Integration

Add validation methods to orchestrator with detailed error handling, retry logic, and structured output parsing.

**Normative validation lifecycle:**

- Validation runs after each user answer that changes phase-completion state and again once before a phase is marked complete.
- The validator used is stage-resolved (see Persona Stage Strategy Addendum) and MUST record `requested_persona_id` and `effective_persona_id` when overrides/capability filtering change the actual runner.
- Findings are persisted as structured artifacts/events with stable IDs so the remediation loop can reopen the same issue set instead of inventing new prose-only feedback each retry.
- Critical/Major findings block phase completion. Minor/Info findings are attached to the phase summary and downstream drafting context but do not block.
- If retries are exhausted, Interview transitions the phase to `needs_review` and persists a resume checkpoint; it MUST NOT silently mark the phase complete.

ContractRef: ContractName:Plans/Personas.md, Primitive:Seglog, ContractName:Plans/chain-wizard-flexibility.md

**BeforeValidation responsibilities:**

- **Load validation subagent:** Determine validation subagent for this phase (from `SubagentConfig.phase_subagents` or fallback)
- **Build validation context:** Build validation context with question, answer, phase info, and prior phase decisions
- **Check subagent availability:** Verify validation subagent is available for the configured platform

**DuringValidation responsibilities:**

- **Build validation prompt:** Build validation prompt with subagent invocation, question, answer, and validation criteria
- **Execute validation:** Invoke validation subagent via platform runner
- **Parse structured output:** Parse validation output as structured `SubagentOutput` with findings
- **Extract findings:** Extract findings from parsed output and categorize by severity (Critical/Major/Minor/Info)
- **Apply remediation loop:** If Critical/Major findings exist, enter remediation loop (re-prompt user, re-run validation)

**AfterValidation responsibilities:**

- **Persist validation results:** Save validation results to interview state
- **Update phase status:** Update phase status based on validation results (complete, incomplete, complete with warnings)
- **Generate feedback:** Generate feedback for user if validation failed (what failed, why, how to fix)

**Implementation:** Extend `src/interview/orchestrator.rs` with detailed validation workflow.

```rust
use crate::core::remediation::RemediationLoop;
use crate::types::subagent_output::{SubagentOutput, Finding, Severity};
use crate::platforms::PlatformRunner;

impl InterviewOrchestrator {
    /// Validates a user answer using a specialized subagent
    pub async fn validate_answer_with_subagent(
        &self,
        question: &str,
        answer: &str,
        phase_id: &str,
    ) -> Result<ValidationResult> {
        // Load validation subagent
        let subagent_name = self.get_validation_subagent_for_phase(phase_id)?;
        
        if subagent_name.is_none() {
            // No validation subagent configured, skip validation
            return Ok(ValidationResult {
                passed: true,
                findings: Vec::new(),
                feedback: None,
            });
        }
        
        let subagent = subagent_name.unwrap();
        
        // Build validation context
        let validation_context = self.build_validation_context(question, answer, phase_id).await?;
        
        // Build validation prompt
        let validation_prompt = self.build_validation_prompt(
            &subagent,
            question,
            answer,
            phase_id,
            &validation_context,
        )?;
        
        // Execute validation with remediation loop
        let validation_result = self.execute_validation_with_remediation(
            &subagent,
            &validation_prompt,
            &validation_context,
        ).await?;
        
        // Persist validation results
        self.persist_validation_result(phase_id, &validation_result).await?;
        
        // Update phase status
        self.update_phase_status_from_validation(phase_id, &validation_result).await?;
        
        Ok(validation_result)
    }
    
    async fn execute_validation_with_remediation(
        &self,
        subagent: &str,
        prompt: &str,
        context: &ValidationContext,
    ) -> Result<ValidationResult> {
        let mut remediation_loop = RemediationLoop::new(
            max_retries: 3,
            retry_on_severities: vec![Severity::Critical, Severity::Major],
        );
        
        loop {
            // Execute validation
            let platform = self.config.primary_platform.platform;
            let model = self.config.primary_platform.model.clone();
            let runner = self.get_platform_runner(platform)?;
            
            let validation_output = runner.execute_with_subagent(
                subagent,
                prompt,
                &self.config.working_directory,
            ).await?;
            
            // Parse structured output
            let parsed_output = self.parse_validation_output(&validation_output.stdout)?;
            
            // Extract findings
            let findings = parsed_output.findings;
            
            // Filter Critical/Major findings
            let critical_major_findings: Vec<_> = findings.iter()
                .filter(|f| matches!(f.severity, Severity::Critical | Severity::Major))
                .collect();
            
            // Check if remediation needed
            if critical_major_findings.is_empty() {
                // No Critical/Major findings, validation passed
                return Ok(ValidationResult {
                    passed: true,
                    findings: findings.clone(),
                    feedback: None,
                });
            }
            
            // Check remediation loop
            match remediation_loop.should_retry(&critical_major_findings) {
                Ok(true) => {
                    // Retry validation with updated prompt (include findings)
                    let updated_prompt = self.build_remediation_prompt(
                        prompt,
                        &critical_major_findings,
                    )?;
                    // Continue loop with updated prompt
                    continue;
                }
                Ok(false) => {
                    // Max retries reached, return failure
                    return Ok(ValidationResult {
                        passed: false,
                        findings: findings.clone(),
                        feedback: Some(self.generate_validation_feedback(&findings)?),
                    });
                }
                Err(e) => {
                    return Err(anyhow!("Remediation loop error: {}", e));
                }
            }
        }
    }
    
    fn parse_validation_output(&self, stdout: &str) -> Result<SubagentOutput> {
        // Try to parse as structured JSON first
        if let Ok(json) = serde_json::from_str::<SubagentOutput>(stdout) {
            return Ok(json);
        }
        
        // Fallback: extract from text output
        // Look for structured markers or parse text format
        // Implementation depends on platform output format
        self.extract_validation_from_text(stdout)
    }
    
    fn build_remediation_prompt(
        &self,
        original_prompt: &str,
        findings: &[&Finding],
    ) -> Result<String> {
        let findings_text = findings.iter()
            .map(|f| format!("- [{}] {}: {}", f.severity, f.category, f.description))
            .collect::<Vec<_>>()
            .join("\n");
        
        Ok(format!(
            "{}\n\n**Previous Validation Found Critical/Major Issues:**\n{}\n\nPlease revise your answer to address these issues.",
            original_prompt,
            findings_text
        ))
    }
    
    fn generate_validation_feedback(&self, findings: &[Finding]) -> Result<String> {
        let critical_major: Vec<_> = findings.iter()
            .filter(|f| matches!(f.severity, Severity::Critical | Severity::Major))
            .collect();
        
        if critical_major.is_empty() {
            return Ok("Validation passed with minor suggestions.".to_string());
        }
        
        let feedback = critical_major.iter()
            .map(|f| {
                format!(
                    "**{} Issue ({})**: {}\n{}\n",
                    f.severity,
                    f.category,
                    f.description,
                    f.suggestion.as_ref().map(|s| format!("Suggestion: {}", s)).unwrap_or_default()
                )
            })
            .collect::<Vec<_>>()
            .join("\n");
        
        Ok(format!(
            "Validation found {} critical/major issues:\n\n{}",
            critical_major.len(),
            feedback
        ))
    }
}

#[derive(Debug, Clone)]
pub struct ValidationResult {
    pub passed: bool,
    pub findings: Vec<Finding>,
    pub feedback: Option<String>,
}

#[derive(Debug, Clone)]
pub struct ValidationContext {
    pub question: String,
    pub answer: String,
    pub phase_id: String,
    pub prior_phase_decisions: Vec<Decision>,
    pub detected_frameworks: Vec<String>,
}
```

**Error handling:**

- **Subagent availability failure:** If validation subagent is not available, log warning and skip validation (return passed result)
- **Validation execution failure:** If validation execution fails, return `ValidationResult` with `passed: false` and error finding
- **Output parsing failure:** If output parsing fails, attempt text extraction; if that fails, return error finding
- **Remediation loop failure:** If remediation loop fails, return failure result with findings collected so far

### 5. Document Generation Integration

Enhance document writers to use subagents and crews:

**Normative document-generation contract:**

- Document generation works from Interview decisions + validated phase summaries + contract fragments; it must not independently invent contradictory project scope.
- Each generated document writes through a staging bundle first. Promotion to the canonical `.puppet-master/project/**` location happens only through the Contract Unification / validation pipeline.
- Required document-generation inventory for a successful interview-complete path is: phase summaries, final requirements context handoff, contracts fragments bundle, `plan.md`, canonical sharded `plan_graph/`, acceptance manifest, AGENTS.md (when enabled), and GUI wiring artifacts when `has_gui = true`.
- Generated artifacts MUST preserve overwrite policy metadata: `create | replace_generated | merge_user_authored`. If an artifact may overwrite user-authored content, the policy must be explicit and surfaced to the user before promotion.
- Multi-Pass Review and targeted revision operate on staged artifacts; `Accept | Reject | Edit` gates which staged bundle becomes the next provisional artifact set.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/FinalGUISpec.md

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
    
    /// Writes PRD with crew recommendations
    pub fn write_prd_with_crew_recommendations(
        phases: &[Phase],
        output_path: &Path,
        crew_manager: &CrewManager,
    ) -> Result<PathBuf> {
        // Generate base PRD
        let prd = Self::generate_prd(phases)?;
        
        // Add crew recommendations to tasks/subtasks
        for phase in phases {
            for task in &phase.tasks {
                for subtask in &task.subtasks {
                    // Analyze subtask complexity and suggest crews
                    let crew_recommendation = crew_manager.suggest_crew_for_subtask(subtask)?;
                    
                    if let Some(recommendation) = crew_recommendation {
                        subtask.crew_recommendation = Some(recommendation);
                    }
                }
            }
        }
        
        // Write PRD with crew recommendations
        Self::write_prd_json(&prd, output_path)?;
        
        Ok(output_path.to_path_buf())
    }
}
```

**Crew recommendation logic:**

```rust
impl CrewManager {
    pub fn suggest_crew_for_subtask(&self, subtask: &Subtask) -> Result<Option<CrewRecommendation>> {
        // Analyze subtask complexity
        let complexity = self.analyze_subtask_complexity(subtask)?;
        
        // Suggest crew if complexity is high or subtask requires multiple expertise areas
        if complexity.requires_multiple_expertise || complexity.estimated_hours > 4.0 {
            let suggested_subagents = self.select_subagents_for_subtask(subtask)?;
            
            return Ok(Some(CrewRecommendation {
                suggested: true,
                subagents: suggested_subagents,
                rationale: format!("Subtask requires {} expertise areas and estimated {} hours", 
                    complexity.expertise_areas.len(), complexity.estimated_hours),
                crew_template: self.find_matching_template(&suggested_subagents)?,
            }));
        }
        
        Ok(None)
    }
    
    fn analyze_subtask_complexity(&self, subtask: &Subtask) -> Result<SubtaskComplexity> {
        // Analyze subtask title, description, acceptance criteria
        // Determine: expertise areas needed, estimated complexity, coordination requirements
        // ...
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
  - **Source:** Architecture phase decisions and Q&A; optionally the **technology matrix** (`TechnologyExtractor`) to get structured (name, version) entries. For well-known stacks (Python+Pydantic, React, Rust, etc.), the generator can add **convention templates** (e.g. "Use Pydantic v2") when that tech is detected, so agents get consistent "always use X version" guidance even if the interview didn't spell it out word-for-word.
  - Place this section near the top (e.g. after Overview, before or as part of Architecture Notes) so agents see it early.

- **Section: "DRY Method (Reuse-First)"** (or equivalent), containing:
  - **Before writing new code:** Check existing modules, docs, and (if the project uses tagging) grep for `DRY:` (or the project's chosen tag) in the area you're working. Prefer reusing existing functions, components, or config over adding new ones.
  - **Single source of truth:** Do not duplicate constants, config, or spec data; centralize and reference (e.g. one config module, one place for API/base URLs, one place for schema).
  - **Tag reusable items:** When adding something that is intended for reuse, tag it so future agents can find it (e.g. `// DRY:FN:name` for functions, `// DRY:HELPER:name` for utilities, or language-appropriate convention; for a TypeScript project, JSDoc or a short comment; for Python, docstring or comment). The exact tag format can be stack-agnostic or tailored in the generator.
  - **Optional:** A short "Where to look" for this project (e.g. "Check `src/lib/` and `docs/` for existing helpers; grep for `DRY:` in the crate/module you're editing"). If the interview has identified a catalog or index (e.g. a docs folder, a README section), reference it here.

**Implementation:**

- **Technology & version constraints:** In `agents_md_generator.rs`, add a dedicated section (e.g. "## Technology & version constraints" or "## Stack conventions") that:
  - Derives from Architecture phase: format decisions and Q&A that mention versions, frameworks, or "use X" into bullet rules (e.g. "Always use React 18", "Pin all production dependencies to exact versions").
  - Optionally use **`technology_matrix::TechnologyExtractor`** (or equivalent) to get structured `(name, version)` entries from completed phases and render them as "Always use &lt;name&gt; &lt;version&gt;" (or "Use &lt;name&gt; &lt;version&gt; or later" where appropriate).
  - **Convention templates:** When the interview has identified a well-known stack, inject standard convention lines so agents get consistent guidance even if the interview didn't phrase them exactly (e.g. if Python + Pydantic or "data validation" → "Use Pydantic v2 (e.g. pydantic>=2.5.0); use Pydantic type hints; ensure code is thoroughly documented"; if React → "Use React 18+ (or the pinned version from Architecture)"; if Rust → "Use the Rust edition and version pinned in Architecture"). Keep templates in a small table or match in the generator (keyed by detected language/framework from Architecture phase or feature_detector).
- In the same module, add the **DRY Method** block of markdown. DRY content can be a **static template** (stack-agnostic) or **parameterized** by project type (e.g. Rust vs TypeScript vs Python) if the interview has detected or chosen a stack, so that tagging examples and "where to look" match the project.
- Place **Technology & version constraints** near the top (after Overview, before or as part of Architecture Notes); place **DRY Method** after Overview/Architecture and before or after Codebase Patterns so it is visible and part of the standard agent read.
- The interview writes AGENTS.md to **base_dir** (project root) when `generate_initial_agents_md` is true, which matches STATE_FILES (AGENTS.md at project root). Ensure that config is enabled when the goal is to seed the project with AGENTS.md including these sections (default is currently `false` in the default config).

**Gaps, potential issues, and improvements**

- **Config default:** `generate_initial_agents_md` is currently `false` in the default interview config. For the DRY section to be seeded, this flag must be true when the interview runs. If default remains `false`, the UI label must be exactly **Generate initial AGENTS.md** and users must explicitly enable it so the target project gets the DRY guidelines.
- **Stack/language for parameterization:** The plan says the DRY block can be parameterized by project type. The interview does not yet pass a "project language" or "stack" into `generate_agents_md`. The Architecture phase captures tech stack and versions; that state could be passed so the generator emits language-appropriate tagging examples (e.g. Rust: `// DRY:FN:name`; Python: docstring or `# DRY:FN:name`; TypeScript: JSDoc or comment). Add an optional parameter to the generator (e.g. `project_language: Option<&str>`) and derive it from Architecture phase decisions if present.
- **Preserve DRY section when agents update AGENTS.md:** The generated DO section already says "Update AGENTS.md with learnings after significant iterations." Agents might append or edit AGENTS.md and accidentally remove or dilute the DRY section. Add a line inside the generated DRY block: "When updating AGENTS.md with learnings, keep this DRY Method section; do not remove it."
- **Projects created without the full interview:** If a project is created via the wizard only (no interview) or is an existing repo with no interview run, there will be no generated AGENTS.md and thus no DRY section. Room for improvement: (1) document that DRY-seeded AGENTS.md is only for interview-completed projects, or (2) have the wizard or start-chain add a minimal AGENTS.md with a DRY section when creating a new project, so projects still get reuse-first guidelines even without the full interview.
- **Overwrite vs. merge:** When the interview runs and `generate_initial_agents_md` is true, `write_agents_md` overwrites any existing AGENTS.md at project root. If the user had previously added custom content, it is lost. For a first-time interview this is fine; for a re-run or "regenerate docs" flow, consider a merge policy (e.g. preserve user-added sections, or prompt before overwrite). Mark as optional/future unless product requires it.
- **Catalog for target project:** The target project will not have a widget catalog or platform_specs. The DRY section can still say "check existing modules and grep for DRY: (or this project's tag) before adding new code." Optionally add: "As the project grows, maintain a short index (e.g. docs/reusable.md or a README section) listing reusable modules and where they live; check it before adding new code."
- **Technology & version constraints -- convention templates:** The generator will include a small set of well-known convention templates (e.g. Pydantic v2, React 18, Rust edition) keyed by detected stack. Keep the list maintainable: document in code or in this plan which stacks get which template lines; add new templates when a technology is commonly requested (e.g. "always use TypeScript strict mode"). Avoid duplicating the same rule from both interview decisions and a template; prefer interview-sourced content when present, and use templates to fill in only when the interview implies the stack but didn't spell out the exact line.
- **Technology & version constraints -- preserve when updating:** Add a line inside the generated "Technology & version constraints" section: "When updating AGENTS.md with learnings, keep this section; do not remove it." (Same idea as the DRY section preserve rule.)
- **Stack detection for convention templates:** The plan says "when the interview has identified a well-known stack" but does not specify how. Options: (1) derive from Architecture phase Q&A text (e.g. keyword/language detection: "React", "Pydantic", "Rust"); (2) add a structured "detected_stack" or "primary_language" field to interview state populated at Architecture phase completion; (3) use feature_detector or technology_matrix categories. Decide and document so the generator has a single, clear input for template selection.
- **TechnologyExtractor Wiring (Resolved — Option 1: Caller passes in):**
The caller of `generate_agents_md` (typically the interview orchestrator's finalize step) calls `TechnologyExtractor::extract(completed_phases)` and passes the result into `generate_agents_md` as an optional parameter:
```rust
pub fn generate_agents_md(
    project_context: &ProjectContext,
    tech_stack: Option<&TechStack>,  // from TechnologyExtractor
    interview_summary: &InterviewSummary,
) -> String
```
Rationale: keeps `generate_agents_md` pure (no side effects, no phase data access). The caller already has `completed_phases` in scope. If `tech_stack` is `None` (e.g., Architecture phase was skipped), AGENTS.md omits the technology section.
- **Section placement:** "Technology & version constraints" is specified as "near the top (e.g. after Overview, before or as part of Architecture Notes)". For implementers: prefer **its own section** (e.g. "## Technology & version constraints") immediately after Overview and before "## Architecture Notes", so agents see version rules before detailed architecture text; avoid burying it as a subsection if the goal is visibility.

**Keep generated AGENTS.md minimal (context and attention)**

AGENTS.md is loaded into agent context; long files consume context budget and encourage skimming, so important rules get missed. Apply the following so generated AGENTS.md stays short and high-signal.

- **Critical-first:** Put the most important rules in a **short "Critical" or "TL;DR" block at the very top** (e.g. 5-10 bullets): Technology & version constraints in 3-5 bullets, DRY in 3-5 bullets, top DO/DON'T. Even if the rest is skimmed, the first screen is seen.
- **Size budget:** Prefer a **cap** on generated AGENTS.md (e.g. **~150-200 lines** or a token budget). Prioritize: Critical block → Technology & version constraints (short bullets) → DRY (short) → minimal DO/DON'T (top 5-7 each) → one short "Where to look". Trim or move the rest.
- **Linked Docs for AGENTS.md Generation (Resolved):**
When generating a minimal AGENTS.md for the target project:
1. **Always** create the `docs/` directory if it does not exist.
2. Write a single file: `docs/project-context.md` (not split into architecture.md + codebase-patterns.md).
3. Link from AGENTS.md: `> For detailed project context, see [docs/project-context.md](docs/project-context.md).`
4. **Skip condition:** Only skip `docs/project-context.md` creation if the project has fewer than 3 source files (trivial project). AGENTS.md is still generated.
5. Content of `docs/project-context.md`: technology stack, key architectural decisions, module responsibilities, and codebase patterns extracted from the interview phases.
- **Two-tier structure:** Section 1 = **Critical (must-read):** Technology & version constraints + DRY + top DO/DON'T in a fixed short block (≤1 screen). Section 2 = **Reference:** Pointer to `docs/project-context.md`. Implement in the generator by emitting a short AGENTS.md and writing `docs/project-context.md` from the same interview output.
- **Preserve minimality when updating:** Add a line in the generated AGENTS.md: "When updating this file with learnings, keep the Critical and Technology & version constraints sections; do not add long prose--prefer adding links to docs/."

**Cross-reference:** MiscPlan (Plans/MiscPlan.md) describes target-project DRY as interview-seeded and points here for implementation; MiscPlan also states that generated AGENTS.md should be kept minimal.

### 5.2 Documentation and plans for AI execution (wiring and completeness)

All **documentation and plans** produced by the interview (PRD, AGENTS.md, requirements, phase plans, roadmap, test strategy, etc.) must be written with the understanding that an **AI agent** will execute them, not a human. This reduces unwired features, partially complete components, and "built but not wired" outcomes.

**Requirements for generated content and prompts:**

1. **Audience: AI Overseer.** Every generated document and plan must assume the reader/Overseer is an AI agent. Instructions must be **unambiguous**, **actionable**, and **explicit** (e.g. "wire X to Y", "ensure config key Z is passed to the run config at start"). Avoid prose that only a human would infer.

2. **Wire everything together.** Explicitly call out:
   - **Config wiring:** Any setting or feature that has a GUI control or config key must state that it must be **wired** into the config shape used at runtime. **Config Wiring:** See orchestrator-subagent-integration.md §config-wiring for the canonical definition of Option B (build at run start, merge order: GUI defaults < interview output < per-tier overrides). Generated AGENTS.md or PRD should remind agents: "Ensure all config and GUI settings are wired so the run sees them; avoid building features that are never passed to the backend."
   - **Component integration:** Tasks that add modules, views, or components must include a step or acceptance criterion that the new code is **integrated** (e.g. declared in parent `mod.rs`, registered in routes, or wired in the GUI). No "add a widget" without "ensure the widget is used in view X."

3. **No partially complete components.** Generated tasks and acceptance criteria must enforce **completeness**:
   - Components must be **fully implemented** (no stubs or TODOs that are left as final state).
   - Every public API or UI surface that is added must be **reachable and wired** (e.g. new tab is visible and bound to config; new command is invokable).
   - Add to DO/DON'T or Critical block in generated AGENTS.md: "Do not leave components partially complete; wire every new piece to the rest of the system and to the GUI/config where applicable."

4. **Subagent persona recommendations.** Generated plans and documents (PRD, phase plans, roadmap, test strategy, etc.) must include **which subagent personas to use** at the appropriate granularity (e.g. per task, per subtask, or per phase). Use subagent names from **subagent_registry** (e.g. `product-manager`, `architect-reviewer`, `rust-engineer`, `security-auditor`, `test-automator`) so the Overseer (orchestrator or Assistant) knows which specialist(s) to invoke. The PRD schema already supports recommendations (e.g. `crew_recommendation` with `subagents` on subtasks); phase plans and other generated docs must also carry subagent recommendations where applicable (e.g. primary and optional secondary subagents per phase or per task). This ensures every generated plan is **executable** with the right personas.

5. **Parallelism.** Generated plans must indicate **what can be done in parallel**.

**Parallelism Schema (Resolved — `depends_on`):**
Use `depends_on: Vec<TaskId>` on each task in the PRD/plan:
- Tasks with empty `depends_on` can run in parallel.
- Tasks whose dependencies are all completed can start.
- No `parallel_group` field — parallelism is implicit from the dependency graph.
- Schema (in PRD task objects):
  ```json
  {
    "task_id": "TK-001-002",
    "depends_on": ["TK-001-001"],
    "title": "Implement auth middleware",
    ...
  }
  ```
- SSOT: this schema definition. Cross-reference from STATE_FILES.md.

**Generation rule:** All examples and downstream schemas in this document MUST use `depends_on` only. Any older `parallel_group` or `can_run_after` examples are non-canonical and must be treated as superseded by this section.

6. **UI wiring traceability (GUI projects).** When the user project includes a GUI (detected during Architecture or Product/UX interview phases):
   - Every plan node that creates, modifies, or wires interactive UI elements MUST include `contract_refs` entries pointing to the relevant `ui/wiring_matrix.json` entries and/or `ui/ui_command_catalog.json` command IDs.
   - Acceptance criteria for UI nodes MUST include: (a) wiring matrix entry exists for every new interactive element, (b) no unbound UI actions (every element has a bound `UICommandID` and a resolved handler), (c) `ui/wiring_matrix.json` validates against the wiring matrix schema.
   - Generated AGENTS.md for the target project MUST include a "UI Wiring" rule in the Critical block: "Every interactive UI element must have a wiring matrix entry; no unbound actions allowed. Check `ui/wiring_matrix.json` before adding new interactive elements."

ContractRef: Invariant:INV-011, Invariant:INV-012, ContractName:Plans/UI_Wiring_Rules.md

7. **Where to inject.** Apply these requirements in:
   - **Prompt templates** for phase completion and document generation (so the interviewing agent is instructed to produce AI-Overseer-oriented, wire-explicit, complete output).
   - **PRD and plan generators** (so generated tasks and acceptance criteria include wiring, completeness, **subagent persona recommendations**, and **parallelism**).
   - **AGENTS.md generator** (§5.1): add a short "AI Overseer" or "Wiring & completeness" bullet block in the Critical section (e.g. "Plans and docs are for AI execution; wire everything; no partially complete components").


**Reinforce in all generated plans and AGENTS.md:** (1) **DRY Method** -- check existing code and docs before adding new; reuse first; tag reusable items; single source of truth. (2) **Everything wired** -- config and **GUI** must be wired (every new screen, control, or action reachable and connected). (3) **No unfinished components or features** unless explicitly scheduled in a later step; the plan must reference that step and the later step must complete the work. (4) **No dead code** -- require that unused code is removed and that new code is only added when used and wired. Add these to DO/DON'T or Critical block in generated AGENTS.md. The generator MUST emit these four points in the DO/DON'T or Critical block of generated AGENTS.md and in plan acceptance criteria; there is no exception for partial or minimal output.

ContractRef: ContractName:Plans/DRY_Rules.md#7, Gate:GATE-009

**Cross-reference:** Plans/assistant-chat-design.md §14 points here for the full specification. Orchestrator plan "Avoiding Built but Not Wired" and config-wiring (orchestrator-subagent-integration.md §config-wiring: Option B — build at run start, merge order: GUI defaults < interview output < per-tier overrides) are the runtime side; the interview is responsible for generating instructions that lead to wired, complete implementations.

**PRD Subagent/Parallelization Enforcement (Resolved):**
Enforcement point: the **scheduler** (in the orchestrator execution engine).
- When building the run graph from the PRD, the scheduler reads `subagents` and `depends_on` fields from each task.
- Subagent assignments are passed to the Provider runner as part of the task context.
- Parallelization is determined by the `depends_on` dependency graph (see §5.2 parallelism schema).
- **Validation at run start:** `validate_config_wiring_for_tier()` verifies all referenced subagent names exist in the subagent registry. Unknown names → fail fast (see orchestrator-subagent-integration.md subagent name validation).

### 5.3 DRY method when implementing interview code (Puppet Master codebase)

When implementing or changing **interview-related code** in Puppet Master (interview tab, phase UI, research engine, document generation, agents_md_generator), follow the same **DRY method** as the rest of the codebase so new UI and helpers stay consistent and discoverable.

- **Widget catalog:** Before adding new UI, check **`docs/gui-widget-catalog.md`** and use existing widgets (e.g. `styled_button`, `page_header`, `toggler`, `selectable_label`, `modal_overlay`). Interview views live in `src/views/` and should reuse widgets from `src/widgets/`.
- **Platform data:** Use **`platform_specs`** (e.g. `platform_specs::cli_binary_names`, `platform_specs::fallback_model_ids`) for any platform-specific behavior in the interview flow; do not hardcode CLI names, models, or capabilities.

### 5.4 Multi-Pass Review (Interview Documents)

Multi-Pass Review is the **final-review** step for the Interview document bundle. Cheap iteration during interview doc creation happens via inline notes + Resubmit with Notes (targeted revision), not by repeatedly running Multi-Pass Review.

**Bundle preconditions (hard gate):**
- Multi-Pass Review is enabled only when:
  - all docs in the interview bundle are marked **Approved/Done**, and
  - there are **no open notes** (all notes resolved), and
  - user explicitly clicks **Run Final Review**.
- Runs once by default; rerun explicit only.

**Live preview + notes (required supporting workflow):**
- During interview doc creation and targeted resubmits, the Embedded Document Pane provides live multi-document preview:
  - doc list grows as docs are created
  - per-doc badges include `writing…`, `draft`, `needs-review`, `changes-requested`, `approved`
  - follow-active toggle default ON
- Inline notes (highlight + note) are supported with robust anchoring + deterministic re-anchoring (position + quote selectors; default prefix/suffix 32 chars).
- Resubmit with Notes triggers a targeted revision pass that applies requested changes and/or answers questions, marks notes `addressed`, and MUST NOT trigger Multi-Pass Review.

ContractRef: ContractName:Plans/chain-wizard-flexibility.md

**Final gate (single decision):**
- After final review completes, show **Accept | Reject | Edit** once for the review output bundle.
  - Accept applies revised bundle.
  - Reject discards review output bundle and preserves pre-review bundle.
  - Edit opens revised docs without rerunning review.
- Review output bundle MUST be stored separately so Reject is a clean discard.

ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/storage-plan.md

### 5.5 Requirements Quality Reviewer Trigger Rule

The `requirements-quality-reviewer` MUST run deterministically at two trigger points (both are mandatory, independent triggers — not an "AND/OR" choice — both situations independently trigger the reviewer):

ContractRef: ContractName:Plans/chain-wizard-flexibility.md, SchemaID:pm.requirements_quality_report.schema.v1

1. **After `requirements-doc-builder` output:** immediately after the requirements document is produced, before any planning or implementation subagent sees it.
2. **After `interview-doc-generator` output:** immediately after the interview-generated requirements doc is produced, before the Contract Unification Pass.

**Run order in phase:**

```
requirements-doc-builder → requirements-quality-reviewer → [if FAIL: autofill loop → re-review] → contract-unification-pass
interview-doc-generator  → requirements-quality-reviewer → [if FAIL: autofill loop → re-review] → contract-unification-pass
```

The autofill loop runs at most **2 iterations** before escalating to the user if blocking issues remain. This is a deterministic limit — no open-ended retries.

ContractRef: ContractName:Plans/chain-wizard-flexibility.md#requirements-quality-escalation-semantics, SchemaID:pm.requirements_quality_report.schema.v1

#### Autofill-First Rule

The system MUST attempt autofill before escalating to the user:

- For every blocking issue where `auto_fixable == true`: autofill is applied in Pass 2, no user question generated.
- For blocking issues where `auto_fixable == false`: a targeted question is added to `needs_user_clarification[]`.
- The reviewer MUST NOT generate a user question for anything that can be deterministically resolved.
- This rule directly supports the "no human in the loop" policy (see `Plans/Decision_Policy.md §4, §6`).

ContractRef: PolicyRule:Decision_Policy.md§6, ContractName:Plans/chain-wizard-flexibility.md#requirements-completion-contract

