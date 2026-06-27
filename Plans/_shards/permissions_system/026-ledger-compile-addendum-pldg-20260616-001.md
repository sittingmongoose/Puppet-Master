# Shard 026: Ledger Compile Addendum - pldg-20260616-001

Source: `Plans/Permissions_System.md`

Source lines: L7577-L7632

Source SHA256: `f1fa7497f2ef8e29a13dafdc3e67bff7fa0818a2b65c3ff2c1c9c4d79e8b0668`

---

## Ledger Compile Addendum - pldg-20260616-001

### PS-114 - Goal Runtime Approval Scope Consumer

```yaml
plan_unit_id: PS-114
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Permissions_System owns existing approval-scope, permission snapshot, approval reuse, and blocked-action payload rules consumed by Goal Runtime high-risk actions. Goal Runtime invokes approval and blocks invisible goals outside predeclared authority, but it does not redefine the permission ladder, approval-scope carryover, or blocked payload schema.
gui_related: false
gui_classification_reason: Approval scope, permission snapshots, and blocked-action payloads are permission/runtime policy, not visual presentation.
depends_on:
  - PS-113
  - CV-286
  - GRS-020
unblocks: []
acceptance_criteria:
  - Goal Runtime approval requests use permission-owned approval scope and permission snapshot semantics.
  - Invisible/internal goals block outside predeclared authority instead of inventing local permission rules.
  - Approval reuse and blocked-action payloads follow Permissions_System carryover and permission-ladder rules.
  - Goal Runtime source atoms support the approval boundary; Permissions_System remains the owner for approval-scope key shapes, snapshots, reuse, and blocked payload schemas.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Goal Runtime permission/approval review
risk_class: goal_runtime_permission_scope_drift
reasoning_tier: high
context_scope: goal_runtime_permissions
implementation_surfaces:
  - Plans/Permissions_System.md
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: goal_runtime_approval_scope_consumer
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0008
  - pldg-20260616-001-goal-runtime-system:atom-0108
  - pldg-20260616-001-goal-runtime-system:dec-0022
preserved_exact_tokens:
  - "approval_scope_key"
  - "permission snapshot"
  - "approval reuse"
  - "blocked-action payload"
  - "predeclared authority"
  - "explicit user approval"
negative_constraints:
  - Do not let Goal Runtime redefine the permission ladder.
  - Do not let invisible/internal goals exceed predeclared authority.
  - Do not infer new permission payload schemas solely from Goal Runtime approval-boundary atoms.
owner_hints:
  - Plans/Permissions_System.md
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
```
