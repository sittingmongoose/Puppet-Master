# Shard 033: Ledger Compile Addendum - pldg-20260630-001-feature-intake

Source: `Plans/Contracts_V0.md`

Source lines: L19068-L19252

Source SHA256: `fe90fc80e248a7b95f53ff541653411553e3aa052e64c578e3a37aa62265cf53`

---

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host shared envelope contracts. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### CV-303 - Host Capability Identity Receipt And Blocker Envelope

```yaml
plan_unit_id: CV-303
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Containerized hosts use PM-owned shared identity and receipt envelopes. `host_capability_ref` is the cross-surface
  capability reference used by Chat Assistant, Orchestrator/Run Graph, Executor/subagents, ATS, tools/MCP, and provider
  bridges. `host_profile_id` identifies reusable host templates/profiles. Concrete runtime facts such as container_id,
  compose_project, runtime_context, kube_context, namespace, workload_ref, CI job id, Unraid refs, and image/build refs
  stay backend facts under PM identities rather than primary cross-surface ids. Contract families include host profile,
  host instance, host assignment, build_artifact, port_access_record, capability_state, host_preflight_receipt,
  host_execution_receipt, cleanup_retention_receipt, and blocker_payload with permission_snapshot_id,
  filesafe_scope_ref, trust_policy_result, allowed_action_ids[], redaction_profile, retention_state, and
  blocked_reason_code.
gui_related: false
gui_classification_reason: Shared identity, envelope, and receipt contracts are backend data contracts, not visual presentation.
depends_on: [CV-002, 0PI-065]
unblocks: [CRAU-091, CRAU-092, CV-304, SP-226, ATS-019, EP-109, RAP-042]
acceptance_criteria:
  - Cross-surface consumers request hosts with host_capability_ref and reusable profiles with host_profile_id.
  - Backend Docker/Compose/Kubernetes/CI/Unraid ids are preserved as runtime facts without replacing PM identity.
  - Preflight, execution, cleanup/retention, port/access, and blocker envelopes carry permission, FileSafe, trust, redaction, allowed action, retention, and blocked reason fields.
  - Raw secrets are absent from profiles, artifacts, receipts, access records, exports, diagnostics, and GUI projections.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future host capability envelope schema fixtures
risk_class: host_identity_contract_drift
reasoning_tier: high
context_scope: containerized_host_identity_contracts
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - future host capability records
node_compile_hint:
  mode: host_capability_identity_receipt_envelope
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0012
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0015
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0016
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0025
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0026
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0040
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0047
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0048
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0058
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0063
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0066
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0067
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0072
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0075
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0078
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#core_contracts
source_atom_ids: [atom-0012, atom-0015, atom-0016, atom-0025, atom-0026, atom-0040, atom-0047, atom-0048, atom-0058, atom-0063, atom-0066, atom-0067, atom-0072, atom-0075, atom-0078]
decision_refs: [dec-0010, dec-0012, dec-0013, dec-0020]
preserved_exact_tokens:
  - "host_capability_ref"
  - "host_profile_id"
  - "host_instance_id"
  - "host_assignment_id"
  - "port_access_ref"
  - "container_id"
  - "compose_project"
  - "runtime_context"
  - "workload_ref"
  - "permission_snapshot_id"
  - "filesafe_scope_ref"
  - "allowed_action_ids[]"
  - "blocked_reason_code"
  - "host_preflight_receipt"
  - "host_execution_receipt"
  - "cleanup_retention_receipt"
  - "TestRunReceipt"
negative_constraints:
  - Do not use backend ids such as `container_id` or `compose_project` as the primary cross-PM host capability identity.
  - Do not use transient Docker/container/backend ids as the primary PM identity for reusable host profiles or cross-surface agent capability requests.
  - Do not store raw secrets in host profiles, build artifacts, receipts, access records, prompts, GUI, exports, diagnostics, or evidence.
  - Do not infer cleanup or authority from missing runtime resources.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Automated_Testing_System.md
  - Plans/Executor_Protocol.md
  - Plans/Runtime_Artifacts_Panel.md
```

### CV-304 - HostCapabilityCommand And HostOperationRequest Envelope

```yaml
plan_unit_id: CV-304
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  HostCapabilityCommand is the PM-owned command envelope for containerized hosts. It carries command_id,
  command_kind, host_capability_ref, host_profile_id, optional host instance/runtime ids as backend facts,
  execution_unit_context, approval_scope_key, permission_snapshot_id, FileSafe scope, network_access_policy,
  secret_access_policy, destructive_command_policy, transcript policy, cleanup policy, and required receipt refs.
  HostOperationRequest may remain the dispatch/request payload produced from this envelope. GUI commands,
  assistant requests, orchestrator/executor dispatch, tool calls, terminal-like actions, and file/artifact access
  route through cmd.docker.*, cmd.docker.k8s.*, Executor, Permissions, FileSafe, Tools, UI_Command_Catalog, and
  receipts rather than Coasts HTTP `/api/v1`, permissive CORS, SSE/WebSocket terminal sessions, or file/service
  controls. UI_Command_Catalog, Executor, Permissions, and FileSafe consume or enforce this envelope; they are not
  prerequisites for defining the envelope itself.
gui_related: false
gui_classification_reason: Command envelopes and dispatch contracts are backend/control-plane requirements; GUI command surfaces are owned by UI_Command_Catalog and FinalGUISpec.
depends_on: [CV-303]
unblocks: [T-166, MI-031, CBP-023, OSI-431]
acceptance_criteria:
  - HostCapabilityCommand carries authority, host identity, policy, transcript, cleanup, and receipt fields before dispatch.
  - HostOperationRequest, when used, is derived from the command envelope and cannot bypass PM command, permission, FileSafe, Executor, Tools, or receipt contracts.
  - Host-side commands such as lint/typecheck/format/git/package installs/static analysis/browser tests remain host/worktree side unless runtime service context is required.
  - Container-runtime commands are reserved for service context, database/API/integration work, runtime-specific tests, logs, exec, and artifact capture.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future HostCapabilityCommand schema and command-routing fixtures
risk_class: host_command_envelope_drift
reasoning_tier: high
context_scope: containerized_host_command_contracts
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
  - Plans/Executor_Protocol.md
  - future host operation dispatcher
node_compile_hint:
  mode: host_capability_command_envelope
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0023
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0024
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0064
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0073
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0081
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#control_plane_contract
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/subagent_hardening_synthesis_20260701.json#ref-005-host-capability-command
source_atom_ids: [atom-0023, atom-0024, atom-0064, atom-0073, atom-0081]
decision_refs: [dec-0020]
preserved_exact_tokens:
  - "HostCapabilityCommand"
  - "HostOperationRequest"
  - "cmd.docker.*"
  - "cmd.docker.k8s.*"
  - "command_id"
  - "command_kind"
  - "host_capability_ref"
  - "host_profile_id"
  - "execution_unit_context"
  - "approval_scope_key"
  - "permission_snapshot_id"
  - "FileSafe scope"
  - "network_access_policy"
  - "secret_access_policy"
  - "destructive_command_policy"
  - "transcript policy"
  - "cleanup policy"
  - "required receipt refs"
  - "HTTP `/api/v1`"
  - "SSE"
  - "WebSockets"
  - "terminal sessions"
  - "file controls"
  - "service controls"
negative_constraints:
  - Do not copy Coasts local API, terminal, or file controls blindly.
  - Do not expose terminal/file/service controls outside PM's command, permission, receipt, and FileSafe model.
  - Do not let container-local endpoints bypass PM authority.
  - Do not route every command through a container just because a host exists.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
  - Plans/Executor_Protocol.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
  - Plans/Tools.md
```
