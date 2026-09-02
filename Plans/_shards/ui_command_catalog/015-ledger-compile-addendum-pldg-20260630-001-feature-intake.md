# Shard 015: Ledger Compile Addendum - pldg-20260630-001-feature-intake

Source: `Plans/UI_Command_Catalog.md`

Source lines: L7758-L7907

Source SHA256: `96f52e2b968fe4260d733e2f59b3f7e2df24948b428bace7b628a6249a4afc75`

---

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host command and route obligations from bootstrap ledger `pldg-20260630-001-feature-intake`. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, production build tasks, generated governance artifacts, or a governance seal.

### UCC-105 - Containerized Host Commands And HostCapabilityCommand Envelope

```yaml
plan_unit_id: UCC-105
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Containerized-host GUI actions, Assistant Chat pivots, Orchestrator links, Run Graph access pivots, ATS host launches,
  tool actions, and shell-like actions use registered PM command ids and the HostCapabilityCommand envelope rather than
  copying a Coasts local API, terminal session model, file/service controls, or direct runtime endpoint. Command payloads
  carry command_id, command_kind, source_surface, requested_action, host_capability_ref, host_profile_id, host_instance_id,
  execution_unit_context_ref, approval_scope_key, permission_snapshot_id, FileSafe scope, network_access_policy,
  secret_access_policy, destructive_command_policy, preflight_required, allowed_action_ids, and expected receipt refs when
  relevant. HostOperationRequest remains a dispatch/request payload shape below the command envelope when needed. Docker
  and Kubernetes command families continue to live under cmd.docker.* and cmd.docker.k8s.* ownership, with Docker/Hosts
  as a routed destination rather than a new Activity Bar owner. Registered Docker/Hosts command ids include
  `cmd.docker.hosts.open`, `cmd.docker.host.refresh`, `cmd.docker.host.preflight`,
  `cmd.docker.host.profile.save`, `cmd.docker.host.session.launch`, `cmd.docker.host.instance.start`,
  `cmd.docker.host.instance.stop`, `cmd.docker.host.instance.restart`, `cmd.docker.host.access.open_app`,
  `cmd.docker.host.instance.retain`, and `cmd.docker.host.receipt.open`, in addition to existing
  `cmd.docker.run`, `cmd.docker.stop`, `cmd.docker.restart`, `cmd.docker.container.open`,
  `cmd.docker.container.view_logs`, `cmd.docker.container.attach_shell`, `cmd.docker.cleanup.scan`, and
  `cmd.docker.cleanup.prune` where exact semantics match.
gui_related: true
gui_classification_reason: This PlanUnit defines user-visible command routes and affordances for GUI, chat, orchestrator, and run-graph surfaces.
depends_on: [CV-304]
unblocks: [F3-410, ACD-430, OP-028, RGV-015]
acceptance_criteria:
  - Docker/Hosts commands and access pivots are registered through UI_Command_Catalog rather than ad hoc page-local payloads.
  - HostCapabilityCommand is the PM-owned command envelope; HostOperationRequest is only a lower-level request payload shape when needed.
  - cmd.docker.* and cmd.docker.k8s.* command families preserve Docker Manager command namespace ownership.
  - Command dispatch carries authority, FileSafe, network, secret, destructive-command, preflight, and receipt expectations before mutation.
  - Direct Coasts HTTP API, permissive CORS, SSE/WebSocket terminal, and file/service controls are not copied as PM command authority.
  - Every Docker/Hosts toolbar, card, detail-row, access, lifecycle, receipt, and cleanup action maps to one registered command id and a HostCapabilityCommand payload, or remains disabled with blocked/degraded display evidence.
  - Command fixtures cover missing authority, missing FileSafe scope, missing receipt expectation, stale projection mutation denial, low-confidence port access denial, and cleanup/retain receipt requirements.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future UI command catalog host-command fixture
risk_class: host_command_bypass
reasoning_tier: high
context_scope: containerized_host_command_catalog
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - future command registry and routed Docker/Hosts actions
node_compile_hint:
  mode: host_capability_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0023
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0024
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0041
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0051
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0056
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0064
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0073
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0075
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0074
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0080
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0081
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#control_plane_contract
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/subagent_hardening_synthesis_20260701.json#ref-005-host-capability-command
source_atom_ids: [atom-0023, atom-0024, atom-0041, atom-0051, atom-0056, atom-0064, atom-0073, atom-0074, atom-0075, atom-0080, atom-0081]
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
  - "required receipt refs"
negative_constraints:
  - Do not copy Coasts HTTP `/api/v1`, permissive CORS, SSE/WebSocket terminal sessions, or file/service controls.
  - Do not let container exec bypass Executor, Permissions, FileSafe, Tools, UI_Command_Catalog, or receipts.
  - Do not make Docker/Hosts a new Activity Bar owner or command namespace.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
  - Plans/Executor_Protocol.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
```

### UCC-107 - GUI Dev Preview Command Controls

```yaml
plan_unit_id: UCC-107
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  GUI development-preview command controls are limited to cmd.gui_dev_preview.reload,
  cmd.gui_dev_preview.fixture_mode.set, cmd.gui_dev_preview.capture_state, and
  cmd.gui_dev_preview.daemon_capabilities.inspect. They are development-preview and automated-test controls only,
  are compiled out or disabled in production unless explicitly configured, and must not be reused as production
  runtime, terminal, filesystem, browser automation, CEF, tray, native-window, or process/container commands.
gui_related: true
gui_classification_reason: This unit defines user-visible development-preview GUI controls and command IDs.
depends_on:
- ATS-023
- F3-417
unblocks: []
acceptance_criteria:
- Dev-preview controls remain scoped to reload, fixture mode, screenshot/state capture, and daemon capability inspection.
- Production builds disable or omit these controls unless explicit configuration enables the matching dev/test surface.
- The commands do not grant OS-owned capabilities and do not replace production runtime command families.
- No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plans-verify.py validate-wiring-matrix
- python3 scripts/pm-plan-index.py validate
risk_class: dev_preview_command_authority_leak
reasoning_tier: high
context_scope: gui_platform_currentness_repair
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- Plans/FinalGUISpec.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: gui_dev_preview_commands_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/.audits/fable-20260706/currentness_check_report.json
preserved_exact_tokens:
- cmd.gui_dev_preview.reload
- cmd.gui_dev_preview.fixture_mode.set
- cmd.gui_dev_preview.capture_state
- cmd.gui_dev_preview.daemon_capabilities.inspect
negative_constraints:
- "Do not invent production runtime commands for dev-preview workflow."
- "Do not let dev-preview commands grant PTY, filesystem, process/container, CEF, tray, native-window, or browser automation authority."
owner_hints:
- Plans/UI_Command_Catalog.md
- Plans/FinalGUISpec.md
- Plans/Automated_Testing_System.md
```
