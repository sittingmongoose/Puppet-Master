## 14. Context Compilation & Token Efficiency

### 14.1 Role-Specific Context Compiler

**Problem:** Every agent currently receives the same context files regardless of tier or role. Phase planning loads full REQUIREMENTS; task execution loads STATE and full plans; verification loads full protocol docs. That wastes tokens and dilutes focus.

**Solution:** A **context compiler** produces one compiled context file per role (Phase, Task, Subtask, Iteration). Each file contains only what that role needs. Filtering is deterministic (pattern-based on known file formats), not LLM-based -- zero token cost and reliable.

**Module:** `src/context/` (or `src/prompt/context_compiler.rs`).

**Output files:** `.puppet-master/phases/{phase_id}/.context-{role}.md`.

**Compiler contract:**

```rust
// DRY:FN:compile_context — Compile role-specific context for agent
pub fn compile_context(
    phase_id: &str,
    role: AgentRole,
    plan_path: Option<&Path>,
    working_directory: &Path,
) -> Result<PathBuf>;
```

**Role → content mapping:**

| Role     | Contents |
|----------|----------|
| **Phase**  | Phase goal (from roadmap), success criteria, **filtered requirements** (only phase-mapped), active decisions (from state/progress). |
| **Task**   | Phase goal, project conventions (from AGENTS.md), **bundled skills** if plan references them. |
| **Subtask**| Phase goal, conventions, current subtask scope. |
| **Iteration** | Phase goal, conventions, iteration scope; same as Task when no subtask split. |

**Requirement filtering:** Parse REQUIREMENTS (or prd.json) and include only items whose IDs are listed in the current phase's scope. Use grep/sed or structured parse on a known format; no LLM.

**When to run:** Before spawning the agent for that role (e.g. in platform runner or orchestrator): call `compile_context(phase_id, role, plan_path, cwd)`, then add the returned path to `ExecutionRequest.context_files` (or equivalent) so the agent receives the compiled file instead of (or in addition to) raw project files, per config.

**Config:** `context.compiler_enabled` (default true). If false or compilation fails, fall back to existing behavior (direct file reads).

**Example Phase context output (snippet):**

```markdown
## Phase PH-002 Context (Compiled)

### Goal
Implement role-specific context compiler and wire into platform runners.

### Success Criteria
- compile_context() produces .context-{role}.md under .puppet-master/phases/{id}/
- Only phase-mapped requirements appear in Phase context

### Requirements (REQ-06, REQ-07, REQ-08, REQ-09)
- [ ] **REQ-06**: compile_context script extracts phase-relevant requirements...
- [ ] **REQ-07**: Compiler produces .context-phase.md with phase goal...

### Active Decisions
- Deterministic context compilation (pattern-based, no LLM)
- Marker-file approach for compaction detection
```

**Token impact:** Replaces multiple full-file reads with one short file per spawn. Typical savings: ~1.4k-2.8k tokens per Phase spawn; ~0.5k-1.6k per Task/Iteration (e.g. skipping STATE, filtering requirements). Scale-dependent: larger projects see larger absolute savings.

---

### 14.2 Delta Context

**Purpose:** When iterating on existing code, agents benefit more from *what just changed* than from the full codebase. Delta context adds a "Changed Files (Delta)" section to the compiled context.

**Behavior:**

- **Input:** Git diff since last phase (or since last commit / tag -- configurable). Optionally restrict to certain dirs (e.g. `src/`).
- **Content:** For each changed file: path, optional short code slices (e.g. first/last N lines or hunks), and a brief summary (e.g. "modified", "added"). Total size capped (e.g. ~225-375 tokens per compiled context).
- **Output:** Appended to the compiled `.context-{role}.md` when `context.delta_context` is true (e.g. only for Task/Iteration roles if desired).

**Implementation sketch:**

- Run `git diff` (or `git log -p` with limits) from a configured ref (e.g. `HEAD~1`, or last phase tag).
- Parse diff; for each file, optionally read file and take slices (e.g. 20 lines before/after changed regions).
- Write a "## Changed Files (Delta)" section with path, summary, and slices; enforce token/line limit.

**Config:** `context.delta_context` (default false). Enable for iterative development.

---

### 14.3 Context Cache

**Purpose:** Avoid recomputing compiled context when project files have not changed (e.g. multiple spawns in the same phase, or re-runs).

**Behavior:**

- **Cache key:** Directory or file set that affects context (e.g. `.puppet-master/`, `REQUIREMENTS.md`, `prd.json`, `AGENTS.md`, phase dirs). Represent as a list of paths + mtimes or content hashes.
- **Cache store:** Single index file, e.g. `.puppet-master/context-index.json`, containing: phase_id, role, list of (path, mtime_or_hash), and path to last compiled output (or hash of its content).
- **Lookup:** Before calling the compiler, compute current key; if it matches cache and cached output path exists and is readable, skip compilation and return cached path.
- **Invalidation:** On any change to the key (e.g. file under `.puppet-master/` or requirements/prd/AGENTS), delete or invalidate the cache entry for that phase/role and recompute on next request.

**Config:** `context.context_cache` (default true for large-repo use cases). When false, always run the compiler.

---

### 14.4 Structured Handoff Schemas

**Purpose:** Make inter-agent communication parseable and type-safe so orchestrator and downstream agents do not rely on free-form markdown.

**Behavior:**

- **Schema registry:** Define a small set of message types, e.g. `phase_progress`, `task_blocker`, `subtask_result`, `qa_result`, `iteration_complete`. Each has a fixed JSON schema (required fields, types).
- **Wire format:** Agents (or the runner wrapping them) send handoff payloads as JSON (e.g. in a well-known field of the execution result or in a side-channel file). Example:

```json
{
  "type": "task_progress",
  "phase_id": "PH-002",
  "task_id": "TK-002-01",
  "status": "complete",
  "files_changed": ["src/context/compiler.rs"],
  "commit": "abc123"
}
```

- **Validation:** Orchestrator (or a small Rust module) parses and validates against the schema; on failure, log and optionally retry or escalate. Unknown `type` can be rejected or treated as legacy plain text per policy.
- **Docs:** Single reference doc (e.g. in `docs/` or `references/`) lists all types and their schemas; agents are instructed to emit one of these shapes.

**Implementation:** Add `HandoffMessage` enum in Rust with serde; implement `TryFrom` from JSON string; use in orchestrator when processing agent output.

---

### 14.5 Compaction-Aware Re-Reads

**Purpose:** Avoid re-reading the full plan (or other large context) before every task when the plan has not been compacted or changed.

**Behavior:**

- **Marker file:** A deterministic marker file (e.g. `.puppet-master/.compaction-marker`) with a timestamp. Written only when a "compaction" or context-reset event occurs (e.g. session compaction, or explicit "context was trimmed" signal from the platform).
- **Protocol:** Before spawning a task, check for the marker. If absent, assume plan/context is still valid from a previous load -- skip re-read. If present, re-read plan (and any other context that might have been trimmed), then clear or update the marker so the next task does not re-read unnecessarily.
- **Conservative rule:** On any doubt (e.g. marker present, or read failure), do the re-read. Prefer redundant reads over missing updates.

**Saving:** Typically 1-2 full plan re-reads per phase (~500-1,600 tokens per plan depending on plan size).

**Integration:** Orchestrator or platform runner consults the marker when building `ExecutionRequest.context_files` (or when deciding whether to include plan path again). Lifecycle: clear marker on session start; set marker when compaction is detected or signaled.

---

### 14.6 Skill Bundling

**Purpose:** When a plan references skills (e.g. in frontmatter like `skills_used: [bash-pro, rust-clippy]`), load those skill files once and embed them in the compiled context for Task/Iteration roles instead of loading the same files per task.

**Behavior:**

- **Discovery:** When compiling context for Task or Iteration, if a plan path is provided, parse plan frontmatter for a list of skill names (e.g. `skills_used`).
- **Resolution:** Resolve each name to a file path (e.g. `~/.cursor/skills/{name}/SKILL.md` or project-local `.cursor/skills/{name}/SKILL.md`). If missing, skip that skill and log.
- **Bundling:** Read each skill file (subject to size limit if desired), then append a "## Skills Reference" section to the compiled context with the contents. One concatenation per phase, not per task.
- **Saving:** `(num_tasks - 1) * skill_content_size` per plan (e.g. one skill × 3 tasks → ~2× content size saved).

**Config:** `context.skill_bundling` (default true).

---

### 14.7 Token Savings and Context Configuration

**Projected savings (illustrative):**

| Scale   | Phases | Requirements | Coordination overhead (no compiler) | With compiler | Reduction |
|---------|--------|--------------|-------------------------------------|----------------|-----------|
| Small   | 3      | 10           | ~65k tokens                          | ~32k           | ~51%      |
| Medium  | 5      | 20           | ~150k tokens                         | ~60k           | ~60%      |
| Large   | 8      | 30           | ~300k tokens                         | ~125k          | ~58%      |

**Unified context config (add to `GuiConfig` / `puppet-master.yaml`):**

```yaml
context:
  compiler_enabled: true
  delta_context: false
  context_cache: true
  skill_bundling: true
```

```rust
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ContextConfig {
    #[serde(default = "default_true")]
    pub compiler_enabled: bool,
    #[serde(default)]
    pub delta_context: bool,
    #[serde(default = "default_true")]
    pub context_cache: bool,
    #[serde(default = "default_true")]
    pub skill_bundling: bool,
}
```

**AgentRole enum (for compiler):**

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AgentRole {
    Phase,
    Task,
    Subtask,
    Iteration,
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

**Integration with platform runner:** Before building the prompt, if `context.compiler_enabled`, call `context_compiler::compile_context(phase_id, role, plan_path, working_directory)`. On success, add the returned path to the request's context files (or replace a subset). On failure, log and proceed with existing behavior (no compiled context).

---

