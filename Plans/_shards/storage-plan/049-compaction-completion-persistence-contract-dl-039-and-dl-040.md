# Shard 049: Compaction completion persistence contract (DL-039 and DL-040)

Source: `Plans/storage-plan.md`

Source lines: L19133-L19190

Source SHA256: `5f1e07ec677040a72e2c5644ba8b017f433f4ca92339ccabca4fb182fa7b126d`

---

## Compaction completion persistence contract (DL-039 and DL-040)

**Exact storage binding.** Storage admits exactly `event-family-context-compaction-completed@1.0.0`, event type `context.compaction.completed`, payload `pm.context_compaction_completed.schema.v1@1.0.0`, with `project_only` scope and Assistant Chat ACD-461 semantic/payload ownership. The closed central registry entry points to the actual payload schema. This is the fortieth family, not a new PNC-019 baseline approval or denominator seal. All thirty-nine pre-existing family entries retain their exact content. `RP-AUTHORITY-INDEFINITE@1.0.0` is the exact retention assignment for this one bounded content-free event; it is not inherited by transcript, summary or detailed CompactionReceipt content.

**One logical commit boundary.** The existing compaction transaction first prepares and durably verifies its immutable summary artifact and detailed CompactionReceipt through their Storage-owned custody. Prepared objects are not independently published or discoverable as an active compaction. Use same-directory promotion and file/directory synchronization where files are involved. Under the live operation lease/generation and a per-thread commit fence that serializes all effective-context head changes and thread deletion, recheck input revision, branch/head, ContextEpoch, ownership, topology and every PP-078 predicate. Append this EventRecord as `durability_class=barrier` through Case L-2. The record is the new compaction-specific logical commit marker; the referenced receipt fixes the prepared bundle and old/new effective-context heads. Only the verified authoritative marker makes that bundle visible as committed. Artifact, detailed receipt, head and marker therefore have one reader-visible commit decision; no cross-file/redb ACID transaction is asserted. Provider-context head lookup resolves the latest validated committed revision chain for the thread. Any cache is derived; a UI projection, local command result, wall clock, file existence or seglog segment CURRENT pointer cannot decide that head.

Precommit failure leaves the prior head authoritative. After durable commit, lost acknowledgement or interrupted projection does not roll back the commit: reconcile through seglog and return the original completion, or fence the operation if authoritative state cannot be proved. Valid unacknowledged tail frames may be adopted by Case L-2 recovery before that decision. Never rerun a helper or append a replacement event simply because the caller lacks its AppendReceipt. Pin bundles transitively required by the current committed effective-context head and its recovery until a verified successor releases them; ordinary expiry cannot evict those live refs. A missing/corrupt still-required bundle is a disclosed recovery failure: no invented summary, no silent previous-head fallback, and no mutation-capable continuation until owner recovery. A superseded historical receipt may become legitimately unavailable after owner-authorized expiry; its content-free audit replay returns typed unavailable and does not block a newer fully validated head. After authorized thread deletion, content-free audit replay may verify the marker without its purged bundle, but must suppress content/head reconstruction.

**Dedupe and ordering.** Use `replay_policy=dedupe_by_idempotency_key` and the existing app-root EventRecord dedupe indexes. Define `idempotency_key = "compaction:" + lowerhex(SHA256(RFC8785([project_id, thread_id, operation_id])))`; this excludes attempt/generation/time so retries of the same logical operation cannot create another completion. Define `event_id = "evt_compaction_" + lowerhex(SHA256(RFC8785([storage_instance_id, project_id, thread_id, operation_id])))`, with `storage_instance_id` resolved from Storage. The opaque `compaction_receipt_ref` is `"compaction_receipt:"` plus the same 64-hex identity digest used in `event_id`; it names the prepared immutable receipt through its existing custody, contains no locator or content-derived digest, and conveys no retrieval authority. The first prepared semantic bytes, occurred time, receipt ref, generation, actor and causal bindings are immutable for a committed operation. A retry looks up and returns those bytes; it does not regenerate them under a new lease generation. A different semantic digest under the same key is `idempotency_conflict`. The global dedupe checkpoint `event_dedupe_checkpoint.v1:{storage_instance_id}` is append-admission currentness only, not the focused-thread consumer checkpoint. Dedupe unavailable means no append. The recorded revision edge must be current when committed; subsequent replay of an older edge cannot rewind a newer head. Storage sequence order and verified survivor ranges, never timestamps, determine replay order.

**Concrete projection and checkpoint.** ACD-461's `assistant_chat.focused_thread_projector.v1@1.0.0` uses the existing `thread_detail_projection.v1:{project_id}:{thread_id}:{detail_generation}`, value schema `pm.shared_runtime.thread_detail_projection.v1@1.0.0`. SIR-038 defines consumer `assistant_chat.focused_thread_detail.compaction.v1@1.0.0` and replay delivery binding `shared_runtime.thread_detail_compaction_replay.v1@1.0.0` on `ProjectionReplayCoordinator`. Set `domain=thread_detail`, `environment_id` to the verified thread execution environment, and `checkpoint_id = "compaction-" + lowerhex(SHA256(RFC8785([project_id, thread_id])))`. The exact checkpoint key is `replay_snapshot_checkpoint.v1:{environment_id}:thread_detail:{checkpoint_id}`, schema `pm.shared_runtime.replay_snapshot_checkpoint.v1@1.0.0`. This explicit, newly authorized instantiation of the existing checkpoint family is limited to compaction completion; no other event binding follows by analogy.

This binding is one reducer inside the existing full-detail transaction/publication barrier. The focused-thread coordinator serializes or compare-and-swaps all writers of the shared detail row by detail/domain generation and prior applied cursor; a compaction reducer cannot overwrite concurrently changed transcript/tool/artifact refs. Its owned effect and compaction checkpoint advance commit in one redb transaction. The compaction checkpoint proves this binding’s coverage only: shared detail applied/published cursors and whole-row current state cannot advance beyond verified application/coverage of every effect owned by the full-detail coordinator. Store the stable event reference only once. Publish only when the coordinator proves verified contiguous coverage, matching connection epoch/domain generation, drained live buffer, matching thread/project/detail generation and current deletion state. Nonmatching thread events are filtered only after verified identity/sequence examination; unknown, malformed, missing or corrupt records never count as examined coverage. `currentness_ref` must resolve to the Storage survivor-checkpoint evidence containing manifest generation, recovery epoch, segment cursor, last sequence/event ID, survivor-prefix digest and projector schema version required by Case L-2; the generic replay value alone cannot prove those bytes. A valid resnapshot may replace the projection and checkpoint atomically only with the same source identity/coverage/deletion proofs. Epoch conflict, overflow, retention gap or invalid snapshot gives the existing typed resnapshot/degraded result. Missing/corrupt checkpoint rebuilds from authoritative retained events, never from a guessed timestamp. Checkpoint/schema incompatibility invalidates the derived pair and fences publication until validated rebuild; it does not rewrite the permanent EventRecord.

**Retention and custody.** Retain the completion EventRecord and its identity/dedupe evidence for the app-root lifetime under the exact indefinite policy. There is no age, thread-delete or cardinality eviction of these audit bytes; storage pressure fails closed and is disclosed. Payload shape is bounded; no transcript or summary is embedded or fetched into it, and payload_ref is required null for this inline-only family. Before append, apply existing secret/content redaction and ownership checks to every envelope field, payload ID/ref and log/diagnostic copy. Reject content-bearing or credential-bearing metadata instead of accepting it under a content-free label. CompactionReceipt references are opaque identifiers, never capabilities or a reason to retain dereferenceable content. Detailed receipt/artifact/transcript custody stays with its owner and is purged, retained under hold, or made unavailable under the existing thread rules. Deletion removes normal detail/search visibility before purge; permanent event replay observes the tombstone and never reconstructs a deleted thread or content. Audit access remains permission-checked. Derived detail/checkpoint retention remains `RP-PROJECTION-3GEN`; eviction there only requires rebuild and does not expire the audit event.

**Compatibility and acceptance.** New writes use only this v1 payload and EventRecord v2. No legacy alias, extension or local-receipt backfill is admitted. A successor or withdrawal follows ACD-461's explicit stop-writes/preserve-audit/fence-and-migrate sequence; StorageMigrationCoordinator remains the only storage migration actor. Positive oracles require one committed marker, original-result reuse after lost acknowledgement, atomic projection/checkpoint advance, crash recovery to the committed bundle, replay-on-focus, and unchanged transcript search. Negative oracles cover all noncommit outcomes, stale fence/revision/topology, cross-Project identity, duplicate/different digest, invalid payload/secret content, append or dedupe outage, missing bundle, out-of-order or gapped replay, stale snapshot/epoch, withdrawal/schema mismatch and deleted-thread resurrection. Each must assert no forbidden append, no premature head publication and no unsafe checkpoint advance. `Plans/context_compaction_completion_contract_fixtures.json` supplies static payload and semantic cases; native crash, adapter, projection, deletion and search execution remains unproved. Contract completeness is not runtime acceptance or governance clearance.

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-461, ContractName:Plans/Shared_Integration_Runtime.md#SIR-038, ContractName:Plans/Contracts_V0.md#EventRecord, SchemaID:pm.context_compaction_completed.schema.v1, SchemaID:pm.shared_runtime.thread_detail_projection.v1, SchemaID:pm.shared_runtime.replay_snapshot_checkpoint.v1
### SP-259 - Compaction Completion Persistence

```yaml
plan_unit_id: SP-259
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Storage admits the one compaction-completion family using the exact bindings, logical seglog commit point, scoped idempotency, redb projection/checkpoint transaction, custody and indefinite content-free retention specified above.
gui_related: false
gui_classification_reason: This unit defines persisted-event contracts and owner boundaries.
depends_on: []
unblocks: []
acceptance_criteria:
  - "The sole new family uses project_only scope and the authoritative closed v1 payload; the previous 39 registry entries are unchanged."
  - "Only a verified barrier commit makes the prepared bundle active; recovery distinguishes precommit failure from committed or uncertain state."
  - "The exact consumer/projector IDs, key derivations, schema versions, currentness proof and checkpoint advance/rebuild predicates are explicit."
  - "Permanent audit retention cannot retain or recreate deleted content; static fixtures and native acceptance obligations are distinguished."
validation_surfaces:
  - Plans/context_compaction_completion_contract_fixtures.json
  - reports/event-authority-20260911/step-06-contract-validation.md
risk_class: compaction_completion_authority
reasoning_tier: high
context_scope: compaction_completion_event_authority
implementation_surfaces:
  - Plans/storage-plan.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/Decision_Log.md#DL-039
  - Plans/Decision_Log.md#DL-040
negative_constraints:
  - No runtime, buildability, independent-validator clearance, governance seal, WorkNodes, or NodeSeeds follows from this contract.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/Contracts_V0.md
```
