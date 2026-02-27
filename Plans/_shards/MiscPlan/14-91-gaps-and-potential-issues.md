## 9.1 Gaps and Potential Issues

The following gaps or issues should be resolved during implementation or explicitly accepted as limitations.

### 9.1.1 Signature and contract alignment

- **REQUIREMENTS.md §26.2** specifies `prepare_working_directory(&self, path: &str)` and `cleanup_after_execution(&self, pid: u32)` with no `work_dir` on cleanup. This plan adds `work_dir: &Path` to `cleanup_after_execution` so the caller passes the directory the agent used (the runner may not know it from `pid`). Decide whether to update REQUIREMENTS to match or keep the extended signature only in code.
- Use `Path`/`PathBuf` in the trait; REQUIREMENTS use `&str` for path -- align for consistency.

### 9.1.2 Root-level state files and git clean

- **progress.txt** and **AGENTS.md** live at project root (STATE_FILES.md). If they are ever untracked, `git clean -fd` would remove them unless explicitly excluded. The allowlist must include root-level state paths (e.g. `progress.txt`, `AGENTS.md`) in addition to `.puppet-master/`, or document that these files must always be tracked so clean does not touch them.
- **Recommendation:** Add exclude patterns for `progress.txt`, `AGENTS.md`, `prd.json`, `.gitignore`, and sensitive patterns (§3.6) when invoking `git clean`, so untracked copies and credential files are never removed by mistake.

### 9.1.3 Non-git workspaces

- **prepare_working_directory** assumes a valid git repo (e.g. `git rev-parse --show-toplevel`). If the workspace is not a git repo (e.g. plain folder, or git not installed), the plan does not specify: fail the iteration, skip prepare/cleanup, or run only non-git cleanup (e.g. curated dirs).
- **Resolved:** If `git rev-parse --show-toplevel` fails in the work_dir: **do not fail the iteration**. Log a warning ("Prepare: not a git repo or git unavailable, skipping git clean") and return `Ok(())`. Optionally run only non-git cleanup (e.g. clear agent-output dir per config). Implement this in §4.8 step 1 of prepare_working_directory.

### 9.1.4 Stash and reset interaction

- REQUIREMENTS §26.3 say before iteration: "`git stash` any uncommitted changes (optional, configurable)". The plan does not mention stash. If **prepare_working_directory** resets tracked state (`git checkout -- .` / `git restore .`), uncommitted work could be lost if stash is not run first (or if user expects to keep uncommitted changes).
- **Resolved:** Prepare **does not** reset tracked state. It only cleans **untracked** (and optionally ignored) files via `run_git_clean_with_excludes`. Do not run `git checkout -- .` or `git restore .` in prepare unless a future config flag is added and documented. This avoids losing uncommitted work and keeps the contract simple. If REQUIREMENTS later require optional stash+reset, add a config flag and document order: stash → prepare (reset if enabled) → run → cleanup → stash pop (optional).

### 9.1.5 Where work_dir comes from

- In the codebase, **orchestrator** resolves `working_directory` via `get_tier_worktree(tier_id).unwrap_or_else(|| config.project.working_directory)` (execution_engine / orchestrator path). In **app.rs** `execute_ai_turn`, `working_dir` is set to `std::env::current_dir()` -- i.e. process CWD, which may not be the configured project or a tier worktree.
- **Recommendation:** Ensure prepare/cleanup use the same source as the execution request: for orchestrator-driven runs use tier worktree or `config.project.working_directory`; for other flows (e.g. interview/wizard) either pass the same working_dir used for execution or document that cleanup is skipped when not using orchestrator workspace. Avoid using `current_dir()` for cleanup unless it is the intended workspace.

### 9.1.6 git clean exclude list

- `git clean -fd -e <pattern>` can exclude paths by pattern; multiple `-e` flags are allowed. The plan says "exclude list so `.puppet-master/` and allowlisted paths are never touched" but does not specify exact patterns (e.g. `-e '.puppet-master'`, `-e 'progress.txt'`, `-e 'AGENTS.md'`). Git's `-e` is a pattern (e.g. ignore pattern), not necessarily a path.
- **Recommendation:** Implement the single helper **DRY:FN:run_git_clean_with_excludes** (§4.7) that builds the command from the allowlist (DRY:DATA). Document the exact patterns there (or in `CLEANUP_EXCLUDE_PATTERNS`); test that excluded paths are never removed.

ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002

### 9.1.7 Evidence retention: definition of "run"

- Section 6 uses **evidence.retain_last_runs** without defining what counts as a "run" (per iteration, per subtask, per task, global). Without a clear definition, pruning may remove evidence that is still relevant for the current tier or for reporting.
- **Recommendation:** Define "run" in config/docs (e.g. one iteration, or one subtask completion) and how it is inferred from evidence paths or iteration logs; or prefer **retention_days** only until "run" is well-defined.

### 9.1.8 Clean workspace and active worktrees

- Section 7.2 says "Clean workspace now" runs cleanup "in the current workspace (and optionally in all active worktrees)". Implementing "all active worktrees" requires access to **worktree_manager** and **active_worktrees** (or equivalent) and iterating over them. The plan does not reference where this state lives (orchestrator vs app).
- **Recommendation:** In the implementation checklist, add: obtain worktree list from orchestrator or worktree_manager and run cleanup in each path; handle the case where orchestrator is not loaded (e.g. only clean main workspace).

### 9.1.9 Dry run / preview

- The plan does not mention a "dry run" or "preview" for the manual "Clean workspace" action. Users may want to see what would be removed before confirming.
- **Recommendation (optional):** Add a "Preview" or "Dry run" that lists paths that would be removed (e.g. `git clean -fd -n` plus explanation) and show that list in the confirmation dialog or a separate view.

### 9.1.10 Prepare failure policy

- If **prepare_working_directory** fails (e.g. not a git repo, permission error), the plan does not say whether the iteration is aborted or continues without prepare.
- **Resolved:** **Best-effort:** On failure (e.g. git check fails, or `run_git_clean_with_excludes` errors), log a warning and **continue** -- do not abort the iteration. The wrapper `run_with_cleanup` should catch prepare errors, log them, and proceed to `runner.execute(request)`. This avoids one bad repo or permission flake from blocking all runs. Document in AGENTS.md and in §4.8.

### 9.1.11 Worktree and .puppet-master location

- When using worktrees, the agent's cwd is the worktree path. The main repo's `.puppet-master/` may not exist inside the worktree (worktrees share .git but have their own working tree). So cleanup in the worktree path may only see untracked files in that tree; no need to exclude `.puppet-master/` inside the worktree if it is not there. The allowlist still matters for the main workspace; for worktrees, excluding `.puppet-master/` is harmless if absent.
- No change needed; note during implementation that worktree cleanup runs in the worktree root and allowlist semantics apply per directory.

### 9.1.12 Optional: concurrent runs

- If multiple orchestrator runs or tabs use the same project (or same worktrees), cleanup from one could affect another. The plan does not address this.
- **Recommendation:** Consider out of scope for v1, or add a short note that cleanup is best-effort and concurrent use may lead to races; avoid holding locks across cleanup if possible.

### 9.1.13 Critical: When to run workspace cleanup (orchestrator / commit order)

- **Current plan:** §4.3 says cleanup_after_execution "Run workspace cleanup in work_dir per policy (e.g. git clean -fd)". The call flow is: **run_with_cleanup** does prepare → execute → **cleanup** (immediately after the runner returns). The **orchestrator** then runs **commit_tier_progress** (add_all, commit) only after the iteration result is processed. So cleanup runs **before** the commit.
- **Problem:** If cleanup_after_execution runs `git clean -fd`, it would remove **all untracked files** in the workspace, including **new files the agent just created** (e.g. new source files, docs). Those files would be deleted before the orchestrator can stage and commit them. Result: loss of iteration output.
- **Fix:** **Do not run broad "git clean -fd" (untracked files) in cleanup_after_execution.** In that step, only: (1) kill/terminate process if still running, (2) clean **runner temp files** (e.g. context copy temp files). **Full workspace untracked cleanup** (git clean -fd with excludes) should run only in **prepare_working_directory** (before the run), so we remove the *previous* run's cruft, not the current run's output. Optionally in cleanup_after_execution we can remove only **known build-artifact dirs** (e.g. `target/`) if config says so, but never untracked source or docs. Document this in §4.2 and §4.3 and in the implementation.

ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002

### 9.1.14 Interview and orchestrator plan output locations

- **Interview:** The interview orchestrator writes to `output_dir` = `.puppet-master/interview/` (state, phase docs, requirements-complete.md, test-strategy, technology-matrix, AGENTS.md). Research engine writes to `.puppet-master/research/`. All under `.puppet-master/`, so already allowlisted. **No gap** as long as interview never writes final output to project root; if it does (e.g. a top-level REQUIREMENTS.md), that path must be allowlisted or cleanup must not run broad git clean in interview context.
- **Start chain / wizard:** Writes to `.puppet-master/start-chain/` (e.g. tier-plan.md) and pipeline tier/test plans under paths derived from config. As long as those are under `.puppet-master/`, they are safe. If any start-chain or wizard output is written to project root, allowlist or skip broad cleanup for that flow.
- **Orchestrator / tier plans:** STATE_FILES.md places phase/task/subtask plans under `.puppet-master/plans/`. If the orchestrator or agents write tier plans there, they are safe. If an agent during an iteration writes a plan or doc to **repo root** (e.g. `PLAN.md`), it is untracked; with the fix in §9.1.13 we do not run git clean after execution, so that file would remain until the next prepare (or commit). So after the fix, we do not delete current-iteration output.
- **Recommendation:** Document that interview, start-chain, and orchestrator output locations should stay under `.puppet-master/` (or allowlisted paths) so cleanup never removes them. If any flow writes to project root by design, add that path or pattern to the allowlist.

### 9.1.15 Additional gaps and room for improvement

- **prd.json:** Ensure the allowlist (DRY:DATA) and `run_git_clean_with_excludes` exclude `prd.json` at project root; added to §3.6 and §4.7 table; §9.1.2 recommendation updated.
- **Config copy:** §7.1 previously said "cleanup.untracked" runs "after execution"; corrected to "before each run (in prepare_working_directory)". Implementors should wire the toggle to control only the **prepare** step, not cleanup_after_execution.
- **Manual "Clean workspace":** Should invoke prepare-style logic (git clean with excludes), not cleanup_after_execution; §7.2 clarified.
- **Checklist item 4.2-4.3:** The checklist says "cleanup_after_execution (... workspace cleanup with excludes)" -- implement only runner temp (and optional build-artifact dirs) in cleanup_after_execution; workspace cleanup with excludes is in prepare_working_directory only.

### 9.1.16 ExecutionEngine and CleanupConfig wiring

- **Gap:** ExecutionEngine currently has no access to run config or CleanupConfig. To use `run_with_cleanup`, the orchestrator (or whoever calls `execute_iteration`) must pass CleanupConfig into the execution path.
- **Concrete options:** (1) Add `cleanup_config: CleanupConfig` to `IterationContext` and have the orchestrator set it when building the context; (2) Add `cleanup_config: CleanupConfig` to ExecutionEngine at construction and pass it when creating the engine; (3) Use a thread-local or global "current run config" that ExecutionEngine reads (not recommended -- prefer explicit passing). Recommendation: (1) extend `IterationContext` with an optional `cleanup_config: Option<CleanupConfig>`; when building the context, the orchestrator fills it from the run config. ExecutionEngine then passes it to `run_with_cleanup`. If None, skip prepare/cleanup (backward compatible).
- **CleanupConfig default:** When `cleanup_config` is `None` or `unwrap_or_default()` is used, document the default: e.g. `CleanupConfig { untracked: true, clean_ignored: false, clear_agent_output: false, remove_build_artifacts: false }` so prepare runs untracked clean by default and we don't accidentally disable cleanup when config is missing.

### 9.1.17 ~~ExecutionEngine execute step is SDK fallback, not runner.execute only~~ (Resolved — SDK removed)

> **Note (2026):** `execute_with_sdk_fallback` has been removed. Execution is now always CLI via `runner.execute()`. The gap described below no longer applies; §8.2.4 has been updated accordingly.

- ~~**Gap:** `ExecutionEngine::execute_with_sdk_fallback` first tries `try_execute_with_sdk(request)`; only on failure does it call `runner.execute(request)`. So the "execute" step is **not** a single `runner.execute()` call--it can be SDK or runner. If we replace only `runner.execute(request).await` with `run_with_cleanup(&*runner, request, config).await`, then when the **SDK path** succeeds we would **never run prepare or cleanup** (because run_with_cleanup wouldn't be called).~~
- ~~**Resolved:** Do **not** use `run_with_cleanup` inside `execute_with_sdk_fallback`. Instead, in **execute_iteration** (or the caller of `execute_with_sdk_fallback`): (1) call `prepare_working_directory(&context.working_directory, &cleanup_config)` before the platform loop; (2) call `execute_with_sdk_fallback(...)` as today; (3) after it returns, call `cleanup_after_execution(0, &context.working_directory, &cleanup_config)`. So prepare and cleanup wrap the **entire** execution (SDK or CLI). `run_with_cleanup` remains for call sites that only do `runner.execute()` (research_engine, start_chain, app). Checklist 8.2.4 updated accordingly.~~

**Current state:** `execute_iteration` calls `runner.execute(request)` directly (always CLI). `prepare_working_directory` and `cleanup_after_execution` wrap it. `run_with_cleanup` is used at call sites that call `runner.execute()` (research_engine, start_chain, app). §8.2.4 updated accordingly.

### 9.1.18 Unwired features, GUI gaps, and implementation status (sweep)

The following reflects a sweep of the codebase and plans. Use it to avoid missing wiring or GUI updates when implementing.

**Not yet implemented (MiscPlan / cleanup)**

- **Cleanup module:** No `src/cleanup/`; no `prepare_working_directory`, `cleanup_after_execution`, `run_git_clean_with_excludes`, or `run_with_cleanup`. All call sites still call `runner.execute()` (or SDK fallback) with no prepare/cleanup. Implement per §4 and §8.
- **CleanupConfig / run config:** No `CleanupConfig` type; no cleanup or evidence section in the config the run uses. When implementing, add to the **run config** (Option B: build from gui_config at run start) so the orchestrator and other call sites receive cleanup settings.
- **GUI -- Config → Advanced:** No "Workspace / Cleanup" subsection; no toggles for clean untracked, clean ignored, clear agent-output, evidence retention. Add per §7.5 and checklist 8.6.
- **GUI -- Doctor:** No "Clean workspace now" button; no Workspace category. Doctor does not receive a project-path hint when run from the app (Worktree plan §7.2). Add button and project context per §7.5 and 8.6.2.

**Unwired (run does not use GUI state)**

- **Orchestrator run config:** The backend uses `ConfigManager::discover()` (no hint) and `get_config()` which loads **PuppetMasterConfig** from the **file**. The Config page saves **GuiConfig** to the same path. The two shapes differ (Worktree plan §5); the run does **not** receive `gui_config.advanced.execution.enable_parallel` or other GUI-only fields unless Option B (build run config from gui_config at run start) is implemented. So **enable_parallel**, branching, and (once added) cleanup toggles are **unwired** until Option B is in place.
- **Interview:** When building `InterviewOrchestratorConfig` in app.rs, only **generate_initial_agents_md** and **generate_playwright_requirements** are passed from `gui_config.interview`. The following are **in the GUI** but **not** passed to the orchestrator: **require_architecture_confirmation**, **vision_provider**, **max_questions_per_phase**. **min_questions_per_phase** does not exist in GUI or in `InterviewOrchestratorConfig`. Phase definitions use hardcoded `min_questions: 3`, `max_questions: 8`. Wire these per Interview plan "GUI gaps: Interview tab" and orchestrator plan "Interviewer Enhancements and Config Wiring."

**Shortcuts and Skills (§7.7-§7.11)**

- **Shortcuts:** No `ShortcutAction`/`KeyBinding` or `default_shortcuts`; no `build_key_map` or key-event wiring; no Shortcuts tab or config. Implement per §7.7, §7.9, §8.8; resolve gaps in §7.11 (record flow, Slint wiring, serialization).
- **Skills:** No `src/skills/`; no discovery, load_skill, or permissions; no Skills tab or config. Implement per §7.8, §7.10, §8.9; resolve gaps in §7.11 (deduplication rule, import semantics, no-project create, name-change on edit).

**GUI changes required (summary)**

| Plan / feature | GUI change |
|----------------|------------|
| **MiscPlan** | Config → Advanced: add "Workspace / Cleanup" subsection (toggles + optional evidence). Doctor: add "Clean workspace now" (and optional "Clean all worktrees"); resolve project path; disable when no project. |
| **MiscPlan (Shortcuts)** | Config: add Shortcuts subsection/tab; list actions + bindings; Change / Reset; persist in GuiConfig. Wire key map at app level per §7.11. |
| **MiscPlan (Skills)** | Config: add Skills subsection/tab; list discovered skills; Add / Edit / Remove / Permissions / Refresh; persist permissions in GuiConfig. |
| **Worktree** | Branching tab: Enable Git, Auto PR, Branch strategy; fix/hide naming_pattern. Option B: run receives config built from gui_config so enable_parallel and branching take effect. |
| **Interview** | Interview tab: add min_questions_per_phase; add "Unlimited" for max; wire require_architecture_confirmation, vision_provider, min/max into InterviewOrchestratorConfig when starting interview. |
| **Orchestrator** | Tiers tab: plan mode global toggle, "Enable plan mode for all tiers" button; Subagents section. Single Save persists all (gui_config); Option B run-config build includes plan mode and subagents. |

**Widgets and DRY**

- All new GUI for cleanup, interview min/max, and branching must use existing widgets from `docs/gui-widget-catalog.md` (e.g. toggler, styled_button, styled_text_input, help_tooltip, confirm_modal). Run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` after changes. Tag new reusable widgets with `// DRY:WIDGET:`.

### 9.1.19 Shortcuts: config load failure, key conflicts, and discoverability

- **Config load failure:** If the shortcuts section of GuiConfig is corrupted or invalid at load time, the app must not crash. **Recommendation:** Fall back to empty overrides, log a warning, show toast "Shortcuts reset to defaults due to config error", and build key map from defaults only (§7.11, §8.8.7). Wire this at app startup and when opening Config → Shortcuts.
- **Key already bound to another action:** When the user records a new shortcut that is already assigned to a different action, **recommend rejecting** with tooltip "Already used by &lt;ActionName&gt;" and not saving (§7.11). Alternative (steal binding) is implementation-defined if preferred.
- **Export/import versioning:** Export JSON must include a `version` field; reject imports with unsupported version and show clear error (§7.11). Document supported version(s) in code or STATE_FILES.md.
- **Tooltip when key map not loaded:** Before the key map is built (e.g. config not yet loaded), show action label only or "(Loading...)" where shortcut labels appear; never show blank or "(undefined)" (§7.11).

### 9.1.21 Skills: discovery, permissions, and runner wiring

- **Discovery path order and portability:** Discovery path order is canonical (§7.10); any change (e.g. adding a path) can change which skill "wins" for a given name. **Recommendation:** Keep DRY:DATA:skill_search_paths as the single source of truth; document order in code and in AGENTS.md so implementers and users understand first-wins behavior. On Windows, path case and separators may affect discovery; first-wins deduplication should use consistent name comparison (e.g. normalize case for comparison if desired).
- **Permission "ask" and runner wiring:** Until "ask" is implemented (§7.11), only allow/deny are active. When "ask" is added, the app must prompt the user at the point where the runner would load the skill (before or at run start); implementation must decide exact UI (modal vs toast) and persistence (e.g. "Always/Never for this skill").
- **Per-provider skill delivery:** Runners must receive the allowed skill list in a form each provider understands. **Recommendation:** Implementation plan must list per provider (Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, Gemini) how skill paths or content are passed (env var, prompt injection, tool); without this, Skills integration remains stubbed. See §7.10 "Discovery and platform_specs" and §8.9.6.
- **Create/import overwrite and concurrent edit:** Creating a skill when the target directory already contains SKILL.md must not overwrite (§7.11); implementation must return a clear error. Concurrent edit on disk during in-app edit is an implementation must-decide (detect and prompt Reload/Overwrite/Cancel recommended).

### 9.1.22 Shortcuts and Skills: implementation summary

**Known risks**

- **Slint key API:** Key event handling depends on Slint's key-event API (e.g. `FocusScope` `key-pressed` callback, `KeyEvent` struct). Behavior may differ by Slint version; implementer should confirm the integration point against Slint 1.15.1 docs and document it in the implementation plan.
- **Skill discovery on Windows path case:** Discovery paths (e.g. `.puppet-master/skills`, `.claude/skills`, `.agents/skills`) may behave differently on Windows (case-insensitivity, path separators). First-wins deduplication by name should account for case-normalization if needed.
- **platform_specs skill injection:** How each provider (Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, Gemini) receives the skill list (env var, prompt injection, tool) must be defined in platform_specs or orchestrator plan; until then, Skills integration with runners is stubbed.

**Before implementation plan**

- Confirm Slint key-event API (Slint 1.15.1): where key events are captured (window vs focused widget, via `FocusScope`) and how KeyMap is applied.
- Confirm platform_specs (or equivalent) documents skill injection for each platform so the implementation plan can wire `list_skills_for_agent` per runner.

---

