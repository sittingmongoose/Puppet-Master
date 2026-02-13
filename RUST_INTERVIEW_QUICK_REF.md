# Quick Reference: Tooltip Coverage Implementation

**For**: Code reviewers and testers  
**Purpose**: Fast lookup of changes and test points  

---

## Changes Made (2 files)

### File 1: `puppet-master-rs/src/widgets/tooltips.rs`

**Line 189** (after `wizard.github_visibility` entry):
```rust
map.insert(
    "wizard.use_interview",
    TooltipEntry::new(
        "Enable interactive AI-driven requirements gathering",
        "When enabled, an AI interviewer will ask you detailed questions..."
    )
);
```

**Total file size**: 523 lines (+13 lines added)

---

### File 2: `puppet-master-rs/src/views/wizard.rs`

**Line 189** (start of `step0_project_setup()` function):
```rust
let tooltip_variant = crate::widgets::TooltipVariant::Expert;
```

**Line ~204** (Project Type label):
```rust
row![
    text("Project Type:") /* ... */,
    Space::new().width(Length::Fixed(tokens::spacing::XS)),
    help_tooltip("wizard.project_type", tooltip_variant, theme),
].align_y(Alignment::Center),
```

**Line ~228** (Project Name label):
```rust
row![
    text("Project Name:") /* ... */,
    help_tooltip("wizard.project_name", tooltip_variant, theme),
].align_y(Alignment::Center),
```

**Line ~247** (Project Path label):
```rust
row![
    text("Project Path:") /* ... */,
    help_tooltip("wizard.project_path", tooltip_variant, theme),
].align_y(Alignment::Center),
```

**Line ~272** (GitHub Repository label):
```rust
row![
    text("GitHub Repository:") /* ... */,
    help_tooltip("wizard.github_repo", tooltip_variant, theme),
].align_y(Alignment::Center),
```

**Line ~287** (Repository URL label, inside conditional):
```rust
row![
    text("Repository URL:") /* ... */,
    help_tooltip("wizard.github_url", tooltip_variant, theme),
].align_y(Alignment::Center),
```

**Line ~331** (Repository Visibility label, inside conditional):
```rust
row![
    text("Repository Visibility:") /* ... */,
    help_tooltip("wizard.github_visibility", tooltip_variant, theme),
].align_y(Alignment::Center),
```

**Line ~390** (Requirements Interview label in Step 0.5):
```rust
row![
    text("Requirements Interview:") /* ... */,
    help_tooltip("wizard.use_interview", tooltip_variant, theme),
].align_y(Alignment::Center),
```

**Total file size**: 1401 lines (+58/-12 lines changed)

---

## Test Points

### Compilation Test
```bash
cd puppet-master-rs
cargo check
# Expected: Success (currently fails due to WSL2 issue)
```

### Unit Test
```bash
cargo test --lib
# Expected: 791 tests pass
```

### Manual GUI Test: Step 0
1. Open Wizard → Step 0
2. **Project Type**: Hover `?` → "Choose between greenfield or existing codebase"
3. **Project Name**: Hover `?` → "Project identifier (lowercase, hyphens ok)"
4. **Project Path**: Hover `?` → "Local directory where project files will live"
5. **GitHub Repository**: Hover `?` → "Link to GitHub for version control..."
6. Toggle "I already have a repo" → ON
7. **Repository URL**: Hover `?` → "GitHub repository URL (https://...)"
8. Toggle "I already have a repo" → OFF
9. Toggle "Create GitHub repository" → ON
10. **Repository Visibility**: Hover `?` → "Public (anyone can see) or Private..."

**Expected**: All 6 tooltip icons render and show correct text

### Manual GUI Test: Step 0.5
1. Navigate to Step 0.5 (Interview Configuration)
2. **Requirements Interview**: Hover `?` → "Enable interactive AI-driven requirements..."
3. Toggle "Use interactive interview mode" → ON
4. Verify existing tooltips:
   - **Interaction Mode** `?` → "Expert (concise) vs ELI5 (explained) mode"
   - **AI Reasoning Level** `?` → "Inference depth: low (fast) to max (thorough)"
   - **Generate initial AGENTS.md** `?` → "Create starter guide for AI agents"

**Expected**: All 4 tooltip icons render

### Manual GUI Test: Tooltip Variants
1. Step 0.5 → Set Interaction Mode to **Expert**
2. Hover over "Interaction Mode" `?`
3. Expected text: "Expert (concise) vs ELI5 (explained) mode" (concise)
4. Set Interaction Mode to **ELI5**
5. Hover over "Interaction Mode" `?`
6. Expected text: "Expert mode: concise questions... ELI5 mode: every question comes with..." (detailed)

**Expected**: Tooltip text switches between Expert/ELI5 variants

---

## Tooltip Keys Registry

### Wizard Step 0 (Project Setup)
| Field | Tooltip Key | Line |
|-------|-------------|------|
| Project Type | `wizard.project_type` | ~204 |
| Project Name | `wizard.project_name` | ~228 |
| Project Path | `wizard.project_path` | ~247 |
| GitHub Repository | `wizard.github_repo` | ~272 |
| Repository URL | `wizard.github_url` | ~287 |
| Repository Visibility | `wizard.github_visibility` | ~331 |

### Wizard Step 0.5 (Interview Config)
| Field | Tooltip Key | Line |
|-------|-------------|------|
| Requirements Interview | `wizard.use_interview` | ~390 |
| Interaction Mode | `interview.interaction_mode` | 417 |
| AI Reasoning Level | `interview.reasoning_level` | 441 |
| Generate AGENTS.md | `interview.generate_agents_md` | 463 |

### All Keys in tooltips.rs
**Lines 50-523**: 40+ tooltip entries covering:
- Interview config (11 keys)
- Wizard Step 0 (6 keys)
- Wizard Step 0.5 (1 new key)
- Tier configuration (6 keys)
- Budget settings (4 keys)
- Orchestrator settings (8 keys)
- Memory/checkpointing (5 keys)
- Network settings (6 keys)
- Verification settings (3 keys)
- Branching settings (5 keys)

---

## Git Commands

### View Changes
```bash
cd puppet-master-rs
git diff src/widgets/tooltips.rs  # See tooltip entry added
git diff src/views/wizard.rs      # See help icons added
git diff --stat                    # Summary of changed files
```

### Revert Changes (if needed)
```bash
git checkout src/widgets/tooltips.rs
git checkout src/views/wizard.rs
```

### Commit Changes
```bash
git add src/widgets/tooltips.rs src/views/wizard.rs
git commit -m "Add tooltip coverage for Wizard Step 0 and Step 0.5

- Add wizard.use_interview tooltip entry
- Add help icons to 6 Step 0 fields (project setup)
- Add help icon to Step 0.5 'Use Interview' toggle
- Default Step 0 tooltips to Expert variant

Closes: Interview UX gaps identified in audit"
```

---

## Known Issues

### Build Environment
**Issue**: `cargo check` fails with `os error 22`  
**Cause**: WSL2 build script execution bug  
**Workaround**: Build on native Linux, macOS, or Docker  
**Status**: Not related to our changes (affects all builds)

### Docker Build Command
```bash
cd /home/sittingmongoose/Cursor/RWM\ Puppet\ Master
docker run --rm -v $(pwd)/puppet-master-rs:/work -w /work rust:latest cargo check
```

---

## Success Criteria

✅ **Code Complete**: All tooltip icons added  
⚠️ **Build Pending**: Awaiting Linux/macOS/Docker verification  
⏳ **Testing Pending**: Manual GUI test once build succeeds  

**Definition of Done**:
1. `cargo check` passes (Linux/macOS)
2. `cargo test --lib` passes (791 tests)
3. Manual hover test: All `?` icons show tooltips
4. No visual layout regression

---

## Contact / Questions

- **Code changes unclear?** → See `RUST_INTERVIEW_TOOLTIP_FIXES.md`
- **Want full analysis?** → See `RUST_INTERVIEW_AUDIT.md`
- **Need big picture?** → See `RUST_INTERVIEW_EXEC_SUMMARY.md`
- **Original requirements?** → See `interviewupdates.md`

---

**Last Updated**: 2026-02-15  
**Status**: ✅ Code complete, ⏳ awaiting build verification
