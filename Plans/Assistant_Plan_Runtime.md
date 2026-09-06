# Assistant Plan Runtime

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. This document owns the thread-scoped Assistant Plan runtime; it does not make an Assistant Plan a canonical repository Plan, a NamedPlan, or an Orchestrator work source.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Canonical owner for the thread-scoped `AssistantPlan` identity, the six Plan and Deep Plan strategy choices, the direct and ledger-bound backends, structured Plan document revisions with version/hash lineage, Rich Text/Markdown/PDF projection semantics, Revise-only mutation, the one-current-Plan-per-thread invariant, the single Build control state machine, Build admission, `PlanRun` lifecycle, Plan adherence classification, Build With Crew and Build At binding rules, the run-scoped Deep Plan ledger and Plan-scoped PlanUnit bundle boundary, and the direct Planning Wizard handoff boundary. It is not the owner of the global Plan Document/PlanUnit standard, the canonical PlanUnit index, Plan Compile, NodeSeeds, WorkNodes, Orchestrator, the `NamedPlan` aggregate, artifact rendering/retention, or physical storage.

## 0. Scope

### Scope and product boundary

An Assistant Plan is the human-readable deliverable a Puppet Master chat thread produces when the user selects the `Plan` or `Deep Plan` primary mode. It is a thread task Plan. It is not a product specification in `Plans/**`, it is not automatically a `NamedPlan`, and it never becomes an Orchestrator work source by itself. `Plans/07_DRY_OWNERSHIP_MAP.md`-style separation applies literally: `AssistantPlan`, `NamedPlan`, and canonical `Plans/**` are three distinct meanings and the word `Plan` is never used in a writer, record, command, or schema without a disambiguating type and owner.

All six strategy choices produce the same user-facing artifact family. The difference between choices is depth of inspection, research, and multi-agent protocol, plus which backend materializes the Plan. The difference is never a second document model, a second card, a second Build control, or a second status vocabulary.

Every Assistant Plan is scoped to exactly one `project_id` and one `thread_id`. Focus, the visible tab, the selected Activity domain, and the currently rendered card never decide Plan identity; every mutation carries explicit `project_id`, `thread_id`, `assistant_plan_id`, expected version, and expected currentness hash.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Planning_Wizard.md, ContractName:Plans/Named_Plan_System.md, ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/storage-plan.md

## 1. Ownership And Consumers

### Ownership and consumers

Assistant Plan Runtime owns:

- the `AssistantPlan` aggregate, its immutable `assistant_plan_id`, its thread scope, and its lifecycle;
- the exact strategy enumeration and the mapping from strategy to backend;
- `PlanDocumentRevision` semantics, version increment, `content_hash`, immutability of approved revisions, and stable block/step identity requirements;
- the rule that Rich Text and Markdown are projections of one structured revision and that neither is user-editable;
- the one-current-unfinished-Plan-per-thread invariant and the linear-history rule;
- the single Build control state machine and its exactly four labels;
- Build admission, the frozen build binding, `PlanRun` state, and run-to-control-state projection;
- `PlanAdherenceRecord` classification and the resulting admission decision;
- the requirement that Build With Crew and Build At bind an exact Plan version and hash;
- the scoping rules for the Deep Plan run-scoped ledger session and the Plan-scoped PlanUnit bundle, including their negative effects;
- the Planning Wizard handoff payload boundary and the PRD Builder bypass;
- the Plan-side half of Plan-to-To-Do materialization, expressed as typed requests to the To-Do owner.

It does not own:

- the Plan document layout standard, PlanUnit field standard, `gui_related` classification rule, or generated PlanUnit indexes (`Plans/Plan_Document_System.md`);
- ledger record shapes, ledger persistence, or the bootstrap ledger transfer pipeline (`Plans/Planning_Ledger_System.md`);
- NodeSeed, WorkGraph, WorkNode, PlanCompile, Executor intake, or activation (`Plans/Plan_To_Node_Compilation.md`, `Plans/Executor_Protocol.md`);
- `PlanningRun`, topic graphs, topic audits, Final Plan Pack, `ApprovedPlanPack`, or `Approve And Build` (`Plans/Planning_Wizard.md`);
- the `NamedPlan` aggregate, its name, priority, lifecycle, or child-ref summary (`Plans/Named_Plan_System.md`);
- To-Do item records, statuses, transitions, rollups, or projection (`Plans/ToDo_Runtime.md`);
- Goal objective, revision, or continuation semantics (`Plans/Goal_Runtime_System.md`);
- Crew, BrainStorm, Review, and Chat Room participant/run/transcript infrastructure (`Plans/Collaborative_Workflows.md`);
- schedule timers, execution windows, DST behavior, or quota-resume consent (`Plans/Scheduling_and_Quota_Resume.md`);
- artifact rendering, versioning, retention, download, or export engines (`Plans/Runtime_Artifacts_Panel.md`, `Plans/Project_Output_Artifacts.md`, `Plans/FileManager.md`);
- physical key encoding, seglog/redb/index behavior, encryption, or transaction implementation (`Plans/storage-plan.md`);
- command catalog registration, event registration, or production wiring rows (`Plans/Commands_System.md`, `Plans/UI_Command_Catalog.md`, `Plans/Wiring_Matrix.production.json`);
- Settings persistence for default strategy, default export format, or Grill Me default (`Plans/Settings_System.md`).

Consumers project Plan state without re-owning it. Assistant Chat renders the Plan transcript card, the Rich/Markdown toggle, the Build control, and the revision target chrome. `Plans/FinalGUISpec.md` owns placement. `Plans/ToDo_Runtime.md` consumes Plan step identity as internal lineage and must not render Plan-derived source headers. `Plans/usage-feature.md` consumes run attribution. None of these may invent a Plan status, a fifth Build label, or a local Plan store.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Scheduling_and_Quota_Resume.md, ContractName:Plans/Settings_System.md, ContractName:Plans/Commands_System.md

### Explicit exclusions and negative ownership

This document explicitly excludes, and no reader may infer, the following:

- **Global Plan Document and PlanUnit ownership.** The Plan doc layout standard, PlanUnit field standard, `gui_related` rule, lossless conversion, and generated PlanUnit indexes belong to `Plans/Plan_Document_System.md`. Assistant Deep Plan units are a scoped profile of that standard, never a second standard.
- **Plan Compile.** No Assistant Plan of any strategy enters Plan Compile. The only route to Plan Compile is Planning Wizard approval after an explicit handoff.
- **NodeSeeds and WorkNodes.** No Assistant Plan creates NodeSeed candidates, WorkGraph drafts, WorkNodeRequest records, or WorkNodeRecord objects. Deep Plan scoped PlanUnits map directly to To-Dos and stop there. There is no hidden Assistant shortcut into WorkNode generation.
- **Orchestrator.** No Assistant Plan, no Build, no Build With Crew, and no Build At admits work to Orchestrator. Orchestrator is reachable only downstream of Planning Wizard approval.
- **NamedPlan aggregate ownership.** Name, priority, aggregate lifecycle, derived phase, attention summary, and child-ref reduction belong to `Plans/Named_Plan_System.md`.
- **Artifact rendering, versioning, retention, and export engines.** This owner supplies exact version, hash, and refs; the artifact and file owners render, store, retain, and deliver.
- **Physical storage.** Key encoding, storage engines, encryption, retention windows, and transactions belong to `Plans/storage-plan.md`.
- **To-Do item semantics.** Statuses, transitions, rollups, dependency admission, and projection belong to `Plans/ToDo_Runtime.md`. This owner requests materialization and consumes item identity.
- **Goal semantics.** Objective text, revision, approval dialog, pause/resume, and continuation belong to `Plans/Goal_Runtime_System.md`.
- **Collaborative infrastructure.** Participant specs, transcripts, votes, proposals, and panels belong to `Plans/Collaborative_Workflows.md`.
- **Scheduling machinery.** Timers, windows, wind-down, DST, and quota-resume consent belong to `Plans/Scheduling_and_Quota_Resume.md`.
- **A user-facing Plan editor.** There is no Plan editor, no inline block mutation command, and no draft Plan surface.
- **A `superseded` status.** Retired from the thread-card model entirely.
- **A fourth regular depth or `Light|Balanced|Comprehensive` labels.** Retired; migration aliases only.

### Stage boundary

These PlanUnits close static canonical ownership and typed command-shape declarations only. The central catalog, native sole handlers, storage writers, Event Authority payload registration, production wiring and reverse coverage, GUI implementation, migration execution, and runtime proof remain absent. They create no WorkNodes, NodeSeeds, executable queues, Assistant Plan records, emitted commands or events, storage keys, generated indexes, or certification evidence.

## 2. Canonical PlanUnits

### APR-001 - Assistant Plan Runtime Owner Boundary And Negative Ownership

```yaml
plan_unit_id: APR-001
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Assistant_Plan_Runtime.md
canonical_text: >-
  Assistant Plan Runtime is the sole owner of the thread-scoped AssistantPlan identity, the six strategy choices, the direct and ledger_bound backends, structured document revisions with version and hash lineage, Rich Text and Markdown projection semantics, Revise-only mutation, the one-current-Plan-per-thread invariant, the single Build control state machine, Build admission, PlanRun lifecycle, Plan adherence classification, Build With Crew and Build At exact-version binding, the run-scoped Deep Plan ledger and Plan-scoped PlanUnit bundle boundary, and the direct Planning Wizard handoff boundary. It explicitly does not own the global Plan Document or PlanUnit standard, the canonical PlanUnit index, Plan Compile, NodeSeeds, WorkNodes, Orchestrator, the NamedPlan aggregate, artifact rendering or retention, or physical storage.
gui_related: true
gui_classification_reason: The Plan card, mode submenu, view toggle, Build control, and revision composer chrome are user-visible surfaces this owner defines.
depends_on: []
unblocks:
  - APR-002
  - APR-008
  - APR-009
acceptance_criteria:
  - AssistantPlan, NamedPlan, and canonical Plans/** remain three distinct meanings with no shared writer type.
  - Every excluded domain in section 16 resolves to its named owner document and not to this runtime.
  - No consumer surface stores Plan status, version, or hash as local authority.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: assistant_plan_owner_collapse
reasoning_tier: high
context_scope: assistant_plan_runtime
implementation_surfaces:
  - Plans/Assistant_Plan_Runtime.md
node_compile_hint:
  mode: owner_boundary_declaration
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:PLAN-008
  - pm-assistant-implementation-2026-09-02-recovered:DPLAN-006
  - pm-assistant-implementation-2026-09-02-recovered:DPLAN-007
preserved_exact_tokens:
  - "AssistantPlan"
  - "NamedPlan"
  - "assistant_plan_id"
negative_constraints:
  - Do not treat an Assistant Plan as a canonical repository Plan or PlanUnit source.
  - Do not create a parallel Plan document, PlanUnit, or artifact standard inside this runtime.
  - Do not let a GUI surface become a second Plan state owner.
owner_hints:
  - Plans/Assistant_Plan_Runtime.md
```

### APR-002 - Exactly Six Plan Strategy Choices

```yaml
plan_unit_id: APR-002
unit_type: requirement
status: accepted
owner_doc: Plans/Assistant_Plan_Runtime.md
canonical_text: >-
  The complete closed set of Plan strategies is Plan Quick, Plan Standard, Plan Thorough, Deep Plan Thorough, Deep Plan Exhaustive, and Deep Plan BrainStorm. There is no fourth regular depth and no Light, Balanced, or Comprehensive label outside migration read aliases. The canonical strategy values are quick, standard, thorough, deep_thorough, deep_exhaustive, and deep_brainstorm; cmd.chat.plan.strategy.set transports workflow and strategy separately and the owner schema rejects illegal combinations with invalid_strategy_combination rather than coercing to the nearest legal value. Strategy determines backend: quick, standard, and thorough use backend direct; the three deep strategies use backend ledger_bound.
gui_related: true
gui_classification_reason: The Plan and Deep Plan submenus render exactly these six choices to the user.
depends_on:
  - APR-001
unblocks:
  - APR-008
  - APR-009
acceptance_criteria:
  - The Plan submenu renders exactly Quick, Standard, Thorough and no other option.
  - The Deep Plan submenu renders exactly Thorough, Exhaustive, BrainStorm plus the additive Grill Me check option.
  - A quick, standard, or thorough selection under deep_plan and an exhaustive or brainstorm selection under plan are rejected as typed errors.
  - Legacy Light, Balanced, and Comprehensive labels appear nowhere in a live selector.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - strategy enumeration and rejected-combination fixtures
risk_class: plan_depth_enumeration_drift
reasoning_tier: high
context_scope: assistant_plan_strategy
implementation_surfaces:
  - Plans/Assistant_Plan_Runtime.md
node_compile_hint:
  mode: closed_enumeration
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:PLAN-001
  - pm-assistant-implementation-2026-09-02-recovered:DPLAN-001
preserved_exact_tokens:
  - "Plan: Quick | Standard | Thorough"
  - "Deep Plan: Thorough | Exhaustive | BrainStorm"
  - "invalid_strategy_combination"
negative_constraints:
  - Do not add a fourth regular Plan depth.
  - Do not reintroduce Light, Balanced, or Comprehensive as live labels.
  - Do not silently coerce a rejected workflow and strategy combination.
owner_hints:
  - Plans/Assistant_Plan_Runtime.md
  - Plans/Settings_System.md
```

### APR-003 - One Plan Document Family With Rich, Markdown, And PDF Projections

```yaml
plan_unit_id: APR-003
unit_type: requirement
status: accepted
owner_doc: Plans/Assistant_Plan_Runtime.md
canonical_text: >-
  Every one of the six strategy choices produces the same user-facing Plan document family. The durable canonical content is a structured document tree with stable block identifiers and plan_step_id-bearing plan-step blocks. Rich Text is the default view, Markdown is a toggle over the same revision without losing block identity, and PDF export is a third projection of the same exact version. Embedded artifacts open in the ordinary artifact viewer through refs this runtime supplies. Progress display is a separate projection keyed by plan_step_id and approved Markdown is never mutated to show status.
gui_related: true
gui_classification_reason: Rich Text default, the Markdown toggle, embedded artifact rendering, and export are user-visible Plan card behavior.
depends_on:
  - APR-001
unblocks:
  - APR-004
acceptance_criteria:
  - The Plan card opens in Rich Text by default and the Markdown toggle renders the same revision.
  - Block and plan step identifiers remain stable across both projections and across export.
  - Markdown and PDF export deliver the exact bound version and hash with an export receipt.
  - No projection mutates the structured revision or its content hash.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - document revision projection and export fixtures
risk_class: plan_projection_divergence
reasoning_tier: high
context_scope: assistant_plan_document
implementation_surfaces:
  - Plans/Assistant_Plan_Runtime.md
node_compile_hint:
  mode: document_projection_contract
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:PLAN-002
preserved_exact_tokens:
  - "Rich Text"
  - "Markdown"
  - "plan_step_id"
negative_constraints:
  - Do not make Markdown a second canonical content store.
  - Do not mutate an approved revision to display progress.
  - Do not lose block identity in any projection or export.
owner_hints:
  - Plans/Assistant_Plan_Runtime.md
  - Plans/Runtime_Artifacts_Panel.md
```

### APR-004 - Read-Only Plan Content And Revise-Only Mutation

```yaml
plan_unit_id: APR-004
unit_type: requirement
status: accepted
owner_doc: Plans/Assistant_Plan_Runtime.md
canonical_text: >-
  Plan content is read-only to the user. The user can select, copy, scroll, and ask about Plan content but has no editable caret, no inline block replace or remove command, and no separate Plan editor. The only content mutation route is Revise, labeled exactly Revise and never Edit. Revise targets the ordinary composer at the current Plan and version, visibly changes composer chrome and placeholder to a form such as Revising Plan V5 with a dismiss control, accepts prose feedback, and causes the agent to produce a complete new structured revision. This applies identically to regular Plan and Deep Plan; Deep Plan gains no editing privilege before Build.
gui_related: true
gui_classification_reason: The absence of an editable caret and the Revise composer targeting chrome are directly user-visible.
depends_on:
  - APR-003
unblocks:
  - APR-006
acceptance_criteria:
  - No GUI surface exposes an editable caret or a direct block mutation command against Plan content.
  - Pressing Revise visibly retargets the ordinary composer and does not open a document editor.
  - Submitting revision feedback produces a new agent-authored structured revision rather than a user edit.
  - A Deep Plan awaiting Build offers the same agent-mediated revision route and no direct editing.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - direct-edit attempt negative fixtures
risk_class: plan_direct_edit_reintroduction
reasoning_tier: high
context_scope: assistant_plan_revision
implementation_surfaces:
  - Plans/Assistant_Plan_Runtime.md
node_compile_hint:
  mode: mutation_route_restriction
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:PLAN-003
  - pm-assistant-implementation-2026-09-02-recovered:DPLAN-004
preserved_exact_tokens:
  - "Revise"
  - "Revising Plan · V5"
negative_constraints:
  - Do not provide direct Rich Text or Markdown editing of Plan content.
  - Do not add an inline replace or remove command that bypasses the agent.
  - Do not label the revision action Edit.
owner_hints:
  - Plans/Assistant_Plan_Runtime.md
  - Plans/assistant-chat-design.md
```

### APR-005 - One Current Plan Per Thread And Linear History

```yaml
plan_unit_id: APR-005
unit_type: requirement
status: accepted
owner_doc: Plans/Assistant_Plan_Runtime.md
canonical_text: >-
  At most one Assistant Plan per thread holds control_state build or building. Completed and canceled Plans are historical and immutable except retention metadata, and their cards remain in chronological transcript order with a compact default presentation. An explicit new-Plan request while an unfinished Plan exists cancels the old Plan and creates the new one; when the old Plan is building, cancellation is requested immediately and creation waits for a safe stop boundary reported as waiting_for_safe_stop. Simultaneous Plan execution in one thread is never admissible. The status superseded is retired from the thread-card model and is not a control_state, relationship, badge, or user-visible word.
gui_related: true
gui_classification_reason: Card ordering, compact history presentation, and the absence of a Superseded label are user-visible.
depends_on:
  - APR-001
unblocks:
  - APR-007
acceptance_criteria:
  - A second unfinished Plan request cancels the first and never yields two current Plans.
  - Historical Completed and Canceled cards stay at their original transcript position and default compact.
  - No Plan picker, no re-anchoring of history, and no Superseded label exists anywhere.
  - A new-Plan request against a building Plan reports waiting_for_safe_stop rather than failing or forking.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - one-current invariant and concurrent-create fixtures
risk_class: multiple_current_plan_or_superseded_regression
reasoning_tier: high
context_scope: assistant_plan_lifecycle
implementation_surfaces:
  - Plans/Assistant_Plan_Runtime.md
node_compile_hint:
  mode: aggregate_invariant
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:PLAN-004
  - pm-assistant-implementation-2026-09-02-recovered:PLAN-015
preserved_exact_tokens:
  - "Canceled"
  - "waiting_for_safe_stop"
negative_constraints:
  - Do not expose superseded as a status or relationship.
  - Do not allow two current Plans or simultaneous Plan execution in one thread.
  - Do not reorder or collapse historical Plan cards.
owner_hints:
  - Plans/Assistant_Plan_Runtime.md
  - Plans/assistant-chat-design.md
```

### APR-006 - Single Plan Identity With Vn Version Lineage

```yaml
plan_unit_id: APR-006
unit_type: requirement
status: accepted
owner_doc: Plans/Assistant_Plan_Runtime.md
canonical_text: >-
  A revision keeps one Plan identity. PlanDocumentRevision carries version, parent_version, content_hash, structured and Markdown refs, step index, embedded artifact refs, research refs, source message refs, and a change summary. current_version advances by exactly one per accepted revision and the card shows a Vn badge that is independent of the Build control and never encodes status. Old versions remain immutable and reachable through Details and version lineage, and an approved revision bound by approved_version and approved_hash can never be rewritten, re-serialized differently, or annotated in place.
gui_related: true
gui_classification_reason: The Vn version badge and version lineage in Details are user-visible.
depends_on:
  - APR-004
unblocks:
  - APR-007
acceptance_criteria:
  - Revision preserves assistant_plan_id and increments current_version by exactly one.
  - The prior version remains byte-immutable and retrievable with its original content hash.
  - The version badge renders independently of the Build control label.
  - An approved revision rejects any in-place mutation with approved_revision_immutable.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - revision lineage and immutability fixtures
risk_class: plan_version_identity_drift
reasoning_tier: high
context_scope: assistant_plan_document
implementation_surfaces:
  - Plans/Assistant_Plan_Runtime.md
node_compile_hint:
  mode: revision_lineage_contract
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:PLAN-005
preserved_exact_tokens:
  - "Plan · V5"
  - "approved_revision_immutable"
negative_constraints:
  - Do not create a new Plan identity for a revision.
  - Do not mutate or re-serialize an approved revision.
  - Do not encode status in the version badge.
owner_hints:
  - Plans/Assistant_Plan_Runtime.md
```

### APR-007 - One Build Control With Exactly Four Labels

```yaml
plan_unit_id: APR-007
unit_type: requirement
status: accepted
owner_doc: Plans/Assistant_Plan_Runtime.md
canonical_text: >-
  A Plan card exposes exactly one Build control, and that control renders exactly one of Build, Building…, Completed, or Canceled. There is no second build affordance, no separate progress control, and no fifth label. Building… persists across a quota wait, an execution-window pause, a restart, and a model or provider switch, because the label reflects the durable PlanRun state rather than a live connection. Completed and Canceled are terminal for that build; a subsequent build of a later revision is a new PlanRun with its own control state. The control is disabled with its exact owner reason when the Plan is not admissible, and it never optimistically shows Completed before a terminal PlanRun result is recorded.
gui_related: true
gui_classification_reason: This unit is the exact rendering contract for the Plan card's Build control.
depends_on: [APR-005, APR-006]
unblocks: [APR-008]
acceptance_criteria:
  - Exactly one Build control exists and shows one of the four labels.
  - Building… survives a quota wait, a window pause, and a restart.
  - Completed is never shown before a terminal PlanRun result is recorded.
  - A non-admissible Plan disables the control with its exact reason.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/assistant-plan-verify.mjs
risk_class: optimistic_or_duplicated_build_control
reasoning_tier: high
context_scope: assistant_plan_build_control
implementation_surfaces:
  - Plans/Assistant_Plan_Runtime.md
  - Plans/FinalGUISpec.md
  - Concepts/chat-assistant-concepts/5.6 Pro/plans.js
node_compile_hint:
  mode: assistant_plan_build_control
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:PLAN-007
  - pm-assistant-implementation-2026-09-02-recovered:04_GUI_IMPACTS.md#7.3
preserved_exact_tokens:
  - "Build"
  - "Building…"
  - "Completed"
  - "Canceled"
negative_constraints:
  - Do not render a second build affordance or a fifth label.
  - Do not show Completed before a terminal PlanRun result exists.
owner_hints:
  - Plans/Assistant_Plan_Runtime.md
```

### APR-008 - Regular Plan Creates Document And To-Dos Only

```yaml
plan_unit_id: APR-008
unit_type: constraint
status: accepted
owner_doc: Plans/Assistant_Plan_Runtime.md
canonical_text: >-
  Plan Quick, Plan Standard, and Plan Thorough use the direct backend. Each creates exactly two things: one read-only Plan document and a mapped set of To-Dos under ToDo Runtime. A regular Plan creates no Planning Ledger session, no PlanUnits of any scope, no WorkNodes, no Plan Compile run, and no Orchestrator effect, and building one produces none of those either. The three depths differ in research and analysis effort, not in backend, and there is no fourth regular depth and no legacy Light, Balanced, or Comprehensive labelling.
gui_related: true
gui_classification_reason: This closes the Plan submenu at three depths and forbids surfaces that would imply ledger or Orchestrator work.
depends_on: [APR-002, APR-007]
unblocks: [APR-009]
acceptance_criteria:
  - A regular Plan produces exactly one document and its To-Dos.
  - No ledger, PlanUnit, WorkNode, Plan Compile run, or Orchestrator record is created by a regular Plan or its build.
  - The Plan submenu offers exactly Quick, Standard, and Thorough.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/assistant-plan-verify.mjs
risk_class: regular_plan_leaks_into_orchestrator
reasoning_tier: high
context_scope: assistant_plan_regular_backend
implementation_surfaces:
  - Plans/Assistant_Plan_Runtime.md
  - Plans/ToDo_Runtime.md
  - Plans/Plan_To_Node_Compilation.md
node_compile_hint:
  mode: assistant_plan_regular_backend
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:PLAN-008
  - pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#5.3
preserved_exact_tokens:
  - "Quick"
  - "Standard"
  - "Thorough"
negative_constraints:
  - Do not create a ledger, PlanUnit, WorkNode, or Orchestrator record from a regular Plan.
  - Do not add a fourth regular depth or legacy depth labels.
owner_hints:
  - Plans/Assistant_Plan_Runtime.md
```

### APR-009 - Deep Plan Scoped Ledger And Post-Approval Scoped PlanUnits

```yaml
plan_unit_id: APR-009
unit_type: requirement
status: accepted
owner_doc: Plans/Assistant_Plan_Runtime.md
canonical_text: >-
  Deep Plan Thorough, Deep Plan Exhaustive, and Deep Plan BrainStorm use the ledger backend. A Deep Plan opens a run-scoped Planning Ledger session under the Deep Plan profile owned by Planning Ledger System, and on Build approval -- not before -- it creates standard-schema, Plan-scoped PlanUnits under the scoped profile owned by Plan Document System, mapped to To-Dos. Those scoped units are not admitted into the global product PlanUnit index. A Deep Plan still creates no WorkNodes, no Plan Compile run, and no Orchestrator effect. The scoped ledger and scoped units are hidden behind Plan details rather than presented as the primary Plan surface.
gui_related: true
gui_classification_reason: The scoped ledger and units appear only behind Plan details, never as the primary Plan document view.
depends_on: [APR-008]
unblocks: [APR-010]
acceptance_criteria:
  - Deep Plan opens a run-scoped ledger session under the Deep Plan profile.
  - Scoped PlanUnits are created only after Build approval and are mapped to To-Dos.
  - Scoped units never enter the global product PlanUnit index.
  - No WorkNode, Plan Compile run, or Orchestrator record is created.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/assistant-plan-verify.mjs
risk_class: scoped_units_admitted_as_global_canon
reasoning_tier: high
context_scope: assistant_plan_deep_backend
implementation_surfaces:
  - Plans/Assistant_Plan_Runtime.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
node_compile_hint:
  mode: assistant_plan_deep_backend
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:DEEP-001
  - pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#5.4
preserved_exact_tokens:
  - "run-scoped ledger"
  - "Plan-scoped PlanUnits"
negative_constraints:
  - Do not create scoped PlanUnits before Build approval.
  - Do not admit scoped units into the global PlanUnit index.
  - Do not create WorkNodes or enter Orchestrator from a Deep Plan.
owner_hints:
  - Plans/Assistant_Plan_Runtime.md
```

### APR-010 - Send To Planning Wizard Is The Only Orchestrator Route And Bypasses PRD Builder

```yaml
plan_unit_id: APR-010
unit_type: requirement
status: accepted
owner_doc: Plans/Assistant_Plan_Runtime.md
canonical_text: >-
  Neither a regular Plan nor a Deep Plan enters the Orchestrator except through an explicit user-initiated Send To Planning Wizard action, which hands the exact Plan revision to Planning Wizard direct intake and bypasses PRD Builder entirely. PRD Builder is not a precondition on this route. After the handoff, Planning Wizard owns the full planning, Plan Compile, and Orchestrator flow, and the Assistant Plan becomes a linked source reference rather than a parallel authority. There is no implicit build detour, no automatic promotion on Build, and no silent creation of a NamedPlan; a NamedPlan child or source reference is created only on explicit save, explicit promotion, or this Wizard handoff.
gui_related: true
gui_classification_reason: This defines a Plan card action, its confirmation, and the receipt shown after handoff.
depends_on: [APR-009]
unblocks: []
acceptance_criteria:
  - The only route into Orchestrator is an explicit Send To Planning Wizard action.
  - The route bypasses PRD Builder and does not require a PRD.
  - Building a Plan never promotes it implicitly.
  - No NamedPlan is created without explicit save, promotion, or handoff.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/assistant-plan-verify.mjs
risk_class: implicit_orchestrator_entry_from_assistant_plan
reasoning_tier: high
context_scope: assistant_plan_wizard_handoff
implementation_surfaces:
  - Plans/Assistant_Plan_Runtime.md
  - Plans/Planning_Wizard.md
  - Plans/PRD_Builder.md
  - Plans/Named_Plan_System.md
node_compile_hint:
  mode: assistant_plan_wizard_handoff
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:PLAN-009
  - pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#5.13
preserved_exact_tokens:
  - "Send To Planning Wizard"
  - "bypasses PRD Builder"
negative_constraints:
  - Do not enter Orchestrator implicitly from a Plan build.
  - Do not require a PRD on the Wizard handoff route.
  - Do not auto-create a NamedPlan for every small Plan.
owner_hints:
  - Plans/Assistant_Plan_Runtime.md
```

### APR-011 - Build With Crew And Exact-Version Scheduled Build

```yaml
plan_unit_id: APR-011
unit_type: requirement
status: accepted
owner_doc: Plans/Assistant_Plan_Runtime.md
canonical_text: >-
  Build With Crew admits the exact current Plan revision for execution through a configured Crew run owned by Collaborative Workflows instead of the single-agent build path; the crew configuration belongs to the build target and the Build control still shows exactly one of the four labels. Build At binds an execution schedule to the exact plan_id, plan_version, and content hash through Scheduling and Quota Resume, and a Plan revision invalidates that pending schedule with a named reason rather than silently rebinding to the newer version. Repeated occurrences of a recurring window resume one PlanRun rather than producing duplicate builds, and a manual Stop, Pause, or Cancel outranks every scheduled or quota-driven resume.
gui_related: true
gui_classification_reason: These are Plan card actions with their own modals and an invalidated-schedule state on the card.
depends_on: [APR-007]
unblocks: []
acceptance_criteria:
  - Build With Crew runs the exact current revision through a configured Crew.
  - Build At binds the exact version and hash and shows an invalidated state on revision.
  - A recurring window resumes one run rather than producing duplicate builds.
  - A manual stop defeats every scheduled or quota resume.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/assistant-plan-verify.mjs
  - node tests/scheduling-verify.mjs
risk_class: wrong_version_or_duplicate_scheduled_build
reasoning_tier: high
context_scope: assistant_plan_build_routes
implementation_surfaces:
  - Plans/Assistant_Plan_Runtime.md
  - Plans/Collaborative_Workflows.md
  - Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: assistant_plan_build_routes
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:PLAN-010
  - pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#5.11
  - pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#5.12
preserved_exact_tokens:
  - "Build With Crew"
  - "Build At"
negative_constraints:
  - Do not rebind a scheduled build to a newer Plan revision.
  - Do not produce one build per window occurrence.
owner_hints:
  - Plans/Assistant_Plan_Runtime.md
```

### APR-012 - Plan Adherence And To-Do Mapping

```yaml
plan_unit_id: APR-012
unit_type: requirement
status: accepted
owner_doc: Plans/Assistant_Plan_Runtime.md
canonical_text: >-
  A built Plan is authoritative over the work admitted for it. PlanAdherenceRecord tracks which Plan steps were executed, which were skipped with a reason, and which produced work outside the Plan, and a divergence is surfaced rather than absorbed silently. Plan steps map to To-Dos under ToDo Runtime: one step may map to several To-Dos and one To-Do may aggregate several tightly related tool operations, but every executable leaf keeps stable work bindings. Raw scoped PlanUnits and WorkNodes are never rendered as To-Dos. Completing the To-Dos does not by itself complete the Plan; the PlanRun terminal result does, and it requires the recorded outcome evidence its own owner defines.
gui_related: true
gui_classification_reason: Divergence must be visible on the Plan card and the To-Do mapping drives the Activity list.
depends_on: [APR-008, APR-009]
unblocks: []
acceptance_criteria:
  - Executed, skipped, and out-of-plan work are each recorded with reasons.
  - A divergence is surfaced rather than silently absorbed.
  - Scoped PlanUnits and WorkNodes are never rendered as To-Dos.
  - Completing To-Dos alone does not complete the Plan.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/assistant-plan-verify.mjs
  - node tests/todo-verify.mjs
risk_class: silent_plan_divergence
reasoning_tier: standard
context_scope: assistant_plan_adherence
implementation_surfaces:
  - Plans/Assistant_Plan_Runtime.md
  - Plans/ToDo_Runtime.md
node_compile_hint:
  mode: assistant_plan_adherence
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:PLAN-011
  - pm-assistant-implementation-2026-09-02-recovered:02_RUNTIME_AND_STORAGE_CONTRACTS.md#5.7
preserved_exact_tokens:
  - "PlanAdherenceRecord"
negative_constraints:
  - Do not absorb a Plan divergence silently.
  - Do not render raw PlanUnits or WorkNodes as To-Dos.
owner_hints:
  - Plans/Assistant_Plan_Runtime.md
```

## 3. Contracts, Schemas, Events, Or Data Shapes

### The exact six strategy choices

The primary mode menu exposes `Plan` and `Deep Plan` as two separate primary modes, each with a submenu. The complete, closed set of Plan strategies is:

```text
Plan:      Quick | Standard | Thorough
Deep Plan: Thorough | Exhaustive | BrainStorm
```

There is no fourth regular depth. `Light`, `Balanced`, and `Comprehensive` are retired labels and exist only as migration read aliases described in section 15. `cmd.chat.plan_thoroughness` and any control that offered those three labels are retired; `cmd.chat.plan.strategy.set` replaces them.

The canonical `strategy` value written to `AssistantPlanRecord` is one of `quick`, `standard`, `thorough`, `deep_thorough`, `deep_exhaustive`, `deep_brainstorm`. The selection command transports `workflow` and `strategy` separately as `workflow: plan|deep_plan` plus `strategy: quick|standard|thorough|exhaustive|brainstorm`; the owner schema validates the allowed combinations and rejects `quick` under `deep_plan`, `brainstorm` under `plan`, and `exhaustive` under `plan`. A rejected combination is a typed `invalid_strategy_combination` error, never a silent coercion to the nearest legal value.

Strategy determines the backend:

```text
quick | standard | thorough           -> backend: direct
deep_thorough | deep_exhaustive | deep_brainstorm -> backend: ledger_bound
```

Regular depth behavior is a bounded obligation, not a token budget. `Quick` performs only the inspection and questioning that the request requires, produces a compact document and a bounded To-Do hierarchy, and still may not omit obvious safety or validation work. `Standard` is the default practical depth and covers relevant context, dependencies, risks, expected outcomes, and appropriate validation To-Dos. `Thorough` broadens cross-file and cross-system inspection, records alternatives, downstream effects, compatibility, and rollback, and produces finer To-Dos while remaining an Assistant task Plan rather than a product specification.

Deep depth obligations are defined in section 6. `Grill Me` is an additive, persistent check option in the Deep Plan submenu; it does not create a seventh choice and does not change the backend. Question-allowance arithmetic for Grill Me is owned by `QMAX-001..016` in the Additive Correction v4 section of this document (`+25`, one shared counter); `Plans/Skills_System.md` owns the Grill Me methodology. `assistant.chat.deep_plan.grill_me_default` remains a Settings value, not a Plan record field.

Default strategy per workflow comes from Settings (`assistant.chat.plan.default_strategy`, default `standard`; `assistant.chat.deep_plan.default_strategy`, default `thorough`). Settings stores the preference; this runtime stores the strategy actually frozen into the created Plan. A later Settings change never rewrites an existing `AssistantPlanRecord`.

### Plan identity, the one-current invariant, and version lineage

`AssistantPlanRecord` (`pm.assistant_plan.record.v1`) is the aggregate. `assistant_plan_id` is immutable. `thread_id` and `project_id` are immutable. `strategy` and `backend` are frozen at creation; changing depth means creating a new Plan, never mutating an existing one.

At most one Assistant Plan in a thread may hold `control_state` of `build` or `building`. That is the one-current invariant and it is enforced by the owner, not by the card. `completed` and `canceled` Plans are historical and immutable except for retention metadata.

An explicit new-Plan request while an unfinished Plan exists never produces two current Plans. If the current Plan is merely proposed (`control_state: build`), the request cancels it and creates the new Plan in the same admitted operation. If the current Plan is `building`, cancellation is requested immediately, new-Plan creation waits for a safe stop boundary, and the request returns `waiting_for_safe_stop` as an observable state rather than a failure. Simultaneous Plan execution in one thread is not admissible under any topology.

`superseded` is retired. It is not a `control_state`, not a relationship, not a badge, and not a user-visible word. A replaced Plan is `canceled` and says so.

Historical Plan cards remain in chronological transcript order at the position where they were created. A new Plan appears lower in the transcript. There is no Plan picker, no re-anchoring of an old card to the bottom, and no collapse of history into one live card.

Revision keeps one Plan identity. `PlanDocumentRevision` (`pm.assistant_plan.document_revision.v1`) carries `version`, `parent_version`, `content_hash`, `structured_document_ref`, `markdown_artifact_ref`, `step_index`, embedded artifact refs, research refs, source message refs, and a change summary. `current_version` on the aggregate advances by exactly one per accepted revision. The card shows `Plan · V5`; the version badge is independent of the Build control and never encodes status.

Old versions remain immutable and reachable through Details and version lineage. An approved revision, meaning one bound by `approved_version` and `approved_hash`, can never be rewritten, re-serialized with different bytes, or annotated in place. Progress display for a building Plan is a separate projection keyed by `plan_step_id`; approved Markdown is never mutated to show status.

### The Plan document, its projections, and the read-only rule

The durable canonical content is a structured document tree with stable block IDs. Block types are `heading`, `paragraph`, `ordered_list`, `unordered_list`, `todo_like_plan_step`, `table`, `code`, `mermaid`, `image`, `artifact`, `quote`, `callout`, and `divider`. A plan-step block additionally carries `plan_step_id`, `title`, `description`, `parent_step_id`, `depends_on[]`, optional `parallel_group_id`, optional `expected_outcome`, `validation_todo_hints[]`, and `source_refs[]`.

Rich Text is the default view. Markdown is a toggle over the same revision. Both are projections of one structured revision, both are read-only, and the Markdown view must not lose block identity. PDF export is a third projection of the same exact version. Embedded artifacts render through the ordinary artifact viewer owned by the artifact owners; this runtime supplies refs and version identity only.

The user can select, copy, scroll, and ask the agent about Plan content. The user cannot place an editable caret in the Plan, cannot issue an inline replace or remove command against a block, and has no separate Plan editor. There is no direct Rich Text mutation, no direct Markdown mutation, and no command that bypasses the agent to change a block.

`Revise` is the only content mutation route and the label is exactly `Revise`, never `Edit`. Pressing `Revise` targets the ordinary composer at the current Plan and version, visibly changes composer chrome and placeholder to a form such as `Revising Plan · V5` with a dismiss control, and accepts ordinary prose feedback. On submit the agent produces a complete new structured revision; the version increments; the transcript may show a compact revision receipt; old versions stay immutable. The composer is the ordinary composer with a destination, not a document editor.

Revision while `Building…` requires stopping the current execution first, because approved source cannot mutate beneath admitted work. Revision after a schedule was created invalidates that schedule; see section 9.

### Regular Plan backend

Regular Plan uses `backend: direct`. Its complete flow is:

```text
request -> relevant inspection and questions -> Plan document -> Revise/Build -> To-Dos -> direct execution
```

Regular Plan creates a Plan document and To-Dos and nothing else. It does not create or invoke a Planning Ledger session, PlanUnits, a PlanUnit index entry, NodeSeeds, WorkNodes, Plan Compile, Orchestrator admission, Spec Lock, shards, evidence, or any other governance artifact. A regular Plan build that produced a PlanUnit, a NodeSeed, or an Orchestrator record is a defect, and the negative test in section 18 asserts zero such effects.

A regular Plan may use Goal-driven execution only when the user explicitly asks for it. Selecting a Goal never changes the backend to `ledger_bound` and never upgrades a `Plan` strategy to a `Deep Plan` strategy. The Goal is a `goal_driven` value of `PlanRun.execution_topology` plus a Goal reference; Goal objective, revision, pause/resume, and continuation remain owned by `Plans/Goal_Runtime_System.md`.

Question behavior in regular Plan reuses the existing questionnaire host. Agents reuse existing thread answers, merge semantic duplicates, research factual questions instead of asking the user when research can answer them, and stop early when enough information exists. Question ceilings for regular strategies are Settings-owned and are not Plan record fields: Quick 3, Standard 6, Thorough 8, each raised by the Grill Me extension of 25 when it is enabled (`QMAX-001..004`).

### Deep Plan backend

Deep Plan uses `backend: ledger_bound`. Its complete flow is:

```text
request -> run-scoped native ledger -> questions and research -> standardized Plan document
       -> Revise/Build -> scoped standard PlanUnits -> To-Dos -> direct Assistant execution
```

`DeepPlanLedgerSession` (`pm.assistant_plan.deep_ledger_session.v1`) is a run-scoped native ledger session bound to one `assistant_plan_id` and one `plan_version`, holding design atoms, decisions, questions, corrections, research, and current-state refs with `status` of `collecting`, `ready`, `sealed`, or `cancelled`. Record shapes and persistence are owned by `Plans/Planning_Ledger_System.md` under its Assistant Deep Plan profile. This runtime owns only the binding, the scope, and the negative effects: the session is not sharded, does not run the bootstrap ledger migration or transfer pipeline, does not modify `Plans/**` product canon, does not update the global `.plan_index`, and is never used by a regular Plan.

The ledger produces one standardized, human-readable Plan document in the same document family described in section 4. The user sees a Plan, not a ledger. Ledger internals are reachable only through Details and sources.

Before Build, the user may request agent-mediated revisions exactly as in section 4. Deep Plan gains no editing privilege. The ledger session follows the Plan version: a new version either extends the session or seals it and opens the next, and the session's `plan_version` always matches the revision it justifies.

On Build approval, and only then, Deep Plan materializes `AssistantDeepPlanUnitBundle` (`pm.assistant_plan.planunit_bundle.v1`) scoped to `assistant_plan_id + plan_version + plan_hash` with `scope_kind: assistant_deep_plan`. The bundle uses standard PlanUnit field meanings owned by `Plans/Plan_Document_System.md` and may carry dependencies, acceptance conditions, negative constraints, source and research lineage, affected surfaces, risks, expected outcomes, validation tasks, and parallelization hints. The bundle is validated before To-Do mapping; `validation_status: failed` blocks the build with an exact reason and creates no To-Dos.

The bundle's negative effects are mandatory and testable: no global plan index mutation, no product `Plans/**` modification, no owner-doc implication, no NodeSeed or WorkNode creation, no Plan Compile entry, no Orchestrator admission, and no governance sealing. Scope and parent identity exist precisely so these units can never be mistaken for global product PlanUnits.

Deep depth obligations:

- **Thorough** — structured ledger, broad project inspection, alternatives, dependencies, failure handling, tests, rollback, and scoped PlanUnits.
- **Exhaustive** — every Thorough obligation plus more complete external research, adversarial alternatives, cross-system impact, migrations, compatibility, security and privacy, performance, deployment and operations, long-tail failure analysis, and uncertainty closure.
- **BrainStorm** — a strict superset of Exhaustive. Every Exhaustive dimension is still required, and BrainStorm adds configurable multi-agent discovery and research, independent proposals produced before debate, evidence-driven debate, targeted follow-up research, voting, preserved dissent, and synthesis into exactly one Deep Plan document.

BrainStorm's participant roster, transcript, proposals, votes, question bank, and card/panel behavior are owned by `Plans/Collaborative_Workflows.md`. Its target-project read-only rule and temporary research provisioning are owned there and by `Plans/MCP_Integration.md`. This runtime owns only that BrainStorm is the third Deep Plan strategy, that it is a strict superset of Exhaustive, and that its single output is one `AssistantPlan` document in this family. A BrainStorm process card remains in the transcript after the Plan is created; the Plan card does not absorb or replace it.

The BrainStorm base maximum of 20 user-decision questions, the shared question frontier across participants, and the configurable Grill Me extension (default `+25`, giving a BrainStorm effective maximum of 45) are recorded here as consumed constraints. The full six-strategy table, the single-counter rule, the charge point, and the typed exhaustion result are owned by `QMAX-001..016` in the Additive Correction v4 section of this document; the durable question registry is owned by `Plans/Planning_Ledger_System.md` and participant protocol by `Plans/Collaborative_Workflows.md`.

### Build admission, the Build control, and PlanRun

### 7.1 The single Build control

The Plan card footer has exactly one primary control. It renders exactly one of four labels and is never replaced by a separate status badge:

```text
Build  ->  Building…  ->  Completed
                       ↘  Canceled
```

The exact preserved tokens are `Build`, `Building…`, `Completed`, and `Canceled`. `Build` is actionable. `Building…` is disabled as a duplicate-build action and reflects an active run. `Completed` and `Canceled` are terminal, non-actionable labels on the same control; Details and Export remain reachable through their own controls.

There is no fifth label. Paused, quota-wait, window-wait, and manual-pause states leave the control at `Building…` and place the explanation in secondary support copy such as `Building… · paused until 10:00 PM` near the card or in Activity. A run state never becomes a Build label.

The eligible card actions, shown as applicable to state and capability, are `Revise`, `Build`, `Build With Crew`, `Build At…`, `Send To Planning Wizard`, `Export`, `Cancel`, and the open-sources/artifacts/details routes. During execution the footer shows `Building…`, an `Open To-Dos` route, run-owned pause/resume where the run owner exposes it, and `Cancel`.

### 7.2 Build admission

Build freezes the exact `assistant_plan_id`, `version`, `content_hash`, the full `plan_step_id` set, the selected runtime, the permission snapshot, the tool set, and the project/repository/worktree identity. `approved_version` and `approved_hash` are written on the aggregate at that moment and are immutable afterwards.

Regular Plan then creates a To-Do hierarchy directly through the To-Do owner. Deep Plan first materializes and validates the scoped PlanUnit bundle and only then maps units and steps to To-Dos. Neither route launches Orchestrator, and neither route may fabricate To-Do completion.

Build is idempotent. The request carries an idempotency key; a replayed key returns the original `plan_run_id`, the original To-Do list revision, and the original receipt, and creates no second run and no duplicate To-Dos. A double-click, a restart-and-retry, and a network replay are all the same admitted operation. A same-key/different-binding request is rejected as `idempotency_conflict`.

Build fails closed. A stale expected version, a stale currentness hash, a missing permission snapshot, an unresolvable project/worktree, a failed PlanUnit bundle validation, or a To-Do materialization rejection leaves the control at `Build`, creates no `PlanRun`, creates no To-Dos, and returns an exact typed reason.

### 7.3 PlanRun

`PlanRun` (`pm.assistant_plan.run.v1`) carries `plan_run_id`, the plan identity and frozen `plan_version`/`plan_hash`, `execution_topology` of `agent`, `crew`, or `goal_driven`, `todo_list_revision`, a runtime snapshot ref, a permission snapshot ID, a project context ref, an optional schedule ref, and `state` of `running`, `paused`, `waiting_quota`, `waiting_window`, `blocked`, `completed`, `cancelled`, or `failed`.

`AssistantPlanRecord.control_state` remains `building` while the run is `paused`, `waiting_quota`, `waiting_window`, or `blocked`. The run state is the explanatory truth and is shown separately. `control_state` becomes `completed` only when the run reaches `completed`, and `canceled` when the run reaches `cancelled` or when an unstarted Plan is cancelled. A `failed` run does not silently become `Completed`; it presents the failure and leaves the Plan cancellable or revisable per owner policy.

No client-local timer is authoritative for run state, pause, resume, quota wait, or window wait. Restart restores the active Plan, its control state, its run state, and its To-Do binding from durable records.

### Plan adherence

Every material work segment, subagent assignment, Crew assignment, mutation or tool batch, research task, and validation task admitted under a `PlanRun` carries:

```text
plan_id
plan_version
plan_step_ids[]
todo_ids[]
planunit_ids[] when Deep Plan
```

A host-side `PlanAdherenceController` evaluates observed work against the frozen Plan and writes `PlanAdherenceRecord` (`pm.assistant_plan.adherence.v1`) with one of four classifications and its bound result:

| Classification | Meaning | Required result |
|---|---|---|
| `implementation_detail` | Work is within the approved step's intent | `allowed`; continue and record |
| `minor_extension` | Work needs a bounded addition under an existing step | `todo_added`; add a child To-Do under the current Plan step, source Plan unchanged |
| `material_plan_change` | Work would change what the Plan says will be done | `revision_required`; stop admitting new mutation work and return the user to Revise |
| `constraint_conflict` | Work conflicts with a recorded constraint | `blocked`; block the affected work until user resolution |

`minor_extension` never rewrites the approved document. `material_plan_change` never proceeds by silently editing the Plan; the approved revision is immutable and the only route forward is a new version through `Revise`. `constraint_conflict` blocks only the affected work, not the whole run, unless the conflict makes the run unsafe.

Back Seat Driver may advise about drift and its findings may reference adherence records, but BSD is never the adherence authority and cannot authorize, classify, or clear a divergence. That boundary is restated in `Plans/Back_Seat_Driver.md`.

### Build With Crew and Build At

`Build With Crew` always opens the Crew configuration modal, preselected with the exact current Plan version and hash, populated from Settings defaults. It never starts a Crew silently. Final `Start` is one atomic admission: the `CollaborativeRun`, the `PlanRun` with `execution_topology: crew`, and the To-Do hierarchy are created together or none of them are. Partial creation is a defect and must roll back. There is no Orchestrator route from `Build With Crew`.

Crew definition, participant specs, effective roster, transcript, and card/panel behavior are owned by `Plans/Collaborative_Workflows.md`. This runtime owns the exact-version binding and the atomicity requirement.

`Build At…` creates an exact-version scheduled build. The schedule binds `assistant_plan_id`, `plan_version`, and `plan_hash`. A later revision invalidates the pending schedule, emits `assistant_plan.schedule_invalidated`, places a `Schedule needs update` notice on the Plan card, and disables automatic dispatch until the user explicitly updates or reschedules. There is no silent retarget to the newer version, and no schedule may dispatch a version it did not bind.

Before dispatch, the scheduler revalidates the bound Plan version and hash, the provider and account, the project and worktree, the permission and tool snapshot, and the execution window. A revalidation failure holds the dispatch with an exact reason instead of building a different Plan. A recurring window resumes the one existing run; it never starts a duplicate build per occurrence. Manual pause, cancel, or Stop always overrides scheduled or quota auto-resume.

Timer authority, window arithmetic, wind-down, DST behavior, and quota-resume consent are owned by `Plans/Scheduling_and_Quota_Resume.md`. `cmd.chat.plan.schedule_build` is that owner's command; this document owns the Plan-side binding and invalidation rules it must honor.

### Exact command IDs and required result boundaries

The exact Assistant Plan Runtime command IDs requiring central catalog registration are:

| Command ID | Kind | Request -> result | Source surfaces | Required result boundary |
|---|---|---|---|---|
| `cmd.chat.plan.strategy.set` | domain_action | `AssistantPlanStrategyRequest` -> `AssistantPlanStrategyResult` | `mode_menu` | Sets the strategy applied to the next Plan request only. Validates the `workflow`/`strategy` combination. Never mutates an existing Plan record, version, hash, or backend. |
| `cmd.chat.plan.create` | domain_action | `AssistantPlanCreateRequest` -> `AssistantPlanCreateResult` | `composer`, `slash`, `natural_language` | Creates exactly one current Plan planning run and V1 document identity, or cancels and replaces the unfinished current Plan under explicit new-Plan intent. Never creates two current Plans, a ledger for a direct backend, or a NamedPlan. |
| `cmd.chat.plan.request_revision` | domain_action | `AssistantPlanRevisionRequest` -> `AssistantPlanRevisionResult` | `targeted_composer` | Starts an agent-mediated revision against an exact `assistant_plan_id` plus expected version and hash. Never mutates the document directly and never edits an approved revision. |
| `cmd.chat.plan.view.set` | shell_view | `AssistantPlanViewRequest` -> `AssistantPlanViewResult` | `plan_card` | Selects `rich` or `markdown` view state only. Produces no revision, no hash change, and no durable Plan mutation. |
| `cmd.chat.plan.build` | domain_action | `AssistantPlanBuildRequest` -> `AssistantPlanBuildResult` | `plan_card` | Freezes exact version/hash/runtime/permissions/project, validates the scoped PlanUnit bundle for Deep Plan, materializes To-Dos through the To-Do owner, creates exactly one `PlanRun`, and moves the control to `Building…`. Idempotent replay returns the original run. Never admits Orchestrator, WorkNodes, or Plan Compile. |
| `cmd.chat.plan.build_with_crew` | domain_action | `AssistantPlanCrewBuildRequest` -> `AssistantPlanBuildResult` | `plan_card`, `crew_modal` | Opens the Crew modal preselected with the exact version/hash, then creates `CollaborativeRun`, `PlanRun`, and To-Dos atomically or creates none of them. Never starts a Crew without the modal and never routes to Orchestrator. |
| `cmd.chat.plan.cancel` | domain_action | `AssistantPlanCancelRequest` -> `AssistantPlanCancelResult` | `plan_card` | Cancels the current unfinished Plan or the active run under exact expected-state rules and sets the control to `Canceled`. Never emits `superseded`, never deletes history, and never purges shared referenced artifacts. |
| `cmd.chat.plan.export` | domain_action | `AssistantPlanExportRequest` -> `ArtifactExportResult` | `plan_card` | Produces a versioned `markdown`, `pdf`, or `pm_bundle` export of the exact bound version with an export receipt. Never re-serializes a different version and never mutates the source revision. |
| `cmd.chat.plan.open_details` | navigation_wrapper | `AssistantPlanRoute` -> `RouteResult` | `plan_card`, `artifact_details` | Navigation only, to Plan details, sources, and version lineage. Never mutates Plan, run, To-Do, or artifact state. |

Two adjacent commands are owned elsewhere and are consumed, not redefined, here. `cmd.chat.plan.schedule_build` (`AssistantPlanScheduleRequest` -> `ExecutionScheduleResult`, surface `plan_card`) is owned by `Plans/Scheduling_and_Quota_Resume.md` and must honor the exact-version binding and invalidation rules in section 9. `cmd.chat.plan.send_to_planning_wizard` (`AssistantPlanHandoffRequest` -> `PlanningWizardIntakeResult`, surface `plan_card`) is owned by `Plans/Planning_Wizard.md` and must honor the payload boundary and PRD bypass in section 10.

These exact IDs are canonical owner requests. They are not registered until the central command catalog, the event catalog, and production wiring rows adopt them. Until that registration closes, GUI controls remain disabled with `command_not_registered`; no page-local handler, alias, fixture, or concept action may simulate success. A concept interaction that appears to work may be fixture-backed and must never be recorded as registered native command, handler, provider, or persistence proof.

### Typed request, result, and error enumerations

Every request reuses the central command/runtime envelope and carries, as applicable, `schema_id`, `schema_version`, `command_id`, `command_instance_id`, `project_id`, `thread_id`, `assistant_plan_id`, `expected_version`, `expected_currentness_hash`, `actor_identity`, `permission_snapshot_id`, `idempotency_key`, `source_surface`, `correlation_id`, `causation_id`, and `created_at`.

Command-specific request payloads:

```text
AssistantPlanStrategyRequest   workflow, strategy, grill_me_enabled
AssistantPlanCreateRequest     source_message_ref, strategy, requested_runtime,
                               grill_me_enabled, explicit_new_plan_intent,
                               requested_goal_driven (explicit user request only)
AssistantPlanRevisionRequest   assistant_plan_id, expected_version, expected_hash,
                               revision_instruction_message_ref
AssistantPlanViewRequest       assistant_plan_id, view: rich|markdown
AssistantPlanBuildRequest      assistant_plan_id, version, plan_hash,
                               execution_topology: agent|goal_driven,
                               runtime_ref, permission_snapshot_id,
                               project_context_ref, idempotency_key
AssistantPlanCrewBuildRequest  AssistantPlanBuildRequest fields plus
                               collaborative_definition_ref
AssistantPlanCancelRequest     assistant_plan_id, expected_version, expected_hash,
                               active_run_disposition
AssistantPlanExportRequest     assistant_plan_id, version, plan_hash,
                               format: markdown|pdf|pm_bundle
AssistantPlanRoute             assistant_plan_id, target: details|sources|versions
```

Every mutation result carries `status`, `committed`, the revision and currentness after the operation, receipt refs, an `observable_work` ref when the operation is asynchronous, an error or reason enum when not committed, and `replay_of` when the result is an idempotent replay. A UI acknowledgement is not domain success, and an accepted dispatch is not a completed build.

The typed error enumeration is `invalid_request`, `invalid_strategy_combination`, `project_not_found`, `thread_not_found`, `assistant_plan_not_found`, `stale_plan_version`, `stale_currentness`, `plan_not_current`, `current_plan_unfinished`, `waiting_for_safe_stop`, `approved_revision_immutable`, `planunit_bundle_validation_failed`, `todo_materialization_failed`, `schedule_binding_stale`, `crew_start_not_atomic`, `idempotency_conflict`, `command_not_registered`, `permission_denied`, `owner_unavailable`, and `cancelled`. A failure remains a failure: it never advances `control_state`, never writes `approved_version`/`approved_hash`, never creates To-Dos, and never emits a success-shaped receipt.

Availability results name the exact missing prerequisite — central catalog registration, native sole handler, storage writer, Event Authority payload registration, production wiring row, or owner service — rather than presenting a generic disabled state.

### Events

The required semantic event names for this owner are:

```text
assistant_plan.created
assistant_plan.version_created
assistant_plan.build_started
assistant_plan.completed
assistant_plan.cancelled
assistant_plan.exported
assistant_plan.wizard_handoff_created
assistant_plan.schedule_invalidated
```

These names require central EventRecord registration and payload schema admission before emission; until then `expected_event_types` is empty and no writer may emit them. Envelopes carry project, thread, and Plan identity, plan version and hash, aggregate revision, actor, correlation and causation, idempotency key, currentness, and redacted source refs.

Ordinary Assistant Plan and Assistant Deep Plan execution must not emit global `PlanCompile`, `NodeSeed`, `WorkNode`, or Orchestrator events. Emission of any of those from an Assistant Plan build is a contract violation, and the negative test in section 18 asserts a count of zero.

To-Do lifecycle events (`todo.created`, `todo.status_changed`, and the rest of that family) belong to `Plans/ToDo_Runtime.md` and are never emitted by this owner. Schedule and window events belong to `Plans/Scheduling_and_Quota_Resume.md`; this owner emits only `assistant_plan.schedule_invalidated` to record that its own version change invalidated a binding.

### Records and persistence boundary

This document owns the payload semantics of `pm.assistant_plan.record.v1`, `pm.assistant_plan.document_revision.v1`, `pm.assistant_plan.run.v1`, and `pm.assistant_plan.adherence.v1`. It consumes `pm.assistant_plan.deep_ledger_session.v1`, whose owner is `Plans/Planning_Ledger_System.md`, and `pm.assistant_plan.planunit_bundle.v1`, whose owner is `Plans/Plan_Document_System.md`.

`Plans/storage-plan.md` owns physical key encoding, seglog and index behavior, encryption, retention, replay, projector checkpoints, and transaction implementation for all six families. Canonical storage keys require central Storage and Contracts adjudication; this document does not invent registered bytes, and new storage writers stay disabled until that registration closes.

The companion typed artifacts `Plans/assistant_plan_runtime_contracts.schema.json` and `Plans/assistant_plan_runtime_contract_fixtures.json` are required and do not exist yet. Until an integrator creates and validates them, the command table in section 11 is a canonical owner declaration without static schema proof, and every listed command remains unregistered.

Recovery invariants that bind this owner: every asynchronous Start command is idempotent; a double-click cannot create two Plan builds or two schedules; restart restores the active Plan, its control state, its run, and its To-Do binding; a replayed result returns the original object and receipt IDs with no second side effect; projection delay renders as pending or reconciling rather than false failure; and a stale or missing record fails closed with an exact reason.

## 4. Integration Surfaces

### Planning Wizard handoff and NamedPlan promotion

`Send To Planning Wizard` is the only route from an Assistant Plan into the full planning, Plan Compile, and Orchestrator flow. It is always explicit, always user-initiated, and it bypasses PRD Builder because the Assistant Plan is itself the intake specification.

The handoff payload preserves Plan identity, `version`, `content_hash`, the structured document ref, the Rich and Markdown refs, `backend`, the Deep Plan ledger session ref and scoped PlanUnit bundle ref when present, attachments, research refs, recorded decisions, assumptions, constraints, unanswered questions, thread and source-message refs, project/repository/worktree context, and the selected Wizard start options.

After intake, `Plans/Planning_Wizard.md` owns everything downstream: the `PlanningRun`, topics, topic agents, audits, the Final Plan Pack, approval, `ApprovedPlanPack`, Plan Compile, and Orchestrator navigation. Assistant Plan Runtime records the `planning_wizard_handoff_id` and stops. It never inherits Wizard state and never mirrors Wizard progress as a Plan control state.

A small Assistant Plan is not automatically a `NamedPlan`. `named_plan_id` stays null until an explicit durable action — an explicit save/promotion, or a Planning Wizard handoff that the Wizard binds to a Named Plan — creates or links one. When such a link exists, the Assistant Plan ID and version remain a child or source ref of the `NamedPlan`; the `NamedPlan` does not own Assistant Plan runtime, does not force Orchestrator, and does not become a shell around every chat Plan. File and artifact details may show the related `NamedPlan` only when such a link genuinely exists.

## 5. Validation And Acceptance

### Verification

Structural tests validate the closed strategy enumeration and every rejected `workflow`/`strategy` combination; the immutable `assistant_plan_id`, `thread_id`, `project_id`, `strategy`, and `backend`; the one-current invariant under concurrent create requests; version increment, `parent_version` lineage, and approved-revision immutability; the absence of `superseded` from every enumeration; the four-label Build control with no fifth state; build freeze completeness; build idempotency including replayed keys and same-key/different-binding rejection; PlanUnit bundle validation failure blocking To-Do creation; adherence classification-to-result binding; exact-version schedule binding and revision invalidation; handoff payload completeness; the typed error enumeration; command-disabled behavior before catalog registration; event-disabled behavior before EventRecord registration; and the legacy thoroughness and `superseded` migration maps including ambiguous-value disclosure.

Negative tests assert zero effects that this owner must never produce: a regular Plan build creates no ledger session, no PlanUnit, no PlanUnit index entry, no NodeSeed, no WorkNode, no Plan Compile record, and no Orchestrator admission; a Deep Plan build creates no global plan index mutation, no `Plans/**` modification, no NodeSeed, no WorkNode, no Plan Compile entry, no Orchestrator admission, and no governance seal; no build of any strategy emits a `PlanCompile`, `NodeSeed`, `WorkNode`, or Orchestrator event; no direct document mutation path exists from any GUI surface; and no automatic `NamedPlan` is created for a chat Plan.

GUI and behavior tests cover the six-choice submenu content; Rich Text default and the Markdown toggle over one revision; the absence of an editable caret; the `Revise` composer target chrome and the resulting `V+1`; the same Plan identity and immutable prior version; the one-current cancellation flow; `Build → Building… → Completed` and `Build/Building… → Canceled`; `Building…` persistence during paused, quota-wait, and window-wait with truthful secondary reason; duplicate Build returning the original run; the always-open Crew modal and atomic Crew start; `Build At` binding disclosure and the `Schedule needs update` notice; the Wizard handoff route; Markdown and PDF export of the exact version with receipt and download; adherence minor-extension child To-Do creation; material-divergence pause with a Revise prompt; constraint-conflict block; and linear compact history with no `Superseded` label and no Plan picker.

Proof discipline is explicit and layered. Packet consistency proves only that registers agree. Canonical specification proves only that owner docs, PlanUnits, commands, wiring, and schemas agree. Concept behavior proves only that the concept surface responds and renders. Native runtime proof requires Rust, Slint, services, adapters, and persistence executing these contracts. A lower level never certifies a higher one, a fixture-backed concept success is never recorded as native proof, and static validation is not runtime registration, persistence, GUI, migration, event, wiring, or buildability proof.

## 6. Plan-To-Node Readiness

No WorkNodes, NodeSeeds, executable queues, runtime dispatch, or implementation files are authorized by this document. An Assistant Plan reaches Plan Compile and the Orchestrator only through an explicit `Send To Planning Wizard` handoff, after which `Plans/Planning_Wizard.md` and `Plans/Plan_To_Node_Compilation.md` own readiness under their own contracts. Scoped Deep Plan PlanUnits created after Build approval carry `create_worknodes: false` and are never admitted into the global product PlanUnit index. Every command in this document remains `handler_unavailable` until the central catalog, Event Authority, storage registration, and production wiring close.

## 7. Deferred, Retired, Compatibility, And Non-Goals

### Migration

Existing Assistant Plan fixtures migrate to `AssistantPlanRecord` only when they are genuinely thread-scoped. Project-level `NamedPlan` records are never migrated into Assistant Plans, and a migration that would collapse a durable cross-surface Plan into a chat Plan must quarantine instead.

Legacy thoroughness values map explicitly:

```text
Light         -> Quick
Balanced      -> Standard
Comprehensive -> Thorough           when the record is a regular Plan
Comprehensive -> Deep Exhaustive    only when prior context proves deep-plan intent
```

An ambiguous `Comprehensive` value requires a compatibility disclosure on the migrated record, not a silent semantic widening to a deep strategy.

Legacy `superseded` Assistant Plans map to `canceled` for user-facing history, with the migration reason retained in migration metadata. The word `superseded` never resurfaces as a user-visible status, badge, or relationship.

The retired `cmd.chat.plan_thoroughness` command and its `Light|Balanced|Comprehensive` option set are replaced by `cmd.chat.plan.strategy.set`. Legacy IDs remain compatibility aliases only where one-to-one semantics are provable; where they are not, the legacy row is retired rather than aliased. A census of existing command IDs precedes adding any row.

Retired Chain Wizard Multi-Pass and old BrainStorm child-goal records become source lineage for this runtime and the collaborative runtime. They are not reactivated, and their child-Goal authority is replaced by `CollaborativeRun` plus a simple Goal where appropriate.

Migration receipts record alias mapping, accepted and quarantined records, before/after hashes, disclosed ambiguity, and unresolved residual risk. Migration never reruns PRD approval, Planning Wizard, Plan Compile, Goal, provider, source-control, sync, or backup work.

### Closed edge cases

- An explicit new-Plan request while the current Plan is merely proposed cancels it and creates a new one in the same admitted operation.
- If the current Plan is `Building…`, cancellation is requested immediately and new-Plan creation waits for a safe stop boundary. There is never a moment with two current Plans.
- The Build control remains `Building…` during quota wait, window wait, and manual pause. The explanation is secondary copy.
- `Completed` and `Canceled` are non-actionable on the primary control; Details and Export remain available through their own controls.
- A revision after a scheduled build invalidates the schedule. There is no automatic schedule retarget.
- A revision while `Building…` requires stopping the current execution; approved source cannot mutate beneath admitted work.
- A regular Plan may use a Goal only when the user explicitly requests it, and the Goal never changes the backend to Deep Plan.
- The Planning Wizard handoff never routes through PRD Builder.
- An Assistant Plan links to a `NamedPlan` only through an explicit durable promotion or handoff.
- Deleting a message or a Plan cannot purge a shared artifact still referenced by another message, Plan, Goal, workflow, evidence record, or hold.
- A BrainStorm process card remains in the transcript after the linked Plan is created and continues to open its own transcript and panel.
- A hard-constraint violation disqualifies a BrainStorm proposal regardless of votes, and unresolved dissent stays visible in the synthesized Plan.
- Export delivers the exact bound version and hash; a later revision does not retroactively change a delivered export.

## 8. Source Lineage And Governance

This document was compiled from the approved Puppet Master Assistant redesign packet `pm-assistant-implementation-2026-09-02-recovered`, whose captured conversation decisions are the controlling authority, followed by `Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md` and then older `Plans/**`. Registration is recorded in `Plans/00-plans-index.md` under the 2026-09-03 entry and routed in `Plans/Crosswalk.md`. Its command rows live in `Plans/UI_Command_Catalog.md` and `Plans/Commands_System.md`, its production-intent wiring rows in `Plans/Wiring_Matrix.production.json`, and its settings in `Plans/settings_inventory.json`. Generated governance -- shards, evidence, the PlanUnit index, and Spec Lock -- is refreshed by its owner scripts after live owner documents stabilize and is never hand-edited to make a gate pass.

## Additive Correction v4 — Question Budget, Progress, Failure, Details, And Build As Goal (2026-09-03)

This section applies `PM_Assistant_v2_Additive_Correction_v4` to this owner. It is additive to
the implemented v2 branch: everything above remains in force except where a clause here
explicitly retires an earlier value. Where a number in this section disagrees with a number
earlier in this document, this section wins and the earlier value is retired, not aliased.

### QMAX-001..004 — The six question ceilings and the Grill Me extension

Question ceilings are per strategy, not per depth family. The factory values are:

```text
Plan   Quick                base  3    with Grill Me  28
Plan   Standard             base  6    with Grill Me  31
Plan   Thorough             base  8    with Grill Me  33
Deep   Thorough             base 10    with Grill Me  35
Deep   Exhaustive           base 15    with Grill Me  40
Deep   BrainStorm           base 20    with Grill Me  45
Grill Me extension          +25 (one value, applied to whichever strategy owns the run)
```

`effective_limit = base_limit + (grill_me_enabled ? grill_me_extension : 0)`. The six totals
above are derived, never stored as a second literal; a stored total that disagrees with the
arithmetic is a defect, not an override.

Retired by this section: the BrainStorm baseline of 15, the Grill Me extension of `+10`, the
implied `25` BrainStorm-with-Grill total, and the earlier statement that regular-strategy
ceilings exist only as unnamed Settings values. `Light`/`Balanced`/`Comprehensive` remain
retired as strategy names by section 7 and carry no budget of their own.

### QMAX-005..007 — What is counted, and when it is charged

The counted unit is one user-facing `QuestionItem` with a stable `question_item_id`. A
questionnaire card holding five items consumes five slots. A container render, a conversation
turn, a message, a round, a panel, a participant, and a retry consume nothing.

A `QuestionItem` is charged exactly once, at the moment its stable identity is **first durably
presented to the user**. Re-render, reconnect, host restart, provider retry, panel reopen,
thread switch, and scroll-back do not charge again, because the durable question record
already carries that identity. A model-proposed question that never reached the user is never
charged and is never persisted as asked.

### QMAX-006 — One counter per run, shared by every participant

Question admission for a Plan or Deep Plan run uses exactly one durable counter, keyed by the
planning run, not by participant, agent, specialist, pass, or card. BrainStorm participants,
the Wonderer role, and the Grill Me specialist read and write that one counter. The ceiling is
never multiplied by participant count and is never partitioned into per-agent pools.

`Plans/Planning_Ledger_System.md` owns the durable question record and its single-registry
guarantee. This document owns the arithmetic and the admission decision.

### QMAX-008 — Revisions keep the counter; a new Plan gets a new one

The counter's identity is the planning run for one `assistant_plan_id`, not the Plan version.
`V2` and `V3` revisions of the same Plan continue the same count. A genuinely new Plan identity
starts at zero. Plan version is never used as counter identity.

### QMAX-009..010 — Toggling Grill Me mid-run

Enabling Grill Me after questions have been asked raises `effective_limit` by the extension and
leaves `questions_asked` untouched; `questions_remaining` increases by exactly the extension.
No second Grill-only counter exists.

Disabling Grill Me during an allowed reconfiguration deletes no answers and lowers no count. If
`questions_asked` already exceeds `base_limit`, that is valid history, not corruption: no new
question is admitted, and the existing question and answer records remain intact and readable.

### QMAX-011..013 — Reuse, research, and stopping early

Before a question is admitted it is deduplicated against prior answers in the same thread and
against imported planning context. A semantically equivalent already-resolved question does not
consume a slot; it resolves from the existing answer and increments `reused_answer_count`.

A fact resolvable through admitted files, tools, repository inspection, or external research is
assigned as research work rather than asked. Research-resolved facts increment
`research_resolved_count` and never `questions_asked`.

The ceiling is a maximum, not a target. Planning stops asking as soon as sufficient decisions
exist, and a run that synthesises after two questions under a ceiling of twenty is correct
behaviour, not an under-run.

### QMAX-014..015 — Exhaustion is typed, and it does not fail the run

Attempting to admit a question when `questions_remaining` is zero returns typed
`question_budget_exhausted`. No extra `QuestionItem` is persisted, the planning run does not
fail, and synthesis continues.

Exhaustion preserves unresolved questions in the Plan document as visible open items. Build is
disabled **only** when an unresolved item carries an explicit `build_blocker: true`
classification. `questions_remaining == 0` on its own never disables Build.

### QMAX-016 — `PlanningQuestionBudgetProjection`

```text
pm.assistant_plan.question_budget_projection.v1
  workflow_id                the planning run this counter belongs to
  strategy                   quick|standard|thorough|deep_thorough|deep_exhaustive|brainstorm
  base_limit                 3|6|8|10|15|20 from Settings
  grill_me_enabled           boolean
  grill_me_extension         25 from Settings
  effective_limit            base_limit + (grill_me_enabled ? grill_me_extension : 0)
  questions_asked            durable charged count
  questions_remaining        max(0, effective_limit - questions_asked)
  reused_answer_count        resolved from prior answers instead of asked
  research_resolved_count    resolved by research instead of asked
  exhausted                  questions_remaining == 0
```

The projection is rebuilt from durable question records, never from the cards currently
visible. It survives restart and must equal the durable truth after one.

The policy record is `pm.assistant_plan.question_budget_policy.v2` and carries
`policy_version`, `plan_limits`, `deep_plan_limits`, and `grill_me_extension`.

### PPROG-001..003 — `PlanProgressProjection` and its sole projector

```text
pm.assistant_plan.progress_projection.v1
  project_id, thread_id, assistant_plan_id
  plan_version, plan_hash        the exact approved bytes this projection describes
  plan_run_id                    the run being observed
  projection_revision            monotonic per (plan, run)
  currentness_hash               inputs digest; a mismatch means stale
  generated_at
  step_states[]                  see PPROG-004
```

A projection is joined by these keys only. Title equality, list position, heading text, and
"the card that currently has focus" are never join keys.

`AssistantPlanProgressProjector` is the sole status authority. It derives every step state from
`ToDoController` state, admitted work records, Plan-step mappings, Plan adherence records, and —
for a Deep Plan only — scoped PlanUnits. Model prose cannot write canonical progress, and no
GUI-local progress engine may compute a competing status.

Plan steps carry stable `plan_step_id` values that are independent of heading text. Each step
maps to zero or more current To-Dos and, for Deep Plan only, to scoped PlanUnits. Renaming
display prose does not orphan a mapping.

### PPROG-004..008 — Step states and their derivation

Leaf step states are exactly `pending`, `in_progress`, `completed`, `blocked`, `skipped`. A
parent or aggregate step may additionally be `mixed`. There is no `verifying`, no `replanned`,
no `superseded`, and no fabricated percentage.

Several steps may be `in_progress` at once, and steps may complete out of display order when
dependencies allow. The projection reports that truth; it never collapses concurrency into one
active step for presentation.

`completed` on a step requires every required mapped leaf to be `completed` or explicitly and
validly `skipped`. One successful tool call never completes a step, and a parent is derived
rather than declared.

`blocked` applies only when required mapped work carries a genuine blocker, and the state
records the owning condition. Work that is merely waiting on a dependency stays `pending`.

Each step state may carry `todo_ids`, `planunit_ids`, `active_work_refs`, `evidence_refs`,
`deviation_kind`, and `updated_at`. Raw evidence is reachable from Details, never inlined into
the compact card.

### PPROG-009..011 — Rich Text, Markdown, and the compact summary

Rich Text renders a subtle status marker beside each step. It does not strike through, rewrite,
reorder, or re-wrap approved Plan prose, and a status change animates without changing one byte
of the document.

Markdown stays read-only and shows status in a separate gutter or adjacent rail keyed to stable
block IDs. No checkbox, no `[x]`, and no status word is injected into the Markdown serialisation;
Markdown export of a Plan under execution is byte-identical to the same version at rest.

The Plan card may show a compact To-Do completion summary. The Build control remains the sole
display of Build/Building…/Completed/Canceled, and once the current projection has arrived the
two never disagree. No second Plan lifecycle chip exists.

### PPROG-012..014 — Staleness, restart, and late events

When the projection is delayed or `currentness_hash` no longer matches its inputs, the surface
discloses `Updating progress…` or an explicit stale marker. Old data is never presented as
current, and a stale projection cannot enable a mutation control.

After restart the projector rebuilds from durable To-Dos, work bindings, Plan-step mappings,
scoped PlanUnits, and adherence records. A view cache is never the authority, and the
reconstructed projection must equal pre-restart durable truth.

A late work or To-Do event is rejected unless thread, Plan version and hash, PlanRun epoch,
To-Do revision, and work binding are all still current. Timestamp ordering alone never admits
an event.

### PPROG-015..016, CDRY-005 — Export separates the Plan from its execution

Plan document export contains the approved document only. Live execution state is never written
into it, and exporting never alters `plan_hash`.

An execution report is a separate versioned artifact
(`pm.assistant_plan.execution_report.v1`) carrying To-Dos, step states, deviations, evidence,
attempts, and a completion summary, keyed to the exact `plan_version`, `plan_hash`, and
`plan_run_id`, and stating its own currentness. It is never presented as the approved Plan.

Both use `cmd.chat.plan.export` with `content_kind: plan_document | execution_report` alongside
the existing format discriminator. No peer export command is minted.

### PPROG-017, PDET-001..003 — Details, and the two truthful backends

Plan Details show Plan identity, version and hash, backend, creation and revision sources,
source messages, attachments, research, exports, run history, and currentness, all through
shared route and artifact identities rather than a duplicated metadata copy.

A **Regular Plan** states `Direct planning` and `No ledger, no PlanUnits` explicitly. It never
claims a guardrail it did not use.

A **Deep Plan** additionally shows ledger summary and currentness, scoped PlanUnit count and
validation state, and the PlanUnit-to-To-Do mapping. Scoped PlanUnits remain hidden by default
and inspectable in Details; they never appear as To-Do items and never become an Activity
domain. A Deep Plan that fell back to direct planning discloses that fallback rather than
implying a ledger.

### PDET-004..008 — One document tree, immutable revisions, frozen embeds

Each Plan version is one immutable shared Runtime Artifact revision referenced by the thread.
Rich Text and Markdown resolve the same structured revision; there are never two independently
editable bodies.

The structured tree owns stable block and step IDs, and both projections are deterministic
round trips over typed blocks, code, tables, Mermaid, and artifact references. Direct user
editing is not available in either projection.

Assistant Plans stay thread-scoped. They are not written into the project automatically and are
not promoted to a `NamedPlan` unless the user explicitly promotes or hands off through the
Planning Wizard, which may then bind `named_plan_id`.

Deleting or hiding a thread card never purges a Plan artifact still referenced by a Wizard,
Goal, Crew, Review, Usage record, export, or another artifact. Retention follows shared
reachability and hold rules; card visibility is not deletion authority.

`PlanArtifactEmbed` (`pm.assistant_plan.artifact_embed.v1`) freezes `block_id`, `artifact_id`,
`artifact_version`, `renderer_kind`, `display`, `caption`, `text_summary`, `static_fallback_ref`,
and `source_ref` at approval. A later change to that artifact does not change an approved Plan,
and no embed resolves "latest" at render time.

### PDET-009..012 — Renderers, sandbox, PDF, and unavailability

Supported blocks are Mermaid, graphs, charts, images, diagrams, tables, code, checklists, video,
interactive artifacts, and any future registered renderer kind. Every one goes through the
shared artifact renderer; the Plan never carries a private per-type renderer.

Interactive content runs only in the shared sandbox with renderer capability and origin checked.
Markdown-embedded HTML is never treated as trusted application UI and arbitrary script is not
executed.

PDF export renders video and interactive blocks through their `static_fallback_ref` with the
caption and a stable artifact reference. PDF never silently drops a supported block and never
implies that interactivity survived.

A missing, stale, denied, or unsupported embed renders an explicit unavailable block naming the
reason, with Details and a repair or re-export route. Content is never omitted silently and one
artifact version is never substituted for another.

### PFAIL-001..002 — Four labels, and where trouble is told

The primary Build control has exactly four labels. While a Plan is unfinished it reads
`Building…` — including when the run is paused, waiting on an execution window, waiting on a
Usage reset, holding a failed attempt, requiring attention, or requiring recovery. Only final
success or cancellation changes the label, to `Completed` or `Canceled`. `Failed` is not a
fourth terminal label.

Nonterminal trouble is secondary truth beside the control: `Paused`, `Waiting for Usage`,
`Outside execution window`, `Needs attention`, `Build failed`, `Recovery required`. The exact
owner reason and the allowed actions are visible. A generic `Working` label that hides a failure
is prohibited.

```text
pm.assistant_plan.execution_attention_projection.v1
  plan_run_id, condition_kind, reason, allowed_action_ids, currentness_hash
```

### PFAIL-003..009 — Attempts, recovery, cancellation, completion, restart

A failed attempt never marks the Plan `Completed` and never silently starts a duplicate
`PlanRun`. Retry creates a new attempt under the current run unless owner policy explicitly
creates a new run, and completed side effects are not replayed.

Where recovery is possible, Resume and Retry use the existing recovery and currentness owners
and preserve Plan and To-Do identity; recovered work continues from durable state rather than
resetting the control to `Build`.

Where no safe recovery exists, the Plan stays unfinished at `Needs attention` until the user
cancels, revises after a safe stop, or resolves the owner condition. Completion is never
fabricated and the run is never auto-cancelled.

Cancel fences the active `PlanRun` and every attempt, sets the control to `Canceled`, and
prevents late callbacks and automatic resume. No post-cancel event changes status, and no quota
or window timer can resume it.

`Completed` requires the Plan completion predicate, the required To-Dos, admitted work, and —
when present — scoped PlanUnits all to be resolved. A provider's final response is a proposal,
never the completion.

Revising while `Building…` requires a safe stop or cancel boundary. Revise is disabled or routed
through "stop current work"; approved bytes never mutate under in-flight work and a Plan version
is never hot-swapped beneath a run.

Restart and reconnect restore `Building…` plus the exact secondary reason and allowed actions
from owner state. No transient false `Build` or `Completed` appears, and status is never
inferred from the last visible message.

### PFAIL-010, PSCHED-005 — Immediate build invalidates the pending schedule

Starting Build Now for a Plan version atomically invalidates any pending exact-version build
schedule for that same version before admitting the run, and the immediate build returns a
schedule-invalidation receipt. A later timer delivery for the invalidated schedule admits
nothing.

### PGOAL-001..002, MODAL-013..014, CDRY-004 — Build as Goal is exposed, and mints no command

`Build as Goal` appears in the Plan secondary/overflow action menu and is reachable by explicit
natural-language request. The primary control stays `Build`; no second large button is added.

It reuses `cmd.chat.plan.build` with `execution_topology: goal_driven`. `cmd.chat.plan.build_as_goal`
is not registered. `cmd.chat.plan.build_with_crew` keeps its specialised atomic contract and is
not decomposed into a collaboration start plus a separate build (`MODAL-013`):
`PlanRun` and `CrewRun` commit together or neither commits, so the two never race.
It freezes Plan version and hash at Start and refuses a Plan that changed while its
modal was open, sending the user back to reopen against the new version
(`MODAL-014`). `Plans/Collaborative_Workflows.md` owns the modal side of both.

### PGOAL-003..006 — Atomic binding, reuse, and what it must not create

Admission atomically creates or binds exactly one simple Goal, one `PlanRun`, and one
`GoalPlanBinding` for the exact `assistant_plan_id`, `plan_version`, and `plan_hash`. All three
records commit or none do; an active Goal without its `PlanRun`, or the reverse, is a defect.

```text
pm.goal.plan_binding.v1
  goal_id, assistant_plan_id, plan_version, plan_hash, plan_run_id,
  todo_list_ref, planunit_bundle_ref
```

`todo_list_ref` and `planunit_bundle_ref` reference the existing thread To-Do list and the
existing Deep Plan scoped PlanUnit bundle by identity. Neither is duplicated, and identity
equality is the proof of reuse.

The Goal objective refers to completing the exact approved Plan version. The Plan is bound as
hidden lineage, not copied into the objective and not decomposed into Goal phases.

Goal-driven Plan execution does not enter the Orchestrator and creates no phases, tranches,
child Goals, or Goal-specific budgets. It uses the same simple host continuation as every other
internal Goal.

### PGOAL-007..010 — Lifecycle coupling and conflict

Goal `Pause`/`Resume` control the bound `PlanRun` at shared safe boundaries. The Plan control
stays `Building…` and the pause state and reason appear as secondary truth; the control never
returns to `Build`.

Goal `Cancel` stops the bound run, sets the Plan control to `Canceled`, invalidates
run-specific schedules and quota consent, and fences callbacks. Unrelated scheduled messages in
the same thread are untouched, and no window or reset resumes the cancelled work.

Successful Plan completion completes the bound Goal exactly once and records the completion
lineage. Replay of the completion effect is idempotent.

Editing a Goal never edits the approved Plan. A material Goal/Plan conflict stops new mutation
admission and returns the Plan to `Revise` after a safe stop, showing the conflict rather than
silently conforming either object to the other.

### PGOAL-011..015 — Preconditions, idempotency, scope, and links

Before commit, Build as Goal validates the current Plan version and hash, project and worktree,
permissions, provider route, and the absence of an existing active run for that Plan. Stale or
duplicate requests fail closed; the binding is never made from current UI focus.

Repeated clicks or network retries carrying the same idempotency binding return the original
Goal and `PlanRun` result. Exactly one Goal and one run exist afterwards.

Build as Goal is available for both Regular and Deep Plans without changing either planning
backend: a Regular Plan stays no-ledger and no-PlanUnits, and a Deep Plan retains its scoped
ones. Choosing a Goal never upgrades a Regular Plan into a Deep Plan.

Goal Activity links to the bound Plan and Plan Details links back to the Goal, both through
route and open identities. No Goal thread card is created and the objective text is not
duplicated as a Plan card section.

A **scheduled** goal-driven build freezes `execution_topology: goal_driven` at schedule commit
and creates the Goal only when the scheduled dispatch is admitted. While only a future schedule
exists, no active Goal exists.

### PART-015, WONV-005 — Unresolved decisions inside the Plan

A material choice left unresolved by a collaborative run is recorded in the Plan as an explicit
disagreement or open decision. Build is disabled only when that choice carries
`build_blocker: true`. Non-blocking dissent stays visible and does not block the Plan.

A Wonderer lead reaches the Plan only after it has been researched, decided by the user, or
explicitly retained as an unresolved hypothesis. An accepted factual or architectural claim
cites its convergent evidence path; fertility alone is never promoted to truth.

### PPROG-018, CDRY-002 — Progress has no mutation command

Progress projection changes are owner events and internal projector updates. No user command and
no model tool sets Plan progress; `cmd.chat.plan.progress.set` is not registered, and the
internal recompute is `internal.plan_progress.recompute`.

## Working Notebook Plan Identity Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Fresh context-window continuation never changes approved Plan identity: a reconstructed window rebinds the exact `assistant_plan_id`, `plan_version`, and `approved_hash` that were current, from owner state — never from a note, capsule, or summary. Notebook research may assist ongoing planning work, but notes cannot substitute for accepted planning atoms, required Deep Plan ledger turn commits, or Build approval, and a regular Plan never implicitly acquires a Deep Plan ledger session because a notebook referenced one.

```yaml
plan_unit_id: APR-013
unit_type: requirement
status: accepted
owner_doc: Plans/Assistant_Plan_Runtime.md
canonical_text: A fresh context window rebinds the exact approved plan_id, plan_version, and content hash from owner state; notes and capsules cannot select a different approved Plan revision. Notebook content never substitutes for accepted planning atoms, required ledger turn commits, or Build approval, and a regular Plan never implicitly gains a Deep Plan ledger session through a notebook reference.
gui_related: false
gui_classification_reason: Plan identity binding is runtime behavior, not GUI work.
depends_on: [APR-012, PP-087]
unblocks: []
acceptance_criteria:
  - A new window cannot select a different approved Plan revision than owner state holds.
  - Regular Plan does not acquire a Deep Plan ledger implicitly.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: plan_identity_drift
reasoning_tier: high
context_scope: plan_runtime
implementation_surfaces: [Plans/Assistant_Plan_Runtime.md, Plans/Prompt_Pipeline.md, Plans/Planning_Ledger_System.md]
node_compile_hint: {mode: runtime_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I04
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A42
preserved_exact_tokens: ["approved_version", "approved_hash", "exact current Plan revision"]
negative_constraints:
  - Do not rebind Plan identity from notebook or capsule content.
owner_hints: [Plans/Assistant_Plan_Runtime.md, Plans/Prompt_Pipeline.md]
```

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Planning_Ledger_System.md
