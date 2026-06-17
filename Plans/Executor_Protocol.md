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

The canonical dispatch/runtime packet carries `execution_unit_context`.

**Authoritative execution_unit_context fields**

| Field | Requirement |
| --- | --- |
| `run_id` | Canonical run identity for execution lineage. |
| `node_id` | Canonical node identity for dispatch and receipts. |
| `attempt_id` | Immutable local execution-attempt identity. |
| `lane_id` | Lane identity when the node is lane-bound. |
| `package_id` | Package identity for orchestration joins. |
| `seam_id` | Seam identity when dispatch is feature-scoped. |
| `worktree_id` | Durable worktree identity when execution runs in a bound worktree. |
| `execution_role` | Canonical execution-role disclosure for the packet. |
| `requested_account_id` | Requested account identity before routing resolution. |
| `requested_account_binding` | Binding mode that distinguishes preference from requirement. |
| `requested_account_policy` | Requested account-policy selection for routing and approvals. |
| `effective_account_id` | Effective resolved account identity. |
| `operational_identity` | Stable runtime identity for audit and joins. |
| `blocked_sequence` | Blocked-episode anchor when execution is paused or recovered through blocked state. |
| `allowed_action_ids[]` | Ordered blocked-action set carried into recovery surfaces. |

Stale local worker identity names such as `requested_persona_id`, `effective_persona_id`, `_persona_id`, and `/values` persona slots are compatibility inputs only; provider and model choices remain precedence inputs that must resolve into `execution_unit_context` identity fields before dispatch.

Recommended `execution_role` values include `assistant`, `interviewer`, `requirements_builder`, `prd_builder`, `package_overseer`, `seam_overseer`, `node_worker`, `reviewer`, `corroborator`, and `recovery_actor`.

`execution_unit_context` is the node-native execution-core handoff that replaces or wraps `TierContext` between scheduler, worker spawn, verification, remediation, recovery, and UI projections.

ContractRef: Plans/Prompt_Pipeline.md#6.4 Effective resolution record, Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor, Plans/Crosswalk.md#3.1 Runtime orchestration ownership

### 5.1 Unified `DispatchContext` schema
The canonical dispatch view is the unified `DispatchContext` projection over `execution_unit_context`.

The canonical dispatch/runtime packet carries execution_unit_context.

Required fields:
- `run_id`
- `node_id`
- `attempt_id`
- `lane_id`
- `package_id`
- `seam_id`
- `worktree_id`
- `execution_role`
- `requested_account_id`
- `requested_account_binding`
- `requested_account_policy`
- `effective_account_id`
- `operational_identity`
- `blocked_sequence`
- `approval_scope_key`

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
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md

### 4. Capacity-aware parallel dispatch

The executor MUST select up to `available_slots` nodes per scheduler pass.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Graph_View.md

`available_slots` is derived from:
- run-level concurrency limit
- any active phase/task/subtask concurrency constraints
- resource / provider saturation limits
- remediation lane reservations when configured

Selection is global across the ready set, not level-by-level lexical dispatch.

### 5. Wakeup triggers

Canonical wake-trigger values and coalescing behavior are defined in `### Wake reasons and coalescing`.

This section is a forward-reference only so the wake-trigger canon has a single owner section in this file.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md

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
| `failure_class` | `storage_io` | 1 | brief delay | Yes | single retry on I/O failure |
| `failure_class` | `quota_exceeded` | 0 | — | No | user action or later retry window |
| `failure_class` | `graph_integrity` | 0 | — | No | hard fail; replan path only |
| `blocked_reason_code` | `replan_required` | 0 | — | No | remain blocked until patch or replan is applied |

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Contracts_V0.md

Per-class (`per-class`) retry rules:
- `provider_transient` uses exponential backoff with base `1s`, factor `2x`, and cap `4s`: `1s -> 2s -> 4s`
- `rate_limited` remains distinct from `provider_transient`; executor policy MUST preserve that distinction when deciding backoff, surfacing state, or opening circuit breakers
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


When Orchestrator or Assistant Chat creates an execution unit that should run inside a worktree, the execution context handoff includes worktree identity.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md

The execution context MUST include:
- `working_directory`: set to worktree root path (not project root) when worktree is bound
- `worktree_id`: identifier of the target worktree
- `worktree_branch`: branch name checked out in worktree
- `is_worktree`: bool flag distinguishing worktree context from main repo context

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

**Caller responsibilities:**
- Orchestrator sets these fields when launching a DAE in a lane-owned worktree
- Assistant Chat sets these fields when the active thread has a bound worktree and the user runs agent-mode or plan-mode work
- If `is_worktree` is false or absent, execution defaults to project root

For Assistant Chat, turn-start resolves `thread_state:{thread_id}:worktree_binding`, populates `execution_unit_context.worktree_id` and `working_directory`, and freezes both values for that turn. Mid-turn unbind changes apply only to the next turn or rotated follow-up. The executor propagates the frozen `working_directory` to FileSafe checks, tool invocations, bash/shell `cwd`, MCP tools, `@file` resolution, auto-retrieval scope context, and provider CLI or DAE execution-context JSON payloads. This is a cwd-based execution contract; it does not require separate prompt-only worktree injection.

**Executor responsibilities:**
- File operations resolve relative to `working_directory`
- Git operations target the worktree, not the main repo
- Terminal sessions start in `working_directory`
- LSP root identity uses worktree path when `is_worktree` is true
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
canonical_text: The canonical dispatch/runtime packet carries execution_unit_context with authoritative run, node, attempt, lane, package, seam, worktree, execution role, account, operational identity, blocked sequence, and allowed action fields; stale persona names are compatibility inputs only.
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
negative_constraints: []
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
canonical_text: DispatchContext is the canonical projection over execution_unit_context and carries required run, node, attempt, lane, package, seam, worktree, execution role, account, operational identity, blocked sequence, and approval_scope_key fields.
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
negative_constraints: []
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
canonical_text: Every retry, resume-after-prerequisite, or safe-point-restored rerun creates a new attempt_id; prior attempts remain immutable, and post-lock execution must preserve runtime identity plus corroboration/promotion/runtime context.
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
  carry worktree identity through execution_unit_context fields including
  working_directory, worktree_id, worktree_branch, and is_worktree.
gui_related: false
gui_classification_reason: This unit defines runtime handoff identity fields, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- working_directory is set to the worktree root path, not the project root, when a worktree is bound.
- worktree_id, worktree_branch, and is_worktree remain explicit identity fields in the handoff context.
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
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The handoff consumes Orchestrator, Run Modes, Assistant Chat, and storage contracts through explicit execution context fields.
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
  plan-mode work, and execution defaults to the project root when is_worktree is
  false or absent.
gui_related: false
gui_classification_reason: This unit defines caller runtime responsibilities, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- Orchestrator launch of a DAE in a lane-owned worktree sets the handoff fields.
- Assistant Chat bound-thread agent-mode and plan-mode work set the handoff fields.
- Missing or false is_worktree falls back to project-root execution.
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
compatibility_only_notes: []
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
- Git operations target the worktree, terminal sessions start in working_directory, and LSP root identity uses the worktree path when is_worktree is true.
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
- The executor does not recreate missing directories when a removed worktree makes the original path unavailable.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- FileManager, LSPSupport, and Commands_System consume this executor worktree resolution behavior.
owner_hints:
- Plans/Executor_Protocol.md
```

### EP-092 - Execution Unit Context Required Fields And Labels

```yaml
plan_unit_id: EP-092
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Execution-unit context preserves required run, node, attempt, lane, package,
  seam, role, account, operational identity, blocked sequence, and approval
  scope fields plus the canonical labels execution unit context and blocked
  episode.
gui_related: false
gui_classification_reason: This unit defines runtime identity schema and labels, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- All required fields from the source span remain explicit.
- Canonical terms and values duplicate the required fields so consumers use the same runtime vocabulary.
- The labels execution unit context and blocked episode remain preserved.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: executor_protocol_drift
reasoning_tier: standard
context_scope: executor_protocol_standardization
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: execution_unit_context_required_fields_and_labels
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Executor_Protocol-S0066
preserved_exact_tokens:
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
- execution unit context
- blocked episode
- 'ContractRef: Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Required identity fields align executor runtime scope with the canonical blocked-episode approval anchor.
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
  WorkNode requests become runnable only after Executor intake validates graph integrity, source-control requirements, test bindings, model routing, authority requirements, readiness prerequisites, and scheduler metadata. ExecutorIntakeReport is the boundary artifact proving that a WorkNodeRequest was accepted, rejected, or blocked. PlanCompile emits requests and WorkGraph drafts only; Executor owns runnable dispatch, ready-state evaluation, capacity-aware scheduling, retry/backoff, blocked-state recovery, and failure-class recovery.
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
  - future ExecutorIntakeReport schema validation
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
  Executor intake and dispatch must establish a source-control execution context and model-resolution context before mutation-capable work starts. The execution context preserves repo_id, worktree_id, worktree_path, baseline_commit_oid, safe_point_id, dirty_state_policy, conflict_policy, merge_policy, github_policy, rollback_available, and restore_command_or_action. Model routing preserves requested_lane, requested_model_profile, effective_model_profile, fallback_used, fallback_reason, and capability_checks. PlanCompile does not own source control; source control, worktrees, safe points, snapshots, rollback, FileSafe, and GitHub promotion apply after Executor accepts WorkNode requests.
  This PlanUnit is the source-control execution contract, and GitHub optional promotion cannot replace local execution truth.
gui_related: false
gui_classification_reason: Execution preflight and model receipt fields are backend runtime contracts.
depends_on: [EP-099, MS-111, W-072, F2-189]
unblocks: [EP-102, POA-048, RAP-029]
acceptance_criteria:
  - Mutation-capable WorkNodes have repo/worktree/baseline/safe-point context before risky execution.
  - Model resolution receipts are captured before dispatch and visible to receipt consumers.
  - GitHub is optional promotion/output and local source-control/worktree state remains execution truth.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future source_control_preflight_receipt validation
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
  Executor intake must validate WorkNode test_binding fields before dispatch: required capabilities, required harnesses, generated/reused tests, completion commands, browser/session requirements, emulator requirements, visual evidence requirements, flake policy, expected artifacts, and test_gap_policy. WorkNode completion cannot depend on human eyeballing. If automatic verification is unavailable, Executor blocks the WorkNode or requests test-harness work rather than marking it complete.
  Executor test intake preserves generated_test_ids, browser_session_required, visual_evidence_required, browser/GUI/device sessions, and manual_only_acceptance_not_allowed before completion is accepted.
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
  - future WorkNode test binding intake tests
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
  Executor repair loops preserve failure_signature records with kind, normalized_key, attempt_count, last_safe_point_id, last_repair_worknode_id, overseer_reviewed, auditor_reviewed, repeated_failure_policy, escalation_lane, user_escalation_allowed, and last evidence refs. Repeated failures escalate internally through normal repair, Auditor classification, Overseer graph/work/model/source-control/test-harness repair, High-Effort/Auditor deep repair, and only then critical user escalation unless explicit HITL policy requires earlier intervention. If Plans change during execution, PlanChangeDetected pauses affected lanes, a PlanDiffImpactReport classifies nodes as unaffected, needs_recompile, invalidated, or already_safe, and Executor resumes only after graph patching/replan work and currentness gates.
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
  The receipt chain preserves source_artifact, destination_artifact, retry_route, rollback_route, all WorkNodes terminal, all automated tests passed or dispositioned, and artifact-backed handoff evidence before code completion is certified.
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
  - future execution receipt chain validation
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
negative_constraints:
  - Do not accept worker says done as code completion.
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Runtime_Artifacts_Panel.md
```

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Models_System.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Runtime_Artifacts_Panel.md
