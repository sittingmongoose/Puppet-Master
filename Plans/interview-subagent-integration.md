# Interview Feature Subagent Integration -- Implementation Plan

## Change Summary

- 2026-02-23: Added a cross-plan alignment section making the Interview phase manager responsible for (1) intent-driven adaptive phase selection (phase plan) and (2) producing Contract Layer outputs via contract fragments + a deterministic Contract Unification Pass (SSOT: `Plans/chain-wizard-flexibility.md` §6 and `Plans/Project_Output_Artifacts.md`).

## Plan Document Status

**This is a PLAN DOCUMENT ONLY** -- No code changes have been made. This document contains:
- Subagent persona assignments for each interview phase
- Integration architecture and design
- Code changes required
- Configuration options
- Implementation examples

## Rewrite alignment (2026-02-21)

This plan's interview-phase semantics remain authoritative. Implementation should target the rewrite described in `Plans/rewrite-tie-in-memo.md`:

- Platform runners should converge on **Providers** that emit a normalized streaming event model
- Interview research/validation/doc generation outputs should be stored as **artifacts/events** (seglog → projections)
- Crew/hooks/lifecycle concepts referenced here should be implemented once in the shared core and reused

### Interview persistence and events (storage alignment)

- **Seglog:** Emit to seglog: interview start/end, phase start/end, research/validation/document-generation completion, handoffs, and any event needed for replay or search. Interview artifact events (e.g. doc generated) should be first-class in the event model so projectors can index them (e.g. Tantivy).
- **redb:** Persist in redb (per storage-plan.md): **interview session** (interview id, project, status, phase plan); **interview run** or phase-level progress for resume; **checkpoints** at phase boundaries. Replace or project file-based state (e.g. active-subagents.json, phase state) from redb where possible so resume and recovery use the same store as the rest of the app.
- Existing file-based persistence (.puppet-master/memory/, .puppet-master/interview/) should be migrated to or projected from seglog/redb so interview state is part of the canonical storage stack.

## Executive Summary

This plan integrates Cursor subagent personas into the interview orchestrator to enhance phase-specific expertise, improve research quality, validate answers, and generate better documentation. Each interview phase will leverage specialized subagents aligned with its domain.

## Relationship to Orchestrator Plan

This document covers the **interview flow** (multi-phase interview: Scope, Architecture, UX, Data, Security, Deployment, Performance, Testing). The **orchestrator plan** (`Plans/orchestrator-subagent-integration.md`) covers the **main run loop** (Phase → Task → Subtask → Iteration execution) and defines shared concerns: config-wiring validation, start/end verification at phase/task/subtask, and quality verification. For interview-specific start/end verification (e.g. at each interview phase boundary), mirror the orchestrator plan's **"Start and End Verification at Phase, Task, and Subtask"** and define interview-phase quality criteria (e.g. document completeness, requirement clarity). Subagent names and platform invocation should stay consistent across both plans. **Subagent personas:** The orchestrator plan defines a place to setup subagent personas/info (preload from `.claude/agents`, user add/delete, optional AI trim; overrides from config only -- user edits in Personas UI). Interview uses **multiple** personas **dynamically** by phase and tech stack (phase_subagents, research/validation subagents, etc.). For whichever subagent(s) are selected for a given phase/context, resolve that subagent's persona content (override from `SubagentGuiConfig.persona_overrides` if present, else preloaded content) and inject into the phase prompt (orchestrator plan §5 and Gap §11). **Application and project rules:** When building any interview prompt that goes to an agent, include the shared rules pipeline output from **Plans/agent-rules-context.md** (application rules always; project rules when the interview has a target project). **Tool permissions:** **Plans/Tools.md** defines the central tool registry and permission model; the same run config and permission snapshot apply to interview runs (see Tools.md §2.5 cross-plan table). **Plans/newfeatures.md:** For interview **recovery** (§4: restore interview phase and in-progress answers after crash), **restore points / rollback** (§8: roll back to a given phase), and **skills** (§6: phase-specific context injection by trigger), see newfeatures; those features extend the interview without replacing phase or subagent structure.

**ELI5/Expert copy alignment:** Interview user-visible copy follows `Plans/FinalGUISpec.md` §7.4.0. App-level **Interaction Mode (Expert/ELI5)** defaults to ELI5 ON and selects Interviewer question/feedback variant text. Chat-level **Chat ELI5** defaults OFF and only changes assistant style instructions in chat sessions; it does not override interviewer copy selection and does not alter generated technical artifacts (PRD/AGENTS/contracts).

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
- `technical-writer` -- Generate phase documents, AGENTS.md, requirements
- `knowledge-synthesizer` -- Cross-phase analysis, technology matrix generation

**Answer Validation:**
- `debugger` -- Validate technical feasibility of answers
- `code-reviewer` -- Validate technical decisions and architecture choices

**Research Operations:**
- `ux-researcher` -- Web research via Browser MCP (when configured). **Cited web search:** Interview (and Assistant, Orchestrator) use **cited web search** (inline citations + Sources list) from a single shared implementation; see **Plans/newtools.md** §8 (cited web search, [opencode-websearch-cited](https://github.com/ghoulr/opencode-websearch-cited)-style) and **Plans/assistant-chat-design.md** §7.
- `context-manager` -- Manage interview state and context across phases

## Adaptive Interview Phases + Contract Layer Outputs (Cross-Plan Alignment)

The interview flow is responsible for producing **AI-executable, DRY, testable** outputs for downstream orchestration. This requires two additional responsibilities beyond Q&A collection:

1. **Adaptive phase selection** (intent + context → phase plan) so interviews scale appropriately with the user’s intent.
2. **Contract Layer output generation** so plans and execution nodes reference stable contract IDs rather than duplicating prose.

### 1) Adaptive phase selection (phase plan)

The Interview phase manager must support adaptive phase selection exactly as specified in `Plans/chain-wizard-flexibility.md` §6 (Phase Selector Contract, depth semantics, persistence, resume rules, and user override controls).

**DRY rule:** This plan does not restate the phase selector contract; it references chain-wizard SSOT for the structured input/output and fallback behavior.

### 2) Contract Layer output generation (fragments → unification)

The Interviewer/Wizard must produce the canonical user-project artifact set under `.puppet-master/project/` (requirements, Project Contract Pack, `plan.md`, sharded `plan_graph/`, `acceptance_manifest.json`, etc.). The authoritative contract for these artifacts and schemas is `Plans/Project_Output_Artifacts.md`.

Implementation responsibilities (conceptual):

- **Per-phase contract fragments:** Each interview phase contributes contract fragments (interfaces, schemas, constraints, budgets, test contracts). These fragments are inputs to unification; they are not the canonical contract pack.
- **Contract Unification Pass:** At interview completion, run a deterministic unification step that dedupes fragments, assigns stable `ProjectContract:*` IDs, and materializes:
  - `.puppet-master/project/contracts/` + required `contracts/index.json`
  - `.puppet-master/project/plan_graph/index.json` + `nodes/<node_id>.json`
  - `.puppet-master/project/acceptance_manifest.json`
  - `.puppet-master/project/plan.md`
  - optional `.puppet-master/project/glossary.md`
- **Builder contract seeds:** When Requirements Doc Builder is used (chain-wizard §5), `.puppet-master/requirements/contract-seeds.md` is a staging input to the unification pass and must be reconciled with phase-derived fragments.
- **Validation gate:** Before execution begins, run the dry-run validator specified by `Plans/Project_Output_Artifacts.md` Validation Rules (resolvable `ProjectContract:*` refs, acceptance-manifest coverage, shard schema validity, deterministic node IDs).

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/chain-wizard-flexibility.md, Primitive:SessionStore

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

- **Config default:** `generate_initial_agents_md` is currently `false` in the default interview config. For the DRY section to be seeded, this flag must be true when the interview runs. Consider making it default true, or document that users must enable "Generate initial AGENTS.md" (or equivalent) so the target project gets the DRY guidelines.
- **Stack/language for parameterization:** The plan says the DRY block can be parameterized by project type. The interview does not yet pass a "project language" or "stack" into `generate_agents_md`. The Architecture phase captures tech stack and versions; that state could be passed so the generator emits language-appropriate tagging examples (e.g. Rust: `// DRY:FN:name`; Python: docstring or `# DRY:FN:name`; TypeScript: JSDoc or comment). Add an optional parameter to the generator (e.g. `project_language: Option<&str>`) and derive it from Architecture phase decisions if present.
- **Preserve DRY section when agents update AGENTS.md:** The generated DO section already says "Update AGENTS.md with learnings after significant iterations." Agents might append or edit AGENTS.md and accidentally remove or dilute the DRY section. Add a line inside the generated DRY block: "When updating AGENTS.md with learnings, keep this DRY Method section; do not remove it."
- **Projects created without the full interview:** If a project is created via the wizard only (no interview) or is an existing repo with no interview run, there will be no generated AGENTS.md and thus no DRY section. Room for improvement: (1) document that DRY-seeded AGENTS.md is only for interview-completed projects, or (2) have the wizard or start-chain add a minimal AGENTS.md with a DRY section when creating a new project, so projects still get reuse-first guidelines even without the full interview.
- **Overwrite vs. merge:** When the interview runs and `generate_initial_agents_md` is true, `write_agents_md` overwrites any existing AGENTS.md at project root. If the user had previously added custom content, it is lost. For a first-time interview this is fine; for a re-run or "regenerate docs" flow, consider a merge policy (e.g. preserve user-added sections, or prompt before overwrite). Mark as optional/future unless product requires it.
- **Catalog for target project:** The target project will not have a widget catalog or platform_specs. The DRY section can still say "check existing modules and grep for DRY: (or this project's tag) before adding new code." Optionally add: "As the project grows, maintain a short index (e.g. docs/reusable.md or a README section) listing reusable modules and where they live; check it before adding new code."
- **Technology & version constraints -- convention templates:** The generator will include a small set of well-known convention templates (e.g. Pydantic v2, React 18, Rust edition) keyed by detected stack. Keep the list maintainable: document in code or in this plan which stacks get which template lines; add new templates when a technology is commonly requested (e.g. "always use TypeScript strict mode"). Avoid duplicating the same rule from both interview decisions and a template; prefer interview-sourced content when present, and use templates to fill in only when the interview implies the stack but didn't spell out the exact line.
- **Technology & version constraints -- preserve when updating:** Add a line inside the generated "Technology & version constraints" section: "When updating AGENTS.md with learnings, keep this section; do not remove it." (Same idea as the DRY section preserve rule.)
- **Stack detection for convention templates:** The plan says "when the interview has identified a well-known stack" but does not specify how. Options: (1) derive from Architecture phase Q&A text (e.g. keyword/language detection: "React", "Pydantic", "Rust"); (2) add a structured "detected_stack" or "primary_language" field to interview state populated at Architecture phase completion; (3) use feature_detector or technology_matrix categories. Decide and document so the generator has a single, clear input for template selection.
- **Wiring TechnologyExtractor into generate_agents_md:** The plan says "optionally use technology_matrix::TechnologyExtractor". Currently `generate_agents_md(project_name, completed_phases, feature_description)` does not take extracted tech entries. Either: (1) have `write_agents_md` (or the caller) call `TechnologyExtractor::extract(completed_phases)` and pass the result into `generate_agents_md` as an optional parameter, or (2) call the extractor inside `generate_agents_md` from `completed_phases`. Document the chosen wiring so "Technology & version constraints" can render structured (name, version) lines from the matrix when available.
- **Section placement:** "Technology & version constraints" is specified as "near the top (e.g. after Overview, before or as part of Architecture Notes)". For implementers: prefer **its own section** (e.g. "## Technology & version constraints") immediately after Overview and before "## Architecture Notes", so agents see version rules before detailed architecture text; avoid burying it as a subsection if the goal is visibility.

**Keep generated AGENTS.md minimal (context and attention)**

AGENTS.md is loaded into agent context; long files consume context budget and encourage skimming, so important rules get missed. Apply the following so generated AGENTS.md stays short and high-signal.

- **Critical-first:** Put the most important rules in a **short "Critical" or "TL;DR" block at the very top** (e.g. 5-10 bullets): Technology & version constraints in 3-5 bullets, DRY in 3-5 bullets, top DO/DON'T. Even if the rest is skimmed, the first screen is seen.
- **Size budget:** Prefer a **cap** on generated AGENTS.md (e.g. **~150-200 lines** or a token budget). Prioritize: Critical block → Technology & version constraints (short bullets) → DRY (short) → minimal DO/DON'T (top 5-7 each) → one short "Where to look". Trim or move the rest.
- **Linked docs over long prose:** Move **long reference** out of AGENTS.md into separate generated files and link from AGENTS.md. For example: put full "Architecture Notes" and "Codebase Patterns" in `docs/architecture.md` and `docs/codebase-patterns.md` (generated by the interview if needed), and in AGENTS.md keep only a one-line "Architecture: see docs/architecture.md" and "Patterns: see docs/codebase-patterns.md". Agents load a minimal AGENTS.md by default and can open other docs when the task needs them.
- **Two-tier structure (optional):** Section 1 = **Critical (must-read):** Technology & version constraints + DRY + top DO/DON'T in a fixed short block (≤1 screen). Section 2 = **Reference:** Pointers to `docs/architecture.md`, `docs/guidelines.md`, etc. Implement in the generator by emitting a short AGENTS.md and optionally writing linked docs in `docs/` from the same interview output.
- **Preserve minimality when updating:** Add a line in the generated AGENTS.md: "When updating this file with learnings, keep the Critical and Technology & version constraints sections; do not add long prose--prefer adding links to docs/."
- **Linked docs implementation:** If the generator emits a two-tier structure with pointers to `docs/architecture.md`, `docs/codebase-patterns.md`, etc., it must **write those files** from the same interview output (e.g. from completed_phases) so the links resolve. Document in the generator or plan: when generating minimal AGENTS.md, optionally write `docs/architecture.md` and `docs/codebase-patterns.md` (or a single `docs/project-context.md`) and link from AGENTS.md; ensure `docs/` exists in the target project (create if needed).

**Cross-reference:** MiscPlan (Plans/MiscPlan.md) describes target-project DRY as interview-seeded and points here for implementation; MiscPlan also states that generated AGENTS.md should be kept minimal.

### 5.2 Documentation and plans for AI execution (wiring and completeness)

All **documentation and plans** produced by the interview (PRD, AGENTS.md, requirements, phase plans, roadmap, test strategy, etc.) must be written with the understanding that an **AI agent** will execute them, not a human. This reduces unwired features, partially complete components, and "built but not wired" outcomes.

**Requirements for generated content and prompts:**

1. **Audience: AI executor.** Every generated document and plan must assume the reader/executor is an AI agent. Instructions must be **unambiguous**, **actionable**, and **explicit** (e.g. "wire X to Y", "ensure config key Z is passed to the run config at start"). Avoid prose that only a human would infer.

2. **Wire everything together.** Explicitly call out:
   - **Config wiring:** Any setting or feature that has a GUI control or config key must state that it must be **wired** into the config shape used at runtime (e.g. Option B: run config built from GUI at run start). Generated AGENTS.md or PRD should remind agents: "Ensure all config and GUI settings are wired so the run sees them; avoid building features that are never passed to the backend."
   - **Component integration:** Tasks that add modules, views, or components must include a step or acceptance criterion that the new code is **integrated** (e.g. declared in parent `mod.rs`, registered in routes, or wired in the GUI). No "add a widget" without "ensure the widget is used in view X."

3. **No partially complete components.** Generated tasks and acceptance criteria must enforce **completeness**:
   - Components must be **fully implemented** (no stubs or TODOs that are left as final state).
   - Every public API or UI surface that is added must be **reachable and wired** (e.g. new tab is visible and bound to config; new command is invokable).
   - Add to DO/DON'T or Critical block in generated AGENTS.md: "Do not leave components partially complete; wire every new piece to the rest of the system and to the GUI/config where applicable."

4. **Subagent persona recommendations.** Generated plans and documents (PRD, phase plans, roadmap, test strategy, etc.) must include **which subagent personas to use** at the appropriate granularity (e.g. per task, per subtask, or per phase). Use subagent names from **subagent_registry** (e.g. `product-manager`, `architect-reviewer`, `rust-engineer`, `security-auditor`, `test-automator`) so the executor (orchestrator or Assistant) knows which specialist(s) to invoke. The PRD schema already supports recommendations (e.g. `crew_recommendation` with `subagents` on subtasks); phase plans and other generated docs must also carry subagent recommendations where applicable (e.g. primary and optional secondary subagents per phase or per task). This ensures every generated plan is **executable** with the right personas.

5. **Parallelism.** Generated plans must indicate **what can be done in parallel**. Include structure so the executor can run independent work in parallel: e.g. per task or subtask, **dependencies** (`depends_on` / `can_run_after`) or **parallel groups** (items in the same group can run in parallel). The interview output (PRD, roadmap, or plan markdown) should make it explicit which tasks/subtasks are independent and which must run in sequence, so the orchestrator or execution layer can schedule parallel execution where safe. Document the chosen schema (e.g. `depends_on: [task_ids]`, or `parallel_group: "A"` for items that can run together) in the PRD/plan generator and in STATE_FILES or this plan.

6. **Where to inject.** Apply these requirements in:
   - **Prompt templates** for phase completion and document generation (so the interviewing agent is instructed to produce AI-executor-oriented, wire-explicit, complete output).
   - **PRD and plan generators** (so generated tasks and acceptance criteria include wiring, completeness, **subagent persona recommendations**, and **parallelism**).
   - **AGENTS.md generator** (§5.1): add a short "AI executor" or "Wiring & completeness" bullet block in the Critical section (e.g. "Plans and docs are for AI execution; wire everything; no partially complete components").


**Reinforce in all generated plans and AGENTS.md:** (1) **DRY Method** -- check existing code and docs before adding new; reuse first; tag reusable items; single source of truth. (2) **Everything wired** -- config and **GUI** must be wired (every new screen, control, or action reachable and connected). (3) **No unfinished components or features** unless explicitly scheduled in a later step; the plan must reference that step and the later step must complete the work. (4) **No dead code** -- require that unused code is removed and that new code is only added when used and wired. Add these to DO/DON'T or Critical block in generated AGENTS.md. The generator MUST emit these four points in the DO/DON'T or Critical block of generated AGENTS.md and in plan acceptance criteria; there is no exception for partial or minimal output.

**Cross-reference:** Plans/assistant-chat-design.md §14 points here for the full specification. Orchestrator plan "Avoiding Built but Not Wired" and config-wiring (e.g. Option B) are the runtime side; the interview is responsible for generating instructions that lead to wired, complete implementations. The **orchestrator** must **respect** subagent personas and parallelization from the PRD (orchestrator-subagent-integration.md "Respecting PRD/plan: subagent personas and parallelization").

### 5.3 DRY method when implementing interview code (Puppet Master codebase)

When implementing or changing **interview-related code** in Puppet Master (interview tab, phase UI, research engine, document generation, agents_md_generator), follow the same **DRY method** as the rest of the codebase so new UI and helpers stay consistent and discoverable.

- **Widget catalog:** Before adding new UI, check **`docs/gui-widget-catalog.md`** and use existing widgets (e.g. `styled_button`, `page_header`, `toggler`, `selectable_label`, `modal_overlay`). Interview views live in `src/views/` and should reuse widgets from `src/widgets/`.
- **Platform data:** Use **`platform_specs`** (e.g. `platform_specs::cli_binary_names`, `platform_specs::fallback_model_ids`) for any platform-specific behavior in the interview flow; do not hardcode CLI names, models, or capabilities.

### 5.4 Multi-Pass Review (Interview Documents)

After interview documents are generated (phase docs, AGENTS.md, PRD, and related artifacts), an optional **Multi-Pass Review** checks the document set for gaps, contradictions, unwired components, missing information, and consistency issues. A **review agent** spawns a worker pool of review subagents, each tasking one document review at a time, then aggregates findings into a revised bundle and findings summary.

**When it runs:** After interview document generation and before interview handoff completion. **Zero documents:** If no documents exist, skip Multi-Pass Review, log the skip, and complete interview with no revised bundle.

**Order of operations (required):**
1. Interview document generation completes.
2. User confirms they are done with direct edits/conversation for this review cycle.
3. Optional Multi-Pass Review runs (if enabled).
4. Findings summary is shown in chat and in the Interview preview section.
5. One final approval gate is shown: **Accept | Reject | Edit**.
6. Handoff completion occurs only after this final approval gate resolves.

**Settings (same conceptual model as requirements Multi-Pass):**
- **Multi-Pass Review:** On/off.
- **Number of reviews:** Number of review tasks per document (default 3, max 10).
- **Max subagents spawn:** Maximum in-flight review subagents (default 9, max 20) with warning text: "This will go through token usage quickly."
- **Use different models / model-provider list:** Default true. User-configurable cross-provider list. Validation: min 1 entry, max 20. If list length is less than required tasks, assign round-robin and show UI notice.
- **Review agent model/provider:** Configurable; default is the primary interview provider/model.

**Worker-pool semantics:**
- Total review tasks = (document count) x (number of reviews).
- Pool runs up to max subagents in flight.
- Each subagent handles one task and terminates after reporting.
- Spawn failures retry twice with the same model/provider, then fallback to the next configured model/provider.
- If all configured model/provider entries fail for a task, skip the task and log it.
- If more than 25% of review tasks are skipped due to spawn failure, mark run `failed`.

**Review criteria:**
- Gaps, missing scope, missing information, and contradictions.
- Wiring completeness (components and GUI flow connections).
- Cross-document consistency and feasibility against available codebase context.

**Whole-set synthesis step:**
- After per-document tasks, run a whole-set synthesis/review pass to detect cross-document conflicts.
- If raw document set is too large, review agent produces a bounded synthesis artifact and reviewers consume that synthesis.

**Findings summary and approval contracts (required):**
- `review_findings_summary.v1`
  - `run_id`
  - `scope` (`requirements | interview`)
  - `gaps`
  - `consistency_issues`
  - `missing_information`
  - `applied_changes_summary`
  - `unresolved_items`
- `review_approval_gate.v1`
  - `run_id`
  - `decision` (`accept | reject | edit`)
  - `decision_timestamp`
  - `decision_actor`
  - `preconditions` (`findings_summary_shown=true`)

**Approval model (required):**
- Exactly one final approval gate per Multi-Pass run.
- No auto-apply mode and no per-document approval mode.
- **Accept:** revised bundle is promoted and handoff completes.
- **Reject:** revised bundle is discarded, original generated bundle remains active, and handoff completes.
- **Edit:** open revised docs in editor/document pane, then return to the same final gate.

**Document review surfaces (required):**
- Chat shows summaries/findings only, not full document bodies.
- Chat must point to all three review locations after generation/revision:
  1. Opened in File Editor,
  2. Clickable canonical file path,
  3. Embedded document pane entry.
- Interview preview section must display findings summary and final approval UI.

**Interview page document pane requirements:**
- Interview page includes the embedded document pane for interview artifacts (phase docs, PRD, and related human-readable docs).
- Document pane includes a `Plan graph` entry as a read-only rendered view.
- Near plan graph view show notice: `Talk to Assistant to edit plan graph.`

**Dependencies:** Same Multi-Pass pattern as requirements Builder (review agent + N subagents; not Crew). Use provider capabilities from `platform_specs`; use `codebase_scanner` context for existing-code intents. Cross-reference `Plans/chain-wizard-flexibility.md` section 5.6 for shared settings and model selection.

**Recovery requirements (required):**
- Persist in-progress review state for resume/start-over behavior.
- Persist `awaiting_final_approval` state and restore directly to findings + final approval UI after restart.
- Restore document pane selection and preview context for the same review run when possible.

## DRY Method Compliance

**CRITICAL:** All code in this plan MUST follow DRY principles.

### DRY Requirements

1. **Platform Data -- ALWAYS use platform_specs:**
   - ❌ **NEVER** hardcode platform CLI commands, binary names, models, auth, or capabilities
   - ✅ **ALWAYS** use `platform_specs::` functions (e.g., `platform_specs::cli_binary_names()`, `platform_specs::get_subagent_invocation_format()`, `platform_specs::get_agents_directory_name()`)
   - ✅ **ALWAYS** use `platform_specs::discover_platform_capabilities()` instead of platform match statements

2. **Subagent Names -- ALWAYS use subagent_registry:**
   - ❌ **NEVER** hardcode subagent names in match statements or mappings
   - ✅ **ALWAYS** use `subagent_registry::` functions (e.g., `subagent_registry::get_subagent_for_language()`, `subagent_registry::is_valid_subagent_name()`)
   - ✅ **ALWAYS** reference `DRY:DATA:subagent_registry` from orchestrator plan as the single source of truth

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

- ✅ `platform_agents_dir`: Now uses `platform_specs::get_agents_directory_name()` instead of hardcoded platform match
- ✅ `invoke_subagent`: Now uses `platform_specs::get_subagent_invocation_format()` instead of hardcoded platform match
- **Tagging:** Tag new reusable items with `// DRY:WIDGET:`, `// DRY:FN:`, `// DRY:DATA:`, or `// DRY:HELPER:` so they appear in grep and the catalog. If a widget does not fit, add `// UI-DRY-EXCEPTION: <reason>`.
- **After widget/catalog changes:** Run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` (warn-only).

**Cross-reference:** The orchestrator plan (**Plans/orchestrator-subagent-integration.md**) has a full **"DRY Method and GUI Widget Catalog"** section; AGENTS.md is the project-wide source for DRY rules. This subsection ensures the interview plan explicitly applies those rules to interview implementation.

## Implementation Phases

### Phase 1: Configuration & Infrastructure
1. Add `SubagentConfig` struct
   - **DRY REQUIREMENT:** Tag with `// DRY:DATA:SubagentConfig` if reusable
2. Extend `InterviewOrchestratorConfig`
   - **DRY REQUIREMENT:** Use `subagent_registry::` functions for any subagent name validation -- DO NOT hardcode subagent names
3. Add subagent configuration to GUI
   - **DRY REQUIREMENT:** Check `docs/gui-widget-catalog.md` FIRST -- use existing widgets (`toggler`, `styled_button`, `selectable_label`, `themed_panel`)
   - **DRY REQUIREMENT:** Subagent name lists MUST come from `subagent_registry::all_subagent_names()` or `subagent_registry::get_subagents_for_tier()` -- DO NOT hardcode names
   - **DRY REQUIREMENT:** Tag any new reusable widgets with `// DRY:WIDGET:<name>`
   - **DRY REQUIREMENT:** Run `scripts/generate-widget-catalog.sh` after widget changes
4. Create subagent mapping utilities
   - **DRY REQUIREMENT:** MUST use `subagent_registry::get_subagent_for_language()` and `subagent_registry::get_subagent_for_framework()` -- DO NOT create duplicate mapping logic
   - **DRY REQUIREMENT:** Tag reusable functions with `// DRY:FN:<name>`
5. **DRY (Puppet Master code):** When adding interview UI or helpers, follow DRY per §5.3 (widget catalog, platform_specs, tagging; run catalog scripts after widget changes)

### Phase 2: Prompt Integration
1. Modify `prompt_templates.rs` to include subagent instructions
   - **DRY REQUIREMENT:** Use `platform_specs::get_subagent_invocation_format()` when building platform-specific invocation syntax -- DO NOT hardcode formats
2. Add subagent invocation syntax to prompts
   - **DRY REQUIREMENT:** Use `SubagentInvoker::invoke_subagent()` which uses `platform_specs` -- DO NOT duplicate platform-specific logic
3. Update prompt generation to pass subagent config
   - **DRY REQUIREMENT:** Validate subagent names using `subagent_registry::is_valid_subagent_name()` before including in prompts

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
4. **AGENTS.md -- Technology & version constraints:** Add a "Technology & version constraints" (or "Stack conventions") section to generated AGENTS.md per §5.1, derived from Architecture phase and optionally technology_matrix; include convention templates for well-known stacks (e.g. Pydantic v2, React 18) when detected.
5. **AGENTS.md DRY section:** Add a DRY Method (reuse-first) section to generated AGENTS.md per §5.1 so target-project agents follow reuse-first and tag reusable items.
6. **AGENTS.md minimality:** Implement critical-first block, size budget (~150-200 lines), and optional linked docs (e.g. docs/architecture.md) per §5.1 "Keep generated AGENTS.md minimal"; add "When updating, keep Critical and Technology & version constraints; prefer links to docs/" in generated file.
7. **PRD crew recommendations:** Extend PRD generator to analyze task complexity and suggest crews for tasks/subtasks that would benefit from multiple subagents. Add `crew_recommendation` field to PRD JSON schema. Include crew recommendations in generated PRD and plan markdown.
8. **Document generation crews:** Use crews for document generation (e.g., technical-writer + knowledge-synthesizer + qa-expert crew) to coordinate document creation and ensure consistency.

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

## Crews and Subagent Communication Enhancements for Interview Flow

The orchestrator plan (`Plans/orchestrator-subagent-integration.md`) defines **Crews** (multi-agent communication system) and enhanced subagent communication. These features can enhance the **interview flow** to enable better coordination between interview subagents and improve plan generation quality.

### 1. Interview Phase Crews

**Concept:** Use crews within interview phases to enable subagents to communicate and coordinate. For example, Architecture phase can use a crew with `architect-reviewer`, `knowledge-synthesizer`, and `technical-writer` working together.

**Benefits:**
- **Parallel research:** Multiple research subagents can work simultaneously and share findings
- **Collaborative validation:** Validation subagents can discuss answers and reach consensus
- **Coordinated documentation:** Document generation subagents can coordinate to ensure consistency

**BeforePhase crew creation responsibilities:**

- **Check phase subagent configuration:** Determine if phase has multiple subagents (primary + secondary) that would benefit from crew coordination
- **Create phase crew:** If phase has multiple subagents, create crew with all phase subagents as members
- **Register crew:** Register crew with `CrewManager` and persist to `.puppet-master/state/crews.json`
- **Initialize crew communication:** Set up message board routing for crew (crew_id = `interview-phase-{phase_id}`)
- **Inject crew context:** Add crew information to phase subagent prompts (crew members, message board access, coordination instructions)

**DuringPhase crew coordination responsibilities:**

- **Monitor crew messages:** Track messages posted by crew members via message board
- **Coordinate research:** When research subagents run, they post findings to crew message board before returning results
- **Coordinate validation:** When validation subagents run, they can query crew message board for prior validations and post their own findings
- **Coordinate documentation:** When document generation subagents run, they can query crew message board for prior document sections and coordinate consistency

**AfterPhase crew completion responsibilities:**

- **Validate crew output:** Check that crew members completed their work and posted final messages
- **Archive crew messages:** Archive crew messages to `.puppet-master/memory/interview-phase-{phase_id}-messages.json`
- **Disband crew:** Mark crew as `CrewStatus::Complete` and remove from active crews
- **Save crew decisions:** Persist crew decisions and findings to memory for use by later phases

**Implementation:** Extend `src/interview/orchestrator.rs` to create crews at phase start, coordinate during phase execution, and disband at phase completion. Use `CrewManager` from orchestrator plan (`src/core/crews.rs`).

**Integration with interview orchestrator:**

In `src/interview/orchestrator.rs`, modify phase transition logic:

```rust
// Before starting a new phase
let before_ctx = BeforePhaseContext {
    phase_id: current_phase.id.clone(),
    phase_type: current_phase.phase_type,
    platform: config.primary_platform.platform,
    model: config.primary_platform.model.clone(),
    selected_subagents: get_phase_subagents(&config, &current_phase.id)?,
    previous_decisions: load_previous_phase_decisions(&state)?,
    detected_gui_frameworks: state.detected_gui_frameworks.clone(),
    known_gaps: get_known_gaps_for_phase(&current_phase.id)?,
};

let before_result = self.hook_registry.execute_before_phase(&before_ctx)?;

// Create phase crew if multiple subagents
let phase_crew = if before_result.selected_subagents.len() > 1 {
    let crew_id = format!("interview-phase-{}", current_phase.id);
    let crew_subagents: Vec<CrewSubagent> = before_result.selected_subagents.iter()
        .map(|(agent_type, agent_id)| CrewSubagent {
            agent_id: format!("{}-phase-{}", agent_id, current_phase.id),
            agent_type: agent_type.clone(),
            platform: config.primary_platform.platform,
            tier_id: None, // Interview phase, not tier
            status: SubagentStatus::Active,
        })
        .collect();
    
    let crew = Crew {
        crew_id: crew_id.clone(),
        name: Some(format!("{} Phase Crew", current_phase.name)),
        platform: config.primary_platform.platform,
        subagents: crew_subagents,
        task: format!("Research and validate {} phase decisions", current_phase.name),
        created_by: CrewCreator::Orchestrator { tier_id: format!("interview-phase-{}", current_phase.id) },
        created_at: Utc::now(),
        status: CrewStatus::Forming,
    };
    
    self.crew_manager.create_crew(crew).await?;
    Some(crew_id)
} else {
    None
};

// Inject crew context into prompt if crew exists
let prompt = if let Some(crew_id) = &phase_crew {
    let crew_context = self.crew_manager.get_crew_coordination_context(&crew_id).await?;
    format!("{}\n\n**Crew Coordination:** You are part of a crew ({}) with {} members. Coordinate via the message board (agent-messages.json). Post findings and questions to the crew before completing your work.\n\n{}", 
        prompt, crew_id, before_result.selected_subagents.len(), crew_context)
} else {
    prompt
};

// After phase completes
let after_ctx = AfterPhaseContext {
    phase_id: current_phase.id.clone(),
    phase_type: current_phase.phase_type,
    platform: config.primary_platform.platform,
    subagent_output: phase_output.clone(),
    completion_status: if phase_complete { CompletionStatus::Success } else { CompletionStatus::Warning("Incomplete".to_string()) },
    question_count: state.current_phase_qa.len(),
};

let after_result = self.hook_registry.execute_after_phase(&after_ctx)?;

// Disband phase crew if it exists
if let Some(crew_id) = phase_crew {
    self.crew_manager.disband_crew(&crew_id, "Phase completed").await?;
    
    // Archive crew messages
    let messages = self.crew_manager.get_crew_messages(&crew_id).await?;
    let archive_path = format!(".puppet-master/memory/interview-phase-{}-messages.json", current_phase.id);
    std::fs::write(&archive_path, serde_json::to_string_pretty(&messages)?)?;
    
    // Save crew decisions to memory
    self.memory_manager.save_phase_decisions(&current_phase.id, &extract_crew_decisions(&messages)).await?;
}
```

**Error handling:**

- **Crew creation failure:** If crew creation fails, log warning and proceed without crew (fallback to single-subagent mode)
- **Message board failure:** If message board access fails, log warning and proceed without coordination (subagents work independently)
- **Crew disband failure:** If crew disband fails, log error but continue (crew will be cleaned up on next startup)

### 2. Crew-Aware Plan Generation

**Concept:** When the interview generates PRD/plans, include crew recommendations for tasks/subtasks that would benefit from multiple subagents working together. Per §5.2 (Documentation and plans for AI execution), generated plans must also include **which subagent personas to use** (item 4) and **what can be done in parallel** (item 5).

**What to include in generated plans:**
- **Subagent persona recommendations:** Which subagent(s) to use per task, subtask, or phase (names from subagent_registry). PRD subtasks carry `crew_recommendation` with `subagents`; phase plans and other docs must carry subagent recommendations where applicable.
- **Parallelism:** Which tasks/subtasks can run in parallel (e.g. `depends_on`, `can_run_after`, or `parallel_group`) so the executor can schedule parallel execution.
- **Crew recommendations:** Suggest crews for complex tasks/subtasks when multiple subagents work together.
- **Crew templates:** Reference crew templates (e.g., "Use 'Full Stack Crew' for this phase")
- **Crew metadata:** Add crew hints to PRD tasks/subtasks

**PRD schema extension:**

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
                "rationale": "Requires security expertise, implementation, and testing",
                "crew_template": "Security Implementation Crew",
                "complexity_score": 7.5,
                "expertise_areas": ["security", "backend", "testing"]
              },
              "depends_on": [],
              "parallel_group": "A"
            }
          ]
        }
      ]
    }
  ]
}
```

- **Parallelism fields:** `depends_on` lists task/subtask ids that must complete before this one; empty means no dependencies. `parallel_group` (optional) identifies items that can run in parallel with each other (same group = can run together). Document the chosen schema in the PRD generator and STATE_FILES; orchestrator uses it to schedule parallel execution.

**Crew and parallelism field semantics (canonical: STATE_FILES.md §3.3):**

- **crew_recommendation:** Optional. When present, `subagents` is **required** (array of strings; names from subagent_registry). Other fields (rationale, crew_template, complexity_score, expertise_areas) are optional. If `crew_recommendation` is present but `subagents` is missing or empty, the orchestrator **treats it as no recommendation** and falls back to dynamic selection.
- **depends_on:** Optional. Type: array of strings (item ids). Empty array or missing = no dependencies. This item may run only after every listed item has completed. Use `depends_on` for ordering; do not introduce a separate `can_run_after` in the PRD schema.
- **parallel_group:** Optional. Type: string or null. Missing or null = no parallel-group constraint. Items with the same non-empty `parallel_group` may run in parallel, **subject to** `depends_on` (dependencies take precedence).
- **Phase/Task:** Phase and Task may carry the same optional fields with the same types and semantics when the generator specifies at that level.

**Complexity analysis responsibilities:**

- **Analyze subtask title and description:** Extract keywords, technical terms, and complexity indicators (e.g., "implement", "design", "integrate", "refactor")
- **Analyze acceptance criteria:** Count verification tokens (TEST:, CLI_VERIFY:, etc.), assess test complexity, identify multiple verification types
- **Analyze dependencies:** Check if subtask depends on other subtasks or external systems
- **Estimate effort:** Calculate estimated hours based on title length, description length, acceptance criteria count, dependency count
- **Identify expertise areas:** Map keywords and technical terms to expertise areas (e.g., "authentication" → security, "API" → backend, "test" → testing)

**Subagent selection logic:**

- **Map expertise areas to subagents:** Use expertise area → subagent type mapping (e.g., security → security-auditor, backend → rust-engineer, testing → test-automator)
- **Check subagent availability:** Verify subagent types are available for the platform configured for this tier
- **Apply crew templates:** Match expertise areas to crew templates (e.g., security + backend + testing → "Security Implementation Crew")
- **Generate rationale:** Create human-readable rationale explaining why crew is recommended

**Implementation:** Extend `src/start-chain/prd_generator.rs` (or equivalent) to include complexity analysis and crew recommendation logic. Add `CrewRecommendationGenerator` module.

**Integration with PRD generator:**

In `src/start-chain/prd_generator.rs` (or equivalent), extend subtask generation:

```rust
use crate::core::crews::{CrewManager, CrewRecommendationGenerator};

impl PrdGenerator {
    pub fn generate_prd_with_crew_recommendations(
        &self,
        phases: &[Phase],
        output_path: &Path,
        crew_manager: &CrewManager,
    ) -> Result<PathBuf> {
        let mut prd = self.generate_base_prd(phases)?;
        
        // Analyze each subtask and add crew recommendations
        let crew_recommender = CrewRecommendationGenerator::new(crew_manager);
        
        for phase in &mut prd.phases {
            for task in &mut phase.tasks {
                for subtask in &mut task.subtasks {
                    // Analyze subtask complexity
                    let complexity = self.analyze_subtask_complexity(subtask)?;
                    
                    // Generate crew recommendation if complexity warrants it
                    if complexity.should_suggest_crew() {
                        let recommendation = crew_recommender.suggest_crew_for_subtask(
                            subtask,
                            &complexity,
                            &task.platform_config, // Platform for this tier
                        ).await?;
                        
                        if let Some(recommendation) = recommendation {
                            subtask.crew_recommendation = Some(recommendation);
                        }
                    }
                }
            }
        }
        
        // Write PRD with crew recommendations
        self.write_prd_json(&prd, output_path)?;
        
        Ok(output_path.to_path_buf())
    }
    
    fn analyze_subtask_complexity(&self, subtask: &Subtask) -> Result<SubtaskComplexity> {
        // Extract keywords from title and description
        let title_keywords = self.extract_keywords(&subtask.title);
        let desc_keywords = self.extract_keywords(&subtask.description);
        
        // Count acceptance criteria and verification tokens
        let acceptance_criteria_count = subtask.acceptance_criteria.len();
        let verification_token_count = subtask.acceptance_criteria.iter()
            .filter(|ac| ac.contains("TEST:") || ac.contains("CLI_VERIFY:") || 
                    ac.contains("BROWSER_VERIFY:") || ac.contains("FILE_VERIFY:"))
            .count();
        
        // Identify expertise areas
        let expertise_areas = self.identify_expertise_areas(&title_keywords, &desc_keywords);
        
        // Estimate effort (hours)
        let estimated_hours = self.estimate_effort(
            &subtask.title,
            &subtask.description,
            acceptance_criteria_count,
            verification_token_count,
            subtask.dependencies.len(),
        );
        
        // Calculate complexity score (0-10)
        let complexity_score = self.calculate_complexity_score(
            estimated_hours,
            expertise_areas.len(),
            acceptance_criteria_count,
            verification_token_count,
        );
        
        Ok(SubtaskComplexity {
            estimated_hours,
            complexity_score,
            expertise_areas,
            requires_multiple_expertise: expertise_areas.len() > 1,
            acceptance_criteria_count,
            verification_token_count,
        })
    }
    
    fn identify_expertise_areas(&self, title_keywords: &[String], desc_keywords: &[String]) -> Vec<String> {
        let mut areas = Vec::new();
        let all_keywords: Vec<_> = title_keywords.iter().chain(desc_keywords.iter()).collect();
        
        // Map keywords to expertise areas
        for keyword in all_keywords {
            let keyword_lower = keyword.to_lowercase();
            if keyword_lower.contains("auth") || keyword_lower.contains("security") || 
               keyword_lower.contains("encrypt") || keyword_lower.contains("permission") {
                if !areas.contains(&"security".to_string()) {
                    areas.push("security".to_string());
                }
            }
            if keyword_lower.contains("api") || keyword_lower.contains("endpoint") || 
               keyword_lower.contains("server") || keyword_lower.contains("backend") {
                if !areas.contains(&"backend".to_string()) {
                    areas.push("backend".to_string());
                }
            }
            if keyword_lower.contains("test") || keyword_lower.contains("verify") || 
               keyword_lower.contains("assert") || keyword_lower.contains("spec") {
                if !areas.contains(&"testing".to_string()) {
                    areas.push("testing".to_string());
                }
            }
            if keyword_lower.contains("ui") || keyword_lower.contains("frontend") || 
               keyword_lower.contains("component") || keyword_lower.contains("render") {
                if !areas.contains(&"frontend".to_string()) {
                    areas.push("frontend".to_string());
                }
            }
            if keyword_lower.contains("database") || keyword_lower.contains("db") || 
               keyword_lower.contains("schema") || keyword_lower.contains("migration") {
                if !areas.contains(&"database".to_string()) {
                    areas.push("database".to_string());
                }
            }
        }
        
        areas
    }
    
    fn estimate_effort(
        &self,
        title: &str,
        description: &str,
        acceptance_criteria_count: usize,
        verification_token_count: usize,
        dependency_count: usize,
    ) -> f64 {
        // Base effort from title/description length
        let base_hours = (title.len() + description.len()) as f64 / 500.0;
        
        // Add effort for acceptance criteria (0.5 hours each)
        let criteria_hours = acceptance_criteria_count as f64 * 0.5;
        
        // Add effort for verification tokens (0.3 hours each)
        let verification_hours = verification_token_count as f64 * 0.3;
        
        // Add effort for dependencies (0.2 hours each)
        let dependency_hours = dependency_count as f64 * 0.2;
        
        // Minimum 1 hour, maximum 8 hours
        (base_hours + criteria_hours + verification_hours + dependency_hours)
            .max(1.0)
            .min(8.0)
    }
    
    fn calculate_complexity_score(
        &self,
        estimated_hours: f64,
        expertise_area_count: usize,
        acceptance_criteria_count: usize,
        verification_token_count: usize,
    ) -> f64 {
        // Normalize to 0-10 scale
        let hours_score = (estimated_hours / 8.0) * 4.0; // Max 4 points
        let expertise_score = (expertise_area_count as f64 / 5.0) * 3.0; // Max 3 points
        let criteria_score = (acceptance_criteria_count as f64 / 10.0) * 2.0; // Max 2 points
        let verification_score = (verification_token_count as f64 / 5.0) * 1.0; // Max 1 point
        
        (hours_score + expertise_score + criteria_score + verification_score)
            .min(10.0)
    }
}

impl CrewRecommendationGenerator {
    pub async fn suggest_crew_for_subtask(
        &self,
        subtask: &Subtask,
        complexity: &SubtaskComplexity,
        platform_config: &PlatformConfig,
    ) -> Result<Option<CrewRecommendation>> {
        // Only suggest crew if complexity warrants it
        if !complexity.should_suggest_crew() {
            return Ok(None);
        }
        
        // Map expertise areas to subagent types
        let subagent_types = self.map_expertise_to_subagents(&complexity.expertise_areas)?;
        
        // Filter subagents by platform availability
        let available_subagents = self.filter_by_platform(subagent_types, platform_config.platform)?;
        
        if available_subagents.is_empty() {
            return Ok(None); // No available subagents for this platform
        }
        
        // Find matching crew template
        let crew_template = self.find_matching_template(&available_subagents)?;
        
        // Generate rationale
        let rationale = format!(
            "Subtask requires {} expertise areas ({}), estimated {} hours, and {} acceptance criteria. Recommended crew: {}",
            complexity.expertise_areas.len(),
            complexity.expertise_areas.join(", "),
            complexity.estimated_hours,
            complexity.acceptance_criteria_count,
            available_subagents.join(" + ")
        );
        
        Ok(Some(CrewRecommendation {
            suggested: true,
            subagents: available_subagents,
            rationale,
            crew_template,
            complexity_score: complexity.complexity_score,
            expertise_areas: complexity.expertise_areas.clone(),
        }))
    }
    
    fn map_expertise_to_subagents(&self, expertise_areas: &[String]) -> Result<Vec<String>> {
        let mut subagents = Vec::new();
        
        for area in expertise_areas {
            match area.as_str() {
                "security" => subagents.push("security-auditor".to_string()),
                "backend" => subagents.push("rust-engineer".to_string()), // Or backend-developer
                "testing" => subagents.push("test-automator".to_string()),
                "frontend" => subagents.push("frontend-developer".to_string()),
                "database" => subagents.push("database-administrator".to_string()),
                _ => {} // Unknown expertise area
            }
        }
        
        Ok(subagents)
    }
    
    fn filter_by_platform(&self, subagents: Vec<String>, platform: Platform) -> Result<Vec<String>> {
        // Check which subagents are available for this platform
        // This would check platform_specs or subagent registry
        let available: Vec<String> = subagents.into_iter()
            .filter(|subagent| self.is_subagent_available(subagent, platform))
            .collect();
        
        Ok(available)
    }
    
    fn find_matching_template(&self, subagents: &[String]) -> Result<Option<String>> {
        // Match subagent combination to crew templates
        // E.g., ["rust-engineer", "security-auditor", "test-automator"] → "Security Implementation Crew"
        let template_map: HashMap<Vec<String>, String> = HashMap::from([
            (vec!["rust-engineer".to_string(), "security-auditor".to_string(), "test-automator".to_string()], 
             "Security Implementation Crew".to_string()),
            (vec!["rust-engineer".to_string(), "frontend-developer".to_string(), "test-automator".to_string()], 
             "Full Stack Crew".to_string()),
            // ... more templates
        ]);
        
        // Sort subagents for consistent matching
        let mut sorted_subagents = subagents.to_vec();
        sorted_subagents.sort();
        
        Ok(template_map.get(&sorted_subagents).cloned())
    }
}

impl SubtaskComplexity {
    fn should_suggest_crew(&self) -> bool {
        // Suggest crew if:
        // - Requires multiple expertise areas, OR
        // - Estimated hours > 4.0, OR
        // - Complexity score > 6.0
        self.requires_multiple_expertise || 
        self.estimated_hours > 4.0 || 
        self.complexity_score > 6.0
    }
}
```

**Integration with orchestrator:**

- Orchestrator reads `crew_recommendation` from PRD tasks/subtasks when loading PRD
- When orchestrator creates crews for tiers, it checks for `crew_recommendation` and uses it as a hint for subagent selection
- Crew recommendations guide subagent selection for orchestrator-initiated crews, but orchestrator can override based on tier configuration

**Error handling:**

- **Complexity analysis failure:** If complexity analysis fails, log warning and proceed without crew recommendation
- **Subagent mapping failure:** If expertise area → subagent mapping fails, log warning and use fallback subagents
- **Platform availability check failure:** If platform availability check fails, log warning and proceed without filtering (may suggest unavailable subagents)

### 3. Cross-Phase Crew Coordination

**Concept:** Crews can coordinate across interview phases. For example, Architecture phase crew shares decisions with Testing phase crew.

**Benefits:**
- **Consistency:** Later phases can reference decisions from earlier phases
- **Context sharing:** Crews can ask questions of previous phase crews
- **Decision validation:** Later phase crews can validate earlier phase decisions

**BeforePhase cross-phase coordination responsibilities:**

- **Load prior phase crew messages:** Load messages from previous phase crews from `.puppet-master/memory/interview-phase-{phase_id}-messages.json`
- **Load prior phase decisions:** Load decisions from previous phases from `.puppet-master/memory/interview-decisions.json`
- **Inject cross-phase context:** Add prior phase decisions and crew messages to current phase crew context
- **Set up cross-phase message routing:** Configure message board to route messages to previous phase crews (for questions/validation)

**DuringPhase cross-phase coordination responsibilities:**

- **Post decisions to message board:** When phase crew makes decisions, post them to message board with `to_tier_id` = `interview-phase-{next_phase_id}` for future phases
- **Query prior phase crews:** Current phase crew can post questions to previous phase crews via message board (routing by phase_id)
- **Validate prior decisions:** Current phase crew can validate decisions from previous phases and post validation results

**AfterPhase cross-phase coordination responsibilities:**

- **Archive phase decisions:** Save phase decisions to `.puppet-master/memory/interview-decisions.json` with phase_id key
- **Archive crew messages:** Archive crew messages with cross-phase routing information
- **Prepare for next phase:** Set up message routing for next phase to access current phase decisions

**Implementation:** Extend `src/interview/orchestrator.rs` to load prior phase messages/decisions at phase start, enable cross-phase message routing during phase execution, and archive decisions/messages at phase completion.

**Integration with interview orchestrator:**

In `src/interview/orchestrator.rs`, extend phase transition logic:

```rust
// Before starting a new phase
let before_ctx = BeforePhaseContext {
    phase_id: current_phase.id.clone(),
    phase_type: current_phase.phase_type,
    platform: config.primary_platform.platform,
    model: config.primary_platform.model.clone(),
    selected_subagents: get_phase_subagents(&config, &current_phase.id)?,
    previous_decisions: load_previous_phase_decisions(&state)?,
    detected_gui_frameworks: state.detected_gui_frameworks.clone(),
    known_gaps: get_known_gaps_for_phase(&current_phase.id)?,
};

let before_result = self.hook_registry.execute_before_phase(&before_ctx)?;

// Load prior phase crew messages and decisions
let prior_phase_messages = if current_phase.number > 1 {
    let prior_phase_id = format!("phase-{}", current_phase.number - 1);
    self.load_phase_crew_messages(&prior_phase_id).await?
} else {
    Vec::new()
};

let prior_phase_decisions = self.memory_manager.load_phase_decisions(&current_phase.id).await?;

// Create phase crew with cross-phase context
let phase_crew = if before_result.selected_subagents.len() > 1 {
    let crew_id = format!("interview-phase-{}", current_phase.id);
    
    // Inject cross-phase context into crew task
    let crew_task = format!(
        "Research and validate {} phase decisions.\n\n**Prior Phase Context:**\n{}\n\n**Prior Phase Decisions:**\n{}",
        current_phase.name,
        format_crew_messages_summary(&prior_phase_messages),
        format_decisions_summary(&prior_phase_decisions)
    );
    
    let crew = Crew {
        crew_id: crew_id.clone(),
        name: Some(format!("{} Phase Crew", current_phase.name)),
        platform: config.primary_platform.platform,
        subagents: /* ... */,
        task: crew_task,
        created_by: CrewCreator::Orchestrator { tier_id: format!("interview-phase-{}", current_phase.id) },
        created_at: Utc::now(),
        status: CrewStatus::Forming,
    };
    
    self.crew_manager.create_crew(crew).await?;
    
    // Set up cross-phase message routing
    if current_phase.number > 1 {
        let prior_phase_id = format!("interview-phase-phase-{}", current_phase.number - 1);
        self.crew_manager.enable_cross_phase_routing(&crew_id, &prior_phase_id).await?;
    }
    
    Some(crew_id)
} else {
    None
};

// After phase completes
// ... existing after phase logic ...

// Archive phase decisions and messages
if let Some(crew_id) = phase_crew {
    let messages = self.crew_manager.get_crew_messages(&crew_id).await?;
    
    // Extract decisions from messages
    let decisions: Vec<Decision> = messages.iter()
        .filter(|msg| matches!(msg.message_type, MessageType::Decision))
        .map(|msg| extract_decision_from_message(msg))
        .collect();
    
    // Save decisions to memory
    self.memory_manager.save_phase_decisions(&current_phase.id, &decisions).await?;
    
    // Archive messages
    let archive_path = format!(".puppet-master/memory/interview-phase-{}-messages.json", current_phase.id);
    std::fs::write(&archive_path, serde_json::to_string_pretty(&messages)?)?;
    
    // Disband crew
    self.crew_manager.disband_crew(&crew_id, "Phase completed").await?;
}
```

**Cross-phase message routing:**

```rust
impl CrewManager {
    pub async fn enable_cross_phase_routing(
        &self,
        current_crew_id: &str,
        prior_crew_id: &str,
    ) -> Result<()> {
        // Configure message board to allow current crew to post messages to prior crew
        // Prior crew is archived, but messages can still be posted for reference
        self.message_board.enable_cross_phase_routing(
            current_crew_id,
            prior_crew_id,
        ).await?;
        
        Ok(())
    }
    
    pub async fn post_cross_phase_question(
        &self,
        from_crew_id: &str,
        to_phase_id: &str,
        question: &str,
    ) -> Result<String> {
        // Post question to prior phase crew (archived, but accessible)
        let message = AgentMessage {
            message_id: generate_message_id(),
            from_agent_id: format!("crew-{}", from_crew_id),
            from_platform: /* ... */,
            to_agent_id: None,
            to_tier_id: Some(format!("interview-phase-{}", to_phase_id)),
            message_type: MessageType::Question,
            subject: "Cross-phase question".to_string(),
            content: question.to_string(),
            context: MessageContext {
                phase_id: Some(to_phase_id.to_string()),
                crew_id: Some(from_crew_id.to_string()),
            },
            thread_id: None,
            in_reply_to: None,
            created_at: Utc::now(),
            read_by: Vec::new(),
            resolved: false,
        };
        
        self.message_board.post_message(message).await?;
        
        Ok(message.message_id)
    }
}
```

**Error handling:**

- **Prior phase message load failure:** If loading prior phase messages fails, log warning and proceed without cross-phase context
- **Cross-phase routing failure:** If cross-phase routing setup fails, log warning and proceed without cross-phase coordination
- **Decision archive failure:** If archiving decisions fails, log error but continue (decisions may be lost, but phase can complete)

### 4. Research Crews for Tool Discovery

**Concept:** When interview performs tool research (newtools plan), use crews to coordinate multiple researchers working in parallel.

**Benefits:**
- **Parallel research:** Multiple researchers can research different tools simultaneously
- **Coordinated catalog updates:** Researchers can coordinate catalog entries
- **Conflict resolution:** Researchers can discuss conflicting tool recommendations

**BeforeResearch crew creation responsibilities:**

- **Determine research scope:** Identify GUI framework(s) to research and required research subagents
- **Create research crew:** Create crew with research subagents (e.g., `ux-researcher`, `qa-expert`, `test-automator` for GUI testing tools)
- **Assign research tasks:** Divide research scope among crew members (e.g., `ux-researcher` researches UX tools, `qa-expert` researches testing tools)
- **Initialize research coordination:** Set up message board for research crew to share findings

**DuringResearch crew coordination responsibilities:**

- **Coordinate research assignments:** Crew members post their research assignments to message board to avoid duplicates
- **Share research findings:** Crew members post findings to message board as they discover tools
- **Resolve conflicts:** If crew members find conflicting information, they discuss via message board to reach consensus
- **Coordinate catalog entries:** Before adding catalog entries, crew members review each other's proposed entries

**AfterResearch crew completion responsibilities:**

- **Validate research results:** Crew members validate each other's research results before catalog update
- **Merge research findings:** Combine findings from all crew members into unified catalog entries
- **Archive research messages:** Archive research crew messages to `.puppet-master/memory/tool-research-{research_id}-messages.json`
- **Disband research crew:** Mark crew as complete and remove from active crews

**Implementation:** Extend `src/interview/research_engine.rs` to create research crews, coordinate research operations, and disband crews after research completes.

**Integration with research engine:**

In `src/interview/research_engine.rs`, extend research operations:

```rust
impl ResearchEngine {
    pub async fn execute_research_with_crew(
        &self,
        topic: &str,
        context: &str,
        framework: Option<&str>,
        config: &InterviewOrchestratorConfig,
    ) -> Result<ResearchResult> {
        // Determine research subagents based on topic and framework
        let research_subagents = self.select_research_subagents(topic, framework)?;
        
        // Create research crew if multiple subagents
        let research_crew = if research_subagents.len() > 1 {
            let research_id = generate_research_id();
            let crew_id = format!("tool-research-{}", research_id);
            
            let crew_subagents: Vec<CrewSubagent> = research_subagents.iter()
                .map(|(agent_type, agent_id)| CrewSubagent {
                    agent_id: format!("{}-research-{}", agent_id, research_id),
                    agent_type: agent_type.clone(),
                    platform: config.primary_platform.platform,
                    tier_id: None,
                    status: SubagentStatus::Active,
                })
                .collect();
            
            // Divide research scope among crew members
            let research_tasks = self.divide_research_scope(topic, framework, &research_subagents)?;
            
            let crew = Crew {
                crew_id: crew_id.clone(),
                name: Some(format!("Tool Research Crew: {}", topic)),
                platform: config.primary_platform.platform,
                subagents: crew_subagents,
                task: format!("Research {} tools for {}", topic, framework.unwrap_or("detected framework")),
                created_by: CrewCreator::Orchestrator { tier_id: "interview-phase-8".to_string() },
                created_at: Utc::now(),
                status: CrewStatus::Active,
            };
            
            self.crew_manager.create_crew(crew).await?;
            
            // Assign research tasks to crew members
            for (i, (agent_id, task)) in research_tasks.iter().enumerate() {
                let message = AgentMessage {
                    message_id: generate_message_id(),
                    from_agent_id: "research-orchestrator".to_string(),
                    from_platform: config.primary_platform.platform,
                    to_agent_id: Some(agent_id.clone()),
                    message_type: MessageType::Request,
                    subject: "Research assignment".to_string(),
                    content: task.clone(),
                    context: MessageContext {
                        crew_id: Some(crew_id.clone()),
                        research_id: Some(research_id.clone()),
                    },
                    thread_id: None,
                    in_reply_to: None,
                    created_at: Utc::now(),
                    read_by: Vec::new(),
                    resolved: false,
                };
                
                self.crew_manager.post_to_crew(&crew_id, message).await?;
            }
            
            Some((crew_id, research_id))
        } else {
            None
        };
        
        // Execute research (with or without crew)
        let research_result = if let Some((crew_id, _)) = &research_crew {
            // Research with crew coordination
            self.execute_parallel_research_with_crew(topic, context, framework, &crew_id).await?
        } else {
            // Single-subagent research (no crew)
            self.execute_single_research(topic, context, framework).await?
        };
        
        // Disband research crew if it exists
        if let Some((crew_id, research_id)) = research_crew {
            // Archive research messages
            let messages = self.crew_manager.get_crew_messages(&crew_id).await?;
            let archive_path = format!(".puppet-master/memory/tool-research-{}-messages.json", research_id);
            std::fs::write(&archive_path, serde_json::to_string_pretty(&messages)?)?;
            
            // Disband crew
            self.crew_manager.disband_crew(&crew_id, "Research completed").await?;
        }
        
        Ok(research_result)
    }
    
    async fn execute_parallel_research_with_crew(
        &self,
        topic: &str,
        context: &str,
        framework: Option<&str>,
        crew_id: &str,
    ) -> Result<ResearchResult> {
        // Get crew members
        let crew = self.crew_manager.get_crew(crew_id).await?;
        
        // Execute research for each crew member in parallel
        let mut research_tasks = Vec::new();
        for member in &crew.subagents {
            let task = tokio::spawn({
                let crew_id = crew_id.to_string();
                let member_id = member.agent_id.clone();
                let topic = topic.to_string();
                let context = context.to_string();
                let framework = framework.map(|s| s.to_string());
                
                async move {
                    // Execute research for this crew member
                    let result = self.execute_research_for_member(
                        &member_id,
                        &topic,
                        &context,
                        framework.as_deref(),
                    ).await?;
                    
                    // Post findings to crew message board
                    let findings_message = AgentMessage {
                        message_id: generate_message_id(),
                        from_agent_id: member_id.clone(),
                        from_platform: member.platform,
                        to_agent_id: None,
                        message_type: MessageType::Update,
                        subject: format!("Research findings: {}", topic),
                        content: format!("Found {} tools:\n{}", result.tools.len(), 
                            result.tools.iter().map(|t| format!("- {}", t.name)).collect::<Vec<_>>().join("\n")),
                        context: MessageContext {
                            crew_id: Some(crew_id),
                        },
                        thread_id: None,
                        in_reply_to: None,
                        created_at: Utc::now(),
                        read_by: Vec::new(),
                        resolved: false,
                    };
                    
                    self.crew_manager.post_to_crew(&crew_id, findings_message).await?;
                    
                    Ok::<ResearchResult, Error>(result)
                }
            });
            
            research_tasks.push(task);
        }
        
        // Wait for all research tasks to complete
        let mut all_results = Vec::new();
        for task in research_tasks {
            let result = task.await??;
            all_results.push(result);
        }
        
        // Merge research results from all crew members
        let merged_result = self.merge_research_results(all_results)?;
        
        // Validate merged results (crew members review each other's findings)
        let validated_result = self.validate_research_results_with_crew(&merged_result, crew_id).await?;
        
        Ok(validated_result)
    }
    
    fn divide_research_scope(
        &self,
        topic: &str,
        framework: Option<&str>,
        subagents: &[(String, String)],
    ) -> Result<Vec<(String, String)>> {
        // Divide research scope based on subagent expertise
        let mut tasks = Vec::new();
        
        for (agent_type, agent_id) in subagents {
            let task = match agent_type.as_str() {
                "ux-researcher" => format!("Research UX tools for {} framework", framework.unwrap_or("detected")),
                "qa-expert" => format!("Research testing tools for {} framework", framework.unwrap_or("detected")),
                "test-automator" => format!("Research automation tools for {} framework", framework.unwrap_or("detected")),
                _ => format!("Research {} tools for {} framework", topic, framework.unwrap_or("detected")),
            };
            
            tasks.push((agent_id.clone(), task));
        }
        
        Ok(tasks)
    }
    
    async fn validate_research_results_with_crew(
        &self,
        results: &ResearchResult,
        crew_id: &str,
    ) -> Result<ResearchResult> {
        // Post research results to crew for validation
        let validation_message = AgentMessage {
            message_id: generate_message_id(),
            from_agent_id: "research-orchestrator".to_string(),
            from_platform: /* ... */,
            to_agent_id: None,
            message_type: MessageType::Request,
            subject: "Validate research results".to_string(),
            content: format!("Please review and validate these research results:\n{}", 
                serde_json::to_string_pretty(results)?),
            context: MessageContext {
                crew_id: Some(crew_id.to_string()),
            },
            thread_id: None,
            in_reply_to: None,
            created_at: Utc::now(),
            read_by: Vec::new(),
            resolved: false,
        };
        
        self.crew_manager.post_to_crew(crew_id, validation_message).await?;
        
        // Wait for validation responses (or timeout after 30 seconds)
        let validation_responses = self.crew_manager.wait_for_responses(
            crew_id,
            MessageType::Answer,
            chrono::Duration::seconds(30),
        ).await?;
        
        // Merge validation feedback
        let validated_results = self.apply_validation_feedback(results, &validation_responses)?;
        
        Ok(validated_results)
    }
}
```

**Error handling:**

- **Research crew creation failure:** If crew creation fails, log warning and fall back to single-subagent research
- **Research task assignment failure:** If task assignment fails, log error and proceed with available crew members
- **Research coordination failure:** If message board access fails during research, log warning and continue (crew members work independently)
- **Validation failure:** If validation fails, log warning and proceed with unvalidated results (catalog update may be incomplete)

## Lifecycle and Quality Enhancements for Interview Flow

The orchestrator plan (`Plans/orchestrator-subagent-integration.md`) defines lifecycle hooks, structured handoff validation, remediation loops, and cross-session memory. These features can enhance the **interview flow** to improve reliability, quality, and continuity across interview phases.

### 1. Interview Phase Hooks (BeforePhase/AfterPhase)

**Concept:** Apply hook-based lifecycle middleware to interview phases, similar to orchestrator tier hooks. Run **BeforePhase** and **AfterPhase** hooks at each interview phase boundary (Scope, Architecture, UX, Data, Security, Deployment, Performance, Testing).

**BeforePhase hook responsibilities:**

- **Track active subagent:** Record which subagent is active for this phase (e.g., `product-manager` for Phase 1, `architect-reviewer` for Phase 2) in interview state.
- **Inject phase context:** Add current phase status, previous phase decisions, detected GUI frameworks, and known gaps to subagent prompt or context.
- **Load cross-session memory:** Load prior interview decisions (architecture, patterns, tech choices) from `.puppet-master/memory/` and inject into phase context.
- **Prune stale state:** Clean up old interview state files older than threshold (e.g., 2 hours).

**AfterPhase hook responsibilities:**

- **Validate subagent output format:** Check that phase subagent output matches structured handoff contract (see orchestrator plan §2).
- **Track completion:** Update active subagent tracking, mark phase completion state.
- **Save memory:** Persist architectural decisions, patterns, tech choices from this phase to `.puppet-master/memory/` (especially Architecture & Technology phase).
- **Safe error handling:** Guarantee structured output even on hook failure.

**Implementation:** Create `src/interview/hooks.rs` with `BeforePhaseHook` and `AfterPhaseHook` traits. Register hooks per phase type. Call hooks automatically at phase boundaries (before `process_ai_turn` for a new phase, after phase completion). Use the same hook registry pattern as orchestrator hooks (`HookRegistry`), but with interview-specific contexts.

**Integration with interview orchestrator:**

In `src/interview/orchestrator.rs`, modify phase transition logic:

```rust
// Before starting a new phase
let before_ctx = BeforePhaseContext {
    phase_id: current_phase.id.clone(),
    phase_type: current_phase.phase_type,
    platform: config.primary_platform.platform,
    model: config.primary_platform.model.clone(),
    selected_subagents: get_phase_subagents(&config, &current_phase.id)?,
    previous_decisions: load_previous_phase_decisions(&state)?,
    detected_gui_frameworks: state.detected_gui_frameworks.clone(),
    known_gaps: get_known_gaps_for_phase(&current_phase.id)?,
};

let before_result = self.hook_registry.execute_before_phase(&before_ctx)?;

// Inject context into prompt if provided
let prompt = if let Some(injected) = before_result.injected_context {
    format!("{}\n\n{}", prompt, injected)
} else {
    prompt
};

// After phase completes
let after_ctx = AfterPhaseContext {
    phase_id: current_phase.id.clone(),
    phase_type: current_phase.phase_type,
    platform: config.primary_platform.platform,
    subagent_output: phase_output.clone(),
    completion_status: if phase_complete { CompletionStatus::Success } else { CompletionStatus::Warning("Incomplete".to_string()) },
    question_count: state.current_phase_qa.len(),
};

let after_result = self.hook_registry.execute_after_phase(&after_ctx)?;

// Save memory if Architecture phase
if current_phase.phase_type == PhaseType::ArchitectureTechnology {
    self.memory_manager.save_architecture_decisions(&extract_decisions(&phase_output)).await?;
}
```

### 2. Structured Handoff Validation for Interview Subagents

**Concept:** Enforce structured output format for interview subagent invocations (research, validation, document generation). Use the same `SubagentOutput` format as orchestrator (task_report, downstream_context, findings).

**Platform-specific parsing:**

- **Research subagents:** Parse research output (e.g., from `research_pre_question_with_subagent`) as structured `SubagentOutput` with `task_report` = research summary, `downstream_context` = key findings for next question, `findings` = validation issues or gaps.
- **Validation subagents:** Parse validation output (e.g., from `validate_answer_with_subagent`) as structured `SubagentOutput` with `task_report` = validation summary, `findings` = severity-coded issues (Critical/Major/Minor/Info).
- **Document generation subagents:** Parse document enhancement output as structured `SubagentOutput` with `task_report` = enhancement summary, `downstream_context` = document path.

**Integration:** Extend `src/interview/research_engine.rs` and validation methods to use `validate_subagent_output()` from orchestrator hooks. On validation failure, request one retry with format instruction; after retry, proceed with partial output but mark phase as "complete with warnings."

### 3. Cross-Session Memory for Interview Decisions

**Concept:** Persist interview decisions (architecture, patterns, tech choices) to `.puppet-master/memory/` so future interview runs or orchestrator runs can load prior context.

**What to persist from interview:**

- **Architectural decisions:** Tech stack choices, design patterns, framework selections (from Architecture & Technology phase).
- **Established patterns:** Code organization, naming conventions, testing strategies (from Testing & Verification phase).
- **Tech choices:** Dependency versions, tool configurations (from Architecture phase and technology matrix).
- **GUI framework decisions:** Selected framework tools, custom headless tool plans (from Testing phase and newtools plan).

**When to persist:**

- **At phase completion:** Especially Architecture & Technology phase (save architectural decisions), Testing & Verification phase (save patterns and tool choices).
- **At interview completion:** Save all accumulated decisions and patterns.

**When to load:**

- **At interview start:** Load all memory files and inject into Phase 1 (Scope & Goals) context.
- **At each phase start:** Load relevant memory (e.g., Architecture phase loads prior architectural decisions).

**Integration:** Use the same `MemoryManager` from orchestrator plan (`src/core/memory.rs`). In interview orchestrator, call `memory_manager.save_architecture_decisions()`, `save_pattern()`, `save_tech_choice()` at phase completion. Call `memory_manager.load_all_for_prompt()` at interview start and inject into Phase 1 prompt.

### 4. Active Agent Tracking for Interview Phases

**Concept:** Track which subagent is currently active at each interview phase. Store in interview state and expose for logging, debugging, and audit trails.

**BeforePhase tracking responsibilities:**

- **Determine active subagent:** Determine which subagent is active for this phase (from `SubagentConfig.phase_subagents` or override)
- **Set active subagent:** Set `active_subagent` in `InterviewPhaseState` for current phase
- **Update interview tracking:** Update `active_subagents` HashMap in interview orchestrator state
- **Persist tracking state:** Write active subagent tracking to `.puppet-master/interview/active-subagents.json`
- **Log tracking event:** Log active subagent change to `.puppet-master/logs/interview.log`

**DuringPhase tracking responsibilities:**

- **Monitor subagent status:** Monitor subagent execution status (active, waiting, blocked, complete)
- **Update tracking on status change:** Update tracking state when subagent status changes
- **Persist status changes:** Persist status changes to active-subagents.json

**AfterPhase tracking responsibilities:**

- **Clear active subagent:** Clear `active_subagent` in `InterviewPhaseState` when phase completes
- **Update interview tracking:** Remove phase entry from `active_subagents` HashMap (or mark as complete)
- **Persist final state:** Persist final tracking state to active-subagents.json
- **Archive tracking:** Archive tracking data to `.puppet-master/memory/interview-{interview_id}-subagents.json`

**Implementation:** Extend `src/interview/orchestrator.rs` and `src/interview/state.rs` to track active subagents.

**Integration with interview orchestrator:**

In `src/interview/orchestrator.rs`, extend phase transition logic:

```rust
use crate::interview::state::{InterviewPhaseState, ActiveSubagentTracker};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActiveSubagentState {
    pub phase_id: String,
    pub subagent_name: String,
    pub started_at: chrono::DateTime<Utc>,
    pub status: SubagentStatus,
    pub last_update: chrono::DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SubagentStatus {
    Active,
    Waiting,
    Blocked,
    Complete,
}

impl InterviewOrchestrator {
    pub async fn start_phase(
        &self,
        phase_id: &str,
    ) -> Result<()> {
        // Determine active subagent for this phase
        let active_subagent = self.get_active_subagent_for_phase(phase_id)?;
        
        if let Some(subagent_name) = active_subagent {
            // Set active subagent in phase state
            self.state.set_active_subagent(phase_id, &subagent_name).await?;
            
            // Update interview tracking
            let tracking_state = ActiveSubagentState {
                phase_id: phase_id.to_string(),
                subagent_name: subagent_name.clone(),
                started_at: Utc::now(),
                status: SubagentStatus::Active,
                last_update: Utc::now(),
            };
            
            self.active_subagent_tracker.add_tracking(tracking_state).await?;
            
            // Persist tracking state
            self.persist_active_subagent_tracking().await?;
            
            // Log tracking event
            tracing::info!("Phase {}: active subagent = {}", phase_id, subagent_name);
        }
        
        // Continue with phase start...
        Ok(())
    }
    
    pub async fn complete_phase(
        &self,
        phase_id: &str,
    ) -> Result<()> {
        // Clear active subagent
        self.state.clear_active_subagent(phase_id).await?;
        
        // Update tracking status to Complete
        if let Some(tracking) = self.active_subagent_tracker.get_tracking(phase_id).await? {
            let mut updated = tracking.clone();
            updated.status = SubagentStatus::Complete;
            updated.last_update = Utc::now();
            self.active_subagent_tracker.update_tracking(updated).await?;
        }
        
        // Persist final state
        self.persist_active_subagent_tracking().await?;
        
        // Archive tracking
        self.archive_active_subagent_tracking(phase_id).await?;
        
        Ok(())
    }
    
    async fn persist_active_subagent_tracking(&self) -> Result<()> {
        let tracking_data = self.active_subagent_tracker.get_all_tracking().await?;
        let path = self.config.working_directory.join(".puppet-master/interview/active-subagents.json");
        
        std::fs::create_dir_all(path.parent().unwrap())?;
        std::fs::write(&path, serde_json::to_string_pretty(&tracking_data)?)?;
        
        Ok(())
    }
    
    async fn archive_active_subagent_tracking(&self, phase_id: &str) -> Result<()> {
        let tracking = self.active_subagent_tracker.get_tracking(phase_id).await?;
        
        if let Some(tracking) = tracking {
            let archive_path = format!(
                ".puppet-master/memory/interview-{}-subagents.json",
                self.state.interview_id
            );
            
            // Load existing archive or create new
            let mut archive: Vec<ActiveSubagentState> = if std::path::Path::new(&archive_path).exists() {
                serde_json::from_str(&std::fs::read_to_string(&archive_path)?)?
            } else {
                Vec::new()
            };
            
            archive.push(tracking);
            
            std::fs::write(&archive_path, serde_json::to_string_pretty(&archive)?)?;
        }
        
        Ok(())
    }
}

impl ActiveSubagentTracker {
    pub async fn add_tracking(&self, tracking: ActiveSubagentState) -> Result<()> {
        // Add to in-memory tracking
        self.tracking.insert(tracking.phase_id.clone(), tracking);
        Ok(())
    }
    
    pub async fn update_tracking(&self, tracking: ActiveSubagentState) -> Result<()> {
        // Update in-memory tracking
        self.tracking.insert(tracking.phase_id.clone(), tracking);
        Ok(())
    }
    
    pub async fn get_tracking(&self, phase_id: &str) -> Result<Option<ActiveSubagentState>> {
        Ok(self.tracking.get(phase_id).cloned())
    }
    
    pub async fn get_all_tracking(&self) -> Result<Vec<ActiveSubagentState>> {
        Ok(self.tracking.values().cloned().collect())
    }
}
```

**Error handling:**

- **Subagent determination failure:** If active subagent cannot be determined, log warning and proceed without tracking
- **Tracking persistence failure:** If tracking persistence fails, log error but continue (tracking is informational)
- **Archive failure:** If archive fails, log warning but continue (archive is for historical reference)

**Use cases:**

- **Logging:** "Phase 2 (Architecture): active subagent = architect-reviewer"
- **Debugging:** "Why did this phase fail? Check active subagent logs."
- **Audit trails:** "Which subagents ran in this interview? See active-subagents.json."
- **GUI display:** Show active subagent in interview phase status UI.

### 5. Remediation Loop for Interview Answer Validation

**Concept:** When validation subagent finds Critical or Major issues with an interview answer, block phase completion and enter a remediation loop. Re-run validation until Critical/Major findings are resolved or escalated.

**Severity levels:**

- **Critical:** Security vulnerabilities, breaking architecture decisions, incompatible tech choices -- **block phase completion**.
- **Major:** Performance issues, maintainability problems, missing requirements -- **block phase completion**.
- **Minor:** Code style, minor optimizations, suggestions -- **log and proceed**.
- **Info:** Documentation, comments, non-blocking recommendations -- **log and proceed**.

**Remediation loop:**

1. Validation subagent runs after user answer (per existing plan).
2. Parse findings from `SubagentOutput.findings`.
3. Filter Critical/Major findings.
4. If Critical/Major exist:
   - Mark phase as "incomplete" (not "complete with warnings").
   - Prepend findings to phase context.
   - Re-prompt user with remediation request (e.g., "Critical/Major findings: ... Please revise your answer.").
   - Re-run validation subagent.
   - Repeat until Critical/Major resolved or max retries (e.g., 3).
   - If max retries reached, escalate to next phase with warnings or pause for user intervention.
5. If only Minor/Info findings: log, mark phase complete, proceed.

**Integration:** Extend `validate_answer_with_subagent()` in interview orchestrator to parse structured findings and enforce remediation loop. Use the same `RemediationLoop` implementation from orchestrator plan (`src/core/remediation.rs`), adapted for interview context (re-prompt user instead of re-running executor subagent).

### 6. Safe Error Handling for Interview Hooks

**Concept:** Interview hooks and validation functions must never crash the interview session. Use wrappers that guarantee structured output even on failure.

**Application:**

- **BeforePhase/AfterPhase hooks:** Wrap hook execution in `safe_hook_main` so hooks never crash.
- **Validation functions:** Return `Result<ValidationResult, ValidationError>` with structured error types.
- **Subagent output parsing:** On parse failure, return partial `SubagentOutput` rather than crashing.

**Integration:** Use the same `safe_hook_main` wrapper from orchestrator hooks. Wrap all interview hook executions and validation calls.

### Implementation Notes

- **Where:** New module `src/interview/hooks.rs` for interview-specific hooks; reuse `src/core/memory.rs` and `src/core/remediation.rs` from orchestrator plan.
- **What:** Implement `BeforePhaseHook` and `AfterPhaseHook` traits; integrate with `MemoryManager` for persistence; use `validate_subagent_output()` for structured handoff; use `RemediationLoop` for validation remediation.
- **When:** Hooks run automatically at phase boundaries; memory persists at phase completion and loads at interview start; remediation loop runs when Critical/Major findings detected.

**Cross-reference:** See orchestrator plan "Lifecycle and Quality Features" for full implementation details of hooks, structured handoff, remediation loops, and memory persistence. See orchestrator plan "Puppet Master Crews" for crew implementation details and how crews can enhance interview phases.

## Next Steps

1. Review and approve this plan
2. Implement Phase 1 (Configuration & Infrastructure)
3. Test subagent discovery and invocation
4. Iterate on implementation phases
5. Measure quality improvements
6. **Enhancement:** Integrate lifecycle hooks, structured handoff, memory persistence, and remediation loops (see section above)

## GUI gaps: Interview tab

The Config view has an **Interview** tab (tab index 6) bound to `InterviewGuiConfig`. The following gaps must be closed so interview behavior is controllable from the UI and correctly wired to the run.

### Agent activity and progress visibility (document creation and Multi-Pass Review)

During **interview document creation** (phase documents, AGENTS.md, PRD, etc.) and during **Multi-Pass Review** (§5.4), the user should **see the agents working** (like in Assistant chat), not just a spinner.

**Where to show it -- two places (redundant):**

- We are already in the **interviewer chat** window when document creation or Multi-Pass Review runs.
  1. **In the interviewer chat:** Stream agent output (e.g. "Writing Scope document...", "Reviewing document 3 of 15...", subagent activity) into the chat so the user sees it there.
  2. **Agent activity pane on the same page:** Also show the same (or equivalent) activity in an **agent activity pane** on the Interview page, redundant with the chat. That's acceptable because the user isn't using the pane for anything else during that flow. So the Interview view shows the process in **both** the chat and the pane.

**Progress indicator:**

- **Progress bar or status strip** (on the same page) showing **which documents are in progress** and **how many remain**.
- **Document creation:** E.g. "Writing phase 4 document -- 5 of 8 remaining" or "Writing AGENTS.md..."
- **Multi-Pass Review:** E.g. "Reviewing document 7 of 15 -- 9 subagents active" or "Whole-set review pass 2 of 3."

**Pause, cancel, resume:**

- Provide **pause**, **cancel**, and **resume** as user options during document creation and during Multi-Pass Review. Pause suspends the run; cancel stops and does not apply changes; resume continues from where paused. **Recovery** (newfeatures §4) should persist "in progress" state so after cancel or crash the user sees "run was interrupted" and can resume or start over.

**Agent activity pane -- same placement rule everywhere:**

- The agent activity pane sits **on the same page where the action is triggered**. That includes the **Interview** page: show the pane there too (redundant with the chat, as above). For **Requirements Doc Builder** and **Multi-Pass Review** when triggered from the wizard/requirements step, the pane is on that page (chain-wizard section 3.5). So the pane appears in **two places** -- requirements/wizard page and Interview page -- and in Interview we show it in both the chat and the pane.

**Implementation:** Feed normalized Provider events from document generation and Multi-Pass Review into (1) interviewer chat when in Interview, and (2) the agent activity pane on the same page (Interview page or wizard/requirements page where triggered). In Interview, chat and pane are redundant. Progress state (current document, remaining count, subagents active) comes from the orchestrator or review coordinator and drives the progress UI. Align with chain-wizard section 3.5 and assistant-chat-design for streaming/events.

**Primary surface on Interview page:** When on the Interview page, the **interviewer chat** is the primary surface for streaming agent output during document creation and Multi-Pass Review. The **agent activity pane** on the same page shows the same stream (synchronized from the same event source). If the pane is collapsed or hidden, chat still shows full stream.

**Preview section and document pane (required):**
- Interview page preview section must show the Multi-Pass findings summary and the final approval gate (`Accept | Reject | Edit`).
- Interview page also includes a separate embedded document pane (not the agent activity pane) for reviewing/editing human-readable interview artifacts.
- Document pane includes `Plan graph` as a read-only rendered view and shows notice: `Talk to Assistant to edit plan graph.`

**Final approval recovery state (required):**
- Recovery persistence must include whether the run is `awaiting_final_approval`.
- On restore, show the same findings summary and final approval UI for the interrupted run.
- Restore selected document/document-pane view where possible so the user returns to the same approval context.

**Progress indicator format:** Use a **status strip** (single line) above or below the pane: left = current step text (e.g. "Writing phase 4 document -- 5 of 8 remaining"); right = optional determinate progress bar (e.g. 5/8) when total is known. When total is unknown, show indeterminate progress bar. Stale rule: same as chain-wizard §3.5 (30s then "Progress stalled -- last update 30s ago").

**Pause/cancel/resume and feedback:** Same as chain-wizard §3.5: control row (Pause | Resume | Cancel), Cancel confirmation modal, toasts for "Run cancelled...", "Resuming...", "Run resumed." States: idle, generating, reviewing, paused, cancelling, cancelled, interrupted, complete, error.

**Already in GUI (gui_config.rs)**

- `platform`, `model`, `reasoning_level`, `backup_platforms`, `max_questions_per_phase`, `first_principles`, `output_dir`, `require_architecture_confirmation`, `generate_playwright_requirements`, `generate_initial_agents_md`, `vision_provider`.

**Gaps (add or wire)**

| Item | Current state | Action |
|------|----------------|--------|
| **min_questions_per_phase** | Not in `InterviewGuiConfig` | Add field (default e.g. 1); add number input in Interview tab; wire into `InterviewOrchestratorConfig` and use in phase-complete logic. |
| **max_questions_per_phase** | Present; single number | Add **"Unlimited"** option (e.g. checkbox or special value 0 = unlimited) so users can allow unbounded questions per phase; wire to orchestrator (phase stops when min met and either max reached or unlimited). |
| **Wiring to InterviewOrchestratorConfig** | Several GUI fields are not passed to the interview orchestrator at runtime | Per orchestrator plan Gaps: add `min_questions_per_phase`, `max_questions_per_phase` (with unlimited), `require_architecture_confirmation`, `vision_provider` to `InterviewOrchestratorConfig`; set from `gui_config.interview` in `app.rs` when starting the interview; use in phase_manager and prompt/research flows. |
| **generate_initial_agents_md** | In GUI; default in code is `true` | Ensure default and tooltip reflect §5.1: when true, generated AGENTS.md includes DRY and Technology & version constraints. Tooltip: "Generate AGENTS.md at project root with DRY method and technology/version rules from the interview." |
| **Multi-Pass Review (section 5.4)** | Not in GUI | Add: on/off, number of reviews (default 3, max 10), max subagents spawn (default 9, max 20) **with warning** "This will go through token usage quickly," use different models (y/n), model/provider list, findings summary preview, and one final approval gate (`Accept | Reject | Edit`). Wire into interview run config. |
| **Agent activity view and progress** | Not in GUI | **(1) Pane:** Add an **agent activity pane** on the Interview view and on the wizard/requirements page when Builder or Multi-Pass Review is triggered there. Pane: read-only, chat-like, min height 120px, max 500 lines, monospace; same event source as interviewer chat when on Interview page (redundant display). **(2) Progress:** Add a **status strip** with current step text and optional determinate/indeterminate progress bar; canonical states: idle, generating, reviewing, paused, cancelling, cancelled, interrupted, complete, error. **(3) Controls:** Pause | Resume | Cancel in one row; Cancel with confirmation modal; toasts for cancel/resume. **(4) Recovery:** Persist run checkpoint (run_type, run_id, step_index, document_index, etc.) per chain-wizard §3.5; on restore show "Run was interrupted" with "Resume from checkpoint" / "Start over." **(5) Settings (optional):** In Interview tab, add "Show agent activity pane by default" (default true) and persist pane visible/collapsed and split ratio in redb per project. |

**Config and storage for Multi-Pass Review and Agent activity**

- **Multi-Pass Review (Interview, section 5.4):** Store under **redb** namespace `settings`, key pattern `project.{project_id}.interview.multi_pass_review` (or app-level if not project-scoped). Fields: `enabled` (bool, default false), `number_of_reviews` (u32, default 3, min 1, max 10), `max_subagents_spawn` (u32, default 9, min 1, max 20), `use_different_models` (bool, default true), `model_provider_list` (array of { model, provider }, default from platform_specs). Validation: on save, clamp to min/max; invalid model/provider entries dropped with a toast. UI: Interview tab, collapsible card "Multi-Pass Review" with toggles and number inputs; warning next to max_subagents_spawn: "This will go through token usage quickly." Final approval state is persisted so interrupted runs restore to findings + approval.
- **Multi-Pass Review (Requirements Doc Builder, chain-wizard section 5.6):** Store under `project.{project_id}.wizard.multi_pass_review`. Same semantics and field shape (`model_provider_list`), with separate keys so Requirements and Interview Multi-Pass Review can have different defaults.
- **Agent activity pane preferences:** redb: `project.{project_id}.ui.agent_activity_pane_visible` (bool, default true), `project.{project_id}.ui.agent_activity_pane_height_ratio` (f32, 0.1..0.9, default 0.35). Optional: Show agent activity pane toggle and splitter persistence.

**Placement in Interview tab**

- Use existing widgets (e.g. `responsive_form_row`, `styled_text_input`, toggler, help_tooltip). Add a row "Min questions per phase" and "Max questions per phase" (with "Unlimited" checkbox or 0 = unlimited). Keep layout consistent with other Interview tab controls. Run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` after UI changes (DRY, per AGENTS.md).

**Cross-reference**

- MiscPlan §7.5: Cleanup/evidence UI lives in Config → Advanced; Interview tab is separate. No overlap.
- Orchestrator plan Gaps: "Interviewer Enhancements and Config Wiring" -- same wiring requirement for interview config.

**Unwired interview config (implementation status)**

As of the final sweep, the following are **not** wired in code:

- **InterviewOrchestratorConfig** does not have: `min_questions_per_phase`, `max_questions_per_phase` (or unlimited), `require_architecture_confirmation`, `vision_provider`. Phase definitions in `phase_manager.rs` use hardcoded `min_questions: 3`, `max_questions: 8`.
- **app.rs** (where interview config is built for the orchestrator) passes only: `generate_initial_agents_md`, `generate_playwright_requirements`, plus project/platform/output/feature fields. It does **not** pass the four items above.
- **InterviewGuiConfig** does not have `min_questions_per_phase`; the Interview tab has no "Unlimited" for max.

When implementing, add the fields to `InterviewOrchestratorConfig` and `InterviewGuiConfig`, set them from `gui_config.interview` in app.rs when starting the interview, and use them in phase_manager and research flows. See also **MiscPlan §9.1.18** for the consolidated unwired/GUI sweep.

## Subagent File Management

### Current State
Subagent files are currently located in `.claude/agents/` directory (41 subagent persona files, including explore).

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
    
    // DRY:FN:platform_agents_dir — Get platform-specific agents directory path
    // DRY REQUIREMENT: MUST use platform_specs::get_agents_directory_name() — NEVER hardcode platform-specific directory paths
    fn platform_agents_dir(project_dir: &Path, platform: Platform) -> PathBuf {
        // DRY: Use platform_specs to get agents directory (DRY:DATA:platform_specs)
        // DO NOT use match statements like: match platform { Platform::Cursor => ".cursor/agents", ... }
        let agents_dir_name = platform_specs::get_agents_directory_name(platform);
        project_dir.join(agents_dir_name)
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
    // DRY:FN:invoke_subagent — Build platform-specific subagent invocation prompt
    // DRY REQUIREMENT: MUST use platform_specs::get_subagent_invocation_format() — NEVER hardcode platform-specific invocation formats
    pub fn invoke_subagent(
        platform: Platform,
        subagent_name: &str,
        task: &str,
        context: &SubagentContext,
    ) -> String {
        // DRY: Use platform_specs to get subagent invocation format (DRY:DATA:platform_specs)
        // DO NOT use match statements like: match platform { Platform::Cursor => format!("/{} {}", ...), ... }
        let invocation_format = platform_specs::get_subagent_invocation_format(platform)
            .unwrap_or_else(|| {
                // Fallback: use generic format if platform_specs doesn't have specific format
                format!("As {}, {}", subagent_name, task)
            });
        
        // Format invocation using platform-specific format from platform_specs
        invocation_format
            .replace("{subagent}", subagent_name)
            .replace("{task}", task)
            // Handle platform-specific context (e.g., Copilot fleet/delegate)
            .replace("{context}", &format_context_for_platform(platform, context))
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


## User-Project Output Contract (Sharded Graph Default)

For user projects, Interviewer/Wizard outputs must target `.puppet-master/project/` and not rely on any user-project `Plans/` directory.

Required artifact set:

- `.puppet-master/project/requirements.md`
- `.puppet-master/project/contracts/`
- `.puppet-master/project/contracts/index.json`
- `.puppet-master/project/plan.md`
- `.puppet-master/project/glossary.md` (optional, recommended)
- `.puppet-master/project/plan_graph/index.json`
- `.puppet-master/project/plan_graph/nodes/<node_id>.json`
- `.puppet-master/project/plan_graph/edges.json` (optional)
- `.puppet-master/project/acceptance_manifest.json`
- `.puppet-master/project/auto_decisions.jsonl`
- `.puppet-master/project/evidence/<node_id>.json` (produced during execution; schema `pm.evidence.schema.v1`)

Canonical rules:

- Sharded plan graph is the default output (index + node shards).
- `plan.md` remains mandatory as the human-readable summary for operators.
- Contract pack uses stable `ProjectContract:*` IDs resolved via `contracts/index.json`; every node must reference at least one project contract ID.
- All artifacts above must be persisted canonically in seglog as full-content artifact events.

### Contract Layer Crosswalk (User Project)

| Concern | Contract |
|---|---|
| Canonical requirements | `.puppet-master/project/requirements.md` |
| Contract pack | `.puppet-master/project/contracts/` + `contracts/index.json` |
| Human plan summary | `.puppet-master/project/plan.md` |
| Project glossary (optional) | `.puppet-master/project/glossary.md` |
| Machine plan graph | `.puppet-master/project/plan_graph/index.json` + `nodes/<node_id>.json` (+ optional `edges.json`) |
| Acceptance index | `.puppet-master/project/acceptance_manifest.json` |
| Deterministic decision stream | `.puppet-master/project/auto_decisions.jsonl` |
| Execution evidence (per node) | `.puppet-master/project/evidence/<node_id>.json` |

Authoritative schema and persistence contract: `Plans/Project_Output_Artifacts.md`.

### Event Model Update: `interview.artifact.generated`

`interview.artifact.generated` must cover each required artifact type under `.puppet-master/project/...`.

Required payload fields:

- `run_id`
- `artifact_type`
- `logical_path`
- `content_type`
- `content` (full content or chunk payload)
- `sha256`
- `chunk_index` (required for chunked payloads)
- `chunk_count` (required for chunked payloads)
- `integrity_finalized` (true on final integrity event)

Allowed `artifact_type` values for user-project planning output:

- `requirements`
- `contracts_pack`
- `plan_human`
- `plan_graph_index`
- `plan_graph_node`
- `plan_graph_edges`
- `acceptance_manifest`
- `auto_decisions`
- `glossary` (optional)

Large payload handling:

- Emit deterministic chunk sequence events.
- Emit final integrity event with canonical `sha256` for reconstructed content.

### Execution-Critical Node Shard Fields

Execution-critical requirements apply to each node shard file at `.puppet-master/project/plan_graph/nodes/<node_id>.json`.

Required fields:

- `node_id`
- `objective`
- `contract_refs`
- `acceptance`
- `evidence_required`
- `allowed_tools`
- `tool_policy_mode`
- `policy_mode`
- `change_budget`
- `blockers`
- `unblocks`

Determinism rules:

- Node IDs are stable/deterministic and non-random.
- In-file `node_id` must match `<node_id>` in filename exactly.

### Auto-Decisions Output Path

For user-project outputs, deterministic decisions are recorded at `.puppet-master/project/auto_decisions.jsonl`.

## Change Summary

- 2026-02-23: Added user-project artifact contract requiring `.puppet-master/project/...` outputs and sharded plan graph default.
- 2026-02-23: Added `interview.artifact.generated` payload contract for full-content/chunked seglog artifact persistence.
- 2026-02-23: Added execution-critical shard-node field requirements and deterministic node ID constraints.
- 2026-02-23: Added explicit auto-decisions output path `.puppet-master/project/auto_decisions.jsonl` and SSOT link to `Plans/Project_Output_Artifacts.md`.
- 2026-02-23: Updated user-project artifact set to include `contracts/index.json`, optional `glossary.md`, execution evidence outputs, and node `tool_policy_mode` + stable `ProjectContract:*` references (per `Plans/Project_Output_Artifacts.md`).
- 2026-02-23: Added cross-plan alignment section requiring adaptive phase selection and Contract Layer generation via contract fragments + deterministic Contract Unification Pass (referencing chain-wizard + Project_Output_Artifacts SSOT).
