# Worktree & Git Improvement — Implementation Plan

## Plan Document Status

**This is a PLAN DOCUMENT ONLY** — No code changes have been made. This document consolidates:

- Worktree implementation gaps and fixes
- Git integration gaps and fixes
- GUI wiring and UX for Git/worktrees
- Dependencies on config wiring (enable_parallel, etc.)

Resolve each section during implementation so worktrees and Git work correctly end-to-end.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Worktree Improvements](#2-worktree-improvements)
3. [Git Improvements](#3-git-improvements)
4. [GUI for Git & Worktrees](#4-gui-for-git--worktrees)
5. [Config Wiring (Prerequisite)](#5-config-wiring-prerequisite)
6. [Implementation Checklist](#6-implementation-checklist)
7. [Gaps, Risks, and Implementation Notes](#7-gaps-risks-and-implementation-notes) (includes [7.11 DRY and AGENTS.md](#711-dry-and-agentsmd-conventions))
8. [References](#8-references)

---

## 1. Executive Summary

### Goals

- **Worktrees:** Reliable creation/merge/cleanup; correct base branch; recovery and visibility; no unwired or duplicate logic.
- **Git:** Single source of truth for branch naming; config-driven strategy; consistent binary resolution; commit format and logging aligned with docs.
- **GUI:** All Git/worktree-relevant settings visible, wired to the config the orchestrator uses, and consistent with tooltips and docs.

### Critical Blocker

The orchestrator reads **PuppetMasterConfig** from `ConfigManager::discover()` (YAML). The Config page edits **GuiConfig** and saves it to the same path (e.g. `puppet-master.yaml`). The two shapes differ; **enable_parallel** and other advanced/orchestrator fields in the GUI are never seen by the run. **Until config wiring is fixed**, worktrees and Git behavior cannot be fully controlled from the UI.

### Readiness for implementation

The plan is **ready to implement** with the following in mind:

- **Section 7** (Gaps, Risks, and Implementation Notes) adds the missing detail: config schema mismatch (including granularity enum vs string), how Doctor gets project path, backend run not using current project, conflict-worktree persistence, exact binary-resolution functions, repopulation behavior, granularity vs BranchStrategy, integration test setup, worktree Doctor check scope, and risks (config migration, save timing).
- **Phase 1 (config wiring)** must be implemented first (Option B: build run config from GUI at run start); the rest of the checklist can proceed in order. Section 7.1 and 7.10 describe mapping and save timing for Option B.
- **Optional items** (e.g. worktree list/recover UI, “nothing to commit” handling, re-validate worktree path) can be skipped for an initial release and done later.

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

### 3.2 gh binary resolution

- **Gap:** `PrManager` uses `Command::new("gh")` (PATH only). Doctor's `GitHubCliCheck` uses `resolve_app_local_executable("gh")`. If gh is only in app-local bin, PR creation can fail after Doctor passes.
- **Fix:** Use the same resolution for `gh` in `PrManager` as in the Doctor check (e.g. `resolve_app_local_executable("gh")` or a shared helper). Store the resolved path in `PrManager` or resolve at each use.

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

**Login / Setup:**

- Git config section (user, email, remote, current branch); GitHub auth; GitHub CLI in Setup.

**No dedicated UI for:**

- List worktrees, recover orphaned worktrees, worktree status, or which tier is using which worktree.

### 4.2 GUI improvements

#### 4.2.1 Wire existing settings to run config (see Section 5)

- Ensure "Enable parallel execution" and any other execution/orchestrator flags edited in the GUI are persisted into the config that `ConfigManager` loads (or that the run receives a config built from GuiConfig). This is a prerequisite for worktrees and Git behavior to be controllable from the UI.

#### 4.2.2 Branching tab: add missing controls

- **Enable Git:** Toggle bound to `orchestrator.enable_git` (or equivalent in the canonical config). Tooltip: e.g. "Enable git branch creation, commits, and PR creation during runs."
- **Auto PR:** Toggle bound to `branching.auto_pr`. Tooltip: "Create a pull request automatically when a tier completes; if off, worktree is merged to base branch without PR."
- **Branch strategy:** Dropdown or radio: Main only / Feature (or Tier) / Release. Bound to config `branching.strategy` (or equivalent). Use existing tooltip `branching.strategy`.
- **Use worktrees (parallel):** Can stay in Advanced as "Enable parallel execution" but must be wired (see 5). Optionally add a short note in the Branching tab: "Parallel subtasks use separate git worktrees."
- **Auto merge on success / Delete on merge:** Add toggles if the product wants them; wire to config and implement behavior in orchestrator/worktree cleanup. Use existing tooltips.

#### 4.2.3 Branching tab: fix or remove unused fields

- **Naming pattern:** Either wire to branch name generation (document format) or mark as "Reserved for future use" and hide/disable until implemented.
- **Granularity:** Clarify semantics vs actual behavior. Today the orchestrator creates branches per tier based on BranchStrategy, not per phase/task granularity. Either: (1) map granularity to strategy/branch creation policy and document, or (2) align UI label with actual behavior (e.g. "Branch per tier (phase/task/subtask)").

#### 4.2.4 Worktree visibility (optional)

- **Location:** Config (Branching or Advanced) or Doctor.
- **Features:**
  - "List worktrees" or status line: e.g. "N worktrees under .puppet-master/worktrees (tiers: A, B)."
  - "Recover orphaned worktrees" button: calls `worktree_manager.recover_orphaned_worktrees()` and shows result (e.g. toast).
- **Scope:** Best-effort; only when project path is known and is a git repo.

#### 4.2.5 Git info context

- **Gap:** Git info (branch, remote, user) is loaded for the Config page; ensure it is resolved for the **active project** (current project or config path), not only CWD, so it matches what the run will use.

### 4.3 Tooltip cleanup

- Remove or repurpose tooltips for controls that don't exist (e.g. use_worktrees, auto_merge_on_success, delete_on_merge) once the corresponding controls are added or the product decision is to not support them.

---

## 5. Config Wiring (Prerequisite)

### 5.1 Problem

- **Config page** loads/saves **GuiConfig** (YAML with `project`, `tiers`, `branching`, `advanced`, …) to `active_config_path()` (e.g. `puppet-master.yaml`).
- **Orchestrator run** uses **PuppetMasterConfig** from `ConfigManager::discover()` (same path). The two YAML shapes differ; many GUI fields (e.g. `advanced.execution.enable_parallel`, `branching.auto_pr`) are not present in the shape the orchestrator expects, so they default.
- **Result:** "Enable parallel execution" and other such settings have no effect on the run.

### 5.2 Chosen approach: Option B — Build run config from GUI

- **Option B (selected):** When starting a run, build `PuppetMasterConfig` (or the part the orchestrator needs) from the current **in-memory** `gui_config` and optionally merge with file-based config (e.g. for fields the GUI does not edit). The run sees the latest GUI values without requiring "Save" first (e.g. `enable_parallel_execution` from `gui_config.advanced.execution.enable_parallel`).
- **Implications:** Save on the Config page continues to persist GuiConfig to disk for next app launch. The orchestrator backend receives a config derived from `gui_config` at run start, so "Run" always uses the current UI state. Document this behavior in the UI (e.g. tooltip: "Run uses current settings; Save stores them for next time.").

*(Other options for reference: Option A = single canonical YAML schema; Option C = two files. Not chosen.)*

### 5.3 Fields to wire (minimum)

- `enable_parallel_execution` ← `gui_config.advanced.execution.enable_parallel`
- `enable_git` (if exposed in GUI) ← corresponding GUI field
- `branching.base_branch`, `branching.auto_pr` (and optionally strategy, granularity, naming_pattern) from GUI branching tab into the config the orchestrator uses.

---

## 6. Implementation Checklist

### Phase 1: Config wiring (blocker)

- [ ] Implement Option B config wiring (Section 5): when starting a run, build orchestrator config from current `gui_config` (and optional file merge). Ensure "Enable parallel execution" and branching/base_branch/auto_pr (and any other Git/worktree-relevant flags) are taken from `gui_config` so the run sees latest UI state without requiring Save first.
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

- [ ] Resolve `git` binary the same way in GitManager and Doctor (shared helper; e.g. `path_utils::resolve_git_executable()`; tag with DRY:FN — Section 7.11).
- [ ] Resolve `gh` binary the same way in PrManager and Doctor (use `resolve_app_local_executable("gh")` or shared wrapper; Section 7.11).
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

---

## 7. Gaps, Risks, and Implementation Notes

This section captures underspecified items, risks, and concrete details so the plan is implementation-ready.

### 7.1 Config format and schema mismatch

- **GuiConfig** (Config page) uses `branching.granularity: String` with values `"single"`, `"per_phase"`, `"per_task"`. **PuppetMasterConfig** (orchestrator) uses `branching.granularity: Granularity` enum (`Phase`, `Task`, `Subtask`, `Iteration`, `None`). There is no 1:1 mapping: GUI has no "per_subtask" or "per_iteration", and "single" could map to `None`.
- **PuppetMasterConfig** also has `branching.push_policy`, `branching.merge_policy`; GuiConfig does not expose these.
- **Branch strategy:** PuppetMasterConfig’s `BranchingConfig` does not currently have a `strategy` or `branch_strategy` field. `GitConfig` in `types/git.rs` has `branch_strategy: BranchStrategy`, but that struct is not the same as `BranchingConfig`. So adding “branch strategy from config” requires adding a field (e.g. `strategy: BranchStrategy` or `branch_strategy: String`) to the config the orchestrator loads, and a serialization format (e.g. `"main-only"` | `"feature"` | `"release"`).
- **Implementation:** For Option A (single canonical format), define one file format (e.g. PuppetMasterConfig-shaped YAML). The Config page must then either (1) load/save that format and map to/from GuiConfig for the UI, or (2) use a shared struct that has both GUI and backend fields. Document the mapping from GUI granularity strings to `Granularity` enum (e.g. single → None, per_phase → Phase, per_task → Task).

### 7.2 Doctor: project path context

- Doctor checks implement `async fn run(&self) -> CheckResult` with **no parameters**. They have no built-in “project path” or “working directory.”
- **GitRepoCheck** and **GitConfiguredCheck** “use project path when available” can be implemented by **resolving project root inside `run()`**: e.g. call `config_discovery::discover_config_path(None)` (or with a hint if the app can pass it), then take the parent directory as project root; run `git rev-parse --git-dir` or `git config user.name` with `current_dir(project_root)`. If no config is found, fall back to current behavior (CWD or HOME). This matches the pattern used in the orchestrator-subagent plan for the Gemini plan-mode Doctor check.
- **App → Doctor:** When the app runs Doctor (e.g. from the Doctor view), it could pass a “config hint” (e.g. `current_project.path`) so `discover_config_path(Some(hint))` finds the project’s config. That would require extending the Doctor run API to accept an optional hint (e.g. `run_all(hint: Option<&Path>)`) and threading it into checks that need it. Alternatively, keep discovery inside each check with `discover_config_path(None)` so the “project” is whatever directory would be used when no project is selected (cwd, default workspace, etc.).

### 7.3 Backend run does not use current project

- **Current behavior:** `spawn_orchestrator_backend` calls `ConfigManager::discover()` with **no hint**. The wizard and start-chain use `ConfigManager::discover_with_hint(config_hint)` with `current_project.path`. So the **orchestrator run** (Dashboard “Run”) never receives the current project path; it uses whatever `discover_config_path(None)` finds.
- **Implication:** For “recovery when project is known” and “Doctor use project path,” if the user selects a project in the UI but the run is started from the same app, the run still uses discover-with-no-hint. To make “current project” meaningful for the run, the run command would need to pass a hint (e.g. `AppCommand::Start { config_hint: Option<PathBuf> }`) and the backend would call `ConfigManager::discover_with_hint(config_hint)`. The plan should explicitly call out: “When starting a run from the Dashboard, pass `current_project.path` as config hint so the run and recovery use the selected project.”

### 7.4 Merge conflicts: persisting “conflict worktrees”

- To “avoid reusing that tier_id for a new worktree until the user resolves,” the app must remember which tier_ids have unresolved merge conflicts. Options: (1) a small state file under `.puppet-master/` (e.g. `worktree-conflicts.json` listing tier_ids), updated when a merge fails and cleared when the user runs “Recover worktrees” or resolves manually; (2) in-memory only (lost on restart, so re-run would still overwrite after restart). The plan should specify which approach or mark as “optional: in-memory set for the session only” to avoid scope creep.

### 7.5 Binary resolution: exact functions

- **Git:** Doctor uses `find_tool_executable("git")` in `git_checks.rs` (PATH + fallback dirs from `path_utils::get_fallback_directories()` and `path_utils::find_in_shell_path`). GitManager uses `Command::new("git")`. **Implementation:** Create a small helper (e.g. `path_utils::resolve_git_executable() -> Option<PathBuf>`) that uses the same logic as `find_tool_executable("git")`, and have both GitManager and GitInstalledCheck use it. GitManager can take `Option<PathBuf>` and use it in `run_git_cmd` when set.
- **gh:** Doctor uses `resolve_app_local_executable("gh")` from `path_utils`. PrManager uses `Command::new("gh")`. **Implementation:** Have PrManager resolve `gh` via `resolve_app_local_executable("gh")` (or a shared wrapper) at construction or at each `create_pr` call, and use the resolved path in `Command::new(path)`.

### 7.6 active_worktrees repopulation

- `list_worktrees()` already returns only worktrees under `worktree_base` and only includes entries for which `extract_tier_id(&path)` is `Some` (i.e. path under our base). So repopulating `active_worktrees` from `list_worktrees()` is a matter of iterating the result and doing `active_worktrees.insert(worktree.tier_id, worktree.path)`. No extra filtering needed beyond what’s already there.

### 7.7 Granularity vs BranchStrategy

- **Orchestrator today:** Creates a branch in `create_tier_branch` per tier (phase/task/subtask/iteration) based only on **BranchStrategy** (MainOnly / Feature / Release). It does **not** read `config.branching.granularity`.
- **Granularity** in config (Phase / Task / Subtask / Iteration / None) could mean “at which tier level do we create a new branch” (e.g. None = one branch for all; Phase = one branch per phase; Task = one per task). That behavior is not implemented. So either: (1) implement granularity so that branch creation is gated by tier level (e.g. only create branch when tier_type matches granularity), or (2) leave granularity as “future” and only wire BranchStrategy in the GUI (Main only / Feature / Release). The plan should state: “For Phase 4 GUI, decide whether to implement granularity-driven branch creation or only expose BranchStrategy; if only strategy, align granularity UI label with ‘informational’ or hide until implemented.”

### 7.8 Integration test setup

- Integration tests that “run with parallel execution on” and “verify worktrees created” require a real git repo (e.g. temp dir with `git init`, initial commit). The plan should add: “Use a temporary directory with `git init` and at least one commit; set `enable_parallel_execution: true` and run a minimal PRD with two parallel subtasks; assert worktree dirs exist and are used as cwd.” Optionally guard with `#[cfg(feature = "integration-git")]` or skip if `git` is not in PATH.

### 7.9 Worktree Doctor check: scope

- The “worktrees” Doctor check should run only when the project path is a git repo. Steps: (1) Resolve project root (e.g. via config discovery or hint). (2) Run `git worktree list --porcelain` from that root. (3) If that fails, report “not a git repo” or “git worktree not supported.” (4) Otherwise, optionally call `detect_orphaned_worktrees()` (requires a `WorktreeManager` instance) and report count of orphaned dirs and suggest “Recover orphaned worktrees” if non-zero. Creating `WorktreeManager` in a Doctor check requires a repo path; use the same project root.

### 7.10 Risks

- **Config migration:** If we move to a single canonical format (Option A), existing users may have only GuiConfig-shaped YAML. Loading it as PuppetMasterConfig can fail (missing `paths`, etc.). Plan: on load, try PuppetMasterConfig first; if it fails, try GuiConfig and convert to PuppetMasterConfig (with defaults for missing fields), then save in canonical format on next save.
- **Save timing:** Option B is chosen: on Run, build the config used for the run from in-memory `gui_config`, so Save is not required for the next run. Document this in the UI (e.g. tooltip or short note: “Run uses current settings; Save stores them for next time.”).

### 7.11 DRY and AGENTS.md conventions

This plan must be implemented in line with **AGENTS.md** (reuse-first DRY method):

- **Widgets and UI:** Before adding any new Git/worktree UI (Branching tab controls, worktree list/recover, toggles), check `docs/gui-widget-catalog.md` and `src/widgets/`. Use existing widgets (e.g. `styled_button`, `page_header`, `selectable_label`, toggles, dropdowns) and tag any new reusable widget with `// DRY:WIDGET:<name>`. After GUI changes, run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh`.
- **Platform/tool resolution:** Do not hardcode paths. Use shared helpers: `path_utils::find_tool_executable`, `path_utils::resolve_app_local_executable` (or a new `resolve_git_executable()` that both GitManager and Doctor use). Tag new shared helpers with `// DRY:FN:<name>`.
- **Single source of truth:** Git/branch behavior should use existing modules: `platform_specs` only for platform-related data (this plan is mostly git/worktree); branch naming from one place (e.g. `BranchStrategyManager` or shared function); config shape from the chosen Option B build-from-GUI flow.
- **Pre-completion:** Before marking any task done, run the AGENTS.md "Pre-Completion Verification Checklist" (cargo check/test, DRY checks, no hardcoded platform data, scope, gitignore rules).

---

## 8. References

- **AGENTS.md:** Git commit format ("ralph:"), gitignore rules, DRY, platform_specs, pre-completion checklist.
- **STATE_FILES.md:** State file hierarchy; add worktrees subsection.
- **REQUIREMENTS.md:** git-actions.log path, Git operations.
- **Plans/orchestrator-subagent-integration.md:** Worktree isolation for parallel subagents; ensure worktrees and config wiring are in place before or with subagent work.
- **Code:** `puppet-master-rs/src/git/` (worktree_manager, git_manager, pr_manager, branch_strategy, commit_formatter); `core/orchestrator.rs` (create_tier_branch, commit_tier_progress, create_tier_pr, worktree create/cleanup); `views/config.rs` (tab_branching); `doctor/checks/git_checks.rs`; `config/config_discovery.rs` (discover_config_path); `platforms/path_utils.rs` (resolve_app_local_executable, get_fallback_directories).
