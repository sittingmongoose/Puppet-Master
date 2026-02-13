# Orchestrator Platform Runner Implementation Guide

## Critical Finding Summary

The orchestrator's `ExecutionEngine` bypasses the platform runner system entirely. It spawns raw CLI processes instead of using the unified `get_runner()` + `ExecutionRequest` pattern that interview failover uses correctly.

**Impact**: 
- ❌ No quota enforcement during orchestrator iterations
- ❌ No automatic failover on quota exhaustion
- ❌ Inconsistent behavior between interview and orchestrator
- ❌ Usage tracking incomplete

## Concrete Code Changes Needed

### Change 1: Refactor ExecutionEngine::execute_iteration

**File**: `src/core/execution_engine.rs`  
**Lines**: 50-89 (entire method)  
**Action**: Replace with platform runner-based implementation

```rust
// ADD at top of file with other imports
use crate::platforms::{get_runner, quota_manager::global_quota_manager};
use crate::types::ExecutionRequest;
use crate::interview::failover::is_quota_error;

// REPLACE execute_iteration method (lines 50-89)
pub async fn execute_iteration(&self, context: &IterationContext) -> Result<IterationResult> {
    let start_time = Instant::now();
    
    // Build fallback chain
    let mut candidates = vec![context.platform];
    candidates.extend_from_slice(fallback_chain_for(context.platform));
    
    let mut last_error: Option<String> = None;
    
    for (attempt, candidate_platform) in candidates.iter().enumerate() {
        // 1. Check quota BEFORE execution (like interview does)
        if let Err(e) = global_quota_manager().enforce_quota(*candidate_platform) {
            log::warn!(
                "Quota exhausted for {:?} on tier {}, trying next platform: {}",
                candidate_platform, context.tier_id, e
            );
            last_error = Some(format!("Quota exhausted: {}", e));
            continue;
        }
        
        // 2. Emit platform selection event
        let _ = self.event_sender.send(OrchestratorEvent::PlatformSelected {
            tier_id: context.tier_id.clone(),
            platform: *candidate_platform,
            attempt: attempt as u32,
        });
        
        // 3. Get platform runner (like interview does)
        let runner = match get_runner(*candidate_platform).await {
            Ok(r) => r,
            Err(e) => {
                log::warn!("Failed to get runner for {:?}: {}", candidate_platform, e);
                last_error = Some(format!("Runner unavailable: {}", e));
                continue;
            }
        };
        
        // 4. Build execution request (like interview does)
        let request = ExecutionRequest::new(
            *candidate_platform,
            context.model.clone(),
            context.prompt.clone(),
            context.working_dir.clone(),
        );
        
        // 5. Execute with timeout
        let timeout_duration = Duration::from_secs(
            context.timeout_secs.unwrap_or(300)
        );
        
        let result = match tokio::time::timeout(
            timeout_duration,
            runner.execute(&request)
        ).await {
            Ok(Ok(exec_result)) => exec_result,
            Ok(Err(e)) => {
                let error_msg = e.to_string();
                
                // 6. Check if quota error - try next platform (like interview does)
                if is_quota_error(&error_msg) {
                    log::warn!(
                        "Quota error from {:?}, trying next platform: {}",
                        candidate_platform, error_msg
                    );
                    last_error = Some(format!("Quota error: {}", error_msg));
                    continue;
                }
                
                // Non-quota error - return immediately
                return Ok(IterationResult {
                    signal: CompletionSignal::Error(error_msg),
                    duration_secs: start_time.elapsed().as_secs(),
                    output_lines: 0,
                    output: String::new(),
                });
            }
            Err(_) => {
                // Timeout - try next platform
                log::warn!("Timeout for {:?}, trying next platform", candidate_platform);
                last_error = Some("Execution timeout".to_string());
                continue;
            }
        };
        
        // 7. Parse result
        if result.success {
            let output = result.output.unwrap_or_default();
            let signal = self.parse_completion_signal_from_output(&output);
            
            return Ok(IterationResult {
                signal,
                duration_secs: start_time.elapsed().as_secs(),
                output_lines: output.lines().count(),
                output,
            });
        } else {
            let error_msg = result.error_message.unwrap_or_default();
            
            // Check if quota error again (like interview does)
            if is_quota_error(&error_msg) {
                log::warn!(
                    "Quota error from {:?}, trying next platform: {}",
                    candidate_platform, error_msg
                );
                last_error = Some(format!("Quota error: {}", error_msg));
                continue;
            }
            
            // Non-quota error
            return Ok(IterationResult {
                signal: CompletionSignal::Error(error_msg),
                duration_secs: start_time.elapsed().as_secs(),
                output_lines: 0,
                output: String::new(),
            });
        }
    }
    
    // All platforms exhausted
    Err(anyhow!(
        "All platforms exhausted for tier {}: {}",
        context.tier_id,
        last_error.unwrap_or_else(|| "Unknown error".to_string())
    ))
}

// ADD new helper method (after execute_iteration)
/// Parse completion signal from full output string
fn parse_completion_signal_from_output(&self, output: &str) -> CompletionSignal {
    // Check each line for signals
    for line in output.lines() {
        if let Some(signal) = self.parse_completion_signal(line) {
            return signal;
        }
    }
    
    // Default to complete if no explicit signal found
    CompletionSignal::Complete
}
```

### Change 2: Remove Obsolete Methods

**File**: `src/core/execution_engine.rs`

**Delete these methods** (they're no longer needed with platform runners):
- `spawn_platform` (lines 127-155)
- `capture_output` (lines 157-255)
- `ensure_terminated` (lines 303-320)
- `has_quota` (lines 327-334) - replaced by `global_quota_manager()`

**Keep but simplify**:
- `select_platform_for_context` - logic is now inline in execute_iteration
- `parse_completion_signal` - still needed for line-by-line parsing

### Change 3: Update ExecutionEngine Constructor

**File**: `src/core/execution_engine.rs`  
**Lines**: 34-48 (ExecutionEngine::new method)

```rust
// REPLACE new method signature
pub fn new(
    event_sender: Sender<OrchestratorEvent>,
    stall_timeout_secs: u64,
    stall_max_repeats: usize,
) -> Self {
    Self {
        // platforms field REMOVED - we use global platform registry instead
        event_sender,
        stall_timeout_secs,
        stall_max_repeats,
    }
}
```

**File**: `src/core/execution_engine.rs`  
**Lines**: 22-32 (ExecutionEngine struct definition)

```rust
// REPLACE struct definition
#[derive(Debug)]
pub struct ExecutionEngine {
    // ❌ REMOVED: platforms: Vec<PlatformConfig>,
    /// Event sender for real-time updates
    event_sender: Sender<OrchestratorEvent>,
    /// Stall timeout (seconds without output) - NOTE: Currently unused with platform runners
    stall_timeout_secs: u64,
    /// Max repeated outputs before considering stalled - NOTE: Currently unused with platform runners
    stall_max_repeats: usize,
}
```

### Change 4: Update Orchestrator Initialization

**File**: `src/core/orchestrator.rs`  
**Lines**: 203-209

```rust
// REPLACE initialization code
// Old:
// let platforms = config.platforms.values().cloned().collect::<Vec<_>>();
// let iteration_executor: Arc<dyn IterationExecutor> = Arc::new(ExecutionEngine::new(
//     platforms,
//     event_sender.clone(),
//     120,
//     10,
// ));

// New:
let iteration_executor: Arc<dyn IterationExecutor> = Arc::new(ExecutionEngine::new(
    event_sender.clone(),
    120,  // stall_timeout_secs (unused with platform runners but kept for future)
    10,   // stall_max_repeats (unused with platform runners but kept for future)
));
```

### Change 5: Add New OrchestratorEvent

**File**: `src/core/state_machine.rs`  
**Find**: `pub enum OrchestratorEvent {`  
**Add**: New variant to the enum

```rust
pub enum OrchestratorEvent {
    // ... existing events ...
    
    /// Platform selected for iteration (for tracking failover)
    PlatformSelected {
        tier_id: String,
        platform: Platform,
        attempt: u32,
    },
    
    // ... rest of existing events ...
}
```

### Change 6: Add Config Flag for Failover (Optional)

**File**: `src/types/config.rs`  
**Lines**: 71-89 (OrchestratorConfig struct)

```rust
// ADD new field to OrchestratorConfig
pub struct OrchestratorConfig {
    pub max_depth: u32,
    pub max_iterations: u32,
    pub progress_file: String,
    pub prd_file: String,
    pub session_prefix: String,
    pub enable_git: bool,
    pub enable_verification: bool,
    pub enable_parallel_execution: bool,
    pub enable_platform_router: bool,
    
    // NEW: Enable automatic platform failover on quota exhaustion
    #[serde(default = "default_true")]
    pub enable_quota_failover: bool,
    
    // NEW: Maximum number of platform failover attempts
    #[serde(default = "default_max_failover")]
    pub max_failover_attempts: usize,
}

// ADD helper functions at module level
fn default_true() -> bool {
    true
}

fn default_max_failover() -> usize {
    5
}

// UPDATE Default implementation
impl Default for OrchestratorConfig {
    fn default() -> Self {
        Self {
            // ... existing defaults ...
            enable_quota_failover: true,
            max_failover_attempts: 5,
        }
    }
}
```

## Testing Checklist

### Unit Tests to Add

**File**: `src/core/execution_engine.rs` (in tests module)

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_quota_check_before_execution() {
        // Setup: Set quota to 0 for cursor
        // Execute: execute_iteration with cursor as primary
        // Assert: Should attempt failover to codex
    }
    
    #[tokio::test]
    async fn test_quota_error_triggers_failover() {
        // Setup: Mock runner that returns quota error
        // Execute: execute_iteration
        // Assert: Should try next platform
    }
    
    #[tokio::test]
    async fn test_all_platforms_exhausted() {
        // Setup: All platforms return quota errors
        // Execute: execute_iteration
        // Assert: Returns Err with "All platforms exhausted"
    }
    
    #[tokio::test]
    async fn test_platform_selected_event_emitted() {
        // Setup: Normal execution
        // Execute: execute_iteration
        // Assert: PlatformSelected event was emitted
    }
}
```

### Integration Test

**File**: `tests/orchestrator_quota_failover_test.rs` (new file)

```rust
#[tokio::test]
async fn test_orchestrator_respects_quota() {
    // 1. Set cursor quota to 0
    // 2. Start orchestrator with cursor as primary
    // 3. Verify it fails over to codex
    // 4. Verify usage tracking records both attempts
}

#[tokio::test]
async fn test_orchestrator_matches_interview_behavior() {
    // 1. Run interview with quota exhaustion
    // 2. Run orchestrator with same quota settings
    // 3. Verify both follow same failover chain
    // 4. Verify both emit same events
}
```

## Verification Steps

1. **Build check**:
   ```bash
   cd puppet-master-rs
   cargo check
   ```

2. **Quota manager integration**:
   ```bash
   cargo test quota_manager
   ```

3. **Execution engine tests**:
   ```bash
   cargo test execution_engine
   ```

4. **Full orchestrator test**:
   ```bash
   cargo test orchestrator
   ```

5. **Manual verification**:
   - Set cursor quota to 0 in config
   - Run orchestrator
   - Verify it automatically uses codex/claude
   - Check logs for "Quota exhausted" messages
   - Verify `PlatformSelected` events in output

## Configuration Example

**File**: Example config with quota settings

```yaml
orchestrator:
  max_depth: 3
  max_iterations: 10
  enable_quota_failover: true
  max_failover_attempts: 5

platforms:
  cursor:
    platform: "cursor"
    model: "claude-3-5-sonnet"
    enabled: true
    quota: 10  # Will be enforced by global_quota_manager
    
  codex:
    platform: "codex"
    model: "gpt-5"
    enabled: true
    quota: 20
    
  claude:
    platform: "claude"
    model: "claude-3-5-sonnet"
    enabled: true
    quota: 50

tiers:
  phase:
    platform: "cursor"  # Primary platform
    model: "claude-3-5-sonnet"
    max_iterations: 3
    
  task:
    platform: "cursor"
    model: "claude-3-5-sonnet"
    max_iterations: 5
```

## Rollback Plan

If issues arise:

1. **Revert commit** - All changes are in execution_engine.rs + orchestrator.rs
2. **Feature flag** - Add `use_platform_runners: bool` to config
3. **Parallel implementation** - Keep old code path, make new path opt-in

## Estimated Effort

- **Implementation**: 2-3 hours
- **Testing**: 1-2 hours
- **Documentation**: 30 minutes
- **Total**: 4-6 hours

## Priority

**P0 - Critical**: This blocks proper quota enforcement in orchestrator mode, which is a core feature requirement.

## Dependencies

- ✅ Platform runners already implemented (`src/platforms/`)
- ✅ Global quota manager exists (`quota_manager::global_quota_manager()`)
- ✅ Interview failover pattern validated and working
- ✅ ExecutionRequest structure defined
- ⚠️ Need to verify `is_quota_error()` is accessible from execution_engine

## Potential Issues

### Issue 1: Stall Detection

**Problem**: Platform runners don't provide streaming output like raw process spawn.  
**Impact**: Can't detect stalled output in real-time.  
**Mitigation**: Rely on timeout-based detection only.

### Issue 2: Completion Signal Parsing

**Problem**: Platform runners return full output as string, not line-by-line.  
**Impact**: Signals may be missed if buried in output.  
**Mitigation**: `parse_completion_signal_from_output` checks all lines.

### Issue 3: Real-time Events

**Problem**: No incremental output events during execution.  
**Impact**: GUI won't show live output like before.  
**Mitigation**: Accept this limitation or extend PlatformRunner trait later.

## Success Criteria

✅ ExecutionEngine uses `get_runner()` instead of raw process spawn  
✅ Quota checks happen before each iteration  
✅ Failover occurs automatically on quota exhaustion  
✅ Usage tracking captures all orchestrator executions  
✅ Interview and orchestrator behave identically  
✅ All existing tests still pass  
✅ New quota failover tests pass  

## Next Actions

1. Review this implementation plan
2. Create feature branch: `feature/orchestrator-platform-runners`
3. Implement changes in order (Change 1-6)
4. Add unit tests
5. Manual testing with quota limits
6. Create PR with before/after behavior comparison
7. Deploy behind feature flag initially
