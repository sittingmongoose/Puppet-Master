# Orchestrator Failover - Visual Architecture

## Current State (BROKEN) ❌

```
┌─────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATOR                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
                  ┌────────────────────┐
                  │ ExecutionEngine    │
                  │ execute_iteration  │
                  └────────┬───────────┘
                           │
                           │ ❌ NO quota check
                           │ ❌ NO failover
                           │
                           ▼
                  ┌────────────────────┐
                  │ tokio::Command     │
                  │ spawn_platform     │
                  └────────┬───────────┘
                           │
                           │ RAW CLI SPAWN
                           │
                           ▼
                  ┌────────────────────┐
                  │ cursor --prompt X  │
                  │ (Direct Process)   │
                  └────────────────────┘

PROBLEMS:
❌ Bypasses platform runners
❌ Bypasses quota manager
❌ No automatic failover
❌ Hardcoded CLI args
❌ Inconsistent with interview
```

## Target State (CORRECT) ✅

```
┌─────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATOR                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
                  ┌────────────────────┐
                  │ ExecutionEngine    │
                  │ execute_iteration  │
                  └────────┬───────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
    ┌─────────┐      ┌─────────┐     ┌─────────┐
    │ Cursor  │      │ Codex   │     │ Claude  │
    │ (prim.) │      │ (fail1) │     │ (fail2) │
    └────┬────┘      └────┬────┘     └────┬────┘
         │                │                │
         │ ✅ Check quota │                │
         ▼                │                │
    ┌──────────────┐      │                │
    │ QuotaManager │      │                │
    │ enforce()    │      │                │
    └────┬─────────┘      │                │
         │                │                │
         │ Quota OK?      │                │
         ├─YES────────────┤                │
         │                │                │
         │ ✅ get_runner()│                │
         ▼                │                │
    ┌──────────────┐      │                │
    │ PlatformReg  │      │                │
    │ get(Cursor)  │      │                │
    └────┬─────────┘      │                │
         │                │                │
         │ ✅ execute()   │                │
         ▼                │                │
    ┌──────────────┐      │                │
    │ CursorRunner │      │                │
    │ .execute()   │      │                │
    └────┬─────────┘      │                │
         │                │                │
         │ Result OK?     │                │
         ├─NO (quota)─────┼────FAILOVER────►
         │                ▼
         │         ┌──────────────┐
         │         │ CodexRunner  │
         │         │ .execute()   │
         │         └────┬─────────┘
         │              │
         │              │ Result OK?
         │              ├─NO (quota)───────►
         │              │              ┌──────────────┐
         │              │              │ ClaudeRunner │
         │              │              │ .execute()   │
         │              │              └────┬─────────┘
         │              │                   │
         ▼              ▼                   ▼
    ┌───────────────────────────────────────────┐
    │         IterationResult                   │
    │   - signal: CompletionSignal              │
    │   - output: String                        │
    │   - duration: u64                         │
    └───────────────────────────────────────────┘

BENEFITS:
✅ Uses platform runners (unified API)
✅ Quota checked before execution
✅ Automatic failover on quota exhaustion
✅ Consistent with interview behavior
✅ Usage tracking complete
```

## Interview vs Orchestrator Comparison

### BEFORE (Inconsistent) ❌

```
┌──────────────┐         ┌──────────────┐
│  INTERVIEW   │         │ ORCHESTRATOR │
└──────┬───────┘         └──────┬───────┘
       │                        │
       │ ✅ Uses runners        │ ❌ Raw CLI spawn
       │ ✅ Quota check         │ ❌ No quota
       │ ✅ Failover            │ ❌ No failover
       │                        │
       ▼                        ▼
┌──────────────┐         ┌──────────────┐
│ get_runner() │         │ Command::new │
│ + quota      │         │ (direct)     │
└──────────────┘         └──────────────┘
```

### AFTER (Consistent) ✅

```
┌──────────────┐         ┌──────────────┐
│  INTERVIEW   │         │ ORCHESTRATOR │
└──────┬───────┘         └──────┬───────┘
       │                        │
       │ ✅ Uses runners        │ ✅ Uses runners
       │ ✅ Quota check         │ ✅ Quota check
       │ ✅ Failover            │ ✅ Failover
       │                        │
       ▼                        ▼
┌─────────────────────────────────┐
│      get_runner() + quota       │
│      (UNIFIED PATTERN)          │
└─────────────────────────────────┘
```

## Code Flow Comparison

### Interview Failover (CORRECT ✅)

```rust
// src/app.rs::execute_interview_ai_with_failover_static

loop {
    // ✅ STEP 1: Check quota BEFORE execution
    if global_quota_manager().enforce_quota(platform).is_err() {
        log::warn!("Quota exhausted, trying next...");
        failover_manager.failover();
        continue;
    }
    
    // ✅ STEP 2: Get platform runner
    let runner = get_runner(platform).await?;
    
    // ✅ STEP 3: Build unified request
    let request = ExecutionRequest::new(
        platform, model, prompt, working_dir
    );
    
    // ✅ STEP 4: Execute with unified API
    match runner.execute(&request).await {
        Ok(result) if result.success => return Ok(result),
        
        // ✅ STEP 5: Check for quota errors in response
        Ok(result) if is_quota_error(&error) => {
            log::warn!("Quota error, trying next...");
            failover_manager.failover();
            continue;
        }
        
        Err(e) => return Err(e),
    }
}
```

### Orchestrator (BEFORE - WRONG ❌)

```rust
// src/core/execution_engine.rs::execute_iteration (OLD)

pub async fn execute_iteration(...) -> Result<IterationResult> {
    // ❌ NO quota check
    
    // ❌ Raw process spawn
    let mut cmd = Command::new(&platform.executable);
    cmd.arg("--prompt").arg(&context.prompt);
    let mut child = cmd.spawn()?;
    
    // ❌ Manual output capture
    let stdout = child.stdout.take()?;
    let mut reader = BufReader::new(stdout).lines();
    
    // ❌ Manual timeout handling
    while let Ok(Some(line)) = reader.next_line().await {
        // Process line...
    }
    
    // ❌ NO failover logic
}
```

### Orchestrator (AFTER - CORRECT ✅)

```rust
// src/core/execution_engine.rs::execute_iteration (NEW)

pub async fn execute_iteration(...) -> Result<IterationResult> {
    let mut candidates = vec![primary, ...fallbacks];
    
    for platform in candidates {
        // ✅ STEP 1: Check quota
        if global_quota_manager().enforce_quota(platform).is_err() {
            log::warn!("Quota exhausted, trying next...");
            continue;
        }
        
        // ✅ STEP 2: Get runner
        let runner = get_runner(platform).await?;
        
        // ✅ STEP 3: Build request
        let request = ExecutionRequest::new(
            platform, model, prompt, working_dir
        );
        
        // ✅ STEP 4: Execute
        match runner.execute(&request).await {
            Ok(result) if result.success => {
                return Ok(IterationResult {
                    signal: parse_signal(&result.output),
                    output: result.output.unwrap_or_default(),
                    duration_secs: elapsed.as_secs(),
                    output_lines: result.output.lines().count(),
                });
            }
            
            // ✅ STEP 5: Check quota errors
            Ok(result) if is_quota_error(&error) => {
                log::warn!("Quota error, trying next...");
                continue;
            }
            
            Err(e) => return Err(e),
        }
    }
    
    Err(anyhow!("All platforms exhausted"))
}
```

## Failover Chain Example

```
Configuration:
  primary: Cursor (quota: 10 req/hour)
  fallback1: Codex (quota: 20 req/hour)
  fallback2: Claude (quota: 50 req/hour)
  fallback3: Gemini (quota: 100 req/hour)

Execution Trace:
  
  Iteration 11 (Cursor quota exceeded):
  ┌─────────┐
  │ Cursor  │ ← Try first
  └────┬────┘
       │
       │ enforce_quota() → ❌ Quota exhausted (11/10)
       │
       ▼
  ┌─────────┐
  │ Codex   │ ← Automatic failover
  └────┬────┘
       │
       │ enforce_quota() → ✅ OK (3/20)
       │ execute() → ✅ Success
       │
       ▼
  [ITERATION COMPLETE - Used Codex]
  
  Iteration 12 (Both Cursor+Codex exhausted):
  ┌─────────┐
  │ Cursor  │ ← Try first
  └────┬────┘
       │
       │ enforce_quota() → ❌ Quota exhausted (12/10)
       │
       ▼
  ┌─────────┐
  │ Codex   │ ← Try second
  └────┬────┘
       │
       │ enforce_quota() → ❌ Quota exhausted (21/20)
       │
       ▼
  ┌─────────┐
  │ Claude  │ ← Automatic failover
  └────┬────┘
       │
       │ enforce_quota() → ✅ OK (5/50)
       │ execute() → ✅ Success
       │
       ▼
  [ITERATION COMPLETE - Used Claude]
```

## Key Files Modified

```
src/core/execution_engine.rs
├── execute_iteration()      ← ✅ Use get_runner() + quota check
├── spawn_platform()          ← ❌ DELETE (obsolete)
├── capture_output()          ← ❌ DELETE (obsolete)
├── ensure_terminated()       ← ❌ DELETE (obsolete)
├── has_quota()               ← ❌ DELETE (use global_quota_manager)
└── ExecutionEngine::new()    ← ✅ Remove platforms parameter

src/core/orchestrator.rs
└── new()                     ← ✅ Update ExecutionEngine initialization

src/core/state_machine.rs
└── OrchestratorEvent         ← ✅ Add PlatformSelected variant

src/types/config.rs
└── OrchestratorConfig        ← ✅ Add enable_quota_failover flag
```

## Testing Matrix

| Scenario                          | Before | After |
|-----------------------------------|--------|-------|
| Primary platform has quota        | ✅ OK  | ✅ OK |
| Primary quota exhausted           | ❌ FAIL| ✅ FAILOVER |
| All platforms quota exhausted     | ❌ FAIL| ✅ ERROR |
| Platform returns quota error      | ❌ FAIL| ✅ FAILOVER |
| Non-quota error                   | ⚠️ ???| ✅ ERROR |
| Interview + Orchestrator same     | ❌ NO  | ✅ YES |
| Usage tracking complete           | ❌ NO  | ✅ YES |
| Real-time output events           | ✅ YES | ⚠️ LIMITED |

## Performance Considerations

### Current (Raw Process)
- ⚡ Direct spawn (minimal overhead)
- ⚡ Streaming output capture
- ⚡ Real-time events

### With Platform Runners
- ⚠️ Registry lookup overhead (~1-5ms)
- ⚠️ Buffered output (not streaming)
- ⚠️ No incremental events
- ✅ Connection pooling (API platforms)
- ✅ Shared runner instances

**Net Impact**: Acceptable tradeoff for consistency and quota enforcement.

## Migration Path

```
Phase 1: Feature Flag (Week 1)
├── Add use_platform_runners: bool to config
├── Implement new path
└── Default: false (use old path)

Phase 2: Testing (Week 2)
├── Unit tests
├── Integration tests
└── Manual QA with quota limits

Phase 3: Enable (Week 3)
├── Default: true (use new path)
├── Monitor for issues
└── Remove old path if stable

Phase 4: Cleanup (Week 4)
└── Delete old spawn_platform code
```

## Success Metrics

✅ **Functional**:
- Quota enforcement works
- Failover triggers correctly
- Same behavior as interview

✅ **Performance**:
- Iteration time < 110% of current
- No memory leaks
- No deadlocks

✅ **Quality**:
- Test coverage > 90%
- No regressions
- Clean logs

## Summary

**Before**: Orchestrator bypasses entire platform runner system  
**After**: Orchestrator uses same unified pattern as interview  

**Effort**: 2-4 hours  
**Priority**: P0 (Critical)  
**Risk**: Low (well-isolated change, follows proven pattern)
