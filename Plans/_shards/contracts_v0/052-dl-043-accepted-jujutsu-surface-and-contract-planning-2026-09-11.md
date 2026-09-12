# Shard 052: DL-043 — Accepted Jujutsu Surface And Contract Planning (2026-09-11)

Source: `Plans/Contracts_V0.md`

Source lines: L21617-L22084

Source SHA256: `5e74f320e452ae42384cd6e7dfad4832d94ee1f995648499775a4188280bd3d4`

---

## DL-043 — Accepted Jujutsu Surface And Contract Planning (2026-09-11)

This addendum compiles accepted planning decisions only. Live semantic owners retain command admission, native behavior, authorization and evidence authority. Existing command schemas and production wiring remain unchanged.

### CV-330 — Jujutsu Planned Action Envelope Consumer Boundary

```yaml
plan_unit_id: CV-330
unit_type: integration_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Accepted Jujutsu action planning consumes the neutral Source Control envelope and Jujutsu-owned
  typed extensions rather than duplicating them. Expected native identities, writer and credential leases, Permissions/FileSafe
  decisions, idempotency and terminal receipt authority survive every internal-service and consumer boundary.
  This unit adds no schema field, event family or admitted command.
gui_related: false
gui_classification_reason: Defines envelope or authorization owner requirements rather than visual presentation.
depends_on:
- JJI-003
- SCS-018
- JJI-009
- JJI-012
- JJI-015
- JJI-018
unblocks: []
acceptance_criteria:
- Each planned request/result binds repository/topology, workspace, change_id, immutable commit_id, operation_id
  and affected bookmarks where applicable, plus expected operation/revision and caller return context; identity
  is never reconstructed from labels or stdout.
- Mutations require current writer lease, exact authorization and FileSafe decision, idempotency and target-bound
  confirmation where required. Transport separately binds credential lease and exact remote. Reads acquire no
  implicit mutation, credential, FileSafe or confirmation authority.
- 'JJI-003 owns the terminal rule: accepted work requires ObservableWork and may have null receipt_ref; every
  established command_result with succeeded, blocked, failed, cancelled, recovery_required or effect_unknown references
  a typed non-secret operation receipt. New planning cannot weaken that rule or invent EventRecord registration.'
- Grouped operations reference ordered member requests/receipts and explicit partial disposition rather than asserting
  atomicity. Redo carries a qualified relation; selected-operation reversal carries its exact selected target.
  These shapes remain owner-qualified planning requirements until separately admitted.
- A managed rewrite preview binds exact base/preview identities, affected scope, possible writes/external effects
  and cleanup lifecycle; Apply revalidates the reviewed preview and current native state. Earlier-state reads
  bind one historical operation and cannot carry restore/apply authority.
- Structured hunk selections require exact native snapshot/file/range bindings, duplicate/ambiguous match and
  truncation handling; content hashes alone grant no authority. Comparison and review correspondence preserve
  immutable endpoint identity and unknown/stale/orphaned states.
- Service restart, timeout and lost response preserve idempotency and reconcile actual owner effects before retry.
  Internal-service architecture grants no public endpoint or independent actor authority; the 31-command schema
  and existing event/storage registration remain unchanged.
validation_surfaces:
- Future owner-qualified request/result, stale identity, denied, cancellation, partial and unknown-effect fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: jujutsu_identity_authority_or_effect_misrepresentation
reasoning_tier: high
context_scope: dl043_accepted_jujutsu_planning
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: accepted_planning_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d001
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d002
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d003
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d004
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d005
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d006
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d007
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d008
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d009
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d010
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d011
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d012
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d013
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d014
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d015
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d016
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d017
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d018
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d019
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d027
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d028
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d029
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d030
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d031
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d032
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d035
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d037
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d038
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d039
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d040
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d042
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d043
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d044
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d022
- Plans/Decision_Log.md:DL-043
negative_constraints:
- 'Planning only: no new admitted command ID, native handler, runtime readiness, EventRecord family, schema widening,
  WorkNode, NodeSeed or governance seal follows from this unit.'
- Declined DL-043 dispositions remain declined; do not reopen them or add a third-party diff/source-control library,
  external IDE/MCP interface, shared public service, custom publish hooks, specialized storage or specialized
  AI workspace-review workflow.
owner_boundary_notes:
- Jujutsu and Source Control own native semantics and admitted command contracts; Final GUI owns presentation,
  Backup owns restore/completion/maintenance policy, FileManager owns newline behavior, Permissions and FileSafe
  independently own safety, and Forge owns hosted workflows.
owner_hints:
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
- Plans/FinalGUISpec.md
- Plans/Backup_Restore_System.md
- Plans/FileManager.md
- Plans/Forge_Integrations.md
- Plans/FileSafe.md
```

### CV-331 — Qualified Publication And Recovery Envelope Boundaries

```yaml
plan_unit_id: CV-331
unit_type: integration_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Publication, maintenance, export, managed preview and missing-data completion preserve their independent
  effect and evidence scopes. The semantic owners define payloads; Contracts requires typed identity/authorization/result
  references without extending the currently admitted schemas.
gui_related: false
gui_classification_reason: Defines envelope or authorization owner requirements rather than visual presentation.
depends_on:
- CV-330
- PS-139
- JJI-019
- FGI-016
- FGI-017
- BRS-021
- BRS-022
- SCS-021
- JJI-013
unblocks: []
acceptance_criteria:
- Conflict publication carries a default-block decision and only allows an advanced path with qualified adapter/target
  compatibility and explicit reviewed unresolved-content scope. Conflicted-bookmark resolution preserves all alternatives
  and the exact admitted mutation target.
- Stack workflows bind one explicitly supported provider workflow at a time, exact instance/repository/review/base/revision
  mapping and each effect result. Publication success and review failure remain distinct; unknown effects require
  reconciliation before idempotent retry.
- Additional provider support requires a concrete workflow contract independent of local history, rather than
  assuming native upload capability admits a hosting provider.
- Maintenance references protected recovery scope and Backup capture/GC fence decisions; preview lifecycle records
  cleanup without pretending object writes are a read-only query. Sanitized export identifies reviewed scope,
  redaction disposition and artifact receipt without exposing secrets or raw sensitive paths/content.
- Restore drill results distinguish correctness-critical index rebuild, optional captured-index acceleration,
  missing native dependencies and closure verification. Completion binds separate authorization, remote/credential
  scope, bounded progress/cancellation and remaining missing data; it never implies restore activation or all-history
  completeness from a successful fetch.
validation_surfaces:
- Future owner-qualified request/result, stale identity, denied, cancellation, partial and unknown-effect fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: jujutsu_identity_authority_or_effect_misrepresentation
reasoning_tier: high
context_scope: dl043_accepted_jujutsu_planning
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: accepted_planning_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d007
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d027
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d028
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d034
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d035
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d037
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d039
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d040
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d043
- Plans/Decision_Log.md:DL-043
negative_constraints:
- 'Planning only: no new admitted command ID, native handler, runtime readiness, EventRecord family, schema widening,
  WorkNode, NodeSeed or governance seal follows from this unit.'
- Declined DL-043 dispositions remain declined; do not reopen them or add a third-party diff/source-control library,
  external IDE/MCP interface, shared public service, custom publish hooks, specialized storage or specialized
  AI workspace-review workflow.
owner_boundary_notes:
- Jujutsu and Source Control own native semantics and admitted command contracts; Final GUI owns presentation,
  Backup owns restore/completion/maintenance policy, FileManager owns newline behavior, Permissions and FileSafe
  independently own safety, and Forge owns hosted workflows.
owner_hints:
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
- Plans/FinalGUISpec.md
- Plans/Backup_Restore_System.md
- Plans/FileManager.md
- Plans/Forge_Integrations.md
- Plans/FileSafe.md
```

### CV-334 - Exact historical child-status writer exclusion

```yaml
plan_unit_id: CV-334
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: The authoritative goal.child_status_changed v2 schema remains registered historical validation
  authority while the retired current Goal-child structure admits zero new writes. Reject this exact family
  before producer dedupe, CAS, outbox or append; preserve genuine original source inspection and existing
  reader-only normalization without a new alias or payload change.
gui_related: false
gui_classification_reason: This exact-row contract defines historical validation and read-only storage
  interpretation without a new GUI or active child projection.
split_recommended: false
depends_on:
- GRS-052
- DL-039
- DL-045
unblocks: []
acceptance_criteria:
- The exact21-root schema roster is qualified for goal.child_status_changed only; its family, version
  and schema remain unchanged and the other20 rows receive no inferred disposition.
- Every current attempted child-status append rejects without durable effects, including an identical
  historical idempotency identity; stored history is not renewed writer authorization.
- Historical v2 envelope/payload/identity joins and only supported exact v1 normalization remain required;
  restoration preserves genuine original custody and cannot backdate newly invented events.
validation_surfaces:
- Plans/goal_child_status_history_contract_fixtures.json
- Plans/event_payloads/goal_runtime/goal_child_status_changed.schema.json
- Plans/event_family_registry.json
- Plans/storage_value_registry.json
risk_class: retired_goal_child_writer_reintroduction
reasoning_tier: high
context_scope: goal_child_status_historical_event
implementation_surfaces:
- Plans/Contracts_V0.md
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

The earlier “21 ... only current ... writers” phrase describes the promoted schema roster and is qualified for exactly `goal.child_status_changed`: its authoritative `pm.goal_runtime_event.goal_child_status_changed.schema.v2` root remains registered validation authority for historical bytes, but it admits zero current writes. The roster comprises 21 authoritative Goal/GoalRun payload roots subject to each event’s current owner emission disposition; `goal.child_status_changed` is historical-only under GRS-060. Do not remove its table row, alter its schema, infer retirement of all 21 rows or manufacture an alias.

Apply the retired-family gate before current-writer dedupe, CAS, outbox creation or append. Every attempted current append of this exact name rejects without append or other durable effect, including identical-idempotency retry; do not return a prior successful publication as authorization for new current work. Existing stored source inspection uses SP-271 and returns the historical observation only. Backup restoration of original historical storage bytes under existing recovery custody is not producer admission and must preserve original identity/provenance; migration cannot backdate a new event or synthesize historical child authority.

EventRecord 2.0.0 and the existing closed project-only payload schema remain mandatory for supported historical v2 inspection. Outer/inner project, actor, account, correlation, causation and any thread joins must agree where represented; original unknown fields, enums, unsupported roots or invalid joins fail interpretation, preserve source and grant no authority. Exact existing v1 reader/normalizer routes remain compatibility-only; no v1-to-current writer route is created here.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-060, ContractName:Plans/storage-plan.md#SP-271, SchemaID:pm.goal_runtime_event.goal_child_status_changed.schema.v2

### CV-335 - Exact historical Goal degradation writer exclusion

```yaml
unit_type: requirement
status: accepted
gui_related: false
gui_classification_reason: Defines exact event admission, historical interpretation and storage read authority
  without adding a GUI.
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
plan_unit_id: CV-335
owner_doc: Plans/Contracts_V0.md
depends_on:
- GRS-061
risk_class: historical_schema_misread_as_writer_admission
implementation_surfaces:
- Plans/Contracts_V0.md
canonical_text: 'For exactly `goal.degraded`, GRS-061 qualifies the earlier twenty-one-root current-writer
  prose. The twenty-one schemas remain authoritative validation roots; this exact row admits zero current
  writes because its defined state transition is incompatible with the exclusive current Goal lifecycle.
  Keep its table row, root schema ID, registry family, version and historical minima unchanged. Do not
  infer another row''s disposition from this exception or from a shared prefix.


  Enforce the exact-name historical-only gate before current-producer idempotency success, CAS, outbox
  creation or EventRecord append. A schema-valid body, identical old idempotency key, valid actor, verifier
  outage, provider fallback or degraded survivor view cannot bypass that gate. Return a truthful current-writer
  rejection with no append or durable side effect; do not return an old append success as if current Goal
  work were admitted. Current UI command envelopes retain their own existing rejection contract; no new
  generic command/error code is defined here.


  Historical v2 inspection uses the unchanged project-only EventRecord 2.0.0 and `pm.goal_runtime_event.goal_degraded.schema.v2`
  root. Outer/inner project and all represented actor/account/correlation/causation/thread joins must
  agree. Original revision and referenced evidence predicates are checked only as historical diagnostic
  facts, never executed. Supported original legacy aggregate input remains immutable read/import lineage;
  SP-277 does not invent a v1-to-v2 event-specific upgrader, new identity or replacement EventRecord.
  Byte-preserving authorized backup restore is storage recovery, not a producer append exception. Unsupported/future
  schema, unproved identity or historical evidence gaps leave interpretation unavailable/invalid and preserve
  original bytes.


  The existing app-root event identity and dedupe policies remain unchanged for retained historical custody
  and for other independently admitted families. SP-277''s direct historical lookup has no family projection/checkpoint/idempotency
  write. No Goal state, receipt, command, provider call, notification, Usage charge, hold change or certification
  follows from reading this event.'
acceptance_criteria:
- Current append gate rejects exact goal.degraded before idempotency success, CAS or outbox even for schema-valid
  identical historical keys.
- Authoritative v2 root, table/registry row and historical minima remain unchanged; active emission follows
  exact semantic owner.
- Historical schema/version and outer/inner identity joins are checked; compatibility never emits a rewritten
  event or synthesized v2 body.
- Read-only source inspection has zero dispatch/receipt/approval/Usage/hold effect and cannot supply current
  lifecycle/completion truth.
preserved_exact_tokens:
- goal.degraded
- event-family-goal-degraded
- pm.goal_runtime_event.goal_degraded.schema.v2
- projector_replay_only
- dedupe_unavailable
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-061, ContractName:Plans/Contracts_V0.md#CV-335, ContractName:Plans/storage-plan.md#SP-277, ContractName:Plans/Decision_Log.md#DL-039

### CV-336 - Exact historical Goal scheduling contract

```yaml
unit_type: requirement
status: accepted
gui_related: false
gui_classification_reason: Defines exact event admission and historical source interpretation without
  adding a GUI or changing current Scheduling controls.
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
plan_unit_id: CV-336
owner_doc: Plans/Contracts_V0.md
depends_on:
- GRS-062
risk_class: historical_scheduling_schema_misread_as_writer_admission
implementation_surfaces:
- Plans/Contracts_V0.md
canonical_text: 'For exactly goal.scheduled, GRS-062 qualifies every earlier assertion that all twenty-one
  Goal roots are current writers. These remain authoritative validation schemas, but D-R11 requires an
  impossible current Goal destination and this row therefore admits historical interpretation only. Preserve
  its existing event-family-goal-scheduled membership, root pm.goal_runtime_event.goal_scheduled.schema.v2,
  revision 2.0.0, project scope and retention assignment. No sibling exclusion, payload rewrite or new
  alias is implied.


  Enforce an exact-name current-writer rejection before dedupe success, CAS, pending outbox or append.
  Schema validity, an old matching key or a timer/permission/eligibility success does not admit the event.
  Return truthful refusal with no durable effect or scheduling. UI commands retain their existing owner/generic
  rejection contracts; no new command or error code is created. This does not disable separately authorized
  current run scheduling through Scheduling_and_Quota_Resume and GRS-050/051.


  Historical v2 inspection validates the unchanged project-only EventRecord 2.0.0 and exact root, all
  represented outer/inner project, actor, account, correlation, causation and thread joins, plus historical
  Goal identity, revisions and D-R11 prerequisites. Original optional queue_id contributes the empty string
  when absent to the existing ordered idempotency recipe, never a fabricated queue. Supported original
  legacy aggregate input remains immutable read/import lineage; this unit defines no v1-to-v2 payload
  upgrader, replacement identity or emitted normalization. Byte-preserving verified backup restoration
  remains Storage recovery, not a new append exception. Timestamps, schema shape and source presence alone
  cannot establish valid original historical admission. Unknown/future schemas, identity conflicts or
  unresolved original prerequisite evidence prevent claimed interpretation success without rewriting the
  source.


  SP-280 owns no family projection, checkpoint, idempotency row or persistent read result. Its required
  independently owned generic index checkpoint is not replaced by none_required. Historical next_action
  never dispatches or creates a schedule, and original budget evidence grants no current Goal budget or
  quota. Preserve existing recovery, canonical-receipt, permission, retention and manual-stop fences;
  do not convert this event to current scheduling truth.'
acceptance_criteria:
- Exact-name append refusal precedes idempotency success/CAS/outbox even for schema-valid eligible input
  and identical old keys.
- Existing root, version, registry membership, scope and retention remain unchanged; historical envelope/Goal
  identity joins are mandatory.
- No event-specific legacy upgrader, replacement event/alias, command or error code is created.
- Current Scheduling authority and manual-stop/recovery fences are not removed by exact historical disposition.
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
