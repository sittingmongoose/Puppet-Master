# Shard 047: Working Notebook And Context Transition Storage Addendum (2026-09-05)

Source: `Plans/storage-plan.md`

Source lines: L18774-L18896

Source SHA256: `6cae6d4bebe68a39b13ecadcec32580598254209e62566daff4d272354e4dd08`

---

## Working Notebook And Context Transition Storage Addendum (2026-09-05)

<a id="working-notebook-and-context-transition-storage-2026-09-05"></a>

Packet `PM-WNC-2026-09-05-v1`. Notebook semantics are owned by `Plans/Working_Notebook.md`; this addendum owns the persistence disposition. The Working Notebook persists through the existing seglog/redb stack and existing search/artifact machinery: no SQLite, no required external notes service, and no second transcript/event database. Notebook data is physically and logically separate from the restricted Assistant memory store (`assistant_memory.redb`).

The registry (Plans/storage_value_registry.json) gains four `deferred_not_build_blocking` families owned by this addendum, with value schemas in `Plans/working_notebook_contracts.schema.json`:

| family_id | key shape | retention |
|---|---|---|
| `working_notebook_record` | `working_notebook.v1:{project_id}:{notebook_id}` | RP-AUTHORITY-INDEFINITE |
| `working_notebook_entry_record` | `working_notebook_entry.v1:{project_id}:{notebook_id}:{entry_id}` | RP-AUTHORITY-INDEFINITE |
| `notebook_checkpoint_record` | `notebook_checkpoint.v1:{project_id}:{checkpoint_id}` | RP-AUTHORITY-INDEFINITE |
| `context_transition_record` | `context_transition.v1:{project_id}:{transition_id}` | RP-RUNTIME-365D |

**Checkpoint commit barrier.** Before a context-transition checkpoint publishes as `committed`, every referenced required note revision and every referenced workflow checkpoint is durably available: required note/entry writes and workflow checkpoint writes run as `durability_class = barrier` appends inside the existing two-barrier protocol (frame durability, then atomic manifest watermark promotion), and the committed checkpoint record publishes only after its commit manifest names their receipts. Where the notebook store and a workflow store differ, the existing commit-manifest/outbox protocol applies; no distributed atomic transaction is asserted. A failed partial write never exposes a committed checkpoint projection, a note file alone is never a side-effect checkpoint or a replacement for pending tool receipts, and replaying a committed checkpoint request returns the original checkpoint without a second write.

**Read-after-commit and index lag.** Committed notebook writes are directly readable from the authoritative records regardless of projection state. Notebook search indexes are rebuildable scoped projections with explicit watermarks; readers that require authority verify checkpoint/watermark coverage, lag is disclosed as lag (typed `notebook_index_lag`) and never as authoritative absence, and index failure never loses canonical note state. Fallback scan/recovery stays bounded and never loads an entire notebook.

**Retention, holds, and backup participation.** Notebook lifecycle states (`active | superseded | archived | tombstoned`) drive compaction eligibility; growth review at 64 active entries or 1 MiB active body text archives only resolved, unpinned, unrestricted material. Current checkpoint dependencies act as recovery holds and cannot be silently purged; tombstones preserve provenance. Notebook and checkpoint families are owned project data for backup/restore under `Plans/Backup_Restore_System.md` (restore remaps destination identity and preserves restrictions; no automatic execution on restore), and they move with the Project Vault under `Plans/Project_Sync_and_Backbone.md` one-writer cutover fencing. A context reset deletes nothing; deleting a note deletes no source history.

```yaml
plan_unit_id: SP-255
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The Working Notebook persists through the existing seglog/redb stack under storage ownership via four deferred_not_build_blocking registry families (working_notebook_record, working_notebook_entry_record, notebook_checkpoint_record, context_transition_record) with value schemas in Plans/working_notebook_contracts.schema.json. Notebook data is physically and logically separate from the restricted Assistant memory store; no SQLite, no external notes service, and no second transcript store exists. Search indexes are rebuildable scoped projections with explicit watermarks; committed writes are directly readable regardless of index state, lag is typed and disclosed, and index failure never loses canonical note state.
gui_related: false
gui_classification_reason: Storage disposition is persistence behavior, not GUI work.
depends_on: [SP-243, WN-017]
unblocks: [SP-256, SP-257]
acceptance_criteria:
  - Every notebook family has exactly one registry row with key shape, owner, schema ref, retention, and redaction disposition.
  - Rebuild from canonical note records succeeds; stale index state is disclosed as lag.
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
risk_class: second_source_of_truth
reasoning_tier: high
context_scope: storage_contracts
implementation_surfaces: [Plans/storage-plan.md, Plans/storage_value_registry.json, Plans/working_notebook_contracts.schema.json]
node_compile_hint: {mode: storage_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-T01
  - source_packet:PM-WNC-2026-09-05-v1:WNC-T02
  - source_packet:PM-WNC-2026-09-05-v1:WNC-H03
preserved_exact_tokens: ["deferred_not_build_blocking", "rebuildable scoped projections", "notebook_index_lag"]
negative_constraints:
  - Do not add SQLite, an external notes dependency, or a second transcript/event store.
  - Do not co-locate notebook data with the Assistant memory store.
owner_hints: [Plans/storage-plan.md, Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Working_Notebook.md, ContractName:Plans/assistant-memory-subsystem.md

```yaml
plan_unit_id: SP-256
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The notebook checkpoint commit barrier uses the existing two-barrier durability protocol. Every referenced required note revision and workflow checkpoint is durably available (durability_class = barrier appends with synced receipts) before the notebook_checkpoint_record publishes as committed with a commit manifest naming their receipts; differing stores use the existing commit-manifest/outbox protocol rather than an undesigned distributed transaction. A partial write never exposes a committed checkpoint; replay of a committed checkpoint request returns the original checkpoint; a note file alone is never a side-effect checkpoint or a tool-receipt replacement. Required checkpoint write failure produces typed failure/deferral with recovery material preserved, never a misleading saved state.
gui_related: false
gui_classification_reason: Durability protocol is storage behavior, not GUI work.
depends_on: [SP-255]
unblocks: [SP-257, WN-016]
acceptance_criteria:
  - Crash before commit, mid-write, and after commit recover deterministically with no partial committed checkpoint exposed.
  - Replayed commit requests are idempotent.
  - Required checkpoint failure preserves recovery material.
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
  - Plans/working_notebook_contract_fixtures.json
risk_class: false_durability
reasoning_tier: high
context_scope: storage_contracts
implementation_surfaces: [Plans/storage-plan.md, Plans/Prompt_Pipeline.md]
node_compile_hint: {mode: storage_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C06
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C08
preserved_exact_tokens: ["two-barrier", "commit manifest", "never exposes a committed checkpoint"]
negative_constraints:
  - Do not publish a committed checkpoint over a partial write.
  - Do not substitute a note write for pending tool receipts.
owner_hints: [Plans/storage-plan.md, Plans/Prompt_Pipeline.md]
```

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Working_Notebook.md, ContractName:Plans/Shared_Integration_Runtime.md

```yaml
plan_unit_id: SP-257
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Notebook lifecycle states (active, superseded, archived, tombstoned) drive retention: growth review at 64 active entries or 1 MiB active body text archives only resolved, unpinned, unrestricted material; current checkpoint dependencies act as recovery holds and cannot be silently purged; tombstones preserve provenance metadata. Notebook and checkpoint families are owned project data for backup/restore (destination-owned identity remapping, preserved restrictions, no automatic execution on restore, no note bodies in settings transfer) and move with the Project Vault under Project Sync one-writer cutover fencing, after which a stale host writer is rejected by lease/generation fencing."
gui_related: false
gui_classification_reason: Retention and recovery are storage behavior, not GUI work.
depends_on: [SP-255]
unblocks: []
acceptance_criteria:
  - Growth review never silently discards unresolved, pinned, restricted, or checkpoint-dependent material.
  - Restored/copied notebook records carry destination identity and preserved restrictions.
  - A stale host writer after cutover is fenced.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: silent_data_loss
reasoning_tier: standard
context_scope: storage_contracts
implementation_surfaces: [Plans/storage-plan.md, Plans/Backup_Restore_System.md, Plans/Project_Sync_and_Backbone.md]
node_compile_hint: {mode: storage_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N16
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I11
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I12
  - source_packet:PM-WNC-2026-09-05-v1:WNC-T04
preserved_exact_tokens: ["recovery holds", "tombstones preserve provenance", "one-writer cutover"]
negative_constraints:
  - Do not purge current checkpoint dependencies during retention.
  - Do not include note bodies in settings transfer.
owner_hints: [Plans/storage-plan.md, Plans/Backup_Restore_System.md]
```

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Backup_Restore_System.md, ContractName:Plans/Project_Sync_and_Backbone.md
