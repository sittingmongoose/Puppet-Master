# Projects View Multi-Project Switching & Status Audit

**Date:** 2024-02-13  
**Scope:** Audit `puppet-master-rs/src/views/projects.rs` and related app state for multi-project switching + status tracking  
**Reference:** `interviewupdates.md` requirements  

---

## Executive Summary

**Status:** ✅ **MULTI-PROJECT SWITCHING IMPLEMENTED** | ⚠️ **STATUS TRACKING PARTIALLY IMPLEMENTED**

The multi-project switching infrastructure is **fully operational** with persistent project storage, pin/unpin, and cleanup. However, **dynamic status tracking** (interview/build status per project) is **missing**. The current implementation shows static status based on `.puppet-master` directory existence, not actual runtime state.

### What Works ✅
- Multi-project management with `ProjectsPersistence`
- Project switching via `OpenProject(name)` message
- Pin/unpin projects (sorted pinned first)
- Cleanup missing projects
- Persistent storage in `~/.local/share/RWM Puppet Master/.puppet-master/projects.json`
- UI displays project list with status badges (Active/Inactive/Error)
- Current project panel on Projects page
- Last active time tracking

### What's Missing ⚠️
- **Runtime status tracking** (interview in progress, build running, completed, paused)
- **Per-project interview state** (not loaded from project's `.puppet-master/interview/state.yaml`)
- **Per-project orchestrator state** (not checking if build is running in project)
- **Status persistence** (status is computed on-the-fly, not persisted)
- **Status updates** (status doesn't change when interview/build starts in a project)

---

## Detailed Findings

### 1. Project Persistence Layer ✅ COMPLETE

**File:** `puppet-master-rs/src/projects/persistence.rs`

**Implementation:**
- ✅ `KnownProject` struct with metadata (name, path, last_accessed, added_at, pinned, notes)
- ✅ `ProjectsPersistence` manager with atomic save/load
- ✅ Platform-specific storage paths (Windows/Linux/macOS)
- ✅ Operations: `add_or_update`, `remove`, `set_pinned`, `set_notes`, `get_sorted`, `cleanup_missing`
- ✅ Comprehensive test coverage (12 tests)

**Storage Location:**
- Windows: `%LOCALAPPDATA%\RWM Puppet Master\.puppet-master\projects.json`
- Linux: `~/.local/share/RWM Puppet Master/.puppet-master/projects.json`
- macOS: `~/Library/Application Support/RWM Puppet Master/.puppet-master/projects.json`

**Assessment:** Solid foundation. No changes needed for persistence layer.

---

### 2. App State Project Management ✅ COMPLETE

**File:** `puppet-master-rs/src/app.rs` (lines 214-217)

```rust
// Projects
pub current_project: Option<ProjectInfo>,
pub projects: Vec<ProjectInfo>,
projects_persistence: crate::projects::ProjectsPersistence,
```

**Messages Implemented:**
- ✅ `OpenProject(String)` - Switches to project (lines 1477-1582)
- ✅ `OpenProjectFolderPicker` - Opens folder picker dialog (lines 1584-1597)
- ✅ `ProjectFolderSelected(Option<PathBuf>)` - Handles folder selection
- ✅ `ProjectsRefresh` - Reloads projects from persistence (lines 1609-1660)
- ✅ `RememberProject(PathBuf)` - Adds project to known list (lines 1764-1785)
- ✅ `ForgetProject(PathBuf)` - Removes project from list (lines 1787-1812)
- ✅ `PinProject(PathBuf, bool)` - Pins/unpins project (lines 1814-1833)
- ✅ `CleanupMissingProjects` - Removes projects with missing directories (lines 1835-1859)

**Project Switching Logic (lines 1477-1582):**
1. Resolves project name → path via `projects` vector
2. Validates path exists and has `.puppet-master` directory
3. Updates `current_project` field
4. Marks all other projects as Inactive, selected as Active
5. Touches project in persistence (updates last_accessed)
6. Shows success toast

**Assessment:** Switching logic is complete and functional.

---

### 3. ProjectInfo Status Enum ⚠️ STATIC ONLY

**File:** `puppet-master-rs/src/views/projects.rs` (lines 21-26)

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ProjectStatus {
    Active,    // Currently selected project
    Inactive,  // Not selected
    Error,     // .puppet-master directory missing
}
```

**Status Assignment (app.rs lines 1617-1621):**
```rust
let status = if kp.path.join(".puppet-master").exists() {
    crate::views::projects::ProjectStatus::Inactive
} else {
    crate::views::projects::ProjectStatus::Error
};
```

**Problem:**
- Status is **purely selection-based** (Active = selected, Inactive = not selected)
- Does NOT reflect runtime state (interview running, build in progress, etc.)
- `Error` status only means missing `.puppet-master` directory

**Requirement from interviewupdates.md:**
> "Show project status (interviewing, building, complete, paused)"

**Gap:** Status needs to reflect actual workflow state, not just selection state.

---

### 4. Projects View UI ✅ DISPLAYS STATUS

**File:** `puppet-master-rs/src/views/projects.rs`

**Current Panel (lines 118-199):**
- ✅ Shows current project name, path, and status badge
- ✅ Status badge with color coding (Active=ACID_LIME, Inactive=faded, Error=HOT_MAGENTA)
- ✅ Selectable text field for path
- ✅ "View Tiers", "Config", "Switch" buttons

**Projects List (lines 220-362):**
- ✅ Status badge per project (90px width)
- ✅ Project name with pin indicator (📌)
- ✅ Selectable path field
- ✅ Last active time display (helper function lines 370-408)
- ✅ Pin/Unpin button (📌/📍)
- ✅ Forget button (🗑)
- ✅ Open/Current button
- ✅ Current project highlighted with ACID_LIME border

**Assessment:** UI is ready to display status, but needs richer status data from app state.

---

### 5. Interview State Tracking ⚠️ GLOBAL ONLY

**File:** `puppet-master-rs/src/app.rs` (lines 324-335)

```rust
// Interview
pub interview_active: bool,
pub interview_paused: bool,
pub interview_current_phase: String,
pub interview_current_question: String,
pub interview_answers: Vec<String>,
pub interview_phases_complete: Vec<String>,
pub interview_answer_input: String,
pub interview_reference_materials: Vec<crate::interview::ReferenceMaterial>,
pub interview_reference_link_input: String,
pub interview_researching: bool,
pub interview_empty_references_text: String,
```

**Problem:**
- Interview state is **global** (single interview at a time)
- Not tied to `current_project`
- No mechanism to check if a non-current project has an active interview
- Interview state file is per-project (`.puppet-master/interview/state.yaml`) but not loaded for inactive projects

**Gap:** Need to check per-project interview state from disk when loading projects list.

---

### 6. Orchestrator State Tracking ⚠️ GLOBAL ONLY

**File:** `puppet-master-rs/src/app.rs` (lines 203-212)

```rust
// Orchestrator state (snapshot for display)
pub orchestrator_status: String,
pub current_item: Option<CurrentItem>,
pub progress: ProgressState,
pub output_lines: Vec<OutputLine>,
pub terminal_editor_content: text_editor::Content,
terminal_interaction_until: Option<std::time::Instant>,
pub active_context_menu: Option<ContextMenuTarget>,
pub last_error: Option<String>,
pub start_time: Option<DateTime<Utc>>,
```

**Problem:**
- Orchestrator state is **global** (single build at a time)
- Not tied to `current_project`
- No way to tell if a non-current project has a running build
- No persistence of orchestrator status per project

**Gap:** Need to check per-project orchestrator state (e.g., lock file, progress file) when loading projects list.

---

## Requirements Analysis

### From interviewupdates.md (line 860):
> "Show project status (interviewing, building, complete, paused)"

### From interviewupdates.md (line 1088):
> "Add project switching, interview/build status display"

### From interviewupdates.md (line 1295):
> "**Project switching**: Create two projects, verify can switch between them"

### Required Status States:
1. **Idle** - Project exists, nothing running
2. **Interviewing** - Interview in progress
3. **Building** - Orchestrator running
4. **Paused** - Interview or build paused
5. **Complete** - Interview/build finished
6. **Error** - Something went wrong

---

## Proposed Solution: Minimal Changes

### Option A: **Disk-Based Status Inference** (Recommended - Zero-Copy, Minimal Code)

Infer project status from existing state files on disk **without** loading full state into memory.

#### Changes Required:

**1. Expand ProjectStatus Enum**

**File:** `puppet-master-rs/src/views/projects.rs` (lines 21-26)

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ProjectStatus {
    Active,          // Currently selected project
    Idle,            // Has .puppet-master, nothing running
    Interviewing,    // Interview in progress
    Building,        // Orchestrator running
    Paused,          // Interview or build paused
    Complete,        // Interview/build finished successfully
    Error,           // Error state or missing directory
}
```

**2. Add Status Inference Function**

**File:** `puppet-master-rs/src/projects/mod.rs` (new function)

```rust
use std::path::Path;
use crate::views::projects::ProjectStatus;

/// Infer project status from disk state (zero-copy)
pub fn infer_project_status(project_path: &Path, is_current: bool) -> ProjectStatus {
    if is_current {
        return ProjectStatus::Active;
    }

    let pm_dir = project_path.join(".puppet-master");
    
    // Check if project directory exists at all
    if !pm_dir.exists() {
        return ProjectStatus::Error;
    }

    // Check for interview state
    let interview_state_path = pm_dir.join("interview/state.yaml");
    if interview_state_path.exists() {
        // Quick check: read first 500 bytes for phase indicator
        if let Ok(content) = std::fs::read_to_string(&interview_state_path) {
            if content.contains("phase: generating") {
                return ProjectStatus::Complete;
            }
            if content.contains("phase: questioning") || content.contains("phase: exploring") {
                return ProjectStatus::Interviewing;
            }
        }
    }

    // Check for orchestrator lock file (indicates build running)
    let orchestrator_lock = pm_dir.join("orchestrator.lock");
    if orchestrator_lock.exists() {
        // Check if lock is stale (> 1 hour old)
        if let Ok(metadata) = std::fs::metadata(&orchestrator_lock) {
            if let Ok(modified) = metadata.modified() {
                if let Ok(elapsed) = modified.elapsed() {
                    if elapsed.as_secs() < 3600 {
                        return ProjectStatus::Building;
                    }
                }
            }
        }
    }

    // Check for pause indicator
    let pause_file = pm_dir.join("paused");
    if pause_file.exists() {
        return ProjectStatus::Paused;
    }

    // Check for completion marker
    let complete_marker = pm_dir.join("interview/requirements-complete.md");
    if complete_marker.exists() {
        return ProjectStatus::Complete;
    }

    // Default: idle
    ProjectStatus::Idle
}
```

**3. Update ProjectsRefresh Handler**

**File:** `puppet-master-rs/src/app.rs` (lines 1614-1630)

```rust
// BEFORE:
let status = if kp.path.join(".puppet-master").exists() {
    crate::views::projects::ProjectStatus::Inactive
} else {
    crate::views::projects::ProjectStatus::Error
};

// AFTER:
let is_current = self.current_project.as_ref()
    .map(|cp| cp.path == kp.path)
    .unwrap_or(false);
let status = crate::projects::infer_project_status(&kp.path, is_current);
```

**4. Update Status Display Colors**

**File:** `puppet-master-rs/src/views/projects.rs` (lines 234-238)

```rust
// BEFORE:
let (status_text, status_color) = match project.status {
    ProjectStatus::Active => ("ACTIVE", colors::ACID_LIME),
    ProjectStatus::Inactive => ("INACTIVE", theme.ink_faded()),
    ProjectStatus::Error => ("ERROR", colors::HOT_MAGENTA),
};

// AFTER:
let (status_text, status_color) = match project.status {
    ProjectStatus::Active => ("ACTIVE", colors::ACID_LIME),
    ProjectStatus::Idle => ("IDLE", theme.ink_faded()),
    ProjectStatus::Interviewing => ("INTERVIEW", colors::CYBER_YELLOW),
    ProjectStatus::Building => ("BUILDING", colors::CYBER_CYAN),
    ProjectStatus::Paused => ("PAUSED", colors::SAFETY_ORANGE),
    ProjectStatus::Complete => ("COMPLETE", colors::ACID_LIME),
    ProjectStatus::Error => ("ERROR", colors::HOT_MAGENTA),
};
```

**5. Export Status Inference Function**

**File:** `puppet-master-rs/src/projects/mod.rs`

```rust
pub mod persistence;
mod status;  // New module

pub use persistence::{KnownProject, ProjectsPersistence};
pub use status::infer_project_status;  // Export new function
```

---

### Option B: **In-Memory Status Cache** (Alternative - More Accurate, More Memory)

Keep a `HashMap<PathBuf, ProjectStatus>` in app state, updated on interview/build start/stop.

#### Pros:
- More accurate (reflects actual runtime state immediately)
- Can distinguish between paused vs stopped

#### Cons:
- More complex state management
- Requires plumbing status updates through entire app
- Higher memory usage

#### Changes Required:
1. Add `project_statuses: HashMap<PathBuf, ProjectStatus>` to App struct
2. Update status on `InterviewStarted`, `InterviewEnded`, `OrchestratorStarted`, `OrchestratorStopped`
3. Persist status to `~/.local/share/.puppet-master/project-statuses.json`

**Recommendation:** Start with **Option A** (disk inference) for MVP, upgrade to **Option B** later if needed.

---

## Implementation Priority

### P0 (Must Have - Core Requirement)
1. ✅ Multi-project switching (DONE)
2. ⚠️ **Expand ProjectStatus enum** (5 min)
3. ⚠️ **Add `infer_project_status()` function** (30 min)
4. ⚠️ **Wire status inference into ProjectsRefresh** (10 min)
5. ⚠️ **Update status display colors** (15 min)

**Total Effort:** ~1 hour

### P1 (Nice to Have - Enhanced UX)
- Show "last build" timestamp
- Show interview progress percentage
- Clickable status badge to jump to relevant page
- Status refresh interval (auto-update every 5s when on Projects page)

### P2 (Future Enhancement)
- Real-time status updates via file watcher
- Multi-project parallel builds (currently one at a time)
- Project health metrics (test pass rate, coverage, etc.)

---

## File Locations & Line Pointers

### Files to Modify:
1. **`puppet-master-rs/src/views/projects.rs`**
   - Line 21-26: Expand `ProjectStatus` enum
   - Line 234-238: Update status display mapping
   - Line 120-130: Current project status display

2. **`puppet-master-rs/src/projects/mod.rs`**
   - Add: `pub use status::infer_project_status;`
   - Create: `puppet-master-rs/src/projects/status.rs` (new file)

3. **`puppet-master-rs/src/app.rs`**
   - Line 1614-1630: Update status assignment in `ProjectsRefresh`

### Files to Create:
1. **`puppet-master-rs/src/projects/status.rs`** (new, ~100 lines)
   - Contains `infer_project_status()` function
   - Contains status detection logic

---

## Testing Strategy

### Manual Test Cases:
1. **Project Switching**
   - ✅ Create Project A, switch to it → shows Active
   - ✅ Create Project B, switch to it → A becomes Idle, B becomes Active
   - ✅ Delete `.puppet-master` in A → A shows Error

2. **Interview Status**
   - Start interview in Project A → status = Interviewing
   - Pause interview → status = Paused
   - Complete interview → status = Complete
   - Switch to Project B → A status persists

3. **Build Status**
   - Start orchestrator in Project A → status = Building
   - Switch to Project B → A status = Building
   - Stop orchestrator → A status = Idle or Complete

### Unit Tests to Add:
```rust
#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_status_inference_no_pm_dir() {
        let temp = TempDir::new().unwrap();
        assert_eq!(
            infer_project_status(temp.path(), false),
            ProjectStatus::Error
        );
    }

    #[test]
    fn test_status_inference_interview_active() {
        let temp = TempDir::new().unwrap();
        let pm_dir = temp.path().join(".puppet-master/interview");
        std::fs::create_dir_all(&pm_dir).unwrap();
        
        let state = "phase: questioning\nfeature: test";
        std::fs::write(pm_dir.join("state.yaml"), state).unwrap();
        
        assert_eq!(
            infer_project_status(temp.path(), false),
            ProjectStatus::Interviewing
        );
    }

    #[test]
    fn test_status_inference_build_running() {
        let temp = TempDir::new().unwrap();
        let pm_dir = temp.path().join(".puppet-master");
        std::fs::create_dir_all(&pm_dir).unwrap();
        
        std::fs::write(pm_dir.join("orchestrator.lock"), "running").unwrap();
        
        assert_eq!(
            infer_project_status(temp.path(), false),
            ProjectStatus::Building
        );
    }
}
```

---

## Risk Assessment

### Low Risk:
- Status enum expansion (backward compatible)
- Status inference function (pure, no side effects)
- Color mapping update (visual only)

### Medium Risk:
- Status refresh performance (disk I/O per project)
  - **Mitigation:** Cache results, refresh on interval
- Stale lock file detection (false positives)
  - **Mitigation:** Check file age, add timeout

### High Risk:
- None identified

---

## Acceptance Criteria

### Definition of Done:
- ✅ Multi-project switching works (already done)
- ⚠️ Project list shows runtime status (Idle/Interviewing/Building/Paused/Complete/Error)
- ⚠️ Status colors match new states
- ⚠️ Status updates when switching projects
- ⚠️ Status persists across app restarts (via disk inference)
- ⚠️ Tests pass for status inference logic

### Verification Steps:
1. Run: `cargo check --lib` (must compile)
2. Run: `cargo test --lib projects` (must pass)
3. Manual: Create 3 projects, start interview in one, start build in another, verify status badges
4. Manual: Restart app, verify status persists

---

## Conclusion

**Current State:**
- ✅ Multi-project switching: COMPLETE
- ⚠️ Status tracking: PARTIALLY IMPLEMENTED (static only)

**Remaining Work:**
- Expand ProjectStatus enum (+5 states)
- Implement disk-based status inference (~100 lines)
- Wire into ProjectsRefresh handler (1 line change)
- Update UI status colors (7 lines)

**Effort:** ~1 hour of focused work

**Risk:** Low (pure functions, no state management complexity)

**Recommendation:** Implement Option A (disk inference) immediately to unblock multi-project use cases. Upgrade to Option B (in-memory cache) later if performance/accuracy issues arise.

---

## Patch Files

See `PROJECTS_STATUS_PATCH.md` (next document) for concrete diffs ready to apply.
