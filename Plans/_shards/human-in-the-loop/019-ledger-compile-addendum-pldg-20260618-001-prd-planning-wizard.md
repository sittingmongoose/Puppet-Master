# Shard 019: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/human-in-the-loop.md`

Source lines: L2464-L2555

Source SHA256: `9a1e98a6713f49fb21d5ee872176e6931760f952f4e30a255c4d2c8878314e2b`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### HITL-037 - Testing Overrides, High-Risk Checkpoints, And Exceptional User Decisions

```yaml
plan_unit_id: HITL-037
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: 'atom-0053: The controller answers auto-resolvable gaps from evidence, applies safe defaults with recorded assumptions, and defers downstream-only details; it asks the user only for genuine product direction, risk acceptance, destructive authority, credentials, legal policy, or irreconcilable ambiguity. atom-0062: Security, data destruction, billing, migration, legal/compliance, irreversible external effects, or similarly high-risk decisions may require explicit user confirmation under HITL policy. atom-0081: Disabling or restricting automated testing requires a durable testing_policy_override explicitly approved by the user for exact projects, PlanUnits, WorkNodes, capability classes, reasons, risks, and reopen conditions. atom-0087: Global or privileged installation, paid services, license acceptance, account creation, credential use, device enrollment, or material external effects require applicable authority and may become a typed blocker rather than an unsafe silent
  install. atom-0139: The only permitted incomplete item is a user_approved_incomplete_item naming the exact artifact and span, reason, risk, approver, downstream disposition, expiration or reopen condition, and evidence; broad permission to leave TODOs is invalid. atom-0143: Classify gaps as auto_resolvable, safe_default_with_assumption, defer_to_plan_compile, defer_to_worknode_system, requires_user_policy_decision, requires_user_risk_acceptance, requires_external_credential, or true infrastructure/runtime blocker. atom-0144: Only product policy with no safe inference, material risk acceptance, destructive or irreversible operations, credentials or permissions, legal/compliance authority, or irreconcilable user preference conflicts may block for user decision.'
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- PYTHONPATH=/private/tmp/pm-py-deps python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: implementation_readiness
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/human-in-the-loop.md
- Plans/Planning_Wizard.md
- Plans/Automated_Testing_System.md
- Plans/Contracts_V0.md
- Plans/Permissions_System.md
- Plans/Progression_Gates.md
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0053
- pldg-20260618-001-prd-planning-wizard:atom-0062
- pldg-20260618-001-prd-planning-wizard:atom-0081
- pldg-20260618-001-prd-planning-wizard:atom-0087
- pldg-20260618-001-prd-planning-wizard:atom-0139
- pldg-20260618-001-prd-planning-wizard:atom-0143
- pldg-20260618-001-prd-planning-wizard:atom-0144
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/07-audit-readiness-and-safety.md#SRC-AUDIT
source_atom_ids:
- atom-0053
- atom-0062
- atom-0081
- atom-0087
- atom-0139
- atom-0143
- atom-0144
decision_refs:
- dec-0016
- dec-0017
- dec-0027
correction_refs:
- corr-0007
- corr-0010
preserved_exact_tokens:
- safe defaults
- minimal HITL
- high-risk checkpoint
- testing_policy_override
- privileged installation
- paid service
- license acceptance
- user_approved_incomplete_item
- auto_resolvable
- safe_default_with_assumption
- requires_user_risk_acceptance
- exceptional user decision
negative_constraints:
- Do not convert ordinary planning uncertainty into a Needs user decision blocker.
- Do not infer an opt-out from casual conversation or a capability setting being unavailable.
- Do not accept a broad 'allow TODOs' exception.
- Do not block on ordinary details that safe defaults, evidence, or downstream stages can resolve.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/human-in-the-loop.md
- Plans/Automated_Testing_System.md
- Plans/Contracts_V0.md
- Plans/Permissions_System.md
- Plans/Progression_Gates.md
- Plans/Goal_Runtime_System.md
```
