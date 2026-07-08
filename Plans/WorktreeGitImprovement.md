# Worktree & Git Improvement -- Implementation Plan


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Source Control and worktree handshake


### Lane vs worktree lifecycle split


### Historical semantic consistency


### Coverage blocker provider/model precedence owner section
### Coverage blocker worktree allocation strategy
### Projection fields for startup rehydration
### Lane cleanup lineage fields
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


### 2.0.1 Worktree path guard rules

Worktree path resolution MUST apply the fail-closed symlink policy from `Plans/Permissions_System.md` §1.1 and `Plans/Architecture_Invariants.md` INV-017.

Search/index paths that interact with worktrees or remote caches are canonicalized before use and validated with `starts_with(project_root)` or `starts_with(cache_root)`. This includes paths derived from `.gitmodules`/gitmodules, dirty staging notifications, remote file-change notifications, and file watcher events; submodule paths containing `..` are rejected with a logged warning before affecting a project tree or remote `cache_root`. Index-build walks and ripgrep verification default to `--no-follow` / `no-follow`; a "Follow symlinks" indexing setting is OFF by default, and when enabled PM still canonicalizes the resolved target and reapplies `starts_with(project_root)` before indexing or verifying it.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md

Required:
- All file paths computed relative to a worktree root MUST be normalized via `realpath()` before any scope check or file guard comparison.
- If `realpath()` fails on a worktree-relative path, the operation MUST be denied.
- The `working_directory` passed to FileSafe `check_file_write` MUST be the real path of the worktree root, not a symlinked alias.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Architecture_Invariants.md

### 2.0A Assistant worktree command and ownership rules

- Compare buttons for assistant/worktree rows open committed branch-to-branch review only: worktree branch HEAD against base branch HEAD through `cmd.git.open_diff`, with `compare_origin` set to the base branch ref (e.g. `main`).
- `cmd.chat.worktree.create` and `cmd.chat.worktree.remove` delegate to `WorktreeManager`; worktree creation/removal is user/system-initiated infrastructure, not agent-tool-gated, and agents do not run raw `bash` `git worktree add` or removal commands.
- Git-aware tools such as `git status` auto-scope to the worktree through process `cwd`.
- Branch rename follows `chat.thread_title_generated`; merge and PR command when-clause checks require the worktree not be on detached HEAD.
- Branch existence checks use `git rev-parse --verify refs/heads/{branch}` before create; existing branch reuse uses `git worktree add <path> <branch>`.
- Detached transitions refresh `worktree_projection.v1`; Source Control rows for orch-owned worktrees show `Open Lane` instead of `Open Thread`.
- `Permissions_System.md` remains unaffected by this worktree creation/removal contract because worktree creation and removal are routed through Source Control and `WorktreeManager`.


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

### 2.8 Lane/worktree lifecycle, storage families, and historical vocabulary


#### Lane and worktree lifecycle
- Lanes own worktrees through explicit allocation and handshake.
- Worktrees are allocated at lane start and reclaimed at lane end (implicit or explicit).
- Storage families define data layout and cleanup rules; worktrees may span multiple storage families.

#### Source Control to Orchestrator handshake
- When a lane requests a worktree, Source Control MUST confirm allocation, provide the worktree path, and publish any applicable storage metadata.
- Orchestrator records the handshake in the ledger so restart and recovery can reuse the same worktree.
- Stale worktrees (allocated but not reclaimed) are eligible for cleanup via storage housekeeping.

#### Provider/model precedence and worktree allocation strategy
- Worktree allocation strategy is determined by lane policy, not by individual nodes.
- Multiple providers may offer worktree allocation; the lane selects a primary provider and routes all allocations through that provider.
- Fallback providers are secondary; they are used only if the primary provider is unavailable.
### Source Control to Orchestrator handshake
Source Control is the concrete repo/worktree operator, while Orchestrator remains the lane-pool operational truth.

Required row fields:
- owning package reference
- `lane_id`
- `run_id`
- `worktree_id`
- lifecycle state
- blocked/recovery state

Rules:
- worktree rows MUST show owning package, lane, and run references together with lifecycle and blocked/recovery state
- Source Control actions operate on concrete repositories and worktrees but MUST report results back through canonical lane/worktree records
- Orchestrator decisions about reuse, cleanup, retry, and recovery consume the same lane/worktree records rather than side files

### Provider/model precedence and worktree allocation strategy
Provider/model selection and worktree allocation are one ownership surface because allocation follows the effective execution scope.

Precedence order:
- delegated subagent
- overseer
- node
- work package
- seam
- run

Allocation rules:
- parallel nodes receive distinct worktree allocations unless they explicitly reuse an existing clean allocation owned by the same effective scope
- contamination, dirty-state, conflict-state, blocked recovery, or lineage mismatch disqualify reuse and force a new allocation or explicit repair
- cleanup only occurs after lineage-safe completion or archival and MUST preserve the historical record of the lane/worktree pair
- run-completion cleanup waits for the owning cleanup grace period before deletion; the cleanup worker records `grace_period_ms`, performs a file-lock check, and refuses deletion while active locks, safe-point refs, terminal/editor sessions, or blocked recovery lineage still reference the worktree
- `worktree.deleted` may be emitted only after the grace-period and file-lock checks pass; `worktree.created` records the allocation path, branch, lane/run/package lineage, and source-control owner before a node begins work in that tree
- ownership transitions between scopes MUST update the effective provider/model choice together with the lane/worktree assignment record

#### Runtime lineage transfer and restore targeting
- Worktree ownership transfer requires an explicit runtime lineage event; replan must either rebind explicitly to new attempt lineage or allocate new worktree lineage, never silently inherit prior ownership.
- Manual prune/remove stays forbidden while the worktree is `active` or `blocked_preserved` unless the explicit override policy permits it and records the override.
- Restore and retry payloads, including `cmd.runtime.restore_safe_point_then_retry`, carry exact SCM targeting: `repo_id`, `worktree_id`, and `baseline_target`.
- `baseline_target` is a closed candidate enum for restore/retry targeting: `safe_point`, `historical_commit`, and `worktree_head`.
- Retry and `/fresh-attempt` commands must support the same SCM targeting and reuse policy; runtime rejects restore/retry when the targeted worktree or baseline cannot be validated instead of substituting another worktree.
- Legacy `git_panel/*` and `git_panel` state is one-time migration input into `source_control.project_state.{project_id}` only. Settings-owned policy such as `branching.base_branch` remains canonical settings policy, followed by canonical Source Control project state, with legacy `git_panel/*` consulted only when the canonical key is absent; no new build writes both legacy and canonical keys.

#### Worktree identity, active context, and copy contracts

Source Control owns the live SCM truth for current repo/worktree state, while Health is a read-only diagnostic and `/validation` mirror unless a repair utility deep-links back into Source Control. Worktree projection keys use `project_id/repo_id/worktree_id`; the compact `/repo_id/worktree_id` display is allowed only as a label over canonical IDs. `repo_id` is stable per project repo root, `worktree_id` is stable per concrete worktree instance, `worktree_path` is display/navigation state, and a `/recovered` or recreated path gets a new durable instance marker rather than inheriting stale identity. Every `multi-worktree` and multi-active-worktree view reads these IDs from durable-storage state before rendering live SCM affordances.

Remote-mode and `/SSH` projects still use the same canonical IDs. Remote `worktree_path` is a remote path string, not a local-path-oriented mirror path. `Open in Source Control` opens a remote-aware Source Control context; if connectivity is lost, Source Control stays visible in degraded read-only mode with exact disabled reason. Historical remote worktrees that no longer exist open a synthetic `/lineage` review context from receipts and commit range instead of pretending current live state is historical.

Historical and active links must declare state scope: `historical_snapshot`, `live_state`, or `compare_historical_to_live`. Active attempts default to live state; completed-run review defaults to compare_historical_to_live; `worktree-to-worktree` review has no implicit second target and the user must choose one. Compare target defaults are deterministic: active attempt uses attempt baseline commit; blocked `dirty_worktree` uses the last safe reusable baseline; blocked `worktree_conflict` uses merge target branch tip plus conflict file set; retry from safe point uses `safe_point_id`; fresh attempt uses `Base branch`; historical run review compares run commit range against recorded base commit. The `compare_target` source must always be labeled.

Orchestrator multi-active-worktree presentation uses `primary_active_context` and `additional_active_context_count`. The primary context is selected by explicit user-selected run/node/attempt, then most recently state-changed running attempt, then stable fallback. `Current Task` shows the primary context plus `+N parallel contexts`; the drilldown lists every active-worktree with `run_id + node_id + attempt_id`, `/tier`, worktree, branch, status, and blocked or `/conflict` indicator. Blocked CTA cards are episode-specific and remain tied to the blocked episode; `blocked_preserved` and safe-point-preserved worktrees stay reserved until explicit `/release`.

`Progress > Current Task` and `Progress > Orchestrator Status` consume the same first-class SCM status strip instead of assistant-chat-local worktree summaries. The status payload includes `repo_id`, `repo_root`, `worktree_id`, `worktree_path`, compatibility `worktree_id/path`, `worktree_status`, `branch_name`, `base_branch`, `upstream_remote`, `upstream_branch`, `head_commit_oid`, `baseline_commit_oid`, optional `compare_target`, `ahead_count`, `behind_count`, `dirty_file_count`, `conflict_file_count`, `owner_run_id`, `owner_node_id`, compatibility `owner_tier_id`, `owner_attempt_id`, optional `safe_point_id`, `requires_safe_point_restore`, and optional `active_git_operation`; `dirty_worktree`, `/worktree`, and `/conflict` deep-link end-to-end through Source Control and Orchestrator owner routes.

Lifecycle state names are reserved: `reserved`, `active`, `blocked_preserved`, `released`, and `Orphaned` or `orphaned`. Attachment and `/detachment` happen at run start, attempt start/end, blocked episode start/end, safe-point restore, replan, abort, restart recovery, and manual recover/prune/reuse (`/prune/reuse`). Manual `/prune/reuse` remains blocked while ownership is active or blocked_preserved unless override policy records the ownership change.

User-facing copy distinguishes action nouns across Source Control, GitHub Actions, Docker publish, Kubernetes, and Orchestrator: `Rebind`, `Start fresh`, retry, resume, recover, and restore are not interchangeable. Receipt nouns are also reserved: `Receipt`, `History`, `Evidence`, `Log`, and `Ledger` are different surfaces or artifacts, and a receipt row must not become generic History or Evidence by loose copy drift. Worktree glossary terms `Repo`, `Worktree`, `Branch`, `Base branch`, `Compare target`, `Owner`, `Lineage`, `Safe point`, `Restore point`, and `Orphaned` are reserved because each can have both Git-native and Puppet-Master-specific meaning.

Blocked-state copy has a `reason-family` translation layer with structured-copy templates and typed placeholders for target identity, missing capability, blocked step, recovery action, and timestamp. Canonical families include approval-gated, policy-blocked, preflight-blocked, auth-blocked, governance-blocked, and stale-data-blocked. Docker and `/Kubernetes` availability copy distinguishes Unsupported, Unavailable, Not configured, Unauthorized, Unreachable, Degraded, and Partial capability, and every `/explainer` derives from canonical reason/state keys instead of ad hoc English.

SCM `/receipt` lineage records include worktree path/worktree id, branch, commit range, base branch, PR number and URL when applicable, GitHub Actions run/job/step refs, preview/container/compose runtime refs, image tag/digest/registry host, template repo/push status, and Kubernetes context/namespace/workload/rollout identity. This receipt data supports historical review, `Current Branch`, `/branches/background`, and owner-surface CTAs without turning the Worktree doc into the owner for GitHub Actions, Docker Manager, or Kubernetes behavior.
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
| Exit 128 + signal (e.g., SIGKILL, SIGTERM) | fatal | fail immediately (`/fail-immediately`); report the signal in the error |
| Exit 128 (ambiguous) | fatal | fail the operation; log full stderr for diagnosis |
| Lock contention (`index.lock` exists) | retryable | retry once after 500ms backoff; fail on second attempt |
| Network timeout (fetch/push/clone) | retryable | retry with exponential backoff (max 3 attempts, base 1s) |
| Authentication failure (exit 128 with auth error on stderr) | fatal | fail immediately; surface credential refresh guidance |
| Disk full / permission denied | fatal | fail immediately; surface the OS-level error |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md

Rules:
- Retryable scenarios MUST use bounded retry with backoff. Maximum 3 retry attempts for network operations; maximum 1 retry for lock contention.
- Fatal scenarios MUST NOT be retried or skipped (`skip-silently-never`). The operation fails with a structured error that includes the git command, exit code, and stderr content.
- The `nothing to commit` case is the only exit-1 scenario that is not treated as a hard error. All other non-zero exits follow the hard-error rule from §3.0.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md

Every git subprocess that mutates or validates PM-managed state MUST treat a non-zero exit status as a hard error.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md

The pre-write and post-stage git checks are session-scoped to the active PM-managed worktree. FileSafe snapshots and recoverable backups must align with `FileSafe.md#11.1.2a` and this hard-error rule rather than masking a failed `git status --porcelain` or git mutation subprocess.

Required behavior:
- after `git add`, run a post-add `git status --porcelain` verification before accepting any `/commit-sensitive` staged-state transition
- do not silently swallow non-zero exits from `git add`, `git commit`, `git stash`, `git checkout`, or equivalent `/commit/stash/checkout` mutation-sensitive commands
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
- **Fix:** Either: (1) Wire `naming_pattern` into branch name generation (document format and placeholders, e.g. `{node}`, `{id}`), or (2) keep the field hidden/inert until branch-generation support lands and document that branch names follow the strategy (ph-/tk-/st-/release/...) only.

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

### 4.2 GUI improvements

Rules:
- The GUI model stays `worktree-first` when it hands off to Source Control.
- Cross-references now point at `Plans/Orchestrator_Page.md#Source Control boundary` rather than the stale numbered anchor.

### 4.0 Worktree topology and safe actions

This feature-by-feature wiring contract for `Worktree topology view` makes worktrees first-class instead of hidden plumbing. Its primary placement is `Source Control > Worktrees`; it may also expose an optional graph overlay badge in `Source Control > Graph`. The panel state includes selected worktree, sort mode, `hide-stale` toggle, ownership display mode, and persisted worktree panel filters. Topology `/events/storage` behavior is backed by the worktree ownership projection and by `cmd.git.worktree.list/select/open/compare/prune/recover`; every active run, lane, or package with a worktree binding must resolve to a worktree row and deep link. If the repo is not git or worktrees are unsupported, the panel still shows repo state with an explicit disabled reason. To avoid noise on projects with many short-lived worktrees, defaults collapse stale groups and apply ownership filters.

`Safe worktree actions` and `Worktree safety / ownership` prevent prune/remove/reuse mistakes when runs or safe points still depend on a worktree. The entrypoints live in the worktree row action menu and Orchestrator blocked cards. State includes optional confirmation strictness, `locked`, `prunable`, `dirty`, and `repairable` flags, plus `show-unsafe-actions` expert mode, but unsafe actions remain disabled with explanation rather than hidden when lineage says they are not allowed. Safe-action `/events/storage` uses `cmd.git.worktree.recover/prune/remove/reuse`, carries blocked reason payloads using `dirty_worktree` and `worktree_conflict`, and makes blocked rows/recovery cards target the exact worktree/safe-point lineage. Worktree `/remove/repair`, `/move/delete`, and git worktree repair flows must preserve per-worktree `HEAD` and `index` context; the UI must distinguish `blocked by policy` from `blocked by unresolved lineage`; over-aggressive safety and over-automation are UX risks, but run/safe point dependencies take precedence.

Source Control mirrors Orchestrator's SCM lineage acceptance details for worktree recovery. A blocked worktree row must show the exact worktree, affected files summary, safe-point relation, and recovery target from the canonical blocked payload, and any partial lineage badge must mean the repo/worktree/branch/head or receipt chain is incomplete rather than hidden or synthesized.

### 4.1 Review mode and Conflict assistant

Source Control owns two GUI task modes above the ordinary staged/unstaged diff list.

- `History / graph / worktree parity` and `Branch/worktree lineage graph` go beyond a plain commit graph by showing which worktree, run, or branch owns each branch tip in `Source Control > Graph`. Required GUI state includes branch filter, worktree overlay toggle, ahead`/behind/diverged` badges, compact vs expanded graph density, and persisted graph viewport/filter state. Required `/events/storage` behavior: `cmd.source_control.graph.focus/filter/layout`, `cmd.source_control.graph_focus`, and `cmd.source_control.graph_filter` compatibility aliases resolve to `cmd.source_control.graph.focus`, `cmd.source_control.graph.filter`, and `cmd.source_control.graph.layout`; the `/filter/layout` state is project scoped. Orchestrator linkage lets graph nodes deep-link to run history and lets run history focus a graph node when a `/commit` belongs to a known run. `/disabled` fallback degrades to branch list/history when repo graph parsing fails. `/tradeoffs`: dense graphs must balance rendering density and performance on large repos.
- `AI commit batching` suggests logical commit groupings and draft messages from diff clusters in `Source Control > Changes` near staged and `/unstaged` groups. Required `/settings` include auto-suggest on/off, batching aggressiveness, message tone/style, and cross-directory grouping. `cmd.source_control.suggest_commit_batches` produces advisory candidate batches only; no grouping, staging, or `/commit` is canonical until the user accepts it. Accepted batches preserve run/tier attribution in receipts where available, while manual staging/commit remains the canonical fallback. `/tradeoffs`: incorrect grouping can damage history, so batching is advisory, reviewable, and never automatic.
- External Source Control UX baselines reinforce dense owner-surface behavior without making the panel side-panel-only. JetBrains Git log and conflict-resolution references validate roomy history/log tabs, strong filtering, and a dedicated conflict-resolution surface; GitLens and `/GitKraken` validate commit-graph-centric workflows, `/compare` discovery, and worktree compare affordances. These references justify letting dense Source Control `/resources` expand beyond a cramped side panel when needed.
- `Review mode` compares a worktree against a base branch, another worktree, a PR target, or a selected commit range in a roomy diff-centric Source Control GUI lens. `Source Control > History` and `Worktrees` both expose `Open Review Mode`; dense compares may take over the editor-area while staying a Source Control task mode rather than ordinary file editing. Required `/settings` include left/right compare targets, preferred diff mode, ignore-whitespace, file filter, collapse-unchanged, generated-file visibility, and review-comments/notes local state. Required `/events/storage` behavior: `cmd.source_control.review.open/swap/filter` compatibility aliases resolve to `cmd.source_control.open_review`, `cmd.source_control.set_compare_target`, and `cmd.source_control.toggle_generated_filter`; these commands persist the last compare target and filter choices per-project without turning review notes into canonical history before user acceptance. Run receipts and blocked cards open directly into a compare target when review is the remediation step. `/disabled` fallback: when the compare target is gone, pruned, or otherwise a `stale-target`, open the nearest valid baseline when one exists, explain the stale-target downgrade, and offer alternate pivots. `/tradeoffs`: direct comparison between worktrees requires robust baseline selection so the GUI does not present confusing or misleading diffs.
- `Conflict assistant` turns merge, `/rebase/worktree`, and worktree conflict-caused blocked episodes into a guided repair flow instead of leaving users only with raw file markers. The primary placement is the `Source Control > Changes` conflict group plus a dedicated conflict flyout; blocked worktree cards should include affected file list, safe-point context, and an `Open Conflict Assistant` action into the same surface. Required `/settings` include conflict presentation mode, show base/origin annotations, open external merge tool preference, AI assist enabled/disabled, and an `auto-open` first conflicted file toggle. Required `/event/storage` behavior: `cmd.source_control.open_conflict`, `cmd.source_control.open_merge_editor`, `cmd.source_control.resolve_conflict_side`, and `cmd.source_control.mark_conflict_resolved` persist per-project presentation preference, not conflict content; resolution events and blocked-state handoff outcomes are recorded separately. `/disabled` fallback: if the structured merge view cannot load, show the file list, textual diff/conflict markers, and an explicit warning rather than hiding the conflict. `/tradeoffs`: assistant guidance must explain choices and propose repairs, but it must not silently resolve semantic conflicts or auto-write a side selection without explicit approval.
- Source Control owns the canonical compare/diff identity contract for reuse across chat, file surfaces, and Source Control. Hunk-level actions are explicit review commands: `stage`, `unstage`, `discard`, `apply`, `expand/collapse`, and conflict-resolution actions. Grouped undo/redo for diff-driven mutations must explain whether a change is buffer-local, restore-history, or git/source-control history. Search-within-diff is scoped to the active compare identity, and diff heat-map/change-marker behavior is a review projection over that same identity.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Orchestrator_Page.md#Source Control boundary, ContractName:Plans/storage-plan.md

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
- **Granularity** in config (Phase / Task / Subtask / Iteration / None) is a reserved design for "at which node level do we create a new branch" (e.g. None = one branch for all; Phase = one branch per phase; Task = one per task). It is not an active runtime contract until the plan chooses one of two dispositions: (1) implement granularity so that branch creation is gated by node level (e.g. only create branch when node_type matches granularity), or (2) leave granularity as future-facing and only wire BranchStrategy in the GUI (Main only / Feature / Release). The plan should state: "For Phase 4 GUI, decide whether to implement granularity-driven branch creation or only expose BranchStrategy; if only strategy, align granularity UI label with 'informational' or keep it hidden until the contract is active."

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
## Runtime Worktree Conflict Canonical Alignment (2026-03-09)


This addendum is retained as historical context only.

Canonical worktree-conflict and dirty-worktree runtime rules now live in `## Worktree Conflict and Dirty-Worktree Runtime Alignment`.

Canonical blocked reasons for this domain are `worktree_conflict` and `dirty_worktree`.

Required rules:
- blocked payloads use canonical blocked fields and ordered `allowed_action_ids[]`
- recovery may require safe-point restore when the runtime marks `requires_safe_point_restore = true`
- clearing the underlying worktree issue resolves the blocked prerequisite; it does not fabricate a new failure class
- worktree conflict resolution must preserve lineage to the blocked episode and any affected safe point

ContractRef: Plans/Orchestrator_Page.md#Source Control boundary

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

## Worktree Lane Allocation and Source Control Reconciliation

`Plans/WorktreeGitImprovement.md`, `Plans/orchestrator-subagent-integration.md`, and `Plans/Crosswalk.md` converge on `/worktree` and `/worktrees` ownership, but the worktree owner must make the allocation strategy concrete. Worktree allocation is package/lane based: Orchestrator owns the active run's lane-pool truth, while Source Control owns repo/worktree execution and inspection operations. The old run/tier/subtask, branch-per-run, subtask-per-worktree, wizard-centric, /iteration-scoped, and /seam-aware SCM assumptions are compatibility context only until they map to package-based lane pools, shared Source Control visibility, and per hosted side-effect effective-account recording.

Source Control is the primary operational surface for worktree inventory and actions, and Orchestrator consumes worktree identity, blocked state, and lineage. `dirty_worktree` and `worktree_conflict` route back to Source Control with the correct worktree in scope; historical runs preserve historical worktree references after prune `/remove`. Orchestrator records which package owns which lane pool, which lane is baseline, active, suspect `/restoring`, historical, or `/retired`, why a lane is blocked, weakly integrated, or cleanup-eligible, and which action is allowed from runtime `/governance` state. Source Control owns open, compare, diff `/history/graph`, recover, archive, prune, and remove when policy permits.

`Lane` is the primary operational object in Orchestrator, and `Worktree` remains the concrete filesystem `/Git` backing for a lane instance. A lane may preserve historical identity after the live worktree has been cleaned up, archived, or removed. Source Control can list worktrees directly, but it must also expose `/package` lane ownership and lifecycle state when known. Worktree rows therefore show owning package, owning lane, run reference when relevant, lane lifecycle state, worktree lifecycle state, and blocked `/recovery` state, treating `lane lifecycle` and `worktree lifecycle` as related but non-identical.

The tier-era low-level ownership model is no longer canonical. Examples such as `get_tier_worktree(tier_id)`, worktree paths and branches keyed by `tier_id`, recovery or `/conflict` persistence phrased in `tier_id`, future crew `/message` examples, and `tier_type` / `worker_provider` / `worker_model` / `verifier_provider` / `verifier_model` / `hitl_request_id` in base `GraphNode` and `GraphNodeUI` contracts must reconcile to lane, node, attempt, runtime-lineage, and worktree identity. Worktree coordination examples must stop carrying `tier_id` as the operational identity anchor.

Parallel execution must not confuse snapshot-based single-context concurrency with multi-lane worktree isolation. `newfeatures.md` background agent queues and snapshot-based recovery are single-context mechanisms unless they allocate isolated lanes with dedicated worktrees. The Source Control view treats `Lane` as ownership `/context` metadata for a worktree, not a replacement for worktree as the primary Source Control object.

Terms that drift together must remain separately defined: `lane` vs `worktree`, safe point vs restore point, `historical` vs `superseded`, `acknowledged` vs `dismissed` vs `resolved`, and `history` vs `ledger`. These pairs are drift-prone unless package-level worktree state is visible and navigable. Orchestrator continues to present lane state and shows worktree status in context, while Source Control remains the concrete filesystem/Git owner.

Cross-surface openings must not pollute base route identity. `Orchestrator_Page.md` / `Orchestrator_Page.md` Evidence pivots into workflow `/Docker/Kubernetes` detail through an explicit receipt `/attempt` join path. `line` / `range` belong to path `/document-open` specialization rather than the canonical base route object, and `wizard_step` is sub-selection in serialized `deep-link` detail or a narrower subtarget contract.

Historical audit anchors stay visible only as owner references for the worktree allocation defect: `cov-526`, `obl-222`, `Plans/Crosswalk.md:88-94`, `Plans/WorktreeGitImprovement.md:62-66`, `Plans/WorktreeGitImprovement.md:78-80`, `Plans/orchestrator-subagent-integration.md:28-41`, `/Crosswalk.md:88-94`, `/WorktreeGitImprovement.md:62-66`, `/WorktreeGitImprovement.md:78-80`, and `/orchestrator-subagent-integration.md:28-41`. The rewrite-aligned fix replaces tier-based branch naming with package/lane allocation, contamination, /reuse/cleanup, and /subtask-native compatibility handled as explicit lifecycle policy. Formal state vocabulary distinguishes `lane lifecycle`, `worktree lifecycle`, `worktree filesystem state`, and `runtime blocked/recovery state`.

Cross-lane reuse is not a best-effort cleanup path. A `safe-point` restore may make a suspect worktree eligible for `cross-lane` reuse only after contamination checks pass; `contamination-triggered` shrink can reduce a package's lane-pool, and flat `provider-only` limits never replace `per-package` lane ceilings. `package-based` pools are the SCM-facing source of truth, so `tier-keyed` path or registry assumptions are compatibility inputs until migrated to `lane-named` worktrees.

Source Control row ownership is explicit even when the UI stays worktree-first. Legacy `owner run/tier` or `/tier` labels are compatibility, while current rows expose owner run, `/package/lane`, `/lane`, and `/package/node-first` execution-context metadata beside `worktree` identity. `Feature Seam`, `Work Package`, `Lane`, and `Worktree` stay user-visible as an object stack, but `tier_id` must not propagate through future crew `/message` examples or `/worktree` coordination as the canonical ownership key.

Historical retry lineage can preserve exact audit labels without turning them into ownership. `Decision_Log` records may keep `agent-314` as the failed attempt and `agent-331` as the canonical successful run, while worktree state still keys recovery by lane, node, attempt, safe point, and runtime lineage.

The lane-pool model is end-to-end across Orchestrator, Source Control, recovery policy, and SCM. `package-based` lane-pool allocation unifies former per-run branches, per-subtask worktrees, branch-per-run flows, `/tier`, and `/PR` assumptions without treating those compatibility patterns as current ownership.

Action ownership remains split: Orchestrator may inspect lane state, request restore, request graph patch, request reopen `/revocation`, and open a lane in Source Control; Source Control owns open worktree, compare against baseline `/target`, inspect changed files and `/history/graph`, recover orphaned worktree, archive, prune `/remove`, and cleanup current `/all` eligible worktrees.

Cleanup and route identity stay explicit. Bulk `/archive/remove` operations are preview-heavy, not one-button destructive `/worktree` actions; `Orchestrator_Page.md` / `Orchestrator_Page` retry posture remains richer than a fake `one-button` retry. `shell-tab` and `panel-subview` identities stay outside the base route contract.

Allocation strategy is `/owned` by package/lane policy for scale `/manageability`: it may allocate per-node only when the effective scope requires it, while `package-based` worktrees remain the default scale posture.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/WorktreeGitImprovement.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### W-002 - Worktree Git Plan Authority

```yaml
plan_unit_id: W-002
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Plans/WorktreeGitImprovement.md owns worktree and Git owner-section requirements, plan-only implementation status, rewrite alignment, SSOT compliance, and the source-control/worktree/lane coverage blocker headings for this plan.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- W-002 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: owner_doc_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0004
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0007
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0008
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0009
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0010
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0011
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0012
preserved_exact_tokens:
- Worktree & Git Improvement -- Implementation Plan
- Canonical owner-section requirements
- PLAN DOCUMENT ONLY
- implementation-ready
- patch/apply/verify/rollback pipeline
- SSOT references (DRY)
- Spec_Lock.json
- DRY_Rules.md
- Glossary.md
- Decision_Policy.md
- Progression_Gates.md
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: SchemaID:Spec_Lock.json, ContractName:Plans/DRY_Rules.md, ContractName:Plans/Glossary.md, PolicyRule:Decision_Policy.md, Gate:GATE-002'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/DRY_Rules.md
- Plans/Glossary.md
- Plans/Decision_Policy.md
- Plans/Progression_Gates.md
```

### W-003 - Summary Goals Config Blocker And GUI Copy

```yaml
plan_unit_id: W-003
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Worktree/Git goals require reliable worktrees, branch naming SSOT, wired GUI settings, Phase 1 Option B config wiring first, and Expert/ELI5 copy selected through app-level Interaction Mode rather than chat-level Chat ELI5.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
unblocks: []
acceptance_criteria:
- W-003 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: implementation_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0010
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0015
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0016
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0017
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0018
preserved_exact_tokens:
- Worktrees
- Git
- GUI
- enable_parallel
- GuiConfig
- PuppetMasterConfig
- Option B
- Interaction Mode (Expert/ELI5)
- Chat ELI5
- FinalGUISpec §7.4.0
- MiscPlan §9.1.18
negative_constraints:
- Do not couple app-level Interaction Mode Expert/ELI5 copy to chat-level Chat ELI5.
preserved_contractrefs:
- 'ContractRef: SchemaID:Spec_Lock.json, ContractName:Plans/DRY_Rules.md, ContractName:Plans/Glossary.md, PolicyRule:Decision_Policy.md, Gate:GATE-002'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/FinalGUISpec.md
- Plans/MiscPlan.md
```

### W-004 - Worktree Path Guard Rules

```yaml
plan_unit_id: W-004
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Worktree-relative paths must be realpath-normalized, fail closed on resolution failure, validated against canonical roots, and use no-follow traversal by default unless an explicit Follow symlinks setting revalidates the resolved target.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
unblocks: []
acceptance_criteria:
- W-004 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: path_safety_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0021
preserved_exact_tokens:
- realpath()
- starts_with(project_root)
- starts_with(cache_root)
- --no-follow
- no-follow
- Follow symlinks
- working_directory
- FileSafe `check_file_write`
negative_constraints:
- If realpath() fails on a worktree-relative path, the operation MUST be denied.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md'
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Architecture_Invariants.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/Permissions_System.md
- Plans/FileSafe.md
- Plans/Architecture_Invariants.md
```

### W-005 - Assistant Worktree Command Ownership

```yaml
plan_unit_id: W-005
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Chat worktree create/remove delegates to WorktreeManager; worktree creation/removal is user or system infrastructure rather than agent-tool-gated raw bash, and git-aware tools auto-scope to the worktree through process cwd.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-004
unblocks: []
acceptance_criteria:
- W-005 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: command_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0022
preserved_exact_tokens:
- cmd.chat.worktree.create
- cmd.chat.worktree.remove
- WorktreeManager
- raw `bash`
- git worktree add
- git status
- cwd
negative_constraints:
- Agents do not run raw bash git worktree add or removal commands for this contract.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/assistant-chat-design.md
```

### W-006 - Source Control Compare And Row UX

```yaml
plan_unit_id: W-006
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Assistant/worktree row compare actions open committed branch-to-branch review through cmd.git.open_diff with compare_origin set to the base branch ref, and orch-owned worktree rows show Open Lane rather than Open Thread.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-005
unblocks: []
acceptance_criteria:
- W-006 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: source_control_ui_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0022
preserved_exact_tokens:
- Compare buttons
- cmd.git.open_diff
- compare_origin
- Open Lane
- Open Thread
- Source Control rows
- orch-owned worktrees
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/UI_Command_Catalog.md
- Plans/FinalGUISpec.md
```

### W-007 - Worktree Branch Creation Policy

```yaml
plan_unit_id: W-007
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Worktree creation uses the configured base branch or explicit ref and handles existing branches by verifying refs and reusing safe existing branches without unsafe deletion.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-011
unblocks: []
acceptance_criteria:
- W-007 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: worktree_creation_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0023
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0027
preserved_exact_tokens:
- config.branching.base_branch
- git worktree add -b
- git worktree add <path> <branch>
- git rev-parse --verify refs/heads/{branch}
- 'fatal: A branch named'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-008 - Restart Rehydration And PR Head Recovery

```yaml
plan_unit_id: W-008
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: After restart, worktree resolution and PR head branch resolution recover from durable or listed worktrees instead of falling back to the main repo path or main repo branch.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-013
unblocks: []
acceptance_criteria:
- W-008 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: restart_rehydration
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0024
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0037
preserved_exact_tokens:
- active_worktrees
- get_node_worktree(node_id)
- worktree_manager.list_worktrees()
- worktree_manager.get_worktree_path(node_id)
- create_node_pr
- head_branch
- main repo branch
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-009 - Conflict Worktree Preservation

```yaml
plan_unit_id: W-009
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Merge-conflict worktrees must not be silently removed or overwritten on rerun; reuse remains blocked until resolution or explicit discard preserves user-visible conflict state.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-008
unblocks: []
acceptance_criteria:
- W-009 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: conflict_preservation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0025
preserved_exact_tokens:
- cleanup_subtask_worktree
- active_worktrees
- create_subtask_worktree
- create_worktree
- merge conflict
- conflicting worktree
negative_constraints:
- Do not destroy conflict state on rerun by silently removing an existing conflicting worktree.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-010 - Conflict Worktree User Affordance

```yaml
plan_unit_id: W-010
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Conflict state may surface the worktree path or status and a Resolve worktree conflicts action for user repair or confirmed removal.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-009
unblocks: []
acceptance_criteria:
- W-010 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: conflict_ui_affordance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0025
preserved_exact_tokens:
- toast
- status
- Resolve worktree conflicts
- open in editor
- remove after confirmation
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/FinalGUISpec.md
```

### W-011 - Node And Branch Sanitization

```yaml
plan_unit_id: W-011
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Node IDs used as path components and branch IDs used as Git refs must be sanitized with shared/ref-safe helpers before join or branch creation.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-004
unblocks: []
acceptance_criteria:
- W-011 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: identity_sanitization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0026
preserved_exact_tokens:
- node_id
- worktree_base.join(node_id)
- subtask_id.replace
- ..
- path separators
- BranchStrategyManager::sanitize_id
- invalid ref characters
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-012 - Detached Head And Merge Target Validation

```yaml
plan_unit_id: W-012
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Detached worktrees and missing merge target branches must be detected and handled with clear skip, create, or error behavior rather than empty-branch merges or blind checkout failure.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-007
unblocks: []
acceptance_criteria:
- W-012 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: merge_validation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0028
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0038
preserved_exact_tokens:
- Detached HEAD
- branch refs/heads
- git merge ""
- source_branch is empty
- target_branch
- git checkout target_branch
- base branch is missing
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-013 - Lane Worktree Lifecycle Handshake

```yaml
plan_unit_id: W-013
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Lanes own worktrees through explicit Source Control allocation, Orchestrator records the handshake, and canonical lane/worktree records drive reuse, cleanup, retry, and recovery.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
unblocks: []
acceptance_criteria:
- W-013 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: lane_worktree_handshake
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0030
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0031
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0033
preserved_exact_tokens:
- lane_id
- run_id
- worktree_id
- lifecycle state
- blocked/recovery state
- Source Control MUST confirm allocation
- Orchestrator records the handshake
- canonical lane/worktree records
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Stale worktrees allocated but not reclaimed are eligible for cleanup via storage housekeeping.
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/Orchestrator_Page.md
```

### W-014 - Worktree Row Ownership Presentation

```yaml
plan_unit_id: W-014
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Worktree rows show owning package, lane, run, lifecycle, and blocked/recovery state while Source Control actions report results back through canonical lane/worktree records.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-013
unblocks: []
acceptance_criteria:
- W-014 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: row_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0033
preserved_exact_tokens:
- owning package reference
- lane
- run
- lifecycle state
- blocked/recovery state
- worktree rows
- Source Control actions
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/FinalGUISpec.md
- Plans/Orchestrator_Page.md
```

### W-015 - Allocation Strategy And Cleanup Lineage

```yaml
plan_unit_id: W-015
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Worktree allocation follows lane/effective-scope provider policy; contamination, dirty state, conflict state, blocked recovery, or lineage mismatch disqualifies reuse, and cleanup waits for grace-period and file-lock checks.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-013
unblocks: []
acceptance_criteria:
- W-015 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: allocation_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0032
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0034
preserved_exact_tokens:
- delegated subagent
- overseer
- node
- work package
- seam
- run
- contamination
- dirty-state
- conflict-state
- grace_period_ms
- worktree.deleted
- worktree.created
negative_constraints:
- worktree.deleted may be emitted only after the grace-period and file-lock checks pass.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-016 - Runtime Lineage And Legacy State Migration

```yaml
plan_unit_id: W-016
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Worktree transfer, restore, retry, and fresh-attempt payloads carry explicit SCM targeting and never silently inherit prior ownership; legacy git_panel/* state is one-time migration input only.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-013
- W-015
unblocks: []
acceptance_criteria:
- W-016 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: runtime_lineage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0035
preserved_exact_tokens:
- runtime lineage event
- cmd.runtime.restore_safe_point_then_retry
- repo_id
- worktree_id
- baseline_target
- safe_point
- historical_commit
- worktree_head
- /fresh-attempt
- git_panel/*
- source_control.project_state.{project_id}
negative_constraints:
- Manual prune/remove stays forbidden while the worktree is active or blocked_preserved unless the explicit override policy permits it and records the override.
- No new build writes both legacy and canonical keys.
preserved_contractrefs: []
compatibility_only_notes:
- Legacy git_panel/* and git_panel state is one-time migration input into source_control.project_state.{project_id} only.
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/storage-plan.md
- Plans/Run_Modes.md
```

### W-017 - Worktree Identity And Remote Context

```yaml
plan_unit_id: W-017
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Source Control owns live SCM truth with stable project_id/repo_id/worktree_id; remote or SSH and historical worktrees keep correct live, historical, or compare contexts with deterministic labels.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-013
unblocks: []
acceptance_criteria:
- W-017 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: identity_context
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0036
preserved_exact_tokens:
- project_id/repo_id/worktree_id
- repo_id
- worktree_id
- worktree_path
- /recovered
- /SSH
- historical_snapshot
- live_state
- compare_historical_to_live
- compare_target
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Health is a read-only diagnostic and validation mirror unless a repair utility deep-links back into Source Control.
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/storage-plan.md
- Plans/FinalGUISpec.md
```

### W-018 - Multi Active SCM Status Strip

```yaml
plan_unit_id: W-018
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Orchestrator and Progress surfaces consume a first-class SCM status strip with primary and additional active contexts, lifecycle states, blocked episode CTAs, and exact deep-link payload fields.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-017
unblocks: []
acceptance_criteria:
- W-018 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: scm_status_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0036
preserved_exact_tokens:
- primary_active_context
- additional_active_context_count
- +N parallel contexts
- Progress > Current Task
- Progress > Orchestrator Status
- worktree_id/path
- owner_tier_id
- blocked_preserved
- safe-point-preserved
- requires_safe_point_restore
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Compatibility worktree_id/path and owner_tier_id may appear only as compatibility fields over canonical IDs.
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/Orchestrator_Page.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
```

### W-019 - Copy Reason Families And Receipt Lineage

```yaml
plan_unit_id: W-019
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: User-facing action nouns, receipt nouns, worktree glossary terms, blocked reason-family templates, and SCM receipt lineage remain distinct and typed across Source Control, Orchestrator, GitHub Actions, Docker, Kubernetes, and history views.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-017
- W-018
unblocks: []
acceptance_criteria:
- W-019 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: copy_and_receipt_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0036
preserved_exact_tokens:
- Rebind
- Start fresh
- retry
- resume
- recover
- restore
- Receipt
- History
- Evidence
- Log
- Ledger
- reason-family
- dirty_worktree
- worktree_conflict
- SCM `/receipt` lineage
negative_constraints:
- Rebind, Start fresh, retry, resume, recover, and restore are not interchangeable.
- A receipt row must not become generic History or Evidence by loose copy drift.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/Glossary.md
- Plans/Runtime_Artifacts_Panel.md
```

### W-020 - Worktree Docs Doctor And Optional Path Revalidation

```yaml
plan_unit_id: W-020
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Worktree state files are documented, Doctor adds worktree checks and orphan detection, and optional path/list revalidation can remove stale active_worktrees before use.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-023
unblocks: []
acceptance_criteria:
- W-020 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: diagnostic_docs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0039
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0040
preserved_exact_tokens:
- STATE_FILES.md
- .puppet-master/worktrees
- Doctor
- git worktree list
- detect_orphaned_worktrees()
- active_worktrees
- IterationContext
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-021 - Git Exit Classification And Retry Policy

```yaml
plan_unit_id: W-021
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Git exit scenarios map to success, informational, retryable, or fatal outcomes, with bounded retry only for network timeout and lock contention cases allowed by the table.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
unblocks: []
acceptance_criteria:
- W-021 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: git_exit_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0043
preserved_exact_tokens:
- Exit 0
- Exit 1 with `nothing to commit`
- Exit 128
- index.lock
- retry once after 500ms backoff
- exponential backoff
- skip-silently-never
negative_constraints:
- Fatal scenarios MUST NOT be retried or skipped (skip-silently-never).
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileSafe.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md'
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/Executor_Protocol.md
- Plans/FileSafe.md
- Plans/storage-plan.md
- Plans/Run_Modes.md
- Plans/Architecture_Invariants.md
```

### W-022 - Git Mutation Hard Error Verification

```yaml
plan_unit_id: W-022
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Mutating or validation-sensitive git commands treat non-zero as hard error except nothing to commit, and verify staged state after git add before accepting commit-sensitive transitions.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-021
unblocks: []
acceptance_criteria:
- W-022 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: commit_sensitive_verification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0043
preserved_exact_tokens:
- /commit-sensitive
- git status --porcelain
- git add
- git commit
- git stash
- git checkout
- FileSafe.md#11.1.2a
- nothing to commit
negative_constraints:
- Do not silently swallow non-zero exits from git add, git commit, git stash, git checkout, or equivalent mutation-sensitive commands.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes:
- After git add, run a post-add git status --porcelain verification before accepting any commit-sensitive staged-state transition.
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/FileSafe.md
- Plans/Executor_Protocol.md
- Plans/storage-plan.md
```

### W-023 - Shared Git Binary Resolution

```yaml
plan_unit_id: W-023
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: GitManager and Doctor resolve git through the same helper instead of allowing PATH-only runtime behavior to diverge from Doctor fallback resolution.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-021
unblocks: []
acceptance_criteria:
- W-023 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: binary_resolution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0044
preserved_exact_tokens:
- GitManager::run_git_cmd
- Command::new("git")
- GitInstalledCheck
- find_tool_executable("git")
- path_utils
- git_resolver
- 'GitManager::new(repo_path, git_binary: Option<PathBuf>)'
- resolve_git_executable()
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-024 - GitHub PR API Only

```yaml
plan_unit_id: W-024
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: PR creation uses the GitHub HTTPS API and Doctor validates API auth state and required scopes; runtime PR creation must not shell out to a GitHub CLI.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-023
unblocks: []
acceptance_criteria:
- W-024 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: github_api_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0045
preserved_exact_tokens:
- GitHub PR creation (API-only; no GitHub CLI)
- GitHub CLI subprocess
- GitHub HTTPS API
- GitHub_API_Auth_and_Flows.md
- OAuth device-code token
- OS credential store
negative_constraints:
- Runtime PR creation must not shell out to a GitHub CLI.
preserved_contractrefs: []
compatibility_only_notes:
- Legacy GitHub CLI subprocess paths are compatibility-only and not canonical.
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/GitHub_API_Auth_and_Flows.md
```

### W-025 - Git Config And Repo Project Context

```yaml
plan_unit_id: W-025
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Git configured and repo checks consider project-local context, passing when usable global or local identity exists and running repo checks in the active project path when known.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-023
unblocks: []
acceptance_criteria:
- W-025 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: doctor_project_context
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0046
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0047
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0053
preserved_exact_tokens:
- GitConfiguredCheck
- git config --global user.name
- git config user.name
- git config user.email
- GitRepoCheck
- resolve_git_init_dir()
- git rev-parse --git-dir
- project directory
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-026 - Branch Strategy And Naming SSOT

```yaml
plan_unit_id: W-026
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Orchestrator reads branch strategy from config and uses one branch naming implementation rather than duplicating BranchStrategyManager logic.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-007
unblocks: []
acceptance_criteria:
- W-026 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: branch_naming_ssot
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0048
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0049
preserved_exact_tokens:
- BranchStrategy::Feature
- GitConfig
- branch_strategy
- BranchingConfig
- create_node_branch
- BranchStrategyManager::generate_branch_name
- it-
- tk-
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-027 - Naming Pattern GUI Policy

```yaml
plan_unit_id: W-027
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: The GUI-exposed naming_pattern must either be wired into branch generation with documented placeholders or kept hidden/inert until branch-generation support lands.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-026
unblocks: []
acceptance_criteria:
- W-027 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: config_ui_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0050
preserved_exact_tokens:
- naming_pattern
- GUI
- '{node}'
- '{id}'
- ph-
- tk-
- st-
- release
negative_constraints:
- Do not keep an exposed GUI naming_pattern field that runtime branch logic ignores without documented behavior.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/FinalGUISpec.md
```

### W-028 - Commit Message Formatting

```yaml
plan_unit_id: W-028
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: 'Iteration commits use CommitFormatter or equivalent formatting so they match the documented pm: convention.'
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-026
unblocks: []
acceptance_criteria:
- W-028 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: commit_format
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0051
preserved_exact_tokens:
- commit_node_progress
- 'format!("node: {} iteration {} complete"'
- AGENTS.md
- CommitFormatter
- CommitFormatter::format_iteration_commit
- 'pm: [ITERATION]'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- AGENTS.md
```

### W-029 - Git Actions Log Path

```yaml
plan_unit_id: W-029
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Git action logging path and ignore/documentation policy must be made consistent between runtime behavior and REQUIREMENTS.md.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-023
unblocks: []
acceptance_criteria:
- W-029 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: runtime_log_path
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0052
preserved_exact_tokens:
- .puppet-master
- git-actions.log
- .puppet-master/logs/git-actions.log
- REQUIREMENTS.md
- .gitignore
- runtime-only
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-030 - Empty Commit Handling

```yaml
plan_unit_id: W-030
unit_type: optional_requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: The nothing to commit case may be detected and logged as informational without masking real git command failures.
gui_related: false
gui_classification_reason: This unit defines backend/runtime, storage, governance, or command policy rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-021
unblocks: []
acceptance_criteria:
- W-030 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: optional_git_noise_reduction
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0054
preserved_exact_tokens:
- Empty commit handling
- nothing to commit
- debug/info
- real errors
negative_constraints:
- Do not reduce noise by treating genuine git command failure as informational.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
```

### W-031 - Source Control GUI Owner Surface

```yaml
plan_unit_id: W-031
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Source Control remains the Git/worktree owner surface, GUI handoff stays worktree-first, and cross-references use Plans/Orchestrator_Page.md#Source Control boundary rather than stale numbered anchors.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-013
- W-014
unblocks: []
acceptance_criteria:
- W-031 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: source_control_owner_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0055
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0056
preserved_exact_tokens:
- Source Control
- Git/worktree owner surface
- worktree-first
- Plans/Orchestrator_Page.md#Source Control boundary
- stale numbered anchor
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Cross-references now point at Plans/Orchestrator_Page.md#Source Control boundary rather than the stale numbered anchor.
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/Orchestrator_Page.md
- Plans/FinalGUISpec.md
```

### W-032 - Worktree Topology View

```yaml
plan_unit_id: W-032
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Source Control > Worktrees presents first-class worktree topology, filters, graph badge, command-backed events, disabled reasons, and stale-group defaults.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-017
- W-031
unblocks: []
acceptance_criteria:
- W-032 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: worktree_topology_gui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0057
preserved_exact_tokens:
- Worktree topology view
- Source Control > Worktrees
- Source Control > Graph
- hide-stale
- ownership display mode
- cmd.git.worktree.list/select/open/compare/prune/recover
- disabled reason
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Worktree topology view replaces hidden plumbing with first-class Source Control topology.
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
```

### W-033 - Safe Worktree Actions And Recovery Rows

```yaml
plan_unit_id: W-033
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Worktree action menus and blocked cards enforce lineage-safe prune/remove/reuse/recover with disabled explanations and exact recovery targeting.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-016
- W-032
unblocks: []
acceptance_criteria:
- W-033 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: safe_action_gui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0057
preserved_exact_tokens:
- Safe worktree actions
- Worktree safety / ownership
- locked
- prunable
- dirty
- repairable
- show-unsafe-actions
- dirty_worktree
- worktree_conflict
- blocked by policy
- blocked by unresolved lineage
negative_constraints:
- Unsafe actions remain disabled with explanation rather than hidden when lineage says they are not allowed.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/FinalGUISpec.md
- Plans/Orchestrator_Page.md
```

### W-034 - Source Control Graph And AI Commit Batching

```yaml
plan_unit_id: W-034
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Source Control graph parity and AI commit batching are GUI task modes with advisory-only batching, project-scoped aliases/state, and dense owner-surface baselines.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-031
unblocks: []
acceptance_criteria:
- W-034 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: source_control_graph_batching
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0058
preserved_exact_tokens:
- History / graph / worktree parity
- Branch/worktree lineage graph
- Source Control > Graph
- cmd.source_control.graph.focus/filter/layout
- cmd.source_control.graph_focus
- cmd.source_control.graph_filter
- AI commit batching
- cmd.source_control.suggest_commit_batches
- JetBrains Git log
- GitLens
- /GitKraken
negative_constraints:
- AI commit batching is advisory, reviewable, and never automatic.
preserved_contractrefs: []
compatibility_only_notes:
- cmd.source_control.graph_focus and cmd.source_control.graph_filter compatibility aliases resolve to catalog-owned graph focus/filter/layout commands.
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/UI_Command_Catalog.md
- Plans/FinalGUISpec.md
```

### W-035 - Review Mode And Compare Diff Identity

```yaml
plan_unit_id: W-035
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Review mode owns worktree/base/PR/range comparisons, compare settings, stale-target fallback, and reusable hunk-level diff identity across chat, file surfaces, and Source Control.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-017
- W-031
unblocks: []
acceptance_criteria:
- W-035 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: review_compare_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0058
preserved_exact_tokens:
- Review mode
- Open Review Mode
- Source Control > History
- Worktrees
- cmd.source_control.review.open/swap/filter
- cmd.source_control.open_review
- cmd.source_control.set_compare_target
- cmd.source_control.toggle_generated_filter
- stale-target
- stage
- unstage
- discard
- apply
- Search-within-diff
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Orchestrator_Page.md#Source Control boundary, ContractName:Plans/storage-plan.md'
compatibility_only_notes:
- cmd.source_control.review.open/swap/filter compatibility aliases resolve to catalog-owned review commands.
stale_retired_dispositions:
- When compare target is gone, pruned, or stale-target, open nearest valid baseline when one exists and explain the downgrade.
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md
- Plans/Orchestrator_Page.md
- Plans/storage-plan.md
```

### W-036 - Conflict Assistant

```yaml
plan_unit_id: W-036
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Conflict assistant provides guided merge, rebase/worktree, and worktree-conflict repair through Source Control while preserving explicit approval and separate resolution records.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control, Git/worktree GUI, copy, or configuration presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-009
- W-010
- W-033
unblocks: []
acceptance_criteria:
- W-036 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_202
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: conflict_assistant_gui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0058
preserved_exact_tokens:
- Conflict assistant
- Source Control > Changes
- Open Conflict Assistant
- cmd.source_control.open_conflict
- cmd.source_control.open_merge_editor
- cmd.source_control.resolve_conflict_side
- cmd.source_control.mark_conflict_resolved
- auto-open
- structured merge view
negative_constraints:
- Conflict assistant must not silently resolve semantic conflicts or auto-write a side selection without explicit approval.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/WorktreeGitImprovement.md
- Plans/UI_Command_Catalog.md
- Plans/FinalGUISpec.md
```

### W-037 - Config Wiring Option B

```yaml
plan_unit_id: W-037
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Run start builds PuppetMasterConfig from the current in-memory gui_config through Option B, Save only persists next-launch YAML, fallback must not silently start default-only, and redb projection remains later storage-plan scope."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-003
unblocks: []
acceptance_criteria:
- "W-037 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: config_gui_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0059
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0060
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0061
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0062
preserved_exact_tokens:
- "Config Wiring (Prerequisite)"
- "GuiConfig"
- "PuppetMasterConfig"
- "active_config_path()"
- "ConfigManager::discover_with_hint(hint)"
- "YAML-only"
- "projected in redb"
- "Option B"
- "Option A"
- "Option C"
negative_constraints:
- "Option B and Phase 1 config wiring are required for the initial release."
- "Do not require Save before Run for execution-affecting GUI settings."
- "Do not silently fall back to default config if config build/discovery fails."
preserved_contractrefs: []
compatibility_only_notes:
- "redb projection is later storage-plan scope, not initial config-wiring scope."
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/storage-plan.md"
```

### W-038 - Execution-Affecting Projection Completeness

```yaml
plan_unit_id: W-038
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Every GUI setting that changes runtime behavior, including interview execution-affecting settings, HITL node toggles, Git enablement, branching fields, and per-provider concurrency caps, belongs in the run-start config snapshot rather than GUI-only state."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-037
unblocks: []
acceptance_criteria:
- "W-038 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: run_config_snapshot_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0063
preserved_exact_tokens:
- "Execution-affecting projection completeness"
- "enable_parallel_execution"
- "enable_git"
- "branching.base_branch"
- "branching.auto_pr"
- "strategy"
- "granularity"
- "naming_pattern"
- "concurrency.global.per_provider"
- "concurrency.overrides.orchestrator.per_provider"
negative_constraints:
- "Execution-affecting GUI settings must not remain GUI-only."
- "Projection completeness is by behavior class, not ad hoc exception."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/human-in-the-loop.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/orchestrator-subagent-integration.md"
- "Plans/interview-subagent-integration.md"
- "Plans/human-in-the-loop.md"
```

### W-039 - Phase Dependency Order

```yaml
plan_unit_id: W-039
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Implementation sequencing keeps Phase 1 config wiring before worktree/Git phases, Phase 3.1 git binary resolution before worktree merge checks, and Phase 5 tests after Phase 2 and Phase 3 implementation behavior exists."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-037
- W-038
unblocks: []
acceptance_criteria:
- "W-039 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: phase_ordering
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0064
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0065
preserved_exact_tokens:
- "Implementation Checklist"
- "Dependency order"
- "Phase 1 before Phase 2/3"
- "Phase 3.1 before Phase 2.11"
- "Phase 5 after Phase 2/3"
negative_constraints:
- "Do not implement worktree or Git behavior before the run-start config blocker is wired."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-040 - Phase 1 Config Wiring Checklist

```yaml
plan_unit_id: W-040
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Phase 1 wires GUI runtime settings into Dashboard run start without requiring Save, including current_project.path, Enable parallel execution, Git enablement if exposed, branch fields, and failure messaging for config build/discovery."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-037
- W-038
- W-049
unblocks: []
acceptance_criteria:
- "W-040 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: config_wiring_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0066
preserved_exact_tokens:
- "Phase 1: Config wiring (blocker)"
- "current_project.path"
- "Dashboard Run/Start"
- "Enable parallel execution"
- "Enable Git"
- "Auto PR"
- "Save not required"
- "PuppetMasterConfig"
negative_constraints:
- "Run/Start must use the in-memory GUI config even if the user has not clicked Save."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/FinalGUISpec.md"
```

### W-041 - Phase 2 Worktree Checklist

```yaml
plan_unit_id: W-041
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Phase 2 worktree implementation covers active_worktrees state, create/list/existence/merge behavior, conflict recording, state-file persistence, gitignore coverage, Doctor checks, and path-safety enforcement."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-004
- W-007
- W-008
- W-009
- W-011
- W-012
- W-020
- W-023
unblocks: []
acceptance_criteria:
- "W-041 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: worktree_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0067
preserved_exact_tokens:
- "Phase 2: Worktrees"
- "active_worktrees"
- "list_worktrees()"
- "worktree_exists"
- "merge_worktree"
- "worktree-conflicts.json"
- "STATE_FILES.md"
- "Doctor"
- "realpath"
negative_constraints:
- "Worktree operations must not bypass path-safety and existence checks."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-042 - Phase 3 Git Checklist

```yaml
plan_unit_id: W-042
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Phase 3 git implementation resolves the git binary once, performs status/commit/push/PR behavior through canonical helpers and GitHub HTTPS API, formats PM commits, and records git-actions.log entries."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-023
- W-024
- W-025
- W-026
- W-028
- W-029
- W-030
unblocks: []
acceptance_criteria:
- "W-042 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: git_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0068
preserved_exact_tokens:
- "Phase 3: Git"
- "resolve_git_executable()"
- "GitHub HTTPS API"
- "No GitHub CLI"
- "CommitFormatter"
- "pm:"
- "git-actions.log"
- "cmd.git.status"
negative_constraints:
- "Do not shell out to GitHub CLI for PR creation in this scope."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-043 - Phase 4 GUI Checklist

```yaml
plan_unit_id: W-043
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Phase 4 GUI work exposes Settings branch controls, Source Control panels, clean-workspace affordances, PR status/action display, conflict UI, and DRY widget reuse without creating duplicate widget implementations."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-027
- W-031
- W-032
- W-033
- W-034
- W-035
- W-036
unblocks: []
acceptance_criteria:
- "W-043 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: source_control_gui_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0069
preserved_exact_tokens:
- "Phase 4: GUI"
- "Branching tab"
- "Enable Git"
- "Auto PR"
- "Source Control page"
- "Clean workspace now"
- "DRY:WIDGET"
- "conflict UI"
negative_constraints:
- "Do not duplicate reusable Source Control widgets."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/FinalGUISpec.md"
- "Plans/Widget_System.md"
```

### W-044 - Phase 5 Testing And Acceptance

```yaml
plan_unit_id: W-044
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Phase 5 testing and acceptance require config wiring tests, worktree lifecycle tests, Git integration tests, GUI handler tests, and acceptance criteria proving GUI settings affect runtime, worktrees are tracked, and Git/PR operations use configured policy."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-040
- W-041
- W-042
- W-043
unblocks: []
acceptance_criteria:
- "W-044 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: phase_acceptance_validation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0070
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0071
preserved_exact_tokens:
- "Phase 5: Testing and docs"
- "Acceptance criteria (per phase)"
- "Unit/integration tests"
- "GUI smoke tests"
- "Settings branch fields"
- "PR URL/status"
negative_constraints:
- "Phase 5 validation must not run before Phase 2 and Phase 3 behavior exists."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-045 - Phase Source Hints

```yaml
plan_unit_id: W-045
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Implementation source hints route Phase 2 and Phase 3 work to the listed Rust modules, state files, requirement docs, and gitignore updates without making these hints executable build tasks."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-041
- W-042
unblocks: []
acceptance_criteria:
- "W-045 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: implementation_surface_hints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0072
preserved_exact_tokens:
- "File/source hints"
- "src/core/worktree_manager.rs"
- "src/core/git.rs"
- "src/core/github.rs"
- "src/core/config.rs"
- "src-tauri/src/main.rs"
- "STATE_FILES.md"
- "REQUIREMENTS.md"
- ".gitignore"
negative_constraints:
- "File/source hints are plan lineage, not executable build tasks."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-046 - Required Optional Scope Matrix

```yaml
plan_unit_id: W-046
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "The required/optional checklist matrix keeps Phase 1 config wiring, Phase 2 worktrees, Phase 3 local git basics, and Phase 4 essential Source Control GUI mandatory while keeping PR automation, custom merge tools, and advanced GitHub polling optional."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-040
- W-041
- W-042
- W-043
- W-044
unblocks: []
acceptance_criteria:
- "W-046 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: required_optional_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0073
preserved_exact_tokens:
- "Required vs optional"
- "Phase 1"
- "Phase 2"
- "Phase 3"
- "Phase 4"
- "Required"
- "Optional"
- "PR creation via API"
negative_constraints:
- "Optional PR/GitHub enhancements must not block required local worktree and Git behavior."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-047 - Config Schema Migration And Save Timing

```yaml
plan_unit_id: W-047
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Config schema migration introduces a single canonical BranchGranularity enum, migrates legacy strings, exposes push_policy and merge_policy, and discloses Save timing so GUI edits apply to current run start while persistence applies to next launch."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-037
- W-053
unblocks: []
acceptance_criteria:
- "W-047 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: config_schema_migration
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0074
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0075
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0084
preserved_exact_tokens:
- "Config format and schema mismatch"
- "BranchGranularity"
- "Subtask"
- "Iteration"
- "No string-based branching.granularity"
- "config.migrated"
- "push_policy"
- "merge_policy"
- "Save timing tooltip"
negative_constraints:
- "Do not keep string-based branching.granularity as canonical."
- "Do not make Save timing ambiguous for execution-affecting settings."
preserved_contractrefs: []
compatibility_only_notes:
- "Legacy strings such as per_task and per_agent map into canonical BranchGranularity values during migration."
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-048 - Doctor Project Path Context

```yaml
plan_unit_id: W-048
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Doctor config checks accept an optional project path hint so the Doctor view can inspect the selected project rather than only the current process working directory."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-020
- W-025
unblocks: []
acceptance_criteria:
- "W-048 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: doctor_project_hint
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0076
preserved_exact_tokens:
- "Doctor"
- "project path context"
- "run_all(hint: Option<&Path>)"
- "discover_config_path"
- "config check"
- "current_project.path"
negative_constraints:
- "Doctor must not be limited to the process cwd when the GUI has a selected project."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-049 - Dashboard Current Project Config Hint

```yaml
plan_unit_id: W-049
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Dashboard run start passes current_project.path into backend config discovery so spawn_orchestrator_backend builds run config from the selected project rather than defaulting to cwd-only discovery."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-037
- W-048
- W-025
unblocks: []
acceptance_criteria:
- "W-049 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: dashboard_run_config_hint
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0077
preserved_exact_tokens:
- "Backend run does not use current project"
- "Dashboard"
- "spawn_orchestrator_backend"
- "ConfigManager::discover_with_hint(config_hint)"
- "current_project.path"
negative_constraints:
- "Backend run must not ignore current_project.path when a project is selected."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-050 - Conflict Worktree Persistence

```yaml
plan_unit_id: W-050
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Conflict worktree persistence may be in-memory for the initial release, while longer-lived conflict state records use worktree-conflicts.json or canonical storage without conflating conflict cleanup with normal worktree cleanup."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-009
- W-010
- W-033
unblocks: []
acceptance_criteria:
- "W-050 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: conflict_worktree_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0078
preserved_exact_tokens:
- "Merge conflicts"
- "conflict worktrees"
- "worktree-conflicts.json"
- "in-memory-only initial release"
negative_constraints:
- "Conflict worktrees must not be cleaned up as ordinary successful worktrees."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-051 - Git Binary And GitHub API Details

```yaml
plan_unit_id: W-051
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Git binary resolution uses find_tool_executable(\"git\") through resolve_git_executable(), while GitHub PR creation uses HTTPS API rather than GitHub CLI."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-023
- W-024
unblocks: []
acceptance_criteria:
- "W-051 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: git_binary_api_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0079
preserved_exact_tokens:
- "Binary resolution"
- "find_tool_executable(\"git\")"
- "resolve_git_executable()"
- "GitHub HTTPS API"
- "No GitHub CLI"
negative_constraints:
- "Do not duplicate git binary detection."
- "Do not require GitHub CLI for GitHub PR behavior."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-052 - Active Worktree Repopulation

```yaml
plan_unit_id: W-052
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "active_worktrees is repopulated from listed worktree paths by extracting node identity and inserting canonical entries rather than relying on stale in-memory state."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-008
unblocks: []
acceptance_criteria:
- "W-052 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: active_worktree_repopulation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0080
preserved_exact_tokens:
- "active_worktrees repopulation"
- "extract_node_id(&path)"
- "active_worktrees.insert"
- "list_worktrees"
negative_constraints:
- "Do not rely solely on stale in-memory active_worktrees after restart."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-053 - Granularity BranchStrategy Decision

```yaml
plan_unit_id: W-053
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Branch granularity and BranchStrategy stay distinct: config.branching.granularity owns worktree/branch unit size, while MainOnly, Feature, and Release strategy controls are hidden or marked future unless implemented."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-026
- W-027
unblocks: []
acceptance_criteria:
- "W-053 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: branch_strategy_gui_decision
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0081
preserved_exact_tokens:
- "Granularity vs BranchStrategy"
- "config.branching.granularity"
- "BranchStrategy"
- "MainOnly"
- "Feature"
- "Release"
- "hide or mark future"
negative_constraints:
- "Do not expose BranchStrategy controls as active if they are not implemented."
- "Do not conflate branch strategy with branch granularity."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-054 - Git Worktree Integration Test Setup

```yaml
plan_unit_id: W-054
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Git/worktree integration tests use a temporary repository with git init and one commit, and can be marked or gated as integration-git."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-041
- W-042
- W-044
unblocks: []
acceptance_criteria:
- "W-054 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: git_integration_validation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0082
preserved_exact_tokens:
- "Integration test setup"
- "temp dir"
- "git init"
- "one commit"
- "integration-git"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-055 - Worktree Doctor Scope

```yaml
plan_unit_id: W-055
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Worktree Doctor checks use git worktree list --porcelain and detect_orphaned_worktrees() to scope orphan detection to the selected repository/worktree context."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-020
- W-023
- W-025
- W-048
unblocks: []
acceptance_criteria:
- "W-055 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: doctor_worktree_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0083
preserved_exact_tokens:
- "Worktree Doctor check"
- "git worktree list --porcelain"
- "detect_orphaned_worktrees()"
- "Doctor"
negative_constraints:
- "Doctor worktree checks must not infer orphaned worktrees without repository context."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-056 - Resolved Worktree Decisions

```yaml
plan_unit_id: W-056
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Resolved worktree decisions require HashSet<node_id> active tracking, detached HEAD merge handling, recovery timing, and Windows-safe path behavior for worktree lifecycle implementation."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-041
- W-050
- W-052
unblocks: []
acceptance_criteria:
- "W-056 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: resolved_worktree_decisions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0085
preserved_exact_tokens:
- "Resolved decisions (implementation-ready)"
- "WorktreeManager"
- "HashSet<node_id>"
- "detached HEAD"
- "Windows path safety"
- "recovery timing"
negative_constraints:
- "Do not treat resolved worktree decisions as open product questions."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-057 - Resolved Git Decisions

```yaml
plan_unit_id: W-057
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Resolved Git decisions require DRY:FN:resolve_git_executable, no GitHub CLI, canonical branch naming, local Git operation logging, and PM commit formatting."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-023
- W-024
- W-026
- W-027
- W-028
- W-029
unblocks: []
acceptance_criteria:
- "W-057 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: resolved_git_decisions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0085
preserved_exact_tokens:
- "DRY:FN:resolve_git_executable"
- "No GitHub CLI"
- ".puppet-master/logs/git-actions.log"
- "CommitFormatter"
- "pm:"
- "branch naming"
negative_constraints:
- "Do not duplicate resolve_git_executable behavior."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-058 - Resolved Config Doctor Decisions

```yaml
plan_unit_id: W-058
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Resolved config and Doctor decisions bind Dashboard run config to app.rs::spawn_orchestrator_backend, current_project.path, run_all(hint: Option<&Path>), and the canonical branch granularity/strategy distinction."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-037
- W-049
- W-053
- W-055
unblocks: []
acceptance_criteria:
- "W-058 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: resolved_config_doctor_decisions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0085
preserved_exact_tokens:
- "app.rs::spawn_orchestrator_backend"
- "current_project.path"
- "run_all(hint: Option<&Path>)"
- "config.branching.granularity"
- "BranchStrategy"
negative_constraints:
- "Do not treat Dashboard project hint or Doctor hint wiring as optional once config wiring is implemented."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-059 - DRY Platform Git Subagent SSOT

```yaml
plan_unit_id: W-059
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Backend DRY compliance keeps platform_specs, subagent_registry, and git binary resolution as single sources of truth, with DRY tags for functions and data rather than duplicated backend logic."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-023
- W-026
unblocks: []
acceptance_criteria:
- "W-059 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: dry_backend_ssot
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0086
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0087
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0088
preserved_exact_tokens:
- "DRY Method Compliance"
- "platform_specs"
- "subagent_registry"
- "DRY:DATA:subagent_registry"
- "DRY:FN:resolve_git_binary"
- "DRY:FN"
- "DRY:DATA"
negative_constraints:
- "Never duplicate git binary detection."
- "Do not duplicate platform or subagent registry data."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/DRY_Rules.md"
```

### W-060 - Widget Reuse GUI DRY Compliance

```yaml
plan_unit_id: W-060
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "GUI DRY compliance reuses cataloged widgets, shared helpers, and documented exceptions for Source Control and worktree interfaces instead of creating duplicate visual components."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-027
- W-031
- W-032
- W-033
- W-034
- W-035
- W-036
unblocks: []
acceptance_criteria:
- "W-060 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: dry_widget_reuse
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0087
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0088
preserved_exact_tokens:
- "DRY Requirements"
- "DRY and AGENTS.md conventions"
- "docs/gui-widget-catalog.md"
- "src/widgets/"
- "styled_button"
- "page_header"
- "DRY:WIDGET"
- "UI-DRY-EXCEPTION"
negative_constraints:
- "Do not create duplicate GUI widgets when a cataloged widget or helper exists."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/Widget_System.md"
- "Plans/DRY_Rules.md"
```

### W-061 - Crew Coordination State

```yaml
plan_unit_id: W-061
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Git/worktree coordination uses the reconciled PM crew model: optional overlays, child runs, explicit shared crew state, crew-board messages, and canonical seglog/redb lineage rather than ad hoc memory side files."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-013
- W-015
- W-016
- W-019
unblocks: []
acceptance_criteria:
- "W-061 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: crew_coordination_state
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0089
preserved_exact_tokens:
- "Crews and Subagent Communication Enhancements"
- "optional overlays"
- "child runs"
- "shared crew state"
- "crew-board messages"
- ".puppet-master/memory/*"
- "active-agents.json"
- "seglog/redb projections"
negative_constraints:
- ".puppet-master/memory/* is not canonical crew coordination state."
- "active-agents.json is not canonical git/worktree coordination state."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md"
- "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileSafe.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/orchestrator-subagent-integration.md"
- "Plans/storage-plan.md"
- "Plans/assistant-memory-subsystem.md"
- "Plans/Contracts_V0.md"
- "Plans/Prompt_Pipeline.md"
- "Plans/FileSafe.md"
```

### W-062 - Lifecycle Quality Canon

```yaml
plan_unit_id: W-062
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Git/worktree lifecycle and quality features align to child-run, crew, and blocked-state canon, preserving blocked_reason_code, ordered allowed_action_ids[], child lineage, worktree ownership, canonical event/storage structures, state reconstruction, and handoff reconstruction."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-061
- W-019
- W-033
unblocks: []
acceptance_criteria:
- "W-062 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: lifecycle_quality_canon
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0090
preserved_exact_tokens:
- "Lifecycle and Quality Enhancements"
- "child-run"
- "crew"
- "blocked-state canon"
- "blocked_reason_code"
- "allowed_action_ids[]"
- "cleanup"
- "reroute"
- "retry"
- "handoff reconstruction"
negative_constraints:
- "Do not invent separate active-agent lifecycle files."
- "Quality and handoff metadata do not belong in memory-manager files."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md"
- "ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Prompt_Pipeline.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/Contracts_V0.md"
- "Plans/storage-plan.md"
- "Plans/Permissions_System.md"
- "Plans/assistant-memory-subsystem.md"
- "Plans/orchestrator-subagent-integration.md"
- "Plans/Prompt_Pipeline.md"
```

### W-063 - Worktree Safe Points And Retry Visibility

```yaml
plan_unit_id: W-063
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Worktree-native safe points and retry visibility record scoped filesystem/Git state, avoid destructive reset behavior, expose retry posture, and provide acceptance criteria for safe-point creation/restoration and conflict-aware retry disclosure."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-013
- W-033
- W-062
unblocks: []
acceptance_criteria:
- "W-063 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: worktree_safe_point_retry
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0092
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0093
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0094
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0095
preserved_exact_tokens:
- "Safe-Point and Retry Integration Addendum (2026-03-08)"
- "Worktree-native safe points"
- "Retry posture visibility"
- "no git reset --hard"
- "safe-point recovery"
- "retry posture"
negative_constraints:
- "Do not use git reset --hard as the recovery primitive for worktree safe points."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-064 - Worktree Recovery Required Rules

```yaml
plan_unit_id: W-064
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Safe point and worktree recovery alignment requires worktree-specific baselines, explicit recovery targets, and dirty/conflict blocking before mutation or recovery action proceeds."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-063
- W-012
- W-021
unblocks: []
acceptance_criteria:
- "W-064 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: worktree_recovery_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0096
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0097
preserved_exact_tokens:
- "Safe Point / Worktree Recovery Alignment Addendum (2026-03-09)"
- "Required rules"
- "worktree-specific baseline"
- "explicit target"
- "dirty/conflict blocking"
negative_constraints:
- "Recovery actions must not run without an explicit target worktree or safe-point context."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
```

### W-065 - Dirty Conflict Runtime Alignment

```yaml
plan_unit_id: W-065
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Runtime worktree conflict alignment treats the addendum as historical context, preserves worktree_conflict and dirty_worktree as canonical blocked reasons, uses ordered allowed actions and dirty/conflict state fields, and keeps cleanup distinct from conflict resolution."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-019
- W-033
- W-064
unblocks: []
acceptance_criteria:
- "W-065 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: dirty_conflict_runtime_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0098
preserved_exact_tokens:
- "Runtime Worktree Conflict Canonical Alignment (2026-03-09)"
- "historical context only"
- "worktree_conflict"
- "dirty_worktree"
- "blocked_reason_code"
- "blocked_reason_detail"
- "remediation_actions_allowed"
- "dirty_state"
- "conflict_state"
negative_constraints:
- "Do not fabricate a new failure class when clearing the underlying worktree issue."
- "Conflict and cleanup semantics must remain distinct."
preserved_contractrefs:
- "ContractRef: Plans/Orchestrator_Page.md#Source Control boundary"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/Orchestrator_Page.md"
```

### W-066 - Package Lane Worktree Allocation Policy

```yaml
plan_unit_id: W-066
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Worktree allocation is package/lane based: Orchestrator owns the active run lane-pool truth while Source Control owns repo/worktree execution and inspection, and old run/tier/subtask allocation patterns are compatibility context until mapped to package lane pools."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-013
- W-015
- W-016
unblocks: []
acceptance_criteria:
- "W-066 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: lane_pool_allocation_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0099
preserved_exact_tokens:
- "Worktree Lane Allocation and Source Control Reconciliation"
- "package/lane based"
- "lane-pool truth"
- "old run/tier/subtask"
- "branch-per-run"
- "subtask-per-worktree"
- "package-based lane pools"
negative_constraints:
- "Do not treat old run/tier/subtask allocation as canonical ownership."
- "Do not replace per-package lane ceilings with flat provider-only limits."
preserved_contractrefs: []
compatibility_only_notes:
- "Old run/tier/subtask, branch-per-run, subtask-per-worktree, wizard-centric, /iteration-scoped, and /seam-aware SCM assumptions are compatibility context only."
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/orchestrator-subagent-integration.md"
- "Plans/Crosswalk.md"
```

### W-067 - Source Control Lane Worktree Ownership UX

```yaml
plan_unit_id: W-067
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Source Control remains the primary operational surface for worktree inventory and actions while exposing package/lane ownership, lifecycle state, blocked/recovery state, and action ownership for open, compare, diff, history, recover, archive, prune, and remove."
gui_related: true
gui_classification_reason: "This unit defines user-visible Source Control, Git/worktree GUI, configuration, checklist, or runtime disclosure behavior."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-014
- W-031
- W-032
- W-033
- W-035
- W-036
- W-066
unblocks: []
acceptance_criteria:
- "W-067 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: source_control_lane_worktree_owner_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0099
preserved_exact_tokens:
- "Source Control"
- "Feature Seam"
- "Work Package"
- "Lane"
- "Worktree"
- "open"
- "compare"
- "diff"
- "history/graph"
- "recover"
- "archive"
- "prune"
- "remove"
negative_constraints:
- "Source Control must not hide known package/lane ownership for worktree rows."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/Orchestrator_Page.md"
- "Plans/FinalGUISpec.md"
```

### W-068 - Compatibility And Route Identity Guardrails

```yaml
plan_unit_id: W-068
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Tier-era ownership keys and route-detail fields remain compatibility hazards: tier_id must not propagate as canonical worktree identity, and cross-surface openings must not pollute base route identity with line, range, wizard_step, shell-tab, or panel-subview detail."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-066
- W-067
unblocks: []
acceptance_criteria:
- "W-068 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: compat_route_identity_guardrails
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0099
preserved_exact_tokens:
- "tier_id"
- "tier_type"
- "worker_provider"
- "GraphNode"
- "GraphNodeUI"
- "base route identity"
- "line"
- "range"
- "wizard_step"
- "shell-tab"
- "panel-subview"
negative_constraints:
- "tier_id must not propagate as the canonical ownership key."
- "Cross-surface openings must not pollute base route identity."
preserved_contractrefs: []
compatibility_only_notes:
- "Tier-era low-level ownership examples are compatibility inputs until migrated to lane, node, attempt, runtime-lineage, and worktree identity."
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/Orchestrator_Page.md"
- "Plans/Crosswalk.md"
```

### W-069 - Cross-Lane Reuse Cleanup Scale Policy

```yaml
plan_unit_id: W-069
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "Cross-lane reuse requires contamination checks, contamination-triggered shrink, per-package lane ceilings, lane-named worktrees, preview-heavy archive/remove operations, split Orchestrator versus Source Control action ownership, and package/lane policy as the scale owner."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, storage, governance, command, or implementation policy rather than visual presentation."
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- W-002
- W-015
- W-033
- W-063
- W-066
unblocks: []
acceptance_criteria:
- "W-069 remains addressable as a fine-grained Worktree/Git PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_git_drift
reasoning_tier: standard
context_scope: worktree_git_batch_203
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: cross_lane_cleanup_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0099
preserved_exact_tokens:
- "cross-lane reuse"
- "safe-point restore"
- "contamination-triggered"
- "provider-only"
- "per-package"
- "lane-named"
- "Bulk /archive/remove"
- "preview-heavy"
- "package/lane policy"
negative_constraints:
- "Cross-lane reuse is not a best-effort cleanup path."
- "Bulk archive/remove operations must not become one-button destructive worktree actions."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/WorktreeGitImprovement.md"
- "Plans/Orchestrator_Page.md"
- "Plans/Crosswalk.md"
```

### W-001 - Worktree Git Source-Preserving Bridge Retired

```yaml
plan_unit_id: W-001
unit_type: generated_artifact_residual
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: "W-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 204 because WorktreeGitImprovement-S0100 through S0103 are generated standardization tail material: Owner / Consumer Map, PlanUnits heading, former generated W-001 bridge, and Migration Coverage. WorktreeGitImprovement-S0001 through S0099 are covered by W-002 through W-069 or explicit structural/reference dispositions. W-001 no longer carries source_preserving_planunit compile mode and must not own product coverage."
gui_related: false
gui_classification_reason: "The retired bridge is generated migration lineage rather than implementation-facing GUI behavior, even though its retired source lineage preserved earlier GUI-related Worktree/Git product tokens."
split_recommended: false
depends_on:
- W-002
- W-003
- W-004
- W-005
- W-006
- W-007
- W-008
- W-009
- W-010
- W-011
- W-012
- W-013
- W-014
- W-015
- W-016
- W-017
- W-018
- W-019
- W-020
- W-021
- W-022
- W-023
- W-024
- W-025
- W-026
- W-027
- W-028
- W-029
- W-030
- W-031
- W-032
- W-033
- W-034
- W-035
- W-036
- W-037
- W-038
- W-039
- W-040
- W-041
- W-042
- W-043
- W-044
- W-045
- W-046
- W-047
- W-048
- W-049
- W-050
- W-051
- W-052
- W-053
- W-054
- W-055
- W-056
- W-057
- W-058
- W-059
- W-060
- W-061
- W-062
- W-063
- W-064
- W-065
- W-066
- W-067
- W-068
- W-069
unblocks: []
acceptance_criteria:
- WorktreeGitImprovement-S0001 through S0099 remain mapped to fine-grained Worktree/Git PlanUnits or structural/reference dispositions rather than W-001.
- WorktreeGitImprovement-S0100 through S0103 are generated standardization tail material or retired bridge lineage, not product implementation coverage.
- W-001 no longer uses source_preserving_planunit mode and creates no WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: worktree_git_generated_tail_batch_204
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0100
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0101
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0102
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:WorktreeGitImprovement-S0103
preserved_exact_tokens:
- "source_preserving_planunit"
- "Worktree & Git Improvement -- Implementation Plan"
- "WorktreeGitImprovement-S0100"
- "WorktreeGitImprovement-S0103"
- "Migration Coverage"
- "PlanUnits"
- "Owner / Consumer Map"
negative_constraints:
- "W-001 must not provide product implementation coverage for WorktreeGitImprovement-S0001 through S0103 after Phase 2B batch 204."
- "W-001 must not override W-002 through W-069 or later fine-grained Worktree/Git PlanUnits."
- "W-001 must not use source_preserving_planunit mode after Phase 2B batch 204."
- "Do not rely on one coarse source_preserving_planunit as the final implementation standard for WorktreeGitImprovement.md."
preserved_contractrefs:
- "ContractRef lineage remains preserved in span_map and coverage_map; malformed trailing apostrophes from the generated W-001 bridge are lineage only and are not promoted as active ContractRefs."
compatibility_only_notes:
- The retired bridge is compatibility lineage for generated Owner / Consumer Map, generated PlanUnits, former W-001 bridge, and Migration Coverage tail spans only.
stale_retired_dispositions:
- Former generated source-preserving bridge material is retired as migration lineage only.
owner_hints:
- Plans/WorktreeGitImprovement.md
```
## Migration Coverage

Original hash: `331b85403ae824bae9bb418141c74b3c4859d018a7f2cb4a84415a5cd2077400`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

The initial source-preserving standardization preserved `WorktreeGitImprovement-S0001` through `WorktreeGitImprovement-S0099` in place under `W-001`. Phase 2B batch 202 superseded that coarse mapping for `WorktreeGitImprovement-S0001` through `WorktreeGitImprovement-S0058` with fine-grained PlanUnits `W-002` through `W-036`.

Phase 2B batch 203 atomized `WorktreeGitImprovement-S0059` through `WorktreeGitImprovement-S0099` into fine-grained PlanUnits `W-037` through `W-069`, structurally dispositioned the retained reference span `WorktreeGitImprovement-S0091`, and split mixed GUI/backend spans where safe. `W-001` is narrowed to residual generated-tail source-preserving coverage for `WorktreeGitImprovement-S0100` through `WorktreeGitImprovement-S0103` only and must not override the fine-grained units. Batch 203 did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.

Phase 2B batch 204 structurally dispositioned generated tail spans `WorktreeGitImprovement-S0100` through `WorktreeGitImprovement-S0103`: Owner / Consumer Map, PlanUnits heading, the former generated `W-001` bridge, and Migration Coverage. `W-001` is retired to migration-lineage-only compatibility disposition with `node_compile_hint.mode: source_preserving_bridge_retired`; `Plans/WorktreeGitImprovement.md` no longer has active `source_preserving_planunit` coverage. Batch 204 did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.

## Ledger Compile Addendum - pldg-20260614-001

### W-070 - Worktree Allocation And Lane Cleanup Header Recovery

```yaml
plan_unit_id: W-070
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: >-
  WorktreeGitImprovement owns worktree allocation, lane/worktree binding, contamination quarantine, safe-point recovery, restore-before-reuse,
  and lane cleanup semantics. Empty worktree allocation and lane-cleanup stubs hydrate from WorktreeGit, Executor, storage, Crosswalk, and
  orchestrator-subagent owner split; they do not revive branch-per-tier or tier-keyed worktree allocation as live canon.
gui_related: true
gui_classification_reason: Source Control and worktree state are user-visible surfaces, and this unit governs their visible allocation/recovery semantics.
depends_on: [W-001]
unblocks: []
acceptance_criteria:
  - Worktree allocation defaults to package/lane ownership with seam exceptions documented by policy.
  - Contaminated worktrees quarantine until recovery clears the blocker.
  - branch-per-tier wording remains compatibility-only.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual worktree owner-section review
risk_class: worktree_allocation_drift
reasoning_tier: standard
context_scope: worktree_allocation_cleanup
implementation_surfaces: [Plans/WorktreeGitImprovement.md, Plans/storage-plan.md, Plans/Executor_Protocol.md, Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: worktree_owner_section_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0069
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0073
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0074
preserved_exact_tokens: ["worktree allocation strategy", "lane-cleanup lineage", "package-based lane pools", "branch-per-tier", "contamination quarantine", "restore-before-reuse"]
negative_constraints:
  - Do not revive branch-per-tier as live worktree allocation canon.
owner_hints: [Plans/WorktreeGitImprovement.md, Plans/Executor_Protocol.md, Plans/orchestrator-subagent-integration.md, Plans/storage-plan.md]
```

## Ledger Compile Addendum - pldg-20260616-002

### W-071 - GoalRun Worktree Lease And Write Surface UX

```yaml
plan_unit_id: W-071
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: >-
  Source Control and Worktrees must surface GoalRun and WorkNode write-surface policy through worktree leases, isolated writes, parent merge, blocked write reasons, and write-mode labels. Supported labels include read_only, proposal_only, patch_only, isolated_worktree, leased_writer, and parent_writer. Subagents must not mutate overlapping live surfaces concurrently, and every GoalRun write-capable action must preserve worktree_id, owner lane, and lease or blocker evidence.
gui_related: true
gui_classification_reason: Source Control, Worktrees, blocked write reasons, and lease labels are user-visible worktree/source-control UI.
depends_on:
  - W-070
  - PS-115
  - SP-215
unblocks: []
acceptance_criteria:
  - Source Control displays GoalRun and WorkNode write-surface policy and lease state.
  - Worktree leases preserve worktree_id, owner lane, and blocker evidence.
  - read_only, proposal_only, patch_only, isolated_worktree, leased_writer, and parent_writer labels are available to visible source-control surfaces.
  - Overlapping live writes by subagents are blocked or serialized through explicit parent merge policy.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Source Control GoalRun lease review
risk_class: overlapping_write_surface_drift
reasoning_tier: high
context_scope: goalrun_worktree_leases
implementation_surfaces:
  - Plans/WorktreeGitImprovement.md
  - Plans/Permissions_System.md
  - Plans/storage-plan.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: goalrun_worktree_lease_ui
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0025
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0036
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0037
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0066
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0072
preserved_exact_tokens:
  - "Source Control"
  - "Worktrees"
  - "worktree leases"
  - "isolated writes"
  - "parent merge"
  - "write-surface"
  - "blocked write reasons"
  - "read_only"
  - "proposal_only"
  - "patch_only"
  - "isolated_worktree"
  - "leased_writer"
  - "parent_writer"
negative_constraints:
  - Do not mutate repositories outside write-surface and worktree policy.
  - Do not allow overlapping live writes without explicit lease or parent merge authority.
owner_hints:
  - Plans/WorktreeGitImprovement.md
  - Plans/Permissions_System.md
  - Plans/storage-plan.md
```

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### W-072 - Plans-To-Code Worktree Allocation And Source-Control Truth

```yaml
plan_unit_id: W-072
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: >-
  Mutation-capable WorkNode attempts must run in a known repo/worktree context. Parallel WorkNodes require isolated worktrees or explicit clean allocation, and dirty, conflicted, contaminated, blocked-preserved, or lineage-mismatched worktrees cannot be reused silently. Worktree allocation records preserve repo_id, worktree_id, worktree_path, baseline_commit_oid, branch/head state, head_commit_oid, changed_files, conflict_refs, owner lane, lease state, dirty_state_policy, conflict_policy, merge_policy, github_policy, rollback_available, rollback_ref, and restore_command_or_action. Local source-control/worktree state remains execution truth; GitHub is an optional promotion/output layer when configured.
  This is the source-control execution contract for worktree allocation; a dirty worktree or merge conflict blocks silent reuse, and GitHub optional promotion cannot replace local source-control truth.
gui_related: true
gui_classification_reason: Worktree allocation, Source Control status, lease state, conflicts, and blocked-preserved states are user-visible source-control UI surfaces.
depends_on: [W-071]
unblocks: [OP-024, EP-100, RAP-029]
acceptance_criteria:
  - Mutation-capable WorkNodes preserve repo and worktree identity before execution.
  - Parallel writes use isolated worktrees or explicit clean allocation.
  - Dirty, conflicted, contaminated, blocked-preserved, and lineage-mismatched worktrees block silent reuse.
  - Local worktree state remains source-control truth even when GitHub promotion is configured.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future source-control preflight validation
risk_class: unsafe_worktree_reuse
reasoning_tier: high
context_scope: plans_to_code_worktrees
implementation_surfaces: [Plans/WorktreeGitImprovement.md, Plans/Executor_Protocol.md, Plans/FileSafe.md, Plans/GitHub_Integration.md]
node_compile_hint: {mode: worktree_allocation_source_control_truth, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0035
  - pldg-20260617-001-plans-to-code-handoff:atom-0036
  - pldg-20260617-001-plans-to-code-handoff:atom-0038
  - pldg-20260617-001-plans-to-code-handoff:dec-0015
preserved_exact_tokens:
  - "worktree_id"
  - "isolated worktree"
  - "dirty worktree"
  - "merge conflict"
  - "changed_files"
  - "conflict_refs"
  - "rollback_ref"
  - "blocked-preserved"
  - "local source-control truth"
negative_constraints:
  - Do not reuse unsafe worktrees silently.
  - Do not require GitHub for local-only project completion.
owner_hints:
  - Plans/WorktreeGitImprovement.md
  - Plans/Executor_Protocol.md
  - Plans/FileSafe.md
```

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileSafe.md, ContractName:Plans/GitHub_Integration.md


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### W-073 - Planning Greenfield, Worktree Boundary, And Source-Control Receipts

```yaml
plan_unit_id: W-073
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: 'After the user selects or provides a project, Planning Wizard may automatically inspect local or remote paths, repository presence, current branch, remotes, status, file tree, package managers, frameworks, configuration, architecture signals, and test commands without mutation. Clone, fork, repository creation, git init, remote changes, branch checkout or creation, worktree creation, commit, push, PR creation, stash, discard, reset, and protected-branch operations require the applicable permission policy and durable receipts. Planning Wizard records repository context and may perform explicitly authorized project setup, but implementation worktree allocation, mutation preparation, and execution safe points belong to Executor provisioning after Plan Compile. For greenfield work, Planning Wizard can create a directory, initialize Git, select an initial branch, create an empty or baseline initialization commit, and optionally connect
  or create a GitHub repository when explicitly authorized. Existing uncommitted user changes are preserved and inventoried; Puppet Master must not silently commit, stash, discard, reset, overwrite, or mingle with them and must create evidence-backed isolation or block unsafe mutation. Contribution PR mode records upstream and fork identities, base and head branches, contribution policy, compatibility expectations, required checks, commit policy, and optional PR delivery without conflating those with implementation truth. Testing-tool installation and configuration writes use FileSafe/source-control safe points, bounded write surfaces, receipts, revalidation, and rollback so discovery cannot damage the user''s project or environment.'
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: stale_or_forbidden_behavior
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
- Plans/Planning_Wizard.md
- Plans/FileSafe.md
- Plans/Permissions_System.md
- Plans/GitHub_Integration.md
- Plans/Executor_Protocol.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0067
- pldg-20260618-001-prd-planning-wizard:atom-0070
- pldg-20260618-001-prd-planning-wizard:atom-0071
- pldg-20260618-001-prd-planning-wizard:atom-0072
- pldg-20260618-001-prd-planning-wizard:atom-0074
- pldg-20260618-001-prd-planning-wizard:atom-0076
- pldg-20260618-001-prd-planning-wizard:atom-0088
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/04-project-context-and-source-control.md#SRC-PROJECT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
source_atom_ids:
- atom-0067
- atom-0070
- atom-0071
- atom-0072
- atom-0074
- atom-0076
- atom-0088
decision_refs:
- dec-0014
- dec-0015
- dec-0017
correction_refs: []
preserved_exact_tokens:
- read-only project discovery
- git status
- current branch
- authority
- receipt
- git init
- push
- PR creation
- Executor provisioning
- implementation worktree
- greenfield
- baseline initialization commit
- dirty repository
- uncommitted user changes
- upstream
- fork
- base branch
- head branch
- PR
- safe point
- rollback
negative_constraints:
- Do not create implementation worktrees or execution safe points as an implicit Planning Wizard side effect.
- Never silently commit, stash, discard, reset, or overwrite user changes.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/FileSafe.md
- Plans/WorktreeGitImprovement.md
- Plans/Permissions_System.md
- Plans/GitHub_Integration.md
- Plans/Executor_Protocol.md
- Plans/Automated_Testing_System.md
```

## Ledger Compile Addendum - pldg-20260622-001-fff

### W-074 - Discovery Remote Worktree Authority And No Local Substitution

```yaml
plan_unit_id: W-074
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: >-
  WorktreeGitImprovement owns the repo, branch, worktree, SSH root, and remote project authority boundary consumed by DiscoveryService. Discovery keeps local worktrees, branches, SSH roots, requested_remote_identity, effective_remote_identity, host/root/repo/branch/worktree refs, and cache provenance separate. SSH discovery must pass for a project with no local checkout and must never substitute download-edit-upload authority or an unrelated local path for authorized remote identity/path verification.
  Storage, FileSafe, and permission consumers use this authority boundary; cache, policy, and redaction references here are cross-owner interface references, not prerequisites for defining remote worktree authority.
gui_related: false
gui_classification_reason: This is repository/worktree/remote authority, not visual presentation.
depends_on: [W-017, W-072, W-073]
unblocks: [ATS-011, GI-033]
acceptance_criteria:
  - Discovery receipts distinguish requested and effective local/remote identity.
  - Branch/worktree switches cannot reuse stale wrong-branch discovery indexes as fresh truth.
  - Exact verification cannot use unrelated local paths for remote or SSH-selected results.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: remote_worktree_authority_drift
reasoning_tier: high
context_scope: repo_worktree_remote_identity
implementation_surfaces: [Plans/WorktreeGitImprovement.md, future DiscoveryService remote identity resolver]
node_compile_hint: {mode: worktree_remote_authority, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0054
  - pldg-20260622-001-fff:atom-0061
  - pldg-20260622-001-fff:atom-0069
  - pldg-20260622-001-fff:atom-0070
  - pldg-20260622-001-fff:atom-0079
  - pldg-20260622-001-fff:atom-0085
  - pldg-20260622-001-fff:atom-0091
  - pldg-20260622-001-fff:state/doc_impact_matrix.json#DIM-005
source_atom_ids: [atom-0054, atom-0061, atom-0069, atom-0070, atom-0079, atom-0085, atom-0091]
preserved_exact_tokens: ["SSH roots", "requested_remote_identity", "effective_remote_identity", "no local checkout", "no download-edit-upload authority", "no silent local fallback", "branch/worktree ref"]
negative_constraints:
  - Do not collapse remote and local identities.
  - Do not verify SSH discovery results against unrelated local checkouts.
  - Do not make discovery imply implementation worktree creation or execution safe points.
owner_hints: [Plans/WorktreeGitImprovement.md, Plans/storage-plan.md, Plans/FileSafe.md, Plans/Permissions_System.md]
```

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime worktree rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-b3fbf73ded6ce2be14dd9c88`: `worktree_exists` validity checks path existence, `.git` link or gitdir validity, `git rev-parse --is-inside-work-tree`, expected repo id, expected branch/ref when supplied, and permission policy. Result states are `exists_valid`, `missing`, `gitdir_missing`, `wrong_repo`, `wrong_branch`, `permission_denied`, and `unknown_error`.
- Repairs `sfk-be3c6367e06fceee5d56722a`: conflict-worktree persistence uses `worktree_conflict_state.v1:{project_id}:{worktree_id}`. In-memory hints and branch-name derivations are projections only.
- Repairs `sfk-6bbb00970054c395801c3aab`: Source Control graph, AI commit batching, and conflict assistant commands are enabled only when repo identity is valid, worktree status is fresh, no protected-branch mutation is pending, and permission snapshot allows the requested command. Disabled reason codes are `repo_missing`, `status_stale`, `protected_branch`, `permission_denied`, and `operation_in_progress`.
