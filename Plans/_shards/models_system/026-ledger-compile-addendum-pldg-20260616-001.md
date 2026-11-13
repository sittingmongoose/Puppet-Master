# Shard 026: Ledger Compile Addendum - pldg-20260616-001

Source: `Plans/Models_System.md`

Source lines: L7637-L7699

Source SHA256: `69f5bed57cd7eee0df3580a8811a098140d306bb4f3005759bb3304512d08765`

---

## Ledger Compile Addendum - pldg-20260616-001

### MS-108 - Goal Runtime Model Role Resolution Consumer

```yaml
plan_unit_id: MS-108
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  The Goal Runtime worker/planner/evaluator/verifier/adjudicator model-role cast, worker_default policy
  and certification-owned model selectors are retired with Goal V2. Goals use ordinary Assistant model
  selection; a separate Review chooses checking models through its invocation sheet. Models_System still
  owns requested/effective model identity and capability evidence. The old role words remain
  compatibility/source-lineage only, never active Settings or Goal-owned model policy.
gui_related: false
gui_classification_reason: Concrete model-role resolution and capability evidence are backend provider/model policy; F3-393 owns the visible Settings selectors.
depends_on:
- MS-017
- MS-073
- MS-074
- GRS-049
unblocks: []
acceptance_criteria:
- Goals use the ordinary Assistant model resolver and expose no worker/verifier selectors.
- Legacy role-policy values are inert compatibility reads and cannot recreate retired Goal roles.
- Independent checking and implementation remain distinct work requests under MS-109.
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
- Do not revive Goal model-role policy or certification tier semantics from compatibility data.
owner_hints:
  - Plans/Models_System.md
  - Plans/Goal_Runtime_System.md
  - Plans/Multi-Account.md
```
