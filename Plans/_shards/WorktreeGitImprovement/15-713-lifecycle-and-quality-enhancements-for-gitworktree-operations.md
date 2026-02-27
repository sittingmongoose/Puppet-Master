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
- **Commit message patterns:** Examples of commit messages (e.g., `pm: [ITERATION] ...`).

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

