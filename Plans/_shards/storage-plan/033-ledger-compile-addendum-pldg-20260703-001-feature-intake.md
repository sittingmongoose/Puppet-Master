# Shard 033: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/storage-plan.md`

Source lines: L16015-L16269

Source SHA256: `146be3782a1289e0ab7027b950b1f261d6a0e0802ddc6da7732b684ec53664d5`

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
