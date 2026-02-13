# Projects Status - Quick Reference

## Audit Summary

**Multi-Project Switching:** ✅ **COMPLETE**  
**Status Tracking:** ⚠️ **GAPS IDENTIFIED**

---

## What Works ✅

1. **Project Persistence**
   - Storage: `~/.local/share/RWM Puppet Master/.puppet-master/projects.json`
   - Operations: add, remove, pin, unpin, cleanup
   - Test coverage: 12 unit tests

2. **Project Switching**
   - Message: `OpenProject(name)` 
   - Location: `app.rs` lines 1477-1582
   - Updates: `current_project`, persistence timestamp, status

3. **Projects UI**
   - View: `views/projects.rs`
   - Displays: status badge, name, path, last active, actions
   - Current project highlighted with ACID_LIME border

---

## What's Missing ⚠️

### 1. Runtime Status Detection

**Current:** Static status (Active/Inactive/Error based on selection)

**Needed:** Dynamic status (Idle/Interviewing/Building/Paused/Complete)

**Files:**
- `views/projects.rs` line 21-26: Enum needs 5 new variants
- `app.rs` line 1617-1621: Status assignment is static

### 2. Per-Project State Inference

**Current:** Global interview/build state only

**Needed:** Check disk state per project:
- `.puppet-master/interview/state.yaml` → Interviewing
- `.puppet-master/orchestrator.lock` → Building
- `.puppet-master/paused` → Paused
- `.puppet-master/interview/requirements-complete.md` → Complete

---

## Minimal Fix (1 Hour)

### Option A: Disk-Based Inference (Recommended)

**Create:**
- `puppet-master-rs/src/projects/status.rs` (~200 lines)

**Modify:**
- `puppet-master-rs/src/projects/mod.rs` (+2 lines)
- `puppet-master-rs/src/views/projects.rs` (+4 enum variants, +8 status mappings)
- `puppet-master-rs/src/app.rs` (~10 lines in ProjectsRefresh handler)

**Key Function:**
```rust
pub fn infer_project_status(project_path: &Path, is_current: bool) -> ProjectStatus
```

**Logic:**
1. Check orchestrator.lock (age < 1hr) → Building
2. Check paused file → Paused
3. Check interview/state.yaml → Interviewing
4. Check requirements-complete.md → Complete
5. Else → Idle

---

## File Locations

### To Create:
- `puppet-master-rs/src/projects/status.rs`

### To Modify:
- `puppet-master-rs/src/projects/mod.rs` (line 5: add status module export)
- `puppet-master-rs/src/views/projects.rs` (lines 21-26, 120-130, 234-238)
- `puppet-master-rs/src/app.rs` (lines 1614-1647)

---

## Testing

```bash
# Compile check
cargo check --lib

# Run tests
cargo test --lib projects::status

# Full build
cargo build --lib
```

---

## Verification Steps

1. Create 3 projects
2. Start interview in Project A → status = "INTERVIEW" (yellow)
3. Start build in Project B → status = "BUILDING" (cyan)
4. Switch to Project C → status = "IDLE" (gray)
5. Check Projects page → all 3 show correct status
6. Restart app → status persists (re-inferred from disk)

---

## Status Colors

| Status | Color | Meaning |
|--------|-------|---------|
| ACTIVE | ACID_LIME | Currently selected |
| IDLE | ink_faded (gray) | Nothing running |
| INTERVIEW | CYBER_YELLOW | Interview in progress |
| BUILDING | CYBER_CYAN | Orchestrator running |
| PAUSED | SAFETY_ORANGE | Paused |
| COMPLETE | ACID_LIME | Finished |
| ERROR | HOT_MAGENTA | Missing dir |

---

## Risk Assessment

**Low Risk:** Backward compatible, pure functions, no state complexity

**Performance:** <10ms per project on SSD (7 file checks, 2 small reads)

**Rollback:** Simple `git checkout` of 4 files

---

## Documents

1. **PROJECTS_STATUS_AUDIT.md** - Full analysis with context
2. **PROJECTS_STATUS_PATCH.md** - Concrete code changes ready to apply
3. **This file** - Quick reference for implementation

---

## Next Steps

1. Review patch file: `PROJECTS_STATUS_PATCH.md`
2. Create `puppet-master-rs/src/projects/status.rs`
3. Apply changes to 3 existing files
4. Run tests: `cargo test --lib projects`
5. Manual verification with 3 test projects
6. Done! ✅
