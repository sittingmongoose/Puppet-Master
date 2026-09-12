# Shard 053: Run-start index consumers and checkpoint - 2026-09-11

Source: `Plans/storage-plan.md`

Source lines: L19399-L19543

Source SHA256: `e72da89398067e67dcf3b6650e6769278329504112579bce60e481417e830907`

---

## Run-start index consumers and checkpoint - 2026-09-11

This addendum newly defines the missing `run.started` consumer/projector/checkpoint binding under DL-045. It preserves `event-family-run-started@2.0.0`, the current closed payload root `Plans/event_payload_run_started.schema.json#`, and the source event's exact `RP-RUNTIME-365D@1.0.0` assignment. A registered event is not runtime proof. This definition does not admit another event or turn an index into execution authority.

### Exact owned projection and read consumers

Define **new binding** `storage.run_started_index.v1`, binding version `1.0.0`, as the event-specific read/projector binding over the existing **seglog EventRecord index projector** output. The generic index writer remains independent; this new binding reads and byte-verifies its published rows and writes only its own filtered checkpoint. The reused durable projection is the already materialized `event_record_index` family: key `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`, value `pm.storage_value.event_record_index.v2@2.0.0`, exact schema `Plans/storage_value_registry.json#/families/8/value_schema` at this materialization. Family-ID lookup must resolve the same named `event_record_index` row; a later array reordering cannot select another family. No new run-state, run-receipt, UsageRecord or topology projection is introduced. Index rows retain `RP-EVENT-INDEX-SOURCE@1.0.0`.

Four **new read-consumer bindings**, each at `1.0.0`, use that same reducer and checkpoint:

| Consumer ID | Owner and existing read path | Permitted run-start effect |
|---|---|---|
| `run_graph.run_start_context.v1` | Run_Graph_View, focused-run graph/identity inspection | Join the verified historical start and immutable runtime identity to the selected run. |
| `orchestrator.history_run_start.v1` | Orchestrator_Page, existing History/Ledger and focused-run projections | Expose one source-backed start fact and its original event identity in the selected run's history. |
| `usage.run_start_attribution.v1` | usage-feature, existing runtime attribution/UsageRecord correlation | Supply run/thread and immutable requested/effective identity context; never create or settle accounting. |
| `executor.run_start_recovery_evidence.v1` | Executor_Protocol, existing restart/admission revalidation | Read whether the original start barrier exists and resolve its immutable snapshot; never replay dispatch. |

These are read bindings, not four asynchronous writers. They have no independent durable cursor, outbox, mutable run status or billing side effect. Their returned data is qualified by the same checkpoint/index-generation read token. Any future independently persisted consumer effect requires its own owner-backed transaction/checkpoint contract before use. Existing full-index publication and its global checkpoint remain owned by the full EventRecord index projector; this filtered binding cannot write, advance, replace or stand in for that global checkpoint.

### Source lookup, exact filter and completeness

For a requested `(project_id, run_id)` use the Storage-owned reversible `scope_partition = "project~" + base64url_no_pad(UTF8(project_id))`; no path, label, active-tab selection, fake project or prefix guess supplies scope. Under one read generation, enumerate the complete relevant scope-partitioned index range through the **verified full-index checkpoint**, retaining sequence order and bounded pagination. `event_type` is available in the index value; **`run_id` is not**. A row cannot match a run until the following source lookup succeeds:

1. Verify index key/value scope, sequence and event identity against the CURRENT-selected complete index generation, `publication_locator` and its resolved full-index checkpoint. A publication checkpoint ref is a reference to actual verified Storage evidence, never a fabricated key. Resolve the matching generation-qualified `source_locator` to the selected seglog frame; revalidate Case L-2 frame bounds/CRC/schema and identity. Cross-check `event_type`, `sequence_id`, `event_id`, payload hash and producer semantic digest with the index. `source_locator.byte_offset` names the source frame, not an offset guessed from another generation.
2. Validate current EventRecord `2.0.0` and the exact `run.started` v2 payload root, or the separately registered immutable compatibility path below. Check project/run/thread joins, immutable snapshot ref/digest and every required requested/effective runtime equality. Resolve `requested_effective_runtime` from its canonical store and verify its six owner references. Current Settings, account choice, provider labels or payload fragments cannot reconstruct a missing snapshot.
3. Compare the **validated payload's exact `run_id`** with the request. Optional thread filtering must also agree with the payload/envelope/snapshot, never substitute for run identity. Return only source-backed facts permitted by current access and deletion policy. A nonmatching, fully verified row is a filter skip; an unreadable potentially matching row is not a skip.
4. Complete the predicate over the declared retained range before claiming complete run-start coverage. Pagination, an early match, one row's maximum sequence, or a cached run ID cannot establish completeness. A volatile acceleration cache is permissible only under the exact storage instance, scope, binding version, CURRENT generation and checkpoint token; a cache miss or changed token requires the same verified lookup.

The filtered checkpoint proves examination of the complete declared source/index boundary, not that every integer sequence exists. Legal allocator gaps and explicit retention removals require their actual manifest evidence. Unknown/unregistered events, malformed rows/frames, unprovable identity, uncovered index ranges, conflicting repeated run-start identity, or unresolved applicable snapshot evidence cannot count as examined coverage or advance this binding. A no-match result is `not_found_in_retained_coverage`, never proof that the run never existed. Authorized removal is `source_removed`; a corrupt or unexplained hole is `source_unavailable`, not expiry.

### New exact checkpoint value and commit boundary

Define **new physical checkpoint family** `run_started_index_checkpoint`, value schema `pm.storage_value.run_started_index_checkpoint.v1@1.0.0`, sidecar `Plans/run_started_consumer_contracts.schema.json#/$defs/checkpoint`. Its exact key is:

`run_started_index_checkpoint.v1:{storage_instance_id}:{scope_partition}`

`storage_instance_id` is the actual Storage UUID, not a run-derived ID. The scope partition is the reversible project encoding above. This one key covers all retained `run.started` rows for that project at the declared full-index boundary; it is not a checkpoint per run or a renamed global checkpoint. A missing checkpoint has no implicit zero/current value and starts a verified rebuild.

The closed value fixes projector ID/version, event type, index value schema ID/version and its own schema version. It records the actual storage instance/project/scope, full-index checkpoint ref, CURRENT selection digest, first retained sequence, verified index-through sequence, filter-complete flag and State. Its closed survivor cursor contains exactly `manifest_generation`, `recovery_epoch`, `segment_generation`, `segment_name`, `byte_offset`, `last_sequence_id`, `last_event_id`, `survivor_prefix_sha256`, and `projector_schema_version`. `byte_offset` identifies the last fully examined frame; restart rereads that frame inclusively, cross-checks identity/digest, then continues. An inclusive reread is idempotent and never repeats a consumer effect. Timestamp is observation metadata only.

`source_cursor.last_sequence_id == index_through_sequence_id`; first-retained sequence is no greater than that bound. The CURRENT digest, manifest/recovery identity, actual full-index checkpoint and survivor prefix must match live Storage authority. `state=current` requires `filter_complete=true`, `health=healthy` and a fully verified declared range. `degraded` may describe verified survivors with explicit owner loss evidence, but it is never current/healthy or mutation authority. `withdrawn` permits no new reader publication or checkpoint advancement. Invalid combinations fail validation.

The two ordered barriers are explicit and are not circular:

1. **Generic index publication.** The existing full EventRecord index writer independently validates source frames, commits its rows and global checkpoint, and publishes the complete CURRENT-selected generation under the existing Storage contract. This stage does not depend on the new run-start checkpoint or runtime-snapshot availability; it may expose valid metadata for an event whose referenced runtime snapshot is presently unavailable. This new binding writes no index row and changes no global checkpoint or CURRENT selector.
2. **Run-start read/checkpoint publication.** Only after that complete index boundary is durable/selected does `storage.run_started_index.v1` open a consistent redb/index read snapshot under the actual manifest/CURRENT maintenance fence. It enumerates and byte-verifies the existing row/range, resolves source payload and immutable runtime snapshot, validates the full filter, and computes the read-only run-start join in that same source snapshot. Its redb transaction writes **only the new filtered checkpoint**, conditioned on unchanged index generation/global-checkpoint identity, source/snapshot evidence, deletion/access state and prior filtered-cursor CAS. The logical join is not a second durable row: consumer publication occurs only after this checkpoint commit, using the exact captured snapshot/read token, and is revalidated before disclosure. If a fence changes before commit or disclosure, abort/discard the new join and return stale/unavailable; no filtered cursor advance can claim the changed boundary. No index-only fact substitutes for a missing source or snapshot.

The atomic owned effect is the filtered checkpoint plus publication eligibility of the computed read-only join against its immutable indexed source snapshot. There is no separate durable consumer state that can commit before or after this checkpoint. All four readers use that same token and have zero canonical/Usage/runtime writes. A later reader must reacquire and revalidate the token; an old in-memory join is never current merely because a checkpoint was once committed. Failure or crash before the filtered commit leaves its prior checkpoint; crash after commit can recompute the identical join from the referenced snapshot without repeating a semantic write. An index publication that succeeds while the filtered stage fails remains valid generic metadata, with this binding explicitly incomplete. This avoids stalling audit lookup on missing runtime identity.

Full-index CURRENT publication remains the stronger prerequisite and is never inferred from filtered progress. Compaction's builder may prepare a filtered target checkpoint against its verified shadow, but it cannot expose that checkpoint/join until the existing synchronized CURRENT switch selects the complete target and redb activation reconciles. Crash across CURRENT follows Case L-2/compaction authority order, never mtime. No cross-store transaction is implied: canonical snapshot availability is established beforehand and revalidated under the existing storage maintenance/read fence, and its custody remains unchanged. A missing/corrupt referenced snapshot may block the filtered reader; it does not rewrite or invalidate an otherwise valid metadata index row.

### Replay, recovery, custody and withdrawal

Same event identity and semantic digest reuses the existing index row and produces one history fact. A different digest under the same event or scoped idempotency identity is `idempotency_conflict`; unreadable dedupe authority is `dedupe_unavailable`. The run-start binding never creates a replacement event or a second dispatch to repair a missing acknowledgement. A late start fact cannot turn a terminal, stopped, superseded or historical run into a current running run. Current run/attempt state still comes from Executor-owned canonical records.

An invalid or missing checkpoint is secured under existing Q-DERIVED quarantine before a governed rebuild. Rebuild only from the CURRENT-selected retained canonical event/index boundary and the immutable snapshot authority, not old run keys, JSONL, GUI state, cached account context or index metadata alone. Schema/binding version mismatch fences these consumers until the exact reader or owner-governed rebuild is available. Compaction translates by preserved event/sequence identity only with matching survivor evidence; otherwise rebuild. No retired physical locator survives. Canonical `requested_effective_runtime`, `executor_intake_report` or `attempt_receipt` bytes are never rebuilt from this checkpoint or from a start event; missing canonical authority uses its mandatory-backup recovery and mutation fence. Storage recovery does not automatically resume execution.

The source event remains under **`RP-RUNTIME-365D@1.0.0`**, including its run-completion anchor, one-million/run and five-million/project limits, latest-25 terminal-run preservation and all stronger holds. The existing index remains **`RP-EVENT-INDEX-SOURCE@1.0.0`**. The new disposable checkpoint is explicitly assigned existing **`RP-PROJECTION-3GEN@1.0.0`**: `current_plus_history`, terminal-transition anchor, 604800 seconds, at most three per logical key, hold eligible, overflow action `rebuild_projection` and expiry action `rebuild`. This assignment creates no policy and does not extend or shorten source retention; a missing checkpoint requires rebuild, never a source-data hold or event expiry. The current key is the active record; prior physical generations are handled solely by existing storage migration/compaction machinery, not extra invented keys.

For this new checkpoint, the exact terminal transition is `current|degraded -> withdrawn`. The successful withdrawal transaction preserves the examined cursor, fences all consumer publication, and fixes `updated_at_utc` to the first durable withdrawal time; that immutable value anchors the existing 604800-second TTL. Repeat withdrawal preserves that time and cannot reset expiry. Run completion, cursor refresh, observation, or a generic index CURRENT switch is not this terminal anchor. Current/degraded values have no terminal TTL anchor. A withdrawn value cannot become current again through ordinary refresh; an explicitly adopted compatible successor or governed rebuild uses its own validated generation. Existing physical-generation retention and the three-per-logical-key limit remain separate, with the existing hold/rebuild rules.

Before writing or exposing index/checkpoint/ref/diagnostic data, apply existing no-secret and access checks. Checkpoint values contain only IDs, hashes, cursors and non-secret Storage refs; never payload copies, credentials, account material, local absolute paths, content or capabilities. Snapshot refs remain non-capability joins; dereferencing requires current authorization. Raw invalid bytes retain source permissions and existing quarantine custody, never routine export. Account-sensitive snapshot details are exposed only by their owners, not copied into this binding.

Deletion is evaluated from actual owner tombstones at read/publication time and after restore, not from an old checkpoint. Thread deletion cannot resurrect navigation, content, search or exports; retained non-content runtime/audit facts remain governed by their existing policy. Removing a project from the list is a registry/UI tombstone, not physical purge; separately confirmed project-data deletion follows Storage's scoped intent/compaction rules. Purge/removal invalidates affected volatile views and checkpoints before any ordinary visibility can be rebuilt. No new hold, early purge, app-global deletion, or recovery permission follows from this binding.

Compatibility remains exact: `run.started` v1 reads only through `Plans/event_payload_run_started.schema.json#/$defs/run_started_1_0_0_compatibility_reader` and `MIG-RUN-STARTED-PAYLOAD-001@1.0.0`. It may use only immutable owner evidence to satisfy every v2 field, then validate the root and preserve source/target/upgrader provenance without rewriting or appending. Unresolvable input takes `run_started_v1_upgrade_unresolvable` with no consumer effect/advance. A validated transient `projector_replay_only` view may satisfy this read/checkpoint boundary after the generic writer has indexed the original source under its existing normalization contract. The generic index keeps original source payload/semantic hashes and generation-qualified provenance; this binding never substitutes upgraded-view hashes or rewrites that row. Both original-byte validation and transient v2 validation must pass. All four consumers remain read-only; the transient view cannot dispatch, notify, bill, mutate canonical values, or certify execution. No legacy alias or extension is added.

Withdrawal order is: if the event writer is withdrawn, stop new writes at the existing Executor run-start admission boundary; for consumer/checkpoint-only withdrawal, fence only the affected readers and any recovery admission that depends on them, without creating an extra GUI/index condition on independent new-run admission; fence dependent consumers; retain original EventRecords, immutable runtime snapshots and identity evidence under existing custody/retention; record the exact owner-controlled successor binding/schema and migration/rebuild plan; migrate/rebuild only through StorageMigrationCoordinator; verify source cardinality, joins, complete target index and all four consumer gates; then allow the explicitly adopted successor. A checkpoint-only rebuild does not withdraw the registered event or change membership. Without an adopted compatible successor, historical validating read-only access may remain, while new activation and mutation remain blocked where they depend on the withdrawn contract. Do not rewrite historical event identities, shorten retention, automatically dispatch or silently reuse an incompatible checkpoint.

ContractRef: ContractName:Plans/Decision_Log.md#DL-045, ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/usage-feature.md, SchemaID:pm.storage_value.event_record_index.v2, SchemaID:pm.storage_value.run_started_index_checkpoint.v1

### SP-265 - Run-start filtered index checkpoint and four-reader boundary

**Versioned successor qualification.** The surrounding predecessor v1 binding, four v1 reader IDs and v1 stored digest meanings are preserved compatibility-only. Current v2 use requires the explicit SP-265/SP-281 successor contract, `pm.storage_value.run_started_index_checkpoint.v2@2.0.0`, `storage.run_started_index.v2@2.0.0` and the four named .v2 reader successors at2.0.0, with verified full rebuild, existing withdrawal/history and exact SP-278 frontier selection. Original v1 values never self-upgrade. See `Plans/event_index_consumer_adoption.schema.json#/$defs/run_started_checkpoint_v2`.

```yaml
plan_unit_id: SP-265
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage selects storage.run_started_index.v2@2.0.0 over the independently published complete
  SP-278 EventRecord index. The unchanged run_started_index_checkpoint.v1:{storage_instance_id}:{scope_partition}
  key now stores pm.storage_value.run_started_index_checkpoint.v2@2.0.0 in the actual redb checkpoints
  table. Current v2 requires owner-admitted complete rebuild, exact current source/index frontier token,
  immutable runtime-snapshot and scope joins, and the four explicitly adopted v2@2.0.0 readers run_graph.run_start_context.v2,
  orchestrator.history_run_start.v2, usage.run_start_attribution.v2 and executor.run_start_recovery_evidence.v2.
  Original v1 schemas, stored digest meanings and reader bindings remain compatibility-only. A stable
  current publication and at most two complete retired cores implement the unchanged RP-PROJECTION-3GEN
  policy at the same logical key; first withdrawal supplies the retirement anchor and ordinary traversal
  preserves generation birth/history. Newly bound v1 custody identity is explicitly not historical birth.
  Full read fences, current holds, lawful cleanup/slot reservation and exact predecessor CAS are required.
  This filtered writer owns no generic index, canonical source, execution, focus or accounting effect.
  Missing or unsupported evidence fences affected currentness and rebuilds only derived state.
gui_related: false
gui_classification_reason: Defines storage or execution contracts, not a new visual surface.
depends_on:
- DL-045
- SP-278
unblocks: []
acceptance_criteria:
- The independent generic index writer publishes complete CURRENT/index coverage before the filtered reader
  can become current; this binding writes no index row or global checkpoint.
- Actual source frame, payload.run_id, immutable snapshot, identity hashes, scope and full retained-range
  coverage are verified before filtered checkpoint commit and read publication.
- Closed checkpoint validates exact IDs/versions, scope, survivor cursor and currentness predicates; a
  missing or incompatible checkpoint rebuilds without canonical reconstruction.
- Existing event/index policies remain unchanged and the new checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0
  including rebuild_projection overflow and rebuild expiry.
- Native crash, replay, custody, deletion, compatibility and withdrawal pairs remain separate execution
  obligations; no runtime/depth/readiness pass is inferred.
- Current v2 admission binds the actual SP-278 generation, immutable anchor and mutable frontier; a birth
  locator or v1 version-string substitution cannot certify currentness.
- One same-key transaction finalizes first withdrawal and publishes exact predecessor custody plus a fully
  rebuilt successor; repeated withdrawal, refresh, hold races and cleanup preserve all original anchors
  and unaffected cores.
validation_surfaces:
- Plans/run_started_consumer_contracts.schema.json
- Plans/run_started_consumer_contract_fixtures.json
- Native execution of the named replay, crash, source-lookup and custody pairs remains required.
- Plans/event_index_consumer_adoption.schema.json
- Plans/event_index_consumer_adoption_fixtures.json
risk_class: event_source_and_checkpoint_authority_drift
reasoning_tier: high
context_scope: run_started_single_family_depth
implementation_surfaces:
- Plans/storage-plan.md
- Plans/storage_value_registry.json
- Plans/run_started_consumer_contracts.schema.json
- Plans/run_started_consumer_contract_fixtures.json
node_compile_hint:
  mode: run_started_owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20260911/step-08-run-started-depth.json
- Plans/storage-plan.md#run-start-and-restore-created-versioned-index-adoption
source_atom_ids: []
negative_constraints:
- No event membership, retention-policy definition, frozen accounting, runtime-proof or governance change.
- No canonical source reconstruction from a checkpoint or UI projection.
owner_hints:
- Plans/storage-plan.md
- Plans/Executor_Protocol.md
```
