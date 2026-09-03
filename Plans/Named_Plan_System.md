# Named Plan System

> **Authority:** This document is the sole canonical owner of the user-facing `NamedPlan` aggregate and immutable `named_plan_id`. It owns Plan name, aggregate lifecycle, priority, lineage summary, current/historical child refs, attention summary, revision/currentness, Project membership, navigation identity, and lightweight shell creation. It does not own PRD, PlanningRun, Plan document, Plan Compile, Goal, runtime, Source Control, Project, Settings, backup, or evidence state machines.

## 1. Product boundary and terminology

User-facing language is `Plan`, `Plans`, and `New Plan`. The canonical aggregate type is `NamedPlan`; the canonical immutable identity field is `named_plan_id`. `PlanWorkstream`, `plan_workstream_id`, and aggregate uses of `plan_lineage_id` are migration aliases only. New writers MUST use `NamedPlan` and `named_plan_id`.

A Named Plan groups the long-lived intention and lineage that can pass through PRD Builder, Planning Wizard, approved Plan documents, Plan Compile, Goals, runtime work, testing, evidence, and historical attempts. It is not any one child record and cannot absorb their lifecycle or authority. Focus, selected tab, visible thread, or active Goal never decides Plan identity; every mutation and runtime handoff carries explicit `project_id` and `named_plan_id`.

Named Plan System owns:

- immutable ID and editable human name;
- membership in exactly one Project;
- `active|archived` aggregate lifecycle and user priority;
- derived user phase and bounded progress/attention summary;
- one current primary PRD ref, current PlanningRun/ApprovedPlanPack/PlanCompileRun/Goal refs when they exist, and immutable historical refs;
- immediate atomic creation of a lightweight durable Plan shell and thread group;
- rename, open/switch, archive, restore, priority, and route/state restoration semantics;
- migration from singleton/project-only planning records and the conflicting candidate ID names.

It does not own:

- Project identity/registration/list/archive (`Plans/Project_System.md`);
- PRD content, source intake, or PRD approval;
- Planning Wizard topics, ledgers, audits, final pack, or approval CAS;
- canonical Plan document/PlanUnit contents or Plan Compile/WorkNode generation;
- Goal/Executor/Orchestrator scheduling, pause/cancel/recovery, agents, queues, or runtime phase truth;
- Git/JJ/forge/worktree, Files, Browser, testing, evidence, Usage, or artifacts;
- Settings values, Project Sync/move, backup/restore, Server/Vault/topology, secrets, or storage mechanics.

ContractRef: ContractName:Plans/Project_System.md, ContractName:Plans/PRD_Builder.md, ContractName:Plans/Planning_Wizard.md, ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/storage-plan.md

## 2. Typed aggregate and invariants

`Plans/named_plan_system_contracts.schema.json` closes `NamedPlanRecord`, one owner-DRY `NamedPlanActionRequest`, `NamedPlanActionResult`, `NamedPlanActionError`, `NamedPlanActionAvailability`, and `NamedPlanMigrationReceipt`. `Plans/named_plan_system_contract_fixtures.json` supplies static examples and negative cases for all six exact command IDs.

`named_plan_id` and `project_id` are immutable. Rename does not change identity, child refs, approval CAS, idempotency, history, or runtime work. Moving a Named Plan across Projects is not supported; clone/copy, if later admitted, creates a new identity and explicit lineage. Duplicate names are allowed and shown with Project plus short ID; name equality never merges Plans.

Aggregate lifecycle is `active|archived`. `phase` is a derived, non-authoritative projection with values `idea`, `prd`, `planning`, `approved`, `compiling`, `executing`, `paused`, `blocked`, or `completed`. Child owners publish refs and phase evidence; Named Plan reduces them under a recorded projection generation. It cannot advance a child, mark a Goal complete, approve a PRD/Plan, or certify build/runtime success. Unknown or conflicting child currentness yields `blocked` or the last known phase with explicit stale disclosure, never fabricated progress.

Each Named Plan has zero or one current primary PRD ref. Superseded PRDs remain historical refs. It may have one current PlanningRun, ApprovedPlanPack, PlanCompileRun, and active Goal lineage per admitted child-owner rules, plus immutable historical refs. Multiple background runs or agents may overlap when their owners allow; the aggregate summary must not collapse them into one fake run. Current refs use exact revision/currentness hashes and validated Project/Named Plan parent edges.

Creation atomically writes a minimal `NamedPlanRecord`, a thread-group ref, Project membership, revision 1, and a creation receipt. It does not create a PRD, PlanningRun, PlanCompileRun, Goal, WorkNode, worktree, provider request, or build. The next-step route offers `Start with PRD`, `Import`, `Start in Chat`, or `Open Planning Wizard` as owner routes. A route opening successfully is not proof that its child record completed.

## 3. Exact actions and command ownership

The exact Named Plan command IDs requiring central catalog registration are:

| Command ID | Meaning | Required result boundary |
|---|---|---|
| `cmd.named_plan.create` | Create a durable Named Plan shell in one Project | Returns `named_plan_id`, revision, thread-group ref, route, and creation receipt; no child runtime is created. |
| `cmd.named_plan.open` | Select/open a Named Plan by explicit Project and Plan identity | Navigation only; switching cannot pause or cancel background work. |
| `cmd.named_plan.rename` | Change human name under expected revision | Identity and child CAS/refs remain unchanged. |
| `cmd.named_plan.archive` | Hide an active Plan from default lists | Child work is not cancelled; active work requires explicit warning and owner navigation. |
| `cmd.named_plan.restore` | Restore an archived Plan to active lists | No child state mutation. |
| `cmd.named_plan.set_priority` | Set user priority `low|normal|high|urgent` | Scheduling owners may consume it but retain effective scheduling authority. |

These exact IDs are canonical owner requests but are not registered until the central command catalog, event catalog, and production wiring rows adopt them. Until then, GUI controls remain disabled with `command_not_registered`; no page-local handler or alias may simulate success.

Every request carries `schema_id`, `schema_version`, command ID, command instance ID, `project_id`, `named_plan_id` when applicable, expected aggregate revision, expected currentness hash, actor, permission snapshot, idempotency key, source surface, return route, active-child expectation, child-work disposition, and conditional confirmation. Create carries name and priority, allocates identity, and fixes child disposition to `no_child_runtime_created`. Every other action fixes it to `preserve_unchanged`; archive with expected active child work requires explicit confirmation. Results and errors fix `child_work_mutated: false`, preserve exact revision/currentness and failure state, and availability names the missing catalog/native/storage/Event Authority/production prerequisite. Duplicate idempotency bindings return the original result; same key/different binding is rejected.

Typed errors are `invalid_request`, `project_not_found`, `named_plan_not_found`, `stale_named_plan_revision`, `stale_currentness`, `duplicate_id_conflict`, `command_not_registered`, `permission_denied`, `archive_state_required`, `active_child_work_requires_review`, `parent_edge_invalid`, `migration_required`, `owner_unavailable`, or `cancelled`. A failure remains a failure and never advances phase or emits a success-shaped receipt.

## 4. GUI projection and cross-surface routing

The shell header may show a Named Plan switcher and one dominant `New Plan` CTA. The switcher groups by Project and shows human name, derived phase, bounded progress, active/queued agent summary, attention, priority, and last activity. Technical IDs/currentness live in Details. Duplicate names include Project/short-ID disambiguation. Switching restores the selected Plan's last route, tab, filters, inspector, scroll, and focus, while background work in every Plan continues under its owner.

The Orchestrator remains the owner of its seven-tab surface and effective All Active/Project/Plan scopes. It consumes explicit `named_plan_id`, shows current versus historical child refs, and never mutates whatever happens to be focused. Named Plan is a scope/lineage join, not an eighth Orchestrator lifecycle. Assistant Chat, PRD Builder, Planning Wizard, Documents/History, Usage, Runtime Artifacts, and search/deep links carry explicit Plan identity when scoped and show a truthful no-Plan state otherwise.

`New Plan` opens a concise name field with one primary `Create Plan` action and secondary Cancel. Advanced choices are not required at creation. After success, one clear next step is prominent; alternate PRD/import/Chat/Planning routes use progressive disclosure. Rename is inline or a small dialog, never a destructive recreate. Archive and restore show exact effects and do not imply child cancellation or deletion.

Switcher open/close uses `160 ms`; selection highlight settles in `120 ms`; newly created row reveal uses `180 ms`; inline rename settles in `120 ms`. No transition blocks input or waits for child hydration. Reduced Motion changes state immediately and announces the new Plan. Slint implementation uses stable model IDs, bounded list virtualization, opacity/translation/clipping, and narrow updates; hidden Plans stop decorative work but not owner operations. A stale refresh cannot steal focus or move the selected row.

Keyboard users can open the switcher, search, move among Projects/Plans, select, create, rename, archive, restore, and close without a pointer. Focus returns to the invoking control after Cancel/error and moves to the new Plan heading only after committed creation. Phase, progress, priority, and attention use text plus icon, never color alone. Long/localized names wrap/elide with full accessible text. Precise waiting copy names the owner reason (`Waiting for sign-in`, `Waiting for approval`, `Waiting for host`, or `Needs attention`) and never says merely `Working` when an owner reason exists.

## 5. Persistence, events, and migration

Storage owns the physical binding, replay, retention, indexes, and projector checkpoints for the Named Plan record family. Named Plan System owns payload semantics. Canonical storage keys and events require central Storage/Contracts adjudication; this document does not invent them as registered bytes. New storage writers are disabled until that registration closes.

The required semantic events are `named_plan.created`, `named_plan.renamed`, `named_plan.archived`, `named_plan.restored`, `named_plan.priority_changed`, and `named_plan.child_refs_changed`. These names require central EventRecord registration and payload schemas before emission. Navigation-only open/switch records an explicit no-persist route receipt unless the shell owner persists selected Plan convenience state. Event envelopes carry Project and Named Plan identity, aggregate revision, actor, correlation/causation, idempotency, currentness, owner child refs when changed, and redacted source refs.

Migration selects `NamedPlan`/`named_plan_id` as canonical and treats `PlanWorkstream`, `plan_workstream_id`, and aggregate `plan_lineage_id` as read aliases. For each legacy Project planning lineage, migration creates exactly one Named Plan when Project and lineage edges validate; it never merges records across Projects or unrelated lineages. An explicit verified legacy immutable candidate may be retained as an alias, but canonical writers receive a `named_plan_id`. Missing Project, conflicting candidate IDs, dangling child refs, wrong kinds, stale hashes, or ambiguous singleton grouping quarantine before publication.

Singleton legacy Project planning state becomes one `Imported Plan` only when all admitted child refs share one verified Project/lineage cluster. Multiple clusters create separate Plans; missing evidence does not collapse them. Migration preserves current/historical refs, revisions, names when present, approval hashes, and child-owner custody. It never reruns PRD approval, Planning Wizard, Plan Compile, Goal, provider, source-control, sync, or backup work. Receipts record alias mapping, accepted/quarantined refs, before/after hashes, and unresolved residual risk.

## 6. Verification

Structural tests validate all schema definitions and fixtures, immutable ID under rename, duplicate names, create idempotency, wrong-Project parent rejection, current/historical ref integrity, one-primary-PRD rule, archive/restore, active-child warning, phase/currentness conflict, command-disabled behavior before catalog registration, event-disabled behavior before EventRecord registration, singleton/multiple-cluster migration, alias collision/quarantine, and no-secret records.

GUI/behavior tests cover switcher grouping and search; explicit Project/Plan scope; create/rename/archive/restore; background continuity while switching; state restoration; stale refresh/focus protection; seven Orchestrator tabs as consumer; precise waiting copy; large virtualized lists; six widths; eight themes; keyboard/screen reader; Reduced Motion; interruption/reversal/rapid switching; Slint portability; and no fake success. Static validation is not runtime registration, persistence, GUI, migration, event, wiring, or buildability proof.

## 7. PlanUnits

### NPLAN-001 - NamedPlan aggregate and identity

```yaml
plan_unit_id: NPLAN-001
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Named_Plan_System.md
canonical_text: Named Plan System is the sole owner of the user-facing NamedPlan aggregate and immutable named_plan_id, editable name, Project membership, active/archive lifecycle, priority, derived phase/attention summary, current and historical child refs, revision/currentness, navigation identity, and lightweight shell creation without re-owning any child PRD, Planning, Plan Compile, Goal, runtime, Project, Settings, sync, or backup state machine.
gui_related: true
gui_classification_reason: Named Plan creation, switcher, name, phase, priority, attention, archive, and routing are user-visible.
depends_on: [PJCT-001, PWIZ-001]
unblocks: []
acceptance_criteria:
  - NamedPlan and named_plan_id are the only canonical writer names; conflicting candidates are migration aliases.
  - Rename and switch never change identity or interrupt child owner work.
  - One current primary PRD and every current/historical child ref preserve validated Project/Plan lineage.
validation_surfaces: [Plans/named_plan_system_contracts.schema.json, Plans/named_plan_system_contract_fixtures.json, parent-edge and alias negative fixtures]
risk_class: named_plan_identity_or_child_owner_collapse
reasoning_tier: high
context_scope: named_plan_aggregate
implementation_surfaces: [Plans/Named_Plan_System.md, Plans/named_plan_system_contracts.schema.json]
node_compile_hint: {mode: named_plan_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "source_report:register-fullthread.md#R-052"
  - "source_report:canon-settings-performance-onboarding.md#C-12"
negative_constraints: [Do not use UI focus as Plan authority., Do not duplicate child state machines., Do not merge Plans by name.]
```

### NPLAN-002 - Named Plan commands, projection, and migration

```yaml
plan_unit_id: NPLAN-002
unit_type: requirement
status: accepted
owner_doc: Plans/Named_Plan_System.md
canonical_text: Named Plan lifecycle uses exact typed create/open/rename/archive/restore/priority commands with revision/currentness/idempotency, a grouped Project-aware switcher that preserves background work and state restoration, and receipt-backed migration from singleton and candidate-ID lineage; commands/events/storage remain disabled until central registration and production wiring close.
gui_related: true
gui_classification_reason: Defines the complete switcher/New Plan flow, visible status, motion, accessibility, and lifecycle actions.
depends_on: [NPLAN-001]
unblocks: []
acceptance_criteria:
  - All six exact IDs validate through one owner-DRY request/result/error/availability family with conditional identity, currentness, revision, confirmation, and child-preservation requirements.
  - Exact commands fail with command_not_registered until central catalog adoption.
  - Switching Plans restores view state and never pauses/cancels owner work.
  - Migration splits distinct lineage clusters and quarantines ambiguous or cross-Project refs.
validation_surfaces: [Plans/named_plan_system_contracts.schema.json, Plans/named_plan_system_contract_fixtures.json, lifecycle and migration fixtures]
risk_class: named_plan_command_or_migration_false_success
reasoning_tier: high
context_scope: named_plan_actions_gui_migration
implementation_surfaces: [Plans/Named_Plan_System.md, Plans/named_plan_system_contracts.schema.json]
node_compile_hint: {mode: named_plan_actions_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "source_report:wave9-lane3.md#Named-Plan-GUI"
negative_constraints: [Do not emit unregistered events., Do not persist unregistered storage keys., Do not treat route success as child completion.]
```

## 8. Stage boundary

These PlanUnits and schemas close static canonical ownership and typed command-shape coverage only. The central catalog, native sole handlers, storage writers, Event Authority payload registration, production wiring/reverse coverage, GUI implementation, migration execution, and runtime proof remain absent. They create no WorkNodes, NodeSeeds, executable queues, Named Plan records, emitted commands/events, storage keys, generated indexes, or certification evidence.

## Central Sole Future Handler Binding Addendum - 2026-09-01

This owner adjudicates exactly 6 previously unbound primary commands. The table is the sole future-route authority; it does not prove a dispatcher, executable handler, durable effect, provider capability, native Slint surface, security result, or runtime certification. Every command remains `handler_unavailable` until source-hashed native evidence closes its typed availability, permission, receipt/ObservableWork, failure, currentness, idempotency, restart, race, accessibility, and reverse-GUI obligations.

| Command | Sole future handler | Request -> result | Error / permission |
|---|---|---|---|
| `cmd.named_plan.archive` | `handlers::named_plan::archive` | `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_request` -> `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_result` | `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_error` / `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_request/properties/permission_snapshot_ref` |
| `cmd.named_plan.create` | `handlers::named_plan::create` | `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_request` -> `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_result` | `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_error` / `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_request/properties/permission_snapshot_ref` |
| `cmd.named_plan.open` | `handlers::named_plan::open` | `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_request` -> `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_result` | `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_error` / `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_request/properties/permission_snapshot_ref` |
| `cmd.named_plan.rename` | `handlers::named_plan::rename` | `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_request` -> `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_result` | `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_error` / `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_request/properties/permission_snapshot_ref` |
| `cmd.named_plan.restore` | `handlers::named_plan::restore` | `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_request` -> `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_result` | `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_error` / `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_request/properties/permission_snapshot_ref` |
| `cmd.named_plan.set_priority` | `handlers::named_plan::set_priority` | `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_request` -> `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_result` | `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_error` / `Plans/named_plan_system_contracts.schema.json#/$defs/named_plan_action_request/properties/permission_snapshot_ref` |

The central closure emits no new EventRecord type. `expected_event_types=[]` is mandatory until Event Authority registers an owner event and payload. Owner-typed result/receipt/projection records remain required, and asynchronous work must correlate through the owner ObservableWork contract where applicable. Protected authentication, secret bytes, browser content, provider credentials, filesystem authority, trust, readiness, success, and completion are never inferred from dispatch acceptance.

Exact command set: `cmd.named_plan.archive`, `cmd.named_plan.create`, `cmd.named_plan.open`, `cmd.named_plan.rename`, `cmd.named_plan.restore`, `cmd.named_plan.set_priority`.

Exact sole future handler set: `handlers::named_plan::archive`, `handlers::named_plan::create`, `handlers::named_plan::open`, `handlers::named_plan::rename`, `handlers::named_plan::restore`, `handlers::named_plan::set_priority`.

### NPLAN-003 - Central Sole Future Handler Bindings

```yaml
plan_unit_id: NPLAN-003
unit_type: command_binding
status: accepted
owner_doc: Plans/Named_Plan_System.md
canonical_text: >-
  Named Plan System owns exactly 6 additional central command routes. Each command maps to the sole future handler shown in this addendum, consumes the existing owner-DRY request/result/error/availability/permission family, starts handler_unavailable, and earns no native implementation credit from a target string or production-intent row.
gui_related: true
gui_classification_reason: Settings, Onboarding/Doctor, owner workspaces, palette/API, and other named consumers expose some or all of these 6 commands and their exact disabled reasons.
depends_on: [NPLAN-001, NPLAN-002]
unblocks: []
acceptance_criteria:
- Every exact command ID in this 6-commands set maps one-to-one to the table's sole future handler target and no competing handler path exists.
- Every request, result, error, availability, permission, disabled-reason, receipt, ObservableWork, return-route, persistence, migration, and negative-security obligation remains owner-DRY.
- Every central production-intent row starts handler_unavailable, expected_event_types is empty, and static wiring is never represented as native implementation evidence.
- Commands System, UI Command Catalog, production wiring, Touch Closure, and every intended GUI consumer preserve exact reverse coverage without synthetic controls.
- Static schema, fixture, command/handler/GUI/reverse-wiring, accessibility, restart/race/currentness, and no-unregistered-event gates pass.
validation_surfaces:
- python3 scripts/pm-touch-closure-verify.py --json
- python3 scripts/pm-plans-verify.py validate-wiring-matrix
- python3 scripts/pm-new-contracts-verify.py
risk_class: command_route_authority_and_runtime_claim_boundary
reasoning_tier: high
context_scope: canonical_owner_command_binding
implementation_surfaces:
- Plans/Named_Plan_System.md
- Plans/Commands_System.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.production.json
- Plans/touch_closure.json
node_compile_hint:
  mode: owner_adjudicated_future_handler_bindings
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/touch_closure.json
- Plans/Wiring_Matrix.production.json
- user-approved Parallel Canon, Settings, and PMConcept7 Integration Plan
negative_constraints:
- Do not claim a native handler, runtime dispatch, durable effect, registered event, security result, readiness, or certification from this Plans-only binding.
- Do not duplicate owner schemas, state machines, repair logic, credentials, or provider operations in Settings, Onboarding, Doctor, or PMConcept7.
- Do not expose protected-auth content, secret bytes, private browser state, or provider credentials to agents, adapters, logs, receipts, capture, or ordinary GUI projections.
compile_disposition: extend_existing_owner
```

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.production.json, ContractName:Plans/touch_closure.json

## 9. Assistant Plan consumer boundary (2026-09-03)

Three durable meanings share the English word `Plan` and this document owns exactly one of them. `AssistantPlan` is a thread-scoped task Plan owned by `Plans/Assistant_Plan_Runtime.md`. `NamedPlan` is the durable cross-surface aggregate owned by this document. Canonical repository `Plans/**` documents plus their canonical PlanUnits are the Puppet Master product/build specification and are owned by `Plans/Plan_Document_System.md`. They are three separate types with three separate lifecycles, and no writer may use the bare word `Plan` in code, schema, command, event, or storage identity without a disambiguating type and owner prefix.

A small chat Plan stays `AssistantPlan` only. Creating, revising, building, canceling, or completing an `AssistantPlan` never creates a `NamedPlan`, never allocates a `named_plan_id`, never creates a Project planning lineage, and never appears in the Named Plan switcher. There is no implicit wrapper, no lazily materialized shell, and no background promotion. A `NamedPlan` child or source ref for an Assistant Plan comes into existence only through an explicit user-initiated durable action: an explicit save/promote action on the Plan card, an explicit `Send To Planning Wizard` handoff, or another explicit durable-Plan action that an owner document defines. Automatic promotion is a defect, not a convenience.

When such an explicit link is created, the Assistant Plan identity is preserved as a child/source ref, not absorbed. The link records `plan_id`, exact `plan_version`, the approved structured-document hash, the originating thread and message refs, backend kind (`direct` or `ledger_bound`), and, for a Deep Plan, the run-scoped ledger session ref and scoped PlanUnit bundle ref. The Assistant Plan runtime remains the sole authority for that Plan's document revisions, Revise flow, Build control state, PlanRun, adherence, and To-Do mapping after the link exists; this document only records that a relationship exists and reduces it into the aggregate summary and derived phase. Rename, archive, restore, or priority changes on the `NamedPlan` never mutate Assistant Plan content, version, hash, build state, or thread placement.

A `NamedPlan` link does not force Orchestrator. Linking an Assistant Plan to a `NamedPlan` creates no PRD, no PlanningRun, no ApprovedPlanPack, no PlanCompileRun, no NodeSeed, no WorkNode, no GoalRun, and no provider request. The only route from an Assistant Plan into full planning, Plan Compile, and Orchestrator is the explicit `Send To Planning Wizard` handoff owned by `Plans/Planning_Wizard.md`, and that route bypasses PRD Builder because the Assistant Plan is itself the intake specification. Until Planning Wizard produces an approved pack under its own rules, a linked `NamedPlan` remains at derived phase `idea` or `planning` with truthful child refs and must not display compile, execution, or certification progress it does not have.

File, attachment, and artifact detail surfaces may show a related `NamedPlan` when, and only when, such a link exists. The projection is read-only navigation: human name, Project, short ID, and an open route. Absence of a link renders a truthful no-linked-Plan state rather than an invented shell, and a detail surface never creates a `NamedPlan` as a side effect of being opened. Assistant Plan cards, Deep Plan ledgers, scoped PlanUnit bundles, and To-Do lists are not Named Plan children until an explicit link exists.

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md, ContractName:Plans/Planning_Wizard.md, ContractName:Plans/PRD_Builder.md, ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Plan_To_Node_Compilation.md

### NPLAN-004 - Assistant Plan Is Not Automatically A Named Plan

```yaml
plan_unit_id: NPLAN-004
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Named_Plan_System.md
canonical_text: >-
  AssistantPlan, NamedPlan, and canonical repository Plans/** specifications are three distinct types with separate owners and lifecycles, and a thread-scoped AssistantPlan is never automatically wrapped in a NamedPlan. A small chat Plan stays AssistantPlan-only through creation, revision, build, cancel, and completion, allocates no named_plan_id, and does not appear in the Named Plan switcher. A NamedPlan child or source ref is created only by an explicit user-initiated save/promotion action or an explicit Send To Planning Wizard handoff, and that link preserves plan_id, plan_version, approved document hash, thread/message refs, backend kind, and any Deep Plan ledger or scoped PlanUnit bundle refs as child/source identity rather than absorbing them.
gui_related: true
gui_classification_reason: Determines whether an Assistant Plan appears in the Named Plan switcher, aggregate lists, and Plan detail surfaces, and whether a promote action is offered.
depends_on:
  - NPLAN-001
unblocks: []
acceptance_criteria:
  - Creating, revising, building, canceling, or completing an Assistant Plan produces no NamedPlanRecord, no named_plan_id, and no switcher row.
  - A NamedPlan link exists only after an explicit save/promotion or Planning Wizard handoff request carrying exact Plan identity, version, and hash.
  - A created link stores the Assistant Plan as a child/source ref and leaves Assistant Plan Runtime authoritative for document revisions, Build state, PlanRun, and To-Do mapping.
  - Named Plan rename, archive, restore, and priority actions leave Assistant Plan content, version, hash, and build state unchanged.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Plans/named_plan_system_contract_fixtures.json
risk_class: assistant_plan_named_plan_conflation
reasoning_tier: high
context_scope: named_plan_assistant_plan_boundary
implementation_surfaces:
  - Plans/Named_Plan_System.md
  - Plans/Assistant_Plan_Runtime.md
node_compile_hint:
  mode: named_plan_consumer_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:PLAN-014
  - pm-assistant-implementation-2026-09-02-recovered:DRY-001
  - "packet:06_OWNER_AND_PLAN_CHANGES.md#Plans/Named_Plan_System.md"
  - "packet:07_DRY_OWNERSHIP_MAP.md#2"
preserved_exact_tokens:
  - "AssistantPlan"
  - "NamedPlan"
  - "named_plan_id"
  - "Send To Planning Wizard"
negative_constraints:
  - Do not create a NamedPlan shell implicitly for a thread Plan.
  - Do not use the bare word Plan as a type name without an owner-qualified type.
  - Do not let a Named Plan aggregate action mutate Assistant Plan runtime state.
owner_hints:
  - Plans/Named_Plan_System.md
  - Plans/Assistant_Plan_Runtime.md
```

### NPLAN-005 - Promotion Link Effects And Artifact Detail Projection

```yaml
plan_unit_id: NPLAN-005
unit_type: requirement
status: accepted
owner_doc: Plans/Named_Plan_System.md
canonical_text: >-
  Linking an Assistant Plan to a NamedPlan is a lineage record and never a runtime trigger: it creates no PRD, PlanningRun, ApprovedPlanPack, PlanCompileRun, NodeSeed, WorkNode, GoalRun, or provider request, and it does not admit the Plan into Orchestrator. The only route from an Assistant Plan into full planning, Plan Compile, and Orchestrator is the explicit Send To Planning Wizard handoff owned by Planning Wizard, which bypasses PRD Builder. File, attachment, and artifact detail surfaces may show a related NamedPlan as read-only navigation when a link exists and otherwise render a truthful no-linked-Plan state without creating an aggregate as a side effect.
gui_related: true
gui_classification_reason: Defines the related-Plan row in file/artifact details, the truthful empty state, and the absence of compile or execution progress on a merely linked Plan.
depends_on:
  - NPLAN-004
  - NPLAN-002
unblocks: []
acceptance_criteria:
  - Creating a NamedPlan link emits no child-runtime record and the aggregate derived phase stays idea or planning until a child owner publishes real evidence.
  - Opening a file, attachment, or artifact detail surface never creates or mutates a NamedPlan.
  - A detail surface with no link renders a truthful no-linked-Plan state instead of an invented shell or short ID.
  - Orchestrator admission for a promoted Plan is observable only through Planning Wizard approval refs, never through the Named Plan link itself.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Plans/named_plan_system_contract_fixtures.json
risk_class: named_plan_link_false_runtime_implication
reasoning_tier: high
context_scope: named_plan_link_projection
implementation_surfaces:
  - Plans/Named_Plan_System.md
  - Plans/Planning_Wizard.md
node_compile_hint:
  mode: named_plan_link_projection_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:PLAN-013
  - pm-assistant-implementation-2026-09-02-recovered:PLAN-014
  - pm-assistant-implementation-2026-09-02-recovered:DPLAN-008
  - "packet:15_EDGE_CASE_CLOSURES.md#2"
preserved_exact_tokens:
  - "Send To Planning Wizard"
  - "ApprovedPlanPack"
negative_constraints:
  - Do not treat a NamedPlan link as Orchestrator admission.
  - Do not display compile, execution, or certification progress that no child owner published.
  - Do not create aggregate records from read-only detail surfaces.
owner_hints:
  - Plans/Named_Plan_System.md
  - Plans/Assistant_Plan_Runtime.md
  - Plans/Planning_Wizard.md
```

## Additive Correction v4 — Assistant Plans Are Not NamedPlans (2026-09-03)

`PDET-005`. An Assistant Plan is thread-scoped. It is never written into the project
automatically and never promoted to a `NamedPlan` as a side effect of being created, built,
exported, or scheduled. A Quick Plan does not acquire project-scale Plan identity.

Promotion happens only through an explicit user promotion or a Planning Wizard handoff, which may
then bind `named_plan_id` on the Assistant Plan record. This document owns the `NamedPlan` side
of that binding; `Plans/Assistant_Plan_Runtime.md` owns the Assistant Plan and its runtime, and
this owner does not acquire authority over Plan content, versions, progress, or builds by virtue
of a binding existing.
