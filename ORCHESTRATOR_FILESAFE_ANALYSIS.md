tory
   - Restore-before-rerun required when policy says rollback needed before rerun
   - Segment log (seglog) + redb persistence for replay and recovery
   - **FileSafe implication:** If FileSafe block occurs after mutation, `requires_safe_point_restore = true` must be set. Rerun requires safe-point restore, not fresh attempt.
5. **Package-based worktree lane pools**
   - Worktrees created per tier in `.puppet-master/worktrees/<tier_id>/`
   - Implicit lanes from parallelization; worktrees are execution contexts for tiers
   - **FileSafe implication:** File guard must resolve paths correctly in worktree contexts. Worktree state is part of "preserved_local_work."
6. **Automation-first default, optional HITL**
   - Autonomous runs proceed without human approvals
   - HITL is opt-in per tier boundary (phase/task/subtask toggles)
   - **FileSafe implication:** FileSafe is always on (guards are deterministic, not optional). HITL approval can happen in parallel with FileSafe block approval.
7. **Multi-project, multi-account, effective account switching**
   - Account registry per platform; active index per platform
   - Auto-rotation on rate limit; pick-best by usage
   - Effective account different from requested when fallback occurs
   - **FileSafe implication:** Account fallback env-vars must be transparent to FileSafe. FileSafe checks final spawned command post-account-resolution.
---
### B. Integration Requirements for FileSafe Sections 14-17
#### **Section 14 (Context Compilation & Token Efficiency)** — No Breaking Changes
FileSafe context compilation (§14) is orthogonal to blocked-outcome model and requires no changes to orchestrator. However:
- **Config wiring (Option B):** Context compiler config (enable/disable, delta_context, cache settings) must be merged at run start alongside FileSafe config. Ensure `context.compiler_enabled` and `filesafe.enabled` are both in merged config snapshot.
- **Prompt checking (§11.3):** After prompt assembly (including context compilation), check prompt for destructive commands before sending to platform. Compiled context may contain examples; ensure check_prompt runs post-compilation.
#### **Section 15 (System Integration Analysis)** — **REQUIRES CHANGES**
**Current FileSafe integration point (§15.1):**
- Guards check in `BaseRunner::execute_command()` after quota/rate-limit, before permission audit.
- File paths extracted from ExecutionRequest and context files.
- Verification gate and interview operation tagged via `PUPPET_MASTER_OPERATION_TYPE` env var.
**Required changes for orchestrator model:**
1. **Blocked outcome integration:**
   - When FileSafe blocks, emit event with `blocked_reason_code = filesafe_blocked`
   - Include `allowed_action_ids[]` if recovery is possible (e.g., `["approve_once", "approve_and_add", "cancel"]`)
   - Set `preserved_local_work = true` if any mutations occurred before block
   - Set `requires_safe_point_restore = true` if policy requires rollback before rerun
   - Example event payload:
     ```json
     {
       "event_type": "filesafe_blocked",
       "blocked_reason_code": "filesafe_blocked",
       "guard_type": "bash_guard",
       "pattern_id": "destructive-migrate-fresh",
       "command_summary": "rails db:migrate:fresh",
       "tier_id": "subtask-ST-001-001",
       "node_id": "node-42",
       "allowed_action_ids": ["approve_once", "approve_and_add", "cancel"],
       "preserved_local_work": true,
       "requires_safe_point_restore": false,
       "timestamp": "2026-03-09T14:23:45Z"
     }
     ```
2. **Orchestrator awareness:**
   - Orchestrator must treat FileSafe blocks like HITL blocks: pause the node, continue other runnable work
   - Use same scheduler logic and blocked-episode persistence (redb checkpoint)
   - On resolve (approve), emit `filesafe_resolved` event and wake scheduler
3. **Worktree path resolution (Gap 4):**
   - File guard must normalize paths relative to `working_directory` (which may be a worktree)
   - Handle symlinks: use `canonicalize()` with fallback to original path
   - Example:
     ```rust
     let resolved = if path.is_absolute() {
         path.clone()
     } else {
         working_directory.join(&path)
     };
     let normalized = resolved.canonicalize().unwrap_or(resolved);
     ```
4. **Allowed files from plan metadata (Gap 2):**
   - Orchestrator must call `get_allowed_files_for_tier(tier_id)` and pass to BaseRunner
   - Retrieve from plan graph node's scope or PRD's tier mapping
   - Example in BaseRunner init:
     ```rust
     let allowed_files = orchestrator.get_allowed_files_for_tier(&tier_id)?;
     let runner = BaseRunner::new(config)
         .with_allowed_files(allowed_files);
     ```
5. **Config wiring (Option B, matches orchestrator-subagent-integration.md):**
   - At run start, merge GUI FileSafe config + any interview/PRD overrides
   - Snapshot merged config in redb per run for audit trail
   - Pass merged `approved_commands` list to BaseRunner
   - Example merge precedence:
     ```
     Merged = {
       ...(GUI defaults),
       ...(interview output FileSafe settings),
       ...(per-tier overrides from PRD if present)
     }
     ```
#### **Section 16 (References)** — **UPDATE REQUIRED**
Add references to orchestrator integration documents:
- Plans/orchestrator-subagent-integration.md (§ Config wiring, § Execution policy notes)
- Plans/human-in-the-loop.md (§ Blocked episode semantics, safe-point interaction)
- Plans/Orchestrator_Page.md (§ Blocked/recovery state data model, CTA widget)
- Plans/Run_Graph_View.md (§ Node state colors, blocked badge, detail panel for guard context)
- Plans/Section15_MVP_Promoted_Features_Spec.md (§ Blocked outcomes first-class, restore-before-rerun)
#### **Section 17 (Implementation Order)** — **REQUIRES UPDATES**
Current Phase 1-4 order is sound, but add **dependencies and sequencing:**
**Phase 0 (Prerequisite):** 
- Wait for orchestrator-subagent-integration.md implementation to expose `get_allowed_files_for_tier()` function
- Ensure orchestrator emits `PuppetMasterEvent::ExecutionRequest` with `working_directory` field
**Phase 1 (Core guards)** — **ADD:**
- Step 8: In BaseRunner init, accept `allowed_files: Vec<PathBuf>` parameter
- Step 8b: In execute_command, resolve file paths relative to `working_directory`, not CWD; use `canonicalize()` with fallback
- Step 10: Extend `extract_file_paths_from_request` to handle worktree paths (e.g., resolve `.puppet-master/worktrees/<tier_id>` to absolute path)
- Step 12: FileSafeEvent struct must include `tier_id`, `node_id`, `allowed_action_ids[]`, `preserved_local_work`, `requires_safe_point_restore?`
**Phase 2 (Config wiring and GUI)** — **ADD:**
- Step 15: Config wiring (Option B) merges FileSafe.enabled + FileSafe.approved_commands from GUI config
- Step 16: When passing FileSafe config to BaseRunner, also pass `working_directory` from orchestrator context
- Step 17: GUI FileSafe card must show that blocks integrate with run state (e.g., "Blocks pause the node; click to approve or resolve in Orchestrator")
**Phase 3 (Assistant Chat and YOLO)** — **ADD:**
- Step 20: YOLO warning must note FileSafe guards still apply
- Step 21: In-chat approval must emit FileSafe event so orchestrator sees approval; include rationale in event
- Step 22: Terminal output must NOT be the only UI surface; also route to Orchestrator page CTA widget
**Phase 4 (Context compilation)** — **ADD:**
- Step 24: Context compiler output must be scanned by `check_prompt` after compilation (see §11.3)
**Risks and mitigations — ADD:**
- **Risk:** Config wiring (Option B) must be complete before Phase 2 is complete; otherwise approved_commands changes in GUI won't reach runtime.
- **Mitigation:** Implement orchestrator config-merge function first; test that GUI → redb → orchestrator → BaseRunner chain is working.
- **Risk:** Worktree path resolution must match worktree creation logic in WorktreeGitImprovement.md.
- **Mitigation:** Use shared helper function for path normalization (marked `DRY:FN:normalize_execution_path`).
- **Risk:** Multi-account auto-rotation must not interfere with FileSafe checks.
- **Mitigation:** Ensure FileSafe check occurs **after** multi-account resolution (after env vars are set); document this ordering in BaseRunner.
---
### C. Specific Interaction Points Between Orchestrator Changes and FileSafe
| Orchestrator Feature | FileSafe Requirement | Conflict? | Resolution |
|---|---|---|---|
| **Canonical node-graph execution** | Blocks must be node-scoped; must use canonical blocked_reason_code enum | No | Add `filesafe_blocked` code; integrate into scheduler |
| **Requested vs effective identity** | FileSafe check on final (effective) command after identity resolution | No | Ensure identity resolution happens before FileSafe check in BaseRunner |
| **Safe-point/restore policy** | FileSafe block may require restore before rerun | No | Set `requires_safe_point_restore = true` when mutation occurred before block |
| **Package-based worktree lanes** | File paths must resolve correctly in worktree contexts | **Yes** | Use `working_directory` for path resolution, not CWD |
| **Config wiring (Option B)** | FileSafe config merged at run start alongside other overrides | **Partially** | Extend merge logic to include approved_commands, toggle state |
| **Automation-first + optional HITL** | FileSafe is always on; HITL is opt-in. Both can pause simultaneously | No | Use same scheduler rule for both |
| **Multi-account auto-rotation** | Account fallback transparent to FileSafe | No | FileSafe checks post-resolution; account env-vars are implementation detail |
| **Prompt checking (§11.3)** | Prompt must be checked after context compilation + assembly | No | Call `check_prompt` as final pre-dispatch step |
| **Allowed files from plan** | File guard must know scope per tier | **Yes** | Orchestrator exposes `get_allowed_files_for_tier()` |
| **Event emission (seglog)** | FileSafe blocks, approvals, and analytics data must be replayable | No | Emit rich FileSafeEvent with all required fields |
| **Verification gate tagging** | Request must carry `PUPPET_MASTER_OPERATION_TYPE = "verification_gate"` so FileSafe allows reads | **Yes** | Orchestrator must set this env var for verification gate runs |
| **Dashboard/Orchestrator/chat attention flow** | FileSafe blocks route to CTA widget + Dashboard + Optional chat CtA | **Yes** | Extend CTA widget model to include FileSafe blocks |
---
## RECOMMENDATIONS FOR FILESAFE IMPLEMENTATION
1. **Implement Section 15 updates first:** Blocked-outcome integration is prerequisite for Phases 1-2.
2. **Coordinate with orchestrator-subagent-integration.md:** Get `get_allowed_files_for_tier()` signature and call contract before Phase 1.
3. **Use shared normalized path function:** Ensure file guard uses same logic as worktree manager for path resolution.
4. **Test config wiring (Option B) early:** Phase 2 depends on orchestrator's ability to merge and snapshot FileSafe config. Test this in isolation.
5. **Plan event schema carefully:** FileSafeEvent must carry enough structure for both analytics aggregation and UI recovery-action display.
6. **Coordinate multi-account + FileSafe semantics:** Ensure account fallback and FileSafe checks don't collide in event logs or scheduler logic.
7. **Update Section 16 references:** Add explicit cites to new orchestrator plans so future readers can trace FileSafe's integration dependencies.
ENDOFDOC
cat /tmp/orchestrator_analysis.md
                EC=$?
                echo "___BEGIN___COMMAND_DONE_MARKER___$EC"
            }
___BEGIN___COMMAND_OUTPUT_MARKER___
# Orchestrator Model Changes vs FileSafe Integration: Cross-Document Analysis

**Analysis Date:** 2026-03-09  
**Scope:** Section15_MVP_Promoted_Features_Spec.md, Orchestrator_Page.md, human-in-the-loop.md, Multi-Account.md, Run_Graph_View.md, WorktreeGitImprovement.md (lines 1-200), orchestrator-subagent-integration.md (lines 1-200)

---

## DOCUMENT SUMMARIES

### 1. Section15_MVP_Promoted_Features_Spec.md

**Brief Summary:**
Defines the canonical shell and surface model for Puppet Master's promoted feature set (MVP scope). Establishes workspace-tab-based primary UI, persistent shell surfaces, and cross-feature runtime contracts. Covers 18 promoted features including FileSafe blocking, branching, in-app project instructions, MCP support, multi-tab/window behavior, and terminal integration.

**Relevant Orchestrator Model Mentions:**
- **Requested vs effective state (§2.1):** Explicit visibility of differences between requested and effective runtime state when provider, permission, MCP, or capability evaluation changes the selected option. Applies to Persona, platform, model, MCP/tool availability, browser trust, and project-scoped overrides. **Switching projects must recalculate effective state; cached state from previous project must not remain silently authoritative.**
- **Stable identities (§2.2):** First-class stable identities for project_id, workspace_tab_id, window_id, thread_id, branch_id, automation_session_id (for ephemeral automation/browser tooling isolation).
- **Attention, blocked, and background indicators (§2.3):** Background activity from non-active projects/tabs remains visible through badges and attention surfaces. **Blocked episodes never disappear into silent state changes.** If feature opens detached window/background session, its blocked state still routes to canonical shell attention surfaces.
- **FileSafe as first-class blocked outcomes (§3.1):** FileSafe blocks are visible in thread, terminal/output surfaces, and action-needed routing. **Rerun after destructive block respects restore-before-rerun requirements.**
- **Branching and restore boundaries (§3.2):** Branching always starts from restore point or equivalent preserved state boundary. Branch creation produces new thread/session identity linked to source branch and restore point. Source thread remains intact with visible branch labels and origin time.

**Conflicts/Changes Needed for FileSafe Sections 14-17:**
- **Section 15 (System Integration):** Must extend blocked-outcome model to include FileSafe in the canonical action-needed routing (alongside HITL, rate limits, warnings). FileSafe blocks must integrate with "continue other work when approvals pending" scheduling rule.
- **Section 17 (Implementation Order):** Phase 1 guard implementation must account for worktree/project paths (as per WorktreeGitImprovement.md). Phase 2 config wiring (Option B) aligns with orchestrator-subagent-integration.md config merge at run start; FileSafe approved_commands and toggle state must be merged into per-run config snapshot.
- **Multi-account interaction:** When multi-account auto-rotation occurs, FileSafe must not block legitimate account-switching operations. Rate-limit detection and account fallback must be transparent to FileSafe (i.e., FileSafe sees the final command after account resolution, not the provider-level auth details).

---

### 2. Orchestrator_Page.md

**Brief Summary:**
Single-page 6-tab specification for the Orchestrator view: Progress (live dashboard), Tiers (hierarchy tree), Node Graph Display (DAG viz), Evidence, History, and Ledger. Defines widget-based tabs, run status indicators, HITL pending counts in badges, blocked/recovery state data model, and integration with underlying orchestrator events.

**Relevant Orchestrator Model Mentions:**
- **HITL and blocked state integration (§3, §4):** Orchestrator page exposes HITL approvals, run interrupted, rate limits, warnings in CTA widget. Blocked/recovery state includes `blocked_reason_code`, ordered `allowed_action_ids[]`, `blocked_sequence`, `preserved_local_work`, `requires_safe_point_restore?`.
- **Requested vs effective identity (§3, data sources §12):** Progress tab shows "requested vs effective runtime identity MUST remain visible whenever provider filtering or fallback changed the requested selection."
- **Safe-point retry visibility (§5):** Retry UI distinguishes safe-point retry from fresh attempt. Progress shows safe-point restore history.
- **Worktree visibility (§3):** Progress shows current worktree, branch, requested vs effective runtime identity, latest workflow status.
- **Node Graph live updates (§6, data sources §12):** Graph subscribes to `PuppetMasterEvent::UserInteractionRequired` (HITL), `blocked_reason_code`, rate limit events, and approval state changes.

**Conflicts/Changes Needed for FileSafe Sections 14-17:**
- **Section 15.1 (Integration with BaseRunner):** Orchestrator_Page's CTA widget must route FileSafe blocks (not just HITL/rate limits). When a FileSafe block occurs, the Orchestrator Page must show it in the CTA stack with the same priority/visibility as HITL requests.
- **Section 15.2 (Integration with Orchestrator):** If Orchestrator Page's "blocked_reason_code" data model is the canonical source, FileSafe events must emit `blocked_reason_code = filesafe_blocked`. The data structure in Orchestrator_Page must include FileSafe-specific fields (e.g., `guard_type`, `pattern_summary`) if analytics/UI need those details.
- **Worktree and file guard interaction:** When file guard checks file writes, it must resolve paths correctly even in worktree contexts. If Orchestrator Page shows current worktree path, the file guard must use the same path resolution logic to avoid false positives/negatives.

---

### 3. human-in-the-loop.md

**Brief Summary:**
Defines HITL mode: optional tier-boundary approval pauses (phase/task/subtask level, independent toggles, off by default). HITL runs **after** end verification and **before** advancing. Includes canonical HITL request contract (`request_id`, `tier_id`, `tier_type`, `allowed_action_ids[]`), events, and integration with Dashboard CtA surfaces and Assistant chat.

**Relevant Orchestrator Model Mentions:**
- **Tier boundary semantics:** HITL pauses at tier boundaries (after end verification). Tier definitions remain in orchestrator-subagent-integration.md (single source of truth).
- **HITL request contract (§1 and Addendum):** Canonical struct with `request_id`, `run_id`, `tier_id`, `tier_type`, `request_kind = "tier_boundary_approval"`, `message`, `allowed_action_ids[]`, and `requires_safe_point_restore?`.
- **Blocked episode semantics (Addendum §1-3):** HITL resolution wakes scheduler. When paused for HITL, unrelated runnable work continues. HITL actions use canonical runtime action families (`Approve`, `Reject`, `Cancel`, `Skip`, `Retry from safe point`, `Start fresh attempt`).
- **Safe-point interaction (Addendum §2):** If HITL rejection requires rollback before rerun, `requires_safe_point_restore = true` is set. Rerun must use `restore_safe_point_then_retry` pathway.
- **Persistence and restore (§2):** HITL approval state persists in redb so UI shows "waiting for approval" on restore.
- **Requested vs effective identity:** Not explicitly mentioned in HITL, but applies to Persona/model selection at tier boundaries.

**Conflicts/Changes Needed for FileSafe Sections 14-17:**
- **Shared blocked taxonomy:** FileSafe blocks and HITL approvals both use the same `blocked_reason_code` enum. FileSafe's `filesafe_blocked` must coexist with HITL's approval-pending state in the same scheduler logic (both can pause execution, but for different reasons).
- **Safe-point interaction (Addendum §2):** If a FileSafe block occurs after mutation-capable work has begun, `requires_safe_point_restore = true` must be set. This parallels HITL's safe-point handling. Both must use the same restore action family.
- **Recovery action family:** FileSafe recovery actions must use the same canonical action IDs as HITL (e.g., `restore_safe_point_then_retry`). Shared runtime action families mean FileSafe cannot invent parallel action schemas.
- **Scheduler rule:** "Continue other work when approvals pending" (Addendum §1) applies equally to HITL and FileSafe blocks. Both must unblock dependent work while their own node waits.

---

### 4. Multi-Account.md

**Brief Summary:**
Specification for multi-account support across six providers (Claude Code, Codex, Gemini, Copilot, Cursor, OpenCode). Covers account registry, active-index tracking, auto-rotation on rate limit, usage-based pick-best, and session migration (Claude only). Includes GUI requirements (Setup/Health/Doctor visibility), config model, and provider-specific behavior.

**Relevant Orchestrator Model Mentions:**
- **Requested vs effective account:** Account selection is resolved at run start: requested account (user's active choice) vs effective account (after pick-best logic or fallback due to rate limit). **Operational identity classes:** `github_api` account, registry/namespace identity, Kubernetes context identity (distinct from provider accounts).
- **Effective account switching:** When auto-rotation marks an account in cooldown and picks the next available, that switch is a runtime decision that changes "effective" platform/provider from requested. Must remain visible to user.
- **Multi-project support:** Account registry is per-platform, not per-project. Switching projects recalculates effective account based on pick-best or active selection for that project's configured platform.
- **Rate-limit detection and fallback:** On 429/401/403, mark account in cooldown, persist state, pick next account, retry. Exhaustion behavior: if all accounts in cooldown, optionally sleep until reset.

**Conflicts/Changes Needed for FileSafe Sections 14-17:**
- **No direct conflict,** but **integration point:** When auto-rotation happens (account fallback), the FileSafe check of the final spawned command must occur **after** account resolution. FileSafe should never block account-switching logic itself; it only checks the final command as spawned. Multi-Account.md's env-var passing (e.g., `CLAUDE_CONFIG_DIR`) must be transparent to FileSafe.
- **Event logging coordination:** Multi-Account's rate-limit events (rate-limit detected, account switched) and FileSafe's block events both go to seglog/analytics. Must ensure they don't collide or confuse audit trails.
- **Verification gate interaction:** When a verification gate operation runs with a fallback account, FileSafe's verification-gate tag (`PUPPET_MASTER_OPERATION_TYPE = "verification_gate"`) must travel with the request through account resolution.

---

### 5. Run_Graph_View.md (lines 1-300)

**Brief Summary:**
Specification for Node Graph Display tab (Tab 3 on Orchestrator page). Airflow-inspired DAG visualization with top bar (run metadata), left DAG graph panel, right node table and detail panel. Includes node rendering (state colors), edge routing, zoom/pan, node selection, and real-time data binding to `PuppetMasterEvent` stream.

**Relevant Orchestrator Model Mentions:**
- **Canonical node-graph execution:** DAG displays Phase → Task → Subtask → Iteration hierarchy. Each node has `node_id`, `title`, `objective`, `tier_type`, `state`, `start_ts`, `end_ts`, `elapsed_ms`, `attempts`, `verifier_state`, `blocked_reason`, `hitl_pending`.
- **HITL controls (§C6):** When `hitl_pending == true`, detail panel shows HITL request message, escalation rationale, and Approve/Deny buttons.
- **Blocked state and badges (§4.2, §5.3):** Nodes show lock icon when `blocked_reason` is set; pulsing dot for HITL pending; attempt count badge when `attempts > 1`; duration badge.
- **Safe-point visibility (§C1, §C7, Addendum §5-6):** Detail panel shows safe-point identity for audit/debugging; UI copy makes clear runtime safe points are distinct from user-facing restore points. Safe-point creation/restore history visible.
- **Requested vs effective execution identity (Addendum §2):** Not explicitly in Run_Graph_View lines 1-300, but mentioned in full document as fields in node detail.
- **Evidence and verification activity (§C4):** Real-time verification stream with tool calls, file changes, evidence artifacts.

**Conflicts/Changes Needed for FileSafe Sections 14-17:**
- **Blocked state colors:** If FileSafe blocks use `blocked_reason_code = filesafe_blocked`, node graph must have a color/icon for this state. Current section 8 "state-to-color mapping" must include filesafe_blocked state (alongside failed, escalated, retrying, running, gating, planning, pending, reopened, skipped, passed).
- **Detail panel C1 integration:** When a node is blocked by FileSafe, the detail panel must show `blocked_reason` (guard type, pattern, command summary). If a FileSafe block allows recovery (e.g., "Approve once"), the detail panel's action section must expose those recovery options.
- **Data model requirement:** Node structure must carry `guard_type` or `pattern_summary` fields if FileSafe-blocked nodes need them. Orchestrator event stream must emit enough detail to populate the detail panel with FileSafe recovery options.

---

### 6. WorktreeGitImprovement.md (lines 1-200)

**Brief Summary:**
Implementation plan for worktree creation/merge/cleanup and Git integration. Covers worktree base-branch handling, recovery on restart, merge-conflict worktree preservation, tier ID/branch sanitization, detached HEAD handling, and Doctor checks.

**Relevant Orchestrator Model Mentions:**
- **Package-based worktree lane pools (§2):** Worktrees are created under `.puppet-master/worktrees/` per tier_id. Lanes are implicit per phase/tier parallelization.
- **Worktree recovery and visibility (§2.8-2.9):** On restart, `active_worktrees` is empty; must repopulate from `git worktree list()` for paths under `worktree_base`. PR creation after restart must check worktree_manager even when `active_worktrees` has no entry.
- **Safe-point interaction (implied):** Worktree is the execution context for a tier; when safe-point restore rolls back, worktree state must also be rolled back or re-initialized.
- **Explicit node creation:** Each tier gets an explicit node in the plan graph; each node maps to potential worktree lane.

**Conflicts/Changes Needed for FileSafe Sections 14-17:**
- **File write scope and worktree paths (§11.1, 15.2, §7.5):** FileSafe's file guard must correctly resolve file paths in worktree contexts. When a tier runs in worktree at `.puppet-master/worktrees/<tier_id>/`, file writes must be checked relative to that worktree root, not the main repo. **Gap 4** (FileSafe §15.9) identifies this: "Normalize paths relative to `working_directory` and handle symlinks."
- **Merge conflict and blocked state:** When a worktree has merge conflicts (§2.3), if rerun would destroy the conflicting worktree, that's a situation where `requires_safe_point_restore = true` might apply. FileSafe's blocked-outcome integration must account for worktree state as part of "preserved_local_work."
- **Git binary resolution (§3.1):** FileSafe may block destructive Git commands (e.g., `git reset --hard`). Git binary used by FileSafe must match the one used by GitManager. Shared resolution helper function needed.

---

### 7. orchestrator-subagent-integration.md (lines 1-200)

**Brief Summary:**
Defines main run loop: PRD-driven execution of Phase → Task → Subtask → Iteration with tier boundaries and subagent selection. Covers config wiring (Option B: merge at run start), plan graph consumption for user projects, context injection, checkpoint persistence, and integration with event model (seglog + redb).

**Relevant Orchestrator Model Mentions:**
- **Canonical node-graph execution:** Phase → Task → Subtask → Iteration tier hierarchy with start/end verification at phase, task, subtask. Tiers are the single source of truth for scheduling and tier-boundary semantics.
- **First-class feature seam and work package:** Phases/Tasks/Subtasks are work packages with explicit node IDs, `crew_recommendation.subagents`, `depends_on` dependency lists. Orchestrator respects PRD recommendations for subagent personas and parallelization.
- **Explicit node and node identity:** Each plan node has `node_id`, `title`, `objective`, `depends_on[]`, `blockers`/`unblocks`. Load order validates graph structure (§ Load order and validation behavior).
- **Package overseer + seam overseer (implied):** "Overseer" (AI foreman role) conducts each tier. Subagents specialize per tier type (Phase, Task, Subtask, Iteration).
- **Automation-first default, optional HITL boundaries:** Autonomous runs proceed deterministically without human approvals. HITL is optional (see human-in-the-loop.md).
- **Promotion classes (implied):** Tiers promote upward (Iteration → Subtask → Task → Phase). Tier advancement requires end verification pass.
- **Requested vs effective execution identity:** Config wiring (Option B) builds effective run config from GUI defaults + interview output + per-tier overrides. Execution identity (Persona, platform, model) resolved at run start and fixed for run duration.
- **Contamination/restore/safe-point policy (§ Persistence and event emission, Execution policy notes):** Seglog and redb persist run metadata, session identity, checkpoints at phase/task/subtask boundaries for resume and recovery.
- **Multi-project support:** Orchestrator handles user-project plan graphs (headless from sharded SSOT artifacts, no Plans/ assumptions).

**Conflicts/Changes Needed for FileSafe Sections 14-17:**
- **Tier-scoped allowed files:** When FileSafe enforces write scope (§11.1), it must know the "allowed files" for the current tier. orchestrator-subagent-integration.md must expose a contract: `get_allowed_files_for_tier(tier_id)` returns the scope from plan/PRD. **Gap 2** (FileSafe §15.9) identifies this.
- **Config wiring and FileSafe approved_commands:** Option B (config merge at run start) must include FileSafe's `approved_commands` list. If user edits approved_commands in GUI, the merged config snapshot must reflect those changes.
- **Verification gate operation tagging:** orchestrator-subagent-integration.md's verification-gate semantics must tag ExecutionRequests with `PUPPET_MASTER_OPERATION_TYPE = "verification_gate"` so FileSafe's security filter can allow sensitive file reads during gates.
- **Sharded plan graph validation (§ Load order):** Plan graphs reference `contract_refs` and `acceptance[].check_id`. If a contract or acceptance check is FileSafe-related (e.g., "No destructive commands without gate approval"), orchestrator validation must ensure it's defined.

---

## CROSS-CUTTING SUMMARY: ORCHESTRATOR MODEL & FILESAFE INTEGRATION

### A. Core Orchestrator Model Changes (Consensus Across All Documents)

1. **Canonical node-graph execution** (centerpiece)
   - Phase → Task → Subtask → Iteration hierarchy with explicit node IDs
   - Each node mapped to a plan graph shard (`.puppet-master/project/plan_graph/nodes/<node_id>.json`)
   - DAG execution with dependency respect, tier boundaries, and start/end verification
   - **FileSafe implication:** Blocks must be scoped to node/tier context. Blocked node cannot advance; dependents wait.

2. **First-class blocked outcomes and HITL boundaries**
   - Blocked episodes (including FileSafe, HITL, rate limits) are persistent runtime states
   - Canonical data model: `blocked_reason_code`, `allowed_action_ids[]`, `preserved_local_work`, `requires_safe_point_restore?`
   - Scheduler rule: "Continue other work when approvals pending" — unblocked nodes run in parallel
   - **FileSafe implication:** `filesafe_blocked` is a first-class `blocked_reason_code`. FileSafe blocks unblock when user approves/edits/overrides.

3. **Requested vs effective execution identity**
   - User requests one platform/model/Persona/account; runtime resolves effective choice (after permissions, fallback, rate-limit auto-rotation)
   - Both must remain visible; project switch recalculates effective state
   - **FileSafe implication:** Multi-account fallback must be transparent. FileSafe check occurs on final (effective) command, not on requested choice.

4. **Safe-point/restore/contamination policy**
   - Explicit safe-point identity and creation/restore history
   - Restore-before-rerun required when policy says rollback needed before rerun
   - Segment log (seglog) + redb persistence for replay and recovery
   - **FileSafe implication:** If FileSafe block occurs after mutation, `requires_safe_point_restore = true` must be set. Rerun requires safe-point restore, not fresh attempt.

5. **Package-based worktree lane pools**
   - Worktrees created per tier in `.puppet-master/worktrees/<tier_id>/`
   - Implicit lanes from parallelization; worktrees are execution contexts for tiers
   - **FileSafe implication:** File guard must resolve paths correctly in worktree contexts. Worktree state is part of "preserved_local_work."

6. **Automation-first default, optional HITL**
   - Autonomous runs proceed without human approvals
   - HITL is opt-in per tier boundary (phase/task/subtask toggles)
   - **FileSafe implication:** FileSafe is always on (guards are deterministic, not optional). HITL approval can happen in parallel with FileSafe block approval.

7. **Multi-project, multi-account, effective account switching**
   - Account registry per platform; active index per platform
   - Auto-rotation on rate limit; pick-best by usage
   - Effective account different from requested when fallback occurs
   - **FileSafe implication:** Account fallback env-vars must be transparent to FileSafe. FileSafe checks final spawned command post-account-resolution.

---

### B. Integration Requirements for FileSafe Sections 14-17

#### **Section 14 (Context Compilation & Token Efficiency)** — No Breaking Changes

FileSafe context compilation (§14) is orthogonal to blocked-outcome model and requires no changes to orchestrator. However:

- **Config wiring (Option B):** Context compiler config (enable/disable, delta_context, cache settings) must be merged at run start alongside FileSafe config. Ensure `context.compiler_enabled` and `filesafe.enabled` are both in merged config snapshot.
- **Prompt checking (§11.3):** After prompt assembly (including context compilation), check prompt for destructive commands before sending to platform. Compiled context may contain examples; ensure check_prompt runs post-compilation.

#### **Section 15 (System Integration Analysis)** — **REQUIRES CHANGES**

**Current FileSafe integration point (§15.1):**
- Guards check in `BaseRunner::execute_command()` after quota/rate-limit, before permission audit.
- File paths extracted from ExecutionRequest and context files.
- Verification gate and interview operation tagged via `PUPPET_MASTER_OPERATION_TYPE` env var.

**Required changes for orchestrator model:**

1. **Blocked outcome integration:**
   - When FileSafe blocks, emit event with `blocked_reason_code = filesafe_blocked`
   - Include `allowed_action_ids[]` if recovery is possible (e.g., `["approve_once", "approve_and_add", "cancel"]`)
   - Set `preserved_local_work = true` if any mutations occurred before block
   - Set `requires_safe_point_restore = true` if policy requires rollback before rerun
   - Example event payload:
     ```json
     {
       "event_type": "filesafe_blocked",
       "blocked_reason_code": "filesafe_blocked",
       "guard_type": "bash_guard",
       "pattern_id": "destructive-migrate-fresh",
       "command_summary": "rails db:migrate:fresh",
       "tier_id": "subtask-ST-001-001",
       "node_id": "node-42",
       "allowed_action_ids": ["approve_once", "approve_and_add", "cancel"],
       "preserved_local_work": true,
       "requires_safe_point_restore": false,
       "timestamp": "2026-03-09T14:23:45Z"
     }
     ```

2. **Orchestrator awareness:**
   - Orchestrator must treat FileSafe blocks like HITL blocks: pause the node, continue other runnable work
   - Use same scheduler logic and blocked-episode persistence (redb checkpoint)
   - On resolve (approve), emit `filesafe_resolved` event and wake scheduler

3. **Worktree path resolution (Gap 4):**
   - File guard must normalize paths relative to `working_directory` (which may be a worktree)
   - Handle symlinks: use `canonicalize()` with fallback to original path
   - Example:
     ```rust
     let resolved = if path.is_absolute() {
         path.clone()
     } else {
         working_directory.join(&path)
     };
     let normalized = resolved.canonicalize().unwrap_or(resolved);
     ```

4. **Allowed files from plan metadata (Gap 2):**
   - Orchestrator must call `get_allowed_files_for_tier(tier_id)` and pass to BaseRunner
   - Retrieve from plan graph node's scope or PRD's tier mapping
   - Example in BaseRunner init:
     ```rust
     let allowed_files = orchestrator.get_allowed_files_for_tier(&tier_id)?;
     let runner = BaseRunner::new(config)
         .with_allowed_files(allowed_files);
     ```

5. **Config wiring (Option B, matches orchestrator-subagent-integration.md):**
   - At run start, merge GUI FileSafe config + any interview/PRD overrides
   - Snapshot merged config in redb per run for audit trail
   - Pass merged `approved_commands` list to BaseRunner
   - Example merge precedence:
     ```
     Merged = {
       ...(GUI defaults),
       ...(interview output FileSafe settings),
       ...(per-tier overrides from PRD if present)
     }
     ```

#### **Section 16 (References)** — **UPDATE REQUIRED**

Add references to orchestrator integration documents:
- Plans/orchestrator-subagent-integration.md (§ Config wiring, § Execution policy notes)
- Plans/human-in-the-loop.md (§ Blocked episode semantics, safe-point interaction)
- Plans/Orchestrator_Page.md (§ Blocked/recovery state data model, CTA widget)
- Plans/Run_Graph_View.md (§ Node state colors, blocked badge, detail panel for guard context)
- Plans/Section15_MVP_Promoted_Features_Spec.md (§ Blocked outcomes first-class, restore-before-rerun)

#### **Section 17 (Implementation Order)** — **REQUIRES UPDATES**

Current Phase 1-4 order is sound, but add **dependencies and sequencing:**

**Phase 0 (Prerequisite):** 
- Wait for orchestrator-subagent-integration.md implementation to expose `get_allowed_files_for_tier()` function
- Ensure orchestrator emits `PuppetMasterEvent::ExecutionRequest` with `working_directory` field

**Phase 1 (Core guards)** — **ADD:**
- Step 8: In BaseRunner init, accept `allowed_files: Vec<PathBuf>` parameter
- Step 8b: In execute_command, resolve file paths relative to `working_directory`, not CWD; use `canonicalize()` with fallback
- Step 10: Extend `extract_file_paths_from_request` to handle worktree paths (e.g., resolve `.puppet-master/worktrees/<tier_id>` to absolute path)
- Step 12: FileSafeEvent struct must include `tier_id`, `node_id`, `allowed_action_ids[]`, `preserved_local_work`, `requires_safe_point_restore?`

**Phase 2 (Config wiring and GUI)** — **ADD:**
- Step 15: Config wiring (Option B) merges FileSafe.enabled + FileSafe.approved_commands from GUI config
- Step 16: When passing FileSafe config to BaseRunner, also pass `working_directory` from orchestrator context
- Step 17: GUI FileSafe card must show that blocks integrate with run state (e.g., "Blocks pause the node; click to approve or resolve in Orchestrator")

**Phase 3 (Assistant Chat and YOLO)** — **ADD:**
- Step 20: YOLO warning must note FileSafe guards still apply
- Step 21: In-chat approval must emit FileSafe event so orchestrator sees approval; include rationale in event
- Step 22: Terminal output must NOT be the only UI surface; also route to Orchestrator page CTA widget

**Phase 4 (Context compilation)** — **ADD:**
- Step 24: Context compiler output must be scanned by `check_prompt` after compilation (see §11.3)

**Risks and mitigations — ADD:**
- **Risk:** Config wiring (Option B) must be complete before Phase 2 is complete; otherwise approved_commands changes in GUI won't reach runtime.
- **Mitigation:** Implement orchestrator config-merge function first; test that GUI → redb → orchestrator → BaseRunner chain is working.
- **Risk:** Worktree path resolution must match worktree creation logic in WorktreeGitImprovement.md.
- **Mitigation:** Use shared helper function for path normalization (marked `DRY:FN:normalize_execution_path`).
- **Risk:** Multi-account auto-rotation must not interfere with FileSafe checks.
- **Mitigation:** Ensure FileSafe check occurs **after** multi-account resolution (after env vars are set); document this ordering in BaseRunner.

---

### C. Specific Interaction Points Between Orchestrator Changes and FileSafe

| Orchestrator Feature | FileSafe Requirement | Conflict? | Resolution |
|---|---|---|---|
| **Canonical node-graph execution** | Blocks must be node-scoped; must use canonical blocked_reason_code enum | No | Add `filesafe_blocked` code; integrate into scheduler |
| **Requested vs effective identity** | FileSafe check on final (effective) command after identity resolution | No | Ensure identity resolution happens before FileSafe check in BaseRunner |
| **Safe-point/restore policy** | FileSafe block may require restore before rerun | No | Set `requires_safe_point_restore = true` when mutation occurred before block |
| **Package-based worktree lanes** | File paths must resolve correctly in worktree contexts | **Yes** | Use `working_directory` for path resolution, not CWD |
| **Config wiring (Option B)** | FileSafe config merged at run start alongside other overrides | **Partially** | Extend merge logic to include approved_commands, toggle state |
| **Automation-first + optional HITL** | FileSafe is always on; HITL is opt-in. Both can pause simultaneously | No | Use same scheduler rule for both |
| **Multi-account auto-rotation** | Account fallback transparent to FileSafe | No | FileSafe checks post-resolution; account env-vars are implementation detail |
| **Prompt checking (§11.3)** | Prompt must be checked after context compilation + assembly | No | Call `check_prompt` as final pre-dispatch step |
| **Allowed files from plan** | File guard must know scope per tier | **Yes** | Orchestrator exposes `get_allowed_files_for_tier()` |
| **Event emission (seglog)** | FileSafe blocks, approvals, and analytics data must be replayable | No | Emit rich FileSafeEvent with all required fields |
| **Verification gate tagging** | Request must carry `PUPPET_MASTER_OPERATION_TYPE = "verification_gate"` so FileSafe allows reads | **Yes** | Orchestrator must set this env var for verification gate runs |
| **Dashboard/Orchestrator/chat attention flow** | FileSafe blocks route to CTA widget + Dashboard + Optional chat CtA | **Yes** | Extend CTA widget model to include FileSafe blocks |

---

## RECOMMENDATIONS FOR FILESAFE IMPLEMENTATION

1. **Implement Section 15 updates first:** Blocked-outcome integration is prerequisite for Phases 1-2.

2. **Coordinate with orchestrator-subagent-integration.md:** Get `get_allowed_files_for_tier()` signature and call contract before Phase 1.

3. **Use shared normalized path function:** Ensure file guard uses same logic as worktree manager for path resolution.

4. **Test config wiring (Option B) early:** Phase 2 depends on orchestrator's ability to merge and snapshot FileSafe config. Test this in isolation.

5. **Plan event schema carefully:** FileSafeEvent must carry enough structure for both analytics aggregation and UI recovery-action display.

6. **Coordinate multi-account + FileSafe semantics:** Ensure account fallback and FileSafe checks don't collide in event logs or scheduler logic.

7. **Update Section 16 references:** Add explicit cites to new orchestrator plans so future readers can trace FileSafe's integration dependencies.

___BEGIN___COMMAND_DONE_MARKER___0
