# PRD Builder

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. This document is compiled from bootstrap ledger `pldg-20260618-001-prd-planning-wizard`; the ledger remains source-lineage memory, while this live Plan doc is canonical after compilation.

> **PlanProfile:** New Plan Authoring Profile

## 0. Scope

PRD Builder is the finished-product planning-intake workspace that creates, normalizes, reviews, versions, and approves PRD Packs before Planning Wizard work begins. It supports conversation-first, import-first, and hybrid requirements capture while preserving exact source lineage, source manifests, conflicts, annotations, readiness, and immutable approval snapshots.


## 1. Ownership And Consumers

PRD Builder owns intake-depth product intent, source ingestion, PRD projection, Approved PRD Pack creation, PRD annotations, and the explicit `Approve PRD for Planning Wizard` handoff. It consumes Assistant Chat, Planning Ledger, Plan Document System, FileSafe, Project Output Artifacts, Contracts, Final GUI, and UI Command contracts without owning implementation planning, Plan Compile, Executor provisioning, WorkNodes, or Orchestrator runtime execution.


## 2. Canonical PlanUnits


### PRDB-001 - PRD Builder Naming, Scope, And Product Boundary


```yaml
plan_unit_id: PRDB-001
unit_type: requirement
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: 'The finished-product feature formerly called Requirements Doc Builder is named PRD Builder everywhere in user-facing UI and canonical product documentation. Requirements documents means arbitrary user-provided source documents; it is not the feature name and may include PRDs, notes, specifications, tickets, diagrams, and poorly formatted source material. PRD Builder captures and normalizes planning-intake product intent; Planning Wizard consumes an approved PRD Pack or normalized requirements input and resolves implementation-ready planning. Plans/bootstrap and Codex ledger-transfer workflows are development tooling for building Puppet Master and must remain distinct from the finished PRD Builder, Planning Wizard, Plan Compile, WorkNode, and Orchestrator runtime. Superseded legacy planning-pipeline experiments are not an authority, dependency, implementation pattern, or product reference for this redesign; use Goal Runtime,
  the current v2 ledger, standardized Plan docs, current Auditor loop, and current Plan Compile contracts.'
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
- PYTHONPATH=/private/tmp/pm-py-deps python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: stale_or_forbidden_behavior
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/PRD_Builder.md
- Plans/FinalGUISpec.md
- Plans/00-plans-index.md
- Plans/Planning_Wizard.md
- Plans/bootstrap/Bootstrap_Planning_Workflow.md
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0001
- pldg-20260618-001-prd-planning-wizard:atom-0003
- pldg-20260618-001-prd-planning-wizard:atom-0004
- pldg-20260618-001-prd-planning-wizard:atom-0005
- pldg-20260618-001-prd-planning-wizard:atom-0006
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/01-naming-and-boundaries.md#SRC-NAMING
source_atom_ids:
- atom-0001
- atom-0003
- atom-0004
- atom-0005
- atom-0006
decision_refs:
- dec-0001
- dec-0002
correction_refs:
- corr-0001
- corr-0003
- corr-0009
preserved_exact_tokens:
- PRD Builder
- Requirements Doc Builder
- requirements documents
- source documents
- planning-intake
- Approved PRD Pack
- implementation-ready planning
- bootstrap workflow
- finished product
- Goal Runtime
- v2 ledger
- Auditor
negative_constraints:
- Do not preserve Requirements Doc Builder as a current product feature name except in explicitly historical migration notes.
- Do not collapse PRD Builder and Planning Wizard into one indistinguishable interview.
- Do not expose bootstrap/Codex workflow artifacts as ordinary product UX or runtime contracts.
- Do not cite, restore, copy, or depend on superseded experimental planning-pipeline stages in canonical product Plans.
owner_hints:
- Plans/PRD_Builder.md
- Plans/FinalGUISpec.md
- Plans/00-plans-index.md
- Plans/Planning_Wizard.md
- Plans/bootstrap/Bootstrap_Planning_Workflow.md
- Plans/Goal_Runtime_System.md
```


### PRDB-002 - Conversation, Import, And Hybrid PRD Creation


```yaml
plan_unit_id: PRDB-002
unit_type: requirement
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: 'A user with no source documents can start in PRD Builder chat; the agent asks discovery questions, updates the PRD ledger every turn, and continuously renders the PRD projection. A user can upload existing requirements material and have PRD Builder preserve, parse, extract, reconcile, and normalize it into the standard PRD and PRD Pack. Uploads and conversation may be combined at any time in one PRD Builder workspace so users can clarify, correct, extend, override, and source newly introduced requirements without restarting.'
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
- PYTHONPATH=/private/tmp/pm-py-deps python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/PRD_Builder.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0017
- pldg-20260618-001-prd-planning-wizard:atom-0018
- pldg-20260618-001-prd-planning-wizard:atom-0019
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/02-prd-builder.md#SRC-PRD
source_atom_ids:
- atom-0017
- atom-0018
- atom-0019
decision_refs:
- dec-0006
correction_refs: []
preserved_exact_tokens:
- conversation-first
- import-first
- normalize
- hybrid
- uploads and conversation
negative_constraints:
- Do not force users to choose permanently between upload and chat.
owner_hints:
- Plans/PRD_Builder.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
```


### PRDB-003 - Discovery Questions And Planning-Intake Boundary


```yaml
plan_unit_id: PRDB-003
unit_type: requirement
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: 'PRD Builder proactively asks enough targeted discovery questions to make product intent complete and testable, including problem, users, goals, scope, non-goals, constraints, success, source authority, risks, assumptions, and uncertainty. Ask questions in digestible batches, use existing ledger answers before asking, avoid repetition, and prefer questions whose answers materially change the PRD. PRD Builder captures what, why, who, scope, constraints, acceptance expectations, risks, assumptions, dependencies, and open questions without pretending to produce implementation-ready plans.'
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
- PYTHONPATH=/private/tmp/pm-py-deps python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/PRD_Builder.md
- Plans/assistant-chat-design.md
- Plans/Plan_To_Node_Compilation.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0020
- pldg-20260618-001-prd-planning-wizard:atom-0021
- pldg-20260618-001-prd-planning-wizard:atom-0022
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/02-prd-builder.md#SRC-PRD
source_atom_ids:
- atom-0020
- atom-0021
- atom-0022
decision_refs:
- dec-0007
correction_refs: []
preserved_exact_tokens:
- targeted discovery questions
- digestible batches
- gap-driven
- planning-intake PRD
negative_constraints:
- Do not re-ask answered questions or overwhelm the user with one giant questionnaire.
- Do not create WorkNodes, implementation sequences, file-edit plans, final architecture contracts, or execution graphs in PRD Builder.
owner_hints:
- Plans/PRD_Builder.md
- Plans/assistant-chat-design.md
- Plans/Plan_To_Node_Compilation.md
```


### PRDB-004 - PRD Ledger, Projection, Structure, And Stable IDs


```yaml
plan_unit_id: PRDB-004
unit_type: requirement
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: 'Every substantive PRD Builder exchange must append an event and update affected PRD atoms, decisions, assumptions, constraints, questions, conflicts, annotations, projections, and handoff state before the turn is complete. The durable PRD ledger is working memory and source lineage; the visible PRD is a versioned human-readable projection of accepted ledger atoms and must not become the only source of truth. The primary PRD contains Summary, Problem or Opportunity, Goals, Users or Actors, Scope, Non-Goals, Functional Requirements, Non-Functional Requirements, UX Expectations, Data or Integration or Environment Constraints, Acceptance Criteria, Assumptions, Risks and Dependencies, Open Questions, and Source Notes. Material functional requirements and acceptance criteria receive stable identifiers such as FR-001 and AC-001, with stable internal atom IDs and source lineage.'
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
- PYTHONPATH=/private/tmp/pm-py-deps python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/PRD_Builder.md
- Plans/Planning_Ledger_System.md
- Plans/assistant-chat-design.md
- Plans/Plan_Document_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0010
- pldg-20260618-001-prd-planning-wizard:atom-0023
- pldg-20260618-001-prd-planning-wizard:atom-0024
- pldg-20260618-001-prd-planning-wizard:atom-0025
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/02-prd-builder.md#SRC-PRD
source_atom_ids:
- atom-0010
- atom-0023
- atom-0024
- atom-0025
decision_refs:
- dec-0004
- dec-0008
correction_refs:
- corr-0004
preserved_exact_tokens:
- after every substantive turn
- ledger_sync_blocked
- PRD ledger
- projection
- Functional Requirements
- Non-Functional Requirements
- Acceptance Criteria
- Open Questions
- Source Notes
- FR-001
- AC-001
negative_constraints:
- Do not defer ledger reconstruction until the end of the conversation.
owner_hints:
- Plans/PRD_Builder.md
- Plans/Planning_Ledger_System.md
- Plans/assistant-chat-design.md
- Plans/Plan_Document_System.md
```


### PRDB-005 - PRD Pack, Approval, Versioning, And Readiness


```yaml
plan_unit_id: PRDB-005
unit_type: requirement
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: 'The default workspace emphasizes one primary PRD while exposing supporting assumptions and constraints, open questions, source traceability, and quality/readiness views without making users manage many equal documents. Approval creates an immutable, versioned Approved PRD Pack containing the primary PRD, accepted PRD-ledger snapshot, source manifest, traceability, assumptions and constraints, open questions, quality report, approval receipt, hashes, and version identity. The PRD Builder final action is labeled Approve PRD for Planning Wizard and creates the immutable handoff snapshot; the Planning Wizard consumes a specific approved version rather than mutable editor state. Edits after approval create a new draft based on the approved version and require a new approval event; previous Approved PRD Packs remain immutable and addressable. PRD Builder exposes Ready, Ready with Warnings, and Blocked based on source extraction,
  required sections, blocking conflicts, annotations, quality findings, and approval-snapshot ability; accepted warnings carry into Planning Wizard.'
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
- PYTHONPATH=/private/tmp/pm-py-deps python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/PRD_Builder.md
- Plans/FinalGUISpec.md
- Plans/Contracts_V0.md
- Plans/Project_Output_Artifacts.md
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0026
- pldg-20260618-001-prd-planning-wizard:atom-0027
- pldg-20260618-001-prd-planning-wizard:atom-0028
- pldg-20260618-001-prd-planning-wizard:atom-0029
- pldg-20260618-001-prd-planning-wizard:atom-0038
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/02-prd-builder.md#SRC-PRD
source_atom_ids:
- atom-0026
- atom-0027
- atom-0028
- atom-0029
- atom-0038
decision_refs:
- dec-0002
- dec-0008
correction_refs: []
preserved_exact_tokens:
- primary PRD
- supporting artifacts
- Approved PRD Pack
- immutable
- versioned
- Approve PRD for Planning Wizard
- successor version
- Ready
- Ready with Warnings
- Blocked
negative_constraints: []
owner_hints:
- Plans/PRD_Builder.md
- Plans/FinalGUISpec.md
- Plans/Contracts_V0.md
- Plans/Project_Output_Artifacts.md
- Plans/UI_Command_Catalog.md
```


### PRDB-006 - Source Ingestion, Sharding, And Parallel Extraction


```yaml
plan_unit_id: PRDB-006
unit_type: requirement
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: 'PRD Builder preserves original uploaded artifacts byte-for-byte with stable source IDs, hashes, MIME/type metadata, and extraction status before semantic processing. Create deterministic text, heading, page, table, image, and offset projections plus a source manifest recording coverage, extraction warnings, skipped content, and parser versions. Large documents must be divided into bounded, source-addressable slices that preserve page, heading, paragraph, table, image, and offset lineage so agents never need to ingest the entire corpus at once. When source size or diversity exceeds bounded thresholds, the controller must launch many read-only extraction subagents in parallel, record assignment and result receipts, and reject completion if required parallel work was skipped. Each intake subagent emits bounded candidate requirement atoms, source spans, confidence, ambiguity, conflicts, duplicates, and extraction warnings;
  only the controller or assigned owner may reduce and write the canonical PRD ledger and draft.'
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
- PYTHONPATH=/private/tmp/pm-py-deps python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/PRD_Builder.md
- Plans/Project_Output_Artifacts.md
- Plans/FileSafe.md
- Plans/Planning_Ledger_System.md
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0030
- pldg-20260618-001-prd-planning-wizard:atom-0031
- pldg-20260618-001-prd-planning-wizard:atom-0032
- pldg-20260618-001-prd-planning-wizard:atom-0033
- pldg-20260618-001-prd-planning-wizard:atom-0034
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/02-prd-builder.md#SRC-PRD
source_atom_ids:
- atom-0030
- atom-0031
- atom-0032
- atom-0033
- atom-0034
decision_refs:
- dec-0009
correction_refs:
- corr-0008
preserved_exact_tokens:
- byte-for-byte
- source IDs
- hashes
- source manifest
- deterministic projection
- parser version
- bounded slices
- source-addressable
- many read-only extraction subagents in parallel
- assignment receipts
- result receipts
- candidate requirement atoms
- controller
negative_constraints:
- Do not rely on one broad summary pass over huge source documents.
- Do not accept a single broad-agent substitute for a required parallel extraction stage.
- Do not allow extraction subagents to independently author the final PRD.
owner_hints:
- Plans/PRD_Builder.md
- Plans/Project_Output_Artifacts.md
- Plans/FileSafe.md
- Plans/Planning_Ledger_System.md
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
```


### PRDB-007 - Conflicts, Source Priority, And Ledger-Backed Annotations


```yaml
plan_unit_id: PRDB-007
unit_type: requirement
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: 'Conflicting inputs create durable conflict records and are resolved using explicit current user instruction, accepted PRD Builder decisions, source recency/authority, and recorded assumptions; overridden claims remain traceable. Highlight, comment, ask, request change, replace, remove, move to non-goal, mark unclear, show source, and challenge source actions create durable context or annotation records bound to document version and text anchors. When revisions invalidate a highlighted span, mark the anchor stale, attempt evidence-backed remapping, preserve the original selected text, and ask the user only when safe remapping is impossible.'
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
- PYTHONPATH=/private/tmp/pm-py-deps python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/PRD_Builder.md
- Plans/Planning_Ledger_System.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0035
- pldg-20260618-001-prd-planning-wizard:atom-0036
- pldg-20260618-001-prd-planning-wizard:atom-0037
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/02-prd-builder.md#SRC-PRD
source_atom_ids:
- atom-0035
- atom-0036
- atom-0037
decision_refs: []
correction_refs: []
preserved_exact_tokens:
- conflict record
- source priority
- highlight
- annotation
- text anchor
- stale anchor
- remapping
negative_constraints:
- Do not silently average or erase contradictory requirements.
owner_hints:
- Plans/PRD_Builder.md
- Plans/Planning_Ledger_System.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
```


## 3. Contracts, Schemas, Events, Or Data Shapes

The core data shapes are PRD ledger records, source manifests, deterministic source projections, conflict records, annotation records, primary PRD projection sections, stable requirement/acceptance identifiers such as `FR-001` and `AC-001`, and immutable Approved PRD Pack snapshots.


## 4. Integration Surfaces

PRD Builder integrates with Assistant Chat for conversation and selection context, FileSafe and Project Output Artifacts for preserved sources, Planning Ledger for durable source memory, Final GUI for workspace presentation, and Planning Wizard through an immutable Approved PRD Pack.


## 5. Validation And Acceptance

Acceptance requires complete and traceable planning-intake intent, source coverage or explicit warnings, resolved or carried conflicts, stable identifiers, readiness state, and an immutable approval receipt before Planning Wizard consumes the pack.


## 6. Plan-To-Node Readiness

PRD Builder produces planning-intake evidence only. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, final build tasks, or Plan Compile runtime artifacts.


## 7. Deferred, Retired, Compatibility, And Non-Goals

Retired current-product names such as `Requirements Doc Builder` may appear only as explicit historical migration or compatibility notes. PRD Builder does not collapse into Planning Wizard and does not produce implementation-ready Plans by itself.


## 8. Source Lineage And Governance

Compiled from `Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/`. The ledger remains source-lineage memory; generated shard and evidence coverage, Spec Lock hashes, and plan-graph references include this owner doc after the bounded audit repair and governance seal. `Plans/auto_decisions.jsonl` remains deterministic-log managed and is not product prose authority.
