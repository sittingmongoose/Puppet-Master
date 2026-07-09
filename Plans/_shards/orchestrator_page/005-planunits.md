# Shard 005: PlanUnits

Source: `Plans/Orchestrator_Page.md`

Source lines: L389-L451

Source SHA256: `eb8b1bb7d042b6214316b11c4c954a00fc8bada900cbb52c404904055531303d`

---

## PlanUnits

### OP-002 - Orchestrator Scope Page Shell And Owner Boundary

```yaml
plan_unit_id: OP-002
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Orchestrator owns scheduling, concern tracking, blocked-state handling, runtime identity presentation, page layout and controls, view-model projections, and run-control intents for the Progress, Plan Compile, Seams, Node Graph, Evidence, History, and Ledger tab set, while runtime, storage, and scheduler contracts own canonical truth.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page behavior or controls.
split_recommended: true
split_recommendation_reason: >-
  S0032 mixes page shell, runtime ownership, compatibility, routing, and governance material; this unit covers the scope and owner-boundary subset.
depends_on: []
unblocks: []
acceptance_criteria:
  - Orchestrator remains distinct from the UI, CLI, and external providers.
  - The page shell is a seven-tab single-page surface over node/package/seam/lane-aware runtime state.
  - The live tab set is Progress, Plan Compile, Seams, Node Graph, Evidence, History, and Ledger.
  - Tier, widget, and legacy tab labels remain compatibility inputs rather than execution authority.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: orchestrator_scope_owner_boundary
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0002
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
  - Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:7
  - Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/decisions.jsonl:7
  - Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:10
preserved_exact_tokens:
  - "Orchestrator Page -- Single-Page 6-Tab Specification"
  - "/page-shell"
  - "six-tab single-page surface"
  - "seven-tab single-page surface"
  - "Tiers"
  - "Progress/Seams/Node Graph/Evidence/History/Ledger"
  - "Progress/Plan Compile/Seams/Node Graph/Evidence/History/Ledger"
  - "Progress"
  - "Plan Compile"
  - "Seams"
  - "Node Graph"
  - "History"
  - "Evidence"
  - "Ledger"
  - "package/lane aware"
negative_constraints:
  - "Orchestrator must not define page-local runtime authority for enums, event semantics, or scheduler truth."
  - "Tiers must not remain a primary tab/page authority."
owner_hints:
  - Plans/Orchestrator_Page.md
```
