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
- HITL behavior and tier-boundary semantics
- Settings model (phase / task / subtask, independent, off by default)
- Integration points with the orchestrator run loop
- DRY alignment with existing tier and verification plans

## Rewrite alignment (2026-02-21)


HITL semantics are part of the deterministic agent-loop core described in `Plans/rewrite-tie-in-memo.md`:

- HITL approvals should be represented as explicit **events** in the unified event model (seglog ledger)
- "Pause for approval" must be reproducible/replayable (event stream + projections), not just an in-memory UI state
- UI can change (Slint rewrite), but tier-boundary meaning and approval requirements must not

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

### HITL-001 - Human-in-the-Loop (HITL) Mode -- Plan Source-Preserving PlanUnit

```yaml
plan_unit_id: HITL-001
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Plans/human-in-the-loop.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:human-in-the-loop-S0044
preserved_exact_tokens:
- Human-in-the-Loop (HITL) Mode -- Plan
- Canonical owner-section requirements
- Retire tier-era canon and shadow fields
- Provider-native correlation and approval scope
- Identity and blocked-policy transfer cluster
- Approval scope key and approver identity
- Plan Document Status
- Rewrite alignment (2026-02-21)
- Canonical HITL request contract
- Shared-runtime HITL request and command alignment
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
- Consequential transition, tray, and recovery-label alignment
- Debug automation front-door grants
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md'
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/GitHub_Integration.md'
- Executive Summary
- 'ContractRef: PolicyRule:Decision_Policy.md§4, Gate:GATE-001'
- Relationship to Other Plans
- Derived Grouping Boundaries (DRY)
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md'
- Package and Seam Completion Gates
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md'
- Settings Model
- Three Independent Toggles
negative_constraints:
- '- UI can change (Slint rewrite), but tier-boundary meaning and approval requirements must not'
- The request-era contract remains documented only as a compatibility bridge. A historical `HITLRequest` with `request_id`, `tier_id`, `tier_type`, `request_kind = tier_boundary_approval`, `request_kind`, `allowed_actions`, `allowed_actions[]`, `/tier/request_kind/allowed_actions`, and `hitl.approval_
- HITL classification keeps the `source axis`, `request axis`, and `execution/result axis` separate. A `/result` or execution outcome may explain why the blocked episode exists, but it must not become the request identity or the source identity.
- UI and storage routes must not cross-wire governance approvals with tool approvals. UI_Command_Catalog, Run_Graph_View, Orchestrator_Page, storage-plan, `Plans/Prompt_Pipeline.md`, `/Prompt_Pipeline.md`, Prompt_Pipeline, usage-feature, usage-feature.md, FileManager, newfeatures, and orchestrator-sub
- 'The plan must not preserve two competing approval/blocked ontologies: `blocked-episode` / `/runtime-native` is canonical, while HITL request `/tier-boundary-native` and `/blocked` request-era phrasing are compatibility labels only, a bridge from the old HITL plan to the new blocked/runtime command m'
- Conversational, `/HITL/tooling`, and tooling docs must not overload session with incompatible scope meanings. Session copy is display or provider context only; blocked and approval correctness comes from lane/account/run/node identity under multi-lane and multi-actor execution.
- Domain-specific "open in X" commands may remain when they express a meaningful domain-specific product action, but they are wrappers over the same route/subject model. The `/subject` identity and route target are shared; HITL, object-open, and runtime surfaces must not invent custom argument familie
- 'Restore language is overloaded and must be normalized before display or persistence. Rollback, checkpoint, revert, and `/checkpoint/revert` wording must resolve to a safe-point-aware retry when a valid safe point exists and policy allows restore, or to an explicit `Start fresh attempt`; it must not '
- '**Critical autonomy rule:** HITL is an optional product UX feature. It MUST NOT be required for correctness, verification, or progression gates; autonomous runs proceed deterministically without any human approvals.'
- '| **Plans/interview-subagent-integration.md** | Interview flow has its own phases (Scope, Architecture, UX, etc.). HITL in this plan applies to orchestrator package/seam decision points surfaced through Phase/Task/Subtask grouping controls. Interview-phase-level HITL (pause after each interview phas'
- '- Phase/task/subtask labels are configuration and display groupings only. They MUST NOT redefine `approval_scope_key`, blocked identity, recovery semantics, persistence ownership, or package/seam gate ownership.'
- '- **Skip and abort actions:** "Skip node" maps to `allowed_action_id = skip_node`; "Abort run" maps to `allowed_action_id = abort_run`. Legacy "Skip" or "Cancel Run" copy is surface text only and MUST NOT create graph-local command semantics.'
- '- The legacy tier-era runtime canon is retired. The former runtime context, identifier, type, and collection labels, plus Phase-Task-Subtask wording, are compatibility-only display/grouping aliases and MUST NOT appear in runtime-owned blocked payloads, approval events, persistence records, cache key'
- '- Canonical action enumeration uses ordered `allowed_action_ids[]` only. Runtime, Dashboard, Assistant, and APIs MUST derive visible controls from that array and MUST NOT carry a second survivor array for blocked or recovery actions.'
- '- Any remaining phase/task/subtask labels may be rendered as explanatory UI copy, but they MUST NOT redefine approval scope, blocked identity, recovery semantics, or persistence ownership. `approval_scope_key` remains the only durable approval-scope handle for the blocked episode.'
- '- While an approval wait has a known future-timestamp or active user-visible timer, HITL surfaces MUST NOT render it as generic `deadlock/stall`, MUST NOT show stall banners, and MUST NOT auto-pause unrelated runnable work.'
- All surfaces MUST use the same action names, meanings, and enablement conditions. A surface may hide an action for layout reasons, but it MUST NOT rename or reinterpret it.
compatibility_only_notes:
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- Runtime HITL persistence is keyed by blocked episode identity first. `checkpoints.hitl.{run_id}` and `checkpoints.hitl` are compatibility paths only; `/runtime/storage` records must distinguish concurrent pending-HITL episodes in the same run by `run_id`, `node_id`, `blocked_sequence`, `attempt_id?`
- The request-era contract remains documented only as a compatibility bridge. A historical `HITLRequest` with `request_id`, `tier_id`, `tier_type`, `request_kind = tier_boundary_approval`, `request_kind`, `allowed_actions`, `allowed_actions[]`, `/tier/request_kind/allowed_actions`, and `hitl.approval_
- 'Run_Graph_View, `Run_Graph_View.md`, usage-feature, and `usage-feature.md` are the highest-risk stale consumer pair when they continue sharing `tier_id` as an old usage/evidence/runtime correlation key. HITL consumers must treat `/evidence/runtime` correlation as derived compatibility metadata over '
- 'The plan must not preserve two competing approval/blocked ontologies: `blocked-episode` / `/runtime-native` is canonical, while HITL request `/tier-boundary-native` and `/blocked` request-era phrasing are compatibility labels only, a bridge from the old HITL plan to the new blocked/runtime command m'
- Graph-local HITL commands remain compatibility shims over runtime actions. `cmd.graph.approve_hitl`, `cmd.graph.deny_hitl`, `hitl_request_id`, `request_id`, and graph-local command shapes must resolve through `blocked_sequence` before they mutate state. The one-off approval-scope for a blocked-episo
- Compatibility labels must be explicit. `HITL tier-boundary approvals`, tier-bound, tier-boundary, tier-local, tier-keyed, tier-based, stale-ownership, TierContext, execution-unit, `/runtime-overlay`, blocked-node, graph-local, `OpenFile`, `PathBuf`, seam-id, package-id, feature-seam, `/seam`, `/inte
- '### Consequential transition, tray, and recovery-label alignment'
- 'Consequential approval and recovery transitions use a shared state transition report: from state, to state, target object, actor/source, `/source`, why the transition occurred, prerequisite evidence, review or corroboration refs, and resulting downstream obligations. `projection-trust` defines wheth'
- 'The execution-core mismatch is resolved in favor of graph/runtime ownership: `Builder`, `Verifier`, and `Overseer` labels may describe roles, while `Executor_Protocol`, `Executor_Protocol.md`, orchestrator-subagent-integration, orchestrator-subagent-integration.md, `Phase -> Task -> Subtask -> Itera'
- '- `seam_complete_gate` — fires when a seam transition is needed. Conditions: the source package is completed and the target package prerequisites are met. Actions: validate cross-package contracts, transfer context, and emit the canonical gate events from `Plans/Contracts_V0.md` with `gate_id = seam'
- '- **Decline action:** "Decline" is the canonical display label for `allowed_action_id = decline`, dispatched as `cmd.runtime.decline`. Legacy "Reject" copy may appear only as compatibility text and MUST map to this action family.'
- '- **Skip and abort actions:** "Skip node" maps to `allowed_action_id = skip_node`; "Abort run" maps to `allowed_action_id = abort_run`. Legacy "Skip" or "Cancel Run" copy is surface text only and MUST NOT create graph-local command semantics.'
- '- **Decline / Abort:** "Decline" maps to `cmd.runtime.decline` and surfaces the ordered runtime recovery actions. "Abort run" maps to `cmd.runtime.abort_run`; legacy "Reject" and "Cancel Run" labels are compatibility copy only. See §2 for full specification.'
- 2. **Runtime loop:** When a node reaches an approval prerequisite, transition into the canonical blocked episode flow and wait for a runtime action rather than a tier-local pause flag.
- '### Tier-era compatibility retirement'
- '- The legacy tier-era runtime canon is retired. The former runtime context, identifier, type, and collection labels, plus Phase-Task-Subtask wording, are compatibility-only display/grouping aliases and MUST NOT appear in runtime-owned blocked payloads, approval events, persistence records, cache key'
- '- Canonical blocked classification uses `concern_reason`. If additional detail is needed, it MUST be carried in dedicated structured metadata or `detail_ref?`; no legacy short-code survivor field remains in the live contract.'
- '- Canonical approval resolution uses explicit outcome fields such as `approval_outcome` and `approval_recorded_at`, scoped by `approval_scope_key`. Continuation after review is represented by the recorded approval outcome, not by a separate legacy continue-decision field.'
- '- Blocked-episode recovery semantics are canonical. Retry, resume-after-prerequisite, skip, abort, replan, and safe-point restore behavior remain attached to the same `run_id` + `node_id` + `blocked_sequence` episode, and recovery affordances are derived from `allowed_action_ids[]`, `concern_reason`'
stale_retired_dispositions:
- 'Run_Graph_View, `Run_Graph_View.md`, usage-feature, and `usage-feature.md` are the highest-risk stale consumer pair when they continue sharing `tier_id` as an old usage/evidence/runtime correlation key. HITL consumers must treat `/evidence/runtime` correlation as derived compatibility metadata over '
- Compatibility labels must be explicit. `HITL tier-boundary approvals`, tier-bound, tier-boundary, tier-local, tier-keyed, tier-based, stale-ownership, TierContext, execution-unit, `/runtime-overlay`, blocked-node, graph-local, `OpenFile`, `PathBuf`, seam-id, package-id, feature-seam, `/seam`, `/inte
- '- The legacy tier-era runtime canon is retired. The former runtime context, identifier, type, and collection labels, plus Phase-Task-Subtask wording, are compatibility-only display/grouping aliases and MUST NOT appear in runtime-owned blocked payloads, approval events, persistence records, cache key'
owner_boundary_notes:
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '- HITL behavior and tier-boundary semantics'
- '- UI can change (Slint rewrite), but tier-boundary meaning and approval requirements must not'
- '### Canonical HITL request contract'
- The canonical human-in-the-loop contract remains a blocked-runtime overlay.
- '- `blocked_sequence` remains the canonical approval anchor.'
- HITL is the approval consumer for shared-runtime, multi-lane execution. Assistant chat, validation-pass output, wizard-handoff payloads, DAE side-effect interception, and tool-event records must preserve `effective_account_id`, `requested_account`, `requested_account_id`, `execution_role`, permissio
- 'HITL boundary redesign remains automation-first: approval pauses attach to package-complete and seam-complete events rather than to phase/task/subtask or `/task/subtask` boundaries. Optional HITL boundaries share one UI contract for package-complete, seam-complete, and mandatory side-effect gates; t'
- 'Run_Graph_View, `Run_Graph_View.md`, usage-feature, and `usage-feature.md` are the highest-risk stale consumer pair when they continue sharing `tier_id` as an old usage/evidence/runtime correlation key. HITL consumers must treat `/evidence/runtime` correlation as derived compatibility metadata over '
- HITL blocked/runtime semantics are canonical for `/runtime` consumers; tier-boundary examples remain derived copy only.
- 'The plan must not preserve two competing approval/blocked ontologies: `blocked-episode` / `/runtime-native` is canonical, while HITL request `/tier-boundary-native` and `/blocked` request-era phrasing are compatibility labels only, a bridge from the old HITL plan to the new blocked/runtime command m'
- The canonical switch-history / pressure-episode family is queryable from History, Ledger, Usage, `/Usage`, and Account/Usage Pressure projections, and it remains account-aware rather than tier-derived.
- Graph-local HITL commands remain compatibility shims over runtime actions. `cmd.graph.approve_hitl`, `cmd.graph.deny_hitl`, `hitl_request_id`, `request_id`, and graph-local command shapes must resolve through `blocked_sequence` before they mutate state. The one-off approval-scope for a blocked-episo
- 'File and artifact opening uses the shared object-open contract. FileManager may continue to expose `OpenFile { path... }` and the canonical `OpenFile { path: PathBuf, line?, range?, target_group? }` workspace-document command, but object-open requests for runtime artifacts must use open-by-identity '
- Compatibility labels must be explicit. `HITL tier-boundary approvals`, tier-bound, tier-boundary, tier-local, tier-keyed, tier-based, stale-ownership, TierContext, execution-unit, `/runtime-overlay`, blocked-node, graph-local, `OpenFile`, `PathBuf`, seam-id, package-id, feature-seam, `/seam`, `/inte
- 'System `/tray` notifications remain narrow: HITL approval required, run complete, major failure requiring attention, and severe `/pressure` or rate-limit events that materially stop progress. Tray copy is not the owner for approval identity, allowed actions, or recovery semantics.'
- 'The execution-core mismatch is resolved in favor of graph/runtime ownership: `Builder`, `Verifier`, and `Overseer` labels may describe roles, while `Executor_Protocol`, `Executor_Protocol.md`, orchestrator-subagent-integration, orchestrator-subagent-integration.md, `Phase -> Task -> Subtask -> Itera'
- '- the grant remains represented through the canonical blocked-runtime overlay rather than through a new request-centric debug approval model'
- '- shared runtime actions remain canonical; Debug Mode does not invent a separate approval transport'
- '| **Plans/orchestrator-subagent-integration.md** | Defines the visible Phase → Task → Subtask → Iteration grouping and verification labels. HITL consumes those labels as configuration/display groupings only; canonical approval scope, recovery identity, and progression blocking come from package/seam'
- '- approvals do not bind to `tier_id` as the canonical execution scope'
owner_hints:
- Plans/human-in-the-loop.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `1d422c28121f5136cf861604a3df266fb3bb96deca8fc1dd177205c530863fb9`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `human-in-the-loop-S0001` through `human-in-the-loop-S0044` are preserved in place and mapped in `coverage_map.jsonl` to `HITL-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.

