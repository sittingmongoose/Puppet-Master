# Parallel Subtask Execution - Minimal Changes Required

## Executive Summary

**Current Status:** The parallel execution infrastructure exists but is **NEVER ACTIVATED**. Subtasks execute sequentially in `runLoop()` despite having:
- ✅ `ParallelExecutor` class (fully implemented)
- ✅ `WorktreeManager` (git worktree isolation)
- ✅ Dependency analyzer (topological sorting)
- ✅ Semaphore for concurrency control
- ❌ **NO INTEGRATION** - Methods exist but are never called

**Root Cause:** `runLoop()` processes one subtask at a time. Task-level parallel execution decision point is missing.

---

## Critical Issues Identified

### 1. **Execution Flow Gap** ⚠️ CRITICAL
**Location:** `src/core/orchestrator.ts:935-1100` (`runLoop()`)

**Problem:**
- Line 935-1100: Loop processes subtasks **one by one**
- Line 939: `getCurrentSubtask()` returns single subtask
- Line 981-1014: Builds context and executes **one iteration**
- Methods `shouldUseParallelExecution()` (line 3072) and `executeTaskInParallel()` (line 3115) exist but are **ORPHANED**

**Evidence:**
```typescript
// Line 935-940: Sequential processing
private async runLoop(): Promise<void> {
  while (this.stateMachine.getCurrentState() === 'executing' && !this.loopAborted) {
    try {
      // Get current subtask ← SINGLE SUBTASK
      const subtask = this.tierStateManager.getCurrentSubtask();
      if (!subtask) {
        // No more subtasks, check if we should advance or complete
```

### 2. **WorktreeManager Merge Sequencing** ⚠️ CRITICAL
**Location:** `src/core/parallel-executor.ts:202-217`

**Problem:**
- Line 202-217: Merges happen **inside parallel execution loop**
- Multiple worktrees merge to main branch **simultaneously**
- No lock/mutex on git merge operations
- **Race condition:** Two merges can conflict even if worktrees don't

**Current Code:**
```typescript
// Line 202-217: UNSAFE concurrent merges
if (this.config.mergeResults && result.worktreeInfo) {
  const mergeResult = await this.worktreeManager.mergeWorktree(
    subtask.id,
    this.config.targetBranch
  ); // ← Multiple threads can call this concurrently!
```

**Risk:**
```
Timeline:
T0: Subtask A completes, starts merge (checkout main, merge worktree/A)
T1: Subtask B completes, starts merge (checkout main ← CONFLICT!)
T2: Both merges corrupt repository state
```

### 3. **WorktreeManager Missing Lock** ⚠️ HIGH
**Location:** `src/git/worktree-manager.ts:303-365` (`mergeWorktree()`)

**Problem:**
- Line 313: `git checkout <target>` not protected
- Line 326: `git merge` not protected
- No mutex ensures single merge at a time
- Multiple concurrent merges will corrupt each other

**Current Code:**
```typescript
// Line 303-326: No locking mechanism
async mergeWorktree(agentId: string, targetBranch?: string): Promise<MergeResult> {
  const info = this.worktrees.get(agentId);
  // ...
  
  // ❌ UNSAFE: Multiple threads can execute this simultaneously
  const checkoutResult = await this.gitExec(['checkout', target]);
  // ...
  const mergeResult = await this.gitExec(['merge', '--no-ff', info.branch, ...]);
```

---

## Minimal Changes Required

### **CHANGE 1: Add Task-Level Parallel Decision** 🔧 CRITICAL
**File:** `src/core/orchestrator.ts`
**Location:** Insert between lines 936-944 (inside `runLoop()`)

**Change Type:** Add conditional logic

```typescript
// Line 936: Add after "while (...) {"
private async runLoop(): Promise<void> {
  while (this.stateMachine.getCurrentState() === 'executing' && !this.loopAborted) {
    try {
      // ===== NEW CODE START =====
      // Check if current task should use parallel execution
      const currentTask = this.tierStateManager.getCurrentTask();
      if (currentTask && this.shouldUseParallelExecution(currentTask)) {
        // Execute all pending subtasks in parallel for this task
        await this.executeTaskInParallel(currentTask);
        
        // After parallel execution, advance to next task
        const advancement = await this.autoAdvancement.checkAndAdvance();
        await this.handleAdvancement(advancement);
        continue; // Skip sequential subtask processing below
      }
      // ===== NEW CODE END =====
      
      // Get current subtask (EXISTING CODE - unchanged)
      const subtask = this.tierStateManager.getCurrentSubtask();
      if (!subtask) {
        // No more subtasks, check if we should advance or complete
```

**Lines to Insert After:** Line 937 (after `try {`)
**Lines Before Next Code:** Line 938 (before `const subtask = ...`)

**Testing:**
```typescript
// Test case: Task with parallel: true
const task = { 
  id: 'test-task', 
  data: { parallel: true },
  getChildren: () => [subtask1, subtask2, subtask3]
};
// Expected: All 3 subtasks execute concurrently with worktrees
```

---

### **CHANGE 2: Add Merge Mutex to WorktreeManager** 🔧 CRITICAL
**File:** `src/git/worktree-manager.ts`
**Location:** Lines 77-82 (class properties) and 303-365 (mergeWorktree)

**Change Type:** Add class property + wrap merge in lock

#### Part 2A: Add Merge Lock Property
```typescript
// Line 77-82: Add to class properties
export class WorktreeManager {
  private readonly gitManager: GitManager;
  private readonly projectRoot: string;
  private readonly config: WorktreeConfig;
  private readonly worktrees: Map<string, WorktreeInfo> = new Map();
  // ===== NEW CODE =====
  private mergeLock: Promise<void> = Promise.resolve(); // Serialize merges
  // ===== END NEW CODE =====
```

**Exact Location:** After line 81 (`private readonly worktrees...`), before line 83 (`constructor`)

#### Part 2B: Wrap Merge in Sequential Lock
```typescript
// Line 303: Replace entire mergeWorktree method
async mergeWorktree(agentId: string, targetBranch?: string): Promise<MergeResult> {
  // ===== NEW CODE START =====
  // Wait for previous merge to complete before starting new one
  const previousMerge = this.mergeLock;
  let resolveMerge: () => void;
  this.mergeLock = new Promise<void>((resolve) => {
    resolveMerge = resolve;
  });
  
  try {
    await previousMerge; // Wait for previous merge
    // ===== NEW CODE END =====
    
    // EXISTING CODE (unchanged)
    const info = this.worktrees.get(agentId);
    if (!info) {
      throw new Error(\`No worktree found for agent: \${agentId}\`);
    }

    const target = targetBranch || info.baseBranch;
    info.status = 'merging';

    // First, checkout the target branch in the main repo
    const checkoutResult = await this.gitExec(['checkout', target]);
    if (!checkoutResult.success) {
      info.status = 'active';
      return {
        success: false,
        conflictFiles: [],
        sourceBranch: info.branch,
        targetBranch: target,
        error: \`Failed to checkout target branch: \${checkoutResult.stderr}\`,
      };
    }

    // Attempt to merge the worktree branch
    const mergeResult = await this.gitExec(['merge', '--no-ff', info.branch, '-m', \`Merge \${info.branch} (agent: \${agentId})\`]);

    if (mergeResult.success) {
      // Get the merge commit SHA
      const shaResult = await this.gitExec(['rev-parse', 'HEAD']);
      const mergeCommitSha = shaResult.success ? shaResult.stdout : undefined;

      info.status = 'merged';

      // Cleanup if configured
      if (this.config.cleanupOnMerge) {
        await this.destroyWorktree(agentId, true).catch(() => {
          // Log but don't fail on cleanup errors
        });
      }

      return {
        success: true,
        conflictFiles: [],
        sourceBranch: info.branch,
        targetBranch: target,
        mergeCommitSha,
      };
    }

    // Merge failed - check for conflicts
    info.status = 'conflict';
    const conflictFiles = await this.getConflictFiles();

    // Abort the merge to leave clean state
    await this.gitExec(['merge', '--abort']);

    return {
      success: false,
      conflictFiles,
      sourceBranch: info.branch,
      targetBranch: target,
      error: mergeResult.stderr || 'Merge conflict detected',
    };
  // ===== NEW CODE START =====
  } finally {
    // Release lock for next merge
    resolveMerge!();
  }
  // ===== NEW CODE END =====
}
```

**Lines to Replace:** Entire method from line 303 to line 365

**Testing:**
```typescript
// Test concurrent merges
const promises = [
  worktreeManager.mergeWorktree('agent-1'),
  worktreeManager.mergeWorktree('agent-2'),
  worktreeManager.mergeWorktree('agent-3'),
];
// Expected: Merges execute sequentially, no corruption
await Promise.all(promises);
```

---

### **CHANGE 3: Move Merge Outside Parallel Loop** 🔧 HIGH
**File:** `src/core/parallel-executor.ts`
**Location:** Lines 179-265 (inside executeParallel)

**Change Type:** Restructure - collect results, then merge sequentially

**Current Structure (UNSAFE):**
```
for each level:
  for each subtask in level (PARALLEL):
    - execute subtask
    - merge immediately ← PROBLEM: Multiple concurrent merges
```

**New Structure (SAFE):**
```
for each level:
  for each subtask in level (PARALLEL):
    - execute subtask
    - collect result (NO MERGE)
  
  // After ALL subtasks in level complete:
  for each successful subtask (SEQUENTIAL):
    - merge one at a time
```

**Implementation:**

```typescript
// Line 179-265: Restructure the level processing loop
for (const level of graph.levels) {
  // ===== PHASE 1: Execute all subtasks in level (PARALLEL) =====
  const levelPromises = level.map(async (subtask) => {
    await this.semaphore.acquire();
    inProgressIds.add(subtask.id);

    const currentConcurrency = this.semaphore.getCurrentCount();
    maxConcurrencyUsed = Math.max(maxConcurrencyUsed, currentConcurrency);

    try {
      const result = await this.executeSubtaskInWorktree(
        subtask,
        contextBuilder,
        runnerProvider,
        levelIndex
      );
      results.set(subtask.id, result);

      if (result.success) {
        completedIds.add(subtask.id);
        // ❌ REMOVE THIS: Don't merge here anymore
        // if (this.config.mergeResults && result.worktreeInfo) { ... }
      } else {
        failedIds.add(subtask.id);
        allSuccess = false;
      }

      this.emitEvent('parallel_subtask_completed', {
        subtaskId: subtask.id,
        success: result.success,
        level: levelIndex,
        durationMs: result.durationMs,
      });

    } catch (error) {
      // ... error handling (unchanged)
    } finally {
      inProgressIds.delete(subtask.id);
      this.semaphore.release();
    }
  });

  // Wait for ALL executions to complete
  await Promise.all(levelPromises);

  // ===== PHASE 2: Merge successful subtasks (SEQUENTIAL) =====
  if (this.config.mergeResults) {
    for (const subtask of level) {
      const result = results.get(subtask.id);
      if (!result || !result.success || !result.worktreeInfo) {
        continue; // Skip failed or missing
      }

      // Merge one at a time (WorktreeManager now has lock for extra safety)
      const mergeResult = await this.worktreeManager.mergeWorktree(
        subtask.id,
        this.config.targetBranch
      );
      result.mergeResult = mergeResult;

      if (!mergeResult.success) {
        result.success = false;
        result.error = \`Merge conflict: \${mergeResult.conflictFiles.join(', ')}\`;
        conflictSubtasks.push(subtask.id);
        failedIds.add(subtask.id);
        completedIds.delete(subtask.id);
        allSuccess = false;
        
        this.emitEvent('parallel_subtask_error', {
          subtaskId: subtask.id,
          error: result.error,
          level: levelIndex,
        });
      }
    }
  }

  // Check if we should continue after failures
  if (!this.config.continueOnFailure && failedIds.size > 0) {
    break;
  }

  levelIndex++;
}
```

**Lines to Replace:** Lines 179-265 (entire level processing loop)

**Benefits:**
- ✅ Execution remains parallel (max performance)
- ✅ Merges happen sequentially (safe)
- ✅ WorktreeManager lock provides defense-in-depth
- ✅ Clear separation: compute || merge → compute → merge

---

### ~~**CHANGE 4: Add getCurrentTask Method**~~ ✅ ALREADY EXISTS
**File:** `src/core/tier-state-manager.ts`
**Location:** Lines 56-61

**Status:** **NO CHANGE NEEDED** - Method already implemented

**Existing Code:**
```typescript
// Line 56-61
getCurrentTask(): TierNode | null {
  if (!this.currentTaskId) {
    return null;
  }
  return this.tasks.get(this.currentTaskId) ?? null;
}
```

**Verification:** ✅ Confirmed - method exists and is properly implemented

---

## Exact Line Numbers Summary

| Change | File | Lines | Action |
|--------|------|-------|--------|
| **1** | `orchestrator.ts` | **937-938** | Insert 10 lines (parallel decision) |
| **2A** | `worktree-manager.ts` | **After 81** | Insert 1 line (mergeLock property) |
| **2B** | `worktree-manager.ts` | **303-365** | Replace method (add try/finally wrapper) |
| **3** | `parallel-executor.ts` | **179-265** | Replace loop (restructure phases) |
| ~~**4**~~ | `tier-state-manager.ts` | ~~**N/A**~~ | ~~Add method~~ **✅ Already exists** |

---

## Testing Strategy

### Unit Tests
```typescript
// Test 1: Parallel execution activates
test('orchestrator uses parallel execution for enabled tasks', async () => {
  const task = createTask({ parallel: true, subtasks: 3 });
  const spy = jest.spyOn(orchestrator, 'executeTaskInParallel');
  await orchestrator.start();
  expect(spy).toHaveBeenCalledWith(task);
});

// Test 2: Merges are sequential
test('worktree merges execute sequentially', async () => {
  const order: string[] = [];
  const mockGitExec = jest.fn((args) => {
    if (args[0] === 'merge') {
      order.push(args[2]); // branch name
    }
    return Promise.resolve({ success: true, stdout: '', stderr: '', exitCode: 0 });
  });
  
  await Promise.all([
    worktreeManager.mergeWorktree('agent-1'),
    worktreeManager.mergeWorktree('agent-2'),
    worktreeManager.mergeWorktree('agent-3'),
  ]);
  
  // Merges should complete in order (not interleaved)
  expect(order).toEqual(['worktree/agent-1', 'worktree/agent-2', 'worktree/agent-3']);
});
```

### Integration Tests
```typescript
// Test 3: End-to-end parallel task
test('parallel task with 3 subtasks completes successfully', async () => {
  const project = createTestProject({
    tasks: [{
      id: 'parallel-task',
      parallel: true,
      subtasks: [
        { id: 'sub-1', dependencies: [] },
        { id: 'sub-2', dependencies: ['sub-1'] },
        { id: 'sub-3', dependencies: ['sub-1'] },
      ],
    }],
  });
  
  const result = await orchestrator.run(project);
  
  // Verify parallel execution was used
  expect(result.metrics.maxConcurrencyUsed).toBeGreaterThan(1);
  
  // Verify all subtasks completed
  expect(result.completedSubtasks).toBe(3);
  
  // Verify no merge conflicts
  expect(result.conflictSubtasks).toHaveLength(0);
});
```

---

## Merge Sequencing Deep Dive

### Why Sequential Merging is Required

**Git Merge is NOT Thread-Safe:**
```bash
# Thread 1:
git checkout main
git merge worktree/agent-1  # Modifying .git/refs/heads/main

# Thread 2 (simultaneous):
git checkout main           # ✅ OK (read operation)
git merge worktree/agent-2  # ❌ CONFLICT! Both writing to main's ref
```

**Problem:** Git's internal state (`.git/refs`, `.git/index`, `.git/MERGE_HEAD`) is not protected by locks for concurrent access.

**Solution:** Our merge mutex ensures:
```
Timeline:
T0: Agent 1 acquires lock, starts merge
T1: Agent 2 waits for lock
T2: Agent 1 completes, releases lock
T3: Agent 2 acquires lock, starts merge (safe)
```

### Dependency Order Preservation

**Current Implementation (lines 179-265):**
- Level 0: Execute subtasks A, B in parallel → Merge A, B sequentially
- Level 1: Execute subtasks C in parallel → Merge C sequentially

**Order Guarantee:**
- ✅ A and B execute concurrently (independent)
- ✅ C waits for A and B to complete (dependency)
- ✅ Merges happen A → B → C (sequential within and across levels)

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Merge corruption | **HIGH** (without fix) | **CRITICAL** | Change 2 + 3 (mutex + restructure) |
| Parallel not activating | **MEDIUM** | **HIGH** | Change 1 (add decision point) |
| Race in getCurrentTask | **LOW** | **MEDIUM** | Change 4 + careful testing |
| Worker/Reviewer conflict | **LOW** | **HIGH** | Keep Worker/Reviewer sequential |

---

## Rollback Plan

If parallel execution causes issues:

1. **Quick disable:** Set `config.execution.parallel.enabled = false`
2. **Code rollback:** Revert Change 1 only (keeps safety improvements)
3. **Full rollback:** Revert all changes (returns to sequential execution)

**Safe degradation:** Even with Change 1, tasks with `parallel: false` or `parallel: undefined` (default) will use sequential execution.

---

## Performance Impact

### Before (Sequential):
```
Task with 3 independent subtasks:
- Subtask 1: 60 seconds
- Subtask 2: 60 seconds  
- Subtask 3: 60 seconds
Total: 180 seconds
```

### After (Parallel, maxConcurrency: 3):
```
Task with 3 independent subtasks:
- All execute concurrently: 60 seconds
- Merge sequentially: 3 seconds
Total: 63 seconds (3x speedup)
```

### With Dependencies:
```
Task with chain: A → B → C
- Level 0: A (60s)
- Level 1: B (60s, waits for A)
- Level 2: C (60s, waits for B)
Total: 180 seconds (same as sequential - no parallelism possible)
```

---

## Conclusion

**Minimal changes required:** 3 precise modifications (down from 4!)
**Lines of code added:** ~40 lines
**Lines of code modified:** ~100 lines
**Risk level:** Medium (mostly integration, core logic exists)
**Estimated effort:** 3-4 hours (implementation + testing)

**Key insight:** The parallel execution engine is fully implemented and tested. The only missing pieces are:
1. Integration point in `runLoop()` to activate parallel execution
2. Merge mutex to prevent git corruption
3. Restructured merge sequencing for safety

These changes activate existing infrastructure rather than building new functionality. Even better, `getCurrentTask()` already exists, reducing the changes from 4 to 3!
