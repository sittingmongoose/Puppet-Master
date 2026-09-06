# Shard 029: Ledger Compile Addendum - pldg-20260630-001-feature-intake

Source: `Plans/Tools.md`

Source lines: L2529-L2608

Source SHA256: `151ae97002f04f5abb1a940614750fb3417e0c7ddec0b530358a58b333a2cc6f`

---

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host tool-context obligations from bootstrap ledger `pldg-20260630-001-feature-intake`. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, production build tasks, generated governance artifacts, or a governance seal.

### T-166 - Host Capability Context For Tools Shells And Integration Commands

```yaml
plan_unit_id: T-166
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  Tools, shells, and integration commands may consume containerized-host context through PM-owned host capability
  references and HostCapabilityCommand dispatch envelopes, but tool availability never grants host execution authority by
  itself. Tool calls, bounded shell-like actions, and service/database/API integration commands carry
  host_capability_ref, host_profile_id, host_assignment_id, execution_unit_context_ref, permission_snapshot_id,
  FileSafe scope, network_access_policy, secret_access_policy, destructive_command_policy, transcript policy,
  required receipt refs, cleanup expectations, and redaction profile where applicable. Provider tools receive host
  capability as context/capability input rather than direct provider authority, and all container exec or runtime
  operations remain mediated by Executor, Run Modes, Permissions, FileSafe, UI_Command_Catalog, and Runtime Artifacts
  receipt projection.
gui_related: false
gui_classification_reason: Tool capability context and dispatch policy are backend/tooling behavior, not user-visible visual presentation.
depends_on: [CV-303, CV-304, EP-109, RM-048, PS-126, F2-194]
unblocks: [MI-031, CBP-023, GRS-032, OSI-431]
acceptance_criteria:
  - Tools can reference host_capability_ref and host_profile_id without using backend runtime ids as PM identity.
  - Tool invocation events preserve permission_snapshot_id, host_preflight_receipt, host_execution_receipt, cleanup or blocker refs, and redaction policy where host resources are involved.
  - Provider tools, shells, and integration commands are denied or blocked with explicit blocker payloads when authority, FileSafe, secret, egress, or runtime gates fail.
  - Host-side commands such as lint, typecheck, format, git, package installs, static analysis, and browser tests stay host/worktree-side unless runtime services are required.
  - Container-runtime commands are used for service context, database/API/integration work, runtime-specific tests, logs, exec, and artifact capture only through PM-owned command and receipt paths.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future tool invocation and HostCapabilityCommand policy fixtures
risk_class: host_tool_authority_drift
reasoning_tier: high
context_scope: containerized_host_tool_context
implementation_surfaces:
  - Plans/Tools.md
  - future tool registry and shell/integration command dispatch
node_compile_hint:
  mode: host_capability_tool_context
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0023
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0040
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0044
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0047
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0053
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0064
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0069
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0073
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0081
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#execution_lane_matrix
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#control_plane_contract
source_atom_ids: [atom-0023, atom-0040, atom-0044, atom-0047, atom-0053, atom-0064, atom-0069, atom-0073, atom-0081]
preserved_exact_tokens:
  - "provider tools"
  - "shells"
  - "integration commands"
  - "host_capability_ref"
  - "host_profile_id"
  - "HostCapabilityCommand"
  - "tool invocation event"
  - "permission_snapshot_id"
  - "host_preflight_receipt"
  - "host_execution_receipt"
negative_constraints:
  - Do not let tool availability grant host execution authority.
  - Do not let container exec bypass Executor, Permissions, FileSafe, UI_Command_Catalog, Tools policy, or receipts.
  - Do not route every command through a container just because a host exists.
  - Do not expose raw secrets or unredacted provider, registry, SSH, or environment credentials through tool context.
owner_hints:
  - Plans/Tools.md
  - Plans/Executor_Protocol.md
  - Plans/Run_Modes.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
```
