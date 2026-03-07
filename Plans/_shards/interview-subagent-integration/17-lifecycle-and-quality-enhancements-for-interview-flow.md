## Lifecycle and Quality Enhancements for Interview Flow

The orchestrator plan (`Plans/orchestrator-subagent-integration.md`) defines lifecycle hooks, structured handoff validation, remediation loops, and cross-session memory. These features can enhance the **interview flow** to improve reliability, quality, and continuity across interview phases.

### 1. Interview Phase Hooks (BeforePhase/AfterPhase)

**Concept:** Apply hook-based lifecycle middleware to interview phases, similar to orchestrator tier hooks. Run **BeforePhase** and **AfterPhase** hooks at each interview phase boundary (Scope, Architecture, UX, Data, Security, Deployment, Performance, Testing).

**BeforePhase hook responsibilities:**

- **Track active subagent:** Record which subagent is active for this phase (e.g., `product-manager` for Phase 1, `architect-reviewer` for Phase 2) in interview state.
- **Inject phase context:** Add current phase status, previous phase decisions, detected GUI frameworks, and known gaps to subagent prompt or context.
- **Load cross-session memory:** Load prior interview decisions (architecture, patterns, tech choices) from canonical memory projections (seglog/redb-backed) and inject into phase context.
- **Prune stale state:** Clean up or compact stale projections/checkpoints per canonical storage policy; do not rely on deleting ad-hoc files as the primary lifecycle mechanism.

**AfterPhase hook responsibilities:**

- **Validate subagent output format:** Check that phase subagent output matches structured handoff contract (see orchestrator plan §2).
- **Track completion:** Update active subagent tracking, mark phase completion state.
- **Save memory:** Persist architectural decisions, patterns, tech choices from this phase to canonical interview memory storage (especially Architecture & Technology phase).
- **Safe error handling:** Guarantee structured output even on hook failure.

**Implementation:** Create `src/interview/hooks.rs` with `BeforePhaseHook` and `AfterPhaseHook` traits. Register hooks per phase type. Call hooks automatically at phase boundaries (before `process_ai_turn` for a new phase, after phase completion). Use the same hook registry pattern as orchestrator hooks (`HookRegistry`), but with interview-specific contexts. Any file-path examples in this section are legacy examples only; rewrite-era canonical persistence is seglog + redb projection.

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

**Skill: validate-all (Resolved):**
`validate_all` runs all registered validators for the current interview phase. Each validator checks one aspect of the phase output (completeness, consistency, schema conformance). Validators are registered per-phase in the interview config. Results are aggregated into a `validation.summary` seglog event. If any validator returns `fail`, the phase is marked as `needs_review`.

### 3. Cross-Session Memory for Interview Decisions

**Concept:** Persist interview decisions (architecture, patterns, tech choices) to canonical interview memory storage so future interview runs or orchestrator runs can load prior context.

**What to persist from interview:**

- **Architectural decisions:** Tech stack choices, design patterns, framework selections (from Architecture & Technology phase).
- **Established patterns:** Code organization, naming conventions, testing strategies (from Testing & Verification phase).
- **Tech choices:** Dependency versions, tool configurations (from Architecture phase and technology matrix).
- **GUI framework decisions:** Selected framework tools, custom headless tool plans (from Testing phase and newtools plan).

**When to persist:**

- **At phase completion:** Especially Architecture & Technology phase (save architectural decisions), Testing & Verification phase (save patterns and tool choices).
- **At interview completion:** Save all accumulated decisions and patterns.

**When to load:**

- **At interview start:** Load all canonical memory projections and inject into Phase 1 (Scope & Goals) context.
- **At each phase start:** Load relevant memory (e.g., Architecture phase loads prior architectural decisions).

**Integration:** Use the same `MemoryManager` from orchestrator plan (`src/core/memory.rs`). In interview orchestrator, call `memory_manager.save_architecture_decisions()`, `save_pattern()`, `save_tech_choice()` at phase completion. Call `memory_manager.load_all_for_prompt()` at interview start and inject into Phase 1 prompt.

**Resume / checkpoint rule (normative):**
- At minimum, persist `interview_id`, `wizard_id`, `phase_plan`, `current_phase_id`, `awaiting_user_answer`, `awaiting_final_approval`, `active_run_kind`, `active_validation_issue_ids[]`, and references to the latest staged artifact bundle / quality report.
- Resume MUST reconstruct the same effective phase order and the same unresolved issue set; it MUST NOT silently regenerate a different plan on restore.

ContractRef: Primitive:Seglog, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/Project_Output_Artifacts.md

### 4. Active Agent Tracking for Interview Phases

**Concept:** Track which subagent is currently active at each interview phase. Store in interview state and expose for logging, debugging, and audit trails.

**Canonical visibility rule:**
- The Interview surface, shared Agent Activity Pane, and any audit projection must display/request the same fields: `requested_persona_id`, `effective_persona_id`, `selection_reason`, `provider`, `model`, and skipped unsupported controls if any. This aligns Interview-specific visibility with the shared runtime-display rules added in `Plans/assistant-chat-design.md`, `Plans/FinalGUISpec.md`, and `Plans/Models_System.md`.

**BeforePhase tracking responsibilities:**

- **Determine active subagent:** Determine which subagent is active for this phase (from `SubagentConfig.phase_subagents` or override)
- **Set active subagent:** Set `active_subagent` in `InterviewPhaseState` for current phase
- **Update interview tracking:** Update `active_subagents` HashMap in interview orchestrator state
- **Persist tracking state:** Persist active subagent tracking to canonical interview state projection (optionally mirrored to a debug file)
- **Log tracking event:** Emit a structured runtime event for active-subagent changes

**DuringPhase tracking responsibilities:**

- **Monitor subagent status:** Monitor subagent execution status (active, waiting, blocked, complete)
- **Update tracking on status change:** Update tracking state when subagent status changes
- **Persist status changes:** Persist status changes to the same canonical projection

**AfterPhase tracking responsibilities:**

- **Clear active subagent:** Clear `active_subagent` in `InterviewPhaseState` when phase completes
- **Update interview tracking:** Remove phase entry from `active_subagents` HashMap (or mark as complete)
- **Persist final state:** Persist final tracking state to the canonical projection
- **Archive tracking:** Archive tracking data via seglog/redb so audit/replay can query it without file crawling

**Implementation:** Extend `src/interview/orchestrator.rs` and `src/interview/state.rs` to track active subagents.

The code example below illustrates state shape only; concrete persistence should target canonical storage rather than treating JSON files as the source of truth.

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
        self.interview_state_store.persist_active_subagents(&tracking_data).await?;
        
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
- **Audit trails:** "Which subagents ran in this interview? Query the active-subagent runtime projection."
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

**Integration:** Extend `validate_answer_with_subagent()` in interview orchestrator to parse structured findings and enforce remediation loop. Use the same `RemediationLoop` implementation from orchestrator plan (`src/core/remediation.rs`), adapted for interview context (re-prompt user instead of re-running Overseer subagent).

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

