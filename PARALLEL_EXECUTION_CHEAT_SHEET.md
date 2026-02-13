# Parallel Execution - Implementation Cheat Sheet

## Quick Reference: 3 Changes Required

### ✅ CHANGE 1: Activate Parallel Decision Logic
**File:** `src/core/orchestrator.ts`  
**Line:** 937 (inside `runLoop()`, after `try {`)

```typescript
// INSERT AFTER LINE 937:
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
```

**Verification:**
```bash
# Test that parallel execution activates:
npm test -- orchestrator.test.ts -t "parallel execution"
```

---

### ✅ CHANGE 2: Add Merge Mutex
**File:** `src/git/worktree-manager.ts`

#### Part A: Add Property (Line 82)
```typescript
// ADD AFTER LINE 81:
private mergeLock: Promise<void> = Promise.resolve(); // Serialize merges
```

#### Part B: Wrap mergeWorktree (Lines 303-365)
```typescript
// REPLACE ENTIRE METHOD (Lines 303-365):
async mergeWorktree(agentId: string, targetBranch?: string): Promise<MergeResult> {
  // Wait for previous merge to complete before starting new one
  const previousMerge = this.mergeLock;
  let resolveMerge: () => void;
  this.mergeLock = new Promise<void>((resolve) => {
    resolveMerge = resolve;
  });
  
  try {
    await previousMerge; // Wait for previous merge
    
    // [KEEP ALL EXISTING CODE FROM LINE 304-364]
    const info = this.worktrees.get(agentId);
    if (!info) {
      throw new Error(`No worktree found for agent: ${agentId}`);
    }
    // ... rest of existing merge logic ...
    
  } finally {
    // Release lock for next merge
    resolveMerge!();
  }
}
```

**Verification:**
```bash
# Test that merges don't conflict:
npm test -- worktree-manager.test.ts -t "concurrent merge"
```

---

### ✅ CHANGE 3: Restructure Parallel Executor
**File:** `src/core/parallel-executor.ts`  
**Lines:** 179-265 (replace level processing loop)

**Key Changes:**
1. Remove inline merge from execution loop (line 202-217)
2. Add separate sequential merge phase after `Promise.all()`

```typescript
// REPLACE LINES 179-265 WITH:
for (const level of graph.levels) {
  // ===== PHASE 1: Execute all subtasks in parallel =====
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
        // DON'T MERGE HERE ANYMORE
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
      const errorMsg = error instanceof Error ? error.message : String(error);
      results.set(subtask.id, {
        subtaskId: subtask.id,
        success: false,
        durationMs: Date.now() - startTime,
        error: errorMsg,
        level: levelIndex,
      });
      failedIds.add(subtask.id);
      allSuccess = false;

      this.emitEvent('parallel_subtask_error', {
        subtaskId: subtask.id,
        error: errorMsg,
        level: levelIndex,
      });
    } finally {
      inProgressIds.delete(subtask.id);
      this.semaphore.release();
    }
  });

  // Wait for ALL executions to complete
  await Promise.all(levelPromises);

  // ===== PHASE 2: Merge successful subtasks sequentially =====
  if (this.config.mergeResults) {
    for (const subtask of level) {
      const result = results.get(subtask.id);
      if (!result || !result.success || !result.worktreeInfo) {
        continue;
      }

      // Merge one at a time (WorktreeManager has lock for safety)
      const mergeResult = await this.worktreeManager.mergeWorktree(
        subtask.id,
        this.config.targetBranch
      );
      result.mergeResult = mergeResult;

      if (!mergeResult.success) {
        result.success = false;
        result.error = `Merge conflict: ${mergeResult.conflictFiles.join(', ')}`;
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

**Verification:**
```bash
# Test phase separation:
npm test -- parallel-executor.test.ts -t "merge sequencing"
```

---

## Pre-Implementation Checklist

- [ ] Read `PARALLEL_EXECUTION_MINIMAL_CHANGES.md` (detailed analysis)
- [ ] Read `PARALLEL_EXECUTION_VISUAL.md` (visual guide)
- [ ] Understand git worktree isolation model
- [ ] Understand promise-based mutex pattern
- [ ] Review existing ParallelExecutor tests
- [ ] Review WorktreeManager tests
- [ ] Create backup branch: `git checkout -b backup-before-parallel`

---

## Implementation Order

### Step 1: Add Merge Mutex (Safest First)
1. Edit `worktree-manager.ts` (Changes 2A + 2B)
2. Run tests: `npm test worktree-manager.test.ts`
3. Commit: `git commit -m "Add merge mutex for safe concurrent merges"`

### Step 2: Restructure Parallel Executor
1. Edit `parallel-executor.ts` (Change 3)
2. Run tests: `npm test parallel-executor.test.ts`
3. Commit: `git commit -m "Restructure parallel executor for sequential merges"`

### Step 3: Activate Parallel Execution
1. Edit `orchestrator.ts` (Change 1)
2. Run all tests: `npm test`
3. Test with sample PRD (see below)
4. Commit: `git commit -m "Activate parallel execution for enabled tasks"`

---

## Test PRD for Manual Verification

```typescript
// test-parallel.prd.json
{
  "project": {
    "name": "Parallel Test",
    "phases": [
      {
        "id": "phase-1",
        "name": "Test Phase",
        "tasks": [
          {
            "id": "parallel-task",
            "name": "Parallel Task",
            "parallel": true,  // ← Enable parallel
            "subtasks": [
              {
                "id": "subtask-1",
                "name": "Independent Task 1",
                "description": "Create file-1.txt with content 'Hello 1'",
                "dependencies": []
              },
              {
                "id": "subtask-2",
                "name": "Independent Task 2",
                "description": "Create file-2.txt with content 'Hello 2'",
                "dependencies": []
              },
              {
                "id": "subtask-3",
                "name": "Independent Task 3",
                "description": "Create file-3.txt with content 'Hello 3'",
                "dependencies": []
              }
            ]
          }
        ]
      }
    ]
  }
}
```

**Run Test:**
```bash
# Start orchestrator with test PRD
npm run cli -- start --prd test-parallel.prd.json --config config-parallel.json

# Watch for logs:
# [Orchestrator] Starting parallel execution for parallel-task with 3 subtasks
# [ParallelExecutor] Parallel execution completed: maxConcurrencyUsed=3

# Verify results:
ls file-*.txt  # Should see file-1.txt, file-2.txt, file-3.txt
git log --oneline --graph  # Should see 3 merge commits
```

---

## Verification Commands

### Check Parallel Activation
```bash
# Should log: "Starting parallel execution for..."
grep -r "Starting parallel execution" logs/

# Should NOT log if parallel=false or disabled
# (falls back to sequential)
```

### Check Merge Safety
```bash
# Check for merge conflicts:
git status  # Should be clean after parallel execution

# Check merge commit order:
git log --oneline --graph --all
# Should show sequential merges: commit-A → commit-B → commit-C

# Check for orphaned commits:
git fsck --lost-found  # Should be empty
```

### Check Performance
```bash
# Compare execution times:
# Sequential: ~180s for 3x 60s subtasks
# Parallel: ~63s (60s execution + 3s merge)

# Check metrics:
grep "maxConcurrencyUsed" logs/
# Should show > 1 for parallel tasks
```

---

## Rollback Instructions

### Quick Disable (No Code Changes)
```json
// config.json
{
  "execution": {
    "parallel": {
      "enabled": false  // ← Set to false
    }
  }
}
```

### Partial Rollback (Keep Safety, Disable Parallel)
```bash
# Revert only Change 1:
git revert <commit-hash-change-1>

# Keep Changes 2 & 3 (safety improvements remain)
# System uses sequential execution, but merges are safe
```

### Full Rollback
```bash
# Revert all 3 changes:
git revert <commit-hash-change-3>
git revert <commit-hash-change-2>
git revert <commit-hash-change-1>

# Or restore backup:
git checkout backup-before-parallel
git checkout -b main  # If you want to reset main
```

---

## Common Issues & Solutions

### Issue: "getCurrentTask is not a function"
**Cause:** TypeScript not recompiled  
**Solution:**
```bash
npm run build
```

### Issue: Parallel execution not activating
**Check:**
1. Is `config.execution.parallel.enabled = true`?
2. Does task have `parallel: true` in PRD?
3. Are there 2+ pending subtasks?
4. Check logs: `grep "Parallel execution disabled" logs/`

### Issue: Merge conflicts in parallel execution
**Expected:** System detects conflicts and creates resolution subtask  
**Check:**
```bash
# Look for conflict handling:
grep "Merge conflict" logs/
grep "generateConflictResolutionSubtask" logs/
```

### Issue: "Worktree already exists"
**Cause:** Previous run didn't clean up  
**Solution:**
```bash
# Manual cleanup:
git worktree list
git worktree remove <path>  # For each stuck worktree

# Or force remove all:
rm -rf .puppet-master/worktrees/*
git worktree prune
```

### Issue: Tests failing after changes
**Check:**
1. Did you replace entire methods (not just sections)?
2. Are there syntax errors? `npm run build`
3. Are imports correct? Check for missing types
4. Run specific test: `npm test -- <test-file> -t "<test-name>"`

---

## Performance Tuning

### Adjust Concurrency
```json
{
  "execution": {
    "parallel": {
      "maxConcurrency": 5  // Increase for more parallelism
    }
  }
}
```

**Guidelines:**
- **CPU-bound tasks:** `maxConcurrency = CPU cores`
- **I/O-bound tasks:** `maxConcurrency = 2-3x CPU cores`
- **API rate limits:** `maxConcurrency = rate limit / task rate`
- **Memory constrained:** `maxConcurrency = RAM / avg task memory`

### Continue on Failure
```json
{
  "execution": {
    "parallel": {
      "continueOnFailure": true  // Don't stop on first failure
    }
  }
}
```

**Use Cases:**
- Testing multiple independent features
- Data processing pipelines (process all, report errors at end)
- Validation suites (run all validators)

---

## Metrics to Monitor

### Execution Metrics
- `maxConcurrencyUsed`: Actual parallelism achieved
- `totalDurationMs`: Total execution time
- `completedSubtasks`: Number succeeded
- `failedSubtasks`: Number failed
- `conflictSubtasks`: Number with merge conflicts

### Performance Metrics
- **Speedup ratio:** `sequential_time / parallel_time`
- **Parallel efficiency:** `speedup / maxConcurrencyUsed`
- **Merge overhead:** `merge_time / total_time`

### Safety Metrics
- **Merge success rate:** `successful_merges / total_merges`
- **Conflict rate:** `conflicts / total_merges`
- **Worktree cleanup rate:** `cleaned / created`

---

## Next Steps After Implementation

1. **Test with real PRDs:** Start with small tasks, gradually increase
2. **Monitor performance:** Compare sequential vs parallel execution
3. **Tune concurrency:** Adjust based on system resources
4. **Document patterns:** Which task types benefit from parallelism?
5. **Train team:** How to mark tasks as parallel-eligible
6. **Add telemetry:** Track parallel execution usage and success

---

## Quick Command Reference

```bash
# Build
npm run build

# Run all tests
npm test

# Run specific test file
npm test worktree-manager.test.ts

# Run specific test
npm test -- -t "concurrent merge"

# Check for compilation errors
npx tsc --noEmit

# Lint code
npm run lint

# Format code
npm run format

# Check git worktrees
git worktree list

# Clean up stuck worktrees
git worktree prune

# View parallel execution logs
grep -i "parallel" logs/puppet-master.log | tail -50

# Check merge status
git log --oneline --graph --all --decorate | head -30
```

---

## Support Resources

- **Detailed Analysis:** `PARALLEL_EXECUTION_MINIMAL_CHANGES.md`
- **Visual Guide:** `PARALLEL_EXECUTION_VISUAL.md`
- **Architecture:** `ARCHITECTURE.md` (Section on Parallel Execution)
- **Git Worktrees:** https://git-scm.com/docs/git-worktree
- **Promise Mutex Pattern:** https://javascript.info/promise-basics

---

## Estimated Timeline

- **Change 1:** 30 minutes (+ 30 min testing)
- **Change 2:** 45 minutes (+ 30 min testing)
- **Change 3:** 60 minutes (+ 45 min testing)
- **Integration Testing:** 60 minutes
- **Documentation:** 30 minutes

**Total:** ~5-6 hours

---

## Success Criteria

✅ All unit tests pass  
✅ All integration tests pass  
✅ Parallel execution activates for enabled tasks  
✅ Merges happen sequentially without conflicts  
✅ Sequential execution still works (fallback)  
✅ No git repository corruption  
✅ Performance improvement > 2x for independent tasks  
✅ Proper error handling and rollback  

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0  
**Maintainer:** Code Reviewer Agent
