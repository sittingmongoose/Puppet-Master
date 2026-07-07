# Shard 050: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/assistant-chat-design.md`

Source lines: L22466-L22554

Source SHA256: `c5f64a9608b35cad74fcbc27576b671f798b00c5e7599115dd6e9f50ead14283`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### ACD-421 - Planning Product Chat Reuse And Structured Handoff

```yaml
plan_unit_id: ACD-421
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: 'PRD Builder and Planning Wizard reuse the existing Assistant Chat message, attachment, selection-context, command, persistence, and thread infrastructure rather than creating new chat subsystems. All Planning Wizard child conversations use thread_type planning_wizard and distinguish intake, topic, final_integration, audit_review, and final_review through thread_role and Planning Run membership. Send to Planning Wizard creates a structured seed containing goal, scope, project, requirements, assumptions, open questions, source message references, artifacts, repository context, and suggested mode rather than copying an unbounded transcript. When Assistant Chat already contains sufficient planning-intake intent, the handoff may construct a traceable seed or draft PRD Pack and begin Planning Wizard intake without forcing the user through repeated PRD Builder questions. Final planning review uses the shared live document preview,
  selection context menu, comments, source inspection, challenge, targeted revision, and annotation status system used by PRD Builder. The user remains in one Planning Wizard workspace with topic map, active Assistant Chat panel, live plan preview, source/annotation/readiness panels, and bounded backend child threads loaded as selected. Reuse and formalize existing role styling, collapsible navigation, phase rows, live document panes, thread differentiation, activity indicators, worktree context, and selection-based chat context where compatible with the new architecture.'
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
- Plans/assistant-chat-design.md
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Contracts_V0.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0007
- pldg-20260618-001-prd-planning-wizard:atom-0008
- pldg-20260618-001-prd-planning-wizard:atom-0040
- pldg-20260618-001-prd-planning-wizard:atom-0041
- pldg-20260618-001-prd-planning-wizard:atom-0064
- pldg-20260618-001-prd-planning-wizard:atom-0148
- pldg-20260618-001-prd-planning-wizard:atom-0157
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/08-gui-threads-and-navigation.md#SRC-GUI
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
source_atom_ids:
- atom-0007
- atom-0008
- atom-0040
- atom-0041
- atom-0064
- atom-0148
- atom-0157
decision_refs:
- dec-0003
correction_refs:
- corr-0006
preserved_exact_tokens:
- Assistant Chat
- typed thread
- 'thread_type: planning_wizard'
- thread_role
- Planning Run
- Send to Planning Wizard
- structured seed
- fast-path
- live document preview
- selection context menu
- one Planning Wizard page
- active chat panel
- collapsible navigation
- live document pane
- selection context
negative_constraints:
- Do not build duplicate PRD Builder or Planning Wizard chat engines.
- Do not define planning_topic or audit_review as unrelated top-level thread types.
- Do not use the raw Assistant Chat transcript as the sole Planning Wizard handoff.
- Do not sacrifice provenance, quality warnings, or readiness validation to avoid repetition.
- Do not present every backend subagent or audit thread as a separate top-level app surface.
owner_hints:
- Plans/assistant-chat-design.md
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Contracts_V0.md
- Plans/FinalGUISpec.md
- Concepts/PMConcept.html
```
