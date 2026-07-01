# Shard 044: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/FinalGUISpec.md`

Source lines: L24938-L25173

Source SHA256: `b824671b5edfee493929996179c1892dd34c1a6ac3631c3a2ad143899ab49c9a`

---

## Ledger Compile Addendum - pldg-20260616-002

### F3-394 - Settings Capability Lane Bindings

```yaml
plan_unit_id: F3-394
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Settings must expose Orchestrator Goal Runtime policy controls without becoming the policy owner. Capability-lane bindings cover low_cost_executor, standard_reviewer, high_reasoning_orchestrator, verifier, adjudicator, and certifier, and each lane binds to configured providers, accounts, and model profiles rather than hardcoded defaults. Settings also exposes subagent policy controls for fanout thresholds, max parallel subagents, max cost per wave, bounded input limits, retry policy, and when subagents are mandatory; verification policy controls for verification strictness, validators by WorkNode type, independent review, evidence-span requirements, completion receipt requirements, repair-loop policy, and degraded-mode behavior; write policy controls for parent-only writer, patch-only subagents, isolated worktree, single-writer lease, protected/governance unlock, and approval boundary defaults; and Goal Mode policy controls for auto-resume, checkpoint cadence, replan behavior, user interruption handling, true-blocker escalation, evidence retention, and redaction. Missing required lane or policy configuration surfaces an unconfigured-lane or typed blocked state with recovery actions before a GoalRun can silently choose arbitrary runtime behavior.
gui_related: true
gui_classification_reason: This unit defines visible Settings controls and blocked-state recovery for model/provider lane binding.
depends_on:
  - F3-393
  - MS-109
  - PS-115
  - GRS-027
  - OSI-428
  - W-071
  - RAP-027
unblocks: []
acceptance_criteria:
  - Settings expose capability-lane bindings for low_cost_executor, standard_reviewer, high_reasoning_orchestrator, verifier, adjudicator, and certifier.
  - Lane selectors bind to configured providers, accounts, and model profiles.
  - Settings expose subagent policy controls for fanout thresholds, max parallel subagents, max cost per wave, bounded input limits, retry policy, and mandatory subagent use.
  - Settings expose verification strictness, validators by WorkNode type, independent review, evidence-span, completion receipt, repair-loop policy, and degraded-mode controls.
  - Settings expose write-policy controls for parent-only writer, patch-only subagents, isolated worktree, single-writer lease, protected/governance unlock, and approval boundary defaults.
  - Settings expose Goal Mode policy controls for auto-resume, checkpoint cadence, replan behavior, user interruption handling, true-blocker escalation, evidence retention, and redaction.
  - Missing required lanes surface an unconfigured-lane blocked state and recovery path.
  - The GUI does not imply provider-specific default models, own runtime policy semantics, or authorize arbitrary fallback selection.
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
  - Plans/Goal_Runtime_System.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Runtime_Artifacts_Panel.md
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
  - "subagent policy"
  - "fanout thresholds"
  - "max parallel subagents"
  - "max cost per wave"
  - "bounded input limits"
  - "retry policy"
  - "mandatory"
  - "verification strictness"
  - "validators by WorkNode type"
  - "independent review"
  - "evidence-span"
  - "completion receipt"
  - "repair-loop policy"
  - "degraded-mode"
  - "parent-only writer"
  - "patch-only subagents"
  - "isolated worktree"
  - "single-writer lease"
  - "protected/governance unlock"
  - "approval boundary"
  - "auto-resume"
  - "checkpoint cadence"
  - "replan behavior"
  - "user interruption handling"
  - "true-blocker escalation"
  - "evidence retention"
  - "redaction"
negative_constraints:
  - Do not hardcode provider or model defaults.
  - Do not silently select arbitrary models when a required lane is missing.
  - Do not let Settings replace Models, Permissions, Worktree, Goal Runtime, Subagent, or Runtime Artifacts policy authority.
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Models_System.md
  - Plans/Permissions_System.md
  - Plans/Goal_Runtime_System.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Runtime_Artifacts_Panel.md
```

### F3-395 - Orchestrator Goal Surface Matrix

```yaml
plan_unit_id: F3-395
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The GUI must place Orchestrator Goal Runtime information across the Goal header, WorkGraph, Subagents tab, Verification tab, Evidence, Audit, History, Ledger, Dashboard, Agents page, Plan/PlanUnit, Source Control, Worktrees, Usage/cost, Settings, and Runtime Artifacts surfaces without moving runtime authority into the GUI. The gui_impact_matrix surface matrix shows goal_id, GoalRun state, WorkGraph status, active waves, bounded task, model/capability lane, input boundaries, output status, failure/retry state, SubagentWave state, VerificationCycle repair progress, receipts, blockers, evidence refs, worktree leases, isolated writes, parent merge/certification, write-surface ownership, blocked write reasons, low-end executor spend, subagent wave cost, high-end governance/verifier/adjudicator cost, budget guard outcomes, and lane/model binding blockers by consuming owner records from Goal_Runtime_System, Orchestrator_Page, Run_Graph_View, Runtime_Artifacts_Panel, WorktreeGitImprovement, Contracts_V0, storage-plan, Models_System, Permissions_System, and usage-feature.
gui_related: true
gui_classification_reason: This unit maps user-visible GoalRun, WorkGraph, verification, evidence, and source-control displays across GUI surfaces.
depends_on:
  - GRS-026
  - GRS-027
  - OP-022
  - RGV-012
  - RAP-027
  - CV-288
  - SP-215
  - MS-109
  - PS-115
  - W-071
  - PDS-006
  - PNC-009
  - UF-064
  - UF-069
unblocks: []
acceptance_criteria:
  - Orchestrator Goal surfaces show GoalRun, WorkGraph, SubagentWave, VerificationCycle, evidence, receipts, blockers, and lane/model configuration status.
  - GUI surfaces consume owner records rather than becoming scheduler, storage, contract, or model-policy authorities.
  - The matrix names where Goal header, WorkGraph, Subagents, Verification, Evidence, Audit, History, Ledger, Dashboard, Agents, Plan/PlanUnit, Source Control, Worktrees, Usage/cost, Settings, and Runtime Artifacts information appears.
  - Subagents tab surfaces show active waves, bounded task, model/capability lane, input boundaries, output status, and failure/retry state.
  - Blocked write reasons and unconfigured-lane states are visible where the user can recover them.
  - Evidence/Audit surfaces show WorkNode receipts, GoalCompletionReceipt, validator evidence, adjudication records, skipped validator reasons, unresolved risks, and certification status.
  - Source Control and Worktree surfaces expose worktree leases, isolated writes, parent merge/certification, write-surface ownership, and blocked write reasons.
  - Usage/cost surfaces show low-end executor spend, subagent wave cost, high-end governance/verifier/adjudicator cost, cost per GoalRun/WorkNode, and budget guard outcomes.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Orchestrator GUI placement review
risk_class: gui_projection_authority_drift
reasoning_tier: high
context_scope: orchestrator_goal_gui_surfaces
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Goal_Runtime_System.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Models_System.md
  - Plans/Permissions_System.md
  - Plans/usage-feature.md
  - Plans/Plan_Document_System.md
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
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0070
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0071
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0072
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0073
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0098
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0102
preserved_exact_tokens:
  - "Goal header"
  - "gui_impact_matrix"
  - "goal_id"
  - "WorkGraph"
  - "Subagents tab"
  - "Verification tab"
  - "Evidence"
  - "History"
  - "Ledger"
  - "Dashboard"
  - "Agents page"
  - "Plan/PlanUnit"
  - "Source Control"
  - "Worktrees"
  - "Usage"
  - "cost"
  - "Usage/cost"
  - "active waves"
  - "bounded task"
  - "model/capability lane"
  - "input boundaries"
  - "output status"
  - "failure/retry state"
  - "WorkNode receipts"
  - "GoalCompletionReceipt"
  - "validator evidence"
  - "adjudication records"
  - "unresolved risks"
  - "worktree leases"
  - "isolated writes"
  - "parent merge"
  - "write-surface"
  - "blocked write reasons"
  - "low-end executor"
  - "subagent wave cost"
  - "high-end governance"
  - "budget guard"
  - "unconfigured-lane"
negative_constraints:
  - Do not let GUI projection freshness authorize sensitive mutations.
  - Do not hide blocked write reasons or unconfigured-lane recovery actions.
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Goal_Runtime_System.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Models_System.md
  - Plans/Permissions_System.md
  - Plans/usage-feature.md
```
