# Shard 026: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/Models_System.md`

Source lines: L7331-L7399

Source SHA256: `f19bad2aebb5d8c4d8e4b3fc3e824c0f9dfb893b4403113f0dc11c062a70d1be`

---

## Ledger Compile Addendum - pldg-20260616-002

### MS-109 - Orchestrator Capability Lane Binding Policy

```yaml
plan_unit_id: MS-109
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  Models_System owns model and provider resolution for Orchestrator Goal Runtime capability_lane and agent_role bindings. Required lane roles include low_cost_executor, standard_reviewer, high_reasoning_orchestrator, verifier, adjudicator, and certifier. Resolution must use configured providers, accounts, and model profiles, expose requested/effective identity and capability evidence, and return unconfigured-lane blockers when a required lane has no valid binding.
gui_related: false
gui_classification_reason: Lane binding resolution is backend model/provider policy; FinalGUISpec owns visible Settings controls.
depends_on:
  - MS-108
unblocks: []
acceptance_criteria:
  - Model resolution accepts capability_lane and agent_role inputs for Orchestrator Goal Runtime.
  - Required lane roles resolve through configured providers, accounts, and model profiles.
  - requested/effective identity and capability evidence are exposed to runtime receipts and GUI projections.
  - Missing required bindings return unconfigured-lane blockers instead of selecting arbitrary defaults.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future capability-lane resolver review
risk_class: capability_lane_resolution_drift
reasoning_tier: high
context_scope: orchestrator_goal_model_policy
implementation_surfaces:
  - Plans/Models_System.md
  - Plans/FinalGUISpec.md
  - Plans/Multi-Account.md
  - Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: orchestrator_capability_lane_binding
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0027
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0028
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0029
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0030
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0031
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0032
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0033
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0034
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0038
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0055
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0090
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0092
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0093
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0102
preserved_exact_tokens:
  - "capability_lane"
  - "agent_role"
  - "low_cost_executor"
  - "standard_reviewer"
  - "high_reasoning_orchestrator"
  - "verifier"
  - "adjudicator"
  - "certifier"
  - "requested/effective"
  - "unconfigured-lane"
negative_constraints:
  - Do not hardcode provider/model defaults.
  - Do not let low-cost lanes certify parent GoalRun completion.
owner_hints:
  - Plans/Models_System.md
  - Plans/FinalGUISpec.md
  - Plans/Multi-Account.md
```
