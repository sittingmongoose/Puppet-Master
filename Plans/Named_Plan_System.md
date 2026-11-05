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

GUI/behavior tests cover switcher grouping and search; explicit Project/Plan scope; create/rename/archive/restore; background continuity while switching; state restoration; stale refresh/focus protection; seven Orchestrator tabs as consumer; precise waiting copy; large virtualized lists; six widths; ten themes; keyboard/screen reader; Reduced Motion; interruption/reversal/rapid switching; Slint portability; and no fake success. Static validation is not runtime registration, persistence, GUI, migration, event, wiring, or buildability proof.

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

## 10. Single owner-join resolver (2026-09-27)

PERF-001 closes every immutable child-to-NamedPlan join through ONE resolver contract owned
here, rather than duplicating each child state machine at every consumer. The closed shapes are
`named_plan_owner_join_request`, `named_plan_child_owner_view`, `named_plan_owner_join_verdict`,
and `named_plan_owner_join_case` in `Plans/named_plan_system_contracts.schema.json`; the
substantive comparison is `scripts/pm_named_plan_semantics.py`, proven by
`tests/test_named_plan_semantics.py` and the positive/negative fixtures in
`Plans/named_plan_system_contract_fixtures.json`.

A join request carries explicit immutable `project_id` and `named_plan_id` plus the exact
`child_ref`, `child_kind`, `child_revision`, `child_currentness_sha256`, the expected aggregate
revision and currentness hash, a read-or-mutate intent, and an optional claimed current/historical
edge. The authoritative resolver compares those values field by field against two trusted actuals:
the actual child-owner record and the actual aggregate record. It rejects wrong-Plan joins in the
SAME Project, wrong-Project joins, stale child revision or hash, stale aggregate revision or hash,
snapshot splits, orphans on neither aggregate edge, kind mismatches, focus-only requests without
explicit identity, forged caller-proposed views, and edge-claim mismatches, with first-failure-wins
precedence in the documented order. A verdict is accepted only when actual owner identity, revision,
hash, aggregate identity and generation, snapshot unity, and edge membership all agree, and it
names the found edge. The verdict itself carries no project or Plan identity, so ownership can
never be manufactured from the requested Plan.

Trust is split by producer. The GUI and caller supply only the request and an untrusted proposed
owner view. The actual owner record is minted exclusively by the child owner's adapter reading the
authoritative source keyed by the exact child kind and ref at one consistent snapshot; the actual
aggregate comes from that same snapshot. The resolver verifies every proposed view field against
the actual record before any join comparison uses it, so a forged view that agrees with the request
still rejects when the actual disagrees. Record acquisition keys the exact child kind and ref and
returns the stored original source edge; flat historical refs are membership-only and child kind
always comes from the authoritative actual record, never from the flat list.

Historical-edge acceptance authorizes read and history inspection only, never mutation: write,
approve, compile, and handoff require a current-edge accept with mutate intent, and a mutate intent
on a historical edge rejects. The closed shapes contain no match, verified, summary, lifecycle,
status, or phase field, so a self-attested matching summary can never be shaped into a join input,
and an opaque aggregate ref alone can never prove a join: actual kind, revision, and hash
comparisons must pass first. Child lifecycle and status stay owned by the child owner; owner views
carry identity plus snapshot fields only and the verdict carries no lifecycle claim. Scope view
persistence, such as a remembered selected Plan, is convenience only and never join authority:
every request still carries explicit identity and every join still resolves through this contract.
Fixture cases that copy a record prove static conformance of the comparison logic, never native
authenticity; live proof requires the adapters' actual consistent-snapshot source reads.

This section invents no production storage keys, no EventRecord registrations, no new lifecycle,
and no native handlers. The six `cmd.named_plan.*` commands and their `handler_unavailable`
bindings are unchanged; consumers below use them as-is.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/PRD_Builder.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Planning_Wizard.md

### NPLAN-006 - Single Owner-Join Resolver Contract

```yaml
plan_unit_id: NPLAN-006
unit_type: schema_contract
status: accepted
owner_doc: Plans/Named_Plan_System.md
canonical_text: >-
  Every immutable child-to-NamedPlan join resolves through the single closed owner-join
  contract: an explicit Project+NamedPlan request with exact child ref/kind/revision/hash,
  expected aggregate generation, and read-or-mutate intent is compared against the trusted
  actual child-owner record and actual aggregate at one consistent snapshot, after every
  caller-proposed view field is verified against the actual. It accepts only on full agreement
  with the found edge named, rejects wrong-Plan same-Project, wrong-Project, stale
  child/aggregate revision/hash, snapshot-split, orphan, kind mismatch, focus-only, forged-view,
  and edge-claim joins fail-closed, and never authorizes mutation on a historical edge. The join
  carries no lifecycle and accepts no self-attested match summary or opaque ref as proof.
gui_related: false
gui_classification_reason: Join resolution is an identity/currentness contract; visible scope and switcher behavior stays in the consumer units.
depends_on: [NPLAN-001, NPLAN-002]
unblocks: [OP-037, PRDB-013, PNC-026]
acceptance_criteria:
  - The request, owner-view, verdict, and case shapes are closed with no match, summary, lifecycle, or status field.
  - Same-Project wrong-Plan, stale child/aggregate revision/hash, snapshot-split, orphan, kind mismatch, focus-only, forged-view, and edge-claim joins all reject with their exact closed code.
  - Accepted joins name the found current or historical edge; every rejection names exactly one code with no found edge.
  - Fixture verdicts recompute field-identical from their four inputs under scripts/pm_named_plan_semantics.py.
  - Historical-edge acceptance authorizes read only; mutate intent on a historical edge rejects.
  - A forged view agreeing with the request still rejects when the actual record disagrees.
  - Child lifecycle and status remain owned by the child owner and appear nowhere in the join shapes.
validation_surfaces:
  - python3 -m unittest tests.test_named_plan_semantics
  - Plans/named_plan_system_contracts.schema.json
  - Plans/named_plan_system_contract_fixtures.json
risk_class: named_plan_join_false_accept
reasoning_tier: high
context_scope: named_plan_owner_join
implementation_surfaces:
  - Plans/Named_Plan_System.md
  - Plans/named_plan_system_contracts.schema.json
  - Plans/named_plan_system_contract_fixtures.json
  - scripts/pm_named_plan_semantics.py
  - tests/test_named_plan_semantics.py
node_compile_hint:
  mode: named_plan_owner_join_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "packet:PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08#PERF-001"
preserved_exact_tokens:
  - "named_plan_owner_join_request"
  - "named_plan_child_owner_view"
  - "named_plan_owner_join_verdict"
  - "wrong_plan_same_project"
  - "focus_only_no_explicit_identity"
  - "proposed_owner_view_mismatch"
  - "historical_edge_mutation_forbidden"
  - "stale_aggregate_revision"
negative_constraints:
  - Do not duplicate child state machines at consumers to prove joins.
  - Do not accept self-attested match summaries or opaque refs as join proof.
  - Do not trust a caller-supplied owner view without verifying every field against the actual record.
  - Do not authorize mutation on a historical edge.
  - Do not infer Plan identity from focus, tab, thread, or active Goal.
  - Do not invent storage keys, events, lifecycle, or handlers for the join.
owner_hints:
  - Plans/Named_Plan_System.md
  - Plans/Orchestrator_Page.md
  - Plans/PRD_Builder.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Planning_Wizard.md
```


Q22 appearance amendment (Jared, 2026-10-30; Plans/Decision_Log.md#DL-257): current appearance contracts use five ordered families and ten variants. Earlier override-only or eight-theme evidence is historical, not current acceptance. Settings_System SSYS-043 owns the retired-key migration and retained NieR Adjust rows.

## NPLAN-1559 — `named_plan.archived`: newly authored owner contract, prepared without admission

```yaml
plan_unit_id: NPLAN-1559
unit_type: interface_contract
status: accepted
owner_doc: Plans/Named_Plan_System.md
canonical_text: 'For exactly named_plan.archived@1.0.0, the adjacent twelve-criterion contract binds the already
  specified fact: cmd.named_plan.archive commits active to archived. Active child work requires the existing explicit
  warning/confirmation and preserve_unchanged disposition; no child is cancelled or deleted. Newly authored technical
  bindings follow deck-1 4b A (DL-411) and the documented exact-family search. Registry membership stays absent;
  criterion 12 remains PARTIAL until phase 2.'
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- NPLAN-001
- NPLAN-002
- NPLAN-006
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Named_Plan_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- named_plan.archived
- prepared_without_admission
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Named_Plan_System.md
```

1. **Membership/version.** `named_plan.archived@1.0.0` is a candidate only, with no registry append, admission record or native writer. All current paths return `missing_event_registration` until this exact family/source edition is admitted; siblings grant nothing.
2. **Owner.** This unit owns the semantic fact: cmd.named_plan.archive commits active to archived. Active child work requires the existing explicit warning/confirmation and preserve_unchanged disposition; no child is cancelled or deleted. Reuse NPLAN-001, NPLAN-002, NPLAN-006; payload binding is CV-1559, persistence is SP-1559.
3. **Producer.** Sole producer `NamedPlanOwner::archived` calls `storage.w3h.named_plan_archived.append.v1@1.0.0`. Source is NPLAN-001/002 NamedPlanRecord and original action receipt; NPLAN-006 genuine child-owner/aggregate snapshot for changed child refs. The source adapter methods `prepare_named_plan_archived`, `commit_named_plan_archived`, `resolve_named_plan_archived_original` are newly authored interfaces of that owner, not installed handlers. Verify actual before/after source identity, genuine original receipt/result and permissions before committing the existing owner effect plus its publication journal atomically; save the exact semantic envelope and payload once. Drain the pending event via ordinary Storage append, explicitly adopting SP-286/CV-339 first-AppendReceipt **full-value v2** custody and SP-336/347 durability classes; then CAS prepared→appended→settled using the exact prior whole journal value. Domain success acknowledgement waits for the original body result and first event receipt; dependent dispatch/terminal publication waits for required receipts. A crash after body commit preserves the body and pending publication, never rolls it back or repeats the domain effect. The missing-registration gate acts before new event preparation and confers no native authority on existing result-only paths.
4. **Payload.** `Plans/event_payloads/w3h/named_plan_archived.schema.json#/$defs/payload` is this family’s closed 1.0.0 schema. Every source field is compared to the genuine original owner result, not a caller-supplied matching snapshot. Required source refs resolve to exact original typed records/results at one consistent snapshot; a ref, hash or all-true assertion alone proves no acceptance. Current numeric/format rules come from EventRecord/CV-317, original source owners and the reviewed shared number/time foundation at phase 2; no new numeric limit or timestamp grammar is authored here. No objective/message/To-Do/compose/env-file body or secret is copied.
5. **Scope/identity.** Scope is `project_only`. `project_id`, actual Server and thread match the original source and EventRecord; absent Project means explicit application only where an app source is selected, never dangling Project or current focus. For the app pause source thread remains null and no fake thread/Computer/roots request is required. The original owner allocates one lifetime-unique immutable effect ID from its genuine accepted operation, with the declared component `named_plan.archived` and exact `named_plan_id` included before issuance. That frozen ID is `owner_operation_id`; batch/list operations allocate a separate component for each item. It survives retry and is never reminted from a timer or callback. Project key is `w3h@1:{hex(UTF8(owner_operation_id))}`. Application input is refused for this Project-only family. Event ID is `w3h@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`. Hex is lowercase byte-preserving encoding, not hashing or normalization. Storage’s partition is `app` or `project~{base64url_no_pad(UTF8(project_id))}`; the scoped dedupe tuple remains (scope_partition,event_type,idempotency_key). Fields already present in the envelope are adopted by reference to Contracts_V0.md#EventRecord, never replaced by a local envelope.
6. **Replay/idempotency.** Freeze `replay_policy=dedupe_by_idempotency_key` and Contracts’ exact producer-semantic digest over only its named caller fields. Current write/retry refuses `projector_replay_only` as `replay_only_not_appendable` before success. Same identity/same digest resolves the original complete event and first receipt via `storage.first_append_receipt.resolve.v2`, even after current source state advances; changed digest conflicts, unavailable authoritative dedupe returns `dedupe_unavailable` with no new effect. Do not compare Storage sequence/timestamps as caller semantics. Missing delivered work after confirmed older restore stays unavailable; a new event ID never reconstructs a missing original operation. Event replay cannot rerun commands, timers, Compose, turns, effects, Usage charges or notifications.
7. **Retention.** Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G19` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. The publication value below adopts RP-EVENT-INDEX-SOURCE, coupled to this event and its protections, with no independent lifetime. SP-286 receipt custody keeps its own policy.
8. **Redaction/custody.** Use `secret_refs_only` for current events; verify all refs with the original owner’s access and no-secret rules. The sole native adapter must prove actual original issuance, full scope/key/source joins and complete before/after facts, not a copied source view. Storage owns canonical seglog, publication journal, first receipt/full-value proof and a coherent backup/restore closure with pending owner effect/result; restore fences unresolved origin or tombstone state. Reads recheck current permission/deletion while authenticating original admission/recipe/receipt. They may show a valid retained fact after its live object changes or is gone, with unavailable linked body disclosed; they never reconstruct the body or require current state to equal a historical state. Unavailable or invalid source custody returns typed refusal, never fabricated empty success.
9. **Transitions.** cmd.named_plan.archive commits active to archived. Active child work requires the existing explicit warning/confirmation and preserve_unchanged disposition; no child is cancelled or deleted. Extra family-specific predicates: named_identity: immutable Project and named_plan_id, never focus or name matching; named_cas: expected aggregate revision/currentness agrees with original before/after; named_effect: archived result is genuine actual change; child_authority: child state remains with child owners; archive confirmation or child-edge proof applies when required. False/no-op/rejected results emit no successful mutation fact. Compound owner changes preserve all required facts and canonical visibility atomically; no partly admitted subset claims to be complete. Cross-owner original records remain owned by their respective source owners.
10. **Consumers/checkpoints.** The exact read-only operating consumer is `storage.w3h.named_plan_archived.recovery_read.v1@1.0.0`, called by `NamedPlanOwner` for existing original-result/restart inspection; it never reconstructs or changes canonical domain state from events. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`: resolve CURRENT, authentic root/generation/anchor/frontier/dataset and complete source selection in one live transaction, authenticate the complete captured range and every matching source/payload, then filter exact partition+`named_plan.archived`. Unsupported/corrupt/missing source is unavailable, never skipped as empty. SP-278 alone owns the generic checkpoint’s whole-value CAS, monotonic frontier and rebuild. This read-only family owns **no projector, projection or independent durable checkpoint** (`checkpoint_disposition=none_required`): zero durable reader effects. Any persisted SP-278 token remains its nine durable fields (DL-076); join the transaction’s live redb_snapshot_id only in memory and revalidate the complete live token after every helper immediately before disclosure. Empty verified range, zero matching events and missing coverage are distinct. Reader withdrawal fences interpretation. No current continuation/dispatch authority comes from this history read.
11. **Compatibility/withdrawal.** No alias, automatic legacy converter or historical emission is asserted for this newly prepared family. Preserve actual old admitted shapes and original recipes only when authenticated original issuance selects them; schema/version/recipe/source substitution or unknown selection refuses. Unsupported future versions never mutate. Writer withdrawal first cuts off this exact family/source edition under append lock, fences new prepares and append drains, and preserves pending accepted effects as unresolved custody. Exact retained-result lookup is read-only and needs authorized retained admission. Reader withdrawal stops interpretation and generic-index filtered reads for this family; it never deletes source or dedupe/receipt custody. Generic-index rebuilding excludes withdrawn interpretation and carries truthful coverage; re-enablement needs explicit reviewed version/source adoption, not a replay alias. Current live guards do not retroactively invalidate otherwise valid retained originals.
12. **Oracles.** `named_plan.archived` has its own positive, schema, source, identity, retry, receipt, retention/access, transition, token and withdrawal plan in `reports/event-authority-20261105/W3H-oracle-plan.json`. Every planned negative starts from a valid case and changes one input invariant, with all unrelated derived values recomputed. No oracle implementation or guard-removal proof is claimed in phase 1: criterion 12 **PARTIAL**, native **NOT_RUN**. Phase 2 adopts the reviewed shared numeric/time helper and shared guard-isolation tool before Sol/Astra review.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#CV-1559, ContractName:Plans/storage-plan.md#SP-1559, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

## NPLAN-1560 — `named_plan.child_refs_changed`: newly authored owner contract, prepared without admission

```yaml
plan_unit_id: NPLAN-1560
unit_type: interface_contract
status: accepted
owner_doc: Plans/Named_Plan_System.md
canonical_text: 'For exactly named_plan.child_refs_changed@1.0.0, the adjacent twelve-criterion contract binds the
  already specified fact: NamedPlanOwner::commit_child_refs commits an actual current/historical edge change from
  a genuine child-owner publication at a consistent snapshot. NPLAN-006 validates child kind/ref/revision/hash and
  Project+NamedPlan parent edges; preserve historical refs and zero-or-one current primary PRD. No bare focus, opaque
  ref, history read or lifecycle claim proves a join. Newly authored technical bindings follow deck-1 4b A (DL-411)
  and the documented exact-family search. Registry membership stays absent; criterion 12 remains PARTIAL until phase
  2.'
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- NPLAN-001
- NPLAN-002
- NPLAN-006
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Named_Plan_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- named_plan.child_refs_changed
- prepared_without_admission
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Named_Plan_System.md
```

1. **Membership/version.** `named_plan.child_refs_changed@1.0.0` is a candidate only, with no registry append, admission record or native writer. All current paths return `missing_event_registration` until this exact family/source edition is admitted; siblings grant nothing.
2. **Owner.** This unit owns the semantic fact: NamedPlanOwner::commit_child_refs commits an actual current/historical edge change from a genuine child-owner publication at a consistent snapshot. NPLAN-006 validates child kind/ref/revision/hash and Project+NamedPlan parent edges; preserve historical refs and zero-or-one current primary PRD. No bare focus, opaque ref, history read or lifecycle claim proves a join. Reuse NPLAN-001, NPLAN-002, NPLAN-006; payload binding is CV-1560, persistence is SP-1560.
3. **Producer.** Sole producer `NamedPlanOwner::child_refs_changed` calls `storage.w3h.named_plan_child_refs_changed.append.v1@1.0.0`. Source is NPLAN-001/002 NamedPlanRecord and original action receipt; NPLAN-006 genuine child-owner/aggregate snapshot for changed child refs. The source adapter methods `prepare_named_plan_child_refs_changed`, `commit_named_plan_child_refs_changed`, `resolve_named_plan_child_refs_changed_original` are newly authored interfaces of that owner, not installed handlers. Verify actual before/after source identity, genuine original receipt/result and permissions before committing the existing owner effect plus its publication journal atomically; save the exact semantic envelope and payload once. Drain the pending event via ordinary Storage append, explicitly adopting SP-286/CV-339 first-AppendReceipt **full-value v2** custody and SP-336/347 durability classes; then CAS prepared→appended→settled using the exact prior whole journal value. Domain success acknowledgement waits for the original body result and first event receipt; dependent dispatch/terminal publication waits for required receipts. A crash after body commit preserves the body and pending publication, never rolls it back or repeats the domain effect. The missing-registration gate acts before new event preparation and confers no native authority on existing result-only paths.
4. **Payload.** `Plans/event_payloads/w3h/named_plan_child_refs_changed.schema.json#/$defs/payload` is this family’s closed 1.0.0 schema. Every source field is compared to the genuine original owner result, not a caller-supplied matching snapshot. Required source refs resolve to exact original typed records/results at one consistent snapshot; a ref, hash or all-true assertion alone proves no acceptance. Current numeric/format rules come from EventRecord/CV-317, original source owners and the reviewed shared number/time foundation at phase 2; no new numeric limit or timestamp grammar is authored here. No objective/message/To-Do/compose/env-file body or secret is copied.
5. **Scope/identity.** Scope is `project_only`. `project_id`, actual Server and thread match the original source and EventRecord; absent Project means explicit application only where an app source is selected, never dangling Project or current focus. For the app pause source thread remains null and no fake thread/Computer/roots request is required. The original owner allocates one lifetime-unique immutable effect ID from its genuine accepted operation, with the declared component `named_plan.child_refs_changed` and exact `named_plan_id` included before issuance. That frozen ID is `owner_operation_id`; batch/list operations allocate a separate component for each item. It survives retry and is never reminted from a timer or callback. Project key is `w3h@1:{hex(UTF8(owner_operation_id))}`. Application input is refused for this Project-only family. Event ID is `w3h@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`. Hex is lowercase byte-preserving encoding, not hashing or normalization. Storage’s partition is `app` or `project~{base64url_no_pad(UTF8(project_id))}`; the scoped dedupe tuple remains (scope_partition,event_type,idempotency_key). Fields already present in the envelope are adopted by reference to Contracts_V0.md#EventRecord, never replaced by a local envelope.
6. **Replay/idempotency.** Freeze `replay_policy=dedupe_by_idempotency_key` and Contracts’ exact producer-semantic digest over only its named caller fields. Current write/retry refuses `projector_replay_only` as `replay_only_not_appendable` before success. Same identity/same digest resolves the original complete event and first receipt via `storage.first_append_receipt.resolve.v2`, even after current source state advances; changed digest conflicts, unavailable authoritative dedupe returns `dedupe_unavailable` with no new effect. Do not compare Storage sequence/timestamps as caller semantics. Missing delivered work after confirmed older restore stays unavailable; a new event ID never reconstructs a missing original operation. Event replay cannot rerun commands, timers, Compose, turns, effects, Usage charges or notifications.
7. **Retention.** Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G19` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. The publication value below adopts RP-EVENT-INDEX-SOURCE, coupled to this event and its protections, with no independent lifetime. SP-286 receipt custody keeps its own policy.
8. **Redaction/custody.** Use `secret_refs_only` for current events; verify all refs with the original owner’s access and no-secret rules. The sole native adapter must prove actual original issuance, full scope/key/source joins and complete before/after facts, not a copied source view. Storage owns canonical seglog, publication journal, first receipt/full-value proof and a coherent backup/restore closure with pending owner effect/result; restore fences unresolved origin or tombstone state. Reads recheck current permission/deletion while authenticating original admission/recipe/receipt. They may show a valid retained fact after its live object changes or is gone, with unavailable linked body disclosed; they never reconstruct the body or require current state to equal a historical state. Unavailable or invalid source custody returns typed refusal, never fabricated empty success.
9. **Transitions.** NamedPlanOwner::commit_child_refs commits an actual current/historical edge change from a genuine child-owner publication at a consistent snapshot. NPLAN-006 validates child kind/ref/revision/hash and Project+NamedPlan parent edges; preserve historical refs and zero-or-one current primary PRD. No bare focus, opaque ref, history read or lifecycle claim proves a join. Extra family-specific predicates: named_identity: immutable Project and named_plan_id, never focus or name matching; named_cas: expected aggregate revision/currentness agrees with original before/after; named_effect: child_refs_changed result is genuine actual change; child_authority: child state remains with child owners; archive confirmation or child-edge proof applies when required. False/no-op/rejected results emit no successful mutation fact. Compound owner changes preserve all required facts and canonical visibility atomically; no partly admitted subset claims to be complete. Cross-owner original records remain owned by their respective source owners.
10. **Consumers/checkpoints.** The exact read-only operating consumer is `storage.w3h.named_plan_child_refs_changed.recovery_read.v1@1.0.0`, called by `NamedPlanOwner` for existing original-result/restart inspection; it never reconstructs or changes canonical domain state from events. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`: resolve CURRENT, authentic root/generation/anchor/frontier/dataset and complete source selection in one live transaction, authenticate the complete captured range and every matching source/payload, then filter exact partition+`named_plan.child_refs_changed`. Unsupported/corrupt/missing source is unavailable, never skipped as empty. SP-278 alone owns the generic checkpoint’s whole-value CAS, monotonic frontier and rebuild. This read-only family owns **no projector, projection or independent durable checkpoint** (`checkpoint_disposition=none_required`): zero durable reader effects. Any persisted SP-278 token remains its nine durable fields (DL-076); join the transaction’s live redb_snapshot_id only in memory and revalidate the complete live token after every helper immediately before disclosure. Empty verified range, zero matching events and missing coverage are distinct. Reader withdrawal fences interpretation. No current continuation/dispatch authority comes from this history read.
11. **Compatibility/withdrawal.** No alias, automatic legacy converter or historical emission is asserted for this newly prepared family. Preserve actual old admitted shapes and original recipes only when authenticated original issuance selects them; schema/version/recipe/source substitution or unknown selection refuses. Unsupported future versions never mutate. Writer withdrawal first cuts off this exact family/source edition under append lock, fences new prepares and append drains, and preserves pending accepted effects as unresolved custody. Exact retained-result lookup is read-only and needs authorized retained admission. Reader withdrawal stops interpretation and generic-index filtered reads for this family; it never deletes source or dedupe/receipt custody. Generic-index rebuilding excludes withdrawn interpretation and carries truthful coverage; re-enablement needs explicit reviewed version/source adoption, not a replay alias. Current live guards do not retroactively invalidate otherwise valid retained originals.
12. **Oracles.** `named_plan.child_refs_changed` has its own positive, schema, source, identity, retry, receipt, retention/access, transition, token and withdrawal plan in `reports/event-authority-20261105/W3H-oracle-plan.json`. Every planned negative starts from a valid case and changes one input invariant, with all unrelated derived values recomputed. No oracle implementation or guard-removal proof is claimed in phase 1: criterion 12 **PARTIAL**, native **NOT_RUN**. Phase 2 adopts the reviewed shared numeric/time helper and shared guard-isolation tool before Sol/Astra review.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#CV-1560, ContractName:Plans/storage-plan.md#SP-1560, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

## NPLAN-1561 — `named_plan.created`: newly authored owner contract, prepared without admission

```yaml
plan_unit_id: NPLAN-1561
unit_type: interface_contract
status: accepted
owner_doc: Plans/Named_Plan_System.md
canonical_text: 'For exactly named_plan.created@1.0.0, the adjacent twelve-criterion contract binds the already
  specified fact: cmd.named_plan.create atomically commits the minimal revision-1 shell, Project membership, thread
  group and creation receipt. No child runtime is created; duplicate names are allowed and never merge identity.
  Newly authored technical bindings follow deck-1 4b A (DL-411) and the documented exact-family search. Registry
  membership stays absent; criterion 12 remains PARTIAL until phase 2.'
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- NPLAN-001
- NPLAN-002
- NPLAN-006
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Named_Plan_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- named_plan.created
- prepared_without_admission
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Named_Plan_System.md
```

1. **Membership/version.** `named_plan.created@1.0.0` is a candidate only, with no registry append, admission record or native writer. All current paths return `missing_event_registration` until this exact family/source edition is admitted; siblings grant nothing.
2. **Owner.** This unit owns the semantic fact: cmd.named_plan.create atomically commits the minimal revision-1 shell, Project membership, thread group and creation receipt. No child runtime is created; duplicate names are allowed and never merge identity. Reuse NPLAN-001, NPLAN-002, NPLAN-006; payload binding is CV-1561, persistence is SP-1561.
3. **Producer.** Sole producer `NamedPlanOwner::created` calls `storage.w3h.named_plan_created.append.v1@1.0.0`. Source is NPLAN-001/002 NamedPlanRecord and original action receipt; NPLAN-006 genuine child-owner/aggregate snapshot for changed child refs. The source adapter methods `prepare_named_plan_created`, `commit_named_plan_created`, `resolve_named_plan_created_original` are newly authored interfaces of that owner, not installed handlers. Verify actual before/after source identity, genuine original receipt/result and permissions before committing the existing owner effect plus its publication journal atomically; save the exact semantic envelope and payload once. Drain the pending event via ordinary Storage append, explicitly adopting SP-286/CV-339 first-AppendReceipt **full-value v2** custody and SP-336/347 durability classes; then CAS prepared→appended→settled using the exact prior whole journal value. Domain success acknowledgement waits for the original body result and first event receipt; dependent dispatch/terminal publication waits for required receipts. A crash after body commit preserves the body and pending publication, never rolls it back or repeats the domain effect. The missing-registration gate acts before new event preparation and confers no native authority on existing result-only paths.
4. **Payload.** `Plans/event_payloads/w3h/named_plan_created.schema.json#/$defs/payload` is this family’s closed 1.0.0 schema. Every source field is compared to the genuine original owner result, not a caller-supplied matching snapshot. Required source refs resolve to exact original typed records/results at one consistent snapshot; a ref, hash or all-true assertion alone proves no acceptance. Current numeric/format rules come from EventRecord/CV-317, original source owners and the reviewed shared number/time foundation at phase 2; no new numeric limit or timestamp grammar is authored here. No objective/message/To-Do/compose/env-file body or secret is copied.
5. **Scope/identity.** Scope is `project_only`. `project_id`, actual Server and thread match the original source and EventRecord; absent Project means explicit application only where an app source is selected, never dangling Project or current focus. For the app pause source thread remains null and no fake thread/Computer/roots request is required. The original owner allocates one lifetime-unique immutable effect ID from its genuine accepted operation, with the declared component `named_plan.created` and exact `named_plan_id` included before issuance. That frozen ID is `owner_operation_id`; batch/list operations allocate a separate component for each item. It survives retry and is never reminted from a timer or callback. Project key is `w3h@1:{hex(UTF8(owner_operation_id))}`. Application input is refused for this Project-only family. Event ID is `w3h@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`. Hex is lowercase byte-preserving encoding, not hashing or normalization. Storage’s partition is `app` or `project~{base64url_no_pad(UTF8(project_id))}`; the scoped dedupe tuple remains (scope_partition,event_type,idempotency_key). Fields already present in the envelope are adopted by reference to Contracts_V0.md#EventRecord, never replaced by a local envelope.
6. **Replay/idempotency.** Freeze `replay_policy=dedupe_by_idempotency_key` and Contracts’ exact producer-semantic digest over only its named caller fields. Current write/retry refuses `projector_replay_only` as `replay_only_not_appendable` before success. Same identity/same digest resolves the original complete event and first receipt via `storage.first_append_receipt.resolve.v2`, even after current source state advances; changed digest conflicts, unavailable authoritative dedupe returns `dedupe_unavailable` with no new effect. Do not compare Storage sequence/timestamps as caller semantics. Missing delivered work after confirmed older restore stays unavailable; a new event ID never reconstructs a missing original operation. Event replay cannot rerun commands, timers, Compose, turns, effects, Usage charges or notifications.
7. **Retention.** Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G19` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. The publication value below adopts RP-EVENT-INDEX-SOURCE, coupled to this event and its protections, with no independent lifetime. SP-286 receipt custody keeps its own policy.
8. **Redaction/custody.** Use `secret_refs_only` for current events; verify all refs with the original owner’s access and no-secret rules. The sole native adapter must prove actual original issuance, full scope/key/source joins and complete before/after facts, not a copied source view. Storage owns canonical seglog, publication journal, first receipt/full-value proof and a coherent backup/restore closure with pending owner effect/result; restore fences unresolved origin or tombstone state. Reads recheck current permission/deletion while authenticating original admission/recipe/receipt. They may show a valid retained fact after its live object changes or is gone, with unavailable linked body disclosed; they never reconstruct the body or require current state to equal a historical state. Unavailable or invalid source custody returns typed refusal, never fabricated empty success.
9. **Transitions.** cmd.named_plan.create atomically commits the minimal revision-1 shell, Project membership, thread group and creation receipt. No child runtime is created; duplicate names are allowed and never merge identity. Extra family-specific predicates: named_identity: immutable Project and named_plan_id, never focus or name matching; named_cas: expected aggregate revision/currentness agrees with original before/after; named_effect: created result is genuine actual change; child_authority: child state remains with child owners; archive confirmation or child-edge proof applies when required. False/no-op/rejected results emit no successful mutation fact. Compound owner changes preserve all required facts and canonical visibility atomically; no partly admitted subset claims to be complete. Cross-owner original records remain owned by their respective source owners.
10. **Consumers/checkpoints.** The exact read-only operating consumer is `storage.w3h.named_plan_created.recovery_read.v1@1.0.0`, called by `NamedPlanOwner` for existing original-result/restart inspection; it never reconstructs or changes canonical domain state from events. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`: resolve CURRENT, authentic root/generation/anchor/frontier/dataset and complete source selection in one live transaction, authenticate the complete captured range and every matching source/payload, then filter exact partition+`named_plan.created`. Unsupported/corrupt/missing source is unavailable, never skipped as empty. SP-278 alone owns the generic checkpoint’s whole-value CAS, monotonic frontier and rebuild. This read-only family owns **no projector, projection or independent durable checkpoint** (`checkpoint_disposition=none_required`): zero durable reader effects. Any persisted SP-278 token remains its nine durable fields (DL-076); join the transaction’s live redb_snapshot_id only in memory and revalidate the complete live token after every helper immediately before disclosure. Empty verified range, zero matching events and missing coverage are distinct. Reader withdrawal fences interpretation. No current continuation/dispatch authority comes from this history read.
11. **Compatibility/withdrawal.** No alias, automatic legacy converter or historical emission is asserted for this newly prepared family. Preserve actual old admitted shapes and original recipes only when authenticated original issuance selects them; schema/version/recipe/source substitution or unknown selection refuses. Unsupported future versions never mutate. Writer withdrawal first cuts off this exact family/source edition under append lock, fences new prepares and append drains, and preserves pending accepted effects as unresolved custody. Exact retained-result lookup is read-only and needs authorized retained admission. Reader withdrawal stops interpretation and generic-index filtered reads for this family; it never deletes source or dedupe/receipt custody. Generic-index rebuilding excludes withdrawn interpretation and carries truthful coverage; re-enablement needs explicit reviewed version/source adoption, not a replay alias. Current live guards do not retroactively invalidate otherwise valid retained originals.
12. **Oracles.** `named_plan.created` has its own positive, schema, source, identity, retry, receipt, retention/access, transition, token and withdrawal plan in `reports/event-authority-20261105/W3H-oracle-plan.json`. Every planned negative starts from a valid case and changes one input invariant, with all unrelated derived values recomputed. No oracle implementation or guard-removal proof is claimed in phase 1: criterion 12 **PARTIAL**, native **NOT_RUN**. Phase 2 adopts the reviewed shared numeric/time helper and shared guard-isolation tool before Sol/Astra review.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#CV-1561, ContractName:Plans/storage-plan.md#SP-1561, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

## NPLAN-1562 — `named_plan.priority_changed`: newly authored owner contract, prepared without admission

```yaml
plan_unit_id: NPLAN-1562
unit_type: interface_contract
status: accepted
owner_doc: Plans/Named_Plan_System.md
canonical_text: 'For exactly named_plan.priority_changed@1.0.0, the adjacent twelve-criterion contract binds the
  already specified fact: cmd.named_plan.set_priority commits an actual change among low/normal/high/urgent; scheduling
  owners may consume it but retain scheduling authority. Unchanged priority emits nothing. Newly authored technical
  bindings follow deck-1 4b A (DL-411) and the documented exact-family search. Registry membership stays absent;
  criterion 12 remains PARTIAL until phase 2.'
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- NPLAN-001
- NPLAN-002
- NPLAN-006
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Named_Plan_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- named_plan.priority_changed
- prepared_without_admission
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Named_Plan_System.md
```

1. **Membership/version.** `named_plan.priority_changed@1.0.0` is a candidate only, with no registry append, admission record or native writer. All current paths return `missing_event_registration` until this exact family/source edition is admitted; siblings grant nothing.
2. **Owner.** This unit owns the semantic fact: cmd.named_plan.set_priority commits an actual change among low/normal/high/urgent; scheduling owners may consume it but retain scheduling authority. Unchanged priority emits nothing. Reuse NPLAN-001, NPLAN-002, NPLAN-006; payload binding is CV-1562, persistence is SP-1562.
3. **Producer.** Sole producer `NamedPlanOwner::priority_changed` calls `storage.w3h.named_plan_priority_changed.append.v1@1.0.0`. Source is NPLAN-001/002 NamedPlanRecord and original action receipt; NPLAN-006 genuine child-owner/aggregate snapshot for changed child refs. The source adapter methods `prepare_named_plan_priority_changed`, `commit_named_plan_priority_changed`, `resolve_named_plan_priority_changed_original` are newly authored interfaces of that owner, not installed handlers. Verify actual before/after source identity, genuine original receipt/result and permissions before committing the existing owner effect plus its publication journal atomically; save the exact semantic envelope and payload once. Drain the pending event via ordinary Storage append, explicitly adopting SP-286/CV-339 first-AppendReceipt **full-value v2** custody and SP-336/347 durability classes; then CAS prepared→appended→settled using the exact prior whole journal value. Domain success acknowledgement waits for the original body result and first event receipt; dependent dispatch/terminal publication waits for required receipts. A crash after body commit preserves the body and pending publication, never rolls it back or repeats the domain effect. The missing-registration gate acts before new event preparation and confers no native authority on existing result-only paths.
4. **Payload.** `Plans/event_payloads/w3h/named_plan_priority_changed.schema.json#/$defs/payload` is this family’s closed 1.0.0 schema. Every source field is compared to the genuine original owner result, not a caller-supplied matching snapshot. Required source refs resolve to exact original typed records/results at one consistent snapshot; a ref, hash or all-true assertion alone proves no acceptance. Current numeric/format rules come from EventRecord/CV-317, original source owners and the reviewed shared number/time foundation at phase 2; no new numeric limit or timestamp grammar is authored here. No objective/message/To-Do/compose/env-file body or secret is copied.
5. **Scope/identity.** Scope is `project_only`. `project_id`, actual Server and thread match the original source and EventRecord; absent Project means explicit application only where an app source is selected, never dangling Project or current focus. For the app pause source thread remains null and no fake thread/Computer/roots request is required. The original owner allocates one lifetime-unique immutable effect ID from its genuine accepted operation, with the declared component `named_plan.priority_changed` and exact `named_plan_id` included before issuance. That frozen ID is `owner_operation_id`; batch/list operations allocate a separate component for each item. It survives retry and is never reminted from a timer or callback. Project key is `w3h@1:{hex(UTF8(owner_operation_id))}`. Application input is refused for this Project-only family. Event ID is `w3h@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`. Hex is lowercase byte-preserving encoding, not hashing or normalization. Storage’s partition is `app` or `project~{base64url_no_pad(UTF8(project_id))}`; the scoped dedupe tuple remains (scope_partition,event_type,idempotency_key). Fields already present in the envelope are adopted by reference to Contracts_V0.md#EventRecord, never replaced by a local envelope.
6. **Replay/idempotency.** Freeze `replay_policy=dedupe_by_idempotency_key` and Contracts’ exact producer-semantic digest over only its named caller fields. Current write/retry refuses `projector_replay_only` as `replay_only_not_appendable` before success. Same identity/same digest resolves the original complete event and first receipt via `storage.first_append_receipt.resolve.v2`, even after current source state advances; changed digest conflicts, unavailable authoritative dedupe returns `dedupe_unavailable` with no new effect. Do not compare Storage sequence/timestamps as caller semantics. Missing delivered work after confirmed older restore stays unavailable; a new event ID never reconstructs a missing original operation. Event replay cannot rerun commands, timers, Compose, turns, effects, Usage charges or notifications.
7. **Retention.** Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G19` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. The publication value below adopts RP-EVENT-INDEX-SOURCE, coupled to this event and its protections, with no independent lifetime. SP-286 receipt custody keeps its own policy.
8. **Redaction/custody.** Use `secret_refs_only` for current events; verify all refs with the original owner’s access and no-secret rules. The sole native adapter must prove actual original issuance, full scope/key/source joins and complete before/after facts, not a copied source view. Storage owns canonical seglog, publication journal, first receipt/full-value proof and a coherent backup/restore closure with pending owner effect/result; restore fences unresolved origin or tombstone state. Reads recheck current permission/deletion while authenticating original admission/recipe/receipt. They may show a valid retained fact after its live object changes or is gone, with unavailable linked body disclosed; they never reconstruct the body or require current state to equal a historical state. Unavailable or invalid source custody returns typed refusal, never fabricated empty success.
9. **Transitions.** cmd.named_plan.set_priority commits an actual change among low/normal/high/urgent; scheduling owners may consume it but retain scheduling authority. Unchanged priority emits nothing. Extra family-specific predicates: named_identity: immutable Project and named_plan_id, never focus or name matching; named_cas: expected aggregate revision/currentness agrees with original before/after; named_effect: priority_changed result is genuine actual change; child_authority: child state remains with child owners; archive confirmation or child-edge proof applies when required. False/no-op/rejected results emit no successful mutation fact. Compound owner changes preserve all required facts and canonical visibility atomically; no partly admitted subset claims to be complete. Cross-owner original records remain owned by their respective source owners.
10. **Consumers/checkpoints.** The exact read-only operating consumer is `storage.w3h.named_plan_priority_changed.recovery_read.v1@1.0.0`, called by `NamedPlanOwner` for existing original-result/restart inspection; it never reconstructs or changes canonical domain state from events. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`: resolve CURRENT, authentic root/generation/anchor/frontier/dataset and complete source selection in one live transaction, authenticate the complete captured range and every matching source/payload, then filter exact partition+`named_plan.priority_changed`. Unsupported/corrupt/missing source is unavailable, never skipped as empty. SP-278 alone owns the generic checkpoint’s whole-value CAS, monotonic frontier and rebuild. This read-only family owns **no projector, projection or independent durable checkpoint** (`checkpoint_disposition=none_required`): zero durable reader effects. Any persisted SP-278 token remains its nine durable fields (DL-076); join the transaction’s live redb_snapshot_id only in memory and revalidate the complete live token after every helper immediately before disclosure. Empty verified range, zero matching events and missing coverage are distinct. Reader withdrawal fences interpretation. No current continuation/dispatch authority comes from this history read.
11. **Compatibility/withdrawal.** No alias, automatic legacy converter or historical emission is asserted for this newly prepared family. Preserve actual old admitted shapes and original recipes only when authenticated original issuance selects them; schema/version/recipe/source substitution or unknown selection refuses. Unsupported future versions never mutate. Writer withdrawal first cuts off this exact family/source edition under append lock, fences new prepares and append drains, and preserves pending accepted effects as unresolved custody. Exact retained-result lookup is read-only and needs authorized retained admission. Reader withdrawal stops interpretation and generic-index filtered reads for this family; it never deletes source or dedupe/receipt custody. Generic-index rebuilding excludes withdrawn interpretation and carries truthful coverage; re-enablement needs explicit reviewed version/source adoption, not a replay alias. Current live guards do not retroactively invalidate otherwise valid retained originals.
12. **Oracles.** `named_plan.priority_changed` has its own positive, schema, source, identity, retry, receipt, retention/access, transition, token and withdrawal plan in `reports/event-authority-20261105/W3H-oracle-plan.json`. Every planned negative starts from a valid case and changes one input invariant, with all unrelated derived values recomputed. No oracle implementation or guard-removal proof is claimed in phase 1: criterion 12 **PARTIAL**, native **NOT_RUN**. Phase 2 adopts the reviewed shared numeric/time helper and shared guard-isolation tool before Sol/Astra review.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#CV-1562, ContractName:Plans/storage-plan.md#SP-1562, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

## NPLAN-1563 — `named_plan.renamed`: newly authored owner contract, prepared without admission

```yaml
plan_unit_id: NPLAN-1563
unit_type: interface_contract
status: accepted
owner_doc: Plans/Named_Plan_System.md
canonical_text: 'For exactly named_plan.renamed@1.0.0, the adjacent twelve-criterion contract binds the already
  specified fact: cmd.named_plan.rename commits an actual human-name change against aggregate revision/currentness.
  named_plan_id, Project and all child refs/approval/runtime state remain unchanged; an identical name emits nothing.
  Newly authored technical bindings follow deck-1 4b A (DL-411) and the documented exact-family search. Registry
  membership stays absent; criterion 12 remains PARTIAL until phase 2.'
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- NPLAN-001
- NPLAN-002
- NPLAN-006
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Named_Plan_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- named_plan.renamed
- prepared_without_admission
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Named_Plan_System.md
```

1. **Membership/version.** `named_plan.renamed@1.0.0` is a candidate only, with no registry append, admission record or native writer. All current paths return `missing_event_registration` until this exact family/source edition is admitted; siblings grant nothing.
2. **Owner.** This unit owns the semantic fact: cmd.named_plan.rename commits an actual human-name change against aggregate revision/currentness. named_plan_id, Project and all child refs/approval/runtime state remain unchanged; an identical name emits nothing. Reuse NPLAN-001, NPLAN-002, NPLAN-006; payload binding is CV-1563, persistence is SP-1563.
3. **Producer.** Sole producer `NamedPlanOwner::renamed` calls `storage.w3h.named_plan_renamed.append.v1@1.0.0`. Source is NPLAN-001/002 NamedPlanRecord and original action receipt; NPLAN-006 genuine child-owner/aggregate snapshot for changed child refs. The source adapter methods `prepare_named_plan_renamed`, `commit_named_plan_renamed`, `resolve_named_plan_renamed_original` are newly authored interfaces of that owner, not installed handlers. Verify actual before/after source identity, genuine original receipt/result and permissions before committing the existing owner effect plus its publication journal atomically; save the exact semantic envelope and payload once. Drain the pending event via ordinary Storage append, explicitly adopting SP-286/CV-339 first-AppendReceipt **full-value v2** custody and SP-336/347 durability classes; then CAS prepared→appended→settled using the exact prior whole journal value. Domain success acknowledgement waits for the original body result and first event receipt; dependent dispatch/terminal publication waits for required receipts. A crash after body commit preserves the body and pending publication, never rolls it back or repeats the domain effect. The missing-registration gate acts before new event preparation and confers no native authority on existing result-only paths.
4. **Payload.** `Plans/event_payloads/w3h/named_plan_renamed.schema.json#/$defs/payload` is this family’s closed 1.0.0 schema. Every source field is compared to the genuine original owner result, not a caller-supplied matching snapshot. Required source refs resolve to exact original typed records/results at one consistent snapshot; a ref, hash or all-true assertion alone proves no acceptance. Current numeric/format rules come from EventRecord/CV-317, original source owners and the reviewed shared number/time foundation at phase 2; no new numeric limit or timestamp grammar is authored here. No objective/message/To-Do/compose/env-file body or secret is copied.
5. **Scope/identity.** Scope is `project_only`. `project_id`, actual Server and thread match the original source and EventRecord; absent Project means explicit application only where an app source is selected, never dangling Project or current focus. For the app pause source thread remains null and no fake thread/Computer/roots request is required. The original owner allocates one lifetime-unique immutable effect ID from its genuine accepted operation, with the declared component `named_plan.renamed` and exact `named_plan_id` included before issuance. That frozen ID is `owner_operation_id`; batch/list operations allocate a separate component for each item. It survives retry and is never reminted from a timer or callback. Project key is `w3h@1:{hex(UTF8(owner_operation_id))}`. Application input is refused for this Project-only family. Event ID is `w3h@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`. Hex is lowercase byte-preserving encoding, not hashing or normalization. Storage’s partition is `app` or `project~{base64url_no_pad(UTF8(project_id))}`; the scoped dedupe tuple remains (scope_partition,event_type,idempotency_key). Fields already present in the envelope are adopted by reference to Contracts_V0.md#EventRecord, never replaced by a local envelope.
6. **Replay/idempotency.** Freeze `replay_policy=dedupe_by_idempotency_key` and Contracts’ exact producer-semantic digest over only its named caller fields. Current write/retry refuses `projector_replay_only` as `replay_only_not_appendable` before success. Same identity/same digest resolves the original complete event and first receipt via `storage.first_append_receipt.resolve.v2`, even after current source state advances; changed digest conflicts, unavailable authoritative dedupe returns `dedupe_unavailable` with no new effect. Do not compare Storage sequence/timestamps as caller semantics. Missing delivered work after confirmed older restore stays unavailable; a new event ID never reconstructs a missing original operation. Event replay cannot rerun commands, timers, Compose, turns, effects, Usage charges or notifications.
7. **Retention.** Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G19` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. The publication value below adopts RP-EVENT-INDEX-SOURCE, coupled to this event and its protections, with no independent lifetime. SP-286 receipt custody keeps its own policy.
8. **Redaction/custody.** Use `secret_refs_only` for current events; verify all refs with the original owner’s access and no-secret rules. The sole native adapter must prove actual original issuance, full scope/key/source joins and complete before/after facts, not a copied source view. Storage owns canonical seglog, publication journal, first receipt/full-value proof and a coherent backup/restore closure with pending owner effect/result; restore fences unresolved origin or tombstone state. Reads recheck current permission/deletion while authenticating original admission/recipe/receipt. They may show a valid retained fact after its live object changes or is gone, with unavailable linked body disclosed; they never reconstruct the body or require current state to equal a historical state. Unavailable or invalid source custody returns typed refusal, never fabricated empty success.
9. **Transitions.** cmd.named_plan.rename commits an actual human-name change against aggregate revision/currentness. named_plan_id, Project and all child refs/approval/runtime state remain unchanged; an identical name emits nothing. Extra family-specific predicates: named_identity: immutable Project and named_plan_id, never focus or name matching; named_cas: expected aggregate revision/currentness agrees with original before/after; named_effect: renamed result is genuine actual change; child_authority: child state remains with child owners; archive confirmation or child-edge proof applies when required. False/no-op/rejected results emit no successful mutation fact. Compound owner changes preserve all required facts and canonical visibility atomically; no partly admitted subset claims to be complete. Cross-owner original records remain owned by their respective source owners.
10. **Consumers/checkpoints.** The exact read-only operating consumer is `storage.w3h.named_plan_renamed.recovery_read.v1@1.0.0`, called by `NamedPlanOwner` for existing original-result/restart inspection; it never reconstructs or changes canonical domain state from events. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`: resolve CURRENT, authentic root/generation/anchor/frontier/dataset and complete source selection in one live transaction, authenticate the complete captured range and every matching source/payload, then filter exact partition+`named_plan.renamed`. Unsupported/corrupt/missing source is unavailable, never skipped as empty. SP-278 alone owns the generic checkpoint’s whole-value CAS, monotonic frontier and rebuild. This read-only family owns **no projector, projection or independent durable checkpoint** (`checkpoint_disposition=none_required`): zero durable reader effects. Any persisted SP-278 token remains its nine durable fields (DL-076); join the transaction’s live redb_snapshot_id only in memory and revalidate the complete live token after every helper immediately before disclosure. Empty verified range, zero matching events and missing coverage are distinct. Reader withdrawal fences interpretation. No current continuation/dispatch authority comes from this history read.
11. **Compatibility/withdrawal.** No alias, automatic legacy converter or historical emission is asserted for this newly prepared family. Preserve actual old admitted shapes and original recipes only when authenticated original issuance selects them; schema/version/recipe/source substitution or unknown selection refuses. Unsupported future versions never mutate. Writer withdrawal first cuts off this exact family/source edition under append lock, fences new prepares and append drains, and preserves pending accepted effects as unresolved custody. Exact retained-result lookup is read-only and needs authorized retained admission. Reader withdrawal stops interpretation and generic-index filtered reads for this family; it never deletes source or dedupe/receipt custody. Generic-index rebuilding excludes withdrawn interpretation and carries truthful coverage; re-enablement needs explicit reviewed version/source adoption, not a replay alias. Current live guards do not retroactively invalidate otherwise valid retained originals.
12. **Oracles.** `named_plan.renamed` has its own positive, schema, source, identity, retry, receipt, retention/access, transition, token and withdrawal plan in `reports/event-authority-20261105/W3H-oracle-plan.json`. Every planned negative starts from a valid case and changes one input invariant, with all unrelated derived values recomputed. No oracle implementation or guard-removal proof is claimed in phase 1: criterion 12 **PARTIAL**, native **NOT_RUN**. Phase 2 adopts the reviewed shared numeric/time helper and shared guard-isolation tool before Sol/Astra review.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#CV-1563, ContractName:Plans/storage-plan.md#SP-1563, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

## NPLAN-1564 — `named_plan.restored`: newly authored owner contract, prepared without admission

```yaml
plan_unit_id: NPLAN-1564
unit_type: interface_contract
status: accepted
owner_doc: Plans/Named_Plan_System.md
canonical_text: 'For exactly named_plan.restored@1.0.0, the adjacent twelve-criterion contract binds the already
  specified fact: cmd.named_plan.restore commits archived to active and preserves every child owner’s state, current/historical
  refs and immutable identity. Opening an archived Plan does not restore it. Newly authored technical bindings follow
  deck-1 4b A (DL-411) and the documented exact-family search. Registry membership stays absent; criterion 12 remains
  PARTIAL until phase 2.'
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- NPLAN-001
- NPLAN-002
- NPLAN-006
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Named_Plan_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- named_plan.restored
- prepared_without_admission
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Named_Plan_System.md
```

1. **Membership/version.** `named_plan.restored@1.0.0` is a candidate only, with no registry append, admission record or native writer. All current paths return `missing_event_registration` until this exact family/source edition is admitted; siblings grant nothing.
2. **Owner.** This unit owns the semantic fact: cmd.named_plan.restore commits archived to active and preserves every child owner’s state, current/historical refs and immutable identity. Opening an archived Plan does not restore it. Reuse NPLAN-001, NPLAN-002, NPLAN-006; payload binding is CV-1564, persistence is SP-1564.
3. **Producer.** Sole producer `NamedPlanOwner::restored` calls `storage.w3h.named_plan_restored.append.v1@1.0.0`. Source is NPLAN-001/002 NamedPlanRecord and original action receipt; NPLAN-006 genuine child-owner/aggregate snapshot for changed child refs. The source adapter methods `prepare_named_plan_restored`, `commit_named_plan_restored`, `resolve_named_plan_restored_original` are newly authored interfaces of that owner, not installed handlers. Verify actual before/after source identity, genuine original receipt/result and permissions before committing the existing owner effect plus its publication journal atomically; save the exact semantic envelope and payload once. Drain the pending event via ordinary Storage append, explicitly adopting SP-286/CV-339 first-AppendReceipt **full-value v2** custody and SP-336/347 durability classes; then CAS prepared→appended→settled using the exact prior whole journal value. Domain success acknowledgement waits for the original body result and first event receipt; dependent dispatch/terminal publication waits for required receipts. A crash after body commit preserves the body and pending publication, never rolls it back or repeats the domain effect. The missing-registration gate acts before new event preparation and confers no native authority on existing result-only paths.
4. **Payload.** `Plans/event_payloads/w3h/named_plan_restored.schema.json#/$defs/payload` is this family’s closed 1.0.0 schema. Every source field is compared to the genuine original owner result, not a caller-supplied matching snapshot. Required source refs resolve to exact original typed records/results at one consistent snapshot; a ref, hash or all-true assertion alone proves no acceptance. Current numeric/format rules come from EventRecord/CV-317, original source owners and the reviewed shared number/time foundation at phase 2; no new numeric limit or timestamp grammar is authored here. No objective/message/To-Do/compose/env-file body or secret is copied.
5. **Scope/identity.** Scope is `project_only`. `project_id`, actual Server and thread match the original source and EventRecord; absent Project means explicit application only where an app source is selected, never dangling Project or current focus. For the app pause source thread remains null and no fake thread/Computer/roots request is required. The original owner allocates one lifetime-unique immutable effect ID from its genuine accepted operation, with the declared component `named_plan.restored` and exact `named_plan_id` included before issuance. That frozen ID is `owner_operation_id`; batch/list operations allocate a separate component for each item. It survives retry and is never reminted from a timer or callback. Project key is `w3h@1:{hex(UTF8(owner_operation_id))}`. Application input is refused for this Project-only family. Event ID is `w3h@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`. Hex is lowercase byte-preserving encoding, not hashing or normalization. Storage’s partition is `app` or `project~{base64url_no_pad(UTF8(project_id))}`; the scoped dedupe tuple remains (scope_partition,event_type,idempotency_key). Fields already present in the envelope are adopted by reference to Contracts_V0.md#EventRecord, never replaced by a local envelope.
6. **Replay/idempotency.** Freeze `replay_policy=dedupe_by_idempotency_key` and Contracts’ exact producer-semantic digest over only its named caller fields. Current write/retry refuses `projector_replay_only` as `replay_only_not_appendable` before success. Same identity/same digest resolves the original complete event and first receipt via `storage.first_append_receipt.resolve.v2`, even after current source state advances; changed digest conflicts, unavailable authoritative dedupe returns `dedupe_unavailable` with no new effect. Do not compare Storage sequence/timestamps as caller semantics. Missing delivered work after confirmed older restore stays unavailable; a new event ID never reconstructs a missing original operation. Event replay cannot rerun commands, timers, Compose, turns, effects, Usage charges or notifications.
7. **Retention.** Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G19` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. The publication value below adopts RP-EVENT-INDEX-SOURCE, coupled to this event and its protections, with no independent lifetime. SP-286 receipt custody keeps its own policy.
8. **Redaction/custody.** Use `secret_refs_only` for current events; verify all refs with the original owner’s access and no-secret rules. The sole native adapter must prove actual original issuance, full scope/key/source joins and complete before/after facts, not a copied source view. Storage owns canonical seglog, publication journal, first receipt/full-value proof and a coherent backup/restore closure with pending owner effect/result; restore fences unresolved origin or tombstone state. Reads recheck current permission/deletion while authenticating original admission/recipe/receipt. They may show a valid retained fact after its live object changes or is gone, with unavailable linked body disclosed; they never reconstruct the body or require current state to equal a historical state. Unavailable or invalid source custody returns typed refusal, never fabricated empty success.
9. **Transitions.** cmd.named_plan.restore commits archived to active and preserves every child owner’s state, current/historical refs and immutable identity. Opening an archived Plan does not restore it. Extra family-specific predicates: named_identity: immutable Project and named_plan_id, never focus or name matching; named_cas: expected aggregate revision/currentness agrees with original before/after; named_effect: restored result is genuine actual change; child_authority: child state remains with child owners; archive confirmation or child-edge proof applies when required. False/no-op/rejected results emit no successful mutation fact. Compound owner changes preserve all required facts and canonical visibility atomically; no partly admitted subset claims to be complete. Cross-owner original records remain owned by their respective source owners.
10. **Consumers/checkpoints.** The exact read-only operating consumer is `storage.w3h.named_plan_restored.recovery_read.v1@1.0.0`, called by `NamedPlanOwner` for existing original-result/restart inspection; it never reconstructs or changes canonical domain state from events. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`: resolve CURRENT, authentic root/generation/anchor/frontier/dataset and complete source selection in one live transaction, authenticate the complete captured range and every matching source/payload, then filter exact partition+`named_plan.restored`. Unsupported/corrupt/missing source is unavailable, never skipped as empty. SP-278 alone owns the generic checkpoint’s whole-value CAS, monotonic frontier and rebuild. This read-only family owns **no projector, projection or independent durable checkpoint** (`checkpoint_disposition=none_required`): zero durable reader effects. Any persisted SP-278 token remains its nine durable fields (DL-076); join the transaction’s live redb_snapshot_id only in memory and revalidate the complete live token after every helper immediately before disclosure. Empty verified range, zero matching events and missing coverage are distinct. Reader withdrawal fences interpretation. No current continuation/dispatch authority comes from this history read.
11. **Compatibility/withdrawal.** No alias, automatic legacy converter or historical emission is asserted for this newly prepared family. Preserve actual old admitted shapes and original recipes only when authenticated original issuance selects them; schema/version/recipe/source substitution or unknown selection refuses. Unsupported future versions never mutate. Writer withdrawal first cuts off this exact family/source edition under append lock, fences new prepares and append drains, and preserves pending accepted effects as unresolved custody. Exact retained-result lookup is read-only and needs authorized retained admission. Reader withdrawal stops interpretation and generic-index filtered reads for this family; it never deletes source or dedupe/receipt custody. Generic-index rebuilding excludes withdrawn interpretation and carries truthful coverage; re-enablement needs explicit reviewed version/source adoption, not a replay alias. Current live guards do not retroactively invalidate otherwise valid retained originals.
12. **Oracles.** `named_plan.restored` has its own positive, schema, source, identity, retry, receipt, retention/access, transition, token and withdrawal plan in `reports/event-authority-20261105/W3H-oracle-plan.json`. Every planned negative starts from a valid case and changes one input invariant, with all unrelated derived values recomputed. No oracle implementation or guard-removal proof is claimed in phase 1: criterion 12 **PARTIAL**, native **NOT_RUN**. Phase 2 adopts the reviewed shared numeric/time helper and shared guard-isolation tool before Sol/Astra review.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#CV-1564, ContractName:Plans/storage-plan.md#SP-1564, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286
