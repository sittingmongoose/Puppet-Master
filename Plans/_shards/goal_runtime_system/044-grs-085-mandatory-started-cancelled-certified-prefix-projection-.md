# Shard 044: GRS-085 — Mandatory started/cancelled/certified prefix projection, scope validation, halt rules and source lifetime (2026-09-21)

Source: `Plans/Goal_Runtime_System.md`

Source lines: L8332-L8758

Source SHA256: `7c5f108f750b470546632e08a20b98563509857f0d7d18a2b6cefeea28aec347`

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
  It may not use Crew at all. Crews, plans, reviews and similar systems may start a separate Goal with no parent edge under GRS-052; the Goal uses the initiating chat Persona/model. Body/revisions/origin/control/pending, creation/update/cancel results,
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
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-assistant-contract-check.py
- scripts/pm-plan-index.py
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
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-assistant-contract-check.py
- scripts/pm-plan-index.py
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
