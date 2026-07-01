# Shard 012: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/Run_Graph_View.md`

Source lines: L878-L961

Source SHA256: `d14ad2869679d339b363925f389defafaa8a573433c8e80627b3c506bc14a4d8`

---

## Ledger Compile Addendum - pldg-20260616-002

### RGV-012 - Orchestrator WorkGraph And Verification Overlays

```yaml
plan_unit_id: RGV-012
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: >-
  Run Graph must display GoalRun WorkGraph structure, WorkNode status, SubagentWave membership, VerificationCycle overlays, repair/retry markers, blocked/replan-required states, receipt refs, and evidence refs. For Plan/PlanUnit-originated graph preparation, the Node Graph and Run Graph views may show readiness, blockers, gui_related, receipt status, and compiler contract state only as projections. The view remains a projection over Goal Runtime, Executor, Contracts, storage, Plan_Document_System, and Plan_To_Node_Compilation records; it must not decide WorkNode readiness, capacity, compiler artifact creation, or completion authority.
gui_related: true
gui_classification_reason: WorkGraph nodes, verification overlays, repair markers, and evidence refs are visible Run Graph UI.
depends_on:
  - RGV-011
  - OP-022
  - GRS-026
  - GRS-027
  - CV-288
  - SP-215
  - PDS-006
  - PNC-009
unblocks: []
acceptance_criteria:
  - Run Graph can render GoalRun WorkGraph, WorkNode status, SubagentWave membership, and VerificationCycle overlays.
  - Repair/retry, blocked, and replan-required states are visible in the graph view.
  - Receipt and evidence refs are drillable through owner projections.
  - Plan/PlanUnit graph-preparation overlays show readiness, blockers, gui_related, receipt status, and compiler contract state without creating executable artifacts.
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
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Plan_Document_System.md
  - Plans/Plan_To_Node_Compilation.md
node_compile_hint:
  mode: goalrun_workgraph_overlay
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0016
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0056
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0058
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0070
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
  - "PlanUnit"
  - "Node Graph"
  - "Run Graph"
  - "readiness"
  - "blockers"
  - "gui_related"
  - "receipt status"
  - "compiler contract"
negative_constraints:
  - Do not let Run Graph decide dispatch or completion authority.
  - Do not hide failed verification cycles or repair markers.
owner_hints:
  - Plans/Run_Graph_View.md
  - Plans/Orchestrator_Page.md
  - Plans/Goal_Runtime_System.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Plan_Document_System.md
  - Plans/Plan_To_Node_Compilation.md
```
