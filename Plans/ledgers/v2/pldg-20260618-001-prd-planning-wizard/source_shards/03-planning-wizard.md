# Planning Wizard Source Reconstruction

## SRC-PLANNING

Planning Wizard receives approved or normalized planning input, creates one durable Planning Run, derives a dynamic topic graph, and works through bounded topic threads. Each topic uses a fresh agent and a topic-scoped view of one Planning Run ledger. Questions are specific to the active topic and resolve implementation-readiness gaps.

At topic closure, a separate conversion agent creates the Topic Plan Draft, then separate Auditor/repair/Auditor steps prove fidelity. Later topic agents receive Context Capsules and current topic-plan summaries rather than complete raw histories. Material later decisions invalidate affected prior topics.

After all current topics are ready, a new integration agent creates the Final Plan Pack and a mandatory parallel multi-specialist audit/repair loop checks it. User decisions are exceptional; safe defaults and typed deferrals are preferred.

## Accepted obligation inventory

### atom-0011: Write ledger after every substantive Planning Wizard turn

Every substantive Planning Wizard exchange must append an event and update topic-scoped planning atoms plus any affected global decisions, constraints, dependencies, invalidations, amendments, questions, and handoff state before the turn is complete.

- atom_type: `requirement`
- lane: `ledger_discipline`
- gui_related: `false`
- exact_tokens: ["after every substantive turn", "topic_id", "global planning state"]
- negative_constraints: ["Do not advance a topic from chat state that has not been durably synchronized."]
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Planning_Ledger_System.md", "Plans/assistant-chat-design.md"]

### atom-0012: Ledger synchronization blocks state-changing actions on failure

If the required end-of-turn ledger write fails, mark the active thread ledger_sync_blocked and disable topic advance, compile, approval, and downstream handoff until durable synchronization is repaired.

- atom_type: `requirement`
- lane: `ledger_discipline`
- gui_related: `true`
- exact_tokens: ["ledger_sync_blocked"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Ledger_System.md", "Plans/PRD_Builder.md", "Plans/Planning_Wizard.md", "Plans/UI_Command_Catalog.md"]

### atom-0014: Use Collaborator with a Planning Wizard behavior profile

Topic conversations use the Collaborator Persona with workflow_behavior_profile planning_wizard, asking topic-local implementation-readiness questions while preserving a cooperative, technically serious interaction style.

- atom_type: `requirement`
- lane: `persona_routing`
- gui_related: `false`
- exact_tokens: ["workflow_behavior_profile: planning_wizard"]
- negative_constraints: []
- owner_hints: ["Plans/Personas.md", "Plans/Planning_Wizard.md"]

### atom-0015: Use specialized roles for conversion and certification

Use Overseer for ledger-to-PRD, ledger-to-topic-plan, cross-topic integration, and compilation supervision; Auditor for audit, repair verification, and certification; High-Effort Worker for bounded difficult or repository-wide analysis; controller remains sole canonical writer.

- atom_type: `requirement`
- lane: `persona_routing`
- gui_related: `false`
- exact_tokens: ["Overseer", "Auditor", "High-Effort Worker", "sole canonical writer"]
- negative_constraints: ["Do not let read-only subagents mutate canonical ledgers, PRDs, Plans, WorkGraphs, or runtime records."]
- owner_hints: ["Plans/Personas.md", "Plans/Models_System.md", "Plans/PRD_Builder.md", "Plans/Planning_Wizard.md", "Plans/Plan_To_Node_Compilation.md"]

### atom-0016: Use Planning Context Capsules between topic agents

Each topic agent receives a bounded Planning Context Capsule containing approved PRD summary, project context, global decisions and constraints, glossary, relevant prior topic-plan summaries, dependencies, assumptions, questions, and artifact references.

- atom_type: `requirement`
- lane: `memory`
- gui_related: `false`
- exact_tokens: ["Planning Context Capsule"]
- negative_constraints: ["Do not inject all prior raw chat histories and complete raw ledgers into every topic agent by default."]
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Planning_Ledger_System.md", "Plans/Goal_Runtime_System.md"]

### atom-0039: Planning Wizard consumes normalized, versioned planning inputs

Planning Wizard accepts an Approved PRD Pack, normalized imported requirements pack, or structured Assistant Chat handoff seed, preserving source identity, version, hashes, warnings, amendments, and lineage.

- atom_type: `requirement`
- lane: `planning_input`
- gui_related: `false`
- exact_tokens: ["Approved PRD Pack", "Assistant Chat handoff seed"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Contracts_V0.md"]

### atom-0040: Assistant Chat handoff is structured, not transcript dumping

Send to Planning Wizard creates a structured seed containing goal, scope, project, requirements, assumptions, open questions, source message references, artifacts, repository context, and suggested mode rather than copying an unbounded transcript.

- atom_type: `requirement`
- lane: `planning_input`
- gui_related: `true`
- exact_tokens: ["Send to Planning Wizard", "structured seed"]
- negative_constraints: ["Do not use the raw Assistant Chat transcript as the sole Planning Wizard handoff."]
- owner_hints: ["Plans/assistant-chat-design.md", "Plans/Planning_Wizard.md", "Plans/Contracts_V0.md"]

### atom-0041: Assistant Chat may use a fast-path without redundant PRD interview

When Assistant Chat already contains sufficient planning-intake intent, the handoff may construct a traceable seed or draft PRD Pack and begin Planning Wizard intake without forcing the user through repeated PRD Builder questions.

- atom_type: `requirement`
- lane: `planning_input`
- gui_related: `false`
- exact_tokens: ["fast-path"]
- negative_constraints: ["Do not sacrifice provenance, quality warnings, or readiness validation to avoid repetition."]
- owner_hints: ["Plans/assistant-chat-design.md", "Plans/PRD_Builder.md", "Plans/Planning_Wizard.md"]

### atom-0042: Define a durable PlanningRun aggregate

PlanningRun owns source pack identity, project and work-intent context, thread group, global planning ledger, dynamic topic map, topic threads, topic plan drafts, amendments, invalidations, audit cycles, final plan pack, status, hashes, and handoff events.

- atom_type: `requirement`
- lane: `planning_run`
- gui_related: `false`
- exact_tokens: ["PlanningRun", "thread_group_id", "topic map"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Contracts_V0.md", "Plans/storage-plan.md"]

### atom-0043: Separate project context from work intent

Planning Wizard classifies project context independently from work intent so overlapping cases such as an existing Git repository plus feature work plus PR delivery are represented without a misleading single mode enum.

- atom_type: `requirement`
- lane: `planning_run`
- gui_related: `false`
- exact_tokens: ["project context", "work intent"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md"]

### atom-0046: Generate a dynamic topic map from evidence

Planning Wizard derives an initial topic graph from the input pack, project/repository context, work intent, risk, and known defaults rather than enforcing a fixed list of sections.

- atom_type: `requirement`
- lane: `topic_map`
- gui_related: `true`
- exact_tokens: ["dynamic topic map", "topic graph"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/FinalGUISpec.md"]

### atom-0047: Topic names are generated and domain-appropriate

Possible topics include overview, product behavior, GUI or UX, backend, data, integrations, security, permissions, testing, deployment, migration, observability, and risks, but actual titles and scope are evidence-driven.

- atom_type: `requirement`
- lane: `topic_map`
- gui_related: `true`
- exact_tokens: ["GUI / UX", "Security", "Testing"]
- negative_constraints: ["Do not hardcode one universal topic taxonomy for all projects."]
- owner_hints: ["Plans/Planning_Wizard.md"]

### atom-0048: Support controlled dynamic topic operations

The controller can add, split, merge, rename, defer, reopen, reorder, and mark topics impacted, recording the reason, source refs, dependencies, user-visible origin, and resulting invalidations.

- atom_type: `requirement`
- lane: `topic_map`
- gui_related: `true`
- exact_tokens: ["add_topic", "split_topic", "merge_topics", "mark_topic_impacted"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Contracts_V0.md", "Plans/FinalGUISpec.md"]

### atom-0049: Use a suggested order over a dependency graph

The GUI suggests a next topic and conversational sequence while the underlying topic map preserves dependencies and allows safe navigation, reopening, and parallel background work.

- atom_type: `requirement`
- lane: `topic_map`
- gui_related: `true`
- exact_tokens: ["suggested order", "dependency graph"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/FinalGUISpec.md"]

### atom-0050: Use a fresh bounded agent for every topic

Each topic conversation is handled by a fresh topic agent with a bounded thread, topic brief, Context Capsule, relevant sources, and topic-scoped write card.

- atom_type: `requirement`
- lane: `topic_agents`
- gui_related: `false`
- exact_tokens: ["fresh topic agent", "bounded thread"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Goal_Runtime_System.md"]

### atom-0051: Ask only topic-relevant planning questions

Each topic agent asks gap-driven questions relevant to its active topic and implementation-readiness risks, using known answers and defaults so it does not drift into unrelated domains.

- atom_type: `requirement`
- lane: `topic_agents`
- gui_related: `false`
- exact_tokens: ["topic-relevant", "gap-driven"]
- negative_constraints: ["Do not ask generic questions that do not materially affect the active topic."]
- owner_hints: ["Plans/Planning_Wizard.md"]

### atom-0052: Planning Wizard asks many deep planning questions

Planning Wizard proactively resolves behavior, state, data, identity, permissions, failure modes, edge cases, integration constraints, acceptance evidence, currentness, idempotency, migration, operations, and implementation boundaries.

- atom_type: `requirement`
- lane: `topic_agents`
- gui_related: `false`
- exact_tokens: ["behavior", "state", "failure modes", "idempotency"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md"]

### atom-0053: Minimize user decisions through safe autonomy

The controller answers auto-resolvable gaps from evidence, applies safe defaults with recorded assumptions, and defers downstream-only details; it asks the user only for genuine product direction, risk acceptance, destructive authority, credentials, legal policy, or irreconcilable ambiguity.

- atom_type: `requirement`
- lane: `topic_agents`
- gui_related: `false`
- exact_tokens: ["safe defaults", "minimal HITL"]
- negative_constraints: ["Do not convert ordinary planning uncertainty into a Needs user decision blocker."]
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/human-in-the-loop.md"]

### atom-0054: Use one Planning Run ledger with topic scope

Topic agents write topic_id-scoped records into one Planning Run ledger plus global records for cross-topic decisions and constraints, avoiding independent ledgers that can silently disagree.

- atom_type: `requirement`
- lane: `topic_ledger`
- gui_related: `false`
- exact_tokens: ["topic_id", "global records"]
- negative_constraints: ["Do not create disconnected authoritative ledgers per topic."]
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Planning_Ledger_System.md"]

### atom-0055: Invalidate affected prior topics when assumptions change

A later decision that changes a prior topic's assumptions or outputs marks affected topic drafts stale_due_to_dependency_change, stale_due_to_new_scope, or requires_recompile/requires_reaudit and propagates impact through typed topic dependencies.

- atom_type: `requirement`
- lane: `topic_invalidation`
- gui_related: `true`
- exact_tokens: ["stale_due_to_dependency_change", "requires_recompile", "requires_reaudit"]
- negative_constraints: ["Do not leave a topic marked Ready after a material dependency change."]
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Contracts_V0.md", "Plans/FinalGUISpec.md"]

### atom-0056: Classify new scope as clarification, amendment, or PRD revision

New information during planning becomes a planning clarification, immutable Planning Amendment, deferred future scope item, or PRD revision request according to materiality and impact.

- atom_type: `requirement`
- lane: `scope_change`
- gui_related: `false`
- exact_tokens: ["Planning Amendment", "PRD revision request"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/PRD_Builder.md", "Plans/Contracts_V0.md"]

### atom-0057: Never mutate an approved PRD silently

Approved PRD Packs remain immutable; Planning Wizard records amendments or requests a successor PRD rather than editing the approved source snapshot in place.

- atom_type: `negative_constraint`
- lane: `scope_change`
- gui_related: `false`
- exact_tokens: ["immutable Approved PRD Pack"]
- negative_constraints: ["Do not silently rewrite approved PRD input from Planning Wizard."]
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/PRD_Builder.md"]

### atom-0058: Compile each topic after topic closure

At topic closure, a separate Overseer conversion agent transforms accepted topic ledger records into a versioned Topic Plan Draft or PlanUnit candidates with exact source lineage, assumptions, open non-blocking items, and cross-topic impacts.

- atom_type: `requirement`
- lane: `topic_compile`
- gui_related: `false`
- exact_tokens: ["Topic Plan Draft", "topic closure", "Overseer"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Plan_Document_System.md"]

### atom-0059: Do not wait until the end to convert every ledger

Per-topic conversion provides readable, audited planning outputs for subsequent agents and user progress, while a later global integration pass remains mandatory.

- atom_type: `negative_constraint`
- lane: `topic_compile`
- gui_related: `false`
- exact_tokens: ["per-topic conversion"]
- negative_constraints: ["Do not require later topic agents to interpret every prior raw ledger before continuing."]
- owner_hints: ["Plans/Planning_Wizard.md"]

### atom-0060: Audit and repair every topic plan before Ready

A new Auditor agent checks ledger-to-plan fidelity, unsupported claims, exact tokens, negative constraints, acceptance, dependencies, images, and open items; a separate repair agent fixes findings and a new Auditor rechecks until pass or a typed blocker.

- atom_type: `requirement`
- lane: `topic_audit`
- gui_related: `false`
- exact_tokens: ["audit", "repair", "re-audit"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Goal_Runtime_System.md"]

### atom-0061: Topic Ready is machine status, not mandatory user approval

A topic becomes Ready after successful conversion and audit; users may review or reopen any topic, but ordinary flow does not require a user confirmation after every topic.

- atom_type: `requirement`
- lane: `topic_audit`
- gui_related: `true`
- exact_tokens: ["Ready"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/FinalGUISpec.md"]

### atom-0062: Allow explicit checkpoints only for high-risk choices

Security, data destruction, billing, migration, legal/compliance, irreversible external effects, or similarly high-risk decisions may require explicit user confirmation under HITL policy.

- atom_type: `requirement`
- lane: `topic_audit`
- gui_related: `false`
- exact_tokens: ["high-risk checkpoint"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/human-in-the-loop.md"]

### atom-0063: Integrate all current topic plans globally

After required topics are Ready, a fresh Overseer agent reconciles topic drafts into a coherent Final Plan Pack, resolves duplicates and owner boundaries, and computes cross-topic dependencies, consistency, and compile readiness.

- atom_type: `requirement`
- lane: `final_integration`
- gui_related: `false`
- exact_tokens: ["Final Plan Pack", "cross-topic integration"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Plan_Document_System.md"]

### atom-0064: Reuse live document preview and annotation controls for Plans

Final planning review uses the shared live document preview, selection context menu, comments, source inspection, challenge, targeted revision, and annotation status system used by PRD Builder.

- atom_type: `requirement`
- lane: `final_review`
- gui_related: `true`
- exact_tokens: ["live document preview", "selection context menu"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/FinalGUISpec.md", "Plans/assistant-chat-design.md"]

### atom-0065: Support uploaded and generated planning reference images

Planning topics may accept uploaded reference images and generate wireframes, architecture diagrams, data-flow diagrams, state diagrams, or visual references through the existing image system, with artifact IDs, provenance, topic links, version, and status.

- atom_type: `requirement`
- lane: `visual_artifacts`
- gui_related: `true`
- exact_tokens: ["uploaded reference image", "generated reference image"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Media_Generation_and_Capabilities.md", "Plans/Project_Output_Artifacts.md"]

### atom-0066: Text remains canonical when images affect the plan

Images are supporting references; any requirement, decision, constraint, flow, or acceptance implication introduced by an image must also be written into the planning ledger and canonical Plan text.

- atom_type: `requirement`
- lane: `visual_artifacts`
- gui_related: `false`
- exact_tokens: ["supporting reference", "text remains canonical"]
- negative_constraints: ["Do not leave a material requirement only inside an image."]
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Plan_Document_System.md"]
