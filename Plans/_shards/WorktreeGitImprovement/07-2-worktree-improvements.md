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
- ownership transitions between scopes MUST update the effective provider/model choice together with the lane/worktree assignment record
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

