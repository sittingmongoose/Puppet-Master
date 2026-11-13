# Shard 049: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/FinalGUISpec.md`

Source lines: L27454-L27656

Source SHA256: `50e00d67a61f15d8c93c7d8953f478927de33ec39de9e98ddf8df47e97f610d1`

---

## Ledger Compile Addendum - pldg-20260616-002

### F3-394 - Settings Capability Lane Bindings

```yaml
plan_unit_id: F3-394
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Settings must expose shared model defaults without becoming the policy owner. The one Default models list offers Planning and supervising, Everyday building, Easy, routine jobs, Design and layout, The hardest jobs and Checking finished work, resolved through Models_System MS-109 with configured providers, accounts and model profiles. A blank job names its inherited source and current model/depth; Easy, routine jobs follows Everyday building and never checks work. The old capability-lane binding editor and helper model/depth rows are retired. The Goal Runtime and GoalRun subagent-wave, verification, write-policy and replan controls are retired by DL-478; Goals use the initiating chat model and GRS-050 evidence without a Goal-owned checking step. A required job with no usable model after named inheritance surfaces a typed blocked state with recovery actions before dispatch; no arbitrary runtime behavior is selected.
gui_related: true
gui_classification_reason: This unit defines visible shared Default models controls and blocked-state recovery.
depends_on:
- MS-109
- PS-115
- GRS-049
- W-071
- RAP-027
unblocks: []
acceptance_criteria:
  - Settings expose the six MS-109 job defaults, including Easy, routine jobs, with model/depth chosen in the shared overlay picker.
  - Job selectors bind to configured providers, accounts and model profiles; blank rows disclose their named source and effective pair.
  - A required job with no usable model after inheritance surfaces a typed blocked state and recovery path.
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
  - "configured providers"
  - "model profiles"
negative_constraints:
  - Do not hardcode provider or model defaults.
  - Do not silently select arbitrary models when a required job has no usable model.
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
  The GUI must place Goal and Orchestrator execution information across the WorkGraph, Subagents tab, Evidence, Audit, History, Ledger, Dashboard, Agents page, Plan/PlanUnit, Source Control, Worktrees, Usage/cost, Settings, and Runtime Artifacts surfaces without moving runtime authority into the GUI. The GoalRun, SubagentWave and VerificationCycle surfaces and Goal certification are retired by DL-478 (Jared, 2026-11-12, "Sweep and retire all"): no Goal header, Verification tab, wave state or wave cost, verification repair progress, Goal certification status or verifier/adjudicator cost remains. A Goal shows only its own record and lifecycle (GRS-048), in its chat's Goal Activity domain (GRS-055) and in the Dashboard's Goal widgets below, and a review or certification that a workflow runs is that workflow's own (GRS-049). The gui_impact_matrix surface matrix shows goal_id and Goal state, WorkGraph status, bounded task, model/capability lane, input boundaries, output status, failure/retry state, receipts, blockers, evidence refs, worktree leases, isolated writes, parent merge, write-surface ownership, blocked write reasons, cost per WorkNode, budget guard outcomes, and lane/model binding blockers by consuming owner records from Goal_Runtime_System, Orchestrator_Page, Run_Graph_View, Runtime_Artifacts_Panel, WorktreeGitImprovement, Contracts_V0, storage-plan, Models_System, Permissions_System, orchestrator-subagent-integration, and usage-feature. Restored 2026-11-12 (DL-477, Jared: "Restore it"): the Agents page, which is the Agents panel of F3-452 and F3-477, shows reliability metrics for each agent beside its per-agent economics: how many of its recorded operations completed, how many failed, crashed or were aborted, how many were retried, and the share that completed, read from the coordination records that OSI-432 owns. An agent with nothing recorded shows n/a, never 0 or a rate, and the metrics are display only: they never route, rank, admit, block or choose a model for an agent. Dashboard: the Home board's default set holds five summary widgets the user can remove, Active goals, Stuck or blocked goals, Verification and repair status, Certification state, and Cost and budget warnings (Plans/Widget_System.md#WS-032, Appendix C, DL-477); the first two read Goal state, and the next two read the status of workflow-owned reviews and certifications, never a Goal's.
gui_related: true
gui_classification_reason: This unit maps user-visible Goal, WorkGraph, evidence, Agents reliability, Dashboard summary, and source-control displays across GUI surfaces.
depends_on:
  - GRS-048
  - GRS-049
  - GRS-053
  - GRS-055
  - RAP-027
  - CV-288
  - MS-109
  - PS-115
  - W-071
  - PDS-006
  - PNC-009
  - UF-064
  - UF-069
  - F3-477
  - OSI-432
  - WS-032
unblocks: []
acceptance_criteria:
  - Goal and Orchestrator surfaces show goal_id and Goal state, WorkGraph, evidence, receipts, blockers, and lane/model configuration status.
  - GUI surfaces consume owner records rather than becoming scheduler, storage, contract, or model-policy authorities.
  - The matrix names where WorkGraph, Subagents, Evidence, Audit, History, Ledger, Dashboard, Agents, Plan/PlanUnit, Source Control, Worktrees, Usage/cost, Settings, and Runtime Artifacts information appears.
  - Subagents tab surfaces show bounded task, model/capability lane, input boundaries, output status, and failure/retry state.
  - Blocked write reasons and unconfigured-lane states are visible where the user can recover them.
  - Evidence/Audit surfaces show WorkNode receipts, validator evidence, skipped validator reasons, and unresolved risks.
  - Source Control and Worktree surfaces expose worktree leases, isolated writes, parent merge, write-surface ownership, and blocked write reasons.
  - Usage/cost surfaces show cost per WorkNode and budget guard outcomes.
  - The Agents page shows each agent's reliability metrics (completed, failed, crashed or aborted, and retried counts and the share that completed) from OSI-432 coordination records beside its F3-477 economics, shows n/a when nothing is recorded, and never uses them to route, rank, admit, block or choose a model.
  - The Dashboard's Goal, review, certification, and cost summaries are the five default-on, removable Home board widgets of WS-032.
  - No GoalRun, SubagentWave, VerificationCycle, Goal header, Verification tab, or Goal certification surface remains.
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
  - Plans/orchestrator-subagent-integration.md
  - Plans/Widget_System.md
node_compile_hint:
  mode: orchestrator_goal_surface_matrix
  create_worknodes: false
source_lineage:
  - "Plans/Decision_Log.md#DL-477 (Jared 2026-11-12: Agents reliability metric restored; Dashboard summary widgets default on and removable)"
  - "DL-478 (Jared 2026-11-12, Sweep and retire all: GoalRun, SubagentWave, VerificationCycle and Goal certification surfaces retired)"
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
  - "gui_impact_matrix"
  - "goal_id"
  - "WorkGraph"
  - "Subagents tab"
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
  - "bounded task"
  - "model/capability lane"
  - "input boundaries"
  - "output status"
  - "failure/retry state"
  - "WorkNode receipts"
  - "validator evidence"
  - "unresolved risks"
  - "worktree leases"
  - "isolated writes"
  - "parent merge"
  - "write-surface"
  - "blocked write reasons"
  - "budget guard"
  - "unconfigured-lane"
  - "reliability metrics"
  - "Restore it"
negative_constraints:
  - Do not let GUI projection freshness authorize sensitive mutations.
  - Do not hide blocked write reasons or unconfigured-lane recovery actions.
  - Do not restore GoalRun, SubagentWave, VerificationCycle, verifier/adjudicator cost, or Goal certification surfaces (DL-478).
  - Do not show verification, repair, or certification state as a Goal's; reviews and certifications belong to the workflow that runs them (GRS-049).
  - Do not let reliability metrics route, rank, admit, block, or choose a model for an agent.
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
  - Plans/orchestrator-subagent-integration.md
  - Plans/Widget_System.md
```
