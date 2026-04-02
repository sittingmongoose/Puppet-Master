## 14. Context Compilation & Token Efficiency

### 14.1 Role-Specific Context Compiler

**Problem:** Every agent currently receives the same context files regardless of the current runtime role. Planning, execution, verification, and debug attempts should not all load identical context blobs.

**Solution:** A deterministic **context compiler** produces one compiled context file per runtime role. Filtering is structural/pattern-based, not LLM-based.

**Module:** `src/context/` (or `src/prompt/context_compiler.rs`).

**Output files:** `.puppet-master/runs/{run_id}/nodes/{node_id}/.context-{context_role}.md`.

**Compiler contract:**
```rust
pub fn compile_context(
    run_id: &str,
    node_id: &str,
    context_role: ContextRole,
    plan_path: Option<&Path>,
    working_directory: &Path,
) -> Result<PathBuf>;
```

**Context role -> content mapping:**

| Context role | Contents |
|---|---|
| `planning` | Node goal, success criteria, filtered requirements, active decisions, repo/project rules |
| `execution` | Node goal, conventions, concrete input files, skills referenced by the node, most recent relevant receipts |
| `verification` | Node goal, expected acceptance criteria, changed-files delta, verification evidence/history |
| `debug` | Bound target summary, Investigation Context snapshot, relevant artifacts, current revalidation reason if any |
| `review` | Compare/review identity, affected files, reviewer comments/annotations, blocking concerns |

Rules:
- selection is driven by runtime posture and node intent, not by deprecated phase/task/subtask/iteration names
- requirement filtering is deterministic over known formats; no LLM is used for compiler selection
- when compilation fails or the feature is disabled, PM falls back to the existing direct-file behavior
- the compiled artifact is a convenience context surface, not a new canonical storage source

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md

---

### 14.2 Delta Context

**Purpose:** When iterating on existing code, agents benefit more from *what just changed* than from the full codebase. Delta context adds a "Changed Files (Delta)" section to the compiled context.

**Behavior:**

- **Input:** Git diff since the last relevant base ref (or since last commit / tag -- configurable). Optionally restrict to certain dirs (e.g. `src/`).
- **Content:** For each changed file: path, optional short code slices (e.g. first/last N lines or hunks), and a brief summary (e.g. "modified", "added"). Total size capped (e.g. ~225-375 tokens per compiled context).
- **Output:** Appended to the compiled `.context-{context_role}.md` when `context.delta_context` is true (e.g. only for the relevant execution/verification/review roles if desired).

**Implementation sketch:**

- Run `git diff` (or `git log -p` with limits) from a configured ref (e.g. `HEAD~1`, or the last relevant checkpoint tag).
- Parse diff; for each file, optionally read file and take slices (e.g. 20 lines before/after changed regions).
- Write a "## Changed Files (Delta)" section with path, summary, and slices; enforce token/line limit.

**Config:** `context.delta_context` (default false). Enable for iterative development.

---

### 14.3 Context Cache

**Purpose:** Avoid recomputing compiled context when project files have not changed (e.g. multiple spawns in the same run, or repeated node attempts).

**Behavior:**

- **Cache key:** Directory or file set that affects context (e.g. `.puppet-master/`, `REQUIREMENTS.md`, `prd.json`, `AGENTS.md`, run/node state). Represent as a list of paths + mtimes or content hashes.
- **Cache store:** Single index file, e.g. `.puppet-master/context-index.json`, containing: `run_id`, `node_id`, `context_role`, list of `(path, mtime_or_hash)`, and path to last compiled output (or hash of its content).
- **Lookup:** Before calling the compiler, compute current key; if it matches cache and cached output path exists and is readable, skip compilation and return cached path.
- **Invalidation:** On any change to the key (e.g. file under `.puppet-master/` or requirements/prd/AGENTS), delete or invalidate the cache entry for that run/node/context-role tuple and recompute on next request.

**Config:** `context.context_cache` (default true for large-repo use cases). When false, always run the compiler.

---

### 14.4 Structured Handoff Schemas

**Purpose:** Make inter-agent communication parseable and type-safe so orchestrator and downstream agents do not rely on free-form markdown.

**Behavior:**

- **Schema registry:** Define a small set of message types, e.g. `run_progress`, `work_package_blocker`, `node_result`, `qa_result`, `attempt_complete`. Each has a fixed JSON schema (required fields, types).
- **Wire format:** Agents (or the runner wrapping them) send handoff payloads as JSON (e.g. in a well-known field of the execution result or in a side-channel file). Example:

```json
{
  "type": "node_progress",
  "run_id": "RUN-002",
  "node_id": "NODE-002",
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
- **Protocol:** Before spawning an attempt, check for the marker. If absent, assume plan/context is still valid from a previous load -- skip re-read. If present, re-read plan (and any other context that might have been trimmed), then clear or update the marker so the next attempt does not re-read unnecessarily.
- **Conservative rule:** On any doubt (e.g. marker present, or read failure), do the re-read. Prefer redundant reads over missing updates.

**Saving:** Typically 1-2 full plan re-reads per run (~500-1,600 tokens per plan depending on plan size).

**Integration:** Orchestrator or platform runner consults the marker when building `ExecutionRequest.context_files` (or when deciding whether to include plan path again). Lifecycle: clear marker on session start; set marker when compaction is detected or signaled.

---

### 14.6 Skill Bundling
Skill bundling is the canonical MVP runtime delivery path for skills during context compilation.

Rules:
- selected skills are resolved from the canonical skill registry
- the context compiler decides which resolved skills to inline into the compiled context for the active run/context role
- bundled skill content remains traceable to skill ids and registry metadata
- on-demand lookup continues to use the `skill` tool; bundling does not eliminate tool-based access
- provider-native directories or file formats remain import/export/interoperability inputs only

Bundling order:
1. resolve allowed skill refs
2. apply permissions and deny/allow filtering
3. de-duplicate by canonical skill id
4. bundle deterministic content in context-compiler order
5. emit enough metadata for evidence/debugging to show which skills were injected

This section intentionally makes runtime bundling, not provider-native file placement, the MVP execution truth.

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md
### 14.7 Token Savings and Context Configuration

**Projected savings (illustrative):**

| Scale   | Nodes | Requirements | Coordination overhead (no compiler) | With compiler | Reduction |
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

**ContextRole enum (for compiler):**

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ContextRole {
    Planning,
    Execution,
    Verification,
    Debug,
    Review,
}

impl ContextRole {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Planning => "planning",
            Self::Execution => "execution",
            Self::Verification => "verification",
            Self::Debug => "debug",
            Self::Review => "review",
        }
    }
}
```

**Integration with platform runner:** Before building the prompt, if `context.compiler_enabled`, call `context_compiler::compile_context(run_id, node_id, context_role, plan_path, working_directory)`. On success, add the returned path to the request's context files (or replace a subset). On failure, log and proceed with existing behavior (no compiled context).

---

