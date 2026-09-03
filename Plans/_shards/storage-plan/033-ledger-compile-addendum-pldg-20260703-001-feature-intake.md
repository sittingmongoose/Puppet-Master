# Shard 033: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/storage-plan.md`

Source lines: L16169-L16646

Source SHA256: `c0d0f887c5dec45535091dc8cb54ac655874a783a962dc42a9e16326923a9738`

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
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/storage-plan.md
canonical_text: >-
  SP-228 is retired as behavior authority. Its watcher/indexer/background-pressure evidence remains source lineage consumed by SIR-006, the sole RuntimeResourceGovernor owner. Storage owns only persisted requested ceilings, host observations, admissions, ObservableWork projections, retention, replay, and migration; it cannot compute effective host limits, suspend or prioritize work, or expose peer Explain/Resume policy.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- SIR-006
unblocks: []
acceptance_criteria:
- SIR-006 retains the useful quota, backoff, suspension, prioritization, and Explain/Resume requirements.
- Storage persists governor inputs and outputs without becoming a second governor.
- No consumer can cite SP-228 as authority for effective host admission.
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
  mode: retired_runtime_resource_governor_lineage
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
pm_gap_or_delta: Closed by SIR-006, which owns per-project/global watcher, indexer, terminal, MCP, and agent-context admission and visible degradation.
proposal_or_recommendation: Consume the existing SIR-006 RuntimeResourceGovernor; Storage persists its inputs, decisions, observations, and projections only.
compile_disposition: retired_to_existing_owner
```

### SP-229 - P0-SYSTEM-RESOURCE-GOVERNOR

```yaml
plan_unit_id: SP-229
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/storage-plan.md
canonical_text: >-
  SP-229 is retired as behavior authority. Its memory, process, watcher, queue, helper-reaping, low-memory, backpressure, and visible-degradation evidence remains source lineage consumed by SIR-006, the sole RuntimeResourceGovernor owner. Storage retains only value-family, retention, replay, compaction, migration, and recovery responsibilities for accepted governor records and projections.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- SIR-006
unblocks: []
acceptance_criteria:
- SIR-006 retains process/helper reaping, queue and memory budgets, backpressure, low-memory reduction, and user-visible admission evidence.
- Storage records requested/effective limits, decisions, observations, and retention without owning host admission behavior.
- No consumer can cite SP-229 as a peer RuntimeResourceGovernor.
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
  mode: retired_runtime_resource_governor_lineage
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
pm_gap_or_delta: Closed by SIR-006, the sole cross-runtime governor for GUI, PTY, agents, MCP, Browser/device, watchers, logs, memory stores, helpers, and host pressure.
proposal_or_recommendation: 'Consume SIR-006 RuntimeResourceGovernor and keep Storage limited to retained policy inputs, decisions, observations, projections, migration, and recovery.'
compile_disposition: retired_to_existing_owner
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
  projections, dedicated dedupe indexes, and event_record_index.v2 scope-partitioned lookup rows that
  point back to seglog. Replay ordering uses segment generation, segment order,
  byte offset, and sequence_id rather than timestamps. Stored values require
  schema_version, reject unsupported schema_id/schema_version pairs, use
  event_id and idempotency_key according to replay_policy, preserve
  redaction/no-secret rules, and normalize legacy EventEnvelopeV1 values deterministically
  in memory with projector_replay_only rather than rewriting or appending them.
gui_related: false
gui_classification_reason: This unit defines storage value encoding, replay, and projection boundaries, not GUI presentation.
depends_on: [SP-001, CV-309]
unblocks: []
acceptance_criteria:
  - Seglog remains the canonical EventRecord source of truth and redb remains projection/index/checkpoint storage.
  - EventRecord values are MessagePack encoded and conform to Plans/event_record.schema.json.
  - redb event lookup rows carry schema_id, schema_version, event_type, segment refs, offset, payload hash, idempotency, and causality refs while pointing back to seglog.
  - Replay order is deterministic and not timestamp-derived.
  - Application/project scope partitions validate without fake project identities; new writers emit EventRecord 2.0.0 only.
  - Legacy EventEnvelopeV1 is compatibility input only, normalizes byte-deterministically in memory, and never rewrites the source on ordinary open.
  - Dedupe indexes catch up to the verified seglog tail or append fails closed without mutation.
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
  - "`event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`"
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

### SP-231 - Storage Value Registry And Launch-Critical Value Materialization

```yaml
plan_unit_id: SP-231
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  storage-plan owns the Tier 0C-2 storage value-schema registry in
  Plans/storage_value_registry.json, with file shape governed by
  Plans/storage_value_registry.schema.json. The registry converts redb and
  seglog key-template prose into versioned value contracts. Launch-critical
  rows are fully materialized for ApprovedPlanPack, PlanApproved outbox,
  PlanCompileRun, compiler wave contract, WorkGraph draft, WorkNodeRequest,
  Executor intake report, attempt receipt, EventRecord index, blocked
  projection, and goal receipt. Case L additionally requires materialized migration,
  editor recovery/workspace, hotreload, onboarding, safe-point/restore transaction,
  restore-point, EventRecord dedupe, retention/anchor/maintenance/quarantine/deletion
  families under the registry-owner repair. Permission snapshots and genuinely later
  GUI/provider/feature projections remain independently deferred with owner, reason,
  and reopen condition. Persisted values require schema_version,
  name key shape and value owner, specify replay, migration, retention and
  compaction behavior, and reject raw secrets, tokens, passwords, credentials,
  API keys, OAuth values, local credential paths, or local machine secrets.
gui_related: false
gui_classification_reason: This unit defines backend storage value contracts and registry validation, not GUI presentation.
depends_on: [SP-214, SP-215, SP-216, SP-230, CV-287, CV-288, CV-290, CV-309, PWIZ-014, PNC-010, PNC-013, PNC-014, EP-099, EP-103]
unblocks: []
acceptance_criteria:
  - Plans/storage_value_registry.json parses and conforms to Plans/storage_value_registry.schema.json.
  - Every registered storage family has key_shape, value_schema_id/ref, owner_doc, producer, consumers, schema_version, encoding, replay, migration, retention/compaction, redaction/no-secret, and legacy/canonical crosswalk status.
  - Launch-critical rows include the original Tier 0C-2 set plus Case L migration receipt, safe-point record, and safe-point restore transaction; no mutation-capable path depends on a deferred bundled family.
  - Required-MVP editor, hotreload, onboarding, restore-point, dedupe, retention/anchor/maintenance/quarantine/deletion rows are materialized with closed value schemas before implementation depends on them.
  - Every persisted value requires schema_version and materialized schemas carry matching schema_id and schema_version constants.
  - Non-critical families are not prose-only authority; deferred rows include owner, reason, and reopen condition.
  - Coordination event, read-model, and debug mirror export families are registered as non-launch-critical storage families; mirrors remain compatibility/debug surfaces only.
  - scripts/pm-implementation-readiness.py validate rejects missing schema_version, missing owners, missing materialized launch-critical families, and unredacted secret-bearing fields.
  - This is partial storage-value progress only; IRB-002 remains open until all required persistence families and replay/migration behavior are executable and proven.
validation_surfaces:
  - python3 scripts/pm-implementation-readiness.py validate
  - python3 scripts/pm-implementation-readiness.py self-test
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates --subcheck-timeout-seconds 120
risk_class: storage_value_schema_registry_drift
reasoning_tier: high
context_scope: tier_0c_2_storage_value_registry
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.schema.json
  - Plans/storage_value_registry.json
  - scripts/pm-implementation-readiness.py
node_compile_hint:
  mode: tier_0c_2_storage_value_registry
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - chat:2026-07-06-tier-0c-2-storage-value-registry
preserved_exact_tokens:
  - "`ApprovedPlanPack`"
  - "`PlanApproved`"
  - "`PlanCompileRun`"
  - "`compiler wave`"
  - "`WorkGraph draft`"
  - "`WorkNodeRequest`"
  - "`Executor intake`"
  - "`attempt receipt`"
  - "`event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`"
  - "`blocked_projection.v1:{project_id}:{node_id}`"
  - "`goal_receipt.v1:{project_id}:{receipt_id}`"
  - "`coordination.agent_registered`"
  - "`coordination_snapshot_projection.v1:{project_id}:{projection_scope}`"
  - "`schema_version`"
  - "`deferred_not_build_blocking`"
negative_constraints:
  - Do not declare Puppet Master implementation-buildable from storage value schemas alone.
  - Do not close provider_stream, runtime_lifecycle, clean_room_harness, GUI, security, behavioral_acceptance, or broad redb-family blockers from this registry.
  - Do not create WorkNodes, NodeSeeds, candidates, queues, manifests, implementation files, runtime launches, product build tasks, or executable PlanCompile artifacts.
  - Do not rely on prose-only redb key templates as implementation authority after this registry exists.
  - Do not treat coordination debug mirrors or project_state fields as canonical runtime coordination truth.
  - Do not store raw secrets, tokens, passwords, credentials, API keys, OAuth values, local credential paths, or local machine secrets in persisted values.
owner_hints:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/storage_value_registry.schema.json
  - scripts/pm-implementation-readiness.py
```

### SP-232 - Coordination Record Projection And Mirror Storage Contract

```yaml
plan_unit_id: SP-232
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  storage-plan owns the storage boundary for active-agent coordination canon: coordination EventRecords in seglog,
  authoritative redb projections for agent/file/operation/snapshot read models, a coordination projector checkpoint, and
  optional debug/export mirror metadata. `project_state`, `active-agents.json`, `agent-messages.json`, and
  `.puppet-master/state/*.json` paths are compatibility/debug/export surfaces only and must not own runtime coordination
  truth.
gui_related: false
gui_classification_reason: This unit defines backend storage records and mirror/export boundaries, not GUI presentation.
depends_on: [SP-230, SP-231, CV-309, OSI-432]
unblocks: []
acceptance_criteria:
  - The canonical coordination event families are named for agent registration, status update, operation update, file-activity update, unregister, crash, abort, and debug mirror export.
  - The authoritative projection families are `coordination_agent_projection.v1:{project_id}:{agent_id}`, `coordination_file_projection.v1:{project_id}:{path_hash}:{agent_id}`, `coordination_operation_projection.v1:{project_id}:{agent_id}:{operation_id}`, `coordination_snapshot_projection.v1:{project_id}:{projection_scope}`, and `projector.checkpoint.coordination:{project_id}`.
  - Up to 32 active agents across multiple worktrees update state only through the PM-owned append API with idempotency, expected revision/last-applied event id, and a redb projection/checkpoint transaction.
  - Stale writes fail with coordination conflict diagnostics rather than overwriting canonical state.
  - "`.puppet-master/state/active-agents.json`, `.puppet-master/state/agent-messages.json`, `.puppet-master/state/verification-{node_id}-end.json`, and `.puppet-master/state/handoff-validation-{node_id}.json` are registered or retired as debug/export mirrors and cannot drive scheduling, execution admission, conflict prevention, prompt injection, unregister, crash, abort, receipt, or validation decisions."
  - Mirror corruption, absence, lag, stale checkpoint, or disk-full failure is recovered by quarantine or regeneration from seglog/redb and recorded with `coordination.debug_mirror_exported`.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: storage_coordination_canon_regression
reasoning_tier: high
context_scope: storage_coordination_canon
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/path_reference_registry.json
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: storage_coordination_canon_repair
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl:6
source_atom_ids: []
preserved_exact_tokens:
  - "active-agents.json"
  - "agent-messages.json"
  - ".puppet-master/state/verification-{node_id}-end.json"
  - ".puppet-master/state/handoff-validation-{node_id}.json"
  - "coordination.agent_registered"
  - "coordination.debug_mirror_exported"
  - "coordination_snapshot_projection.v1:{project_id}:{projection_scope}"
negative_constraints:
  - Do not store active-agent runtime truth in project_state or loose JSON files.
  - Do not use read-modify-write JSON files as the canonical coordination transaction boundary.
  - Do not allow mirror lag, corruption, or absence to change authoritative scheduling or execution decisions.
  - Do not declare broad runtime/storage buildability from these deferred coordination registry rows alone.
owner_hints:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/path_reference_registry.json
```
