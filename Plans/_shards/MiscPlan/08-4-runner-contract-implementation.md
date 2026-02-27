## 4. Runner Contract Implementation

### 4.1 Trait and Types

- Define (or extend) a runner contract in `puppet-master-rs` that includes:
  - `async fn prepare_working_directory(&self, path: &Path) -> Result<()>`
  - `async fn cleanup_after_execution(&self, pid: u32, work_dir: &Path) -> Result<()>`
- Path may be main workspace or worktree path; callers pass the directory the agent actually used.

### 4.2 prepare_working_directory

- **Ensure path is a valid git repo** (e.g. `git rev-parse --show-toplevel`).
- **Optional:** Reset tracked state: `git checkout -- .` and/or `git restore .` in that path (if product wants a hard reset of tracked files; document clearly).
- **Run workspace cleanup here (not after execution):** This is the only place where broad untracked cleanup (e.g. `git clean -fd` with excludes) or conservative cleanup (known temp/agent-output dirs) should run. Doing it **before** the run removes the *previous* run's cruft; doing it after would remove the current run's output (see §9.1.13). Use the allowlist from Section 3; do **not** remove `.puppet-master/` or state files.

### 4.3 cleanup_after_execution

- **Kill / terminate process** if still running (existing behavior).
- **Clean temp files** created by the runner (e.g. any temp files used for context copy, as in REQUIREMENTS 26.3).
- **Do not run broad "git clean -fd" (untracked) here.** The orchestrator commits tier progress *after* the runner returns; if we removed untracked files here we would delete the agent's new files before they are committed (§9.1.13). Optionally remove only **known build-artifact dirs** (e.g. `target/`) in `work_dir` if config allows, to reclaim space without touching untracked source or docs. Do **not** remove untracked files in the workspace in this step.
- Log cleanup result (e.g. "Runner temp files removed" or "Cleanup skipped: disabled").

### 4.4 Wiring

- **Orchestrator / execution path:** Before spawning an iteration, call `prepare_working_directory(work_dir)`. After the process ends (success or failure), call `cleanup_after_execution(pid, work_dir)`.
- **Platform runners:** Each runner implements the contract; shared logic (e.g. git clean with excludes) can live in a `git` or `cleanup` module so runners don't duplicate code.

### 4.5 Tests

- Unit tests: cleanup helper excludes `.puppet-master/` and allowlisted paths; does not delete state files.
- Integration test (optional): create untracked files and maybe a mock `target/` in a temp repo, run cleanup, assert they are removed and allowlisted paths remain.

### 4.6 Call sites: Orchestrator, Interview, Start chain, and Conversation

All code paths that invoke `runner.execute()` should use prepare and cleanup so agent-left-behind artifacts are managed consistently. The following call sites must be updated unless explicitly marked optional.

| Call site | Location | Working dir source | Update required |
|-----------|----------|--------------------|-----------------|
| **Orchestrator** | `ExecutionEngine::execute_iteration` in `core/execution_engine.rs`; invoked by `orchestrator.rs` (e.g. `execute_iteration(&context)`). | `context.working_dir` (from tier worktree or `config.project.working_directory`). | **Yes.** Call `prepare_working_directory(work_dir)` before building/running the request and `cleanup_after_execution(work_dir)` after `execute` returns (success or failure), for each iteration. This is the main iteration path where cleanup matters most. |
| **Interview (research)** | `interview/research_engine.rs`: `execute_research_ai_call` builds request and calls `runner.execute(&request)`. | Passed in as `working_dir: &Path`. | **Yes.** Call prepare before and cleanup after the execute so research runs don't leave cruft in the project directory. |
| **Start chain** | `start_chain/prd_generator.rs`, `requirements_interviewer.rs`, `architecture_generator.rs`, `multi_pass_generator.rs`: each builds an `ExecutionRequest` with a `working_directory` and calls `runner.execute(&request)`. | Each has its own `working_directory` (e.g. project path). | **Yes.** Use the same prepare/cleanup around each `execute` so PRD/requirements/architecture generation don't accumulate untracked files. |
| **Conversation / wizard** | `app.rs`: `execute_ai_turn` builds request with `working_dir = std::env::current_dir()` and calls `runner.execute(&request)`. | `current_dir()` (process CWD, may not be project root). | **Optional but recommended.** If the conversation runs in a known project path, use that for prepare/cleanup; otherwise use `current_dir()` with the same policy, or skip cleanup when not in a "project" context to avoid cleaning the wrong directory. |

**Implementation options**

- **Option A (per call site):** At each call site, call `runner.prepare_working_directory(&request.working_directory).await?` before `execute`, and `runner.cleanup_after_execution(&request.working_directory).await` after `execute` returns. Ensures every path is explicit but duplicates the prepare/execute/cleanup pattern.
- **Option B (wrapper):** Introduce a single helper (e.g. `run_with_cleanup(runner, request) -> Result<ExecutionResult>`) that does: prepare(work_dir) → execute(request) → cleanup(work_dir), and use it from the orchestrator, execution_engine, interview, start_chain, and (optionally) execute_ai_turn. All call sites then go through the wrapper and get consistent behavior; config (e.g. "skip cleanup for interview") can be applied inside the wrapper.

**Recommendation:** Use **Option B** so prepare/cleanup semantics live in one place and call sites (orchestrator, interviewer, start chain, conversation) are updated to call the wrapper instead of `runner.execute()` directly. The wrapper can read config to skip prepare/cleanup when desired (e.g. for one-off conversation from an arbitrary CWD).

ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002

### 4.7 DRY: Module layout, naming, and tagging

**New module: `src/cleanup/`**

- **Purpose:** Single place for workspace prepare/cleanup policy and execution. No duplicate logic in runners or call sites.
- **Files (suggested):**
  - `src/cleanup/mod.rs` -- Module root; re-exports and optional `CleanupConfig` (if config is not in a shared config crate).
  - `src/cleanup/workspace.rs` -- Prepare, cleanup, allowlist, and git-clean invocation. All DRY-tagged items below live here (or in mod.rs if small).
- **Parent declaration:** Add `pub mod cleanup;` where other top-level modules are declared (e.g. alongside `pub mod git;`).

**DRY items to add (tag in code)**

| Tag | Name | Location | Description |
|-----|------|----------|-------------|
| DRY:DATA | `CLEANUP_EXCLUDE_PATTERNS` or `cleanup_allowlist()` | `cleanup/workspace.rs` | Single source of paths/patterns to never remove: `.puppet-master`, `progress.txt`, `AGENTS.md`, `prd.json`, `.gitignore`, and sensitive patterns (`.env`, `.env.*`, `*.pem`, `*.key`, etc.) per §3.6. Used by git-clean helper (in prepare only) and any conservative cleanup. |
| DRY:FN | `prepare_working_directory` | `cleanup/workspace.rs` | Ensures path is a git repo (or skips git steps if not); optionally runs conservative clean. Called by wrapper or runners. |
| DRY:FN | `cleanup_after_execution` | `cleanup/workspace.rs` | Terminates process if needed; cleans **runner temp files** only (e.g. context copy temp). **Does not** run broad git clean (untracked) -- that runs only in prepare_working_directory (§9.1.13). Optionally removes known build-artifact dirs (e.g. `target/`) per config. Takes `work_dir` and optional config. |
| DRY:FN | `run_git_clean_with_excludes` | `cleanup/workspace.rs` | Builds and runs `git clean -fd` (or `-fdx` when configured) with `-e` exclude patterns from the allowlist. Single implementation for all callers. |
| DRY:FN | `run_with_cleanup` | `core/` or `cleanup/` | Wrapper: prepare(work_dir) → runner.execute(request) → cleanup(work_dir). All call sites (orchestrator, interview, start_chain, execute_ai_turn) use this instead of calling `runner.execute()` directly. |

**Runner contract and DRY**

- **Trait:** `PlatformRunner` gains `prepare_working_directory` and `cleanup_after_execution` (or the contract extends to include them). **Default implementations** call `crate::cleanup::prepare_working_directory(path).await` and `crate::cleanup::cleanup_after_execution(work_dir).await` so platform runners do not duplicate logic; they can override only if a platform needs special behavior.
- **Wrapper:** `run_with_cleanup` reads config (e.g. skip prepare/cleanup for conversation or when disabled), then calls the shared prepare and cleanup functions and the runner's `execute`. No per-call-site prepare/cleanup code.

**Exact git clean invocation (single helper)**

- **DRY:FN:run_git_clean_with_excludes(** `work_dir`**,** `clean_untracked: bool`**,** `clean_ignored: bool` **)**  
  - **Single source for patterns:** Does **not** take an allowlist parameter; reads from `cleanup_exclude_patterns()` (or `CLEANUP_EXCLUDE_PATTERNS`) in the same module so no caller can pass a different list (DRY).  
  - Runs `git clean -fd` when only untracked; `git clean -fdx` when ignored too. Passes `-e <pattern>` for each entry from the allowlist so `.puppet-master`, `progress.txt`, `AGENTS.md`, `prd.json`, `.gitignore`, and sensitive patterns are never removed.  
  - Document the exact patterns in the function (or in the constant) so §9.1.2 and §9.1.6 are satisfied in one place.  
  - **Use shared git binary:** Resolve the `git` executable via the same helper as GitManager/Doctor (e.g. `path_utils::resolve_executable("git")` until Worktree plan adds `resolve_git_executable()`) so cleanup works when git is in a custom or app-local path. Do not assume `Command::new("git")` is sufficient.

**Pre-implementation checklist (DRY)**

- [ ] Grep `DRY:` in `src/git/` and `src/core/` to see if any existing helper can be reused (e.g. git_manager for status; no existing workspace-clean helper expected).
- [ ] Confirm `src/cleanup/` is the right place per AGENTS.md module responsibilities (cleanup is not purely "git operations"; it's workspace hygiene, so a dedicated module is appropriate).
- [ ] After adding code: tag every new public function/data with the correct DRY comment; add no duplicate allowlist or git-clean logic elsewhere.

### 4.8 Concrete implementation details

The following gives implementers exact signatures, data, and step-by-step logic so the DRY module can be built without ambiguity.

**Allowlist (DRY:DATA) -- single source of truth**

- **Name and location:** In `src/cleanup/workspace.rs`, define a single constant or function that returns the exclude patterns used by `run_git_clean_with_excludes` and by any "sensitive path" check. Recommended: `pub fn cleanup_exclude_patterns() -> &'static [&'static str]` or `const CLEANUP_EXCLUDE_PATTERNS: &[&str]`.
- **Exact patterns (gitignore-style; one entry per `-e`):**  
  `.puppet-master`, `.puppet-master/*`, `progress.txt`, `AGENTS.md`, `prd.json`, `.gitignore`, `.env`, `.env.*`, `*.env`, `*.pem`, `*.key`, `*.crt`, `*.p12`, `.ssh`, `.ssh/*`.  
  Git clean `-e` accepts one pattern per flag; multiple `-e` flags are allowed. Use patterns that match paths relative to `work_dir` (gitignore semantics). Ensure `.puppet-master` and state files are never removed; document in the same module that this list is the single source for both cleanup and (if added) pre-commit sensitive-file checks.
- **Sensitive patterns subset:** Optionally split into `cleanup_exclude_patterns()` (all) and `sensitive_patterns()` (subset for staging checks); both in same file, no duplication of literal strings -- e.g. `sensitive_patterns()` returns a slice of the same literals used in the full list.

**DRY:FN:run_git_clean_with_excludes**

- **Signature:** `pub async fn run_git_clean_with_excludes(work_dir: &Path, clean_untracked: bool, clean_ignored: bool) -> Result<()>`.
- **DRY REQUIREMENT:** Tag with `// DRY:FN:run_git_clean_with_excludes`. MUST use `cleanup_exclude_patterns()` from the same module -- DO NOT accept allowlist as parameter or hardcode exclude patterns. MUST use shared git binary resolution (e.g. `path_utils::resolve_executable("git")` or `resolve_git_executable()` from Worktree plan) -- DO NOT hardcode `Command::new("git")`.
- **Behavior:** If `clean_untracked` is false, return `Ok(())` without running git. Otherwise run `git clean -fd` (or `-fdx` if `clean_ignored`). Resolve the git binary via the same helper used by GitManager/Doctor (e.g. `crate::platforms::path_utils::resolve_executable("git")` until Worktree plan adds `resolve_git_executable()`; then switch to that). Build the command with one `-e <pattern>` per entry from `cleanup_exclude_patterns()`. Set `Command::current_dir(work_dir)`. Do not assume `Command::new("git")` is sufficient.
- **Callers:** Only `prepare_working_directory` (and the manual "Clean workspace" action) call this; `cleanup_after_execution` does not.

**DRY:FN:prepare_working_directory**

- **Signature:** `pub async fn prepare_working_directory(work_dir: &Path, config: &CleanupConfig) -> Result<()>` (or take config from a shared app config if preferred).
- **DRY REQUIREMENT:** Tag with `// DRY:FN:prepare_working_directory`. MUST call `run_git_clean_with_excludes()` for git clean operations -- DO NOT duplicate git clean logic. MUST use `cleanup_exclude_patterns()` for allowlist -- DO NOT hardcode exclude patterns.
- **Step-by-step:**
  1. **Git check:** Run `git rev-parse --show-toplevel` with `current_dir(work_dir)`. If the command fails (non-repo or git not found), **do not fail the iteration**: log a warning (e.g. "Prepare: not a git repo or git unavailable, skipping git clean") and return `Ok(())`. Optionally run only non-git cleanup (e.g. clear agent-output dir per config) if implemented. This resolves §9.1.3 and §9.1.10 (best-effort; continue without prepare).
  2. **Optional tracked reset:** Do **not** run `git checkout -- .` or `git restore .` unless a future config flag is added and documented; see §9.1.4. For now, prepare only cleans **untracked** (and optionally ignored) files.
  3. **Untracked cleanup:** If config says run untracked cleanup (e.g. `cleanup.untracked == true`), call `run_git_clean_with_excludes(work_dir, true, config.clean_ignored)`.
  4. **Agent-output dir (optional):** If Section 5 is implemented and config says clear agent-output, delete contents of `.puppet-master/agent-output/` (or the path from DRY:DATA constant) but do not remove the directory itself.
  5. Log "Prepare completed" or "Prepare skipped (not a git repo)" as appropriate.

**DRY:FN:cleanup_after_execution**

- **Signature:** `pub async fn cleanup_after_execution(pid: u32, work_dir: &Path, config: &CleanupConfig) -> Result<()>`.
- **DRY REQUIREMENT:** Tag with `// DRY:FN:cleanup_after_execution`. MUST use `cleanup_exclude_patterns()` for any path checks -- DO NOT hardcode exclude patterns. MUST use shared git binary resolution if git operations are needed -- DO NOT hardcode `Command::new("git")`.
- **Step-by-step:**
  1. **Terminate process:** If `pid > 0`, attempt to terminate the process (e.g. `kill(pid, SIGTERM)` or platform equivalent); do not block indefinitely; log if termination fails.
  2. **Runner temp files:** Remove any temp files or dirs that the **runner** created for this execution (e.g. context copy temp dir). This requires the runner (or a shared base) to record the temp path(s) so cleanup can remove them; if no such path is stored, this step is a no-op for now. Do **not** run `run_git_clean_with_excludes` here.
  3. **Optional build-artifact dirs:** If config allows (e.g. `cleanup.remove_build_artifacts: true`), remove only known dirs such as `work_dir.join("target")` (Rust). Do not remove untracked source or docs.
  4. Log "Cleanup completed (runner temp removed)" or similar.

**DRY:FN:run_with_cleanup**

- **Placement:** Prefer `src/core/run_with_cleanup.rs` (or a helper in `src/core/execution_engine.rs`) so the execution engine can call it; alternatively `src/cleanup/run_with_cleanup.rs` if the wrapper is considered part of cleanup. Document the choice in AGENTS.md.
- **Signature:** `pub async fn run_with_cleanup<R: PlatformRunner>(runner: &R, request: &ExecutionRequest, config: &CleanupConfig) -> Result<ExecutionResult>`. Alternatively, accept an `Option<&CleanupConfig>` and skip prepare/cleanup when `None` or when config says skip (e.g. for conversation from arbitrary CWD).
- **DRY REQUIREMENT:** Tag with `// DRY:FN:run_with_cleanup`. MUST call `prepare_working_directory()` and `cleanup_after_execution()` from the cleanup module -- DO NOT duplicate prepare/cleanup logic. This wrapper ensures all call sites get consistent behavior.
- **Logic:** (1) If config says skip prepare for this context, skip to step 2. (2) Call `crate::cleanup::prepare_working_directory(&request.working_directory, config).await`; on error, log and continue (per §9.1.10: best-effort). (3) Call `runner.execute(request).await` and capture result. (4) Call `crate::cleanup::cleanup_after_execution(0, &request.working_directory, config).await` (pid may be 0 if not tracked). (5) Return execution result.
- **Call sites (concrete):**
  - **ExecutionEngine:** In `execute_iteration`, wrap `runner.execute(request).await` with `run_with_cleanup(&*runner, request, &cleanup_config).await`. The cleanup_config must be obtained from the same run config as the orchestrator (e.g. from `IterationContext` or from a shared config handle). ExecutionEngine currently has no access to config; add a way to pass cleanup config into ExecutionEngine (e.g. at construction or per execute_iteration). *(Note: `execute_with_sdk_fallback` has been removed — execution is always CLI via `runner.execute()`.)*
  - **research_engine.rs:** In `execute_research_ai_call`, wrap the existing `runner.execute(&request).await` in a call to `run_with_cleanup` so prepare runs before and cleanup after.
  - **start_chain (prd_generator, requirements_interviewer, architecture_generator, multi_pass_generator):** Each currently does `runner.execute(&request).await`; replace with `run_with_cleanup(runner, &request, &config).await`. Obtain config from the same place the start_chain gets its run config.
  - **app.rs execute_ai_turn:** Optionally use `run_with_cleanup` when `working_dir` is a known project path; otherwise call `runner.execute(&request).await` and skip prepare/cleanup to avoid cleaning the wrong directory.

**Runner contract and config**

- **Trait:** Do **not** add `prepare_working_directory` or `cleanup_after_execution` to `PlatformRunner`; all call sites use `run_with_cleanup`, so the wrapper is the only entry point. Runners keep only `execute`. This avoids every runner needing to know about cleanup and keeps the contract minimal.
- **CleanupConfig:** Introduce a struct (e.g. in `src/cleanup/mod.rs` or in the same config module as run config) with fields: `untracked: bool`, `clean_ignored: bool`, `clear_agent_output: bool`, `remove_build_artifacts: bool`, and optionally `skip_prepare_for_conversation: bool`. Populate from the same config shape that the run uses (Option B: build from gui_config at run start; add `cleanup: { untracked, clean_ignored, ... }` to that shape).

**Git binary resolution**

- Use `crate::platforms::path_utils::resolve_executable("git")` until Worktree plan Phase 3 adds a dedicated `resolve_git_executable()`; then switch to that in `run_git_clean_with_excludes` so a single helper is used everywhere (DRY).

---

