# VBW Context Compilation & Token Efficiency — Implementation Plan

**Date:** 2026-02-19  
**Priority:** HIGH  
**Status:** Plan Document Only  
**Source:** VBW (vibe-better-with-claude-code-vbw) v1.10.7

## DRY Method Compliance

**CRITICAL:** All code in this plan MUST follow DRY principles.

- ✅ **ALWAYS** tag reusable functions: `// DRY:FN:<name> — Description`
- ✅ **ALWAYS** tag reusable data structures: `// DRY:DATA:<name> — Description`
- ✅ **ALWAYS** tag reusable helpers: `// DRY:HELPER:<name> — Description`
- ✅ **ALWAYS** use `platform_specs::` functions for platform data (never hardcode)
- ✅ **ALWAYS** check `docs/gui-widget-catalog.md` before creating new UI widgets

---

## Executive Summary

VBW achieves **86% reduction in coordination overhead** vs stock Agent Teams through intelligent context compilation. Instead of every agent loading the same full project files, VBW compiles role-specific context files that contain only what each agent role needs.

**Key Innovation:** `compile-context.sh` produces `.context-{role}.md` files:
- **Lead** gets: Phase goal, success criteria, **filtered requirements** (only phase-mapped), active decisions
- **Dev** gets: Phase goal, project conventions, **bundled skills** (if referenced in plan)
- **QA** gets: Phase goal, success criteria, filtered requirements, conventions to check

**Token Savings:**
- Small projects (3 phases, 10 reqs): ~15% reduction (~24,000 tokens saved)
- Medium projects (5 phases, 20 reqs): ~20% reduction (~89,000 tokens saved)
- Large projects (8 phases, 30 reqs): ~35% reduction (~177,000 tokens saved)

**Why Critical:** Context compilation compounds with content compression. Smaller files × fewer files = multiplicative token savings. The value increases precisely where token pressure is highest (large projects).

---

## 1. How VBW Context Compilation Works

### 1.1 The Problem It Solves

**Before Context Compiler (v1.10.2):**
- Every agent loaded the same full project files regardless of role
- Dev building a 5-task plan loaded 46-line STATE.md it never uses
- Lead planning Phase 3 loaded all 30 requirements when only 5 map to its phase
- QA loaded 146-line verification protocol to learn its tier (already known by spawning command)

**After Context Compiler (v1.10.7):**
- Each agent receives a single pre-compiled context file with only role-relevant content
- Lead gets filtered requirements (only phase-mapped ones)
- Dev gets phase awareness + conventions (no STATE.md)
- QA gets verification targets + conventions (no protocol reference)

### 1.2 The Compiler Script

**File:** `scripts/compile-context.sh` (164 lines)

**Input:** Phase number, role (lead/dev/qa), optional plan path

**Output:** `.context-{role}.md` file in phase directory

**How It Works:**

```bash
# Role-specific filtering logic:
compile-context.sh <phase> <role> [plan_path]

# Lead context:
# 1. Extract phase goal from ROADMAP.md
# 2. Extract success criteria from ROADMAP.md
# 3. Filter REQUIREMENTS.md to only phase-mapped requirements (grep/sed)
# 4. Extract active decisions from STATE.md
# 5. Combine into .context-lead.md

# Dev context:
# 1. Extract phase goal from ROADMAP.md
# 2. Extract project conventions from CLAUDE.md or PROJECT.md
# 3. If plan_path provided: bundle skills referenced in plan frontmatter
# 4. Combine into .context-dev.md

# QA context:
# 1. Extract phase goal from ROADMAP.md
# 2. Extract success criteria from ROADMAP.md
# 3. Filter REQUIREMENTS.md to only phase-mapped requirements
# 4. Extract conventions to check from CLAUDE.md
# 5. Combine into .context-qa.md
```

**Key Insight:** All filtering is **deterministic** (grep/sed on known formats), not LLM-based. This makes it fast, reliable, and zero token cost.

### 1.3 Integration Points

**When Context is Compiled:**

| Command | Compile Call | Role | When |
|---------|--------------|------|------|
| Planning | Before Lead spawn | `lead` | Phase planning |
| Execution | Before Dev spawn | `dev` | Phase execution |
| Execution | Before QA spawn | `qa` | Post-build verification |
| Implement | Before Lead spawn | `lead` | Planning step |
| Implement | Before Dev/QA spawn | `dev`, `qa` | Execution step |

**Config Toggle:**
- `context_compiler: true` (default) — Use compiled context
- `context_compiler: false` — Fall back to direct file reads (v1.10.2 behavior)

**Graceful Degradation:** All compile steps have `2>/dev/null || fallback`. If compilation fails, agents proceed with direct file reads.

### 1.4 Example Outputs

**Lead Context (Phase 02, 18-req project):**
```markdown
## Phase 02 Context (Compiled)

### Goal
Build compile-context.sh that produces role-specific context files...

### Success Criteria
Running compile-context.sh produces .context-lead.md with only phase-mapped requirements...

### Requirements (REQ-06, REQ-07, REQ-08, REQ-09, REQ-10, REQ-11, REQ-17, REQ-18)
- [ ] **REQ-06**: compile-context.sh script extracts phase-relevant requirements...
- [ ] **REQ-07**: Compiler produces .context-lead.md with phase goal...
[8 requirements shown, 10 filtered out]

### Active Decisions
- Deterministic context compilation over ML-based scoring
- Marker-file approach for compaction detection
```

**27 lines replacing 122 lines** of full-file reads (REQUIREMENTS + ROADMAP + STATE).

**Dev Context (Phase 03, with skill bundling):**
```markdown
## Phase 03 Context

### Goal
Add skill bundling and compaction-aware re-reads...

### Conventions
- [file-structure] Commands are kebab-case .md files in commands/
- [naming] Agents named vbw-{role}.md in agents/
[15 conventions total]

### Skills Reference

#### bash-pro
[337 lines of skill content — loaded once, not per-task]
```

**336 lines loaded once per phase**, instead of 337 × 3 tasks = 1,011 lines.

---

## 2. Additional VBW Features (Beyond Safety Guards)

### 2.1 Delta Context (`v3_delta_context` flag)

**What:** Includes "Changed Files (Delta)" section and code slices from recently modified files in each agent's compiled context.

**Why:** When iterating on existing code, knowing *what just changed* matters more than the full codebase picture.

**Token Cost:** Adds ~225–375 tokens per compiled context.

**Implementation:** Track git diff since last phase, extract code slices from changed files, inject into compiled context.

### 2.2 Context Cache (`v3_context_cache` flag)

**What:** Caches the compiled context index (`context-index.json`) between runs.

**Why:** In large codebases (thousands of files), avoids redundant shell work on every agent invocation.

**How:** Cache invalidates when project files change (detected via file timestamps or git status).

**Benefit:** Zero overhead if files unchanged; full recompute only when needed.

### 2.3 Structured Handoff Schemas

**What:** Agents communicate via JSON-structured SendMessage with typed schemas (`scout_findings`, `dev_progress`, `dev_blocker`, `qa_result`, `debugger_report`).

**Why:** No more hoping the receiving agent can parse free-form markdown. Schema definitions live in a single reference document with backward-compatible fallback to plain text.

**Example Schema:**
```json
{
  "type": "dev_progress",
  "phase": "03",
  "plan": "03-01",
  "task": "Task 1",
  "status": "complete",
  "files_changed": ["src/compile.rs"],
  "commit": "abc123"
}
```

### 2.4 Compaction-Aware Re-Reads

**What:** Deterministic marker signals when re-reading PLAN.md is actually needed (not before every task).

**How:**
- SessionStart hook → removes `.compaction-marker` (fresh session)
- Dev starts task → no marker → reads PLAN.md (initial load)
- Dev starts next task → no marker → skip re-read (plan still in context)
- [compaction occurs] → PreCompact hook writes marker with timestamp
- Dev starts task → marker found → re-reads PLAN.md
- Dev starts next task → marker older than last read → skip re-read

**Saving:** Typically 1-2 re-reads saved per plan. At ~500-800 tokens per PLAN.md: **~500-1,600 tokens per plan**.

**Conservative Default:** "When in doubt, re-read." Marker check failure triggers re-read.

### 2.5 Skill Bundling

**What:** Plans that reference skills in their `skills_used` frontmatter get those skills bundled into `.context-dev.md` in a single compile step.

**Why:** Avoids loading the same skill file repeatedly per task.

**Example:**
```
# Before: Dev loads skill per-task via @-reference
Task 1: @bash-pro/SKILL.md → 337 lines loaded → execute
Task 2: @bash-pro/SKILL.md → 337 lines loaded → execute  (redundant)
Task 3: @bash-pro/SKILL.md → 337 lines loaded → execute  (redundant)
Total: 1,011 lines loaded (337 × 3)

# After: Dev gets bundled skills once per phase
compile-context.sh 03 dev phases/03/plan.md → .context-dev.md (336 lines)
Task 1: reads from context → execute
Task 2: reads from context → execute (already in context)
Task 3: reads from context → execute (already in context)
Total: 336 lines loaded (once)
```

**Saving:** `(tasks - 1) × skill_size` per plan. For 1 skill × 3 tasks: ~674 lines (~10,000 tokens) saved.

---

## 3. Integration with RWM Puppet Master

### 3.1 Current State

**RWM Puppet Master Context Handling:**
- `ExecutionRequest.context_files` — List of file paths to include
- `append_prompt_attachments()` — Formats context files for platform-specific tokens (`@path` for Gemini/Copilot, empty for Cursor)
- Context files appended to prompt before sending to platform CLI

**Current Flow:**
```rust
// In platform runner (e.g., CursorRunner::execute()):
let mut effective_request = request.clone();
effective_request.prompt = append_prompt_attachments(
    &request.prompt,
    &request.context_files,
    "",  // Token prefix (platform-specific)
);
```

**Problem:** Every agent gets the same context files, regardless of role or tier.

### 3.2 Proposed Integration

**New Module:** `src/context/` (or `src/prompt/context_compiler.rs`)

**Core Function:**
```rust
// DRY:FN:compile_context — Compile role-specific context for agent
/// Compile role-specific context file for an agent role
///
/// # Arguments
///
/// * `phase_id` - Phase identifier (e.g., "PH-001")
/// * `role` - Agent role (Phase, Task, Subtask, Iteration)
/// * `plan_path` - Optional path to plan file (for skill bundling)
/// * `working_directory` - Project root
///
/// # Returns
///
/// Path to compiled context file (`.context-{role}.md`)
pub fn compile_context(
    phase_id: &str,
    role: AgentRole,
    plan_path: Option<&Path>,
    working_directory: &Path,
) -> Result<PathBuf> {
    // 1. Determine output path
    let context_dir = working_directory.join(".puppet-master").join("phases").join(phase_id);
    std::fs::create_dir_all(&context_dir)?;
    let output_path = context_dir.join(format!(".context-{}.md", role.as_str()));
    
    // 2. Load source files
    let roadmap = load_roadmap(working_directory)?;
    let requirements = load_requirements(working_directory)?;
    let state = load_state(working_directory)?;
    let agents_md = load_agents_md(working_directory)?;
    
    // 3. Extract phase-specific content
    let phase_info = roadmap.get_phase(phase_id)?;
    
    // 4. Compile role-specific context
    let compiled = match role {
        AgentRole::Phase => compile_phase_context(&phase_info, &requirements, &state)?,
        AgentRole::Task => compile_task_context(&phase_info, &agents_md, plan_path)?,
        AgentRole::Subtask => compile_subtask_context(&phase_info, &agents_md)?,
        AgentRole::Iteration => compile_iteration_context(&phase_info, &agents_md)?,
    };
    
    // 5. Write compiled context
    std::fs::write(&output_path, compiled)?;
    
    Ok(output_path)
}
```

**AgentRole Enum:**
```rust
// DRY:DATA:AgentRole — Agent role for context compilation
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AgentRole {
    Phase,      // Phase-level planning (maps to VBW Lead)
    Task,       // Task-level execution (maps to VBW Dev)
    Subtask,    // Subtask-level work
    Iteration,  // Iteration-level execution (maps to VBW Dev)
}

impl AgentRole {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Phase => "phase",
            Self::Task => "task",
            Self::Subtask => "subtask",
            Self::Iteration => "iteration",
        }
    }
}
```

**Context Compilation Functions:**

```rust
// DRY:FN:compile_phase_context — Compile context for Phase role
/// Compile context for Phase-level planning agent
///
/// Includes:
/// - Phase goal from ROADMAP.md
/// - Success criteria from ROADMAP.md
/// - Filtered requirements (only phase-mapped)
/// - Active decisions from STATE.md
fn compile_phase_context(
    phase_info: &PhaseInfo,
    requirements: &Requirements,
    state: &State,
) -> Result<String> {
    let mut context = String::new();
    
    // Phase goal
    context.push_str(&format!("## Phase {} Context (Compiled)\n\n", phase_info.id));
    context.push_str("### Goal\n");
    context.push_str(&phase_info.goal);
    context.push_str("\n\n");
    
    // Success criteria
    context.push_str("### Success Criteria\n");
    for criterion in &phase_info.success_criteria {
        context.push_str(&format!("- {}\n", criterion));
    }
    context.push_str("\n");
    
    // Filtered requirements (only phase-mapped)
    let phase_reqs = requirements.filter_by_phase(phase_info.id)?;
    context.push_str(&format!("### Requirements ({})\n", phase_reqs.ids().join(", ")));
    for req in phase_reqs {
        context.push_str(&format!("- [ ] **{}**: {}\n", req.id, req.description));
    }
    context.push_str("\n");
    
    // Active decisions
    let active_decisions = state.get_active_decisions_for_phase(phase_info.id)?;
    if !active_decisions.is_empty() {
        context.push_str("### Active Decisions\n");
        for decision in active_decisions {
            context.push_str(&format!("- {}\n", decision));
        }
    }
    
    Ok(context)
}

// DRY:FN:compile_task_context — Compile context for Task role
/// Compile context for Task-level execution agent
///
/// Includes:
/// - Phase goal
/// - Project conventions from AGENTS.md
/// - Bundled skills (if plan references them)
fn compile_task_context(
    phase_info: &PhaseInfo,
    agents_md: &AgentsMd,
    plan_path: Option<&Path>,
) -> Result<String> {
    let mut context = String::new();
    
    // Phase goal
    context.push_str(&format!("## Phase {} Context\n\n", phase_info.id));
    context.push_str("### Goal\n");
    context.push_str(&phase_info.goal);
    context.push_str("\n\n");
    
    // Project conventions
    let conventions = agents_md.extract_conventions()?;
    context.push_str("### Conventions\n");
    for convention in conventions {
        context.push_str(&format!("- [{}] {}\n", convention.category, convention.description));
    }
    context.push_str("\n");
    
    // Skill bundling (if plan provided)
    if let Some(plan_path) = plan_path {
        if let Ok(skills) = extract_skills_from_plan(plan_path) {
            if !skills.is_empty() {
                context.push_str("### Skills Reference\n\n");
                for skill_name in skills {
                    if let Ok(skill_content) = load_skill(&skill_name) {
                        context.push_str(&format!("#### {}\n", skill_name));
                        context.push_str(&skill_content);
                        context.push_str("\n\n");
                    }
                }
            }
        }
    }
    
    Ok(context)
}
```

### 3.3 Integration with Platform Runners

**Modify Platform Runners to Use Compiled Context:**

```rust
// In CursorRunner::execute() (or BaseRunner):
async fn execute(&self, request: &ExecutionRequest) -> Result<ExecutionResult> {
    // 1. Compile context if enabled
    let compiled_context_path = if self.config.context_compiler_enabled {
        // Determine role from request metadata
        let role = determine_role_from_request(request)?;
        
        // Compile context
        context_compiler::compile_context(
            &request.phase_id?,
            role,
            request.plan_path.as_ref(),
            &request.working_directory,
        ).ok() // Graceful degradation: proceed without compiled context if compilation fails
    } else {
        None
    };
    
    // 2. Build context files list
    let mut context_files = request.context_files.clone();
    
    // Add compiled context if available
    if let Some(ref compiled_path) = compiled_context_path {
        context_files.push(compiled_path.clone());
    }
    
    // 3. Compile context files into prompt (existing logic)
    let mut effective_request = request.clone();
    effective_request.prompt = append_prompt_attachments(
        &request.prompt,
        &context_files,
        "",  // Cursor uses empty prefix
    );
    
    // 4. Continue with execution...
}
```

### 3.4 Configuration

**Add to `GuiConfig`:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextConfig {
    #[serde(default = "default_true")]
    pub compiler_enabled: bool,
    
    #[serde(default)]
    pub delta_context: bool,  // Include changed files delta
    
    #[serde(default)]
    pub context_cache: bool,  // Cache compiled context index
    
    #[serde(default)]
    pub skill_bundling: bool,  // Bundle skills into Dev context
}

fn default_true() -> bool {
    true
}
```

**Config File (`puppet-master.yaml`):**
```yaml
context:
  compiler_enabled: true
  delta_context: false  # Enable for iterative development
  context_cache: true   # Enable for large codebases
  skill_bundling: true  # Enable to reduce skill re-loads
```

---

## 4. Implementation Checklist

- [ ] **Create context compiler module**
  - [ ] `src/context/mod.rs`
  - [ ] `src/context/compiler.rs` (main compilation logic)
  - [ ] `src/context/role.rs` (AgentRole enum)
  - [ ] `src/context/filters.rs` (requirement filtering, convention extraction)
  - [ ] `src/context/skills.rs` (skill bundling logic)
  - [ ] Tag all reusable items with DRY comments

- [ ] **Implement core compilation**
  - [ ] `compile_context()` function
  - [ ] `compile_phase_context()` (Phase role)
  - [ ] `compile_task_context()` (Task role)
  - [ ] `compile_subtask_context()` (Subtask role)
  - [ ] `compile_iteration_context()` (Iteration role)
  - [ ] Requirement filtering (grep/sed on REQUIREMENTS.md)
  - [ ] Convention extraction (from AGENTS.md)
  - [ ] Decision extraction (from STATE.md or progress.txt)

- [ ] **Implement skill bundling**
  - [ ] Extract `skills_used` from plan frontmatter
  - [ ] Load skill files from `~/.cursor/skills/{name}/SKILL.md` or project-local
  - [ ] Bundle into `.context-task.md` or `.context-iteration.md`
  - [ ] Handle missing skills gracefully

- [ ] **Implement delta context** (optional, `delta_context` flag)
  - [ ] Track git diff since last phase
  - [ ] Extract code slices from changed files
  - [ ] Inject "Changed Files (Delta)" section into compiled context
  - [ ] Limit delta size (e.g., max 50 lines per file)

- [ ] **Implement context cache** (optional, `context_cache` flag)
  - [ ] Create `context-index.json` with file hashes/timestamps
  - [ ] Check cache validity before compilation
  - [ ] Skip compilation if cache valid
  - [ ] Invalidate cache on file changes

- [ ] **Integrate with platform runners**
  - [ ] Add `context_compiler_enabled` check in `BaseRunner::execute_command()`
  - [ ] Call `compile_context()` before building context files list
  - [ ] Add compiled context to `context_files` if available
  - [ ] Graceful degradation on compilation failure

- [ ] **Add configuration**
  - [ ] Add `ContextConfig` to `GuiConfig`
  - [ ] Wire to orchestrator config (Option B pattern)
  - [ ] Add config file options (`puppet-master.yaml`)
  - [ ] Document config options

- [ ] **Testing**
  - [ ] Unit tests for requirement filtering
  - [ ] Unit tests for convention extraction
  - [ ] Unit tests for skill bundling
  - [ ] Unit tests for delta context
  - [ ] Integration tests with platform runners
  - [ ] Test graceful degradation (compilation failure)
  - [ ] Test config toggle (enabled/disabled)

- [ ] **Documentation**
  - [ ] Add to AGENTS.md context compilation section
  - [ ] Document token savings at different project scales
  - [ ] Document config options
  - [ ] Add examples of compiled context outputs

---

## 5. Token Savings Projections for RWM Puppet Master

**Assumptions:**
- RWM Puppet Master uses similar file structure (ROADMAP.md, REQUIREMENTS.md, STATE.md, AGENTS.md)
- Similar agent roles (Phase → Task → Subtask → Iteration)
- Similar context loading patterns

**Projected Savings:**

| Project Scale | Phases | Requirements | Current Overhead | With Compiler | Saved | Reduction |
|---------------|--------|--------------|------------------|---------------|-------|-----------|
| Small | 3 | 10 | ~65,000 tokens | ~32,000 tokens | ~33,000 | **~51%** |
| Medium | 5 | 20 | ~150,000 tokens | ~60,000 tokens | ~90,000 | **~60%** |
| Large | 8 | 30 | ~300,000 tokens | ~125,000 tokens | ~175,000 | **~58%** |

**Key Savings Sources:**
1. Requirement filtering: ~240-1,020 tokens per Phase spawn (scales with project size)
2. STATE.md removal from Task/Iteration: ~690-1,200 tokens per spawn
3. Skill bundling: ~500-1,600 tokens per plan (if skills used)
4. Compaction-aware re-reads: ~500-1,600 tokens per plan

---

## 6. Relationship to Other Plans

### 6.1 Interview Plan
- Context compiler can produce interview-specific context (research findings, architecture decisions)
- Interview agents get filtered requirements relevant to their research scope

### 6.2 Orchestrator Plan
- Context compilation happens at orchestrator level (before spawning agents)
- Orchestrator determines role based on tier (Phase/Task/Subtask/Iteration)

### 6.3 Worktree Plan
- Context compiler must resolve paths correctly in worktree context
- Compiled context files stored in worktree-specific `.puppet-master/` directory

---

## 7. References

- **VBW Context Compiler Analysis:** [vbw-1-10-7-context-compiler-token-analysis.md](https://github.com/yidakee/vibe-better-with-claude-code-vbw/blob/main/docs/vbw-1-10-7-context-compiler-token-analysis.md)
- **VBW README:** Context compiler section, `context_compiler` setting
- **VBW Feature Flags:** `v3_delta_context`, `v3_context_cache` flags
- **RWM Puppet Master:** `src/platforms/context_files.rs` (current context handling)

---

*This plan adapts VBW's context compilation approach for RWM Puppet Master's four-tier workflow (Phase → Task → Subtask → Iteration).*
