# Dynamic Phases Audit - Quick Reference

## Status: ⚠️ PARTIAL - Critical Gaps

## 5-Second Summary
Backend works, UI broken. Data loss on resume. Need 14 hours to fix.

## Component Status

| Component | Status | Issue |
|-----------|--------|-------|
| Feature Detection | ✅ PASS | Excellent implementation |
| Phase Manager | ✅ PASS | Correctly handles dynamic phases |
| Orchestrator | ✅ MOSTLY | Missing edge case handling |
| State Persistence | ⛔ FAIL | Dynamic phases not saved |
| Document Writer | ✅ PASS | Fully supports Phase 9+ |
| UI View | ⛔ FAIL | Hardcoded to 8 phases |
| Dashboard Panel | ⛔ FAIL | Can't show Phase 9+ |
| Integration Tests | ⛔ FAIL | None exist |

## Critical Issues (Must Fix)

### 1. State Persistence ⛔ CRITICAL
**Problem:** Dynamic phases vanish on resume  
**Impact:** Data loss, interview thinks it's done after Phase 8  
**Fix Time:** 2 hours  
**Files:** state.rs, orchestrator.rs, phase_manager.rs

### 2. UI Hardcoded Phases ⛔ CRITICAL
**Problem:** Interview view has hardcoded 8-phase array  
**Impact:** User can't see Phase 9+, UI shows wrong phase  
**Fix Time:** 4 hours  
**Files:** views/interview.rs, app.rs

### 3. Dashboard Panel Broken ⛔ HIGH
**Problem:** InterviewPanelData doesn't recognize dynamic phase IDs  
**Impact:** Dashboard panel disappears after Phase 8  
**Fix Time:** 2 hours  
**Files:** app.rs (build_interview_panel_data)

### 4. No Integration Tests ⛔ HIGH
**Problem:** No tests verify end-to-end flow  
**Impact:** Regressions undetected  
**Fix Time:** 3 hours  
**Files:** tests/dynamic_phases_integration.rs (new)

## What Works ✅

- Feature detection (9 tests, all passing)
- Phase manager (6 tests, all passing)
- Document generation (phase-09-feature-auth.md works)
- Orchestrator adds dynamic phases correctly
- Keywords detect 11 feature categories

## Minimal Fix (11 hours)

```rust
// Fix #1: State Persistence (2h)
// Add to InterviewState:
#[serde(default)]
pub dynamic_phases: Vec<InterviewPhaseDefinition>,

// Fix #2: UI Phase List (4h)  
// Change interview.rs from:
let phases = vec![ /* hardcoded 8 */ ];
// To:
for phase_def in all_phases { /* dynamic */ }

// Fix #3: Dashboard Panel (2h)
// Change app.rs from:
let phase_index = match current_phase_id { /* 8 cases */ };
// To:
let (phase_index, phase_def) = all_phases.iter().enumerate()
    .find(|(_, p)| p.id == current_phase_id)?;

// Fix #4: Integration Test (3h)
// New file: tests/dynamic_phases_integration.rs
```

## Test the Fix

```bash
# 1. Add dynamic_phases field to state
# 2. Run integration test
cargo test --test dynamic_phases_integration

# 3. Verify state saves dynamic phases
cat .puppet-master/interview/state.yaml | grep "dynamic_phases"

# 4. Complete Phase 8, verify Phase 9 appears
# Check logs for: "Detected N features for dynamic phases"

# 5. Verify documents created
ls -la .puppet-master/interview/phase-09-*.md
```

## Risk Assessment

| Fix | Risk | Impact | Priority |
|-----|------|--------|----------|
| State persistence | Low | Data loss prevented | P0 |
| UI phase list | Medium | User can see progress | P0 |
| Dashboard panel | Low | Dashboard works | P1 |
| Integration test | Low | Catches bugs | P1 |

## Ship Criteria

**Minimum (Safe Beta):**
- ✅ Fix #1: State persistence
- ✅ Fix #4: Integration test
- ⚠️ Document known UI limitation

**Full Release:**
- ✅ All 4 fixes
- ✅ All tests pass
- ✅ Manual QA: complete 8-phase interview → see Phase 9

## Code Locations

```
puppet-master-rs/src/interview/
├── feature_detector.rs    ✅ COMPLETE (332 lines, 9 tests)
├── phase_manager.rs       ✅ COMPLETE (238 lines, 6 tests)
├── orchestrator.rs        ⚠️ MOSTLY (795 lines, 11 tests, missing dynamic test)
├── document_writer.rs     ✅ COMPLETE (233 lines, 3 tests)
└── state.rs              ⛔ INCOMPLETE (304 lines, missing dynamic_phases field)

puppet-master-rs/src/views/
└── interview.rs          ⛔ HARDCODED (523 lines, phases at line 125)

puppet-master-rs/src/widgets/
└── interview_panel.rs    ⚠️ LIMITED (316 lines, assumes 8 phases)

puppet-master-rs/src/
└── app.rs                ⛔ HARDCODED (build_interview_panel_data at line 5128)

puppet-master-rs/tests/
└── (missing)             ⛔ NO INTEGRATION TEST
```

## Example: Auth + API Detection

**Input (after Phase 8):**
```yaml
decisions:
  - phase: security_secrets
    summary: "OAuth2 authentication with Google"
  - phase: architecture_technology
    summary: "REST API with OpenAPI spec"

history:
  - question: "Auth method?"
    answer: "JWT tokens with OAuth2"
  - question: "API design?"
    answer: "RESTful API with versioning"
```

**Detection:**
```
[INFO] Detected 2 features for dynamic phases: ["Authentication", "API Layer"]
```

**Output:**
```
Phase 09: Authentication (feature-auth)
  - Min 3, Max 8 questions
  - Document: phase-09-feature-auth.md
  
Phase 10: API Layer (feature-api)
  - Min 3, Max 8 questions
  - Document: phase-10-feature-api.md
```

## Verification Checklist

- [ ] Fix #1 applied: state.rs has dynamic_phases field
- [ ] Fix #2 applied: interview.rs loops over all_phases
- [ ] Fix #3 applied: app.rs queries phase list dynamically
- [ ] Fix #4 applied: integration test exists and passes
- [ ] Manual test: Complete Phase 8 with "auth" keyword
- [ ] Verify: Phase 9 appears with "Authentication" name
- [ ] Verify: state.yaml contains dynamic_phases array
- [ ] Resume interview, verify: Phase 9 still present
- [ ] Complete Phase 9, verify: phase-09-feature-auth.md created
- [ ] Master document links to phase-09-feature-auth.md

## Quick Diagnosis

**Symptom:** Interview ends after Phase 8  
**Cause:** No dynamic phases detected (too few keywords)  
**Fix:** Add more feature keywords to decisions/history

**Symptom:** Interview continues to Phase 9, but UI shows Phase 8  
**Cause:** UI hardcoded to 8 phases  
**Fix:** Apply Fix #2

**Symptom:** Dashboard panel disappears after Phase 8  
**Cause:** InterviewPanelData doesn't recognize feature-* IDs  
**Fix:** Apply Fix #3

**Symptom:** Resume after Phase 8, interview ends immediately  
**Cause:** Dynamic phases not persisted  
**Fix:** Apply Fix #1

## See Also

- Full audit: `AUDIT_DYNAMIC_PHASES_COMPREHENSIVE.md`
- Visual diagram: `AUDIT_DYNAMIC_PHASES_VISUAL.txt`
- Implementation docs: `DYNAMIC_FEATURE_PHASES_IMPLEMENTATION.md`
