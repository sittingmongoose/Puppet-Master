# Shard 011: Ledger Compile Addendum - pldg-20260630-001-feature-intake

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L250-L339

Source SHA256: `942cf815f2a832d29fafd5e4742b9c5510b33a009d3f44160784db2e7a713fb4`

---

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host subagent and agent-harness obligations from bootstrap ledger `pldg-20260630-001-feature-intake`. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, production build tasks, generated governance artifacts, or a governance seal.

### OSI-431 - Subagent Host Capability Context And Authority Clamp

```yaml
plan_unit_id: OSI-431
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Subagents and agent harnesses may receive containerized-host capability context only under the parent goal, run mode,
  execution_unit_context, worktree/jail policy, permission snapshot, FileSafe scope, and host assignment ceiling inherited
  from the supervising PM surface. Child agents can consume host_capability_ref, host_profile_id, host_assignment_id,
  host_execution_receipt, cleanup_retention_receipt, and blocker payloads, but they cannot bypass parent authority, create
  hidden provider-local host channels, escalate from HTE to DAE, bypass FileSafe, or reinterpret blocked host outcomes as
  execution failures or successes. Parent synthesis reconciles child host receipts, orphaned_instance cleanup, and blocked
  families such as child_permission_denied, dae_disallowed, host_unavailable, and orphaned_instance.
gui_related: false
gui_classification_reason: Subagent host-capability authority and receipt inheritance are orchestration/runtime behavior, not GUI presentation.
depends_on: [GRS-032, EP-109, RM-048, T-166, PS-126, F2-194]
unblocks: []
acceptance_criteria:
  - Subagent handoff records carry host capability context only with inherited permission ceiling, run mode, execution_unit_context_ref, and host_assignment_id.
  - Child agents cannot create or use a hidden provider-local host channel outside PM tool, Executor, Permission, FileSafe, and receipt paths.
  - DAE subagents remain jailed and reconcile through PM; child tasks cannot silently escalate from parent HTE posture.
  - Parent synthesis preserves host_execution_receipt, cleanup_retention_receipt, subagent outcome, and blocked_reason_code families.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future subagent host-capability authority fixture
risk_class: subagent_host_authority_bypass
reasoning_tier: high
context_scope: containerized_host_subagent_authority
implementation_surfaces:
  - Plans/orchestrator-subagent-integration.md
  - future subagent handoff and child-run receipt records
node_compile_hint:
  mode: subagent_host_authority_clamp
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0029
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0034
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0040
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0044
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0047
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0053
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0060
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0069
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0079
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#execution_lane_matrix
source_atom_ids: [atom-0029, atom-0034, atom-0040, atom-0044, atom-0047, atom-0053, atom-0060, atom-0069, atom-0079]
preserved_exact_tokens:
  - "agent harnesses"
  - "subagents"
  - "execution_unit_context_ref"
  - "host_assignment_id"
  - "host_execution_receipt"
  - "child_permission_denied"
  - "dae_disallowed"
  - "host_unavailable"
  - "orphaned_instance"
negative_constraints:
  - Do not let child agents bypass parent mode or permission ceiling.
  - Do not create hidden provider-local host channels.
  - Do not treat blocked host outcomes as execution failures or successes.
owner_hints:
  - Plans/orchestrator-subagent-integration.md
  - Plans/Goal_Runtime_System.md
  - Plans/Executor_Protocol.md
  - Plans/Tools.md
```

### Subagent Selector
Subagent selection preserves the same runtime identity packet used by the owner contract.

Required runtime identity carry-through:
- `requested_account_id`
- `effective_account_id`
- `requested_account_binding`
- `requested_account_policy`
- `operational_identity`
- `tool_use_id`

Rules:
- Child-run routing keeps requested and effective account identity explicit.
- `requested_account_binding` and `requested_account_policy` survive into delegated runtime selection and audit.
- `operational_identity` and `tool_use_id` survive into lineage, approval, and usage joins.
- Subagent selection is a `/consumer` of the shared runtime-account owner contracts: it preserves `requested_account_binding` and `operational_identity` without local substitute fields, keeps requested/effective account and `effective-account` disclosure aligned to `Plans/Contracts_V0.md`, `Plans/Multi-Account.md`, and `Plans/storage-plan.md`, and enforces owner/consumer boundaries for account-binding fields.
