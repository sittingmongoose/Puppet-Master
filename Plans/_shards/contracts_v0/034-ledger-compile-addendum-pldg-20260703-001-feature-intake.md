# Shard 034: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/Contracts_V0.md`

Source lines: L19186-L19539

Source SHA256: `7ea4f791ed4f3033a35e469c5d6337a9b562daeaf7ad5339541e7259c0fc7075`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### CV-306 - P0-WEBSOCKET-SECURITY-BOUNDARIES

```yaml
plan_unit_id: CV-306
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  P0-WEBSOCKET-SECURITY-BOUNDARIES (P0) is compiled as canonical Puppet Master intent for Add WebSocket origin/auth/CSRF/runtime-id security gates: Remote/tunnel WS requires configured auth; wrong Origin/CSRF/runtime id is rejected before initialize; security receipts are visible and redacted.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Remote/tunnel WS requires configured auth
- wrong Origin/CSRF/runtime id is rejected before initialize
- security receipts are visible and redacted.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Remote/tunnel WS requires configured auth
- wrong Origin/CSRF/runtime id is rejected before initialize
- security receipts are visible and redacted.
risk_class: p0_terminal_runtime_hardening
reasoning_tier: high
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
node_compile_hint:
  mode: p0_websocket_security_boundaries
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0047
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0047
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0043/P0-WEBSOCKET-SECURITY-BOUNDARIES@line=43
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0043/P0-WEBSOCKET-SECURITY-BOUNDARIES
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:7
source_atom_ids:
- atom-0047
external_atom_id: extrepo-20260703-0043
source_row_id: P0-WEBSOCKET-SECURITY-BOUNDARIES
priority: P0
finding_family: Add WebSocket origin/auth/CSRF/runtime-id security gates
target_docs:
- Plans/Executor_Protocol.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
owner_hints:
- Plans/Executor_Protocol.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
preserved_exact_tokens:
- extrepo-20260703-0043
- P0-WEBSOCKET-SECURITY-BOUNDARIES
- P0
- Add WebSocket origin/auth/CSRF/runtime-id security gates
negative_constraints: []
proposal_or_recommendation: Remote/tunnel WS requires configured auth; wrong Origin/CSRF/runtime id is rejected before initialize; security receipts are visible and redacted.
compile_disposition: create_new_planunit
```

### CV-307 - P0-RUNTIME-SURFACE-READINESS-PROBE

```yaml
plan_unit_id: CV-307
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  P0-RUNTIME-SURFACE-READINESS-PROBE (P0) is compiled as canonical Puppet Master intent for Runtime surface readiness probe: Imported external-repo finding extrepo-20260703-0092 / P0-RUNTIME-SURFACE-READINESS-PROBE (P0). The preserved PM gap/delta is: Configured tool/browser/terminal/MCP surfaces must prove started, injected, model-visible, UI-visible, and roundtrip-ready after restart/restore. The observed external-repo signal remains source-lineage evidence: Browser port forwarding fails until restart; computer-use plugin unavailable after restart; WSL path/bridge mismatch; OpenCode V2 MCP lifecycle need.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Restarted workspace probes every configured surface before run
- Unavailable plugin is shown before model attempts tool use
- WSL path namespace translation is explicit and tested
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Restarted workspace probes every configured surface before run
- Unavailable plugin is shown before model attempts tool use
- WSL path namespace translation is explicit and tested
risk_class: p0_terminal_runtime_hardening
reasoning_tier: high
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: p0_runtime_surface_readiness_probe
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0096
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0096
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0092/P0-RUNTIME-SURFACE-READINESS-PROBE@line=92
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0092/P0-RUNTIME-SURFACE-READINESS-PROBE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_one_more_external_repo_backlog_2026-07-03.jsonl:5
source_atom_ids:
- atom-0096
external_atom_id: extrepo-20260703-0092
source_row_id: P0-RUNTIME-SURFACE-READINESS-PROBE
priority: P0
finding_family: Runtime surface readiness probe
source_repos:
- OpenAI Codex
- OpenCode
preserved_exact_tokens:
- extrepo-20260703-0092
- P0-RUNTIME-SURFACE-READINESS-PROBE
- P0
- Runtime surface readiness probe
- OpenAI Codex
- OpenCode
negative_constraints: []
observed_signal: Browser port forwarding fails until restart; computer-use plugin unavailable after restart; WSL path/bridge mismatch; OpenCode V2 MCP lifecycle need.
pm_gap_or_delta: Configured tool/browser/terminal/MCP surfaces must prove started, injected, model-visible, UI-visible, and roundtrip-ready after restart/restore.
compile_disposition: create_new_planunit
```

### CV-308 - prompt_admission_execution

```yaml
plan_unit_id: CV-308
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  prompt_admission_execution (P0) is compiled as canonical Puppet Master intent for prompt_admission_execution: Add SESSION-PROMPT-ADMISSION-INBOX events and idempotency semantics The preserved PM gap/delta is: No explicit session prompt admission inbox/event family The observed external-repo signal remains source-lineage evidence: OpenCode v2 session_input admission inbox and prompt/execution split; session seq/storage bugs
gui_related: true
gui_classification_reason: Target docs include GUI/UI command or user-visible surfaces; mixed work is conservatively GUI-related.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Crash/retry/duplicate prompt tests
- seglog replay tests
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Crash/retry/duplicate prompt tests
- seglog replay tests
risk_class: p0_cross_system_runtime_contracts_hardening
reasoning_tier: high
context_scope: cross_system_runtime_contracts
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: prompt_admission_execution
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0105
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0105
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0101/prompt_admission_execution@line=101
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0101/prompt_admission_execution
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/opencode_pm_plan_change_matrix.csv:3
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:3448-3472
source_atom_ids:
- atom-0105
external_atom_id: extrepo-20260703-0101
source_row_id: prompt_admission_execution
priority: P0
finding_family: prompt_admission_execution
target_docs:
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/assistant-chat-design.md
owner_hints:
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/assistant-chat-design.md
preserved_exact_tokens:
- extrepo-20260703-0101
- prompt_admission_execution
- P0
negative_constraints: []
observed_signal: OpenCode v2 session_input admission inbox and prompt/execution split; session seq/storage bugs
pm_current_coverage: Seglog/redb/Tantivy design; exclusive writer lock; projector checkpoints
pm_gap_or_delta: No explicit session prompt admission inbox/event family
proposal_or_recommendation: Add SESSION-PROMPT-ADMISSION-INBOX events and idempotency semantics
compile_disposition: create_new_planunit
```

### CV-309 - EventRecord Canonical Envelope

```yaml
plan_unit_id: CV-309
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts_V0 owns the canonical persisted EventRecord envelope for schema_id
  pm.event.v0 and schema_version 1.0.0 through Plans/event_record.schema.json.
  The envelope requires schema_id, schema_version, event_id, canonical
  event_type, project/thread/run/node/attempt identity fields, actor and
  requested/effective account refs, occurred/observed/persisted timestamps,
  monotonic sequence fields, correlation and causation ids, idempotency_key,
  payload_schema_id, payload and payload_ref dispatch fields, redaction_profile,
  replay_policy, and closed migration metadata. Legacy type is a compatibility
  alias for EventEnvelopeV1 only and must normalize to event_type before
  EventRecord persistence.
gui_related: false
gui_classification_reason: This unit defines a persisted event schema envelope and storage contract boundary, not GUI presentation.
depends_on: [CV-002, CV-087, CV-088]
unblocks: []
acceptance_criteria:
  - Contracts_V0 contains canonical section 1.2 EventRecord for pm.event.v0.
  - Plans/event_record.schema.json is Draft 2020-12, top-level closed, and requires schema_version.
  - EventRecord uses event_type as the persisted field name; type remains compatibility-only.
  - EventRecord forbids raw secrets and stores account-sensitive values only by reference.
  - This unit closes only the EventRecord envelope slice and does not close provider_stream, runtime_lifecycle, clean_room_harness, GUI, security, behavioral, or broad storage blockers.
validation_surfaces:
  - python3 scripts/pm-implementation-readiness.py validate
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates --subcheck-timeout-seconds 120
risk_class: event_record_envelope_drift
reasoning_tier: high
context_scope: event_record_persistence_contract
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/event_record.schema.json
  - Plans/storage-plan.md
  - scripts/pm-implementation-readiness.py
node_compile_hint:
  mode: event_record_envelope_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - chat:2026-07-06-tier-0c-1-eventrecord-envelope
preserved_exact_tokens:
  - "`EventRecord`"
  - "`pm.event.v0`"
  - "`schema_id`"
  - "`schema_version`"
  - "`event_id`"
  - "`event_type`"
  - "`type`"
  - "`project_id`"
  - "`thread_id`"
  - "`run_id`"
  - "`node_id`"
  - "`attempt_id`"
  - "`actor_ref`"
  - "`requested_account_ref`"
  - "`effective_account_ref`"
  - "`sequence_id`"
  - "`correlation_id`"
  - "`causation_event_id`"
  - "`idempotency_key`"
  - "`payload_schema_id`"
  - "`redaction_profile`"
  - "`replay_policy`"
negative_constraints:
  - Do not persist `type` as a second top-level EventRecord field.
  - Do not store raw secrets, tokens, passwords, credentials, API keys, OAuth values, or local machine secrets in EventRecord.
  - Do not treat EventRecord schema materialization as proof that all event payload schemas, provider streams, runtime lifecycle, clean-room harness, GUI wiring, security boundaries, or behavioral acceptance are complete.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime launches, or production build tasks from this contract unit.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/event_record.schema.json
  - Plans/storage-plan.md
```

### CV-310 - Active-Agent Coordination Event Family Contract

```yaml
plan_unit_id: CV-310
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts_V0 names the stable active-agent coordination EventRecord families consumed by Orchestrator and storage:
  `coordination.agent_registered`, `coordination.agent_status_updated`, `coordination.agent_operation_updated`,
  `coordination.agent_file_ownership_updated`, `coordination.agent_unregistered`, `coordination.agent_crashed`,
  `coordination.agent_aborted`, and `coordination.debug_mirror_exported`. These events feed redb coordination projections;
  `active-agents.json`, `agent-messages.json`, and `.puppet-master/state/*.json` paths are compatibility/debug/export
  mirrors only and cannot drive scheduling, execution admission, conflict prevention, prompt injection, unregister, crash,
  abort, receipt, or validation decisions.
gui_related: false
gui_classification_reason: This unit defines runtime event contracts and storage authority, not GUI presentation.
depends_on: [CV-309, SP-230, SP-232, OSI-432]
unblocks: []
acceptance_criteria:
  - Stable `coordination.*` event rows list payload minima for registration, status, operation, file-activity, unregister, crash, abort, and debug mirror export.
  - Coordination payloads preserve project/run/thread/agent lineage, platform, revision/checkpoint/idempotency fields, and relevant operation/file/mirror metadata.
  - File-activity events are coordination claims only and do not create FileSafe locks or durable exclusive leases.
  - Coordination consumers use redb projections and `projector.checkpoint.coordination:{project_id}` for authority.
  - JSON side files remain compatibility/debug/export mirrors and cannot drive scheduling, execution admission, conflict prevention, prompt injection, unregister, crash, abort, receipt, or validation decisions.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: coordination_contract_file_canon_regression
reasoning_tier: high
context_scope: storage_coordination_canon
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/storage_value_registry.json
node_compile_hint:
  mode: storage_coordination_canon_repair
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl:6
source_atom_ids: []
preserved_exact_tokens:
  - "`coordination.agent_registered`"
  - "`coordination.agent_status_updated`"
  - "`coordination.agent_operation_updated`"
  - "`coordination.agent_file_ownership_updated`"
  - "`coordination.agent_unregistered`"
  - "`coordination.agent_crashed`"
  - "`coordination.agent_aborted`"
  - "`coordination.debug_mirror_exported`"
  - "`active-agents.json`"
  - "`.puppet-master/state/*.json`"
negative_constraints:
  - Do not define loose JSON files as active-agent coordination canon.
  - Do not let coordination events bypass the EventRecord envelope.
  - Do not treat coordination file-activity claims as FileSafe locks or leases.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/orchestrator-subagent-integration.md
```
