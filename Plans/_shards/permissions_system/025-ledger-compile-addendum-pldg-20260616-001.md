# Shard 025: Ledger Compile Addendum - pldg-20260616-001

Source: `Plans/Permissions_System.md`

Source lines: L7534-L7587

Source SHA256: `4be9900cf0a2aabf1521b9783d782db1afe0eb4225c440a71441ce19932f21fc`

---

## Ledger Compile Addendum - pldg-20260616-001

### PS-114 - Goal Runtime Approval Scope Consumer

```yaml
plan_unit_id: PS-114
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Permissions_System owns approval_scope_key, permission snapshot, approval reuse, and blocked-action payload behavior for Goal Runtime high-risk actions. Goal Runtime invokes approval and blocks invisible goals outside predeclared authority, but it does not redefine the permission ladder or approval-scope carryover rules.
gui_related: false
gui_classification_reason: Approval scope, permission snapshots, and blocked-action payloads are permission/runtime policy, not visual presentation.
depends_on:
  - PS-113
  - CV-286
  - GRS-020
unblocks: []
acceptance_criteria:
  - Goal Runtime approval requests use permission-owned approval_scope_key and permission snapshot semantics.
  - Invisible/internal goals block outside predeclared authority instead of inventing local permission rules.
  - Approval reuse and blocked-action payloads follow Permissions_System carryover and permission-ladder rules.
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
owner_hints:
  - Plans/Permissions_System.md
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
```
