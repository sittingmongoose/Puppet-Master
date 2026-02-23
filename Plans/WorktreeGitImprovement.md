# Worktree & Git Improvement -- Implementation Plan

## Plan Document Status

**This is a PLAN DOCUMENT ONLY** -- No code changes have been made. The document is **implementation-ready**: gaps closed (Section 7.14), dependency order and acceptance criteria in Section 6, GUI aligned with FinalGUISpec and MiscPlan. This document consolidates:

- Worktree implementation gaps and fixes
- Git integration gaps and fixes
- GUI wiring and UX for Git/worktrees
- Dependencies on config wiring (enable_parallel, etc.)

The plan is **implementation-ready**: gaps closed (Section 7.14), dependency order and acceptance criteria in Section 6, GUI aligned with FinalGUISpec and MiscPlan. Resolve each section during implementation so worktrees and Git work correctly end-to-end.

## Rewrite alignment (2026-02-21)

This plan's correctness requirements remain authoritative. As the rewrite lands (see `Plans/rewrite-tie-in-memo.md`):

- Worktrees/branches/sandboxes are part of the **patch/apply/verify/rollback pipeline** (core reliability), not just a Git feature
- Provider working directories (and MCP injection) must respect worktree execution contexts deterministically
- Config references to YAML files should be treated as *current representations*; the rewrite may project settings via redb while retaining import/export

**ELI5/Expert copy alignment:** Authored Git/worktree tooltip/help copy in this plan must provide both Expert and ELI5 variants and follow `Plans/FinalGUISpec.md` §7.4.0. Use app-level **Interaction Mode (Expert/ELI5)** for variant selection; do not couple this to chat-level **Chat ELI5**.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Worktree Improvements](#2-worktree-improvements)
3. [Git Improvements](#3-git-improvements)
4. [GUI for Git & Worktrees](#4-gui-for-git--worktrees)
5. [Config Wiring (Prerequisite)](#5-config-wiring-prerequisite)
6. [Implementation Checklist](#6-implementation-checklist)
7. [Gaps, Risks, and Implementation Notes](#7-gaps-risks-and-implementation-notes) (includes [7.11 DRY and AGENTS.md](#711-dry-and-agentsmd-conventions), [7.14 Resolved decisions](#714-resolved-decisions-implementation-ready))
8. [References](#8-references)

---

## 1. Executive Summary

### Goals

- **Worktrees:** Reliable creation/merge/cleanup; correct base branch; recovery and visibility; no unwired or duplicate logic.
- **Git:** Single source of truth for branch naming; config-driven strategy; consistent binary resolution; commit format and logging aligned with docs.
- **GUI:** All Git/worktree-relevant settings visible, wired to the config the orchestrator uses, and consistent with tooltips and docs.

### Critical Blocker

The orchestrator reads **PuppetMasterConfig** from `ConfigManager::discover()` (YAML). The Config page edits **GuiConfig** and saves it to the same path (e.g. `puppet-master.yaml`). The two shapes differ; **enable_parallel** and other advanced/orchestrator fields in the GUI are never seen by the run. **Until config wiring is fixed**, worktrees and Git behavior cannot be fully controlled from the UI. For a consolidated list of unwired features and GUI gaps across plans, see **MiscPlan §9.1.18**.

### GUI updates needed

**Yes.** All Git/worktree-relevant settings must be visible and wired. Required: Branching tab (Enable Git, Auto PR, Branch strategy, optional Use worktrees/Parallel note); optional worktree list and "Recover orphaned worktrees" (placement: **Health** tab per FinalGUISpec); Git info for **active project**; tooltip cleanup. See [Section 4](#4-gui-for-git--worktrees) and Phase 4 checklist. Align with FinalGUISpec §7.4 (Branching and Health) and MiscPlan §7.5 (project path, Option B, cleanup ownership).

### Readiness for implementation

The plan is **ready to implement** with the following in mind:

- **Section 7** (Gaps, Risks, and Implementation Notes) adds the missing detail: config schema mismatch (including granularity enum vs string), how Doctor gets project path, backend run not using current project, conflict-worktree persistence, exact binary-resolution functions, repopulation behavior, granularity vs BranchStrategy, integration test setup, worktree Doctor check scope, and risks (config migration, save timing).
- **Phase 1 (config wiring)** must be implemented first (Option B: build run config from GUI at run start); the rest of the checklist can proceed in order. Section 7.1 and 7.10 describe mapping and save timing for Option B.
- **Optional items** (e.g. worktree list/recover UI, "nothing to commit" handling, re-validate worktree path) can be skipped for an initial release and done later.

---

## 2. Worktree Improvements

### 2.1 Base branch for worktree creation

- **Gap:** Worktrees are created with `git worktree add -b <branch> <path>` from **current HEAD** of the main repo. There is no checkout of `config.branching.base_branch` first.
- **Impact:** If the main repo is on a feature branch, new worktrees are created from that branch instead of `main` (or configured base).
- **Fix:**
  - Before creating worktrees for a parallel group, ensure the main repo is on `config.branching.base_branch` (e.g. `git checkout base_branch` or at least validate and warn).
  - Optionally: create worktrees from a specific ref, e.g. `git worktree add -b <branch> <path> <base_branch>` (supported in recent Git).

### 2.2 active_worktrees lost on restart

- **Gap:** `active_worktrees` is in-memory only. After restart it is empty; real worktrees may still exist under `.puppet-master/worktrees/`, but `get_tier_worktree(tier_id)` returns `None`, so iterations use the main repo path.
- **Fix (choose one or combine):**
  - **Option A:** On orchestrator init (or when loading a run), repopulate `active_worktrees` from `worktree_manager.list_worktrees()` for paths under `worktree_base`.
  - **Option B:** When resolving working directory for a tier, if `active_worktrees` has no entry, fall back to `worktree_manager.get_worktree_path(tier_id)` and verify the path exists and is a valid worktree (e.g. in `list_worktrees()`); if so, use it and optionally re-register.

### 2.3 Merge conflicts: worktree kept but re-run can destroy it

- **Gap:** On merge conflict, `cleanup_subtask_worktree` returns without removing the worktree but removes the tier from `active_worktrees`. Re-running the same subtask calls `create_subtask_worktree` → `create_worktree` → "if path exists remove_worktree", so the conflicting worktree is removed and the conflict state is lost.
- **Fix:**
  - On conflict, either: (1) surface the worktree path to the user (e.g. toast or status) and avoid reusing that tier_id for a new worktree until the user resolves or discards, or (2) document clearly that re-running will replace the worktree and lose unmerged state.
  - Optionally: add a "Resolve worktree conflicts" action that lists worktrees with merge conflicts and offers to open in editor or remove after confirmation.

### 2.4 Tier ID and branch name sanitization

- **Gap:** Worktree path is `worktree_base.join(tier_id)` with no sanitization; branch name is `format!("subtask/{}", subtask_id.replace('.', "-"))` with no other sanitization. Risky for path traversal or invalid refs.
- **Fix:**
  - Sanitize `tier_id` for use as a single path component (strip or replace `..`, path separators, and other unsafe characters) before `join`.
  - Sanitize branch name for git refs (e.g. reuse or mirror `BranchStrategyManager::sanitize_id` or a shared helper; disallow spaces and other invalid ref characters).

### 2.5 Branch already exists when recreating worktree

- **Gap:** If the branch (e.g. `subtask/ST-001-001-001`) already exists (e.g. after incomplete cleanup), `git worktree add -b <branch> <path>` fails with "fatal: A branch named '...' already exists."
- **Fix:**
  - Before `worktree add -b`, check if the branch exists (e.g. `git rev-parse --verify refs/heads/<branch>`). If it exists, use `git worktree add <path> <branch>` (no `-b`) to create the worktree from the existing branch, or explicitly delete the branch if it is safe (e.g. no other worktree uses it).

### 2.6 Detached HEAD worktrees

- **Gap:** `list_worktrees` only sets `branch` when it sees a `branch refs/heads/...` line. Detached HEAD worktrees yield empty `branch`; `merge_worktree` would then call `git merge ""`.
- **Fix:** When parsing porcelain output, treat missing branch as "detached". In `merge_worktree`, if source_branch is empty, skip merge or merge by commit hash and document behavior.

### 2.7 worktree_exists is path-only

- **Gap:** `worktree_exists(tier_id)` is `get_worktree_path(tier_id).exists()`. A non-worktree directory with the same name would be treated as existing; `remove_worktree` could then run `git worktree remove --force` on a non-worktree path.
- **Fix:** Consider "exists" only if the path exists and looks like a worktree (e.g. has a `.git` file pointing at the main repo), or rely on `list_worktrees()` and check if the path is in that list.

### 2.8 Startup recovery uses process CWD

- **Gap:** Worktree recovery runs with `std::env::current_dir()` and `git rev-parse --show-toplevel` there. If the app is started from a launcher or different repo, recovery runs in the wrong place.
- **Fix:** Run recovery only when a project/workspace is known (e.g. from config or current project). Use that path for `WorktreeManager` and `recover_orphaned_worktrees()`. If no project is known at startup, skip or run recovery when the user first selects/opens a project.

### 2.9 PR creation after restart uses main repo branch

- **Gap:** After restart, `get_tier_worktree(tier_id)` is `None`. `create_tier_pr` then uses `git_manager.current_branch()` for head_branch, so the PR is created from the main repo branch, not the worktree branch.
- **Fix:** When resolving head branch for PR, also consider `worktree_manager`: if a worktree path exists for this tier (e.g. from `list_worktrees()` or path existence + valid worktree), use that worktree's branch even when `active_worktrees` has no entry.

### 2.10 merge_worktree assumes target_branch exists

- **Gap:** `merge_worktree` does `git checkout target_branch`. If the branch doesn't exist, checkout fails.
- **Fix:** Check for existence of `target_branch` (e.g. `git rev-parse --verify refs/heads/<branch>`). If missing, create it from current HEAD or a configured default, or return a clear error that base branch is missing.

### 2.11 Documentation and Doctor

- **STATE_FILES.md:** Add a subsection under `.puppet-master/` describing worktrees (purpose, lifecycle, that progress/PRD/AGENTS remain in main workspace, recovery).
- **Doctor:** Add a "worktrees" check: run `git worktree list`, verify `.puppet-master/worktrees` state, optionally run `detect_orphaned_worktrees()` and report or suggest recovery.

### 2.12 Optional: re-validate worktree path before use

- Before building `IterationContext`, optionally verify the worktree path still exists and is still in `git worktree list`; if not, remove from `active_worktrees` and fall back to main repo (and log).

---

## 3. Git Improvements

### 3.1 Git binary resolution

- **Gap:** `GitManager::run_git_cmd` uses `Command::new("git")` (PATH only). Doctor's `GitInstalledCheck` uses `find_tool_executable("git")` (PATH + fallback dirs). If git is in a custom/app-local path, Doctor can pass but runtime git operations can fail.
- **Fix:** Use a shared helper (e.g. from `path_utils` or a small `git_resolver` module) to resolve the `git` executable. Have both `GitManager` and the Doctor check use it (e.g. `GitManager::new(repo_path, git_binary: Option<PathBuf>)` or resolve at call site).

### 3.2 GitHub PR creation (API-only; no GitHub CLI)

- **Gap:** PR creation currently relies on a GitHub CLI subprocess in some legacy integration paths. This violates the locked decision: GitHub operations are **API-only**.
- **Fix:** Implement PR creation via GitHub HTTPS API per `Plans/GitHub_API_Auth_and_Flows.md` (OAuth device-code token in OS credential store). Doctor must validate GitHub API auth state and required scopes; runtime PR creation must not shell out to a GitHub CLI.

### 3.3 Git configured check: global vs local

- **Gap:** `GitConfiguredCheck` only checks `git config --global user.name` and `user.email`. Repos using only local config will fail the check even though commits would succeed.
- **Fix:** Consider "configured" if either global or local is set. Run `git config user.name` and `git config user.email` without `--global` in the project directory (when available) and pass if either global or local has both name and email.

### 3.4 Git repo check: use project path

- **Gap:** `GitRepoCheck` uses `resolve_git_init_dir()` (CWD if writable, else HOME). The "current directory" may not be the active project; fix runs `git init` in the wrong place.
- **Fix:** When a project/working directory is known (e.g. from config or app state), run the check and fix in that directory. Only fall back to CWD/home when no project is set.

### 3.5 Branch strategy from config

- **Gap:** Orchestrator hardcodes `BranchStrategy::Feature`. `GitConfig` in types has `branch_strategy`, but the orchestrator never reads it.
- **Fix:** Add branch strategy to the config the orchestrator loads (e.g. under `branching` or a dedicated `git` section). Map config value to `BranchStrategy` and use it in `create_tier_branch` instead of hardcoding.

### 3.6 Single source of truth for branch naming

- **Gap:** Orchestrator inlines branch name generation in `create_tier_branch`; `BranchStrategyManager::generate_branch_name` implements similar but not identical logic (e.g. iteration: "it-" vs "tk-").
- **Fix:** Use one implementation for all branch naming (e.g. `BranchStrategyManager` or a shared function used by both orchestrator and any other callers). Remove duplicate logic from the orchestrator.

### 3.7 naming_pattern usage

- **Gap:** `BranchingConfig` has `naming_pattern` (and it's in the GUI); orchestrator and branch logic never use it.
- **Fix:** Either: (1) Wire `naming_pattern` into branch name generation (document format and placeholders, e.g. `{tier}`, `{id}`), or (2) Remove or hide the field until implemented and document that branch names follow the strategy (ph-/tk-/st-/release/...) only.

### 3.8 Commit message format

- **Gap:** `commit_tier_progress` uses `format!("tier: {} iteration {} complete", tier_id, iteration)`. AGENTS.md and `CommitFormatter` use the `ralph: [ITERATION] ...` convention.
- **Fix:** Use `CommitFormatter::format_iteration_commit(subtask_id, iteration, success)` (or equivalent) for iteration commits so they match the documented "ralph:" convention.

### 3.9 git-actions.log path and .gitignore

- **Gap:** `GitManager` writes to `repo_path.join(".puppet-master").join("git-actions.log")`. REQUIREMENTS.md says "All git operations recorded in: `.puppet-master/logs/git-actions.log`". Paths differ; .gitignore does not mention this log.
- **Fix:** Either move the log to `.puppet-master/logs/git-actions.log` to match REQUIREMENTS, or update REQUIREMENTS to the current path. Then decide whether to add this log (or `.puppet-master/logs/`) to .gitignore if it is runtime-only.

### 3.10 Doctor: git usable in project

- **Gap:** Doctor checks git installed, configured (global), and "in a repo" (CWD/home). It doesn't check that the **project** directory is a repo or that basic git commands work there.
- **Fix:** Optional: add a check that, when the configured project path is known, runs `git rev-parse --git-dir` (and optionally `git status`) in that directory and reports success/failure.

### 3.11 Empty commit handling

- **Gap:** When there are no changes, `git commit` fails with "nothing to commit". The code logs a warning; no distinction from real errors.
- **Fix:** Optional: detect "nothing to commit" (e.g. from stderr or exit code) and log at debug/info to reduce noise.

---

## 4. GUI for Git & Worktrees

### 4.1 Current state

**Config → Branching tab:**

- **Shown:** Base branch, Naming pattern, Granularity (single / per_phase / per_task). Git info (current branch, remote URL, user name, email) when available (from `git_info`).
- **Not shown:** Enable Git, Auto PR, Branch strategy (MainOnly/Feature/Release), "Use worktrees" (parallel), Auto merge on success, Delete branch on merge.
- **Tooltips exist but no controls:** `branching.strategy`, `branching.use_worktrees`, `branching.auto_merge_on_success`, `branching.delete_on_merge`.

**Config → Advanced / Execution:**

- **Shown:** "Enable parallel execution" toggle (bound to `gui_config.advanced.execution.enable_parallel`).
- **Not wired:** This value is never written to the config the orchestrator loads; the run uses `PuppetMasterConfig.orchestrator.enable_parallel_execution` from YAML (or default false).

**Cross-plan (MiscPlan):** Project path for Doctor and "Clean workspace now" must be resolved from the same source as the run (see Section 7.2 and MiscPlan §7.5). Option B run config built from GuiConfig at run start must include both Worktree/Git fields and (when implemented) MiscPlan cleanup/evidence fields so one Save persists all. "Clean workspace now" and "Clean all worktrees" placement and behavior are defined in MiscPlan §7.5; Worktree plan exposes worktree list for "Clean all worktrees."

**Login / Setup:**

- Git config section (user, email, remote, current branch); GitHub auth via GitHub HTTPS API (device-code flow) in Setup.

**No dedicated UI for:**

- List worktrees, recover orphaned worktrees, worktree status, or which tier is using which worktree.

### 4.2 GUI improvements

#### 4.2.1 Wire existing settings to run config (see Section 5)

- Ensure "Enable parallel execution" and any other execution/orchestrator flags edited in the GUI are persisted into the config that `ConfigManager` loads (or that the run receives a config built from GuiConfig). This is a prerequisite for worktrees and Git behavior to be controllable from the UI.

#### 4.2.2 Branching tab: add missing controls

**DRY REQUIREMENT -- Widget Reuse:** Before writing ANY UI code, check `docs/gui-widget-catalog.md` and use existing widgets (`toggler`, `styled_button`, `selectable_label`, `themed_panel`, `help_tooltip`). DO NOT create new widgets unless absolutely necessary. Tag any new reusable widgets with `// DRY:WIDGET:<name>` and run `scripts/generate-widget-catalog.sh` after changes.

- **Enable Git:** Toggle bound to `orchestrator.enable_git` (or equivalent in the canonical config). **Use existing `toggler` widget** -- DO NOT create a new toggle. Tooltip: e.g. "Enable git branch creation, commits, and PR creation during runs." **Use existing `help_tooltip` widget**.
- **Auto PR:** Toggle bound to `branching.auto_pr`. **Use existing `toggler` widget**. Tooltip: "Create a pull request automatically when a tier completes; if off, worktree is merged to base branch without PR." **Use existing `help_tooltip` widget**.
- **Branch strategy:** **Use Iced `pick_list`** (same pattern as in `views/config.rs` for platform/model). Values: Main only / Feature (or Tier) / Release. Bound to config `branching.strategy` (or equivalent). Use existing tooltip `branching.strategy`.
- **Use worktrees (parallel):** Per FinalGUISpec §7.4, Branching tab can show both **Use worktrees** toggle and **Parallel execution** toggle; both must be wired (see Section 5). Add note: "Parallel subtasks use separate git worktrees." **Use existing `selectable_label`** for the note.
- **Auto merge on success / Delete on merge:** Add toggles if the product wants them; wire to config and implement behavior in orchestrator/worktree cleanup. **Use existing `toggler` widgets**. Use existing tooltips.

#### 4.2.3 Branching tab: fix or remove unused fields

- **Naming pattern:** Either wire to branch name generation (document format) or mark as "Reserved for future use" and hide/disable until implemented.
- **Granularity:** Use existing **`radio`** (as in config.rs tab_branching) or **`pick_list`** if switching to dropdown; see gui-widget-catalog and config.rs. Clarify semantics vs actual behavior: today the orchestrator creates branches per tier based on BranchStrategy, not per phase/task granularity. Either map granularity to strategy/branch creation policy and document, or align UI label with actual behavior (e.g. "Branch per tier (phase/task/subtask)"). FinalGUISpec §7.4 allows "per_phase / per_task / per_subtask"; include per_subtask if exposing granularity.

#### 4.2.4 Worktree visibility (optional)

- **Location:** **Health tab** (Settings → Health) per FinalGUISpec §7.4. Worktree list and "Recover orphaned worktrees" are implemented in Health; Worktree plan owns behavior and data (`list_worktrees`, `recover_orphaned_worktrees`).
- **Features:**
  - **Worktree list:** Columns **path, branch, status, age** (per FinalGUISpec). Use a **scrollable column of rows**; each row: **`selectable_label`** or **`selectable_label_mono`** for path/branch/age, **`status_badge`** or **`status_dot`** for status (active/stale/orphaned). No new table widget; reuse scrollable + rows + selectable_label + status_badge (see ledger/doctor list patterns).
  - **Worktree status indicators:** active / stale / orphaned (per FinalGUISpec).
  - **"Recover orphaned worktrees" button:** **`styled_button`**; calls `worktree_manager.recover_orphaned_worktrees()`; show result via **`toast_overlay`**.
- **Scope:** Best-effort; only when project path is known and is a git repo. Expose worktree list for use by MiscPlan "Clean all worktrees" (button/placement and copy are in MiscPlan §7.5).

#### 4.2.5 Git info context

- **Gap:** Git info (**user, email, remote, branch** -- per FinalGUISpec §7.4) is loaded for the Config page; ensure it is resolved for the **active project** (current project or config path), not only CWD, so it matches what the run will use.

### 4.3 Tooltip cleanup

- Remove or repurpose tooltips for controls that don't exist (e.g. use_worktrees, auto_merge_on_success, delete_on_merge) once the corresponding controls are added or the product decision is to not support them.

---

## 5. Config Wiring (Prerequisite)

### 5.1 Problem

- **Config page** loads/saves **GuiConfig** (YAML with `project`, `tiers`, `branching`, `advanced`, ...) to `active_config_path()` (e.g. `puppet-master.yaml`).
- **Orchestrator run** uses **PuppetMasterConfig** from `ConfigManager::discover()` (same path). The two YAML shapes differ; many GUI fields (e.g. `advanced.execution.enable_parallel`, `branching.auto_pr`) are not present in the shape the orchestrator expects, so they default.
- **Result:** "Enable parallel execution" and other such settings have no effect on the run.

### 5.2 Chosen approach: Option B -- Build run config from GUI

- **Option B (selected):** When starting a run, build `PuppetMasterConfig` (or the part the orchestrator needs) from the current **in-memory** `gui_config`. **Option B v1:** Run config is built from `gui_config` only for the fields in 5.3; no file merge in initial release. The run sees the latest GUI values without requiring "Save" first (e.g. `enable_parallel_execution` from `gui_config.advanced.execution.enable_parallel`). If building run config from `gui_config` fails (e.g. missing required field), fall back to `ConfigManager::discover_with_hint(hint)`; if that also fails, fail the run with a clear error (do not start with default-only config silently).
- **Implications:** Save on the Config page continues to persist GuiConfig to disk for next app launch. The orchestrator backend receives a config derived from `gui_config` at run start, so "Run" always uses the current UI state. Document this behavior in the UI (e.g. tooltip: "Run uses current settings; Save stores them for next time.").
- **Settings projection (rewrite):** Option B and Phase 1 are required for initial release and must work with **YAML-only** config. Redb/seglog is out of scope for this plan; when storage-plan lands, run config can be read from redb instead of gui_config. In the seglog/redb architecture (storage-plan.md), config/settings may be **projected in redb**; branching/worktree/Git settings would then live in the same redb projection.

*(Other options for reference: Option A = single canonical YAML schema; Option C = two files. Not chosen.)*

### 5.3 Fields to wire (minimum)

- `enable_parallel_execution` ← `gui_config.advanced.execution.enable_parallel`
- `enable_git` (if exposed in GUI) ← corresponding GUI field
- `branching.base_branch`, `branching.auto_pr` (and optionally strategy, granularity, naming_pattern) from GUI branching tab into the config the orchestrator uses.
- `concurrency.global.per_provider` from GUI settings (global per-provider caps).
- `concurrency.overrides.orchestrator.per_provider` from GUI settings (Orchestrator-context per-provider overrides).
- Resolve effective Orchestrator per-provider caps at run start (`override` if set, else `global`) and pass those effective caps into the orchestrator scheduler/run config.

---

## 6. Implementation Checklist

### Dependency order (implement in this order within phases)

- **Phase 1** must complete before Phase 2 and Phase 3 (config and project path are prerequisites).
- **Phase 2:** 2.4 (sanitize) → 2.1, 2.5, 2.9; 2.7 (worktree_exists validity) before create/cleanup that rely on it; 2.8 (recovery uses project path) → 2.2, 2.11; 2.6 (detached HEAD) → 2.10.
- **Phase 3:** 3.1 (git binary) → 3.3, 3.4, 3.10; 3.2 (GitHub API PR integration) independent; 3.5 → 3.6 → 3.7.
- **Cross-phase:** Phase 3.1 before Phase 2.11 (Doctor worktrees check uses shared git resolution).
- **Phase 2 and Phase 3** can proceed in parallel after Phase 1; **Phase 5** integration tests assume both Phase 2 and Phase 3 are done.

### Phase 1: Config wiring (blocker)

- [ ] Implement Option B config wiring (Section 5): when starting a run, build orchestrator config from current `gui_config` (and optional file merge). Ensure "Enable parallel execution", branching/base_branch/auto_pr, and concurrency caps (`concurrency.global.per_provider` + `concurrency.overrides.orchestrator.per_provider` with effective cap resolution at run start) are taken from `gui_config` so the run sees latest UI state without requiring Save first.
- [ ] When starting a run from the Dashboard, pass `current_project.path` as config hint so the backend uses `ConfigManager::discover_with_hint(hint)` and worktree recovery uses the selected project (Section 7.3).
- [ ] Verify with a run: toggle "Enable parallel execution", save, start run → worktrees are created when applicable.

### Phase 2: Worktrees

- [ ] Base branch: ensure worktrees are created from `config.branching.base_branch` (checkout or use as ref).
- [ ] active_worktrees: repopulate on init from `list_worktrees()` and/or fallback to worktree path when resolving working directory.
- [ ] Merge conflict: document or surface conflict worktrees; avoid silent overwrite on re-run.
- [ ] Sanitize tier_id (path) and branch name (ref).
- [ ] Branch already exists: handle existing branch when creating worktree (use existing branch or safe delete).
- [ ] Detached HEAD: handle empty branch in list_worktrees and merge_worktree.
- [ ] worktree_exists: require path + worktree validity (e.g. .git file or list_worktrees).
- [ ] Recovery: use project path when known; run when project is selected if not at startup.
- [ ] PR head branch: use worktree branch from list_worktrees when active_worktrees has no entry.
- [ ] merge_worktree: ensure target_branch exists or create/error clearly.
- [ ] STATE_FILES.md: document worktrees.
- [ ] Doctor: add worktrees check.

### Phase 3: Git

- [ ] Resolve `git` binary the same way in GitManager and Doctor (shared helper; e.g. `path_utils::resolve_git_executable()`; tag with DRY:FN -- Section 7.11).
- [ ] Ensure PR creation uses GitHub HTTPS API per `Plans/GitHub_API_Auth_and_Flows.md` (no GitHub CLI); Doctor verifies GitHub API auth state and required scopes.
- [ ] Git configured check: consider global or local config; use project dir when available.
- [ ] Git repo check (and fix): use project directory when available.
- [ ] Branch strategy: load from config; use in create_tier_branch.
- [ ] Single branch naming implementation (remove duplicate logic).
- [ ] naming_pattern: wire to branch names or hide and document.
- [ ] Iteration commits: use CommitFormatter (ralph: format).
- [ ] git-actions.log path and REQUIREMENTS/.gitignore alignment.
- [ ] Optional: Doctor check for git in project dir; optional "nothing to commit" handling.

### Phase 4: GUI

- [ ] Branching tab: add Enable Git, Auto PR, Branch strategy (add `strategy` / `branch_strategy` to config schema and map GUI to `BranchStrategy` enum; see Section 7.1). Use existing widgets from `docs/gui-widget-catalog.md`; tag any new reusable UI with DRY:WIDGET (Section 7.11). Optionally add auto merge / delete on merge.
- [ ] Branching tab: fix or hide naming_pattern; clarify granularity vs behavior (Section 7.7: decide granularity-driven branch creation vs only exposing BranchStrategy).
- [ ] Worktree: optional list/recover UI and Git info for active project (reuse widgets per 7.11).
- [ ] Tooltip cleanup for orphan tooltips.
- [ ] **GUI coordination with MiscPlan:** When **MiscPlan** (Plans/MiscPlan.md) adds cleanup and evidence UI (§7.5), it will add a "Workspace / Cleanup" subsection under **Config → Advanced** and a "Clean workspace now" button on **Doctor** (or Advanced). Both plans use the **same** Option B run config: ensure the run config built from GuiConfig at run start includes both Worktree/Git fields and (when implemented) MiscPlan cleanup/evidence fields so one Save persists all. Doctor must receive **project path context** (e.g. current project or config path) for "Clean workspace now" and for worktree list; see Worktree §7.2 and MiscPlan §7.5.
- [ ] After GUI changes: run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` (Section 7.11).

### Phase 5: Testing and docs

- [ ] Integration test: run with parallel execution on, verify worktrees created and used (Section 7.8: use temp dir with `git init` and one commit; minimal PRD with two parallel subtasks; assert worktree dirs exist and are cwd).
- [ ] Integration test: run with Git disabled, verify no branch/commit/PR.
- [ ] Update AGENTS.md / STATE_FILES.md / REQUIREMENTS.md as needed.
- [ ] Run widget catalog and check-widget-reuse scripts if new UI was added (Section 7.11); complete AGENTS.md Pre-Completion Verification Checklist before closing out tasks.

### Acceptance criteria (per phase)

| Phase | Acceptance criteria |
|-------|----------------------|
| **Phase 1** | (1) With "Enable parallel execution" on and no Save, start run → worktrees are created when applicable. (2) Run started from Dashboard uses `current_project.path` as config hint (e.g. `discover_with_hint` called with it). (3) Branching/base_branch and auto_pr from GUI are present in the config passed to the orchestrator at run start. |
| **Phase 2** | (1) After restart, `get_tier_worktree(tier_id)` returns the path for tiers that still have worktrees under worktree_base (repopulation or fallback). (2) New worktrees are created from `config.branching.base_branch` (checkout or ref). (3) Doctor "worktrees" check runs when project is a git repo and reports worktree count and/or orphaned suggestion. |
| **Phase 3** | (1) GitManager and Doctor git checks use the same resolved `git` binary (e.g. shared `path_utils::resolve_git_executable()`). (2) Iteration commits use CommitFormatter and produce "ralph:"-style messages. (3) git-actions.log path matches REQUIREMENTS (`.puppet-master/logs/git-actions.log`) and is documented in .gitignore if runtime-only. |
| **Phase 4** | (1) Branching tab has Enable Git, Auto PR, Branch strategy wired to run config (run uses current GUI values). (2) Naming pattern is either wired to branch names or hidden and documented. (3) After GUI changes, `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` run and pass. |
| **Phase 5** | (1) Integration test: parallel run in temp git repo creates worktree dirs and uses them as cwd for subtasks. (2) Integration test: run with Git disabled does not create branches/commits/PRs. (3) AGENTS.md Pre-Completion Verification Checklist completed and Task Status Log updated for any closed tasks. |

### File/source hints (Phase 2 and Phase 3)

**Phase 2 (Worktrees):** `puppet-master-rs/src/git/worktree_manager.rs` (base branch, repopulation, conflict handling, sanitization, branch exists, detached HEAD, worktree_exists validity, recovery, merge_worktree target_branch); `puppet-master-rs/src/core/orchestrator.rs` (create/cleanup worktree calls, PR head branch resolution, project path for recovery); `puppet-master-rs/src/doctor/checks/git_checks.rs` (new worktrees check); `puppet-master-rs/src/config/config_discovery.rs` (project path discovery); `STATE_FILES.md` (worktrees subsection).

**Phase 3 (Git):** `puppet-master-rs/src/platforms/path_utils.rs` (shared `resolve_git_executable()`; tag DRY:FN); `puppet-master-rs/src/git/git_manager.rs` (use resolved git binary, git-actions.log path); `puppet-master-rs/src/git/pr_manager.rs` (GitHub HTTPS API PR creation; see `Plans/GitHub_API_Auth_and_Flows.md`); `puppet-master-rs/src/git/branch_strategy.rs` (single branch naming); `puppet-master-rs/src/git/commit_formatter.rs` (iteration commits); `puppet-master-rs/src/core/orchestrator.rs` (branch strategy from config, create_tier_branch, commit_tier_progress); `puppet-master-rs/src/doctor/checks/git_checks.rs` (shared git binary, configured/repo checks + GitHub API auth check); `REQUIREMENTS.md` / `.gitignore` (git-actions.log path and ignore rule).

### Required vs optional (checklist items)

| Phase | Item | Required / Optional |
|-------|------|---------------------|
| Phase 1 | Option B config wiring, pass config hint on run start, verify parallel → worktrees | Required |
| Phase 2 | All items in checklist except re-validate worktree path (Section 2.12) | Required |
| Phase 2 | Re-validate worktree path before use (Section 2.12) | Optional (Phase 6) |
| Phase 3 | All items except Doctor "git usable in project" and "nothing to commit" | Required |
| Phase 3 | Doctor "git usable in project" check; "nothing to commit" handling | Optional |
| Phase 4 | Branching tab controls, naming/granularity, tooltip cleanup, MiscPlan coordination, widget scripts | Required |
| Phase 4 | Worktree list/recover UI and Git info for active project | Optional |
| Phase 5 | All items | Required |

---

## 7. Gaps, Risks, and Implementation Notes

This section captures underspecified items, risks, and concrete details so the plan is implementation-ready.

### 7.1 Config format and schema mismatch

- **GuiConfig** (Config page) uses `branching.granularity: String` with values `"single"`, `"per_phase"`, `"per_task"`. **PuppetMasterConfig** (orchestrator) uses `branching.granularity: Granularity` enum (`Phase`, `Task`, `Subtask`, `Iteration`, `None`). There is no 1:1 mapping: GUI has no "per_subtask" or "per_iteration", and "single" could map to `None`.
- **PuppetMasterConfig** also has `branching.push_policy`, `branching.merge_policy`; GuiConfig does not expose these.
- **Branch strategy:** PuppetMasterConfig's `BranchingConfig` does not currently have a `strategy` or `branch_strategy` field. `GitConfig` in `types/git.rs` has `branch_strategy: BranchStrategy`, but that struct is not the same as `BranchingConfig`. So adding "branch strategy from config" requires adding a field (e.g. `strategy: BranchStrategy` or `branch_strategy: String`) to the config the orchestrator loads, and a serialization format (e.g. `"main-only"` | `"feature"` | `"release"`).
- **Implementation:** For Option A (single canonical format), define one file format (e.g. PuppetMasterConfig-shaped YAML). The Config page must then either (1) load/save that format and map to/from GuiConfig for the UI, or (2) use a shared struct that has both GUI and backend fields. Document the mapping from GUI granularity strings to `Granularity` enum (e.g. single → None, per_phase → Phase, per_task → Task).

### 7.2 Doctor: project path context

- Doctor checks implement `async fn run(&self) -> CheckResult` with **no parameters**. They have no built-in "project path" or "working directory."
- **GitRepoCheck** and **GitConfiguredCheck** "use project path when available" can be implemented by **resolving project root inside `run()`**: e.g. call `config_discovery::discover_config_path(None)` (or with a hint if the app can pass it), then take the parent directory as project root; run `git rev-parse --git-dir` or `git config user.name` with `current_dir(project_root)`. If no config is found, fall back to current behavior (CWD or HOME). This matches the pattern used in the orchestrator-subagent plan for the Gemini plan-mode Doctor check.
- **App → Doctor:** When the app runs Doctor (e.g. from the Doctor view), it could pass a "config hint" (e.g. `current_project.path`) so `discover_config_path(Some(hint))` finds the project's config. That would require extending the Doctor run API to accept an optional hint (e.g. `run_all(hint: Option<&Path>)`) and threading it into checks that need it. Alternatively, keep discovery inside each check with `discover_config_path(None)` so the "project" is whatever directory would be used when no project is selected (cwd, default workspace, etc.).

### 7.3 Backend run does not use current project

- **Current behavior:** `spawn_orchestrator_backend` calls `ConfigManager::discover()` with **no hint**. The wizard and start-chain use `ConfigManager::discover_with_hint(config_hint)` with `current_project.path`. So the **orchestrator run** (Dashboard "Run") never receives the current project path; it uses whatever `discover_config_path(None)` finds.
- **Implication:** For "recovery when project is known" and "Doctor use project path," if the user selects a project in the UI but the run is started from the same app, the run still uses discover-with-no-hint. To make "current project" meaningful for the run, the run command must pass a hint (e.g. extend start message with `config_hint: Option<PathBuf>`). **Call site to change:** In `spawn_orchestrator_backend` (or equivalent in app.rs), replace `ConfigManager::discover()` with `ConfigManager::discover_with_hint(config_hint)`; pass `current_project.path` from Dashboard when starting a run. The plan should explicitly call out: "When starting a run from the Dashboard, pass `current_project.path` as config hint so the run and recovery use the selected project."

### 7.4 Merge conflicts: persisting "conflict worktrees"

- To "avoid reusing that tier_id for a new worktree until the user resolves," the app must remember which tier_ids have unresolved merge conflicts. Options: (1) a small state file under `.puppet-master/` (e.g. `worktree-conflicts.json` listing tier_ids), updated when a merge fails and cleared when the user runs "Recover worktrees" or resolves manually; (2) in-memory only (lost on restart, so re-run would still overwrite after restart). The plan should specify which approach or mark as "optional: in-memory set for the session only" to avoid scope creep.

### 7.5 Binary resolution: exact functions

- **Git:** Doctor uses `find_tool_executable("git")` in `git_checks.rs` (PATH + fallback dirs from `path_utils::get_fallback_directories()` and `path_utils::find_in_shell_path`). GitManager uses `Command::new("git")`. **Implementation:** Create a small helper (e.g. `path_utils::resolve_git_executable() -> Option<PathBuf>`) that uses the same logic as `find_tool_executable("git")`, and have both GitManager and GitInstalledCheck use it. GitManager can take `Option<PathBuf>` and use it in `run_git_cmd` when set.
- **GitHub PR creation:** Doctor must validate GitHub API auth (device-code token present + scopes) and PR creation must use GitHub HTTPS API (no GitHub CLI). See `Plans/GitHub_API_Auth_and_Flows.md`.

### 7.6 active_worktrees repopulation

- `list_worktrees()` already returns only worktrees under `worktree_base` and only includes entries for which `extract_tier_id(&path)` is `Some` (i.e. path under our base). So repopulating `active_worktrees` from `list_worktrees()` is a matter of iterating the result and doing `active_worktrees.insert(worktree.tier_id, worktree.path)`. No extra filtering needed beyond what's already there.

### 7.7 Granularity vs BranchStrategy

- **Orchestrator today:** Creates a branch in `create_tier_branch` per tier (phase/task/subtask/iteration) based only on **BranchStrategy** (MainOnly / Feature / Release). It does **not** read `config.branching.granularity`.
- **Granularity** in config (Phase / Task / Subtask / Iteration / None) could mean "at which tier level do we create a new branch" (e.g. None = one branch for all; Phase = one branch per phase; Task = one per task). That behavior is not implemented. So either: (1) implement granularity so that branch creation is gated by tier level (e.g. only create branch when tier_type matches granularity), or (2) leave granularity as "future" and only wire BranchStrategy in the GUI (Main only / Feature / Release). The plan should state: "For Phase 4 GUI, decide whether to implement granularity-driven branch creation or only expose BranchStrategy; if only strategy, align granularity UI label with 'informational' or hide until implemented."

### 7.8 Integration test setup

- Integration tests that "run with parallel execution on" and "verify worktrees created" require a real git repo (e.g. temp dir with `git init`, initial commit). The plan should add: "Use a temporary directory with `git init` and at least one commit; set `enable_parallel_execution: true` and run a minimal PRD with two parallel subtasks; assert worktree dirs exist and are used as cwd." Optionally guard with `#[cfg(feature = "integration-git")]` or skip if `git` is not in PATH.

### 7.9 Worktree Doctor check: scope

- The "worktrees" Doctor check should run only when the project path is a git repo. Steps: (1) Resolve project root (e.g. via config discovery or hint). (2) Run `git worktree list --porcelain` from that root. (3) If that fails, report "not a git repo" or "git worktree not supported." (4) Otherwise, optionally call `detect_orphaned_worktrees()` (requires a `WorktreeManager` instance) and report count of orphaned dirs and suggest "Recover orphaned worktrees" if non-zero. Creating `WorktreeManager` in a Doctor check requires a repo path; use the same project root.

### 7.10 Risks

- **Config migration:** If we move to a single canonical format (Option A), existing users may have only GuiConfig-shaped YAML. Loading it as PuppetMasterConfig can fail (missing `paths`, etc.). Plan: on load, try PuppetMasterConfig first; if it fails, try GuiConfig and convert to PuppetMasterConfig (with defaults for missing fields), then save in canonical format on next save.
- **Save timing:** Option B is chosen: on Run, build the config used for the run from in-memory `gui_config`, so Save is not required for the next run. Document this in the UI (e.g. tooltip or short note: "Run uses current settings; Save stores them for next time.").

### 7.14 Resolved decisions (implementation-ready)

All gaps from audit are closed with the following decisions. Implementers should follow these so the plan has no ambiguity.

**Worktree (Section 2):** (1) **Base branch:** Use checkout base_branch then add for initial release; create from ref (e.g. `git worktree add -b <branch> <path> <base_branch>`) is optional later. (2) **active_worktrees repopulation:** On first resolve with no entry, if path exists and is in `list_worktrees()`, use it and re-register in `active_worktrees` for that session. (3) **Conflict persistence:** In-memory only for initial release -- `HashSet<tier_id>` of conflict worktrees; optional Phase 6: `.puppet-master/worktree-conflicts.json`. (4) **Detached HEAD merge:** In `merge_worktree`, if source_branch is empty: read HEAD commit from that worktree (`git rev-parse HEAD` in worktree path), then in main repo `git merge --no-ff <commit>`; document in STATE_FILES.md. (5) **Recovery:** If no project path at startup, skip worktree recovery; run recovery when user first selects/opens a project or when a run starts with config hint. (6) **Repopulation failure:** If `list_worktrees()` fails during repopulation, log error and start with empty `active_worktrees`. (7) **Doctor worktrees:** Must run `list_worktrees` and report state; optionally call `detect_orphaned_worktrees()` and include count; Recover remains a separate UI action. (8) **Platform:** Sanitization and path handling must be safe on Windows (use `PathBuf`/`join`; no assumption that `/` is the only separator). (9) **Section 2.12:** Re-validate worktree path before use is Phase 6 / optional.

**Git (Section 3):** (1) **Git binary:** Add `path_utils::resolve_git_executable() -> Option<PathBuf>` (same logic as `find_tool_executable("git")`); GitManager and GitInstalledCheck both use it; tag `// DRY:FN:resolve_git_executable`. If resolver returns None, GitManager fails the operation; Doctor fails the check. (2) **GitHub PRs:** PR creation uses GitHub HTTPS API only (no GitHub CLI) per `Plans/GitHub_API_Auth_and_Flows.md`. (3) **naming_pattern:** Hide in GUI and document Reserved for future use in initial release; do not wire to branch naming. (4) **git-actions.log:** Move to `.puppet-master/logs/git-actions.log`; add to .gitignore as runtime-only per STATE_FILES.

**Config (Section 5):** (1) **Backend call site:** In `spawn_orchestrator_backend` (or equivalent in app.rs), replace `ConfigManager::discover()` with `ConfigManager::discover_with_hint(config_hint)`; pass `current_project.path` from Dashboard/start-run flow (e.g. extend start message with optional hint). (2) **Minimum wired fields:** enable_parallel_execution, enable_git, base_branch, auto_pr; strategy required for Phase 4 GUI; granularity/naming_pattern optional/hidden per 7.7 and 3.7.

**Doctor API:** Extend Doctor so the app can pass an optional project hint (e.g. `run_all(hint: Option<&Path>)`); GitRepoCheck, GitConfiguredCheck, and worktrees check use hint when present.

## DRY Method Compliance

**CRITICAL:** All code in this plan MUST follow DRY principles.

### DRY Requirements

1. **Platform Data -- ALWAYS use platform_specs:**
   - ❌ **NEVER** hardcode platform CLI commands, binary names, models, auth, or capabilities
   - ✅ **ALWAYS** use `platform_specs::` functions

2. **Subagent Names -- ALWAYS use subagent_registry:**
   - ❌ **NEVER** hardcode subagent names
   - ✅ **ALWAYS** use `subagent_registry::` functions
   - ✅ **ALWAYS** reference `DRY:DATA:subagent_registry` from orchestrator plan as the single source of truth

3. **Git Binary Resolution -- Single Source of Truth:**
   - ✅ **ALWAYS** use shared git binary resolution functions (DRY:FN:resolve_git_binary)
   - ❌ **NEVER** duplicate git binary detection logic

4. **Tag All Reusable Items:**
   - ✅ Tag reusable functions: `// DRY:FN:<name> -- Description`
   - ✅ Tag reusable data structures: `// DRY:DATA:<name> -- Description`
   - ✅ Tag reusable widgets: `// DRY:WIDGET:<name> -- Description`
   - ✅ Tag reusable helpers: `// DRY:HELPER:<name> -- Description`

5. **Widget Reuse:**
   - ✅ **ALWAYS** check `docs/gui-widget-catalog.md` before creating new UI
   - ✅ **ALWAYS** use existing widgets from `src/widgets/`
   - ✅ If bespoke UI is required, add `// UI-DRY-EXCEPTION: <reason>`

### 7.11 DRY and AGENTS.md conventions

This plan must be implemented in line with **AGENTS.md** (reuse-first DRY method):

- **Widgets and UI:** Before adding any new Git/worktree UI (Branching tab controls, worktree list/recover, toggles), check `docs/gui-widget-catalog.md` and `src/widgets/`. Use existing widgets (e.g. `styled_button`, `page_header`, `selectable_label`, toggles, dropdowns) and tag any new reusable widget with `// DRY:WIDGET:<name>`. After GUI changes, run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh`.
- **Platform/tool resolution:** Do not hardcode paths. Use shared helpers: `path_utils::find_tool_executable`, `path_utils::resolve_app_local_executable` (or a new `resolve_git_executable()` that both GitManager and Doctor use). Tag new shared helpers with `// DRY:FN:<name>`.
- **Single source of truth:** Git/branch behavior should use existing modules: `platform_specs` only for platform-related data (this plan is mostly git/worktree); branch naming from one place (e.g. `BranchStrategyManager` or shared function); config shape from the chosen Option B build-from-GUI flow.
- **Pre-completion:** Before marking any task done, run the AGENTS.md "Pre-Completion Verification Checklist" (cargo check/test, DRY checks, no hardcoded platform data, scope, gitignore rules).

---

## 7.12 Crews and Subagent Communication Enhancements for Git/Worktree Operations

**Status: Optional / Phase 6 (or later).** Not required for initial Worktree/Git release. Depends on Plans/orchestrator-subagent-integration.md Crews (CrewManager, AgentMessage, message board, etc.) being implemented and exposed to the git layer. When implementing, align code samples with actual APIs: e.g. `PrManager::create_pr(title, body, base, head)` and `Result<PrResult>`; `WorktreeManager::create_worktree(tier_id, branch)` takes two args; call `get_worktree_path` only after `create_worktree`.

The orchestrator plan (`Plans/orchestrator-subagent-integration.md`) defines **Crews** (multi-agent communication system) and enhanced subagent communication. These features can enhance **git and worktree operations** to enable better coordination between git operations and subagents.

### 1. Git Operation Crews

**Concept:** When orchestrator performs git operations (branch creation, commits, PR creation), crews can coordinate multiple subagents working on related git operations.

**Benefits:**
- **Coordinated commits:** Multiple subagents can coordinate commit messages and branch naming
- **PR coordination:** Subagents can discuss PR content and review requirements
- **Conflict prevention:** Crews can coordinate to avoid git conflicts

**BeforeGitOp crew creation responsibilities:**

- **Identify parallel git operations:** When orchestrator creates parallel subtasks that will perform git operations, identify if they need coordination
- **Create git operation crew:** Create crew with subagents from parallel subtasks, crew_id = `git-op-{tier_id}`
- **Initialize git coordination:** Set up message board for git operation crew with tier_id context
- **Register worktree paths:** Crew members register their worktree paths in coordination state

**DuringGitOp crew coordination responsibilities:**

- **Coordinate branch names:** Crew members coordinate branch names to avoid conflicts (e.g., `subtask/ST-001-001-001`, `subtask/ST-001-001-002`)
- **Coordinate commit messages:** Crew members coordinate commit message formats to ensure consistency (e.g., `ralph: [ITERATION] ...`)
- **Coordinate PR content:** Crew members coordinate PR titles, descriptions, and review requirements
- **Avoid git conflicts:** Crew members check coordination state before editing files to avoid conflicts

**AfterGitOp crew completion responsibilities:**

- **Validate git operations:** Crew members confirm that git operations completed successfully
- **Archive git coordination messages:** Archive git coordination messages to `.puppet-master/memory/git-op-{tier_id}-messages.json`
- **Disband git crew:** Mark crew as complete and remove from active crews

**Implementation:** Extend `src/git/git_manager.rs`, `src/git/worktree_manager.rs`, and `src/git/pr_manager.rs` to create git operation crews, coordinate git operations, and disband crews after operations complete.

**Integration with git managers:**

In `src/git/git_manager.rs`, extend branch creation:

```rust
impl GitManager {
    pub async fn create_tier_branch_with_crew_coordination(
        &self,
        tier_id: &str,
        branch_name: &str,
        crew_id: Option<&str>,
    ) -> Result<String> {
        if let Some(crew_id) = crew_id {
            // Coordinate branch name with crew
            let coordination_message = AgentMessage {
                message_id: generate_message_id(),
                from_agent_id: format!("git-manager-{}", tier_id),
                from_platform: /* ... */,
                to_agent_id: None,
                message_type: MessageType::Request,
                subject: "Branch name coordination".to_string(),
                content: format!("Proposed branch name: {}. Please confirm or suggest alternative.", branch_name),
                context: MessageContext {
                    crew_id: Some(crew_id.to_string()),
                    tier_id: Some(tier_id.to_string()),
                },
                thread_id: None,
                in_reply_to: None,
                created_at: Utc::now(),
                read_by: Vec::new(),
                resolved: false,
            };
            
            self.crew_manager.post_to_crew(crew_id, coordination_message).await?;
            
            // Wait for crew responses (or timeout after 5 seconds)
            let responses = self.crew_manager.wait_for_responses(
                crew_id,
                MessageType::Answer,
                chrono::Duration::seconds(5),
            ).await?;
            
            // Use coordinated branch name (or original if no response)
            let final_branch_name = if let Some(response) = responses.first() {
                // Parse response to extract alternative branch name if suggested
                self.parse_branch_name_from_response(response)?
                    .unwrap_or_else(|| branch_name.to_string())
            } else {
                branch_name.to_string()
            };
            
            // Create branch with coordinated name
            self.create_branch(&final_branch_name).await?;
            
            Ok(final_branch_name)
        } else {
            // No crew coordination, create branch directly
            self.create_branch(branch_name).await?;
            Ok(branch_name.to_string())
        }
    }
}
```

In `src/git/pr_manager.rs`, extend PR creation:

```rust
impl PrManager {
    pub async fn create_pr_with_crew_coordination(
        &self,
        branch_name: &str,
        title: &str,
        description: &str,
        crew_id: Option<&str>,
    ) -> Result<String> {
        if let Some(crew_id) = crew_id {
            // Coordinate PR content with crew
            let pr_proposal_message = AgentMessage {
                message_id: generate_message_id(),
                from_agent_id: "pr-manager".to_string(),
                from_platform: /* ... */,
                to_agent_id: None,
                message_type: MessageType::Request,
                subject: "PR content coordination".to_string(),
                content: format!("Proposed PR:\nTitle: {}\nDescription: {}\n\nPlease review and suggest improvements.", title, description),
                context: MessageContext {
                    crew_id: Some(crew_id.to_string()),
                },
                thread_id: None,
                in_reply_to: None,
                created_at: Utc::now(),
                read_by: Vec::new(),
                resolved: false,
            };
            
            self.crew_manager.post_to_crew(crew_id, pr_proposal_message).await?;
            
            // Wait for crew responses (or timeout after 10 seconds)
            let responses = self.crew_manager.wait_for_responses(
                crew_id,
                MessageType::Answer,
                chrono::Duration::seconds(10),
            ).await?;
            
            // Apply crew feedback to PR content
            let (final_title, final_description) = self.apply_pr_feedback(title, description, &responses)?;
            
            // Create PR with coordinated content
            let pr_url = self.create_pr(branch_name, &final_title, &final_description).await?;
            
            Ok(pr_url)
        } else {
            // No crew coordination, create PR directly
            self.create_pr(branch_name, title, description).await?;
            Ok(/* pr_url */)
        }
    }
}
```

**Error handling:**

- **Git crew creation failure:** If crew creation fails, log warning and proceed without crew coordination
- **Branch name coordination failure:** If branch name coordination fails, log warning and use original branch name
- **PR coordination failure:** If PR coordination fails, log warning and proceed with original PR content

### 2. Worktree Coordination via Crews

**Concept:** When orchestrator creates worktrees for parallel subtasks, crews can coordinate to ensure worktrees are used correctly and conflicts are avoided.

**Benefits:**
- **Worktree awareness:** Crew members know which worktrees are in use
- **Conflict prevention:** Crew members can coordinate to avoid editing files in the same worktree
- **Merge coordination:** Crew members can coordinate merge order and conflict resolution

**BeforeWorktreeCreation crew coordination responsibilities:**

- **Identify parallel worktrees:** When orchestrator creates parallel subtasks that will use worktrees, identify if they need coordination
- **Create worktree coordination crew:** Create crew with subagents from parallel subtasks, crew_id = `worktree-coord-{tier_id}`
- **Register worktree paths:** Crew members register their worktree paths in coordination state before creation

**DuringWorktreeUsage crew coordination responsibilities:**

- **Check worktree availability:** Crew members check coordination state before editing files to ensure worktree is available
- **Coordinate file edits:** Crew members coordinate which files they will edit to avoid conflicts
- **Coordinate merge order:** Crew members coordinate merge order to avoid merge conflicts

**AfterWorktreeMerge crew coordination responsibilities:**

- **Validate merge results:** Crew members confirm that merges completed successfully
- **Archive worktree coordination messages:** Archive worktree coordination messages to `.puppet-master/memory/worktree-coord-{tier_id}-messages.json`
- **Disband worktree crew:** Mark crew as complete and remove from active crews

**Implementation:** Extend `src/git/worktree_manager.rs` to create worktree coordination crews, coordinate worktree usage, and disband crews after merges complete.

**Integration with worktree manager:**

In `src/git/worktree_manager.rs`, extend worktree creation:

```rust
impl WorktreeManager {
    pub async fn create_subtask_worktree_with_crew_coordination(
        &self,
        tier_id: &str,
        crew_id: Option<&str>,
    ) -> Result<PathBuf> {
        if let Some(crew_id) = crew_id {
            // Register worktree path in coordination state
            let worktree_path = self.get_worktree_path(tier_id);
            
            let registration_message = AgentMessage {
                message_id: generate_message_id(),
                from_agent_id: format!("worktree-manager-{}", tier_id),
                from_platform: /* ... */,
                to_agent_id: None,
                message_type: MessageType::Announcement,
                subject: "Worktree registration".to_string(),
                content: format!("Registering worktree path: {}", worktree_path.display()),
                context: MessageContext {
                    crew_id: Some(crew_id.to_string()),
                    tier_id: Some(tier_id.to_string()),
                },
                thread_id: None,
                in_reply_to: None,
                created_at: Utc::now(),
                read_by: Vec::new(),
                resolved: false,
            };
            
            self.crew_manager.post_to_crew(crew_id, registration_message).await?;
            
            // Create worktree
            self.create_worktree(tier_id).await?;
            
            Ok(worktree_path)
        } else {
            // No crew coordination, create worktree directly
            self.create_worktree(tier_id).await?;
            Ok(self.get_worktree_path(tier_id))
        }
    }
    
    pub async fn merge_worktree_with_crew_coordination(
        &self,
        tier_id: &str,
        target_branch: &str,
        crew_id: Option<&str>,
    ) -> Result<()> {
        if let Some(crew_id) = crew_id {
            // Coordinate merge order with crew
            let merge_coordination_message = AgentMessage {
                message_id: generate_message_id(),
                from_agent_id: format!("worktree-manager-{}", tier_id),
                from_platform: /* ... */,
                to_agent_id: None,
                message_type: MessageType::Request,
                subject: "Merge order coordination".to_string(),
                content: format!("Requesting merge order for worktree {} to branch {}", tier_id, target_branch),
                context: MessageContext {
                    crew_id: Some(crew_id.to_string()),
                    tier_id: Some(tier_id.to_string()),
                },
                thread_id: None,
                in_reply_to: None,
                created_at: Utc::now(),
                read_by: Vec::new(),
                resolved: false,
            };
            
            self.crew_manager.post_to_crew(crew_id, merge_coordination_message).await?;
            
            // Wait for merge order (or timeout after 5 seconds)
            let responses = self.crew_manager.wait_for_responses(
                crew_id,
                MessageType::Decision,
                chrono::Duration::seconds(5),
            ).await?;
            
            // Determine merge order from crew responses
            let merge_order = self.determine_merge_order_from_responses(&responses)?;
            
            // Wait for turn if not first in merge order
            if merge_order > 0 {
                self.wait_for_merge_turn(crew_id, merge_order).await?;
            }
            
            // Perform merge
            self.merge_worktree(tier_id, target_branch).await?;
            
            // Notify crew that merge completed
            let completion_message = AgentMessage {
                message_id: generate_message_id(),
                from_agent_id: format!("worktree-manager-{}", tier_id),
                from_platform: /* ... */,
                to_agent_id: None,
                message_type: MessageType::Announcement,
                subject: "Merge completed".to_string(),
                content: format!("Worktree {} merged to branch {}", tier_id, target_branch),
                context: MessageContext {
                    crew_id: Some(crew_id.to_string()),
                    tier_id: Some(tier_id.to_string()),
                },
                thread_id: None,
                in_reply_to: None,
                created_at: Utc::now(),
                read_by: Vec::new(),
                resolved: false,
            };
            
            self.crew_manager.post_to_crew(crew_id, completion_message).await?;
        } else {
            // No crew coordination, merge directly
            self.merge_worktree(tier_id, target_branch).await?;
        }
        
        Ok(())
    }
}
```

**Error handling:**

- **Worktree crew creation failure:** If crew creation fails, log warning and proceed without crew coordination
- **Worktree registration failure:** If worktree registration fails, log warning and proceed (coordination may be incomplete)
- **Merge coordination failure:** If merge coordination fails, log warning and proceed with direct merge (may cause conflicts)

## 7.13 Lifecycle and Quality Enhancements for Git/Worktree Operations

**Status: Optional / Phase 6 (or later).** Not required for initial release. Depends on orchestrator lifecycle hooks and remediation patterns (and, if used, core memory module) being defined and implemented; then the git layer can adopt the same patterns. Align `GitOperationResult` with existing `GitResult`/`MergeResult`/`PrResult` types; do not assume `src/core/memory.rs` or `src/core/remediation.rs` exist until the orchestrator plan implements them.

The orchestrator plan (`Plans/orchestrator-subagent-integration.md`) defines lifecycle hooks, structured handoff validation, remediation loops, and cross-session memory. These features can enhance **git and worktree operations** to improve reliability, quality, and continuity.

### 1. Hook-Based Lifecycle for Git/Worktree Operations

**Concept:** Apply hook-based lifecycle middleware to git and worktree operations. Run **BeforeGitOp** and **AfterGitOp** hooks before and after git operations (commit, branch creation, worktree creation/merge, PR creation).

**BeforeGitOp hook responsibilities:**

- **Track active operation:** Record which git operation is being performed (e.g., `create_branch`, `create_worktree`, `commit`, `create_pr`).
- **Inject operation context:** Add tier context, branch strategy, worktree state, and known git issues to operation context.
- **Load cross-session memory:** Load prior git/branching patterns from `.puppet-master/memory/` and inject into operation context.
- **Validate git state:** Check git repo state, branch existence, worktree validity before operation.

**AfterGitOp hook responsibilities:**

- **Validate operation result:** Check that git operation succeeded (e.g., branch created, commit succeeded, worktree merged).
- **Track completion:** Update git operation tracking, mark operation completion state.
- **Save memory:** Persist git/branching patterns (e.g., branch naming patterns, worktree usage patterns) to `.puppet-master/memory/patterns.json`.
- **Safe error handling:** Guarantee structured output even on git operation failure.

**Implementation:** Create `src/git/hooks.rs` with `BeforeGitOpHook` and `AfterGitOpHook` traits. Register hooks per git operation type. Call hooks automatically at git operation boundaries (before `run_git_cmd`, after operation completes). Use the same hook registry pattern as orchestrator hooks.

**Integration with git managers:**

In `src/git/git_manager.rs`, `src/git/worktree_manager.rs`, `src/git/pr_manager.rs`, wrap git operations:

```rust
// Before git operation
let before_ctx = BeforeGitOpContext {
    operation: GitOperation::CreateBranch,
    tier_id: tier_id.clone(),
    branch_name: branch_name.clone(),
    branch_strategy: config.branching.strategy,
    worktree_state: get_worktree_state(tier_id)?,
    known_issues: get_known_git_issues()?,
};

let before_result = self.hook_registry.execute_before_git_op(&before_ctx)?;

if before_result.block {
    return Err(anyhow!("Git operation blocked by hook: {}", before_result.block_reason.unwrap_or_default()));
}

// Perform git operation
let result = self.run_git_cmd(&["checkout", "-b", &branch_name]).await?;

// After git operation
let after_ctx = AfterGitOpContext {
    operation: GitOperation::CreateBranch,
    tier_id: tier_id.clone(),
    operation_result: result.clone(),
    completion_status: if result.success { CompletionStatus::Success } else { CompletionStatus::Failure(result.stderr) },
};

let after_result = self.hook_registry.execute_after_git_op(&after_ctx)?;

// Save memory if operation succeeded
if result.success {
    self.memory_manager.save_pattern(EstablishedPattern {
        name: "branch_naming".to_string(),
        description: format!("Branch created: {}", branch_name),
        examples: vec![branch_name.clone()],
        timestamp: Utc::now(),
    }).await?;
}
```

### 2. Structured Handoff Validation for Git Operation Results

**Concept:** Enforce structured output format for git operation results. Use structured format for git command outputs and worktree operations.

**Git operation result format:**

```rust
pub struct GitOperationResult {
    pub operation: GitOperation,
    pub success: bool,
    pub stdout: String,
    pub stderr: String,
    pub branch_created: Option<String>,
    pub commit_hash: Option<String>,
    pub worktree_path: Option<PathBuf>,
    pub pr_url: Option<String>,
    pub warnings: Vec<String>,
}
```

**Validation:** After git operations, validate result format matches `GitOperationResult`. On validation failure (e.g., unexpected git output format), log warning and proceed with partial result.

**Integration:** Extend `GitManager::run_git_cmd()` to return structured `GitOperationResult` instead of raw stdout/stderr. Parse git output into structured format (e.g., extract branch name from `git checkout -b` output, extract commit hash from `git commit` output).

### 3. Cross-Session Memory for Git/Branching Patterns

**Concept:** Persist git and branching patterns (branch naming conventions, worktree usage patterns, commit message formats) to `.puppet-master/memory/` so future runs can load prior patterns.

**What to persist:**

- **Branch naming patterns:** Examples of branch names created (e.g., `subtask/ST-001-001-001`, `feature/auth-system`).
- **Worktree usage patterns:** Which tiers use worktrees, worktree cleanup patterns.
- **Commit message patterns:** Examples of commit messages (e.g., `ralph: [ITERATION] ...`).

**When to persist:**

- **At branch creation:** Save branch naming pattern example.
- **At worktree creation:** Save worktree usage pattern.
- **At commit:** Save commit message pattern example.

**When to load:**

- **At run start:** Load prior git/branching patterns and inject into git operation context.
- **At branch creation:** Load prior branch naming patterns to ensure consistency.

**Integration:** Use the same `MemoryManager` from orchestrator plan. In git managers, call `memory_manager.save_pattern()` at git operations (branch creation, commit, worktree creation).

### 4. Active Agent Tracking for Git Operations

**Concept:** Track which git operation is currently active. Store in git manager state and expose for logging and debugging.

**Tracking:**

- **Per operation:** `active_git_operation: Option<GitOperation>` in `GitManager` state.
- **Persistence:** Write to `.puppet-master/state/active-git-operations.json` (updated on each git operation).

**Use cases:**

- **Logging:** "Git operation: create_branch, tier = 1.1.1, branch = subtask/ST-001-001-001"
- **Debugging:** "Why did this git operation fail? Check active git operation logs."
- **Audit trails:** "Which git operations ran in this run? See active-git-operations.json."

### 5. Remediation Loop for Git Operation Failures

**Concept:** When git operations fail with recoverable errors (e.g., branch already exists, merge conflicts), enter a remediation loop. Retry with fixes until operation succeeds or escalate.

**Severity levels:**

- **Critical:** Git repo corruption, permission errors -- **escalate to user**.
- **Major:** Branch already exists, merge conflicts -- **remediate automatically** (delete branch if safe, resolve conflicts).
- **Minor:** Non-fatal warnings (e.g., "nothing to commit") -- **log and proceed**.
- **Info:** Informational messages -- **log and proceed**.

**Remediation loop:**

1. Git operation fails (e.g., `git worktree add -b <branch> <path>` fails with "branch already exists").
2. Parse error from git output.
3. Categorize error (Critical/Major/Minor/Info).
4. If Major (recoverable):
   - Apply remediation (e.g., delete existing branch if safe, use existing branch for worktree).
   - Retry git operation.
   - Repeat until succeeds or max retries (e.g., 2).
   - If max retries reached, escalate to user or skip operation.
5. If Critical: escalate to user immediately.
6. If Minor/Info: log and proceed.

**Integration:** Extend git managers to use remediation loop pattern from orchestrator plan. Wrap git operations in remediation-aware handlers that detect recoverable errors and apply fixes.

### Implementation Notes

- **Where:** New module `src/git/hooks.rs` for git-specific hooks; reuse `src/core/memory.rs` for persistence; reuse `src/core/remediation.rs` for remediation loops.
- **What:** Implement `BeforeGitOpHook` and `AfterGitOpHook` traits; validate git operation results with structured format; persist git/branching patterns to memory; track active git operations; implement remediation loops for recoverable git errors.
- **When:** Hooks run automatically at git operation boundaries; memory persists at git operations; remediation loop runs when git operations fail with recoverable errors.

**Cross-reference:** See orchestrator plan "Lifecycle and Quality Features" for full implementation details. See orchestrator plan "Puppet Master Crews" for how git operation crews can coordinate branch creation, commits, and PRs.

## 8. References

- **AGENTS.md:** Git commit format ("ralph:"), gitignore rules, DRY, platform_specs, pre-completion checklist.
- **STATE_FILES.md:** State file hierarchy; add worktrees subsection.
- **REQUIREMENTS.md:** git-actions.log path, Git operations.
- **Plans/orchestrator-subagent-integration.md:** Worktree isolation for parallel subagents; ensure worktrees and config wiring are in place before or with subagent work.
- **Code:** `puppet-master-rs/src/git/` (worktree_manager, git_manager, pr_manager, branch_strategy, commit_formatter); `core/orchestrator.rs` (create_tier_branch, commit_tier_progress, create_tier_pr, worktree create/cleanup); `views/config.rs` (tab_branching); `doctor/checks/git_checks.rs`; `config/config_discovery.rs` (discover_config_path); `platforms/path_utils.rs` (resolve_app_local_executable, get_fallback_directories).
