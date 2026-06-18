# Shard 025: Ledger Compile Addendum - pldg-20260616-001

Source: `Plans/Models_System.md`

Source lines: L7270-L7329

Source SHA256: `24b8fb60b61da192fa3a50eb6394822c01af26fe24ca38c5617ef3f5bbd9f1d8`

---

## Ledger Compile Addendum - pldg-20260616-001

### MS-108 - Goal Runtime Model Role Resolution Consumer

```yaml
plan_unit_id: MS-108
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  Models_System owns concrete requested/effective model resolution for Goal Runtime worker, planner, evaluator, verifier, and adjudicator roles, plus model capability evidence needed by Goal_Runtime_System certification policy. Goal_Runtime_System owns block/degrade semantics, and provider-specific default tier mappings remain deferred.
gui_related: false
gui_classification_reason: Concrete model-role resolution and capability evidence are backend provider/model policy; F3-393 owns the visible Settings selectors.
depends_on:
  - MS-017
  - MS-073
  - MS-074
  - GRS-010
unblocks: []
acceptance_criteria:
  - Goal Runtime role policies can request model resolution for worker, planner, evaluator, verifier, and adjudicator roles.
  - Resolution exposes requested/effective model identity and capability evidence for each role where relevant.
  - Models_System does not override Goal Runtime certification-tier block/degrade semantics and does not hard-code provider defaults.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Goal Runtime model-role resolver review
risk_class: goal_runtime_model_resolution_drift
reasoning_tier: high
context_scope: goal_runtime_model_policy
implementation_surfaces:
  - Plans/Models_System.md
  - Plans/Goal_Runtime_System.md
  - Plans/Multi-Account.md
node_compile_hint:
  mode: goal_runtime_model_role_resolution
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0075
  - pldg-20260616-001-goal-runtime-system:atom-0076
  - pldg-20260616-001-goal-runtime-system:atom-0103
  - pldg-20260616-001-goal-runtime-system:atom-0104
  - pldg-20260616-001-goal-runtime-system:atom-0105
  - pldg-20260616-001-goal-runtime-system:dec-0018
  - pldg-20260616-001-goal-runtime-system:dec-0019
preserved_exact_tokens:
  - "worker_default"
  - "planner"
  - "evaluator"
  - "adjudicator"
  - "verifier"
  - "requested/effective model"
  - "capability evidence"
negative_constraints:
  - Do not hard-code provider defaults in Models_System for Goal Runtime certification correctness.
  - Do not collapse verifier/adjudicator and worker model roles into one effective selection.
owner_hints:
  - Plans/Models_System.md
  - Plans/Goal_Runtime_System.md
  - Plans/Multi-Account.md
```
