# Puppet Master Plans -- Concept Definitions Report

## 1. BaseRunner -- Structure, Fields, and Role in Execution

**Files and Lines:**
- `Plans/FileSafe.md` lines 91-100, 591-637, 1138-1150
- `Plans/FileSafe.md` lines 586-668 (full definition example)

**Current Structure and Fields:**

```rust
pub struct BaseRunner {
    // ... existing fields ...
    bash_guard: Arc<BashGuard>,
    file_guard: Arc<FileGuard>,
    security_filter: Arc<SecurityFilter>
}

impl BaseRunner {
    pub fn new(command: String, platform: Platform) -> Self { ... }
    pub async fn execute_command(
        &self, 
        request: &ExecutionRequest, 
        args: Vec<String>, 
        stdin_input: Option<String>
    ) -> Result<ExecutionResult> { ... }
}
```

**Role in Execution:**
- BaseRunner is the **low-level command executor** for individual platform runners (e.g., CursorRunner, ClaudeRunner)
- Located in: `puppet-master-rs/src/platforms/runner.rs`
- Executes CLI commands via spawn after:
  1. **Quota/rate limit checks** (existing)
  2. **FileSafe guard checks** (new):
     - `bash_guard.check_command()` — blocks destructive CLI commands before spawn
     - `file_guard.check_file_write()` — blocks writes outside allowed plan scope
     - `security_filter.check_file_access()` — blocks access to sensitive files
  3. **Permission audits** (existing)
- Guards are initialized in `BaseRunner::new()` with pattern file resolution:
  - Tries project-specific: `.puppet-master/destructive-commands.local.txt`
  - Falls back to bundled: `config/destructive-commands.txt`
  - Gracefully disables if initialization fails (logs warning)

**Key Contract:**
`ContractRef: CodePath:puppet-master-rs/src/platforms/runner.rs#BaseRunner::execute_command`

---

## 2. ExecutionRequest -- Structure/Fields and Creation

**Files and Lines:**
- `Plans/FileSafe.md` lines 127-130, 1097-1105
- `Plans/orchestrator-subagent-integration.md` (references to ExecutionRequest creation)

**Current Structure (inferred from FileSafe and orchestrator context):**

```rust
struct ExecutionRequest {
    prompt: String,
    env_vars: HashMap<String, String>,      // Contains PUPPET_MASTER_* vars
    context_files: Vec<PathBuf>,            // Implicitly allowed for write scope
    working_directory: PathBuf,             // May be a worktree path
    plan_mode: bool,                        // Tier-level execution mode
    // ... other fields: platform, model, etc.
}
```

**Key env_vars that ExecutionRequest carries:**
- `PUPPET_MASTER_OPERATION_TYPE` — values: `"normal"` (default), `"verification_gate"`, `"interview"`
- `PUPPET_MASTER_ALLOWED_FILES` — JSON array of repo-relative paths allowed for write scope

**Who Creates It:**
- **Orchestrator** (in `puppet-master-rs/src/core/orchestrator.rs`)
  - Builds ExecutionRequest per tier (Phase, Task, Subtask, Iteration)
  - Sets `plan_mode` from `tier_config.plan_mode`
  - Populates `PUPPET_MASTER_ALLOWED_FILES` via `get_allowed_files_for_current_subtask()`
  - Sets `PUPPET_MASTER_OPERATION_TYPE` for verification gates / interview runs
  - Line 1097-1105: Example of request construction in FileSafe plan
- **Platform runners** (Cursor, Claude, Gemini adapters) receive ExecutionRequest and execute via BaseRunner

**Contract References:**
- `ContractRef: CodePath:puppet-master-rs/src/types/execution.rs`
- `Plans/orchestrator-subagent-integration.md §1372, §1467` (plan_mode propagation)
- `Plans/FileSafe.md §12.6` (ExecutionRequest convention, load_allowed_files_from_request)

---

## 3. Orchestrator -- Construction of Execution Requests, Context Management, Runner Interface

**Files and Lines:**
- `Plans/orchestrator-subagent-integration.md` lines 63-100, 122-207, 685, 1372-1467
- `Plans/FileSafe.md` lines 116-130, 1720

**Orchestrator Role:**
The orchestrator is the **central execution scheduler and tier manager** that:
1. **Builds ExecutionRequest** for each tier (Phase, Task, Subtask, Iteration):
   - Assembles prompt from tier context + plan metadata
   - Computes allowed files from current subtask's declared file list
   - Sets plan_mode from tier config
   - Injects operation type (normal / verification_gate / interview)
   - Provides working directory (may be worktree path)

2. **Manages execution context** across tiers:
   - Loads project context (language, domain, tech stack)
   - Maintains active worktrees and branch state
   - Handles tier visibility rules (Instruction / Work / Memory bundles)
   - Injects parent summary and attempt journal per config
   - Computes "Injected Context" breakdown for deterministic audit

3. **Interfaces with runners:**
   - Calls platform runners (CursorRunner, ClaudeRunner, etc.) with ExecutionRequest
   - Platform runners delegate to BaseRunner for command execution
   - Receives results and updates tier state / evidence

**Key Functions (per orchestrator plan):**
- `execute_tier_with_subagents()` — executes a tier with multiple subagent personas
  - When building ExecutionRequest for subagent runs: **set `request.plan_mode = tier_config.plan_mode`**
- `get_allowed_files_for_current_subtask()` — derives allowed files from subtask plan metadata
  - Returns `HashSet<PathBuf>` for current subtask scope
  - Primary source: current subtask's declared file list
  - Context files are implicitly allowed via `request.context_files`
- `validate_config_wiring_for_tier()` — validates config is properly wired at each tier
- `build_execution_config()` — merges three sources at run start (run config > tier config > defaults)

**Config Wiring (critical for allowed_files and plan_mode):**
- Orchestrator builds config from merged sources:
  1. Run-level config (highest precedence)
  2. Tier-level overrides (TierConfig, InterviewConfig)
  3. Application defaults (lowest precedence)
- At run start: config is built from `gui_config` via Option B pattern (no file merge in Phase 1)
- Must ensure `enable_tier_subagents`, `plan_mode`, concurrency caps propagate into each tier

**Contract References:**
- `ContractRef: CodePath:puppet-master-rs/src/core/orchestrator.rs`
- `Plans/orchestrator-subagent-integration.md` (main orchestrator plan)
- `Plans/FileSafe.md §12.6 Gap 2` (orchestrator must set allowed_files on ExecutionRequest)
- `Plans/Executor_Protocol.md §4-6` (execution model, scheduling)

---

## 4. Worktree -- Management, References to Lane Pools, Parallel Execution

**Files and Lines:**
- `Plans/WorktreeGitImprovement.md` lines 42-280, 313-362, 403
- `Plans/storage-plan.md` lines 213, 345, 352, 355, 812
- `Plans/orchestrator-subagent-integration.md` (parallel execution context)

**Worktree Management:**
- **Creation:** Worktrees are created per tier (Task / Subtask) when `enable_parallel_execution` is true
  - Path: `.puppet-master/worktrees/<tier_id>`
  - Branch: `subtask/<subtask_id>` (with sanitization)
  - Created from base branch (e.g., `main`) via `git worktree add -b <branch> <path>`
  - **Gap:** Must ensure main repo is checked out to base_branch before creating parallel worktrees

- **Tracking:** Active worktrees stored in-memory only (lost on restart)
  - **Gap:** On orchestrator init, repopulate from `worktree_manager.list_worktrees()` 
  - Or fall back to path validation when resolving working_directory for a tier

- **Cleanup:** `cleanup_subtask_worktree()` removes worktree on merge/completion
  - **Gap:** On merge conflict, worktree is kept but tier removed from active_worktrees; re-run can destroy conflicting worktree

- **State Persistence:** 
  - Canonical: `redb` key `orchestrator.receipt.{run_id}.{attempt_id}` → includes `worktree_id?`
  - Event log: `run.background_enqueued`, `run.background_state_changed` events include optional `worktree_path`, `branch_name`

**Lane Pools / Parallel Execution:**
- **Scheduler lanes** (Executor_Protocol.md §3 Runtime Scheduler Addendum):
  - `scheduler_lane` order: `remediation > unblocker > normal`
  - Applies per-node selection, not per-level
  
- **Concurrency Limits:**
  - Global: `concurrency.global.per_provider` (in PuppetMasterConfig)
  - Orchestrator context: `concurrency.overrides.orchestrator.per_provider` 
  - Effective cap resolved at run start (later overrides earlier)
  - Sourced from GUI: `gui_config.advanced.execution` → `enable_parallel`, per-provider caps

- **Parallel Subtask Execution:**
  - Multiple subtasks with no dependencies (`depends_on` is empty/missing) run in parallel
  - Each uses a separate worktree (if enabled)
  - Orchestrator builds dependency graph from PRD `depends_on` fields
  - Topological sort yields runnable sets; all nodes in a set run in parallel (capacity permitting)

**Config Wiring (Phase 1 Gap):**
- GUI setting `enable_parallel_execution` (in `gui_config.advanced.execution.enable_parallel`)
- **NOT currently wired** to orchestrator config (WorktreeGitImprovement.md lines 62, 222-223)
- Must be fixed: when starting run, build orchestrator config from `gui_config` so parallel execution setting is used

**Contract References:**
- `Plans/WorktreeGitImprovement.md` §2-5 (detailed gaps and fixes)
- `Plans/Executor_Protocol.md §4 Capacity-aware parallel dispatch` (scheduling with lane pools)
- `Plans/orchestrator-subagent-integration.md` (parallel task/subtask execution via `depends_on`)

---

## 5. FileGuard / file_guard / Write Scope -- Current Model

**Files and Lines:**
- `Plans/FileSafe.md` lines 1257-1360 (full detailed specification)
- `Plans/FileSafe.md` lines 1266-1355 (struct definition and methods)
- `Plans/feature-list.md` (feature summary)

**Data Structure:**
```rust
// DRY:DATA:FileGuard — FileSafe write scope: blocks writes outside active plan
pub struct FileGuard {
    enabled: bool,
}

impl FileGuard {
    // DRY:FN:check_file_write — Check if file write is allowed
    pub fn check_file_write(
        &self, 
        file_path: &Path, 
        working_directory: &Path, 
        allowed_files: &HashSet<PathBuf>
    ) -> Result<(), GuardError>
    
    // DRY:FN:load_allowed_files_from_request — Load allowed files from ExecutionRequest metadata
    pub fn load_allowed_files_from_request(
        request: &ExecutionRequest
    ) -> Result<HashSet<PathBuf>>
}
```

**Write Scope Model:**
1. **Allowed Files Sources** (checked per request in order):
   - `PUPPET_MASTER_ALLOWED_FILES` env var (JSON array of repo-relative paths + explicit directories)
   - `request.context_files` (implicitly allowed)
   - Plan metadata file (if in context)

2. **Check Behavior:**
   - Guard disabled → always allow
   - File path in allowed_files (exact match) → allow
   - Relative path (from working_directory) in allowed_files → allow
   - Any parent directory in allowed_files → allow (directory-level permissions)
   - Otherwise → **block (fail closed)**

3. **No Interior Mutability (AutoDecision Option B):**
   - FileGuard does NOT store request-scoped allowlists
   - Runner computes `allowed_files` per request via `load_allowed_files_from_request()`
   - Passes `&allowed_files` into `check_file_write()` for each check

4. **Integration Point:**
   - Called in `BaseRunner::execute_command()` before spawn
   - Per-request update happens when orchestrator builds ExecutionRequest:
     - Sets `PUPPET_MASTER_ALLOWED_FILES` with current subtask's file list
     - BaseRunner reads this and validates writes

5. **Strict Mode:**
   - `file_guard.strict_mode` (default: false, changes to per-config when plan wiring complete)
   - Strict = block writes; non-strict = warn-only

**Configuration:**
- GUI label: **"Write scope"**
- Internal key: `file_guard` (for backward compatibility)
- Config: `filesafe.file_guard { enabled, strict_mode }`

**Gaps / Issues:**
- **Plan metadata availability:** Write scope needs current plan's allowed files, but plans not directly accessible to BaseRunner
  - **Fix:** Orchestrator derives and passes via `PUPPET_MASTER_ALLOWED_FILES` env var
- **Worktree symlinks:** Must handle symlink resolution when normalizing paths
- **MVP limitations:** No wildcard patterns; exact paths and explicit directories only

**Contract References:**
- `ContractRef: EnvVar:PUPPET_MASTER_ALLOWED_FILES, ConfigKey:filesafe.fileGuard.strictMode`
- `Plans/FileSafe.md §11.1` (full specification)
- `Plans/FileSafe.md §15.9 Gap 2` (orchestrator must compute and pass allowed files)

---

## 6. Verification Gate / verification_gate -- How It Works

**Files and Lines:**
- `Plans/FileSafe.md` lines 45, 688-689, 738-762, 1145, 1152, 1155, 1177, 1602-1621
- `Plans/FileSafe.md` lines 1715, 1621

**Concept:**
A **verification gate** is a special execution mode that allows **destructive operations to run during QA/testing** (normally blocked by FileSafe guards).

**Detection:**
- Checked via `ExecutionRequest.env_vars["PUPPET_MASTER_OPERATION_TYPE"]` 
- **Fixed values:** `"normal"` (default), `"verification_gate"`, `"interview"`
- Set by orchestrator when building ExecutionRequest for QA/verification tiers

**Behavior:**
1. **Destructive Command Check:**
   ```rust
   if let Err(e) = self.bash_guard.check_command(&full_command_string) {
       // Check if verification gate operation
       if self.is_verification_gate_operation(&request) {
           warn!("Destructive command allowed during verification gate: {}", e);
           // Allow execution
       } else {
           // Block (normal mode)
           return Err(anyhow!("Destructive command blocked: {}", e));
       }
   }
   ```

2. **Guard Loosening Policy:**
   - FileSafe guards MAY loosen **only for `verification_gate`** (never for `normal`)
   - Specifically: command blocklist is relaxed, write scope is relaxed
   - Security filter remains active (still block sensitive files)

3. **Interview Mode:**
   - Similar to verification_gate for interview-phase executions
   - `PUPPET_MASTER_OPERATION_TYPE == "interview"`
   - Guards loosen similarly to verification_gate

4. **Per-Request Passing:**
   - Orchestrator sets on ExecutionRequest when constructing for verification tier:
     ```rust
     request = request.with_env("PUPPET_MASTER_OPERATION_TYPE", "verification_gate");
     ```

5. **Helper Implementation:**
   - `BaseRunner::is_verification_gate_operation(request: &ExecutionRequest) -> bool`
     - Returns `true` if `PUPPET_MASTER_OPERATION_TYPE == "verification_gate" || "interview"`
   - Called before guard block to decide allow/deny

**Contract References:**
- `ContractRef: EnvVar:PUPPET_MASTER_OPERATION_TYPE`
- `Plans/FileSafe.md §15.1` (Integration with BaseRunner)
- `Plans/FileSafe.md §12.6 AutoDecision` (fixed values for PUPPET_MASTER_OPERATION_TYPE)

---

## 7. PUPPET_MASTER_OPERATION_TYPE -- All Referenced Values and Usages

**Files and Lines:**
- `Plans/FileSafe.md` lines 688, 738, 760, 1145, 1152, 1155, 1177, 1567-1569, 1598-1621, 1715
- `Plans/FileSafe.md` lines 1721 (AutoDecision), 1621 (usage in check_command)

**Defined Values (fixed set, per AutoDecision):**

| Value | Meaning | Guard Behavior |
|-------|---------|---|
| `"normal"` | Default execution mode | Guards enabled, fail-closed (block destructive) |
| `"verification_gate"` | QA/verification tier execution | Guards loosen, allow destructive (with warning) |
| `"interview"` | Interview-phase execution | Guards loosen, allow destructive (with warning) |

**Usages:**

1. **Setting the variable (Orchestrator):**
   - When building ExecutionRequest for verification/interview tier
   - Line 1720: `request = request.with_env("PUPPET_MASTER_OPERATION_TYPE", "verification_gate");`

2. **Reading the variable (BaseRunner / Platform Runners):**
   - In `BaseRunner::execute_command()` before spawning process
   - In `CursorRunner::execute()` after compiling prompt (line 689, 1568)
   - In prompt content check (line 760-762)

3. **Guard Decisions:**
   - Command blocklist: Allow if `verification_gate` (line 688-690, 1567-1569)
   - Write scope: Allow if `verification_gate` (implied, same as command blocklist)
   - Security filter: **ALWAYS block sensitive files** (never loosen)
   - Prompt checking: Allow destructive in prompt if `verification_gate` (line 1598)

**Contract References:**
- `ContractRef: EnvVar:PUPPET_MASTER_OPERATION_TYPE`
- `Plans/FileSafe.md §15.1 Verification gate detection` (exact line for check)
- `Plans/FileSafe.md §12.6 AutoDecision` (fixed values definition)

---

## 8. PUPPET_MASTER_ALLOWED_FILES / allowed_files -- Derivation and Structure

**Files and Lines:**
- `Plans/FileSafe.md` lines 1326-1354 (load_allowed_files_from_request)
- `Plans/FileSafe.md` lines 1333-1343 (JSON parsing from env var)
- `Plans/FileSafe.md` lines 1350, 1717-1718 (orchestrator responsibility)

**How Allowed File List is Derived:**

1. **Primary Source: Subtask Plan Metadata**
   - Orchestrator reads current subtask's declared file list
   - Function: `get_allowed_files_for_current_subtask(&tier_state) -> Option<HashSet<PathBuf>>`
   - Returns files/directories that this subtask is allowed to modify

2. **Explicit Communication to BaseRunner:**
   - Orchestrator converts HashSet to JSON array
   - Stores in `ExecutionRequest.env_vars["PUPPET_MASTER_ALLOWED_FILES"]`
   - Format: `JSON array of repo-relative paths and/or explicit directories`
   ```rust
   if let Some(allowed_files) = get_allowed_files_for_current_subtask(&tier_state) {
       request = request.with_env(
           "PUPPET_MASTER_ALLOWED_FILES",
           serde_json::to_string(&allowed_files).unwrap_or_default()
       );
   }
   ```

3. **Implicit Allowlisting: Context Files**
   - `request.context_files` are always implicitly allowed
   - Reason: These are files the orchestrator explicitly provided for context
   - FileGuard::load_allowed_files_from_request() adds them (line 1345-1348)

4. **Loading in BaseRunner:**
   ```rust
   pub fn load_allowed_files_from_request(request: &ExecutionRequest) -> Result<HashSet<PathBuf>> {
       let mut allowed = HashSet::new();
       
       // 1. Parse PUPPET_MASTER_ALLOWED_FILES env var (JSON array)
       if let Some(files_json) = request.env_vars.get("PUPPET_MASTER_ALLOWED_FILES") {
           if let Ok(files) = serde_json::from_str::<Vec<String>>(files_json) {
               for file_str in files {
                   allowed.insert(PathBuf::from(file_str));
               }
           }
       }
       
       // 2. Add context files (implicitly allowed)
       for context_file in &request.context_files {
           allowed.insert(context_file.clone());
       }
       
       Ok(allowed)
   }
   ```

5. **Fallback / Empty Behavior:**
   - If `PUPPET_MASTER_ALLOWED_FILES` missing or empty AND `file_guard.enabled == true`:
     - Treat as **empty allowlist (fail closed)**
   - Enforcement depends on `strict_mode`:
     - Strict = block writes
     - Non-strict = warn-only (log violation, allow execution)

**Owner for Derivation:**
- `puppet-master-rs/src/core/orchestrator.rs` (AutoDecision §12.6)
- Orchestrator builds and passes `PUPPET_MASTER_ALLOWED_FILES` when constructing each ExecutionRequest

**Contract References:**
- `ContractRef: CodePath:puppet-master-rs/src/types/execution.rs, EnvVar:PUPPET_MASTER_OPERATION_TYPE, EnvVar:PUPPET_MASTER_ALLOWED_FILES`
- `Plans/FileSafe.md §11.1` (load_allowed_files_from_request spec)
- `Plans/FileSafe.md §12.6 Gap 2` (orchestrator responsibility)
- `Plans/FileSafe.md §15.9` (implementation checklist — pass allowed files via env_vars)

---

## 9. YOLO / yolo mode -- References and FileSafe Relationship

**Files and Lines:**
- `Plans/assistant-chat-design.md` lines 45, 130, 176-182, 526, 1009, 1070, 1103
- `Plans/FileSafe.md` lines 1240-1254 (section 10a: FileSafe and Assistant YOLO mode)
- `Plans/FileSafe.md` lines 2323-2326, 2672-2673

**Definition:**
- **YOLO mode** = Chat runs with **maximum permissions**; **no permission prompts**
- User accepts full automation for that session
- Agent can execute, edit, and run tools without asking for approval

**Opposite: Regular Mode**
- Agent asks for permission before executing or editing
- User can approve once (single action) or approve for session
- Does not persist across app restarts

**Relationship to FileSafe:**

1. **When YOLO is ON:**
   - No human approval step before tool execution
   - **FileSafe becomes the PRIMARY protection layer**
   - If FileSafe disabled or relaxed while YOLO on → destructive commands and out-of-scope writes can run with no gate

2. **Same FileSafe Config for Assistant:**
   - Assistant chat (YOLO runs) must use same FileSafe settings as rest of app
   - Command blocklist, Write scope, Security filter all apply
   - No separate "Assistant-only" bypass unless explicitly configured

3. **GUI Recommendations:**
   - When user enables YOLO: show hint ("FileSafe protects you when YOLO is on")
   - Show small indicator that FileSafe is active when YOLO selected
   - FileSafe toggles must be easy to find and toggle without digging

4. **Optional Per-Context Override (future):**
   - If product later allows "relax FileSafe for this chat only"
   - Must be **explicit, clearly labeled setting** — not default when YOLO on

5. **In-Chat Approval UX (when blocked):**
   - When FileSafe blocks command during YOLO:
     - Display inline card with blocked command
     - Offer approval action ("Approve once", "Approve for session")
   - Show persistent warning chip: **"[!] YOLO active -- FileSafe guards still apply"**

**Summary (per FileSafe.md §10a):**
> YOLO mode and FileSafe are complementary: YOLO removes approval prompts; FileSafe enforces hard limits (destructive commands, write scope, sensitive files). FileSafe settings must be configurable in the GUI and easy to turn on or off, and when Assistant runs in YOLO mode, FileSafe should be the main line of defense.

**Contract References:**
- `Plans/assistant-chat-design.md §3` (YOLO vs Regular permissions model)
- `Plans/FileSafe.md §10a` (FileSafe and Assistant YOLO mode)
- `Plans/FileSafe.md §15.5` (GUI warning chip for YOLO + FileSafe)
- `Plans/FinalGUISpec.md §7.16` (Assistant Chat, YOLO + FileSafe UI)

---

## 10. Assistant Chat / assistant-chat -- Design and FileSafe Relationship

**Files and Lines:**
- `Plans/assistant-chat-design.md` lines 1-100 (introduction, modes overview)
- `Plans/assistant-chat-design.md` lines 170-250 (ELI5 mode, permissions, submission modes)
- `Plans/assistant-chat-design.md` lines 526, 736, 1009, 1070 (references to FileSafe and execution)
- `Plans/FileSafe.md` lines 2323-2326, 2672-2673 (Assistant Chat and YOLO sections)

**Design: Three Major Surfaces (Alongside Interview & Orchestrator)**

1. **Assistant Chat Purpose:**
   - Flexible ask/plan/execute chat
   - Teaching and answering questions
   - Addressing dashboard warnings and Calls to Action (CtAs)
   - Continuing work after orchestrator completes
   - Handling HITL (Human-In-The-Loop) approval prompts

2. **Modes:**
   - **YOLO mode:** Maximum permissions, no approval prompts (see section 9)
   - **Regular mode:** Ask for permission before each action
   - **Plan (read-only):** Planning only, no execution
   - **ELI5 mode:** Simpler language, context simplification for explanations

3. **Message Submission:**
   - **Steer mode:** Enter submits immediately (can interrupt running task); Tab queues
   - **Queue mode:** Enter queues when task running; submit when idle
   - Max 2 queued messages (FIFO)
   - Queued messages show Edit / Send now / Cancel actions

4. **Permissions & Tool Execution:**
   - YOLO = no permission prompts; FileSafe guards are PRIMARY protection
   - Regular = ask for permission (once / for session)
   - Bash execution subject to FileSafe and permissions
   - Commands visible in thread as audit trail (collapsible)

5. **Chat Footer (bottom to top):**
   - Queued messages strip (up to 2)
   - Text entry (composer)
   - Active subagent count
   - Files touched + diff count

6. **Context & Attachments:**
   - File Manager integration (IDE-style editor, click-to-open)
   - @ Mention for file/symbol references
   - Web search attachment
   - Image attachments (all platforms accept; generation is Cursor-native or Google-key-backed)
   - LSP support for code intelligence

7. **Chat Persistence & Search:**
   - Threads persisted in seglog + projected to `.puppet-master/project/chats/`
   - Search across chat history (Tantivy integration)
   - Thread state: queue, active subagents, files touched

**FileSafe Integration with Assistant Chat:**

1. **Guards Apply to All Executions:**
   - Command blocklist blocks destructive CLI commands in assistant chat
   - Write scope restricts writes to plan-declared files
   - Security filter blocks sensitive file access
   - Same guards as orchestrator runs

2. **YOLO + FileSafe:**
   - When YOLO on, FileSafe is the **primary protection** (no approval gate)
   - Show warning chip when YOLO active
   - Display inline approval card if FileSafe blocks command

3. **Permissions Model:**
   - Regular mode: ask for permission before tool execution
   - Can approve once or for entire session
   - FileSafe violations always block (no approval override)

4. **Bash & Command Execution:**
   - Bash available in non-read-only modes (Plan execution, Agent mode)
   - Every command entered and output visible in thread as audit trail
   - Commands subject to FileSafe guards before execution
   - Execution subject to permissions (YOLO vs Regular)

**Key Features Tying to Execution & FileSafe:**
- **Steer & Queue:** Control when messages are sent (immediate vs buffered)
- **Permissions:** YOLO (no ask) vs Regular (ask per action) vs Plan (read-only)
- **Guards:** FileSafe (same across all execution surfaces)
- **Audit:** All commands, outputs, and file changes visible in thread
- **Approval UX:** When blocked, show inline card with approval action

**Contract References:**
- `Plans/assistant-chat-design.md` (main design document)
- `Plans/FileSafe.md §10a` (FileSafe and Assistant YOLO mode)
- `Plans/FileSafe.md §15.5 Phase 3` (GUI for YOLO + FileSafe warning)
- `Plans/FileManager.md` (File Manager integration)
- `Plans/storage-plan.md` (seglog/redb/Tantivy for persistence and search)
- `Plans/Tools.md §2.5` (central tool registry, permission model alignment)

___BEGIN___COMMAND_DONE_MARKER___0
___BEGIN___COMMAND_DONE_MARKER___0
