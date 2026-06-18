# Human-in-the-Loop (HITL) Mode -- Plan


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Retire tier-era canon and shadow fields
- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.
### Provider-native correlation and approval scope


### Identity and blocked-policy transfer cluster
### Approval scope key and approver identity


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Plan Document Status

**This is a PLAN DOCUMENT ONLY** -- No code changes have been made. This document contains:
- HITL behavior and blocked-runtime/package-seam approval semantics; tier-boundary wording is compatibility lineage
- Settings model (phase / task / subtask, independent, off by default)
- Integration points with the orchestrator run loop
- DRY alignment with existing tier and verification plans

## Rewrite alignment (2026-02-21)


HITL semantics are part of the deterministic agent-loop core described in `Plans/rewrite-tie-in-memo.md`:

- HITL approvals should be represented as explicit **events** in the unified event model (seglog ledger)
- "Pause for approval" must be reproducible/replayable (event stream + projections), not just an in-memory UI state
- UI can change (Slint rewrite), but blocked-runtime, package-complete, seam-complete, and mandatory side-effect approval requirements must not

### Canonical HITL request contract


The canonical human-in-the-loop contract remains a blocked-runtime overlay.

Required runtime-facing fields are:
- `run_id`
- `node_id`
- `blocked_sequence`
- `attempt_id?`
- `blocked_reason_code`
- `allowed_action_ids[]`
- `approval_scope_key`
- `detail_ref?`
- `approver_identity?`

Rules:
- `blocked_sequence` remains the canonical approval anchor.
- `allowed_action_ids[]` stay ordered and runtime-owned.
- `action_available` rows derive from the same blocked-runtime action set.

### Shared-runtime HITL request and command alignment
HITL is the approval consumer for shared-runtime, multi-lane execution. Assistant chat, validation-pass output, wizard-handoff payloads, DAE side-effect interception, and tool-event records must preserve `effective_account_id`, `requested_account`, `requested_account_id`, `execution_role`, permission posture, actor identity, lane identity, and `attempt_id` so a later reviewer can tell who asked, who approved, under which `/account/role`, on which `/package/lane/attempt`, and whether an `/always` policy was scoped safely. Any rewrite-alignment or post-hoc explanation that omits these fields is under-attributed and lane-unsafe.

Runtime HITL persistence is keyed by blocked episode identity first. `checkpoints.hitl.{run_id}` and `checkpoints.hitl` are compatibility paths only; `/runtime/storage` records must distinguish concurrent pending-HITL episodes in the same run by `run_id`, `node_id`, `blocked_sequence`, `attempt_id?`, `approval_scope_key`, actor/account/lane context, and approver identity. The event family must support a three-way join among the blocked episode, approval-identity record, and tool-level or /tool-definition request that triggered the wait.

The request-era contract remains documented only as a compatibility bridge. A historical `HITLRequest` with `request_id`, `tier_id`, `tier_type`, `request_kind = tier_boundary_approval`, `request_kind`, `allowed_actions`, `allowed_actions[]`, `/tier/request_kind/allowed_actions`, and `hitl.approval_requested` is subordinate to the runtime blocked episode. `allowed_action_ids[]` owns the active action order; any request-era `allowed_actions` array is a derived alias for old consumers and must not become a second action family.

HITL classification keeps the `source axis`, `request axis`, and `execution/result axis` separate. A `/result` or execution outcome may explain why the blocked episode exists, but it must not become the request identity or the source identity.

HITL settings are automation-first and OFF by default unless a user explicitly enables phase, task, or subtask groupings. `<phase>/<task>/<subtask>` and `/task/subtask` are display/configuration labels only. Live approval can be package/seam/lane-bound through `/package/seam/lane-bound` and `/seam-aware` gate context, with package-complete and seam-complete approvals recorded as `package_complete_gate` and `seam_complete_gate` outcomes rather than as tier-local pauses.

HITL boundary redesign remains automation-first: approval pauses attach to package-complete and seam-complete events rather than to phase/task/subtask or `/task/subtask` boundaries. Optional HITL boundaries share one UI contract for package-complete, seam-complete, and mandatory side-effect gates; tier-boundary review is display/example copy only. Mandatory and optional HITL cases, including Docker repo creation, FileSafe approvals, Multi-Pass review, wizard attention-required, and graph-level HITL, must be classified in one boundary model.

Clarification questions and blocked-resolution flows use node-effective execution metadata. A node-effective prompt must show provider, model, effort, `/model/effort`, execution-level identity, runtime-only artifacts, dependent-node impact, package-level worktree coherence, same-lane continuation, package-based remediation, `/package/seam/remediation`, delegated-worker ownership, promote-then-fork tradeoffs, and whether the decision is graph-declared. Palette copy must be palette-friendly while still distinguishing palette-allowed, palette-discouraged, low-risk focus actions, and detail pivots such as `/detail/history/ledger/evidence` and `/seam/package/node/lane/concern/review/patch/recovery`.

UI and storage routes must not cross-wire governance approvals with tool approvals. UI_Command_Catalog, Run_Graph_View, Orchestrator_Page, storage-plan, `Plans/Prompt_Pipeline.md`, `/Prompt_Pipeline.md`, Prompt_Pipeline, usage-feature, usage-feature.md, FileManager, newfeatures, and orchestrator-subagent-integration are consumers of the same event-to-surface model: `hitl.*` rows in the event-table carry MUSTs for `/config`, `run.started`, `usage.event`, account-aware switch-history, `/role-aware` actor projections, runtime execution-role disclosure, `/meta` work-item links, `/families`, `/action-family` normalization, and action-family resolution. Freshness-gated mutation commands stay bound to the same current blocked episode. Dashboard, Orchestrator, chat-thread, Assistant, and direct controls all route side-effect approvals to the same blocked episode and approval_scope_key.

Run_Graph_View, `Run_Graph_View.md`, usage-feature, and `usage-feature.md` are the highest-risk stale consumer pair when they continue sharing `tier_id` as an old usage/evidence/runtime correlation key. HITL consumers must treat `/evidence/runtime` correlation as derived compatibility metadata over the blocked episode, not as a replacement for approval identity.

HITL blocked/runtime semantics are canonical for `/runtime` consumers; tier-boundary examples remain derived copy only.

The plan must not preserve two competing approval/blocked ontologies: `blocked-episode` / `/runtime-native` is canonical, while HITL request `/tier-boundary-native` and `/blocked` request-era phrasing are compatibility labels only, a bridge from the old HITL plan to the new blocked/runtime command model.

The canonical switch-history / pressure-episode family is queryable from History, Ledger, Usage, `/Usage`, and Account/Usage Pressure projections, and it remains account-aware rather than tier-derived.

Graph-local HITL commands remain compatibility shims over runtime actions. `cmd.graph.approve_hitl`, `cmd.graph.deny_hitl`, `hitl_request_id`, `request_id`, and graph-local command shapes must resolve through `blocked_sequence` before they mutate state. The one-off approval-scope for a blocked-episode is separate from session policy scope, doom-loop avoidance, reject-cascade handling, `/resolutions`, `/lane/account`, multi-actor provenance, `ask`, `always`, tool-approval policy, cross-wires cleanup, and any governance-boundary decision.

Conversational, `/HITL/tooling`, and tooling docs must not overload session with incompatible scope meanings. Session copy is display or provider context only; blocked and approval correctness comes from lane/account/run/node identity under multi-lane and multi-actor execution.

File and artifact opening uses the shared object-open contract. FileManager may continue to expose `OpenFile { path... }` and the canonical `OpenFile { path: PathBuf, line?, range?, target_group? }` workspace-document command, but object-open requests for runtime artifacts must use open-by-identity with runtime-artifact envelope data and artifact-opening target metadata. `target_group` is display routing, not a replacement for the artifact identity.

Domain-specific "open in X" commands may remain when they express a meaningful domain-specific product action, but they are wrappers over the same route/subject model. The `/subject` identity and route target are shared; HITL, object-open, and runtime surfaces must not invent custom argument families for each destination.

Compatibility labels must be explicit. `HITL tier-boundary approvals`, tier-bound, tier-boundary, tier-local, tier-keyed, tier-based, stale-ownership, TierContext, execution-unit, `/runtime-overlay`, blocked-node, graph-local, `OpenFile`, `PathBuf`, seam-id, package-id, feature-seam, `/seam`, `/interview/builder/orchestrator`, and `Run_Modes` can appear in migration or display copy, but canonical HITL ownership is the blocked-node runtime action model with one action family and one approval identity.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

### Consequential transition, tray, and recovery-label alignment
Consequential approval and recovery transitions use a shared state transition report: from state, to state, target object, actor/source, `/source`, why the transition occurred, prerequisite evidence, review or corroboration refs, and resulting downstream obligations. `projection-trust` defines whether a projected control may act immediately, require review, or show degraded operational confidence.

Recovery labels must distinguish true undo from compensating action. `Undo` is available only when an immediate inverse operation exists. `Restore`, `Rollback`, `Retry from Safe Point`, and `Reopen` describe distinct recovery behaviors. `compensating_action_only` covers `/dismiss`, acknowledge/dismiss concern, reopen after revoke, restore from safe point, restore point copy, `Create New Lane`, `Re-request Promotion`, and `Reapply` when they change or reconstruct state without being true undo.

Restore language is overloaded and must be normalized before display or persistence. Rollback, checkpoint, revert, and `/checkpoint/revert` wording must resolve to a safe-point-aware retry when a valid safe point exists and policy allows restore, or to an explicit `Start fresh attempt`; it must not mint another recovery action family.

System `/tray` notifications remain narrow: HITL approval required, run complete, major failure requiring attention, and severe `/pressure` or rate-limit events that materially stop progress. Tray copy is not the owner for approval identity, allowed actions, or recovery semantics.

Provider-native approval correlation records preserve OpenCode session IDs in provider-native `IDs`, `/provider`, and `/attempt/account/trust` metadata rather than overloading runtime thread identity. GUI concern-model, projection-health, and degraded-trust requirements from FinalGUISpec.md are HITL consumers when they render approval or recovery decisions.

The execution-core mismatch is resolved in favor of graph/runtime ownership: `Builder`, `Verifier`, and `Overseer` labels may describe roles, while `Executor_Protocol`, `Executor_Protocol.md`, orchestrator-subagent-integration, orchestrator-subagent-integration.md, `Phase -> Task -> Subtask -> Iteration`, TierContext, tier-boundary, and tier-keyed language are compatibility/display context only. HITL still deprecates request-era `allowed_actions` and `allowed_actions[]` in favor of runtime `allowed_action_ids[]`.
### Debug automation front-door grants

Debug Mode may ask for a run-scoped front-door grant that covers repeated low-risk investigation actions.

Required rules:
- the grant remains represented through the canonical blocked-runtime overlay rather than through a new request-centric debug approval model
- the approval record is anchored by the owning blocked episode and investigation identity
- shared runtime actions remain canonical; Debug Mode does not invent a separate approval transport
- declining the grant keeps the investigation alive in a degraded or blocked state when possible rather than silently discarding the investigation

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

Scope rules:
- the front-door grant may cover repeated low-risk evidence reads and declared-scope temporary instrumentation actions only
- high-risk mutations, auth/state mutation, publish-side effects, and other explicit-confirmation actions still require their own confirmations
- target binding falls back to `agent_session` only when the request is explicitly about PM's own run or `/session` behavior, or when no project-backed target is available
- revoking the grant or finishing the investigation revokes the front-door scope as well

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/GitHub_Integration.md

## Executive Summary

**Human-in-the-Loop (HITL) mode** lets the user require explicit human approval at configured package or seam decision points. Phase, task, and subtask toggles remain user-facing grouping controls, but runtime approval binds to `package_complete_gate`, `seam_complete_gate`, and the current blocked episode rather than to a tier-local identity. All HITL toggles are **off by default**.

**Critical autonomy rule:** HITL is an optional product UX feature. It MUST NOT be required for correctness, verification, or progression gates; autonomous runs proceed deterministically without any human approvals.  
ContractRef: PolicyRule:Decision_Policy.md§4, Gate:GATE-001

**Use cases:** Optional package/seam approval pauses for stakeholders (when explicitly enabled by the user).

## Relationship to Other Plans

| Plan | Relevance to HITL |
|------|-------------------|
| **Plans/orchestrator-subagent-integration.md** | Defines the visible Phase → Task → Subtask → Iteration grouping and verification labels. HITL consumes those labels as configuration/display groupings only; canonical approval scope, recovery identity, and progression blocking come from package/seam gates and runtime blocked episodes. |
| **Plans/interview-subagent-integration.md** | Interview flow has its own phases (Scope, Architecture, UX, etc.). HITL in this plan applies to orchestrator package/seam decision points surfaced through Phase/Task/Subtask grouping controls. Interview-phase-level HITL (pause after each interview phase for approval) is out of scope here but could mirror this grouping model if added later. |
| **Plans/assistant-chat-design.md** | Defines **Dashboard warnings and Calls to Action (CtA)** and that they are **addressable via the chat Assistant**. HITL prompts are one type of CtA: when paused for approval, the Dashboard shows a CtA; the user can respond via the Assistant or a direct Dashboard control. See §16 there. |
| **Plans/newfeatures.md §20** | Summary and orchestrator integration: HITL is a **setting** only; visible grouping labels stay aligned with Plans/orchestrator-subagent-integration.md, while blocked-episode and package/seam gate semantics remain defined here and in the runtime contracts. |

## Derived Grouping Boundaries (DRY)


Tier boundaries are not a co-equal execution model.

Rules:
- approvals do not bind to `tier_id` as the canonical execution scope
- any surviving tier or phase labels are derived grouping/view concepts only
- approval and recovery flows bind to runtime blocked episodes anchored by `run_id`, `node_id`, `blocked_sequence`, and `attempt_id?`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md

## Package and Seam Completion Gates

The node-model rewrite uses package- and seam-scoped gates while preserving the same human approval affordances.

Canonical gate types:
- `package_complete_gate` — fires when all nodes in a package have completed. Conditions: all node statuses are in `{completed, skipped}`. Actions: run package-level verification and emit the canonical gate events from `Plans/Contracts_V0.md` with `gate_id = package_complete_gate`.
- `seam_complete_gate` — fires when a seam transition is needed. Conditions: the source package is completed and the target package prerequisites are met. Actions: validate cross-package contracts, transfer context, and emit the canonical gate events from `Plans/Contracts_V0.md` with `gate_id = seam_complete_gate`.

HITL approval behavior stays intact, but it now binds to these gate types. When HITL is enabled, the existing approve / decline / skip / abort flow applies after `package_complete_gate` or `seam_complete_gate` reaches its decision point.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md
## Settings Model

### Three Independent Toggles

| Setting | Scope | Default | Effect when ON |
|--------|--------|--------|----------------|
| **HITL at phase** | User-facing phase grouping | Off | Request approval at the corresponding package/seam gate decision point before the next phase grouping begins. |
| **HITL at task** | User-facing task grouping | Off | Request approval at the corresponding package/seam gate decision point before the next task grouping begins. |
| **HITL at subtask** | User-facing subtask grouping | Off | Request approval at the corresponding package/seam gate decision point before the next subtask grouping begins. |

- Each toggle is **independent**: e.g. phase-only, or task+subtask, or all three.
- Phase/task/subtask labels are configuration and display groupings only. They MUST NOT redefine `approval_scope_key`, blocked identity, recovery semantics, persistence ownership, or package/seam gate ownership.
- **Off by default:** No HITL pause unless the user explicitly enables one or more levels.
ContractRef: PolicyRule:Decision_Policy.md§4
- **Single source of truth:** These three settings live in one place in config (e.g. orchestrator or app config); GUI and run loop both read from that config. No duplicated semantics (DRY).
ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

### GUI: Primary Place to Turn On and Configure HITL
HITL is configured in the GUI and persisted in one canonical execution-affecting config block.

Canonical config shape:

```yaml
hitl:
  phase: false
  task: false
  subtask: false
```

Rules:
- this structure lives inside `GuiConfig`
- it is persisted in redb at `config:gui.hitl`
- GUI controls read and write this exact structure
- Option B runtime config construction copies this structure unchanged into the run snapshot at run start
- there is no second backend-only HITL key family for the same semantics

UI requirements:
- one visible place to enable or disable HITL per phase/task/subtask grouping
- phase/task/subtask toggles remain independent
- execution-affecting changes apply to the next run without requiring a restart

This section replaces any prior wording that left key names or config location to implementation-time choice.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md
### Run-Loop Integration (Conceptual)

1. Orchestrator may present Phase → Task → Subtask → Iteration grouping, with verification labels from Plans/orchestrator-subagent-integration.md, but those labels are display/configuration groupings rather than durable approval scope.
2. When a package or seam reaches its decision point:
   - If the matching HITL grouping setting is ON → **pause** through the canonical blocked episode. Show completion state and approval controls (see button labels below). On approval → emit the canonical approval and gate outcome events and advance according to the package/seam gate result.

    **HITL Button Labels (Resolved):**
    - **Primary action:** "Approve" or "Approve & Continue" is display copy for `allowed_action_id = approve`, dispatched as `cmd.runtime.approve`.
    - **Decline action:** "Decline" is the canonical display label for `allowed_action_id = decline`, dispatched as `cmd.runtime.decline`. Legacy "Reject" copy may appear only as compatibility text and MUST map to this action family.
    - **Recovery actions:** CtA buttons such as "Retry from safe point", "Start fresh attempt", "Resume after prerequisite", and "Replan" derive from the ordered `allowed_action_ids[]` for the blocked episode.
    - **Skip and abort actions:** "Skip node" maps to `allowed_action_id = skip_node`; "Abort run" maps to `allowed_action_id = abort_run`. Legacy "Skip" or "Cancel Run" copy is surface text only and MUST NOT create graph-local command semantics.
    - Button order follows the ordered `allowed_action_ids[]` from the runtime blocked episode; surfaces may group the primary approve/decline controls before recovery actions when the order is otherwise equivalent.

    **Action-label cleanup:** `Reject`, `Cancel Run`, and `Skip` are action-label surface copy over runtime action families, not canonical action names or separate command semantics.

    **On decline:** The run remains paused. The node is marked as blocked or needing review in the seglog with the same `run_id`, `node_id`, and `blocked_sequence`. A Call-to-Action (CtA) appears in the Assistant chat with runtime-derived options such as "Retry from safe point", "Skip node", "Replan", or "Abort run". The user must choose one of the advertised `allowed_action_ids[]` to proceed.

    **On abort:** The current run is aborted. The blocked episode and node execution context remain in lineage. All active subagents for this run receive a cancellation signal. The orchestrator returns to IDLE state. A runtime abort event is emitted with the node execution context.
3. The phase/task/subtask setting that requested the approval is retained as display/configuration context only; the blocked episode remains keyed by `run_id`, `node_id`, `blocked_sequence`, and `attempt_id?`.
4. Within an unresolved package or seam, the system continues autonomous execution until a package/seam gate or blocked episode reaches its decision point. HITL does not create a competing tier-only execution model.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md

### What the Human Sees and Does

- **At pause:** The UI should present that the current package/seam decision point or configured phase/task/subtask grouping is complete and that approval is required to continue. The user can review progress, logs, artifacts, or evidence as needed.
- **Approve:** "Approve" or "Approve & Continue" clears the pause through `cmd.runtime.approve` and allows the orchestrator to advance when the blocked episode is current.
- **Decline / Abort:** "Decline" maps to `cmd.runtime.decline` and surfaces the ordered runtime recovery actions. "Abort run" maps to `cmd.runtime.abort_run`; legacy "Reject" and "Cancel Run" labels are compatibility copy only. See §2 for full specification.

### Dashboard: Warnings and Calls to Action (CtA)

When the orchestrator is paused for HITL, the **Dashboard** must surface this as a **warning or Call to Action (CtA)** so the user is prompted to interact.
ContractRef: ContractName:Plans/assistant-chat-design.md

- **Dashboard role:** The Dashboard shows **warnings** and **Calls to Action** that need or benefit from user attention. HITL approval is one such CtA: e.g. "Phase X complete -- approval required to continue" or "Task Y done -- approve to proceed."
- **Addressable via Assistant:** These CtAs (including HITL prompts) can be **answered or addressed by the chat Assistant**. The user may:
  - Open the Assistant and respond there (e.g. "approve and continue," or ask for a summary before approving). The Assistant is the place where the user is prompted to interact with HITL when the Dashboard shows the CtA.
  - Or use a direct control on the Dashboard (e.g. "Approve & continue" button) if provided.
- **Single concept:** Warnings/CtAs live on the Dashboard; the Assistant is one way to address them. So HITL prompts appear as Dashboard CtAs and are explicitly addressable via the Assistant. See **Plans/assistant-chat-design.md** for Dashboard warnings/CtAs and Assistant integration.

### Relation to Existing Pause

The Plans/orchestrator-subagent-integration.md mentions a **pause gate** (`PAUSE.md` file) that halts the run until the file is removed or the user resumes. HITL is **separate**: it is a package-complete / seam-complete approval gate driven by settings, not by a global pause file. The two can coexist: global pause can still apply; HITL adds additional, gate-specific approval points when enabled.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md

## DRY Summary

- **Display grouping labels:** Use Plans/orchestrator-subagent-integration.md for Phase/Task/Subtask presentation and verification labels; do not let those labels redefine package/seam gate or blocked-episode identity in this plan or in code.
- **HITL settings:** One config schema and one set of three booleans; GUI and orchestrator both read from that single source.
- **Verification order:** HITL runs when the relevant package/seam gate reaches its decision point after the configured grouping's verification work is complete; no new verification concept is introduced, only a blocked-episode approval step.

## Implementation Hooks (Planning Only)

When implementing:

1. **Config:** Keep approval/blocking policy in the shared runtime config so GUI and runtime resolve the same blocked episode state.
2. **Runtime loop:** When a node reaches an approval prerequisite, transition into the canonical blocked episode flow and wait for a runtime action rather than a tier-local pause flag.
3. **Persistence:** Persist and restore the same blocked episode so restart, retry, skip, abort, and recovery actions stay attached to the original runtime identity.
4. **Dashboard CtAs:** Surface the blocked episode through Dashboard and Assistant without rewriting its identity or action set.

### Restart recovery and blocked-episode continuity


#### Acceptance carry-through
- Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- Carry usage switch-history and usage execution-role follow-through

### Approval Scope Key and provider-native correlation
- `approval_scope_key` is the durable blocked-episode scope key across actor, lane, run, node, and account context.
- The same scope key is reused across permissions, HITL, doom-loop handling, and session approval caching.
- Provider-native session or attempt identifiers live in dedicated correlation fields; canonical thread identity is not overloaded to carry provider correlation.
- Approval scope for one blocked episode is distinct from any broader session-wide policy scope.
- Approval and rejection events persist durable approver identity fields so audit history records who resolved the blocked episode.

### Tier-era compatibility retirement

- The legacy tier-era runtime canon is retired. The former runtime context, identifier, type, and collection labels, plus Phase-Task-Subtask wording, are compatibility-only display/grouping aliases and MUST NOT appear in runtime-owned blocked payloads, approval events, persistence records, cache keys, or recovery state.
- Canonical blocked-episode identity is `run_id` + `node_id` + `blocked_sequence`. Those fields own lookup, replay, restart recovery, audit joins, and resolver routing.
- Canonical blocked classification uses `concern_reason`. If additional detail is needed, it MUST be carried in dedicated structured metadata or `detail_ref?`; no legacy short-code survivor field remains in the live contract.
- Canonical action enumeration uses ordered `allowed_action_ids[]` only. Runtime, Dashboard, Assistant, and APIs MUST derive visible controls from that array and MUST NOT carry a second survivor array for blocked or recovery actions.
- Canonical approval resolution uses explicit outcome fields such as `approval_outcome` and `approval_recorded_at`, scoped by `approval_scope_key`. Continuation after review is represented by the recorded approval outcome, not by a separate legacy continue-decision field.
- Durable approver identity MUST be persisted with the resolution record via `approver_identity` or an equivalent durable approver principal field so audit history records who approved or declined the blocked episode.
- Blocked-episode recovery semantics are canonical. Retry, resume-after-prerequisite, skip, abort, replan, and safe-point restore behavior remain attached to the same `run_id` + `node_id` + `blocked_sequence` episode, and recovery affordances are derived from `allowed_action_ids[]`, `concern_reason`, and safe-point metadata rather than from any legacy recovery-option survivor fields.
- Any remaining phase/task/subtask labels may be rendered as explanatory UI copy, but they MUST NOT redefine approval scope, blocked identity, recovery semantics, or persistence ownership. `approval_scope_key` remains the only durable approval-scope handle for the blocked episode.

## HITL Retry and Safe-Point Clarification Addendum (2026-03-08)

### 1. HITL resolution wakes the scheduler

Approval/rejection resolution is a primary scheduler wake trigger.

Required behavior:
- `hitl.approved` / `hitl.rejected` must cause immediate queue reevaluation
- unrelated runnable work continues while a node is waiting on HITL

### 1A. HITL wait timers and long-governance waits

HITL approval waits consume the shared temporal taxonomy in Plans/Contracts_V0.md; this document does not redefine timeout classes.

Required rules:
- A pending approval is an `approval_wait` and may also be represented as a `long_governance_wait` (`long-governance-wait`) when policy declares the wait intentionally long.
- While an approval wait has a known future-timestamp or active user-visible timer, HITL surfaces MUST NOT render it as generic `deadlock/stall`, MUST NOT show stall banners, and MUST NOT auto-pause unrelated runnable work.
- Expiry of a user-facing approval countdown maps to `user_visible_wait_timer_expiry` (`user-visible wait timer expiry`); it keeps the same `run_id`, `node_id`, `blocked_sequence`, and `approval_scope_key`.
- Approval resolution, decline, expiry, restart recovery, retry, skip, and abort continue to use the canonical blocked episode identity rather than minting a separate timer-local request.

### 2. Re-run semantics after reject

`Re-run` cannot remain ambiguous.

Required rule:
- the rejection CTA must declare whether the rerun is `retry_from_safe_point` or `fresh_attempt`
- default should be `retry_from_safe_point` for mutation-capable attempts when a valid safe point exists
- if no safe point exists or the execution unit is explicitly non-recoverable, use `fresh_attempt`

### 3. Skip semantics

`Skip` must preserve lineage.

Required rule:
- the skipped attempt remains in history
- the UI must show that the user chose to advance without rerunning the rejected execution unit
- downstream behavior must obey graph semantics and any declared skip policy; skip is not silent success

### 4. Abort semantics

Abort terminates the run and preserves the full paused/rejected lineage.

### 5. Acceptance criteria

- HITL resolution immediately wakes scheduling.
- Rerun semantics are explicit about safe-point vs fresh attempt.
- Skip preserves lineage rather than masquerading as a passed attempt.
- Abort preserves audit history.
## Canonical HITL Recovery Action Alignment Addendum (2026-03-09)

HITL actions must be canonical across graph, orchestrator, and chat surfaces.

### Allowed action families
Depending on classification, the canonical action families are:
- `approve`
- `decline`
- `retry_now`
- `resume_after_prerequisite`
- `skip_node`
- `abort_run`
- `replan`
- `restore_safe_point_then_retry`

### Action gating rules
- `approve` / `decline` apply to external-side-effect gates and review approvals
- `resume_after_prerequisite` applies to auth recovery, policy change, or other prerequisite fulfillment
- `restore_safe_point_then_retry` is required when policy says rollback is needed before rerun
- `skip_node` is legal only when the node contract explicitly permits skip without violating graph integrity
- `replan` replaces retry when classification is `replan_required`

### Consistency rule
All surfaces MUST use the same action names, meanings, and enablement conditions. A surface may hide an action for layout reasons, but it MUST NOT rename or reinterpret it.

### Approval resolution and rerun semantics


Rules:
- waiting for approval is a blocked state with `blocked_reason_code = waiting_approval`
- approval resolution emits `node.prerequisite_resolved` and wakes scheduling in the same cycle
- when a valid safe point exists for a mutation-capable attempt, the default rerun affordance is `Retry from safe point`
- if no valid safe point exists or policy forbids restore, the explicit alternative is `Start fresh attempt`
- `Skip` remains a separate graph policy action and never masquerades as success

### Canonical visible labels
HITL surfaces MUST use the canonical runtime action families and labels.

- `Approve`
- `Decline`
- `Retry from safe point`
- `Start fresh attempt`
- `Resume after prerequisite`
- `Replan`
- `Skip node`
- `Abort run`

`Reject`, `Deny`, and other variants may remain internal or domain-specific copy, but they MUST map back to the canonical action families above.

### Re-run after decline
After decline/reject, the surface MUST choose among:
- `Retry from safe point` when a valid safe point exists and policy allows restore
- `Start fresh attempt` when no valid safe point exists or policy forbids restore
- `Replan` when the canonical classification is `replan_required`
- `Skip node` only when the node contract explicitly allows skip without violating graph integrity
- Debug verification reruns the same named-action scenario in the active isolated automation session unless corrupted state requires a fresh isolated session.

## Shared approval-ladder alignment (2026-04-04)

HITL-specific affordances consume the shared permission ladder instead of defining a shorter local approval menu.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md

Required alignment:
- approval choices are `deny`, `once`, `for session`, `always`
- batch web review may present one domain-grouped approval surface
- `question` defaults to `allow` only when HITL is available; otherwise it remains ask-gated
- HITL surfaces do not create a competing approval vocabulary
- As an approval/ask-flow consumer, HITL MUST preserve repaired permission/question/terminal block handling exactly: permission prompts, question prompts, and terminal blocked states all resolve through the shared permission ladder and blocked-episode model rather than drifting into local-only action names or terminal-only approval behavior.
- The same alignment applies to `/ask-flow` and `/question/terminal` routes: they are consumer labels over the shared question, permission, and terminal blocked-episode model, not independent HITL-only state machines.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/human-in-the-loop.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### HITL-002 - HITL Doc Authority, Status, And Compatibility Vocabulary

```yaml
plan_unit_id: HITL-002
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: The HITL document is plan-only canonical owner-section text for Human-in-the-Loop behavior, keeps Puppet Master compliance and deterministic-default rules, and treats compatibility-only source vocabulary as noncanonical while preserving HITL behavior, settings model, run-loop integration, and DRY alignment as plan scope.
gui_related: false
gui_classification_reason: This unit defines document authority, status, and compatibility vocabulary rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-002 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: hitl_doc_authority_status_and_compatibility_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0007
preserved_exact_tokens:
- Human-in-the-Loop (HITL) Mode -- Plan
- Canonical owner-section requirements
- Retire tier-era canon and shadow fields
- Approval scope key and approver identity
- PLAN DOCUMENT ONLY
- HITL behavior and tier-boundary semantics
- Settings model
- Integration points with the orchestrator run loop
- DRY alignment
negative_constraints: []
compatibility_only_notes:
- Compatibility-only source vocabulary is noncanonical; live wording uses owner terminology.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-003 - Rewrite-Aligned HITL Event Semantics

```yaml
plan_unit_id: HITL-003
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: HITL approvals are explicit events in the unified event model and seglog ledger; Pause for approval must be reproducible and replayable through event stream and projections, while UI can change in the Slint rewrite without changing blocked-runtime, package-complete, seam-complete, or mandatory side-effect approval requirements. Tier-boundary wording is compatibility lineage only.
gui_related: false
gui_classification_reason: This unit defines event/persistence semantics, not visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-003 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: rewrite_aligned_hitl_event_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0008
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:7
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/decisions.jsonl:7
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:13
preserved_exact_tokens:
- Rewrite alignment (2026-02-21)
- unified event model
- seglog ledger
- Pause for approval
- reproducible/replayable
- event stream + projections
- Slint rewrite
- tier-boundary meaning and approval requirements
negative_constraints:
- UI can change, but blocked-runtime, package-complete, seam-complete, and mandatory side-effect approval requirements must not.
compatibility_only_notes:
- Tier-boundary wording remains compatibility lineage only.
stale_retired_dispositions:
- tier-boundary meaning and approval requirements is retired as live canon wording; tier-boundary examples remain display/compatibility copy.
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-004 - Canonical Blocked-Runtime HITL Request Contract

```yaml
plan_unit_id: HITL-004
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: The canonical HITL contract remains a blocked-runtime overlay with run_id, node_id, blocked_sequence, optional attempt_id, blocked_reason_code, ordered allowed_action_ids, approval_scope_key, optional detail_ref, and optional approver_identity; blocked_sequence is the canonical approval anchor and action_available rows derive from the same blocked-runtime action set.
gui_related: false
gui_classification_reason: This unit defines runtime request fields and identity semantics rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-004 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: canonical_blocked_runtime_hitl_request_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0009
preserved_exact_tokens:
- blocked-runtime overlay
- run_id
- node_id
- blocked_sequence
- attempt_id?
- blocked_reason_code
- allowed_action_ids[]
- approval_scope_key
- detail_ref?
- approver_identity?
- action_available
negative_constraints:
- allowed_action_ids[] stay ordered and runtime-owned.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-005 - Shared-Runtime Attribution And Lane/Account Provenance

```yaml
plan_unit_id: HITL-005
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: HITL is the approval consumer for shared-runtime multi-lane execution and must preserve effective_account_id, requested account fields, execution_role, permission posture, actor identity, lane identity, attempt_id, account/role, package/lane/attempt, and safely scoped always policy so later review can attribute who asked and who approved.
gui_related: false
gui_classification_reason: This unit defines attribution and provenance fields, not GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-005 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: shared_runtime_attribution_and_lane_account_provenance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0010
preserved_exact_tokens:
- shared-runtime
- multi-lane execution
- effective_account_id
- requested_account
- requested_account_id
- execution_role
- permission posture
- actor identity
- lane identity
- attempt_id
- /account/role
- /package/lane/attempt
- /always
negative_constraints:
- Post-hoc explanations that omit these fields are under-attributed and lane-unsafe.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-006 - Blocked-Episode Persistence And Approval Identity Join

```yaml
plan_unit_id: HITL-006
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Runtime HITL persistence is keyed by blocked episode identity first; checkpoints.hitl.{run_id} and checkpoints.hitl are compatibility paths only, and runtime storage must distinguish concurrent pending HITL episodes by run_id, node_id, blocked_sequence, optional attempt_id, approval_scope_key, actor/account/lane context, and approver identity while supporting a three-way join among the blocked episode, approval identity record, and triggering tool request.
gui_related: false
gui_classification_reason: This unit defines persistence and join semantics, not GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-006 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: blocked_episode_persistence_and_approval_identity_join
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0010
preserved_exact_tokens:
- checkpoints.hitl.{run_id}
- checkpoints.hitl
- blocked episode identity
- run_id
- node_id
- blocked_sequence
- attempt_id?
- approval_scope_key
- actor/account/lane context
- approver identity
- three-way join
negative_constraints: []
compatibility_only_notes:
- checkpoints.hitl.{run_id} and checkpoints.hitl are compatibility paths only.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-007 - Request-Era Compatibility Bridge And Axis Separation

```yaml
plan_unit_id: HITL-007
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: The historical HITLRequest request-era contract is a compatibility bridge subordinate to the runtime blocked episode; request_id, tier_id, tier_type, request_kind=tier_boundary_approval, allowed_actions, allowed_actions[], tier/request_kind/allowed_actions, and hitl.approval_requested must not become a second action family, and HITL classification keeps source, request, and execution/result axes separate.
gui_related: false
gui_classification_reason: This unit records compatibility and classification constraints rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-007 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: request_era_compatibility_bridge_and_axis_separation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0010
preserved_exact_tokens:
- HITLRequest
- request_id
- tier_id
- tier_type
- request_kind = tier_boundary_approval
- allowed_actions
- allowed_actions[]
- /tier/request_kind/allowed_actions
- hitl.approval_requested
- source axis
- request axis
- execution/result axis
negative_constraints:
- allowed_actions must not become a second action family.
- A result or execution outcome must not become request identity or source identity.
compatibility_only_notes:
- The request-era contract remains documented only as a compatibility bridge.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-008 - Automation-First Boundary Model

```yaml
plan_unit_id: HITL-008
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: HITL settings are automation-first and off by default unless explicitly enabled for phase, task, or subtask groupings; live approval can be package/seam/lane-bound, package_complete_gate and seam_complete_gate outcomes replace tier-local pauses, and mandatory and optional cases such as Docker repo creation, FileSafe approvals, Multi-Pass review, wizard attention-required, and graph-level HITL share one boundary model.
gui_related: true
gui_classification_reason: This unit governs user-visible HITL grouping behavior and approval boundaries.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-008 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: automation_first_boundary_model
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0010
preserved_exact_tokens:
- automation-first
- OFF by default
- <phase>/<task>/<subtask>
- /task/subtask
- /package/seam/lane-bound
- /seam-aware
- package_complete_gate
- seam_complete_gate
- Docker repo creation
- FileSafe approvals
- Multi-Pass review
- wizard attention-required
- graph-level HITL
negative_constraints:
- Phase/task/subtask labels are display/configuration labels only.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-009 - Clarification Metadata And Event-To-Surface Routing

```yaml
plan_unit_id: HITL-009
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Clarification questions and blocked-resolution flows use node-effective execution metadata, palette-friendly copy, and detail pivots without losing runtime truth; UI and storage routes must not cross-wire governance approvals with tool approvals, and hitl.* event rows carry config, run.started, usage.event, actor projections, meta links, action-family normalization, and current blocked-episode mutation binding.
gui_related: true
gui_classification_reason: This unit includes palette copy, route/surface behavior, and user-visible approval routing.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-009 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: clarification_metadata_and_event_to_surface_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0010
preserved_exact_tokens:
- node-effective execution metadata
- provider
- model
- effort
- /model/effort
- /detail/history/ledger/evidence
- hitl.*
- /config
- run.started
- usage.event
- /role-aware
- /meta
- /families
- /action-family
- current blocked episode
negative_constraints:
- UI and storage routes must not cross-wire governance approvals with tool approvals.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-010 - Runtime-Native Ontology, Graph Shims, Session Scope, And Object-Open Boundaries

```yaml
plan_unit_id: HITL-010
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: HITL blocked/runtime semantics use blocked-episode and runtime-native ontology; graph-local HITL commands are compatibility shims that resolve through blocked_sequence before mutation, session copy is display/provider context only, object-open requests for runtime artifacts use open-by-identity with artifact envelopes, and compatibility labels must be explicit.
gui_related: true
gui_classification_reason: This unit covers graph command shims, session copy, object-open routing, and visible compatibility labels.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-010 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: runtime_native_ontology_graph_shims_session_scope_and_object_open_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0010
preserved_exact_tokens:
- blocked-episode
- /runtime-native
- /tier-boundary-native
- cmd.graph.approve_hitl
- cmd.graph.deny_hitl
- hitl_request_id
- request_id
- blocked_sequence
- session
- OpenFile
- PathBuf
- target_group
- open-by-identity
- HITL tier-boundary approvals
- TierContext
- Run_Modes
negative_constraints:
- The plan must not preserve two competing approval/blocked ontologies.
- Session copy must not overload scope meanings.
- HITL, object-open, and runtime surfaces must not invent custom argument families for each destination.
compatibility_only_notes:
- Graph-local HITL commands remain compatibility shims over runtime actions.
- Compatibility labels must be explicit.
stale_retired_dispositions:
- Run_Graph_View and usage-feature tier_id correlation is stale compatibility metadata over blocked episode identity.
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-011 - Consequential Transition Reports And Recovery Label Normalization

```yaml
plan_unit_id: HITL-011
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Consequential approval and recovery transitions use a shared transition report with from/to state, target object, actor/source, reason, prerequisite evidence, review or corroboration references, and downstream obligations; recovery labels distinguish true Undo from Restore, Rollback, Retry from Safe Point, Reopen, Start fresh attempt, and compensating_action_only behavior.
gui_related: true
gui_classification_reason: This unit governs user-visible transition and recovery labels.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-011 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: consequential_transition_reports_and_recovery_label_normalization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0011
preserved_exact_tokens:
- state transition report
- /source
- projection-trust
- Undo
- Restore
- Rollback
- Retry from Safe Point
- Reopen
- compensating_action_only
- /dismiss
- Create New Lane
- Re-request Promotion
- Reapply
- Start fresh attempt
negative_constraints:
- Restore language must not mint another recovery action family.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-012 - Tray Scope, Provider-Native Correlation, And Execution-Core Compatibility

```yaml
plan_unit_id: HITL-012
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: System tray notifications remain narrow, provider-native approval correlation preserves provider IDs, provider, and attempt/account/trust metadata without overloading runtime thread identity, GUI concern-model and projection-health requirements are HITL consumers, and Builder, Verifier, Overseer, Phase to Task to Subtask to Iteration, TierContext, tier-boundary, and tier-keyed labels are compatibility/display context only.
gui_related: true
gui_classification_reason: This unit governs user-visible tray scope, GUI concern/projection rendering, and displayed compatibility labels.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-012 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: tray_scope_provider_native_correlation_and_execution_core_compatibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0011
preserved_exact_tokens:
- /tray
- HITL approval required
- run complete
- major failure requiring attention
- /pressure
- rate-limit
- provider-native IDs
- /provider
- /attempt/account/trust
- GUI concern-model
- projection-health
- degraded-trust
- Builder
- Verifier
- Overseer
- Phase -> Task -> Subtask -> Iteration
- allowed_action_ids[]
negative_constraints:
- Tray copy is not the owner for approval identity, allowed actions, or recovery semantics.
compatibility_only_notes:
- Execution-core labels may describe roles; graph/runtime ownership wins.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-013 - Debug Front-Door Grants

```yaml
plan_unit_id: HITL-013
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Debug Mode may request a run-scoped front-door grant for repeated low-risk investigation actions, but the grant remains represented through the canonical blocked-runtime overlay, is anchored by the blocked episode and investigation identity, does not create a separate approval transport, preserves degraded/blocked continuation when declined, limits scope to low-risk evidence reads and declared temporary instrumentation, and is revoked on grant revocation or investigation finish.
gui_related: false
gui_classification_reason: This unit defines debug approval scope and runtime grant behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-013 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: debug_front_door_grants
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0012
preserved_exact_tokens:
- Debug Mode
- run-scoped front-door grant
- low-risk investigation actions
- canonical blocked-runtime overlay
- blocked episode
- investigation identity
- degraded or blocked state
- low-risk evidence reads
- declared-scope temporary instrumentation
- agent_session
negative_constraints:
- Debug Mode does not invent a separate approval transport.
- High-risk mutations, auth/state mutation, publish-side effects, and explicit-confirmation actions still require their own confirmations.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md'
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/GitHub_Integration.md'
```

### HITL-014 - Optional HITL UX And Autonomy Rule

```yaml
plan_unit_id: HITL-014
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Human-in-the-Loop mode is an optional product UX feature for package or seam decision-point approvals when explicitly enabled, with all HITL toggles off by default; HITL must not be required for correctness, verification, or progression gates, and autonomous runs proceed deterministically without human approvals.
gui_related: true
gui_classification_reason: This unit defines optional user-facing HITL UX and autonomy behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-014 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: optional_hitl_ux_and_autonomy_rule
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0013
preserved_exact_tokens:
- Human-in-the-Loop (HITL) mode
- package or seam decision points
- phase
- task
- subtask
- off by default
- Critical autonomy rule
- MUST NOT
- correctness
- verification
- progression gates
- autonomous runs
negative_constraints:
- HITL must not be required for correctness, verification, or progression gates.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: PolicyRule:Decision_Policy.md§4, Gate:GATE-001'
```

### HITL-015 - Derived Grouping Boundaries

```yaml
plan_unit_id: HITL-015
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Tier boundaries are not a co-equal execution model; approvals do not bind to tier_id, surviving tier or phase labels are derived grouping/view concepts only, and approval and recovery bind to blocked runtime episodes anchored by run_id, node_id, blocked_sequence, and optional attempt_id.
gui_related: true
gui_classification_reason: This unit governs displayed phase/task/subtask grouping labels and their non-authority over runtime scope.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-015 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: derived_grouping_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0015
preserved_exact_tokens:
- Derived Grouping Boundaries (DRY)
- Tier boundaries
- tier_id
- derived grouping/view concepts
- run_id
- node_id
- blocked_sequence
- attempt_id?
negative_constraints:
- Approvals do not bind to tier_id as the canonical execution scope.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md'
```

### HITL-016 - Package And Seam Completion Gates

```yaml
plan_unit_id: HITL-016
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: The node-model rewrite uses package_complete_gate and seam_complete_gate as canonical gate types; package gates fire when all nodes are completed or skipped and run package verification, seam gates fire when seam transitions are needed and validate cross-package contracts, and HITL approval behavior binds to these gate types while keeping approve, decline, skip, and abort flow intact.
gui_related: false
gui_classification_reason: This unit defines runtime gate semantics rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-016 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: package_and_seam_completion_gates
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0016
preserved_exact_tokens:
- package_complete_gate
- seam_complete_gate
- '{completed, skipped}'
- package-level verification
- cross-package contracts
- gate_id = package_complete_gate
- gate_id = seam_complete_gate
- approve / decline / skip / abort
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md'
```

### HITL-017 - Independent HITL Grouping Toggles

```yaml
plan_unit_id: HITL-017
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: HITL exposes three independent user-facing grouping toggles for phase, task, and subtask, all defaulting off; toggles request approval at the corresponding package/seam gate decision point before the next grouping begins and must not redefine approval_scope_key, blocked identity, recovery semantics, persistence ownership, or package/seam gate ownership.
gui_related: true
gui_classification_reason: This unit defines visible settings toggles and their runtime boundary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-017 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: independent_hitl_grouping_toggles
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0018
preserved_exact_tokens:
- HITL at phase
- HITL at task
- HITL at subtask
- 'Off'
- phase-only
- task+subtask
- all three
- approval_scope_key
- blocked identity
- recovery semantics
- persistence ownership
negative_constraints:
- Phase/task/subtask labels must not redefine approval_scope_key, blocked identity, recovery semantics, persistence ownership, or package/seam gate ownership.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: PolicyRule:Decision_Policy.md§4'
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### HITL-018 - GUI Config Persistence And Run Snapshot

```yaml
plan_unit_id: HITL-018
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: HITL is configured in the GUI and persisted in one canonical execution-affecting config block shaped as hitl.phase, hitl.task, and hitl.subtask; the structure lives inside GuiConfig, persists in redb at config:gui.hitl, GUI controls read and write the exact structure, Option B runtime config construction copies it unchanged into the run snapshot at run start, and no second backend-only HITL key family exists.
gui_related: true
gui_classification_reason: This unit defines GUI configuration, persistence, and run snapshot behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-018 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: gui_config_persistence_and_run_snapshot
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0019
preserved_exact_tokens:
- 'GUI: Primary Place to Turn On and Configure HITL'
- 'hitl:'
- 'phase: false'
- 'task: false'
- 'subtask: false'
- GuiConfig
- redb
- config:gui.hitl
- Option B
- run snapshot
- no second backend-only HITL key family
negative_constraints:
- There is no second backend-only HITL key family for the same semantics.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md'
```

### HITL-019 - Run-Loop Pause Through Blocked Episode

```yaml
plan_unit_id: HITL-019
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: At package or seam decision points, enabled HITL groupings pause through the canonical blocked episode, show completion state and approval controls, emit canonical approval and gate outcome events on approval, retain the grouping as display/configuration context only, and continue autonomous execution until a package/seam gate or blocked episode reaches its decision point.
gui_related: true
gui_classification_reason: This unit governs visible pause/approval controls and runtime run-loop behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-019 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: run_loop_pause_through_blocked_episode
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0020
preserved_exact_tokens:
- Run-Loop Integration
- Phase → Task → Subtask → Iteration
- package or seam
- decision point
- pause
- canonical blocked episode
- approval controls
- canonical approval and gate outcome events
- display/configuration context
- no competing tier-only execution model
negative_constraints:
- HITL does not create a competing tier-only execution model.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md'
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-020 - Runtime Action Labels, Decline/Abort Lineage, And Human Controls

```yaml
plan_unit_id: HITL-020
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: 'HITL controls use runtime action labels and families: Approve or Approve & Continue dispatches cmd.runtime.approve, Decline dispatches cmd.runtime.decline, recovery actions derive from ordered allowed_action_ids, Skip node maps to skip_node, Abort run maps to abort_run, legacy Reject, Skip, and Cancel Run are compatibility copy only, decline keeps the run paused with the same run_id/node_id/blocked_sequence, and abort preserves blocked episode and node execution lineage.'
gui_related: true
gui_classification_reason: This unit governs user-facing button labels, controls, and visible decline/abort behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-020 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: runtime_action_labels_decline_abort_lineage_and_human_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0020
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0021
preserved_exact_tokens:
- Approve
- Approve & Continue
- cmd.runtime.approve
- Decline
- cmd.runtime.decline
- Retry from safe point
- Start fresh attempt
- Resume after prerequisite
- Replan
- Skip node
- allowed_action_id = skip_node
- Abort run
- allowed_action_id = abort_run
- allowed_action_ids[]
- Reject
- Cancel Run
- What the Human Sees and Does
negative_constraints:
- Legacy Skip or Cancel Run copy must not create graph-local command semantics.
compatibility_only_notes:
- Reject, Cancel Run, and Skip are action-label surface copy over runtime action families.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md'
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-021 - Dashboard CtA And Assistant Addressability

```yaml
plan_unit_id: HITL-021
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: When Orchestrator pauses for HITL, Dashboard surfaces the state as a warning or Call to Action, and HITL prompts are addressable through the chat Assistant or direct Dashboard controls while remaining a single concept owned by Dashboard warning/CtA and Assistant integration.
gui_related: true
gui_classification_reason: This unit governs visible Dashboard warnings, calls to action, Assistant response, and direct controls.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-021 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: dashboard_cta_and_assistant_addressability
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0022
preserved_exact_tokens:
- Dashboard
- Warnings
- Calls to Action
- CtA
- Phase X complete -- approval required to continue
- Task Y done -- approve to proceed
- Assistant
- approve and continue
- Approve & continue
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md'
```

### HITL-022 - HITL Gate, Global Pause, And DRY Summary

```yaml
plan_unit_id: HITL-022
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: 'HITL is separate from the global PAUSE.md pause gate: global pause can coexist, while HITL adds package-complete or seam-complete approval points when enabled. DRY alignment keeps Phase/Task/Subtask labels from redefining blocked identity, uses one config schema shared by GUI and Orchestrator, and introduces only a blocked-episode approval step after existing verification work.'
gui_related: true
gui_classification_reason: This unit covers user-facing pause/gate distinction and GUI/runtime DRY alignment.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-022 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: hitl_gate_global_pause_and_dry_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0023
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0024
preserved_exact_tokens:
- PAUSE.md
- global pause
- package-complete / seam-complete approval gate
- Display grouping labels
- Phase/Task/Subtask
- one config schema
- GUI and orchestrator
- Verification order
- no new verification concept
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-023 - Implementation Hooks For Config, Runtime, Persistence, And Dashboard

```yaml
plan_unit_id: HITL-023
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Implementation planning hooks require shared runtime config for approval/blocking policy, transition into canonical blocked episode flow rather than tier-local pause flags, persistence and restore of the same blocked episode so restart, retry, skip, abort, and recovery actions stay attached to original runtime identity, and Dashboard/Assistant surfacing without rewriting identity or action set.
gui_related: true
gui_classification_reason: This unit includes implementation-facing hooks for visible Dashboard/Assistant HITL surfacing and runtime integration.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-023 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: implementation_hooks_for_config_runtime_persistence_and_dashboard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0025
preserved_exact_tokens:
- Implementation Hooks (Planning Only)
- Config
- Runtime loop
- Persistence
- Dashboard CtAs
- shared runtime config
- canonical blocked episode flow
- tier-local pause flag
- persist and restore
- restart
- retry
- skip
- abort
- Dashboard and Assistant
negative_constraints:
- Dashboard and Assistant must surface the blocked episode without rewriting its identity or action set.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-024 - Restart Recovery Carry-Through And Approval Scope Correlation

```yaml
plan_unit_id: HITL-024
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Acceptance carry-through transfers execution_role, requested_account_id, operational_identity, account switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs; approval_scope_key is the durable blocked-episode scope key across actor, lane, run, node, and account context, reused across permissions, HITL, doom-loop handling, and session approval caching, while provider-native correlation lives in dedicated fields and approver identity persists durably.
gui_related: false
gui_classification_reason: This unit defines restart recovery, approval-scope identity, provider correlation, and audit persistence rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-024 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: restart_recovery_carry_through_and_approval_scope_correlation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0027
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0028
preserved_exact_tokens:
- execution_role
- requested_account_id
- operational_identity
- account-switch
- pressure ownership
- blocked_sequence
- startup recovery handshake
- DAE jail/approval policy
- approval_scope_key
- actor
- lane
- run
- node
- account context
- doom-loop handling
- session approval caching
- approver identity
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-025 - Tier-Era Payload Retirement And Canonical Blocked Identity

```yaml
plan_unit_id: HITL-025
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Legacy tier-era runtime context, identifier, type, collection labels, and Phase-Task-Subtask wording are retired compatibility-only display/grouping aliases that must not appear in runtime-owned blocked payloads, approval events, persistence records, cache keys, or recovery state; canonical blocked-episode identity is run_id plus node_id plus blocked_sequence and owns lookup, replay, restart recovery, audit joins, and resolver routing.
gui_related: false
gui_classification_reason: This unit defines runtime payload identity and retired compatibility vocabulary rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-025 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: tier_era_payload_retirement_and_canonical_blocked_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0029
preserved_exact_tokens:
- Tier-era compatibility retirement
- legacy tier-era runtime canon
- Phase-Task-Subtask
- compatibility-only display/grouping aliases
- run_id
- node_id
- blocked_sequence
- lookup
- replay
- restart recovery
- audit joins
- resolver routing
negative_constraints:
- Legacy tier-era labels must not appear in runtime-owned blocked payloads, approval events, persistence records, cache keys, or recovery state.
compatibility_only_notes: []
stale_retired_dispositions:
- The legacy tier-era runtime canon is retired.
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-026 - Blocked Classification, Action Enumeration, And Approval Outcome Identity

```yaml
plan_unit_id: HITL-026
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Canonical blocked classification uses concern_reason with optional detail_ref for additional structured metadata; ordered allowed_action_ids is the only canonical action enumeration for Runtime, Dashboard, Assistant, and APIs; canonical approval resolution uses approval_outcome and approval_recorded_at scoped by approval_scope_key, and durable approver_identity records who approved or declined.
gui_related: true
gui_classification_reason: This unit governs visible controls derived from allowed_action_ids and approval outcome identity.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-026 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: blocked_classification_action_enumeration_and_approval_outcome_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0029
preserved_exact_tokens:
- concern_reason
- detail_ref?
- allowed_action_ids[]
- Runtime
- Dashboard
- Assistant
- APIs
- approval_outcome
- approval_recorded_at
- approval_scope_key
- approver_identity
negative_constraints:
- No legacy short-code survivor field remains in the live contract.
- Runtime, Dashboard, Assistant, and APIs must not carry a second survivor array for blocked or recovery actions.
compatibility_only_notes:
- Canonical approval resolution is represented by recorded approval outcome, not a legacy continue-decision field.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-027 - Recovery Semantics And Phase/Task Label Compatibility

```yaml
plan_unit_id: HITL-027
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: 'Blocked-episode recovery semantics are canonical: retry, resume-after-prerequisite, skip, abort, replan, and safe-point restore remain attached to the same run_id/node_id/blocked_sequence episode, with affordances derived from allowed_action_ids, concern_reason, and safe-point metadata; remaining phase/task/subtask labels may render as explanatory UI copy but must not redefine approval scope, blocked identity, recovery semantics, or persistence ownership.'
gui_related: true
gui_classification_reason: This unit governs visible recovery affordances and explanatory grouping copy.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-027 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: recovery_semantics_and_phase_task_label_compatibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0029
preserved_exact_tokens:
- retry
- resume-after-prerequisite
- skip
- abort
- replan
- safe-point restore
- run_id + node_id + blocked_sequence
- allowed_action_ids[]
- concern_reason
- safe-point metadata
- phase/task/subtask labels
- approval_scope_key
negative_constraints:
- Phase/task/subtask labels must not redefine approval scope, blocked identity, recovery semantics, or persistence ownership.
compatibility_only_notes:
- Remaining phase/task/subtask labels are explanatory UI copy only.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
split_recommendation_reason: The source span contains multiple separable HITL concerns; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-028 - Scheduler Wake And Approval Wait Timers

```yaml
plan_unit_id: HITL-028
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: 'HITL approval/rejection resolution is a primary scheduler wake trigger: hitl.approved and hitl.rejected cause immediate queue reevaluation while unrelated runnable work continues; approval waits consume the shared temporal taxonomy as approval_wait and possibly long_governance_wait, known timers must not render generic deadlock/stall or auto-pause unrelated runnable work, and user_visible_wait_timer_expiry keeps the same blocked episode identity.'
gui_related: true
gui_classification_reason: This unit includes user-visible wait timers and scheduler wake behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-028 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: scheduler_wake_and_approval_wait_timers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0031
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0032
preserved_exact_tokens:
- hitl.approved
- hitl.rejected
- immediate queue reevaluation
- unrelated runnable work
- approval_wait
- long_governance_wait
- long-governance-wait
- deadlock/stall
- stall banners
- user_visible_wait_timer_expiry
- user-visible wait timer expiry
- run_id
- node_id
- blocked_sequence
- approval_scope_key
negative_constraints:
- HITL surfaces must not render known approval waits as generic deadlock/stall, must not show stall banners, and must not auto-pause unrelated runnable work.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-029 - Reject Rerun, Skip, Abort, And Acceptance Criteria

```yaml
plan_unit_id: HITL-029
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: After reject, Re-run must declare retry_from_safe_point or fresh_attempt, defaulting to retry_from_safe_point for mutation-capable attempts with a valid safe point and using fresh_attempt when no safe point exists or recovery is forbidden; Skip preserves lineage and shows the user advanced without rerunning, downstream behavior obeys graph policy, Abort terminates the run while preserving paused/rejected lineage, and acceptance criteria require scheduler wake, explicit rerun semantics, skip lineage, and abort audit history.
gui_related: true
gui_classification_reason: This unit governs visible rerun/skip/abort choices and their audit behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-029 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: reject_rerun_skip_abort_and_acceptance_criteria
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0033
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0034
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0035
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0036
preserved_exact_tokens:
- Re-run
- retry_from_safe_point
- fresh_attempt
- valid safe point
- mutation-capable attempts
- Skip
- skipped attempt remains in history
- UI must show
- advance without rerunning
- graph semantics
- Abort
- full paused/rejected lineage
- Acceptance criteria
negative_constraints:
- Skip is not silent success.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-030 - Canonical Recovery Action Families

```yaml
plan_unit_id: HITL-030
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: HITL actions are canonical across graph, Orchestrator, and chat surfaces; allowed action families are approve, decline, retry_now, resume_after_prerequisite, skip_node, abort_run, replan, and restore_safe_point_then_retry.
gui_related: false
gui_classification_reason: This unit defines canonical action families and naming semantics rather than GUI layout.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-030 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: canonical_recovery_action_families
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0037
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0038
preserved_exact_tokens:
- Canonical HITL Recovery Action Alignment Addendum (2026-03-09)
- approve
- decline
- retry_now
- resume_after_prerequisite
- skip_node
- abort_run
- replan
- restore_safe_point_then_retry
- graph
- orchestrator
- chat surfaces
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-031 - Recovery Action Gating And Surface Consistency

```yaml
plan_unit_id: HITL-031
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Recovery action gating keeps approve/decline for side-effect gates and review approvals, resume_after_prerequisite for auth or policy prerequisites, restore_safe_point_then_retry when rollback is required, skip_node only when graph integrity permits it, and replan when classification is replan_required; all surfaces must use the same action names, meanings, and enablement conditions, and may hide actions for layout but must not rename or reinterpret them.
gui_related: true
gui_classification_reason: This unit governs visible action availability and cross-surface consistency.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-031 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: recovery_action_gating_and_surface_consistency
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0039
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0040
preserved_exact_tokens:
- approve
- decline
- external-side-effect gates
- resume_after_prerequisite
- auth recovery
- policy change
- restore_safe_point_then_retry
- skip_node
- graph integrity
- replan
- replan_required
- same action names
- enablement conditions
negative_constraints:
- A surface may hide an action for layout reasons, but it must not rename or reinterpret it.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-032 - Approval Resolution And Rerun Event Semantics

```yaml
plan_unit_id: HITL-032
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Waiting for approval is a blocked state with blocked_reason_code=waiting_approval; approval resolution emits node.prerequisite_resolved and wakes scheduling in the same cycle, valid safe points default to Retry from safe point for mutation-capable attempts, Start fresh attempt is the explicit alternative when no valid safe point exists or policy forbids restore, and Skip remains a separate graph policy action that never masquerades as success.
gui_related: true
gui_classification_reason: This unit defines visible rerun affordances and event semantics after approval resolution.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-032 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: approval_resolution_and_rerun_event_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0041
preserved_exact_tokens:
- blocked_reason_code = waiting_approval
- node.prerequisite_resolved
- same cycle
- Retry from safe point
- Start fresh attempt
- Skip
- graph policy action
- never masquerades as success
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-033 - Visible Labels And Decline/Reject Follow-Up Choices

```yaml
plan_unit_id: HITL-033
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: HITL surfaces use canonical visible labels Approve, Decline, Retry from safe point, Start fresh attempt, Resume after prerequisite, Replan, Skip node, and Abort run; Reject, Deny, and other variants map back to canonical action families, and after decline/reject the surface chooses among safe-point retry, fresh attempt, Replan, Skip node only when permitted, or debug verification rerun in the active isolated automation session unless corrupted state requires a fresh isolated session.
gui_related: true
gui_classification_reason: This unit governs user-visible labels and decline/reject follow-up choices.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-033 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_contract_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: visible_labels_and_decline_reject_follow_up_choices
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0042
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0043
preserved_exact_tokens:
- Approve
- Decline
- Retry from safe point
- Start fresh attempt
- Resume after prerequisite
- Replan
- Skip node
- Abort run
- Reject
- Deny
- decline/reject
- active isolated automation session
- fresh isolated session
negative_constraints:
- Reject, Deny, and other variants must map back to canonical action families.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md remains the HITL owner for the covered behavior while referenced owner docs keep their own SSOT boundaries.
owner_hints:
- Plans/human-in-the-loop.md
```

### HITL-034 - Shared Approval Ladder And Approval Vocabulary Consumption

```yaml
plan_unit_id: HITL-034
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: HITL-specific affordances consume the shared permission ladder instead of defining a shorter local approval menu; approval choices are deny, once, for session, and always, batch web review may present one domain-grouped approval surface, question defaults to allow only when HITL is available and otherwise remains ask-gated, and HITL surfaces do not create a competing approval vocabulary.
gui_related: true
gui_classification_reason: This unit governs user-visible HITL approval affordances, permission/question prompts, terminal blocked-state handling, or approval labels.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-034 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_permission_ladder_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: shared_approval_ladder_and_approval_vocabulary_consumption
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0044
preserved_exact_tokens:
- Shared approval-ladder alignment (2026-04-04)
- HITL-specific affordances
- shared permission ladder
- shorter local approval menu
- deny
- once
- for session
- always
- batch web review
- one domain-grouped approval surface
- question
- allow
- HITL is available
- ask-gated
- competing approval vocabulary
negative_constraints:
- HITL must not define a shorter local approval menu.
- question defaults to allow only when HITL is available; otherwise it remains ask-gated.
- HITL surfaces must not create competing approval vocabulary.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/human-in-the-loop.md owns HITL consumer alignment only.
- Plans/Permissions_System.md and Plans/Tools.md remain owners for the shared permission ladder and tool permission behavior.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md'
split_recommendation_reason: The source span contains separable approval-ladder vocabulary and ask-flow/terminal-block consumer-alignment requirements; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-035 - Ask-Flow And Terminal Block Consumer Alignment

```yaml
plan_unit_id: HITL-035
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: As an approval/ask-flow consumer, HITL preserves repaired permission, question, and terminal block handling exactly through the shared permission ladder and blocked-episode model rather than drifting into local-only action names or terminal-only approval behavior; /ask-flow and /question/terminal routes are consumer labels over the shared model and not independent HITL-only state machines.
gui_related: true
gui_classification_reason: This unit governs user-visible HITL approval affordances, permission/question prompts, terminal blocked-state handling, or approval labels.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through HITL-035 instead of broad HITL-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hitl_permission_ladder_drift
reasoning_tier: standard
context_scope: human_in_the_loop_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: ask_flow_and_terminal_block_consumer_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0044
preserved_exact_tokens:
- approval/ask-flow consumer
- MUST preserve repaired permission/question/terminal block handling exactly
- permission prompts
- question prompts
- terminal blocked states
- shared permission ladder
- blocked-episode model
- local-only action names
- terminal-only approval behavior
- /ask-flow
- /question/terminal
- consumer labels
- not independent HITL-only state machines
negative_constraints:
- HITL must not drift into local-only action names or terminal-only approval behavior.
- /ask-flow and /question/terminal must remain consumer labels, not independent HITL-only state machines.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- HITL consumes the shared question, permission, and terminal blocked-episode model.
- HITL must not re-own shared question, permission, or terminal state machines.
owner_hints:
- Plans/human-in-the-loop.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md'
split_recommendation_reason: The source span contains separable approval-ladder vocabulary and ask-flow/terminal-block consumer-alignment requirements; repeated source lineage preserves exact source provenance without inventing subspans.
```

### HITL-001 - Human-in-the-Loop Retired Source-Preserving Bridge

```yaml
plan_unit_id: HITL-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: The former human-in-the-loop doc-level source-preserving bridge is retired after Phase 2B atomized human-in-the-loop-S0001 through S0044 into HITL-002 through HITL-035 and structurally dispositioned S0004, S0005, S0014, S0017, S0026, S0030, S0045, S0046, and S0048. HITL-001 remains only as migration lineage for human-in-the-loop-S0047 and must not re-own atomized source coverage or use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: This retired bridge records migration lineage only; product GUI coverage is owned by fine-grained HITL PlanUnits HITL-002 through HITL-035.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- HITL-001 no longer uses source_preserving_planunit compile mode.
- HITL-002 through HITL-035 own product coverage for atomized human-in-the-loop spans.
- Structural spans are explicit coverage dispositions, not product coverage owned by HITL-001.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:human-in-the-loop-S0047
preserved_exact_tokens:
- HITL-001
- source_preserving_planunit
- source_preserving_bridge_retired
- Human-in-the-Loop (HITL) Mode -- Plan
- human-in-the-loop-S0047
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- HITL-001 must not re-own atomized human-in-the-loop product coverage.
- HITL-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Do not treat the retired bridge as implementation-ready product coverage.
- Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this retired bridge.
compatibility_only_notes:
- HITL-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former HITL-001 residual source-preserving bridge is retired by Phase 2B batch 082.
owner_boundary_notes:
- HITL-002 through HITL-035 own atomized human-in-the-loop product coverage.
- human-in-the-loop-S0047 is migration-lineage coverage only after bridge retirement.
owner_hints:
- Plans/human-in-the-loop.md
```

## Migration Coverage

Original hash: `844eca99e4c87b9669b375cbe844b13f8bc91141b1ef93860675a6585256c80b`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 081 atomized `human-in-the-loop-S0001` through `human-in-the-loop-S0043` into `HITL-002` through `HITL-033`, with dense shared-runtime, recovery-label, run-loop, tier-retirement, and recovery-action spans split where safe. Phase 2B batch 082 atomized `human-in-the-loop-S0044` into `HITL-034` and `HITL-035`, structurally dispositioned `human-in-the-loop-S0045`, `human-in-the-loop-S0046`, and `human-in-the-loop-S0048`, and retired `HITL-001` as migration-lineage compatibility coverage for `human-in-the-loop-S0047`. `Plans/human-in-the-loop.md` now has no residual source-preserving product coverage. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### HITL-036 - Explicit HITL Checkpoints For Plans-To-Code

```yaml
plan_unit_id: HITL-036
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: >-
  HITL remains an explicit mode for plans-to-code execution. When enabled, it may add configured package, seam, promotion, destructive-operation, or critical certification checkpoints, but these checkpoints are not required for correctness in default hands-off mode. HITL consumes Permissions_System critical-escalation policy and Goal_Runtime_System autonomy policy; it does not replace internal Auditor, Overseer, test, source-control, or high-effort repair loops.
  Configured checkpoints may pause for credentials/secrets or other critical authority blockers only when HITL policy enables them or critical escalation policy requires them.
gui_related: true
gui_classification_reason: HITL checkpoints, approvals, and continuation prompts are user-visible interaction surfaces.
depends_on: [PS-116, GRS-029]
unblocks: [OP-024]
acceptance_criteria:
  - HITL checkpoints are opt-in mode behavior.
  - Default mode stays hands-off and critical-only for user escalation.
  - HITL does not short-circuit internal repair, audit, test, source-control, or high-effort routes unless configured checkpoint policy requires a pause.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future HITL checkpoint review
risk_class: hitl_required_for_correctness_drift
reasoning_tier: standard
context_scope: plans_to_code_hitl
implementation_surfaces: [Plans/human-in-the-loop.md, Plans/Permissions_System.md, Plans/Goal_Runtime_System.md]
node_compile_hint: {mode: explicit_hitl_checkpoints, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0044
  - pldg-20260617-001-plans-to-code-handoff:atom-0045
  - pldg-20260617-001-plans-to-code-handoff:dec-0019
  - pldg-20260617-001-plans-to-code-handoff:corr-0009
preserved_exact_tokens:
  - "HITL"
  - "hands-off"
  - "configured checkpoints"
  - "critical authority blockers"
negative_constraints:
  - Do not make HITL required for default correctness.
owner_hints:
  - Plans/human-in-the-loop.md
  - Plans/Permissions_System.md
  - Plans/Goal_Runtime_System.md
```

ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Goal_Runtime_System.md


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### HITL-037 - Testing Overrides, High-Risk Checkpoints, And Exceptional User Decisions

```yaml
plan_unit_id: HITL-037
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: 'The controller answers auto-resolvable gaps from evidence, applies safe defaults with recorded assumptions, and defers downstream-only details; it asks the user only for genuine product direction, risk acceptance, destructive authority, credentials, legal policy, or irreconcilable ambiguity. Security, data destruction, billing, migration, legal/compliance, irreversible external effects, or similarly high-risk decisions may require explicit user confirmation under HITL policy. Disabling or restricting automated testing requires a durable testing_policy_override explicitly approved by the user for exact projects, PlanUnits, WorkNodes, capability classes, reasons, risks, and reopen conditions. Global or privileged installation, paid services, license acceptance, account creation, credential use, device enrollment, or material external effects require applicable authority and may become a typed blocker rather than an unsafe silent
  install. The only permitted incomplete item is a user_approved_incomplete_item naming the exact artifact and span, reason, risk, approver, downstream disposition, expiration or reopen condition, and evidence; broad permission to leave TODOs is invalid. Classify gaps as auto_resolvable, safe_default_with_assumption, defer_to_plan_compile, defer_to_worknode_system, requires_user_policy_decision, requires_user_risk_acceptance, requires_external_credential, or true infrastructure/runtime blocker. Only product policy with no safe inference, material risk acceptance, destructive or irreversible operations, credentials or permissions, legal/compliance authority, or irreconcilable user preference conflicts may block for user decision.'
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- PYTHONPATH=/private/tmp/pm-py-deps python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: implementation_readiness
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/human-in-the-loop.md
- Plans/Planning_Wizard.md
- Plans/Automated_Testing_System.md
- Plans/Contracts_V0.md
- Plans/Permissions_System.md
- Plans/Progression_Gates.md
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0053
- pldg-20260618-001-prd-planning-wizard:atom-0062
- pldg-20260618-001-prd-planning-wizard:atom-0081
- pldg-20260618-001-prd-planning-wizard:atom-0087
- pldg-20260618-001-prd-planning-wizard:atom-0139
- pldg-20260618-001-prd-planning-wizard:atom-0143
- pldg-20260618-001-prd-planning-wizard:atom-0144
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/07-audit-readiness-and-safety.md#SRC-AUDIT
source_atom_ids:
- atom-0053
- atom-0062
- atom-0081
- atom-0087
- atom-0139
- atom-0143
- atom-0144
decision_refs:
- dec-0016
- dec-0017
- dec-0027
correction_refs:
- corr-0007
- corr-0010
preserved_exact_tokens:
- safe defaults
- minimal HITL
- high-risk checkpoint
- testing_policy_override
- privileged installation
- paid service
- license acceptance
- user_approved_incomplete_item
- auto_resolvable
- safe_default_with_assumption
- requires_user_risk_acceptance
- exceptional user decision
negative_constraints:
- Do not convert ordinary planning uncertainty into a Needs user decision blocker.
- Do not infer an opt-out from casual conversation or a capability setting being unavailable.
- Do not accept a broad 'allow TODOs' exception.
- Do not block on ordinary details that safe defaults, evidence, or downstream stages can resolve.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/human-in-the-loop.md
- Plans/Automated_Testing_System.md
- Plans/Contracts_V0.md
- Plans/Permissions_System.md
- Plans/Progression_Gates.md
- Plans/Goal_Runtime_System.md
```
