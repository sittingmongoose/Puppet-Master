# Shard 034: Ledger Compile Addendum - pldg-20260630-001-feature-intake

Source: `Plans/Permissions_System.md`

Source lines: L8495-L8592

Source SHA256: `09de784b5bcb5fc6bfc78c581abfe7956deb1ffec88e2cd0cada9156fd16f907`

---

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host trust, permission, secret, approval, network, and destructive-action gates. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### PS-126 - Containerized Host Trust Permission Secret And Approval Gates

```yaml
plan_unit_id: PS-126
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Containerized-host security fails closed. Discovery, configuration, GUI availability, or a selected host profile is
  not execution approval. Host operations require scoped trust state, permission_snapshot_id, approval_scope_key,
  network_access_policy, secret_access_policy, destructive_command_policy, FileSafe scope, target-bound approvals,
  redaction, and receipt logging before mutation, attach, port exposure, image push, remote SSH, Kubernetes, Unraid,
  registry write, Docker socket, privileged DinD, secret injection, or external side effect. Blocked permission,
  FileSafe, trust, policy, network, and test-gap outcomes remain `blocked != failed` and expose allowed_action_ids plus
  blocked_reason_code rather than silent failure.
gui_related: false
gui_classification_reason: Permission, trust, and approval gates are backend policy behavior, not GUI presentation.
depends_on: [CV-303, CV-304, F2-194, RM-048]
unblocks: [CRAU-091, EP-109, T-166, ATS-019, RAP-042]
acceptance_criteria:
  - Discovery/configuration cannot grant execution, attach, expose-port, push, remote, Kubernetes, Unraid, registry, Docker socket, privileged DinD, or secret-injection authority.
  - Every high-risk host action binds approval to target, host profile/capability, runtime family, permission snapshot, trust policy, and expected receipts.
  - Blocked outcomes preserve blocked_reason_code, blocked scope, policy source, required action, allowed_action_ids, and evidence refs.
  - Raw secrets never appear in host profiles, prompts, GUI, logs, receipts, exports, diagnostics, or evidence.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future containerized host permission and blocked-outcome fixtures
  - future privileged DinD default-disabled fixture
risk_class: containerized_host_permission_bypass
reasoning_tier: high
context_scope: containerized_host_permissions
implementation_surfaces:
  - Plans/Permissions_System.md
  - future host permission policy
node_compile_hint:
  mode: containerized_host_trust_permission_gates
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0018
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0019
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0029
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0034
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0037
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0038
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0044
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0050
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0053
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0060
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0067
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0068
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0069
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0074
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0077
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0079
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0081
source_atom_ids: [atom-0018, atom-0019, atom-0029, atom-0034, atom-0037, atom-0038, atom-0044, atom-0050, atom-0053, atom-0060, atom-0067, atom-0068, atom-0069, atom-0074, atom-0077, atom-0079, atom-0081]
decision_refs: [dec-0005, dec-0008, dec-0017, dec-0020]
preserved_exact_tokens:
  - "approval_scope_key"
  - "permission_snapshot_id"
  - "network_access_policy"
  - "secret_access_policy"
  - "destructive_command_policy"
  - "host trust profile"
  - "discovery is not execution approval"
  - "fails closed"
  - "target-bound approval"
  - "Docker socket"
  - "privileged DinD"
  - "remote SSH"
  - "Kubernetes"
  - "Unraid"
  - "registry writes"
  - "port exposure"
  - "secret injection"
  - "blocked != failed"
  - "permission_denied"
  - "filesafe_blocked"
  - "network_blocked_by_policy"
negative_constraints:
  - Do not equate discovery/configuration/GUI availability with permission to mutate, attach, expose ports, push images, inject secrets, or use remote hosts.
  - Do not allow privileged or remote side effects through generic tool approval or hidden defaults.
  - Do not describe privileged runtime support as a broad trusted mode.
  - Do not count blocked permission/FileSafe/policy outcomes as execution failures.
  - Do not expose raw secrets in records, prompts, GUI, receipts, exports, diagnostics, or evidence.
owner_hints:
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
  - Plans/Contracts_V0.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Executor_Protocol.md
  - Plans/Run_Modes.md
```
