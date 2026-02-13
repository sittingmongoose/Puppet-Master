# Orchestrator Platform Runner Integration Audit

## Executive Summary

**CRITICAL FINDING**: The orchestrator's `ExecutionEngine` does NOT use platform runners or quota failover. It spawns raw CLI processes instead of using the unified platform runner system that interview failover uses.

## Current State Analysis

### Interview Failover (WORKING CORRECTLY) ✅
**Location**: `src/app.rs::execute_interview_ai_with_failover_static` (lines 819-982)

**Pattern**:
```rust
use crate::platforms::{get_runner, quota_manager::global_quota_manager};
use crate::types::ExecutionRequest;

loop {
    // 1. Check quota BEFORE execution
    if let Err(e) = global_quota_manager().enforce_quota(platform_pair.platform) {
        // Trigger failover on quota exhaustion
        if let Some(next) = failover_manager.failover() {
            failover_occurred = true;
            continue;
        }
    }
    
    // 2. Get platform runner from registry
    match get_runner(platform_pair.platform).await {
        Ok(runner) => {
            // 3. Execute via unified ExecutionRequest
            let request = ExecutionRequest::new(
                platform_pair.platform,
                platform_pair.model.clone(),
                prompt.clone(),
                working_dir.clone(),
            );
            
            match runner.execute(&request).await {
                Ok(result) => {
                    if result.success { return success; }
                    
                    // 4. Check for quota errors in response
                    if is_quota_error(&error_msg) {
                        if let Some(next) = failover_manager.failover() {
                            failover_occurred = true;
                            continue;
                        }
                    }
                }
            }
        }
    }
}
```

**Key Components**:
- `get_runner(platform)` - Global platform registry
- `global_quota_manager()` - Centralized quota enforcement
- `ExecutionRequest` - Unified request structure
- `runner.execute(&request)` - Consistent execution interface
- `is_quota_error()` - Error detection for failover trigger
- `FailoverManager` - Platform chain management

---

### Orchestrator Execution (BROKEN) ❌
**Location**: `src/core/execution_engine.rs` (lines 1-495)

**Current Implementation**:
```rust
async fn spawn_platform(
    &self,
    platform: &PlatformConfig,
    context: &IterationContext,
) -> Result<Child> {
    let mut cmd = Command::new(&platform.executable);  // ❌ RAW PROCESS SPAWN
    
    cmd.current_dir(&context.working_dir);
    
    // ❌ HARDCODED CLI ARGS - Platform-specific
    cmd.arg("--prompt")
       .arg(&context.prompt)
       .stdin(Stdio::null())
       .stdout(Stdio::piped())
       .stderr(Stdio::piped());
    
    let child = cmd.spawn()?;  // ❌ NO QUOTA CHECK
    Ok(child)
}
```

**Critical Issues**:
1. ❌ **NO platform runners** - Uses `tokio::process::Command` directly
2. ❌ **NO quota checking** - Never calls `global_quota_manager()`
3. ❌ **NO failover** - Single platform only, no retry chain
4. ❌ **Hardcoded CLI args** - Assumes `--prompt` flag exists
5. ❌ **No ExecutionRequest** - Doesn't use unified request type
6. ❌ **Direct process management** - Manual stdout/stderr capture
7. ❌ **Platform-specific parsing** - Custom completion signal detection

**Platform Selection Logic** (lines 91-124):
```rust
fn select_platform_for_context(&self, preferred: Platform) -> Result<&PlatformConfig> {
    let mut candidates: Vec<Platform> = Vec::with_capacity(6);
    candidates.push(preferred);
    candidates.extend_from_slice(fallback_chain_for(preferred));  // ✅ Has fallback chain
    
    for candidate in candidates {
        if let Some(p) = self.platforms.iter()
            .find(|p| p.available && p.platform == candidate && self.has_quota(p))  // ⚠️ Local quota
        {
            return Ok(p);
        }
    }
}

fn has_quota(&self, platform: &PlatformConfig) -> bool {
    if let Some(quota) = platform.quota {  // ❌ Uses PlatformConfig.quota field
        quota > 0                          // ❌ NOT global_quota_manager()
    } else {
        true
    }
}
```

**Problems**:
- ✅ Has fallback chain logic (similar to interview)
- ❌ Checks local `PlatformConfig.quota` field instead of `global_quota_manager()`
- ❌ No dynamic quota updates - quota is static from config
- ❌ No failover on quota exhaustion during execution
- ❌ Fallback only happens at selection time, not on failure

---

### Orchestrator Integration Point
**Location**: `src/core/orchestrator.rs` (lines 1135-1157)

```rust
let iteration_result = match self.iteration_executor.execute_iteration(&context).await {
    Ok(r) => r,
    Err(e) => {
        let signal = CompletionSignal::Error(e.to_string());
        // Handle failure...
    }
};
```

The `iteration_executor` is an `Arc<dyn IterationExecutor>` trait object that wraps `ExecutionEngine`.

**Current Initialization** (lines 203-209):
```rust
let platforms = config.platforms.values().cloned().collect::<Vec<_>>();
let iteration_executor: Arc<dyn IterationExecutor> = Arc::new(ExecutionEngine::new(
    platforms,          // Vec<PlatformConfig> from config
    event_sender.clone(),
    120,               // stall_timeout_secs
    10,                // stall_max_repeats
));
```

---

## Root Cause Analysis

### Why ExecutionEngine Doesn't Use Platform Runners

1. **Historical Legacy**: `ExecutionEngine` predates the unified platform runner system
2. **Abstraction Mismatch**: Designed for CLI tool wrapping, not API clients
3. **Output Capture**: Custom streaming output capture (lines 158-255)
4. **Completion Signals**: Custom parsing logic (lines 257-301)
5. **Process Management**: Needs SIGTERM/SIGKILL for timeouts (lines 303-320)

### Why This Matters

**Impact**:
- ❌ Orchestrator iterations ignore platform quota limits
- ❌ No automatic failover when platform is rate-limited
- ❌ Inconsistent behavior between interview and orchestrator
- ❌ Platform runners (Claude, Gemini, etc.) bypassed entirely
- ❌ Usage tracking incomplete (misses orchestrator executions)

---

## Solution Architecture

### Option 1: Replace ExecutionEngine with Platform Runners (RECOMMENDED)

**Approach**: Refactor `ExecutionEngine` to use `get_runner()` + `ExecutionRequest` pattern.

**Changes Needed**:

#### 1. Update `ExecutionEngine::execute_iteration`
**File**: `src/core/execution_engine.rs`
**Lines**: 50-89

```rust
// BEFORE (lines 50-88):
pub async fn execute_iteration(&self, context: &IterationContext) -> Result<IterationResult> {
    let start_time = Instant::now();
    let platform = self.select_platform_for_context(context.platform)?;
    // ...
    let mut child = self.spawn_platform(&platform, context).await?;
    let (signal, output) = self.capture_output(&mut child, context, start_time).await?;
    // ...
}

// AFTER:
pub async fn execute_iteration(&self, context: &IterationContext) -> Result<IterationResult> {
    use crate::platforms::{get_runner, quota_manager::global_quota_manager};
    use crate::types::ExecutionRequest;
    
    let start_time = Instant::now();
    const MAX_RETRIES: usize = 5;
    
    // Build fallback chain
    let mut candidates = vec![context.platform];
    candidates.extend_from_slice(fallback_chain_for(context.platform));
    
    let mut last_error: Option<String> = None;
    
    for (attempt, candidate_platform) in candidates.iter().enumerate() {
        // Check quota before execution
        if let Err(e) = global_quota_manager().enforce_quota(*candidate_platform) {
            log::warn!(
                "Quota exhausted for {:?}, trying next platform: {}",
                candidate_platform, e
            );
            last_error = Some(format!("Quota exhausted: {}", e));
            continue;
        }
        
        // Emit platform selection event
        let _ = self.event_sender.send(OrchestratorEvent::PlatformSelected {
            tier_id: context.tier_id.clone(),
            platform: *candidate_platform,
            attempt: attempt as u32,
        });
        
        // Get platform runner
        let runner = match get_runner(*candidate_platform).await {
            Ok(r) => r,
            Err(e) => {
                log::warn!("Failed to get runner for {:?}: {}", candidate_platform, e);
                last_error = Some(format!("Runner unavailable: {}", e));
                continue;
            }
        };
        
        // Build execution request
        let request = ExecutionRequest::new(
            *candidate_platform,
            context.model.clone(),
            context.prompt.clone(),
            context.working_dir.clone(),
        );
        
        // Execute with timeout
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
                
                // Check if quota error - try next platform
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
        
        // Parse result
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
            
            // Check if quota error
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

// Add quota error detection helper
fn is_quota_error(error_msg: &str) -> bool {
    crate::interview::failover::is_quota_error(error_msg)
}

// Add completion signal parser for string output
fn parse_completion_signal_from_output(&self, output: &str) -> CompletionSignal {
    // Check each line for signals
    for line in output.lines() {
        if let Some(signal) = self.parse_completion_signal(line) {
            return signal;
        }
    }
    
    // Default to complete if no explicit signal
    CompletionSignal::Complete
}
```

#### 2. Remove Obsolete Methods
**File**: `src/core/execution_engine.rs`

Remove or mark deprecated:
- `spawn_platform` (lines 127-155) - ❌ DELETE
- `capture_output` (lines 157-255) - ❌ DELETE (platform runners handle this)
- `ensure_terminated` (lines 303-320) - ❌ DELETE
- `select_platform_for_context` (lines 100-124) - ✅ KEEP but inline into execute_iteration
- `has_quota` (lines 327-334) - ❌ DELETE (use global_quota_manager)

#### 3. Add New OrchestratorEvent
**File**: `src/core/state_machine.rs`

```rust
pub enum OrchestratorEvent {
    // ... existing events ...
    
    /// Platform selected for iteration (for tracking failover)
    PlatformSelected {
        tier_id: String,
        platform: Platform,
        attempt: u32,
    },
}
```

#### 4. Update ExecutionEngine Constructor
**File**: `src/core/orchestrator.rs`
**Lines**: 203-209

```rust
// BEFORE:
let platforms = config.platforms.values().cloned().collect::<Vec<_>>();
let iteration_executor: Arc<dyn IterationExecutor> = Arc::new(ExecutionEngine::new(
    platforms,
    event_sender.clone(),
    120,
    10,
));

// AFTER:
// ExecutionEngine no longer needs platforms list - uses global registry
let iteration_executor: Arc<dyn IterationExecutor> = Arc::new(ExecutionEngine::new(
    event_sender.clone(),
    120,  // stall_timeout_secs (still used for detecting stalled output)
    10,   // stall_max_repeats
));
```

Update `ExecutionEngine::new` signature:
```rust
pub fn new(
    event_sender: Sender<OrchestratorEvent>,
    stall_timeout_secs: u64,
    stall_max_repeats: usize,
) -> Self {
    Self {
        // platforms field removed - use global registry
        event_sender,
        stall_timeout_secs,
        stall_max_repeats,
    }
}
```

#### 5. Update PlatformConfig Usage
**File**: `src/types.rs` or wherever `PlatformConfig` is defined

The `PlatformConfig` struct currently has:
```rust
pub struct PlatformConfig {
    pub platform: Platform,
    pub model: String,
    pub available: bool,
    pub priority: u8,
    pub quota: Option<usize>,  // ❌ OBSOLETE - use global_quota_manager instead
    pub executable: PathBuf,   // ❌ OBSOLETE - platform runners don't use this
}
```

**Either**:
- Mark `quota` and `executable` as deprecated
- OR create new `OrchestratorPlatformConfig` without these fields

---

### Option 2: Hybrid Approach (FALLBACK IF OPTION 1 BLOCKED)

Keep `ExecutionEngine` for CLI process management but add quota checking.

**Changes**:

#### 1. Add Quota Checking to ExecutionEngine
**File**: `src/core/execution_engine.rs`

```rust
pub async fn execute_iteration(&self, context: &IterationContext) -> Result<IterationResult> {
    use crate::platforms::quota_manager::global_quota_manager;
    
    let start_time = Instant::now();
    
    // Build fallback chain
    let mut candidates = vec![context.platform];
    candidates.extend_from_slice(fallback_chain_for(context.platform));
    
    for candidate in candidates {
        // ✅ ADD: Check quota before execution
        if let Err(e) = global_quota_manager().enforce_quota(candidate) {
            log::warn!("Quota exhausted for {:?}, trying next: {}", candidate, e);
            continue;
        }
        
        // Find PlatformConfig for this candidate
        let platform_cfg = self.platforms.iter()
            .find(|p| p.available && p.platform == candidate)
            .ok_or_else(|| anyhow!("Platform {:?} not configured", candidate))?;
        
        // Existing spawn_platform logic...
        let mut child = self.spawn_platform(platform_cfg, context).await?;
        let (signal, output) = self.capture_output(&mut child, context, start_time).await?;
        
        // On quota error, try next platform
        if let CompletionSignal::Error(ref e) = signal {
            if is_quota_error(e) {
                log::warn!("Quota error during execution, trying next platform");
                continue;
            }
        }
        
        // Return result
        return Ok(IterationResult {
            signal,
            duration_secs: start_time.elapsed().as_secs(),
            output_lines: output.lines().count(),
            output,
        });
    }
    
    Err(anyhow!("All platforms exhausted"))
}
```

**Pros**: Minimal changes, keeps existing process management
**Cons**: Doesn't unify with platform runners, quota tracking incomplete

---

## CLI Flag Analysis

### Current CLI Flags (Need Verification)

**Check**:
```bash
puppet-master-rs --help
puppet-master-rs orchestrate --help
```

**Expected Flags**:
- `--platform <PLATFORM>` - Primary platform selection
- `--model <MODEL>` - Model name
- `--quota-check` / `--enforce-quota` - Enable quota enforcement
- `--failover` / `--enable-failover` - Enable automatic failover
- `--config <PATH>` - Config file with platform settings

**Missing Flags** (likely):
- Platform runner selection is probably hardcoded in config
- No CLI flag to enable/disable failover
- No CLI flag to set quota limits

### Recommended New Flags

```rust
// In CLI arg parser (clap or similar)
#[derive(Parser)]
struct OrchestrateArgs {
    /// Primary platform for execution
    #[arg(long, default_value = "cursor")]
    platform: Platform,
    
    /// Enable automatic failover on quota exhaustion
    #[arg(long, default_value_t = true)]
    enable_failover: bool,
    
    /// Enforce quota limits before execution
    #[arg(long, default_value_t = true)]
    enforce_quota: bool,
    
    /// Max failover attempts before giving up
    #[arg(long, default_value = "5")]
    max_failover_attempts: usize,
}
```

---

## Implementation Checklist

### Phase 1: Platform Runner Integration (CRITICAL)
- [ ] 1. Refactor `ExecutionEngine::execute_iteration` to use `get_runner()`
- [ ] 2. Add `global_quota_manager().enforce_quota()` checks
- [ ] 3. Implement failover loop with fallback chain
- [ ] 4. Add `is_quota_error()` detection
- [ ] 5. Remove `spawn_platform`, `capture_output`, `ensure_terminated`
- [ ] 6. Update `ExecutionEngine::new()` signature (remove platforms param)
- [ ] 7. Add `PlatformSelected` event to `OrchestratorEvent`
- [ ] 8. Update orchestrator initialization (line 204)

### Phase 2: Configuration & CLI (IMPORTANT)
- [ ] 9. Verify CLI flags for platform/model selection
- [ ] 10. Add `--enable-failover` flag (default: true)
- [ ] 11. Add `--enforce-quota` flag (default: true)
- [ ] 12. Add `--max-failover-attempts` flag
- [ ] 13. Update config file schema for platform runner settings

### Phase 3: Testing (REQUIRED)
- [ ] 14. Test orchestrator with quota exhaustion scenarios
- [ ] 15. Test failover chain (Cursor → Claude → Gemini)
- [ ] 16. Verify usage tracking captures orchestrator executions
- [ ] 17. Test timeout behavior with platform runners
- [ ] 18. Integration test: interview + orchestrator consistency

### Phase 4: Documentation (NICE TO HAVE)
- [ ] 19. Update ORCHESTRATOR.md with platform runner usage
- [ ] 20. Document failover behavior in README
- [ ] 21. Add examples of quota-aware configuration
- [ ] 22. Update troubleshooting guide for quota errors

---

## Testing Strategy

### Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_quota_enforced_before_execution() {
        // Setup: Set quota to 0 for primary platform
        // Execute: Call execute_iteration
        // Assert: Should failover to secondary platform
    }
    
    #[tokio::test]
    async fn test_failover_on_quota_error() {
        // Setup: Mock runner that returns quota error
        // Execute: Call execute_iteration
        // Assert: Should try next platform in chain
    }
    
    #[tokio::test]
    async fn test_all_platforms_exhausted() {
        // Setup: All platforms have quota=0
        // Execute: Call execute_iteration
        // Assert: Should return error with all platforms exhausted
    }
}
```

### Integration Tests

```bash
# Test 1: Quota exhaustion triggers failover
puppet-master-rs orchestrate --platform cursor --enforce-quota

# Test 2: Manual platform selection works
puppet-master-rs orchestrate --platform claude --no-failover

# Test 3: Config file overrides work
puppet-master-rs orchestrate --config test-quota-config.toml
```

---

## Risks & Mitigation

### Risk 1: Breaking Changes to ExecutionEngine
**Impact**: High - Core orchestration logic
**Mitigation**: 
- Implement behind feature flag initially
- Maintain parallel implementation until tested
- Add extensive unit tests

### Risk 2: Platform Runner API Incompatibility
**Impact**: Medium - May not support all ExecutionEngine features
**Mitigation**:
- Review `PlatformRunner` trait for missing features
- Add streaming output support if needed
- Extend `ExecutionResult` to include intermediate output

### Risk 3: Performance Regression
**Impact**: Medium - Platform runners add abstraction overhead
**Mitigation**:
- Benchmark before/after
- Profile critical path
- Optimize platform runner initialization

---

## Performance Considerations

### Current ExecutionEngine
- ✅ Direct process spawn (minimal overhead)
- ✅ Streaming output capture (real-time events)
- ✅ Custom timeout handling

### Platform Runner Approach
- ⚠️ Additional abstraction layer
- ⚠️ Registry lookup overhead
- ⚠️ Potential buffering delays
- ✅ Shared runner pool (less process churn)
- ✅ Connection reuse for API platforms

**Recommendation**: Profile both approaches, optimize runner initialization.

---

## Conclusion

**CRITICAL ACTION REQUIRED**: Implement Option 1 (Platform Runner Integration) to ensure:
1. Quota limits are enforced consistently
2. Failover works for orchestrator iterations
3. Usage tracking is complete
4. Interview and orchestrator behave identically

**Estimated Effort**: 4-6 hours
**Priority**: P0 (Blocks quota system functionality)
**Risk Level**: Medium (core logic change, but well-isolated)

**Next Steps**:
1. Review this audit with team
2. Verify CLI flags and configuration
3. Implement Phase 1 changes
4. Add comprehensive tests
5. Deploy behind feature flag initially
