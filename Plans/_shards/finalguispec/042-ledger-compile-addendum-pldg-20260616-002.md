# Shard 042: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/FinalGUISpec.md`

Source lines: L24735-L24864

Source SHA256: `31f1b356a21a6f30cb90f9f952419f29aca1fa29eebc5d7ebd3883350fb43d61`

---

## Ledger Compile Addendum - pldg-20260616-002

### F3-394 - Settings Capability Lane Bindings

```yaml
plan_unit_id: F3-394
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Settings must expose capability-lane bindings for Orchestrator Goal Runtime model and provider policy. Required lanes include low_cost_executor, standard_reviewer, high_reasoning_orchestrator, verifier, adjudicator, and certifier. Each lane binds to configured providers, accounts, and model profiles rather than hardcoded defaults. Missing required lane configuration surfaces an unconfigured-lane blocked state with recovery actions before a GoalRun can silently choose an arbitrary model.
gui_related: true
gui_classification_reason: This unit defines visible Settings controls and blocked-state recovery for model/provider lane binding.
depends_on:
  - F3-393
  - MS-108
unblocks: []
acceptance_criteria:
  - Settings expose capability-lane bindings for low_cost_executor, standard_reviewer, high_reasoning_orchestrator, verifier, adjudicator, and certifier.
  - Lane selectors bind to configured providers, accounts, and model profiles.
  - Missing required lanes surface an unconfigured-lane blocked state and recovery path.
  - The GUI does not imply provider-specific default models or arbitrary fallback selection.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Settings capability-lane review
risk_class: hardcoded_model_default_drift
reasoning_tier: high
context_scope: orchestrator_goal_settings
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Models_System.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: settings_capability_lane_bindings
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0063
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0064
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0065
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0066
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0067
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0093
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0102
preserved_exact_tokens:
  - "capability lanes"
  - "configured providers"
  - "model profiles"
  - "low_cost_executor"
  - "standard_reviewer"
  - "high_reasoning_orchestrator"
  - "verifier"
  - "adjudicator"
  - "certifier"
  - "unconfigured-lane"
negative_constraints:
  - Do not hardcode provider or model defaults.
  - Do not silently select arbitrary models when a required lane is missing.
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Models_System.md
  - Plans/Permissions_System.md
```

### F3-395 - Orchestrator Goal Surface Matrix

```yaml
plan_unit_id: F3-395
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The GUI must place Orchestrator Goal Runtime information across the Goal header, WorkGraph, Subagents tab, Verification tab, Evidence, History, Ledger, Dashboard, Agents page, Source Control, and Runtime Artifacts surfaces without moving runtime authority into the GUI. The surface matrix shows goal_id, GoalRun state, WorkGraph status, SubagentWave state, VerificationCycle repair progress, receipts, blockers, evidence refs, worktree/source-control handoffs, and lane/model binding blockers by consuming owner records from Goal_Runtime_System, Orchestrator_Page, Run_Graph_View, Runtime_Artifacts_Panel, WorktreeGitImprovement, Contracts_V0, storage-plan, and Models_System.
gui_related: true
gui_classification_reason: This unit maps user-visible GoalRun, WorkGraph, verification, evidence, and source-control displays across GUI surfaces.
depends_on:
  - OP-022
  - RGV-012
  - RAP-027
unblocks: []
acceptance_criteria:
  - Orchestrator Goal surfaces show GoalRun, WorkGraph, SubagentWave, VerificationCycle, evidence, receipts, blockers, and lane/model configuration status.
  - GUI surfaces consume owner records rather than becoming scheduler, storage, contract, or model-policy authorities.
  - The matrix names where Goal header, WorkGraph, Subagents, Verification, Evidence, History, Ledger, Dashboard, Agents, Source Control, and Runtime Artifacts information appears.
  - Blocked write reasons and unconfigured-lane states are visible where the user can recover them.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Orchestrator GUI placement review
risk_class: gui_projection_authority_drift
reasoning_tier: high
context_scope: orchestrator_goal_gui_surfaces
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: orchestrator_goal_surface_matrix
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0057
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0058
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0059
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0060
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0061
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0062
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0068
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0069
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0098
preserved_exact_tokens:
  - "Goal header"
  - "goal_id"
  - "WorkGraph"
  - "Subagents tab"
  - "Verification tab"
  - "Evidence"
  - "History"
  - "Ledger"
  - "Dashboard"
  - "Agents page"
negative_constraints:
  - Do not let GUI projection freshness authorize sensitive mutations.
  - Do not hide blocked write reasons or unconfigured-lane recovery actions.
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/WorktreeGitImprovement.md
```
