## 8. Implementation Checklist

**Order:** Implement in the sequence below so dependencies are satisfied. DRY: no duplicate allowlist or git-clean logic anywhere outside `src/cleanup/`.

### 8.1 Core cleanup module (required)

- [ ] **8.1.1** Add `pub mod cleanup;` to `src/lib.rs` (alongside `pub mod git;`).
- [ ] **8.1.2** Create `src/cleanup/mod.rs`: re-export `workspace::*` and define `CleanupConfig` struct (fields: `untracked`, `clean_ignored`, `clear_agent_output`, `remove_build_artifacts`); tag with DRY:DATA if config lives here.
- [ ] **8.1.3** Create `src/cleanup/workspace.rs`. Implement `cleanup_exclude_patterns()` (or `CLEANUP_EXCLUDE_PATTERNS`) with exact list from §4.8; tag DRY:DATA. Implement `run_git_clean_with_excludes(work_dir, clean_untracked, clean_ignored)` using `path_utils::resolve_executable("git")` and one `-e` per pattern; tag DRY:FN.
- [ ] **8.1.4** In same file, implement `prepare_working_directory(work_dir, config)` per §4.8 step-by-step (git check → skip if not repo; optional reset omitted; call run_git_clean_with_excludes if config.untracked; optional agent-output clear); tag DRY:FN.
- [ ] **8.1.5** In same file, implement `cleanup_after_execution(pid, work_dir, config)` per §4.8 (terminate process; runner temp only; optional build-artifact dirs); tag DRY:FN. Do **not** call run_git_clean_with_excludes here.
- [ ] **8.1.6** Section 3 and 3.6: Document cleanup policy in AGENTS.md; ensure allowlist includes `.gitignore` and sensitive patterns; no `git add -f`; document security in AGENTS.md or security notes.

### 8.2 Wrapper and config wiring (required)

- [ ] **8.2.1** Implement `run_with_cleanup(runner, request, config)` per §4.8 (prepare → execute → cleanup; on prepare error log and continue). Place in `src/core/run_with_cleanup.rs` or inside `execution_engine.rs`; tag DRY:FN.
- [ ] **8.2.2** Add `CleanupConfig` (or cleanup section) to the run config shape built from GuiConfig (Option B, Worktree §5). Ensure the orchestrator and other call sites can obtain a `CleanupConfig` when starting a run.
- [ ] **8.2.3** Extend `IterationContext` (or equivalent) with `cleanup_config: Option<CleanupConfig>` per §9.1.16. When the orchestrator builds the context, set it from run config.
- [ ] **8.2.4** In **ExecutionEngine::execute_iteration**: call `prepare_working_directory(&context.working_directory, &cleanup_config)` before the platform loop; then call `runner.execute(request)` directly (CLI-only — `execute_with_sdk_fallback` has been removed); then call `cleanup_after_execution(0, &context.working_directory, &cleanup_config)` after it returns. Obtain cleanup_config from context (e.g. `context.cleanup_config.unwrap_or_default()`). This way prepare/cleanup wrap the entire execution.
- [ ] **8.2.5** In `interview/research_engine.rs` `execute_research_ai_call`, wrap `runner.execute(&request)` in `run_with_cleanup(runner, &request, &config).await`; obtain config from research engine config or caller.
- [ ] **8.2.6** In start_chain: `prd_generator.rs`, `requirements_interviewer.rs`, `architecture_generator.rs`, `multi_pass_generator.rs` -- replace each `runner.execute(&request).await` with `run_with_cleanup(..., &request, &config).await`; pass config from caller or discovery.
- [ ] **8.2.7** In `app.rs` `execute_ai_turn`: optionally use run_with_cleanup when working_dir is a known project; otherwise keep direct execute and skip prepare/cleanup.

### 8.3 Tests and gaps (required)

- [ ] **8.3.1** Unit tests: in `src/cleanup/workspace.rs` (or `tests/`), assert cleanup_exclude_patterns contains `.puppet-master`, `progress.txt`, `AGENTS.md`, `prd.json`, `.gitignore`; assert run_git_clean_with_excludes does not delete a test file matching an exclude. Optional: integration test in temp repo with untracked files and allowlisted paths.
- [ ] **8.3.2** §9.1.1: Align trait signature with REQUIREMENTS or document extension (cleanup_after_execution(pid, work_dir)); we do not add these to the trait, only use run_with_cleanup.
- [ ] **8.3.3** §9.1.6: Document exact patterns in cleanup_exclude_patterns(); test excluded paths are never removed.
- [ ] **8.3.4** §9.1.13: Confirm cleanup_after_execution never calls run_git_clean_with_excludes; only prepare_working_directory and manual "Clean workspace" do.
- [ ] **8.3.5** §9.1.14: Confirm interview, start-chain, orchestrator output paths are under `.puppet-master/` or allowlisted; add any project-root output path to allowlist if needed.
- [ ] **8.3.6** Cross-plan: Use shared git binary in run_git_clean_with_excludes (path_utils now; switch to resolve_git_executable when Worktree Phase 3 is done).

### 8.4 Agent output dir (Section 5)

- [ ] **8.4.1** Define `AGENT_OUTPUT_SUBDIR` and `agent_output_dir(base)` in cleanup module (DRY:DATA). In prepare_working_directory, if config.clear_agent_output, clear contents of agent_output_dir(work_dir) only; do not remove the dir. Document in STATE_FILES.md and AGENTS.md.

### 8.5 Evidence retention (Section 6)

- [ ] **8.5.1** Add evidence retention config (retention_days, retain_last_runs, prune_on_cleanup). Implement `prune_evidence_older_than(base_dir, config)` (DRY:FN) in cleanup module; call from manual action or background, not from cleanup_after_execution. Define "run" for retain_last_runs or prefer retention_days (§9.1.7). Document in STATE_FILES.md and AGENTS.md.

### 8.6 Cleanup UX (Section 7)

- [ ] **8.6.1** Add cleanup (and evidence) toggles to GUI: extend `GuiConfig` with cleanup and evidence blocks (e.g. under Advanced or top-level); add **Advanced → Workspace / Cleanup** subsection per §7.5 (Clean untracked, Clean ignored, Clear agent-output, Remove build artifacts, Evidence retention). Wire to same run config (Option B). Use widgets from `docs/gui-widget-catalog.md` (toggler, styled_button, confirm_modal); run generate-widget-catalog.sh and check-widget-reuse.sh after UI changes.
- [ ] **8.6.2** Add "Clean workspace now" button: place on **Doctor** (preferred) or Advanced → Workspace. Resolve **project path** from same source as run (e.g. current project or config path; not raw current_dir() unless intended). Call prepare-style run_git_clean_with_excludes with allowlist; optionally "Clean all worktrees" using worktree_manager list (§9.1.8). Confirmation modal; optional dry-run (§9.1.9) with `git clean -fd -n` and show list in modal.
- [ ] **8.6.3** Tooltips and docs: per §7.5 table; add one-line mention in Doctor that workspace cleanup runs before each iteration when enabled in Config → Advanced → Workspace.
- [ ] **8.6.4** §7.6: Document in AGENTS.md or user docs that we do not rely on platform hooks for cleanup; optional skill/README for agents to use `.puppet-master/agent-output/` and avoid leaving cruft.
- [ ] **8.6.5** §7.7: Add Shortcuts subsection/tab under Config; wire to shortcut backend (§8.8); list, edit, reset; persist in GuiConfig.
- [ ] **8.6.6** §7.8: Add Skills subsection/tab under Config; wire to skills backend (§8.9); list, add, edit, remove, permissions, refresh.

### 8.8 Desktop Shortcuts backend (§7.7, §7.9)

**Order:** Implement in sequence 8.8.1 → 8.8.2 → 8.8.3 → 8.8.4 → 8.8.5 → 8.8.6 → 8.8.7 → 8.8.8.

- [ ] **8.8.1** Define `ShortcutAction` enum and `KeyBinding` (or equivalent) in `src/config/` or `src/gui/shortcuts.rs`; tag DRY:DATA:shortcut_actions.
- [ ] **8.8.2** Define `default_shortcuts()` (or const) as single source of truth for default bindings; tag DRY:DATA:default_shortcuts. Add platform mapping (Ctrl/Cmd, Alt/Option) if supporting macOS.
- [ ] **8.8.3** Add `shortcuts` (or `keyboard_shortcuts`) to `GuiConfig`; only overrides stored; load/save with rest of config.
- [ ] **8.8.4** Implement `build_key_map(defaults, overrides) -> KeyMap`; tag DRY:FN:build_key_map. Wire app startup: after loading GuiConfig, build key map and install into key event handling.
- [ ] **8.8.5** Implement optional `validate_shortcut_binding` (no duplicate action binding; optional conflict check); tag DRY:FN if reusable.
- [ ] **8.8.6** Ensure all key handling in composer/prompt fields uses the key map (no hardcoded bindings). Shortcuts screen reads current bindings from key map and writes overrides to GuiConfig.
- [ ] **8.8.7** **Config load failure:** When loading GuiConfig, if the shortcuts section is missing, use empty overrides. If it fails to parse or is structurally invalid, fall back to empty overrides, log a warning, show toast "Shortcuts reset to defaults due to config error", and build key map from defaults only (§7.11). Do not crash.
- [ ] **8.8.8** Unit tests for shortcuts: build_key_map (defaults + overrides merge); validate_shortcut_binding (reject duplicate action, optional conflict); round-trip (defaults → override → build_key_map → same bindings). See §7.11.

### 8.9 Agent Skills backend (§7.8, §7.10)

Implement in order; discovery path order is canonical (§7.10).

- [ ] **8.9.1** Add `src/skills/` (or under `src/config/`): `mod.rs`, `discovery.rs`, `frontmatter.rs`, `permissions.rs`; declare in parent `mod.rs`.
- [ ] **8.9.2** Define discovery paths (DRY:DATA:skill_search_paths) in **canonical order**: project first (`.puppet-master/skills`, `.claude/skills`, `.agents/skills`), then global (`~/.config/puppet-master/skills`, etc.); implement `discover_skills(project_root) -> Vec<SkillInfo>` with first-wins deduplication by name; tag DRY:FN:discover_skills.
- [ ] **8.9.3** Implement `load_skill(path) -> Result<SkillInfo>` with YAML frontmatter parsing and name/description validation (length, regex, dir-name match); return clear errors for invalid frontmatter or missing file; tag DRY:FN:load_skill.
- [ ] **8.9.4** Add `skill_permissions` to GuiConfig; implement pattern-based resolve (allow/deny/ask) with wildcards; **explicit per-skill entry wins over pattern**; tag DRY:FN:resolve_skill_permission.
- [ ] **8.9.5** Implement CRUD: create skill dir + SKILL.md (if target dir already contains SKILL.md, return error and do not overwrite -- §7.11); update SKILL.md; delete (with confirmation); persist only permissions in config. On config write failure, return error to caller.
- [ ] **8.9.6** Implement `list_skills_for_agent(project_root, permissions) -> Vec<SkillInfo>` for runner/prompt integration; tag DRY:FN:list_skills_for_agent. **Document per provider (Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, Gemini) how skill paths or content are passed** (env, prompt, tool) in platform_specs or linked doc; implementation plan must list this mapping.
- [ ] **8.9.7** Unit tests for skills: discover_skills (mock dirs, order and deduplication); load_skill (valid/invalid frontmatter, name validation, dir-name match); resolve_skill_permission (exact + wildcard, default allow, explicit over pattern). See §7.11.

### 8.10 Shortcuts and Skills: export/import, search/filter, discoverability, bulk permission, sort/filter, preview, last modified, validate all

Required. Implement with core Shortcuts (§8.8) and Skills (§8.9).

**8.10.1 Shortcuts: export/import, search/filter, discoverability (§7.11.1)**

**Order:** Implement after §8.8 is complete. Steps: (1) Config load failure, (2) Export/import, (3) Search/filter, (4) Discoverability.

- [ ] **8.10.1.1** **Config load failure (Shortcuts):** Handle corrupted or invalid shortcuts section on load: fall back to defaults, show toast "Shortcuts reset to defaults due to config error", rebuild key map (§7.11, §8.8.7). Ensure this is wired at app startup and when opening Config → Shortcuts.
- [ ] **8.10.1.2** **Export/import:** Add "Export..." and "Import..." buttons on **Config → Shortcuts** tab. Implement `export_shortcuts_to_json` and `import_shortcuts_from_json` (DRY:FN); validate on import (action ids, no duplicate binding per §7.11); Replace/Merge confirmation modal; on success persist and rebuild key map. Use same serialization as GuiConfig.shortcuts. Reject invalid JSON or unsupported version with toast (§7.11.1).
- [ ] **8.10.1.3** **Search/filter:** Add filter text field above shortcut list on Shortcuts tab; filter by action label or shortcut string (case-insensitive substring). Empty filter = show all; non-empty with no match = show empty list + "No shortcuts match '...'" (§7.11). Optional DRY:FN `filter_shortcut_list` if reused.
- [ ] **8.10.1.4** **Discoverability:** Where actions with shortcuts appear (menus, buttons), show binding in label or tooltip via a single helper (DRY:FN or DRY:HELPER). When key map not yet loaded, show action label only or "(Loading...)" (§7.11). Keep in sync with key map after changes.

**8.10.2 Skills: bulk permission, sort/filter, preview, last modified, validate all (§7.11.2)**

Order: implement list/sort/filter first, then preview and last modified, then bulk permission and validate all.

- [ ] **8.10.2.1** **Sort/filter:** Add sort (Name / Source / Permission) and filter (text, source, permission) on Skills tab. Apply in-memory to discovered list; persist sort preference in GuiConfig (e.g. `skills_list_sort`). Use styled_text_input and dropdowns from widget catalog.
- [ ] **8.10.2.2** **Last modified:** Extend SkillInfo with `modified: Option<DateTime<Utc>>` from path metadata (discovery or load_skill); show in list row and in preview pane. If mtime unreadable, show empty or "--"; do not drop skill from list.
- [ ] **8.10.2.3** **Preview:** On skill selection in list, show SKILL.md body in read-only pane (load on demand). Reuse load_skill or add optional body / `load_skill_body`; on load failure show error in pane. "Edit" opens full editor.
- [ ] **8.10.2.4** **Bulk permission:** Add "Bulk permission" / "Set by pattern" on Skills tab (pattern input + Allow/Deny/Ask + Apply). Confirmation modal with count; on confirm update GuiConfig.skill_permissions and persist. Document in UI that explicit per-skill wins over pattern. On persist failure show error toast; keep in-memory state for retry.
- [ ] **8.10.2.5** **Validate all:** Add "Validate all" button; run `validate_skill` (DRY:FN) for each discovered skill; show **full table** (all skills) with status OK or Error + message; summary "N OK, M errors"; selectable labels for copy. Reuse validation logic from load_skill. Optional filter "Show only errors." On per-skill read error, report that skill and continue.
- [ ] **8.10.2.6** **Create skill -- dir exists:** On "Create new" skill, if target directory already exists and contains SKILL.md, show error and do not overwrite (§7.11). User must choose different name or remove existing skill first.
- [ ] **8.10.2.7** **Edit -- concurrent edit on disk:** On save, if SKILL.md was modified on disk since open, implementation must decide: recommend detect (mtime or content) and prompt "File changed on disk. Reload / Overwrite / Cancel" (§7.11).

### 8.7 Pre-completion

- [ ] **8.7.1** Run full AGENTS.md Pre-Completion Verification Checklist (compile, DRY tagging, module organization, tests, scope); update Task Status Log when done.

---

