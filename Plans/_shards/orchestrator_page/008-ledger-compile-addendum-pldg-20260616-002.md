# Shard 008: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/Orchestrator_Page.md`

Source lines: L1499-L1602

Source SHA256: `a915c4671effdd63854fc4a7b253f34507b12328b194aab600d2fdb72164c22e`

---

## Ledger Compile Addendum - pldg-20260616-002

### OP-022 - GoalRun WorkGraph And Verification Projection

```yaml
plan_unit_id: OP-022
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  The Orchestrator page projects each GoalRun through the existing seven-tab shell with GoalRun and WorkGraph overlays; the Plan Compile tab is used for plan-to-code compile projection and remains separate from Executor execution progress. The Goal header shows goal_id, objective, phase, scope, authority/write surface, budget/cost, and certification status. Progress, Plan Compile, Seams, Node Graph, Evidence, History, and Ledger each show only their scoped projections: Plan Compile shows compile projection and handoff readiness, while the execution tabs show WorkGraph dependencies, WorkNode state, SubagentWaves, concerns/blockers, VerificationCycles, DefectBundles, RepairWorkNodes, receipts, replans, source-lineage refs, and certification events without becoming scheduler truth. The projected flow mirrors GoalRun → WorkGraph → WorkNode execution → VerificationCycle → repair loop → receipt → certification as a projection over owner records, not scheduler truth. VerificationCycle projection rows expose attempt, status failed | passed | blocked, findings, and defect_signatures when contract/storage records provide them. Projected GoalRun and WorkNode statuses include ready, running, provisional_success, verifying, failed_verification, repairing, certified, failed, blocked, cancelled, and stopped, with contract, storage, permission, worktree, and model-owner records remaining authoritative for the underlying fields. Old fixed-hierarchy, six-tab, and tier-era Orchestrator labels may survive only as compatibility/search aliases for search or import; active projection prose uses GoalRun, WorkGraph, WorkNode, capability_lane, agent_role, SubagentWave, VerificationCycle, and Receipt, and stale tier labels are not active canonical runtime semantics.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page header, tabs, projections, side-drawer content, and status surfaces.
depends_on: [OP-020, GRS-026, GRS-027, EP-098, OSI-428]
unblocks: [RGV-012, F3-394, RAP-027]
acceptance_criteria:
  - The seven canonical tabs remain Progress, Plan Compile, Seams, Node Graph, Evidence, History, and Ledger.
  - Plan Compile is a canonical Orchestrator tab for plan-to-code compile projection, not an Executor execution dashboard.
  - GoalRun, WorkGraph, WorkNode, SubagentWave, VerificationCycle, DefectBundle, RepairWorkNode, WorkNodeReceipt, and GoalCompletionReceipt are visible as projections where relevant.
  - Subagents projections expose active waves, bounded task, model/capability lane, input boundaries, output status, and failure/retry state.
  - Orchestrator projection preserves GoalRun → WorkGraph → WorkNode execution → VerificationCycle → repair loop → receipt → certification without becoming scheduler truth.
  - VerificationCycle projection rows can show attempt, status failed | passed | blocked, findings, and defect_signatures from contract/storage records.
  - GoalRun and WorkNode status projections distinguish ready, running, provisional_success, verifying, failed_verification, repairing, certified, failed, blocked, cancelled, and stopped.
  - Old fixed-hierarchy and tier-era Orchestrator labels remain compatibility/search aliases only; they do not replace GoalRun, WorkGraph, WorkNode, capability_lane, agent_role, SubagentWave, VerificationCycle, or Receipt terminology in active projection prose.
  - Sensitive Orchestrator mutations require current or directly validated projections; stale projections cannot authorize sensitive actions.
  - True blockers distinguish owner, legal next actions, escalation target, projection freshness, reversibility, and audit trail.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Orchestrator page surface review
risk_class: orchestrator_projection_drift
reasoning_tier: high
context_scope: orchestrator_page_goalrun_projection
implementation_surfaces: [Plans/Orchestrator_Page.md, Plans/FinalGUISpec.md, Plans/Run_Graph_View.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md, Plans/Models_System.md]
node_compile_hint: {mode: orchestrator_goalrun_projection, create_worknodes: false}
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0012
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0015
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0016
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0021
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0022
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0023
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0024
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0026
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0033
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0036
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
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0088
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0091
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0094
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0095
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
  - "ready"
  - "running"
  - "provisional_success"
  - "verifying"
  - "failed_verification"
  - "repairing"
  - "certified"
  - "failed"
  - "blocked"
  - "cancelled"
  - "stopped"
  - "GoalRun → WorkGraph → WorkNode execution → VerificationCycle → repair loop → receipt → certification"
  - "active waves"
  - "bounded task"
  - "model/capability lane"
  - "input boundaries"
  - "output status"
  - "failure/retry state"
  - "attempt"
  - "failed | passed | blocked"
  - "defect_signatures"
  - "compatibility/search aliases"
  - "capability_lane"
  - "agent_role"
  - "Receipt"
negative_constraints:
  - Do not treat the WorkGraph projection as the canonical dispatcher.
  - Do not allow stale projections to authorize sensitive mutations.
  - Do not keep stale tier labels as active canonical runtime semantics.
owner_hints: [Plans/Orchestrator_Page.md, Plans/Run_Graph_View.md, Plans/FinalGUISpec.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md, Plans/Models_System.md]
```
