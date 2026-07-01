# Shard 027: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/Models_System.md`

Source lines: L7511-L7596

Source SHA256: `056fde94e0a3c2cb427ccb80051ce9b356574db25f4853c5de88ad8cb0ec6274`

---

## Ledger Compile Addendum - pldg-20260616-002

### MS-109 - Orchestrator Capability Lane Binding Policy

```yaml
plan_unit_id: MS-109
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  Models_System owns model and provider resolution for Orchestrator Goal Runtime capability_lane and agent_role bindings. Required lane roles include low_cost_executor, standard_reviewer, high_reasoning_orchestrator, verifier, adjudicator, and certifier. Resolution must use configured providers, accounts, model profiles, and provider-specific owner docs such as Plans/Provider_OpenCode.md, expose requested/effective identity and capability evidence, and return unconfigured-lane blockers when a required lane has no valid binding. Old tier-era wording may remain only as compatibility/search aliases where necessary; capability_lane and agent_role are Models-owned binding inputs, while write_mode and certification_tier are consumed references from Goal Runtime, Contracts, storage, Permissions, and Worktree owner surfaces rather than Models-owned enforcement or certification semantics.
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
  - Legacy tier labels are treated only as compatibility/search aliases; capability_lane and agent_role remain Models-owned binding inputs, while write_mode and certification_tier are carried as owner-surface references rather than Models-owned enforcement or certification semantics.
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
  - Plans/Provider_OpenCode.md
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: orchestrator_capability_lane_binding
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0027
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0028
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0029
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0030
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0033
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0034
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0038
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0055
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0090
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0092
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0093
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0102
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0004
  - pldg-20260616-002-orchestrator-goal-runtime-flow:corr-0002
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
  - "compatibility/search aliases"
  - "tier-era wording"
  - "write_mode"
  - "certification_tier"
negative_constraints:
  - Do not hardcode provider/model defaults.
  - Do not resolve low_cost_executor lanes as verifier, adjudicator, or certifier roles.
  - Do not preserve old tier-era wording as the canonical execution model.
  - Do not make Models_System own write_mode enforcement, worktree lease policy, or certification semantics.
owner_hints:
  - Plans/Models_System.md
  - Plans/FinalGUISpec.md
  - Plans/Multi-Account.md
  - Plans/Provider_OpenCode.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/WorktreeGitImprovement.md
```
