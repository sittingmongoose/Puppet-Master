# Shard 008: PlanUnits

Source: `Plans/Run_Graph_View.md`

Source lines: L141-L186

Source SHA256: `2dcf8ef7b900d5f80ffcbec627bbdd65080b64bce72858676b52190ebead51b0`

---

## PlanUnits

### RGV-001 - Run Graph Canonical Scope

```yaml
plan_unit_id: RGV-001
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: Run Graph is the canonical graph and lineage inspection surface for orchestrated execution. Graph nodes are runtime nodes rather than tiers; lineage spans graph generations; blocked, recovery, promotion, and corroboration state appears in graph detail when it belongs to the selected node or related lineage object.
gui_related: true
gui_classification_reason: The unit defines the user-visible Run Graph inspection surface.
depends_on: []
unblocks: [RGV-002, RGV-003, RGV-004, RGV-005, RGV-006]
acceptance_criteria:
- Graph nodes are modeled as runtime nodes, not tiers.
- Graph lineage remains generation-aware when graph patching occurs.
- Node detail can expose blocked, recovery, promotion, and corroboration state for selected or related lineage objects.
validation_surfaces:
- Manual review of Plans/Run_Graph_View.md section 1.
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: route_owner_drift
reasoning_tier: standard
context_scope: run_graph_owner_surface
implementation_surfaces:
- Plans/Run_Graph_View.md
- future Run Graph UI
node_compile_hint:
  mode: future_compiler_input
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0005
- Plans/Run_Graph_View.md:1-24
preserved_exact_tokens:
- Run Graph View (Node Graph Display) -- Specification
- Canonical owner-section requirements
- 1. Scope and canonical role
negative_constraints:
- Do not treat tiers as runtime graph nodes.
owner_hints:
- Plans/Run_Graph_View.md
```
