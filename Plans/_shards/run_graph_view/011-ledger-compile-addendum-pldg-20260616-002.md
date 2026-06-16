# Shard 011: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/Run_Graph_View.md`

Source lines: L807-L868

Source SHA256: `7e8480d17882b100663a89e9304236ad4b062c0499185e67359ebfae4840bc36`

---

## Ledger Compile Addendum - pldg-20260616-002

### RGV-012 - Orchestrator WorkGraph And Verification Overlays

```yaml
plan_unit_id: RGV-012
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: >-
  Run Graph must display GoalRun WorkGraph structure, WorkNode status, SubagentWave membership, VerificationCycle overlays, repair/retry markers, blocked/replan-required states, receipt refs, and evidence refs. The view remains a projection over Goal Runtime, Executor, Contracts, and storage records; it must not decide WorkNode readiness, capacity, or completion authority.
gui_related: true
gui_classification_reason: WorkGraph nodes, verification overlays, repair markers, and evidence refs are visible Run Graph UI.
depends_on:
  - RGV-011
  - OP-022
  - GRS-026
  - GRS-027
unblocks: []
acceptance_criteria:
  - Run Graph can render GoalRun WorkGraph, WorkNode status, SubagentWave membership, and VerificationCycle overlays.
  - Repair/retry, blocked, and replan-required states are visible in the graph view.
  - Receipt and evidence refs are drillable through owner projections.
  - The view does not replace Executor readiness, capacity, dispatch, or Goal Runtime completion authority.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Run Graph GoalRun overlay review
risk_class: run_graph_runtime_projection_drift
reasoning_tier: high
context_scope: goalrun_workgraph_view
implementation_surfaces:
  - Plans/Run_Graph_View.md
  - Plans/Orchestrator_Page.md
  - Plans/Goal_Runtime_System.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: goalrun_workgraph_overlay
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0016
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0056
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0058
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0074
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0077
preserved_exact_tokens:
  - "WorkGraph"
  - "WorkNode"
  - "SubagentWave"
  - "VerificationCycle"
  - "repair"
  - "retry"
  - "blocked"
  - "replan-required"
negative_constraints:
  - Do not let Run Graph decide dispatch or completion authority.
  - Do not hide failed verification cycles or repair markers.
owner_hints:
  - Plans/Run_Graph_View.md
  - Plans/Orchestrator_Page.md
  - Plans/Goal_Runtime_System.md
  - Plans/Executor_Protocol.md
```
