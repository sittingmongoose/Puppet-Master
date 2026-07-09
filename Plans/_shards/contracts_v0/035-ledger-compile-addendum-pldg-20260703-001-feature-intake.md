# Shard 035: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/Contracts_V0.md`

Source lines: L19390-L19960

Source SHA256: `4237e1c14fbacb969e3ce54fb0ac2c5742967fe20f28cc6c0acabb7a1241d4a5`

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
- WSAuthSession records auth_scheme, credential_ref, origin, csrf_token_hash, runtime_id, tunnel_id, permission_snapshot_id, expires_at_ms, and redacted_receipt_ref before any remote initialize is admitted.
- Auth failure receipts use reason_code values missing_auth, invalid_origin, invalid_csrf, runtime_id_mismatch, expired_session, or permission_scope_denied without logging raw credentials or CSRF tokens.
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
negative_constraints:
- Do not allow remote or tunneled WebSocket initialize before auth, Origin, CSRF, runtime id, and permission scope checks pass.
- Do not store raw credentials, raw CSRF tokens, bearer tokens, or provider secrets in security receipts.
- Do not treat this contract as runtime launch, implementation readiness, or buildability proof.
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
- RuntimeSurfaceReadinessProbe records surface_id, surface_kind, configured_enabled, process_or_port_ref, injection_state, model_visible, ui_visible, roundtrip_state, last_probe_at_ms, failure_reason_code, and recovery_command_ref.
- Readiness status values are ready, degraded, unavailable, disabled_by_policy, auth_required, restart_required, and namespace_mismatch; unavailable or degraded surfaces block model-visible tool use until recovery is acknowledged.
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
negative_constraints:
- Do not mark a surface ready from configuration presence alone.
- Do not expose unavailable tools to the model as callable.
- Do not treat readiness probes as executable runtime certification or implementation-readiness proof.
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
- SessionPromptAdmission events include admission_id, thread_id, prompt_id, prompt_hash, client_sequence, idempotency_key, submitted_at_ms, admitted_at_ms, admission_state, duplicate_of?, execution_ref?, and rejection_reason_code?.
- Admission states are queued, admitted, duplicate_ignored, rejected, expired, cancelled_before_execution, and execution_bound; replay uses idempotency_key plus prompt_hash to avoid duplicate execution.
- Prompt admission and execution remain separate event families so stored prompts can be audited without implying a runtime execution started.
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
negative_constraints:
- Do not execute a prompt directly from UI receipt without a persisted admission event.
- Do not create duplicate executions for the same idempotency_key and prompt_hash replay.
- Do not use session prompt admission as proof of runtime launch or runtime certification.
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

### CV-311 - Provider Model Capability Snapshot Reference Envelope

```yaml
plan_unit_id: CV-311
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts_V0 owns the cross-surface provider/model capability snapshot reference
  envelope with capability_snapshot_ref, requested_effective_snapshot_ref,
  provider_entry_id, model_id, optional effective_model_id, context_budget_ref,
  fallback_chain_ref, capability_provenance_refs, capability_state, and
  capability_state_reason. Models_System owns the capability field semantics,
  context-window and max-token limits, fallback-chain shape, provenance, and
  requested/effective model resolution. Legacy `platform_specs` and
  `platform_specs.rs` are not valid capability snapshot refs.
gui_related: false
gui_classification_reason: This unit defines a cross-surface reference envelope and owner boundary, not visual presentation.
depends_on: [CV-293, MS-134]
unblocks: [ACD-009, ACD-184, ACD-220, ACD-255, ACD-257, MS-134]
acceptance_criteria:
  - Cross-surface provider/model payloads reference `capability_snapshot_ref` instead of copying provider capability tables.
  - "`fallback_chain_ref?` and `context_budget_ref?` point to Models_System snapshot fields."
  - Capability states use the closed state set supported, unsupported, capability_gated, clamped, inferred, opaque, stale, and unverified.
  - Legacy `platform_specs` and `platform_specs.rs` are invalid as capability snapshot refs.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
risk_class: provider_model_capability_ref_drift
reasoning_tier: high
context_scope: provider_model_capability_ref_envelope
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Models_System.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: provider_model_capability_snapshot_ref_envelope
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl:7
source_atom_ids: []
preserved_exact_tokens:
  - "`capability_snapshot_ref`"
  - "`requested_effective_snapshot_ref`"
  - "`context_budget_ref?`"
  - "`fallback_chain_ref?`"
  - "`capability_provenance_refs[]`"
  - "`capability_state`"
  - "`platform_specs`"
negative_constraints:
  - Do not define `platform_specs` or `platform_specs.rs` as active provider/model capability contracts.
  - Do not copy Models_System capability tables into feature-local payloads.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Models_System.md
  - Plans/assistant-chat-design.md
```

### CV-312 - FileSafe Fail Closed Security Event Payloads

```yaml
plan_unit_id: CV-312
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts_V0 defines FileSafe fail-closed security EventRecord payloads for
  filesafe.guard_init_failed, filesafe.command_denied, filesafe.path_denied,
  filesafe.destructive_override_requested, filesafe.destructive_override_granted,
  filesafe.destructive_override_denied, and filesafe.policy_degraded. The payloads preserve
  guard type, denial/diagnostic codes, normalized command/path identity, permission and FileSafe
  scope refs, project/run/worktree scope, authenticated operator override request/grant/denial
  fields, expiry, receipt refs, event refs, and redaction posture. policy_degraded is limited to
  non-authoritative/advisory degradation or embedded fallback use where fail-closed enforcement
  remains intact.
gui_related: false
gui_classification_reason: This unit defines security event payload contracts, not visual presentation.
depends_on: [CV-309, CV-081, F2-199]
unblocks: [F2-024, F2-028, F2-031, F2-052, F2-114, F2-116]
acceptance_criteria:
  - FileSafe init failure emits filesafe.guard_init_failed and blocks affected guarded execution.
  - Command denial emits filesafe.command_denied with normalized command identity and denial_code.
  - Path denial emits filesafe.path_denied with path/canonicalization denial_code and scope refs.
  - Destructive override requires authenticated operator identity, auth realm, reason, scope, expiry, event refs, and receipt fields.
  - policy_degraded is not used when authoritative allowlist, baseline, root, canonical path, or override authority is absent.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-filesafe-security-policy
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: filesafe_event_payload_drift
reasoning_tier: high
context_scope: filesafe_fail_closed_security_repair
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FileSafe.md
  - scripts/pm-plans-verify.py
node_compile_hint:
  mode: filesafe_fail_closed_security_event_payloads
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl:10
source_atom_ids: []
preserved_exact_tokens:
  - "`filesafe.guard_init_failed`"
  - "`filesafe.command_denied`"
  - "`filesafe.path_denied`"
  - "`filesafe.destructive_override_requested`"
  - "`filesafe.destructive_override_granted`"
  - "`filesafe.destructive_override_denied`"
  - "`filesafe.policy_degraded`"
  - "`approved_command_identity_mismatch`"
  - "`path_toc_tou_recheck_failed`"
  - "`override_expired`"
negative_constraints:
  - Do not treat PUPPET_MASTER_ALLOW_DESTRUCTIVE as sufficient destructive override authority.
  - Do not use policy_degraded as a success-shaped substitute for missing allowlists, baselines, roots, canonical paths, or authorization.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime launches, or production build tasks from this contract unit.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/FileSafe.md
  - Plans/Permissions_System.md
```

### CV-313 - FABLE Contract Runtime Core Schema Closure

```yaml
plan_unit_id: CV-313
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts_V0 closes the FABLE contract-runtime core schema drift for scheduler wake, stop, attention,
  budget, blocked, unblocked, safe-point, conflict, command, concern, auth, and package identity records.
  Runtime payloads carry per-event payload schema_version in addition to the EventRecord envelope
  schema_version. wake_reason, stop_reason_code, attention_required_reason_code, budget_kind,
  node.unblocked.resolution, conflict_reason_code, blocked_reason_code auth handling, UICommandResponse
  error codes, ConcernRecord lifecycle fields, AuthEvent minima, and package_id/work_package_id alias
  behavior are closed here and consumed by Executor and Goal Runtime. `package_id` is canonical;
  `work_package_id`, `attention_reason_code`, and `worktree_branch` are compatibility aliases only.
gui_related: false
gui_classification_reason: This unit defines backend/runtime schema closure, not visual presentation.
depends_on: [CV-215, CV-220, CV-224, CV-248, CV-287, CV-288, CV-309, GRS-035, GRS-036, GRS-037, GRS-038, EP-026, EP-028, EP-030, EP-032, EP-085, EP-098]
unblocks: [GRS-041, EP-114]
acceptance_criteria:
  - "`wake_reason` is closed to prerequisite_resolved, approval_resolved, clarification_resolved, auth_recovered, startup_recovered, backoff_expired, verification_completed, remediation_resolved, safe_point_restored, capacity_available, replan_applied, and watchdog_recheck."
  - "`stop_reason_code`, `attention_required_reason_code`, and `budget_kind` are machine-readable closed fields on stop, user-attention, and budget-affecting payloads."
  - "`node.unblocked.resolution` and `conflict_reason_code` use closed value sets and do not preserve prose-only or ellipsis-based values."
  - "`blocked_reason_code` includes `auth_required`; credential expiry remains `failure_class = auth_expired`."
  - "`safe_point.created` captures schema_version, safe_point_id, run_id, node_id, attempt_id, baseline_ref, replan_generation, creation_reason, worktree_id?, worktree_path?, branch_name?, HEAD_sha?, and ts."
  - UI command dispatch returns `UICommandResponse` with ack/result status, closed error code, reason, event refs, and receipt ref.
  - Concern and AuthEvent records expose their required identity, lifecycle, evidence, redaction, and recovery fields without storing raw secrets.
  - "`package_id` is canonical and `work_package_id` remains import/export compatibility only."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: fable_contract_runtime_core_schema_drift
reasoning_tier: high
context_scope: contract_runtime_core_repair
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/Goal_Runtime_System.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: contract_runtime_core_schema_closure
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md
  - Plans/.audits/fable-20260706/P0_P1_REPAIR_PLAN.md
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "`wake_reason`"
  - "`stop_reason_code`"
  - "`attention_required_reason_code`"
  - "`budget_kind`"
  - "`node.unblocked.resolution`"
  - "`conflict_reason_code`"
  - "`blocked_reason_code`"
  - "`safe_point.created`"
  - "`UICommandResponse`"
  - "`ConcernRecord`"
  - "`AuthEvent`"
  - "`package_id`"
  - "`work_package_id`"
negative_constraints:
  - Do not treat this schema closure as UI command catalog, wiring matrix, FileSafe, storage, platform, GUI, runtime certification, or implementation-readiness closure.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, production build tasks, generated governance artifacts, or governance seal outputs from this contract unit.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/Goal_Runtime_System.md
  - Plans/orchestrator-subagent-integration.md
```
