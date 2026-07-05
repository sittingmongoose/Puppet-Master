# Planning Wizard

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. This document is compiled from bootstrap ledger `pldg-20260618-001-prd-planning-wizard`; the ledger remains source-lineage memory, while this live Plan doc is canonical after compilation.

> **PlanProfile:** New Plan Authoring Profile

## 0. Scope

Planning Wizard is the finished-product planning workspace that consumes an Approved PRD Pack, normalized requirements input, or structured Assistant Chat seed and turns it into implementation-ready Plans, a Final Plan Pack, and an ApprovedPlanPack suitable for Plan Compile after explicit `Approve And Build` approval.


## 1. Ownership And Consumers

Planning Wizard owns PlanningRun, topic graph, topic agents, topic-scoped ledger work, Planning Context Capsules, topic conversion and audits, final integration, Planning Amendments, compile readiness, ApprovedPlanPack authority, Planning Wizard GUI states, and the Approve And Build transition. It consumes PRD Builder, Assistant Chat, Goal Runtime, Plan Document System, Plan To Node Compilation, Automated Testing, Executor, Contracts, source-control, permissions, Final GUI, Orchestrator, and HITL contracts without owning low-level runtime execution after Executor activation.


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
canonical_text: 'Planning Wizard derives an initial topic graph from the input pack, project/repository context, work intent, risk, and known defaults rather than enforcing a fixed list of sections. Possible topics include overview, product behavior, GUI or UX, backend, data, integrations, security, permissions, testing, deployment, migration, observability, and risks, but actual titles and scope are evidence-driven. The controller can add, split, merge, rename, defer, reopen, reorder, and mark topics impacted, recording the reason, source refs, dependencies, user-visible origin, and resulting invalidations. The GUI suggests a next topic and conversational sequence while the underlying topic map preserves dependencies and allows safe navigation, reopening, and parallel background work.'
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
canonical_text: 'After required topics are Ready, a fresh Overseer agent reconciles topic drafts into a coherent Final Plan Pack, resolves duplicates and owner boundaries, and computes cross-topic dependencies, consistency, and compile readiness. Final planning review uses the shared live document preview, selection context menu, comments, source inspection, challenge, targeted revision, and annotation status system used by PRD Builder. Planning topics may accept uploaded reference images and generate wireframes, architecture diagrams, data-flow diagrams, state diagrams, or visual references through the existing image system, with artifact IDs, provenance, topic links, version, and status. Images are supporting references; any requirement, decision, constraint, flow, or acceptance implication introduced by an image must also be written into the planning ledger and canonical Plan text.'
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
canonical_text: 'The Planning Wizard final approval button and command label is exactly Approve And Build. Approve And Build creates a versioned immutable ApprovedPlanPack containing canonical Plan docs, PlanUnit and acceptance-unit snapshots and hashes, source PRD Pack, project-context snapshot, amendments, policies, testing requirements, audit evidence, closure records, readiness report, and planning-ledger lineage references. The ApprovedPlanPack and frozen canonical PlanUnit and acceptance-unit indexes are Plan Compile authority; the Planning Wizard ledger remains source and reasoning lineage rather than executable canon. In the finished-product native runtime contract, ordinary Approve And Build flow immediately creates or resumes exactly one PlanCompileRun and proceeds without a second Start Build confirmation; optional HITL checkpoints are policy exceptions, not the default. During the current bootstrap ledger-to-Plans lane, this remains a product contract and does not launch PlanCompile. After Approve And Build succeeds locally, the application automatically switches to the Orchestrator
  page and opens the Plan Compile tab so the user sees launch reconciliation and compilation starting.'
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
- Plans/UI_Command_Catalog.md
- Plans/Contracts_V0.md
- Plans/Project_Output_Artifacts.md
- Plans/Plan_To_Node_Compilation.md
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
- Orchestrator
- Plan Compile tab
negative_constraints:
- Do not treat mutable planning-ledger projections as the sole Plan Compile authority.
- Do not require a redundant ordinary Start Build confirmation after Approve And Build.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Contracts_V0.md
- Plans/Project_Output_Artifacts.md
- Plans/Plan_To_Node_Compilation.md
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
canonical_text: 'Approve And Build is a compare-and-swap approval transaction over the exact PlanningRun revision, topic map version, ApprovedPlanPack identity, pack version, pack hash, project-context snapshot hash, PlanUnit index hash, acceptance-unit index hash, testing policy hash, and final audit/closure hash that were displayed in the final review. The approval command must carry those currentness inputs and fail closed when any planning state, source pack, project context, topic readiness, audit closure, testing policy, or Plan index input changes between final review and approval. A successful transaction atomically writes approval_cas_receipt, PlanApproved, and PlanCompileRun_created_or_bound, and returns the PlanCompileRun identity synchronously; projection reconciliation may lag, but run identity may not. Duplicate delivery with the same CAS inputs and idempotency key returns the same PlanCompileRun. A stale CAS input routes to bounded revalidation or final-review refresh rather than silently approving a different plan.'
gui_related: true
gui_classification_reason: Approve And Build is a user-visible approval command and launch transition, while the CAS/currentness boundary is runtime contract behavior.
depends_on: [PWIZ-010, PWIZ-012]
unblocks: []
acceptance_criteria:
- The final review shows the exact pack, PlanningRun revision, topic map version, project-context hash, PlanUnit and acceptance-unit index hashes, testing policy hash, and final audit/closure hash used by approval.
- Approve And Build fails closed when any displayed approval input changes before the approval commit.
- Approval writes an approval CAS receipt and synchronously creates or binds exactly one PlanCompileRun identity.
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
negative_constraints:
- Do not approve mutable planning state that changed after final review.
- Do not leave PlanCompileRun identity to eventual projection reconciliation.
- Do not convert stale approval inputs into a successful build launch.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/UI_Command_Catalog.md
- Plans/Plan_To_Node_Compilation.md
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
  views; detailed agent traces and evidence may be expanded without cluttering the default thread tree.'
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

### PWIZ-017 - First-Run Onboarding Entry And Limited Setup Landing

```yaml
plan_unit_id: PWIZ-017
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  After first-run provider setup completes or the user chooses `Skip for now`, Puppet Master opens Planning Wizard as the
  first full app page rather than routing to the dense Home shell, Settings, or Agent Config. Planning Wizard consumes
  structured `onboarding_setup_state` rather than a raw onboarding transcript. When setup was skipped, provider count is
  zero, provider warnings exist, or Health is not Ready, the landing state shows a limited setup reminder using the copy
  `Provider setup is not finished. You can still open Planning Wizard, but assistant features may need a provider before
  they can run.` and provides a `Set up provider` CTA without blocking entry. Planning Wizard may start intake in this
  limited state, but it must preserve provider setup warnings and must not create WorkNodes, NodeSeeds, executable queues,
  implementation files, or runtime/build surfaces as part of the handoff.
gui_related: true
gui_classification_reason: Defines visible Planning Wizard landing behavior, limited setup reminder copy, and CTA presentation.
depends_on: [PWIZ-001, CV-305, F3-411, ACD-431, UCC-106]
unblocks: [WM-041, ATS-020]
acceptance_criteria:
  - Completed first-run setup opens Planning Wizard as the first full app page.
  - Skipped first-run setup also opens Planning Wizard in limited setup state rather than the dense Home shell.
  - Planning Wizard consumes structured onboarding_setup_state and preserves provider setup warnings.
  - Limited setup state shows the accepted provider-unfinished copy and a provider setup CTA.
  - Planning Wizard does not mark Health Ready or launch Plan Compile/WorkNodes because of first-run handoff.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future first-run-to-Planning-Wizard routing fixture
  - future skipped-provider limited-state Planning Wizard fixture
risk_class: planning_wizard_false_ready_handoff
reasoning_tier: high
context_scope: first_run_planning_wizard_landing
implementation_surfaces:
  - Plans/Planning_Wizard.md
  - future Planning Wizard first-run landing state
node_compile_hint:
  mode: first_run_planning_wizard_landing
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
  - Do not route completed first-run onboarding to the dense Home shell by default.
  - Do not route completed first-run onboarding to Settings or Agent Config as the primary destination unless a later correction changes this decision.
  - Do not use the raw onboarding transcript as the sole Planning Wizard handoff.
  - Do not drop provider setup warnings when entering Planning Wizard.
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
  projection, testing evidence, cancellation/restart, and negative-case rejection.
gui_related: true
gui_classification_reason: Defines final-review button enablement and disabled reason behavior in the Planning Wizard GUI.
depends_on: [PWIZ-010, PWIZ-012, PWIZ-014, PNC-019]
unblocks: [UIW-009, PG-060]
acceptance_criteria:
  - Planning Wizard distinguishes Captured, Plan-complete, and Buildable states.
  - Approve And Build is disabled whenever buildability_gate_passed is false.
  - The disabled reason lists currently open blocker families and exact owner docs from Plans/.implementation_readiness/buildability_gate_report.json.
  - PNC-019 appears as a hard disabled reason while node readiness remains blocked_runtime_certification_incomplete.
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
