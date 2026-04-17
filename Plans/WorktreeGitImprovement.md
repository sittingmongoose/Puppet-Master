# Worktree & Git Improvement -- Implementation Plan

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


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

## SSOT references (DRY)

- Locked decisions: `Plans/Spec_Lock.json`
- DRY + ContractRef rule: `Plans/DRY_Rules.md`
- Canonical terms: `Plans/Glossary.md`
- Deterministic defaults and tie-breaks: `Plans/Decision_Policy.md`
- Verifier gates and progression policy: `Plans/Progression_Gates.md`

ContractRef: SchemaID:Spec_Lock.json, ContractName:Plans/DRY_Rules.md, ContractName:Plans/Glossary.md, PolicyRule:Decision_Policy.md, Gate:GATE-002

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

### 2.0 Symlink resolution in worktree paths

Worktree path resolution MUST apply the fail-closed symlink policy from `Plans/Permissions_System.md` §1.1 and `Plans/Architecture_Invariants.md` INV-017.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md

Required:
- All file paths computed relative to a worktree root MUST be normalized via `realpath()` before any scope check or file guard comparison.
- If `realpath()` fails on a worktree-relative path, the operation MUST be denied.
- The `working_directory` passed to FileSafe `check_file_write` MUST be the real path of the worktree root, not a symlinked alias.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Architecture_Invariants.md


### 2.1 Base branch for worktree creation

- **Gap:** Worktrees are created with `git worktree add -b <branch> <path>` from **current HEAD** of the main repo. There is no checkout of `config.branching.base_branch` first.
- **Impact:** If the main repo is on a feature branch, new worktrees are created from that branch instead of `main` (or configured base).
- **Fix:**
  - Before creating worktrees for a parallel group, ensure the main repo is on `config.branching.base_branch` (e.g. `git checkout base_branch` or at least validate and warn).
  - Optionally: create worktrees from a specific ref, e.g. `git worktree add -b <branch> <path> <base_branch>` (supported in recent Git).

### 2.2 active_worktrees lost on restart

- **Gap:** `active_worktrees` is in-memory only. After restart it is empty; real worktrees may still exist under `.puppet-master/worktrees/`, but `get_node_worktree(node_id)` returns `None`, so iterations use the main repo path.
- **Fix (choose one or combine):**
  - **Option A:** On orchestrator init (or when loading a run), repopulate `active_worktrees` from `worktree_manager.list_worktrees()` for paths under `worktree_base`.
  - **Option B:** When resolving working directory for a node, if `active_worktrees` has no entry, fall back to `worktree_manager.get_worktree_path(node_id)` and verify the path exists and is a valid worktree (e.g. in `list_worktrees()`); if so, use it and optionally re-register.

### 2.3 Merge conflicts: worktree kept but re-run can destroy it

- **Gap:** On merge conflict, `cleanup_subtask_worktree` returns without removing the worktree but removes the node from `active_worktrees`. Re-running the same subtask calls `create_subtask_worktree` → `create_worktree` → "if path exists remove_worktree", so the conflicting worktree is removed and the conflict state is lost.
- **Fix:**
  - On conflict, either: (1) surface the worktree path to the user (e.g. toast or status) and avoid reusing that node_id for a new worktree until the user resolves or discards, or (2) document clearly that re-running will replace the worktree and lose unmerged state.
  - Optionally: add a "Resolve worktree conflicts" action that lists worktrees with merge conflicts and offers to open in editor or remove after confirmation.

### 2.4 Node ID and branch name sanitization

- **Gap:** Worktree path is `worktree_base.join(node_id)` with no sanitization; branch name is `format!("subtask/{}", subtask_id.replace('.', "-"))` with no other sanitization. Risky for path traversal or invalid refs.
- **Fix:**
  - Sanitize `node_id` for use as a single path component (strip or replace `..`, path separators, and other unsafe characters) before `join`.
  - Sanitize branch name for git refs (e.g. reuse or mirror `BranchStrategyManager::sanitize_id` or a shared helper; disallow spaces and other invalid ref characters).

### 2.5 Branch already exists when recreating worktree

- **Gap:** If the branch (e.g. `subtask/ST-001-001-001`) already exists (e.g. after incomplete cleanup), `git worktree add -b <branch> <path>` fails with "fatal: A branch named '...' already exists."
- **Fix:**
  - Before `worktree add -b`, check if the branch exists (e.g. `git rev-parse --verify refs/heads/<branch>`). If it exists, use `git worktree add <path> <branch>` (no `-b`) to create the worktree from the existing branch, or explicitly delete the branch if it is safe (e.g. no other worktree uses it).

### 2.6 Detached HEAD worktrees

- **Gap:** `list_worktrees` only sets `branch` when it sees a `branch refs/heads/...` line. Detached HEAD worktrees yield empty `branch`; `merge_worktree` would then call `git merge ""`.
- **Fix:** When parsing porcelain output, treat missing branch as "detached". In `merge_worktree`, if source_branch is empty, skip merge or merge by commit hash and document behavior.

### 2.7 worktree_exists is path-only
Recovery and path validation must preserve historical state instead of collapsing missing worktrees into disappearance.

Required fields:
- `historical`
- `archived`
- `removed`
- `historical_lineage_refs[]`

Rules:
- Recovery text references `Plans/storage-plan.md#Restart and stale history`.
- Missing live worktrees remain inspectable through historical lineage.
### 2.9 PR creation after restart uses main repo branch

- **Gap:** After restart, `get_node_worktree(node_id)` is `None`. `create_node_pr` then uses `git_manager.current_branch()` for head_branch, so the PR is created from the main repo branch, not the worktree branch.
- **Fix:** When resolving head branch for PR, also consider `worktree_manager`: if a worktree path exists for this node (e.g. from `list_worktrees()` or path existence + valid worktree), use that worktree's branch even when `active_worktrees` has no entry.

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

### 3.0 Git subprocess integrity invariant

#### 3.0.1 Exit-code classification and recovery

Git subprocess exit codes are classified into three recovery categories:

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileSafe.md

| Exit Scenario | Classification | Recovery Action |
|---|---|---|
| Exit 0 | success | proceed normally |
| Exit 1 with `nothing to commit` on stdout | informational | proceed (not an error for commit operations) |
| Exit 1 (generic failure) | fatal | fail the operation with structured error; do not retry |
| Exit 128 + signal (e.g., SIGKILL, SIGTERM) | fatal | fail immediately; report the signal in the error |
| Exit 128 (ambiguous) | fatal | fail the operation; log full stderr for diagnosis |
| Lock contention (`index.lock` exists) | retryable | retry once after 500ms backoff; fail on second attempt |
| Network timeout (fetch/push/clone) | retryable | retry with exponential backoff (max 3 attempts, base 1s) |
| Authentication failure (exit 128 with auth error on stderr) | fatal | fail immediately; surface credential refresh guidance |
| Disk full / permission denied | fatal | fail immediately; surface the OS-level error |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md

Rules:
- Retryable scenarios MUST use bounded retry with backoff. Maximum 3 retry attempts for network operations; maximum 1 retry for lock contention.
- Fatal scenarios MUST NOT be retried. The operation fails with a structured error that includes the git command, exit code, and stderr content.
- The `nothing to commit` case is the only exit-1 scenario that is not treated as a hard error. All other non-zero exits follow the hard-error rule from §3.0.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md

Every git subprocess that mutates or validates PM-managed state MUST treat a non-zero exit status as a hard error.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md

Required behavior:
- after `git add`, verify staged state with `git status --porcelain`
- do not silently swallow non-zero exits from `git add`, `git commit`, `git stash`, `git checkout`, or equivalent mutation-sensitive commands
- distinguish `nothing to commit` from generic failure, but do not treat genuine git command failure as informational noise

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

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
- **Fix:** Add branch strategy to the config the orchestrator loads (e.g. under `branching` or a dedicated `git` section). Map config value to `BranchStrategy` and use it in `create_node_branch` instead of hardcoding.

### 3.6 Single source of truth for branch naming

- **Gap:** Orchestrator inlines branch name generation in `create_node_branch`; `BranchStrategyManager::generate_branch_name` implements similar but not identical logic (e.g. iteration: "it-" vs "tk-").
- **Fix:** Use one implementation for all branch naming (e.g. `BranchStrategyManager` or a shared function used by both orchestrator and any other callers). Remove duplicate logic from the orchestrator.

### 3.7 naming_pattern usage

- **Gap:** `BranchingConfig` has `naming_pattern` (and it's in the GUI); orchestrator and branch logic never use it.
- **Fix:** Either: (1) Wire `naming_pattern` into branch name generation (document format and placeholders, e.g. `{node}`, `{id}`), or (2) Remove or hide the field until implemented and document that branch names follow the strategy (ph-/tk-/st-/release/...) only.

### 3.8 Commit message format

- **Gap:** `commit_node_progress` uses `format!("node: {} iteration {} complete", node_id, iteration)`. AGENTS.md and `CommitFormatter` use the `pm: [ITERATION] ...` convention.
- **Fix:** Use `CommitFormatter::format_iteration_commit(subtask_id, iteration, success)` (or equivalent) for iteration commits so they match the documented "pm:" convention.

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
`Source Control` remains the Git/worktree owner surface.

Rules:
- The GUI model stays `worktree-first` when it hands off to Source Control.
- Cross-references now point at `Plans/Orchestrator_Page.md#Source Control boundary` rather than the stale numbered anchor.
## 5. Config Wiring (Prerequisite)

### 5.1 Problem

- **Config page** loads/saves **GuiConfig** (YAML with `project`, `nodes`, `branching`, `advanced`, ...) to `active_config_path()` (e.g. `puppet-master.yaml`).
- **Orchestrator run** uses **PuppetMasterConfig** from `ConfigManager::discover()` (same path). The two YAML shapes differ; many GUI fields (e.g. `advanced.execution.enable_parallel`, `branching.auto_pr`) are not present in the shape the orchestrator expects, so they default.
- **Result:** "Enable parallel execution" and other such settings have no effect on the run.

### 5.2 Chosen approach: Option B -- Build run config from GUI

- **Option B (selected):** When starting a run, build `PuppetMasterConfig` (or the part the orchestrator needs) from the current **in-memory** `gui_config`. **Option B v1:** Run config is built from `gui_config` only for the fields in 5.3; no file merge in initial release. The run sees the latest GUI values without requiring "Save" first (e.g. `enable_parallel_execution` from `gui_config.advanced.execution.enable_parallel`). If building run config from `gui_config` fails (e.g. missing required field), fall back to `ConfigManager::discover_with_hint(hint)`; if that also fails, fail the run with a clear error (do not start with default-only config silently).
- **Implications:** Save on the Config page continues to persist GuiConfig to disk for next app launch. The orchestrator backend receives a config derived from `gui_config` at run start, so "Run" always uses the current UI state. Document this behavior in the UI (e.g. tooltip: "Run uses current settings; Save stores them for next time.").
- **Settings projection (rewrite):** Option B and Phase 1 are required for initial release and must work with **YAML-only** config. Redb/seglog is out of scope for this plan; when storage-plan lands, run config can be read from redb instead of gui_config. In the seglog/redb architecture (storage-plan.md), config/settings may be **projected in redb**; branching/worktree/Git settings would then live in the same redb projection.

*(Other options for reference: Option A = single canonical YAML schema; Option C = two files. Not chosen.)*

### 5.3 Fields to wire (minimum)
### 5.4 Execution-affecting projection completeness

Option B remains the canonical run-start config projection path.

Completeness rule:
- any GUI setting that changes runtime behavior belongs in the run config snapshot built at start
- interview execution-affecting settings and HITL node toggles are part of this rule even when their owning feature plans define the detailed semantics
- summaries in this document must reference the owning SSOTs rather than implying that GUI-only execution settings are acceptable

This section extends the minimum-field list with the policy that execution-affecting settings are projected by class, not by ad hoc exception.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/human-in-the-loop.md

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
- [ ] Sanitize node_id (path) and branch name (ref).
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
- [ ] Branch strategy: load from config; use in create_node_branch.
- [ ] Single branch naming implementation (remove duplicate logic).
- [ ] naming_pattern: wire to branch names or hide and document.
- [ ] Iteration commits: use CommitFormatter (pm: format).
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
| **Phase 2** | (1) After restart, `get_node_worktree(node_id)` returns the path for nodes that still have worktrees under worktree_base (repopulation or fallback). (2) New worktrees are created from `config.branching.base_branch` (checkout or ref). (3) Doctor "worktrees" check runs when project is a git repo and reports worktree count and/or orphaned suggestion. |
| **Phase 3** | (1) GitManager and Doctor git checks use the same resolved `git` binary (e.g. shared `path_utils::resolve_git_executable()`). (2) Iteration commits use CommitFormatter and produce "pm:"-style messages. (3) git-actions.log path matches REQUIREMENTS (`.puppet-master/logs/git-actions.log`) and is documented in .gitignore if runtime-only. |
| **Phase 4** | (1) Branching tab has Enable Git, Auto PR, Branch strategy wired to run config (run uses current GUI values). (2) Naming pattern is either wired to branch names or hidden and documented. (3) After GUI changes, `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` run and pass. |
| **Phase 5** | (1) Integration test: parallel run in temp git repo creates worktree dirs and uses them as cwd for subtasks. (2) Integration test: run with Git disabled does not create branches/commits/PRs. (3) AGENTS.md Pre-Completion Verification Checklist completed and Task Status Log updated for any closed tasks. |

### File/source hints (Phase 2 and Phase 3)

**Phase 2 (Worktrees):** `puppet-master-rs/src/git/worktree_manager.rs` (base branch, repopulation, conflict handling, sanitization, branch exists, detached HEAD, worktree_exists validity, recovery, merge_worktree target_branch); `puppet-master-rs/src/core/orchestrator.rs` (create/cleanup worktree calls, PR head branch resolution, project path for recovery); `puppet-master-rs/src/doctor/checks/git_checks.rs` (new worktrees check); `puppet-master-rs/src/config/config_discovery.rs` (project path discovery); `STATE_FILES.md` (worktrees subsection).

**Phase 3 (Git):** `puppet-master-rs/src/platforms/path_utils.rs` (shared `resolve_git_executable()`; tag DRY:FN); `puppet-master-rs/src/git/git_manager.rs` (use resolved git binary, git-actions.log path); `puppet-master-rs/src/git/pr_manager.rs` (GitHub HTTPS API PR creation; see `Plans/GitHub_API_Auth_and_Flows.md`); `puppet-master-rs/src/git/branch_strategy.rs` (single branch naming); `puppet-master-rs/src/git/commit_formatter.rs` (iteration commits); `puppet-master-rs/src/core/orchestrator.rs` (branch strategy from config, create_node_branch, commit_node_progress); `puppet-master-rs/src/doctor/checks/git_checks.rs` (shared git binary, configured/repo checks + GitHub API auth check); `REQUIREMENTS.md` / `.gitignore` (git-actions.log path and ignore rule).

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

**Config Format Mismatch Resolution (Resolved — Migrate to Single Canonical Format):**

GuiConfig and PuppetMasterConfig MUST use the same enum for `branching.granularity`:

```rust
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum BranchGranularity {
    None,      // Single branch (GUI label: "Single branch")
    Phase,     // Per-phase branches (GUI label: "Per phase")
    Task,      // Per-task branches (GUI label: "Per task")
    Subtask,   // Per-subtask branches (GUI label: "Per subtask")
    Iteration, // Per-iteration branches (GUI label: "Per iteration")
}
```

- GUI displays human-readable labels; stores the enum variant in redb.
- No string-based `branching.granularity` in GuiConfig. Eliminate the string type.
- Migration: on first load, map legacy strings to enum variants ("single" → None, "per_phase" → Phase, "per_task" → Task). Log `config.migrated` seglog event.
- Unmapped fields (`push_policy`, `merge_policy`): expose in GUI Settings → Git section. Default: `push_policy: "after_phase"`, `merge_policy: "squash"`.

### 7.2 Doctor: project path context

- Doctor checks implement `async fn run(&self) -> CheckResult` with **no parameters**. They have no built-in "project path" or "working directory."
- **GitRepoCheck** and **GitConfiguredCheck** "use project path when available" can be implemented by **resolving project root inside `run()`**: e.g. call `config_discovery::discover_config_path(None)` (or with a hint if the app can pass it), then take the parent directory as project root; run `git rev-parse --git-dir` or `git config user.name` with `current_dir(project_root)`. If no config is found, fall back to current behavior (CWD or HOME). This matches the pattern used in the orchestrator-subagent plan for the Gemini plan-mode Doctor check.
- **App → Doctor:** When the app runs Doctor (e.g. from the Doctor view), it could pass a "config hint" (e.g. `current_project.path`) so `discover_config_path(Some(hint))` finds the project's config. That would require extending the Doctor run API to accept an optional hint (e.g. `run_all(hint: Option<&Path>)`) and threading it into checks that need it. Alternatively, keep discovery inside each check with `discover_config_path(None)` so the "project" is whatever directory would be used when no project is selected (cwd, default workspace, etc.).

### 7.3 Backend run does not use current project

- **Current behavior:** `spawn_orchestrator_backend` calls `ConfigManager::discover()` with **no hint**. The wizard and start-chain use `ConfigManager::discover_with_hint(config_hint)` with `current_project.path`. So the **orchestrator run** (Dashboard "Run") never receives the current project path; it uses whatever `discover_config_path(None)` finds.
- **Implication:** For "recovery when project is known" and "Doctor use project path," if the user selects a project in the UI but the run is started from the same app, the run still uses discover-with-no-hint. To make "current project" meaningful for the run, the run command must pass a hint (e.g. extend start message with `config_hint: Option<PathBuf>`). **Call site to change:** In `app.rs::spawn_orchestrator_backend`, replace `ConfigManager::discover()` with `ConfigManager::discover_with_hint(config_hint)`; pass `current_project.path` from Dashboard when starting a run. The plan should explicitly call out: "When starting a run from the Dashboard, pass `current_project.path` as config hint so the run and recovery use the selected project."

### 7.4 Merge conflicts: persisting "conflict worktrees"

- To "avoid reusing that node_id for a new worktree until the user resolves," the app must remember which node_ids have unresolved merge conflicts. Options: (1) a small state file under `.puppet-master/` (e.g. `worktree-conflicts.json` listing node_ids), updated when a merge fails and cleared when the user runs "Recover worktrees" or resolves manually; (2) in-memory only (lost on restart, so re-run would still overwrite after restart). The plan should specify which approach or mark as "optional: in-memory set for the session only" to avoid scope creep.

### 7.5 Binary resolution: exact functions

- **Git:** Doctor uses `find_tool_executable("git")` in `git_checks.rs` (PATH + fallback dirs from `path_utils::get_fallback_directories()` and `path_utils::find_in_shell_path`). GitManager uses `Command::new("git")`. **Implementation:** Create a small helper (e.g. `path_utils::resolve_git_executable() -> Option<PathBuf>`) that uses the same logic as `find_tool_executable("git")`, and have both GitManager and GitInstalledCheck use it. GitManager can take `Option<PathBuf>` and use it in `run_git_cmd` when set.
- **GitHub PR creation:** Doctor must validate GitHub API auth (device-code token present + scopes) and PR creation must use GitHub HTTPS API (no GitHub CLI). See `Plans/GitHub_API_Auth_and_Flows.md`.

### 7.6 active_worktrees repopulation

- `list_worktrees()` already returns only worktrees under `worktree_base` and only includes entries for which `extract_node_id(&path)` is `Some` (i.e. path under our base). So repopulating `active_worktrees` from `list_worktrees()` is a matter of iterating the result and doing `active_worktrees.insert(worktree.node_id, worktree.path)`. No extra filtering needed beyond what's already there.

### 7.7 Granularity vs BranchStrategy

- **Orchestrator today:** Creates a branch in `create_node_branch` per node (phase/task/subtask/iteration) based only on **BranchStrategy** (MainOnly / Feature / Release). It does **not** read `config.branching.granularity`.
- **Granularity** in config (Phase / Task / Subtask / Iteration / None) could mean "at which node level do we create a new branch" (e.g. None = one branch for all; Phase = one branch per phase; Task = one per task). That behavior is not implemented. So either: (1) implement granularity so that branch creation is gated by node level (e.g. only create branch when node_type matches granularity), or (2) leave granularity as "future" and only wire BranchStrategy in the GUI (Main only / Feature / Release). The plan should state: "For Phase 4 GUI, decide whether to implement granularity-driven branch creation or only expose BranchStrategy; if only strategy, align granularity UI label with 'informational' or hide until implemented."

### 7.8 Integration test setup

- Integration tests that "run with parallel execution on" and "verify worktrees created" require a real git repo (e.g. temp dir with `git init`, initial commit). The plan should add: "Use a temporary directory with `git init` and at least one commit; set `enable_parallel_execution: true` and run a minimal PRD with two parallel subtasks; assert worktree dirs exist and are used as cwd." Optionally guard with `#[cfg(feature = "integration-git")]` or skip if `git` is not in PATH.

### 7.9 Worktree Doctor check: scope

- The "worktrees" Doctor check should run only when the project path is a git repo. Steps: (1) Resolve project root (e.g. via config discovery or hint). (2) Run `git worktree list --porcelain` from that root. (3) If that fails, report "not a git repo" or "git worktree not supported." (4) Otherwise, optionally call `detect_orphaned_worktrees()` (requires a `WorktreeManager` instance) and report count of orphaned dirs and suggest "Recover orphaned worktrees" if non-zero. Creating `WorktreeManager` in a Doctor check requires a repo path; use the same project root.

### 7.10 Risks

- **Config migration:** If we move to a single canonical format (Option A), existing users may have only GuiConfig-shaped YAML. Loading it as PuppetMasterConfig can fail (missing `paths`, etc.). Plan: on load, try PuppetMasterConfig first; if it fails, try GuiConfig and convert to PuppetMasterConfig (with defaults for missing fields), then save in canonical format on next save.
- **Save timing:** Option B is chosen: on Run, build the config used for the run from in-memory `gui_config`, so Save is not required for the next run. Document this in the UI (e.g. tooltip or short note: "Run uses current settings; Save stores them for next time.").

### 7.14 Resolved decisions (implementation-ready)

All gaps from audit are closed with the following decisions. Implementers should follow these so the plan has no ambiguity.

**Worktree (Section 2):** (1) **Base branch:** Use checkout base_branch then add for initial release; create from ref (e.g. `git worktree add -b <branch> <path> <base_branch>`) is optional later. (2) **active_worktrees repopulation:** On first resolve with no entry, if path exists and is in `list_worktrees()`, use it and re-register in `active_worktrees` for that session. (3) **Conflict persistence:** In-memory only for initial release -- `HashSet<node_id>` of conflict worktrees; optional Phase 6: `.puppet-master/worktree-conflicts.json`. (4) **Detached HEAD merge:** In `merge_worktree`, if source_branch is empty: read HEAD commit from that worktree (`git rev-parse HEAD` in worktree path), then in main repo `git merge --no-ff <commit>`; document in STATE_FILES.md. (5) **Recovery:** If no project path at startup, skip worktree recovery; run recovery when user first selects/opens a project or when a run starts with config hint. (6) **Repopulation failure:** If `list_worktrees()` fails during repopulation, log error and start with empty `active_worktrees`. (7) **Doctor worktrees:** Must run `list_worktrees` and report state; optionally call `detect_orphaned_worktrees()` and include count; Recover remains a separate UI action. (8) **Platform:** Sanitization and path handling must be safe on Windows (use `PathBuf`/`join`; no assumption that `/` is the only separator). (9) **Section 2.12:** Re-validate worktree path before use is Phase 6 / optional.

**Git (Section 3):** (1) **Git binary:** Add `path_utils::resolve_git_executable() -> Option<PathBuf>` (same logic as `find_tool_executable("git")`); GitManager and GitInstalledCheck both use it; tag `// DRY:FN:resolve_git_executable`. If resolver returns None, GitManager fails the operation; Doctor fails the check. (2) **GitHub PRs:** PR creation uses GitHub HTTPS API only (no GitHub CLI) per `Plans/GitHub_API_Auth_and_Flows.md`. (3) **naming_pattern:** Hide in GUI and document Reserved for future use in initial release; do not wire to branch naming. (4) **git-actions.log:** Move to `.puppet-master/logs/git-actions.log`; add to .gitignore as runtime-only per STATE_FILES.

**Config (Section 5):** (1) **Backend call site:** In `app.rs::spawn_orchestrator_backend`, replace `ConfigManager::discover()` with `ConfigManager::discover_with_hint(config_hint)`; pass `current_project.path` from Dashboard/start-run flow (e.g. extend start message with optional hint). (2) **Minimum wired fields:** enable_parallel_execution, enable_git, base_branch, auto_pr; strategy required for Phase 4 GUI; granularity/naming_pattern optional/hidden per 7.7 and 3.7.

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

Git and worktree coordination must use the reconciled PM crew model rather than ad hoc crew-memory or side-file canon.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md

Required rules:
- git/worktree coordination crews are optional overlays, not separate persistent actor systems.
- crew members remain child runs.
- crew coordination uses explicit shared crew state and crew-board messages when enabled.
- `.puppet-master/memory/*` is not canonical crew coordination state.
- `active-agents.json` is not canonical git/worktree coordination state.

If git/worktree coordination is needed:
- store canonical lineage, ownership, and conflict state in seglog/redb projections.
- treat longer-lived crew identity as explicit shared state, not hidden child memory.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileSafe.md
## 7.13 Lifecycle and Quality Enhancements for Git/Worktree Operations

Git/worktree lifecycle and quality features must align with the current child-run, crew, and blocked-state canon.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md

Required rules:
- reuse canonical child-run and crew events rather than inventing separate active-agent lifecycle files.
- blocked payloads use canonical `blocked_reason_code` plus ordered `allowed_action_ids[]`.
- cleanup, reroute, and retry behavior must preserve child lineage and worktree ownership fields.
- quality and handoff metadata belong in canonical event/storage structures rather than memory-manager files.

Cross-session continuity for git/worktree behavior comes from canonical state and handoff reconstruction, not from child-memory files.

ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Prompt_Pipeline.md
## 8. References

- **AGENTS.md:** Git commit format ("pm:"), gitignore rules, DRY, platform_specs, pre-completion checklist.
- **STATE_FILES.md:** State file hierarchy; add worktrees subsection.
- **REQUIREMENTS.md:** git-actions.log path, Git operations.
- **Plans/orchestrator-subagent-integration.md:** Worktree isolation for parallel subagents; ensure worktrees and config wiring are in place before or with subagent work.
- **Code:** `puppet-master-rs/src/git/` (worktree_manager, git_manager, pr_manager, branch_strategy, commit_formatter); `core/orchestrator.rs` (create_node_branch, commit_node_progress, create_node_pr, worktree create/cleanup); `views/config.rs` (tab_branching); `doctor/checks/git_checks.rs`; `config/config_discovery.rs` (discover_config_path); `platforms/path_utils.rs` (resolve_app_local_executable, get_fallback_directories).

## Safe-Point and Retry Integration Addendum (2026-03-08)

### 1. Worktree-native safe points

Runtime safe points for mutation-capable attempts should be implemented on top of the existing worktree / isolated execution model.

Required properties:
- no `git reset --hard` style shared-workspace rollback contract
- preserve isolation within the active worktree/runtime root
- support restoring a failed attempt to its pre-attempt baseline for retry-from-safe-point behavior

### 2. Retry posture visibility

Worktree/branch status surfaces should be able to explain whether a pending retry is:
- waiting on backoff
- waiting on remediation
- ready for retry from safe point
- requiring a fresh attempt

### 3. Acceptance criteria

- Safe-point recovery reuses the worktree-native isolation model.
- Retry-from-safe-point does not rely on destructive shared-workspace reset semantics.
- Worktree-oriented status surfaces can explain retry posture.
## Safe Point / Worktree Recovery Alignment Addendum (2026-03-09)

Worktree-native isolation remains canonical, but runtime recovery must integrate with it.

### Required rules
- a safe point may reference worktree-specific baseline state
- restore-before-rerun operations must specify which worktree/baseline they target
- merge/conflict or dirty-state detection may block resume and must surface an explicit reason rather than silently reusing a changed worktree
- worktree isolation does not replace runtime blocked classification; it complements it
## Runtime Worktree Conflict Reconciliation Addendum (2026-03-09)

This addendum is retained as historical context only.

Canonical worktree-conflict and dirty-worktree runtime rules now live in `## Worktree Conflict and Dirty-Worktree Runtime Alignment`.

Canonical blocked reasons for this domain are `worktree_conflict` and `dirty_worktree`.

Required rules:
- blocked payloads use canonical blocked fields and ordered `allowed_action_ids[]`
- recovery may require safe-point restore when the runtime marks `requires_safe_point_restore = true`
- clearing the underlying worktree issue resolves the blocked prerequisite; it does not fabricate a new failure class
- worktree conflict resolution must preserve lineage to the blocked episode and any affected safe point

ContractRef: Plans/Orchestrator_Page.md#11. Source Control boundary

Required fields:
- blocked_reason_code
- blocked_reason_detail
- remediation_actions_allowed
- dirty_state
- conflict_state

Canonical terms and values:
- blocked_reason_code
- remediation_actions_allowed

Labels:
- dirty worktree

Behavioral rules:
- `dirty_worktree` and `worktree_conflict` stay canonical blocked reasons instead of generic SCM failures.
- Conflict and cleanup semantics must remain distinct.

Permission carry-through:
- remediation actions must surface only through the allowed-action set