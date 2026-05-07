
## Research Progress - 2026-03-16 - Revised readiness posture after owner-doc and storage passes

### Targeted docs read
- current `working_ledger.md`
- `Plans/storage-plan.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/human-in-the-loop.md`
- `Plans/Executor_Protocol.md`

### Key findings
- The remaining work no longer looks like one undifferentiated “not ready” blob. It now splits into three clearer buckets:
  - **still-structural gaps** where canonical model/owner decisions are still missing
  - **spec-integrity failures** where docs promise canon that does not actually exist or conflicts internally
  - **plain reconciliation cleanup** where the direction is stable and the work is mostly retargeting consumers
- The still-structural gaps now appear narrower than before, but they are still blocking true reconciliation:
  - canonical execution-context replacement / `TierContext` successor ownership
  - blocked/approval identity minting and scope (`blocked_sequence`, approval scope key, request/block bridge)
  - missing storage families for runtime-artifact indexing and worktree/lane lifecycle
  - durable lineage bridges from planning/wizard/validation into launched execution
- The spec-integrity failures are now a separate category and they matter because reconciliation cannot safely proceed while core owners are mechanically inconsistent:
  - ghost command IDs
  - missing catalog rows for referenced commands
  - missing runtime-artifact schema family / storage registration
  - duplicated executor canon
  - missing advertised sections and dead glossary references
- Everything else is increasingly cleanup/reconciliation:
  - updating stale tier-era consumers
  - aligning requested/effective/account/runtime identity displays
  - moving surfaces to canonical route payloads and runtime actions
  - tab/layout/help/glossary cleanup
  - replacing old worktree/tier copy with lane/worktree/package/seam-aware wording

### Updated working classification
- **Still needs research / owner decisions**
  - execution-unit context owner and minimum field contract
  - blocked approval identity/scope and `blocked_sequence` minting ownership
  - durable storage families for:
    - runtime-artifact indexing/projection
    - worktree/lane lifecycle
  - validation/wizard/interview lineage bridge into launched execution
- **Must-fix spec-integrity failures before reconciliation**
  - command/catalog ghost IDs and missing owner rows
  - payload/schema-owner triangle for runtime artifacts
  - duplicated / contradictory executor and HITL canon
  - glossary/crosswalk/TOC dead references and missing advertised sections
- **Primarily reconciliation work once the above are settled**
  - Orchestrator tab/page retargeting
  - Source Control vs Orchestrator surface cleanup
  - help/glossary expansion
  - stale consumer-doc requested/effective/runtime identity cleanup
  - concern/search/attention/project-summary surface alignment

### Readiness judgment
- Research is materially closer to reconciliation than it was earlier in the thread.
- But it is still not safe to call this `ready_for_reconciliation` because at least a few remaining gaps are not just stale wording; they are missing canonical owners or broken SSOT integrity.
- The practical threshold now looks like this:
  - once the remaining structural owner gaps above are explicitly assigned/resolved
  - and the most dangerous spec-integrity failures are logged as concrete reconciliation targets rather than live ambiguity
  - then the work can likely move to reconciliation without reopening core model questions

### Do-not-forget details
- “not ready” no longer means “large conceptual uncertainty”; it now means “a small set of structural owner gaps plus some hard SSOT integrity failures”
- spec-integrity failures should not be mistaken for fresh design space, but they still block safe reconciliation
- current work item posture remains `active`, but the center of gravity is shifting from exploration to owner-hardening

## Research Progress - 2026-03-16 - Blocked episode ownership and startup-recovery handshake

### Targeted docs read
- `Plans/Contracts_V0.md`
- `Plans/Executor_Protocol.md`
- `Plans/human-in-the-loop.md`
- `Plans/storage-plan.md`
- `Plans/Decision_Policy.md`
- `Plans/UI_Command_Catalog.md`

### Key findings
- The canonical field family is already mostly clear:
  - `node.blocked` / `node.unblocked`
  - `blocked_reason_code`
  - `blocked_sequence`
  - `allowed_action_ids[]`
  - `node.prerequisite_resolved`
  - `wake_reason = approval_resolved | clarification_resolved | auth_recovered | startup_recovered | ...`
- The missing piece is ownership semantics, not field naming:
  - no doc clearly says who mints `blocked_sequence`
  - no doc clearly says when a new blocked episode starts versus an existing one being updated
  - `request_id` still competes with `blocked_sequence` in HITL/storage examples
  - startup recovery wakeups are named but not tied to a concrete blocked-episode restoration rule

### Recommended owner decision
- `blocked_sequence` should be owned by the runtime scheduler/executor layer, not by UI/HITL/chat/storage.
- Scope:
  - monotonic per `{ run_id, node_id }`
  - starts at `1`
  - increments only when the node transitions from non-blocked to a new blocked episode
- A blocked episode is the canonical unit for:
  - approval waiting
  - clarification waiting
  - auth/prerequisite waiting
  - permission/FileSafe/external-side-effect block
  - worktree conflict / dirty-worktree block
- Updating metadata for the same unresolved blocked prerequisite must retain the same `blocked_sequence`.
- A new `blocked_sequence` is minted only when:
  - the prior blocked episode was resolved/unblocked and a later distinct blocked condition occurs, or
  - the blocked reason changes in a way that creates a genuinely new recovery episode rather than additional detail on the same episode

### Recommended HITL/request bridge
- `blocked_sequence` should be canonical; `request_id` should become a child/compatibility handle for approval-specific UX/history.
- Practical rule:
  - `waiting_approval` blocked episode exists first-class in runtime/state
  - if the blocked reason needs an approval prompt surface, the system may also mint a stable `request_id`
  - that `request_id` maps 1:1 to the underlying `{ run_id, node_id, blocked_sequence }`
- `request_id` must never be the only durable key for recovery/mutation decisions.
- Approval commands should route by blocked episode identity; any retained `request_id` is lookup metadata, not the canonical recovery target.

### Recommended startup-recovery handshake
- On restart, the runtime restores current unresolved blocked episodes from canonical blocked/runtime records/projections.
- The scheduler then emits a scheduler pass with `wake_reason = startup_recovered`.
- That startup-recovery pass does not mint new blocked episodes by itself; it rehydrates existing unresolved episodes and reevaluates runnable work.
- If restart determines an in-flight attempt cannot resume, that attempt transitions to `stale_historical`; if a blocked prerequisite still exists, the existing unresolved blocked episode remains the actionable state.
- If restart discovers a previously persisted blocked episode is no longer valid because the prerequisite was already satisfied externally, the recovery cycle should resolve/unblock that episode explicitly rather than silently dropping it.

### Impacted docs
- `Plans/Contracts_V0.md`
- `Plans/Executor_Protocol.md`
- `Plans/human-in-the-loop.md`
- `Plans/storage-plan.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/Decision_Policy.md`

### Contradictions / gaps surfaced
- `storage-plan.md` still publishes HITL events with `allowed_actions` and tier-local request payloads while its runtime blocked projections already use `blocked_sequence` and `allowed_action_ids[]`.
- `UI_Command_Catalog.md` already routes canonical runtime actions by `blocked_sequence`, but graph-local HITL commands still use `request_id`.
- `Decision_Policy.md` does not currently own the minting rule or the “same blocked episode vs new blocked episode” distinction, even though that is exactly a deterministic policy boundary.
- `Executor_Protocol.md` names `startup_recovered` but does not define the restore handshake strongly enough to prevent silent block-loss or accidental episode reminting.

### Candidate fixes to carry forward
- Make `Executor_Protocol.md` + `Contracts_V0.md` the joint owners of:
  - `blocked_sequence` minting semantics
  - blocked-episode lifecycle
  - startup-recovery scheduler handshake
- Recast HITL request contracts so `request_id` is explicitly subordinate to blocked-episode identity.
- Update storage/event docs so approval records and blocked projections are consistent on:
  - `allowed_action_ids[]`
  - `blocked_sequence`
  - canonical runtime action routing
- Add a deterministic rule for “same blocked episode vs new blocked episode” to a canonical owner doc, likely `Decision_Policy.md` or `Executor_Protocol.md`.

### Do-not-forget details
- this seam now looks resolvable; the missing piece was ownership, not concept invention
- `blocked_sequence` should be runtime-owned, not invented by surfaces
- startup recovery should rehydrate unresolved blocked episodes, not create fresh ones opportunistically

## Research Progress - 2026-03-16 - Opus owner-doc tranche synthesis

### Targeted docs read
- `Plans/Commands_System.md`
- `Plans/Wiring_Matrix.md`
- `Plans/UI_Wiring_Rules.md`
- `Plans/Project_Output_Artifacts.md`
- `Plans/Glossary.md`
- `Plans/FileManager.md`
- `Plans/Crosswalk.md`
- `Plans/Decision_Policy.md`
- `Plans/Run_Modes.md`
- `Plans/Progression_Gates.md`
- `Plans/newtools.md`
- `Plans/assistant-memory-subsystem.md`
- adjacent owner docs pulled for contradiction checks (`UI_Command_Catalog.md`, `assistant-chat-design.md`, `Contracts_V0.md`, `storage-plan.md`, `Orchestrator_Page.md`, `WorktreeGitImprovement.md`, `Project_Output_Artifacts.md`, `Permissions_System.md`, `Tools.md`)

### Key findings
- The next uncovered owner-doc tranche is producing high-signal deltas, not low-value tail noise.
- Command / wiring ownership is materially weaker than the downstream surface docs assumed:
  - `Commands_System.md` contains an internal acceptance-criteria contradiction on reserved slash-command overrides, while `assistant-chat-design.md` and `UI_Command_Catalog.md` still state the opposite rule and do not even mention `override_builtin`.
  - `Commands_System.md` defines `cmd.chat.run_user_command`, but the canonical catalog does not register it; the Wiring Matrix also references ghost chat/orchestrator command IDs (`cmd.chat.branch_from_restore`, `cmd.orchestrator.switch_tab`) that do not exist in the catalog.
  - `UI_Wiring_Rules.md` still cannot express dispatcher preconditions such as freshness/health gating, permission gating, dynamic `allowed_action_ids[]`, or mutation safety tiers; GATE-010 currently can’t verify the contracts the runtime docs now rely on.
  - `newtools.md` introduces additional ghost command IDs (`cmd.orchestrator.preview_*`, `cmd.orchestrator.build_run`, etc.) and a new `CustomHeadlessTool` ToolID without registering them in the canonical catalog/tool/permission owners.
- Artifact / persistence / lineage owner docs still have field-family holes that downstream passes kept surfacing:
  - `Project_Output_Artifacts.md` is now clearly under-keyed relative to the canonical EventRecord/runtime model: artifact events and validation pass reports still omit project/thread/run/attempt/account identity details, `pass_verdict` mismatches the wizard producer doc, and interview-emitted artifact types (`glossary`, `evidence/<node_id>.json`) still do not line up with the package SSOT.
  - `FileManager.md` still cannot satisfy its own addendum requiring open-by-runtime-identity because its core open contract is path-only; `generated://` only covers preview restore, and `evidence_record` is still tier-keyed where attempt-native pivots are now required.
  - `assistant-memory-subsystem.md` surfaces a new storage-owner gap: memory event families, AutoRunBoundary/AutoMilestone triggers, `attention_required` thread state persistence, and HITL/dashboard CTA command families still have no canonical event/command registration in storage-plan or the command catalog.
- Boundary / term / policy owner docs are also lagging the rewrite:
  - `Glossary.md` now has multiple dead forward references (`Overseer`) and is missing the canonical rewrite vocabulary that later passes repeatedly depend on (`execution_role`, `operational_identity`, `projection_freshness`, `projection_health`, `attention item`, `concern`).
  - `Crosswalk.md` is structurally broken (duplicate section numbering, orphaned addenda, wrong ContractRef) and still does not route major rewrite-era owners such as `orchestrator-subagent-integration.md`, runtime scheduler ownership, or worktree lifecycle ownership.
  - `Decision_Policy.md` still leaves `blocked_sequence` minting, startup recovery sequencing, retry/remediation counter bindings, runtime blocked escalation, and `ready_since_utc` restart policy unowned.
  - `Run_Modes.md` now sharpens the execution-model seams further: DAE jail vs orchestrator worktree vs Contribute(PR) single-branch isolation are still three incompatible models, and mode resolution remains identity-blind to account/role differences.
  - `Progression_Gates.md` remains heavily planning-artifact-centric, with duplicated addenda and zero formal gate coverage for concern/corroboration/promotion/runtime blocked/governance flows.

### Highest-risk impacted docs
- `Plans/UI_Command_Catalog.md`
  - now has multiple ghost-ID dependents and remains the weak link for command-family ownership.
- `Plans/Commands_System.md`
  - internal AC contradiction and uncataloged command IDs now directly threaten wiring verification.
- `Plans/Project_Output_Artifacts.md`
  - still too thin for modern event/runtime/account lineage.
- `Plans/FileManager.md`
  - still cannot open runtime artifacts by identity or preserve attempt/worktree lineage coherently.
- `Plans/Glossary.md`
