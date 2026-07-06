# Shard 033: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/storage-plan.md`

Source lines: L16045-L16370

Source SHA256: `3e47688cac83928d9ce1e6e39ce627a4cd5e945975bea34233d3e60380d86ddb`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### SP-227 - P0-HISTORY-STORAGE-CAPS

```yaml
plan_unit_id: SP-227
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  P0-HISTORY-STORAGE-CAPS (P0) is compiled as canonical Puppet Master intent for Bounded session/history storage: Add HistoryObjectBudget and ManagedOutputRef requirements. Segment large histories by reference; never inline unbounded JSON into model context. The preserved PM gap/delta is: Need explicit per-record, per-turn, per-tool-result, and per-thread cap policy with managed-output references and context compiler backpressure. The observed external-repo signal remains source-lineage evidence: Agent Zero issue list reports chat history metadata ~127MB and raw JSON pollution of utility-model context; Cline issues/PRs target large MCP result crashes and compacted provider history; Pi has a SQLite session-storage PR.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- 127MB metadata fixture is rejected/segmented before UI or model context load.
- Context compiler emits compact summaries plus refs, not raw massive JSON.
- Large tool results remain retrievable from artifacts with hashes.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- 127MB metadata fixture is rejected/segmented before UI or model context load.
- Context compiler emits compact summaries plus refs, not raw massive JSON.
- Large tool results remain retrievable from artifacts with hashes.
risk_class: p0_memory_history_logging_hardening
reasoning_tier: high
context_scope: memory_history_logging
implementation_surfaces:
- Plans/storage-plan.md
- Plans/Prompt_Pipeline.md
- Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: p0_history_storage_caps
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0011
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0011
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0007/P0-HISTORY-STORAGE-CAPS@line=7
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0007/P0-HISTORY-STORAGE-CAPS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:7
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0011
external_atom_id: extrepo-20260703-0007
source_row_id: P0-HISTORY-STORAGE-CAPS
priority: P0
finding_family: Bounded session/history storage
source_repos:
- agent0ai/agent-zero
- cline/cline
- earendil-works/pi
target_docs:
- Plans/storage-plan.md
- Plans/Prompt_Pipeline.md
- Plans/Runtime_Artifacts_Panel.md
owner_hints:
- Plans/storage-plan.md
- Plans/Prompt_Pipeline.md
- Plans/Runtime_Artifacts_Panel.md
preserved_exact_tokens:
- extrepo-20260703-0007
- P0-HISTORY-STORAGE-CAPS
- P0
- Bounded session/history storage
- agent0ai/agent-zero
- cline/cline
- earendil-works/pi
negative_constraints: []
observed_signal: Agent Zero issue list reports chat history metadata ~127MB and raw JSON pollution of utility-model context; Cline issues/PRs target large MCP result crashes and compacted provider history; Pi has a SQLite session-storage PR.
pm_current_coverage: PM uses seglog/redb/checkpoints and says transcript retention is bounded/honest.
pm_gap_or_delta: Need explicit per-record, per-turn, per-tool-result, and per-thread cap policy with managed-output references and context compiler backpressure.
proposal_or_recommendation: Add HistoryObjectBudget and ManagedOutputRef requirements. Segment large histories by reference; never inline unbounded JSON into model context.
compile_disposition: create_new_planunit
```

### SP-228 - P1-RESOURCE-QUOTAS-INDEXERS-WATCHERS

```yaml
plan_unit_id: SP-228
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  P1-RESOURCE-QUOTAS-INDEXERS-WATCHERS (P1) is compiled as canonical Puppet Master intent for Resource ceilings for indexers/watchers/background agents: Add RuntimeResourceGovernor PlanUnit with quotas, backoff, suspension, prioritization, and Explain/Resume controls. The preserved PM gap/delta is: Need per-project/global file watcher, indexer, terminal transcript, MCP result, and agent-context budgets with user-visible degradation. The observed external-repo signal remains source-lineage evidence: Warp issue reports exhausting hundreds of thousands of file watchers; Agent Zero history bloat crashes; Cline large MCP/history issues.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Large repo cannot allocate unbounded watchers.
- Quota exceeded degrades with warning and exact subsystem, not crash.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Large repo cannot allocate unbounded watchers.
- Quota exceeded degrades with warning and exact subsystem, not crash.
risk_class: p1_provider_capability_and_metadata_hardening
reasoning_tier: standard
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/storage-plan.md
- Plans/FileManager.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: p1_resource_quotas_indexers_watchers
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0016
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0016
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0012/P1-RESOURCE-QUOTAS-INDEXERS-WATCHERS@line=12
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0012/P1-RESOURCE-QUOTAS-INDEXERS-WATCHERS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:12
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0016
external_atom_id: extrepo-20260703-0012
source_row_id: P1-RESOURCE-QUOTAS-INDEXERS-WATCHERS
priority: P1
finding_family: Resource ceilings for indexers/watchers/background agents
source_repos:
- warpdotdev/warp
- agent0ai/agent-zero
- cline/cline
target_docs:
- Plans/FileManager.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/FinalGUISpec.md
owner_hints:
- Plans/FileManager.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0012
- P1-RESOURCE-QUOTAS-INDEXERS-WATCHERS
- P1
- Resource ceilings for indexers/watchers/background agents
- warpdotdev/warp
- agent0ai/agent-zero
- cline/cline
negative_constraints: []
observed_signal: Warp issue reports exhausting hundreds of thousands of file watchers; Agent Zero history bloat crashes; Cline large MCP/history issues.
pm_current_coverage: PM has dirty-layer watcher design and storage rollups but not a global resource-governor narrative for all background services.
pm_gap_or_delta: Need per-project/global file watcher, indexer, terminal transcript, MCP result, and agent-context budgets with user-visible degradation.
proposal_or_recommendation: Add RuntimeResourceGovernor PlanUnit with quotas, backoff, suspension, prioritization, and Explain/Resume controls.
compile_disposition: create_new_planunit
```

### SP-229 - P0-SYSTEM-RESOURCE-GOVERNOR

```yaml
plan_unit_id: SP-229
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  P0-SYSTEM-RESOURCE-GOVERNOR (P0) is compiled as canonical Puppet Master intent for System memory/process/file-watcher/resource management: Define RuntimeResourceGovernor: memory budgets, queue budgets, process pools, stale helper reaper, file-watcher caps, terminal scrollback/transcript retention, MCP transport cleanup, crash snapshot budget, low-memory degradation mode, and GUI-visible resource alerts. The preserved PM gap/delta is: PM needs a cross-runtime resource governor with explicit limits and cleanup for GUI renderer, PTY terminal, agents, MCP, browser/device sessions, file watchers, logs, memory stores, and helper processes. The observed external-repo signal remains source-lineage evidence: Ghostty reports major memory leaks under long-running Claude Code sessions; Warp reports CPU hangs and large-output TUI crashes; Codex reports stale Computer Use/MCP/app-server helper accumulation; Agent Zero reports large chat.json/memory scalability issues.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Closing/crashing PM reaps child helpers or marks them orphaned for cleanup.
- Huge terminal output applies backpressure without GUI freeze.
- Memory store and chat/session files have size/compaction policies.
- Low-memory mode disables optional previews/agents before core runtime fails.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Closing/crashing PM reaps child helpers or marks them orphaned for cleanup.
- Huge terminal output applies backpressure without GUI freeze.
- Memory store and chat/session files have size/compaction policies.
- Low-memory mode disables optional previews/agents before core runtime fails.
risk_class: p0_memory_history_logging_hardening
reasoning_tier: high
context_scope: memory_history_logging
implementation_surfaces:
- Plans/storage-plan.md
- Plans/FinalGUISpec.md
- Plans/Goal_Runtime_System.md
- Plans/MCP_Integration.md
- Plans/Tools.md
node_compile_hint:
  mode: p0_system_resource_governor
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0067
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0067
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0063/P0-SYSTEM-RESOURCE-GOVERNOR@line=63
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0063/P0-SYSTEM-RESOURCE-GOVERNOR
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:9
source_atom_ids:
- atom-0067
external_atom_id: extrepo-20260703-0063
source_row_id: P0-SYSTEM-RESOURCE-GOVERNOR
priority: P0
finding_family: System memory/process/file-watcher/resource management
source_repos:
- Ghostty
- Warp
- Codex
- Agent Zero
- Cline
target_docs:
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
- Plans/Goal_Runtime_System.md
- Plans/MCP_Integration.md
- Plans/Tools.md
owner_hints:
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
- Plans/Goal_Runtime_System.md
- Plans/MCP_Integration.md
- Plans/Tools.md
preserved_exact_tokens:
- extrepo-20260703-0063
- P0-SYSTEM-RESOURCE-GOVERNOR
- P0
- System memory/process/file-watcher/resource management
- Ghostty
- Warp
- Codex
- Agent Zero
- Cline
negative_constraints: []
observed_signal: Ghostty reports major memory leaks under long-running Claude Code sessions; Warp reports CPU hangs and large-output TUI crashes; Codex reports stale Computer Use/MCP/app-server helper accumulation; Agent Zero reports large chat.json/memory scalability issues.
pm_current_coverage: FinalGUISpec and storage-plan include terminal projection throttling/ring buffers, memory-bounds risks, file watcher risk, persistence, and crash recovery.
pm_gap_or_delta: PM needs a cross-runtime resource governor with explicit limits and cleanup for GUI renderer, PTY terminal, agents, MCP, browser/device sessions, file watchers, logs, memory stores, and helper processes.
proposal_or_recommendation: 'Define RuntimeResourceGovernor: memory budgets, queue budgets, process pools, stale helper reaper, file-watcher caps, terminal scrollback/transcript retention, MCP transport cleanup, crash snapshot budget, low-memory degradation mode, and GUI-visible resource alerts.'
compile_disposition: create_new_planunit
```

### SP-230 - EventRecord Persistence Boundary

```yaml
plan_unit_id: SP-230
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  storage-plan owns the EventRecord persistence boundary for the canonical
  pm.event.v0 envelope in Plans/Contracts_V0.md#EventRecord and
  Plans/event_record.schema.json. Seglog is the authoritative append-only
  MessagePack EventRecord store; redb may store rebuildable checkpoints,
  projections, idempotency indexes, and event_record_index.v1 lookup rows that
  point back to seglog. Replay ordering uses segment generation, segment order,
  byte offset, and sequence_id rather than timestamps. Stored values require
  schema_version, reject unsupported schema_id/schema_version pairs, use
  event_id and idempotency_key according to replay_policy, preserve
  redaction/no-secret rules, and migrate legacy EventEnvelopeV1 type values into
  EventRecord event_type with migration metadata.
gui_related: false
gui_classification_reason: This unit defines storage value encoding, replay, and projection boundaries, not GUI presentation.
depends_on: [SP-001, CV-309]
unblocks: []
acceptance_criteria:
  - Seglog remains the canonical EventRecord source of truth and redb remains projection/index/checkpoint storage.
  - EventRecord values are MessagePack encoded and conform to Plans/event_record.schema.json.
  - redb event lookup rows carry schema_id, schema_version, event_type, segment refs, offset, payload hash, idempotency, and causality refs while pointing back to seglog.
  - Replay order is deterministic and not timestamp-derived.
  - Legacy EventEnvelopeV1 is compatibility input only and new writers emit EventRecord.
  - This is partial closure for EventRecord persistence only; not all redb value schemas or payload schemas are materialized.
validation_surfaces:
  - python3 scripts/pm-implementation-readiness.py validate
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates --subcheck-timeout-seconds 120
risk_class: event_record_storage_boundary_drift
reasoning_tier: high
context_scope: event_record_persistence_boundary
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/event_record.schema.json
  - scripts/pm-implementation-readiness.py
node_compile_hint:
  mode: event_record_persistence_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - chat:2026-07-06-tier-0c-1-eventrecord-storage-boundary
preserved_exact_tokens:
  - "`EventRecord`"
  - "`pm.event.v0`"
  - "`schema_version`"
  - "`event_record_index.v1:{project_id}:{sequence_id}:{event_id}`"
  - "`event_id`"
  - "`idempotency_key`"
  - "`sequence_id`"
  - "`event_type`"
  - "`EventEnvelopeV1`"
negative_constraints:
  - Do not treat redb projections or lookup rows as a second mutable EventRecord source of truth.
  - Do not infer schema shape from event_type when schema_id or schema_version is missing or unsupported.
  - Do not use timestamps as replay ordering or duplicate-delivery proof.
  - Do not store raw secrets, tokens, passwords, credentials, API keys, OAuth values, local credential paths, or local machine secrets in EventRecord values.
  - Do not claim every redb family, event payload schema, provider stream, runtime lifecycle, clean-room harness, GUI wiring, security boundary, or behavioral acceptance path is complete from this EventRecord boundary.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime launches, or production build tasks from this storage unit.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/event_record.schema.json
```
