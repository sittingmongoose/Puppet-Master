# Shard 026: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/Executor_Protocol.md`

Source lines: L6799-L7175

Source SHA256: `83949ad194756c4c2addb257dade79c089dc9f1bb3ce21bd36fced9b192382e5`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### EP-110 - P0-STREAM-HISTORY-COALESCER

```yaml
plan_unit_id: EP-110
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  P0-STREAM-HISTORY-COALESCER (P0) is compiled as canonical Puppet Master intent for Prevent streaming partials from becoming durable duplicate history: Cumulative snapshots are persisted once; missing terminal event is retryable error; zero-usage aborted turn is not model replay content.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Cumulative snapshots are persisted once
- missing terminal event is retryable error
- zero-usage aborted turn is not model replay content.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Cumulative snapshots are persisted once
- missing terminal event is retryable error
- zero-usage aborted turn is not model replay content.
risk_class: p0_transport_websocket_streaming_hardening
reasoning_tier: high
context_scope: transport_websocket_streaming
implementation_surfaces:
- Plans/Executor_Protocol.md
- Plans/Prompt_Pipeline.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: p0_stream_history_coalescer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0045
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0045
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0041/P0-STREAM-HISTORY-COALESCER@line=41
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0041/P0-STREAM-HISTORY-COALESCER
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:5
source_atom_ids:
- atom-0045
external_atom_id: extrepo-20260703-0041
source_row_id: P0-STREAM-HISTORY-COALESCER
priority: P0
finding_family: Prevent streaming partials from becoming durable duplicate history
target_docs:
- Plans/Executor_Protocol.md
- Plans/Prompt_Pipeline.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
owner_hints:
- Plans/Executor_Protocol.md
- Plans/Prompt_Pipeline.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
preserved_exact_tokens:
- extrepo-20260703-0041
- P0-STREAM-HISTORY-COALESCER
- P0
- Prevent streaming partials from becoming durable duplicate history
negative_constraints: []
proposal_or_recommendation: Cumulative snapshots are persisted once; missing terminal event is retryable error; zero-usage aborted turn is not model replay content.
compile_disposition: create_new_planunit
```

### EP-111 - P0-WEBSOCKET-TRANSPORT-POLICY

```yaml
plan_unit_id: EP-111
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  P0-WEBSOCKET-TRANSPORT-POLICY (P0) is compiled as canonical Puppet Master intent for Define transport policy for WebSocket/SSE/stdout/unix-socket/HTTP: Transport decision receipts include locality, auth, replay, backpressure, fallback, and provider support; OpenCode remains HTTP/SSE unless upstream contract changes.
gui_related: true
gui_classification_reason: Target docs include GUI/UI command or user-visible surfaces; mixed work is conservatively GUI-related.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Transport decision receipts include locality, auth, replay, backpressure, fallback, and provider support
- OpenCode remains HTTP/SSE unless upstream contract changes.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Transport decision receipts include locality, auth, replay, backpressure, fallback, and provider support
- OpenCode remains HTTP/SSE unless upstream contract changes.
risk_class: p0_transport_websocket_streaming_hardening
reasoning_tier: high
context_scope: transport_websocket_streaming
implementation_surfaces:
- Plans/Executor_Protocol.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/FinalGUISpec.md
- Plans/Provider_OpenCode.md
- Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: p0_websocket_transport_policy
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0046
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0046
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0042/P0-WEBSOCKET-TRANSPORT-POLICY@line=42
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0042/P0-WEBSOCKET-TRANSPORT-POLICY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:6
source_atom_ids:
- atom-0046
external_atom_id: extrepo-20260703-0042
source_row_id: P0-WEBSOCKET-TRANSPORT-POLICY
priority: P0
finding_family: Define transport policy for WebSocket/SSE/stdout/unix-socket/HTTP
target_docs:
- Plans/Executor_Protocol.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/FinalGUISpec.md
- Plans/Provider_OpenCode.md
- Plans/CLI_Bridged_Providers.md
owner_hints:
- Plans/Executor_Protocol.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/FinalGUISpec.md
- Plans/Provider_OpenCode.md
- Plans/CLI_Bridged_Providers.md
preserved_exact_tokens:
- extrepo-20260703-0042
- P0-WEBSOCKET-TRANSPORT-POLICY
- P0
- Define transport policy for WebSocket/SSE/stdout/unix-socket/HTTP
negative_constraints: []
proposal_or_recommendation: Transport decision receipts include locality, auth, replay, backpressure, fallback, and provider support; OpenCode remains HTTP/SSE unless upstream contract changes.
compile_disposition: create_new_planunit
```

### EP-112 - P1-WEBSOCKET-BACKPRESSURE-DIAGNOSTICS

```yaml
plan_unit_id: EP-112
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  P1-WEBSOCKET-BACKPRESSURE-DIAGNOSTICS (P1) is compiled as canonical Puppet Master intent for Add bounded queues, overload, retry, and pressure diagnostics: Frame ingress queues bounded; overflow returns structured overload; UI distinguishes provider stall, WS reconnect, backend stall, and UI render lag.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Frame ingress queues bounded
- overflow returns structured overload
- UI distinguishes provider stall, WS reconnect, backend stall, and UI render lag.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Frame ingress queues bounded
- overflow returns structured overload
- UI distinguishes provider stall, WS reconnect, backend stall, and UI render lag.
risk_class: p1_transport_websocket_streaming_hardening
reasoning_tier: standard
context_scope: transport_websocket_streaming
implementation_surfaces:
- Plans/Executor_Protocol.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/storage-plan.md
node_compile_hint:
  mode: p1_websocket_backpressure_diagnostics
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0053
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0053
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0049/P1-WEBSOCKET-BACKPRESSURE-DIAGNOSTICS@line=49
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0049/P1-WEBSOCKET-BACKPRESSURE-DIAGNOSTICS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:13
source_atom_ids:
- atom-0053
external_atom_id: extrepo-20260703-0049
source_row_id: P1-WEBSOCKET-BACKPRESSURE-DIAGNOSTICS
priority: P1
finding_family: Add bounded queues, overload, retry, and pressure diagnostics
target_docs:
- Plans/Executor_Protocol.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/storage-plan.md
owner_hints:
- Plans/Executor_Protocol.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/storage-plan.md
preserved_exact_tokens:
- extrepo-20260703-0049
- P1-WEBSOCKET-BACKPRESSURE-DIAGNOSTICS
- P1
- Add bounded queues, overload, retry, and pressure diagnostics
negative_constraints: []
proposal_or_recommendation: Frame ingress queues bounded; overflow returns structured overload; UI distinguishes provider stall, WS reconnect, backend stall, and UI render lag.
compile_disposition: create_new_planunit
```

### EP-113 - P1-STREAM-HISTORY-COALESCER-REPLAY

```yaml
plan_unit_id: EP-113
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  P1-STREAM-HISTORY-COALESCER-REPLAY (P1) is compiled as canonical Puppet Master intent for Streaming/admission/replay boundary: Add StreamHistoryCoalescer with partial_delta, cumulative_snapshot, reasoning_delta, tool_call_fragment, provider_item_id, provider_error, final_assistant_turn, and durable_history_write phases. The preserved PM gap/delta is: Make settled history admission mandatory for all providers, not just context/cache pass. The observed external-repo signal remains source-lineage evidence: OpenCode v2 separates context/source/snapshot/session history and recent releases add event streams and paged durable history. Pi reports WS/SSE first-event stalls; Cline/Codex SDKs centralize session events/history.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- No partial stream fragment is replayed as a full assistant turn.
- Provider native item IDs are kept only where allowed by replay policy.
- First-event timeout is a transport failure, not empty assistant success.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- No partial stream fragment is replayed as a full assistant turn.
- Provider native item IDs are kept only where allowed by replay policy.
- First-event timeout is a transport failure, not empty assistant success.
risk_class: p1_transport_websocket_streaming_hardening
reasoning_tier: standard
context_scope: transport_websocket_streaming
implementation_surfaces:
- Plans/Executor_Protocol.md
- Plans/storage-plan.md
- Plans/Prompt_Pipeline.md
- Plans/Provider_OpenCode.md
- Plans/Models_System.md
node_compile_hint:
  mode: p1_stream_history_coalescer_replay
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0075
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0075
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0071/P1-STREAM-HISTORY-COALESCER-REPLAY@line=71
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0071/P1-STREAM-HISTORY-COALESCER-REPLAY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:17
source_atom_ids:
- atom-0075
external_atom_id: extrepo-20260703-0071
source_row_id: P1-STREAM-HISTORY-COALESCER-REPLAY
priority: P1
finding_family: Streaming/admission/replay boundary
source_repos:
- OpenCode v2
- Pi
- Codex
- Cline
target_docs:
- Plans/storage-plan.md
- Plans/Prompt_Pipeline.md
- Plans/Provider_OpenCode.md
- Plans/Models_System.md
owner_hints:
- Plans/storage-plan.md
- Plans/Prompt_Pipeline.md
- Plans/Provider_OpenCode.md
- Plans/Models_System.md
preserved_exact_tokens:
- extrepo-20260703-0071
- P1-STREAM-HISTORY-COALESCER-REPLAY
- P1
- Streaming/admission/replay boundary
- OpenCode v2
- Pi
- Codex
- Cline
negative_constraints: []
observed_signal: OpenCode v2 separates context/source/snapshot/session history and recent releases add event streams and paged durable history. Pi reports WS/SSE first-event stalls; Cline/Codex SDKs centralize session events/history.
pm_current_coverage: Prior pass recommended StreamHistoryCoalescer; storage-plan has seglog replay/checkpoints and context ownership.
pm_gap_or_delta: Make settled history admission mandatory for all providers, not just context/cache pass.
proposal_or_recommendation: Add StreamHistoryCoalescer with partial_delta, cumulative_snapshot, reasoning_delta, tool_call_fragment, provider_item_id, provider_error, final_assistant_turn, and durable_history_write phases.
compile_disposition: create_new_planunit
```

### EP-114 - FABLE Wake Coalescing And Transport Receipt Closure

```yaml
plan_unit_id: EP-114
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor owns deterministic scheduler wake coalescing, ready-node score tuple
  sorting, closed failure/blocked mapping, stream terminal timeout, backpressure
  bounds, and transport decision receipts for the FABLE contract-runtime core
  slice. Each {run_id, replan_generation} has at most one pending wake set; the
  earliest wake becomes scheduler.pass.wake_reason, additional wakes become
  coalesced_wake_reasons and wake_event_refs, and watchdog_recheck never outranks
  an event-driven wake. Ready nodes sort by scheduler_lane_rank DESC,
  manual_priority DESC, transitive_unblock_count DESC, ready_since_utc ASC, and
  node_id ASC. Stream terminal timeout is 5000 ms, backpressure is bounded at
  1024 frames or 16777216 bytes, and each adapter selection records a
  transport_decision_receipt.
gui_related: false
gui_classification_reason: This unit defines runtime scheduling and transport behavior, not visual presentation.
depends_on: [EP-026, EP-028, EP-030, EP-032, EP-085, EP-098, EP-110, EP-111, EP-112, EP-113, CV-313]
unblocks: []
acceptance_criteria:
  - "`scheduler.pass` uses the closed wake_reason set shared with Contracts_V0."
  - Wake coalescing records primary wake, coalesced wake reasons, and event refs without creating duplicate scheduler passes.
  - Queue analysis persists the complete score tuple and non-selected reason for ready-but-unselected nodes.
  - Failure and blocked classifications map auth_required separately from auth_expired and fail closed on unknown classifier values.
  - Missing terminal stream events time out after 5000 ms as retryable provider_transient inactivity_timeout rather than durable assistant content.
  - Backpressure is bounded at 1024 frames or 16777216 bytes and overflow returns structured overload evidence.
  - Transport decision receipts include locality, auth, replay, backpressure, fallback, provider support, decision reason, selected timestamp, and event refs.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: fable_executor_wake_coalescing_drift
reasoning_tier: high
context_scope: contract_runtime_core_repair
implementation_surfaces:
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: executor_wake_coalescing_transport_closure
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md
  - Plans/.audits/fable-20260706/P0_P1_REPAIR_PLAN.md
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "`wake_reason`"
  - "`scheduler.pass`"
  - "`coalesced_wake_reasons[]`"
  - "`wake_event_refs[]`"
  - "`scheduler_lane_rank`"
  - "`failure_class`"
  - "`blocked_reason_code`"
  - "`auth_required`"
  - "`auth_expired`"
  - "`stream_terminal_event_timeout_ms = 5000`"
  - "`max_pending_stream_frames = 1024`"
  - "`max_pending_stream_bytes = 16777216`"
  - "`transport_decision_receipt`"
negative_constraints:
  - Do not treat this runtime protocol closure as implementation-readiness proof or runtime certification harness completion.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, production build tasks, generated governance artifacts, or governance seal outputs from this contract unit.
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```
