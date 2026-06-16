# Shard 025: Ledger Compile Addendum - pldg-20260616-001

Source: `Plans/Models_System.md`

Source lines: L7270-L7332

Source SHA256: `6da0c29a05f08d750d91c32658484506b8ec1e8eac510c6af4b41cdbf3c7879c`

---

## Ledger Compile Addendum - pldg-20260616-001

### MS-108 - Goal Runtime Model Role Resolution Consumer

```yaml
plan_unit_id: MS-108
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  Models_System owns concrete requested/effective model resolution and capability-fit reporting for Goal Runtime worker, planner, evaluator, verifier, and adjudicator roles. Goal_Runtime_System owns certification-tier policy and block/degrade semantics; Models_System returns capability fit, selected effective model, and unsupported/blocked reason without hard-coding provider defaults.
gui_related: true
gui_classification_reason: Model role resolution feeds visible model selectors and Settings surfaces, though this unit owns model-resolution behavior rather than layout.
depends_on:
  - MS-017
  - MS-073
  - MS-074
  - GRS-010
unblocks: []
acceptance_criteria:
  - Goal Runtime role policies can request model resolution for worker, planner, evaluator, verifier, and adjudicator roles.
  - Resolution exposes requested/effective model identity, capability fit, and unsupported or blocked reason for each role where relevant.
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
  - Plans/FinalGUISpec.md
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
  - "capability fit"
  - "unsupported/blocked reason"
negative_constraints:
  - Do not hard-code provider defaults in Models_System for Goal Runtime certification correctness.
  - Do not collapse verifier/adjudicator and worker model roles into one effective selection.
owner_hints:
  - Plans/Models_System.md
  - Plans/Goal_Runtime_System.md
  - Plans/Multi-Account.md
  - Plans/FinalGUISpec.md
```
