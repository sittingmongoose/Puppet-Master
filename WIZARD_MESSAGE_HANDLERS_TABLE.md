# Wizard Message Handlers: Real vs TODO

Complete analysis of every wizard-related message handler in the Rust app.

---

## Message Handler Implementation Status

| Message | File:Line | Implementation | Backend Called | Files Modified | Status |
|---------|-----------|----------------|----------------|----------------|--------|
| `WizardNextStep` | app.rs:539 | `self.wizard_step += 1` | None | None | ✅ Real (just counter) |
| `WizardPrevStep` | app.rs:544 | `self.wizard_step -= 1` | None | None | ✅ Real (just counter) |
| `WizardRequirementsChanged` | app.rs:551 | `self.wizard_requirements_text = text` | None | None | ✅ Real (local state) |
| `WizardFileSelected` | app.rs:556 | Toast only | None | None | ❌ TODO Stub |
| `WizardGenerate` | app.rs:564 | Toast only | None | None | ❌ TODO Stub |
| `WizardSave` | app.rs:570 | Toast only | None | None | ❌ TODO Stub |
| `SaveConfig` | app.rs:??? | Toast only | None | None | ❌ TODO Stub |
| `ReloadConfig` | app.rs:??? | Toast only | None | None | ❌ TODO Stub |
| `RunAllChecks` | app.rs:??? | Toast only | None | None | ❌ TODO Stub |
| `FixCheck` | app.rs:??? | Toast only | None | None | ❌ TODO Stub |
| `OpenProject` | app.rs:??? | Toast only | None | None | ❌ TODO Stub |

---

## Detailed Handler Analysis

### ✅ WizardNextStep (REAL - Navigation Only)
```rust
// File: puppet-master-rs/src/app.rs:539
Message::WizardNextStep => {
    self.wizard_step += 1;
    Task::none()
}
```
**Status:** ✅ Works correctly  
**Function:** Advances to next wizard step  
**Backend:** None needed (local state change)  
**Files Modified:** None

---

### ✅ WizardPrevStep (REAL - Navigation Only)
```rust
// File: puppet-master-rs/src/app.rs:544
Message::WizardPrevStep => {
    if self.wizard_step > 0 {
        self.wizard_step -= 1;
    }
    Task::none()
}
```
**Status:** ✅ Works correctly  
**Function:** Returns to previous wizard step  
**Backend:** None needed (local state change)  
**Files Modified:** None

---

### ✅ WizardRequirementsChanged (REAL - Input Only)
```rust
// File: puppet-master-rs/src/app.rs:551
Message::WizardRequirementsChanged(text) => {
    self.wizard_requirements_text = text;
    Task::none()
}
```
**Status:** ✅ Works correctly  
**Function:** Updates requirements text as user types  
**Backend:** None needed (local state change)  
**Files Modified:** None

---

### ❌ WizardFileSelected (TODO STUB)
```rust
// File: puppet-master-rs/src/app.rs:556
Message::WizardFileSelected(path) => {
    // TODO: Handle file selection
    if let Some(path) = path {
        self.add_toast(ToastType::Info, format!("Selected: {:?}", path));
    }
    Task::none()
}
```
**Status:** ❌ TODO - Not implemented  
**Function:** Should load requirements from file  
**Backend Needed:** 
- File picker dialog
- File reading (std::fs::read)
- Format detection (PDF/DOCX/MD/TXT)
- Parsing (call appropriate parser)
**Files Modified:** None (should modify `wizard_requirements_text`)

**What TypeScript Does:**
```typescript
// src/gui/react/src/pages/Wizard.tsx:76
const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target?.result as string;
        setState((s) => ({ ...s, requirements: content }));
    };
    reader.readAsText(file);
};
```

---

### ❌ WizardGenerate (TODO STUB - CRITICAL)
```rust
// File: puppet-master-rs/src/app.rs:564
Message::WizardGenerate => {
    // TODO: Generate PRD via backend
    self.add_toast(ToastType::Info, "Generating PRD...".to_string());
    Task::none()
}
```
**Status:** ❌ TODO - Not implemented  
**Function:** Should generate PRD, architecture, tier plan via AI  
**Backend Needed:**
- Parse requirements text
- Call PrdGenerator with LLM
- Call ArchGenerator with LLM
- Call TierPlanGenerator
- Update `wizard_prd_preview`, `wizard_architecture`, `wizard_tier_plan`
**Files Modified:** None (should modify state, no disk writes)

**What TypeScript Does:**
```typescript
// src/gui/react/src/pages/Wizard.tsx:110
const generatePRD = async () => {
    // 1. Upload/parse requirements
    const uploadResult = await api.wizardUpload({
        text: state.requirements,
        format: 'text',
    });

    // 2. Generate PRD with AI
    const generateResult = await api.wizardGenerate({
        parsed: uploadResult.parsed,
        projectName: state.projectName,
        projectPath: state.projectPath,
        platform: state.prdPlatform,
        model: state.prdModel,
        useAI: true,
    });

    // 3. Update state with results
    setState((s) => ({
        ...s,
        prd: JSON.stringify(generateResult.prd, null, 2),
        architecture: generateResult.architecture,
        tierPlan: JSON.stringify(generateResult.tierPlan, null, 2),
    }));
};
```

**Backend API Route (TypeScript):**
```typescript
// src/gui/routes/wizard.ts:357
router.post('/wizard/generate', async (req, res) => {
    const prdGenerator = new PrdGenerator(...);
    const prd = await prdGenerator.generateWithAI(parsed, useAI);
    
    const archGenerator = new ArchGenerator(...);
    const architecture = await archGenerator.generateWithAI(parsed, prd, useAI);
    
    const tierPlanGenerator = new TierPlanGenerator(effectiveConfig);
    const tierPlan = tierPlanGenerator.generate(prd);
    
    res.json({ prd, architecture, tierPlan, usedAI: useAI });
});
```

---

### ❌ WizardSave (TODO STUB - CRITICAL)
```rust
// File: puppet-master-rs/src/app.rs:570
Message::WizardSave => {
    // TODO: Save wizard output via backend
    self.add_toast(ToastType::Success, "Saved wizard output".to_string());
    Task::none()
}
```
**Status:** ❌ TODO - Not implemented  
**Function:** Should save PRD, architecture, tier plan, config to disk  
**Backend Needed:**
- Create `.puppet-master/` directory
- Write `prd.json` (from `wizard_prd_preview`)
- Write `architecture.md` (from `wizard_architecture`)
- Write `plans/tier-plan.json` (from `wizard_tier_plan`)
- Generate and write `config.yaml` with tier settings
**Files Modified:** 
- `.puppet-master/prd.json` (should create)
- `.puppet-master/architecture.md` (should create)
- `.puppet-master/plans/tier-plan.json` (should create)
- `.puppet-master/config.yaml` (should create)

**What TypeScript Does:**
```typescript
// src/gui/routes/wizard.ts:604
router.post('/wizard/save', async (req, res) => {
    const puppetMasterDir = join(projectDir, '.puppet-master');
    await fs.mkdir(puppetMasterDir, { recursive: true });
    
    // Save PRD
    const prdPath = join(puppetMasterDir, 'prd.json');
    const prdManager = new PrdManager(prdPath);
    await prdManager.save(prd);
    
    // Save architecture
    const architecturePath = join(puppetMasterDir, 'architecture.md');
    await fs.writeFile(architecturePath, architecture, 'utf-8');
    
    // Save tier plan
    const tierPlanPath = join(plansDir, 'tier-plan.json');
    await fs.writeFile(tierPlanPath, JSON.stringify(tierPlan, null, 2));
    
    // Save config
    const configPath = join(puppetMasterDir, 'config.yaml');
    await fs.writeFile(configPath, configYaml, 'utf-8');
    
    res.json({ success: true, path: projectDir });
});
```

---

## Related Non-Wizard Handlers

### ❌ SaveConfig (TODO STUB)
```rust
Message::SaveConfig => {
    self.add_toast(ToastType::Info, "Saving config...".to_string());
    // TODO: Implement config save
    Task::none()
}
```
**Status:** ❌ TODO - Not implemented  
**Used By:** settings.rs, config.rs  
**Function:** Should persist config.yaml changes  
**Backend Needed:** File write to `.puppet-master/config.yaml`

---

### ❌ ReloadConfig (TODO STUB)
```rust
Message::ReloadConfig => {
    self.add_toast(ToastType::Info, "Reloading config...".to_string());
    // TODO: Implement config reload
    Task::none()
}
```
**Status:** ❌ TODO - Not implemented  
**Used By:** config.rs  
**Function:** Should reload config.yaml from disk  
**Backend Needed:** File read from `.puppet-master/config.yaml`

---

### ❌ RunAllChecks (TODO STUB)
```rust
Message::RunAllChecks => {
    self.add_toast(ToastType::Info, "Running health checks...".to_string());
    // TODO: Spawn async task to run checks
    Task::none()
}
```
**Status:** ❌ TODO - Not implemented  
**Used By:** doctor.rs  
**Function:** Should execute platform health checks  
**Backend Needed:**
- Check CLI installation (`cursor --version`, etc)
- Check Git installation and auth
- Check Node.js version
- Check network connectivity
- Return DoctorCheckResult array

---

### ❌ FixCheck (TODO STUB)
```rust
Message::FixCheck(name, _dry_run) => {
    self.add_toast(ToastType::Info, format!("Fixing: {}", name));
    // TODO: Implement fix command
    Task::none()
}
```
**Status:** ❌ TODO - Not implemented  
**Used By:** doctor.rs  
**Function:** Should auto-fix failed health checks  
**Backend Needed:**
- Execute fix commands (npm install, pip install)
- Show progress
- Update check results

---

### ❌ OpenProject (TODO STUB)
```rust
Message::OpenProject(name) => {
    self.add_toast(ToastType::Info, format!("Opening project: {}", name));
    // TODO: Load project configuration
    Task::none()
}
```
**Status:** ❌ TODO - Not implemented  
**Used By:** projects.rs  
**Function:** Should switch to different project  
**Backend Needed:**
- Load config from project path
- Reload PRD
- Update orchestrator state
- Switch UI context

---

## Summary Statistics

| Category | Count | Percentage |
|----------|-------|------------|
| **Real Handlers** | 3 | 27% |
| **TODO Stubs** | 8 | 73% |
| **Total** | 11 | 100% |

### By Functionality:
| Functionality | Real | TODO |
|--------------|------|------|
| Navigation | 2 | 0 |
| Input Handling | 1 | 0 |
| File Operations | 0 | 2 |
| Backend Integration | 0 | 4 |
| System Checks | 0 | 2 |

---

## Critical Path Analysis

### For Wizard to Work:
1. ✅ `WizardRequirementsChanged` - Already works
2. ❌ `WizardGenerate` - **BLOCKED** (TODO stub)
3. ❌ `WizardSave` - **BLOCKED** (TODO stub)

**Result:** Wizard cannot initialize projects.

### For Project to Start:
1. ❌ Wizard must save PRD - **BLOCKED**
2. ✅ Dashboard can send Start command - Works
3. ✅ Orchestrator can execute - Works (if PRD exists)

**Result:** Start button works, but wizard doesn't create PRD.

---

## Lines of Code Analysis

### Rust Implementation:
```
wizard.rs:          188 lines  (UI only)
app.rs handlers:     30 lines  (mostly TODOs)
Total:              218 lines
```

### TypeScript Implementation:
```
Wizard.tsx:         450 lines  (full UI + API integration)
wizard.ts:          792 lines  (backend API)
PlatformSetupWiz:   763 lines  (platform setup)
Total:             2005 lines
```

**Gap:** ~1787 lines of backend code missing from Rust.

---

## What Would Full Implementation Look Like?

### Rust Backend Module Structure:
```
puppet-master-rs/src/
├── wizard/
│   ├── mod.rs              (200 lines) - Wizard coordinator
│   ├── parsers.rs          (300 lines) - Req parsing
│   ├── generator.rs        (400 lines) - PRD/arch/plan generation
│   ├── validator.rs        (150 lines) - Artifact validation
│   └── persistence.rs      (250 lines) - File I/O
├── platforms/
│   ├── installer.rs        (300 lines) - Platform installation
│   ├── auth.rs             (200 lines) - OAuth flows
│   └── detector.rs         (150 lines) - Installation detection
└── app.rs
    └── Message handlers    (150 lines) - Wire to backend

Total estimated: ~2100 lines
```

---

## Recommendation Priority

### Must Have (P0):
1. `WizardGenerate` - Cannot initialize projects without this
2. `WizardSave` - PRD must be persisted to disk

### Should Have (P1):
3. `WizardFileSelected` - Better UX than paste-only
4. `SaveConfig` / `ReloadConfig` - Config persistence
5. `OpenProject` - Multi-project support

### Nice to Have (P2):
6. `RunAllChecks` / `FixCheck` - Health monitoring
7. Platform install/auth - Currently requires manual CLI

---

## Testing Verification

### How to Verify Each Handler:

```bash
# 1. Test WizardGenerate
cargo run
# In GUI: Enter text, click "Generate PRD"
# Expected: PRD appears in preview
# Actual: Toast appears, preview stays "Generating..."
# Status: ❌ FAILS

# 2. Test WizardSave  
# In GUI: Click "Save & Continue"
ls .puppet-master/
# Expected: prd.json, architecture.md, config.yaml exist
# Actual: Directory may not exist
# Status: ❌ FAILS

# 3. Test SaveConfig
# In GUI: Edit config, click "Save"
cat .puppet-master/config.yaml
# Expected: Changes persisted
# Actual: File unchanged
# Status: ❌ FAILS
```

---

## Conclusion

**Only 3 out of 11 wizard-related handlers are fully implemented.**

The 3 that work are trivial (increment counter, update string).  
The 8 that don't work are critical (generate PRD, save files, run checks).

**The wizard appears functional but is entirely non-operational.**

---

**End of Message Handlers Analysis**
