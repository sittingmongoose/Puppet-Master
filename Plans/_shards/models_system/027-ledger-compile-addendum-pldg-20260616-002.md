# Shard 027: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/Models_System.md`

Source lines: L7701-L7804

Source SHA256: `69f5bed57cd7eee0df3580a8811a098140d306bb4f3005759bb3304512d08765`

---

## Ledger Compile Addendum - pldg-20260616-002

### MS-109 - Orchestrator Capability Lane Binding Policy

```yaml
plan_unit_id: MS-109
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  Model routing uses six jobs: Planning and supervising (overseer), Everyday building (worker), Easy,
  routine jobs (low_effort_worker), Design and layout (gui_frontend_worker), The hardest jobs
  (high_effort_worker), and Checking finished work (auditor). Resolve the configured model/depth through
  §2; a blank job follows Everyday model, except Easy, routine jobs follows Everyday building. Keep
  configured provider/account/model-profile identity, capability evidence and requested/effective
  receipts. Old low_cost_executor maps to low_effort_worker,
  standard_reviewer/verifier/adjudicator/certifier map to auditor, high_reasoning_orchestrator maps to
  overseer as compatibility input names only, without restoring retired Goal roles. Missing usable models
  after named inheritance return typed blocked states with recovery; never arbitrary defaults. Preserve
  per-piece build policies, parent ceilings and separate checking versus implementation selections.
  Helpers may use any parent-selected available model and effort; available means allowed and runnable
  under policy/parent ceilings, otherwise ordinary job/everyday defaults apply. Models owns no
  write_mode, lease or certification semantics.
gui_related: false
gui_classification_reason: Lane binding resolution is backend model/provider policy; FinalGUISpec owns visible Settings controls.
depends_on:
- MS-005
- MS-108
unblocks: []
acceptance_criteria:
- Six job routes resolve configured providers, accounts, model profiles and model/depth pairs.
- Easy, routine jobs inherits Everyday building when blank and handles only small, low-risk, non-GUI implementation.
- Legacy lane bindings are compatibility reads; ambiguous retired maps are disclosed and do not write new job
  defaults automatically.
- A required job with no usable model after inheritance blocks with recovery instead of choosing arbitrarily.
- Cheap implementation never acts as verifier, adjudicator or certifier; checking and implementation remain
  distinct requests.
- Parent-selected helper model and effort obey actual authority, availability and policy ceilings without a
  separate Settings row.
- Receipts preserve requested/effective identity and capability evidence.
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
- Do not resolve low_cost_executor or low_effort_worker as verifier, adjudicator or certifier work.
- Do not revive tier-era or Goal certification roles.
- Do not make Models own write_mode enforcement, worktree leases or certification semantics.
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
