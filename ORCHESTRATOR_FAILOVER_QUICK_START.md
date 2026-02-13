# Orchestrator Platform Runner Integration - Quick Start

## Problem

**ExecutionEngine bypasses platform runners entirely**, causing:
- ❌ No quota enforcement
- ❌ No automatic failover
- ❌ Inconsistent with interview behavior

## Solution: 6 Code Changes

### 1. Update `execute_iteration` Method
**File**: `src/core/execution_engine.rs` (lines 50-89)
- ✅ Add `use crate::platforms::{get_runner, quota_manager::global_quota_manager};`
- ✅ Add `use crate::interview::failover::is_quota_error;`
- ✅ Replace raw process spawn with `get_runner(platform).await`
- ✅ Add quota check: `global_quota_manager().enforce_quota(platform)`
- ✅ Add failover loop on quota errors
- ✅ Use `ExecutionRequest` instead of CLI args

### 2. Remove Obsolete Methods
**File**: `src/core/execution_engine.rs`
- ❌ DELETE `spawn_platform` (lines 127-155)
- ❌ DELETE `capture_output` (lines 157-255)
- ❌ DELETE `ensure_terminated` (lines 303-320)
- ❌ DELETE `has_quota` (lines 327-334)

### 3. Update ExecutionEngine Constructor
**File**: `src/core/execution_engine.rs` (lines 34-48, 22-32)
- Remove `platforms: Vec<PlatformConfig>` parameter
- Remove `platforms` field from struct
- Update signature: `new(event_sender, stall_timeout_secs, stall_max_repeats)`

### 4. Update Orchestrator Initialization
**File**: `src/core/orchestrator.rs` (lines 203-209)
```rust
// Remove:
// let platforms = config.platforms.values().cloned().collect::<Vec<_>>();

// Update call:
let iteration_executor: Arc<dyn IterationExecutor> = Arc::new(ExecutionEngine::new(
    event_sender.clone(),
    120,
    10,
));
```

### 5. Add PlatformSelected Event
**File**: `src/core/state_machine.rs`
```rust
pub enum OrchestratorEvent {
    // ... existing events ...
    PlatformSelected {
        tier_id: String,
        platform: Platform,
        attempt: u32,
    },
}
```

### 6. Add Config Flags (Optional)
**File**: `src/types/config.rs` (OrchestratorConfig)
```rust
#[serde(default = "default_true")]
pub enable_quota_failover: bool,

#[serde(default = "default_max_failover")]
pub max_failover_attempts: usize,
```

## Example: New execute_iteration

```rust
pub async fn execute_iteration(&self, context: &IterationContext) -> Result<IterationResult> {
    use crate::platforms::{get_runner, quota_manager::global_quota_manager};
    use crate::interview::failover::is_quota_error;
    
    let start_time = Instant::now();
    let mut candidates = vec![context.platform];
    candidates.extend_from_slice(fallback_chain_for(context.platform));
    
    for (attempt, &platform) in candidates.iter().enumerate() {
        // Check quota
        if global_quota_manager().enforce_quota(platform).is_err() {
            continue;
        }
        
        // Get runner
        let runner = get_runner(platform).await?;
        
        // Execute
        let request = ExecutionRequest::new(
            platform,
            context.model.clone(),
            context.prompt.clone(),
            context.working_dir.clone(),
        );
        
        match runner.execute(&request).await {
            Ok(result) if result.success => {
                return Ok(IterationResult {
                    signal: parse_signal(&result.output.unwrap_or_default()),
                    duration_secs: start_time.elapsed().as_secs(),
                    output: result.output.unwrap_or_default(),
                    output_lines: result.output.as_ref().unwrap_or(&String::new()).lines().count(),
                });
            }
            Ok(result) if is_quota_error(&result.error_message.unwrap_or_default()) => {
                continue; // Try next platform
            }
            _ => return Err(/* non-quota error */),
        }
    }
    
    Err(anyhow!("All platforms exhausted"))
}
```

## Pattern Comparison

### Interview (CORRECT) ✅
```rust
// app.rs::execute_interview_ai_with_failover_static
loop {
    if global_quota_manager().enforce_quota(platform).is_err() {
        failover_manager.failover();
        continue;
    }
    
    let runner = get_runner(platform).await?;
    let result = runner.execute(&request).await?;
    
    if is_quota_error(&error) {
        failover_manager.failover();
        continue;
    }
}
```

### Orchestrator (BEFORE - WRONG) ❌
```rust
// execution_engine.rs::execute_iteration
let mut cmd = Command::new(&platform.executable); // Raw process!
cmd.arg("--prompt").arg(&context.prompt);
let child = cmd.spawn()?; // No quota check!
```

### Orchestrator (AFTER - CORRECT) ✅
```rust
// execution_engine.rs::execute_iteration
global_quota_manager().enforce_quota(platform)?; // Quota check!
let runner = get_runner(platform).await?;        // Platform runner!
let result = runner.execute(&request).await?;    // Unified API!
```

## Testing

```bash
# Unit tests
cargo test execution_engine

# Integration test
cargo test orchestrator_quota_failover

# Manual test
# 1. Set cursor quota to 0 in config
# 2. Run orchestrator
# 3. Verify it uses codex/claude instead
# 4. Check logs for "Quota exhausted" + "trying next platform"
```

## Files to Modify

1. `src/core/execution_engine.rs` - Core changes
2. `src/core/orchestrator.rs` - Initialization update
3. `src/core/state_machine.rs` - Add PlatformSelected event
4. `src/types/config.rs` - Add config flags (optional)

## Implementation Time

- **Code changes**: 1-2 hours
- **Testing**: 1-2 hours
- **Total**: 2-4 hours

## Detailed Docs

- Full audit: `ORCHESTRATOR_PLATFORM_RUNNER_AUDIT.md`
- Implementation guide: `ORCHESTRATOR_PLATFORM_RUNNER_IMPLEMENTATION.md`
