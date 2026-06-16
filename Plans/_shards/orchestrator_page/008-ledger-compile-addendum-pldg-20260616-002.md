# Shard 008: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/Orchestrator_Page.md`

Source lines: L1496-L1561

Source SHA256: `9315a24e16c9f794fe1a444d46377a03f1c448a4befd088bf3cb6a9911376222`

---

## Ledger Compile Addendum - pldg-20260616-002

### OP-022 - GoalRun WorkGraph And Verification Projection

```yaml
plan_unit_id: OP-022
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  The Orchestrator page projects each GoalRun through the existing six-tab spine with GoalRun and WorkGraph overlays. The Goal header shows goal_id, objective, phase, scope, authority/write surface, budget/cost, and certification status. Progress, Seams, Node Graph, Evidence, History, and Ledger show WorkGraph dependencies, WorkNode state, SubagentWaves, concerns/blockers, VerificationCycles, DefectBundles, RepairWorkNodes, receipts, replans, source-lineage refs, and certification events without becoming scheduler truth.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page header, tabs, projections, side-drawer content, and status surfaces.
depends_on: [OP-020, GRS-026, GRS-027, EP-098, OSI-428]
unblocks: [RGV-012, F3-394, RAP-027]
acceptance_criteria:
  - The six canonical tabs remain Progress, Seams, Node Graph, Evidence, History, and Ledger.
  - GoalRun, WorkGraph, WorkNode, SubagentWave, VerificationCycle, DefectBundle, RepairWorkNode, WorkNodeReceipt, and GoalCompletionReceipt are visible as projections where relevant.
  - Sensitive Orchestrator mutations require current or directly validated projections; stale projections cannot authorize sensitive actions.
  - True blockers distinguish owner, legal next actions, escalation target, projection freshness, reversibility, and audit trail.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Orchestrator page surface review
risk_class: orchestrator_projection_drift
reasoning_tier: high
context_scope: orchestrator_page_goalrun_projection
implementation_surfaces: [Plans/Orchestrator_Page.md, Plans/FinalGUISpec.md, Plans/Run_Graph_View.md]
node_compile_hint: {mode: orchestrator_goalrun_projection, create_worknodes: false}
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0012
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0015
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0016
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0023
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0024
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0039
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0056
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0057
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0058
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0059
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0060
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0061
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0062
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0068
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0074
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0077
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0091
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0026
preserved_exact_tokens:
  - "Goal header"
  - "goal_id"
  - "objective"
  - "phase"
  - "authority/write surface"
  - "Progress"
  - "Seams"
  - "Node Graph"
  - "Evidence"
  - "History"
  - "Ledger"
  - "provisional_success"
  - "failed_verification"
negative_constraints:
  - Do not treat the WorkGraph projection as the canonical dispatcher.
  - Do not allow stale projections to authorize sensitive mutations.
owner_hints: [Plans/Orchestrator_Page.md, Plans/Run_Graph_View.md, Plans/FinalGUISpec.md]
```
