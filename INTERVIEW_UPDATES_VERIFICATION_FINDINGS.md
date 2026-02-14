# Interview Updates Verification Findings

**Date:** 2026-02-14  
**Scope:** Read-only verification of `interviewupdates.md` against the Rust/Iced codebase in `puppet-master-rs/`.  
**Codebase:** Rust/Iced rewrite only (no Tauri/TS).

---

## 1. Scope and Exclusions

**In scope:**
- All checklist items and “completed” claims in `interviewupdates.md` that refer to Rust/Iced implementation.
- Verification that modules exist, are wired, and behave as described (via code inspection and grep/read).
- DRY and reuse: use of shared widgets and existing code paths.

**Excluded (per user / doc):**
- **End-to-end manual testing** – Not yet performed; doc and user state this explicitly. No E2E test execution was done.
- **Full tooltip coverage** – Doc defers completing tooltips across the entire GUI until things stop changing. Verification is limited to: tooltip system exists and is used in Config + Wizard Step 0/0.5; no claim that every field app-wide has a tooltip.
- **Color contrast / WCAG AA** – Doc notes “Color contrast verification pending”; not verified in this pass.

---

## 2. Executive Summary

| Category | Status |
|----------|--------|
| **Interview module (backend)** | **Done.** All 15 modules present, exported, and used. Orchestrator, failover, phase manager, document writer, completion validator, reference manager, research engine, agents_md_generator, test_strategy_generator, technology_matrix, feature_detector, state, prompt_templates, question_parser, codebase_scanner. |
| **Wizard Steps 0 and 0.5** | **Done.** Step 0 (Project Setup) and Step 0.5 (Interview Config) implemented in `wizard.rs` with tooltips. |
| **Config Interview tab** | **Done.** `InterviewConfig` in `types/config.rs` matches Part 4.1; Interview tab in `config.rs` with `help_tooltip` for all listed fields. |
| **Interview view** | **Done.** Phase tracker, Q&A, reference panel, selectable text, pause/end. Dynamic phases via `InterviewPhaseDefinition` / `phase_definitions`. Responsive `LayoutSize` is passed but not used for layout. |
| **Real AI turns and failover** | **Done.** `execute_ai_turn` in `app.rs` uses `PlatformRegistry`, `runner.execute()`, `is_quota_error`, and `failover_manager().failover()` with retry loop. |
| **Reference manager** | **Done.** URL fetch (`reqwest::blocking`), image OCR (tesseract + timeout), `derive_context_files`, manifest and context loading. |
| **State, completion validator, document output** | **Done.** YAML state, `validate_completion` with multiple checks, document_writer to `output_dir`. |
| **PRD / tier tree / acceptance criteria** | **Done.** `inject_default_acceptance_criteria` in prd_generator, TierTree from PRD, tier nodes load/merge `.puppet-master/interview/test-strategy.json`. |
| **PromptBuilder interview outputs** | **Partial.** Loads `requirements-complete.md` and `master_requirements.md` from correct paths. Loads `test-strategy.md` from `.puppet-master/test-strategy.md` while interview writes to `.puppet-master/interview/` — **path mismatch**. |
| **Projects page** | **Done.** Persistent `projects.json`, `ProjectStatusInspector`, status badges (Idle/Interviewing/Executing/etc.), pin/unpin, cleanup, refresh. |
| **Doctor Playwright** | **Done.** `fix()` returns `Some(FixResult)` with npm + playwright install (doc’s “returns None” is outdated). |
| **Dynamic phases (Phase 9+)** | **Done.** Feature detection after phase 8, dynamic phases added to phase manager and persisted in state; interview view renders from `phase_definitions`. |
| **Agents gate and promotion** | **Done.** `enforce_agents_gate` and `promote_tier_learnings` wired in `core/orchestrator.rs`. |
| **Worktree recovery** | **Done.** `WorktreeManager::recover_orphaned_worktrees()` called at app startup in `app.rs`. |
| **Existing-project scan** | **Gap.** `codebase_scanner::scan_project` exists but is never invoked; app always passes `project_context: None` when creating the orchestrator. |

**Overall:** Most of the interview system is implemented and wired. Remaining issues: one **path mismatch** (test-strategy.md), one **unwired feature** (existing-project scan), one **doc discrepancy** (Playwright fix), and one **minor unused parameter** (LayoutSize in interview view).

---

## 3. Findings by Area

### 3.1 Interview module (`puppet-master-rs/src/interview/`)

- **mod.rs** exports 15 modules: agents_md_generator, codebase_scanner, completion_validator, document_writer, failover, feature_detector, orchestrator, phase_manager, prompt_templates, question_parser, reference_manager, research_engine, state, technology_matrix, test_strategy_generator. All referenced from app or orchestrator.
- **orchestrator.rs:** `InterviewOrchestratorConfig` includes `project_context: Option<String>`, `output_dir`, failover manager, phase manager. `advance_phase()` writes phase docs, runs feature detection after phase 8, adds dynamic phases. `complete()` writes master doc, JSON, optional AGENTS.md and test strategy.
- **failover.rs:** `FailoverManager`, `is_quota_error()`, `get_current_platform()`, `failover()`, `reset()`. Used in `app.rs` around `execute_ai_turn`.
- **state.rs:** YAML save/load at `output_dir` (e.g. `state.yaml`), `load_state_at_output_dir`, `save_state_at_output_dir`, `clear_state_at_output_dir`. State includes `dynamic_phases` for persistence.
- **completion_validator.rs:** `validate_completion()` with checks: domain coverage, minimum questions, conflicting decisions, vague/TBD decisions, ambiguous answers, version pinning, deployment targets, open items.
- **reference_manager.rs:** `fetch_url_content()` (reqwest blocking, timeout/size limits), `extract_image_text_async()` (tesseract, tokio timeout), `derive_context_files()` for platform attachments. Manifest and context loading implemented.
- **research_engine.rs:** Uses `get_runner()` and `runner.execute()` for research calls.
- **codebase_scanner.rs:** `scan_project(root)` exists; **no caller** in the codebase. Orchestrator and prompt_templates accept `project_context` but app always passes `None`.

### 3.2 Wizard (`puppet-master-rs/src/views/wizard.rs`)

- Step 0 (Project Setup): labels and fields present (project type, name, path, GitHub URL, visibility, etc.). Tooltips via `help_tooltip` for e.g. `wizard.project_type`, `wizard.project_name`, `wizard.project_path`, `wizard.github_repo`, `wizard.github_url`, `wizard.github_visibility`.
- Step 0.5 (Interview Configuration): interview toggle, interaction mode, reasoning level, generate AGENTS.md. Tooltips: `wizard.use_interview`, `interview.interaction_mode`, `interview.reasoning_level`, `interview.generate_agents_md`.
- Steps 1–7 retained; wizard flow uses internal step indices 0–8.

### 3.3 Config (`puppet-master-rs/src/types/config.rs`, `puppet-master-rs/src/views/config.rs`)

- **InterviewConfig** in `types/config.rs`: `platform`, `model`, `reasoning_level`, `backup_platforms`, `max_questions_per_phase`, `first_principles`, `output_dir`, `require_architecture_confirmation`, `generate_playwright_requirements`, `generate_initial_agents_md`, `interaction_mode`, `vision_provider`. Defaults and serde defaults present.
- Config view has an Interview tab with fields and `help_tooltip` for: `interview.primary_platform`, `interview.vision_provider`, `interview.primary_model`, `interview.reasoning_level`, `interview.backup_platforms`, `interview.max_questions_per_phase`, `interview.first_principles`, `interview.architecture_confirmation`, `interview.playwright_requirements`, `interview.generate_agents_md`, `interview.interaction_mode`, `interview.output_dir`. Other tabs (Tiers, Branching, Verification, Memory, Budgets, Advanced) also use `help_tooltip` with keys from `tooltips.rs`.

### 3.4 Interview view (`puppet-master-rs/src/views/interview.rs`)

- View signature takes `phase_definitions: &[InterviewPhaseDefinition]` — dynamic phase list, not hard-coded 8.
- Uses `selectable_text_field` for current question, prior Q/A, reference list details (copy/context menu).
- Reference materials panel: Add File/Directory/Link/Image, list with remove.
- Header, status, answer input, submit/pause/end. Research indicator (“AI RESEARCHING...”).
- `size: crate::widgets::responsive::LayoutSize` is passed in but **not used** for conditional layout (e.g. panel visibility). Comment says “size used for conditional panel display” but no branching on `size` in the body.

### 3.5 App: AI turn and failover (`puppet-master-rs/src/app.rs`)

- `execute_ai_turn()` (around 6798–6910): builds `PlatformRegistry`, gets runner for current platform from failover manager, builds `ExecutionRequest` (with `context_files`, `reasoning_effort`), calls `runner.execute(&request).await`. On error, checks `is_quota_error()`; if true, calls `failover_manager_mut().failover()` and retries; otherwise returns error. On success, processes response via `orchestrator.process_ai_response()`, then `failover_manager_mut().reset()`.
- Orchestrator creation (e.g. 6758, 7297): `project_context: None` with comment “Could scan codebase” — **existing-project scan never wired**.

### 3.6 Dashboard and interview panel (`puppet-master-rs/src/views/dashboard.rs`)

- Imports `InterviewPanelData`, `interview_panel_compact`. Renders `interview_panel_compact(...)` when `interview_data` is `Some`. Data supplied from app (e.g. `interview_panel_data` when `interview_active`).

### 3.7 PRD, tier tree, test strategy (`puppet-master-rs/src/start_chain/`, `puppet-master-rs/src/core/`)

- **prd_generator.rs:** `inject_default_acceptance_criteria()` uses `AcceptanceCriteriaInjector`; prefix formats (command/file_exists/regex) supported.
- **tier_node.rs:** `TierTree::from_prd()` builds hierarchy; loads `.puppet-master/interview/test-strategy.json` and merges criteria into tier nodes (phase/task/subtask). Graceful when file missing or invalid.
- **prompt_builder.rs:** `load_interview_outputs()` loads:
  - `workspace/.puppet-master/requirements/master_requirements.md`
  - `workspace/.puppet-master/interview/requirements-complete.md`
  - `workspace/.puppet-master/test-strategy.md`
  Interview writes test-strategy files to `output_dir` (`.puppet-master/interview/`), so **test-strategy.md is under `interview/`**, not under `.puppet-master/` root. PromptBuilder does not look under `interview/` for test-strategy — **path mismatch**.

### 3.8 Projects (`puppet-master-rs/src/projects/`)

- **persistence.rs:** Stores known projects in `.puppet-master/projects.json` (app data dir). Load/save, add/update, remove, pin/unpin.
- **status.rs:** `ProjectStatusInspector` inspects interview state (YAML, requirements-complete marker) and orchestrator checkpoint to derive `ProjectStatus` (Idle, Interviewing, Executing, Paused, Complete, Error) and optional summary string.
- **views/projects.rs:** Lists projects with status badges, pin/unpin, cleanup missing, refresh, “Start New Project”, “Open Existing”. Uses `LayoutSize` for responsive form layout (e.g. `size.is_mobile()`).

### 3.9 Doctor Playwright (`puppet-master-rs/src/doctor/checks/playwright_check.rs`)

- `has_fix()` returns `true`. `fix()` returns `Option<FixResult>`: for dry_run returns `Some(success with steps)`; for real run runs npm ci/install, then `npx playwright install` (and on Linux `npx playwright install --with-deps`), and returns `Some(FixResult::success(...))` or `Some(FixResult::failure(...))`. **No `None` return** — doc’s “returns None” (previously around lines 234–236) is **outdated**.

### 3.10 Dynamic phases

- **feature_detector.rs:** Detects features from state after core phases. Orchestrator calls it when `current_phase_count == 8`, adds dynamic phases via `phase_manager.add_dynamic_phase()`, persists in state.
- **state.rs:** `dynamic_phases` in interview state for round-trip.
- **views/interview.rs:** Phase list built from `phase_definitions` (empty fallback when none).

### 3.11 Agents gate and promotion (`puppet-master-rs/src/core/orchestrator.rs`, `puppet-master-rs/src/state/`)

- `gate_enforcer: Arc<GateEnforcer>` on orchestrator. `enforce_agents_gate(tier_id)` loads AGENTS.md, runs `GateEnforcer::for_tier(tier_id).enforce(...)`, returns error if violations. Called during tier completion (e.g. around 1932).
- `promote_tier_learnings(tier_id)` uses agents manager and promotion logic; called after tier completion (e.g. 1984). `agents_gate_enforcer.rs` has MinFailureModes and phase/root enforcement. `agents_promotion.rs` writes to workspace root AGENTS.md (fixed for root path).

### 3.12 Worktree recovery (`puppet-master-rs/src/app.rs`)

- Around 1092–1093: gets repo root (e.g. from cwd), creates `WorktreeManager::new(repo_root)`, calls `manager.recover_orphaned_worktrees().await`. Non-fatal: errors logged, startup continues.

### 3.13 DRY and widget reuse

- **docs/gui-widget-catalog.md** lists canonical widgets and “use this when” / “anti-patterns”.
- Interview view: `selectable_text_field`, `themed_panel`, `styled_button`, `styled_text_input_with_variant`, `status_dot_typed`, etc. Dashboard: `interview_panel_compact`. Config and wizard: `help_tooltip` with central `tooltips.rs` keys. No duplicate implementations found for selectable text or interview panel; reuse is consistent with DRY.

---

## 4. Discrepancies (document vs code)

| Doc claim | Actual code | Location |
|-----------|-------------|----------|
| Playwright check “auto-install workflow needs completion - currently returns None from fix method (line 234-236)” | `fix()` returns `Some(FixResult)` with full npm + playwright install implementation; no `None`. | `puppet-master-rs/src/doctor/checks/playwright_check.rs` (fix() around 261–340+) |
| “TODO on line 44” in interview view for responsive layout | No TODO at line 44. `LayoutSize` is passed but unused; comment says “size used for conditional panel display” but there is no such use. | `puppet-master-rs/src/views/interview.rs` |

---

## 5. Gaps (incomplete or missing wiring)

1. **Existing-project scan not invoked**  
   `codebase_scanner::scan_project(root)` exists and returns a summary string. Orchestrator config has `project_context: Option<String>` and prompt_templates use it. The app always passes `project_context: None` when creating the interview orchestrator (see `app.rs` e.g. 6758, 7297). **Recommendation:** When starting an interview for an “existing project”, call `codebase_scanner::scan_project(project_path)` and pass the result as `project_context`.

2. **Test-strategy path mismatch**  
   Interview writes `test-strategy.md` and `test-strategy.json` to `output_dir` (default `.puppet-master/interview/`). PromptBuilder’s `load_interview_outputs()` only looks for `workspace/.puppet-master/test-strategy.md`. So orchestration prompts do not see the interview-generated test strategy unless it is also written to the root `.puppet-master/` or PromptBuilder is updated to look under `workspace/.puppet-master/interview/test-strategy.md` (and optionally `.puppet-master/test-strategy.md` for backward compatibility). **Recommendation:** Either have the interview write a copy of `test-strategy.md` to `.puppet-master/`, or add in PromptBuilder a check for `.puppet-master/interview/test-strategy.md` (and prefer it when present).

3. **Responsive layout in interview view**  
   `LayoutSize` is passed but not used. Doc and comment suggest “conditional panel display” by size; currently there is no layout branching on `size`. **Recommendation:** Either use `size` (e.g. hide or collapse side panels on small width) or remove the parameter and update the doc to avoid confusion.

---

## 6. Recommendations

1. **Wire existing-project scan:** In the code path that starts an interview for an existing project (e.g. after wizard Step 0 when project path is known), call `interview::codebase_scanner::scan_project(&project_path)` and pass the result in `InterviewOrchestratorConfig::project_context`.
2. **Align test-strategy path:** Prefer loading `workspace/.puppet-master/interview/test-strategy.md` in `PromptBuilder::load_interview_outputs()` when present, and optionally keep `.puppet-master/test-strategy.md` as fallback; or have the interview write a copy to `.puppet-master/test-strategy.md` so current PromptBuilder behavior works.
3. **Use or drop LayoutSize in interview view:** Either implement conditional layout (e.g. panel visibility) based on `size` in `views/interview.rs`, or stop passing `LayoutSize` and update the doc.
4. **Update interviewupdates.md:** Fix the Playwright “returns None” wording to state that `fix()` is implemented and returns `Some(FixResult)`; remove or update the “TODO on line 44” for the interview view.
5. **When stable:** Complete tooltip coverage across all config/wizard fields and other views as agreed (deferred until UI stabilizes).
6. **When environment allows:** Run manual E2E interview with a real platform (Cursor/Codex/Claude/Gemini/Copilot) to validate prompts, failover, and phase transitions.

---

*End of findings document.*
