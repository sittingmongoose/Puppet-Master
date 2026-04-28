# Human-in-the-Loop (HITL) Mode -- Plan

## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-006: Retire tier-era canon and shadow fields
- Coverage rows: cov-006
- Fidelity gap refs: cov-006
- Required fidelity items:
- Exact required item: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact required item: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Retired-token handling: exact retired tokens are preserved in packet metadata; live wording omits them.
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-006: Retire tier-era canon and shadow fields` exists in `Plans/human-in-the-loop.md`.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: The `cov-006` repair removes stale live vocabulary and, if needed, confines any mention to an explicit compatibility-retirement note.

### Fidelity recovery cov-101: Provider-native correlation and approval scope
- Coverage rows: cov-101
- Fidelity gap refs: cov-101
- Required fidelity items:
- Exact required item: Move OpenCode session IDs to provider-native correlation fields instead of canonical thread_id
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-101: Provider-native correlation and approval scope` exists in `Plans/human-in-the-loop.md`.
- Exact acceptance check: The `cov-101` repair states the exact requirement: Move OpenCode session IDs to provider-native correlation fields instead of canonical thread_id
- Exact acceptance check: The `cov-101` repair is in the owner section for `Plans/human-in-the-loop.md` and is not only a downstream consumer note.

### Fidelity recovery cov-161: Identity and blocked-policy transfer cluster
- Coverage rows: cov-161
- Fidelity gap refs: cov-161
- Required fidelity items:
- Exact required item: Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- Exact required item: Carry usage switch-history and usage execution-role follow-through
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-161: Identity and blocked-policy transfer cluster` exists in `Plans/human-in-the-loop.md`.
- Exact acceptance check: The `cov-161` repair states the exact requirement: Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- Exact acceptance check: The `cov-161` repair states the exact requirement: Carry usage switch-history and usage execution-role follow-through
- Exact acceptance check: The `cov-161` repair is in the owner section for `Plans/human-in-the-loop.md` and is not only a downstream consumer note.

### Fidelity recovery cov-185: Approval scope key and approver identity
- Coverage rows: cov-185
- Fidelity gap refs: cov-185
- Required fidelity items:
- Exact required item: Separate blocked-episode approval scope from session-wide policy scope
- Exact required item: Persist durable approver identity fields on approval and rejection events
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-185: Approval scope key and approver identity` exists in `Plans/human-in-the-loop.md`.
- Exact acceptance check: The `cov-185` repair states the exact requirement: Separate blocked-episode approval scope from session-wide policy scope
- Exact acceptance check: The `cov-185` repair states the exact requirement: Persist durable approver identity fields on approval and rejection events
- Exact acceptance check: The `cov-185` repair is in the owner section for `Plans/human-in-the-loop.md` and is not only a downstream consumer note.

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
- high-risk mutations, auth/state mutation, and publish-side effects still require their own explicit confirmations
- revoking the grant or finishing the investigation revokes the front-door scope as well

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/GitHub_Integration.md

## Executive Summary

**Human-in-the-Loop (HITL) mode** lets the user require explicit human approval at selected tier boundaries. The orchestrator completes all work within the current tier (phase, task, or subtask), then **pauses at the boundary** until the human reviews and approves before proceeding to the next phase, task, or subtask. HITL is a **setting**: it can be enabled independently at phase level, task level, and subtask level. All HITL toggles are **off by default**.

**Critical autonomy rule:** HITL is an optional product UX feature. It MUST NOT be required for correctness, verification, or progression gates; autonomous runs proceed deterministically without any human approvals.  
ContractRef: PolicyRule:Decision_Policy.md§4, Gate:GATE-001

**Use cases:** Optional tier-boundary pauses for stakeholders (when explicitly enabled by the user).

## Relationship to Other Plans

| Plan | Relevance to HITL |
|------|-------------------|
| **Plans/orchestrator-subagent-integration.md** | Defines the main run loop (Phase → Task → Subtask → Iteration), tier boundaries, and **Start and End Verification at Phase, Task, and Subtask**. HITL does not redefine tiers; it adds a **pause-for-approval** step at the **end** of a tier, after end verification and before advancing. Tier semantics are the single source of truth in Plans/orchestrator-subagent-integration.md. |
| **Plans/interview-subagent-integration.md** | Interview flow has its own phases (Scope, Architecture, UX, etc.). HITL in this plan applies to the **orchestrator** tiers (Phase/Task/Subtask). Interview-phase-level HITL (pause after each interview phase for approval) is out of scope here but could mirror this design if added later. |
| **Plans/assistant-chat-design.md** | Defines **Dashboard warnings and Calls to Action (CtA)** and that they are **addressable via the chat Assistant**. HITL prompts are one type of CtA: when paused for approval, the Dashboard shows a CtA; the user can respond via the Assistant or a direct Dashboard control. See §16 there. |
| **Plans/newfeatures.md §20** | Summary and orchestrator integration: HITL is a **setting** only; tier semantics stay in Plans/orchestrator-subagent-integration.md; newfeatures defers full HITL spec to this document. |

## Tier Boundaries (DRY)

Tier boundaries are not a co-equal execution model.

Rules:
- approvals do not bind to `tier_id` as the canonical execution scope
- any surviving tier or phase labels are derived grouping/view concepts only
- approval and recovery flows bind to runtime blocked episodes anchored by `run_id`, `node_id`, `blocked_sequence`, and `attempt_id?`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md

## Package and Seam Completion Gates

The node-model rewrite uses package- and seam-scoped gates while preserving the same human approval affordances.

Canonical gate types:
- `package_complete_gate` — fires when all nodes in a package have completed. Conditions: all node statuses are in `{completed, skipped}`. Actions: run package-level verification, emit `package.completed` event.
- `seam_complete_gate` — fires when a seam transition is needed. Conditions: the source package is completed and the target package prerequisites are met. Actions: validate cross-package contracts, transfer context, emit `seam.transition` event.

HITL approval behavior stays intact, but it now binds to these gate types. When HITL is enabled, the existing approve / decline / skip / abort flow applies after `package_complete_gate` or `seam_complete_gate` reaches its decision point.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md
## Settings Model

### Three Independent Toggles

| Setting | Scope | Default | Effect when ON |
|--------|--------|--------|----------------|
| **HITL at phase** | After completing all tasks in the current phase | Off | Pause after phase end verification; wait for human approval before starting next phase. |
| **HITL at task** | After completing all subtasks in the current task | Off | Pause after task end verification; wait for human approval before starting next task. |
| **HITL at subtask** | After completing all iterations in the current subtask | Off | Pause after subtask end verification; wait for human approval before starting next subtask. |

- Each toggle is **independent**: e.g. phase-only, or task+subtask, or all three.
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
- one visible place to enable or disable HITL per tier
- phase/task/subtask toggles remain independent
- execution-affecting changes apply to the next run without requiring a restart

This section replaces any prior wording that left key names or config location to implementation-time choice.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md
### Run-Loop Integration (Conceptual)

1. Orchestrator runs as today: Phase → Task → Subtask → Iteration, with start/end verification at phase, task, and subtask per Plans/orchestrator-subagent-integration.md.
2. When a **phase** is completed (end verification done):
   - If **HITL at phase** is ON → **pause**. Show completion state and approval controls (see button labels below). On approval → advance to next phase.

     **HITL Button Labels (Resolved):**
     - **Primary action:** "Approve" (when next tier is not yet ready) or "Approve & Continue" (when next tier is ready to start immediately).
     - **Reject action:** "Reject" — marks tier as `needs_review`, surfaces CtA.
     - **Cancel action:** "Cancel Run" — aborts the entire orchestration run.
     - **Skip action:** "Skip" — available in the reject CtA, advances past the current tier.
     - Button order (left to right): [Approve / Approve & Continue] [Reject] [Cancel Run].

     **On reject:** The run remains paused. The tier is marked as `needs_review` in the seglog. A Call-to-Action (CtA) appears in the Assistant chat: "Phase [X] was rejected — [Re-run] [Skip Phase] [Abort Run]." The user must choose an action to proceed. Re-run re-executes the same tier from the beginning. Skip Phase advances to the next tier. Abort Run stops the entire orchestration run.

     **On cancel:** The current run is aborted. The tier is marked as `cancelled` in the seglog. All active subagents for this run receive a cancellation signal. The orchestrator returns to IDLE state. A seglog event `hitl.cancelled` is emitted with the node execution context.
3. When a **task** is completed (end verification done):
   - If **HITL at task** is ON → **pause**. Same idea: human reviews, approves or rejects; on approval → next task.
4. When a **subtask** is completed (end verification done):
   - If **HITL at subtask** is ON → **pause**. Same idea: human reviews, approves or rejects; on approval → next subtask.

Pause points are **only** at tier boundaries (after a full phase/task/subtask is done), not mid-tier. Within a tier, the system runs to completion before any HITL gate.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md

### What the Human Sees and Does

- **At pause:** The UI should present that the current tier (phase/task/subtask) is complete and that approval is required to continue. The user can review progress, logs, artifacts, or evidence as needed.
- **Approve:** "Approve" or "Approve & Continue" button (see button labels in §2 above) clears the pause and allows the orchestrator to advance to the next tier.
- **Reject / Cancel:** "Reject" marks tier as `needs_review`, surfaces CtA with three options (Re-run, Skip, Abort). "Cancel Run" aborts run, emits `hitl.cancelled` event, returns to IDLE. See §2 for full specification.

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

- **Tier definitions and boundaries:** Use Plans/orchestrator-subagent-integration.md only; do not duplicate in this plan or in code.
- **HITL settings:** One config schema and one set of three booleans; GUI and orchestrator both read from that single source.
- **Verification order:** HITL runs **after** end verification at that tier (Plans/orchestrator-subagent-integration.md "Start and End Verification at Phase, Task, and Subtask"); no new verification concept, only a pause-and-approve step.

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

### 2. Re-run semantics after reject

`Re-run` cannot remain ambiguous.

Required rule:
- the rejection CTA must declare whether the rerun is `retry_from_safe_point` or `fresh_attempt`
- default should be `retry_from_safe_point` for mutation-capable tiers when a valid safe point exists
- if no safe point exists or the tier is explicitly non-recoverable, use `fresh_attempt`

### 3. Skip semantics

`Skip` must preserve lineage.

Required rule:
- the skipped attempt remains in history
- the UI must show that the user chose to advance without rerunning the rejected tier
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

## Shared approval-ladder alignment (2026-04-04)

HITL-specific affordances consume the shared permission ladder instead of defining a shorter local approval menu.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md

Required alignment:
- approval choices are `deny`, `once`, `for session`, `always`
- batch web review may present one domain-grouped approval surface
- `question` defaults to `allow` only when HITL is available; otherwise it remains ask-gated
- HITL surfaces do not create a competing approval vocabulary
