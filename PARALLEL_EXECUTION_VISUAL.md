# Parallel Execution - Visual Guide

## Current Flow (Sequential)

```
┌─────────────────────────────────────────────────────────────┐
│                      runLoop()                              │
│                    (orchestrator.ts)                        │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
    ┌───────────────────────────────┐
    │ Get Current Subtask (ONE)     │
    └───────────┬───────────────────┘
                │
                ▼
    ┌───────────────────────────────┐
    │ Execute Iteration             │
    │ (Sequential, one at a time)   │
    └───────────┬───────────────────┘
                │
                ▼
    ┌───────────────────────────────┐
    │ Commit to Main Branch         │
    └───────────┬───────────────────┘
                │
                ▼
    ┌───────────────────────────────┐
    │ Advance to Next Subtask       │
    └───────────┬───────────────────┘
                │
                └─────► Loop (Next Subtask)


Timeline for 3 Subtasks:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0s         60s        120s       180s
├──────────┼──────────┼──────────┤
│ Subtask1 │ Subtask2 │ Subtask3 │  ← Sequential execution
└──────────┴──────────┴──────────┘
                                      Total: 180 seconds
```

---

## New Flow (Parallel with Safe Merge)

```
┌─────────────────────────────────────────────────────────────┐
│                      runLoop()                              │
│                    (orchestrator.ts)                        │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
    ┌───────────────────────────────┐
    │ Get Current Task              │ ◄── CHANGE 1: New decision point
    └───────────┬───────────────────┘
                │
                ├──► task.parallel === true? ──► YES
                │                                 │
                │                                 ▼
                │                 ┌───────────────────────────────┐
                │                 │ executeTaskInParallel()       │
                │                 │ (Uses existing implementation)│
                │                 └───────────┬───────────────────┘
                │                             │
                │                             ▼
                │                 ╔═══════════════════════════════╗
                │                 ║   ParallelExecutor            ║
                │                 ║   (parallel-executor.ts)      ║
                │                 ╚═══════════╦═══════════════════╝
                │                             │
                │                             ├─────────────────────┐
                │                             │                     │
                │                             ▼                     ▼
                │                   ┌─────────────────┐   ┌─────────────────┐
                │                   │   Worktree 1    │   │   Worktree 2    │
                │                   │ ┌─────────────┐ │   │ ┌─────────────┐ │
                │                   │ │  Subtask A  │ │   │ │  Subtask B  │ │
                │                   │ │  (execute)  │ │   │ │  (execute)  │ │
                │                   │ └─────────────┘ │   │ └─────────────┘ │
                │                   └────────┬────────┘   └────────┬────────┘
                │                            │                     │
                │                            └──────┬──────────────┘
                │                                   │ ◄── CHANGE 3: Wait for
                │                                   │     all executions
                │                                   ▼
                │                   ╔═══════════════════════════════╗
                │                   ║   Sequential Merge Phase      ║
                │                   ║   (CHANGE 3: New structure)   ║
                │                   ╚═══════════╦═══════════════════╝
                │                               │
                │                               ▼
                │                   ┌───────────────────────────────┐
                │                   │ Merge Worktree 1 to Main      │ ◄─┐
                │                   └───────────┬───────────────────┘   │
                │                               │                       │
                │                               ▼                       │
                │                   ┌───────────────────────────────┐   │
                │                   │ Merge Worktree 2 to Main      │   │ CHANGE 2:
                │                   └───────────┬───────────────────┘   │ mergeLock
                │                               │                       │ protects
                │                               ▼                       │ this zone
                │                   ┌───────────────────────────────┐   │
                │                   │ Merge Worktree 3 to Main      │ ◄─┘
                │                   └───────────┬───────────────────┘
                │                               │
                │                               ▼
                │                 ┌───────────────────────────────┐
                │                 │ All Merges Complete           │
                │                 └───────────┬───────────────────┘
                │                             │
                └◄────────────────────────────┘
                │
                ▼
    ┌───────────────────────────────┐
    │ Advance to Next Task          │
    └───────────┬───────────────────┘
                │
                └─────► Loop (Next Task)


Timeline for 3 Subtasks (Parallel-Enabled Task):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0s         60s    63s
├──────────┤──────┤
│ All 3    │Merge │  ← Concurrent execution, sequential merge
│ Subtasks │A+B+C │
│ Execute  │      │
│ In       │      │
│ Parallel │      │
└──────────┴──────┘
                     Total: 63 seconds (3x speedup!)
```

---

## CHANGE 2: Merge Lock Mechanism

### Without Lock (UNSAFE)

```
Thread 1 (Merge Subtask A):          Thread 2 (Merge Subtask B):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
T0: git checkout main                T0: git checkout main
T1: Read .git/refs/heads/main        T1: Read .git/refs/heads/main
T2: git merge worktree/A             T2: git merge worktree/B
T3: Update main ref                  T3: Update main ref ◄── CONFLICT!
    └─► main = commit-A                  └─► main = commit-B
    
    ❌ RESULT: Commit-A lost! Repository corrupted!
    
    .git/refs/heads/main contains only commit-B
    Commit-A is orphaned (not reachable from main)
```

### With Lock (SAFE)

```
Thread 1 (Merge Subtask A):          Thread 2 (Merge Subtask B):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
T0: Acquire mergeLock ✓              T0: Try acquire mergeLock
T1: git checkout main                    └─► WAIT (lock held by T1)
T2: git merge worktree/A             T1: [Waiting...]
T3: Update main ref                  T2: [Waiting...]
    └─► main = commit-A              T3: [Waiting...]
T4: Release mergeLock                T4: Acquire mergeLock ✓
                                     T5: git checkout main
                                     T6: git merge worktree/B
                                         (sees commit-A already merged)
                                     T7: Update main ref
                                         └─► main = commit-A + commit-B
                                     T8: Release mergeLock
    
    ✅ RESULT: Both commits merged correctly!
    
    .git/refs/heads/main: ... ← commit-A ← commit-B
```

---

## CHANGE 2: Implementation Detail

### Lock State Diagram

```
                    ┌─────────────────────────────────────┐
                    │    Initial State                    │
                    │    mergeLock = Promise.resolve()    │
                    └────────────┬────────────────────────┘
                                 │
                                 │ mergeWorktree('agent-1') called
                                 ▼
                    ┌─────────────────────────────────────┐
                    │  1. Save current promise to          │
                    │     previousMerge                    │
                    │  2. Create new pending promise       │
                    │     (mergeLock)                      │
                    │  3. await previousMerge              │
                    └────────────┬────────────────────────┘
                                 │
                                 │ (previousMerge resolves)
                                 ▼
                    ┌─────────────────────────────────────┐
                    │  Execute merge operations:           │
                    │  - git checkout                      │
                    │  - git merge                         │
                    │  - cleanup                           │
                    └────────────┬────────────────────────┘
                                 │
                                 │ (finally block)
                                 ▼
                    ┌─────────────────────────────────────┐
                    │  Resolve current mergeLock          │
                    │  (next merge can proceed)            │
                    └────────────┬────────────────────────┘
                                 │
                                 │ mergeWorktree('agent-2') called
                                 ▼
                    ┌─────────────────────────────────────┐
                    │  Repeat process...                   │
                    │  (waits for agent-1's merge first)   │
                    └─────────────────────────────────────┘
```

### Code Flow

```typescript
// State before any merges:
mergeLock = Promise.resolve() ─────┐
                                   │ (already resolved, no wait)
                                   │
// Agent 1 starts merge:            │
previousMerge = mergeLock ◄────────┘
let resolveMerge1: () => void;
mergeLock = new Promise((resolve) => {
  resolveMerge1 = resolve; ──────┐
});                               │ (pending)
await previousMerge; ───────────┐ │
                                │ │
// Merge agent 1...              │ │
finally { resolveMerge1!(); }───┼─┘
                                │ (resolves)
                                │
// Agent 2 starts merge:         │
previousMerge = mergeLock ◄─────┘
let resolveMerge2: () => void;
mergeLock = new Promise((resolve) => {
  resolveMerge2 = resolve; ──────┐
});                               │ (pending)
await previousMerge; ──────────┐  │
(waits for agent 1)             │  │
                                │  │
// Merge agent 2...              │  │
finally { resolveMerge2!(); }───┼──┘
                                │ (resolves)
                                └─► Next merge can proceed
```

---

## CHANGE 3: Execution Phases Restructure

### Before (Unsafe Interleaved)

```
Level 0: [Subtask A, Subtask B] (independent)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thread A:                      Thread B:
┌──────────────────┐          ┌──────────────────┐
│ Execute Subtask A│          │ Execute Subtask B│
└────────┬─────────┘          └────────┬─────────┘
         │                              │
         │ Done at T=60s                │ Done at T=55s
         ▼                              ▼
┌──────────────────┐          ┌──────────────────┐
│ Merge Worktree A │          │ Merge Worktree B │ ◄── PROBLEM!
└──────────────────┘          └──────────────────┘     Both try to
    ▲                              ▲                    merge at
    └──────────────────────────────┘                    same time!
           ❌ Race condition!
```

### After (Safe Sequential Merge)

```
Level 0: [Subtask A, Subtask B] (independent)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 1: Execute (Parallel)
┌─────────────────────────────────────────────────────────┐
│ Thread A:                   Thread B:                   │
│ ┌──────────────────┐       ┌──────────────────┐        │
│ │ Execute Subtask A│       │ Execute Subtask B│        │
│ └────────┬─────────┘       └────────┬─────────┘        │
│          │                           │                  │
│          │ Done at T=60s             │ Done at T=55s    │
│          ▼                           ▼                  │
│ ┌──────────────────┐       ┌──────────────────┐        │
│ │ Save result      │       │ Save result      │        │
│ └──────────────────┘       └──────────────────┘        │
└────────────┬────────────────────────┬──────────────────┘
             │                        │
             └────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │ await Promise.all()        │ ◄── Synchronization point
         │ (All executions complete)  │
         └────────────┬───────────────┘
                      │
                      ▼
Phase 2: Merge (Sequential)
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  for (const subtask of level) {  ◄── Sequential loop    │
│                                                          │
│    T=60s: ┌──────────────────┐                          │
│           │ Merge Worktree A │  ◄── mergeLock acquired  │
│           └────────┬─────────┘                          │
│                    │ (1 second)                         │
│    T=61s:          ▼                                    │
│           ┌──────────────────┐                          │
│           │ Merge Worktree B │  ◄── mergeLock acquired  │
│           └────────┬─────────┘                          │
│                    │ (1 second)                         │
│    T=62s:          ▼                                    │
│           ┌──────────────────┐                          │
│           │ All merged!      │  ✅ Safe!                │
│           └──────────────────┘                          │
│  }                                                       │
└─────────────────────────────────────────────────────────┘
```

---

## Dependency Graph Handling

### Example: Complex Dependencies

```
Task: Build and Test System
├─ Subtask A: Compile Core (no dependencies)
├─ Subtask B: Compile Utils (no dependencies)
├─ Subtask C: Link Binary (depends on A, B)
└─ Subtask D: Run Tests (depends on C)

Dependency Graph:
     A ──┐
         ├──> C ──> D
     B ──┘

Execution Levels:
Level 0: [A, B]        ← Can run in parallel
Level 1: [C]           ← Must wait for A and B
Level 2: [D]           ← Must wait for C
```

### Execution Timeline

```
Parallel Execution with Safe Merge:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0s         60s    62s        122s  123s       183s  184s
├──────────┤──────┤──────────┤─────┤──────────┤─────┤
│ Level 0: │Merge │ Level 1: │Merge│ Level 2: │Merge│
│ A + B    │A,B   │ C        │C    │ D        │D    │
│ Parallel │Seq.  │ Serial   │     │ Serial   │     │
└──────────┴──────┴──────────┴─────┴──────────┴─────┘
                                    Total: 184 seconds

Sequential Execution (No Parallel):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0s         60s        120s       180s       240s
├──────────┼──────────┼──────────┼──────────┤
│ A        │ B        │ C        │ D        │
└──────────┴──────────┴──────────┴──────────┘
                                    Total: 240 seconds

Speedup: 184s vs 240s = 30% faster
(Even with dependencies, parallelism helps!)
```

---

## Safety Guarantees

### Multi-Layer Protection

```
┌──────────────────────────────────────────────────────────┐
│ Layer 1: Architectural                                   │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Execution Phase (Parallel)                           │ │
│ │ - Each subtask gets isolated worktree                │ │
│ │ - No shared state between threads                    │ │
│ │ - Worktrees on separate branches                     │ │
│ └──────────────────────────────────────────────────────┘ │
│                          │                                │
│                          ▼                                │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Merge Phase (Sequential)                             │ │
│ │ - Merges happen one at a time                        │ │
│ │ - Results applied in dependency order                │ │
│ └──────────────────────────────────────────────────────┘ │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│ Layer 2: Lock Mechanism                                  │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ WorktreeManager.mergeLock                            │ │
│ │ - Promise-based mutex                                │ │
│ │ - Enforces sequential access to git operations       │ │
│ │ - Even if called concurrently, executes serially     │ │
│ └──────────────────────────────────────────────────────┘ │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│ Layer 3: Git Isolation                                   │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Git Worktrees                                        │ │
│ │ - Separate working directories                       │ │
│ │ - Shared .git database (safe for reads)              │ │
│ │ - Independent branches                               │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘

Defense in Depth:
✅ Layer 1 prevents race conditions by design
✅ Layer 2 catches concurrency bugs if Layer 1 fails
✅ Layer 3 provides filesystem-level isolation
```

---

## Configuration Options

### Enable Parallel Execution

```typescript
// config.ts
{
  execution: {
    parallel: {
      enabled: true,          // Global enable/disable
      maxConcurrency: 3,      // Max concurrent subtasks
      continueOnFailure: false, // Stop if any subtask fails?
      mergeResults: true,     // Merge back to main branch?
      targetBranch: undefined // Target branch (default: current)
    }
  }
}
```

### Per-Task Control

```typescript
// PRD task definition
{
  id: 'fast-parallel-task',
  parallel: true,  // ✅ Use parallel execution for this task
  subtasks: [
    { id: 'sub-1', ... },
    { id: 'sub-2', ... },
    { id: 'sub-3', ... }
  ]
}

// vs.

{
  id: 'sequential-task',
  parallel: false, // ❌ Force sequential (e.g., database migrations)
  subtasks: [
    { id: 'sub-1', ... },
    { id: 'sub-2', ... }
  ]
}
```

---

## Rollback Strategy

### Graceful Degradation

```
┌──────────────────────────────────────────────────────────┐
│ If parallel execution fails at runtime:                  │
│                                                           │
│ 1. Catch error in executeTaskInParallel()                │
│ 2. Log warning: "Parallel execution failed, falling back"│
│ 3. Call parallelExecutor.executeSequential()             │
│ 4. Continue with sequential execution                    │
│                                                           │
│ ✅ System continues to work (slower, but safe)           │
└──────────────────────────────────────────────────────────┘
```

### Config-Based Disable

```typescript
// Quick disable without code changes:
{
  execution: {
    parallel: {
      enabled: false  // ◄── ONE LINE CHANGE
    }
  }
}

// System reverts to proven sequential execution
// No other changes needed
```

---

## Performance Comparison

### Scenario 1: 5 Independent Subtasks (60s each)

```
Sequential:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0s    60s   120s  180s  240s  300s
├─────┼─────┼─────┼─────┼─────┤
│ S1  │ S2  │ S3  │ S4  │ S5  │
└─────┴─────┴─────┴─────┴─────┘
Total: 300 seconds

Parallel (maxConcurrency: 3):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0s          60s         120s  123s
├───────────┼───────────┤─────┤
│ S1,S2,S3  │ S4, S5    │Merge│
│ (3 slots) │ (2 slots) │ (5) │
└───────────┴───────────┴─────┘
Total: 123 seconds (2.4x faster!)
```

### Scenario 2: Chain of Dependencies

```
Task: A → B → C → D → E (each depends on previous)

Sequential:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0s    60s   120s  180s  240s  300s
├─────┼─────┼─────┼─────┼─────┤
│ A   │ B   │ C   │ D   │ E   │
└─────┴─────┴─────┴─────┴─────┘
Total: 300 seconds

Parallel (maxConcurrency: 3):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0s    60s   120s  180s  240s  300s 305s
├─────┼─────┼─────┼─────┼─────┤────┤
│ A   │ B   │ C   │ D   │ E   │Mrg │
└─────┴─────┴─────┴─────┴─────┴────┘
Total: 305 seconds (no speedup - dependencies prevent parallelism)
                    merge overhead adds 5s
```

**Conclusion:** Parallel execution helps ONLY when subtasks are independent or have limited dependencies. The dependency analyzer ensures we maximize parallelism where possible.

---

## Error Handling

### Merge Conflict Flow

```
┌────────────────────────────────────────────────────────┐
│ Subtask A completes, starts merge                     │
└───────────┬────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────┐
│ git merge worktree/A                                   │
│ ↓                                                      │
│ CONFLICT in file.ts                                    │
└───────────┬────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────┐
│ MergeResult {                                          │
│   success: false,                                      │
│   conflictFiles: ['file.ts'],                          │
│   sourceBranch: 'worktree/A',                          │
│   targetBranch: 'main',                                │
│   error: 'Merge conflict detected'                     │
│ }                                                      │
└───────────┬────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────┐
│ git merge --abort                                      │
│ (Clean up conflict state)                              │
└───────────┬────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────┐
│ Orchestrator: generateConflictResolutionSubtask()      │
│ Creates new subtask to manually resolve conflict       │
└────────────────────────────────────────────────────────┘
```

### Execution Failure Flow

```
┌────────────────────────────────────────────────────────┐
│ Subtask B execution fails                              │
└───────────┬────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────┐
│ SubtaskExecutionResult {                               │
│   success: false,                                      │
│   error: 'Platform runner timeout',                    │
│   iterationResult: undefined                           │
│ }                                                      │
└───────────┬────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────┐
│ if (config.continueOnFailure === false)                │
│   → Stop processing remaining levels                   │
│   → Mark dependent subtasks as skipped                 │
│ else                                                   │
│   → Continue with other subtasks                       │
│   → Report failure at end                              │
└────────────────────────────────────────────────────────┘
```

---

## Summary

### What Changes

1. **orchestrator.ts**: Add 10 lines to check for parallel-enabled tasks
2. **worktree-manager.ts**: Add 1 property + wrap merge in mutex
3. **parallel-executor.ts**: Restructure execution/merge phases (no new logic)

### What Stays The Same

- ✅ All existing sequential execution logic
- ✅ All existing parallel execution implementation
- ✅ Git worktree management
- ✅ Dependency analysis
- ✅ Error handling
- ✅ Worker/Reviewer separation
- ✅ Gate validation
- ✅ Auto-advancement

### Impact

- 🚀 Tasks with `parallel: true` execute concurrently (up to maxConcurrency)
- 🔒 Git merges are safe (sequential with mutex protection)
- 🎯 Execution order respects dependencies automatically
- 📉 Zero risk to existing sequential execution
- 🛡️ Defense-in-depth: architectural + lock + git isolation

**Bottom line:** Minimal code changes activate fully-implemented parallel execution infrastructure with safety guarantees.
