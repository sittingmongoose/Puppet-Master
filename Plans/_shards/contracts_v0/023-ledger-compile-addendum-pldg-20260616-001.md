# Shard 023: Ledger Compile Addendum - pldg-20260616-001

Source: `Plans/Contracts_V0.md`

Source lines: L17063-L17189

Source SHA256: `7b5dc9f5aef7a0b4f76b66f768f75a5b8f7f338df90537be73bdc6bf096a61bd`

---

## Ledger Compile Addendum - pldg-20260616-001

### CV-286 - Goal Runtime Shared Record Envelope

```yaml
plan_unit_id: CV-286
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts_V0 owns shared envelope fields for Goal Runtime goal events and receipts, including goal_id, optional parent_goal_id, goal_revision, optional expected_goal_revision where compare-and-swap applies, receipt/degraded/stopped/blocked outcome refs, actor/execution_role, requested/effective provider/model/account refs, evidence refs, and approval/block refs. Goal_Runtime_System owns Goal Runtime semantics; storage-plan owns persistence/projection and concrete payload schemas; Permissions_System owns approval scope. CV-286 does not register concrete Goal event names or implementation-ready payload schemas.
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
  - Concrete Goal event names and payload schemas remain deferred until registered by the Contracts/storage owners.
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
  - "goal_revision"
  - "expected_goal_revision"
  - "receipt/degraded/stopped/blocked outcome refs"
  - "actor/execution_role"
  - "requested/effective provider/model/account refs"
  - "evidence refs"
  - "approval/block refs"
negative_constraints:
  - Do not move Goal Runtime lifecycle semantics into Contracts_V0.
  - Do not infer provider/model/account identity from provider-native session ids alone.
  - Do not treat CV-286 as implementation-ready concrete Goal event payload registration.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Goal_Runtime_System.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
```

### CV-287 - Deferred Goal Runtime Event Schema Registration Boundary

```yaml
plan_unit_id: CV-287
unit_type: deferred_decision
status: deferred
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Concrete persisted Goal Runtime event names and cross-contract payload minima remain deferred until registered in Contracts_V0. Concrete Goal event payload schemas remain storage-owned in storage-plan when promoted. Goal_Runtime_System owns behavior and event semantics; this boundary prevents shared-envelope fields from being mistaken for complete implementation-ready event schema registration.
gui_related: false
gui_classification_reason: Event schema registration and owner boundaries are contract/governance behavior, not visual presentation.
depends_on:
  - CV-286
  - GRS-005
  - GRS-007
unblocks: []
acceptance_criteria:
  - Implementers do not treat CV-286 shared envelope fields as complete concrete Goal event payload schemas.
  - Future concrete Goal event registration names both Contracts_V0 and storage-plan owner responsibilities.
  - Goal_Runtime_System remains the semantic owner for Goal Runtime event behavior.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Goal Runtime event schema registration review
risk_class: goal_event_schema_under_specified
reasoning_tier: high
context_scope: goal_runtime_shared_contracts
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: deferred_goal_event_schema_registration
  create_worknodes: false
source_lineage:
  - source_ref:audit-20260616-006-goal-runtime-system:SR-019
  - Plans/Goal_Runtime_System.md:Goal event log
  - Plans/storage-plan.md:SP-214
preserved_exact_tokens:
  - "Concrete persisted Goal Runtime event names"
  - "payload schemas"
  - "deferred"
  - "shared-envelope fields"
negative_constraints:
  - Do not invent concrete Goal event payload schemas in this repair.
  - Do not treat shared envelope registration as full event payload registration.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Goal_Runtime_System.md
```
