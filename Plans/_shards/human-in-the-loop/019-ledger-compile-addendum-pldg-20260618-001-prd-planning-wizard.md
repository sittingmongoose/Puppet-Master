# Shard 019: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/human-in-the-loop.md`

Source lines: L2523-L2643

Source SHA256: `1cdfb7b5831131f91336e60315b7ae325a3cf2e112724c4d2ec06a6349a0ba58`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### HITL-037 - Testing Overrides, High-Risk Checkpoints, And Exceptional User Decisions

```yaml
plan_unit_id: HITL-037
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: The controller answers auto-resolvable gaps from evidence, applies safe defaults with recorded
  assumptions, and defers downstream-only details; it asks the user only for genuine product direction, risk
  acceptance, destructive authority, credentials, legal policy, or irreconcilable ambiguity. Security, data
  destruction, billing, migration, legal/compliance, irreversible external effects, or similarly high-risk
  decisions may require explicit user confirmation under HITL policy. Disabling or restricting automated testing
  requires a durable testing_policy_override explicitly approved by the user for exact projects, PlanUnits,
  WorkNodes, capability classes, reasons, risks, and reopen conditions. Global or privileged installation,
  paid services, license acceptance, account creation, credential use, device enrollment, or material external
  effects require applicable authority and may become a typed blocker rather than an unsafe silent install.
  The only permitted incomplete item is a user_approved_incomplete_item naming the exact artifact and span,
  reason, risk, approver, downstream disposition, expiration or reopen condition, and evidence; broad permission
  to leave TODOs is invalid. Classify gaps as auto_resolvable, safe_default_with_assumption, defer_to_plan_compile,
  defer_to_worknode_system, requires_user_policy_decision, requires_user_risk_acceptance, requires_external_credential,
  or true infrastructure/runtime blocker. Only product policy with no safe inference, material risk acceptance,
  destructive or irreversible operations, credentials or permissions, legal/compliance authority, or irreconcilable
  user preference conflicts may block for user decision. Existing applicable authority includes the exact PS-146
  YOLO publication/Y1 ruling and PS-147 approved build grant; this general risk list must not re-prompt for
  their covered actions. Grant issuance/expansion, paid signup, protected secrets/auth/trust and any unowned
  or unlisted risky effect still require their own person decision under HITL-038. A named pre-existing resource
  does not become deletion authority.
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual
  presentation.
depends_on:
- HITL-038
- PS-146
- PS-147
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical
  product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits
  through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts,
  or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
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
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards Y1/O1–O3
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "Isnt orchestrator
  going to need a lot of permissions to fully build an entire platform from plans that the planning wizard
  makes? Its hands off from the human in that process so I would think so."'
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
