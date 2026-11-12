# Shard 044: GRS-085 — Mandatory started/cancelled/certified prefix projection, scope validation, halt rules and source lifetime (2026-09-21)

Source: `Plans/Goal_Runtime_System.md`

Source lines: L8210-L8918

Source SHA256: `fa738869f6070a343b08330fe8d937a5f69ed338d7aa0036287ce0ab7b49384d`

---

## GRS-085 — Mandatory started/cancelled/certified prefix projection, scope validation, halt rules and source lifetime (2026-09-21)

```yaml
plan_unit_id: GRS-085
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: The mandatory started/cancelled/certified per-Workflow-run projection consumes the complete actual
  contiguous global Event prefix, including authenticated generic off-run frames as no-ops. It validates full EventRecord
  shape, source scope and original custody before interpreting a supported same-run started, positive-D06 cancelled
  or certified transition. Gaps, reordering, malformed off-run frames, unsupported same-run replanned/blocked/stopped
  profiles, conflicting lifecycle or mismatched scope halt before that row; they do not silently advance checkpoint.
  Preserve the whole original started/cancelled methods and schemas in their original isolated banks and complete
  structural companions, including nested GuardReadRequest/GuardReadResult and their own native/Goal/guard final
  held boundary. P0-P8 define complete source census, reducer, publication, current/historical admission, generation
  and lifetime behavior. Deterministic reduction grants no native success or action authority, and earlier started-only/started-cancelled
  routes retain their original boundaries. Current consumers independently verify the actual generic frontier and
  fresh complete owner graphs, not an old derived selector or payload alone. This version-scoped complete family
  supplies the previously unbound certified-v3 identity/coordinator/Event selection and passive consumer source
  roles only for a genuine fresh pm.executor.workflow_source.all_writers.v7 birth and pm.goal_run_certified.producer_source.v2
  prepare.v2 binding. Earlier native-v6 and producer-v1 source editions and old started/cancelled branches retain
  their original closed scope; no existing birth is enrolled or cast. The complete methods, protocols, schemas,
  phase and participant tuples, isolated resource banks and physical/lifetime contracts under Plans/goal_certified_event_coordinator_contracts/,
  Plans/workflow_standard_source_contracts/native-v7/, Plans/goal_certified_producer_source_contracts/ (including
  native-v7/) and Plans/goal_run_certified_consumer_contracts/ are normative together. Source acceptance and registry
  classification establish neither installed native authority nor execution, codec, transaction, durability, recovery,
  Event-depth or readiness proof. All such native evidence remains NOT_RUN. No WorkNode or NodeSeed is created.
gui_related: false
source_lineage:
- certified-family-placement:sha256:41a4d703b475c2668b243b043934bf0e3a0f22f33c1e663b339aa1aa2395099c
- root-placement-review:sha256:00981271bf2b645c3610804251ce240f83f3d121ab2c654b0fe98b3c5396909c
- accepted-header-source:sha256:dd464f1bec2a1691a045aec1fcd816de1c83feb70f8065f1e37ef0c053b890fe
- producer-repin-source:sha256:ad4c49b5e1fb43425a390c9cb666a95503483699779dfdb860ec770d2e06376a
- consumer-repin-source:sha256:e6f9be4094e68b5d690e93db45ba3199ccff20a1c72fe93264aadf822ed1896d
depends_on:
- PDS-003
- GRS-084
unblocks: []
acceptance_criteria:
- Preserve the complete scoped source and every original entry/final/phase/type/lifetime predicate.
- Use complete canonical resources and exact isolated original retrieval scopes; prove full inverse metadata and
  actual final acyclic hash graph.
- Native installation, authentic original source capabilities, execution, codec/transaction/durability/recovery
  and end-to-end readiness remain NOT_RUN.
validation_surfaces:
- Plans/goal_current_writer_oracle_fixtures.json
- python3 scripts/pm_goal_current_writer_oracles.py
- Plans/goal_certified_event_coordinator_contracts/protocol.md
- Plans/goal_certified_event_coordinator_contracts/phase-boundaries.json
- Plans/goal_certified_event_coordinator_contracts/participant-method-tuples.json
- Plans/goal_run_certified_consumer_contracts/protocol.md
- Plans/goal_certified_family_composition.json
risk_class: original_source_authority_native_transaction_and_lifetime
reasoning_tier: high
context_scope: grs-085_whole_certified_family
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/goal_certified_event_coordinator_contracts
- Plans/goal_certified_producer_source_contracts
- Plans/workflow_standard_source_contracts/native-v7
- Plans/goal_run_certified_consumer_contracts
node_compile_hint:
  mode: source_contract_only
  create_worknodes: false
  create_nodeseeds: false
gui_classification_reason: Original source, native authority/custody, schema, storage or passive consumer contract;
  no new visual presentation.
```

Amended 2026-11-05 (DG-OWN-C, DL-045): Exactly goal_run.started, goal_run.cancelled and goal_run.certified separately adopt W3, W4 and W5 with their own GRS-1132/1133/1134 and SP-1134/1135/1136. Existing unsupported same-run transition halts and old-birth source qualifications remain unchanged. The complete new contract is `Plans/goal_own_c_contracts/protocol.md`; full inherited-root executable coverage remains required. Native execution stays NOT_RUN.


ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-085, ContractName:Plans/Plan_Document_System.md#PDS-003, ContractName:Plans/goal_certified_event_coordinator_contracts/protocol.md, ContractName:Plans/goal_run_certified_consumer_contracts/protocol.md, ContractName:Plans/goal_certified_family_composition.json


Q22 appearance amendment (Jared, 2026-10-30; Plans/Decision_Log.md#DL-257): current appearance contracts use five ordered families and ten variants. Earlier override-only or eight-theme evidence is historical, not current acceptance. Settings_System SSYS-043 owns the retired-key migration and retained NieR Adjust rows.

Amended 2026-11-04 (DL-080, DL-045 depth): GRS-202 extends this projection to same-run goal_run.blocked and goal_run.stopped v3 rows for births whose Workflow source edition lists EP-200's writers; every other birth keeps the halt above.

### GRS-200 - Current goal_run.stopped contract

```yaml
plan_unit_id: GRS-200
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: |-
  Newly authored owner contract under DL-045, written for DL-080 (2026-11-04), for exactly goal_run.stopped, Project edition. Producer: owner.executor.workflow_run.stop.v1 (EP-200), from cmd.orchestrator.pause and cmd.runtime.abort_run. Payload: pm.goal_runtime_event.goal_run_stopped.schema.v3 (CV-420) on the current GoalRun envelope; the Goal revision is unchanged. Transitions adopt D-R21 over the native Workflow status set: ready|running|provisional_success|verifying|failed_verification|repairing|blocked -> stopped; stopped -> stopped only with new settlement or recovery evidence; certified, failed and cancelled sources are illegal. "All child settlements" now means the run's own in-flight effect settlements (settlement_refs), and child_settlement_refs is authenticated empty under GRS-075. A stopped run leaves stopped only by D06 cancellation (GRS-080) until a resume or replan writer is admitted; resumable=true records eligibility, not a resume. Prepared without admission: the registry row keeps v2 until its own admission landing.
gui_related: false
gui_classification_reason: Defines event, writer, persistence or projection contracts; no visual surface.
split_recommended: false
depends_on:
- GRS-075
- GRS-080
- GRS-085
- EP-200
- CV-420
- SP-426
- DL-080
- DL-045
unblocks: []
acceptance_criteria:
- Only EP-200's stop writer appends goal_run.stopped v3, after settlement and native status update and before terminal command publication.
- Every D-R21 edge is checked against the native Workflow status; certified, failed and cancelled sources refuse.
- child_settlement_refs is empty; settlement_refs carries the run's own durable settlement dispositions.
- No resume, replan or Goal-state change follows from the event; cancellation from stopped stays D06's.
- The app edition is out of scope: goal_run.stopped has no application payload version, and none is added here.
validation_surfaces:
- Plans/executor_cancellation_contracts/schemas/goal-run-stopped.v3.schema.json
- Plans/executor_cancellation_contracts/schemas/goal-run-blocked.v3.schema.json
- Plans/goal_run_stop_block_oracle_fixtures.json
- python3 scripts/pm_goal_run_stop_block_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_run_stopped_contract
reasoning_tier: high
context_scope: goal_run_stopped_current
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-080
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/D1a/REPORT.md (item 3)
preserved_exact_tokens:
- "goal_run.stopped"
- "pm.goal_runtime_event.goal_run_stopped.schema.v3"
- "D-R21"
negative_constraints:
- No Goal-state change, child Goal, resume or replan.
- No registry change before the admission landing.
owner_hints:
- Plans/Goal_Runtime_System.md
```

**Premise check of DL-080 (2026-11-04).** DL-080 asked for a current contract because Pause and Abort Run wiring expects this event, the resume rule depends on `goal_run.replanned`, the writer list names no writer and GRS-085 halts on the row. Today's text: both wiring rows still list `goal_run.stopped`; D-R21 still forbids silent resume without a new replan; EP-118 still refuses unlisted writers; GRS-085 still halts on same-run stopped rows. The premise holds. Two facts are newer or were not in the card: the Workflow writer set is closed by the `all_writers.v7` descriptor (EP-124), so the writer needs a fresh source edition (EP-200); and DL-300 gave `goal_run.blocked`, not this family, an application edition, so an application run has no stopped event. Neither is decided here.

**Reconciling settlements with GRS-075.** D-R21's "all child settlements" assumed child Goals; GRS-075 admits child arrays only authenticated empty. The v3 payload therefore keeps `child_settlement_refs` empty and adds `settlement_refs` for the run's own in-flight effects that the bounded safe-stop owner settled (SP-309). `resumable=true` needs a safe point and every applicable effect settled; `resumable=false` forbids any future resume without a distinct replan that proves changed admission conditions (D-R21).

**Consumers.** GRS-202 extends the mandatory run-history projection to this row for births whose source edition lists EP-200's writer; SP-426 owns persistence, identity, custody and withdrawal. The v2 payload stays a historical reader; the old v2 oracle pair EA-UND-0021-GOAL describes v2 and is superseded for current writes by ATS-212.

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-200, ContractName:Plans/Contracts_V0.md#CV-420, ContractName:Plans/storage-plan.md#SP-426, ContractName:Plans/Goal_Runtime_System.md#GRS-202, ContractName:Plans/Decision_Log.md#DL-080

### GRS-201 - Current goal_run.blocked contract

```yaml
plan_unit_id: GRS-201
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: |-
  Newly authored owner contract under DL-045, written for DL-080 (2026-11-04), for exactly goal_run.blocked, Project edition. Producer: owner.executor.workflow_run.block.v1 (EP-200), from the Executor scheduler. Payload: pm.goal_runtime_event.goal_run_blocked.schema.v3 (CV-421) on the current GoalRun envelope; the Goal revision is unchanged and the payload fields are those of v2. Transitions adopt D-R16 over the native Workflow status set: ready|running|provisional_success|verifying|failed_verification|repairing -> blocked; blocked -> blocked only with new evidence, action or recovery revision; certified, failed, cancelled and stopped sources are illegal. The block receipt exists before append. A blocked run leaves blocked by EP-200's stop writer or D06 cancellation; any other exit needs a writer not admitted here. The dormant application edition (DL-300, GRS-086) is unchanged. Prepared without admission: the registry row keeps v2 until its own admission landing.
gui_related: false
gui_classification_reason: Defines event, writer, persistence or projection contracts; no visual surface.
split_recommended: false
depends_on:
- GRS-080
- GRS-085
- GRS-086
- EP-200
- CV-421
- SP-427
- DL-080
- DL-300
- DL-045
unblocks: []
acceptance_criteria:
- Only EP-200's block writer appends goal_run.blocked v3 (Project), after the block receipt and native status update.
- Every D-R16 edge is checked against the native Workflow status; certified, failed, cancelled and stopped sources refuse.
- allowed_action_ids are recorded data; none of them is dispatched by the event or its readers.
- The application payload version keeps producer_admission requires_owner_adoption and is not changed.
validation_surfaces:
- Plans/executor_cancellation_contracts/schemas/goal-run-stopped.v3.schema.json
- Plans/executor_cancellation_contracts/schemas/goal-run-blocked.v3.schema.json
- Plans/goal_run_stop_block_oracle_fixtures.json
- python3 scripts/pm_goal_run_stop_block_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_run_blocked_contract
reasoning_tier: high
context_scope: goal_run_blocked_current
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-080
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/D1a/REPORT.md (item 3)
preserved_exact_tokens:
- "goal_run.blocked"
- "pm.goal_runtime_event.goal_run_blocked.schema.v3"
- "D-R16"
negative_constraints:
- No Goal-state change, resume, replan or action dispatch.
- No change to the application edition or the registry before admission.
owner_hints:
- Plans/Goal_Runtime_System.md
```

**Premise check of DL-080 (2026-11-04).** Today's text still has no writer for this family (EP-118), GRS-085 still halts on same-run blocked rows, and the native status set still includes `blocked`, which D06 may cancel (GRS-080). The premise holds. DL-300 later gave this family a dormant application edition; it is out of scope here and unchanged.

**Owner-valid actions.** `allowed_action_ids` lists what the owner of the block allows (D-R16); permission and recovery causes keep D-R01's restrictions. The event records them; it dispatches none. `preserved_work_refs` may be empty only when no mutation began.

**Consumers.** GRS-202 extends the mandatory run-history projection to this row for births whose source edition lists EP-200's writer; SP-427 owns persistence, identity, custody and withdrawal. The v2 payload stays a historical reader; EA-UND-0016-GOAL describes v2 and is superseded for current writes by ATS-212.

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-200, ContractName:Plans/Contracts_V0.md#CV-421, ContractName:Plans/storage-plan.md#SP-427, ContractName:Plans/Goal_Runtime_System.md#GRS-202, ContractName:Plans/Decision_Log.md#DL-080

### GRS-202 - Run-history projection extension for stopped and blocked rows

```yaml
plan_unit_id: GRS-202
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: |-
  Newly authored owner contract under DL-045, written for DL-080 (2026-11-04). It extends GRS-085's mandatory per-run projection, as DL-080 requires, to same-run goal_run.blocked v3 and goal_run.stopped v3 rows, only for a run whose birth used a fresh Workflow source edition that lists EP-200's writers. For such a run the reducer accepts started, then any of blocked and stopped by D-R16 and D-R21, blocked -> blocked and stopped -> stopped with a higher GoalRun revision, and positive D06 cancelled from blocked or stopped; certified from blocked or stopped is a conflicting lifecycle and halts. On every other birth, and for any v2 row of either family, the row stays unsupported and halts before it, exactly as GRS-085 says today. SP-428 owns the projection value and checkpoint delta.
gui_related: false
gui_classification_reason: Defines event, writer, persistence or projection contracts; no visual surface.
split_recommended: false
depends_on:
- GRS-085
- GRS-200
- GRS-201
- EP-200
- SP-312
- SP-317
- SP-278
- DL-080
- DL-045
unblocks: []
acceptance_criteria:
- For a qualifying birth, a verified same-run blocked or stopped v3 row on a legal edge advances the projection and its checkpoint atomically.
- Each accepted row must carry expected_goal_run_revision equal to the projected revision and goal_run_revision one higher.
- Certified after blocked or stopped, started after either, and any v2 row of either family halt before the row.
- Non-qualifying births keep GRS-085's halt unchanged; no existing projection generation is reinterpreted.
validation_surfaces:
- Plans/executor_cancellation_contracts/schemas/goal-run-stopped.v3.schema.json
- Plans/executor_cancellation_contracts/schemas/goal-run-blocked.v3.schema.json
- Plans/goal_run_stop_block_oracle_fixtures.json
- python3 scripts/pm_goal_run_stop_block_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: run_history_projection_gap
reasoning_tier: high
context_scope: grs085_stop_block_extension
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-080
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/D1a/REPORT.md (item 3)
preserved_exact_tokens:
- "GRS-085"
- "goal_run.blocked"
- "goal_run.stopped"
negative_constraints:
- No action authority, resume or replan from a projected row.
- No change to earlier births or their generations.
owner_hints:
- Plans/Goal_Runtime_System.md
```

**Rule table** (same run, after a verified `goal_run.started`): `started -> blocked`, `started -> stopped`, `blocked -> blocked` (higher revision, new evidence), `blocked -> stopped`, `stopped -> stopped` (higher revision, new settlement or recovery evidence), `blocked -> cancelled` and `stopped -> cancelled` (positive D06), `started -> cancelled` and `started -> certified` as before. Halts: `blocked -> certified`, `stopped -> certified`, `stopped -> blocked`, anything after `cancelled` or `certified`, a revision that is not exactly one higher, a v2 row of either family, `goal_run.replanned` (still unsupported until its own contract). The projection never infers a Goal state, and a `stopped` row with `resumable=true` gives no resume authority.

**Why only qualifying births.** GRS-085 is bound to the `all_writers.v7` birth and the `prepare.v2` producer source. A v7 birth cannot produce these rows (EP-200), so extending its reducer would change nothing real and would risk accepting rows from an unlisted writer. The extension therefore applies only where the source edition lists the writers.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-085, ContractName:Plans/storage-plan.md#SP-428, ContractName:Plans/Executor_Protocol.md#EP-200, ContractName:Plans/Decision_Log.md#DL-080

### GRS-086 - Application Goal Birth Continuation And Versioned Custody

```yaml
plan_unit_id: GRS-086
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: 'An explicitly requested Goal may be born in an app thread with project_id=null and real thread/Computer/working-root
  identity. Its application record edition preserves the concise eleven Goal fields, exact objective_text/currentness,
  four states active|paused|blocked|completed, two text-change sources and existing Save/propose-update authority.
  Scope/Server metadata belongs to the canonical wrapper/execution envelope, not additional Goal body fields. Internal
  app Goal custody creates no user folder until a file save/command requires one. The existing Goal host reloads
  canonical state, checks owner/current permission/recovery/storage/Stop epochs and evidence and admits bounded
  ordinary continuations; no Assistant Plan, NamedPlan, repository, WorkGraph, WorkNode or Orchestrator run is required.
  It may use Crew only under parent ceilings. Body/revisions/origin/control/pending, creation/update/cancel results,
  associations and every needed active event/read/backup edge adopt one explicit app-version map together or stay
  unavailable. Original pm.goal.record.v2 and owner.goal.body.mutation@1.0.0 Project codecs and hashes remain exact
  and readable; app siblings have distinct schema IDs and hash domains, never null coerced into a Project string.
  Active family registration must join outer/inner app scope, real thread/Goal/run, global event identity, reversible
  partition and lifetime idempotency. dedupe_unavailable fences effects; replay is projection-only and cannot rebuild
  a missing objective. goal.scheduled, goal.degraded and retired child-state/worker/verifier writers remain historical-only.
  Actual Project Workflow certification/source predicates remain intact and cannot certify absent WorkNodes for
  an app Goal. App families share counterpart caps/retention/holds and coherent mandatory Full Server Backup; Stop,
  cancellation and independently retained receipts keep their original semantics. Activity/History/Agents show actual
  scope/Computer, objective and canonical owner state without a new Goal card or lifecycle. CV-366 selects the new
  app goal_start, goal_update, goal_cancel and ordinary run source graphs in Plans/application_workflow_source_graph.json,
  with complete original sources in Plans/application_workflow_sources.schema.json and app values in Plans/application_workflow_contracts.schema.json.
  App objective mutation uses owner.goal.body.mutation.application@1.0.0; the original Project owner.goal.body.mutation@1.0.0
  resource stays exact. The complete CV-366 event-family table governs: goal.progressed, goal.replanned, goal.stopped
  and goal.verification_decided also remain historical-only with zero current writes, alongside the other retired
  families. SP-351 owns the app physical families and counterpart policy joins; absent durable materialization or
  native source/read/backup proof keeps the affected operation unavailable.'
gui_related: true
gui_classification_reason: Defines user-visible availability, controls, preview, scope or outcome.
depends_on:
- ACD-508
- SIR-055
- PS-145
- DL-300
unblocks: []
acceptance_criteria:
- App Goal create/direct Save/approved proposal/pause/resume/Stop/cancel/history/restart/backup succeeds through
  genuine app custody with null Project.
- Original Project fixtures remain byte/hash exact; ordinary null-to-Project update and reconstructed canonical
  body refuse.
- No fifth state, child Goals, Goal budget/role fields, fake Plan, silent objective edit or fake Workflow certification
  appears.
validation_surfaces:
- 'Phase 2: python3 scripts/pm-projects-refresh-contracts.py (F-delivered semantic fixtures)'
- 'Phase 2: python3 scripts/pm-assistant-contract-check.py'
- 'Phase 2: python3 scripts/pm-plan-index.py validate'
risk_class: scope_authority_and_custody
reasoning_tier: high
context_scope: application_and_project_workflows
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: contract_specification
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#Q11-Goals-Crew; N24
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c
- 'Jared, 2026-11-03: Those look good, except goals and crew should be allowed in no project.'
- projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#fc-c01
preserved_exact_tokens:
- project_id=null
- objective_text
- active|paused|blocked|completed
- pm.goal.record.v2
- owner.goal.body.mutation@1.0.0
- dedupe_unavailable
- goal.scheduled
- goal.degraded
negative_constraints:
- Do not infer native support from a schema or globally loosen Project-only exact event/producer/certification contracts.
- Never borrow another Project build grant, clear Stop, or derive canonical Goal content from events.
owner_hints:
- Plans/Goal_Runtime_System.md
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-086, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#CV-366, ContractName:Plans/storage-plan.md#SP-351

### GRS-087 - Immutable Goal Conversion And Linked Destination Birth

```yaml
plan_unit_id: GRS-087
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: 'N25 conversion of unfinished Goal work defaults to a new destination Goal linked to the immutable
  source Goal and exact accepted revision, with fresh destination permission/root/runtime and canonical body/control/association
  custody. Preview names source active continuation disposition: finish, Stop/cancel, or fence at its admitted safe
  boundary before cutover. No live Goal continues in both scopes. Completed/cancelled source work stays historical
  and creates no new active continuation or synthesized completion receipt. Ordinary owner.goal.body.mutation@1.0.0
  and app sibling objective updates never change goal_id, project_id, thread_id or created_at, including a null
  Project binding; historical bodies, origin, objective revisions, events, receipts, certification and accepted
  source bytes remain fixed. An explicit rebind requires a separately versioned Goal association-owner transaction
  with genuine source/target authority, currentness, exhaustive writer enrollment, hidden control/pending state,
  Stop/lease/topology epochs, safe-stop checks and atomic binding publication. Until that entire transaction/version
  is admitted, only linked new birth is available; no metadata update impersonates rebind. The converted thread''s
  stable identity does not itself change a Goal''s binding. Revalidate exact Goal/Plan/Crew/To-Do edges through
  the conversion map and quarantine invalid ones. Source history remains access-controlled canonical custody under
  its own lifetime and backup rules after chat Undo expires; ending Undo cannot erase completion/cancel truth or
  restart a stopped source. CV-367/SP-350 supply the exhaustive per-family source/destination map and retained cutover
  lineage. The linked new birth uses the selected CV-366 app or Project source edition; copied history or certification
  never enrolls that birth. Optional association rebind remains unavailable until the entire separately versioned
  owner protocol is admitted.'
gui_related: true
gui_classification_reason: Defines user-visible availability, controls, preview, scope or outcome.
depends_on:
- GRS-086
- SIR-055
unblocks: []
acceptance_criteria:
- Ordinary updates reject null-to-real Project changes, even with unchanged objective text.
- Linked destination birth publishes once after source fence; late continuation/cancel/update races cannot create
  two live owners.
- Explicit rebind is typed unavailable until complete owner transaction/version and all graph edges are admitted.
validation_surfaces:
- 'Phase 2: python3 scripts/pm-projects-refresh-contracts.py (F-delivered semantic fixtures)'
- 'Phase 2: python3 scripts/pm-assistant-contract-check.py'
- 'Phase 2: python3 scripts/pm-plan-index.py validate'
risk_class: scope_authority_and_custody
reasoning_tier: high
context_scope: application_and_project_workflows
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: contract_specification
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#N25; Q11-Goals-Crew
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c
- 'Jared, 2026-11-03: Those look good, except goals and crew should be allowed in no project.'
- projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#fc-c02
preserved_exact_tokens:
- N25
- owner.goal.body.mutation@1.0.0
- goal_id
- project_id
- thread_id
- created_at
negative_constraints:
- Never mutate a Goal binding in place, transplant certification, synthesize completion or repeat settled effects.
- A transcript move, pointer, receipt or copied control state is not new association authority.
owner_hints:
- Plans/Goal_Runtime_System.md
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-087, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#CV-367, ContractName:Plans/storage-plan.md#SP-350

### GRS-203 - Current Project goal.blocked successor

```yaml
plan_unit_id: GRS-203
unit_type: owner_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: Newly authored Project goal.blocked v3 contract preserves GRS-048/050 and GREPLAY-004..010, uses
  only the shared body metadata CAS, and refuses unbound host-source and lifecycle edges.
gui_related: false
gui_classification_reason: Internal event, custody and host predicates; no new visual surface.
split_recommended: false
depends_on:
- GRS-048
- GRS-050
- GRS-064
- DL-045
unblocks: []
acceptance_criteria:
- Exact original host, body/currentness/epoch and caller evidence precede the lifecycle metadata commit.
- Retained whole-v2 interpretation is unchanged; native activation waits for the named unbound original source edition.
- No event, model claim or helper witness can bypass Stop, cancellation or the complete shared body fence.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_blocked.v3.schema.json
- Plans/goal_lifecycle_successor_fixtures.json
- python3 scripts/pm_goal_lifecycle_successor_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_event_authority
reasoning_tier: high
context_scope: grs-203_event_authority
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- event-authority-20261104/reviews/DG-sol/REVIEW.md
preserved_exact_tokens: []
negative_constraints:
- No registry or app edition change, native admission or runtime proof.
owner_hints:
- Plans/Goal_Runtime_System.md
```

**Newly authored owner contract under DL-045; prepared Project successor, no admission (2026-11-04).** This unit applies only to `goal.blocked` and `pm.goal_runtime_event.goal_blocked.schema.v3`. The existing whole `goal_blocked.schema.json` v2 resource, original envelope/identity, D-R01 predicates and legacy v1 reader retain their historical meaning. There is no v2-to-v3 cast and no app adoption; the unused app sibling remains governed by CV-366 until its separate owner adoption. The registry still selects v2 pending review and integration.

**Per-family current-source search.** At base `0c40a7809826bcf509bbb16483bbdd8f4c48760b`, searched every live top-level `Plans/*.md`, `Plans/*.json`, event payloads, Goal body/source schemas, all Goal named bindings and the admission-record directory for `goal.blocked`. Found the required Goal V2 name, its old D-R row and schema, GRS-048/050, GREPLAY-004..010, GRS-064/SP-287 sole body custody and dormant CV-366 app selector. Found no current V2-compatible family producer, original host-source edition, family observation binding or v3 identity. The old generic v2 recipe cannot supply current source authority. These technical bindings are authored here for this exact family; no sibling binding is inferred.

**Envelope and lifecycle custody.** Adopt `Plans/Contracts_V0.md#EventRecord` pm.event.v0@2.0.0 and CV-422, not a local envelope. Explicit Project/thread/Goal/Storage identity must match the actual canonical body and original host caller. Outer event_type is `goal.blocked`, payload_schema_id is `pm.goal_runtime_event.goal_blocked.schema.v3`, Project and thread equal payload values, run_id equals the owning continuation run, and actor/correlation/causation/account facts come from that original caller. No focus/main/null-Project fallback. The immutable event has no objective text, retired Goal topology or provider/tool output. Raw secrets reject before reservation/append. The body remains exactly GRS-048's four states active|paused|blocked|completed, with cancellation outside the enum.

**Sole writer, ordering and fences.** The host-only semantic producer `owner.goal.lifecycle.blocked.v1` uses only `owner.goal.body.mutation@1.0.0` under GRS-064/SP-287. It admits a metadata_update, never an objective write: increment the one ordinary revision by exactly one, preserve objective/accepted-head/history/origin bytes, identity, created_at and active_run_ref unless its separate association owner supplies an admitted mutation. Authenticate exact prior body/control/currentness/accepted head, native host owner and permissions, cancellation/Stop/continuation epochs, caller/run identity and current Storage writer/maintenance/deletion/hold state. Capture every original input independently before helpers. Reserve the complete original metadata intent and genuine external authority under the shared body/control CAS; before terminal commit compare the whole actual reserved preimage and all original/current owner predicates after the final helper, with no helper between the pure predicate and commit.

The family protocol orders original host decision and original caller evidence, original producer custody/reservation, narrow atomic body/control/receipt commit, frozen EventRecord input, SP-286 first AppendReceipt, then terminal producer publication. Before body commit, a proven no-effect outcome produces no event or success; after a body commit, event failure cannot undo or repeat it and must preserve the original pending producer operation until exact append/receipt resolution. Unknown is fenced, never converted to no-effect by timeout or absence. The standalone shared body receipt proves only its body effect. A terminal producer publication requires the exact retained body receipt and original event's first SP-286 receipt/full-value commitment; an event observation does not alone publish success or allow another continuation. **Unbound producer edge:** no complete registered physical original host-decision/source-and-pending-result edition currently carries this family protocol across the body-to-event boundary. Authoring this order does not invent one: native reserve/append is refused until that source edition, method installation, backup coherence and original-result resolver are supplied and adopted. This is owner implementation work, not a new product decision.

Continuation operation identity preserves GRS-050's tuple `(goal_id, goal_revision, owning_run_id, next_attempt_ref)`; completion has no new next dispatch. Capture its original nullable next_attempt_ref exactly. Rechecking an already accepted tuple resolves the immutable original effect/result, rather than creating a new lifecycle revision. Stop/Pause/Cancel, objective/bound-Plan revision and run replacement fence the appropriate epochs under GREPLAY-009..010; a stale epoch is never refreshed into success. An owner outage, missing source, unresolved receipt, required-work barrier or unknown recovery fact is unavailable/fenced, never completion or permission to resume.
**Exact blocked predicates and bounded edges.** GRS-048 defines blocked as an owner-supplied condition preventing safe progress and requires blocked_reason_ref. GRS-050's host continuation result must be blocked, its nonnull reason must resolve to that exact original caller's condition/currentness, and the same reason is committed into GoalRecordV2 and the payload. The ordinary active -> blocked edge is bound here. blocked -> blocked may commit only a new ordinary revision with changed original blocker evidence/reason; an equal continuation identity returns its original result, with no new revision. This event does not clear Stop or dispatch any allowed action. A completed source refuses. **Unbound individual edge:** paused -> blocked while a manual Stop latch is held lacks an owner contract reconciling that authoritative pause with a new continuation evaluation; it remains refused. Clearing a blocked condition, resume and any required named event retain their own independent admission; this event grants none. Old D-R01 action sets/recovery choices do not become new Goal fields. Their actual permission/recovery owners remain authoritative; unknown recovery truth never becomes completed.

### GRS-204 - Current Project goal.completed successor

```yaml
plan_unit_id: GRS-204
unit_type: owner_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: Newly authored Project goal.completed v3 contract preserves GRS-048/050 and GREPLAY-004..010, uses
  only the shared body metadata CAS, and refuses unbound host-source and lifecycle edges.
gui_related: false
gui_classification_reason: Internal event, custody and host predicates; no new visual surface.
split_recommended: false
depends_on:
- GRS-048
- GRS-050
- GRS-064
- DL-045
unblocks: []
acceptance_criteria:
- Exact original host, body/currentness/epoch and caller evidence precede the lifecycle metadata commit.
- Retained whole-v2 interpretation is unchanged; native activation waits for the named unbound original source edition.
- No event, model claim or helper witness can bypass Stop, cancellation or the complete shared body fence.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_completed.v3.schema.json
- Plans/goal_lifecycle_successor_fixtures.json
- python3 scripts/pm_goal_lifecycle_successor_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_event_authority
reasoning_tier: high
context_scope: grs-204_event_authority
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- event-authority-20261104/reviews/DG-sol/REVIEW.md
preserved_exact_tokens: []
negative_constraints:
- No registry or app edition change, native admission or runtime proof.
owner_hints:
- Plans/Goal_Runtime_System.md
```

**Newly authored owner contract under DL-045; prepared Project successor, no admission (2026-11-04).** This unit applies only to `goal.completed` and `pm.goal_runtime_event.goal_completed.schema.v3`. The existing whole `goal_completed.schema.json` v2 resource, original envelope/identity, D-R04 predicates and legacy v1 reader retain their historical meaning. There is no v2-to-v3 cast and no app adoption; the unused app sibling remains governed by CV-366 until its separate owner adoption. The registry still selects v2 pending review and integration.

**Per-family current-source search.** At base `0c40a7809826bcf509bbb16483bbdd8f4c48760b`, searched every live top-level `Plans/*.md`, `Plans/*.json`, event payloads, Goal body/source schemas, all Goal named bindings and the admission-record directory for `goal.completed`. Found the required Goal V2 name, its old D-R row and schema, GRS-048/050, GREPLAY-004..010, GRS-064/SP-287 sole body custody and dormant CV-366 app selector. Found no current V2-compatible family producer, original host-source edition, family observation binding or v3 identity. The old generic v2 recipe cannot supply current source authority. These technical bindings are authored here for this exact family; no sibling binding is inferred.

**Envelope and lifecycle custody.** Adopt `Plans/Contracts_V0.md#EventRecord` pm.event.v0@2.0.0 and CV-423, not a local envelope. Explicit Project/thread/Goal/Storage identity must match the actual canonical body and original host caller. Outer event_type is `goal.completed`, payload_schema_id is `pm.goal_runtime_event.goal_completed.schema.v3`, Project and thread equal payload values, run_id equals the owning continuation run, and actor/correlation/causation/account facts come from that original caller. No focus/main/null-Project fallback. The immutable event has no objective text, retired Goal topology or provider/tool output. Raw secrets reject before reservation/append. The body remains exactly GRS-048's four states active|paused|blocked|completed, with cancellation outside the enum.

**Sole writer, ordering and fences.** The host-only semantic producer `owner.goal.lifecycle.completed.v1` uses only `owner.goal.body.mutation@1.0.0` under GRS-064/SP-287. It admits a metadata_update, never an objective write: increment the one ordinary revision by exactly one, preserve objective/accepted-head/history/origin bytes, identity, created_at and active_run_ref unless its separate association owner supplies an admitted mutation. Authenticate exact prior body/control/currentness/accepted head, native host owner and permissions, cancellation/Stop/continuation epochs, caller/run identity and current Storage writer/maintenance/deletion/hold state. Capture every original input independently before helpers. Reserve the complete original metadata intent and genuine external authority under the shared body/control CAS; before terminal commit compare the whole actual reserved preimage and all original/current owner predicates after the final helper, with no helper between the pure predicate and commit.

The family protocol orders original host decision and original caller evidence, original producer custody/reservation, narrow atomic body/control/receipt commit, frozen EventRecord input, SP-286 first AppendReceipt, then terminal producer publication. Before body commit, a proven no-effect outcome produces no event or success; after a body commit, event failure cannot undo or repeat it and must preserve the original pending producer operation until exact append/receipt resolution. Unknown is fenced, never converted to no-effect by timeout or absence. The standalone shared body receipt proves only its body effect. A terminal producer publication requires the exact retained body receipt and original event's first SP-286 receipt/full-value commitment; an event observation does not alone publish success or allow another continuation. **Unbound producer edge:** no complete registered physical original host-decision/source-and-pending-result edition currently carries this family protocol across the body-to-event boundary. Authoring this order does not invent one: native reserve/append is refused until that source edition, method installation, backup coherence and original-result resolver are supplied and adopted. This is owner implementation work, not a new product decision.

Continuation operation identity preserves GRS-050's tuple `(goal_id, goal_revision, owning_run_id, next_attempt_ref)`; completion has no new next dispatch. Capture its original nullable next_attempt_ref exactly. Rechecking an already accepted tuple resolves the immutable original effect/result, rather than creating a new lifecycle revision. Stop/Pause/Cancel, objective/bound-Plan revision and run replacement fence the appropriate epochs under GREPLAY-009..010; a stale epoch is never refreshed into success. An owner outage, missing source, unresolved receipt, required-work barrier or unknown recovery fact is unavailable/fenced, never completion or permission to resume.
**Exact ordinary completion predicates and bounded edges.** The host alone decides complete from an original GRS-050 continuation evaluation with nonempty owning-caller completion_evidence_refs, not a model final message, provider final, body receipt, event or generic accepted marker. At the final body boundary, reload exact canonical Goal/currentness/Stop epoch and adopt GREPLAY-004..008 by name: (1) every required current To-Do in the exact current list identity/revision is resolved, with a skipped item requiring an explicit accepted skip disposition; a removed historical item cannot satisfy it; (2) no admitted tool/background subagent/work, bound PlanRun or recovery-required/unresolved work remains; (3) an internal workflow predicate is met by reference to that actual owner and current source identity, without copying phases or criteria into Goal state. The ordinary bound edge is active -> completed after all these predicates. The committed body clears blocked_reason_ref. Repeated original continuation identity returns the original effect/result. A completed source accepts no new transition. **Unbound individual edges:** completion directly from paused under a manual Stop, or from blocked without a separately admitted resolution/current continuation evaluation, is refused until its owner binding is explicit. Neither current evidence alone nor a late callback bypasses Stop, body CAS or those barriers.

**DL-081 route stays refused.** The approved-exception completion semantics remain approved and historically preserved, but GRS-065 still lacks the separate Goal/Workflow/HITL original exception/waiver route. This v3 successor admits only ordinary evidence-gated completion. It cannot consume certified_with_approved_exception, truthful completed_with_approved_verification_exception or an incomplete-item disposition as ordinary proof. No new product question is raised; the missing route is a specific owner contract dependency.

### GRS-205 - Historical-only goal.evidence_captured in both scopes

```yaml
plan_unit_id: GRS-205
unit_type: owner_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: DL-079 and Card 3 A prohibit every current goal.evidence_captured writer in both scopes before dedupe;
  retain exact historical predicates and approved next-checkpoint app withdrawal.
gui_related: false
gui_classification_reason: Internal event, custody and host predicates; no new visual surface.
split_recommended: false
depends_on:
- GRS-048
- GRS-049
- GRS-064
- DL-079
unblocks: []
acceptance_criteria:
- Every new/equal retry is refused in both scopes before any owned effect.
- Exact originally lawful history remains readable without present action authority.
- Unused app edition withdrawal is approved for integration, never performed here.
validation_surfaces:
- Plans/goal_evidence_captured_history_contract_fixtures.json
- python3 scripts/pm_goal_history_reader_fixtures.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_event_authority
reasoning_tier: high
context_scope: grs-205_event_authority
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- event-authority-20261104/reviews/DG-sol/REVIEW.md
preserved_exact_tokens: []
negative_constraints:
- No registry or app edition change, native admission or runtime proof.
owner_hints:
- Plans/Goal_Runtime_System.md
```

**Per-family current-source search (2026-11-04).** Searched all live top-level Plans documents/JSON, exact-family v2 and app resources, Goal/Workflow/Permissions source graphs, production wiring and admission records for `goal.evidence_captured` at `0c40a7809826bcf509bbb16483bbdd8f4c48760b`. Found old D-R07/Known-37 schema-minima/identity listings and the unadopted CV-366 application selector; no current original producer, admitted source edition, family read/checkpoint binding or admission record names this exact event. GRS-048/049/052/064 and GRS-065 retain the ownership move in DL-079. E-CARDS-1 Card 3 A (DL-409 on unlanded origin/plans/ea-cards1-answers-20261104) confirms it for both scopes and approves withdrawal of this exact unused app edition at the next registry checkpoint. No new product or retention decision is taken.
**Newly authored exact-family owner contract under DL-045, applying DL-079 and Card 3 A.** `goal.evidence_captured` is historical-only in both application and Project scope. No host, worker, Workflow callback, command, timer, recovery, retry, migration or future app adopter may write it. Refuse before dedupe/CAS/outbox/append, including equal old keys, a valid old schema and projector_replay_only. This is the explicit current-writer cutoff. A retained lawful original may be read; a new forbidden append never acquires authority by surviving in seglog.

Goal evidence collection moved to the actual Workflow/run evidence owner; GoalRecordV2 carries no evidence ledger. Preserve original evidence_kind/source_spans/content_hash/currentness/redaction and optional snapshot/retention refs. Non-validator spans, artifact snapshots, outer/inner redaction equality, provenance/hash/span bounds, original source/permission and nonterminal-state preservation are required. Unknown currentness cannot satisfy verification or completion.

The unchanged whole Project v2 resource `pm.goal_runtime_event.goal_evidence_captured.schema.v2` at `Plans/event_payloads/goal_runtime/goal_evidence_captured.schema.json#` and original v1 compatibility route retain their exact historical bytes/semantics. Current four-state Goal/currentness and Workflow facts never fill historical gaps or resurrect old Goal structure. SP-431 owns the sole exact historical reader `storage.goal_evidence_captured_history_read.v1@1.0.0`, explicitly adopted by SP-339 pm inspect and F3-666 only for that EventRecord's original interpretation. Neither pm tail nor pm export invokes it; their generic raw read remains SP-339. No current Goal state, To-Do, notification, continuation, tool action, certification or replacement event is derived. Withdrawing this reader disables interpretation and preserves original custody. CV-424 qualifies every old current-write roster/matrix claim for this exact family. ATS-211 covers conditional original-lawful and refusal oracles; no historical instance or native reader is asserted.

**Approved checkpoint follow-up.** Withdraw only `goal.evidence_captured`'s unused application edition at the next registry checkpoint under Card 3 A; keep old Project records, v2 schema and retention unchanged. This branch records the approved instruction and edits neither registry nor app schema/source edition. It does not choose permanent frozen registration or future app writers.

### GRS-206 - Historical-only goal.receipt_recorded in both scopes

```yaml
plan_unit_id: GRS-206
unit_type: owner_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: DL-079 and Card 3 A prohibit every current goal.receipt_recorded writer in both scopes before dedupe;
  retain exact historical predicates and approved next-checkpoint app withdrawal.
gui_related: false
gui_classification_reason: Internal event, custody and host predicates; no new visual surface.
split_recommended: false
depends_on:
- GRS-048
- GRS-049
- GRS-064
- DL-079
unblocks: []
acceptance_criteria:
- Every new/equal retry is refused in both scopes before any owned effect.
- Exact originally lawful history remains readable without present action authority.
- Unused app edition withdrawal is approved for integration, never performed here.
validation_surfaces:
- Plans/goal_receipt_recorded_history_contract_fixtures.json
- python3 scripts/pm_goal_history_reader_fixtures.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_event_authority
reasoning_tier: high
context_scope: grs-206_event_authority
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- event-authority-20261104/reviews/DG-sol/REVIEW.md
preserved_exact_tokens: []
negative_constraints:
- No registry or app edition change, native admission or runtime proof.
owner_hints:
- Plans/Goal_Runtime_System.md
```

**Per-family current-source search (2026-11-04).** Searched all live top-level Plans documents/JSON, exact-family v2 and app resources, Goal/Workflow/Permissions source graphs, production wiring and admission records for `goal.receipt_recorded` at `0c40a7809826bcf509bbb16483bbdd8f4c48760b`. Found old D-R09/Known-37 schema-minima/identity listings and the unadopted CV-366 application selector; no current original producer, admitted source edition, family read/checkpoint binding or admission record names this exact event. GRS-048/049/052/064 and GRS-065 retain the ownership move in DL-079. E-CARDS-1 Card 3 A (DL-409 on unlanded origin/plans/ea-cards1-answers-20261104) confirms it for both scopes and approves withdrawal of this exact unused app edition at the next registry checkpoint. No new product or retention decision is taken.
**Newly authored exact-family owner contract under DL-045, applying DL-079 and Card 3 A.** `goal.receipt_recorded` is historical-only in both application and Project scope. No host, worker, Workflow callback, command, timer, recovery, retry, migration or future app adopter may write it. Refuse before dedupe/CAS/outbox/append, including equal old keys, a valid old schema and projector_replay_only. This is the explicit current-writer cutoff. A retained lawful original may be read; a new forbidden append never acquires authority by surviving in seglog.

The actual Workflow/run owns certification and receipts; Goal V2 has no certification tier, child receipt graph or receipt-driven state. Preserve original receipt/kind/tier/output/dependency refs and original certifier decision. Require pre-existing valid original receipt, exact dependency completeness, original exception approval/residual-risk evidence and rejection/block reason evidence. The original running|verifying|repairing|degraded|blocked state is preserved; terminal/created/scheduled/paused/stopped originals reject. Recording receipt history never completes a current Goal.

The unchanged whole Project v2 resource `pm.goal_runtime_event.goal_receipt_recorded.schema.v2` at `Plans/event_payloads/goal_runtime/goal_receipt_recorded.schema.json#` and original v1 compatibility route retain their exact historical bytes/semantics. Current four-state Goal/currentness and Workflow facts never fill historical gaps or resurrect old Goal structure. SP-432 owns the sole exact historical reader `storage.goal_receipt_recorded_history_read.v1@1.0.0`, explicitly adopted by SP-339 pm inspect and F3-666 only for that EventRecord's original interpretation. Neither pm tail nor pm export invokes it; their generic raw read remains SP-339. No current Goal state, To-Do, notification, continuation, tool action, certification or replacement event is derived. Withdrawing this reader disables interpretation and preserves original custody. CV-425 qualifies every old current-write roster/matrix claim for this exact family. ATS-211 covers conditional original-lawful and refusal oracles; no historical instance or native reader is asserted.

**Approved checkpoint follow-up.** Withdraw only `goal.receipt_recorded`'s unused application edition at the next registry checkpoint under Card 3 A; keep old Project records, v2 schema and retention unchanged. This branch records the approved instruction and edits neither registry nor app schema/source edition. It does not choose permanent frozen registration or future app writers.

### GRS-207 - Historical-only goal.tool_check_recorded in both scopes

```yaml
plan_unit_id: GRS-207
unit_type: owner_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: DL-079 and Card 3 A prohibit every current goal.tool_check_recorded writer in both scopes before
  dedupe; retain exact historical predicates and approved next-checkpoint app withdrawal.
gui_related: false
gui_classification_reason: Internal event, custody and host predicates; no new visual surface.
split_recommended: false
depends_on:
- GRS-048
- GRS-049
- GRS-064
- DL-079
unblocks: []
acceptance_criteria:
- Every new/equal retry is refused in both scopes before any owned effect.
- Exact originally lawful history remains readable without present action authority.
- Unused app edition withdrawal is approved for integration, never performed here.
validation_surfaces:
- Plans/goal_tool_check_recorded_history_contract_fixtures.json
- python3 scripts/pm_goal_history_reader_fixtures.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_event_authority
reasoning_tier: high
context_scope: grs-207_event_authority
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- event-authority-20261104/reviews/DG-sol/REVIEW.md
preserved_exact_tokens: []
negative_constraints:
- No registry or app edition change, native admission or runtime proof.
owner_hints:
- Plans/Goal_Runtime_System.md
```

**Per-family current-source search (2026-11-04).** Searched all live top-level Plans documents/JSON, exact-family v2 and app resources, Goal/Workflow/Permissions source graphs, production wiring and admission records for `goal.tool_check_recorded` at `0c40a7809826bcf509bbb16483bbdd8f4c48760b`. Found old D-R13/Known-37 schema-minima/identity listings and the unadopted CV-366 application selector; no current original producer, admitted source edition, family read/checkpoint binding or admission record names this exact event. GRS-048/049/052/064 and GRS-065 retain the ownership move in DL-079. E-CARDS-1 Card 3 A (DL-409 on unlanded origin/plans/ea-cards1-answers-20261104) confirms it for both scopes and approves withdrawal of this exact unused app edition at the next registry checkpoint. No new product or retention decision is taken.
**Newly authored exact-family owner contract under DL-045, applying DL-079 and Card 3 A.** `goal.tool_check_recorded` is historical-only in both application and Project scope. No host, worker, Workflow callback, command, timer, recovery, retry, migration or future app adopter may write it. Refuse before dedupe/CAS/outbox/append, including equal old keys, a valid old schema and projector_replay_only. This is the explicit current-writer cutoff. A retained lawful original may be read; a new forbidden append never acquires authority by surviving in seglog.

The executing Workflow/run owns tool checks and evidence; Permissions owns policy/approval resolution. Goal V2 has no tool-check loop or Goal-owned worker authority. Preserve tool_call_id/name/check_kind/result/policy_decision and original output/log refs. Passed+allow/not_applicable needs an original output/log; failed/blocked/unknown needs an original log; approval_required needs original common approval/block proof and cannot pass; deny cannot pass. All output stays by reference with original secret handling. Preserve scheduled|running|verifying|repairing|degraded|blocked; any state change was a separately named event.

The unchanged whole Project v2 resource `pm.goal_runtime_event.goal_tool_check_recorded.schema.v2` at `Plans/event_payloads/goal_runtime/goal_tool_check_recorded.schema.json#` and original v1 compatibility route retain their exact historical bytes/semantics. Current four-state Goal/currentness and Workflow facts never fill historical gaps or resurrect old Goal structure. SP-433 owns the sole exact historical reader `storage.goal_tool_check_recorded_history_read.v1@1.0.0`, explicitly adopted by SP-339 pm inspect and F3-666 only for that EventRecord's original interpretation. Neither pm tail nor pm export invokes it; their generic raw read remains SP-339. No current Goal state, To-Do, notification, continuation, tool action, certification or replacement event is derived. Withdrawing this reader disables interpretation and preserves original custody. CV-426 qualifies every old current-write roster/matrix claim for this exact family. ATS-211 covers conditional original-lawful and refusal oracles; no historical instance or native reader is asserted.

**Approved checkpoint follow-up.** Withdraw only `goal.tool_check_recorded`'s unused application edition at the next registry checkpoint under Card 3 A; keep old Project records, v2 schema and retention unchanged. This branch records the approved instruction and edits neither registry nor app schema/source edition. It does not choose permanent frozen registration or future app writers.
