# Planning Wizard

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. This document is compiled from bootstrap ledger `pldg-20260618-001-prd-planning-wizard`; the ledger remains source-lineage memory, while this live Plan doc is canonical after compilation.

> **PlanProfile:** New Plan Authoring Profile

## 0. Scope

Planning Wizard is the finished-product planning workspace that consumes an Approved PRD Pack, normalized requirements input, or structured Assistant Chat seed and turns it into implementation-ready Plans, a Final Plan Pack, and an ApprovedPlanPack suitable for Plan Compile after explicit `Approve And Build` approval.


## 1. Ownership And Consumers

Planning Wizard owns PlanningRun, topic graph, topic agents, topic-scoped ledger work, Planning Context Capsules, topic conversion and audits, final integration, Planning Amendments, compile readiness, ApprovedPlanPack authority, Planning Wizard GUI states, and the Approve And Build transition. It consumes PRD Builder, Assistant Chat, Goal Runtime, Plan Document System, Plan To Node Compilation, Automated Testing, Executor, Contracts, source-control, permissions, Final GUI, Orchestrator, and HITL contracts without owning low-level runtime execution after Executor activation.

Planning Wizard may self-initiate web/search/fetch/extract/research/deep-research/crawl/map (`websearch`, `webfetch`, `webextract`, `webresearch`, `webcrawl`, `webmap`) and Site Reader/browser evidence through the shared PM WebOperation/BrowserAction dispatcher when current external facts, docs, issues, PRs, URLs, visual/dynamic pages, project context, comparative research, or source authority materially changes planning. The resulting read receipts, extract receipts, citations, browser artifacts, source-selection reasons, research closure states, and failure states are planning evidence only until explicit approval; they may flow into Planning Context Capsules, topic ledgers, topic plans, audit findings, Final Plan Pack source refs, and ApprovedPlanPack lineage, but they do not create WorkNodes, NodeSeeds, executable queues, runtime code, implementation files, production build tasks, or Plan Compile authority by themselves. Retired Chain Wizard wording remains compatibility/search lineage only and does not become a dependency or product term.


## 2. Canonical PlanUnits


### PWIZ-001 - Planning Wizard Naming, Inputs, And Handoff Seeds


```yaml
plan_unit_id: PWIZ-001
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'The canonical product name is Planning Wizard; Chain Wizard and Plan Wizard are stale names that must be retired from active product prose, UI, commands, events, and contracts. Planning Wizard accepts exactly three canonical input seed families before topic work begins: ApprovedPRDPack, normalized_requirements_pack, or assistant_chat_handoff_seed. Each seed preserves source identity, version, hashes, warnings, amendments, lineage, project context, and bounded work_intent axes; multiple compatible intents such as feature work plus release PR delivery may overlap in one PlanningRun without collapsing project context into a single lossy mode enum. Send to Planning Wizard creates a structured seed containing goal, scope, project, requirements, assumptions, open questions, source message references, artifacts, repository context, and suggested mode rather than copying an unbounded transcript. When Assistant Chat already contains sufficient planning-intake intent, the handoff may construct a traceable seed or draft PRD Pack and begin Planning Wizard intake without forcing the user through repeated PRD Builder questions.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
- Canonical input seeds preserve identity, version/hash, warnings, lineage, project context, and multiple compatible work_intent axes.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Plans/00-plans-index.md
- Plans/Contracts_V0.md
- Plans/assistant-chat-design.md
- Plans/PRD_Builder.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0002
- pldg-20260618-001-prd-planning-wizard:atom-0039
- pldg-20260618-001-prd-planning-wizard:atom-0040
- pldg-20260618-001-prd-planning-wizard:atom-0041
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/01-naming-and-boundaries.md#SRC-NAMING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
source_atom_ids:
- atom-0002
- atom-0039
- atom-0040
- atom-0041
decision_refs:
- dec-0001
correction_refs:
- corr-0002
preserved_exact_tokens:
- Planning Wizard
- Chain Wizard
- Plan Wizard
- Approved PRD Pack
- ApprovedPRDPack
- normalized_requirements_pack
- Assistant Chat handoff seed
- assistant_chat_handoff_seed
- Send to Planning Wizard
- structured seed
- fast-path
negative_constraints:
- Do not use Chain Wizard or Plan Wizard as current terminology.
- Do not use the raw Assistant Chat transcript as the sole Planning Wizard handoff.
- Do not sacrifice provenance, quality warnings, or readiness validation to avoid repetition.
- Do not collapse overlapping compatible work intents or project context into a single lossy mode enum.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Plans/00-plans-index.md
- Plans/Contracts_V0.md
- Plans/assistant-chat-design.md
- Plans/PRD_Builder.md
```

## GUI approval and Plan Compile launch repair addendum (2026-07-02)

This addendum closes the Approve And Build defects from the PMConcept readiness report. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

The production final-review control dispatches `cmd.planning_wizard.approve_and_build`. The command payload carries the exact final-review CAS/currentness values shown to the user: `project_id`, `planning_run_id`, PlanningRun revision, topic map version, `approved_plan_pack_id`, pack version/hash, project-context snapshot hash, PlanUnit index hash, acceptance-unit index hash, testing policy hash, final audit/closure hash, approval actor, and deterministic idempotency key.

Approval fails closed when any planning state, source pack, project context, topic readiness, audit closure, testing policy, Plan index input, or displayed final-review CAS input changed after the user reviewed it. A stale failure routes to bounded revalidation or final-review refresh; it must not silently approve a different plan.

Successful approval atomically writes `approval_cas_receipt`, publishes `PlanApproved`, creates or binds exactly one `PlanCompileRun`, and returns the durable `plan_compile_run_id` synchronously. Projection reconciliation may show a pending launch shell in Orchestrator Plan Compile, but run identity itself may not be left to eventual projection. Duplicate delivery with the same CAS inputs and idempotency key returns the same `PlanCompileRun`.

Planning Wizard and PlanApproved records consume `execution_unit_context` only through the Executor-owned contract in `Plans/Executor_Protocol.md` and `Plans/execution_unit_context.schema.json`. They must not define a local context field list, must not persist an embedded context payload without `schema_version`, and must not store secrets, tokens, passwords, credentials, API keys, provider auth values, or local machine secrets in the context payload.

Persisted Planning Wizard approval, PlanApproved, and final-review events consume the canonical EventRecord envelope in `Plans/Contracts_V0.md#EventRecord` and `Plans/event_record.schema.json`. Planning Wizard owns approval behavior and CAS/idempotency semantics, but it must not copy the EventRecord field set or treat the EventRecord schema as permission to emit PlanCompile runtime artifacts.

The Planning Wizard and PMConcept concept surface must not expose `START`, `BUILD`, `Start Chain`, or `Approve & Continue` as ordinary build-launch controls. `Approve And Build` is the only ordinary final planning approval-to-PlanCompileRun launch authority; later controls are post-approval Plan Compile or runtime controls with scoped commands, disabled reasons, receipt effects, and stale-projection behavior.


### PWIZ-002 - PlanningRun Aggregate, Thread Topology, Context, And Intent Axes


```yaml
plan_unit_id: PWIZ-002
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'Each planning topic, integration pass, and attached audit/repair activity is a bounded child thread grouped by planning_run_id and thread_group_id under one collapsible Planning Run parent. PlanningRun owns source pack identity, project and work-intent context, thread group, global planning ledger, dynamic topic map, topic threads, topic plan drafts, amendments, invalidations, audit cycles, final plan pack, status, hashes, and handoff events. Planning Wizard classifies project context independently from work intent so overlapping cases such as an existing Git repository plus feature work plus PR delivery are represented without a misleading single mode enum. Project context supports greenfield, existing local project, existing Git repository, remote SSH project, and fork or external upstream contexts, with explicit repository and host facts. Work intent supports new product, feature or enhancement, refactor or rewrite,
  bugfix or bounded task, and contribution PR, and may include more than one compatible delivery intent.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/FileSafe.md
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0009
- pldg-20260618-001-prd-planning-wizard:atom-0042
- pldg-20260618-001-prd-planning-wizard:atom-0043
- pldg-20260618-001-prd-planning-wizard:atom-0044
- pldg-20260618-001-prd-planning-wizard:atom-0045
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/08-gui-threads-and-navigation.md#SRC-GUI
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/04-project-context-and-source-control.md#SRC-PROJECT
source_atom_ids:
- atom-0009
- atom-0042
- atom-0043
- atom-0044
- atom-0045
decision_refs:
- dec-0003
- dec-0010
correction_refs:
- corr-0005
preserved_exact_tokens:
- planning_run_id
- thread_group_id
- collapsible
- PlanningRun
- topic map
- project context
- work intent
- greenfield
- existing local project
- existing Git repository
- remote SSH
- fork or external upstream
- new product
- feature or enhancement
- refactor or rewrite
- bugfix
- contribution PR
negative_constraints:
- Do not use one unbounded transcript for the entire Planning Wizard.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/FileSafe.md
- Plans/GitHub_Integration.md
```


### PWIZ-003 - Dynamic Topic Graph And Topic Operations


```yaml
plan_unit_id: PWIZ-003
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'Planning Wizard derives an initial topic graph from the input pack, project/repository context, work intent, risk, and known defaults rather than enforcing a fixed list of sections. Possible topics include overview, product behavior, GUI or UX, backend, data, integrations, security, permissions, testing, deployment, migration, observability, and risks, but actual titles and scope are evidence-driven. The controller can add, split, merge, rename, defer, reopen, reorder, and mark topics impacted, recording the reason, source refs, dependencies, user-visible origin, and resulting invalidations. The GUI suggests a next topic and conversational sequence while the underlying topic map preserves dependencies and allows safe navigation, reopening, and parallel background work. Topic dependency gating derives a locked presentation for topics whose dependency topics are not yet resolved: a not_started topic with unmet depends_on topics is blocked from open and conversion, shows a visible gating affordance naming its unmet dependencies (Unlocks after the named dependency topics are Ready), remains view-only while locked, and unlocks in cascade as its dependencies become Ready.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Plans/Contracts_V0.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0046
- pldg-20260618-001-prd-planning-wizard:atom-0047
- pldg-20260618-001-prd-planning-wizard:atom-0048
- pldg-20260618-001-prd-planning-wizard:atom-0049
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
source_atom_ids:
- atom-0046
- atom-0047
- atom-0048
- atom-0049
decision_refs:
- dec-0010
correction_refs: []
preserved_exact_tokens:
- dynamic topic map
- topic graph
- GUI / UX
- Security
- Testing
- add_topic
- split_topic
- merge_topics
- mark_topic_impacted
- suggested order
- dependency graph
negative_constraints:
- Do not hardcode one universal topic taxonomy for all projects.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Plans/Contracts_V0.md
```


### PWIZ-004 - Topic Agents, Context Capsules, Questions, And Safe Autonomy


```yaml
plan_unit_id: PWIZ-004
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'Every substantive Planning Wizard exchange must append an event and update topic-scoped planning atoms plus any affected global decisions, constraints, dependencies, invalidations, amendments, questions, and handoff state before the turn is complete. Each topic agent receives a bounded Planning Context Capsule containing approved PRD summary, project context, global decisions and constraints, glossary, relevant prior topic-plan summaries, dependencies, assumptions, questions, and artifact references. Each topic conversation is handled by a fresh topic agent with a bounded thread, topic brief, Context Capsule, relevant sources, and topic-scoped write card. Each topic agent asks gap-driven questions relevant to its active topic and implementation-readiness risks, using known answers and defaults so it does not drift into unrelated domains. Planning Wizard proactively resolves behavior, state, data, identity, permissions,
  failure modes, edge cases, integration constraints, acceptance evidence, currentness, idempotency, migration, operations, and implementation boundaries. The controller answers auto-resolvable gaps from evidence, applies safe defaults with recorded assumptions, and defers downstream-only details; it asks the user only for genuine product direction, risk acceptance, destructive authority, credentials, legal policy, or irreconcilable ambiguity.'
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/Planning_Ledger_System.md
- Plans/assistant-chat-design.md
- Plans/Goal_Runtime_System.md
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0011
- pldg-20260618-001-prd-planning-wizard:atom-0016
- pldg-20260618-001-prd-planning-wizard:atom-0050
- pldg-20260618-001-prd-planning-wizard:atom-0051
- pldg-20260618-001-prd-planning-wizard:atom-0052
- pldg-20260618-001-prd-planning-wizard:atom-0053
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
source_atom_ids:
- atom-0011
- atom-0016
- atom-0050
- atom-0051
- atom-0052
- atom-0053
decision_refs:
- dec-0004
- dec-0011
correction_refs:
- corr-0004
- corr-0006
preserved_exact_tokens:
- after every substantive turn
- topic_id
- global planning state
- Planning Context Capsule
- fresh topic agent
- bounded thread
- topic-relevant
- gap-driven
- behavior
- state
- failure modes
- idempotency
- safe defaults
- minimal HITL
negative_constraints:
- Do not advance a topic from chat state that has not been durably synchronized.
- Do not inject all prior raw chat histories and complete raw ledgers into every topic agent by default.
- Do not ask generic questions that do not materially affect the active topic.
- Do not convert ordinary planning uncertainty into a Needs user decision blocker.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/Planning_Ledger_System.md
- Plans/assistant-chat-design.md
- Plans/Goal_Runtime_System.md
- Plans/human-in-the-loop.md
```


### PWIZ-005 - Topic Ledger, Invalidation, Amendments, And PRD Immutability


```yaml
plan_unit_id: PWIZ-005
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'Topic agents write topic_id-scoped records into one Planning Run ledger plus global records for cross-topic decisions and constraints, avoiding independent ledgers that can silently disagree. A later decision that changes a prior topic''s assumptions or outputs marks affected topic drafts stale_due_to_dependency_change, stale_due_to_new_scope, or requires_recompile/requires_reaudit and propagates impact through typed topic dependencies. New information during planning becomes a planning clarification, immutable Planning Amendment, out_of_current_approved_scope item, or PRD revision request according to materiality and impact. Approved PRD Packs remain immutable; Planning Wizard records amendments or requests a successor PRD rather than editing the approved source snapshot in place.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: stale_or_forbidden_behavior
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/Planning_Ledger_System.md
- Plans/Contracts_V0.md
- Plans/FinalGUISpec.md
- Plans/PRD_Builder.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0054
- pldg-20260618-001-prd-planning-wizard:atom-0055
- pldg-20260618-001-prd-planning-wizard:atom-0056
- pldg-20260618-001-prd-planning-wizard:atom-0057
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
source_atom_ids:
- atom-0054
- atom-0055
- atom-0056
- atom-0057
decision_refs:
- dec-0011
- dec-0013
correction_refs: []
preserved_exact_tokens:
- topic_id
- global records
- stale_due_to_dependency_change
- requires_recompile
- requires_reaudit
- Planning Amendment
- PRD revision request
- immutable Approved PRD Pack
negative_constraints:
- Do not create disconnected authoritative ledgers per topic.
- Do not leave a topic marked Ready after a material dependency change.
- Do not silently rewrite approved PRD input from Planning Wizard.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/Planning_Ledger_System.md
- Plans/Contracts_V0.md
- Plans/FinalGUISpec.md
- Plans/PRD_Builder.md
```


### PWIZ-006 - Topic Conversion, Audit, Ready State, And Checkpoints


```yaml
plan_unit_id: PWIZ-006
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'At topic closure, a separate Overseer conversion agent transforms accepted topic ledger records into a versioned Topic Plan Draft or PlanUnit candidates with exact source lineage, assumptions, open non-blocking items, and cross-topic impacts. Per-topic conversion provides readable, audited planning outputs for subsequent agents and user progress, while a later global integration pass remains mandatory. A new Auditor agent checks ledger-to-plan fidelity, unsupported claims, exact tokens, negative constraints, acceptance, dependencies, images, and open items; a separate repair agent fixes findings and a new Auditor rechecks until pass or a typed blocker. A topic becomes Ready after successful conversion and audit; users may review or reopen any topic, but ordinary flow does not require a user confirmation after every topic. Security, data destruction, billing, migration, legal/compliance, irreversible external effects,
  or similarly high-risk decisions may require explicit user confirmation under HITL policy.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: stale_or_forbidden_behavior
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/Plan_Document_System.md
- Plans/Goal_Runtime_System.md
- Plans/FinalGUISpec.md
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0058
- pldg-20260618-001-prd-planning-wizard:atom-0059
- pldg-20260618-001-prd-planning-wizard:atom-0060
- pldg-20260618-001-prd-planning-wizard:atom-0061
- pldg-20260618-001-prd-planning-wizard:atom-0062
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
source_atom_ids:
- atom-0058
- atom-0059
- atom-0060
- atom-0061
- atom-0062
decision_refs:
- dec-0012
correction_refs: []
preserved_exact_tokens:
- Topic Plan Draft
- topic closure
- Overseer
- per-topic conversion
- audit
- repair
- re-audit
- Ready
- high-risk checkpoint
negative_constraints:
- Do not require later topic agents to interpret every prior raw ledger before continuing.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/Plan_Document_System.md
- Plans/Goal_Runtime_System.md
- Plans/FinalGUISpec.md
- Plans/human-in-the-loop.md
```


### PWIZ-007 - Final Integration, Plan Review, And Visual References


```yaml
plan_unit_id: PWIZ-007
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'After required topics are Ready, a fresh Overseer agent reconciles topic drafts into a coherent Final Plan Pack, resolves duplicates and owner boundaries, and computes cross-topic dependencies, consistency, and compile readiness. Final planning review uses the shared live document preview, selection context menu, comments, source inspection, challenge, targeted revision, and annotation status system used by PRD Builder. Plan review also provides a per-topic live Topic Plan Draft preview scoped to the selected topic, with an expand overlay and selection-driven annotate, comment, and send-back actions that reuse the PRD Builder annotation status system at topic granularity; a topic-scope send-back injects a revision request into that topic''s embedded Assistant Chat instance, runs a bounded revision micro-track, and bumps the Topic Plan Draft version, while a PRD-scope send-back always records a durable revision request note in the ledger-backed projection. Planning topics may accept uploaded reference images and generate wireframes, architecture diagrams, data-flow diagrams, state diagrams, or visual references through the existing image system, with artifact IDs, provenance, topic links, version, and status. Images are supporting references; any requirement, decision, constraint, flow, or acceptance implication introduced by an image must also be written into the planning ledger and canonical Plan text.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: [F3-146, F3-322]
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/Plan_Document_System.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0063
- pldg-20260618-001-prd-planning-wizard:atom-0064
- pldg-20260618-001-prd-planning-wizard:atom-0065
- pldg-20260618-001-prd-planning-wizard:atom-0066
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
source_atom_ids:
- atom-0063
- atom-0064
- atom-0065
- atom-0066
decision_refs:
- dec-0012
correction_refs: []
preserved_exact_tokens:
- Final Plan Pack
- cross-topic integration
- live document preview
- selection context menu
- uploaded reference image
- generated reference image
- supporting reference
- text remains canonical
negative_constraints:
- Do not leave a material requirement only inside an image.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/Plan_Document_System.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Project_Output_Artifacts.md
```


### PWIZ-008 - Project Context, Discovery, Setup Authority, And Currentness


```yaml
plan_unit_id: PWIZ-008
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'After the user selects or provides a project, Planning Wizard may automatically inspect local or remote paths, repository presence, current branch, remotes, status, file tree, package managers, frameworks, configuration, architecture signals, and test commands without mutation. Planning intake can attach an existing local directory, Git repository, optional GitHub repository, or remote SSH host and project root, recording host, path, repository identity, currentness, and permissions. Clone, fork, repository creation, git init, remote changes, branch checkout or creation, worktree creation, commit, push, PR creation, stash, discard, reset, and protected-branch operations require the applicable permission policy and durable receipts. Planning Wizard records repository context and may perform explicitly authorized project setup, but implementation worktree allocation, mutation preparation, and execution safe points belong to Executor
  provisioning after Plan Compile. For greenfield work, Planning Wizard can create a directory, initialize Git, select an initial branch, create an empty or baseline initialization commit, and optionally connect or create a GitHub repository when explicitly authorized. For an SSH project, discovery, FileSafe, Git, worktrees, commands, testing, path authority, safe points, and execution occur on the remote host through the authorized adapter, with no silent local fallback. Contribution PR mode records upstream and fork identities, base and head branches, contribution policy, compatibility expectations, required checks, commit policy, and optional PR delivery without conflating those with implementation truth. The Approved Plan Pack carries a hash-addressed project-context snapshot containing repository identity, host, path, branch, remotes, dirty state, codebase scan facts, test-capability facts, and currentness conditions.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/FileSafe.md
- Plans/WorktreeGitImprovement.md
- Plans/GitHub_Integration.md
- Plans/Permissions_System.md
- Plans/Executor_Protocol.md
- Plans/Contracts_V0.md
- Plans/Plan_To_Node_Compilation.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0067
- pldg-20260618-001-prd-planning-wizard:atom-0068
- pldg-20260618-001-prd-planning-wizard:atom-0070
- pldg-20260618-001-prd-planning-wizard:atom-0071
- pldg-20260618-001-prd-planning-wizard:atom-0072
- pldg-20260618-001-prd-planning-wizard:atom-0075
- pldg-20260618-001-prd-planning-wizard:atom-0076
- pldg-20260618-001-prd-planning-wizard:atom-0077
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/04-project-context-and-source-control.md#SRC-PROJECT
source_atom_ids:
- atom-0067
- atom-0068
- atom-0070
- atom-0071
- atom-0072
- atom-0075
- atom-0076
- atom-0077
decision_refs:
- dec-0014
- dec-0015
correction_refs: []
preserved_exact_tokens:
- read-only project discovery
- git status
- current branch
- local path
- Git repository
- GitHub
- SSH
- authority
- receipt
- git init
- push
- PR creation
- Executor provisioning
- implementation worktree
- greenfield
- baseline initialization commit
- remote host
- no silent local fallback
- upstream
- fork
- base branch
- head branch
- PR
- project-context snapshot
- currentness
negative_constraints:
- Do not create implementation worktrees or execution safe points as an implicit Planning Wizard side effect.
- Do not run against an unrelated local copy when remote context is active.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/FileSafe.md
- Plans/WorktreeGitImprovement.md
- Plans/GitHub_Integration.md
- Plans/Permissions_System.md
- Plans/Executor_Protocol.md
- Plans/Contracts_V0.md
- Plans/Plan_To_Node_Compilation.md
```


### PWIZ-009 - Testing Topic Boundary


```yaml
plan_unit_id: PWIZ-009
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'The Planning Wizard Testing topic asks about existing commands, frameworks, required environments, credentials or services, evidence expectations, exclusions, risk areas, accessibility, performance, security, and manual validation needs, then passes them to the automated testing system.'
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0099
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
source_atom_ids:
- atom-0099
decision_refs: []
correction_refs: []
preserved_exact_tokens:
- Testing topic
- evidence expectations
negative_constraints:
- Do not let topic chat replace Test Capability Discovery or the automated test planner.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/Automated_Testing_System.md
```


### PWIZ-010 - Approve And Build And ApprovedPlanPack Authority


```yaml
plan_unit_id: PWIZ-010
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'The Planning Wizard final approval button and command label is exactly Approve And Build. Approve And Build creates a versioned immutable ApprovedPlanPack containing canonical Plan docs, PlanUnit and acceptance-unit snapshots and hashes, source PRD Pack, project-context snapshot, amendments, policies, testing requirements, audit evidence, closure records, readiness report, and planning-ledger lineage references. The ApprovedPlanPack and frozen canonical PlanUnit and acceptance-unit indexes are Plan Compile authority; the Planning Wizard ledger remains source and reasoning lineage rather than executable canon. In the finished-product native runtime contract, ordinary Approve And Build flow immediately creates or resumes exactly one PlanCompileRun and proceeds without a second Start Build confirmation; optional HITL checkpoints are policy exceptions, not the default. Planning Wizard consumes execution_unit_context only through the Executor-owned Plans/Executor_Protocol.md and Plans/execution_unit_context.schema.json contract. During the current bootstrap ledger-to-Plans lane, this remains a product contract and does not launch PlanCompile. After Approve And Build succeeds locally, the application automatically switches to the Orchestrator
  page and opens the Plan Compile tab so the user sees launch reconciliation and compilation starting.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- Planning Wizard references the Executor-owned execution_unit_context schema instead of redefining context fields.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Contracts_V0.md
- Plans/Project_Output_Artifacts.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/execution_unit_context.schema.json
- Plans/Planning_Ledger_System.md
- Plans/Goal_Runtime_System.md
- Plans/Orchestrator_Page.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0101
- pldg-20260618-001-prd-planning-wizard:atom-0102
- pldg-20260618-001-prd-planning-wizard:atom-0103
- pldg-20260618-001-prd-planning-wizard:atom-0106
- pldg-20260618-001-prd-planning-wizard:atom-0107
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
source_atom_ids:
- atom-0101
- atom-0102
- atom-0103
- atom-0106
- atom-0107
decision_refs:
- dec-0020
- dec-0021
correction_refs:
- corr-0011
- corr-0012
preserved_exact_tokens:
- Approve And Build
- ApprovedPlanPack
- immutable
- PlanUnit index
- acceptance-unit index
- lineage
- automatic_after_approval
- PlanCompileRun
- execution_unit_context
- schema_version
- Orchestrator
- Plan Compile tab
negative_constraints:
- Do not treat mutable planning-ledger projections as the sole Plan Compile authority.
- Do not require a redundant ordinary Start Build confirmation after Approve And Build.
- Do not redefine execution_unit_context required fields, optional fields, enum values, or nullability in Planning Wizard or PlanApproved payloads.
- Do not persist execution_unit_context payloads without schema_version or with secrets, tokens, passwords, credentials, API keys, provider auth values, or local machine secrets.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Contracts_V0.md
- Plans/Project_Output_Artifacts.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/execution_unit_context.schema.json
- Plans/Planning_Ledger_System.md
- Plans/Goal_Runtime_System.md
- Plans/Orchestrator_Page.md
```


### PWIZ-014 - Approve And Build CAS, Currentness, And Approval Transaction Boundary


```yaml
plan_unit_id: PWIZ-014
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'Approve And Build is a compare-and-swap approval transaction over the exact PlanningRun revision, topic map version, ApprovedPlanPack identity, pack version, pack hash, project-context snapshot hash, PlanUnit index hash, acceptance-unit index hash, testing policy hash, and final audit/closure hash that were displayed in the final review. The approval command must carry those currentness inputs and fail closed when any planning state, source pack, project context, topic readiness, audit closure, testing policy, or Plan index input changes between final review and approval. A successful transaction atomically writes approval_cas_receipt, PlanApproved, and PlanCompileRun_created_or_bound, and returns the PlanCompileRun identity synchronously; projection reconciliation may lag, but run identity may not. PlanApproved and approval receipts consume any execution_unit_context payload through the Executor-owned schema and must preserve schema_version when embedding that packet. Duplicate delivery with the same CAS inputs and idempotency key returns the same PlanCompileRun. A stale CAS input routes to bounded revalidation or final-review refresh rather than silently approving a different plan.'
gui_related: true
gui_classification_reason: Approve And Build is a user-visible approval command and launch transition, while the CAS/currentness boundary is runtime contract behavior.
depends_on: [PWIZ-010, PWIZ-012]
unblocks: []
acceptance_criteria:
- The final review shows the exact pack, PlanningRun revision, topic map version, project-context hash, PlanUnit and acceptance-unit index hashes, testing policy hash, and final audit/closure hash used by approval.
- Approve And Build fails closed when any displayed approval input changes before the approval commit.
- Approval writes an approval CAS receipt and synchronously creates or binds exactly one PlanCompileRun identity.
- "`cmd.planning_wizard.approve_and_build` exposes projected availability, disabled reason, UICommandResponse, approval receipt, and canonical PlanApproved/PlanCompileRun-created-or-bound effects without emitting fabricated command_applied events."
- Embedded execution_unit_context payloads, if present, carry schema_version and follow the Executor-owned schema.
- Duplicate approval delivery with the same idempotency key and CAS inputs returns the existing PlanCompileRun.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
risk_class: stale_approval_build_race
reasoning_tier: high
context_scope: approve_and_build_cas_boundary
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/UI_Command_Catalog.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/execution_unit_context.schema.json
- Plans/Goal_Runtime_System.md
- Plans/prd_planning_runtime_contracts.json
- Plans/prd_planning_runtime_contracts.schema.json
node_compile_hint:
  mode: approve_and_build_cas_currentness
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- external_report:PRD_Planning_Runtime_Second_Sweep/approve_and_build_cas_gap
preserved_exact_tokens:
- Approve And Build
- compare-and-swap
- PlanningRun revision
- topic map version
- ApprovedPlanPack
- pack_hash
- project-context snapshot
- PlanUnit index hash
- acceptance-unit index hash
- PlanCompileRun
- execution_unit_context
- schema_version
negative_constraints:
- Do not approve mutable planning state that changed after final review.
- Do not leave PlanCompileRun identity to eventual projection reconciliation.
- Do not convert stale approval inputs into a successful build launch.
- Do not redefine execution_unit_context required fields, optional fields, enum values, or nullability in approval payloads.
- Do not persist execution_unit_context payloads without schema_version or with secrets, tokens, passwords, credentials, API keys, provider auth values, or local machine secrets.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/UI_Command_Catalog.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/execution_unit_context.schema.json
- Plans/Goal_Runtime_System.md
```


### PWIZ-011 - Product-Native Planning Audit And Repair Ownership


```yaml
plan_unit_id: PWIZ-011
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'Planning Wizard uses current Goal Runtime and Auditor-based AuditCycle, AuditFinding, RepairAttempt, AuditClosure, and CertificationReceipt records rather than superseded experimental workflow machinery. Every Topic Plan Draft receives a scoped fidelity audit/repair loop, and the integrated Final Plan Pack receives a separate broad multi-specialist audit/repair loop before user review and approval. Final Plan Pack audit covers PRD and ledger fidelity, exact details, unsupported inventions, owner and consumer placement, cross-topic conflicts, implementation readiness, testing readiness, security/data/permissions consistency, repository currentness, source lineage, schemas, mechanics, and future compile readiness. The final audit controller must launch multiple bounded read-only specialist agents in parallel for distinct defect families, persist assignments and results, reduce findings, run bounded repairs, and re-audit until all
  findings are durably closed or a true typed blocker remains. Audit findings have stable finding keys, source and artifact hashes, closure status, evidence, reason, repair attempts, and reopen conditions so unchanged closed findings become previously closed rather than recurring forever. Audit and repair subagents inspect, classify, compare, and propose; the Planning Run controller or assigned canonical artifact owner performs serialized writes, updates closures, and issues certification.'
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: implementation_readiness
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
- Plans/Plan_Document_System.md
- Plans/Plan_To_Node_Compilation.md
- Plans/storage-plan.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0130
- pldg-20260618-001-prd-planning-wizard:atom-0131
- pldg-20260618-001-prd-planning-wizard:atom-0132
- pldg-20260618-001-prd-planning-wizard:atom-0133
- pldg-20260618-001-prd-planning-wizard:atom-0134
- pldg-20260618-001-prd-planning-wizard:atom-0135
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/07-audit-readiness-and-safety.md#SRC-AUDIT
source_atom_ids:
- atom-0130
- atom-0131
- atom-0132
- atom-0133
- atom-0134
- atom-0135
decision_refs:
- dec-0026
- dec-0012
correction_refs:
- corr-0009
- corr-0008
preserved_exact_tokens:
- AuditCycle
- AuditFinding
- RepairAttempt
- AuditClosure
- CertificationReceipt
- topic audit
- final audit
- semantic fidelity
- implementation readiness
- source lineage
- multiple bounded read-only specialist agents in parallel
- durably closed
- finding_key
- previously_closed
- reopen conditions
- sole writer
- serialized writes
negative_constraints:
- Do not make superseded experimental pipeline artifacts part of the product audit architecture.
- Do not certify a broad final audit performed by one agent when parallel specialist review is required.
- Do not allow parallel repair subagents to race canonical Plan writes.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
- Plans/Plan_Document_System.md
- Plans/Plan_To_Node_Compilation.md
- Plans/storage-plan.md
```


### PWIZ-012 - Compile Readiness, Traceability, Blockers, And User Decisions


```yaml
plan_unit_id: PWIZ-012
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'Before Approve And Build, active first-party Plans and the ApprovedPlanPack contain zero unresolved stubs, TODOs, TBDs, FIXMEs used as deferred work, placeholders, empty required sections, fake acceptance criteria, mock production behavior, or deferred implementation details. A context-aware incomplete-content validator runs at Planning Wizard approval, Plan Compile certification, WorkNode completion, and Goal completion across active Plans, compile artifacts, first-party code, tests, generated outputs, and delivery artifacts. Historical quotations, compatibility notes, vendor or third-party sources, generated lockfiles, and rules that mention TODO or stub terminology are not false positives, while empty functions, panic or unimplemented paths, placeholder returns, fake tests, and implement-later prose are blockers. The only permitted incomplete item is a user_approved_incomplete_item naming the exact artifact and span, reason,
  risk, approver, downstream disposition, expiration or reopen condition, and evidence; broad permission to leave TODOs is invalid. Planning is compile-ready only when all required topics are Ready or explicitly excluded, ledgers are synchronized, topic plans compiled and audited, invalidations resolved, final integration and final audit completed, testing requirements captured, project context current, source lineage complete, zero-incomplete gate passed, and immutable ApprovedPlanPack can be created. Implementation readiness requires behavior, actors and identity, data and state transitions, edge and failure cases, permissions, currentness and idempotency, UI commands and states where applicable, adapters and side effects, validation surfaces, acceptance evidence, dependencies, and handoff contracts. Every material plan and compile claim must trace to an Approved PRD Pack, user planning answer, accepted Planning Amendment, repository fact, reference artifact,
  explicit system policy, or recorded assumption; unsupported invented claims are audit defects. Classify gaps as auto_resolvable, safe_default_with_assumption, defer_to_plan_compile, defer_to_worknode_system, requires_user_policy_decision, requires_user_risk_acceptance, requires_external_credential, or true infrastructure/runtime blocker. Only product policy with no safe inference, material risk acceptance, destructive or irreversible operations, credentials or permissions, legal/compliance authority, or irreconcilable user preference conflicts may block for user decision.'
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: stale_or_forbidden_behavior
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/Plan_Document_System.md
- Plans/Progression_Gates.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/Automated_Testing_System.md
- Plans/Contracts_V0.md
- Plans/human-in-the-loop.md
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0136
- pldg-20260618-001-prd-planning-wizard:atom-0137
- pldg-20260618-001-prd-planning-wizard:atom-0138
- pldg-20260618-001-prd-planning-wizard:atom-0139
- pldg-20260618-001-prd-planning-wizard:atom-0140
- pldg-20260618-001-prd-planning-wizard:atom-0141
- pldg-20260618-001-prd-planning-wizard:atom-0142
- pldg-20260618-001-prd-planning-wizard:atom-0143
- pldg-20260618-001-prd-planning-wizard:atom-0144
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/07-audit-readiness-and-safety.md#SRC-AUDIT
source_atom_ids:
- atom-0136
- atom-0137
- atom-0138
- atom-0139
- atom-0140
- atom-0141
- atom-0142
- atom-0143
- atom-0144
decision_refs:
- dec-0027
- dec-0028
correction_refs:
- corr-0010
preserved_exact_tokens:
- zero
- stubs
- TODOs
- TBDs
- placeholders
- Planning Wizard approval
- Plan Compile certification
- WorkNode completion
- Goal completion
- context-aware
- user_approved_incomplete_item
- compile-ready
- behavior
- state transitions
- failure cases
- idempotency
- acceptance evidence
- traceability
- unsupported claim
- auto_resolvable
- safe_default_with_assumption
- requires_user_risk_acceptance
- exceptional user decision
negative_constraints:
- No stubs or TODOs at all unless the user explicitly approves the exact item.
- Do not accept a broad 'allow TODOs' exception.
- Do not certify invented planning details with no source or explicit assumption.
- Do not block on ordinary details that safe defaults, evidence, or downstream stages can resolve.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/Plan_Document_System.md
- Plans/Progression_Gates.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/Automated_Testing_System.md
- Plans/Contracts_V0.md
- Plans/human-in-the-loop.md
- Plans/Goal_Runtime_System.md
```


### PWIZ-013 - Planning Run GUI, Topic Progress, And Attached Audits


```yaml
plan_unit_id: PWIZ-013
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'Planning Wizard GUI shows a collapsible parent named for the plan or project with child topic threads, dynamically added topics, final integration, final review, and attached audit/repair activity. The user remains in one Planning Wizard workspace with topic map, active Assistant Chat panel, live plan preview, source/annotation/readiness panels, and bounded backend child threads loaded as selected. Topic cards represent not_started, active, ledger_syncing, ledger_synced, compiling, auditing, repairing, ready, impacted, reopened, deferred, and blocked, with clear dependency and origin badges. Long-running topic conversion, audit, repair, final integration, and final audit display active stage, progress counts, assignment counts, findings fixed, current pass, and user-relevant status so the interface never appears stalled. Audit and repair children are attached under their topic or final Plan Pack and summarized in activity/progress
  views; detailed agent traces and evidence may be expanded without cluttering the default thread tree. The workspace additionally hosts per-topic plan preview and annotation panels and an embedded Assistant Chat instance slot per topic conversation as defined by PWIZ-019, while the separate Assistant Chat side panel remains available.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
- Plans/Orchestrator_Page.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0147
- pldg-20260618-001-prd-planning-wizard:atom-0148
- pldg-20260618-001-prd-planning-wizard:atom-0149
- pldg-20260618-001-prd-planning-wizard:atom-0150
- pldg-20260618-001-prd-planning-wizard:atom-0151
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/08-gui-threads-and-navigation.md#SRC-GUI
source_atom_ids:
- atom-0147
- atom-0148
- atom-0149
- atom-0150
- atom-0151
decision_refs: []
correction_refs:
- corr-0005
- corr-0006
preserved_exact_tokens:
- collapsible
- Planning Run
- child topic
- one Planning Wizard page
- active chat panel
- ledger_syncing
- compiling
- auditing
- repairing
- impacted
- progress counts
- audit pass
- attached audit child
- collapsed
negative_constraints:
- Do not present every backend subagent or audit thread as a separate top-level app surface.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
- Plans/Orchestrator_Page.md
```



## Assistant redesign: BSD, Wonderer and Grill Me in the Planning Wizard start flow (2026-09-03)

### Additive Correction v4 — Grill Me is +25 here too (QMAX-020)

`PM_Assistant_v2_Additive_Correction_v4` sets the Grill Me extension to **25**,
retiring the former `+10`. It applies to the Planning Wizard's own owner-defined
question scope; the Assistant's per-strategy bases (Plan 3/6/8, Deep Plan
10/15/20) belong to `Plans/Assistant_Plan_Runtime.md` and none of them becomes
this workflow's base. One counter still serves the whole run, and the global
duplicate-prevention registry still suppresses a question already answered in
an imported thread or planning context.


`Plans/Collaborative_Workflows.md` §9.4 fixes the shared-registry boundary for
Wonderer and Grill Me and states that their **placement** is owned here. This
section is that placement. It is canonical live specification text for this owner
document.

### The three start-flow options

The Planning Wizard start flow offers exactly three additive options. Each is off unless
the user selects it, none of them is required to start, and none changes what
Planning Wizard produces:

| Option | What it adds | When it runs |
|---|---|---|
| **Back Seat Driver** | A separate passive advisor over the run, at the stages bound in Settings. | Continuously, under `Plans/Back_Seat_Driver.md` §4 and §13. |
| **Wonderer** | A built-in Persona plus a reusable methodology Skill that explores adjacent domains and overlooked possibilities. | **Early**, while the shape of the problem is still open. |
| **Grill Me** | A reusable methodology Skill applied through a dedicated participant role that widens the question frontier. | **Near the end** of discovery and topic work, once enough is known to ask sharp questions. |

### Ordering is a rule, not a default

Wonderer runs early and Grill Me runs late **because the two do opposite jobs**.
Wonderer widens the space of things that might matter, which is only useful before
the shape is fixed. Grill Me closes the remaining decisions, which is only possible
once there is something specific to decide. Running Grill Me first produces
confident questions about the wrong subject; running Wonderer last produces leads
nobody has time to research. The flow therefore fixes the order rather than
offering it as a preference.

### Questions

A **shared global question history** spans the whole run. A question already
answered in this run's earlier topics is not asked again, and semantic duplicates
are merged rather than re-asked in new words. Answers are captured in the active
PRD or Wizard state through this owner; Grill Me itself stores nothing.

Grill Me raises the run's effective question allowance by the configured extension
(default **+25**), and the allowance is **shared across participants** — it is a
budget for the run, not a per-agent quota. Grill Me routes answerable factual
questions to research rather than to the user: finding facts is the workflow's job
and deciding is the user's.

The **+25** applies to the Planning Wizard's own owner-defined question scope
(its per-topic question counters). It does not import the
Assistant's per-strategy bases: BrainStorm's 20, Deep Thorough's 10, and the
regular Plan's 3/6/8 are Assistant Plan strategy values owned by
`Plans/Assistant_Plan_Runtime.md` (`QMAX-001..004`, `QMAX-020`) and none of them
becomes this workflow's base. One counter still serves the whole run: a question
first presented here is charged once and is not re-charged on revision, restart,
retry, or reopen, and the global duplicate-prevention registry still suppresses a
question already answered in an imported thread or planning context.

### Authority

None of the three can implement, execute or approve anything.

- Wonderer's leads remain **hypotheses until researched**, and are labelled that way
  wherever they appear. A lead is never promoted to a finding by assertion.
- Grill Me has no implementation authority: it cannot mutate the target project,
  cannot start execution, and cannot approve anything.
- Back Seat Driver is read-only and never gates a stage. Planning Wizard completes
  identically whether BSD is Off, Auto, On, degraded or quarantined.
- Wonderer and Grill Me do **not** participate in hidden PlanUnit, WorkNode, audit,
  execution or certification stages unless explicitly invoked as ordinary agents for
  a relevant visible planning task. Back Seat Driver may cover those stages under
  `Plans/Back_Seat_Driver.md` §13.

Persona identity and storage remain owned by `Plans/Personas.md`; Skill identity,
discovery and bounded materialization remain owned by `Plans/Skills_System.md`;
participant-role semantics remain owned by `Plans/Collaborative_Workflows.md` §9.
This section owns only where the three options appear in this flow and when they run.

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Back_Seat_Driver.md, ContractName:Plans/Personas.md, ContractName:Plans/Skills_System.md

## 3. Contracts, Schemas, Events, Or Data Shapes

The core data shapes are PlanningRun, thread_group_id, topic map, topic_id-scoped ledger records, Planning Context Capsule, Topic Plan Draft, Planning Amendment, Final Plan Pack, ApprovedPlanPack, PlanApproved event, project-context snapshot, blocker taxonomy, audit records, readiness states, and source-lineage refs.


## 4. Integration Surfaces

Planning Wizard integrates with PRD Builder through Approved PRD Pack, with Assistant Chat through structured handoff seeds and bounded child threads, with Goal Runtime through conversion/audit/specialist roles, with Plan Compile through ApprovedPlanPack and PlanApproved, and with Orchestrator through immediate Plan Compile navigation after approval.


## 5. Validation And Acceptance

Acceptance requires synchronized ledgers, ready or explicitly excluded topics, audited topic plans, resolved invalidations, final integration, final audit, source lineage, captured testing requirements, current project context, zero unapproved incomplete content, a durable ApprovedPlanPack, and a passing approval CAS/currentness check before Plan Compile authority exists.


## 6. Plan-To-Node Readiness

Planning Wizard can approve a pack for Plan Compile but does not itself create runtime WorkNodes, NodeSeeds, executable queues, implementation files, final node manifests, or production build tasks. End-to-end pipeline implementation readiness remains unproven until the clean-room fixture suite passes.

The final-review Approve And Build control consumes `Plans/.implementation_readiness/buildability_gate_report.json` as a product gate. Captured source, plan-complete documentation, green validators, and semantic closure are preconditions only; they do not enable Approve And Build unless `buildability_gate_passed=true`. While blocked, the disabled reason lists every open blocker family and its exact owner docs, and `PNC-019` surfaces as a hard disabled reason.


## 7. Deferred, Retired, Compatibility, And Non-Goals

Retired current-product terms `Chain Wizard`, `Plan Wizard`, and `Start Chain` are compatibility/search lineage only. Legacy chain-wizard docs are migrated/redirected consumers, not current owners for the finished Planning Wizard workflow.


## 8. Source Lineage And Governance

Compiled from `Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/`. The ledger remains source-lineage memory; generated shard and evidence coverage, Spec Lock hashes, and plan-graph references include this owner doc after the bounded audit repair and governance seal. `Plans/auto_decisions.jsonl` remains deterministic-log managed and is not product prose authority.

## Ledger Compile Addendum - pldg-20260622-001-fff

### PWIZ-015 - Planning Wizard Source Picker Discovery Consumer

```yaml
plan_unit_id: PWIZ-015
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  Planning Wizard source/context pickers use DiscoveryService to find relevant project files for planning context without creating WorkNodes. Requests use planning_wizard_source_picker, planning_context intent, project/worktree or remote/SSH identity, policy_context, and file or content_candidate target kinds. Selected candidates preserve ranked provenance in Planning Context Capsules and expose stale, fallback, denied, hidden-by-policy, and no-results states in the picker. Selected sources are planning evidence only; later implementation still performs exact content verification before edits.
gui_related: true
gui_classification_reason: This is the Planning Wizard source/context picker GUI behavior.
depends_on: [F3-399, T-161, SP-217, F2-191]
unblocks: [ATS-011]
acceptance_criteria:
  - Planning Wizard source/context pickers route through DiscoveryService.
  - Selected candidate provenance is preserved in Planning Context Capsules.
  - Discovery selection does not create WorkNodes, NodeSeeds, executable queues, or implementation work.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future Planning Wizard source pick local/SSH tests.
  - Future policy-hidden source no-leak tests.
risk_class: planning_source_context_drift
reasoning_tier: standard
context_scope: planning_wizard_source_picker
implementation_surfaces: [Plans/Planning_Wizard.md, future Planning Wizard source picker]
node_compile_hint: {mode: planning_wizard_discovery_consumer, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0027
  - pldg-20260622-001-fff:atom-0038
  - pldg-20260622-001-fff:atom-0044
  - pldg-20260622-001-fff:atom-0045
  - pldg-20260622-001-fff:atom-0059
  - pldg-20260622-001-fff:atom-0087
  - pldg-20260622-001-fff:atom-0088
  - pldg-20260622-001-fff:atom-0090
  - pldg-20260622-001-fff:state/consumer_conformance_matrix.json#planning_wizard_source_picker
source_atom_ids: [atom-0027, atom-0038, atom-0044, atom-0045, atom-0059, atom-0087, atom-0088, atom-0090]
preserved_exact_tokens: ["Planning Wizard", "planning_wizard_source_picker", "Planning Context Capsules", "planning_context", "content_candidate", "Chain Wizard", "no WorkNodes"]
negative_constraints:
  - Do not revive Chain Wizard terminology.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks from source selection.
  - Do not copy unbounded transcripts or unrelated source context.
owner_hints: [Plans/Planning_Wizard.md, Plans/FinalGUISpec.md, Plans/Tools.md, Plans/storage-plan.md]
```


## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### PWIZ-016 - Planning Wizard Historical Plan Pack Records

```yaml
plan_unit_id: PWIZ-016
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: Planning Wizard Plan artifacts, Final Plan Packs, ApprovedPlanPacks, and related exports must write
  immutable project-scoped history records that Orchestrator History can browse, compare, export, reopen, and send
  forward subject to currentness and authority checks. Final/approved plan outputs are retained forever by default;
  retained drafts, intermediate outputs, previous versions, archive state, package identity, source-lineage metadata,
  source ledger atom lineage where applicable, and manifest identity remain available for deep compare and filtered
  history.
gui_related: false
gui_classification_reason: Defines Planning Wizard output/history record obligations; GUI presentation is owned
  by Orchestrator History.
depends_on:
- SP-219
unblocks:
- OP-026
- POA-051
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: planning_history_lineage_loss
reasoning_tier: standard
context_scope: planning_wizard_history_records
implementation_surfaces:
- Plans/Planning_Wizard.md
- future Planning Wizard output records
node_compile_hint:
  mode: planning_history_record_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0008
- pldg-20260626-001-feature-name:atom-0015
- pldg-20260626-001-feature-name:atom-0016
- pldg-20260626-001-feature-name:atom-0024
- pldg-20260626-001-feature-name:atom-0025
- pldg-20260626-001-feature-name:atom-0034
- pldg-20260626-001-feature-name:atom-0035
- pldg-20260626-001-feature-name:atom-0047
- pldg-20260626-001-feature-name:atom-0052
- pldg-20260626-001-feature-name:atom-0066
- chat:misc-history-scope
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Project_Output_Artifacts.md
- Plans/Runtime_Artifacts_Panel.md
- chat:history-defaults-answers
- chat:history-scope-retention-actions-answers
- chat:history-columns-toggle-deep-compare-answers
- chat:history-source-index-answer
- chat:history-projection-lifecycle-answer
- chat:history-pressure-test-request
- chat:history-pressure-test-defaults-answer
source_atom_ids:
- atom-0008
- atom-0015
- atom-0016
- atom-0024
- atom-0025
- atom-0034
- atom-0035
- atom-0047
- atom-0052
- atom-0066
decision_refs:
- dec-0002
- dec-0003
- dec-0004
- dec-0005
- dec-0008
- dec-0009
- dec-0011
- dec-0012
preserved_exact_tokens:
- see historical documents that are made
- by documents I mean the plans and PRD docs that are created by the wizard
- plans and PRD docs
- created by the wizard
- By default it should show only final/approved outputs
- final/approved outputs
- it can be exapnded by the user to show everything
- show everything
- retained forever by default
- 'yes'
- retention/archive rules
- deeper is mvp
- Compare versions
- rendered document diff
- package/source-lineage metadata
- ledger-atom diff
- immutable historical records
- project-scoped unified History index/projection
- source-of-truth shape
- wizard save/approval
- run lifecycle
- artifact/evidence write
- archive/unarchive
- lineage/manifest events
- Before compile
- pressure-test
- remaining underspecified History surfaces
negative_constraints:
- Do not collapse PRD Builder outputs, Planning Wizard outputs, Plan packs, and runtime artifacts into an anonymous
  flat document list.
- Do not treat mutable draft projections as the same thing as immutable approved packs or historical snapshots.
- Do not show every draft/intermediate artifact in the default Documents view.
- Do not hide final/approved artifacts inside raw ledger or export-only views.
- Do not make expanded history indistinguishable from approved/final history.
- Do not omit authority labels such as draft, approved, final, superseded, exported, or generated when showing everything.
- Do not apply ordinary draft/intermediate retention cleanup to final/approved outputs by default.
- Do not silently remove final/approved outputs from History.
- Do not promise draft/intermediate rows remain visible forever by default.
- Do not make archived/hidden all-history rows indistinguishable from deleted records.
- Do not ship compare versions as rendered-text-only in MVP.
- Do not hide source-lineage or package identity changes when comparing historical wizard documents.
- Do not compare by path or title alone when canonical document/package IDs exist.
- Do not let comparison mutate or merge historical records.
- Do not implement the History surface as fragile cross-subsystem ad hoc scans at view time.
- Do not make the History read model global or cross-project by default.
- Do not rely on view-time scanning as the primary way to discover normal History changes.
- Do not omit archive/unarchive or lineage/manifest updates from the projection lifecycle.
- Do not treat this pressure-test as permission to write canonical Plans.
- Do not create Plans/.plan_index, WorkNodes, NodeSeeds, executable queues, Spec_Lock, shards, evidence, plan_graph,
  or auto_decisions.
- Do not compile without a future explicit compile request.
owner_hints:
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Project_Output_Artifacts.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/Orchestrator_Page.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Permissions_System.md
```

## Ledger Compile Addendum - pldg-20260701-001-feature-intake

This addendum compiles first-run onboarding handoff behavior from bootstrap ledger `pldg-20260701-001-feature-intake` into Planning Wizard ownership. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

### PWIZ-017 - Superseded Provider-First Handoff Source Lineage

```yaml
plan_unit_id: PWIZ-017
unit_type: source_lineage_disposition
status: retired
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  PWIZ-017 preserves the 2026-07-01 four-screen, provider-first, direct-to-Planning-Wizard proposal as historical
  source lineage only. It is not current Product Onboarding choreography, command authority, or landing-page authority.
  PWIZ-021 through PWIZ-023 own the current nine-stage `welcome` / `simple_path` / `first_project` /
  `source_control_setup` / `server_storage_client` / `remote_access_setup` / `review_setup_plan` /
  `automatic_preparation` / `ready` flow, its six-stage connect-existing shortcut, durable migration, and optional
  three-scene Guided Tour.
  Provider and advanced setup are optional and deferrable, incomplete provider state remains a truthful warning rather
  than a false Health/Doctor Ready claim, and the secondary Guided Tour completes with Assistant Chat at the far right.
  The current handoff
  consumes bounded typed Onboarding state and owner receipt refs rather than a raw transcript or legacy
  `onboarding_setup_state` shape. The retired exact copy and tokens below remain searchable for migration and audit;
  they do not authorize a provider gate, a `cmd.onboarding.*` command family, or replay of owner work.
gui_related: true
gui_classification_reason: Preserves the retired visible first-run choreography and copy solely for audit and migration lineage.
depends_on: [PWIZ-021, PWIZ-022, PWIZ-023]
unblocks: []
acceptance_criteria:
  - The four-screen/provider-first order, mandatory provider prompt, legacy setup-state shape, and direct landing behavior are classified as source-lineage rather than current product authority.
  - Current behavior routes through PWIZ-021 through PWIZ-023, the nine-stage primary path, the six-stage connect-existing shortcut, and the exact three-scene Guided Tour.
  - The superseded seven-stage Onboarding flow and five-chapter Guided Tour are explicitly source-lineage only.
  - Legacy provider decisions and warnings remain migration inputs without becoming current stage, command, or readiness authority.
  - No old onboarding record reruns provider, Server, pairing, restore, Project, authentication, or source-control owner work.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Plans/product_onboarding_contracts.schema.json
  - future legacy-to-current durable migration fixture
risk_class: retired_provider_first_choreography_reactivated
reasoning_tier: high
context_scope: retired_first_run_handoff_lineage
implementation_surfaces:
  - Plans/Planning_Wizard.md
node_compile_hint:
  mode: source_lineage_disposition
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0029
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0036
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0037
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0038
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0042
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0045
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0046
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0047
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/onboarding_doctor_user_decisions_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/assistant_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/user_accepts_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/pmconcept_gui_reference_20260701.json
source_atom_ids: [atom-0029, atom-0036, atom-0037, atom-0038, atom-0042, atom-0045, atom-0046, atom-0047]
decision_refs: [dec-0007, dec-0008]
preserved_exact_tokens:
  - "After the setup, it dumps the user into the planning Wizard page."
  - "Planning Wizard"
  - "Open Planning Wizard"
  - "Skip for now"
  - "Provider setup is not finished. You can still open Planning Wizard, but assistant features may need a provider before they can run."
  - "Set up provider"
  - "onboarding_setup_state"
  - "setup_completed"
  - "setup_skipped"
  - "connected_provider_count"
  - "provider_warning_count"
  - "free_models_reviewed"
  - "health_summary_state"
negative_constraints:
  - Do not restore the four-screen/provider-first proposal as active choreography.
  - Do not make provider or advanced setup a prerequisite for reaching Ready or Planning Wizard.
  - Do not register `cmd.onboarding.*` from retired command-era text; current controls are owner-local typed UI actions.
  - Do not use the raw onboarding transcript or legacy onboarding_setup_state as current Product Onboarding authority.
  - Do not drop retained provider warnings or convert Connected or Logged in into Ready.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, or runtime/build surfaces as part of first-run handoff.
owner_hints:
  - Plans/Planning_Wizard.md
  - Plans/FinalGUISpec.md
  - Plans/Wiring_Matrix.md
  - Plans/Contracts_V0.md
```

## Implementation Readiness Gate Addendum - 2026-07-05

This addendum installs the Planning Wizard buildability gate without creating WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime dispatch, production build tasks, generated governance seal artifacts, or executable PlanCompile artifacts.

### PWIZ-018 - Approve And Build Buildability Gate

```yaml
plan_unit_id: PWIZ-018
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  Captured source, plan-complete documentation, PlanUnit indexes, semantic closure, schema existence, wiring JSON
  existence, and validator success are separate preconditions and none of them prove implementation buildability.
  Planning Wizard final review must represent the ladder as Captured != Plan-complete != Buildable. The
  `cmd.planning_wizard.approve_and_build` control is disabled unless
  `Plans/.implementation_readiness/buildability_gate_report.json` reports `buildability_gate_passed=true`.
  When disabled, the final-review state projection must list each currently open blocker family and the exact owner
  docs from the buildability report. `PNC-019` from `Plans/.plan_index/node_readiness_report.json` is a hard disabled
  reason only while the report's node_readiness.hard_disabled projection is true, until executable lifecycle
  certification evidence proves Approve And Build through PlanCompile, Executor intake, activation, Orchestrator
  projection, testing evidence, cancellation/restart, and negative-case rejection. PNC-019 bootstrap authority for
  the compiler/harness/certifier path is not ordinary Approve And Build enablement and must remain disabled for
  product work unless the buildability gate passes.
gui_related: true
gui_classification_reason: Defines final-review button enablement and disabled reason behavior in the Planning Wizard GUI.
depends_on: [PWIZ-010, PWIZ-012, PWIZ-014, PNC-019, PNC-022]
unblocks: [UIW-009, PG-060]
acceptance_criteria:
  - Planning Wizard distinguishes Captured, Plan-complete, and Buildable states.
  - Approve And Build is disabled whenever buildability_gate_passed is false.
  - The disabled reason lists currently open blocker families and exact owner docs from Plans/.implementation_readiness/buildability_gate_report.json.
  - The production final-review control projects availability and disabled reason through the wiring matrix and cannot emit PlanApproved while buildability_gate_passed is false.
  - PNC-019 appears as a hard disabled reason while node readiness remains blocked_runtime_certification_incomplete.
  - PNC-019 bootstrap authority does not enable ordinary product Approve And Build or suppress open blocker-family disabled reasons.
  - Closed or accepted_risk readiness-blocker rows may remain as historical evidence without keeping Approve And Build disabled.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks are created by this gate.
validation_surfaces:
  - python3 scripts/pm-implementation-readiness.py validate
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
  - python3 scripts/pm-plan-index.py validate
risk_class: false_buildability_enablement
reasoning_tier: high
context_scope: planning_wizard_final_review_buildability_gate
implementation_surfaces:
  - Plans/Planning_Wizard.md
  - Plans/.implementation_readiness/buildability_gate_report.json
  - Plans/.implementation_readiness/readiness_blockers.jsonl
  - Plans/.plan_index/node_readiness_report.json
node_compile_hint:
  mode: approve_and_build_buildability_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - source_ref:chat:2026-07-05-implementation-readiness-buildability-gate
  - Plans/Plan_To_Node_Compilation.md#PNC-019
preserved_exact_tokens:
  - "Captured != Plan-complete != Buildable"
  - "Approve And Build is disabled unless buildability gate passes"
  - "blocker families and exact owner docs"
  - "PNC-019"
negative_constraints:
  - Do not treat source preservation, schema existence, wiring JSON existence, semantic closure, or passing validators as proof of implementation buildability.
  - Do not allow Approve And Build to emit PlanApproved or create/bind PlanCompileRun while the buildability gate is blocked.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks from this gate.
owner_hints:
  - Plans/Planning_Wizard.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/UI_Wiring_Rules.md
  - Plans/Progression_Gates.md
```

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
## FABLE Remaining Action Plan Audit-Lineage Notes (2026-07-08)

These rows are preserved as audit-lineage notes only. They do not prove repair by themselves; repaired status requires concrete canonical prose/schema/enum/command/algorithm evidence in this owner doc or an explicit non-repair disposition in `Plans/.audits/fable-20260706/owner_note_closure_fidelity_after.jsonl`. This note creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 338` (explicitly_deferred; source line 1145; `sfk-78f02d9a707edd394637f596`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [CRITICAL] whole doc: every PWIZ unit is prose-only YAML no data schema for PlanningRun, topic map, Planning Context Capsule, or ledger record shape anywhere.
- `registry_line 339` (explicitly_deferred; source line 1146; `sfk-9fb886bd6cf16ee54c7e1f0e`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [CRITICAL] L1075-1139 (PWIZ-013): topic card states (11 named) have no transition table, trigger events, or command/IPC names.
- `registry_line 343` (explicitly_deferred; source line 1158; `sfk-dfcc395f84654bcabdfbe6aa`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [HIGH] whole doc vs Planning_Wizard.md's later ledger addenda: describes an AGENTS.md/Codex-thread workflow that appears superseded by more detailed, differently-worded later addenda not marked stale/retired.

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime Planning Wizard rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-78f02d9a707edd394637f596`: `PlanningRun` fields are `planning_run_id`, `project_id`, `topic_map_ref`, `context_capsule_ref`, `ledger_ref`, `state`, `created_at_utc`, and `updated_at_utc`. `PlanningContextCapsule` fields are `capsule_id`, `source_refs[]`, `constraints[]`, `open_questions[]`, `accepted_defaults[]`, and `redaction_profile_id`.
- Repairs `sfk-9fb886bd6cf16ee54c7e1f0e`: topic card states are `new`, `active`, `needs_user`, `answered`, `accepted`, `deferred`, `blocked`, `superseded`, `compiled`, `sealed`, and `retired`. Commands are `cmd.planning.topic.open`, `cmd.planning.topic.answer`, `cmd.planning.topic.accept`, `cmd.planning.topic.defer`, and `cmd.planning.topic.supersede`.
- Repairs `sfk-4dcdcb5c0b63f442e90451bb`: PWIZ-010 consumes the CAS/idempotency mechanism owned by PWIZ-014; duplicate CAS prose in PWIZ-010 is source-lineage only.
- Repairs `sfk-dfcc395f84654bcabdfbe6aa`: `Plans/Bootstrap_Planning_Migration.md` is legacy migration workflow lineage. Current Planning Wizard + ledger addenda own the live PM ledger conversational flow.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->

## PMConcept6 Concept Promotion Addendum - 2026-07-11

This addendum promotes user-approved PMConcept6 concept behaviors into canonical PlanUnits. `Concepts/pm6-build/**` remains illustrative source-lineage only per `Plans/usage-feature.md`; this addendum creates no WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, runtime artifacts, generated governance artifacts, or production build tasks.

### PWIZ-019 - Embedded Assistant Chat Instances In Wizard Workspace

```yaml
plan_unit_id: PWIZ-019
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'Planning Wizard and PRD Builder workspaces embed Assistant Chat instances per topic conversation and per PRD discovery interview. Each embedded instance is the same Assistant Chat component and message pipeline as the global chat panel, rendered from one template and state source in a chrome-reduced embedded mode: the message stream, composer, and quick-reply chips remain, send stays gated by conversation state, and panel-level chrome such as the thread rail, thread search, issues and worktree indicators, persona and model selectors, the mode strip, and panel toggles is omitted. Stream, footer, and suggestion content resolve per thread, and context boxes are thread-scoped. Embedded instances are additive: the separate global Assistant Chat side panel remains the canonical #chatPanel surface, so embedding inside the wizard workspace does not replace or remove the separate chat side panel.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: [PWIZ-013, F3-131, F3-357]
unblocks: []
acceptance_criteria:
- Wizard topic conversations and PRD discovery interviews render embedded Assistant Chat instances backed by the same component, template, and state source as the global chat panel.
- Embedded mode omits the thread rail, thread search, issues and worktree indicators, persona and model selectors, mode strip, and panel toggles while keeping the message stream, composer, quick-reply chips, and gated send.
- The separate global Assistant Chat side panel remains available while embedded instances are active.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this unit.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-shard-plans.py --check
risk_class: owner_drift
reasoning_tier: standard
context_scope: planning_wizard_embedded_chat_instances
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: wizard_embedded_assistant_chat_instances
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:concept:pm6-build-2026-07-11
- Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)
- Plans/FinalGUISpec.md#F3-420
source_atom_ids: []
decision_refs:
- dec-2026-07-11-pm6-concept-promotion-planunits-seal
correction_refs: []
preserved_exact_tokens:
- Assistant Chat
- embedded
- quick-reply chips
- '#chatPanel'
negative_constraints:
- Do not replace or remove the separate Assistant Chat side panel; embedded instances are additive to the separate panel surface.
- Embedded chat chrome must not require arbitrary-content backdrop blur or SVG filters; color styling must be precomputed rather than runtime color mixing, and any glass treatment uses a single blur over a known wallpaper as a pre-blurred asset.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
```

## PMConcept6 Shell Sweep Addendum - 2026-07-16

This addendum promotes user-approved PMConcept6 wizard replay control into canonical PlanUnits. `Concepts/pm6-build/**` remains illustrative source-lineage only per `Plans/usage-feature.md`. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### PWIZ-020 - Replay Planning Flow Control

```yaml
plan_unit_id: PWIZ-020
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'Planning Wizard exposes a user-facing control labelled Replay planning flow that rewinds the wizard view to its intake stage so the user can watch or re-drive the planning flow presentation from the beginning. Replay is view-local: it replays the wizard presentation over already-recorded planning state and does not touch live execution or governance state. The live PlanningRun, ledger records, approvals, and any PlanCompileRun are unaffected; replay performs no ledger mutations, requires no re-approval, and creates no new compile. Leaving replay returns the user to the current live wizard state without loss.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: [PWIZ-013, PWIZ-014]
unblocks: []
acceptance_criteria:
- A control labelled Replay planning flow rewinds the wizard view to its intake stage and replays the planning flow presentation.
- Replay leaves the live PlanningRun, ledger records, approvals, and any PlanCompileRun unchanged, with no ledger mutations, no re-approval, and no new compile.
- Replay state is view-local, and exiting replay restores the current live wizard state without loss.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-shard-plans.py --check
risk_class: owner_drift
reasoning_tier: standard
context_scope: planning_wizard_view_replay_control
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: wizard_view_local_replay_control
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:concept:pm6-build-2026-07-11
- Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)
- Concepts/pm6-build/parts/16-page-wizard.part.html
- Concepts/pm6-build/parts/29x-pm6-js-wizard.part.html
- Plans/Planning_Wizard.md:30
- Plans/Planning_Wizard.md#PWIZ-014
source_atom_ids: []
decision_refs:
- dec-2026-07-16-pm6-shell-sweep-promotion-seal
correction_refs: []
preserved_exact_tokens:
- Replay planning flow
- intake
- view-local
negative_constraints:
- Replay must not mutate ledger state, re-trigger approvals, or create PlanCompileRuns; it is a view-local presentation replay.
- Replay must not rewind, fork, or invalidate PlanningRun, topic, approval, or Approve And Build currentness state.
- Wizard replay chrome must not require arbitrary-content backdrop blur or SVG filters; color styling must be precomputed rather than runtime color mixing, and any glass treatment uses a single blur over a known wallpaper as a pre-blurred asset.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
```

## PMConcept7 Concept Promotion Addendum - 2026-07-23

This addendum records ownership boundaries from the user-approved PMConcept7 concept pass (ChatGuiUpdates2 workstreams, revs 4-9.2) and promotes no new PlanUnits in this document. `Concepts/PMConcept7.html` and `Concepts/ChatGuiUpdates2.md` remain illustrative source-lineage only. Workspace runhead presentation is owned by `Plans/FinalGUISpec.md` (F3-470): the runhead is one line carrying the project title, the state/PRD chip, and the Replay control, with no PlanningRun/revision/seed meta line in the header. PlanningRun identity, revision, and seed remain data-model canon in this document, the Approve And Build CAS/currentness payload is unchanged, and run identity fields may surface in inspector or rail projections rather than the header one-liner. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

## Product Onboarding and Guided Tour owner addendum (reconciled 2026-09-01)

This addendum supersedes PWIZ-017's four-screen/provider-first choreography and the 2026-08-31 seven-stage Onboarding and five-chapter Guided Tour proposal. PWIZ-021 through PWIZ-023 retain their PlanUnit identities and source refs while carrying the current design below. Product Onboarding is a distinct pre-application state machine owned here; Installation/Deployment, Server Claim/Bootstrap, Discovery/Pairing/Remote Access, provider installation/authentication, Project registration/content movement, Source Control, updates, backup/restore, and Doctor retain their own engines. Planning Wizard receives the final setup handoff but is not the Onboarding state store. `Plans/product_onboarding_contracts.schema.json`, `Plans/guided_tour_contracts.schema.json`, and their fixtures are downstream machine-contract consumers: any seven-stage, no-current-`simple_path`, five-chapter, restore-or-keep, or tour-ends-at-Planning-Wizard values in those files are superseded and cannot override this owner document until separately reconciled.

### Product-design law

Product Onboarding MUST feel simple, beautiful, cinematic, and calm. Each stage asks one decision, has one visually dominant CTA, and shows no more than two prominent choices. Additional valid choices live behind a clearly named secondary disclosure such as `More ways`; disclosure never changes a selection or starts work. Advanced configuration is not embedded in Onboarding: `Advanced settings` routes to the exact owner Settings manager and returns through the same continuation context. Before review confirmation, automatic detection is limited to safe cached projections. Copy is concise and human: visible headings and choices explain the outcome in ordinary language, while internal tool names, connection details, ports, package provenance, fingerprints, raw authentication state, and topology generations stay in Details. The primary copy never asks a beginner to understand source-control jargon or developer terminology.

The full nine-stage path and the connect-existing six-stage shortcut are presented in one bounded modal window over a theme-aware input-blocking scrim. The live Puppet Master application remains visibly present behind the modal so setup reads as a short guided interruption, never a full-page route or substitute application. Desktop layouts keep clear space around the modal. Narrow and short layouts may approach the viewport bounds only while retaining an explicit outer margin, modal border/chrome, one `role=dialog`/`aria-modal=true` accessibility surface, focus containment, and exact Close/Escape return to the initiating application control. Branches replace the modal interior only; they do not open a nested modal or full-page subflow.

The nine canonical stages, in exact order, are:

1. `welcome` (`Welcome`) — explain the outcome in one short sentence; dominant CTA `Get Started`; secondary `Skip`.
2. `simple_path` (`Choose your setup`) — choose either the ordinary guided setup or `Connect to an existing Puppet Master`. The choice is recorded locally and advances immediately; it performs no discovery, pairing, sign-in, installation, creation, or network work.
3. `first_project` (`First Project`) — on the ordinary path, choose `Start a new project` or `Open one I already have`; `Other project options` reveals less-common origins. This stage records the intended Project action but does not create, open, clone, restore, or register anything yet.
4. `source_control_setup` (`Safe History`) — on the ordinary path, explain that Safe History keeps recoverable versions on the selected work computer and that an online copy is separate and optional. Internal backend and service names may appear only in plain-language Details. The stage records the local-history and optional-online-copy plan but does not initialize, bind, clone, publish, authenticate, or create an online repository.
5. `server_storage_client` (`Where your work lives`) — on the ordinary path, choose in plain language where work runs, where its data is kept, and which device is being used now. Cached known choices may be suggested, but discovery, pairing, setup, restore, storage movement, and trust work remain deferred.
6. `remote_access_setup` (`Use it while away`) — on both paths, choose the safe supported private-access plan or `Not now`; public/manual details remain behind progressive disclosure. The stage records intent only and never claims that a route exists.
7. `review_setup_plan` (`Review your setup`) — on both paths, show one concise, editable summary of every selected action, skipped item, destination, privacy consequence, and what Puppet Master will do. `Confirm and prepare` is the sole setup-plan confirmation boundary. Before it is activated, Onboarding may persist only its local draft and read cached projections; it MUST NOT probe the network or dispatch installation, authentication, pairing, trust, restore, Project, history, online-copy, storage, Remote Access, provider, update, or other external owner work.
8. `automatic_preparation` (`Getting things ready`) — only after the current review is explicitly confirmed, dispatch the approved work through the canonical owners and observe their real progress, questions, results, and receipts. A question that only an owner can resolve may be shown here without silently expanding the confirmed plan. Protected authentication remains human-only and bound to the exact initiating active Client.
9. `ready` (`Ready`) — show a compact truthful completion state and one dominant `Enter Puppet Master` CTA. `Take the Guided Tour` is secondary and optional. Ready means only that the confirmed setup plan reached its truthful handoff; it does not claim skipped or failed owner work is healthy or complete.

The connect-existing shortcut uses exactly `welcome` -> `simple_path` -> `remote_access_setup` -> `review_setup_plan` -> `automatic_preparation` -> `ready`. After an explicit route choice, it may consume cached identity/setup projections, already-detected account or session status, known endpoints, and owner-bounded read-only nearby discovery for the selected existing Puppet Master. It records any connection or access work as part of the draft and skips `first_project`, `source_control_setup`, and `server_storage_client`; it never performs hidden authentication, pairing, configuration, or setup in place of the omitted stages. Review confirmation remains mandatory before any state-changing or protected operation begins.

Selecting a choice card records that choice in the local draft and advances to the next applicable stage immediately. It does not dispatch owner work. `Confirm and prepare` at `review_setup_plan` validates the current revision and dispatches the approved owner work exactly once through the fenced `OnboardingReturnContext`; `automatic_preparation` observes that work and advances only from current terminal results. Necessary trust, authentication, destructive, privacy, or restore questions remain explicit after confirmation, but an unchanged setup plan is never reconfirmed. Failed, cancelled, stale, or interrupted owner results stay in preparation with one plain-language recovery action.

`Back`, `Close`, `Skip`, `Do this later`, cancel, and resume are always responsive. `Close` is a non-completion dismissal: it closes the modal and restores the initiating focus without marking the session completed, skipped, deferred, or any owner Ready. `Skip` records the explicit `skipped` session outcome without asserting readiness. `Do this later` dispatches `ui.onboarding.defer`; it durably writes a resumable continuation snapshot containing the exact current stage, selected path, active owner branch, bounded stage history, revision, continuation generation, initiating Client, and return-focus identity before the modal closes. Resume restores that exact continuation rather than restarting or inferring a new path. `Details` is an ephemeral same-stage disclosure: opening or closing it writes no `OnboardingSession`, launches no owner route or command, and returns focus to its toggle. Rerun from Settings does not erase completed owner work. Browser/app/Client/Server/network round trips return to the initiating stage only when `expected_revision`, `continuation_generation`, and target identities still match. A stale return is rejected and shown as `This setup changed. Review the latest state.` No browser/route Back or breadcrumb chrome is added; the existing typed `Back` control changes only the bounded Onboarding stage/owner-branch presentation.

### Typed actions, persistence, and owner routing

The thirteen typed local UI action IDs remain `ui.onboarding.start`, `ui.onboarding.next`, `ui.onboarding.back`, `ui.onboarding.close`, `ui.onboarding.skip`, `ui.onboarding.defer`, `ui.onboarding.open_details`, `ui.onboarding.more_ways`, `ui.onboarding.choose_simple_path`, `ui.onboarding.open_owner_flow`, `ui.onboarding.run_automatic_preparation`, `ui.onboarding.choose_first_project`, and `ui.onboarding.finish`. `ui.onboarding.choose_simple_path` is a current visible action at the current `simple_path` stage. Choice and navigation actions before review change only the local draft. `ui.onboarding.open_owner_flow` may dispatch setup owner work only from a current confirmed `review_setup_plan` revision, and `ui.onboarding.run_automatic_preparation` may begin only for that confirmed plan. No `cmd.onboarding.*` family is created. The packet candidate command tokens remain rejected as commands, aliases, and handlers.

`OnboardingSession`, `OnboardingReturnContext`, `OnboardingActionRequest`, `OnboardingActionResult`, and `OnboardingLegacyMigrationReceipt` are consumed from the product-onboarding machine contract. The session and continuation preserve the chosen `path_kind=guided_setup|connect_existing`, all nine current stage IDs, the exact six-stage shortcut, local Safe History and optional online-copy selections, review revision and confirmation state, and owner truth/receipts after dispatch. A request binds one typed action to its action instance, current path and stage, expected revision, continuation generation, bounded choice, normalized secret-free local context, actor, idempotency key, source surface, and return-focus identity. Before a matching review confirmation, any request carrying an owner route or external-work intent is rejected with no dispatch or write beyond the local draft. Whole-session Skip remains distinct from an optional Project or Remote Access choice.

Every inline SVG `?` explanation control reuses `ui.onboarding.open_details`; no tooltip-only, untyped click, or new help command is created. Stage Details uses `intent=toggle_stage_details`, `scope=null`, and `selection_ref=null`. Choice help uses `intent=toggle_choice_explanation`, `scope=<exact current stage>`, `selection_ref=<stable help_topic_id>`, and exact `expanded=true|false`. Both forms are ephemeral, same-stage, owner-route-free, non-persistent, keyboard reachable, and accessibility-linked to the option they explain. Help copy uses familiar examples and explains local Safe History, Git, Jujutsu, online copies, accounts, Servers, and Remote Access without assuming prior coding or IDE knowledge.

The canonical result is `pm.product_onboarding.action_result.v1`; it returns `applied|disabled|rejected`, exact before/after stage and session status, one closed local effect, whether the draft was written, an optional continuation snapshot, ephemeral Details state, optional post-review owner route/operation refs, error/disabled reason, focus return, revision, and continuation generation. Pre-review results require `owner_mutation_claimed=false`, no owner route, and no production receipt. Disabled and rejected results have `local_effect=none`, dispatch no owner route, carry no production receipt, and expose an exact error plus disabled reason. Applied `defer` requires the durable continuation write; applied `open_details` remains same-stage and non-persistent.

Automatic Preparation consumes one closed `pm.product_onboarding.automatic_preparation_owner_projection.v1` record rather than a page timer, synthetic checklist, or inferred percentage. The projection additionally binds the exact confirmed review revision and approved setup-plan hash. The accepting boundary independently compares every fence identity; an unconfirmed, stale, expanded, or mismatched plan cannot dispatch, replace the last accepted state, or advance the stage. Determinate progress requires an owner denominator and named progress source; otherwise the UI remains indeterminate and exposes no fabricated percentage. `ready` advances only after current accepted owner projections truthfully settle the confirmed plan. Close, Defer, resume, reload, and view changes preserve the same owner operations and observe them by dedupe key; retry re-observes rather than starts duplicates. Browser-concept fixtures never claim production owner work, readiness, native execution, or a production receipt.

Durable state stores only stable identities, owner refs, path, stage, local draft selections, decisions, review revision/confirmation/hash, continuation generation, bounded warnings, receipt refs, and layout/tour handoff refs. It stores no raw transcript, key, token, authentication URL/code, credential, profile root, broad local path, or protected authentication content. The one-time domain migration receipt references the canonical storage migration receipt and reports exact accepted, stale, dropped, quarantined, per-stage, and per-path counts with `owner_work_replayed=false`. Legacy four-screen/provider-first, five-stage, and superseded seven-stage records migrate by preserving completed decisions and receipts, mapping unresolved work to the first applicable current stage, and forcing review of the resulting draft; migration never auto-confirms review or replays owner work. The predecessor meaning of `simple_path` as non-current is retired: a compatible saved choice now maps to the current stage, while ambiguous rows remain warnings.

Owner routes remain strict across both phases: before review confirmation, Onboarding may request only owner-defined read-only Server endpoint discovery/projection and consume cached/already-detected owner state; this phase neither authenticates nor changes the discovered system, network, account, repository, route, or local machine and performs no live repository lookup. After confirmation, approved First Project, Safe History/online copy, Server/Storage/Client, Remote Access, restore, provider, and authentication intents dispatch only through their canonical owners, and `automatic_preparation` observes their `ObservableWork`, terminal results, and receipts. No choice silently dispatches state-changing work, and no second generic confirmation is synthesized after review. Onboarding never implements installer, package manager, pairing authority, history engine, online-service adapter, account creation, authentication broker, secret store, storage, route supervision, Project movement, backup/restore, update, health, or repair behavior.

### Motion, responsiveness, Slint portability, and accessibility

The motion storyboard is restrained and cinematic: the interruptible opening hero assembles the Puppet Master identity into the workspace and settles once in approximately `1.2-1.5 seconds`; step transitions use `420-560 ms`; element choreography uses a `60-80 ms` stagger; microinteractions use `120-220 ms`; and the success moment settles in approximately `700 ms`. These durations describe visual completion only: every action acknowledges in the same frame, input is enabled immediately, and navigation never waits for animation. Use bounded opacity, translation, scale, clipping/masking, and vector layers with continuity of position and visual focus between stages. All transitions are interruptible, reversible, resize-safe, theme-switch-safe, and finish immediately at the correct semantic state on navigation, suspension, or interruption. The outgoing visual layer is always inert, stripped of duplicate IDs, and excluded from the focus census while it animates. Friendly, Basic, and Glass use distinct material-appropriate cinematic easing; Retro uses dedicated deliberate stepped opacity/translation keyframes, hard cuts, and compact pixel/terminal-style reveals without scale choreography. Decorative work stops when hidden/off-screen. Reduced Motion uses an immediate state change or a very short opacity settle while preserving hierarchy; low-resource mode removes ambient/prewarm work without removing choices or receipts. These essentials must be portable to Slint 1.17.1 properties, models, timelines, transforms, opacity, vector shapes, and clipping; DOM measurement, browser physics, Canvas/WebGL, heavy SVG filters, or blur-dependent storytelling cannot be required.

Every stage has a programmatic heading, path-correct progress text (`Step n of 9` or `Step n of 6`), concise description, one primary action, keyboard-reachable secondary action, persistent Back/Close/Escape semantics, visible focus, non-color state, and an announcement for async phase changes. Focus never moves because a background projection refreshes. Long/localized copy wraps without clipping; narrow layouts stack visually distinct choices while preserving primary-before-secondary order. A screen reader receives stage, decision, review-confirmation boundary, current owner work, wait reason, errors, and return outcome without decorative narration. Inline SVG help controls have stable accessible names and descriptions and never rely on hover alone.

### Guided Tour real-application contract

Guided Tour is a directed three-scene beginner film in this exact order: Usage -> Planning Wizard -> Assistant Chat/Teacher. It runs in the real application, never a tooltip carousel or parallel demo. The top tour controls contain an `ELI5` toggle beside `Pause` and `Skip Tour`. The opening Usage moment calls out ELI5 and Reduced Motion together: ELI5 changes explanation detail, while motion always honors the effective accessibility preference. The copy explains that Reduced Motion can be changed later in Settings; Guided Tour MUST NOT invent a separate Reduced Motion toggle or require another navigation step.

The current scene IDs are `usage`, `planning_wizard`, and `chat_teacher`. The superseded five-chapter order used `chat_teacher`, `shell_navigation`, `panel_layout`, `widget_workspace`, and `planning_wizard`; those old ordering and chapter-boundary semantics are migration/source-lineage only, while the reused `chat_teacher` ID now names the third scene. In Usage, one Watch beat hides and returns the same real card through observed widget-owner results. The Try beat advances only when the learner opens that card's exact mounted Options control. One compact explanatory note says that the handle moves a card, the corner changes its size, and Options changes or hides it; move, resize, configure, and focus are not separate performed checkpoints. Narration, a timer, generic Next, or a look-alike control cannot fabricate completion. In Planning Wizard, the learner activates the exact highlighted intent chip in the real page; that intent-chip handler result alone advances to the final scene. In Assistant Chat, the layout places Chat at the far right, the learner opens the real guide selector, selects `Teacher`, types a real message into the real composer, and sends it through the real send handler. A deterministic local novice reply in that conversation completes the film with zero provider, model, token, or AI-plan use. The Tour controller never serializes chat content; the real Chat owner owns the message and reply records.

The exact current typed actions are `ui.guided_tour.start`, `ui.guided_tour.next`, `ui.guided_tour.back`, `ui.guided_tour.pause`, `ui.guided_tour.resume`, `ui.guided_tour.skip`, `ui.guided_tour.focus_route`, `ui.guided_tour.toggle_eli5`, `ui.guided_tour.finish`, and `ui.guided_tour.replay`. `ui.guided_tour.focus_route` changes only the mounted application's visible page and focus. `next` and `back` may move through watch-only narration but cannot satisfy a required performed-action checkpoint. `skip` owns the local exit request and invokes exact layout/placeholder/focus restoration through their existing owners; `finish` records the completed local presentation state and keeps Assistant Chat at the far right. The predecessor `ui.guided_tour.restore_layout`, `ui.guided_tour.keep_layout`, and `ui.guided_tour.toggle_reduced_motion` tokens are retired and forbidden in current requests rather than retained as compatibility actions.

At start, Guided Tour captures stable refs for the pre-tour layout and the real composer's exact placeholder. `Skip Tour` is always available; it cancels pending choreography, restores both captured values, returns focus to the restored page heading or initiating control, and does not leave a partial Teacher selection or draft message. Successful completion does not restore the old layout: Assistant Chat remains at the far right. Replay starts a fresh ephemeral session. The Tour controller itself is never persisted or migrated; a process exit during an active tour uses the stable layout-owner snapshot rather than attempting to resume ephemeral scene state.

Every scene heading receives programmatic focus when that scene settles. Each callout measures its actual target after layout, clamps the callout and pointer to the usable viewport, and remeasures after page change, resize, scaling, localization, panel movement, or target geometry change. A missing or unreachable target pauses with a plain recovery action instead of pointing at empty space or auto-completing. Callouts do not steal focus from the heading or the learner's required control. Protected authentication content is excluded.

Tour motion retains bounded interruptible focus reveals and the single card hide/return demonstration. Any user action, resize, reversal, Skip, route return, or effective preference change lands deterministically in the correct semantic state. With Reduced Motion effective, the same scenes and action checkpoints use focus/ring/state changes with no travel animation. The tour runs locally with no provider and on low-resource or squeezed layouts; it pauses rather than hiding an unreachable target.

Acceptance requires positive and negative fixtures for the exact nine-stage primary order and exact six-stage connect-existing order; a current visible `simple_path`; the hard no-side-effect-before-current-review-confirmation fence plus bounded pre-Review read-only discovery/projection; current-review one-dispatch behavior; migration of four-screen, five-stage, and superseded seven-stage records without auto-confirmation or replay; path-correct progress; no-secret persistence; keyboard/screen-reader/focus tests; six-width and eight-theme rendering; interruption/reversal/resize tests; and truthful Ready semantics. Tour acceptance requires the exact Usage -> Planning Wizard -> Assistant Chat/Teacher scene order; explicit retirement of the five-chapter sequence; top ELI5/Pause/Skip placement and the early ELI5/Reduced Motion explanation; Settings-owned motion adjustment with no tour-specific motion toggle; owner-observed Usage hide/return followed by the exact real Options click, the exact Planning intent-chip click, the exact guide-selector and Teacher choices, a real-composer send, and a deterministic novice reply; measured/clamped/remeasured callouts; focused scene headings; Skip restoration of layout, placeholder, and focus; and completion with Chat at the far right. Static schemas, fixtures, and browser concepts are not native runtime or visual-acceptance proof.

### PWIZ-021 - Product Onboarding nine-stage state machine and connect-existing shortcut

```yaml
plan_unit_id: PWIZ-021
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  Product Onboarding owns the durable nine-stage
  welcome/simple_path/first_project/source_control_setup/server_storage_client/remote_access_setup/review_setup_plan/automatic_preparation/ready
  path and the exact six-stage welcome/simple_path/remote_access_setup/review_setup_plan/automatic_preparation/ready
  connect-existing shortcut. Pre-review choices update the local draft and may consume cached owner data, nearby/known
  Server endpoint projections, already-detected account/session status, and explicitly non-authenticating read-only
  discovery. Pairing, authentication, live repository lookup/creation/binding, restore execution, Server/network
  configuration, filesystem writes, and every other side effect remain deferred until the user confirms the current
  Review Setup Plan.
  Automatic Preparation then dispatches the approved
  plan once through canonical owners and observes real results and receipts. Visible copy remains concise and novice-safe,
  while internal implementation terms stay in plain-language Details. The superseded seven-stage flow is source lineage.
gui_related: true
gui_classification_reason: Defines the complete visible first-run flow, branching, copy density, actions, and state presentation.
depends_on: [SIR-003, PSB-001, SRV-001, SRV-004, RAS-001, BRS-001, PJCT-001, SCS-011]
unblocks: []
acceptance_criteria:
  - The nine exact stage IDs and order are `welcome`, `simple_path`, `first_project`, `source_control_setup`, `server_storage_client`, `remote_access_setup`, `review_setup_plan`, `automatic_preparation`, and `ready`.
  - The connect-existing shortcut is exactly `welcome`, `simple_path`, `remote_access_setup`, `review_setup_plan`, `automatic_preparation`, and `ready`; it omits, rather than silently executes, the three ordinary-path setup stages.
  - "`simple_path` and `ui.onboarding.choose_simple_path` are current visible behavior; their predecessor-only disposition is retired."
  - The four-screen/provider-first, five-stage, and seven-stage flows are migration/source lineage only and cannot drive current GUI order, stage counts, or progress text.
  - Before the current `review_setup_plan` revision is confirmed, choices perform local draft transitions and may consume cached owner data, already-detected account/session status, known endpoint projections, and owner-defined read-only Local/VPN or already-active Tailscale discovery that performs no authentication and changes no external state.
  - Installation, authentication, pairing, trust, restore, Project creation/open/registration, local-history setup, online-copy setup, Server, storage movement, Remote Access, provider, update, and all other external work remain deferred until review confirmation.
  - "`Confirm and prepare` validates the path, revision, choices, consequences, and approved-plan hash, then dispatches the approved work once; stale, unconfirmed, or expanded plans dispatch nothing."
  - First Project, Safe History/optional online copy, where-work-lives, Remote Access, restore, and provider work execute only through their canonical owners after confirmation.
  - Safe History is explained as recoverable versions on the selected work computer; an online copy is separately explained and optional, with implementation names confined to Details.
  - A remote protected-auth handoff opens and returns only through the initiating active Client; missing, inactive, disconnected, or mismatched Client identity blocks or interrupts it.
  - Automatic Preparation accepts only current owner projections bound to the confirmed review revision and approved-plan hash; it never synthesizes work, progress, results, receipts, or readiness.
  - Determinate progress requires an owner denominator and named progress source; resume/reload preserves owner operation identities and retry observes existing work instead of launching a duplicate.
  - Every Onboarding control emits one typed local UI action; no `cmd.onboarding.*` semantic command or generic Onboarding mutation handler exists.
  - Defer preserves exact path/stage/draft/review/history/focus continuation, Close is non-completing, Skip records an explicit skipped session, and Details is ephemeral and owner-work-free.
  - Disabled or rejected outcomes dispatch and persist no owner work, carry no production receipt, and expose one plain-language reason.
  - Reaching Ready never asserts skipped or failed owner readiness.
  - Guided Tour is secondary and optional and follows PWIZ-023's three-scene contract.
validation_surfaces: [Plans/product_onboarding_contracts.schema.json, Plans/product_onboarding_contract_fixtures.json, Concepts/pm7-tools/onboarding_cinematic_source.py static assertions, Concepts/pm7-tools/verify/onboarding_cinematic.mjs browser-concept verifier, future native owner-routing and migration negative fixtures]
risk_class: onboarding_parallel_owner_or_overloaded_first_run
reasoning_tier: high
context_scope: product_onboarding_owner_and_flow
implementation_surfaces: [Plans/Planning_Wizard.md, Plans/product_onboarding_contracts.schema.json]
node_compile_hint: {mode: product_onboarding_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "source_report:register-settings-onboarding.md#1E"
  - "source_report:register-fullthread.md#R-063"
negative_constraints: [Do not create an onboarding-only backend., Do not expose more than two prominent choices., Do not restore a provider-first gate or the superseded seven-stage path., Do not hide or bypass the current simple_path or review_setup_plan stage., Do not authenticate, pair, enroll, perform a live repository lookup/create/bind, execute a restore, configure a Server or network, write a filesystem, or dispatch any other side effect before current review confirmation; do not misclassify bounded read-only Server discovery/projection as a side effect., Do not conflate local Safe History with an optional online copy., Do not expose unexplained source-control or developer jargon in primary copy., Do not use or mint cmd.source_control.repository.init., Do not add repeated confirmation after review., Do not synthesize Automatic Preparation work/progress/readiness from time or UI state., Do not register cmd.onboarding.* commands or packet candidate aliases/handlers., Do not turn the modal into a full-page route or add browser-style Back/breadcrumb chrome., Do not store secrets or protected authentication content., Do not claim native/runtime or visual proof from fixtures, static gates, or browser evidence.]
```

### PWIZ-022 - Product Onboarding motion, accessibility, and migration

```yaml
plan_unit_id: PWIZ-022
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: Product Onboarding uses one bounded modal window over the visibly preserved live application, bounded interruptible Slint-portable motion, deterministic Reduced Motion and low-resource equivalents, exact path-correct progress and keyboard/focus/Back/Close/Escape semantics, no-secret revisioned persistence, and receipt-backed migration from legacy provider-first, five-stage, and superseded seven-stage records without auto-confirming Review or replaying owner mutations; it never becomes a full-page route or nested-modal owner branch.
gui_related: true
gui_classification_reason: Defines user-visible motion, responsive layout, focus, copy, error, resume, and migration behavior.
depends_on: [PWIZ-021]
unblocks: []
acceptance_criteria:
  - The setup flow remains one bounded modal with explicit outer margin, modal chrome, an input-blocking scrim that also inerts late-mounted body siblings, exactly one dialog accessibility surface named by the active stage or branch, an inert/ID-clean outgoing visual layer, focus containment, and exact initiating-control return (or verified active-application-tab return for automatic first-run open) across desktop, narrow, and short windows.
  - Progress and accessibility announcements use the exact active path denominator: nine for guided setup and six for connect existing.
  - Close dismisses without completion, Skip records an explicit skipped session, Defer persists the exact resumable continuation before dismissal, and Details remains an ephemeral same-stage disclosure with no owner command.
  - The modal adds no route-history or breadcrumb chrome; typed Back remains local to its bounded stage/branch presentation.
  - The approximately `1.2-1.5 second` hero, `420-560 ms` step transitions, `60-80 ms` choreography stagger, `120-220 ms` microinteractions, approximately `700 ms` success settle, same-frame acknowledgement, interruption, reversal, resize, theme-switch, Retro stepped treatment, and reduced-motion settle are deterministic; the modal entrance keeps its layout bounds fixed and uses opacity/clipping so cross-family theme changes cannot push it outside the required outer margin.
  - Focus and screen-reader output follow semantic stage state and never background refresh order; the modal releases inertness before Guided Tour starts, and a failed Tour start restores the transferred application focus target without claiming a successful handoff.
  - Legacy migration preserves decisions, warnings, and valid owner receipts, maps unresolved work into the nine-/six-stage draft, requires an unconfirmed Review Setup Plan, and never reruns owner work.
  - The one-time domain migration receipt references the canonical storage migration receipt and reports exact accepted, stale, dropped, quarantined, per-stage, and per-path counts without storing secret bytes.
validation_surfaces: [Concepts/pm7-tools/onboarding_cinematic_source.py static assertions, Concepts/pm7-tools/verify/onboarding_cinematic.mjs browser-concept verifier, future native six-width visual fixtures, Reduced Motion traces, keyboard and screen-reader fixtures, legacy migration fixtures]
risk_class: onboarding_motion_or_resume_state_loss
reasoning_tier: high
context_scope: onboarding_presentation_and_persistence
implementation_surfaces: [Plans/Planning_Wizard.md, Plans/product_onboarding_contracts.schema.json]
node_compile_hint: {mode: onboarding_presentation_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "source_report:wave3-lane2.md#S0098"
negative_constraints: [Do not block input on animation., Do not require browser-only effects., Do not overwrite saved Project or application layout., Do not migrate any predecessor record directly into confirmed Review or Automatic Preparation.]
```

### PWIZ-023 - Guided Tour directed three-scene beginner film

```yaml
plan_unit_id: PWIZ-023
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  Guided Tour is the secondary optional Onboarding handoff and a directed three-scene beginner film in exact Usage,
  Planning Wizard, Assistant Chat/Teacher order. Usage watches the same real card hide and return, then advances only
  from its exact mounted Options control; move, resize, change, and hide are explained together rather than becoming
  separate performed checkpoints. The highlighted Planning intent chip advances next. The final scene requires the
  real guide selector, Teacher selection, and a real-composer message producing a deterministic novice reply in that
  conversation. ELI5 is a top toggle beside Pause and Skip and is introduced early with Reduced Motion; motion honors
  the effective Settings-owned preference. Callouts measure and clamp targets, scene headings receive focus, Skip
  restores the pre-tour layout, placeholder, and focus, and completion keeps Chat at the far right. The superseded
  five-chapter behavior and restore-or-keep action pair are source lineage only.
gui_related: true
gui_classification_reason: Defines the visible three-scene film, performed real-application interactions, motion, controls, callouts, focus, and exit state.
depends_on: [PWIZ-021, ACD-431]
unblocks: []
acceptance_criteria:
  - The exact scene order is `usage`, `planning_wizard`, `chat_teacher`; the former five-chapter ordering and its Chat-first/final-Planning behavior are retired to source lineage.
  - The top controls place `ELI5` beside `Pause` and `Skip Tour`, and the early Usage callout explains ELI5 and Reduced Motion together.
  - Reduced Motion uses the effective preference; adjustment routes to Settings and there is no Guided Tour-specific motion toggle.
  - Usage Watch observes owner-confirmed hide and reveal of the same targeted real card; Try advances only from opening that card's exact mounted Options control, while move, resize, change, and hide remain one compact explanatory note rather than separate action gates.
  - Planning Wizard advances only from the handler result for the exact highlighted intent chip.
  - Assistant Chat is placed at the far right; the learner selects Teacher and sends a real message in the real composer before the deterministic novice reply completes the film.
  - The deterministic novice reply never silently falls back to a provider, model, token, or AI plan.
  - Every scene heading receives programmatic focus, and every callout measures, clamps, and remeasures its actual target across resize, scale, localization, movement, and route changes.
  - Skip is always available and restores the exact pre-tour layout and composer placeholder with no partial draft; successful completion keeps Chat at the far right and offers no restore-or-keep choice.
  - The Tour controller is ephemeral and never persists chat content; stable layout refs and records owned by real surfaces may outlive it.
  - Reduced Motion, low-resource, missing-target, squeezed-layout, interruption, process-exit, and replay states are covered.
validation_surfaces: [Plans/guided_tour_contracts.schema.json, Plans/guided_tour_contract_fixtures.json, real-application action observation, callout geometry, focus, Skip-restore, and completion-layout fixtures]
risk_class: tour_fake_shell_or_layout_loss
reasoning_tier: high
context_scope: guided_tour_three_scene_real_application
implementation_surfaces: [Plans/Planning_Wizard.md, Plans/guided_tour_contracts.schema.json]
node_compile_hint: {mode: guided_tour_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "source_report:register-settings-onboarding.md#O-07"
  - "source_report:wave3-lane2.md#S0095"
negative_constraints: [Do not restore the five-chapter or Chat-first tour., Do not require separate Usage move resize configure or focus checkpoints., Do not restore ui.guided_tour.restore_layout or ui.guided_tour.keep_layout as current actions., Do not build a tooltip carousel or parallel demo., Do not use provider credentials or tokens., Do not fabricate action success., Do not add a Guided Tour-specific Reduced Motion toggle., Do not let callouts escape the viewport or point at stale geometry., Do not restore the old layout after successful completion., Do not leave a partial composer draft after Skip., Do not expose protected authentication content., Do not promote local page/focus presentation into a domain command or handler.]
```

## Product Onboarding route-and-review correction addendum - 2026-09-01

PWIZ-024 supersedes only the conflicting choice-density, hidden-project-route, and generic connect-existing wording in
PWIZ-021 and the preceding Product-design law. The nine-stage guided path, six-stage connect-existing shortcut, typed
local action vocabulary, Review confirmation fence, and retained owner boundaries remain unchanged.

### PWIZ-024 - Visible project routes, independent placement, and live reviewed setup draft

```yaml
plan_unit_id: PWIZ-024
unit_type: integration_contract
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  Product Onboarding exposes all four First Project entry routes together: Start a new project, Open a folder here,
  Bring one from online, and Restore a backup. It records Server, Storage, and this Client as independent choices;
  records local Git or Jujutsu Safe History independently from optional forge hosting; and keeps FileSafe complementary.
  Connect existing chooses a connection route before discovery, identity selection, and pairing. The local draft and
  Review summary update immediately and may consume cached owner data, nearby/known Server endpoint projections,
  already-detected account/session status, and explicitly non-authenticating read-only discovery. Authentication,
  pairing, live repository lookup/creation/binding, restore execution, Server/network configuration, filesystem mutation,
  and every other side effect wait for confirmation of the current Review revision. Setup-later remains a valid
  resumable outcome.
gui_related: true
gui_classification_reason: Defines the visible First Project choices, connect-existing order, editable live Review projection, and defer behavior.
depends_on: [PWIZ-021, SCS-012, FGI-011, RAS-014]
unblocks: []
acceptance_criteria:
  - The First Project stage shows four equal, aligned, keyboard-reachable routes at once — `new`, `existing_local`, `existing_online`, and `restore`; no More/Other Project Choices disclosure hides any route.
  - Open a folder here supports a local folder, an OS-mounted SMB/NFS location, or Advanced SSH transport; Restore a backup uses its own backup source and transport and never reuses the ordinary folder path by implication.
  - Server (where work runs), Storage (where files live), and Client (the device in hand) remain independent selections; mounted, SMB, NFS, and SSH storage choices do not force Server or Client identity.
  - Local Safe History explicitly selects Git or Jujutsu without an account; FileSafe is an independent complementary safeguard; an online copy is optional and requires a verified forge account plus an explicit repository binding.
  - Cursor Origin is a real eligible hosted Git destination in `Bring one from online` and optional online-copy setup, with Private or Internal visibility only; it is never rendered as a no-host or no-repository pseudo-option.
  - The connect-existing stage first records one of four routes — Local or VPN, Tailscale with hosted or Headscale control, Reverse proxy, or Puppet Master Remote Link; bounded read-only discovery may project candidate endpoints before Review, while identity verification and pairing by approval, code, or QR remain owner-controlled work after confirmation.
  - No visible `I recognize this Puppet Master` checkbox exists; verified Server identity plus the Server-owned pairing/trust result is the only recognition boundary.
  - The Review summary is a live projection of the exact current draft, including edits, skips, destinations, transport, privacy, account/repository binding, pairing method, deferred items, and setup consequences.
  - Before the current Review revision is confirmed, Onboarding performs local draft writes and may consume cached owner data, already-detected account/session status, known endpoints, and owner-bounded read-only LAN/VPN or active-tailnet discovery; no sign-in, enrollment, pairing, trust grant, protected account verification, live repository lookup/create/bind, filesystem mutation, restore execution, Server/Storage/network change, or Remote Access mutation occurs.
  - The Do this later action remains available from every non-terminal stage and persists the exact resumable continuation; optional Remote Access may be Not now on guided setup, while connect-existing may defer the session but cannot claim Ready without a usable reviewed route plan.
  - Confirmation dispatches only owner-defined operations and observes owner results; this PlanUnit creates no `cmd.onboarding.*` command, provider adapter, discovery engine, pairing authority, transport engine, or repository engine.
validation_surfaces: [Plans/product_onboarding_contracts.schema.json, Plans/product_onboarding_contract_fixtures.json, Concepts/pm7-tools/onboarding_cinematic_source.py static assertions, future native four-route, live-review, defer/resume, and pre-review no-effect fixtures]
risk_class: onboarding_hidden_route_or_pre_review_side_effect
reasoning_tier: high
context_scope: onboarding_setup_plan_semantics
implementation_surfaces: [Plans/Planning_Wizard.md, Plans/product_onboarding_contracts.schema.json, future Product Onboarding native controller]
node_compile_hint: {mode: onboarding_setup_plan_projection_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [user-correction:2026-09-01-onboarding-route-review-semantics, Plans/product_onboarding_contracts.schema.json, Concepts/pm7-tools/onboarding_cinematic_source.py]
preserved_exact_tokens: [Start a new project, Open a folder here, Bring one from online, Restore a backup, Local or VPN, Reverse proxy, Puppet Master Remote Link, Do this later]
negative_constraints:
  - Do not hide a First Project route behind More or Other Project Choices.
  - Do not conflate Server, Storage, Client, project-source transport, or restore transport.
  - Do not conflate local Safe History, FileSafe, and optional forge hosting.
  - Do not mutate network, authentication, owner, repository, filesystem, or trust state before Review confirmation.
  - Do not add a recognition checkbox or claim reachability establishes trust.
  - Do not create new commands, handlers, owner engines, or runtime-readiness evidence in Onboarding.
```

## Forge/Backup/tsnet Product Onboarding consumer addendum - 2026-09-01

PWIZ-025 preserves PWIZ-021/PWIZ-024's exact nine-stage guided path, exact six-stage connect-existing path, and
Review/Apply fence. Fresh Full Server recovery is a Bootstrap preflow outside both Product Onboarding stage enums; it
does not turn `Restore a backup` into a hidden pre-Review mutation or add a tenth Product stage.

### PWIZ-025 - Bootstrap recovery, connector phases, and forge parity

```yaml
plan_unit_id: PWIZ-025
unit_type: integration_contract
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  After safe local Server claim, Bootstrap may offer one `restore_existing_pm_data` branch that invokes the
  Backup/Restore owner's protected fresh-recovery flow before Product Onboarding begins. Product Onboarding keeps its
  exact nine/six stage graphs and its `Restore a backup` First Project route as Project restore; after a confirmed plan
  creates or opens the first Project, it may project optional backup-destination setup and Recovery Kit confirmation.
  Remote Access setup consumes one Server-owned PM connector operation with typed connector, IPC, identity, control,
  authorization, private-endpoint, and route-test phases instead of package/component install state. Online-copy choices
  consume distinct Forgejo and Gitea provider/instance profiles and independent repository-hosting versus automation
  bindings without probing or mutating them before Review confirmation.
gui_related: true
gui_classification_reason: This unit defines visible Bootstrap recovery choice, onboarding owner phases, provider choices, protected handoffs, progress, exact return, and disabled/error states.
depends_on: [PWIZ-021, PWIZ-024, SRV-013, BRS-012, BRS-013, BRS-014, BRS-016, RAS-015, FGI-012, SCS-013]
unblocks: []
acceptance_criteria:
  - The canonical Product Onboarding graphs remain exactly nine guided stages and six connect-existing stages. `restore_existing_pm_data` is represented outside those enums as a Bootstrap handoff after safe local claim and before Product Onboarding.
  - Bootstrap fresh recovery does not require an old Server Catalog, a prior Project, model/provider authentication, or a new onboarding command family; it uses Backup-owned destination, protected sign-in, Recovery Kit/unlock, immutable snapshot inspection, preview, apply, and recovery receipts.
  - Full Server recovery begins recovery-safe, never auto-runs hooks, push, Goals, schedules, public ingress, or duplicate Server/connector identity, and reaches Product Onboarding only after truthful completion or explicit decline/defer.
  - "`Restore a backup` in `first_project` remains a Project restore intent. It writes only the local draft before Review, dispatches only after confirmation, and never aliases the Bootstrap full-recovery branch."
  - Optional destination setup and Recovery Kit confirmation appear only after the confirmed owner work has established the first Project. They route Backup-owned protected operations and never expose key bytes, claim PM escrow, or mark acknowledgement as recovery proof.
  - The visible Tailscale card uses exact copy `Tailscale` / `Built into Puppet Master`, with normal `Not connected` and `Set Up`; no install, package, daemon, sidecar, Serve-toggle, WSL, or already-authenticated-host-profile prerequisite appears.
  - Hosted connector work projects the durable Server-owned phases Starting Puppet Master connection, Opening Tailscale sign-in, Waiting for authorization, Waiting for device approval, Creating private address, Testing web UI, API, and live connection, and Ready; cancel, denial, expiry, device approval, reauth, crash, corruption, mismatch, and route failure remain distinct.
  - Self-hosted Headscale collects the owner-approved control URL and protected enrollment method, never offers Funnel, and reports certificate/version/reachability/registration capability truth independently.
  - The Server-owned connector authorization/setup operation survives refresh, Client loss, and Client change. Protected browser contents, cookies, codes, and credentials remain bound to an authorized current Client handoff and are never inherited by another Client merely because the durable operation continues.
  - Connect-existing remains route-first and pre-Review activity remains cached or explicitly bounded read-only discovery. Connector authorization, endpoint mutation/test, Server identity verification, and pairing happen only after Review confirmation and return to the exact originating row/focus/generation.
  - "`Bring one from online` and optional online copy expose Forgejo and Gitea as separate forge provider/instance choices with exact custom endpoint/trust/account identity. Repository hosting and automation binding may differ; Git-ready/API-unavailable stays a valid truthful plan and never fabricates Actions."
  - No command or EventRecord family is created here. Consumed packet commands remain handler_unavailable and event-silent with expected_event_types=[] until owner and central integration exist; concept/static state never proves owner work, native Slint execution, provider readiness, recovery, or security.
validation_surfaces:
  - Plans/product_onboarding_contracts.schema.json
  - Plans/product_onboarding_contract_fixtures.json
  - Plans/backup_restore_system_contracts.schema.json
  - Plans/remote_access_system_contracts.schema.json
  - Plans/forge_integration_contracts.schema.json
  - future pre-Bootstrap recovery/no-old-Catalog/no-provider-auth fixtures
  - future exact nine/six census and pre-Review no-effect fixtures
  - future connector refresh/Client-loss/protected-handoff and Forgejo/Gitea parity fixtures
risk_class: onboarding_stage_drift_or_pre_review_owner_effect
reasoning_tier: high
context_scope: product_onboarding_cross_owner_handoffs
implementation_surfaces: [Plans/Planning_Wizard.md, future Product Onboarding and Bootstrap projection controllers]
node_compile_hint: {mode: onboarding_cross_owner_consumer_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md#4.2
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_forge_reconciliation.md#onboarding-schema-and-fixtures
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_tsnet_reconciliation.md#product-onboarding
  - packet:03_ORIGIN_FORGEJO_GITEA_AND_PROVIDER_PROFILES.md#FORGE-004
  - packet:10_RESTORE_BROWSE_RETRIEVE_GUI_AND_SAFETY.md
  - packet:12_BACKUP_SETTINGS_ONBOARDING_DOCTOR.md#BGUI-004
  - packet:tsnet/04_GUI_ONBOARDING_DOCTOR_DELTAS.md
preserved_exact_tokens: [restore_existing_pm_data, Restore a backup, Tailscale, Built into Puppet Master, review_setup_plan, automatic_preparation, Forgejo, Gitea, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - Do not add, remove, or reorder a Product Onboarding stage.
  - Do not run recovery, connector, forge, account, repository, filesystem, Server, pairing, trust, or route mutation before confirmed Review.
  - Do not model the PM connector as a full Tailscale install, host daemon, sidecar, WSL node, Project node, or reusable host session.
  - Do not merge Bootstrap Full Server recovery with the Product Project-restore route.
  - Do not conflate Forgejo with Gitea or repository hosting with automation binding.
  - Do not expose protected authentication or Recovery Key content in durable Onboarding state, recordings, logs, Chat, Usage, or agent context.
  - Do not claim native/runtime/provider/recovery/security completion from Plans, schemas, fixtures, or PMConcept7.
owner_boundary_notes:
  - Planning Wizard owns Product Onboarding orchestration, local draft/session/continuation, and owner projection; Server Claim/Bootstrap, Backup/Restore, Remote Access, Source Control/Forge, and auth owners retain effects and truth.
owner_hints: [Plans/Planning_Wizard.md, Plans/Server_System.md, Plans/Backup_Restore_System.md, Plans/Remote_Access_System.md, Plans/Forge_Integrations.md, Plans/Source_Control_System.md]
```
