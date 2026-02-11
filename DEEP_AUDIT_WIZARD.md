# DEEP AUDIT: Platform Setup Wizard - Rust Rewrite

**Date:** $(date)  
**Auditor:** Rust Engineer  
**Concern:** Is the Rust wizard real or just placeholder UI?

---

## Executive Summary

🚨 **CRITICAL FINDING: The Rust Wizard is a DISPLAY-ONLY UI SHELL with ZERO backend connection.**

The wizard has beautiful UI with 4 steps, but **DOES NOT** connect to:
- ❌ Start Chain Pipeline
- ❌ PRD Generation
- ❌ Architecture Generation  
- ❌ Tier Planning
- ❌ Project Initialization

**Verdict:** The TypeScript version had FULL integration. The Rust version is a **FACADE**.

---

## File-by-File Analysis

### 1. **wizard.rs** - The Wizard View

**Location:** `puppet-master-rs/src/views/wizard.rs`

#### What It Claims To Do:
```rust
//! Wizard view - Requirements wizard (multi-step)
//!
//! Guides users through uploading requirements, reviewing, generating PRD, and saving.
```

#### What It Actually Does:
- ✅ **Renders 4-step UI** with step indicators (1→2→3→4)
- ✅ **Collects text input** for requirements
- ✅ **Has buttons** labeled "Generate PRD", "Save & Continue"
- ❌ **NO backend calls** - just updates local state

#### The Steps:

**Step 1: Requirements Input**
```rust
text_input(
    "Enter your project requirements here...",
    requirements_text
)
.on_input(Message::WizardRequirementsChanged)
```
- ✅ Text input works
- ❌ "Upload File" button does NOTHING (calls `WizardNextStep`, not file picker)

**Step 2: Review Requirements**
```rust
button("Generate PRD →")
    .on_press(Message::WizardGenerate)
```
- ✅ Shows scrollable review area
- ❌ "Generate PRD" button triggers a **TODO stub** (see below)

**Step 3: PRD Preview**
```rust
let prd_text = prd_preview.as_ref().map(|s| s.as_str()).unwrap_or("Generating PRD...");
```
- ✅ Shows preview area
- ❌ **ALWAYS shows "Generating PRD..."** because `prd_preview` is never populated

**Step 4: Save & Confirm**
```rust
text("✓ Requirements parsed").size(16),
text("✓ PRD generated").size(16),
text("✓ Configuration saved").size(16),
```
- ✅ Shows success checkmarks
- ❌ **LIES** - nothing was actually saved

---

### 2. **app.rs** - Message Handlers

**Location:** `puppet-master-rs/src/app.rs` (lines 539-574)

#### Handler: `WizardRequirementsChanged`
```rust
Message::WizardRequirementsChanged(text) => {
    self.wizard_requirements_text = text;
    Task::none()
}
```
✅ Real - updates local state

#### Handler: `WizardFileSelected`
```rust
Message::WizardFileSelected(path) => {
    // TODO: Handle file selection
    if let Some(path) = path {
        self.add_toast(ToastType::Info, format!("Selected: {:?}", path));
    }
    Task::none()
}
```
❌ **TODO STUB** - never called, file picker not wired up

#### Handler: `WizardGenerate`
```rust
Message::WizardGenerate => {
    // TODO: Generate PRD via backend
    self.add_toast(ToastType::Info, "Generating PRD...".to_string());
    Task::none()
}
```
❌ **TODO STUB** - Just shows toast, no backend call

#### Handler: `WizardSave`
```rust
Message::WizardSave => {
    // TODO: Save wizard output via backend
    self.add_toast(ToastType::Success, "Saved wizard output".to_string());
    Task::none()
}
```
❌ **TODO STUB** - Just shows toast, no save operation

#### Handler: `WizardNextStep` / `WizardPrevStep`
```rust
Message::WizardNextStep => {
    self.wizard_step += 1;
    Task::none()
}

Message::WizardPrevStep => {
    if self.wizard_step > 0 {
        self.wizard_step -= 1;
    }
    Task::none()
}
```
✅ Real - just increments/decrements a counter

---

### 3. **Start Chain Connection: MISSING**

**Searched for:** `StartChain`, `start_chain`, `StartPipeline`, `start_pipeline`

**Result:** ❌ **ZERO matches in app.rs**

The wizard **NEVER** calls:
- Start Chain Pipeline
- PRD Generator
- Architecture Generator
- Tier Plan Generator
- Validation Gate
- File I/O operations

---

## Comparison: TypeScript vs Rust

### TypeScript Implementation (REAL)

**File:** `src/gui/react/src/pages/Wizard.tsx`

#### What It Does:
```typescript
const generatePRD = useCallback(async () => {
    // 1. Upload requirements
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

    // 3. Update UI with results
    setState((s) => ({
        ...s,
        prd: typeof generateResult.prd === 'string' ? generateResult.prd : JSON.stringify(generateResult.prd, null, 2),
        architecture: generateResult.architecture || null,
        tierPlan: generateResult.tierPlan ? JSON.stringify(generateResult.tierPlan, null, 2) : null,
        loading: false,
    }));
    nextStep();
}, [state.requirements, state.projectName, state.projectPath, state.prdPlatform, state.prdModel, nextStep]);
```

#### Backend API: REAL
**File:** `src/gui/routes/wizard.ts`

```typescript
router.post('/wizard/generate', async (req: Request, res: Response) => {
    // Uses PrdGenerator, ArchGenerator, TierPlanGenerator
    const prdGenerator = new PrdGenerator(
        { projectName: name },
        useAI ? deps.platformRegistry : undefined,
        useAI ? deps.quotaManager : undefined,
        effectiveConfig,
        useAI ? deps.usageTracker : undefined
    );

    const prd = await prdGenerator.generateWithAI(parsed, useAI);
    
    const archGenerator = new ArchGenerator(...);
    const architecture = await archGenerator.generateWithAI(parsed, prd, useAI);
    
    const tierPlanGenerator = new TierPlanGenerator(effectiveConfig);
    tierPlan = tierPlanGenerator.generate(prd);
    
    res.json({ prd, architecture, tierPlan, usedAI: useAI });
});
```

#### Save: REAL
```typescript
router.post('/wizard/save', async (req: Request, res: Response) => {
    // Option 1: Run full Start Chain Pipeline
    const pipeline = new StartChainPipeline(...);
    const result = await pipeline.execute({
        parsed,
        projectPath: projectDir,
        projectName,
    });
    
    // Option 2: Save pre-generated artifacts
    await prdManager.save(prd);
    await fs.writeFile(architecturePath, architecture, 'utf-8');
    await fs.writeFile(tierPlanPath, JSON.stringify(tierPlan, null, 2), 'utf-8');
    await fs.writeFile(configPath, configYaml, 'utf-8');
});
```

### Rust Implementation (FAKE)

❌ No API endpoints  
❌ No PrdGenerator integration  
❌ No ArchGenerator integration  
❌ No StartChainPipeline integration  
❌ No file I/O  
❌ No backend communication  

**Just increments `wizard_step` and shows toasts.**

---

## Other Views Analysis

### 4. **settings.rs** - Settings View

**Location:** `puppet-master-rs/src/views/settings.rs`

#### What It Shows:
- ✅ Theme selector (Light/Dark)
- ✅ Log level display
- ✅ Auto-scroll toggle
- ✅ "Clear All Data", "Reset to Defaults", "Open Data Directory" buttons
- ✅ "Save Settings" button

#### What Actually Works:
```rust
button("Clear All Data")
    .on_press(Message::NavigateTo(Page::Settings))
```
❌ **Just navigates back to settings page** (does nothing)

```rust
button("Save Settings")
    .on_press(Message::SaveConfig)
```
⚠️ Calls `SaveConfig` message, but unclear if implemented

**Verdict:** Display-only UI with minimal functionality

---

### 5. **config.rs** - Configuration Editor

**Location:** `puppet-master-rs/src/views/config.rs`

#### What It Shows:
- ✅ YAML text editor
- ✅ Validation status indicator
- ✅ Error display
- ✅ Save/Reload/Reset buttons

#### Messages:
```rust
button("Save")
    .on_press(if valid {
        Message::SaveConfig
    } else {
        Message::AddToast(...)
    })
```

**Check app.rs for SaveConfig:**
```rust
Message::SaveConfig => {
    self.add_toast(ToastType::Info, "Saving config...".to_string());
    // TODO: Implement config save
    Task::none()
}
```
❌ **TODO STUB** - just shows toast

**Verdict:** Editor works, but save does nothing

---

### 6. **doctor.rs** - System Health Checks

**Location:** `puppet-master-rs/src/views/doctor.rs`

#### What It Shows:
- ✅ Health check results by category (CLI, Git, Runtime, Project, Network)
- ✅ Pass/fail status badges
- ✅ "Run All Checks" button
- ✅ "Fix" buttons for failed checks

#### Message Handlers:
```rust
button("Run All Checks")
    .on_press(Message::RunAllChecks)

button("Fix")
    .on_press(Message::FixCheck(check.name.clone(), false))
```

**Check app.rs:**
```rust
Message::RunAllChecks => {
    self.add_toast(ToastType::Info, "Running health checks...".to_string());
    // TODO: Spawn async task to run checks
    Task::none()
}

Message::FixCheck(name, _dry_run) => {
    self.add_toast(ToastType::Info, format!("Fixing: {}", name));
    // TODO: Implement fix command
    Task::none()
}
```
❌ **TODO STUBS** - no actual health checks run

**Verdict:** UI shell only

---

### 7. **projects.rs** - Project Management

**Location:** `puppet-master-rs/src/views/projects.rs`

#### What It Shows:
- ✅ Project list with status indicators
- ✅ "New Project" button
- ✅ "Open" button for each project

#### Messages:
```rust
button("+ New Project")
    .on_press(Message::NavigateTo(Page::Projects))

button("Open")
    .on_press(Message::OpenProject(project.name.clone()))
```

**Check app.rs:**
```rust
Message::OpenProject(name) => {
    self.add_toast(ToastType::Info, format!("Opening project: {}", name));
    // TODO: Load project configuration
    Task::none()
}
```
❌ **TODO STUB**

**Verdict:** Display-only, no project switching

---

## Platform Setup: TypeScript vs Rust

### TypeScript: FULL Platform Setup Wizard

**File:** `src/gui/react/src/components/wizard/PlatformSetupWizard.tsx`

#### What It Does:
1. **Install Step:**
   - Detects installed platforms (Cursor, Claude, Codex, Gemini, Copilot)
   - Shows install status with badges
   - "Install" buttons call `api.installPlatform(platform)`
   - "Install All Missing" batch installer
   - Shows Node.js requirement warnings
   - Displays install command output and errors

2. **Auth Step:**
   - Checks authentication status for each platform
   - "Login" buttons call `api.loginPlatform(platform)`
   - Opens browser for OAuth flows
   - Polls auth status until complete
   - "Check Status" manual refresh
   - Skip individual or all platforms

3. **Save:**
   - Calls `api.selectPlatforms(selectedPlatforms)`
   - Persists to config
   - Completes first-boot flow

#### Backend APIs:
```typescript
// Platform detection
GET /api/platforms/status

// Install platform
POST /api/platforms/install
Body: { platform: 'cursor' }

// Login
POST /api/platforms/login
Body: { platform: 'cursor' }

// Get auth status
GET /api/platforms/login-status

// Save selections
POST /api/platforms/select
Body: { platforms: ['cursor', 'claude'] }
```

### Rust: NO Platform Setup

❌ No platform detection  
❌ No install functionality  
❌ No auth flow  
❌ No platform selection persistence  

**The Rust GUI assumes platforms are already configured externally.**

---

## Dashboard Start Button Analysis

### Dashboard Has "Start" Button

**File:** `puppet-master-rs/src/views/dashboard.rs` (line 115)

```rust
let controls = match status {
    "idle" => row![
        button("Start").on_press(Message::StartOrchestrator),
    ].spacing(10),
    "running" => row![
        button("Pause").on_press(Message::PauseOrchestrator),
        button("Stop").on_press(Message::StopOrchestrator),
    ].spacing(10),
    // ...
}
```

### Handler Implementation

**File:** `puppet-master-rs/src/app.rs` (line 364)

```rust
Message::StartOrchestrator => {
    self.send_command(AppCommand::Start);
    self.add_toast(ToastType::Info, "Starting orchestrator...".to_string());
    Task::none()
}
```

#### What `send_command` Does:
```rust
fn send_command(&mut self, command: AppCommand) {
    if let Some(tx) = &self.command_tx {
        let _ = tx.send(command);
    }
}
```

✅ **This IS real!** It sends a command to the orchestrator thread.

### AppCommand Enum:
```rust
pub enum AppCommand {
    Start,
    Pause,
    Stop,
    ReloadConfig,
    RunHealthChecks,
}
```

✅ **The orchestrator control commands are implemented!**

**BUT:** The orchestrator needs a PRD to start. The wizard doesn't generate one.

---

## The Complete Disconnect

### The Workflow That SHOULD Exist:

1. User opens Wizard
2. User enters requirements text
3. User clicks "Generate PRD"
   - → Wizard calls Start Chain Pipeline
   - → PRD Generator runs with LLM
   - → Architecture Generator runs
   - → Tier Plan Generator runs
   - → Files saved to `.puppet-master/`
4. User clicks "Save & Continue"
   - → Config.yaml created with settings
   - → Wizard navigates to Dashboard
5. User clicks "Start" on Dashboard
   - → Orchestrator reads PRD from disk
   - → Execution begins

### What ACTUALLY Happens in Rust:

1. User opens Wizard ✅
2. User enters requirements text ✅
3. User clicks "Generate PRD" ❌
   - → Shows toast "Generating PRD..."
   - → Does nothing else
   - → Never generates PRD
4. User clicks "Save & Continue" ❌
   - → Shows toast "Saved wizard output"
   - → Saves nothing to disk
   - → Navigates to Dashboard anyway
5. User clicks "Start" on Dashboard ✅
   - → Sends Start command to orchestrator
   - → **Orchestrator finds no PRD** 💥
   - → **Execution fails**

---

## Why This Matters

### The TypeScript version provides:
1. **Platform Setup Wizard** - Install and authenticate AI platforms
2. **Requirements Wizard** - Parse and structure requirements
3. **PRD Generation** - AI-powered PRD creation
4. **Architecture Generation** - System design from requirements
5. **Tier Planning** - Break down work into phases/tasks/subtasks
6. **Project Initialization** - Create all config files and directories
7. **Start Chain Pipeline** - Orchestrate the entire flow

### The Rust version provides:
1. ❌ No platform setup
2. ❌ No requirements wizard backend
3. ❌ No PRD generation
4. ❌ No architecture generation
5. ❌ No tier planning
6. ❌ No project initialization
7. ❌ No start chain integration

**Just UI that pretends to work.**

---

## Specific TODO Comments Found

### In wizard handlers (app.rs):
```rust
// TODO: Handle file selection
// TODO: Generate PRD via backend
// TODO: Save wizard output via backend
```

### In config handler (app.rs):
```rust
// TODO: Implement config save
```

### In doctor handlers (app.rs):
```rust
// TODO: Spawn async task to run checks
// TODO: Implement fix command
```

### In project handler (app.rs):
```rust
// TODO: Load project configuration
```

---

## What IS Real in the Rust Rewrite?

### Actually Implemented:
- ✅ **UI Framework** - Iced rendering works
- ✅ **Theme System** - Light/Dark mode
- ✅ **Navigation** - Page switching
- ✅ **State Management** - App state updates
- ✅ **Toast Notifications** - Pop-up messages
- ✅ **Orchestrator Commands** - Start/Pause/Stop (if PRD exists)
- ✅ **Command Channel** - Communication with orchestrator thread
- ✅ **Dashboard Display** - Shows status, progress, output
- ✅ **Evidence Browser** - Shows test results (if they exist)
- ✅ **Metrics Display** - Shows usage data (if it exists)
- ✅ **History Viewer** - Shows event log (if it exists)

### NOT Implemented:
- ❌ **Wizard Backend** - No PRD generation
- ❌ **Platform Setup** - No install/auth
- ❌ **Doctor Backend** - No health checks
- ❌ **Config Persistence** - No file I/O
- ❌ **Project Management** - No project switching
- ❌ **File Upload** - No file picker integration
- ❌ **API Client** - No HTTP requests to TypeScript backend

---

## Architecture Problem

The Rust GUI was designed to be **standalone**, but it's missing the core functionality:

### What the TypeScript GUI Does:
```
┌─────────────┐
│ React GUI   │
│             │
│ - Wizard UI │
│ - API calls │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────────────┐
│ Express Server      │
│                     │
│ /api/wizard/upload  │
│ /api/wizard/generate│ ──► PrdGenerator
│ /api/wizard/save    │ ──► ArchGenerator
│                     │ ──► TierPlanGenerator
│                     │ ──► StartChainPipeline
└─────────────────────┘
```

### What the Rust GUI Does:
```
┌─────────────┐
│ Iced GUI    │
│             │
│ - Wizard UI │
│ - TODO stubs│ ──► ❌ Nothing
└─────────────┘
```

**The Rust GUI is missing the entire backend layer.**

---

## Recommendations

### Option 1: Connect Rust GUI to TypeScript Backend
- Keep TypeScript API server running
- Add HTTP client to Rust app (reqwest)
- Wire wizard messages to API calls
- **Pros:** Leverages existing backend
- **Cons:** Requires both runtimes

### Option 2: Port TypeScript Backend to Rust
- Rewrite `src/gui/routes/wizard.ts` in Rust
- Port `StartChainPipeline` to Rust
- Integrate with existing `core/orchestrator.rs`
- **Pros:** Pure Rust solution
- **Cons:** Significant porting effort

### Option 3: CLI-First Approach
- Document that Rust GUI requires `puppet-master init` first
- User runs CLI command to generate PRD
- GUI only provides monitoring/control
- **Pros:** Clear separation of concerns
- **Cons:** Poor UX for new users

### Option 4: Hybrid Approach
- Implement basic PRD generation in Rust (rule-based, no AI)
- Add file I/O for saving config
- Keep advanced features in TypeScript
- **Pros:** Self-contained for simple cases
- **Cons:** Feature gap remains

---

## Conclusion

### Is the Wizard Real?

**NO.** The Platform Setup Wizard in the Rust rewrite is:
- ✅ A visually complete 4-step UI
- ✅ Responsive to user input
- ❌ Not connected to any backend
- ❌ Does not generate PRDs
- ❌ Does not save files
- ❌ Does not integrate with Start Chain Pipeline
- ❌ Does not enable users to initialize projects

### Comparison Verdict:

| Feature | TypeScript | Rust |
|---------|-----------|------|
| Platform Detection | ✅ Full | ❌ None |
| Platform Install | ✅ Full | ❌ None |
| Platform Auth | ✅ Full | ❌ None |
| Requirements Input | ✅ Full | ✅ UI Only |
| Requirements Parsing | ✅ Full | ❌ None |
| PRD Generation | ✅ AI + Fallback | ❌ None |
| Architecture Gen | ✅ AI + Fallback | ❌ None |
| Tier Planning | ✅ Full | ❌ None |
| File Saving | ✅ Full | ❌ None |
| Config Creation | ✅ Full | ❌ None |
| Start Chain | ✅ Full | ❌ None |

**The TypeScript implementation is production-ready.**  
**The Rust implementation is a UI mockup.**

---

## Evidence Files

### Rust Implementation:
- `puppet-master-rs/src/views/wizard.rs` - UI only
- `puppet-master-rs/src/app.rs` - TODO stubs for all wizard handlers

### TypeScript Implementation:
- `src/gui/react/src/pages/Wizard.tsx` - Full wizard with API integration
- `src/gui/react/src/components/wizard/PlatformSetupWizard.tsx` - Platform setup
- `src/gui/routes/wizard.ts` - Backend API endpoints (792 lines)
- `src/start-chain/index.ts` - Start Chain Pipeline integration

### Proof of Disconnect:
```bash
# Search for Start Chain in Rust app.rs:
grep -i "StartChain\|start_chain" puppet-master-rs/src/app.rs
# Result: 0 matches

# Search for PRD generation in wizard handlers:
grep -A5 "WizardGenerate" puppet-master-rs/src/app.rs
# Result: TODO comment, Toast message, Task::none()
```

---

**Audit Complete.**  
**The wizard needs a complete backend implementation to match TypeScript functionality.**
