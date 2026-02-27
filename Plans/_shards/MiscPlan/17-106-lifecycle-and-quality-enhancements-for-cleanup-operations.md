## 10.6 Lifecycle and Quality Enhancements for Cleanup Operations

The orchestrator plan (`Plans/orchestrator-subagent-integration.md`) defines lifecycle hooks, structured handoff validation, remediation loops, and cross-session memory. These features can enhance **cleanup operations** to improve reliability, quality, and continuity.

### 1. Hook-Based Lifecycle for Cleanup Operations

**Concept:** Apply hook-based lifecycle middleware to cleanup operations. Run **BeforeCleanup** and **AfterCleanup** hooks before and after workspace cleanup (prepare_working_directory, cleanup_after_execution, manual "Clean workspace").

**BeforeCleanup hook responsibilities:**

- **Track active cleanup:** Record which cleanup operation is being performed (e.g., `prepare_working_directory`, `cleanup_after_execution`, `manual_clean`).
- **Inject cleanup context:** Add workspace path, allowlist state, config snapshot, and known cleanup issues to cleanup context.
- **Load cross-session memory:** Load prior cleanup patterns (e.g., which dirs were cleaned, which were preserved) from `.puppet-master/memory/` and inject into cleanup context.
- **Validate workspace state:** Check workspace is valid (git repo, permissions) before cleanup.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

**AfterCleanup hook responsibilities:**

- **Validate cleanup result:** Check that cleanup succeeded (e.g., files removed, allowlisted paths preserved).
- **Track completion:** Update cleanup operation tracking, mark cleanup completion state.
- **Save memory:** Persist cleanup patterns (e.g., which patterns were effective, which dirs were problematic) to `.puppet-master/memory/patterns.json`.
- **Safe error handling:** Guarantee structured output even on cleanup failure.

**Implementation:** Extend `src/cleanup/workspace.rs` to call hooks before and after cleanup operations. Use the same hook registry pattern as orchestrator hooks, but with cleanup-specific contexts (`BeforeCleanupContext`, `AfterCleanupContext`).

**Integration with cleanup module:**

In `src/cleanup/workspace.rs`, wrap cleanup operations:

```rust
// Before cleanup
let before_ctx = BeforeCleanupContext {
    operation: CleanupOperation::PrepareWorkingDirectory,
    work_dir: work_dir.to_path_buf(),
    config: config.clone(),
    allowlist: cleanup_exclude_patterns(),
    known_issues: get_known_cleanup_issues()?,
};

let before_result = self.hook_registry.execute_before_cleanup(&before_ctx)?;

if before_result.block {
    return Err(anyhow!("Cleanup blocked by hook: {}", before_result.block_reason.unwrap_or_default()));
}

// Perform cleanup
let result = run_git_clean_with_excludes(work_dir, config.untracked, config.clean_ignored).await?;

// After cleanup
let after_ctx = AfterCleanupContext {
    operation: CleanupOperation::PrepareWorkingDirectory,
    work_dir: work_dir.to_path_buf(),
    cleanup_result: result.clone(),
    completion_status: if result.success { CompletionStatus::Success } else { CompletionStatus::Failure(result.error) },
    files_removed: result.files_removed,
    allowlisted_preserved: result.allowlisted_preserved,
};

let after_result = self.hook_registry.execute_after_cleanup(&after_ctx)?;

// Save memory if cleanup succeeded
if result.success {
    self.memory_manager.save_pattern(EstablishedPattern {
        name: "cleanup_patterns".to_string(),
        description: format!("Cleaned {} files, preserved allowlisted paths", result.files_removed),
        examples: vec![format!("git clean -fd -e .puppet-master ...")],
        timestamp: Utc::now(),
    }).await?;
}
```

### 2. Structured Handoff Validation for Cleanup Results

**Concept:** Enforce structured output format for cleanup operation results. Use structured format for cleanup operation outputs.

**Cleanup operation result format:**

```rust
pub struct CleanupResult {
    pub operation: CleanupOperation,
    pub success: bool,
    pub files_removed: u32,
    pub dirs_removed: u32,
    pub allowlisted_preserved: Vec<PathBuf>,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
    pub duration_ms: u64,
}
```

**Validation:** After cleanup operations, validate result format matches `CleanupResult`. On validation failure (e.g., unexpected git clean output format), log warning and proceed with partial result.

**Integration:** Extend `run_git_clean_with_excludes()` and `prepare_working_directory()` to return structured `CleanupResult` instead of raw success/failure. Parse git clean output into structured format (e.g., count files/dirs removed from `git clean -fd -n` preview).

### 3. Cross-Session Memory for Cleanup Patterns

**Concept:** Persist cleanup patterns (effective exclude patterns, problematic directories, cleanup frequency) to `.puppet-master/memory/` so future runs can load prior cleanup knowledge.

**What to persist:**

- **Cleanup patterns:** Examples of effective cleanup operations (e.g., "git clean -fd -e .puppet-master removed 15 files").
- **Problematic directories:** Directories that caused cleanup issues (e.g., permission errors, locked files).
- **Cleanup frequency:** How often cleanup runs, which operations are most effective.

**When to persist:**

- **At cleanup completion:** Save cleanup pattern example if cleanup was effective.
- **At cleanup failure:** Save problematic directory pattern if cleanup failed.

**When to load:**

- **At run start:** Load prior cleanup patterns and inject into cleanup context.
- **At cleanup operation:** Load prior cleanup patterns to optimize cleanup strategy.

**Integration:** Use the same `MemoryManager` from orchestrator plan. In cleanup module, call `memory_manager.save_pattern()` at cleanup operations (prepare, cleanup_after_execution, manual clean).

### 4. Active Agent Tracking for Cleanup Operations

**Concept:** Track which cleanup operation is currently active. Store in cleanup module state and expose for logging and debugging.

**Tracking:**

- **Per operation:** `active_cleanup_operation: Option<CleanupOperation>` in cleanup module state.
- **Persistence:** Write to `.puppet-master/state/active-cleanup-operations.json` (updated on each cleanup operation).

**Use cases:**

- **Logging:** "Cleanup operation: prepare_working_directory, work_dir = /path/to/project, files_removed = 15"
- **Debugging:** "Why did this cleanup fail? Check active cleanup operation logs."
- **Audit trails:** "Which cleanup operations ran in this run? See active-cleanup-operations.json."

### 5. Remediation Loop for Cleanup Failures

**Concept:** When cleanup operations fail with recoverable errors (e.g., permission errors, locked files), enter a remediation loop. Retry with fixes until cleanup succeeds or escalate.

**Severity levels:**

- **Critical:** Workspace corruption, critical permission errors -- **escalate to user**.
- **Major:** Permission errors for specific files, locked files -- **remediate automatically** (skip problematic files, retry with different strategy).
- **Minor:** Non-fatal warnings (e.g., "some files could not be removed") -- **log and proceed**.
- **Info:** Informational messages -- **log and proceed**.

**Remediation loop:**

1. Cleanup operation fails (e.g., `git clean -fd` fails with "Permission denied" for specific file).
2. Parse error from cleanup output.
3. Categorize error (Critical/Major/Minor/Info).
4. If Major (recoverable):
   - Apply remediation (e.g., skip problematic file, retry with `-f` force flag, or use alternative cleanup method).
   - Retry cleanup operation.
   - Repeat until succeeds or max retries (e.g., 2).
   - If max retries reached, escalate to user or skip problematic files.
5. If Critical: escalate to user immediately.
6. If Minor/Info: log and proceed.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

**Integration:** Extend cleanup module to use remediation loop pattern from orchestrator plan. Wrap cleanup operations in remediation-aware handlers that detect recoverable errors and apply fixes.

### Implementation Notes

- **Where:** Extend `src/cleanup/workspace.rs` with hook integration; reuse `src/core/memory.rs` for persistence; reuse `src/core/remediation.rs` for remediation loops.
- **What:** Add BeforeCleanup/AfterCleanup hooks; validate cleanup results with structured format; persist cleanup patterns to memory; track active cleanup operations; implement remediation loops for recoverable cleanup errors.
- **When:** Hooks run automatically at cleanup boundaries; memory persists at cleanup operations; remediation loop runs when cleanup operations fail with recoverable errors.

**Cross-reference:** See orchestrator plan "Lifecycle and Quality Features" for full implementation details. See orchestrator plan "Puppet Master Crews" for how cleanup crews can coordinate workspace cleanup operations.

