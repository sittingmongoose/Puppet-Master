# Orchestrator Platform Runner & Quota Failover - Index

## Critical Finding

**The orchestrator's ExecutionEngine does NOT use platform runners or quota failover.** It spawns raw CLI processes, bypassing the entire quota management and failover system that interview uses correctly.

## Documentation Set

### 1. **ORCHESTRATOR_FAILOVER_QUICK_START.md** ⭐ START HERE
**Purpose**: Quick reference for implementing the fix  
**Audience**: Developer implementing the changes  
**Content**:
- 6 concrete code changes needed
- Side-by-side pattern comparison
- Essential code snippets
- Testing commands
- Estimated time: 2-4 hours

### 2. **ORCHESTRATOR_PLATFORM_RUNNER_AUDIT.md** 📊 DEEP DIVE
**Purpose**: Comprehensive audit and analysis  
**Audience**: Technical reviewers, architects  
**Content**:
- Root cause analysis (22KB)
- Interview failover pattern (CORRECT ✅)
- Orchestrator execution (BROKEN ❌)
- Two solution options (recommended vs fallback)
- Detailed code changes with line numbers
- Risk analysis and mitigation
- Testing strategy
- Performance considerations

### 3. **ORCHESTRATOR_PLATFORM_RUNNER_IMPLEMENTATION.md** 🛠️ STEP-BY-STEP
**Purpose**: Detailed implementation guide  
**Audience**: Developer doing the work  
**Content**:
- 6 changes with exact code replacements
- Testing checklist
- Verification steps
- Configuration examples
- Rollback plan
- Dependencies and potential issues

### 4. **ORCHESTRATOR_FAILOVER_VISUAL.md** 🎨 DIAGRAMS
**Purpose**: Visual architecture and flow diagrams  
**Audience**: Everyone (visual learners)  
**Content**:
- Current vs target state diagrams
- Code flow comparison
- Failover chain example with trace
- Testing matrix
- Migration path

## Quick Summary

### The Problem (3 Sentences)

1. **ExecutionEngine uses raw process spawn** (`tokio::Command`) instead of platform runners
2. **No quota checking happens** - bypasses `global_quota_manager()` entirely
3. **No automatic failover** - single platform only, no retry chain

### The Solution (3 Steps)

1. **Replace** raw `Command::spawn()` with `get_runner(platform).await`
2. **Add** quota check before execution: `global_quota_manager().enforce_quota(platform)`
3. **Implement** failover loop with fallback chain (Cursor → Codex → Claude → Gemini)

### The Impact (3 Benefits)

1. ✅ **Quota enforcement** - Orchestrator respects platform limits
2. ✅ **Automatic failover** - Seamlessly switches platforms on quota exhaustion
3. ✅ **Consistency** - Interview and orchestrator behave identically

## Key Code Changes

| File | Change | Lines |
|------|--------|-------|
| `execution_engine.rs` | Refactor `execute_iteration` | 50-89 |
| `execution_engine.rs` | Delete obsolete methods | 127-320 |
| `execution_engine.rs` | Update constructor | 22-48 |
| `orchestrator.rs` | Update initialization | 203-209 |
| `state_machine.rs` | Add `PlatformSelected` event | - |
| `config.rs` | Add failover config flags | - |

## Pattern Comparison

### Interview (CORRECT ✅)
```rust
global_quota_manager().enforce_quota(platform)?;
let runner = get_runner(platform).await?;
let result = runner.execute(&request).await?;
```

### Orchestrator BEFORE (WRONG ❌)
```rust
let mut cmd = Command::new(&platform.executable);
cmd.arg("--prompt").arg(&prompt);
let child = cmd.spawn()?;
```

### Orchestrator AFTER (CORRECT ✅)
```rust
global_quota_manager().enforce_quota(platform)?;
let runner = get_runner(platform).await?;
let result = runner.execute(&request).await?;
```

## Files Involved

### Core Changes
- `src/core/execution_engine.rs` - Main implementation
- `src/core/orchestrator.rs` - Initialization
- `src/core/state_machine.rs` - Events
- `src/types/config.rs` - Configuration

### Dependencies (Already Exist)
- `src/platforms/registry.rs` - `get_runner()`
- `src/platforms/quota_manager.rs` - `global_quota_manager()`
- `src/interview/failover.rs` - `is_quota_error()`
- `src/types.rs` - `ExecutionRequest`

### Reference (Correct Pattern)
- `src/app.rs` - `execute_interview_ai_with_failover_static` (lines 819-982)

## Testing Strategy

```bash
# 1. Unit tests
cargo test execution_engine::tests::test_quota_check_before_execution
cargo test execution_engine::tests::test_failover_on_quota_error
cargo test execution_engine::tests::test_all_platforms_exhausted

# 2. Integration test
cargo test orchestrator_quota_failover

# 3. Manual verification
# Set cursor quota to 0, run orchestrator, verify it uses codex
```

## Success Criteria

| Metric | Target |
|--------|--------|
| Quota enforcement | ✅ Enforced before each iteration |
| Automatic failover | ✅ Triggers on quota exhaustion |
| Interview consistency | ✅ Same behavior as interview |
| Usage tracking | ✅ All executions tracked |
| Test coverage | ✅ >90% |
| Performance | ✅ <110% of current |

## Priority & Effort

**Priority**: P0 (Critical - blocks quota feature)  
**Effort**: 2-4 hours implementation + testing  
**Risk**: Low (well-isolated, follows proven pattern)  
**Dependencies**: None (all dependencies exist)

## Implementation Checklist

- [ ] 1. Read ORCHESTRATOR_FAILOVER_QUICK_START.md
- [ ] 2. Understand current state from ORCHESTRATOR_PLATFORM_RUNNER_AUDIT.md
- [ ] 3. Follow step-by-step from ORCHESTRATOR_PLATFORM_RUNNER_IMPLEMENTATION.md
- [ ] 4. Reference diagrams in ORCHESTRATOR_FAILOVER_VISUAL.md
- [ ] 5. Refactor `execute_iteration` method
- [ ] 6. Remove obsolete methods
- [ ] 7. Update constructor and initialization
- [ ] 8. Add `PlatformSelected` event
- [ ] 9. Add config flags (optional)
- [ ] 10. Write unit tests
- [ ] 11. Manual testing with quota limits
- [ ] 12. Verify consistency with interview
- [ ] 13. Performance regression testing
- [ ] 14. Documentation update
- [ ] 15. Create PR with before/after comparison

## Next Actions

1. **Immediate**: Review this index and quick start
2. **Planning**: Read full audit document
3. **Implementation**: Follow implementation guide
4. **Validation**: Execute testing checklist
5. **Deployment**: Create feature branch + PR

## Related Documentation

- `PLATFORM_RUNNERS_QUICK_REF.md` - Platform runner system overview
- `CHECKLIST_PLATFORM_RUNNERS.md` - Platform runner checklist
- `PLATFORM_RUNNERS_ARCHITECTURE.md` - Platform runner architecture

## Questions?

**Q: Why does ExecutionEngine not use platform runners?**  
A: Historical legacy - it predates the unified platform runner system.

**Q: What's the risk of this change?**  
A: Low - the change is isolated and follows a proven pattern from interview.

**Q: Will this slow down execution?**  
A: Minimal impact - platform runners add ~1-5ms overhead, but enable connection pooling.

**Q: Can we rollback if needed?**  
A: Yes - all changes are in 2 files, easy to revert or add feature flag.

**Q: When should we implement this?**  
A: ASAP - this blocks proper quota enforcement in orchestrator mode.

## Document Versions

- **v1.0** (2025-01-06): Initial audit and implementation guide
- Index: This document

## Contact

For questions or clarification, refer to:
- Full audit: ORCHESTRATOR_PLATFORM_RUNNER_AUDIT.md
- Quick start: ORCHESTRATOR_FAILOVER_QUICK_START.md
- Visual guide: ORCHESTRATOR_FAILOVER_VISUAL.md
