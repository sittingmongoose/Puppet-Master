# Shard 009: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/Planning_Ledger_System.md`

Source lines: L739-L935

Source SHA256: `f42e038a8f9a1c631bbb1cc8f267bb648722f9a107d4425ffd73c7790e48ec31`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### PLS-014 - Planning Product Ledger Synchronization And Compile Boundary

```yaml
plan_unit_id: PLS-014
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: 'Every substantive PRD Builder exchange must append an event and update affected PRD atoms, decisions, assumptions, constraints, questions, conflicts, annotations, projections, and handoff state before the turn is complete. Every substantive Planning Wizard exchange must append an event and update topic-scoped planning atoms plus any affected global decisions, constraints, dependencies, invalidations, amendments, questions, and handoff state before the turn is complete. If the required end-of-turn ledger write fails, mark the active thread ledger_sync_blocked and disable topic advance, compile, approval, and downstream handoff until durable synchronization is repaired. The durable PRD ledger is working memory and source lineage; the visible PRD is a versioned human-readable projection of accepted ledger atoms and must not become the only source of truth. Material functional requirements and acceptance criteria receive
  stable identifiers such as FR-001 and AC-001, with stable internal atom IDs and source lineage. Large documents must be divided into bounded, source-addressable slices that preserve page, heading, paragraph, table, image, and offset lineage so agents never need to ingest the entire corpus at once. Each intake subagent emits bounded candidate requirement atoms, source spans, confidence, ambiguity, conflicts, duplicates, and extraction warnings; only the controller or assigned owner may reduce and write the canonical PRD ledger and draft. Conflicting inputs create durable conflict records and are resolved using explicit current user instruction, accepted PRD Builder decisions, source recency/authority, and recorded assumptions; overridden claims remain traceable. Topic agents write topic_id-scoped records into one Planning Run ledger plus global records for cross-topic decisions and constraints, avoiding independent ledgers that can silently disagree.
  The ApprovedPlanPack and frozen canonical PlanUnit and acceptance-unit indexes are Plan Compile authority; the Planning Wizard ledger remains source and reasoning lineage rather than executable canon. After canonical owner and consumer docs are stable, regenerate allowed PlanUnit indexes, then shards, evidence, Spec Lock, plan graph, and governance decisions in the established separate phases. The deep-audit Goal uses many bounded read-only subagents in parallel for atom fidelity, reciprocal lineage, owner routing, changed-doc fidelity, ledger consistency, index/governance, forbidden artifacts, and validator mutability, with the main agent writing audit artifacts. The repair Goal builds a closure matrix only for repair_required=true findings, repairs or adjudicates those actionable rows, updates the semantic closure registry only for actionable closures, uses bounded read-only specialist subagents, and no-ops when no actionable rows exist. Passing validators alone are insufficient when repair_required=true rows remain unclosed. Ledger-to-Plans compilation writes
  or updates canonical Plans and allowed PlanUnit indexes only in their proper phases; it does not start Plan Compile, create WorkNodes, launch GoalRuns, modify implementation code, or start an Orchestrator build.'
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
- Plans/Planning_Ledger_System.md
- Plans/PRD_Builder.md
- Plans/assistant-chat-design.md
- Plans/Planning_Wizard.md
- Plans/UI_Command_Catalog.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Plan_Document_System.md
- Plans/00-plans-index.md
- Plans/bootstrap/Codex_Prompts.md
- Plans/bootstrap/Bootstrap_Planning_Workflow.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0010
- pldg-20260618-001-prd-planning-wizard:atom-0011
- pldg-20260618-001-prd-planning-wizard:atom-0012
- pldg-20260618-001-prd-planning-wizard:atom-0023
- pldg-20260618-001-prd-planning-wizard:atom-0025
- pldg-20260618-001-prd-planning-wizard:atom-0032
- pldg-20260618-001-prd-planning-wizard:atom-0034
- pldg-20260618-001-prd-planning-wizard:atom-0035
- pldg-20260618-001-prd-planning-wizard:atom-0054
- pldg-20260618-001-prd-planning-wizard:atom-0103
- pldg-20260618-001-prd-planning-wizard:atom-0161
- pldg-20260618-001-prd-planning-wizard:atom-0166
- pldg-20260618-001-prd-planning-wizard:atom-0167
- pldg-20260618-001-prd-planning-wizard:atom-0168
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/02-prd-builder.md#SRC-PRD
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/10-doc-and-contract-impact.md#SRC-IMPACT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/09-bootstrap-prompts-and-transfer.md#SRC-PROMPTS
source_atom_ids:
- atom-0010
- atom-0011
- atom-0012
- atom-0023
- atom-0025
- atom-0032
- atom-0034
- atom-0035
- atom-0054
- atom-0103
- atom-0161
- atom-0166
- atom-0167
- atom-0168
decision_refs:
- dec-0004
- dec-0008
- dec-0009
- dec-0011
- dec-0029
- dec-0030
correction_refs:
- corr-0004
preserved_exact_tokens:
- after every substantive turn
- ledger_sync_blocked
- topic_id
- global planning state
- PRD ledger
- projection
- FR-001
- AC-001
- bounded slices
- source-addressable
- candidate requirement atoms
- controller
- conflict record
- source priority
- global records
- PlanUnit index
- acceptance-unit index
- lineage
- governance seal
- Deep Audit
- many bounded read-only subagents in parallel
- repair_closure_matrix.jsonl
- semantic closure registry
- repair_required
- finding_level
- ledger-to-Plans
- not runtime
negative_constraints:
- Do not defer ledger reconstruction until the end of the conversation.
- Do not advance a topic from chat state that has not been durably synchronized.
- Do not rely on one broad summary pass over huge source documents.
- Do not allow extraction subagents to independently author the final PRD.
- Do not silently average or erase contradictory requirements.
- Do not create disconnected authoritative ledgers per topic.
- Do not treat mutable planning-ledger projections as the sole Plan Compile authority.
- Do not treat repair_required=false warnings, previously_closed rows, or audit-artifact wording as repair work.
- Do not hand-edit generated shards, evidence, Spec Lock, or plan graph during the conversational ledger phase.
- Do not confuse the bootstrap compile Goal with the finished-product Approve And Build runtime.
owner_hints:
- Plans/PRD_Builder.md
- Plans/Planning_Ledger_System.md
- Plans/assistant-chat-design.md
- Plans/Planning_Wizard.md
- Plans/UI_Command_Catalog.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Plan_Document_System.md
- Plans/00-plans-index.md
- Plans/bootstrap/Codex_Prompts.md
- Plans/bootstrap/Bootstrap_Planning_Workflow.md
```

### PLS-015 - Native Ledger Service Runtime Contract

```yaml
plan_unit_id: PLS-015
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: 'The Native Ledger Service is the finished-product runtime owner for PRD Builder, Planning Wizard, topic, and compile-source ledger persistence. It provides strict append_event, upsert_record, update_projection, commit_turn, recover_turn, compact_ledger, and import_export APIs with ledger_id, PlanningRun/thread/topic binding, monotonic revision/CAS, idempotency keys, causation/correlation refs, source refs, and receipt hashes. A substantive PRD Builder or Planning Wizard turn is not durable until event append, record upserts, projection updates, handoff/currentness projection, and ledger_turn_commit receipt are atomically committed; failed partial writes leave the visible thread ledger_sync_blocked and disable topic advance, compile, approval, and downstream handoff until recovery proves append log, records, projections, and handoff state agree. Runtime certification must reject dangling, orphaned, cross-project, cross-snapshot, stale-revision, wrong-kind, or hash-mismatched *_ref and *_refs edges across PRD source records, PlanningRun records, ApprovedPlanPack, PlanApproved, PlanCompileRun, WorkGraph, WorkNodeRecord, activation, testing, and evidence receipts. Compaction and import/export preserve enough source-lineage, exact-token data, forwarding refs, and tombstone refs to reproduce canonical Plan evidence and revalidate every certified edge, while native storage implementation details may vary behind the service contract. The strict machine-readable contract lives in Plans/prd_planning_runtime_contracts.json and is validated by scripts/pm-prd-planning-runtime-validate.py through the standard plan gates.'
gui_related: false
gui_classification_reason: Runtime storage/API contract, not visual presentation.
depends_on: [PLS-014]
unblocks: [PRDB-004, PWIZ-002, PWIZ-004, PWIZ-012]
acceptance_criteria:
- Native ledger writes use atomic per-turn commit with revision/CAS and idempotency.
- ledger_sync_blocked clears only after append log, records, projections, and handoff/currentness state agree.
- Referential-integrity certification rejects stale, dangling, wrong-kind, wrong-project, wrong-revision, or hash-mismatched refs before terminal success.
- The runtime contract packet validates under python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts.
validation_surfaces:
- python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
- python3 scripts/pm-plans-verify.py run-gates
risk_class: implementation_readiness
reasoning_tier: high
context_scope: native_ledger_service_contract
implementation_surfaces:
- Plans/Planning_Ledger_System.md
- Plans/prd_planning_runtime_contracts.json
- Plans/prd_planning_runtime_contracts.schema.json
- scripts/pm-prd-planning-runtime-validate.py
node_compile_hint:
  mode: native_runtime_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Planning_Ledger_System.md#PLS-014
- Plans/PRD_Builder.md#PRDB-004
- Plans/Planning_Wizard.md#PWIZ-002
- external_report:PRD_Planning_Runtime_Second_Sweep/IR-004
preserved_exact_tokens:
- Native Ledger Service
- append_event
- upsert_record
- update_projection
- commit_turn
- revision/CAS
- idempotency
- ledger_sync_blocked
- import/export
- referential integrity
negative_constraints:
- Do not treat the bootstrap file ledger as the finished native runtime service.
- Do not clear ledger_sync_blocked from chat memory or UI state alone.
- Do not certify runtime records whose IDs, hashes, record kinds, projects, revisions, or currentness disagree.
owner_hints:
- Plans/Planning_Ledger_System.md
- Plans/storage-plan.md
- Plans/prd_planning_runtime_contracts.json
```
