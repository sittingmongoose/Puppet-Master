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

1. Evaluate readiness predicate over all queued nodes.
2. Select smallest lexical `node_id` among ready set.
3. Dispatch Builder for selected node.
4. On Builder completion, set `verify_pending` and dispatch Verifier.
5. Apply auto-marking rule from Section 4 (`verified` → `done` on pass; `failed` on fail).
6. Repeat until no ready nodes remain.

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

### EP-001 - Overseer Protocol (Canonical) Source-Preserving PlanUnit

```yaml
plan_unit_id: EP-001
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Plans/Executor_Protocol.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Executor_Protocol-S0067
preserved_exact_tokens:
- Overseer Protocol (Canonical)
- Canonical owner-section requirements
- Retire tier-era canon and shadow fields
- Identity and blocked-policy transfer cluster
- Coverage blocker provider/model precedence owner section
- Approval scope key and approver identity
- 0. Purpose and scope
- 'ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Progression_Gates.md'
- 1. Role definitions
- 1.1 Builder / node worker
- 1.2 Verifier / reviewer / corroborator
- 1.3 Package Overseer
- 1.4 Seam Overseer
- 1.5 Runtime scheduler
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/orchestrator-subagent-integration.md'
- 2. Deterministic readiness
- 'ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/project_plan_graph_index.schema.json'
- 'ContractRef: PolicyRule:Decision_Policy.md§3, ContractName:Plans/Spec_Lock.json'
- 'ContractRef: ContractName:Plans/Spec_Lock.json, ContractName:Plans/Executor_Protocol.md'
- 3. Canonical status lifecycle
- 'ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Executor_Protocol.md'
- 4. Auto-marking rule
- 'ContractRef: ContractName:Plans/Progression_Gates.md#GATE-005, ContractName:Plans/evidence.schema.json'
- 'ContractRef: ContractName:Plans/plan_graph.schema.json, ContractName:Plans/project_plan_node.schema.json'
negative_constraints:
- Overseer MUST NOT infer execution state from index metadata alone.
- '- User-project nodes MUST NOT invent ad-hoc schema-version key names.'
- 'UI/orchestrator labels such as `waiting_approval`, `needs_review`, `cancelled`, or `complete_with_warnings` are **run-local overlays / CTA states**, not canonical node `status` values in this protocol. Such overlays MUST be persisted as separate events or projections and MUST NOT replace the status '
- Manual mark-complete action MUST NOT be required for verified nodes.
- '- Worktree-aware projections must not assume one active-worktree or current-worktree scalar. File tree surfaces, artifact roots, `/worktree` displays, and safe-point payloads read active package-lane worktree sets, because rewrite-era surface ownership mixed with tier-era execution/worktree identity'
- '- `Progress` remains widget-composed, but default widget contracts must not reintroduce tier-era or `tier_id` ownership. `Plans/usage-feature.md` (`usage-feature.md`) is consumed only through run/node/attempt/package/lane usage identity when Executor receipts or progress projections need cost and us'
- '- Route payloads must not absorb filter or `/subview` noise and become surface-shaped again. Once Executor has the runtime contract, stale route examples are a consumer-doc sourcing problem, not a missing-runtime-contract problem.'
- A run MUST NOT be marked complete when any required Document Set audit (reconstruction/line accounting/idempotency, index-manifest match, clean-room determinism) fails.
- '- unrelated blocked or waiting nodes MUST NOT stall runnable work elsewhere in the graph'
- The executor's retry/classification consumer surface spans `### 7.1 Classified outcome matrix`, `### 7.2 Doom-loop guard`, `### 7.3 Signal handling and process lifecycle`, and `### Blocked and retry behavior`; together those anchors are the executor `/classification/lifecycle` projection and must no
- Safe points are runtime recovery anchors. They are not user-facing restore points and MUST NOT be conflated with thread rewind/rollback semantics.
- '- canonical graph execution MUST NOT silently flatten or otherwise degrade invalid canonical graphs'
- '- A `text-only` projection is not a fallback mode for required rich execution surfaces; the executor MUST NOT silently degrade required artifacts, tool outputs, or browser/web surfaces to text-only output.'
- The executor treats rich `/editor-agent` and `/workbench` surfaces as runtime peers of terminal, browser, document, and artifact callers. `/plugin-first` and command-first entry points, `/rules/skills` guided plans, multi-surface review loops, `/persisted` tabs and `/splits/windows`, and `/history/n
- Runtime context summarization should stay PM-native. The executor must not transplant a provider `_context_updates` protocol as-is; PM treats that protocol as a reference for incremental tool-result compression driven on every tool call, then emits its own context-detail and compaction updates so to
- '- Cursor-native managed instructions target `.cursor/rules/*.mdc` and the `.cursor/rules` tree; `.cursorrules` is legacy compatibility only and must not be the primary managed target. Compatibility outputs such as `AGENTS.md`, `CLAUDE.md`, root-level files, or provider-native projected copies are op'
- '- one decision path must not treat the same situation as both a failure class and a blocked-episode cause.'
- For MVP cleanup, the executor uses the canonical workspace or `/remote` project binding plus safe points, restore points, and explicit temporary-vs-durable mutation lineage. It must not require sandbox worktree `/jail` semantics for ordinary debug instrumentation cleanup.
- Invalid pre-lock draft decomposition may degrade to deterministic flat draft sequencing with warning evidence. Invalid canonical graphs after graph lock are `graph_integrity` failures and MUST NOT silently degrade.
- '- `startup_recovered` and startup-recovery handshakes restore the existing blocked-episode and `blocked_sequence` when one exists; recovery MUST NOT cause silent block-loss or accidental episode reminting.'
- After graph lock, execution MUST NOT fall back to a planning-artifact-centric, identity-blind, single-branch execution-model; DAE and orchestration paths preserve runtime identity plus `/corroboration/promotion/runtime` context.
- '- Compatibility adapters MAY derive the retired tier-era context object only for legacy selector translation or decomposition, but they MUST NOT persist, exchange, or rehydrate it as the live runtime contract.'
- '- Independent policy counters MUST NOT be inferred by subtracting from `attempt_count`.'
- '1. **Per-node sequential**: All events for a given `node_id` MUST be processed in emission order. The event bus MUST NOT reorder events within a single node''s event stream.'
compatibility_only_notes:
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- '- Any surviving `tier` language is compatibility or derived-view vocabulary only. `Plans/human-in-the-loop.md` (`human-in-the-loop.md`) may remain a strong tier-era owner doc for approval UX, but `Plans/Executor_Protocol.md` (`Executor_Protocol.md`) owns this runtime seam and is already ahead of it;'
- '- Governance layering is graph-based rather than tier-based: older `Overseer` execution-role language is retained only as compatibility framing, while a `work package overseer` owns package-local delivery/readiness truth and a `same-feature-seam overseer` owns same-feature-seam integration truth acr'
- '- Runtime scheduling consumes package/seam/lane and sharded-node state from durable runtime records such as seglog/redb-backed projections; `active-agents`, `TierType`, `TierContext`, and `/seams` compatibility labels cannot define executor lane ownership or hardcoded subagent registries.'
- '- Background agent queues integrate with the Lane scheduler through package lane pools; snapshot consumers must resolve snapshot/safe-point ambiguity to `/safe-point/runtime` records, while `tier` / `subtask` queue labels remain compatibility lineage rather than package-lane ownership.'
- '- Event and widget projections translate `run.tier_`, `run.tier_*`, `tier_tree`, and `Tiers` into seam/worktree/package-native, `/worktree/package-native`, and `/package/lane-aware` runtime events; live-status consumers read canonical runtime records and projections, while `PuppetMasterEvent` and `P'
- '- Concern `/resolution` records are first-class runtime objects created by runtime, package overseer, seam overseer, corroboration outcome, graph patch, or graph `/state-transition` logic; workers may nominate findings, but `/escalate/downgrade` actions update concern state through the concern owner'
- When `verifier_result.outcome == "pass"` and the evidence bundle exists and validates, Overseer MUST first set node `status = "verified"`, then immediately transition to `status = "done"`.
- Stale local worker identity names such as `requested_persona_id`, `effective_persona_id`, `_persona_id`, and `/values` persona slots are compatibility inputs only; provider and model choices remain precedence inputs that must resolve into `execution_unit_context` identity fields before dispatch.
- '- dispatch, recovery, remediation, and inspection read one execution-unit packet rather than tier-era compatibility objects.'
- '- Runtime `/artifact` and tool drills carry attempt identity: `artifact_id`, attempt/`/receipt-based` refs, `tool_name`, invocation summary or `invocation_summary`, options, and `usage_event_ref` remain secondary detail refs under `execution_unit_context`; node-only or re-describing action contracts'
- '- Wizard, Builder, settings/GUI, and CUP pre-run handoffs carry requested/effective account identity, `/account/role` disclosure, actor/role, execution-role/`execution_role`, `/model` plus provider/model/persona policy, `/governance`, explicit `/isolation` and worktree mode, and `/package/seam` laun'
- '- Compatibility adapters may derive `decomposition_context` or `selection_context` for selector translation, but those objects are optional disclosure or planning views only; `execution_unit_context` remains the canonical object for dispatch, recovery, remediation, and runtime inspection.'
- '- The attempt-native handoff identity includes `run_id`, `node_id`, `attempt_id`, `scheduler_pass_id`, and lineage metadata before worker spawn. Those fields make resumed runtime inspection deterministic instead of reconstructing a partial handoff from tier-era compatibility objects.'
- '- Usage correlation follows `usage_event_ref` plus run/node/attempt/package/lane identity; tier-era usage correlation and `usage-event` shorthand are compatibility only.'
- '- Route pivots normalize `object_kind = worktree` plus `/seam/package/concern/promotion` subjects through `object_kind` route targets, not filter-shaped payloads; `resume_url` is transport compatibility, and blocked-thread messages resolve to shared route/runtime actions.'
- '- `Overseer` remains user-visible / doc-visible where this protocol title and legacy role framing require it, but `/runtime` worker copy prefers `overseer-spawned node worker`; `delegated worker` is a vague compatibility label, not the canonical execution actor name.'
- '- no consumer in this document may revive legacy approval arrays, opaque recovery option lists, or tier-era compatibility nouns.'
- Provider-transient retry evidence preserves the explicit `1s -> 2s -> 4s` sequence and the compatibility shorthand `/2s/4s`; retry counters are per-error after classification, not a shared global retry bucket. Doom-loop matching uses `(tool_name, args_hash, error_message)`, where `serialized_args_ha
- 'Storage and usage alignment consumes `### 2.4 Projector pipeline`, `## 3. Implementation checklist`, and `### 8.3 Startup and shutdown` from `Plans/storage-plan.md`, plus `### Canonical usage pipeline` from `Plans/usage-feature.md` (`/usage-feature.md`). Executor receipts carry `checkpoint-marker`, '
- 'Helper and background attempts remain first-class usage contributors: `/helper/background` lineage must be represented in the execution receipt and projected usage record instead of disappearing into generic background work. Prompt/context handoff preserves implementation-grade `/context` continuati'
- 'Lifecycle shutdown consumers treat shutdown as `/idempotent`: double shutdown is guarded with a Once/idempotent root and becomes a safe no-op rather than a second destructive lifecycle transition.'
- '- Cursor-native managed instructions target `.cursor/rules/*.mdc` and the `.cursor/rules` tree; `.cursorrules` is legacy compatibility only and must not be the primary managed target. Compatibility outputs such as `AGENTS.md`, `CLAUDE.md`, root-level files, or provider-native projected copies are op'
- '### Tier-era compatibility retirement'
stale_retired_dispositions:
- '- A seam is not reconciliation-ready while it lacks a canonical event/`/record` family or owner doc; when direction is already-set, `/reconciliation` work updates stale consumers to the owner contract instead of inventing replacement canon.'
- '- Cleanup `/reconciliation` moves stale `/tier` consumers to `/worktree/package/seam-aware` routing, `/effective/account/runtime` identity displays, canonical runtime actions, route payloads, and `/layout/help/glossary` terminology surfaces.'
- Stale local worker identity names such as `requested_persona_id`, `effective_persona_id`, `_persona_id`, and `/values` persona slots are compatibility inputs only; provider and model choices remain precedence inputs that must resolve into `execution_unit_context` identity fields before dispatch.
- '- Runtime safe points are recovery/audit anchors, not user-facing restore points; Assistant Chat blocked-state and `/runtime-identity` consumers must rely on `execution_unit_context`, `usage_event_ref`, and blocked records instead of stale closure verdicts.'
- '- A worktree-bound safe point is valid only while the referenced worktree identity is not contaminated and still matches the recorded fields; contamination or stale baseline must surface as a blocked/degraded recovery event.'
- '- Historical lineage must survive live worktree cleanup: run/package/node/lane references preserve `worktree_id`, worktree path, branch and HEAD snapshot, compare target or commit-range snapshot, and owning package/lane identity; when backing worktree is missing, consumers render `historical/retired'
- '- Wizard, Builder, settings/GUI, and CUP pre-run handoffs carry requested/effective account identity, `/account/role` disclosure, actor/role, execution-role/`execution_role`, `/model` plus provider/model/persona policy, `/governance`, explicit `/isolation` and worktree mode, and `/package/seam` laun'
- '- Route payloads must not absorb filter or `/subview` noise and become surface-shaped again. Once Executor has the runtime contract, stale route examples are a consumer-doc sourcing problem, not a missing-runtime-contract problem.'
- 'MCP tool inventory discovery around `listTools` is degraded, not unavailable: retry three times with 1s backoff, then use the last-known stale tool list until the five-minute periodic refresh succeeds. Failed discovery must never permanent-kill the executor, provider session, or run by itself.'
- Runtime context summarization should stay PM-native. The executor must not transplant a provider `_context_updates` protocol as-is; PM treats that protocol as a reference for incremental tool-result compression driven on every tool call, then emits its own context-detail and compaction updates so to
- '- HTE and DAE execution paths share graph-lock and write-scope safety: `/generation` staleness, under-owned `/degradation`, cleanup-remediation loops, FileSafe bypass, side-effect and remote side-effect uncertainty, safe-point/restore-point conflicts, and projection trust failures surface as blocked'
- '- The retired tier-era context object is a derived or compatibility-only selection/decomposition helper.'
- '- The retired tier-era context object and the retired tier-era identifier are not canonical runtime fields; execution_unit_context together with execution_unit_type defines authoritative runtime scope.'
- '- Worker spawn MUST mint or receive execution_unit_context before dispatch, and recovery plus remediation MUST rehydrate that same packet rather than reconstruct runtime scope from retired tier-era compatibility fields.'
- '- Compatibility adapters MAY derive the retired tier-era context object only for legacy selector translation or decomposition, but they MUST NOT persist, exchange, or rehydrate it as the live runtime contract.'
- '- Attempts, safe points, and blocked projections created under generation N become stale when generation increments to N+1.'
- '- Stale attempts remain queryable for audit but are never resumable.'
owner_boundary_notes:
- '# Overseer Protocol (Canonical)'
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- '### Coverage blocker provider/model precedence owner section'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- For user projects, canonical entrypoint and derived-export policy are defined in `Plans/Project_Output_Artifacts.md` (`.puppet-master/project/plan_graph/index.json` canonical; monolithic export is optional/non-canonical).
- The canonical owner of readiness, blocked state, transitions, retry budgets, wakeups, and dispatch.
- '- most node execution may be performed through overseer-spawned node workers, but runtime still owns canonical execution state'
- '- Executor is the runtime SSOT for attempt state across `/seam/lane/work-package` identity: no HTE-by-default mode is assumed, and HITL is represented as explicit blocked/approval boundaries rather than hidden scheduler behavior.'
- '- Any surviving `tier` language is compatibility or derived-view vocabulary only. `Plans/human-in-the-loop.md` (`human-in-the-loop.md`) may remain a strong tier-era owner doc for approval UX, but `Plans/Executor_Protocol.md` (`Executor_Protocol.md`) owns this runtime seam and is already ahead of it;'
- '- Governance layering is graph-based rather than tier-based: older `Overseer` execution-role language is retained only as compatibility framing, while a `work package overseer` owns package-local delivery/readiness truth and a `same-feature-seam overseer` owns same-feature-seam integration truth acr'
- '- The graph-canonical `/control` loop is not a single giant agent walking the whole graph; runtime-core pressure-testing preserves a dual-overseer model: package and seam overseers govern spawned workers through `/model`, `/review`, scheduler evidence, and explicit runtime control records.'
- '- Event and widget projections translate `run.tier_`, `run.tier_*`, `tier_tree`, and `Tiers` into seam/worktree/package-native, `/worktree/package-native`, and `/package/lane-aware` runtime events; live-status consumers read canonical runtime records and projections, while `PuppetMasterEvent` and `P'
- '- Concern `/resolution` records are first-class runtime objects created by runtime, package overseer, seam overseer, corroboration outcome, graph patch, or graph `/state-transition` logic; workers may nominate findings, but `/escalate/downgrade` actions update concern state through the concern owner'
- '- A seam is not reconciliation-ready while it lacks a canonical event/`/record` family or owner doc; when direction is already-set, `/reconciliation` work updates stale consumers to the owner contract instead of inventing replacement canon.'
- '- Cleanup `/reconciliation` moves stale `/tier` consumers to `/worktree/package/seam-aware` routing, `/effective/account/runtime` identity displays, canonical runtime actions, route payloads, and `/layout/help/glossary` terminology surfaces.'
- 'Overseer MUST read node execution state from the canonical node document:'
- '- Every `blockers[]` entry MUST resolve to an existing canonical node document.'
- '## 3. Canonical status lifecycle'
- 'UI/orchestrator labels such as `waiting_approval`, `needs_review`, `cancelled`, or `complete_with_warnings` are **run-local overlays / CTA states**, not canonical node `status` values in this protocol. Such overlays MUST be persisted as separate events or projections and MUST NOT replace the status '
- The canonical dispatch/runtime packet carries `execution_unit_context`.
- '| `run_id` | Canonical run identity for execution lineage. |'
- '| `node_id` | Canonical node identity for dispatch and receipts. |'
owner_hints:
- Plans/Executor_Protocol.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `fd77b8360e92673ca0bf6bad5015f8075a545c30216b71a5df0107f1e8db47f3`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Executor_Protocol-S0001` through `Executor_Protocol-S0067` are preserved in place and mapped in `coverage_map.jsonl` to `EP-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
