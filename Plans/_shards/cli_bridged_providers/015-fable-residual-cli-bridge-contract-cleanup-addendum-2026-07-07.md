# Shard 015: FABLE Residual CLI Bridge Contract Cleanup Addendum - 2026-07-07

Source: `Plans/CLI_Bridged_Providers.md`

Source lines: L1847-L1961

Source SHA256: `53d1d3779e9c3f41567c015b7e879c5d021cc372a690db9bfeb6813495145459`

---

## FABLE Residual CLI Bridge Contract Cleanup Addendum - 2026-07-07

This addendum closes only the residual FABLE Critical/High CLI bridge feature-contract rows for process invocation, exit normalization, child-process cleanup, and streamed JSON handling. It does not create provider adapters, runtime launches, implementation files, executable queues, or build certification evidence.

### CBP-026 - FABLE Residual CLI Bridge Invocation And Stream Contract

```yaml
plan_unit_id: CBP-026
unit_type: schema_contract
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  CLI bridge providers must expose a deterministic invocation contract before any adapter execution is buildable:
  argv is an array of tokens with argv[0] resolved by BinaryLocator, cwd is explicit, stdin is a bounded UTF-8
  payload or a named empty stream, env is a redacted allowlist map, and every bridge emits a BridgeInvocationReceipt,
  BridgeExitReceipt, and BridgeStreamReceipt. Exit handling normalizes provider-native statuses into success,
  provider_error, usage_error, auth_required, timeout, cancelled, killed, invalid_json, protocol_error, and transport_error.
gui_related: false
gui_classification_reason: CLI bridge invocation, exit, and stream contracts are backend provider integration contracts.
depends_on: [CBP-005, CBP-007, CBP-008, CBP-009, CBP-010, CBP-024, CBP-025]
unblocks: []
acceptance_criteria:
  - BridgeInvocationReceipt records bridge_id, provider_id, binary_ref, argv[], cwd, env_allowlist_keys[], stdin_mode, stdin_sha256?, timeout_ms, process_group_id, request_id, and redaction_policy_ref.
  - Environment variables are emitted only from an allowlist, secrets are credential_ref aliases, and raw tokens never appear in logs, receipts, stdin echoes, or error payloads.
  - Exit codes are normalized into success, provider_error, usage_error, auth_required, timeout, cancelled, killed, invalid_json, protocol_error, and transport_error with original_code retained as diagnostic metadata.
  - Timeout or cancellation sends terminate to the process group, waits kill_grace_ms = 3000, then kills and records child_pids_reaped and orphan_detected.
  - JSON and JSONL stream parsing enforces valid UTF-8, max_frame_bytes = 1048576, max_buffer_bytes = 16777216, max_pending_frames = 1024, and backpressure state before provider output can be accepted.
  - Partial frames at EOF are protocol_error unless the provider declares text_mode; malformed UTF-8 is invalid_json_or_encoding_error and preserves only redacted byte counts.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status --source-artifact residual_feature_contract_findings.jsonl
risk_class: fable_residual_cli_bridge_contract_drift
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: residual_cli_bridge_invocation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md:1164
  - fablereport.md:1165
  - fablereport.md:1166
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "argv"
  - "env"
  - "stdin"
  - "exit code"
  - "zombie"
  - "orphan"
  - "JSON"
  - "JSONL"
  - "UTF-8"
  - "backpressure"
negative_constraints:
  - Do not create a provider adapter implementation, runtime launch, executable queue, WorkNode, NodeSeed, final node manifest, production build task, or runtime certification evidence.
  - Do not accept unbounded stdout/stderr buffering or lossy UTF-8 replacement as a valid provider protocol.
  - Do not expose raw credentials in argv, env, stdin, receipts, diagnostics, or stream frames.
owner_hints:
  - Plans/CLI_Bridged_Providers.md
  - Plans/BinaryLocator_Spec.md
  - Plans/Contracts_V0.md
```

### CBP-025 - CBP-025

```yaml
plan_unit_id: CBP-025
unit_type: constraint
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  CLI/server/stdout/unix-socket/HTTP transport lessons must remain adapter/provider bridge implementation details underneath PM envelopes. ProviderRequestEnvelope remains canonical above command-line or HTTP encodings, and no user workflow may require an opaque PM CLI-only state.
gui_related: false
gui_classification_reason: Backend/orchestration import guardrail; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- atom-0119 source details remain traceable through source_lineage and preserved source fields.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
risk_class: external_repo_guardrail
reasoning_tier: standard
context_scope: import_guardrail
implementation_surfaces:
- Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: atom_0119
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0119
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0119
- subagent:019f297e-fcd6-71f1-a6f2-e410e13a3c38
source_atom_ids:
- atom-0119
owner_hints:
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/parallel_agent_synthesis_20260703.json
preserved_exact_tokens:
- ProviderRequestEnvelope
- No user workflow may require an opaque PM CLI-only state
- CLI transports are adapter details only
negative_constraints:
- Do not turn CLI/server transports into PM product shape.
- Do not require opaque PM CLI-only state for user workflows.
compile_disposition: create_new_planunit
```
