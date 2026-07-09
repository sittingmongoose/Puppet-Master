# Shard 008: Ledger Compile Addendum - pldg-20260614-001

Source: `Plans/Orchestrator_Page.md`

Source lines: L1479-L1559

Source SHA256: `0c6d1ada4d9b06aad07ece508a27891ce1095685fb890b946181a1f5b3be97f7`

---

## Ledger Compile Addendum - pldg-20260614-001

### OP-020 - Owner Section Hydration And Contracts Boundary Compile Addendum

```yaml
plan_unit_id: OP-020
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Orchestrator_Page owns page layout, controls, view-model projections, routing presentation, focused run and historical routing,
  seven-tab behavior, notification display, concern inspectors, and user-visible action affordances. It consumes Contracts_V0 for durable
  concern ids, route/open primitives, blocked episode identity, approval scope, and approver identity. Its top owner-section headings must
  be hydrated from OP PlanUnits and local sections instead of remaining hollow headers.
gui_related: true
gui_classification_reason: Orchestrator_Page governs user-visible pages, tabs, controls, projections, and routing presentation.
depends_on: [OP-002, OP-003, OP-004, OP-005, OP-006, OP-007, OP-008, CV-279]
unblocks: []
acceptance_criteria:
  - The seven canonical tabs remain Progress, Plan Compile, Seams, Node Graph, Evidence, History, and Ledger.
  - Tiers remains compatibility/search vocabulary only, not the live Orchestrator tab model.
  - Contract primitives are consumed from Contracts_V0 instead of redefined locally.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual Orchestrator owner-section review
risk_class: orchestrator_owner_hollowing
reasoning_tier: standard
context_scope: orchestrator_page_owner_sections
implementation_surfaces: [Plans/Orchestrator_Page.md, Plans/Contracts_V0.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: orchestrator_owner_section_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0018
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0055
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0056
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0057
  - source_ref:Plans/Orchestrator_Page.md:4
  - source_ref:Plans/Orchestrator_Page.md:55
preserved_exact_tokens: ["Progress", "Plan Compile", "Seams", "Node Graph", "Evidence", "History", "Ledger", "Tiers", "six-tab behavior", "Progress-only widget hostability", "focused_run_id", "focus_mode = live | historical"]
negative_constraints:
  - Do not let Orchestrator_Page redefine durable contract primitives owned by Contracts_V0.
  - Do not make the dense Scope section the only readable owner body.
owner_hints: [Plans/Orchestrator_Page.md, Plans/Contracts_V0.md, Plans/FinalGUISpec.md, Plans/storage-plan.md]
```

### OP-021 - Priority Cleanup Scope Guard

```yaml
plan_unit_id: OP-021
unit_type: constraint
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Priority-1 cleanup references involving Contracts_V0, Orchestrator_Page, Executor_Protocol, human-in-the-loop, WorktreeGitImprovement,
  FinalGUISpec, UI_Command_Catalog, FileManager, Runtime_Artifacts_Panel, and storage-plan are routing evidence, not automatic scope expansion.
  Orchestrator compile work may add owner-section anchors and consumer pointers, but must return to the ledger if it discovers a true product
  decision outside the accepted Fable recovery atoms.
gui_related: true
gui_classification_reason: This guard governs user-visible Orchestrator cleanup scope and adjacent GUI consumers.
depends_on: [OP-020]
unblocks: []
acceptance_criteria:
  - Adjacent docs are not edited solely because they appear in a priority cleanup list.
  - Source-first owner routing remains explicit for every adjacent cleanup reference.
validation_surfaces:
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-001-part-2-cleanup-fable-audit
  - python3 scripts/pm-plan-index.py validate
risk_class: cleanup_scope_creep
reasoning_tier: standard
context_scope: cross_doc_cleanup_boundary
implementation_surfaces: [Plans/Orchestrator_Page.md, Plans/Contracts_V0.md, Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: scope_guard, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0058
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0075
  - source_ref:chat:contracts-orchestrator-cluster
preserved_exact_tokens: ["Priority-1 cleanup", "cannot safely coexist with the new model", "consumer_reference_only", "source-first", "stop and return to the ledger"]
negative_constraints:
  - Do not broaden this compile into unrelated Priority-1 cleanup work.
  - Do not create WorkNodes, NodeSeeds, executable queues, or production tasks from this cleanup list.
owner_hints: [Plans/Orchestrator_Page.md, Plans/Contracts_V0.md]
```
