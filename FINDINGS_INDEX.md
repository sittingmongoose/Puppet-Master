# Quick Index: Puppet Master Concepts Report

**Full Report Location:** `/home/sittingmongoose/Cursor/Puppet Master/FINDINGS_REPORT.md`

## Summary of Findings

### 1. **BaseRunner** (Lines 591-637 in FileSafe.md)
- **Role:** Low-level CLI executor in `puppet-master-rs/src/platforms/runner.rs`
- **Fields:** `bash_guard`, `file_guard`, `security_filter` (all Arc-wrapped)
- **Execution Flow:** Checks → Quota/RateLimit → FileSafe Guards → Permission Audits → Spawn
- **Key Methods:** `new()` (with pattern file resolution), `execute_command()` (with guard checks)

---

### 2. **ExecutionRequest** (Lines 127-130, 1097-1105)
- **Key Fields:** `prompt`, `env_vars` (containing PUPPET_MASTER_* vars), `context_files`, `working_directory`, `plan_mode`
- **Created By:** Orchestrator (`puppet-master-rs/src/core/orchestrator.rs`)
- **Per-Tier:** Phase, Task, Subtask, Iteration levels
- **Key env_vars:**
  - `PUPPET_MASTER_OPERATION_TYPE`: `normal` | `verification_gate` | `interview`
  - `PUPPET_MASTER_ALLOWED_FILES`: JSON array of allowed file paths

---

### 3. **Orchestrator** (orchestrator-subagent-integration.md §63-207, FileSafe.md §116-130)
- **Central Role:** Builds ExecutionRequest, manages tier context, interfaces with platform runners
- **Key Functions:**
  - `execute_tier_with_subagents()` — executes with subagent personas
  - `get_allowed_files_for_current_subtask()` — derives write scope
  - `validate_config_wiring_for_tier()` — validates config wiring
  - `build_execution_config()` — merges run/tier/default configs
- **Interacts With:** Tier configs, plan metadata, worktree manager, platform runners
- **Passes Down:** plan_mode, allowed_files (via env_vars), operation_type, working_directory

---

### 4. **Worktree** (WorktreeGitImprovement.md §2-5, storage-plan.md §213, 352, 355)
- **Creation:** Path `.puppet-master/worktrees/<tier_id>`, branch `subtask/<subtask_id>`
- **Triggering:** When `enable_parallel_execution` is true
- **State:** In-memory (lost on restart) — GAP: must repopulate on init
- **Cleanup:** Removed on merge/completion
- **Persistence:** `redb` key `orchestrator.receipt.{run_id}.{attempt_id}` includes `worktree_id?`
- **Lane Pools/Concurrency:**
  - Scheduler lanes: `remediation > unblocker > normal`
  - Concurrency limits: global per-provider + orchestrator-context overrides
  - Parallel subtasks: topological sort of `depends_on` graph

---

### 5. **FileGuard / file_guard** (FileSafe.md §11.1, lines 1266-1355)
- **Purpose:** Write scope enforcement — blocks writes outside plan-declared files
- **Struct:** `FileGuard { enabled: bool }`
- **Key Methods:**
  - `check_file_write(file_path, working_directory, allowed_files)` — allow/deny decision
  - `load_allowed_files_from_request(request)` — loads from env_vars + context_files
- **Allowed Sources:**
  1. `PUPPET_MASTER_ALLOWED_FILES` env var (JSON)
  2. `request.context_files` (implicitly allowed)
  3. Plan metadata (if in context)
- **Check Logic:** Exact match → relative path → parent directory → block (fail closed)
- **Config:** `filesafe.file_guard { enabled, strict_mode }`
- **GUI Label:** "Write scope"

---

### 6. **Verification Gate** (FileSafe.md §10a, lines 1602-1621, 1715)
- **Definition:** Special mode allowing destructive operations during QA/testing
- **Detection:** `PUPPET_MASTER_OPERATION_TYPE == "verification_gate" || "interview"`
- **Behavior:** Loosens guards (command blocklist + write scope) but NOT security filter
- **Implementation:** `is_verification_gate_operation()` helper checks env_var before guard blocks
- **Guard Behavior:** When verified, logs warning and allows (instead of blocking)

---

### 7. **PUPPET_MASTER_OPERATION_TYPE** (FileSafe.md §1721, multiple usages)
- **Fixed Values:** `"normal"` (default), `"verification_gate"`, `"interview"`
- **Carrier:** `ExecutionRequest.env_vars["PUPPET_MASTER_OPERATION_TYPE"]`
- **Set By:** Orchestrator when building requests for special tiers
- **Read By:** BaseRunner, platform runners (check before guard blocks)
- **Used For:** Deciding whether to loosen/enforce guards

---

### 8. **PUPPET_MASTER_ALLOWED_FILES** (FileSafe.md §1326-1354, §12.6)
- **Format:** JSON array of repo-relative paths + explicit directories
- **Carrier:** `ExecutionRequest.env_vars["PUPPET_MASTER_ALLOWED_FILES"]`
- **Derived By:** Orchestrator function `get_allowed_files_for_current_subtask()`
- **Sources:** Current subtask's declared file list (primary), context files (implicit)
- **Loaded By:** `FileGuard::load_allowed_files_from_request()` in BaseRunner
- **Fallback:** If missing/empty + `file_guard.enabled` → treat as empty allowlist (fail closed)

---

### 9. **YOLO / yolo mode** (assistant-chat-design.md §3, 45, 176-182, 526)
- **Definition:** Chat runs with maximum permissions; no approval prompts
- **Opposite:** Regular mode (asks for permission); Plan mode (read-only)
- **FileSafe Relationship:** When YOLO ON → FileSafe is PRIMARY protection (no approval gate)
- **GUI Recommendations:**
  - Show hint: "FileSafe protects you when YOLO is on"
  - Show warning chip: "[!] YOLO active -- FileSafe guards still apply"
  - FileSafe toggles must be easily accessible
- **Same Config:** Assistant YOLO must use same FileSafe settings as rest of app
- **In-Chat Approval:** If FileSafe blocks → show inline card with approval action

---

### 10. **Assistant Chat / assistant-chat** (assistant-chat-design.md lines 1-100, 170-250)
- **Purpose:** Flexible ask/plan/execute chat; teaching; addressing dashboard CTAs; post-orchestrator work
- **Three Surfaces:** Alongside Interview + Orchestrator
- **Modes:** YOLO (no prompts), Regular (ask), Plan (read-only), ELI5 (simplified)
- **Message Submission:** Steer (enter=now, tab=queue) or Queue (enter=queue when busy)
- **Queued Messages:** Max 2 (FIFO), show Edit/Send now/Cancel per message
- **Chat Footer (top to bottom):**
  1. Queued messages strip
  2. Text entry (composer)
  3. Active subagent count
  4. Files touched + diff count
- **FileSafe Integration:**
  - Same guards as orchestrator (command blocklist, write scope, security filter)
  - YOLO + FileSafe: warning chip + inline approval card on block
  - All commands visible in thread as audit trail
  - Bash available in non-read-only modes

---

## Key Contracts & Code Paths

| Concept | Contract Ref | Code Path |
|---------|--------------|-----------|
| BaseRunner | `puppet-master-rs/src/platforms/runner.rs#BaseRunner::execute_command` | FileSafe.md:91-100, 591-637 |
| ExecutionRequest | `puppet-master-rs/src/types/execution.rs` | FileSafe.md:1097-1105, orchestrator-subagent-integration.md:1372, 1467 |
| Orchestrator | `puppet-master-rs/src/core/orchestrator.rs` | orchestrator-subagent-integration.md:63-207 |
| FileGuard | `EnvVar:PUPPET_MASTER_ALLOWED_FILES` | FileSafe.md:1266-1355 |
| Verification Gate | `EnvVar:PUPPET_MASTER_OPERATION_TYPE` | FileSafe.md:1602-1621, 1715 |
| Operation Type | Values: normal, verification_gate, interview | FileSafe.md:1721 |
| Worktrees | `redb` key: `orchestrator.receipt.{run_id}.{attempt_id}` | WorktreeGitImprovement.md:2-280 |

---

## Key Gaps & Implementation Notes

1. **Config Wiring (WorktreeGitImprovement.md:62, 222-223)**
   - GUI `enable_parallel_execution` NOT wired to orchestrator config
   - **Fix:** Build orchestrator config from `gui_config` at run start (Option B)

2. **Active Worktrees on Restart (WorktreeGitImprovement.md:88-94)**
   - In-memory tracking lost on restart
   - **Fix:** Repopulate from `worktree_manager.list_worktrees()` on orchestrator init

3. **Allowed Files Derivation (FileSafe.md:§12.6 Gap 2)**
   - Write scope needs current plan's allowed files
   - **Owner:** Orchestrator builds `PUPPET_MASTER_ALLOWED_FILES` when constructing ExecutionRequest
   - **Source:** `get_allowed_files_for_current_subtask()` function

4. **Verification Gate Implementation (FileSafe.md:1145, 1152, 1155)**
   - Implement `is_verification_gate_operation()` helper in BaseRunner
   - Check env_var before guard blocks

