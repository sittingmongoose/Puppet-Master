# Projects Multi-Project Switching & Status - Audit Index

**Audit Date:** 2024-02-13  
**Engineer:** rust-engineer  
**Scope:** `puppet-master-rs/src/views/projects.rs` and related app state  
**Reference:** `interviewupdates.md` requirements  

---

## Audit Conclusion

**Multi-Project Switching:** ✅ **FULLY IMPLEMENTED**  
**Status Tracking:** ⚠️ **GAPS IDENTIFIED - FIX AVAILABLE**

---

## Documents Created

### 1. 📊 PROJECTS_STATUS_AUDIT.md
**Full technical audit report**

- Current implementation analysis
- App state structure review
- ProjectInfo and ProjectStatus enum analysis
- Interview and orchestrator state tracking review
- Gap identification vs requirements
- Proposed solution (Option A: Disk-based inference)
- Implementation priority breakdown
- Testing strategy
- Risk assessment
- Acceptance criteria

**Best for:** Understanding the full context and technical details

---

### 2. 🔧 PROJECTS_STATUS_PATCH.md
**Concrete implementation with exact code**

- 4 files to create/modify
- Complete Rust code for new `status.rs` module (~200 lines)
- Exact before/after diffs for all changes
- 8 unit tests included
- Verification commands
- Rollback plan
- Performance considerations

**Best for:** Implementing the fix immediately

---

### 3. 📝 PROJECTS_STATUS_QUICK_REF.md
**Quick reference for developers**

- 2-page summary of audit findings
- What works / What's missing
- File locations with line numbers
- Testing commands
- Verification steps
- Status color mapping
- Next steps checklist

**Best for:** Quick orientation and implementation guide

---

### 4. 🎨 PROJECTS_STATUS_VISUAL.txt
**Visual ASCII summary**

- Box diagram overview
- Current state vs required state
- Implementation plan flowchart
- Status color legend
- Acceptance criteria checklist

**Best for:** Quick visual scan and team presentations

---

### 5. 📑 This File (PROJECTS_STATUS_INDEX.md)
**Navigation hub**

Links all audit documents together with purpose and use cases.

---

## Key Findings Summary

### What Works ✅

1. **Projects Persistence** - `ProjectsPersistence` with JSON storage
   - File: `puppet-master-rs/src/projects/persistence.rs`
   - Storage: `~/.local/share/RWM Puppet Master/.puppet-master/projects.json`
   - Operations: add, remove, pin, unpin, cleanup, get_sorted
   - Tests: 12 unit tests passing

2. **Project Switching** - `OpenProject(name)` message handler
   - File: `puppet-master-rs/src/app.rs` lines 1477-1582
   - Updates: current_project, persistence timestamp, UI state
   - UI: Toast notification on success

3. **Projects UI** - Display with status badges
   - File: `puppet-master-rs/src/views/projects.rs`
   - Features: Current project panel, recent projects list, pin/unpin
   - Status: Shows Active/Inactive/Error badges with colors

### What's Missing ⚠️

1. **Runtime Status Detection**
   - Current: Static (Active = selected, Inactive = not selected)
   - Needed: Dynamic (Idle/Interviewing/Building/Paused/Complete)
   - Gap: No check of per-project interview/build state

2. **ProjectStatus Enum** - Only 3 states
   - Current: Active, Inactive, Error
   - Needed: +5 states (Idle, Interviewing, Building, Paused, Complete)
   - File: `puppet-master-rs/src/views/projects.rs` line 21-26

3. **Status Inference** - No logic to check disk state
   - Needed: Function to read `.puppet-master/interview/state.yaml`, etc.
   - Missing: `infer_project_status(path, is_current) -> ProjectStatus`

---

## Recommended Solution

**Option A: Disk-Based Status Inference** (1 hour implementation)

### Implementation Steps:

1. **Create** `puppet-master-rs/src/projects/status.rs` (~200 lines)
   - `infer_project_status()` function
   - Helper functions for file reading
   - 8 unit tests

2. **Modify** `puppet-master-rs/src/projects/mod.rs` (+2 lines)
   - Export status module

3. **Modify** `puppet-master-rs/src/views/projects.rs` (~20 lines)
   - Expand ProjectStatus enum (+5 variants)
   - Update status color mapping
   - Update status text labels

4. **Modify** `puppet-master-rs/src/app.rs` (~10 lines)
   - Call `infer_project_status()` in ProjectsRefresh handler
   - Update status on project switch

### Testing:
```bash
cargo test --lib projects::status  # 8 new tests
cargo test --lib projects          # All project tests
cargo check --lib                  # Compile check
```

---

## Requirements Traceability

### From interviewupdates.md:

| Requirement | Location | Status | Implementation |
|-------------|----------|--------|----------------|
| "Show project status (interviewing, building, complete, paused)" | Line 860 | ⚠️ Partial | Static status only; needs runtime detection |
| "Add project switching, interview/build status display" | Line 1088 | ✅/⚠️ | Switching done; status display needs enhancement |
| "Project switching: Create two projects, verify can switch" | Line 1295 | ✅ Complete | OpenProject message works |
| "Multi-project management in projects page" | Line 1227 | ✅ Complete | Persistence + UI implemented |

---

## Code Locations

### Current Implementation:
- `puppet-master-rs/src/projects/persistence.rs` - Project storage
- `puppet-master-rs/src/projects/mod.rs` - Module exports
- `puppet-master-rs/src/views/projects.rs` - Projects UI
- `puppet-master-rs/src/app.rs` lines 214-217 - App state (current_project)
- `puppet-master-rs/src/app.rs` lines 1477-1859 - Project message handlers

### Files to Create:
- `puppet-master-rs/src/projects/status.rs` - NEW

### Files to Modify:
- `puppet-master-rs/src/projects/mod.rs` (line 5)
- `puppet-master-rs/src/views/projects.rs` (lines 21-26, 120-130, 234-238)
- `puppet-master-rs/src/app.rs` (lines 1614-1647)

---

## Acceptance Criteria

- [x] Multi-project switching works
- [ ] Project list shows 7 status types (Active/Idle/Interviewing/Building/Paused/Complete/Error)
- [ ] Status colors match state
- [ ] Status updates when switching projects
- [ ] Status persists across app restarts
- [ ] Unit tests pass for status inference

---

## Performance Impact

**Expected:**
- <10ms per project on SSD
- ~7 file existence checks + ~2 small file reads per project
- Negligible UI impact (refresh happens on page load/manual refresh)

**Optimization opportunities:**
- Cache status for 5 seconds to avoid redundant I/O
- Debounce refresh on rapid project switches

---

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Backward compatibility | Low | Pure functions, no breaking changes |
| Performance degradation | Low | Minimal disk I/O, can cache if needed |
| False positives (stale locks) | Medium | Check file age, 1hr timeout |
| Missing edge cases | Low | Comprehensive unit tests |

---

## Next Actions

1. **Review** `PROJECTS_STATUS_PATCH.md` for implementation details
2. **Create** `puppet-master-rs/src/projects/status.rs` with provided code
3. **Apply** changes to 3 existing files using diffs in patch file
4. **Test** with `cargo test --lib projects`
5. **Verify** manually with 3 test projects in different states
6. **Document** any deviations or issues encountered

---

## Related Documentation

- `interviewupdates.md` - Original requirements
- `PROJECTS_PERSISTENCE_COMPLETE.md` - Earlier persistence implementation
- `RUST_GUI_COMPLETION.md` - Overall GUI completion status

---

## Questions or Issues?

If implementation issues arise:
1. Check patch file for exact code
2. Review audit report for context
3. Run tests individually to isolate failures
4. Use rollback plan from patch file if needed

---

**Audit Complete** ✅  
**Implementation Ready** ✅  
**Estimated Completion:** 1 hour from start
