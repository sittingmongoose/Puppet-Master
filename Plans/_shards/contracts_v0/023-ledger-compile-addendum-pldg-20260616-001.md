# Shard 023: Ledger Compile Addendum - pldg-20260616-001

Source: `Plans/Contracts_V0.md`

Source lines: L17054-L17126

Source SHA256: `bd800694f4803d027eaf740d5cd2c17305f43c4857ef622bd9738d48a5b4f18e`

---

## Ledger Compile Addendum - pldg-20260616-001

### CV-286 - Goal Runtime Shared Record Envelope

```yaml
plan_unit_id: CV-286
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts_V0 owns shared envelope fields for Goal Runtime goal events and receipts, including goal_id, optional parent_goal_id, revision, receipt/degraded/stopped/blocked outcome refs, actor/execution_role, requested/effective provider/model/account refs, evidence refs, and approval/block refs. Goal_Runtime_System owns Goal Runtime semantics; storage-plan owns persistence/projection; Permissions_System owns approval scope.
gui_related: false
gui_classification_reason: Shared runtime envelope fields are contract/schema behavior, not visual presentation.
depends_on:
  - CV-145
  - CV-255
  - GRS-005
  - GRS-012
  - GRS-014
  - GRS-017
  - GRS-020
unblocks: []
acceptance_criteria:
  - Goal Runtime event and receipt records have stable shared envelope fields for goal identity, parent identity, revision, outcome refs, actor/execution role, requested/effective provider/model/account refs, evidence refs, and approval/block refs.
  - Goal_Runtime_System keeps behavior semantics while Contracts_V0 keeps cross-surface envelope names.
  - Storage and permission owners consume the shared envelope without redefining Goal Runtime lifecycle semantics.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Goal Runtime contract/schema review
risk_class: runtime_contract_owner_gap
reasoning_tier: high
context_scope: goal_runtime_shared_contracts
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Goal_Runtime_System.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
node_compile_hint:
  mode: goal_runtime_shared_envelope_contract
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0031
  - pldg-20260616-001-goal-runtime-system:atom-0032
  - pldg-20260616-001-goal-runtime-system:atom-0033
  - pldg-20260616-001-goal-runtime-system:atom-0034
  - pldg-20260616-001-goal-runtime-system:atom-0047
  - pldg-20260616-001-goal-runtime-system:atom-0048
  - pldg-20260616-001-goal-runtime-system:atom-0049
  - pldg-20260616-001-goal-runtime-system:atom-0104
  - pldg-20260616-001-goal-runtime-system:atom-0105
  - pldg-20260616-001-goal-runtime-system:atom-0109
preserved_exact_tokens:
  - "goal_id"
  - "parent_goal_id"
  - "revision"
  - "receipt/degraded/stopped/blocked outcome refs"
  - "actor/execution_role"
  - "requested/effective provider/model/account refs"
  - "evidence refs"
  - "approval/block refs"
negative_constraints:
  - Do not move Goal Runtime lifecycle semantics into Contracts_V0.
  - Do not infer provider/model/account identity from provider-native session ids alone.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Goal_Runtime_System.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
```
