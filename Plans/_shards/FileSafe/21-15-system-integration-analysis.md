## 15. System Integration Analysis

### 15.1 Integration with BaseRunner

**Current Architecture:**
- `BaseRunner::execute_command()` spawns platform CLI processes
- Already has circuit breaker, quota manager, rate limiter, permission audit
- Guards fit naturally into the pre-execution check sequence

**Integration Points:**
```rust
// In BaseRunner::execute_command(), add guards BEFORE existing checks:
pub async fn execute_command(...) -> Result<ExecutionResult> {
    // 1. Circuit breaker check (existing)
    if self.circuit_breaker.is_open() { ... }
    
    // 2. QUOTA CHECK (existing)
    if let Err(e) = self.quota_manager.enforce_quota(...) { ... }
    
    // 3. RATE LIMIT (existing)
    self.rate_limiter.acquire(...).await?;
    
    // 4. NEW: FileSafe (add here)
    // Note: Prompt content is checked at platform runner level (after context compilation). Here we check only the final command string and file paths.
    // Build command string
    let full_command = format!("{} {}", self.command, args.join(" "));
    
    // Check command string (blocklist + approved whitelist)
    if let Err(e) = self.bash_guard.check_command(&full_command) {
        // Check if verification gate operation (allow destructive during QA)
        if self.is_verification_gate_operation(&request) {
            warn!("Destructive command allowed during verification gate: {}", e);
        } else {
            return Err(anyhow!("Destructive command blocked: {}", e));
        }
    }
    
    // Check file writes (if write scope enabled)
    // Extract file paths from prompt or context files
    let allowed_files = FileGuard::load_allowed_files_from_request(&request)?;
    for file_path in self.extract_file_paths_from_request(&request)? {
        // Resolve path relative to working directory
        let resolved_path = if file_path.is_absolute() {
            file_path
        } else {
            request.working_directory.join(&file_path)
        };
        
        // Normalize path (handle worktree symlinks, .., etc.)
        let normalized_path = resolved_path.canonicalize()
            .unwrap_or_else(|_| resolved_path);
        
        if let Err(e) = self.file_guard.check_file_write(&normalized_path, &request.working_directory, &allowed_files) {
            return Err(anyhow!("File write blocked: {}", e));
        }
        if let Err(e) = self.security_filter.check_file_access(&normalized_path) {
            return Err(anyhow!("Sensitive file access blocked: {}", e));
        }
    }
    
    // 5. PERMISSION AUDIT (existing)
    if let Some(ref audit) = self.permission_audit { ... }
    
    // 6. Continue with spawn logic...
}
```

**Key Integration Details:**
- Guards are initialized in `BaseRunner::new()` alongside other components
- All guards use `Arc<>` for thread-safe sharing
- Guard errors are logged via existing logging infrastructure
- Guard violations are logged to event log (if available) or filesafe-events.jsonl

### 15.2 Integration with Orchestrator

**Current Architecture:**
- Orchestrator calls `BaseRunner::execute_command()` for each iteration
- Verification gates run AFTER iteration completion
- Gates check evidence, tests, acceptance criteria

**Integration Points:**

1. **Verification Gate Detection:**
    - Need to tag `ExecutionRequest` when it's a verification gate operation
    - AutoDecision: use `ExecutionRequest.env_vars["PUPPET_MASTER_OPERATION_TYPE"] = "verification_gate"` (no `tags` field)
    - Orchestrator sets this env var when calling runner for gate verification

```rust
// In orchestrator.rs, when running verification gate:
let mut request = ExecutionRequest::new(...);
request = request.with_env("PUPPET_MASTER_OPERATION_TYPE", "verification_gate");
```

2. **Gate Operation Detection:**
```rust
impl BaseRunner {
    // DRY:FN:is_verification_gate_operation — Check if request is a verification gate operation
    /// Check if this is a verification gate operation
    ///
    /// Verification gates may legitimately need destructive commands:
    /// - QA operations may reset test databases (`migrate:fresh`)
    /// - Security audits may need to read sensitive files
    /// - Performance tests may need to drop caches
    ///
    /// Returns true if request is tagged as verification gate operation.
    fn is_verification_gate_operation(&self, request: &ExecutionRequest) -> bool {
        // Check env var tag
        request.env_vars.get("PUPPET_MASTER_OPERATION_TYPE")
            .map(|v| v == "verification_gate")
            .unwrap_or(false)
    }
    
    // DRY:FN:is_interview_operation — Check if request is an interview operation
    /// Check if this is an interview operation
    ///
    /// Interview operations may need relaxed security:
    /// - Research may need to read `.env` to understand config
    /// - Architecture phase may analyze sensitive file structures
    ///
    /// Returns true if request is tagged as interview operation.
    fn is_interview_operation(&self, request: &ExecutionRequest) -> bool {
        request.env_vars.get("PUPPET_MASTER_OPERATION_TYPE")
            .map(|v| v == "interview")
            .unwrap_or(false)
    }
    
    // DRY:FN:extract_file_paths_from_request — Extract file paths from ExecutionRequest
    /// Extract file paths that might be written from ExecutionRequest
    ///
    /// Looks for:
    /// 1. File paths mentioned in prompt (e.g., "create src/auth.rs", "write to config.yaml")
    /// 2. Context files (already allowed, but check for security filter)
    /// 3. Files mentioned in extra_args
    /// 4. Common file operation patterns in prompt text
    ///
    /// Returns vector of potential file paths to check.
    fn extract_file_paths_from_request(&self, request: &ExecutionRequest) -> Result<Vec<PathBuf>> {
        use regex::Regex;
        let mut paths = Vec::new();
        
        // 1. Add context files (agents may read/write these)
        paths.extend(request.context_files.iter().cloned());
        
        // 2. Extract file paths from prompt text
        // Patterns: "create FILE", "write to FILE", "edit FILE", "FILE:", etc.
        let file_patterns = vec![
            r"(?i)(?:create|write|edit|update|modify|save|add)\s+(?:to\s+)?([^\s]+\.(?:rs|ts|js|py|go|java|cs|php|rb|md|yaml|yml|json|toml|txt|sql|sh|bash))",
            r"(?i)(?:file|path|location)[:\s]+([^\s]+\.(?:rs|ts|js|py|go|java|cs|php|rb|md|yaml|yml|json|toml|txt|sql|sh|bash))",
            r"`([^\s`]+\.(?:rs|ts|js|py|go|java|cs|php|rb|md|yaml|yml|json|toml|txt|sql|sh|bash))`",
            r#"["']([^\s"']+\.(?:rs|ts|js|py|go|java|cs|php|rb|md|yaml|yml|json|toml|txt|sql|sh|bash))["']"#,
        ];
        
        for pattern_str in file_patterns {
            if let Ok(pattern_re) = Regex::new(pattern_str) {
                for cap in pattern_re.captures_iter(&request.prompt) {
                    let file_str = &cap[1];
                    // Skip URLs and absolute paths that are clearly not file operations
                    if !file_str.starts_with("http://") && !file_str.starts_with("https://") {
                        paths.push(PathBuf::from(file_str));
                    }
                }
            }
        }
        
        // 3. Extract from extra_args (may contain file paths)
        for arg in &request.extra_args {
            // Check if arg looks like a file path
            if arg.contains('/') || arg.contains('\\') || arg.ends_with(".rs") || arg.ends_with(".ts") {
                paths.push(PathBuf::from(arg));
            }
        }
        
        // Deduplicate
        paths.sort();
        paths.dedup();
        
        Ok(paths)
    }
}
```

3. **Write-scope plan integration:**
   - Write scope needs access to current task/subtask plan to know allowed files
   - Orchestrator should pass plan metadata to `ExecutionRequest`
   - AutoDecision: do not add an `allowed_files` field; pass allowed files via `ExecutionRequest.env_vars["PUPPET_MASTER_ALLOWED_FILES"]`

```rust
// In orchestrator.rs, when building ExecutionRequest:
let mut request = ExecutionRequest::new(...);
if let Some(allowed_files) = get_allowed_files_for_current_subtask(&tier_state) {
    // Pass to write scope via request metadata
    request = request.with_env("PUPPET_MASTER_ALLOWED_FILES", 
        serde_json::to_string(&allowed_files).unwrap_or_default());
}
```

### 15.3 Integration with Interview Flow

**Current Architecture:**
- Interview orchestrator spawns agents for research, validation, document generation
- Uses same `BaseRunner` infrastructure
- No special FileSafe considerations currently

**Integration Points:**

1. **Interview-Specific Guards:**
   - Research operations may need to read sensitive files (e.g., `.env` for understanding config)
   - Security filter should be more permissive during interview phases
   - Add interview phase detection:

```rust
impl BaseRunner {
    fn is_interview_operation(&self, request: &ExecutionRequest) -> bool {
        request.env_vars.get("PUPPET_MASTER_OPERATION_TYPE")
            .map(|v| v.starts_with("interview_"))
            .unwrap_or(false)
    }
}
```

2. **Interview Config:**
   - Add FileSafe settings to `InterviewGuiConfig`:
   ```rust
   pub struct InterviewGuiConfig {
       // ... existing fields ...
       pub filesafe: InterviewFileSafeConfig,
   }
   
   pub struct InterviewFileSafeConfig {
       pub allow_sensitive_file_read: bool,  // Default: true for research
       pub strict_file_guard: bool,          // Default: false (no plan yet)
   }
   ```

### 15.4 Integration with Worktrees

**Current Architecture:**
- Worktrees are created per subtask for parallel execution
- `BaseRunner` receives `working_directory` which may be a worktree path
- Guards must operate in the correct working directory context

**Integration Points:**

1. **Worktree-aware write scope:**
   - File paths in plans are relative to project root
   - Guards must resolve paths relative to `working_directory` (which may be a worktree)
   - Write-scope checks must account for worktree structure

```rust
impl FileGuard {
    pub fn check_file_write(&self, file_path: &Path, working_dir: &Path, allowed_files: &HashSet<PathBuf>) -> Result<(), GuardError> {
        // Resolve path relative to working directory
        let resolved_path = if file_path.is_absolute() {
            file_path.to_path_buf()
        } else {
            working_dir.join(file_path)
        };
        
        // Normalize path (handle worktree symlinks)
        let normalized = resolved_path.canonicalize()
            .unwrap_or_else(|_| resolved_path);
        
        // Check against allowed files (also normalized)
        // AutoDecision: match only against `allowed_files` computed from request metadata; FileGuard does not store request-scoped allowlists.
        // ...
    }
}
```

2. **Worktree Cleanup Coordination:**
   - Write-scope violations should not prevent worktree cleanup
   - MiscPlan cleanup should respect write-scope allowed files (don't delete allowed files)
   - Coordinate with `cleanup_after_execution` in runner contract

### 15.5 GUI Integration

**Authority:** **Plans/FinalGUISpec.md §7.4 (Advanced tab)** and **§7.16 (Assistant Chat)** are the canonical GUI spec. This section aligns FileSafe.md with that spec.

**Current Architecture:**
- Config view has 8 tabs: Tiers, Branching, Verification, Memory, Budgets, Advanced, Interview, YAML
- Settings are stored in `GuiConfig` and saved to YAML
- Config is loaded by orchestrator via `ConfigManager`

**Required GUI Placement (FinalGUISpec §7.4):**
- FileSafe is **not** a separate tab. It lives under **Settings > Advanced** as a **collapsible card** titled **"FileSafe Guards"**.
- Same Advanced tab contains MCP Configuration, Tool permissions, and Other (experimental, cleanup, etc.). FileSafe is one collapsible card among these.

**1. FileSafe collapsible card (Advanced tab)**

- **Three independent toggles** (product labels; internal keys remain `bash_guard` / `file_guard` / `security_filter`):
  - **"Block destructive commands"** (on/off) -- Command blocklist; when off, destructive CLI commands are not blocked.
  - **"Restrict writes to plan"** (on/off) -- Write scope; when off, writes are not restricted to plan-declared files.
  - **"Block sensitive files"** (on/off) -- Security filter; when off, access to `.env`/credentials is not blocked.
- **Override:** "Allow destructive commands" toggle with **prominent warning styling** (e.g. danger/warning variant per widget catalog).
- **Approved commands:** Scrollable list; per-row **Remove** button; optional **"Add command manually"**; persisted in `filesafe.approvedCommands` (e.g. `puppet-master.yaml`).
- **Optional:** Custom pattern path, "Allow sensitive files during interview" (Security filter), pattern management (view/edit), **Event log viewer** (browse recent blocked commands; link to FileSafe event log).
- **Widget reuse:** Use existing widgets from `src/widgets/` per DRY Method (e.g. `toggler`, `help_tooltip(tooltip_key, tooltip_variant, theme, scaled)`, `styled_button`). See `docs/gui-widget-catalog.md`. **Tooltip keys** (for localization and help system): `filesafe.bash_guard`, `filesafe.file_guard`, `filesafe.security_filter` (three toggles); optionally `filesafe.override`, `filesafe.approved_commands` for override toggle and approved list. Document in widget catalog or central tooltip doc.

**Config struct (unchanged):** `GuiConfig.filesafe: FileSafeConfig` with `BashGuardConfig`, `FileGuardConfig`, `SecurityFilterConfig`, `approved_commands: Vec<String>` as in §2.4 and §5.2.

**2. Assistant Chat and YOLO (FinalGUISpec §7.16)**

- **YOLO + FileSafe:** When YOLO is enabled and FileSafe guards are active, show a **persistent warning chip** in the input toolbar: **"[!] YOLO active -- FileSafe guards still apply."**
- **In-chat approval when blocked:** When FileSafe blocks a command during YOLO (or when a blocked command is shown in chat), display an **inline card** in the chat stream:
  - **Style:** Orange left border; command text in monospace; guard name that triggered (e.g. "Command blocklist").
  - **Actions:** **"Approve once"** (runs the command this time only) and **"Approve & add to list"** (adds to `filesafe.approvedCommands` in Settings > Advanced).
  - **Timeout:** Card auto-dismisses after **60 seconds** with message "Timed out -- command skipped."
  - **Logging:** Blocked commands are logged to the FileSafe event log; accessible from Settings > Advanced (event log viewer or link).
- **Terminal (FinalGUISpec §7.16):** When a command is blocked by FileSafe, terminal output uses **RED** with prefix **"[BLOCKED] Blocked by FileSafe"**.

**3. Dashboard / status (FinalGUISpec §7.2)**

- **FileSafe status (optional):** Compact card showing guard count (e.g. "FileSafe: 3/3 guards active") with link to **Settings > Advanced > FileSafe**.

**4. Message enum and update flow**

- Add FileSafe-related messages (e.g. `FileSafeBashGuardToggled(bool)`, `FileSafeAllowDestructiveToggled(bool)`, `FileSafeFileGuardToggled(bool)`, `FileSafeFileGuardStrictToggled(bool)`, `FileSafeSecurityFilterToggled(bool)`, `FileSafeAllowSensitiveDuringInterviewToggled(bool)`, `FileSafeRemoveApprovedCommand(usize)`, `FileSafeAddApprovedCommandClicked`, `FileSafeAddApprovedCommand(String)`, `FileSafeViewEventLog`).
- Config save: FileSafe changes persist with the rest of Advanced tab (Save Changes per tab or global).

**5. Config Wiring (Critical):**
- FileSafe config must be wired to `PuppetMasterConfig` (orchestrator config).
- Follow Option B pattern from `Plans/WorktreeGitImprovement.md` §5.2 (Chosen approach: Option B -- Build run config from GUI): build run config from GUI config at orchestrator start.
- Ensure FileSafe settings (and `approved_commands`) are available to `BaseRunner` initialization so the command blocklist whitelist is applied at runtime.

### 15.6 Integration with Verification Gates

**Current Architecture:**
- Verification gates run AFTER iteration completion
- Gates check evidence, run tests, verify acceptance criteria
- Gate operations may legitimately need destructive commands (e.g., test database resets)

**Integration Points:**

1. **Gate Operation Tagging:**
   - When orchestrator calls `run_verification_gate()`, tag the operation
   - Pass tag to `BaseRunner` via `ExecutionRequest`
   - Guards check tag before blocking

2. **Gate-Specific Allowances:**
   - QA operations may need `migrate:fresh` for test database setup
   - Security audits may need to read `.env` files
   - Add gate-specific override list:

```rust
pub struct FileSafeConfig {
    // ... existing fields ...
    pub gate_overrides: GateOverrideConfig,
}

pub struct GateOverrideConfig {
    pub allow_destructive_during_qa: bool,      // Default: true
    pub allow_sensitive_during_security_audit: bool,  // Default: true
}
```

3. **Gate Evidence Integration:**
   - Blocked commands should be logged as gate evidence
   - Add to `GateReport` if guard blocks occur during gate execution
   - Helps track FileSafe violations during verification

### 15.7 Integration with State Management

**Current Architecture:**
- State is managed via `prd.json`, `progress.txt`, `AGENTS.md`
- Orchestrator tracks tier state, iterations, gate results
- State persists across sessions

**Integration Points:**

1. **FileSafe event state:**
   - FileSafe events are logged to `.puppet-master/logs/filesafe-events.jsonl`
   - Should be included in state snapshots for debugging
   - Consider adding to `prd.json` metadata or separate FileSafe state file

2. **Guard Configuration State:**
   - Guard config is part of `GuiConfig` → `puppet-master.yaml`
   - Must persist across sessions
   - Default values should be safe (guards enabled by default)

3. **Plan metadata for write scope:**
   - Write scope needs current plan's allowed files list
   - Plan metadata should be accessible to `BaseRunner`
   - Consider adding to `ExecutionRequest` or passing via context

### 15.8 Integration with Cleanup (MiscPlan)

**Current Architecture:**
- Cleanup runs `prepare_working_directory` and `cleanup_after_execution`
- Uses git clean with allowlist
- Write scope should coordinate with cleanup

**Integration Points:**

1. **Cleanup vs write scope:**
   - Cleanup removes untracked files (except allowlist)
   - Write scope blocks writes to files not in plan
   - These are complementary but need coordination:
     - Write scope blocks DURING execution
     - Cleanup removes files AFTER execution
     - Write-scope allowed files should be in cleanup allowlist

2. **Security Filter vs Cleanup:**
   - Cleanup should NEVER delete sensitive files (even if untracked)
   - Security filter patterns should be added to cleanup allowlist
   - Prevents accidental deletion of credentials

### 15.9 Gaps Identified

#### Gap 1: ExecutionRequest Metadata
**Issue:** No way to tag operations as verification gates, interview phases, etc.
**Impact:** Guards can't distinguish legitimate destructive operations
**Fix:** AutoDecision: use `ExecutionRequest.env_vars["PUPPET_MASTER_OPERATION_TYPE"]` (fixed values: `normal`, `verification_gate`, `interview`). (ContractRef: EnvVar:PUPPET_MASTER_OPERATION_TYPE)

#### Gap 2: Plan Metadata Access
**Issue:** Write scope needs current plan's allowed files list, but plans aren't accessible to `BaseRunner`
**Impact:** Write scope can't enforce plan boundaries
**Fix:** Pass plan metadata via `ExecutionRequest` or context files

#### Gap 3: Config Wiring
**Issue:** FileSafe config in GUI may not be wired to orchestrator config (same issue as WorktreeGitImprovement)
**Impact:** FileSafe settings from GUI won't be applied at runtime
**Fix:** Implement Option B config wiring (build run config from GUI at orchestrator start)

#### Gap 4: Worktree Path Resolution
**Issue:** Write scope needs to resolve relative paths correctly in worktree context
**Impact:** Write scope may block legitimate operations or allow blocked operations
**Fix:** Normalize paths relative to `working_directory`, handle worktree symlinks

#### Gap 5: Interview Phase Detection
**Issue:** No way to detect interview operations for relaxed security filter
**Impact:** Security filter may block legitimate research operations
**Fix:** Tag interview operations in `ExecutionRequest`, check tag in guards

#### Gap 6: Event Log Integration
**Issue:** FileSafe events logged separately from other events
**Impact:** Difficult to correlate FileSafe violations with execution context
**Fix:** Integrate with existing event logging system or add FileSafe events to gate reports

### 15.10 Potential Issues

#### Issue 1: False Positives in Documentation
**Problem:** Agents may include destructive commands in documentation or comments
**Risk:** Guards block legitimate documentation work
**Mitigation:** 
- Check prompt context (code block vs markdown)
- Allow override via environment variable
- Log all blocks for review and pattern refinement

#### Issue 2: Performance Impact
**Problem:** Pattern matching on every command adds latency
**Risk:** Slows down iteration execution
**Mitigation:**
- Compile regex patterns once at initialization
- Use efficient regex engine (Rust's `regex` crate)
- Benchmark and optimize hot paths
- Consider async guard checks if needed

#### Issue 3: Plan File List Completeness
**Problem:** Plans may not list all files that need to be written
**Risk:** Write scope too restrictive, blocks legitimate operations
**Mitigation:**
- Support wildcard patterns in plan file lists
- Allow directory-level permissions
- Provide clear error messages with override instructions
- Warn-only mode option (log but don't block)

#### Issue 4: Multi-Platform Prompt Parsing
**Problem:** Different platforms format prompts differently
**Risk:** Prompt content checking misses destructive commands
**Mitigation:**
- Platform-specific prompt parsers
- Fallback to simple pattern matching
- Test with all 5 platforms
- Document platform-specific behavior

#### Issue 5: Guard Initialization Failure
**Problem:** If guard initialization fails, execution may be blocked entirely
**Risk:** System unusable if pattern file corrupted or missing
**Mitigation:**
- Graceful degradation: disable guard on init failure, log warning
- Provide `BashGuard::disabled()` fallback
- Doctor check validates guard initialization

### 15.11 Enhancements for Existing Systems

#### Enhancement 1: Doctor check for FileSafe
**Add to `src/doctor/checks/`:**
```rust
// DRY:FN:check_filesafe — Verify FileSafe guards are initialized correctly
pub fn check_filesafe() -> DoctorCheck {
    // Check pattern file exists and is readable
    // Check patterns compile as valid regex
    // Check guards initialize without errors
    // Check config is valid
}
```

#### Enhancement 2: FileSafe events in gate reports
**Enhance `GateReport` to include FileSafe violations:**
```rust
pub struct GateReport {
    // ... existing fields ...
    pub filesafe_violations: Vec<FileSafeViolation>,  // New field
}

pub struct FileSafeViolation {
    pub guard_type: String,  // "bash_guard", "file_guard", "security_filter"
    pub violation_type: String,  // "destructive_command", "file_not_in_plan", etc.
    pub details: String,
    pub timestamp: DateTime<Utc>,
    pub allowed: bool,  // Was override applied?
}
```

#### Enhancement 3: FileSafe metrics dashboard
**Add to GUI status/overview:**
- Count of blocked commands (total, by guard type)
- Most common violations
- Override usage statistics
- FileSafe event timeline

#### Enhancement 4: Plan File List Validation
**Enhance plan generation to include file lists:**
- Interview/planning phases should generate file lists for write scope
- Validate file lists are complete before execution
- Doctor check validates plan file lists

#### Enhancement 5: Guard Configuration Profiles
**Allow different guard strictness per tier:**
```rust
pub struct TierFileSafeConfig {
    pub phase: FileSafeConfig,
    pub task: FileSafeConfig,
    pub subtask: FileSafeConfig,
    pub iteration: FileSafeConfig,
}
```
- Phase/Task tiers: stricter guards (planning phase)
- Subtask/Iteration tiers: more permissive (execution phase)

### 15.12 Integration Checklist

Resolve **§12.6 Implementation-Ready Clarifications** before or during implementation (ExecutionRequest convention, get_allowed_files_for_current_subtask, BaseRunner/BashGuard config, SecurityFilter/FileGuard fields, edge cases).

- [ ] **ExecutionRequest Updates**
  - [ ] Use `env_vars` for operation metadata (`PUPPET_MASTER_OPERATION_TYPE`) and write scope (`PUPPET_MASTER_ALLOWED_FILES`); do not add new fields
  - [ ] Update all `ExecutionRequest::new()` call sites

- [ ] **BaseRunner Integration**
  - [ ] Add guard fields to `BaseRunner` struct
  - [ ] Initialize guards in `BaseRunner::new()`
  - [ ] Add guard checks in `execute_command()` before spawn
  - [ ] Add `is_verification_gate_operation()` helper
  - [ ] Add `is_interview_operation()` helper
  - [ ] Add `extract_file_paths_from_request()` helper

- [ ] **Orchestrator Integration**
  - [ ] Tag verification gate operations in `ExecutionRequest`
  - [ ] Pass plan metadata (allowed files) to `ExecutionRequest`
  - [ ] Integrate FileSafe violations into gate reports
  - [ ] Update gate execution to handle guard overrides

- [ ] **Interview Integration**
  - [ ] Tag interview operations in `ExecutionRequest`
  - [ ] Add FileSafe config to `InterviewGuiConfig`
  - [ ] Relax security filter during interview phases (if configured)

- [ ] **Worktree Integration**
  - [ ] Update write scope to handle worktree paths correctly
  - [ ] Normalize paths relative to `working_directory`
  - [ ] Handle worktree symlinks in path resolution

- [ ] **GUI Integration**
  - [ ] Add `FileSafeConfig` to `GuiConfig`
  - [ ] Add FileSafe tab to Config view (or add to Advanced tab)
  - [ ] Add FileSafe-related messages to `Message` enum
  - [ ] Wire FileSafe config to orchestrator config (Option B)
  - [ ] Add FileSafe event log viewer (optional)

- [ ] **Config Wiring**
  - [ ] Wire `GuiConfig::filesafe` to `PuppetMasterConfig` (orchestrator config)
  - [ ] Ensure FileSafe settings available to `BaseRunner` initialization
  - [ ] Test config persistence across sessions

- [ ] **Cleanup Integration**
  - [ ] Add security filter patterns to cleanup allowlist
  - [ ] Coordinate write-scope allowed files with cleanup allowlist
  - [ ] Ensure cleanup never deletes sensitive files

- [ ] **State Management**
  - [ ] Include FileSafe events in state snapshots
  - [ ] Persist guard configuration in config file
  - [ ] Add FileSafe state to `prd.json` metadata (optional)

- [ ] **Testing Integration**
  - [ ] Test guards with verification gate operations
  - [ ] Test guards with interview operations
  - [ ] Test guards with worktree execution
  - [ ] Test guards with cleanup operations
  - [ ] Test config wiring end-to-end

---

