# Shard 090: W3A Forge event source and history bindings (phase 1, without admission)

Source: `Plans/storage-plan.md`

Source lines: L29605-L36027

Source SHA256: `1b9dbbda826d340876a3b6f50168c57a26b4759ff11c0fc91afb0a54d24b1e2b`

---

## W3A Forge event source and history bindings (phase 1, without admission)

### SP-1200 - forge.api.compatibility_changed prepared contract

```yaml
plan_unit_id: SP-1200
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.api.compatibility_changed@1.0.0, prepared without event
  admission. Adopt FGI-1200/CV-1200, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload
  packs, SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_api_compatibility_changed_source uses key forge_api_compatibility_changed_source.v1:{actual
  storage_instance_id}:{actual scope_partition}:{hex_fact_identity}, table forge_api_compatibility_changed_source.
  Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_api_compatibility_changed_source, schema_id=pm.storage_value.forge_api_compatibility_changed_source.v1,
  version 1.0.0. hex_fact_identity is CV-1200 H. Original Forge owner capture performs uniqueness-CAS for this exact
  F while committing the actual immutable source observation/result; it verifies the FGI-1200 predicate and all
  provider/subject/native-operation/revision/source joins. It stores refs and the producer commitment only, not
  a payload or source-content copy. A record or matching hash alone cannot create native acceptance.


  Writer ForgeCompatibilityProbe.commit_result@1.0.0 commits source_committed before forge.api.compatibility_changed.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_api_compatibility_changed_source: exact Case L-3 source-lineage/receipt identity class
  RP-AUTHORITY-INDEFINITE@1.0.0, no age/count eviction; storage pressure fails closed. This NEW technical class
  binding holds only non-content identity/commitment and original receipt refs and does not assign the separate
  event history or retain referenced bodies. Source records/bodies keep their owner policy and are required while
  pending or actually referenced through the existing live-reference machinery; settlement releases only the actual
  pending dependency, never other holds. Mandatory coherent backup includes the source identity row, actual needed
  owner records, original issued custody, dedupe and seglog/payload-pack cut; loss fences the writer and requires
  mandatory-backup recovery with disclosure. Never recover canonical source from a checkpoint or extend event history
  by retaining a hidden payload copy.


  Derived checkpoint forge_api_compatibility_changed_checkpoint uses table checkpoints, exact key forge_api_compatibility_changed_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_api_compatibility_changed_checkpoint
  (pm.storage_value.forge_api_compatibility_changed_checkpoint.v1@1.0.0). Sole writer projector.forge.api.compatibility_changed.history@1.0.0
  and operating consumer consumer.forge.api.compatibility_changed.history@1.0.0 serve Forge Settings connection
  health reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized.
  Store only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.api.compatibility_changed; filter only exact
  family/version and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage.
  Verified empty source permits null cursor/count zero only with actual inventory proof. Every delivered matching
  record verifies actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and
  all FGI-1200 fact joins under its original edition. Missing optional linked content returns unavailable without
  inventing it; missing canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes
  the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.api.compatibility_changed count-equality oracle uses a completely covered prefix with one exact
  matching retained event followed by one unrelated event in the same source. Successful inclusive resume
  revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_api_compatibility_changed_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278:
  one current plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.api.compatibility_changed: correct ID recipes, actual seed-issuance
  provenance, unique node membership by generation_id, and selected-current existence/cardinality are
  independent predicates. Inside this exact root the domain, storage instance, scope, event type, consumer
  and version are fixed; the seed is the only varying preimage component. Reusing a seed with a correct
  recipe necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node
  seeds. Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement
  of the ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1200
unblocks: []
acceptance_criteria:
- forge.api.compatibility_changed is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_api_compatibility_changed.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_api_compatibility_changed_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_api_compatibility_changed.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-007
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.api.compatibility_changed
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1201 - forge.connection.capabilities_changed prepared contract

```yaml
plan_unit_id: SP-1201
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.connection.capabilities_changed@1.0.0, prepared without
  event admission. Adopt FGI-1201/CV-1201, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337
  payload packs, SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_connection_capabilities_changed_source uses key forge_connection_capabilities_changed_source.v1:{actual
  storage_instance_id}:{actual scope_partition}:{hex_fact_identity}, table forge_connection_capabilities_changed_source.
  Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_connection_capabilities_changed_source,
  schema_id=pm.storage_value.forge_connection_capabilities_changed_source.v1, version 1.0.0. hex_fact_identity is
  CV-1201 H. Original Forge owner capture performs uniqueness-CAS for this exact F while committing the actual immutable
  source observation/result; it verifies the FGI-1201 predicate and all provider/subject/native-operation/revision/source
  joins. It stores refs and the producer commitment only, not a payload or source-content copy. A record or matching
  hash alone cannot create native acceptance.


  Writer ForgeCapabilityResolver.commit_assessment@1.0.0 commits source_committed before forge.connection.capabilities_changed.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_connection_capabilities_changed_source: exact Case L-3 source-lineage/receipt identity
  class RP-AUTHORITY-INDEFINITE@1.0.0, no age/count eviction; storage pressure fails closed. This NEW technical
  class binding holds only non-content identity/commitment and original receipt refs and does not assign the separate
  event history or retain referenced bodies. Source records/bodies keep their owner policy and are required while
  pending or actually referenced through the existing live-reference machinery; settlement releases only the actual
  pending dependency, never other holds. Mandatory coherent backup includes the source identity row, actual needed
  owner records, original issued custody, dedupe and seglog/payload-pack cut; loss fences the writer and requires
  mandatory-backup recovery with disclosure. Never recover canonical source from a checkpoint or extend event history
  by retaining a hidden payload copy.


  Derived checkpoint forge_connection_capabilities_changed_checkpoint uses table checkpoints, exact key forge_connection_capabilities_changed_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_connection_capabilities_changed_checkpoint
  (pm.storage_value.forge_connection_capabilities_changed_checkpoint.v1@1.0.0). Sole writer projector.forge.connection.capabilities_changed.history@1.0.0
  and operating consumer consumer.forge.connection.capabilities_changed.history@1.0.0 serve Forge capability routing
  history reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized.
  Store only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.connection.capabilities_changed; filter only
  exact family/version and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage.
  Verified empty source permits null cursor/count zero only with actual inventory proof. Every delivered matching
  record verifies actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and
  all FGI-1201 fact joins under its original edition. Missing optional linked content returns unavailable without
  inventing it; missing canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes
  the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.connection.capabilities_changed count-equality oracle uses a completely covered prefix with one
  exact matching retained event followed by one unrelated event in the same source. Successful inclusive
  resume revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_connection_capabilities_changed_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278:
  one current plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.connection.capabilities_changed: correct ID recipes, actual seed-issuance
  provenance, unique node membership by generation_id, and selected-current existence/cardinality are
  independent predicates. Inside this exact root the domain, storage instance, scope, event type, consumer
  and version are fixed; the seed is the only varying preimage component. Reusing a seed with a correct
  recipe necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node
  seeds. Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement
  of the ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1201
unblocks: []
acceptance_criteria:
- forge.connection.capabilities_changed is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_connection_capabilities_changed.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_connection_capabilities_changed_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_connection_capabilities_changed.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-003
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.connection.capabilities_changed
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1202 - forge.connection.reauthorized prepared contract

```yaml
plan_unit_id: SP-1202
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.connection.reauthorized@1.0.0, prepared without event
  admission. Adopt FGI-1202/CV-1202, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload
  packs, SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_connection_reauthorized_source uses key forge_connection_reauthorized_source.v1:{actual
  storage_instance_id}:{actual scope_partition}:{hex_fact_identity}, table forge_connection_reauthorized_source.
  Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_connection_reauthorized_source, schema_id=pm.storage_value.forge_connection_reauthorized_source.v1,
  version 1.0.0. hex_fact_identity is CV-1202 H. Original Forge owner capture performs uniqueness-CAS for this exact
  F while committing the actual immutable source observation/result; it verifies the FGI-1202 predicate and all
  provider/subject/native-operation/revision/source joins. It stores refs and the producer commitment only, not
  a payload or source-content copy. A record or matching hash alone cannot create native acceptance.


  Writer ForgeConnectionLifecycle.commit_reauthorization@1.0.0 commits source_committed before forge.connection.reauthorized.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_connection_reauthorized_source: exact Case L-3 source-lineage/receipt identity class
  RP-AUTHORITY-INDEFINITE@1.0.0, no age/count eviction; storage pressure fails closed. This NEW technical class
  binding holds only non-content identity/commitment and original receipt refs and does not assign the separate
  event history or retain referenced bodies. Source records/bodies keep their owner policy and are required while
  pending or actually referenced through the existing live-reference machinery; settlement releases only the actual
  pending dependency, never other holds. Mandatory coherent backup includes the source identity row, actual needed
  owner records, original issued custody, dedupe and seglog/payload-pack cut; loss fences the writer and requires
  mandatory-backup recovery with disclosure. Never recover canonical source from a checkpoint or extend event history
  by retaining a hidden payload copy.


  Derived checkpoint forge_connection_reauthorized_checkpoint uses table checkpoints, exact key forge_connection_reauthorized_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_connection_reauthorized_checkpoint
  (pm.storage_value.forge_connection_reauthorized_checkpoint.v1@1.0.0). Sole writer projector.forge.connection.reauthorized.history@1.0.0
  and operating consumer consumer.forge.connection.reauthorized.history@1.0.0 serve Hosting Services grant-history
  reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store
  only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.connection.reauthorized; filter only exact
  family/version and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage.
  Verified empty source permits null cursor/count zero only with actual inventory proof. Every delivered matching
  record verifies actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and
  all FGI-1202 fact joins under its original edition. Missing optional linked content returns unavailable without
  inventing it; missing canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes
  the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.connection.reauthorized count-equality oracle uses a completely covered prefix with one exact
  matching retained event followed by one unrelated event in the same source. Successful inclusive resume
  revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_connection_reauthorized_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one
  current plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.connection.reauthorized: correct ID recipes, actual seed-issuance
  provenance, unique node membership by generation_id, and selected-current existence/cardinality are
  independent predicates. Inside this exact root the domain, storage instance, scope, event type, consumer
  and version are fixed; the seed is the only varying preimage component. Reusing a seed with a correct
  recipe necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node
  seeds. Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement
  of the ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1202
unblocks: []
acceptance_criteria:
- forge.connection.reauthorized is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_connection_reauthorized.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_connection_reauthorized_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_connection_reauthorized.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-006
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.connection.reauthorized
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1203 - forge.connection.validated prepared contract

```yaml
plan_unit_id: SP-1203
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.connection.validated@1.0.0, prepared without event admission.
  Adopt FGI-1203/CV-1203, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_connection_validated_source uses key forge_connection_validated_source.v1:{actual
  storage_instance_id}:{actual scope_partition}:{hex_fact_identity}, table forge_connection_validated_source. Schema
  is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_connection_validated_source, schema_id=pm.storage_value.forge_connection_validated_source.v1,
  version 1.0.0. hex_fact_identity is CV-1203 H. Original Forge owner capture performs uniqueness-CAS for this exact
  F while committing the actual immutable source observation/result; it verifies the FGI-1203 predicate and all
  provider/subject/native-operation/revision/source joins. It stores refs and the producer commitment only, not
  a payload or source-content copy. A record or matching hash alone cannot create native acceptance.


  Writer ForgeConnectionLifecycle.commit_connection_test@1.0.0 commits source_committed before forge.connection.validated.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_connection_validated_source: exact Case L-3 source-lineage/receipt identity class RP-AUTHORITY-INDEFINITE@1.0.0,
  no age/count eviction; storage pressure fails closed. This NEW technical class binding holds only non-content
  identity/commitment and original receipt refs and does not assign the separate event history or retain referenced
  bodies. Source records/bodies keep their owner policy and are required while pending or actually referenced through
  the existing live-reference machinery; settlement releases only the actual pending dependency, never other holds.
  Mandatory coherent backup includes the source identity row, actual needed owner records, original issued custody,
  dedupe and seglog/payload-pack cut; loss fences the writer and requires mandatory-backup recovery with disclosure.
  Never recover canonical source from a checkpoint or extend event history by retaining a hidden payload copy.


  Derived checkpoint forge_connection_validated_checkpoint uses table checkpoints, exact key forge_connection_validated_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_connection_validated_checkpoint
  (pm.storage_value.forge_connection_validated_checkpoint.v1@1.0.0). Sole writer projector.forge.connection.validated.history@1.0.0
  and operating consumer consumer.forge.connection.validated.history@1.0.0 serve Hosting Services connection-test
  history reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized.
  Store only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.connection.validated; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1203 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.connection.validated count-equality oracle uses a completely covered prefix with one exact
  matching retained event followed by one unrelated event in the same source. Successful inclusive resume
  revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_connection_validated_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one
  current plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.connection.validated: correct ID recipes, actual seed-issuance provenance,
  unique node membership by generation_id, and selected-current existence/cardinality are independent
  predicates. Inside this exact root the domain, storage instance, scope, event type, consumer and version
  are fixed; the seed is the only varying preimage component. Reusing a seed with a correct recipe
  necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node seeds.
  Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement of the
  ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1203
unblocks: []
acceptance_criteria:
- forge.connection.validated is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_connection_validated.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_connection_validated_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_connection_validated.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-003
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.connection.validated
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1204 - forge.mirror.connected prepared contract

```yaml
plan_unit_id: SP-1204
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.mirror.connected@1.0.0, prepared without event admission.
  Adopt FGI-1204/CV-1204, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_mirror_connected_source uses key forge_mirror_connected_source.v1:{actual storage_instance_id}:{actual
  scope_partition}:{hex_fact_identity}, table forge_mirror_connected_source. Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_mirror_connected_source,
  schema_id=pm.storage_value.forge_mirror_connected_source.v1, version 1.0.0. hex_fact_identity is CV-1204 H. Original
  Forge owner capture performs uniqueness-CAS for this exact F while committing the actual immutable source observation/result;
  it verifies the FGI-1204 predicate and all provider/subject/native-operation/revision/source joins. It stores
  refs and the producer commitment only, not a payload or source-content copy. A record or matching hash alone cannot
  create native acceptance.


  Writer ForgeMirrorCoordinator.commit_connect@1.0.0 commits source_committed before forge.mirror.connected.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_mirror_connected_source: exact Case L-3 source-lineage/receipt identity class RP-AUTHORITY-INDEFINITE@1.0.0,
  no age/count eviction; storage pressure fails closed. This NEW technical class binding holds only non-content
  identity/commitment and original receipt refs and does not assign the separate event history or retain referenced
  bodies. Source records/bodies keep their owner policy and are required while pending or actually referenced through
  the existing live-reference machinery; settlement releases only the actual pending dependency, never other holds.
  Mandatory coherent backup includes the source identity row, actual needed owner records, original issued custody,
  dedupe and seglog/payload-pack cut; loss fences the writer and requires mandatory-backup recovery with disclosure.
  Never recover canonical source from a checkpoint or extend event history by retaining a hidden payload copy.


  Derived checkpoint forge_mirror_connected_checkpoint uses table checkpoints, exact key forge_mirror_connected_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_mirror_connected_checkpoint
  (pm.storage_value.forge_mirror_connected_checkpoint.v1@1.0.0). Sole writer projector.forge.mirror.connected.history@1.0.0
  and operating consumer consumer.forge.mirror.connected.history@1.0.0 serve Source Control Mirror Health history
  reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store
  only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.mirror.connected; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1204 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.mirror.connected count-equality oracle uses a completely covered prefix with one exact matching
  retained event followed by one unrelated event in the same source. Successful inclusive resume revalidates
  the already-counted matching cursor, skips it, examines the unrelated final event and publishes
  matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2 with the
  same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS; repair
  candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_mirror_connected_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one current
  plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.mirror.connected: correct ID recipes, actual seed-issuance provenance,
  unique node membership by generation_id, and selected-current existence/cardinality are independent
  predicates. Inside this exact root the domain, storage instance, scope, event type, consumer and version
  are fixed; the seed is the only varying preimage component. Reusing a seed with a correct recipe
  necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node seeds.
  Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement of the
  ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1204
unblocks: []
acceptance_criteria:
- forge.mirror.connected is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_mirror_connected.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_mirror_connected_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_mirror_connected.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-002
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.mirror.connected
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1205 - forge.mirror.degraded prepared contract

```yaml
plan_unit_id: SP-1205
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.mirror.degraded@1.0.0, prepared without event admission.
  Adopt FGI-1205/CV-1205, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_mirror_degraded_source uses key forge_mirror_degraded_source.v1:{actual storage_instance_id}:{actual
  scope_partition}:{hex_fact_identity}, table forge_mirror_degraded_source. Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_mirror_degraded_source,
  schema_id=pm.storage_value.forge_mirror_degraded_source.v1, version 1.0.0. hex_fact_identity is CV-1205 H. Original
  Forge owner capture performs uniqueness-CAS for this exact F while committing the actual immutable source observation/result;
  it verifies the FGI-1205 predicate and all provider/subject/native-operation/revision/source joins. It stores
  refs and the producer commitment only, not a payload or source-content copy. A record or matching hash alone cannot
  create native acceptance.


  Writer ForgeMirrorCoordinator.commit_degradation@1.0.0 commits source_committed before forge.mirror.degraded.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_mirror_degraded_source: exact Case L-3 source-lineage/receipt identity class RP-AUTHORITY-INDEFINITE@1.0.0,
  no age/count eviction; storage pressure fails closed. This NEW technical class binding holds only non-content
  identity/commitment and original receipt refs and does not assign the separate event history or retain referenced
  bodies. Source records/bodies keep their owner policy and are required while pending or actually referenced through
  the existing live-reference machinery; settlement releases only the actual pending dependency, never other holds.
  Mandatory coherent backup includes the source identity row, actual needed owner records, original issued custody,
  dedupe and seglog/payload-pack cut; loss fences the writer and requires mandatory-backup recovery with disclosure.
  Never recover canonical source from a checkpoint or extend event history by retaining a hidden payload copy.


  Derived checkpoint forge_mirror_degraded_checkpoint uses table checkpoints, exact key forge_mirror_degraded_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_mirror_degraded_checkpoint
  (pm.storage_value.forge_mirror_degraded_checkpoint.v1@1.0.0). Sole writer projector.forge.mirror.degraded.history@1.0.0
  and operating consumer consumer.forge.mirror.degraded.history@1.0.0 serve Source Control Mirror Health degradation
  reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store
  only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.mirror.degraded; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1205 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.mirror.degraded count-equality oracle uses a completely covered prefix with one exact matching
  retained event followed by one unrelated event in the same source. Successful inclusive resume revalidates
  the already-counted matching cursor, skips it, examines the unrelated final event and publishes
  matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2 with the
  same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS; repair
  candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_mirror_degraded_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one current
  plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.mirror.degraded: correct ID recipes, actual seed-issuance provenance,
  unique node membership by generation_id, and selected-current existence/cardinality are independent
  predicates. Inside this exact root the domain, storage instance, scope, event type, consumer and version
  are fixed; the seed is the only varying preimage component. Reusing a seed with a correct recipe
  necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node seeds.
  Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement of the
  ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1205
unblocks: []
acceptance_criteria:
- forge.mirror.degraded is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_mirror_degraded.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_mirror_degraded_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_mirror_degraded.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-002
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.mirror.degraded
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1206 - forge.mirror.detached prepared contract

```yaml
plan_unit_id: SP-1206
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.mirror.detached@1.0.0, prepared without event admission.
  Adopt FGI-1206/CV-1206, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_mirror_detached_source uses key forge_mirror_detached_source.v1:{actual storage_instance_id}:{actual
  scope_partition}:{hex_fact_identity}, table forge_mirror_detached_source. Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_mirror_detached_source,
  schema_id=pm.storage_value.forge_mirror_detached_source.v1, version 1.0.0. hex_fact_identity is CV-1206 H. Original
  Forge owner capture performs uniqueness-CAS for this exact F while committing the actual immutable source observation/result;
  it verifies the FGI-1206 predicate and all provider/subject/native-operation/revision/source joins. It stores
  refs and the producer commitment only, not a payload or source-content copy. A record or matching hash alone cannot
  create native acceptance.


  Writer ForgeMirrorCoordinator.commit_detach@1.0.0 commits source_committed before forge.mirror.detached.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_mirror_detached_source: exact Case L-3 source-lineage/receipt identity class RP-AUTHORITY-INDEFINITE@1.0.0,
  no age/count eviction; storage pressure fails closed. This NEW technical class binding holds only non-content
  identity/commitment and original receipt refs and does not assign the separate event history or retain referenced
  bodies. Source records/bodies keep their owner policy and are required while pending or actually referenced through
  the existing live-reference machinery; settlement releases only the actual pending dependency, never other holds.
  Mandatory coherent backup includes the source identity row, actual needed owner records, original issued custody,
  dedupe and seglog/payload-pack cut; loss fences the writer and requires mandatory-backup recovery with disclosure.
  Never recover canonical source from a checkpoint or extend event history by retaining a hidden payload copy.


  Derived checkpoint forge_mirror_detached_checkpoint uses table checkpoints, exact key forge_mirror_detached_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_mirror_detached_checkpoint
  (pm.storage_value.forge_mirror_detached_checkpoint.v1@1.0.0). Sole writer projector.forge.mirror.detached.history@1.0.0
  and operating consumer consumer.forge.mirror.detached.history@1.0.0 serve Source Control Mirror Health detach-history
  reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store
  only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.mirror.detached; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1206 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.mirror.detached count-equality oracle uses a completely covered prefix with one exact matching
  retained event followed by one unrelated event in the same source. Successful inclusive resume revalidates
  the already-counted matching cursor, skips it, examines the unrelated final event and publishes
  matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2 with the
  same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS; repair
  candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_mirror_detached_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one current
  plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.mirror.detached: correct ID recipes, actual seed-issuance provenance,
  unique node membership by generation_id, and selected-current existence/cardinality are independent
  predicates. Inside this exact root the domain, storage instance, scope, event type, consumer and version
  are fixed; the seed is the only varying preimage component. Reusing a seed with a correct recipe
  necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node seeds.
  Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement of the
  ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1206
unblocks: []
acceptance_criteria:
- forge.mirror.detached is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_mirror_detached.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_mirror_detached_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_mirror_detached.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-002
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.mirror.detached
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1207 - forge.mirror.status_changed prepared contract

```yaml
plan_unit_id: SP-1207
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.mirror.status_changed@1.0.0, prepared without event admission.
  Adopt FGI-1207/CV-1207, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_mirror_status_changed_source uses key forge_mirror_status_changed_source.v1:{actual
  storage_instance_id}:{actual scope_partition}:{hex_fact_identity}, table forge_mirror_status_changed_source. Schema
  is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_mirror_status_changed_source, schema_id=pm.storage_value.forge_mirror_status_changed_source.v1,
  version 1.0.0. hex_fact_identity is CV-1207 H. Original Forge owner capture performs uniqueness-CAS for this exact
  F while committing the actual immutable source observation/result; it verifies the FGI-1207 predicate and all
  provider/subject/native-operation/revision/source joins. It stores refs and the producer commitment only, not
  a payload or source-content copy. A record or matching hash alone cannot create native acceptance.


  Writer ForgeMirrorCoordinator.commit_status@1.0.0 commits source_committed before forge.mirror.status_changed.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_mirror_status_changed_source: exact Case L-3 source-lineage/receipt identity class
  RP-AUTHORITY-INDEFINITE@1.0.0, no age/count eviction; storage pressure fails closed. This NEW technical class
  binding holds only non-content identity/commitment and original receipt refs and does not assign the separate
  event history or retain referenced bodies. Source records/bodies keep their owner policy and are required while
  pending or actually referenced through the existing live-reference machinery; settlement releases only the actual
  pending dependency, never other holds. Mandatory coherent backup includes the source identity row, actual needed
  owner records, original issued custody, dedupe and seglog/payload-pack cut; loss fences the writer and requires
  mandatory-backup recovery with disclosure. Never recover canonical source from a checkpoint or extend event history
  by retaining a hidden payload copy.


  Derived checkpoint forge_mirror_status_changed_checkpoint uses table checkpoints, exact key forge_mirror_status_changed_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_mirror_status_changed_checkpoint
  (pm.storage_value.forge_mirror_status_changed_checkpoint.v1@1.0.0). Sole writer projector.forge.mirror.status_changed.history@1.0.0
  and operating consumer consumer.forge.mirror.status_changed.history@1.0.0 serve Source Control Mirror Health status
  reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store
  only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.mirror.status_changed; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1207 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.mirror.status_changed count-equality oracle uses a completely covered prefix with one exact
  matching retained event followed by one unrelated event in the same source. Successful inclusive resume
  revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_mirror_status_changed_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one
  current plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.mirror.status_changed: correct ID recipes, actual seed-issuance
  provenance, unique node membership by generation_id, and selected-current existence/cardinality are
  independent predicates. Inside this exact root the domain, storage instance, scope, event type, consumer
  and version are fixed; the seed is the only varying preimage component. Reusing a seed with a correct
  recipe necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node
  seeds. Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement
  of the ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1207
unblocks: []
acceptance_criteria:
- forge.mirror.status_changed is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_mirror_status_changed.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_mirror_status_changed_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_mirror_status_changed.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-002
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.mirror.status_changed
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1208 - forge.mirror.sync_completed prepared contract

```yaml
plan_unit_id: SP-1208
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.mirror.sync_completed@1.0.0, prepared without event admission.
  Adopt FGI-1208/CV-1208, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_mirror_sync_completed_source uses key forge_mirror_sync_completed_source.v1:{actual
  storage_instance_id}:{actual scope_partition}:{hex_fact_identity}, table forge_mirror_sync_completed_source. Schema
  is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_mirror_sync_completed_source, schema_id=pm.storage_value.forge_mirror_sync_completed_source.v1,
  version 1.0.0. hex_fact_identity is CV-1208 H. Original Forge owner capture performs uniqueness-CAS for this exact
  F while committing the actual immutable source observation/result; it verifies the FGI-1208 predicate and all
  provider/subject/native-operation/revision/source joins. It stores refs and the producer commitment only, not
  a payload or source-content copy. A record or matching hash alone cannot create native acceptance.


  Writer ForgeMirrorCoordinator.commit_sync_result@1.0.0 commits source_committed before forge.mirror.sync_completed.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_mirror_sync_completed_source: exact Case L-3 source-lineage/receipt identity class
  RP-AUTHORITY-INDEFINITE@1.0.0, no age/count eviction; storage pressure fails closed. This NEW technical class
  binding holds only non-content identity/commitment and original receipt refs and does not assign the separate
  event history or retain referenced bodies. Source records/bodies keep their owner policy and are required while
  pending or actually referenced through the existing live-reference machinery; settlement releases only the actual
  pending dependency, never other holds. Mandatory coherent backup includes the source identity row, actual needed
  owner records, original issued custody, dedupe and seglog/payload-pack cut; loss fences the writer and requires
  mandatory-backup recovery with disclosure. Never recover canonical source from a checkpoint or extend event history
  by retaining a hidden payload copy.


  Derived checkpoint forge_mirror_sync_completed_checkpoint uses table checkpoints, exact key forge_mirror_sync_completed_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_mirror_sync_completed_checkpoint
  (pm.storage_value.forge_mirror_sync_completed_checkpoint.v1@1.0.0). Sole writer projector.forge.mirror.sync_completed.history@1.0.0
  and operating consumer consumer.forge.mirror.sync_completed.history@1.0.0 serve Source Control mirror sync-result
  reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store
  only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.mirror.sync_completed; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1208 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.mirror.sync_completed count-equality oracle uses a completely covered prefix with one exact
  matching retained event followed by one unrelated event in the same source. Successful inclusive resume
  revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_mirror_sync_completed_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one
  current plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.mirror.sync_completed: correct ID recipes, actual seed-issuance
  provenance, unique node membership by generation_id, and selected-current existence/cardinality are
  independent predicates. Inside this exact root the domain, storage instance, scope, event type, consumer
  and version are fixed; the seed is the only varying preimage component. Reusing a seed with a correct
  recipe necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node
  seeds. Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement
  of the ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1208
unblocks: []
acceptance_criteria:
- forge.mirror.sync_completed is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_mirror_sync_completed.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_mirror_sync_completed_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_mirror_sync_completed.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-002
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.mirror.sync_completed
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1209 - forge.mirror.sync_started prepared contract

```yaml
plan_unit_id: SP-1209
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.mirror.sync_started@1.0.0, prepared without event admission.
  Adopt FGI-1209/CV-1209, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_mirror_sync_started_source uses key forge_mirror_sync_started_source.v1:{actual storage_instance_id}:{actual
  scope_partition}:{hex_fact_identity}, table forge_mirror_sync_started_source. Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_mirror_sync_started_source,
  schema_id=pm.storage_value.forge_mirror_sync_started_source.v1, version 1.0.0. hex_fact_identity is CV-1209 H.
  Original Forge owner capture performs uniqueness-CAS for this exact F while committing the actual immutable source
  observation/result; it verifies the FGI-1209 predicate and all provider/subject/native-operation/revision/source
  joins. It stores refs and the producer commitment only, not a payload or source-content copy. A record or matching
  hash alone cannot create native acceptance.


  Writer ForgeMirrorCoordinator.commit_sync_start@1.0.0 commits source_committed before forge.mirror.sync_started.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_mirror_sync_started_source: exact Case L-3 source-lineage/receipt identity class RP-AUTHORITY-INDEFINITE@1.0.0,
  no age/count eviction; storage pressure fails closed. This NEW technical class binding holds only non-content
  identity/commitment and original receipt refs and does not assign the separate event history or retain referenced
  bodies. Source records/bodies keep their owner policy and are required while pending or actually referenced through
  the existing live-reference machinery; settlement releases only the actual pending dependency, never other holds.
  Mandatory coherent backup includes the source identity row, actual needed owner records, original issued custody,
  dedupe and seglog/payload-pack cut; loss fences the writer and requires mandatory-backup recovery with disclosure.
  Never recover canonical source from a checkpoint or extend event history by retaining a hidden payload copy.


  Derived checkpoint forge_mirror_sync_started_checkpoint uses table checkpoints, exact key forge_mirror_sync_started_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_mirror_sync_started_checkpoint
  (pm.storage_value.forge_mirror_sync_started_checkpoint.v1@1.0.0). Sole writer projector.forge.mirror.sync_started.history@1.0.0
  and operating consumer consumer.forge.mirror.sync_started.history@1.0.0 serve Source Control mirror sync-progress
  history reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized.
  Store only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.mirror.sync_started; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1209 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.mirror.sync_started count-equality oracle uses a completely covered prefix with one exact
  matching retained event followed by one unrelated event in the same source. Successful inclusive resume
  revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_mirror_sync_started_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one current
  plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.mirror.sync_started: correct ID recipes, actual seed-issuance provenance,
  unique node membership by generation_id, and selected-current existence/cardinality are independent
  predicates. Inside this exact root the domain, storage instance, scope, event type, consumer and version
  are fixed; the seed is the only varying preimage component. Reusing a seed with a correct recipe
  necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node seeds.
  Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement of the
  ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1209
unblocks: []
acceptance_criteria:
- forge.mirror.sync_started is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_mirror_sync_started.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_mirror_sync_started_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_mirror_sync_started.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-002
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.mirror.sync_started
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1210 - forge.pipeline.cancelled prepared contract

```yaml
plan_unit_id: SP-1210
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.pipeline.cancelled@1.0.0, prepared without event admission.
  Adopt FGI-1210/CV-1210, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_pipeline_cancelled_source uses key forge_pipeline_cancelled_source.v1:{actual storage_instance_id}:{actual
  scope_partition}:{hex_fact_identity}, table forge_pipeline_cancelled_source. Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_pipeline_cancelled_source,
  schema_id=pm.storage_value.forge_pipeline_cancelled_source.v1, version 1.0.0. hex_fact_identity is CV-1210 H.
  Original Forge owner capture performs uniqueness-CAS for this exact F while committing the actual immutable source
  observation/result; it verifies the FGI-1210 predicate and all provider/subject/native-operation/revision/source
  joins. It stores refs and the producer commitment only, not a payload or source-content copy. A record or matching
  hash alone cannot create native acceptance.


  Writer ForgePipelineObserver.commit_cancelled@1.0.0 commits source_committed before forge.pipeline.cancelled.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_pipeline_cancelled_source: exact Case L-3 source-lineage/receipt identity class RP-AUTHORITY-INDEFINITE@1.0.0,
  no age/count eviction; storage pressure fails closed. This NEW technical class binding holds only non-content
  identity/commitment and original receipt refs and does not assign the separate event history or retain referenced
  bodies. Source records/bodies keep their owner policy and are required while pending or actually referenced through
  the existing live-reference machinery; settlement releases only the actual pending dependency, never other holds.
  Mandatory coherent backup includes the source identity row, actual needed owner records, original issued custody,
  dedupe and seglog/payload-pack cut; loss fences the writer and requires mandatory-backup recovery with disclosure.
  Never recover canonical source from a checkpoint or extend event history by retaining a hidden payload copy.


  Derived checkpoint forge_pipeline_cancelled_checkpoint uses table checkpoints, exact key forge_pipeline_cancelled_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_pipeline_cancelled_checkpoint
  (pm.storage_value.forge_pipeline_cancelled_checkpoint.v1@1.0.0). Sole writer projector.forge.pipeline.cancelled.history@1.0.0
  and operating consumer consumer.forge.pipeline.cancelled.history@1.0.0 serve Actions & Pipelines cancellation-history
  reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store
  only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.pipeline.cancelled; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1210 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.pipeline.cancelled count-equality oracle uses a completely covered prefix with one exact
  matching retained event followed by one unrelated event in the same source. Successful inclusive resume
  revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_pipeline_cancelled_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one current
  plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.pipeline.cancelled: correct ID recipes, actual seed-issuance provenance,
  unique node membership by generation_id, and selected-current existence/cardinality are independent
  predicates. Inside this exact root the domain, storage instance, scope, event type, consumer and version
  are fixed; the seed is the only varying preimage component. Reusing a seed with a correct recipe
  necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node seeds.
  Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement of the
  ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1210
unblocks: []
acceptance_criteria:
- forge.pipeline.cancelled is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_pipeline_cancelled.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_pipeline_cancelled_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_pipeline_cancelled.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-005
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.pipeline.cancelled
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1211 - forge.pipeline.completed prepared contract

```yaml
plan_unit_id: SP-1211
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.pipeline.completed@1.0.0, prepared without event admission.
  Adopt FGI-1211/CV-1211, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_pipeline_completed_source uses key forge_pipeline_completed_source.v1:{actual storage_instance_id}:{actual
  scope_partition}:{hex_fact_identity}, table forge_pipeline_completed_source. Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_pipeline_completed_source,
  schema_id=pm.storage_value.forge_pipeline_completed_source.v1, version 1.0.0. hex_fact_identity is CV-1211 H.
  Original Forge owner capture performs uniqueness-CAS for this exact F while committing the actual immutable source
  observation/result; it verifies the FGI-1211 predicate and all provider/subject/native-operation/revision/source
  joins. It stores refs and the producer commitment only, not a payload or source-content copy. A record or matching
  hash alone cannot create native acceptance.


  Writer ForgePipelineObserver.commit_completed@1.0.0 commits source_committed before forge.pipeline.completed.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_pipeline_completed_source: exact Case L-3 source-lineage/receipt identity class RP-AUTHORITY-INDEFINITE@1.0.0,
  no age/count eviction; storage pressure fails closed. This NEW technical class binding holds only non-content
  identity/commitment and original receipt refs and does not assign the separate event history or retain referenced
  bodies. Source records/bodies keep their owner policy and are required while pending or actually referenced through
  the existing live-reference machinery; settlement releases only the actual pending dependency, never other holds.
  Mandatory coherent backup includes the source identity row, actual needed owner records, original issued custody,
  dedupe and seglog/payload-pack cut; loss fences the writer and requires mandatory-backup recovery with disclosure.
  Never recover canonical source from a checkpoint or extend event history by retaining a hidden payload copy.


  Derived checkpoint forge_pipeline_completed_checkpoint uses table checkpoints, exact key forge_pipeline_completed_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_pipeline_completed_checkpoint
  (pm.storage_value.forge_pipeline_completed_checkpoint.v1@1.0.0). Sole writer projector.forge.pipeline.completed.history@1.0.0
  and operating consumer consumer.forge.pipeline.completed.history@1.0.0 serve Actions & Pipelines terminal-history
  reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store
  only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.pipeline.completed; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1211 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.pipeline.completed count-equality oracle uses a completely covered prefix with one exact
  matching retained event followed by one unrelated event in the same source. Successful inclusive resume
  revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_pipeline_completed_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one current
  plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.pipeline.completed: correct ID recipes, actual seed-issuance provenance,
  unique node membership by generation_id, and selected-current existence/cardinality are independent
  predicates. Inside this exact root the domain, storage instance, scope, event type, consumer and version
  are fixed; the seed is the only varying preimage component. Reusing a seed with a correct recipe
  necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node seeds.
  Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement of the
  ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1211
unblocks: []
acceptance_criteria:
- forge.pipeline.completed is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_pipeline_completed.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_pipeline_completed_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_pipeline_completed.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-005
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.pipeline.completed
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1212 - forge.pipeline.retried prepared contract

```yaml
plan_unit_id: SP-1212
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.pipeline.retried@1.0.0, prepared without event admission.
  Adopt FGI-1212/CV-1212, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_pipeline_retried_source uses key forge_pipeline_retried_source.v1:{actual storage_instance_id}:{actual
  scope_partition}:{hex_fact_identity}, table forge_pipeline_retried_source. Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_pipeline_retried_source,
  schema_id=pm.storage_value.forge_pipeline_retried_source.v1, version 1.0.0. hex_fact_identity is CV-1212 H. Original
  Forge owner capture performs uniqueness-CAS for this exact F while committing the actual immutable source observation/result;
  it verifies the FGI-1212 predicate and all provider/subject/native-operation/revision/source joins. It stores
  refs and the producer commitment only, not a payload or source-content copy. A record or matching hash alone cannot
  create native acceptance.


  Writer ForgePipelineObserver.commit_retry_started@1.0.0 commits source_committed before forge.pipeline.retried.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_pipeline_retried_source: exact Case L-3 source-lineage/receipt identity class RP-AUTHORITY-INDEFINITE@1.0.0,
  no age/count eviction; storage pressure fails closed. This NEW technical class binding holds only non-content
  identity/commitment and original receipt refs and does not assign the separate event history or retain referenced
  bodies. Source records/bodies keep their owner policy and are required while pending or actually referenced through
  the existing live-reference machinery; settlement releases only the actual pending dependency, never other holds.
  Mandatory coherent backup includes the source identity row, actual needed owner records, original issued custody,
  dedupe and seglog/payload-pack cut; loss fences the writer and requires mandatory-backup recovery with disclosure.
  Never recover canonical source from a checkpoint or extend event history by retaining a hidden payload copy.


  Derived checkpoint forge_pipeline_retried_checkpoint uses table checkpoints, exact key forge_pipeline_retried_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_pipeline_retried_checkpoint
  (pm.storage_value.forge_pipeline_retried_checkpoint.v1@1.0.0). Sole writer projector.forge.pipeline.retried.history@1.0.0
  and operating consumer consumer.forge.pipeline.retried.history@1.0.0 serve Actions & Pipelines retry-history reader.
  The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store only
  the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery forms
  the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus that live
  transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.pipeline.retried; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1212 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.pipeline.retried count-equality oracle uses a completely covered prefix with one exact matching
  retained event followed by one unrelated event in the same source. Successful inclusive resume revalidates
  the already-counted matching cursor, skips it, examines the unrelated final event and publishes
  matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2 with the
  same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS; repair
  candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_pipeline_retried_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one current
  plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.pipeline.retried: correct ID recipes, actual seed-issuance provenance,
  unique node membership by generation_id, and selected-current existence/cardinality are independent
  predicates. Inside this exact root the domain, storage instance, scope, event type, consumer and version
  are fixed; the seed is the only varying preimage component. Reusing a seed with a correct recipe
  necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node seeds.
  Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement of the
  ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1212
unblocks: []
acceptance_criteria:
- forge.pipeline.retried is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_pipeline_retried.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_pipeline_retried_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_pipeline_retried.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-005
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.pipeline.retried
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1213 - forge.pipeline.started prepared contract

```yaml
plan_unit_id: SP-1213
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.pipeline.started@1.0.0, prepared without event admission.
  Adopt FGI-1213/CV-1213, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_pipeline_started_source uses key forge_pipeline_started_source.v1:{actual storage_instance_id}:{actual
  scope_partition}:{hex_fact_identity}, table forge_pipeline_started_source. Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_pipeline_started_source,
  schema_id=pm.storage_value.forge_pipeline_started_source.v1, version 1.0.0. hex_fact_identity is CV-1213 H. Original
  Forge owner capture performs uniqueness-CAS for this exact F while committing the actual immutable source observation/result;
  it verifies the FGI-1213 predicate and all provider/subject/native-operation/revision/source joins. It stores
  refs and the producer commitment only, not a payload or source-content copy. A record or matching hash alone cannot
  create native acceptance.


  Writer ForgePipelineObserver.commit_started@1.0.0 commits source_committed before forge.pipeline.started.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_pipeline_started_source: exact Case L-3 source-lineage/receipt identity class RP-AUTHORITY-INDEFINITE@1.0.0,
  no age/count eviction; storage pressure fails closed. This NEW technical class binding holds only non-content
  identity/commitment and original receipt refs and does not assign the separate event history or retain referenced
  bodies. Source records/bodies keep their owner policy and are required while pending or actually referenced through
  the existing live-reference machinery; settlement releases only the actual pending dependency, never other holds.
  Mandatory coherent backup includes the source identity row, actual needed owner records, original issued custody,
  dedupe and seglog/payload-pack cut; loss fences the writer and requires mandatory-backup recovery with disclosure.
  Never recover canonical source from a checkpoint or extend event history by retaining a hidden payload copy.


  Derived checkpoint forge_pipeline_started_checkpoint uses table checkpoints, exact key forge_pipeline_started_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_pipeline_started_checkpoint
  (pm.storage_value.forge_pipeline_started_checkpoint.v1@1.0.0). Sole writer projector.forge.pipeline.started.history@1.0.0
  and operating consumer consumer.forge.pipeline.started.history@1.0.0 serve Actions & Pipelines start-history reader.
  The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store only
  the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery forms
  the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus that live
  transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.pipeline.started; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1213 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.pipeline.started count-equality oracle uses a completely covered prefix with one exact matching
  retained event followed by one unrelated event in the same source. Successful inclusive resume revalidates
  the already-counted matching cursor, skips it, examines the unrelated final event and publishes
  matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2 with the
  same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS; repair
  candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_pipeline_started_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one current
  plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.pipeline.started: correct ID recipes, actual seed-issuance provenance,
  unique node membership by generation_id, and selected-current existence/cardinality are independent
  predicates. Inside this exact root the domain, storage instance, scope, event type, consumer and version
  are fixed; the seed is the only varying preimage component. Reusing a seed with a correct recipe
  necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node seeds.
  Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement of the
  ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1213
unblocks: []
acceptance_criteria:
- forge.pipeline.started is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_pipeline_started.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_pipeline_started_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_pipeline_started.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-005
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.pipeline.started
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1214 - forge.repository.authority_changed prepared contract

```yaml
plan_unit_id: SP-1214
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.repository.authority_changed@1.0.0, prepared without event
  admission. Adopt FGI-1214/CV-1214, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload
  packs, SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_repository_authority_changed_source uses key forge_repository_authority_changed_source.v1:{actual
  storage_instance_id}:{actual scope_partition}:{hex_fact_identity}, table forge_repository_authority_changed_source.
  Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_repository_authority_changed_source, schema_id=pm.storage_value.forge_repository_authority_changed_source.v1,
  version 1.0.0. hex_fact_identity is CV-1214 H. Original Forge owner capture performs uniqueness-CAS for this exact
  F while committing the actual immutable source observation/result; it verifies the FGI-1214 predicate and all
  provider/subject/native-operation/revision/source joins. It stores refs and the producer commitment only, not
  a payload or source-content copy. A record or matching hash alone cannot create native acceptance.


  Writer ForgeAuthorityCoordinator.commit_transfer@1.0.0 commits source_committed before forge.repository.authority_changed.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_repository_authority_changed_source: exact Case L-3 source-lineage/receipt identity
  class RP-AUTHORITY-INDEFINITE@1.0.0, no age/count eviction; storage pressure fails closed. This NEW technical
  class binding holds only non-content identity/commitment and original receipt refs and does not assign the separate
  event history or retain referenced bodies. Source records/bodies keep their owner policy and are required while
  pending or actually referenced through the existing live-reference machinery; settlement releases only the actual
  pending dependency, never other holds. Mandatory coherent backup includes the source identity row, actual needed
  owner records, original issued custody, dedupe and seglog/payload-pack cut; loss fences the writer and requires
  mandatory-backup recovery with disclosure. Never recover canonical source from a checkpoint or extend event history
  by retaining a hidden payload copy.


  Derived checkpoint forge_repository_authority_changed_checkpoint uses table checkpoints, exact key forge_repository_authority_changed_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_repository_authority_changed_checkpoint
  (pm.storage_value.forge_repository_authority_changed_checkpoint.v1@1.0.0). Sole writer projector.forge.repository.authority_changed.history@1.0.0
  and operating consumer consumer.forge.repository.authority_changed.history@1.0.0 serve Source Control Source of
  Truth history reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized.
  Store only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.repository.authority_changed; filter only exact
  family/version and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage.
  Verified empty source permits null cursor/count zero only with actual inventory proof. Every delivered matching
  record verifies actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and
  all FGI-1214 fact joins under its original edition. Missing optional linked content returns unavailable without
  inventing it; missing canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes
  the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.repository.authority_changed count-equality oracle uses a completely covered prefix with one
  exact matching retained event followed by one unrelated event in the same source. Successful inclusive
  resume revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_repository_authority_changed_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278:
  one current plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.repository.authority_changed: correct ID recipes, actual seed-issuance
  provenance, unique node membership by generation_id, and selected-current existence/cardinality are
  independent predicates. Inside this exact root the domain, storage instance, scope, event type, consumer
  and version are fixed; the seed is the only varying preimage component. Reusing a seed with a correct
  recipe necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node
  seeds. Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement
  of the ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1214
unblocks: []
acceptance_criteria:
- forge.repository.authority_changed is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_repository_authority_changed.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_repository_authority_changed_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_repository_authority_changed.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-002
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.repository.authority_changed
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1215 - forge.repository.created prepared contract

```yaml
plan_unit_id: SP-1215
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.repository.created@1.0.0, prepared without event admission.
  Adopt FGI-1215/CV-1215, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_repository_created_source uses key forge_repository_created_source.v1:{actual storage_instance_id}:{actual
  scope_partition}:{hex_fact_identity}, table forge_repository_created_source. Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_repository_created_source,
  schema_id=pm.storage_value.forge_repository_created_source.v1, version 1.0.0. hex_fact_identity is CV-1215 H.
  Original Forge owner capture performs uniqueness-CAS for this exact F while committing the actual immutable source
  observation/result; it verifies the FGI-1215 predicate and all provider/subject/native-operation/revision/source
  joins. It stores refs and the producer commitment only, not a payload or source-content copy. A record or matching
  hash alone cannot create native acceptance.


  Writer ForgeRepositoryCreate.commit_verified_result@1.0.0 commits source_committed before forge.repository.created.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_repository_created_source: exact Case L-3 source-lineage/receipt identity class RP-AUTHORITY-INDEFINITE@1.0.0,
  no age/count eviction; storage pressure fails closed. This NEW technical class binding holds only non-content
  identity/commitment and original receipt refs and does not assign the separate event history or retain referenced
  bodies. Source records/bodies keep their owner policy and are required while pending or actually referenced through
  the existing live-reference machinery; settlement releases only the actual pending dependency, never other holds.
  Mandatory coherent backup includes the source identity row, actual needed owner records, original issued custody,
  dedupe and seglog/payload-pack cut; loss fences the writer and requires mandatory-backup recovery with disclosure.
  Never recover canonical source from a checkpoint or extend event history by retaining a hidden payload copy.


  Derived checkpoint forge_repository_created_checkpoint uses table checkpoints, exact key forge_repository_created_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_repository_created_checkpoint
  (pm.storage_value.forge_repository_created_checkpoint.v1@1.0.0). Sole writer projector.forge.repository.created.history@1.0.0
  and operating consumer consumer.forge.repository.created.history@1.0.0 serve Project online-repository origin
  reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store
  only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.repository.created; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1215 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.repository.created count-equality oracle uses a completely covered prefix with one exact
  matching retained event followed by one unrelated event in the same source. Successful inclusive resume
  revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_repository_created_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one current
  plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.repository.created: correct ID recipes, actual seed-issuance provenance,
  unique node membership by generation_id, and selected-current existence/cardinality are independent
  predicates. Inside this exact root the domain, storage instance, scope, event type, consumer and version
  are fixed; the seed is the only varying preimage component. Reusing a seed with a correct recipe
  necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node seeds.
  Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement of the
  ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1215
unblocks: []
acceptance_criteria:
- forge.repository.created is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_repository_created.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_repository_created_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_repository_created.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-023
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.repository.created
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1216 - forge.repository.discovered prepared contract

```yaml
plan_unit_id: SP-1216
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.repository.discovered@1.0.0, prepared without event admission.
  Adopt FGI-1216/CV-1216, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_repository_discovered_source uses key forge_repository_discovered_source.v1:{actual
  storage_instance_id}:{actual scope_partition}:{hex_fact_identity}, table forge_repository_discovered_source. Schema
  is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_repository_discovered_source, schema_id=pm.storage_value.forge_repository_discovered_source.v1,
  version 1.0.0. hex_fact_identity is CV-1216 H. Original Forge owner capture performs uniqueness-CAS for this exact
  F while committing the actual immutable source observation/result; it verifies the FGI-1216 predicate and all
  provider/subject/native-operation/revision/source joins. It stores refs and the producer commitment only, not
  a payload or source-content copy. A record or matching hash alone cannot create native acceptance.


  Writer ForgeRepositoryDiscovery.commit_verified_item@1.0.0 commits source_committed before forge.repository.discovered.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_repository_discovered_source: exact Case L-3 source-lineage/receipt identity class
  RP-AUTHORITY-INDEFINITE@1.0.0, no age/count eviction; storage pressure fails closed. This NEW technical class
  binding holds only non-content identity/commitment and original receipt refs and does not assign the separate
  event history or retain referenced bodies. Source records/bodies keep their owner policy and are required while
  pending or actually referenced through the existing live-reference machinery; settlement releases only the actual
  pending dependency, never other holds. Mandatory coherent backup includes the source identity row, actual needed
  owner records, original issued custody, dedupe and seglog/payload-pack cut; loss fences the writer and requires
  mandatory-backup recovery with disclosure. Never recover canonical source from a checkpoint or extend event history
  by retaining a hidden payload copy.


  Derived checkpoint forge_repository_discovered_checkpoint uses table checkpoints, exact key forge_repository_discovered_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_repository_discovered_checkpoint
  (pm.storage_value.forge_repository_discovered_checkpoint.v1@1.0.0). Sole writer projector.forge.repository.discovered.history@1.0.0
  and operating consumer consumer.forge.repository.discovered.history@1.0.0 serve Hosting Services repository-discovery
  history reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized.
  Store only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.repository.discovered; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1216 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.repository.discovered count-equality oracle uses a completely covered prefix with one exact
  matching retained event followed by one unrelated event in the same source. Successful inclusive resume
  revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_repository_discovered_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one
  current plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.repository.discovered: correct ID recipes, actual seed-issuance
  provenance, unique node membership by generation_id, and selected-current existence/cardinality are
  independent predicates. Inside this exact root the domain, storage instance, scope, event type, consumer
  and version are fixed; the seed is the only varying preimage component. Reusing a seed with a correct
  recipe necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node
  seeds. Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement
  of the ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1216
unblocks: []
acceptance_criteria:
- forge.repository.discovered is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_repository_discovered.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_repository_discovered_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_repository_discovered.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-023
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.repository.discovered
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1217 - forge.repository.eligibility_changed prepared contract

```yaml
plan_unit_id: SP-1217
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.repository.eligibility_changed@1.0.0, prepared without
  event admission. Adopt FGI-1217/CV-1217, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337
  payload packs, SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_repository_eligibility_changed_source uses key forge_repository_eligibility_changed_source.v1:{actual
  storage_instance_id}:{actual scope_partition}:{hex_fact_identity}, table forge_repository_eligibility_changed_source.
  Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_repository_eligibility_changed_source,
  schema_id=pm.storage_value.forge_repository_eligibility_changed_source.v1, version 1.0.0. hex_fact_identity is
  CV-1217 H. Original Forge owner capture performs uniqueness-CAS for this exact F while committing the actual immutable
  source observation/result; it verifies the FGI-1217 predicate and all provider/subject/native-operation/revision/source
  joins. It stores refs and the producer commitment only, not a payload or source-content copy. A record or matching
  hash alone cannot create native acceptance.


  Writer ForgeRepositoryEligibility.commit_assessment@1.0.0 commits source_committed before forge.repository.eligibility_changed.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_repository_eligibility_changed_source: exact Case L-3 source-lineage/receipt identity
  class RP-AUTHORITY-INDEFINITE@1.0.0, no age/count eviction; storage pressure fails closed. This NEW technical
  class binding holds only non-content identity/commitment and original receipt refs and does not assign the separate
  event history or retain referenced bodies. Source records/bodies keep their owner policy and are required while
  pending or actually referenced through the existing live-reference machinery; settlement releases only the actual
  pending dependency, never other holds. Mandatory coherent backup includes the source identity row, actual needed
  owner records, original issued custody, dedupe and seglog/payload-pack cut; loss fences the writer and requires
  mandatory-backup recovery with disclosure. Never recover canonical source from a checkpoint or extend event history
  by retaining a hidden payload copy.


  Derived checkpoint forge_repository_eligibility_changed_checkpoint uses table checkpoints, exact key forge_repository_eligibility_changed_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_repository_eligibility_changed_checkpoint
  (pm.storage_value.forge_repository_eligibility_changed_checkpoint.v1@1.0.0). Sole writer projector.forge.repository.eligibility_changed.history@1.0.0
  and operating consumer consumer.forge.repository.eligibility_changed.history@1.0.0 serve Source Control repository
  eligibility-history reader. The SP-278 generic index stays the projection; no second authoritative domain state
  is materialized. Store only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current
  advance/read/recovery forms the actual live ten-field token from its own read snapshot and revalidates all nine
  durable fields plus that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected
  source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.repository.eligibility_changed; filter only
  exact family/version and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage.
  Verified empty source permits null cursor/count zero only with actual inventory proof. Every delivered matching
  record verifies actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and
  all FGI-1217 fact joins under its original edition. Missing optional linked content returns unavailable without
  inventing it; missing canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes
  the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.repository.eligibility_changed count-equality oracle uses a completely covered prefix with one
  exact matching retained event followed by one unrelated event in the same source. Successful inclusive
  resume revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_repository_eligibility_changed_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278:
  one current plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.repository.eligibility_changed: correct ID recipes, actual seed-issuance
  provenance, unique node membership by generation_id, and selected-current existence/cardinality are
  independent predicates. Inside this exact root the domain, storage instance, scope, event type, consumer
  and version are fixed; the seed is the only varying preimage component. Reusing a seed with a correct
  recipe necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node
  seeds. Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement
  of the ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1217
unblocks: []
acceptance_criteria:
- forge.repository.eligibility_changed is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_repository_eligibility_changed.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_repository_eligibility_changed_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_repository_eligibility_changed.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-003
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.repository.eligibility_changed
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1218 - forge.review.approved prepared contract

```yaml
plan_unit_id: SP-1218
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.review.approved@1.0.0, prepared without event admission.
  Adopt FGI-1218/CV-1218, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_review_approved_source uses key forge_review_approved_source.v1:{actual storage_instance_id}:{actual
  scope_partition}:{hex_fact_identity}, table forge_review_approved_source. Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_approved_source,
  schema_id=pm.storage_value.forge_review_approved_source.v1, version 1.0.0. hex_fact_identity is CV-1218 H. Original
  Forge owner capture performs uniqueness-CAS for this exact F while committing the actual immutable source observation/result;
  it verifies the FGI-1218 predicate and all provider/subject/native-operation/revision/source joins. It stores
  refs and the producer commitment only, not a payload or source-content copy. A record or matching hash alone cannot
  create native acceptance.


  Writer ForgeReviewVoteObserver.commit_approval@1.0.0 commits source_committed before forge.review.approved.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_review_approved_source: exact Case L-3 source-lineage/receipt identity class RP-AUTHORITY-INDEFINITE@1.0.0,
  no age/count eviction; storage pressure fails closed. This NEW technical class binding holds only non-content
  identity/commitment and original receipt refs and does not assign the separate event history or retain referenced
  bodies. Source records/bodies keep their owner policy and are required while pending or actually referenced through
  the existing live-reference machinery; settlement releases only the actual pending dependency, never other holds.
  Mandatory coherent backup includes the source identity row, actual needed owner records, original issued custody,
  dedupe and seglog/payload-pack cut; loss fences the writer and requires mandatory-backup recovery with disclosure.
  Never recover canonical source from a checkpoint or extend event history by retaining a hidden payload copy.


  Derived checkpoint forge_review_approved_checkpoint uses table checkpoints, exact key forge_review_approved_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_approved_checkpoint
  (pm.storage_value.forge_review_approved_checkpoint.v1@1.0.0). Sole writer projector.forge.review.approved.history@1.0.0
  and operating consumer consumer.forge.review.approved.history@1.0.0 serve Source Control review-approval history
  reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store
  only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.review.approved; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1218 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.review.approved count-equality oracle uses a completely covered prefix with one exact matching
  retained event followed by one unrelated event in the same source. Successful inclusive resume revalidates
  the already-counted matching cursor, skips it, examines the unrelated final event and publishes
  matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2 with the
  same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS; repair
  candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_review_approved_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one current
  plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.review.approved: correct ID recipes, actual seed-issuance provenance,
  unique node membership by generation_id, and selected-current existence/cardinality are independent
  predicates. Inside this exact root the domain, storage instance, scope, event type, consumer and version
  are fixed; the seed is the only varying preimage component. Reusing a seed with a correct recipe
  necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node seeds.
  Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement of the
  ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists. Newly authored exact vote-source closure
  for this family: its canonical source row also stores the closed vote_evidence object in Plans/forge_event_storage_contracts.schema.json,
  with provider, reviewer_ref, review_revision_ref, native_vote_ref, vote_value=approved, required_reviewer (exact
  boolean), revision_binding_kind (provider-asserted or observed_by_puppet_master) and binding_evidence_ref. These
  original non-content decision scalars are the explicit exception to the source row refs/commitments-only description,
  not a review text/body copy. All vote and revision fields must join the authenticated original provider result;
  an observed binding resolves the actual original observation against the full review triple, and a provider-asserted
  binding resolves the provider-supplied revision. Required-reviewer status is the original source fact, not a present-day
  policy substitution. Same original native vote identity returns this same source row and never remints history.
  This is a new per-family source grammar within the approved missing technical definitions, not a claim that FGI-020
  already had a materialized generic carrier or a new generic vote family. Source lineage retains these bounded
  decision facts under Case L-3; it grants no access to referenced content and chooses no separate event lifetime.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1218
unblocks: []
acceptance_criteria:
- forge.review.approved is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_approved.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_approved_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_review_approved.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-020
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.approved
- SP-286
- CV-339
- SP-278
- RP-AUTHORITY-INDEFINITE
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1219 - forge.review.changes_requested prepared contract

```yaml
plan_unit_id: SP-1219
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.review.changes_requested@1.0.0, prepared without event
  admission. Adopt FGI-1219/CV-1219, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload
  packs, SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_review_changes_requested_source uses key forge_review_changes_requested_source.v1:{actual
  storage_instance_id}:{actual scope_partition}:{hex_fact_identity}, table forge_review_changes_requested_source.
  Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_changes_requested_source, schema_id=pm.storage_value.forge_review_changes_requested_source.v1,
  version 1.0.0. hex_fact_identity is CV-1219 H. Original Forge owner capture performs uniqueness-CAS for this exact
  F while committing the actual immutable source observation/result; it verifies the FGI-1219 predicate and all
  provider/subject/native-operation/revision/source joins. It stores refs and the producer commitment only, not
  a payload or source-content copy. A record or matching hash alone cannot create native acceptance.


  Writer ForgeReviewVoteObserver.commit_changes_requested@1.0.0 commits source_committed before forge.review.changes_requested.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_review_changes_requested_source: exact Case L-3 source-lineage/receipt identity class
  RP-AUTHORITY-INDEFINITE@1.0.0, no age/count eviction; storage pressure fails closed. This NEW technical class
  binding holds only non-content identity/commitment and original receipt refs and does not assign the separate
  event history or retain referenced bodies. Source records/bodies keep their owner policy and are required while
  pending or actually referenced through the existing live-reference machinery; settlement releases only the actual
  pending dependency, never other holds. Mandatory coherent backup includes the source identity row, actual needed
  owner records, original issued custody, dedupe and seglog/payload-pack cut; loss fences the writer and requires
  mandatory-backup recovery with disclosure. Never recover canonical source from a checkpoint or extend event history
  by retaining a hidden payload copy.


  Derived checkpoint forge_review_changes_requested_checkpoint uses table checkpoints, exact key forge_review_changes_requested_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_changes_requested_checkpoint
  (pm.storage_value.forge_review_changes_requested_checkpoint.v1@1.0.0). Sole writer projector.forge.review.changes_requested.history@1.0.0
  and operating consumer consumer.forge.review.changes_requested.history@1.0.0 serve Source Control review changes-requested
  history reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized.
  Store only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.review.changes_requested; filter only exact
  family/version and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage.
  Verified empty source permits null cursor/count zero only with actual inventory proof. Every delivered matching
  record verifies actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and
  all FGI-1219 fact joins under its original edition. Missing optional linked content returns unavailable without
  inventing it; missing canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes
  the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.review.changes_requested count-equality oracle uses a completely covered prefix with one exact
  matching retained event followed by one unrelated event in the same source. Successful inclusive resume
  revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_review_changes_requested_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278:
  one current plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.review.changes_requested: correct ID recipes, actual seed-issuance
  provenance, unique node membership by generation_id, and selected-current existence/cardinality are
  independent predicates. Inside this exact root the domain, storage instance, scope, event type, consumer
  and version are fixed; the seed is the only varying preimage component. Reusing a seed with a correct
  recipe necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node
  seeds. Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement
  of the ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists. Newly authored exact vote-source closure
  for this family: its canonical source row also stores the closed vote_evidence object in Plans/forge_event_storage_contracts.schema.json,
  with provider, reviewer_ref, review_revision_ref, native_vote_ref, vote_value=changes_requested, required_reviewer
  (exact boolean), revision_binding_kind (provider-asserted or observed_by_puppet_master) and binding_evidence_ref.
  These original non-content decision scalars are the explicit exception to the source row refs/commitments-only
  description, not a review text/body copy. All vote and revision fields must join the authenticated original provider
  result; an observed binding resolves the actual original observation against the full review triple, and a provider-asserted
  binding resolves the provider-supplied revision. Required-reviewer status is the original source fact, not a present-day
  policy substitution. Same original native vote identity returns this same source row and never remints history.
  This is a new per-family source grammar within the approved missing technical definitions, not a claim that FGI-020
  already had a materialized generic carrier or a new generic vote family. Source lineage retains these bounded
  decision facts under Case L-3; it grants no access to referenced content and chooses no separate event lifetime.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1219
unblocks: []
acceptance_criteria:
- forge.review.changes_requested is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_changes_requested.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_changes_requested_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_review_changes_requested.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-020
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.changes_requested
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1220 - forge.review.closed prepared contract

```yaml
plan_unit_id: SP-1220
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.review.closed@1.0.0, prepared without event admission.
  Adopt FGI-1220/CV-1220, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_review_closed_source uses key forge_review_closed_source.v1:{actual storage_instance_id}:{actual
  scope_partition}:{hex_fact_identity}, table forge_review_closed_source. Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_closed_source,
  schema_id=pm.storage_value.forge_review_closed_source.v1, version 1.0.0. hex_fact_identity is CV-1220 H. Original
  Forge owner capture performs uniqueness-CAS for this exact F while committing the actual immutable source observation/result;
  it verifies the FGI-1220 predicate and all provider/subject/native-operation/revision/source joins. It stores
  refs and the producer commitment only, not a payload or source-content copy. A record or matching hash alone cannot
  create native acceptance.


  Writer ForgeReviewLifecycle.commit_closed@1.0.0 commits source_committed before forge.review.closed.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_review_closed_source: exact Case L-3 source-lineage/receipt identity class RP-AUTHORITY-INDEFINITE@1.0.0,
  no age/count eviction; storage pressure fails closed. This NEW technical class binding holds only non-content
  identity/commitment and original receipt refs and does not assign the separate event history or retain referenced
  bodies. Source records/bodies keep their owner policy and are required while pending or actually referenced through
  the existing live-reference machinery; settlement releases only the actual pending dependency, never other holds.
  Mandatory coherent backup includes the source identity row, actual needed owner records, original issued custody,
  dedupe and seglog/payload-pack cut; loss fences the writer and requires mandatory-backup recovery with disclosure.
  Never recover canonical source from a checkpoint or extend event history by retaining a hidden payload copy.


  Derived checkpoint forge_review_closed_checkpoint uses table checkpoints, exact key forge_review_closed_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_closed_checkpoint
  (pm.storage_value.forge_review_closed_checkpoint.v1@1.0.0). Sole writer projector.forge.review.closed.history@1.0.0
  and operating consumer consumer.forge.review.closed.history@1.0.0 serve Source Control review closure-history
  reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store
  only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.review.closed; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1220 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.review.closed count-equality oracle uses a completely covered prefix with one exact matching
  retained event followed by one unrelated event in the same source. Successful inclusive resume revalidates
  the already-counted matching cursor, skips it, examines the unrelated final event and publishes
  matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2 with the
  same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS; repair
  candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_review_closed_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one current
  plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.review.closed: correct ID recipes, actual seed-issuance provenance, unique
  node membership by generation_id, and selected-current existence/cardinality are independent predicates.
  Inside this exact root the domain, storage instance, scope, event type, consumer and version are fixed;
  the seed is the only varying preimage component. Reusing a seed with a correct recipe necessarily reuses
  the ID. Correct recipes plus unique ID membership therefore entail distinct node seeds. Seed uniqueness is
  a derived fact, not a separately weakened refusal and not duplicate enforcement of the ID predicate.
  Different seeds alone do not prove distinct IDs; repeated IDs are refused even when individual recipes are
  correct. Seed issuance separately verifies the seed was once durably allocated by the actual Storage
  generation allocator for this root and logical generation, before its membership was accepted; original
  issuance remains verifiable on retry and retained-generation reads. A unique seed and correctly recomputed
  ID do not prove that issuance. Repeated array occurrences of the same authentic node share its one genuine
  issuance fact and fail only unique node membership, not issuance. Check membership by generation_id over
  every node, selected or unselected; do not recast repeated membership as a second seed allocation.
  Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by original seed and
  exact root identity; comparison of the claimed generation_id to the computed ID belongs only to the recipe
  predicate. Exact root/core identity equality, lifecycle/time consistency and actual source/receipt/token
  checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1220
unblocks: []
acceptance_criteria:
- forge.review.closed is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_closed.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_closed_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_review_closed.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-004
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.closed
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1221 - forge.review.created prepared contract

```yaml
plan_unit_id: SP-1221
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.review.created@1.0.0, prepared without event admission.
  Adopt FGI-1221/CV-1221, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_review_created_source uses key forge_review_created_source.v1:{actual storage_instance_id}:{actual
  scope_partition}:{hex_fact_identity}, table forge_review_created_source. Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_created_source,
  schema_id=pm.storage_value.forge_review_created_source.v1, version 1.0.0. hex_fact_identity is CV-1221 H. Original
  Forge owner capture performs uniqueness-CAS for this exact F while committing the actual immutable source observation/result;
  it verifies the FGI-1221 predicate and all provider/subject/native-operation/revision/source joins. It stores
  refs and the producer commitment only, not a payload or source-content copy. A record or matching hash alone cannot
  create native acceptance.


  Writer ForgeReviewLifecycle.commit_created@1.0.0 commits source_committed before forge.review.created.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_review_created_source: exact Case L-3 source-lineage/receipt identity class RP-AUTHORITY-INDEFINITE@1.0.0,
  no age/count eviction; storage pressure fails closed. This NEW technical class binding holds only non-content
  identity/commitment and original receipt refs and does not assign the separate event history or retain referenced
  bodies. Source records/bodies keep their owner policy and are required while pending or actually referenced through
  the existing live-reference machinery; settlement releases only the actual pending dependency, never other holds.
  Mandatory coherent backup includes the source identity row, actual needed owner records, original issued custody,
  dedupe and seglog/payload-pack cut; loss fences the writer and requires mandatory-backup recovery with disclosure.
  Never recover canonical source from a checkpoint or extend event history by retaining a hidden payload copy.


  Derived checkpoint forge_review_created_checkpoint uses table checkpoints, exact key forge_review_created_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_created_checkpoint
  (pm.storage_value.forge_review_created_checkpoint.v1@1.0.0). Sole writer projector.forge.review.created.history@1.0.0
  and operating consumer consumer.forge.review.created.history@1.0.0 serve Source Control review origin-history
  reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store
  only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.review.created; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1221 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.review.created count-equality oracle uses a completely covered prefix with one exact matching
  retained event followed by one unrelated event in the same source. Successful inclusive resume revalidates
  the already-counted matching cursor, skips it, examines the unrelated final event and publishes
  matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2 with the
  same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS; repair
  candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_review_created_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one current
  plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.review.created: correct ID recipes, actual seed-issuance provenance,
  unique node membership by generation_id, and selected-current existence/cardinality are independent
  predicates. Inside this exact root the domain, storage instance, scope, event type, consumer and version
  are fixed; the seed is the only varying preimage component. Reusing a seed with a correct recipe
  necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node seeds.
  Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement of the
  ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1221
unblocks: []
acceptance_criteria:
- forge.review.created is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_created.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_created_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_review_created.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-004
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.created
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1222 - forge.review.marked_ready prepared contract

```yaml
plan_unit_id: SP-1222
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.review.marked_ready@1.0.0, prepared without event admission.
  Adopt FGI-1222/CV-1222, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_review_marked_ready_source uses key forge_review_marked_ready_source.v1:{actual storage_instance_id}:{actual
  scope_partition}:{hex_fact_identity}, table forge_review_marked_ready_source. Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_marked_ready_source,
  schema_id=pm.storage_value.forge_review_marked_ready_source.v1, version 1.0.0. hex_fact_identity is CV-1222 H.
  Original Forge owner capture performs uniqueness-CAS for this exact F while committing the actual immutable source
  observation/result; it verifies the FGI-1222 predicate and all provider/subject/native-operation/revision/source
  joins. It stores refs and the producer commitment only, not a payload or source-content copy. A record or matching
  hash alone cannot create native acceptance.


  Writer ForgeReviewLifecycle.commit_mark_ready@1.0.0 commits source_committed before forge.review.marked_ready.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_review_marked_ready_source: exact Case L-3 source-lineage/receipt identity class RP-AUTHORITY-INDEFINITE@1.0.0,
  no age/count eviction; storage pressure fails closed. This NEW technical class binding holds only non-content
  identity/commitment and original receipt refs and does not assign the separate event history or retain referenced
  bodies. Source records/bodies keep their owner policy and are required while pending or actually referenced through
  the existing live-reference machinery; settlement releases only the actual pending dependency, never other holds.
  Mandatory coherent backup includes the source identity row, actual needed owner records, original issued custody,
  dedupe and seglog/payload-pack cut; loss fences the writer and requires mandatory-backup recovery with disclosure.
  Never recover canonical source from a checkpoint or extend event history by retaining a hidden payload copy.


  Derived checkpoint forge_review_marked_ready_checkpoint uses table checkpoints, exact key forge_review_marked_ready_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_marked_ready_checkpoint
  (pm.storage_value.forge_review_marked_ready_checkpoint.v1@1.0.0). Sole writer projector.forge.review.marked_ready.history@1.0.0
  and operating consumer consumer.forge.review.marked_ready.history@1.0.0 serve Source Control review readiness-history
  reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store
  only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.review.marked_ready; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1222 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.review.marked_ready count-equality oracle uses a completely covered prefix with one exact
  matching retained event followed by one unrelated event in the same source. Successful inclusive resume
  revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_review_marked_ready_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one current
  plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.review.marked_ready: correct ID recipes, actual seed-issuance provenance,
  unique node membership by generation_id, and selected-current existence/cardinality are independent
  predicates. Inside this exact root the domain, storage instance, scope, event type, consumer and version
  are fixed; the seed is the only varying preimage component. Reusing a seed with a correct recipe
  necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node seeds.
  Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement of the
  ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1222
unblocks: []
acceptance_criteria:
- forge.review.marked_ready is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_marked_ready.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_marked_ready_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_review_marked_ready.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-022
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.marked_ready
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1223 - forge.review.merged prepared contract

```yaml
plan_unit_id: SP-1223
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.review.merged@1.0.0, prepared without event admission.
  Adopt FGI-1223/CV-1223, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_review_merged_source uses key forge_review_merged_source.v1:{actual storage_instance_id}:{actual
  scope_partition}:{hex_fact_identity}, table forge_review_merged_source. Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_merged_source,
  schema_id=pm.storage_value.forge_review_merged_source.v1, version 1.0.0. hex_fact_identity is CV-1223 H. Original
  Forge owner capture performs uniqueness-CAS for this exact F while committing the actual immutable source observation/result;
  it verifies the FGI-1223 predicate and all provider/subject/native-operation/revision/source joins. It stores
  refs and the producer commitment only, not a payload or source-content copy. A record or matching hash alone cannot
  create native acceptance.


  Writer ForgeReviewLifecycle.commit_merged@1.0.0 commits source_committed before forge.review.merged.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_review_merged_source: exact Case L-3 source-lineage/receipt identity class RP-AUTHORITY-INDEFINITE@1.0.0,
  no age/count eviction; storage pressure fails closed. This NEW technical class binding holds only non-content
  identity/commitment and original receipt refs and does not assign the separate event history or retain referenced
  bodies. Source records/bodies keep their owner policy and are required while pending or actually referenced through
  the existing live-reference machinery; settlement releases only the actual pending dependency, never other holds.
  Mandatory coherent backup includes the source identity row, actual needed owner records, original issued custody,
  dedupe and seglog/payload-pack cut; loss fences the writer and requires mandatory-backup recovery with disclosure.
  Never recover canonical source from a checkpoint or extend event history by retaining a hidden payload copy.


  Derived checkpoint forge_review_merged_checkpoint uses table checkpoints, exact key forge_review_merged_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_merged_checkpoint
  (pm.storage_value.forge_review_merged_checkpoint.v1@1.0.0). Sole writer projector.forge.review.merged.history@1.0.0
  and operating consumer consumer.forge.review.merged.history@1.0.0 serve Source Control review merge-history reader.
  The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store only
  the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery forms
  the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus that live
  transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.review.merged; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1223 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.review.merged count-equality oracle uses a completely covered prefix with one exact matching
  retained event followed by one unrelated event in the same source. Successful inclusive resume revalidates
  the already-counted matching cursor, skips it, examines the unrelated final event and publishes
  matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2 with the
  same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS; repair
  candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_review_merged_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one current
  plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.review.merged: correct ID recipes, actual seed-issuance provenance, unique
  node membership by generation_id, and selected-current existence/cardinality are independent predicates.
  Inside this exact root the domain, storage instance, scope, event type, consumer and version are fixed;
  the seed is the only varying preimage component. Reusing a seed with a correct recipe necessarily reuses
  the ID. Correct recipes plus unique ID membership therefore entail distinct node seeds. Seed uniqueness is
  a derived fact, not a separately weakened refusal and not duplicate enforcement of the ID predicate.
  Different seeds alone do not prove distinct IDs; repeated IDs are refused even when individual recipes are
  correct. Seed issuance separately verifies the seed was once durably allocated by the actual Storage
  generation allocator for this root and logical generation, before its membership was accepted; original
  issuance remains verifiable on retry and retained-generation reads. A unique seed and correctly recomputed
  ID do not prove that issuance. Repeated array occurrences of the same authentic node share its one genuine
  issuance fact and fail only unique node membership, not issuance. Check membership by generation_id over
  every node, selected or unselected; do not recast repeated membership as a second seed allocation.
  Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by original seed and
  exact root identity; comparison of the claimed generation_id to the computed ID belongs only to the recipe
  predicate. Exact root/core identity equality, lifecycle/time consistency and actual source/receipt/token
  checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1223
unblocks: []
acceptance_criteria:
- forge.review.merged is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_merged.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_merged_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_review_merged.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-018
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.merged
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1224 - forge.review.reopened prepared contract

```yaml
plan_unit_id: SP-1224
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.review.reopened@1.0.0, prepared without event admission.
  Adopt FGI-1224/CV-1224, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_review_reopened_source uses key forge_review_reopened_source.v1:{actual storage_instance_id}:{actual
  scope_partition}:{hex_fact_identity}, table forge_review_reopened_source. Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_reopened_source,
  schema_id=pm.storage_value.forge_review_reopened_source.v1, version 1.0.0. hex_fact_identity is CV-1224 H. Original
  Forge owner capture performs uniqueness-CAS for this exact F while committing the actual immutable source observation/result;
  it verifies the FGI-1224 predicate and all provider/subject/native-operation/revision/source joins. It stores
  refs and the producer commitment only, not a payload or source-content copy. A record or matching hash alone cannot
  create native acceptance.


  Writer ForgeReviewLifecycle.commit_reopened@1.0.0 commits source_committed before forge.review.reopened.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_review_reopened_source: exact Case L-3 source-lineage/receipt identity class RP-AUTHORITY-INDEFINITE@1.0.0,
  no age/count eviction; storage pressure fails closed. This NEW technical class binding holds only non-content
  identity/commitment and original receipt refs and does not assign the separate event history or retain referenced
  bodies. Source records/bodies keep their owner policy and are required while pending or actually referenced through
  the existing live-reference machinery; settlement releases only the actual pending dependency, never other holds.
  Mandatory coherent backup includes the source identity row, actual needed owner records, original issued custody,
  dedupe and seglog/payload-pack cut; loss fences the writer and requires mandatory-backup recovery with disclosure.
  Never recover canonical source from a checkpoint or extend event history by retaining a hidden payload copy.


  Derived checkpoint forge_review_reopened_checkpoint uses table checkpoints, exact key forge_review_reopened_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_reopened_checkpoint
  (pm.storage_value.forge_review_reopened_checkpoint.v1@1.0.0). Sole writer projector.forge.review.reopened.history@1.0.0
  and operating consumer consumer.forge.review.reopened.history@1.0.0 serve Source Control review reopening-history
  reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store
  only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.review.reopened; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1224 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.review.reopened count-equality oracle uses a completely covered prefix with one exact matching
  retained event followed by one unrelated event in the same source. Successful inclusive resume revalidates
  the already-counted matching cursor, skips it, examines the unrelated final event and publishes
  matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2 with the
  same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS; repair
  candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_review_reopened_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one current
  plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.review.reopened: correct ID recipes, actual seed-issuance provenance,
  unique node membership by generation_id, and selected-current existence/cardinality are independent
  predicates. Inside this exact root the domain, storage instance, scope, event type, consumer and version
  are fixed; the seed is the only varying preimage component. Reusing a seed with a correct recipe
  necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node seeds.
  Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement of the
  ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1224
unblocks: []
acceptance_criteria:
- forge.review.reopened is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_reopened.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_reopened_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_review_reopened.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-004
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.reopened
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1225 - forge.review.thread.reopened prepared contract

```yaml
plan_unit_id: SP-1225
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.review.thread.reopened@1.0.0, prepared without event admission.
  Adopt FGI-1225/CV-1225, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_review_thread_reopened_source uses key forge_review_thread_reopened_source.v1:{actual
  storage_instance_id}:{actual scope_partition}:{hex_fact_identity}, table forge_review_thread_reopened_source.
  Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_thread_reopened_source, schema_id=pm.storage_value.forge_review_thread_reopened_source.v1,
  version 1.0.0. hex_fact_identity is CV-1225 H. Original Forge owner capture performs uniqueness-CAS for this exact
  F while committing the actual immutable source observation/result; it verifies the FGI-1225 predicate and all
  provider/subject/native-operation/revision/source joins. It stores refs and the producer commitment only, not
  a payload or source-content copy. A record or matching hash alone cannot create native acceptance.


  Writer ForgeReviewThreadLifecycle.commit_reopened@1.0.0 commits source_committed before forge.review.thread.reopened.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_review_thread_reopened_source: exact Case L-3 source-lineage/receipt identity class
  RP-AUTHORITY-INDEFINITE@1.0.0, no age/count eviction; storage pressure fails closed. This NEW technical class
  binding holds only non-content identity/commitment and original receipt refs and does not assign the separate
  event history or retain referenced bodies. Source records/bodies keep their owner policy and are required while
  pending or actually referenced through the existing live-reference machinery; settlement releases only the actual
  pending dependency, never other holds. Mandatory coherent backup includes the source identity row, actual needed
  owner records, original issued custody, dedupe and seglog/payload-pack cut; loss fences the writer and requires
  mandatory-backup recovery with disclosure. Never recover canonical source from a checkpoint or extend event history
  by retaining a hidden payload copy.


  Derived checkpoint forge_review_thread_reopened_checkpoint uses table checkpoints, exact key forge_review_thread_reopened_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_thread_reopened_checkpoint
  (pm.storage_value.forge_review_thread_reopened_checkpoint.v1@1.0.0). Sole writer projector.forge.review.thread.reopened.history@1.0.0
  and operating consumer consumer.forge.review.thread.reopened.history@1.0.0 serve Source Control review-thread
  reopening reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized.
  Store only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.review.thread.reopened; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1225 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.review.thread.reopened count-equality oracle uses a completely covered prefix with one exact
  matching retained event followed by one unrelated event in the same source. Successful inclusive resume
  revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_review_thread_reopened_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one
  current plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.review.thread.reopened: correct ID recipes, actual seed-issuance
  provenance, unique node membership by generation_id, and selected-current existence/cardinality are
  independent predicates. Inside this exact root the domain, storage instance, scope, event type, consumer
  and version are fixed; the seed is the only varying preimage component. Reusing a seed with a correct
  recipe necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node
  seeds. Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement
  of the ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1225
unblocks: []
acceptance_criteria:
- forge.review.thread.reopened is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_thread_reopened.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_thread_reopened_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_review_thread_reopened.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-004
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.thread.reopened
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1226 - forge.review.thread.replied prepared contract

```yaml
plan_unit_id: SP-1226
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.review.thread.replied@1.0.0, prepared without event admission.
  Adopt FGI-1226/CV-1226, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_review_thread_replied_source uses key forge_review_thread_replied_source.v1:{actual
  storage_instance_id}:{actual scope_partition}:{hex_fact_identity}, table forge_review_thread_replied_source. Schema
  is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_thread_replied_source, schema_id=pm.storage_value.forge_review_thread_replied_source.v1,
  version 1.0.0. hex_fact_identity is CV-1226 H. Original Forge owner capture performs uniqueness-CAS for this exact
  F while committing the actual immutable source observation/result; it verifies the FGI-1226 predicate and all
  provider/subject/native-operation/revision/source joins. It stores refs and the producer commitment only, not
  a payload or source-content copy. A record or matching hash alone cannot create native acceptance.


  Writer ForgeReviewThreadLifecycle.commit_reply@1.0.0 commits source_committed before forge.review.thread.replied.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_review_thread_replied_source: exact Case L-3 source-lineage/receipt identity class
  RP-AUTHORITY-INDEFINITE@1.0.0, no age/count eviction; storage pressure fails closed. This NEW technical class
  binding holds only non-content identity/commitment and original receipt refs and does not assign the separate
  event history or retain referenced bodies. Source records/bodies keep their owner policy and are required while
  pending or actually referenced through the existing live-reference machinery; settlement releases only the actual
  pending dependency, never other holds. Mandatory coherent backup includes the source identity row, actual needed
  owner records, original issued custody, dedupe and seglog/payload-pack cut; loss fences the writer and requires
  mandatory-backup recovery with disclosure. Never recover canonical source from a checkpoint or extend event history
  by retaining a hidden payload copy.


  Derived checkpoint forge_review_thread_replied_checkpoint uses table checkpoints, exact key forge_review_thread_replied_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_thread_replied_checkpoint
  (pm.storage_value.forge_review_thread_replied_checkpoint.v1@1.0.0). Sole writer projector.forge.review.thread.replied.history@1.0.0
  and operating consumer consumer.forge.review.thread.replied.history@1.0.0 serve Source Control review-thread reply-history
  reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store
  only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.review.thread.replied; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1226 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.review.thread.replied count-equality oracle uses a completely covered prefix with one exact
  matching retained event followed by one unrelated event in the same source. Successful inclusive resume
  revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_review_thread_replied_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one
  current plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.review.thread.replied: correct ID recipes, actual seed-issuance
  provenance, unique node membership by generation_id, and selected-current existence/cardinality are
  independent predicates. Inside this exact root the domain, storage instance, scope, event type, consumer
  and version are fixed; the seed is the only varying preimage component. Reusing a seed with a correct
  recipe necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node
  seeds. Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement
  of the ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1226
unblocks: []
acceptance_criteria:
- forge.review.thread.replied is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_thread_replied.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_thread_replied_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_review_thread_replied.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-004
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.thread.replied
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1227 - forge.review.thread.resolved prepared contract

```yaml
plan_unit_id: SP-1227
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.review.thread.resolved@1.0.0, prepared without event admission.
  Adopt FGI-1227/CV-1227, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_review_thread_resolved_source uses key forge_review_thread_resolved_source.v1:{actual
  storage_instance_id}:{actual scope_partition}:{hex_fact_identity}, table forge_review_thread_resolved_source.
  Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_thread_resolved_source, schema_id=pm.storage_value.forge_review_thread_resolved_source.v1,
  version 1.0.0. hex_fact_identity is CV-1227 H. Original Forge owner capture performs uniqueness-CAS for this exact
  F while committing the actual immutable source observation/result; it verifies the FGI-1227 predicate and all
  provider/subject/native-operation/revision/source joins. It stores refs and the producer commitment only, not
  a payload or source-content copy. A record or matching hash alone cannot create native acceptance.


  Writer ForgeReviewThreadLifecycle.commit_resolved@1.0.0 commits source_committed before forge.review.thread.resolved.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_review_thread_resolved_source: exact Case L-3 source-lineage/receipt identity class
  RP-AUTHORITY-INDEFINITE@1.0.0, no age/count eviction; storage pressure fails closed. This NEW technical class
  binding holds only non-content identity/commitment and original receipt refs and does not assign the separate
  event history or retain referenced bodies. Source records/bodies keep their owner policy and are required while
  pending or actually referenced through the existing live-reference machinery; settlement releases only the actual
  pending dependency, never other holds. Mandatory coherent backup includes the source identity row, actual needed
  owner records, original issued custody, dedupe and seglog/payload-pack cut; loss fences the writer and requires
  mandatory-backup recovery with disclosure. Never recover canonical source from a checkpoint or extend event history
  by retaining a hidden payload copy.


  Derived checkpoint forge_review_thread_resolved_checkpoint uses table checkpoints, exact key forge_review_thread_resolved_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_thread_resolved_checkpoint
  (pm.storage_value.forge_review_thread_resolved_checkpoint.v1@1.0.0). Sole writer projector.forge.review.thread.resolved.history@1.0.0
  and operating consumer consumer.forge.review.thread.resolved.history@1.0.0 serve Source Control review-thread
  resolution reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized.
  Store only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.review.thread.resolved; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1227 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.review.thread.resolved count-equality oracle uses a completely covered prefix with one exact
  matching retained event followed by one unrelated event in the same source. Successful inclusive resume
  revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_review_thread_resolved_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one
  current plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.review.thread.resolved: correct ID recipes, actual seed-issuance
  provenance, unique node membership by generation_id, and selected-current existence/cardinality are
  independent predicates. Inside this exact root the domain, storage instance, scope, event type, consumer
  and version are fixed; the seed is the only varying preimage component. Reusing a seed with a correct
  recipe necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node
  seeds. Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement
  of the ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1227
unblocks: []
acceptance_criteria:
- forge.review.thread.resolved is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_thread_resolved.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_thread_resolved_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_review_thread_resolved.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-004
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.thread.resolved
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1228 - forge.review.updated prepared contract

```yaml
plan_unit_id: SP-1228
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.review.updated@1.0.0, prepared without event admission.
  Adopt FGI-1228/CV-1228, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_review_updated_source uses key forge_review_updated_source.v1:{actual storage_instance_id}:{actual
  scope_partition}:{hex_fact_identity}, table forge_review_updated_source. Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_updated_source,
  schema_id=pm.storage_value.forge_review_updated_source.v1, version 1.0.0. hex_fact_identity is CV-1228 H. Original
  Forge owner capture performs uniqueness-CAS for this exact F while committing the actual immutable source observation/result;
  it verifies the FGI-1228 predicate and all provider/subject/native-operation/revision/source joins. It stores
  refs and the producer commitment only, not a payload or source-content copy. A record or matching hash alone cannot
  create native acceptance.


  Writer ForgeReviewLifecycle.commit_updated@1.0.0 commits source_committed before forge.review.updated.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_review_updated_source: exact Case L-3 source-lineage/receipt identity class RP-AUTHORITY-INDEFINITE@1.0.0,
  no age/count eviction; storage pressure fails closed. This NEW technical class binding holds only non-content
  identity/commitment and original receipt refs and does not assign the separate event history or retain referenced
  bodies. Source records/bodies keep their owner policy and are required while pending or actually referenced through
  the existing live-reference machinery; settlement releases only the actual pending dependency, never other holds.
  Mandatory coherent backup includes the source identity row, actual needed owner records, original issued custody,
  dedupe and seglog/payload-pack cut; loss fences the writer and requires mandatory-backup recovery with disclosure.
  Never recover canonical source from a checkpoint or extend event history by retaining a hidden payload copy.


  Derived checkpoint forge_review_updated_checkpoint uses table checkpoints, exact key forge_review_updated_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_updated_checkpoint
  (pm.storage_value.forge_review_updated_checkpoint.v1@1.0.0). Sole writer projector.forge.review.updated.history@1.0.0
  and operating consumer consumer.forge.review.updated.history@1.0.0 serve Source Control review edit-history reader.
  The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store only
  the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery forms
  the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus that live
  transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.review.updated; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1228 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.review.updated count-equality oracle uses a completely covered prefix with one exact matching
  retained event followed by one unrelated event in the same source. Successful inclusive resume revalidates
  the already-counted matching cursor, skips it, examines the unrelated final event and publishes
  matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2 with the
  same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS; repair
  candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_review_updated_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one current
  plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.review.updated: correct ID recipes, actual seed-issuance provenance,
  unique node membership by generation_id, and selected-current existence/cardinality are independent
  predicates. Inside this exact root the domain, storage instance, scope, event type, consumer and version
  are fixed; the seed is the only varying preimage component. Reusing a seed with a correct recipe
  necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node seeds.
  Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement of the
  ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1228
unblocks: []
acceptance_criteria:
- forge.review.updated is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_updated.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_updated_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_review_updated.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-022
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.updated
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1229 - forge.review.version_created prepared contract

```yaml
plan_unit_id: SP-1229
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.review.version_created@1.0.0, prepared without event admission.
  Adopt FGI-1229/CV-1229, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_review_version_created_source uses key forge_review_version_created_source.v1:{actual
  storage_instance_id}:{actual scope_partition}:{hex_fact_identity}, table forge_review_version_created_source.
  Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_version_created_source, schema_id=pm.storage_value.forge_review_version_created_source.v1,
  version 1.0.0. hex_fact_identity is CV-1229 H. Original Forge owner capture performs uniqueness-CAS for this exact
  F while committing the actual immutable source observation/result; it verifies the FGI-1229 predicate and all
  provider/subject/native-operation/revision/source joins. It stores refs and the producer commitment only, not
  a payload or source-content copy. A record or matching hash alone cannot create native acceptance.


  Writer ForgeReviewRevisionStore.commit_new_version@1.0.0 commits source_committed before forge.review.version_created.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_review_version_created_source: exact Case L-3 source-lineage/receipt identity class
  RP-AUTHORITY-INDEFINITE@1.0.0, no age/count eviction; storage pressure fails closed. This NEW technical class
  binding holds only non-content identity/commitment and original receipt refs and does not assign the separate
  event history or retain referenced bodies. Source records/bodies keep their owner policy and are required while
  pending or actually referenced through the existing live-reference machinery; settlement releases only the actual
  pending dependency, never other holds. Mandatory coherent backup includes the source identity row, actual needed
  owner records, original issued custody, dedupe and seglog/payload-pack cut; loss fences the writer and requires
  mandatory-backup recovery with disclosure. Never recover canonical source from a checkpoint or extend event history
  by retaining a hidden payload copy.


  Derived checkpoint forge_review_version_created_checkpoint uses table checkpoints, exact key forge_review_version_created_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_review_version_created_checkpoint
  (pm.storage_value.forge_review_version_created_checkpoint.v1@1.0.0). Sole writer projector.forge.review.version_created.history@1.0.0
  and operating consumer consumer.forge.review.version_created.history@1.0.0 serve Source Control immutable review-version
  history reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized.
  Store only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.review.version_created; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1229 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.review.version_created count-equality oracle uses a completely covered prefix with one exact
  matching retained event followed by one unrelated event in the same source. Successful inclusive resume
  revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_review_version_created_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one
  current plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.review.version_created: correct ID recipes, actual seed-issuance
  provenance, unique node membership by generation_id, and selected-current existence/cardinality are
  independent predicates. Inside this exact root the domain, storage instance, scope, event type, consumer
  and version are fixed; the seed is the only varying preimage component. Reusing a seed with a correct
  recipe necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node
  seeds. Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement
  of the ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1229
unblocks: []
acceptance_criteria:
- forge.review.version_created is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_version_created.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_version_created_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_review_version_created.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-004
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.version_created
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1230 - forge.webhook.delivery_failed prepared contract

```yaml
plan_unit_id: SP-1230
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.webhook.delivery_failed@1.0.0, prepared without event
  admission. Adopt FGI-1230/CV-1230, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload
  packs, SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_webhook_delivery_failed_source uses key forge_webhook_delivery_failed_source.v1:{actual
  storage_instance_id}:{actual scope_partition}:{hex_fact_identity}, table forge_webhook_delivery_failed_source.
  Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_webhook_delivery_failed_source, schema_id=pm.storage_value.forge_webhook_delivery_failed_source.v1,
  version 1.0.0. hex_fact_identity is CV-1230 H. Original Forge owner capture performs uniqueness-CAS for this exact
  F while committing the actual immutable source observation/result; it verifies the FGI-1230 predicate and all
  provider/subject/native-operation/revision/source joins. It stores refs and the producer commitment only, not
  a payload or source-content copy. A record or matching hash alone cannot create native acceptance.


  Writer ForgeWebhookProcessor.commit_failed@1.0.0 commits source_committed before forge.webhook.delivery_failed.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_webhook_delivery_failed_source: exact Case L-3 source-lineage/receipt identity class
  RP-AUTHORITY-INDEFINITE@1.0.0, no age/count eviction; storage pressure fails closed. This NEW technical class
  binding holds only non-content identity/commitment and original receipt refs and does not assign the separate
  event history or retain referenced bodies. Source records/bodies keep their owner policy and are required while
  pending or actually referenced through the existing live-reference machinery; settlement releases only the actual
  pending dependency, never other holds. Mandatory coherent backup includes the source identity row, actual needed
  owner records, original issued custody, dedupe and seglog/payload-pack cut; loss fences the writer and requires
  mandatory-backup recovery with disclosure. Never recover canonical source from a checkpoint or extend event history
  by retaining a hidden payload copy.


  Derived checkpoint forge_webhook_delivery_failed_checkpoint uses table checkpoints, exact key forge_webhook_delivery_failed_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_webhook_delivery_failed_checkpoint
  (pm.storage_value.forge_webhook_delivery_failed_checkpoint.v1@1.0.0). Sole writer projector.forge.webhook.delivery_failed.history@1.0.0
  and operating consumer consumer.forge.webhook.delivery_failed.history@1.0.0 serve Hosting Services webhook failure-history
  reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store
  only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.webhook.delivery_failed; filter only exact
  family/version and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage.
  Verified empty source permits null cursor/count zero only with actual inventory proof. Every delivered matching
  record verifies actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and
  all FGI-1230 fact joins under its original edition. Missing optional linked content returns unavailable without
  inventing it; missing canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes
  the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.webhook.delivery_failed count-equality oracle uses a completely covered prefix with one exact
  matching retained event followed by one unrelated event in the same source. Successful inclusive resume
  revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_webhook_delivery_failed_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one
  current plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.webhook.delivery_failed: correct ID recipes, actual seed-issuance
  provenance, unique node membership by generation_id, and selected-current existence/cardinality are
  independent predicates. Inside this exact root the domain, storage instance, scope, event type, consumer
  and version are fixed; the seed is the only varying preimage component. Reusing a seed with a correct
  recipe necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node
  seeds. Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement
  of the ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1230
unblocks: []
acceptance_criteria:
- forge.webhook.delivery_failed is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_webhook_delivery_failed.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_webhook_delivery_failed_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_webhook_delivery_failed.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-006
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.webhook.delivery_failed
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1231 - forge.webhook.delivery_recovered prepared contract

```yaml
plan_unit_id: SP-1231
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.webhook.delivery_recovered@1.0.0, prepared without event
  admission. Adopt FGI-1231/CV-1231, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload
  packs, SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_webhook_delivery_recovered_source uses key forge_webhook_delivery_recovered_source.v1:{actual
  storage_instance_id}:{actual scope_partition}:{hex_fact_identity}, table forge_webhook_delivery_recovered_source.
  Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_webhook_delivery_recovered_source, schema_id=pm.storage_value.forge_webhook_delivery_recovered_source.v1,
  version 1.0.0. hex_fact_identity is CV-1231 H. Original Forge owner capture performs uniqueness-CAS for this exact
  F while committing the actual immutable source observation/result; it verifies the FGI-1231 predicate and all
  provider/subject/native-operation/revision/source joins. It stores refs and the producer commitment only, not
  a payload or source-content copy. A record or matching hash alone cannot create native acceptance.


  Writer ForgeWebhookProcessor.commit_recovered@1.0.0 commits source_committed before forge.webhook.delivery_recovered.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_webhook_delivery_recovered_source: exact Case L-3 source-lineage/receipt identity class
  RP-AUTHORITY-INDEFINITE@1.0.0, no age/count eviction; storage pressure fails closed. This NEW technical class
  binding holds only non-content identity/commitment and original receipt refs and does not assign the separate
  event history or retain referenced bodies. Source records/bodies keep their owner policy and are required while
  pending or actually referenced through the existing live-reference machinery; settlement releases only the actual
  pending dependency, never other holds. Mandatory coherent backup includes the source identity row, actual needed
  owner records, original issued custody, dedupe and seglog/payload-pack cut; loss fences the writer and requires
  mandatory-backup recovery with disclosure. Never recover canonical source from a checkpoint or extend event history
  by retaining a hidden payload copy.


  Derived checkpoint forge_webhook_delivery_recovered_checkpoint uses table checkpoints, exact key forge_webhook_delivery_recovered_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_webhook_delivery_recovered_checkpoint
  (pm.storage_value.forge_webhook_delivery_recovered_checkpoint.v1@1.0.0). Sole writer projector.forge.webhook.delivery_recovered.history@1.0.0
  and operating consumer consumer.forge.webhook.delivery_recovered.history@1.0.0 serve Hosting Services webhook
  recovery-history reader. The SP-278 generic index stays the projection; no second authoritative domain state is
  materialized. Store only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current
  advance/read/recovery forms the actual live ten-field token from its own read snapshot and revalidates all nine
  durable fields plus that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected
  source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.webhook.delivery_recovered; filter only exact
  family/version and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage.
  Verified empty source permits null cursor/count zero only with actual inventory proof. Every delivered matching
  record verifies actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and
  all FGI-1231 fact joins under its original edition. Missing optional linked content returns unavailable without
  inventing it; missing canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes
  the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.webhook.delivery_recovered count-equality oracle uses a completely covered prefix with one exact
  matching retained event followed by one unrelated event in the same source. Successful inclusive resume
  revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_webhook_delivery_recovered_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278:
  one current plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.webhook.delivery_recovered: correct ID recipes, actual seed-issuance
  provenance, unique node membership by generation_id, and selected-current existence/cardinality are
  independent predicates. Inside this exact root the domain, storage instance, scope, event type, consumer
  and version are fixed; the seed is the only varying preimage component. Reusing a seed with a correct
  recipe necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node
  seeds. Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement
  of the ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1231
unblocks: []
acceptance_criteria:
- forge.webhook.delivery_recovered is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_webhook_delivery_recovered.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_webhook_delivery_recovered_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_webhook_delivery_recovered.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-006
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.webhook.delivery_recovered
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1232 - forge.webhook.received prepared contract

```yaml
plan_unit_id: SP-1232
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.webhook.received@1.0.0, prepared without event admission.
  Adopt FGI-1232/CV-1232, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_webhook_received_source uses key forge_webhook_received_source.v1:{actual storage_instance_id}:{actual
  scope_partition}:{hex_fact_identity}, table forge_webhook_received_source. Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_webhook_received_source,
  schema_id=pm.storage_value.forge_webhook_received_source.v1, version 1.0.0. hex_fact_identity is CV-1232 H. Original
  Forge owner capture performs uniqueness-CAS for this exact F while committing the actual immutable source observation/result;
  it verifies the FGI-1232 predicate and all provider/subject/native-operation/revision/source joins. It stores
  refs and the producer commitment only, not a payload or source-content copy. A record or matching hash alone cannot
  create native acceptance.


  Writer ForgeWebhookIngress.commit_verified_received@1.0.0 commits source_committed before forge.webhook.received.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_webhook_received_source: exact Case L-3 source-lineage/receipt identity class RP-AUTHORITY-INDEFINITE@1.0.0,
  no age/count eviction; storage pressure fails closed. This NEW technical class binding holds only non-content
  identity/commitment and original receipt refs and does not assign the separate event history or retain referenced
  bodies. Source records/bodies keep their owner policy and are required while pending or actually referenced through
  the existing live-reference machinery; settlement releases only the actual pending dependency, never other holds.
  Mandatory coherent backup includes the source identity row, actual needed owner records, original issued custody,
  dedupe and seglog/payload-pack cut; loss fences the writer and requires mandatory-backup recovery with disclosure.
  Never recover canonical source from a checkpoint or extend event history by retaining a hidden payload copy.


  Derived checkpoint forge_webhook_received_checkpoint uses table checkpoints, exact key forge_webhook_received_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_webhook_received_checkpoint
  (pm.storage_value.forge_webhook_received_checkpoint.v1@1.0.0). Sole writer projector.forge.webhook.received.history@1.0.0
  and operating consumer consumer.forge.webhook.received.history@1.0.0 serve Hosting Services webhook receipt-history
  reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store
  only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.webhook.received; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1232 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.webhook.received count-equality oracle uses a completely covered prefix with one exact matching
  retained event followed by one unrelated event in the same source. Successful inclusive resume revalidates
  the already-counted matching cursor, skips it, examines the unrelated final event and publishes
  matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2 with the
  same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS; repair
  candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_webhook_received_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one current
  plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.webhook.received: correct ID recipes, actual seed-issuance provenance,
  unique node membership by generation_id, and selected-current existence/cardinality are independent
  predicates. Inside this exact root the domain, storage instance, scope, event type, consumer and version
  are fixed; the seed is the only varying preimage component. Reusing a seed with a correct recipe
  necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node seeds.
  Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement of the
  ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1232
unblocks: []
acceptance_criteria:
- forge.webhook.received is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_webhook_received.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_webhook_received_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_webhook_received.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-006
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.webhook.received
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1233 - forge.webhook.redelivery_queued prepared contract

```yaml
plan_unit_id: SP-1233
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.webhook.redelivery_queued@1.0.0, prepared without event
  admission. Adopt FGI-1233/CV-1233, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload
  packs, SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_webhook_redelivery_queued_source uses key forge_webhook_redelivery_queued_source.v1:{actual
  storage_instance_id}:{actual scope_partition}:{hex_fact_identity}, table forge_webhook_redelivery_queued_source.
  Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_webhook_redelivery_queued_source, schema_id=pm.storage_value.forge_webhook_redelivery_queued_source.v1,
  version 1.0.0. hex_fact_identity is CV-1233 H. Original Forge owner capture performs uniqueness-CAS for this exact
  F while committing the actual immutable source observation/result; it verifies the FGI-1233 predicate and all
  provider/subject/native-operation/revision/source joins. It stores refs and the producer commitment only, not
  a payload or source-content copy. A record or matching hash alone cannot create native acceptance.


  Writer ForgeWebhookRecovery.commit_redelivery_queued@1.0.0 commits source_committed before forge.webhook.redelivery_queued.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_webhook_redelivery_queued_source: exact Case L-3 source-lineage/receipt identity class
  RP-AUTHORITY-INDEFINITE@1.0.0, no age/count eviction; storage pressure fails closed. This NEW technical class
  binding holds only non-content identity/commitment and original receipt refs and does not assign the separate
  event history or retain referenced bodies. Source records/bodies keep their owner policy and are required while
  pending or actually referenced through the existing live-reference machinery; settlement releases only the actual
  pending dependency, never other holds. Mandatory coherent backup includes the source identity row, actual needed
  owner records, original issued custody, dedupe and seglog/payload-pack cut; loss fences the writer and requires
  mandatory-backup recovery with disclosure. Never recover canonical source from a checkpoint or extend event history
  by retaining a hidden payload copy.


  Derived checkpoint forge_webhook_redelivery_queued_checkpoint uses table checkpoints, exact key forge_webhook_redelivery_queued_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_webhook_redelivery_queued_checkpoint
  (pm.storage_value.forge_webhook_redelivery_queued_checkpoint.v1@1.0.0). Sole writer projector.forge.webhook.redelivery_queued.history@1.0.0
  and operating consumer consumer.forge.webhook.redelivery_queued.history@1.0.0 serve Hosting Services webhook redelivery-history
  reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store
  only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.webhook.redelivery_queued; filter only exact
  family/version and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage.
  Verified empty source permits null cursor/count zero only with actual inventory proof. Every delivered matching
  record verifies actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and
  all FGI-1233 fact joins under its original edition. Missing optional linked content returns unavailable without
  inventing it; missing canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes
  the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.webhook.redelivery_queued count-equality oracle uses a completely covered prefix with one exact
  matching retained event followed by one unrelated event in the same source. Successful inclusive resume
  revalidates the already-counted matching cursor, skips it, examines the unrelated final event and
  publishes matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2
  with the same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS;
  repair candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_webhook_redelivery_queued_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278:
  one current plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.webhook.redelivery_queued: correct ID recipes, actual seed-issuance
  provenance, unique node membership by generation_id, and selected-current existence/cardinality are
  independent predicates. Inside this exact root the domain, storage instance, scope, event type, consumer
  and version are fixed; the seed is the only varying preimage component. Reusing a seed with a correct
  recipe necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node
  seeds. Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement
  of the ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1233
unblocks: []
acceptance_criteria:
- forge.webhook.redelivery_queued is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_webhook_redelivery_queued.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_webhook_redelivery_queued_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_webhook_redelivery_queued.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-006
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.webhook.redelivery_queued
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### SP-1234 - forge.webhook.rejected prepared contract

```yaml
plan_unit_id: SP-1234
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage binding for forge.webhook.rejected@1.0.0, prepared without event admission.
  Adopt FGI-1234/CV-1234, SP-286/CV-339 full-value v2 first receipt, SP-236 physical bytes, SP-337 payload packs,
  SP-278 and DL-076 by name. The existing event_record_index, global/scoped dedupe and event_append_receipt_custody
  keep their original owners. No event registry, critical or MVP array is extended.


  Canonical identity row forge_webhook_rejected_source uses key forge_webhook_rejected_source.v1:{actual storage_instance_id}:{actual
  scope_partition}:{hex_fact_identity}, table forge_webhook_rejected_source. Schema is Plans/forge_event_storage_contracts.schema.json#/$defs/forge_webhook_rejected_source,
  schema_id=pm.storage_value.forge_webhook_rejected_source.v1, version 1.0.0. hex_fact_identity is CV-1234 H. Original
  Forge owner capture performs uniqueness-CAS for this exact F while committing the actual immutable source observation/result;
  it verifies the FGI-1234 predicate and all provider/subject/native-operation/revision/source joins. It stores
  refs and the producer commitment only, not a payload or source-content copy. A record or matching hash alone cannot
  create native acceptance.


  Writer ForgeWebhookIngress.commit_rejection@1.0.0 commits source_committed before forge.webhook.rejected.publish@1.0.0
  asks Storage for qualified fresh append. The source row pins immutable fact, source refs, envelope identity and
  semantic digest. SP-286 group commit, first receipt and full-value resolver settle history_committed by same-key
  compare-and-swap only after exact actual receipt verification. Replay accepts only the same original tuple/digest
  and result. A crash between receipt issuance and row settlement resolves actual issued custody before CAS; it
  never mints a new receipt, repeats native work, changes original times or authorizes a second append. A genuinely
  never-issued group and a completed restore use the owning SP-286 native fresh-operation handoff, never guessed
  absence or a new operation ID for old work.


  Backup/retention for forge_webhook_rejected_source: exact Case L-3 source-lineage/receipt identity class RP-AUTHORITY-INDEFINITE@1.0.0,
  no age/count eviction; storage pressure fails closed. This NEW technical class binding holds only non-content
  identity/commitment and original receipt refs and does not assign the separate event history or retain referenced
  bodies. Source records/bodies keep their owner policy and are required while pending or actually referenced through
  the existing live-reference machinery; settlement releases only the actual pending dependency, never other holds.
  Mandatory coherent backup includes the source identity row, actual needed owner records, original issued custody,
  dedupe and seglog/payload-pack cut; loss fences the writer and requires mandatory-backup recovery with disclosure.
  Never recover canonical source from a checkpoint or extend event history by retaining a hidden payload copy.


  Derived checkpoint forge_webhook_rejected_checkpoint uses table checkpoints, exact key forge_webhook_rejected_checkpoint.v1:{actual
  storage_instance_id}:{actual scope_partition}:consumer.1 and schema Plans/forge_event_storage_contracts.schema.json#/$defs/forge_webhook_rejected_checkpoint
  (pm.storage_value.forge_webhook_rejected_checkpoint.v1@1.0.0). Sole writer projector.forge.webhook.rejected.history@1.0.0
  and operating consumer consumer.forge.webhook.rejected.history@1.0.0 serve Hosting Services webhook rejection-history
  reader. The SP-278 generic index stays the projection; no second authoritative domain state is materialized. Store
  only the schema''s nine-field DurableGenericToken and never redb_snapshot_id. Every current advance/read/recovery
  forms the actual live ten-field token from its own read snapshot and revalidates all nine durable fields plus
  that live transaction fence against the current root, generation, anchor, frontier and CURRENT-selected source.


  Scan the COMPLETE selected canonical source in sequence order across all families/scopes, retaining a last_scanned
  cursor on the final examined source record even if it is not forge.webhook.rejected; filter only exact family/version
  and actual scope after coverage is proven. Do not turn a filtered maximum into complete coverage. Verified empty
  source permits null cursor/count zero only with actual inventory proof. Every delivered matching record verifies
  actual source bytes/codec/schema, index identity/digest/locator, full-value first receipt and all FGI-1234 fact
  joins under its original edition. Missing optional linked content returns unavailable without inventing it; missing
  canonical event/receipt proof fences disclosure. Consumer is read-only and never reexecutes the original operation.


  Advance publication_revision, previous_checkpoint_sha256, matched_count and last_scanned atomically by predecessor-revision
  AND predecessor-value-hash CAS under the same source and maintenance fence; hashes use SP-278 binding codec, not
  a lane recipe. Count is the number of exact matching retained events in the verified scanned prefix. Inclusive
  restart first revalidates the cursor event/value hash, then continues strictly after it without a second disclosure/effect.
  The cursor''s actual sequence/event/value hash must join Storage, including when the last record belongs to another
  family. A stale token/CAS/source change refuses and retries from a new coherent snapshot, without combining generations.
  The forge.webhook.rejected count-equality oracle uses a completely covered prefix with one exact matching
  retained event followed by one unrelated event in the same source. Successful inclusive resume revalidates
  the already-counted matching cursor, skips it, examines the unrelated final event and publishes
  matched_count=1 with that final genuine cursor. Its count-only negative proposes matched_count=2 with the
  same source, coverage, cursor, durable/live token and actual predecessor revision/hash CAS; repair
  candidate-dependent commitments without changing source or predecessor authority. Count equality is
  separate from coverage, cursor correctness and generation-node cardinality.


  Checkpoint forge_webhook_rejected_checkpoint explicitly uses RP-PROJECTION-3GEN@1.0.0 through SP-278: one current
  plus at most two staged/retired generations; reserve a lawful slot before staging; first real current-to-retired
  transition anchors 604800 seconds, retries do not reset it, holds/references win, and three protected slots block
  replacement. Generations use the existing Storage migration/root selection machinery, not a secret fourth checkpoint
  key. Canonical bytes never come from this disposable state. Malformed derived values enter Q-DERIVED then rebuild;
  canonical-source loss uses canonical recovery. Compaction/recovery invalidates old tokens, activates only a fully
  verified retained-source rebuild and never synthesizes expired events.


  Compatibility/withdrawal: exact original event and receipt schema/recipe readers remain selectable only by authenticated
  issuance provenance. No older Forge payload edition is inferred from a similar shape. Unknown future editions
  stop complete publication before that record. A reviewed writer cutoff is checked before dedupe; consumer withdrawal
  commits state=withdrawn with the actual withdrawal_receipt_ref, invalidates disclosure tokens and all pending
  publication, and creates no event. A later separately admitted successor rebuilds derived state under a new exact
  consumer version/root adoption, leaving retained originals unchanged. Native StorageMigrationCoordinator must
  install exact reader/writer/CAS/backup/restore and permission routes before activation; prepared schema rows prove
  no execution. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture. Exact checkpoint
  root/generation storage: the declared single checkpoints-table key stores a closed root with current_generation_id
  and a generations array of one to three complete nodes, not one current value plus invisible history keys. Each
  node contains generation_id, durably allocated generation_seed_sha256, lifecycle staged/current/retired, actual
  activated_at_utc and first retired_at_utc, and its complete closed generation_core (including the nine-field token,
  cursor, count, publication revision and predecessor hash). A selected generation ID is unique and equals exactly
  one current node; a root with no current generation has current_generation_id=null and discloses nothing. Staged
  has both times null; current has actual activation time and null retirement; retired has original activation if
  ever activated and actual first retirement. Abandoned never-activated staging uses only SP-278 intent cleanup,
  never a fabricated retirement time. New generation_id is the lowercase SHA-256 from the existing SP-278 binding
  MessagePack codec over the closed object {domain: pm.forge.history_checkpoint_generation.v1, storage_instance_id,
  scope, event_type, consumer_id, consumer_version, generation_seed_sha256}; all identity fields come from this
  exact root and the seed is actual once-persisted 256-bit entropy. This is a newly authored identity preimage using
  the existing codec, with no numeric or timestamp algorithm.
  Generation invariants for forge.webhook.rejected: correct ID recipes, actual seed-issuance provenance,
  unique node membership by generation_id, and selected-current existence/cardinality are independent
  predicates. Inside this exact root the domain, storage instance, scope, event type, consumer and version
  are fixed; the seed is the only varying preimage component. Reusing a seed with a correct recipe
  necessarily reuses the ID. Correct recipes plus unique ID membership therefore entail distinct node seeds.
  Seed uniqueness is a derived fact, not a separately weakened refusal and not duplicate enforcement of the
  ID predicate. Different seeds alone do not prove distinct IDs; repeated IDs are refused even when
  individual recipes are correct. Seed issuance separately verifies the seed was once durably allocated by
  the actual Storage generation allocator for this root and logical generation, before its membership was
  accepted; original issuance remains verifiable on retry and retained-generation reads. A unique seed and
  correctly recomputed ID do not prove that issuance. Repeated array occurrences of the same authentic node
  share its one genuine issuance fact and fail only unique node membership, not issuance. Check membership
  by generation_id over every node, selected or unselected; do not recast repeated membership as a second
  seed allocation. Issuance provenance uses the original durable Storage SP-278 preparation/anchor bound by
  original seed and exact root identity; comparison of the claimed generation_id to the computed ID belongs
  only to the recipe predicate. Exact root/core identity equality, lifecycle/time consistency and actual
  source/receipt/token checks are mandatory. The whole root plus all nodes
  obeys the physical size ceiling. Same-generation advances CAS the entire old root value hash and the selected
  core publication revision, preserving every sibling byte; staging and activation also CAS the whole root. Atomic
  activation swaps the selector, makes only the verified target current and freezes the previous current node first
  retirement timestamp. Standalone withdrawal marks the core withdrawn, retires its selected node, clears current_generation_id
  and invalidates disclosure in one CAS. Never refresh old retirement on retry. Cleanup verifies nonselection, actual
  holds and original 604800-second retirement window before removing a node; reserve a free lawful slot before adding
  one. No fourth key, lazy hidden history or root-less current value exists.'
gui_related: false
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-1234
unblocks: []
acceptance_criteria:
- forge.webhook.rejected is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_webhook_rejected.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_webhook_rejected_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_payloads/forge/forge_webhook_rejected.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-006
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.webhook.rejected
- SP-286
- CV-339
- SP-278
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```
