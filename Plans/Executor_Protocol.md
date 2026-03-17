# Overseer Protocol (Canonical)

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
- conversational actors that share runtime identity semantics do not become orchestration nodes, packages, or seams

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

## 5. Node execution fields

The canonical dispatch/runtime packet carries `execution_unit_context`.

Required fields are:
- `project_id`
- `run_id`
- `node_id`
- `attempt_id`
- `feature_seam_id?`
- `work_package_id?`
- `lane_id?`
- `worktree_id?`
- `blocked_sequence?`
- `safe_point_id?`
- `remediation_root_id?`
- `graph_generation_id?`
- `execution_role`
- requested/effective runtime identity snapshot fields
- requested/effective account-binding fields
- `operational_identity?`
- `allowed_action_ids[]?`

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

Rules:
- `TierContext` does not remain the canonical execution context
- any surviving decomposition or view context is derived and non-canonical
- mutation, audit, blocked actions, and routing resolve through runtime identity anchored by run/node/attempt/blocked-sequence lineage

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md
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

Queue analysis MUST rerun immediately on:
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Orchestrator_Page.md
- node completion
- verification completion
- HITL approval or rejection resolution
- clarification resolution
- backoff expiry
- remediation completion
- replan patch application
- restore/recovery completion
- runtime capacity changes

Polling may exist only as a watchdog fallback and MUST NOT be the primary correctness mechanism.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md

### 6. Blocked-to-runnable cascade

When a dependency completes or a blocking condition clears:
- direct dependents are reevaluated immediately
- if now ready, they enter the ready set in the same scheduler wake cycle
- unrelated blocked or waiting nodes MUST NOT stall runnable work elsewhere in the graph
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Graph_View.md

### 7. Failure classes and retry entry points

The executor MUST classify failed or non-executed attempts into one canonical `failure_class` / `blocked_reason_code` family before deciding the next action.
ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md

Required classes:
- `provider_transient`
- `structured_output_invalid`
- `verification_failed`
- `reviewer_findings`
- `permission_denied`
- `user_declined`
- `headless_ask_denied`
- `filesafe_blocked`
- `external_side_effect_blocked`
- `auth_expired`
- `storage_io`
- `graph_integrity`
- `replan_required`

The executor MUST NOT apply generic retry behavior without classifying the attempt first.
ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/orchestrator-subagent-integration.md

### 8. Safe points

Before any mutation-capable node attempt, the executor MUST create or attach a runtime safe point.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/WorktreeGitImprovement.md

Required properties:
- `safe_point_id`
- `run_id`
- `node_id`
- `attempt_id`
- `worktree_path` or equivalent execution root
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
ContractRef: ContractName:Plans/Progression_Gates.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/chain-wizard-flexibility.md

### 11. Acceptance criteria

- Ready-node selection is no longer defined as pure lexicographic dispatch.
- Queue analysis explains why selected nodes won and why ready-but-unselected nodes did not.
- Parallel dispatch is capacity-aware and deterministic.
- Blocked-to-runnable cascade is explicit and event-driven.
- Safe points exist before risky execution.
- Retry behavior is class-driven, not generic.
- Canonical graph integrity failures do not silently degrade.
## Runtime Scheduler / Recovery Reconciliation Addendum (2026-03-09)

This addendum is normative and supersedes any earlier pure-lexicographic dispatch wording where they conflict.

### Canonical scheduler pass
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

### Score tuple
The canonical selection tuple is `(scheduler_lane, manual_priority, transitive_unblock_count, ready_since_utc, node_id)`.
- `scheduler_lane` order: `remediation > unblocker > normal`
- higher `manual_priority` wins
- higher `transitive_unblock_count` wins
- older `ready_since_utc` wins
- `node_id` is the final tiebreak only

No critical-path term is part of MVP selection.

### Wakeup triggers
Queue analysis MUST rerun on node completion, verification completion, approval resolution, clarification resolution, auth recovery, backoff expiry, remediation completion, restore completion, replan application, and capacity change. Polling is watchdog-only.
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Orchestrator_Page.md

### Blocked and retry behavior
The executor MUST classify every non-success outcome before applying policy. Canonical values include `provider_transient`, `structured_output_invalid`, `verification_failed`, `reviewer_findings`, `permission_denied`, `user_declined`, `headless_ask_denied`, `filesafe_blocked`, `external_side_effect_blocked`, `auth_expired`, `storage_io`, `graph_integrity`, and `replan_required`.
ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/orchestrator-subagent-integration.md

Generic blind retry is forbidden. Retry, backoff, remediation, rollback-to-safe-point, and escalation all flow from the classified outcome.

### Attempt identity and safe points
Every dispatch creates or reuses a first-class `attempt_id`. Mutation-capable attempts and remediation apply steps MUST create a runtime `safe_point_id` before execution. Safe points are runtime recovery anchors only; they are not restore points.
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md

### Remediation lineage
Automatic fix cycles attach to a parent attempt using `remediation_root_id`, `remediation_parent_attempt_id`, `remediation_generation`, finding identifiers, and final resolution state. A new canonical graph node is created only when a replan changes canonical graph scope.

### Degradation boundary
Invalid pre-lock draft decomposition may degrade to deterministic flat draft sequencing with warning evidence. Invalid canonical graphs after graph lock are `graph_integrity` failures and MUST NOT silently degrade.
ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Progression_Gates.md
## Canonical Runtime Scheduler Reconciliation Addendum (2026-03-09)

This addendum is normative and supersedes earlier pure-lexicographic readiness and dispatch wording wherever conflicting.

### Canonical readiness
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
### Canonical score term definitions
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

### Blocked-to-runnable cascade timing
When a dependency completes or a blocking condition clears:
- direct dependents are reevaluated synchronously in the same wake cycle
- newly ready nodes enter the same ready set before dispatch completes
- no extra scheduler pass is required just to notice a direct unblock

### Class-driven next-step rules
- pure capacity shortage is `non_selected_reason = capacity_deferred`, not a blocked state
- worktree merge/conflict or dirty-baseline problems block dispatch using `blocked_reason_code = worktree_conflict` or `dirty_worktree`
- `filesafe_blocked` is not retryable by default; if FileSafe declares `requires_safe_point_restore = true`, restore-before-rerun is mandatory even when generic matrix defaults would not normally roll back that class

### Graph-lock boundary
Draft decomposition fallback is allowed only before `run.graph_canonical_locked`.
After that event:
- invalid canonical graph structure is `graph_integrity`
- execution MUST stop accepting new dispatches
- no silent flattening or degraded canonical execution is allowed
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Progression_Gates.md, ContractName:Plans/chain-wizard-flexibility.md

### Attempt identity rule
Every retry, resume-after-prerequisite, or safe-point-restored rerun creates a new `attempt_id`. Prior attempts remain immutable historical records.
## Unified Runtime Scheduler and Attempt Lifecycle Reconciliation Addendum (2026-03-09)

This section supersedes earlier lexical-dispatch, attempt-reuse, and mixed blocked/failure wording in this file.

### Scheduler selection
- Canonical dispatch uses the scored ready-set tuple `(scheduler_lane, manual_priority, transitive_unblock_count, ready_since_utc, node_id)`.
- Lexicographic `node_id` ordering is only the final tiebreak and MUST NOT remain the active standalone scheduler rule.
- Slot shortage produces `non_selected_reason = capacity_deferred`; it does not create blocked state.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Policy.md

### Wake reasons and coalescing
Canonical `wake_reason` values are:
- `node_completed`
- `verification_completed`
- `approval_resolved`
- `clarification_resolved`
- `auth_recovered`
- `backoff_expired`
- `remediation_completed`
- `replan_applied`
- `restore_completed`
- `capacity_changed`
- `startup_recovered`
- `watchdog_recheck`

If multiple triggers coalesce into one scheduler pass, persist the first as `wake_reason` and the rest as `secondary_wake_reasons[]`.

### Outcome families
- `failure_class` is only for classified attempt outcomes.
- `blocked_reason_code` is only for unresolved prerequisites or intentionally prevented work.
- A blocked episode may carry `failure_class?` only when a failed attempt produced the blocked state.

### Attempt identity
- Every dispatch creates a new `attempt_id`.
- Retry, prerequisite resume, remediation rerun, and safe-point-restored rerun always create new attempts.
- Prior attempts remain immutable history.

### Mutation capability and safe points
- `mutation_capable` is sourced from the tool registry and propagated into the node plan record.
- Mutation-capable attempts create a safe point before execution unless policy explicitly says the attempt is non-mutating despite tool capability.
- `requires_safe_point_restore = true` on a blocked payload overrides generic rerun defaults.

### Capacity inputs
`available_slots` comes from one deterministic runtime view that combines run ceiling, lane ceilings, provider/resource saturation, remediation reservations, and worktree isolation constraints.

### Run-level deferred rule
- If any node is runnable, the run remains active.
- If no node is runnable and blocked/backoff/prerequisite-waiting work exists, the run is deferred/waiting rather than terminal.
- The next prerequisite resolution, backoff expiry, restore completion, remediation completion, or capacity change MUST wake the scheduler.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md
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
