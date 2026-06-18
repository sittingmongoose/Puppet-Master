# PRD Builder Source Reconstruction

## SRC-PRD

PRD Builder is a chat-assisted document workspace, not merely a chat and not implementation planning. It supports users with no documents, users importing existing material, and users combining uploads with ongoing conversation.

The agent asks many targeted discovery questions, updates the ledger after every substantive turn, and renders a standard PRD projection. Huge, poorly formatted documents are preserved, deterministically projected, sharded, extracted by many bounded read-only subagents in parallel, reduced by one controller, and traceable to source spans.

The user reviews a primary PRD, selects or highlights text, sends context to chat, comments, requests changes, inspects sources, and approves an immutable PRD Pack with “Approve PRD for Planning Wizard.”

## Accepted obligation inventory

### atom-0010: Write ledger after every substantive PRD Builder turn

Every substantive PRD Builder exchange must append an event and update affected PRD atoms, decisions, assumptions, constraints, questions, conflicts, annotations, projections, and handoff state before the turn is complete.

- atom_type: `requirement`
- lane: `ledger_discipline`
- gui_related: `false`
- exact_tokens: ["after every substantive turn", "ledger_sync_blocked"]
- negative_constraints: ["Do not defer ledger reconstruction until the end of the conversation."]
- owner_hints: ["Plans/PRD_Builder.md", "Plans/Planning_Ledger_System.md", "Plans/assistant-chat-design.md"]

### atom-0013: Use Collaborator with a PRD Builder behavior profile

PRD Builder uses the protected Collaborator Persona with workflow_behavior_profile prd_builder for discovery, source-aware clarification, conflict surfacing, and planning-intake document co-creation.

- atom_type: `requirement`
- lane: `persona_routing`
- gui_related: `false`
- exact_tokens: ["Collaborator Persona", "workflow_behavior_profile: prd_builder"]
- negative_constraints: ["Do not add an unnecessary protected PRDBuilder Persona when workflow behavior can specialize Collaborator."]
- owner_hints: ["Plans/Personas.md", "Plans/PRD_Builder.md", "Plans/assistant-chat-design.md"]

### atom-0017: Support conversation-first PRD creation

A user with no source documents can start in PRD Builder chat; the agent asks discovery questions, updates the PRD ledger every turn, and continuously renders the PRD projection.

- atom_type: `requirement`
- lane: `prd_modes`
- gui_related: `true`
- exact_tokens: ["conversation-first"]
- negative_constraints: []
- owner_hints: ["Plans/PRD_Builder.md", "Plans/FinalGUISpec.md"]

### atom-0018: Support import-first PRD normalization

A user can upload existing requirements material and have PRD Builder preserve, parse, extract, reconcile, and normalize it into the standard PRD and PRD Pack.

- atom_type: `requirement`
- lane: `prd_modes`
- gui_related: `true`
- exact_tokens: ["import-first", "normalize"]
- negative_constraints: []
- owner_hints: ["Plans/PRD_Builder.md", "Plans/FinalGUISpec.md"]

### atom-0019: Support first-class hybrid PRD Builder

Uploads and conversation may be combined at any time in one PRD Builder workspace so users can clarify, correct, extend, override, and source newly introduced requirements without restarting.

- atom_type: `requirement`
- lane: `prd_modes`
- gui_related: `true`
- exact_tokens: ["hybrid", "uploads and conversation"]
- negative_constraints: ["Do not force users to choose permanently between upload and chat."]
- owner_hints: ["Plans/PRD_Builder.md", "Plans/FinalGUISpec.md", "Plans/assistant-chat-design.md"]

### atom-0020: PRD Builder asks many discovery questions

PRD Builder proactively asks enough targeted discovery questions to make product intent complete and testable, including problem, users, goals, scope, non-goals, constraints, success, source authority, risks, assumptions, and uncertainty.

- atom_type: `requirement`
- lane: `prd_questions`
- gui_related: `false`
- exact_tokens: ["targeted discovery questions"]
- negative_constraints: []
- owner_hints: ["Plans/PRD_Builder.md"]

### atom-0021: PRD Builder questions are digestible and gap-driven

Ask questions in digestible batches, use existing ledger answers before asking, avoid repetition, and prefer questions whose answers materially change the PRD.

- atom_type: `requirement`
- lane: `prd_questions`
- gui_related: `true`
- exact_tokens: ["digestible batches", "gap-driven"]
- negative_constraints: ["Do not re-ask answered questions or overwhelm the user with one giant questionnaire."]
- owner_hints: ["Plans/PRD_Builder.md", "Plans/assistant-chat-design.md"]

### atom-0022: PRD Builder stays at planning-intake depth

PRD Builder captures what, why, who, scope, constraints, acceptance expectations, risks, assumptions, dependencies, and open questions without pretending to produce implementation-ready plans.

- atom_type: `requirement`
- lane: `prd_boundary`
- gui_related: `false`
- exact_tokens: ["planning-intake PRD"]
- negative_constraints: ["Do not create WorkNodes, implementation sequences, file-edit plans, final architecture contracts, or execution graphs in PRD Builder."]
- owner_hints: ["Plans/PRD_Builder.md", "Plans/Plan_To_Node_Compilation.md"]

### atom-0023: Visible PRD is a projection of accepted PRD ledger state

The durable PRD ledger is working memory and source lineage; the visible PRD is a versioned human-readable projection of accepted ledger atoms and must not become the only source of truth.

- atom_type: `requirement`
- lane: `prd_ledger`
- gui_related: `false`
- exact_tokens: ["PRD ledger", "projection"]
- negative_constraints: []
- owner_hints: ["Plans/PRD_Builder.md", "Plans/Planning_Ledger_System.md"]

### atom-0024: Use a standard primary PRD structure

The primary PRD contains Summary, Problem or Opportunity, Goals, Users or Actors, Scope, Non-Goals, Functional Requirements, Non-Functional Requirements, UX Expectations, Data or Integration or Environment Constraints, Acceptance Criteria, Assumptions, Risks and Dependencies, Open Questions, and Source Notes.

- atom_type: `requirement`
- lane: `prd_schema`
- gui_related: `true`
- exact_tokens: ["Functional Requirements", "Non-Functional Requirements", "Acceptance Criteria", "Open Questions", "Source Notes"]
- negative_constraints: []
- owner_hints: ["Plans/PRD_Builder.md", "Plans/Plan_Document_System.md"]

### atom-0025: Assign stable requirement and acceptance identifiers

Material functional requirements and acceptance criteria receive stable identifiers such as FR-001 and AC-001, with stable internal atom IDs and source lineage.

- atom_type: `requirement`
- lane: `prd_schema`
- gui_related: `false`
- exact_tokens: ["FR-001", "AC-001"]
- negative_constraints: []
- owner_hints: ["Plans/PRD_Builder.md", "Plans/Planning_Ledger_System.md"]

### atom-0026: Present one primary PRD plus supporting artifacts

The default workspace emphasizes one primary PRD while exposing supporting assumptions and constraints, open questions, source traceability, and quality/readiness views without making users manage many equal documents.

- atom_type: `requirement`
- lane: `prd_pack`
- gui_related: `true`
- exact_tokens: ["primary PRD", "supporting artifacts"]
- negative_constraints: []
- owner_hints: ["Plans/PRD_Builder.md", "Plans/FinalGUISpec.md"]

### atom-0027: Define immutable Approved PRD Pack

Approval creates an immutable, versioned Approved PRD Pack containing the primary PRD, accepted PRD-ledger snapshot, source manifest, traceability, assumptions and constraints, open questions, quality report, approval receipt, hashes, and version identity.

- atom_type: `requirement`
- lane: `prd_pack`
- gui_related: `false`
- exact_tokens: ["Approved PRD Pack", "immutable", "versioned"]
- negative_constraints: []
- owner_hints: ["Plans/PRD_Builder.md", "Plans/Contracts_V0.md", "Plans/Project_Output_Artifacts.md"]

### atom-0028: Approve PRD for Planning Wizard is explicit

The PRD Builder final action is labeled Approve PRD for Planning Wizard and creates the immutable handoff snapshot; the Planning Wizard consumes a specific approved version rather than mutable editor state.

- atom_type: `requirement`
- lane: `prd_pack`
- gui_related: `true`
- exact_tokens: ["Approve PRD for Planning Wizard"]
- negative_constraints: []
- owner_hints: ["Plans/PRD_Builder.md", "Plans/FinalGUISpec.md", "Plans/UI_Command_Catalog.md"]

### atom-0029: Reopening an approved PRD creates a successor version

Edits after approval create a new draft based on the approved version and require a new approval event; previous Approved PRD Packs remain immutable and addressable.

- atom_type: `requirement`
- lane: `prd_versioning`
- gui_related: `false`
- exact_tokens: ["successor version"]
- negative_constraints: []
- owner_hints: ["Plans/PRD_Builder.md", "Plans/Contracts_V0.md"]

### atom-0030: Preserve uploaded source bytes and hashes

PRD Builder preserves original uploaded artifacts byte-for-byte with stable source IDs, hashes, MIME/type metadata, and extraction status before semantic processing.

- atom_type: `requirement`
- lane: `prd_ingestion`
- gui_related: `false`
- exact_tokens: ["byte-for-byte", "source IDs", "hashes"]
- negative_constraints: []
- owner_hints: ["Plans/PRD_Builder.md", "Plans/Project_Output_Artifacts.md", "Plans/FileSafe.md"]

### atom-0031: Build deterministic source projections and manifest

Create deterministic text, heading, page, table, image, and offset projections plus a source manifest recording coverage, extraction warnings, skipped content, and parser versions.

- atom_type: `requirement`
- lane: `prd_ingestion`
- gui_related: `false`
- exact_tokens: ["source manifest", "deterministic projection", "parser version"]
- negative_constraints: []
- owner_hints: ["Plans/PRD_Builder.md", "Plans/Project_Output_Artifacts.md"]

### atom-0032: Shard large or poorly formatted sources into bounded slices

Large documents must be divided into bounded, source-addressable slices that preserve page, heading, paragraph, table, image, and offset lineage so agents never need to ingest the entire corpus at once.

- atom_type: `requirement`
- lane: `prd_ingestion`
- gui_related: `false`
- exact_tokens: ["bounded slices", "source-addressable"]
- negative_constraints: ["Do not rely on one broad summary pass over huge source documents."]
- owner_hints: ["Plans/PRD_Builder.md", "Plans/Planning_Ledger_System.md"]

### atom-0033: Mandate parallel read-only extraction for broad intake

When source size or diversity exceeds bounded thresholds, the controller must launch many read-only extraction subagents in parallel, record assignment and result receipts, and reject completion if required parallel work was skipped.

- atom_type: `requirement`
- lane: `prd_ingestion`
- gui_related: `false`
- exact_tokens: ["many read-only extraction subagents in parallel", "assignment receipts", "result receipts"]
- negative_constraints: ["Do not accept a single broad-agent substitute for a required parallel extraction stage."]
- owner_hints: ["Plans/PRD_Builder.md", "Plans/Goal_Runtime_System.md", "Plans/Contracts_V0.md"]

### atom-0034: Extraction subagents return structured candidates only

Each intake subagent emits bounded candidate requirement atoms, source spans, confidence, ambiguity, conflicts, duplicates, and extraction warnings; only the controller or assigned owner may reduce and write the canonical PRD ledger and draft.

- atom_type: `requirement`
- lane: `prd_ingestion`
- gui_related: `false`
- exact_tokens: ["candidate requirement atoms", "controller"]
- negative_constraints: ["Do not allow extraction subagents to independently author the final PRD."]
- owner_hints: ["Plans/PRD_Builder.md", "Plans/Planning_Ledger_System.md"]

### atom-0035: Use explicit conflict and source-priority records

Conflicting inputs create durable conflict records and are resolved using explicit current user instruction, accepted PRD Builder decisions, source recency/authority, and recorded assumptions; overridden claims remain traceable.

- atom_type: `requirement`
- lane: `prd_conflicts`
- gui_related: `false`
- exact_tokens: ["conflict record", "source priority"]
- negative_constraints: ["Do not silently average or erase contradictory requirements."]
- owner_hints: ["Plans/PRD_Builder.md", "Plans/Planning_Ledger_System.md"]

### atom-0036: Make document annotations ledger-backed

Highlight, comment, ask, request change, replace, remove, move to non-goal, mark unclear, show source, and challenge source actions create durable context or annotation records bound to document version and text anchors.

- atom_type: `requirement`
- lane: `prd_annotations`
- gui_related: `true`
- exact_tokens: ["highlight", "annotation", "text anchor"]
- negative_constraints: []
- owner_hints: ["Plans/PRD_Builder.md", "Plans/FinalGUISpec.md", "Plans/assistant-chat-design.md"]

### atom-0037: Handle stale annotation anchors

When revisions invalidate a highlighted span, mark the anchor stale, attempt evidence-backed remapping, preserve the original selected text, and ask the user only when safe remapping is impossible.

- atom_type: `requirement`
- lane: `prd_annotations`
- gui_related: `true`
- exact_tokens: ["stale anchor", "remapping"]
- negative_constraints: []
- owner_hints: ["Plans/PRD_Builder.md", "Plans/FinalGUISpec.md"]

### atom-0038: Use PRD readiness states and blocking rules

PRD Builder exposes Ready, Ready with Warnings, and Blocked based on source extraction, required sections, blocking conflicts, annotations, quality findings, and approval-snapshot ability; accepted warnings carry into Planning Wizard.

- atom_type: `requirement`
- lane: `prd_readiness`
- gui_related: `true`
- exact_tokens: ["Ready", "Ready with Warnings", "Blocked"]
- negative_constraints: []
- owner_hints: ["Plans/PRD_Builder.md", "Plans/FinalGUISpec.md"]
