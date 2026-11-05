# Shard 044: GRS-085 — Mandatory started/cancelled/certified prefix projection, scope validation, halt rules and source lifetime (2026-09-21)

Source: `Plans/Goal_Runtime_System.md`

Source lines: L8132-L8355

Source SHA256: `2f0c402a4c410beec71687e269a7f09871ddf7f77ee580cab50c8056d6dfc89b`

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

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-085, ContractName:Plans/Plan_Document_System.md#PDS-003, ContractName:Plans/goal_certified_event_coordinator_contracts/protocol.md, ContractName:Plans/goal_run_certified_consumer_contracts/protocol.md, ContractName:Plans/goal_certified_family_composition.json


Q22 appearance amendment (Jared, 2026-10-30; Plans/Decision_Log.md#DL-257): current appearance contracts use five ordered families and ten variants. Earlier override-only or eight-theme evidence is historical, not current acceptance. Settings_System SSYS-043 owns the retired-key migration and retained NieR Adjust rows.

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
