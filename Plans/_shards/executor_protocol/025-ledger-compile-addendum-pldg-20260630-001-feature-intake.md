# Shard 025: Ledger Compile Addendum - pldg-20260630-001-feature-intake

Source: `Plans/Executor_Protocol.md`

Source lines: L6506-L6599

Source SHA256: `97c2c3dfafccb4f1939e5e296c86512e8f1fe5e56bd382ea0ad15760e9821938`

---

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host Executor intake and execution-lane boundaries. It does not create WorkNodes, NodeSeeds, executable queues, runtime dispatch, implementation files, generated governance artifacts, or production build tasks.

### EP-109 - HostCapabilityCommand Executor Intake Boundary

```yaml
plan_unit_id: EP-109
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor consumes HostCapabilityCommand and HostOperationRequest through ExecutorIntakeReport or equivalent intake,
  not through Coasts local API, terminal, file controls, or container-local endpoints. Accepted lanes include
  apps/services under test, PM work, provider tools, agent harnesses, shells, and integration commands only where
  runtime execution is later enabled and authority allows it. Intake records host_capability_ref, host_profile_id,
  host_assignment_id, execution_unit_context, worktree/cwd binding, permission_snapshot_id, FileSafe scope,
  approval_scope_key, network_access_policy, secret_access_policy, destructive_command_policy, transcript policy,
  cleanup policy, expected receipts, host preflight, lane-specific evidence, cleanup/retention disposition, and
  blocked/failure reason. Host-side commands such as lint/typecheck/format/git/package installs/static analysis/browser
  tests stay host/worktree side unless runtime services are required; container-runtime commands are for service context,
  database/API/integration work, runtime-specific tests, logs, exec, and artifact capture.
gui_related: false
gui_classification_reason: Executor intake and authority boundaries are backend execution contracts, not GUI presentation.
depends_on: [CV-304, PS-126, F2-194, RM-048]
unblocks: [T-166, GRS-032, OSI-431, ACD-430, OP-028]
acceptance_criteria:
  - Every host action is accepted or blocked through Executor intake, preflight, authority checks, and expected receipts.
  - Host use cannot bypass Run_Modes, Permissions, FileSafe, tool policy, provider/account identity, or Runtime Artifacts evidence boundaries.
  - Runtime Artifacts projects evidence but never becomes the receipt authority.
  - Blocked outcomes preserve blocked != failed and expose reason codes and allowed actions.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future HostCapabilityCommand ExecutorIntakeReport fixtures
  - future blocked != failed host action fixtures
risk_class: host_executor_bypass
reasoning_tier: high
context_scope: containerized_host_executor_intake
implementation_surfaces:
  - Plans/Executor_Protocol.md
  - future Executor intake
node_compile_hint:
  mode: host_capability_executor_intake_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0023
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0029
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0034
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0044
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0053
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0060
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0064
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0069
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0073
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0081
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#execution_lane_matrix
source_atom_ids: [atom-0023, atom-0029, atom-0034, atom-0044, atom-0053, atom-0060, atom-0064, atom-0069, atom-0073, atom-0081]
decision_refs: [dec-0005, dec-0008, dec-0010, dec-0017, dec-0020]
preserved_exact_tokens:
  - "HostCapabilityCommand"
  - "HostOperationRequest"
  - "ExecutorIntakeReport"
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
  - "apps/services under test"
  - "PM work"
  - "provider tools"
  - "agent harnesses"
  - "shells"
  - "integration commands"
  - "where runtime execution is later enabled and authority allows it"
  - "blocked != failed"
negative_constraints:
  - Do not copy Coasts HTTP `/api/v1`, permissive CORS, SSE/WebSocket terminal, file/service controls.
  - Do not route every command through a container just because a host exists.
  - Do not let container exec bypass Executor/Permissions/FileSafe/receipts.
  - Do not imply runtime dispatch, WorkNodes, NodeSeeds, executable queues, or PlanCompile runtime are enabled by this compile.
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Run_Modes.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
  - Plans/Tools.md
  - Plans/Runtime_Artifacts_Panel.md
```
