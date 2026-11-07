# PRD Builder

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. This document is compiled from bootstrap ledger `pldg-20260618-001-prd-planning-wizard`; the ledger remains source-lineage memory, while this live Plan doc is canonical after compilation.

> **PlanProfile:** New Plan Authoring Profile

## 0. Scope

PRD Builder is the finished-product planning-intake workspace that creates, normalizes, reviews, versions, and approves PRD Packs before Planning Wizard work begins. It supports conversation-first, import-first, and hybrid requirements capture while preserving exact source lineage, source manifests, conflicts, annotations, readiness, and immutable approval snapshots.


## 1. Ownership And Consumers

PRD Builder owns intake-depth product intent, source ingestion, PRD projection, Approved PRD Pack creation, PRD annotations, and the explicit `Approve PRD for Planning Wizard` handoff. It consumes Assistant Chat, Planning Ledger, Plan Document System, FileSafe, Project Output Artifacts, Contracts, Final GUI, and UI Command contracts without owning implementation planning, Plan Compile, Executor provisioning, WorkNodes, or Orchestrator runtime execution.

PRD Builder may self-initiate web/search/fetch/extract/research/deep-research/crawl/map (`websearch`, `webfetch`, `webextract`, `webresearch`, `webcrawl`, `webmap`) and Site Reader/browser evidence through the shared PM WebOperation/BrowserAction dispatcher when current external facts, docs, issues, PRs, URLs, visual/dynamic pages, competitive comparison, site topology, bounded source traversal, or source authority materially changes product intent. The resulting read receipts, extract receipts, citations, browser artifacts, source-selection reasons, closure states, and failure states are PRD source evidence only; they may flow into PRD ledger records, source manifests, annotations, readiness warnings, and Approved PRD Pack source refs, but they do not create WorkNodes, NodeSeeds, executable queues, runtime code, implementation files, production build tasks, or Plan Compile authority.

### GUI command repair note (2026-07-02)

The production PRD Builder final action dispatches `cmd.prd_builder.approve_for_planning_wizard`; it is not `Approve & Continue`. The command creates the immutable Approved PRD Pack handoff snapshot, carries PRD Pack id/version/hash, source manifest hash, unresolved-warning acknowledgement, authority/currentness refs, and an idempotency key, and is disabled when blocking conflicts, stale source anchors, missing required sections, or ledger sync failure prevent a safe handoff. PMConcept `Approve & Continue` labels are source-lineage only and must be replaced by `Approve PRD for Planning Wizard` in production surfaces.


## 2. Canonical PlanUnits


### PRDB-001 - PRD Builder Naming, Scope, And Product Boundary


```yaml
plan_unit_id: PRDB-001
unit_type: requirement
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: >-
  The finished-product feature formerly called Requirements Doc Builder is named PRD Builder everywhere in
  user-facing UI and canonical product documentation. Requirements documents means arbitrary user-provided
  source documents; it is not the feature name and may include PRDs, notes, specifications, tickets,
  diagrams, and poorly formatted source material. PRD Builder captures and normalizes planning-intake
  product intent; Planning Wizard consumes an approved PRD Pack or normalized requirements input and
  resolves implementation-ready planning. Plans/bootstrap and Codex ledger-transfer workflows are
  development tooling for building Puppet Master and must remain distinct from the finished PRD Builder,
  Planning Wizard, Plan Compile, WorkNode, and Orchestrator runtime. Superseded legacy planning-pipeline
  experiments are not an authority, dependency, implementation pattern, or product reference for this
  redesign; use Goal Runtime, the current v2 ledger, standardized Plan docs, current Auditor loop, and
  current Plan Compile contracts. PRD Builder remains Project-required, alongside Planning Wizard and
  Orchestrator; app Plan/Deep Plan is a different approved chat workflow and cannot create a PRD Builder
  run.
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- "`cmd.prd_builder.approve_for_planning_wizard` carries PRD Pack id/version/hash, source manifest hash, approval actor, currentness refs, idempotency key, projected availability, disabled reason, and a handoff receipt without emitting fabricated command_applied events."
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
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
  - "pldg-20260618-001-prd-planning-wizard:atom-0001"
  - "pldg-20260618-001-prd-planning-wizard:atom-0003"
  - "pldg-20260618-001-prd-planning-wizard:atom-0004"
  - "pldg-20260618-001-prd-planning-wizard:atom-0005"
  - "pldg-20260618-001-prd-planning-wizard:atom-0006"
  - "Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/01-naming-and-boundaries.md#SRC-NAMING"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
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
canonical_text: 'A user with no source documents can start in PRD Builder chat; the agent asks discovery questions, updates the PRD ledger every turn, and continuously renders the PRD projection. A user can upload existing requirements material and have PRD Builder preserve, parse, extract, reconcile, and normalize it into the standard PRD and PRD Pack. Uploads and conversation may be combined at any time in one PRD Builder workspace so users can clarify, correct, extend, override, and source newly introduced requirements without restarting. PRD Builder opens with a dedicated requirements entry surface that presents the conversation-first, import-first, and hybrid starts as first-class affordances with resume support; every entry lands in the same combined PRD Builder workspace, so the entry surface precedes but never replaces the conversation-first path and hybrid remains available at any time.'
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
canonical_text: >-
  PRD Builder proactively asks enough targeted discovery questions to make product intent complete and
  testable, including problem, users, goals, scope, non-goals, constraints, success, source authority,
  risks, assumptions, and uncertainty. Ask questions in digestible batches, use existing ledger answers
  before asking, avoid repetition, and prefer questions whose answers materially change the PRD. PRD
  Builder captures what, why, who, scope, constraints, acceptance expectations, risks, assumptions,
  dependencies, and open questions without pretending to produce implementation-ready plans. With No
  project selected, preserve intent as a chat draft and offer the two explicit conversion/Project choices
  before PRD intake; declining leaves the chat intact and starts no PRD run.
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
- Plans/PRD_Builder.md
- Plans/assistant-chat-design.md
- Plans/Plan_To_Node_Compilation.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "pldg-20260618-001-prd-planning-wizard:atom-0020"
  - "pldg-20260618-001-prd-planning-wizard:atom-0021"
  - "pldg-20260618-001-prd-planning-wizard:atom-0022"
  - "Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/02-prd-builder.md#SRC-PRD"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
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
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
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
canonical_text: >-
  The default workspace emphasizes one primary PRD while exposing supporting assumptions and constraints,
  open questions, source traceability, and quality/readiness views without making users manage many equal
  documents. Approval creates an immutable, versioned Approved PRD Pack containing the primary PRD,
  accepted PRD-ledger snapshot, source manifest, traceability, assumptions and constraints, open
  questions, quality report, approval receipt, hashes, and version identity. The PRD Builder final action
  is labeled Approve PRD for Planning Wizard and creates the immutable handoff snapshot; the Planning
  Wizard consumes a specific approved version rather than mutable editor state. Edits after approval
  create a new draft based on the approved version and require a new approval event; previous Approved PRD
  Packs remain immutable and addressable. PRD Builder exposes Ready, Ready with Warnings, and Blocked
  based on source extraction, required sections, blocking conflicts, annotations, quality findings, and
  approval-snapshot ability; accepted warnings carry into Planning Wizard. Its approval pack and handoff
  require real Project/Named Plan owner identity; conversion and an app Plan approval are not an Approved
  PRD Pack or authority to start this workflow.
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
  - "pldg-20260618-001-prd-planning-wizard:atom-0026"
  - "pldg-20260618-001-prd-planning-wizard:atom-0027"
  - "pldg-20260618-001-prd-planning-wizard:atom-0028"
  - "pldg-20260618-001-prd-planning-wizard:atom-0029"
  - "pldg-20260618-001-prd-planning-wizard:atom-0038"
  - "Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/02-prd-builder.md#SRC-PRD"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
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
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
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


### PRDB-008 - Untrusted Source Security And Intake Resource Limits


```yaml
plan_unit_id: PRDB-008
unit_type: requirement
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: 'PRD Builder treats every uploaded or imported source artifact as untrusted until a source security preflight finishes. Source intake records declared MIME type, detected MIME type, byte size, decompressed byte size, parser sandbox profile, malware and macro scan references where available, quarantine state, path-safety receipt, SSRF/network-denial receipt for parsers, prompt-injection labels, and security warnings before extraction output can influence PRD atoms. Archive, document, image, and link inputs must be rejected, quarantined, or degraded when MIME detection disagrees unsafely, decompression expands beyond configured limits, parser execution would escape its sandbox, paths traverse outside the preserved source area, macros or active content are present, remote fetches are attempted without explicit authority, or source text contains prompt-injection instructions that target the assistant rather than describing product requirements. Intake resource limits are explicit contract data: max_source_bytes, max_decompressed_bytes, max_slice_bytes, max_slice_count, max_parallel_extraction_agents, max_extraction_retries, max_wall_time_seconds, max_tokens_per_assignment, max_cost_microdollars, and limit_exceeded_state. Hitting a source-security or resource limit cannot be treated as successful extraction; it creates a blocking warning, quarantine receipt, degraded-source receipt, or user-visible authority request before approval.'
gui_related: false
gui_classification_reason: Source-security, parser-sandbox, and resource-limit contracts are backend/runtime intake behavior, not visual presentation.
depends_on: [PRDB-006]
unblocks: []
acceptance_criteria:
- Source intake cannot feed PRD atoms until MIME, hash, parser-sandbox, path, network, scan/quarantine, and resource-limit receipts are recorded or explicitly unavailable with a warning.
- Prompt-injection text inside uploaded sources is preserved as source content but cannot become assistant instruction or policy authority.
- Archive expansion, parser execution, path traversal, macro/active content, malware indicators, SSRF, oversized sources, excessive slices, retry exhaustion, time, token, and cost limits all have explicit blocked/degraded terminal states.
- Runtime contract artifacts expose the security required fields, resource-limit fields, and terminal rules for PRD source intake.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
risk_class: untrusted_source_security_bypass
reasoning_tier: high
context_scope: prd_source_security_resource_limits
implementation_surfaces:
- Plans/PRD_Builder.md
- Plans/prd_planning_runtime_contracts.json
- Plans/prd_planning_runtime_contracts.schema.json
- Plans/FileSafe.md
- Plans/Permissions_System.md
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: prd_source_security_resource_limits
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- external_report:PRD_Planning_Runtime_Second_Sweep/untrusted_document_security_gap
- external_report:PRD_Planning_Runtime_Second_Sweep/resource_limit_gap
preserved_exact_tokens:
- untrusted document
- prompt injection
- archive bomb
- malware
- macros
- parser sandbox
- MIME validation
- path traversal
- SSRF
- quarantine
- decompression
- resource limits
negative_constraints:
- Do not let untrusted source text instruct the assistant, override policy, or bypass PRD Builder authority.
- Do not extract active-content, remote-fetch, archive, or parser output as trusted product requirements without security receipts.
- Do not silently pass oversized, over-budget, or quarantined source material.
owner_hints:
- Plans/PRD_Builder.md
- Plans/FileSafe.md
- Plans/Permissions_System.md
- Plans/prd_planning_runtime_contracts.json
```


### PRDB-007 - Conflicts, Source Priority, And Ledger-Backed Annotations


```yaml
plan_unit_id: PRDB-007
unit_type: requirement
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: 'Conflicting inputs create durable conflict records and are resolved using explicit current user instruction, accepted PRD Builder decisions, source recency/authority, and recorded assumptions; overridden claims remain traceable. Highlight, comment, ask, request change, replace, remove, move to non-goal, mark unclear, show source, and challenge source actions create durable context or annotation records bound to document version, projection revision, actor identity, ordered source spans, action-specific payload, and text anchors. Annotation records include actor_ref, action_kind, action_payload, source_span_ref, start and end offsets, selected_text_hash, ordering_key, anchor_state, relocation_ref_or_null, and evidence_refs. When revisions invalidate a highlighted span, mark the anchor stale, preserve the original selected text, attempt evidence-backed remapping, write a stale_anchor_relocation_receipt when successful, and ask the user only when safe remapping is impossible.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
- Annotation/source-span records preserve actor identity, ordering, action payload, selected text hash, and stale-anchor relocation receipts.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
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
- actor_ref
- action_payload
- ordering_key
- stale_anchor_relocation_receipt
negative_constraints:
- Do not silently average or erase contradictory requirements.
- Do not apply an annotation action to a stale anchor without evidence-backed relocation or user reanchor.
owner_hints:
- Plans/PRD_Builder.md
- Plans/Planning_Ledger_System.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
```



## Assistant redesign: BSD, Wonderer and Grill Me in the PRD Builder start flow (2026-09-03)

### Additive Correction v4 — Grill Me is +25 here too (QMAX-020)

`PM_Assistant_v2_Additive_Correction_v4` sets the Grill Me extension to **25**,
retiring the former `+10`. It applies to the PRD Builder's own owner-defined
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

The PRD Builder start flow offers exactly three additive options. Each is off unless
the user selects it, none of them is required to start, and none changes what
PRD Builder produces:

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

The **+25** applies to the PRD Builder's own owner-defined question scope
(its per-flow and per-topic question counters). It does not import the
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
- Back Seat Driver is read-only and never gates a stage. PRD Builder completes
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

The core data shapes are PRD ledger records, source manifests, deterministic source projections, source security preflight records, source resource limit profiles, source intake terminal receipts, conflict records, annotation records, primary PRD projection sections, stable requirement/acceptance identifiers such as `FR-001` and `AC-001`, and immutable Approved PRD Pack snapshots.


## 4. Integration Surfaces

PRD Builder integrates with Assistant Chat for conversation and selection context, FileSafe and Project Output Artifacts for preserved sources, Planning Ledger for durable source memory, Final GUI for workspace presentation, and Planning Wizard through an immutable Approved PRD Pack. Untrusted source security and resource-limit contracts integrate with FileSafe, Permissions, and the runtime contract packet before any uploaded or imported source can influence accepted PRD atoms.


## 5. Validation And Acceptance

Acceptance requires complete and traceable planning-intake intent, source coverage or explicit warnings, resolved or carried conflicts, stable identifiers, readiness state, source-security and resource-limit receipts for imported material, and an immutable approval receipt before Planning Wizard consumes the pack.


## 6. Plan-To-Node Readiness

PRD Builder produces planning-intake evidence only. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, final build tasks, or Plan Compile runtime artifacts.


## 7. Deferred, Retired, Compatibility, And Non-Goals

Retired current-product names such as `Requirements Doc Builder` may appear only as explicit historical migration or compatibility notes. PRD Builder does not collapse into Planning Wizard and does not produce implementation-ready Plans by itself.


## 8. Source Lineage And Governance

Compiled from `Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/`. The ledger remains source-lineage memory; generated shard and evidence coverage, Spec Lock hashes, and plan-graph references include this owner doc after the bounded audit repair and governance seal. `Plans/auto_decisions.jsonl` remains deterministic-log managed and is not product prose authority.

## Ledger Compile Addendum - pldg-20260622-001-fff

### PRDB-009 - PRD Builder Source Picker Discovery Consumer

```yaml
plan_unit_id: PRDB-009
unit_type: requirement
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: >-
  PRD Builder source picker and source ingestion use DiscoveryService for project source discovery when building PRD source references. Requests use prd_builder_source_picker, project/worktree or remote/SSH identity, policy_context, and file or content_candidate target kinds. Selected candidates preserve provenance in PRD source refs and expose denied, stale, fallback, hidden-by-policy, and no-results states without leaking blocked paths. Raw Assistant Chat transcripts are not sufficient as sole source selection proof.
gui_related: true
gui_classification_reason: This is the PRD Builder source picker/source ingestion GUI and provenance behavior.
depends_on: [F3-399, T-161, SP-217, F2-191]
unblocks: [ATS-011, PWIZ-015]
acceptance_criteria:
  - PRD Builder source picking routes through DiscoveryService when discovering project files.
  - Selected candidate provenance is recorded in PRD source refs.
  - Denied/stale/fallback states are visible without leaking blocked path details.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future PRD Builder source picker local/SSH tests.
  - Future hidden-by-policy source no-leak tests.
risk_class: prd_source_provenance_drift
reasoning_tier: standard
context_scope: prd_builder_source_picker
implementation_surfaces: [Plans/PRD_Builder.md, future PRD Builder source picker]
node_compile_hint: {mode: prd_builder_discovery_consumer, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0027
  - pldg-20260622-001-fff:atom-0038
  - pldg-20260622-001-fff:atom-0044
  - pldg-20260622-001-fff:atom-0045
  - pldg-20260622-001-fff:atom-0059
  - pldg-20260622-001-fff:atom-0087
  - pldg-20260622-001-fff:atom-0088
  - pldg-20260622-001-fff:atom-0090
  - pldg-20260622-001-fff:state/consumer_conformance_matrix.json#prd_builder_source_picker
source_atom_ids: [atom-0027, atom-0038, atom-0044, atom-0045, atom-0059, atom-0087, atom-0088, atom-0090]
preserved_exact_tokens: ["PRD Builder", "prd_builder_source_picker", "source ingestion", "PRD source refs", "content_candidate", "raw Assistant Chat transcript", "hidden-by-policy"]
negative_constraints:
  - Do not use raw Assistant Chat transcript as the sole source selection proof.
  - Do not collapse PRD Builder into Planning Wizard.
  - Do not create implementation-ready Plans or runtime work from PRD source discovery alone.
owner_hints: [Plans/PRD_Builder.md, Plans/FinalGUISpec.md, Plans/Tools.md, Plans/storage-plan.md]
```


## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### PRDB-010 - PRD Builder Historical Document Records

```yaml
plan_unit_id: PRDB-010
unit_type: requirement
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: PRD Builder outputs that become wizard-created documents must emit immutable project-scoped history
  records addressable by Orchestrator History. Final/approved PRD outputs are retained forever by default and appear
  in the default approved-only view; retained drafts, intermediate outputs, previous non-final versions, superseded
  outputs, archived rows, and exports remain discoverable only through the expanded all-history controls and retention/archive
  policy. Records preserve PRD identity, status, version, created/approved times, source wizard/run refs, artifacts,
  archive state, and lifecycle event refs for projection rebuild.
gui_related: false
gui_classification_reason: Defines PRD Builder output/history record obligations; GUI presentation is owned by Orchestrator
  History.
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
risk_class: prd_history_lineage_loss
reasoning_tier: standard
context_scope: prd_builder_history_records
implementation_surfaces:
- Plans/PRD_Builder.md
- future PRD Builder output records
node_compile_hint:
  mode: prd_history_record_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0008
- pldg-20260626-001-feature-name:atom-0015
- pldg-20260626-001-feature-name:atom-0016
- pldg-20260626-001-feature-name:atom-0024
- pldg-20260626-001-feature-name:atom-0025
- pldg-20260626-001-feature-name:atom-0033
- pldg-20260626-001-feature-name:atom-0044
- pldg-20260626-001-feature-name:atom-0045
- pldg-20260626-001-feature-name:atom-0047
- pldg-20260626-001-feature-name:atom-0052
- chat:misc-history-scope
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Project_Output_Artifacts.md
- Plans/Runtime_Artifacts_Panel.md
- chat:history-defaults-answers
- chat:history-scope-retention-actions-answers
- chat:history-columns-toggle-deep-compare-answers
- chat:history-export-compare-archive-answers
- chat:history-source-index-answer
- chat:history-projection-lifecycle-answer
source_atom_ids:
- atom-0008
- atom-0015
- atom-0016
- atom-0024
- atom-0025
- atom-0033
- atom-0044
- atom-0045
- atom-0047
- atom-0052
decision_refs:
- dec-0002
- dec-0003
- dec-0004
- dec-0005
- dec-0007
- dec-0008
- dec-0009
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
- Approved only
- All history
- per-project toggle/chip
- only after include archived extra
- Include archived
- archived
- project-scoped unified History index/projection
- source-of-truth shape
- wizard save/approval
- run lifecycle
- artifact/evidence write
- archive/unarchive
- lineage/manifest events
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
- Do not make All history a hidden advanced-only affordance.
- Do not persist the control globally across unrelated projects.
- Do not show archived records inline by default in All history.
- Do not make archived records appear without an explicit additional control.
- Do not make archived records appear identical to normal retained all-history records.
- Do not implement the History surface as fragile cross-subsystem ad hoc scans at view time.
- Do not make the History read model global or cross-project by default.
- Do not rely on view-time scanning as the primary way to discover normal History changes.
- Do not omit archive/unarchive or lineage/manifest updates from the projection lifecycle.
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
```

## FABLE Residual PRD Builder Contract Cleanup Addendum - 2026-07-07

This addendum closes only residual FABLE Critical/High PRD Builder rows for conflict records, scoring defaults, resource defaults, and approval command naming. It does not certify runtime readiness or create build tasks.

### PRDB-011 - Conflict, Scoring, Resource Defaults, And Approval Command Contract

Amended 2026-11-07 (DL-333): the user resolution command is now `cmd.prd_builder.conflict.resolve`, with the runtime contract row's fields `conflict_id`, `selected_claim_refs` and `resolution_reason` (`Plans/prd_planning_runtime_contracts.json` `ui_command_contracts`; PRDB-024), and `cmd.prd_builder.resolve_conflict` is its compatibility alias.

```yaml
plan_unit_id: PRDB-011
unit_type: schema_contract
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: >-
  PRD Builder conflict resolution uses a typed ConflictRecord and deterministic scoring defaults before a PRD can
  be approved into Planning Wizard. Conflicts record conflict_id, prd_id, field_path, competing_values[], source_refs[],
  confidence_scores[], detected_at_ms, resolution_state, selected_value?, resolver_actor?, resolved_at_ms?, and
  audit_receipt_ref?. Readiness scoring uses weighted completeness, evidence, conflict, dependency, and resource axes,
  while resource defaults provide explicit time, token, cost, provider, and review placeholders instead of silent nulls.
gui_related: true
gui_classification_reason: PRD conflict review, scoring, and approval are user-visible Planning Wizard handoff surfaces.
depends_on: [PRDB-005, PRDB-007, PRDB-008, PLS-015]
unblocks: []
acceptance_criteria:
  - ConflictRecord tie-break order is explicit user resolution, higher-authority source_ref, latest accepted user correction, higher confidence, then blocked_requires_user_decision.
  - "User resolution command is cmd.prd_builder.conflict.resolve with conflict_id, selected_claim_refs, and resolution_reason. Amended 2026-11-07 (DL-333): the runtime contract row's fields replace prd_id, selected_value, optional rationale, and actor_ref, and cmd.prd_builder.resolve_conflict is its compatibility alias (PRDB-024)."
  - Readiness score defaults are completeness 0.35, evidence 0.25, conflicts 0.20, dependencies 0.10, resources 0.10, with approve threshold >= 0.85 and conflicts axis requiring no blocking conflicts.
  - Resource defaults include estimated_tokens = unknown, estimated_cost_microusd = unknown, max_review_minutes = 30, provider_preference = unset, and required_human_review = true when estimates are unknown.
  - The canonical approval command is cmd.prd_builder.approve_for_planning_wizard; compatibility alias cmd.prd_builder.approve_for_planning must project to the canonical command and emit the same approval receipt.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status --source-artifact residual_feature_contract_findings.jsonl
risk_class: fable_residual_prd_builder_contract_drift
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/PRD_Builder.md
  - Plans/Planning_Wizard.md
  - Plans/Planning_Ledger_System.md
node_compile_hint:
  mode: prd_builder_residual_contract_defaults
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md:1203
  - fablereport.md:1204
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "ConflictRecord"
  - "cmd.prd_builder.approve_for_planning_wizard"
  - "cmd.prd_builder.approve_for_planning"
  - "readiness scoring"
  - "resource defaults"
negative_constraints:
  - Do not approve a PRD with unresolved blocking conflicts by scoring alone.
  - Do not silently substitute resource defaults as runtime capacity proof.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime certification evidence, or production build tasks.
owner_hints:
  - Plans/PRD_Builder.md
  - Plans/Planning_Wizard.md
  - Plans/UI_Command_Catalog.md
```

## Notebook Research Assistance Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. A thread-scoped Working Notebook may assist PRD intake and research (holding research progress, rejected framings, open questions, and evidence locations) and may continue across a fresh context window, but it never changes PRD authority: the PRD ledger is still updated every turn, accepted requirements and corrections are still captured as canonical PRD ledger records and source manifests with lineage, and notebook references are at most explicitly recorded capture sources. Notebook content is never the sole requirement source and never satisfies the approve-for-planning-wizard gate.

```yaml
plan_unit_id: PRDB-012
unit_type: requirement
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: "A Working Notebook may assist PRD intake/research and continue across fresh context windows without altering PRD authority: per-turn PRD ledger updates remain mandatory, accepted requirements and corrections are captured as canonical PRD ledger records with lineage, and notebook content is never the sole requirement source or an approval gate input."
gui_related: false
gui_classification_reason: PRD authority semantics are workflow behavior, not GUI work.
depends_on: [PRDB-011, PLS-022]
unblocks: []
acceptance_criteria:
  - A material requirement discussed in research is captured in the PRD ledger, not left only in notes.
  - Notebook references never replace source manifests or approval gates.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: requirement_leak_to_notes
reasoning_tier: standard
context_scope: prd_builder
implementation_surfaces: [Plans/PRD_Builder.md, Plans/Planning_Ledger_System.md, Plans/Working_Notebook.md]
node_compile_hint: {mode: workflow_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I05
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A41
preserved_exact_tokens: ["PRD ledger", "every turn", "sole requirement source"]
negative_constraints:
  - Do not let notebook research substitute for PRD ledger records.
owner_hints: [Plans/PRD_Builder.md, Plans/Planning_Ledger_System.md]
```

ContractRef: ContractName:Plans/PRD_Builder.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Working_Notebook.md

## PERF-001 Named Plan consumer repair (2026-09-27)

PRD Builder is a Named Plan consumer: the workspace carries a PRD switcher plus `New Plan`
entry scoped by explicit immutable `project_id` plus `named_plan_id`. PRDB-005's one primary
PRD is per selected Named Plan, not a global singleton: each selected Plan shows its own
current primary PRD with supporting assumptions, constraints, questions, traceability, and
readiness, and switching Plans never merges, pauses, or cancels background PRD work in any
Plan. Superseded PRDs of the selected Plan remain reachable as historical refs.

Switching restores the selected Plan's last route, tab, filters, inspector, scroll, and focus,
while background extraction, reduction, and review work continue independently under PRD
authority. Plan lifecycle actions use the existing six `cmd.named_plan.*` commands only; this
repair adds no PRD lifecycle, no approval bypass, no storage keys, no events, and no native
handlers, and route success never implies child completion.

Every PRD ledger record, source manifest, annotation, and Approved PRD Pack carries the explicit
Project+NamedPlan parent edge it was resolved under, and every parent join resolves through the
single NPLAN-006 owner-join contract against the actual PRD owner record and aggregate edges.
PRD content, approval, versioning, and readiness stay owned here; the join proves lineage only.
Approval and Planning Wizard handoff are mutate intent and require a current-edge accept; a
historical edge authorizes read inspection only.

ContractRef: ContractName:Plans/Named_Plan_System.md#NPLAN-006, ContractName:Plans/PRD_Builder.md#PRDB-005

### PRDB-013 - PRD Switcher And New Plan Under Selected Plan Scope

```yaml
plan_unit_id: PRDB-013
unit_type: requirement
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: >-
  PRD Builder exposes a PRD switcher plus New Plan entry scoped by explicit immutable project_id plus
  named_plan_id, with one current primary PRD per selected Named Plan, independent background work across
  switches, and per-Plan restore of route, tab, filters, inspector, scroll, and focus. Plan lifecycle
  actions reuse the existing six cmd.named_plan commands with no new lifecycle, and every PRD parent edge
  resolves through the single NPLAN-006 owner-join contract while PRD content, approval, and readiness
  stay owned here. No-project PRD navigation is typed Project-required with the two ACD-510 choices; no
  null Project/named_plan_id or fake aggregate is admitted. A successful conversion is followed by
  separate current intake, not implicit PRD creation.
gui_related: true
gui_classification_reason: The PRD switcher, New Plan entry, per-Plan restore, and scoped workspace are user-visible.
depends_on: [PRDB-005, NPLAN-006]
unblocks: []
acceptance_criteria:
  - The workspace shows a PRD switcher plus New Plan entry carrying explicit Project+NamedPlan identity.
  - Each selected Plan has exactly one current primary PRD; other Plans' PRDs never merge into it.
  - Switching Plans preserves background work in every Plan and restores route, tab, filters, inspector, scroll, and focus.
  - Plan actions use only the existing six cmd.named_plan commands with no new lifecycle or approval bypass.
  - Every PRD record and Approved PRD Pack carries its resolved parent edge through the NPLAN-006 join.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 -m unittest tests.test_named_plan_semantics
risk_class: prd_plan_scope_drift
reasoning_tier: high
context_scope: prd_builder_named_plan_scope
implementation_surfaces:
  - Plans/PRD_Builder.md
  - Plans/Named_Plan_System.md
node_compile_hint:
  mode: prd_builder_named_plan_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "packet:PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08#PERF-001"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens:
  - "primary PRD"
  - "New Plan"
  - "Approved PRD Pack"
negative_constraints:
  - Do not treat one primary PRD as a global singleton across Plans.
  - Do not pause, cancel, or merge background PRD work on Plan switch.
  - Do not add PRD lifecycle, approval bypass, storage, events, or handlers for scope.
  - Do not treat route success as PRD completion or approval.
  - Do not approve or hand off on a historical-edge join; approval requires a current-edge accept.
owner_hints:
  - Plans/PRD_Builder.md
  - Plans/Named_Plan_System.md
```

## Command payload definitions (DL-333, 2026-11-05)

### PRDB-024 - PRD Builder Command Payload Definitions

```yaml
plan_unit_id: PRDB-024
unit_type: command_contract
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: >-
  Typed payload definitions for the seven cmd.prd_builder.* commands that UI_Command_Catalog UCC-098
  registers and UCC-230 routes to this doc (DL-333). Each command's field list is the runtime contract
  row keyed by its catalog id in Plans/prd_planning_runtime_contracts.json ui_command_contracts
  (DL-333 coordinator resolution 1); that file's former ids are recorded compatibility aliases, and the
  catalog row's payload summary column is history. The definitions block below gives each command its
  args, owner result and narrowed error and disabled-reason codes in pm.command_payload_definitions.v1;
  the runtime contract's owner disabled states map to the overlay's closed codes through UCC-230
  owner_state_code_map. The envelope keeps the common fields: the annotation upsert's actor_ref travels
  in the envelope and is never restated here. The catalog keeps ids, labels, availability and aliases;
  the strict schema overlay keeps the common envelope and the closed code sets.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible PRD Builder import, answer, annotation, conflict, approval and reopen commands.
depends_on: [UCC-230, UCC-097, UCC-098, DL-333, DL-341, CV-333, PRDB-007, PRDB-011]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to PRDB-024 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/PRD_Builder.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "Plans/prd_planning_runtime_contracts.json ui_command_contracts (field lists under the catalog ids; DL-333 resolution 1)"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.prd_builder.source.import, cmd.prd_builder.answer.upsert, cmd.prd_builder.annotation.upsert, cmd.prd_builder.annotation.resolve, cmd.prd_builder.conflict.resolve, cmd.prd_builder.approve_for_planning_wizard, cmd.prd_builder.pack.reopen]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token; the runtime contract file's former ids are compatibility aliases and never dispatch.
  - Do not restate actor_ref; the envelope carries it (UCC-230).
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Planning_Ledger_System.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: PRDB-024
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.prd_builder.source.import
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        workspace_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.source.import (Plans/prd_planning_runtime_contracts.json ui_command_contracts; DL-333 resolution 1); the history column's project_id wording is superseded by the runtime field list"
        source_refs:
          type: list
          required: true
          default: none
          item: {type: ref}
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.source.import; source_manifest records carry source_id (prd_builder_runtime.records source_manifest)"
        source_security_policy_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.source.import; guard source_security_policy_current with owner state stale_source_security_policy (owner_state_code_map -> stale_projection)"
        source_resource_limit_profile_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.source.import; guard resource_limit_profile_present with owner state missing_resource_limit_profile (owner_state_code_map -> not_configured)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PrdSourceImportResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, not_configured, permission_required, degraded, stale_projection]
      owner_state_codes:
        - {owner_state: stale_workspace, code: stale_projection}
        - {owner_state: permission_denied, code: permission_required}
        - {owner_state: stale_source_security_policy, code: stale_projection}
        - {owner_state: missing_resource_limit_profile, code: not_configured}
        - {owner_state: parser_sandbox_unavailable, code: degraded}
        - {owner_state: source_quarantined, code: blocked_state_required}
        - {owner_state: source_limit_exceeded, code: blocked_state_required}
      aliases:
        - {command_id: cmd.prd_builder.import_sources, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1)"}
    - command_id: cmd.prd_builder.answer.upsert
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        workspace_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.answer.upsert (Plans/prd_planning_runtime_contracts.json ui_command_contracts; DL-333 resolution 1)"
        question_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.answer.upsert; the history column's question/section id wording names the same field"
        answer:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names the field with no type or bounds; the history column says
            "answer version, source refs" which the runtime field list does not carry. JUDGMENT: typed
            string with no length bounds; bounds and the answer-version/source-refs inputs stay open.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PrdAnswerUpsertResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded]
      owner_state_codes:
        - {owner_state: ledger_sync_blocked, code: degraded}
      aliases:
        - {command_id: cmd.prd_builder.answer_question, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1)"}
    - command_id: cmd.prd_builder.annotation.upsert
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        source_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.annotation.upsert; required field source_id of Plans/prd_planning_runtime_contracts.json prd_builder_runtime.records annotation_record (PRDB-007 does not list it); id per the UCC-230 *_id typing"
        document_version:
          type: integer
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Plans/prd_planning_runtime_contracts.json prd_builder_runtime.records annotation_record requires document_version (PRDB-007 binds records to the "document version") but states no type; JUDGMENT:
            typed integer as a monotonic version counter; a string form is not ruled out.
        projection_revision:
          type: integer
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Plans/prd_planning_runtime_contracts.json prd_builder_runtime.records annotation_record requires projection_revision (PRDB-007 binds records to the "projection revision") but states no type; JUDGMENT:
            typed integer as a monotonic revision counter; a string form is not ruled out.
        action_kind:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Plans/prd_planning_runtime_contracts.json prd_builder_runtime.records annotation_record requires action_kind (PRDB-007 lists it too) and PRDB-007 lists the action verbs
            (highlight, comment, ask, request change, replace, remove, move to non-goal, mark unclear,
            show source, challenge source) in prose, not as tokens, so canon gives no value spellings for an
            enum. JUDGMENT: typed string pending a token set; the verb list is the semantic range.
        action_payload:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Plans/prd_planning_runtime_contracts.json prd_builder_runtime.records annotation_record requires action_payload (PRDB-007, "action-specific payload") with no
            field shape, and the closed vocabulary's object type needs named fields canon does not
            give. JUDGMENT: typed as an opaque payload string pending a typed per-action contract;
            a structured object or contract ref stays open.
        source_span_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.annotation.upsert; required field source_span_ref of Plans/prd_planning_runtime_contracts.json prd_builder_runtime.records annotation_record, also listed by PRDB-007 (PRD_Builder.md:560); ref per the UCC-230 *_ref typing"
        start_offset:
          type: integer
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract and Plans/prd_planning_runtime_contracts.json prd_builder_runtime.records annotation_record name start_offset, and PRDB-007 lists "start and end offsets", but
            canon states no type or bound. Choice: an integer offset, as document_version is typed; the unit
            (character, byte or code point) and a lower bound stay open.
        end_offset:
          type: integer
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract and Plans/prd_planning_runtime_contracts.json prd_builder_runtime.records annotation_record name end_offset, and PRDB-007 lists "start and end offsets", but
            canon states no type or bound. Choice: an integer offset, as document_version is typed; the unit
            (character, byte or code point) and a lower bound stay open.
        selected_text_hash:
          type: sha256
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Plans/prd_planning_runtime_contracts.json prd_builder_runtime.records annotation_record requires selected_text_hash (PRDB-007 lists it too) without naming the algorithm.
            JUDGMENT: typed sha256 to match the vocabulary's hash type and the repository's SHA-256
            convention; the algorithm choice stays open.
        ordering_key:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Plans/prd_planning_runtime_contracts.json prd_builder_runtime.records annotation_record requires ordering_key (PRDB-007 lists it, with "ordered source spans") with no format.
            JUDGMENT: typed string with no bounds; the key format stays open.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PrdAnnotationUpsertResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection, unauthorized]
      owner_state_codes:
        - {owner_state: stale_anchor_unrelocated, code: stale_projection}
        - {owner_state: actor_not_authorized, code: unauthorized}
        - {owner_state: projection_stale, code: stale_projection}
      aliases:
        - {command_id: cmd.prd_builder.annotate_source, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1)"}
    - command_id: cmd.prd_builder.annotation.resolve
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        annotation_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row cmd.prd_builder.annotation.resolve (Concrete PRD Builder command rows, GUI / PMConcept implementation-readiness repair addendum); runtime contract payload_contract"
        document_version:
          type: integer
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The catalog row and the runtime contract name document_version with no type; JUDGMENT:
            typed integer as a monotonic version counter, as in cmd.prd_builder.annotation.upsert.
        resolution_kind:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The catalog row says "resolution kind" and the runtime contract names resolution_kind, but
            neither fixes the value set. JUDGMENT: typed string pending that enum.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PrdAnnotationResolveResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: annotation_terminal, code: blocked_state_required}
        - {owner_state: stale_anchor_unrelocated, code: stale_projection}
      aliases: []
    - command_id: cmd.prd_builder.conflict.resolve
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        conflict_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.conflict.resolve; ConflictRecord identity conflict_id (PRDB-011)"
        selected_claim_refs:
          type: list
          required: true
          default: none
          item: {type: ref}
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.conflict.resolve; guard claims_present over ConflictRecord source_refs/competing claims (PRDB-011)"
        resolution_reason:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names resolution_reason with no type or bounds; PRDB-011's alias-era
            "optional rationale" is the same input with no bounds either. JUDGMENT: typed string, and
            required because the runtime field list carries it unconditionally; bounds stay open.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PrdConflictResolveResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      owner_state_codes:
        - {owner_state: missing_claims, code: blocked_state_required}
      judgments:
        - key: omitted:prd_id
          choice: omitted
          gap_note: >-
            The runtime contract row under the catalog id carries conflict_id, selected_claim_refs and
            resolution_reason (Plans/prd_planning_runtime_contracts.json ui_command_contracts), and DL-333
            resolution 1 puts that field list under the catalog id and makes the old id a compatibility alias.
            PRDB-011's acceptance criterion, amended 2026-11-07 under DL-333 (PRD_Builder.md:950, with the note at
            :931), now names the same three fields; before, it named cmd.prd_builder.resolve_conflict with prd_id,
            conflict_id, selected_value, optional rationale and actor_ref. prd_id is left out because the
            ConflictRecord named by conflict_id carries it (PRDB-011 canonical_text); selected_value became
            selected_claim_refs, the rationale became the required resolution_reason, and actor_ref stays in the
            envelope.
      aliases:
        - {command_id: cmd.prd_builder.resolve_conflict, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1); PRDB-011's amended acceptance criterion names it the compatibility alias (PRD_Builder.md:950)"}
    - command_id: cmd.prd_builder.approve_for_planning_wizard
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        prd_pack_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.approve_for_planning_wizard; PRDB-011 canonical approval command"
        pack_version:
          type: integer
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names pack_version with no type; JUDGMENT: typed integer as a
            monotonic pack version; a string form is not ruled out.
        quality_report_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.approve_for_planning_wizard; quality_report record (prd_builder_runtime.records) backs guard quality_not_blocked"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PrdApproveForPlanningWizardResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      owner_state_codes:
        - {owner_state: blocking_findings, code: blocked_state_required}
        - {owner_state: source_coverage_missing, code: blocked_state_required}
      aliases:
        - {command_id: cmd.prd_builder.approve_for_planning, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1); PRDB-011 compatibility alias"}
    - command_id: cmd.prd_builder.pack.reopen
      ucc_units: [UCC-098, UCC-097]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        approved_pack_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "runtime contract payload_contract cmd.prd_builder.pack.reopen; guard pack_exists"
        reason:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The runtime contract names reason with no type or bounds; JUDGMENT: typed string with no
            bounds. The history column's "currentness proof" names no runtime field, so no field is
            invented for it; load_latest_pack_before_reopen is the owner's freshness policy.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:PrdPackReopenResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      owner_state_codes:
        - {owner_state: pack_missing, code: blocked_state_required}
      aliases:
        - {command_id: cmd.prd_builder.reopen_pack, kind: compatibility_alias,
           source: "Plans/prd_planning_runtime_contracts.json ui_command_contracts alias_command_ids; UCC-230 non_definition_tokens (DL-333 resolution 1)"}
  results:
    PrdSourceImportResultV1:
      fields:
        source_manifest_refs: {type: list, required: true, default: none, item: {type: ref}, provenance: gap, gap_note: "result_contract token of the runtime row; source_manifest records exist but no typed result contract does"}
        source_security_preflight_refs: {type: list, required: true, default: none, item: {type: ref}, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
        source_resource_limit_receipt_refs: {type: list, required: true, default: none, item: {type: ref}, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
        source_intake_terminal_receipt_refs: {type: list, required: true, default: none, item: {type: ref}, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
        projection_job_refs: {type: list, required: true, default: none, item: {type: ref}, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
    PrdAnswerUpsertResultV1:
      fields:
        ledger_turn_commit_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
    PrdAnnotationUpsertResultV1:
      fields:
        annotation_record_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
        annotation_receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
        stale_anchor_relocation_receipt_ref_or_null: {type: ref, required: true, nullable: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; its _or_null name makes it always present and null when no relocation was needed, as annotation_record relocation_ref_or_null (PRDB-007); no typed result contract"}
    PrdAnnotationResolveResultV1:
      fields:
        annotation_resolution_receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
    PrdConflictResolveResultV1:
      fields:
        conflict_resolution_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; no typed result contract"}
    PrdApproveForPlanningWizardResultV1:
      fields:
        ApprovedPRDPack: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; the approved pack snapshot the history column names; no typed result contract"}
        approval_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; handoff receipt effect; no typed result contract"}
    PrdPackReopenResultV1:
      fields:
        draft_version_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "result_contract token of the runtime row; the new draft identity the history column names; no typed result contract"}
```
