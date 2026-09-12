# Shard 031: Cumulative v3 Goal Activity Detail and Plan Binding Specification (2026-09-07)

Source: `Plans/Goal_Runtime_System.md`

Source lines: L5453-L5841

Source SHA256: `6a6889932369937d6023727e803270f36aab868fb2fea4d157dc1aee00d3f48b`

---

## Cumulative v3 Goal Activity Detail and Plan Binding Specification (2026-09-07)

This section incorporates the cumulative Goal V2 Activity Detail presentation, concise information
hierarchy, and bound PlanRun synchronization in accordance with APR-059 and retained v2 contracts.

### 18. Goal Activity Detail Presentation and Bound Plan Synchronization (APR-059)

- **Concise Hierarchy and Objective Control:** Goal Activity Detail presents a focused, compact view:
  1. *Objective Headline:* Current approved goal objective with inline Edit affordance.
  2. *Inline Edit Controls:* Save and Cancel controls appearing only when editing the objective text.
  3. *Lifecycle Status and Action Row:* Clear primary status badge and quiet action buttons: Pause,
     Resume, and Cancel.
  4. *Revision History:* Chronological log of objective revisions and lifecycle state transitions.
  5. *Bound Plan Linking:* Direct clickable route link to the bound Plan; Plan Details links back to
     the Goal.
- **Surface Invariants:** No Goal thread card is rendered in the chat transcript. The objective text
  is never duplicated as a Plan card section. Goal and To-Dos reside strictly in the Activity panel,
  preserving hover and pinned detail controls.
- **Reference-Layout Supersession (USER-REFERENCE-LAYOUT-ROLLBACK-20260908):** Per user correction
  USER-REFERENCE-LAYOUT-ROLLBACK-20260908, Goal Activity Detail presentation restores native card and
  panel hierarchy rather than reference-derived forced flat-row CSS, strictly preserving Simple Goal
  objective editing, lifecycle actions (Pause, Resume, Cancel), revision history, and bidirectional PlanRun links.

```yaml
plan_unit_id: GRS-058
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Activity Detail projects a concise hierarchy featuring objective headline, inline Edit/Save/Cancel
  controls, lifecycle actions (Pause, Resume, Cancel), revision history, and direct bidirectional links
  to the bound PlanRun. Goal state remains strictly in Activity without transcript cards or duplicated
  objective sections on Plan cards.
gui_related: true
gui_classification_reason: Governs Goal Activity Detail presentation, objective editing, and bound Plan navigation.
depends_on: [GRS-057]
unblocks: []
acceptance_criteria:
  - Goal Activity Detail shows objective, inline editing, lifecycle buttons, and revision history.
  - Bidirectional links connect Goal Activity Detail and the bound Plan.
  - No Goal transcript cards are created; objective is not duplicated on Plan cards.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: goal_surface_duplication_or_hierarchy_drift
reasoning_tier: standard
context_scope: goal_ui_projection
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/FinalGUISpec.md
  - Plans/Assistant_Plan_Runtime.md
node_compile_hint:
  mode: goal_ui_specification
  create_worknodes: false
source_lineage:
  - APR-059
preserved_exact_tokens:
  - "Goal Activity Detail"
  - "inline edit"
  - "bidirectional links"
negative_constraints:
  - Do not render Goal state as a transcript card.
  - Do not duplicate Goal objective text inside the Plan card.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Assistant_Plan_Runtime.md

### GRS-060 - Historical child-status event disposition

```yaml
plan_unit_id: GRS-060
unit_type: constraint
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: Current Goal Runtime admits no goal.child_status_changed producer because child Goals
  and child topology are retired. Existing authoritative schema and D-R03 rules validate genuine historical
  observations only; the exact Storage adapter cannot supply current GoalRecordV2 state, parent completion,
  child projection, continuation or work allocation.
gui_related: true
gui_classification_reason: 'Historical data and active Goal presentation must remain distinct: these rules
  constrain visible lifecycle states, child topology, recovery quality and actionable controls.'
split_recommended: false
depends_on:
- GRS-052
- DL-039
- DL-045
unblocks: []
acceptance_criteria:
- No command, host continuation, subagent callback, retry, migration upgrader or parent transition may
  append goal.child_status_changed, and no To-Do, workflow participant or separate Goal is translated
  into it.
- D-R03 historical original identities, legal transitions, evidence refs and absence-means-false parent_action_required
  semantics are preserved without modifying bytes or executing the old state machine.
- Only the exact read-only Storage adapter exposes one historical record and validity disposition; it
  creates no child tree/card/GUI and active Goal views cannot ingest it as lifecycle or completion authority.
- Reader withdrawal disables interpretation while preserving original registered source and retention;
  it admits no replacement writer and decides no sibling event disposition.
validation_surfaces:
- Plans/goal_child_status_history_contract_fixtures.json
- Plans/event_payloads/goal_runtime/goal_child_status_changed.schema.json
- Plans/event_family_registry.json
- Plans/storage_value_registry.json
risk_class: retired_goal_child_writer_reintroduction
reasoning_tier: high
context_scope: goal_child_status_historical_event
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: goal_child_status_history_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Goal_Runtime_System.md#GRS-052
preserved_exact_tokens:
- goal.child_status_changed
- pm.goal_runtime_event.goal_child_status_changed.schema.v2
- RP-AUTHORITY-INDEFINITE
- none_required
- projector_replay_only
negative_constraints:
- No event/schema/registry/physical/policy mutation, sibling disposition, new child topology, To-Do translation,
  runtime proof, WorkNode/readiness admission or governance seal.
- No current append success from historical dedupe, guessed source custody, unresolved generic checkpoint,
  read-triggered write or fabricated historical default.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
```

For exactly `goal.child_status_changed`, current Goal scope and the retirement of child Goals control emission. There is no active producer, command, host continuation, subagent callback, retry, migration upgrader or parent transition authorized to append this event. Registration and DL-039's authoritative v2 schema preserve validation and custody of genuine historical records; they do not restore child topology. No To-Do, Collaborative Workflow participant or separate Goal is translated into this event. The existing family membership, version, schema bytes and retention assignment remain unchanged.

D-R03 is historical interpretation only for this row. Preserve its original child identity, previous/next historical statuses, optional lease/result/receipt refs and the absence-means-false `parent_action_required` interpretation. Do not insert that optional default into stored bytes. Completed requires the original receipt ref; failed/blocked/degraded requires result or receipt ref. A child cannot complete its parent; historical parent state was preserved, and legal historical child transition/revision/reference predicates remain diagnostic validity requirements. Missing historical predecessor/receipt evidence is unresolved validation, never proof of current completion. These historical predicates neither instantiate a GoalRecordV2 nor execute an old state machine.

The sole family-specific consumer binding is the new Storage-owned read adapter `storage.goal_child_status_history_read.v1@1.0.0` in SP-271, used by the existing read-only EventRecord inspection path. It exposes one exact historical source record and validation disposition per lookup, without a tree, actionable child card or new GUI. Active Goal views never ingest the record as lifecycle state, completion, budget, work allocation or continuation evidence.

This exact-row qualification applies to the older event-log list, D-R03, v2 matrix and schema-authority prose wherever they could be read as current writer/projection admission. Other rows retain their own unresolved/adjudicated owner disposition. Withdrawal of this adapter disables interpretation only; it does not delete historical source or admit a replacement writer.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#0-scope, ContractName:Plans/Decision_Log.md#DL-039, ContractName:Plans/storage-plan.md#SP-271, ContractName:Plans/Contracts_V0.md#CV-334

### GRS-061 - Historical Goal degradation and current projection quality

```yaml
unit_type: requirement
status: accepted
gui_related: true
gui_classification_reason: 'Historical data and active Goal presentation must remain distinct: these rules
  constrain visible lifecycle states, child topology, recovery quality and actionable controls.'
split_recommended: false
unblocks: []
reasoning_tier: high
context_scope: goal_degraded_exact_family_historical_contract
validation_surfaces:
- Plans/goal_degraded_history_contract_fixtures.json
- Plans/event_payloads/goal_runtime/goal_degraded.schema.json
- Plans/goal_runtime_events.schema.json
- Plans/storage_value_registry.json
- python3 scripts/pm-plan-index.py validate
- Native exact-family retirement/read/recovery/action-spy oracles remain NOT_RUN.
node_compile_hint:
  mode: goal_degraded_historical_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Goal_Runtime_System.md#GRS-048
- Plans/Goal_Runtime_System.md#GRS-049
- Plans/Goal_Runtime_System.md#GRS-014
- EA-UND-0006-GOAL:D-R06
- Plans/Decision_Log.md#DL-045
source_atom_ids: []
negative_constraints:
- No blanket21 retirement, registry/schema/retention mutation, alias, new current producer, active Goal
  state, role/tier, phase/tranche/child/budget, To-Do or GoalRun translation.
- No native/runtime/readiness/gate/seal proof, canonical receipt reconstruction, automatic recovery/continuation,
  notification, Usage, approval or hold effect.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
plan_unit_id: GRS-061
owner_doc: Plans/Goal_Runtime_System.md
depends_on:
- GRS-048
- GRS-049
- GRS-050
- GRS-042
risk_class: retired_goal_degradation_reintroduced
implementation_surfaces:
- Plans/Goal_Runtime_System.md
canonical_text: 'The exact registered family `goal.degraded` is historical-only. This disposition follows
  GRS-048''s exclusive four-state GoalRecordV2 contract, D-R06''s explicit transition into the incompatible
  `degraded` Goal state, GRS-049''s retirement of Goal-owned certification tiers/role casts, and GRS-014''s
  explicit superseded status. It does not follow merely from absence in the eight-name Goal V2 list. DL-039
  preserves the existing authoritative `pm.goal_runtime_event.goal_degraded.schema.v2` validation root;
  schema promotion does not restore a retired lifecycle transition. The event stays registered with unchanged
  schema bytes, family revision, scope and retention. This ruling applies only to this exact event; it
  does not retire the other twenty roots.


  There is no current producer, Goal host callback, verifier callback, provider-fallback callback, storage-recovery
  callback, command, retry or upgrader authorized to append `goal.degraded`. No current Goal transitions
  into `degraded`, and no current record acquires a certification tier, structured scope, role cast, phase,
  tranche, child or budget to make this payload fit. Do not translate the event into a To-Do, Collaborative
  Workflow participant, GoalRun transition or substitute event. Current Goal state and continuation remain
  with GRS-048/050 and existing actual owner conditions.


  Historical D-R06 semantics remain intact for interpretation of genuine original bytes. Preserve exactly
  the seven degradation reasons, original affected_scope, residual_risk_refs, allowed_actions, exception
  refs, approval refs, revisions, actor and provider/model/account identities. Risks/actions were nonempty;
  exceptions and risk acceptance required their original evidence and approval-subset joins. The original
  state edge was created|scheduled|running|paused|verifying|repairing to degraded, with degraded-to-degraded
  requiring changed risk/currentness evidence; blocked/stopped/limit/terminal states could not silently
  degrade. The original strong/standard tier predicates remain historical diagnostics under their original
  contract, not requirements for a current Goal. A missing historical predecessor, tier, exception or
  approval proof is unresolved historical semantic validation, never a new Goal block on a missing verifier
  or an inferred completed receipt. Schema-valid historical bytes alone do not prove those referenced
  facts.


  Current GRS-042 recovery safeguards remain: canonical receipts are non-rebuildable, possible canonical
  gaps retain explicit provenance, and unresolved mutation/completion authority remains fenced until existing
  owner recovery. The word degraded in a survivor view describes the quality/completeness of that derived
  view, not a fifth GoalRecordV2 state and not authority to emit `goal.degraded`. Receipt/evidence views
  may retain their existing recovery provenance without running D-R06. Unknown authority cannot be laundered
  into completion. This qualification does not invent a new health field, enum, physical family or notification,
  and does not remove current integrity disclosure.


  The sole new family-specific read binding is `storage.goal_degraded_history_read.v1@1.0.0` in SP-277,
  over the existing read-only validated EventRecord inspection path. It returns one exact historical record
  with its validation/provenance disposition. Historical allowed_actions are displayed as original data
  only and never wired as live controls. The lookup cannot mutate GoalRecordV2, receipt, evidence/goal-state
  projection, continuation, approval, budget or recovery state. Withdrawal disables interpretation while
  preserving original source/receipt custody; it admits no replacement writer.'
acceptance_criteria:
- Exact GRS048 plus D-R06 transition and explicit GRS014/049 retirement establish this one historical-only
  event; omission from the eight-name list is not the proof.
- No current Goal producer/command/callback can emit goal.degraded or add degraded as a fifth state, while
  the authoritative schema and family membership remain unchanged.
- Historical reasons, scope, risks, actions, exception/approval evidence and state/revision predicates
  remain interpretable as original data; unresolved history cannot impose retired current verifier/tier
  policy.
- GRS042 projection quality/provenance and canonical-loss mutation/completion fences remain intact without
  active event/state admission.
- Original allowed_actions never dispatch; no Goal/To-Do/GoalRun transformation or sibling retirement
  is inferred.
preserved_exact_tokens:
- goal.degraded
- pm.goal_runtime_event.goal_degraded.schema.v2
- active|paused|blocked|completed
- D-R06
- GRS-042
- RP-AUTHORITY-INDEFINITE
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-061, ContractName:Plans/Contracts_V0.md#CV-335, ContractName:Plans/storage-plan.md#SP-277, ContractName:Plans/Decision_Log.md#DL-039

### GRS-062 - Exact historical Goal scheduling contract

```yaml
unit_type: requirement
status: accepted
gui_related: true
gui_classification_reason: 'Historical data and active Goal presentation must remain distinct: these rules
  constrain visible lifecycle states, child topology, recovery quality and actionable controls.'
split_recommended: false
unblocks: []
reasoning_tier: high
context_scope: goal_scheduled_exact_family_historical_contract
validation_surfaces:
- Plans/goal_scheduled_history_contract_fixtures.json
- Plans/event_payloads/goal_runtime/goal_scheduled.schema.json
- Plans/goal_runtime_events.schema.json
- Plans/storage_value_registry.json
- python3 scripts/pm-plan-index.py validate
- Native exact-family historical-read and scheduling action-spy oracles remain NOT_RUN.
node_compile_hint:
  mode: goal_scheduled_historical_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Goal_Runtime_System.md#GRS-048
- Plans/Goal_Runtime_System.md#GRS-050
- Plans/Goal_Runtime_System.md#GRS-051
- Plans/Scheduling_and_Quota_Resume.md
- EA-UND-0011-GOAL:D-R11
source_atom_ids: []
negative_constraints:
- No sibling disposition, registry/schema/retention mutation, alias, current producer, scheduled Goal
  state, Goal budget, child/phase/role, or GoalRun/To-Do/Plan conversion.
- No native/readiness/seal proof, canonical receipt reconstruction, timer/queue/dispatch/Usage/approval/hold/epoch
  effect, or shared-checkpoint waiver.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Scheduling_and_Quota_Resume.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
plan_unit_id: GRS-062
owner_doc: Plans/Goal_Runtime_System.md
depends_on:
- GRS-048
- GRS-050
- GRS-051
- GRS-042
- GRS-043
risk_class: retired_scheduled_goal_state_reintroduced
implementation_surfaces:
- Plans/Goal_Runtime_System.md
canonical_text: 'The exact existing `goal.scheduled` EventRecord has historical-only disposition and zero
  current writers. This follows the positive semantic conflict between D-R11''s required transition `created|paused|blocked|stopped
  -> scheduled` and GRS-048''s exclusive active GoalRecordV2 writer with exactly `active|paused|blocked|completed`.
  The destination scheduled is not an active Goal state. The row''s mandatory historical budget_snapshot_ref
  cannot authorize restoration of Goal-owned budgets. GRS-048/050/051 and Scheduling_and_Quota_Resume
  instead place eligibility, quota waiting, execution windows and resume with the actual run and Scheduling
  owner. Omission from the eight-name current event list is not sufficient evidence and is not the basis
  for this ruling. DL-039''s authoritative promotion of all twenty-one payload schemas remains intact;
  this exact registered row, version, original schema bytes and historical minima remain unchanged. No
  other event''s disposition is inferred.


  Current Goal hosts may still schedule eligible turns and consume the existing Scheduling service. That
  ordinary use of the word schedule does not mean entering the historical scheduled Goal state or appending
  goal.scheduled. An active Goal with its run waiting for quota remains active. A quota reset, window
  opening, dependency clearance, approval arrival or provider retry cannot override a manual Stop/Pause/Cancel;
  the existing user_stop_epoch and dispatch-time revalidation remain mandatory. GRS-050 evidence-gated
  continuation/completion and actual permission/recovery/owner blocks remain unchanged. This unit grants
  no admission to Scheduling''s separately named events or commands and invents no alias or translation
  to a scheduled message, ExecutionSchedule, GoalRun, To-Do, Plan or Collaborative Workflow object.


  No current producer, host callback, timer, recovery callback, command, retry or upgrader may append
  this exact event, even when its unchanged v2 schema validates, an old idempotency key matches, a run
  is eligible, or original next_action is dispatch. It cannot add scheduled, queue structure, Goal budget,
  phase, child or role fields to the active Goal. Current scheduling remains under its real owner conditions,
  not a backward conversion into the retired transition.


  Historical interpretation preserves all six scheduler_reason values (created, resumed, replanned, repair_cycle,
  dependency_cleared, capacity_available), four priority values (low, normal, high, critical), original
  eligible_at_utc, budget_snapshot_ref, optional queue_id and next_action. D-R11 allowed dispatch, await_dependency
  and await_approval only. Original dispatch required queue_id, eligibility at or before the original
  append observation, writer-capable storage, permission evidence, resolved recovery truth and remaining
  budget. Waiting did not dispatch and could omit queue_id. Historical blocked/stopped sources required
  explicit owner-admitted recovery/revalidation evidence; limit and terminal sources were illegal. Revision/CAS,
  actor/account/envelope and original idempotency identity joins remain historical diagnostics. Missing
  original prerequisite evidence is explicitly unresolved historical validation, not guessed validity,
  a newly issued schedule, or a requirement to manufacture a current Goal budget.


  Historical next_action and scheduler_reason are original data only. Inspecting dispatch cannot enqueue,
  create a timer, dispatch a turn, consume budget/quota, approve, resume, mutate an epoch, write a receipt,
  or change a Goal/GoalRun/To-Do state. The sole new exact-family read adapter is storage.goal_scheduled_history_read.v1@1.0.0
  under SP-280. It returns one provenance-validated original record, without projection or durable effect.
  Current canonical receipt non-rebuildability, degraded survivor-view quality/provenance and recovery/false-completion
  fences under GRS-042/043 remain in force; this disposition does not undo the separate child-status or
  degraded qualifications. Missing canonical authority stays fenced under the real owner. Withdrawal disables
  interpretation, preserves original custody, and grants no replacement producer.'
acceptance_criteria:
- Exact D-R11 destination conflicts with exclusive GRS048 current lifecycle; no omission or sibling inference
  establishes disposition.
- All21 authoritative schema roots and this existing registered family remain unchanged with zero current
  goal.scheduled writes.
- Current run scheduling, quota/window eligibility and stop-epoch precedence remain with their actual
  owners.
- Original six reasons, four priorities, three actions, eligibility/queue/budget/recovery/CAS predicates
  remain historical data and diagnostics, with unresolved original proof disclosed.
- Historical dispatch has no timer/queue/turn/approval/Usage/epoch/state effect and does not recreate
  Goal budget or remove recovery provenance.
preserved_exact_tokens:
- goal.scheduled
- pm.goal_runtime_event.goal_scheduled.schema.v2
- D-R11
- active|paused|blocked|completed
- user_stop_epoch
- RP-AUTHORITY-INDEFINITE
- RP-EVENT-INDEX-SOURCE
- none_required
- storage.goal_scheduled_history_read.v1
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-062, ContractName:Plans/Contracts_V0.md#CV-336, ContractName:Plans/storage-plan.md#SP-280, ContractName:Plans/Scheduling_and_Quota_Resume.md, ContractName:Plans/Decision_Log.md#DL-045
