# Wizard Backend Implementation

## Summary

Implemented complete wizard backend functionality for the Rust GUI (`puppet-master-rs`). The wizard now has full integration with the start chain pipeline for PRD generation.

## Changes Made

### 1. `src/app.rs` - Message Handlers

#### Added `AppCommand::StartChainPipeline(String)`
- New command to trigger PRD generation from requirements text
- Integrated into the command processing loop in `spawn_orchestrator_backend`

#### `Message::WizardFileSelected(Option<PathBuf>)` Implementation
**Behavior:**
- When `None`: Opens async file dialog (`rfd::AsyncFileDialog`) for selecting requirements files (.txt, .md, .markdown)
- When `Some(path)`: Loads file content into `wizard_requirements_text` and shows success/error toast
- Uses `Task::perform` for async file dialog integration with Iced

**File Dialog:**
```rust
rfd::AsyncFileDialog::new()
    .add_filter("Text/Markdown", &["txt", "md", "markdown"])
    .add_filter("All Files", &["*"])
    .set_title("Select Requirements File")
    .pick_file()
    .await
```

#### `Message::WizardGenerate` Implementation
**Behavior:**
1. Validates requirements text is not empty
2. Sends `AppCommand::StartChainPipeline(requirements_text)` to backend
3. Shows "Generating PRD..." toast
4. Advances wizard to step 3 (preview)

**Pipeline triggered:**
- Asynchronously parses requirements via `RequirementsParser::parse()`
- Generates PRD using `PrdGenerator::generate_with_ai()` (with fallback to rule-based)
- Emits progress events: `StartChainStep` (steps 1-2) and `StartChainComplete`
- Sends custom event `WizardPrdGenerated` with PRD JSON payload

#### `Message::WizardSave` Implementation
**Behavior:**
1. Validates `wizard_prd_preview` is present
2. Resolves PRD path: `{project_path}/prd.json` or `./prd.json`
3. Writes PRD JSON to disk
4. Shows success/error toast
5. Advances wizard to step 4 (completion)

### 2. Event Handling - `handle_backend_event()`

#### `PuppetMasterEvent::StartChainStep`
- Shows toast with step progress: "Step X/Y: description"
- Provides user feedback during PRD generation

#### `PuppetMasterEvent::StartChainComplete`
- Success: Shows completion toast with duration
- Failure: Shows error toast

#### `PuppetMasterEvent::Custom` (for "WizardPrdGenerated")
- Extracts PRD JSON from event data
- Updates `wizard_prd_preview` state
- Enables "Save & Continue" button in step 3

### 3. Backend Command Processing

#### `AppCommand::StartChainPipeline(requirements_text)` Handler
**Location:** `spawn_orchestrator_backend()` command processing loop

**Process:**
1. **Step 1 - Parse Requirements:**
   - Calls `RequirementsParser::parse(requirements_text)`
   - Emits `StartChainStep { step: 1, total: 2, description: "Parsing requirements" }`
   - On error: Sends error event and `StartChainComplete { success: false }`

2. **Step 2 - Generate PRD:**
   - Emits `StartChainStep { step: 2, total: 2, description: "Generating PRD" }`
   - Attempts AI generation via `PrdGenerator::generate_with_ai()`:
     - Uses Anthropic Claude 3.5 Sonnet if available
     - Falls back to rule-based generation if platform unavailable
   - Serializes PRD to pretty JSON
   - Emits `Custom { event_type: "WizardPrdGenerated", data: { prd: json } }`
   - Emits `StartChainComplete { success: true, duration_ms }`

**Error Handling:**
- Parse errors → error event + `StartChainComplete { success: false }`
- Generation errors → error event + `StartChainComplete { success: false }`
- Serialization errors → error event + `StartChainComplete { success: false }`

### 4. `src/views/wizard.rs` - Button Wiring

#### Step 1 - "Upload File" Button
**Before:**
```rust
button("Upload File").on_press(Message::WizardNextStep)
```

**After:**
```rust
button("Upload File").on_press(Message::WizardFileSelected(None))
```
- Now opens file dialog instead of advancing step
- Properly loads file content when selected

#### Step 3 - "Save & Continue" Button
**Before:**
```rust
button("Save & Continue →").on_press(Message::WizardNextStep)
```

**After:**
```rust
button("Save & Continue →").on_press(Message::WizardSave)
```
- Now writes PRD to disk before advancing
- Ensures PRD is persisted to `config.paths.prd_path`

## Workflow

### Complete User Flow:

1. **Step 1 - Requirements Input:**
   - User pastes requirements OR clicks "Upload File"
   - File dialog opens, user selects file
   - Requirements loaded into text input
   - User clicks "Next →"

2. **Step 2 - Review:**
   - User reviews parsed requirements
   - User clicks "Generate PRD →"
   - Triggers `WizardGenerate` message

3. **Backend Processing:**
   - `StartChainPipeline` command sent to backend
   - Requirements parsed (Step 1/2 progress)
   - PRD generated with AI (Step 2/2 progress)
   - PRD JSON sent back via custom event

4. **Step 3 - PRD Preview:**
   - `wizard_prd_preview` updated with JSON
   - User reviews generated PRD
   - "Save & Continue" button enabled
   - User clicks button, triggers `WizardSave`

5. **Step 4 - Completion:**
   - PRD written to `prd.json`
   - Success confirmation displayed
   - User can navigate to Dashboard or Projects

## Dependencies

### Existing Crates Used:
- `rfd = "0.15"` - Async file dialogs
- `iced` - Task/async integration
- Existing start_chain modules:
  - `RequirementsParser`
  - `PrdGenerator`
- Existing platform modules:
  - `PlatformManager`
  - `PlatformRunner`

### No New Dependencies Added

## Testing Verification

### Compilation Check:
```bash
cd puppet-master-rs
cargo check
```

### Expected Behavior:
1. File dialog opens on "Upload File" click
2. File content loads into wizard
3. PRD generation starts on "Generate PRD" click
4. Progress toasts appear during generation
5. PRD preview populates in step 3
6. PRD saves to disk on "Save & Continue" click
7. Wizard advances to completion step

## Error Handling

All operations include proper error handling:
- File loading errors → error toast
- Empty requirements → warning toast
- Parse failures → error event + toast
- Generation failures → error event + toast
- Save failures → error toast

## Notes

- Implementation is minimal and focused
- Keeps existing architecture patterns
- Uses async/await for non-blocking operations
- Proper event flow from GUI → backend → GUI
- State updates trigger UI changes automatically
- No breaking changes to existing functionality

## Related Files

- `/puppet-master-rs/src/app.rs` - Main implementation
- `/puppet-master-rs/src/views/wizard.rs` - UI wiring
- `/puppet-master-rs/src/start_chain/` - Backend pipeline modules
- `/puppet-master-rs/src/types/events.rs` - Event definitions
