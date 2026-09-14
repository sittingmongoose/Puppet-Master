# Overseer Protocol (Canonical)


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Retire tier-era canon and shadow fields


- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.
### Identity and blocked-policy transfer cluster
### Coverage blocker provider/model precedence owner section
### Approval scope key and approver identity
> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## 0. Purpose and scope
This document defines deterministic execution ordering for `plan_graph` nodes and completion semantics for Builder, Verifier, and Overseer roles.

It applies to:
- Self-build plan graph artifacts in `Plans/plan_graph.json`
- User-project sharded plan graph artifacts under `.puppet-master/project/plan_graph/`

For user projects, canonical entrypoint and derived-export policy are defined in `Plans/Project_Output_Artifacts.md` (`.puppet-master/project/plan_graph/index.json` canonical; monolithic export is optional/non-canonical).

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Progression_Gates.md

---

## 1. Role definitions

### 1.1 Builder / node worker


The execution worker that performs the node attempt.

### 1.2 Verifier / reviewer / corroborator


The execution-support actors that review, verify, or corroborate work products without becoming the scheduler.

### 1.3 Package Overseer


Local governance for one `Work Package`.

### 1.4 Seam Overseer


Cross-package integration governance for one `Feature Seam`.

### 1.5 Runtime scheduler
The canonical owner of readiness, blocked state, transitions, retry budgets, wakeups, and dispatch.

Rules:
- overseers are governance actors, not hidden second schedulers
- most node execution may be performed through overseer-spawned node workers, but runtime still owns canonical execution state
- Direct-runtime-dispatched execution is a `/special-case` or edge-case `/fallback/special` path; `/default` node-worker execution is overseer-spawned, with requested-vs-effective account/model/persona resolution recorded before dispatch.
- conversational actors that share runtime identity semantics do not become orchestration nodes, packages, or seams
- Executor is the runtime SSOT for attempt state across `/seam/lane/work-package` identity: no HTE-by-default mode is assumed, and HITL is represented as explicit blocked/approval boundaries rather than hidden scheduler behavior.
- Terminology ownership for work package, feature seam, package overseer, seam overseer, Weak Integration, Promotion, Corroboration, Graph Patch, Reopened, Revoked, promotion classes, lane pools, contamination, safe points, and effective execution identity remains in Glossary, Crosswalk, Decision Policy, and the plans index; Executor consumes those graph-owned terms for runtime behavior and does not revive tier vocabulary as primary canon.
- Any surviving `tier` language is compatibility or derived-view vocabulary only. `Plans/human-in-the-loop.md` (`human-in-the-loop.md`) may remain a strong tier-era owner doc for approval UX, but `Plans/Executor_Protocol.md` (`Executor_Protocol.md`) owns this runtime seam and is already ahead of it; `Plans/Orchestrator_Page.md` (`Orchestrator_Page.md`) is the larger tier-era drift multiplier for page structure, not a reason to weaken Executor canon.
- Governance layering is graph-based rather than tier-based: older `Overseer` execution-role language is retained only as compatibility framing, while a `work package overseer` owns package-local delivery/readiness truth and a `same-feature-seam overseer` owns same-feature-seam integration truth across packages. They are not redundant or conflicting co-governors; the governance-boundary is the feature-seam/package split, with firm contract language required wherever future seam writeups or recommendations describe authority.
- Worktree mode is resolved at dispatch from explicit policy inputs: `Plans/chain-wizard-flexibility.md` (`chain-wizard-flexibility.md`) may describe `no-worktrees` user intent, while `Plans/WorktreeGitImprovement.md` (`WorktreeGitImprovement.md`) may require `per-subtask` worktree isolation. Executor records which mode won for the attempt instead of treating worktree-on and worktree-off language as interchangeable.
- The graph-canonical `/control` loop is not a single giant agent walking the whole graph; runtime-core pressure-testing preserves a dual-overseer model: package and seam overseers govern spawned workers through `/model`, `/review`, scheduler evidence, and explicit runtime control records.
- The node-native execution-core contract carries reviewer, `/corroboration/concern`, and wake `/block` lifecycle hooks so downstream runtime-core consumers do not treat concern, corroboration, or graph-patch behavior as missing local inventions.
- Runtime scheduling consumes package/seam/lane and sharded-node state from durable runtime records such as seglog/redb-backed projections; `active-agents`, `TierType`, `TierContext`, and `/seams` compatibility labels cannot define executor lane ownership or hardcoded subagent registries.
- Background agent queues integrate with the Lane scheduler through package lane pools; snapshot consumers must resolve snapshot/safe-point ambiguity to `/safe-point/runtime` records, while `tier` / `subtask` queue labels remain compatibility lineage rather than package-lane ownership.
- Event and widget projections translate `run.tier_`, `run.tier_*`, `tier_tree`, and `Tiers` into seam/worktree/package-native, `/worktree/package-native`, and `/package/lane-aware` runtime events; live-status consumers read canonical runtime records and projections, while `PuppetMasterEvent` and `PuppetMasterEvent::*` streams are tier-era compatibility inputs.
- Concern `/resolution` records are first-class runtime objects created by runtime, package overseer, seam overseer, corroboration outcome, graph patch, or graph `/state-transition` logic; workers may nominate findings, but `/escalate/downgrade` actions update concern state through the concern owner contract.
- Executor opens runtime objects through `route_target` and `OpenSubject` consumers instead of request-centric local links; projection-backed actions must show `projection_health` and `projection_freshness` before mutating a blocked-episode, Feature Seam, Work Package, Seam Overseer, or Package Overseer target.
- Seam review loops trigger at package-completion boundaries, integration-edge and cross-package crossings, pre-seam completion, and high-impact package-overseer challenges; the result is review/corroboration evidence, not an implicit tier-era completion shortcut.
- A seam is not reconciliation-ready while it lacks a canonical event/`/record` family or owner doc; when direction is already-set, `/reconciliation` work updates stale consumers to the owner contract instead of inventing replacement canon.
- Cleanup `/reconciliation` moves stale `/tier` consumers to `/worktree/package/seam-aware` routing, `/effective/account/runtime` identity displays, canonical runtime actions, route payloads, and `/layout/help/glossary` terminology surfaces.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/orchestrator-subagent-integration.md
## 2. Deterministic readiness

Overseer MUST read node execution state from the canonical node document:
- Self-build graph: `Plans/plan_graph.json.nodes[]`
- User-project sharded graph: `.puppet-master/project/plan_graph/nodes/<node_id>.json`

Overseer MUST NOT infer execution state from index metadata alone.
ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/project_plan_graph_index.schema.json

A node is ready if and only if all conditions are true:
1. `status == "queued"`
2. every node ID in `blockers[]` currently has `status == "done"`
3. `spec_lock_requirements.schema_versions` exactly matches `Plans/Spec_Lock.json.schema_versions` for every referenced key

If multiple nodes are ready simultaneously, Overseer MUST choose the lexicographically smallest `node_id`.
ContractRef: PolicyRule:Decision_Policy.md§3, ContractName:Plans/Spec_Lock.json

If any referenced Spec Lock version key is missing or mismatched, Overseer MUST treat that node as not ready.
ContractRef: ContractName:Plans/Spec_Lock.json, ContractName:Plans/Executor_Protocol.md

**Spec Lock requirement key contract for user-project nodes:**
- For user-project node shards under `.puppet-master/project/plan_graph/nodes/*.json`, `spec_lock_requirements.schema_versions` MUST use key names published in `Plans/Spec_Lock.json.schema_versions`.
- User-project nodes MUST NOT invent ad-hoc schema-version key names.
- If a referenced key is absent from `Plans/Spec_Lock.json.schema_versions`, Overseer MUST treat the node as not ready.

**Blocker integrity rule:**
- Every `blockers[]` entry MUST resolve to an existing canonical node document.
- An unresolved blocker ID is invalid graph input and the node MUST be treated as not ready.

ContractRef: ContractName:Plans/Spec_Lock.json, ContractName:Plans/Project_Output_Artifacts.md

---

## 3. Canonical status lifecycle

Success lifecycle:
`queued -> in_progress -> verify_pending -> verified -> done`

Failure lifecycle:
`verify_pending -> failed`

`done` and `failed` are terminal states for this protocol revision.

UI/orchestrator labels such as `waiting_approval`, `needs_review`, `cancelled`, or `complete_with_warnings` are **run-local overlays / CTA states**, not canonical node `status` values in this protocol. Such overlays MUST be persisted as separate events or projections and MUST NOT replace the status lifecycle above.

Overseer MUST enforce lifecycle ordering and reject out-of-order transitions.
ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Executor_Protocol.md

---

## 4. Auto-marking rule

Verifier writes evidence to `evidence_pointer` and returns `verifier_result`.

When `verifier_result.outcome == "pass"` and the evidence bundle exists and validates, Overseer MUST first set node `status = "verified"`, then immediately transition to `status = "done"`.
ContractRef: ContractName:Plans/Progression_Gates.md#GATE-005, ContractName:Plans/evidence.schema.json

The `verified` state is a schema-enforced transitional state (requiring `outcome == "pass"` and `timestamp_utc` per both `plan_graph.schema.json` and `project_plan_node.schema.json`); Overseer SHALL NOT skip it.
ContractRef: ContractName:Plans/plan_graph.schema.json, ContractName:Plans/project_plan_node.schema.json

Manual mark-complete action MUST NOT be required for verified nodes.
ContractRef: PolicyRule:Decision_Policy.md§4, ContractName:Plans/Executor_Protocol.md

When `verifier_result.outcome == "fail"`, Overseer sets node `status = "failed"`.
ContractRef: ContractName:Plans/Progression_Gates.md, ContractName:Plans/Executor_Protocol.md

---

### 5.0 `execution_unit_context` canonical contract

`Plans/Executor_Protocol.md` is the sole canonical owner of `execution_unit_context`. The normative machine-readable contract is `Plans/execution_unit_context.schema.json` with `schema_id = "pm.execution_unit_context"` and `schema_version = "1.0.0"`. Consumer docs may reference fields from that schema, but they must not copy or redefine the required or optional field set.

Required fields are closed and must appear exactly as the schema lists them:

| Field | Type and nullability | Requirement |
| --- | --- | --- |
| `schema_id` | string const, non-null | Contract identity; always `pm.execution_unit_context`. |
| `schema_version` | string const, non-null | Contract version; always `1.0.0` until a governed successor schema exists. |
| `execution_unit_type` | closed enum, non-null | Runtime unit class: `run`, `seam`, `package`, `node`, `overseer`, `delegated_subagent`, `recovery`, `verification`, or `host_operation`. |
| `execution_unit_id` | string, non-null | Canonical identity for the runtime unit being executed or recovered. |
| `run_id` | string, non-null | Canonical run identity for execution lineage. |
| `node_id` | string, non-null | Canonical node identity for dispatch and receipts. |
| `attempt_id` | string, non-null | Immutable local execution-attempt identity. |
| `execution_role` | closed enum, non-null | Runtime actor role: `assistant`, `interviewer`, `requirements_builder`, `prd_builder`, `package_overseer`, `seam_overseer`, `node_worker`, `reviewer`, `verifier`, `corroborator`, `recovery_actor`, or `host_operator`. |
| `operational_identity` | object, non-null | Stable audit identity with closed `identity_kind` and non-empty `identity_id`. |
| `requested_account_binding` | closed enum, non-null | Binding mode: `none`, `preferred`, `required`, or `system_default`. |
| `approval_scope_key` | string, non-null | Approval and blocked-action scope key for recovery/HITL joins. |
| `created_at_utc` | date-time string, non-null | UTC creation timestamp for persistence and replay ordering. |

Optional fields are closed by the same schema. When present, nullable optional string fields may be `null` only when unknown or not applicable; arrays and closed enums are non-null when present:

| Optional field family | Fields |
| --- | --- |
| Parent/project/planning linkage | `parent_execution_unit_id`, `project_id`, `thread_id`, `wizard_id`, `resolution_id` |
| Graph/lane/worktree linkage | `lane_id`, `package_id`, `seam_id`, `worktree_id`, `working_directory`, `scheduler_pass_id` |
| Account/policy resolution | `requested_account_id`, `requested_account_policy`, `effective_account_id` |
| Blocked/recovery/action linkage | `blocked_sequence`, `allowed_action_ids[]`, `permission_snapshot_id`, `safe_point_id` |
| Artifact/runtime/source-control refs | `usage_event_ref`, `runtime_policy_snapshot_ref`, `source_control_context_ref`, `host_assignment_id` |
| Persistence/replay controls | `redaction_profile`, `replay_policy`, `updated_at_utc` |

Lifecycle ownership is Executor-owned: the scheduler, Executor intake, worker spawn, recovery, remediation, verification, and host-operation boundaries mint, receive, rehydrate, and persist the same `execution_unit_context` packet. Prompt Pipeline produces the immutable handoff inputs, Executor materializes the runtime packet, and storage/events/artifacts/UI/PlanCompile/Planning Wizard consume the packet or a ref to it.

Persistence and replay rules:
- Persisted `execution_unit_context` payloads MUST include `schema_id` and `schema_version`; refs may point to a separately persisted payload only when the referenced payload carries those fields.
- Replay, retry, remediation, recovery, and safe-point restoration MUST rehydrate the persisted packet or fail closed; they MUST NOT reconstruct required identity from tier-era compatibility objects or loose prose fields.
- `additionalProperties: false` in the schema is normative. Adding, renaming, or widening fields requires a governed successor `schema_version`.

Redaction and secret rules:
- `execution_unit_context` MUST NOT persist raw secrets, tokens, passwords, credentials, API keys, provider auth values, or local machine secrets.
- Secret-bearing state is represented only through governed refs outside this payload; `redaction_profile` may disclose `no_secrets`, `redacted`, or `secret_refs_only`.

Negative constraints:
- No consumer may redefine the field set, required list, optional list, enum values, or nullability rules.
- No persisted context payload is valid without `schema_version`.
- No runtime, storage, provider, GUI, PlanCompile, or Planning Wizard consumer may treat this contract as evidence that Puppet Master is buildable.

Stale local worker identity names such as `requested_persona_id`, `effective_persona_id`, `_persona_id`, and `/values` persona slots are compatibility inputs only; provider and model choices remain precedence inputs that must resolve into `execution_unit_context` identity fields before dispatch.

`execution_unit_context` is the node-native execution-core handoff that replaces or wraps `TierContext` between scheduler, worker spawn, verification, remediation, recovery, and UI projections.

ContractRef: ContractName:Plans/execution_unit_context.schema.json, Plans/Prompt_Pipeline.md#6.4 Effective resolution record, Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor, Plans/Crosswalk.md#3.1 Runtime orchestration ownership

### 5.1 Unified `DispatchContext` projection
The canonical dispatch view is the unified `DispatchContext` projection over one `execution_unit_context` instance. `DispatchContext` reads the required, optional, type, nullability, and enum rules from `Plans/execution_unit_context.schema.json`; it does not own a second required-field list.

Behavioral rules:
- dispatch, recovery, remediation, and inspection read one execution-unit packet rather than tier-era compatibility objects.
- downstream consumers join losslessly to attempt, worktree, permission, and runtime records.
- blocked-action carrythrough stays anchored to blocked-episode lineage.
- Assistant Chat populates `execution_unit_context.worktree_id` and `working_directory` from `thread_state:{thread_id}:worktree_binding` at turn-start, freezes those values for the turn, and sends the frozen `working_directory` through FileSafe checks, tool invocation cwd, MCP tools, `@file` resolution, auto-retrieval scope, and provider CLI or DAE execution-context payloads.
- Worktree-bound safe points include `worktree_id`, `worktree_path`, `branch_name`, and `HEAD_sha`, with `HEAD_sha` captured from `git rev-parse HEAD` in the worktree before mutation-capable execution continues.
- Runtime safe points are recovery/audit anchors, not user-facing restore points; Assistant Chat blocked-state and `/runtime-identity` consumers must rely on `execution_unit_context`, `usage_event_ref`, and blocked records instead of stale closure verdicts.
- A worktree-bound safe point is valid only while the referenced worktree identity is not contaminated and still matches the recorded fields; contamination or stale baseline must surface as a blocked/degraded recovery event.
- `/safe-point/runtime` policy is one field/event/object family: safe-point, restore-point, rollback, and contamination records share `/event/object` identity, state scope, lineage, and recovery semantics rather than competing local object models.
- Wizard-originated runtime handoffs use the same `execution_unit_context` and execution-context payload rules as Orchestrator and Assistant Chat, preserving launch lineage into DAE or provider execution.
- Worktree lifecycle actions are explicit: `recover` restores or reconciles a suspect `/orphaned/conflicted` workspace into a safe known state; `archive` retires active use while preserving `/metadata/lineage`; `prune` is a cleanup-oriented action for policy-eligible `/orphaned/live-no-longer-needed` worktrees; `remove` destructively removes live backing only after confirmation and eligibility checks.
- Historical lineage must survive live worktree cleanup: run/package/node/lane references preserve `worktree_id`, worktree path, branch and HEAD snapshot, compare target or commit-range snapshot, and owning package/lane identity; when backing worktree is missing, consumers render `historical/retired/removed` or `/retired/removed` rather than dropping the record.
- Worktree-aware projections must not assume one active-worktree or current-worktree scalar. File tree surfaces, artifact roots, `/worktree` displays, and safe-point payloads read active package-lane worktree sets, because rewrite-era surface ownership mixed with tier-era execution/worktree identity is a high-risk backdoor for drift.
- Runtime `/artifact` and tool drills carry attempt identity: `artifact_id`, attempt/`/receipt-based` refs, `tool_name`, invocation summary or `invocation_summary`, options, and `usage_event_ref` remain secondary detail refs under `execution_unit_context`; node-only or re-describing action contracts are compatibility inputs, never replacements for attempt identity or canonical runtime attribution.
- Wizard, Builder, settings/GUI, and CUP pre-run handoffs carry requested/effective account identity, `/account/role` disclosure, actor/role, execution-role/`execution_role`, `/model` plus provider/model/persona policy, `/governance`, explicit `/isolation` and worktree mode, and `/package/seam` launch lineage through the same `execution_unit_context`; stale `/Builder`, `/role`, `/subtask`, `/worktree`, `/model/persona`, `CUP`, `intent-specific`, `orchestration-mode`, `ContributePr`, and `single-branch` shortcuts are compatibility/source-lineage labels unless mapped into explicit runtime policy.
- `/interview` and wizard handoff payloads carry blocked-state and runtime identity through the same packet rather than stopping at local lineage fields.
- Executor and Prompt Pipeline are the canonical execution_unit_context producer/consumer pair; storage and `/event/docs` consume the shared field set by reference instead of cloning partial runtime identity payloads.
- Compatibility adapters may derive `decomposition_context` or `selection_context` for selector translation, but those objects are optional disclosure or planning views only; `execution_unit_context` remains the canonical object for dispatch, recovery, remediation, and runtime inspection.
- `Plans/Prompt_Pipeline.md` captures the immutable handoff bundle, and Executor consumes that bundle with `/runtime`, `/recovery`, and `/blocked` anchors intact when a resumed flow launches. `Plans/Executor_Protocol.md` owns the dispatch-side section for mandatory dispatch fields, conditional recovery/blocked fields, and optional disclosure fields.
- The attempt-native handoff identity includes `run_id`, `node_id`, `attempt_id`, `scheduler_pass_id`, and lineage metadata before worker spawn. Those fields make resumed runtime inspection deterministic instead of reconstructing a partial handoff from tier-era compatibility objects.
- Usage correlation follows `usage_event_ref` plus run/node/attempt/package/lane identity; tier-era usage correlation and `usage-event` shorthand are compatibility only.
- `Progress` remains widget-composed, but default widget contracts must not reintroduce tier-era or `tier_id` ownership. `Plans/usage-feature.md` (`usage-feature.md`) is consumed only through run/node/attempt/package/lane usage identity when Executor receipts or progress projections need cost and usage context.
- Optional UI, `/ledger/history/debuggability`, and inspection fields such as `thread_id`, `scheduler_lane`, `feature_seam_id`, `work_package_id`, `manual_priority`, `allowed_action_ids`, `allowed_action_ids[]`, `operational_identity`, and `effective_project_id` may enrich projections but are not prerequisites for dispatch validity.
- Assistant Chat and operational surfaces may expose `/queue` and thread-routing views for multi-lane concurrency and effective identity display, but those projections read scheduler/runtime records rather than collapsing the run into a single-threaded thread or queue owner.
- Every side-effect-bearing or evidence-bearing runtime object must answer which run, `/attempt`, node, `/thread`, provider attempt, effective account/runtime identity, `/runtime` object, `/artifact`, and `/usage` reference produced or owns it.
- Seams-tab projections group top-level `Feature Seams` and second-level `Work Packages`; node entries render as summaries and `/problem` drill-ins, while detail panels emphasize governance, completion, and `/completion/integration` truth rather than raw node execution churn.
- `/Orchestrator` navigation replaces tier-era Dashboard/Orchestrator widget vocabulary with the rewrite-era Progress and `/Seams` set; `Progress` remains execution-state projection while `/Seams` carries seam/package governance structure.
- Source Control stays worktree-first while routing by canonical worktree object identity: `worktree_id` and `base_branch` are durable routing fields, CTAs preserve worktree lineage and `/state`, active-run ownership is visible before destructive actions, first-class worktree selection is not shell state, thread-scoped state, or tier metadata, and tier metadata cannot replace canonical worktree identity.
- Route payloads restore `focused_run_id` and `/object` context instead of merely switching tabs; route/object vocabulary stays shared so UI_Command_Catalog and Final GUI consumers do not re-fragment route targets.
- Route pivots normalize `object_kind = worktree` plus `/seam/package/concern/promotion` subjects through `object_kind` route targets, not filter-shaped payloads; `resume_url` is transport compatibility, and blocked-thread messages resolve to shared route/runtime actions.
- A `route-target` seam prevents deep-link routing from turning into per-surface spaghetti: exact-record exports depend on record-envelope ownership, `/help`, follow-up, cross-reference, and runtime-identity routes stay shared, and deep-link parameters may add presentation focus only after canonical object identity is known.
- Route payloads must not absorb filter or `/subview` noise and become surface-shaped again. Once Executor has the runtime contract, stale route examples are a consumer-doc sourcing problem, not a missing-runtime-contract problem.
- Storage already carries most route/open identity needed for this seam; the remaining lag belongs to universal-open and `/file-centric` consumer docs, which must consume Executor route/runtime identity instead of inventing a second open model.
- `Overseer` remains user-visible / doc-visible where this protocol title and legacy role framing require it, but `/runtime` worker copy prefers `overseer-spawned node worker`; `delegated worker` is a vague compatibility label, not the canonical execution actor name.
- File mutation logs store absolute paths. If `cmd.chat.revert` targets a removed worktree path such as `/project/.puppet-master/worktrees/thread-abc/src/main.rs` for an edit to `src/main.rs`, the executor reports `Cannot restore file: original path no longer exists. The worktree may have been removed.` and does not recreate missing directories.

ContractRef: Plans/Prompt_Pipeline.md#6.4 Effective resolution record, Plans/Contracts_V0.md, Plans/Crosswalk.md#3.1 Runtime orchestration ownership
## 6. Overseer dispatch algorithm (deterministic)

Compatibility/source-lineage disposition: older smallest-lexical-node dispatch wording is no longer the scheduler authority. The canonical executor pass is the scored ready-set algorithm in the Runtime Scheduler Addendum below; lexicographically smaller `node_id` is only the final deterministic tiebreak after scheduler lane, manual priority, transitive unblock count, and ready-since time.

1. Evaluate readiness, blocked, backoff, graph-integrity, and capacity predicates over all candidate nodes.
2. Build the ready set.
3. Score the ready set with the canonical scheduler tuple.
4. Select up to available capacity.
5. Dispatch selected node workers.
6. On worker completion, route verification, receipt, blocked, retry, remediation, or replan outcomes through the canonical runtime outcome taxonomy.
7. Repeat on scheduler wake reasons until no ready nodes remain.

Overseer MUST produce deterministic ordering for identical graph state and Spec Lock inputs.
ContractRef: PolicyRule:Decision_Policy.md§2, PolicyRule:Decision_Policy.md§3

### 6.1 Run-completion Document Packaging gate

Before a run is finalized, Overseer MUST enforce `Plans/Document_Packaging_Policy.md` for any Markdown/text artifact under `.puppet-master/**` produced by the run that reached packaging triggers.

A run MUST NOT be marked complete when any required Document Set audit (reconstruction/line accounting/idempotency, index-manifest match, clean-room determinism) fails.

Scope note:
- This run-completion gate applies to generated `.puppet-master/**` artifacts whether or not the current repo-local `run-gates` command enforces those artifact families directly.
- Repo-local verifier coverage and generated-artifact validator coverage MAY be delivered by different commands, but the packaging contract remains mandatory before final completion.

ContractRef: ContractName:Plans/Document_Packaging_Policy.md, ContractName:Plans/Progression_Gates.md#GATE-014

## Runtime Scheduler Addendum (2026-03-08)

Compatibility/source-lineage disposition: this historical scheduler addendum preserves exact runtime tokens and earlier scheduling examples. Where it overlaps later named PlanUnits, Contracts_V0, Run_Modes, Models_System, storage-plan, or Wiring_Matrix ownership, those owner docs govern; do not infer precedence from this addendum's position.

This addendum supersedes any earlier lexical-dispatch wording wherever they conflict.

### 1. Canonical scheduler pass

The executor MUST process scheduling as a deterministic repeated pass:
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md
1. Rebuild or refresh the candidate node set from canonical run state.
2. Recompute readiness for all candidate nodes.
3. Recompute blocked/backoff/capacity state.
4. Build the ready set.
5. Score ready nodes using the canonical ordered tuple.
6. Select as many nodes as available capacity permits.
7. Emit queue-analysis observability before dispatch.
8. Dispatch selected nodes.

### 2. Readiness rules

A node is ready only if all of the following are true:
- canonical node state is schedulable (`queued`, `reopened`, or equivalent ready-eligible state)
- every blocker in `blockers[]` has completed successfully or reached a state explicitly declared as dependency-satisfying
- no unresolved graph-integrity error exists for the node
- node is not in active backoff
- node is not blocked on HITL, clarification, external side-effect confirmation, permission denial, FileSafe, auth refresh, or replan-required state
- the node's plan/spec generation is still valid for the active `replan_generation`
- runtime capacity allows another dispatch in the applicable lane / pool

Invalid blocker IDs remain invalid graph input and MUST keep the node non-ready.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Progression_Gates.md, ContractName:Plans/Contracts_V0.md

### 3. Deterministic score tuple

The canonical ready-node selection tuple is:
- `scheduler_lane`
- `manual_priority`
- `transitive_unblock_count`
- `ready_since_utc`
- `node_id`

Normalization rules:
- `scheduler_lane` order is `remediation > unblocker > normal`
- larger `manual_priority` wins
- larger `transitive_unblock_count` wins
- older `ready_since_utc` wins
- lexicographically smaller `node_id` wins only as the final tiebreak

Required notes:
- no critical-path weighting term is part of MVP selection
- queue analysis MUST expose the tuple breakdown so the user can see why a node was chosen
- `ready_since_utc` is set when the node first enters the ready set after being non-ready; it is retained while the node stays continuously ready

Selection algorithm:
1. Normalize `scheduler_lane` to `scheduler_lane_rank` where `remediation = 3`, `unblocker = 2`, and `normal = 1`.
2. Sort the ready set by `(scheduler_lane_rank DESC, manual_priority DESC, transitive_unblock_count DESC, ready_since_utc ASC, node_id ASC)`.
3. Persist the complete score tuple on every selected and non-selected node in `scheduler.pass`.
4. Preserve `non_selected_reason` for ready nodes that lose to capacity, lane, or policy bounds.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md

### 4. Capacity-aware parallel dispatch

The executor MUST select up to `available_slots` nodes per scheduler pass.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Graph_View.md

`available_slots` is derived from:
- run-level concurrency limit
- any active package/lane/seam concurrency constraints; legacy phase/task/subtask labels may only normalize into those scopes
- resource / provider saturation limits
- remediation lane reservations when configured

Selection is global across the ready set, not level-by-level lexical dispatch.

### 5. Wakeup triggers

Canonical wake-trigger values and coalescing behavior are defined in `### Wake reasons and coalescing`.

This section is a forward-reference only so the wake-trigger canon has a single owner section in this file.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md

### Wake reasons and coalescing

`wake_reason` is closed to:
- `prerequisite_resolved`
- `approval_resolved`
- `clarification_resolved`
- `auth_recovered`
- `startup_recovered`
- `backoff_expired`
- `verification_completed`
- `remediation_resolved`
- `safe_point_restored`
- `capacity_available`
- `replan_applied`
- `watchdog_recheck`

Coalescing rules:
- Runtime keeps one pending wake set per `{run_id, replan_generation}`.
- The first wake recorded by `(recorded_at_utc, event_id)` becomes the primary `scheduler.pass.wake_reason`.
- Additional wakes in the same pending set are persisted in `scheduler.pass.coalesced_wake_reasons[]` and `scheduler.pass.wake_event_refs[]`.
- One pending wake set produces at most one `scheduler.pass`; no additional pass is created only to replay a coalesced reason.
- `watchdog_recheck` is admitted only when no event-driven wake is pending for the same `{run_id, replan_generation}`.
- `replan_applied` invalidates stale attempts from the prior `replan_generation` before ready-set scoring.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

### 6. Blocked-to-runnable cascade

When a dependency completes or a blocking condition clears:
- direct dependents are reevaluated immediately
- if now ready, they enter the ready set in the same scheduler wake cycle
- unrelated blocked or waiting nodes MUST NOT stall runnable work elsewhere in the graph

Canonical prerequisite-resolution event:
- `node.prerequisite_resolved` — emitted when a prerequisite node completes successfully, is dependency-satisfying via skip policy, or is force-resolved, potentially unblocking dependent nodes
- payload: `{ source_node_id, resolved_prerequisite_id, target_node_ids[], resolution: "completed" | "skipped" | "force_resolved" }`
- wake behavior: receiving this event triggers prerequisite re-evaluation on all `target_node_ids`; if all prerequisites are now resolved, the runtime blocked projection clears and the node transitions from `blocked` to `pending` / ready-eligible queue state in the same scheduler wake
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Graph_View.md

### 7. Failure classes and retry entry points


The executor classifies every failed or non-executed attempt into one canonical failure class or blocked-episode cause before deciding the next action.

Rules:
- transient provider faults, auth expiry, quota pressure, verification failure, reviewer findings, storage I/O, and graph-integrity failure remain distinct outcome families.
- permission-denied, user-declined, headless approval denial, FileSafe block, external-side-effect block, and replan-needed outcomes stay blocked until the owning recovery action resolves them.
- retry, backoff, remediation, safe-point restore, and escalation are keyed from the canonical classification owned by `Plans/Contracts_V0.md`.
- no consumer in this document may revive legacy approval arrays, opaque recovery option lists, or tier-era compatibility nouns.
- Search-in-files / Search side panel handoffs consume Search/FileManager route ownership through `cmd.search.find_in_files` and `cmd.search.open_result`; SSH-backed file-operation handoffs consume FileManager/Tools classification so network/trust failures map to `network_blocked_by_policy`, `host_unreachable`, or `host_untrusted`, permission denial maps to `permission_denied`, and not-found paths map to `path_not_found` without inventing executor-only file failure classes.

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md
### 7.1 Classified outcome matrix
| `classifier_family` | `classifier` | Max retries | Backoff | Auto-retry? | Notes |
|---|---|---|---|---|---|
| `failure_class` | `provider_transient` | 3 | 1s / 2s / 4s | Yes | network errors and transient 5xx only |
| `failure_class` | `rate_limited` | 3 | `Retry-After` or 30s fallback before bounded retry continues | Yes | 429 / provider pressure remains distinct from generic transient failure |
| `failure_class` | `structured_output_invalid` | 2 | none | Yes | malformed provider structured output |
| `failure_class` | `verification_failed` | 0 | — | No | may spawn remediation or review flow; no blind retry |
| `failure_class` | `reviewer_findings` | 0 | — | No | may spawn remediation or remain pending review |
| `failure_class` | `auth_expired` | 1 | immediate after refresh | Yes | refresh once, rebuild client, retry once |
| `blocked_reason_code` | `permission_denied` | 0 | — | No | requires explicit user decision |
| `blocked_reason_code` | `user_declined` | 0 | — | No | terminal unless the user explicitly changes posture |
| `blocked_reason_code` | `headless_ask_denied` | 0 | — | No | blocked or denied outcome; never silently retry |
| `blocked_reason_code` | `filesafe_blocked` | 0 | — | No | never auto-retry; honor FileSafe restore requirements |
| `blocked_reason_code` | `external_side_effect_blocked` | 0 | — | No | preserve local work and wait for approval/decline |
| `failure_class` | `storage_io` | owner-routed by `storage_io_class` | owner-routed | Conditional | Storage owns the closed class and retry budget: `interrupted` permits at most three immediate adapter retries and `transient_busy` permits exactly one retry after 250 ms; every other class is non-retryable. Adapter retries do not create a new Executor attempt. |
| `failure_class` | `quota_exceeded` | 0 | — | No | user action or later retry window |
| `failure_class` | `graph_integrity` | 0 | — | No | hard fail; replan path only |
| `blocked_reason_code` | `replan_required` | 0 | — | No | remain blocked until patch or replan is applied |

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Contracts_V0.md

Closed mapping requirements:
- provider/network 5xx or transient disconnects map to `failure_class = provider_transient`.
- provider 429 or quota pressure that can retry later maps to `failure_class = rate_limited`; hard quota exhaustion maps to `failure_class = quota_exceeded`.
- malformed model/provider structured output maps to `failure_class = structured_output_invalid`.
- verifier failure and reviewer findings stay distinct as `verification_failed` and `reviewer_findings`.
- missing or expired refreshable credentials map to `failure_class = auth_expired`; absent credentials, missing scopes, or required login before admission map to `blocked_reason_code = auth_required`.
- operator permission denial maps to `blocked_reason_code = permission_denied`.
- approval declined, headless approval denial, FileSafe denial, external side-effect approval, replan-required, validation blockers, worktree conflicts, and dirty worktrees remain blocked reason codes, not failure classes.
- unknown values fail closed as `blocked_reason_code = validation_blocked` until the owning enum is extended through governance.

Per-class (`per-class`) retry rules:
- `provider_transient` uses exponential backoff with base `1s`, factor `2x`, and cap `4s`: `1s -> 2s -> 4s`
- `rate_limited` remains distinct from `provider_transient`; executor policy MUST preserve that distinction when deciding backoff, surfacing state, or opening circuit breakers
- `storage_io` consumes the storage-owned `storage_io_class` result and exact retry facts; Executor MUST NOT broaden retryability, restart a canonical write as a new attempt, buffer pseudo-durable work, or auto-resume a blocked attempt after storage recovery
- while storage reports `storage_access_mode != writer`, no mutation-capable attempt may enter dispatch; an explicit storage recovery action may make the owning runtime action available again, but the blocked episode remains until that action is separately admitted
- generic retry without prior classification is prohibited

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/CLI_Bridged_Providers.md

### 7.2 Doom-loop guard

If the same triple `(tool_name, serialized_args_hash, error_message)` is observed twice consecutively at the same nesting level, the executor MUST emit `stop.identical_failure` and terminate the run immediately.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md

### 7.2A Cross-owner retry, usage, and lifecycle alignment

The executor's retry/classification consumer surface spans `### 7.1 Classified outcome matrix`, `### 7.2 Doom-loop guard`, `### 7.3 Signal handling and process lifecycle`, and `### Blocked and retry behavior`; together those anchors are the executor `/classification/lifecycle` projection and must not redefine the owning Run Modes, Tools, storage, usage, or provider-facade contracts.

Provider-transient retry evidence preserves the explicit `1s -> 2s -> 4s` sequence and the compatibility shorthand `/2s/4s`; retry counters are per-error after classification, not a shared global retry bucket. Doom-loop matching uses `(tool_name, args_hash, error_message)`, where `serialized_args_hash` is the canonical serialized form of `args_hash`; the terminal outcome is `kill.identical_failure`, with `stop.identical_failure` retained only as an older compatibility alias.

The fresh-worker retry value is preserved only with explicit handoff artifacts. Executor does not copy the simplistic single-story loop as-is: retry may dispatch another overseer-spawned node worker, enter remediation, request review or `/corroboration`, open graph patch/replan, or restore through safe-point logic.

MCP tool inventory discovery around `listTools` is degraded, not unavailable: retry three times with 1s backoff, then use the last-known stale tool list until the five-minute periodic refresh succeeds. Failed discovery must never permanent-kill the executor, provider session, or run by itself.

Bridged-provider execution consumes `### Contract shape (facade)` and `### Provider guard rails` from `Plans/CLI_Bridged_Providers.md` (`/CLI_Bridged_Providers.md`), the provider-facade owner-doc for bridge tool-event payloads. Provider adapters must complete `/parsing/sanitization/payload-preflight` before executor classification, and stream disconnects use `/resume` with at most three reconnect attempts, provider-specific constants, and a circuit breaker that moves open to half-open to close or `/reopen`.

Storage and usage alignment consumes `### 2.4 Projector pipeline`, `## 3. Implementation checklist`, and `### 8.3 Startup and shutdown` from `Plans/storage-plan.md`, plus `### Canonical usage pipeline` from `Plans/usage-feature.md` (`/usage-feature.md`). Executor receipts carry `checkpoint-marker`, `run.completed.usage`, the bounded `usage.jsonl` compatibility retirement path, `lock-path` / FileSafe / worktree path alignment, and the split between pre-dispatch `kill.budget_exceeded` and post-response `done.budget_exceeded`.

Regex-index build lifecycle state is executor-observable for scheduling, blocking, and cancellation: each project index transitions `no_index` -> `building_full` -> `ready`, `ready` -> `rebuilding_incremental` -> `ready`, and forced rebuild uses `ready` -> `building_full` -> `ready`; failures and cancellation still use the executor's classified error/cancel paths rather than anonymous indexing work.

Regex-index builds use one build-slot per project. A new full or incremental build request either occupies that build-slot or supersedes the pending build plan before entering `building_full` or `rebuilding_incremental`, so executor scheduling never runs competing builders for the same project index.

The executor-visible regex-index FSM is `no_index → building_full → ready → rebuilding_incremental → ready`; any state may move to `error` on failure. Superseded builds cancel through a `CancellationToken` checked between file-processing iterations, clean partial generation directories, and multi-project builds share a thread pool while per-project build slots enter FIFO order when the pool is saturated. Per-project build slots also prevent concurrent writes to regex-index generation directories.

Helper and background attempts remain first-class usage contributors: `/helper/background` lineage must be represented in the execution receipt and projected usage record instead of disappearing into generic background work. Prompt/context handoff preserves implementation-grade `/context` continuation, giant-instruction-file handling, budget-visibility, and compatibility-shim retirement semantics.

Lifecycle shutdown consumers treat shutdown as `/idempotent`: double shutdown is guarded with a Once/idempotent root and becomes a safe no-op rather than a second destructive lifecycle transition.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/WorktreeGitImprovement.md

### 7.2B Stream coalescer, backpressure, and transport decision receipts

Provider, CLI, SSE, WebSocket, stdout, unix-socket, and HTTP adapters settle streams through one stream coalescer. The coalescer admits `partial_delta`, `cumulative_snapshot`, `reasoning_delta`, `tool_call_fragment`, `provider_item_id`, `provider_error`, `final_assistant_turn`, and `durable_history_write` phases, but only `final_assistant_turn` plus the matching receipt may become durable assistant history.

Transport defaults:
- `stream_terminal_event_timeout_ms = 5000`.
- Missing terminal event before timeout is a retryable transport failure with `failure_class = provider_transient` and `timeout_class = inactivity_timeout`; zero-usage aborted turns are not replay content.
- Backpressure bound is `max_pending_stream_frames = 1024` or `max_pending_stream_bytes = 16777216`, whichever trips first.
- Overflow returns a structured overload/blocking result with `blocked_reason_code = validation_blocked`, `transport_pressure = overloaded`, and no silent frame drop.

Every adapter selection records `transport_decision_receipt` with `receipt_id`, `schema_version`, `run_id?`, `node_id?`, `attempt_id?`, `provider_id`, `adapter_kind`, `transport_kind`, `locality`, `auth_mode`, `replay_policy`, `backpressure_policy`, `fallback_policy`, `provider_support_ref`, `decision_reason`, `selected_at_utc`, and `event_refs[]`.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/storage-plan.md

### 7.3 Signal handling and process lifecycle


PM entrypoints establish the canonical shutdown root with `signal.NotifyContext` or an equivalent once-owned signal fan-out before any managed subprocess is started.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Provider processes receive `SIGTERM` / `SIGINT` with a 5-second grace window. MCP and LSP subprocesses receive a 3-second grace window. `SIGHUP` reloads config. All managed subprocesses run in isolated process groups.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md

### 8. Safe points

#### 8.1 Worktree snapshot in safe-point payloads


When an execution unit runs inside a worktree (thread-owned or orchestrator-owned), the safe-point event payload MUST include:

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md

| Field | Type | Description |
|---|---|---|
| `worktree_id` | string? | ID of bound worktree, null if running in main repo |
| `worktree_path` | string? | Absolute path of worktree on disk |
| `worktree_branch` | string? | Branch checked out in worktree |
| `HEAD_sha` | string? | `git rev-parse HEAD` captured from the worktree when the safe point or recovery snapshot is created |
| `worktree_dirty` | bool | Whether worktree has uncommitted changes at snapshot time |

These fields enable remediation/resume to restore the correct execution context. They are advisory for recovery — the canonical binding source is the redb projection from seglog events.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md


Before any mutation-capable node attempt, the executor MUST create or attach a runtime safe point.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/WorktreeGitImprovement.md

Required properties:
- `safe_point_id`
- `run_id`
- `node_id`
- `attempt_id`
- `worktree_path` or equivalent execution root
- `worktree_id`, `branch_name`, and `HEAD_sha` for worktree-bound attempts, with `HEAD_sha` captured from `git rev-parse HEAD` in the worktree
- refs to the relevant pre-attempt artifact/workspace baseline
- active `replan_generation`

Safe points are runtime recovery anchors. They are not user-facing restore points and MUST NOT be conflated with thread rewind/rollback semantics.
ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md, ContractName:Plans/newfeatures.md

### 9. Remediation child lineage

When verification or review requires an automatic fix cycle:
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Project_Output_Artifacts.md
- create remediation child lineage attached to the failed node attempt
- record `remediation_root_id`, `remediation_parent_attempt_id`, `generation`, and `origin_failure_event_id`
- preserve finding IDs / issue IDs through the remediation cycle
- retry the parent node only after remediation completes and the retry policy says to continue

A canonical graph node is created only when the remediation requires a replan that changes scope.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/Decision_Policy.md

### 10. Draft decomposition degradation boundary

The executor MUST distinguish between:
ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Progression_Gates.md
- draft decomposition / pre-canonical planning
- canonical graph execution

Rules:
- draft decomposition may degrade to deterministic flat sequencing with warning evidence when dependency output is invalid or cyclic
- canonical graph execution MUST NOT silently flatten or otherwise degrade invalid canonical graphs
- invalid canonical graphs are `graph_integrity` failures and stop execution until repaired
- A `text-only` projection is not a fallback mode for required rich execution surfaces; the executor MUST NOT silently degrade required artifacts, tool outputs, or browser/web surfaces to text-only output.
- When `auto-use` fires before canonical execution, on-trigger behavior creates or refreshes a plan in `draft` state, surfaces the sticky Plan panel, and keeps it user-dismissible and reviewable before execution observes the revised TODO projection.
ContractRef: ContractName:Plans/Progression_Gates.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/chain-wizard-flexibility.md

### 11. Acceptance criteria

- Ready-node selection is no longer defined as pure lexicographic dispatch.
- Queue analysis explains why selected nodes won and why ready-but-unselected nodes did not.
- Parallel dispatch is capacity-aware and deterministic.
- Blocked-to-runnable cascade is explicit and event-driven.
- Safe points exist before risky execution.
- Retry behavior is class-driven, not generic.
- Canonical graph integrity failures do not silently degrade.
## Runtime Scheduler / Recovery Canonical Alignment (2026-03-09)

Compatibility/source-lineage disposition: this historical recovery addendum preserves exact scheduler/recovery terms. It is subordinate to the consolidated runtime/addenda boundary and named owner sections where overlapping rules appear.

This addendum is normative and supersedes any earlier pure-lexicographic dispatch wording where they conflict.

### Runtime recovery scheduler pass
The executor MUST process scheduling as a deterministic pass with these steps:
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md
1. refresh candidate runtime state for the active `replan_generation`
2. recompute readiness, blocked state, and backoff state
3. recompute lane and score terms for every ready candidate
4. select up to available capacity
5. emit queue-analysis state before dispatch
6. dispatch selected attempts

### Readiness contract
A node is ready only when all blockers are satisfied, the generation is current, the node is not blocked, the node is not in backoff, and capacity rules permit dispatch in its lane. Nodes blocked by permission denial, FileSafe, auth refresh, user confirmation, or replan-required state are not ready.

### Runtime recovery score tuple
The canonical selection tuple is `(scheduler_lane, manual_priority, transitive_unblock_count, ready_since_utc, node_id)`.
- `scheduler_lane` order: `remediation > unblocker > normal`
- higher `manual_priority` wins
- higher `transitive_unblock_count` wins
- older `ready_since_utc` wins
- `node_id` is the final tiebreak only

No critical-path term is part of MVP selection.

### Runtime recovery wakeup triggers
See `### Wake reasons and coalescing` for the canonical wake-trigger list, `wake_reason` values, and watchdog-only polling rule.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Orchestrator_Page.md

### Blocked and retry behavior

The executor treats rich `/editor-agent` and `/workbench` surfaces as runtime peers of terminal, browser, document, and artifact callers. `/plugin-first` and command-first entry points, `/rules/skills` guided plans, multi-surface review loops, `/persisted` tabs and `/splits/windows`, and `/history/navigation` re-entry all dispatch through the same `execution_unit_context` rather than surface-local state. Auth `/login` friction, remote/reconnect loss, dumb-mode or `/disabled-feature` fallbacks, regex-heavy UI blocking, indexing/startup cost, performance pressure under large projects, and IDE `/workbenches` switching clutter surface as explicit blocked, degraded, backoff, or recovery events and MUST NOT erase attempt identity, safe points, worktree binding, diff/review visibility, or user-visible autonomy defaults.

Browser-driven debug handoff uses explicit pause and `/resume` inside an isolated automation session. Auth and `/manual-repro` boundaries degrade to `attention_required`; the MVP does not support chaotic concurrent mixed steering as the default co-pilot model. Richer co-piloting, collaborative browser steering, and broader remote parity are future expansions after the pause/resume handoff proves stable.

Runtime context summarization should stay PM-native. The executor must not transplant a provider `_context_updates` protocol as-is; PM treats that protocol as a reference for incremental tool-result compression driven on every tool call, then emits its own context-detail and compaction updates so tool-result history remains auditable. Incremental shrinking must preserve stable tool-call handles such as `tcN` labels for safe targeted replacement, and the active model or LLM may replace stale full tool results with short audited summaries as part of the ordinary subsequent model/tool-call flow, without a separate extra LLM call; already-compressed results must not be re-compressed.

UI `/checkpoint`, `/approve/deny`, retry, and `/seam/lane/promotion/resolution-thread` actions are runtime action families keyed by `blocked_sequence` and `allowed_action_ids[]`; they are not graph-local commands, completed-work shortcuts, or single-current-task state.

Projection and setup rules:
- Cursor-native managed instructions target `.cursor/rules/*.mdc` and the `.cursor/rules` tree; `.cursorrules` is legacy compatibility only and must not be the primary managed target. Compatibility outputs such as `AGENTS.md`, `CLAUDE.md`, root-level files, or provider-native projected copies are optional, target-based projections, and readiness must never depend solely on projected copies.
- At launch-time, a `PM Outdated` projection should auto-reproject before run launch when safe.
- GUI auth/setup copy exposes user-visible choices such as `Sign in with ChatGPT` and `Use API Key`; lower-level protocol details remain recovery diagnostics unless needed to resolve failure.
- Direct-Gemini OAuth removal is treated as PM app-policy and /compliance/public-distribution policy, not evidence that Google OAuth disappeared as a protocol.


The executor MUST classify every non-success outcome before applying policy.

- blocked episodes preserve local work, runtime identity, and explicit resume prerequisites.
- FileSafe and external side-effect blocks do not auto-retry; they wait for the owning restore or approval action.
- one decision path must not treat the same situation as both a failure class and a blocked-episode cause.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Permissions_System.md

### Runtime recovery attempt identity and safe points
Every dispatch creates or reuses a first-class `attempt_id`. Mutation-capable attempts and remediation apply steps MUST create a runtime `safe_point_id` before execution. Safe points are runtime recovery anchors only; they are not restore points.
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md

### Canonical Executor intake/receipt recovery propagation

The materialized `executor_intake_report` and `attempt_receipt` families consume their exact machine-registry recovery dispositions: `authority_class = canonical_non_rebuildable` and `strategy = restore_from_mandatory_backup`. Executor MUST NOT reconstruct either canonical family from EventRecords, runtime or audit projections, UI state, worker/controller prose, receipt summaries, or other derived views. Those surfaces may diagnose the loss but cannot become canonical intake, attempt, completion, or dispatch authority.

If either required family record is corrupt, unavailable, or cannot be verified, Executor keeps the affected intake/completion truth `blocked` or unknown and admits no completion or dispatch. Admission may be reconsidered only after Storage durably completes the verified whole-boundary mandatory-backup recovery, restores the exact canonical family bytes, and Executor reruns ordinary schema, identity, lineage, currentness, and admission checks. Writer availability, a fresh projection, or a UI success state never auto-resumes work or certifies completion.

Positive oracle: verified mandatory-backup recovery restores the exact `executor_intake_report` and `attempt_receipt` records at one durable Storage recovery boundary; only a subsequent successful ordinary Executor revalidation may admit the corresponding completion or dispatch.

Negative oracle: with either canonical family corrupt or unavailable, matching EventRecords, projections, UI state, summaries, or worker/controller claims cannot reconstruct success, mint or reuse an attempt, accept completion, or dispatch work; the posture remains blocked or unknown.

ContractRef: ContractName:Plans/storage-plan.md#canonical-redb-recovery-and-first-run-proof, ContractName:Plans/storage_value_registry.json#/families/executor_intake_report, ContractName:Plans/storage_value_registry.json#/families/attempt_receipt, DecisionID:PD-L-01, DecisionID:PD-L-02, DecisionID:PD-L-03

### Conversation restore-point no-effect boundary

Assistant Chat owns `cmd.chat.create_restore_point`, `cmd.chat.branch_from_restore`, and `cmd.chat.delete_restore_point` under `PD-RSP-08`. Executor consumes those commands as a strict no-execution boundary: create, apply/branch, replay, refusal/failure, and delete create no runtime `attempt_id`, no successor attempt, no runtime `safe_point_id`, no Executor worktree or file/repository/index mutation, and no scheduler or worker dispatch. A successful `branched` result creates only the Assistant Chat-owned new conversation `thread_id` and `branch_id`; it does not become Executor lineage or completion evidence.

Executor owns no conversation restore-point retention timer, clock, janitor cadence, count-pressure selection, hold release, or expiry transition. It consumes Storage and Assistant Chat retention truth and MUST NOT infer `reference_release`, age/count eligibility, or an `expired` transition from UI/projection state.

Positive oracle: each existing restore-point command produces only its Assistant Chat/Storage-owned record, conversation branch, lifecycle, or no-event result while Executor attempt, safe-point, worktree/file, and dispatch state remains byte-for-byte unchanged.

Negative oracle: any restore-point create/apply/delete path that mints or reuses an Executor attempt, creates a successor attempt or runtime safe point, mutates a worktree/file/repository/index, dispatches work, or runs an Executor-owned retention timer violates the contract and must fail closed.

ContractRef: ContractName:Plans/assistant-chat-design.md#branching-conversations, ContractName:Plans/storage-plan.md#Case-L-6, ContractName:Plans/storage_value_registry.json#/families/restore_point_record, DecisionID:PD-RSP-08

### Approved baseline-target retry and restore lifecycle

This section owns Executor admission, blocked-episode continuity, successor-attempt identity, and dispatch ordering for approved decision `PD-RSP-07`. `Plans/WorktreeGitImprovement.md` owns the filesystem/Git effect and postcondition of each `baseline_target`; `Plans/FileSafe.md` owns safe-point capture, exact-replace restore, equality, journal, rollback, and restart reconciliation; `Plans/Contracts_V0.md` owns the closed restore outcomes and reason codes; `Plans/storage-plan.md` owns the safe-point record, restore transaction, snapshot custody, recovery-anchor persistence, and retention. Executor MUST consume those owners by reference and MUST NOT implement a second restore engine, redefine manifest equality, or infer durable state from UI projections.

`baseline_target` is closed to `safe_point | historical_commit | worktree_head`. Runtime rejects an unknown value, a missing conditionally required field, an abbreviated or moving Git ref where an exact commit OID is required, a repo/worktree mismatch, or digest drift. It MUST NOT substitute a base branch, current worktree, latest safe point, or current `HEAD`.

| Target | Executor admission fields | Executor lifecycle effect after Worktree/FileSafe proves the target postcondition |
| --- | --- | --- |
| `safe_point` | `safe_point_id`, `repo_id`, `worktree_id`; the owning command/episode identities remain required | Link the exact restore transaction and baseline receipt, then mint a successor `attempt_id`. The prior attempt remains immutable. |
| `historical_commit` | exact `historical_commit_oid`, `repo_id`, and source `worktree_id` for lineage | Link the new isolated worktree identity and exact resolved commit OID, then mint a successor `attempt_id`; the source attempt/worktree remains preserved. |
| `worktree_head` | `repo_id`, `worktree_id`, `expected_head_oid`, `expected_state_sha256`, and explicit dirty-state confirmation when dirty | Link the verified live-state receipt without restore or checkout, then mint a successor `attempt_id`. |

Command admission is narrower than enum validity:

- `cmd.runtime.restore_safe_point_then_retry` accepts only `baseline_target = safe_point`. It requires the current blocked episode to expose that exact `allowed_action_id`, the same `blocked_sequence`, and the named safe point/repo/worktree identity.
- `cmd.orchestrator.safe_point_retry` and compatibility alias `cmd.orchestrator.restore_safe_point_then_retry` accept the same wrapper input: `{ project_id, run_id, node_id, blocked_sequence, attempt_id, safe_point_id, repo_id, worktree_id, baseline_target: "safe_point", permission_snapshot_id? }`. Admission validates optional `permission_snapshot_id` against current permission state and consumes it. Both apply the identical deterministic transform to the exact canonical payload `{ project_id, run_id, node_id, blocked_sequence, attempt_id, safe_point_id, repo_id, worktree_id, baseline_target: "safe_point" }` before dispatch. The sole domain/handler pair is `cmd.runtime.restore_safe_point_then_retry` / `handlers::runtime::restore_safe_point_then_retry`; wrapper and alias share its result, `safe_point.restored` producer, effects, idempotency identity, and admission decision.
- When `requires_safe_point_restore = true`, `restore_safe_point_then_retry` is the only legal rerun verb. `retry_now`, `start_fresh_attempt`, and resume paths are rejected even if they carry a syntactically valid target.
- `cmd.runtime.retry_now` and `cmd.runtime.start_fresh_attempt` may accept any of the three targets only when the active blocked/retry policy allows that verb and every target-specific field is present. Selecting `safe_point` on either verb still invokes the same FileSafe restore transaction; it is not a weaker restore.
- A retry/fresh-attempt command that carries no SCM target may follow only an owner-defined non-SCM retry path. It MUST NOT infer one of the three values from current UI focus or branch state.

#### Restore-before-rerun sequence

1. Load the canonical blocked episode and verify its `{run_id, node_id, blocked_sequence, prior_attempt_id}` plus ordered `allowed_action_ids[]`. Reject stale command identity without changing the episode.
2. Verify that the storage owner still permits durable mutation, that the safe-point record and snapshot refs are restore-eligible, and that the blocked/recovery hold is durable. If the only legal remedy is not durably anchored, keep the episode blocked and do not start restore or dispatch.
3. Ask the Worktree owner to validate exact repo/worktree/branch identity and acquire the applicable mutation fence. For `safe_point`, invoke the FileSafe transaction and wait for its restart-reconcilable terminal result. For the other targets, invoke the Worktree-owned baseline preparation and exact postcondition check.
4. Persist the baseline-preparation result and all source-control/FileSafe receipt refs before creating runnable successor state. A command retry while an operation is nonterminal resumes or reconciles that operation by identity; it MUST NOT launch a concurrent second restore or worktree preparation.
5. Only a proved-ready baseline may mint the new `attempt_id`, bind worktree ownership, and persist successor lineage to the prior attempt, blocked episode, baseline target, OIDs/digests, and receipts. No worker process or external side effect starts before that durable admission point.
6. The recovery anchor releases only through the storage-owned terminal rule. For `superseded_with_verified_successor`, the successor baseline receipt, new attempt/worktree binding, and admission record MUST all be durable first; process exit, run archival, elapsed time, or an unverified successor does not release it.

#### Result-to-lifecycle mapping

Executor consumes, rather than redefines, the Contracts/FileSafe outcome meanings:

| Owner result | Executor action |
| --- | --- |
| `restored_clean` or `restore_skipped` with the required equality proof | Continue the sequence to durable successor-attempt admission. `restore_skipped` still requires zero path mutation and exact target equality. |
| `restore_refused` | Mint no successor attempt, preserve the current blocked episode and worktree ownership, record the exact reason, and expose only actions valid for that reason. |
| `restore_failed` | Mint no successor attempt. Because FileSafe has proved rollback equality, keep the original blocked episode/anchor and record the failed recovery action without claiming target restoration. |
| `restore_recovery_required` | Mint no successor attempt; retain the mutation fence, safe-point/restore-transaction holds, worktree ownership, and blocked episode until explicit reconciliation proves a terminal state. |
| `restored_with_conflicts` from safe-point or Chat-revert restore | Treat as an owner-contract violation, keep dispatch fenced, and route to recovery diagnostics; exact-replace restore cannot use this compatibility outcome. |

For `historical_commit`, a missing/non-commit OID or any mismatch after isolated-worktree creation refuses admission and leaves the source unchanged. If partial provisioning cannot be proven safely removable, preserve that allocation as blocked recovery rather than deleting it optimistically. For `worktree_head`, either OID or state-digest drift refuses admission without checkout, reset, stash, clean, or byte mutation. Explicit dirty-state confirmation authorizes binding only; it does not waive conflict, active-Git-operation, FileSafe, permission, or write-scope blockers.

If a required safe point is missing or corrupt, the episode becomes or remains `recovery_unavailable`, restore is disabled with the exact owner reason, local work and worktree ownership remain preserved, and no cleanup, timer, or retry converts it to resolved. Only explicit abandon, replan, or owner-verified recovery may change that posture.

If canonical storage degrades during this sequence, storage-owned retry and access-mode rules apply. Executor does not replay the recovery command as an automatic attempt and does not resume blocked work merely because writer access later returns.

#### Acceptance oracles

| Fixture | Required Executor oracle |
| --- | --- |
| `RSP-BASELINE-001` | Exact named safe point/worktree is restored and verified before exactly one new attempt becomes runnable. |
| `RSP-BASELINE-002` | Exact immutable commit OID produces a clean isolated attempt worktree; source dirty bytes, index, branch, and ownership remain unchanged/preserved. |
| `RSP-BASELINE-003` | Exact live `HEAD` plus state digest binds without any SCM mutation; dirty state survives byte-for-byte and is attributed to the successor attempt. |
| `RSP-BASELINE-004` | Unknown target, missing conditional field, moving/abbreviated historical ref, identity mismatch, or digest drift is rejected with no substitution and no successor attempt. |
| `RSP-ATOMIC-001` / `RSP-ATOMIC-003` | Restart or third-party-edit injection never dispatches from an unproved intermediate tree; target/rollback equality may continue, otherwise recovery-required remains fenced. |
| `RSP-RETENTION-001` / `RSP-RETENTION-003` | A long-lived restore-required episode retains its legal remedy; a pre-existing missing/corrupt remedy stays truthfully blocked and never becomes retryable by cleanup. |
| storage-I/O fault during safe-point/baseline receipt persistence | Exact storage-owner retry count is observed; exhausted/non-retryable I/O admits no mutation-capable attempt and recovery does not auto-resume it. |

Negative oracles: no worker dispatch before the baseline receipt is durable; no reused prior `attempt_id`; no generic retry while `requires_safe_point_restore = true`; no anchor release before a verified successor; no exact-OID substitution; no dirty-state discard; and no success inferred from projection/UI state.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, DecisionID:PD-RSP-07, DecisionID:PD-RSP-04, DecisionID:PD-RSP-06

For MVP cleanup, the executor uses the canonical workspace or `/remote` project binding plus safe points, restore points, and explicit temporary-vs-durable mutation lineage. It must not require sandbox worktree `/jail` semantics for ordinary debug instrumentation cleanup.

### Runtime recovery remediation lineage
Automatic fix cycles attach to a parent attempt using `remediation_root_id`, `remediation_parent_attempt_id`, `remediation_generation`, finding identifiers, and final resolution state. A new canonical graph node is created only when a replan changes canonical graph scope.

### Degradation boundary
Invalid pre-lock draft decomposition may degrade to deterministic flat draft sequencing with warning evidence. Invalid canonical graphs after graph lock are `graph_integrity` failures and MUST NOT silently degrade.
ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Progression_Gates.md

## Canonical Runtime Scheduler Canonical Alignment (2026-03-09)

Compatibility/source-lineage disposition: this historical canonical-alignment addendum preserves scheduler, blocked, score, and graph-lock tokens. Executor implementers must follow named owner sections and PlanUnits rather than treating adjacent addenda order as precedence.

This addendum is normative and supersedes earlier pure-lexicographic readiness and dispatch wording wherever conflicting.

### Runtime scheduler readiness reconciliation
A node is ready only when all of the following are true:
1. lifecycle state is ready-eligible for dispatch
2. every blocker resolves to an existing canonical node in the active graph
3. every resolved blocker is in a dependency-satisfying state
4. the node is not in active backoff
5. the node is not blocked by any active runtime projection
6. the node's `replan_generation` matches the active run generation
7. no worktree/conflict rule forbids dispatch
8. lane/pool capacity permits dispatch

Invalid blocker IDs are `graph_integrity` problems and keep the node non-ready.

### Node lifecycle versus runtime overlays
Node lifecycle remains the graph-progress contract.

Runtime overlays include blocked, backoff, retrying, remediation, and waiting-approval states.

Rules:
- overlays do not replace canonical node lifecycle values
- readiness consults both lifecycle state and active runtime overlays
- `waiting_approval` is represented through blocked/runtime records rather than by mutating node lifecycle taxonomy
- safe-point and remediation state likewise remain runtime overlays attached to attempts or blocked projections

This preserves one stable lifecycle contract for planning/graph semantics while allowing runtime recovery behavior to remain richly observable.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/human-in-the-loop.md

### Runtime scheduler score term definitions
The canonical score tuple is `(scheduler_lane, manual_priority, transitive_unblock_count, ready_since_utc, node_id)`.

Rules:
- `scheduler_lane = remediation` only for remediation lineage work
- `scheduler_lane = unblocker` when successful completion would increase the ready set for other nodes in the active generation
- `scheduler_lane = normal` otherwise
- `manual_priority` is an integer `0..100`; default `50`; higher wins
- `transitive_unblock_count` counts currently blocked descendants in the active generation that would become ready if this node completed successfully now; invalid/cyclic relationships are excluded
- `ready_since_utc` is reset whenever the node leaves the ready set for any reason and is retained only while the node stays continuously ready
- `node_id` is the final tiebreak only

### Capacity-aware dispatch cycle
For each scheduler wake:
1. refresh candidate runtime state
2. recompute readiness and score terms
3. synchronously reevaluate directly affected dependents for the current wake
4. build the global ready set
5. emit queue-analysis observability keyed by `scheduler_pass_id`
6. select up to `available_slots` in canonical score order
7. dispatch selected attempts

### Runtime blocked-to-runnable cascade timing
When a dependency completes or a blocking condition clears:
- direct dependents are reevaluated synchronously in the same wake cycle
- newly ready nodes enter the same ready set before dispatch completes
- no extra scheduler pass is required just to notice a direct unblock

### Class-driven next-step rules
- provider/model selection, worktree availability, and prerequisite readiness are resolved before dispatch begins.
- dirty-baseline, merge-conflict, approval, auth, or validation blockers surface through the canonical blocked-episode contract owned by `Plans/Contracts_V0.md`.
- class-driven follow-up never silently rewrites runtime identity, worktree ownership, or recovery posture.
- HTE and DAE execution paths share graph-lock and write-scope safety: `/generation` staleness, under-owned `/degradation`, cleanup-remediation loops, FileSafe bypass, side-effect and remote side-effect uncertainty, safe-point/restore-point conflicts, and projection trust failures surface as blocked/degraded/remediation classes rather than silent fallback.
- `node-blocked`, `wizard-blocked`, and thread-blocked projections keep family-local fields separate: node-blocked owns `blocked_sequence`, `attempt_id`, and `failure_class`; wizard-blocked may add clarification `/report` fields; `/persisted` thread notices remain rendered consumer state.
- Executor mints `blocked_sequence` when a HITL, auth, `/storage`, or recovery condition creates a blocked-episode; repeated updates keep the same `blocked_sequence`, and `request_id` is lineage or lookup metadata rather than a competing approval target.
- `startup_recovered` and startup-recovery handshakes restore the existing blocked-episode and `blocked_sequence` when one exists; recovery MUST NOT cause silent block-loss or accidental episode reminting.
- Reserved diagnostic schemas for execution, audit, handoff, and HITL events carry `attempt_id` and preserve attempt continuity as an architecture invariant.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/storage-plan.md

### Graph-lock boundary
Draft decomposition fallback is allowed only before `run.graph_canonical_locked`.
After that event:
- invalid canonical graph structure is `graph_integrity`
- execution MUST stop accepting new dispatches
- no silent flattening or degraded canonical execution is allowed
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Progression_Gates.md, ContractName:Plans/chain-wizard-flexibility.md

### Runtime attempt identity rule
Every retry, resume-after-prerequisite, or safe-point-restored rerun creates a new `attempt_id`. Prior attempts remain immutable historical records.
After graph lock, execution MUST NOT fall back to a planning-artifact-centric, identity-blind, single-branch execution-model; DAE and orchestration paths preserve runtime identity plus `/corroboration/promotion/runtime` context.
## Unified Runtime Scheduler and Attempt Lifecycle Canonical Alignment (2026-03-09)


Compatibility/source-lineage disposition: this historical lifecycle addendum preserves attempt, tier-era, blocked-episode, approval, and provider/model carry-through tokens. It remains a source-lineage section subordinate to the consolidated executor/runtime owner boundary.

This addendum deprecates tier-era vocabulary and extends execution_unit_context, blocked-episode continuity, approval scope, and precedence/worktree ownership semantics.

### Tier-era compatibility retirement

Normative rules:
- Introduce execution_unit_context as canonical runtime-facing context object.
- The canonical dispatch/runtime packet carries execution_unit_context.
- The retired tier-era context object is a derived or compatibility-only selection/decomposition helper.
- Anchor worker spawn, recovery, remediation, coordination, and UI inspection to execution_unit_context.
- The retired tier-era context object and the retired tier-era identifier are not canonical runtime fields; execution_unit_context together with execution_unit_type defines authoritative runtime scope.
- Worker spawn MUST mint or receive execution_unit_context before dispatch, and recovery plus remediation MUST rehydrate that same packet rather than reconstruct runtime scope from retired tier-era compatibility fields.
- Coordination services, scheduler joins, and UI inspection surfaces MUST read one shared execution_unit_context instance so restart, approval, blocked-episode continuity, and audit views resolve the same runtime unit.
- Compatibility adapters MAY derive the retired tier-era context object only for legacy selector translation or decomposition, but they MUST NOT persist, exchange, or rehydrate it as the live runtime contract.
  ContractRef: Primitive:ExecutionContext
  ContractRef: ContractName:Plans/Executor_Protocol.md

### Blocked episode identity and restart recovery


#### Blocked episode acceptance carry-through
- Make blocked_sequence canonical per run_id/node_id blocked episode
- Restore unresolved blocked episodes on restart without reminting them
- Keep request_id as subordinate compatibility handle only
- Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- Carry usage switch-history and usage execution-role follow-through
- Separate blocked-episode approval scope from session-wide policy scope
- Persist durable approver identity fields on approval and rejection events

### Provider/model precedence and parallel worktree assignment

#### Provider/model acceptance carry-through
- Define one owner section covering provider/model precedence across run, seam, package, node, overseer, and delegated-subagent levels
- Tie that section to parallel-node worktree assignment and ownership transitions
- Provider and event records for dispatched work must be promotion-aware and preserve requested/effective account resolution across package and seam overseer delegation; `Phase/Task/Subtask/Iteration` remains legacy taxonomy, not canonical runtime ownership.
- Actor resolver inputs include actor type, package overseer, seam overseer, node worker, verifier/`/reviewer`, corroborator, graph patch planner, recovery actor, operation type, scope level, language/framework, repo `/domain`, and GUI, backend-heavy, or infra-heavy hints. Planning and `/patching` are explicit operation types rather than hidden fallbacks.
- The high-level persona defaults remain policy defaults, not vague prompts: package overseer is biased toward package-local delivery and `/governance` readiness truth, seam overseer toward cross-package integration truth, node worker toward `/implementation` by language and `/framework/work`, verifier/`/reviewer` toward review, corroborator toward `/challenge`, recovery actor toward `/recovery`, and graph patch planner toward `/architecture`.
- `auto` resolution must be explainable through an actor-type mapping. When `auto` selects an account/model/persona for an overseer or worker, the receipt records the resolved actor-type basis so overseer-heavy rewrite roles do not feel arbitrary.

Persisted executor/runtime events consume the canonical EventRecord envelope in `Plans/Contracts_V0.md#EventRecord` and the machine-readable schema in `Plans/event_record.schema.json`. Executor-owned records may define event semantics and receipts, but they must not copy the EventRecord field set or store raw secrets in event payloads.

### Run-level deferred rule
- if any node is runnable, the run remains active.
- if no node is runnable and blocked, backoff, or prerequisite-waiting work exists, the run is deferred rather than terminal.
- prerequisite resolution, restore completion, remediation completion, auth recovery, or capacity change wakes the scheduler.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md
## Counter Relationships and Event Ordering Addendum

### Counter relationships

```
attempt_count = automatic_retry_count
             + prerequisite_resume_count
             + manual_resume_count
             + remediation_retry_count
             + 1 (initial attempt)
```

- `attempt_count` is the total number of attempts for a node across all causes.
- Each sub-counter tracks attempts triggered by a specific cause.
- The sum of all sub-counters plus the initial attempt MUST equal `attempt_count`.
- Each sub-counter increments at attempt start, not at completion.
- Independent policy counters MUST NOT be inferred by subtracting from `attempt_count`.

Debug-mode verification records a `verification_summary` with `adapter_kind`, `attempt_count`, `passed`, `heuristic_version`, optional `latest_receipt_ref`, and optional `notes[]`. Agent-session verification passes only when the prior `failure_class`, `blocked_reason_code`, or tool error signature does not recur and the rerun reaches the expected terminal state for that adapter.

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

### Event ordering guarantees

1. **Per-node sequential**: All events for a given `node_id` MUST be processed in emission order. The event bus MUST NOT reorder events within a single node's event stream.
2. **Cross-node eventual**: Events from different nodes have no guaranteed relative order. Consumers MUST be idempotent and tolerate out-of-order delivery across nodes.
3. **Deduplication**: The event bus MUST deduplicate events by `(event_name, node_id, attempt_id, ts)` tuple. Duplicate deliveries are silently dropped.
4. **Wakeup coalescing**: Multiple wakeup triggers arriving within a single scheduler pass window are coalesced into one scheduler pass. The `wake_reason` for the pass records the first trigger; additional triggers are logged but do not cause additional passes.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md

### Replan generation lifecycle

`replan_generation` is a per-run monotonic `u32` counter starting at `0` for the initial graph.

- Increments by exactly 1 each time a replan is applied and the canonical graph is updated via `run.graph_canonical_locked`.
- A replan is defined as any structural change to the canonical graph (adding/removing/reordering nodes or edges).
- Attempts, safe points, and blocked projections created under generation N become stale when generation increments to N+1.
- Stale attempts remain queryable for audit but are never resumable.
- There is no practical maximum value.

ContractRef: ContractName:Plans/Glossary.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

## Execution Context: Worktree Handoff

PM-native `Open With` stays inside the file/editor surface and carries the same worktree handoff context as other executor file operations. Any later OS handoff must be a separate explicit command such as `cmd.file.open_in_system_default`, so system-default launching does not dilute PM-native target selection, blocked/recovery semantics, or worktree-scoped file identity.


When Orchestrator or Assistant Chat creates an execution unit that should run inside a worktree, the execution context handoff includes the Executor-owned `execution_unit_context` packet plus safe-point or source-control context refs when branch/snapshot recovery data is needed. `execution_unit_context` owns `working_directory` and `worktree_id`; branch, HEAD, dirty-state, and worktree-mode booleans belong to safe-point/source-control/worktree-binding context rather than the closed execution-unit packet.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md

The execution context MUST include:
- `execution_unit_context.working_directory`: set to worktree root path (not project root) when a worktree is bound
- `execution_unit_context.worktree_id`: identifier of the target worktree
- `execution_unit_context.source_control_context_ref` or safe-point payload refs when branch, HEAD, dirty-state, or worktree snapshot data is required for recovery

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

**Caller responsibilities:**
- Orchestrator sets these fields when launching a DAE in a lane-owned worktree
- Assistant Chat sets these fields when the active thread has a bound worktree and the user runs agent-mode or plan-mode work
- If `execution_unit_context.worktree_id` is absent and no bound safe-point/worktree context exists, execution defaults to project root

For Assistant Chat, turn-start resolves `thread_state:{thread_id}:worktree_binding`, populates `execution_unit_context.worktree_id` and `working_directory`, and freezes both values for that turn. Mid-turn unbind changes apply only to the next turn or rotated follow-up. The executor propagates the frozen `working_directory` to FileSafe checks, tool invocations, bash/shell `cwd`, MCP tools, `@file` resolution, auto-retrieval scope context, and provider CLI or DAE execution-context JSON payloads. This is a cwd-based execution contract; it does not require separate prompt-only worktree injection.

**Executor responsibilities:**
- File operations resolve relative to `working_directory`
- Git operations target the worktree, not the main repo
- Terminal sessions start in `working_directory`
- LSP root identity uses the worktree path when the execution-unit worktree binding or safe-point context identifies a worktree
- File mutation logs store absolute paths. If `cmd.chat.revert` targets an edit from a removed worktree, for example `/project/.puppet-master/worktrees/thread-abc/src/main.rs`, the executor reports `Cannot restore file: original path no longer exists. The worktree may have been removed.` and does not recreate missing directories.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Commands_System.md

ContractRef: Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor

Required fields:
- run_id
- node_id
- attempt_id
- lane_id
- package_id
- seam_id
- execution_role
- requested_account_id
- effective_account_id
- operational_identity
- blocked_sequence
- approval_scope_key

Canonical terms and values:
- execution_unit_context
- run_id
- node_id
- attempt_id
- lane_id
- package_id
- seam_id
- execution_role
- requested_account_id
- effective_account_id
- operational_identity
- blocked_sequence
- approval_scope_key

Labels:
- execution unit context
- blocked episode

Behavioral rules:
- Execution protocol must define runtime scope through execution-unit context rather than tier roots.
- Blocked-episode identity must remain explicit in execution-relevant recovery paths.

Permission carry-through:
- effective account, execution role, and blocked-episode approval scope must survive execution handoff
### Mode interaction

All assistant chat modes (Ask, Agent, Plan, Deep Plan, Debug) operate within the thread's worktree when one is bound:
- Ask mode: read-only context from worktree files
- Agent mode: file edits go to worktree
- Plan/Deep Plan mode: plans execute in worktree context
- Debug mode: debug operations target worktree

Mode transitions do not affect worktree binding — the binding is thread-level, not mode-level.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Executor_Protocol.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### EP-002 - Doc Authority, Compliance, And Scope

```yaml
plan_unit_id: EP-002
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Executor Protocol owns deterministic plan_graph execution ordering and completion semantics for self-build and user-project sharded plan graph artifacts, while preserving owner-section authority, compliance, and compatibility-only vocabulary boundaries.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: doc_authority_compliance_and_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0004
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0007
preserved_exact_tokens:
- Overseer Protocol (Canonical)
- Canonical owner-section requirements
- Compatibility-only source vocabulary is noncanonical
- Puppet Master
- plan_graph
- Plans/plan_graph.json
- .puppet-master/project/plan_graph/
- .puppet-master/project/plan_graph/index.json
- monolithic export is optional/non-canonical
- 'ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Progression_Gates.md'
negative_constraints: []
compatibility_only_notes:
- Compatibility-only source vocabulary is noncanonical; live wording uses owner terminology.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-003 - Execution Actor Role Definitions

```yaml
plan_unit_id: EP-003
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Executor Protocol defines Builder/node worker, Verifier/reviewer/corroborator, Package Overseer, and Seam Overseer roles without making execution-support actors the scheduler.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: execution_actor_role_definitions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0008
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0009
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0010
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0011
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0012
preserved_exact_tokens:
- Builder / node worker
- Verifier / reviewer / corroborator
- Package Overseer
- Seam Overseer
- Work Package
- Feature Seam
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-004 - Runtime Scheduler Authority And Dual Overseer Boundary

```yaml
plan_unit_id: EP-004
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Runtime scheduler owns readiness, blocked state, transitions, retry budgets, wakeups, and dispatch; overseers remain governance actors and are not hidden second schedulers.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: runtime_scheduler_authority_and_dual_overseer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0013
preserved_exact_tokens:
- Runtime scheduler
- readiness
- blocked state
- transitions
- retry budgets
- wakeups
- dispatch
- overseers are governance actors, not hidden second schedulers
- /control
- dual-overseer model
- package and seam overseers
negative_constraints:
- Overseers are governance actors, not hidden second schedulers.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-005 - Scheduler Durable State And Tier Compatibility Retirement

```yaml
plan_unit_id: EP-005
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Runtime scheduling consumes durable package/seam/lane and sharded-node state; tier-era terms, TierType, TierContext, active-agents, tier_tree, Tiers, PuppetMasterEvent streams, and related labels are compatibility inputs only.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: scheduler_durable_state_and_tier_compatibility_retirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0013
preserved_exact_tokens:
- package/seam/lane
- seglog/redb-backed projections
- active-agents
- TierType
- TierContext
- /seams
- tier
- subtask
- run.tier_
- run.tier_*
- tier_tree
- Tiers
- PuppetMasterEvent
- PuppetMasterEvent::*
negative_constraints: []
compatibility_only_notes:
- Tier-era vocabulary is compatibility or derived-view vocabulary only.
stale_retired_dispositions:
- Cleanup /reconciliation moves stale /tier consumers to worktree/package/seam-aware routing and effective account/runtime identity displays.
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-006 - Runtime Object Opening And Projection Consumers

```yaml
plan_unit_id: EP-006
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Runtime objects open through route_target and OpenSubject consumers; projection-backed actions show projection_health and projection_freshness before mutating blocked episodes, seams, packages, or overseer targets.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: runtime_object_opening_and_projection_consumers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0013
preserved_exact_tokens:
- route_target
- OpenSubject
- projection_health
- projection_freshness
- blocked-episode
- Feature Seam
- Work Package
- Seam Overseer
- Package Overseer
- /layout/help/glossary
negative_constraints:
- Projection-backed actions must not mutate runtime objects without health/freshness context.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-007 - Canonical Node State Readiness Source

```yaml
plan_unit_id: EP-007
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Overseer reads execution state from canonical node documents in self-build or user-project sharded graph storage and must not infer execution state from index metadata alone.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: canonical_node_state_readiness_source
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0014
preserved_exact_tokens:
- Plans/plan_graph.json.nodes[]
- .puppet-master/project/plan_graph/nodes/<node_id>.json
- Overseer MUST NOT infer execution state from index metadata alone
- 'ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/project_plan_graph_index.schema.json'
negative_constraints:
- Overseer must not infer execution state from index metadata alone.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-008 - Ready Predicate And Spec Lock Matching

```yaml
plan_unit_id: EP-008
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: A node is ready only when queued, all blockers are done, Spec Lock schema_versions exactly match, and tie-breaking chooses the lexicographically smallest node_id.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: ready_predicate_and_spec_lock_matching
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0014
preserved_exact_tokens:
- status == "queued"
- blockers[]
- status == "done"
- spec_lock_requirements.schema_versions
- Plans/Spec_Lock.json.schema_versions
- lexicographically smallest `node_id`
- 'ContractRef: PolicyRule:Decision_Policy.md§3, ContractName:Plans/Spec_Lock.json'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-009 - Blocker Integrity Rule

```yaml
plan_unit_id: EP-009
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Every blockers[] entry resolves to an existing canonical node document; unresolved blocker IDs are invalid graph input and keep the node not ready.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: blocker_integrity_rule
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0014
preserved_exact_tokens:
- Every `blockers[]` entry MUST resolve
- existing canonical node document
- unresolved blocker ID
- invalid graph input
- not ready
- 'ContractRef: ContractName:Plans/Spec_Lock.json, ContractName:Plans/Project_Output_Artifacts.md'
negative_constraints:
- User-project nodes must not invent ad-hoc schema-version key names.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-010 - Canonical Node Status Lifecycle

```yaml
plan_unit_id: EP-010
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Canonical status lifecycle is queued -> in_progress -> verify_pending -> verified -> done for success and verify_pending -> failed for failure; done and failed are terminal and out-of-order transitions are rejected.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: canonical_node_status_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0015
preserved_exact_tokens:
- queued -> in_progress -> verify_pending -> verified -> done
- verify_pending -> failed
- done
- failed
- terminal states
- reject out-of-order transitions
- 'ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Executor_Protocol.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-011 - Run-Local UI/Orchestrator Status Overlays

```yaml
plan_unit_id: EP-011
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: UI and orchestrator labels such as waiting_approval, needs_review, cancelled, or complete_with_warnings are run-local overlay or CTA states, not canonical node status values, and must persist separately.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: run_local_ui_orchestrator_status_overlays
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0015
preserved_exact_tokens:
- waiting_approval
- needs_review
- cancelled
- complete_with_warnings
- run-local overlays / CTA states
- canonical node `status` values
- persisted as separate events or projections
negative_constraints:
- Run-local overlays must not replace the canonical status lifecycle.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-012 - Verifier Auto-Marking And Verified Transition

```yaml
plan_unit_id: EP-012
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Verifier evidence with pass outcome moves status through verified before done; the verified state is schema-enforced, manual mark-complete is not required, and fail outcome sets failed.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: verifier_auto_marking_and_verified_transition
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0016
preserved_exact_tokens:
- evidence_pointer
- verifier_result
- verifier_result.outcome == "pass"
- status = "verified"
- status = "done"
- outcome == "pass"
- timestamp_utc
- SHALL NOT skip it
- Manual mark-complete action MUST NOT be required
- verifier_result.outcome == "fail"
- status = "failed"
- 'ContractRef: ContractName:Plans/Progression_Gates.md#GATE-005, ContractName:Plans/evidence.schema.json'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-013 - Execution Unit Context Field Contract

```yaml
plan_unit_id: EP-013
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: The canonical dispatch/runtime packet carries the Executor-owned execution_unit_context contract with schema_id pm.execution_unit_context, schema_version 1.0.0, closed required and optional field sets, closed enums, persistence/replay rules, redaction requirements, and consumer-reference-only boundaries; stale persona names are compatibility inputs only.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: execution_unit_context_field_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0016
preserved_exact_tokens:
- execution_unit_context
- run_id
- node_id
- attempt_id
- lane_id
- package_id
- seam_id
- worktree_id
- execution_role
- requested_account_id
- requested_account_binding
- requested_account_policy
- effective_account_id
- operational_identity
- blocked_sequence
- allowed_action_ids[]
- schema_id
- schema_version
- execution_unit_type
- execution_unit_id
- approval_scope_key
- requested_persona_id
- effective_persona_id
- _persona_id
- /values
- assistant
- interviewer
- requirements_builder
- prd_builder
- package_overseer
- seam_overseer
- node_worker
- reviewer
- corroborator
- recovery_actor
- 'ContractRef: Plans/Prompt_Pipeline.md#6.4 Effective resolution record, Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor, Plans/Crosswalk.md#3.1 Runtime orchestration ownership'
negative_constraints:
- No consumer may redefine the execution_unit_context required or optional field set.
- No persisted execution_unit_context payload is valid without schema_version.
- execution_unit_context must not persist secrets, tokens, passwords, credentials, API keys, provider auth values, or local machine secrets.
compatibility_only_notes:
- Stale local worker identity names and persona slots are compatibility inputs only.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-014 - DispatchContext Required Projection

```yaml
plan_unit_id: EP-014
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: DispatchContext is a projection over the Executor-owned execution_unit_context schema and reads required fields, optional fields, nullability, enum values, and persistence rules from Plans/execution_unit_context.schema.json instead of defining a second required-field list.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: dispatchcontext_required_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0017
preserved_exact_tokens:
- DispatchContext
- execution_unit_context
- approval_scope_key
- requested_account_policy
- effective_account_id
- operational_identity
- blocked_sequence
negative_constraints:
- DispatchContext must not define an alternate execution_unit_context required-field list.
- DispatchContext must not omit schema_version when a persisted context payload is stored.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-015 - Execution Packet Joins And Blocked Carrythrough

```yaml
plan_unit_id: EP-015
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Dispatch, recovery, remediation, and inspection read one execution-unit packet; downstream consumers join losslessly to attempt, worktree, permission, and runtime records while blocked-action carrythrough stays anchored to blocked-episode lineage.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: execution_packet_joins_and_blocked_carrythrough
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0017
preserved_exact_tokens:
- dispatch, recovery, remediation, and inspection
- one execution-unit packet
- attempt
- worktree
- permission
- runtime records
- blocked-action carrythrough
- blocked-episode lineage
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-016 - Assistant Chat Worktree And Safe-Point Handoff

```yaml
plan_unit_id: EP-016
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Assistant Chat freezes worktree_id and working_directory from thread_state worktree binding at turn start, sends working directory through FileSafe/tools/MCP/provider contexts, and records worktree-bound safe point fields before mutation-capable execution.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: assistant_chat_worktree_and_safe_point_handoff
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0017
preserved_exact_tokens:
- thread_state:{thread_id}:worktree_binding
- worktree_id
- working_directory
- turn-start
- FileSafe
- tool invocation cwd
- MCP tools
- '@file'
- provider CLI
- DAE execution-context payloads
- worktree_path
- branch_name
- HEAD_sha
- git rev-parse HEAD
- /safe-point/runtime
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-017 - Worktree Lifecycle And Projection Boundary

```yaml
plan_unit_id: EP-017
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Worktree lifecycle actions recover, archive, prune, and remove have explicit meanings; projections must preserve historical lineage and cannot assume one active-worktree or current-worktree scalar.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: worktree_lifecycle_and_projection_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0017
preserved_exact_tokens:
- recover
- archive
- prune
- remove
- /orphaned/conflicted
- /metadata/lineage
- /orphaned/live-no-longer-needed
- historical/retired/removed
- /retired/removed
- one active-worktree
- current-worktree scalar
- File tree surfaces
- artifact roots
- /worktree
- active package-lane worktree sets
negative_constraints:
- Worktree-aware projections must not assume one active-worktree or current-worktree scalar.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-018 - Artifact, Wizard Builder CUP Handoff, And Producer Boundary

```yaml
plan_unit_id: EP-018
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Runtime artifacts, tool drills, wizard/builder/settings/GUI/CUP pre-run handoffs, interview handoffs, and provider execution payloads carry attempt identity plus requested/effective identity through execution_unit_context; mixed settings/GUI handoff wording remains intact until a later owner split is proven safe.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: artifact_wizard_builder_cup_handoff_and_producer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0017
preserved_exact_tokens:
- artifact_id
- /receipt-based
- tool_name
- invocation_summary
- usage_event_ref
- Wizard
- Builder
- settings/GUI
- CUP
- requested/effective account identity
- /account/role
- /model
- provider/model/persona policy
- /governance
- /isolation
- /package/seam
- /interview
- execution_unit_context
- decomposition_context
- selection_context
negative_constraints: []
compatibility_only_notes:
- Compatibility adapters may derive decomposition_context or selection_context only as optional disclosure or planning views.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-019 - Operational Queue, Progress, Seams, Source Control, And Routes

```yaml
plan_unit_id: EP-019
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Operational projections expose queue/thread views, Progress and Seams navigation, Source Control worktree-first routing, route payload object context, and route-target normalization without collapsing route payloads into filter/subview-shaped surface noise.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: operational_queue_progress_seams_source_control_and_routes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0017
preserved_exact_tokens:
- /queue
- thread-routing views
- Progress
- /Seams
- Feature Seams
- Work Packages
- /problem
- /completion/integration
- Source Control
- worktree_id
- base_branch
- focused_run_id
- /object
- object_kind = worktree
- /seam/package/concern/promotion
- resume_url
- route-target
- /help
- runtime-identity routes
- filter
- /subview
negative_constraints:
- Route payloads must not absorb filter or /subview noise and become surface-shaped again.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-020 - Overseer Worker Naming And Removed-Worktree Revert Error

```yaml
plan_unit_id: EP-020
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Runtime worker copy prefers overseer-spawned node worker while retaining Overseer where protocol title and legacy role framing require it; removed-worktree revert reports the fixed missing-path error without recreating directories.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: overseer_worker_naming_and_removed_worktree_revert_error
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0017
preserved_exact_tokens:
- Overseer
- overseer-spawned node worker
- delegated worker
- cmd.chat.revert
- /project/.puppet-master/worktrees/thread-abc/src/main.rs
- src/main.rs
- 'Cannot restore file: original path no longer exists. The worktree may have been removed.'
negative_constraints: []
compatibility_only_notes:
- delegated worker is a vague compatibility label, not the canonical execution actor name.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-021 - Deterministic Overseer Dispatch Loop

```yaml
plan_unit_id: EP-021
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: The baseline deterministic loop evaluates readiness over queued nodes, selects the smallest lexical node_id, dispatches Builder then Verifier, applies auto-marking, and repeats; later scheduler addendum rules supersede this wording where they conflict.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: deterministic_overseer_dispatch_loop
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0018
preserved_exact_tokens:
- Evaluate readiness predicate
- smallest lexical `node_id`
- Dispatch Builder
- verify_pending
- dispatch Verifier
- verified
- done
- failed
- deterministic ordering
- PolicyRule:Decision_Policy.md§2
- PolicyRule:Decision_Policy.md§3
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime Scheduler Addendum supersedes earlier lexical-dispatch wording where it conflicts.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-022 - Run Completion Document Packaging Gate

```yaml
plan_unit_id: EP-022
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Before run finalization, Executor enforces Document Packaging Policy for triggered Markdown/text artifacts under .puppet-master/**, and failed reconstruction, line accounting, idempotency, index-manifest, or clean-room audits block completion.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: run_completion_document_packaging_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0019
preserved_exact_tokens:
- Plans/Document_Packaging_Policy.md
- .puppet-master/**
- A run MUST NOT be marked complete
- reconstruction/line accounting/idempotency
- index-manifest match
- clean-room determinism
- Repo-local verifier coverage
- generated-artifact validator coverage
- ContractName:Plans/Progression_Gates.md#GATE-014
negative_constraints:
- A run must not be marked complete when any required Document Set audit fails.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-023 - Runtime Scheduler Addendum Supersession

```yaml
plan_unit_id: EP-023
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: The Runtime Scheduler Addendum dated 2026-03-08 supersedes earlier lexical-dispatch wording wherever conflicts exist.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: runtime_scheduler_addendum_supersession
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0020
preserved_exact_tokens:
- Runtime Scheduler Addendum (2026-03-08)
- supersedes any earlier lexical-dispatch wording wherever they conflict
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-024 - Canonical Scheduler Pass

```yaml
plan_unit_id: EP-024
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Each scheduler pass rebuilds or refreshes candidates, recomputes readiness, blocked, backoff, and capacity state, builds and scores the ready set, emits queue-analysis observability, and dispatches selected nodes.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: canonical_scheduler_pass
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0021
preserved_exact_tokens:
- Rebuild or refresh the candidate node set
- Recompute readiness
- Recompute blocked/backoff/capacity state
- Build the ready set
- Score ready nodes
- Emit queue-analysis observability
- Dispatch selected nodes
- ContractName:Plans/orchestrator-subagent-integration.md
- ContractName:Plans/Contracts_V0.md
- ContractName:Plans/storage-plan.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-025 - Scheduler Readiness Rules Under Addendum

```yaml
plan_unit_id: EP-025
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Under the scheduler addendum, ready nodes must be schedulable, dependency-satisfied, graph-integrity-clean, not in backoff or blocked on listed conditions, valid for active replan_generation, and allowed by lane/pool capacity.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: scheduler_readiness_rules_under_addendum
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0022
preserved_exact_tokens:
- queued
- reopened
- dependency-satisfying
- graph-integrity error
- active backoff
- HITL
- clarification
- external side-effect confirmation
- permission denial
- FileSafe
- auth refresh
- replan-required
- replan_generation
- runtime capacity
- Invalid blocker IDs
- ContractName:Plans/Progression_Gates.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-026 - Deterministic Score Tuple And Queue Analysis

```yaml
plan_unit_id: EP-026
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Ready-node selection uses scheduler_lane, manual_priority, transitive_unblock_count, ready_since_utc, and node_id, with explicit normalization rules, no critical-path weighting, and user-visible queue analysis tuple breakdown.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: deterministic_score_tuple_and_queue_analysis
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0023
preserved_exact_tokens:
- scheduler_lane
- manual_priority
- transitive_unblock_count
- ready_since_utc
- node_id
- remediation > unblocker > normal
- larger `manual_priority` wins
- larger `transitive_unblock_count` wins
- older `ready_since_utc` wins
- lexicographically smaller `node_id`
- no critical-path weighting term
- queue analysis MUST expose the tuple breakdown
- ContractName:Plans/Run_Graph_View.md
- ContractName:Plans/Orchestrator_Page.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-027 - Capacity-Aware Parallel Dispatch

```yaml
plan_unit_id: EP-027
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Executor selects up to available_slots nodes per scheduler pass, derived from run, phase/task/subtask, resource/provider, and remediation lane constraints, with selection global across the ready set rather than level-by-level lexical dispatch.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: capacity_aware_parallel_dispatch
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0024
preserved_exact_tokens:
- available_slots
- run-level concurrency limit
- phase/task/subtask concurrency constraints
- resource / provider saturation limits
- remediation lane reservations
- global across the ready set
- not level-by-level lexical dispatch
- ContractName:Plans/storage-plan.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-028 - Wake Trigger Forward Reference Boundary

```yaml
plan_unit_id: EP-028
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Wake-trigger values and coalescing behavior are owned by the later Wake reasons and coalescing section; this span is only a forward-reference boundary.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: wake_trigger_forward_reference_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0025
preserved_exact_tokens:
- Wakeup triggers
- Wake reasons and coalescing
- forward-reference only
- single owner section
- ContractName:Plans/FinalGUISpec.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- No wake-trigger values are redefined in this forward-reference span.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-029 - Blocked-To-Runnable Cascade And Prerequisite Event

```yaml
plan_unit_id: EP-029
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: When a dependency completes or a blocking condition clears, direct dependents reevaluate immediately and can enter the ready set in the same wake cycle; node.prerequisite_resolved carries source, resolved prerequisite, targets, resolution, and wake behavior.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: blocked_to_runnable_cascade_and_prerequisite_event
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0026
preserved_exact_tokens:
- direct dependents are reevaluated immediately
- same scheduler wake cycle
- unrelated blocked or waiting nodes MUST NOT stall runnable work
- node.prerequisite_resolved
- source_node_id
- resolved_prerequisite_id
- target_node_ids[]
- completed
- skipped
- force_resolved
- blocked
- pending
- ready-eligible queue state
negative_constraints:
- Unrelated blocked or waiting nodes must not stall runnable work elsewhere in the graph.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-030 - Failure Class And Blocked-Episode Classification Boundary

```yaml
plan_unit_id: EP-030
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Every failed or non-executed attempt classifies into one canonical failure class or blocked-episode cause before choosing retry, backoff, remediation, safe-point restore, or escalation.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: failure_class_and_blocked_episode_classification_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0027
preserved_exact_tokens:
- failed or non-executed attempt
- canonical failure class
- blocked-episode cause
- transient provider faults
- auth expiry
- quota pressure
- verification failure
- reviewer findings
- storage I/O
- graph-integrity failure
- permission-denied
- user-declined
- headless approval denial
- FileSafe block
- external-side-effect block
- replan-needed
- retry
- backoff
- remediation
- safe-point restore
- escalation
negative_constraints:
- No consumer may revive legacy approval arrays, opaque recovery option lists, or tier-era compatibility nouns.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-031 - Search FileManager And SSH Handoff Classification

```yaml
plan_unit_id: EP-031
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Search side-panel and SSH-backed file-operation handoffs consume Search/FileManager/Tools route and classification ownership, mapping network, trust, permission, and not-found failures without inventing executor-only file failure classes.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: search_filemanager_and_ssh_handoff_classification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0027
preserved_exact_tokens:
- Search-in-files
- Search side panel
- cmd.search.find_in_files
- cmd.search.open_result
- SSH-backed file-operation handoffs
- FileManager/Tools classification
- network_blocked_by_policy
- host_unreachable
- host_untrusted
- permission_denied
- path_not_found
negative_constraints:
- Do not invent executor-only file failure classes.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-032 - Classified Outcome Matrix And Per-Class Retry Rules

```yaml
plan_unit_id: EP-032
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: The classified outcome matrix preserves classifier families, max retries, backoff, auto-retry posture, per-class retry rules, distinct rate_limited handling, and generic retry prohibition.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: classified_outcome_matrix_and_per_class_retry_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0028
preserved_exact_tokens:
- classifier_family
- failure_class
- blocked_reason_code
- provider_transient
- rate_limited
- Retry-After
- structured_output_invalid
- verification_failed
- reviewer_findings
- auth_expired
- permission_denied
- user_declined
- headless_ask_denied
- filesafe_blocked
- external_side_effect_blocked
- storage_io
- quota_exceeded
- graph_integrity
- replan_required
- 1s / 2s / 4s
- 1s -> 2s -> 4s
- per-class
- generic retry without prior classification is prohibited
- ContractName:Plans/CLI_Bridged_Providers.md
negative_constraints:
- Generic retry without prior classification is prohibited.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-033 - Doom-Loop Guard

```yaml
plan_unit_id: EP-033
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: If the same tool_name, serialized_args_hash, and error_message triple is observed twice consecutively at the same nesting level, Executor emits stop.identical_failure and terminates the run immediately.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: doom_loop_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0029
preserved_exact_tokens:
- tool_name
- serialized_args_hash
- error_message
- twice consecutively
- same nesting level
- stop.identical_failure
- terminate the run immediately
- ContractName:Plans/Run_Modes.md
- ContractName:Plans/Contracts_V0.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-034 - Classification Lifecycle Consumer Boundary

```yaml
plan_unit_id: EP-034
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Executor classification/lifecycle projection consumes Run Modes, Tools, storage, usage, and provider-facade owner contracts without redefining them locally.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: classification_lifecycle_consumer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0030
preserved_exact_tokens:
- '### 7.1 Classified outcome matrix'
- '### 7.2 Doom-loop guard'
- '### 7.3 Signal handling and process lifecycle'
- '### Blocked and retry behavior'
- /classification/lifecycle
- Run Modes
- Tools
- storage
- usage
- provider-facade
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/WorktreeGitImprovement.md'
negative_constraints:
- Executor classification/lifecycle projection must not redefine owner contracts.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-035 - Provider Retry Evidence And Doom-Loop Aliases

```yaml
plan_unit_id: EP-035
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Provider-transient retry evidence preserves 1s -> 2s -> 4s, /2s/4s compatibility shorthand, per-error retry counters after classification, and kill.identical_failure with stop.identical_failure as compatibility alias.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: provider_retry_evidence_and_doom_loop_aliases
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0030
preserved_exact_tokens:
- 1s -> 2s -> 4s
- /2s/4s
- per-error
- tool_name
- args_hash
- error_message
- serialized_args_hash
- kill.identical_failure
- stop.identical_failure
negative_constraints: []
compatibility_only_notes:
- stop.identical_failure is retained only as an older compatibility alias.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-036 - Retry Follow-Up Paths

```yaml
plan_unit_id: EP-036
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Retry may dispatch another overseer-spawned node worker, enter remediation, request review or corroboration, open graph patch/replan, or restore through safe-point logic when explicit handoff artifacts preserve the fresh-worker retry value.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: retry_follow_up_paths
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0030
preserved_exact_tokens:
- fresh-worker retry
- explicit handoff artifacts
- overseer-spawned node worker
- remediation
- /corroboration
- graph patch/replan
- safe-point logic
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-037 - Degraded ListTools Discovery

```yaml
plan_unit_id: EP-037
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: 'MCP listTools discovery is degraded rather than unavailable: retry three times with 1s backoff, then use the last-known stale tool list until five-minute periodic refresh succeeds, without permanent-killing executor/provider/run.'
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: degraded_listtools_discovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0030
preserved_exact_tokens:
- listTools
- degraded, not unavailable
- retry three times
- 1s backoff
- last-known stale tool list
- five-minute periodic refresh
- never permanent-kill
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Failed discovery uses a last-known stale tool list until periodic refresh succeeds.
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-038 - Bridged Provider Preflight Resume Circuit Breaker

```yaml
plan_unit_id: EP-038
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Bridged-provider execution consumes CLI_Bridged_Providers facade and guard rails, completes parsing/sanitization/payload-preflight before classification, and handles stream disconnects with resume, bounded reconnects, and open/half-open/close circuit breaker.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: bridged_provider_preflight_resume_circuit_breaker
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0030
preserved_exact_tokens:
- '### Contract shape (facade)'
- '### Provider guard rails'
- Plans/CLI_Bridged_Providers.md
- /CLI_Bridged_Providers.md
- /parsing/sanitization/payload-preflight
- /resume
- three reconnect attempts
- circuit breaker
- open
- half-open
- close
- /reopen
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-039 - Storage Usage Budget Receipts

```yaml
plan_unit_id: EP-039
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Executor storage and usage alignment consumes storage-plan and usage-feature owner sections; receipts carry checkpoint-marker, run.completed.usage, bounded usage.jsonl compatibility retirement, lock-path/FileSafe/worktree path alignment, and budget-exceeded split.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: storage_usage_budget_receipts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0030
preserved_exact_tokens:
- '### 2.4 Projector pipeline'
- '## 3. Implementation checklist'
- '### 8.3 Startup and shutdown'
- '### Canonical usage pipeline'
- checkpoint-marker
- run.completed.usage
- usage.jsonl
- lock-path
- FileSafe
- kill.budget_exceeded
- done.budget_exceeded
negative_constraints: []
compatibility_only_notes:
- bounded usage.jsonl compatibility retirement path remains explicit.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-040 - Regex Index FSM And Build Slots

```yaml
plan_unit_id: EP-040
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Regex-index build lifecycle is executor-observable, uses per-project build slots, supports superseded build cancellation and cleanup, and prevents concurrent writes while sharing multi-project thread pool capacity.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: regex_index_fsm_and_build_slots
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0030
preserved_exact_tokens:
- no_index
- building_full
- ready
- rebuilding_incremental
- error
- CancellationToken
- clean partial generation directories
- thread pool
- FIFO order
- per-project build slots
- prevent concurrent writes
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-041 - Helper Background Usage And Context Handoff

```yaml
plan_unit_id: EP-041
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Helper/background attempts remain first-class usage contributors, and prompt/context handoff preserves implementation-grade context continuation, giant-instruction handling, budget visibility, and compatibility-shim retirement.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: helper_background_usage_and_context_handoff
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0030
preserved_exact_tokens:
- /helper/background
- execution receipt
- projected usage record
- /context
- giant-instruction-file
- budget-visibility
- compatibility-shim retirement
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-042 - Idempotent Shutdown

```yaml
plan_unit_id: EP-042
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: 'Lifecycle shutdown consumers treat shutdown as idempotent: double shutdown is guarded by a Once/idempotent root and becomes a safe no-op rather than a second destructive lifecycle transition.'
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: idempotent_shutdown
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0030
preserved_exact_tokens:
- /idempotent
- double shutdown
- Once/idempotent root
- safe no-op
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-043 - Signal Fanout And Subprocess Lifecycle

```yaml
plan_unit_id: EP-043
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: PM entrypoints establish a canonical signal.NotifyContext or equivalent once-owned fan-out before subprocess start; provider, MCP, and LSP subprocesses receive bounded graceful termination, SIGHUP reloads config, and managed subprocesses run in isolated process groups.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: signal_fanout_and_subprocess_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0031
preserved_exact_tokens:
- signal.NotifyContext
- once-owned signal fan-out
- SIGTERM
- SIGINT
- 5-second grace window
- 3-second grace window
- SIGHUP
- isolated process groups
- ContractName:Plans/Architecture_Invariants.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-044 - Worktree Snapshot Safe-Point Payload

```yaml
plan_unit_id: EP-044
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Worktree safe-point payloads include worktree_id, worktree_path, worktree_branch, HEAD_sha, worktree_dirty and use redb projection from seglog events as canonical binding source for remediation/resume context.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: worktree_snapshot_safe_point_payload
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0033
preserved_exact_tokens:
- worktree_id
- worktree_path
- worktree_branch
- HEAD_sha
- git rev-parse HEAD
- worktree_dirty
- redb projection
- seglog events
- ContractName:Plans/assistant-chat-design.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-045 - Pre-Mutation Safe-Point Anchor And Restore Boundary

```yaml
plan_unit_id: EP-045
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Before mutation-capable attempts, Executor creates or attaches runtime safe points with required IDs, execution root, baseline refs, and replan_generation; safe points are recovery anchors and not user-facing restore points.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: pre_mutation_safe_point_anchor_and_restore_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0032
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0033
preserved_exact_tokens:
- safe_point_id
- run_id
- node_id
- attempt_id
- worktree_path
- worktree_id
- branch_name
- HEAD_sha
- pre-attempt artifact/workspace baseline
- replan_generation
- runtime recovery anchors
- not user-facing restore points
negative_constraints:
- Safe points must not be conflated with thread rewind/rollback semantics.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-046 - Remediation Child Lineage

```yaml
plan_unit_id: EP-046
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Automatic fix cycles create remediation child lineage attached to the failed attempt, preserve remediation IDs/generation/finding IDs/final resolution state, and create canonical graph nodes only when replan changes scope.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: remediation_child_lineage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0034
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0044
preserved_exact_tokens:
- remediation_root_id
- remediation_parent_attempt_id
- generation
- remediation_generation
- origin_failure_event_id
- finding IDs
- issue IDs
- final resolution state
- A canonical graph node is created only when the remediation requires a replan that changes scope.
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-047 - Draft Versus Canonical Degradation Boundary

```yaml
plan_unit_id: EP-047
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: 'Executor distinguishes draft decomposition from canonical graph execution: draft may degrade to flat sequencing with warning evidence, but invalid canonical graphs after lock are graph_integrity failures that must not silently flatten or degrade.'
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: draft_versus_canonical_degradation_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0035
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0045
preserved_exact_tokens:
- draft decomposition / pre-canonical planning
- canonical graph execution
- deterministic flat sequencing
- warning evidence
- graph_integrity
- MUST NOT silently flatten
- Invalid canonical graphs after graph lock
negative_constraints:
- Canonical graph execution must not silently flatten or otherwise degrade invalid canonical graphs.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-048 - Text-Only Is Not Rich Surface Fallback

```yaml
plan_unit_id: EP-048
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: text-only projection is not a fallback for required rich execution surfaces; required artifacts, tool outputs, and browser/web surfaces must not silently degrade to text-only output.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, setup copy, panels, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: text_only_is_not_rich_surface_fallback
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0035
preserved_exact_tokens:
- text-only
- required rich execution surfaces
- required artifacts
- tool outputs
- browser/web surfaces
negative_constraints:
- Executor must not silently degrade required rich surfaces to text-only output.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-049 - Auto-Use Draft Plan Panel Review

```yaml
plan_unit_id: EP-049
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: When auto-use fires before canonical execution, on-trigger behavior creates or refreshes a draft plan, surfaces the sticky Plan panel, and keeps it user-dismissible and reviewable before execution observes revised TODO projection.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, setup copy, panels, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: auto_use_draft_plan_panel_review
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0035
preserved_exact_tokens:
- auto-use
- draft
- sticky Plan panel
- user-dismissible
- reviewable
- TODO projection
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-050 - Deterministic Runtime Recovery Scheduler Pass

```yaml
plan_unit_id: EP-050
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Runtime recovery scheduler pass refreshes candidate runtime state for active replan_generation, recomputes readiness/blocked/backoff/lane/score terms, selects up to capacity, emits queue-analysis, and dispatches attempts.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: deterministic_runtime_recovery_scheduler_pass
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0037
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0038
preserved_exact_tokens:
- Runtime Scheduler / Recovery Canonical Alignment (2026-03-09)
- replan_generation
- recompute readiness
- blocked state
- backoff state
- lane and score terms
- available capacity
- queue-analysis state
- dispatch selected attempts
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-051 - Recovery Readiness Predicate

```yaml
plan_unit_id: EP-051
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Recovery readiness requires all blockers satisfied, current generation, no blocked state, no backoff, and lane capacity; permission denial, FileSafe, auth refresh, confirmation, and replan-required states are non-ready.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: recovery_readiness_predicate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0039
preserved_exact_tokens:
- Readiness contract
- all blockers are satisfied
- generation is current
- not blocked
- not in backoff
- capacity rules
- permission denial
- FileSafe
- auth refresh
- user confirmation
- replan-required
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-052 - Scheduler Score Tuple And MVP Terms

```yaml
plan_unit_id: EP-052
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Scheduler score tuple uses scheduler_lane, manual_priority, transitive_unblock_count, ready_since_utc, and node_id with remediation/unblocker/normal ordering, no critical-path MVP term, explicit defaults, and invalid/cyclic exclusion.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: scheduler_score_tuple_and_mvp_terms
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0040
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0049
preserved_exact_tokens:
- scheduler_lane
- manual_priority
- transitive_unblock_count
- ready_since_utc
- node_id
- remediation > unblocker > normal
- No critical-path term
- 0..100
- default `50`
- invalid/cyclic relationships are excluded
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-053 - Wake Trigger Forward Reference

```yaml
plan_unit_id: EP-053
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Runtime recovery wakeup triggers refer to the later Wake reasons and coalescing owner section for wake_reason values and watchdog-only polling rule.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: wake_trigger_forward_reference
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0041
preserved_exact_tokens:
- Wake reasons and coalescing
- wake_reason
- watchdog-only polling rule
- ContractName:Plans/Orchestrator_Page.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- No wake-trigger values are redefined in this forward-reference span.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-054 - Multi-Surface Execution Unit Context

```yaml
plan_unit_id: EP-054
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Rich editor-agent, workbench, terminal, browser, document, artifact, plugin-first, command-first, rules/skills, persisted tabs, splits/windows, and history/navigation surfaces dispatch through execution_unit_context and preserve attempt identity, safe points, worktree binding, diff/review visibility, and autonomy defaults.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, setup copy, panels, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: multi_surface_execution_unit_context
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0042
preserved_exact_tokens:
- /editor-agent
- /workbench
- terminal
- browser
- document
- artifact
- /plugin-first
- command-first
- /rules/skills
- /persisted
- /splits/windows
- /history/navigation
- execution_unit_context
- attempt identity
- safe points
- worktree binding
- diff/review visibility
- user-visible autonomy defaults
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-055 - Browser Debug Pause Resume

```yaml
plan_unit_id: EP-055
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Browser-driven debug handoff uses explicit pause and resume inside isolated automation; auth/manual-repro boundaries degrade to attention_required, while richer co-piloting remains future expansion.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, setup copy, panels, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: browser_debug_pause_resume
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0042
preserved_exact_tokens:
- Browser-driven debug handoff
- /resume
- isolated automation session
- /manual-repro
- attention_required
- co-piloting
- collaborative browser steering
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-056 - PM Native Context Summarization

```yaml
plan_unit_id: EP-056
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Runtime context summarization stays PM-native, treats provider _context_updates only as a reference, preserves tcN handles, and replaces stale full tool results with audited summaries without a separate extra LLM call.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: pm_native_context_summarization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0042
preserved_exact_tokens:
- PM-native
- _context_updates
- incremental tool-result compression
- context-detail
- compaction updates
- tcN
- audited summaries
- without a separate extra LLM call
- must not be re-compressed
negative_constraints:
- Executor must not transplant a provider _context_updates protocol as-is.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-057 - Runtime UI Action Families

```yaml
plan_unit_id: EP-057
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: UI checkpoint, approve/deny, retry, and seam/lane/promotion/resolution-thread actions are runtime action families keyed by blocked_sequence and allowed_action_ids, not graph-local commands or single-current-task state.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, setup copy, panels, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: runtime_ui_action_families
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0042
preserved_exact_tokens:
- UI `/checkpoint`
- /approve/deny
- retry
- /seam/lane/promotion/resolution-thread
- blocked_sequence
- allowed_action_ids[]
- graph-local commands
- single-current-task state
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-058 - Managed Instruction Projection Compatibility

```yaml
plan_unit_id: EP-058
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Cursor-native managed instructions target .cursor/rules/*.mdc and .cursor/rules; .cursorrules is legacy compatibility only, and AGENTS.md/CLAUDE.md/root/provider copies are optional target projections that cannot be sole readiness evidence.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: managed_instruction_projection_compatibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0042
preserved_exact_tokens:
- .cursor/rules/*.mdc
- .cursor/rules
- .cursorrules
- AGENTS.md
- CLAUDE.md
- provider-native projected copies
- readiness must never depend solely on projected copies
negative_constraints:
- Readiness must never depend solely on projected copies.
compatibility_only_notes:
- .cursorrules is legacy compatibility only.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-059 - PM Outdated Launch Reprojection

```yaml
plan_unit_id: EP-059
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: At launch time, PM Outdated projection should auto-reproject before run launch when safe.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: pm_outdated_launch_reprojection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0042
preserved_exact_tokens:
- PM Outdated
- auto-reproject
- run launch
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-060 - GUI Auth Copy And Direct Gemini Policy Boundary

```yaml
plan_unit_id: EP-060
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: GUI auth/setup copy exposes user-visible choices like Sign in with ChatGPT and Use API Key, while Direct-Gemini OAuth removal is PM app-policy and public-distribution compliance policy rather than evidence that Google OAuth protocol disappeared.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, setup copy, panels, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: gui_auth_copy_and_direct_gemini_policy_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0042
preserved_exact_tokens:
- GUI auth/setup copy
- Sign in with ChatGPT
- Use API Key
- Direct-Gemini OAuth removal
- PM app-policy
- /compliance/public-distribution
- Google OAuth
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-061 - Non-Success Classification And Blocked Retry Rules

```yaml
plan_unit_id: EP-061
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Every non-success outcome is classified before policy; blocked episodes preserve local work/runtime identity/resume prerequisites, FileSafe and external side-effect blocks wait for owning actions, and one path cannot be both failure class and blocked-episode cause.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: non_success_classification_and_blocked_retry_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0042
preserved_exact_tokens:
- classify every non-success outcome
- blocked episodes
- local work
- runtime identity
- resume prerequisites
- FileSafe
- external side-effect blocks
- one decision path must not treat the same situation as both a failure class and a blocked-episode cause
negative_constraints:
- One decision path must not treat the same situation as both a failure class and a blocked-episode cause.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-062 - Attempt Identity Safe-Point Precondition And Cleanup Posture

```yaml
plan_unit_id: EP-062
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Every dispatch creates or reuses attempt_id; mutation/remediation steps create safe_point_id before execution, and MVP cleanup uses canonical workspace or remote project binding with explicit mutation lineage rather than sandbox worktree jail semantics.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: attempt_identity_safe_point_precondition_and_cleanup_posture
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0043
preserved_exact_tokens:
- attempt_id
- safe_point_id
- runtime recovery anchors only
- not restore points
- canonical workspace
- /remote
- temporary-vs-durable mutation lineage
- sandbox worktree `/jail`
negative_constraints:
- MVP cleanup must not require sandbox worktree jail semantics for ordinary debug instrumentation cleanup.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-063 - Scheduler Readiness Reconciliation

```yaml
plan_unit_id: EP-063
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Canonical runtime scheduler readiness requires ready-eligible lifecycle, existing canonical blockers, dependency-satisfying blockers, no active backoff/block projection, matching replan_generation, no worktree conflict, and lane/pool capacity.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: scheduler_readiness_reconciliation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0046
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0047
preserved_exact_tokens:
- ready-eligible
- existing canonical node
- dependency-satisfying state
- active backoff
- active runtime projection
- replan_generation
- worktree/conflict rule
- lane/pool capacity
- graph_integrity
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-064 - Node Lifecycle Versus Runtime Overlays

```yaml
plan_unit_id: EP-064
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Node lifecycle remains graph-progress contract while runtime overlays include blocked, backoff, retrying, remediation, and waiting-approval; overlays do not replace lifecycle values and waiting_approval is represented through runtime records.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: node_lifecycle_versus_runtime_overlays
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0048
preserved_exact_tokens:
- Node lifecycle
- graph-progress contract
- blocked
- backoff
- retrying
- remediation
- waiting-approval
- overlays do not replace
- blocked/runtime records
- safe-point
- remediation state
- ContractName:Plans/human-in-the-loop.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-065 - Capacity-Aware Dispatch Cycle

```yaml
plan_unit_id: EP-065
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Each scheduler wake refreshes runtime state, recomputes readiness and score terms, reevaluates direct dependents, builds global ready set, emits queue-analysis keyed by scheduler_pass_id, selects up to available_slots, and dispatches attempts.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: capacity_aware_dispatch_cycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0050
preserved_exact_tokens:
- scheduler wake
- scheduler_pass_id
- global ready set
- available_slots
- canonical score order
- dispatch selected attempts
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-066 - Blocked-To-Runnable Same-Wake Cascade

```yaml
plan_unit_id: EP-066
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: When dependency or blocking condition clears, direct dependents reevaluate synchronously in the same wake cycle and newly ready nodes enter the ready set before dispatch completes without an extra scheduler pass.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: blocked_to_runnable_same_wake_cascade
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0051
preserved_exact_tokens:
- same wake cycle
- newly ready nodes
- same ready set
- no extra scheduler pass
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-067 - Class-Driven Pre-Dispatch Blocker Rules

```yaml
plan_unit_id: EP-067
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Provider/model selection, worktree availability, and prerequisite readiness resolve before dispatch; dirty-baseline, merge-conflict, approval, auth, or validation blockers surface through the canonical blocked-episode contract.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: class_driven_pre_dispatch_blocker_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0052
preserved_exact_tokens:
- provider/model selection
- worktree availability
- prerequisite readiness
- dirty-baseline
- merge-conflict
- approval
- auth
- validation blockers
- blocked-episode contract
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-068 - HTE DAE Graph-Lock Write-Scope Safety

```yaml
plan_unit_id: EP-068
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: HTE and DAE execution paths share graph-lock and write-scope safety, surfacing generation staleness, degradation, cleanup-remediation loops, FileSafe bypass, side-effect uncertainty, safe-point/restore conflicts, and projection trust failures as blocked/degraded/remediation classes.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: hte_dae_graph_lock_write_scope_safety
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0052
preserved_exact_tokens:
- HTE
- DAE
- graph-lock
- write-scope safety
- /generation
- /degradation
- FileSafe bypass
- side-effect
- remote side-effect
- safe-point/restore-point conflicts
- projection trust failures
- blocked/degraded/remediation classes
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-069 - Blocked Projection Family And Startup Recovery Continuity

```yaml
plan_unit_id: EP-069
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: node-blocked, wizard-blocked, and thread-blocked projections keep family-local fields separate; Executor mints and reuses blocked_sequence across HITL/auth/storage/recovery updates and startup recovery must not lose or remint existing blocked episodes.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: blocked_projection_family_and_startup_recovery_continuity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0052
preserved_exact_tokens:
- node-blocked
- wizard-blocked
- thread-blocked
- blocked_sequence
- attempt_id
- failure_class
- clarification `/report`
- /persisted
- HITL
- auth
- /storage
- startup_recovered
- startup-recovery handshakes
- request_id
negative_constraints:
- Recovery must not cause silent block-loss or accidental episode reminting.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-070 - Diagnostic Attempt Continuity

```yaml
plan_unit_id: EP-070
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Reserved diagnostic schemas for execution, audit, handoff, and HITL events carry attempt_id and preserve attempt continuity as an architecture invariant.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: diagnostic_attempt_continuity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0052
preserved_exact_tokens:
- Reserved diagnostic schemas
- execution
- audit
- handoff
- HITL events
- attempt_id
- architecture invariant
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-071 - Graph-Lock Dispatch Stop Boundary

```yaml
plan_unit_id: EP-071
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Draft decomposition fallback is allowed only before run.graph_canonical_locked; after graph lock, graph_integrity structure errors stop new dispatches and no silent flattening or degraded canonical execution is allowed.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: graph_lock_dispatch_stop_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0053
preserved_exact_tokens:
- run.graph_canonical_locked
- graph_integrity
- stop accepting new dispatches
- no silent flattening
- degraded canonical execution
- ContractName:Plans/Progression_Gates.md
negative_constraints:
- After graph lock, execution must stop accepting new dispatches for invalid canonical graph structure.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-072 - Retry Resume Restored Rerun Attempt Identity

```yaml
plan_unit_id: EP-072
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Every admitted retry, resume-after-prerequisite, or safe-point-restored rerun creates a new attempt_id only after its selected baseline_target postcondition and durable baseline receipt are proved; prior attempts remain immutable, restore-required episodes accept only restore_safe_point_then_retry, and post-lock execution preserves blocked/recovery anchors plus runtime identity.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- "`safe_point`, exact `historical_commit` OID, and exact `worktree_head` OID/state-digest targets are conditionally validated without substitution."
- A successor attempt is not runnable before the owner baseline result and receipt are durable; refused, failed, or recovery-required preparation mints no runnable successor.
- A restore-required blocked episode retains the same blocked identity and recovery anchor until verified successor, explicit abandonment, replan, or owner-verified recovery satisfies the owning terminal rule.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: retry_resume_restored_rerun_attempt_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0054
preserved_exact_tokens:
- retry
- resume-after-prerequisite
- safe-point-restored rerun
- new `attempt_id`
- Prior attempts remain immutable historical records
- identity-blind
- single-branch
- /corroboration/promotion/runtime
negative_constraints:
- After graph lock, execution must not fall back to identity-blind planning-artifact-centric execution.
- Do not bypass restore_safe_point_then_retry when requires_safe_point_restore is true.
- Do not release a recovery anchor or dispatch a successor from an unproved baseline.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-073 - Canonical Runtime Scope Context

```yaml
plan_unit_id: EP-073
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: execution_unit_context is the canonical runtime-facing context object and execution_unit_context plus execution_unit_type define authoritative runtime scope, replacing retired tier-era context as live runtime contract.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: canonical_runtime_scope_context
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0055
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0056
preserved_exact_tokens:
- Unified Runtime Scheduler and Attempt Lifecycle Canonical Alignment
- execution_unit_context
- canonical runtime-facing context object
- execution_unit_type
- authoritative runtime scope
- retired tier-era context object
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-074 - Shared Context For Worker Recovery Coordination UI Inspection

```yaml
plan_unit_id: EP-074
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Worker spawn, recovery, remediation, coordination services, scheduler joins, and UI inspection surfaces read one shared execution_unit_context so restart, approval, blocked-episode continuity, and audit views resolve the same runtime unit.
gui_related: true
gui_classification_reason: This unit governs user-visible runtime projections, routes, CTAs, setup copy, panels, or operational surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: shared_context_for_worker_recovery_coordination_ui_inspection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0056
preserved_exact_tokens:
- Worker spawn
- recovery
- remediation
- coordination
- UI inspection surfaces
- restart
- approval
- blocked-episode continuity
- audit views
- same runtime unit
- 'ContractRef: Primitive:ExecutionContext'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-075 - Tier-Era Compatibility Adapter Retirement

```yaml
plan_unit_id: EP-075
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Compatibility adapters may derive retired tier-era context objects only for legacy selector translation or decomposition and must not persist, exchange, or rehydrate them as the live runtime contract.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: tier_era_compatibility_adapter_retirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0056
preserved_exact_tokens:
- Compatibility adapters
- legacy selector translation
- decomposition
- MUST NOT persist, exchange, or rehydrate
- live runtime contract
negative_constraints: []
compatibility_only_notes:
- Retired tier-era context object is a derived or compatibility-only selection/decomposition helper.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-076 - Blocked Sequence Identity And Restart Recovery

```yaml
plan_unit_id: EP-076
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: blocked_sequence is canonical per run_id/node_id blocked episode and unresolved blocked episodes restore on restart without reminting, with request_id retained only as subordinate compatibility lookup metadata.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: blocked_sequence_identity_and_restart_recovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0057
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0058
preserved_exact_tokens:
- blocked_sequence
- run_id/node_id
- blocked episode
- restart
- without reminting
- request_id
- subordinate compatibility handle
negative_constraints: []
compatibility_only_notes:
- request_id is lineage or lookup metadata rather than a competing approval target.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-077 - Approval Scope And Durable Approver Identity

```yaml
plan_unit_id: EP-077
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Blocked-episode approval scope is separate from session-wide policy scope, and approval/rejection events persist durable approver identity fields.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: approval_scope_and_durable_approver_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0058
preserved_exact_tokens:
- approval scope
- session-wide policy scope
- durable approver identity
- approval and rejection events
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-078 - Execution Role Account Usage Carry-Through

```yaml
plan_unit_id: EP-078
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Execution role, requested_account_id, operational_identity, account-switch and pressure ownership, startup recovery, DAE jail/approval policy, usage switch-history, and usage execution-role follow-through transfer through owner and consumer docs.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: execution_role_account_usage_carry_through
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0058
preserved_exact_tokens:
- execution_role
- requested_account_id
- operational_identity
- account-switch
- pressure ownership
- DAE jail/approval policy
- usage switch-history
- usage execution-role follow-through
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-079 - Provider Model Precedence And Worktree Assignment

```yaml
plan_unit_id: EP-079
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Provider/model precedence is owned across run, seam, package, node, overseer, and delegated-subagent levels and ties to parallel-node worktree assignment and ownership transitions.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: provider_model_precedence_and_worktree_assignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0059
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0060
preserved_exact_tokens:
- provider/model precedence
- run
- seam
- package
- node
- overseer
- delegated-subagent
- parallel-node worktree assignment
- ownership transitions
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-080 - Promotion-Aware Provider Records And Legacy Taxonomy Retirement

```yaml
plan_unit_id: EP-080
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Provider and event records for dispatched work are promotion-aware, preserve requested/effective account resolution across delegation, and keep Phase/Task/Subtask/Iteration as legacy taxonomy rather than canonical runtime ownership.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: promotion_aware_provider_records_and_legacy_taxonomy_retirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0060
preserved_exact_tokens:
- promotion-aware
- requested/effective account resolution
- package and seam overseer delegation
- Phase/Task/Subtask/Iteration
- legacy taxonomy
- canonical runtime ownership
negative_constraints: []
compatibility_only_notes:
- Phase/Task/Subtask/Iteration remains legacy taxonomy, not canonical runtime ownership.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-081 - Actor Resolver Inputs And Auto Receipt Basis

```yaml
plan_unit_id: EP-081
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Actor resolver inputs include actor type, overseer/worker/reviewer/corroborator/recovery/graph patch roles, operation type, scope, language/framework/domain, and GUI/backend/infra hints; auto resolution records actor-type basis.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: actor_resolver_inputs_and_auto_receipt_basis
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0060
preserved_exact_tokens:
- actor type
- package overseer
- seam overseer
- node worker
- verifier
- /reviewer
- corroborator
- graph patch planner
- recovery actor
- operation type
- scope level
- language/framework
- repo `/domain`
- GUI, backend-heavy, or infra-heavy hints
- auto
- actor-type mapping
- receipt records
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- GUI is used as routing hint here, not GUI implementation.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-082 - Run-Level Deferred Rule

```yaml
plan_unit_id: EP-082
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: If any node is runnable the run remains active; if no node is runnable and blocked, backoff, or prerequisite-waiting work exists, the run is deferred until prerequisite, restore, remediation, auth, or capacity wakeups.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: run_level_deferred_rule
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0061
preserved_exact_tokens:
- runnable
- active
- deferred
- blocked
- backoff
- prerequisite-waiting
- prerequisite resolution
- restore completion
- remediation completion
- auth recovery
- capacity change
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-083 - Attempt Counter Invariant

```yaml
plan_unit_id: EP-083
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: attempt_count equals automatic_retry_count plus prerequisite_resume_count plus manual_resume_count plus remediation_retry_count plus one initial attempt, with sub-counters incrementing at attempt start and not inferred by subtraction.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: attempt_counter_invariant
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0062
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0063
preserved_exact_tokens:
- Counter Relationships and Event Ordering Addendum
- attempt_count
- automatic_retry_count
- prerequisite_resume_count
- manual_resume_count
- remediation_retry_count
- + 1 (initial attempt)
- increments at attempt start
- Independent policy counters MUST NOT be inferred
negative_constraints:
- Independent policy counters must not be inferred by subtracting from attempt_count.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-084 - Debug Verification Summary Recurrence Rule

```yaml
plan_unit_id: EP-084
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Debug-mode verification records verification_summary with adapter_kind, attempt_count, passed, heuristic_version, optional latest_receipt_ref, and notes, and passes only when the prior class/reason/signature does not recur and rerun reaches expected terminal state.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: debug_verification_summary_recurrence_rule
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0063
preserved_exact_tokens:
- verification_summary
- adapter_kind
- attempt_count
- passed
- heuristic_version
- latest_receipt_ref
- notes[]
- failure_class
- blocked_reason_code
- tool error signature
- expected terminal state
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-085 - Event Ordering Dedupe And Wake Coalescing

```yaml
plan_unit_id: EP-085
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Events are per-node sequential, cross-node eventual, deduplicated by event_name/node_id/attempt_id/ts, and multiple wakeup triggers in one scheduler-pass window coalesce into one scheduler pass with first wake_reason recorded.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: event_ordering_dedupe_and_wake_coalescing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0064
preserved_exact_tokens:
- Per-node sequential
- Cross-node eventual
- Deduplication
- Wakeup coalescing
- event_name
- node_id
- attempt_id
- ts
- wake_reason
- first trigger
- ContractName:Plans/Wiring_Matrix.md
negative_constraints:
- The event bus must not reorder events within a single node stream.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-086 - Replan Generation Lifecycle And Stale Records

```yaml
plan_unit_id: EP-086
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: replan_generation is a per-run monotonic u32 starting at 0, increments exactly once per applied replan via run.graph_canonical_locked, marks prior attempts/safe points/blocked projections stale, and stale attempts remain auditable but never resumable.
gui_related: false
gui_classification_reason: This unit defines runtime/governance execution behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The covered behavior is addressable through this fine-grained PlanUnit instead of EP-001.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: replan_generation_lifecycle_and_stale_records
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0065
preserved_exact_tokens:
- replan_generation
- u32
- '0'
- run.graph_canonical_locked
- structural change
- adding/removing/reordering nodes or edges
- stale
- queryable for audit
- never resumable
- no practical maximum value
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-087 - PM-Native Open With Worktree Handoff Boundary

```yaml
plan_unit_id: EP-087
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  PM-native Open With stays inside the file/editor surface and carries the
  same worktree handoff context as other executor file operations; later OS
  handoff must be a separate explicit command such as
  cmd.file.open_in_system_default.
gui_related: true
gui_classification_reason: This unit governs user-visible file/editor Open With behavior and its worktree handoff boundary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- PM-native target selection, blocked/recovery semantics, and worktree-scoped file identity remain preserved.
- OS system-default launching remains a separate explicit command and does not dilute PM-native executor/file identity semantics.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: pm_native_open_with_worktree_handoff_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0066
preserved_exact_tokens:
- PM-native `Open With`
- file/editor surface
- cmd.file.open_in_system_default
- system-default launching
- PM-native target selection
- blocked/recovery semantics
- worktree-scoped file identity
negative_constraints:
- OS handoff must remain a separate explicit command and must not dilute PM-native executor/file identity semantics.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Open With UI behavior consumes the same executor worktree handoff context rather than defining a separate launch context.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-088 - Worktree Execution Context Identity Fields

```yaml
plan_unit_id: EP-088
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Orchestrator and Assistant Chat execution units that run inside a worktree
  carry worktree identity through execution_unit_context fields working_directory
  and worktree_id; branch, HEAD, dirty-state, and worktree-mode details live in
  safe-point, source-control, or worktree-binding context refs rather than in
  execution_unit_context.
gui_related: false
gui_classification_reason: This unit defines runtime handoff identity fields, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- working_directory is set to the worktree root path, not the project root, when a worktree is bound.
- worktree_id and working_directory remain explicit execution_unit_context identity fields.
- worktree_branch remains safe-point/source-control/worktree-binding context and is not an execution_unit_context field.
- is_worktree is derived from worktree binding context and is not an execution_unit_context field.
- ContractRefs, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: worktree_execution_context_identity_fields
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0066
preserved_exact_tokens:
- execution context handoff includes worktree identity
- working_directory
- worktree root path (not project root)
- worktree_id
- worktree_branch
- is_worktree
- 'ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md'
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md'
negative_constraints:
- worktree_branch must not be added as an execution_unit_context field in schema_version 1.0.0.
- is_worktree must not be added as an execution_unit_context field in schema_version 1.0.0.
compatibility_only_notes:
- worktree_branch and is_worktree are preserved source-lineage tokens for the older handoff wording; the canonical packet stores worktree_id and working_directory.
stale_retired_dispositions: []
owner_boundary_notes:
- The handoff consumes Orchestrator, Run Modes, Assistant Chat, storage, safe-point, and source-control contracts through explicit execution context fields and refs.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-089 - Caller Worktree Handoff Responsibilities

```yaml
plan_unit_id: EP-089
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Orchestrator sets worktree execution fields when launching a DAE in a
  lane-owned worktree, Assistant Chat sets them for bound-thread agent-mode or
  plan-mode work, and execution defaults to the project root when
  execution_unit_context.worktree_id is absent and no bound worktree context is
  present.
gui_related: false
gui_classification_reason: This unit defines caller runtime responsibilities, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- Orchestrator launch of a DAE in a lane-owned worktree sets the handoff fields.
- Assistant Chat bound-thread agent-mode and plan-mode work set the handoff fields.
- Missing execution_unit_context.worktree_id and absent bound worktree context fall back to project-root execution.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: caller_worktree_handoff_responsibilities
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0066
preserved_exact_tokens:
- Caller responsibilities
- Orchestrator
- DAE
- lane-owned worktree
- Assistant Chat
- active thread has a bound worktree
- agent-mode
- plan-mode
- is_worktree
- project root
negative_constraints: []
compatibility_only_notes:
- is_worktree is preserved as source-lineage wording for older handoff text; worktree mode is derived from the bound worktree context, not stored in execution_unit_context.
stale_retired_dispositions: []
owner_boundary_notes:
- Caller responsibilities define who populates runtime handoff fields before executor dispatch.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-090 - Assistant Chat Turn Worktree Freeze And CWD Propagation

```yaml
plan_unit_id: EP-090
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Assistant Chat turn-start resolves thread_state:{thread_id}:worktree_binding,
  freezes execution_unit_context.worktree_id and working_directory for that
  turn, applies mid-turn unbinds only to later turns or rotated follow-ups, and
  propagates the frozen cwd to FileSafe, tools, shell cwd, MCP, @file,
  auto-retrieval, provider CLI, and DAE execution-context payloads.
gui_related: false
gui_classification_reason: This unit defines backend/runtime turn context propagation, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- thread_state:{thread_id}:worktree_binding resolves at turn start.
- execution_unit_context.worktree_id and working_directory are frozen for the turn.
- Mid-turn unbind changes apply only to the next turn or rotated follow-up.
- The contract remains cwd-based and does not require prompt-only worktree injection.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: assistant_chat_turn_worktree_freeze_and_cwd_propagation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0066
preserved_exact_tokens:
- thread_state:{thread_id}:worktree_binding
- execution_unit_context.worktree_id
- working_directory
- Mid-turn unbind changes
- next turn
- rotated follow-up
- FileSafe checks
- bash/shell `cwd`
- MCP tools
- '@file'
- auto-retrieval scope context
- provider CLI
- DAE execution-context JSON payloads
- cwd-based execution contract
negative_constraints:
- The cwd-based execution contract does not require separate prompt-only worktree injection.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Assistant Chat consumes thread worktree binding and passes a frozen cwd-oriented execution context to executor surfaces.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-091 - Executor Worktree Operation Resolution And Removed-Worktree Revert

```yaml
plan_unit_id: EP-091
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor worktree operations resolve files, git commands, terminals, and LSP
  root identity through working_directory, store absolute mutation paths, and
  report a non-recreating error when cmd.chat.revert targets an edit whose
  original worktree path no longer exists.
gui_related: false
gui_classification_reason: This unit defines executor file/git/terminal/LSP and revert behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- File operations resolve relative to working_directory.
- Git operations target the worktree, terminal sessions start in working_directory, and LSP root identity uses the worktree path when bound worktree context is present.
- File mutation logs store absolute paths.
- A removed-worktree cmd.chat.revert reports the preserved error message and does not recreate missing directories.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: executor_worktree_operation_resolution_and_removed_worktree_revert
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0066
preserved_exact_tokens:
- File operations resolve relative to `working_directory`
- Git operations target the worktree, not the main repo
- Terminal sessions start in `working_directory`
- LSP root identity uses worktree path when `is_worktree` is true
- File mutation logs store absolute paths
- cmd.chat.revert
- /project/.puppet-master/worktrees/thread-abc/src/main.rs
- 'Cannot restore file: original path no longer exists. The worktree may have been removed.'
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Commands_System.md'
negative_constraints:
- is_worktree is a source-lineage token only; it must not become an execution_unit_context field in schema_version 1.0.0.
- The executor does not recreate missing directories when a removed worktree makes the original path unavailable.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- FileManager, LSPSupport, and Commands_System consume this executor worktree resolution behavior.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-092 - Execution Unit Context Canonical Contract

```yaml
plan_unit_id: EP-092
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor Protocol owns the canonical execution_unit_context contract through
  Plans/execution_unit_context.schema.json with schema_id pm.execution_unit_context
  and schema_version 1.0.0. The contract defines a closed required field list,
  closed optional field set, field types, nullability, closed enums, identity
  and linkage fields, persistence and replay rules, redaction and no-secret
  constraints, lifecycle ownership, and producer/consumer boundaries.
gui_related: false
gui_classification_reason: This unit defines runtime identity schema and labels, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- All required fields from the schema remain explicit and closed.
- Optional fields, nullability, enum values, persistence/replay constraints, and redaction rules remain explicit.
- Consumer docs reference this owner and schema instead of redefining execution_unit_context.
- The labels execution unit context and blocked episode remain preserved.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-implementation-readiness.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
- Plans/execution_unit_context.schema.json
- scripts/pm-implementation-readiness.py
node_compile_hint:
  mode: execution_unit_context_canonical_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0066
preserved_exact_tokens:
- run_id
- node_id
- attempt_id
- schema_id
- schema_version
- execution_unit_type
- execution_unit_id
- lane_id
- package_id
- seam_id
- worktree_id
- execution_role
- requested_account_binding
- requested_account_id
- effective_account_id
- operational_identity
- blocked_sequence
- allowed_action_ids[]
- approval_scope_key
- created_at_utc
- execution unit context
- blocked episode
- 'ContractRef: Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor'
negative_constraints:
- No consumer may redefine the execution_unit_context required or optional field set.
- No persisted execution_unit_context payload is valid without schema_version.
- execution_unit_context must not persist secrets, tokens, passwords, credentials, API keys, provider auth values, or local machine secrets.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Required identity fields align executor runtime scope with the canonical blocked-episode approval anchor.
- Executor Protocol is the sole owner of the execution_unit_context contract; Prompt Pipeline, Contracts_V0, storage-plan, orchestrator-subagent-integration, Plan_To_Node_Compilation, and Planning_Wizard are consumers.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-093 - Runtime Scope Blocked Episode And Permission Carry-Through

```yaml
plan_unit_id: EP-093
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Execution Protocol defines runtime scope through execution-unit context rather
  than tier roots, keeps blocked-episode identity explicit in recovery paths,
  and carries effective account, execution role, and blocked-episode approval
  scope through execution handoff.
gui_related: false
gui_classification_reason: This unit defines runtime scope, recovery identity, and permission handoff behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- Runtime scope is defined through execution-unit context rather than tier roots.
- Blocked-episode identity remains explicit in execution-relevant recovery paths.
- effective account, execution role, and blocked-episode approval scope survive execution handoff.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: runtime_scope_blocked_episode_and_permission_carry_through
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0066
preserved_exact_tokens:
- Behavioral rules
- runtime scope through execution-unit context rather than tier roots
- Blocked-episode identity
- Permission carry-through
- effective account
- execution role
- blocked-episode approval scope
negative_constraints:
- Runtime scope must not be derived from tier roots.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Permission carry-through binds execution handoff to blocked-episode recovery identity.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-094 - Assistant Chat Mode Worktree Behavior Matrix

```yaml
plan_unit_id: EP-094
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Ask, Agent, Plan, Deep Plan, and Debug modes operate within the thread's
  bound worktree, with reads, edits, plan execution, and debug operations
  routed to the worktree context according to mode behavior.
gui_related: false
gui_classification_reason: This unit defines Assistant Chat runtime mode routing, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- Ask mode reads context from worktree files.
- Agent mode writes file edits to the worktree.
- Plan and Deep Plan modes execute plans in worktree context.
- Debug mode targets the worktree for debug operations.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: assistant_chat_mode_worktree_behavior_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0067
preserved_exact_tokens:
- Ask
- Agent
- Plan
- Deep Plan
- Debug
- thread's worktree
- read-only context from worktree files
- file edits go to worktree
- plans execute in worktree context
- debug operations target worktree
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Run Modes and Assistant Chat consume this mode matrix through the thread worktree binding.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-095 - Thread-Level Worktree Binding Across Mode Transitions

```yaml
plan_unit_id: EP-095
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Assistant Chat mode transitions do not affect worktree binding because the
  binding is thread-level, not mode-level.
gui_related: false
gui_classification_reason: This unit defines runtime binding invariants across mode transitions, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- Mode transitions do not change the active worktree binding.
- Worktree binding remains thread-level rather than mode-level.
- ContractRefs and source lineage remain traceable.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: thread_level_worktree_binding_across_mode_transitions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0067
preserved_exact_tokens:
- Mode transitions do not affect worktree binding
- thread-level
- not mode-level
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md'
negative_constraints:
- Mode transitions must not affect worktree binding.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Worktree binding is owned at the Assistant Chat thread level and is consumed by individual modes.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-001 - Executor Protocol Retired Source-Preserving Bridge

```yaml
plan_unit_id: EP-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  The former Executor Protocol source-preserving bridge is retired after Phase
  2B atomized Executor_Protocol-S0001 through Executor_Protocol-S0067 into
  EP-002 through EP-095 and structurally dispositioned the owner map, PlanUnits
  heading, retired bridge lineage, and Migration Coverage. EP-001 remains only
  as migration lineage for the retired bridge span and must not re-own atomized
  source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior; coverage_map still preserves S0070 gui_related_inferred=true from the historical broad bridge span.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- EP-001 no longer uses the source-preserving PlanUnit compile hint.
- EP-002 through EP-095 own product coverage for Executor_Protocol-S0001 through Executor_Protocol-S0067.
- Executor_Protocol-S0068, S0069, and S0071 are structural owner-map, heading, and migration-coverage dispositions.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0070
preserved_exact_tokens:
- EP-001
- source_preserving_planunit
- source_preserving_bridge_retired
- EP-002
- EP-095
- Executor_Protocol-S0001
- Executor_Protocol-S0071
- 'Execution Context: Worktree Handoff'
- Mode interaction
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- Do not remap atomized Executor_Protocol spans back to EP-001.
- Do not treat the retired bridge as implementation-ready product coverage.
- Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this migration-lineage unit.
compatibility_only_notes:
- The old source-preserving bridge is retained only so migration lineage and historical references to EP-001 remain auditable.
stale_retired_dispositions: []
owner_boundary_notes:
- EP-002 through EP-095 own product coverage for Executor_Protocol-S0001 through Executor_Protocol-S0067.
- S0068, S0069, and S0071 are structural owner-map, PlanUnits-heading, and Migration Coverage dispositions.
owner_hints:
- Plans/Executor_Protocol.md
```
## Migration Coverage

Original hash: `fd77b8360e92673ca0bf6bad5015f8075a545c30216b71a5df0107f1e8db47f3`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`

Phase 2B batch 050 atomized or structurally dispositioned `Executor_Protocol-S0001` through `Executor_Protocol-S0029` into `EP-002` through `EP-033`. Phase 2B batch 051 atomized or structurally dispositioned `Executor_Protocol-S0030` through `Executor_Protocol-S0065` into `EP-034` through `EP-086`. Phase 2B batch 052 atomized `Executor_Protocol-S0066` through `Executor_Protocol-S0067` into `EP-087` through `EP-095`, structurally dispositioned `Executor_Protocol-S0068`, `Executor_Protocol-S0069`, and `Executor_Protocol-S0071`, and retired `EP-001` as migration lineage for `Executor_Protocol-S0070`. No residual source-preserving Executor Protocol PlanUnit remains. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and did not create WorkNodes, NodeSeeds, or executable build tasks.

## Ledger Compile Addendum - pldg-20260614-001

### EP-096 - Runtime Consumer Header Recovery Compile Addendum

```yaml
plan_unit_id: EP-096
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor_Protocol missing Section 5 and top owner stubs recover as runtime consumer sections. Executor consumes tier-era retirement,
  blocked-policy transfer, provider/model carry-through, approval scope, durable approver identity, and worktree allocation from their owners;
  it must not revive tier as primary execution canon or replace Models_System provider/model precedence ownership.
gui_related: false
gui_classification_reason: Executor runtime protocol and scheduler consumer sections are backend/runtime contracts.
depends_on: [EP-005, EP-075, EP-077, EP-079]
unblocks: []
acceptance_criteria:
  - Section 5 is restored or explicitly aliased as a structural parent without changing scheduler behavior.
  - tier, TierContext, tier_id, TierType, and Phase/Task/Subtask are compatibility-only in Executor runtime context.
  - Approval scope and durable approver identity consume Contracts/HITL owner fields.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual Executor heading/owner review
risk_class: executor_consumer_drift
reasoning_tier: standard
context_scope: executor_owner_stub_recovery
implementation_surfaces: [Plans/Executor_Protocol.md, Plans/Contracts_V0.md, Plans/Models_System.md]
node_compile_hint: {mode: executor_consumer_section_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0020
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0038
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0072
preserved_exact_tokens: ["Retire tier-era canon and shadow fields", "Identity and blocked-policy transfer cluster", "Coverage blocker provider/model precedence owner section", "Approval scope key and approver identity", "TierContext", "tier_id", "execution_role", "requested_account_id", "operational_identity"]
negative_constraints:
  - Do not revive tier vocabulary as primary Executor canon.
  - Do not make Executor replace Models_System provider/model precedence ownership.
owner_hints: [Plans/Executor_Protocol.md, Plans/Models_System.md, Plans/Contracts_V0.md, Plans/human-in-the-loop.md]
```

## Ledger Compile Addendum - pldg-20260615-001

### EP-097 - Runtime Addenda Consolidation Boundary

```yaml
plan_unit_id: EP-097
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor_Protocol runtime scheduler, blocked/recovery, retry, safe-point,
  remediation, readiness, score, attempt lifecycle, and provider/model carry-through
  addenda are consolidated as consumer-facing executor rules subordinate to the
  named runtime, contract, storage, mode, model, and wiring owners. Historical
  `Canonical Alignment` or `Consolidation Addendum` headings and dates remain
  source-lineage, but executor implementers must not treat overlapping addenda as
  peer precedence layers or infer canonical behavior from their order.
gui_related: false
gui_classification_reason: This unit defines executor/runtime protocol precedence rather than visual presentation.
depends_on:
  - EP-096
unblocks: []
acceptance_criteria:
  - Executor runtime recovery behavior is read through named owner sections and PlanUnits rather than additive addendum order.
  - Scheduler, blocked/recovery, retry, safe-point, remediation, readiness, score, attempt lifecycle, approval, and provider/model terms remain preserved as exact lineage.
  - Executor consumes Contracts_V0, Run_Modes, Models_System, storage-plan, and Wiring_Matrix ownership without replacing them.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, product implementation files, Rust/Slint app scaffolds, legacy Iced app files, or production build tasks are created; explicit governance/index/evidence refreshes are recorded in the repair/seal artifacts.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260615-001-part-4-fable-cleanup
risk_class: executor_addenda_precedence_drift
reasoning_tier: high
context_scope: executor_runtime_addenda_consolidation
implementation_surfaces:
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/Run_Modes.md
  - Plans/Models_System.md
  - Plans/storage-plan.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: executor_runtime_addenda_consolidation
  create_worknodes: false
source_lineage:
  - pldg-20260615-001-part-4-fable-cleanup:atom-0013
  - pldg-20260615-001-part-4-fable-cleanup:atom-0014
  - pldg-20260615-001-part-4-fable-cleanup:atom-0015
  - pldg-20260615-001-part-4-fable-cleanup:atom-0018
  - local:Plans/Executor_Protocol.md:259
  - local:Plans/Executor_Protocol.md:506
  - local:Plans/Executor_Protocol.md:578
  - local:Plans/Executor_Protocol.md:663
preserved_exact_tokens:
  - "Runtime Scheduler Addendum (2026-03-08)"
  - "Runtime Scheduler / Recovery Canonical Alignment (2026-03-09)"
  - "Canonical Runtime Scheduler Canonical Alignment (2026-03-09)"
  - "Unified Runtime Scheduler and Attempt Lifecycle Canonical Alignment (2026-03-09)"
  - "Canonical Alignment"
  - "Consolidation Addendum"
  - "runtime scheduler"
  - "blocked/recovery"
  - "retry"
  - "safe-point"
  - "remediation"
  - "blocked_sequence"
  - "request_id"
  - "tier-era"
  - "TierContext"
  - "Phase/Task/Subtask/Iteration"
negative_constraints:
  - Do not leave overlapping addenda as coequal normative sections when owner PlanUnits carry the merged rule.
  - Do not semantically change scheduler, blocked, retry, safe-point, remediation, readiness, score, attempt lifecycle, or provider/model behavior during consolidation.
compatibility_only_notes:
  - Cited runtime addenda sections are compatibility/source-lineage sections; named owner PlanUnits and owner docs carry merged runtime precedence.
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/Run_Modes.md
  - Plans/Models_System.md
  - Plans/storage-plan.md
  - Plans/Wiring_Matrix.md
```

## Ledger Compile Addendum - pldg-20260616-002

### EP-098 - GoalRun WorkNode Scheduler Boundary

```yaml
plan_unit_id: EP-098
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor/runtime scheduler owns concrete runnable WorkNode dispatch for Orchestrator GoalRuns. Goal Runtime and Orchestrator may define objectives, WorkGraph shape, WorkNode requests, verification requirements, receipts, and projections, but Executor remains authoritative for readiness, dependency, blocked-state, retry/backoff, wakeups, capacity-aware parallel dispatch, and failure-class recovery. High-end controller/planner decomposition may decompose objectives into a WorkGraph and bounded WorkNodes as runnable work requests, but concrete dispatch remains gated by Executor readiness and scheduler policy. WorkNode execution success is provisional until verification and receipt certification complete.
gui_related: false
gui_classification_reason: Scheduler ownership, dispatch, retry/backoff, capacity, and provisional execution semantics are runtime behavior, not visual presentation.
depends_on: [GRS-026, GRS-027, PNC-009, PS-115, W-071]
unblocks: [OP-022, RGV-012]
acceptance_criteria:
  - Goal Runtime does not dispatch concrete graph nodes directly.
  - Executor scheduler readiness, blocked/backoff, retry, capacity, wakeup, and failure-class semantics remain canonical for WorkNodes.
  - RepairWorkNodes and WorkNode retries remain bounded by scheduler and write-surface policy.
  - Controller/planner decomposition can produce WorkGraph and bounded WorkNode runnable work requests without bypassing Executor readiness or scheduler authority.
  - WorkNode success alone does not certify parent GoalRun or final completion.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Executor WorkNode scheduler integration tests
risk_class: scheduler_boundary_drift
reasoning_tier: high
context_scope: executor_goalrun_worknode_dispatch
implementation_surfaces: [Plans/Executor_Protocol.md, Plans/Goal_Runtime_System.md, Plans/Orchestrator_Page.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md]
node_compile_hint: {mode: goalrun_worknode_scheduler_boundary, create_worknodes: false}
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0009
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0013
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0017
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0020
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0041
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0042
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0048
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0049
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0054
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0076
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0085
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0086
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0007
preserved_exact_tokens:
  - "readiness"
  - "blocked state"
  - "retry/backoff"
  - "capacity-aware dispatch"
  - "failure-class recovery"
  - "ready WorkNodes"
  - "bounded executable unit"
  - "decomposes"
  - "bounded WorkNodes"
  - "runnable work"
  - "Execution success is not completion"
negative_constraints:
  - Do not bypass blocked/backoff/capacity semantics.
  - Do not let WorkNode executors certify global completion.
  - Do not treat design-time WorkNode terms as permission to create runtime work artifacts.
owner_hints: [Plans/Executor_Protocol.md, Plans/Goal_Runtime_System.md, Plans/Orchestrator_Page.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md]
```

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### EP-099 - Executor Intake For WorkNode Requests

```yaml
plan_unit_id: EP-099
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
    WorkNode requests become runnable only after Executor intake validates graph integrity, source-control requirements, test bindings, model routing, authority requirements, readiness prerequisites, and scheduler metadata. ExecutorIntakeReport is the boundary artifact proving that a WorkNodeRequest was accepted, rejected, or blocked. The strict runtime contract packet defines non-executable WorkGraph draft and WorkNodeRequest shapes before dispatch; Executor owns runnable dispatch, ready-state evaluation, capacity-aware scheduling, retry/backoff, blocked-state recovery, and failure-class recovery after explicit runtime enablement and accepted intake.
gui_related: false
gui_classification_reason: Intake, scheduling, retry, and blocked recovery are runtime protocol behavior, not visual presentation.
depends_on: [EP-098, PNC-013]
unblocks: [EP-100, EP-101, EP-102, GRS-030]
acceptance_criteria:
  - WorkNodeRequest records cannot bypass Executor intake.
  - ExecutorIntakeReport validates graph integrity, source-control/test/model/authority metadata, readiness prerequisites, and scheduler metadata.
  - PlanCompile remains unable to dispatch runnable WorkNodes directly.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
risk_class: executor_intake_bypass
reasoning_tier: high
context_scope: executor_worknode_request_intake
implementation_surfaces: [Plans/Executor_Protocol.md, Plans/Plan_To_Node_Compilation.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: executor_intake_boundary, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0016
  - pldg-20260617-001-plans-to-code-handoff:atom-0042
  - pldg-20260617-001-plans-to-code-handoff:dec-0005
preserved_exact_tokens:
  - "ExecutorIntakeReport"
  - "WorkNodeRequest"
  - "readiness prerequisites"
  - "Executor intake"
  - "not runnable WorkNodes"
negative_constraints:
  - Do not let WorkNodeRequest bypass Executor intake.
  - Do not let PlanCompile directly dispatch worker execution.
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Plan_To_Node_Compilation.md
```

### EP-100 - Source-Control And Model Preflight Execution Context

```yaml
plan_unit_id: EP-100
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor intake and dispatch must establish a source-control execution context and model-resolution context before mutation-capable work starts. The execution context preserves repo_id, worktree_id, worktree_path, branch_ref, branch_head_state, baseline_commit_oid, head_commit_oid, safe_point_id, changed_files, conflict_refs, dirty_state_policy, conflict_policy, merge_policy, github_policy, rollback_available, rollback_ref, and restore_command_or_action. Model routing preserves requested_lane, requested_model_profile, effective_model_profile, fallback_used, fallback_reason, and capability_checks. PlanCompile does not own source control; source control, worktrees, safe points, snapshots, rollback, FileSafe, and GitHub promotion apply after Executor accepts WorkNode requests.
  This PlanUnit is the source-control execution contract, and GitHub optional promotion cannot replace local execution truth. Recovery/fresh-attempt preflight conditionally validates the closed safe_point, historical_commit, and worktree_head baseline targets; an exact baseline receipt and verified postcondition precede successor-attempt dispatch.
gui_related: false
gui_classification_reason: Execution preflight and model receipt fields are backend runtime contracts.
depends_on: [EP-099, MS-111, W-072, F2-189]
unblocks: [EP-102, POA-048, RAP-029]
acceptance_criteria:
  - Mutation-capable WorkNodes have repo/worktree/baseline/safe-point context before risky execution.
  - Historical recovery accepts only a full immutable commit OID and preserves the source dirty worktree; worktree-head recovery performs no mutation and requires exact OID plus state digest.
  - Safe-point retry consumes FileSafe/Contracts/storage owner results and preserves blocked/recovery anchors on refusal, verified rollback, recovery-required, or unavailable recovery material.
  - Model resolution receipts are captured before dispatch and visible to receipt consumers.
  - GitHub is optional promotion/output and local source-control/worktree state remains execution truth.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
risk_class: unsafe_execution_context
reasoning_tier: high
context_scope: executor_preflight_context
implementation_surfaces: [Plans/Executor_Protocol.md, Plans/WorktreeGitImprovement.md, Plans/FileSafe.md, Plans/Models_System.md, Plans/GitHub_Integration.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: source_control_and_model_preflight, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0024
  - pldg-20260617-001-plans-to-code-handoff:atom-0035
  - pldg-20260617-001-plans-to-code-handoff:atom-0038
  - pldg-20260617-001-plans-to-code-handoff:dec-0015
preserved_exact_tokens:
  - "source-control execution contract"
  - "worktrees"
  - "snapshots"
  - "safe points"
  - "branch_head_state"
  - "head_commit_oid"
  - "changed_files"
  - "conflict_refs"
  - "rollback_ref"
  - "rollback"
  - "FileSafe"
  - "GitHub optional"
  - "PR"
  - "GitHub Actions"
  - "local source-control truth"
  - "requested_model_profile"
  - "effective_model_profile"
negative_constraints:
  - Do not make PlanCompile own source-control mutation.
  - Do not require GitHub for local-only project completion.
  - Do not substitute branch names, moving refs, current HEAD, another worktree, or a newer safe point for the commanded baseline.
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/WorktreeGitImprovement.md
  - Plans/FileSafe.md
  - Plans/GitHub_Integration.md
  - Plans/GitHub_API_Auth_and_Flows.md
```

### EP-101 - Automated Test Binding Intake

```yaml
plan_unit_id: EP-101
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor intake must validate WorkNode test_binding fields before dispatch: required capabilities, required harnesses, generated/reused tests, generated_test_ids, reused_test_ids, completion commands, browser/session requirements, emulator requirements, visual evidence requirements, flake policy, expected artifacts, and test_gap_policy. WorkNode completion cannot depend on human eyeballing. If automatic verification is unavailable, Executor blocks the WorkNode or requests test-harness work rather than marking it complete.
  Executor test intake preserves generated_test_ids, reused_test_ids, browser_session_required, visual_evidence_required, browser/GUI/device sessions, and manual_only_acceptance_not_allowed before completion is accepted.
gui_related: true
gui_classification_reason: Browser/session requirements, emulator requirements, screenshots, and visual evidence are user-visible verification surfaces.
depends_on: [EP-099, ATS-003, ATS-004]
unblocks: [EP-102, GRS-030, RAP-029]
acceptance_criteria:
  - Test binding is validated during Executor intake before runnable dispatch.
  - Manual-only acceptance is not sufficient for WorkNode completion.
  - Test gaps become blockers or harness work.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
risk_class: unverified_execution_completion
reasoning_tier: high
context_scope: executor_test_binding
implementation_surfaces: [Plans/Executor_Protocol.md, Plans/Automated_Testing_System.md, Plans/Runtime_Artifacts_Panel.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: executor_test_binding_intake, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0029
  - pldg-20260617-001-plans-to-code-handoff:atom-0033
  - pldg-20260617-001-plans-to-code-handoff:atom-0034
  - pldg-20260617-001-plans-to-code-handoff:dec-0012
  - pldg-20260617-001-plans-to-code-handoff:dec-0013
preserved_exact_tokens:
  - "test_binding"
  - "reused_test_ids"
  - "browser_session_required"
  - "visual_evidence_required"
  - "test_gap_policy"
  - "100% automated"
  - "no human intervention"
  - "test capability blocker"
  - "test-harness WorkNode"
negative_constraints:
  - Do not make manual visual inspection a required completion step.
  - Do not silently allow unverifiable WorkNodes.
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Automated_Testing_System.md
```

### EP-102 - Failure Signatures, Loop Breakers, And Plan Changes

```yaml
plan_unit_id: EP-102
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor repair loops preserve failure_signature records with kind, normalized_key, attempt_count, last_safe_point_id, last_repair_worknode_id, overseer_reviewed, auditor_reviewed, repeated_failure_policy, escalation_lane, user_escalation_allowed, and last evidence refs. Repeated failures escalate internally through normal repair, Auditor classification, Overseer graph/work/model/source-control/test-harness repair, High-Effort/Auditor deep repair, and only then critical user escalation unless explicit HITL policy requires earlier intervention. If Plans change during execution, PlanChangeDetected pauses affected lanes, a PlanDiffImpactReport classifies nodes as unaffected, needs_recompile, invalidated, or already_safe, and Executor resumes only after graph patching/replan work and currentness gates. The ledger phrase create replan WorkNodes is disposed for this phase as future runtime-enabled replan work only; current Plans-to-code contracts do not create replan WorkNodes.
  Failure signatures expose failure_signature.kind, and external-effect preflights preserve network_access_policy, secret_access_policy, and destructive_command_policy before risky repair or execution continues. Overseer review and High-Effort Worker escalation remain internal repair routes before critical user escalation.
gui_related: false
gui_classification_reason: Loop-breaker and PlanChangeDetected policy is runtime orchestration behavior.
depends_on: [EP-099, EP-100, EP-101, GRS-029, PS-116]
unblocks: [GRS-030, POA-048]
acceptance_criteria:
  - Failure signatures are normalized and counted across repair attempts.
  - Repeated failures route internally before user escalation in default mode.
  - Plan changes pause affected lanes and require impact classification before resume.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future failure_signature and PlanDiffImpactReport validation
risk_class: infinite_repair_loop
reasoning_tier: high
context_scope: executor_repair_loop_breakers
implementation_surfaces: [Plans/Executor_Protocol.md, Plans/Goal_Runtime_System.md, Plans/Permissions_System.md, Plans/Project_Output_Artifacts.md]
node_compile_hint: {mode: executor_loop_breaker_policy, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0046
  - pldg-20260617-001-plans-to-code-handoff:atom-0047
  - pldg-20260617-001-plans-to-code-handoff:atom-0048
  - pldg-20260617-001-plans-to-code-handoff:dec-0020
  - pldg-20260617-001-plans-to-code-handoff:dec-0021
  - pldg-20260617-001-plans-to-code-handoff:corr-0009
preserved_exact_tokens:
  - "failure_signature"
  - "normalized_key"
  - "attempt_count"
  - "repeated_failure_policy"
  - "escalation_lane"
  - "Auditor classification"
  - "Overseer review"
  - "High-Effort Worker"
  - "critical user escalation"
  - "PlanChangeDetected"
  - "PlanDiffImpactReport"
  - "needs_recompile"
  - "invalidated"
  - "currentness gate"
negative_constraints:
  - Do not jump to user decision because a low-quality agent got stuck.
  - Do not create replan WorkNodes in this design-only phase.
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Goal_Runtime_System.md
  - Plans/Planning_Ledger_System.md
```

### EP-103 - Plans-To-Code Execution Receipt Chain

```yaml
plan_unit_id: EP-103
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor contributes the execution side of the Plans-to-Code Handoff Matrix. A complete WorkNode execution flow emits worknode_dispatch_receipt, source_control_preflight_receipt, safe_point_receipt, worknode_change_receipt, test_run_receipt, auditor_verification_receipt, repair_attempt_receipt when needed, merge_or_promotion_receipt when applicable, worknode_completion_receipt, and finalization evidence. Each transition records source artifact, destination artifact, owner, validator, receipt, retry route, rollback route, and user escalation condition. Worker claims are never enough to certify code complete.
  The receipt chain preserves source_artifact, destination_artifact, retry_route, rollback_route, all WorkNodes terminal, all automated tests passed or dispositioned, and artifact-backed handoff evidence before code completion is certified. The source-control chain must preserve the same repo_id, worktree_id, worktree_path, branch_ref, branch_head_state, baseline_commit_oid, head_commit_oid, safe_point_id, changed_files, conflict_refs, rollback_available, rollback_ref, and restore_command_or_action through preflight, safe point creation, mutation/change, optional promotion, finalization, and completion certification.
gui_related: false
gui_classification_reason: Execution receipts and certification handoffs are runtime/evidence contracts.
depends_on: [EP-099, EP-100, EP-101, EP-102, PNC-014]
unblocks: [GRS-030, POA-048, RAP-029, CV-289]
acceptance_criteria:
  - Every Executor handoff has artifact, owner, validator, receipt, retry, rollback, and escalation fields.
  - WorkNode execution receipts distinguish dispatch, preflight, safe point, change, test, audit, repair, promotion, and completion.
  - Code completion is certified from receipts, tests, source-control state, Auditor result, blockers, and final evidence, not worker prose.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
risk_class: false_completion
reasoning_tier: high
context_scope: plans_to_code_execution_receipts
implementation_surfaces: [Plans/Executor_Protocol.md, Plans/Project_Output_Artifacts.md, Plans/Runtime_Artifacts_Panel.md, Plans/Contracts_V0.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: execution_receipt_chain, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0039
  - pldg-20260617-001-plans-to-code-handoff:atom-0040
  - pldg-20260617-001-plans-to-code-handoff:atom-0041
  - pldg-20260617-001-plans-to-code-handoff:atom-0043
  - pldg-20260617-001-plans-to-code-handoff:dec-0016
  - pldg-20260617-001-plans-to-code-handoff:dec-0017
  - pldg-20260617-001-plans-to-code-handoff:dec-0018
preserved_exact_tokens:
  - "worknode_dispatch_receipt"
  - "source_control_preflight_receipt"
  - "safe_point_receipt"
  - "worknode_change_receipt"
  - "test_run_receipt"
  - "auditor_verification_receipt"
  - "repair_attempt_receipt"
  - "worknode_completion_receipt"
  - "Plans-to-Code Handoff Matrix"
  - "artifact-backed handoff"
  - "worker says done is insufficient"
  - "branch_head_state"
  - "baseline_commit_oid"
  - "head_commit_oid"
  - "safe_point_id"
  - "changed_files"
  - "conflict_refs"
  - "rollback_ref"
negative_constraints:
  - Do not accept worker says done as code completion.
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Runtime_Artifacts_Panel.md
```

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Models_System.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Runtime_Artifacts_Panel.md


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### EP-104 - Three-Stage Executor Intake And Required Graph Acceptance

```yaml
plan_unit_id: EP-104
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: 'Downstream intake is Executor Structural Intake, Provisioning Preflight, and Executor Activation Decision so graph/request validation occurs before repository, worktree, safe-point, test-harness, model, permissions, and credential provisioning. Activation requires all required active-scope WorkNodeRequests to be accepted together; optional work must be explicitly excluded or deferred before activation, and a mixed result cannot silently start a partial build. Plan Compile and Executor provisioning must compare live repository and environment state against the approved snapshot and route stale facts through bounded re-analysis or recompile rather than executing against invalid assumptions. Provisioning Preflight confirms that selected test capabilities, installations, services, browsers, devices, simulators, credentials, and commands remain current and runnable immediately before WorkNode execution.'
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
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: execution_boundary
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Executor_Protocol.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Goal_Runtime_System.md
- Plans/FileSafe.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0119
- pldg-20260618-001-prd-planning-wizard:atom-0120
- pldg-20260618-001-prd-planning-wizard:atom-0078
- pldg-20260618-001-prd-planning-wizard:atom-0100
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/04-project-context-and-source-control.md#SRC-PROJECT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
source_atom_ids:
- atom-0119
- atom-0120
- atom-0078
- atom-0100
decision_refs:
- dec-0024
- dec-0025
correction_refs: []
preserved_exact_tokens:
- Executor Structural Intake
- Provisioning Preflight
- Executor Activation Decision
- all required active-scope
- mixed
- revalidate
- stale facts
- harness revalidation
negative_constraints:
- Do not start a partially accepted required WorkGraph.
owner_hints:
- Plans/Executor_Protocol.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Goal_Runtime_System.md
- Plans/FileSafe.md
- Plans/Automated_Testing_System.md
```

## Ledger Compile Addendum - pldg-20260622-001-fff

### EP-106 - Executor Discovery Orientation And Verification Handoff

```yaml
plan_unit_id: EP-106
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor Builder and Verifier actors may use discover_paths for file orientation when implementation or verification requires locating files without exact path evidence. Builder uses ranked discovery candidates for read orientation only, while Verifier may use discovery to locate verification-relevant files. Ranking never substitutes for exact evidence, tests, AST/LSP, grep/codesearch/Instant Grep, domain checks, or verifier pass criteria; discovery receipts feed attempt evidence only when linked to exact verification receipts before edits, test claims, completion, or verifier pass.
gui_related: false
gui_classification_reason: This is Executor protocol and verification handoff behavior, not GUI presentation.
depends_on: [T-161, T-162, OSI-429, CV-291]
unblocks: [ATS-011]
acceptance_criteria:
  - Builder uses discovery only for orientation when exact paths are absent.
  - Verifier may use discovery to find evidence targets but still requires exact evidence.
  - Discovery output cannot satisfy verifier pass criteria without exact verification.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future Builder no-path orientation test.
  - Future Verifier exact evidence follow-up test.
  - Future SSH no-local-checkout Executor task test.
risk_class: executor_evidence_drift
reasoning_tier: standard
context_scope: executor_discovery_handoff
implementation_surfaces: [Plans/Executor_Protocol.md, future Executor Builder/Verifier routes]
node_compile_hint: {mode: executor_discovery_orientation, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0041
  - pldg-20260622-001-fff:atom-0027
  - pldg-20260622-001-fff:atom-0030
  - pldg-20260622-001-fff:atom-0037
  - pldg-20260622-001-fff:atom-0043
  - pldg-20260622-001-fff:atom-0058
  - pldg-20260622-001-fff:atom-0059
  - pldg-20260622-001-fff:atom-0092
  - pldg-20260622-001-fff:atom-0094
  - pldg-20260622-001-fff:state/consumer_conformance_matrix.json#executor_builder_verifier
source_atom_ids: [atom-0027, atom-0030, atom-0037, atom-0041, atom-0043, atom-0058, atom-0059, atom-0092, atom-0094]
preserved_exact_tokens: ["Builder", "Verifier", "orientation only", "ranking never substitutes", "exact evidence", "AST/LSP", "grep/codesearch/Instant Grep", "verifier pass"]
negative_constraints:
  - Do not let ranking substitute for verifier evidence.
  - Do not claim root cause, completion, or verifier pass from discovery candidates alone.
owner_hints: [Plans/Executor_Protocol.md, Plans/Tools.md, Plans/Automated_Testing_System.md]
```

### EP-105 - Runtime WorkNodeRecord Identity, Receipts, And Activation Consumers

```yaml
plan_unit_id: EP-105
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: 'After Activation Decision accepts the certified graph, Executor materializes canonical WorkNodeRecord objects from accepted WorkNodeRequests and emits materialization receipts. WorkNodeRecord includes worknode_id, goal_run_id, workgraph_id and revision, source_request_id, source PlanUnit and acceptance refs, objective, surfaces, typed readiness predicates, lifecycle, attempts and retries, authority, model, tests, repository/worktree/safe-point refs, evidence, currentness, cancellation, invalidation, and replan generation. Existing project_plan_node schema remains an import or compatibility contract with an explicit adapter and must not silently become the canonical runtime WorkNodeRecord. Work dispatch, change, test, retry, and completion receipts use worknode_id and attempt_id plus source_request_id and graph revision; a WorkNodeRequest reference alone is not sufficient runtime identity. A context-aware incomplete-content
  validator runs at Planning Wizard approval, Plan Compile certification, WorkNode completion, and Goal completion across active Plans, compile artifacts, first-party code, tests, generated outputs, and delivery artifacts. Implementation readiness of the complete pipeline requires a clean-room fixture proving Approve And Build creates exactly one PlanCompileRun, executes mandatory parallel stages, certifies a complete WorkGraph and WorkNodeRequests, passes Executor intake/provisioning, atomically creates GoalRun and WorkNodes, queues an entrypoint, and appears in Orchestrator. The fixture suite covers duplicate PlanApproved delivery, restart during every activation step, greenfield Git, non-Git FileSafe, dirty repository, remote SSH, optional GitHub or PR, missing harness, testing override, plan revision during compile and execution, cancellation before and after mutation, missing parallel receipts, and a deliberately introduced incomplete item.'
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
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: execution_boundary
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Executor_Protocol.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Progression_Gates.md
- Plans/Orchestrator_Page.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0121
- pldg-20260618-001-prd-planning-wizard:atom-0122
- pldg-20260618-001-prd-planning-wizard:atom-0123
- pldg-20260618-001-prd-planning-wizard:atom-0124
- pldg-20260618-001-prd-planning-wizard:atom-0137
- pldg-20260618-001-prd-planning-wizard:atom-0145
- pldg-20260618-001-prd-planning-wizard:atom-0146
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/07-audit-readiness-and-safety.md#SRC-AUDIT
source_atom_ids:
- atom-0121
- atom-0122
- atom-0123
- atom-0124
- atom-0137
- atom-0145
- atom-0146
decision_refs:
- dec-0025
- dec-0027
- dec-0028
correction_refs: []
preserved_exact_tokens:
- WorkNodeRecord
- WorkNodeMaterializationReceipt
- worknode_id
- goal_run_id
- workgraph_revision
- attempt_id
- replan generation
- project_plan_node
- compatibility adapter
- Planning Wizard approval
- Plan Compile certification
- WorkNode completion
- Goal completion
- clean-room fixture
- exactly one PlanCompileRun
- entrypoint queued
- duplicate PlanApproved
- dirty repository
- missing parallel receipts
- deliberately introduced incomplete item
negative_constraints:
- Do not overload a legacy plan-node shape as runtime execution truth.
owner_hints:
- Plans/Executor_Protocol.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Progression_Gates.md
- Plans/Orchestrator_Page.md
- Plans/Automated_Testing_System.md
```

## Ledger Compile Addendum - pldg-20260629-001-feature-name

This addendum compiles Free Models executor dispatch and adapter activation behavior. It does not create WorkNodes, NodeSeeds, executable queues, generated governance artifacts, or implementation files.

### EP-107 - Free Models Dispatch Fallback Attempt Bounds And In-Flight Isolation

```yaml
plan_unit_id: EP-107
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor consumes Models_System precedence, Multi-Account pressure, Usage budget gates, and Prompt Pipeline requested/effective route snapshots when dispatching Free Models routes. Automatic fallback is bounded by configurable global/section limits and defaults to the initial selected/requested attempt plus `2` automatic fallback attempts. Auto Apply/model refresh changes never alter in-flight requests and apply only to new routing decisions after completion.
gui_related: false
gui_classification_reason: Defines runtime dispatch and in-flight request semantics, not GUI presentation.
depends_on: []
unblocks: []
acceptance_criteria:
  - Attempt limit counts the initial selected/requested model plus every automatic switch attempt.
  - Partial streaming failures are surfaced as partial/failure state with retry/switch action and are never silently retried/spliced.
  - Auto Apply/model refresh completion does not change in-flight model/provider/account/source snapshots.
  - Executor emits receipt inputs for attempted models, skipped entries, reasons, and final selected/stopped result.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models fallback attempt limit fixtures
  - In-flight update isolation fixtures
  - Partial-stream failure routing fixtures
risk_class: fallback_dispatch_drift
reasoning_tier: high
context_scope: free_models_executor_dispatch
implementation_surfaces:
  - Plans/Executor_Protocol.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: free_models_executor_dispatch_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0023, atom-0029, atom-0039, atom-0043, atom-0074, atom-0078, atom-0211, atom-0212, atom-0215, atom-0216, atom-0217, atom-0218, atom-0221, atom-0222, atom-0226, atom-0230, atom-0234, atom-0238, atom-0283, atom-0284, atom-0285, atom-0286]
preserved_exact_tokens:
  - "initial attempt plus 2 automatic fallbacks"
  - "attempt limit"
  - "partial streaming failures"
  - "Auto Apply/model refresh changes never alter in-flight requests"
  - "new routing decisions"
negative_constraints:
  - Do not make fallback unbounded by default.
  - Do not let automatic fallback retries bypass the configured attempt limit.
  - Do not silently retry/splice a different model after partial streaming output.
  - Do not break, cancel, or rewrite in-flight requests because Auto Apply or model refresh completes.
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
```

### EP-108 - Free Models PM-Owned Runtime Adapter Activation Boundary

```yaml
plan_unit_id: EP-108
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor may consume Free Models runtime behavior changes only after PM-owned adapter validation has produced safe declarative router/probe/normalizer/fallback configuration, test evidence, source hashes, activation receipts, quarantine state, and rollback refs. Executor must not run upstream daemons, Docker workflows, command scripts, local proxies, telemetry hooks, credential writers, endpoint installers, self-update logic, or arbitrary config writers as part of Free Models routing.
gui_related: false
gui_classification_reason: Defines executor/runtime activation boundary, not GUI presentation.
depends_on: []
unblocks: []
acceptance_criteria:
  - Runtime behavior changes are limited to Free Models and apply only after PM-owned adapter validation.
  - Unsafe upstream runtime behavior produces blocked/quarantined evidence rather than execution.
  - Activation receipts and rollback refs are available to diagnostics and storage.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models adapter activation fixtures
  - Unsafe runtime behavior quarantine fixtures
risk_class: unsafe_runtime_activation
reasoning_tier: high
context_scope: free_models_runtime_adapter_activation
implementation_surfaces:
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/FileSafe.md
  - Plans/Permissions_System.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: free_models_runtime_adapter_activation_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/source_shards/free_coding_models_temp_checkout_inspection_20260629.json
source_atom_ids: [atom-0012, atom-0026, atom-0028, atom-0033, atom-0060, atom-0061, atom-0063, atom-0064, atom-0066, atom-0070, atom-0076, atom-0080, atom-0106, atom-0110, atom-0196, atom-0200, atom-0277, atom-0278]
preserved_exact_tokens:
  - "no Docker"
  - "native"
  - "Runtime behavior changes should be automatic too, but only for the free model provider."
  - "PM-owned declarative router/probe/normalizer/fallback configuration"
  - "activation receipts"
  - "quarantine"
  - "rollback"
negative_constraints:
  - Do not inherit the upstream local daemon as PM's execution model without PM-native adaptation.
  - Do not execute arbitrary upstream commands/scripts, local proxies, telemetry hooks, credential writers, endpoint installers, self-update logic, or arbitrary config writers.
  - Do not auto-apply runtime behavior for non-Free-Models providers during manual all-provider refresh.
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/FileSafe.md
  - Plans/Permissions_System.md
```

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host Executor intake and execution-lane boundaries. It does not create WorkNodes, NodeSeeds, executable queues, runtime dispatch, implementation files, generated governance artifacts, or production build tasks.

### EP-109 - HostCapabilityCommand Executor Intake Boundary

```yaml
plan_unit_id: EP-109
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor consumes HostCapabilityCommand and HostOperationRequest through ExecutorIntakeReport or equivalent intake,
  not through Coasts local API, terminal, file controls, or container-local endpoints. Accepted lanes include
  apps/services under test, PM work, provider tools, agent harnesses, shells, and integration commands only where
  runtime execution is later enabled and authority allows it. Intake records host_capability_ref, host_profile_id,
  host_assignment_id, execution_unit_context, worktree/cwd binding, permission_snapshot_id, FileSafe scope,
  approval_scope_key, network_access_policy, secret_access_policy, destructive_command_policy, transcript policy,
  cleanup policy, expected receipts, host preflight, lane-specific evidence, cleanup/retention disposition, and
  blocked/failure reason. Host-side commands such as lint/typecheck/format/git/package installs/static analysis/browser
  tests stay host/worktree side unless runtime services are required; container-runtime commands are for service context,
  database/API/integration work, runtime-specific tests, logs, exec, and artifact capture.
gui_related: false
gui_classification_reason: Executor intake and authority boundaries are backend execution contracts, not GUI presentation.
depends_on: [CV-304, PS-126, F2-194, RM-048]
unblocks: [T-166, GRS-032, OSI-431, ACD-430, OP-028]
acceptance_criteria:
  - Every host action is accepted or blocked through Executor intake, preflight, authority checks, and expected receipts.
  - Host use cannot bypass Run_Modes, Permissions, FileSafe, tool policy, provider/account identity, or Runtime Artifacts evidence boundaries.
  - Runtime Artifacts projects evidence but never becomes the receipt authority.
  - Blocked outcomes preserve blocked != failed and expose reason codes and allowed actions.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future HostCapabilityCommand ExecutorIntakeReport fixtures
  - future blocked != failed host action fixtures
risk_class: host_executor_bypass
reasoning_tier: high
context_scope: containerized_host_executor_intake
implementation_surfaces:
  - Plans/Executor_Protocol.md
  - future Executor intake
node_compile_hint:
  mode: host_capability_executor_intake_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0023
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0029
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0034
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0044
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0053
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0060
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0064
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0069
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0073
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0081
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#execution_lane_matrix
source_atom_ids: [atom-0023, atom-0029, atom-0034, atom-0044, atom-0053, atom-0060, atom-0064, atom-0069, atom-0073, atom-0081]
decision_refs: [dec-0005, dec-0008, dec-0010, dec-0017, dec-0020]
preserved_exact_tokens:
  - "HostCapabilityCommand"
  - "HostOperationRequest"
  - "ExecutorIntakeReport"
  - "execution_unit_context"
  - "approval_scope_key"
  - "permission_snapshot_id"
  - "FileSafe scope"
  - "network_access_policy"
  - "secret_access_policy"
  - "destructive_command_policy"
  - "transcript policy"
  - "cleanup policy"
  - "required receipt refs"
  - "apps/services under test"
  - "PM work"
  - "provider tools"
  - "agent harnesses"
  - "shells"
  - "integration commands"
  - "where runtime execution is later enabled and authority allows it"
  - "blocked != failed"
negative_constraints:
  - Do not copy Coasts HTTP `/api/v1`, permissive CORS, SSE/WebSocket terminal, file/service controls.
  - Do not route every command through a container just because a host exists.
  - Do not let container exec bypass Executor/Permissions/FileSafe/receipts.
  - Do not imply runtime dispatch, WorkNodes, NodeSeeds, executable queues, or PlanCompile runtime are enabled by this compile.
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Run_Modes.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
  - Plans/Tools.md
  - Plans/Runtime_Artifacts_Panel.md
```

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### EP-110 - P0-STREAM-HISTORY-COALESCER

```yaml
plan_unit_id: EP-110
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  P0-STREAM-HISTORY-COALESCER (P0) is compiled as canonical Puppet Master intent for Prevent streaming partials from becoming durable duplicate history: Cumulative snapshots are persisted once; missing terminal event is retryable error; zero-usage aborted turn is not model replay content.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Cumulative snapshots are persisted once
- missing terminal event is retryable error
- zero-usage aborted turn is not model replay content.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Cumulative snapshots are persisted once
- missing terminal event is retryable error
- zero-usage aborted turn is not model replay content.
risk_class: p0_transport_websocket_streaming_hardening
reasoning_tier: high
context_scope: transport_websocket_streaming
implementation_surfaces:
- Plans/Executor_Protocol.md
- Plans/Prompt_Pipeline.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: p0_stream_history_coalescer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0045
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0045
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0041/P0-STREAM-HISTORY-COALESCER@line=41
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0041/P0-STREAM-HISTORY-COALESCER
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:5
source_atom_ids:
- atom-0045
external_atom_id: extrepo-20260703-0041
source_row_id: P0-STREAM-HISTORY-COALESCER
priority: P0
finding_family: Prevent streaming partials from becoming durable duplicate history
target_docs:
- Plans/Executor_Protocol.md
- Plans/Prompt_Pipeline.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
owner_hints:
- Plans/Executor_Protocol.md
- Plans/Prompt_Pipeline.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
preserved_exact_tokens:
- extrepo-20260703-0041
- P0-STREAM-HISTORY-COALESCER
- P0
- Prevent streaming partials from becoming durable duplicate history
negative_constraints: []
proposal_or_recommendation: Cumulative snapshots are persisted once; missing terminal event is retryable error; zero-usage aborted turn is not model replay content.
compile_disposition: create_new_planunit
```

### EP-111 - P0-WEBSOCKET-TRANSPORT-POLICY

```yaml
plan_unit_id: EP-111
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  P0-WEBSOCKET-TRANSPORT-POLICY (P0) is compiled as canonical Puppet Master intent for Define transport policy for WebSocket/SSE/stdout/unix-socket/HTTP: Transport decision receipts include locality, auth, replay, backpressure, fallback, and provider support; OpenCode remains HTTP/SSE unless upstream contract changes.
gui_related: true
gui_classification_reason: Target docs include GUI/UI command or user-visible surfaces; mixed work is conservatively GUI-related.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Transport decision receipts include locality, auth, replay, backpressure, fallback, and provider support
- OpenCode remains HTTP/SSE unless upstream contract changes.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Transport decision receipts include locality, auth, replay, backpressure, fallback, and provider support
- OpenCode remains HTTP/SSE unless upstream contract changes.
risk_class: p0_transport_websocket_streaming_hardening
reasoning_tier: high
context_scope: transport_websocket_streaming
implementation_surfaces:
- Plans/Executor_Protocol.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/FinalGUISpec.md
- Plans/Provider_OpenCode.md
- Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: p0_websocket_transport_policy
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0046
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0046
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0042/P0-WEBSOCKET-TRANSPORT-POLICY@line=42
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0042/P0-WEBSOCKET-TRANSPORT-POLICY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:6
source_atom_ids:
- atom-0046
external_atom_id: extrepo-20260703-0042
source_row_id: P0-WEBSOCKET-TRANSPORT-POLICY
priority: P0
finding_family: Define transport policy for WebSocket/SSE/stdout/unix-socket/HTTP
target_docs:
- Plans/Executor_Protocol.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/FinalGUISpec.md
- Plans/Provider_OpenCode.md
- Plans/CLI_Bridged_Providers.md
owner_hints:
- Plans/Executor_Protocol.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/FinalGUISpec.md
- Plans/Provider_OpenCode.md
- Plans/CLI_Bridged_Providers.md
preserved_exact_tokens:
- extrepo-20260703-0042
- P0-WEBSOCKET-TRANSPORT-POLICY
- P0
- Define transport policy for WebSocket/SSE/stdout/unix-socket/HTTP
negative_constraints: []
proposal_or_recommendation: Transport decision receipts include locality, auth, replay, backpressure, fallback, and provider support; OpenCode remains HTTP/SSE unless upstream contract changes.
compile_disposition: create_new_planunit
```

### EP-112 - P1-WEBSOCKET-BACKPRESSURE-DIAGNOSTICS

```yaml
plan_unit_id: EP-112
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  P1-WEBSOCKET-BACKPRESSURE-DIAGNOSTICS (P1) is compiled as canonical Puppet Master intent for Add bounded queues, overload, retry, and pressure diagnostics: Frame ingress queues bounded; overflow returns structured overload; UI distinguishes provider stall, WS reconnect, backend stall, and UI render lag.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Frame ingress queues bounded
- overflow returns structured overload
- UI distinguishes provider stall, WS reconnect, backend stall, and UI render lag.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Frame ingress queues bounded
- overflow returns structured overload
- UI distinguishes provider stall, WS reconnect, backend stall, and UI render lag.
risk_class: p1_transport_websocket_streaming_hardening
reasoning_tier: standard
context_scope: transport_websocket_streaming
implementation_surfaces:
- Plans/Executor_Protocol.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/storage-plan.md
node_compile_hint:
  mode: p1_websocket_backpressure_diagnostics
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0053
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0053
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0049/P1-WEBSOCKET-BACKPRESSURE-DIAGNOSTICS@line=49
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0049/P1-WEBSOCKET-BACKPRESSURE-DIAGNOSTICS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:13
source_atom_ids:
- atom-0053
external_atom_id: extrepo-20260703-0049
source_row_id: P1-WEBSOCKET-BACKPRESSURE-DIAGNOSTICS
priority: P1
finding_family: Add bounded queues, overload, retry, and pressure diagnostics
target_docs:
- Plans/Executor_Protocol.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/storage-plan.md
owner_hints:
- Plans/Executor_Protocol.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/storage-plan.md
preserved_exact_tokens:
- extrepo-20260703-0049
- P1-WEBSOCKET-BACKPRESSURE-DIAGNOSTICS
- P1
- Add bounded queues, overload, retry, and pressure diagnostics
negative_constraints: []
proposal_or_recommendation: Frame ingress queues bounded; overflow returns structured overload; UI distinguishes provider stall, WS reconnect, backend stall, and UI render lag.
compile_disposition: create_new_planunit
```

### EP-113 - P1-STREAM-HISTORY-COALESCER-REPLAY

```yaml
plan_unit_id: EP-113
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  P1-STREAM-HISTORY-COALESCER-REPLAY (P1) is compiled as canonical Puppet Master intent for Streaming/admission/replay boundary: Add StreamHistoryCoalescer with partial_delta, cumulative_snapshot, reasoning_delta, tool_call_fragment, provider_item_id, provider_error, final_assistant_turn, and durable_history_write phases. The preserved PM gap/delta is: Make settled history admission mandatory for all providers, not just context/cache pass. The observed external-repo signal remains source-lineage evidence: OpenCode v2 separates context/source/snapshot/session history and recent releases add event streams and paged durable history. Pi reports WS/SSE first-event stalls; Cline/Codex SDKs centralize session events/history.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- No partial stream fragment is replayed as a full assistant turn.
- Provider native item IDs are kept only where allowed by replay policy.
- First-event timeout is a transport failure, not empty assistant success.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- No partial stream fragment is replayed as a full assistant turn.
- Provider native item IDs are kept only where allowed by replay policy.
- First-event timeout is a transport failure, not empty assistant success.
risk_class: p1_transport_websocket_streaming_hardening
reasoning_tier: standard
context_scope: transport_websocket_streaming
implementation_surfaces:
- Plans/Executor_Protocol.md
- Plans/storage-plan.md
- Plans/Prompt_Pipeline.md
- Plans/Provider_OpenCode.md
- Plans/Models_System.md
node_compile_hint:
  mode: p1_stream_history_coalescer_replay
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0075
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0075
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0071/P1-STREAM-HISTORY-COALESCER-REPLAY@line=71
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0071/P1-STREAM-HISTORY-COALESCER-REPLAY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:17
source_atom_ids:
- atom-0075
external_atom_id: extrepo-20260703-0071
source_row_id: P1-STREAM-HISTORY-COALESCER-REPLAY
priority: P1
finding_family: Streaming/admission/replay boundary
source_repos:
- OpenCode v2
- Pi
- Codex
- Cline
target_docs:
- Plans/storage-plan.md
- Plans/Prompt_Pipeline.md
- Plans/Provider_OpenCode.md
- Plans/Models_System.md
owner_hints:
- Plans/storage-plan.md
- Plans/Prompt_Pipeline.md
- Plans/Provider_OpenCode.md
- Plans/Models_System.md
preserved_exact_tokens:
- extrepo-20260703-0071
- P1-STREAM-HISTORY-COALESCER-REPLAY
- P1
- Streaming/admission/replay boundary
- OpenCode v2
- Pi
- Codex
- Cline
negative_constraints: []
observed_signal: OpenCode v2 separates context/source/snapshot/session history and recent releases add event streams and paged durable history. Pi reports WS/SSE first-event stalls; Cline/Codex SDKs centralize session events/history.
pm_current_coverage: Prior pass recommended StreamHistoryCoalescer; storage-plan has seglog replay/checkpoints and context ownership.
pm_gap_or_delta: Make settled history admission mandatory for all providers, not just context/cache pass.
proposal_or_recommendation: Add StreamHistoryCoalescer with partial_delta, cumulative_snapshot, reasoning_delta, tool_call_fragment, provider_item_id, provider_error, final_assistant_turn, and durable_history_write phases.
compile_disposition: create_new_planunit
```

### EP-114 - FABLE Wake Coalescing And Transport Receipt Closure

```yaml
plan_unit_id: EP-114
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor owns deterministic scheduler wake coalescing, ready-node score tuple
  sorting, closed failure/blocked mapping, stream terminal timeout, backpressure
  bounds, and transport decision receipts for the FABLE contract-runtime core
  slice. Each {run_id, replan_generation} has at most one pending wake set; the
  earliest wake becomes scheduler.pass.wake_reason, additional wakes become
  coalesced_wake_reasons and wake_event_refs, and watchdog_recheck never outranks
  an event-driven wake. Ready nodes sort by scheduler_lane_rank DESC,
  manual_priority DESC, transitive_unblock_count DESC, ready_since_utc ASC, and
  node_id ASC. Stream terminal timeout is 5000 ms, backpressure is bounded at
  1024 frames or 16777216 bytes, and each adapter selection records a
  transport_decision_receipt.
gui_related: false
gui_classification_reason: This unit defines runtime scheduling and transport behavior, not visual presentation.
depends_on: [EP-026, EP-028, EP-030, EP-032, EP-085, EP-098, EP-110, EP-111, EP-112, EP-113, CV-313]
unblocks: []
acceptance_criteria:
  - "`scheduler.pass` uses the closed wake_reason set shared with Contracts_V0."
  - Wake coalescing records primary wake, coalesced wake reasons, and event refs without creating duplicate scheduler passes.
  - Queue analysis persists the complete score tuple and non-selected reason for ready-but-unselected nodes.
  - Failure and blocked classifications map auth_required separately from auth_expired and fail closed on unknown classifier values.
  - Missing terminal stream events time out after 5000 ms as retryable provider_transient inactivity_timeout rather than durable assistant content.
  - Backpressure is bounded at 1024 frames or 16777216 bytes and overflow returns structured overload evidence.
  - Transport decision receipts include locality, auth, replay, backpressure, fallback, provider support, decision reason, selected timestamp, and event refs.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: fable_executor_wake_coalescing_drift
reasoning_tier: high
context_scope: contract_runtime_core_repair
implementation_surfaces:
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: executor_wake_coalescing_transport_closure
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md
  - Plans/.audits/fable-20260706/P0_P1_REPAIR_PLAN.md
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "`wake_reason`"
  - "`scheduler.pass`"
  - "`coalesced_wake_reasons[]`"
  - "`wake_event_refs[]`"
  - "`scheduler_lane_rank`"
  - "`failure_class`"
  - "`blocked_reason_code`"
  - "`auth_required`"
  - "`auth_expired`"
  - "`stream_terminal_event_timeout_ms = 5000`"
  - "`max_pending_stream_frames = 1024`"
  - "`max_pending_stream_bytes = 16777216`"
  - "`transport_decision_receipt`"
negative_constraints:
  - Do not treat this runtime protocol closure as implementation-readiness proof or runtime certification harness completion.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, production build tasks, generated governance artifacts, or governance seal outputs from this contract unit.
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical executor protocol spec text for deferred non-runtime FABLE rows. It creates no WorkNodes, NodeSeeds, executable queues, runtime artifacts, implementation files, build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

### execution_unit_context Example And Conditional Requirements

Repairs row `sfk-1e2487142a1e52002f8eb946`.

Example:

```json
{
  "schema_id": "pm.execution_unit_context",
  "schema_version": "1.0.0",
  "execution_unit_type": "plan_unit",
  "project_id": "project-001",
  "run_id": "run-001",
  "unit_id": "PDS-003",
  "attempt_id": "attempt-001",
  "permission_snapshot_id": "perm-001",
  "input_artifact_refs": [],
  "owner_doc_refs": ["Plans/Plan_Document_System.md"]
}
```

Conditional requirements: `plan_unit` requires `unit_id` and `owner_doc_refs[]`; `tool_attempt` requires `tool_call_id`, `permission_snapshot_id`, and `attempt_id`; `verification` requires `validator_id`, `target_ref`, and `evidence_ref`; `repair_slice` requires `audit_id`, `finding_key`, and `owner_doc_refs[]`.

### Attempt Counter Invariant Recovery

Repairs row `sfk-d91a2513114704894b54b826`.

If sub-counters disagree with `attempt_count`, the executor records `attempt_counter_mismatch` with `attempt_id`, `attempt_count`, `subcounter_name`, `subcounter_value`, `expected_value`, and `recovery_action`. `recovery_action` values are `recompute_from_events`, `block_for_manual_repair`, and `ignore_non_authoritative_projection`. Event history is authoritative; projections must be recomputed before any retry/skip/complete transition.

### Event Dedup Key Sequence Fallback

Repairs row `sfk-13a077c1b96ec11515ca81d4`.

Dedup identity is `event_name + node_id + attempt_id + event_sequence`. Timestamp is metadata only. If `event_sequence` is missing in imported source, the migration reader derives `event_sequence` from stable event-stream order and records `dedup_sequence_derived = true`. New executor events must carry monotonic `event_sequence` per attempt.


## Known-37 run-start and recovery-unavailable admission

Status: `STATICALLY_MATERIALIZED`; dispatch/runtime behavior is `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`.

Before `run.started`, Executor assembles and persists one complete immutable `pm.requested_effective_runtime@1.0.0` record, resolves its exact key/ref/digest and all six owner refs, copies the minimum v2 joins, and requires envelope/payload/snapshot equality. The sequence is `candidate -> admission_validated -> runtime_identity_resolved -> activated -> start_recorded`; the barrier event is durable before provider/tool execution attributable to the run. Same semantic start replays the original; a different digest is an idempotency conflict. Thin, missing, mutable, stale, secret-bearing, or historically unresolvable snapshots fail closed.

For a `recovery_unavailable` episode, Executor revalidates `project_id, run_id, node_id, blocked_sequence, safe_point_id, anchor_ref, snapshot_refs, reason`, current ordered membership, permission/storage access, exclusivity, and pre/post-attempt identity. Pre-attempt event/request/result omits `attempt_id`; its anchor/receipt carries required-present null. Post-attempt surfaces require the exact existing prior attempt ID.

The only new handlers are `handlers::runtime::locate_and_verify_recovery` and `handlers::runtime::abandon_recovery`. Transition order is current admission, command verification/confirmation, durable typed result and `recovery_unavailable_resolution_receipt`, atomic anchor release, then projection refresh/downstream admission. Replan releases only after durable admitted replan; conditional fresh attempt releases only after a distinct successor and baseline receipt, using `superseded_with_verified_successor`. A refused, failed, stale, unavailable, or uncommitted result leaves the anchor `recovery_unavailable`.

## Transition In-Flight Safety Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. A fresh context-window transition (Plans/Prompt_Pipeline.md PP-085) is allowed only at a safe boundary: before discarding active context, the executor identifies a safe point, reconciles or retains every in-flight operation under its existing receipt identity (worktree, tool, and external operations keep their `attempt_id`-bound receipts; unknown external outcomes enter normal reconciliation, never blind re-execution), and persists required checkpoints. Context changes alone never create a new attempt; whether a true retry starts a new `attempt_id` remains the executor's decision under the existing attempt-identity rule. Late tool results and external callbacks arriving after a transition are fenced by `replan_generation`/stop epoch and cannot reactivate cancelled or superseded work; recovery after a transition consults durable attempt records and safe points, never notebook prose.

```yaml
plan_unit_id: EP-115
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Fresh-window transitions occur only at safe boundaries. In-flight operations keep their existing operation/receipt identities across the transition and reconcile through the normal paths; unknown side-effect outcomes are never blindly re-executed. Context changes alone do not create a new attempt; the executor decides retry identity per the existing attempt-identity rule. Stop/cancel, permissions, topology, and relevant generations are re-checked at final dispatch, and late results are fenced and cannot reactivate cancelled work.
gui_related: false
gui_classification_reason: Executor safety is runtime behavior, not GUI work.
depends_on: [EP-086, SIR-036]
unblocks: []
acceptance_criteria:
  - In-flight mutations during a transition request wait for a safe boundary or retain receipt identity for reconciliation.
  - Late results do not reactivate cancelled work.
  - Crash recovery around transitions repeats no mutation and invents no completion.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: duplicate_side_effect
reasoning_tier: high
context_scope: executor_protocol
implementation_surfaces: [Plans/Executor_Protocol.md, Plans/Shared_Integration_Runtime.md, Plans/Prompt_Pipeline.md]
node_compile_hint: {mode: runtime_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C08
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C09
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A24
preserved_exact_tokens: ["safe boundary", "attempt_id", "replan_generation", "blind re-execution"]
negative_constraints:
  - Do not replay a mutation merely to reconstruct context.
  - Do not treat a context change as a new attempt by itself.
owner_hints: [Plans/Executor_Protocol.md, Plans/Prompt_Pipeline.md]
```

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Prompt_Pipeline.md

## Run-start consumer binding and recovery read boundary - 2026-09-11

**Versioned run-start reader adoption.** For `run.started`, the current reader is `executor.run_start_recovery_evidence.v2@2.0.0` through `storage.run_started_index.v2@2.0.0` and the SP-265/SP-278 successor contract. The v1 identifiers in the following predecessor text are compatibility-only; its owner behavior and restrictions apply unchanged to v2. Current publication requires the actual admitted full rebuild and complete current index/source token. Substituting version strings or accepting an old stored digest does not upgrade a v1 reader.

Under DL-045 this addendum newly defines `executor.run_start_recovery_evidence.v1@1.0.0`, a read-consumer binding through SP-265's `storage.run_started_index.v1@1.0.0` reducer and `run_started_index_checkpoint.v1:{storage_instance_id}:{scope_partition}`. It names the existing Executor restart/admission read path, not a new recovery service or handler. Its source is the CURRENT-selected EventRecord index **plus the verified source frame and immutable runtime snapshot**, not index-only run state. The consumer validates the requested run against `payload.run_id`, preserves envelope/project/thread joins, and reports the source event identity and snapshot ref. It cannot materialize missing intake, attempt, safe-point, permission or dispatch authority.

The producer remains Executor's existing immutable start barrier. It still persists and verifies the complete `pm.requested_effective_runtime@1.0.0` snapshot and six owner joins before activation, follows `candidate -> admission_validated -> runtime_identity_resolved -> activated -> start_recorded`, and obtains the synced barrier AppendReceipt before attributable provider/tool work. No GUI/index refresh timing replaces that receipt or becomes an extra provider-start condition. The EventRecord envelope remains `2.0.0`, payload remains the current closed run-start v2 root, and source retention remains `RP-RUNTIME-365D@1.0.0`.

To make the already required same-semantic-start idempotency concrete, newly define the mechanical start identity as `(storage_instance_id, project_id, run_id)` for this binding. Use `replay_policy=dedupe_by_idempotency_key`, `idempotency_key = "run-start:" + lowerhex(SHA256(RFC8785([project_id, run_id])))`, and `event_id = "evt_run_start_" + lowerhex(SHA256(RFC8785([storage_instance_id, project_id, run_id])))`. Storage supplies its actual instance ID and scopes the key by `(scope_partition, event_type, idempotency_key)` under the existing app-root lifetime rule. No account, timestamp, attempt, retry, selected tab or checkpoint generation enters those identities. These formulas are new owner definitions, not claims about existing bytes; historical event identities are never relabelled or rehashed.

The new formulas apply only to a genuinely new logical start. During handover, before treating a run as new, the existing admission path must establish from the verified canonical tail whether that exact project/run already has a committed start, including historical v2 records with other stable keys. If it does, preserve and replay that original event ID/key; never mint the new-formula identity for the same existing run. Retained-tail absence is not historical absence: lawful expiry/deletion may have removed the source. A genuinely new owner-issued run identity or surviving durable owner identity/dedupe evidence must establish that a new logical start is admissible. If neither proves the distinction, return `dedupe_unavailable`; a missing historical source cannot authorize a second start. An incomplete or ambiguous tail check fails closed. Under the existing serialized run-start admission path, first check the current app-root dedupe authority. If the same logical start is already durably committed, compare the immutable semantic request, snapshot ref/digest and producer-owned intent with that original event and return the original durable result; preserve its original authored timestamps, actor/causal fields and bytes. Do not regenerate those fields on retry. A different snapshot, scope or semantic intent under the same identity is `idempotency_conflict`; uncertain dedupe/append truth is `dedupe_unavailable` and blocks further dispatch until Storage reconciles the original append. A valid unacknowledged tail may be adopted only by Case L-2 recovery. Absence of a UI row or missing caller acknowledgement is never permission to append or execute again. Resume of an existing run keeps the same run identity and uses existing resume/attempt authority; it does not mint a second start. A genuinely new run has a new owner-issued `run_id`.

`executor.run_start_recovery_evidence.v1` treats a verified start as evidence of the original start barrier, never evidence that an attempt is live, complete, safe to retry or authorized now. Recovery still requires canonical `executor_intake_report`, `attempt_receipt`, runtime checkpoint markers, safe points, current permissions, worktree/baseline and currentness checks from their owners. Missing canonical records require verified mandatory-backup recovery; neither EventRecord fields nor this disposable checkpoint reconstruct them. Storage recovery, projection rebuild, historical replay or a late start row cannot auto-resume work, repeat provider/tool/network effects, change terminal run state or create Usage charges.

Consumer-only invalidation/withdrawal fences this read path and any recovery admission that requires it, while retaining existing owner behavior for independent new-run admission. Withdrawal of the run-start writer itself stops new activation/start writes until the explicit compatible successor is adopted; it does not remove registration or rewrite history. SP-265 owns checkpoint rebuild and custody; this owner retains execution admission and all current no-auto-resume rules.

ContractRef: ContractName:Plans/Decision_Log.md#DL-045, ContractName:Plans/storage-plan.md#SP-265, ContractName:Plans/Contracts_V0.md#EventRecord, SchemaID:pm.requested_effective_runtime

### Original run-start first-receipt recovery adoption

For exactly the existing `run.started` start barrier and `executor.run_start_recovery_evidence.v2@2.0.0`, Executor explicitly adopts SP-286/CV-339's `storage.first_append_receipt.resolve.v2`. The request is the original admitted EventRecord identity/semantic request under its existing replay policy, not a caller custody row or receipt. Preserve the original Storage instance, project/run identity, actual original event ID and scoped idempotency key, immutable snapshot ref/digest, producer intent and authored semantic fields. Resolve historical original identities before applying the new-run formula; an allowed scoped alternate incoming event ID resolves the original ID and cannot create another logical start. Storage authenticates actual global/scoped key/raw identity, source semantic tuple and canonical issued custody in its original database. The returned eleven-field AppendReceipt and the retained four-field original_append_result must join that original event/sequence and Storage-owned original segment reference/offset. Exact original durability class is the required synced start barrier; a newer locator, timestamp, supplied digest or four-field dedupe result alone cannot satisfy it.

An intact already-issued receipt replays unchanged after lost delivery or interrupted dependent acknowledgement. This passive receipt resolution does not reopen a retired source, reacquire the old manifest/group/request or establish present execution authority. The existing recovery reader still needs its independently verified current SP-265/SP-278 source/index boundary and original runtime snapshot when it claims those source facts; source or snapshot unavailability refuses that claim without erasing an intact receipt. Original full-frame/source/CRC/durability and complete snapshot/six-owner joins remain mandatory where required by the existing start barrier. Receipt-only resolution is not proof that a supplied complete EventRecord equals its originally issued value. For that stronger claim this owner explicitly adopts `storage.first_append_receipt.resolve_full_value.v1` with exact `full_value_request = {event: <the available complete original EventRecord>}` and `full_value_result` from `Plans/event_append_receipt_contracts.schema.json`: compare the original first receipt, original segment ref and CV-339 complete-value commitment to the independently selected original source. It requires actual v2 custody and exact original event ID. An unavailable full-value route cannot be downgraded to semantic replay; an intact v1 row retains only its existing semantic receipt use. No raw value is reconstructed for this call.

Uncertain append is resolved by the actual Storage owner before any dependent start acknowledgement or attributable dispatch. Only an authenticated never-issued complete current protected group may reach `storage.first_append_receipt.issue.v2`, after the original source/manifest barriers and complete current group/source/dedupe/restore checks. Executor never calls first mint from a missing receipt, lost delivery, tail absence or a supplied never-issued flag. A proper subset, lost previously issued custody, restored old pending request or ambiguous original group remains fenced under existing `dedupe_unavailable`/integrity/recovery behavior. In-place restart after actual protected promotion follows SP-286's original group handoff without reconstructing old transient capabilities. A verified older restore does not make omitted run-start work fresh. Only an actual newly accepted owner-issued run after the coordinator's completed restore occurrence/session may use its fresh-operation admission; existing lost/restored run IDs and pending work cannot be renamed or reaccepted as a new start.

At the final held Executor acknowledgement/admission boundary, after all receipt/source/snapshot/currentness helpers, compare the complete original request, resolved receipt/result, actual run/source identity, immutable snapshot and current required permission/Stop/intake/attempt/safe-point/worktree/admission facts. No helper may change those facts between the final check and publication. A passive recovery read instead applies its existing current inspection/access/source token and no-auto-resume predicates; it does not require or grant live-run authority merely to return historical receipt evidence. Any later refusal preserves actual prior start/receipt effects. Receipt recovery cannot activate or resume work, repeat provider/tool/network effects, manufacture missing owner records, change terminal run state or charge Usage. This is explicit adoption of existing shared interfaces, not a new event, source provider, native implementation claim or checkpoint.

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-116, ContractName:Plans/storage-plan.md#SP-265, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/Contracts_V0.md#CV-339, ContractName:Plans/event_append_receipt_contracts.schema.json

### EP-116 - Run-start identity and recovery consumer

```yaml
plan_unit_id: EP-116
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: 'Executor newly defines executor.run_start_recovery_evidence.v2@2.0.0 through SP-265 and
  keeps its existing complete immutable runtime-snapshot barrier before attributable execution. A genuinely
  new logical start uses idempotency_key run-start: plus lowercase SHA-256 of RFC8785([project_id,run_id])
  and event_id evt_run_start_ plus lowercase SHA-256 of RFC8785([storage_instance_id,project_id,run_id]).
  Historical committed identities take precedence; retained-tail absence after lawful removal never proves
  a new run. Equal semantic retries return original durable results and preserve authored bytes, while
  conflicting or uncertain identity fails idempotency_conflict or dedupe_unavailable. The recovery reader
  supplies verified historical start evidence only; canonical intake, attempt, permissions, safe-point
  and currentness authority remain independently required, with no replay dispatch, resume, canonical
  reconstruction or Usage charge. The v1 reader is compatibility-only for this family; current v2 publication
  requires the explicitly admitted SP-265/SP-278 successor and complete current source/index token, with
  unchanged owner behavior.'
gui_related: false
gui_classification_reason: Defines storage or execution contracts, not a new visual surface.
depends_on:
- SP-265
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- Immutable snapshot and six owner joins precede the existing durable start barrier and attributable execution.
- New mechanical identity formulas preserve existing historical event IDs/keys; retained-tail absence
  cannot prove a new logical run, and unknown durable identity is dedupe_unavailable.
- Same semantic start returns the original durable result; conflicting snapshot/intent and uncertain append
  truth produce no second event or dispatch.
- Explicit SP-286/CV-339 receipt resolution preserves issued replay, authentic never-issued protected-group
  recovery and restored/lost-work fencing; full-value-dependent claims require the separate exact v2
  original-value interface without downgrading unavailable proof.
- Final receipt/source/snapshot/admission joins precede dependent publication; passive recovery grants no
  live-run authority and never reacquires retired source solely for an intact receipt.
- The recovery consumer never reconstructs canonical intake/attempt authority, changes terminal state,
  auto-resumes work or charges Usage.
validation_surfaces:
- Plans/run_started_consumer_contracts.schema.json
- Plans/run_started_consumer_contract_fixtures.json
- Native execution of the named replay, crash, source-lookup and custody pairs remains required.
- Plans/event_index_consumer_adoption.schema.json
- Plans/event_index_consumer_adoption_fixtures.json
risk_class: event_source_and_checkpoint_authority_drift
reasoning_tier: high
context_scope: run_started_single_family_depth
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: run_started_owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20260911/step-08-run-started-depth.json
- Plans/storage-plan.md#run-start-and-restore-created-versioned-index-adoption
source_atom_ids: []
negative_constraints:
- No event membership, retention-policy definition, frozen accounting, runtime-proof or governance change.
- No canonical source reconstruction from a checkpoint or UI projection.
owner_hints:
- Plans/storage-plan.md
- Plans/Executor_Protocol.md
```

### EP-117 - Whole original intake, provisioning and bounded native materialization

EP-117 defines original accepted-request intake/provisioning and the bounded native materialization source composition. CV-349 preserves the complete native schema and every original physical field. SP-308 provides exact source/receipt/capture/WorkNode/control/result/origin custody; GRS-077 owns the actual Goal association and Workflow birth. An adopted source contract does not instantiate a WorkNode or grant an Executor lease.

#### Seven whole original input roles

Every role has a complete original semantic output owner, separately identified capture publisher/origin, original durable primary/origin and the following exact full read interface. The request/result definition names resolve in `Plans/workflow_activation_contracts/schemas/operational-custody.v2.schema.json`; source-control primary/origin definitions retain their exact independent source-control resource. The complete source and current-control arguments remain in separate CV-349 realms.

| Whole original input role | Actual output owner | Original durable reader | Full direct request/result |
|---|---|---|---|
| `native_compile` | `owner.plan_compile.native.publish_state_input.v1` | `owner.native_plan_compile_checkpoint.read_original.v1` | `/$defs/CompilerReadRequest` / `/$defs/CompilerReadResult` in operational-custody.v2 |
| `compile_certification` | `owner.plan_compile.native.publish_certification_input.v1` | `owner.native_plan_compile_certification_receipt.read_original.v1` | `/$defs/CertificationReadRequest` / `/$defs/CertificationReadResult` in operational-custody.v2 |
| `aggregate_intake` | `owner.executor.intake.publish_aggregate_input.v1` | `owner.executor_aggregate_intake_receipt.read_original.v1` | `/$defs/AggregateReadRequest` / `/$defs/AggregateReadResult` in operational-custody.v2 |
| `test_capability` | `owner.ats.test_capability.output.v1` | `owner.ats_test_capability_receipt.read_original.v1` | `/$defs/TestReadRequest` / `/$defs/TestReadResult` in operational-custody.v2 |
| `model_resolution` | `models.resolve_plans_to_code_role.v1` | `owner.models_plans_to_code_resolution_receipt.read_original.v1` | `/$defs/ModelsReadRequest` / `/$defs/ModelsReadResult` in operational-custody.v2 |
| `worknode_request_set` | `goal_runtime.executor.decide_activation_request_set.v1` | `owner.workflow_activation_request_set_decision.read_original.v1` | `/$defs/RequestSetReadRequest` / `/$defs/RequestSetReadResult` in operational-custody.v2 |
| `source_control_preflight` | `owner.executor.source_control_preflight.output.v1` | `owner.executor_source_control_preflight_receipt_source.read_original_activation.v1` | `/$defs/PreflightReadRequest` / `/$defs/PreflightReadResult` in operational-custody.v2 |


The original publishers and every lower reader authenticate the exact actual accepted graph/request/source scope, entire original input value and canonical request digest, operation/output identity and revision, owner/epoch, occurrence and original transaction. Equal bytes from another operation do not acquire original identity. Every complete durable binding retains the original capture and actual primary/origin; the capture is provenance, not input content or a renewed live lease. Current direct live/audit result selection remains CV-349’s exact inner union; durable reads retain their whole available/unavailable grammar and action_authority=none.

#### Actual aggregate intake and provisioning

`owner.executor.intake.publish_aggregate_input.v1` publishes the entire thirteen-field executor_intake_report through the new executor_aggregate_intake_receipt family. Every blocker, accepted/rejected request, source-control/test/Models/authority/evidence reference and full handoff remains. It binds the genuine whole graph and complete per-request reports under their unchanged MessagePack family. Already committed genuine per-request rows are read dependencies; newly co-issued rows participate only through their real original transaction. The aggregate is the actual original output, not a reconstruction from a later collection, and no per-request registry row is repurposed as the aggregate. Mixed, blocked, rejected and all explanations remain truthful. An incompatible genuine per-request value under an inherited PredicateObservation refinement is unavailable until its original owner/consumer schema contract is resolved; it cannot be coerced to fit.

`owner.executor.intake.issue.v1` independently derives the complete A4 NativeIntakeSource from these actual aggregate/per-request sources and accepted original graph/request membership. `owner.executor.provision.issue.v1` independently derives the complete A4 ProvisioningReceipt from the actual accepted requests and genuine preflight, test and Models outputs. Both preserve exact required/optional membership and original original_source/complete_input bindings. Revalidate approved versus actual repository, host, environment, original permission/write ceilings, provider/account/model, test capability/harness, source-control/safe-point/rollback, budget, parallelism and current writer-capable Storage at their actual owners. No fake Attempt or WorkNode is created to fill an execution_unit_context; real native context, when present, remains whole under its unchanged owner schema.

Source-control preflight reuses the one genuine `executor_source_control_preflight_receipt_source` and `executor_sc_receipt_original_origin` through `owner.executor.source_control_preflight.output.v1` joined with `owner.storage.executor_sc_receipt.publish.v1`. `owner.executor_source_control_preflight_receipt_source.read_original_activation.v1` consumes the whole original PreflightReadRequest/PreflightReadResult. The full 25-field receipt at /record/receipt, complete original context and handoff match the exact same accepted request, whole request digest, scope, output_identity, occurrence and actual service/native operation as OriginalPreflightLiveStage. Its separately typed live capture and origin remain original provenance. A later completion capture, current repository report, fresh probe or compact live capture cannot replace it. Existing SCS-021/FileSafe/source-control recovery and backup claims remain independently required where applicable; this accepted-request reuse adds no Source Control product operation or new receipt body.

ATS-053 supplies the complete 22-field original test_capability_report and original output identity; MS-139 supplies all eight original Models resolution fields plus actual native model/configuration/capability and runtime sources where required. Neither source is reduced to a capability Boolean or effective-model name. The original provisioning output retains all members of those role arrays, preserving original request applicability. Absence is admissible only when the genuine original provisioning source has no such member and the actual original admission permits that branch; a failed reader is never converted to absence.

`owner.executor.activation.decide.v1` performs its own full source integrity, accepted membership, provisioning and original request-set checks, issuing a complete original decision/origin only on actual owner admission. `goal_runtime.executor.decide_activation_request_set.v1` retains the entire WorkNodeRequests decision and its exact reasons/readiness/activation linkage. A mixed required result refuses; a retained failed decision is not re-decided to manufacture materialization.

#### Complete current materialization argument and native join

`Plans/workflow_activation_contracts/schemas/native-worknode-current-activation.v1.schema.json` has a new explicit resource ID. `Plans/workflow_activation_contracts/current-materialization-reference-map.json` enumerates its 33 ID/reference changes and verifies that reversing only those changes reconstructs the entire old schema exactly. Activation references now name the actual full A4 resource explicitly; all other relative references name their exact old effective resources so the new enclosing ID cannot alter their target. The old native schema/ID and complete graph remain historical resources. No old lexical alias is rebound to the new native schema. A4 remains byte-exact: all 82 definitions, source records, original metadata and capture provenance are unchanged.

`Plans/workflow_activation_contracts/schemas/current-materialization.v1.schema.json` adds a separate whole current source argument. `native_candidates` is the complete current-native MaterializeCurrentCandidates, including every original input, whole WorkNode/control/run-control candidate and complete original result. Current original RequiredSet and CompletionRequirementSource additionally retain their whole A4 bodies with GRS-075 empty-child refinements. The complete current source graph is authenticated too; array validation alone is insufficient.

The second part supplies seven full original activation source values with their genuine original issuer origins: native compiler source, certified graph, aggregate intake source, provisioning source, accepted activation decision, original completion requirements and this complete source request. These are actual complete A4 physical values, not metadata projections or source-hash placeholders. OriginalSourceBinding/physical keys and complete physical hashes must equal the genuine sources referenced by the native inputs and the original accepted graph/activation chain. The native input `original_source_request` equals the source request's entire semantic record. Pending materialization values are independently derived complete candidates in the actual original transaction, not falsely claimed previously persisted sources.

`seven_durable_original_inputs` supplies all seven typed routes. Compiler, certification, aggregate and request-set entries contain their complete durable binding and entire successful original read. Preflight, test and Models entries contain complete collections of those same pairs, preserving every corresponding original provisioning member. The original owner proves exact multiset membership and identity with no duplicates, omissions or foreign entries; original array order is preserved wherever the canonical source declares it. An empty collection is allowed only when the complete authenticated original provisioning source has no member for that role and the actual original admission permits that case. Missing source or failed read never becomes empty, and no not-required result, fake probe or invented model output is introduced. This preserves A4's existing per-role array cardinalities and original native obligations rather than narrowing them to one representative receipt.

Each durable binding's `original_capture` equals the complete original A4 metadata `complete_input` at its matching source position: NativeCompileSource.compile_metadata; CertifiedGraphSource.compile_certification_receipt; NativeIntakeSource.aggregate_intake; each ProvisioningReceipt.source_control/test_capability_reports/model_resolution_receipts member; and the native input RequiredSet.worknode_requests. The actual native owner authenticates original capture/source/origin identities and full bytes. A4's stored capture is provenance; this route does not call an original-live reader, demand its old native lease, change its source_mode, reissue a capture or treat retained metadata as full content.

For each pair, the original read's full source/origin is exactly the durable binding's selected primary/origin and belongs to the same actual original method, operation, transaction, output identity/revision and source scope. The complete returned input and original semantic hash/codec equal the whole genuine original value captured by that operation. Current compiler reads additionally carry the whole checkpoint, not just its run view. Native compiler source metadata, certification and graph/request sources, intake membership, provisioning source/request applicability and original WorkNodeRequests declaration must all describe the same accepted original activation. Distinct semantic outputs do not acquire identity merely from equal bytes or caller IDs.

The exact native candidate WorkNode, readiness, authority, model metadata, test binding, source lineage and currentness remain derived from these complete original sources. In particular the native WorkNode.model is the same entire A4 Models metadata object, while the durable Models collection supplies its full eight-field receipt and actual accepted-request applicability. Original requested_effective_runtime and original configuration/policy sources remain independently authenticated where required; the resolution receipt cannot substitute for them. Preflight uses C's one genuine primary/origin and does not fabricate native WorkNode/Attempt context for accepted-request preflight.

The original seven durable readers return their exact available/unavailable union. This success argument can only be prepared after every required whole original read is available. Upstream unavailable, corrupt, stale, foreign, duplicate or missing required inputs prevent original materialization; no validator fallback, old live retry, re-probe or second model resolution repairs them. A separately authorized new original operation needs new admission and provenance.

`current_guard` remains a separate native argument validated in the actual current shared-control realm. Materialization requires CurrentGoalGuard's actual_bound_goal branch and the complete genuine GRS-074 Workflow association already committed with the shared Goal metadata mutation. OriginalPreGoalGuard is valid for truly pre-Goal compiler/preflight sources but never for actual materialization. Full BodyControlV2, effective host Stop, binding revision/origin/control, exhaustive registered writer domain/head and actual original Goal/project/thread/run/owner joins are checked from real owners. Neither old native GoalControlWitness nor the schema-valid serialized arguments establish current authority.

Before helpers, each actual original Executor/Workflow/source/Storage participant authenticates all complete source/preimage values, owner capabilities and current guard, and independently derives all complete pending output rows/origins and the transaction union. Each helper/directly callable reader or lower writer repeats its own checks. After all helpers return, the actual native materializer and final joint publisher independently compare all full source and candidate bytes, original graph/requirement emptiness, current writer-domain/control/Stop and exact union in the final pure predicate with no subsequent helper or mutable gap before commit/release. The genuine same transaction includes full native WorkNode/control/run-control/result/origins and A4 born/materialization/installed-graph/required-set/body/control/transition participants. Whole authenticated readback precedes dependent exposure. No event or dispatch is released here; prior genuine effects remain durable on later refusal.



The named realms are exactly current_materialization_source for CurrentMaterializeArgument and WorkflowMaterializationLowerArgument, and current_goal_control for current_guard plus CurrentAssociatedGoalRead. T2 can begin only after GRS-077’s authentic T0/T1 binding reservation and original joint publication. The actual Goal B1 ordinary revision/currentness/body/control, accepted objective head and original binding receipt/origin must be the specifically committed association metadata step; an arbitrary intervening Goal edit is not admitted by the bridge. B0’s immutable launch selector stays historical. T2 reads whole actual current pre-materialization Workflow W0/control/outbox and every original source/origin; no vanished B0 full body is required.

Native MaterializeCurrentInputs.original_goal_run_body/control are the entire actual current W0 preimages at T2, not a later W1 and not a relabeled historic value. Native original_installed_graph and original_required_set are complete genuine candidates staged in that same T2, whose actual graph/requirement sources have already been authenticated. Born records/origins precede complete materialization receipts/origins, then full installed graph and RequiredSet/origins, then all complete native WorkNode wrappers, WorkNode controls, native operation results, global run control with its required installed_workgraph binding, and their original native publication origins. The actual original transition/origin precedes W1’s origin and new Workflow control/origin; W1 remains ready with materialized activation state and ordinary Workflow revision advancing once. Actual shared Goal B1 and binding are guarded reads and do not mutate again.

The whole native materialization participants include executor_worknode, executor_worknode_control, executor_run_execution_control, executor_native_operation_result, executor_run_operation_result and executor_original_publication_origin under their exact original schemas and owner transaction. Per-member and global result/control origins are whole genuine co-issued values. The complete outer T2 union also includes A4 born sources, materialization receipts, installed graph, RequiredSet, Workflow body/control and activation transition with every original origin. No missing global run result/control or unrelated preserved member can be hidden by validating only a WorkNode candidate. Native result identities and all whole payload hashes are independently derived from actual original sources before helpers.

Original output/receipt candidates are not pre-issued admission proofs. If a required nested authority/source/hash dependency points back to a future BindingOrigin, after-binding-control, W1 origin or returned result, the route refuses; no required field is omitted to make the dependency graph acyclic. The full GRS-077 dependency map is enforced at the actual native boundary, including fixed actual owner time attribution. T2 completion returns genuine original result/readback and releases no event, Attempt, tool dispatch or Usage charge.

The retained CurrentWorkflowLaunchChainRead supports only GRS-077’s original pre-start materialization/staging/preparation successor path. Stage/prepare use the current Workflow body/control and their authentic compact transition sources, not an archived W0 body. Later native execution/state changes remain separately admitted. A retry after genuine T2 returns the original actual receipt/result and verifies current relevant source truth; it does not create a second birth or materialization.

#### Complete later native dependencies remain separately admitted

| Existing complete native method | Current activation selection |
|---|---|
| `owner.executor.activation.materialize.v1` | Original T2 materialization only, under the whole current source and current-Goal arguments. |
| `owner.executor.native.begin_attempt.v1` | Complete dependency contract only; no dispatch or later-state admission through this unit. |
| `owner.executor.native.submit_verification.v1` | Complete dependency contract only; no dispatch or later-state admission through this unit. |
| `owner.executor.native.record_verified.v1` | Complete dependency contract only; no dispatch or later-state admission through this unit. |
| `owner.executor.native.record_failed.v1` | Complete dependency contract only; no dispatch or later-state admission through this unit. |
| `owner.executor.native.complete_worknode.v1` | Complete dependency contract only; no dispatch or later-state admission through this unit. |
| `owner.executor.native.record_cancellation.v1` | Complete dependency contract only; no dispatch or later-state admission through this unit. |
| `owner.executor.native.record_invalidation.v1` | Complete dependency contract only; no dispatch or later-state admission through this unit. |
| `owner.executor.native.apply_graph_lock.v1` | Complete dependency contract only; no dispatch or later-state admission through this unit. |
| `owner.executor.native.capture_original_input.v1` | Complete dependency contract only; no dispatch or later-state admission through this unit. |

All ten original native method IDs retain their complete input/candidate definitions, joint family sets and existing operation semantics. Keeping later attempt, verification, completion, cancellation, invalidation, graph-lock or capture schema definitions in the current resource graph is not admission to call them through activation. Each later owner must independently establish its actual original lifecycle/source contract, native capability and complete writer/final predicates. The three existing generic native dependency families remain in their unchanged original registry posture, with no runtime promotion. Current materialization cannot use a dependency-only route as an alternate private writer.

Every independently callable original issuer, capture participant, head/artifact writer, Storage publisher, live/current/durable/retained reader, recovery reader and replay responder must enforce both native boundaries itself. Before its first returning helper it authenticates the complete actual operation, registered owner and epoch, native Storage/root/backend identity, whole original source values and beforeimages, current permissions, effective Stop/cancellation, writer/registration generations, deletion/tombstone/hold and coherent recovery state. It independently derives every complete permissible candidate and return from those sources. Caller-selected method, schema, family, codec, source mode, operation ID, owner string or serialized lease cannot establish that authority.

After all returning parsers, builders, codecs, copies, resolvers, validators, comparison helpers and currentness reads, the same original participant independently rechecks the whole authentic source/preimage set, actual native fences and entire candidate. A publisher checks its complete pending transaction union, including preserved/unrelated members; the outer joint publisher independently checks the complete joined union as well. One final pure predicate has no returning helper, asynchronous callback, logger or mutable gap before that participant’s commit or passive disclosure. A lower entry never inherits authority merely because its caller checked. Whole original readback with its own independent final predicate precedes dependent release. A later refusal preserves every genuine prior effect and never repairs a missing source by replaying its producer.

This unit establishes a canonical source contract and the required original-owner placements. Native installation and capability authentication, original source execution, all-writer exclusion, exact codec execution, redb atomicity/fsync/crash behavior, retained/current replay and coherent backup/restore remain NOT_RUN. Schema/source checks do not establish those properties. No WorkNode, NodeSeed, executable queue, runtime launch, PNC-019 enablement, readiness admission, event-depth pass, Step 9 campaign result, global D05 closure or governance seal follows from this adoption.

```yaml
plan_unit_id: EP-117
unit_type: schema_contract
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Whole original intake, provisioning and bounded native materialization. Materialization consumes
  all seven complete genuine original durable input roles with exact membership, operation/source identity and current
  native owner admission.
gui_related: false
gui_classification_reason: Defines original source, owner, storage and verification semantics without a visual surface.
split_recommended: false
depends_on:
- EP-103
- EP-116
- GRS-077
- CV-349
- SP-308
- PNC-025
unblocks: []
acceptance_criteria:
- Materialization consumes all seven complete genuine original durable input roles with exact membership, operation/source
  identity and current native owner admission.
- The complete current native candidate and A4 source graph are preserved and joined to actual current Goal control
  in separate resource realms.
- One original T2 joins every native WorkNode/control/run/result/origin and Workflow born/materialization/graph/RequiredSet/body/control/transition
  participant.
- Same-original preflight and Models sources are reused without fake Attempt/context, new producer replay or metadata
  substitution.
- Nine later native operations remain complete dependency contracts with no current activation dispatch or lifecycle
  authority.
validation_surfaces:
- Plans/workflow_activation_contracts/methods.json
- Plans/workflow_activation_contracts/schemas/current-materialization.v1.schema.json
- Plans/workflow_activation_contracts/schemas/native-worknode-current-activation.v1.schema.json
- Plans/workflow_activation_contracts/native-birth-field-map.json
- Plans/workflow_activation_contracts/activation-field-map.json
- Plans/workflow_activation_contracts/source-control-field-map.json
- Plans/Goal_Runtime_System.md#GRS-077
risk_class: workflow_activation_original_source_or_lifetime_drift
reasoning_tier: high
context_scope: ep_117_activation_original_custody
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-047
- Plans/workflow_activation_contracts/methods.json
- Plans/workflow_activation_contracts/physical-families.json
source_atom_ids: []
negative_constraints:
- No public command, event or Goal lifecycle expansion and no fabricated original source or receipt.
- No full historical mutable-body archive, new retention policy, native field redaction, numeric coercion or automatic
  deployed migration.
- No WorkNode/NodeSeed/runtime/readiness/global event-depth or governance claim from source adoption.
```

ContractRef: ContractName:Plans/workflow_activation_contracts/methods.json, ContractName:Plans/workflow_activation_contracts/schemas/current-materialization.v1.schema.json, ContractName:Plans/workflow_activation_contracts/schemas/native-worknode-current-activation.v1.schema.json, ContractName:Plans/workflow_activation_contracts/native-birth-field-map.json, ContractName:Plans/workflow_activation_contracts/activation-field-map.json, ContractName:Plans/workflow_activation_contracts/source-control-field-map.json, ContractName:Plans/Goal_Runtime_System.md#GRS-077

### EP-118 - Whole current Workflow sources, original start and bounded cancellation

#### Complete current Workflow and scheduler source

The current D01 source is the whole `Plans/executor_cancellation_contracts/schemas/workflow-original-start.v2.schema.json` resource. Its `WorkflowCurrent`, `CurrentSource`, `StopSource`, original birth/coverage/transition inputs and all 64 definitions retain the complete native and activation dependencies. Use complete A4 sources and the complete current 85-definition native resource; neither a body/control pair nor a metadata selector substitutes for the entire applicable input. Current D02/D03 scheduler values preserve their seven ordinary v2 wrappers and original v1 method identities. Their unchanged value shape does not exempt the actual writer from current source admission.

Install the exact current source and all original observer hooks before genuine Workflow birth and first coverage. `owner.executor.workflow_source.enroll_workflow_birth.v3` participates in `owner.workflow.activation.begin.v1` at actual T1; `begin_coverage.v3` participates in actual first `owner.executor.activation.materialize.v1` at T2; `update_workflow.v3` observes the original materialized, stage-entrypoint, prepare-start, prestart-abort, separately admitted original-start or D06 writer. D01 never becomes the issuer of the underlying native effect. All unlisted Workflow writers remain refused by `RequiredOtherWorkflowWriterSource=false`; this adoption supplies no completion, certification, ownership-transfer or optional/replanned materialization route.

T1 uses full `OriginalBirthArgument`, full `WorkflowBirthInput`, and the separate `BirthGoalArgument`/`BindingLowerArgument` before-and-prepared Goal union. The whole birth candidate equals authentic prepared Workflow body/control and original accepted activation/launch sources. Initial start control and its original begin origin are derived joint outputs, not future preexisting admission evidence. T2 uses full `OriginalFirstCoverageArgument` and `OriginalMaterializedWorkflowUpdateArgument`, including every actual WorkNode/control/result/origin, whole global run control/result/origins, A4 born/materialization/graph/RequiredSet/body/control/transition union and original outbox. Separate `CurrentAssociatedGoalRead` supplies actual B1 controls and association. Do not reduce a batch to one representative node or demand vanished B0/W0 beforeimages after their original publication.

The native run-control outer hash, semantic run-result hash and whole physical wrapper checks keep their original distinct domains. Derive run control, run result, then original result origin. Initial zero revision/null before-control is permissible only for genuinely absent native keys under actual original admission; a failed read, missing restored row or obsolete head is not absence. D01 lineage and scheduler/inventory membership preserve complete original identity, order where declared, owner generations, current head CAS and original provenance.

Every materialization/attempt registration, wake record/consume, delay record/release, capacity reserve/release, dispatch admission/handoff acknowledgement, Stop recording/recovery and current/Stop reader uses its complete original method input and applicable current Start and separate Goal companion from the exact method map. A precoverage read carries full `WorkflowCurrent` and authentic initialized start control/origin; it does not invent coverage, SchedulerControl or empty inventory. Postcoverage reads carry complete `CurrentSource`. Original T1/T2 arguments are confined to their actual original phase. Later stage/prepare uses full present native truth and immutable original activation/transition sources. Existing native method definitions remain dependency-only wherever their separate lifecycle owner has not admitted the effect.

The named offline source and Goal-control realms preserve their complete resource maps, retrieval bases and embedded-resource pointers. No network fallback, same-ID replacement, caller-selected realm or merged conflicting registry is admitted. Each actual original owner joins the full arguments through genuine native operation, root, scope, registration, owner epoch, current permission/Stop/association and final fences. Every independently callable participant authenticates the full source/preimage set before helpers and derives its entire permitted candidate; after all returning helpers it repeats one final pure predicate over complete sources, current native fences and the whole transaction/disclosure union, with no helper or mutable gap before effect or release. Original readback independently checks the committed union. Serialization, enum membership and matching URI/hash establish no native capability.

#### Original Workflow start and later source reads

`owner.workflow.activation.commit_start.v2` and its original Storage participant `owner.storage.workflow_start.commit_original.v2` bind coordinator profile `workflow_start_original.v2`. Both require the complete `OriginalCommitArgument` in the current Workflow/native realm and separate complete `OriginalGoalArgument` in the Goal-control realm. Preserve genuine whole current WorkNodes, scheduler/inventory/run controls, immutable graph/RequiredSet/materialization sources, activation receipt, staging, seven durable inputs and accepted nonempty exact request membership. Scheduler Stop and run cancellation must be null and the separate current Goal argument must prove no effective Stop. Existing permissions, write mode, provider/model/account, budget, parallelism and writer-capable Storage admission remain actual owner predicates.

The full start definitions resolve in `Plans/executor_cancellation_contracts/schemas/workflow-start-custody.v2.schema.json`; private activation-phase arguments use `workflow-start-arguments.v2.schema.json` and separate Goal arguments use `workflow-start-goal-argument.v2.schema.json` in the same canonical directory. The original A4 outbox remains the exact v1 prepared record with intended payload v2, null event/receipt and false dispatch release. The new disjoint StartCandidate explicitly binds that historical preparation to delivery payload v3 under `original_workflow_start_clock_split.v1`; it does not migrate the old intent or reinterpret its literal version. Original birth initializes the new per-run StartControl at epoch zero with no pending candidate, committed start or start operation, together with authentic `OwnerIssueOriginPhysical`. Missing original control/profile refuses later admission; no retroactive enrollment or zero initialization repairs it.

At original start, independently derive the full native after-images: Workflow status becomes running, body revision advances once, activation state changes start_event_pending to active and activation revision advances once; all other body fields remain exact. Control matches the new body revision/semantic hash, retains actual owner epoch and has no pending operation. Goal body/control remain unchanged. The existing five-field ActivationTransitionReceipt preserves its original meaning inside compact StartCommit, without a new write to the old activation-transition family.

The complete coordinated outcome contains one authentic EventRecord append, its synced first barrier and original full-value custody, the native body/control, StartCandidate/Commit/Control/Origin and D01 update/head/pointer/lineage-origin. All unchanged WorkNode, run and scheduler participants remain preserved and fenced. Authenticate genuine immutable-key absence, exact current control/head CAS and operation uniqueness; an absent caller acknowledgement, expired event, missing backup member or failed lookup proves none of them. Derive native physical after-images, then compact Commit, StartControl, StartOrigin, then D01 members; StartOrigin excludes the downstream D01 hashes that bind it. This is dependency order within one coherent original outcome, not authorization for separately visible commits. Each upper/lower publisher independently applies both whole-union native boundaries. Matching transaction strings, a redb commit or an append receipt alone cannot establish cross-store atomicity.

Only the actual held original invocation returns full `PublicationResult`, while its complete producer, native after-images and co-issued D01 result exist. Same-identity/same-digest dedupe permits no second append/CAS/effect. This bounded source supplies no later full commit-replay route: compact custody cannot recreate historical native bodies or original full result. Differing digest is idempotency_conflict, stale native revision is revision_conflict, and unprovable dedupe is dedupe_unavailable. Preserve original event ID, occurred time and producer fields; a new key or timestamp cannot bypass original-start uniqueness.

`owner.workflow.activation.read_started_current.v2` instead returns complete `CurrentSourceArgument` or original D01 `Unavailable`, with separate fresh `CurrentGoalArgument`. It joins compact original Commit/Origin and current StartControl to full present native/D01 truth. Historical start commitments bind their original lineage link, including after a later admitted D06 transition; they are not equated to the latest body. `recover_start.v2` only classifies authentic original outcome. Externally pending or ambiguous partial publication stays fenced; this bounded coordinator has no pending-marker completion, independent append/body repair or dispatch route. Prestart abort requires its own original proof of no append/effect and never reclassifies a committed start.

Whole original readback and final predicates precede running projection or runnable release. Executor's subsequent real admission consumes the original Workflow barrier plus fresh readiness/Stop/current source guards. This Workflow event remains distinct from Executor attempt `run.started` and does not itself create an Attempt, provider/tool invocation or Usage charge.


Candidate.actual_source_argument_sha256 and Origin.actual_source_argument_sha256 hash the complete OriginalWorkflowArgument using `pm.workflow.activation_source_json.v1`; the root excludes the enclosing OriginalCommitArgument, stored Candidate and co-issued output union. GoalContextCommitment.source_argument_sha256 and Origin.goal_source_argument_sha256 hash the complete separate OriginalGoalArgument through that same codec. Neither recipe projects away producer, current-control or initialized-control fields. The exact roots prevent a candidate/origin self-dependency.

Successful StartControl advances its own epoch exactly once, clears pending candidate, selects the genuine original immutable commit and records the original start operation. The old A4 outbox remains byte-equal after start: its prepared/null/false fields are historical preparation, not a current dispatch verdict. Current consumers use the complete new start source and actual original current authority.
#### Positive D06 bounded terminal publication

The whole `Plans/executor_cancellation_contracts/schemas/workflow-cancel-positive-safestop.v1.schema.json` resource preserves all 44 D06 definitions and changes only resource identity and the false D05 slot to full start-aware `SuccessfulReadback`. The old false profile remains historical. Install `original_bounded_safe_stop_terminal_publication.v1` at actual native original registration before complete domain birth; unchanged D06 v3 method literals bind the exact positive source/profile in that original descriptor. D05/current C do not import the future consumer. Value-grammar equality of stored D06 rows permits compatible original value reading; it does not upgrade an old false native registration.

The private argument roots resolve in `Plans/executor_cancellation_contracts/schemas/workflow-cancel-positive-arguments.v1.schema.json`; the whole D05 root is `Plans/executor_cancellation_contracts/schemas/safestop-original-start.v1.schema.json#/$defs/SuccessfulReadback` and its start companion is `Plans/executor_cancellation_contracts/schemas/safestop-start-arguments.v1.schema.json#/$defs/CurrentStartArgument`. Prepare/recovery consumes full `OriginalAdmission`; publication consumes full `OriginalPublication`; current reads consume full `CurrentRead` and return full `CurrentSuccessfulReadback`. Each non-retained entry additionally consumes separate `CurrentGoalStopArgument` and its existing complete D06 current-controls argument. Full CurrentStartArgument is mandatory. The actual owner joins full current D06 executor, both D05 current_executor participants, Start d01_current and the Goal native witness at one held native boundary, with exact same scope, graph, owner/generations, bodies/controls/lineage, inventory, SchedulerControl and run control.

Full D05 SuccessfulReadback must prove the entire original partition/capability census, immutable birth/reservation/compile chain, inventory cut, every supported original role/settlement and complete mandatory flush history. Unknown/unsupported/pre-attempt effects refuse; checkpoint success remains false. Required flush occurs even for a genuinely empty event set; every failed required flush remains sticky. D05Join identifies the native cancellation operation selected by original_scheduler_stop.native_cancel_result.operation_id. D05's own aggregate operation, D06's own operation/transaction and each effect/flush operation retain their distinct genuine identities. Authenticate their actual root Stop/SourceAudit/SchedulerStop causation; do not force unrelated operation IDs equal.

`ControlPlaneAdmission` contains authentic full DomainBirth, exact original terminal WriterRegistration and actual OriginalBoundary. That registration must be the actual matching DomainBirth/DomainCut member with native entrypoint, principal, original registration operation, positive contract/profile and epoch. Genuine current native authority traces to the original root Goal cancellation command; serialized handles or URI/role matches cannot grant it. All selected-run work/effect/callback/normalizer/drain capabilities remain revoked, and each CoreWriterCut retains unchanged queue/generation/admission members/counts. Distinct originally registered terminal service authority permits only this disposition and its required cancelled event/first barrier. It reopens no queue, admits no unknown producer and creates no ordinary late output.

Prepare derives the complete producer EventCandidate for the nonterminal branch, then Intent, initial Control and method-specific prepare Origin at exact absent operation keys. Same-operation equal occupancy is original recovery; unequal occupancy refuses. Intent binds whole actual before/after commitments and D05/Stop/inventory selections. Control moves prepared-to-committed with one revision increment and selects the one immutable Result. Origin binds only its closed prepare or publish outputs, excluding itself and downstream D01; Control names the origin operation rather than a circular origin hash. At publication derive native values, Result/committed Control, publish Origin and then D01 lineage under the authentic common exclusion/CAS and joint outcome. Terminal preservation has no EventCandidate.

For a nonterminal Workflow, status becomes cancelled and body revision advances once; Control matches while every other field, including activation state/revision, remains unchanged. Goal body/control are preserved. Publish whole original native after-images, compact D06 intent/control/result/origin, original typed goal_run.cancelled/v3 EventRecord/own first barrier and D01 update/head/pointer/origin in the authentic coordinated outcome. `D01CoissuedPublication` binds full held publication and original transition with genuine current before-values and derived co-issued after-values; no future receipt, D01 lineage or returned result is an admission prerequisite. Every original upper/lower boundary applies complete independent pre-helper/final predicates and original acyclic hash ordering. D-R17 effect branches, mutation_started, user_cancelled reason and actual settlement/rollback references come from their genuine original owners; empty dispatch or a rollback selector does not prove them. Keep Stop latched, active_run_ref/association, Goal objective/history/lifecycle and all WorkNode/Attempt/prior-result truth. No fifth Goal state, implicit resume, native cancellation repeat, Plan schedule/quota effect or replan bump is added. Already terminal status is preserved byte-for-byte with no new cancelled event, but still requires full D05 success to claim settlement.

D06 recovery resolves the original candidate/Intent/Control, genuine coordinator and actual append outcome. A proved never-published outcome may re-admit the same immutable operation/candidate with fresh complete current sources; committed outcomes use original custody. Unknown outcomes remain prepared/recovery_required, preserving all prior effects and never regenerating timestamps, candidate, receipt or conflicting intent.

Later current readback obtains fresh complete D05/Start/Goal/current controls after any native advancement; immutable aggregate/settlement/flush and start commitments retain their original historical links. It cannot reuse an old SuccessfulReadback body as current. `read_retained_disposition.v3` remains Request-to-RetainedResult metadata audit without fresh D05/Start/Goal/native prerequisites or action authority. Missing historical full values are not rebuilt from compact custody. D06's separate event has its own original barrier and never alters or substitutes for D05's sealed final flush.


For this exact cancelled-v3 source, the idempotency key is `pm.goal-runtime-event.v3:` followed by lowercase SHA-256 of RFC8785 JCS of `["pm.goal-runtime-event-idempotency.v3", scope_partition, "goal_run.cancelled", project_id, goal_id, goal_revision, expected_goal_run_revision, goal_run_revision, goal_run_id, "user_cancelled", mutation_started]`. Storage owns the exact reversible scope partition. Inner and outer keys must byte-equal; the unchanged original Goal context and advancing Workflow revision remain distinct clocks. Existing v2 identity and readers retain their original interpretation.

Before success, compare every stored producer-owned field against the genuine complete EventCandidate, not only producer_semantic_digest. Same original identity/digest uses the actual first original event, receipt and transition with no second append, revision increment or newly generated timestamp. Storage idempotency_conflict maps to D06 immutable_conflict; tail catch-up and dedupe_unavailable remain under original Storage authority. A different key never bypasses original native, Goal, Stop or CAS fences.

#### Event and native qualification boundary

The existing `goal_run.started` and `goal_run.cancelled` family rows remain complete active v2 registrations. The exact new v3 payload resources are source dependencies only. Actual v3 publication remains unavailable until the original event owner separately adopts the full v3 reader/consumer, durable projector and required checkpoint contract, then explicitly selects that family revision/schema in the registry. Source adoption does not clear event depth or borrow a sibling's checkpoint/none_required disposition. The original started RP-RUNTIME-365D and cancelled RP-AUTHORITY-INDEFINITE policies remain unchanged.

Native installation/capability authentication, complete original source execution, both final fences and all-writer exclusion, exact codec execution, original atomicity/fsync/crash recovery, current/retained replay, coherent backup/restore and compatible outer Goal terminal integration remain NOT_RUN. RequiredCheckpointSuccess is false in the bounded aggregate. No WorkNode, NodeSeed, executable queue, runtime/readiness admission, global safe-stop closure, Step 9 result or governance seal follows from these source contracts.

```yaml
plan_unit_id: EP-118
unit_type: schema_contract
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Whole current Workflow sources, original start and bounded cancellation. Original T1/T2 and later
  current source phases use complete separate current native and Goal arguments, with authentic original absence
  and source lineage.
gui_related: false
gui_classification_reason: Defines original runtime source, owner, storage and verification semantics without a
  visual surface.
split_recommended: false
depends_on:
- EP-117
- CV-349
- GRS-077
- SP-308
unblocks: []
acceptance_criteria:
- Original T1/T2 and later current source phases use complete separate current native and Goal arguments, with authentic
  original absence and source lineage.
- Original start and D06 publication preserve exact source clocks, full typed producer/custody, compact durable
  state and independently fenced atomic participant unions.
- Retained metadata audit never recreates expired original body, source, event or native authority.
- Unbound Workflow writers, active v3 event consumers and outer Goal terminal integration remain explicitly unavailable
  until separately admitted.
validation_surfaces:
- Plans/executor_cancellation_contracts/methods.json
- Plans/executor_cancellation_contracts/realm-entry-boundaries.json
- Plans/executor_cancellation_contracts/physical-families.json
- Plans/executor_cancellation_schema_resources.json
- Plans/storage_value_registry.json
risk_class: original_workflow_source_custody_or_native_admission_drift
reasoning_tier: high
context_scope: ep_118_original_source_contract
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/executor_cancellation_contracts/methods.json
- Plans/executor_cancellation_contracts/realm-entry-boundaries.json
- Plans/executor_cancellation_contracts/physical-families.json
- Plans/executor_cancellation_schema_resources.json
source_atom_ids: []
negative_constraints:
- No public command, event-membership, Goal lifecycle or retention-policy expansion.
- No fabricated source, absence, origin, receipt, current body, native authority or retrospective original enrollment.
- No numeric coercion, lossy codec, hidden effect/census member or required-flush failure removal.
- No WorkNode/NodeSeed/runtime/readiness/event-depth/global safe-stop or governance claim from source adoption.
```

ContractRef: ContractName:Plans/executor_cancellation_contracts/methods.json, ContractName:Plans/executor_cancellation_contracts/realm-entry-boundaries.json, ContractName:Plans/executor_cancellation_contracts/physical-families.json, ContractName:Plans/executor_cancellation_schema_resources.json

### EP-119 - Original bounded safe-stop, FileSafe and disposable Process sources

These contracts define the selected original native source obligations. The complete schema and method declarations reside under `Plans/executor_cancellation_contracts/`. Exact original-owner authority, source availability and current fences remain required in addition to schema validity. Native execution is not established by this adoption.

#### Complete canonical source resources

Every short definition below resolves within the corresponding entire source resource and its exact offline owner realm. A stored wrapper selecting a historical dependency never selects a new private native operation.

| Complete source | Canonical file |
|---|---|
| Current D05 aggregate | `Plans/executor_cancellation_contracts/schemas/safestop-original-start.v1.schema.json` |
| Separate current Goal arguments | `Plans/executor_cancellation_contracts/schemas/safestop-current-goal-arguments.v1.schema.json` |
| Current and original-phase Start arguments | `Plans/executor_cancellation_contracts/schemas/safestop-start-arguments.v1.schema.json` |
| Original injective FileSafe source | `Plans/executor_cancellation_contracts/schemas/filesafe-injective-key-sources.v1.schema.json` |
| Original disposable Process source | `Plans/executor_cancellation_contracts/schemas/process-shutdown-sources.v1.schema.json` |
| Transient Process normalized producer | `Plans/executor_cancellation_contracts/schemas/process-normalized-producer.v1.schema.json` |

#### Complete bounded D05 admission

Existing Goal Stop, Executor cancellation, Workflow status, WorkNode lifecycle, Run Modes outcomes, FileSafe reconciliation, Storage durability and permissions retain their owners. Every positive value is issued by its genuine native owner during the actual original operation and privately read back; schema membership or a matching digest is not original authority.

#### Exact supported profile

The profile starts enrollment at original native launch identity reservation and concludes only for a genuinely Goal-bound C run with authentic Workflow birth/current lineage and actual Executor materialization. At that run's genuine Stop cut, its complete all-generation invocation census is either truly zero, or consists entirely of exact FileSafe v2 `restore_safe_point_then_retry` admissions and/or Process v1 originally disposable, unshared, PM-managed local Unix stdio MCP diagnostic admissions. A retry named in a FileSafe action does not authorize a retry after Stop. Process v1 covers each actual nested process only with its own original pre-effect C admission. Group membership cannot hide a tool/provider invocation inside a process row.

Every invocation in every historical materialization, attempt, retry, remediation, resume and replan generation remains counted, including acknowledged, unacknowledged, failed, terminal and outcome-unknown invocations. Unknown acceptance is unresolved even if no process is now visible. C's full materialized WorkNode/current-control, original materialization source/result/origin, attempt/current-control/birth and dispatch admission/origin/ack values are mandatory. WorkGraph membership, RequiredSet, current generation, UI queue emptiness or maximum matching receipt cannot replace that census. No cancelled WorkNode status or other lifecycle rewrite is introduced.

The only supported effect assessments are the complete original FileSafe resolved disposition and complete original Process quiescent disposition with all of their source readbacks and current owner boundaries. FileSafe does not prove current filesystem equality. Process termination/EOF does not prove provider, network, SCM, worktree, verification or tool side effects resolved. Those actual obligations remain separate, even if the outer dispatch's role is `process`. Normal pooled MCP remains pooled; cancellation never relabels it diagnostic. Any actual unsupported role, callback, descriptor escape, beneficiary, external effect, provisioning mutation or required checkpoint remains an explicit unresolved member and prevents success. Source-unavailable enumeration returns `enumeration_status=native_census_unavailable`; its known list is expressly incomplete, never certified empty.

This profile supports genuine zero required-checkpoint obligations established by original enrollment and current native obligation custody. It supplies no generic checkpoint-success adapter: `RequiredCheckpointSuccess` is false. A required checkpoint encountered in any original operation stays visible with its actual identity and `required_original_checkpoint_source_unavailable`. EP-115 requires checkpoints at actual context transitions; it does not mandate a fresh cancel snapshot. Existing FileSafe safe-point references alone are not evidence that a distinct required checkpoint completed. No checkpoint requirement is deleted, waived or replaced with an empty array to enter this profile. A future exact checkpoint owner source needs its own explicit successor binding.

#### Corrected C source and exact owner joins

Read the complete current GoalControlWitness, original StopIntent and StopReceipt, plus the separate mandatory CurrentGoalStopArgument carrying the whole current SourceAudit, from the original Goal cancellation owner. Verify original receipt/control epoch, Stop-intent/source-audit commitments and authentic original host transaction, plus the exact current Goal-bound Workflow/run binding. An already-latched Stop receipt and current StopControl, the original native `RunOperationResult(operation=cancel)` and PublicationOrigin, and the immutable SchedulerStop/inventory cut are distinct real originals. Their root cancellation operation IDs, complete scope, generations, before/after revisions, owners and native transaction sources must join exactly. The per-owner shutdown/restore/flush operation IDs remain distinct and are linked by real original admission, never overwritten with the root ID. Do not require the eventual Goal cancellation terminal or D06 result here; those depend on this aggregate and would create a cycle.

Stop must already fence the original run. C's actual native coordinator orders dispatch handoff versus Stop. A capability accepted before Stop remains in the census; Stop-before-transfer prevents the effect. Every unacknowledged member needs original role-owner acceptance/disposition or stays unresolved. This aggregate cannot prove no handoff from absent ack, create an owner binding retrospectively, rerun an operation, or transfer an unknown effect to a cancellation custodian. Stop and replan generation cannot be cleared or advanced to hide work.

#### Original complete native enrollment

The enrollment boundary is the genuine native allocator's first allocation/admission of the complete LaunchIdentityReservation, before the first operation or capability release owned by that reserved RunScope. It is not Workflow activation.begin. The known original reservation has all nine exact fields: project_id, goal_id, goal_run_id, plan_compile_run_id, activation_id, idempotency_key, original_goal_body, execution_owner_ref and execution_owner_epoch. The complete SourceSelector and exact nonnegative owner epoch retain their original native grammar. IDs are reserved, not an issued GoalRun, Workflow, WorkNode, attempt, dispatch, launch receipt or proof of admission. No source is retroactively manufactured for an already active reserved run.

`owner.workflow.launch.reserve_execution_identity.v1` is a precise integration inside the authentic existing native allocation operation, not a public allocator service or a route to create a Goal from Plan Build. Its private admission resolves the entire original native parent compile/controller state and pending allocation operation, actual original project and Goal binding, current complete original Goal body B0, BodyControlV2, StopControl and permission, actual native allocator/root/boot identity, and native ID namespace under its genuine exclusion. These are whole native owner objects through registered owner resolvers, not caller-selected JSON projections or reference-string attestations. Their actual native source contracts and original host handles must exist. The `NativeAllocationIdentity` is allocated by that owner from its real project/Goal/compile/idempotency/pending-operation identity before the reserved IDs are issued. Missing actual Goal B0 makes this Goal-bound profile unavailable; Plan Build does not create one. No current GoalRun or Workflow body is required at this boundary, and no future published NativeCompileSource is an input.

The allocator reads actual native namespace absence or the same pending original operation while holding the namespace, parent-controller, Goal/Stop/permission and domain-installation fences. Absence is a real native no-row result, never a synthetic zero control. It allocates the full genuine reservation once, binds RunScope's exact storage_instance_id/project_id/goal_id/goal_run_id, serializes ReservationAllocation then DomainBirth referencing that already-serialized allocation, then its Origin and AggregateHead in one recoverable original durable unit. Origin hashes both already-issued physical wrappers; neither hashes a future origin, native compile source or Workflow. Only after that original unit is durable may the owner release the first reserved-run capability. An existing identical original allocation with its authentic original custody is recovered/read unchanged. An existing reservation whose earlier work lacks enrollment is unavailable; a later same-ID wrapper cannot cure it. Failed/pending allocation never mints replacement IDs, releases work, or acquires a fabricated successful origin. Across stores an actual native coordinator and its recoverable pending transaction are mandatory.

True pre-Goal parent compiler operations remain in their actual native owner scope only when the real native ownership/operation record establishes that boundary. A caller label, absent Workflow ID, future timestamp or missing dispatch does not place an already reserved-run operation outside RunScope. If assignment occurs earlier than the owner can authentically enroll, this profile cannot qualify. Native original operation history must establish that allocation is the first reserved-run assignment and that every later scoped producer, obligation and effect passes the gates; a timestamp or native_original_enrollment_ref string is not proof.

Native compiler, graph/intake/preflight, Models, provisioning, decision and Workflow participants are enrolled at allocation before their first actual scoped operation. Each selected original owner entrypoint must have a registered exact complete source contract, original full input/result custody, and a mandatory native gate that distinguishes its actual metadata/read operation from every possible external effect. Product metadata custody may use `product_metadata_custody` only when the authentic installed native owner contract, complete actual original inputs/results and exhaustive native operation/capability history establish that the operation stays within its existing metadata/read authority. A role name, `inputs=[]`, semantic capture, noEffect claim, schema-valid result or final empty dispatch list cannot establish this. This is not a generic adapter for arbitrary metadata writers. Unsupported or uninspectable entrypoints make the entire native-domain qualification unavailable. The mechanism is required original native source authority; it cannot be satisfied by a helper asserting the reference strings below.

Every actual reserved-run external-effect handoff before a legitimate original C attempt/admission is available requires an immutable PreAttemptEffectAdmission before release under the allocator/domain capability fence. It retains the complete RunScope, original allocation, authentic native owner/role/operation identity, full original input binding and contract, capability, original boundary, contiguous zero-based ordinal and previous original admission. It creates no WorkNode, attempt or dispatch. Compiler artifact writes, actual tests, SCM/worktree operations, processes, tool/provider/network calls, verification and safe-point writes all take this route when scoped to the reservation. Actual accepted, rejected, never-released, pending, failed, terminal and outcome-unknown members remain in the complete append-only history. No later attempt replaces or hides them. PreAttemptEffectCurrent privately reads the entire authentic native original input/result/acceptance/current custody through that registered source, as well as its full admission and origin. The compact resolver ref is not an outcome proof. This narrow profile supplies no positive pre-attempt effect disposition adapter: every present admission is unsupported, even if an original owner later reports completion. An unadmitted effect makes census qualification unavailable rather than zero.

AggregateHead and every DomainCut retain the entire ordered pre_attempt_effect_admissions list. AggregateInput and CurrentBoundary read the corresponding complete PreAttemptEffectCurrent list, exactly equal to the original chain, every relevant original Origin issue and exhaustive native operation/handoff history. A genuinely zero list can qualify only after authentic native allocation enrollment, complete existing owner operation/input/result custody, full capability inheritance and current closed gates prove no such handoff occurred or can occur. This does not infer emptiness from any A3/A4 semantic or captured input schema. Product metadata writes remain admitted through their actual native custody and event/obligation gates; any operation outside that proven scope must take the effect route or remain unavailable. Original permissions and product sandbox policy remain unchanged.

##### Later immutable joins, with no future-record prerequisite

During the real `owner.workflow.compile.issue_native.v1`, read the entire original NativeCompileSource candidate and native compiler inputs, original allocation and current native allocator head, Goal/Stop/permission and source controls at that owner's final fence. Compare every byte-domain value in `launch_identity_reservation` to the original complete allocation reservation, plus full project/compile/run/owner/idempotency identities. After authentic issuance of NativeCompileSource and its OwnerIssueOrigin, issue CompileReservationJoin and its aggregate Origin/head update within the same recoverable native publication boundary. The join selects those already-issued originals; it does not cause their creation or relabel a compile operation. All native original source publication-time whole-input requirements remain mandatory. ReservationLineage later reads the entire immutable selected NativeCompileSource, original OwnerIssueOrigin and authentic current NativeSourceControl; an incompatible current source or broken original lineage is unavailable.

During the genuine C Workflow-birth operation, independently authenticate that original compile join/allocation and full original native birth inputs/candidate using corrected D01. Once authentic C WorkflowBirth and WorkflowMutationOrigin are issued, issue WorkflowReservationJoin selecting them and the prior compile join/allocation, then aggregate Origin/head in the same recoverable native owner boundary. Full scope, reservation, source identity, Workflow candidate and native parent causation must join exactly, without replacing IDs or substituting a string assertion. This is a companion original source issue, not a new Workflow writer or a change to the original C physical registrations. If the owner cannot execute that coordinated original publication, the join is unavailable. Neither earlier allocation nor compile join reads a future Workflow; neither C birth nor aggregate Origin hashes a future D06 result.

ReservationLineage authenticates both immutable joins and their complete original Origins, current AllocationCurrent and the complete C current Workflow birth/head/update sources already required by CorrectedCurrentSource. The nine-field historical original_goal_body selector stays unchanged. Full B0 is read at the authentic original allocation/compile/birth admission where required; subsequent current reads authenticate its original issue commitment through those immutable original operations and read the present whole Goal body/control B1 through the current Goal witness. They do not demand overwritten B0 bytes or archive a historical full body. The same rule preserves corrected D01's immutable birth commitment/current whole Workflow behavior. A source helper never reconstructs an old original body from a digest.

WriterRegistration is the entire compact native registration value, issued by the actual installation/registration owner and bound to its native entrypoint, pre-effect gate, principal, original registration operation, parent and exact source contract digest. Original registration occurs before the writer can obtain capability. A writer added later requires an authentic newly issued registration in the original domain-cut transaction before any release. Retired registrations remain in current membership. `component_kind=other` is retained and prevents admission unless a future exact source profile supplies it. Real registration, permissions, codec/storage/retention/backup and current owner lease sources are privately resolved whole. Merely carrying their reference strings cannot pass qualification.

The original native gate issues CapabilityBirth before an actual scoped capability is released. This includes delayed wakes, watchdog/retry/resume timers, capacity/admission, handoffs, Workflow/attempt mutations, FileSafe writers, process/output producers, normalizers, event append, checkpoint writers, external callbacks, subscriptions and reconnects. Parent capabilities and every inheriting holder belong to the native membership source. Dispatch-handoff/FileSafe/process capabilities must bind their exact original invocation; root scheduler/Workflow/attempt/queue capabilities must bind the authentic complete native owner domain and all affected census members. Null invocation never means an unowned effect. Each real change writes an immutable CapabilityDisposition and source origin. The current DomainCut reads all original births and latest authentic dispositions, not a caller list of known live workers. Dispositions are original owner results, not commands to revoke. At the final cut all selected-run mutation capabilities must be authentically revoked; in-flight callbacks must be completed/fenced so they cannot produce a fresh state mutation, event or effect after the cut.

The capability census distinguishes scoped ongoing-work capabilities from the native service authority to complete the already-authenticated root cancellation command. It enumerates the terminal writer registration as part of complete installation, but does not manufacture or revoke a future D06 command capability. Ordinary Workflow/attempt callbacks are scoped work capabilities and are revoked. The separate original Goal/D06 terminal owner can later consume this result only through its existing authenticated root command, exact current admission and own source protocol; it cannot dispatch work, revive a revoked capability or append arbitrary late producer output. An implementation that cannot enforce that separation remains unavailable. This is a boundary of the existing original owner authority, not permission for a generic post-cut writer.

The global Storage service keeps its own actual append/maintenance/metadata-commit authority for other scopes. This aggregate revokes only the selected-run producing/admission capabilities and drains already-admitted data using the actual owner's restricted internal drain authority. Publishing this compact settlement uses a preexisting original coordinator custody transaction; it does not reopen a run capability. D06 later uses its distinct original terminal-publication boundary. No global writer, DB lock, application process or unrelated user's session is revoked by this profile.

ObligationBirth is issued by the actual responsible owner when an existing requirement becomes due, before an effect/transition can outrun it. The complete obligation registry covers context checkpoints, required flushes and effect settlements, not a filtered list of successfully completed obligations. DomainBirth establishes the complete actual native initial registry at reservation allocation. Any obligation already arising with allocation is enrolled atomically; an empty list is allowed only when the original native owner establishes genuinely no due obligation. No already-existing requirement is reset. Every new requirement is appended at a monotonically allocated sequence and remains visible. The required final normalized-event/seglog flush is enrolled in the original Stop/aggregate admission; it occurs even when dispatch and event counts are truly zero. Process before-force and final flush obligations join the process owner's real stage records. All remaining obligations stay typed unresolved. A schema enum does not create a product obligation or make an existing one optional.

This bounded positive profile does not admit top-level external_callback, subscription, reconnect or other capability kinds even when a disposition says revoked. Their actual owners must supply a future exact original profile; any such member stays unsupported. Internal process writer/callback capability custody remains fully required within Process v1 and cannot hide external operations. Original enrollment qualification must establish that no mutation-capable escape path can bypass these original gates and that the registry is exhaustive for the selected run's capability domain. The actual owner source/installation must exist; this contract supplies its required original carrier and protocol, not native runtime proof. If the mechanism cannot authenticate complete membership, fence inheritance or enumerate a callback/effect source, return native_domain_unavailable. Observing no current PID, no queue item or no known capability is insufficient. FileSafe/process original native qualification remains independently required.

#### Complete partition and obligations

At `observe_stopped_domain`, take the actual current C Stop and immutable inventory cut while holding its original dispatch fence and all participating owner fences. Capture the native DomainCut and full sources. `partition.filesafe` covers exactly one complete invocation per FileSafe assessment. `partition.process_groups` covers a nonempty explicit set per genuine probe; the set must equal the complete original ProcessBirth/member_dispatch_sources set of that probe, including root and descendants. Every member has its own complete C invocation/admission/origin and authentic original process owner admission. Group sets and FileSafe sets are pairwise disjoint and their union must equal the entire C inventory dispatch identity set, byte-for-byte on the complete invocation. A shared probe source may not cover another run, generation, owner or outside beneficiary.

Any member that cannot pass its complete selected assessment appears exactly once in unsupported or unknown_or_pending rather than being dropped. These diagnostic partitions can be partial only when enumeration itself is unavailable, in which case no positive result is possible. Native capabilities/obligations outside dispatch membership are likewise retained and prevent success. Do not infer complete external-effect coverage merely because every role tag is filesafe or process; the actual native effect/callback domain must connect every scoped effect to its exact admitted owner. Any opaque/untracked effect makes that qualification unavailable.

Read each FileSafe assessment's whole current original journal, binding, original safe point and permission, authentic first terminal resolution origin, allowed later link-writer chain, current head and all actual writer capabilities as required by FileSafe v2. Original committed clean/skipped or authentically rolled-back failure can resolve that invocation; a recovery fence, failed unknown restore or pending reconciliation cannot. Journal terminal-core custody is historical issue commitment semantics, not a promise to fetch overwritten same-key journal bytes.

Read each Process assessment's entire ProbeBirth, each process birth, admission/origin, actual containment/member/current MCP lifecycle, original shutdown, native waits/signals, both stream finalizers, required-flush records and whole original current event readbacks. All original members must be terminal-waited; producer descriptors and callbacks revoked; both parsers finalized; all required original flushes durable. The process group's actual original three-second grace and sticky flush-failure rules remain unchanged. Outer process success cannot discharge an uncovered provider/tool/network/worktree operation.

All actual required obligations are matched once to their genuine source: effect_settlement to the exact covered owner assessment, process_preforce_flush/process_final_flush to that exact process record and stage, and final_normalized_event_flush to the distinct aggregate final flush. Cardinality and trigger/source/owner joins are checked against the full original obligation registry. No unknown or checkpoint obligation is allowed in SupportedInput. There must be exactly one original aggregate final-flush obligation for this aggregate operation. A process final flush can precede later core events and does not replace the aggregate final flush.

#### Original core event admission and mandatory final flush

CoreEventAdmission is compact original producer/normalizer custody, issued before the actual event is released into the selected-run queue. It is not a fake event, raw payload archive or process byte normalizer replacement. It binds actual original event ID/type/schema/semantic identity, original event source, queue generation and exact zero-based ordinal. Every selected-run normalized/event producer, including activation/Executor/FileSafe observations, must be enrolled from original domain birth. Process stream event admissions retain the complete Process v1 source chain; any queue items transferred to the core route must preserve their real original admission identity and be counted exactly once, not generate new events or receipts. Unsupported queue routes stay unavailable.

Before the final aggregate cut, first block new work/effect admissions through original Stop, finish the supported per-owner reconciliation, finalize producers and drain all already-admitted data. The actual queue/normalizer owner captures each CoreWriterCut under its native queue fence with the complete original admission chain, current membership and exact admitted/drained/remaining/in-flight counts. Start is ordinal zero; no gaps, duplicates, omitted payload types or matching-run maximum. Original truly zero admissions requires the genuine original birth/gate plus sealed current native empty queue. A no-dispatch run may still have many actual Workflow/Executor events and must flush all of them. If an original buffered event or partial normalization was lost before authentic durable admission/result, it is loss/unknown and cannot become zero.

All selected-run producers must be sealed, normalizers finished and queues drained. The original Storage owner executes its real required final durability boundary: writes complete actual source frames, synchronizes required selected segments, promotes the actual manifest watermark, performs required parent-directory sync and durably commits the original first-receipt custody. Complete global CURRENT/manifest and actual source read tokens remain required, including commits containing other scopes. No sequence-zero cursor, fake flush marker or synthetic append receipt is minted. A truly empty event set still performs the original required Storage boundary against authentic current controls; absence is not skip permission.

FinalFlushRecord persists only compact commitments, original boundary identity and truthful outcome. FinalFlushReadback privately resolves complete original EventRecord values, original whole first-append custody/full_value_result, current source frame/read token and whole current Storage controls from their existing owners. Full payload schema validation follows the original event registry. A receipt-shaped object or metadata commitment cannot replace an extant current full original event value on this first aggregate admission. Historical receipt manifest generation need not equal current selected manifest generation; authenticated current translation/compaction rules remain original Storage-owned. Retention, permissions, deletion, holds, recovery/backup and full current source availability are required. No additional event/body/log archive is installed by these records.

Flush operations bind the exact complete writer cut and every admitted item once. Successful record/event commitment/custody fields must match current full readbacks and the originally executed native Storage result; no helper selected fields substitute for the whole original. The actual AggregateHead retains an append-only selection for every originally attempted aggregate required flush. Required_final_flush_history reads the complete immutable record and origin for each selection; the list must also equal every required-flush issue in the complete original origin chain and authentic native Storage operation history. An unresolved original flush operation cannot disappear merely because it never durably issued a success or failure record. The selected final readback is the actual terminal member; older failures are not filtered. Any required flush failure, including a process pre-force flush that later retries successfully, is sticky `done.crashed`. Record authentic structured diagnostic persistence as durable/pending/unavailable. If the diagnostic itself cannot persist, do not claim it emitted. Unknown durability remains unresolved. User/parent cancellation whose complete required flushes are durable retains `done.cancelled` even when the genuine process teardown required force.

After successful final flush, revoke all remaining selected-run drain-producing capabilities and capture the final DomainCut under the same authentic coordinator exclusion. There can be no queued callback, held writer, late FileSafe observation or normalization after that final cut capable of admitting a further event; if one exists, drain/fence it in the real owner before a new original final-flush operation and do not reuse a stale successful cut. A preceding authenticated required-flush failure remains sticky. The aggregate result itself is compact non-event custody; subsequent D06 event/status publication is its own required original durability boundary.

#### Original result, physical storage and current read

Only the genuine original Executor aggregate owner may issue AggregateResult. The public Request contains only scope, operation ID and expected actual Executor owner. Callers cannot select census, obligations, outcomes, empty membership, writer cuts or settlements. A pure helper may prepare bytes but never confer source authority. The original owner reads the complete SupportedInput and performs the complete semantic/physical comparisons at its final held native boundary before committing the original result, origin and head CAS. All originals, selectors, current revisions, native owners/epochs, Stop, permissions and source custody are compared again after every helper/copy/decode/hash operation. No mutable gap or helper follows that final comparison.

A positive result requires authentic original reservation enrollment, both complete immutable reservation joins, a genuinely zero native pre-attempt external-effect census, and both a supported exact invocation partition and a quiescent complete native capability/obligation domain, mandatory durable final flush and no sticky failure/recovery condition. Its settlements contain compact original role-result and authenticating-origin selections per complete invocation. For FileSafe, original_result selects the immutable first original terminal resolution origin itself, whose issued journal commitment and terminal core bind the original result; it never promises an old full journal body at the mutable journal key. original_origin selects that same genuine immutable resolution origin, not an invented second envelope. Current full journal and permitted link changes are verified using FileSafe v2. For Process, original_result selects its immutable ProcessShutdownResult and original_origin its genuine original write origin. These are explicit different original custody forms; no generic selector-shaped adaptation makes a mutable journal immutable. Genuinely zero invocations yields genuinely zero settlements only after all those other full original prerequisites pass. The result supplies the selected whole-run D05 source profile; it grants no effect, retry, restore, cleanup, Workflow terminal status or Goal terminal authority. The separate positive D06 source binds exact root scope/operation/Goal Stop/SchedulerStop/inventory and consumes this complete original result/current readback. It preserves the historical false profiles; its actual v3 event publication remains unavailable until its separate event-consumer/registry route is adopted.

SuccessfulReadback.source_readback is a private fresh read of complete current originals plus immutable original operation custody, not a persisted copy of the first admission inputs. In particular it reads the present whole Workflow body/control through corrected D01, and authenticates actual allowed original transitions. It does not require overwritten initial Workflow values, old mutable permissions, or a historical same-key journal. Full original event values remain current reads from their existing retained source as specified above.

`read_original_safe_stop` reads the exact original immutable result and origin at the original operation key plus current full boundary and re-evaluates all required original role/current sources and immutable inventory equality at one coherent held cut. Later authenticated metadata-only links or Workflow changes must use their exact allowed original lineage; they cannot reopen work capability. An old positive record alone is not a perpetual current permission or source-availability token. Required native registration/source/permission/retention/hold/backup/deletion refs in CurrentBoundary are private whole-source resolver inputs, never trust booleans. If the current native boundary or full source is unavailable, return that rather than pretending a stale result is current. The final current read authenticates the actual head and original result/origin; replay issues no new time, origin, queue admission, stop, dispatch or event.

#### Failure and recovery

Unknown, unsupported and pending effects stay with their actual owners. An original AggregateResult may record unresolved or required-flush-failed disposition when that truthful record can be committed; no positive result is returned. If source/diagnostic persistence also fails, the native pending operation remains fenced and read returns unavailable with actual prior effect posture. The aggregate never declares noEffect, rolls an operation forward because a caller retries, releases an unknown worktree or converts a failed reconciliation into cancellation success.

Same-operation recovery consults the authentic original coordinator transaction. If its immutable result/origin/head already committed, read them unchanged under current original custody. If the transaction is pending, recover the genuine commit through its actual owner protocol or remain pending; no synthetic original transaction/result is issued. A crash with unfinished runtime lacking canonical terminal done follows Run Modes: `done.crashed` with `stop_reason=crash_recovered`. Reclaiming a process, finding no PID, restoring a DB or later flushing surviving events cannot manufacture an earlier clean cancellation. Even an authenticated aggregate record does not override a subsequent authentic unfinished-no-terminal crash disposition. SuccessfulReadback allows a recovery record only for `read_authenticated_original_result` with preserve_original outcome/stop_reason and currently valid source/capability custody.

Native capability/root identity includes its authentic owner epoch, original root generation, host boot and retained original object/handle. Current similarly named processes/paths cannot reattach identity. A genuine recovered source may restore compact rows through mandatory verified backup, but current native boundary must still be authenticated. Final application DB closure/lock release belongs to the application shutdown owner; this scoped aggregate does not shut down the global service.

#### Current complete source realms and original phase admission

The aggregate uses all 67 definitions of `Plans/executor_cancellation_contracts/schemas/safestop-original-start.v1.schema.json`, with complete current D01 CurrentSource/StopSource, complete 85-definition native source and complete 82-definition A4 source. No old A3 compile/materialization becomes current by changing a URI, selector or installed-contract label. All sixteen D05 stored v2 grammars, keys, codecs and original methods remain exact. Existing C2/C3 and role/native/Goal/Storage physical values retain their own whole original registrations; distinct current source resources do not alias historical IDs. V1 D05 rows cannot be rewritten, cast, relabeled or rehashed into v2, and an earlier v1 DomainBirth cannot satisfy original allocation enrollment.

#### Separate exact argument realms

`current_d05_source` validates the whole current aggregate source and every referenced value it consumes. `current_goal_control` validates the separate complete original Goal arguments. `retained_original_d05` retains the entire original D05/FileSafe2/Process/C/native graph. `filesafe_injective_owner` selects the entire distinct FileSafe k1 source with that original dependency graph for authentic new-profile FileSafe owner operations. Process retains its exact original owner realm. Old FileSafe2 remains historical source lineage and cannot authorize a k1 operation. The complete canonical realm-entry map enumerates all 67 current aggregate definition roots, the whole selected current C source, all nine comparison-only role value roots, and the complete separate FileSafe/Process operation realms. Those root/type boundaries are mandatory native route checks; unused historical definitions in a copied C2/native document are not callable current routes. There is no generic schema dispatcher or caller-selected realm. There is no network fallback, cross-realm fallback or merged same-ID registry. Original `$id`, retrieval base and embedded-resource scope remain intact in the canonical whole-resource maps. Complete current source and original role-owner resources retain their exact independently bound values.

Two same-ID conflicts remain deliberate: historical versus current handoff, and historical versus current Goal cancellation custody. The three excluded historical handoff aliases stay in the retained realm. All nine FileSafe/Process definition roots actually consumed by this aggregate compare recursively equal both to their original logical value grammars and to their actual selected complete role-owner source routes. For FileSafe the selected owner route is the distinct k1 source; for Process it remains the original source. This licenses only those exact value comparisons. The independent original FileSafe/Process operation still validates its full original source/candidate/read contract in its selected original-owner realm, with original native authority and, for FileSafe, authentic original k1 installation. Unused historical definitions in a copied schema are not silently adopted as current owner operations. Each current source route admits all 67 D05 definitions and their full reachable values, the entire selected current C graph at its original bases, and its separate complete Goal or role-owner contract as applicable.

The new private current-Goal argument resource contains four complete contracts:

- `OriginalLaunchGoalRead` references the whole canonical association ActualGoalBefore: actual full B0 body/control, accepted objective/origin, host Stop, binding revision/origin/control and writer domain/head. It is used at genuine initial launch identity allocation and original native compile issuance. Its name does not authorize a beforeimage phase or manufactured absence.
- `OriginalWorkflowBirthGoalArgument` references the whole canonical BindingLowerArgument at the actual original T1 joint Workflow birth/Goal metadata/association publication.
- `CurrentAssociatedGoalArgument` references the whole canonical CurrentAssociatedGoalRead at the actual permitted post-association pre-Stop source boundary. Its original B1 and compact original association custody rules remain unchanged; it cannot be used to widen a later Workflow writer.
- `CurrentGoalStopArgument` contains the entire unchanged D06 current-controls argument, complete current StorageStopControl and StorageWriterDomainHead, original complete StopIntent, and complete StorageStopReceipt and StorageSourceAudit outer values from the actual current Goal cancellation owner. The D06 argument is a source/control read type; it does not require a D06 disposition, future Workflow event or Goal terminal.

Every generic phase-routed method has an explicit `actual_original_t1` route to the entire OriginalWorkflowBirthGoalArgument. This is available only if its complete original owner contract independently permits that method inside the actual original T1; otherwise the method is unavailable in T1. The route grants no new writer or phase authority. The original owner determines the real lifecycle and admits the correct entire argument. No serialized discriminator, enum, object shape, method name or caller can select a phase. Missing whole source, source authority, lifecycle hook or final native fence makes the route unavailable.

#### Original launch allocation and later immutable joins

The first-enrollment rule remains before the first reserved RunScope capability release at the actual native identity allocation. Independently authenticate the full real native parent operation/input/result contract, native namespace/root/host owner and boot identity, actual pending allocation or authenticated absence, complete OriginalLaunchGoalRead and actual permissions. The new nine-field reservation, ReservationAllocation, DomainBirth, Origin and head are prepared and published under that real original recoverable boundary before release. No future NativeCompileSource, Workflow, materialization or StopReceipt is required there.

The D05 identity allocation is not silently identified with GRS-077's later binding-control T0 reservation. T0 is the original existing binding owner operation needed before T1 and has its own complete before/candidate/CAS contract. Neither its future prepared values nor a future BindingOrigin authorize initial D05 allocation. If an implementation uses one genuine combined boundary, all actual original participants and ordering must independently satisfy both entire contracts; equality of names or IDs does not establish that. Earlier native pre-Goal work remains in its authentic native parent scope. Missing Workflow or binding cannot relabel an already reserved run as pre-Goal.

At the actual original `owner.workflow.compile.issue_native.v1` publication, read the entire A4 NativeCompileSource, complete original compile input and real durable/source/origin custody, actual NativeSourceControl and original OwnerIssueOrigin. Match all nine reservation fields to the authentic allocation and original B0 selector. The complete original Goal read is B0 at this actual boundary, with current original control/Stop/permission; it is not reconstructed later. The immutable CompileReservationJoin, its original Origin and head join that exact original publication. This helper never issues the native compile source itself. The compile-join observer receives NativeCompileSource and OwnerIssueOrigin only after their genuine original issuance within the same still-held original joint transaction. They are not future output prerequisites of the lower native compile issuer. The original issuer first authenticates its complete actual original inputs and derives its own whole source/origin candidates; the observer then authenticates the genuine co-issued values and its own complete join candidate before the final original joint commit/readback. No post-commit enrollment or invented already-persisted source is admitted. All seven current input-role contracts remain complete at the lifecycle point where each is actually required; a future RequiredSet or materialization is not introduced as a compile prerequisite.

At actual T1, current C's entire OriginalBirthArgument and the separate entire OriginalWorkflowBirthGoalArgument apply. Original Workflow body/control/decision/origins equal the actual complete association/activation participants. The WorkflowReservationJoin selects the exact genuine D01 birth and WorkflowMutationOrigin and original allocation/compile join under the same original recoverable publication. Full pending candidates are not falsely required to be previously persisted rows. C enrollment is an observer of original birth, not a second issuer. Canonical T0 genuine binding pending, complete B0 preimage/B1 metadata afterimage, original common transaction union and whole owner CAS/final checks remain mandatory.

At T2, current C's entire first-coverage and Workflow materialization arguments, canonical current materialization source and separately current Goal guard/association argument apply. They include every native WorkNode/control/result/origin, shared run control/result/origin and all A4 born/materialization/graph/RequiredSet/body/control/transition participants. A representative node, old witness or empty invocation count cannot replace that union. The D05 map adds no authority to execute T2 or later dependency-only native operations.

Every actual reserved pre-attempt external-effect admission remains recorded before release. Accepted, rejected, pending, failed, never-released, terminal and unknown members remain in complete original order and native history. Every present admission is unsupported by this positive D05 profile. `product_metadata_custody` still requires the complete original native operation/input/result/history and capability proof. A label, empty array or current schema-valid result is not zero-effect evidence. Old domains lacking original current-source enrollment cannot be backfilled or migrated by this adoption.

#### Exact current Goal, audit and native joins

These joins apply to AggregateInput.goal_stop and CurrentBoundary.current_goal_stop at every directly callable current source reader, preparation, publication, recovery or replay boundary that uses them. The separate CurrentGoalStopArgument is mandatory at that same held original native boundary, including the final pure predicate after all returning helpers. Its members are actual complete original owner values, not copies asserted current by the caller.

1. The complete native GoalControlWitness.body and .control equal `current_controls.goal_body` and `.goal_control`. Its `.stop` equals `current_stop_control.record`; its thread/project/Goal identity and actual original body/control/Stop physical selectors resolve those same full native originals. Its `.goal_run_body` and `.goal_run_control` equal current_executor.workflow.current_body/current_control. Authenticate whole original outer wrappers and their exact native selectors independently, even where the semantic values compare equal.
2. `current_controls.binding` is the entire genuine original BindingReadCurrent; `.association` equals its actual single original Workflow association. Verify full current revision/control/origin, writer domain and current_writer_domain_head under the original binding owner, including exact domain/head membership, epochs and source commitments. The native complete Goal/run, D05 allocation, compile reservation and Workflow birth all select that same original association, execution owner/epoch and reserved run. Current body.active_run_ref and actual binding selection must agree. The genuine selection is `workflow_requires_owner_disposition` with association_count=1; `bound_plan_requires_owner_settlement`, `no_execution_association`, foreign or missing association cannot substitute. The original ExecutionBinding discriminator still uses its exact existing `no_bound_plan` arm for a Workflow and preserves its actual nonnull active_run_ref and execution owner/source; no new Workflow enum or bound-Plan coercion is introduced.
3. GoalStopSources.original_stop_intent equals the entire `original_stop_intent`. GoalStopSources.original_stop_receipt equals `original_stop_receipt.record`, which also equals `current_controls.goal_stop`. The existing original_stop_receipt_selection resolves that exact genuine full StorageStopReceipt outer value. No receipt is reissued here.
4. The existing original_source_audit_selection resolves the entire separate `original_source_audit` StorageSourceAudit outer value. Its record is validated only in the current Goal realm. Both StopIntent.source_audit_sha256 and StopReceipt.source_audit_sha256 equal SHA-256 of the actual complete original outer StorageSourceAudit bytes under the existing local Goal codec. Verify its complete request, normalized identity, original acceptance/dispatch/outcome authority and historical original body/execution binding. Equal request IDs or selectors alone do not establish original acceptance.
5. StopReceipt.stop_intent_sha256 uses the unchanged exact recipe: SHA-256 of UTF-8 `pm.goal.cancel.stop_intent.v1`, one actual LF, and the local canonical JSON of the entire StopIntent. It is not the StopIntent wrapper hash, semantic JCS or D05 MessagePack. The source audit's before-Stop commitment and captured epochs equal the original StopIntent's actual before values; genuine receipt after epochs and current host Stop lineage remain authenticated. Current epochs may later advance only through original permitted custody; they are never reset to the old receipt's after values to manufacture currentness.
6. Full audit normalized operation identity, StopIntent.operation_id and StopReceipt.operation_id agree with the authentic original root cancellation. Receipt.original_host_transaction_ref and original accepted cancellation/owner epochs are verified through their actual owners. Native cancel result/origin and SchedulerStop/inventory are genuine original distinct sources with exact root-operation/scope/generation joins. Per-role shutdown, restore, drain, append and aggregate operation IDs retain their own genuine original identities; they are not overwritten with the root cancellation ID.
7. Audit.original_execution_binding and StopIntent.original_execution_binding equal the original binding accepted for this same run and join current binding through its immutable original association/transition custody. Their historical original_body revision/hash remains historical. Later current Goal body/control must be fully read under current authority, not forced equal to vanished B0, B1 or the captured audit body. Deletion or unavailable current controls makes this current D05 route unavailable; it does not recreate them or grant a new indefinite body hold.

The two realm arguments are independently authenticated and compared as full real original values. D05's original native witness does not grant current Goal authority. Current Goal cancellation custody does not grant native Executor/Workflow authority. The same actual original operation, full scopes, permission/current owner, native registration, deletion/hold/backup epoch and no-gap final fence must hold across both.

#### Physical preservation and retained safeguards

All sixteen D05 physical family declarations, schema IDs/versions, codecs, keys, source-origin fields and complete recursively referenced value grammars remain unchanged. The entire recursively referenced stored value grammar is preserved; its unchanged shape is not native authority. The transient current Goal argument is not a durable family or new request/event field. An actual original installed contract digest must identify this exact selected source integration from the genuine initial allocation; an existing stored v2 wrapper cannot acquire current A4/Goal coverage by reinterpretation. Original physical declarations retain their complete historical value grammar. The fixed family map explicitly selects the recursively equal current source route for the sixteen aggregate values; that value route does not replace the original native method contract or admit an original role-owner operation through the current aggregate realm.

The new FileSafe source profile is mandatory for any represented FileSafe operation. The complete FileSafe key and owner contract is stated in these FileSafe and Storage sections. Its three metadata prefixes are `executor_filesafe_invocation_binding.v2.k1:`, `executor_filesafe_journal_head.v2.k1:` and `executor_filesafe_journal_origin.v2.k1:`. Every identifier component is K = lowercase hex of its exact valid UTF-8 bytes, preserving colon, case and Unicode scalar sequence without normalization or domain narrowing. Fixed-arity separators remain literal colon; the final journal-origin revision uses canonical positive decimal N. The original safe-point, permission and restore-journal keys/codecs remain unchanged.

Actual FileSafe/Storage authority must have installed `filesafe_original_injective_keys.v1` before the represented original binding admission/preparation and before mutation, with complete authentic original/current installation custody at every writer, acknowledgement, reconciliation, read/recovery, backup and deletion boundary. Original k1 physical keys must match the exact entire selected values and actual owner scope; the source/codec/retention/backup fields are resolved to full real native sources, not trusted as profile strings. No caller, aggregator or new registry map can rekey an old operation. Raw-v2, mixed-profile or missing-original-installation operations remain unsupported and remain in the complete D05 census; no migration, discovery-based backfill, rename or equal-value adoption is supplied. An already enrolled D05 domain cannot gain missing original capability coverage retrospectively.

The FileSafe stored schema IDs/versions and all complete value grammars remain v2. D05's unchanged physical `profile` literal mentioning `exact_filesafe_v2` denotes that original logical effect/value grammar; it does not waive this successor's mandatory k1 source/key provenance. The explicit new source URI and original native installed contract select the real profile. Whole-value equality is preservation evidence, never proof of original profile installation.

The whole FileSafe k1 source retains the exact original v2 restore-safe-point-then-retry effect role and complete logical value grammar, with its genuine resolved original effects and no post-Stop retry or broad filesystem equality claim. Process v1 remains the exact disposable, unshared local Unix stdio diagnostic role, with all original member admission, actual wait/signal/parser/drain/preforce/final-flush evidence. Neither can settle unrelated external effects. Whole original role readback, current C census membership and original dispatch/acceptance/owner/capability/origin joins remain separately required.

Current C materialization remains mandatory even for zero invocations. Census and partition cover all original invocation/attempt/retry/remediation/replan generations; unknown or unsupported effects stay unresolved. The original append-only pre-attempt history remains genuinely zero for positive admission. Every actual checkpoint obligation remains unresolved because RequiredCheckpointSuccess is literal false. Mandatory final normalized-event flush, including zero-event cases, authentic whole EventRecord/first append custody/current readback, fsync boundaries, native queue/writer census and append-only required-flush history remain unchanged. Any original required-flush failure stays sticky even after later success. Final run-producing capability revocation and no returning helper/callback after the final predicate remain mandatory.

Every directly callable issuer, lower writer, observer, helper, current reader, recovery reader and replay responder independently performs complete before-helper source/preimage/native-authority checks and candidate derivation. After all parsers, codecs, builders, validators and currentness helpers return, it rechecks the complete original source set, exact pending candidates/preserved transaction union and full current realm joins in one pure predicate before its own commit or release. The outer original publisher independently repeats the full union check. Later refusal preserves earlier real effects. A JSON schema instance, schema-ID route, hash comparison or source check alone is never that admission.

#### Actual original phases

Before original Workflow birth, authentic native allocation and compile require their complete original owner inputs and full OriginalLaunchGoalRead. No Workflow, StartControl or future activation result is demanded. Original allocation still precedes first reserved-run capability release. The compile observer still receives genuine NativeCompileSource and OwnerIssueOrigin only after their co-issuance within the same held original publication.

At actual T1, consume the whole original native birth argument, separate BindingLowerArgument and actual joint Goal/native candidates. The complete BirthStartOutput is a co-issued output: full zero-epoch StartControl and genuine A4 begin OwnerIssueOrigin produced by that same original begin operation. It is not a previously published prerequisite. D05's original WorkflowReservationJoin authenticates the already co-issued complete D01 birth/origin, native birth and start control/origin within the one unreleased native transaction. It neither creates these sources nor enrolls a preexisting run.

At materialization and subsequent genuine current boundaries, the complete selected start CurrentSourceArgument supplies authentic precoverage, prestart or original_started truth only where that actual original owner phase permits it. Precoverage does not invent a future inventory or coverage receipt. Every later post-materialization D05 stopped aggregate or current-read boundary requires the covered prestart or original_started arm, never precoverage. A covered prestart source can honestly describe a run stopped before original start; it proves no committed or pending start, not permission to begin one after Stop. The separate full actual stopped Goal/native controls still govern that operation. The no-effective-Stop guard on OriginalCommitArgument is specific to original start admission and is never imposed on a stopped NoStartSource read.

At the actual original start operation, any existing D05 metadata/capability/obligation/core-event observer that its complete original owner contract already admits in that phase receives the whole OriginalStartArgument in the native realm and whole OriginalGoalArgument in the separate Goal realm. These are true held prestart sources and complete privately derived candidates. They do not demand a future committed CurrentStartSource or first Storage receipt before its authentic assignment. OriginalD01StartPublicationArgument remains the original start owner's exact co-issue phase. D05 grants no new start writer, producer or observation authority. The actual start producer submission/event identity, occurred timestamp, full typed payload and all provenance fields are preserved by the original owner; no D05 metadata operation reconstructs or replaces them. Every actual selected-run core event, including original goal_run.started where admitted through the core route, retains its actual original admission and joins the final cut once. A D05 observer that cannot fit inside the genuine original held transaction remains unavailable, not a later backfill.

The five generic phase maps distinguish actual original prebirth, actual original T1 output, actual held original start and later full current source. These are private owner phase obligations, not a caller discriminator. A phase mapping supplies an argument only where the unchanged whole original method already admits that operation; otherwise no route exists. Two prebirth-only methods and the dedicated T1 method retain their exact narrower phases. All five stopped methods require complete current start source at every aggregate and current-boundary read, with the whole pairs explicitly typed by StoppedAggregateArgument and StoppedCurrentBoundaryArgument.

#### Complete current joins and final boundary

For each AggregateInput, SupportedInput or CurrentBoundary held by a stopped boundary, obtain a complete fresh CurrentStartArgument from its genuine original owner. Join its entire d01_current to the corresponding complete current_executor value, recursively including full Workflow current body/control, original D01 current lineage, every present WorkNode/control/result/origin, inventory, SchedulerControl and run control/result/origin. The same complete start value must apply to the corresponding source_readback and current_boundary participants in a successful read at that one held boundary; differing current native values are stale, not separate acceptable observations. Exact storage instance, project, Goal, Workflow GoalRun, actual owner/epoch, original allocation/compile/birth lineage, Stop and inventory joins remain mandatory. The separate full CurrentGoalStopArgument's native GoalRun witness must equal those same genuinely current Workflow body/control values. D05, D01, start and D06 operation IDs keep their distinct original owners; equality is required only where their actual original reference fields define it.

NoStartSource requires authentic initial control/origin, no pending start operation and no original committed start. CurrentStartSource requires authentic compact immutable original StartCommit/StartOrigin, authentic current StartControl and the whole current D01/native chain. Its original start after-image selection joins the actual original start link in that chain; a later admitted D06 native link may advance current Workflow body/control without changing that historical start commitment. Old outbox prepared/null/false fields remain exact historical preparation, never a current start or dispatch verdict. Missing original initialization, pending coordinator truth, unavailable current native values, mixed backup generation or stale origin fences mutation and positive current disclosure. Compact commitments never supply missing source bodies.

At every original reader and independently callable lower writer, authenticate the full actual source union, original native operation and installed profile, real owner/capability and registration generations, scope and identity, current Goal/Stop/binding, all whole native preimages and privately derived candidates, permissions, codec admission, holds/deletion/tombstones, backup/recovery and genuine source custody before returning helpers. After all reads, decodes, copies, hashes, codecs and builders, independently repeat the complete pure predicate over that same held union. No returning helper, callback, await, logger or mutable gap can follow it before publication or passive disclosure. A checked map or schema, old upper-layer check or comparison-only foreign value never grants native authority.

#### Original result, later D06 and event cut

SuccessfulReadback is transient. Its source_readback and current_boundary contain whole genuinely current D01/native/Goal sources, not archived original Workflow after-images. Original AggregateResult and its actual Origin remain compact immutable original custody, together with original settlement, reservation and append-only flush history. A later read must authenticate those originals and obtain fresh full current native sources. It does not make their historical issuance selections equal to today's mutable body bytes. The original source's actual retention, deletion and current-read requirements still apply; if unavailable, do not fabricate a full readback from the compact result.

The complete original DomainCut still revokes all scoped work, mutation, callback, producer, normalizer, admission and drain-producing capabilities. The native domain contract separately enumerates the native original terminal owner registration and distinguishes its existing authenticated root-cancellation service authority from scoped ongoing work. The distinct later D06 control-plane publication can use only that actual originally registered owner entrypoint, root command, source contract and private final fence. Its existence must be proved by the authentic installation/native operation, complete actual input/candidate/current source and original capability history; a role label, registration string or terminal-looking event cannot establish this separation. D05 imports no positive D06 consumer source or future disposition; the separate positive consumer imports this complete D05 source.

The original D05 final CoreWriterCut and FinalFlushRecord cover exactly the complete originally enrolled and sealed selected-run producer/normalizer queues and every originally admitted member. The later distinct original D06 control-plane append is outside those sealed producing routes and has its own authentic original first barrier and whole custody. It cannot re-open a sealed queue, mutate its original admission chain, reuse its producer capability, revise the original final flush, conceal a failed flush, or count a late ordinary event as terminal service output. All selected-run ordinary buffered output remains subject to the original complete D05 cut. If the installed native source cannot establish the distinct original terminal authority and closed-queue separation, the later D06 operation remains unavailable; no generic post-cut exception exists. This enforces the original terminal-owner boundary without a new source family or changed stored cut.

A later D06-linked current source may advance native Workflow status only through its genuine original D01/D06 lineage. D05 re-reads that current source against its original immutable aggregate, source lifetime and unchanged scoped-cut semantics. It does not need the old full Workflow body. Positive D06 original admission consumes this entire source binding and complete fresh D05 result/current readback before its own effect; after that effect its later readback must likewise use current sources and its own immutable original custody, not persist a stale D05 SuccessfulReadback.

All original final-flush requirements, empty-event native durability, whole EventRecord/first receipt/custody/read tokens, exact queue census, sticky failed-flush outcome and all original required-flush attempts remain mandatory. Checkpoint success remains literal false. Unsupported pre-attempt effects, unknown capabilities/obligations, pooled/shared processes, arbitrary callbacks and unsupported effect roles remain unresolved. Start itself does not imply a provider/tool attempt or Usage effect. D05 is not Workflow/Goal terminal publication, completion, certification, general status or replan authority.

Full original start PublicationResult exists only inside the actual held original invocation. Later full commit replay remains unsupported under the original start contract; current compact readback and existing original EventRecord reads retain their own full-source/lifetime rules. Neither D05 nor its original compact custody archives a start producer/native snapshot or resumes lost pending start context. This current source selection adds no physical family or retention extension. Actual installed descriptors, owner exclusion, native/seglog atomicity, durability/crash, recovery, integer codec and backup qualification remain NOT_RUN.

#### Original FileSafe effect resolution

The bounded `local_safe_point_exact_replace_v1` role covers only the original FileSafe invocation of `cmd.runtime.restore_safe_point_then_retry` with its exact nine canonical payload fields. It does not cover arbitrary writes, Git/provider effects or every invocation labelled FileSafe. Use the complete original source grammar and mandatory `filesafe_original_injective_keys.v1` installation. This role result alone is not whole-run D05 success.

#### Original ownership and admission

The actual Executor dispatch writer registers the entire DispatchInvocation in the dependency's whole-run InventoryHead before original dispatch. After C admit_dispatch and its MutationOrigin durably commit, the actual FileSafe owner accepts that genuine handoff under the shared current stop/capability fence, reserves its genuine restore_transaction_id and commits FileSafeInvocationBinding with original journal preparation before mutation. The binding identifies the existing command's original source, exact payload, execution host, source location, operation, transaction and owner epoch. It is immutable. The binding selects the already-committed C admission and origin; the dependency's original_input_capture selects the actual already-captured command input, never this later binding. C admit_dispatch MutationOrigin afterimages cover C/native dispatch rows issued by that transaction, not future FileSafe rows. The separate original FileSafe preparation origin authenticates this binding through its exact BindingSelector digest along with its issued journal commitment. The binding does not hash that FileSafe origin. C ack_handoff occurs after actual FileSafe acceptance and selects the already-issued acceptance/binding and FileSafe origin. That later C acknowledgement origin is not selected by the binding. This is an acyclic dependency order, not one cross-owner transaction. No retrospective binding is inferred from command names, timestamps, matching payloads or an existing journal.

The new metadata is necessary original-writer source instrumentation. It does not replace original command validation: allowed blocked episode, permission snapshot, FileSafe policy, repository/worktree identity, original idempotency and baseline ownership remain mandatory. Cancellation never calls restore_safe_point_then_retry, creates another restore, dispatches the retry or mints an attempt. It can observe an existing result or leave its already-authorized original reconciliation under its original owner. A serialized binding grants none of these actions.

#### Read operation and complete native boundary

The private FileSafe source owner receives FileSafeReadRequest for a currently enumerated genuine dispatch. It resolves the binding through the original admission, not through caller-provided paths or an arbitrary adapter. Inside the actual native FileSafe/storage ownership boundary it reads the whole binding, whole dependency admission and mutation origin, current head, whole current journal, current origin and first resolution origin if one exists, whole original safe point and original permission snapshot. It returns OriginalFileSafeSources only with the actual current native boundary captured in that operation.

The boundary's writer_members is the exhaustive native registry under the real mutation lease, including subprocess/delegated/reconciliation writers; it is not a caller-selected list. Empty is valid only where the owner proves empty membership. Native ownership, root generation, host, source location, permission and codec/retention/hold/backup/deletion registrations are acquired and revalidated before and after the read under the owner's actual lock/transaction. Those *_source_ref fields name full native sources held by that original operation; a detached string, cached disclosure or a schema-valid object does not satisfy a guard. There is no transportable authority token and no public API. If an actual owner cannot execute this boundary, report unavailable. Writers cannot regain a revoked mutation capability for this original resolved invocation. All late callbacks remain fenced by the original invocation/attempt/generation and dependency stop state.

#### Semantic acceptance, beyond schema validity

All duplicated identities must join exactly: current dependency scope and complete inventory member; binding's DispatchInvocation; actual admission and its MutationOrigin; command project/run/node/attempt/repo/worktree/safe_point; original safe-point tuple; original journal project/transaction and attempt identity; storage instance, host, source location and actual owner epochs. Every actual read selector resolves in its declared original family, decodes using the registered codec, validates against the complete schema and hashes its actual physical bytes. Historical journal issue commitments in origins are not current reads; no reader attempts to retrieve overwritten same-key bytes. Head revision, origin revision, origin issued_journal_commitment and current journal selector match at the current head. The complete immutable prior-origin chain reaches authenticated original preparation with no gap, fork or reader-written member. The original first-resolution origin is read from its immutable origin key. Its issued journal commitment remains historical; current full journal plus the original-owner terminal-core commitment and allowed link-only chain establish the original terminal truth as specified below.

Original FileSafe equality remains the owner algorithm in FileSafe 11.1.2b: full manifest/path coverage and exact bytes/metadata as specified, not Git cleanliness, mtime, process exit or a receipt assertion. The read operation does not redo equality, restore files or require reading archived raw payloads after an already-authenticated resolved original result. If original reconciliation still needs files/manifests/blobs, it must use its own complete original inputs, permissions and holds; missing material never becomes resolved.

A resolved disposition requires the authentic first terminal origin, exact terminal journal and current capability quiescence. committed/restored_clean joins commit_target with target_proven; committed/restore_skipped joins already_target_zero_mutation with authentic no-mutation target verification; rolled_back/restore_failed joins commit_rollback with pre_restore_proven. post_restore_state_sha256 must match the corresponding complete original target or pre-restore state hash proved by that owner, with the original count/failure fields consistent. Terminal result truth cannot be reopened or rewritten by a later link; such a link changes only the original result-event reference/time permitted by the canonical journal and retains the first resolution origin. Every actual writer is revoked_terminal. A recovery_required journal, retained recovery fence, active reconciliation, unknown effect or unsupported outcome stays unresolved. A retained fence is not terminal resolution.

The claim is only the original FileSafe invocation's effect resolution. It explicitly does not certify current filesystem equality after later legitimate writers. current_filesystem_equality_claim and unknown_effect_custody_transfer remain false. There is no reconstructed success, new public command/event, second stop timestamp or synthetic terminal receipt.

#### Inventory and whole-workflow boundary

RoleSetAssessment consumes the whole dependency StopSource including the complete current original inventory. Partition every dispatch invocation exactly once by its full identity: a supported FileSafe disposition or an UnsupportedInvocation. No filtering to a favorable generation, currently active subset, role, provider-visible subset or convenient empty inventory is allowed. Every unavailable disposition retains its corresponding original invocation in unsupported_invocations; therefore it cannot enter FileSafeRoleSetResolved. Duplicate, omitted, foreign or changed members fail acceptance. The inventory cut, scheduler stop and actual role reads must remain coherent under the original aggregate owner's boundary.

selected_filesafe_role_set_resolved means only the represented effects are resolved. workflow_safe_stop_admission explicitly remains requires_original_workflow_executor_and_all_other_source_roles even when every inventory member is supported FileSafe or the original inventory is authentically empty. The D05 aggregate separately supplies original complete census, capability/obligation and final-flush composition; Process supplies only its exact supported original shutdown source. FileSafe role assessment alone supplies none of those facts and cannot serve as D06 admission. Checkpoint success remains unavailable.

Executor EP115 context-transition retention/reconciliation and FileSafe recovery fencing do not authorize Goal cancellation to transfer unknown effects. No such transfer is supported here. Scheduler stop fences dispatch; it does not prove effect resolution. Any unknown other-role effect or missing native source remains pending/unavailable under the existing original owner. This is an explicit unmet source dependency, not proof that no future canonical contract can supply it.

#### v2 exact terminal-core and result-link rule

FileSafe v2 complete metadata values and original journal families remain exact; the k1 profile changes only the three compact metadata keys and source identity. No full journal archive is added.

At original first terminal resolution, the native journal writer validates the complete original journal and exact equality under its real FileSafe boundary. It computes terminal_core_sha256 as SHA-256 of the UTF-8 domain `pm.filesafe.terminal-core.v2` followed by one zero byte followed by canonical MessagePack of the complete original journal map after removing exactly the top-level keys updated_at_utc and result_event_ref. No other field, nested member, nullable value or array element is removed or normalized. The stored journal still has every original required field. This commitment is non-null only at first resolution or a later permitted result link; prior nonterminal origins have null. The first-resolution origin stores the exact two removed field values in journal_link_fields. It commits this core digest in the actual original terminal transaction, never later observation.

A later result-link writer reads and validates the complete current journal under the actual original owner lease, verifies its terminal core matches the authentic first-resolution origin, and may change only result_event_ref and updated_at_utc. It validates the complete candidate original journal and requires candidate terminal core to equal the same first-resolution digest before commit. Its own journal_link_fields stores the exact issued two field values; prior values are in the immediately preceding immutable origin, so the reader checks a complete actual link chain without an old journal body. Every later link carries the unchanged non-null terminal_core_sha256 and resolved_original_result pointing to that first-resolution origin. No link may change operations, phase, cursor, holds, restarts, recovered_after_restart, outcome, conflict reason, state hashes, identity, schema or any other original field. If a later canonical writer needs such a change, this profile becomes unsupported; it does not claim that the owner generally forbids such changes.

The read operation validates the current complete original journal, checks its two current link fields against the current origin and computes its full terminal core using the exact recipe. That core must equal the authentic first-resolution commitment and every subsequent link commitment. The first resolution origin's exact original equality and write-kind must still support its terminal class. This is an owner-validated comparison of the currently retained full original terminal fields and original link-field custody, not reconstruction or reinstallation of a historical journal. The current journal, genuine original equality-origin and entire immutable origin chain are required; an origin/hash without the current full journal cannot pass. No historical operations-array archive, raw manifest/blob archive, or indefinite full-journal-version archive is introduced.

The two link fields are required-present in the exact original journal schema. result_event_ref retains explicit null or its exact string and updated_at_utc retains the exact original timestamp spelling; no absent-to-null or timestamp normalization is allowed. The terminal publication also validates and hashes the entire original value in its JournalIssueCommitment, independently of the core digest. JournalIssueCommitment is a distinct typed historical commitment, not SourceSelector, and uses issued_physical_sha256. Compare its identity/key/codec and issued hash to current JournalSelector only for the current head; never dereference an old journal commitment as an extant row.

Stop/acceptance races remain ordered under C's actual original handoff fence. If Stop wins before FileSafe acceptance, no FileSafe capability or new restore is issued. If FileSafe accepts first, it is a genuine inventoried operation requiring original reconciliation. Crash after C admission but before known FileSafe acceptance keeps unacknowledged/unknown inventory; a reader cannot infer no effect or redispatch. Crash after FileSafe acceptance but before C ack preserves that same original binding/journal/origin and permits only authentic same-operation ack/readback. A missing FileSafe source does not remove the C member.

#### Original disposable local Unix MCP process shutdown

This original custody contract is owned by Executor, Run Modes, MCP lifecycle and Storage and remains only one prerequisite of D05. The supported route is an original explicitly disposable PM-managed local Unix MCP diagnostic probe using stdio and the Run Modes MCP three-second grace. It must be genuinely admitted as that diagnostic before launch and must have no shared-session beneficiaries. MCP pooling remains the canonical default; no normal tool invocation becomes a disposable probe because cancellation would be convenient. Pooled MCP, remote MCP, external-managed MCP, CLI provider shim, provider five-second route, Windows and LSP/terminal sessions require their own original source profiles. Unsupported routes remain exact members of the C v2 all-generation dispatch census.

#### Original source and capability boundary

The actual C admit_dispatch transaction durably issues the entire original DispatchInvocation, admission and MutationOrigin before downstream handoff. C afterimages cover its own issued rows, not this later owner's records. Under the same authentic stop/capability handoff fence, the original process/MCP supervisor accepts that exact capability and records ProbeBirth from the real launch operation. ProbeBirth binds complete invocation, original dispatch input capture, actual original command source, original server/runtime lifecycle value, host boot and process namespace, native containment birth, original root process reservation, owner epoch and both output streams. It is not an alternative launch request. C ack_handoff follows the actual acceptance and selects its already-issued birth/origin. A Stop that wins before transfer prevents launch; a launch that wins remains in the stop census. A crash before known acceptance/ack leaves the C member unacknowledged/unknown, never eligible for blind redispatch.

The original supervisor's `native.process_scope` boundary is a mandatory native source primitive with the following exact responsibilities. This is a required owner integration, not a claim that a process-group ID implements it. Before any child can execute user code, the supervisor reserves and owns the native containment domain, process group/session, kernel process identity, namespace/boot, stream descriptors and spawn/exec gates. The child is stopped behind its actual native gate while original ProcessBirth and the membership origin commit durably. It creates its own process group/session as required by Run Modes before effect-capable release. Every nested process has its own pre-effect C dispatch admission and ProcessBirth, or cannot be released by this profile. The actual boundary enforces all spawn, exec, group/namespace escape, descriptor passing, callback, reconnect, subscription and tool-dispatch capabilities; it does not infer them from a scan or an in-memory array.

An implementation that cannot prevent unregistered child effects, cannot enumerate/revoke all inherited output writers, or cannot preserve containment against process-group escape returns native_containment_unproven. Ordinary process groups, `ps`, PID absence, kill return codes, elapsed time and a caller-provided list are insufficient. No implementation mechanism is presumed installed. The source primitive is qualified only when the native owner can establish these exact original enforcement facts; its identity/registration is privately resolved at every operation. This profile adds no authority to sandbox or relaunch an existing arbitrary process. A process launched without original profile admission remains unsupported.

Kernel identity is the retained original native object/handle plus host boot, process namespace, kernel birth/start sequence and original group/session birth. Numeric PID/PGID alone is never reused as identity. Both stdout and stderr occur exactly once, with distinct original pipe/read and complete writer-domain identities. No other supervisor-owned output channel can be omitted. Application network or other external effects remain separate effect-owner obligations and are not resolved by this process source. The actual native registry is the source of membership; every registered process, writer, inherited descriptor holder and callback capability is present, including terminal members. NativeMembership outside_scope_beneficiaries and escape_or_untracked_sources are exhaustive actual sources, not optional caller disclosures. New helpers receive new identities; they cannot impersonate an old member.

#### Shutdown admission, grace and escalation

ShutdownAdmission is written only inside the genuine original supervisor operation consuming C's authentic full StopSource. Match complete scope, attempt/invocation, operation, Goal Stop, SchedulerStop, immutable stop inventory cut and actual current native cancellation result/origin. The original Once key belongs to that real root and probe; duplicate entry observes the same original operation and never sends another initial signal. SIGTERM/SIGINT entrypoint fan-out and SIGHUP reload semantics remain Run Modes-owned. This internal selected-route teardown sends SIGTERM to the actual originally owned process group and fixes a monotonic three-second deadline. It does not rewrite the original Goal stop time or choose a new public stop reason.

Before signal delivery, revoke spawn/exec/reconnect/subscription/tool-dispatch admissions and state-changing callback capabilities in the actual native domain. Graceful output readers and normalizers retain only the exact drain capabilities they need until finalization. During grace, already-authorized original work can terminate and produce final output; new effects cannot be dispatched. SignalResult records the original syscall operation and result against the exact native group identity; a genuine already-terminal wait can produce already_terminated_confirmed without sending a signal. That state cannot be inferred from ESRCH on a recycled or unavailable PID.

If the group is still live at the original monotonic deadline, run and record the before_force mandatory flush before issuing SIGKILL. Failure of that flush is sticky done.crashed even if force teardown still proceeds to reclaim the process group. A successful pre-force flush is not final stream completion: late grace/termination output can arrive and must enter the final drain/flush. The force SignalResult selects the same group birth, original scope and current membership, and is issued only once for this original escalation. No force result is clean until every actual original process has a native terminal wait result and the current enforced containment/writer domain is quiescent. A stuck or unidentified member stays unresolved; failure diagnostics do not make it absent.

WaitResult preserves native exit/signal distinctions, optional status as explicit null, and exact kernel identity. `original_group_terminated` requires terminal observed status for every actual member and a current domain read proving no live descendants or escape capabilities. Root-process exit alone does not qualify. Finalization closes owned input and protocol sessions in their original deterministic lifecycle order and revokes every remaining process-related mutation capability; current helpers outside the probe are not affected.

#### Stream finalization and normalized queue coverage

Each stream's actual normalizer owns an ordered chain from byte offset zero and normalized ordinal zero. The original normalizer produces a NormalizedAdmission before releasing each normalized event toward storage, retaining the original normalization operation, exact byte interval and event source/schema/semantic identity. Queue writers cannot admit an item without this original chain and capability. Zero emitted events is valid only with a genuinely complete native zero-item chain and finalized input; empty caller arrays prove nothing. Gaps, duplicates or a wrong ordinal are unresolved. SHA commitments are original observation metadata, not replay or current raw-byte certification.

StreamFinalization is an original native finalizer result, committed while it owns the complete pipe writer domain and parser. It requires actual EOF after all original producers close, complete received-byte accounting, completion of every outstanding normalizer job and final partial-input disposition. A final incomplete protocol fragment must follow the existing normalizer's actual error path and resulting original event custody; it cannot disappear or become fabricated valid output. A failed read/parser, unknown producer or crash-lost unflushed bytes cannot yield eof_and_parser_finalized. Both streams remain independent of terminal UI/backing-file lifetime. This route does not certify browser, remote terminal or retained UI state.

Raw bytes are not copied into these new durable records. The positive reader consumes an authenticated already-issued original finalizer result and its actual native current capability boundary. If that original result never durably existed and raw buffered input was lost, recovery reports the loss and cannot recreate a successful parser result from hashes. The existing owner may reconcile retained real material under its own authority; this cancellation reader does not manufacture it or install an archive to make it available.

#### Required flush writer and whole source readback

There are two original flush stages: before_force when escalation occurs, and before_final_outcome in every completion path. WriterCut is captured by the actual shared normalizer/seglog admission owners under their native queue fences. It enumerates all original writer queues contributing to this probe, their complete admitted items, drained/remaining counts and normalizer in-flight counts. These arrays are exhaustive native membership, not items filtered by a favored event type, run generation or matching-row maximum. Shared Storage commits can contain other scopes; this process does not claim ownership of those scopes, and the complete global Storage controls/read token remain required.

At before_force, the cut fixes the complete current prefix while later output can still be admitted. At before_final_outcome, both streams must be finalized, all producer/normalizer admission capabilities sealed and all probe queues drained. Each admitted item is accounted exactly once by a complete original EventRecord, original first-append custody and original full_value_result, or remains unresolved. Full current EventRecord envelope and registered payload schema admission are mandatory. Receipt-shaped metadata, seglog.event_appended observability, normalized output EOF or a write/buffer flush do not establish durability.

The actual Storage append owner performs the existing two durability barriers: complete source frame writes plus selected active-segment sync, then original manifest watermark promotion plus required parent-directory synchronization. Original SP-286 first-receipt custody must also durably commit. Its exact original full_value_result and custody bind the whole original EventRecord commitment. Readback uses the existing complete event_record_index read_token and full current original CURRENT/manifest/source under the native append/maintenance fence. Original historical receipt coordinates remain original; the current selected source may have a separately authenticated later frontier or supported compaction. Never equate original manifest_generation with current manifest_generation merely to make a join pass. Missing translation, retained full value or current original source is unavailable.

RequiredFlushRecord is the only new durable flush record. It contains compact original admission/custody selectors and original full_value_result commitments, typed failure state and the genuine native Storage boundary operation reference. FlushResult is a private readback wrapper, not a persisted metadata family. Its full EventRecord values, whole current CURRENT/manifest and whole original first-receipt custody are resolved from their existing owners for that read and are not copied into a new archive. The original required flush record's status/operation/stage/sequence/time and every commitment must equal the complete readback. The native Storage operation referenced by the original record authenticates the originally executed sync/promotion/custody operations; strings or matching schemas do not execute or substitute for those operations.

No fake event is appended solely to serve as a flush marker. A genuinely empty flush still invokes the actual registered writer's durability boundary and validates its real queue/capability cut and current original controls. It does not mint a receipt or sequence-zero cursor. Source validation, segment write/sync, manifest promotion, directory sync, first-receipt commit or readback failure produces an authentic original failure record. A structured diagnostic is required by the original owner; if diagnostic persistence also fails, the record preserves pending/unavailable diagnostic state and cannot claim it was durably emitted.

Flush failure requires done.crashed, never done.failed or clean done.cancelled. Later successful retry/recovery cannot erase an already-authenticated required-flush failure from this operation. User/parent cancellation with all required original flushes durable requires done.cancelled even when force termination was necessary. This field is an original terminal requirement for the selected prerequisite, not a newly emitted `done` event or permission to publish a Workflow status. All other original Executor obligations remain separately required.

#### Crash recovery and current reader

The original crash owner handles an unfinished run lacking canonical terminal done against the last durable seglog state. RecoverySource records the actual recovery operation/origin, old/current native host identities, authenticated original result if one exists and the current original Storage recovery boundary. If no canonical terminal exists, Run Modes requires done.crashed with stop_reason=crash_recovered; this cannot become a fabricated clean cancellation even if a later kernel scan finds no processes. Unknown or acknowledged Storage loss remains original Storage recovery failure and mutation fencing. Recovery does not reconstruct lost output or issue new dispatch/restore/tool calls.

After a crash, an already-authenticated original process result can be read unchanged only if current genuine owner/source/permissions/retention and native capability dispositions still support it. Old numeric PID/PGID, stale descriptor tokens or host-path strings cannot reattach identity. If the original native scope cannot be authenticated, return native_process_identity_unavailable or an unresolved original result. The original recovery owner may re-establish a current native boundary from its actual persistent supervisor/OS authority, but this contract grants neither a fresh process nor a fabricated old birth. Recovered crash metadata and original required-flush failure stay sticky. Storage final lock release happens only after actual final writer flush; this scoped process reader never closes the app's DB or releases the app-global store lock.

`read_original_process_shutdown` takes ShutdownReadRequest only. The actual process owner resolves the real birth, current head and all immutable source/origin rows from the original dispatch, then retrieves full native membership, original C admission/origin/current Stop, original process waits/finalizers/flush records and required full Storage readback. It validates every whole schema and selector, joins exact scope/attempt/invocation/operation/host/boot/namespace/group, follows the complete original sequence with no gap/fork, and proves all invocations and original writer queues represented by its domain belong to the authentic stop census. Different role or outside-scope membership is unavailable; the reader cannot filter it away.

Under the actual current supervisor/storage owner locks, repeat whole owner epoch, root generation, Stop/census, current source head, membership, current MCP lifecycle, permissions, registered codecs and retention/hold/backup/deletion admission before and after decoding/copying/hash/Storage helper calls. No source release follows a mutable/helper gap. Each independently callable read repeats this complete boundary; prior read output is not transferable authority. Those native source refs name real full private owner sources held and checked by the operation; a caller-supplied string, assertion or hash cannot satisfy them.

`this_original_process_shutdown_resolved` requires original_group_terminated; every actual ProcessMember terminal_waited with matching native WaitResult; no outside beneficiaries or untracked/escaped sources; every capability revoked; exactly stdout/stderr eof-finalized; authentic final flush present and durable; pre-force flush present and durable iff force occurred; no original failure/crash branch; and unchanged genuine original result with done.cancelled requirement. Zero/missing process membership cannot pass for a ProbeBirth whose child was released. Admitted-but-never-spawned operations need a separate profile and are not inferred as empty success here. Every schema condition is necessary, not sufficient without these native source joins.

This process assessment says nothing about remote effects, filesystem mutation, MCP application-level success or unresolved ToolSettlementReceipt. Forced/synthetic settlement may settle an invocation for liveness without proving its external effect. All original FileSafe/SCM/worktree/tool/provider/verification owners remain necessary. D06 requires the separate whole D05 aggregate and its positive source contract; this Process role result cannot satisfy it alone. No new user-facing status, Goal terminal event, stop timestamp, effect transfer or unconditional cancellation success is introduced.

Each ProcessBirth carries its own complete process-role DispatchInvocation and original admission/origin selectors, including nested processes. member_dispatch_sources supplies every corresponding whole original admission and origin. Root birth/admission is identical to the root member, never an extra invented dispatch. Process sources can cover several authentic nested process invocations in one original native group; the whole-run D05 partition must account for each such exact invocation once. A child lookup can resolve the same original probe only through its own authentic ProcessBirth/native membership, never a guessed parent PID. No process in NativeMembership may lack its own C stop-cut member.

Every capability represented here is the original probe-scoped capability, including its normalized-event enqueue/append contribution. Revoking it never revokes the app-global shared Storage writer or another run's enqueue capability. Current global Storage controls remain whole original sources; the scope split is proved by actual native owner bindings, not by filtering a global queue into a claimed empty list.

The process operation_id is the actual supervisor shutdown operation and matches its own admission/results. C StopSource retains the original root cancellation operation separately and unchanged; it is not renamed to a per-process operation or forced equal to an unrelated native syscall ID. Every source joins both through its genuine original ShutdownAdmission. Whole-D05 composition joins the root C cancellation operation and every per-owner original operation without collapsing their identities.

#### Independently callable FileSafe and Process boundaries

The complete canonical method declarations identify all eighteen exact private entries. Every named schema is a full definition within its whole pinned source root. Every native input is a private owner operation, never arbitrary JSON or a transferable string. The complete original owner boundary is necessary in addition to schema validity. These calls are not public commands and are not cancellation-reader authority to cause effects. Writers are invoked only by the corresponding originally admitted FileSafe/process operation at its genuine phase.

FileSafe initial admission requires the existing original command/blocked attempt/safe point/permission and already-durable C admission/origin, and does not require future journal/head/origin. The single original acceptance/journal-preparation transaction atomically commits the complete binding, original journal, first origin and head together before mutation or C acknowledgment. The initial journal is an independently derived whole native-owner preparation candidate and absent initial preimages are proved; prepared values are not authority before this outer all-four commit. Subsequent publish_journal calls require the complete original prior journal/head/origin and never create the initial binding. C acknowledgment is authentic acceptance readback, not a second admission. The injective key profile is authentically installed before original admission/preparation; old raw-key operations are unsupported. Current whole-read and same-operation recovery do not write. Native FileSafe reconciliation remains its own original operation and only it invokes the journal writer.

Process probe admission does not require future process birth. Actual child release waits for original own C admission, native gated ProcessBirth and membership durability. Each source write serializes its complete immutable Physical wrapper, hashes the exact canonical MessagePack bytes into its own OriginalWriteOrigin, then updates ProcessSourceHead in the same actual Storage transaction. Multiple source writes in one actual native transaction use distinct original source-write IDs and increasing origin sequence; the head selects the last already-serialized origin. Do not confuse a native syscall ID, root C cancellation ID, per-probe shutdown ID and original source-write ID. The key recipe's operation_id means the authentic original source-write identity, carried by its origin/OriginLocator where the payload names the syscall differently; original native_wait_operation_id remains separately exact. No method relabels those identities to force equality.

There is no atomicity claim between an arbitrary kernel syscall and redb. The native owner must hold the genuine original operation and capability fence and record only an authentic operation result. A crash between syscall and durable result preserves unknown/pending unless actual original native custody can recover it; a subsequent scan, matching PID, elapsed time or new observation cannot manufacture an old original result. No new side-effect call is authorized by readback.

Every method refuses a changed owner, epoch, storage/root generation, source location, permission, Stop/census, native membership, codec or retention/hold/backup/deletion boundary. Revalidate after every source/codec/hash/storage/native helper and immediately before commit or output release. No stale helper result or prior read is authority. Pending genuine intermediate records retain their exact typed status; unavailable returns the complete existing Unavailable branch and action_authority=none. Failed persistence never yields a committed tuple. The real original pending owner custody remains unresolved; no reader synthesizes missing rows.

Original reused FileSafe journal/safe-point/permission and Process lifecycle/CURRENT/manifest/first-append receipt values remain their original whole families with exact keys/codecs/lifetimes. Process FlushResult and full EventRecord/source controls are read-time whole owner inputs, never extra persisted families. The 3 FileSafe and 15 Process metadata families use only the separately mapped existing authority policy, with source/raw lifetimes independent. No method defines deletion policy, raw history, new public done event, Workflow terminal authority or whole safeStop success.

##### Pre-enqueue producer and post-append EventRecord

The normalized-event admission takes the complete original producer submission in `Plans/executor_cancellation_contracts/schemas/process-normalized-producer.v1.schema.json`. This whole transient signature schema preserves the exact bound original EventRecord2 grammar except only sequence_id, observed_at_utc and persisted_at_utc, which Storage has not yet issued. Its complete producer grammar differs from the original EventRecord only by those three absent Storage-owned fields and the explicit producer resource identity. Every other original required, optional, nullable and nested constraint is preserved. The exact original native payload schema and normalizer operation remain necessary; this adds no event type, payload contract or persisted family.

Only the actual later Storage append supplies the three fields and produces the true full EventRecord. The required-flush operation then needs that whole original EventRecord, its full registered payload, original first-append custody and full_value_result, plus current complete controls/read token. No pre-enqueue path requires a future EventRecord/receipt, and no post-append path accepts a producer submission in place of the full EventRecord.

#### Exact original D05 method boundaries

These complete original methods retain their original scope. The native owner determines the actual phase; adding a whole argument never grants a phase not admitted by that method. Prebirth requires full OriginalLaunchGoalRead and no StartControl. T1 requires full OriginalWorkflowBirthGoalArgument and co-issued BirthStartOutput. Admitted actual-start observations require full OriginalStartArgument plus separate OriginalGoalArgument. Every stopped method requires full CurrentGoalStopArgument and CurrentStartArgument, including both StoppedAggregateArgument and StoppedCurrentBoundaryArgument where consumed.

| Original method | Actual original boundary | Original result |
|---|---|---|
| `executor.bounded_safestop.join_original_compile.v2` | Inside authentic owner.workflow.compile.issue_native.v1 publication after original NativeCompileSource and OwnerIssueOrigin issuance | Immutable CompileReservationJoin, Origin and head CAS, complete original reservation equality |
| `executor.bounded_safestop.join_original_workflow_birth.v2` | Inside genuine corrected C Workflow birth after original birth and WorkflowMutationOrigin issuance | Immutable WorkflowReservationJoin, Origin and head CAS; exact original compile/allocation/birth joins |
| `executor.bounded_safestop.admit_original_pre_attempt_effect.v2` | Every actual reserved-run external-effect handoff before legitimate original C attempt/admission, under native capability exclusion before release | Immutable PreAttemptEffectAdmission, Origin and append-only head; every such member unsupported in this positive profile |
| `owner.workflow.launch.reserve_execution_identity.v1` | Genuine original native LaunchIdentityReservation allocation/admission, after authentic native namespace absence/same-operation and whole original parent/Goal/Stop/permission read, before first reserved-run capability release; no future NativeCompileSource or Workflow input | Original ReservationAllocation, DomainBirth, authentic Origin and head durable together; uninstalled precise native integration, no public Goal or ID creation route |
| `executor.bounded_safestop.register_capability.v2` | Actual native owner issues a capability behind its pre-effect gate | CapabilityBirth and authentic original Origin before release |
| `executor.bounded_safestop.record_capability_disposition.v2` | Actual original revoke/drain/terminal capability operation | Immutable CapabilityDisposition, complete DomainCut and Origin/head; no caller-selected revoke claim |
| `executor.bounded_safestop.register_required_obligation.v2` | Actual existing owner requirement becomes due before its triggering transition/effect can outrun custody | Immutable ObligationBirth plus Origin/head; no new policy |
| `executor.bounded_safestop.admit_core_event.v2` | Original selected-run producer/normalizer before actual queue release | CoreEventAdmission and original Origin; actual event remains in existing owner source |
| `executor.bounded_safestop.observe_stopped_domain.v2` | Actual original coordinator holding Goal Stop, native cancel, SchedulerStop/inventory and complete owner domain | Original complete DomainCut; unresolved retained |
| `executor.bounded_safestop.flush_original_final.v2` | Actual original queue seals/drains and Storage durability barriers before final outcome | CoreWriterCut and compact FinalFlushRecord/origins, private full original event/custody/current readbacks |
| `executor.bounded_safestop.issue_original_safe_stop.v2` | Genuine original Executor aggregate after exact supported input and final pure native fence | Immutable AggregateResult/Origin and actual head CAS; no new event or Workflow status |
| `executor.bounded_safestop.read_original_safe_stop.v2` | Independent read at original result key with actual full current owner/Goal/Stop/census/source boundary | SuccessfulReadback or truthful unavailable; no effects/replay writes |
| `executor.bounded_safestop.recover_original_safe_stop.v2` | Actual original coordinator recovery, preserving immutable original operation identity | Same original result or authentic Recovery/pending; crash without done remains crash_recovered |

#### Exact private method phases and original algorithms

OriginalProcessOperationBoundary: Actual originally registered disposable local Unix MCP stdio probe native.process_scope, private operation/transaction identity and durable original source chain, genuine host/boot/namespace/process handles, complete membership/writer/descriptor/callback registry, original capability gates, current C Stop/census and own invocation sources, owner/permission/source/codec/retention/holds/backup/deletion fences. Child remains pre-exec gated until its original admission/birth durable; plain PID/PGID or caller list is insufficient.

##### owner.filesafe.original_source.admit_binding.v1

Single original FileSafe acceptance/journal-preparation transaction after C admission, before mutation and C acknowledgment.

OriginalFileSafeAdmissionBoundary: Actual original command, blocked-attempt, Goal Stop/current permission and C capability-handoff sources; native FileSafe owner lease/epoch, storage instance, host/root/location, original operation and transaction IDs, native source/codec/retention/backup/hold/deletion registrations; filesafe_original_injective_keys.v1 authentically installed before this admission. Genuine absence or exact same-original-operation custody for all binding/journal/head/origin keys; new initial candidate is not a future committed source. Native original preparation and binding acceptance share the single actual original acceptance/journal transaction.

1. Resolve exact native command, whole genuine safe-point and permission sources, already-durable C admission/origin; join full invocation and all canonical payload identities without narrowing IDs.
2. Independently derive and validate entire original initial journal candidate inside original FileSafe preparation; genuine absent initial keys substitute for nonexistent preimages, not caller-supplied future origins.
3. Prepare complete binding under .v2.k1 key; initial journal revision is 1 with null prior selectors. Compute issued_journal_commitment from complete original journal bytes, serialize immutable first origin, then head selecting that already-prepared origin. None of these prepared candidates alone is installed authority.
4. Atomically commit binding, original journal, first immutable origin and head together in the single actual original acceptance/journal transaction before any mutation capability release. No intermediate binding-only commit. Immutable unequal same-key bytes conflict.
5. Only after this complete authentic transaction may original mutation capability be released and C acknowledgment select already-issued complete acceptance/binding/origin custody. Crash with unknown commit preserves C unknown membership and authentic same-operation readback only.

Physical write participants: `executor_filesafe_invocation_binding`, `safe_point_restore_transaction (existing exact original family)`, `executor_filesafe_journal_origin`, `executor_filesafe_journal_head`.

##### owner.filesafe.original_source.publish_journal.v1

Every subsequent original journal write: progress, first resolution or permitted result-link, after the initial all-four acceptance commit.

OriginalFileSafeJournalWriteBoundary: Actual registered original FileSafe mutation/reconciliation/result-link operation, equality sources where applicable, lock and original transaction; entire current preimage journal/head/origin, prior immutable origin chain and first resolution origin if any; installed original key profile; actual owner, permissions, all writer capabilities, codec/retention/holds/backup/deletion before and after helpers. Initial creation belongs exclusively to admit_binding.v1 all-four transaction.

1. All calls validate whole actual prior journal/head/origin and owner-lease CAS; increment revision exactly once, retain prior journal commitment rather than full prior body.
2. First original terminal resolution must execute canonical full equality and store terminal core using exact FileSafe2 recipe plus exact two journal_link_fields; never infer from process exit or metadata.
3. Subsequent result links may change exactly result_event_ref and updated_at_utc; validate complete current/candidate journal and identical terminal core, store exact link fields and immutable first resolution reference.
4. Own operation/transaction IDs and committed selectors come from this native write; no self-hashing origin and no reader-issued origin or fabricated prior revision.

Physical write participants: `safe_point_restore_transaction (existing exact original family)`, `executor_filesafe_journal_head`, `executor_filesafe_journal_origin`.

##### owner.filesafe.original_source.read_current.v1

Read-only original current disposition.

CurrentFileSafeReadBoundary: Privately resolve original admission, installed original key profile, real exhaustive writer domain and native FileSafe/source/permission/hold/backup/codec owner fence; acquire independently on every call.

1. Resolve whole OriginalFileSafeSources including binding, complete original C admission/origin, current full journal/head/origin, first resolution origin, entire origin chain, original safe point and permission; no caller-chosen path.
2. Validate all exact byte hashes and physical families/codecs, operation and full identity joins; historical journal commitments are not read selectors.
3. Repeat owner/root/location/permission/Stop and source-head/writer/hold/deletion/backup/codec checks after every decoding/hash/native helper and before release.
4. Full first-resolution custody plus allowed link chain/current terminal core and all writers revoked_terminal is necessary for resolved; recovery fence or unknown result stays unresolved.

Physical write participants: none; passive read only.

##### owner.filesafe.original_source.recover_same_operation.v1

Restart or interrupted admission/journal commit readback.

OriginalFileSafeRecoveryBoundary: Actual persistent original FileSafe recovery operation, original key-profile admission, original command and pending transaction custody under restored current owner and source registrations; no new restore/dispatch/operation identity.

1. Read exact original committed binding/journal/origins under independent full boundary; never install missing or old-profile rows.
2. If native reconciliation is still required, only its original mutation owner may continue its existing operation using its full original retained inputs/holds and publish_journal.v1; this readback method itself has no writes.
3. Missing known acceptance preserves unacknowledged C membership; unknown effects cannot be recast as absent or clean.
4. Return original result unchanged only when complete current boundary and original terminal custody validate; no new observed-at timestamp, terminal core or success receipt.

Physical write participants: none; passive read only.

##### owner.executor.process_source.admit_probe.v1

After genuine C admission, before launch capability release.

OriginalProbeLaunchBoundary: Actual preauthorized disposable probe command/input capture and C capability-handoff fence; own root process reservation/native containment birth and exactly stdout/stderr stream birth facts. No later ProbeBirth required as an input.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Accept only originally admitted disposable PM-managed local Unix MCP stdio probe, no outside beneficiaries; pooled/default/shared/remote/CLI/Windows routes unavailable.
2. Issue authentic ProbeBirth from native reservation; first origin has null probe_birth and null priors, sequence 1; origin hashes issued full wrapper then head selects origin.
3. Commit wrapper+origin+head atomically before capability release; C acknowledgment follows actual acceptance.

Physical write participants: `executor_process_probe_birth`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.record_process_birth.v1

Every root or nested child before any effect-capable execution.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Each child has its own complete genuine C DispatchInvocation/admission/origin, retained kernel identity, native containment attachment and pre-exec gate.
2. Reserve distinct original source-write IDs for ProcessBirth and membership; each full row gets its own successive origin, committed together with head under native original transaction.
3. Release child only after durable birth/membership; enforce escape/spawn/descriptor capabilities. No late scan enrollment.

Physical write participants: `executor_process_member_birth`, `executor_process_membership`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.record_membership.v1

Every original native membership change before changed capability release.

OriginalMembershipMutation: Actual complete native membership transition and original transaction; children require already genuine gated original process birth; output writers/callbacks/terminal members remain exhaustive.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Validate previous head and exhaustive native registry; issue immutable membership revision exactly next.
2. Commit complete membership+origin+head CAS atomically; no omission of terminal/escaped/untracked members and no caller subset.

Physical write participants: `executor_process_membership`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.admit_shutdown.v1

Original once-owned supervisor shutdown entry.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Join root cancellation and own per-probe shutdown IDs distinctly; original Once key prevents duplicate initial shutdown.
2. Revoke spawn/exec/reconnect/subscription/tool/state-changing callback admissions before signal; drain-only capabilities remain bounded.
3. Issue original monotonic three-second grace admission, preserving Goal stop time and root delivery semantics.

Physical write participants: `executor_process_shutdown_admission`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.record_signal.v1

Actual original signal/escalation result.

OriginalSignalOperation: Actual SIGTERM or SIGKILL operation against retained native group birth; original monotonic clock/deadline and before_force original flush for escalation, or genuine already-terminal wait. No caller-fabricated syscall observation.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Only original group identity; no PID reuse inference or ESRCH-to-success.
2. SIGKILL requires original grace deadline and before_force flush attempt; failed required flush stays done.crashed although reclamation may proceed.
3. Persist original syscall result exactly once; duplicate original operation reads same bytes.

Physical write participants: `executor_process_signal_result`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.record_wait.v1

Each actual original process wait.

OriginalNativeWait: Actual terminal/nonterminal native wait result bound to retained process handle/boot/namespace/kernel birth and original wait operation.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Preserve native observed status, exit/signal/core-dump distinctions and explicit nulls.
2. Unknown/nonterminal/identity-unavailable result cannot establish terminal membership; every actual member needs own matching terminal wait.

Physical write participants: `executor_process_wait_result`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.admit_normalized_event.v1

Before each normalized event can be released toward Storage.

OriginalNormalizationAdmission: Actual original stream parser operation with complete normalized producer submission and exact original payload-schema admission, byte interval, semantic digest, zero-based ordinal and previous original admission; real enqueue capability and original normalized source. No final EventRecord, sequence_id, observed_at_utc, persisted_at_utc, append receipt, first custody or full_value_result exists or is required before enqueue.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Start actual byte/ordinal chain at zero; every interval and ordinal accounted, no gaps/duplicates.
2. Issue original immutable admission before enqueue release; contains commitments/refs only, not raw output/EventRecord archive.
3. Only actual later Storage append adds sequence_id, observed_at_utc and persisted_at_utc. Required flush subsequently requires the whole true EventRecord and original receipt/full-value custody; this pre-enqueue producer signature never substitutes for that post-append readback.

Physical write participants: `executor_process_normalized_admission`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.record_writer_cut.v1

Original pre-force or final flush queue cut.

OriginalWriterQueueCut: Actual exhaustive original probe contributing queue membership and in-flight normalizers under shared queue/admission fences; before_force or before_final_outcome stage, complete original admitted-item chain and real writer identity.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Keep before_force prefix distinct from final seal; late output remains admitted and included at final stage.
2. Final cut requires both finalized streams, sealed producer/normalizer admission and drained probe queues; no filtered matching-row maximum.
3. Scope capability revocation never revokes shared app Storage or another run.

Physical write participants: `executor_process_writer_cut`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.finalize_stream.v1

Independent original stdout and stderr finalizers.

OriginalStreamFinalizer: Actual original pipe and complete inherited writer domain; EOF, full byte accounting and all parser jobs/partial-input error disposition; exact original normalized admissions and native gate. No historical raw stream recreation.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. EOF requires all original producers closed; complete parser jobs and partial input follow actual owner error/event path.
2. Lost buffered input, failed parser/read, unknown writer or missing original result cannot yield eof_and_parser_finalized.
3. Record authentic finalizer while holding native writer domain; zero items valid only with complete native zero chain.

Physical write participants: `executor_process_stream_finalization`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.commit_required_flush.v1

Actual mandatory durability stage.

OriginalRequiredFlushOperation: Actual original before_force or before_final_outcome Storage operation with every whole current EventRecord+registered payload, SP-286 first custody/full_value_result, whole CURRENT/manifest and complete read_token under append/maintenance fence; complete arrays of original cuts where several writers contribute.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Execute source frame writes+segment sync, manifest watermark promotion+required directory sync and original first-receipt custody durable commit.
2. Read full original/current sources via actual Storage boundary; respect original receipt coordinates vs current frontier/compaction translation.
3. Persist compact commitments only. Any required failure is sticky done.crashed; preserve diagnostic persistence failure. Empty stage invokes true durability boundary with real controls, no marker event/cursor-zero invention.

Physical write participants: `executor_process_required_flush`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.record_termination.v1

Original group termination assessment.

OriginalTerminationInputs: Complete original SignalResultPhysical set, terminal WaitResultPhysical for every actual member, before_force RequiredFlushRecordPhysical iff escalated, genuine original monotonic clock and enforced current containment/writer registry.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Require terminal waits for every actual process, no outside/untracked/escaped capability and current containment quiescence; root exit alone insufficient.
2. Preserve original grace/force references and sticky failures; unresolved member stays unresolved.

Physical write participants: `executor_process_termination_result`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.commit_shutdown_result.v1

Original process prerequisite result publication.

OriginalShutdownResultInputs: Exactly both original stream finalizations and all original required flush records plus full FlushResult readbacks, whole current native capability/membership sources and complete original origin chain.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. Resolved only with original group terminal, all capabilities revoked, both streams authentic EOF-finalized, final flush durable and pre-force flush durable iff forced, no crash/failure branch.
2. Required flush failure remains done.crashed; genuinely clean cancelled path requires done.cancelled even if force occurred; no Workflow/Goal done emission.
3. Persist unchanged first original result/origin; this result does not resolve external FileSafe/tool/remote effects.

Physical write participants: `executor_process_shutdown_result`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.record_crash_recovery.v1

Original unfinished-run recovery.

OriginalCrashRecoveryInputs: Actual unfinished original run and pending shutdown custody, old/current native hosts, original result if it exists, last durable whole Storage recovery state and canonical terminal EventRecord if present; actual original Run Modes recovery owner authority.

Every call requires the complete OriginalProcessOperationBoundary defined at the start of these exact private methods.

1. No canonical terminal implies done.crashed/crash_recovered; unknown Storage loss and flush failure remain sticky.
2. Authenticate original native scope using persistent owner/OS authority; no PID scan success or new process/old-birth fabrication.
3. Existing result read unchanged only with whole current boundary; lost raw input cannot be reconstructed.

Physical write participants: `executor_process_shutdown_recovery`, `executor_process_source_origin`, `executor_process_source_head`.

##### owner.executor.process_source.read_current.v1

Read-only process prerequisite disposition.

CurrentProcessReadBoundary: Independently acquire genuine current supervisor/source/permission/retention/codec/backup/hold/deletion, root/Stop/census and membership/capability fences; privately resolve source from each genuine root/child admission.

1. Resolve whole ProcessShutdownSources and every physical source/origin/current head plus all complete C admissions/origins/Stop and whole original/current Storage readback.
2. Validate complete immutable sequence no gap/fork, exact key codec/hash, all invocation/host/process/operation joins and every stop census member owned by group.
3. Repeat complete native/source/owner/Stop/permission/hold/backup/codec/deletion boundary before and after all helpers and immediately before release; prior result is not transferable authority.
4. Return unresolved/unavailable for missing original/current sources or unsupported route; resolved assessment gives no action authority or whole-workflow safeStop.

Physical write participants: none; passive read only.

For every method above, failed/unknown original commit or changed native boundary returns the complete original Unavailable branch with action_authority=none; no committed output is fabricated. Genuinely committed intermediate records keep their exact nonterminal status and never imply effect resolution. Preserve the original pending operation and unknown inventory membership; recovery is restricted to the genuine same operation. Every entry independently derives the complete permissible source/candidate union before helpers and repeats its whole native/source/permission/Stop/codec/retention/backup/hold/deletion/root-generation predicate after all returning helpers with no subsequent helper, callback, await, logger or mutable gap before its own commit or passive disclosure. The outer joint publisher independently checks the complete union, including preserved members. Prior caller checks never authorize a lower entry.

#### Event registry, terminal caller and remaining proof boundary

The active `goal_run.started` and `goal_run.cancelled` family rows remain their whole v2 registrations. The exact new v3 payload schemas are source dependencies, not an active v3 event-registry selection. Original v3 Workflow publication remains unavailable until the separate complete original v3 reader/consumer/projector/checkpoint and registry contract is adopted. This contract supplies no event-depth pass and cannot borrow Executor `run.started` qualification or replace a full EventRecord claim with receipt-only custody.

Positive D06 has a separate originally registered terminal-service source boundary and its own required first append barrier. It does not mutate D05's sealed work queues, capability/admission history, final flush or sticky failures. If SP-305's actual outer Goal operation holds a competing pre-reserved sequence/segment/offset append/rotation fence, D06 remains unavailable until the original Goal/Storage owner supplies its explicit compatible caller/assignment successor. No foreign lock release, fake receipt, omitted event, widened numeric domain or generic post-cut exception is admitted. D05 imports no future D06 result, event or Goal terminal; the positive consumer imports complete fresh D05 readback.

RequiredCheckpointSuccess remains false. Every actual required checkpoint, unsupported pre-attempt effect, unknown capability/obligation, pooled/shared process, arbitrary callback or unsupported role remains unresolved in the complete original census. The admitted product controls, default pooling, Stop priority, independent effect ownership and all source/raw lifetimes remain unchanged. No original source is recreated from a schema, event projection, surviving hash, current body, PID scan or new producer operation.

Source/schema checks establish no native installation, actual capability/root authentication, source execution, exhaustive native enrollment, concurrent exclusion, exact codec execution, cross-store atomicity/fsync/crash behavior, complete current/retained replay, backup/restore or outer Goal integration. Those runtime proofs remain NOT_RUN. No runtime launch, global D05 closure, event-depth pass, WorkNode/NodeSeed/readiness admission or governance seal follows.

```yaml
plan_unit_id: EP-119
unit_type: schema_contract
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Original bounded safe-stop, FileSafe and disposable Process sources. Native allocation enrollment
  precedes every reserved-run capability; the whole original census includes every generation, pre-attempt effect,
  unknown member and actual obligation.
gui_related: false
gui_classification_reason: Defines original runtime source, owner, storage and verification semantics without a
  visual surface.
split_recommended: false
depends_on:
- EP-118
- EP-115
- GRS-073
- GRS-075
- SP-308
unblocks: []
acceptance_criteria:
- Native allocation enrollment precedes every reserved-run capability; the whole original census includes every
  generation, pre-attempt effect, unknown member and actual obligation.
- Only genuine zero invocations or fully owned FileSafe and disposable unshared Unix MCP Process dispositions can
  enter the bounded positive partition; unsupported effects and checkpoints remain unresolved.
- All required flush attempts remain in authentic original history; any required flush failure remains sticky and
  an empty event set still performs its required original barrier.
- Every original upper/lower method, helper and reader independently enforces complete source and final native predicates;
  sealed work queues cannot be reopened by terminal publication.
validation_surfaces:
- Plans/executor_cancellation_contracts/methods.json
- Plans/executor_cancellation_contracts/realm-entry-boundaries.json
- Plans/executor_cancellation_contracts/physical-families.json
- Plans/executor_cancellation_schema_resources.json
- Plans/storage_value_registry.json
risk_class: original_workflow_source_custody_or_native_admission_drift
reasoning_tier: high
context_scope: ep_119_original_source_contract
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/executor_cancellation_contracts/methods.json
- Plans/executor_cancellation_contracts/realm-entry-boundaries.json
- Plans/executor_cancellation_contracts/physical-families.json
- Plans/executor_cancellation_schema_resources.json
source_atom_ids: []
negative_constraints:
- No public command, event-membership, Goal lifecycle or retention-policy expansion.
- No fabricated source, absence, origin, receipt, current body, native authority or retrospective original enrollment.
- No numeric coercion, lossy codec, hidden effect/census member or required-flush failure removal.
- No WorkNode/NodeSeed/runtime/readiness/event-depth/global safe-stop or governance claim from source adoption.
```

ContractRef: ContractName:Plans/executor_cancellation_contracts/methods.json, ContractName:Plans/executor_cancellation_contracts/realm-entry-boundaries.json, ContractName:Plans/executor_cancellation_contracts/physical-families.json, ContractName:Plans/executor_cancellation_schema_resources.json
